import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { 
  FaUsers, FaPlus, FaLock, FaGlobe, FaArrowLeft, FaFileAlt, 
  FaFileImage, FaFileVideo, FaFilePdf, FaFileArchive, FaFileCode, 
  FaUpload, FaDownload, FaCog, FaUserShield, FaUserTimes, FaCheck, FaTimes, 
  FaLockOpen, FaBookOpen, FaUserMinus, FaUserPlus, FaHashtag, FaListAlt 
} from 'react-icons/fa';

const CATEGORIES = ['General', 'React', 'Node.js', 'Design', 'Web3', 'AI/ML', 'DevOps', 'Mobile'];

const CommunityGroups = () => {
  const { user } = useAuth();
  
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreator, setShowCreator] = useState(false);
  
  // Selected Group details view
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeTab, setActiveTab] = useState('feed'); // feed, files, members, settings
  
  // Group creator states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [category, setCategory] = useState('General');
  const [tags, setTags] = useState('');
  const [rules, setRules] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  // Group Settings Edit states
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCoverImage, setEditCoverImage] = useState('');
  const [editLogoUrl, setEditLogoUrl] = useState('');
  const [editCategory, setEditCategory] = useState('General');
  const [editTags, setEditTags] = useState('');
  const [editRules, setEditRules] = useState('');
  const [editIsPrivate, setEditIsPrivate] = useState(false);
  const [updatingGroup, setUpdatingGroup] = useState(false);

  // File Upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await api.getCommunityGroups();
      if (res.success) {
        setGroups(res.data || []);
        // Refresh active group if opened
        if (activeGroup) {
          const fresh = res.data.find(g => g._id === activeGroup._id);
          if (fresh) setActiveGroup(fresh);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleGroupSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createCommunityGroup({
        name,
        description,
        coverImage,
        logo: { url: logoUrl, publicId: '' },
        category,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        rules: rules.split('\n').map(r => r.trim()).filter(Boolean),
        isPrivate
      });
      if (res.success) {
        setGroups(prev => [...prev, res.data]);
        setShowCreator(false);
        // Reset Creator
        setName('');
        setDescription('');
        setCoverImage('');
        setLogoUrl('');
        setCategory('General');
        setTags('');
        setRules('');
        setIsPrivate(false);
      }
    } catch (err) {
      alert('Group creation failed: ' + err.message);
    }
  };

  const handleJoinRequest = async (groupId) => {
    try {
      const res = await api.manageCommunityGroupMembers(groupId, { action: 'request_join' });
      if (res.success) {
        alert(res.data.isPrivate ? 'Join request sent to moderators' : 'Joined group successfully');
        fetchGroups();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLeaveGroup = async (groupId) => {
    try {
      const res = await api.manageCommunityGroupMembers(groupId, { action: 'leave' });
      if (res.success) {
        alert('Left group successfully');
        fetchGroups();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogoUpload = async (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.uploadCommunityImage(formData);
      if (res.success) {
        if (isEdit) {
          setEditLogoUrl(res.url);
        } else {
          setLogoUrl(res.url);
        }
      }
    } catch (err) {
      alert('Logo upload failed: ' + err.message);
    }
  };

  const handleCoverUpload = async (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.uploadCommunityImage(formData);
      if (res.success) {
        if (isEdit) {
          setEditCoverImage(res.url);
        } else {
          setCoverImage(res.url);
        }
      }
    } catch (err) {
      alert('Cover upload failed: ' + err.message);
    }
  };

  const handleUpdateGroupSettings = async (e) => {
    e.preventDefault();
    if (!activeGroup) return;
    setUpdatingGroup(true);
    try {
      const payload = {
        name: editName,
        description: editDescription,
        category: editCategory,
        tags: editTags,
        rules: editRules,
        isPrivate: editIsPrivate,
        logo: { url: editLogoUrl, publicId: '' },
        coverImage: editCoverImage
      };
      
      const res = await api.updateCommunityGroup(activeGroup._id, payload);
      if (res.success) {
        alert('Group settings updated successfully!');
        setActiveGroup(res.data);
        fetchGroups();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingGroup(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !activeGroup) return;
    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const res = await api.uploadCommunityGroupFile(activeGroup._id, formData);
      if (res.success) {
        alert('File uploaded successfully!');
        setSelectedFile(null);
        fetchGroups();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleMemberAction = async (action, targetUserId) => {
    if (!activeGroup) return;
    try {
      const res = await api.manageCommunityGroupMembers(activeGroup._id, { action, targetUserId });
      if (res.success) {
        alert('Action completed successfully');
        fetchGroups();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOpenWorkspace = (group) => {
    setActiveGroup(group);
    setActiveTab('feed');
    // Populate edit data
    setEditName(group.name || '');
    setEditDescription(group.description || '');
    setEditCoverImage(group.coverImage || '');
    setEditLogoUrl(group.logo?.url || '');
    setEditCategory(group.category || 'General');
    setEditTags(group.tags?.join(', ') || '');
    setEditRules(group.rules?.join('\n') || '');
    setEditIsPrivate(group.isPrivate || false);
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'image': return <FaFileImage className="text-emerald-500" />;
      case 'video': return <FaFileVideo className="text-amber-500" />;
      case 'pdf': return <FaFilePdf className="text-rose-500" />;
      case 'zip': return <FaFileArchive className="text-indigo-500" />;
      case 'code': return <FaFileCode className="text-primary-cyan" />;
      default: return <FaFileAlt className="text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto p-4 sm:p-6 text-left">
      
      {/* ─── GRID / OVERVIEW VIEW ─── */}
      {!activeGroup && (
        <>
          {/* Header bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-6">
            <div>
              <h2 className="text-2xl font-black font-title text-black dark:text-white flex items-center gap-2">
                <FaUsers className="text-primary-blue" /> Community Group Boards
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">Connect, share files, and hold discussions in specialized rooms.</p>
            </div>
            {!showCreator && (
              <button
                onClick={() => setShowCreator(true)}
                className="px-5 py-3 bg-primary-blue hover:bg-accent-blue text-white rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-md shadow-primary-blue/15 w-fit"
              >
                <FaPlus /> Create Group
              </button>
            )}
          </div>

          {/* Creator form */}
          {showCreator && (
            <form onSubmit={handleGroupSubmit} className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-3xl flex flex-col gap-4 text-left shadow-md">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-3">
                <h4 className="text-sm font-black font-title text-black dark:text-white">Create Specialized Board</h4>
                <button 
                  type="button" 
                  onClick={() => setShowCreator(false)}
                  className="text-xs font-black text-red-500 hover:underline cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Group Title</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. MERN Stack Ninjas"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-xs transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category Lounge</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-xs cursor-pointer"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Group Logo Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoUpload(e, false)}
                    className="w-full text-xs text-slate-500 border border-slate-250 dark:border-white/5 p-2 rounded-xl"
                  />
                  {logoUrl && (
                    <img src={logoUrl} alt="Logo Preview" className="w-10 h-10 object-cover rounded-lg border border-slate-250 mt-1" />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Group Cover Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleCoverUpload(e, false)}
                    className="w-full text-xs text-slate-500 border border-slate-250 dark:border-white/5 p-2 rounded-xl"
                  />
                  {coverImage && (
                    <img src={coverImage} alt="Cover Preview" className="w-20 h-10 object-cover rounded-lg border border-slate-250 mt-1" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="react, webdev, setup"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-xs"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visibility Preferences</label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-350 cursor-pointer">
                      <input
                        type="radio"
                        name="creator_visibility"
                        checked={!isPrivate}
                        onChange={() => setIsPrivate(false)}
                      />
                      Public (Open)
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-350 cursor-pointer">
                      <input
                        type="radio"
                        name="creator_visibility"
                        checked={isPrivate}
                        onChange={() => setIsPrivate(true)}
                      />
                      Private (Approval)
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Group Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={2}
                  placeholder="Explain group topics..."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-xs transition-colors resize-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Group Rules (One rule per line)</label>
                <textarea
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  rows={2}
                  placeholder="e.g. Be polite and helpful."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-xs transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-fit px-8 py-3 bg-primary-blue hover:bg-accent-blue text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                Create Board
              </button>
            </form>
          )}

          {/* Cards Deck */}
          {loading ? (
            <div className="p-10 text-center text-slate-400 font-bold uppercase tracking-wider">Loading boards...</div>
          ) : groups.length === 0 ? (
            <div className="p-10 border border-dashed border-slate-200 dark:border-white/10 text-center text-slate-400 rounded-3xl">
              No active community groups found. Create one now to start a sub-community!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {groups.map(group => {
                const isMember = group.members?.includes(user?.id);
                const isPending = group.pendingRequests?.includes(user?.id);
                const isOwner = group.owner?._id === user?.id || group.owner === user?.id;

                return (
                  <div 
                    key={group._id} 
                    className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-3xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md hover:translate-y-[-1px] transition-all duration-300 text-left relative group"
                  >
                    {/* Cover Banner */}
                    <div className="h-28 bg-slate-100 dark:bg-slate-950 relative overflow-hidden flex items-center justify-center">
                      {group.coverImage ? (
                        <img src={group.coverImage} alt="Cover" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-blue/20 to-primary-cyan/20 flex items-center justify-center">
                          <FaUsers className="text-primary-blue/30" size={40} />
                        </div>
                      )}
                      
                      {/* Logo avatar floating */}
                      <div className="absolute bottom-3 left-4 w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 p-1 shadow-md overflow-hidden flex items-center justify-center">
                        {group.logo?.url ? (
                          <img src={group.logo.url} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <FaUsers className="text-slate-400" size={20} />
                        )}
                      </div>

                      <span className="absolute top-3 right-3 px-2 py-0.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-md text-[8px] font-black uppercase tracking-wider border border-slate-200/50 dark:border-white/5 flex items-center gap-1 text-slate-600 dark:text-slate-350">
                        {group.isPrivate ? <><FaLock size={8} /> Private</> : <><FaGlobe size={8} /> Public</>}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="p-5 flex-1 flex flex-col justify-between mt-1">
                      <div>
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="font-extrabold text-sm text-black dark:text-white group-hover:text-primary-blue transition-colors leading-snug">{group.name}</h3>
                            <span className="text-[9px] text-slate-400 font-extrabold block mt-0.5 uppercase tracking-wider">
                              Category: {group.category || 'General'}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-3 line-clamp-2">
                          {group.description}
                        </p>
                      </div>

                      <div className="flex justify-between items-center border-t border-slate-100 dark:border-white/5 pt-4 mt-5">
                        <span className="text-[10px] text-slate-550 font-bold uppercase tracking-wider">{group.members?.length || 0} Members</span>
                        
                        <div className="flex gap-2">
                          {(isMember || isOwner) && (
                            <button
                              onClick={() => handleOpenWorkspace(group)}
                              className="px-3.5 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-white rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer border border-slate-250 dark:border-white/5 transition-all"
                            >
                              Workspace
                            </button>
                          )}

                          {isOwner ? (
                            <span className="text-[9px] font-black uppercase tracking-wider text-amber-500 py-2 px-3 bg-amber-550/10 border border-amber-500/20 rounded-xl">Host</span>
                          ) : isMember ? (
                            <button
                              onClick={() => handleLeaveGroup(group._id)}
                              className="px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-all"
                            >
                              Leave
                            </button>
                          ) : (
                            <button
                              onClick={() => handleJoinRequest(group._id)}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer border transition-all ${
                                isPending
                                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                                  : 'bg-primary-blue border-primary-blue text-white hover:bg-accent-blue shadow-sm'
                              }`}
                              disabled={isPending}
                            >
                              {isPending ? 'Pending' : 'Join Board'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ─── DETAILED WORKSPACE VIEW ─── */}
      {activeGroup && (
        <div className="flex flex-col gap-6">
          
          {/* Back Action Bar */}
          <button
            onClick={() => { setActiveGroup(null); fetchGroups(); }}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-black dark:hover:text-white cursor-pointer w-fit"
          >
            <FaArrowLeft /> Back to Boards list
          </button>

          {/* Group Header card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm">
            <div className="h-44 bg-slate-100 dark:bg-slate-950 relative overflow-hidden">
              {activeGroup.coverImage ? (
                <img src={activeGroup.coverImage} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-primary-blue/30 to-primary-cyan/30" />
              )}
              
              {/* Logo avatar */}
              <div className="absolute -bottom-6 left-6 w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border-2 border-white dark:border-slate-800 shadow-md p-1 overflow-hidden flex items-center justify-center z-10">
                {activeGroup.logo?.url ? (
                  <img src={activeGroup.logo.url} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <FaUsers size={32} className="text-slate-400" />
                )}
              </div>
            </div>

            <div className="px-6 pt-10 pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4 text-left">
              <div>
                <h1 className="text-xl font-black font-title text-black dark:text-white flex items-center gap-2">
                  {activeGroup.name}
                  <span className="text-[10px] font-black bg-primary-blue/5 border border-primary-blue/15 text-primary-blue py-0.5 px-2 rounded-md uppercase tracking-wider">
                    {activeGroup.category || 'General'}
                  </span>
                </h1>
                <p className="text-xs text-slate-655 dark:text-slate-400 mt-2 max-w-xl font-medium">{activeGroup.description}</p>
                
                {/* tags */}
                {activeGroup.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {activeGroup.tags.map(t => (
                      <span key={t} className="text-[9px] font-extrabold text-slate-450 flex items-center gap-0.5 bg-slate-50 dark:bg-white/5 px-2 py-0.5 border border-slate-150 dark:border-transparent rounded">
                        <FaHashtag size={7} /> {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 shrink-0 text-slate-500 text-xs font-bold">
                <span>{activeGroup.members?.length || 0} members</span>
                {activeGroup.owner?._id === user?.id ? (
                  <span className="text-[9px] font-black uppercase text-amber-500 py-1.5 px-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">Owner Host</span>
                ) : (
                  <button
                    onClick={() => handleLeaveGroup(activeGroup._id)}
                    className="px-4 py-2 border border-red-500/20 text-red-500 rounded-xl hover:bg-red-500/10 cursor-pointer text-xs font-black uppercase tracking-wider"
                  >
                    Leave
                  </button>
                )}
              </div>
            </div>

            {/* Tab Navigators */}
            <div className="border-t border-slate-100 dark:border-white/5 px-6 flex overflow-x-auto gap-4">
              {[
                { id: 'feed', label: 'Discussions Feed', icon: <FaListAlt /> },
                { id: 'files', label: 'Group Uploads', icon: <FaUpload /> },
                { id: 'members', label: 'Member List', icon: <FaUsers /> },
                ...(activeGroup.owner?._id === user?.id || activeGroup.moderators?.includes(user?.id) || user?.role === 'Admin' 
                  ? [{ id: 'settings', label: 'Group Settings', icon: <FaCog /> }] 
                  : [])
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 text-xs font-black uppercase tracking-wider cursor-pointer border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-primary-blue text-primary-blue'
                      : 'border-transparent text-slate-450 hover:text-slate-700 dark:hover:text-white'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Workspaces */}
          <div className="text-left">
            {/* Feed tab */}
            {activeTab === 'feed' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-3xl p-8 shadow-sm flex flex-col gap-6 text-center">
                    <FaBookOpen size={40} className="text-slate-350 mx-auto" />
                    <div>
                      <h3 className="font-extrabold text-sm text-black dark:text-white">Workspace Feed Discussions</h3>
                      <p className="text-xs text-slate-450 mt-1 max-w-sm mx-auto leading-relaxed">
                        Use the main Feed Lounge to write and publish global posts tag-locked to this group category.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sidebar Details */}
                <div className="flex flex-col gap-6">
                  {/* Rules Card */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-3xl p-6 shadow-sm">
                    <h4 className="text-xs font-black uppercase text-slate-450 tracking-wider mb-4 border-b border-slate-100 dark:border-white/5 pb-3">Group Rules</h4>
                    {activeGroup.rules?.length > 0 ? (
                      <ol className="flex flex-col gap-3 text-xs text-slate-655 dark:text-slate-350 list-decimal pl-4 font-medium">
                        {activeGroup.rules.map((rule, idx) => (
                          <li key={idx} className="leading-relaxed">{rule}</li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-xs text-slate-450 font-bold text-center py-4">No rules listed by host.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Uploads/Files tab */}
            {activeTab === 'files' && (
              <div className="flex flex-col gap-6">
                {/* File Upload card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-3xl p-6 shadow-sm">
                  <h3 className="font-extrabold text-sm text-black dark:text-white border-b border-slate-100 dark:border-white/5 pb-3 mb-4">Upload File to Library</h3>
                  
                  <form onSubmit={handleFileUpload} className="flex flex-col gap-4">
                    <div className="border-2 border-dashed border-slate-250 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 relative">
                      <FaUpload size={24} className="text-slate-400 mb-2" />
                      <p className="text-xs text-slate-550 font-bold mb-3">Drag & drop or browse code file, zip, pdf, images...</p>
                      
                      <input 
                        type="file" 
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full"
                      />

                      {selectedFile && (
                        <div className="p-3 bg-primary-blue/5 border border-primary-blue/10 rounded-xl text-xs font-bold text-primary-blue">
                          Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={uploadingFile || !selectedFile}
                      className="px-6 py-3 bg-primary-blue hover:bg-accent-blue text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-md shadow-primary-blue/15 w-fit disabled:opacity-50"
                    >
                      {uploadingFile ? 'Uploading...' : 'Upload File'}
                    </button>
                  </form>
                </div>

                {/* Files List card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-3xl p-6 shadow-sm">
                  <h3 className="font-extrabold text-sm text-black dark:text-white border-b border-slate-100 dark:border-white/5 pb-3 mb-4">Group Shared Files</h3>

                  {(!activeGroup.uploads || activeGroup.uploads.length === 0) ? (
                    <div className="text-center py-10 text-slate-450 font-bold text-xs">No files uploaded in this group library yet.</div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {activeGroup.uploads.map((file, i) => (
                        <div 
                          key={i}
                          className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-150 dark:border-transparent text-left"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">
                              {getFileIcon(file.fileType)}
                            </span>
                            <div>
                              <p className="text-xs font-extrabold text-black dark:text-white line-clamp-1">{file.fileName}</p>
                              <p className="text-[9px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider">
                                size: {(file.fileSize / 1024 / 1024).toFixed(2)} MB • type: {file.fileType}
                              </p>
                            </div>
                          </div>

                          <a
                            href={file.fileUrl}
                            download={file.fileName}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 bg-white dark:bg-slate-900 text-slate-655 border border-slate-200 dark:border-white/5 rounded-xl hover:text-primary-blue hover:border-primary-blue transition-colors cursor-pointer"
                            title="Download File"
                          >
                            <FaDownload size={12} />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Members tab */}
            {activeTab === 'members' && (
              <div className="flex flex-col gap-6">
                {/* Pending Requests for Owners */}
                {(activeGroup.owner?._id === user?.id || user?.role === 'Admin') && activeGroup.pendingRequests?.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-3xl p-6 shadow-sm">
                    <h3 className="font-extrabold text-sm text-black dark:text-white border-b border-slate-100 dark:border-white/5 pb-3 mb-4 text-amber-500">
                      Pending Join Requests ({activeGroup.pendingRequests.length})
                    </h3>

                    <div className="flex flex-col gap-3">
                      {activeGroup.pendingRequests.map((reqUser) => {
                        const userId = reqUser._id || reqUser;
                        return (
                          <div key={userId} className="flex justify-between items-center p-3.5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-transparent">
                            <div className="flex items-center gap-3">
                              {reqUser.avatar?.url ? (
                                <img src={reqUser.avatar.url} alt="" className="w-8 h-8 rounded-full object-cover" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-slate-400">
                                  {reqUser.fullName?.charAt(0) || reqUser.username?.charAt(0) || '?'}
                                </div>
                              )}
                              <div>
                                <p className="text-xs font-black text-black dark:text-white">{reqUser.fullName || 'Anonymous User'}</p>
                                <p className="text-[10px] text-slate-400 font-bold">@{reqUser.username || 'unknown'}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleMemberAction('approve_join', userId)}
                                className="p-2 bg-emerald-500 text-white rounded-lg cursor-pointer hover:bg-emerald-600 transition-colors"
                                title="Approve"
                              >
                                <FaCheck size={10} />
                              </button>
                              <button
                                onClick={() => handleMemberAction('reject_join', userId)}
                                className="p-2 bg-red-500 text-white rounded-lg cursor-pointer hover:bg-red-600 transition-colors"
                                title="Reject"
                              >
                                <FaTimes size={10} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Member List */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-3xl p-6 shadow-sm">
                  <h3 className="font-extrabold text-sm text-black dark:text-white border-b border-slate-100 dark:border-white/5 pb-3 mb-4">Board Members</h3>

                  <div className="flex flex-col gap-3">
                    {/* Owner */}
                    <div className="flex justify-between items-center p-3.5 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                      <div className="flex items-center gap-3">
                        {activeGroup.owner?.avatar?.url ? (
                          <img src={activeGroup.owner.avatar.url} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-xs font-bold text-amber-500">
                            {activeGroup.owner?.fullName?.charAt(0) || '?'}
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-black text-black dark:text-white">{activeGroup.owner?.fullName || 'Host Admin'}</p>
                          <p className="text-[10px] text-slate-400 font-bold">@{activeGroup.owner?.username || 'owner'}</p>
                        </div>
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-wider text-amber-500 py-1 px-2 bg-amber-500/10 border border-amber-500/20 rounded-md">Creator</span>
                    </div>

                    {/* Moderators & Members */}
                    {(activeGroup.members || [])
                      .filter((member) => {
                        const memberId = member._id || member;
                        const ownerId = activeGroup.owner?._id || activeGroup.owner;
                        return memberId.toString() !== ownerId.toString();
                      })
                      .map((member) => {
                        const memberId = member._id || member;
                        const isMod = activeGroup.moderators?.some(mod => (mod._id || mod).toString() === memberId.toString());
                        const isOwner = activeGroup.owner?._id === user?.id;

                        return (
                          <div key={memberId} className="flex justify-between items-center p-3.5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-transparent">
                            <div className="flex items-center gap-3">
                              {member.avatar?.url ? (
                                <img src={member.avatar.url} alt="" className="w-8 h-8 rounded-full object-cover" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-slate-400">
                                  {member.fullName?.charAt(0) || member.username?.charAt(0) || '?'}
                                </div>
                              )}
                              <div>
                                <p className="text-xs font-black text-black dark:text-white">{member.fullName || 'Anonymous'}</p>
                                <p className="text-[10px] text-slate-450 font-bold">@{member.username || 'user'}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {isMod && (
                                <span className="text-[8px] font-black uppercase text-primary-blue py-1 px-2 bg-primary-blue/10 border border-primary-blue/20 rounded-md">Moderator</span>
                              )}
                              
                              {isOwner && (
                                <>
                                  <button
                                    onClick={() => handleMemberAction(isMod ? 'remove_mod' : 'make_mod', memberId)}
                                    className="p-2.5 bg-white dark:bg-slate-900 text-slate-655 border border-slate-200 dark:border-white/5 rounded-xl hover:text-primary-blue cursor-pointer text-[10px] font-extrabold flex items-center gap-1.5"
                                  >
                                    <FaUserShield /> {isMod ? 'Demote' : 'Promote'}
                                  </button>
                                  <button
                                    onClick={() => handleMemberAction('remove_member', memberId)}
                                    className="p-2.5 bg-white dark:bg-slate-900 border border-red-500/15 text-red-500 rounded-xl hover:bg-red-500/5 cursor-pointer text-[10px] font-extrabold flex items-center gap-1.5"
                                  >
                                    <FaUserMinus /> Kick
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {/* Settings/Edit Tab */}
            {activeTab === 'settings' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-3xl p-6 shadow-sm">
                <h3 className="font-extrabold text-sm text-black dark:text-white border-b border-slate-100 dark:border-white/5 pb-3 mb-4">Edit Group Settings</h3>
                
                <form onSubmit={handleUpdateGroupSettings} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Group Title</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-xs transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category Lounge</label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-xs cursor-pointer"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Group Logo Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleLogoUpload(e, true)}
                        className="w-full text-xs text-slate-500 border border-slate-250 dark:border-white/5 p-2 rounded-xl"
                      />
                      {editLogoUrl && (
                        <img src={editLogoUrl} alt="Logo Preview" className="w-10 h-10 object-cover rounded-lg border border-slate-250 mt-1" />
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Group Cover Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleCoverUpload(e, true)}
                        className="w-full text-xs text-slate-500 border border-slate-250 dark:border-white/5 p-2 rounded-xl"
                      />
                      {editCoverImage && (
                        <img src={editCoverImage} alt="Cover Preview" className="w-20 h-10 object-cover rounded-lg border border-slate-250 mt-1" />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tags (Comma-separated)</label>
                      <input
                        type="text"
                        value={editTags}
                        onChange={(e) => setEditTags(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-xs"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visibility Preferences</label>
                      <div className="flex items-center gap-4 mt-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-350 cursor-pointer">
                          <input
                            type="radio"
                            name="edit_visibility"
                            checked={!editIsPrivate}
                            onChange={() => setEditIsPrivate(false)}
                          />
                          Public (Open)
                        </label>
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-350 cursor-pointer">
                          <input
                            type="radio"
                            name="edit_visibility"
                            checked={editIsPrivate}
                            onChange={() => setEditIsPrivate(true)}
                          />
                          Private (Approval)
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Group Description</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      required
                      rows={2}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-xs transition-colors resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Group Rules (One rule per line)</label>
                    <textarea
                      value={editRules}
                      onChange={(e) => setEditRules(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-xs transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={updatingGroup}
                    className="w-fit px-8 py-3 bg-primary-blue hover:bg-accent-blue text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {updatingGroup ? 'Saving...' : 'Save Settings'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default CommunityGroups;
