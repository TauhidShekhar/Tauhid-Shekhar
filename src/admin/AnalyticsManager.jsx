import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FaChartLine, FaDesktop, FaMobileAlt, FaTabletAlt, FaGlobe } from 'react-icons/fa';

const AnalyticsManager = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await api.getAnalyticsStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-primary-blue animate-spin" />
      </div>
    );
  }

  const { topPages = [], deviceBreakdown = { desktop: 0, mobile: 0, tablet: 0 } } = stats || {};
  const totalDeviceHits = Math.max(deviceBreakdown.desktop + deviceBreakdown.mobile + deviceBreakdown.tablet, 1);

  return (
    <div className="flex flex-col gap-8 text-left animate-fade-in">
      <div>
        <h2 className="text-2xl md:text-3xl font-black font-title text-black dark:text-white">Analytics Panel</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Aggregated statistics reports tracking visitor viewport and top landed pages.</p>
      </div>

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
            {/* Desktop */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center font-bold text-slate-550 dark:text-slate-455 uppercase">
                <span className="flex items-center gap-2"><FaDesktop /> Desktop</span>
                <span>{((deviceBreakdown.desktop / totalDeviceHits) * 100).toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                <div style={{ width: `${(deviceBreakdown.desktop / totalDeviceHits) * 100}%` }} className="h-full bg-primary-blue" />
              </div>
            </div>

            {/* Mobile */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center font-bold text-slate-550 dark:text-slate-455 uppercase">
                <span className="flex items-center gap-2"><FaMobileAlt /> Mobile</span>
                <span>{((deviceBreakdown.mobile / totalDeviceHits) * 100).toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                <div style={{ width: `${(deviceBreakdown.mobile / totalDeviceHits) * 100}%` }} className="h-full bg-primary-purple" />
              </div>
            </div>

            {/* Tablet */}
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
    </div>
  );
};

export default AnalyticsManager;
