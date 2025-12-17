const mongoose = require('mongoose');

const AttendeeSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: String,
  status: {
    type: String,
    enum: ['needsAction', 'accepted', 'declined', 'tentative'],
    default: 'needsAction'
  },
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
  googleEventId: { type: String, required: true, unique: true },
  eventId: { type: String, required: true },
  calendarId: { type: String, required: true, default: 'primary' },
  summary: { type: String, required: true },

  // Agenda Detection
  hasAgenda: { type: Boolean, default: false },
  isProcessed: { type: Boolean, default: false },
  agendaAddedAt: Date,

  // Agenda Details
  agenda: {
    purpose: String,
    outcomes: String,
    decisions: String,
    prereads: String,
    raw: String
  },
  description: String,

  // Organizer
  creatorEmail: { type: String, required: true },
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
  wasRoomReleased: { type: Boolean, default: false },
  warningsSent: { type: Number, default: 0 },
  lastWarningSent: Date
}, {
  timestamps: true
});

// Indexes (eventId already has unique: true, so don't duplicate)
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