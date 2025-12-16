require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const UserStats = require('../backend/models/UserStats');
const Meeting = require('../backend/models/Meeting');

async function seedData() {
  try {
    console.log('🌱 Seeding test data...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    await UserStats.deleteMany({});
    await Meeting.deleteMany({});
    console.log('🗑️  Cleared existing data\n');

    // Create sample users
    const users = [
      {
        email: 'john.doe@razorpay.com',
        name: 'John Doe',
        agendaScore: 25,
        rsvpScore: 30,
        ghostScore: 2,
        currentRSVPStreak: 15,
        bestRSVPStreak: 20,
        badges: [
          { type: 'agenda-ninja', earnedAt: new Date() },
          { type: 'rsvp-champion', earnedAt: new Date() }
        ]
      },
      {
        email: 'jane.smith@razorpay.com',
        name: 'Jane Smith',
        agendaScore: 18,
        rsvpScore: 25,
        ghostScore: 1,
        currentRSVPStreak: 10,
        badges: [
          { type: 'meeting-monk', earnedAt: new Date() }
        ]
      },
      {
        email: 'bob.wilson@razorpay.com',
        name: 'Bob Wilson',
        agendaScore: 5,
        rsvpScore: 8,
        ghostScore: 12,
        currentRSVPStreak: 0,
        badges: [
          { type: 'serial-ghost', earnedAt: new Date() }
        ]
      }
    ];

    await UserStats.insertMany(users);
    console.log(`✅ Created ${users.length} sample users\n`);

    // Create sample meetings
    const meetings = [
      {
        eventId: 'test_meeting_1',
        calendarId: 'john.doe@razorpay.com',
        summary: 'Q4 Planning Meeting',
        agenda: {
          raw: '📍 Purpose: Plan Q4 strategy\n🎯 Expected Outcomes: Finalized roadmap\n⚡ Decisions Needed: Budget allocation',
          purpose: 'Plan Q4 strategy',
          outcomes: 'Finalized roadmap',
          decisions: 'Budget allocation'
        },
        creator: 'john.doe@razorpay.com',
        attendees: [
          { email: 'jane.smith@razorpay.com', responseStatus: 'accepted' },
          { email: 'bob.wilson@razorpay.com', responseStatus: 'needsAction' }
        ],
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 25 * 60 * 60 * 1000),
        status: 'scheduled',
        agendaQualityScore: 85
      }
    ];

    await Meeting.insertMany(meetings);
    console.log(`✅ Created ${meetings.length} sample meetings\n`);

    console.log('🎉 Seed data created successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();