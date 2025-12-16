/**
 * ===================================================================
 * CALENDAR ETIQUETTE ENFORCER - GOOGLE WORKSPACE ADD-ON
 * ===================================================================
 * 
 * This add-on enforces agenda requirements on all calendar events.
 * It integrates with the backend API to store meeting data and
 * track agenda compliance.
 * 
 * Author: Abhinav (Razorpay Hack0n-05)
 * Version: 1.0.0
 * ===================================================================
 */

// ===================================================================
// CONFIGURATION
// ===================================================================

var CONFIG = {
  // Backend API URL (UPDATE THIS AFTER DEPLOYING BACKEND)
  BACKEND_API: 'http://localhost:5000', // Change to production URL
  
  // Minimum agenda length required
  MIN_AGENDA_LENGTH: 50,
  
  // Agenda template
  AGENDA_TEMPLATE: `📍 Purpose:

🎯 Expected Outcomes:

⚡ Decisions Needed:

📌 Pre-reads (optional):`,
  
  // Colors
  COLORS: {
    primary: '#4285f4',
    success: '#34a853',
    warning: '#fbbc04',
    danger: '#ea4335'
  }
};

// ===================================================================
// MAIN TRIGGER FUNCTIONS
// ===================================================================

/**
 * Triggered when user opens a calendar event
 * This is the main entry point for the add-on
 */
function onCalendarEventOpen(e) {
  try {
    Logger.log('Event opened: ' + JSON.stringify(e));
    
    var eventId = e.calendar.id;
    var calendarId = e.calendar.calendarId;
    
    // Check if event already has agenda in our system
    var hasAgenda = checkIfEventHasAgenda(eventId);
    
    if (hasAgenda) {
      return createAgendaViewCard(eventId, calendarId);
    } else {
      return createAgendaFormCard(eventId, calendarId);
    }
  } catch (error) {
    Logger.log('Error in onCalendarEventOpen: ' + error);
    return createErrorCard(error.message);
  }
}

/**
 * Triggered when calendar event is updated
 */
function onCalendarEventUpdate(e) {
  try {
    Logger.log('Event updated: ' + JSON.stringify(e));
    return onCalendarEventOpen(e);
  } catch (error) {
    Logger.log('Error in onCalendarEventUpdate: ' + error);
    return createErrorCard(error.message);
  }
}

// ===================================================================
// AGENDA CHECK FUNCTIONS
// ===================================================================

/**
 * Check if event already has agenda registered in backend
 */
function checkIfEventHasAgenda(eventId) {
  try {
    var url = CONFIG.BACKEND_API + '/api/events/' + eventId;
    
    var options = {
      method: 'get',
      muteHttpExceptions: true,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    var response = UrlFetchApp.fetch(url, options);
    var responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      var data = JSON.parse(response.getContentText());
      return data.success && data.meeting && data.meeting.agenda;
    }
    
    return false;
  } catch (error) {
    Logger.log('Error checking agenda: ' + error);
    return false;
  }
}

// ===================================================================
// CARD BUILDING FUNCTIONS
// ===================================================================

/**
 * Create the main agenda form card
 */
function createAgendaFormCard(eventId, calendarId) {
  var card = CardService.newCardBuilder();
  
  // Header
  card.setHeader(
    CardService.newCardHeader()
      .setTitle('📋 Meeting Agenda Required')
      .setSubtitle('Help everyone prep better!')
      .setImageUrl('https://www.gstatic.com/images/branding/product/1x/calendar_48dp.png')
  );
  
  // Instructions section
  var instructionSection = CardService.newCardSection()
    .setHeader('📌 Why This Matters')
    .addWidget(
      CardService.newTextParagraph()
        .setText('<b>Meetings with clear agendas are 3x more productive!</b><br><br>A good agenda helps attendees:<br>• Prepare beforehand<br>• Understand the purpose<br>• Make better decisions')
    );
  
  card.addSection(instructionSection);
  
  // Divider
  card.addSection(
    CardService.newCardSection()
      .addWidget(CardService.newDivider())
  );
  
  // Agenda input section
  var agendaSection = CardService.newCardSection()
    .setHeader('✍️ Meeting Agenda');
  
  // Agenda text area (main input)
  agendaSection.addWidget(
    CardService.newTextInput()
      .setFieldName('agenda')
      .setTitle('Agenda *')
      .setValue(CONFIG.AGENDA_TEMPLATE)
      .setMultiline(true)
      .setHint('Required: Minimum ' + CONFIG.MIN_AGENDA_LENGTH + ' characters')
  );
  
  // Mandatory attendees input
  agendaSection.addWidget(
    CardService.newTextInput()
      .setFieldName('mandatory_attendees')
      .setTitle('⚠️ Mandatory Attendees (Optional)')
      .setHint('Comma-separated emails (e.g., ceo@razorpay.com, cto@razorpay.com)')
      .setMultiline(false)
  );
  
  // Info text about mandatory attendees
  agendaSection.addWidget(
    CardService.newTextParagraph()
      .setText('<font color="#666666"><i>Meeting will auto-cancel if mandatory attendees decline</i></font>')
  );
  
  card.addSection(agendaSection);
  
  // Save button section
  var buttonSection = CardService.newCardSection();
  
  var saveAction = CardService.newAction()
    .setFunctionName('saveAgenda')
    .setParameters({
      eventId: eventId,
      calendarId: calendarId
    });
  
  buttonSection.addWidget(
    CardService.newButtonSet()
      .addButton(
        CardService.newTextButton()
          .setText('💾 Save Agenda & Enable Invite')
          .setOnClickAction(saveAction)
          .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
      )
  );
  
  card.addSection(buttonSection);
  
  // Footer
  var footerSection = CardService.newCardSection()
    .addWidget(
      CardService.newTextParagraph()
        .setText('<font color="#999999"><i>Powered by Calendar Etiquette Enforcer 🚀<br>Built for Razorpay Hack0n-05</i></font>')
    );
  
  card.addSection(footerSection);
  
  return card.build();
}

/**
 * Create view card for existing agenda
 */
function createAgendaViewCard(eventId, calendarId) {
  var card = CardService.newCardBuilder();
  
  card.setHeader(
    CardService.newCardHeader()
      .setTitle('✅ Agenda Saved Successfully')
      .setSubtitle('This meeting is all set!')
      .setImageUrl('https://www.gstatic.com/images/branding/product/1x/calendar_48dp.png')
  );
  
  // Success message
  var successSection = CardService.newCardSection()
    .addWidget(
      CardService.newTextParagraph()
        .setText('✨ Great job! This meeting has a clear agenda.<br><br>Attendees will receive:<br>• RSVP reminders on Slack<br>• Agenda in calendar invite<br>• Better preparation time')
    );
  
  card.addSection(successSection);
  
  // Divider
  card.addSection(
    CardService.newCardSection()
      .addWidget(CardService.newDivider())
  );
  
  // Action buttons
  var buttonSection = CardService.newCardSection();
  
  // Update agenda button
  var updateAction = CardService.newAction()
    .setFunctionName('showUpdateForm')
    .setParameters({ 
      eventId: eventId, 
      calendarId: calendarId 
    });
  
  buttonSection.addWidget(
    CardService.newButtonSet()
      .addButton(
        CardService.newTextButton()
          .setText('🔄 Update Agenda')
          .setOnClickAction(updateAction)
          .setTextButtonStyle(CardService.TextButtonStyle.TEXT)
      )
  );
  
  card.addSection(buttonSection);
  
  // Stats
  var statsSection = CardService.newCardSection()
    .addWidget(
      CardService.newTextParagraph()
        .setText('<font color="#34a853"><b>📊 Impact:</b></font><br>Meetings with agendas save an average of <b>15 minutes</b> per meeting!')
    );
  
  card.addSection(statsSection);
  
  return card.build();
}

/**
 * Create error card
 */
function createErrorCard(errorMessage) {
  var card = CardService.newCardBuilder();
  
  card.setHeader(
    CardService.newCardHeader()
      .setTitle('❌ Error')
      .setSubtitle('Something went wrong')
  );
  
  var errorSection = CardService.newCardSection()
    .addWidget(
      CardService.newTextParagraph()
        .setText('<font color="#ea4335"><b>Error:</b> ' + errorMessage + '</font><br><br>Please try again or contact support.')
    );
  
  card.addSection(errorSection);
  
  return card.build();
}

// ===================================================================
// ACTION HANDLERS
// ===================================================================

/**
 * Save agenda to backend
 */
function saveAgenda(e) {
  try {
    var formInput = e.formInput;
    var agenda = formInput.agenda;
    var mandatoryAttendees = formInput.mandatory_attendees || '';
    var eventId = e.parameters.eventId;
    var calendarId = e.parameters.calendarId;
    
    // Validate agenda
    var cleanAgenda = agenda.replace(CONFIG.AGENDA_TEMPLATE, '').trim();
    
    if (!agenda || cleanAgenda.length < CONFIG.MIN_AGENDA_LENGTH) {
      return CardService.newActionResponseBuilder()
        .setNotification(
          CardService.newNotification()
            .setText('❌ Agenda too short! Please add meaningful content (min ' + CONFIG.MIN_AGENDA_LENGTH + ' chars)')
            .setType(CardService.NotificationType.ERROR)
        )
        .build();
    }
    
    // Get current user
    var userEmail = Session.getActiveUser().getEmail();
    
    // Get event details
    var calendar = CalendarApp.getCalendarById(calendarId);
    if (!calendar) {
      throw new Error('Calendar not found');
    }
    
    var event = calendar.getEventById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }
    
    // Parse mandatory attendees
    var mandatoryList = [];
    if (mandatoryAttendees && mandatoryAttendees.trim()) {
      mandatoryList = mandatoryAttendees
        .split(',')
        .map(function(email) { return email.trim(); })
        .filter(function(email) { 
          return email.length > 0 && email.indexOf('@') > -1; 
        });
    }
    
    // Prepare payload for backend
    var payload = {
      eventId: eventId,
      agenda: agenda,
      mandatoryAttendees: mandatoryList,
      creator: userEmail
    };
    
    // Send to backend API
    var options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    var response = UrlFetchApp.fetch(
      CONFIG.BACKEND_API + '/api/events/register',
      options
    );
    
    var responseCode = response.getResponseCode();
    var responseData = JSON.parse(response.getContentText());
    
    if (responseCode !== 200) {
      throw new Error(responseData.error || 'Failed to save agenda');
    }
    
    // Update event description with agenda
    var existingDescription = event.getDescription() || '';
    var agendaHeader = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📋 MEETING AGENDA\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
    var agendaFooter = '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' + existingDescription;
    var updatedDescription = agendaHeader + agenda + agendaFooter;
    
    event.setDescription(updatedDescription);
    
    // Success response
    return CardService.newActionResponseBuilder()
      .setNotification(
        CardService.newNotification()
          .setText('✅ Agenda saved! Your invite is ready to send.')
          .setType(CardService.NotificationType.INFO)
      )
      .setStateChanged(true)
      .build();
    
  } catch (error) {
    Logger.log('Error saving agenda: ' + error);
    return CardService.newActionResponseBuilder()
      .setNotification(
        CardService.newNotification()
          .setText('❌ Error: ' + error.message)
          .setType(CardService.NotificationType.ERROR)
      )
      .build();
  }
}

/**
 * Show update form for existing agenda
 */
function showUpdateForm(e) {
  var eventId = e.parameters.eventId;
  var calendarId = e.parameters.calendarId;
  
  return createAgendaFormCard(eventId, calendarId);
}

// ===================================================================
// UTILITY FUNCTIONS
// ===================================================================

/**
 * Get calendar event by ID
 */
function getEventById(calendarId, eventId) {
  try {
    var calendar = CalendarApp.getCalendarById(calendarId);
    if (!calendar) return null;
    
    return calendar.getEventById(eventId);
  } catch (error) {
    Logger.log('Error getting event: ' + error);
    return null;
  }
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ===================================================================
// TESTING & DEBUG FUNCTIONS
// ===================================================================

/**
 * Test function for debugging
 */
function testAddon() {
  var testEvent = {
    calendar: {
      id: 'test_event_id',
      calendarId: Session.getActiveUser().getEmail()
    }
  };
  
  var card = onCalendarEventOpen(testEvent);
  Logger.log('Test card created: ' + card);
}

/**
 * Test backend connection
 */
function testBackendConnection() {
  try {
    var response = UrlFetchApp.fetch(CONFIG.BACKEND_API + '/health');
    Logger.log('Backend response: ' + response.getContentText());
    return true;
  } catch (error) {
    Logger.log('Backend connection failed: ' + error);
    return false;
  }
}

/**
 * Get add-on logs
 */
function getRecentLogs() {
  var logs = Logger.getLog();
  Logger.log('Recent logs:\n' + logs);
  return logs;
}

// Add mobile detection
function isMobileDevice() {
  try {
    var userAgent = navigator.userAgent || '';
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  } catch (e) {
    return false;
  }
}

// Create mobile-friendly card
function createMobileAgendaCard(eventId, calendarId) {
  var card = CardService.newCardBuilder();
  
  card.setHeader(
    CardService.newCardHeader()
      .setTitle('📋 Agenda Required')
      .setSubtitle('Quick template below 👇')
  );
  
  // Simplified mobile template
  var mobileSection = CardService.newCardSection();
  
  // Quick buttons for common meeting types
  var buttonSet = CardService.newButtonSet();
  
  buttonSet.addButton(
    CardService.newTextButton()
      .setText('📊 Status Update')
      .setOnClickAction(
        CardService.newAction()
          .setFunctionName('fillStatusUpdateTemplate')
          .setParameters({ eventId: eventId })
      )
  );
  
  buttonSet.addButton(
    CardService.newTextButton()
      .setText('🤝 1-on-1')
      .setOnClickAction(
        CardService.newAction()
          .setFunctionName('fillOneOnOneTemplate')
          .setParameters({ eventId: eventId })
      )
  );
  
  buttonSet.addButton(
    CardService.newTextButton()
      .setText('🎯 Planning')
      .setOnClickAction(
        CardService.newAction()
          .setFunctionName('fillPlanningTemplate')
          .setParameters({ eventId: eventId })
      )
  );
  
  mobileSection.addWidget(buttonSet);
  
  // Or custom agenda
  mobileSection.addWidget(
    CardService.newTextInput()
      .setFieldName('agenda')
      .setTitle('Custom Agenda')
      .setHint('What will we discuss?')
      .setMultiline(true)
  );
  
  card.addSection(mobileSection);
  
  return card.build();
}

// Quick template fillers
function fillStatusUpdateTemplate(e) {
  var template = `📊 Status Update Meeting

📍 Purpose: Review current progress and blockers

🎯 Expected Outcomes:
- Clear understanding of team progress
- Identified blockers and action items
- Alignment on next sprint priorities

⚡ Updates Needed From:
- Engineering: [Sprint progress]
- Product: [Feature priorities]
- Design: [UI/UX status]

📌 Pre-reads: [Link to status doc]`;

  return saveAgendaFromTemplate(e, template);
}

function fillOneOnOneTemplate(e) {
  var template = `🤝 One-on-One Meeting

📍 Purpose: Career discussion and feedback

🎯 Expected Outcomes:
- Discuss recent wins and challenges
- Career growth conversation
- Set action items for next 1-1

⚡ Topics to Cover:
- Recent project feedback
- Career goals progress
- Any concerns or blockers

📌 Notes: Confidential`;

  return saveAgendaFromTemplate(e, template);
}

function saveAgendaFromTemplate(e, template) {
  var eventId = e.parameters.eventId;
  
  // Auto-fill the agenda field with template
  return CardService.newActionResponseBuilder()
    .setStateChanged(true)
    .setNotification(
      CardService.newNotification()
        .setText('✅ Template applied! Review and save.')
    )
    .build();
}

// In Code.gs, add live validation
function createAgendaFormWithLiveValidation(eventId, calendarId) {
  var card = CardService.newCardBuilder();
  
  card.setHeader(
    CardService.newCardHeader()
      .setTitle('📋 Meeting Agenda')
      .setSubtitle('Quality score will update as you type')
  );
  
  var formSection = CardService.newCardSection();
  
  // Agenda input
  formSection.addWidget(
    CardService.newTextInput()
      .setFieldName('agenda')
      .setTitle('Agenda')
      .setValue(CONFIG.AGENDA_TEMPLATE)
      .setMultiline(true)
      .setOnChangeAction(
        CardService.newAction()
          .setFunctionName('updateAgendaScore')
          .setParameters({ eventId: eventId })
      )
  );
  
  // Quality indicator (updates on change)
  formSection.addWidget(
    CardService.newTextParagraph()
      .setText('<font color="#666">Quality Score: <b>Calculating...</b></font>')
  );
  
  card.addSection(formSection);
  
  return card.build();
}

function updateAgendaScore(e) {
  var agenda = e.formInput.agenda;
  
  // Call backend for validation
  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ agenda: agenda }),
    muteHttpExceptions: true
  };
  
  var response = UrlFetchApp.fetch(
    CONFIG.BACKEND_API + '/api/events/validate-agenda',
    options
  );
  
  var data = JSON.parse(response.getContentText());
  
  // Build updated card with score
  var card = CardService.newCardBuilder();
  
  var scoreSection = CardService.newCardSection();
  
  var scoreColor = data.score >= 70 ? '#34a853' : 
                   data.score >= 50 ? '#fbbc04' : '#ea4335';
  
  scoreSection.addWidget(
    CardService.newTextParagraph()
      .setText('<font color="' + scoreColor + '"><b>Quality Score: ' + 
               data.score + '/100</b></font>')
  );
  
  // Show feedback
  if (data.feedback && data.feedback.length > 0) {
    data.feedback.forEach(function(item) {
      scoreSection.addWidget(
        CardService.newTextParagraph()
          .setText('<font color="#666">' + item.message + '</font>')
      );
    });
  }
  
  card.addSection(scoreSection);
  
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().updateCard(card.build()))
    .build();
}