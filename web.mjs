
import { getDaysForDate } from "./common.mjs";

const today = new Date();

let displayedMonth = today.getMonth();
let displayedYear = today.getFullYear();

const monthSelect = document.querySelector("#month-select");
const yearSelect = document.querySelector("#year-select");
const currentMonth = document.querySelector("#current-month");
const calendar = document.querySelector("#calendar");
const previousButton = document.querySelector("#previous-month");
const nextButton = document.querySelector("#next-month");
const descriptionPanel = document.querySelector("#day-description");
const descriptionText = document.querySelector("#description-text");
const calendarError = document.querySelector("#calendar-error");

const months = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
];

let commemorativeDays = [];

async function loadDays() {
    try {
        const response = await fetch("./days.json");

        if (!response.ok) {
            throw new Error("Could not load days.json");
        }

        commemorativeDays = await response.json();
        renderCalendar();
    } catch (error) {
        calendarError.textContent =
            "The commemorative days could not be loaded. Please try again.";
        console.error(error);
    }
}

function populateMonthSelect() {
    months.forEach((month, index) => {
        const option = document.createElement("option");

        option.value = index;
        option.textContent = month;

        monthSelect.appendChild(option);
    });
}

function populateYearSelect() {
    // Keep the selector useful for jumping to a month,
    // while allowing navigation beyond this range.
    for (
        let year = today.getFullYear() - 10;
        year <= today.getFullYear() + 10;
        year++
    ) {
        const option = document.createElement("option");

        option.value = year;
        option.textContent = year;

        yearSelect.appendChild(option);
    }
}

function syncSelectors() {
    // Add years outside the original selector range when needed.
    if (!Array.from(yearSelect.options).some(
        (option) => Number(option.value) === displayedYear
    )) {
        const option = document.createElement("option");

        option.value = displayedYear;
        option.textContent = displayedYear;
        yearSelect.add(option);
    }

    monthSelect.value = String(displayedMonth);
    yearSelect.value = String(displayedYear);
}

async function showDescription(day) {
    descriptionPanel.hidden = false;
    descriptionText.textContent = "Loading description…";

    try {
        const response = await fetch(day.descriptionURL);

        if (!response.ok) {
            throw new Error("Could not load the description");
        }

        descriptionText.textContent = await response.text();
    } catch (error) {
        descriptionText.textContent =
            "Sorry, the description is currently unavailable.";
        console.error(error);
    }
}

function renderCalendar() {
    calendarError.textContent = "";

    // Preserve Prakash's seven weekday headings.
    while (calendar.children.length > 7) {
        calendar.lastElementChild.remove();
    }

    currentMonth.textContent =
        `${months[displayedMonth]} ${displayedYear}`;

    syncSelectors();

    const firstDay = new Date(
        displayedYear,
        displayedMonth,
        1
    ).getDay();

    const daysInMonth = new Date(
        displayedYear,
        displayedMonth + 1,
        0
    ).getDate();

    // Add blank cells before the first day of the month.
    for (let i = 0; i < firstDay; i++) {
        const emptyBox = document.createElement("div");

        emptyBox.className = "calendar-day empty";
        emptyBox.setAttribute("aria-hidden", "true");

        calendar.appendChild(emptyBox);
    }

    // Generate the dates and any commemorative days dynamically.
    for (let day = 1; day <= daysInMonth; day++) {
        const dayBox = document.createElement("div");
        dayBox.className = "calendar-day";

        const dayNumber = document.createElement("div");
        dayNumber.textContent = day;
        dayBox.appendChild(dayNumber);

        if (
            day === today.getDate() &&
            displayedMonth === today.getMonth() &&
            displayedYear === today.getFullYear()
        ) {
            dayBox.classList.add("today");
            dayBox.setAttribute("aria-current", "date");
        }

        const daysOnThisDate = getDaysForDate(
            commemorativeDays,
            displayedYear,
            displayedMonth,
            day
        );

        daysOnThisDate.forEach((commemorativeDay) => {
            const eventButton = document.createElement("button");

            eventButton.type = "button";
            eventButton.className = "commemorative-day";
            eventButton.textContent = commemorativeDay.name;

            eventButton.addEventListener("click", () => {
                showDescription(commemorativeDay);
            });

            dayBox.appendChild(eventButton);
        });

        calendar.appendChild(dayBox);
    }

    // Complete the final week without adding an unnecessary row.
    const dateCells = calendar.children.length - 7;
    const emptyBoxes = (7 - (dateCells % 7)) % 7;

    for (let i = 0; i < emptyBoxes; i++) {
        const emptyBox = document.createElement("div");

        emptyBox.className = "calendar-day empty";
        emptyBox.setAttribute("aria-hidden", "true");

        calendar.appendChild(emptyBox);
    }
}

previousButton.addEventListener("click", () => {
    displayedMonth--;

    if (displayedMonth < 0) {
        displayedMonth = 11;
        displayedYear--;
    }

    descriptionPanel.hidden = true;
    renderCalendar();
});

nextButton.addEventListener("click", () => {
    displayedMonth++;

    if (displayedMonth > 11) {
        displayedMonth = 0;
        displayedYear++;
    }

    descriptionPanel.hidden = true;
    renderCalendar();
});

monthSelect.addEventListener("change", () => {
    displayedMonth = Number(monthSelect.value);
    descriptionPanel.hidden = true;
    renderCalendar();
});

yearSelect.addEventListener("change", () => {
    displayedYear = Number(yearSelect.value);
    descriptionPanel.hidden = true;
    renderCalendar();
});

populateMonthSelect();
populateYearSelect();
syncSelectors();
loadDays();
