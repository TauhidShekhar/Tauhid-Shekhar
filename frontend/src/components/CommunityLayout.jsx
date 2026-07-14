import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { 
  FaHome, FaGlobe, FaUsers, FaFolderOpen, FaBriefcase, FaCrown, 
  FaBell, FaComments, FaUser, FaCog, FaPlus, FaTimes, FaBars, 
  FaCheckCircle, FaHashtag, FaAngleDown, FaTachometerAlt, FaCompass, FaQuestionCircle, FaCode,
  FaGift, FaBrain, FaTasks, FaCoins
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
      <div className="flex flex-col gap-5.5 w-full">
        
        {/* SECTION: QUICK ACTIONS */}
        <div className="bg-[#121217] border border-white/5 rounded-2xl flex flex-col shadow-lg shadow-black/25 overflow-hidden hover:scale-[1.01] hover:border-purple-500/25 transition-all duration-300 text-left">
          <button 
            type="button"
            disabled={!isMobile}
            onClick={() => toggleMobileSection('actions')}
            className="w-full p-4 flex items-center justify-between border-b border-white/5 bg-[#17171e]/40 select-none cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-purple-500/10 rounded-lg text-purple-400">
                <FaPlus size={10} />
              </span>
              <span className="text-[10px] font-black text-slate-350 uppercase tracking-widest">Quick Actions</span>
            </div>
            {isMobile && (
              <span className={`text-slate-400 transition-transform duration-250 ${isSectionExpanded('actions') ? 'rotate-180' : ''}`}>
                <FaAngleDown size={14} />
              </span>
            )}
          </button>

          {isSectionExpanded('actions') && (
            <div className="p-4 flex flex-col gap-2.5">
              {[
                { name: 'Create Post', icon: <FaPlus />, path: '/community' },
                { name: 'Upload Resource', icon: <FaFolderOpen />, path: '/community/resources' },
                { name: 'Ask AI Assistant', icon: <FaBrain />, path: '/community/ai-assistant' },
                { name: 'Create Community Group', icon: <FaUsers />, path: '/community/groups' },
                { name: 'Find Top Developers', icon: <FaCrown />, path: '/community/leaderboard' }
              ].map((action, idx) => (
                <Link
                  key={idx}
                  to={action.path}
                  className="flex items-center justify-between p-2.5 bg-[#181820]/45 hover:bg-[#20202c] border border-white/5 hover:border-purple-500/15 rounded-xl transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-450 group-hover:text-purple-400 transition-colors text-xs">{action.icon}</span>
                    <span className="text-[11px] font-bold text-slate-300 group-hover:text-white transition-colors">{action.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-550 group-hover:text-slate-300 transition-transform group-hover:translate-x-0.5">→</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* SECTION: SUGGESTED DEVELOPERS */}
        <div className="bg-[#121217] border border-white/5 rounded-2xl flex flex-col shadow-lg shadow-black/25 overflow-hidden hover:scale-[1.01] hover:border-purple-500/25 transition-all duration-300 text-left">
          <button
            type="button"
            disabled={!isMobile}
            onClick={() => toggleMobileSection('suggested')}
            className="w-full p-4 flex items-center justify-between border-b border-white/5 bg-[#17171e]/40 select-none cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-purple-500/10 rounded-lg text-purple-400">
                <FaUser size={10} />
              </span>
              <span className="text-[10px] font-black text-slate-350 uppercase tracking-widest">Suggested Developers</span>
            </div>
            {isMobile && (
              <span className={`text-slate-400 transition-transform duration-250 ${isSectionExpanded('suggested') ? 'rotate-180' : ''}`}>
                <FaAngleDown size={14} />
              </span>
            )}
          </button>

          {isSectionExpanded('suggested') && (
            <div className="p-4 flex flex-col gap-3">
              {suggestedDevs.filter(Boolean).slice(0, 5).map((dev, idx) => {
                const currentUserId = (user?.id || user?._id)?.toString();
                const isFollowing = dev.followers?.some(fid => fid && fid.toString() === currentUserId);
                
                const isVerified = dev.xp >= 300;
                const devRole = dev.role === 'Admin' ? 'Administrator' : 
                                dev.xp >= 300 ? 'Core Contributor' : 'Member';

                return (
                  <div key={dev._id} className="flex items-center justify-between gap-3 p-1 rounded-xl">
                    <Link to={`/community/profile/${dev._id}`} className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-90">
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#1e1e24] border border-white/10 flex items-center justify-center shadow-inner">
                          {dev.avatar?.url ? (
                            <img src={dev.avatar.url} alt="Profile" className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <FaUser className="text-slate-500" size={14} />
                          )}
                        </div>
                        {dev.isActive !== false && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-[#121217]" />
                        )}
                      </div>
                      
                      <div className="flex flex-col text-left min-w-0">
                        <h5 className="text-[11px] font-black text-white flex items-center gap-1 leading-snug">
                          <span className="truncate">{dev.fullName}</span>
                          {isVerified && <FaCheckCircle size={10} className="text-purple-400 shrink-0" title="Verified Creator" />}
                        </h5>
                        <span className="text-[9px] text-slate-450 truncate">{devRole} • {dev.xp || 0} XP</span>
                      </div>
                    </Link>

                    <button
                      onClick={() => handleFollowDeveloper(dev._id)}
                      disabled={followDeveloperLoading[dev._id]}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border cursor-pointer transition-all duration-200 shrink-0 flex items-center gap-1 ${
                        isFollowing 
                          ? 'bg-transparent border-slate-700 text-slate-400' 
                          : 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 hover:from-purple-600 hover:to-indigo-600 border-purple-500/30 hover:border-transparent text-purple-300 hover:text-white shadow-md active:scale-95'
                      } ${followDeveloperLoading[dev._id] ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {followDeveloperLoading[dev._id] && <div className="w-2 h-2 rounded-full border border-white/20 border-t-white animate-spin shrink-0" />}
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                );
              })}

              {suggestedDevs.length === 0 && (
                <div className="text-[10px] text-slate-550 italic text-center py-4">No recommendations.</div>
              )}

              <Link 
                to="/community/leaderboard"
                className="mt-2 w-full py-2.5 bg-[#181820] hover:bg-[#20202c] border border-white/5 hover:border-purple-500/20 rounded-xl text-[9px] font-black uppercase tracking-wider text-slate-350 hover:text-purple-300 transition-all text-center flex items-center justify-center gap-1.5"
              >
                <FaCrown size={10} /> View Full Leaderboard
              </Link>
            </div>
          )}
        </div>

        {/* SECTION: TOP LEADERBOARD HIGHLIGHTS */}
        <div className="bg-[#121217] border border-white/5 rounded-2xl flex flex-col shadow-lg shadow-black/25 overflow-hidden hover:scale-[1.01] hover:border-purple-500/25 transition-all duration-300 text-left">
          <button
            type="button"
            disabled={!isMobile}
            onClick={() => toggleMobileSection('leaderboard')}
            className="w-full p-4 flex items-center justify-between border-b border-white/5 bg-[#17171e]/40 select-none cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-purple-500/10 rounded-lg text-purple-400">
                <FaCrown size={10} />
              </span>
              <span className="text-[10px] font-black text-slate-350 uppercase tracking-widest">Global Leaderboard</span>
            </div>
            {isMobile && (
              <span className={`text-slate-400 transition-transform duration-250 ${isSectionExpanded('leaderboard') ? 'rotate-180' : ''}`}>
                <FaAngleDown size={14} />
              </span>
            )}
          </button>

          {isSectionExpanded('leaderboard') && (
            <div className="p-4 flex flex-col gap-4">
              <div className="flex bg-[#181820] p-1 rounded-xl border border-white/5">
                {['weekly', 'all-time'].map((timeframe) => (
                  <button
                    key={timeframe}
                    onClick={() => setLeaderboardTimeframe(timeframe)}
                    className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      leaderboardTimeframe === timeframe
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                        : 'text-slate-455 hover:text-slate-200'
                    }`}
                  >
                    {timeframe.replace('-', ' ')}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2.5">
                {suggestedDevs.filter(Boolean).slice(0, 3).map((dev, idx) => {
                  const medalColors = 
                    idx === 0 ? 'bg-amber-400/10 border-amber-400/30 text-amber-400 shadow-amber-400/5' :
                    idx === 1 ? 'bg-slate-300/10 border-slate-300/30 text-slate-300 shadow-slate-300/5' :
                    'bg-amber-700/10 border-amber-750/30 text-amber-700 shadow-amber-700/5';

                  const medalLabel = idx === 0 ? 'Gold' : idx === 1 ? 'Silver' : 'Bronze';
                  const change = idx === 0 ? '↑1' : idx === 1 ? '↓1' : '•';
                  const changeColor = idx === 0 ? 'text-green-500' : idx === 1 ? 'text-red-500' : 'text-slate-500';

                  const displayedXP = leaderboardTimeframe === 'weekly' 
                    ? Math.max(20, Math.floor(dev.xp * 0.4)) 
                    : dev.xp;

                  return (
                    <div 
                      key={dev._id} 
                      className={`flex items-center justify-between p-2.5 rounded-xl border ${medalColors} shadow-md`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-[10px] font-black w-4 text-center shrink-0">#{idx + 1}</span>
                        <div className="w-7 h-7 rounded-lg overflow-hidden bg-[#1e1e24] border border-white/10 shrink-0">
                          {dev.avatar?.url ? (
                            <img src={dev.avatar.url} alt="medal user" className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <div className="w-full h-full bg-purple-900/20 text-purple-400 font-extrabold flex items-center justify-center text-[10px]">
                              {dev.fullName[0]}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col text-left min-w-0">
                          <span className="text-[10px] font-black text-white truncate">{dev.fullName}</span>
                          <span className="text-[8px] text-slate-455 mt-0.5">{displayedXP} XP this period</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`text-[8px] font-black font-mono ${changeColor}`} title="Rank Movement">{change}</span>
                        <span className="text-[7px] font-black tracking-widest uppercase bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-slate-400">{medalLabel}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* SECTION: COMMUNITY STATISTICS */}
        <div className="bg-[#121217] border border-white/5 rounded-2xl flex flex-col shadow-lg shadow-black/25 overflow-hidden hover:scale-[1.01] hover:border-purple-500/25 transition-all duration-300 text-left">
          <button
            type="button"
            disabled={!isMobile}
            onClick={() => toggleMobileSection('stats')}
            className="w-full p-4 flex items-center justify-between border-b border-white/5 bg-[#17171e]/40 select-none cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-purple-500/10 rounded-lg text-purple-400">
                <FaTachometerAlt size={10} />
              </span>
              <span className="text-[10px] font-black text-slate-350 uppercase tracking-widest">Community Statistics</span>
            </div>
            {isMobile && (
              <span className={`text-slate-400 transition-transform duration-250 ${isSectionExpanded('stats') ? 'rotate-180' : ''}`}>
                <FaAngleDown size={14} />
              </span>
            )}
          </button>

          {isSectionExpanded('stats') && (
            <div className="p-4 grid grid-cols-2 gap-3.5">
              {[
                { name: 'Total Members', val: '2,482', change: '+12% this wk' },
                { name: 'Online Right Now', val: '318', change: 'Live updates', isOnline: true },
                { name: 'Knowledge Posts', val: '12,840', change: '24 new today' },
                { name: 'Shared Resources', val: '1,192', change: 'ZIPs, PDFs, cheatsheets' }
              ].map((stat, idx) => (
                <div key={idx} className="p-3 bg-[#181820]/45 border border-white/5 rounded-xl flex flex-col text-left gap-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{stat.name}</span>
                  <div className="flex items-center gap-1.5">
                    {stat.isOnline && <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shrink-0" />}
                    <h4 className="text-sm font-black text-white leading-tight">{stat.val}</h4>
                  </div>
                  <span className="text-[8px] text-slate-500 font-semibold">{stat.change}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION: POPULAR TAGS */}
        <div className="bg-[#121217] border border-white/5 rounded-2xl flex flex-col shadow-lg shadow-black/25 overflow-hidden hover:scale-[1.01] hover:border-purple-500/25 transition-all duration-300 text-left">
          <button
            type="button"
            disabled={!isMobile}
            onClick={() => toggleMobileSection('tags')}
            className="w-full p-4 flex items-center justify-between border-b border-white/5 bg-[#17171e]/40 select-none cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-purple-500/10 rounded-lg text-purple-400">
                <FaHashtag size={10} />
              </span>
              <span className="text-[10px] font-black text-slate-350 uppercase tracking-widest">Trending Tech Topics</span>
            </div>
            {isMobile && (
              <span className={`text-slate-400 transition-transform duration-250 ${isSectionExpanded('tags') ? 'rotate-180' : ''}`}>
                <FaAngleDown size={14} />
              </span>
            )}
          </button>

          {isSectionExpanded('tags') && (
            <div className="p-4 flex flex-col gap-4">
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { tag: 'react', count: '1.2k', trending: true },
                  { tag: 'nodejs', count: '890', trending: false },
                  { tag: 'webdev', count: '2.4k', trending: true },
                  { tag: 'ai', count: '3.1k', trending: true },
                  { tag: 'mongodb', count: '450', trending: false },
                  { tag: 'javascript', count: '1.9k', trending: false },
                  { tag: 'tailwind', count: '780', trending: false },
                  { tag: 'nextjs', count: '1.5k', trending: true }
                ].map(item => (
                  <Link
                    key={item.tag}
                    to={`/community?search=${item.tag}`}
                    className="px-2.5 py-1 bg-purple-600/10 border border-purple-550/15 text-purple-400 hover:bg-purple-600 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-1 group shadow-sm active:scale-95"
                  >
                    <span>#{item.tag}</span>
                    <span className="text-[8px] opacity-75 font-semibold font-mono bg-purple-500/10 group-hover:bg-white/10 px-1 py-0.5 rounded">{item.count}</span>
                    {item.trending && <span className="text-[9px]" title="Trending 🔥">🔥</span>}
                  </Link>
                ))}
              </div>

              {/* Active Contributors Stack */}
              <div className="border-t border-white/5 pt-3.5 flex items-center justify-between text-[10px]">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[9px]">Active Contributors</span>
                <div className="flex items-center">
                  {suggestedDevs.slice(0, 3).map((d, i) => (
                    <div 
                      key={d._id} 
                      className="w-5.5 h-5.5 rounded-full overflow-hidden border border-[#121217] -ml-1.5 first:ml-0 shadow bg-slate-900"
                      title={d.fullName}
                    >
                      {d.avatar?.url ? (
                        <img src={d.avatar.url} alt="contr" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-purple-900/50 flex items-center justify-center text-[7px] text-white font-extrabold uppercase">
                          {d.fullName[0]}
                        </div>
                      )}
                    </div>
                  ))}
                  <span className="text-[8px] font-black text-purple-400 ml-2 uppercase tracking-wide">+18 others</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION: ANNOUNCEMENTS */}
        <div className="bg-[#121217] border border-white/5 rounded-2xl flex flex-col shadow-lg shadow-black/25 overflow-hidden hover:scale-[1.01] hover:border-purple-500/25 transition-all duration-300 text-left">
          <button
            type="button"
            disabled={!isMobile}
            onClick={() => toggleMobileSection('announcements')}
            className="w-full p-4 flex items-center justify-between border-b border-white/5 bg-[#17171e]/40 select-none cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-purple-500/10 rounded-lg text-purple-400">
                <FaBell size={10} />
              </span>
              <span className="text-[10px] font-black text-slate-350 uppercase tracking-widest">Platform Announcements</span>
            </div>
            {isMobile && (
              <span className={`text-slate-400 transition-transform duration-250 ${isSectionExpanded('announcements') ? 'rotate-180' : ''}`}>
                <FaAngleDown size={14} />
              </span>
            )}
          </button>

          {isSectionExpanded('announcements') && (
            <div className="p-4 flex flex-col gap-3.5 pt-1">
              {[
                { 
                  title: '🚀 Hackathon July 2026', 
                  desc: 'Showcase your AI projects by July 25 to win custom profile badges & reputation XP!',
                  date: 'July 14, 2026',
                  unread: true
                },
                { 
                  title: '⚙️ Platform Updates', 
                  desc: 'Gemini 2.5 real-time memory consultant, voice transcription, and Kanban trackers are now live.',
                  date: 'July 12, 2026',
                  unread: false
                }
              ].map((ann, idx) => (
                <div 
                  key={idx} 
                  className="p-3 bg-[#181820]/45 rounded-xl border border-white/5 text-[10px] leading-relaxed flex flex-col gap-1.5 relative group/ann"
                >
                  {ann.unread && (
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" title="New Announcement" />
                  )}
                  <div className="flex flex-col text-left">
                    <span className="text-purple-400 font-black text-[11px] leading-snug group-hover/ann:text-purple-300 transition-colors">{ann.title}</span>
                    <span className="text-[8px] text-slate-500 font-bold mt-0.5">{ann.date}</span>
                  </div>
                  <p className="text-slate-350 font-semibold">{ann.desc}</p>
                  <button 
                    type="button" 
                    onClick={() => alert(`Details for: ${ann.title}\n\n${ann.desc}`)}
                    className="text-[8px] text-purple-400 hover:text-purple-300 font-black uppercase tracking-wider mt-1 text-left w-fit cursor-pointer hover:underline"
                  >
                    Read More &rarr;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION: UPCOMING EVENTS */}
        <div className="bg-[#121217] border border-white/5 rounded-2xl flex flex-col shadow-lg shadow-black/25 overflow-hidden hover:scale-[1.01] hover:border-purple-500/25 transition-all duration-300 text-left">
          <button
            type="button"
            disabled={!isMobile}
            onClick={() => toggleMobileSection('events')}
            className="w-full p-4 flex items-center justify-between border-b border-white/5 bg-[#17171e]/40 select-none cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-purple-500/10 rounded-lg text-purple-400">
                <FaTasks size={10} />
              </span>
              <span className="text-[10px] font-black text-slate-350 uppercase tracking-widest">Upcoming Events</span>
            </div>
            {isMobile && (
              <span className={`text-slate-400 transition-transform duration-250 ${isSectionExpanded('events') ? 'rotate-180' : ''}`}>
                <FaAngleDown size={14} />
              </span>
            )}
          </button>

          {isSectionExpanded('events') && (
            <div className="p-4 flex flex-col gap-3">
              {[
                { name: 'AI Hackathon Submission Deadline', date: 'July 25, 2026', time: '11:59 PM IST' },
                { name: 'Google Developer Summit 2026', date: 'Aug 12, 2026', time: '9:00 AM IST' },
                { name: 'Weekly Live Group Code Review', date: 'Every Saturday', time: '6:00 PM IST' }
              ].map((ev, idx) => (
                <div key={idx} className="flex gap-3 items-start p-2 bg-[#181820]/45 rounded-xl border border-white/5">
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 shrink-0 font-mono text-[9px] font-black flex flex-col items-center justify-center w-9.5 h-9.5 leading-none border border-indigo-500/15">
                    <span>{ev.date.split(' ')[1]?.replace(',', '') || '25'}</span>
                    <span className="text-[7px] text-slate-500 uppercase mt-0.5">{ev.date.split(' ')[0]?.substring(0, 3) || 'SAT'}</span>
                  </div>
                  <div className="flex flex-col min-w-0 text-left">
                    <span className="text-[10px] font-bold text-white leading-snug truncate">{ev.name}</span>
                    <span className="text-[8px] text-slate-500 font-semibold mt-1">{ev.date} • {ev.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const rawAdminUrl = import.meta.env.VITE_ADMIN_URL;
  const VITE_ADMIN_URL = (rawAdminUrl && rawAdminUrl !== 'undefined' && rawAdminUrl !== 'null')
    ? rawAdminUrl
    : (window.location.port === '5173' || window.location.port === '5174'
        ? `${window.location.protocol}//${window.location.hostname}:5174`
        : 'https://tauhidshekhar-admin.vercel.app');

  const fetchData = async () => {
    try {
      // 1. Fetch notifications (skip if guest)
      if (user) {
        const notifRes = await api.getCommunityNotifications();
        if (notifRes.success) {
          const unread = (notifRes.data || []).filter(n => !n.read).length;
          setNotifCount(unread);
        }
      }

      // 2. Fetch groups
      const groupsRes = await api.getCommunityGroups();
      if (groupsRes.success) {
        const allGroups = groupsRes.data || [];
        const currentUserId = user?.id || user?._id;
        
        if (currentUserId) {
          // Groups joined by current user
          const joined = allGroups.filter(g => 
            g.members?.some(m => m && (m._id || m.user || m).toString() === currentUserId.toString()) ||
            (g.owner?._id || g.owner)?.toString() === currentUserId.toString()
          );
          setMyGroups(joined);

          // Suggested groups (not joined by current user)
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

      // 3. Fetch leaderboard users for suggested developers
      const leadRes = await api.getCommunityLeaderboard();
      if (leadRes.success) {
        const currentUserId = user?.id || user?._id;
        // Filter out current user and map follows
        const candidates = currentUserId
          ? (leadRes.data || []).filter(u => u && u._id?.toString() !== currentUserId?.toString())
          : (leadRes.data || []);
        setSuggestedDevs(candidates.slice(0, 4));
      }
    } catch (err) {
      console.warn('Community suggestions error:', err.message);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen for real-time updates and refresh sidebar content
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
      }, 15000);
    }

    return () => {
      if (interval) clearInterval(interval);
      window.removeEventListener('cms-content-update', handleCmsUpdate);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleFollowDeveloper = async (userId) => {
    if (!user) {
      alert('Please log in to follow developers.');
      window.location.href = '/login';
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

  const handleJoinGroup = async (groupId) => {
    if (!user) {
      alert('Please log in to perform this action.');
      return;
    }
    try {
      const res = await api.joinLeaveCommunityGroup(groupId);
      if (res.success) {
        alert(res.message || 'Joined group successfully');
        fetchData(); // reload groups list
      }
    } catch (err) {
      alert(err.message || 'Failed to join group.');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/community?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const navItems = [
    { name: 'Home', path: '/community', icon: <FaHome />, prefetch: () => import('./CommunityFeed') },
    { name: 'Explore', path: '/community/projects', icon: <FaCompass />, prefetch: () => import('./CommunityProjectDiscussions') },
    { name: 'Communities', path: '/community/doubts', icon: <FaQuestionCircle />, prefetch: () => import('./CommunityDoubts') },
    { name: 'Groups', path: '/community/groups', icon: <FaUsers />, prefetch: () => import('./CommunityGroups') },
    { name: 'Resources', path: '/community/resources', icon: <FaFolderOpen />, prefetch: () => import('./CommunityResources') },
    { name: 'Messages', path: '/community/chat', icon: <FaComments />, prefetch: () => import('./CommunityChat') },
    { name: 'Notifications', path: '/community/notifications', icon: <FaBell />, badge: notifCount, prefetch: () => import('./CommunityNotifications') },
    { name: 'Profile', path: user ? `/community/profile/${user?.id || user?._id}` : '/login', icon: <FaUser />, prefetch: () => import('./CommunityProfile') },
    { name: 'Rewards Hub', path: '/community/rewards', icon: <FaTasks />, prefetch: () => import('./RewardsDashboard') },
    { name: 'Daily Arena', path: '/community/challenges', icon: <FaCode />, prefetch: () => import('./CodingChallenges') },
    { name: 'Ecosystem Shop', path: '/community/store', icon: <FaGift />, prefetch: () => import('./CommunityStore') },
    { name: 'AI Consultant', path: '/community/ai-assistant', icon: <FaBrain />, prefetch: () => import('./AIConsultant') },
    { name: 'Career Hub', path: '/community/career-hub', icon: <FaBriefcase />, prefetch: () => import('./CareerHub') },
    { name: 'Settings', path: user ? `/user/dashboard` : '/login', icon: <FaCog />, prefetch: () => import('../admin/UserDashboard') }
  ];

  return (
    <div className="min-h-screen bg-[#09090c] text-[#f1f1f5] flex flex-col font-sans selection:bg-purple-600/30 selection:text-purple-300">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-[100] border-b border-white/5 bg-[#121217]/90 backdrop-blur-md px-3 py-2.5 sm:px-6 sm:py-3 flex items-center justify-between shadow-lg shadow-black/10">
        <div className="flex items-center gap-3 sm:gap-6 flex-1 max-w-lg min-w-0">
          {/* Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-lg text-slate-300 hover:text-white lg:hidden cursor-pointer shrink-0"
            title="Open Navigation Menu"
          >
            <FaBars />
          </button>
          
          {/* logo */}
          <Link to="/community" className="text-[15px] sm:text-lg font-black font-title tracking-wider text-white hover:text-purple-400 transition-colors shrink-0">
            DevCommunity
          </Link>
          
          {/* Header search bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full hidden sm:block">
            <input
              type="text"
              placeholder="Search users, posts, groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 rounded-xl bg-[#1e1e24] border border-white/5 text-xs text-white placeholder-slate-450 focus:outline-none focus:border-purple-500 focus:bg-[#23232a] transition-all"
            />
          </form>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {user && (
            <>
              <Link 
                to="/community" 
                className="hidden md:flex px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-md shadow-purple-600/10 items-center gap-1.5 transition-all active:scale-[0.98]"
              >
                <FaPlus size={10} /> Create
              </Link>
              <Link to="/community/notifications" className="relative p-2 sm:p-2.5 rounded-xl bg-[#1c1c24] hover:bg-[#252530] text-slate-400 hover:text-white transition-colors border border-white/5">
                <FaBell size={12} className="sm:text-[13px]" />
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[8px] font-black text-white flex items-center justify-center border-2 border-[#121217]">
                    {notifCount}
                  </span>
                )}
              </Link>
              <Link to="/community/chat" className="p-2 sm:p-2.5 rounded-xl bg-[#1c1c24] hover:bg-[#252530] text-slate-400 hover:text-white transition-colors border border-white/5">
                <FaComments size={12} className="sm:text-[13px]" />
              </Link>
            </>
          )}
          
          <span className="hidden sm:inline h-4 w-px bg-white/10" />

          {/* User Block */}
          {user ? (
            <Link to={`/community/profile/${user?.id || user?._id}`} className="flex items-center gap-1.5 sm:gap-2.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl overflow-hidden bg-[#1e1e24] border border-white/10 flex items-center justify-center shrink-0">
                {user?.avatar?.url ? (
                  <img src={user.avatar.url} alt="Profile" className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <FaUser className="text-slate-400" size={12} />
                )}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-[11px] font-black text-white leading-tight flex items-center gap-1">
                  {user?.fullName} <FaCheckCircle size={10} className="text-purple-400" />
                </span>
                <span className="text-[9px] font-bold text-slate-400 mt-0.5">@{user?.username}</span>
              </div>
            </Link>
          ) : (
            <Link
              to="/login"
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-[10px] sm:text-xs font-black shadow-md shadow-purple-600/10 flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              Join Community
            </Link>
          )}
          
          <Link
            to="/"
            className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-1.5 bg-[#1c1c24] hover:bg-[#252530] text-slate-300 rounded-xl text-[10px] sm:text-xs font-bold transition-all border border-white/5"
          >
            <span className="hidden sm:inline">&larr; Back</span>
            <span className="sm:hidden">&larr;</span>
          </Link>
        </div>
      </header>

      {/* Main Flex Wrapper */}
      <div className="flex-1 max-w-[1400px] w-full mx-auto flex flex-col lg:flex-row gap-6 p-6 pb-24 lg:pb-6 min-h-0">
        
        {/* Left Sidebar Navigator */}
        <aside
          className={`hidden lg:flex flex-col gap-6 shrink-0 sticky top-[72px] h-[calc(100vh-100px)] overflow-y-auto pr-1 text-left scrollbar-none transition-all duration-200 ease-in-out ${
            sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'
          }`}
        >
          {/* ChatGPT-style Sidebar Collapse Toggle */}
          <div className={`flex items-center px-1 shrink-0 ${sidebarCollapsed ? 'justify-center' : 'justify-between pl-4'}`}>
            {!sidebarCollapsed && (
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Navigation
              </span>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="relative group flex items-center justify-center p-2 rounded-xl bg-[#121217] hover:bg-[#1c1c24] text-slate-400 hover:text-white transition-all border border-white/5 cursor-pointer active:scale-95 shadow-sm"
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <svg 
                stroke="currentColor" 
                fill="none" 
                strokeWidth="2" 
                viewBox="0 0 24 24" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className={`w-4.5 h-4.5 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`}
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
                <path d="M14 15l-3-3 3-3" />
              </svg>
              
              {/* Floating Tooltip when collapsed */}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#121217] border border-white/5 text-[10px] font-black text-white uppercase tracking-wider rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap shadow-xl z-[999] shadow-black/40">
                  Expand Sidebar
                </div>
              )}
            </button>
          </div>

          {/* Main Menu Links */}
          <div className="bg-[#121217] border border-white/5 p-4 rounded-3xl flex flex-col gap-1 shadow-sm">
            {navItems.map(item => {
              const active = location.pathname === item.path;
              const tourId = item.name === 'Home' ? 'tour-community' :
                             item.name === 'Profile' ? 'tour-profile' :
                             item.name === 'Notifications' ? 'tour-notifications' :
                             item.name === 'Rewards Hub' ? 'tour-rewards' :
                             item.name === 'AI Consultant' ? 'tour-ai-tools' :
                             item.name === 'Career Hub' ? 'tour-ats' :
                             item.name === 'Explore' ? 'tour-resume-preview' :
                             item.name === 'Ecosystem Shop' ? 'tour-portfolio' :
                             item.name === 'Daily Arena' ? 'tour-services' :
                             item.name === 'Groups' ? 'tour-orders' :
                             item.name === 'Settings' ? 'tour-settings' : undefined;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  id={tourId}
                  onMouseEnter={item.prefetch}
                  className={`relative group flex items-center rounded-2xl text-xs font-bold transition-all ${
                    sidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-4 py-2.5'
                  } ${
                    active 
                      ? 'bg-purple-600/10 text-purple-400 border border-purple-600/15' 
                      : 'text-slate-400 hover:bg-[#1a1a22] hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-sm ${active ? 'text-purple-400' : 'text-slate-500'}`}>{item.icon}</span>
                    {!sidebarCollapsed && <span>{item.name}</span>}
                  </div>
                  
                  {item.badge > 0 && (
                    sidebarCollapsed ? (
                      <span className="absolute top-1 right-1 w-3.5 h-3.5 text-[8px] font-black bg-purple-600 text-white rounded-full flex items-center justify-center border border-[#121217] leading-none scale-90">
                        {item.badge}
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 text-[9px] font-black bg-purple-600 text-white rounded-full leading-none shrink-0">
                        {item.badge}
                      </span>
                    )
                  )}

                  {/* Floating Tooltip when collapsed */}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#121217] border border-white/5 text-[10px] font-black text-white uppercase tracking-wider rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap shadow-xl z-[999] shadow-black/40">
                      {item.name} {item.badge > 0 ? `(${item.badge})` : ''}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Groups collapsible list */}
          <div className="bg-[#121217] border border-white/5 p-4 rounded-3xl flex flex-col gap-3 shadow-sm">
            <div className={`flex items-center border-b border-white/5 pb-2 ${sidebarCollapsed ? 'justify-center border-none' : 'justify-between'}`}>
              {sidebarCollapsed ? (
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider" title="Your Groups">
                  <FaUsers size={16} />
                </span>
              ) : (
                <>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FaUsers /> Your Groups
                  </span>
                  {user && <Link to="/community/groups" className="text-[9px] text-purple-400 font-black uppercase hover:underline">View All</Link>}
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
                      className={`relative group flex items-center rounded-xl hover:bg-white/5 transition-colors ${
                        sidebarCollapsed ? 'justify-center p-1' : 'gap-2.5 p-1'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-purple-600/10 text-purple-400 border border-purple-500/15 flex items-center justify-center shrink-0 font-black text-xs uppercase">
                        {group.logo?.url ? (
                          <img src={group.logo.url} alt="logo" className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          (group.name || '').substring(0, 2)
                        )}
                      </div>
                      {!sidebarCollapsed && (
                        <div className="flex flex-col text-left min-w-0">
                          <span className="text-[11px] font-bold text-white group-hover:text-purple-400 transition-colors truncate">{group.name || 'Unnamed Group'}</span>
                          <span className="text-[9px] text-slate-500 mt-0.5">{group.members?.length || 0} members</span>
                        </div>
                      )}

                      {/* Tooltip for Groups when collapsed */}
                      {sidebarCollapsed && (
                        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#121217] border border-white/5 text-[10px] font-black text-white uppercase tracking-wider rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap shadow-xl z-[999] shadow-black/40">
                          {group.name} ({group.members?.length || 0} members)
                        </div>
                      )}
                    </Link>
                  ))}

                  {!sidebarCollapsed && (
                    <Link 
                      to="/community/groups" 
                      className="mt-2 w-full py-2.5 bg-[#181820] hover:bg-[#20202a] text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 border border-white/5 transition-colors cursor-pointer"
                    >
                      <FaPlus size={8} /> Create Group
                    </Link>
                  )}
                </>
              ) : (
                !sidebarCollapsed && <div className="text-[10px] text-slate-500 py-2 text-center">Log in to view your groups</div>
              )}
            </div>
          </div>

          {/* Stats XP Dashboard widget */}
          {user ? (
            sidebarCollapsed ? (
              <Link
                to={`/community/profile/${user?.id || user?._id}`}
                className="relative group bg-[#121217] border border-white/5 p-3 rounded-3xl flex items-center justify-center shadow-sm hover:bg-white/5 transition-colors cursor-pointer"
              >
                <FaCrown className="text-amber-400" size={16} />
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#121217] border border-white/5 text-[10px] font-black text-white uppercase tracking-wider rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap shadow-xl z-[999] shadow-black/40">
                  Level {user?.level || Math.floor((user?.xp || 0) / 100) + 1} ({user?.xp || 0} XP)
                </div>
              </Link>
            ) : (
              <div className="bg-[#121217] border border-white/5 p-4 rounded-3xl flex flex-col gap-2.5 shadow-sm">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Developer Status</span>
                <div className="flex justify-between items-baseline mb-0.5">
                  <h4 className="text-base font-black text-white">{user?.xp || 0} <span className="text-[9px] text-slate-500 font-bold uppercase">XP</span></h4>
                  <span className="text-[10px] text-amber-400 font-black flex items-center gap-1"><FaCoins size={10} /> {user?.coins || 0}</span>
                </div>
                <div className="w-full h-1 bg-[#1c1c24] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                    style={{ width: `${(user?.xp || 0) % 100}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[8px] text-slate-500 mt-0.5 uppercase font-bold tracking-wider">
                  <span>Level {user?.level || Math.floor((user?.xp || 0) / 100) + 1}</span>
                  <span>Rep: {user?.reputation || 0}</span>
                </div>
              </div>
            )
          ) : (
            sidebarCollapsed ? (
              <Link
                to="/login"
                className="relative group bg-[#121217] border border-white/5 p-3 rounded-3xl flex items-center justify-center shadow-sm hover:bg-white/5 transition-colors cursor-pointer"
              >
                <FaUser className="text-slate-400" size={16} />
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#121217] border border-white/5 text-[10px] font-black text-white uppercase tracking-wider rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap shadow-xl z-[999] shadow-black/40">
                  Log In to track progress
                </div>
              </Link>
            ) : (
              <div className="bg-[#121217] border border-white/5 p-5 rounded-3xl flex flex-col gap-3 shadow-sm text-center">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Developer Status</span>
                <p className="text-[10px] text-slate-400 leading-relaxed">Join DevCommunity to earn XP, coins, and track your streaks!</p>
                <Link
                  to="/login"
                  className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer text-center"
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
        <aside className="hidden xl:flex flex-col gap-6 w-[320px] shrink-0 sticky top-[72px] h-[calc(100vh-100px)] overflow-y-auto pl-1 text-left scrollbar-none">
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
        className={`fixed top-0 left-0 w-64 h-screen bg-[#121217] z-[1000] border-r border-white/5 flex flex-col transition-transform duration-200 ease-out lg:hidden overflow-y-auto ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <span className="text-sm font-black font-title tracking-wider text-white uppercase">DevCommunity</span>
          <button onClick={() => setMobileMenuOpen(false)} className="text-xl text-white cursor-pointer">
            <FaTimes />
          </button>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1 text-left">
          {navItems.map(item => {
            const active = location.pathname === item.path;
            const tourId = item.name === 'Home' ? 'tour-community' :
                           item.name === 'Profile' ? 'tour-profile' :
                           item.name === 'Notifications' ? 'tour-notifications' :
                           item.name === 'Rewards Hub' ? 'tour-rewards' :
                           item.name === 'AI Consultant' ? 'tour-ai-tools' :
                           item.name === 'Career Hub' ? 'tour-ats' :
                           item.name === 'Explore' ? 'tour-resume-preview' :
                           item.name === 'Ecosystem Shop' ? 'tour-portfolio' :
                           item.name === 'Daily Arena' ? 'tour-services' :
                           item.name === 'Groups' ? 'tour-orders' :
                           item.name === 'Settings' ? 'tour-settings' : undefined;
            return (
              <Link
                key={item.name}
                to={item.path}
                id={tourId}
                onClick={() => setMobileMenuOpen(false)}
                onMouseEnter={item.prefetch}
                className={`flex items-center gap-3 px-4.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                  active 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:bg-[#1e1e24] hover:text-white'
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[99] bg-[#121217]/95 backdrop-blur-lg border-t border-white/5 py-2 px-4 flex items-center justify-around shadow-2xl">
        {[
          { name: 'Feed', path: '/community', icon: <FaHome size={16} />, prefetch: () => import('./CommunityFeed') },
          { name: 'Doubts', path: '/community/doubts', icon: <FaQuestionCircle size={16} />, prefetch: () => import('./CommunityDoubts') },
          { name: 'Projects', path: '/community/projects', icon: <FaCompass size={16} />, prefetch: () => import('./CommunityProjectDiscussions') },
          { name: 'Careers', path: '/community/career-hub', icon: <FaBriefcase size={16} />, prefetch: () => import('./CareerHub') },
          { name: 'Ecosystem', path: '/community/store', icon: <FaGift size={16} />, prefetch: () => import('./CommunityStore') }
        ].map(item => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              onMouseEnter={item.prefetch}
              onTouchStart={item.prefetch}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-3.5 rounded-xl transition-all ${
                active 
                  ? 'text-purple-400 font-black' 
                  : 'text-slate-400 hover:text-slate-200'
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
