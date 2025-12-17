const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    // Remove deprecated options - they're not needed in newer Mongoose versions
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/calendar-enforcer');
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    // Don't exit in demo mode - allow app to run without MongoDB
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      logger.warn('Continuing without MongoDB connection (demo mode)');
    }
  }
};

module.exports = connectDB;