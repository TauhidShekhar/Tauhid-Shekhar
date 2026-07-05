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
  
  const [notifCount, setNotifCount] = useState(0);
  const [myGroups, setMyGroups] = useState([]);
  const [suggestedGroups, setSuggestedGroups] = useState([]);
  const [suggestedDevs, setSuggestedDevs] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const rawAdminUrl = import.meta.env.VITE_ADMIN_URL;
  const VITE_ADMIN_URL = (rawAdminUrl && rawAdminUrl !== 'undefined' && rawAdminUrl !== 'null')
    ? rawAdminUrl
    : (window.location.port === '5173' || window.location.port === '5174'
        ? `${window.location.protocol}//${window.location.hostname}:5174`
        : 'https://tauhid-shekhar-portfolio-f4xf.vercel.app');

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
            g.members?.some(m => m && (m.user || m || m._id || '').toString() === currentUserId.toString()) ||
            (g.owner?._id || g.owner)?.toString() === currentUserId.toString()
          );
          setMyGroups(joined);

          // Suggested groups (not joined by current user)
          const unjoined = allGroups.filter(g => 
            !g.members?.some(m => m && (m.user || m || m._id || '').toString() === currentUserId.toString()) &&
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
    if (user) {
      const interval = setInterval(fetchData, 15000);
      return () => clearInterval(interval);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleFollowDeveloper = async (userId) => {
    if (!user) {
      alert('Please log in to perform this action.');
      return;
    }
    try {
      const res = await api.toggleFollowUser(userId);
      if (res.success) {
        // Toggle follow status in state
        setSuggestedDevs(prev => prev.map(d => {
          if (d._id === userId) {
            const list = (d.followers || []).filter(Boolean).map(id => id.toString());
            const currentUserId = (user?.id || user?._id)?.toString();
            const isFollowingNow = list.includes(currentUserId);
            return {
              ...d,
              followers: isFollowingNow 
                ? list.filter(id => id !== currentUserId) 
                : [...list, currentUserId]
            };
          }
          return d;
        }));
      }
    } catch (err) {
      console.error(err);
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
        fetchData(); // reload groups list
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/community?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const navItems = [
    { name: 'Home', path: '/community', icon: <FaHome /> },
    { name: 'Explore', path: '/community/projects', icon: <FaCompass /> },
    { name: 'Communities', path: '/community/doubts', icon: <FaQuestionCircle /> },
    { name: 'Groups', path: '/community/groups', icon: <FaUsers /> },
    { name: 'Resources', path: '/community/resources', icon: <FaFolderOpen /> },
    { name: 'Messages', path: '/community/chat', icon: <FaComments /> },
    { name: 'Notifications', path: '/community/notifications', icon: <FaBell />, badge: notifCount },
    { name: 'Profile', path: user ? `/community/profile/${user?.id || user?._id}` : '/admin/login', icon: <FaUser /> },
    { name: 'Rewards Hub', path: '/community/rewards', icon: <FaTasks /> },
    { name: 'Daily Arena', path: '/community/challenges', icon: <FaCode /> },
    { name: 'Ecosystem Shop', path: '/community/store', icon: <FaGift /> },
    { name: 'AI Consultant', path: '/community/ai-assistant', icon: <FaBrain /> },
    { name: 'Career Hub', path: '/community/career-hub', icon: <FaBriefcase /> },
    { name: 'Settings', path: user ? `/user/dashboard` : '/admin/login', icon: <FaCog /> }
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
                  <img src={user.avatar.url} alt="Profile" className="w-full h-full object-cover" />
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
            <a
              href={`${VITE_ADMIN_URL}/admin/login`}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-[10px] sm:text-xs font-black shadow-md shadow-purple-600/10 flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              Join Community
            </a>
          )}
          
          <Link
            to="/"
            className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-1.5 bg-[#1c1c24] hover:bg-[#252530] text-slate-300 rounded-xl text-[10px] sm:text-xs font-bold transition-all border border-white/5"
          >
            <span>&larr; Back</span>
          </Link>
        </div>
      </header>

      {/* Main Grid Wrapper */}
      <div className="flex-1 max-w-[1400px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 min-h-0">
        
        {/* Left Sidebar Navigator (col-span-3) */}
        <aside className="hidden lg:flex flex-col gap-6 col-span-3 sticky top-[72px] h-[calc(100vh-100px)] overflow-y-auto pr-1 text-left scrollbar-none">
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
                  className={`flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    active 
                      ? 'bg-purple-600/10 text-purple-400 border border-purple-600/15' 
                      : 'text-slate-400 hover:bg-[#1a1a22] hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-sm ${active ? 'text-purple-400' : 'text-slate-500'}`}>{item.icon}</span>
                    <span>{item.name}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="px-1.5 py-0.5 text-[9px] font-black bg-purple-600 text-white rounded-full leading-none shrink-0">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Groups collapsible list */}
          <div className="bg-[#121217] border border-white/5 p-4 rounded-3xl flex flex-col gap-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FaUsers /> Your Groups
              </span>
              {user && <Link to="/community/groups" className="text-[9px] text-purple-400 font-black uppercase hover:underline">View All</Link>}
            </div>

            <div className="flex flex-col gap-2">
              {user ? (
                <>
                  {myGroups.slice(0, 4).filter(Boolean).map(group => (
                    <Link key={group._id} to="/community/groups" className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-white/5 transition-colors group">
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-purple-600/10 text-purple-400 border border-purple-500/15 flex items-center justify-center shrink-0 font-black text-xs uppercase">
                        {group.logo?.url ? (
                          <img src={group.logo.url} alt="logo" className="w-full h-full object-cover" />
                        ) : (
                          (group.name || '').substring(0, 2)
                        )}
                      </div>
                      <div className="flex flex-col text-left min-w-0">
                        <span className="text-[11px] font-bold text-white group-hover:text-purple-400 transition-colors truncate">{group.name || 'Unnamed Group'}</span>
                        <span className="text-[9px] text-slate-500 mt-0.5">{group.members?.length || 0} members</span>
                      </div>
                    </Link>
                  ))}

                  <Link 
                    to="/community/groups" 
                    className="mt-2 w-full py-2.5 bg-[#181820] hover:bg-[#20202a] text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 border border-white/5 transition-colors cursor-pointer"
                  >
                    <FaPlus size={8} /> Create Group
                  </Link>
                </>
              ) : (
                <div className="text-[10px] text-slate-500 py-2 text-center">Log in to view your groups</div>
              )}
            </div>
          </div>

          {/* Stats XP Dashboard widget */}
          {user ? (
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
          ) : (
            <div className="bg-[#121217] border border-white/5 p-5 rounded-3xl flex flex-col gap-3 shadow-sm text-center">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Developer Status</span>
              <p className="text-[10px] text-slate-400 leading-relaxed">Join DevCommunity to earn XP, coins, and track your streaks!</p>
              <a
                href={`${VITE_ADMIN_URL}/admin/login`}
                className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer text-center"
              >
                Log In
              </a>
            </div>
          )}
        </aside>

        {/* Center column - Active Outlet View (col-span-6) */}
        <main className="col-span-12 lg:col-span-9 xl:col-span-6 flex flex-col gap-6 min-h-0">
          <Outlet />
        </main>

        {/* Right Sidebar Navigator (col-span-3) */}
        <aside className="hidden xl:flex flex-col gap-6 col-span-3 sticky top-[72px] h-[calc(100vh-100px)] overflow-y-auto pl-1 text-left scrollbar-none">
          
          {/* People You May Know */}
          <div className="bg-[#121217] border border-white/5 p-4 rounded-3xl flex flex-col gap-3.5 shadow-sm">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Suggested Developers</span>
              <Link to="/community/leaderboard" className="text-[9px] text-purple-400 font-black uppercase hover:underline">View Leaderboard</Link>
            </div>

            <div className="flex flex-col gap-3">
              {suggestedDevs.filter(Boolean).map(dev => {
                const currentUserId = (user?.id || user?._id)?.toString();
                const isFollowing = dev.followers?.some(fid => fid && fid.toString() === currentUserId);
                return (
                  <div key={dev._id} className="flex items-center justify-between gap-2.5 p-1 rounded-xl">
                    <Link to={`/community/profile/${dev._id}`} className="flex items-center gap-2 min-w-0">
                      <div className="w-8.5 h-8.5 rounded-xl overflow-hidden bg-[#1e1e24] border border-white/10 shrink-0 flex items-center justify-center">
                        {dev.avatar?.url ? (
                          <img src={dev.avatar.url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <FaUser className="text-slate-500" size={12} />
                        )}
                      </div>
                      <div className="flex flex-col text-left min-w-0">
                        <span className="text-[11px] font-bold text-white hover:text-purple-400 transition-colors truncate">{dev.fullName}</span>
                        <span className="text-[9px] text-slate-500 mt-0.5 truncate">@{dev.username}</span>
                      </div>
                    </Link>
                    
                    <button
                      onClick={() => handleFollowDeveloper(dev._id)}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border cursor-pointer transition-all ${
                        isFollowing 
                          ? 'bg-transparent border-slate-700 text-slate-400' 
                          : 'bg-purple-600/10 border-purple-500/20 text-purple-400 hover:bg-purple-600 hover:text-white'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                );
              })}

              {suggestedDevs.length === 0 && (
                <div className="text-[10px] text-slate-550 italic text-center py-2">No developer recommendations.</div>
              )}
            </div>
          </div>

          {/* Groups You May Like */}
          <div className="bg-[#121217] border border-white/5 p-4 rounded-3xl flex flex-col gap-3.5 shadow-sm">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Suggested Groups</span>
            </div>

            <div className="flex flex-col gap-3">
              {suggestedGroups.filter(Boolean).map(group => (
                <div key={group._id} className="flex items-center justify-between gap-2.5 p-1 rounded-xl">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8.5 h-8.5 rounded-xl overflow-hidden bg-purple-600/10 text-purple-400 border border-purple-500/15 flex items-center justify-center shrink-0 font-black text-[10px] uppercase">
                      {group.logo?.url ? (
                        <img src={group.logo.url} alt="logo" className="w-full h-full object-cover" />
                      ) : (
                        (group.name || '').substring(0, 2)
                      )}
                    </div>
                    <div className="flex flex-col text-left min-w-0">
                      <span className="text-[11px] font-bold text-white truncate">{group.name || 'Unnamed Group'}</span>
                      <span className="text-[9px] text-slate-500 mt-0.5">{group.members?.length || 0} members</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleJoinGroup(group._id)}
                    className="px-3 py-1.5 bg-purple-600/10 hover:bg-purple-600 border border-purple-500/20 text-purple-400 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all"
                  >
                    Join
                  </button>
                </div>
              ))}

              {suggestedGroups.length === 0 && (
                <div className="text-[10px] text-slate-550 italic text-center py-2">No new groups recommendations.</div>
              )}
            </div>
          </div>
        </aside>

      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 w-64 h-screen bg-[#121217] z-[1000] border-r border-white/5 flex flex-col transition-transform duration-300 lg:hidden overflow-y-auto ${
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

    </div>
  );
};

export default CommunityLayout;
