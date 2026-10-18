export function getGreeting() {
  return "Hello";
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const weekdays = [
  "Sunday", "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday"
];

const occurrences = {
  first: 1,
  second: 2,
  third: 3,
  fourth: 4,
  last: -1
};

export function getDateForOccurrence(year, month, weekday, occurrence) {
  const monthIndex = typeof month === "number"
    ? month
    : months.findIndex(name => name.toLowerCase() === month.toLowerCase());

  const weekdayIndex = typeof weekday === "number"
    ? weekday
    : weekdays.findIndex(name => name.toLowerCase() === weekday.toLowerCase());

  const occurrenceNumber = typeof occurrence === "number"
    ? occurrence
    : occurrences[occurrence.toLowerCase()];

  if (
    monthIndex < 0 || monthIndex > 11 ||
    weekdayIndex < 0 || weekdayIndex > 6 ||
    !Number.isInteger(occurrenceNumber) ||
    occurrenceNumber === 0 ||
    occurrenceNumber < -1 ||
    occurrenceNumber > 5
  ) {
    throw new Error("Invalid month, weekday, or occurrence");
  }

  const dates = [];
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  for (let date = 1; date <= daysInMonth; date++) {
    if (new Date(year, monthIndex, date).getDay() === weekdayIndex) {
      dates.push(date);
    }
  }

  return occurrenceNumber === -1
    ? dates[dates.length - 1]
    : dates[occurrenceNumber - 1];
}

export function getCommemorativeDayDate(day, year, weekday, occurrence) {
  // Support either a day object or separate arguments.
  if (typeof day === "string") {
    return getDateForOccurrence(year, day, weekday, occurrence);
  }

  const month = day.month;
  const dayOfWeek = day.weekday;
  const dayOccurrence = day.occurrence;

  return getDateForOccurrence(year, month, dayOfWeek, dayOccurrence);
}

  if (monthIndex === -1) {
    throw new Error(`Unknown month: ${day.month}`);
  }

  return getDateForOccurrence(
    year,
    monthIndex,
    day.weekday,
    day.occurrence
  );
}

export function getDaysForDate(days, year, month, date) {
  return days.filter(day => {
    const monthIndex = typeof month === "number"
      ? month
      : months.findIndex(
          name => name.toLowerCase() === month.toLowerCase()
        );

    const dayMonthIndex = months.findIndex(
      name => name.toLowerCase() === day.month.toLowerCase()
    );

    return (
      dayMonthIndex === monthIndex &&
      getCommemorativeDayDate(day, year) === date
    );
  });
}

    return (
      dayMonth === month &&
      getCommemorativeDayDate(day, year) === date
    );
  });
}
