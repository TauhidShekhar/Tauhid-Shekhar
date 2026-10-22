const mongoose = require('mongoose');

// Connection lifecycle state tracking
const DB_STATES = {
  CONNECTED: 'Connected',
  CONNECTING: 'Connecting',
  RECONNECTING: 'Reconnecting',
  DISCONNECTED: 'Temporarily Unavailable',
  CONFIG_ERROR: 'Configuration Error'
};

let currentStatus = DB_STATES.DISCONNECTED;
let reconnectAttempts = 0;
let reconnectTimer = null;
let lastConnectedAt = null;
let lastDisconnectedAt = null;
let cachedConnectionPromise = null;
let isShuttingDown = false;

const getMongoUri = () => {
  return process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/portfolio_db';
};

const getMongoOptions = () => ({
  maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE, 10) || 20,
  minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE, 10) || 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  heartbeatFrequencyMS: 10000,
  autoIndex: process.env.NODE_ENV !== 'production',
});

/**
 * Calculates exponential backoff delay with random jitter to prevent thundering herd.
 */
const getBackoffDelay = (attempt) => {
  const baseDelay = 1000;
  const maxDelay = 30000;
  const exponential = Math.min(maxDelay, baseDelay * Math.pow(1.5, Math.min(attempt, 10)));
  const jitter = Math.floor(Math.random() * 1000);
  return exponential + jitter;
};

/**
 * Initiates or retrieves an existing connection to MongoDB.
 */
const connectDB = async () => {
  if (isShuttingDown) {
    throw new Error('Database connection rejected: Server is shutting down.');
  }

  // If already connected, return active connection immediately
  if (mongoose.connection.readyState === 1) {
    currentStatus = DB_STATES.CONNECTED;
    return mongoose.connection;
  }

  // If a connection attempt is currently in progress, return the pending promise
  if (cachedConnectionPromise && mongoose.connection.readyState === 2) {
    return cachedConnectionPromise;
  }

  const mongoUri = getMongoUri();
  if (!mongoUri || typeof mongoUri !== 'string' || !mongoUri.startsWith('mongodb')) {
    currentStatus = DB_STATES.CONFIG_ERROR;
    const configError = new Error('Invalid MONGO_URI configuration in environment.');
    console.error(`[DB Config Error]: ${configError.message}`);
    throw configError;
  }

  currentStatus = reconnectAttempts > 0 ? DB_STATES.RECONNECTING : DB_STATES.CONNECTING;

  cachedConnectionPromise = mongoose.connect(mongoUri, getMongoOptions())
    .then((conn) => {
      currentStatus = DB_STATES.CONNECTED;
      reconnectAttempts = 0;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      lastConnectedAt = new Date();
      console.log(`[Database] MongoDB Connected Successfully: ${conn.connection.host}/${conn.connection.name}`);
      return conn.connection;
    })
    .catch((error) => {
      cachedConnectionPromise = null;
      lastDisconnectedAt = new Date();
      console.error(`[Database Connection Error] (Attempt ${reconnectAttempts + 1}): ${error.message}`);
      
      scheduleReconnect();
      throw error;
    });

  return cachedConnectionPromise;
};

/**
 * Schedules an automatic background reconnection attempt with bounded backoff.
 */
const scheduleReconnect = () => {
  if (isShuttingDown || reconnectTimer) return;

  reconnectAttempts += 1;
  currentStatus = DB_STATES.RECONNECTING;
  const delay = getBackoffDelay(reconnectAttempts);

  console.log(`[Database] Scheduling reconnection attempt #${reconnectAttempts} in ${(delay / 1000).toFixed(1)}s...`);

  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    try {
      await connectDB();
      console.log(`[Database] Successfully recovered MongoDB connection on attempt #${reconnectAttempts}!`);
    } catch (err) {
      console.warn(`[Database] Reconnection attempt #${reconnectAttempts} failed: ${err.message}`);
      // Will automatically reschedule via connectDB's catch block
    }
  }, delay);
};

/**
 * Perform active ping to verify socket latency and operational readiness.
 */
const pingDb = async (timeoutMs = 3000) => {
  if (mongoose.connection.readyState !== 1) {
    return {
      healthy: false,
      status: currentStatus,
      latencyMs: null,
      error: 'Connection is not in connected state (readyState !== 1)'
    };
  }

  const startTime = Date.now();
  try {
    const pingPromise = mongoose.connection.db.admin().ping();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`Ping timed out after ${timeoutMs}ms`)), timeoutMs)
    );

    await Promise.race([pingPromise, timeoutPromise]);
    const latencyMs = Date.now() - startTime;

    return {
      healthy: true,
      status: DB_STATES.CONNECTED,
      latencyMs,
      error: null
    };
  } catch (error) {
    return {
      healthy: false,
      status: DB_STATES.DISCONNECTED,
      latencyMs: Date.now() - startTime,
      error: error.message
    };
  }
};

/**
 * Returns current database telemetry and status diagnostics.
 */
const getDbStatus = () => {
  const readyState = mongoose.connection.readyState;
  let status = currentStatus;

  if (readyState === 1) {
    status = DB_STATES.CONNECTED;
  } else if (readyState === 2) {
    status = reconnectAttempts > 0 ? DB_STATES.RECONNECTING : DB_STATES.CONNECTING;
  } else if (readyState === 0 || readyState === 3) {
    status = reconnectAttempts > 0 ? DB_STATES.RECONNECTING : DB_STATES.DISCONNECTED;
  }

  return {
    status,
    isConnected: readyState === 1,
    readyState,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
    reconnectAttempts,
    lastConnectedAt,
    lastDisconnectedAt,
    poolSize: mongoose.connection?.client?.topology?.s?.options?.maxPoolSize || 20
  };
};

// Global Mongoose event listeners (registered once)
if (!global._mongoListenersRegistered) {
  mongoose.connection.on('disconnected', () => {
    cachedConnectionPromise = null;
    lastDisconnectedAt = new Date();
    console.warn('[Database] Connection lost or disconnected.');
    scheduleReconnect();
  });

  mongoose.connection.on('reconnected', () => {
    currentStatus = DB_STATES.CONNECTED;
    reconnectAttempts = 0;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    lastConnectedAt = new Date();
    console.log('[Database] MongoDB successfully reconnected.');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`[Database Runtime Error]: ${err.message}`);
    if (mongoose.connection.readyState !== 1) {
      scheduleReconnect();
    }
  });

  // Graceful shutdown handling
  const handleGracefulShutdown = async (signal) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log(`[Database] Received ${signal}. Closing MongoDB connection pool gracefully...`);
    
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    try {
      await mongoose.connection.close(false);
      console.log('[Database] MongoDB connection closed cleanly.');
    } catch (err) {
      console.error('[Database] Error during graceful close:', err.message);
    }
  };

  process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));

  global._mongoListenersRegistered = true;
}

module.exports = connectDB;
module.exports.connectDB = connectDB;
module.exports.getDbStatus = getDbStatus;
module.exports.pingDb = pingDb;
module.exports.scheduleReconnect = scheduleReconnect;
module.exports.DB_STATES = DB_STATES;
