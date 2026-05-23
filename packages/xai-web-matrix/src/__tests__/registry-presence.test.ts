/**
 * Consumer-side smoke test: confirms PREF_REGISTRY has xai_matrix_state after P2 write.
 * This test lives in this package to avoid write-scope expansion to @repo/plugin-web-storage.
 */
import { describe, it, expect } from "vitest";
import { PREF_REGISTRY } from "@repo/plugin-web-storage";
import { MATRIX_STORAGE_KEY } from "../constants.js";

describe("PREF_REGISTRY presence", () => {
  it("xai_matrix_state key exists in PREF_REGISTRY", () => {
    expect(MATRIX_STORAGE_KEY in PREF_REGISTRY).toBe(true);
  });

  it("MATRIX_STORAGE_KEY is a key of PREF_REGISTRY (WebPrefKey contract)", () => {
    // isPrefKey guards the xai_pref_* open family; xai_matrix_state is a
    // registered explicit key, so we verify via PREF_REGISTRY membership.
    const keys = Object.keys(PREF_REGISTRY);
    expect(keys).toContain(MATRIX_STORAGE_KEY);
  });

  it("registry entry has expected metadata", () => {
    const entry = PREF_REGISTRY[MATRIX_STORAGE_KEY];
    expect(entry.owner).toBe("xai-web-matrix");
    expect(entry.category).toBe("module");
    expect(entry.codec).toBe("json");
    expect(entry.schemaVersion).toBe(1);
  });
});
