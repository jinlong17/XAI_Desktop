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

// Owner-row additions after the original 18 explicit + 2 proposed baseline.
// Each W2 row that owns persisted state appends one entry here following the
// §S8 owner-row registration pattern; the count grows as those rows ship.
const OWNER_ROW_ADDITIONS = [
  "xai_matrix_state",         // xai-web-matrix #13
  "xai_habits_state",         // xai-web-habits #15
  "xai_pref_week_start",      // xai-web-calendar #12 (first consumer of xai_pref_* family)
  "xai_meditation_prefs",     // xai-web-meditation #16
  "xai_board_view_by_id",     // xai-web-board-views #8 (per-board active view selection)
  "xai_board_filter_by_id",   // xai-web-board-saved-filters #10 (per-board saved filter selection)
  // xai-web-settings-features-panel #23 — 8 boolean toggles, one per user-toggleable rail module
  "xai_pref_features_tasks",
  "xai_pref_features_board",
  "xai_pref_features_dashboard",
  "xai_pref_features_calendar",
  "xai_pref_features_matrix",
  "xai_pref_features_pomodoro",
  "xai_pref_features_habits",
  "xai_pref_features_meditation",
  // xai-web-settings-rest #24 — 37 keys for the 11 remaining Settings panes
  "xai_pref_smart_lists",
  "xai_pref_notif_enabled",
  "xai_pref_notif_done_sound",
  "xai_pref_notif_push_task",
  "xai_pref_notif_push_pomo",
  "xai_pref_notif_push_habit",
  "xai_pref_notif_push_calendar",
  "xai_pref_notif_quiet",
  "xai_pref_notif_quiet_start",
  "xai_pref_notif_quiet_end",
  "xai_pref_dt_start_week",
  "xai_pref_dt_lunar",
  "xai_pref_dt_week_numbers",
  "xai_pref_dt_holidays",
  "xai_pref_dt_timezone",
  "xai_pref_more_win_type",
  "xai_pref_more_launch_at_login",
  "xai_pref_more_minimize_on_launch",
  "xai_pref_more_date_recognition",
  "xai_pref_more_remove_date_text",
  "xai_pref_more_remove_tags",
  "xai_pref_more_url_parse",
  "xai_pref_more_default_date",
  "xai_pref_more_default_rem_due",
  "xai_pref_more_default_rem_all",
  "xai_pref_more_default_pri",
  "xai_pref_more_default_tag",
  "xai_pref_more_default_list",
  "xai_pref_more_add_to",
  "xai_pref_more_overdue_at",
  "xai_pref_collab_show_avatars",
  "xai_pref_collab_default_share",
  "xai_pref_collab_mention_notify",
  "xai_pref_sticky_color",
  "xai_pref_sticky_font",
  "xai_pref_sticky_pin_default",
  "xai_pref_sticky_restore_size",
  "xai_pref_sticky_grid_spacing",
  // xai-web-ai-chat-real-llm-adapter (row #2) — 4 provider/model/streaming prefs
  "xai_ai_provider",
  "xai_ai_base_url",
  "xai_ai_model_default",
  "xai_ai_streaming",
  // xai-web-calendar gap-closure row #4 — calendar view persistence
  "xai_calendar_view",
  // xai-web-calendar-event-create — user-created events
  "xai_calendar_events",
  // xai-web-dashboard-widgets — user-created dashboard module state
  "xai_dashboard_stickies",
  "xai_dashboard_weather",
  // xai-web-settings-rest gap-closure row #7 — 3 boolean integration OAuth stub prefs
  "xai_pref_integrations_connected_notion",
  "xai_pref_integrations_connected_gcal",
  "xai_pref_integrations_connected_linear",
  // xai-web-settings-rest gap-closure row #8 — 2 Premium Stripe Checkout stub prefs
  "xai_pref_premium_tier",
  "xai_pref_premium_started_at",
] as const;

describe("AC-REG-8: Total entry count = 20 baseline + owner-row additions", () => {
  it(`PREF_REGISTRY has exactly ${20 + OWNER_ROW_ADDITIONS.length} entries`, () => {
    expect(ALL_REGISTRY_KEYS.length).toBe(20 + OWNER_ROW_ADDITIONS.length);
  });

  it("registry contains all 18 explicit + all 2 proposed + all owner-row additions", () => {
    const all = [...EXPLICIT_KEYS_18, ...PROPOSED_KEYS, ...OWNER_ROW_ADDITIONS];
    for (const k of all) {
      expect(ALL_REGISTRY_KEYS).toContain(k);
    }
  });
});

describe("AC-REG-9: xai-web-board-saved-filters owner-row key contract", () => {
  it("registers xai_board_filter_by_id as module json state", () => {
    expect(PREF_REGISTRY.xai_board_filter_by_id).toMatchObject({
      key: "xai_board_filter_by_id",
      codec: "json",
      default: {},
      schemaVersion: 1,
      owner: "xai-web-board-saved-filters",
      category: "module",
    });
  });
});
