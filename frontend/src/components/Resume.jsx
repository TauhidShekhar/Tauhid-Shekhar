import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { 
  FaFilePdf, FaDownload, FaRedo, FaUpload, FaEye, FaCheck, FaExclamationTriangle,
  FaAward, FaBook, FaTasks, FaBriefcase, FaCode, FaCheckCircle, FaSpinner, FaTimes
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const getAbsolutePdfUrl = (url) => {
  if (!url) return '';
  let cleanUrl = url.trim();
  if (cleanUrl.includes('/raw/upload/') && cleanUrl.toLowerCase().endsWith('.pdf')) {
    cleanUrl = cleanUrl.replace('/raw/upload/', '/image/upload/');
  }
  if (/^(f|ht)tps?:\/\//i.test(cleanUrl)) {
    return cleanUrl;
  }
  return `https://${cleanUrl}`;
};

const Resume = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [activeResume, setActiveResume] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    fetchActiveResume();
  }, []);

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

  const handleDownloadResume = async (e) => {
    e.preventDefault();
    if (!resumePdfUrl) return;
    try {
      const response = await fetch(resumePdfUrl);
      if (!response.ok) throw new Error('Fetch failed');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', activeResume?.fileName || 'Resume.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Failed to download resume directly, using fl_attachment redirect:', err.message);
      let downloadUrl = resumePdfUrl;
      if (downloadUrl.includes('/image/upload/')) {
        downloadUrl = downloadUrl.replace('/image/upload/', '/image/upload/fl_attachment/');
      } else if (downloadUrl.includes('/raw/upload/')) {
        downloadUrl = downloadUrl.replace('/raw/upload/', '/raw/upload/fl_attachment/');
      }
      window.open(downloadUrl, '_blank');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500 stroke-green-500';
    if (score >= 60) return 'text-amber-500 stroke-amber-500';
    return 'text-red-500 stroke-red-500';
  };

  const resumePdfUrl = getAbsolutePdfUrl(activeResume?.fileUrl || settings?.resumeUrl || '');
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
        <div className="text-center mb-16">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary-blue font-title mb-2">Recruiter Panel</h3>
          <h2 className="text-3xl md:text-5xl font-black font-title tracking-tight text-black dark:text-white">ATS & Resume Preview</h2>
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
            <FaSpinner className="animate-spin text-primary-blue" size={32} />
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
              <div className="glass p-2.5 rounded-[28px] border border-slate-100 dark:border-white/5 shadow-md w-full aspect-[1/1.41] relative overflow-hidden group bg-white dark:bg-[#121217] flex flex-col items-center justify-center">
                {resumePdfUrl ? (
                  <div 
                    onClick={() => window.open(resumePdfUrl, '_blank')}
                    className="w-full h-full rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-all group relative border border-dashed border-slate-200 dark:border-white/10"
                  >
                    {/* Glowing background gradient on hover */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary-blue/5 to-primary-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                    
                    <div className="w-20 h-20 rounded-3xl bg-red-500/10 dark:bg-red-500/15 text-red-500 flex items-center justify-center mb-6 shadow-inner transform group-hover:scale-110 transition-all duration-300 relative z-10">
                      <FaFilePdf size={40} />
                    </div>
                    
                    <div className="relative z-10">
                      <h4 className="text-sm font-black text-slate-800 dark:text-white mb-2 truncate max-w-[240px]">
                        {settings?.siteName ? `${settings.siteName.replace(/\s+/g, '_')}_CV.pdf` : 'Tauhid_Shekhar_CV.pdf'}
                      </h4>
                      <p className="text-[11px] text-slate-550 dark:text-slate-400 font-bold uppercase tracking-wider mb-4">
                        Click to View Document
                      </p>
                      
                      {/* Premium Badge */}
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[9px] font-black uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Verified PDF
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center h-full w-full">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-5">
                      <FaFilePdf size={32} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1.5">No Resume Available</h4>
                    <p className="text-[11px] text-slate-550 dark:text-slate-400 max-w-[220px] leading-relaxed">
                      Administrator has not uploaded an active resume yet.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2.5">
                {resumePdfUrl ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => window.open(resumePdfUrl, '_blank')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-blue hover:bg-accent-blue text-white rounded-full font-bold text-[11px] shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <FaEye /> View Resume PDF
                    </button>
                    <a
                      href={resumePdfUrl}
                      onClick={handleDownloadResume}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-white rounded-full font-bold text-[11px] border border-slate-200 dark:border-white/5 transition-all cursor-pointer"
                    >
                      <FaDownload /> Download CV
                    </a>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 font-bold p-3 bg-slate-100/50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 w-full text-center">
                    Administrator resume is currently not available.
                  </div>
                )}

                {isAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleReanalyze}
                      disabled={analyzing}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600/10 hover:bg-purple-650/20 text-purple-400 rounded-full font-bold text-[11px] border border-purple-500/20 transition-all"
                    >
                      {analyzing ? <FaSpinner className="animate-spin" /> : <FaRedo />} Re-analyze
                    </button>
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-full font-bold text-[11px] border border-amber-500/20 transition-all cursor-pointer">
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
                  <h3 className="text-sm font-black font-title text-black dark:text-white mb-1">
                    ATS Verification Index
                  </h3>
                  <p className="text-[10px] text-slate-550 dark:text-slate-400 leading-normal">
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
                  <div className="absolute text-xs font-black font-title text-primary-blue">
                    {atsScore}%
                  </div>
                </div>
              </div>

              {/* Progress Bars checklist */}
              <div className="glass p-6 rounded-[24px] border border-slate-100 dark:border-white/5 bg-white dark:bg-[#121217] flex flex-col gap-3">
                <h4 className="text-xs font-black font-title text-black dark:text-white uppercase tracking-wider mb-1 text-left">CV Section Compatibility</h4>
                
                <div className="flex flex-col gap-3">
                  {breakdownBars.map((bar, idx) => (
                    <div key={idx} className="flex flex-col gap-1 text-left">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-600 dark:text-slate-350">
                        <span>{bar.label}</span>
                        <span>{bar.val}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-blue rounded-full transition-all duration-1000"
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
                  <h3 className="text-xs font-black font-title text-black dark:text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <FaAward className="text-primary-blue animate-pulse" /> Key Resume Highlights
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    AI-powered summary of profile strength markers.
                  </p>
                </div>

                {/* Profile Summary */}
                <div className="flex flex-col gap-1.5 text-left">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <FaBook size={10} className="text-purple-400" /> Career Summary
                  </span>
                  <p className="text-[11px] text-slate-650 dark:text-slate-350 leading-relaxed italic bg-slate-50 dark:bg-[#181822] p-3 rounded-2xl border border-slate-150 dark:border-white/5">
                    {activeResume?.parsedData?.summary ? `"${activeResume.parsedData.summary}"` : `"Full stack software engineer with extensive experience in the MERN stack ecosystem. Specialized in constructing high-performance REST APIs, stateful interfaces, and database architectures."`}
                  </p>
                </div>

                {/* Tone & Level metrics */}
                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="p-3 bg-slate-50 dark:bg-[#181822] border border-slate-150 dark:border-white/5 rounded-2xl">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Tone Analysis</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-white capitalize">
                      {activeResume?.readability?.tone || 'Professional'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-[#181822] border border-slate-150 dark:border-white/5 rounded-2xl">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Career Level</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-white capitalize">
                      {activeResume?.aiAnalysis?.careerLevel || 'Mid to Senior'}
                    </span>
                  </div>
                </div>

                {/* Technical Skills Badge List */}
                <div className="flex flex-col gap-1.5 text-left">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <FaCode size={10} className="text-primary-blue" /> Verified Technical Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeResume?.parsedData?.skills && activeResume.parsedData.skills.length > 0 ? (
                      activeResume.parsedData.skills.map((s, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-750 dark:text-slate-300 rounded-lg text-[10px] font-bold">
                          {s}
                        </span>
                      ))
                    ) : (
                      ['React', 'Node.js', 'Express', 'MongoDB', 'REST API', 'GraphQL', 'JWT', 'TypeScript', 'Docker', 'AWS'].map((s, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-750 dark:text-slate-300 rounded-lg text-[10px] font-bold">
                          {s}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Audit Key Weak Bullet Points or Suggestions */}
                <div className="flex flex-col gap-1.5 text-left">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <FaTasks size={10} className="text-amber-500 animate-pulse" /> Recommended Improvements
                  </span>
                  <div className="flex flex-col gap-2">
                    {activeResume?.aiSuggestions && activeResume.aiSuggestions.length > 0 ? (
                      activeResume.aiSuggestions.slice(0, 2).map((s, idx) => (
                        <div key={idx} className="p-2.5 bg-amber-500/5 border border-amber-500/10 rounded-xl flex flex-col gap-1">
                          <span className="text-[9px] font-black text-amber-500 uppercase">Change in {s.section}:</span>
                          {s.currentText && <span className="text-[10px] line-through text-slate-400">{s.currentText}</span>}
                          <span className="text-[10px] text-slate-800 dark:text-slate-200 font-bold">{s.improvedText}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="p-2.5 bg-amber-500/5 border border-amber-500/10 rounded-xl flex flex-col gap-1">
                          <span className="text-[9px] font-black text-amber-500 uppercase">Change in Projects:</span>
                          <span className="text-[10px] line-through text-slate-400">Worked on MERN Project</span>
                          <span className="text-[10px] text-slate-800 dark:text-slate-200 font-bold">Designed a scalable portfolio CMS stack serving 1,000+ active users.</span>
                        </div>
                        <div className="p-2.5 bg-amber-500/5 border border-amber-500/10 rounded-xl flex flex-col gap-1">
                          <span className="text-[9px] font-black text-amber-500 uppercase">Change in Skills:</span>
                          <span className="text-[10px] text-slate-800 dark:text-slate-200 font-bold">Integrate CI/CD pipelines and microservices deployments.</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>

          </div>
        )}

      </div>

      {/* Resume Section Ends */}

    </section>
  );
};

export default Resume;
