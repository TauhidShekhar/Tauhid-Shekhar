import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  FaChartLine, FaDesktop, FaMobileAlt, FaTabletAlt, FaGlobe, 
  FaShareAlt, FaDownload, FaUser, FaComments, FaQuestionCircle, 
  FaWhatsapp, FaFacebook, FaTwitter, FaLinkedin, FaLink 
} from 'react-icons/fa';

const AnalyticsManager = () => {
  const [activeTab, setActiveTab] = useState('visitors');
  const [visitorStats, setVisitorStats] = useState(null);
  const [shareStats, setShareStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareLoading, setShareLoading] = useState(false);

  const loadVisitorStats = async () => {
    try {
      const res = await api.getAnalyticsStats();
      if (res.success) {
        setVisitorStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load visitor analytics:', err.message);
    }
  };

  const loadShareStats = async () => {
    setShareLoading(true);
    try {
      const res = await api.getShareStats();
      if (res.success) {
        setShareStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load sharing analytics:', err.message);
    } finally {
      setShareLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadVisitorStats();
      await loadShareStats();
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-primary-blue animate-spin" />
      </div>
    );
  }

  const { topPages = [], deviceBreakdown = { desktop: 0, mobile: 0, tablet: 0 } } = visitorStats || {};
  const totalDeviceHits = Math.max(deviceBreakdown.desktop + deviceBreakdown.mobile + deviceBreakdown.tablet, 1);

  const { 
    totalShares = 0,
    platformBreakdown = [],
    dailyGraph = [],
    topSharedUsers = [],
    topSharedPosts = [],
    topSharedDoubts = []
  } = shareStats || {};

  const getPlatformIcon = (platform) => {
    switch (platform.toLowerCase()) {
      case 'whatsapp': return <FaWhatsapp className="text-green-500" />;
      case 'facebook': return <FaFacebook className="text-blue-600" />;
      case 'twitter':
      case 'twitter/x': return <FaTwitter className="text-sky-400" />;
      case 'linkedin': return <FaLinkedin className="text-blue-700" />;
      case 'copy_link': return <FaLink className="text-slate-400" />;
      default: return <FaShareAlt className="text-slate-400" />;
    }
  };

  const handleExportCSV = () => {
    window.open(api.exportShareCSVUrl, '_blank');
  };

  return (
    <div className="flex flex-col gap-6 text-left animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black font-title text-black dark:text-white">Analytics Panel</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Aggregated statistics reports tracking visitor viewport, landing pages, and social content shares.
          </p>
        </div>
        {activeTab === 'shares' && (
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-gradient-to-r from-primary-blue to-accent-blue text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md shadow-primary-blue/15 hover:scale-[1.02] transition-transform"
          >
            <FaDownload /> Export CSV
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-white/5">
        <button
          onClick={() => setActiveTab('visitors')}
          className={`px-5 py-3 text-xs font-black uppercase tracking-widest border-b-2 cursor-pointer transition-all ${
            activeTab === 'visitors'
              ? 'border-primary-blue text-primary-blue'
              : 'border-transparent text-slate-400 hover:text-black dark:hover:text-white'
          }`}
        >
          Visitor Insights
        </button>
        <button
          onClick={() => setActiveTab('shares')}
          className={`px-5 py-3 text-xs font-black uppercase tracking-widest border-b-2 cursor-pointer transition-all ${
            activeTab === 'shares'
              ? 'border-primary-purple text-primary-purple'
              : 'border-transparent text-slate-400 hover:text-black dark:hover:text-white'
          }`}
        >
          Sharing Insights
        </button>
      </div>

      {/* Panels */}
      {activeTab === 'visitors' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Landed Pages */}
          <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm flex flex-col gap-5">
            <h3 className="text-lg font-bold font-title text-black dark:text-white flex items-center gap-2">
              <FaGlobe className="text-primary-blue" /> Most Visited Pages
            </h3>
            
            {topPages.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-400">No landing records recorded.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {topPages.map((page, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-white/5">
                    <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">{page.page}</span>
                    <span className="text-xs font-black text-primary-blue font-title">{page.views} Hits</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Device Breakdown */}
          <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm flex flex-col gap-5">
            <h3 className="text-lg font-bold font-title text-black dark:text-white flex items-center gap-2">
              <FaChartLine className="text-primary-purple" /> Viewport Breakdown
            </h3>

            <div className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center font-bold text-slate-550 dark:text-slate-455 uppercase">
                  <span className="flex items-center gap-2"><FaDesktop /> Desktop</span>
                  <span>{((deviceBreakdown.desktop / totalDeviceHits) * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                  <div style={{ width: `${(deviceBreakdown.desktop / totalDeviceHits) * 100}%` }} className="h-full bg-primary-blue" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center font-bold text-slate-550 dark:text-slate-455 uppercase">
                  <span className="flex items-center gap-2"><FaMobileAlt /> Mobile</span>
                  <span>{((deviceBreakdown.mobile / totalDeviceHits) * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                  <div style={{ width: `${(deviceBreakdown.mobile / totalDeviceHits) * 100}%` }} className="h-full bg-primary-purple" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center font-bold text-slate-550 dark:text-slate-455 uppercase">
                  <span className="flex items-center gap-2"><FaTabletAlt /> Tablet</span>
                  <span>{((deviceBreakdown.tablet / totalDeviceHits) * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                  <div style={{ width: `${(deviceBreakdown.tablet / totalDeviceHits) * 100}%` }} className="h-full bg-primary-cyan" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Key Metrics row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Shares</span>
                <h3 className="text-2xl font-black text-black dark:text-white mt-1">{totalShares}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-primary-purple flex items-center justify-center"><FaShareAlt size={18} /></div>
            </div>
            {platformBreakdown.slice(0, 3).map((plat, idx) => (
              <div key={idx} className="glass p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{plat.platform} Shares</span>
                  <h3 className="text-2xl font-black text-black dark:text-white mt-1">{plat.count}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-lg">{getPlatformIcon(plat.platform)}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Share platform breakdown */}
            <div className="lg:col-span-4 glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm flex flex-col gap-5">
              <h3 className="text-lg font-bold font-title text-black dark:text-white flex items-center gap-2">
                <FaChartLine className="text-primary-purple" /> Share Channels
              </h3>
              {platformBreakdown.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-400">No share records logged.</div>
              ) : (
                <div className="flex flex-col gap-3.5 text-xs">
                  {platformBreakdown.map((plat, idx) => {
                    const pct = totalShares > 0 ? ((plat.count / totalShares) * 100).toFixed(1) : 0;
                    return (
                      <div key={idx} className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center font-bold text-slate-550 dark:text-slate-455 uppercase">
                          <span className="flex items-center gap-2">{getPlatformIcon(plat.platform)} {plat.platform}</span>
                          <span>{plat.count} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                          <div style={{ width: `${pct}%` }} className="h-full bg-primary-purple" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Daily timeline grid */}
            <div className="lg:col-span-8 glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm flex flex-col gap-5">
              <h3 className="text-lg font-bold font-title text-black dark:text-white flex items-center gap-2">
                <FaGlobe className="text-primary-blue" /> Daily Share Trends (Last 30 Days)
              </h3>
              {dailyGraph.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-400">No active timeline data.</div>
              ) : (
                <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1">
                  {dailyGraph.slice().reverse().map((d, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-white/5">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{d.date}</span>
                      <span className="text-xs font-black text-primary-blue">{d.count} Shares</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top content lists */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Top Shared Users */}
            <div className="glass p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm flex flex-col gap-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <FaUser className="text-purple-400" /> Top Shared Users
              </h4>
              {topSharedUsers.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-450 italic">No users shared.</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {topSharedUsers.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-white/5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center text-xs overflow-hidden shrink-0 border border-white/5">
                          {item.avatar ? <img src={item.avatar} alt="" className="w-full h-full object-cover" /> : <FaUser className="text-slate-400" size={10} />}
                        </div>
                        <div className="text-left min-w-0">
                          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block truncate">{item.fullName}</span>
                          <span className="text-[9px] font-bold text-slate-500 block truncate">@{item.username}</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-primary-purple shrink-0 ml-2">{item.count} Shares</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Shared Posts */}
            <div className="glass p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm flex flex-col gap-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <FaComments className="text-blue-400" /> Top Shared Posts
              </h4>
              {topSharedPosts.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-450 italic">No posts shared.</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {topSharedPosts.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-white/5">
                      <div className="text-left min-w-0">
                        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block truncate">{item.title}</span>
                        <span className="text-[9px] font-bold text-slate-500 block truncate">By {item.author}</span>
                      </div>
                      <span className="text-xs font-black text-primary-blue shrink-0 ml-2">{item.count} Shares</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Shared Doubts */}
            <div className="glass p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm flex flex-col gap-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <FaQuestionCircle className="text-cyan-400" /> Top Shared Doubts
              </h4>
              {topSharedDoubts.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-450 italic">No doubts shared.</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {topSharedDoubts.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-white/5">
                      <div className="text-left min-w-0">
                        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block truncate">{item.title}</span>
                        <span className="text-[9px] font-bold text-slate-500 block truncate">By {item.author}</span>
                      </div>
                      <span className="text-xs font-black text-primary-cyan shrink-0 ml-2">{item.count} Shares</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsManager;
