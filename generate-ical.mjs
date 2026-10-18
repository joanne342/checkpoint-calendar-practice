
import { writeFile } from "node:fs/promises";
import daysData from "./days.json" with { type: "json" };

import { getCommemorativeDayDate } from "./common.mjs";

function escapeICal(value) {
    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/\n/g, "\\n")
        .replace(/,/g, "\\,")
        .replace(/;/g, "\\;");
}

function formatDate(year, month, day) {
    return [
        year,
        String(month + 1).padStart(2, "0"),
        String(day).padStart(2, "0")
    ].join("");
}

async function getDescription(day) {
    if (!day.descriptionURL) {
        return "";
    }

    try {
        const response = await fetch(day.descriptionURL);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return await response.text();
    } catch (error) {
        console.error(
            `Could not fetch description for ${day.name}:`,
            error.message
        );

        return "";
    }
}

async function generateICalendar() {
    const events = [];

    for (const day of daysData) {
        const description = await getDescription(day);

        for (let year = 2020; year <= 2030; year++) {
            const month = [
                "January", "February", "March", "April",
                "May", "June", "July", "August",
                "September", "October", "November", "December"
            ].indexOf(day.monthName);

            const eventDay = getCommemorativeDayDate(day, year);

            const startDate = formatDate(year, month, eventDay);

            // All-day iCalendar events use an exclusive end date:
            // the following date, with no time or timezone.
            const nextDate = new Date(year, month, eventDay + 1);

            const endDate = formatDate(
                nextDate.getFullYear(),
                nextDate.getMonth(),
                nextDate.getDate()
            );

            events.push(
                [
                    "BEGIN:VEVENT",
                    `UID:${year}-${startDate}-${escapeICal(day.name)}@days-calendar`,
                    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
                    `DTSTART;VALUE=DATE:${startDate}`,
                    `DTEND;VALUE=DATE:${endDate}`,
                    `SUMMARY:${escapeICal(day.name)}`,
                    `DESCRIPTION:${escapeICal(description)}`,
                    "END:VEVENT"
                ].join("\r\n")
            );
        }
    }

    const calendarFile = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Project Days Calendar//EN",
        "CALSCALE:GREGORIAN",
        ...events,
        "END:VCALENDAR",
        ""
    ].join("\r\n");

    await writeFile("days.ics", calendarFile, "utf8");

    console.log(`Created days.ics with ${events.length} events.`);
}

generateICalendar().catch((error) => {
    console.error("Failed to generate days.ics:", error);
    process.exitCode = 1;
});
