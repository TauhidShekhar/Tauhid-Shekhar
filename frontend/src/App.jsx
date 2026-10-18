import React, { useState, useEffect, lazy, Suspense } from 'react';
import AppLoader from './components/common/AppLoader';
import Navbar from './components/Navbar';
import CustomCursor from './components/CustomCursor';
import Hero from './components/Hero';
import { FaChevronUp, FaCircleCheck } from 'react-icons/fa6';
import { FaBrain, FaComments, FaPlus, FaPaperPlane } from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import socket from './services/socket';
import { useAuth } from './contexts/AuthContext';
import { api } from './services/api';
import { useLoading } from './contexts/LoadingContext';
import { useTheme } from './contexts/ThemeContext';

// Lazy load below-the-fold components
const About = lazy(() => import('./components/About'));
const Skills = lazy(() => import('./components/Skills'));
const Projects = lazy(() => import('./components/Projects'));
const Experience = lazy(() => import('./components/Experience'));
const Services = lazy(() => import('./components/Services'));
const Resume = lazy(() => import('./components/Resume'));
const EducationCertificates = lazy(() => import('./components/EducationCertificates'));
const GitHubStats = lazy(() => import('./components/GitHubStats'));
const Contact = lazy(() => import('./components/Contact'));
const Footer = lazy(() => import('./components/Footer'));
const CommandPalette = lazy(() => import('./components/CommandPalette'));

// Skeleton Loader for progressive section mounting
const SectionSkeleton = () => (
  <div className="py-20 px-6 max-w-[1280px] mx-auto w-full flex flex-col gap-6 animate-pulse">
    <div className="h-6 w-32 bg-slate-200 dark:bg-white/10 rounded-full" />
    <div className="h-10 w-64 bg-slate-200 dark:bg-white/10 rounded-full mb-8" />
    <div className="h-40 bg-slate-200 dark:bg-white/5 rounded-3xl w-full" />
  </div>
);

let isInitialFetchStarted = false;

const App = () => {
  const { user } = useAuth();
  const [portfolioData, setPortfolioData] = useState({
    settings: null,
    hero: null,
    about: null,
    skills: [],
    projects: [],
    experiences: [],
    services: [],
    activeResume: null,
    education: [],
    certificates: [],
    achievements: []
  });
  const settings = portfolioData.settings;
  const [showCookieNotice, setShowCookieNotice] = useState(false);

  const { isDark, toggleTheme: contextToggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('home');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [drawerExpanded, setDrawerExpanded] = useState(false);

  // Listen for Ctrl+K global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prefetch remaining lazy-loaded chunks after home loads to make navigation instant
  useEffect(() => {
    const prefetchChunks = () => {
      const chunks = [
        () => import('./components/About'),
        () => import('./components/Skills'),
        () => import('./components/Projects'),
        () => import('./components/Experience'),
        () => import('./components/Services'),
        () => import('./components/Resume'),
        () => import('./components/EducationCertificates'),
        () => import('./components/GitHubStats'),
        () => import('./components/Contact'),
        () => import('./components/Footer')
      ];

      if ('requestIdleCallback' in window) {
        let index = 0;
        const scheduleNext = () => {
          if (index < chunks.length) {
            window.requestIdleCallback(() => {
              chunks[index]().catch(() => {});
              index++;
              setTimeout(scheduleNext, 500); // Stagger chunk imports
            });
          }
        };
        scheduleNext();
      } else {
        // Fallback for Safari / other browsers
        setTimeout(() => {
          Promise.all(chunks.map(c => c().catch(() => {})));
        }, 3000);
      }
    };

    if (document.readyState === 'complete') {
      prefetchChunks();
    } else {
      window.addEventListener('load', prefetchChunks);
      return () => window.removeEventListener('load', prefetchChunks);
    }
  }, []);

  const isFetching = React.useRef(false);

  const fetchPortfolioData = async (showLoader = false) => {
    if (isFetching.current) return;
    isFetching.current = true;
    if (showLoader) setLoading(true);
    try {
      const res = await api.getPortfolioAll();
      if (res && res.success) {
        const d = res.data;
        setPortfolioData({
          settings: d.settings || null,
          hero: d.hero || null,
          about: d.about || null,
          skills: d.skills || [],
          projects: d.projects || [],
          experiences: d.experiences || [],
          services: d.services || [],
          activeResume: d.activeResume || null,
          education: d.education || [],
          certificates: d.certificates || [],
          achievements: d.achievements || []
        });
      }
    } catch (err) {
      console.error('Failed to load portfolio data:', err.message);
    } finally {
      isFetching.current = false;
      setLoading(false);
      // Flag app as loaded after a short delay to permit smooth startup transition
      setTimeout(() => {
        window.isAppLoaded = true;
      }, 100);
    }
  };

  // Fetch initial data on mount
  useEffect(() => {
    if (!isInitialFetchStarted) {
      isInitialFetchStarted = true;
      fetchPortfolioData(true);
    } else {
      // If already started in another strict mode mount, ensure spinner turns off
      setLoading(false);
    }
  }, []);

  // Listen for real-time updates and fetch silently in the background
  useEffect(() => {
    let timeoutId;
    const handleSyncUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fetchPortfolioData(false);
      }, 100);
    };

    window.addEventListener('cms-content-update', handleSyncUpdate);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('cms-content-update', handleSyncUpdate);
    };
  }, []);

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



  const toggleTheme = () => {
    const nextTheme = !isDark;
    contextToggleTheme();
    triggerToast(nextTheme ? 'Dark mode enabled!' : 'Light mode enabled!');
  };





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

  if (loading) {
    return <AppLoader isLoading={loading} />;
  }

  return (
    <>

      {/* Mouse Glow Background Effect */}
      <div className="mouse-glow-bg" />

      {/* Custom Cursor Component (optimized, 0 re-renders) */}
      <CustomCursor />

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
      <Navbar settingsData={portfolioData.settings} activeSection={activeSection} toggleTheme={toggleTheme} isDark={isDark} />

      {/* Main Content Layout */}
      <main className="relative">
        <Hero heroData={portfolioData.hero} resumeData={portfolioData.activeResume} />
        
        <Suspense fallback={<SectionSkeleton />}>
          <About aboutData={portfolioData.about} resumeData={portfolioData.activeResume} />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <Skills skillsData={portfolioData.skills} />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <Projects projectsData={portfolioData.projects} />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <Experience experienceData={portfolioData.experiences} />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <Services servicesData={portfolioData.services} />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <Resume resumeData={portfolioData.activeResume} settingsData={portfolioData.settings} />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <EducationCertificates educationData={portfolioData.education} certificatesData={portfolioData.certificates} achievementsData={portfolioData.achievements} />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <GitHubStats />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <Contact settingsData={portfolioData.settings} aboutData={portfolioData.about} onShowToast={triggerToast} />
        </Suspense>
      </main>

      {/* Footer */}
      <Suspense fallback={null}>
        <Footer settingsData={portfolioData.settings} heroData={portfolioData.hero} />
      </Suspense>

      {/* Floating Actions Drawer */}
      <div className="fixed bottom-4 right-3 sm:bottom-7 sm:right-6 z-[900] flex flex-col gap-2.5 sm:gap-3 items-center">
        {/* Expandable actions list with animation */}
        <div className={`flex flex-col gap-2.5 sm:gap-3 transition-all duration-300 transform ${
          drawerExpanded 
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
            : 'opacity-0 translate-y-4 scale-75 pointer-events-none h-0 overflow-hidden'
        }`}>
          {/* Floating AI Assistant Trigger */}
          <div className="relative group flex items-center justify-end">
            <span className="hidden sm:block absolute right-full mr-2.5 px-2.5 py-1 rounded-lg bg-[#111111] dark:bg-[#1A1A1A] text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg border border-white/10">
              AI Consultant
            </span>
            <button
              onClick={() => navigate('/community/ai-assistant')}
              className="w-11 h-11 sm:w-12 sm:h-12 bg-[#C2272D] hover:bg-[#A51E23] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#C2272D]/25 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer border border-[#C2272D]/40"
              title="Open AI Consultant"
              aria-label="Open AI Consultant"
            >
              <FaBrain size={17} />
            </button>
          </div>

          {/* Floating Community Link */}
          <div className="relative group flex items-center justify-end">
            <span className="hidden sm:block absolute right-full mr-2.5 px-2.5 py-1 rounded-lg bg-[#111111] dark:bg-[#1A1A1A] text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg border border-white/10">
              TS DevCommunity
            </span>
            <Link
              to="/community"
              className="w-11 h-11 sm:w-12 sm:h-12 bg-[#111111] dark:bg-[#1A1A1A] hover:bg-[#1A1A1A] text-[#00FFFF] hover:text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 border border-white/10"
              title="Go to TS DevCommunity"
              aria-label="Go to TS DevCommunity"
            >
              <FaComments size={17} />
            </Link>
          </div>

          {/* Floating Contact Link */}
          <div className="relative group flex items-center justify-end">
            <span className="hidden sm:block absolute right-full mr-2.5 px-2.5 py-1 rounded-lg bg-[#111111] dark:bg-[#1A1A1A] text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg border border-white/10">
              Contact & Inquiries
            </span>
            <a
              href="#contact"
              className="w-11 h-11 sm:w-12 sm:h-12 bg-[#111111] dark:bg-[#1A1A1A] hover:bg-[#C2272D] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 border border-white/10"
              title="Contact & Inquiries"
              aria-label="Contact & Inquiries"
            >
              <FaPaperPlane size={15} />
            </a>
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setDrawerExpanded(prev => !prev)}
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-all duration-300 border ${
            drawerExpanded 
              ? 'bg-[#111111] text-white border-white/20 hover:border-[#C2272D]' 
              : 'bg-[#C2272D] hover:bg-[#A51E23] text-white border-[#C2272D]/40 shadow-lg shadow-[#C2272D]/25 hover:scale-110 active:scale-95'
          }`}
          title={drawerExpanded ? 'Close Quick Actions' : 'Explore Quick Actions'}
          aria-label={drawerExpanded ? 'Close Quick Actions' : 'Explore Quick Actions'}
        >
          <FaPlus 
            size={15} 
            className={`transition-transform duration-300 ${drawerExpanded ? 'rotate-45 text-[#00FFFF]' : 'rotate-0 text-white'}`} 
          />
        </button>

        {/* Back to Top */}
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            className="w-11 h-11 sm:w-12 sm:h-12 bg-[#111111] hover:bg-[#C2272D] text-white rounded-full flex items-center justify-center shadow-lg border border-white/10 hover:border-[#C2272D] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer animate-fade-in"
            aria-label="Scroll back to top"
            title="Back to Top"
          >
            <FaChevronUp size={15} />
          </button>
        )}
      </div>

      {/* Global Command Palette */}
      <Suspense fallback={null}>
        <CommandPalette 
          isOpen={commandPaletteOpen} 
          onClose={() => setCommandPaletteOpen(false)} 
          isDark={isDark} 
          toggleTheme={toggleTheme} 
        />
      </Suspense>

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
              className="px-4 py-2 bg-[#C2272D] hover:bg-[#A51E23] text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
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
