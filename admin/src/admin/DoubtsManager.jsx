import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  FaQuestionCircle, FaSearch, FaTrash, FaCheck, FaTimes, 
  FaSpinner, FaUser, FaComments, FaCalendarAlt, FaEdit, FaPaperPlane, FaCheckCircle
} from 'react-icons/fa';

const CATEGORIES = [
  'HTML', 'CSS', 'JavaScript', 'React', 'Node', 'Express', 
  'MongoDB', 'Python', 'Java', 'C++', 'DSA', 'AI', 'Cloud', 'Career', 'Other'
];

const DoubtsManager = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  
  // Detailed Modal/Drawer
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [newAnswerText, setNewAnswerText] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  // Edit fields
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('');

  const fetchQuestions = async () => {
    try {
      const res = await api.getCommunityQuestions();
      if (res.success) {
        setQuestions(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching questions:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleOpenDetails = async (q) => {
    setSelectedQuestion(q);
    setLoadingDetails(true);
    setIsEditing(false);
    setNewAnswerText('');
    try {
      const res = await api.getCommunityQuestionDetails(q._id);
      if (res.success) {
        setAnswers(res.data?.answers || []);
      }
    } catch (err) {
      console.error('Error loading question details:', err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm('Are you sure you want to delete this doubt? This will remove all associated answers.')) return;
    try {
      const res = await api.deleteCommunityQuestion(qId);
      if (res.success) {
        setQuestions(prev => prev.filter(q => q._id !== qId));
        if (selectedQuestion?._id === qId) {
          setSelectedQuestion(null);
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to delete question');
    }
  };

  const handleDeleteAnswer = async (ansId) => {
    if (!window.confirm('Delete this answer?')) return;
    try {
      const res = await api.deleteCommunityAnswer(ansId);
      if (res.success) {
        setAnswers(prev => prev.filter(a => a._id !== ansId));
      }
    } catch (err) {
      alert(err.message || 'Failed to delete answer');
    }
  };

  const handleAcceptAnswer = async (ansId) => {
    try {
      const res = await api.acceptCommunityAnswer(ansId);
      if (res.success) {
        setAnswers(prev => prev.map(a => a._id === ansId ? { ...a, isAccepted: !a.isAccepted } : a));
      }
    } catch (err) {
      alert(err.message || 'Failed to toggle accepted status');
    }
  };

  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!newAnswerText.trim() || !selectedQuestion) return;
    setSubmittingAnswer(true);
    try {
      const res = await api.createCommunityAnswer(selectedQuestion._id, newAnswerText.trim());
      if (res.success && res.data) {
        setAnswers(prev => [...prev, res.data]);
        setNewAnswerText('');
      }
    } catch (err) {
      alert(err.message || 'Failed to post answer');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleStartEdit = () => {
    if (!selectedQuestion) return;
    setEditTitle(selectedQuestion.title);
    setEditContent(selectedQuestion.content);
    setEditCategory(selectedQuestion.category || 'Other');
    setIsEditing(true);
  };

  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    if (!selectedQuestion) return;
    try {
      const res = await api.updateCommunityQuestion(selectedQuestion._id, {
        title: editTitle,
        content: editContent,
        category: editCategory
      });
      if (res.success) {
        setSelectedQuestion(res.data);
        setQuestions(prev => prev.map(q => q._id === res.data._id ? res.data : q));
        setIsEditing(false);
      }
    } catch (err) {
      alert(err.message || 'Failed to update question');
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = 
      (q.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (q.content || '').toLowerCase().includes(search.toLowerCase()) ||
      (q.author?.fullName || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'All' || q.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start text-left max-w-[1600px] mx-auto animate-fade-in">
      {/* List Container */}
      <div className={`${selectedQuestion ? 'lg:col-span-6' : 'lg:col-span-12'} glass p-5 sm:p-7 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col gap-6`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-bold font-title text-black dark:text-white flex items-center gap-2">
              <FaQuestionCircle className="text-[#C2272D] dark:text-[#00FFFF]" />
              <span>Doubts Lounge & Discussions</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Manage student doubts, write verified replies, and moderate community Q&A.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-600 dark:text-slate-300">
            {filteredQuestions.length} Questions
          </span>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder="Search doubts or author..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141414] text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-[#C2272D] dark:focus:border-[#00FFFF]"
            />
          </div>

          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141414] text-slate-900 dark:text-slate-100 text-xs focus:outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Questions Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-[#C2272D]/20 border-t-[#C2272D] animate-spin" />
            <span className="text-xs text-slate-400 font-bold">Loading doubts lounge...</span>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-16 text-xs sm:text-sm text-slate-400 italic">No doubt records found.</div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pr-4 font-bold">Question Details</th>
                  <th className="pb-3 px-3 font-bold">Category</th>
                  <th className="pb-3 px-3 font-bold">Author</th>
                  <th className="pb-3 pl-3 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredQuestions.map(q => (
                  <tr 
                    key={q._id} 
                    className={`hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer ${
                      selectedQuestion?._id === q._id ? 'bg-[#C2272D]/5 dark:bg-[#00FFFF]/5 font-semibold' : ''
                    }`}
                    onClick={() => handleOpenDetails(q)}
                  >
                    <td className="py-3.5 pr-4">
                      <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{q.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{q.content}</div>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-white/10 text-[#C2272D] dark:text-[#00FFFF] border border-slate-200 dark:border-white/10 rounded-full text-[9px] font-black uppercase">
                        {q.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300 font-semibold whitespace-nowrap">
                      {q.author?.fullName || 'Anonymous'}
                    </td>
                    <td className="py-3.5 pl-3 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(q._id)}
                        className="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Delete Question"
                      >
                        <FaTrash size={11} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {selectedQuestion && (
        <div className="lg:col-span-6 glass p-5 sm:p-7 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm text-left flex flex-col gap-5">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/10 pb-4">
            <h3 className="text-base font-black text-black dark:text-white flex items-center gap-2">
              <FaComments className="text-[#C2272D] dark:text-[#00FFFF]" />
              <span>Doubt Details & Discussion</span>
            </h3>
            <button 
              type="button"
              onClick={() => setSelectedQuestion(null)}
              className="p-1.5 text-slate-400 hover:text-black dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
              title="Close Panel"
            >
              <FaTimes size={15} />
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdateQuestion} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Question Title</label>
                <input 
                  type="text" 
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141414] text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Category</label>
                <select 
                  value={editCategory}
                  onChange={e => setEditCategory(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141414] text-slate-900 dark:text-slate-100 text-xs focus:outline-none cursor-pointer"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Question Body</label>
                <textarea 
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  rows="5"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141414] text-slate-900 dark:text-slate-100 text-xs focus:outline-none resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C2272D] hover:bg-[#A51E23] text-white rounded-xl text-xs font-bold uppercase cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Question overview */}
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-[#C2272D]/10 text-[#C2272D] dark:bg-[#00FFFF]/10 dark:text-[#00FFFF] border border-[#C2272D]/20 dark:border-[#00FFFF]/20 rounded-full text-[10px] font-bold uppercase">
                  {selectedQuestion.category}
                </span>
                <span className="text-[10px] text-slate-400 font-bold ml-auto flex items-center gap-1">
                  <FaCalendarAlt size={9} /> {new Date(selectedQuestion.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">{selectedQuestion.title}</h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-[#141414] p-4 rounded-2xl border border-slate-200 dark:border-white/10">
                {selectedQuestion.content}
              </p>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={handleStartEdit}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-white/10"
                >
                  <FaEdit /> Edit Doubt
                </button>
                <button 
                  type="button"
                  onClick={() => handleDeleteQuestion(selectedQuestion._id)}
                  className="px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 ml-auto cursor-pointer transition-colors"
                >
                  <FaTrash /> Delete Doubt
                </button>
              </div>

              {/* Answers block */}
              <div className="border-t border-slate-200 dark:border-white/10 pt-4 mt-2 flex flex-col gap-3">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FaComments /> Answers & Responses ({answers.length})
                </h5>

                {loadingDetails ? (
                  <div className="py-6 flex justify-center">
                    <FaSpinner className="animate-spin text-[#C2272D] dark:text-[#00FFFF] text-xl" />
                  </div>
                ) : answers.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400 italic">No answers written yet. Be the first to reply!</div>
                ) : (
                  <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {answers.map(ans => (
                      <div key={ans._id} className="p-3 bg-slate-50 dark:bg-[#141414] rounded-xl border border-slate-200 dark:border-white/10 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          {ans.author?.avatar?.url ? (
                            <img src={ans.author.avatar.url} alt="" className="w-5 h-5 rounded-full object-cover" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-[9px] font-bold">
                              {ans.author?.fullName?.charAt(0) || 'U'}
                            </div>
                          )}
                          <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100">{ans.author?.fullName || 'Anonymous'}</span>
                          {ans.isAccepted && (
                            <span className="px-1.5 py-0.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded text-[8px] font-black uppercase">
                              Accepted Solution
                            </span>
                          )}
                          <div className="ml-auto flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleAcceptAnswer(ans._id)}
                              className={`p-1 rounded cursor-pointer ${ans.isAccepted ? 'text-emerald-500' : 'text-slate-400 hover:text-emerald-500'}`}
                              title={ans.isAccepted ? 'Unmark as Solution' : 'Mark as Solution'}
                            >
                              <FaCheckCircle size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAnswer(ans._id)}
                              className="text-red-500 hover:text-red-600 cursor-pointer p-1"
                              title="Delete Answer"
                            >
                              <FaTrash size={10} />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{ans.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form (Admin Official Reply) */}
                <form onSubmit={handlePostAnswer} className="mt-2 flex flex-col gap-2 border-t border-slate-200 dark:border-white/10 pt-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Write Official Answer / Solution</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type your answer here..."
                      value={newAnswerText}
                      onChange={e => setNewAnswerText(e.target.value)}
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141414] text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#C2272D] dark:focus:border-[#00FFFF]"
                      disabled={submittingAnswer}
                    />
                    <button
                      type="submit"
                      disabled={submittingAnswer || !newAnswerText.trim()}
                      className="px-4 py-2 bg-[#C2272D] hover:bg-[#A51E23] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                      <FaPaperPlane size={11} />
                      <span>{submittingAnswer ? 'Posting...' : 'Reply'}</span>
                    </button>
                  </div>
                </form>

              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DoubtsManager;
