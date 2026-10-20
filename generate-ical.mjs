// Import the writeFile function from Node.js's built-in file system module.
// This function allows us to write data to a file asynchronously.
// It will be used at the end of the script to create the days.ics calendar file.
import { writeFile } from "node:fs/promises";

// Import the calendar event data from days.json.
// The JSON import attribute tells Node.js that this file should be interpreted
// as JSON rather than as a JavaScript module.
//
// The imported data is expected to contain information about each special day,
// including its name, month, weekday, and occurrence within that month.
import daysData from "./days.json" with { type: "json" };

// Import the function that calculates the date of a particular occurrence
// of a weekday within a specified month and year.
//
// This allows the script to calculate the dates for recurring events, such as
// the second Tuesday of October or the last Friday of a month.
import { getDateForOccurrence } from "./common.mjs";


// Store the names of the months in calendar order.
// JavaScript uses zero-based month indexing, meaning January is 0 and December is 11.
//
// This array allows the script to convert a month name from days.json into
// the numerical month index required by getDateForOccurrence().
const monthNames = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December"
];


// Function to convert a JavaScript Date object into the YYYYMMDD format
// required for all-day event dates in an iCalendar file.
//
// For example, a Date representing 8 October 2024 becomes "20241008".
//
// Parameters:
// date - A JavaScript Date object representing the date to format.
//
// Returns:
// A string containing the year, month, and day in YYYYMMDD format.
function formatDate(date) {
  // Get the full year and convert it to a string.
  // padStart(4, "0") ensures the year contains at least four characters,
  // adding leading zeros if necessary.
  const year = String(date.getFullYear()).padStart(4, "0");

  // Get the month number from the Date object.
  // JavaScript months start at 0, so add 1 to convert them into the
  // conventional calendar month numbers, where January is 1 and December is 12.
  //
  // padStart(2, "0") ensures that single-digit months contain a leading zero.
  // For example, January becomes "01" rather than "1".
  const month = String(date.getMonth() + 1).padStart(2, "0");

  // Get the day of the month.
  // padStart(2, "0") ensures that single-digit days contain a leading zero.
  // For example, the 8th day of a month becomes "08".
  const day = String(date.getDate()).padStart(2, "0");

  // Combine the year, month, and day into a single string.
  // The resulting YYYYMMDD format is used when writing event dates
  // to the iCalendar file.
  return `${year}${month}${day}`;
}


// Function to escape special characters in calendar event text.
// The iCalendar format reserves certain characters for its own syntax,
// so characters such as backslashes, commas, and semicolons must be escaped
// when they appear as part of an event's text value.
//
// Parameters:
// text - The text value to prepare for inclusion in the calendar file.
//
// Returns:
// A string with the relevant characters escaped according to iCalendar
// text-value rules.
function escapeICalText(text) {
  // Convert the supplied value to a string first.
  // This ensures that the replacement operations can be performed even if
  // the original value is not already a string.
  return String(text)

    // Escape existing backslashes by replacing each one with two backslashes.
    // This must happen before the other replacements so that the backslashes
    // added by later operations are not escaped a second time.
    .replace(/\\/g, "\\\\")

    // Replace actual newline characters with the escaped sequence "\n".
    // This prevents a line break inside an event name from being interpreted
    // as the beginning of a new line in the iCalendar file.
    .replace(/\n/g, "\\n")

    // Escape commas because commas have a special meaning in iCalendar text
    // values and must be prefixed with a backslash when used as ordinary text.
    .replace(/,/g, "\\,")

    // Escape semicolons for the same reason: they must be prefixed with
    // a backslash when they appear as part of an event's text value.
    .replace(/;/g, "\\;");
}


// Initialise the array of lines that will make up the iCalendar file.
//
// An iCalendar file uses a structured text format, commonly saved with
// the .ics extension, which can be imported into calendar applications.
//
// Each entry in this array represents one line in the final file.
//
// These initial lines define the calendar itself, before any individual
// events are added.
const lines = [
  // Marks the beginning of the calendar component.
  "BEGIN:VCALENDAR",

  // Identifies the iCalendar format version used by this file.
  "VERSION:2.0",

  // Identifies the software or process that generated the calendar.
  // The value here is a product identifier for this calendar generator.
  "PRODID:-//Days Calendar//EN",

  // Specifies the Gregorian calendar system.
  "CALSCALE:GREGORIAN"
];


// Initialise a counter to keep track of how many events are generated.
// This value is incremented each time an event is added to the calendar.
//
// The counter is also included in each event's UID to help distinguish
// events that might otherwise have the same date.
let eventCount = 0;


// Loop through each year from 2020 to 2030, inclusive.
// This generates calendar events for an eleven-year period.
//
// The loop starts at 2020 and continues while the year is less than
// or equal to 2030. The year is increased by 1 after each iteration.
for (let year = 2020; year <= 2030; year++) {

  // Loop through every special day defined in days.json.
  // For each year, the script processes every entry in the imported data.
  //
  // For example, if days.json contains 20 special days, this loop will
  // generate 20 events for each year, provided every requested date exists.
  for (const day of daysData) {

    // Find the numerical month index corresponding to the month name
    // supplied in the current entry of days.json.
    //
    // For example:
    // - "January" returns 0.
    // - "October" returns 9.
    // - "December" returns 11.
    //
    // indexOf() returns -1 if the supplied month name is not found.
    const monthIndex = monthNames.indexOf(day.monthName);

    // Validate the month name before attempting to calculate the date.
    // If the month is not recognised, throw an error with the invalid value.
    //
    // This prevents the script from silently generating an incorrect date
    // when the JSON data contains an unknown or incorrectly spelled month.
    if (monthIndex === -1) {
      throw new Error(`Unknown month: ${day.monthName}`);
    }

    // Calculate the date of the current special day for the current year.
    //
    // The function receives:
    // - year: The year currently being processed by the outer loop.
    // - monthIndex: The zero-based index of the requested month.
    // - day.dayName: The weekday on which the event occurs.
    // - day.occurrence: Which occurrence of that weekday is required.
    //
    // For example, if the entry describes the second Tuesday of October,
    // this calculates the correct date for October in the current year.
    //
    // If the requested occurrence does not exist in that month, the
    // imported function throws an error and execution stops.
    const date = getDateForOccurrence(
      year,
      monthIndex,
      day.dayName,
      day.occurrence
    );

    // Convert the calculated date into the YYYYMMDD format expected
    // by the all-day event date property in an iCalendar file.
    const dateString = formatDate(date);

    // Add a new calendar event to the lines array.
    //
    // Each event is represented by a block beginning with BEGIN:VEVENT
    // and ending with END:VEVENT. The lines between these markers describe
    // the event's unique identifier, creation timestamp, date, and title.
    //
    // push() adds all the supplied strings to the array in the order given.
    lines.push(

      // Mark the beginning of an individual calendar event.
      "BEGIN:VEVENT",

      // Create a unique identifier (UID) for this event.
      //
      // The identifier includes:
      // - The year.
      // - The one-based month number.
      // - The day of the month.
      // - The current event counter.
      //
      // The counter helps distinguish events that share the same date.
      // The @days-calendar portion identifies the UID's domain-like suffix.
      // A production calendar may benefit from using a stable identifier
      // so that events can be recognised across regenerated calendar files.
      `UID:${year}-${monthIndex + 1}-${date.getDate()}-${eventCount}@days-calendar`,

      // Add the DTSTAMP property, which records the event's creation
      // or last revision timestamp in iCalendar format.
      //
      // formatDate(new Date()) produces the current local calendar date
      // in YYYYMMDD format, after which T000000Z is appended to represent
      // midnight UTC.
      //
      // Note that this is a date-based timestamp rather than the exact
      // current time, and the Z indicates UTC.
      `DTSTAMP:${formatDate(new Date())}T000000Z`,

      // Set the event's start date as an all-day event.
      //
      // VALUE=DATE indicates that the value represents a calendar date
      // rather than a date-and-time value.
      //
      // The date is written in YYYYMMDD format, with no time component.
      `DTSTART;VALUE=DATE:${dateString}`,

      // Set the event's title using the name supplied in days.json.
      //
      // escapeICalText() protects special characters in the name so that
      // commas, semicolons, backslashes, and newline characters do not
      // interfere with the structure of the iCalendar file.
      `SUMMARY:${escapeICalText(day.name)}`,

      // Mark the end of the individual calendar event.
      "END:VEVENT"
    );

    // Increase the event counter by one after successfully adding the event.
    // This ensures that the next event receives a different counter value
    // as part of its UID.
    eventCount++;
  }
}


// Add the closing calendar marker after every event has been generated.
// This completes the overall VCALENDAR component and marks the end of the
// iCalendar document.
lines.push("END:VCALENDAR");


// Write the completed calendar to a file named days.ics.
//
// lines.join("\r\n") combines all array entries into a single text string,
// separating each line with CRLF characters (carriage return + line feed),
// as required by the iCalendar content-line format.
//
// The final "\r\n" adds a line ending after the closing calendar marker.
//
// The third argument, "utf8", specifies the character encoding used to
// write the file, allowing ordinary Unicode text to be represented.
//
// Because writeFile() is asynchronous, await ensures that the script waits
// for the file-writing operation to complete before continuing.
await writeFile("days.ics", lines.join("\r\n") + "\r\n", "utf8");


// Print a confirmation message to the console once the file has been written.
// eventCount reports the total number of calendar events added across
// all years and all entries in days.json.
console.log(`Created days.ics with ${eventCount} all-day events.`);
