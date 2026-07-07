import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { 
  FaUsers, FaPlus, FaLock, FaGlobe, FaArrowLeft, FaFileAlt, 
  FaFileImage, FaFileVideo, FaFilePdf, FaFileArchive, FaFileCode, 
  FaUpload, FaDownload, FaCog, FaUserShield, FaUserTimes, FaCheck, FaTimes, 
  FaLockOpen, FaBookOpen, FaUserMinus, FaUserPlus, FaHashtag, FaListAlt,
  FaImage, FaVideo, FaComment, FaBookmark, FaRegBookmark, FaRegHeart, FaHeart, FaPaperPlane, FaSpinner
} from 'react-icons/fa';

const CATEGORIES = ['General', 'React', 'Node.js', 'Design', 'Web3', 'AI/ML', 'DevOps', 'Mobile'];

const CommunityGroups = () => {
  const { user } = useAuth();
  const currentUserId = user?._id || user?.id;
  
  const { groupId } = useParams();
  const navigate = useNavigate();
  
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
  const [boardsTab, setBoardsTab] = useState('explore');

  // Group Posts Feed States
  const [groupPosts, setGroupPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postMediaUrl, setPostMediaUrl] = useState('');
  const [postMediaType, setPostMediaType] = useState('none');
  const [postUploading, setPostUploading] = useState(false);
  const [postAttachedFileName, setPostAttachedFileName] = useState('');
  const [groupCommentInputs, setGroupCommentInputs] = useState({});
  const [groupComments, setGroupComments] = useState({});
  const [groupShowComments, setGroupShowComments] = useState({});

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

  const fetchGroupPosts = async (groupId) => {
    setLoadingPosts(true);
    try {
      const res = await api.getCommunityPosts({ group: groupId });
      if (res.success) {
        setGroupPosts(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load group posts:', err.message);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleGroupPostMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';
      videoElement.src = URL.createObjectURL(file);
      videoElement.onloadedmetadata = async () => {
        URL.revokeObjectURL(videoElement.src);
        if (videoElement.duration > 60) {
          alert('Video duration must be under 1 minute.');
          e.target.value = '';
          return;
        }
        await proceedWithGroupPostUpload(file);
      };
      return;
    }

    await proceedWithGroupPostUpload(file);
  };

  const proceedWithGroupPostUpload = async (file) => {
    setPostUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.uploadCommunityImage(formData);
      if (res.success) {
        setPostMediaUrl(res.url);
        setPostAttachedFileName(file.name);
        if (file.type.startsWith('video/')) {
          setPostMediaType('video');
        } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
          setPostMediaType('pdf');
        } else {
          setPostMediaType('image');
        }
      }
    } catch (err) {
      alert('Media upload failed: ' + err.message);
    } finally {
      setPostUploading(false);
    }
  };

  const handleGroupPostSubmit = async (e) => {
    e.preventDefault();
    if (!postContent.trim() || !activeGroup) return;

    try {
      const title = postContent.split('\n')[0].substring(0, 80) + '...';
      const res = await api.createCommunityPost({
        title,
        content: postContent,
        mediaUrl: postMediaUrl,
        mediaType: postMediaType,
        group: activeGroup._id,
        category: activeGroup.category || 'General',
        tags: []
      });
      if (res.success) {
        setGroupPosts(prev => [res.data, ...prev]);
        setPostContent('');
        setPostMediaUrl('');
        setPostMediaType('none');
        setPostAttachedFileName('');
      }
    } catch (err) {
      alert('Failed to submit post: ' + err.message);
    }
  };

  const handleGroupPostReaction = async (postId) => {
    try {
      const res = await api.reactToCommunityPost(postId, 'Like');
      if (res.success) {
        setGroupPosts(prev => prev.map(p => p._id === postId ? { ...p, reactions: res.data } : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGroupPostDelete = async (postId) => {
    if (!window.confirm('Delete this post permanently?')) return;
    try {
      const res = await api.deleteCommunityPost(postId);
      if (res.success) {
        setGroupPosts(prev => prev.filter(p => p._id !== postId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleGroupComments = async (postId) => {
    const nextState = !groupShowComments[postId];
    setGroupShowComments(prev => ({ ...prev, [postId]: nextState }));
    
    if (nextState && !groupComments[postId]) {
      try {
        const res = await api.getCommunityComments(postId);
        if (res.success) {
          setGroupComments(prev => ({ ...prev, [postId]: res.data || [] }));
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAddGroupComment = async (e, postId) => {
    e.preventDefault();
    const text = groupCommentInputs[postId];
    if (!text || !text.trim()) return;

    try {
      const res = await api.addCommunityComment(postId, text.trim());
      if (res.success) {
        setGroupComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), res.data]
        }));
        setGroupCommentInputs(prev => ({ ...prev, [postId]: '' }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGroupComment = async (postId, commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      const res = await api.deleteCommunityComment(commentId);
      if (res.success) {
        setGroupComments(prev => ({
          ...prev,
          [postId]: (prev[postId] || []).filter(c => c._id !== commentId)
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (groupId && groups.length > 0) {
      const selected = groups.find(g => g._id === groupId);
      if (selected) {
        handleOpenWorkspace(selected);
      } else {
        const loadGroup = async () => {
          try {
            const res = await api.getCommunityGroupDetails(groupId);
            if (res.success) {
              handleOpenWorkspace(res.data);
            }
          } catch (err) {
            console.error('Failed to load deep-linked group:', err);
            navigate('/community/groups');
          }
        };
        loadGroup();
      }
    } else if (!groupId) {
      setActiveGroup(null);
    }
  }, [groupId, groups]);

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

  const handleJoinGroup = async (groupId) => {
    try {
      const res = await api.joinLeaveCommunityGroup(groupId);
      if (res.success) {
        alert(res.message || 'Joined group successfully');
        fetchGroups();
      }
    } catch (err) {
      alert(err.message || 'Failed to join group.');
    }
  };

  const handleLeaveGroup = async (groupId) => {
    try {
      const res = await api.joinLeaveCommunityGroup(groupId);
      if (res.success) {
        alert(res.message || 'Left group successfully');
        fetchGroups();
      }
    } catch (err) {
      alert(err.message || 'Failed to leave group.');
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
    fetchGroupPosts(group._id);
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
          {/* Tabs */}
          <div className="flex gap-2 border-b border-slate-100 dark:border-white/5 pb-4 mt-6">
            <button
              onClick={() => setBoardsTab('explore')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                boardsTab === 'explore' 
                  ? 'bg-primary-blue text-white shadow-md shadow-primary-blue/15' 
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              Explore Boards ({groups.filter(g => !g.members?.some(m => (m._id || m) === currentUserId) && g.owner?._id !== currentUserId && g.owner !== currentUserId).length})
            </button>
            <button
              onClick={() => setBoardsTab('joined')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                boardsTab === 'joined' 
                  ? 'bg-primary-blue text-white shadow-md shadow-primary-blue/15' 
                  : 'text-slate-550 hover:bg-slate-555 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-355'
              }`}
            >
              Joined Boards ({groups.filter(g => g.members?.some(m => (m._id || m) === currentUserId) && g.owner?._id !== currentUserId && g.owner !== currentUserId).length})
            </button>
            <button
              onClick={() => setBoardsTab('mine')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                boardsTab === 'mine' 
                  ? 'bg-primary-blue text-white shadow-md shadow-primary-blue/15' 
                  : 'text-slate-555 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              My Created Boards ({groups.filter(g => g.owner?._id === currentUserId || g.owner === currentUserId).length})
            </button>
          </div>

          {/* Cards Deck */}
          {loading ? (
            <div className="p-10 text-center text-slate-400 font-bold uppercase tracking-wider">Loading boards...</div>
          ) : (() => {
            const filtered = groups.filter(group => {
              const isGrpOwner = group.owner?._id === currentUserId || group.owner === currentUserId;
              const isGrpMember = group.members?.some(m => (m._id || m) === currentUserId);
              
              if (boardsTab === 'mine') return isGrpOwner;
              if (boardsTab === 'joined') return isGrpMember && !isGrpOwner;
              return !isGrpOwner && !isGrpMember;
            });

            if (filtered.length === 0) {
              return (
                <div className="p-10 border border-dashed border-slate-200 dark:border-white/10 text-center text-slate-400 rounded-3xl mt-4">
                  {boardsTab === 'mine' && "You haven't created any boards yet. Click 'Create Group' above to start one!"}
                  {boardsTab === 'joined' && "You haven't joined any boards yet. Explore the boards and join some!"}
                  {boardsTab === 'explore' && "No new boards to explore right now."}
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {filtered.map(group => {
                  const isMember = group.members?.some(m => (m._id || m) === currentUserId);
                  const isOwner = group.owner?._id === currentUserId || group.owner === currentUserId;

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
                                onClick={() => navigate(`/community/groups/${group._id}`)}
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
                                onClick={() => handleJoinGroup(group._id)}
                                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer border border-primary-blue bg-primary-blue text-white hover:bg-accent-blue shadow-sm transition-all"
                              >
                                Join Board
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </>
      )}

      {/* ─── DETAILED WORKSPACE VIEW ─── */}
      {activeGroup && (
        <div className="flex flex-col gap-6">
          
          {/* Back Action Bar */}
          <button
            onClick={() => navigate('/community/groups')}
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
                {activeGroup.owner?._id === currentUserId ? (
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
                ...(activeGroup.owner?._id === currentUserId || activeGroup.moderators?.includes(currentUserId) || user?.role === 'Admin' 
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
                  {/* Post Creator Box */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 p-5 rounded-3xl flex flex-col gap-4 shadow-sm">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#1c1c24] shrink-0 flex items-center justify-center border border-white/10">
                        {user?.avatar?.url ? (
                          <img src={user.avatar.url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-slate-400 text-xs">👤</span>
                        )}
                      </div>
                      <textarea
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        placeholder="Share something with this group..."
                        rows={2}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 text-xs text-black dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-550 transition-all resize-none leading-relaxed"
                      />
                    </div>

                    {/* Media Attach Preview */}
                    {postMediaUrl && (
                      <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-[#181820] max-h-[220px]">
                        <button
                          onClick={() => { setPostMediaUrl(''); setPostMediaType('none'); setPostAttachedFileName(''); }}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-white rounded text-[10px]"
                        >
                          ×
                        </button>
                        {postMediaType === 'image' && <img src={postMediaUrl} alt="Preview" className="w-full h-full object-contain max-h-[220px]" />}
                        {postMediaType === 'video' && <video src={postMediaUrl} controls className="w-full h-full max-h-[220px]" />}
                        {postMediaType === 'pdf' && (
                          <div className="p-3 flex items-center gap-2 text-xs">
                            <FaFilePdf size={16} className="text-red-500" />
                            <span className="font-bold text-white">{postAttachedFileName || 'Attachment.pdf'}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center border-t border-slate-100 dark:border-white/5 pt-3">
                      <div className="flex items-center gap-2">
                        <label className="p-2 bg-slate-50 dark:bg-[#1c1c24] hover:bg-slate-100 dark:hover:bg-[#252530] text-purple-400 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider border border-slate-100 dark:border-white/5">
                          <FaImage size={10} /> Image
                          <input type="file" accept="image/*" onChange={handleGroupPostMediaUpload} className="hidden" />
                        </label>
                        <label className="p-2 bg-slate-50 dark:bg-[#1c1c24] hover:bg-slate-100 dark:hover:bg-[#252530] text-purple-400 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider border border-slate-100 dark:border-white/5">
                          <FaVideo size={10} /> Video
                          <input type="file" accept="video/*" onChange={handleGroupPostMediaUpload} className="hidden" />
                        </label>
                        <label className="p-2 bg-slate-50 dark:bg-[#1c1c24] hover:bg-slate-100 dark:hover:bg-[#252530] text-purple-400 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider border border-slate-100 dark:border-white/5">
                          <FaFilePdf size={10} /> PDF
                          <input type="file" accept="application/pdf" onChange={handleGroupPostMediaUpload} className="hidden" />
                        </label>
                      </div>

                      <button
                        onClick={handleGroupPostSubmit}
                        disabled={!postContent.trim() || postUploading}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md cursor-pointer transition-colors"
                      >
                        {postUploading ? 'Uploading...' : 'Post'}
                      </button>
                    </div>
                  </div>

                  {/* Group Feed List */}
                  <div className="flex flex-col gap-4">
                    {loadingPosts ? (
                      <div className="p-8 flex justify-center bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-3xl">
                        <FaSpinner className="animate-spin text-purple-500" size={16} />
                      </div>
                    ) : groupPosts.length === 0 ? (
                      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-3xl p-8 text-center text-xs text-slate-450 font-bold italic">
                        No discussion threads started yet in this group feed. Write the first post!
                      </div>
                    ) : (
                      groupPosts.map(post => {
                        const currentUserId = user?.id || user?._id;
                        const hasReacted = (post.reactions || []).some(r => r.user === currentUserId);
                        const isPostAuthor = post.author?._id === currentUserId || post.author === currentUserId;

                        return (
                          <div
                            key={post._id}
                            className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 p-5 rounded-3xl flex flex-col gap-3.5 shadow-sm"
                          >
                            {/* Author info */}
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2 text-left">
                                <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#1c1c24] border border-white/5 flex items-center justify-center shrink-0">
                                  {post.author?.avatar?.url ? (
                                    <img src={post.author.avatar.url} alt="Profile" className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-slate-400 text-xs">👤</span>
                                  )}
                                </div>
                                <div className="text-left">
                                  <span className="text-xs font-black text-black dark:text-white block">{post.author?.fullName || 'Community Member'}</span>
                                  <span className="text-[9px] text-slate-500 block mt-0.5">@{post.author?.username || 'member'}</span>
                                </div>
                              </div>

                              {isPostAuthor && (
                                <button
                                  onClick={() => handleGroupPostDelete(post._id)}
                                  className="p-1 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded text-lg font-bold"
                                >
                                  ×
                                </button>
                              )}
                            </div>

                            {/* Content */}
                            <p className="text-xs text-slate-700 dark:text-slate-250 leading-relaxed whitespace-pre-wrap text-left">
                              {post.content}
                            </p>

                            {/* Attachment Media if present */}
                            {post.mediaUrl && (
                              <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-white/5 bg-[#181820] max-h-[300px] w-full flex items-center justify-center">
                                {post.mediaType === 'image' && <img src={post.mediaUrl} alt="post media" className="w-full h-full object-cover max-h-[300px]" />}
                                {post.mediaType === 'video' && <video src={post.mediaUrl} controls className="w-full h-full max-h-[300px]" />}
                                {post.mediaType === 'pdf' && (
                                  <div className="w-full p-4 flex items-center justify-between bg-slate-900/50 rounded-2xl border border-white/5 m-3">
                                    <div className="flex items-center gap-2">
                                      <FaFilePdf className="text-red-400" size={24} />
                                      <div className="text-left">
                                        <span className="text-xs font-black text-white block">Document Attachment</span>
                                        <span className="text-[9px] text-slate-500 block">PDF File</span>
                                      </div>
                                    </div>
                                    <a
                                      href={post.mediaUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors"
                                    >
                                      View / Download
                                    </a>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Counters */}
                            <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold border-t border-slate-100 dark:border-white/5 pt-2">
                              <span>{post.reactions?.length || 0} Likes</span>
                              <span>{groupComments[post._id]?.length || 0} Comments</span>
                            </div>

                            {/* Action buttons */}
                            <div className="grid grid-cols-2 border-t border-slate-100 dark:border-white/5 pt-1.5 text-[10px] font-black uppercase text-slate-450">
                              <button
                                onClick={() => handleGroupPostReaction(post._id)}
                                className={`py-1.5 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
                                  hasReacted ? 'text-purple-400' : ''
                                }`}
                              >
                                👍 Like
                              </button>
                              <button
                                onClick={() => toggleGroupComments(post._id)}
                                className="py-1.5 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                              >
                                💬 Comment
                              </button>
                            </div>

                            {/* Comment drawer */}
                            {groupShowComments[post._id] && (
                              <div className="border-t border-slate-100 dark:border-white/5 pt-3 flex flex-col gap-3">
                                <form onSubmit={(e) => handleAddGroupComment(e, post._id)} className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="Write a comment..."
                                    value={groupCommentInputs[post._id] || ''}
                                    onChange={(e) => setGroupCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#1c1c24] border border-slate-200 dark:border-white/5 text-[11px] text-black dark:text-white focus:outline-none"
                                  />
                                  <button type="submit" className="p-2 bg-purple-650 hover:bg-purple-700 text-white rounded-lg">
                                    <FaPaperPlane size={9} />
                                  </button>
                                </form>

                                <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto pr-1">
                                  {(groupComments[post._id] || []).map(comment => (
                                    <div key={comment._id} className="p-2 bg-slate-50 dark:bg-white/5 rounded-xl flex justify-between items-start text-left">
                                      <div className="flex items-start gap-2 text-left">
                                        <div className="w-6 h-6 rounded-md overflow-hidden bg-[#1c1c24] flex items-center justify-center shrink-0 border border-white/5">
                                          {comment.author?.avatar?.url ? (
                                            <img src={comment.author.avatar.url} alt="Profile" className="w-full h-full object-cover" />
                                          ) : (
                                            <span className="text-[10px]">👤</span>
                                          )}
                                        </div>
                                        <div className="text-left">
                                          <span className="text-[10px] font-black text-black dark:text-white block">{comment.author?.fullName || 'Member'}</span>
                                          <p className="text-[10px] text-slate-700 dark:text-slate-350 leading-relaxed mt-0.5">{comment.content}</p>
                                        </div>
                                      </div>
                                      
                                      {(comment.author?._id === currentUserId || comment.author === currentUserId) && (
                                        <button
                                          onClick={() => handleDeleteGroupComment(post._id, comment._id)}
                                          className="text-red-400 hover:text-red-500 text-[10px] font-bold"
                                        >
                                          Delete
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          </div>
                        );
                      })
                    )}
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
                        const isOwner = activeGroup.owner?._id === currentUserId;

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
