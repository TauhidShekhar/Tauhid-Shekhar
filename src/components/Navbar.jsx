import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { 
  FaHome, FaUser, FaCode, FaBriefcase, FaBookOpen, FaEnvelope,
  FaSun, FaMoon, FaPaperPlane, FaBars, FaTimes, FaChevronRight,
  FaUserCircle, FaSignOutAlt, FaTachometerAlt, FaChevronDown,
  FaGlobe, FaCog, FaSignInAlt, FaUserPlus
} from 'react-icons/fa';

const Navbar = ({ activeSection, toggleTheme, isDark, settingsData }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const rawAdminUrl = import.meta.env.VITE_ADMIN_URL;
  const VITE_ADMIN_URL = (rawAdminUrl && rawAdminUrl !== 'undefined' && rawAdminUrl !== 'null') 
    ? rawAdminUrl 
    : (window.location.port === '5173' || window.location.port === '5174'
        ? `${window.location.protocol}//${window.location.hostname}:5174`
        : 'https://tauhidshekhar-admin.vercel.app');

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [settings, setSettings] = useState(settingsData || null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard escape listener to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

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

  // Essential primary navigation links matching brand design reference
  const navItems = [
    { name: 'Home', href: '#home', icon: FaHome },
    { name: 'About', href: '#about', icon: FaUser },
    { name: 'Projects', href: '#projects', icon: FaCode },
    { name: 'Experience', href: '#experience', icon: FaBriefcase },
    { name: 'Community', to: '/community', icon: FaBookOpen },
    { name: 'Contact', href: '#contact', icon: FaEnvelope }
  ];

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setIsOpen(false);

    if (location.pathname !== '/') {
      navigate('/' + href);
      return;
    }

    const element = document.querySelector(href);
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

  const AdminLink = ({ to, children, className }) => {
    return (
      <Link to={to} onClick={() => setDropdownOpen(false)} className={className}>
        {children}
      </Link>
    );
  };

  // Logo asset based on theme
  const logoSrc = isDark ? '/assits/ts-logo-dark.jpg' : '/assits/ts-logo-red.jpg';

  return (
    <header className="fixed top-0 left-0 w-full z-[999] px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4 transition-all duration-300">
      <nav
        aria-label="Main Navigation"
        className={`max-w-[1400px] mx-auto rounded-2xl px-4 sm:px-6 lg:px-8 py-3 transition-all duration-300 ${
          isDark
            ? 'bg-[#000000] border border-white/10 shadow-2xl shadow-black/80'
            : 'bg-[#FFFFFF] border border-[#E5E7EB] shadow-lg shadow-slate-200/60'
        } ${scrolled ? 'backdrop-blur-md bg-opacity-95 dark:bg-opacity-95' : ''}`}
      >
        <div className="flex items-center justify-between gap-4">
          
          {/* ── Brand Logo & Text (Left) ── */}
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, '#home')}
            className="flex items-center gap-3 shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FFFF] rounded-xl"
            aria-label="Tauhid Shekhar Home"
          >
            <img
              src={logoSrc}
              alt="Tauhid Shekhar TS Logo"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover shadow-sm transition-transform duration-200 group-hover:scale-105"
            />
            <div className="flex flex-col text-left">
              <div className="flex items-center text-lg sm:text-xl font-black font-title tracking-tight leading-tight">
                <span className={isDark ? 'text-white' : 'text-[#171717]'}>TAUHID&nbsp;</span>
                <span className="text-[#C2272D]">SHEKHAR</span>
                <span className="text-[#00FFFF] font-bold mx-2 select-none text-base">|</span>
              </div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#525252] dark:text-[#9CA3AF]">
                DEVELOPER | CREATOR | LEARNER
              </span>
            </div>
          </a>

          {/* ── Desktop Primary Links (Center) ── */}
          <ul className="hidden xl:flex items-center gap-6 2xl:gap-8 mx-auto" role="menubar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isItemActive = item.href 
                ? (activeSection === item.href.substring(1) && location.pathname === '/')
                : (location.pathname.startsWith(item.to));

              return (
                <li key={item.name} role="none" className="relative py-2">
                  {item.to ? (
                    <Link
                      to={item.to}
                      role="menuitem"
                      className={`relative flex items-center gap-2 text-[16px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FFFF] rounded-md px-1 ${
                        isItemActive
                          ? (isDark ? 'text-[#00FFFF]' : 'text-[#C2272D]')
                          : (isDark ? 'text-[#D1D5DB] hover:text-[#00FFFF]' : 'text-[#171717] hover:text-[#C2272D]')
                      }`}
                    >
                      <Icon size={16} className={isItemActive ? (isDark ? 'text-[#00FFFF]' : 'text-[#C2272D]') : 'opacity-80'} />
                      <span>{item.name}</span>
                      {isItemActive && (
                        <span 
                          className={`absolute -bottom-2 left-0 w-full h-[2.5px] rounded-full ${
                            isDark ? 'bg-[#00FFFF]' : 'bg-[#C2272D]'
                          }`} 
                        />
                      )}
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href)}
                      role="menuitem"
                      className={`relative flex items-center gap-2 text-[16px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FFFF] rounded-md px-1 ${
                        isItemActive
                          ? (isDark ? 'text-[#00FFFF]' : 'text-[#C2272D]')
                          : (isDark ? 'text-[#D1D5DB] hover:text-[#00FFFF]' : 'text-[#171717] hover:text-[#C2272D]')
                      }`}
                    >
                      <Icon size={16} className={isItemActive ? (isDark ? 'text-[#00FFFF]' : 'text-[#C2272D]') : 'opacity-80'} />
                      <span>{item.name}</span>
                      {isItemActive && (
                        <span 
                          className={`absolute -bottom-2 left-0 w-full h-[2.5px] rounded-full ${
                            isDark ? 'bg-[#00FFFF]' : 'bg-[#C2272D]'
                          }`} 
                        />
                      )}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>

          {/* ── Actions (Right): Theme Toggle, Auth, and Let's Talk CTA ── */}
          <div className="hidden xl:flex items-center gap-4 shrink-0">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                isDark 
                  ? 'text-white hover:bg-white/10 hover:text-[#00FFFF]' 
                  : 'text-[#171717] hover:bg-slate-100 hover:text-[#C2272D]'
              }`}
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
              title={isDark ? "Light theme" : "Dark theme"}
            >
              {isDark ? <FaSun size={20} /> : <FaMoon size={20} />}
            </button>

            {/* Authenticated User Session Dropdown */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3 border-l border-slate-200 dark:border-white/10 pl-4 py-1 profile-dropdown-container relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`flex items-center gap-2 text-sm font-bold transition-colors cursor-pointer ${
                    isDark ? 'text-white hover:text-[#00FFFF]' : 'text-[#171717] hover:text-[#C2272D]'
                  }`}
                  aria-expanded={dropdownOpen}
                  aria-label="User Account Menu"
                >
                  {user?.avatar?.url ? (
                    <img 
                      src={user.avatar.url} 
                      alt={user?.fullName || 'User'} 
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-white/20" 
                    />
                  ) : (
                    <FaUserCircle size={22} className="text-slate-400" />
                  )}
                  <span className="max-w-[90px] truncate text-sm font-bold">
                    {user?.fullName?.split(' ')[0] || 'Account'}
                  </span>
                  <FaChevronDown size={11} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-12 w-56 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl py-2 z-[1000] text-left animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-white/10 mb-1">
                      <p className="text-sm font-extrabold text-black dark:text-white truncate">{user?.fullName}</p>
                      <p className="text-xs text-slate-400 font-medium truncate">@{user?.username}</p>
                    </div>

                    {user?.role === 'Admin' ? (
                      <>
                        <AdminLink to="/admin/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-[#C2272D] dark:hover:text-[#00FFFF]">
                          <FaTachometerAlt /> Admin Dashboard
                        </AdminLink>
                        <AdminLink to="/admin/cms" className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-[#C2272D] dark:hover:text-[#00FFFF]">
                          <FaGlobe /> Website CMS
                        </AdminLink>
                        <AdminLink to="/admin/settings" className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-[#C2272D] dark:hover:text-[#00FFFF]">
                          <FaCog /> Settings
                        </AdminLink>
                      </>
                    ) : (
                      <>
                        <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-[#C2272D] dark:hover:text-[#00FFFF]">
                          <FaTachometerAlt /> My Dashboard
                        </Link>
                        <Link to="/community" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-[#C2272D] dark:hover:text-[#00FFFF]">
                          <FaBookOpen /> Community Hub
                        </Link>
                      </>
                    )}

                    <div className="border-t border-slate-100 dark:border-white/10 mt-1 pt-1">
                      <button 
                        onClick={async () => { await logout(); setDropdownOpen(false); navigate('/login'); }} 
                        className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm font-bold text-[#C2272D] hover:bg-[#C2272D]/5 transition-colors cursor-pointer"
                      >
                        <FaSignOutAlt /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* Authenticated vs Guest Action CTA */}
            {isAuthenticated ? (
              user?.role === 'Admin' ? (
                <AdminLink
                  to="/admin/dashboard"
                  className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-[#C2272D] hover:bg-[#A51E23] text-white rounded-full text-[15px] font-semibold shadow-md shadow-[#C2272D]/25 hover:shadow-lg hover:shadow-[#C2272D]/40 transition-all duration-200 hover:scale-[1.04] active:scale-[0.96] cursor-pointer btn-shine-effect"
                >
                  <FaTachometerAlt size={14} />
                  <span>Admin Panel</span>
                </AdminLink>
              ) : (
                <Link
                  to="/dashboard"
                  className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-[#C2272D] hover:bg-[#A51E23] text-white rounded-full text-[15px] font-semibold shadow-md shadow-[#C2272D]/25 hover:shadow-lg hover:shadow-[#C2272D]/40 transition-all duration-200 hover:scale-[1.04] active:scale-[0.96] cursor-pointer btn-shine-effect"
                >
                  <FaTachometerAlt size={14} />
                  <span>Dashboard</span>
                </Link>
              )
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C2272D] hover:bg-[#A51E23] text-white rounded-full text-[15px] font-semibold shadow-md shadow-[#C2272D]/25 hover:shadow-lg hover:shadow-[#C2272D]/40 transition-all duration-200 hover:scale-[1.04] active:scale-[0.96] cursor-pointer btn-shine-effect"
                aria-label="Sign In"
              >
                <FaSignInAlt size={14} />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* ── Mobile Controls (Below xl) ── */}
          <div className="flex xl:hidden items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:rotate-45 active:scale-90 cursor-pointer ${
                isDark 
                  ? 'text-white hover:bg-white/10' 
                  : 'text-[#171717] hover:bg-slate-100'
              }`}
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            >
              {isDark ? <FaSun size={18} /> : <FaMoon size={18} />}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer transition-colors text-xl ${
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

      {/* ── Mobile Modal Drawer Overlay (Matching Reference Design) ── */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-start justify-end p-4 sm:p-6 xl:hidden animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className={`w-full max-w-[360px] rounded-2xl p-6 shadow-2xl border transition-all duration-300 ${
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
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10 mb-5">
              <div className="flex items-center gap-2.5">
                <img
                  src={logoSrc}
                  alt="TS Logo"
                  className="w-9 h-9 rounded-lg object-cover"
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
                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-black dark:hover:text-white cursor-pointer"
                aria-label="Close menu"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Modal Nav Items */}
            <ul className="flex flex-col gap-2 mb-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isItemActive = item.href 
                  ? (activeSection === item.href.substring(1) && location.pathname === '/')
                  : (location.pathname.startsWith(item.to));

                const content = (
                  <div className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200 ${
                    isItemActive
                      ? (isDark 
                          ? 'bg-[#00FFFF]/10 text-[#00FFFF] font-bold' 
                          : 'bg-[#C2272D]/10 text-[#C2272D] font-bold')
                      : (isDark 
                          ? 'text-[#D1D5DB] hover:bg-white/5 font-semibold' 
                          : 'text-[#171717] hover:bg-slate-50 font-semibold')
                  }`}>
                    <div className="flex items-center gap-3 text-[16px]">
                      <Icon size={17} className={isItemActive ? (isDark ? 'text-[#00FFFF]' : 'text-[#C2272D]') : 'opacity-70'} />
                      <span>{item.name}</span>
                    </div>
                    <FaChevronRight size={13} className={isItemActive ? (isDark ? 'text-[#00FFFF]' : 'text-[#C2272D]') : 'opacity-40'} />
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

            {/* Auth / Account Controls for Mobile Drawer */}
            {isAuthenticated ? (
              <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex flex-col gap-3">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  {user?.avatar?.url ? (
                    <img src={user.avatar.url} alt={user?.fullName || 'User'} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <FaUserCircle size={28} className="text-slate-400 shrink-0" />
                  )}
                  <div className="overflow-hidden text-left">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.fullName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">@{user?.username} &bull; <span className="text-[#C2272D] dark:text-[#00FFFF] font-semibold">{user?.role}</span></p>
                  </div>
                </div>

                {user?.role === 'Admin' ? (
                  <AdminLink
                    to="/admin/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#C2272D] hover:bg-[#A51E23] text-white rounded-full text-[15px] font-semibold shadow-md shadow-[#C2272D]/25 transition-all"
                  >
                    <FaTachometerAlt size={15} />
                    <span>Admin Dashboard</span>
                  </AdminLink>
                ) : (
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#C2272D] hover:bg-[#A51E23] text-white rounded-full text-[15px] font-semibold shadow-md shadow-[#C2272D]/25 transition-all"
                  >
                    <FaTachometerAlt size={15} />
                    <span>My Dashboard</span>
                  </Link>
                )}

                <button
                  onClick={async () => { await logout(); setIsOpen(false); navigate('/login'); }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-[#C2272D] hover:bg-[#C2272D]/10 rounded-full transition-colors cursor-pointer"
                >
                  <FaSignOutAlt /> Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-100 dark:border-white/10">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#C2272D] hover:bg-[#A51E23] text-white rounded-full text-[15px] font-semibold shadow-md shadow-[#C2272D]/25 hover:shadow-lg hover:shadow-[#C2272D]/40 transition-all duration-200 active:scale-[0.98] cursor-pointer btn-shine-effect"
                >
                  <FaSignInAlt size={15} />
                  <span>Sign In</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
