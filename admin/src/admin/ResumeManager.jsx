import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  FaFilePdf, FaUpload, FaTrash, FaCheckCircle, FaDownload, FaAward, 
  FaChartBar, FaSearch, FaFilter, FaShareAlt, FaBan, FaCheck, FaExclamationTriangle, FaEye
} from 'react-icons/fa';

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

const ResumeManager = () => {
  // Tab State
  const [activeTab, setActiveTab] = useState('portfolio'); // portfolio, atsCms

  // Portfolio Resumes State
  const [portfolioResumes, setPortfolioResumes] = useState([]);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // ATS Resumes CMS State
  const [atsResumes, setAtsResumes] = useState([]);
  const [atsLoading, setAtsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, public, flagged, approved, rejected
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Fetch portfolio CVs on mount
  useEffect(() => {
    fetchPortfolioResumes();
  }, []);

  // Fetch ATS resumes when atsCms tab is selected
  useEffect(() => {
    if (activeTab === 'atsCms') {
      fetchAtsResumes();
      fetchAtsAnalytics();
    }
  }, [activeTab, statusFilter]);

  const fetchPortfolioResumes = async () => {
    try {
      const res = await api.getResumes();
      if (res.success) {
        setPortfolioResumes(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching resumes:', err.message);
    } finally {
      setPortfolioLoading(false);
    }
  };

  const fetchAtsResumes = async () => {
    setAtsLoading(true);
    try {
      // Use existing endpoint. Fetching public resumes hub as admin gets all resumes if we query correctly,
      // or we can query the hub endpoint which returns public shared resumes
      const res = await api.getCommunityResumeHub({ sort: 'latest', search: searchQuery });
      if (res.success) {
        setAtsResumes(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load ATS resumes:', err.message);
    } finally {
      setAtsLoading(false);
    }
  };

  const fetchAtsAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await api.getResumeAnalytics();
      if (res.success) {
        setAnalytics(res.data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err.message);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAtsResumes();
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return alert('Please select a PDF file first');

    setUploading(true);
    const data = new FormData();
    data.append('resume', selectedFile);

    try {
      const res = await api.uploadResume(data);
      if (res.success) {
        setSelectedFile(null);
        e.target.reset();
        fetchPortfolioResumes();
      }
    } catch (err) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePortfolio = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    setPortfolioLoading(true);
    try {
      const res = await api.deleteResume(id);
      if (res.success) {
        fetchPortfolioResumes();
      }
    } catch (err) {
      alert(err.message || 'Delete failed');
      setPortfolioLoading(false);
    }
  };

  const handleDeleteAts = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user resume analysis record and its reviews?')) return;
    setAtsLoading(true);
    try {
      const res = await api.deleteResumeAnalysis(id);
      if (res.success) {
        setAtsResumes(prev => prev.filter(item => item._id !== id));
        fetchAtsAnalytics();
      }
    } catch (err) {
      alert('Delete failed: ' + err.message);
    } finally {
      setAtsLoading(false);
    }
  };

  const handleToggleApprove = async (id, currentPublic) => {
    const action = currentPublic ? 'Unshare' : 'Approve & Share';
    if (!window.confirm(`Are you sure you want to ${action} this resume in the community hub?`)) return;
    try {
      const res = await api.shareResumeToHub(id, { isPublic: !currentPublic });
      if (res.success) {
        setAtsResumes(prev => prev.map(item => {
          if (item._id === id) {
            return {
              ...item,
              isPublic: !currentPublic
            };
          }
          return item;
        }));
      }
    } catch (err) {
      alert('Moderation action failed: ' + err.message);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500 bg-green-500/10 border-green-500/25';
    if (score >= 60) return 'text-amber-500 bg-amber-500/10 border-amber-500/25';
    return 'text-red-500 bg-red-500/10 border-red-500/25';
  };

  return (
    <div className="flex flex-col gap-8 text-left">
      
      {/* Title Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-black font-title text-black dark:text-white">Resume Hub & CMS</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage portfolio active CV files and moderate user ATS resumes.</p>
      </div>

      {/* Tab Navigations */}
      <div className="flex gap-2 border-b border-slate-200/50 dark:border-white/5 pb-2">
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors ${
            activeTab === 'portfolio'
              ? 'bg-primary-blue text-white shadow'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          Portfolio Resume (CV)
        </button>
        <button
          onClick={() => setActiveTab('atsCms')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors ${
            activeTab === 'atsCms'
              ? 'bg-primary-blue text-white shadow'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          ATS Resume Analyzer CMS
        </button>
      </div>

      {activeTab === 'portfolio' ? (
        /* Tab 1: Portfolio active CV upload list */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-200">
          {/* Upload Form */}
          <div className="lg:col-span-5 glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
            <h3 className="text-lg font-bold font-title text-black dark:text-white mb-6 flex items-center gap-2">
              <FaUpload className="text-primary-blue" /> Upload New Portfolio Resume
            </h3>

            <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Select PDF Document</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  required
                  className="w-full text-xs text-slate-500 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full py-3.5 bg-primary-blue hover:bg-accent-blue text-white rounded-xl font-bold text-sm shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FaUpload /> Upload & Set Active
                  </>
                )}
              </button>
            </form>
          </div>

          {/* CV archives list */}
          <div className="lg:col-span-7 glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
            <h3 className="text-lg font-bold font-title text-black dark:text-white mb-6">Resume Archives</h3>

            {portfolioLoading ? (
              <div className="py-12 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-primary-blue animate-spin" />
              </div>
            ) : portfolioResumes.length === 0 ? (
              <div className="py-20 text-center text-sm text-slate-450">
                No resumes uploaded yet.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {portfolioResumes.map((r) => (
                  <div key={r._id} className="p-4 rounded-xl border border-slate-200/40 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex items-center justify-between gap-4 text-left">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 font-bold flex items-center justify-center shrink-0">
                        <FaFilePdf size={18} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-black dark:text-white truncate">{r.fileName}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                          {r.fileSize ? `${(r.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'} • {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {r.isActive ? (
                        <span className="flex items-center gap-1 text-[10px] font-black px-2.5 py-1 bg-green-500/10 text-green-500 border border-green-500/25 rounded-md uppercase tracking-wider">
                          <FaCheckCircle /> Active
                        </span>
                      ) : (
                        <button
                          onClick={() => handleDeletePortfolio(r._id)}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 cursor-pointer"
                          title="Delete Archive"
                        >
                          <FaTrash size={12} />
                        </button>
                      )}
                      <a
                        href={getAbsolutePdfUrl(r.fileUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-primary-blue/10 hover:bg-primary-blue/20 text-primary-blue border border-primary-blue/20 cursor-pointer flex items-center justify-center"
                        title="Download PDF"
                      >
                        <FaDownload size={12} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Tab 2: ATS Resumes CMS panel */
        <div className="flex flex-col gap-8 animate-in fade-in duration-200">
          
          {/* Analytics widgets row */}
          {loadingAnalytics ? (
            <div className="py-4 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-primary-blue animate-spin" />
            </div>
          ) : analytics ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 flex flex-col gap-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Uploads</span>
                <span className="text-2xl font-black text-black dark:text-white">{analytics.totalUploads}</span>
              </div>
              <div className="glass p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 flex flex-col gap-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Average ATS Score</span>
                <span className="text-2xl font-black text-purple-500">{analytics.avgScore}%</span>
              </div>
              <div className="glass p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 flex flex-col gap-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Highest Score</span>
                <span className="text-2xl font-black text-green-500">{analytics.highestScore}%</span>
              </div>
              <div className="glass p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 flex flex-col gap-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Lowest Score</span>
                <span className="text-2xl font-black text-red-500">{analytics.lowestScore}%</span>
              </div>
            </div>
          ) : null}

          {/* Search, filters, and list table */}
          <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm flex flex-col gap-6">
            
            {/* Filter Bar Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-xs flex gap-2">
                <input
                  type="text"
                  placeholder="Search by file or user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-xs text-black dark:text-white placeholder-slate-400 focus:outline-none"
                />
                <FaSearch className="absolute left-2.5 top-3.5 text-slate-400" size={11} />
                <button type="submit" className="px-3.5 py-2 bg-primary-blue text-white rounded-xl text-xs font-bold">Search</button>
              </form>

              {/* Status query tabs */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { id: 'all', label: 'All Shared' },
                  { id: 'flagged', label: 'Flagged Content' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setStatusFilter(opt.id)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all ${
                      statusFilter === opt.id
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-transparent border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-450'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List Table */}
            {atsLoading ? (
              <div className="py-12 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-primary-blue animate-spin" />
              </div>
            ) : atsResumes.length === 0 ? (
              <div className="py-16 text-center text-sm text-slate-450">
                No records found matching filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/60 dark:border-white/5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Filename</th>
                      <th className="py-3 px-4">Uploader / Owner</th>
                      <th className="py-3 px-4">ATS Compatibility</th>
                      <th className="py-3 px-4 text-center">Hub Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {atsResumes.map(item => (
                      <tr key={item._id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                        
                        {/* Filename details */}
                        <td className="py-4 px-4 font-bold text-black dark:text-white">
                          <div className="flex items-center gap-2">
                            <FaFilePdf className="text-red-500 shrink-0" size={14} />
                            <div className="min-w-0">
                              <span className="block truncate max-w-[180px]">{item.fileName}</span>
                              <span className="text-[9px] text-slate-400 font-normal mt-0.5">{(item.fileSize / 1024).toFixed(0)} KB • {new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </td>

                        {/* Owner details */}
                        <td className="py-4 px-4 text-slate-700 dark:text-slate-300">
                          <span className="font-bold block">{item.uploadedBy?.fullName || 'Anonymous'}</span>
                          <span className="text-[9px] text-slate-400 block mt-0.5">@{item.uploadedBy?.username || 'user'}</span>
                        </td>

                        {/* Score details */}
                        <td className="py-4 px-4">
                          <span className={`px-2 py-0.5 border rounded-full text-[10px] font-black ${getScoreColor(item.atsScore)}`}>
                            {item.atsScore}%
                          </span>
                        </td>

                        {/* Hub state */}
                        <td className="py-4 px-4 text-center">
                          {item.isPublic ? (
                            <span className="px-2 py-0.5 bg-green-500/10 text-green-500 border border-green-500/25 rounded text-[9px] font-bold">Public Shared</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-500/10 text-slate-500 border border-slate-500/25 rounded text-[9px] font-bold">Private</span>
                          )}
                        </td>

                        {/* Actions block */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <a
                              href={getAbsolutePdfUrl(item.fileUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-primary-blue/10 hover:bg-primary-blue/20 text-primary-blue border border-primary-blue/20 rounded-lg flex items-center justify-center"
                              title="Download PDF"
                            >
                              <FaDownload size={11} />
                            </a>
                            <button
                              onClick={() => handleToggleApprove(item._id, item.isPublic)}
                              className={`p-2 rounded-lg border flex items-center justify-center ${
                                item.isPublic 
                                  ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border-amber-500/20' 
                                  : 'bg-green-500/10 hover:bg-green-500/20 text-green-500 border-green-500/20'
                              }`}
                              title={item.isPublic ? 'Hide from Hub' : 'Approve to Hub'}
                            >
                              {item.isPublic ? <FaBan size={11} /> : <FaCheck size={11} />}
                            </button>
                            <button
                              onClick={() => handleDeleteAts(item._id)}
                              className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg flex items-center justify-center"
                              title="Delete Record"
                            >
                              <FaTrash size={11} />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};

export default ResumeManager;
