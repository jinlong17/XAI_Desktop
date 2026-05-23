/**
 * migrate stub tests — AC-MIG-1..3
 */

import { describe, it, expect } from "vitest";
import { migrate } from "../internal/migrate.js";
import { _getMigrationCount } from "../internal/migrate.js";

describe("AC-MIG-1: migrate(1, 2) returns void and does not throw", () => {
  it("callable forward-compat — no throw", () => {
    expect(() => migrate(1, 2)).not.toThrow();
  });

  it("returns void (undefined)", () => {
    expect(migrate(1, 2)).toBeUndefined();
  });
});

describe("AC-MIG-2: migrate(1, 1) returns void — identity case", () => {
  it("no throw on same-version migration", () => {
    expect(() => migrate(1, 1)).not.toThrow();
  });
});

describe("AC-MIG-3: migrate is exported from public surface", () => {
  it("migrate is a function", () => {
    expect(typeof migrate).toBe("function");
  });
});

describe("v1 migration count is zero", () => {
  it("_getMigrationCount() === 0 in v1", () => {
    expect(_getMigrationCount()).toBe(0);
  });
});
