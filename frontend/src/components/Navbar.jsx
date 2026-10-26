import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../services/api';
import { 
  FaHome, FaUser, FaCode, FaBriefcase, FaBookOpen, FaEnvelope,
  FaSun, FaMoon, FaBars, FaTimes, FaChevronRight,
  FaSignOutAlt, FaTachometerAlt, FaChevronDown,
  FaGlobe, FaCog, FaSignInAlt, FaWpforms, FaLaptopCode
} from 'react-icons/fa';

const Navbar = ({ activeSection, toggleTheme: propsToggleTheme, isDark: propsIsDark, settingsData }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark: contextIsDark, toggleTheme: contextToggleTheme } = useTheme();
  const isDark = propsIsDark !== undefined ? propsIsDark : contextIsDark;
  const toggleTheme = propsToggleTheme || contextToggleTheme;
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [settings, setSettings] = useState(settingsData || null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const scrollIntervalRef = useRef(null);

  useEffect(() => {
    if (settingsData) {
      setSettings(settingsData);
    }
  }, [settingsData]);

  useEffect(() => {
    if (settingsData) return;
    const loadSettings = async () => {
      try {
        const res = await api.getSettings();
        if (res.success) {
          setSettings(res.data);
        }
      } catch (err) {
        console.error('Failed to load settings in Navbar:', err.message);
      }
    };
    loadSettings();
  }, [settingsData]);

  // Handle outside clicks for account profile dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownOpen && !e.target.closest('.profile-dropdown-container')) {
        setDropdownOpen(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [dropdownOpen]);

  // Scroll detection for navbar elevation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard escape listener to close mobile menu or profile dropdown
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (dropdownOpen) setDropdownOpen(false);
        if (isOpen) setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, dropdownOpen]);

  // Lock background scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Original, clean primary navigation links
  const navItems = [
    { name: 'Home', href: '#home', icon: FaHome },
    { name: 'About', href: '#about', icon: FaUser },
    { name: 'Projects', href: '#projects', icon: FaCode },
    { name: 'Services', to: '/services', icon: FaLaptopCode },
    { name: 'Experience', href: '#experience', icon: FaBriefcase },
    { name: 'Forms', to: '/forms', icon: FaWpforms },
    { name: 'Community', to: '/community', icon: FaBookOpen },
    { name: 'Contact', href: '#contact', icon: FaEnvelope }
  ];

  // Guaranteed direct scroll function that handles lazy-loading smoothly without locking the user
  const performDirectScroll = (targetId) => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let attempts = 0;
    const maxAttempts = 8;
    let userScrolled = false;

    const stopScroll = () => {
      userScrolled = true;
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
      window.removeEventListener('wheel', stopScroll);
      window.removeEventListener('touchmove', stopScroll);
    };

    window.addEventListener('wheel', stopScroll, { passive: true });
    window.addEventListener('touchmove', stopScroll, { passive: true });

    const executeScroll = () => {
      if (userScrolled) {
        stopScroll();
        return;
      }

      const el = document.getElementById(targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        const targetTop = rect.top + window.pageYOffset - 80;
        window.scrollTo({
          top: Math.max(0, targetTop),
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });

        if (Math.abs(rect.top - 80) <= 30 || attempts >= 3) {
          stopScroll();
          return;
        }
      }

      attempts++;
      if (attempts >= maxAttempts) {
        stopScroll();
      }
    };

    // First attempt immediately
    executeScroll();

    // Brief check for lazy components without fighting the user
    scrollIntervalRef.current = setInterval(executeScroll, 200);
    setTimeout(stopScroll, 800);
  };

  // Nav click handler for both same-page and cross-page anchor navigation
  const handleNavClick = (e, href) => {
    if (e) e.preventDefault();
    setIsOpen(false);
    setDropdownOpen(false);

    const targetId = href.replace(/^#/, '');

    // Cross-page navigation: If on another route, navigate to / with target section
    if (location.pathname !== '/') {
      navigate('/' + href, { state: { scrollTo: href } });
      return;
    }

    // Same-page: Scroll directly and securely to the target section
    performDirectScroll(targetId);
    window.history.pushState(null, '', href);
  };

  const AdminLink = ({ to, children, className }) => {
    return (
      <Link to={to} onClick={() => { setDropdownOpen(false); setIsOpen(false); }} className={className}>
        {children}
      </Link>
    );
  };

  // Logo asset based on theme
  const logoSrc = isDark ? '/assits/ts-logo-dark.jpg' : '/assits/ts-logo-red.jpg';

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-[999] transition-all duration-300 border-b ${
        isDark
          ? 'bg-[#000000]/95 border-white/10 shadow-lg shadow-black/40'
          : 'bg-[#FFFFFF]/95 border-[#E5E7EB] shadow-sm shadow-slate-200/50'
      } ${scrolled ? 'backdrop-blur-md' : 'backdrop-blur-sm'}`}
    >
      <nav
        aria-label="Main Navigation"
        className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className={`flex items-center justify-between gap-4 transition-all duration-200 ${scrolled ? 'py-2 sm:py-2.5' : 'py-3 sm:py-3.5'}`}>
          
          {/* ── Brand Logo & Text (Left) ── */}
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, '#home')}
            className="flex items-center gap-2.5 sm:gap-3 shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FFFF] rounded-xl cursor-pointer"
            aria-label="Tauhid Shekhar Home"
          >
            <img
              src={logoSrc}
              alt="Tauhid Shekhar TS Logo"
              className="w-9 h-9 xs:w-10 xs:h-10 sm:w-11 sm:h-11 rounded-xl object-cover shadow-sm transition-transform duration-200 group-hover:scale-105 shrink-0"
            />
            <div className="flex flex-col text-left justify-center">
              <div className="flex items-center text-[15px] xs:text-base sm:text-lg md:text-xl font-black font-title tracking-tight leading-none">
                <span className={isDark ? 'text-white' : 'text-[#171717]'}>TAUHID&nbsp;</span>
                <span className="text-[#C2272D]">SHEKHAR</span>
              </div>
              <span className="text-[8px] xs:text-[9px] sm:text-[10px] font-bold tracking-wider sm:tracking-widest uppercase text-[#525252] dark:text-[#9CA3AF] mt-1 sm:mt-1.5 flex items-center gap-1 sm:gap-1.5 whitespace-nowrap select-none">
                DEVELOPER <span className="text-[#00FFFF] font-black">|</span> CREATOR <span className="text-[#00FFFF] font-black">|</span> LEARNER
              </span>
            </div>
          </a>

          {/* ── Desktop Primary Links (Center) ── */}
          <ul className="hidden xl:flex items-center gap-1 2xl:gap-2 mx-auto" role="menubar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isItemActive = item.href 
                ? ((activeSection === item.href.substring(1) && location.pathname === '/') || (item.name === 'Forms' && location.pathname.startsWith('/forms')))
                : (location.pathname.startsWith(item.to));

              const linkClasses = `relative flex items-center gap-1.5 2xl:gap-2 text-[13.5px] 2xl:text-[14.5px] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FFFF] rounded-full px-3 2xl:px-3.5 py-1.5 cursor-pointer whitespace-nowrap ${
                isItemActive
                  ? (isDark 
                      ? 'text-[#00FFFF] bg-[#00FFFF]/10 shadow-sm' 
                      : 'text-[#C2272D] bg-[#C2272D]/10 shadow-sm')
                  : (isDark 
                      ? 'text-[#D1D5DB] hover:text-white hover:bg-white/5' 
                      : 'text-[#171717] hover:text-[#C2272D] hover:bg-black/5')
              }`;

              return (
                <li key={item.name} role="none" className="relative">
                  {item.to ? (
                    <Link
                      to={item.to}
                      role="menuitem"
                      className={linkClasses}
                    >
                      <Icon size={14} className={isItemActive ? (isDark ? 'text-[#00FFFF]' : 'text-[#C2272D]') : 'opacity-70'} />
                      <span>{item.name}</span>
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href)}
                      role="menuitem"
                      className={linkClasses}
                    >
                      <Icon size={14} className={isItemActive ? (isDark ? 'text-[#00FFFF]' : 'text-[#C2272D]') : 'opacity-70'} />
                      <span>{item.name}</span>
                    </a>
                  )}
                </li>
              );
            })}
          </ul>

          {/* ── Actions (Right): Theme Toggle and Auth Session ── */}
          <div className="hidden xl:flex items-center gap-2.5 2xl:gap-3.5 shrink-0">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleTheme();
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                isDark 
                  ? 'text-white hover:bg-white/10 hover:text-[#00FFFF]' 
                  : 'text-[#171717] hover:bg-slate-100 hover:text-[#C2272D]'
              }`}
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
              title={isDark ? "Light theme" : "Dark theme"}
            >
              {isDark ? <FaSun size={18} /> : <FaMoon size={18} />}
            </button>

            {/* Authenticated User Session Dropdown (Compact Profile Icon Only) */}
            {isAuthenticated ? (
              <div className="flex items-center border-l border-slate-200 dark:border-white/10 pl-3.5 profile-dropdown-container relative">
                <button
                  type="button"
                  id="user-menu-button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                  aria-label="User profile menu"
                  title={user?.fullName || user?.username || 'My Profile'}
                  className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FFFF] ${
                    dropdownOpen 
                      ? 'ring-2 ring-[#C2272D] dark:ring-[#00FFFF] scale-105 shadow-md' 
                      : 'hover:ring-2 hover:ring-[#C2272D]/60 dark:hover:ring-[#00FFFF]/60 hover:scale-105 active:scale-95'
                  }`}
                >
                  {user?.avatar?.url ? (
                    <img 
                      src={user.avatar.url} 
                      alt={user?.fullName || 'User Avatar'} 
                      className="w-full h-full rounded-full object-cover ring-1 ring-black/10 dark:ring-white/10" 
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#C2272D] to-[#00FFFF] p-[2px] flex items-center justify-center shadow-sm">
                      <div className="w-full h-full rounded-full bg-white dark:bg-[#111111] flex items-center justify-center font-bold text-xs text-[#C2272D] dark:text-[#00FFFF]">
                        {user?.fullName ? user.fullName.charAt(0).toUpperCase() : (user?.username ? user.username.charAt(0).toUpperCase() : 'U')}
                      </div>
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-black"></span>
                </button>

                {/* Profile Dropdown Menu */}
                {dropdownOpen && (
                  <div 
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                    className="absolute right-0 top-12 mt-2 w-64 max-w-[calc(100vw-32px)] bg-white dark:bg-[#0f0f11] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl py-2 z-[1000] text-left backdrop-blur-md animate-in fade-in duration-150"
                  >
                    {/* User Info Header */}
                    <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-white/10 mb-1 flex items-center gap-2.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-black font-title text-slate-900 dark:text-white truncate">
                            {user?.fullName || user?.username}
                          </p>
                          {user?.role === 'Admin' && (
                            <span className="text-[8px] font-extrabold uppercase px-1 py-0.2 rounded bg-[#C2272D]/15 text-[#C2272D] dark:bg-[#C2272D]/25 dark:text-[#ff555b] border border-[#C2272D]/30 shrink-0">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                          @{user?.username || 'user'}
                        </p>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="px-1 py-1 space-y-0.5">
                      <Link 
                        to="/user/dashboard" 
                        onClick={() => setDropdownOpen(false)} 
                        role="menuitem"
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-[#C2272D] dark:hover:text-[#00FFFF] rounded-xl transition-colors"
                      >
                        <FaUser size={12} className="opacity-70" />
                        <span>Profile Dashboard</span>
                      </Link>

                      {user?.role === 'Admin' && (
                        <>
                          <AdminLink 
                            to="/admin/dashboard" 
                            role="menuitem"
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-[#C2272D] dark:hover:text-[#00FFFF] rounded-xl transition-colors"
                          >
                            <FaTachometerAlt size={12} className="text-[#C2272D] dark:text-[#00FFFF]" />
                            <span>Admin Dashboard</span>
                          </AdminLink>

                          <AdminLink 
                            to="/admin/cms" 
                            role="menuitem"
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-[#C2272D] dark:hover:text-[#00FFFF] rounded-xl transition-colors"
                          >
                            <FaGlobe size={12} className="opacity-70" />
                            <span>Website CMS</span>
                          </AdminLink>

                          <AdminLink 
                            to="/admin/forms" 
                            role="menuitem"
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-[#C2272D] dark:hover:text-[#00FFFF] rounded-xl transition-colors"
                          >
                            <FaWpforms size={12} className="opacity-70" />
                            <span>Forms Manager</span>
                          </AdminLink>
                        </>
                      )}

                      <Link 
                        to="/user/dashboard" 
                        onClick={() => setDropdownOpen(false)} 
                        role="menuitem"
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-[#C2272D] dark:hover:text-[#00FFFF] rounded-xl transition-colors"
                      >
                        <FaCog size={12} className="opacity-70" />
                        <span>Settings</span>
                      </Link>
                    </div>

                    {/* Logout Footer */}
                    <div className="border-t border-slate-100 dark:border-white/10 mt-1 pt-1 px-1">
                      <button 
                        type="button"
                        onClick={async () => { 
                          await logout(); 
                          setDropdownOpen(false); 
                          navigate('/login'); 
                        }} 
                        role="menuitem"
                        className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-bold text-[#C2272D] hover:bg-[#C2272D]/10 rounded-xl transition-colors cursor-pointer"
                      >
                        <FaSignOutAlt size={12} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Guest Sign In CTA Button */
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#C2272D] hover:bg-[#A51E23] text-white rounded-full text-xs font-bold shadow-sm shadow-[#C2272D]/25 hover:shadow-md transition-all cursor-pointer"
                aria-label="Sign In"
              >
                <FaSignInAlt size={12} />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* ── Mobile Controls (Below xl) ── */}
          <div className="flex xl:hidden items-center gap-2 profile-dropdown-container">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleTheme();
              }}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isDark 
                  ? 'text-white hover:bg-white/10' 
                  : 'text-[#171717] hover:bg-slate-100'
              }`}
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            >
              {isDark ? <FaSun size={17} /> : <FaMoon size={17} />}
            </button>

            {/* Mobile Compact Profile Icon for Logged-In User */}
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="User profile menu"
                title={user?.fullName || user?.username || 'My Profile'}
                className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  dropdownOpen ? 'ring-2 ring-[#C2272D] dark:ring-[#00FFFF]' : 'hover:scale-105 active:scale-95'
                }`}
              >
                {user?.avatar?.url ? (
                  <img src={user.avatar.url} alt="User Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#C2272D] to-[#00FFFF] p-[1.5px] flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-white dark:bg-[#111111] flex items-center justify-center font-bold text-[11px] text-[#C2272D] dark:text-[#00FFFF]">
                      {user?.fullName ? user.fullName.charAt(0).toUpperCase() : (user?.username ? user.username.charAt(0).toUpperCase() : 'U')}
                    </div>
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-black"></span>
              </button>
            ) : null}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-colors text-lg ${
                isDark 
                  ? 'text-white hover:bg-white/10' 
                  : 'text-[#171717] hover:bg-slate-100'
              }`}
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Modal Drawer Overlay ── */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[1000] bg-black/65 backdrop-blur-sm flex items-start justify-end p-4 sm:p-6 xl:hidden animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className={`w-full max-w-[340px] max-h-[92vh] overflow-y-auto rounded-3xl p-5 shadow-2xl border transition-all duration-300 ${
              isDark 
                ? 'bg-[#111111] text-white border-white/10' 
                : 'bg-[#FFFFFF] text-[#171717] border-[#E5E7EB]'
            }`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-white/10 mb-4">
              <div className="flex items-center gap-2.5">
                <img
                  src={logoSrc}
                  alt="TS Logo"
                  className="w-9 h-9 rounded-xl object-cover"
                />
                <div className="flex flex-col text-left">
                  <div className="flex items-center text-base font-black font-title">
                    <span className={isDark ? 'text-white' : 'text-[#171717]'}>TAUHID&nbsp;</span>
                    <span className="text-[#C2272D]">SHEKHAR</span>
                  </div>
                  <span className="text-[9px] font-bold tracking-widest uppercase text-[#525252] dark:text-[#9CA3AF]">
                    DEVELOPER | CREATOR | LEARNER
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-black dark:hover:text-white cursor-pointer"
                aria-label="Close menu"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* Modal Nav Items */}
            <ul className="flex flex-col gap-1.5 mb-5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isItemActive = item.href 
                  ? ((activeSection === item.href.substring(1) && location.pathname === '/') || (item.name === 'Forms' && location.pathname.startsWith('/forms')))
                  : (location.pathname.startsWith(item.to));

                const content = (
                  <div className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl transition-all duration-150 ${
                    isItemActive
                      ? (isDark 
                          ? 'bg-[#00FFFF]/10 text-[#00FFFF] font-bold' 
                          : 'bg-[#C2272D]/10 text-[#C2272D] font-bold')
                      : (isDark 
                          ? 'text-[#D1D5DB] hover:bg-white/5 font-semibold' 
                          : 'text-[#171717] hover:bg-slate-50 font-semibold')
                  }`}>
                    <div className="flex items-center gap-3 text-sm">
                      <Icon size={15} className={isItemActive ? (isDark ? 'text-[#00FFFF]' : 'text-[#C2272D]') : 'opacity-70'} />
                      <span>{item.name}</span>
                    </div>
                    <FaChevronRight size={11} className={isItemActive ? (isDark ? 'text-[#00FFFF]' : 'text-[#C2272D]') : 'opacity-40'} />
                  </div>
                );

                return (
                  <li key={item.name}>
                    {item.to ? (
                      <Link
                        to={item.to}
                        onClick={() => setIsOpen(false)}
                        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FFFF] rounded-xl"
                      >
                        {content}
                      </Link>
                    ) : (
                      <a
                        href={item.href}
                        onClick={(e) => handleNavClick(e, item.href)}
                        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FFFF] rounded-xl"
                      >
                        {content}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Quick Theme Switcher in Mobile Drawer */}
            <div className="mb-4 pt-2 border-t border-slate-100 dark:border-white/10">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleTheme();
                }}
                className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                  isDark 
                    ? 'bg-white/5 hover:bg-white/10 text-white' 
                    : 'bg-slate-100 hover:bg-slate-200 text-[#171717]'
                }`}
              >
                <div className="flex items-center gap-2.5 text-xs font-semibold">
                  {isDark ? <FaSun size={15} className="text-amber-400" /> : <FaMoon size={15} className="text-[#C2272D]" />}
                  <span>{isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#C2272D]/10 text-[#C2272D] dark:text-[#00FFFF]">
                  {isDark ? 'Dark' : 'Light'}
                </span>
              </button>
            </div>

            {/* Auth / Account Controls for Mobile Drawer */}
            {isAuthenticated ? (
              <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex flex-col gap-2">
                <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <div className="relative shrink-0">
                    {user?.avatar?.url ? (
                      <img src={user.avatar.url} alt={user?.fullName || 'User'} className="w-9 h-9 rounded-full object-cover ring-2 ring-[#C2272D]/40 dark:ring-[#00FFFF]/40" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#C2272D] to-[#00FFFF] p-[2px] flex items-center justify-center">
                        <div className="w-full h-full rounded-full bg-white dark:bg-[#111111] flex items-center justify-center font-bold text-xs text-[#C2272D] dark:text-[#00FFFF]">
                          {user?.fullName ? user.fullName.charAt(0).toUpperCase() : (user?.username ? user.username.charAt(0).toUpperCase() : 'U')}
                        </div>
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-black"></span>
                  </div>
                  <div className="overflow-hidden text-left min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-black font-title text-slate-900 dark:text-white truncate">
                        {user?.fullName || user?.username}
                      </p>
                      {user?.role === 'Admin' && (
                        <span className="text-[8px] font-extrabold uppercase px-1 py-0.2 rounded bg-[#C2272D]/15 text-[#C2272D] dark:bg-[#C2272D]/25 dark:text-[#ff555b] border border-[#C2272D]/30 shrink-0">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">@{user?.username}</p>
                  </div>
                </div>

                {/* Mobile Drawer Menu Links */}
                <div className="flex flex-col gap-1 py-1">
                  <Link
                    to="/user/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors"
                  >
                    <FaUser size={12} className="opacity-70" />
                    <span>Profile Dashboard</span>
                  </Link>

                  {user?.role === 'Admin' && (
                    <>
                      <AdminLink
                        to="/admin/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold text-xs text-[#C2272D] dark:text-[#00FFFF] bg-[#C2272D]/5 dark:bg-[#00FFFF]/5 hover:bg-[#C2272D]/10 dark:hover:bg-[#00FFFF]/10 transition-colors"
                      >
                        <FaTachometerAlt size={12} />
                        <span>Admin Dashboard</span>
                      </AdminLink>
                      <AdminLink
                        to="/admin/cms"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors"
                      >
                        <FaGlobe size={12} className="opacity-70" />
                        <span>Website CMS</span>
                      </AdminLink>
                      <AdminLink
                        to="/admin/forms"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors"
                      >
                        <FaWpforms size={12} className="opacity-70" />
                        <span>Forms Manager</span>
                      </AdminLink>
                    </>
                  )}

                  <Link
                    to="/user/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors"
                  >
                    <FaCog size={12} className="opacity-70" />
                    <span>Settings</span>
                  </Link>
                </div>

                <button
                  onClick={async () => { await logout(); setIsOpen(false); navigate('/login'); }}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-[#C2272D] hover:bg-[#C2272D]/10 rounded-xl transition-colors cursor-pointer border border-[#C2272D]/20 mt-1"
                >
                  <FaSignOutAlt /> Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-100 dark:border-white/10 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#C2272D] hover:bg-[#A51E23] text-white rounded-full text-xs font-bold shadow-md shadow-[#C2272D]/25 transition-all cursor-pointer"
                >
                  <FaSignInAlt size={13} />
                  <span>Sign In</span>
                </Link>
                <div className="text-center">
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors"
                  >
                    Don't have an account? <span className="underline font-bold">Register</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
