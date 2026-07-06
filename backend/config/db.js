const mongoose = require('mongoose');

/**
 * Establishes a connection to the MongoDB cluster.
 * Returns a Promise that resolves when the database connection is successfully established.
 */
const connectDB = () => {
  return new Promise((resolve, reject) => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/portfolio_db';
    
    // Prevent duplicate connections
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB is already connected.');
      return resolve(mongoose.connection);
    }

    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    const connectWithRetry = async () => {
      try {
        const conn = await mongoose.connect(mongoUri, options);
        console.log(`MongoDB Connected Successfully: ${conn.connection.host}`);
        resolve(conn);
      } catch (error) {
        console.error(`Database Connection Error: ${error.message}`);
        if (process.env.VERCEL) {
          // On Vercel, fail fast to prevent serverless function execution timeouts
          reject(error);
        } else {
          console.log('Retrying MongoDB connection in 5 seconds...');
          setTimeout(connectWithRetry, 5000);
        }
      }
    };

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB connection lost! Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB successfully reconnected!');
    });

    connectWithRetry();
  });
};

module.exports = connectDB;
