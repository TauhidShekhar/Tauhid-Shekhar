const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/portfolio_db';
  
  const options = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  const connectWithRetry = async () => {
    try {
      const conn = await mongoose.connect(mongoUri, options);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error(`Database Connection Error: ${error.message}`);
      console.log('Retrying MongoDB connection in 5 seconds...');
      setTimeout(connectWithRetry, 5000);
    }
  };

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB connection lost! Attempting to reconnect...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB successfully reconnected!');
  });

  await connectWithRetry();
};

module.exports = connectDB;
