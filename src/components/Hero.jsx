import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { 
  FaGithub, FaLinkedin, FaEnvelope, FaChevronDown, FaCode, FaServer, FaDatabase, FaReact,
  FaTwitter, FaInstagram, FaYoutube, FaFacebook, FaPaperPlane 
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

const Hero = ({ heroData, resumeData }) => {
  const defaultRoles = [
    'Full Stack Developer',
    'MERN Stack Developer',
    'React & Node.js Engineer',
    'UI/UX & Branding Designer',
  ];

  const [roleIndex, setRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [settings, setSettings] = useState(heroData || null);
  const [activeResume, setActiveResume] = useState(resumeData || null);

  const roles = settings?.heroRoles?.length ? settings.heroRoles : defaultRoles;

  useEffect(() => {
    if (heroData) {
      setSettings(heroData);
    }
  }, [heroData]);

  useEffect(() => {
    if (resumeData) {
      setActiveResume(resumeData);
    }
  }, [resumeData]);

  useEffect(() => {
    if (heroData && resumeData) return;
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
  }, [heroData, resumeData]);

  useEffect(() => {
    let timer;
    const currentRole = roles[roleIndex] || '';

    if (isDeleting) {
      timer = setTimeout(() => {
        setDisplayText(currentRole.substring(0, displayText.length - 1));
      }, 45);
    } else {
      timer = setTimeout(() => {
        setDisplayText(currentRole.substring(0, displayText.length + 1));
      }, 90);
    }

    if (!isDeleting && displayText === currentRole) {
      timer = setTimeout(() => setIsDeleting(true), 2200);
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
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const floatingVariants = (delay = 0) => ({
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 4.5,
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
      const offset = 96;
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
  const heroHeading = settings?.heroHeading || 'Hello, I am';
  const siteDescription = settings?.heroDescription || settings?.siteTagline || 'Full Stack Web Developer & Graphic Designer specializing in high-performance web applications, modern responsive interfaces, and scalable REST APIs using React, Node.js, Express, and MongoDB.';
  const heroImg = settings?.heroImage?.url 
    ? `${settings.heroImage.url}?v=${settings.updatedAt ? new Date(settings.updatedAt).getTime() : Date.now()}` 
    : '/assits/Profile_Pic.png';
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

  // Social Links
  const githubLink = settings?.socialLinks?.github || 'https://github.com/TauhidShekhar';
  const linkedinLink = settings?.socialLinks?.linkedin || 'https://www.linkedin.com/in/tauhidshekhar/';
  const twitterLink = settings?.socialLinks?.twitter || '';
  const instagramLink = settings?.socialLinks?.instagram || '';
  const youtubeLink = settings?.socialLinks?.youtube || '';
  const facebookLink = settings?.socialLinks?.facebook || '';
  const emailLink = settings?.email || 'shekhartauhid@gmail.com';

  const showHireMe = settings?.heroCtaButtons?.showHireMe !== false;
  const showContactMe = settings?.heroCtaButtons?.showContactMe !== false;
  const showResume = settings?.heroCtaButtons?.showResume !== false;

  return (
    <section 
      id="home" 
      className="min-h-screen flex items-center justify-center pt-32 sm:pt-36 pb-20 relative overflow-hidden bg-white dark:bg-[#000000]"
    >
      {/* Brand Accent Ambient Blurs */}
      <div className="absolute top-[18%] left-[10%] w-[380px] h-[380px] bg-[#C2272D]/10 dark:bg-[#C2272D]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[420px] h-[420px] bg-[#00FFFF]/10 dark:bg-[#00FFFF]/15 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        
        {/* Left Column: Text & CTAs */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-7 flex flex-col items-start text-left"
        >
          {/* Greeting Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C2272D]/10 dark:bg-[#00FFFF]/10 border border-[#C2272D]/20 dark:border-[#00FFFF]/30 text-[#C2272D] dark:text-[#00FFFF] text-sm font-semibold tracking-wider uppercase mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-[#C2272D] dark:bg-[#00FFFF] animate-ping" />
            <span>{heroHeading}</span>
          </motion.div>

          {/* Primary Name Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-[30px] sm:text-[36px] md:text-[40px] lg:text-[44px] font-bold font-title tracking-tight text-[#171717] dark:text-white mb-3 leading-[1.2]"
          >
            <span>I'm </span>
            <span className="font-serif italic font-semibold text-[#C2272D] drop-shadow-sm">{siteName}</span>
          </motion.h1>

          {/* Dynamic Role Typer */}
          <motion.div
            variants={itemVariants}
            className="h-10 sm:h-12 flex items-center mb-5 text-[20px] sm:text-[24px] md:text-[26px] font-semibold font-title text-[#171717] dark:text-white"
          >
            <span>I build as a&nbsp;</span>
            <span className="text-[#C2272D] dark:text-[#00FFFF]">{displayText}</span>
            <span className="inline-block w-[3px] h-7 sm:h-8 bg-[#C2272D] dark:bg-[#00FFFF] ml-1.5 animate-pulse" />
          </motion.div>

          {/* Bio Description */}
          <motion.p
            variants={itemVariants}
            className="text-base text-[#525252] dark:text-[#D1D5DB] mb-8 max-w-[620px] leading-relaxed"
          >
            {siteDescription}
          </motion.p>

          {/* Primary Action Buttons */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-3.5 mb-9 w-full sm:w-auto">
            {/* Prominent Let's Talk CTA */}
            <a
              href="#contact"
              onClick={(e) => handleScrollTo(e, '#contact')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#C2272D] hover:bg-[#A51E23] text-white rounded-full text-[15px] sm:text-[16px] font-semibold shadow-md shadow-[#C2272D]/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FFFF]"
              aria-label="Let's Talk - Jump to contact section"
            >
              <FaPaperPlane size={15} />
              <span>Let's Talk</span>
            </a>

            {showHireMe && (
              <a
                href="#projects"
                onClick={(e) => handleScrollTo(e, '#projects')}
                className="flex items-center justify-center px-6 py-3 bg-[#F8FAFC] dark:bg-[#1A1A1A] hover:bg-slate-200 dark:hover:bg-white/10 text-[#171717] dark:text-white rounded-full text-[15px] sm:text-[16px] font-semibold border border-[#E5E7EB] dark:border-white/10 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                Explore Projects
              </a>
            )}

            {showResume && resumeLink && (
              <a
                href={resumeLink}
                onClick={handleViewResume}
                className="flex items-center justify-center px-6 py-3 bg-transparent border-2 border-slate-300 dark:border-white/20 hover:border-[#00FFFF] text-[#171717] dark:text-white rounded-full text-[15px] sm:text-[16px] font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                View Resume
              </a>
            )}
          </motion.div>

          {/* Social Links Row */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold tracking-wider uppercase text-slate-500 dark:text-gray-400 mr-1.5">
              Connect:
            </span>
            {githubLink && (
              <a
                href={githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 flex items-center justify-center text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] hover:border-[#C2272D] dark:hover:text-[#00FFFF] dark:hover:border-[#00FFFF] hover:scale-110 shadow-sm transition-all duration-200"
                aria-label="GitHub Profile"
              >
                <FaGithub size={20} />
              </a>
            )}
            {linkedinLink && (
              <a
                href={linkedinLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 flex items-center justify-center text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] hover:border-[#C2272D] dark:hover:text-[#00FFFF] dark:hover:border-[#00FFFF] hover:scale-110 shadow-sm transition-all duration-200"
                aria-label="LinkedIn Profile"
              >
                <FaLinkedin size={20} />
              </a>
            )}
            {twitterLink && (
              <a
                href={twitterLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 flex items-center justify-center text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] hover:border-[#C2272D] dark:hover:text-[#00FFFF] dark:hover:border-[#00FFFF] hover:scale-110 shadow-sm transition-all duration-200"
                aria-label="Twitter Profile"
              >
                <FaTwitter size={20} />
              </a>
            )}
            {instagramLink && (
              <a
                href={instagramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 flex items-center justify-center text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] hover:border-[#C2272D] dark:hover:text-[#00FFFF] dark:hover:border-[#00FFFF] hover:scale-110 shadow-sm transition-all duration-200"
                aria-label="Instagram Profile"
              >
                <FaInstagram size={20} />
              </a>
            )}
            {youtubeLink && (
              <a
                href={youtubeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 flex items-center justify-center text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] hover:border-[#C2272D] dark:hover:text-[#00FFFF] dark:hover:border-[#00FFFF] hover:scale-110 shadow-sm transition-all duration-200"
                aria-label="YouTube Channel"
              >
                <FaYoutube size={20} />
              </a>
            )}
            {facebookLink && (
              <a
                href={facebookLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 flex items-center justify-center text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] hover:border-[#C2272D] dark:hover:text-[#00FFFF] dark:hover:border-[#00FFFF] hover:scale-110 shadow-sm transition-all duration-200"
                aria-label="Facebook Profile"
              >
                <FaFacebook size={20} />
              </a>
            )}
            {emailLink && (
              <a
                href={`mailto:${emailLink}`}
                className="w-12 h-12 rounded-full bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 flex items-center justify-center text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] hover:border-[#C2272D] dark:hover:text-[#00FFFF] dark:hover:border-[#00FFFF] hover:scale-110 shadow-sm transition-all duration-200"
                aria-label="Email Address"
              >
                <FaEnvelope size={20} />
              </a>
            )}
          </motion.div>
        </motion.div>

        {/* Right Column: Headshot & Floating Brand Accents */}
        <div className="lg:col-span-5 flex justify-center relative select-none">
          {/* Main Headshot Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-[300px] h-[390px] sm:w-[340px] sm:h-[440px] rounded-3xl border-4 border-white dark:border-[#222222] shadow-2xl overflow-hidden group bg-slate-100 dark:bg-[#111111]"
          >
            <img
              src={heroImg}
              alt={`${siteName} headshot`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              fetchPriority="high"
              decoding="async"
            />
          </motion.div>

          {/* Floating Technology Pills */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              variants={floatingVariants(0)}
              animate="animate"
              className="absolute -top-4 -left-4 w-14 h-14 rounded-2xl bg-white dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 shadow-xl flex items-center justify-center text-[#C2272D]"
              title="Full Stack Coding"
            >
              <FaCode size={24} />
            </motion.div>

            <motion.div
              variants={floatingVariants(1)}
              animate="animate"
              className="absolute top-1/3 -right-5 w-14 h-14 rounded-2xl bg-white dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 shadow-xl flex items-center justify-center text-[#00FFFF]"
              title="React Ecosystem"
            >
              <FaReact size={26} className="animate-spin-slow" />
            </motion.div>

            <motion.div
              variants={floatingVariants(0.6)}
              animate="animate"
              className="absolute -bottom-4 left-6 w-14 h-14 rounded-2xl bg-white dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 shadow-xl flex items-center justify-center text-[#00FFFF]"
              title="Backend & Cloud APIs"
            >
              <FaServer size={22} />
            </motion.div>

            <motion.div
              variants={floatingVariants(1.4)}
              animate="animate"
              className="absolute bottom-1/3 -left-7 w-14 h-14 rounded-2xl bg-white dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 shadow-xl flex items-center justify-center text-[#C2272D]"
              title="Database Systems"
            >
              <FaDatabase size={22} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <a
        href="#about"
        onClick={(e) => handleScrollTo(e, '#about')}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-[13px] font-semibold uppercase tracking-widest text-[#525252] dark:text-[#9CA3AF] hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors cursor-pointer"
        aria-label="Scroll to About section"
      >
        <span>Scroll Down</span>
        <FaChevronDown className="animate-bounce" size={14} />
      </a>
    </section>
  );
};

export default Hero;
