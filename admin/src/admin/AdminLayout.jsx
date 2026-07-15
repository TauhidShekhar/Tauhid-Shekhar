import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { 
  FaTachometerAlt, FaBriefcase, FaCode, FaEnvelope, FaCog, FaSignOutAlt, 
  FaBars, FaTimes, FaGlobe, FaChevronDown, FaChevronUp, FaBook, FaQuoteLeft, 
  FaImages, FaFileAlt, FaCertificate, FaAward, FaHistory, FaDatabase, FaShieldAlt, 
  FaUserCog, FaChartLine, FaMoon, FaSun, FaUserCircle, FaHome, FaShoppingBag, FaLaptopCode, FaUsers,
  FaRocket, FaQuestionCircle
} from 'react-icons/fa';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();

  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const clientUrl = (import.meta.env.VITE_CLIENT_URL && import.meta.env.VITE_CLIENT_URL !== 'undefined' && import.meta.env.VITE_CLIENT_URL !== 'null')
    ? import.meta.env.VITE_CLIENT_URL
    : (isLocal ? 'http://localhost:5173' : 'https://tauhidshekhar.vercel.app');

  // Collapsible section states
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
    // Redirect to login if not authenticated (after check is done)
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    const fetchUnreadMessages = async () => {
      try {
        const res = await api.getMessages();
        if (res.success) {
          setUnreadCount(res.data.filter(m => !m.isRead && !m.isArchived).length);
        }
      } catch (err) {
        console.error('Unread messages fetch error:', err.message);
      }
    };

    if (isAuthenticated) {
      fetchUnreadMessages();
      const interval = setInterval(fetchUnreadMessages, 60000); // refresh every minute
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleShortcuts = (e) => {
      // Esc -> Back to website
      if (e.key === 'Escape') {
        navigate('/');
      }
      // Alt + H -> Go Home
      if (e.altKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        navigate('/');
      }
      // Alt + D -> Go Dashboard
      if (e.altKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        navigate('/admin/dashboard');
      }
    };
    window.addEventListener('keydown', handleShortcuts);
    return () => window.removeEventListener('keydown', handleShortcuts);
  }, [navigate]);

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(p => p);
    return (
      <div className="flex items-center gap-1.5 text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
        <Link to="/" className="hover:text-primary-blue transition-colors">Home</Link>
        {paths.map((p, idx) => {
          const url = `/${paths.slice(0, idx + 1).join('/')}`;
          const isLast = idx === paths.length - 1;
          const displayLabel = p === 'admin' ? 'Admin' : p.charAt(0).toUpperCase() + p.slice(1);
          return (
            <React.Fragment key={p}>
              <span>/</span>
              {isLast ? (
                <span className="text-slate-700 dark:text-slate-350">{displayLabel}</span>
              ) : (
                <Link to={url} className="hover:text-primary-blue transition-colors">{displayLabel}</Link>
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

  const activeLinkClass = "flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold bg-primary-blue text-white shadow-md shadow-primary-blue/15 transition-all text-left";
  const inactiveLinkClass = "flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-550 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-black dark:hover:text-white transition-all text-left";

  const renderNavigation = (isMobile = false) => {
    const handleLinkClick = () => {
      if (isMobile) setSidebarOpen(false);
    };

    return (
      <nav className="flex-1 p-3 flex flex-col gap-1 text-left overflow-y-auto">
        {/* Main */}
        <Link to="/admin/dashboard" onClick={handleLinkClick} className={isActive('/admin/dashboard') ? activeLinkClass : inactiveLinkClass}>
          <FaTachometerAlt size={14} /> Dashboard
        </Link>

        {/* Section: Content */}
        <div className="mt-4">
          <button 
            onClick={() => toggleSection('content')}
            className="w-full flex items-center justify-between px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest cursor-pointer hover:text-slate-600 dark:hover:text-slate-350"
          >
            Content Management {sections.content ? <FaChevronUp size={8} /> : <FaChevronDown size={8} />}
          </button>
          {sections.content && (
            <div className="flex flex-col gap-0.5 mt-1.5 pl-1.5">
              <Link to="/admin/cms" onClick={handleLinkClick} className={isActive('/admin/cms') ? activeLinkClass : inactiveLinkClass}>
                <FaHome size={12} /> Home
              </Link>
              <Link to="/admin/about" onClick={handleLinkClick} className={isActive('/admin/about') ? activeLinkClass : inactiveLinkClass}>
                <FaUserCircle size={12} /> About
              </Link>
              <Link to="/admin/skills" onClick={handleLinkClick} className={isActive('/admin/skills') ? activeLinkClass : inactiveLinkClass}>
                <FaCode size={12} /> Skills
              </Link>
              <Link to="/admin/projects" onClick={handleLinkClick} className={isActive('/admin/projects') ? activeLinkClass : inactiveLinkClass}>
                <FaBriefcase size={12} /> Projects
              </Link>
              <Link to="/admin/services" onClick={handleLinkClick} className={isActive('/admin/services') ? activeLinkClass : inactiveLinkClass}>
                <FaLaptopCode size={12} /> Services
              </Link>
              <Link to="/admin/experience" onClick={handleLinkClick} className={isActive('/admin/experience') ? activeLinkClass : inactiveLinkClass}>
                <FaHistory size={12} /> Experience
              </Link>
              <Link to="/admin/education" onClick={handleLinkClick} className={isActive('/admin/education') ? activeLinkClass : inactiveLinkClass}>
                <FaAward size={12} /> Education
              </Link>
              <Link to="/admin/certificates" onClick={handleLinkClick} className={isActive('/admin/certificates') ? activeLinkClass : inactiveLinkClass}>
                <FaCertificate size={12} /> Certifications
              </Link>
              <Link to="/admin/achievements" onClick={handleLinkClick} className={isActive('/admin/achievements') ? activeLinkClass : inactiveLinkClass}>
                <FaAward size={12} /> Achievements
              </Link>
              <Link to="/admin/resume" onClick={handleLinkClick} className={isActive('/admin/resume') ? activeLinkClass : inactiveLinkClass}>
                <FaFileAlt size={12} /> Resume
              </Link>
            </div>
          )}
        </div>

        {/* Section: Engagement */}
        <div className="mt-4">
          <button 
            onClick={() => toggleSection('engagement')}
            className="w-full flex items-center justify-between px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest cursor-pointer hover:text-slate-600 dark:hover:text-slate-350"
          >
            Engagement {sections.engagement ? <FaChevronUp size={8} /> : <FaChevronDown size={8} />}
          </button>
          {sections.engagement && (
            <div className="flex flex-col gap-0.5 mt-1.5 pl-1.5">
              <Link to="/admin/blogs" onClick={handleLinkClick} className={isActive('/admin/blogs') ? activeLinkClass : inactiveLinkClass}>
                <FaBook size={12} /> Blog Posts
              </Link>
              <Link to="/admin/testimonials" onClick={handleLinkClick} className={isActive('/admin/testimonials') ? activeLinkClass : inactiveLinkClass}>
                <FaQuoteLeft size={12} /> Testimonials
              </Link>
              <Link to="/admin/gallery" onClick={handleLinkClick} className={isActive('/admin/gallery') ? activeLinkClass : inactiveLinkClass}>
                <FaImages size={12} /> Media Gallery
              </Link>
              <Link to="/admin/messages" onClick={handleLinkClick} className={isActive('/admin/messages') ? activeLinkClass : inactiveLinkClass}>
                <FaEnvelope size={12} /> 
                <span className="flex items-center justify-between w-full">
                  Contact Messages
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[9px] font-black bg-red-500 text-white rounded-full leading-none">{unreadCount}</span>
                  )}
                </span>
              </Link>
              <Link to="/admin/orders" onClick={handleLinkClick} className={isActive('/admin/orders') ? activeLinkClass : inactiveLinkClass}>
                <FaShoppingBag size={12} /> Service Orders
              </Link>
              <Link to="/admin/community" onClick={handleLinkClick} className={isActive('/admin/community') ? activeLinkClass : inactiveLinkClass}>
                <FaUsers size={12} /> Community CMS
              </Link>
            </div>
          )}
        </div>

        {/* Section: Management */}
        <div className="mt-4">
          <button 
            onClick={() => toggleSection('management')}
            className="w-full flex items-center justify-between px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest cursor-pointer hover:text-slate-600 dark:hover:text-slate-350"
          >
            System Management {sections.management ? <FaChevronUp size={8} /> : <FaChevronDown size={8} />}
          </button>
          {sections.management && (
            <div className="flex flex-col gap-0.5 mt-1.5 pl-1.5">
              <Link to="/admin/media" onClick={handleLinkClick} className={isActive('/admin/media') ? activeLinkClass : inactiveLinkClass}>
                <FaImages size={12} /> Media Library
              </Link>
              <Link to="/admin/users" onClick={handleLinkClick} className={isActive('/admin/users') ? activeLinkClass : inactiveLinkClass}>
                <FaUserCog size={12} /> Users Directory
              </Link>
              <Link to="/admin/doubts" onClick={handleLinkClick} className={isActive('/admin/doubts') ? activeLinkClass : inactiveLinkClass}>
                <FaQuestionCircle size={12} /> Doubts Lounge
              </Link>
              <Link to="/admin/audit-logs" onClick={handleLinkClick} className={isActive('/admin/audit-logs') ? activeLinkClass : inactiveLinkClass}>
                <FaHistory size={12} /> System Audit Logs
              </Link>
              <Link to="/admin/features" onClick={handleLinkClick} className={isActive('/admin/features') ? activeLinkClass : inactiveLinkClass}>
                <FaRocket size={12} /> Feature Management
              </Link>
            </div>
          )}
        </div>

        {/* Section: Config */}
        <div className="mt-4">
          <button 
            onClick={() => toggleSection('config')}
            className="w-full flex items-center justify-between px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest cursor-pointer hover:text-slate-600 dark:hover:text-slate-350"
          >
            Configurations {sections.config ? <FaChevronUp size={8} /> : <FaChevronDown size={8} />}
          </button>
          {sections.config && (
            <div className="flex flex-col gap-0.5 mt-1.5 pl-1.5">
              <Link to="/admin/settings" onClick={handleLinkClick} className={isActive('/admin/settings') ? activeLinkClass : inactiveLinkClass}>
                <FaCog size={12} /> Site Settings
              </Link>
              <Link to="/admin/seo" onClick={handleLinkClick} className={isActive('/admin/seo') ? activeLinkClass : inactiveLinkClass}>
                <FaGlobe size={12} /> SEO & Tags
              </Link>
              <Link to="/admin/theme" onClick={handleLinkClick} className={isActive('/admin/theme') ? activeLinkClass : inactiveLinkClass}>
                <FaCog size={12} /> Theme Settings
              </Link>
              <Link to="/admin/analytics" onClick={handleLinkClick} className={isActive('/admin/analytics') ? activeLinkClass : inactiveLinkClass}>
                <FaChartLine size={12} /> Analytics Dashboard
              </Link>
              <Link to="/admin/performance" onClick={handleLinkClick} className={isActive('/admin/performance') ? activeLinkClass : inactiveLinkClass}>
                <FaRocket size={12} /> System Performance
              </Link>
              <Link to="/admin/backup" onClick={handleLinkClick} className={isActive('/admin/backup') ? activeLinkClass : inactiveLinkClass}>
                <FaDatabase size={12} /> Backup & Restore
              </Link>
              <Link to="/admin/security" onClick={handleLinkClick} className={isActive('/admin/security') ? activeLinkClass : inactiveLinkClass}>
                <FaShieldAlt size={12} /> Account Security
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
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-primary-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-800 dark:text-slate-100 flex font-sans">
      {/* Sidebar (Desktop) */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200/60 dark:border-white/5 h-screen sticky top-0 overflow-y-auto">
        <div className="p-5 border-b border-slate-200/60 dark:border-white/5 flex items-center justify-between">
          <span className="text-sm font-black font-title tracking-wider text-black dark:text-white uppercase">Portfolio CMS</span>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-primary-blue/10 text-primary-blue rounded border border-primary-blue/20">v2.0</span>
        </div>

        {/* Sidebar User profile info */}
        <div className="p-4 border-b border-slate-200/60 dark:border-white/5 flex items-center gap-3.5 text-left">
          {user?.avatar?.url ? (
            <img src={user.avatar.url} alt="Avatar" className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-white/5" />
          ) : (
            <FaUserCircle className="text-slate-400" size={40} />
          )}
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-black dark:text-white truncate">{user?.fullName}</h4>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">{user?.role}</span>
          </div>
        </div>

        {renderNavigation(false)}

        <div className="p-4 border-t border-slate-200/60 dark:border-white/5 flex flex-col gap-2">
          <a
            href={clientUrl}
            className="flex items-center gap-3 px-4 py-2 rounded-xl text-[10px] font-bold text-slate-550 dark:text-slate-400 hover:text-primary-blue transition-colors text-left"
          >
            <FaGlobe /> Live Portfolio Web
          </a>
          <a
            href={`${clientUrl}/community`}
            className="flex items-center gap-3 px-4 py-2 rounded-xl text-[10px] font-bold text-slate-550 dark:text-slate-400 hover:text-primary-blue transition-colors text-left"
          >
            <FaUsers /> DevCommunity Platform
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors w-full cursor-pointer text-left"
          >
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[1100] bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Mobile Drawer) */}
      <aside
        className={`fixed top-0 left-0 w-64 h-screen bg-white dark:bg-slate-950 z-[1200] border-r border-slate-200/60 dark:border-white/5 flex flex-col transition-transform duration-305 lg:hidden overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-slate-200/60 dark:border-white/5 flex items-center justify-between">
          <span className="text-sm font-black font-title tracking-wider text-black dark:text-white uppercase">Portfolio CMS</span>
          <button onClick={() => setSidebarOpen(false)} className="text-xl text-slate-700 dark:text-slate-300 cursor-pointer p-1">
            <FaTimes />
          </button>
        </div>

        {/* Mobile Sidebar User profile info */}
        <div className="p-4 border-b border-slate-200/60 dark:border-white/5 flex items-center gap-3.5 text-left">
          {user?.avatar?.url ? (
            <img src={user.avatar.url} alt="Avatar" className="w-10 h-10 rounded-xl object-cover" />
          ) : (
            <FaUserCircle className="text-slate-400" size={40} />
          )}
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-black dark:text-white truncate">{user?.fullName}</h4>
            <span className="text-[10px] text-slate-450 font-semibold uppercase">{user?.role}</span>
          </div>
        </div>

        {renderNavigation(true)}

        <div className="p-4 border-t border-slate-200/60 dark:border-white/5 flex flex-col gap-2">
          <a
            href={clientUrl}
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-4 py-2 rounded-xl text-[10px] font-bold text-slate-550 dark:text-slate-400 hover:text-primary-blue text-left"
          >
            <FaGlobe /> Live Website
          </a>
          <a
            href={`${clientUrl}/community`}
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-4 py-2 rounded-xl text-[10px] font-bold text-slate-550 dark:text-slate-400 hover:text-primary-blue text-left"
          >
            <FaUsers /> DevCommunity Platform
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors w-full cursor-pointer text-left animate-pulse"
          >
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Bar */}
        <header className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-white/5 h-16 flex items-center justify-between px-4 sm:px-6 z-50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-xl text-slate-700 dark:text-slate-350 lg:hidden cursor-pointer p-1"
            >
              <FaBars />
            </button>

            {/* Back to Website Button */}
            <a
              href={clientUrl}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] sm:text-xs font-bold transition-all border border-slate-200 dark:border-white/5"
            >
              <span>&larr; <span className="hidden sm:inline">Back to Website</span></span>
            </a>

            {/* Breadcrumbs */}
            <div className="hidden md:block">
              {getBreadcrumbs()}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:block text-xs font-bold text-slate-550 dark:text-slate-400">
              Welcome back, <span className="text-black dark:text-white font-black">{user?.fullName || 'Admin'}</span>
            </div>
            
            <div className="hidden sm:block text-[10px] font-extrabold px-3 py-1.5 rounded-lg bg-green-500/10 text-green-500 border border-green-500/25">
              SYSTEM ONLINE
            </div>
          </div>
        </header>

        {/* Dynamic Route Container */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
