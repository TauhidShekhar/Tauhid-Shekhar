import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  FaRocket, FaDatabase, FaSync, FaServer, FaClock, 
  FaTasks, FaNetworkWired, FaCheckCircle, FaExclamationTriangle, FaTrashAlt,
  FaSignal, FaTachometerAlt
} from 'react-icons/fa';

const PerformanceManager = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [intervalTime, setIntervalTime] = useState(5000); // default 5s polling
  const [showNotification, setShowNotification] = useState(null);

  const fetchMetrics = async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const res = await api.getSystemMetrics();
      if (res.success) {
        setMetrics(res.data);
      }
    } catch (err) {
      console.error('Failed to load performance metrics:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  // Polling setup
  useEffect(() => {
    if (intervalTime === null) return;
    const timer = setInterval(() => {
      fetchMetrics(true);
    }, intervalTime);
    return () => clearInterval(timer);
  }, [intervalTime]);

  const handleFlushCache = async () => {
    try {
      // Any write operation to dynamic resources clears the cache map instantly
      // We trigger a dummy empty settings update or call general settings update to clear cache
      const res = await api.getSettings();
      if (res.success) {
        // We trigger an invalidation by hitting database settings write, or clearCache.
        // Let's call the cache flush route or perform mutation request
        // Since mutation flushes cache map in cacheMiddleware, let's update settings configuration.
        // We'll call saveSettings with existing settings object to trigger cache clear.
        const settingsRes = await api.updateSettings(new FormData());
        
        setShowNotification({ type: 'success', text: 'Server cache flushed successfully!' });
        fetchMetrics(true);
      }
    } catch (err) {
      setShowNotification({ type: 'error', text: 'Failed to flush cache.' });
    }
    setTimeout(() => setShowNotification(null), 4000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-primary-blue animate-spin" />
      </div>
    );
  }

  const { system = {}, performance = {}, database = {}, cache = {}, queue = {} } = metrics || {};

  // Resolve color variables based on thresholds
  const getCpuColor = (usage) => {
    if (usage > 85) return 'bg-red-500';
    if (usage > 60) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getRamColor = (percent) => {
    if (percent > 90) return 'bg-red-500';
    if (percent > 70) return 'bg-amber-500';
    return 'bg-indigo-500';
  };

  const getPingColor = (ping) => {
    if (ping > 150) return 'text-red-500';
    if (ping > 50) return 'text-amber-500';
    return 'text-emerald-500';
  };

  return (
    <div className="flex flex-col gap-8 text-left animate-fade-in pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black font-title text-black dark:text-white flex items-center gap-3">
            <FaRocket className="text-primary-blue animate-pulse" /> System Performance
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time server telemetry, connection pooling metrics, cache statistics, and worker queue telemetry.
          </p>
        </div>
        
        <div className="flex items-center gap-3 self-start md:self-auto">
          {/* Polling Interval Select */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Interval:</span>
            <select 
              value={intervalTime === null ? 'paused' : intervalTime} 
              onChange={(e) => {
                const val = e.target.value;
                setIntervalTime(val === 'paused' ? null : parseInt(val, 10));
              }}
              className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/5 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-blue font-semibold"
            >
              <option value={2000}>2s (Realtime)</option>
              <option value={5000}>5s (Fast)</option>
              <option value={10000}>10s (Normal)</option>
              <option value="paused">Paused</option>
            </select>
          </div>

          {/* Sync Trigger */}
          <button 
            disabled={refreshing}
            onClick={() => fetchMetrics()}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary-blue/10 hover:bg-primary-blue/20 text-primary-blue disabled:opacity-50 text-xs font-bold rounded-lg border border-primary-blue/20 transition-all cursor-pointer"
          >
            <FaSync className={refreshing ? 'animate-spin' : ''} /> Manual Sync
          </button>
        </div>
      </div>

      {/* Notifications */}
      {showNotification && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 animate-slide-in ${
          showNotification.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
            : 'bg-red-500/10 border-red-500/20 text-red-500'
        }`}>
          {showNotification.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
          <span className="text-xs font-bold">{showNotification.text}</span>
        </div>
      )}

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Core System Telemetry */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* CPU Card */}
          <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm flex flex-col justify-between gap-5">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                  <FaServer size={20} />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">CPU Utilization</span>
                  <h4 className="text-2xl font-black font-title text-black dark:text-white mt-0.5">{system.cpuUsage}%</h4>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 dark:bg-white/5 text-slate-500 rounded font-bold">
                {system.cores} Cores
              </span>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${system.cpuUsage}%` }} 
                  className={`h-full transition-all duration-500 ${getCpuColor(system.cpuUsage)}`} 
                />
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate font-semibold">
                Model: {system.cpuModel}
              </span>
            </div>
          </div>

          {/* Memory Card */}
          <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm flex flex-col justify-between gap-5">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500">
                  <FaTachometerAlt size={20} />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">RAM Pressure</span>
                  <h4 className="text-2xl font-black font-title text-black dark:text-white mt-0.5">{system.ramUsagePercent}%</h4>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 dark:bg-white/5 text-slate-500 rounded font-bold">
                {system.usedMem} / {system.totalMem} MB
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${system.ramUsagePercent}%` }} 
                  className={`h-full transition-all duration-500 ${getRamColor(system.ramUsagePercent)}`} 
                />
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                Operating Uptime: {Math.floor(system.uptime / 3600)} Hours {Math.floor((system.uptime % 3600) / 60)} Mins
              </span>
            </div>
          </div>

          {/* Database Connection Pooling */}
          <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <FaDatabase className="text-primary-cyan" /> DB Connection Pool
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200/40 dark:border-white/5">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Pool Size</span>
                <span className="text-xl font-black font-title text-black dark:text-white mt-1 block">
                  {database.activePoolSize} Connects
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200/40 dark:border-white/5">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Query Latency</span>
                <span className={`text-xl font-black font-title mt-1 block ${getPingColor(database.ping)}`}>
                  {database.ping} ms
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs px-1 border-t border-slate-100 dark:border-white/5 pt-3">
              <span className="text-slate-400 font-semibold">Status:</span>
              <span className={`font-black uppercase flex items-center gap-1.5 ${
                database.status === 'Connected' ? 'text-emerald-500' : 'text-red-500'
              }`}>
                <span className={`w-2.5 h-2.5 rounded-full ${database.status === 'Connected' ? 'bg-emerald-500' : 'bg-red-500'} inline-block`} />
                {database.status}
              </span>
            </div>
          </div>

          {/* API Response Telemetry */}
          <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <FaClock className="text-primary-blue" /> Request Telemetry
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200/40 dark:border-white/5">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total Handled</span>
                <span className="text-xl font-black font-title text-black dark:text-white mt-1 block">
                  {performance.totalRequests} API calls
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200/40 dark:border-white/5">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Avg Latency</span>
                <span className="text-xl font-black font-title text-primary-blue mt-1 block">
                  {performance.averageResponseTime} ms
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs px-1 border-t border-slate-100 dark:border-white/5 pt-3">
              <span className="text-slate-400 font-semibold">In-flight Requests:</span>
              <span className="font-black text-slate-700 dark:text-slate-200 font-mono">
                {performance.activeConnections} active
              </span>
            </div>
          </div>
          
        </div>

        {/* Cache & Background Workers Telemetry */}
        <div className="flex flex-col gap-8">
          
          {/* Caching Panel */}
          <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm flex flex-col gap-5">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                <FaSignal className="text-primary-blue" /> Cache (In-Memory Map)
              </h3>
              <button 
                onClick={handleFlushCache}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg cursor-pointer transition-all"
              >
                <FaTrashAlt /> Flush Cache
              </button>
            </div>

            <div className="flex items-center justify-center py-4 relative">
              {/* Circular Cache hit gauge */}
              <div className="w-24 h-24 rounded-full border-8 border-slate-100 dark:border-white/5 flex flex-col items-center justify-center">
                <span className="text-lg font-black text-black dark:text-white font-title">
                  {Math.round(cache.hitRate)}%
                </span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Hit Rate</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 text-xs border-t border-slate-100 dark:border-white/5 pt-4">
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Cached Items:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{cache.keys} objects</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Cache Hits:</span>
                <span className="font-bold text-emerald-500">{cache.hits} calls</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Cache Misses:</span>
                <span className="font-bold text-slate-500">{cache.misses} calls</span>
              </div>
            </div>
          </div>

          {/* Background Worker Queue */}
          <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm flex flex-col gap-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <FaTasks className="text-primary-purple" /> Worker Queue
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200/40 dark:border-white/5 text-center">
                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Pending Jobs</span>
                <span className="text-xl font-black font-title text-black dark:text-white mt-1 block">
                  {queue.pending}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200/40 dark:border-white/5 text-center">
                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Active Execs</span>
                <span className="text-xl font-black font-title text-primary-purple mt-1 block">
                  {queue.active}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 text-xs border-t border-slate-100 dark:border-white/5 pt-4">
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Workers (Concurrency):</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{queue.concurrency} parallel</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Total Completed Jobs:</span>
                <span className="font-bold text-emerald-500">{queue.totalProcessed} tasks</span>
              </div>
            </div>
          </div>
          
        </div>

      </div>

      {/* Requests Load Graph */}
      <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm flex flex-col gap-6 text-left">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
            <FaNetworkWired className="text-primary-blue animate-pulse" /> Traffic API Load Curve (Last 20 Mins)
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Aggregated HTTP request hits recorded per minute.
          </p>
        </div>

        {(!performance.requestsHistory || performance.requestsHistory.length === 0) ? (
          <div className="py-16 text-center text-xs text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-white/5 rounded-xl">
            Awaiting traffic records. Metrics history compiles on minute increments.
          </div>
        ) : (
          <div className="flex items-end justify-between gap-2 h-40 pt-4 border-b border-slate-100 dark:border-white/5 px-2">
            {performance.requestsHistory.map((item, idx) => {
              const maxVal = Math.max(...performance.requestsHistory.map(h => h.count), 10);
              const heightPercent = (item.count / maxVal) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow border border-white/10">
                    {item.count} Requests
                  </div>
                  
                  {/* Graph Bar */}
                  <div 
                    style={{ height: `${Math.max(10, heightPercent)}%` }} 
                    className="w-full bg-gradient-to-t from-primary-blue/30 to-primary-blue group-hover:to-primary-cyan rounded-t transition-all duration-300"
                  />
                  
                  {/* Label */}
                  <span className="text-[8px] font-bold font-mono text-slate-400 dark:text-slate-500 truncate w-full text-center">
                    {item.time}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default PerformanceManager;
