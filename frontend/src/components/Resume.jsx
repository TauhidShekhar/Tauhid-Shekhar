import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { 
  FaFilePdf, FaDownload, FaEye, FaExternalLinkAlt, FaExpand, FaTimes, 
  FaCheckCircle, FaCheck, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, 
  FaLinkedin, FaGithub, FaGlobe, FaSpinner, FaRedo, FaUpload, 
  FaExclamationTriangle, FaFileAlt, FaCheckDouble
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
  const [loading, setLoading] = useState(!resumeData);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeView, setActiveView] = useState('pdf'); // 'pdf' | 'ats'
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const viewerContainerRef = useRef(null);

  const resumePdfUrl = getAbsolutePdfUrl(activeResume?.fileUrl || settings?.resumeUrl || '');

  const fetchActiveResume = async () => {
    setLoading(true);
    try {
      const [resumeRes, settingsRes] = await Promise.all([
        api.getActiveResume().catch(() => null),
        api.getSettings().catch(() => null)
      ]);
      if (resumeRes && resumeRes.success && resumeRes.data) {
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
    if (!resumeData) {
      fetchActiveResume();
    }
  }, [resumeData]);

  // Keyboard escape listener to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showFullPreview) {
        setShowFullPreview(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showFullPreview]);

  // Admin Actions
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

  // Standard direct download of the actual original PDF
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

  const handleOpenPdf = (e) => {
    // Allows default anchor behavior to open in new tab
  };

  const handleScrollToViewer = (e) => {
    if (e) e.preventDefault();
    setActiveView('pdf');
    if (viewerContainerRef.current) {
      viewerContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Structured resume data
  const parsed = activeResume?.parsedData || {};
  const resumeInfo = {
    name: parsed.name || 'TAUHID SHEKHAR',
    title: 'Full-Stack MERN Developer',
    email: parsed.email || 'shekhartauhid@gmail.com',
    phone: parsed.phone || '+91 9142725562',
    address: parsed.address || 'Noida / Gurugram, India',
    linkedin: parsed.linkedin || 'https://www.linkedin.com/in/TauhidShekhar',
    github: parsed.github || 'https://github.com/TauhidShekhar',
    portfolio: parsed.portfolio || 'https://tauhidshekhar.vercel.app',
    summary: parsed.summary || 'Results-driven Full-Stack MERN Developer passionate about building robust, scalable web applications with seamless user experiences. Experienced in developing responsive frontends with React and designing high-performance REST APIs with Node.js and Express. Proficient in database modeling with MongoDB and MySQL.',
    skills: {
      frontend: ['React.js', 'Tailwind CSS', 'JavaScript (ES6+)', 'HTML5', 'CSS3', 'Vite', 'Framer Motion'],
      backend: ['Node.js', 'Express.js', 'RESTful APIs', 'JWT Authentication', 'WebSockets'],
      database: ['MongoDB', 'Mongoose ODM', 'MySQL'],
      tools: ['Git', 'GitHub', 'Postman', 'Java', 'Python', 'Linux']
    },
    experience: parsed.experience && parsed.experience.length > 0 ? parsed.experience : [
      {
        jobTitle: 'Full-Stack MERN Developer',
        company: 'Self-Employed / Freelance Projects',
        duration: '2024 - Present',
        description: 'Engineered full-stack applications with React, Node.js, Express, and MongoDB, integrating secure JWT auth, role-based access control, and payment workflows.'
      }
    ],
    education: parsed.education && parsed.education.length > 0 ? parsed.education : [
      {
        degree: 'Bachelor of Computer Applications (BCA)',
        school: 'Global Group of Institutes, Amritsar',
        year: '2023 - 2026',
        cgpa: '8.0/10'
      }
    ],
    projects: parsed.projects && parsed.projects.length > 0 ? parsed.projects : [
      {
        title: 'Course sellingPlatform (MERN Stack LMS)',
        techUsed: 'React.js, Node.js, Express.js, MongoDB, JWT',
        description: 'Full-stack course marketplace with secure user authentication, instructor dashboard, role-based access, and optimized MongoDB schema modeling.'
      },
      {
        title: 'Developer Portfolio & Forms Hub',
        techUsed: 'React.js, Tailwind CSS, Framer Motion, Express, MongoDB',
        description: 'High-performance interactive portfolio featuring live ATS resume inspection, dynamic forms inquiry center, and community portal.'
      },
      {
        title: 'Gym Fitness Website',
        techUsed: 'React.js, Vite, Tailwind CSS',
        description: 'Modern responsive fitness platform featuring workout catalogs, interactive BMI calculator, and dynamic membership plans.'
      },
      {
        title: 'Food Delivery Website',
        techUsed: 'React.js, Tailwind CSS, REST APIs',
        description: 'Food ordering platform with real-time cart state management, checkout flows, and responsive UI components.'
      }
    ]
  };

  const atsScore = activeResume?.atsScore || 98;

  // The ATS-standard document preview layout
  const renderAtsDocument = (isModal = false) => (
    <div className={`text-left font-sans text-[#171717] dark:text-[#E5E7EB] ${isModal ? 'p-6 sm:p-10 max-w-3xl mx-auto' : 'p-6 sm:p-8'}`}>
      {/* 1. Header & Contact Details */}
      <header className="border-b-2 border-slate-200 dark:border-white/10 pb-5 mb-6 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-black font-title uppercase tracking-tight text-[#171717] dark:text-white">
          {resumeInfo.name}
        </h1>
        <p className="text-sm sm:text-base font-bold text-[#C2272D] tracking-wide mt-1">
          {resumeInfo.title}
        </p>

        <div className="mt-3.5 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-[13px] text-[#525252] dark:text-[#A3A3A3] justify-center sm:justify-start">
          <a href={`mailto:${resumeInfo.email}`} className="flex items-center gap-1.5 hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors">
            <FaEnvelope className="text-[#C2272D] shrink-0" size={12} />
            <span>{resumeInfo.email}</span>
          </a>
          <span className="opacity-30 hidden sm:inline">•</span>
          <a href={`tel:${resumeInfo.phone.replace(/\s+/g, '')}`} className="flex items-center gap-1.5 hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors">
            <FaPhoneAlt className="text-[#C2272D] shrink-0" size={11} />
            <span>{resumeInfo.phone}</span>
          </a>
          <span className="opacity-30 hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5">
            <FaMapMarkerAlt className="text-[#C2272D] shrink-0" size={12} />
            <span>{resumeInfo.address}</span>
          </span>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs sm:text-[13px] text-[#525252] dark:text-[#A3A3A3] justify-center sm:justify-start font-medium">
          <a href={resumeInfo.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#00FFFF] transition-colors">
            <FaLinkedin className="text-[#0077B5] shrink-0" size={13} />
            <span>linkedin.com/in/TauhidShekhar</span>
          </a>
          <span className="opacity-30 hidden sm:inline">•</span>
          <a href={resumeInfo.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#00FFFF] transition-colors">
            <FaGithub className="text-black dark:text-white shrink-0" size={13} />
            <span>github.com/TauhidShekhar</span>
          </a>
          <span className="opacity-30 hidden sm:inline">•</span>
          <a href={resumeInfo.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#00FFFF] transition-colors">
            <FaGlobe className="text-[#00FFFF] shrink-0" size={12} />
            <span>Portfolio</span>
          </a>
        </div>
      </header>

      {/* 2. Professional Summary */}
      <section className="mb-6">
        <h2 className="text-xs sm:text-[13px] font-black uppercase tracking-wider text-[#C2272D] border-b border-slate-200 dark:border-white/10 pb-1 mb-2.5">
          Professional Summary
        </h2>
        <p className="text-xs sm:text-[13.5px] leading-relaxed text-[#404040] dark:text-[#D4D4D4]">
          {resumeInfo.summary}
        </p>
      </section>

      {/* 3. Technical Skills */}
      <section className="mb-6">
        <h2 className="text-xs sm:text-[13px] font-black uppercase tracking-wider text-[#C2272D] border-b border-slate-200 dark:border-white/10 pb-1 mb-2.5">
          Technical Skills
        </h2>
        <div className="space-y-1.5 text-xs sm:text-[13.5px]">
          <div>
            <span className="font-bold text-[#171717] dark:text-white">Frontend: </span>
            <span className="text-[#525252] dark:text-[#D4D4D4]">{resumeInfo.skills.frontend.join(', ')}</span>
          </div>
          <div>
            <span className="font-bold text-[#171717] dark:text-white">Backend & APIs: </span>
            <span className="text-[#525252] dark:text-[#D4D4D4]">{resumeInfo.skills.backend.join(', ')}</span>
          </div>
          <div>
            <span className="font-bold text-[#171717] dark:text-white">Databases: </span>
            <span className="text-[#525252] dark:text-[#D4D4D4]">{resumeInfo.skills.database.join(', ')}</span>
          </div>
          <div>
            <span className="font-bold text-[#171717] dark:text-white">Tools & Languages: </span>
            <span className="text-[#525252] dark:text-[#D4D4D4]">{resumeInfo.skills.tools.join(', ')}</span>
          </div>
        </div>
      </section>

      {/* 4. Work Experience */}
      <section className="mb-6">
        <h2 className="text-xs sm:text-[13px] font-black uppercase tracking-wider text-[#C2272D] border-b border-slate-200 dark:border-white/10 pb-1 mb-3">
          Work Experience
        </h2>
        <div className="space-y-4">
          {resumeInfo.experience.map((exp, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-0.5 sm:gap-2">
                <div className="font-bold text-xs sm:text-[14px] text-[#171717] dark:text-white">
                  {exp.jobTitle} <span className="text-slate-400 font-normal">|</span> <span className="text-[#C2272D] font-semibold">{exp.company}</span>
                </div>
                <div className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                  {exp.duration}
                </div>
              </div>
              <ul className="list-disc list-outside ml-4 text-xs sm:text-[13px] text-[#404040] dark:text-[#D4D4D4] space-y-1 leading-relaxed">
                <li>{exp.description}</li>
                <li>Architected full-stack features using React, Node.js, Express, and MongoDB with secure token-based authentication.</li>
                <li>Designed responsive UI views adhering to clean code standards and mobile-first principles.</li>
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Education */}
      <section className="mb-6">
        <h2 className="text-xs sm:text-[13px] font-black uppercase tracking-wider text-[#C2272D] border-b border-slate-200 dark:border-white/10 pb-1 mb-2.5">
          Education
        </h2>
        <div className="space-y-2">
          {resumeInfo.education.map((edu, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-0.5 sm:gap-2">
              <div>
                <span className="font-bold text-xs sm:text-[14px] text-[#171717] dark:text-white">{edu.degree}</span>
                <span className="text-xs sm:text-[13px] text-[#525252] dark:text-[#D4D4D4] block sm:inline sm:ml-2">
                  — {edu.school}
                </span>
              </div>
              <div className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                {edu.year} {edu.cgpa ? `• CGPA: ${edu.cgpa}` : ''}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Relevant Projects */}
      <section>
        <h2 className="text-xs sm:text-[13px] font-black uppercase tracking-wider text-[#C2272D] border-b border-slate-200 dark:border-white/10 pb-1 mb-3">
          Relevant Projects
        </h2>
        <div className="space-y-3.5">
          {resumeInfo.projects.map((proj, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-0.5 sm:gap-2">
                <span className="font-bold text-xs sm:text-[13.5px] text-[#171717] dark:text-white">
                  {proj.title}
                </span>
                {proj.techUsed && (
                  <span className="text-[11px] sm:text-xs font-semibold text-[#C2272D] dark:text-[#00FFFF] shrink-0">
                    [{proj.techUsed}]
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-[13px] text-[#404040] dark:text-[#D4D4D4] leading-relaxed">
                {proj.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  return (
    <section id="resume" className="scroll-mt-24 py-20 lg:py-24 bg-[#F8FAFC]/60 dark:bg-transparent relative text-left">
      <div className="max-w-[1360px] mx-auto px-4 xs:px-6 sm:px-8 lg:px-10">
        
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#C2272D]/10 text-[#C2272D] border border-[#C2272D]/20 mb-3.5 shadow-xs">
            <FaCheckDouble className="text-[#C2272D]" size={12} />
            <span>Verified Credentials & PDF Viewer</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-[34px] font-black font-title tracking-tight text-[#171717] dark:text-white">
            Resume & Verification Center
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#525252] dark:text-[#D1D5DB] max-w-2xl mx-auto leading-relaxed">
            Review my authentic original resume PDF or inspect the standard ATS parsed report.
          </p>

          {/* Primary View Mode Switcher */}
          <div className="mt-7 inline-flex items-center p-1 rounded-full bg-slate-200/80 dark:bg-white/10 border border-slate-300/60 dark:border-white/10 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveView('pdf')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeView === 'pdf'
                  ? 'bg-[#C2272D] text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white'
              }`}
            >
              <FaFilePdf size={14} />
              <span>Original Resume PDF</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('ats')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeView === 'ats'
                  ? 'bg-[#C2272D] text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white'
              }`}
            >
              <FaCheckCircle size={14} />
              <span>ATS Parser Report (98%)</span>
            </button>
          </div>
        </div>

        {/* Feedback alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 rounded-2xl text-xs sm:text-sm flex items-center justify-between gap-2 max-w-3xl mx-auto">
            <span className="flex items-center gap-2"><FaExclamationTriangle /> {error}</span>
            <button onClick={() => setError('')} className="p-1 hover:opacity-75"><FaTimes /></button>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs sm:text-sm flex items-center justify-between gap-2 max-w-3xl mx-auto">
            <span className="flex items-center gap-2"><FaCheckCircle /> {success}</span>
            <button onClick={() => setSuccess('')} className="p-1 hover:opacity-75"><FaTimes /></button>
          </div>
        )}

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <FaSpinner className="animate-spin text-[#C2272D]" size={36} />
            <span className="text-sm font-semibold text-[#525252] dark:text-[#A3A3A3]">Loading authentic resume document...</span>
          </div>
        ) : (
          <div ref={viewerContainerRef}>
            {/* ============================================================== */}
            {/* VIEW 1: ORIGINAL RESUME PDF DOCUMENT VIEWER (MAIN FEATURE)    */}
            {/* ============================================================== */}
            {activeView === 'pdf' && (
              <div className="max-w-[1040px] mx-auto flex flex-col gap-5">
                
                {/* PDF Viewer Action Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 bg-white dark:bg-[#111116] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#C2272D]/10 text-[#C2272D] flex items-center justify-center shrink-0">
                      <FaFilePdf size={18} />
                    </div>
                    <div className="truncate">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                        Tauhid_Shekhar_Resume.pdf
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Original Document • Vector Fonts • Multiple Pages Intact
                      </p>
                    </div>
                  </div>

                  {/* 3 Explicit Resume Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto justify-end">
                    {/* 1. View Resume (Full Screen Viewer) */}
                    <button
                      type="button"
                      onClick={() => setShowFullPreview(true)}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white text-xs sm:text-[13px] font-semibold border border-slate-200 dark:border-white/10 transition-all cursor-pointer"
                    >
                      <FaExpand size={11} />
                      <span>View Full Screen</span>
                    </button>

                    {/* 2. Open PDF (New Browser Tab) */}
                    <a
                      href={resumePdfUrl || '/assits/Resume-file.pdf'}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleOpenPdf}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white text-xs sm:text-[13px] font-semibold border border-slate-200 dark:border-white/10 transition-all cursor-pointer"
                    >
                      <FaExternalLinkAlt size={11} />
                      <span>Open PDF</span>
                    </a>

                    {/* 3. Download Resume (Direct PDF Download) */}
                    <button
                      type="button"
                      onClick={handleDownloadResume}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#C2272D] hover:bg-[#A51E23] text-white text-xs sm:text-[13px] font-bold shadow-sm shadow-[#C2272D]/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                      <FaDownload size={11} />
                      <span>Download Resume</span>
                    </button>
                  </div>
                </div>

                {/* The Embedded Original PDF Document Viewer */}
                <div className="relative w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl bg-slate-900 aspect-[1/1.3] sm:aspect-[1/1.35] min-h-[520px] max-h-[920px]">
                  <object
                    data={`${resumePdfUrl || '/assits/Resume-file.pdf'}#view=FitH`}
                    type="application/pdf"
                    className="w-full h-full rounded-2xl border-0"
                    onLoad={() => setPdfLoaded(true)}
                    onError={() => setPdfError(true)}
                  >
                    <iframe
                      src={`${resumePdfUrl || '/assits/Resume-file.pdf'}#toolbar=1&navpanes=0&view=FitH`}
                      className="w-full h-full rounded-2xl border-0"
                      title="Tauhid Shekhar Original Resume PDF Viewer"
                    >
                      {/* Robust Fallback if browser disabled native iframe PDF viewing */}
                      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-white dark:bg-[#111116] text-center">
                        <FaFilePdf size={48} className="text-[#C2272D] mb-4" />
                        <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                          Original Resume PDF
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
                          Your browser does not directly render inline PDF frames. You can open the original PDF in a new tab or download it directly below:
                        </p>
                        <div className="flex flex-wrap gap-3 justify-center">
                          <a
                            href={resumePdfUrl || '/assits/Resume-file.pdf'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C2272D] hover:bg-[#A51E23] text-white font-bold text-xs sm:text-sm shadow-md"
                          >
                            <FaExternalLinkAlt /> Open PDF in New Tab
                          </a>
                          <button
                            type="button"
                            onClick={handleDownloadResume}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-800 dark:text-white font-bold text-xs sm:text-sm border border-slate-200 dark:border-white/10"
                          >
                            <FaDownload /> Download Resume
                          </button>
                        </div>
                      </div>
                    </iframe>
                  </object>
                </div>

                {/* Viewer Helper Notes & Admin controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 px-2">
                  <span>Scroll inside the viewer to read all pages with original formatting.</span>
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleReanalyze}
                        disabled={analyzing}
                        className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full font-bold text-xs border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        {analyzing ? <FaSpinner className="animate-spin" /> : <FaRedo />}
                        <span>Re-analyze</span>
                      </button>
                      <label className="px-3 py-1 bg-[#C2272D]/10 text-[#C2272D] dark:text-[#00FFFF] rounded-full font-bold text-xs border border-[#C2272D]/20 hover:bg-[#C2272D]/20 transition-all cursor-pointer flex items-center gap-1.5">
                        <FaUpload />
                        <span>Replace PDF</span>
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

              </div>
            )}

            {/* ============================================================== */}
            {/* VIEW 2: ATS VERIFICATION & METRICS                             */}
            {/* ============================================================== */}
            {activeView === 'ats' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column (lg:col-span-8): ATS Resume Document Card */}
                <div className="lg:col-span-8 flex flex-col gap-4">
                  <div className="bg-white dark:bg-[#111116] border border-slate-200 dark:border-white/10 rounded-3xl shadow-xl overflow-hidden relative">
                    <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 bg-slate-50 dark:bg-[#16161c] border-b border-slate-200 dark:border-white/10">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                          Standard ATS Single-Column Layout
                        </span>
                      </div>
                      <button
                        onClick={() => setShowFullPreview(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#C2272D] dark:hover:text-[#00FFFF] hover:bg-slate-200 dark:hover:bg-white/5 transition-all cursor-pointer"
                      >
                        <FaExpand size={11} />
                        <span>Inspect Full</span>
                      </button>
                    </div>

                    <div className="max-h-[640px] overflow-y-auto custom-scrollbar">
                      {renderAtsDocument(false)}
                    </div>
                  </div>
                </div>

                {/* Right Column (lg:col-span-4): ATS Score & Verification Hub */}
                <div className="lg:col-span-4 flex flex-col gap-5">
                  <div className="bg-white dark:bg-[#111116] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-7 shadow-lg flex flex-col gap-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                          Parser Compatibility
                        </span>
                        <h3 className="text-lg font-black font-title text-[#171717] dark:text-white leading-tight">
                          ATS Verified Index
                        </h3>
                      </div>

                      {/* Circular Score Indicator */}
                      <div className="relative w-16 h-16 rounded-full flex items-center justify-center shrink-0 bg-slate-50 dark:bg-[#171720] border border-slate-200 dark:border-white/10">
                        <svg className="w-full h-full rotate-[-90deg]">
                          <circle
                            cx="32"
                            cy="32"
                            r="26"
                            stroke="currentColor"
                            strokeWidth="3.5"
                            fill="transparent"
                            className="text-slate-100 dark:text-white/10"
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
                            className="text-emerald-500 stroke-emerald-500"
                          />
                        </svg>
                        <div className="absolute text-sm font-black font-title text-[#C2272D] dark:text-[#00FFFF]">
                          {atsScore}%
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-white/5 text-left">
                      <div className="flex items-center gap-2.5 text-xs sm:text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                        <FaCheck className="text-emerald-500 shrink-0" size={12} />
                        <span>Single-column linear parsing flow</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs sm:text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                        <FaCheck className="text-emerald-500 shrink-0" size={12} />
                        <span>Standardized section header tokens</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs sm:text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                        <FaCheck className="text-emerald-500 shrink-0" size={12} />
                        <span>Clickable email, phone & social URLs</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs sm:text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                        <FaCheck className="text-emerald-500 shrink-0" size={12} />
                        <span>No unreadable tables or floating graphics</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Hub */}
                  <div className="bg-white dark:bg-[#111116] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-lg flex flex-col gap-3">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Resume Actions
                    </span>

                    <button
                      type="button"
                      onClick={handleDownloadResume}
                      className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 bg-[#C2272D] hover:bg-[#A51E23] text-white rounded-full font-bold text-sm shadow-md shadow-[#C2272D]/25 transition-all duration-200 cursor-pointer"
                    >
                      <FaDownload size={14} />
                      <span>Download Resume (PDF)</span>
                    </button>

                    <a
                      href={resumePdfUrl || '/assits/Resume-file.pdf'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2.5 px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white rounded-full font-semibold text-sm border border-slate-200 dark:border-white/10 transition-all duration-200 cursor-pointer"
                    >
                      <FaEye size={14} />
                      <span>Open PDF in New Tab</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => setActiveView('pdf')}
                      className="w-full flex items-center justify-center gap-2.5 px-5 py-3 bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 rounded-full font-semibold text-sm border border-dashed border-slate-300 dark:border-white/20 transition-all duration-200 cursor-pointer"
                    >
                      <FaFilePdf size={14} className="text-[#C2272D]" />
                      <span>Switch to Original PDF Viewer</span>
                    </button>
                  </div>

                </div>

              </div>
            )}

          </div>
        )}

      </div>

      {/* ── Full Screen Document Preview Modal ── */}
      <AnimatePresence>
        {showFullPreview && (
          <div 
            className="fixed inset-0 z-[1050] flex items-center justify-center p-2 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setShowFullPreview(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white dark:bg-[#111116] rounded-3xl max-w-5xl w-full h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10"
              role="dialog"
              aria-modal="true"
              aria-label="Full Screen Resume Preview"
            >
              {/* Modal Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 sm:px-6 py-3.5 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#16161c] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#C2272D]/10 text-[#C2272D] flex items-center justify-center shrink-0">
                    <FaFilePdf size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#171717] dark:text-white leading-tight">
                      Tauhid Shekhar — Original Resume PDF
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Official Document Preview • Full Formatting Preserved
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                  <a
                    href={resumePdfUrl || '/assits/Resume-file.pdf'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-[#171717] dark:text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    <FaExternalLinkAlt size={10} />
                    <span>Open in Tab</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleDownloadResume}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#C2272D] hover:bg-[#A51E23] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    <FaDownload size={11} />
                    <span>Download</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowFullPreview(false)}
                    className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-300 transition-colors cursor-pointer ml-1"
                    aria-label="Close modal"
                  >
                    <FaTimes size={16} />
                  </button>
                </div>
              </div>

              {/* Modal Body - Full Viewport PDF Viewer */}
              <div className="flex-1 overflow-hidden p-2 sm:p-4 bg-slate-900">
                <object
                  data={`${resumePdfUrl || '/assits/Resume-file.pdf'}#view=FitH`}
                  type="application/pdf"
                  className="w-full h-full rounded-2xl border-0"
                >
                  <iframe
                    src={`${resumePdfUrl || '/assits/Resume-file.pdf'}#toolbar=1&navpanes=0&view=FitH`}
                    className="w-full h-full rounded-2xl border-0"
                    title="Full Screen Resume PDF Viewer"
                  >
                    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-white dark:bg-[#111116] text-center">
                      <FaFilePdf size={48} className="text-[#C2272D] mb-4" />
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                        Click below to view or download the original resume PDF:
                      </p>
                      <a
                        href={resumePdfUrl || '/assits/Resume-file.pdf'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C2272D] text-white text-sm font-bold"
                      >
                        <FaExternalLinkAlt /> Open Original PDF
                      </a>
                    </div>
                  </iframe>
                </object>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};

export default Resume;
