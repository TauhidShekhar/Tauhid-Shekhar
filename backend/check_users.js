const mongoose = require('mongoose');
const User = require('./models/User');

const run = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/portfolio_db';
    console.log('Connecting to:', uri);
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    
    const users = await User.find({});
    console.log(`Found ${users.length} users in database:`);
    users.forEach(u => {
      console.log(`ID: ${u._id} | Username: ${u.username} | FullName: ${u.fullName} | Role: ${u.role}`);
    });
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
};

run();
