import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { FaGraduationCap, FaAward, FaBriefcase, FaCheckCircle, FaLanguage } from 'react-icons/fa';

const About = () => {
  const [settings, setSettings] = useState(null);
  const [activeResume, setActiveResume] = useState(null);

  useEffect(() => {
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
  }, []);

  const defaultStats = [
    { value: '2-3', label: 'Years Experience', icon: <FaBriefcase className="text-primary-blue" size={20} /> },
    { value: '50+', label: 'Projects Completed', icon: <FaAward className="text-primary-purple" size={20} /> },
    { value: '30+', label: 'Clients Served', icon: <FaGraduationCap className="text-primary-cyan" size={20} /> },
  ];

  const stats = settings?.aboutStats ? [
    { value: settings.aboutStats.yearsExp || '2-3', label: 'Years Experience', icon: <FaBriefcase className="text-primary-blue" size={20} /> },
    { value: settings.aboutStats.projects || '50+', label: 'Projects Completed', icon: <FaAward className="text-primary-purple" size={20} /> },
    { value: settings.aboutStats.clients || '30+', label: 'Clients Served', icon: <FaGraduationCap className="text-primary-cyan" size={20} /> },
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
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1, y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.15 },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1, y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const aboutTitle = settings?.aboutTitle || 'About Me';
  const aboutSkillsSummary = settings?.aboutSkillsSummary || 'Full Stack Web Developer & Graphic Designer';
  const profilePic = settings?.profilePicture?.url || 'assits/Profile-Img.png';
  const aboutText = settings?.aboutContent || 'Results-oriented Full Stack Web Developer with practical experience in building responsive web applications using HTML5, CSS3, JavaScript, React.js, Node.js, Express.js, MongoDB, and MySQL. Experienced in developing REST APIs, authentication systems, dashboards, and responsive user interfaces. Passionate about solving real-world problems, writing clean code, and continuously learning modern technologies.';
  const resumeLink = activeResume?.fileUrl || settings?.resumeUrl || '';
  
  // Dynamic Personal Info Grids
  const personalInfo = settings?.aboutPersonalInfo || [];

  return (
    <section id="about" className="py-24 bg-white dark:bg-slate-900/40 relative">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary-blue font-title mb-2">My Intro</h3>
          <h2 className="text-3xl md:text-5xl font-black font-title tracking-tight text-black dark:text-white">{aboutTitle}</h2>
        </div>

        <motion.div variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Image & Stats */}
          <div className="lg:col-span-5 flex flex-col items-center gap-8">
            <motion.div variants={childVariants} className="relative w-full max-w-[360px] aspect-[4/5] rounded-[30px] overflow-hidden border border-slate-200 dark:border-white/5 shadow-xl select-none">
              <img src={profilePic} alt="Profile photo" className="w-full h-full object-cover" />
            </motion.div>
            {/* Stats Cards */}
            <motion.div variants={childVariants} className="grid grid-cols-3 gap-4 w-full">
              {stats.map((stat, idx) => (
                <div key={idx} className="glass p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm hover:scale-[1.03] transition-all duration-300 border border-slate-100 dark:border-white/5">
                  <div className="mb-2 p-2 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center">{stat.icon}</div>
                  <span className="text-2xl font-black font-title text-black dark:text-white mb-0.5">{stat.value}</span>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-tight">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column: Bio & Core Info */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <motion.h4 variants={childVariants} className="text-xl md:text-2xl font-bold text-black dark:text-white font-title mb-4">
              {aboutSkillsSummary}
            </motion.h4>
            <motion.p variants={childVariants} className="text-base text-slate-650 dark:text-slate-350 mb-6 leading-relaxed">{aboutText}</motion.p>

            {/* Dynamic Personal Info Grids */}
            {personalInfo.length > 0 && (
              <motion.div variants={childVariants} className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 w-full mb-8 border-t border-slate-200/50 dark:border-white/5 pt-6 text-sm">
                {personalInfo.map((item, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="font-extrabold text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-wider shrink-0 w-24">{item.label}:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-semibold">{item.value}</span>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Core Strengths */}
            <motion.h5 variants={childVariants} className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Core Strengths</motion.h5>
            <motion.div variants={childVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-8">
              {coreStrengths.map((item, idx) => (
                <div key={idx} className="flex gap-2.5 items-start">
                  <FaCheckCircle className="text-green-500 shrink-0 mt-1" size={15} />
                  <div>
                    <h6 className="text-sm font-bold text-black dark:text-white leading-tight mb-1">{item.title}</h6>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Languages */}
            <motion.h5 variants={childVariants} className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Languages</motion.h5>
            <motion.div variants={childVariants} className="flex flex-wrap gap-3 mb-8 w-full">
              {languages.map((lang, idx) => {
                const colors = ['text-primary-blue', 'text-primary-purple', 'text-primary-cyan', 'text-green-500'];
                const iconColor = colors[idx % colors.length];
                return (
                  <span key={idx} className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-slate-655 dark:text-slate-300">
                    <FaLanguage className={iconColor} size={14} /> {lang.name} {lang.level ? `(${lang.level})` : ''}
                  </span>
                );
              })}
            </motion.div>

            <motion.div variants={childVariants} className="flex gap-4">
              {resumeLink && (
                <a 
                  href={resumeLink.startsWith('http') ? `https://docs.google.com/gview?url=${encodeURIComponent(resumeLink)}` : resumeLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-8 py-3.5 bg-primary-blue hover:bg-accent-blue text-white rounded-full font-bold transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-primary-blue/20"
                >
                  View Resume
                </a>
              )}
              <a href="#contact" className="px-8 py-3.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-white rounded-full font-bold transition-all">Let's Talk</a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
