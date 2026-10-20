// Store the names of the days of the week in the order used by JavaScript's Date object.
// The getDay() method returns a number from 0 to 6, where Sunday is 0 and Saturday is 6.
// This array allows us to convert a weekday name into its corresponding numerical value.
const weekdayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Function to calculate the date of a specific occurrence of a weekday within a given month.
// For example, this can return the date of the first Monday, third Friday, or last Sunday
// of a particular month.
//
// Parameters:
// year       - The year to search within (e.g. 2026).
// monthIndex - The month to search within, using JavaScript's zero-based month indexing
//              (January = 0, February = 1, ..., December = 11).
// dayName    - The name of the weekday to find (e.g. "Monday").
// occurrence - The occurrence of that weekday to find ("first", "second", "third",
//              "fourth", "fifth", or "last").
//
// Returns:
// A JavaScript Date object representing the requested date.
//
// Throws:
// An error if the weekday or occurrence is invalid, or if the requested occurrence
// does not exist within the specified month.
export function getDateForOccurrence(
  year,
  monthIndex,
  dayName,
  occurrence
) {
  // Find the numerical index of the requested weekday in the weekdayNames array.
  // For example, "Sunday" returns 0, "Monday" returns 1, and "Saturday" returns 6.
  // If the supplied name is not found, indexOf() returns -1.
  const targetWeekday = weekdayNames.indexOf(dayName);

  // Check whether the supplied weekday name is valid.
  // Throw an error rather than continuing with an invalid weekday value,
  // which would otherwise produce an incorrect date.
  if (targetWeekday === -1) {
    throw new Error(`Unknown weekday: ${dayName}`);
  }

  // Create a Date object representing the first day of the specified month.
  // JavaScript automatically handles the zero-based month index supplied here.
  // Calling getDay() on this date will tell us which weekday the month begins on.
  const firstDay = new Date(year, monthIndex, 1);

  // Handle the special case where the requested occurrence is the final
  // instance of the specified weekday in the month.
  // For example, this could find the last Friday of October 2026.
  if (occurrence === "last") {
    // Create a Date object representing the final day of the specified month.
    // Passing day 0 of the following month automatically returns the last day
    // of the current month, accounting for different month lengths and leap years.
    const lastDay = new Date(year, monthIndex + 1, 0);

    // Calculate how many days we need to move backwards from the final day of
    // the month to reach the requested weekday.
    //
    // lastDay.getDay() returns the weekday index of the final day.
    // Subtracting targetWeekday gives the difference between the two weekdays.
    // Adding 7 and taking the remainder (%) ensures the result is between 0 and 6,
    // so we always move backwards by the correct number of days.
    //
    // If the final day already falls on the requested weekday, the difference is 0,
    // meaning the final day itself is the requested occurrence.
    const difference =
      (lastDay.getDay() - targetWeekday + 7) % 7;

    // Return a Date object for the requested weekday.
    // Subtract the calculated difference from the final day of the month
    // to find the last occurrence of that weekday.
    return new Date(
      year,
      monthIndex,
      lastDay.getDate() - difference
    );
  }

  // Convert the requested occurrence into a numerical position within the month.
  // For example, "first" becomes 1, "second" becomes 2, and so on.
  // This allows the calculation below to work with a number rather than a string.
  //
  // The object lookup returns undefined if the supplied occurrence is not one
  // of the supported values: "first", "second", "third", "fourth", or "fifth".
  const occurrenceNumber = {
    first: 1,
    second: 2,
    third: 3,
    fourth: 4,
    fifth: 5,
  }[occurrence];

  // Validate the requested occurrence.
  // If the lookup did not return a valid occurrence number, throw an error
  // instead of attempting to calculate a date using an invalid value.
  if (!occurrenceNumber) {
    throw new Error(`Unknown occurrence: ${occurrence}`);
  }

  // Calculate the number of days between the first day of the month
  // and the first occurrence of the requested weekday.
  //
  // targetWeekday is the numerical index of the requested weekday.
  // firstDay.getDay() is the numerical index of the weekday on which the
  // month begins.
  //
  // Subtracting the two values gives the difference between the weekdays.
  // Adding 7 and using the remainder (%) ensures the result is always between
  // 0 and 6, representing the number of days to move forwards from the first
  // day of the month to reach the first requested weekday.
  //
  // If the month starts on the requested weekday, the difference is 0,
  // meaning the first occurrence falls on the first day of the month.
  const difference =
    (targetWeekday - firstDay.getDay() + 7) % 7;

  // Calculate the day number within the month for the requested occurrence.
  //
  // Start with day 1, then add the difference to reach the first occurrence
  // of the requested weekday.
  //
  // Each subsequent occurrence is exactly 7 days later, so multiply the
  // number of additional weeks by 7 and add it to the first occurrence.
  //
  // For example, if the first Monday falls on day 5:
  // - First Monday  = 5
  // - Second Monday = 5 + 7  = 12
  // - Third Monday  = 5 + 14 = 19
  // - Fourth Monday = 5 + 21 = 26
  const dayOfMonth =
    1 + difference + (occurrenceNumber - 1) * 7;

  // Create a Date object using the calculated day of the month.
  // JavaScript will automatically roll dates into the following month if the
  // requested day exceeds the number of days in the specified month.
  // The validation below checks for this situation.
  const result = new Date(year, monthIndex, dayOfMonth);

  // Check whether the calculated date falls outside the requested month.
  // JavaScript normalises invalid day numbers automatically; for example,
  // the 35th day of a month may become a date in the following month.
  //
  // If the resulting month differs from the requested month, the requested
  // occurrence does not exist within that month.
  // For example, some months do not contain a fifth occurrence of a weekday.
  //
  // Comparing getMonth() with monthIndex detects this rollover because
  // both values use zero-based month indexing.
  if (result.getMonth() !== monthIndex) {
    throw new Error(
      `${occurrence} ${dayName} does not exist in this month`
    );
  }

  // Return the calculated Date object now that the requested occurrence
  // has been validated as belonging to the specified month.
  return result;
}
