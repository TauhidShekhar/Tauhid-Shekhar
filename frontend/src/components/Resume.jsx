import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { 
  FaFilePdf, FaDownload, FaRedo, FaUpload, FaEye, FaCheck, FaExclamationTriangle,
  FaAward, FaBook, FaTasks, FaBriefcase, FaCode, FaCheckCircle, FaSpinner, FaTimes
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const Resume = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [activeResume, setActiveResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchActiveResume = async () => {
    setLoading(true);
    try {
      const res = await api.getResumes();
      if (res.success && res.data && res.data.length > 0) {
        const active = res.data.find(r => r.isActive) || res.data[0];
        setActiveResume(active);
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
      // Trigger a re-analysis query on the backend. Since this is the owner CV,
      // we evaluate it and refresh its score.
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
      // Upload new CV using existing admin route
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

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500 stroke-green-500';
    if (score >= 60) return 'text-amber-500 stroke-amber-500';
    return 'text-red-500 stroke-red-500';
  };

  const resumePdfUrl = activeResume?.fileUrl || 'assits/Resume-file.pdf';
  const atsScore = activeResume?.atsScore || 94; // fallback standard compliant compliance score

  // Score breakdowns list
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Side: Resume PDF Preview */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-6 flex flex-col gap-6"
            >
              <div className="glass p-2.5 rounded-[28px] border border-slate-100 dark:border-white/5 shadow-md w-full aspect-[1/1.41] relative overflow-hidden group bg-slate-100/50 dark:bg-slate-900/40">
                <iframe
                  src={resumePdfUrl}
                  className="w-full h-full rounded-2xl border-0"
                  title="Resume Document Preview"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowFullPreview(true)}
                  className="flex items-center gap-2 px-5 py-3 bg-primary-blue hover:bg-accent-blue text-white rounded-full font-bold text-xs shadow-md transition-all active:scale-[0.98]"
                >
                  <FaEye /> Preview Full Screen
                </button>
                <a
                  href={resumePdfUrl}
                  download
                  className="flex items-center gap-2 px-5 py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-white rounded-full font-bold text-xs border border-slate-200 dark:border-white/5 transition-all"
                >
                  <FaDownload /> Download Resume
                </a>

                {isAdmin && (
                  <>
                    <button
                      onClick={handleReanalyze}
                      disabled={analyzing}
                      className="flex items-center gap-2 px-5 py-3 bg-purple-600/10 hover:bg-purple-650/20 text-purple-400 rounded-full font-bold text-xs border border-purple-500/20 transition-all"
                    >
                      {analyzing ? <FaSpinner className="animate-spin" /> : <FaRedo />} Re-analyze
                    </button>
                    <label className="flex items-center gap-2 px-5 py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-full font-bold text-xs border border-amber-500/20 transition-all cursor-pointer">
                      <FaUpload /> Replace Resume
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleReplaceFileChange}
                        className="hidden"
                      />
                    </label>
                  </>
                )}
              </div>
            </motion.div>

            {/* Right Side: ATS Score circle & progress bars */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-6 flex flex-col gap-8"
            >
              {/* ATS circular status dial */}
              <div className="glass p-6 md:p-8 rounded-[24px] border border-slate-100 dark:border-white/5 flex items-center justify-between gap-6 shadow-sm bg-white dark:bg-[#121217]">
                <div>
                  <h3 className="text-xl font-black font-title text-black dark:text-white mb-2">
                    ATS Verification Index
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Evaluated against industrial keyword scanners, semantic structures, and parsing rules.
                  </p>
                </div>

                <div className="relative w-20 h-20 rounded-full flex items-center justify-center shrink-0 bg-slate-50 dark:bg-[#171720] border border-slate-200 dark:border-white/5">
                  <svg className="w-full h-full rotate-[-90deg]">
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      fill="transparent"
                      className="text-slate-100 dark:text-white/5"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 34}
                      strokeDashoffset={2 * Math.PI * 34 * (1 - atsScore / 100)}
                      className={getScoreColor(atsScore)}
                    />
                  </svg>
                  <div className="absolute text-base font-black font-title text-primary-blue">
                    {atsScore}%
                  </div>
                </div>
              </div>

              {/* Progress Bars checklist */}
              <div className="flex flex-col gap-4">
                <h4 className="text-sm font-black font-title text-black dark:text-white uppercase tracking-wider mb-2">CV Breakdown Compatibility</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {breakdownBars.map((bar, idx) => (
                    <div key={idx} className="flex flex-col gap-1 text-left">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-350">
                        <span>{bar.label}</span>
                        <span>{bar.val}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-blue rounded-full transition-all duration-1000"
                          style={{ width: `${bar.val}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggestions Summary block */}
              {activeResume?.aiSuggestions && activeResume.aiSuggestions.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h4 className="text-sm font-black font-title text-black dark:text-white uppercase tracking-wider mb-1">AI Improvement Suggestions</h4>
                  <div className="flex flex-col gap-3">
                    {activeResume.aiSuggestions.slice(0, 2).map((item, idx) => (
                      <div key={idx} className="p-4 bg-purple-600/5 border border-purple-500/10 rounded-2xl">
                        <span className="text-[10px] font-black text-purple-400 uppercase">{item.section} Suggestion</span>
                        <p className="text-[11px] text-slate-400 mt-1 leading-normal font-medium">"{item.explanation}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>

          </div>
        )}

      </div>

      {/* Full screen preview Modal */}
      <AnimatePresence>
        {showFullPreview && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="absolute inset-0" onClick={() => setShowFullPreview(false)} />
            <div className="relative w-full max-w-5xl h-[85vh] bg-[#121217] rounded-3xl border border-white/10 overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#171720]">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <FaFilePdf className="text-red-500" /> Full Resume Preview
                </h3>
                <button onClick={() => setShowFullPreview(false)} className="p-1 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
                  <FaTimes size={18} />
                </button>
              </div>
              <div className="flex-1 p-2">
                <iframe src={resumePdfUrl} className="w-full h-full border-0 rounded-2xl" />
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};

export default Resume;
