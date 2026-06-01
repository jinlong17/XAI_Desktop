/**
 * @internal — registry.ts
 * Typed entry object per key (Axis B1 per design.md §2).
 * Source of truth: web design/DESIGN.md §9.2
 * Governing ADR: docs/adr/0007-xai-web-console-build-form.md §S4 + §S8
 *
 * 18 explicit keys + 2 proposed keys (ADR-0007 §S8 reservation) + xai_pref_* prefix family.
 * api.md §1.1 is the authoritative key table; this registry is byte-for-byte parity.
 */

// ---------------------------------------------------------------------------
// Codec types
// ---------------------------------------------------------------------------

export type PrefCodec = "string" | "number" | "boolean" | "json";

export type PrefCategory = "appearance" | "shell" | "pet" | "module" | "pref";

// ---------------------------------------------------------------------------
// PrefEntry<T>
// ---------------------------------------------------------------------------

export interface PrefEntry<T> {
  /** The literal localStorage key. */
  readonly key: string;
  /** How the value is serialized. */
  readonly codec: PrefCodec;
  /** The value returned when the key is absent or the stored value cannot be decoded. */
  readonly default: T;
  /** Bumped when the value shape changes; future rows register migrations against this. */
  readonly schemaVersion: number;
  /** Owner row slug, for documentation / lint. */
  readonly owner: string;
  /** Source category — matches §9.2 grouping. */
  readonly category: PrefCategory;
  /** True if the key is reserved by ADR-0007 §S8 as renameable. */
  readonly proposed?: true;
}

// ---------------------------------------------------------------------------
// Per-key value types (for static inference)
// ---------------------------------------------------------------------------

export type RailPos = "left" | "right" | "top" | "bottom";

export type BgTone =
  | "default"
  | "sage"
  | "cream"
  | "mist"
  | "lavender"
  | "peach"
  | "graphite";

export type RailItemId =
  | "tasks"
  | "board"
  | "dashboard"
  | "calendar"
  | "matrix"
  | "pomodoro"
  | "timetrack"
  | "habits"
  | "meditation"
  | "countdown"
  | "ai"
  | "statistics"
  | "settings";

export type PetId =
  | "mochi"
  | "pip"
  | "sprout"
  | "lumi"
  | "drip"
  | "pebble"
  | "star"
  | "ember";

export type ClockStyle = "classic" | "split" | "minimal" | "analog";

// These complex types are "opaque" in v1 — the storage layer does not constrain
// their shape; owner rows provide the real type declaration.
export type PetPos = { x: number; y: number };
export type TaskColsState = Record<string, boolean>;
export type BoardsState = unknown;
export type BoardPanelState = unknown;
export type InboxCard = unknown;
export type DashWidgetId = string;
export type AiConvo = unknown;
export type PomodoroSession = unknown;
export type Countdown = unknown;
export type MatrixStateBlob = unknown;

// Habits state opaque alias — canonical declarations live in @repo/plugin-web-habits.
// proposed: false — xai_habits_state is the canonical name approved by worker brief #15.
export type HabitsStateBlob = unknown;

// Meditation prefs opaque alias — canonical declarations live in @repo/plugin-web-meditation.
// proposed: false — xai_meditation_prefs is the canonical name approved by worker brief #16.
export type MeditationPrefsBlob = unknown;

// ---------------------------------------------------------------------------
// Default values (const assertions for inference)
// ---------------------------------------------------------------------------

const DEFAULT_RAIL_ORDER: RailItemId[] = [
  "tasks",
  "board",
  "dashboard",
  "calendar",
  "matrix",
  "pomodoro",
  "timetrack",
  "habits",
  "meditation",
  "countdown",
  "ai",
  "statistics",
  "settings",
];

const DEFAULT_DASH_ORDER: DashWidgetId[] = [
  "clock",
  "minicalendar",
  "worldclocks",
  "weather",
  "stickies",
  "mail",
  "upcoming",
  "stats",
];

const DEFAULT_PET_POS: PetPos = { x: 24, y: 24 };

// ---------------------------------------------------------------------------
// PREF_REGISTRY — 18 explicit + 2 proposed = 20 typed entries
// ---------------------------------------------------------------------------

export const PREF_REGISTRY = {
  // ---- Appearance (§S8 Shell / 外观) -------------------------------------------
  xai_accent_hue: {
    key: "xai_accent_hue",
    codec: "number",
    default: 165,
    schemaVersion: 1,
    owner: "xai-web-settings-appearance",
    category: "appearance",
  } satisfies PrefEntry<number>,

  xai_rail_pos: {
    key: "xai_rail_pos",
    codec: "string",
    default: "left" as RailPos,
    schemaVersion: 1,
    owner: "xai-web-settings-appearance",
    category: "appearance",
  } satisfies PrefEntry<RailPos>,

  xai_bg_tone: {
    key: "xai_bg_tone",
    codec: "string",
    default: "default" as BgTone,
    schemaVersion: 1,
    owner: "xai-web-settings-appearance",
    category: "appearance",
  } satisfies PrefEntry<BgTone>,

  // ---- Shell ------------------------------------------------------------------
  xai_rail_order: {
    key: "xai_rail_order",
    codec: "json",
    default: DEFAULT_RAIL_ORDER,
    schemaVersion: 1,
    owner: "xai-web-shell",
    category: "shell",
  } satisfies PrefEntry<RailItemId[]>,

  // ---- Pet (§S8 桌宠) ----------------------------------------------------------
  xai_pet_pos: {
    key: "xai_pet_pos",
    codec: "json",
    default: DEFAULT_PET_POS,
    schemaVersion: 1,
    owner: "xai-web-pet",
    category: "pet",
  } satisfies PrefEntry<PetPos>,

  xai_pet_id: {
    key: "xai_pet_id",
    codec: "string",
    default: "mochi" as PetId,
    schemaVersion: 1,
    owner: "xai-web-pet",
    category: "pet",
  } satisfies PrefEntry<PetId>,

  // ---- Module data (§S8 模块数据) ----------------------------------------------
  xai_task_cols: {
    key: "xai_task_cols",
    codec: "json",
    default: {} as TaskColsState,
    schemaVersion: 1,
    owner: "xai-web-tasks",
    category: "module",
  } satisfies PrefEntry<TaskColsState>,

  xai_boards_v2: {
    key: "xai_boards_v2",
    codec: "json",
    default: null as BoardsState,
    schemaVersion: 1,
    owner: "xai-web-board-core",
    category: "module",
  } satisfies PrefEntry<BoardsState>,

  xai_active_board: {
    key: "xai_active_board",
    codec: "string",
    default: "",
    schemaVersion: 1,
    owner: "xai-web-board-core",
    category: "module",
  } satisfies PrefEntry<string>,

  xai_board_panels: {
    key: "xai_board_panels",
    codec: "json",
    default: [] as BoardPanelState[],
    schemaVersion: 1,
    owner: "xai-web-board-core",
    category: "module",
  } satisfies PrefEntry<BoardPanelState[]>,

  xai_board_inbox: {
    key: "xai_board_inbox",
    codec: "json",
    default: [] as InboxCard[],
    schemaVersion: 1,
    owner: "xai-web-board-core",
    category: "module",
  } satisfies PrefEntry<InboxCard[]>,

  xai_dash_order: {
    key: "xai_dash_order",
    codec: "json",
    default: DEFAULT_DASH_ORDER,
    schemaVersion: 1,
    owner: "xai-web-dashboard-grid",
    category: "module",
  } satisfies PrefEntry<DashWidgetId[]>,

  xai_clock_style: {
    key: "xai_clock_style",
    codec: "string",
    default: "classic" as ClockStyle,
    schemaVersion: 1,
    owner: "xai-web-dashboard-widgets",
    category: "module",
  } satisfies PrefEntry<ClockStyle>,

  xai_clock_tz: {
    key: "xai_clock_tz",
    codec: "string",
    default: "local",
    schemaVersion: 1,
    owner: "xai-web-dashboard-widgets",
    category: "module",
  } satisfies PrefEntry<string>,

  xai_zones: {
    key: "xai_zones",
    codec: "json",
    default: [] as string[],
    schemaVersion: 1,
    owner: "xai-web-dashboard-widgets",
    category: "module",
  } satisfies PrefEntry<string[]>,

  xai_ai_convos: {
    key: "xai_ai_convos",
    codec: "json",
    default: [] as AiConvo[],
    schemaVersion: 1,
    owner: "xai-web-ai-chat",
    category: "module",
  } satisfies PrefEntry<AiConvo[]>,

  xai_ai_insights: {
    key: "xai_ai_insights",
    codec: "boolean",
    default: true as boolean,
    schemaVersion: 1,
    owner: "xai-web-ai-chat",
    category: "module",
  } satisfies PrefEntry<boolean>,

  xai_ai_voice: {
    key: "xai_ai_voice",
    codec: "boolean",
    default: false as boolean,
    schemaVersion: 1,
    owner: "xai-web-ai-chat",
    category: "module",
  } satisfies PrefEntry<boolean>,

  // ---- AI LLM adapter prefs (xai-web-ai-chat row #18 extension 2026-05-25) ---
  // NONE of these store API keys. Keys live exclusively in IndexedDB via secretStore.
  xai_ai_provider: {
    key: "xai_ai_provider",
    codec: "json",
    default: "anthropic" as string,
    schemaVersion: 1,
    owner: "xai-web-ai-chat-real-llm-adapter",
    category: "module",
  } satisfies PrefEntry<string>,

  xai_ai_base_url: {
    key: "xai_ai_base_url",
    codec: "json",
    default: "" as string,
    schemaVersion: 1,
    owner: "xai-web-ai-chat-real-llm-adapter",
    category: "module",
  } satisfies PrefEntry<string>,

  xai_ai_model_default: {
    key: "xai_ai_model_default",
    codec: "json",
    default: "haiku" as string,
    schemaVersion: 1,
    owner: "xai-web-ai-chat-real-llm-adapter",
    category: "module",
  } satisfies PrefEntry<string>,

  xai_ai_streaming: {
    key: "xai_ai_streaming",
    codec: "boolean",
    default: true as boolean,
    schemaVersion: 1,
    owner: "xai-web-ai-chat-real-llm-adapter",
    category: "module",
  } satisfies PrefEntry<boolean>,

  // ---- Proposed keys — ADR-0007 §S8 reservation ------------------------------
  // Owner rows (xai-web-pomodoro #14, xai-web-countdown #17) may rename these
  // in their own feature-plan. A rename triggers a one-line migration via the
  // future registerMigration helper.

  xai_pomodoro_sessions: {
    key: "xai_pomodoro_sessions",
    codec: "json",
    default: [] as PomodoroSession[],
    schemaVersion: 1,
    owner: "xai-web-pomodoro",
    category: "module",
    proposed: true,
  } satisfies PrefEntry<PomodoroSession[]>,

  xai_countdowns: {
    key: "xai_countdowns",
    codec: "json",
    default: [] as Countdown[],
    schemaVersion: 1,
    owner: "xai-web-countdown",
    category: "module",
    proposed: true,
  } satisfies PrefEntry<Countdown[]>,

  // ---- Matrix (§S8 — declared by xai-web-matrix #13) -------------------------
  // Opaque storage type; canonical declarations live in @repo/plugin-web-matrix.
  xai_matrix_state: {
    key: "xai_matrix_state",
    codec: "json",
    default: { schemaVersion: 1, q1: [], q2: [], q3: [], q4: [] } as MatrixStateBlob,
    schemaVersion: 1,
    owner: "xai-web-matrix",
    category: "module",
    proposed: true,
  } satisfies PrefEntry<MatrixStateBlob>,

  // ---- Habits (§S8 — declared by xai-web-habits #15) -----------------------
  // Opaque storage type; canonical declarations live in @repo/plugin-web-habits.
  // proposed: false — canonical name approved by worker brief #15.
  xai_habits_state: {
    key: "xai_habits_state",
    codec: "json",
    default: {
      schemaVersion: 1,
      habits: [],
      checkIns: {},
      diaries: {},
    } as HabitsStateBlob,
    schemaVersion: 1,
    owner: "xai-web-habits",
    category: "module",
  } satisfies PrefEntry<HabitsStateBlob>,

  // ---- Week-start preference (§S8 — first-consumer xai-web-calendar #12) -----
  // 0 = Sunday (default), 1 = Monday. First consumer claims ownership; Settings
  // W4 may later flip `owner` to "xai-web-settings-rest" via a one-line edit.
  // proposed: false — canonical xai_pref_* family per ADR-0007 §S8.
  xai_pref_week_start: {
    key: "xai_pref_week_start",
    codec: "number",
    default: 0,
    schemaVersion: 1,
    owner: "xai-web-calendar",
    category: "pref",
  } satisfies PrefEntry<0 | 1>,

  // ---- Board Views (§S8 — declared by xai-web-board-views #8) ---------------
  // Shape: Record<boardId, BoardViewId> — canonical declarations live in
  // @repo/plugin-web-board-views. Defaults to {} (no active view override;
  // BoardModule falls back to "board" / Kanban when the key is absent).
  xai_board_view_by_id: {
    key: "xai_board_view_by_id",
    codec: "json",
    default: {} as Record<string, string>,
    schemaVersion: 1,
    owner: "xai-web-board-views row #8",
    category: "module",
  } satisfies PrefEntry<Record<string, string>>,

  // ---- Meditation (§S8 — declared by xai-web-meditation #16) ----------------
  // Opaque storage type; canonical declarations live in @repo/plugin-web-meditation.
  // proposed: false — canonical name approved by worker brief #16.
  xai_meditation_prefs: {
    key: "xai_meditation_prefs",
    codec: "json",
    default: {
      schemaVersion: 1,
      scene: "ocean",
      clock: "split",
      sound: "water",
      duration: 15,
    } as MeditationPrefsBlob,
    schemaVersion: 1,
    owner: "xai-web-meditation",
    category: "module",
  } satisfies PrefEntry<MeditationPrefsBlob>,

  // ---- Features panel (§S8 — declared by xai-web-settings-features-panel #23) ----
  // 8 boolean toggles, one per user-toggleable rail module. Defaults to `true`
  // (every module enabled). Toggling off hides the rail entry + makes deep links
  // resolve to <DisabledFeatureFallback>; data persistence is untouched.
  // Canonical xai_pref_* family per ADR-0007 §S8.
  xai_pref_features_tasks: {
    key: "xai_pref_features_tasks",
    codec: "boolean",
    default: true as boolean,
    schemaVersion: 1,
    owner: "xai-web-settings-features-panel",
    category: "pref",
  } satisfies PrefEntry<boolean>,

  xai_pref_features_board: {
    key: "xai_pref_features_board",
    codec: "boolean",
    default: true as boolean,
    schemaVersion: 1,
    owner: "xai-web-settings-features-panel",
    category: "pref",
  } satisfies PrefEntry<boolean>,

  xai_pref_features_dashboard: {
    key: "xai_pref_features_dashboard",
    codec: "boolean",
    default: true as boolean,
    schemaVersion: 1,
    owner: "xai-web-settings-features-panel",
    category: "pref",
  } satisfies PrefEntry<boolean>,

  xai_pref_features_calendar: {
    key: "xai_pref_features_calendar",
    codec: "boolean",
    default: true as boolean,
    schemaVersion: 1,
    owner: "xai-web-settings-features-panel",
    category: "pref",
  } satisfies PrefEntry<boolean>,

  xai_pref_features_matrix: {
    key: "xai_pref_features_matrix",
    codec: "boolean",
    default: true as boolean,
    schemaVersion: 1,
    owner: "xai-web-settings-features-panel",
    category: "pref",
  } satisfies PrefEntry<boolean>,

  xai_pref_features_pomodoro: {
    key: "xai_pref_features_pomodoro",
    codec: "boolean",
    default: true as boolean,
    schemaVersion: 1,
    owner: "xai-web-settings-features-panel",
    category: "pref",
  } satisfies PrefEntry<boolean>,

  xai_pref_features_habits: {
    key: "xai_pref_features_habits",
    codec: "boolean",
    default: true as boolean,
    schemaVersion: 1,
    owner: "xai-web-settings-features-panel",
    category: "pref",
  } satisfies PrefEntry<boolean>,

  xai_pref_features_meditation: {
    key: "xai_pref_features_meditation",
    codec: "boolean",
    default: true as boolean,
    schemaVersion: 1,
    owner: "xai-web-settings-features-panel",
    category: "pref",
  } satisfies PrefEntry<boolean>,

  // ---- Rest panes (§S8 — declared by xai-web-settings-rest #24) ----
  // 37 new xai_pref_* keys for the 11 remaining Settings panes.
  // All: category "pref", schemaVersion 1, proposed: false, owner "xai-web-settings-rest".
  // Caught by chassis resetAllPrefs() via key.startsWith("xai_") filter.

  xai_pref_smart_lists: {
    key: "xai_pref_smart_lists",
    codec: "json",
    default: {} as Record<string, string>,
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<Record<string, string>>,

  xai_pref_notif_enabled: {
    key: "xai_pref_notif_enabled",
    codec: "boolean",
    default: true as boolean,
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<boolean>,

  xai_pref_notif_done_sound: {
    key: "xai_pref_notif_done_sound",
    codec: "string",
    default: "subtle",
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<string>,

  xai_pref_notif_push_task: {
    key: "xai_pref_notif_push_task",
    codec: "boolean",
    default: true as boolean,
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<boolean>,

  xai_pref_notif_push_pomo: {
    key: "xai_pref_notif_push_pomo",
    codec: "boolean",
    default: true as boolean,
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<boolean>,

  xai_pref_notif_push_habit: {
    key: "xai_pref_notif_push_habit",
    codec: "boolean",
    default: false as boolean,
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<boolean>,

  xai_pref_notif_quiet: {
    key: "xai_pref_notif_quiet",
    codec: "boolean",
    default: false as boolean,
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<boolean>,

  xai_pref_notif_quiet_start: {
    key: "xai_pref_notif_quiet_start",
    codec: "string",
    default: "22:00",
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<string>,

  xai_pref_notif_quiet_end: {
    key: "xai_pref_notif_quiet_end",
    codec: "string",
    default: "07:00",
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<string>,

  xai_pref_dt_start_week: {
    key: "xai_pref_dt_start_week",
    codec: "string",
    default: "monday",
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<string>,

  xai_pref_dt_lunar: {
    key: "xai_pref_dt_lunar",
    codec: "boolean",
    default: true as boolean,
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<boolean>,

  xai_pref_dt_week_numbers: {
    key: "xai_pref_dt_week_numbers",
    codec: "boolean",
    default: true as boolean,
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<boolean>,

  xai_pref_dt_holidays: {
    key: "xai_pref_dt_holidays",
    codec: "boolean",
    default: true as boolean,
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<boolean>,

  xai_pref_dt_timezone: {
    key: "xai_pref_dt_timezone",
    codec: "boolean",
    default: true as boolean,
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<boolean>,

  xai_pref_more_win_type: {
    key: "xai_pref_more_win_type",
    codec: "string",
    default: "window",
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<string>,

  xai_pref_more_launch_at_login: {
    key: "xai_pref_more_launch_at_login",
    codec: "boolean",
    default: false as boolean,
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<boolean>,

  xai_pref_more_minimize_on_launch: {
    key: "xai_pref_more_minimize_on_launch",
    codec: "boolean",
    default: false as boolean,
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<boolean>,

  xai_pref_more_date_recognition: {
    key: "xai_pref_more_date_recognition",
    codec: "boolean",
    default: true as boolean,
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<boolean>,

  xai_pref_more_remove_date_text: {
    key: "xai_pref_more_remove_date_text",
    codec: "boolean",
    default: false as boolean,
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<boolean>,

  xai_pref_more_remove_tags: {
    key: "xai_pref_more_remove_tags",
    codec: "boolean",
    default: true as boolean,
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<boolean>,

  xai_pref_more_url_parse: {
    key: "xai_pref_more_url_parse",
    codec: "boolean",
    default: true as boolean,
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<boolean>,

  xai_pref_more_default_date: {
    key: "xai_pref_more_default_date",
    codec: "string",
    default: "none",
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<string>,

  xai_pref_more_default_rem_due: {
    key: "xai_pref_more_default_rem_due",
    codec: "string",
    default: "on_time",
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<string>,

  xai_pref_more_default_rem_all: {
    key: "xai_pref_more_default_rem_all",
    codec: "string",
    default: "none",
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<string>,

  xai_pref_more_default_pri: {
    key: "xai_pref_more_default_pri",
    codec: "string",
    default: "none",
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<string>,

  xai_pref_more_default_tag: {
    key: "xai_pref_more_default_tag",
    codec: "string",
    default: "none",
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<string>,

  xai_pref_more_default_list: {
    key: "xai_pref_more_default_list",
    codec: "string",
    default: "inbox",
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<string>,

  xai_pref_more_add_to: {
    key: "xai_pref_more_add_to",
    codec: "string",
    default: "top",
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<string>,

  xai_pref_more_overdue_at: {
    key: "xai_pref_more_overdue_at",
    codec: "string",
    default: "top",
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<string>,

  xai_pref_collab_show_avatars: {
    key: "xai_pref_collab_show_avatars",
    codec: "boolean",
    default: true as boolean,
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<boolean>,

  xai_pref_collab_default_share: {
    key: "xai_pref_collab_default_share",
    codec: "string",
    default: "comment",
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<string>,

  xai_pref_collab_mention_notify: {
    key: "xai_pref_collab_mention_notify",
    codec: "boolean",
    default: true as boolean,
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<boolean>,

  xai_pref_sticky_color: {
    key: "xai_pref_sticky_color",
    codec: "string",
    default: "sun",
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<string>,

  xai_pref_sticky_font: {
    key: "xai_pref_sticky_font",
    codec: "string",
    default: "large",
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<string>,

  xai_pref_sticky_pin_default: {
    key: "xai_pref_sticky_pin_default",
    codec: "boolean",
    default: true as boolean,
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<boolean>,

  xai_pref_sticky_restore_size: {
    key: "xai_pref_sticky_restore_size",
    codec: "boolean",
    default: false as boolean,
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<boolean>,

  xai_pref_sticky_grid_spacing: {
    key: "xai_pref_sticky_grid_spacing",
    codec: "string",
    default: "normal",
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<string>,

  // ---- Calendar view (§S8 — declared by xai-web-calendar gap-closure row #4) --
  // Stores the last active calendar view: "month" | "week" | "day".
  // Category "module" — NOT in the xai_pref_* chassis-reset family (same
  // category as xai_clock_style / xai_active_board per ADR-0007 §S8).
  // proposed: false — canonical name approved by gap-closure seed brief row #4.
  xai_calendar_view: {
    key: "xai_calendar_view",
    codec: "string",
    default: "month",
    schemaVersion: 1,
    owner: "xai-web-calendar",
    category: "module",
  } satisfies PrefEntry<string>,

  // ---- Integrations OAuth stub (extension 2026-05-25 — gap-closure row #7) ----
  // 3 boolean flags marking per-provider "connected (stub)" state.
  // MUST NOT be interpreted as "real connection" by any other code path.
  // Caught by chassis resetAllPrefs() via key.startsWith("xai_") filter.
  xai_pref_integrations_connected_notion: {
    key: "xai_pref_integrations_connected_notion",
    codec: "boolean",
    default: false as boolean,
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<boolean>,

  xai_pref_integrations_connected_gcal: {
    key: "xai_pref_integrations_connected_gcal",
    codec: "boolean",
    default: false as boolean,
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<boolean>,

  xai_pref_integrations_connected_linear: {
    key: "xai_pref_integrations_connected_linear",
    codec: "boolean",
    default: false as boolean,
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<boolean>,

  // ---- Premium Stripe Checkout stub (extension 2026-05-26 — gap-closure row #8) ----
  // Two scalar prefs for tier state machine + 30-day client-clock timer.
  //
  // FA-12 WARNING: xai_pref_premium_tier === "premium_stub" MUST NOT be interpreted
  // as "real subscription is active" by any other plugin or code path in v1.
  // This is a UX-stub flag only. Real subscription enforcement requires the P1
  // desktop client or a Worker-layer entitlement check.
  //
  // tier value union: "free" | "pending" | "premium_stub"
  // Caught by chassis resetAllPrefs() via key.startsWith("xai_") filter.
  xai_pref_premium_tier: {
    key: "xai_pref_premium_tier",
    codec: "string",
    default: "free" as string,
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<string>,

  // Millisecond epoch timestamp when the "premium_stub" tier started.
  // Used by usePremiumTier() 30-day filter. Default 0 = no active session.
  xai_pref_premium_started_at: {
    key: "xai_pref_premium_started_at",
    codec: "number",
    default: 0 as number,
    schemaVersion: 1,
    owner: "xai-web-settings-rest",
    category: "pref",
  } satisfies PrefEntry<number>,
} as const;

// ---------------------------------------------------------------------------
// Derived types exported (re-exported via index.ts)
// ---------------------------------------------------------------------------

export type WebPrefKey = keyof typeof PREF_REGISTRY;

// WebPrefValue<K> infers the "default" field's type from the registry entry.
// This is the mechanism that gives callers typed values without casts.
export type WebPrefValue<K extends WebPrefKey> =
  (typeof PREF_REGISTRY)[K]["default"];

// CalendarViewId — typed alias for the xai_calendar_view registry entry values.
// Re-exported from @repo/plugin-web-storage for consumers (xai-web-calendar index barrel).
export type CalendarViewId = "month" | "week" | "day";
