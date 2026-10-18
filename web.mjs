
import daysData from "./days.json" with { type: "json" };
import { getDateForOccurrence } from "./common.mjs";

const calendar = document.querySelector("#calendar");
const currentMonth = document.querySelector("#current-month");
const previousButton = document.querySelector("#previous-month");
const nextButton = document.querySelector("#next-month");
const datePicker = document.querySelector("#date-picker");
const monthSelect = document.querySelector("#month-select");
const yearInput = document.querySelector("#year-input");

const monthNames = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

let currentDate = new Date();
currentDate = new Date(
  currentDate.getFullYear(),
  currentDate.getMonth(),
  1
);

// Populate the month dropdown.
monthNames.forEach((month, index) => {
  const option = document.createElement("option");
  option.value = index;
  option.textContent = month;
  monthSelect.appendChild(option);
});

function getCommemorativeDays(year, monthIndex) {
  return daysData.flatMap((day) => {
    const eventMonth = monthNames.indexOf(day.monthName);

    if (eventMonth !== monthIndex) {
      return [];
    }

    const date = getDateForOccurrence(
      year,
      eventMonth,
      day.dayName,
      day.occurrence
    );

    return [{
      name: day.name,
      date: date.getDate(),
    }];
  });
}

function displayCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  currentMonth.textContent = currentDate.toLocaleDateString(
    "en-GB",
    { month: "long", year: "numeric" }
  );

  monthSelect.value = String(month);
  yearInput.value = String(year);

  // Remove previously generated date boxes,
  // keeping the seven weekday headings.
  calendar.querySelectorAll(".calendar-day").forEach((box) => {
    box.remove();
  });

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const commemorativeDays = getCommemorativeDays(year, month);

  // Add empty boxes before the first day.
  for (let i = 0; i < firstWeekday; i++) {
    const emptyBox = document.createElement("div");
    emptyBox.className = "calendar-day";
    emptyBox.setAttribute("aria-hidden", "true");
    calendar.appendChild(emptyBox);
  }

  // Generate every day in the month.
  for (let day = 1; day <= daysInMonth; day++) {
    const dayBox = document.createElement("div");
    dayBox.className = "calendar-day";

    const dayNumber = document.createElement("span");
    dayNumber.className = "day-number";
    dayNumber.textContent = day;
    dayBox.appendChild(dayNumber);

    const events = commemorativeDays.filter(
      (event) => event.date === day
    );

    events.forEach((event) => {
      const eventLabel = document.createElement("span");
      eventLabel.className = "commemorative-day";
      eventLabel.textContent = event.name;
      dayBox.appendChild(eventLabel);
    });

    calendar.appendChild(dayBox);
  }

  // Complete the final week without adding an extra
  // row when the month already ends on Saturday.
  const dateBoxes = firstWeekday + daysInMonth;
  const trailingBoxes = (7 - (dateBoxes % 7)) % 7;

  for (let i = 0; i < trailingBoxes; i++) {
    const emptyBox = document.createElement("div");
    emptyBox.className = "calendar-day";
    emptyBox.setAttribute("aria-hidden", "true");
    calendar.appendChild(emptyBox);
  }
}

previousButton.addEventListener("click", () => {
  currentDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1,
    1
  );

  displayCalendar();
});

nextButton.addEventListener("click", () => {
  currentDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    1
  );

  displayCalendar();
});

datePicker.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!yearInput.checkValidity()) {
    yearInput.reportValidity();
    return;
  }

  const year = Number(yearInput.value);
  const month = Number(monthSelect.value);

  if (!Number.isSafeInteger(year)) {
    yearInput.reportValidity();
    return;
  }

  currentDate = new Date(year, month, 1);

  // JavaScript treats years 0–99 specially in this constructor.
  // Correct those years so the selector works consistently.
  currentDate.setFullYear(year);

  displayCalendar();
});

displayCalendar();
