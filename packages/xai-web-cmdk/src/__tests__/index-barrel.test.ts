/**
 * index-barrel — IB1..IB3 (P1-stage exports)
 * api.md §0 + test.md §3 P1
 */
import { describe, it, expect } from "vitest";
import * as barrel from "../index.js";

describe("index-barrel (P1)", () => {
  it("IB1 — barrel exports type-related identifiers (registerSearchAdapter present)", () => {
    // SearchHit, SearchHitKind, ModuleSearchAdapter are type exports
    // We verify the runtime exports that back them
    expect(typeof barrel.registerSearchAdapter).toBe("function");
  });

  it("IB2 — barrel exports registerSearchAdapter / getRegisteredAdapters / __resetCmdkRegistry", () => {
    expect(typeof barrel.registerSearchAdapter).toBe("function");
    expect(typeof barrel.getRegisteredAdapters).toBe("function");
    expect(typeof barrel.__resetCmdkRegistry).toBe("function");
  });

  it("IB3 — barrel exports escapeHtml / highlightMatch", () => {
    expect(typeof barrel.escapeHtml).toBe("function");
    expect(typeof barrel.highlightMatch).toBe("function");

    // Smoke-test: escapeHtml("<") === "&lt;"
    expect(barrel.escapeHtml("<")).toBe("&lt;");
    // Smoke-test: highlightMatch wraps match
    expect(barrel.highlightMatch("Hello World", "world")).toContain("<mark>");
  });
});
