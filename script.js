const calendarGrid = document.getElementById('calendarGrid');
const currentMonthLabel = document.getElementById('currentMonthLabel');
const selectedDateLabel = document.getElementById('selectedDateLabel');
const eventDateHeading = document.getElementById('eventDateHeading');
const eventList = document.getElementById('eventList');
const eventForm = document.getElementById('eventForm');
const eventDateInput = document.getElementById('eventDate');
const eventTimeInput = document.getElementById('eventTime');
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
    const dayCell = document.createElement('button');
    dayCell.type = 'button';
    dayCell.className = 'day-cell';
    if (selectedDate && formatDateString(selectedDate) === dateString) {
      dayCell.classList.add('selected');
    }

    dayCell.innerHTML = `
      <div class="date-number">${day}</div>
      ${getDayEvents(dateString).length ? `<div class="event-count">${getDayEvents(dateString).length} event${getDayEvents(dateString).length > 1 ? 's' : ''}</div>` : ''}
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
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
    .forEach((event) => {
      const card = document.createElement('article');
      card.className = 'event-card';
      card.innerHTML = `
        <strong>${event.title}</strong>
        <time>${event.time ? event.time : 'All day'}</time>
        <p>${event.notes ? event.notes : 'No additional notes.'}</p>
        <button type="button" data-event-id="${event.id}">Delete</button>
      `;

      const deleteBtn = card.querySelector('button');
      deleteBtn.addEventListener('click', () => {
        deleteEvent(dateString, event.id);
      });

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
  eventDateInput.value = formatDateString(selectedDate);
}

function clearForm() {
  eventTimeInput.value = '';
  eventTitleInput.value = '';
  eventNotesInput.value = '';
}

function handleFormSubmit(event) {
  event.preventDefault();

  const dateString = eventDateInput.value;
  const title = eventTitleInput.value.trim();
  const time = eventTimeInput.value;
  const notes = eventNotesInput.value.trim();

  if (!dateString || !title) {
    return;
  }

  const newEvent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    time,
    notes,
  };

  events[dateString] = [...getDayEvents(dateString), newEvent];
  saveEvents();

  selectedDate = new Date(dateString);
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
