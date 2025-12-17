/**
 * ========================================
 * CHRONOKEEPER - CALENDAR ETIQUETTE ENFORCER
 * ========================================
 * Enhanced version with meeting creation validation
 * - Blocks meetings without agenda (if attendees exist)
 * - Auto-allows solo meetings with "SELF (reminder)"
 * ========================================
 */

// ============================================
// CONFIGURATION
// ============================================
var CONFIG = {
  BACKEND_API: 'https://hack0n-calendar-etiquette-enforcer-production.up.railway.app',
  MIN_AGENDA_LENGTH: 50,
  SELF_REMINDER_AGENDA: '📍 Purpose: Personal reminder\n\n🎯 Expected Outcomes: Complete task\n\n⚡ Decisions Needed: None\n\n📌 Notes: SELF (reminder)',
  AGENDA_TEMPLATE: '📍 Purpose:\n\n🎯 Expected Outcomes:\n\n⚡ Decisions Needed:\n\n📌 Pre-reads (optional):'
};

// ============================================
// MAIN TRIGGER - Called when event is opened
// ============================================
function onCalendarEventOpen(e) {
  try {
    Logger.log('=== ChronoKeeper: Event Opened ===');
    
    var eventId = e.calendar.id;
    var calendarId = e.calendar.calendarId;
    
    // Get event details to check attendees
    var eventInfo = getEventInfo(eventId, calendarId);
    
    Logger.log('Event has ' + (eventInfo.attendeeCount || 0) + ' attendees');
    Logger.log('Is solo meeting: ' + eventInfo.isSoloMeeting);
    
    // Check if this is a solo meeting (self-reminder)
    if (eventInfo.isSoloMeeting) {
      Logger.log('Solo meeting detected - auto-approving with SELF agenda');
      return buildSoloMeetingCard(eventId, calendarId);
    }
    
    // Has attendees - require agenda
    return buildAgendaCard(eventId, calendarId, eventInfo.attendeeCount);
    
  } catch (error) {
    Logger.log('ERROR: ' + error.message);
    return buildErrorCard('Failed to load: ' + error.message);
  }
}

// ============================================
// GET EVENT INFORMATION
// ============================================
function getEventInfo(eventId, calendarId) {
  try {
    var calendar = CalendarApp.getCalendarById(calendarId);
    if (!calendar) {
      return { isSoloMeeting: false, attendeeCount: 0 };
    }
    
    var event = calendar.getEventById(eventId);
    if (!event) {
      return { isSoloMeeting: false, attendeeCount: 0 };
    }
    
    var guests = event.getGuestList() || [];
    var attendeeCount = guests.length;
    
    // Solo meeting: only creator, no other attendees
    var isSoloMeeting = (attendeeCount === 0);
    
    Logger.log('Attendee count: ' + attendeeCount);
    Logger.log('Is solo: ' + isSoloMeeting);
    
    return {
      isSoloMeeting: isSoloMeeting,
      attendeeCount: attendeeCount,
      event: event
    };
    
  } catch (error) {
    Logger.log('Error getting event info: ' + error.message);
    return { isSoloMeeting: false, attendeeCount: 0 };
  }
}

// ============================================
// BUILD CARD FOR SOLO MEETING (SELF-REMINDER)
// ============================================
function buildSoloMeetingCard(eventId, calendarId) {
  var card = CardService.newCardBuilder();
  
  // Header
  card.setHeader(
    CardService.newCardHeader()
      .setTitle('📝 Personal Reminder')
      .setSubtitle('Solo meeting detected')
  );
  
  // Info section
  var infoSection = CardService.newCardSection();
  infoSection.addWidget(
    CardService.newTextParagraph()
      .setText('✅ This is a personal reminder (no attendees).\n\nWe\'ll auto-add a simple agenda for you.')
  );
  card.addSection(infoSection);
  
  // Show what will be added
  var agendaSection = CardService.newCardSection();
  agendaSection.addWidget(
    CardService.newTextParagraph()
      .setText('<b>Auto-Agenda:</b>\n<font color="#666">' + CONFIG.SELF_REMINDER_AGENDA + '</font>')
  );
  card.addSection(agendaSection);
  
  // Auto-approve button
  var buttonSection = CardService.newCardSection();
  
  var approveAction = CardService.newAction()
    .setFunctionName('approveSoloMeeting')
    .setParameters({
      eid: eventId,
      cid: calendarId
    });
  
  buttonSection.addWidget(
    CardService.newButtonSet()
      .addButton(
        CardService.newTextButton()
          .setText('✅ Approve & Create Reminder')
          .setOnClickAction(approveAction)
          .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
      )
  );
  
  card.addSection(buttonSection);
  
  // Or add custom agenda
  var customSection = CardService.newCardSection();
  customSection.addWidget(
    CardService.newTextParagraph()
      .setText('<i>Or add your own notes:</i>')
  );
  
  customSection.addWidget(
    CardService.newTextInput()
      .setFieldName('custom_notes')
      .setTitle('Custom Notes (Optional)')
      .setMultiline(true)
  );
  
  var customAction = CardService.newAction()
    .setFunctionName('saveSoloMeetingWithNotes')
    .setParameters({
      eid: eventId,
      cid: calendarId
    });
  
  customSection.addWidget(
    CardService.newButtonSet()
      .addButton(
        CardService.newTextButton()
          .setText('Save with Custom Notes')
          .setOnClickAction(customAction)
      )
  );
  
  card.addSection(customSection);
  
  return card.build();
}

// ============================================
// BUILD CARD FOR MEETINGS WITH ATTENDEES
// ============================================
function buildAgendaCard(eventId, calendarId, attendeeCount) {
  var card = CardService.newCardBuilder();
  
  // Header with attendee count
  card.setHeader(
    CardService.newCardHeader()
      .setTitle('📋 Meeting Agenda REQUIRED')
      .setSubtitle(attendeeCount + ' attendee' + (attendeeCount !== 1 ? 's' : '') + ' - agenda mandatory')
  );
  
  // Warning section
  var warningSection = CardService.newCardSection();
  warningSection.addWidget(
    CardService.newTextParagraph()
      .setText('⚠️ <b>AGENDA REQUIRED</b>\n\nMeetings with attendees MUST have a clear agenda. Your meeting will be blocked without one.')
  );
  card.addSection(warningSection);
  
  // Divider
  card.addSection(
    CardService.newCardSection()
      .addWidget(CardService.newDivider())
  );
  
  // Form section
  var formSection = CardService.newCardSection();
  
  // Agenda input (REQUIRED)
  formSection.addWidget(
    CardService.newTextInput()
      .setFieldName('agenda')
      .setTitle('📝 Meeting Agenda *')
      .setValue(CONFIG.AGENDA_TEMPLATE)
      .setMultiline(true)
      .setHint('REQUIRED: Minimum 50 characters of meaningful content')
  );
  
  // Mandatory attendees
  formSection.addWidget(
    CardService.newTextInput()
      .setFieldName('mandatory')
      .setTitle('⚠️ Mandatory Attendees (Optional)')
      .setHint('email1@razorpay.com, email2@razorpay.com')
  );
  
  formSection.addWidget(
    CardService.newTextParagraph()
      .setText('<font color="#666"><i>Meeting auto-cancels if mandatory attendees decline</i></font>')
  );
  
  card.addSection(formSection);
  
  // Button section
  var buttonSection = CardService.newCardSection();
  
  var saveAction = CardService.newAction()
    .setFunctionName('handleSaveWithValidation')
    .setParameters({
      eid: eventId,
      cid: calendarId,
      attendees: attendeeCount.toString()
    });
  
  buttonSection.addWidget(
    CardService.newButtonSet()
      .addButton(
        CardService.newTextButton()
          .setText('💾 Save Agenda & Enable Meeting')
          .setOnClickAction(saveAction)
          .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
      )
  );
  
  card.addSection(buttonSection);
  
  // Footer warning
  var footerSection = CardService.newCardSection();
  footerSection.addWidget(
    CardService.newTextParagraph()
      .setText('<font color="#ea4335"><b>⛔ Without an agenda, this meeting cannot be sent!</b></font>')
  );
  card.addSection(footerSection);
  
  return card.build();
}

// ============================================
// APPROVE SOLO MEETING (AUTO-AGENDA)
// ============================================
function approveSoloMeeting(e) {
  try {
    Logger.log('=== Approving Solo Meeting ===');
    
    var eventId = e.parameters.eid;
    var calendarId = e.parameters.cid;
    
    // Update event with auto-agenda
    var success = updateEventDescription(
      eventId, 
      calendarId, 
      CONFIG.SELF_REMINDER_AGENDA
    );
    
    if (!success) {
      return showError('Failed to update calendar event');
    }
    
    // Send to backend with special flag
    sendToBackend(eventId, CONFIG.SELF_REMINDER_AGENDA, '', true);
    
    Logger.log('=== Solo Meeting Approved ===');
    return showSuccess('✅ Personal reminder created! No agenda needed for solo meetings.');
    
  } catch (error) {
    Logger.log('ERROR approving solo meeting: ' + error.message);
    return showError('Error: ' + error.message);
  }
}

// ============================================
// SAVE SOLO MEETING WITH CUSTOM NOTES
// ============================================
function saveSoloMeetingWithNotes(e) {
  try {
    Logger.log('=== Saving Solo Meeting with Notes ===');
    
    var customNotes = e.formInput.custom_notes || '';
    var eventId = e.parameters.eid;
    var calendarId = e.parameters.cid;
    
    // Build agenda with custom notes
    var agenda = CONFIG.SELF_REMINDER_AGENDA;
    if (customNotes.trim()) {
      agenda = '📍 Purpose: Personal reminder\n\n' +
               '📝 Notes:\n' + customNotes + '\n\n' +
               '⚡ Type: SELF (reminder)';
    }
    
    // Update event
    var success = updateEventDescription(eventId, calendarId, agenda);
    
    if (!success) {
      return showError('Failed to update calendar event');
    }
    
    // Send to backend
    sendToBackend(eventId, agenda, '', true);
    
    Logger.log('=== Solo Meeting Saved with Custom Notes ===');
    return showSuccess('✅ Personal reminder created with your notes!');
    
  } catch (error) {
    Logger.log('ERROR: ' + error.message);
    return showError('Error: ' + error.message);
  }
}

// ============================================
// SAVE HANDLER WITH STRICT VALIDATION
// ============================================
function handleSaveWithValidation(e) {
  try {
    Logger.log('=== Save Handler with Validation ===');
    
    var agenda = e.formInput.agenda || '';
    var mandatory = e.formInput.mandatory || '';
    var eventId = e.parameters.eid;
    var calendarId = e.parameters.cid;
    var attendeeCount = parseInt(e.parameters.attendees || '0');
    
    Logger.log('Agenda length: ' + agenda.length);
    Logger.log('Attendee count: ' + attendeeCount);
    
    // STRICT VALIDATION: If has attendees, MUST have agenda
    if (attendeeCount > 0) {
      
      // Check if agenda is just the template (not filled)
      var cleanAgenda = agenda
        .replace(CONFIG.AGENDA_TEMPLATE, '')
        .replace(/📍 Purpose:\s*/g, '')
        .replace(/🎯 Expected Outcomes:\s*/g, '')
        .replace(/⚡ Decisions Needed:\s*/g, '')
        .replace(/📌 Pre-reads.*:\s*/g, '')
        .replace(/\n/g, '')
        .trim();
      
      Logger.log('Clean agenda length: ' + cleanAgenda.length);
      
      // BLOCK if agenda is empty or too short
      if (cleanAgenda.length < CONFIG.MIN_AGENDA_LENGTH) {
        Logger.log('⛔ BLOCKED: Insufficient agenda for meeting with attendees');
        return showBlockedMeeting(attendeeCount);
      }
    }
    
    // Validation passed - save agenda
    var success = updateEventDescription(eventId, calendarId, agenda);
    
    if (!success) {
      Logger.log('WARNING: Could not update calendar event');
    }
    
    // Send to backend
    sendToBackend(eventId, agenda, mandatory, false);
    
    Logger.log('=== Save Successful ===');
    return showSuccess('✅ Agenda saved! Meeting approved.');
    
  } catch (error) {
    Logger.log('SAVE ERROR: ' + error.message);
    return showError('Error: ' + error.message);
  }
}

// ============================================
// SHOW BLOCKED MEETING MESSAGE
// ============================================
function showBlockedMeeting(attendeeCount) {
  var card = CardService.newCardBuilder();
  
  // Blocked header
  card.setHeader(
    CardService.newCardHeader()
      .setTitle('⛔ Meeting Blocked')
      .setSubtitle('Agenda required for meetings with attendees')
  );
  
  // Explanation
  var section1 = CardService.newCardSection();
  section1.addWidget(
    CardService.newTextParagraph()
      .setText('<font color="#ea4335"><b>This meeting cannot be created!</b></font>\n\n' +
               'You have <b>' + attendeeCount + ' attendee' + (attendeeCount !== 1 ? 's' : '') + '</b> invited.\n\n' +
               'ChronoKeeper requires a meaningful agenda for all meetings with attendees.')
  );
  card.addSection(section1);
  
  // What to do
  var section2 = CardService.newCardSection();
  section2.addWidget(
    CardService.newTextParagraph()
      .setText('<b>What you need to do:</b>\n' +
               '1. Fill in the Purpose\n' +
               '2. Define Expected Outcomes\n' +
               '3. List Decisions Needed\n' +
               '4. Click Save (minimum 50 characters)')
  );
  card.addSection(section2);
  
  // Alternative
  var section3 = CardService.newCardSection();
  section3.addWidget(
    CardService.newTextParagraph()
      .setText('<font color="#666"><i>💡 Tip: If this is a personal reminder, remove all attendees and it will be auto-approved.</i></font>')
  );
  card.addSection(section3);
  
  card.addSection(
    CardService.newCardSection()
      .addWidget(CardService.newDivider())
  );
  
  // Show the form again
  var formSection = CardService.newCardSection();
  formSection.addWidget(
    CardService.newTextInput()
      .setFieldName('agenda')
      .setTitle('Add Agenda Now')
      .setValue(CONFIG.AGENDA_TEMPLATE)
      .setMultiline(true)
  );
  
  card.addSection(formSection);
  
  return CardService.newActionResponseBuilder()
    .setNavigation(
      CardService.newNavigation()
        .updateCard(card.build())
    )
    .setNotification(
      CardService.newNotification()
        .setText('⛔ Meeting BLOCKED! Add agenda to proceed.')
        .setType(CardService.NotificationType.ERROR)
    )
    .build();
}

// ============================================
// BUILD CARD FOR SOLO MEETING
// ============================================
function buildSoloMeetingCard(eventId, calendarId) {
  var card = CardService.newCardBuilder();
  
  // Header
  card.setHeader(
    CardService.newCardHeader()
      .setTitle('📝 Personal Reminder Detected')
      .setSubtitle('No attendees - auto-approved!')
  );
  
  // Info section
  var infoSection = CardService.newCardSection();
  infoSection.addWidget(
    CardService.newTextParagraph()
      .setText('✅ <b>Solo meeting detected!</b>\n\n' +
               'Since this is a personal reminder (no attendees), we\'ll automatically add a simple agenda for you.')
  );
  card.addSection(infoSection);
  
  // Show auto-agenda
  var agendaSection = CardService.newCardSection();
  agendaSection.addWidget(
    CardService.newDecoratedText()
      .setText('<b>Auto-Agenda:</b>')
      .setBottomLabel('SELF (reminder) - No detailed agenda needed')
  );
  card.addSection(agendaSection);
  
  // Auto-approve button
  var buttonSection = CardService.newCardSection();
  
  var approveAction = CardService.newAction()
    .setFunctionName('approveSoloMeeting')
    .setParameters({
      eid: eventId,
      cid: calendarId
    });
  
  buttonSection.addWidget(
    CardService.newButtonSet()
      .addButton(
        CardService.newTextButton()
          .setText('✅ Create Reminder')
          .setOnClickAction(approveAction)
          .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
      )
  );
  
  card.addSection(buttonSection);
  
  // Optional: Add custom notes
  card.addSection(
    CardService.newCardSection()
      .addWidget(CardService.newDivider())
  );
  
  var customSection = CardService.newCardSection();
  customSection.addWidget(
    CardService.newTextParagraph()
      .setText('<i>Want to add notes?</i>')
  );
  
  customSection.addWidget(
    CardService.newTextInput()
      .setFieldName('custom_notes')
      .setTitle('Notes (Optional)')
      .setMultiline(true)
      .setHint('Add any notes for your reminder')
  );
  
  var customAction = CardService.newAction()
    .setFunctionName('saveSoloMeetingWithNotes')
    .setParameters({
      eid: eventId,
      cid: calendarId
    });
  
  customSection.addWidget(
    CardService.newButtonSet()
      .addButton(
        CardService.newTextButton()
          .setText('Save with Notes')
          .setOnClickAction(customAction)
      )
  );
  
  card.addSection(customSection);
  
  return card.build();
}

// ============================================
// BUILD AGENDA CARD FOR REGULAR MEETINGS
// ============================================
function buildAgendaCard(eventId, calendarId, attendeeCount) {
  var card = CardService.newCardBuilder();
  
  // Header
  card.setHeader(
    CardService.newCardHeader()
      .setTitle('📋 Meeting Agenda REQUIRED')
      .setSubtitle(attendeeCount + ' attendee' + (attendeeCount !== 1 ? 's' : '') + ' invited')
  );
  
  // Warning
  var warningSection = CardService.newCardSection();
  warningSection.addWidget(
    CardService.newTextParagraph()
      .setText('<font color="#ea4335"><b>⛔ AGENDA REQUIRED</b></font>\n\n' +
               'Meetings with attendees CANNOT be created without a clear agenda.\n\n' +
               'Meetings with good agendas are 3x more productive!')
  );
  card.addSection(warningSection);
  
  card.addSection(
    CardService.newCardSection()
      .addWidget(CardService.newDivider())
  );
  
  // Form
  var formSection = CardService.newCardSection();
  
  formSection.addWidget(
    CardService.newTextInput()
      .setFieldName('agenda')
      .setTitle('📝 Meeting Agenda *')
      .setValue(CONFIG.AGENDA_TEMPLATE)
      .setMultiline(true)
      .setHint('REQUIRED: Min 50 chars of real content')
  );
  
  formSection.addWidget(
    CardService.newTextInput()
      .setFieldName('mandatory')
      .setTitle('⚠️ Mandatory Attendees (Optional)')
      .setHint('Comma-separated emails')
  );
  
  card.addSection(formSection);
  
  // Save button
  var buttonSection = CardService.newCardSection();
  
  var saveAction = CardService.newAction()
    .setFunctionName('handleSaveWithValidation')
    .setParameters({
      eid: eventId,
      cid: calendarId,
      attendees: attendeeCount.toString()
    });
  
  buttonSection.addWidget(
    CardService.newButtonSet()
      .addButton(
        CardService.newTextButton()
          .setText('💾 Save Agenda & Enable Meeting')
          .setOnClickAction(saveAction)
          .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
      )
  );
  
  card.addSection(buttonSection);
  
  // Footer
  var footerSection = CardService.newCardSection();
  footerSection.addWidget(
    CardService.newTextParagraph()
      .setText('<font color="#999"><i>🚀 Powered by ChronoKeeper</i></font>')
  );
  card.addSection(footerSection);
  
  return card.build();
}

// ============================================
// UPDATE CALENDAR EVENT DESCRIPTION
// ============================================
function updateEventDescription(eventId, calendarId, agenda) {
  try {
    var calendar = CalendarApp.getCalendarById(calendarId);
    if (!calendar) {
      Logger.log('Calendar not found: ' + calendarId);
      return false;
    }
    
    var event = calendar.getEventById(eventId);
    if (!event) {
      Logger.log('Event not found: ' + eventId);
      return false;
    }
    
    var header = '━━━━━━━━━━━━━━━━━━━━━━\n📋 MEETING AGENDA\n━━━━━━━━━━━━━━━━━━━━━━\n\n';
    var footer = '\n\n━━━━━━━━━━━━━━━━━━━━━━\n✅ Agenda verified by ChronoKeeper\n';
    var oldDesc = event.getDescription() || '';
    
    event.setDescription(header + agenda + footer + oldDesc);
    
    Logger.log('✅ Event description updated');
    return true;
    
  } catch (error) {
    Logger.log('Update error: ' + error.message);
    return false;
  }
}

// ============================================
// SEND TO BACKEND API
// ============================================
function sendToBackend(eventId, agenda, mandatory, isSoloMeeting) {
  try {
    var userEmail = Session.getActiveUser().getEmail();
    
    var mandatoryList = [];
    if (mandatory && mandatory.trim()) {
      mandatoryList = mandatory
        .split(',')
        .map(function(e) { return e.trim(); })
        .filter(function(e) { return e.length > 0 && e.indexOf('@') > -1; });
    }
    
    var payload = {
      eventId: eventId,
      agenda: agenda,
      mandatoryAttendees: mandatoryList,
      creator: userEmail,
      isSoloMeeting: isSoloMeeting || false
    };
    
    var options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    Logger.log('Calling backend: ' + CONFIG.BACKEND_API);
    
    var response = UrlFetchApp.fetch(
      CONFIG.BACKEND_API + '/api/events/register',
      options
    );
    
    var code = response.getResponseCode();
    Logger.log('Backend response: ' + code);
    
    if (code === 200) {
      Logger.log('✅ Backend registration successful');
      var data = JSON.parse(response.getContentText());
      Logger.log('Meeting ID: ' + (data.meeting ? data.meeting.id : 'N/A'));
    } else {
      Logger.log('⚠️ Backend error: ' + response.getContentText());
    }
    
  } catch (error) {
    Logger.log('Backend API error: ' + error.message);
    // Don't fail - agenda is still saved to calendar
  }
}

// ============================================
// RESPONSE BUILDERS
// ============================================
function showSuccess(message) {
  message = message || '✅ Agenda saved! Your meeting is approved.';
  
  return CardService.newActionResponseBuilder()
    .setNotification(
      CardService.newNotification()
        .setText(message)
        .setType(CardService.NotificationType.INFO)
    )
    .setStateChanged(true)
    .build();
}

function showError(message) {
  return CardService.newActionResponseBuilder()
    .setNotification(
      CardService.newNotification()
        .setText('❌ ' + message)
        .setType(CardService.NotificationType.ERROR)
    )
    .build();
}

function buildErrorCard(message) {
  var card = CardService.newCardBuilder();
  
  card.setHeader(
    CardService.newCardHeader()
      .setTitle('❌ Error')
  );
  
  card.addSection(
    CardService.newCardSection()
      .addWidget(
        CardService.newTextParagraph()
          .setText(message)
      )
  );
  
  return card.build();
}

// ============================================
// TEST FUNCTION
// ============================================
function testAddon() {
  Logger.log('=== Testing ChronoKeeper ===');
  
  var fakeEvent = {
    calendar: {
      id: 'test_123',
      calendarId: Session.getActiveUser().getEmail()
    }
  };
  
  var card = onCalendarEventOpen(fakeEvent);
  Logger.log('Card built successfully');
  
  return card;
}

// ============================================
// TEST SOLO MEETING
// ============================================
function testSoloMeeting() {
  Logger.log('=== Testing Solo Meeting Logic ===');
  
  // Simulate solo meeting (no attendees)
  var eventInfo = {
    isSoloMeeting: true,
    attendeeCount: 0
  };
  
  Logger.log('Solo meeting: ' + eventInfo.isSoloMeeting);
  Logger.log('Should auto-approve with SELF agenda');
  
  var card = buildSoloMeetingCard('test_solo', Session.getActiveUser().getEmail());
  Logger.log('Solo meeting card built successfully');
  
  return card;
}

// ============================================
// TEST MEETING WITH ATTENDEES (SHOULD BLOCK)
// ============================================
function testMeetingWithAttendees() {
  Logger.log('=== Testing Meeting with Attendees ===');
  
  var eventInfo = {
    isSoloMeeting: false,
    attendeeCount: 3
  };
  
  Logger.log('Attendee count: ' + eventInfo.attendeeCount);
  Logger.log('Should require agenda');
  
  var card = buildAgendaCard('test_multi', Session.getActiveUser().getEmail(), 3);
  Logger.log('Multi-attendee card built successfully');
  
  return card;
}