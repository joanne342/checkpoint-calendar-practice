import {
  getDateForOccurrence,
  getCommemorativeDayDate,
  getDaysForDate
} from "./common.mjs";

import assert from "node:assert/strict";
import test from "node:test";

test("finds the second Tuesday in October 2024", () => {
    assert.equal(getDateForOccurrence(2024, 9, 2, "second"), 8);
});

test("finds the last Friday in October 2024", () => {
    assert.equal(getDateForOccurrence(2024, 9, 5, "last"), 25);
});

test("finds Ada Lovelace Day in October 2025", () => {
    const adaDay = {
        name: "Ada Lovelace Day",
        monthName: "October",
        dayName: "Tuesday",
        occurrence: "second"
    };

    assert.equal(getCommemorativeDayDate(adaDay, 2025), 14);
});

test("finds commemorative days for a particular calendar date", () => {
    const days = [
        {
            name: "Ada Lovelace Day",
            monthName: "October",
            dayName: "Tuesday",
            occurrence: "second"
        },
        {
            name: "World Lemur Day",
            monthName: "October",
            dayName: "Friday",
            occurrence: "last"
        }
    ];

    const result = getDaysForDate(days, 2024, 9, 8);

    assert.deepEqual(result.map((day) => day.name), [
        "Ada Lovelace Day"
    ]);
});
