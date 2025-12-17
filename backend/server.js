require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const connectDB = require('./config/database');
const reminderService = require('./services/reminderService');
const googleService = require('./services/googleService');
const { initializeBot, startBot } = require('./bot');
const logger = require('./utils/logger');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { ip: req.ip });
  next();
});

app.use('/api/events', require('./routes/events'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/webhooks', require('./routes/webhooks'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/demo', require('./routes/demo'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/user', require('./routes/user'));

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
    await connectDB();
    logger.info('✅ Database connected');

    reminderService.start();
    logger.info('✅ Reminder service started');

    await initializeBot();

    try {
      const hasValidToken = process.env.SLACK_BOT_TOKEN &&
                           process.env.SLACK_BOT_TOKEN !== 'xoxb-your-bot-token-here' &&
                           process.env.SLACK_BOT_TOKEN.startsWith('xoxb-');

      if (hasValidToken && process.env.SLACK_APP_TOKEN) {
        await startBot();
        logger.info('✅ Slack bot started in Socket Mode');
      } else {
        logger.info('⚠️  Slack bot skipped (not configured)');
      }
    } catch (error) {
      logger.warn('⚠️  Slack bot initialization error:', error.message);
      logger.info('Continuing without Slack bot (demo mode)');
    }

    const pollIntervalSeconds = parseInt(process.env.POLL_INTERVAL_SECONDS) || 30;
    const cronExpression = pollIntervalSeconds === 30 ? '*/30 * * * * *' : `*/${pollIntervalSeconds} * * * * *`;

    logger.info(`🔄 Setting up calendar polling: every ${pollIntervalSeconds} seconds`);

    cron.schedule(cronExpression, async () => {
      try {
        await googleService.pollNewEvents();
      } catch (error) {
        logger.error('Error in polling cron job:', error);
      }
    });

    logger.info('✅ Calendar polling cron job initialized');

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🌐 API available at http://localhost:${PORT}`);
      logger.info(`📋 Dashboard Stats: GET /api/dashboard/stats`);
      logger.info(`🏆 Leaderboard: GET /api/leaderboard`);
      logger.info(`👤 User Stats: GET /api/user/:email`);
      logger.info(`🔧 Admin Sync: POST /api/admin/sync`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
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