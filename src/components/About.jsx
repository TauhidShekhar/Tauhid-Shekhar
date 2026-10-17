import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { FaGraduationCap, FaAward, FaBriefcase, FaCheckCircle, FaLanguage } from 'react-icons/fa';

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
    if (e) e.preventDefault();
    const linkToOpen = resumeLink || getAbsolutePdfUrl(activeResume?.fileUrl || settings?.resumeUrl || '');
    if (!linkToOpen) return;
    const win = window.open(linkToOpen, '_blank', 'noopener,noreferrer');
    if (!win) {
      window.location.href = linkToOpen;
    }
  };
  
  const personalInfo = settings?.aboutPersonalInfo || [];

  return (
    <section id="about" className="py-24 sm:py-28 bg-[#F8FAFC] dark:bg-[#000000] relative">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C2272D]/10 dark:bg-[#00FFFF]/10 border border-[#C2272D]/20 dark:border-[#00FFFF]/30 text-[#C2272D] dark:text-[#00FFFF] text-xs sm:text-sm font-semibold tracking-wider uppercase mb-3">
            <span>My Intro</span>
          </div>
          <h2 className="text-2xl md:text-[32px] font-bold font-title tracking-tight text-[#171717] dark:text-white">
            {aboutTitle}
          </h2>
        </div>

        <motion.div 
          variants={sectionVariants} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: '-80px' }} 
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start"
        >
          {/* Left Column: Image & Stats */}
          <div className="lg:col-span-5 flex flex-col items-center gap-8">
            <motion.div 
              variants={childVariants} 
              className="relative w-full max-w-[380px] aspect-[4/5] rounded-3xl overflow-hidden border border-[#E5E7EB] dark:border-white/10 shadow-2xl select-none bg-slate-100 dark:bg-[#111111]"
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
            <motion.div variants={childVariants} className="grid grid-cols-3 gap-3.5 sm:gap-4 w-full max-w-[420px]">
              {stats.map((stat, idx) => (
                <div 
                  key={idx} 
                  className="bg-white dark:bg-[#111111] p-4 sm:p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-md border border-[#E5E7EB] dark:border-white/10 hover:border-[#C2272D] dark:hover:border-[#00FFFF] hover:-translate-y-2 hover:shadow-xl hover:shadow-[#C2272D]/15 dark:hover:shadow-[#00FFFF]/15 transition-all duration-300 group cursor-pointer"
                >
                  <div className="mb-2 p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-white/5 flex items-center justify-center group-hover:scale-125 group-hover:rotate-6 transition-all duration-300">
                    {stat.icon}
                  </div>
                  <span className="text-2xl sm:text-[28px] font-bold font-title text-[#171717] dark:text-white mb-0.5 group-hover:text-[#C2272D] dark:group-hover:text-[#00FFFF] transition-colors">
                    {stat.value}
                  </span>
                  <span className="text-xs sm:text-[13px] font-medium text-[#525252] dark:text-[#9CA3AF] leading-tight">
                    {stat.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column: Bio & Core Info */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <motion.h3 
              variants={childVariants} 
              className="text-xl sm:text-2xl font-bold text-[#171717] dark:text-white font-title mb-4 leading-snug"
            >
              {aboutSkillsSummary}
            </motion.h3>

            <motion.p 
              variants={childVariants} 
              className="text-base text-[#525252] dark:text-[#D1D5DB] mb-7 leading-relaxed"
            >
              {aboutText}
            </motion.p>

            {/* Dynamic Personal Info Grids */}
            {personalInfo.length > 0 && (
              <motion.div 
                variants={childVariants} 
                className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 w-full mb-7 border-t border-[#E5E7EB] dark:border-white/10 pt-5 text-sm sm:text-base"
              >
                {personalInfo.map((item, idx) => (
                  <div key={idx} className="flex gap-2.5 items-center">
                    <span className="font-semibold text-slate-500 dark:text-gray-400 uppercase text-xs tracking-wider shrink-0 w-28">
                      {item.label}:
                    </span>
                    <span className="text-[#171717] dark:text-white font-medium">
                      {item.value}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Core Strengths */}
            <motion.h4 variants={childVariants} className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400 mb-3.5">
              Core Strengths
            </motion.h4>
            <motion.div variants={childVariants} className="grid grid-cols-1 md:grid-cols-2 gap-3.5 w-full mb-7">
              {coreStrengths.map((item, idx) => (
                <div key={idx} className="flex gap-3 items-start bg-white dark:bg-[#111111] p-3.5 rounded-xl border border-[#E5E7EB] dark:border-white/10">
                  <FaCheckCircle className="text-[#C2272D] dark:text-[#00FFFF] shrink-0 mt-1" size={16} />
                  <div>
                    <h5 className="text-[15px] sm:text-[16px] font-semibold text-[#171717] dark:text-white leading-tight mb-1">{item.title}</h5>
                    <p className="text-sm text-[#525252] dark:text-[#D1D5DB] leading-normal">{item.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Languages */}
            <motion.h4 variants={childVariants} className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400 mb-3">
              Languages
            </motion.h4>
            <motion.div variants={childVariants} className="flex flex-wrap gap-2.5 mb-8 w-full">
              {languages.map((lang, idx) => (
                <span 
                  key={idx} 
                  className="flex items-center gap-2 text-sm font-medium px-3.5 py-2 rounded-xl bg-white dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 text-[#171717] dark:text-white shadow-sm"
                >
                  <FaLanguage className="text-[#C2272D] dark:text-[#00FFFF]" size={16} /> 
                  <span>{lang.name}</span>
                  {lang.level && <span className="text-xs font-normal text-slate-400">({lang.level})</span>}
                </span>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div variants={childVariants} className="flex flex-wrap gap-3.5">
              {resumeLink && (
                <a 
                  href={resumeLink} 
                  onClick={handleViewResume}
                  className="px-6 py-3 bg-[#C2272D] hover:bg-[#A51E23] text-white rounded-full text-[15px] sm:text-[16px] font-semibold shadow-md shadow-[#C2272D]/20 hover:shadow-xl hover:shadow-[#C2272D]/40 transition-all duration-200 hover:scale-[1.04] active:scale-[0.96] cursor-pointer btn-shine-effect"
                >
                  View Resume
                </a>
              )}
              <a 
                href="#contact" 
                className="px-6 py-3 bg-white dark:bg-[#1A1A1A] hover:bg-slate-100 dark:hover:bg-white/10 text-[#171717] dark:text-white border border-[#E5E7EB] dark:border-white/10 hover:border-[#00FFFF] hover:shadow-lg hover:shadow-[#00FFFF]/20 rounded-full text-[15px] sm:text-[16px] font-semibold transition-all duration-200 hover:scale-[1.04] active:scale-[0.96] cursor-pointer"
              >
                Let's Talk
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
