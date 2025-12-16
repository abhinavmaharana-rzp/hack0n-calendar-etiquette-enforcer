const Meeting = require('../models/Meeting');
const UserStats = require('../models/UserStats');
const logger = require('../utils/logger');

class AnalyticsService {
  // Get overall statistics
  async getOverallStats(startDate = null, endDate = null) {
    try {
      const dateFilter = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);

      const query = startDate || endDate ? { createdAt: dateFilter } : {};

      const totalMeetings = await Meeting.countDocuments(query);
      const meetingsWithAgenda = await Meeting.countDocuments({
        ...query,
        'agenda.raw': { $exists: true, $ne: '' }
      });

      // RSVP rate calculation
      const meetings = await Meeting.find(query);
      let totalAttendees = 0;
      let totalResponded = 0;

      meetings.forEach(meeting => {
        totalAttendees += meeting.attendees.length;
        totalResponded += meeting.attendees.filter(a => 
          a.responseStatus !== 'needsAction'
        ).length;
      });

      const rsvpRate = totalAttendees > 0 
        ? Math.round((totalResponded / totalAttendees) * 100) 
        : 0;

      const autoCancelled = await Meeting.countDocuments({
        ...query,
        status: 'auto-cancelled'
      });

      const agendaPercent = totalMeetings > 0
        ? Math.round((meetingsWithAgenda / totalMeetings) * 100)
        : 0;

      return {
        totalMeetings,
        meetingsWithAgenda,
        agendaPercent,
        rsvpRate,
        autoCancelled,
        totalAttendees,
        totalResponded
      };
    } catch (error) {
      logger.error('Error getting overall stats:', error);
      throw error;
    }
  }

  // Get weekly data for charts
  async getWeeklyData(weeks = 4) {
    try {
      const now = new Date();
      const weeklyData = [];

      for (let i = weeks - 1; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - (i * 7));
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        const withAgenda = await Meeting.countDocuments({
          createdAt: { $gte: weekStart, $lt: weekEnd },
          'agenda.raw': { $exists: true, $ne: '' }
        });

        const withoutAgenda = await Meeting.countDocuments({
          createdAt: { $gte: weekStart, $lt: weekEnd },
          $or: [
            { 'agenda.raw': { $exists: false } },
            { 'agenda.raw': '' }
          ]
        });

        weeklyData.push({
          week: `Week ${weeks - i}`,
          withAgenda,
          withoutAgenda
        });
      }

      return weeklyData;
    } catch (error) {
      logger.error('Error getting weekly data:', error);
      throw error;
    }
  }

  // Get leaderboard
  async getLeaderboard(limit = 50) {
    try {
      const users = await UserStats.find({})
        .sort({ agendaScore: -1, rsvpScore: -1 })
        .limit(limit)
        .lean();

      return users.map(user => ({
        email: user.email,
        name: user.name || user.email.split('@')[0],
        agendaScore: user.agendaScore,
        rsvpScore: user.rsvpScore,
        ghostScore: user.ghostScore,
        overallScore: this.calculateOverallScore(user),
        badges: user.badges.map(b => b.type),
        currentStreak: user.currentRSVPStreak
      }));
    } catch (error) {
      logger.error('Error getting leaderboard:', error);
      throw error;
    }
  }

  calculateOverallScore(stats) {
    return Math.round(
      (stats.agendaScore * 0.3) +
      (stats.rsvpScore * 0.4) +
      ((100 - stats.ghostScore) * 0.3)
    );
  }

  // Get department statistics
  async getDepartmentStats() {
    try {
      const departments = await UserStats.aggregate([
        {
          $group: {
            _id: '$department',
            avgAgendaScore: { $avg: '$agendaScore' },
            avgRSVPScore: { $avg: '$rsvpScore' },
            avgGhostScore: { $avg: '$ghostScore' },
            totalUsers: { $sum: 1 }
          }
        },
        { $sort: { avgAgendaScore: -1 } }
      ]);

      return departments;
    } catch (error) {
      logger.error('Error getting department stats:', error);
      throw error;
    }
  }

  // Get meeting efficiency metrics
  async getMeetingEfficiency() {
    try {
      const meetings = await Meeting.find({ status: 'completed' });
      
      let totalDuration = 0;
      let meetingsWithGoodRSVP = 0;

      meetings.forEach(meeting => {
        const duration = (meeting.endTime - meeting.startTime) / (1000 * 60); // minutes
        totalDuration += duration;

        if (meeting.rsvpRate >= 80) {
          meetingsWithGoodRSVP++;
        }
      });

      const avgDuration = meetings.length > 0 
        ? Math.round(totalDuration / meetings.length) 
        : 0;

      return {
        totalMeetings: meetings.length,
        avgDuration,
        meetingsWithGoodRSVP,
        goodRSVPPercent: meetings.length > 0 
          ? Math.round((meetingsWithGoodRSVP / meetings.length) * 100) 
          : 0
      };
    } catch (error) {
      logger.error('Error getting meeting efficiency:', error);
      throw error;
    }
  }

  // Get room usage statistics
  async getRoomUsageStats() {
    try {
      const roomStats = await Meeting.aggregate([
        {
          $match: {
            location: { $exists: true, $ne: '' }
          }
        },
        {
          $group: {
            _id: '$location',
            totalBookings: { $sum: 1 },
            autoCancelled: {
              $sum: { $cond: [{ $eq: ['$status', 'auto-cancelled'] }, 1, 0] }
            },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            }
          }
        },
        { $sort: { totalBookings: -1 } }
      ]);

      return roomStats;
    } catch (error) {
      logger.error('Error getting room usage stats:', error);
      throw error;
    }
  }
}

module.exports = new AnalyticsService();