/**
 * AC-PARITY-1..2: Byte-for-byte parity between PREF_REGISTRY and DESIGN.md §9.2
 *
 * This test reads "web design/DESIGN.md" at test-time and parses the §9.2
 * table to extract xai_* keys. It then asserts:
 *   - PARITY-1: every key extracted from §9.2 is in PREF_REGISTRY
 *   - PARITY-2: every PREF_REGISTRY key (excluding proposed + xai_pref_*)
 *               is in the §9.2 extracted set
 *
 * If §9.2 is edited (adding or renaming a key), this test catches the drift.
 */

import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "fs";
import { fileURLToPath } from "url";
import { resolve, dirname } from "path";
import { PREF_REGISTRY } from "../internal/registry.js";

// ---------------------------------------------------------------------------
// Resolve DESIGN.md path relative to monorepo root
// ---------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// From packages/plugin-web-storage/src/__tests__/:
//   ../../..  → packages/plugin-web-storage/
//   ../../../../ → monorepo root (XAI_Desktop/)
const MONOREPO_ROOT = resolve(__dirname, "../../../..");
const DESIGN_MD_PATH = resolve(MONOREPO_ROOT, "web design/DESIGN.md");
const parityIt = existsSync(DESIGN_MD_PATH) ? it : it.skip;

function loadDesignMd(): string {
  return readFileSync(DESIGN_MD_PATH, "utf-8");
}

// ---------------------------------------------------------------------------
// Extract xai_* keys from §9.2 section of DESIGN.md
// ---------------------------------------------------------------------------

function extractSection92Keys(content: string): string[] {
  // Find the §9.2 section
  const sectionMatch = content.match(
    /###\s*9\.2[^#]*?\n([\s\S]*?)(?=\n###|\n##|\n#|$)/,
  );
  if (!sectionMatch) {
    throw new Error(
      "Could not find §9.2 section in DESIGN.md. Test infrastructure broken.",
    );
  }

  const section = sectionMatch[1] ?? "";

  // Extract all `xai_*` key tokens from the table (backtick-quoted)
  // The table uses format: | `xai_key` / `xai_key2` | description |
  // We need to match all xai_* tokens (not xai_pref_* which is a prefix family)
  const rawKeys: string[] = [];
  const regex = /`(xai_[a-z_0-9]+)`/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(section)) !== null) {
    const key = match[1];
    // Exclude the prefix family placeholder
    if (key && key !== "xai_pref_*" && !key.endsWith("_*")) {
      rawKeys.push(key);
    }
  }

  return [...new Set(rawKeys)];
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("AC-PARITY-1: all §9.2 keys are in PREF_REGISTRY", () => {
  parityIt("every xai_* key in DESIGN.md §9.2 table exists in PREF_REGISTRY", () => {
    const content = loadDesignMd();
    const designKeys = extractSection92Keys(content);
    const registryKeys = new Set(Object.keys(PREF_REGISTRY));

    expect(designKeys.length, "No keys extracted from §9.2 — check regex or section header").toBeGreaterThan(0);

    const missing: string[] = [];
    for (const key of designKeys) {
      if (!registryKeys.has(key)) {
        missing.push(key);
      }
    }

    expect(
      missing,
      `PREF_REGISTRY is missing keys from DESIGN.md §9.2: ${missing.join(", ")}`,
    ).toHaveLength(0);
  });
});

// Owner-row additions appended via ADR-0007 §S8 by individual W2 rows.
// These do not appear in DESIGN.md §9.2 (which freezes the original 18 keys);
// they are documented in the owning row's docs/api.md instead.
const OWNER_ROW_EXEMPT_KEYS: ReadonlySet<string> = new Set([
  "xai_pomodoro_active",      // POMO-01 durable active/pending session (2026-09-09)
  "xai_meditation_active",    // MED-01 durable account-scoped execution state (2026-09-09)
  "xai_matrix_state",       // xai-web-matrix #13
  "xai_habits_state",       // xai-web-habits #15
  "xai_pref_week_start",    // xai-web-calendar #12 (xai_pref_* family per ADR-0007 §S8)
  "xai_meditation_prefs",   // xai-web-meditation #16
  "xai_board_view_by_id",   // xai-web-board-views #8 (per-board active view selection)
  "xai_board_filter_by_id", // xai-web-board-saved-filters #10 (per-board saved filter selection)
  "xai_board_workspaces",   // plugin-web-board-workspaces W3 (workspace directory CRUD)
  // xai-web-settings-features-panel #23 — 8 boolean toggles in the xai_pref_* family per ADR-0007 §S8
  "xai_pref_features_tasks",
  "xai_pref_features_board",
  "xai_pref_features_dashboard",
  "xai_pref_features_calendar",
  "xai_pref_features_matrix",
  "xai_pref_features_pomodoro",
  "xai_pref_features_habits",
  "xai_pref_features_meditation",
  // xai-web-settings-rest #24 — 37 xai_pref_* keys for the 11 remaining Settings panes
  "xai_pref_smart_lists",
  "xai_pref_notif_enabled",
  "xai_pref_notif_done_sound",
  "xai_pref_notif_push_task",
  "xai_pref_notif_push_pomo",
  "xai_pref_notif_push_habit",
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
  // xai-web-ai-chat-real-llm-adapter (row #2) — 4 provider/model prefs
  "xai_ai_provider",
  "xai_ai_base_url",
  "xai_ai_model_default",
  "xai_ai_streaming",
  // xai-web-calendar gap-closure row #4 — calendar view persistence key
  "xai_calendar_view",
  // xai-web-settings-rest gap-closure row #7 — 3 boolean integration OAuth stub prefs
  "xai_pref_integrations_connected_notion",
  "xai_pref_integrations_connected_gcal",
  "xai_pref_integrations_connected_linear",
  // xai-web-settings-rest gap-closure row #8 — 2 Premium Stripe Checkout stub prefs
  "xai_pref_premium_tier",
  "xai_pref_premium_started_at",
  // xai-web-calendar event-create extension 2026-05-27 — calendar events persistence
  "xai_calendar_events",
  // xai-web-dashboard-stickies-create extension 2026-05-28 — stickies persistence
  "xai_dashboard_stickies",
  // xai-web-dashboard-weather-mail extension 2026-05-29 — weather persistence
  "xai_dashboard_weather",
]);

describe("AC-PARITY-2: all PREF_REGISTRY explicit keys are in §9.2", () => {
  parityIt("no PREF_REGISTRY key (excluding proposed + owner-row additions) is missing from §9.2", () => {
    const content = loadDesignMd();
    const designKeys = new Set(extractSection92Keys(content));
    const registryEntries = Object.entries(PREF_REGISTRY);

    // Exclude proposed keys — they may not appear literally in the §9.2 table
    // (they come from ADR-0007 §S8 which adds them separately).
    // Also exclude owner-row additions appended by W2 rows post-baseline.
    const nonProposedKeys = registryEntries
      .filter(([, entry]) => !(entry as { proposed?: true }).proposed)
      .map(([key]) => key)
      .filter((key) => !OWNER_ROW_EXEMPT_KEYS.has(key));

    const missing: string[] = [];
    for (const key of nonProposedKeys) {
      if (!designKeys.has(key)) {
        missing.push(key);
      }
    }

    expect(
      missing,
      `PREF_REGISTRY has keys not found in DESIGN.md §9.2: ${missing.join(", ")}`,
    ).toHaveLength(0);
  });
});
