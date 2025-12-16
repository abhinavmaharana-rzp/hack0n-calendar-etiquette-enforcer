/**
 * Calendar Etiquette Enforcer - Google Workspace Add-on
 * This add-on enforces agenda requirements on all calendar events
 */

// Configuration
const CONFIG = {
  BACKEND_API: 'YOUR_BACKEND_URL', // Update this after deploying backend
  MIN_AGENDA_LENGTH: 50,
  AGENDA_TEMPLATE: `📍 Purpose:

🎯 Expected Outcomes:

⚡ Decisions Needed:

📌 Pre-reads (optional):`
};

/**
 * Triggered when user opens a calendar event
 */
function onCalendarEventOpen(e) {
  console.log('Event opened:', JSON.stringify(e));
  
  var eventId = e.calendar.id;
  var calendarId = e.calendar.calendarId;
  
  // Check if event already has agenda
  var hasAgenda = checkIfEventHasAgenda(eventId, calendarId);
  
  if (hasAgenda) {
    return createAgendaViewCard(eventId, calendarId);
  } else {
    return createAgendaFormCard(eventId, calendarId);
  }
}

/**
 * Check if event already has agenda in our system
 */
function checkIfEventHasAgenda(eventId, calendarId) {
  try {
    var url = CONFIG.BACKEND_API + '/api/events/' + eventId;
    var response = UrlFetchApp.fetch(url, {
      method: 'get',
      muteHttpExceptions: true
    });
    
    if (response.getResponseCode() === 200) {
      var data = JSON.parse(response.getContentText());
      return data.meeting && data.meeting.agenda;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking agenda:', error);
    return false;
  }
}

/**
 * Create form card for agenda entry
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
    .setHeader('Why This Matters')
    .addWidget(
      CardService.newTextParagraph()
        .setText('Meetings with clear agendas are 3x more productive. Help your attendees prepare!')
    );
  
  card.addSection(instructionSection);
  
  // Agenda input section
  var agendaSection = CardService.newCardSection()
    .setHeader('Meeting Agenda');
  
  // Agenda text area
  agendaSection.addWidget(
    CardService.newTextInput()
      .setFieldName('agenda')
      .setTitle('Agenda *')
      .setValue(CONFIG.AGENDA_TEMPLATE)
      .setMultiline(true)
      .setHint('Required: Minimum 50 characters')
  );
  
  // Mandatory attendees input
  agendaSection.addWidget(
    CardService.newTextInput()
      .setFieldName('mandatory_attendees')
      .setTitle('Mandatory Attendees (Optional)')
      .setHint('Comma-separated emails. Meeting auto-cancels if they don\'t RSVP')
  );
  
  // Save button
  var saveAction = CardService.newAction()
    .setFunctionName('saveAgenda')
    .setParameters({
      eventId: eventId,
      calendarId: calendarId
    });
  
  agendaSection.addWidget(
    CardService.newButtonSet()
      .addButton(
        CardService.newTextButton()
          .setText('💾 Save Agenda')
          .setOnClickAction(saveAction)
          .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
      )
  );
  
  card.addSection(agendaSection);
  
  // Info footer
  var footerSection = CardService.newCardSection()
    .addWidget(
      CardService.newTextParagraph()
        .setText('<font color="#666666"><i>Powered by Calendar Etiquette Enforcer 🚀</i></font>')
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
      .setTitle('✅ Agenda Saved')
      .setSubtitle('This meeting is all set!')
  );
  
  var section = CardService.newCardSection()
    .addWidget(
      CardService.newTextParagraph()
        .setText('This meeting already has an agenda. Attendees will receive it with their invites.')
    )
    .addWidget(
      CardService.newButtonSet()
        .addButton(
          CardService.newTextButton()
            .setText('🔄 Update Agenda')
            .setOnClickAction(
              CardService.newAction()
                .setFunctionName('showUpdateForm')
                .setParameters({ eventId: eventId, calendarId: calendarId })
            )
        )
    );
  
  card.addSection(section);
  
  return card.build();
}

/**
 * Save agenda to backend
 */
function saveAgenda(e) {
  var formInput = e.formInput;
  var agenda = formInput.agenda;
  var mandatoryAttendees = formInput.mandatory_attendees || '';
  var eventId = e.parameters.eventId;
  var calendarId = e.parameters.calendarId;
  
  // Validate agenda length
  if (!agenda || agenda.replace(CONFIG.AGENDA_TEMPLATE, '').trim().length < CONFIG.MIN_AGENDA_LENGTH) {
    return CardService.newActionResponseBuilder()
      .setNotification(
        CardService.newNotification()
          .setText('❌ Agenda too short! Please add meaningful content (min ' + CONFIG.MIN_AGENDA_LENGTH + ' chars)')
          .setType(CardService.NotificationType.ERROR)
      )
      .build();
  }
  
  // Get current user email
  var userEmail = Session.getActiveUser().getEmail();
  
  // Get event details
  try {
    var calendar = CalendarApp.getCalendarById(calendarId);
    var event = calendar.getEventById(eventId);
    
    if (!event) {
      throw new Error('Event not found');
    }
    
    // Prepare mandatory attendees array
    var mandatoryList = [];
    if (mandatoryAttendees) {
      mandatoryList = mandatoryAttendees
        .split(',')
        .map(function(email) { return email.trim(); })
        .filter(function(email) { return email.length > 0; });
    }
    
    // Send to backend API
    var payload = {
      eventId: eventId,
      agenda: agenda,
      mandatoryAttendees: mandatoryList,
      creator: userEmail
    };
    
    var options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    var response = UrlFetchApp.fetch(CONFIG.BACKEND_API + '/api/events/register', options);
    var responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      // Success - update event description to include agenda
      var description = event.getDescription() || '';
      var updatedDescription = '📋 MEETING AGENDA\n\n' + agenda + '\n\n---\n' + description;
      event.setDescription(updatedDescription);
      
      return CardService.newActionResponseBuilder()
        .setNotification(
          CardService.newNotification()
            .setText('✅ Agenda saved! Your invite is ready to send.')
            .setType(CardService.NotificationType.INFO)
        )
        .setStateChanged(true)
        .build();
    } else {
      throw new Error('Backend returned error: ' + responseCode);
    }
    
  } catch (error) {
    console.error('Error saving agenda:', error);
    return CardService.newActionResponseBuilder()
      .setNotification(
        CardService.newNotification()
          .setText('❌ Error saving agenda: ' + error.message)
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

/**
 * Test function (for debugging)
 */
function testAddon() {
  var testEvent = {
    calendar: {
      id: 'test_event_id',
      calendarId: Session.getActiveUser().getEmail()
    }
  };
  
  var card = onCalendarEventOpen(testEvent);
  console.log('Card created:', card);
}