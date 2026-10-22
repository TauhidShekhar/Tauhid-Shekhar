import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { 
  FaGraduationCap, 
  FaAward, 
  FaBriefcase, 
  FaCheckCircle, 
  FaLanguage, 
  FaBuilding, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaExternalLinkAlt, 
  FaFileAlt, 
  FaPaperPlane 
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

const About = ({ aboutData, resumeData }) => {
  const [settings, setSettings] = useState(aboutData || null);
  const [activeResume, setActiveResume] = useState(resumeData || null);

  useEffect(() => {
    if (aboutData) {
      setSettings(aboutData);
    }
  }, [aboutData]);

  useEffect(() => {
    if (resumeData) {
      setActiveResume(resumeData);
    }
  }, [resumeData]);

  useEffect(() => {
    if (aboutData && resumeData) return;
    const loadSettings = async () => {
      try {
        const [aboutRes, resumeRes] = await Promise.all([
          api.getAbout().catch(() => null),
          api.getActiveResume().catch(() => null)
        ]);
        if (aboutRes && aboutRes.success) {
          setSettings(aboutRes.data);
        }
        if (resumeRes && resumeRes.success) {
          setActiveResume(resumeRes.data);
        }
      } catch (err) {
        console.error('Failed to load settings in About:', err.message);
      }
    };
    loadSettings();
  }, [aboutData, resumeData]);

  const defaultStats = [
    { value: '2-3', label: 'Years Experience', icon: <FaBriefcase className="text-[#C2272D]" size={22} /> },
    { value: '50+', label: 'Projects Completed', icon: <FaAward className="text-[#00FFFF]" size={22} /> },
    { value: '30+', label: 'Clients Served', icon: <FaGraduationCap className="text-[#C2272D]" size={22} /> },
  ];

  const stats = settings?.aboutStats ? [
    { value: settings.aboutStats.yearsExp || '2-3', label: 'Years Experience', icon: <FaBriefcase className="text-[#C2272D]" size={22} /> },
    { value: settings.aboutStats.projects || '50+', label: 'Projects Completed', icon: <FaAward className="text-[#00FFFF]" size={22} /> },
    { value: settings.aboutStats.clients || '30+', label: 'Clients Served', icon: <FaGraduationCap className="text-[#C2272D]" size={22} /> },
  ] : defaultStats;

  const defaultStrengths = [
    { title: 'Problem Solving', desc: 'Analytical approach to complex debugging, scripting, and code structures.' },
    { title: 'Quick Learner', desc: 'Rapid adaptation to emerging web frameworks, packages, and design tools.' },
    { title: 'Team Collaboration', desc: 'Cooperative alignment in workflows, clear peer reviews, and group sprints.' },
    { title: 'Communication', desc: 'Articulate documentation, transparent project updates, and active feedback loops.' },
    { title: 'Adaptability', desc: 'Versatile adjustment to project requirements, shifting technologies, and layout specs.' },
  ];

  const coreStrengths = settings?.coreStrengths?.length ? settings.coreStrengths : defaultStrengths;
  
  const defaultLanguages = [
    { name: 'Hindi', level: 'Native' },
    { name: 'English', level: 'Professional Working Proficiency' }
  ];
  
  const languages = settings?.languages?.length ? settings.languages : defaultLanguages;

  // Current Company / Employment details from Admin CMS
  const currentWork = settings?.currentWork;
  const isEmployed = currentWork ? currentWork.isEmployed !== false : true;
  const companyName = currentWork?.companyName?.trim() || (settings?.currentWork ? '' : 'Tech Innovators Pvt Ltd');
  const role = currentWork?.role?.trim() || 'Full Stack Developer';
  const joiningDate = currentWork?.joiningDate?.trim() || 'Aug 2024 - Present';
  const employmentType = currentWork?.employmentType?.trim() || 'Full-time';
  const location = currentWork?.location?.trim() || 'Noida, India (Hybrid)';
  const details = currentWork?.details?.trim() || 'Architecting scalable web applications, REST APIs, and high-performance interactive interfaces.';
  const companyUrl = currentWork?.companyUrl?.trim() || '';

  const showCurrentWork = isEmployed && companyName;

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1, y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.12 },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1, y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const aboutTitle = settings?.aboutTitle || 'About Me';
  const aboutSkillsSummary = settings?.aboutSkillsSummary || 'Full Stack Web Developer & Graphic Designer';
  const profilePic = settings?.profilePicture?.url 
    ? `${settings.profilePicture.url}?v=${settings.updatedAt ? new Date(settings.updatedAt).getTime() : Date.now()}` 
    : '/assits/Profile-Img.jpg';
  const aboutText = settings?.aboutContent || 'Results-oriented Full Stack Web Developer with practical experience in building responsive web applications using HTML5, CSS3, JavaScript, React.js, Node.js, Express.js, MongoDB, and MySQL. Experienced in developing REST APIs, authentication systems, dashboards, and responsive user interfaces. Passionate about solving real-world problems, writing clean code, and continuously learning modern technologies.';
  const resumeLink = getAbsolutePdfUrl(activeResume?.fileUrl || settings?.resumeUrl || '');
  
  const handleViewResume = (e) => {
    // Allows standard target="_blank" anchor behavior, but provides programmatic backup
    const linkToOpen = resumeLink || getAbsolutePdfUrl(activeResume?.fileUrl || settings?.resumeUrl || '');
    if (!linkToOpen) {
      if (e) e.preventDefault();
      return;
    }
  };
  
  const personalInfo = settings?.aboutPersonalInfo || [];

  return (
    <section id="about" className="scroll-mt-24 py-20 sm:py-24 md:py-28 bg-[#F8FAFC]/70 dark:bg-transparent relative">
      <div className="max-w-[1400px] mx-auto px-4 xs:px-6 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C2272D]/10 dark:bg-[#00FFFF]/10 border border-[#C2272D]/20 dark:border-[#00FFFF]/30 text-[#C2272D] dark:text-[#00FFFF] text-xs sm:text-sm font-semibold tracking-wider uppercase mb-3">
            <span>My Intro</span>
          </div>
          <h2 className="text-2xl xs:text-3xl sm:text-[34px] font-bold font-title tracking-tight text-[#171717] dark:text-white">
            {aboutTitle}
          </h2>
        </div>

        <motion.div 
          variants={sectionVariants} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: '-80px' }} 
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start"
        >
          {/* Left Column: Image & Stats */}
          <div className="lg:col-span-5 flex flex-col items-center gap-7">
            <motion.div 
              variants={childVariants} 
              className="relative w-full max-w-[360px] sm:max-w-[390px] aspect-[4/5] rounded-3xl overflow-hidden border border-[#E5E7EB] dark:border-white/10 shadow-2xl select-none bg-slate-100 dark:bg-[#111111]"
            >
              <img 
                src={profilePic} 
                alt="Profile photo" 
                className="w-full h-full object-cover" 
                loading="lazy" 
                decoding="async" 
              />
            </motion.div>

            {/* Stats Cards */}
            <motion.div variants={childVariants} className="grid grid-cols-3 gap-2.5 xs:gap-3 sm:gap-4 w-full max-w-[420px]">
              {stats.map((stat, idx) => (
                <div 
                  key={idx} 
                  className="bg-white dark:bg-[#111111] p-3 xs:p-4 sm:p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-md border border-[#E5E7EB] dark:border-white/10 hover:border-[#C2272D] dark:hover:border-[#00FFFF] hover:-translate-y-1 hover:shadow-xl hover:shadow-[#C2272D]/15 dark:hover:shadow-[#00FFFF]/15 transition-all duration-300 group cursor-pointer"
                >
                  <div className="mb-2 p-2 sm:p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-white/5 flex items-center justify-center group-hover:scale-120 group-hover:rotate-6 transition-all duration-300 text-sm sm:text-base">
                    {stat.icon}
                  </div>
                  <span className="text-xl xs:text-2xl sm:text-[26px] font-bold font-title text-[#171717] dark:text-white mb-0.5 group-hover:text-[#C2272D] dark:group-hover:text-[#00FFFF] transition-colors leading-tight">
                    {stat.value}
                  </span>
                  <span className="text-[11px] xs:text-xs sm:text-[13px] font-medium text-[#525252] dark:text-[#9CA3AF] leading-tight">
                    {stat.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column: Bio, Current Work, Strengths & Actions */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <motion.h3 
              variants={childVariants} 
              className="text-xl sm:text-2xl md:text-[26px] font-bold text-[#171717] dark:text-white font-title mb-3 leading-snug"
            >
              {aboutSkillsSummary}
            </motion.h3>

            <motion.p 
              variants={childVariants} 
              className="text-sm sm:text-base text-[#525252] dark:text-[#D1D5DB] mb-6 leading-relaxed"
            >
              {aboutText}
            </motion.p>

            {/* Current Company & Employment Highlight Card */}
            {showCurrentWork && (
              <motion.div 
                variants={childVariants}
                className="w-full mb-7 p-4 xs:p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#111111] border-l-4 border-l-[#C2272D] dark:border-l-[#00FFFF] border border-[#E5E7EB] dark:border-white/10 shadow-lg shadow-[#C2272D]/5 dark:shadow-[#00FFFF]/5 transition-all duration-300 hover:shadow-xl relative overflow-hidden group"
              >
                {/* Background accent glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C2272D]/5 dark:bg-[#00FFFF]/5 rounded-bl-full pointer-events-none transition-all duration-500 group-hover:scale-125" />

                {/* Header: Pulsing Badge + Employment Type */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Currently Working At
                    </span>
                  </div>

                  {employmentType && (
                    <span className="text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                      {employmentType}
                    </span>
                  )}
                </div>

                {/* Company Name & Role */}
                <div className="mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <FaBuilding className="text-[#C2272D] dark:text-[#00FFFF] shrink-0 text-base sm:text-lg" />
                    {companyUrl ? (
                      <a 
                        href={companyUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-lg sm:text-xl font-bold font-title text-[#171717] dark:text-white hover:text-[#C2272D] dark:hover:text-[#00FFFF] inline-flex items-center gap-1.5 transition-colors group/link"
                      >
                        <span>{companyName}</span>
                        <FaExternalLinkAlt size={12} className="opacity-60 group-hover/link:opacity-100 transition-opacity" />
                      </a>
                    ) : (
                      <h4 className="text-lg sm:text-xl font-bold font-title text-[#171717] dark:text-white">
                        {companyName}
                      </h4>
                    )}
                  </div>
                  {role && (
                    <p className="text-sm sm:text-base font-semibold text-[#C2272D] dark:text-[#00FFFF] mt-1">
                      {role}
                    </p>
                  )}
                </div>

                {/* Joining Date & Location metadata */}
                <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-3">
                  {joiningDate && (
                    <span className="inline-flex items-center gap-1.5">
                      <FaCalendarAlt className="text-[#C2272D] dark:text-[#00FFFF] shrink-0" size={12} />
                      <span className="font-medium text-[#171717] dark:text-gray-200">Joined:</span> {joiningDate}
                    </span>
                  )}
                  {location && (
                    <span className="inline-flex items-center gap-1.5">
                      <FaMapMarkerAlt className="text-[#C2272D] dark:text-[#00FFFF] shrink-0" size={12} />
                      <span>{location}</span>
                    </span>
                  )}
                </div>

                {/* Job Highlights / Details */}
                {details && (
                  <p className="text-xs sm:text-sm text-[#525252] dark:text-[#D1D5DB] leading-relaxed pt-2.5 border-t border-slate-100 dark:border-white/5">
                    {details}
                  </p>
                )}
              </motion.div>
            )}

            {/* Dynamic Personal Info Grids */}
            {personalInfo.length > 0 && (
              <motion.div 
                variants={childVariants} 
                className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 w-full mb-6 border-t border-[#E5E7EB] dark:border-white/10 pt-4 text-xs sm:text-sm"
              >
                {personalInfo.map((item, idx) => (
                  <div key={idx} className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2.5">
                    <span className="font-semibold text-slate-500 dark:text-gray-400 uppercase text-[11px] sm:text-xs tracking-wider shrink-0 xs:w-28">
                      {item.label}:
                    </span>
                    <span className="text-[#171717] dark:text-white font-medium break-all sm:break-normal">
                      {item.value}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Core Strengths - Keywords only (No details) */}
            <motion.div variants={childVariants} className="w-full mb-6">
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-gray-300 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C2272D] dark:bg-[#00FFFF]"></span>
                <span>Core Strengths</span>
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 w-full">
                {coreStrengths.map((item, idx) => {
                  const keyword = typeof item === 'string' ? item : (item.title || item.keyword || item.desc || '');
                  if (!keyword) return null;
                  return (
                    <div 
                      key={idx} 
                      className="flex items-center gap-2.5 bg-white dark:bg-[#111111] px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl border border-[#E5E7EB] dark:border-white/10 hover:border-[#C2272D] dark:hover:border-[#00FFFF] transition-all duration-200 shadow-sm hover:-translate-y-0.5 group cursor-default"
                    >
                      <FaCheckCircle className="text-[#C2272D] dark:text-[#00FFFF] shrink-0 text-sm sm:text-base group-hover:scale-110 transition-transform" />
                      <span className="text-xs sm:text-sm md:text-[14.5px] font-bold font-title text-[#171717] dark:text-white leading-tight truncate">
                        {keyword}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Languages */}
            <motion.div variants={childVariants} className="w-full mb-6">
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-gray-300 mb-2.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C2272D] dark:bg-[#00FFFF]"></span>
                <span>Languages</span>
              </h4>
              <div className="flex flex-wrap gap-2.5 w-full">
                {languages.map((lang, idx) => (
                  <span 
                    key={idx} 
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl bg-white dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 hover:border-[#C2272D] dark:hover:border-[#00FFFF] text-[#171717] dark:text-white shadow-sm transition-all duration-200"
                  >
                    <FaLanguage className="text-[#C2272D] dark:text-[#00FFFF]" size={15} /> 
                    <span>{lang.name}</span>
                    {lang.level && <span className="text-[11px] font-normal text-slate-400">({lang.level})</span>}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* CTAs - Responsive, clear, branded */}
            <motion.div variants={childVariants} className="flex flex-col sm:flex-row items-center gap-3 w-full pt-1">
              {resumeLink && (
                <a 
                  href={resumeLink} 
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleViewResume}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-[#C2272D] hover:bg-[#A51E23] text-white rounded-xl text-sm sm:text-base font-semibold shadow-md shadow-[#C2272D]/25 hover:shadow-xl hover:shadow-[#C2272D]/40 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer btn-shine-effect"
                >
                  <FaFileAlt size={14} />
                  <span>View Resume</span>
                </a>
              )}
              <a 
                href="#contact" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-white dark:bg-[#111111] hover:bg-slate-50 dark:hover:bg-white/5 text-[#171717] dark:text-white border border-[#E5E7EB] dark:border-white/10 hover:border-[#00FFFF] hover:shadow-lg hover:shadow-[#00FFFF]/20 rounded-xl text-sm sm:text-base font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer group"
              >
                <FaPaperPlane size={13} className="text-[#C2272D] dark:text-[#00FFFF] group-hover:translate-x-0.5 transition-transform" />
                <span>Let's Talk</span>
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
