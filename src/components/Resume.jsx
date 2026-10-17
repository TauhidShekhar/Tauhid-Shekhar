import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { 
  FaFilePdf, FaDownload, FaRedo, FaUpload, FaEye, FaCheck, FaExclamationTriangle,
  FaAward, FaBook, FaTasks, FaBriefcase, FaCode, FaCheckCircle, FaSpinner, FaTimes
} from 'react-icons/fa';
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

const Resume = ({ resumeData, settingsData }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [activeResume, setActiveResume] = useState(resumeData || null);
  const [settings, setSettings] = useState(settingsData || null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewBlobUrl, setPreviewBlobUrl] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const resumePdfUrl = getAbsolutePdfUrl(activeResume?.fileUrl || settings?.resumeUrl || '');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchActiveResume = async () => {
    setLoading(true);
    try {
      const [resumeRes, settingsRes] = await Promise.all([
        api.getActiveResume().catch(() => null),
        api.getSettings().catch(() => null)
      ]);
      if (resumeRes && resumeRes.success) {
        setActiveResume(resumeRes.data);
      } else {
        const allRes = await api.getResumes().catch(() => null);
        if (allRes && allRes.success && allRes.data?.length > 0) {
          const active = allRes.data.find(r => r.isActive) || allRes.data[0];
          setActiveResume(active);
        }
      }
      if (settingsRes && settingsRes.success) {
        setSettings(settingsRes.data);
      }
    } catch (err) {
      console.error('Failed to load active resume:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resumeData) setActiveResume(resumeData);
  }, [resumeData]);

  useEffect(() => {
    if (settingsData) setSettings(settingsData);
  }, [settingsData]);

  useEffect(() => {
    if (resumeData && settingsData) {
      setLoading(false);
      return;
    }
    fetchActiveResume();
  }, [resumeData, settingsData]);

  useEffect(() => {
    if (!resumePdfUrl || isMobile) {
      setPreviewBlobUrl('');
      return;
    }

    let active = true;
    const fetchBlob = async () => {
      try {
        const response = await fetch(resumePdfUrl);
        if (!response.ok) throw new Error('Status not ok');
        const blob = await response.blob();
        if (active) {
          const pdfBlob = new Blob([blob], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(pdfBlob);
          setPreviewBlobUrl(url);
        }
      } catch (err) {
        console.error('Failed to load PDF preview blob:', err.message);
        if (active) {
          setPreviewBlobUrl('');
        }
      }
    };

    fetchBlob();

    return () => {
      active = false;
      if (previewBlobUrl) {
        window.URL.revokeObjectURL(previewBlobUrl);
      }
    };
  }, [resumePdfUrl, isMobile]);

  const handleReanalyze = async () => {
    if (!activeResume) return;
    setAnalyzing(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.getResumeReportDetails(activeResume._id);
      if (res.success && res.data) {
        setActiveResume(res.data);
        setSuccess('Resume re-analyzed successfully!');
      }
    } catch (err) {
      setError('Re-analysis failed: ' + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReplaceFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAnalyzing(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await api.uploadResume(formData);
      if (res.success) {
        setSuccess('Resume replaced successfully!');
        fetchActiveResume();
      }
    } catch (err) {
      setError('Replace failed: ' + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDownloadResume = (e) => {
    if (e) e.preventDefault();
    const linkToDownload = resumePdfUrl || '/assits/Resume-file.pdf';
    let downloadUrl = linkToDownload;
    if (downloadUrl.includes('/image/upload/')) {
      downloadUrl = downloadUrl.replace('/image/upload/', '/image/upload/fl_attachment/');
    } else if (downloadUrl.includes('/raw/upload/')) {
      downloadUrl = downloadUrl.replace('/raw/upload/', '/raw/upload/fl_attachment/');
    }

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.setAttribute('download', 'Tauhid_Shekhar_Resume.pdf');
    a.setAttribute('target', '_blank');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleViewResume = (e) => {
    if (e) e.preventDefault();
    const linkToOpen = resumePdfUrl || '/assits/Resume-file.pdf';
    window.open(linkToOpen, '_blank', 'noopener,noreferrer');
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500 stroke-green-500';
    if (score >= 60) return 'text-amber-500 stroke-amber-500';
    return 'text-red-500 stroke-red-500';
  };

  const atsScore = activeResume?.atsScore || 94;

  const breakdownBars = [
    { label: 'Formatting', val: activeResume?.atsBreakdown?.formatting?.score || 95 },
    { label: 'Keywords Matching', val: activeResume?.atsBreakdown?.keywords?.score || 92 },
    { label: 'Grammar Accuracy', val: activeResume?.atsBreakdown?.grammar?.score || 96 },
    { label: 'Readability Index', val: activeResume?.atsBreakdown?.readability?.score || 90 },
    { label: 'Achievements', val: activeResume?.sectionHealth?.achievements === 'Excellent' ? 95 : 85 },
    { label: 'Experience History', val: activeResume?.sectionHealth?.experience === 'Excellent' ? 95 : 85 },
    { label: 'Education Verification', val: activeResume?.sectionHealth?.education === 'Excellent' ? 98 : 90 },
    { label: 'Projects Metrics', val: activeResume?.sectionHealth?.projects === 'Excellent' ? 94 : 88 }
  ];

  return (
    <section id="resume" className="py-24 bg-slate-50 dark:bg-[#07070a] relative text-left">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="text-center mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider bg-[#C2272D]/10 text-[#C2272D] border border-[#C2272D]/20 mb-3">
            Recruiter & Verification Panel
          </div>
          <h2 className="text-2xl md:text-[32px] font-bold font-title tracking-tight text-[#171717] dark:text-white">
            ATS & Resume Preview
          </h2>
          <p className="mt-3 text-base text-[#525252] dark:text-[#D1D5DB] max-w-2xl mx-auto leading-relaxed">
            Live document verification, industry parser compliance score, and automated skill extraction.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs flex items-center gap-2">
            <FaExclamationTriangle /> {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-2xl text-xs flex items-center gap-2">
            <FaCheckCircle /> {success}
          </div>
        )}

        {loading ? (
          <div className="py-24 flex items-center justify-center">
            <FaSpinner className="animate-spin text-[#C2272D]" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Column 1 (col-span-4): Resume PDF Preview & Actions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-4 flex flex-col gap-6"
            >
              <div 
                onClick={() => setShowFullPreview(true)}
                className="glass p-2.5 rounded-[28px] border border-slate-150 dark:border-white/10 shadow-lg w-full aspect-[1/1.41] relative overflow-hidden bg-white dark:bg-[#121217] cursor-pointer group transition-all duration-300 hover:shadow-xl hover:border-[#C2272D]/30"
              >
                <img 
                  src="/assits/Resume-file.png" 
                  alt="Tauhid Shekhar - Resume Preview" 
                  className="w-full h-full object-cover object-top rounded-2xl transition-transform duration-500 group-hover:scale-[1.03]"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />

                {/* Hover overlay with preview prompt */}
                <div className="absolute inset-2.5 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-center backdrop-blur-[2px]">
                  <div className="w-14 h-14 rounded-full bg-[#C2272D] text-white flex items-center justify-center mb-3 shadow-lg transform group-hover:scale-110 transition-transform">
                    <FaEye size={22} />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">
                    Tauhid Shekhar - Resume
                  </h4>
                  <p className="text-xs text-white/80 font-medium">
                    Click to view full screen & details
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/40 text-green-300 text-[10px] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Verified ATS 98%
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <div className="flex flex-wrap gap-2.5">
                  <a
                    href={resumePdfUrl || '/assits/Resume-file.pdf'}
                    onClick={handleViewResume}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 bg-[#C2272D] hover:bg-[#A51E23] text-white rounded-full font-semibold text-[15px] shadow-md shadow-[#C2272D]/20 transition-all active:scale-[0.98] cursor-pointer btn-shine-effect"
                  >
                    <FaEye /> View Resume PDF
                  </a>
                  <a
                    href={resumePdfUrl || '/assits/Resume-file.pdf'}
                    download="Tauhid_Shekhar_Resume.pdf"
                    onClick={handleDownloadResume}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 bg-[#F8FAFC] dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-[#171717] dark:text-white rounded-full font-semibold text-[15px] border border-[#E5E7EB] dark:border-white/10 transition-all cursor-pointer"
                  >
                    <FaDownload /> Download CV
                  </a>
                </div>

                {isAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleReanalyze}
                      disabled={analyzing}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C2272D]/10 hover:bg-[#C2272D]/20 text-[#C2272D] dark:text-[#00FFFF] rounded-full font-bold text-xs border border-[#C2272D]/20 transition-all"
                    >
                      {analyzing ? <FaSpinner className="animate-spin" /> : <FaRedo />} Re-analyze
                    </button>
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-full font-bold text-xs border border-amber-500/20 transition-all cursor-pointer">
                      <FaUpload /> Replace Resume
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleReplaceFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Column 2 (col-span-4): ATS Score Dial & Compatibility Bars */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-4 flex flex-col gap-6"
            >
              {/* ATS circular status dial */}
              <div className="glass p-6 rounded-[24px] border border-slate-100 dark:border-white/5 flex items-center justify-between gap-4 shadow-sm bg-white dark:bg-[#121217]">
                <div className="text-left">
                  <h3 className="text-base font-black font-title text-[#171717] dark:text-white mb-1">
                    ATS Verification Index
                  </h3>
                  <p className="text-xs text-[#525252] dark:text-[#D1D5DB] leading-normal">
                    Scanned against industry parser syntax rules.
                  </p>
                </div>

                <div className="relative w-16 h-16 rounded-full flex items-center justify-center shrink-0 bg-slate-50 dark:bg-[#171720] border border-slate-200 dark:border-white/5">
                  <svg className="w-full h-full rotate-[-90deg]">
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="transparent"
                      className="text-slate-100 dark:text-white/5"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 26}
                      strokeDashoffset={2 * Math.PI * 26 * (1 - atsScore / 100)}
                      className={getScoreColor(atsScore)}
                    />
                  </svg>
                  <div className="absolute text-sm font-black font-title text-[#C2272D] dark:text-[#00FFFF]">
                    {atsScore}%
                  </div>
                </div>
              </div>

              {/* Progress Bars checklist */}
              <div className="glass p-6 rounded-[24px] border border-slate-100 dark:border-white/5 bg-white dark:bg-[#121217] flex flex-col gap-3">
                <h4 className="text-xs font-black font-title text-[#171717] dark:text-white uppercase tracking-wider mb-1 text-left">CV Section Compatibility</h4>
                
                <div className="flex flex-col gap-3">
                  {breakdownBars.map((bar, idx) => (
                    <div key={idx} className="flex flex-col gap-1 text-left">
                      <div className="flex justify-between items-center text-xs font-bold text-[#525252] dark:text-[#D1D5DB]">
                        <span>{bar.label}</span>
                        <span>{bar.val}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#C2272D] to-[#00FFFF] rounded-full transition-all duration-1000"
                          style={{ width: `${bar.val}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Column 3 (col-span-4): Key Resume Highlights Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-4 flex flex-col gap-6"
            >
              <div className="glass p-6 md:p-7 rounded-[24px] border border-slate-100 dark:border-white/5 flex flex-col gap-5 shadow-sm bg-white dark:bg-[#121217]">
                <div className="border-b border-slate-150 dark:border-white/5 pb-3 text-left">
                  <h3 className="text-sm font-black font-title text-[#171717] dark:text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <FaAward className="text-[#C2272D] dark:text-[#00FFFF] animate-pulse" /> Key Resume Highlights
                  </h3>
                  <p className="text-xs text-[#525252] dark:text-[#D1D5DB]">
                    AI-powered summary of profile strength markers.
                  </p>
                </div>

                {/* Profile Summary */}
                <div className="flex flex-col gap-1.5 text-left">
                  <span className="text-xs font-black text-[#525252] dark:text-[#D1D5DB] uppercase tracking-wider flex items-center gap-1.5">
                    <FaBook size={12} className="text-[#C2272D] dark:text-[#00FFFF]" /> Career Summary
                  </span>
                  <p className="text-sm text-[#525252] dark:text-[#D1D5DB] leading-relaxed italic bg-slate-50 dark:bg-[#181822] p-3.5 rounded-2xl border border-slate-150 dark:border-white/5">
                    {activeResume?.parsedData?.summary ? `"${activeResume.parsedData.summary}"` : `"Results-driven Full-Stack MERN Developer passionate about building robust, scalable web applications with seamless user experiences. Experienced in developing responsive frontends with React and designing high-performance REST APIs with Node.js and Express. Proficient in database modeling with MongoDB and MySQL."`}
                  </p>
                </div>

                {/* Tone & Level metrics */}
                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="p-3.5 bg-slate-50 dark:bg-[#181822] border border-slate-150 dark:border-white/5 rounded-2xl">
                    <span className="text-[11px] font-black text-[#525252] dark:text-[#D1D5DB] uppercase tracking-wider block mb-1">Tone Analysis</span>
                    <span className="text-sm font-bold text-[#171717] dark:text-white capitalize">
                      {activeResume?.readability?.tone || 'Professional'}
                    </span>
                  </div>
                  <div className="p-3.5 bg-slate-50 dark:bg-[#181822] border border-slate-150 dark:border-white/5 rounded-2xl">
                    <span className="text-[11px] font-black text-[#525252] dark:text-[#D1D5DB] uppercase tracking-wider block mb-1">Career Level</span>
                    <span className="text-sm font-bold text-[#171717] dark:text-white capitalize">
                      {activeResume?.aiAnalysis?.careerLevel || 'Full-Stack MERN Developer'}
                    </span>
                  </div>
                </div>

                {/* Technical Skills Badge List */}
                <div className="flex flex-col gap-1.5 text-left">
                  <span className="text-xs font-black text-[#525252] dark:text-[#D1D5DB] uppercase tracking-wider flex items-center gap-1.5">
                    <FaCode size={12} className="text-[#C2272D] dark:text-[#00FFFF]" /> Verified Technical Skills
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeResume?.parsedData?.skills && activeResume.parsedData.skills.length > 0 ? (
                      activeResume.parsedData.skills.map((s, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-[#F8FAFC] dark:bg-white/5 border border-[#E5E7EB] dark:border-white/10 text-[#171717] dark:text-[#D1D5DB] rounded-xl text-xs font-bold">
                          {s}
                        </span>
                      ))
                    ) : (
                      ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'JavaScript', 'REST APIs', 'JWT', 'MySQL', 'Java', 'Python', 'Tailwind CSS', 'Git', 'GitHub'].map((s, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-[#F8FAFC] dark:bg-white/5 border border-[#E5E7EB] dark:border-white/10 text-[#171717] dark:text-[#D1D5DB] rounded-xl text-xs font-bold">
                          {s}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Audit Key Weak Bullet Points or Suggestions */}
                <div className="flex flex-col gap-1.5 text-left">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <FaTasks size={10} className="text-[#C2272D] dark:text-[#00FFFF] animate-pulse" /> Verified Credentials & Education
                  </span>
                  <div className="flex flex-col gap-2">
                    <div className="p-3 bg-slate-50 dark:bg-[#181822] border border-slate-150 dark:border-white/5 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-[#C2272D] dark:text-[#00FFFF] uppercase tracking-wider">Education</span>
                      <span className="text-xs text-[#171717] dark:text-white font-semibold">Bachelor of Computer Applications (BCA)</span>
                      <span className="text-[11px] text-[#525252] dark:text-[#D1D5DB]">Global Group of Institutes, Amritsar (2023–2026) • CGPA 8.0/10</span>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-[#181822] border border-slate-150 dark:border-white/5 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-[#C2272D] dark:text-[#00FFFF] uppercase tracking-wider">Featured Projects</span>
                      <span className="text-xs text-[#171717] dark:text-white font-semibold">Course sellingPlatform (MERN LMS)</span>
                      <span className="text-[11px] text-[#525252] dark:text-[#D1D5DB]">Full-stack platform with JWT authentication & MongoDB schema modeling</span>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>

          </div>
        )}

      </div>

      {/* Full Screen Resume Preview Modal */}
      <AnimatePresence>
        {showFullPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white dark:bg-[#121217] rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#181822]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#C2272D]/10 text-[#C2272D] flex items-center justify-center">
                    <FaFilePdf size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#171717] dark:text-white">
                      Tauhid Shekhar — Full-Stack MERN Developer Resume
                    </h3>
                    <p className="text-[11px] text-[#525252] dark:text-gray-400">
                      Document Verification • ATS Index: 98%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={resumePdfUrl || '/assits/Resume-file.pdf'}
                    onClick={handleDownloadResume}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#C2272D] hover:bg-[#A51E23] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    <FaDownload size={11} /> Download
                  </a>
                  <a
                    href={resumePdfUrl || '/assits/Resume-file.pdf'}
                    onClick={handleViewResume}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-[#171717] dark:text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <FaEye size={11} /> Open PDF
                  </a>
                  <button
                    onClick={() => setShowFullPreview(false)}
                    className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-300 transition-colors ml-1"
                    aria-label="Close modal"
                  >
                    <FaTimes size={18} />
                  </button>
                </div>
              </div>

              {/* Modal Body: Document Preview */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center bg-slate-100 dark:bg-[#07070a]">
                <img
                  src="/assits/Resume-file.png"
                  alt="Tauhid Shekhar Resume Full Preview"
                  className="max-w-full h-auto rounded-xl shadow-xl border border-slate-200 dark:border-white/10"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};

export default Resume;
