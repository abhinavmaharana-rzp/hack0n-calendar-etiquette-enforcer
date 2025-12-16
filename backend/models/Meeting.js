const mongoose = require('mongoose');

const AttendeeSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: String,
  responseStatus: {
    type: String,
    enum: ['needsAction', 'accepted', 'declined', 'tentative'],
    default: 'needsAction'
  },
  lastReminded: Date,
  reminderCount: { type: Number, default: 0 },
  remindedAt: [Date]
});

const MeetingSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true },
  calendarId: { type: String, required: true },
  summary: { type: String, required: true },
  
  // Agenda
  agenda: {
    purpose: String,
    outcomes: String,
    decisions: String,
    prereads: String,
    raw: { type: String, required: true }
  },
  
  // Organizer
  creator: { type: String, required: true },
  creatorName: String,
  
  // Attendees
  attendees: [AttendeeSchema],
  mandatoryAttendees: [String],
  
  // Timing
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  timezone: { type: String, default: 'Asia/Kolkata' },
  
  // Location
  location: String,
  roomCapacity: Number,
  
  // Status
  status: {
    type: String,
    enum: ['scheduled', 'cancelled', 'completed', 'auto-cancelled'],
    default: 'scheduled'
  },
  cancellationReason: String,
  
  // Metadata
  meetingLink: String,
  recurringEventId: String,
  isRecurring: { type: Boolean, default: false },
  
  // Tracking
  agendaQualityScore: { type: Number, min: 0, max: 100 },
  rsvpRate: { type: Number, default: 0 },
  wasRoomReleased: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Indexes
MeetingSchema.index({ eventId: 1 });
MeetingSchema.index({ creator: 1 });
MeetingSchema.index({ startTime: 1, status: 1 });
MeetingSchema.index({ 'attendees.email': 1 });

// Methods
MeetingSchema.methods.calculateRSVPRate = function() {
  const responded = this.attendees.filter(a => 
    a.responseStatus !== 'needsAction'
  ).length;
  this.rsvpRate = (responded / this.attendees.length) * 100;
  return this.rsvpRate;
};

MeetingSchema.methods.getNonResponders = function() {
  return this.attendees.filter(a => a.responseStatus === 'needsAction');
};

MeetingSchema.methods.getMandatoryNonResponders = function() {
  return this.attendees.filter(a => 
    this.mandatoryAttendees.includes(a.email) && 
    a.responseStatus === 'needsAction'
  );
};

module.exports = mongoose.model('Meeting', MeetingSchema);