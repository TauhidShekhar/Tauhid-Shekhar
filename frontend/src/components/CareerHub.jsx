import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaAward, FaBook, FaBriefcase, FaCode, FaFilePdf, FaMagic, FaSearch, FaHistory,
  FaCheckCircle, FaTimesCircle, FaDownload, FaUpload, FaEye, FaRedo, FaTrash, 
  FaGraduationCap, FaPaperPlane, FaSpinner, FaChevronRight, FaPlus, FaTasks, FaFolderOpen,
  FaPrint, FaSave, FaList, FaRegEye, FaCompress, FaExpand
} from 'react-icons/fa';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CareerHub = () => {
  const { user } = useAuth();
  
  // Tab State
  const [activeSubTab, setActiveSubTab] = useState('atsChecker'); // atsChecker, coverLetter, builder, interviewPrep, toolkit, templates
  
  // ATS Checker States
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeReport, setActiveReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Job Matcher & Rewriter States
  const [jobDescription, setJobDescription] = useState('');
  const [matchingJd, setMatchingJd] = useState(false);
  const [jdMatchResult, setJdMatchResult] = useState(null);
  const [rewriteInput, setRewriteInput] = useState('');
  const [rewriteSection, setRewriteSection] = useState('Summary');
  const [rewriteResult, setRewriteResult] = useState(null);
  const [rewriting, setRewriting] = useState(false);

  // Cover Letter States
  const [clJobTitle, setClJobTitle] = useState('');
  const [clCompany, setClCompany] = useState('');
  const [clDetails, setClDetails] = useState('');
  const [clOutput, setClOutput] = useState('');
  const [generatingCl, setGeneratingCl] = useState(false);

  // Resume Builder States
  const [selectedTemplate, setSelectedTemplate] = useState('STA-MOD'); // ENG-MIN, STA-MOD, EXEC-DEV
  const [builderData, setBuilderData] = useState({
    name: user?.fullName || 'Tauhid Shekhar',
    title: 'Full Stack MERN Developer',
    email: user?.email || 'tauhid@example.com',
    phone: '+91 98765 43210',
    location: 'Punjab, India',
    github: 'github.com/tauhidshekhar',
    linkedin: 'linkedin.com/in/tauhidshekhar',
    summary: 'Highly motivated Full Stack Developer with expertise in building real-time community systems, automated AI audit panels, and modern reactive dashboards using the MERN stack.',
    skills: 'React, Node.js, Express, MongoDB, Socket.io, Gemini AI, TailwindCSS, REST APIs, Git, Docker, JWT',
    experiences: [
      { jobTitle: 'Full Stack Intern', company: 'DevTech Solutions', duration: '2025 - Present', description: 'Developed React web apps, integrated Cloudinary storage wrappers, and audited API controllers.' }
    ],
    educations: [
      { degree: 'Bachelor of Computer Applications (BCA)', school: 'Global Group of Institutes', year: '2023 - 2026' }
    ],
    projects: [
      { title: 'DevCommunity Platform', techUsed: 'React, Node, Socket.io, Mongo', description: 'Built a collaborative developer portal with rewards system, live code analyzer, and career panels.' }
    ]
  });

  const [showAnswer, setShowAnswer] = useState({});
  const previewRef = useRef(null);
  const [isMaximized, setIsMaximized] = useState(false);

  const toggleMaximize = () => {
    const nextState = !isMaximized;
    setIsMaximized(nextState);
    if (nextState) {
      document.body.classList.add('career-hub-maximized');
    } else {
      document.body.classList.remove('career-hub-maximized');
    }
  };

  // Auto Load Draft from Local Storage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('career_hub_resume_draft');
    if (savedDraft) {
      try {
        setBuilderData(JSON.parse(savedDraft));
      } catch (err) {
        console.warn('Failed to parse saved resume draft:', err.message);
      }
    }
  }, []);

  // Auto Save Draft to Local Storage whenever builderData changes
  useEffect(() => {
    localStorage.setItem('career_hub_resume_draft', JSON.stringify(builderData));
  }, [builderData]);

  // Clean up body class on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove('career-hub-maximized');
    };
  }, []);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.getResumeHistory();
      if (res.success && res.data && res.data.length > 0) {
        setHistory(res.data);
        const latest = res.data[0];
        setActiveReport(latest);
      }
    } catch (err) {
      console.error('Failed to load resume history:', err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    const ext = selectedFile.name.split('.').pop().toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext)) {
      setError('Supported formats: PDF, DOC, DOCX.');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB.');
      return;
    }
    setError('');
    setFile(selectedFile);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await api.uploadAndAnalyzeResume(formData);
      if (res.success && res.data) {
        setSuccess('Resume analyzed successfully!');
        setActiveReport(res.data);
        setFile(null);
        fetchHistory();
      } else {
        setError(res.message || 'Analysis failed. Please verify file content.');
      }
    } catch (err) {
      setError('Server connection error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteHistory = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this analysis run?')) return;
    try {
      const res = await api.deleteResumeAnalysis(id);
      if (res.success) {
        setHistory(prev => prev.filter(item => item._id !== id));
        if (activeReport?._id === id) {
          setActiveReport(null);
        }
      }
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleJobMatch = async (e) => {
    e.preventDefault();
    if (!jobDescription.trim() || !activeReport) return;

    setMatchingJd(true);
    try {
      const res = await api.matchJobDescription(activeReport._id, { jobDescription });
      if (res.success) {
        setJdMatchResult(res.data);
      }
    } catch (err) {
      alert('Job match evaluation failed: ' + err.message);
    } finally {
      setMatchingJd(false);
    }
  };

  const handleRewriteSection = async (e) => {
    e.preventDefault();
    if (!rewriteInput.trim() || !activeReport) return;

    setRewriting(true);
    try {
      const res = await api.rewriteResumeSection(activeReport._id, {
        section: rewriteSection,
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

  const handleGenerateCoverLetter = async (e) => {
    e.preventDefault();
    if (!clJobTitle || !clCompany) return;

    setGeneratingCl(true);
    setClOutput('');
    try {
      const promptText = `Write a professional cover letter for the role of ${clJobTitle} at ${clCompany}. Match it with the following details: ${clDetails}`;
      const res = await api.aiGenerateContent(promptText, 'Cover Letter');
      if (res.success) {
        setClOutput(res.data || 'Cover letter generated successfully.');
      }
    } catch (err) {
      setClOutput('Failed to generate cover letter: ' + err.message);
    } finally {
      setGeneratingCl(false);
    }
  };

  // Dynamic builder array mutations
  const handleAddExperience = () => {
    setBuilderData(prev => ({
      ...prev,
      experiences: [...prev.experiences, { jobTitle: '', company: '', duration: '', description: '' }]
    }));
  };

  const handleRemoveExperience = (idx) => {
    setBuilderData(prev => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== idx)
    }));
  };

  const handleAddEducation = () => {
    setBuilderData(prev => ({
      ...prev,
      educations: [...prev.educations, { degree: '', school: '', year: '' }]
    }));
  };

  const handleRemoveEducation = (idx) => {
    setBuilderData(prev => ({
      ...prev,
      educations: prev.educations.filter((_, i) => i !== idx)
    }));
  };

  const handleAddProject = () => {
    setBuilderData(prev => ({
      ...prev,
      projects: [...prev.projects, { title: '', techUsed: '', description: '' }]
    }));
  };

  const handleRemoveProject = (idx) => {
    setBuilderData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== idx)
    }));
  };

  // Resume Downloaders
  const downloadTextResume = () => {
    const text = `
==================================================
${builderData.name.toUpperCase()} - ${builderData.title}
Email: ${builderData.email} | Phone: ${builderData.phone}
Location: ${builderData.location}
GitHub: ${builderData.github} | LinkedIn: ${builderData.linkedin}
==================================================

PROFESSIONAL SUMMARY:
${builderData.summary}

TECHNICAL SKILLS:
${builderData.skills}

WORK EXPERIENCE:
${builderData.experiences.map(exp => `- ${exp.jobTitle} at ${exp.company} (${exp.duration})\n  ${exp.description}`).join('\n\n')}

PROJECTS:
${builderData.projects.map(proj => `- ${proj.title} [${proj.techUsed}]\n  ${proj.description}`).join('\n\n')}

EDUCATION:
${builderData.educations.map(edu => `- ${edu.degree} from ${edu.school} (${edu.year})`).join('\n')}
    `;
    const blob = new Blob([text.trim()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${builderData.name.replace(/\s+/g, '_')}_Resume.txt`;
    link.click();
  };

  const printResumePdf = () => {
    const printContent = previewRef.current ? previewRef.current.innerHTML : '';
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${builderData.name} - Resume</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { 
              font-family: 'Helvetica', 'Arial', sans-serif; 
              color: #111; 
              padding: 20px; 
              line-height: 1.5; 
              background-color: white !important;
            }
            @media print {
              body { 
                padding: 0; 
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .shadow-inner {
                box-shadow: none !important;
              }
            }
          </style>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 800);
            };
          </script>
        </head>
        <body>
          <div style="max-width: 800px; margin: 0 auto;">
            ${printContent}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const atsScore = activeReport?.atsScore || 0;

  // Render Template HTML Live Preview helper
  const renderTemplatePreview = () => {
    if (selectedTemplate === 'ENG-MIN') {
      return (
        <div className="text-[#333] bg-white p-6 rounded-xl shadow-inner min-h-[450px] font-serif text-xs leading-normal">
          <div className="text-center border-b border-black pb-3">
            <h1 className="text-xl font-bold tracking-tight text-black">{builderData.name}</h1>
            <p className="italic text-[10px] text-slate-600 mt-1">{builderData.title}</p>
            <div className="text-[9px] text-slate-500 mt-1 flex justify-center gap-2">
              <span>{builderData.email}</span>|<span>{builderData.phone}</span>|<span>{builderData.location}</span>
            </div>
            <div className="text-[9px] text-slate-500 flex justify-center gap-2 mt-0.5">
              <span>{builderData.github}</span>|<span>{builderData.linkedin}</span>
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="font-bold border-b border-slate-300 uppercase tracking-wider text-[9px] pb-0.5 text-black">Summary</h3>
            <p className="mt-1 text-[10px]">{builderData.summary}</p>
          </div>

          <div className="mt-4">
            <h3 className="font-bold border-b border-slate-300 uppercase tracking-wider text-[9px] pb-0.5 text-black">Skills</h3>
            <p className="mt-1 text-[10px]">{builderData.skills}</p>
          </div>

          <div className="mt-4">
            <h3 className="font-bold border-b border-slate-300 uppercase tracking-wider text-[9px] pb-0.5 text-black">Experience</h3>
            {builderData.experiences.map((exp, i) => (
              <div key={i} className="mt-2">
                <div className="flex justify-between font-bold text-black text-[10px]">
                  <span>{exp.jobTitle} — {exp.company}</span>
                  <span>{exp.duration}</span>
                </div>
                <p className="mt-0.5 text-[9.5px] text-slate-600">{exp.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <h3 className="font-bold border-b border-slate-300 uppercase tracking-wider text-[9px] pb-0.5 text-black">Projects</h3>
            {builderData.projects.map((proj, i) => (
              <div key={i} className="mt-2">
                <div className="flex justify-between font-bold text-black text-[10px]">
                  <span>{proj.title} ({proj.techUsed})</span>
                </div>
                <p className="mt-0.5 text-[9.5px] text-slate-600">{proj.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <h3 className="font-bold border-b border-slate-300 uppercase tracking-wider text-[9px] pb-0.5 text-black">Education</h3>
            {builderData.educations && builderData.educations.map((edu, i) => (
              <div key={i} className="mt-2">
                <div className="flex justify-between font-bold text-black text-[10px]">
                  <span>{edu.degree} — {edu.school}</span>
                  <span>{edu.year}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (selectedTemplate === 'STA-MOD') {
      return (
        <div className="text-slate-800 bg-white p-6 rounded-xl shadow-inner min-h-[450px] font-sans text-xs leading-normal">
          <div className="border-l-4 border-purple-600 pl-4 py-1">
            <h1 className="text-lg font-black text-slate-900 tracking-tight">{builderData.name}</h1>
            <p className="text-purple-600 font-bold text-[10px] uppercase tracking-wider mt-0.5">{builderData.title}</p>
            <div className="text-[9px] text-slate-500 mt-2 flex flex-wrap gap-x-3 gap-y-1">
              <span>✉ {builderData.email}</span>
              <span>📞 {builderData.phone}</span>
              <span>📍 {builderData.location}</span>
              <span>🔗 {builderData.github}</span>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-[10px] font-black text-purple-600 uppercase tracking-widest border-b border-purple-100 pb-1 mb-2">Professional Summary</h3>
            <p className="text-[10.5px] leading-relaxed text-slate-600">{builderData.summary}</p>
          </div>

          <div className="mt-6">
            <h3 className="text-[10px] font-black text-purple-600 uppercase tracking-widest border-b border-purple-100 pb-1 mb-2">Core Tech Stack</h3>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {builderData.skills.split(',').map((s, i) => (
                <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-[9px] font-bold border border-purple-100">
                  {s.trim()}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-[10px] font-black text-purple-600 uppercase tracking-widest border-b border-purple-100 pb-1 mb-2">Employment History</h3>
            {builderData.experiences.map((exp, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between font-bold text-slate-800 text-[10px]">
                  <span>{exp.jobTitle} @ {exp.company}</span>
                  <span className="text-[9px] text-purple-550">{exp.duration}</span>
                </div>
                <p className="mt-1 text-[9.5px] text-slate-600 leading-normal">{exp.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="text-[10px] font-black text-purple-600 uppercase tracking-widest border-b border-purple-100 pb-1 mb-2">Technical Projects</h3>
            {builderData.projects.map((proj, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between font-bold text-slate-800 text-[10px]">
                  <span>{proj.title}</span>
                  <span className="text-[8px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">{proj.techUsed}</span>
                </div>
                <p className="mt-1 text-[9.5px] text-slate-600 leading-normal">{proj.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="text-[10px] font-black text-purple-600 uppercase tracking-widest border-b border-purple-100 pb-1 mb-2">Education</h3>
            {builderData.educations && builderData.educations.map((edu, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between font-bold text-slate-800 text-[10px]">
                  <span>{edu.degree}</span>
                  <span className="text-[9px] text-purple-550">{edu.year}</span>
                </div>
                <p className="mt-1 text-[9.5px] text-slate-600 leading-normal">{edu.school}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Default: Executive layout
    return (
      <div className="text-slate-800 bg-white p-6 rounded-xl shadow-inner min-h-[450px] font-sans text-xs leading-normal grid grid-cols-12 gap-6">
        <div className="col-span-4 border-r border-slate-100 pr-4 flex flex-col gap-5">
          <div>
            <h1 className="text-base font-black text-slate-900 leading-tight">{builderData.name}</h1>
            <span className="text-[9px] text-slate-500 font-bold block mt-1">{builderData.title}</span>
          </div>
          <div className="flex flex-col gap-2 text-[9px] text-slate-500 text-left">
            <span className="block truncate">{builderData.email}</span>
            <span>{builderData.phone}</span>
            <span>{builderData.location}</span>
            <span className="block truncate">{builderData.github}</span>
            <span className="block truncate">{builderData.linkedin}</span>
          </div>
          <div>
            <h4 className="text-[9px] font-black text-slate-800 uppercase tracking-wider mb-2 border-b pb-0.5">Skills</h4>
            <div className="flex flex-col gap-1 text-[9.5px] text-slate-600">
              {builderData.skills.split(',').map((s, i) => <span key={i}>• {s.trim()}</span>)}
            </div>
          </div>
        </div>
        <div className="col-span-8 flex flex-col gap-5 text-left">
          <div>
            <h4 className="text-[9px] font-black text-slate-800 uppercase tracking-wider mb-2 border-b pb-0.5">Executive Summary</h4>
            <p className="text-[10px] leading-relaxed text-slate-650">{builderData.summary}</p>
          </div>
          <div>
            <h4 className="text-[9px] font-black text-slate-800 uppercase tracking-wider mb-2 border-b pb-0.5">Experience</h4>
            {builderData.experiences.map((exp, i) => (
              <div key={i} className="mb-2">
                <span className="font-bold text-[10px] block">{exp.jobTitle} — {exp.company}</span>
                <span className="text-[8.5px] text-slate-450 block">{exp.duration}</span>
                <p className="text-[9.5px] text-slate-600 mt-1">{exp.description}</p>
              </div>
            ))}
          </div>
          <div>
            <h4 className="text-[9px] font-black text-slate-800 uppercase tracking-wider mb-2 border-b pb-0.5">Projects</h4>
            {builderData.projects.map((proj, i) => (
              <div key={i} className="mb-2">
                <span className="font-bold text-[10px] block">{proj.title}</span>
                <p className="text-[9.5px] text-slate-650 mt-0.5">{proj.description}</p>
              </div>
            ))}
          </div>

          <div>
            <h4 className="text-[9px] font-black text-slate-800 uppercase tracking-wider mb-2 border-b pb-0.5">Education</h4>
            {builderData.educations && builderData.educations.map((edu, i) => (
              <div key={i} className="mb-2">
                <span className="font-bold text-[10px] block">{edu.degree} — {edu.school}</span>
                <span className="text-[8.5px] text-slate-450 block">{edu.year}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Google Doc Viewer wrapper to embed Cloudinary PDFs cleanly
  const getEmbeddablePdfUrl = (url) => {
    if (!url) return '';
    return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
  };

  return (
    <div className="flex flex-col gap-8 text-left">
      
      {/* Title */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-title">
            Career Hub Suite
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Access resume optimizer tools, cover letter generators, builder wizards, and interview preparation questions.
          </p>
        </div>
        <button
          onClick={toggleMaximize}
          className="px-4.5 py-2.5 bg-[#121217] hover:bg-[#1a1a24] text-slate-300 hover:text-white border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md"
        >
          {isMaximized ? (
            <>
              <FaCompress size={12} className="text-purple-400" /> Minimize View
            </>
          ) : (
            <>
              <FaExpand size={12} className="text-purple-400" /> Expand View
            </>
          )}
        </button>
      </div>

      {/* Horizontal Tabs Navigation */}
      <div className="flex gap-2 border-b border-white/5 pb-2 overflow-x-auto">
        {[
          { id: 'atsChecker', label: 'ATS Checker' },
          { id: 'coverLetter', label: 'Cover Letter Maker' },
          { id: 'builder', label: 'AI Resume Builder & Templates' },
          { id: 'interviewPrep', label: 'Interview Prep QA' },
          { id: 'toolkit', label: 'Career Toolkit' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl shrink-0 transition-colors ${
              activeSubTab === tab.id
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-[#1a1a24] hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sub Tabs Container */}
      <div className="min-h-[480px]">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: ATS Checker Workspace */}
          {activeSubTab === 'atsChecker' && (
            <motion.div
              key="atsChecker"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-8"
            >
              {/* Notifications */}
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

              {!activeReport ? (
                /* Empty Upload Form */
                <div className="bg-[#121217] border border-white/5 p-8 rounded-3xl text-center flex flex-col items-center max-w-xl mx-auto w-full gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <FaUpload size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Upload Resume for compatibility scan</h3>
                    <p className="text-slate-400 text-xs mt-1">PDF, DOC, or DOCX formats accepted. Max size 10MB.</p>
                  </div>

                  <form onSubmit={handleUploadSubmit} className="w-full flex flex-col gap-4">
                    <input
                      type="file"
                      id="ats-upload-file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="ats-upload-file"
                      className="w-full border-2 border-dashed border-white/10 hover:border-purple-500/40 bg-[#171720] rounded-2xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <span className="text-xs font-black text-slate-350">Select Resume File</span>
                      {file && <span className="text-[10px] text-purple-400 font-bold">{file.name}</span>}
                    </label>

                    <button
                      type="submit"
                      disabled={uploading || !file}
                      className={`py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl text-xs font-black transition-all ${
                        uploading || !file ? 'opacity-50' : 'hover:scale-[0.99]'
                      }`}
                    >
                      {uploading ? <FaSpinner className="animate-spin inline mr-1" /> : null} Analyze Resume
                    </button>
                  </form>
                </div>
              ) : (
                /* Split Preview Workspace layout */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Side: Interactive Document View & History */}
                  <div className="lg:col-span-6 flex flex-col gap-6">
                    <div className="bg-[#121217] border border-white/5 p-3 rounded-[24px] aspect-[1/1.41] shadow-xl relative overflow-hidden bg-slate-900/20">
                      {/* Using embeddable google viewer to fix the empty display issues */}
                      <iframe
                        src={getEmbeddablePdfUrl(activeReport.fileUrl)}
                        className="w-full h-full rounded-2xl border-0"
                        title="Resume previewer window"
                      />
                    </div>

                    {/* Versions History log */}
                    <div className="bg-[#121217] border border-white/5 p-5 rounded-[24px]">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider mb-3">Previous CV Audits</h4>
                      {loadingHistory ? (
                        <FaSpinner className="animate-spin text-purple-500" />
                      ) : (
                        <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
                          {history.map((h) => (
                            <div
                              key={h._id}
                              onClick={() => setActiveReport(h)}
                              className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                                activeReport._id === h._id
                                  ? 'bg-purple-600/10 border-purple-500/20'
                                  : 'bg-white/5 border-white/5 hover:bg-white/10'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <FaFilePdf className="text-red-400" size={12} />
                                <div className="text-left">
                                  <span className="text-[11px] font-black text-white block truncate max-w-[120px]">{h.fileName}</span>
                                  <span className="text-[9px] text-slate-500 block mt-0.5">{new Date(h.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-black ${getScoreColor(h.atsScore)}`}>{h.atsScore}%</span>
                                <button
                                  onClick={(e) => handleDeleteHistory(h._id, e)}
                                  className="p-1 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded"
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

                  {/* Right Side: Score indicator progress bars & improvements */}
                  <div className="lg:col-span-6 flex flex-col gap-6">
                    
                    {/* Score Card */}
                    <div className="bg-[#121217] border border-white/5 p-6 rounded-[24px] flex justify-between items-center bg-[#15151c]">
                      <div>
                        <h4 className="text-sm font-black text-white">ATS Scanned Score</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Compatible with recruiter parsing checkpoints.</p>
                        <div className="flex gap-2 mt-4">
                          <a
                            href={activeReport.fileUrl}
                            download
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[10px] font-black shadow-md flex items-center gap-1 transition-colors"
                          >
                            <FaDownload size={10} /> Download PDF
                          </a>
                          <button
                            onClick={() => setActiveReport(null)}
                            className="px-4 py-2 bg-[#1d1d26] hover:bg-[#282835] text-slate-300 rounded-xl text-[10px] font-black border border-white/5 transition-colors flex items-center gap-1"
                          >
                            <FaRedo size={9} /> Re-Upload
                          </button>
                        </div>
                      </div>

                      <div className="w-16 h-16 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center">
                        <span className={`text-lg font-black ${getScoreColor(atsScore)}`}>{atsScore}%</span>
                      </div>
                    </div>

                    {/* Progress bars matching */}
                    <div className="bg-[#121217] border border-white/5 p-6 rounded-[24px] flex flex-col gap-4">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">Scoring Breakdown</h4>
                      <div className="flex flex-col gap-3">
                        {[
                          { label: 'Layout & Formatting', val: activeReport.atsBreakdown?.formatting?.score || 95 },
                          { label: 'Keywords Scanning', val: activeReport.atsBreakdown?.keyword?.score || activeReport.atsBreakdown?.keywords?.score || 90 },
                          { label: 'Grammar Compliance', val: activeReport.atsBreakdown?.grammar?.score || 94 },
                          { label: 'Readability Level', val: activeReport.atsBreakdown?.readability?.score || 92 }
                        ].map((bar, idx) => (
                          <div key={idx} className="flex flex-col gap-1">
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                              <span>{bar.label}</span>
                              <span>{bar.val}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${bar.val}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section Suggestions List */}
                    {activeReport.aiSuggestions && activeReport.aiSuggestions.length > 0 && (
                      <div className="flex flex-col gap-3">
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">AI Recommendations</h4>
                        
                        <div className="flex flex-col gap-4">
                          {activeReport.aiSuggestions.map((item, idx) => (
                            <div key={idx} className="bg-[#121217] border border-white/5 p-5 rounded-2xl flex flex-col gap-2">
                              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <span className="px-2 py-0.5 bg-purple-600/20 text-purple-400 rounded text-[9px] font-black uppercase">{item.section}</span>
                                <span className="text-[10px] text-green-400 font-bold">Expected Fit +{item.atsIncrease}%</span>
                              </div>
                              <div className="text-[11px] mt-1 text-slate-350 leading-relaxed">
                                <span className="font-bold text-red-400 block mb-0.5">Problem:</span>
                                <p className="mb-2">"{item.currentText}"</p>
                                <span className="font-bold text-green-400 block mb-0.5">AI Suggestion:</span>
                                <p className="text-white">"{item.improvedText}"</p>
                                <span className="font-bold text-slate-400 block mt-2 mb-0.5">Explanation:</span>
                                <p className="italic text-[10px] text-slate-400">{item.explanation}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: Cover Letter Maker */}
          {activeSubTab === 'coverLetter' && (
            <motion.div
              key="coverLetter"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left"
            >
              <div className="lg:col-span-5 bg-[#121217] border border-white/5 p-6 rounded-3xl shadow-xl flex flex-col gap-4">
                <h3 className="text-sm font-black text-white">Cover Letter Builder</h3>
                <p className="text-[11px] text-slate-400 mt-1">Generates customized cover letters using Gemini AI and your target job specs.</p>

                <form onSubmit={handleGenerateCoverLetter} className="flex flex-col gap-4 text-xs mt-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-slate-350">Target Job Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Junior MERN Developer"
                      value={clJobTitle}
                      onChange={(e) => setClJobTitle(e.target.value)}
                      className="px-4 py-2.5 bg-[#1e1e24] border border-white/5 rounded-xl text-white focus:outline-none"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-slate-350">Company Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Google DeepMind"
                      value={clCompany}
                      onChange={(e) => setClCompany(e.target.value)}
                      className="px-4 py-2.5 bg-[#1e1e24] border border-white/5 rounded-xl text-white focus:outline-none"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-slate-350">Key Details / Job description description</label>
                    <textarea
                      placeholder="Paste details or requirements you want highlighted..."
                      value={clDetails}
                      onChange={(e) => setClDetails(e.target.value)}
                      rows={4}
                      className="px-4 py-2.5 bg-[#1e1e24] border border-white/5 rounded-xl text-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={generatingCl || !clJobTitle || !clCompany}
                    className="py-3 bg-purple-650 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {generatingCl ? <FaSpinner className="animate-spin" /> : <FaPaperPlane size={11} />} Generate Cover Letter
                  </button>
                </form>
              </div>

              <div className="lg:col-span-7 bg-[#121217] border border-white/5 p-6 rounded-3xl shadow-xl flex flex-col gap-3 min-h-[400px]">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Output Preview</span>
                {generatingCl ? (
                  <div className="flex-1 flex items-center justify-center">
                    <FaSpinner className="animate-spin text-purple-500" size={24} />
                  </div>
                ) : clOutput ? (
                  <div className="flex-1 p-4 bg-[#1e1e24]/40 border border-white/5 rounded-2xl overflow-y-auto max-h-[380px]">
                    <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed text-left">{clOutput}</pre>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-550 border border-dashed border-white/5 rounded-2xl p-8 text-center gap-2">
                    <FaFolderOpen size={20} />
                    <span className="text-xs">Your generated cover letter will be displayed here.</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 3: AI Resume Builder & Templates (Interactive editor with Live PDF print) */}
          {activeSubTab === 'builder' && (
            <motion.div
              key="builder"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left"
            >
              {/* Left Side: Rich Form Editor */}
              <div className={`${isMaximized ? 'lg:col-span-6' : 'lg:col-span-5'} bg-[#121217] border border-white/5 p-6 rounded-3xl shadow-xl flex flex-col gap-4`}>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h3 className="text-sm font-black text-white">Resume Creator</h3>
                  
                  {/* Select Templates list inside builder */}
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="px-2 py-1 bg-[#1e1e24] border border-white/10 rounded text-[10px] text-purple-400 font-black focus:outline-none"
                  >
                    <option value="ENG-MIN">Minimalist Template</option>
                    <option value="STA-MOD">Modern Startup Template</option>
                    <option value="EXEC-DEV">Executive Template</option>
                  </select>
                </div>

                <form onSubmit={(e) => e.preventDefault()} className={`flex flex-col gap-4 text-xs ${isMaximized ? 'max-h-[750px]' : 'max-h-[460px]'} overflow-y-auto pr-1`}>
                  
                  {/* Contact Fields */}
                  <div className="flex flex-col gap-2 bg-[#1a1a24]/30 p-3 rounded-xl border border-white/5">
                    <span className="text-[9px] font-black text-slate-500 uppercase">Contact details</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={builderData.name}
                        onChange={(e) => setBuilderData({ ...builderData, name: e.target.value })}
                        className="px-3 py-1.5 bg-[#1e1e24] border border-white/5 rounded-lg text-white"
                      />
                      <input
                        type="text"
                        placeholder="Job Title"
                        value={builderData.title}
                        onChange={(e) => setBuilderData({ ...builderData, title: e.target.value })}
                        className="px-3 py-1.5 bg-[#1e1e24] border border-white/5 rounded-lg text-white"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="email"
                        placeholder="Email"
                        value={builderData.email}
                        onChange={(e) => setBuilderData({ ...builderData, email: e.target.value })}
                        className="px-3.5 py-1.5 bg-[#1e1e24] border border-white/5 rounded-lg text-white text-[10px]"
                      />
                      <input
                        type="text"
                        placeholder="Phone"
                        value={builderData.phone}
                        onChange={(e) => setBuilderData({ ...builderData, phone: e.target.value })}
                        className="px-3.5 py-1.5 bg-[#1e1e24] border border-white/5 rounded-lg text-white text-[10px]"
                      />
                      <input
                        type="text"
                        placeholder="Location"
                        value={builderData.location}
                        onChange={(e) => setBuilderData({ ...builderData, location: e.target.value })}
                        className="px-3.5 py-1.5 bg-[#1e1e24] border border-white/5 rounded-lg text-white text-[10px]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="GitHub Profile"
                        value={builderData.github}
                        onChange={(e) => setBuilderData({ ...builderData, github: e.target.value })}
                        className="px-3.5 py-1.5 bg-[#1e1e24] border border-white/5 rounded-lg text-white text-[10px]"
                      />
                      <input
                        type="text"
                        placeholder="LinkedIn Profile"
                        value={builderData.linkedin}
                        onChange={(e) => setBuilderData({ ...builderData, linkedin: e.target.value })}
                        className="px-3.5 py-1.5 bg-[#1e1e24] border border-white/5 rounded-lg text-white text-[10px]"
                      />
                    </div>
                  </div>

                  {/* Summary & Skills */}
                  <div className="flex flex-col gap-2 bg-[#1a1a24]/30 p-3 rounded-xl border border-white/5">
                    <span className="text-[9px] font-black text-slate-500 uppercase">Profile summary & Skills</span>
                    <textarea
                      placeholder="Professional Summary"
                      value={builderData.summary}
                      onChange={(e) => setBuilderData({ ...builderData, summary: e.target.value })}
                      rows={2}
                      className="px-3 py-1.5 bg-[#1e1e24] border border-white/5 rounded-lg text-white"
                    />
                    <input
                      type="text"
                      placeholder="Skills (comma separated, e.g. React, Node.js)"
                      value={builderData.skills}
                      onChange={(e) => setBuilderData({ ...builderData, skills: e.target.value })}
                      className="px-3 py-1.5 bg-[#1e1e24] border border-white/5 rounded-lg text-white"
                    />
                  </div>

                  {/* Work Experience */}
                  <div className="flex flex-col gap-2 bg-[#1a1a24]/30 p-3 rounded-xl border border-white/5">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-slate-500 uppercase">Work Experience</span>
                      <button
                        type="button"
                        onClick={handleAddExperience}
                        className="text-[9px] font-black text-purple-400 flex items-center gap-1 hover:underline"
                      >
                        <FaPlus size={8} /> Add
                      </button>
                    </div>

                    {builderData.experiences.map((exp, idx) => (
                      <div key={idx} className="border-t border-white/5 pt-2 flex flex-col gap-2 relative">
                        <button
                          type="button"
                          onClick={() => handleRemoveExperience(idx)}
                          className="absolute right-0 top-1 text-red-500 hover:underline text-[9px]"
                        >
                          Delete
                        </button>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <input
                            type="text"
                            placeholder="Job Title"
                            value={exp.jobTitle}
                            onChange={(e) => {
                              const list = [...builderData.experiences];
                              list[idx].jobTitle = e.target.value;
                              setBuilderData({ ...builderData, experiences: list });
                            }}
                            className="px-3 py-1 bg-[#1e1e24] border border-white/5 rounded text-white"
                          />
                          <input
                            type="text"
                            placeholder="Company"
                            value={exp.company}
                            onChange={(e) => {
                              const list = [...builderData.experiences];
                              list[idx].company = e.target.value;
                              setBuilderData({ ...builderData, experiences: list });
                            }}
                            className="px-3 py-1 bg-[#1e1e24] border border-white/5 rounded text-white"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Duration (e.g. 2024 - Present)"
                          value={exp.duration}
                          onChange={(e) => {
                            const list = [...builderData.experiences];
                            list[idx].duration = e.target.value;
                            setBuilderData({ ...builderData, experiences: list });
                          }}
                          className="px-3 py-1 bg-[#1e1e24] border border-white/5 rounded text-white"
                        />
                        <textarea
                          placeholder="Responsibilities & Accomplishments"
                          value={exp.description}
                          onChange={(e) => {
                            const list = [...builderData.experiences];
                            list[idx].description = e.target.value;
                            setBuilderData({ ...builderData, experiences: list });
                          }}
                          rows={2}
                          className="px-3 py-1 bg-[#1e1e24] border border-white/5 rounded text-white"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Education */}
                  <div className="flex flex-col gap-2 bg-[#1a1a24]/30 p-3 rounded-xl border border-white/5">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-slate-500 uppercase">Education</span>
                      <button
                        type="button"
                        onClick={handleAddEducation}
                        className="text-[9px] font-black text-purple-400 flex items-center gap-1 hover:underline"
                      >
                        <FaPlus size={8} /> Add
                      </button>
                    </div>

                    {builderData.educations.map((edu, idx) => (
                      <div key={idx} className="border-t border-white/5 pt-2 flex flex-col gap-2 relative">
                        <button
                          type="button"
                          onClick={() => handleRemoveEducation(idx)}
                          className="absolute right-0 top-1 text-red-500 hover:underline text-[9px]"
                        >
                          Delete
                        </button>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <input
                            type="text"
                            placeholder="Degree / Certificate"
                            value={edu.degree}
                            onChange={(e) => {
                              const list = [...builderData.educations];
                              list[idx].degree = e.target.value;
                              setBuilderData({ ...builderData, educations: list });
                            }}
                            className="px-3 py-1 bg-[#1e1e24] border border-white/5 rounded text-white"
                          />
                          <input
                            type="text"
                            placeholder="School / University"
                            value={edu.school}
                            onChange={(e) => {
                              const list = [...builderData.educations];
                              list[idx].school = e.target.value;
                              setBuilderData({ ...builderData, educations: list });
                            }}
                            className="px-3 py-1 bg-[#1e1e24] border border-white/5 rounded text-white"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Year (e.g. 2023 - 2026)"
                          value={edu.year}
                          onChange={(e) => {
                            const list = [...builderData.educations];
                            list[idx].year = e.target.value;
                            setBuilderData({ ...builderData, educations: list });
                          }}
                          className="px-3 py-1 bg-[#1e1e24] border border-white/5 rounded text-white"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Projects */}
                  <div className="flex flex-col gap-2 bg-[#1a1a24]/30 p-3 rounded-xl border border-white/5">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-slate-500 uppercase">Projects</span>
                      <button
                        type="button"
                        onClick={handleAddProject}
                        className="text-[9px] font-black text-purple-400 flex items-center gap-1 hover:underline"
                      >
                        <FaPlus size={8} /> Add
                      </button>
                    </div>

                    {builderData.projects.map((proj, idx) => (
                      <div key={idx} className="border-t border-white/5 pt-2 flex flex-col gap-2 relative">
                        <button
                          type="button"
                          onClick={() => handleRemoveProject(idx)}
                          className="absolute right-0 top-1 text-red-500 hover:underline text-[9px]"
                        >
                          Delete
                        </button>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <input
                            type="text"
                            placeholder="Project Title"
                            value={proj.title}
                            onChange={(e) => {
                              const list = [...builderData.projects];
                              list[idx].title = e.target.value;
                              setBuilderData({ ...builderData, projects: list });
                            }}
                            className="px-3 py-1 bg-[#1e1e24] border border-white/5 rounded text-white"
                          />
                          <input
                            type="text"
                            placeholder="Technologies Used"
                            value={proj.techUsed}
                            onChange={(e) => {
                              const list = [...builderData.projects];
                              list[idx].techUsed = e.target.value;
                              setBuilderData({ ...builderData, projects: list });
                            }}
                            className="px-3 py-1 bg-[#1e1e24] border border-white/5 rounded text-white"
                          />
                        </div>
                        <textarea
                          placeholder="Project Description"
                          value={proj.description}
                          onChange={(e) => {
                            const list = [...builderData.projects];
                            list[idx].description = e.target.value;
                            setBuilderData({ ...builderData, projects: list });
                          }}
                          rows={2}
                          className="px-3 py-1 bg-[#1e1e24] border border-white/5 rounded text-white"
                        />
                      </div>
                    ))}
                  </div>

                </form>
              </div>

              {/* Right Side: Live styled preview panel */}
              <div className={`${isMaximized ? 'lg:col-span-6' : 'lg:col-span-7'} bg-[#121217] border border-white/5 p-6 rounded-3xl shadow-xl flex flex-col gap-4 ${isMaximized ? 'min-h-[750px]' : 'min-h-[460px]'}`}>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Live styled Preview</span>
                  
                  {/* Actions buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={downloadTextResume}
                      className="px-3 py-1.5 bg-[#1e1e24] hover:bg-[#252532] text-slate-300 border border-white/10 rounded-xl text-[10px] font-black flex items-center gap-1"
                    >
                      <FaSave /> Download Text
                    </button>
                    <button
                      onClick={printResumePdf}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-750 text-white rounded-xl text-[10px] font-black flex items-center gap-1 shadow-md"
                    >
                      <FaPrint /> Print / Save PDF
                    </button>
                  </div>
                </div>

                {/* Styled preview node */}
                <div ref={previewRef} className={`flex-1 overflow-y-auto ${isMaximized ? 'max-h-[700px]' : 'max-h-[420px]'} rounded-xl border border-white/5`}>
                  {renderTemplatePreview()}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: Interview Prep QA */}
          {activeSubTab === 'interviewPrep' && (
            <motion.div
              key="interviewPrep"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6 text-left"
            >
              <div className="bg-[#121217] border border-white/5 p-6 rounded-3xl shadow-xl">
                <h3 className="text-sm font-black text-white mb-2">Technical & HR Interview Questions</h3>
                <p className="text-slate-400 text-xs mb-6">Prepare for front-end, back-end, and executive rounds with curated answers.</p>

                <div className="flex flex-col gap-4">
                  {[
                    { q: 'How do you handle asynchronous actions in Node.js?', a: 'Asynchronous flows are managed using Async/Await, Promises, or traditional Callbacks. Async/await provides synchronous readability while maintaining background concurrency loops.' },
                    { q: 'What is the difference between SQL and NoSQL databases?', a: 'SQL databases (like PostgreSQL) use schema-based relational tables, suited for transaction consistency. NoSQL databases (like MongoDB) are schema-less document grids, suited for scaling unstructured feeds.' },
                    { q: 'Can you describe a challenging project conflict you resolved?', a: 'Conflict resolution is managed by aligning architectural trade-offs, performing benchmark tests to back decisions, and conducting pair-programming reviews.' },
                    { q: 'Explain JWT authentication and how tokens are stored securely.', a: 'JWT is stateless authentication. Access tokens should be stored in temporary memory (state), while refresh tokens are stored in HttpOnly, Secure, SameSite cookies to mitigate XSS.' }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-[#1e1e24]/40 border border-white/5 rounded-2xl p-4">
                      <button
                        onClick={() => toggleAnswer(idx)}
                        className="w-full flex justify-between items-center text-xs font-black text-white hover:text-purple-400 transition-colors"
                      >
                        <span>Q: {item.q}</span>
                        <FaChevronRight size={10} className={`transform transition-transform ${showAnswer[idx] ? 'rotate-90 text-purple-400' : ''}`} />
                      </button>
                      
                      {showAnswer[idx] && (
                        <p className="text-[11px] text-slate-400 mt-2.5 pl-4 border-l border-purple-500/20 leading-relaxed">
                          {item.a}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: Career Toolkit (Analytics / Skill Gap) */}
          {activeSubTab === 'toolkit' && (
            <motion.div
              key="toolkit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left"
            >
              {/* Job Readiness Score */}
              <div className="lg:col-span-6 bg-[#121217] border border-white/5 p-6 rounded-3xl shadow-xl flex flex-col gap-4">
                <h3 className="text-sm font-black text-white">Job Readiness Indicator</h3>
                <p className="text-[11px] text-slate-400">Assessed by parsing structural metrics, technical tags, and CV formatting criteria.</p>

                <div className="flex items-center gap-4 py-4 bg-[#1e1e24]/30 rounded-2xl px-5 border border-white/5">
                  <div className="w-14 h-14 rounded-2xl bg-purple-600/10 border border-purple-500/25 flex items-center justify-center font-black text-lg text-purple-400">
                    {activeReport ? activeReport.atsScore : 0}%
                  </div>
                  <div>
                    <span className="text-xs font-black text-white block">Developer Readiness Level</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {atsScore >= 80 ? 'Highly Market Ready' : atsScore >= 60 ? 'Moderate alignment' : 'Formatting adjustment recommended'}
                    </span>
                  </div>
                </div>

                {/* Skill gap list */}
                <div className="mt-2">
                  <span className="text-xs font-black text-white block mb-2">Skill Gap Analysis</span>
                  <p className="text-[11px] text-slate-400 mb-3">Add these hot recruiter keywords to match technical filters:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {activeReport?.keywords?.missing 
                      ? activeReport.keywords.missing.slice(0, 6).map((s, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-amber-500/10 border border-amber-550/20 text-amber-400 rounded-md text-[10px] font-bold">
                            + {s}
                          </span>
                        )) 
                      : <span className="text-xs text-slate-500 italic">Upload a CV to run alignment checks.</span>}
                  </div>
                </div>
              </div>

              {/* Career Tips */}
              <div className="lg:col-span-6 bg-[#121217] border border-white/5 p-6 rounded-3xl shadow-xl flex flex-col gap-4">
                <h3 className="text-sm font-black text-white">Career Growth Tips</h3>
                <p className="text-[11px] text-slate-400">Pro tips to structure developer profiles and clear technical loops.</p>

                <div className="flex flex-col gap-3">
                  {[
                    { title: 'Use Action Verbs', body: 'Replace passive descriptions with action verbs like "Architected", "Optimized", "Refactored".' },
                    { title: 'Quantify Metrics', body: 'Incorporate counts and percentages (e.g. "Reduced load latency by 30% using Redis caches").' },
                    { title: 'Portfolio Projects', body: 'List live deployment URLs and Github handles for projects to show practical application.' }
                  ].map((tip, idx) => (
                    <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-xl">
                      <span className="text-xs font-black text-purple-400 block mb-0.5">{tip.title}</span>
                      <p className="text-[10px] text-slate-450 leading-relaxed">{tip.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
};

export default CareerHub;
