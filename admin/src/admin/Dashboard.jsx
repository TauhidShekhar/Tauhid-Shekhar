import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaCode, FaBriefcase, FaEnvelope, FaClock, FaCheckCircle, FaTrash, 
  FaUserShield, FaChartLine, FaHistory, FaServer, FaDatabase, FaGlobe,
  FaFileAlt, FaGraduationCap, FaAward, FaCertificate, FaBookOpen, FaUsers,
  FaArrowRight, FaExternalLinkAlt, FaPlus, FaCheck, FaExclamationCircle
} from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    projects: 0,
    skills: 0,
    messages: 0,
    unreadMessages: 0,
    users: 0,
    experiences: 0,
    educations: 0,
    certificates: 0,
    achievements: 0,
    blogs: 0,
    visitors: 0
  });

  const [system, setSystem] = useState({
    database: 'Checking...',
    api: 'Checking...',
    website: 'Checking...'
  });
  
  const [dbDetails, setDbDetails] = useState({
    connected: false,
    latencyMs: null,
    host: null,
    reconnectAttempts: 0
  });
  const [isPingingDb, setIsPingingDb] = useState(false);
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const clientUrl = (import.meta.env.VITE_CLIENT_URL && import.meta.env.VITE_CLIENT_URL !== 'undefined' && import.meta.env.VITE_CLIENT_URL !== 'null')
    ? import.meta.env.VITE_CLIENT_URL
    : (isLocal ? 'http://localhost:5173' : 'https://tauhidshekhar.vercel.app');

  const checkDbPing = async () => {
    setIsPingingDb(true);
    try {
      const dbRes = await api.getDbHealth();
      if (dbRes) {
        setSystem(prev => ({
          ...prev,
          database: dbRes.status || (dbRes.connected ? 'Connected' : 'Temporarily Unavailable'),
          api: 'Operational (200 OK)'
        }));
        setDbDetails({
          connected: Boolean(dbRes.connected),
          latencyMs: dbRes.latencyMs,
          host: dbRes.host,
          reconnectAttempts: dbRes.reconnectAttempts || 0
        });
      }
    } catch (_) {
      setSystem(prev => ({
        ...prev,
        database: 'Temporarily Unavailable',
        api: 'Unreachable'
      }));
      setDbDetails({
        connected: false,
        latencyMs: null,
        host: null,
        reconnectAttempts: 0
      });
    } finally {
      setIsPingingDb(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, msgRes, dbRes] = await Promise.all([
        api.getAnalyticsStats().catch(() => ({ success: false })),
        api.getMessages().catch(() => ({ success: false })),
        api.getDbHealth().catch(() => ({ success: false, status: 'Temporarily Unavailable' }))
      ]);

      if (analyticsRes.success && analyticsRes.data) {
        const { summary, system: sys, recentActivity: act, visitorChart } = analyticsRes.data;
        setStats({
          projects: summary?.projects || 0,
          skills: summary?.skills || 0,
          messages: summary?.messages || 0,
          unreadMessages: summary?.unreadMessages || 0,
          users: summary?.users || 0,
          experiences: summary?.experiences || 0,
          educations: summary?.educations || 0,
          certificates: summary?.certificates || 0,
          achievements: summary?.achievements || 0,
          blogs: summary?.blogs || 0,
          visitors: summary?.visitors || 0
        });
        setSystem({
          database: dbRes?.status || sys?.database || 'Connected',
          api: sys?.api || 'Operational (200 OK)',
          website: sys?.website || 'Online'
        });
        setRecentActivity(act || []);
        setAnalyticsData(visitorChart?.slice(-7) || []);
      } else {
        setSystem({
          database: dbRes?.status || 'Temporarily Unavailable',
          api: 'Operational (200 OK)',
          website: 'Online'
        });
      }

      if (dbRes) {
        setDbDetails({
          connected: Boolean(dbRes.connected),
          latencyMs: dbRes.latencyMs,
          host: dbRes.host,
          reconnectAttempts: dbRes.reconnectAttempts || 0
        });
      }

      if (msgRes.success && Array.isArray(msgRes.data)) {
        setRecentMessages(msgRes.data.slice(0, 4));
        const unread = msgRes.data.filter(m => !m.isRead && !m.isArchived).length;
        setStats(prev => ({ ...prev, messages: msgRes.data.length, unreadMessages: unread }));
      }
    } catch (err) {
      console.error('Error loading dashboard statistics:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await api.markMessageRead(id);
      if (res.success) {
        setRecentMessages(prev => prev.map(m => m._id === id ? { ...m, isRead: true } : m));
        setStats(prev => ({ ...prev, unreadMessages: Math.max(0, prev.unreadMessages - 1) }));
      }
    } catch (err) {
      console.error('Failed to mark read:', err.message);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      const res = await api.deleteMessage(id);
      if (res.success) {
        setRecentMessages(prev => prev.filter(m => m._id !== id));
        setStats(prev => ({ ...prev, messages: Math.max(0, prev.messages - 1) }));
      }
    } catch (err) {
      console.error('Failed to delete message:', err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[55vh] gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-[#C2272D]/20 border-t-[#C2272D] animate-spin" />
        <span className="text-xs font-semibold text-slate-400">Loading Dashboard Metrics...</span>
      </div>
    );
  }

  // Greeting based on time of day
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const metricCards = [
    { title: 'Total Projects', value: stats.projects, icon: FaBriefcase, to: '/admin/projects' },
    { title: 'Skills Indexed', value: stats.skills, icon: FaCode, to: '/admin/skills' },
    { title: 'Work Experiences', value: stats.experiences, icon: FaHistory, to: '/admin/experience' },
    { title: 'Education Degrees', value: stats.educations, icon: FaGraduationCap, to: '/admin/education' },
    { title: 'Certificates', value: stats.certificates, icon: FaCertificate, to: '/admin/certificates' },
    { title: 'Achievements', value: stats.achievements, icon: FaAward, to: '/admin/achievements' },
    { title: 'Blog Articles', value: stats.blogs, icon: FaBookOpen, to: '/admin/blogs' },
    { title: 'Inbox Messages', value: `${stats.unreadMessages} New / ${stats.messages}`, icon: FaEnvelope, to: '/admin/messages', isAlert: stats.unreadMessages > 0 },
    { title: 'Total Visitors', value: stats.visitors > 0 ? stats.visitors.toLocaleString() : '0 Tracked', icon: FaUsers, to: '/admin/analytics' },
  ];

  return (
    <div className="flex flex-col gap-6 sm:gap-8 text-left animate-fade-in max-w-[1600px] mx-auto">
      
      {/* Welcome Hero Banner with TS Branding */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-white via-white to-slate-50 dark:from-[#111111] dark:via-[#131313] dark:to-[#171717] border border-slate-200 dark:border-white/10 shadow-lg shadow-black/5">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#C2272D]/10 to-[#00FFFF]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C2272D]/10 dark:bg-[#00FFFF]/10 border border-[#C2272D]/20 dark:border-[#00FFFF]/20 text-[#C2272D] dark:text-[#00FFFF] text-xs font-bold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-[#C2272D] dark:bg-[#00FFFF] animate-ping" />
              <span>{timeGreeting}, {user?.fullName?.split(' ')[0] || 'Admin'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-title tracking-tight text-[#171717] dark:text-white leading-tight">
              Tauhid Shekhar <span className="text-[#C2272D] dark:text-[#00FFFF]">CMS Dashboard</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Real-time platform overview, content synchronization, visitor trends, and contact message management.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <a
              href={clientUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#1A1A1A] hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 text-xs font-bold transition-all shadow-sm hover:shadow"
            >
              <span>Live Website</span>
              <FaExternalLinkAlt size={11} className="text-[#C2272D] dark:text-[#00FFFF]" />
            </a>
            <Link
              to="/admin/projects"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C2272D] hover:bg-[#A51E23] text-white text-xs font-bold transition-all shadow-md shadow-[#C2272D]/25 hover:shadow-lg hover:shadow-[#C2272D]/40"
            >
              <FaPlus size={11} />
              <span>Add Project</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4.5">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              to={card.to}
              className="group p-5 rounded-2xl bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 border-l-4 border-l-[#C2272D] dark:border-l-[#00FFFF] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex items-center justify-between"
            >
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  {card.title}
                </span>
                <span className="text-xl sm:text-2xl font-black text-[#171717] dark:text-white font-title tracking-tight block">
                  {card.value}
                </span>
                {card.isAlert && (
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-[#C2272D]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C2272D] animate-ping" />
                    Action required
                  </span>
                )}
              </div>

              <div className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 flex items-center justify-center text-[#C2272D] dark:text-[#00FFFF] group-hover:scale-110 group-hover:bg-[#C2272D]/10 dark:group-hover:bg-[#00FFFF]/10 transition-all shrink-0">
                <Icon size={18} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Visitor Analytics Chart Block */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h3 className="text-base sm:text-lg font-bold font-title text-[#171717] dark:text-white flex items-center gap-2.5">
            <FaChartLine className="text-[#C2272D] dark:text-[#00FFFF]" />
            <span>Weekly Page Views & Traffic Trend</span>
          </h3>
          <Link to="/admin/analytics" className="text-xs font-bold text-[#C2272D] dark:text-[#00FFFF] hover:underline inline-flex items-center gap-1">
            <span>Detailed Analytics</span>
            <FaArrowRight size={10} />
          </Link>
        </div>

        {analyticsData.length === 0 ? (
          <div className="py-16 text-center text-xs sm:text-sm text-slate-400">
            No visitor traffic recorded this week. Traffic bars will appear automatically as visitors browse.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-end h-44 pt-6 px-2 border-b border-slate-200 dark:border-white/10 gap-2 sm:gap-4">
              {analyticsData.map((d, index) => {
                const maxVal = Math.max(...analyticsData.map(item => Number(item.views || 0)), 10);
                const heightPercentage = Math.max(((Number(d.views || 0)) / maxVal) * 100, 12);
                return (
                  <div key={index} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg pointer-events-none z-10 whitespace-nowrap border border-white/10">
                      {d.views || 0} Views • {d.visitors || 0} Visitors
                    </div>
                    {/* Bar */}
                    <div 
                      style={{ height: `${heightPercentage}%` }} 
                      className="w-full max-w-[44px] bg-gradient-to-t from-[#C2272D] to-[#00FFFF] rounded-t-lg group-hover:brightness-110 transition-all duration-300 shadow-sm"
                    />
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-2 block whitespace-nowrap">
                      {d.date ? String(d.date).slice(5) : ''}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-end gap-4 text-[11px] text-slate-500 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#C2272D]"></span> Base Views
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#00FFFF]"></span> High Peak
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Split Grid: Recent Inquiries & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* Left: Recent Inquiries */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base sm:text-lg font-bold font-title text-[#171717] dark:text-white flex items-center gap-2.5">
                <FaEnvelope className="text-[#C2272D] dark:text-[#00FFFF]" />
                <span>Recent Contact Inquiries</span>
              </h3>
              <Link to="/admin/messages" className="text-xs font-bold text-[#C2272D] dark:text-[#00FFFF] hover:underline inline-flex items-center gap-1">
                <span>View All ({stats.messages})</span>
                <FaArrowRight size={10} />
              </Link>
            </div>

            {recentMessages.length === 0 ? (
              <div className="py-12 text-center text-xs sm:text-sm text-slate-400">
                No recent contact messages in your inbox.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {recentMessages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`p-4 rounded-2xl border transition-all text-left flex flex-col gap-2 ${
                      msg.isRead
                        ? 'bg-slate-50/70 dark:bg-white/5 border-slate-200/60 dark:border-white/5 opacity-80'
                        : 'bg-white dark:bg-[#161616] border-[#C2272D]/30 dark:border-[#00FFFF]/30 shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#171717] dark:text-white truncate">{msg.name}</span>
                          {!msg.isRead && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#C2272D]/10 text-[#C2272D] dark:bg-[#00FFFF]/10 dark:text-[#00FFFF]">
                              NEW
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 block truncate">{msg.email}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 shrink-0">
                        {!msg.isRead && (
                          <button
                            type="button"
                            onClick={() => handleMarkAsRead(msg._id)}
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer"
                            title="Mark as Read"
                          >
                            <FaCheckCircle size={12} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(msg._id)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors cursor-pointer"
                          title="Delete Message"
                        >
                          <FaTrash size={11} />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Subject: {msg.subject || '(No Subject)'}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: System Status & Activity Feed */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Status Box */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold font-title uppercase tracking-wider text-slate-400 dark:text-slate-400 flex items-center gap-2">
                <FaServer className="text-[#C2272D] dark:text-[#00FFFF]" />
                <span>System Health & Status</span>
              </h3>
              <button
                type="button"
                onClick={checkDbPing}
                disabled={isPingingDb}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/5 hover:bg-[#C2272D] hover:text-white dark:hover:bg-[#00FFFF] dark:hover:text-black transition-colors cursor-pointer border border-slate-200 dark:border-white/10 flex items-center gap-1.5"
              >
                {isPingingDb ? (
                  <>
                    <span className="w-2 h-2 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    <span>Pinging...</span>
                  </>
                ) : (
                  <span>Test Ping</span>
                )}
              </button>
            </div>

            <div className="flex flex-col gap-2.5 text-xs text-left">
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
                <div className="flex flex-col">
                  <span className="font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <FaDatabase size={13} className="text-orange-500" /> Database Status
                  </span>
                  {dbDetails.host && (
                    <span className="text-[10px] text-slate-400 ml-5 truncate max-w-[150px]">
                      {dbDetails.host}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    dbDetails.connected
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : (system.database === 'Reconnecting'
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                          : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400')
                  }`}>
                    {system.database} {dbDetails.latencyMs ? `(${dbDetails.latencyMs}ms)` : ''}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
                <span className="font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <FaGlobe size={13} className="text-[#00FFFF]" /> API Gateway
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {system.api}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
                <span className="font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <FaGlobe size={13} className="text-[#C2272D]" /> Website Status
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {system.website}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Log Feed */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col gap-4">
            <h3 className="text-xs font-bold font-title uppercase tracking-wider text-slate-400 dark:text-slate-400 flex items-center gap-2">
              <FaHistory className="text-[#C2272D] dark:text-[#00FFFF]" />
              <span>Recent Activity Feed</span>
            </h3>

            <div className="flex flex-col gap-2.5">
              {recentActivity.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No recent actions recorded.</p>
              ) : (
                recentActivity.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-xs text-left">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-[#171717] dark:text-white truncate max-w-[130px]">{log.user}</span>
                      <span className="text-[10px] text-slate-400">
                        {log.timestamp || log.createdAt ? new Date(log.timestamp || log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-bold text-[#C2272D] dark:text-[#00FFFF]">{log.action}</span> on <span className="font-medium">{log.resource}</span>
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
