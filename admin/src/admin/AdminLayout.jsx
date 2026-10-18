import React, { useState, useEffect, useMemo } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../services/api';
import { 
  FaTachometerAlt, FaBriefcase, FaCode, FaEnvelope, FaCog, FaSignOutAlt, 
  FaBars, FaTimes, FaGlobe, FaChevronDown, FaChevronUp, FaBook, FaQuoteLeft, 
  FaImages, FaFileAlt, FaCertificate, FaAward, FaHistory, FaDatabase, FaShieldAlt, 
  FaUserCog, FaChartLine, FaMoon, FaSun, FaUserCircle, FaHome, FaShoppingBag, FaLaptopCode, FaUsers,
  FaRocket, FaQuestionCircle, FaSearch, FaBell, FaCheckCircle
} from 'react-icons/fa';

const ALL_MODULES = [
  { name: 'Dashboard', path: '/admin/dashboard', category: 'Overview', icon: FaTachometerAlt },
  { name: 'Home CMS', path: '/admin/cms', category: 'Content', icon: FaHome },
  { name: 'About Me', path: '/admin/about', category: 'Content', icon: FaUserCircle },
  { name: 'Technical Skills', path: '/admin/skills', category: 'Content', icon: FaCode },
  { name: 'Projects Portfolio', path: '/admin/projects', category: 'Content', icon: FaBriefcase },
  { name: 'Services Offered', path: '/admin/services', category: 'Content', icon: FaLaptopCode },
  { name: 'Work Experience', path: '/admin/experience', category: 'Content', icon: FaHistory },
  { name: 'Education', path: '/admin/education', category: 'Content', icon: FaAward },
  { name: 'Certifications', path: '/admin/certificates', category: 'Content', icon: FaCertificate },
  { name: 'Achievements', path: '/admin/achievements', category: 'Content', icon: FaAward },
  { name: 'Resume Manager', path: '/admin/resume', category: 'Content', icon: FaFileAlt },
  { name: 'Blog Articles', path: '/admin/blogs', category: 'Engagement', icon: FaBook },
  { name: 'Client Testimonials', path: '/admin/testimonials', category: 'Engagement', icon: FaQuoteLeft },
  { name: 'Media Gallery', path: '/admin/gallery', category: 'Engagement', icon: FaImages },
  { name: 'Contact Messages', path: '/admin/messages', category: 'Engagement', icon: FaEnvelope },
  { name: 'Service Orders', path: '/admin/orders', category: 'Engagement', icon: FaShoppingBag },
  { name: 'Community CMS', path: '/admin/community', category: 'Engagement', icon: FaUsers },
  { name: 'Media Library', path: '/admin/media', category: 'Management', icon: FaImages },
  { name: 'Users Directory', path: '/admin/users', category: 'Management', icon: FaUserCog },
  { name: 'Doubts Lounge', path: '/admin/doubts', category: 'Management', icon: FaQuestionCircle },
  { name: 'System Audit Logs', path: '/admin/audit-logs', category: 'Management', icon: FaHistory },
  { name: 'Feature Management', path: '/admin/features', category: 'Management', icon: FaRocket },
  { name: 'Site Settings', path: '/admin/settings', category: 'Config', icon: FaCog },
  { name: 'SEO & Meta Tags', path: '/admin/seo', category: 'Config', icon: FaGlobe },
  { name: 'Theme Settings', path: '/admin/theme', category: 'Config', icon: FaCog },
  { name: 'Analytics Dashboard', path: '/admin/analytics', category: 'Config', icon: FaChartLine },
  { name: 'System Performance', path: '/admin/performance', category: 'Config', icon: FaRocket },
  { name: 'Backup & Restore', path: '/admin/backup', category: 'Config', icon: FaDatabase },
  { name: 'Profile Manager', path: '/admin/profile', category: 'Config', icon: FaUserCircle },
  { name: 'Account Security', path: '/admin/security', category: 'Config', icon: FaShieldAlt },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  
  const navigate = useNavigate();
  const location = useLocation();

  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const clientUrl = (import.meta.env.VITE_CLIENT_URL && import.meta.env.VITE_CLIENT_URL !== 'undefined' && import.meta.env.VITE_CLIENT_URL !== 'null')
    ? import.meta.env.VITE_CLIENT_URL
    : (isLocal ? 'http://localhost:5173' : 'https://tauhidshekhar.vercel.app');

  // Collapsible navigation sections
  const [sections, setSections] = useState({
    content: true,
    engagement: true,
    management: true,
    config: false,
  });

  const toggleSection = (section) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    const fetchUnreadMessages = async () => {
      try {
        const res = await api.getMessages();
        if (res.success && Array.isArray(res.data)) {
          setUnreadCount(res.data.filter(m => !m.isRead && !m.isArchived).length);
        }
      } catch (err) {
        console.error('Unread messages fetch error:', err.message);
      }
    };

    if (isAuthenticated) {
      fetchUnreadMessages();
      const interval = setInterval(fetchUnreadMessages, 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleShortcuts = (e) => {
      if (e.key === 'Escape') {
        setSearchQuery('');
        setSearchFocused(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('admin-quick-search');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleShortcuts);
    return () => window.removeEventListener('keydown', handleShortcuts);
  }, []);

  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return ALL_MODULES.filter(m => m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q));
  }, [searchQuery]);

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(p => p);
    return (
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
        <Link to="/" className="hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors">Website</Link>
        {paths.map((p, idx) => {
          const url = `/${paths.slice(0, idx + 1).join('/')}`;
          const isLast = idx === paths.length - 1;
          const displayLabel = p === 'admin' ? 'CMS' : p.charAt(0).toUpperCase() + p.slice(1);
          return (
            <React.Fragment key={p}>
              <span>/</span>
              {isLast ? (
                <span className="text-[#C2272D] dark:text-[#00FFFF] font-extrabold">{displayLabel}</span>
              ) : (
                <Link to={url} className="hover:text-black dark:hover:text-white transition-colors">{displayLabel}</Link>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const activeLinkClass = "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#C2272D] text-white shadow-md shadow-[#C2272D]/25 transition-all text-left";
  const inactiveLinkClass = "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-all text-left group";

  const renderNavGroup = (isMobile = false) => {
    const handleLinkClick = () => {
      if (isMobile) setSidebarOpen(false);
    };

    return (
      <nav className="flex-1 p-3.5 flex flex-col gap-1 text-left overflow-y-auto">
        {/* Main Dashboard */}
        <Link 
          to="/admin/dashboard" 
          onClick={handleLinkClick} 
          className={isActive('/admin/dashboard') ? activeLinkClass : inactiveLinkClass}
        >
          <div className="flex items-center gap-2.5">
            <FaTachometerAlt size={14} className={isActive('/admin/dashboard') ? 'text-white' : 'text-[#C2272D] dark:text-[#00FFFF]'} /> 
            <span>Dashboard</span>
          </div>
          {isActive('/admin/dashboard') && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FFFF] shadow-[0_0_8px_#00FFFF]"></span>
          )}
        </Link>

        {/* Section: Content */}
        <div className="mt-4">
          <button 
            type="button"
            onClick={() => toggleSection('content')}
            className="w-full flex items-center justify-between px-2.5 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider cursor-pointer hover:text-black dark:hover:text-white transition-colors"
          >
            <span>Content Management</span>
            {sections.content ? <FaChevronUp size={8} /> : <FaChevronDown size={8} />}
          </button>
          {sections.content && (
            <div className="flex flex-col gap-0.5 mt-1 pl-1">
              {[
                { to: '/admin/cms', label: 'Home CMS', icon: FaHome },
                { to: '/admin/about', label: 'About Me', icon: FaUserCircle },
                { to: '/admin/skills', label: 'Skills & Tech', icon: FaCode },
                { to: '/admin/projects', label: 'Projects', icon: FaBriefcase },
                { to: '/admin/services', label: 'Services', icon: FaLaptopCode },
                { to: '/admin/experience', label: 'Experience', icon: FaHistory },
                { to: '/admin/education', label: 'Education', icon: FaAward },
                { to: '/admin/certificates', label: 'Certifications', icon: FaCertificate },
                { to: '/admin/achievements', label: 'Achievements', icon: FaAward },
                { to: '/admin/resume', label: 'Resume File', icon: FaFileAlt },
              ].map((item) => (
                <Link 
                  key={item.to} 
                  to={item.to} 
                  onClick={handleLinkClick} 
                  className={isActive(item.to) ? activeLinkClass : inactiveLinkClass}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon size={13} className={isActive(item.to) ? 'text-white' : 'text-slate-400 group-hover:text-[#C2272D] dark:group-hover:text-[#00FFFF] transition-colors'} />
                    <span>{item.label}</span>
                  </div>
                  {isActive(item.to) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00FFFF] shadow-[0_0_8px_#00FFFF]"></span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Section: Engagement */}
        <div className="mt-4">
          <button 
            type="button"
            onClick={() => toggleSection('engagement')}
            className="w-full flex items-center justify-between px-2.5 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider cursor-pointer hover:text-black dark:hover:text-white transition-colors"
          >
            <span>Engagement & Inquiries</span>
            {sections.engagement ? <FaChevronUp size={8} /> : <FaChevronDown size={8} />}
          </button>
          {sections.engagement && (
            <div className="flex flex-col gap-0.5 mt-1 pl-1">
              <Link to="/admin/blogs" onClick={handleLinkClick} className={isActive('/admin/blogs') ? activeLinkClass : inactiveLinkClass}>
                <div className="flex items-center gap-2.5">
                  <FaBook size={13} className={isActive('/admin/blogs') ? 'text-white' : 'text-slate-400 group-hover:text-[#C2272D] dark:group-hover:text-[#00FFFF]'} />
                  <span>Blog Articles</span>
                </div>
              </Link>
              <Link to="/admin/testimonials" onClick={handleLinkClick} className={isActive('/admin/testimonials') ? activeLinkClass : inactiveLinkClass}>
                <div className="flex items-center gap-2.5">
                  <FaQuoteLeft size={13} className={isActive('/admin/testimonials') ? 'text-white' : 'text-slate-400 group-hover:text-[#C2272D] dark:group-hover:text-[#00FFFF]'} />
                  <span>Testimonials</span>
                </div>
              </Link>
              <Link to="/admin/gallery" onClick={handleLinkClick} className={isActive('/admin/gallery') ? activeLinkClass : inactiveLinkClass}>
                <div className="flex items-center gap-2.5">
                  <FaImages size={13} className={isActive('/admin/gallery') ? 'text-white' : 'text-slate-400 group-hover:text-[#C2272D] dark:group-hover:text-[#00FFFF]'} />
                  <span>Media Gallery</span>
                </div>
              </Link>
              <Link to="/admin/messages" onClick={handleLinkClick} className={isActive('/admin/messages') ? activeLinkClass : inactiveLinkClass}>
                <div className="flex items-center gap-2.5">
                  <FaEnvelope size={13} className={isActive('/admin/messages') ? 'text-white' : 'text-slate-400 group-hover:text-[#C2272D] dark:group-hover:text-[#00FFFF]'} />
                  <span>Contact Inbox</span>
                </div>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-[#C2272D] text-white rounded-full leading-none shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <Link to="/admin/orders" onClick={handleLinkClick} className={isActive('/admin/orders') ? activeLinkClass : inactiveLinkClass}>
                <div className="flex items-center gap-2.5">
                  <FaShoppingBag size={13} className={isActive('/admin/orders') ? 'text-white' : 'text-slate-400 group-hover:text-[#C2272D] dark:group-hover:text-[#00FFFF]'} />
                  <span>Service Orders</span>
                </div>
              </Link>
              <Link to="/admin/community" onClick={handleLinkClick} className={isActive('/admin/community') ? activeLinkClass : inactiveLinkClass}>
                <div className="flex items-center gap-2.5">
                  <FaUsers size={13} className={isActive('/admin/community') ? 'text-white' : 'text-slate-400 group-hover:text-[#C2272D] dark:group-hover:text-[#00FFFF]'} />
                  <span>Community CMS</span>
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* Section: Management */}
        <div className="mt-4">
          <button 
            type="button"
            onClick={() => toggleSection('management')}
            className="w-full flex items-center justify-between px-2.5 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider cursor-pointer hover:text-black dark:hover:text-white transition-colors"
          >
            <span>System Management</span>
            {sections.management ? <FaChevronUp size={8} /> : <FaChevronDown size={8} />}
          </button>
          {sections.management && (
            <div className="flex flex-col gap-0.5 mt-1 pl-1">
              <Link to="/admin/media" onClick={handleLinkClick} className={isActive('/admin/media') ? activeLinkClass : inactiveLinkClass}>
                <div className="flex items-center gap-2.5">
                  <FaImages size={13} className={isActive('/admin/media') ? 'text-white' : 'text-slate-400 group-hover:text-[#C2272D] dark:group-hover:text-[#00FFFF]'} />
                  <span>Media Library</span>
                </div>
              </Link>
              <Link to="/admin/users" onClick={handleLinkClick} className={isActive('/admin/users') ? activeLinkClass : inactiveLinkClass}>
                <div className="flex items-center gap-2.5">
                  <FaUserCog size={13} className={isActive('/admin/users') ? 'text-white' : 'text-slate-400 group-hover:text-[#C2272D] dark:group-hover:text-[#00FFFF]'} />
                  <span>Users Directory</span>
                </div>
              </Link>
              <Link to="/admin/doubts" onClick={handleLinkClick} className={isActive('/admin/doubts') ? activeLinkClass : inactiveLinkClass}>
                <div className="flex items-center gap-2.5">
                  <FaQuestionCircle size={13} className={isActive('/admin/doubts') ? 'text-white' : 'text-slate-400 group-hover:text-[#C2272D] dark:group-hover:text-[#00FFFF]'} />
                  <span>Doubts Lounge</span>
                </div>
              </Link>
              <Link to="/admin/audit-logs" onClick={handleLinkClick} className={isActive('/admin/audit-logs') ? activeLinkClass : inactiveLinkClass}>
                <div className="flex items-center gap-2.5">
                  <FaHistory size={13} className={isActive('/admin/audit-logs') ? 'text-white' : 'text-slate-400 group-hover:text-[#C2272D] dark:group-hover:text-[#00FFFF]'} />
                  <span>Audit Logs</span>
                </div>
              </Link>
              <Link to="/admin/features" onClick={handleLinkClick} className={isActive('/admin/features') ? activeLinkClass : inactiveLinkClass}>
                <div className="flex items-center gap-2.5">
                  <FaRocket size={13} className={isActive('/admin/features') ? 'text-white' : 'text-slate-400 group-hover:text-[#C2272D] dark:group-hover:text-[#00FFFF]'} />
                  <span>Feature Flags</span>
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* Section: Config */}
        <div className="mt-4">
          <button 
            type="button"
            onClick={() => toggleSection('config')}
            className="w-full flex items-center justify-between px-2.5 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider cursor-pointer hover:text-black dark:hover:text-white transition-colors"
          >
            <span>Configurations</span>
            {sections.config ? <FaChevronUp size={8} /> : <FaChevronDown size={8} />}
          </button>
          {sections.config && (
            <div className="flex flex-col gap-0.5 mt-1 pl-1">
              <Link to="/admin/settings" onClick={handleLinkClick} className={isActive('/admin/settings') ? activeLinkClass : inactiveLinkClass}>
                <div className="flex items-center gap-2.5">
                  <FaCog size={13} className={isActive('/admin/settings') ? 'text-white' : 'text-slate-400 group-hover:text-[#C2272D] dark:group-hover:text-[#00FFFF]'} />
                  <span>Site Settings</span>
                </div>
              </Link>
              <Link to="/admin/seo" onClick={handleLinkClick} className={isActive('/admin/seo') ? activeLinkClass : inactiveLinkClass}>
                <div className="flex items-center gap-2.5">
                  <FaGlobe size={13} className={isActive('/admin/seo') ? 'text-white' : 'text-slate-400 group-hover:text-[#C2272D] dark:group-hover:text-[#00FFFF]'} />
                  <span>SEO & Meta Tags</span>
                </div>
              </Link>
              <Link to="/admin/theme" onClick={handleLinkClick} className={isActive('/admin/theme') ? activeLinkClass : inactiveLinkClass}>
                <div className="flex items-center gap-2.5">
                  <FaCog size={13} className={isActive('/admin/theme') ? 'text-white' : 'text-slate-400 group-hover:text-[#C2272D] dark:group-hover:text-[#00FFFF]'} />
                  <span>Theme Settings</span>
                </div>
              </Link>
              <Link to="/admin/analytics" onClick={handleLinkClick} className={isActive('/admin/analytics') ? activeLinkClass : inactiveLinkClass}>
                <div className="flex items-center gap-2.5">
                  <FaChartLine size={13} className={isActive('/admin/analytics') ? 'text-white' : 'text-slate-400 group-hover:text-[#C2272D] dark:group-hover:text-[#00FFFF]'} />
                  <span>Analytics</span>
                </div>
              </Link>
              <Link to="/admin/performance" onClick={handleLinkClick} className={isActive('/admin/performance') ? activeLinkClass : inactiveLinkClass}>
                <div className="flex items-center gap-2.5">
                  <FaRocket size={13} className={isActive('/admin/performance') ? 'text-white' : 'text-slate-400 group-hover:text-[#C2272D] dark:group-hover:text-[#00FFFF]'} />
                  <span>Performance</span>
                </div>
              </Link>
              <Link to="/admin/backup" onClick={handleLinkClick} className={isActive('/admin/backup') ? activeLinkClass : inactiveLinkClass}>
                <div className="flex items-center gap-2.5">
                  <FaDatabase size={13} className={isActive('/admin/backup') ? 'text-white' : 'text-slate-400 group-hover:text-[#C2272D] dark:group-hover:text-[#00FFFF]'} />
                  <span>Backup & Restore</span>
                </div>
              </Link>
              <Link to="/admin/security" onClick={handleLinkClick} className={isActive('/admin/security') ? activeLinkClass : inactiveLinkClass}>
                <div className="flex items-center gap-2.5">
                  <FaShieldAlt size={13} className={isActive('/admin/security') ? 'text-white' : 'text-slate-400 group-hover:text-[#C2272D] dark:group-hover:text-[#00FFFF]'} />
                  <span>Account Security</span>
                </div>
              </Link>
            </div>
          )}
        </div>
      </nav>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#C2272D]/20 border-t-[#C2272D] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080808] text-slate-800 dark:text-slate-100 flex font-sans">
      {/* Sidebar (Desktop) */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-[#0E0E0E] border-r border-slate-200 dark:border-white/10 h-screen sticky top-0 overflow-y-auto select-none shadow-sm z-30">
        
        {/* TS Branding Header */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center gap-2.5 group">
            <img 
              src={isDark ? "/assits/ts-logo-dark.jpg" : "/assits/ts-logo-red.jpg"} 
              alt="Tauhid Shekhar TS Logo" 
              className="w-9 h-9 rounded-xl object-cover ring-2 ring-[#C2272D]/30 dark:ring-[#00FFFF]/30 shadow-sm transition-transform duration-200 group-hover:scale-105" 
            />
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold font-title tracking-tight text-black dark:text-white leading-tight">Tauhid Shekhar</span>
              <span className="text-[10px] font-bold text-[#C2272D] dark:text-[#00FFFF] tracking-wider uppercase">PORTFOLIO CMS</span>
            </div>
          </Link>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-[#C2272D]/10 text-[#C2272D] dark:bg-[#00FFFF]/10 dark:text-[#00FFFF] rounded border border-[#C2272D]/20 dark:border-[#00FFFF]/20">
            v2.1
          </span>
        </div>

        {/* Sidebar Admin Profile Card */}
        <div className="p-3.5 mx-3 mt-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 flex items-center gap-3 text-left">
          {user?.avatar?.url ? (
            <img src={user.avatar.url} alt="Avatar" className="w-10 h-10 rounded-xl object-cover ring-2 ring-[#C2272D]/30 dark:ring-[#00FFFF]/30 shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-[#C2272D]/10 dark:bg-[#00FFFF]/10 text-[#C2272D] dark:text-[#00FFFF] flex items-center justify-center font-bold text-base shrink-0">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-black dark:text-white truncate">{user?.fullName || 'Administrator'}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                {user?.role || 'Admin'}
              </span>
            </div>
          </div>
        </div>

        {renderNavGroup(false)}

        {/* Bottom Quick Links */}
        <div className="p-3.5 border-t border-slate-200 dark:border-white/10 flex flex-col gap-1.5 text-left">
          <a
            href={clientUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#C2272D] dark:hover:text-[#00FFFF] hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <FaGlobe size={13} className="text-[#C2272D] dark:text-[#00FFFF]" />
            <span>Live Portfolio</span>
          </a>
          <a
            href={`${clientUrl}/community`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#C2272D] dark:hover:text-[#00FFFF] hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <FaUsers size={13} className="text-[#C2272D] dark:text-[#00FFFF]" />
            <span>DevCommunity</span>
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors w-full cursor-pointer text-left mt-1"
          >
            <FaSignOutAlt size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[1100] bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 w-72 max-w-[85vw] h-screen bg-white dark:bg-[#0E0E0E] z-[1200] border-r border-slate-200 dark:border-white/10 flex flex-col transition-transform duration-300 lg:hidden overflow-y-auto shadow-2xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <Link to="/admin/dashboard" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2.5">
            <img 
              src={isDark ? "/assits/ts-logo-dark.jpg" : "/assits/ts-logo-red.jpg"} 
              alt="TS Logo" 
              className="w-8 h-8 rounded-xl object-cover ring-2 ring-[#C2272D]/30 dark:ring-[#00FFFF]/30 shadow-sm" 
            />
            <span className="text-sm font-bold font-title text-black dark:text-white">Portfolio CMS</span>
          </Link>
          <button 
            type="button" 
            onClick={() => setSidebarOpen(false)} 
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Mobile Profile Banner */}
        <div className="p-3.5 mx-3 mt-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 flex items-center gap-3 text-left">
          {user?.avatar?.url ? (
            <img src={user.avatar.url} alt="Avatar" className="w-9 h-9 rounded-xl object-cover ring-2 ring-[#C2272D]/30 shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-[#C2272D]/10 text-[#C2272D] flex items-center justify-center font-bold text-sm shrink-0">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
          )}
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-black dark:text-white truncate">{user?.fullName || 'Administrator'}</h4>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">{user?.role || 'Admin'}</span>
          </div>
        </div>

        {renderNavGroup(true)}

        <div className="p-4 border-t border-slate-200 dark:border-white/10 flex flex-col gap-2 text-left">
          <a
            href={clientUrl}
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
          >
            <FaGlobe size={13} className="text-[#C2272D]" /> Live Website
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors w-full cursor-pointer"
          >
            <FaSignOutAlt size={13} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Modern Top Header Bar */}
        <header className="sticky top-0 bg-white/90 dark:bg-[#0E0E0E]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/10 h-16 flex items-center justify-between px-3 xs:px-4 sm:px-6 z-40 transition-colors">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              aria-label="Open navigation menu"
            >
              <FaBars size={16} />
            </button>

            {/* Back to Website Button */}
            <a
              href={clientUrl}
              className="hidden xs:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-all border border-slate-200 dark:border-white/5 shrink-0"
            >
              <span>&larr; <span className="hidden sm:inline">Back to</span> Website</span>
            </a>

            {/* Breadcrumbs */}
            <div className="hidden md:block truncate">
              {getBreadcrumbs()}
            </div>

            {/* Quick Find Module Search */}
            <div className="relative flex-1 max-w-[280px] hidden sm:block ml-auto">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <FaSearch size={11} />
              </span>
              <input
                type="text"
                id="admin-quick-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 250)}
                placeholder="Jump to module... (Ctrl+K)"
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141414] text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#C2272D] dark:focus:border-[#00FFFF] transition-all"
              />

              {/* Quick Search Results Dropdown */}
              {searchFocused && searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-1.5 p-1.5 bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto text-left">
                  {filteredModules.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-400">No modules matching "{searchQuery}"</div>
                  ) : (
                    filteredModules.map((m) => (
                      <Link
                        key={m.path}
                        to={m.path}
                        onClick={() => { setSearchQuery(''); setSearchFocused(false); }}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-xs text-slate-800 dark:text-slate-200 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <m.icon size={12} className="text-[#C2272D] dark:text-[#00FFFF]" />
                          <span className="font-semibold">{m.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">{m.category}</span>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2">
            
            {/* Live System Indicator */}
            <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Online</span>
            </div>

            {/* Notification Inbox Bell */}
            <Link
              to="/admin/messages"
              className="relative p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-white/5"
              title="Inbox Messages"
            >
              <FaBell size={14} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C2272D] text-white text-[9px] font-black flex items-center justify-center leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Theme Toggle Button (Persistent Light/Dark mode) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-white/10 cursor-pointer"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Theme"
            >
              {isDark ? <FaSun size={14} className="text-amber-400" /> : <FaMoon size={14} className="text-[#C2272D]" />}
            </button>

            {/* Admin Profile Details */}
            <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-white/10">
              {user?.avatar?.url ? (
                <img src={user.avatar.url} alt="Profile" className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-300 dark:ring-white/20" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-[#C2272D] text-white flex items-center justify-center text-xs font-bold font-title">
                  {user?.fullName?.charAt(0) || 'A'}
                </div>
              )}
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-bold text-black dark:text-white leading-tight truncate max-w-[110px]">
                  {user?.fullName || 'Admin'}
                </span>
                <span className="text-[10px] text-[#C2272D] dark:text-[#00FFFF] font-bold leading-tight uppercase">
                  {user?.role || 'Admin'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Route Container */}
        <main className="flex-1 p-3.5 xs:p-5 sm:p-7 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
