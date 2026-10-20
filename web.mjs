// Import the commemorative day data from days.json.
// The JSON import attribute tells JavaScript to treat the imported file as JSON.
//
// Each entry is expected to contain information about a commemorative day,
// including its name, month, weekday, and occurrence within that month.
// This data is used to determine which events should appear on the calendar.
import daysData from "./days.json" with { type: "json" };

// Import the shared function that calculates the date of a particular
// occurrence of a weekday within a specified month and year.
//
// For example, this function can calculate the date of the second Tuesday
// in October or the last Friday in a particular month.
// Reusing the shared function ensures that the calendar uses the same
// date-calculation logic as the other parts of the application.
import { getDateForOccurrence } from "./common.mjs";


// Find the HTML element that will contain the calendar grid.
// Individual calendar-day cells will be added to this element dynamically.
const calendar = document.querySelector("#calendar");

// Find the HTML element that displays the currently selected month and year.
// This heading will be updated whenever the user changes the displayed month.
const currentMonth = document.querySelector("#current-month");

// Find the button used to navigate to the previous month.
const previousButton = document.querySelector("#previous-month");

// Find the button used to navigate to the next month.
const nextButton = document.querySelector("#next-month");

// Find the form that allows the user to jump directly to a selected month and year.
const datePicker = document.querySelector("#date-picker");

// Find the dropdown used to select a month.
const monthSelect = document.querySelector("#month-select");

// Find the input used to enter the year.
const yearInput = document.querySelector("#year-input");


// Store the names of the months in calendar order.
//
// JavaScript uses zero-based month indexing, meaning January is 0 and December
// is 11. This array allows month names to be displayed to the user and converted
// into the numerical month indices required by JavaScript's Date object.
const monthNames = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December"
];


// Initialise the calendar to the current date.
// new Date() creates a Date object representing the current date and time.
let currentDate = new Date();

// Set the day of the month to 1, making currentDate represent the first day
// of the current month.
//
// Keeping the selected date on the first of the month simplifies navigation,
// because moving backwards or forwards by one month will not accidentally
// overflow into another month due to the number of days in the selected month.
currentDate.setDate(1);


// Populate the month dropdown with an option for each month of the year.
//
// forEach() loops through every entry in monthNames.
// The month name is provided as "month", and its zero-based position
// in the array is provided as "index".
monthNames.forEach((month, index) => {

  // Create a new HTML <option> element for the current month.
  const option = document.createElement("option");

  // Set the option's value to the numerical month index.
  // For example, January has the value "0" and December has the value "11".
  // The value is stored as a string because HTML form controls use string values.
  option.value = index;

  // Set the visible text of the option to the month name.
  // For example, the user will see "January" in the dropdown.
  option.textContent = month;

  // Add the new option to the month dropdown so that it becomes available
  // for the user to select.
  monthSelect.appendChild(option);
});


// Function to retrieve the commemorative days that fall within a specified
// year and month.
//
// Parameters:
// year       - The year for which commemorative dates should be calculated.
// monthIndex - The zero-based month index, where January is 0 and December is 11.
//
// Returns:
// An array of objects containing the name and day number of each commemorative
// day that belongs to the requested month.
//
// This function uses the shared date-calculation function rather than storing
// fixed calendar dates, allowing recurring commemorative days to be calculated
// correctly for different years.
function getCommemorativeDays(year, monthIndex) {

  // Use flatMap() to process every entry in daysData and combine the results
  // into a single array.
  //
  // Unlike map(), flatMap() allows each entry to return an empty array when
  // it does not belong to the requested month. These empty arrays are flattened
  // away, leaving only the commemorative days that match the selected month.
  return daysData.flatMap((day) => {

    // Convert the month name from the current data entry into its numerical
    // month index by searching for it in the monthNames array.
    //
    // For example, "October" corresponds to index 9.
    const eventMonth = monthNames.indexOf(day.monthName);

    // Check whether this commemorative day belongs to the requested month.
    //
    // If the month indices do not match, return an empty array.
    // This excludes the event from the results without needing to calculate
    // its date for the selected month.
    if (eventMonth !== monthIndex) {
      return [];
    }

    // Calculate the actual date of the commemorative day for the requested year.
    //
    // The function receives:
    // - year: The year currently being displayed.
    // - eventMonth: The month in which the commemorative day occurs.
    // - day.dayName: The weekday on which the event falls.
    // - day.occurrence: The occurrence of that weekday, such as "second" or "last".
    //
    // For example, if the data describes the second Tuesday of October,
    // this calculates which date that falls on in the selected year.
    const date = getDateForOccurrence(
      year,
      eventMonth,
      day.dayName,
      day.occurrence
    );

    // Return an object containing the commemorative day's name and its
    // numerical day of the month.
    //
    // date.getDate() returns the day number from 1 to 31.
    // Storing only the day number is sufficient because the year and month
    // are already known from the calendar currently being displayed.
    //
    // The object is wrapped in an array because flatMap() expects each
    // callback result to be an array-like collection of results.
    return [{
      name: day.name,
      date: date.getDate()
    }];
  });
}


// Function to create a blank calendar cell.
//
// Blank cells are needed when the first day of the month does not fall on
// the first weekday column of the calendar. They can also be used to complete
// the final week so that the grid remains aligned into seven-day rows.
//
// Returns:
// An empty HTML <div> element with the appropriate calendar CSS classes.
function createEmptyCell() {

  // Create a new <div> element to act as an empty calendar cell.
  const cell = document.createElement("div");

  // Assign the CSS classes used to style calendar cells and distinguish
  // empty cells from cells containing actual dates.
  cell.className = "calendar-day empty-day";

  // Mark the empty cell as hidden from assistive technologies.
  // Since the cell does not contain a date or meaningful content, this
  // prevents screen readers from treating it as a meaningful calendar item.
  cell.setAttribute("aria-hidden", "true");

  // Return the completed empty cell so that it can be added to the calendar.
  return cell;
}


// Function to generate and display the calendar for the currently selected
// month and year.
//
// This function updates the month heading, synchronises the form controls,
// removes the previous calendar dates, calculates the required commemorative
// events, and creates the new calendar grid.
//
// It is called when the page first loads and whenever the user changes
// the selected month or year.
function displayCalendar() {

  // Retrieve the currently selected year from currentDate.
  const year = currentDate.getFullYear();

  // Retrieve the currently selected zero-based month index from currentDate.
  const month = currentDate.getMonth();


  // Update the visible month heading.
  //
  // toLocaleDateString() formats the date according to the supplied locale.
  // The "en-GB" locale uses British English formatting conventions.
  //
  // The options specify that the month should be displayed by its full name
  // and that the year should be displayed numerically.
  //
  // For example, the heading might display "October 2026".
  currentMonth.textContent = currentDate.toLocaleDateString(
    "en-GB",
    { month: "long", year: "numeric" }
  );


  // Synchronise the month dropdown with the month currently being displayed.
  // Converting the month index to a string ensures that it matches the
  // string values assigned to the dropdown options.
  monthSelect.value = String(month);

  // Synchronise the year input with the currently selected year.
  // This ensures that the form reflects the calendar currently on screen.
  yearInput.value = String(year);


  // Remove the date cells from the previous calendar display.
  //
  // querySelectorAll(".calendar-day") selects every element within the
  // calendar that has the "calendar-day" class, including both date cells
  // and empty alignment cells.
  //
  // forEach() removes each selected element from the document.
  //
  // The weekday headings are preserved because they do not have the
  // "calendar-day" class.
  calendar.querySelectorAll(".calendar-day").forEach((cell) => {
    cell.remove();
  });


  // Calculate the weekday on which the first day of the selected month falls.
  //
  // new Date(year, month, 1) creates a Date object for the first day
  // of the selected month.
  //
  // getDay() returns a weekday index from 0 to 6:
  // Sunday = 0, Monday = 1, ..., Saturday = 6.
  //
  // This value determines how many blank cells must appear before the
  // first date so that it sits beneath the correct weekday heading.
  const firstWeekday = new Date(year, month, 1).getDay();


  // Calculate the total number of days in the selected month.
  //
  // Passing day 0 of the following month returns the final day of the
  // current month. getDate() then returns its day number.
  //
  // This automatically accounts for months with different lengths,
  // including February in leap years.
  const daysInMonth = new Date(year, month + 1, 0).getDate();


  // Retrieve all commemorative days belonging to the selected year and month.
  //
  // Each returned object contains a commemorative day's name and numerical
  // day of the month. These events will be added to their corresponding
  // date cells below.
  const commemorativeDays = getCommemorativeDays(year, month);


  // Add blank cells before the first date to align the calendar correctly.
  //
  // The first date must appear beneath the weekday on which the month begins.
  // For example, if the month starts on a Wednesday, two blank cells are
  // needed before day 1 when the calendar starts its week on Sunday.
  //
  // The loop creates one blank cell for every weekday position before
  // the first day of the month.
  for (let i = 0; i < firstWeekday; i++) {

    // Create a blank calendar cell and append it to the calendar grid.
    calendar.appendChild(createEmptyCell());
  }


  // Generate a calendar cell for every date in the selected month.
  //
  // The loop starts at day 1 and continues until it reaches the final day
  // of the month, inclusive.
  //
  // Because daysInMonth is calculated dynamically, this works for months
  // containing 28, 29, 30, or 31 days.
  for (let day = 1; day <= daysInMonth; day++) {

    // Create a new <div> element to represent the current date.
    const cell = document.createElement("div");

    // Assign the CSS class used to style an ordinary calendar date cell.
    cell.className = "calendar-day";


    // Create a <span> element to display the numerical day of the month.
    const number = document.createElement("span");

    // Assign a CSS class so the day number can be styled independently
    // from any commemorative event labels within the same cell.
    number.className = "day-number";

    // Set the visible text to the current day number.
    // For example, the cell for the eighth day of the month displays "8".
    number.textContent = day;


    // Add the day number to the current calendar cell.
    // This ensures the date appears before any commemorative event labels.
    cell.appendChild(number);


    // Find every commemorative event that falls on the current day.
    //
    // filter() examines the commemorativeDays array and returns a new array
    // containing only events whose numerical date matches the current day.
    //
    // More than one event can occur on the same date, so the result may
    // contain multiple events rather than just one.
    const events = commemorativeDays.filter(
      (event) => event.date === day
    );


    // Loop through all commemorative events that fall on this date.
    // Each event will be displayed as a separate label within the cell.
    events.forEach((event) => {

      // Create a <span> element for the commemorative event label.
      const label = document.createElement("span");

      // Assign a CSS class so that commemorative labels can be styled
      // differently from the numerical date.
      label.className = "commemorative-day";

      // Set the label's text to the name of the commemorative event.
      // textContent inserts the name as text rather than interpreting it
      // as HTML markup.
      label.textContent = event.name;

      // Append the event label to the current date cell.
      // If several events share the same date, each label is added in turn.
      cell.appendChild(label);
    });


    // Append the completed date cell to the calendar grid.
    // At this point, the cell contains its day number and any event labels.
    calendar.appendChild(cell);
  }


  // Calculate how many calendar cells have been used so far.
  //
  // This includes both the leading blank cells and all the actual dates.
  // For example, if the month starts on Wednesday and has 31 days,
  // the number of used cells will be 3 + 31 = 34.
  const usedCells = firstWeekday + daysInMonth;


  // Calculate how many blank cells are required to complete the final week.
  //
  // A full calendar week contains seven cells.
  // usedCells % 7 returns the number of occupied positions in the final row.
  //
  // If the remainder is 0, the calendar already ends on a complete row
  // and no extra cells are required.
  //
  // Otherwise, subtract the remainder from 7 to determine how many blank
  // cells are needed to complete the row.
  //
  // The outer % 7 ensures the result is 0 when the row is already complete,
  // rather than incorrectly adding seven unnecessary cells.
  const remainingCells = (7 - (usedCells % 7)) % 7;


  // Add the required trailing blank cells to complete the final week.
  //
  // This keeps the calendar aligned in seven-column rows without creating
  // an unnecessary additional row when the final date already falls at
  // the end of a complete week.
  for (let i = 0; i < remainingCells; i++) {

    // Create and append one blank cell for each remaining position.
    calendar.appendChild(createEmptyCell());
  }
}


// Add a click event listener to the previous-month button.
//
// When the user clicks the button, the currently displayed month is moved
// back by one month, and the calendar is redrawn using the updated date.
previousButton.addEventListener("click", () => {

  // Create a new Date object representing the first day of the previous month.
  //
  // currentDate.getMonth() - 1 moves the month index backwards by one.
  // JavaScript automatically adjusts the year when moving before January.
  //
  // For example, moving backwards from January 2026 produces December 2025.
  // Setting the day to 1 avoids date overflow issues when changing months.
  currentDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1,
    1
  );

  // Redraw the calendar to display the newly selected month and year.
  displayCalendar();
});


// Add a click event listener to the next-month button.
//
// When the user clicks the button, the currently displayed month is moved
// forward by one month, and the calendar is redrawn.
nextButton.addEventListener("click", () => {

  // Create a new Date object representing the first day of the next month.
  //
  // Adding 1 to the month index moves the calendar forwards by one month.
  // JavaScript automatically adjusts the year when moving beyond December.
  //
  // For example, moving forwards from December 2026 produces January 2027.
  currentDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    1
  );

  // Redraw the calendar using the updated month and year.
  displayCalendar();
});


// Add a submit event listener to the month-and-year selection form.
//
// This allows the user to select a month from the dropdown, enter a year,
// and jump directly to that point in the calendar.
datePicker.addEventListener("submit", (event) => {

  // Prevent the browser's default form submission behaviour.
  // Without this, submitting the form could reload the page or navigate
  // away from the current document.
  event.preventDefault();


  // Read the year entered by the user and convert it into a number.
  // HTML input values are strings, so Number() is used to convert the value
  // before it is validated and used to create a Date object.
  const year = Number(yearInput.value);


  // Read the selected month from the dropdown and convert it into a number.
  // The dropdown uses zero-based month indices, matching JavaScript's Date API.
  const month = Number(monthSelect.value);


  // Validate the supplied year and month before updating the calendar.
  //
  // Number.isSafeInteger(year) checks that the year is an integer within
  // JavaScript's safe integer range.
  //
  // Number.isInteger(month) ensures that the selected month is a whole number.
  //
  // The month must be between 0 and 11, inclusive, because JavaScript uses
  // zero-based month indexing.
  //
  // yearInput.value.trim() checks that the year input is not empty or made
  // up entirely of whitespace. The ! operator makes this condition true
  // when the trimmed value is an empty string.
  //
  // If any condition is invalid, the code enters the validation block below.
  if (
    !Number.isSafeInteger(year) ||
    !Number.isInteger(month) ||
    month < 0 ||
    month > 11 ||
    !yearInput.value.trim()
  ) {

    // Ask the browser to display the year input's native validation message.
    // This is intended to provide feedback when the entered year is invalid.
    yearInput.reportValidity();

    // Stop processing the form submission.
    // The currently displayed calendar remains unchanged.
    return;
  }


  // Update the selected date to the first day of the chosen month and year.
  //
  // Using the first day avoids potential problems associated with carrying
  // a day number from the previously selected month into a month that has
  // fewer days.
  currentDate = new Date(year, month, 1);


  // Explicitly set the full year to the value entered by the user.
  //
  // JavaScript's Date constructor treats year values from 0 to 99 specially,
  // interpreting them as years in the twentieth century (1900 to 1999).
  // setFullYear() avoids that special handling for those year values.
  //
  // For ordinary four-digit years, this generally leaves the year unchanged.
  currentDate.setFullYear(year);


  // Check whether the resulting Date object represents a valid date.
  //
  // getTime() returns the timestamp in milliseconds for a valid Date.
  // If the Date is invalid, getTime() returns NaN.
  //
  // Number.isNaN() detects this invalid timestamp so the function can stop
  // before attempting to redraw the calendar.
  if (Number.isNaN(currentDate.getTime())) {
    return;
  }


  // Display the newly selected month and year.
  // This updates the heading, synchronises the form controls, and generates
  // the calendar cells and commemorative event labels for that month.
  displayCalendar();
});


// Display the current month as soon as the script runs.
//
// This initial call populates the calendar grid, updates the heading,
// and synchronises the month dropdown and year input with the current date.
// It ensures that the user sees a working calendar immediately when the
// page opens, without needing to click a navigation button first.
displayCalendar();
