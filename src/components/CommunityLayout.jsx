import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { 
  FaHome, FaGlobe, FaUsers, FaFolderOpen, FaBriefcase, FaCrown, 
  FaBell, FaComments, FaUser, FaCog, FaPlus, FaTimes, FaBars, 
  FaCheckCircle, FaHashtag, FaAngleDown, FaTachometerAlt, FaCompass, FaQuestionCircle, FaCode,
  FaGift, FaBrain, FaTasks, FaCoins, FaSun, FaMoon, FaArrowLeft, FaCalendarAlt
} from 'react-icons/fa';

const CommunityLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('communitySidebarCollapsed') === 'true';
    } catch {
      return false;
    }
  });

  // Theme synchronization with main website
  const [isDark, setIsDark] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) return savedTheme === 'dark';
      return document.documentElement.classList.contains('darkmode') || 
        window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('darkmode');
      document.body.classList.add('darkmode');
    } else {
      document.documentElement.classList.remove('darkmode');
      document.body.classList.remove('darkmode');
    }
  }, [isDark]);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('darkmode');
      document.body.classList.add('darkmode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('darkmode');
      document.body.classList.remove('darkmode');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('communitySidebarCollapsed', sidebarCollapsed ? 'true' : 'false');
    } catch (err) {
      console.warn('Failed to save sidebar state to localStorage:', err);
    }
  }, [sidebarCollapsed]);
  
  const [notifCount, setNotifCount] = useState(0);
  const [myGroups, setMyGroups] = useState([]);
  const [suggestedGroups, setSuggestedGroups] = useState([]);
  const [suggestedDevs, setSuggestedDevs] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [followDeveloperLoading, setFollowDeveloperLoading] = useState({});
  const [leaderboardTimeframe, setLeaderboardTimeframe] = useState('weekly');
  const [mobileSectionsExpanded, setMobileSectionsExpanded] = useState({
    actions: true,
    suggested: false,
    leaderboard: false,
    stats: false,
    tags: false,
    announcements: false,
    events: false
  });
  
  const toggleMobileSection = (section) => {
    setMobileSectionsExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderRightSidebar = (isMobile) => {
    const isSectionExpanded = (key) => {
      if (!isMobile) return true;
      return mobileSectionsExpanded[key];
    };

    return (
      <div className="flex flex-col gap-5 w-full">
        
        {/* SECTION: QUICK ACTIONS */}
        <div className="bg-white dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 rounded-2xl flex flex-col shadow-sm overflow-hidden hover:border-[#C2272D]/40 transition-all duration-300 text-left card-interactive">
          <button 
            type="button"
            disabled={!isMobile}
            onClick={() => toggleMobileSection('actions')}
            className="w-full p-3.5 sm:p-4 flex items-center justify-between border-b border-[#E5E7EB] dark:border-white/10 bg-[#F8FAFC] dark:bg-[#17171e]/50 select-none cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#C2272D]/10 rounded-lg text-[#C2272D]">
                <FaPlus size={10} />
              </span>
              <span className="text-[11px] font-black text-[#171717] dark:text-slate-300 uppercase tracking-wider font-title">Quick Actions</span>
            </div>
            {isMobile && (
              <span className={`text-[#525252] dark:text-slate-400 transition-transform duration-250 ${isSectionExpanded('actions') ? 'rotate-180' : ''}`}>
                <FaAngleDown size={14} />
              </span>
            )}
          </button>

          {isSectionExpanded('actions') && (
            <div className="p-3.5 sm:p-4 flex flex-col gap-2">
              {[
                { name: 'Create Post', icon: <FaPlus />, path: '/community' },
                { name: 'Upload Resource', icon: <FaFolderOpen />, path: '/community/resources' },
                { name: 'Ask AI Assistant', icon: <FaBrain />, path: '/community/ai-assistant' },
                { name: 'Create Community Group', icon: <FaUsers />, path: '/community/groups' },
                { name: 'Top Developers', icon: <FaCrown />, path: '/community/leaderboard' }
              ].map((action, idx) => (
                <Link
                  key={idx}
                  to={action.path}
                  className="flex items-center justify-between p-2.5 bg-[#F8FAFC] dark:bg-[#181820]/60 hover:bg-[#F1F5F9] dark:hover:bg-[#20202c] border border-[#E5E7EB] dark:border-white/5 hover:border-[#C2272D]/30 rounded-xl transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[#525252] dark:text-slate-400 group-hover:text-[#C2272D] transition-colors text-xs">{action.icon}</span>
                    <span className="text-[11px] font-bold text-[#171717] dark:text-slate-200 group-hover:text-[#C2272D] dark:group-hover:text-white transition-colors">{action.name}</span>
                  </div>
                  <span className="text-[11px] text-[#737373] dark:text-slate-500 group-hover:text-[#C2272D] group-hover:translate-x-1 transition-all">→</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* SECTION: SUGGESTED DEVELOPERS */}
        <div className="bg-white dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 rounded-2xl flex flex-col shadow-sm overflow-hidden hover:border-[#C2272D]/40 transition-all duration-300 text-left card-interactive">
          <button
            type="button"
            disabled={!isMobile}
            onClick={() => toggleMobileSection('suggested')}
            className="w-full p-3.5 sm:p-4 flex items-center justify-between border-b border-[#E5E7EB] dark:border-white/10 bg-[#F8FAFC] dark:bg-[#17171e]/50 select-none cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#C2272D]/10 rounded-lg text-[#C2272D]">
                <FaUser size={10} />
              </span>
              <span className="text-[11px] font-black text-[#171717] dark:text-slate-300 uppercase tracking-wider font-title">Suggested Developers</span>
            </div>
            {isMobile && (
              <span className={`text-[#525252] dark:text-slate-400 transition-transform duration-250 ${isSectionExpanded('suggested') ? 'rotate-180' : ''}`}>
                <FaAngleDown size={14} />
              </span>
            )}
          </button>

          {isSectionExpanded('suggested') && (
            <div className="p-3.5 sm:p-4 flex flex-col gap-3">
              {suggestedDevs.filter(Boolean).slice(0, 5).map((dev) => {
                const currentUserId = (user?.id || user?._id)?.toString();
                const isFollowing = dev.followers?.some(fid => fid && fid.toString() === currentUserId);
                
                const isVerified = dev.xp >= 300;
                const devRole = dev.role === 'Admin' ? 'Admin' : 
                                dev.xp >= 300 ? 'Contributor' : 'Member';

                return (
                  <div key={dev._id} className="flex items-center justify-between gap-3 p-1 rounded-xl">
                    <Link to={`/community/profile/${dev._id}`} className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-90">
                      <div className="relative shrink-0">
                        <div className="w-9 h-9 rounded-xl overflow-hidden bg-[#E5E7EB] dark:bg-[#1e1e24] border border-[#E5E7EB] dark:border-white/10 flex items-center justify-center shadow-inner">
                          {dev.avatar?.url ? (
                            <img src={dev.avatar.url} alt="Profile" className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <FaUser className="text-[#737373] dark:text-slate-500" size={13} />
                          )}
                        </div>
                        {dev.isActive !== false && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white dark:border-[#111111]" />
                        )}
                      </div>
                      
                      <div className="flex flex-col text-left min-w-0">
                        <h5 className="text-[11px] font-black text-[#171717] dark:text-white flex items-center gap-1 leading-snug">
                          <span className="truncate">{dev.fullName}</span>
                          {isVerified && <FaCheckCircle size={10} className="text-[#00FFFF] shrink-0" title="Verified Creator" />}
                        </h5>
                        <span className="text-[9px] text-[#525252] dark:text-slate-400 truncate">{devRole} • {dev.xp || 0} XP</span>
                      </div>
                    </Link>

                    <button
                      onClick={() => handleFollowDeveloper(dev._id)}
                      disabled={followDeveloperLoading[dev._id]}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border cursor-pointer transition-all duration-200 shrink-0 flex items-center gap-1 ${
                        isFollowing 
                          ? 'bg-transparent border-[#E5E7EB] dark:border-slate-700 text-[#525252] dark:text-slate-400 hover:border-red-500 hover:text-red-500' 
                          : 'bg-[#C2272D] hover:bg-[#A51E23] border-[#C2272D] text-white shadow-sm active:scale-95'
                      } ${followDeveloperLoading[dev._id] ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {followDeveloperLoading[dev._id] && <div className="w-2 h-2 rounded-full border border-white/30 border-t-white animate-spin shrink-0" />}
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                );
              })}

              {suggestedDevs.length === 0 && (
                <div className="text-[10px] text-[#737373] dark:text-slate-500 italic text-center py-3">No recommendations yet.</div>
              )}

              <Link 
                to="/community/leaderboard"
                className="mt-1 w-full py-2 bg-[#F8FAFC] dark:bg-[#181820] hover:bg-[#C2272D] hover:text-white text-[#171717] dark:text-slate-300 border border-[#E5E7EB] dark:border-white/5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1.5"
              >
                <FaCrown size={10} /> View Full Leaderboard
              </Link>
            </div>
          )}
        </div>

        {/* SECTION: TOP LEADERBOARD HIGHLIGHTS */}
        <div className="bg-white dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 rounded-2xl flex flex-col shadow-sm overflow-hidden hover:border-[#C2272D]/40 transition-all duration-300 text-left card-interactive">
          <button
            type="button"
            disabled={!isMobile}
            onClick={() => toggleMobileSection('leaderboard')}
            className="w-full p-3.5 sm:p-4 flex items-center justify-between border-b border-[#E5E7EB] dark:border-white/10 bg-[#F8FAFC] dark:bg-[#17171e]/50 select-none cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#C2272D]/10 rounded-lg text-[#C2272D]">
                <FaCrown size={10} />
              </span>
              <span className="text-[11px] font-black text-[#171717] dark:text-slate-300 uppercase tracking-wider font-title">Global Leaderboard</span>
            </div>
            {isMobile && (
              <span className={`text-[#525252] dark:text-slate-400 transition-transform duration-250 ${isSectionExpanded('leaderboard') ? 'rotate-180' : ''}`}>
                <FaAngleDown size={14} />
              </span>
            )}
          </button>

          {isSectionExpanded('leaderboard') && (
            <div className="p-3.5 sm:p-4 flex flex-col gap-3">
              <div className="flex bg-[#F8FAFC] dark:bg-[#181820] p-1 rounded-xl border border-[#E5E7EB] dark:border-white/5">
                {['weekly', 'all-time'].map((timeframe) => (
                  <button
                    key={timeframe}
                    onClick={() => setLeaderboardTimeframe(timeframe)}
                    className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      leaderboardTimeframe === timeframe
                        ? 'bg-[#C2272D] text-white shadow-sm'
                        : 'text-[#525252] dark:text-slate-400 hover:text-[#171717] dark:hover:text-white'
                    }`}
                  >
                    {timeframe.replace('-', ' ')}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                {suggestedDevs.filter(Boolean).slice(0, 3).map((dev, idx) => {
                  const medalColors = 
                    idx === 0 ? 'bg-amber-400/10 border-amber-400/30 text-amber-500' :
                    idx === 1 ? 'bg-slate-300/10 border-slate-400/30 text-slate-400' :
                    'bg-amber-700/10 border-amber-700/30 text-amber-700';

                  const medalLabel = idx === 0 ? 'Gold' : idx === 1 ? 'Silver' : 'Bronze';

                  const displayedXP = leaderboardTimeframe === 'weekly' 
                    ? Math.max(20, Math.floor(dev.xp * 0.4)) 
                    : dev.xp;

                  return (
                    <div 
                      key={dev._id} 
                      className={`flex items-center justify-between p-2.5 rounded-xl border ${medalColors} shadow-sm`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-[10px] font-black w-4 text-center shrink-0">#{idx + 1}</span>
                        <div className="w-7 h-7 rounded-lg overflow-hidden bg-[#E5E7EB] dark:bg-[#1e1e24] border border-[#E5E7EB] dark:border-white/10 shrink-0">
                          {dev.avatar?.url ? (
                            <img src={dev.avatar.url} alt="medal user" className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <div className="w-full h-full bg-[#C2272D]/10 text-[#C2272D] font-extrabold flex items-center justify-center text-[10px]">
                              {dev.fullName ? dev.fullName[0] : 'U'}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col text-left min-w-0">
                          <span className="text-[10px] font-black text-[#171717] dark:text-white truncate">{dev.fullName}</span>
                          <span className="text-[8px] text-[#525252] dark:text-slate-400">{displayedXP || 0} XP</span>
                        </div>
                      </div>
                      <span className="text-[7px] font-black tracking-widest uppercase bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-1.5 py-0.5 rounded text-[#525252] dark:text-slate-400 shrink-0">{medalLabel}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* SECTION: COMMUNITY STATISTICS */}
        <div className="bg-white dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 rounded-2xl flex flex-col shadow-sm overflow-hidden hover:border-[#C2272D]/40 transition-all duration-300 text-left card-interactive">
          <button
            type="button"
            disabled={!isMobile}
            onClick={() => toggleMobileSection('stats')}
            className="w-full p-3.5 sm:p-4 flex items-center justify-between border-b border-[#E5E7EB] dark:border-white/10 bg-[#F8FAFC] dark:bg-[#17171e]/50 select-none cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#C2272D]/10 rounded-lg text-[#C2272D]">
                <FaTachometerAlt size={10} />
              </span>
              <span className="text-[11px] font-black text-[#171717] dark:text-slate-300 uppercase tracking-wider font-title">Community Statistics</span>
            </div>
            {isMobile && (
              <span className={`text-[#525252] dark:text-slate-400 transition-transform duration-250 ${isSectionExpanded('stats') ? 'rotate-180' : ''}`}>
                <FaAngleDown size={14} />
              </span>
            )}
          </button>

          {isSectionExpanded('stats') && (
            <div className="p-3.5 sm:p-4 grid grid-cols-2 gap-2.5">
              {[
                { name: 'Total Members', val: '2,480+', change: '+14% this mo' },
                { name: 'Online Now', val: '180+', change: 'Active developers', isOnline: true },
                { name: 'Discussions', val: '8,420', change: 'Solutions shared' },
                { name: 'Resources', val: '1,240', change: 'Open repos & guides' }
              ].map((stat, idx) => (
                <div key={idx} className="p-2.5 bg-[#F8FAFC] dark:bg-[#181820]/60 border border-[#E5E7EB] dark:border-white/5 rounded-xl flex flex-col text-left gap-0.5">
                  <span className="text-[9px] font-black text-[#525252] dark:text-slate-400 uppercase tracking-wider">{stat.name}</span>
                  <div className="flex items-center gap-1.5">
                    {stat.isOnline && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shrink-0" />}
                    <h4 className="text-sm font-black text-[#171717] dark:text-white leading-tight">{stat.val}</h4>
                  </div>
                  <span className="text-[8px] text-[#737373] dark:text-slate-500 font-medium">{stat.change}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION: POPULAR TAGS */}
        <div className="bg-white dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 rounded-2xl flex flex-col shadow-sm overflow-hidden hover:border-[#C2272D]/40 transition-all duration-300 text-left card-interactive">
          <button
            type="button"
            disabled={!isMobile}
            onClick={() => toggleMobileSection('tags')}
            className="w-full p-3.5 sm:p-4 flex items-center justify-between border-b border-[#E5E7EB] dark:border-white/10 bg-[#F8FAFC] dark:bg-[#17171e]/50 select-none cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#C2272D]/10 rounded-lg text-[#C2272D]">
                <FaHashtag size={10} />
              </span>
              <span className="text-[11px] font-black text-[#171717] dark:text-slate-300 uppercase tracking-wider font-title">Trending Tech Topics</span>
            </div>
            {isMobile && (
              <span className={`text-[#525252] dark:text-slate-400 transition-transform duration-250 ${isSectionExpanded('tags') ? 'rotate-180' : ''}`}>
                <FaAngleDown size={14} />
              </span>
            )}
          </button>

          {isSectionExpanded('tags') && (
            <div className="p-3.5 sm:p-4 flex flex-col gap-3">
              <div className="flex flex-wrap gap-1.5">
                {[
                  { tag: 'react', count: '1.2k', trending: true },
                  { tag: 'fullstack', count: '980', trending: true },
                  { tag: 'nodejs', count: '890', trending: false },
                  { tag: 'ai', count: '3.1k', trending: true },
                  { tag: 'javascript', count: '2.4k', trending: false },
                  { tag: 'tailwind', count: '780', trending: false },
                  { tag: 'career', count: '1.5k', trending: true }
                ].map(item => (
                  <Link
                    key={item.tag}
                    to={`/community?search=${item.tag}`}
                    className="px-2.5 py-1 bg-[#F8FAFC] dark:bg-[#181820] border border-[#E5E7EB] dark:border-white/10 text-[#171717] dark:text-slate-300 hover:bg-[#C2272D] hover:text-white hover:border-[#C2272D] rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-1 group shadow-sm active:scale-95"
                  >
                    <span>#{item.tag}</span>
                    <span className="text-[8px] opacity-75 font-semibold font-mono bg-black/5 dark:bg-white/10 group-hover:bg-white/20 px-1 py-0.5 rounded">{item.count}</span>
                    {item.trending && <span className="text-[9px]">🔥</span>}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION: ANNOUNCEMENTS */}
        <div className="bg-white dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 rounded-2xl flex flex-col shadow-sm overflow-hidden hover:border-[#C2272D]/40 transition-all duration-300 text-left card-interactive">
          <button
            type="button"
            disabled={!isMobile}
            onClick={() => toggleMobileSection('announcements')}
            className="w-full p-3.5 sm:p-4 flex items-center justify-between border-b border-[#E5E7EB] dark:border-white/10 bg-[#F8FAFC] dark:bg-[#17171e]/50 select-none cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#C2272D]/10 rounded-lg text-[#C2272D]">
                <FaBell size={10} />
              </span>
              <span className="text-[11px] font-black text-[#171717] dark:text-slate-300 uppercase tracking-wider font-title">Announcements</span>
            </div>
            {isMobile && (
              <span className={`text-[#525252] dark:text-slate-400 transition-transform duration-250 ${isSectionExpanded('announcements') ? 'rotate-180' : ''}`}>
                <FaAngleDown size={14} />
              </span>
            )}
          </button>

          {isSectionExpanded('announcements') && (
            <div className="p-3.5 sm:p-4 flex flex-col gap-3">
              {[
                { 
                  title: '🚀 DevCommunity 2027 Rebirth', 
                  desc: 'Modernized with Tauhid Shekhar visual branding, fast navigation, and streamlined developer hubs.',
                  date: 'Today',
                  unread: true
                },
                { 
                  title: '💡 AI Consultant & Career Hub Live', 
                  desc: 'Prepare for software engineering interviews and generate tailored tech roadmaps in one click.',
                  date: 'Active',
                  unread: false
                }
              ].map((ann, idx) => (
                <div 
                  key={idx} 
                  className="p-3 bg-[#F8FAFC] dark:bg-[#181820]/60 rounded-xl border border-[#E5E7EB] dark:border-white/5 text-[10px] leading-relaxed flex flex-col gap-1 relative"
                >
                  {ann.unread && (
                    <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[#C2272D] rounded-full animate-pulse" title="New" />
                  )}
                  <span className="text-[#C2272D] font-black text-[11px] leading-snug">{ann.title}</span>
                  <p className="text-[#525252] dark:text-slate-300 font-medium">{ann.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    );
  };

  const fetchData = async () => {
    try {
      if (user) {
        const notifRes = await api.getCommunityNotifications();
        if (notifRes.success) {
          const unread = (notifRes.data || []).filter(n => !n.read).length;
          setNotifCount(unread);
        }
      }

      const groupsRes = await api.getCommunityGroups();
      if (groupsRes.success) {
        const allGroups = groupsRes.data || [];
        const currentUserId = user?.id || user?._id;
        
        if (currentUserId) {
          const joined = allGroups.filter(g => 
            g.members?.some(m => m && (m._id || m.user || m).toString() === currentUserId.toString()) ||
            (g.owner?._id || g.owner)?.toString() === currentUserId.toString()
          );
          setMyGroups(joined);

          const unjoined = allGroups.filter(g => 
            !g.members?.some(m => m && (m._id || m.user || m).toString() === currentUserId.toString()) &&
            (g.owner?._id || g.owner)?.toString() !== currentUserId.toString()
          );
          setSuggestedGroups(unjoined.slice(0, 3));
        } else {
          setMyGroups([]);
          setSuggestedGroups(allGroups.slice(0, 3));
        }
      }

      const leadRes = await api.getCommunityLeaderboard();
      if (leadRes.success) {
        const currentUserId = user?.id || user?._id;
        const candidates = currentUserId
          ? (leadRes.data || []).filter(u => u && u._id?.toString() !== currentUserId?.toString())
          : (leadRes.data || []);
        setSuggestedDevs(candidates.slice(0, 5));
      }
    } catch (err) {
      console.warn('Community data fetch notice:', err.message);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleCmsUpdate = () => {
      fetchData();
    };
    window.addEventListener('cms-content-update', handleCmsUpdate);

    let interval;
    if (user) {
      interval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          fetchData();
        }
      }, 20000);
    }

    return () => {
      if (interval) clearInterval(interval);
      window.removeEventListener('cms-content-update', handleCmsUpdate);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleFollowDeveloper = async (userId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (followDeveloperLoading[userId]) return;

    setFollowDeveloperLoading(prev => ({ ...prev, [userId]: true }));

    const currentUserId = (user?.id || user?._id)?.toString();
    let originalDevs;
    setSuggestedDevs(prev => {
      originalDevs = prev;
      return prev.map(d => {
        if (d._id === userId) {
          const list = (d.followers || []).filter(Boolean).map(id => id.toString());
          const isFollowingNow = list.includes(currentUserId);
          return {
            ...d,
            followers: isFollowingNow 
              ? list.filter(id => id !== currentUserId) 
              : [...list, currentUserId]
          };
        }
        return d;
      });
    });

    try {
      const res = await api.toggleFollowUser(userId);
      if (!res.success) {
        if (originalDevs) setSuggestedDevs(originalDevs);
      }
    } catch (err) {
      console.error(err);
      if (originalDevs) setSuggestedDevs(originalDevs);
    } finally {
      setFollowDeveloperLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/community?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Structured 4-Group Navigation System
  const navSections = [
    {
      group: 'Main',
      items: [
        { name: 'Feed', path: '/community', icon: <FaHome size={15} />, prefetch: () => import('./CommunityFeed') },
        { name: 'Explore', path: '/community/projects', icon: <FaCompass size={15} />, prefetch: () => import('./CommunityProjectDiscussions') },
        { name: 'Doubts & Q&A', path: '/community/doubts', icon: <FaQuestionCircle size={15} />, prefetch: () => import('./CommunityDoubts') },
        { name: 'Groups', path: '/community/groups', icon: <FaUsers size={15} />, prefetch: () => import('./CommunityGroups') }
      ]
    },
    {
      group: 'Communication',
      items: [
        { name: 'Messages', path: '/community/chat', icon: <FaComments size={15} />, prefetch: () => import('./CommunityChat') },
        { name: 'Notifications', path: '/community/notifications', icon: <FaBell size={15} />, badge: notifCount, prefetch: () => import('./CommunityNotifications') }
      ]
    },
    {
      group: 'Developer',
      items: [
        { name: 'Resources', path: '/community/resources', icon: <FaFolderOpen size={15} />, prefetch: () => import('./CommunityResources') },
        { name: 'Daily Arena', path: '/community/challenges', icon: <FaCode size={15} />, prefetch: () => import('./CodingChallenges') },
        { name: 'Career Hub', path: '/community/career-hub', icon: <FaBriefcase size={15} />, prefetch: () => import('./CareerHub') },
        { name: 'AI Consultant', path: '/community/ai-assistant', icon: <FaBrain size={15} />, prefetch: () => import('./AIConsultant') }
      ]
    },
    {
      group: 'Account',
      items: [
        { name: 'Profile', path: user ? `/community/profile/${user?.id || user?._id}` : '/login', icon: <FaUser size={15} />, prefetch: () => import('./CommunityProfile') },
        { name: 'Rewards Hub', path: '/community/rewards', icon: <FaTasks size={15} />, prefetch: () => import('./RewardsDashboard') },
        { name: 'Ecosystem Shop', path: '/community/store', icon: <FaGift size={15} />, prefetch: () => import('./CommunityStore') },
        { name: 'Settings', path: user ? `/user/dashboard` : '/login', icon: <FaCog size={15} />, prefetch: () => import('../admin/UserDashboard') }
      ]
    }
  ];

  const allNavItems = navSections.flatMap(s => s.items);

  return (
    <div className="min-h-screen bg-white dark:bg-[#000000] text-[#171717] dark:text-[#F1F1F5] flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Navbar Header */}
      <header className="sticky top-0 z-[100] border-b border-[#E5E7EB] dark:border-white/10 bg-white/95 dark:bg-[#111111]/95 backdrop-blur-md px-3 py-2.5 sm:px-6 sm:py-3 flex items-center justify-between shadow-sm transition-colors duration-200">
        
        {/* Left: Mobile Toggle + TS Brand Logo + Search */}
        <div className="flex items-center gap-3 sm:gap-5 flex-1 max-w-xl min-w-0">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-lg text-[#525252] dark:text-slate-300 hover:text-[#C2272D] lg:hidden cursor-pointer shrink-0 p-1"
            title="Open Navigation"
          >
            <FaBars />
          </button>
          
          {/* TS Crowned Logo & DevCommunity Title */}
          <Link to="/community" className="flex items-center gap-2.5 group shrink-0">
            <img 
              src={isDark ? "/assits/ts-logo-dark.jpg" : "/assits/ts-logo-red.jpg"} 
              alt="Tauhid Shekhar Logo" 
              className="w-8 h-8 rounded-lg object-cover shadow-sm border border-[#E5E7EB] dark:border-white/10 group-hover:scale-105 transition-transform" 
            />
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base font-black font-title tracking-tight text-[#171717] dark:text-white group-hover:text-[#C2272D] transition-colors">
                DevCommunity
              </span>
              <span className="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider rounded bg-[#C2272D]/10 text-[#C2272D] border border-[#C2272D]/20">
                TS
              </span>
            </div>
          </Link>
          
          {/* Header search bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full hidden md:block max-w-xs">
            <input
              type="text"
              placeholder="Search users, posts, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3.5 pr-8 py-1.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E1E24] border border-[#E5E7EB] dark:border-white/10 text-xs text-[#171717] dark:text-white placeholder-[#737373] dark:placeholder-slate-400 focus:outline-none focus:border-[#C2272D] transition-all"
            />
          </form>
        </div>

        {/* Right: Actions, Theme Toggle, Auth, Back to Portfolio */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 sm:p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1C1C24] hover:bg-[#E5E7EB] dark:hover:bg-[#252530] text-[#525252] dark:text-slate-300 border border-[#E5E7EB] dark:border-white/10 transition-all cursor-pointer"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <FaSun size={12} className="text-amber-400" /> : <FaMoon size={12} className="text-slate-600" />}
          </button>

          {user && (
            <>
              <Link 
                to="/community" 
                className="hidden sm:flex px-3.5 py-1.5 bg-[#C2272D] hover:bg-[#A51E23] text-white rounded-xl text-xs font-black shadow-md shadow-[#C2272D]/20 items-center gap-1.5 transition-all active:scale-95 btn-shine-effect"
              >
                <FaPlus size={10} /> Create
              </Link>
              <Link 
                to="/community/notifications" 
                className="relative p-2 sm:p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1C1C24] hover:bg-[#E5E7EB] dark:hover:bg-[#252530] text-[#525252] dark:text-slate-300 hover:text-[#C2272D] transition-colors border border-[#E5E7EB] dark:border-white/10"
                title="Notifications"
              >
                <FaBell size={12} />
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C2272D] text-[8px] font-black text-white flex items-center justify-center border-2 border-white dark:border-[#111111]">
                    {notifCount}
                  </span>
                )}
              </Link>
              <Link 
                to="/community/chat" 
                className="p-2 sm:p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1C1C24] hover:bg-[#E5E7EB] dark:hover:bg-[#252530] text-[#525252] dark:text-slate-300 hover:text-[#C2272D] transition-colors border border-[#E5E7EB] dark:border-white/10"
                title="Direct Messages"
              >
                <FaComments size={12} />
              </Link>
            </>
          )}
          
          <span className="hidden sm:inline h-4 w-px bg-[#E5E7EB] dark:bg-white/10" />

          {/* User Profile or Sign In */}
          {user ? (
            <Link to={`/community/profile/${user?.id || user?._id}`} className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <div className="w-8 h-8 rounded-xl overflow-hidden bg-[#E5E7EB] dark:bg-[#1E1E24] border border-[#E5E7EB] dark:border-white/10 flex items-center justify-center shrink-0">
                {user?.avatar?.url ? (
                  <img src={user.avatar.url} alt="Profile" className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <FaUser className="text-[#737373] dark:text-slate-400" size={12} />
                )}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-[11px] font-black text-[#171717] dark:text-white leading-tight flex items-center gap-1 font-title">
                  {user?.fullName} <FaCheckCircle size={10} className="text-[#00FFFF]" />
                </span>
                <span className="text-[9px] font-semibold text-[#525252] dark:text-slate-400">@{user?.username}</span>
              </div>
            </Link>
          ) : (
            <Link
              to="/login"
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-[#C2272D] hover:bg-[#A51E23] text-white rounded-xl text-[11px] sm:text-xs font-black shadow-md shadow-[#C2272D]/20 flex items-center gap-1.5 transition-all cursor-pointer shrink-0 btn-shine-effect"
            >
              Sign In
            </Link>
          )}
          
          {/* Back to Portfolio Link */}
          <Link
            to="/"
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-[#F8FAFC] dark:bg-[#1C1C24] hover:bg-[#E5E7EB] dark:hover:bg-[#252530] text-[#171717] dark:text-slate-300 hover:text-[#C2272D] rounded-xl text-[11px] sm:text-xs font-bold transition-all border border-[#E5E7EB] dark:border-white/10 shrink-0"
            title="Return to main portfolio"
          >
            <FaArrowLeft size={10} />
            <span className="hidden sm:inline">Portfolio</span>
          </Link>
        </div>
      </header>

      {/* Main Flex Wrapper */}
      <div className="flex-1 max-w-[1400px] w-full mx-auto flex flex-col lg:flex-row gap-6 p-4 sm:p-6 pb-24 lg:pb-6 min-h-0">
        
        {/* Left Sidebar Navigator */}
        <aside
          className={`hidden lg:flex flex-col gap-5 shrink-0 sticky top-[72px] h-[calc(100vh-92px)] overflow-y-auto pr-1 text-left scrollbar-none transition-all duration-200 ease-in-out ${
            sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'
          }`}
        >
          {/* Sidebar Collapse Toggle */}
          <div className={`flex items-center px-1 shrink-0 ${sidebarCollapsed ? 'justify-center' : 'justify-between pl-3'}`}>
            {!sidebarCollapsed && (
              <span className="text-[10px] font-black text-[#525252] dark:text-slate-400 uppercase tracking-widest font-title">
                Navigation
              </span>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="relative group flex items-center justify-center p-2 rounded-xl bg-white dark:bg-[#111111] hover:bg-[#F8FAFC] dark:hover:bg-[#1c1c24] text-[#525252] dark:text-slate-400 hover:text-[#C2272D] dark:hover:text-white transition-all border border-[#E5E7EB] dark:border-white/10 cursor-pointer active:scale-95 shadow-sm"
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <svg 
                stroke="currentColor" 
                fill="none" 
                strokeWidth="2" 
                viewBox="0 0 24 24" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className={`w-4 h-4 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`}
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
                <path d="M14 15l-3-3 3-3" />
              </svg>
              
              {sidebarCollapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#111111] border border-white/10 text-[10px] font-black text-white uppercase tracking-wider rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap shadow-xl z-[999]">
                  Expand Sidebar
                </div>
              )}
            </button>
          </div>

          {/* Grouped Navigation Links */}
          <div className="bg-white dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 p-3.5 rounded-3xl flex flex-col gap-4 shadow-sm">
            {navSections.map(section => (
              <div key={section.group} className="flex flex-col gap-1">
                {!sidebarCollapsed && (
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#737373] dark:text-slate-400 px-3 py-1 font-title">
                    {section.group}
                  </span>
                )}
                {section.items.map(item => {
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onMouseEnter={item.prefetch}
                      className={`relative group flex items-center rounded-xl text-xs font-bold transition-all ${
                        sidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3.5 py-2.5'
                      } ${
                        active 
                          ? 'bg-[#C2272D] text-white shadow-md shadow-[#C2272D]/20' 
                          : 'text-[#525252] dark:text-slate-300 hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A22] hover:text-[#C2272D] dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`shrink-0 ${active ? 'text-white' : 'text-[#737373] dark:text-slate-400 group-hover:text-[#C2272D]'}`}>
                          {item.icon}
                        </span>
                        {!sidebarCollapsed && <span>{item.name}</span>}
                      </div>
                      
                      {item.badge > 0 && (
                        sidebarCollapsed ? (
                          <span className="absolute top-1 right-1 w-3.5 h-3.5 text-[8px] font-black bg-[#C2272D] text-white rounded-full flex items-center justify-center border border-white dark:border-[#111111]">
                            {item.badge}
                          </span>
                        ) : (
                          <span className={`px-1.5 py-0.5 text-[9px] font-black rounded-full leading-none shrink-0 ${
                            active ? 'bg-white text-[#C2272D]' : 'bg-[#C2272D] text-white'
                          }`}>
                            {item.badge}
                          </span>
                        )
                      )}

                      {sidebarCollapsed && (
                        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#111111] border border-white/10 text-[10px] font-black text-white uppercase tracking-wider rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap shadow-xl z-[999]">
                          {item.name} {item.badge > 0 ? `(${item.badge})` : ''}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Groups list */}
          <div className="bg-white dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 p-3.5 rounded-3xl flex flex-col gap-2.5 shadow-sm">
            <div className={`flex items-center border-b border-[#E5E7EB] dark:border-white/10 pb-2 ${sidebarCollapsed ? 'justify-center border-none' : 'justify-between'}`}>
              {sidebarCollapsed ? (
                <span className="text-[10px] font-black text-[#525252] dark:text-slate-400 uppercase tracking-wider" title="Your Groups">
                  <FaUsers size={16} />
                </span>
              ) : (
                <>
                  <span className="text-[10px] font-black text-[#171717] dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-title">
                    <FaUsers className="text-[#C2272D]" /> Your Groups
                  </span>
                  {user && <Link to="/community/groups" className="text-[9px] text-[#C2272D] font-black uppercase hover:underline">View All</Link>}
                </>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {user ? (
                <>
                  {myGroups.slice(0, 4).filter(Boolean).map(group => (
                    <Link
                      key={group._id}
                      to="/community/groups"
                      className={`relative group flex items-center rounded-xl hover:bg-[#F8FAFC] dark:hover:bg-white/5 transition-colors ${
                        sidebarCollapsed ? 'justify-center p-1' : 'gap-2.5 p-1'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#C2272D]/10 text-[#C2272D] border border-[#C2272D]/20 flex items-center justify-center shrink-0 font-black text-xs uppercase">
                        {group.logo?.url ? (
                          <img src={group.logo.url} alt="logo" className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          (group.name || 'GP').substring(0, 2)
                        )}
                      </div>
                      {!sidebarCollapsed && (
                        <div className="flex flex-col text-left min-w-0">
                          <span className="text-[11px] font-bold text-[#171717] dark:text-white group-hover:text-[#C2272D] transition-colors truncate">{group.name || 'Unnamed Group'}</span>
                          <span className="text-[9px] text-[#525252] dark:text-slate-400 mt-0.5">{group.members?.length || 0} members</span>
                        </div>
                      )}

                      {sidebarCollapsed && (
                        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#111111] border border-white/10 text-[10px] font-black text-white uppercase tracking-wider rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap shadow-xl z-[999]">
                          {group.name} ({group.members?.length || 0} members)
                        </div>
                      )}
                    </Link>
                  ))}

                  {!sidebarCollapsed && (
                    <Link 
                      to="/community/groups" 
                      className="mt-1 w-full py-2 bg-[#F8FAFC] dark:bg-[#181820] hover:bg-[#C2272D] hover:text-white text-[#171717] dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 border border-[#E5E7EB] dark:border-white/5 transition-all cursor-pointer"
                    >
                      <FaPlus size={8} /> Create Group
                    </Link>
                  )}
                </>
              ) : (
                !sidebarCollapsed && <div className="text-[10px] text-[#737373] dark:text-slate-500 py-2 text-center">Log in to view your groups</div>
              )}
            </div>
          </div>

          {/* Stats XP Dashboard widget */}
          {user ? (
            sidebarCollapsed ? (
              <Link
                to={`/community/profile/${user?.id || user?._id}`}
                className="relative group bg-white dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 p-3 rounded-3xl flex items-center justify-center shadow-sm hover:border-[#C2272D]/40 transition-colors cursor-pointer"
              >
                <FaCrown className="text-amber-500" size={16} />
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#111111] border border-white/10 text-[10px] font-black text-white uppercase tracking-wider rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap shadow-xl z-[999]">
                  Level {user?.level || Math.floor((user?.xp || 0) / 100) + 1} ({user?.xp || 0} XP)
                </div>
              </Link>
            ) : (
              <div className="bg-white dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 p-4 rounded-3xl flex flex-col gap-2 shadow-sm">
                <span className="text-[9px] font-black text-[#525252] dark:text-slate-400 uppercase tracking-widest block font-title">Developer Status</span>
                <div className="flex justify-between items-baseline mb-0.5">
                  <h4 className="text-base font-black text-[#171717] dark:text-white">{user?.xp || 0} <span className="text-[9px] text-[#525252] dark:text-slate-400 font-bold uppercase">XP</span></h4>
                  <span className="text-[10px] text-amber-500 font-black flex items-center gap-1"><FaCoins size={10} /> {user?.coins || 0}</span>
                </div>
                <div className="w-full h-1.5 bg-[#E5E7EB] dark:bg-[#1c1c24] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#C2272D] to-[#00FFFF]"
                    style={{ width: `${Math.min(100, (user?.xp || 0) % 100 || 15)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[8px] text-[#525252] dark:text-slate-400 mt-0.5 uppercase font-bold tracking-wider">
                  <span>Level {user?.level || Math.floor((user?.xp || 0) / 100) + 1}</span>
                  <span>Rep: {user?.reputation || 0}</span>
                </div>
              </div>
            )
          ) : (
            sidebarCollapsed ? (
              <Link
                to="/login"
                className="relative group bg-white dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 p-3 rounded-3xl flex items-center justify-center shadow-sm hover:border-[#C2272D]/40 transition-colors cursor-pointer"
              >
                <FaUser className="text-[#525252] dark:text-slate-400" size={16} />
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#111111] border border-white/10 text-[10px] font-black text-white uppercase tracking-wider rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap shadow-xl z-[999]">
                  Log In to track progress
                </div>
              </Link>
            ) : (
              <div className="bg-white dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 p-4 rounded-3xl flex flex-col gap-2.5 shadow-sm text-center">
                <span className="text-[9px] font-black text-[#525252] dark:text-slate-400 uppercase tracking-widest block font-title">Developer Status</span>
                <p className="text-[10px] text-[#525252] dark:text-slate-400 leading-relaxed">Join DevCommunity to earn XP, badges, and collaborate on projects!</p>
                <Link
                  to="/login"
                  className="w-full py-2 bg-[#C2272D] hover:bg-[#A51E23] text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer text-center shadow-sm btn-shine-effect"
                >
                  Log In
                </Link>
              </div>
            )
          )}
        </aside>

        {/* Center column - Active Outlet View */}
        <main className="flex-1 min-w-0 flex flex-col gap-6">
          <Outlet />
          
          {/* Mobile Right Sidebar Accordion Sections */}
          <div className="xl:hidden flex flex-col gap-4 mt-6 w-full pb-10">
            {renderRightSidebar(true)}
          </div>
        </main>

        {/* Right Sidebar Navigator */}
        <aside className="hidden xl:flex flex-col gap-5 w-[320px] shrink-0 sticky top-[72px] h-[calc(100vh-92px)] overflow-y-auto pl-1 text-left scrollbar-none">
          {renderRightSidebar(false)}
        </aside>

      </div>

      {/* Mobile Drawer Overlay */}
      <div
        className={`fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-200 ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 w-72 h-screen bg-white dark:bg-[#111111] z-[1000] border-r border-[#E5E7EB] dark:border-white/10 flex flex-col transition-transform duration-200 ease-out lg:hidden overflow-y-auto ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-[#E5E7EB] dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src={isDark ? "/assits/ts-logo-dark.jpg" : "/assits/ts-logo-red.jpg"} 
              alt="Logo" 
              className="w-7 h-7 rounded-lg object-cover" 
            />
            <span className="text-sm font-black font-title tracking-tight text-[#171717] dark:text-white uppercase">DevCommunity</span>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 text-[#525252] dark:text-white cursor-pointer hover:text-[#C2272D]">
            <FaTimes size={16} />
          </button>
        </div>

        <nav className="flex-1 p-3.5 flex flex-col gap-4 text-left">
          {navSections.map(section => (
            <div key={section.group} className="flex flex-col gap-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#737373] dark:text-slate-400 px-3 py-1 font-title">
                {section.group}
              </span>
              {section.items.map(item => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    onMouseEnter={item.prefetch}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      active 
                        ? 'bg-[#C2272D] text-white shadow-md' 
                        : 'text-[#525252] dark:text-slate-300 hover:bg-[#F8FAFC] dark:hover:bg-[#1E1E24] hover:text-[#C2272D] dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm">{item.icon}</span>
                      <span>{item.name}</span>
                    </div>
                    {item.badge > 0 && (
                      <span className="px-1.5 py-0.5 text-[9px] font-black bg-[#C2272D] text-white rounded-full leading-none">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[99] bg-white/95 dark:bg-[#111111]/95 backdrop-blur-lg border-t border-[#E5E7EB] dark:border-white/10 py-2 px-3 flex items-center justify-around shadow-2xl">
        {[
          { name: 'Feed', path: '/community', icon: <FaHome size={16} /> },
          { name: 'Doubts', path: '/community/doubts', icon: <FaQuestionCircle size={16} /> },
          { name: 'Explore', path: '/community/projects', icon: <FaCompass size={16} /> },
          { name: 'Career', path: '/community/career-hub', icon: <FaBriefcase size={16} /> },
          { name: 'Store', path: '/community/store', icon: <FaGift size={16} /> }
        ].map(item => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl transition-all ${
                active 
                  ? 'text-[#C2272D] font-black' 
                  : 'text-[#525252] dark:text-slate-400 hover:text-[#171717] dark:hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider">{item.name}</span>
            </Link>
          );
        })}
      </div>

    </div>
  );
};

export default CommunityLayout;
