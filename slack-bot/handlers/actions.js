const calendarService = require('../../backend/services/calendarService');
const UserStats = require('../../backend/models/UserStats');
const badgeService = require('../../backend/services/badgeService');
const slackService = require('../../backend/services/slackService');
const logger = require('../../backend/utils/logger');

async function handleRSVPAccept({ ack, body, respond }) {
  await ack();
  
  try {
    const eventId = body.actions[0].value;
    const userEmail = body.user.email || `${body.user.id}@razorpay.com`; // Adjust domain

    // Update RSVP
    await calendarService.updateRSVP(eventId, userEmail, 'accepted');

    // Update stats
    await UserStats.findOneAndUpdate(
      { email: userEmail },
      { $inc: { rsvpScore: 1, rsvpsOnTime: 1 } },
      { upsert: true }
    );

    // Evaluate badges
    await badgeService.evaluateAndAwardBadges(userEmail);

    logger.info(`${userEmail} accepted meeting ${eventId}`);

    await respond({
      text: '✅ Great! You\'ve accepted the meeting. See you there!',
      replace_original: true,
      response_type: 'ephemeral'
    });
  } catch (error) {
    logger.error('Error handling RSVP accept:', error);
    await respond({
      text: `❌ Error updating RSVP: ${error.message}`,
      response_type: 'ephemeral'
    });
  }
}

async function handleRSVPDecline({ ack, body, respond }) {
  await ack();
  
  try {
    const eventId = body.actions[0].value;
    const userEmail = body.user.email || `${body.user.id}@razorpay.com`;

    await calendarService.updateRSVP(eventId, userEmail, 'declined');

    await UserStats.findOneAndUpdate(
      { email: userEmail },
      { $inc: { rsvpScore: 1 } },
      { upsert: true }
    );

    await badgeService.evaluateAndAwardBadges(userEmail);

    logger.info(`${userEmail} declined meeting ${eventId}`);

    await respond({
      text: '❌ Got it. You\'ve declined the meeting.',
      replace_original: true,
      response_type: 'ephemeral'
    });
  } catch (error) {
    logger.error('Error handling RSVP decline:', error);
    await respond({
      text: `❌ Error updating RSVP: ${error.message}`,
      response_type: 'ephemeral'
    });
  }
}

async function handleRSVPTentative({ ack, body, respond }) {
  await ack();
  
  try {
    const eventId = body.actions[0].value;
    const userEmail = body.user.email || `${body.user.id}@razorpay.com`;

    await calendarService.updateRSVP(eventId, userEmail, 'tentative');

    await UserStats.findOneAndUpdate(
      { email: userEmail },
      { $inc: { rsvpScore: 1 } },
      { upsert: true }
    );

    await badgeService.evaluateAndAwardBadges(userEmail);

    logger.info(`${userEmail} marked tentative for ${eventId}`);

    await respond({
      text: '❓ Noted. You\'ve marked yourself as tentative.',
      replace_original: true,
      response_type: 'ephemeral'
    });
  } catch (error) {
    logger.error('Error handling RSVP tentative:', error);
    await respond({
      text: `❌ Error updating RSVP: ${error.message}`,
      response_type: 'ephemeral'
    });
  }
}

module.exports = {
  handleRSVPAccept,
  handleRSVPDecline,
  handleRSVPTentative
};