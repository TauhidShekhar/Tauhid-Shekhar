import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { 
  FaBars, FaTimes, FaSun, FaMoon, FaDownload, 
  FaUserCircle, FaSignOutAlt, FaTachometerAlt, FaChevronDown,
  FaGlobe, FaCog
} from 'react-icons/fa';

const Navbar = ({ activeSection, toggleTheme, isDark }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const rawAdminUrl = import.meta.env.VITE_ADMIN_URL;
  const VITE_ADMIN_URL = (rawAdminUrl && rawAdminUrl !== 'undefined' && rawAdminUrl !== 'null') 
    ? rawAdminUrl 
    : (window.location.port === '5173' || window.location.port === '5174'
        ? `${window.location.protocol}//${window.location.hostname}:5174`
        : 'https://tauhid-shekhar-portfolio-f4xf.vercel.app');
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [settings, setSettings] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
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
  }, []);

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
          <a href="#home" onClick={(e) => handleNavClick(e, '#home')} className="hover:text-primary-blue transition-colors">
            TAUHID SHEKHAR
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
                      <a href={`${VITE_ADMIN_URL}/admin`} onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary-blue transition-colors">
                        <FaTachometerAlt /> Admin Dashboard
                      </a>
                      <a href={`${VITE_ADMIN_URL}/admin/hero`} onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary-blue transition-colors">
                        <FaGlobe /> Website CMS
                      </a>
                      <a href={`${VITE_ADMIN_URL}/admin/users`} onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary-blue transition-colors">
                        <FaUserCircle /> User Management
                      </a>
                      <a href={`${VITE_ADMIN_URL}/admin/settings`} onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary-blue transition-colors">
                        <FaCog /> Settings
                      </a>
                    </>
                  ) : (
                    <>
                      <Link to="/user/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary-blue transition-colors">
                        <FaTachometerAlt /> Dashboard
                      </Link>
                      <Link to="/user/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary-blue transition-colors">
                        <FaUserCircle /> My Profile
                      </Link>
                    </>
                  )}
                  <div className="border-t border-slate-100 dark:border-white/5 mt-1.5 pt-1.5">
                    <button onClick={() => { logout(); setDropdownOpen(false); }} className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-500/5 transition-colors cursor-pointer">
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 border-l border-slate-200/50 dark:border-white/10 pl-4 py-1">
              <a
                href={`${VITE_ADMIN_URL}/admin/login`}
                className="px-4.5 py-2 bg-primary-blue hover:bg-accent-blue text-white rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 hover:-translate-y-0.5 shadow-md shadow-primary-blue/20"
              >
                Login
              </a>
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

      {/* Mobile Drawer (Responsive Drawer below xl screen size) */}
      <div
        className={`fixed top-0 right-0 w-[280px] h-screen bg-white dark:bg-slate-950 shadow-2xl z-[998] p-8 flex flex-col gap-8 transition-transform duration-300 transform xl:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center mb-2 border-b border-slate-100 dark:border-white/5 pb-4">
          <span className="text-base font-black font-title tracking-wider text-black dark:text-white">TAUHID SHEKHAR</span>
          <button onClick={() => setIsOpen(false)} className="text-2xl text-black dark:text-white cursor-pointer">
            <FaTimes />
          </button>
        </div>
        
        <ul className="flex flex-col gap-5 text-left">
          {navItems.map((item) => (
            <li key={item.name}>
              {item.to ? (
                <Link
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className="text-[15px] font-bold block transition-colors text-slate-655 dark:text-slate-300 hover:text-primary-blue"
                >
                  {item.name}
                </Link>
              ) : (
                <a
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`text-[15px] font-bold block transition-colors ${
                    activeSection === item.href.substring(1)
                      ? 'text-primary-blue'
                      : 'text-slate-655 dark:text-slate-300'
                  }`}
                >
                  {item.name}
                </a>
              )}
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-3 mt-auto border-t border-slate-100 dark:border-white/5 pt-6">
          {/* Mobile Auth options */}
          {isAuthenticated ? (
            <div className="flex flex-col gap-2.5 mb-2">
              {user?.role === 'Admin' ? (
                <a
                  href={`${VITE_ADMIN_URL}/admin`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white rounded-xl font-bold text-sm border border-slate-200 dark:border-white/5"
                >
                  <FaTachometerAlt /> Dashboard
                </a>
              ) : (
                <Link
                  to="/user/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white rounded-xl font-bold text-sm border border-slate-200 dark:border-white/5"
                >
                  <FaUserCircle /> Dashboard
                </Link>
              )}
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-bold text-sm border border-red-500/20 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="mb-2">
              <a
                href={`${VITE_ADMIN_URL}/admin/login`}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center w-full py-3 bg-primary-blue text-white rounded-xl font-bold text-sm shadow-md"
              >
                Login
              </a>
            </div>
          )}

          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, '#contact')}
            className="flex items-center justify-center w-full py-3 bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-white rounded-xl font-bold text-sm border border-slate-200 dark:border-white/5"
          >
            Hire Me
          </a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
