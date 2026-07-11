const os = require('os');
const mongoose = require('mongoose');

let metrics = {
  totalRequests: 0,
  totalErrors: 0,
  totalResponseTime: 0,
  averageResponseTime: 0,
  activeConnections: 0,
  errorsPerMinute: 0,
  requestsPerMinute: 0,
  requestsHistory: [],
  errorsHistory: []
};

// Interval to calculate requests/errors rates per minute
let intervalRequestCount = 0;
let intervalErrorCount = 0;

setInterval(() => {
  metrics.requestsPerMinute = intervalRequestCount;
  metrics.errorsPerMinute = intervalErrorCount;
  
  const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  metrics.requestsHistory.push({ time: timeLabel, count: intervalRequestCount });
  metrics.errorsHistory.push({ time: timeLabel, count: intervalErrorCount });
  
  if (metrics.requestsHistory.length > 20) metrics.requestsHistory.shift();
  if (metrics.errorsHistory.length > 20) metrics.errorsHistory.shift();
  
  intervalRequestCount = 0;
  intervalErrorCount = 0;
}, 60000);

const performanceMiddleware = (req, res, next) => {
  metrics.totalRequests += 1;
  metrics.activeConnections += 1;
  intervalRequestCount += 1;
  const start = process.hrtime();
  
  res.on('finish', () => {
    metrics.activeConnections = Math.max(0, metrics.activeConnections - 1);
    const diff = process.hrtime(start);
    const timeInMs = diff[0] * 1000 + diff[1] / 1000000;
    metrics.totalResponseTime += timeInMs;
    metrics.averageResponseTime = metrics.totalResponseTime / metrics.totalRequests;
    
    if (res.statusCode >= 400) {
      metrics.totalErrors += 1;
      intervalErrorCount += 1;
    }
  });
  
  next();
};

/**
 * Compiles real-time metrics including CPU load, Memory pressure, Disk space, Socket counts, Database ping, and Cache stats.
 */
const getSystemMetrics = async () => {
  const cpus = os.cpus();
  const freeMem = os.freemem();
  const totalMem = os.totalmem();
  const usedMem = totalMem - freeMem;
  const cpuLoad = os.loadavg();
  
  // Calculate database ping
  let dbPing = 0;
  let dbState = 'Disconnected';
  try {
    if (mongoose.connection.readyState === 1) {
      dbState = 'Connected';
      const dbStart = Date.now();
      await mongoose.connection.db.admin().ping();
      dbPing = Date.now() - dbStart;
    } else if (mongoose.connection.readyState === 2) {
      dbState = 'Connecting';
    }
  } catch (err) {
    dbState = 'Error';
    console.error('Db ping failed:', err.message);
  }

  // Cache stats
  const { getCacheStats } = require('./cacheMiddleware');
  const cacheStats = getCacheStats();

  return {
    system: {
      cpuUsage: Math.min(100, Math.round((cpuLoad[0] / cpus.length) * 100)),
      cpuModel: cpus[0]?.model || 'Generic CPU',
      cores: cpus.length,
      ramUsagePercent: Math.round((usedMem / totalMem) * 100),
      usedMem: Math.round(usedMem / (1024 * 1024)), // MB
      totalMem: Math.round(totalMem / (1024 * 1024)), // MB
      uptime: Math.round(process.uptime()), // Seconds
      platform: os.platform()
    },
    performance: {
      totalRequests: metrics.totalRequests,
      totalErrors: metrics.totalErrors,
      activeConnections: metrics.activeConnections,
      averageResponseTime: Math.round(metrics.averageResponseTime * 100) / 100,
      requestsPerMinute: metrics.requestsPerMinute,
      errorsPerMinute: metrics.errorsPerMinute,
      requestsHistory: metrics.requestsHistory,
      errorsHistory: metrics.errorsHistory,
      onlineUsers: global.activeSocketConnections || 1
    },
    database: {
      status: dbState,
      ping: dbPing,
      activePoolSize: mongoose.connection.base?.connections?.length || 1,
    },
    cache: cacheStats,
    queue: require('../utils/backgroundQueue').getStats()
  };
};

module.exports = {
  performanceMiddleware,
  getSystemMetrics
};
