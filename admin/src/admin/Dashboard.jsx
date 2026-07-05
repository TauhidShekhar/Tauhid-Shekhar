import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaCode, FaBriefcase, FaEnvelope, FaClock, FaCheckCircle, FaTrash, 
  FaUserShield, FaChartLine, FaHistory, FaServer, FaDatabase, FaGlobe,
  FaFileAlt, FaGraduationCap, FaAward, FaCertificate, FaBookOpen, FaUsers
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
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, msgRes] = await Promise.all([
        api.getAnalyticsStats(),
        api.getMessages()
      ]);

      if (analyticsRes.success && analyticsRes.data) {
        const { summary, system: sys, recentActivity: act, visitorChart } = analyticsRes.data;
        setStats({
          projects: summary.projects || 0,
          skills: summary.skills || 0,
          messages: summary.messages || 0,
          unreadMessages: summary.unreadMessages || 0,
          users: summary.users || 0,
          experiences: summary.experiences || 0,
          educations: summary.educations || 0,
          certificates: summary.certificates || 0,
          achievements: summary.achievements || 0,
          blogs: summary.blogs || 0,
          visitors: summary.visitors || 0
        });
        setSystem({
          database: sys?.database || 'Offline',
          api: sys?.api || 'Offline',
          website: sys?.website || 'Offline'
        });
        setRecentActivity(act || []);
        setAnalyticsData(visitorChart.slice(-7) || []);
      }

      if (msgRes.success) {
        setRecentMessages(msgRes.data.slice(0, 3));
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
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-primary-blue animate-spin" />
      </div>
    );
  }

  const metricCards = [
    { title: 'Total Projects', value: stats.projects, icon: <FaBriefcase className="text-primary-blue" size={18} />, bg: 'bg-primary-blue/5 border-primary-blue/20' },
    { title: 'Skills Indexed', value: stats.skills, icon: <FaCode className="text-primary-purple" size={18} />, bg: 'bg-primary-purple/5 border-primary-purple/20' },
    { title: 'Experiences', value: stats.experiences, icon: <FaHistory className="text-orange-500" size={18} />, bg: 'bg-orange-500/5 border-orange-500/20' },
    { title: 'Education Degrees', value: stats.educations, icon: <FaGraduationCap className="text-green-500" size={18} />, bg: 'bg-green-500/5 border-green-500/20' },
    { title: 'Certificates', value: stats.certificates, icon: <FaCertificate className="text-yellow-500" size={18} />, bg: 'bg-yellow-500/5 border-yellow-500/20' },
    { title: 'Achievements', value: stats.achievements, icon: <FaAward className="text-red-500" size={18} />, bg: 'bg-red-500/5 border-red-500/20' },
    { title: 'Blog Posts', value: stats.blogs, icon: <FaBookOpen className="text-indigo-500" size={18} />, bg: 'bg-indigo-500/5 border-indigo-500/20' },
    { title: 'Inbox Messages', value: `${stats.unreadMessages} New / ${stats.messages}`, icon: <FaEnvelope className="text-primary-cyan" size={18} />, bg: 'bg-primary-cyan/5 border-primary-cyan/20' },
    { title: 'Total Visitors', value: stats.visitors, icon: <FaUsers className="text-pink-500" size={18} />, bg: 'bg-pink-500/5 border-pink-500/20' },
  ];

  return (
    <div className="flex flex-col gap-8 text-left animate-fade-in">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-black font-title tracking-tight text-black dark:text-white">CMS Dashboard</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Hello, <span className="font-extrabold text-primary-blue">{user?.fullName}</span>. Here is the operational state of your website.</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {metricCards.map((card, idx) => (
          <div key={idx} className={`glass p-5 rounded-2xl border ${card.bg} shadow-sm flex items-center justify-between`}>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{card.title}</span>
              <span className="text-xl font-black text-black dark:text-white font-title">{card.value}</span>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-white/5 flex items-center justify-center shadow-sm">
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Chart Block */}
      <div className="glass p-6 rounded-[24px] border border-slate-200/60 dark:border-white/5 shadow-sm">
        <h3 className="text-lg font-bold font-title text-black dark:text-white mb-6 flex items-center gap-2">
          <FaChartLine className="text-primary-blue" /> Weekly Page View Visitor Trend
        </h3>

        {analyticsData.length === 0 ? (
          <div className="py-20 text-center text-sm text-slate-400">
            No visitor traffic recorded yet. Page views will appear once tracked.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-end h-40 pt-4 px-2 border-b border-slate-200 dark:border-white/5 gap-2 md:gap-4">
              {analyticsData.map((d, index) => {
                const maxVal = Math.max(...analyticsData.map(item => Number(item.views || 0)), 10);
                const heightPercentage = Math.max(((Number(d.views || 0)) / maxVal) * 100, 10);
                return (
                  <div key={index} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 text-white text-[9px] font-black px-2 py-1 rounded shadow-md pointer-events-none z-10">
                      {d.views || 0} Views / {d.visitors || 0} Visitors
                    </div>
                    <div 
                      style={{ height: `${heightPercentage}%` }} 
                      className="w-full max-w-[40px] bg-gradient-to-t from-primary-blue to-primary-cyan rounded-t-lg group-hover:brightness-110 transition-all duration-350"
                    />
                    <span className="text-[10px] font-bold text-slate-400 mt-2 block whitespace-nowrap">
                      {d.date ? String(d.date).slice(5) : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Inbox & Server Information split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Recent Inquiries */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="glass p-6 rounded-[24px] border border-slate-200/60 dark:border-white/5 shadow-sm">
            <h3 className="text-lg font-bold font-title text-black dark:text-white mb-6 flex items-center gap-2">
              <FaEnvelope className="text-primary-blue" /> Recent Inbox Messages
            </h3>

            {recentMessages.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-400">
                No recent messages in your inbox.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {recentMessages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`p-4 rounded-xl border flex flex-col gap-2 transition-all text-left ${
                      msg.isRead
                        ? 'bg-slate-50/50 dark:bg-white/5 border-slate-200/40 dark:border-white/5 opacity-80'
                        : 'bg-white dark:bg-slate-900/60 border-primary-blue/20 dark:border-primary-blue/15 shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-sm font-bold text-black dark:text-white">{msg.name}</span>
                        <span className="text-xs text-slate-400 block mt-0.5">{msg.email}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        {!msg.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(msg._id)}
                            className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 cursor-pointer"
                            title="Mark as Read"
                          >
                            <FaCheckCircle size={10} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteMessage(msg._id)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 cursor-pointer"
                          title="Delete Message"
                        >
                          <FaTrash size={10} />
                        </button>
                      </div>
                    </div>
                    <h4 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wide">Subject: {msg.subject || '(No Subject)'}</h4>
                    <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed mt-1">
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Server Setup & System Status */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Status block */}
          <div className="glass p-6 rounded-[24px] border border-slate-200/60 dark:border-white/5 shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-black font-title uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
              <FaServer className="text-primary-blue" /> System Status
            </h3>

            <div className="flex flex-col gap-3.5 text-xs text-left leading-relaxed">
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-150 dark:border-white/5">
                <span className="font-bold flex items-center gap-2 text-slate-450 dark:text-slate-400">
                  <FaDatabase size={12} className="text-orange-500" /> Database Status
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  system.database === 'Connected' ? 'bg-green-500/15 text-green-500' : 'bg-red-500/15 text-red-500'
                }`}>
                  {system.database}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-150 dark:border-white/5">
                <span className="font-bold flex items-center gap-2 text-slate-450 dark:text-slate-400">
                  <FaGlobe size={12} className="text-primary-blue" /> API Status
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/15 text-green-500">
                  {system.api}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-150 dark:border-white/5">
                <span className="font-bold flex items-center gap-2 text-slate-450 dark:text-slate-400">
                  <FaGlobe size={12} className="text-primary-purple" /> Website Status
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/15 text-green-500">
                  {system.website}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity Log Feed */}
          <div className="glass p-6 rounded-[24px] border border-slate-200/60 dark:border-white/5 shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-black font-title uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
              <FaHistory className="text-primary-purple" /> Recent CMS Activity
            </h3>

            <div className="flex flex-col gap-3">
              {recentActivity.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6 font-bold uppercase tracking-wider">No activities recorded</p>
              ) : (
                recentActivity.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-150 dark:border-white/5 text-xs text-left">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-black dark:text-white truncate max-w-[120px]">{log.user}</span>
                      <span className="text-[9px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Performed <span className="font-extrabold text-primary-purple">{log.action}</span> on <span className="font-bold">{log.resource}</span>
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
