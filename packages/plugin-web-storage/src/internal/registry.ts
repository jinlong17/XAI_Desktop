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

export type ClockStyle = "analog" | "digital" | "minimal";

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
    default: "analog" as ClockStyle,
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
} as const;

// ---------------------------------------------------------------------------
// Derived types exported (re-exported via index.ts)
// ---------------------------------------------------------------------------

export type WebPrefKey = keyof typeof PREF_REGISTRY;

// WebPrefValue<K> infers the "default" field's type from the registry entry.
// This is the mechanism that gives callers typed values without casts.
export type WebPrefValue<K extends WebPrefKey> =
  (typeof PREF_REGISTRY)[K]["default"];
