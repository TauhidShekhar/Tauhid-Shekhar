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
  const [activeSection, setActiveSection] = useState('home');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(true);

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
    </>
  );
};

export default App;
