import assert from "node:assert/strict";
import test from "node:test";

import { addDaysKey, toDateKey, toUtcDateFromDateKey } from "../lib/utils/date";

test("toDateKey returns YYYY-MM-DD for local date", () => {
  const value = new Date("2026-02-26T12:30:00");
  assert.equal(toDateKey(value), "2026-02-26");
});

test("addDaysKey offsets the date key by the requested days", () => {
  const start = new Date("2026-02-26T12:30:00");
  assert.equal(addDaysKey(start, 7), "2026-03-05");
});

test("toUtcDateFromDateKey uses 08:00 UTC by default", () => {
  const value = toUtcDateFromDateKey("2026-02-26");
  assert.equal(value.toISOString(), "2026-02-26T08:00:00.000Z");
});
