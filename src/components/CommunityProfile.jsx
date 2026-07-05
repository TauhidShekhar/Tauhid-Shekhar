import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { 
  FaUserCircle, FaMapMarkerAlt, FaLink, FaGithub, FaLinkedin, FaAward, 
  FaUserPlus, FaUserMinus, FaTwitter, FaInstagram, FaFacebook, FaYoutube, 
  FaEdit, FaEnvelope, FaPhone, FaCalendarAlt, FaVenusMars, FaBriefcase, 
  FaGraduationCap, FaFilePdf, FaCheckCircle, FaUserTag, FaBookmark, FaSave
} from 'react-icons/fa';

const CommunityProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followed, setFollowed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, edit, settings
  
  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [editData, setEditData] = useState({
    fullName: '',
    username: '',
    phone: '',
    bio: '',
    headline: '',
    aboutMe: '',
    location: '',
    website: '',
    githubUrl: '',
    linkedinUrl: '',
    twitterUrl: '',
    instagramUrl: '',
    facebookUrl: '',
    youtubeUrl: '',
    profession: '',
    company: '',
    dob: '',
    gender: '',
    skills: [],
    experience: [],
    education: [],
    certifications: [],
    interests: [],
    hobbies: []
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);

  const [avatarPreview, setAvatarPreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');

  // Password Settings States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.getCommunityUserProfile(id);
        if (res.success) {
          const finalProfile = res.data;
          setProfile(finalProfile);
          if (finalProfile) {
            setFollowed((finalProfile.followers || []).includes(currentUser?.id || currentUser?._id));
            
            // Populate form
            setEditData({
              fullName: finalProfile.fullName || '',
              username: finalProfile.username || '',
              phone: finalProfile.phone || '',
              bio: finalProfile.bio || '',
              headline: finalProfile.headline || '',
              aboutMe: finalProfile.aboutMe || '',
              location: finalProfile.location || '',
              website: finalProfile.website || '',
              githubUrl: finalProfile.githubUrl || '',
              linkedinUrl: finalProfile.linkedinUrl || '',
              twitterUrl: finalProfile.twitterUrl || '',
              instagramUrl: finalProfile.instagramUrl || '',
              facebookUrl: finalProfile.facebookUrl || '',
              youtubeUrl: finalProfile.youtubeUrl || '',
              profession: finalProfile.profession || '',
              company: finalProfile.company || '',
              dob: finalProfile.dob ? new Date(finalProfile.dob).toISOString().split('T')[0] : '',
              gender: finalProfile.gender || '',
              skills: finalProfile.skills || [],
              experience: finalProfile.experience || [],
              education: finalProfile.education || [],
              certifications: finalProfile.certifications || [],
              interests: finalProfile.interests || [],
              hobbies: finalProfile.hobbies || []
            });
            setAvatarPreview(finalProfile.avatar?.url || '');
            setCoverPreview(finalProfile.coverPhoto?.url || '');
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, currentUser]);

  const handleFollow = async () => {
    if (!profile) return;
    try {
      const res = await api.toggleFollowUser(profile._id || profile.id);
      if (res.success) {
        setFollowed(res.followed);
        alert(res.message);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const getProfileCompletion = (p) => {
    if (!p) return 0;
    const fields = [
      p.fullName, p.username, p.email, p.phone, p.avatar?.url, p.coverPhoto?.url,
      p.bio, p.headline, p.aboutMe, p.location, p.website, p.githubUrl, p.linkedinUrl,
      p.twitterUrl, p.instagramUrl, p.facebookUrl, p.youtubeUrl, p.profession, p.company,
      p.dob, p.gender, p.skills?.length, p.experience?.length, p.education?.length,
      p.certifications?.length, p.resume?.url, p.interests?.length, p.hobbies?.length
    ];
    const filled = fields.filter(f => f && (Array.isArray(f) ? f.length > 0 : true)).length;
    return Math.round((filled / fields.length) * 100);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('fullName', editData.fullName);
      formData.append('username', editData.username);
      formData.append('phone', editData.phone);
      formData.append('bio', editData.bio);
      formData.append('headline', editData.headline);
      formData.append('aboutMe', editData.aboutMe);
      formData.append('location', editData.location);
      formData.append('website', editData.website);
      formData.append('githubUrl', editData.githubUrl);
      formData.append('linkedinUrl', editData.linkedinUrl);
      formData.append('twitterUrl', editData.twitterUrl);
      formData.append('instagramUrl', editData.instagramUrl);
      formData.append('facebookUrl', editData.facebookUrl);
      formData.append('youtubeUrl', editData.youtubeUrl);
      formData.append('profession', editData.profession);
      formData.append('company', editData.company);
      formData.append('dob', editData.dob);
      formData.append('gender', editData.gender);
      
      formData.append('skills', editData.skills.join(','));
      formData.append('experience', editData.experience.join('\n'));
      formData.append('education', editData.education.join('\n'));
      formData.append('certifications', editData.certifications.join('\n'));
      formData.append('interests', editData.interests.join(','));
      formData.append('hobbies', editData.hobbies.join(','));

      if (avatarFile) formData.append('avatar', avatarFile);
      if (coverFile) formData.append('coverPhoto', coverFile);
      if (resumeFile) formData.append('resume', resumeFile);

      const res = await api.updateProfile(formData);
      if (res.success) {
        setSuccess('Profile updated successfully!');
        setProfile(res.user);
        setActiveTab('overview');
      }
    } catch (err) {
      setError(err.message || 'Profile save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }
    setSaving(true);
    try {
      const res = await api.changePassword(oldPassword, newPassword, confirmPassword);
      if (res.success) {
        setSuccess('Password updated successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-400 font-bold uppercase tracking-wider">Loading user profile...</div>;
  if (!profile) return <div className="p-10 text-center text-slate-400">User profile not found.</div>;

  const isOwnProfile = profile._id === currentUser?.id || profile._id === currentUser?._id;
  const completionPercentage = getProfileCompletion(profile);

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 text-left">
      
      {/* Profile Card wrapper */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-[30px] overflow-hidden shadow-sm">
        {/* Cover canvas */}
        <div className="h-44 bg-gradient-to-r from-primary-blue/30 to-primary-cyan/30 relative">
          {coverPreview ? (
            <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-slate-250 dark:bg-slate-950 flex items-center justify-center text-slate-400 font-black text-[10px] tracking-widest uppercase">
              No Cover Uploaded
            </div>
          )}
        </div>

        {/* Profile metadata info body */}
        <div className="p-6 relative pt-14">
          {/* Avatar overlay */}
          <div className="absolute -top-12 left-6 w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-md">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <FaUserCircle className="text-slate-300 w-full h-full" />
            )}
          </div>

          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black font-title text-black dark:text-white leading-tight">
                  {profile.fullName}
                </h2>
                {profile.isVerified && (
                  <FaCheckCircle className="text-primary-blue" size={16} title="Verified Community Member" />
                )}
              </div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                @{profile.username}
              </span>
              {profile.headline && (
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-2">{profile.headline}</p>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              {isOwnProfile ? (
                <>
                  <button
                    onClick={() => setActiveTab(activeTab === 'edit' ? 'overview' : 'edit')}
                    className="px-4.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-800 dark:text-white"
                  >
                    <FaEdit /> {activeTab === 'edit' ? 'View Profile' : 'Edit Profile'}
                  </button>
                  <button
                    onClick={() => setActiveTab(activeTab === 'settings' ? 'overview' : 'settings')}
                    className="px-4.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-800 dark:text-white"
                  >
                    Settings
                  </button>
                </>
              ) : (
                <button
                  onClick={handleFollow}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all border ${
                    followed 
                      ? 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-600' 
                      : 'bg-primary-blue border-primary-blue text-white hover:bg-accent-blue shadow-sm'
                  }`}
                >
                  {followed ? <><FaUserMinus /> Unfollow</> : <><FaUserPlus /> Follow User</>}
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 mt-4 text-xs font-bold text-slate-500 dark:text-slate-400">
            <span><strong>{profile.followers?.length || 0}</strong> Followers</span>
            <span><strong>{profile.following?.length || 0}</strong> Following</span>
            <span>Reputation: <strong>{profile.reputation || 0}</strong> XP: <strong>{profile.xp || 0}</strong></span>
          </div>

          {profile.bio && (
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-4">
              {profile.bio}
            </p>
          )}

          {/* Profile Completion percentage */}
          {isOwnProfile && completionPercentage < 100 && (
            <div className="mt-4 p-4 rounded-2xl bg-primary-blue/5 border border-primary-blue/10">
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span>Profile Completion</span>
                <span className="text-primary-blue">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-slate-150 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                <div className="bg-primary-blue h-full transition-all duration-300" style={{ width: `${completionPercentage}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold leading-relaxed">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold leading-relaxed">
          {success}
        </div>
      )}

      {/* Overview Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar Columns */}
          <div className="flex flex-col gap-6">
            {/* Social & Contact info */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-[30px] p-6 shadow-sm flex flex-col gap-3.5 text-xs text-slate-500 dark:text-slate-400 font-bold">
              <h3 className="font-black font-title text-sm text-black dark:text-white mb-2">Details</h3>
              {profile.profession && <span className="flex items-center gap-2"><FaBriefcase /> {profile.profession} {profile.company && `at ${profile.company}`}</span>}
              {profile.location && <span className="flex items-center gap-2"><FaMapMarkerAlt /> {profile.location}</span>}
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary-blue hover:underline">
                  <FaLink /> {profile.website}
                </a>
              )}
              {profile.resume?.url && (
                <a href={profile.resume.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-green-500 hover:underline">
                  <FaFilePdf /> View Resume
                </a>
              )}
              <div className="flex gap-4 text-slate-400 mt-2 border-t border-slate-100 dark:border-white/5 pt-3">
                {profile.githubUrl && <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="hover:text-primary-blue"><FaGithub size={16} /></a>}
                {profile.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="hover:text-primary-blue"><FaLinkedin size={16} /></a>}
                {profile.twitterUrl && <a href={profile.twitterUrl} target="_blank" rel="noreferrer" className="hover:text-primary-blue"><FaTwitter size={16} /></a>}
                {profile.instagramUrl && <a href={profile.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-primary-blue"><FaInstagram size={16} /></a>}
              </div>
            </div>

            {/* Badges section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-[30px] p-6 shadow-sm">
              <h3 className="font-black font-title text-sm text-black dark:text-white mb-4">Achievements</h3>
              <div className="flex flex-col gap-3">
                {(profile.badges || []).map(badge => (
                  <div key={badge.name} className="p-3 bg-slate-50 dark:bg-white/5 border border-slate-150/50 dark:border-white/5 rounded-2xl flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg">
                      <FaAward size={16} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-xs text-black dark:text-white">{badge.name}</h4>
                      <span className="text-[8px] text-slate-500 font-bold block mt-0.5">UNLOCKED: {new Date(badge.dateEarned).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                {(!profile.badges || profile.badges.length === 0) && (
                  <p className="text-xs text-slate-400 italic">No achievements unlocked yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Main profile contents */}
          <div className="md:col-span-2 flex flex-col gap-6">
            {/* About Me */}
            {profile.aboutMe && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-[30px] p-6 shadow-sm text-left">
                <h3 className="font-black font-title text-sm text-black dark:text-white mb-3">About Me</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{profile.aboutMe}</p>
              </div>
            )}

            {/* Skills */}
            {profile.skills?.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-[30px] p-6 shadow-sm text-left">
                <h3 className="font-black font-title text-sm text-black dark:text-white mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map(s => (
                    <span key={s} className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience, Education & Certifications lists */}
            {profile.experience?.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-[30px] p-6 shadow-sm text-left">
                <h3 className="font-black font-title text-sm text-black dark:text-white mb-4">Experience</h3>
                <div className="flex flex-col gap-4">
                  {profile.experience.map((exp, idx) => (
                    <div key={idx} className="flex gap-3 text-xs">
                      <FaBriefcase className="text-primary-blue mt-0.5 shrink-0" size={14} />
                      <p className="text-slate-600 dark:text-slate-350 font-bold whitespace-pre-wrap">{exp}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profile.education?.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-[30px] p-6 shadow-sm text-left">
                <h3 className="font-black font-title text-sm text-black dark:text-white mb-4">Education</h3>
                <div className="flex flex-col gap-4">
                  {profile.education.map((edu, idx) => (
                    <div key={idx} className="flex gap-3 text-xs">
                      <FaGraduationCap className="text-primary-blue mt-0.5 shrink-0" size={14} />
                      <p className="text-slate-600 dark:text-slate-350 font-bold whitespace-pre-wrap">{edu}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Profile Tab Content */}
      {activeTab === 'edit' && (
        <form onSubmit={handleProfileSave} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-[30px] p-6 sm:p-8 shadow-sm flex flex-col gap-6 text-left">
          <h3 className="font-black font-title text-sm text-black dark:text-white border-b border-slate-100 dark:border-white/5 pb-4 mb-2">Edit Community Profile</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Profile Avatar upload */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-500">Avatar Picture</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => { setAvatarFile(e.target.files[0]); setAvatarPreview(URL.createObjectURL(e.target.files[0])); }} 
                className="w-full text-xs text-slate-550 border border-slate-200 dark:border-white/5 p-2 rounded-xl"
              />
            </div>

            {/* Cover photo upload */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-500">Cover Photo</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => { setCoverFile(e.target.files[0]); setCoverPreview(URL.createObjectURL(e.target.files[0])); }} 
                className="w-full text-xs text-slate-550 border border-slate-200 dark:border-white/5 p-2 rounded-xl"
              />
            </div>

            {/* Name */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-500">Full Name</label>
              <input 
                type="text" 
                value={editData.fullName} 
                onChange={e => setEditData({...editData, fullName: e.target.value})} 
                className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl"
                required
              />
            </div>

            {/* Username */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-500">Username</label>
              <input 
                type="text" 
                value={editData.username} 
                onChange={e => setEditData({...editData, username: e.target.value})} 
                className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl"
                required
              />
            </div>

            {/* Headline */}
            <div className="flex flex-col gap-2 sm:col-span-2">
              <label className="text-xs font-black text-slate-500">Professional Headline</label>
              <input 
                type="text" 
                value={editData.headline} 
                onChange={e => setEditData({...editData, headline: e.target.value})} 
                placeholder="e.g. MERN Stack Developer | UI/UX Designer"
                className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl"
              />
            </div>

            {/* Bio */}
            <div className="flex flex-col gap-2 sm:col-span-2">
              <label className="text-xs font-black text-slate-500">Short Bio</label>
              <textarea 
                value={editData.bio} 
                onChange={e => setEditData({...editData, bio: e.target.value})} 
                placeholder="Write a brief intro..."
                rows="2"
                className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl resize-none"
              />
            </div>

            {/* About Me */}
            <div className="flex flex-col gap-2 sm:col-span-2">
              <label className="text-xs font-black text-slate-500">About Me (Full Story)</label>
              <textarea 
                value={editData.aboutMe} 
                onChange={e => setEditData({...editData, aboutMe: e.target.value})} 
                placeholder="Write a detailed description of your journey, interests and goals..."
                rows="4"
                className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl resize-none"
              />
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-500">Phone</label>
              <input 
                type="text" 
                value={editData.phone} 
                onChange={e => setEditData({...editData, phone: e.target.value})} 
                className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl"
              />
            </div>

            {/* Location */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-500">Location</label>
              <input 
                type="text" 
                value={editData.location} 
                onChange={e => setEditData({...editData, location: e.target.value})} 
                placeholder="e.g. New Delhi, India"
                className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl"
              />
            </div>

            {/* Profession */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-500">Profession</label>
              <input 
                type="text" 
                value={editData.profession} 
                onChange={e => setEditData({...editData, profession: e.target.value})} 
                placeholder="e.g. Full Stack Engineer"
                className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl"
              />
            </div>

            {/* Company */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-500">Company</label>
              <input 
                type="text" 
                value={editData.company} 
                onChange={e => setEditData({...editData, company: e.target.value})} 
                placeholder="e.g. Google"
                className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl"
              />
            </div>

            {/* DOB */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-500">Date of Birth</label>
              <input 
                type="date" 
                value={editData.dob} 
                onChange={e => setEditData({...editData, dob: e.target.value})} 
                className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl"
              />
            </div>

            {/* Gender */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-500">Gender</label>
              <select 
                value={editData.gender} 
                onChange={e => setEditData({...editData, gender: e.target.value})} 
                className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Resume upload */}
            <div className="flex flex-col gap-2 sm:col-span-2">
              <label className="text-xs font-black text-slate-500">Upload Resume (PDF)</label>
              <input 
                type="file" 
                accept="application/pdf" 
                onChange={(e) => setResumeFile(e.target.files[0])} 
                className="w-full text-xs text-slate-550 border border-slate-200 dark:border-white/5 p-2 rounded-xl"
              />
            </div>

            {/* Skills */}
            <div className="flex flex-col gap-2 sm:col-span-2">
              <label className="text-xs font-black text-slate-500">Skills (Comma-separated)</label>
              <input 
                type="text" 
                value={editData.skills.join(', ')} 
                onChange={e => setEditData({...editData, skills: e.target.value.split(',').map(s => s.trim())})} 
                placeholder="React, Node.js, Express, MongoDB"
                className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl"
              />
            </div>

            {/* Experience */}
            <div className="flex flex-col gap-2 sm:col-span-2">
              <label className="text-xs font-black text-slate-500">Experience (One description per line)</label>
              <textarea 
                value={editData.experience.join('\n')} 
                onChange={e => setEditData({...editData, experience: e.target.value.split('\n')})} 
                placeholder="Senior MERN Developer at TechCorp (2022 - Present)"
                rows="3"
                className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl resize-none"
              />
            </div>

            {/* Education */}
            <div className="flex flex-col gap-2 sm:col-span-2">
              <label className="text-xs font-black text-slate-500">Education (One description per line)</label>
              <textarea 
                value={editData.education.join('\n')} 
                onChange={e => setEditData({...editData, education: e.target.value.split('\n')})} 
                placeholder="Bachelor of Computer Applications at University (2018 - 2021)"
                rows="3"
                className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl resize-none"
              />
            </div>

            {/* Social Coordinates */}
            <h4 className="sm:col-span-2 text-xs font-extrabold text-black dark:text-white border-t border-slate-100 dark:border-white/5 pt-4 mt-2">Social Profiles</h4>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-500">Website</label>
              <input 
                type="url" 
                value={editData.website} 
                onChange={e => setEditData({...editData, website: e.target.value})} 
                placeholder="https://example.com"
                className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-500">GitHub Profile</label>
              <input 
                type="url" 
                value={editData.githubUrl} 
                onChange={e => setEditData({...editData, githubUrl: e.target.value})} 
                placeholder="https://github.com/username"
                className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-500">LinkedIn URL</label>
              <input 
                type="url" 
                value={editData.linkedinUrl} 
                onChange={e => setEditData({...editData, linkedinUrl: e.target.value})} 
                placeholder="https://linkedin.com/in/username"
                className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-500">Twitter / X URL</label>
              <input 
                type="url" 
                value={editData.twitterUrl} 
                onChange={e => setEditData({...editData, twitterUrl: e.target.value})} 
                placeholder="https://x.com/username"
                className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-500">Instagram URL</label>
              <input 
                type="url" 
                value={editData.instagramUrl} 
                onChange={e => setEditData({...editData, instagramUrl: e.target.value})} 
                className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-500">Facebook URL</label>
              <input 
                type="url" 
                value={editData.facebookUrl} 
                onChange={e => setEditData({...editData, facebookUrl: e.target.value})} 
                className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-500">YouTube Channel URL</label>
              <input 
                type="url" 
                value={editData.youtubeUrl} 
                onChange={e => setEditData({...editData, youtubeUrl: e.target.value})} 
                className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end border-t border-slate-100 dark:border-white/5 pt-6 mt-4">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className="px-5 py-3 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-350 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-primary-blue hover:bg-accent-blue text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-md shadow-primary-blue/15 flex items-center justify-center gap-2"
            >
              {saving ? 'Saving...' : <><FaSave /> Save Changes</>}
            </button>
          </div>
        </form>
      )}

      {/* Account Settings Tab Content */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-[30px] p-6 sm:p-8 shadow-sm flex flex-col gap-6 text-left">
          <h3 className="font-black font-title text-sm text-black dark:text-white border-b border-slate-100 dark:border-white/5 pb-4 mb-2">Account Settings</h3>

          <form onSubmit={handlePasswordChange} className="flex flex-col gap-5 max-w-md">
            <h4 className="text-xs font-extrabold text-black dark:text-white">Change Password</h4>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-500">Current Password</label>
              <input 
                type="password" 
                value={oldPassword} 
                onChange={e => setOldPassword(e.target.value)} 
                className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-500">New Password</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-500">Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl"
                required
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-primary-blue hover:bg-accent-blue text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-md shadow-primary-blue/15 w-fit"
            >
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default CommunityProfile;
