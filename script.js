const calendarGrid = document.getElementById('calendarGrid');
const currentMonthLabel = document.getElementById('currentMonthLabel');
const selectedDateLabel = document.getElementById('selectedDateLabel');
const eventDateHeading = document.getElementById('eventDateHeading');
const eventList = document.getElementById('eventList');
const eventForm = document.getElementById('eventForm');
const eventTypeSelect = document.getElementById('eventType');
const eventDateInput = document.getElementById('eventDate');
const eventEndDateInput = document.getElementById('eventEndDate');
const eventStartTimeInput = document.getElementById('eventStartTime');
const eventEndTimeInput = document.getElementById('eventEndTime');
const eventTitleInput = document.getElementById('eventTitle');
const eventNotesInput = document.getElementById('eventNotes');
const clearFormBtn = document.getElementById('clearFormBtn');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');
const eventFormHeading = document.querySelector('#eventForm h3');
const eventSubmitButton = document.querySelector('#eventForm button[type="submit"]');

const DB_PATH = 'calendar/events';

let selectedDate = new Date();
let currentView = { year: selectedDate.getFullYear(), month: selectedDate.getMonth() };
let events = {};
let editingEvent = null;
let firebaseReady = false;
let lastSyncedEvents = {}; // Track what we've synced to prevent listener overwriting local changes

// Wait for Firebase to be ready
function waitForFirebase() {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 50; // 5 second timeout (50 * 100ms)
    
    const checkFirebase = setInterval(() => {
      attempts++;
      if (typeof window.database !== 'undefined' && window.database !== null) {
        clearInterval(checkFirebase);
        console.log('✅ Firebase database reference is ready');
        firebaseReady = true;
        resolve();
        return;
      }
      
      if (attempts >= maxAttempts) {
        clearInterval(checkFirebase);
        console.error('❌ Firebase failed to initialize. Check firebase-config.js and browser console for errors.');
        reject(new Error('Firebase initialization timeout'));
      }
    }, 100);
  });
}

async function initializeFirebase() {
  try {
    await waitForFirebase();
    const database = window.database;
    
    // Load events and set up real-time listener
    const eventsRef = database.ref(DB_PATH);
    
    eventsRef.on('value', 
      (snapshot) => {
        const data = snapshot.val();
        events = data || {};
        lastSyncedEvents = JSON.parse(JSON.stringify(events)); // Deep copy
        console.log('📝 Events synced from Firebase:', events);
        
        // Refresh the calendar view
        renderCalendar();
        renderSelectedDay();
      },
      (error) => {
        console.error('❌ Firebase listener error:', error);
      }
    );
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    firebaseReady = false;
  }
}

async function saveEvents() {
  if (!window.database) {
    console.error('❌ Firebase not ready. Check firebase-config.js');
    alert('Calendar not connected to Firebase. Check console (F12) for errors.');
    return;
  }
  
  try {
    console.log('💾 Saving events to Firebase...', events);
    await window.database.ref(DB_PATH).set(events);
    console.log('✅ Events saved successfully');
  } catch (error) {
    console.error('❌ Error saving events:', error);
    alert('Failed to save event:\n' + error.message + '\n\nCheck console (F12) for details.');
  }
}

function formatDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatPrettyDate(date) {
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function formatMonthLabel(year, month) {
  return new Date(year, month, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function getDayEvents(dateString) {
  return events[dateString] || [];
}

function getDayCounts(dateString) {
  const dayEvents = getDayEvents(dateString);
  return {
    events: dayEvents.filter((item) => item.type === 'event').length,
    busy: dayEvents.filter((item) => item.type === 'busy').length,
  };
}

function renderCalendar() {
  calendarGrid.innerHTML = '';
  currentMonthLabel.textContent = formatMonthLabel(currentView.year, currentView.month);

  const firstDayOfMonth = new Date(currentView.year, currentView.month, 1);
  const daysInMonth = new Date(currentView.year, currentView.month + 1, 0).getDate();
  const startIndex = firstDayOfMonth.getDay();

  for (let i = 0; i < startIndex; i += 1) {
    const spacer = document.createElement('div');
    spacer.className = 'day-cell';
    spacer.style.background = 'transparent';
    spacer.style.border = 'none';
    spacer.style.cursor = 'default';
    calendarGrid.appendChild(spacer);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(currentView.year, currentView.month, day);
    const dateString = formatDateString(date);
    const counts = getDayCounts(dateString);
    const dayCell = document.createElement('button');
    dayCell.type = 'button';
    dayCell.className = 'day-cell';
    if (selectedDate && formatDateString(selectedDate) === dateString) {
      dayCell.classList.add('selected');
    }

    const countLabels = [];
    if (counts.events > 0) {
      countLabels.push(`<div class="event-count">${counts.events} event${counts.events > 1 ? 's' : ''}</div>`);
    }
    if (counts.busy > 0) {
      countLabels.push(`<div class="busy-count">${counts.busy} busy</div>`);
    }

    dayCell.innerHTML = `
      <div class="date-number">${day}</div>
      ${countLabels.join('')}
    `;

    dayCell.addEventListener('click', () => {
      selectedDate = date;
      currentView = { year: date.getFullYear(), month: date.getMonth() };
      renderCalendar();
      renderSelectedDay();
      populateFormDate();
    });

    calendarGrid.appendChild(dayCell);
  }
}

function formatTimeLabel(timeString) {
  if (!timeString) {
    return '';
  }

  const [rawHour, rawMinute] = timeString.split(':');
  const hour = parseInt(rawHour, 10);
  const minute = rawMinute || '00';
  const period = hour >= 12 ? 'pm' : 'am';
  const normalizedHour = hour % 12 === 0 ? 12 : hour % 12;

  return minute === '00' ? `${normalizedHour}${period}` : `${normalizedHour}:${minute}${period}`;
}

function getEventTimeLabel(event) {
  if (event.type === 'busy') {
    if (event.timeStart || event.timeEnd) {
      return `${event.timeStart ? formatTimeLabel(event.timeStart) : 'Start'} — ${event.timeEnd ? formatTimeLabel(event.timeEnd) : 'End'}`;
    }
    return 'Busy all day';
  }

  if (event.timeStart) {
    return event.timeEnd ? `${formatTimeLabel(event.timeStart)} — ${formatTimeLabel(event.timeEnd)}` : `${formatTimeLabel(event.timeStart)}`;
  }

  return 'All day';
}

function renderSelectedDay() {
  const dateString = formatDateString(selectedDate);
  selectedDateLabel.textContent = formatPrettyDate(selectedDate);
  eventDateHeading.textContent = `Selected day: ${dateString}`;

  const dayEvents = getDayEvents(dateString);
  eventList.innerHTML = '';

  if (!dayEvents.length) {
    eventList.innerHTML = '<p class="empty-state">No events yet. Add one below.</p>';
    return;
  }

  dayEvents
    .sort((a, b) => (a.timeStart || '').localeCompare(b.timeStart || ''))
    .forEach((event) => {
      const card = document.createElement('article');
      card.className = 'event-card';
      card.innerHTML = `
        <strong>${event.title}</strong>
        <span class="event-tag">${event.type === 'busy' ? 'Busy range' : 'Event'}</span>
        <time>${getEventTimeLabel(event)}</time>
        <p>${event.notes ? event.notes : 'No additional notes.'}</p>
        <div class="card-actions">
          <button type="button" class="edit-button" data-event-id="${event.id}">Edit</button>
          <button type="button" data-event-id="${event.id}">Delete</button>
          ${event.seriesId ? `<button type="button" class="delete-all" data-series-id="${event.seriesId}">Delete across days</button>` : ''}
        </div>
      `;

      const editBtn = card.querySelector('button.edit-button');
      if (editBtn) {
        editBtn.addEventListener('click', () => {
          startEditingEvent(dateString, event);
        });
      }

      const deleteBtn = card.querySelector('button:not(.edit-button)[data-event-id]');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          deleteEvent(dateString, event.id);
        });
      }

      const deleteAllBtn = card.querySelector('button.delete-all');
      if (deleteAllBtn) {
        deleteAllBtn.addEventListener('click', () => {
          deleteSeries(event.seriesId);
        });
      }

      eventList.appendChild(card);
    });
}

function startEditingEvent(dateString, event) {
  editingEvent = { dateString, id: event.id, originalSeriesId: event.seriesId || null };
  eventFormHeading.textContent = 'Edit Event';
  eventSubmitButton.textContent = 'Update event';
  clearFormBtn.textContent = 'Cancel';

  eventTypeSelect.value = event.type;
  eventDateInput.value = dateString;
  eventEndDateInput.value = dateString;
  eventStartTimeInput.value = event.timeStart || '';
  eventEndTimeInput.value = event.timeEnd || '';
  eventTitleInput.value = event.title || '';
  eventNotesInput.value = event.notes || '';
}

function deleteEvent(dateString, eventId) {
  events[dateString] = events[dateString].filter((item) => item.id !== eventId);
  if (!events[dateString].length) {
    delete events[dateString];
  }
  saveEvents();
  renderCalendar();
  renderSelectedDay();
}

function populateFormDate() {
  const formatted = formatDateString(selectedDate);
  eventDateInput.value = formatted;
  eventEndDateInput.value = '';
}

function clearForm() {
  editingEvent = null;
  eventFormHeading.textContent = 'Add / Update Event';
  eventSubmitButton.textContent = 'Save event';
  clearFormBtn.textContent = 'Clear';
  eventTypeSelect.value = 'event';
  eventDateInput.value = formatDateString(selectedDate);
  eventEndDateInput.value = '';
  eventStartTimeInput.value = '';
  eventEndTimeInput.value = '';
  eventTitleInput.value = '';
  eventNotesInput.value = '';
}

function getDateRange(startString, endString) {
  const result = [];
  const start = new Date(startString);
  const end = new Date(endString || startString);
  let current = new Date(start);

  while (current <= end) {
    result.push(formatDateString(current));
    current.setDate(current.getDate() + 1);
  }

  return result;
}

function deleteSeries(seriesId) {
  if (!seriesId) return;

  Object.keys(events).forEach((dateString) => {
    events[dateString] = events[dateString].filter((item) => item.seriesId !== seriesId);
    if (!events[dateString].length) {
      delete events[dateString];
    }
  });

  saveEvents();
  renderCalendar();
  renderSelectedDay();
}

async function handleFormSubmit(event) {
  event.preventDefault();
  console.log('📋 Form submitted');

  const startDate = eventDateInput.value;
  const endDateValue = eventEndDateInput.value;
  const dateRange = getDateRange(startDate, endDateValue || startDate);
  const title = eventTitleInput.value.trim();
  const notes = eventNotesInput.value.trim();
  const type = eventTypeSelect.value;
  const timeStart = eventStartTimeInput.value;
  const timeEnd = eventEndTimeInput.value;

  if (!startDate || !title) {
    console.warn('⚠️ Missing required fields');
    return;
  }

  if (editingEvent) {
    const originalDate = editingEvent.dateString;
    events[originalDate] = getDayEvents(originalDate).filter((item) => item.id !== editingEvent.id);
    if (!events[originalDate].length) {
      delete events[originalDate];
    }
  }

  const seriesId = dateRange.length > 1
    ? editingEvent?.originalSeriesId || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    : editingEvent?.originalSeriesId || null;

  dateRange.forEach((dateString) => {
    const newEvent = {
      id: `${dateString}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      seriesId,
      type,
      title,
      notes,
      timeStart,
      timeEnd,
    };

    events[dateString] = [...getDayEvents(dateString), newEvent];
  });

  console.log('📤 Calling saveEvents()');
  // IMPORTANT: Wait for save to complete before updating UI
  await saveEvents();

  selectedDate = new Date(startDate);
  currentView = { year: selectedDate.getFullYear(), month: selectedDate.getMonth() };
  renderCalendar();
  renderSelectedDay();
  clearForm();
}

prevMonthBtn.addEventListener('click', () => {
  currentView.month -= 1;
  if (currentView.month < 0) {
    currentView.month = 11;
    currentView.year -= 1;
  }
  renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
  currentView.month += 1;
  if (currentView.month > 11) {
    currentView.month = 0;
    currentView.year += 1;
  }
  renderCalendar();
});

eventForm.addEventListener('submit', handleFormSubmit);
clearFormBtn.addEventListener('click', clearForm);

function initialize() {
  selectedDate = selectedDate || new Date();
  populateFormDate();
  renderCalendar();
  renderSelectedDay();
  
  // Firebase will be initialized by firebase-config.js once SDK is ready
}

// Start the app
initialize();