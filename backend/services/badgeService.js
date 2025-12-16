const UserStats = require('../models/UserStats');
const Meeting = require('../models/Meeting');
const logger = require('../utils/logger');

const BADGE_CRITERIA = {
  'agenda-ninja': {
    name: 'Agenda Ninja',
    emoji: '🥷',
    description: 'Created 10+ meetings with excellent agendas',
    check: (stats) => stats.meetingsWithAgenda >= 10
  },
  'rsvp-champion': {
    name: 'RSVP Champion',
    emoji: '⚡',
    description: 'Responded to 20+ meetings on time',
    check: (stats) => stats.rsvpScore >= 20
  },
  'serial-ghost': {
    name: 'Serial RSVP Ghost',
    emoji: '👻',
    description: 'Ignored 5+ RSVP requests',
    check: (stats) => stats.ghostScore >= 5
  },
  'meeting-monk': {
    name: 'Meeting Monk',
    emoji: '🧘',
    description: 'Overall excellence in meeting etiquette',
    check: (stats) => stats.agendaScore >= 15 && stats.rsvpScore >= 15 && stats.ghostScore < 3
  },
  'streak-master': {
    name: 'Streak Master',
    emoji: '🔥',
    description: '10+ day RSVP streak',
    check: (stats) => stats.currentRSVPStreak >= 10
  },
  'punctuality-pro': {
    name: 'Punctuality Pro',
    emoji: '⏰',
    description: 'Always RSVPs within 24 hours',
    check: (stats) => stats.rsvpsOnTime >= 20
  }
};

class BadgeService {
  async evaluateAndAwardBadges(userEmail) {
    try {
      const stats = await UserStats.findOne({ email: userEmail });
      if (!stats) return;

      const currentBadges = stats.badges.map(b => b.type);
      const earnedBadges = [];
      const lostBadges = [];

      // Check each badge criteria
      for (const [badgeType, criteria] of Object.entries(BADGE_CRITERIA)) {
        const shouldHave = criteria.check(stats);
        const currentlyHas = currentBadges.includes(badgeType);

        if (shouldHave && !currentlyHas) {
          // Award badge
          await stats.addBadge(badgeType, {
            earnedAt: new Date(),
            description: criteria.description
          });
          earnedBadges.push(badgeType);
          logger.info(`Awarded badge ${badgeType} to ${userEmail}`);
        } else if (!shouldHave && currentlyHas) {
          // Remove badge (e.g., ghost badge if behavior improves)
          await stats.removeBadge(badgeType);
          lostBadges.push(badgeType);
          logger.info(`Removed badge ${badgeType} from ${userEmail}`);
        }
      }

      return { earnedBadges, lostBadges };
    } catch (error) {
      logger.error('Error evaluating badges:', error);
      throw error;
    }
  }

  async evaluateAllUsers() {
    try {
      const users = await UserStats.find({});
      let updated = 0;

      for (const user of users) {
        await this.evaluateAndAwardBadges(user.email);
        updated++;
      }

      logger.info(`Evaluated badges for ${updated} users`);
      return updated;
    } catch (error) {
      logger.error('Error evaluating all badges:', error);
      throw error;
    }
  }

  getBadgeInfo(badgeType) {
    return BADGE_CRITERIA[badgeType] || null;
  }

  getAllBadges() {
    return BADGE_CRITERIA;
  }
}

module.exports = new BadgeService();