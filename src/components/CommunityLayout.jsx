import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { 
  FaComments, FaUsers, FaFolderOpen, FaBriefcase, FaCrown, 
  FaBell, FaGlobe, FaArrowLeft, FaUser, FaTachometerAlt,
  FaQuestionCircle, FaCode
} from 'react-icons/fa';

const CommunityLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await api.getCommunityNotifications();
        if (res.success) {
          const unread = (res.data || []).filter(n => !n.read).length;
          setNotifCount(unread);
        }
      } catch (_) {}
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000); // Poll notifications count
    return () => clearInterval(interval);
  }, []);

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
    };
    window.addEventListener('keydown', handleShortcuts);
    return () => window.removeEventListener('keydown', handleShortcuts);
  }, [navigate]);

  const navItems = [
    { name: 'Feed Discussion', path: '/community', icon: <FaGlobe /> },
    { name: 'Group Boards', path: '/community/groups', icon: <FaUsers /> },
    { name: 'Doubt Lounge Q&A', path: '/community/doubts', icon: <FaQuestionCircle /> },
    { name: 'Project Discussions', path: '/community/projects', icon: <FaCode /> },
    { name: 'Direct Messages', path: '/community/chat', icon: <FaComments /> },
    { name: 'Resource Center', path: '/community/resources', icon: <FaFolderOpen /> },
    { name: 'Careers & Jobs', path: '/community/jobs', icon: <FaBriefcase /> },
    { name: 'XP Leaderboard', path: '/community/leaderboard', icon: <FaCrown /> }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-800 dark:text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-[50] w-full border-b border-slate-200/60 dark:border-white/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Back to Website Button */}
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-350 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-white/5"
          >
            <span>&larr; Back to Website</span>
          </Link>
          <span className="h-4 w-px bg-slate-200 dark:bg-white/10" />
          <h1 className="text-sm font-black font-title tracking-wider text-black dark:text-white uppercase">
            Tauhid Shekhar Community
          </h1>
        </div>

        {/* User Status Deck */}
        <div className="flex items-center gap-4">
          {/* Notifications Trigger */}
          <Link to="/community/notifications" className="relative p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-slate-350">
            <FaBell size={14} />
            {notifCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[8px] font-black text-white flex items-center justify-center">
                {notifCount}
              </span>
            )}
          </Link>

          {/* Profile Details */}
          <Link to={`/community/profile/${user?.id || user?._id}`} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-900 border border-slate-200/50 dark:border-white/5 flex items-center justify-center shrink-0">
              {user?.avatar?.url ? (
                <img src={user.avatar.url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <FaUser className="text-slate-400" />
              )}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[11px] font-bold text-black dark:text-white truncate max-w-[100px]">{user?.fullName}</span>
              <span className="text-[9px] font-bold text-primary-blue tracking-wider uppercase">Level {Math.floor((user?.xp || 0) / 100) + 1}</span>
            </div>
          </Link>
          
          {user?.role === 'Admin' && (
            <Link to="/admin" className="p-2 rounded-xl bg-primary-blue/10 text-primary-blue border border-primary-blue/20 text-xs font-bold flex items-center gap-1.5 hover:bg-primary-blue/20 transition-colors">
              <FaTachometerAlt /> <span className="hidden md:inline">CMS</span>
            </Link>
          )}
        </div>
      </header>

      {/* Main Body Grid */}
      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1440px] mx-auto min-h-0">
        
        {/* Desktop Sidebar Navigator */}
        <aside className="hidden lg:block w-64 border-r border-slate-200/60 dark:border-white/5 bg-white dark:bg-slate-900/30 p-6 shrink-0 text-left">
          <nav className="flex flex-col gap-1.5">
            {navItems.map(item => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    active 
                      ? 'bg-primary-blue text-white shadow-md shadow-primary-blue/15' 
                      : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  <span className="text-sm shrink-0">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 p-4 rounded-2xl bg-gradient-to-br from-primary-blue/5 to-primary-cyan/5 border border-primary-blue/10 text-left">
            <span className="text-[9px] font-bold text-primary-blue tracking-widest uppercase block mb-1">Your Reputation</span>
            <div className="flex justify-between items-baseline mb-2">
              <h4 className="text-lg font-black text-black dark:text-white">{user?.xp || 0} <span className="text-[10px] text-slate-400 font-bold uppercase">XP</span></h4>
              <span className="text-[10px] font-bold text-primary-cyan uppercase tracking-wider">{user?.reputation || 0} Rep</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary-blue to-primary-cyan"
                style={{ width: `${(user?.xp || 0) % 100}%` }}
              />
            </div>
            <span className="text-[8px] text-slate-500 mt-1 block uppercase font-bold tracking-wider">Next Level in {100 - ((user?.xp || 0) % 100)} XP</span>
          </div>
        </aside>

        {/* Mobile Navigation Bar (Horizontal Scrollable) */}
        <div className="lg:hidden border-b border-slate-200/50 dark:border-white/5 bg-white dark:bg-slate-900/50 flex gap-2 overflow-x-auto px-4 py-2 scrollbar-none">
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all ${
                  active 
                    ? 'bg-primary-blue text-white shadow-md' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <span>{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Active Route Wrapper View */}
        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default CommunityLayout;
