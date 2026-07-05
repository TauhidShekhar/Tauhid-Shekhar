import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { FaFileDownload, FaPrint, FaSearch, FaCheck, FaGraduationCap, FaAward, FaCode } from 'react-icons/fa';

const Resume = () => {
  const [activeResume, setActiveResume] = useState(null);

  useEffect(() => {
    const fetchActiveResume = async () => {
      try {
        const res = await api.getResumes();
        if (res.success && res.data && res.data.length > 0) {
          const active = res.data.find(r => r.isActive) || res.data[0];
          setActiveResume(active);
        }
      } catch (err) {
        console.error('Failed to load active resume:', err.message);
      }
    };
    fetchActiveResume();
  }, []);

  const resumePdfUrl = activeResume?.fileUrl || 'assits/Resume-file.pdf';
  const resumePngUrl = activeResume?.fileUrl ? activeResume.fileUrl.replace(/\.pdf$/i, '.png') : 'assits/Resume-file.png';

  const highlights = [
    { title: 'Full Stack Web Developer', desc: 'MERN stack projects, REST APIs, and database modeling.', icon: <FaCode className="text-primary-blue" /> },
    { title: 'Graphic Designer', desc: '2-3 years creating social media creatives and YouTube CTR thumbnails.', icon: <FaAward className="text-primary-purple" /> },
    { title: 'BCA Scholar', desc: 'Global Group of Institutes scholar with an 8.5 CGPA out of 10.', icon: <FaGraduationCap className="text-primary-cyan" /> },
  ];

  return (
    <section id="resume" className="py-24 bg-slate-50 dark:bg-black relative">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary-blue font-title mb-2">Recruiter Panel</h3>
          <h2 className="text-3xl md:text-5xl font-black font-title tracking-tight text-black dark:text-white">ATS & Resume Preview</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Side: Resume PNG Preview */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex flex-col items-center gap-6"
          >
            <div className="glass p-2.5 rounded-[28px] border border-slate-100 dark:border-white/5 shadow-md w-full max-w-[450px] aspect-[1/1.41] relative overflow-hidden group">
              <object
                data={resumePdfUrl}
                type="application/pdf"
                className="w-full h-full rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm"
              >
                <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-slate-50 dark:bg-slate-900 rounded-2xl">
                  <FaFileDownload className="text-primary-blue mb-3 animate-bounce" size={32} />
                  <p className="text-xs font-bold text-slate-800 dark:text-white font-title">Resume PDF Document</p>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">
                    PDF preview not loaded natively. You can view or download it directly.
                  </p>
                  <a
                    href={resumePdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 px-4 py-2 bg-primary-blue hover:bg-accent-blue text-white text-[10px] font-black rounded-xl shadow-md transition-colors"
                  >
                    Open PDF in New Tab
                  </a>
                </div>
              </object>
            </div>

            <div className="flex gap-4">
              <a
                href={resumePdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-primary-blue hover:bg-accent-blue text-white rounded-full font-bold text-sm shadow-lg shadow-primary-blue/15 transition-all"
              >
                View Resume
              </a>
              <a
                href={resumePdfUrl}
                download
                className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-white rounded-full font-bold text-sm border border-slate-200 dark:border-white/5 transition-all cursor-pointer"
              >
                <FaFileDownload size={14} /> Download PDF
              </a>
            </div>
          </motion.div>

          {/* Right Side: ATS Score & Highlights */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex flex-col gap-8 text-left"
          >
            {/* ATS Score Dial */}
            <div className="glass p-6 md:p-8 rounded-[24px] border border-slate-100 dark:border-white/5 flex items-center justify-between gap-6 shadow-sm">
              <div>
                <h3 className="text-xl md:text-2xl font-black font-title text-black dark:text-white mb-2">
                  ATS Verification Score
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Validated against standard recruiter screening checkers for parser compliance.
                </p>
              </div>

              {/* Progress Circle */}
              <div className="relative w-[84px] h-[84px] rounded-full flex items-center justify-center shrink-0 shadow-md shadow-primary-blue/10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5">
                <svg className="w-full h-full rotate-[-90deg]">
                  <circle
                    cx="42"
                    cy="42"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-slate-100 dark:text-white/5"
                  />
                  <circle
                    cx="42"
                    cy="42"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="4.5"
                    fill="transparent"
                    strokeDasharray="226"
                    strokeDashoffset="13"
                    className="text-primary-blue"
                  />
                </svg>
                <div className="absolute text-lg font-black font-title text-primary-blue">
                  94%
                </div>
              </div>
            </div>

            {/* Resume Highlights */}
            <div className="flex flex-col gap-4">
              <h4 className="text-lg font-bold font-title text-black dark:text-white mb-2">Resume Highlights</h4>
              {highlights.map((hl, idx) => (
                <div key={idx} className="flex gap-4 items-start p-4 bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 rounded-2xl shadow-inner">
                  <div className="p-3 rounded-xl bg-slate-550/5 dark:bg-slate-900 flex items-center justify-center shrink-0 shadow-sm border border-slate-200/40 dark:border-white/5">
                    {hl.icon}
                  </div>
                  <div>
                    <h5 className="text-base font-bold text-black dark:text-white leading-tight mb-1">{hl.title}</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{hl.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ATS Compliance Checklist */}
            <div className="flex flex-col gap-3">
              <h4 className="text-lg font-bold font-title text-black dark:text-white mb-2">Parser Checkpoints</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-550 dark:text-slate-400">
                  <span className="w-5 h-5 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center shrink-0">
                    <FaCheck size={9} />
                  </span>
                  No text-in-image elements
                </div>
                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-550 dark:text-slate-400">
                  <span className="w-5 h-5 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center shrink-0">
                    <FaCheck size={9} />
                  </span>
                  Standard parsing headers
                </div>
                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-550 dark:text-slate-400">
                  <span className="w-5 h-5 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center shrink-0">
                    <FaCheck size={9} />
                  </span>
                  Linked profiles (GitHub, LinkedIn)
                </div>
                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-550 dark:text-slate-400">
                  <span className="w-5 h-5 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center shrink-0">
                    <FaCheck size={9} />
                  </span>
                  Single column, parser-friendly layout
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Resume;
