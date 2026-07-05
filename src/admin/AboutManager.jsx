import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  FaSave, FaCloudUploadAlt, FaTrash, FaPlus, FaTimes, FaUndo,
  FaUser, FaCheckCircle, FaLanguage, FaGripVertical, FaBan, FaInfoCircle, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaLink, FaImage
} from 'react-icons/fa';

const AboutManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Backup state for reset
  const [originalData, setOriginalData] = useState(null);

  // Image upload states
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [profilePicProgress, setProfilePicProgress] = useState(0);
  const [dragOverProfilePic, setDragOverProfilePic] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    aboutTitle: 'About Me',
    aboutContent: '',
    aboutSkillsSummary: '',
    resumeUrl: '',
    
    // Image
    profilePictureUrl: '',
    profilePicturePublicId: '',

    // Stats
    statsYearsExp: '2-3',
    statsProjects: '50+',
    statsClients: '30+',

    // Core Strengths
    coreStrengths: [],

    // Languages
    languages: [],

    // Dynamic Personal Information Blocks
    aboutPersonalInfo: [],

    // Contact Information
    contactEmail: '',
    contactPhone: '',
    contactAddress: '',

    // Add inputs
    newStrengthTitle: '',
    newStrengthDesc: '',
    newLanguageName: '',
    newLanguageLevel: '',
    newInfoLabel: '',
    newInfoValue: ''
  });

  // Load settings
  const fetchSettings = async () => {
    try {
      const res = await api.getAbout();
      if (res.success && res.data) {
        const d = res.data;
        const initialForm = {
          aboutTitle: d.aboutTitle || 'About Me',
          aboutContent: d.aboutContent || '',
          aboutSkillsSummary: d.aboutSkillsSummary || '',
          resumeUrl: d.resumeUrl || '',
          
          profilePictureUrl: d.profilePicture?.url || '',
          profilePicturePublicId: d.profilePicture?.publicId || '',

          statsYearsExp: d.aboutStats?.yearsExp || '2-3',
          statsProjects: d.aboutStats?.projects || '50+',
          statsClients: d.aboutStats?.clients || '30+',

          coreStrengths: d.coreStrengths?.length ? d.coreStrengths : [
            { title: 'Problem Solving', desc: 'Analytical approach to complex debugging, scripting, and code structures.' },
            { title: 'Quick Learner', desc: 'Rapid adaptation to emerging web frameworks, packages, and design tools.' },
            { title: 'Team Collaboration', desc: 'Cooperative alignment in workflows, clear peer reviews, and group sprints.' },
            { title: 'Communication', desc: 'Articulate documentation, transparent project updates, and active feedback loops.' },
            { title: 'Adaptability', desc: 'Versatile adjustment to project requirements, shifting technologies, and layout specs.' }
          ],

          languages: d.languages?.length ? d.languages : [
            { name: 'Hindi', level: 'Native' },
            { name: 'English', level: 'Professional Working Proficiency' }
          ],

          aboutPersonalInfo: d.aboutPersonalInfo?.length ? d.aboutPersonalInfo : [
            { label: 'Freelance', value: 'Available' },
            { label: 'Age', value: '21' },
            { label: 'Address', value: 'Patna, Bihar, India' }
          ],

          contactEmail: d.aboutContactInfo?.email || d.email || '',
          contactPhone: d.aboutContactInfo?.phone || d.phone || '',
          contactAddress: d.aboutContactInfo?.address || d.address || '',

          newStrengthTitle: '',
          newStrengthDesc: '',
          newLanguageName: '',
          newLanguageLevel: '',
          newInfoLabel: '',
          newInfoValue: ''
        };
        setFormData(initialForm);
        setOriginalData(JSON.parse(JSON.stringify(initialForm)));
      }
    } catch (err) {
      setErrorMsg('Failed to load settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Image Upload handler
  const handleProfilePicUpload = async (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg('Unsupported format. Supported: JPG, PNG, WEBP, SVG');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Profile photo must be less than 5MB');
      return;
    }

    if (formData.profilePictureUrl && !window.confirm('Are you sure you want to replace the current profile photo?')) {
      return;
    }

    setUploadingProfilePic(true);
    setProfilePicProgress(20);

    try {
      const payload = new FormData();
      payload.append('file', file);
      
      const interval = setInterval(() => {
        setProfilePicProgress(prev => (prev >= 90 ? 90 : prev + 10));
      }, 150);

      const res = await api.uploadMedia(payload);
      clearInterval(interval);
      setProfilePicProgress(100);

      if (res.success && res.data?.fileUrl) {
        setFormData(prev => ({
          ...prev,
          profilePictureUrl: res.data.fileUrl,
          profilePicturePublicId: res.data.publicId || ''
        }));
      }
    } catch (err) {
      setErrorMsg('Upload failed: ' + err.message);
    } finally {
      setTimeout(() => { setUploadingProfilePic(false); setProfilePicProgress(0); }, 300);
    }
  };

  // Delete profile pic with confirmation
  const handleDeleteProfilePic = () => {
    if (window.confirm('Are you sure you want to delete the profile photo?')) {
      setFormData(prev => ({ ...prev, profilePictureUrl: '', profilePicturePublicId: '' }));
    }
  };

  // Strengths CRUD
  const handleAddStrength = () => {
    const title = formData.newStrengthTitle.trim();
    const desc = formData.newStrengthDesc.trim();
    if (!title) return;
    setFormData(prev => ({
      ...prev,
      coreStrengths: [...prev.coreStrengths, { title, desc }],
      newStrengthTitle: '',
      newStrengthDesc: ''
    }));
  };

  const handleRemoveStrength = (idx) => {
    setFormData(prev => ({ ...prev, coreStrengths: prev.coreStrengths.filter((_, i) => i !== idx) }));
  };

  const handleStrengthEdit = (idx, field, value) => {
    setFormData(prev => {
      const updated = [...(prev.coreStrengths || [])];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, coreStrengths: updated };
    });
  };

  // Languages CRUD
  const handleAddLanguage = () => {
    const name = formData.newLanguageName.trim();
    const level = formData.newLanguageLevel.trim();
    if (!name) return;
    setFormData(prev => ({
      ...prev,
      languages: [...prev.languages, { name, level }],
      newLanguageName: '',
      newLanguageLevel: ''
    }));
  };

  const handleRemoveLanguage = (idx) => {
    setFormData(prev => ({ ...prev, languages: prev.languages.filter((_, i) => i !== idx) }));
  };

  // Personal Info Block CRUD
  const handleAddInfoBlock = () => {
    const label = formData.newInfoLabel.trim();
    const value = formData.newInfoValue.trim();
    if (!label || !value) return;
    setFormData(prev => ({
      ...prev,
      aboutPersonalInfo: [...prev.aboutPersonalInfo, { label, value }],
      newInfoLabel: '',
      newInfoValue: ''
    }));
  };

  const handleRemoveInfoBlock = (idx) => {
    setFormData(prev => ({ ...prev, aboutPersonalInfo: prev.aboutPersonalInfo.filter((_, i) => i !== idx) }));
  };

  const handleInfoBlockEdit = (idx, field, val) => {
    setFormData(prev => {
      const updated = [...(prev.aboutPersonalInfo || [])];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, aboutPersonalInfo: updated };
    });
  };

  // Reset form
  const handleReset = () => {
    if (window.confirm('Are you sure you want to discard all unsaved edits?')) {
      setFormData(JSON.parse(JSON.stringify(originalData)));
      setErrorMsg('');
      setSuccessMsg('Form reset to original state.');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  // Save changes
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    const payload = {
      aboutTitle: formData.aboutTitle,
      aboutContent: formData.aboutContent,
      aboutSkillsSummary: formData.aboutSkillsSummary,
      resumeUrl: formData.resumeUrl,
      
      profilePicture: {
        url: formData.profilePictureUrl,
        publicId: formData.profilePicturePublicId
      },
      aboutStats: {
        yearsExp: formData.statsYearsExp,
        projects: formData.statsProjects,
        clients: formData.statsClients
      },
      coreStrengths: formData.coreStrengths,
      languages: formData.languages,
      aboutPersonalInfo: formData.aboutPersonalInfo,
      
      aboutContactInfo: {
        email: formData.contactEmail,
        phone: formData.contactPhone,
        address: formData.contactAddress
      }
    };

    try {
      const res = await api.updateAbout(payload);
      if (res.success) {
        setSuccessMsg('Success! Your changes have been permanently saved to the database and are now live on the website.');
        setOriginalData(JSON.parse(JSON.stringify(formData)));
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-primary-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-left animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-2xl md:text-3xl font-black font-title tracking-tight text-black dark:text-white flex items-center gap-3">
          <FaUser className="text-primary-purple" /> About Section CMS
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your About summary, profile image, custom strength blocks, personal info grids, stats, and languages.
        </p>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="px-5 py-3 bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 rounded-xl text-sm font-bold flex items-center gap-2">
          ✅ {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="px-5 py-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">❌ {errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="cursor-pointer"><FaTimes size={10} /></button>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Profile pic uploader */}
          <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
            <h3 className="text-sm font-bold font-title text-black dark:text-white mb-3 flex items-center gap-2">
              <FaCloudUploadAlt className="text-primary-purple" /> Profile Photo
            </h3>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOverProfilePic(true); }}
              onDragLeave={() => setDragOverProfilePic(false)}
              onDrop={(e) => { e.preventDefault(); setDragOverProfilePic(false); const f = e.dataTransfer.files[0]; if (f) handleProfilePicUpload(f); }}
              className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${
                dragOverProfilePic ? 'border-primary-purple bg-primary-purple/5' : 'border-slate-250 dark:border-white/10 hover:border-primary-purple/60'
              }`}
            >
              {formData.profilePictureUrl ? (
                <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden group max-w-[150px] mx-auto">
                  <img src={formData.profilePictureUrl} alt="About Profile" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <label htmlFor="replace-profile" className="px-2.5 py-1.5 bg-white text-black text-[10px] font-black rounded-lg cursor-pointer hover:bg-slate-100">Replace</label>
                    <button type="button" onClick={handleDeleteProfilePic} className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black rounded-lg cursor-pointer">Delete</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-4">
                  <FaCloudUploadAlt size={26} className="text-slate-400" />
                  <p className="text-[11px] font-bold text-slate-500">Drag & drop profile image</p>
                  <label htmlFor="profile-upload" className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-[10px] font-black rounded-lg cursor-pointer hover:bg-slate-200">Browse Device</label>
                </div>
              )}
              <input type="file" id="profile-upload" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (f) handleProfilePicUpload(f); }} className="hidden" />
              <input type="file" id="replace-profile" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (f) handleProfilePicUpload(f); }} className="hidden" />
            </div>

            {uploadingProfilePic && (
              <div className="w-full bg-slate-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden mt-3">
                <div style={{ width: `${profilePicProgress}%` }} className="bg-primary-purple h-full transition-all duration-350" />
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
            <h3 className="text-sm font-bold font-title text-black dark:text-white mb-3">Section Stats Counter</h3>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Years of Experience</label>
                <input type="text" name="statsYearsExp" value={formData.statsYearsExp} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-purple" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Projects Completed</label>
                <input type="text" name="statsProjects" value={formData.statsProjects} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-purple" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Clients Served</label>
                <input type="text" name="statsClients" value={formData.statsClients} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-purple" />
              </div>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
            <h3 className="text-sm font-bold font-title text-black dark:text-white mb-4">Contact Info Badge</h3>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><FaEnvelope /> Email</label>
                <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-purple" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><FaPhone /> Phone</label>
                <input type="text" name="contactPhone" value={formData.contactPhone} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-purple" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><FaMapMarkerAlt /> Address</label>
                <input type="text" name="contactAddress" value={formData.contactAddress} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-purple" />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* General content */}
          <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
            <h3 className="text-base font-bold font-title text-black dark:text-white mb-4">Core Content</h3>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">About Section Title</label>
                <input type="text" name="aboutTitle" value={formData.aboutTitle} onChange={handleInputChange} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:border-primary-purple" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">About Bio / Description</label>
                <textarea name="aboutContent" value={formData.aboutContent} onChange={handleInputChange} rows={5} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-primary-purple resize-none" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Skills Summary / Intro text</label>
                <input type="text" name="aboutSkillsSummary" value={formData.aboutSkillsSummary} onChange={handleInputChange} placeholder="Brief summary of skills (e.g. Full Stack Web Developer & Graphic Designer)" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-primary-purple" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase flex items-center gap-1.5"><FaLink /> Resume PDF Link</label>
                <input type="text" name="resumeUrl" value={formData.resumeUrl} onChange={handleInputChange} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-purple" />
              </div>
            </div>
          </div>

          {/* Dynamic Personal Information Blocks */}
          <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
            <h3 className="text-base font-bold font-title text-black dark:text-white mb-2 flex items-center gap-2">
              <FaInfoCircle className="text-primary-blue" /> Personal Information Blocks
            </h3>
            <p className="text-xs text-slate-400 mb-4">Add, remove, or edit multiple personal key-value info blocks dynamically.</p>

            <div className="flex flex-col gap-3 mb-4">
              {(formData.aboutPersonalInfo || []).map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center p-3 bg-slate-50/50 dark:bg-white/5 border border-slate-200/40 dark:border-white/5 rounded-xl">
                  <FaGripVertical className="text-slate-350 dark:text-slate-600 shrink-0" size={12} />
                  <input
                    type="text"
                    value={item?.label || ''}
                    onChange={(e) => handleInfoBlockEdit(idx, 'label', e.target.value)}
                    placeholder="Label (e.g. Age)"
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-bold focus:outline-none focus:border-primary-purple"
                  />
                  <input
                    type="text"
                    value={item?.value || ''}
                    onChange={(e) => handleInfoBlockEdit(idx, 'value', e.target.value)}
                    placeholder="Value (e.g. 21)"
                    className="flex-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 text-slate-655 dark:text-slate-300 text-xs focus:outline-none focus:border-primary-purple"
                  />
                  <button type="button" onClick={() => handleRemoveInfoBlock(idx)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg shrink-0 cursor-pointer">
                    <FaTrash size={12} />
                  </button>
                </div>
              ))}
              {(!formData.aboutPersonalInfo || formData.aboutPersonalInfo.length === 0) && (
                <p className="text-xs text-slate-400 italic">No personal information blocks configured yet.</p>
              )}
            </div>

            <div className="border border-dashed border-slate-200 dark:border-white/10 p-4 rounded-xl flex flex-wrap gap-2 items-end">
              <div className="flex-1 min-w-[120px] flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Label</label>
                <input type="text" name="newInfoLabel" value={formData.newInfoLabel} onChange={handleInputChange} placeholder="e.g. Freelance" className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-purple" />
              </div>
              <div className="flex-2 min-w-[160px] flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Value</label>
                <input type="text" name="newInfoValue" value={formData.newInfoValue} onChange={handleInputChange} placeholder="e.g. Available" className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-purple" />
              </div>
              <button type="button" onClick={handleAddInfoBlock} className="px-4 py-2.5 bg-primary-purple hover:opacity-90 text-white rounded-lg text-xs font-black flex items-center gap-1.5 cursor-pointer">
                <FaPlus size={10} /> Add Block
              </button>
            </div>
          </div>

          {/* Core Strengths */}
          <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
            <h3 className="text-base font-bold font-title text-black dark:text-white mb-2 flex items-center gap-2">
              <FaCheckCircle className="text-green-500" size={14} /> Core Strengths List
            </h3>
            
            <div className="flex flex-col gap-3 mb-4">
              {(formData.coreStrengths || []).map((item, idx) => (
                <div key={idx} className="flex gap-2 items-start p-3 bg-slate-50/50 dark:bg-white/5 border border-slate-200/40 dark:border-white/5 rounded-xl">
                  <FaGripVertical className="text-slate-350 dark:text-slate-600 mt-2 shrink-0" size={12} />
                  <div className="flex-1 flex flex-col gap-1.5">
                    <input type="text" value={item?.title || ''} onChange={(e) => handleStrengthEdit(idx, 'title', e.target.value)} placeholder="Title" className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-bold focus:outline-none focus:border-primary-purple" />
                    <input type="text" value={item?.desc || ''} onChange={(e) => handleStrengthEdit(idx, 'desc', e.target.value)} placeholder="Description" className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs focus:outline-none focus:border-primary-purple" />
                  </div>
                  <button type="button" onClick={() => handleRemoveStrength(idx)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg shrink-0 cursor-pointer">
                    <FaTrash size={12} />
                  </button>
                </div>
              ))}
            </div>

            <div className="border border-dashed border-slate-200 dark:border-white/10 p-4 rounded-xl flex flex-col gap-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Add a Core Strength</p>
              <input type="text" name="newStrengthTitle" value={formData.newStrengthTitle} onChange={handleInputChange} placeholder="Title (e.g. Quick Learner)" className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-purple" />
              <input type="text" name="newStrengthDesc" value={formData.newStrengthDesc} onChange={handleInputChange} placeholder="Short description..." className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-purple" />
              <button type="button" onClick={handleAddStrength} className="self-start px-4 py-2 bg-primary-purple/10 text-primary-purple border border-primary-purple/20 rounded-lg text-xs font-black cursor-pointer flex items-center gap-1.5">
                <FaPlus size={10} /> Add Strength
              </button>
            </div>
          </div>

          {/* Languages */}
          <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
            <h3 className="text-base font-bold font-title text-black dark:text-white mb-2 flex items-center gap-2">
              <FaLanguage className="text-primary-blue" size={14} /> Languages
            </h3>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {(formData.languages || []).map((lang, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
                  <span className="text-xs font-bold text-slate-800 dark:text-white">{lang?.name || ''}</span>
                  {lang?.level && <span className="text-[10px] text-slate-400">({lang.level})</span>}
                  <button type="button" onClick={() => handleRemoveLanguage(idx)} className="text-slate-400 hover:text-red-500 cursor-pointer"><FaTimes size={10} /></button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 flex-wrap">
              <input type="text" name="newLanguageName" value={formData.newLanguageName} onChange={handleInputChange} placeholder="Language (e.g. English)" className="flex-1 min-w-[120px] px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-purple" />
              <input type="text" name="newLanguageLevel" value={formData.newLanguageLevel} onChange={handleInputChange} placeholder="Proficiency (e.g. Fluent)" className="flex-1 min-w-[120px] px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-purple" />
              <button type="button" onClick={handleAddLanguage} className="px-4 py-2 bg-primary-purple/10 text-primary-purple border border-primary-purple/20 rounded-lg text-xs font-black cursor-pointer"><FaPlus size={10} /></button>
            </div>
          </div>

          {/* Form Actions (Save, Reset, Cancel) */}
          <div className="flex gap-4 items-center">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3.5 bg-primary-purple hover:opacity-90 disabled:opacity-60 text-white rounded-xl text-sm font-black shadow-lg shadow-primary-purple/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <><FaSave /> Save Changes</>
              )}
            </button>
            
            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              className="px-5 py-3.5 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-white/15 transition-colors cursor-pointer flex items-center gap-1.5"
              title="Discards all unsaved edits"
            >
              <FaUndo /> Reset
            </button>
            
            <button
              type="button"
              onClick={fetchSettings}
              disabled={saving}
              className="px-5 py-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-sm font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              title="Discards current edits and reloads settings"
            >
              <FaBan /> Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AboutManager;
