const mongoose = require('mongoose');

let cachedConnection = null;

/**
 * Establishes and manages a singleton connection to the MongoDB cluster.
 * Reuses existing connection across requests to prevent connection leaks.
 */
const connectDB = async () => {
  // If already connected, reuse existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If already connecting, await the pending connection
  if (cachedConnection && mongoose.connection.readyState === 2) {
    return cachedConnection;
  }

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/portfolio_db';

  const options = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxPoolSize: 50,
    minPoolSize: 5,
    connectTimeoutMS: 10000,
    heartbeatFrequencyMS: 30000,
  };

  cachedConnection = mongoose.connect(mongoUri, options)
    .then((conn) => {
      console.log(`MongoDB Connected Successfully: ${conn.connection.host}`);
      return conn.connection;
    })
    .catch((error) => {
      cachedConnection = null;
      console.error(`Database Connection Error: ${error.message}`);
      throw error;
    });

  return cachedConnection;
};

// Global event handlers (registered once)
if (!global._mongoListenersRegistered) {
  mongoose.connection.on('disconnected', () => {
    cachedConnection = null;
    console.warn('MongoDB connection disconnected.');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB successfully reconnected!');
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB runtime error:', err.message);
  });

  global._mongoListenersRegistered = true;
}

module.exports = connectDB;
