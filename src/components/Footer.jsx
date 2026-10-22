import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  FaHeart, FaGithub, FaLinkedin, FaEnvelope, FaInstagram,
  FaTwitter, FaYoutube, FaFacebook, FaArrowUp
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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const footerTextVal = settings?.footerText || settings?.siteTagline || heroSettings?.siteTagline || 'Full Stack Web Developer & Graphic Designer crafting robust web architectures, scalable backend solutions, and pixel-perfect digital experiences.';
  
  const githubLink = heroSettings?.socialLinks?.github || settings?.socialLinks?.github;
  const linkedinLink = heroSettings?.socialLinks?.linkedin || settings?.socialLinks?.linkedin;
  const instagramLink = heroSettings?.socialLinks?.instagram || settings?.socialLinks?.instagram;
  const twitterLink = heroSettings?.socialLinks?.twitter || settings?.socialLinks?.twitter;
  const youtubeLink = heroSettings?.socialLinks?.youtube || settings?.socialLinks?.youtube;
  const facebookLink = heroSettings?.socialLinks?.facebook || settings?.socialLinks?.facebook;
  
  const emailLink = settings?.email || heroSettings?.email || 'shekhartauhid@gmail.com';
  const siteName = settings?.siteName || heroSettings?.siteName || 'TAUHID SHEKHAR';

  return (
    <footer className="bg-white/80 dark:bg-[#000000]/50 border-t border-[#E5E7EB] dark:border-white/10 pt-14 sm:pt-16 pb-24 sm:pb-14 text-[#525252] dark:text-[#D1D5DB] transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 pb-10 sm:pb-14 border-b border-[#E5E7EB] dark:border-white/10 items-start text-left">
          
          {/* Brand Column (Full width on mobile, 5 cols on lg) */}
          <div className="sm:col-span-2 lg:col-span-5 flex flex-col items-start">
            <Link to="/" className="flex items-center gap-3 sm:gap-3.5 mb-4 sm:mb-5 group">
              {/* Light Mode Crowned TS Logo */}
              <img 
                src="/assits/ts-logo-red.jpg" 
                alt="Tauhid Shekhar TS Logo" 
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-contain shadow-sm border border-slate-200 dark:hidden"
              />
              {/* Dark Mode Crowned TS Logo */}
              <img 
                src="/assits/ts-logo-dark.jpg" 
                alt="Tauhid Shekhar TS Logo" 
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-contain shadow-sm border border-white/10 hidden dark:block"
              />
              <div className="flex flex-col text-left">
                <span className="font-title font-black text-lg sm:text-xl tracking-tight text-[#171717] dark:text-white leading-none">
                  {siteName.toUpperCase()}
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-[#525252] dark:text-[#D1D5DB] mt-1 uppercase flex items-center gap-1.5">
                  DEVELOPER <span className="text-[#00FFFF] font-black">|</span> CREATOR <span className="text-[#00FFFF] font-black">|</span> LEARNER
                </span>
              </div>
            </Link>

            <p className="text-sm sm:text-base text-[#525252] dark:text-[#D1D5DB] mb-4 sm:mb-5 max-w-[420px] leading-relaxed">
              {footerTextVal}
            </p>

            {/* Availability Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-5 sm:mb-6 max-w-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="truncate sm:whitespace-normal">Available for freelance & full-time roles</span>
            </div>

            {/* Social Icons with Touch Targets */}
            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
              {githubLink && (
                <a
                  href={formatExternalLink(githubLink)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub Profile"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 flex items-center justify-center text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] hover:border-[#C2272D] dark:hover:text-[#00FFFF] dark:hover:border-[#00FFFF] transition-all hover:scale-110 active:scale-95 shadow-sm"
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
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 flex items-center justify-center text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] hover:border-[#C2272D] dark:hover:text-[#00FFFF] dark:hover:border-[#00FFFF] transition-all hover:scale-110 active:scale-95 shadow-sm"
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
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 flex items-center justify-center text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] hover:border-[#C2272D] dark:hover:text-[#00FFFF] dark:hover:border-[#00FFFF] transition-all hover:scale-110 active:scale-95 shadow-sm"
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
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 flex items-center justify-center text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] hover:border-[#C2272D] dark:hover:text-[#00FFFF] dark:hover:border-[#00FFFF] transition-all hover:scale-110 active:scale-95 shadow-sm"
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
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 flex items-center justify-center text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] hover:border-[#C2272D] dark:hover:text-[#00FFFF] dark:hover:border-[#00FFFF] transition-all hover:scale-110 active:scale-95 shadow-sm"
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
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 flex items-center justify-center text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] hover:border-[#C2272D] dark:hover:text-[#00FFFF] dark:hover:border-[#00FFFF] transition-all hover:scale-110 active:scale-95 shadow-sm"
                >
                  <FaFacebook size={18} />
                </a>
              )}
              {emailLink && (
                <a
                  href={`mailto:${emailLink}`}
                  aria-label="Send Email"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 flex items-center justify-center text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] hover:border-[#C2272D] dark:hover:text-[#00FFFF] dark:hover:border-[#00FFFF] transition-all hover:scale-110 active:scale-95 shadow-sm"
                >
                  <FaEnvelope size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="sm:col-span-1 lg:col-span-3">
            <h4 className="text-xs sm:text-sm font-semibold text-[#171717] dark:text-white uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C2272D]" />
              Navigation
            </h4>
            <ul className="flex flex-col gap-2 sm:gap-2.5">
              <li>
                <a 
                  href="#home" 
                  onClick={(e) => handleScrollTo(e, '#home')} 
                  className="text-sm sm:text-base font-normal text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors py-1 inline-block"
                >
                  Home
                </a>
              </li>
              <li>
                <a 
                  href="#about" 
                  onClick={(e) => handleScrollTo(e, '#about')} 
                  className="text-sm sm:text-base font-normal text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors py-1 inline-block"
                >
                  About TS
                </a>
              </li>
              <li>
                <a 
                  href="#projects" 
                  onClick={(e) => handleScrollTo(e, '#projects')} 
                  className="text-sm sm:text-base font-normal text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors py-1 inline-block"
                >
                  Featured Projects
                </a>
              </li>
              <li>
                <a 
                  href="#experience" 
                  onClick={(e) => handleScrollTo(e, '#experience')} 
                  className="text-sm sm:text-base font-normal text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors py-1 inline-block"
                >
                  Work Experience
                </a>
              </li>
              <li>
                <a 
                  href="#contact" 
                  onClick={(e) => handleScrollTo(e, '#contact')} 
                  className="text-sm sm:text-base font-normal text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors py-1 inline-block"
                >
                  Contact & Inquiries
                </a>
              </li>
              <li>
                <Link 
                  to="/forms" 
                  className="text-sm sm:text-base font-normal text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors py-1 inline-flex items-center gap-2"
                >
                  <span>Forms Center</span>
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#C2272D]/10 text-[#C2272D] dark:bg-[#00FFFF]/15 dark:text-[#00FFFF]">Hub</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Highlights & Resources */}
          <div className="sm:col-span-1 lg:col-span-4">
            <h4 className="text-xs sm:text-sm font-semibold text-[#171717] dark:text-white uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FFFF]" />
              Highlights & Community
            </h4>
            <ul className="flex flex-col gap-2 sm:gap-2.5">
              <li>
                <a 
                  href="#skills" 
                  onClick={(e) => handleScrollTo(e, '#skills')} 
                  className="text-sm sm:text-base font-normal text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors py-1 inline-block"
                >
                  Tech Skills & Stack
                </a>
              </li>
              <li>
                <a 
                  href="#services" 
                  onClick={(e) => handleScrollTo(e, '#services')} 
                  className="text-sm sm:text-base font-normal text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors py-1 inline-block"
                >
                  Design & Dev Services
                </a>
              </li>
              <li>
                <a 
                  href="#resume" 
                  onClick={(e) => handleScrollTo(e, '#resume')} 
                  className="text-sm sm:text-base font-normal text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors py-1 inline-block"
                >
                  ATS Resume & Verification
                </a>
              </li>
              <li>
                <a 
                  href="#education" 
                  onClick={(e) => handleScrollTo(e, '#education')} 
                  className="text-sm sm:text-base font-normal text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors py-1 inline-block"
                >
                  Education & Certifications
                </a>
              </li>
              <li>
                <Link 
                  to="/forms" 
                  className="text-sm sm:text-base font-normal text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors py-1 inline-flex items-center gap-2"
                >
                  <span>Forms & Applications Directory</span>
                  <span className="px-2 py-0.5 text-[10px] uppercase font-semibold rounded-full bg-[#00FFFF]/10 text-[#00FFFF]">
                    New
                  </span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/community" 
                  className="text-sm sm:text-base font-normal text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors py-1 inline-flex items-center gap-2"
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

        {/* Bottom Bar: Copyright, Legal Links, and Attribution */}
        <div className="pt-6 sm:pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-2 sm:gap-4 md:gap-6">
            <p className="font-normal text-[#525252] dark:text-[#D1D5DB]">
              {settings?.copyrightText || `© ${new Date().getFullYear()} ${siteName}. All Rights Reserved.`}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-medium">
              <Link to="/legal" className="hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors text-[#525252] dark:text-[#D1D5DB]">
                Legal Notice
              </Link>
              <span className="text-[#E5E7EB] dark:text-white/20 select-none">•</span>
              <Link to="/terms" className="hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors text-[#525252] dark:text-[#D1D5DB]">
                Terms of Service
              </Link>
              <span className="text-[#E5E7EB] dark:text-white/20 select-none">•</span>
              <Link to="/privacy" className="hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors text-[#525252] dark:text-[#D1D5DB]">
                Privacy Policy
              </Link>
            </div>
          </div>

          <p className="font-medium inline-flex items-center justify-center flex-wrap gap-1.5 text-[#525252] dark:text-[#D1D5DB] text-center">
            <span>Designed & Engineered with</span>
            <FaHeart className="text-[#C2272D] animate-pulse inline mx-0.5 shrink-0" />
            <span className="whitespace-nowrap">by {siteName}</span>
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
