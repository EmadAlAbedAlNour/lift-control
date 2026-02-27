import assert from "node:assert/strict";
import test from "node:test";

import {
  PROJECT_STATUS_LABELS_AR,
  PROJECT_STATUS_VALUES,
  PROJECT_TYPE_LABELS_LONG_AR,
  PROJECT_TYPE_LABELS_SHORT_AR,
  PROJECT_TYPE_VALUES
} from "../lib/constants/projects";

test("project status constants stay in sync", () => {
  assert.deepEqual(PROJECT_STATUS_VALUES, ["new", "planned", "in_progress", "completed"]);

  for (const status of PROJECT_STATUS_VALUES) {
    assert.ok(PROJECT_STATUS_LABELS_AR[status].length > 0);
  }
});

test("project type constants stay in sync", () => {
  assert.deepEqual(PROJECT_TYPE_VALUES, ["passenger", "cargo", "panoramic", "hospital"]);

  for (const type of PROJECT_TYPE_VALUES) {
    assert.ok(PROJECT_TYPE_LABELS_SHORT_AR[type].length > 0);
    assert.ok(PROJECT_TYPE_LABELS_LONG_AR[type].length > 0);
  }
});
