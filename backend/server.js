require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const reminderService = require('./services/reminderService');
const logger = require('./utils/logger');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { ip: req.ip });
  next();
});

// Routes
app.use('/api/events', require('./routes/events'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/webhooks', require('./routes/webhooks'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/demo', require('./routes/demo'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;

async function start() {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info('Database connected');

    // Start reminder service
    reminderService.start();
    logger.info('Reminder service started');

    // Start Slack bot (optional - skip if not configured)
    try {
      const hasValidToken = process.env.SLACK_BOT_TOKEN && 
                           process.env.SLACK_BOT_TOKEN !== 'xoxb-your-bot-token-here' &&
                           process.env.SLACK_BOT_TOKEN.startsWith('xoxb-');
      
      if (hasValidToken && process.env.SLACK_APP_TOKEN) {
        // Start Slack bot in a separate process to avoid blocking
        setTimeout(() => {
          try {
            require('../slack-bot/app');
            logger.info('Slack bot started');
          } catch (slackError) {
            logger.warn('Slack bot failed to start:', slackError.message);
            logger.info('Continuing without Slack bot (demo mode)');
          }
        }, 1000);
      } else {
        logger.info('Slack bot skipped (not configured)');
      }
    } catch (error) {
      logger.warn('Slack bot initialization error:', error.message);
      logger.info('Continuing without Slack bot (demo mode)');
    }

    // Start Express server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});