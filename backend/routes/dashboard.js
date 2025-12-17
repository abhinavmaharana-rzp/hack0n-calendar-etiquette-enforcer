const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');
const badgeService = require('../services/badgeService');
const logger = require('../utils/logger');

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const overall = await analyticsService.getOverallStats();
    const weeklyData = await analyticsService.getWeeklyData();
    const leaderboard = await analyticsService.getLeaderboard(20);
    const efficiency = await analyticsService.getMeetingEfficiency();

    res.json({
      success: true,
      overall,
      weeklyData,
      leaderboard,
      efficiency
    });
  } catch (error) {
    logger.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const leaderboard = await analyticsService.getLeaderboard(limit);

    res.json({ success: true, leaderboard });
  } catch (error) {
    logger.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user stats
router.get('/user/:email', async (req, res) => {
  try {
    const UserStats = require('../models/UserStats');
    const stats = await UserStats.findOne({ email: req.params.email });

    if (!stats) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, stats });
  } catch (error) {
    logger.error('Error fetching user stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get room usage stats
router.get('/rooms', async (req, res) => {
  try {
    const roomStats = await analyticsService.getRoomUsageStats();
    res.json({ success: true, roomStats });
  } catch (error) {
    logger.error('Error fetching room stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all badges
router.get('/badges', async (req, res) => {
  try {
    const badges = badgeService.getAllBadges();
    res.json({ success: true, badges });
  } catch (error) {
    logger.error('Error fetching badges:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get cost analysis
router.get('/cost-analysis', async (req, res) => {
  try {
    const avgSalary = parseFloat(req.query.avgSalary) || 100000;
    const startDate = req.query.startDate || null;
    const endDate = req.query.endDate || null;
    const costAnalysis = await analyticsService.getCostAnalysis(avgSalary, startDate, endDate);
    res.json({ success: true, ...costAnalysis });
  } catch (error) {
    logger.error('Error fetching cost analysis:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get meeting heatmap data
router.get('/heatmap', async (req, res) => {
  try {
    const startDate = req.query.startDate || null;
    const endDate = req.query.endDate || null;
    const heatmapData = await analyticsService.getMeetingHeatmapData(startDate, endDate);
    res.json({ success: true, ...heatmapData });
  } catch (error) {
    logger.error('Error fetching heatmap data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get team comparison
router.get('/teams', async (req, res) => {
  try {
    const avgSalary = parseFloat(req.query.avgSalary) || 100000;
    const teamData = await analyticsService.getTeamComparison(avgSalary);
    res.json({ success: true, teams: teamData });
  } catch (error) {
    logger.error('Error fetching team comparison:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;