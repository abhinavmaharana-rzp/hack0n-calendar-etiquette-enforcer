const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../backend/server');
const Meeting = require('../backend/models/Meeting');

describe('Calendar Enforcer Integration Tests', () => {
  
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
  });
  
  afterAll(async () => {
    await mongoose.connection.close();
  });
  
  describe('Meeting Registration Flow', () => {
    it('should reject meeting without agenda', async () => {
      const response = await request(app)
        .post('/api/events/validate-agenda')
        .send({ agenda: '' });
      
      expect(response.status).toBe(400);
      expect(response.body.valid).toBe(false);
    });
    
    it('should accept meeting with good agenda', async () => {
      const response = await request(app)
        .post('/api/events/validate-agenda')
        .send({ 
          agenda: `Purpose: Q4 Planning
          
          Outcomes: Finalized roadmap
          
          Decisions: Budget allocation`
        });
      
      expect(response.status).toBe(200);
      expect(response.body.valid).toBe(true);
      expect(response.body.score).toBeGreaterThan(70);
    });
  });
  
  describe('RSVP Flow', () => {
    it('should update RSVP status', async () => {
      // Create test meeting
      const meeting = await Meeting.create({
        eventId: 'test_123',
        summary: 'Test Meeting',
        agenda: { raw: 'Test agenda' },
        creator: 'test@razorpay.com',
        attendees: [{
          email: 'attendee@razorpay.com',
          responseStatus: 'needsAction'
        }],
        startTime: new Date(),
        endTime: new Date()
      });
      
      // Update RSVP
      const response = await request(app)
        .post('/api/events/rsvp')
        .send({
          eventId: 'test_123',
          userEmail: 'attendee@razorpay.com',
          responseStatus: 'accepted'
        });
      
      expect(response.status).toBe(200);
      
      // Verify in DB
      const updated = await Meeting.findOne({ eventId: 'test_123' });
      expect(updated.attendees[0].responseStatus).toBe('accepted');
    });
  });
});