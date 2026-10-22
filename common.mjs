const weekdayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function getDateForOccurrence(year, monthIndex, dayName, occurrence) {
  const targetWeekday = weekdayNames.indexOf(dayName);

  if (targetWeekday === -1) {
    throw new Error(`Unknown weekday: ${dayName}`);
  }

  if (occurrence === "last") {
    const lastDay = new Date(0);
    lastDay.setFullYear(year, monthIndex + 1, 0);
    lastDay.setHours(12, 0, 0, 0);

    const difference = (lastDay.getDay() - targetWeekday + 7) % 7;

    const result = new Date(0);
    result.setFullYear(year, monthIndex, lastDay.getDate() - difference);
    result.setHours(12, 0, 0, 0);
    return result;
  }

  const firstDay = new Date(0);
  firstDay.setFullYear(year, monthIndex, 1);
  firstDay.setHours(12, 0, 0, 0);

  const occurrenceNumber = {
    first: 1,
    second: 2,
    third: 3,
    fourth: 4,
    fifth: 5,
  }[occurrence];

  if (!occurrenceNumber) {
    throw new Error(`Unknown occurrence: ${occurrence}`);
  }

  const difference = (targetWeekday - firstDay.getDay() + 7) % 7;

  const dayOfMonth = 1 + difference + (occurrenceNumber - 1) * 7;

  const result = new Date(0);
  result.setFullYear(year, monthIndex, dayOfMonth);
  result.setHours(12, 0, 0, 0);

  if (result.getMonth() !== monthIndex || result.getFullYear() !== year) {
    throw new Error(`${occurrence} ${dayName} does not exist in this month`);
  }

  return result;
}
