import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ParticlesBackground from './components/ParticlesBackground';
import CustomCursor from './components/CustomCursor';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Services from './components/Services';
import Resume from './components/Resume';
import EducationCertificates from './components/EducationCertificates';
import GitHubStats from './components/GitHubStats';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { FaWhatsapp, FaChevronUp, FaCircleCheck } from 'react-icons/fa6';
import { useAuth } from './contexts/AuthContext';
import { api } from './services/api';

const App = () => {
  const [isDark, setIsDark] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return savedTheme === 'dark' || (!savedTheme && systemDark);
    } catch (_) {
      return false;
    }
  });
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [showCookieNotice, setShowCookieNotice] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeSection, setActiveSection] = useState('home');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch settings dynamically
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.getSettings();
        if (res.success) {
          setSettings(res.data);
        }
      } catch (err) {
        console.error('Failed to load settings in App:', err.message);
      }
    };
    fetchSettings();
  }, [refreshKey]);

  // Cookie notice check
  useEffect(() => {
    try {
      const accepted = localStorage.getItem('cookies-accepted');
      if (!accepted) {
        setShowCookieNotice(true);
      }
    } catch (_) {}
  }, []);

  const handleAcceptCookies = () => {
    try {
      localStorage.setItem('cookies-accepted', 'true');
    } catch (_) {}
    setShowCookieNotice(false);
  };

  // Inject custom footer scripts dynamically
  useEffect(() => {
    if (!settings?.customFooterScripts) return;
    
    const existing = document.getElementById('custom-footer-scripts');
    if (existing) existing.remove();

    const container = document.createElement('div');
    container.id = 'custom-footer-scripts';
    container.innerHTML = settings.customFooterScripts;
    document.body.appendChild(container);
    
    const scripts = container.getElementsByTagName('script');
    Array.from(scripts).forEach(oldScript => {
      const newScript = document.createElement('script');
      newScript.text = oldScript.text;
      Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
      document.body.appendChild(newScript);
    });

    return () => {
      const el = document.getElementById('custom-footer-scripts');
      if (el) el.remove();
    };
  }, [settings?.customFooterScripts]);

  // Maintenance or Platform Offline check (with Admin bypass)
  if (settings) {
    const isMaintenance = settings.maintenanceMode;
    const isOffline = settings.websiteStatus?.enabled === false;
    const isAdmin = user?.role === 'Admin';

    if ((isMaintenance || isOffline) && !isAdmin) {
      return (
        <div className="min-h-screen bg-[#09090c] text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="max-w-md w-full glass p-8 md:p-10 rounded-3xl border border-white/5 text-center flex flex-col items-center gap-6 relative z-10 shadow-2xl shadow-black/40">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              {isOffline ? 'Platform Offline' : 'Upgrades In Progress'}
            </div>

            <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center relative shadow-lg shadow-purple-500/5">
              <svg className="w-10 h-10 text-purple-400 animate-spin" style={{ animationDuration: '8s' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>

            <div>
              <h1 className="text-xl md:text-2xl font-black font-title tracking-tight text-white uppercase">
                {isOffline ? 'Temporarily Offline' : 'Under Maintenance'}
              </h1>
              <p className="text-slate-400 text-xs mt-3 leading-relaxed">
                {isOffline 
                  ? 'This portfolio is currently deactivated by the administrator. Please check back later.' 
                  : 'We are performing scheduled upgrades to deploy new features and optimize performance. We will be back online shortly.'}
              </p>
            </div>

            {(settings.email || settings.phone) && (
              <div className="w-full border-t border-white/5 pt-5 flex flex-col gap-2.5 text-xs text-left">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Support Contact</span>
                {settings.email && (
                  <div className="flex justify-between items-center bg-slate-900/50 p-2.5 rounded-xl border border-white/5">
                    <span className="text-slate-400">Email</span>
                    <a href={`mailto:${settings.email}`} className="font-bold text-purple-400 hover:underline">{settings.email}</a>
                  </div>
                )}
                {settings.phone && (
                  <div className="flex justify-between items-center bg-slate-900/50 p-2.5 rounded-xl border border-white/5">
                    <span className="text-slate-400">Phone</span>
                    <span className="font-bold text-slate-350">{settings.phone}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }
  }

  // 1. Theme Configuration
  useEffect(() => {
    // End loading screen
    const loadTimer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(loadTimer);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('darkmode');
      document.body.classList.add('darkmode');
      localStorage.setItem('theme', 'dark');
      triggerToast('Dark mode enabled!');
    } else {
      document.documentElement.classList.remove('darkmode');
      document.body.classList.remove('darkmode');
      localStorage.setItem('theme', 'light');
      triggerToast('Light mode enabled!');
    }
  };



  // 3. Scroll Event Listeners (Active menu and Back-to-Top CTA)
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      setShowBackToTop(scrollPos > 400);

      // Section intersection observer
      const sections = ['home', 'about', 'skills', 'projects', 'experience', 'education', 'resume', 'certificates', 'testimonials', 'blog', 'faq', 'contact'];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop - 120;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const triggerToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <>
      {/* Pre-loader loading screen */}
      {loading && (
        <div className="fixed inset-0 bg-slate-50 dark:bg-black z-[10000] flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200/80 dark:border-white/5 border-t-primary-blue animate-spin" />
        </div>
      )}

      {/* Mouse Glow Background Effect */}
      <div className="mouse-glow-bg" />

      {/* Custom Cursor Component (optimized, 0 re-renders) */}
      <CustomCursor />

      {/* Interactive Node Background */}
      <ParticlesBackground />

      {/* Announcement Banner */}
      {settings?.announcementBanner?.show && settings?.announcementBanner?.text && (
        <div className="bg-gradient-to-r from-purple-650 to-indigo-650 text-white text-xs font-bold text-center py-2.5 px-4 relative z-[9999] flex items-center justify-center gap-2">
          <span>{settings.announcementBanner.text}</span>
          {settings.announcementBanner.link && (
            <a href={settings.announcementBanner.link} className="underline hover:text-purple-200 transition-colors">
              Learn More &rarr;
            </a>
          )}
        </div>
      )}

      {/* Nav */}
      <Navbar activeSection={activeSection} toggleTheme={toggleTheme} isDark={isDark} />

      {/* Main Content Layout */}
      <main className="relative">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Services />
        <Resume />
        <EducationCertificates />
        <GitHubStats />
        <Contact onShowToast={triggerToast} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Actions CTA */}
      <div className="fixed bottom-8 right-8 z-[900] flex flex-col gap-4">
        {/* WhatsApp */}
        <a
          href="https://wa.me/919142725562"
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 bg-[#25d366] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 hover:shadow-green-500/20 transition-all duration-300"
          aria-label="Contact via WhatsApp"
        >
          <FaWhatsapp size={22} />
        </a>

        {/* Back to Top */}
        <button
          onClick={scrollToTop}
          className={`w-12 h-12 bg-primary-blue text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 cursor-pointer ${
            showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
          aria-label="Scroll back to top"
        >
          <FaChevronUp size={16} />
        </button>
      </div>

      {/* Toast Notifications */}
      <div
        className={`fixed bottom-8 left-8 z-[1001] glass px-6 py-4 rounded-2xl flex items-center gap-3.5 shadow-xl border border-slate-100 dark:border-white/5 transition-all duration-300 transform ${
          showToast ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
        }`}
      >
        <FaCircleCheck className="text-green-500" size={20} />
        <span className="text-sm font-bold text-black dark:text-white font-title">
          {toastMessage}
        </span>
      </div>

      {/* Cookie Notice Banner */}
      {settings?.cookieSettings?.show && showCookieNotice && (
        <div className="fixed bottom-6 left-6 max-w-sm glass p-5 rounded-2xl border border-white/5 shadow-2xl z-[99999] flex flex-col gap-3 text-left animate-slide-up">
          <p className="text-xs text-slate-350 leading-relaxed">
            {settings.cookieSettings.text || 'We use cookies to improve your user experience and secure session auth.'}
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={handleAcceptCookies}
              className="px-4 py-2 bg-primary-blue hover:bg-accent-blue text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Accept All
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
