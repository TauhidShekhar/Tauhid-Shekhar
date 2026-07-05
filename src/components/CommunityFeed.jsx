import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { 
  FaRegHeart, FaHeart, FaComment, FaBookmark, FaRegBookmark, 
  FaShareAlt, FaPlus, FaImage, FaPaperclip, FaTags, FaFilter, 
  FaRegSmile, FaCheck, FaThumbtack, FaTrash, FaPlusCircle 
} from 'react-icons/fa';

const CommunityFeed = () => {
  const { user } = useAuth();
  
  // Feed states
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTagsFilter, setActiveTagsFilter] = useState('');
  
  // Post Creator states
  const [showCreator, setShowCreator] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('none');
  const [category, setCategory] = useState('General');
  const [tags, setTags] = useState('');
  
  // Comment states
  const [commentInputs, setCommentInputs] = useState({}); // { postId: text }
  const [comments, setComments] = useState({}); // { postId: [comment] }
  const [showComments, setShowComments] = useState({}); // { postId: Boolean }

  const categories = ['All', 'General', 'Tutorials', 'Project Showcase', 'Questions', 'Announcements'];

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeCategory !== 'All') params.category = activeCategory;
      if (searchQuery) params.search = searchQuery;
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
  }, [activeCategory, activeTagsFilter]);

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.uploadCommunityImage(formData);
      if (res.success) {
        setMediaUrl(res.url);
      }
    } catch (err) {
      alert('Media upload failed: ' + err.message);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    try {
      const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await api.createCommunityPost({
        title,
        content,
        mediaUrl,
        mediaType,
        category,
        tags: tagsArray
      });

      if (res.success) {
        setPosts(prev => [res.data, ...prev]);
        setShowCreator(false);
        setTitle('');
        setContent('');
        setMediaUrl('');
        setMediaType('none');
        setTags('');
      }
    } catch (err) {
      alert('Post creation failed: ' + err.message);
    }
  };

  const handleReaction = async (postId, type) => {
    try {
      const res = await api.reactToCommunityPost(postId, type);
      if (res.success) {
        setPosts(prev => prev.map(p => p._id === postId ? { ...p, reactions: res.data } : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookmark = async (postId) => {
    try {
      const res = await api.bookmarkCommunityPost(postId);
      if (res.success) {
        setPosts(prev => prev.map(p => {
          if (p._id === postId) {
            const list = p.bookmarks || [];
            const index = list.indexOf(user.id);
            if (index === -1) {
              return { ...p, bookmarks: [...list, user.id] };
            } else {
              return { ...p, bookmarks: list.filter(id => id !== user.id) };
            }
          }
          return p;
        }));
      }
    } catch (err) {
      console.error(err);
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
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    try {
      const res = await api.addCommunityComment(postId, text.trim());
      if (res.success) {
        setComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), res.data]
        }));
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
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

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      
      {/* Top Search & Filter widgets */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 p-4 rounded-3xl shadow-sm">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search discussion posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchFeed()}
            className="w-full pl-4 pr-10 py-2.5 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-primary-blue transition-colors"
          />
          <button 
            onClick={fetchFeed} 
            className="absolute top-2.5 right-3 text-slate-400 hover:text-primary-blue text-xs font-bold"
          >
            Go
          </button>
        </div>

        {/* Category horizontal filters */}
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto scrollbar-none py-1">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold tracking-wider uppercase border transition-all cursor-pointer ${
                activeCategory === c 
                  ? 'bg-primary-blue border-primary-blue text-white shadow-sm' 
                  : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-500 hover:border-slate-350'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Share / Create Thread button */}
      {!showCreator ? (
        <button
          onClick={() => setShowCreator(true)}
          className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-slate-300 dark:border-white/10 hover:border-primary-blue rounded-3xl text-xs font-bold text-slate-500 hover:text-primary-blue transition-colors cursor-pointer bg-white dark:bg-slate-900/10"
        >
          <FaPlus /> Start a new discussion thread...
        </button>
      ) : (
        <form onSubmit={handlePostSubmit} className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-[30px] flex flex-col gap-4 text-left shadow-md">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-3">
            <h4 className="text-sm font-black font-title text-black dark:text-white">Create New Post</h4>
            <button 
              type="button" 
              onClick={() => setShowCreator(false)}
              className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Post Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. How to use dynamic seeding in MongoDB?"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-xs transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-blue text-xs"
              >
                {categories.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tags (comma separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. react, node, mongoose"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Media Type</label>
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-blue text-xs"
              >
                <option value="none">No Attachment</option>
                <option value="image">Showcase Image URL</option>
                <option value="video">Showcase Video URL</option>
                <option value="pdf">Showcase PDF Document URL</option>
              </select>
            </div>
            {mediaType !== 'none' && (
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upload Media Attachment</label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaUpload}
                  className="w-full text-xs text-slate-500 border border-slate-200 dark:border-white/5 p-2 rounded-xl"
                />
                {mediaUrl && (
                  <div className="mt-2 text-[10px] font-bold text-primary-blue bg-primary-blue/5 border border-primary-blue/10 p-2 rounded-xl flex items-center justify-between">
                    <span>Uploaded: {mediaUrl.split('/').pop()}</span>
                    <a href={mediaUrl} target="_blank" rel="noreferrer" className="underline">Preview</a>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Post Content Body</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={4}
              placeholder="What do you want to share with the community?"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-xs transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-fit px-8 py-3 bg-primary-blue hover:bg-accent-blue text-white rounded-2xl font-bold text-xs transition-all shadow-md cursor-pointer"
          >
            Publish Post
          </button>
        </form>
      )}

      {/* Feed Timeline List */}
      <div className="flex flex-col gap-5">
        {loading ? (
          <div className="p-10 text-center text-slate-400 font-bold uppercase tracking-wider">Loading community feed...</div>
        ) : posts.length === 0 ? (
          <div className="p-10 border border-dashed border-slate-200 dark:border-white/10 text-center text-slate-400 rounded-3xl">
            No active discussions found for category: {activeCategory}. Start a thread!
          </div>
        ) : (
          posts.map(post => {
            const hasReacted = (post.reactions || []).some(r => r.user === user.id);
            const isBookmarked = (post.bookmarks || []).includes(user.id);
            const isPostAuthor = post.author?._id === user.id || post.author === user.id;

            return (
              <div key={post._id} className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-[30px] flex flex-col gap-4 text-left shadow-sm hover:shadow-md transition-shadow">
                
                {/* Author Info Header */}
                <div className="flex justify-between items-center">
                  <Link to={`/community/profile/${post.author?._id || post.author}`} className="flex items-center gap-3 hover:opacity-85 transition-opacity">
                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/50 dark:border-white/5 flex items-center justify-center shrink-0">
                      {post.author?.avatar?.url ? (
                        <img src={post.author.avatar.url} alt="Author" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-slate-400 font-black text-xs uppercase">{post.author?.username?.slice(0, 2)}</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <h4 className="font-bold text-xs text-black dark:text-white leading-tight hover:text-primary-blue transition-colors">
                          {post.author?.fullName || 'Anonymous User'}
                        </h4>
                        {post.author?.isVerified && (
                          <FaCheck className="text-primary-blue" size={10} />
                        )}
                      </div>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 block mt-0.5 font-bold uppercase tracking-wide">
                        @{post.author?.username} • Rep: {post.author?.reputation || 0}
                      </span>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-primary-blue/10 text-primary-blue border border-primary-blue/20 rounded-md text-[8px] font-black uppercase tracking-wider">
                      {post.category}
                    </span>
                    {(isPostAuthor || user.role === 'Admin') && (
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Delete Post"
                      >
                        <FaTrash size={11} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Content Area */}
                <div>
                  <h3 className="font-black font-title text-base md:text-lg text-black dark:text-white leading-snug mb-2">
                    {post.title}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed break-words whitespace-pre-wrap">
                    {post.content}
                  </p>

                  {/* Showcase media if uploaded */}
                  {post.mediaUrl && post.mediaType === 'image' && (
                    <div className="mt-4 rounded-2xl overflow-hidden border border-slate-150 dark:border-white/5 max-h-[350px]">
                      <img src={post.mediaUrl} alt="Upload attachment" className="w-full h-full object-cover" />
                    </div>
                  )}
                  {post.mediaUrl && post.mediaType === 'video' && (
                    <video src={post.mediaUrl} controls className="mt-4 rounded-2xl overflow-hidden border border-slate-150 dark:border-white/5 w-full max-h-[350px]" />
                  )}
                </div>

                {/* Tags row */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {post.tags.map(t => (
                      <span key={t} className="text-[9px] font-bold px-2 py-0.5 bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-md text-slate-500 dark:text-slate-400">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Interaction deck */}
                <div className="flex justify-between items-center border-t border-slate-100 dark:border-white/5 pt-4 mt-2">
                  <div className="flex gap-3">
                    {/* Reactions trigger */}
                    <button
                      onClick={() => handleReaction(post._id, 'Like')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold transition-all cursor-pointer border ${
                        hasReacted 
                          ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/15' 
                          : 'bg-slate-50 dark:bg-white/5 border-slate-200/60 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:border-slate-350'
                      }`}
                    >
                      {hasReacted ? <FaHeart className="animate-pulse text-red-500" /> : <FaRegHeart />}
                      <span>{(post.reactions || []).length} Likes</span>
                    </button>
                    
                    {/* Comments toggle */}
                    <button
                      onClick={() => toggleComments(post._id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold transition-all cursor-pointer border ${
                        showComments[post._id]
                          ? 'bg-primary-blue/10 border-primary-blue/20 text-primary-blue hover:bg-primary-blue/15'
                          : 'bg-slate-50 dark:bg-white/5 border-slate-200/60 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:border-slate-350'
                      }`}
                    >
                      <FaComment />
                      <span>{showComments[post._id] ? 'Hide Comments' : 'Comments'}</span>
                    </button>
                  </div>

                  {/* Bookmark trigger */}
                  <button
                    onClick={() => handleBookmark(post._id)}
                    className={`p-2.5 rounded-full border transition-all cursor-pointer ${
                      isBookmarked
                        ? 'bg-primary-blue/10 border-primary-blue/20 text-primary-blue hover:bg-primary-blue/15'
                        : 'bg-slate-50 dark:bg-white/5 border-slate-200/60 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                    }`}
                  >
                    {isBookmarked ? <FaBookmark size={12} /> : <FaRegBookmark size={12} />}
                  </button>
                </div>

                {/* Comments box accordion */}
                {showComments[post._id] && (
                  <div className="border-t border-slate-100 dark:border-white/5 pt-4 mt-2">
                    <div className="flex flex-col gap-3 mb-4 max-h-[220px] overflow-y-auto pr-1">
                      {(comments[post._id] || []).map(comm => (
                        <div key={comm._id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-white/5 rounded-2xl flex gap-3 text-left">
                          <Link to={`/community/profile/${comm.author?._id || comm.author}`} className="w-7 h-7 rounded-lg overflow-hidden bg-slate-200 border border-slate-300 flex items-center justify-center shrink-0 hover:opacity-85 transition-opacity">
                            {comm.author?.avatar?.url ? (
                              <img src={comm.author.avatar.url} alt="Commenter" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] font-bold">{comm.author?.username?.slice(0,2)}</span>
                            )}
                          </Link>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-0.5">
                              <Link to={`/community/profile/${comm.author?._id || comm.author}`} className="font-bold text-[10px] text-black dark:text-white truncate hover:text-primary-blue transition-colors">
                                {comm.author?.fullName}
                              </Link>
                              <span className="text-[8px] text-slate-400 font-bold">{new Date(comm.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed break-words">{comm.content}</p>
                          </div>
                          {(comm.author?._id === user.id || user.role === 'Admin') && (
                            <button
                              onClick={() => handleDeleteComment(post._id, comm._id)}
                              className="text-[9px] font-bold text-red-500 hover:underline cursor-pointer shrink-0 self-start mt-0.5"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      ))}
                      {(!comments[post._id] || comments[post._id].length === 0) && (
                        <p className="text-[10px] text-slate-400 italic">No comments yet. Share your thoughts!</p>
                      )}
                    </div>

                    <form onSubmit={(e) => handleAddComment(e, post._id)} className="flex gap-2">
                      <input
                        type="text"
                        value={commentInputs[post._id] || ''}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                        placeholder="Write a comment..."
                        required
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue transition-colors"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary-blue hover:bg-accent-blue text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        Reply
                      </button>
                    </form>
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
