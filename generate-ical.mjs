import { writeFile } from "node:fs/promises";
import daysData from "./days.json" with { type: "json" };
import { getDateForOccurrence, monthNames } from "./common.mjs";

function formatDate(date) {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

function formatTimestamp(date) {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

function escapeICalText(text) {
  return String(text)
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

const lines = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  "PRODID:-//Days Calendar//EN",
  "CALSCALE:GREGORIAN",
];

let eventCount = 0;

for (let year = 2020; year <= 2030; year++) {
  for (const day of daysData) {
    const monthIndex = monthNames.indexOf(day.monthName);

    if (monthIndex === -1) {
      throw new Error(`Unknown month: ${day.monthName}`);
    }

    const date = getDateForOccurrence(
      year,
      monthIndex,
      day.dayName,
      day.occurrence,
    );

    const dateString = formatDate(date);

    lines.push(
      "BEGIN:VEVENT",
      `UID:${year}-${monthIndex + 1}-${date.getDate()}-${eventCount}@days-calendar`,
      `DTSTAMP:${formatTimestamp(new Date())}`,
      `DTSTART;VALUE=DATE:${dateString}`,
      `SUMMARY:${escapeICalText(day.name)}`,
      "END:VEVENT",
    );

    eventCount++;
  }
}

lines.push("END:VCALENDAR");

await writeFile("days.ics", lines.join("\r\n") + "\r\n", "utf8");

console.log(`Created days.ics with ${eventCount} all-day events.`);
