import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUpload, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaHistory, FaBriefcase, FaMagic, 
  FaAward, FaTrash, FaFilePdf, FaArrowRight, FaSpinner, FaSearch, FaRedo, FaShareAlt,
  FaCheck, FaFolderOpen, FaClock, FaBook, FaPercentage, FaBookmark
} from 'react-icons/fa';
import { api } from '../services/api';

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Active Report & Tab States
  const [activeReport, setActiveReport] = useState(null);
  const [activeTab, setActiveTab] = useState('breakdown'); // breakdown, aiSuggestions, keywords, grammar, jobMatch, history
  
  // Job Description Matcher States
  const [jobDescription, setJobDescription] = useState('');
  const [matchingJd, setMatchingJd] = useState(false);
  const [jdMatchResult, setJdMatchResult] = useState(null);

  // Rewriting States
  const [rewritingSection, setRewritingSection] = useState('');
  const [rewriteInput, setRewriteInput] = useState('');
  const [rewriteResult, setRewriteResult] = useState(null);
  const [rewriting, setRewriting] = useState(false);

  // History State
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Share to community hub state
  const [sharingId, setSharingId] = useState(null);

  // Load history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      // Use existing endpoint structure from API helper
      const res = await api.getResumeHistory();
      if (res.success) {
        setHistory(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load history:', err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext)) {
      setError('Unsupported file type. Please upload PDF, DOC, or DOCX formats.');
      setFile(null);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB threshold limit.');
      setFile(null);
      return;
    }
    setError('');
    setFile(file);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or drop a file to analyze.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const formData = new FormData();
      formData.append('resume', file);
      
      const res = await api.uploadAndAnalyzeResume(formData);
      if (res.success && res.data) {
        setSuccess('Resume analyzed successfully!');
        setActiveReport(res.data);
        setActiveTab('breakdown');
        fetchHistory();
      } else {
        setError(res.message || 'Analysis failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'API Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = async (reportId) => {
    setLoading(true);
    try {
      const res = await api.getResumeReportDetails(reportId);
      if (res.success && res.data) {
        setActiveReport(res.data);
        setActiveTab('breakdown');
        setJdMatchResult(null); // clear old matches
      }
    } catch (err) {
      setError('Failed to fetch detailed report: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (reportId, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this resume analysis run from your history?')) return;
    try {
      const res = await api.deleteResumeAnalysis(reportId);
      if (res.success) {
        setHistory(prev => prev.filter(item => item._id !== reportId));
        if (activeReport?._id === reportId) {
          setActiveReport(null);
        }
      }
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleShareToHub = async (reportId) => {
    setSharingId(reportId);
    try {
      const res = await api.shareResumeToHub(reportId, { isPublic: true });
      if (res.success) {
        alert('Resume shared to the Community Hub! Fellow developers can now view and rate it.');
        fetchHistory();
        if (activeReport?._id === reportId) {
          setActiveReport(prev => ({ ...prev, isPublic: true }));
        }
      }
    } catch (err) {
      alert('Sharing failed: ' + err.message);
    } finally {
      setSharingId(null);
    }
  };

  const handleJobMatch = async (e) => {
    e.preventDefault();
    if (!jobDescription.trim()) return;

    setMatchingJd(true);
    try {
      const res = await api.matchJobDescription(activeReport._id, { jobDescription });
      if (res.success) {
        setJdMatchResult(res.data);
      }
    } catch (err) {
      alert('Job match audit failed: ' + err.message);
    } finally {
      setMatchingJd(false);
    }
  };

  const handleRewriteSection = async (e) => {
    e.preventDefault();
    if (!rewriteInput.trim()) return;

    setRewriting(true);
    try {
      const res = await api.rewriteResumeSection(activeReport._id, {
        section: rewritingSection,
        originalText: rewriteInput
      });
      if (res.success) {
        setRewriteResult(res.data);
      }
    } catch (err) {
      alert('Rewrite failed: ' + err.message);
    } finally {
      setRewriting(false);
    }
  };

  // Circular progress helper
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-[#09090c] text-white p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 gap-4">
          <div className="text-left">
            <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              AI ATS Resume Analyzer
            </h1>
            <p className="text-slate-400 text-xs md:text-sm mt-1">
              Analyze, optimize, rewrite, and verify your CV compatibility against recruiter checkers.
            </p>
          </div>
          {activeReport && (
            <button
              onClick={() => { setActiveReport(null); setFile(null); }}
              className="px-4 py-2 bg-purple-600/10 border border-purple-500/20 hover:bg-purple-650/15 rounded-xl text-xs font-black text-purple-400 transition-all flex items-center gap-1.5"
            >
              <FaRedo size={11} /> Analyze New Resume
            </button>
          )}
        </div>

        {/* Global Notifications */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs flex items-center gap-2">
            <FaTimesCircle /> {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-2xl text-xs flex items-center gap-2">
            <FaCheckCircle /> {success}
          </div>
        )}

        <AnimatePresence>
          {!activeReport ? (
            /* Uploader and History Grid */
            <motion.div
              key="uploader"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left Column: Drag & Drop Uploader */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div className="bg-[#121217] border border-white/5 p-6 md:p-8 rounded-3xl shadow-xl flex flex-col items-center">
                  <h3 className="text-base font-black text-white self-start">Upload Resume</h3>
                  <p className="text-slate-400 text-xs self-start mt-1 mb-6">PDF, DOC, or DOCX formats accepted. Max size 10MB.</p>

                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="w-full border-2 border-dashed border-white/10 hover:border-purple-500/40 bg-[#171720]/50 rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all group"
                  >
                    <input
                      type="file"
                      id="resume-file-input"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="resume-file-input" className="cursor-pointer flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                        <FaUpload size={22} />
                      </div>
                      <div className="text-center">
                        <span className="text-xs font-black text-white block">Drag & drop your file here</span>
                        <span className="text-[10px] text-slate-500 block mt-1">or click to browse local storage</span>
                      </div>
                    </label>
                  </div>

                  {file && (
                    <div className="w-full mt-6 p-4 bg-[#1a1a24] rounded-2xl border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FaFilePdf className="text-red-400" size={18} />
                        <div className="text-left">
                          <span className="text-xs font-black text-white block max-w-[200px] truncate">{file.name}</span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setFile(null)}
                        className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={handleUploadSubmit}
                    disabled={loading || !file}
                    className={`mt-6 w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-black shadow-lg shadow-purple-600/10 flex items-center justify-center gap-2 active:scale-[0.99] transition-all ${
                      loading || !file ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin" /> Analyzing and Parsing (Takes ~10 seconds)...
                      </>
                    ) : (
                      'Extract & Analyze Resume'
                    )}
                  </button>
                </div>
              </div>

              {/* Right Column: Comparison / Analysis Logs */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="bg-[#121217] border border-white/5 p-6 rounded-3xl shadow-xl flex-1 flex flex-col">
                  <h3 className="text-base font-black text-white mb-1 text-left">Analysis History</h3>
                  <p className="text-slate-400 text-xs mb-6 text-left">Re-open, delete, or share previously analyzed resume reports.</p>

                  {loadingHistory ? (
                    <div className="flex-1 flex items-center justify-center py-12">
                      <FaSpinner className="animate-spin text-purple-500" size={24} />
                    </div>
                  ) : history.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
                      <FaFolderOpen size={30} />
                      <span className="text-xs">No analysis records found. Upload a CV to begin!</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
                      {history.map((item) => (
                        <div
                          key={item._id}
                          onClick={() => handleViewReport(item._id)}
                          className="p-4 bg-[#171720]/60 hover:bg-[#20202a]/60 border border-white/5 rounded-2xl cursor-pointer transition-colors flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center font-black text-xs ${getScoreColor(item.atsScore)}`}>
                              {item.atsScore}%
                            </div>
                            <div className="text-left min-w-0">
                              <span className="text-xs font-black text-white block max-w-[160px] truncate group-hover:text-purple-400 transition-colors">
                                {item.fileName}
                              </span>
                              <span className="text-[9px] text-slate-500 block mt-0.5">
                                {new Date(item.createdAt).toLocaleDateString()} • {(item.fileSize / 1024).toFixed(0)} KB
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {item.isPublic ? (
                              <span className="px-2 py-0.5 text-[8px] bg-green-500/10 border border-green-500/20 text-green-400 rounded-full font-black">Shared</span>
                            ) : (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleShareToHub(item._id); }}
                                disabled={sharingId === item._id}
                                className="px-2.5 py-1 bg-purple-600/10 hover:bg-purple-650/20 text-purple-400 rounded-lg text-[9px] font-black border border-purple-500/15 flex items-center gap-1 transition-colors"
                              >
                                <FaShareAlt size={8} /> Share
                              </button>
                            )}
                            <button
                              onClick={(e) => handleDeleteReport(item._id, e)}
                              className="p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
                              title="Delete Analysis"
                            >
                              <FaTrash size={10} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            /* Active Report Dashboard View */
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left Column (col-span-4): Circular Progress & Stats Widget */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* Overall Score Dial */}
                <div className="bg-[#121217] border border-white/5 p-8 rounded-3xl shadow-xl flex flex-col items-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">ATS Compatibility Score</span>
                  
                  {/* Score circle */}
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        className="text-[#171720]"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r="38"
                        cx="50"
                        cy="50"
                      />
                      <circle
                        className={activeReport.atsScore >= 80 ? 'text-green-500' : activeReport.atsScore >= 60 ? 'text-amber-500' : 'text-red-500'}
                        strokeWidth="8"
                        strokeDasharray={2 * Math.PI * 38}
                        strokeDashoffset={2 * Math.PI * 38 * (1 - activeReport.atsScore / 100)}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="38"
                        cx="50"
                        cy="50"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-3xl font-black text-white">{activeReport.atsScore}%</span>
                      <span className="text-[8px] text-slate-500 block uppercase tracking-wider mt-0.5">Parser Fit</span>
                    </div>
                  </div>

                  <h4 className="text-sm font-black text-white mt-6">{activeReport.fileName}</h4>
                  <div className="flex gap-2 items-center text-[10px] text-slate-500 mt-1 uppercase font-bold">
                    <span>{activeReport.fileType}</span>
                    <span>•</span>
                    <span>{new Date(activeReport.createdAt).toLocaleDateString()}</span>
                  </div>

                  {activeReport.isPublic ? (
                    <div className="mt-6 w-full py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-xs font-black text-center flex items-center justify-center gap-1.5">
                      <FaCheck size={10} /> Shared to Community Review Hub
                    </div>
                  ) : (
                    <button
                      onClick={() => handleShareToHub(activeReport._id)}
                      disabled={sharingId === activeReport._id}
                      className="mt-6 w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      {sharingId ? <FaSpinner className="animate-spin" /> : <FaShareAlt size={10} />} Share to Community Hub
                    </button>
                  )}
                </div>

                {/* Section Health Index widget */}
                <div className="bg-[#121217] border border-white/5 p-6 rounded-3xl shadow-xl flex flex-col gap-4">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest text-left">Section Health Tracker</h4>
                  
                  <div className="flex flex-col gap-3 text-xs">
                    {Object.entries(activeReport.sectionHealth || {}).map(([key, value]) => {
                      const isExcellent = value === 'Excellent' || value === 'Good';
                      return (
                        <div key={key} className="flex justify-between items-center py-0.5 border-b border-white/5 last:border-0">
                          <span className="capitalize text-slate-400 font-bold">{key}</span>
                          <span className={`px-2 py-0.5 text-[9px] font-black rounded-full ${
                            value === 'Excellent' ? 'bg-green-500/10 text-green-400' :
                            value === 'Good' ? 'bg-blue-500/10 text-blue-400' :
                            value === 'Needs Improvement' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-red-500/10 text-red-400'
                          }`}>
                            {value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column (col-span-8): Tabs & Details View */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                
                {/* Tab select bar */}
                <div className="bg-[#121217] border border-white/5 p-2 rounded-2xl shadow-xl flex flex-wrap gap-1">
                  {[
                    { id: 'breakdown', label: 'ATS Breakdown', icon: <FaAward /> },
                    { id: 'aiSuggestions', label: 'AI Improvements', icon: <FaMagic /> },
                    { id: 'keywords', label: 'Keyword Optimizer', icon: <FaSearch /> },
                    { id: 'grammar', label: 'Readability & Grammar', icon: <FaBook /> },
                    { id: 'jobMatch', label: 'Job Matcher', icon: <FaBriefcase /> }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                        activeTab === tab.id
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-slate-400 hover:bg-[#1a1a24] hover:text-white'
                      }`}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content wrapper */}
                <div className="bg-[#121217] border border-white/5 p-6 rounded-3xl shadow-xl min-h-[400px]">
                  <AnimatePresence>
                    
                    {activeTab === 'breakdown' && (
                      <motion.div
                        key="tab-breakdown"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col gap-6"
                      >
                        <div className="text-left pb-2 border-b border-white/5">
                          <h3 className="text-sm font-black text-white">Score Breakdown Metrics</h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">Calculated by checking standard parsing metrics and link tags.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(activeReport.atsBreakdown || {}).map(([key, details]) => (
                            <div key={key} className="p-4 bg-[#1a1a24]/50 border border-white/5 rounded-2xl flex flex-col gap-2 text-left">
                              <div className="flex justify-between items-center">
                                <span className="capitalize text-xs font-black text-white">{key} Score</span>
                                <span className={`text-xs font-black ${getScoreColor(details.score)}`}>{details.score}%</span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-1">{details.reason}</p>
                              {details.tips && details.tips.length > 0 && (
                                <ul className="mt-2 text-[9px] text-amber-400 font-bold list-disc pl-3 flex flex-col gap-1">
                                  {details.tips.map((t, idx) => <li key={idx}>{t}</li>)}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'aiSuggestions' && (
                      <motion.div
                        key="tab-suggestions"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col gap-6"
                      >
                        <div className="text-left pb-2 border-b border-white/5 flex justify-between items-center">
                          <div>
                            <h3 className="text-sm font-black text-white">AI Comparative Suggestions</h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">Rewrite weak bullet points to boost metrics and expected ATS matching.</p>
                          </div>
                          {/* Quick rewrite CTA */}
                          <button
                            onClick={() => {
                              setActiveTab('jobMatch');
                              setRewritingSection('Projects');
                              setRewriteInput(activeReport.parsedData?.projects?.[0]?.description || '');
                              setRewriteResult(null);
                            }}
                            className="px-3 py-1.5 bg-purple-600/10 border border-purple-500/20 text-purple-400 hover:bg-purple-650/15 rounded-xl text-[10px] font-black flex items-center gap-1 transition-all"
                          >
                            <FaMagic size={9} /> One-Click Rewrite Tool
                          </button>
                        </div>

                        <div className="flex flex-col gap-5">
                          {(activeReport.aiSuggestions || []).map((s, idx) => (
                            <div key={idx} className="bg-[#1a1a24]/30 border border-white/5 rounded-3xl p-5 flex flex-col gap-4 text-left relative overflow-hidden">
                              <div className="flex justify-between items-center">
                                <span className="px-2.5 py-0.5 bg-purple-600/20 border border-purple-500/20 text-purple-400 rounded-lg text-[9px] font-black uppercase">
                                  {s.section}
                                </span>
                                <span className="text-[10px] text-green-400 font-black flex items-center gap-1">
                                  Expected ATS +{s.atsIncrease}%
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-2xl">
                                  <span className="text-[9px] font-black text-red-400 uppercase tracking-wider block mb-1">❌ Current Version</span>
                                  <p className="text-[11px] text-slate-350">{s.currentText}</p>
                                </div>
                                <div className="p-3 bg-green-500/5 border border-green-500/10 rounded-2xl">
                                  <span className="text-[9px] font-black text-green-400 uppercase tracking-wider block mb-1">✅ Improved Version</span>
                                  <p className="text-[11px] text-white">{s.improvedText}</p>
                                </div>
                              </div>

                              <p className="text-[10px] text-slate-400 mt-1 italic flex items-center gap-1.5 bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                                <FaInfoCircle className="text-purple-400 shrink-0" size={10} /> {s.explanation}
                              </p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'keywords' && (
                      <motion.div
                        key="tab-keywords"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col gap-6"
                      >
                        <div className="text-left pb-2 border-b border-white/5">
                          <h3 className="text-sm font-black text-white">Keyword Alignment Grid</h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">Identified missing technical skills relative to industry developer benchmarks.</p>
                        </div>

                        {/* Matched Keywords */}
                        <div className="text-left">
                          <h4 className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <FaCheckCircle /> Matched Keywords ({(activeReport.keywords?.matched || []).length})
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {(activeReport.keywords?.matched || []).map((k, idx) => (
                              <span key={idx} className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-xs font-bold">
                                {k}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Missing Keywords */}
                        <div className="text-left mt-4">
                          <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <FaTimesCircle /> Recommended Missing Keywords ({(activeReport.keywords?.missing || []).length})
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {(activeReport.keywords?.missing || []).map((k, idx) => (
                              <span key={idx} className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs font-bold">
                                + {k}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'grammar' && (
                      <motion.div
                        key="tab-grammar"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col gap-6"
                      >
                        <div className="text-left pb-2 border-b border-white/5">
                          <h3 className="text-sm font-black text-white">Readability & Grammar Auditing</h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">Audit passive tone, word repetitions, and read time duration estimates.</p>
                        </div>

                        {/* Readability breakdown */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-4 bg-[#1a1a24]/50 border border-white/5 rounded-2xl text-left">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Reading Time</span>
                            <span className="text-sm font-black text-white flex items-center gap-1"><FaClock size={11} className="text-purple-400" /> {activeReport.readability?.readingTime} min</span>
                          </div>
                          <div className="p-4 bg-[#1a1a24]/50 border border-white/5 rounded-2xl text-left">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Tone</span>
                            <span className="text-sm font-black text-white capitalize">{activeReport.readability?.tone || 'Professional'}</span>
                          </div>
                          <div className="p-4 bg-[#1a1a24]/50 border border-white/5 rounded-2xl text-left">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Complexity</span>
                            <span className="text-sm font-black text-white">{activeReport.readability?.complexity || 'Readable'}</span>
                          </div>
                          <div className="p-4 bg-[#1a1a24]/50 border border-white/5 rounded-2xl text-left">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Readability Index</span>
                            <span className="text-sm font-black text-white flex items-center gap-1"><FaPercentage size={10} className="text-purple-400" /> {activeReport.readability?.score || 80}/100</span>
                          </div>
                        </div>

                        {/* Grammar / Passive details */}
                        <div className="p-5 bg-[#171720]/40 border border-white/5 rounded-3xl flex flex-col gap-4 text-left">
                          <h4 className="text-xs font-black text-white uppercase tracking-wider">Style Warnings</h4>
                          
                          <div className="flex flex-col gap-3 text-xs text-slate-350">
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                              <span>Passive Voice Occurrences</span>
                              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full font-bold">{activeReport.grammarChecker?.passiveVoiceCount || 0} found</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                              <span>Weak Recruiter Buzzwords</span>
                              <span className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded-full font-bold">{activeReport.grammarChecker?.weakWordsCount || 0} found</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                              <span>Word Repetition Warnings</span>
                              <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full font-bold">{activeReport.grammarChecker?.repeatedWordsCount || 0} found</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'jobMatch' && (
                      <motion.div
                        key="tab-jobmatch"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col gap-6"
                      >
                        {/* Section Header Split */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-white/5 pb-6">
                          
                          {/* Job Matcher input */}
                          <div className="text-left flex flex-col gap-3">
                            <div>
                              <h3 className="text-sm font-black text-white">Target Job Description Matching</h3>
                              <p className="text-[11px] text-slate-400 mt-0.5">Paste a targeted job description to analyze skills matching and interview odds.</p>
                            </div>

                            <form onSubmit={handleJobMatch} className="flex flex-col gap-3 mt-1">
                              <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste Job Description here..."
                                rows={6}
                                className="w-full px-4 py-3 bg-[#1e1e24] border border-white/5 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                              />
                              <button
                                type="submit"
                                disabled={matchingJd || !jobDescription.trim()}
                                className={`py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md ${
                                  matchingJd || !jobDescription.trim() ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              >
                                {matchingJd ? <FaSpinner className="animate-spin" /> : <FaBriefcase size={11} />} Match Resume
                              </button>
                            </form>
                          </div>

                          {/* Job Matcher results */}
                          <div className="text-left flex flex-col gap-4">
                            {jdMatchResult ? (
                              <div className="p-5 bg-purple-600/5 border border-purple-500/10 rounded-3xl flex flex-col gap-4">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Match Compatibility</span>
                                  <span className="px-2.5 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-[9px] font-black">
                                    {jdMatchResult.interviewChance} Interview Chance
                                  </span>
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className="w-14 h-14 rounded-2xl bg-purple-600/15 border border-purple-500/20 flex items-center justify-center font-black text-lg text-purple-400">
                                    {jdMatchResult.matchPercentage}%
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-black text-white">Job Description Matching Index</h4>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Calculated based on semantic keyword mapping.</p>
                                  </div>
                                </div>

                                <div className="flex flex-col gap-2 text-[10px] text-slate-350">
                                  {jdMatchResult.missingSkills?.length > 0 && (
                                    <div className="mt-1">
                                      <span className="font-black text-amber-400 block mb-1">Missing Skills to Add:</span>
                                      <div className="flex flex-wrap gap-1.5">
                                        {jdMatchResult.missingSkills.slice(0, 5).map((s, idx) => (
                                          <span key={idx} className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/15 text-amber-400 rounded">
                                            {s}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  <div className="mt-2 border-t border-white/5 pt-2">
                                    <span className="font-black text-white block mb-0.5">AI Suggestion:</span>
                                    <p className="italic leading-normal text-[9px] text-slate-400">{jdMatchResult.aiSuggestions}</p>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="h-full border border-white/5 border-dashed rounded-3xl flex flex-col items-center justify-center text-slate-500 p-8 text-center gap-2">
                                <FaBriefcase size={20} />
                                <span className="text-xs">Submit a job description on the left to review alignment metrics.</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Section Rewrite Panel */}
                        <div className="text-left mt-2">
                          <h4 className="text-xs font-black text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <FaMagic className="text-purple-400" /> One-Click CV Section Rewriter
                          </h4>
                          <p className="text-[11px] text-slate-400 mb-4">Paste any weak description or summary from your CV to rewrite it using technical action verbs.</p>

                          <form onSubmit={handleRewriteSection} className="flex flex-col gap-3">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <select
                                value={rewritingSection}
                                onChange={(e) => setRewritingSection(e.target.value)}
                                className="px-4 py-2.5 bg-[#1e1e24] border border-white/5 rounded-xl text-xs text-white focus:outline-none"
                              >
                                <option value="">Select Section</option>
                                <option value="Summary">Professional Summary</option>
                                <option value="Projects">Projects Column</option>
                                <option value="Experience">Work Experience</option>
                                <option value="Achievements">Achievements List</option>
                              </select>
                              <input
                                type="text"
                                value={rewriteInput}
                                onChange={(e) => setRewriteInput(e.target.value)}
                                placeholder="Paste the weak bullet point or summary here..."
                                className="md:col-span-2 px-4 py-2.5 bg-[#1e1e24] border border-white/5 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={rewriting || !rewritingSection || !rewriteInput.trim()}
                              className={`py-2.5 bg-purple-650 hover:bg-purple-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-colors ${
                                rewriting || !rewritingSection || !rewriteInput.trim() ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              {rewriting ? <FaSpinner className="animate-spin" /> : <FaMagic size={10} />} Rewrite Section Content
                            </button>
                          </form>

                          {rewriteResult && (
                            <div className="mt-4 p-4 bg-green-500/5 border border-green-500/10 rounded-2xl flex flex-col gap-2">
                              <span className="text-[9px] font-black text-green-400 uppercase block">✨ Rewritten Version</span>
                              <p className="text-xs text-white leading-relaxed">{rewriteResult.rewrittenText}</p>
                              <span className="text-[9px] text-slate-400 mt-1 block italic border-t border-white/5 pt-2">
                                💡 Why it is better: {rewriteResult.explanation}
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}

                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
