const UserStats = require('../models/UserStats');
const logger = require('../utils/logger');

class GamificationService {
  async updateScore(email, type, metadata = {}) {
    try {
      let user = await UserStats.findOne({ email });

      if (!user) {
        user = new UserStats({
          email,
          name: metadata.name || email.split('@')[0],
          slackId: metadata.slackId,
          slackUserId: metadata.slackId
        });
      }

      switch (type) {
        case 'AGENDA_ADDED':
          user.agendaScore += 10;
          user.meetingsWithAgenda += 1;
          if (user.stats) {
            user.stats.agendaScore = user.agendaScore;
          }
          await this.checkAndAwardBadge(user, 'AGENDA_NINJA');
          logger.info(`✅ ${email} earned +10 Agenda Score (Total: ${user.agendaScore})`);
          break;

        case 'GHOST':
          user.ghostScore += 5;
          user.rsvpsIgnored += 1;
          if (user.stats) {
            user.stats.ghostScore = user.ghostScore;
          }
          await this.checkAndAwardBadge(user, 'SERIAL_GHOST');
          logger.info(`👻 ${email} earned +5 Ghost Score (Total: ${user.ghostScore})`);
          break;

        case 'RSVP_ON_TIME':
          user.rsvpScore += 5;
          user.rsvpsOnTime += 1;
          user.currentRSVPStreak += 1;

          if (user.currentRSVPStreak > user.bestRSVPStreak) {
            user.bestRSVPStreak = user.currentRSVPStreak;
          }

          user.lastRSVPDate = new Date();

          if (user.stats) {
            user.stats.streak = user.currentRSVPStreak;
          }
          if (user.streak !== undefined) {
            user.streak = user.currentRSVPStreak;
          }

          await this.checkAndAwardBadge(user, 'RSVP_CHAMPION');
          logger.info(`⚡ ${email} earned +5 RSVP Score (Total: ${user.rsvpScore})`);
          break;

        case 'MEETING_ORGANIZED':
          user.meetingsOrganized += 1;
          logger.info(`📅 ${email} organized a meeting (Total: ${user.meetingsOrganized})`);
          break;

        case 'MEETING_ATTENDED':
          user.meetingsAttended += 1;
          logger.info(`✅ ${email} attended a meeting (Total: ${user.meetingsAttended})`);
          break;

        default:
          logger.warn(`Unknown score type: ${type}`);
          return null;
      }

      await user.save();
      return user;
    } catch (error) {
      logger.error(`Error updating score for ${email}:`, error);
      throw error;
    }
  }

  async checkAndAwardBadge(user, badgeType) {
    let shouldAward = false;
    let badgeName = '';

    switch (badgeType) {
      case 'AGENDA_NINJA':
        if (user.agendaScore >= 100 && !user.badges.includes('Agenda Ninja')) {
          shouldAward = true;
          badgeName = 'Agenda Ninja';
        }
        break;

      case 'SERIAL_GHOST':
        if (user.ghostScore >= 50 && !user.badges.includes('Serial Ghost')) {
          shouldAward = true;
          badgeName = 'Serial Ghost';
        }
        break;

      case 'RSVP_CHAMPION':
        if (user.rsvpScore >= 100 && !user.badges.includes('RSVP Champion')) {
          shouldAward = true;
          badgeName = 'RSVP Champion';
        }
        break;

      case 'STREAK_MASTER':
        if (user.currentRSVPStreak >= 7 && !user.badges.includes('Streak Master')) {
          shouldAward = true;
          badgeName = 'Streak Master';
        }
        break;

      default:
        break;
    }

    if (shouldAward) {
      user.badges.push(badgeName);

      if (user.badgeDetails) {
        user.badgeDetails.push({
          type: badgeName,
          earnedAt: new Date()
        });
      }

      logger.info(`🏆 ${user.email} earned badge: ${badgeName}`);
    }
  }

  async getLeaderboard(limit = 10) {
    try {
      const leaderboard = await UserStats.find()
        .sort({ agendaScore: -1, rsvpScore: -1 })
        .limit(limit)
        .select('email name agendaScore rsvpScore ghostScore badges currentRSVPStreak')
        .lean();

      return leaderboard;
    } catch (error) {
      logger.error('Error fetching leaderboard:', error);
      throw error;
    }
  }

  async getUserStats(email) {
    try {
      let user = await UserStats.findOne({ email });

      if (!user) {
        user = new UserStats({ email });
        await user.save();
      }

      return user;
    } catch (error) {
      logger.error(`Error fetching user stats for ${email}:`, error);
      throw error;
    }
  }

  async getGlobalStats() {
    try {
      const totalUsers = await UserStats.countDocuments();

      const aggregation = await UserStats.aggregate([
        {
          $group: {
            _id: null,
            totalMeetings: { $sum: '$meetingsOrganized' },
            totalWithAgenda: { $sum: '$meetingsWithAgenda' },
            totalRSVPs: { $sum: '$rsvpsOnTime' },
            totalGhosts: { $sum: '$rsvpsIgnored' }
          }
        }
      ]);

      const stats = aggregation[0] || {
        totalMeetings: 0,
        totalWithAgenda: 0,
        totalRSVPs: 0,
        totalGhosts: 0
      };

      const agendaRate = stats.totalMeetings > 0
        ? ((stats.totalWithAgenda / stats.totalMeetings) * 100).toFixed(1)
        : 0;

      return {
        totalUsers,
        totalMeetings: stats.totalMeetings,
        totalWithAgenda: stats.totalWithAgenda,
        totalRSVPs: stats.totalRSVPs,
        totalGhosts: stats.totalGhosts,
        agendaRate: parseFloat(agendaRate)
      };
    } catch (error) {
      logger.error('Error fetching global stats:', error);
      throw error;
    }
  }
}

module.exports = new GamificationService();
