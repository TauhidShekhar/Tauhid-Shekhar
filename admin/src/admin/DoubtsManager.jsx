import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  FaQuestionCircle, FaSearch, FaTrash, FaCheck, FaTimes, 
  FaSpinner, FaUser, FaComments, FaCalendarAlt, FaEdit 
} from 'react-icons/fa';

const DoubtsManager = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  
  // Detailed Modal/Drawer
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Edit fields
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('');

  const CATEGORIES = [
    'HTML', 'CSS', 'JavaScript', 'React', 'Node', 'Express', 
    'MongoDB', 'Python', 'Java', 'C++', 'DSA', 'AI', 'Cloud', 'Career', 'Other'
  ];

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
    try {
      const res = await api.getCommunityQuestionDetails(q._id);
      if (res.success) {
        setAnswers(res.data.answers || []);
      }
    } catch (err) {
      console.error('Error loading question details:', err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm('Are you sure you want to delete this doubt? This will remove all answers.')) return;
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* List Container */}
      <div className={`${selectedQuestion ? 'lg:col-span-6' : 'lg:col-span-12'} glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm text-left flex flex-col gap-6`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-white/5 pb-4">
          <div>
            <h2 className="text-xl font-bold font-title text-black dark:text-white flex items-center gap-2">
              <FaQuestionCircle className="text-primary-blue" /> Q&A Doubts Lounge
            </h2>
            <p className="text-xs text-slate-550 dark:text-slate-400 mt-1">Manage, moderate, edit and delete community doubt questions and answers.</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder="Search doubts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
            />
          </div>

          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Questions Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <FaSpinner className="animate-spin text-primary-blue text-2xl" />
            <span className="text-xs text-slate-450 font-bold">Loading doubts lounge...</span>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-450 italic">No doubt records found.</div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/5 text-slate-400 font-bold">
                  <th className="pb-3 pr-4 font-bold">Question Details</th>
                  <th className="pb-3 px-4 font-bold">Lounge</th>
                  <th className="pb-3 px-4 font-bold">Author</th>
                  <th className="pb-3 pl-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuestions.map(q => (
                  <tr 
                    key={q._id} 
                    className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer"
                    onClick={() => handleOpenDetails(q)}
                  >
                    <td className="py-4 pr-4">
                      <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{q.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{q.content}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 bg-primary-blue/5 border border-primary-blue/15 text-primary-blue rounded text-[9px] font-black uppercase">
                        {q.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-550 dark:text-slate-450 font-semibold">{q.author?.fullName || 'Anonymous'}</td>
                    <td className="py-4 pl-4 text-right" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleDeleteQuestion(q._id)}
                        className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Delete Question"
                      >
                        <FaTrash size={10} />
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
        <div className="lg:col-span-6 glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm text-left flex flex-col gap-6 animate-in slide-in-from-right duration-250">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-4">
            <h3 className="text-base font-black text-black dark:text-white flex items-center gap-1.5">
              Doubt Details
            </h3>
            <button 
              onClick={() => setSelectedQuestion(null)}
              className="p-1 text-slate-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <FaTimes size={16} />
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Category Lounge</label>
                <select 
                  value={editCategory}
                  onChange={e => setEditCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none cursor-pointer"
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-350 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary-blue hover:bg-accent-blue text-white rounded-xl text-xs font-black uppercase cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Question overview */}
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-primary-blue/5 border border-primary-blue/15 text-primary-blue rounded text-[9px] font-black uppercase">
                  {selectedQuestion.category}
                </span>
                <span className="text-[10px] text-slate-400 font-bold ml-auto flex items-center gap-1">
                  <FaCalendarAlt size={9} /> {new Date(selectedQuestion.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">{selectedQuestion.title}</h4>
              <p className="text-xs text-slate-655 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200/50 dark:border-white/5">
                {selectedQuestion.content}
              </p>

              {/* Question attached images */}
              {selectedQuestion.images && selectedQuestion.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {selectedQuestion.images.map((img, idx) => (
                    <a key={idx} href={img.url} target="_blank" rel="noreferrer" className="block relative w-full h-16 bg-slate-100 dark:bg-slate-950 rounded-lg overflow-hidden border border-white/5 hover:opacity-80 transition-all cursor-zoom-in">
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <button 
                  onClick={handleStartEdit}
                  className="px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-330 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <FaEdit /> Edit Content
                </button>
                <button 
                  onClick={() => handleDeleteQuestion(selectedQuestion._id)}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 ml-auto cursor-pointer transition-colors"
                >
                  <FaTrash /> Delete Doubt
                </button>
              </div>

              {/* Answers block */}
              <div className="border-t border-slate-150 dark:border-white/5 pt-4 mt-2">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <FaComments /> Answers ({answers.length})
                </h5>

                {loadingDetails ? (
                  <FaSpinner className="animate-spin text-primary-blue text-lg mx-auto" />
                ) : answers.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-450 italic">No answers written yet.</div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {answers.map(ans => (
                      <div key={ans._id} className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-150 dark:border-white/5 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          {ans.author?.avatar?.url ? (
                            <img src={ans.author.avatar.url} alt="" className="w-4 h-4 rounded-full object-cover" />
                          ) : (
                            <FaUser size={10} className="text-slate-450" />
                          )}
                          <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200">{ans.author?.fullName || 'Anonymous'}</span>
                          {ans.isAccepted && (
                            <span className="px-1.5 py-0.5 bg-emerald-500 text-white rounded text-[8px] font-black uppercase">Accepted</span>
                          )}
                          <button
                            onClick={() => handleDeleteAnswer(ans._id)}
                            className="ml-auto text-red-500 hover:text-red-650 cursor-pointer"
                            title="Delete Answer"
                          >
                            <FaTrash size={9} />
                          </button>
                        </div>
                        <p className="text-xs text-slate-655 dark:text-slate-355 leading-relaxed whitespace-pre-line">{ans.content}</p>

                        {/* Answer attached images */}
                        {ans.images && ans.images.length > 0 && (
                          <div className="grid grid-cols-4 gap-1.5 mt-1">
                            {ans.images.map((img, idx) => (
                              <a key={idx} href={img.url} target="_blank" rel="noreferrer" className="block relative w-full h-10 bg-slate-100 dark:bg-slate-950 rounded-lg overflow-hidden border border-white/5 hover:opacity-80 transition-all cursor-zoom-in">
                                <img src={img.url} alt="" className="w-full h-full object-cover" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DoubtsManager;
