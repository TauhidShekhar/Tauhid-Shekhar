import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { 
  FaUserCircle, FaMapMarkerAlt, FaLink, FaGithub, FaLinkedin, FaAward, 
  FaUserPlus, FaUserMinus, FaTwitter, FaInstagram, FaFacebook, FaYoutube, 
  FaEdit, FaEnvelope, FaPhone, FaCalendarAlt, FaVenusMars, FaBriefcase, 
  FaGraduationCap, FaFilePdf, FaCheckCircle, FaUserTag, FaBookmark, FaSave,
  FaMapPin, FaGlobe, FaChevronRight, FaTimes, FaUserCheck, FaCoins
} from 'react-icons/fa';
import { useUsernameValidator } from '../hooks/useUsernameValidator';

const getAbsolutePdfUrl = (url) => {
  if (!url) return '';
  let cleanUrl = url.trim();
  if (cleanUrl.includes('/raw/upload/') && cleanUrl.toLowerCase().endsWith('.pdf')) {
    cleanUrl = cleanUrl.replace('/raw/upload/', '/image/upload/');
  }
  if (/^(f|ht)tps?:\/\//i.test(cleanUrl)) {
    return cleanUrl;
  }
  return `https://${cleanUrl}`;
};

const CommunityProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const {
    username: valUsername,
    setUsername: setValUsername,
    error: usernameError,
    isValid: isUsernameValid,
    isChecking: isCheckingUsername
  } = useUsernameValidator('', id || '');
  const [followed, setFollowed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, posts, groups, about, edit, settings
  const [userPosts, setUserPosts] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  
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
          setValUsername(finalProfile.username || '');
          setAvatarPreview(finalProfile.avatar?.url || '');
          setCoverPreview(finalProfile.coverPhoto?.url || '');
        }

        // Fetch User's Posts
        const postsRes = await api.getCommunityPosts({ authorId: id });
        if (postsRes.success) {
          setUserPosts(postsRes.data || []);
        }

        // Fetch User's Groups
        const groupsRes = await api.getCommunityGroups();
        if (groupsRes.success) {
          const joined = (groupsRes.data || []).filter(g => 
            g.members.some(m => (m._id || m) === id) || 
            (g.owner?._id || g.owner) === id
          );
          setUserGroups(joined);
        }
      }
    } catch (err) {
      console.error('Failed to load community profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProfile();
    }
  }, [id, currentUser]);

  const handleFollow = async () => {
    if (!profile) return;
    const originalFollowed = followed;
    const originalProfile = profile;
    const currentUserId = (currentUser?.id || currentUser?._id)?.toString();

    // Toggle local state optimistically
    setFollowed(!originalFollowed);

    // Update followers list locally
    setProfile(prev => {
      if (!prev) return prev;
      const list = prev.followers || [];
      const listIds = list.map(f => (f._id || f).toString());
      let nextFollowers;
      if (originalFollowed) {
        nextFollowers = list.filter(f => (f._id || f).toString() !== currentUserId);
      } else {
        nextFollowers = [...list, { _id: currentUserId, fullName: currentUser.fullName, username: currentUser.username, avatar: currentUser.avatar }];
      }
      return { ...prev, followers: nextFollowers };
    });

    try {
      const res = await api.toggleFollowUser(profile._id || profile.id);
      if (res.success) {
        setFollowed(res.followed);
        fetchProfile(); // sync completely
      } else {
        setFollowed(originalFollowed);
        setProfile(originalProfile);
      }
    } catch (err) {
      console.error(err);
      setFollowed(originalFollowed);
      setProfile(originalProfile);
    }
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
      if (editData.dob) formData.append('dob', editData.dob);
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
        fetchProfile();
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

  if (loading) {
    return (
      <div className="p-16 flex items-center justify-center bg-[#121217] border border-white/5 rounded-3xl">
        <div className="w-8 h-8 rounded-full border-3 border-purple-500/20 border-t-purple-500 animate-spin" />
      </div>
    );
  }

  if (!profile) return <div className="p-10 text-center text-slate-450">User profile not found.</div>;

  const isOwnProfile = profile._id === currentUser?.id || profile._id === currentUser?._id;
  const currentUserId = currentUser?.id || currentUser?._id;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'posts', label: 'Posts' },
    { id: 'groups', label: 'Groups' },
    { id: 'about', label: 'About' }
  ];

  return (
    <div className="flex flex-col gap-6 w-full text-left">
      
      {/* Cover Banner Card (LinkedIn/Facebook Style) */}
      <div className="bg-[#121217] border border-white/5 rounded-3xl overflow-hidden shadow-sm relative">
        <div className="h-48 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 relative">
          {coverPreview ? (
            <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full bg-[#181822] flex items-center justify-center text-slate-500 font-black text-[10px] tracking-widest uppercase">
              No cover photo uploaded
            </div>
          )}
        </div>

        {/* Profile Meta Section with Overlapping Avatar */}
        <div className="p-6 relative pt-16 flex flex-col md:flex-row md:items-end justify-between gap-4">
          
          {/* Overlapping Avatar */}
          <div className="absolute -top-14 left-6 w-24 h-24 rounded-2xl overflow-hidden bg-[#181822] border-4 border-[#121217] flex items-center justify-center shadow-lg group">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <span className="font-black text-xl text-purple-400 uppercase">{profile.username?.slice(0, 2)}</span>
            )}
            
            {/* Green Online Dot */}
            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-[#121217]" />
          </div>

          {/* User Meta Infos */}
          <div className="flex-1 text-left md:pl-2">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black font-title text-white flex items-center gap-1.5">
                {profile.fullName} 
                <FaCheckCircle className="text-purple-400" size={16} title="Verified Developer" />
              </h2>
            </div>
            <span className="text-xs text-slate-450 font-bold uppercase tracking-wider block mt-0.5">
              @{profile.username}
            </span>
            <p className="text-xs text-slate-300 mt-2 font-semibold">
              {profile.headline || 'Full Stack Developer | Tech Enthusiast'}
            </p>

            {/* Sub-meta metrics location, website */}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <FaMapMarkerAlt size={10} className="text-purple-400" /> {profile.location}
                </span>
              )}
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-purple-400 hover:underline">
                  <FaLink size={10} /> {profile.website.replace(/(^\w+:|^)\/\//, '')}
                </a>
              )}
              <span className="flex items-center gap-1">
                <FaCalendarAlt size={10} /> Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
              </span>
            </div>

            {/* Counters */}
            <div className="flex items-center gap-6 mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              <span><strong className="text-white text-xs font-black">{userPosts.length}</strong> Posts</span>
              <button onClick={() => setShowFollowersModal(true)} className="hover:text-purple-400 cursor-pointer transition-colors bg-transparent border-none p-0 text-[10px] text-slate-400 font-bold uppercase tracking-widest"><strong className="text-white text-xs font-black">{profile.followers?.length || 0}</strong> Followers</button>
              <button onClick={() => setShowFollowingModal(true)} className="hover:text-purple-400 cursor-pointer transition-colors bg-transparent border-none p-0 text-[10px] text-slate-400 font-bold uppercase tracking-widest"><strong className="text-white text-xs font-black">{profile.following?.length || 0}</strong> Following</button>
              <span><strong className="text-white text-xs font-black">{userGroups.length}</strong> Groups</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2">
            {isOwnProfile ? (
              <>
                <button
                  onClick={() => {
                    setActiveTab(activeTab === 'edit' ? 'overview' : 'edit');
                    setError('');
                    setSuccess('');
                  }}
                  className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border border-white/5 bg-[#1c1c24] hover:bg-[#252530] text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <FaEdit /> {activeTab === 'edit' ? 'Overview' : 'Edit Profile'}
                </button>
                <button
                  onClick={() => {
                    setActiveTab(activeTab === 'settings' ? 'overview' : 'settings');
                    setError('');
                    setSuccess('');
                  }}
                  className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border border-white/5 bg-[#1c1c24] hover:bg-[#252530] text-white transition-colors cursor-pointer"
                >
                  Settings
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleFollow}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
                    followed 
                      ? 'bg-transparent border-slate-700 text-slate-400' 
                      : 'bg-purple-600 hover:bg-purple-700 border-purple-500/10 text-white shadow-md'
                  }`}
                >
                  {followed ? 'Following' : 'Follow'}
                </button>
                <Link
                  to={`/community/chat?userId=${profile._id}`}
                  className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border border-white/5 bg-[#1c1c24] hover:bg-[#252530] text-white transition-colors flex items-center gap-1.5"
                >
                  Message
                </Link>
              </>
            )}
          </div>

        </div>

        {/* Tab Selection */}
        <div className="flex border-t border-white/5 px-6 bg-[#181820]/30">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setError('');
                setSuccess('');
              }}
              className={`px-5 py-3.5 text-[10px] font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                activeTab === tab.id 
                  ? 'border-purple-500 text-purple-400' 
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Feedback Cards */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold">
          {success}
        </div>
      )}

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Left Column stats details (col-span-4) */}
          <div className="md:col-span-4 flex flex-col gap-6">
            
            {/* About brief card */}
            <div className="bg-[#121217] border border-white/5 p-5 rounded-3xl flex flex-col gap-4">
              <h3 className="text-xs font-black text-white uppercase tracking-wider">About</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {profile.bio || 'Passionate developer ready to build clean full stack systems.'}
              </p>

              <div className="flex flex-col gap-2.5 text-[10px] font-bold text-slate-400 uppercase mt-2">
                <span className="flex items-center gap-2"><FaBriefcase className="text-purple-400" /> {profile.profession || 'Web Developer'} {profile.company && `at ${profile.company}`}</span>
                {profile.location && <span className="flex items-center gap-2"><FaMapMarkerAlt className="text-purple-400" /> {profile.location}</span>}
                
                {profile.resume?.url && (
                  <a href={getAbsolutePdfUrl(profile.resume.url)} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-green-500 hover:underline">
                    <FaFilePdf /> View Resume
                  </a>
                )}
              </div>

              {/* Social Channels row */}
              <div className="flex gap-4 text-slate-400 border-t border-white/5 pt-3 mt-1">
                {profile.githubUrl && <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="hover:text-purple-400 transition-colors"><FaGithub size={16} /></a>}
                {profile.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="hover:text-purple-400 transition-colors"><FaLinkedin size={16} /></a>}
                {profile.twitterUrl && <a href={profile.twitterUrl} target="_blank" rel="noreferrer" className="hover:text-purple-400 transition-colors"><FaTwitter size={16} /></a>}
                {profile.instagramUrl && <a href={profile.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-purple-400 transition-colors"><FaInstagram size={16} /></a>}
              </div>
            </div>

            {/* Ecosystem Stats & Activities Card */}
            <div className="bg-[#121217] border border-white/5 p-5 rounded-3xl flex flex-col gap-4">
              <div className="border-b border-white/5 pb-2">
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Ecosystem Status</h3>
              </div>

              {/* Progress and Level */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-black text-white">Level {profile.level || 1}</span>
                  <span className="text-[9px] text-purple-400 font-bold uppercase tracking-wider">{profile.rank || 'Bronze Starter'}</span>
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase">
                  <span>{profile.xp || 0} XP</span>
                  <span>Next: {((profile.level || 1) * 200)} XP</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#181822] overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" 
                    style={{ width: `${Math.min(100, Math.max(0, ((profile.xp || 0) / ((profile.level || 1) * 200)) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Coins & Streaks metrics */}
              <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-3 text-xs font-bold">
                <div className="flex flex-col text-left">
                  <span className="text-[8px] text-slate-500 uppercase tracking-widest font-black">Coins Balance</span>
                  <span className="text-amber-400 mt-1 flex items-center gap-1"><FaCoins /> {profile.coins || 0}</span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[8px] text-slate-500 uppercase tracking-widest font-black">Streak Count</span>
                  <span className="text-pink-400 mt-1">🔥 {profile.dailyStreak || 0} Days</span>
                </div>
              </div>

              {/* Platform Engagement Missions Info */}
              <div className="flex flex-col gap-2 border-t border-white/5 pt-3">
                <span className="text-[8px] text-slate-500 uppercase tracking-widest font-black block">Activities list to earn XP</span>
                <ul className="flex flex-col gap-1.5 text-[9px] text-slate-400 font-bold uppercase">
                  <li className="flex items-center gap-1.5 text-slate-350">📝 Post updates <span className="text-purple-400 ml-auto">+20 XP</span></li>
                  <li className="flex items-center gap-1.5 text-slate-350">💬 Add comments <span className="text-purple-400 ml-auto">+5 XP</span></li>
                  <li className="flex items-center gap-1.5 text-slate-350">⚡ Solve code challenges <span className="text-purple-400 ml-auto">+100 XP</span></li>
                  <li className="flex items-center gap-1.5 text-slate-350">🎡 Claim spin wheels <span className="text-purple-400 ml-auto">+20 XP</span></li>
                </ul>
              </div>
            </div>

            {/* Badges achievements card */}
            <div className="bg-[#121217] border border-white/5 p-5 rounded-3xl flex flex-col gap-4">
              <h3 className="text-xs font-black text-white uppercase tracking-wider">Badges</h3>
              <div className="grid grid-cols-4 gap-2">
                {(profile.badges || []).map((badge, idx) => (
                  <div key={idx} className="p-2 bg-[#1c1c24] border border-white/5 rounded-xl flex items-center justify-center text-yellow-500" title={badge.name}>
                    <FaAward size={20} />
                  </div>
                ))}
                {(!profile.badges || profile.badges.length === 0) && (
                  <span className="text-[10px] text-slate-550 italic text-center col-span-4 py-2">No badges unlocked.</span>
                )}
              </div>
            </div>

          </div>

          {/* Right Column core information (col-span-8) */}
          <div className="md:col-span-8 flex flex-col gap-6">
            
            {/* Skills Card */}
            <div className="bg-[#121217] border border-white/5 p-6 rounded-3xl">
              <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {(profile.skills || []).map((skill, idx) => (
                  <span key={idx} className="px-3.5 py-2 bg-[#1c1c24] border border-white/5 text-slate-300 rounded-xl text-xs font-bold hover:border-purple-550/20 transition-all">
                    {skill}
                  </span>
                ))}
                {(!profile.skills || profile.skills.length === 0) && (
                  <span className="text-xs text-slate-450 italic">No skills listed yet.</span>
                )}
              </div>
            </div>

            {/* Experience details */}
            {profile.experience?.length > 0 && (
              <div className="bg-[#121217] border border-white/5 p-6 rounded-3xl flex flex-col gap-4">
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Experience</h3>
                <div className="flex flex-col gap-4">
                  {profile.experience.map((exp, idx) => (
                    <div key={idx} className="flex gap-3 text-xs leading-relaxed text-slate-300">
                      <FaBriefcase className="text-purple-400 mt-0.5 shrink-0" size={14} />
                      <p className="font-bold">{exp}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education details */}
            {profile.education?.length > 0 && (
              <div className="bg-[#121217] border border-white/5 p-6 rounded-3xl flex flex-col gap-4">
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Education</h3>
                <div className="flex flex-col gap-4">
                  {profile.education.map((edu, idx) => (
                    <div key={idx} className="flex gap-3 text-xs leading-relaxed text-slate-300">
                      <FaGraduationCap className="text-purple-400 mt-0.5 shrink-0" size={14} />
                      <p className="font-bold">{edu}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* Posts Tab Feed */}
      {activeTab === 'posts' && (
        <div className="flex flex-col gap-5">
          {userPosts.map(post => (
            <div key={post._id} className="bg-[#121217] border border-white/5 p-5 rounded-3xl flex flex-col gap-4 text-left">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#1c1c24] text-purple-400 border border-purple-500/10 rounded-md text-[8px] font-black uppercase tracking-wider">
                    {post.category}
                  </span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase">{getRelativeTime(post.createdAt)}</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{post.content}</p>
              {post.mediaUrl && (
                <div className="rounded-2xl overflow-hidden border border-white/5 bg-[#181820] max-h-[300px]">
                  {post.mediaType === 'image' && <img src={post.mediaUrl} alt="post" className="w-full h-full object-cover" loading="lazy" />}
                </div>
              )}
            </div>
          ))}
          {userPosts.length === 0 && (
            <div className="p-10 border border-dashed border-white/10 text-center text-slate-450 rounded-3xl bg-[#121217] text-xs italic">
              No posts published yet.
            </div>
          )}
        </div>
      )}

      {/* Groups Tab List */}
      {activeTab === 'groups' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userGroups.map(group => (
            <div key={group._id} className="bg-[#121217] border border-white/5 p-4 rounded-3xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-400 border border-purple-500/15 flex items-center justify-center shrink-0 font-black text-sm uppercase">
                  {group.logo?.url ? <img src={group.logo.url} alt="logo" className="w-full h-full object-cover" loading="lazy" /> : (group.name || '').slice(0, 2)}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-black text-white">{group.name}</span>
                  <span className="text-[9px] text-slate-500 mt-0.5">{group.members?.length || 0} members</span>
                </div>
              </div>
              <Link to="/community/groups" className="px-3.5 py-1.5 bg-[#1c1c24] hover:bg-[#252530] text-slate-300 rounded-lg text-[9px] font-black uppercase tracking-wider border border-white/5">
                Go
              </Link>
            </div>
          ))}
          {userGroups.length === 0 && (
            <div className="col-span-2 p-10 border border-dashed border-white/10 text-center text-slate-450 rounded-3xl bg-[#121217] text-xs italic">
              Not joined any groups yet.
            </div>
          )}
        </div>
      )}

      {/* About Story Tab Panel */}
      {activeTab === 'about' && (
        <div className="bg-[#121217] border border-white/5 p-6 rounded-3xl flex flex-col gap-4 leading-relaxed">
          <h3 className="text-xs font-black text-white uppercase tracking-wider">Full Story</h3>
          <p className="text-xs text-slate-350 whitespace-pre-wrap leading-relaxed">
            {profile.aboutMe || 'Developer has not published their full story yet. Edit your profile to write down your developer goals, story and targets!'}
          </p>
        </div>
      )}

      {/* Edit Profile Tab Panel */}
      {activeTab === 'edit' && (
        <form onSubmit={handleProfileSave} className="bg-[#121217] border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 text-left">
          <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-white/5 pb-4 mb-2">Edit Developer Credentials</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Avatar image</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => { setAvatarFile(e.target.files[0]); setAvatarPreview(URL.createObjectURL(e.target.files[0])); }} 
                className="w-full text-xs text-slate-450 border border-white/5 p-2 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Cover photo</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => { setCoverFile(e.target.files[0]); setCoverPreview(URL.createObjectURL(e.target.files[0])); }} 
                className="w-full text-xs text-slate-450 border border-white/5 p-2 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Full name</label>
              <input 
                type="text" 
                value={editData.fullName} 
                onChange={e => setEditData({...editData, fullName: e.target.value})} 
                className="w-full text-xs text-white border border-white/5 bg-[#1e1e24] p-3 rounded-xl focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Username</label>
              <input 
                type="text" 
                value={editData.username} 
                onChange={e => {
                  const val = e.target.value;
                  setEditData({...editData, username: val});
                  setValUsername(val);
                }} 
                className={`w-full text-xs text-white border bg-[#1e1e24] p-3 rounded-xl focus:outline-none transition-colors ${
                  editData.username !== profile?.username && usernameError ? 'border-red-500 focus:border-red-500' : editData.username !== profile?.username && isUsernameValid ? 'border-green-500 focus:border-green-500' : 'border-white/5 focus:border-purple-500'
                }`}
                required
              />
              {editData.username !== profile?.username && editData.username && (
                <div className="text-[10px] font-medium leading-tight mt-0.5 px-1">
                  {isCheckingUsername && <span className="text-slate-400 animate-pulse">Checking availability...</span>}
                  {!isCheckingUsername && usernameError && <span className="text-red-500">{usernameError}</span>}
                  {!isCheckingUsername && !usernameError && isUsernameValid && <span className="text-green-500">Username is available!</span>}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Professional Headline</label>
              <input 
                type="text" 
                value={editData.headline} 
                onChange={e => setEditData({...editData, headline: e.target.value})} 
                placeholder="e.g. MERN Stack Developer | UI/UX Designer"
                className="w-full text-xs text-white border border-white/5 bg-[#1e1e24] p-3 rounded-xl focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Short Intro Bio</label>
              <textarea 
                value={editData.bio} 
                onChange={e => setEditData({...editData, bio: e.target.value})} 
                placeholder="Write a brief intro..."
                rows="2"
                className="w-full text-xs text-white border border-white/5 bg-[#1e1e24] p-3 rounded-xl focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
              />
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">About Me (Full Story)</label>
              <textarea 
                value={editData.aboutMe} 
                onChange={e => setEditData({...editData, aboutMe: e.target.value})} 
                placeholder="Detailed description of your developer journey..."
                rows="4"
                className="w-full text-xs text-white border border-white/5 bg-[#1e1e24] p-3 rounded-xl focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Location</label>
              <input 
                type="text" 
                value={editData.location} 
                onChange={e => setEditData({...editData, location: e.target.value})} 
                placeholder="e.g. New Delhi, India"
                className="w-full text-xs text-white border border-white/5 bg-[#1e1e24] p-3 rounded-xl focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Website URL</label>
              <input 
                type="url" 
                value={editData.website} 
                onChange={e => setEditData({...editData, website: e.target.value})} 
                placeholder="https://example.com"
                className="w-full text-xs text-white border border-white/5 bg-[#1e1e24] p-3 rounded-xl focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Skills (Comma-separated)</label>
              <input 
                type="text" 
                value={editData.skills.join(', ')} 
                onChange={e => setEditData({...editData, skills: e.target.value.split(',').map(s => s.trim())})} 
                placeholder="React, Node.js, Express, MongoDB"
                className="w-full text-xs text-white border border-white/5 bg-[#1e1e24] p-3 rounded-xl focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Experience (One item per line)</label>
              <textarea 
                value={editData.experience.join('\n')} 
                onChange={e => setEditData({...editData, experience: e.target.value.split('\n')})} 
                placeholder="MERN developer at TechCorp (2022 - Present)"
                rows="3"
                className="w-full text-xs text-white border border-white/5 bg-[#1e1e24] p-3 rounded-xl focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end border-t border-white/5 pt-6 mt-4">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-[#1c1c24] text-slate-400 cursor-pointer hover:text-white transition-colors"
            >
              Cancel
            </button>
             <button
              type="submit"
              disabled={saving || (editData.username !== profile?.username && (!isUsernameValid || isCheckingUsername))}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer shadow-md shadow-purple-600/10 flex items-center justify-center gap-1.5 transition-colors"
            >
              {saving ? 'Saving...' : <><FaSave /> Save Changes</>}
            </button>
          </div>
        </form>
      )}

      {/* Account Settings Panel */}
      {activeTab === 'settings' && (
        <div className="bg-[#121217] border border-white/5 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6 text-left">
          <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-white/5 pb-4 mb-2">Account Credentials</h3>

          <form onSubmit={handlePasswordChange} className="flex flex-col gap-5 max-w-md">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Change Password</h4>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Current Password</label>
              <input 
                type="password" 
                value={oldPassword} 
                onChange={e => setOldPassword(e.target.value)} 
                className="w-full text-xs text-white border border-white/5 bg-[#1e1e24] p-3 rounded-xl focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">New Password</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                className="w-full text-xs text-white border border-white/5 bg-[#1e1e24] p-3 rounded-xl focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                className="w-full text-xs text-white border border-white/5 bg-[#1e1e24] p-3 rounded-xl focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer shadow-md shadow-purple-600/10 transition-colors w-fit"
            >
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}
      {showFollowersModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121217] border border-white/5 w-full max-w-sm rounded-3xl p-6 flex flex-col gap-4 shadow-xl text-left">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-xs font-black text-white uppercase tracking-wider">Followers ({profile.followers?.length || 0})</h3>
              <button onClick={() => setShowFollowersModal(false)} className="text-slate-400 hover:text-white text-[10px] font-black uppercase cursor-pointer border border-white/10 px-2 py-1 rounded-lg transition-colors">Close</button>
            </div>
            <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
              {(profile.followers || []).length === 0 ? (
                <p className="text-[10px] text-slate-500 italic py-4 text-center">No followers yet.</p>
              ) : (
                profile.followers.map(f => (
                  <div key={f._id} className="flex items-center gap-3 justify-between p-2 hover:bg-white/5 rounded-xl transition-all">
                    <a href={`/community/profile/${f._id}`} onClick={() => setShowFollowersModal(false)} className="flex items-center gap-2.5 hover:opacity-80">
                      <img src={f.avatar?.url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'} className="w-8 h-8 rounded-full border border-white/10" loading="lazy" />
                      <div className="flex flex-col text-left">
                        <span className="text-[11px] font-bold text-white leading-tight">{f.fullName}</span>
                        <span className="text-[9px] text-slate-500 font-medium">@{f.username}</span>
                      </div>
                    </a>
                    <span className="text-[8px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded font-black uppercase tracking-wider">{f.xp || 0} XP</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showFollowingModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121217] border border-white/5 w-full max-w-sm rounded-3xl p-6 flex flex-col gap-4 shadow-xl text-left">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-xs font-black text-white uppercase tracking-wider">Following ({profile.following?.length || 0})</h3>
              <button onClick={() => setShowFollowingModal(false)} className="text-slate-400 hover:text-white text-[10px] font-black uppercase cursor-pointer border border-white/10 px-2 py-1 rounded-lg transition-colors">Close</button>
            </div>
            <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
              {(profile.following || []).length === 0 ? (
                <p className="text-[10px] text-slate-500 italic py-4 text-center">Not following anyone yet.</p>
              ) : (
                profile.following.map(f => (
                  <div key={f._id} className="flex items-center gap-3 justify-between p-2 hover:bg-white/5 rounded-xl transition-all">
                    <a href={`/community/profile/${f._id}`} onClick={() => setShowFollowingModal(false)} className="flex items-center gap-2.5 hover:opacity-80">
                      <img src={f.avatar?.url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'} className="w-8 h-8 rounded-full border border-white/10" loading="lazy" />
                      <div className="flex flex-col text-left">
                        <span className="text-[11px] font-bold text-white leading-tight">{f.fullName}</span>
                        <span className="text-[9px] text-slate-500 font-medium">@{f.username}</span>
                      </div>
                    </a>
                    <span className="text-[8px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded font-black uppercase tracking-wider">{f.xp || 0} XP</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CommunityProfile;
