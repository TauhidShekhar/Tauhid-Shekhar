import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { 
  FaGithub, FaLinkedin, FaEnvelope, FaChevronDown, FaCode, FaServer, FaDatabase, FaReact,
  FaTwitter, FaInstagram, FaYoutube, FaFacebook 
} from 'react-icons/fa';

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

const Hero = () => {
  const defaultRoles = [
    'Full Stack Developer',
    'MERN Stack Developer',
    'React Developer',
    'Backend Developer',
  ];

  const [roleIndex, setRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [settings, setSettings] = useState(null);
  const [activeResume, setActiveResume] = useState(null);

  // Dynamically use roles from DB settings, or fall back to defaults
  const roles = settings?.heroRoles?.length ? settings.heroRoles : defaultRoles;

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [heroRes, resumeRes] = await Promise.all([
          api.getHero().catch(() => null),
          api.getActiveResume().catch(() => null)
        ]);
        if (heroRes && heroRes.success) {
          setSettings(heroRes.data);
        }
        if (resumeRes && resumeRes.success) {
          setActiveResume(resumeRes.data);
        }
      } catch (err) {
        console.error('Failed to load settings in Hero:', err.message);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    let timer;
    const currentRole = roles[roleIndex] || '';

    if (isDeleting) {
      timer = setTimeout(() => {
        setDisplayText(currentRole.substring(0, displayText.length - 1));
      }, 50);
    } else {
      timer = setTimeout(() => {
        setDisplayText(currentRole.substring(0, displayText.length + 1));
      }, 100);
    }

    if (!isDeleting && displayText === currentRole) {
      timer = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && displayText === '') {
      setIsDeleting(false);
      setRoleIndex((prev) => (prev + 1) % roles.length);
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, roleIndex, roles]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1], // Apple-style ease out
      },
    },
  };

  const floatingVariants = (delay = 0) => ({
    animate: {
      y: [0, -12, 0],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: delay,
      },
    },
  });

  const handleScrollTo = (e, targetId) => {
    e.preventDefault();
    const element = document.querySelector(targetId);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const siteName = settings?.siteName || 'Tauhid Shekhar';
  const heroHeading = settings?.heroHeading || 'Hi,';
  const siteDescription = settings?.heroDescription || settings?.siteTagline || 'Results-oriented Full Stack Web Developer with practical experience in building responsive web applications using HTML5, CSS3, JavaScript, React.js, Node.js, Express.js, MongoDB, and MySQL. Experienced in developing REST APIs, authentication systems, dashboards, and responsive user interfaces. Passionate about solving real-world problems, writing clean code, and continuously learning modern technologies.';
  const heroImg = settings?.heroImage?.url 
    ? `${settings.heroImage.url}?v=${settings.updatedAt ? new Date(settings.updatedAt).getTime() : Date.now()}` 
    : 'assits/Profile_Pic.png';
  const resumeLink = getAbsolutePdfUrl(activeResume?.fileUrl || settings?.resumeUrl || '');
  const heroBg = settings?.heroBackground?.url 
    ? `${settings.heroBackground.url}?v=${settings.updatedAt ? new Date(settings.updatedAt).getTime() : Date.now()}` 
    : '';

  // Social Links
  const githubLink = settings?.socialLinks?.github || 'https://github.com/TauhidShekhar';
  const linkedinLink = settings?.socialLinks?.linkedin || 'https://www.linkedin.com/in/tauhidshekhar/';
  const twitterLink = settings?.socialLinks?.twitter || '';
  const instagramLink = settings?.socialLinks?.instagram || '';
  const youtubeLink = settings?.socialLinks?.youtube || '';
  const facebookLink = settings?.socialLinks?.facebook || '';
  const emailLink = settings?.email || 'shekhartauhid@gmail.com';

  // CTA Switches
  const showHireMe = settings?.heroCtaButtons?.showHireMe !== false;
  const showContactMe = settings?.heroCtaButtons?.showContactMe !== false;
  const showResume = settings?.heroCtaButtons?.showResume !== false;

  return (
    <section 
      id="home" 
      className="min-h-screen flex items-center justify-center pt-24 pb-16 relative overflow-hidden bg-cover bg-center"
      style={heroBg ? { backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.98)), url(${heroBg})` } : {}}
      className={`min-h-screen flex items-center justify-center pt-24 pb-16 relative overflow-hidden ${
        heroBg ? 'dark:bg-blend-multiply dark:bg-slate-950/90' : ''
      }`}
    >
      {/* Background Gradients */}
      <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] bg-primary-purple/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] bg-primary-blue/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Background Banner image option */}
      {heroBg && (
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-10 dark:opacity-5 pointer-events-none" 
          style={{ backgroundImage: `url(${heroBg})` }}
        />
      )}

      <div className="max-w-[1280px] mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* Text Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-7 flex flex-col items-start text-left"
        >
          <motion.h3
            variants={itemVariants}
            className="text-lg font-bold text-primary-blue font-title tracking-wider mb-3"
          >
            {heroHeading}
          </motion.h3>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-black font-title tracking-tight text-black dark:text-white mb-4 leading-none"
          >
            I'm <span className="bg-gradient-to-r from-primary-blue via-primary-purple to-primary-cyan bg-clip-text text-transparent">{siteName}</span>
          </motion.h1>

          <motion.div
            variants={itemVariants}
            className="h-12 flex items-center mb-6 text-2xl md:text-3xl font-bold font-title text-black dark:text-white"
          >
            <span>I'm a&nbsp;</span>
            <span className="text-primary-blue">{displayText}</span>
            <span className="inline-block w-[3px] h-8 bg-primary-blue ml-1 animate-pulse" />
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-base md:text-lg text-slate-655 dark:text-slate-400 mb-8 max-w-[620px] leading-relaxed"
          >
            {siteDescription}
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-4 mb-8">
            {showResume && resumeLink && (
              <a
                href={resumeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-8 py-3.5 bg-primary-blue hover:bg-accent-blue text-white rounded-full font-bold transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-primary-blue/20"
              >
                View Resume
              </a>
            )}
            
            {showHireMe && (
              <a
                href="#projects"
                onClick={(e) => handleScrollTo(e, '#projects')}
                className="px-8 py-3.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-white rounded-full font-bold transition-all duration-300 hover:-translate-y-0.5 border border-slate-200 dark:border-white/5"
              >
                View Projects
              </a>
            )}

            {showContactMe && (
              <a
                href="#contact"
                onClick={(e) => handleScrollTo(e, '#contact')}
                className="px-8 py-3.5 bg-transparent border border-primary-blue hover:bg-primary-blue/5 text-primary-blue rounded-full font-bold transition-all duration-300 hover:-translate-y-0.5"
              >
                Contact Me
              </a>
            )}
          </motion.div>

          {/* Social Links */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2.5 sm:gap-4">
            {githubLink && (
              <a
                href={githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-primary-blue hover:border-primary-blue dark:hover:text-primary-blue dark:hover:border-primary-blue hover:scale-105 shadow-sm transition-all duration-300"
                aria-label="GitHub Profile"
              >
                <FaGithub size={18} className="sm:text-[20px]" />
              </a>
            )}
            {linkedinLink && (
              <a
                href={linkedinLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-primary-blue hover:border-primary-blue dark:hover:text-primary-blue dark:hover:border-primary-blue hover:scale-105 shadow-sm transition-all duration-300"
                aria-label="LinkedIn Profile"
              >
                <FaLinkedin size={18} className="sm:text-[20px]" />
              </a>
            )}
            {twitterLink && (
              <a
                href={twitterLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-primary-blue hover:border-primary-blue dark:hover:text-primary-blue dark:hover:border-primary-blue hover:scale-105 shadow-sm transition-all duration-300"
                aria-label="Twitter Profile"
              >
                <FaTwitter size={18} className="sm:text-[20px]" />
              </a>
            )}
            {instagramLink && (
              <a
                href={instagramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-primary-blue hover:border-primary-blue dark:hover:text-primary-blue dark:hover:border-primary-blue hover:scale-105 shadow-sm transition-all duration-300"
                aria-label="Instagram Profile"
              >
                <FaInstagram size={18} className="sm:text-[20px]" />
              </a>
            )}
            {youtubeLink && (
              <a
                href={youtubeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-primary-blue hover:border-primary-blue dark:hover:text-primary-blue dark:hover:border-primary-blue hover:scale-105 shadow-sm transition-all duration-300"
                aria-label="YouTube Channel"
              >
                <FaYoutube size={18} className="sm:text-[20px]" />
              </a>
            )}
            {facebookLink && (
              <a
                href={facebookLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-primary-blue hover:border-primary-blue dark:hover:text-primary-blue dark:hover:border-primary-blue hover:scale-105 shadow-sm transition-all duration-300"
                aria-label="Facebook Profile"
              >
                <FaFacebook size={18} className="sm:text-[20px]" />
              </a>
            )}
            {emailLink && (
              <a
                href={`mailto:${emailLink}`}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-primary-blue hover:border-primary-blue dark:hover:text-primary-blue dark:hover:border-primary-blue hover:scale-105 shadow-sm transition-all duration-300"
                aria-label="Email Address"
              >
                <FaEnvelope size={18} className="sm:text-[20px]" />
              </a>
            )}
          </motion.div>
        </motion.div>

        {/* Headshot & Coding Floatables */}
        <div className="lg:col-span-5 flex justify-center relative select-none">
          {/* Main headshot image container with animated floating border outline */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-[280px] h-[360px] md:w-[320px] md:h-[420px] rounded-[30px] border-4 border-white dark:border-slate-800 shadow-2xl overflow-hidden group"
          >
            <img
              src={heroImg}
              alt={`${siteName} headshot`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Floatables: Coding icons */}
            <motion.div
              variants={floatingVariants(0)}
              animate="animate"
              className="absolute -top-4 -left-4 w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-md flex items-center justify-center text-primary-purple"
            >
              <FaCode size={20} />
            </motion.div>
            <motion.div
              variants={floatingVariants(1)}
              animate="animate"
              className="absolute top-1/3 -right-4 w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-md flex items-center justify-center text-primary-blue"
            >
              <FaReact size={22} className="animate-spin-slow" />
            </motion.div>
            <motion.div
              variants={floatingVariants(0.5)}
              animate="animate"
              className="absolute -bottom-4 left-6 w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-md flex items-center justify-center text-primary-cyan"
            >
              <FaServer size={20} />
            </motion.div>
            <motion.div
              variants={floatingVariants(1.5)}
              animate="animate"
              className="absolute bottom-1/3 -left-8 w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-md flex items-center justify-center text-green-500"
            >
              <FaDatabase size={18} />
            </motion.div>
          </motion.div>
        </div>
      </div>

      <a
        href="#about"
        onClick={(e) => handleScrollTo(e, '#about')}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-primary-blue transition-colors cursor-pointer"
      >
        <span>Scroll Down</span>
        <FaChevronDown className="animate-bounce" />
      </a>
    </section>
  );
};

export default Hero;
