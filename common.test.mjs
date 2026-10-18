
import assert from "node:assert/strict";
import test from "node:test";

import { getDateForOccurrence } from "./common.mjs";

test("finds Ada Lovelace Day in October 2024", () => {
  const date = getDateForOccurrence(
    2024, 9, "Tuesday", "second"
  );

  assert.equal(date.getFullYear(), 2024);
  assert.equal(date.getMonth(), 9);
  assert.equal(date.getDate(), 8);
});

test("finds Ada Lovelace Day in October 2025", () => {
  const date = getDateForOccurrence(
    2025, 9, "Tuesday", "second"
  );

  assert.equal(date.getDate(), 14);
});

test("finds International Binturong Day in May 2030", () => {
  const date = getDateForOccurrence(
    2030, 4, "Saturday", "second"
  );

  assert.equal(date.getDate(), 11);
});

test("finds World Lemur Day in October 2024", () => {
  const date = getDateForOccurrence(
    2024, 9, "Friday", "last"
  );

  assert.equal(date.getDate(), 25);
});

test("rejects an invalid weekday", () => {
  assert.throws(
    () => getDateForOccurrence(
      2024, 9, "Funday", "second"
    ),
    /Unknown weekday/
  );
});
