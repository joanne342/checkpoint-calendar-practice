
const weekdayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function getDateForOccurrence(
  year,
  monthIndex,
  dayName,
  occurrence
) {
  const targetWeekday = weekdayNames.indexOf(dayName);

  if (targetWeekday === -1) {
    throw new Error(`Unknown weekday: ${dayName}`);
  }

  const firstDay = new Date(year, monthIndex, 1);

  if (occurrence === "last") {
    const lastDay = new Date(year, monthIndex + 1, 0);

    const difference =
      (lastDay.getDay() - targetWeekday + 7) % 7;

    return new Date(
      year,
      monthIndex,
      lastDay.getDate() - difference
    );
  }

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

  const difference =
    (targetWeekday - firstDay.getDay() + 7) % 7;

  const dayOfMonth =
    1 + difference + (occurrenceNumber - 1) * 7;

  const result = new Date(year, monthIndex, dayOfMonth);

  if (result.getMonth() !== monthIndex) {
    throw new Error(
      `${occurrence} ${dayName} does not exist in this month`
    );
  }

  return result;
}
