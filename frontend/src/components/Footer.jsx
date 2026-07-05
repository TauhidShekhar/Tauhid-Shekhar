import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  FaHeart, FaGithub, FaLinkedin, FaEnvelope, FaInstagram,
  FaTwitter, FaYoutube, FaFacebook 
} from 'react-icons/fa';

const Footer = () => {
  const [settings, setSettings] = useState(null);
  const [heroSettings, setHeroSettings] = useState(null);

  useEffect(() => {
    const loadAllSettings = async () => {
      try {
        const [settingsRes, heroRes] = await Promise.all([
          api.getSettings(),
          api.getHero()
        ]);
        if (settingsRes.success) {
          setSettings(settingsRes.data);
        }
        if (heroRes.success) {
          setHeroSettings(heroRes.data);
        }
      } catch (err) {
        console.error('Failed to load settings in Footer:', err.message);
      }
    };
    loadAllSettings();
  }, []);

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

  const footerTextVal = settings?.footerText || 'Creative Graphic Designer & Full Stack Web Developer. Bridging logical systems engineering with responsive frontend interfaces.';
  
  // Dynamic social media icons fetched from Hero configuration
  const githubLink = heroSettings?.socialLinks?.github || settings?.socialLinks?.github || 'https://github.com/TauhidShekhar';
  const linkedinLink = heroSettings?.socialLinks?.linkedin || settings?.socialLinks?.linkedin || 'https://www.linkedin.com/in/tauhidshekhar/';
  const instagramLink = heroSettings?.socialLinks?.instagram || settings?.socialLinks?.instagram || 'https://www.instagram.com/tauhidshekhar/';
  const twitterLink = heroSettings?.socialLinks?.twitter;
  const youtubeLink = heroSettings?.socialLinks?.youtube;
  const facebookLink = heroSettings?.socialLinks?.facebook;
  
  const emailLink = settings?.email || heroSettings?.email || 'shekhartauhid@gmail.com';
  const siteName = settings?.siteName || heroSettings?.siteName || 'TAUHID SHEKHAR';

  return (
    <footer className="bg-slate-550/5 dark:bg-[#121214] border-t border-slate-200/50 dark:border-white/5 py-16 text-slate-500 dark:text-slate-400">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-12 items-start text-left">
        
        {/* Brand */}
        <div className="lg:col-span-5 flex flex-col items-start">
          <h3 className="text-xl font-black font-title tracking-wider text-black dark:text-white mb-4">
            {siteName.toUpperCase()}
          </h3>
          <p className="text-sm text-slate-655 dark:text-slate-450 mb-6 max-w-[320px] leading-relaxed">
            {footerTextVal}
          </p>
          <div className="flex items-center gap-4">
            {githubLink && (
              <a
                href={githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 dark:text-slate-400 hover:text-primary-blue transition-colors"
              >
                <FaGithub size={20} />
              </a>
            )}
            {linkedinLink && (
              <a
                href={linkedinLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 dark:text-slate-400 hover:text-primary-blue transition-colors"
              >
                <FaLinkedin size={20} />
              </a>
            )}
            {twitterLink && (
              <a
                href={twitterLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 dark:text-slate-400 hover:text-primary-blue transition-colors"
              >
                <FaTwitter size={20} />
              </a>
            )}
            {instagramLink && (
              <a
                href={instagramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 dark:text-slate-400 hover:text-primary-blue transition-colors"
              >
                <FaInstagram size={20} />
              </a>
            )}
            {youtubeLink && (
              <a
                href={youtubeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 dark:text-slate-400 hover:text-primary-blue transition-colors"
              >
                <FaYoutube size={20} />
              </a>
            )}
            {facebookLink && (
              <a
                href={facebookLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 dark:text-slate-400 hover:text-primary-blue transition-colors"
              >
                <FaFacebook size={20} />
              </a>
            )}
            {emailLink && (
              <a
                href={`mailto:${emailLink}`}
                className="text-slate-600 dark:text-slate-400 hover:text-primary-blue transition-colors"
              >
                <FaEnvelope size={20} />
              </a>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="lg:col-span-3">
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
            Navigation
          </h4>
          <ul className="flex flex-col gap-3">
            <li>
              <a href="#home" onClick={(e) => handleScrollTo(e, '#home')} className="text-sm font-semibold hover:text-primary-blue transition-colors">
                Home
              </a>
            </li>
            <li>
              <a href="#about" onClick={(e) => handleScrollTo(e, '#about')} className="text-sm font-semibold hover:text-primary-blue transition-colors">
                About
              </a>
            </li>
            <li>
              <a href="#skills" onClick={(e) => handleScrollTo(e, '#skills')} className="text-sm font-semibold hover:text-primary-blue transition-colors">
                Skills
              </a>
            </li>
            <li>
              <a href="#projects" onClick={(e) => handleScrollTo(e, '#projects')} className="text-sm font-semibold hover:text-primary-blue transition-colors">
                Projects
              </a>
            </li>
            <li>
              <Link to="/features" className="text-sm font-semibold hover:text-primary-blue transition-colors">
                Features Page
              </Link>
            </li>
          </ul>
        </div>

        {/* Other Sections */}
        <div className="lg:col-span-4">
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
            Highlights
          </h4>
          <ul className="flex flex-col gap-3">
            <li>
              <a href="#experience" onClick={(e) => handleScrollTo(e, '#experience')} className="text-sm font-semibold hover:text-primary-blue transition-colors">
                Experience
              </a>
            </li>
            <li>
              <a href="#resume" onClick={(e) => handleScrollTo(e, '#resume')} className="text-sm font-semibold hover:text-primary-blue transition-colors">
                ATS Resume Panel
              </a>
            </li>
            <li>
              <a href="#education" onClick={(e) => handleScrollTo(e, '#education')} className="text-sm font-semibold hover:text-primary-blue transition-colors">
                Education
              </a>
            </li>
            <li>
              <a href="#services" onClick={(e) => handleScrollTo(e, '#services')} className="text-sm font-semibold hover:text-primary-blue transition-colors">
                Services
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 border-t border-slate-200/50 dark:border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
          <p className="text-xs font-semibold leading-relaxed">
            <span>{settings?.copyrightText || `© ${new Date().getFullYear()} ${siteName}. All Rights Reserved.`}</span>
          </p>
          <div className="flex items-center gap-3 text-xs font-bold">
            <Link to="/legal" className="hover:text-primary-blue transition-colors text-slate-500 dark:text-slate-400">Legal</Link>
            <span className="text-slate-200 dark:text-white/5 font-normal">•</span>
            <Link to="/terms" className="hover:text-primary-blue transition-colors text-slate-500 dark:text-slate-400">Terms</Link>
            <span className="text-slate-200 dark:text-white/5 font-normal">•</span>
            <Link to="/privacy" className="hover:text-primary-blue transition-colors text-slate-500 dark:text-slate-400">Privacy</Link>
          </div>
        </div>
        <p className="text-xs font-bold flex items-center gap-1 leading-relaxed">
          Made with <FaHeart className="text-primary-blue" /> by {siteName}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
