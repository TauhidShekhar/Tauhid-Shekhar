import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaGlobe, FaUsers, FaArrowLeft, FaHeart, FaRegHeart, FaBookmark, FaRegBookmark,
  FaComment, FaStar, FaShareAlt, FaPlus, FaTimes, FaSpinner, FaSearch, FaChevronRight,
  FaFilePdf, FaCheckCircle, FaTrash, FaCheck, FaExclamationTriangle, FaAward,
  FaCoins, FaTasks, FaUser
} from 'react-icons/fa';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const getAbsolutePdfUrl = (url) => {
  if (!url || typeof url !== 'string') return '/assits/Resume-file.pdf';
  let cleanUrl = url.trim();
  if (!cleanUrl) return '/assits/Resume-file.pdf';

  if (cleanUrl.includes('/image/upload/') && cleanUrl.toLowerCase().endsWith('.pdf')) {
    cleanUrl = cleanUrl.replace('/image/upload/', '/raw/upload/');
  }

  if (/^https?:\/\//i.test(cleanUrl)) {
    return cleanUrl.replace(/^http:\/\//i, 'https://');
  }

  if (cleanUrl.startsWith('//')) {
    return `https:${cleanUrl}`;
  }

  if (cleanUrl.startsWith('/assits/') || cleanUrl.startsWith('assits/') || cleanUrl.startsWith('/assets/') || cleanUrl.startsWith('assets/')) {
    return cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
  }

  const backendApi = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL 
    ? import.meta.env.VITE_API_URL 
    : 'https://tauhid-shekhar-portfolio.onrender.com/api';
  const backendBase = backendApi.replace(/\/api\/?$/, '');
  const relativePath = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
  return `${backendBase}${relativePath}`;
};

const CommunityResumeHub = () => {
  const { user } = useAuth();
  
  // Hub States
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('latest'); // latest, score, rating
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected Resume View State
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [resumeDetail, setResumeDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Community Comment Thread States
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [replyInputs, setReplyInputs] = useState({}); // { commentId: text }
  const [activeReplyBox, setActiveReplyBox] = useState(null);

  // Review & Rating Modal States
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingLayout, setRatingLayout] = useState(5);
  const [ratingProjects, setRatingProjects] = useState(5);
  const [ratingSkills, setRatingSkills] = useState(5);
  const [ratingExperience, setRatingExperience] = useState(5);
  const [ratingDesign, setRatingDesign] = useState(5);
  const [ratingAts, setRatingAts] = useState(5);
  const [ratingOverall, setRatingOverall] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  // Report State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  // Leaderboard State
  const [leaderboard, setLeaderboard] = useState(null);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  useEffect(() => {
    fetchHubResumes();
    fetchLeaderboard();
  }, [sortBy]);

  const fetchHubResumes = async () => {
    setLoading(true);
    try {
      const res = await api.getCommunityResumeHub({ sort: sortBy, search: searchQuery });
      if (res.success) {
        setResumes(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch hub resumes:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      const res = await api.getResumeLeaderboard();
      if (res.success) {
        setLeaderboard(res.data);
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err.message);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHubResumes();
  };

  const handleSelectResume = async (resumeId) => {
    setSelectedResumeId(resumeId);
    setLoadingDetail(true);
    try {
      const res = await api.getResumeReportDetails(resumeId);
      if (res.success) {
        setResumeDetail(res.data);
        fetchComments(resumeId);
      }
    } catch (err) {
      alert('Failed to load resume details: ' + err.message);
    } finally {
      setLoadingDetail(false);
    }
  };

  const fetchComments = async (resumeId) => {
    setLoadingComments(true);
    try {
      const res = await api.getResumeComments(resumeId);
      if (res.success) {
        setComments(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load comments:', err.message);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleLikeToggle = async (resumeId) => {
    try {
      const res = await api.toggleLikeResume(resumeId);
      if (res.success) {
        // Toggle on main feed
        setResumes(prev => prev.map(r => {
          if (r._id === resumeId) {
            return {
              ...r,
              likesCount: res.isLiked ? r.likesCount + 1 : Math.max(0, r.likesCount - 1)
            };
          }
          return r;
        }));
        
        // Toggle in detail view
        if (resumeDetail?._id === resumeId) {
          const currentUserId = user?.id || user?._id;
          const list = resumeDetail.likes || [];
          const updatedLikes = res.isLiked 
            ? [...list, currentUserId] 
            : list.filter(id => id !== currentUserId);

          setResumeDetail(prev => ({
            ...prev,
            likes: updatedLikes
          }));
        }
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleBookmarkToggle = async (resumeId) => {
    try {
      const res = await api.toggleBookmarkResume(resumeId);
      if (res.success) {
        if (resumeDetail?._id === resumeId) {
          const currentUserId = user?.id || user?._id;
          const list = resumeDetail.bookmarks || [];
          const updatedBookmarks = res.isBookmarked 
            ? [...list, currentUserId] 
            : list.filter(id => id !== currentUserId);

          setResumeDetail(prev => ({
            ...prev,
            bookmarks: updatedBookmarks
          }));
        }
        alert(res.isBookmarked ? 'Resume added to bookmarks!' : 'Resume removed from bookmarks.');
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    try {
      const res = await api.postResumeComment(resumeDetail._id, { content: commentInput });
      if (res.success && res.data) {
        setComments(prev => [...prev, res.data]);
        setCommentInput('');
      }
    } catch (err) {
      alert('Comment submission failed: ' + err.message);
    }
  };

  const handleReplySubmit = async (commentId, e) => {
    e.preventDefault();
    const text = replyInputs[commentId];
    if (!text || !text.trim()) return;

    try {
      const res = await api.postResumeComment(resumeDetail._id, {
        content: text,
        parentId: commentId
      });
      if (res.success && res.data) {
        setComments(prev => prev.map(c => {
          if (c._id === commentId) {
            return res.data; // replace with populated comment
          }
          return c;
        }));
        setReplyInputs(prev => ({ ...prev, [commentId]: '' }));
        setActiveReplyBox(null);
      }
    } catch (err) {
      alert('Reply failed: ' + err.message);
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    setSubmittingRating(true);
    try {
      const res = await api.submitCommunityReview(resumeDetail._id, {
        layout: ratingLayout,
        projects: ratingProjects,
        skills: ratingSkills,
        experience: ratingExperience,
        design: ratingDesign,
        ats: ratingAts,
        overall: ratingOverall,
        feedback: ratingFeedback
      });
      if (res.success) {
        alert('Review ratings submitted successfully!');
        setShowRatingModal(false);
        // Refresh detail view
        handleSelectResume(resumeDetail._id);
        fetchHubResumes();
      }
    } catch (err) {
      alert('Failed to submit review: ' + err.message);
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportReason.trim()) return;

    setSubmittingReport(true);
    try {
      const res = await api.reportResume(resumeDetail._id, { reason: reportReason });
      if (res.success) {
        alert('Report logged successfully. The moderation queue has flagged this.');
        setShowReportModal(false);
        setReportReason('');
      }
    } catch (err) {
      alert('Flagging failed: ' + err.message);
    } finally {
      setSubmittingReport(false);
    }
  };

  // Helper overall star ratings mapping
  const renderStars = (rating) => {
    const list = [];
    const val = Math.round(rating);
    for (let i = 1; i <= 5; i++) {
      list.push(
        <FaStar key={i} className={i <= val ? 'text-amber-400' : 'text-slate-700'} />
      );
    }
    return <div className="flex gap-0.5 items-center">{list}</div>;
  };

  const currentUserId = user?.id || user?._id;
  const isLiked = resumeDetail?.likes?.includes(currentUserId);
  const isBookmarked = resumeDetail?.bookmarks?.includes(currentUserId);

  return (
    <div className="min-h-screen bg-[#09090c] text-white p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Hub Header title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 gap-4">
          <div className="text-left">
            <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
              <FaGlobe size={24} className="text-purple-500" /> Resume Review Hub
            </h1>
            <p className="text-slate-400 text-xs md:text-sm mt-1">
              Share your CV to obtain peer feedback, community star ratings, and custom AI recommendations.
            </p>
          </div>
          
          {selectedResumeId && (
            <button
              onClick={() => { setSelectedResumeId(null); setResumeDetail(null); fetchHubResumes(); }}
              className="px-4 py-2 bg-[#1c1c24] hover:bg-[#252530] text-slate-300 rounded-xl text-xs font-black transition-all border border-white/5 flex items-center gap-1.5"
            >
              <FaArrowLeft size={10} /> Back to Feed
            </button>
          )}
        </div>

        <AnimatePresence>
          {!selectedResumeId ? (
            /* Hub Feed layout split */
            <motion.div
              key="feed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left Column: Feed filters and list */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                
                {/* Search / Filter bar */}
                <div className="bg-[#121217] border border-white/5 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                  <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-xs">
                    <input
                      type="text"
                      placeholder="Search resumes or skills..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-4 py-2 rounded-xl bg-[#1e1e24] border border-white/5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <FaSearch className="absolute left-2.5 top-3 text-slate-500" size={11} />
                  </form>

                  <div className="flex gap-2 shrink-0">
                    {[
                      { id: 'latest', label: 'Latest Shared' },
                      { id: 'score', label: 'Top ATS Score' },
                      { id: 'rating', label: 'Top Rated' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setSortBy(opt.id)}
                        className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${
                          sortBy === opt.id
                            ? 'bg-purple-600 border-purple-500 text-white shadow-md'
                            : 'bg-transparent border-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shared lists */}
                {loading ? (
                  <div className="py-24 flex items-center justify-center">
                    <FaSpinner className="animate-spin text-purple-500" size={32} />
                  </div>
                ) : resumes.length === 0 ? (
                  <div className="py-20 border border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-slate-500 gap-3">
                    <FaUsers size={28} />
                    <span className="text-xs">No public shared resumes found matching query.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resumes.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => handleSelectResume(item._id)}
                        className="p-5 bg-[#121217] border border-white/5 hover:border-purple-500/20 rounded-3xl cursor-pointer transition-all flex flex-col gap-4 text-left relative group shadow-sm hover:shadow-purple-600/5"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl overflow-hidden bg-[#1e1e24] flex items-center justify-center shrink-0 border border-white/5">
                              {item.uploadedBy?.avatar?.url ? (
                                <img src={item.uploadedBy.avatar.url} alt="Profile" className="w-full h-full object-cover" />
                              ) : (
                                <FaUser className="text-slate-400" size={13} />
                              )}
                            </div>
                            <div>
                              <span className="text-xs font-black text-white block truncate max-w-[140px]">{item.uploadedBy?.fullName}</span>
                              <span className="text-[9px] text-slate-400 block mt-0.5">@{item.uploadedBy?.username} • Lvl {item.uploadedBy?.level || 1}</span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end">
                            <span className="text-xs font-black text-purple-400 bg-purple-600/10 border border-purple-500/20 px-2.5 py-0.5 rounded-lg">
                              ATS: {item.atsScore}%
                            </span>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-black text-white group-hover:text-purple-400 transition-colors truncate">{item.fileName}</h4>
                          <span className="text-[9px] text-slate-500 block mt-0.5">{(item.fileSize / 1024).toFixed(0)} KB • Shared {new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>

                        {/* Skills tags */}
                        <div className="flex flex-wrap gap-1.5">
                          {item.skills.slice(0, 4).map((s, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-white/5 border border-white/5 rounded text-[9px] text-slate-350 font-bold">
                              {s}
                            </span>
                          ))}
                        </div>

                        {/* Footer ratings counters */}
                        <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-1">
                          <div className="flex items-center gap-1.5">
                            {renderStars(item.averageRating)}
                            <span className="text-[10px] text-slate-400 font-bold">({item.ratingsCount})</span>
                          </div>

                          <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold">
                            <span className="flex items-center gap-1"><FaHeart size={10} className="text-red-500/80" /> {item.likesCount}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Community Leaderboard */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="bg-[#121217] border border-white/5 p-6 rounded-3xl shadow-xl flex flex-col text-left">
                  <h3 className="text-sm font-black text-white mb-1 flex items-center gap-1.5">
                    <FaAward className="text-amber-400" /> Hub Leaderboards
                  </h3>
                  <p className="text-slate-400 text-[11px] mb-5">Ranks top CV scorers and helpful resume reviewers.</p>

                  {loadingLeaderboard ? (
                    <div className="py-8 flex items-center justify-center">
                      <FaSpinner className="animate-spin text-purple-500" size={20} />
                    </div>
                  ) : leaderboard ? (
                    <div className="flex flex-col gap-6">
                      
                      {/* Top Score Resumes */}
                      <div>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-3 border-b border-white/5 pb-1">Top ATS Resumes</span>
                        <div className="flex flex-col gap-3">
                          {leaderboard.topATSResumes?.map((item, idx) => (
                            <div key={item._id} className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-300 truncate max-w-[150px]">{item.fileName}</span>
                              <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full font-black text-[9px]">{item.atsScore}%</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Top Reviewers */}
                      <div>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-3 border-b border-white/5 pb-1">Top Contributors</span>
                        <div className="flex flex-col gap-3">
                          {leaderboard.topReviewers?.map((u, idx) => (
                            <div key={u._id} className="flex justify-between items-center text-xs">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-800 shrink-0">
                                  {u.avatar?.url && <img src={u.avatar.url} alt="pic" className="w-full h-full object-cover" />}
                                </div>
                                <span className="font-bold text-slate-300">@{u.username}</span>
                              </div>
                              <span className="text-[10px] text-purple-400 font-bold">Lvl {u.level || 1}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  ) : null}
                </div>
              </div>
            </motion.div>
          ) : (
            /* Selected Detailed view layout */
            <motion.div
              key="detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {loadingDetail || !resumeDetail ? (
                <div className="col-span-12 py-24 flex items-center justify-center">
                  <FaSpinner className="animate-spin text-purple-500" size={32} />
                </div>
              ) : (
                <>
                  {/* Left Column (col-span-7): Document Details & Community comments */}
                  <div className="lg:col-span-7 flex flex-col gap-6 text-left">
                    
                    {/* Header Details Panel */}
                    <div className="bg-[#121217] border border-white/5 p-6 rounded-3xl shadow-xl flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-4 gap-4">
                        <div className="flex items-center gap-3">
                          <FaFilePdf className="text-red-400" size={24} />
                          <div>
                            <h3 className="text-sm font-black text-white">{resumeDetail.fileName}</h3>
                            <p className="text-[10px] text-slate-500 mt-0.5">Shared by @{resumeDetail.uploadedBy?.username} • Lvl {resumeDetail.uploadedBy?.level || 1}</p>
                          </div>
                        </div>

                        {/* Interactive reaction handles */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleLikeToggle(resumeDetail._id)}
                            className={`px-3 py-1.5 rounded-xl border text-[10px] font-black flex items-center gap-1.5 transition-all active:scale-[0.98] ${
                              isLiked 
                                ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                                : 'bg-transparent border-white/5 text-slate-400 hover:text-white'
                            }`}
                          >
                            {isLiked ? <FaHeart /> : <FaRegHeart />} {resumeDetail.likes?.length || 0} Likes
                          </button>
                          <button
                            onClick={() => handleBookmarkToggle(resumeDetail._id)}
                            className={`px-3 py-1.5 rounded-xl border text-[10px] font-black flex items-center gap-1.5 transition-all active:scale-[0.98] ${
                              isBookmarked
                                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                : 'bg-transparent border-white/5 text-slate-400 hover:text-white'
                            }`}
                          >
                            {isBookmarked ? <FaBookmark /> : <FaRegBookmark />} Bookmark
                          </button>
                          <button
                            onClick={() => setShowReportModal(true)}
                            className="px-3 py-1.5 bg-transparent hover:bg-red-500/10 border border-white/5 text-slate-400 hover:text-red-400 rounded-xl text-[10px] font-black flex items-center gap-1 transition-all"
                          >
                            <FaExclamationTriangle size={10} /> Flag
                          </button>
                        </div>
                      </div>

                      {/* Display parsing summary contents */}
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center py-1">
                          <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Candidate Name:</span>
                          <span className="text-xs text-white font-bold">{resumeDetail.parsedData?.name || 'Anonymous'}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-t border-white/5 pt-3">
                          <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Extracted Tech Skills:</span>
                          <div className="flex flex-wrap gap-1 max-w-[280px] justify-end">
                            {(resumeDetail.parsedData?.skills || []).slice(0, 8).map((s, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-purple-600/15 border border-purple-500/15 rounded text-[9px] text-purple-400 font-bold">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <a
                        href={getAbsolutePdfUrl(resumeDetail.fileUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 w-full py-2.5 bg-[#1a1a24] hover:bg-[#20202a] text-slate-300 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 border border-white/5 transition-colors cursor-pointer"
                      >
                        <FaFilePdf size={12} /> View Original Document File Link
                      </a>
                    </div>

                    {/* Community Comments Thread */}
                    <div className="bg-[#121217] border border-white/5 p-6 rounded-3xl shadow-xl flex flex-col gap-6">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider border-b border-white/5 pb-2">Community Review Comments</h4>

                      {/* Submit comment form */}
                      <form onSubmit={handleCommentSubmit} className="flex gap-3">
                        <input
                          type="text"
                          placeholder="Ask community review or suggest improvements..."
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          className="flex-1 px-4 py-2.5 bg-[#181820] border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 placeholder-slate-500"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-md"
                        >
                          Send
                        </button>
                      </form>

                      {/* Comment lists */}
                      {loadingComments ? (
                        <div className="py-8 flex items-center justify-center">
                          <FaSpinner className="animate-spin text-purple-500" size={20} />
                        </div>
                      ) : comments.length === 0 ? (
                        <div className="py-8 text-center text-slate-500 text-xs">
                          No review comments posted yet. Start the conversation!
                        </div>
                      ) : (
                        <div className="flex flex-col gap-5">
                          {comments.map((comment) => (
                            <div key={comment._id} className="flex flex-col gap-3">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                                  {comment.user?.avatar?.url && <img src={comment.user.avatar.url} alt="pic" className="w-full h-full object-cover" />}
                                </div>
                                <div className="flex-1">
                                  <div className="bg-[#1a1a24]/60 border border-white/5 p-3.5 rounded-2xl">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-xs font-black text-white">@{comment.user?.username}</span>
                                      <span className="text-[8px] text-slate-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-300 leading-normal">{comment.content}</p>
                                  </div>

                                  {/* Action reply triggers */}
                                  <div className="flex gap-3 mt-1.5 ml-2">
                                    <button
                                      onClick={() => setActiveReplyBox(activeReplyBox === comment._id ? null : comment._id)}
                                      className="text-[9px] font-black text-purple-400 hover:underline"
                                    >
                                      Reply
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Nested replies list */}
                              {(comment.replies || []).map((reply, idx) => (
                                <div key={idx} className="flex items-start gap-3 ml-10">
                                  <div className="w-7 h-7 rounded-xl overflow-hidden bg-slate-850 shrink-0">
                                    {reply.user?.avatar?.url && <img src={reply.user.avatar.url} alt="pic" className="w-full h-full object-cover" />}
                                  </div>
                                  <div className="flex-1 bg-[#20202a]/30 border border-white/5 p-3 rounded-2xl">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-xs font-black text-white">@{reply.user?.username}</span>
                                      <span className="text-[8px] text-slate-500">{new Date(reply.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-350">{reply.content}</p>
                                  </div>
                                </div>
                              ))}

                              {/* Reply inline box */}
                              {activeReplyBox === comment._id && (
                                <form onSubmit={(e) => handleReplySubmit(comment._id, e)} className="flex gap-2 ml-10 mt-1">
                                  <input
                                    type="text"
                                    placeholder="Write a reply..."
                                    value={replyInputs[comment._id] || ''}
                                    onChange={(e) => setReplyInputs(prev => ({ ...prev, [comment._id]: e.target.value }))}
                                    className="flex-1 px-3 py-2 bg-[#181820] border border-white/5 rounded-lg text-[10px] text-white focus:outline-none focus:border-purple-500 placeholder-slate-500"
                                  />
                                  <button
                                    type="submit"
                                    className="px-3 py-2 bg-purple-650 hover:bg-purple-700 text-white rounded-lg text-[10px] font-black"
                                  >
                                    Post
                                  </button>
                                </form>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Right Column (col-span-5): Score Breakdown, Community ratings & rate trigger */}
                  <div className="lg:col-span-5 flex flex-col gap-6 text-left">
                    
                    {/* Score indicators */}
                    <div className="bg-[#121217] border border-white/5 p-6 rounded-3xl shadow-xl flex flex-col gap-5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Parser Scores</span>
                        <span className="px-2.5 py-0.5 bg-purple-600/10 border border-purple-500/20 text-purple-400 rounded-full text-[9px] font-black">
                          ATS: {resumeDetail.atsScore}%
                        </span>
                      </div>

                      {/* Show average ratings from community */}
                      {(() => {
                        const ratings = resumeDetail.ratings || [];
                        const avg = (field) => {
                          if (ratings.length === 0) return 5;
                          const sum = ratings.reduce((acc, curr) => acc + (curr[field] || 5), 0);
                          return Math.round((sum / ratings.length) * 10) / 10;
                        };

                        return (
                          <div className="flex flex-col gap-3 text-xs">
                            {[
                              { id: 'layout', label: 'Resume Layout' },
                              { id: 'projects', label: 'Projects Metric' },
                              { id: 'skills', label: 'Technical Skills' },
                              { id: 'experience', label: 'Experience History' },
                              { id: 'design', label: 'Visual Design' },
                              { id: 'ats', label: 'ATS Friendliness' },
                              { id: 'overall', label: 'Overall Average' }
                            ].map(item => (
                              <div key={item.id} className="flex justify-between items-center py-0.5 border-b border-white/5 last:border-0">
                                <span className="font-bold text-slate-400">{item.label}</span>
                                <div className="flex items-center gap-1.5">
                                  {renderStars(avg(item.id))}
                                  <span className="text-[10px] text-white font-black">{avg(item.id)}/5</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}

                      {/* Add rating review button */}
                      <button
                        onClick={() => setShowRatingModal(true)}
                        className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/15"
                      >
                        <FaStar size={10} /> Submit Review Ratings
                      </button>
                    </div>

                    {/* AI Feedback auto generator summaries */}
                    <div className="bg-[#121217] border border-white/5 p-6 rounded-3xl shadow-xl flex flex-col gap-4">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Automatic AI Feedback Summary</h4>
                      
                      <div className="flex flex-col gap-3 text-xs text-slate-350 leading-relaxed">
                        <div className="p-3 bg-purple-600/5 border border-purple-500/10 rounded-2xl">
                          <span className="font-black text-purple-400 block mb-1">Impact Metric Review:</span>
                          <p className="text-[10.5px] italic text-slate-400">"{resumeDetail.aiAnalysis?.impact || 'Experience and project descriptions should highlight measurable outcomes (percentages, dollars, counts) to satisfy modern recruiter screenings.'}"</p>
                        </div>
                        <div className="p-3 bg-purple-600/5 border border-purple-500/10 rounded-2xl">
                          <span className="font-black text-purple-400 block mb-1">Missing Keywords Check:</span>
                          <p className="text-[10.5px] italic text-slate-400">"The resume matches multiple core engineering properties, but lacks explicit references to: {(resumeDetail.keywords?.missing || []).slice(0, 3).join(', ') || 'No major missing keywords'}."</p>
                        </div>
                      </div>
                    </div>

                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rating Modal */}
        {showRatingModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRatingModal(false)} />
            <div className="bg-[#121217] border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl max-w-md w-full relative z-10 text-left animate-in zoom-in-95 duration-200">
              
              <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-5">
                <h3 className="text-base font-black text-white">Rate Resume</h3>
                <button onClick={() => setShowRatingModal(false)} className="text-slate-400 hover:text-white"><FaTimes size={16} /></button>
              </div>

              <form onSubmit={handleRatingSubmit} className="flex flex-col gap-4 text-xs">
                {[
                  { id: 'layout', label: 'Resume Layout', val: ratingLayout, set: setRatingLayout },
                  { id: 'projects', label: 'Projects Metric', val: ratingProjects, set: setRatingProjects },
                  { id: 'skills', label: 'Technical Skills', val: ratingSkills, set: setRatingSkills },
                  { id: 'experience', label: 'Experience History', val: ratingExperience, set: setRatingExperience },
                  { id: 'design', label: 'Visual Design', val: ratingDesign, set: setRatingDesign },
                  { id: 'ats', label: 'ATS Friendliness', val: ratingAts, set: setRatingAts },
                  { id: 'overall', label: 'Overall Rating', val: ratingOverall, set: setRatingOverall }
                ].map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <span className="font-bold text-slate-350">{item.label}</span>
                    <div className="flex gap-1.5 items-center">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => item.set(star)}
                          className="text-sm cursor-pointer p-0.5 hover:scale-115 transition-transform"
                        >
                          <FaStar className={star <= item.val ? 'text-amber-400' : 'text-slate-700'} />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="font-bold text-slate-350">Detailed Feedback (Optional)</label>
                  <textarea
                    value={ratingFeedback}
                    onChange={(e) => setRatingFeedback(e.target.value)}
                    placeholder="Provide constructive feedback for the developer..."
                    rows={3}
                    className="w-full px-3 py-2 bg-[#1e1e24] border border-white/5 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingRating}
                  className="mt-4 w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2"
                >
                  {submittingRating ? <FaSpinner className="animate-spin" /> : 'Submit Ratings'}
                </button>
              </form>

            </div>
          </div>
        )}

        {/* Flag Modal */}
        {showReportModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowReportModal(false)} />
            <div className="bg-[#121217] border border-white/10 p-6 rounded-3xl shadow-2xl max-w-sm w-full relative z-10 text-left animate-in zoom-in-95 duration-200">
              
              <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                <h3 className="text-sm font-black text-white">Flag Shared Resume</h3>
                <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-white"><FaTimes size={16} /></button>
              </div>

              <form onSubmit={handleReportSubmit} className="flex flex-col gap-4 text-xs">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-350">Reason for flagging</label>
                  <textarea
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Describe why this resume should be hidden (spam, offensive, plagiarism, personal data leak)..."
                    rows={3}
                    className="w-full px-3 py-2 bg-[#1e1e24] border border-white/5 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReport || !reportReason.trim()}
                  className="w-full py-2.5 bg-red-650 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2"
                >
                  {submittingReport ? <FaSpinner className="animate-spin" /> : 'Flag Content'}
                </button>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CommunityResumeHub;
