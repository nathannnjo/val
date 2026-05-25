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

const STORAGE_KEY = 'friendsCalendarEvents';

let selectedDate = new Date();
let currentView = { year: selectedDate.getFullYear(), month: selectedDate.getMonth() };
let events = loadEvents();

function loadEvents() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : {};
}

function saveEvents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

function formatDateString(date) {
  return date.toISOString().split('T')[0];
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

function getEventTimeLabel(event) {
  if (event.type === 'busy') {
    if (event.timeStart || event.timeEnd) {
      return `${event.timeStart || 'Start'} — ${event.timeEnd || 'End'}`;
    }
    return 'Busy all day';
  }

  if (event.timeStart) {
    return event.timeEnd ? `${event.timeStart} — ${event.timeEnd}` : `${event.timeStart}`;
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
          <button type="button" data-event-id="${event.id}">Delete</button>
          ${event.seriesId ? `<button type="button" class="delete-all" data-series-id="${event.seriesId}">Delete across days</button>` : ''}
        </div>
      `;

      const deleteBtn = card.querySelector('button[data-event-id]');
      deleteBtn.addEventListener('click', () => {
        deleteEvent(dateString, event.id);
      });

      const deleteAllBtn = card.querySelector('button.delete-all');
      if (deleteAllBtn) {
        deleteAllBtn.addEventListener('click', () => {
          deleteSeries(event.seriesId);
        });
      }

      eventList.appendChild(card);
    });
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

function handleFormSubmit(event) {
  event.preventDefault();

  const startDate = eventDateInput.value;
  const endDateValue = eventEndDateInput.value;
  const dateRange = getDateRange(startDate, endDateValue || startDate);
  const title = eventTitleInput.value.trim();
  const notes = eventNotesInput.value.trim();
  const type = eventTypeSelect.value;
  const timeStart = eventStartTimeInput.value;
  const timeEnd = eventEndTimeInput.value;

  if (!startDate || !title) {
    return;
  }

  const seriesId = dateRange.length > 1 ? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` : null;

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

  saveEvents();

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
}

initialize();
