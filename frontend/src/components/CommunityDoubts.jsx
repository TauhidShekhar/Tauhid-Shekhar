import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import socket from '../services/socket';
import { 
  FaQuestionCircle, FaPlus, FaTimes, FaSpinner, FaSearch, 
  FaUser, FaThumbsUp, FaThumbsDown, FaBookmark, FaCheck, FaTrash 
} from 'react-icons/fa';

const CATEGORIES = [
  'All', 'HTML', 'CSS', 'JavaScript', 'React', 'Node', 'Express', 
  'MongoDB', 'Python', 'Java', 'C++', 'DSA', 'AI', 'Cloud', 'Career', 'Other'
];

const CommunityDoubts = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest');

  // Modal / Detailed View States
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questionAnswers, setQuestionAnswers] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Form States
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('React');
  const [tags, setTags] = useState('');
  const [answerContent, setAnswerContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  // Image Upload States
  const [uploadedQuestionImages, setUploadedQuestionImages] = useState([]);
  const [uploadedAnswerImages, setUploadedAnswerImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Lightbox States
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState(null);
  const [lightboxZoom, setLightboxZoom] = useState(1);

  // Editing States
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [editQuestionTitle, setEditQuestionTitle] = useState('');
  const [editQuestionContent, setEditQuestionContent] = useState('');
  const [editQuestionCategory, setEditQuestionCategory] = useState('React');
  const [editQuestionTags, setEditQuestionTags] = useState('');
  const [editQuestionImages, setEditQuestionImages] = useState([]);

  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editAnswerContent, setEditAnswerContent] = useState('');
  const [editAnswerImages, setEditAnswerImages] = useState([]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = { sort: sortOption };
      if (filterCategory !== 'All') params.category = filterCategory;
      if (searchQuery) params.search = searchQuery;
      const res = await api.getCommunityQuestions(params);
      if (res.success) {
        setQuestions(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [filterCategory, searchQuery, sortOption]);

  // Real-time socket event synchronization for doubts board
  useEffect(() => {
    socket.on('question_change', (data) => {
      if (data.action === 'create') {
        setQuestions(prev => {
          if (prev.some(q => q._id === data.data._id)) return prev;
          if (filterCategory !== 'All' && data.data.category !== filterCategory) return prev;
          return [data.data, ...prev];
        });
      }
    });

    return () => {
      socket.off('question_change');
    };
  }, [filterCategory]);

  const handleImageUpload = async (files, type = 'question') => {
    setUploadingImages(true);
    const uploaded = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
          alert('Invalid file format. Please upload JPG, PNG, JPEG, WEBP or GIF.');
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          alert('File size exceeds 5MB limit.');
          continue;
        }

        const formData = new FormData();
        formData.append('image', file);
        
        const res = await api.uploadCommunityImage(formData);
        if (res.success) {
          uploaded.push({ url: res.url, publicId: res.publicId });
        }
      }
      if (type === 'question') {
        setUploadedQuestionImages(prev => [...prev, ...uploaded]);
      } else if (type === 'edit-question') {
        setEditQuestionImages(prev => [...prev, ...uploaded]);
      } else if (type === 'edit-answer') {
        setEditAnswerImages(prev => [...prev, ...uploaded]);
      } else {
        setUploadedAnswerImages(prev => [...prev, ...uploaded]);
      }
    } catch (err) {
      alert('Image upload failed: ' + err.message);
    } finally {
      setUploadingImages(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxImages) return;
      if (e.key === 'Escape') setLightboxImages(null);
      if (e.key === 'ArrowRight') setLightboxIndex(prev => (prev === lightboxImages.length - 1 ? 0 : prev + 1));
      if (e.key === 'ArrowLeft') setLightboxIndex(prev => (prev === 0 ? lightboxImages.length - 1 : prev - 1));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImages]);

  const startEditQuestion = () => {
    if (!selectedQuestion) return;
    setEditQuestionTitle(selectedQuestion.title);
    setEditQuestionContent(selectedQuestion.content);
    setEditQuestionCategory(selectedQuestion.category);
    setEditQuestionTags(selectedQuestion.tags?.join(', ') || '');
    setEditQuestionImages(selectedQuestion.images || []);
    setIsEditingQuestion(true);
  };

  const handleUpdateQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedQuestion) return;
    try {
      const payload = {
        title: editQuestionTitle,
        content: editQuestionContent,
        category: editQuestionCategory,
        tags: editQuestionTags,
        images: editQuestionImages
      };
      const res = await api.updateCommunityQuestion(selectedQuestion._id, payload);
      if (res.success) {
        setSelectedQuestion(res.data);
        setQuestions(prev => prev.map(q => q._id === res.data._id ? res.data : q));
        setIsEditingQuestion(false);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update question: ' + err.message);
    }
  };

  const startEditAnswer = (ans) => {
    setEditingAnswerId(ans._id);
    setEditAnswerContent(ans.content);
    setEditAnswerImages(ans.images || []);
  };

  const handleUpdateAnswerSubmit = async (e, answerId) => {
    e.preventDefault();
    try {
      const res = await api.updateCommunityAnswer(answerId, {
        content: editAnswerContent,
        images: editAnswerImages
      });
      if (res.success) {
        setQuestionAnswers(prev => prev.map(a => a._id === answerId ? res.data : a));
        setEditingAnswerId(null);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update answer: ' + err.message);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!title || !content) return;
    setSubmitting(true);
    try {
      const payload = { title, content, category, tags, images: uploadedQuestionImages };
      const res = await api.createCommunityQuestion(payload);
      if (res.success) {
        setQuestions([res.data, ...questions]);
        setShowAddModal(false);
        // Reset
        setTitle('');
        setContent('');
        setCategory('React');
        setTags('');
        setUploadedQuestionImages([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenQuestionDetails = async (question) => {
    setSelectedQuestion(question);
    setLoadingDetails(true);
    try {
      const res = await api.getCommunityQuestionDetails(question._id);
      if (res.success) {
        setQuestionAnswers(res.data.answers || []);
        // Update views count locally
        setQuestions(questions.map(q => 
          q._id === question._id ? { ...q, views: (q.views || 0) + 1 } : q
        ));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleVoteQuestion = async (questionId, voteType) => {
    try {
      const res = await api.voteCommunityQuestion(questionId, voteType);
      if (res.success) {
        const updater = q => q._id === questionId ? { ...q, upvotes: res.upvotes, downvotes: res.downvotes } : q;
        setQuestions(questions.map(updater));
        if (selectedQuestion?._id === questionId) {
          setSelectedQuestion({ ...selectedQuestion, upvotes: res.upvotes, downvotes: res.downvotes });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookmarkQuestion = async (questionId) => {
    try {
      const res = await api.bookmarkCommunityQuestion(questionId);
      if (res.success) {
        alert(res.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!answerContent || !selectedQuestion) return;
    setSubmittingAnswer(true);
    try {
      const res = await api.createCommunityAnswer(selectedQuestion._id, {
        content: answerContent,
        images: uploadedAnswerImages
      });
      if (res.success) {
        setQuestionAnswers([...questionAnswers, res.data]);
        setAnswerContent('');
        setUploadedAnswerImages([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleVoteAnswer = async (answerId, voteType) => {
    try {
      const res = await api.voteCommunityAnswer(answerId, voteType);
      if (res.success) {
        setQuestionAnswers(questionAnswers.map(a => 
          a._id === answerId ? { ...a, upvotes: res.upvotes, downvotes: res.downvotes } : a
        ));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    try {
      const res = await api.acceptCommunityAnswer(answerId);
      if (res.success) {
        setQuestionAnswers(questionAnswers.map(a => 
          a._id === answerId ? { ...a, isAccepted: true } : { ...a, isAccepted: false }
        ));
        setSelectedQuestion({ ...selectedQuestion, acceptedAnswer: answerId });
        // Update list
        setQuestions(questions.map(q => 
          q._id === selectedQuestion._id ? { ...q, acceptedAnswer: { _id: answerId } } : q
        ));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Delete this question? This will delete all answers.')) return;
    try {
      const res = await api.deleteCommunityQuestion(questionId);
      if (res.success) {
        setQuestions(questions.filter(q => q._id !== questionId));
        setSelectedQuestion(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    if (!window.confirm('Delete this answer?')) return;
    try {
      const res = await api.deleteCommunityAnswer(answerId);
      if (res.success) {
        setQuestionAnswers(questionAnswers.filter(a => a._id !== answerId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto p-4 sm:p-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-black font-title text-black dark:text-white flex items-center gap-2">
            <FaQuestionCircle className="text-primary-blue" /> Doubt Lounge (Q&A)
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">Get stuck? Ask the community and solve your engineering errors.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-primary-blue hover:bg-accent-blue text-white rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-md shadow-primary-blue/15 w-fit"
        >
          <FaPlus /> Ask Question
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 p-4 rounded-2xl shadow-sm">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto overflow-x-auto py-1">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-white border border-slate-200 dark:border-white/5 rounded-xl cursor-pointer"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat} Lounge</option>
            ))}
          </select>

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-white border border-slate-200 dark:border-white/5 rounded-xl cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="top">Highest Voted</option>
            <option value="views">Most Viewed</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-300 text-xs" />
          <input
            type="text"
            placeholder="Search questions by topic/keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 focus:border-primary-blue"
          />
        </div>
      </div>

      {/* Questions list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <FaSpinner className="animate-spin text-2xl text-primary-blue" />
          <p className="text-xs text-slate-450 font-bold">Fetching developer questions...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-3xl p-8">
          <FaQuestionCircle size={40} className="text-slate-300 dark:text-slate-350 mb-3" />
          <p className="text-sm font-black text-black dark:text-white">No questions in this lounge</p>
          <p className="text-xs text-slate-450 mt-1 max-w-sm">Have a question? Don't hesitate to post it and get answers from experts!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {questions.map((q) => (
            <div 
              key={q._id}
              onClick={() => handleOpenQuestionDetails(q)}
              className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-2xl p-5 shadow-sm hover:translate-y-[-1px] transition-all duration-300 cursor-pointer flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 bg-primary-blue/5 border border-primary-blue/15 text-primary-blue rounded-md text-[9px] font-black uppercase tracking-wider">
                    {q.category}
                  </span>
                  {q.acceptedAnswer && (
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-550/10 text-emerald-500 rounded-md text-[9px] font-black uppercase tracking-wider">
                      <FaCheck size={8} /> Solved
                    </span>
                  )}
                </div>
                <h3 className="font-extrabold font-title text-sm text-black dark:text-white hover:text-primary-blue transition-colors line-clamp-1">
                  {q.title}
                </h3>
                <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-450 font-bold">
                  <div className="flex items-center gap-1">
                    {q.author?.avatar?.url ? (
                      <img src={q.author.avatar.url} alt="" className="w-4 h-4 rounded-full object-cover" loading="lazy" decoding="async" />
                    ) : (
                      <FaUser size={10} />
                    )}
                    <span className="text-slate-655 dark:text-slate-350">{q.author?.fullName || 'Anonymous'}</span>
                  </div>
                  <span>•</span>
                  <span>{new Date(q.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{q.views || 0} views</span>
                </div>
              </div>

              {/* Stats badges */}
              <div className="flex gap-4 items-center shrink-0">
                <div className="flex flex-col items-center">
                  <span className="text-xs font-black text-black dark:text-white">{q.upvotes?.length || 0}</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase">Votes</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs font-black text-slate-450">{q.bookmarks?.length || 0}</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase">Bookmarks</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ask Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-3xl p-6 sm:p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-4 mb-5">
              <h2 className="text-lg font-black font-title text-black dark:text-white">Ask a Question</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <FaTimes size={18} />
              </button>
            </div>

            <form onSubmit={handleAskQuestion} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Question Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="e.g. How to resolve 'Cannot read properties of undefined (reading 'map')' in React?" 
                  className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl focus:border-primary-blue"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Category Lounge</label>
                  <select 
                    value={category} 
                    onChange={e => setCategory(e.target.value)} 
                    className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl focus:border-primary-blue"
                  >
                    {CATEGORIES.slice(1).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Tags (Comma-separated)</label>
                  <input 
                    type="text" 
                    value={tags} 
                    onChange={e => setTags(e.target.value)} 
                    placeholder="react, hooks, array" 
                    className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl focus:border-primary-blue"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Question Body</label>
                <textarea 
                  value={content} 
                  onChange={e => setContent(e.target.value)} 
                  placeholder="Provide logs, code blocks, screenshots context and steps to reproduce your issue." 
                  rows="6"
                  className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl focus:border-primary-blue resize-none"
                  required
                />
              </div>

              {/* Multiple Images Drag & Drop upload container */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Attach Screenshots / Diagrams</label>
                <div 
                  className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-6 text-center hover:border-primary-blue/50 dark:hover:border-primary-blue/50 transition-colors cursor-pointer relative bg-slate-50 dark:bg-slate-950"
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    handleImageUpload(e.dataTransfer.files, 'question');
                  }}
                  onClick={() => document.getElementById('question-image-input').click()}
                >
                  <input 
                    type="file" 
                    id="question-image-input" 
                    multiple 
                    accept="image/*" 
                    className="hidden" 
                    onChange={e => handleImageUpload(e.target.files, 'question')}
                  />
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-bold">Drag & drop images here or Click to select</p>
                  <span className="text-[9px] text-slate-450 block mt-1">Supports JPG, PNG, JPEG, WEBP, GIF (Max 5MB per file)</span>
                </div>
                {uploadingImages && (
                  <div className="flex items-center gap-2 text-[10px] font-bold text-primary-blue">
                    <FaSpinner className="animate-spin text-xs" /> Uploading image attachments...
                  </div>
                )}
                {uploadedQuestionImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {uploadedQuestionImages.map((img, idx) => (
                      <div key={idx} className="relative w-full h-16 bg-[#1a1a24] rounded-xl overflow-hidden border border-slate-200 dark:border-white/5 group">
                        <img src={img.url} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadedQuestionImages(prev => prev.filter((_, i) => i !== idx));
                          }}
                          className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-650 text-white rounded-full text-[8px] transition-colors cursor-pointer flex items-center justify-center"
                        >
                          <FaTimes size={8} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-4 border-t border-slate-100 dark:border-white/5 pt-5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-3 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-350 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-primary-blue hover:bg-accent-blue text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-md shadow-primary-blue/15"
                >
                  {submitting ? 'Posting...' : 'Ask Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detailed Question View Drawer */}
      {selectedQuestion && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex justify-end">
          <div className="bg-white dark:bg-slate-900 border-l border-slate-200/60 dark:border-white/5 w-full max-w-2xl h-full p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Header / Question Scroll Content */}
            <div className="overflow-y-auto max-h-[85vh] pr-2 text-left">
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-white/5 pb-4 mb-4">
                <div>
                  <span className="px-2 py-0.5 bg-primary-blue/5 border border-primary-blue/15 text-primary-blue rounded text-[9px] font-black uppercase tracking-wider mb-2 inline-block">
                    {selectedQuestion.category}
                  </span>
                  <h2 className="text-base font-black font-title text-black dark:text-white">
                    {selectedQuestion.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400 font-bold">
                    <span>Asked by {selectedQuestion.author?.fullName}</span>
                    <span>•</span>
                    <span>{new Date(selectedQuestion.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedQuestion(null)}
                  className="text-slate-400 hover:text-black dark:hover:text-white cursor-pointer p-1"
                >
                  <FaTimes size={18} />
                </button>
              </div>

              {/* Body */}
              {isEditingQuestion ? (
                <form onSubmit={handleUpdateQuestionSubmit} className="flex flex-col gap-4 mb-6">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Question Title</label>
                    <input 
                      type="text" 
                      value={editQuestionTitle} 
                      onChange={e => setEditQuestionTitle(e.target.value)} 
                      className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl focus:border-primary-blue"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Category Lounge</label>
                      <select 
                        value={editQuestionCategory} 
                        onChange={e => setEditQuestionCategory(e.target.value)} 
                        className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl focus:border-primary-blue"
                      >
                        {CATEGORIES.slice(1).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Tags (Comma-separated)</label>
                      <input 
                        type="text" 
                        value={editQuestionTags} 
                        onChange={e => setEditQuestionTags(e.target.value)} 
                        className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl focus:border-primary-blue"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Question Body</label>
                    <textarea 
                      value={editQuestionContent} 
                      onChange={e => setEditQuestionContent(e.target.value)} 
                      rows="6"
                      className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl focus:border-primary-blue resize-none"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Attached Screenshots / Diagrams</label>
                    <div 
                      className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-6 text-center hover:border-primary-blue/50 dark:hover:border-primary-blue/50 transition-colors cursor-pointer relative bg-slate-50 dark:bg-slate-955"
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => {
                        e.preventDefault();
                        handleImageUpload(e.dataTransfer.files, 'edit-question');
                      }}
                      onClick={() => document.getElementById('edit-question-image-input').click()}
                    >
                      <input 
                        type="file" 
                        id="edit-question-image-input" 
                        multiple 
                        accept="image/*" 
                        className="hidden" 
                        onChange={e => handleImageUpload(e.target.files, 'edit-question')}
                      />
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-bold">Drag & drop images here or Click to select</p>
                      <span className="text-[9px] text-slate-450 block mt-1">Supports JPG, PNG, JPEG, WEBP, GIF (Max 5MB per file)</span>
                    </div>
                    {uploadingImages && (
                      <div className="flex items-center gap-2 text-[10px] font-bold text-primary-blue">
                        <FaSpinner className="animate-spin text-xs" /> Uploading image attachments...
                      </div>
                    )}
                    {editQuestionImages.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {editQuestionImages.map((img, idx) => (
                          <div key={idx} className="relative w-full h-16 bg-[#1a1a24] rounded-xl overflow-hidden border border-slate-200 dark:border-white/5 group">
                            <img src={img.url} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditQuestionImages(prev => prev.filter((_, i) => i !== idx));
                              }}
                              className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-650 text-white rounded-full text-[8px] transition-colors cursor-pointer flex items-center justify-center"
                            >
                              <FaTimes size={8} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-white/5 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditingQuestion(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-150 dark:bg-white/5 text-slate-700 dark:text-slate-350 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-primary-blue hover:bg-accent-blue text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-md shadow-primary-blue/15"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-150 dark:border-white/5 rounded-2xl mb-4">
                    <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                      {selectedQuestion.content}
                    </p>
                  </div>

                  {/* Question image attachment gallery */}
                  {selectedQuestion.images && selectedQuestion.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-6">
                      {selectedQuestion.images.map((img, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => openLightbox(selectedQuestion.images, idx)}
                          className="relative w-full h-28 bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden border border-slate-200 dark:border-white/5 hover:opacity-90 transition-all cursor-zoom-in animate-in fade-in duration-200"
                        >
                          <img src={img.url} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Actions */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => handleVoteQuestion(selectedQuestion._id, 'upvote')}
                  className={`flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
                    selectedQuestion.upvotes?.includes(user?.id) ? 'text-primary-blue' : 'text-slate-400'
                  }`}
                >
                  <FaThumbsUp /> Upvote ({selectedQuestion.upvotes?.length || 0})
                </button>
                <button
                  onClick={() => handleVoteQuestion(selectedQuestion._id, 'downvote')}
                  className={`flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
                    selectedQuestion.downvotes?.includes(user?.id) ? 'text-red-500' : 'text-slate-400'
                  }`}
                >
                  <FaThumbsDown /> Downvote ({selectedQuestion.downvotes?.length || 0})
                </button>
                <button
                  onClick={() => handleBookmarkQuestion(selectedQuestion._id)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <FaBookmark /> Bookmark
                </button>
                {(selectedQuestion.author?._id === user?.id || user?.role === 'Admin') && (
                  <>
                    <button
                      onClick={startEditQuestion}
                      className="flex items-center gap-1.5 text-xs font-bold text-primary-blue cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(selectedQuestion._id)}
                      className="flex items-center gap-1.5 text-xs font-bold text-red-500 ml-auto cursor-pointer"
                    >
                      <FaTrash /> Delete
                    </button>
                  </>
                )}
              </div>

              {/* Answers list */}
              <div className="border-t border-slate-100 dark:border-white/5 pt-5">
                <h3 className="text-xs font-black text-black dark:text-white uppercase tracking-wider mb-4">
                  Answers ({questionAnswers.length})
                </h3>

                {loadingDetails ? (
                  <FaSpinner className="animate-spin text-primary-blue text-lg mx-auto my-5" />
                ) : questionAnswers.length === 0 ? (
                  <p className="text-xs text-slate-450 font-bold text-center my-6">No answers posted yet. Solve this doubt!</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {questionAnswers.map((ans) => {
                      const isEditingThisAnswer = editingAnswerId === ans._id;
                      return (
                        <div 
                          key={ans._id}
                          className={`p-4 rounded-2xl border ${
                            ans.isAccepted 
                              ? 'bg-emerald-550/5 border-emerald-500/30' 
                              : 'bg-slate-50 dark:bg-white/5 border-slate-150 dark:border-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {ans.author?.avatar?.url ? (
                              <img src={ans.author.avatar.url} alt="" className="w-5 h-5 rounded-full object-cover" loading="lazy" decoding="async" />
                            ) : (
                              <FaUser size={10} className="text-slate-400" />
                            )}
                            <span className="text-[10px] font-black text-slate-700 dark:text-slate-200">
                              {ans.author?.fullName}
                            </span>
                            {ans.isAccepted && (
                              <span className="flex items-center gap-0.5 px-2 py-0.5 bg-emerald-500 text-white rounded text-[8px] font-black ml-2">
                                <FaCheck size={7} /> Accepted
                              </span>
                            )}
                            <span className="text-[8px] text-slate-400 ml-auto">{new Date(ans.createdAt).toLocaleDateString()}</span>
                          </div>

                          {isEditingThisAnswer ? (
                            <form onSubmit={(e) => handleUpdateAnswerSubmit(e, ans._id)} className="flex flex-col gap-2">
                              <textarea 
                                value={editAnswerContent}
                                onChange={e => setEditAnswerContent(e.target.value)}
                                rows="3"
                                className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl focus:border-primary-blue resize-none"
                                required
                              />
                              <div className="flex flex-col gap-1">
                                <input 
                                  type="file" 
                                  id={`edit-answer-image-input-${ans._id}`}
                                  multiple 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={e => handleImageUpload(e.target.files, 'edit-answer')}
                                />
                                <button
                                  type="button"
                                  onClick={() => document.getElementById(`edit-answer-image-input-${ans._id}`).click()}
                                  className="px-3 py-1.5 bg-slate-150 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-350 rounded-lg text-[9px] font-bold uppercase tracking-wider cursor-pointer w-fit"
                                >
                                  📷 Edit Screenshots
                                </button>
                                {editAnswerImages.length > 0 && (
                                  <div className="grid grid-cols-6 gap-1.5 mt-1.5">
                                    {editAnswerImages.map((img, idx) => (
                                      <div key={idx} className="relative w-full h-10 bg-[#1a1a24] rounded-lg overflow-hidden border border-white/5 group">
                                        <img src={img.url} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                                        <button
                                          type="button"
                                          onClick={() => setEditAnswerImages(prev => prev.filter((_, i) => i !== idx))}
                                          className="absolute top-0.5 right-0.5 p-0.5 bg-red-500 text-white rounded-full text-[6px] hover:bg-red-650 opacity-100 cursor-pointer flex items-center justify-center"
                                        >
                                          <FaTimes size={6} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2 justify-end">
                                <button 
                                  type="button"
                                  onClick={() => setEditingAnswerId(null)}
                                  className="px-3 py-1.5 bg-slate-150 dark:bg-white/5 text-slate-700 dark:text-slate-350 rounded-lg text-[10px] font-bold"
                                >
                                  Cancel
                                </button>
                                <button 
                                  type="submit"
                                  className="px-4 py-1.5 bg-primary-blue hover:bg-accent-blue text-white rounded-lg text-[10px] font-black uppercase tracking-wider"
                                >
                                  Save
                                </button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <p className="text-xs text-slate-655 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                                {ans.content}
                              </p>

                              {/* Answer gallery */}
                              {ans.images && ans.images.length > 0 && (
                                <div className="grid grid-cols-4 gap-2 mt-3 mb-2">
                                  {ans.images.map((img, idx) => (
                                    <div 
                                      key={idx} 
                                      onClick={() => openLightbox(ans.images, idx)}
                                      className="relative w-full h-16 bg-slate-100 dark:bg-slate-950 rounded-lg overflow-hidden border border-slate-200 dark:border-white/5 hover:opacity-90 transition-all cursor-zoom-in animate-in fade-in duration-200"
                                    >
                                      <img src={img.url} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          )}

                          {/* Answer Footer / Actions */}
                          <div className="flex gap-4 mt-3 border-t border-slate-100 dark:border-white/5 pt-3 text-[10px] font-extrabold text-slate-450">
                            <button 
                              onClick={() => handleVoteAnswer(ans._id, 'upvote')}
                              className={`flex items-center gap-1 cursor-pointer ${ans.upvotes?.includes(user?.id) ? 'text-primary-blue' : ''}`}
                            >
                              <FaThumbsUp /> Upvote ({ans.upvotes?.length || 0})
                            </button>
                            <button 
                              onClick={() => handleVoteAnswer(ans._id, 'downvote')}
                              className={`flex items-center gap-1 cursor-pointer ${ans.downvotes?.includes(user?.id) ? 'text-red-500' : ''}`}
                            >
                              <FaThumbsDown /> Downvote ({ans.downvotes?.length || 0})
                            </button>

                            {/* Accept trigger */}
                            {(!selectedQuestion.acceptedAnswer && (selectedQuestion.author?._id === user?.id || user?.role === 'Admin')) && (
                              <button 
                                onClick={() => handleAcceptAnswer(ans._id)}
                                className="text-emerald-500 ml-auto flex items-center gap-1 cursor-pointer"
                              >
                                <FaCheck /> Accept Answer
                              </button>
                            )}

                            {/* Edit / Delete Answer */}
                            {(ans.author?._id === user?.id || user?.role === 'Admin') && (
                              <div className="ml-auto flex items-center gap-2">
                                {!isEditingThisAnswer && (
                                  <button 
                                    onClick={() => startEditAnswer(ans)}
                                    className="text-primary-blue flex items-center gap-1 cursor-pointer"
                                  >
                                    Edit
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleDeleteAnswer(ans._id)}
                                  className="text-red-500 flex items-center gap-1 cursor-pointer"
                                >
                                  <FaTrash /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Answer Input Footer */}
            <div className="border-t border-slate-100 dark:border-white/5 pt-4 mt-4 flex flex-col gap-3">
              <form onSubmit={handlePostAnswer} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Write your answer details..." 
                  value={answerContent}
                  onChange={e => setAnswerContent(e.target.value)}
                  className="flex-1 text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl focus:border-primary-blue"
                  required
                />
                <button 
                  type="submit" 
                  disabled={submittingAnswer}
                  className="px-5 py-3 bg-primary-blue hover:bg-accent-blue text-white rounded-xl text-xs font-black uppercase cursor-pointer"
                >
                  {submittingAnswer ? 'Posting...' : 'Answer'}
                </button>
              </form>

              {/* Attachments Preview & Button */}
              <div className="flex flex-col gap-2">
                {uploadedAnswerImages.length > 0 && (
                  <div className="grid grid-cols-6 gap-2">
                    {uploadedAnswerImages.map((img, idx) => (
                      <div key={idx} className="relative w-full h-12 bg-[#1a1a24] rounded-lg overflow-hidden border border-white/5 group">
                        <img src={img.url} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                        <button
                          type="button"
                          onClick={() => setUploadedAnswerImages(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-0.5 right-0.5 p-0.5 bg-red-500 text-white rounded-full text-[6px] hover:bg-red-650 opacity-100 cursor-pointer flex items-center justify-center"
                        >
                          <FaTimes size={6} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-2 items-center">
                  <input 
                    type="file" 
                    id="answer-image-input" 
                    multiple 
                    accept="image/*" 
                    className="hidden" 
                    onChange={e => handleImageUpload(e.target.files, 'answer')}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('answer-image-input').click()}
                    className="px-3.5 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-350 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                  >
                    📷 Attach Screenshots
                  </button>
                  {uploadingImages && (
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-primary-blue animate-pulse">
                      <FaSpinner className="animate-spin text-xs" /> Uploading screenshots...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Lightbox Viewer */}
      {lightboxImages && (
        <div className="fixed inset-0 z-[3000] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center select-none animate-in fade-in duration-200">
          {/* Header toolbar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 text-white">
            <span className="text-[10px] font-black uppercase tracking-widest font-mono bg-white/10 px-3 py-1.5 rounded-full border border-white/5">
              {lightboxIndex + 1} of {lightboxImages.length}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setLightboxZoom(prev => Math.min(prev + 0.25, 3))}
                className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-black cursor-pointer transition-colors"
                title="Zoom In"
              >
                🔍+
              </button>
              <button 
                onClick={() => setLightboxZoom(prev => Math.max(prev - 0.25, 0.5))}
                className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-black cursor-pointer transition-colors"
                title="Zoom Out"
              >
                🔍-
              </button>
              <a 
                href={lightboxImages[lightboxIndex]?.url} 
                target="_blank" 
                rel="noreferrer"
                download 
                className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-black cursor-pointer transition-colors flex items-center justify-center text-white"
                title="Download Attachment"
              >
                ⬇️
              </a>
              <button 
                onClick={() => setLightboxImages(null)}
                className="p-2.5 bg-red-500/10 border border-red-500/25 hover:bg-red-500 text-white rounded-xl text-xs font-black cursor-pointer transition-colors"
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Navigation Left */}
          {lightboxImages.length > 1 && (
            <button 
              onClick={() => setLightboxIndex(prev => (prev === 0 ? lightboxImages.length - 1 : prev - 1))}
              className="absolute left-4 p-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl cursor-pointer select-none z-10 transition-colors"
            >
              &larr;
            </button>
          )}

          {/* Image Container */}
          <div className="max-w-[85vw] max-h-[80vh] overflow-hidden flex items-center justify-center transition-transform duration-200" style={{ transform: `scale(${lightboxZoom})` }}>
            <img src={lightboxImages[lightboxIndex]?.url} alt="" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200" loading="lazy" decoding="async" />
          </div>

          {/* Navigation Right */}
          {lightboxImages.length > 1 && (
            <button 
              onClick={() => setLightboxIndex(prev => (prev === lightboxImages.length - 1 ? 0 : prev + 1))}
              className="absolute right-4 p-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl cursor-pointer select-none z-10 transition-colors"
            >
              &rarr;
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CommunityDoubts;
