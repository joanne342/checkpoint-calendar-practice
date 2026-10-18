
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
  "September", "October", "November", "December"
];

let currentDate = new Date();
currentDate.setDate(1);

// Populate the month selector.
monthNames.forEach((month, index) => {
  const option = document.createElement("option");
  option.value = index;
  option.textContent = month;
  monthSelect.appendChild(option);
});

// Calculate commemorative days using shared date logic.
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
      date: date.getDate()
    }];
  });
}

function createEmptyCell() {
  const cell = document.createElement("div");
  cell.className = "calendar-day empty-day";
  cell.setAttribute("aria-hidden", "true");
  return cell;
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

  // Remove old date cells but keep weekday headings.
  calendar.querySelectorAll(".calendar-day").forEach((cell) => {
    cell.remove();
  });

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const commemorativeDays = getCommemorativeDays(year, month);

  // Align the first day under the correct weekday.
  for (let i = 0; i < firstWeekday; i++) {
    calendar.appendChild(createEmptyCell());
  }

  // Generate the dates dynamically.
  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("div");
    cell.className = "calendar-day";

    const number = document.createElement("span");
    number.className = "day-number";
    number.textContent = day;

    cell.appendChild(number);

    const events = commemorativeDays.filter(
      (event) => event.date === day
    );

    events.forEach((event) => {
      const label = document.createElement("span");
      label.className = "commemorative-day";
      label.textContent = event.name;

      cell.appendChild(label);
    });

    calendar.appendChild(cell);
  }

  // Finish the last week without adding an unnecessary row.
  const usedCells = firstWeekday + daysInMonth;
  const remainingCells = (7 - (usedCells % 7)) % 7;

  for (let i = 0; i < remainingCells; i++) {
    calendar.appendChild(createEmptyCell());
  }
}

// Navigate to the previous month.
previousButton.addEventListener("click", () => {
  currentDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1,
    1
  );

  displayCalendar();
});

// Navigate to the next month.
nextButton.addEventListener("click", () => {
  currentDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    1
  );

  displayCalendar();
});

// Jump to a selected month and year.
datePicker.addEventListener("submit", (event) => {
  event.preventDefault();

  const year = Number(yearInput.value);
  const month = Number(monthSelect.value);

  if (
    !Number.isSafeInteger(year) ||
    !Number.isInteger(month) ||
    month < 0 ||
    month > 11 ||
    !yearInput.value.trim()
  ) {
    yearInput.reportValidity();
    return;
  }

  currentDate = new Date(year, month, 1);
  currentDate.setFullYear(year);

  if (Number.isNaN(currentDate.getTime())) {
    return;
  }

  displayCalendar();
});

// Display the current month when the page opens.
displayCalendar();
