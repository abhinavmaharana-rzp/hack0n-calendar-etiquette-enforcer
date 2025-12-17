const mongoose = require('mongoose');

const UserStatsSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  slackUserId: String,
  department: String,
  
  // Scores
  agendaScore: { type: Number, default: 0 },
  rsvpScore: { type: Number, default: 0 },
  ghostScore: { type: Number, default: 0 },
  punctualityScore: { type: Number, default: 0 },
  
  // Counts
  meetingsOrganized: { type: Number, default: 0 },
  meetingsWithAgenda: { type: Number, default: 0 },
  meetingsAttended: { type: Number, default: 0 },
  rsvpsOnTime: { type: Number, default: 0 },
  rsvpsIgnored: { type: Number, default: 0 },
  
  // Badges
  badges: [{
    type: { type: String },
    earnedAt: { type: Date, default: Date.now },
    metadata: mongoose.Schema.Types.Mixed
  }],
  
  // Streaks
  currentRSVPStreak: { type: Number, default: 0 },
  bestRSVPStreak: { type: Number, default: 0 },
  lastRSVPDate: Date,
  
  // Preferences
  preferredReminderTime: { type: Number, default: 24 }, // hours before meeting
  optOutReminders: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Indexes (email already has unique: true, so don't duplicate)
UserStatsSchema.index({ agendaScore: -1 });
UserStatsSchema.index({ rsvpScore: -1 });
UserStatsSchema.index({ ghostScore: -1 });

// Virtual for overall score
UserStatsSchema.virtual('overallScore').get(function() {
  return (
    (this.agendaScore * 0.3) +
    (this.rsvpScore * 0.4) +
    ((100 - this.ghostScore) * 0.3)
  );
});

// Methods
UserStatsSchema.methods.addBadge = function(badgeType, metadata = {}) {
  const existingBadge = this.badges.find(b => b.type === badgeType);
  if (!existingBadge) {
    this.badges.push({ type: badgeType, metadata });
  }
  return this.save();
};

UserStatsSchema.methods.removeBadge = function(badgeType) {
  this.badges = this.badges.filter(b => b.type !== badgeType);
  return this.save();
};

module.exports = mongoose.model('UserStats', UserStatsSchema);