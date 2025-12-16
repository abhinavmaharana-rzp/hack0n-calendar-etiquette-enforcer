const express = require('express');
const router = express.Router();
const slackService = require('../services/slackService');
const calendarService = require('../services/calendarService');
const badgeService = require('../services/badgeService');
const reminderService = require('../services/reminderService');
const Meeting = require('../models/Meeting');
const UserStats = require('../models/UserStats');
const EmailSlackMap = require('../models/EmailSlackMap');
const logger = require('../utils/logger');
const { formatDate, calculatePercentage } = require('../utils/helpers');

/**
 * Sync Slack users with database
 * Creates email-to-Slack-ID mapping
 */
router.post('/sync-slack-users', async (req, res) => {
  try {
    logger.info('Starting Slack user sync...');
    
    const totalSynced = await slackService.syncAllUsers();
    
    res.json({
      success: true,
      message: `Successfully synced ${totalSynced} Slack users`,
      totalSynced
    });
  } catch (error) {
    logger.error('Error syncing Slack users:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Manually trigger reminder batch
 */
router.post('/trigger-reminders', async (req, res) => {
  try {
    logger.info('Manually triggering reminder batch...');
    
    await reminderService.sendReminderBatch();
    
    res.json({
      success: true,
      message: 'Reminder batch triggered successfully'
    });
  } catch (error) {
    logger.error('Error triggering reminders:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Evaluate badges for all users
 */
router.post('/evaluate-badges', async (req, res) => {
  try {
    logger.info('Evaluating badges for all users...');
    
    const updatedCount = await badgeService.evaluateAllUsers();
    
    res.json({
      success: true,
      message: `Evaluated badges for ${updatedCount} users`,
      updatedCount
    });
  } catch (error) {
    logger.error('Error evaluating badges:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get system statistics
 */
router.get('/system-stats', async (req, res) => {
  try {
    const [
      totalMeetings,
      totalUsers,
      totalMappings,
      activeMeetings,
      completedMeetings,
      cancelledMeetings
    ] = await Promise.all([
      Meeting.countDocuments(),
      UserStats.countDocuments(),
      EmailSlackMap.countDocuments(),
      Meeting.countDocuments({ status: 'scheduled' }),
      Meeting.countDocuments({ status: 'completed' }),
      Meeting.countDocuments({ status: 'auto-cancelled' })
    ]);

    const stats = {
      meetings: {
        total: totalMeetings,
        active: activeMeetings,
        completed: completedMeetings,
        cancelled: cancelledMeetings
      },
      users: {
        total: totalUsers,
        slackMappings: totalMappings
      },
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version
      }
    };

    res.json({ success: true, stats });
  } catch (error) {
    logger.error('Error fetching system stats:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get recent logs
 */
router.get('/logs', async (req, res) => {
  try {
    const { level = 'info', limit = 100 } = req.query;
    const fs = require('fs');
    const path = require('path');

    const logFile = path.join(__dirname, `../../logs/${level}.log`);
    
    if (!fs.existsSync(logFile)) {
      return res.json({ success: true, logs: [] });
    }

    const content = fs.readFileSync(logFile, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    const logs = lines
      .slice(-limit)
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return { message: line };
        }
      });

    res.json({ success: true, logs });
  } catch (error) {
    logger.error('Error fetching logs:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Clear old logs
 */
router.post('/clear-logs', async (req, res) => {
  try {
    const { daysOld = 30 } = req.body;
    const fs = require('fs');
    const path = require('path');

    const logsDir = path.join(__dirname, '../../logs');
    const files = fs.readdirSync(logsDir);

    let cleared = 0;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    for (const file of files) {
      const filePath = path.join(logsDir, file);
      const stats = fs.statSync(filePath);

      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(filePath);
        cleared++;
      }
    }

    res.json({
      success: true,
      message: `Cleared ${cleared} old log files`,
      cleared
    });
  } catch (error) {
    logger.error('Error clearing logs:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Setup calendar watch for a user
 */
router.post('/setup-calendar-watch', async (req, res) => {
  try {
    const { calendarId = 'primary' } = req.body;
    
    const watch = await calendarService.setupCalendarWatch(calendarId);
    
    res.json({
      success: true,
      message: 'Calendar watch setup successfully',
      watch
    });
  } catch (error) {
    logger.error('Error setting up calendar watch:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get meetings needing attention
 */
router.get('/meetings/attention', async (req, res) => {
  try {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + (24 * 60 * 60 * 1000));

    // Meetings with low RSVP rate
    const lowRSVPMeetings = await Meeting.find({
      status: 'scheduled',
      startTime: { $gte: now, $lte: in24Hours },
      rsvpRate: { $lt: 50 }
    }).limit(20);

    // Meetings with no agenda
    const noAgendaMeetings = await Meeting.find({
      status: 'scheduled',
      startTime: { $gte: now, $lte: in24Hours },
      $or: [
        { 'agenda.raw': { $exists: false } },
        { 'agenda.raw': '' }
      ]
    }).limit(20);

    // Meetings with mandatory attendees not responded
    const mandatoryPendingMeetings = await Meeting.find({
      status: 'scheduled',
      startTime: { $gte: now, $lte: in24Hours },
      mandatoryAttendees: { $exists: true, $ne: [] }
    }).limit(20);

    const needsAttention = mandatoryPendingMeetings.filter(meeting => {
      const mandatoryResponses = meeting.attendees
        .filter(a => meeting.mandatoryAttendees.includes(a.email))
        .map(a => a.responseStatus);
      
      return mandatoryResponses.includes('needsAction');
    });

    res.json({
      success: true,
      meetings: {
        lowRSVP: lowRSVPMeetings,
        noAgenda: noAgendaMeetings,
        mandatoryPending: needsAttention
      }
    });
  } catch (error) {
    logger.error('Error fetching meetings needing attention:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Bulk update user departments
 */
router.post('/users/update-departments', async (req, res) => {
  try {
    const { updates } = req.body; // Array of { email, department }

    if (!Array.isArray(updates)) {
      return res.status(400).json({ error: 'Updates must be an array' });
    }

    let updated = 0;
    for (const { email, department } of updates) {
      await UserStats.findOneAndUpdate(
        { email },
        { department },
        { upsert: true }
      );
      updated++;
    }

    res.json({
      success: true,
      message: `Updated ${updated} user departments`,
      updated
    });
  } catch (error) {
    logger.error('Error updating departments:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Reset user statistics
 */
router.post('/users/:email/reset-stats', async (req, res) => {
  try {
    const { email } = req.params;

    const user = await UserStats.findOneAndUpdate(
      { email },
      {
        agendaScore: 0,
        rsvpScore: 0,
        ghostScore: 0,
        punctualityScore: 0,
        meetingsOrganized: 0,
        meetingsWithAgenda: 0,
        meetingsAttended: 0,
        rsvpsOnTime: 0,
        rsvpsIgnored: 0,
        badges: [],
        currentRSVPStreak: 0,
        bestRSVPStreak: 0
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User statistics reset successfully',
      user
    });
  } catch (error) {
    logger.error('Error resetting user stats:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Database cleanup
 */
router.post('/cleanup', async (req, res) => {
  try {
    const { daysOld = 90 } = req.body;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    // Delete old completed/cancelled meetings
    const deletedMeetings = await Meeting.deleteMany({
      status: { $in: ['completed', 'cancelled', 'auto-cancelled'] },
      endTime: { $lt: cutoffDate }
    });

    res.json({
      success: true,
      message: `Cleaned up ${deletedMeetings.deletedCount} old meetings`,
      deletedCount: deletedMeetings.deletedCount
    });
  } catch (error) {
    logger.error('Error during cleanup:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Health check with detailed status
 */
router.get('/health', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    };

    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

module.exports = router;