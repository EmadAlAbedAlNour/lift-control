import assert from "node:assert/strict";
import test from "node:test";

import { roleAllows } from "../lib/data-access/users";

test("roleAllows enforces hierarchy correctly", () => {
  assert.equal(roleAllows("admin", ["admin"]), true);
  assert.equal(roleAllows("admin", ["supervisor"]), true);
  assert.equal(roleAllows("supervisor", ["admin"]), false);
  assert.equal(roleAllows("supervisor", ["user"]), true);
  assert.equal(roleAllows("user", ["supervisor"]), false);
});
