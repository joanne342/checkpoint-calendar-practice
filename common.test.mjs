```javascript
// Import Node.js's strict assertion module.
// This provides methods for checking whether values match expected results
// and whether functions behave as expected when errors occur.
import assert from "node:assert/strict";

// Import Node.js's built-in test runner.
// This allows individual tests to be defined and executed using the
// `node --test` command without needing an external testing library.
import test from "node:test";

// Import the function being tested from the common.mjs module.
// This is the function responsible for calculating the date of a specific
// occurrence of a weekday within a given month.
import { getDateForOccurrence } from "./common.mjs";


// Test that the function correctly finds Ada Lovelace Day in October 2024.
// Ada Lovelace Day is observed on the second Tuesday of October.
//
// The function is called with:
// - 2024: The year.
// - 9: The month index for October, because JavaScript months start at 0.
// - "Tuesday": The weekday to find.
// - "second": The occurrence of that weekday within the month.
test("finds Ada Lovelace Day in October 2024", () => {
  // Calculate the date of the second Tuesday in October 2024.
  const date = getDateForOccurrence(
    2024, 9, "Tuesday", "second"
  );

  // Check that the returned date belongs to the year 2024.
  // getFullYear() returns the full year represented by the Date object.
  assert.equal(date.getFullYear(), 2024);

  // Check that the returned date belongs to October.
  // getMonth() returns a zero-based month index, so October is 9.
  assert.equal(date.getMonth(), 9);

  // Check that the calculated day of the month is the 8th.
  // The second Tuesday of October 2024 falls on 8 October.
  assert.equal(date.getDate(), 8);
});


// Test that the function correctly finds Ada Lovelace Day in October 2025.
// This checks that the same weekday-and-occurrence calculation works for
// a different year, where the calendar dates fall on different days.
//
// The second Tuesday of October 2025 falls on 14 October.
test("finds Ada Lovelace Day in October 2025", () => {
  // Calculate the date of the second Tuesday in October 2025.
  const date = getDateForOccurrence(
    2025, 9, "Tuesday", "second"
  );

  // Check that the calculated day of the month is the 14th.
  // This verifies that the function accounts for the different calendar
  // arrangement in 2025 rather than returning the same date as in 2024.
  assert.equal(date.getDate(), 14);
});


// Test that the function correctly finds International Binturong Day
// in May 2030.
//
// The function is asked to find the second Saturday of May 2030.
// May is represented by the month index 4 because January is index 0.
//
// The second Saturday of May 2030 falls on 11 May.
test("finds International Binturong Day in May 2030", () => {
  // Calculate the date of the second Saturday in May 2030.
  const date = getDateForOccurrence(
    2030, 4, "Saturday", "second"
  );

  // Check that the returned date falls on the 11th day of the month.
  // This confirms that the function correctly handles a different month,
  // weekday, occurrence, and year.
  assert.equal(date.getDate(), 11);
});


// Test that the function correctly finds the last Friday of October 2024.
// Unlike the previous tests, which request the second occurrence of a weekday,
// this test exercises the special "last" occurrence calculation.
//
// The final Friday of October 2024 falls on 25 October.
test("finds World Lemur Day in October 2024", () => {
  // Calculate the date of the last Friday in October 2024.
  // Passing "last" tells the function to work backwards from the final
  // day of the month to find the requested weekday.
  const date = getDateForOccurrence(
    2024, 9, "Friday", "last"
  );

  // Check that the calculated day of the month is the 25th.
  // This verifies that the function correctly identifies the final
  // occurrence of a weekday rather than counting forwards from the start.
  assert.equal(date.getDate(), 25);
});


// Test that the function rejects a weekday name that is not recognised.
// This checks the error-handling behaviour of the function, ensuring that
// invalid input is reported instead of producing an incorrect date.
test("rejects an invalid weekday", () => {
  // Assert that calling the function with the invalid weekday "Funday"
  // throws an error containing the text "Unknown weekday".
  //
  // The function call is wrapped in an arrow function because assert.throws()
  // needs a function to execute so that it can capture and inspect the error.
  //
  // The regular expression /Unknown weekday/ checks that the error message
  // contains this text, without requiring the entire message to match exactly.
  assert.throws(
    () => getDateForOccurrence(
      2024, 9, "Funday", "second"
    ),
    /Unknown weekday/
  );
});
```
