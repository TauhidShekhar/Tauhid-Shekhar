import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  FaHeart, FaGithub, FaLinkedin, FaEnvelope, FaInstagram,
  FaTwitter, FaYoutube, FaFacebook, FaArrowUp, FaPaperPlane,
  FaMapMarkerAlt, FaCode, FaCheckCircle
} from 'react-icons/fa';

const formatExternalLink = (url) => {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^(f|ht)tps?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

const Footer = ({ settingsData, heroData }) => {
  const [settings, setSettings] = useState(settingsData || null);
  const [heroSettings, setHeroSettings] = useState(heroData || null);

  useEffect(() => {
    if (settingsData) {
      setSettings(settingsData);
    }
  }, [settingsData]);

  useEffect(() => {
    if (heroData) {
      setHeroSettings(heroData);
    }
  }, [heroData]);

  useEffect(() => {
    if (settingsData && heroData) return;
    const loadAllSettings = async () => {
      try {
        const [settingsRes, heroRes] = await Promise.all([
          api.getSettings().catch(() => null),
          api.getHero().catch(() => null)
        ]);
        if (settingsRes && settingsRes.success) {
          setSettings(settingsRes.data);
        }
        if (heroRes && heroRes.success) {
          setHeroSettings(heroRes.data);
        }
      } catch (err) {
        console.error('Failed to load settings in Footer:', err.message);
      }
    };
    loadAllSettings();
  }, [settingsData, heroData]);

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

  const footerTextVal = settings?.footerText || 'Creative Graphic Designer & Full-Stack Web Developer. Bridging logical systems engineering with responsive frontend interfaces.';
  
  const githubLink = heroSettings?.socialLinks?.github || settings?.socialLinks?.github || 'https://github.com/TauhidShekhar';
  const linkedinLink = heroSettings?.socialLinks?.linkedin || settings?.socialLinks?.linkedin || 'https://www.linkedin.com/in/tauhidshekhar/';
  const instagramLink = heroSettings?.socialLinks?.instagram || settings?.socialLinks?.instagram || 'https://www.instagram.com/tauhidshekhar/';
  const twitterLink = heroSettings?.socialLinks?.twitter || settings?.socialLinks?.twitter;
  const youtubeLink = heroSettings?.socialLinks?.youtube || settings?.socialLinks?.youtube;
  const facebookLink = heroSettings?.socialLinks?.facebook || settings?.socialLinks?.facebook;
  
  const emailLink = settings?.email || heroSettings?.email || 'shekhartauhid@gmail.com';
  const siteName = settings?.siteName || heroSettings?.siteName || 'TAUHID SHEKHAR';

  return (
    <footer className="bg-white dark:bg-[#000000] border-t border-[#E5E7EB] dark:border-white/10 pt-16 pb-12 text-[#525252] dark:text-[#D1D5DB] transition-colors duration-300">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 md:gap-12 pb-14 border-b border-[#E5E7EB] dark:border-white/10 items-start text-left">
          
          {/* Brand Column (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <Link to="/" className="flex items-center gap-3.5 mb-5 group">
              {/* Light Mode Crowned TS Logo */}
              <img 
                src="/assits/ts-logo-red.jpg" 
                alt="Tauhid Shekhar TS Logo" 
                className="w-11 h-11 rounded-xl object-contain shadow-sm border border-slate-200 dark:hidden"
              />
              {/* Dark Mode Crowned TS Logo */}
              <img 
                src="/assits/ts-logo-dark.jpg" 
                alt="Tauhid Shekhar TS Logo" 
                className="w-11 h-11 rounded-xl object-contain shadow-sm border border-white/10 hidden dark:block"
              />
              <div className="flex flex-col text-left">
                <span className="font-title font-black text-xl tracking-tight text-[#171717] dark:text-white leading-none">
                  {siteName.toUpperCase()}
                </span>
                <span className="text-[11px] font-bold tracking-widest text-[#525252] dark:text-[#D1D5DB] mt-1 uppercase flex items-center gap-1.5">
                  DEVELOPER <span className="text-[#00FFFF] font-black">|</span> CREATOR <span className="text-[#00FFFF] font-black">|</span> LEARNER
                </span>
              </div>
            </Link>

            <p className="text-[15px] sm:text-base text-[#525252] dark:text-[#D1D5DB] mb-5 max-w-[380px] leading-relaxed">
              {footerTextVal}
            </p>

            {/* Availability Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Available for freelance projects & full-time roles</span>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {githubLink && (
                <a
                  href={formatExternalLink(githubLink)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub Profile"
                  className="w-10 h-10 rounded-xl bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 flex items-center justify-center text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] hover:border-[#C2272D] dark:hover:text-[#00FFFF] dark:hover:border-[#00FFFF] transition-all hover:scale-110"
                >
                  <FaGithub size={18} />
                </a>
              )}
              {linkedinLink && (
                <a
                  href={formatExternalLink(linkedinLink)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn Profile"
                  className="w-10 h-10 rounded-xl bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 flex items-center justify-center text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] hover:border-[#C2272D] dark:hover:text-[#00FFFF] dark:hover:border-[#00FFFF] transition-all hover:scale-110"
                >
                  <FaLinkedin size={18} />
                </a>
              )}
              {instagramLink && (
                <a
                  href={formatExternalLink(instagramLink)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram Profile"
                  className="w-10 h-10 rounded-xl bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 flex items-center justify-center text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] hover:border-[#C2272D] dark:hover:text-[#00FFFF] dark:hover:border-[#00FFFF] transition-all hover:scale-110"
                >
                  <FaInstagram size={18} />
                </a>
              )}
              {twitterLink && (
                <a
                  href={formatExternalLink(twitterLink)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter Profile"
                  className="w-10 h-10 rounded-xl bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 flex items-center justify-center text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] hover:border-[#C2272D] dark:hover:text-[#00FFFF] dark:hover:border-[#00FFFF] transition-all hover:scale-110"
                >
                  <FaTwitter size={18} />
                </a>
              )}
              {youtubeLink && (
                <a
                  href={formatExternalLink(youtubeLink)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube Channel"
                  className="w-10 h-10 rounded-xl bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 flex items-center justify-center text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] hover:border-[#C2272D] dark:hover:text-[#00FFFF] dark:hover:border-[#00FFFF] transition-all hover:scale-110"
                >
                  <FaYoutube size={18} />
                </a>
              )}
              {facebookLink && (
                <a
                  href={formatExternalLink(facebookLink)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook Profile"
                  className="w-10 h-10 rounded-xl bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 flex items-center justify-center text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] hover:border-[#C2272D] dark:hover:text-[#00FFFF] dark:hover:border-[#00FFFF] transition-all hover:scale-110"
                >
                  <FaFacebook size={18} />
                </a>
              )}
              {emailLink && (
                <a
                  href={`mailto:${emailLink}`}
                  aria-label="Send Email"
                  className="w-10 h-10 rounded-xl bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 flex items-center justify-center text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] hover:border-[#C2272D] dark:hover:text-[#00FFFF] dark:hover:border-[#00FFFF] transition-all hover:scale-110"
                >
                  <FaEnvelope size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Navigation (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs sm:text-sm font-semibold text-[#171717] dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C2272D]" />
              Navigation
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <a 
                  href="#home" 
                  onClick={(e) => handleScrollTo(e, '#home')} 
                  className="text-[15px] sm:text-[16px] font-normal text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a 
                  href="#about" 
                  onClick={(e) => handleScrollTo(e, '#about')} 
                  className="text-[15px] sm:text-[16px] font-normal text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors"
                >
                  About TS
                </a>
              </li>
              <li>
                <a 
                  href="#projects" 
                  onClick={(e) => handleScrollTo(e, '#projects')} 
                  className="text-[15px] sm:text-[16px] font-normal text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors"
                >
                  Featured Projects
                </a>
              </li>
              <li>
                <a 
                  href="#experience" 
                  onClick={(e) => handleScrollTo(e, '#experience')} 
                  className="text-[15px] sm:text-[16px] font-normal text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors"
                >
                  Work Experience
                </a>
              </li>
              <li>
                <a 
                  href="#contact" 
                  onClick={(e) => handleScrollTo(e, '#contact')} 
                  className="text-[15px] sm:text-[16px] font-normal text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors"
                >
                  Contact & Inquiries
                </a>
              </li>
            </ul>
          </div>

          {/* Highlights & Resources (4 cols) */}
          <div className="lg:col-span-4">
            <h4 className="text-xs sm:text-sm font-semibold text-[#171717] dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FFFF]" />
              Highlights & Community
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <a 
                  href="#skills" 
                  onClick={(e) => handleScrollTo(e, '#skills')} 
                  className="text-[15px] sm:text-[16px] font-normal text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors"
                >
                  Tech Skills & Stack
                </a>
              </li>
              <li>
                <a 
                  href="#services" 
                  onClick={(e) => handleScrollTo(e, '#services')} 
                  className="text-[15px] sm:text-[16px] font-normal text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors"
                >
                  Design & Dev Services
                </a>
              </li>
              <li>
                <a 
                  href="#resume" 
                  onClick={(e) => handleScrollTo(e, '#resume')} 
                  className="text-[15px] sm:text-[16px] font-normal text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors"
                >
                  ATS Resume & Verification
                </a>
              </li>
              <li>
                <a 
                  href="#education" 
                  onClick={(e) => handleScrollTo(e, '#education')} 
                  className="text-[15px] sm:text-[16px] font-normal text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors"
                >
                  Education & Certifications
                </a>
              </li>
              <li>
                <Link 
                  to="/community" 
                  className="text-[15px] sm:text-[16px] font-normal text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors inline-flex items-center gap-2"
                >
                  <span>TS Developer Community & Blog</span>
                  <span className="px-2 py-0.5 text-[10px] uppercase font-semibold rounded-full bg-[#C2272D]/10 text-[#C2272D] dark:bg-[#00FFFF]/10 dark:text-[#00FFFF]">
                    Active
                  </span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-7 flex flex-col md:flex-row items-center justify-between gap-5 text-sm">
          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-7">
            <p className="text-sm font-normal text-[#525252] dark:text-[#D1D5DB]">
              {settings?.copyrightText || `© ${new Date().getFullYear()} ${siteName}. All Rights Reserved.`}
            </p>
            <div className="flex items-center gap-3 text-sm font-medium">
              <Link to="/legal" className="hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors text-[#525252] dark:text-[#D1D5DB]">
                Legal Notice
              </Link>
              <span className="text-[#E5E7EB] dark:text-white/20">•</span>
              <Link to="/terms" className="hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors text-[#525252] dark:text-[#D1D5DB]">
                Terms of Service
              </Link>
              <span className="text-[#E5E7EB] dark:text-white/20">•</span>
              <Link to="/privacy" className="hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors text-[#525252] dark:text-[#D1D5DB]">
                Privacy Policy
              </Link>
            </div>
          </div>

          <p className="text-sm font-medium flex items-center gap-1.5 text-[#525252] dark:text-[#D1D5DB]">
            Designed & Engineered with <FaHeart className="text-[#C2272D] animate-pulse" /> by {siteName}
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
