const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const UserStats = require('../models/UserStats');
const logger = require('../utils/logger');

// Generate demo data for hackathon presentation
router.post('/seed', async (req, res) => {
  try {
    const demoUsers = [
      { email: 'john.doe@razorpay.com', name: 'John Doe', department: 'Engineering' },
      { email: 'jane.smith@razorpay.com', name: 'Jane Smith', department: 'Product' },
      { email: 'bob.wilson@razorpay.com', name: 'Bob Wilson', department: 'Design' },
      { email: 'alice.brown@razorpay.com', name: 'Alice Brown', department: 'Engineering' },
      { email: 'charlie.davis@razorpay.com', name: 'Charlie Davis', department: 'Marketing' },
      { email: 'diana.miller@razorpay.com', name: 'Diana Miller', department: 'Product' },
      { email: 'eve.jones@razorpay.com', name: 'Eve Jones', department: 'Engineering' },
      { email: 'frank.taylor@razorpay.com', name: 'Frank Taylor', department: 'Sales' },
    ];

    // Create demo user stats
    const userStatsData = demoUsers.map((user, index) => ({
      email: user.email,
      name: user.name,
      department: user.department,
      agendaScore: Math.floor(Math.random() * 30) + 10,
      rsvpScore: Math.floor(Math.random() * 40) + 15,
      ghostScore: Math.floor(Math.random() * 5),
      meetingsOrganized: Math.floor(Math.random() * 20) + 5,
      meetingsWithAgenda: Math.floor(Math.random() * 15) + 5,
      rsvpsOnTime: Math.floor(Math.random() * 30) + 10,
      currentRSVPStreak: Math.floor(Math.random() * 15) + 1,
      bestRSVPStreak: Math.floor(Math.random() * 20) + 5,
      badges: index < 3 ? [
        { type: 'agenda-ninja', earnedAt: new Date(), metadata: {} },
        { type: 'rsvp-champion', earnedAt: new Date(), metadata: {} }
      ] : index < 5 ? [
        { type: 'rsvp-champion', earnedAt: new Date(), metadata: {} }
      ] : []
    }));

    await UserStats.insertMany(userStatsData, { ordered: false }).catch(() => {
      // Ignore duplicates
    });

    // Create demo meetings
    const now = new Date();
    const meetings = [];
    
    for (let i = 0; i < 15; i++) {
      const startTime = new Date(now);
      startTime.setDate(now.getDate() - (i * 2));
      startTime.setHours(10 + (i % 6), 0, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);

      const attendees = demoUsers
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 5) + 3)
        .map(user => ({
          email: user.email,
          name: user.name,
          responseStatus: Math.random() > 0.3 ? 'accepted' : Math.random() > 0.5 ? 'tentative' : 'needsAction',
          reminderCount: Math.floor(Math.random() * 3),
          lastReminded: new Date(startTime.getTime() - 24 * 60 * 60 * 1000)
        }));

      meetings.push({
        eventId: `demo-event-${i}-${Date.now()}`,
        calendarId: demoUsers[0].email,
        summary: [
          'Q4 Planning Session',
          'Product Roadmap Review',
          'Engineering Standup',
          'Design System Discussion',
          'Customer Feedback Review',
          'Sprint Retrospective',
          'Architecture Review',
          'Team Sync',
          'Feature Planning',
          'Bug Triage'
        ][i % 10],
        agenda: {
          raw: `📍 Purpose: ${['Plan Q4 initiatives', 'Review product roadmap', 'Daily standup', 'Design system updates', 'Customer feedback analysis'][i % 5]}\n\n🎯 Expected Outcomes: ${['Finalized roadmap', 'Clear priorities', 'Action items', 'Decisions made', 'Next steps defined'][i % 5]}\n\n⚡ Decisions Needed: ${['Budget allocation', 'Feature prioritization', 'Resource planning', 'Timeline approval', 'Team assignments'][i % 5]}\n\n📌 Pre-reads: Review attached documents`,
          purpose: ['Plan Q4 initiatives', 'Review product roadmap', 'Daily standup', 'Design system updates', 'Customer feedback analysis'][i % 5],
          outcomes: ['Finalized roadmap', 'Clear priorities', 'Action items', 'Decisions made', 'Next steps defined'][i % 5],
          decisions: ['Budget allocation', 'Feature prioritization', 'Resource planning', 'Timeline approval', 'Team assignments'][i % 5],
          prereads: 'Review attached documents'
        },
        creator: demoUsers[Math.floor(Math.random() * demoUsers.length)].email,
        creatorName: demoUsers[Math.floor(Math.random() * demoUsers.length)].name,
        attendees,
        mandatoryAttendees: i % 3 === 0 ? [demoUsers[0].email] : [],
        startTime,
        endTime,
        location: i % 2 === 0 ? `Conference Room ${String.fromCharCode(65 + (i % 5))}` : null,
        status: startTime < now ? 'completed' : 'scheduled',
        agendaQualityScore: Math.floor(Math.random() * 30) + 70,
        rsvpRate: Math.floor((attendees.filter(a => a.responseStatus !== 'needsAction').length / attendees.length) * 100)
      });
    }

    await Meeting.insertMany(meetings, { ordered: false }).catch(() => {
      // Ignore duplicates
    });

    logger.info('Demo data seeded successfully');
    res.json({
      success: true,
      message: 'Demo data seeded successfully',
      users: userStatsData.length,
      meetings: meetings.length
    });
  } catch (error) {
    logger.error('Error seeding demo data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Clear demo data
router.delete('/clear', async (req, res) => {
  try {
    await Meeting.deleteMany({ eventId: /^demo-event-/ });
    await UserStats.deleteMany({ email: /@razorpay\.com$/ });
    
    res.json({ success: true, message: 'Demo data cleared' });
  } catch (error) {
    logger.error('Error clearing demo data:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

