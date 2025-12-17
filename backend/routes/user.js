const express = require('express');
const router = express.Router();
const gamificationService = require('../services/gamificationService');
const logger = require('../utils/logger');

router.get('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const stats = await gamificationService.getUserStats(email);

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    logger.error(`Error fetching user stats for ${req.params.email}:`, error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
