/**
 * Registry tests — AC-REG-1..8
 * Tests: PREF_REGISTRY shape, entry metadata, and byte-for-byte key naming.
 */

import { describe, it, expect } from "vitest";
import { PREF_REGISTRY } from "../internal/registry.js";
import type { PrefCodec } from "../internal/registry.js";

// The 18 explicit keys from DESIGN.md §9.2 (byte-for-byte)
const EXPLICIT_KEYS_18 = [
  "xai_accent_hue",
  "xai_rail_pos",
  "xai_bg_tone",
  "xai_rail_order",
  "xai_pet_pos",
  "xai_pet_id",
  "xai_task_cols",
  "xai_boards_v2",
  "xai_active_board",
  "xai_board_panels",
  "xai_board_inbox",
  "xai_dash_order",
  "xai_clock_style",
  "xai_clock_tz",
  "xai_zones",
  "xai_ai_convos",
  "xai_ai_insights",
  "xai_ai_voice",
] as const;

// The 2 proposed keys from ADR-0007 §S8
const PROPOSED_KEYS = ["xai_pomodoro_sessions", "xai_countdowns"] as const;

const ALL_REGISTRY_KEYS = Object.keys(PREF_REGISTRY);

describe("AC-REG-1: All 18 explicit §9.2 keys exist in PREF_REGISTRY", () => {
  it("registry is a superset of the 18 explicit literal keys", () => {
    for (const key of EXPLICIT_KEYS_18) {
      expect(
        ALL_REGISTRY_KEYS,
        `Missing explicit key: ${key}`,
      ).toContain(key);
    }
  });
});

describe("AC-REG-2: Both proposed keys exist with proposed: true", () => {
  it("xai_pomodoro_sessions has proposed: true", () => {
    // Use type assertion to access optional field
    const entry = PREF_REGISTRY.xai_pomodoro_sessions as { proposed?: true };
    expect(entry.proposed).toBe(true);
  });

  it("xai_countdowns has proposed: true", () => {
    const entry = PREF_REGISTRY.xai_countdowns as { proposed?: true };
    expect(entry.proposed).toBe(true);
  });

  it("no explicit key carries proposed: true", () => {
    for (const key of EXPLICIT_KEYS_18) {
      const entry = PREF_REGISTRY[key] as { proposed?: true };
      expect(
        entry.proposed,
        `Explicit key ${key} should not have proposed: true`,
      ).toBeUndefined();
    }
  });
});

describe("AC-REG-3: All entries have schemaVersion: 1 in v1", () => {
  it("every registry entry has schemaVersion === 1", () => {
    const entries = Object.values(PREF_REGISTRY);
    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      expect(
        entry.schemaVersion,
        `Entry ${entry.key} has schemaVersion ${entry.schemaVersion}, expected 1`,
      ).toBe(1);
    }
  });
});

describe("AC-REG-4: Codec set is the closed union", () => {
  const VALID_CODECS: PrefCodec[] = ["string", "number", "boolean", "json"];

  it("every entry codec is in the closed set", () => {
    for (const entry of Object.values(PREF_REGISTRY)) {
      expect(
        VALID_CODECS,
        `Entry ${entry.key} has unknown codec "${entry.codec}"`,
      ).toContain(entry.codec);
    }
  });
});

describe("AC-REG-5: Owner row is non-empty", () => {
  it("every entry has a non-empty owner", () => {
    for (const entry of Object.values(PREF_REGISTRY)) {
      expect(
        entry.owner.length,
        `Entry ${entry.key} has empty owner`,
      ).toBeGreaterThan(0);
    }
  });
});

describe("AC-REG-6: No accidental duplicate keys", () => {
  it("key count equals unique key count", () => {
    const keys = Object.keys(PREF_REGISTRY);
    const unique = new Set(keys);
    expect(keys.length).toBe(unique.size);
  });
});

describe("AC-REG-7: Default type matches codec", () => {
  it("codec=number entries have typeof default === number", () => {
    for (const entry of Object.values(PREF_REGISTRY)) {
      if (entry.codec === "number") {
        expect(
          typeof entry.default,
          `Entry ${entry.key} has codec=number but default is ${typeof entry.default}`,
        ).toBe("number");
      }
    }
  });

  it("codec=boolean entries have typeof default === boolean", () => {
    for (const entry of Object.values(PREF_REGISTRY)) {
      if (entry.codec === "boolean") {
        expect(
          typeof entry.default,
          `Entry ${entry.key} has codec=boolean but default is ${typeof entry.default}`,
        ).toBe("boolean");
      }
    }
  });

  it("codec=string entries have typeof default === string", () => {
    for (const entry of Object.values(PREF_REGISTRY)) {
      if (entry.codec === "string") {
        expect(
          typeof entry.default,
          `Entry ${entry.key} has codec=string but default is ${typeof entry.default}`,
        ).toBe("string");
      }
    }
  });

  it("codec=json entries can have any default shape", () => {
    const jsonEntries = Object.values(PREF_REGISTRY).filter(
      (e) => e.codec === "json",
    );
    // Just verify there are json entries — no type constraint.
    expect(jsonEntries.length).toBeGreaterThan(0);
  });
});

describe("AC-REG-8: Total entry count is 20 (18 explicit + 2 proposed)", () => {
  it("PREF_REGISTRY has exactly 20 entries", () => {
    expect(ALL_REGISTRY_KEYS.length).toBe(20);
  });

  it("registry contains all 18 explicit + all 2 proposed", () => {
    const all = [...EXPLICIT_KEYS_18, ...PROPOSED_KEYS];
    for (const k of all) {
      expect(ALL_REGISTRY_KEYS).toContain(k);
    }
  });
});
