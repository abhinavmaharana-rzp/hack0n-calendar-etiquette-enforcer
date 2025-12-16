const mongoose = require('mongoose');

const EmailSlackMapSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  slackUserId: { type: String, required: true },
  name: String,
  lastSynced: { type: Date, default: Date.now }
});

EmailSlackMapSchema.index({ email: 1 });
EmailSlackMapSchema.index({ slackUserId: 1 });

module.exports = mongoose.model('EmailSlackMap', EmailSlackMapSchema);