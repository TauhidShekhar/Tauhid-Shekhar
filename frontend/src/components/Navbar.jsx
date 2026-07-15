import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { getCacheBustedUrl } from '../utils/cacheBuster';
import { 
  FaBars, FaTimes, FaSun, FaMoon, FaDownload, 
  FaUserCircle, FaSignOutAlt, FaTachometerAlt, FaChevronDown,
  FaGlobe, FaCog
} from 'react-icons/fa';

// ... (rest of imports or code remains unchanged)


const Navbar = ({ activeSection, toggleTheme, isDark, settingsData }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
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

  const AdminLink = ({ to, children, className }) => {
    const isUnified = !VITE_ADMIN_URL || VITE_ADMIN_URL.includes(window.location.host);
    if (isUnified) {
      return (
        <Link to={to} onClick={() => setDropdownOpen(false)} className={className}>
          {children}
        </Link>
      );
    }
    return (
      <a href={`${VITE_ADMIN_URL}${to}`} onClick={() => setDropdownOpen(false)} className={className}>
        {children}
      </a>
    );
  };

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

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownOpen && !e.target.closest('.profile-dropdown-container')) {
        setDropdownOpen(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [dropdownOpen]);

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Skills', href: '#skills' },
    { name: 'Projects', href: '#projects' },
    { name: 'Experience', href: '#experience' },
    { name: 'Education', href: '#education' },
    { name: 'Achievements', href: '#achievements' },
    { name: 'Contact', href: '#contact' },
    { name: 'Community', to: '/community' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setIsOpen(false);
    const element = document.querySelector(href);
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

  return (
    <header
      className={`fixed top-0 left-0 w-full z-[999] transition-all duration-300 ${
        scrolled
          ? 'glass shadow-lg border-b border-slate-200/50 dark:border-white/5 py-4'
          : 'bg-transparent py-5'
      }`}
    >
      <nav className="max-w-full mx-auto px-6 md:px-12 xl:px-16 flex items-center justify-between">
        
        {/* Section 1: Logo (Left) */}
        <div className="text-lg md:text-xl font-black font-title tracking-wider text-black dark:text-white shrink-0">
          <a href="#home" onClick={(e) => handleNavClick(e, '#home')} className="hover:text-primary-blue transition-colors flex items-center gap-2">
            {settings?.logo?.url && (
              <img src={getCacheBustedUrl(settings.logo.url, settings.updatedAt)} alt={settings?.siteName || 'Logo'} className="h-8 w-auto object-contain" />
            )}
            <span className="uppercase">{settings?.siteName || 'TAUHID SHEKHAR'}</span>
          </a>
        </div>

        {/* Section 2: Navigation Links (Middle) */}
        <ul className="hidden xl:flex items-center gap-6 xl:gap-8 mx-6">
          {navItems.map((item) => (
            <li key={item.name}>
              {item.to ? (
                <Link
                  to={item.to}
                  className="relative text-sm font-bold tracking-wide transition-colors duration-300 py-1.5 text-slate-600 dark:text-slate-350 hover:text-primary-blue dark:hover:text-primary-blue"
                >
                  {item.name}
                </Link>
              ) : (
                <a
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`relative text-sm font-bold tracking-wide transition-colors duration-300 py-1.5 ${
                    activeSection === item.href.substring(1)
                      ? 'text-primary-blue'
                      : 'text-slate-600 dark:text-slate-300 hover:text-primary-blue dark:hover:text-primary-blue'
                  }`}
                >
                  {item.name}
                  {activeSection === item.href.substring(1) && (
                    <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-gradient-to-r from-primary-blue to-primary-cyan rounded-full" />
                  )}
                </a>
              )}
            </li>
          ))}
        </ul>

        {/* Section 3: Action Buttons (Right) */}
        <div className="hidden xl:flex items-center gap-4 shrink-0">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors duration-300 cursor-pointer border border-slate-200/40 dark:border-white/5"
            aria-label="Toggle Theme"
          >
            {isDark ? <FaSun size={16} /> : <FaMoon size={16} />}
          </button>

          {/* Session Auth display */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3.5 border-l border-slate-200/50 dark:border-white/10 pl-4 py-1 profile-dropdown-container relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 hover:text-primary-blue dark:hover:text-primary-blue text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                title="Account Menu"
              >
                {user?.avatar?.url ? (
                  <img src={user.avatar.url} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-white/10" />
                ) : (
                  <FaUserCircle size={22} className="text-slate-400 dark:text-slate-350" />
                )}
                <span className="text-xs font-bold max-w-[80px] truncate">
                  {user?.fullName.split(' ')[0]}
                </span>
                <FaChevronDown size={10} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-11 w-52 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-2xl shadow-xl py-2.5 z-[1000] text-left animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-white/5 mb-1.5">
                    <p className="text-xs font-black text-black dark:text-white truncate">{user?.fullName}</p>
                    <p className="text-[9px] text-slate-400 font-semibold truncate">@{user?.username}</p>
                  </div>
                  {user?.role === 'Admin' ? (
                    <>
                      <AdminLink to="/admin/dashboard" className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary-blue transition-colors">
                        <FaTachometerAlt /> Admin Dashboard
                      </AdminLink>
                      <AdminLink to="/admin/cms" className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary-blue transition-colors">
                        <FaGlobe /> Website CMS
                      </AdminLink>
                      <AdminLink to="/admin/users" className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary-blue transition-colors">
                        <FaUserCircle /> User Management
                      </AdminLink>
                      <AdminLink to="/admin/settings" className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary-blue transition-colors">
                        <FaCog /> Settings
                      </AdminLink>
                    </>
                  ) : (
                    <>
                      <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-305 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary-blue transition-colors">
                        <FaTachometerAlt /> Dashboard
                      </Link>
                      <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-305 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary-blue transition-colors">
                        <FaUserCircle /> My Profile
                      </Link>
                    </>
                  )}
                  <div className="border-t border-slate-100 dark:border-white/5 mt-1.5 pt-1.5">
                    <button onClick={async () => { await logout(); setDropdownOpen(false); navigate('/login'); }} className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-500/5 transition-colors cursor-pointer">
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 border-l border-slate-200/50 dark:border-white/10 pl-4 py-1">
              <Link
                to="/login"
                className="px-4.5 py-2 bg-primary-blue hover:bg-accent-blue text-white rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 hover:-translate-y-0.5 shadow-md shadow-primary-blue/20"
              >
                Login
              </Link>
            </div>
          )}

          {/* Hire Me Button */}
          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, '#contact')}
            className="px-4.5 py-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-white border border-slate-200 dark:border-white/5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 hover:-translate-y-0.5"
          >
            Hire Me
          </a>
        </div>

        {/* Mobile Controls (Triggered below xl screen size) */}
        <div className="flex xl:hidden items-center gap-4">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 transition-colors border border-slate-200/40 dark:border-white/5"
            aria-label="Toggle Theme"
          >
            {isDark ? <FaSun size={16} /> : <FaMoon size={16} />}
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-2xl text-black dark:text-white transition-colors cursor-pointer"
            aria-label="Open Menu"
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[997] bg-slate-950/60 backdrop-blur-sm xl:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Drawer (Responsive Drawer below xl screen size) */}
      <div
        className={`fixed top-0 right-0 w-[280px] h-[100dvh] bg-white dark:bg-slate-950 shadow-2xl z-[998] flex flex-col transition-transform duration-300 transform xl:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.5rem)',
          paddingTop: 'calc(env(safe-area-inset-top) + 0.5rem)'
        }}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-white/5 shrink-0">
          <span className="text-base font-black font-title tracking-wider text-black dark:text-white">TAUHID SHEKHAR</span>
          <button onClick={() => setIsOpen(false)} className="text-2xl text-black dark:text-white cursor-pointer p-1">
            <FaTimes />
          </button>
        </div>
        
        {/* Scrollable middle container */}
        <div className="flex-1 overflow-y-auto px-6 py-4 text-left">
          <ul className="flex flex-col gap-4">
            {navItems.map((item) => (
              <li key={item.name}>
                {item.to ? (
                  <Link
                    to={item.to}
                    onClick={() => setIsOpen(false)}
                    className="text-[15px] font-bold block py-1.5 transition-colors text-slate-655 dark:text-slate-300 hover:text-primary-blue"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={`text-[15px] font-bold block py-1.5 transition-colors ${
                      activeSection === item.href.substring(1)
                        ? 'text-primary-blue'
                        : 'text-slate-655 dark:text-slate-300 hover:text-primary-blue'
                    }`}
                  >
                    {item.name}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Sticky bottom panel */}
        <div className="border-t border-slate-100 dark:border-white/5 px-6 py-4 bg-white dark:bg-slate-950 shrink-0 flex flex-col gap-2.5">
          {/* Mobile Auth options */}
          {isAuthenticated ? (
            <div className="flex flex-col gap-2.5">
              {user?.role === 'Admin' ? (
                <a
                  href={`${VITE_ADMIN_URL}/admin`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white rounded-xl font-bold text-xs border border-slate-200 dark:border-white/5"
                >
                  <FaTachometerAlt /> Dashboard
                </a>
              ) : (
                <Link
                  to="/user/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white rounded-xl font-bold text-xs border border-slate-200 dark:border-white/5"
                >
                  <FaUserCircle /> Dashboard
                </Link>
              )}
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-bold text-xs border border-red-500/20 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center w-full py-2.5 bg-primary-blue hover:bg-accent-blue text-white rounded-xl font-bold text-xs shadow-md"
              >
                Login
              </Link>
            </div>
          )}

          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, '#contact')}
            className="flex items-center justify-center w-full py-2.5 bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-white rounded-xl font-bold text-xs border border-slate-200 dark:border-white/5"
          >
            Hire Me
          </a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
