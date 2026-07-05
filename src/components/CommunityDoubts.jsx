import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
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

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!title || !content) return;
    setSubmitting(true);
    try {
      const payload = { title, content, category, tags };
      const res = await api.createCommunityQuestion(payload);
      if (res.success) {
        setQuestions([res.data, ...questions]);
        setShowAddModal(false);
        // Reset
        setTitle('');
        setContent('');
        setCategory('React');
        setTags('');
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
      const res = await api.createCommunityAnswer(selectedQuestion._id, answerContent);
      if (res.success) {
        setQuestionAnswers([...questionAnswers, res.data]);
        setAnswerContent('');
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
                      <img src={q.author.avatar.url} alt="" className="w-4 h-4 rounded-full object-cover" />
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
              <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-150 dark:border-white/5 rounded-2xl mb-6">
                <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                  {selectedQuestion.content}
                </p>
              </div>

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
                  <button
                    onClick={() => handleDeleteQuestion(selectedQuestion._id)}
                    className="flex items-center gap-1.5 text-xs font-bold text-red-500 ml-auto cursor-pointer"
                  >
                    <FaTrash /> Delete
                  </button>
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
                    {questionAnswers.map((ans) => (
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
                            <img src={ans.author.avatar.url} alt="" className="w-5 h-5 rounded-full object-cover" />
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

                        <p className="text-xs text-slate-655 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                          {ans.content}
                        </p>

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

                          {/* Delete Answer */}
                          {(ans.author?._id === user?.id || user?.role === 'Admin') && (
                            <button 
                              onClick={() => handleDeleteAnswer(ans._id)}
                              className="text-red-500 ml-2 flex items-center gap-1 cursor-pointer"
                            >
                              <FaTrash /> Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Answer Input Footer */}
            <form onSubmit={handlePostAnswer} className="border-t border-slate-100 dark:border-white/5 pt-4 mt-4 flex gap-2">
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
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityDoubts;
