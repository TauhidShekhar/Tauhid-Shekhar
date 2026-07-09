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
import { FaBrain, FaComments, FaPlus } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import CommandPalette from './components/CommandPalette';
import socket from './services/socket';


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
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('home');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [drawerExpanded, setDrawerExpanded] = useState(true);

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

  // Listen for real-time content updates
  useEffect(() => {
    const handleSyncUpdate = () => {
      // Re-trigger component updates dynamically by updating refreshKey
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('cms-content-update', handleSyncUpdate);

    return () => {
      window.removeEventListener('cms-content-update', handleSyncUpdate);
    };
  }, []);

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

      {/* Nav */}
      <Navbar key={`nav-${refreshKey}`} activeSection={activeSection} toggleTheme={toggleTheme} isDark={isDark} />

      {/* Main Content Layout */}
      <main className="relative">
        <Hero key={`hero-${refreshKey}`} />
        <About key={`about-${refreshKey}`} />
        <Skills key={`skills-${refreshKey}`} />
        <Projects key={`projects-${refreshKey}`} />
        <Experience key={`experience-${refreshKey}`} />
        <Services key={`services-${refreshKey}`} />
        <Resume key={`resume-${refreshKey}`} />
        <EducationCertificates key={`edu-${refreshKey}`} />
        <GitHubStats key={`github-${refreshKey}`} />
        <Contact key={`contact-${refreshKey}`} onShowToast={triggerToast} />
      </main>

      {/* Footer */}
      <Footer key={`footer-${refreshKey}`} />

      {/* Floating Actions Drawer */}
      <div className="fixed bottom-8 right-8 z-[900] flex flex-col gap-4 items-center">
        {/* Expandable actions list with animation */}
        <div className={`flex flex-col gap-4 transition-all duration-300 transform ${
          drawerExpanded 
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
            : 'opacity-0 translate-y-4 scale-75 pointer-events-none h-0 overflow-hidden'
        }`}>
          {/* Floating AI Assistant Trigger */}
          <button
            onClick={() => navigate('/community/ai-assistant')}
            className="w-12 h-12 bg-gradient-to-r from-purple-650 to-indigo-650 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 cursor-pointer border border-purple-500/20"
            title="Open AI Consultant"
          >
            <FaBrain size={18} />
          </button>

          {/* Floating Community Link */}
          <Link
            to="/community"
            className="w-12 h-12 bg-[#121217] hover:bg-[#1e1e28] text-purple-400 hover:text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 border border-white/5"
            title="Go to DevCommunity"
          >
            <FaComments size={18} />
          </Link>

          {/* WhatsApp */}
          <a
            href="https://wa.me/919142725562"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 bg-[#25d366] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 hover:shadow-green-500/20 transition-all duration-300"
            aria-label="Contact via WhatsApp"
            title="WhatsApp Chat"
          >
            <FaWhatsapp size={22} />
          </a>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setDrawerExpanded(prev => !prev)}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-all duration-300 border ${
            drawerExpanded 
              ? 'bg-[#1c1c24] text-slate-400 border-white/5 hover:text-white' 
              : 'bg-gradient-to-r from-purple-650 to-indigo-650 text-white border-purple-500/20 hover:scale-110'
          }`}
          title={drawerExpanded ? 'Hide Actions' : 'Show Actions'}
        >
          <FaPlus 
            size={16} 
            className={`transition-transform duration-300 ${drawerExpanded ? 'rotate-45' : 'rotate-0'}`} 
          />
        </button>

        {/* Back to Top */}
        <button
          onClick={scrollToTop}
          className={`w-12 h-12 bg-primary-blue text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 cursor-pointer ${
            showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
          aria-label="Scroll back to top"
          title="Back to Top"
        >
          <FaChevronUp size={16} />
        </button>
      </div>

      {/* Global Command Palette */}
      <CommandPalette 
        isOpen={commandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)} 
        isDark={isDark} 
        toggleTheme={toggleTheme} 
      />

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
    </>
  );
};

export default App;
