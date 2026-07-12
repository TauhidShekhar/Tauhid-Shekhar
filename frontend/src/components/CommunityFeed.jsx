import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import socket from '../services/socket';
import { 
  FaRegHeart, FaHeart, FaComment, FaBookmark, FaRegBookmark, 
  FaShareAlt, FaPlus, FaImage, FaPaperclip, FaTags, FaFilter, 
  FaRegSmile, FaCheckCircle, FaThumbtack, FaTrash, FaPlusCircle,
  FaFilePdf, FaVideo, FaPoll, FaRegComments, FaGlobe, FaChevronRight, FaGithub, FaPaperPlane, FaEdit, FaUser
} from 'react-icons/fa';

const CommunityFeed = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const searchUrlQuery = searchParams.get('search') || '';
  
  // Feed states
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState(searchUrlQuery);
  const [activeTagsFilter, setActiveTagsFilter] = useState('');
  
  // Post Creator states
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [localPreviewUrl, setLocalPreviewUrl] = useState('');
  const [mediaType, setMediaType] = useState('none');
  const [category, setCategory] = useState('General');
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);
  
  // Post Draft States & Effects
  useEffect(() => {
    try {
      const saved = localStorage.getItem('portfolio_post_draft');
      if (saved) setContent(saved);
    } catch (_) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('portfolio_post_draft', content);
    } catch (_) {}
  }, [content]);

  // Poll Creator States
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  
  // Comment states
  const [commentInputs, setCommentInputs] = useState({}); // { postId: text }
  const [comments, setComments] = useState({}); // { postId: [comment] }
  const [showComments, setShowComments] = useState({}); // { postId: Boolean }

  // Reply states
  const [replyInputs, setReplyInputs] = useState({}); // { commentId: text }
  const [activeReplyBox, setActiveReplyBox] = useState(null); // commentId

  // Editing states
  const [editingPostId, setEditingPostId] = useState(null);
  const [editPostContent, setEditPostContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState('');

  const categories = ['All', 'General', 'Tutorials', 'Project Showcase', 'Questions', 'Announcements'];

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeCategory !== 'All') params.category = activeCategory;
      if (searchQuery || searchUrlQuery) params.search = searchQuery || searchUrlQuery;
      if (activeTagsFilter) params.tag = activeTagsFilter;
      
      const res = await api.getCommunityPosts(params);
      if (res.success) {
        setPosts(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [activeCategory, activeTagsFilter, searchUrlQuery]);

  // Real-time socket event synchronization for community feed
  useEffect(() => {
    socket.on('post_change', (data) => {
      if (data.action === 'create') {
        setPosts(prev => {
          if (prev.some(p => p._id === data.data._id)) return prev;
          // Prepend new posts matching the selected category
          if (activeCategory !== 'All' && data.data.category !== activeCategory) return prev;
          return [data.data, ...prev];
        });
      } else if (data.action === 'update') {
        setPosts(prev => prev.map(p => p._id === data.data._id ? data.data : p));
      } else if (data.action === 'delete') {
        setPosts(prev => prev.filter(p => p._id !== data.postId));
      } else if (data.action === 'react') {
        setPosts(prev => prev.map(p => {
          if (p._id === data.postId) {
            return { ...p, reactions: data.reactions };
          }
          return p;
        }));
      }
    });

    return () => {
      socket.off('post_change');
    };
  }, [activeCategory]);

  const [attachedFileName, setAttachedFileName] = useState('');

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Enforce video duration limits under 60 seconds (1 minute)
    if (file.type.startsWith('video/')) {
      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';
      videoElement.src = URL.createObjectURL(file);
      videoElement.onloadedmetadata = async () => {
        URL.revokeObjectURL(videoElement.src);
        if (videoElement.duration > 60) {
          alert('Video duration must be under 1 minute.');
          e.target.value = ''; // Reset file input
          return;
        }
        await proceedWithUpload(file);
      };
      return;
    }

    await proceedWithUpload(file);
  };

  const proceedWithUpload = async (file) => {
    const objectUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(objectUrl);
    setAttachedFileName(file.name);
    if (file.type.startsWith('video/')) {
      setMediaType('video');
    } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      setMediaType('pdf');
    } else {
      setMediaType('image');
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.uploadCommunityImage(formData);
      if (res.success) {
        setMediaUrl(res.url);
      } else {
        alert('Media upload failed.');
        setLocalPreviewUrl('');
        setMediaType('none');
      }
    } catch (err) {
      alert('Media upload failed: ' + err.message);
      setLocalPreviewUrl('');
      setMediaType('none');
    } finally {
      setUploading(false);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
    const generatedTitle = content.split('\n')[0].substring(0, 80) + '...';

    const pollData = showPollCreator && pollQuestion.trim() && pollOptions.filter(o => o.trim()).length >= 2
      ? {
          question: pollQuestion.trim(),
          options: pollOptions.filter(o => o.trim()).map(optText => ({ optionText: optText, votes: [] }))
        }
      : null;

    const tempId = 'temp-post-' + Date.now();
    const tempPost = {
      _id: tempId,
      title: generatedTitle,
      content,
      mediaUrl: localPreviewUrl || mediaUrl,
      mediaType,
      category,
      tags: tagsArray,
      postType: pollData ? 'poll' : (mediaType !== 'none' ? mediaType : 'text'),
      poll: pollData ? {
        question: pollData.question,
        options: pollData.options.map((o, idx) => ({ _id: `temp-opt-${idx}`, optionText: o.optionText, votes: [] }))
      } : null,
      author: {
        _id: user.id || user._id,
        fullName: user.fullName,
        username: user.username,
        avatar: user.avatar
      },
      createdAt: new Date().toISOString(),
      reactions: [],
      commentsCount: 0,
      bookmarks: []
    };

    const backupContent = content;
    const backupTags = tags;
    const backupMediaUrl = mediaUrl;
    const backupLocalUrl = localPreviewUrl;
    const backupMediaType = mediaType;
    const backupShowPoll = showPollCreator;
    const backupPollQ = pollQuestion;
    const backupPollOpts = pollOptions;

    // Optimistically insert tempPost and clear inputs
    setPosts(prev => [tempPost, ...prev]);
    setContent('');
    setMediaUrl('');
    setLocalPreviewUrl('');
    setMediaType('none');
    setTags('');
    setShowPollCreator(false);
    setPollQuestion('');
    setPollOptions(['', '']);

    try {
      localStorage.removeItem('portfolio_post_draft');
    } catch (_) {}

    try {
      const res = await api.createCommunityPost({
        title: generatedTitle,
        content: backupContent,
        mediaUrl: backupMediaUrl,
        mediaType: backupMediaType,
        category,
        tags: tagsArray,
        postType: tempPost.postType,
        poll: pollData
      });

      if (res.success) {
        // Swap temp post with actual response
        setPosts(prev => prev.map(p => p._id === tempId ? res.data : p));
      } else {
        // Revert
        setPosts(prev => prev.filter(p => p._id !== tempId));
        setContent(backupContent);
        setTags(backupTags);
        setMediaUrl(backupMediaUrl);
        setLocalPreviewUrl(backupLocalUrl);
        setMediaType(backupMediaType);
        setShowPollCreator(backupShowPoll);
        setPollQuestion(backupPollQ);
        setPollOptions(backupPollOpts);
        alert('Post creation failed.');
      }
    } catch (err) {
      // Revert
      setPosts(prev => prev.filter(p => p._id !== tempId));
      setContent(backupContent);
      setTags(backupTags);
      setMediaUrl(backupMediaUrl);
      setLocalPreviewUrl(backupLocalUrl);
      setMediaType(backupMediaType);
      setShowPollCreator(backupShowPoll);
      setPollQuestion(backupPollQ);
      setPollOptions(backupPollOpts);
      alert('Post creation failed: ' + err.message);
    }
  };

  const handleVotePoll = async (postId, optionId) => {
    if (!user) {
      alert('Please log in to vote on polls.');
      return;
    }
    try {
      const res = await api.votePollOption(postId, optionId);
      if (res.success) {
        setPosts(prev => prev.map(p => p._id === postId ? res.data : p));
      }
    } catch (err) {
      alert('Voting failed: ' + err.message);
    }
  };

  const handleReaction = async (postId, type) => {
    if (!user) {
      alert('Please log in to react to posts.');
      return;
    }
    const currentUserId = user?.id || user?._id;
    let originalPosts;
    setPosts(prev => {
      originalPosts = prev;
      return prev.map(p => {
        if (p._id === postId) {
          const list = p.reactions || [];
          const exists = list.some(r => (r.user?._id || r.user || '').toString() === currentUserId.toString());
          let newReactions;
          if (exists) {
            newReactions = list.filter(r => (r.user?._id || r.user || '').toString() !== currentUserId.toString());
          } else {
            newReactions = [...list, { user: { _id: currentUserId, fullName: user.fullName, username: user.username, avatar: user.avatar }, type }];
          }
          return { ...p, reactions: newReactions };
        }
        return p;
      });
    });

    try {
      const res = await api.reactToCommunityPost(postId, type);
      if (res.success) {
        setPosts(prev => prev.map(p => p._id === postId ? { ...p, reactions: res.data } : p));
      } else {
        if (originalPosts) setPosts(originalPosts);
      }
    } catch (err) {
      console.error(err);
      if (originalPosts) setPosts(originalPosts);
    }
  };

  const handleBookmark = async (postId) => {
    if (!user) {
      alert('Please log in to bookmark posts.');
      return;
    }
    const currentUserId = user?.id || user?._id;
    let originalPosts;
    setPosts(prev => {
      originalPosts = prev;
      return prev.map(p => {
        if (p._id === postId) {
          const list = p.bookmarks || [];
          const exists = list.indexOf(currentUserId);
          let newBookmarks;
          if (exists === -1) {
            newBookmarks = [...list, currentUserId];
          } else {
            newBookmarks = list.filter(id => id !== currentUserId);
          }
          return { ...p, bookmarks: newBookmarks };
        }
        return p;
      });
    });

    try {
      const res = await api.bookmarkCommunityPost(postId);
      if (!res.success) {
        if (originalPosts) setPosts(originalPosts);
      }
    } catch (err) {
      console.error(err);
      if (originalPosts) setPosts(originalPosts);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this post permanently?')) return;
    try {
      const res = await api.deleteCommunityPost(postId);
      if (res.success) {
        setPosts(prev => prev.filter(p => p._id !== postId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Comments handlers
  const toggleComments = async (postId) => {
    const nextState = !showComments[postId];
    setShowComments(prev => ({ ...prev, [postId]: nextState }));
    
    if (nextState && !comments[postId]) {
      try {
        const res = await api.getCommunityComments(postId);
        if (res.success) {
          setComments(prev => ({ ...prev, [postId]: res.data || [] }));
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to comment.');
      return;
    }
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    const tempId = 'temp-' + Date.now();
    const tempComment = {
      _id: tempId,
      content: text.trim(),
      author: {
        _id: user.id || user._id,
        fullName: user.fullName,
        username: user.username,
        avatar: user.avatar
      },
      createdAt: new Date().toISOString(),
      replies: []
    };

    let originalComments;
    setComments(prev => {
      originalComments = prev;
      return {
        ...prev,
        [postId]: [...(prev[postId] || []), tempComment]
      };
    });
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));

    try {
      const res = await api.addCommunityComment(postId, text.trim());
      if (res.success) {
        setComments(prev => ({
          ...prev,
          [postId]: (prev[postId] || []).map(c => c._id === tempId ? res.data : c)
        }));
      } else {
        if (originalComments) setComments(originalComments);
        setCommentInputs(prev => ({ ...prev, [postId]: text }));
      }
    } catch (err) {
      console.error(err);
      if (originalComments) setComments(originalComments);
      setCommentInputs(prev => ({ ...prev, [postId]: text }));
    }
  };

  const handleAddReply = async (e, postId, parentCommentId) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to reply.');
      return;
    }
    const text = replyInputs[parentCommentId];
    if (!text || !text.trim()) return;

    try {
      const res = await api.addCommunityComment(postId, text.trim(), parentCommentId);
      if (res.success) {
        setComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), res.data]
        }));
        setReplyInputs(prev => ({ ...prev, [parentCommentId]: '' }));
        setActiveReplyBox(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      const res = await api.deleteCommunityComment(commentId);
      if (res.success) {
        setComments(prev => ({
          ...prev,
          [postId]: (prev[postId] || []).filter(c => c._id !== commentId)
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePost = async (postId) => {
    if (!editPostContent.trim()) return;
    try {
      const res = await api.updateCommunityPost(postId, { content: editPostContent });
      if (res.success) {
        setPosts(prev => prev.map(p => p._id === postId ? { ...p, content: editPostContent } : p));
        setEditingPostId(null);
        setEditPostContent('');
      }
    } catch (err) {
      alert('Failed to update post: ' + err.message);
    }
  };

  const handleUpdateComment = async (postId, commentId) => {
    if (!editCommentContent.trim()) return;
    try {
      const res = await api.updateCommunityComment(commentId, editCommentContent);
      if (res.success) {
        setComments(prev => ({
          ...prev,
          [postId]: (prev[postId] || []).map(c => c._id === commentId ? { ...c, content: editCommentContent } : c)
        }));
        setEditingCommentId(null);
        setEditCommentContent('');
      }
    } catch (err) {
      alert('Failed to update comment: ' + err.message);
    }
  };

  // Helper to format timestamps
  const getRelativeTime = (dateStr) => {
    const elapsed = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(elapsed / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);

    if (mins < 60) return `${Math.max(1, mins)}m`;
    if (hrs < 24) return `${hrs}h`;
    return `${days}d`;
  };

  return (
    <div className="flex flex-col gap-6 w-full text-left">
      
      {/* Top Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/60 to-indigo-900/40 border border-purple-500/20 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />

        <div className="z-10 text-left">
          <h2 className="text-xl md:text-2xl font-black text-white font-title tracking-tight leading-tight">
            Build Projects, Learn Together
          </h2>
          <p className="text-xs md:text-sm text-slate-350 mt-1 max-w-md font-medium leading-relaxed">
            Join coding challenges, resolve doubts, and unlock rewards with other developers.
          </p>
        </div>

        <div className="z-10 flex flex-wrap gap-4 sm:gap-6 shrink-0">
          <div className="px-4 py-2.5 rounded-2xl bg-[#121217]/60 border border-white/5 flex flex-col items-start min-w-[90px]">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Members</span>
            <span className="text-base font-black text-white mt-0.5">4.5K</span>
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-[#121217]/60 border border-white/5 flex flex-col items-start min-w-[90px]">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active</span>
            <span className="text-base font-black text-white mt-0.5">250+</span>
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-[#121217]/60 border border-white/5 flex flex-col items-start min-w-[90px]">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rewards</span>
            <span className="text-base font-black text-purple-400 mt-0.5">$500+</span>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Header */}
      <div className="bg-[#121217] border border-white/5 p-4 rounded-3xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-none py-1.5">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`whitespace-nowrap flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeCategory === c 
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/15' 
                  : 'bg-[#1c1c24] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        
        {searchUrlQuery && (
          <button 
            onClick={() => navigate('/community')}
            className="text-[10px] font-black uppercase text-purple-400 hover:underline shrink-0"
          >
            Clear Search Filter
          </button>
        )}
      </div>

      {/* LinkedIn/Facebook styled "Create Post" Card */}
      {user && (
        <div className="bg-[#121217] border border-white/5 p-5 rounded-3xl flex flex-col gap-4 shadow-sm">
          <div className="flex gap-3">
             <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#1c1c24] border border-white/10 shrink-0 flex items-center justify-center">
              {user?.avatar?.url ? (
                <img src={user.avatar.url} alt="Profile" className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <FaUser className="text-slate-400" size={14} />
              )}
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your coding projects, doubts, or tips with the community..."
              rows={2}
              className="w-full px-4 py-3 rounded-2xl bg-[#1e1e24] border border-white/5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Media Attach Preview */}
          {(localPreviewUrl || mediaUrl) && (
            <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-[#181820] max-h-[300px]">
              <button
                onClick={() => { setMediaUrl(''); setLocalPreviewUrl(''); setMediaType('none'); setAttachedFileName(''); }}
                className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black text-white rounded-lg text-xs z-10"
              >
                ×
              </button>
              {mediaType === 'image' && <img src={localPreviewUrl || mediaUrl} alt="Preview" className="w-full h-full object-contain" loading="lazy" />}
              {mediaType === 'video' && <video src={localPreviewUrl || mediaUrl} controls className="w-full h-full max-h-[300px]" />}
              {mediaType === 'pdf' && (
                <div className="p-4 flex items-center gap-3 text-xs">
                  <FaFilePdf size={20} className="text-red-500" />
                  <span className="font-bold text-white">{attachedFileName || 'Attachment.pdf'}</span>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center flex-col gap-2">
                  <div className="w-8 h-8 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest animate-pulse">Uploading...</span>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col xs:flex-row justify-between xs:items-center gap-3 border-t border-white/5 pt-3">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <label className="p-2 bg-[#1c1c24] hover:bg-[#252530] text-purple-400 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider border border-white/5 shrink-0">
                <FaImage size={12} /> Image
                <input type="file" accept="image/*" onChange={handleMediaUpload} className="hidden" />
              </label>
              <label className="p-2 bg-[#1c1c24] hover:bg-[#252530] text-purple-400 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider border border-white/5 shrink-0">
                <FaVideo size={12} /> Video
                <input type="file" accept="video/*" onChange={handleMediaUpload} className="hidden" />
              </label>
              <label className="p-2 bg-[#1c1c24] hover:bg-[#252530] text-purple-400 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider border border-white/5 shrink-0">
                <FaFilePdf size={12} /> PDF
                <input type="file" accept="application/pdf" onChange={handleMediaUpload} className="hidden" />
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowPollCreator(prev => !prev);
                  if (!showPollCreator) {
                    setPollQuestion('');
                    setPollOptions(['', '']);
                  }
                }}
                className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider border ${
                  showPollCreator
                    ? 'bg-purple-600 text-white border-purple-500/20 shadow-md shadow-purple-600/10'
                    : 'bg-[#1c1c24] hover:bg-[#252530] text-purple-400 border-white/5'
                }`}
              >
                <FaPoll size={12} /> Poll
              </button>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-2.5 py-2 bg-[#1c1c24] hover:bg-[#252530] text-slate-400 border border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-wider focus:outline-none focus:border-purple-500 cursor-pointer shrink-0"
              >
                <option value="General">General</option>
                <option value="Tutorials">Tutorials</option>
                <option value="Project Showcase">Showcase</option>
                <option value="Questions">Q&A</option>
                <option value="Announcements">Announcements</option>
              </select>
            </div>

            <button
              onClick={handlePostSubmit}
              disabled={!content.trim() || uploading}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md shadow-purple-600/10 cursor-pointer transition-colors self-end xs:self-auto"
            >
              {uploading ? 'Uploading...' : 'Post'}
            </button>
          </div>

          {showPollCreator && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-3">
              <span className="text-[10px] font-black uppercase text-purple-400">Create Poll Questionnaire</span>
              <div>
                <input
                  type="text"
                  placeholder="Ask a question..."
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#1e1e24] border border-white/5 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                {pollOptions.map((opt, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder={`Option ${idx + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const updated = [...pollOptions];
                        updated[idx] = e.target.value;
                        setPollOptions(updated);
                      }}
                      className="flex-1 px-3.5 py-2 bg-[#1e1e24] border border-white/5 rounded-xl text-xs text-white focus:outline-none"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setPollOptions(prev => prev.filter((_, i) => i !== idx))}
                        className="text-slate-500 hover:text-red-400 text-xs shrink-0 cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {pollOptions.length < 5 && (
                <button
                  type="button"
                  onClick={() => setPollOptions(prev => [...prev, ''])}
                  className="text-left text-[9px] font-black uppercase text-purple-400 hover:underline cursor-pointer"
                >
                  + Add Option Choice
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Feed Timeline list */}
      <div className="flex flex-col gap-6">
        {loading ? (
          <div className="p-16 flex items-center justify-center bg-[#121217] border border-white/5 rounded-3xl">
            <div className="w-8 h-8 rounded-full border-3 border-purple-500/20 border-t-purple-500 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="p-16 border border-dashed border-white/10 text-center text-slate-450 rounded-3xl bg-[#121217] text-xs italic">
            No active discussions found. Be the first to start a thread!
          </div>
        ) : (
          posts.filter(Boolean).map(post => {
            const currentUserId = user?.id || user?._id;
            const hasReacted = (post.reactions || []).some(r => r && (r.user?._id || r.user)?.toString() === currentUserId?.toString());
            const isBookmarked = (post.bookmarks || []).some(id => id && id.toString() === currentUserId?.toString());
            const isPostAuthor = (post.author?._id || post.author)?.toString() === currentUserId?.toString();

            return (
              <div 
                key={post._id} 
                className="bg-[#121217] border border-white/5 p-5 rounded-3xl flex flex-col gap-4 shadow-sm hover:border-white/10 transition-colors"
              >
                {/* Creator Header block */}
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <Link to={`/community/profile/${post.author?._id || post.author}`}>
                      <div className={`w-10 h-10 rounded-xl overflow-hidden bg-[#1c1c24] flex items-center justify-center shrink-0 transition-all ${
                        post.author?.avatarBorder === 'gold' 
                          ? 'border-2 border-amber-400 shadow-md shadow-amber-500/25' 
                          : 'border border-white/10'
                      }`}>
                        {post.author?.avatar?.url ? (
                          <img src={post.author.avatar.url} alt="Profile" className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <span className="font-black text-xs text-slate-455 uppercase">{post.author?.username?.slice(0,2)}</span>
                        )}
                      </div>
                    </Link>
                    <div className="flex flex-col text-left">
                      <div className="flex items-center gap-1.5">
                        <Link 
                          to={`/community/profile/${post.author?._id || post.author}`} 
                          className={`text-xs font-black hover:text-purple-400 transition-colors ${
                            post.author?.profileTheme === 'neon' 
                              ? 'text-pink-400 drop-shadow-[0_0_2px_rgba(244,114,182,0.45)]' 
                              : 'text-white'
                          }`}
                        >
                          {post.author?.fullName}
                        </Link>
                        {post.author?.role === 'Admin' && (
                          <FaCheckCircle className="text-purple-400" size={11} />
                        )}
                      </div>
                      <span className="text-[9px] text-slate-500 mt-0.5 font-bold uppercase tracking-wider">
                        @{post.author?.username} &bull; {getRelativeTime(post.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#1c1c24] text-purple-400 border border-purple-500/10 rounded-md text-[8px] font-black uppercase tracking-wider">
                      {post.category}
                    </span>
                    {(isPostAuthor || user?.role === 'Admin') && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingPostId(post._id);
                            setEditPostContent(post.content);
                          }}
                          className="p-1.5 bg-[#1c1c24] hover:bg-[#252530] text-slate-400 hover:text-purple-400 rounded-lg transition-colors cursor-pointer border border-white/5"
                          title="Edit Post"
                        >
                          <FaEdit size={10} />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          className="p-1.5 bg-[#1c1c24] hover:bg-[#252530] text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer border border-white/5"
                          title="Delete Post"
                        >
                          <FaTrash size={10} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Body Content */}
                <div className="flex flex-col gap-3 text-left">
                  {editingPostId === post._id ? (
                    <div className="flex flex-col gap-2 w-full">
                      <textarea
                        value={editPostContent}
                        onChange={(e) => setEditPostContent(e.target.value)}
                        className="w-full px-3 py-2 bg-[#1e1e24] border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                        rows={3}
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingPostId(null)}
                          className="px-3 py-1.5 bg-[#1c1c24] hover:bg-[#252530] text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdatePost(post._id)}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap break-words">
                      {post.content}
                    </p>
                  )}

                  {/* Poll View Component */}
                  {post.poll && post.poll.options && post.poll.options.length > 0 && (
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-3 my-2">
                      <span className="text-xs font-black text-white">{post.poll.question}</span>
                      
                      {(() => {
                        const totalVotes = post.poll.options.reduce((sum, o) => sum + (o.votes || []).length, 0);
                        const hasVoted = post.poll.options.some(o => (o.votes || []).some(v => v.toString() === currentUserId?.toString()));
                        
                        return (
                          <div className="flex flex-col gap-2.5">
                            {post.poll.options.map(opt => {
                              const voteCount = (opt.votes || []).length;
                              const percent = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                              const userVotedForThis = (opt.votes || []).some(v => v.toString() === currentUserId?.toString());
                              
                              if (hasVoted) {
                                return (
                                  <div key={opt._id} className="relative flex flex-col gap-1">
                                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-300 z-10 px-3 py-2">
                                      <span className="flex items-center gap-1.5">
                                        {opt.optionText}
                                        {userVotedForThis && <span className="text-[8px] bg-purple-650 text-white px-1.5 py-0.5 rounded-full uppercase font-black">Your Vote</span>}
                                      </span>
                                      <span>{percent}% ({voteCount})</span>
                                    </div>
                                    <div className="absolute inset-0 bg-white/5 rounded-xl" />
                                    <div 
                                      className={`absolute left-0 top-0 bottom-0 rounded-xl transition-all duration-500 ${userVotedForThis ? 'bg-purple-650/20 border border-purple-500/20' : 'bg-white/10'}`}
                                      style={{ width: `${percent}%` }}
                                    />
                                  </div>
                                );
                              }
                              
                              return (
                                <button
                                  key={opt._id}
                                  onClick={() => handleVotePoll(post._id, opt._id)}
                                  className="w-full text-left px-4 py-2.5 rounded-xl bg-white/5 hover:bg-purple-650/10 border border-white/5 hover:border-purple-500/30 text-xs font-bold text-slate-350 hover:text-white transition-all cursor-pointer"
                                >
                                  {opt.optionText}
                                </button>
                              );
                            })}
                            
                            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                              Total: {totalVotes} Votes
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Attachment Media if present */}
                  {post.mediaUrl && (
                    <div className="rounded-2xl overflow-hidden border border-white/5 bg-[#181820] max-h-[360px] w-full flex items-center justify-center">
                      {post.mediaType === 'image' && <img src={post.mediaUrl} alt="brief" className="w-full h-full object-cover" loading="lazy" />}
                      {post.mediaType === 'video' && <video src={post.mediaUrl} controls className="w-full h-full max-h-[360px]" />}
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
                </div>

                {/* Interaction Row counters */}
                <div className="flex items-center justify-between border-t border-white/5 pt-3 text-[10px] text-slate-500 font-bold">
                  <div className="flex items-center gap-1">
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-purple-600/20 text-purple-400 text-[8px]">👍</span>
                    <span>{post.reactions?.length || 0} Likes</span>
                  </div>
                  <div className="flex gap-4">
                    <span>{comments[post._id]?.length || post.commentsCount || 0} Comments</span>
                    <span>{post.bookmarks?.length || 0} Saved</span>
                  </div>
                </div>

                {/* Interaction Buttons */}
                <div className="grid grid-cols-3 border-t border-white/5 pt-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <button
                    onClick={() => handleReaction(post._id, 'Like')}
                    className={`py-2 hover:bg-white/5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                      hasReacted ? 'text-purple-400' : ''
                    }`}
                  >
                    {hasReacted ? <FaHeart /> : <FaRegHeart />} Like
                  </button>
                  <button
                    onClick={() => toggleComments(post._id)}
                    className="py-2 hover:bg-white/5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <FaComment /> Comment
                  </button>
                  <button
                    onClick={() => handleBookmark(post._id)}
                    className={`py-2 hover:bg-white/5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                      isBookmarked ? 'text-purple-400' : ''
                    }`}
                  >
                    {isBookmarked ? <FaBookmark /> : <FaRegBookmark />} Save
                  </button>
                </div>

                {/* Comments Section */}
                {showComments[post._id] && (
                  <div className="border-t border-white/5 pt-4 flex flex-col gap-4 animate-fade-in">
                    {/* Add Comment Input */}
                    <form onSubmit={(e) => handleAddComment(e, post._id)} className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#1c1c24] border border-white/10 flex items-center justify-center shrink-0">
                        {user?.avatar?.url ? (
                          <img src={user.avatar.url} alt="Profile" className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <FaUser className="text-slate-400" size={12} />
                        )}
                      </div>
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={commentInputs[post._id] || ''}
                          onChange={(e) => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                          className="w-full px-4 py-2 rounded-xl bg-[#1c1c24] border border-white/5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:bg-[#202028] transition-all"
                        />
                        <button type="submit" className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer">
                          <FaPaperPlane size={11} />
                        </button>
                      </div>
                    </form>

                    {/* Comments & Replies list */}
                    <div className="flex flex-col gap-3">
                      {/* Filter top-level comments */}
                      {(comments[post._id] || [])
                        .filter(c => c && !c.parentCommentId)
                        .map(comment => {
                          const replies = (comments[post._id] || []).filter(r => r && r.parentCommentId === comment._id);
                          
                          return (
                            <div key={comment._id} className="flex flex-col gap-2.5 pl-1.5 border-l border-white/5">
                              {/* Top Level Comment Card */}
                              <div className="flex gap-2.5 items-start">
                                <div className="w-7.5 h-7.5 rounded-lg overflow-hidden bg-[#1c1c24] border border-white/10 flex items-center justify-center shrink-0">
                                  {comment.author?.avatar?.url ? (
                                    <img src={comment.author.avatar.url} alt="Avatar" className="w-full h-full object-cover" loading="lazy" />
                                  ) : (
                                    <FaUser className="text-slate-500" size={10} />
                                  )}
                                </div>
                                <div className="flex-1 bg-[#181820] border border-white/5 p-3 rounded-2xl text-left">
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] font-black text-white">{comment.author?.fullName}</span>
                                      <span className="text-[8px] text-slate-500">@{comment.author?.username}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[8px] text-slate-500">{getRelativeTime(comment.createdAt)}</span>
                                      {(comment.author?._id === currentUserId || user?.role === 'Admin') && (
                                        <div className="flex items-center gap-1.5">
                                          <button
                                            onClick={() => {
                                              setEditingCommentId(comment._id);
                                              setEditCommentContent(comment.content);
                                            }}
                                            className="text-slate-500 hover:text-purple-400 transition-colors"
                                            title="Edit Comment"
                                          >
                                            <FaEdit size={8} />
                                          </button>
                                          <button 
                                            onClick={() => handleDeleteComment(post._id, comment._id)}
                                            className="text-slate-500 hover:text-red-500 transition-colors"
                                            title="Delete Comment"
                                          >
                                            <FaTrash size={8} />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {editingCommentId === comment._id ? (
                                    <div className="flex flex-col gap-1.5 mt-1 w-full">
                                      <input
                                        type="text"
                                        value={editCommentContent}
                                        onChange={(e) => setEditCommentContent(e.target.value)}
                                        className="w-full px-2 py-1 bg-[#1e1e24] border border-white/5 rounded-lg text-[10px] text-white focus:outline-none focus:border-purple-500"
                                      />
                                      <div className="flex gap-1.5 justify-end">
                                        <button
                                          onClick={() => setEditingCommentId(null)}
                                          className="px-2 py-1 bg-[#1c1c24] text-slate-400 rounded-lg text-[8px] font-black uppercase tracking-wider"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          onClick={() => handleUpdateComment(post._id, comment._id)}
                                          className="px-2 py-1 bg-purple-600 text-white rounded-lg text-[8px] font-black uppercase tracking-wider"
                                        >
                                          Save
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-[11px] text-slate-200 mt-1 leading-relaxed">{comment.content}</p>
                                  )}
                                  
                                  {/* Reply Trigger */}
                                  <button
                                    onClick={() => setActiveReplyBox(activeReplyBox === comment._id ? null : comment._id)}
                                    className="text-[9px] font-black text-purple-400 hover:underline mt-2 flex items-center gap-1 cursor-pointer"
                                  >
                                    Reply
                                  </button>
                                </div>
                              </div>

                              {/* Indented Replies Section */}
                              {replies.filter(Boolean).map(reply => (
                                <div key={reply._id} className="flex gap-2.5 items-start pl-8">
                                  <div className="w-6.5 h-6.5 rounded-lg overflow-hidden bg-[#1c1c24] border border-white/10 flex items-center justify-center shrink-0">
                                    {reply.author?.avatar?.url ? (
                                      <img src={reply.author.avatar.url} alt="Avatar" className="w-full h-full object-cover" loading="lazy" />
                                    ) : (
                                      <FaUser className="text-slate-500" size={8} />
                                    )}
                                  </div>
                                  <div className="flex-1 bg-[#1a1a24] border border-white/5 p-2.5 rounded-2xl text-left">
                                    <div className="flex justify-between items-start">
                                      <div className="flex items-center gap-1">
                                        <span className="text-[9px] font-black text-white">{reply.author?.fullName}</span>
                                        <span className="text-[8px] text-slate-500">@{reply.author?.username}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[8px] text-slate-500">{getRelativeTime(reply.createdAt)}</span>
                                        {(reply.author?._id === currentUserId || user?.role === 'Admin') && (
                                          <button 
                                            onClick={() => handleDeleteComment(post._id, reply._id)}
                                            className="text-slate-500 hover:text-red-500 transition-colors"
                                          >
                                            <FaTrash size={8} />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    <p className="text-[10px] text-slate-200 mt-1 leading-relaxed">{reply.content}</p>
                                  </div>
                                </div>
                              ))}

                              {/* Inline Reply Input Box */}
                              {activeReplyBox === comment._id && (
                                <form onSubmit={(e) => handleAddReply(e, post._id, comment._id)} className="flex gap-2 pl-8">
                                  <input
                                    type="text"
                                    placeholder="Write a reply..."
                                    value={replyInputs[comment._id] || ''}
                                    onChange={(e) => setReplyInputs(prev => ({ ...prev, [comment._id]: e.target.value }))}
                                    className="w-full px-3 py-1.5 rounded-lg bg-[#181822] border border-white/5 text-[10px] text-white focus:outline-none focus:border-purple-500"
                                  />
                                  <button type="submit" className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-bold cursor-pointer">
                                    Reply
                                  </button>
                                </form>
                              )}

                            </div>
                          );
                        })}
                      
                      {comments[post._id]?.length === 0 && (
                        <div className="text-[9px] text-slate-500 italic text-center py-1">No comments on this thread yet.</div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default CommunityFeed;
