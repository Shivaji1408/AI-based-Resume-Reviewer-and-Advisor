const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'ai-resume-advisor',
      serverSelectionTimeoutMS: 5000,  // Fail fast if Atlas URI is wrong
      socketTimeoutMS: 45000,
    });

    const isAtlas = conn.connection.host.includes('mongodb.net');
    console.log(
      `✅ MongoDB Connected: ${conn.connection.host} ${isAtlas ? '(Atlas ☁️)' : '(Local 🏠)'}`
    );
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 Tip: Is your local MongoDB running? Try: mongod');
    } else if (error.message.includes('bad auth') || error.message.includes('Authentication')) {
      console.error('💡 Tip: Check your Atlas username/password in MONGO_URI');
    } else if (error.message.includes('ETIMEOUT') || error.message.includes('timed out')) {
      console.error('💡 Tip: Check Atlas Network Access — add your IP at cloud.mongodb.com');
    }
    process.exit(1);
  }
};

module.exports = connectDB;

