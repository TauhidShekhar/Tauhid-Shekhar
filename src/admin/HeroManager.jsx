import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  FaSave, FaCloudUploadAlt, FaTrash, FaPlus, FaTimes, FaEye, 
  FaGithub, FaLinkedin, FaEnvelope, FaLink, FaHome, FaUndo,
  FaInstagram, FaTwitter, FaYoutube, FaFacebook, FaImage, FaBan
} from 'react-icons/fa';

const HeroManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Original state backup for "Reset" action
  const [originalData, setOriginalData] = useState(null);

  // Image upload states (Hero Image)
  const [uploadingHero, setUploadingHero] = useState(false);
  const [heroImgProgress, setHeroImgProgress] = useState(0);
  const [dragOverHero, setDragOverHero] = useState(false);

  // Image upload states (Background Banner)
  const [uploadingBg, setUploadingBg] = useState(false);
  const [bgImgProgress, setBgImgProgress] = useState(0);
  const [dragOverBg, setDragOverBg] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    siteName: '',
    heroHeading: "I'm",
    heroDescription: '',
    email: '',
    resumeUrl: '',
    
    // Images
    heroImageUrl: '',
    heroImagePublicId: '',
    heroBgUrl: '',
    heroBgPublicId: '',

    // Social Links
    githubLink: '',
    linkedinLink: '',
    twitterLink: '',
    instagramLink: '',
    youtubeLink: '',
    facebookLink: '',

    // CTA Switches
    showHireMe: true,
    showContactMe: true,
    showResume: true,

    // Typing Roles List
    heroRoles: [],
    newRole: ''
  });

  // Fetch settings from DB
  const fetchSettings = async () => {
    try {
      const res = await api.getHero();
      if (res.success && res.data) {
        const d = res.data;
        const initialForm = {
          siteName: d.siteName || '',
          heroHeading: d.heroHeading || "I'm",
          heroDescription: d.heroDescription || d.siteTagline || '',
          email: d.email || '',
          resumeUrl: d.resumeUrl || '',
          
          heroImageUrl: d.heroImage?.url || '',
          heroImagePublicId: d.heroImage?.publicId || '',
          heroBgUrl: d.heroBackground?.url || '',
          heroBgPublicId: d.heroBackground?.publicId || '',

          githubLink: d.socialLinks?.github || '',
          linkedinLink: d.socialLinks?.linkedin || '',
          twitterLink: d.socialLinks?.twitter || '',
          instagramLink: d.socialLinks?.instagram || '',
          youtubeLink: d.socialLinks?.youtube || '',
          facebookLink: d.socialLinks?.facebook || '',

          showHireMe: d.heroCtaButtons?.showHireMe !== false,
          showContactMe: d.heroCtaButtons?.showContactMe !== false,
          showResume: d.heroCtaButtons?.showResume !== false,

          heroRoles: d.heroRoles?.length ? d.heroRoles : ['Full Stack Developer', 'MERN Stack Developer', 'React Developer', 'Backend Developer'],
          newRole: ''
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Generic file compression and validation
  const validateAndCompressImage = async (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Unsupported image format. Allowed formats: JPG, PNG, WEBP, SVG');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image size exceeds 5MB limit');
    }
    return file; // Native upload. Server or Cloudinary compresses automatically
  };

  // Hero Image Upload
  const handleHeroImageUpload = async (file) => {
    try {
      setErrorMsg('');
      const validFile = await validateAndCompressImage(file);
      
      if (formData.heroImageUrl && !window.confirm('Are you sure you want to replace the current hero image?')) {
        return;
      }

      setUploadingHero(true);
      setHeroImgProgress(20);

      const formPayload = new FormData();
      formPayload.append('file', validFile);

      const interval = setInterval(() => {
        setHeroImgProgress(prev => (prev >= 90 ? 90 : prev + 10));
      }, 150);

      const res = await api.uploadMedia(formPayload);
      clearInterval(interval);
      setHeroImgProgress(100);

      if (res.success && res.data?.fileUrl) {
        setFormData(prev => ({
          ...prev,
          heroImageUrl: res.data.fileUrl,
          heroImagePublicId: res.data.publicId || ''
        }));
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setTimeout(() => { setUploadingHero(false); setHeroImgProgress(0); }, 300);
    }
  };

  // Background Banner Upload
  const handleBgImageUpload = async (file) => {
    try {
      setErrorMsg('');
      const validFile = await validateAndCompressImage(file);

      if (formData.heroBgUrl && !window.confirm('Are you sure you want to replace the current background banner?')) {
        return;
      }

      setUploadingBg(true);
      setBgImgProgress(20);

      const formPayload = new FormData();
      formPayload.append('file', validFile);

      const interval = setInterval(() => {
        setBgImgProgress(prev => (prev >= 90 ? 90 : prev + 10));
      }, 150);

      const res = await api.uploadMedia(formPayload);
      clearInterval(interval);
      setBgImgProgress(100);

      if (res.success && res.data?.fileUrl) {
        setFormData(prev => ({
          ...prev,
          heroBgUrl: res.data.fileUrl,
          heroBgPublicId: res.data.publicId || ''
        }));
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setTimeout(() => { setUploadingBg(false); setBgImgProgress(0); }, 300);
    }
  };

  // Delete Hero Image with confirmation
  const handleDeleteHeroImage = () => {
    if (window.confirm('Are you sure you want to delete the hero image?')) {
      setFormData(prev => ({ ...prev, heroImageUrl: '', heroImagePublicId: '' }));
    }
  };

  // Delete Background Banner with confirmation
  const handleDeleteBgImage = () => {
    if (window.confirm('Are you sure you want to delete the background banner?')) {
      setFormData(prev => ({ ...prev, heroBgUrl: '', heroBgPublicId: '' }));
    }
  };

  // Roles Add/Remove
  const handleAddRole = () => {
    const role = formData.newRole.trim();
    if (!role) return;
    if (formData.heroRoles.includes(role)) {
      setErrorMsg('This role already exists');
      return;
    }
    setFormData(prev => ({
      ...prev,
      heroRoles: [...prev.heroRoles, role],
      newRole: ''
    }));
  };

  const handleRemoveRole = (idx) => {
    setFormData(prev => ({
      ...prev,
      heroRoles: prev.heroRoles.filter((_, i) => i !== idx)
    }));
  };

  // Reset form to last loaded DB state
  const handleReset = () => {
    if (window.confirm('Are you sure you want to discard all unsaved changes?')) {
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
      siteName: formData.siteName,
      heroHeading: formData.heroHeading,
      heroDescription: formData.heroDescription,
      siteTagline: formData.heroDescription, // sync with legacy siteTagline field
      email: formData.email,
      resumeUrl: formData.resumeUrl,
      heroRoles: formData.heroRoles,
      
      heroImage: {
        url: formData.heroImageUrl,
        publicId: formData.heroImagePublicId
      },
      heroBackground: {
        url: formData.heroBgUrl,
        publicId: formData.heroBgPublicId
      },
      socialLinks: {
        github: formData.githubLink,
        linkedin: formData.linkedinLink,
        twitter: formData.twitterLink,
        instagram: formData.instagramLink,
        youtube: formData.youtubeLink,
        facebook: formData.facebookLink
      },
      heroCtaButtons: {
        showHireMe: formData.showHireMe,
        showContactMe: formData.showContactMe,
        showResume: formData.showResume
      }
    };

    try {
      const res = await api.updateHero(payload);
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
          <FaHome className="text-primary-blue" /> Home Section CMS
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage name, hero banner background, profile headshot, profession strings, CTAs, and social networks.
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
        
        {/* LEFT: Image uploads & social links */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Profile headshot Card */}
          <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
            <h3 className="text-sm font-bold font-title text-black dark:text-white mb-3 flex items-center gap-2">
              <FaImage className="text-primary-blue" /> Profile Headshot
            </h3>
            
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOverHero(true); }}
              onDragLeave={() => setDragOverHero(false)}
              onDrop={(e) => { e.preventDefault(); setDragOverHero(false); const f = e.dataTransfer.files[0]; if (f) handleHeroImageUpload(f); }}
              className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${
                dragOverHero ? 'border-primary-blue bg-primary-blue/5' : 'border-slate-250 dark:border-white/10 hover:border-primary-blue/60'
              }`}
            >
              {formData.heroImageUrl ? (
                <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden group max-w-[160px] mx-auto">
                  <img src={formData.heroImageUrl} alt="Hero headshot" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <label htmlFor="replace-hero" className="px-2.5 py-1.5 bg-white text-black text-[10px] font-black rounded-lg cursor-pointer hover:bg-slate-100">Replace</label>
                    <button type="button" onClick={handleDeleteHeroImage} className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black rounded-lg cursor-pointer">Delete</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-4">
                  <FaCloudUploadAlt size={26} className="text-slate-400" />
                  <p className="text-[11px] font-bold text-slate-500">Drag & drop profile picture</p>
                  <label htmlFor="hero-upload" className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-[10px] font-black rounded-lg cursor-pointer hover:bg-slate-200">Browse Device</label>
                </div>
              )}
              <input type="file" id="hero-upload" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (f) handleHeroImageUpload(f); }} className="hidden" />
              <input type="file" id="replace-hero" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (f) handleHeroImageUpload(f); }} className="hidden" />
            </div>

            {uploadingHero && (
              <div className="w-full bg-slate-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden mt-3">
                <div style={{ width: `${heroImgProgress}%` }} className="bg-primary-blue h-full transition-all duration-350" />
              </div>
            )}
          </div>

          {/* Background banner Card */}
          <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
            <h3 className="text-sm font-bold font-title text-black dark:text-white mb-3 flex items-center gap-2">
              <FaImage className="text-primary-purple" /> Background Banner
            </h3>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOverBg(true); }}
              onDragLeave={() => setDragOverBg(false)}
              onDrop={(e) => { e.preventDefault(); setDragOverBg(false); const f = e.dataTransfer.files[0]; if (f) handleBgImageUpload(f); }}
              className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${
                dragOverBg ? 'border-primary-purple bg-primary-purple/5' : 'border-slate-250 dark:border-white/10 hover:border-primary-purple/60'
              }`}
            >
              {formData.heroBgUrl ? (
                <div className="relative w-full aspect-[2/1] rounded-xl overflow-hidden group">
                  <img src={formData.heroBgUrl} alt="Hero BG banner" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <label htmlFor="replace-bg" className="px-2.5 py-1.5 bg-white text-black text-[10px] font-black rounded-lg cursor-pointer hover:bg-slate-100">Replace</label>
                    <button type="button" onClick={handleDeleteBgImage} className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black rounded-lg cursor-pointer">Delete</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-4">
                  <FaCloudUploadAlt size={26} className="text-slate-400" />
                  <p className="text-[11px] font-bold text-slate-500">Drag & drop background banner</p>
                  <label htmlFor="bg-upload" className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-[10px] font-black rounded-lg cursor-pointer hover:bg-slate-200">Browse Device</label>
                </div>
              )}
              <input type="file" id="bg-upload" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (f) handleBgImageUpload(f); }} className="hidden" />
              <input type="file" id="replace-bg" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (f) handleBgImageUpload(f); }} className="hidden" />
            </div>

            {uploadingBg && (
              <div className="w-full bg-slate-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden mt-3">
                <div style={{ width: `${bgImgProgress}%` }} className="bg-primary-purple h-full transition-all duration-350" />
              </div>
            )}
          </div>

          {/* Social connections Card */}
          <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
            <h3 className="text-sm font-bold font-title text-black dark:text-white mb-4">Social Network Links</h3>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><FaGithub /> GitHub URL</label>
                <input type="text" name="githubLink" value={formData.githubLink} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><FaLinkedin /> LinkedIn URL</label>
                <input type="text" name="linkedinLink" value={formData.linkedinLink} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><FaTwitter /> X / Twitter URL</label>
                <input type="text" name="twitterLink" value={formData.twitterLink} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><FaInstagram /> Instagram URL</label>
                <input type="text" name="instagramLink" value={formData.instagramLink} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><FaYoutube /> YouTube URL</label>
                <input type="text" name="youtubeLink" value={formData.youtubeLink} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><FaFacebook /> Facebook URL</label>
                <input type="text" name="facebookLink" value={formData.facebookLink} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue" />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Texts, CTAs, Roles */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Main info */}
          <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
            <h3 className="text-base font-bold font-title text-black dark:text-white mb-4">Text Parameters</h3>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase">Name (Branding)</label>
                  <input type="text" name="siteName" value={formData.siteName} onChange={handleInputChange} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:border-primary-blue" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase">Prefix / Heading</label>
                  <input type="text" name="heroHeading" value={formData.heroHeading} onChange={handleInputChange} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:border-primary-blue" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Short Description (Tagline)</label>
                <textarea name="heroDescription" value={formData.heroDescription} onChange={handleInputChange} rows={4} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-primary-blue resize-none" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase flex items-center gap-1.5"><FaLink /> Resume PDF Link</label>
                <input type="text" name="resumeUrl" value={formData.resumeUrl} onChange={handleInputChange} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue" />
              </div>
            </div>
          </div>

          {/* CTA Buttons Display */}
          <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
            <h3 className="text-base font-bold font-title text-black dark:text-white mb-3">CTA Buttons Visibility</h3>
            <div className="grid grid-cols-3 gap-4">
              <label className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/40 dark:border-white/5 cursor-pointer">
                <input type="checkbox" name="showHireMe" checked={formData.showHireMe} onChange={handleInputChange} className="rounded border-slate-300 text-primary-blue focus:ring-primary-blue cursor-pointer" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Hire Me</span>
              </label>
              <label className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/40 dark:border-white/5 cursor-pointer">
                <input type="checkbox" name="showContactMe" checked={formData.showContactMe} onChange={handleInputChange} className="rounded border-slate-300 text-primary-blue focus:ring-primary-blue cursor-pointer" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Contact Me</span>
              </label>
              <label className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/40 dark:border-white/5 cursor-pointer">
                <input type="checkbox" name="showResume" checked={formData.showResume} onChange={handleInputChange} className="rounded border-slate-300 text-primary-blue focus:ring-primary-blue cursor-pointer" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Resume</span>
              </label>
            </div>
          </div>

          {/* Cycling Roles */}
          <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
            <h3 className="text-base font-bold font-title text-black dark:text-white mb-2">Cycling Professions</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.heroRoles.map((role, idx) => (
                <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-blue/10 border border-primary-blue/20 text-primary-blue rounded-xl text-xs font-black">
                  {role}
                  <button type="button" onClick={() => handleRemoveRole(idx)} className="text-primary-blue/60 hover:text-red-500 cursor-pointer"><FaTimes size={10} /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" name="newRole" value={formData.newRole} onChange={handleInputChange} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddRole(); } }} placeholder="Add a new profession title..." className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue" />
              <button type="button" onClick={handleAddRole} className="px-4 py-2 bg-primary-blue hover:bg-accent-blue text-white rounded-xl text-xs font-black cursor-pointer"><FaPlus size={10} /></button>
            </div>
          </div>

          {/* Form Actions (Save, Reset, Cancel) */}
          <div className="flex gap-4 items-center">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3.5 bg-primary-blue hover:bg-accent-blue text-white disabled:opacity-60 rounded-xl text-sm font-black shadow-lg shadow-primary-blue/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
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

export default HeroManager;
