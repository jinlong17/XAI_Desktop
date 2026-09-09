# API Contract — xai-web-habits

> Companion to `design.md`. Public surface declared from `packages/xai-web-habits/src/index.ts` only.
> Cross-package contracts (registry entry) declared in their canonical files; this doc enumerates the byte-for-byte additions.
> Event channel `web:habits:checkin-recorded` was already declared by W1 in `packages/core/src/types/events.ts:209–218` — emit-side wiring belongs to this row.

---

## 1. Public surface — `@repo/plugin-web-habits`

```ts
// packages/xai-web-habits/src/index.ts

// Side-effect CSS — applied once globally when this package is first imported.
import "./styles.css";

// ---- Components ------------------------------------------------------------
export { HabitsModule, default } from "./HabitsModule.js";

// ---- Slot registration (consumed by apps/web shellRegistrations.tsx) -------
export { habitsSlotRegistration } from "./registration.js";

// ---- Public types ----------------------------------------------------------
export type {
  Habit,
  HabitId,
  HabitsState,
  DateKey,
  MonthKey,
  WeekStart,
  HabitsModuleProps,
} from "./types.js";

// ---- Constants -------------------------------------------------------------
export { HABITS_STORAGE_KEY } from "./constants.js";
```

`index.ts` is the **only** allowed import path for consumers. Importing from
`@repo/plugin-web-habits/src/internal/*` is forbidden per CLAUDE.md "Code
Boundaries".

### 1.1 Exported types

```ts
// packages/xai-web-habits/src/types.ts

import type { Lang } from "@repo/plugin-web-tokens";

/** Stable opaque habit id. Format: `"h_" + 8 random hex chars`. */
export type HabitId = string;

/** UTC day key, format `YYYY-MM-DD`. Matches the event payload's `date` field. */
export type DateKey = string;

/** UTC month key, format `YYYY-MM`. */
export type MonthKey = string;

/** Week-start preference. Default "sun"; Settings W4 (row #24) may flip to "mon". */
export type WeekStart = "sun" | "mon";

/** A single habit definition (no check-in state — that's separate). */
export interface Habit {
  /** Stable opaque id; consumer must not reuse across habits. */
  readonly id: HabitId;
  /** Emoji glyph string (1–4 chars typical). */
  readonly emoji: string;
  /** Bilingual title. Both langs MUST be present. */
  readonly title: { en: string; zh: string };
  /** ISO timestamp the habit was created; the "since" date for total counts. */
  readonly createdAt: string;
}

/** Top-level persisted state — JSON-encoded in localStorage. */
export interface HabitsState {
  readonly schemaVersion: 1;
  readonly habits: ReadonlyArray<Habit>;
  /** Sparse: only checked (habit, day) pairs appear. Absence = not checked. */
  readonly checkIns: Readonly<Record<HabitId, Readonly<Record<DateKey, true>>>>;
  /** Per-habit per-month diary text. Absence = empty. */
  readonly diaries: Readonly<Record<HabitId, Readonly<Record<MonthKey, string>>>>;
}

/** Props for `<HabitsModule/>`. */
export interface HabitsModuleProps {
  /** Active UI language. Drives `useI18n(lang)` inside the module. */
  lang: Lang;
  /** Week-start preference (default "sun"; Settings W4 may flip to "mon"). */
  weekStart?: WeekStart;
}
```

### 1.2 Exported components

```ts
// HabitsModule.tsx

/**
 * Habits module — list pane (left) + detail pane (right).
 *
 * - Left pane: header (title + view-toggle + add-button + dots) + week-strip
 *   header + vertical habit rows (emoji + title + stats + 7-cell toggle strip).
 * - Right pane: detail header (emoji + title + dots) + 4 stat cards
 *   (monthly check-ins / total / monthly rate / streak) + progress card
 *   (6/365 mono numerator + medal SVG + month calendar) + diary card
 *   (controlled textarea per habit per month).
 *
 * Reads + writes state via `usePref("xai_habits_state")`.
 * Emits `web:habits:checkin-recorded` on every successful toggle.
 *
 * Empty-state copy: `useI18n(lang).s("habits.empty_log")` for the diary card.
 */
export function HabitsModule(props: HabitsModuleProps): JSX.Element;
export default HabitsModule;
```

### 1.3 Exported constants

```ts
// constants.ts

/**
 * The WebPrefKey used by HabitsModule. Re-exported so tests can clear
 * localStorage atomically by key without string-literal duplication.
 */
export const HABITS_STORAGE_KEY: "xai_habits_state" = "xai_habits_state";
```

### 1.4 Exported registration

```ts
// registration.tsx
import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";

/** Slot registration for the Web Console rail. */
export const habitsSlotRegistration: WebModuleSlotRegistration;
```

Schema (matches `WebModuleSlotRegistration` interface from
`packages/xai-web-shell/src/types.ts:57–66`):

| Field | Value | Source of truth |
|---|---|---|
| `moduleId` | `"habits"` | Already a literal in `WebModuleId` (`packages/core/src/types/events.ts`). |
| `label` | `"Habits"` | Mirrors existing placeholder at `shellRegistrations.tsx:53`. |
| `defaultChildPath` | `""` | Mirrors existing placeholder. |
| `children` | `[{ path: "", render: HabitsSlotHost }, { path: "*", render: HabitsSlotHost }]` | `HabitsSlotHost` wraps `<HabitsModule lang={useWebShell().lang} weekStart="sun" />`. |
| `icon` | `"pin"` | Already in `WebShellIconName` enum (`packages/xai-web-shell/src/types.ts:29`). |
| `railOrder` | `8` | Mirrors existing placeholder. |
| `i18nKey` | `"nav.habits"` | Already in `@repo/plugin-web-tokens` bundle (`I18N.en.nav.habits = "Habits"`, `I18N.zh.nav.habits = "习惯"`). |
| `showInRail` | `true` | Mirrors existing placeholder. |

### 1.5 Internal-only (not exported via index.ts)

| File | Purpose |
|---|---|
| `src/HabitList.tsx` | Left pane: header + week-strip + habit rows. |
| `src/HabitRow.tsx` | Single habit row with 7-cell weekly check strip. |
| `src/HabitDetail.tsx` | Right pane: 4 stat cards + progress + calendar + diary. |
| `src/StatCard.tsx` | 4-up stat card (port of prototype `StatCard`). |
| `src/MonthCalendar.tsx` | 5×7 month grid + month-nav buttons + check rings. |
| `src/DiaryCard.tsx` | Controlled textarea, blur-flush diary persistence. |
| `src/internal/AddHabitDialog.tsx` | P3: minimal modal for habit creation. |
| `src/internal/seed.ts` | Typed `INITIAL_HABITS` array (replaces `window.MOCK.habits`). |
| `src/internal/icons.tsx` | 10 inline SVG glyphs (`check`, `bolt`, `fire`, `target`, `plus`, `dots`, `arrowL`, `arrowR`, `list`, `grid4`). |
| `src/internal/dateKeys.ts` | Pure helpers: `utcDateKey(d)`, `monthKey(d)`, `weekDates(now, weekStart)`, `daysInMonth(year, month0)`, `isLeapYear(year)`, `pad2(n)`. |
| `src/internal/computeStreak.ts` | Pure `computeStreak(habitCheckIns, today): number`. |
| `src/internal/computeStats.ts` | Pure `computeMonthlyCount` / `computeMonthlyRate` / `compute365`. |
| `src/internal/toggle.ts` | Pure `toggleCheckIn(state, habitId, dateKey): { next, postStreak }`. |
| `src/internal/validate.ts` | `isHabit(x): x is Habit`, `validateHabitsState(raw): HabitsState`. |
| `src/internal/usePersistedHabits.ts` | `usePref<HabitsState>` wrapper with seed hydration + schemaVersion guard. |
| `src/internal/emit.ts` | `emitCheckInRecorded({ habitId, date, streak })` helper. |
| `src/internal/createId.ts` | Habit id generator. |
| `src/styles.css` | Side-effect CSS (tokens-only). |

---

## 2. Cross-package additive contracts

### 2.1 `PREF_REGISTRY` entry (write in P1)

Target file: `packages/plugin-web-storage/src/internal/registry.ts`.

Append AFTER the existing entries (after `xai_matrix_state` at line 333 of
the current file). Mirrors the `xai_matrix_state` / `xai_countdowns` shipped
pattern:

```ts
// Add to the top "opaque storage type" block (around line 92, next to MatrixStateBlob):
export type HabitsStateBlob = unknown;

// Append at the end of PREF_REGISTRY (after xai_matrix_state):

  // ---- Habits (§S8 — declared by xai-web-habits #15) -----------------------
  // Opaque storage type; canonical declarations live in @repo/plugin-web-habits.
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
```

Notes:

- Same `unknown`-alias pattern as `MatrixStateBlob = unknown` (registry.ts:92).
  Consumers cast through this row's typed surface (`HabitsState` in
  `@repo/plugin-web-habits/src/types.ts`).
- `WebPrefKey` derives `xai_habits_state` automatically (no other edit
  required).
- No new exports needed from `@repo/plugin-web-storage`'s `index.ts`.
- `proposed: false` — `xai_habits_state` is the canonical name approved by
  the worker brief. (The §S8 `proposed: true` flag is reserved for keys that
  may be renamed by owner-row feature-plan; this name is final.)

### 2.2 `EventMap` — no edit needed

Target file: `packages/core/src/types/events.ts`.

**No edit required.** The channel is already declared at lines 209–218:

```ts
// Habits check-in (owner: xai-web-habits row #15) — declaration only in W1
'web:habits:checkin-recorded': {
  /** Habit id whose check-in was just recorded. */
  habitId: string;
  /** UTC day key the check-in applied to (YYYY-MM-DD). */
  date: string;
  /** Post-checkIn streak value. */
  streak: number;
  /** ISO timestamp at check-in. */
  recordedAt: string;
};
```

The declared payload shape is **byte-for-byte the contract this row emits**.

Emit-side helper (in this package):

```ts
// internal/emit.ts
import { emitWebEvent } from "@repo/xai-web-event-bus";

export function emitCheckInRecorded(args: {
  habitId: HabitId;
  date: DateKey;
  streak: number;
}): void {
  emitWebEvent("web:habits:checkin-recorded", {
    habitId: args.habitId,
    date: args.date,
    streak: args.streak,
    recordedAt: new Date().toISOString(),
  });
}
```

`@repo/xai-web-event-bus`'s `WebEventMap` (which is the projection of
`web:*` keys from `EventMap`) picks up the channel automatically — no edit
in `@repo/xai-web-event-bus`.

---

## 3. Host wiring (write in P1)

### 3.1 Slot swap

Target file: `apps/web/src/routes/modules/shellRegistrations.tsx`.

Replace line 53 (and add a top-of-file import):

```ts
// Top of file
import { habitsSlotRegistration } from "@repo/plugin-web-habits";

// In webShellModuleRegistrations array — replaces
//   placeholder("habits", "Habits", "pin", 8)
habitsSlotRegistration,
```

No other host-level change. The router (`apps/web/src/routes/router.tsx`)
reads `webShellModuleRegistrations` and auto-mounts every registration's
`children` under `/app/<moduleId>/*`.

### 3.2 `apps/web/package.json` — add workspace dep

Append `"@repo/plugin-web-habits": "workspace:*"` to `dependencies`. Same
single-line additive change pattern shipped W2 rows (matrix, countdown) used.

---

## 4. Error semantics

`HabitsModule` is a leaf UI component — it does not return `Result<T, E>`
style values. Error surfaces:

| Failure mode | Behavior |
|---|---|
| `localStorage.getItem("xai_habits_state")` returns `null` | `usePref` returns its registered `default` (`{ schemaVersion: 1, habits: [], checkIns: {}, diaries: {} }`); module proceeds to seed-hydrate from `internal/seed.ts`. |
| Stored value `JSON.parse` fails | `usePref` falls back to default. Logged via storage layer's existing DEV warning. |
| Stored `schemaVersion !== 1` | `validateHabitsState` returns the default — same as a corrupted blob. v2 will register a migration via `migrate.ts`. |
| Toggle clicked while `state.habits[habitId]` is missing (concurrent delete via another tab) | `toggleCheckIn` early-returns; no state change, no event emit, no exception. |
| Click on a future date in the calendar | Allowed. `toggleCheckIn` writes the date key; `computeStreak` ignores future dates. No exception. |
| `emitWebEvent` throws | `@repo/xai-web-event-bus` swallows + DEV-warns. State change still persists. |
| `crypto.randomUUID()` unavailable (very old browser) | `createId()` falls back to `"h_" + Date.now().toString(36) + Math.random().toString(36).slice(2,8)`. |
| Diary textarea blur with unchanged value | Cheap equality guard skips `setPref` if `value === state.diaries[habitId][monthKey]`. |
| Add-Habit save with empty `titleEn` or `titleZh` | Save button disabled; no `onSave` call; no state mutation. |
| Add-Habit save with empty `emoji` | Default to `"🌱"`. |

No exceptions thrown out of `HabitsModule` for any user-driven interaction.

---

## 5. Idempotency

| Operation | Idempotent? | Notes |
|---|---|---|
| Re-rendering with the same `state` | Yes — React reconciliation. |
| Calling `toggleCheckIn(state, habitId, dateKey)` twice | Yes at value level — returns the original blob via the same code path. |
| Reload after a toggle | Yes — `usePref` reads the persisted blob; no UI flicker. |
| Cross-tab `storage` event arriving with the same state | Yes — `usePref` compares before applying. |
| Multiple rapid clicks on the same hcell | Each click is independent. The visible state alternates; emits per click. |
| Setting the same diary text on blur | Equality guard skips the `setPref` call. |

---

## 6. Permission / capabilities

None — this module does NOT use the host capability layer
(`ConsoleViewCapabilities` from `@repo/core/types`). It is a pure
browser-only component reading + writing localStorage via
`@repo/plugin-web-storage`.

The shell's `capabilities` prop (passed into `render`) is **ignored** by
`HabitsSlotHost` — explicit destructuring `({ capabilities: _capabilities })`
documents the intent.

---

## 7. Performance budget

| Metric | Budget | Rationale |
|---|---|---|
| First render | < 12 ms (jsdom) | List + detail panes; ~5 habits seeded; 4 stat cards; calendar. |
| Check-toggle (state-update + persist + emit) | < 5 ms p99 | One shallow object merge + one JSON.stringify of ≤ ~2 KB blob. |
| Re-render on `usePref` setState | < 8 ms (jsdom) | Single state tree; memoized stat computations. |
| Stat-card recompute on check-toggle | < 1 ms | Pure functions over ≤ 365 keys. |
| Diary textarea keystroke | < 2 ms | Local `useState<string>` mirror; no persist on keystroke. |
| Bundle size (production gzip, this package only) | < 14 KB | 158 LOC prototype + bilingual seed + 10 inline SVGs + ~120 lines CSS. |

These are documented; the verify gate does not enforce them programmatically
in v1 (no perf-budget CI). Listed for future-row sanity checks.

---

## 8. Public-surface stability

Per the W1/W2 convention, this package's public surface is "Production" once
`ship` flips dev_log to SHIPPED. Until then, the surface is "In-Dev" and may
change between phases without notice — but the **shape** declared above is
the target.

Backward-compat rules after ship:

- Adding new optional fields to `Habit` (e.g. `archivedAt?: string`) is
  non-breaking.
- Adding new top-level fields to `HabitsState` (with safe defaults) is
  non-breaking but requires schemaVersion bump + migration registered via
  `@repo/plugin-web-storage`'s `internal/migrate.ts`.
- Changing the persistence key name `xai_habits_state` is breaking —
  requires migration entry.
- Changing the event payload shape is breaking — requires EventMap edit +
  consumer-row coordination.
- Removing any exported name is breaking — requires deprecation row.

---

## 9. Test surface (summary; full mapping in `test.md`)

| Surface | Test file(s) |
|---|---|
| Public barrel | `__tests__/index-barrel.test.ts` |
| Public types | `__tests__/types.test-d.ts` |
| `HabitsModule` render + i18n | `__tests__/HabitsModule.render.test.tsx`, `__tests__/HabitsModule.i18n.test.tsx` |
| Check-toggle + persistence + event emit | `__tests__/HabitsModule.toggle.test.tsx`, `__tests__/HabitsModule.persist.test.tsx`, `__tests__/HabitsModule.events.test.tsx` |
| `computeStreak` (C1) | `__tests__/computeStreak.test.ts` |
| `computeMonthlyCount` / `computeMonthlyRate` / `compute365` | `__tests__/computeStats.test.ts` |
| `toggleCheckIn` reducer | `__tests__/toggle.test.ts` |
| Date helpers (UTC keys, week-start, leap-year) | `__tests__/dateKeys.test.ts` |
| `<StatCard>` | `__tests__/StatCard.test.tsx` |
| `<MonthCalendar>` (month-nav, check-rings, today) | `__tests__/MonthCalendar.test.tsx` |
| `<DiaryCard>` (blur-flush, round-trip) | `__tests__/DiaryCard.test.tsx` |
| `<AddHabitDialog>` (P3) | `__tests__/AddHabitDialog.test.tsx` |
| `<HabitsModule>` add-habit flow | `__tests__/HabitsModule.add.test.tsx` |
| Registry presence | `__tests__/registry-presence.test.ts` |
| Slot registration | `__tests__/registration.test.tsx` |
| CSS tokens-only | `__tests__/styles.css.tokens.test.ts` |
| Validation (`isHabit`, `validateHabitsState`) | `__tests__/validate.test.ts` |


## REL-01 amendment — 2026-09-09 local civil time

This section supersedes historical UTC-day / fixed-24-hour / 2026-Pacific-only assumptions above. User time zone currently follows the browser/device; `xai_pref_dt_timezone` is a display boolean, not a stored IANA choice. Civil `YYYY-MM-DD` keys are date identities and existing keys are not shifted. Absolute ISO/epoch values keep their instant. Natural-day boundaries use the next local midnight (23/24/25 hours and fractional DST days), not 86,400,000 milliseconds.

Shared owner: `@repo/plugin-web-tokens` public `localDateKey`, `parseLocalDateKey`, `addLocalDays`, `startOfLocalDay`, `nextLocalDayStart`, `useLocalDayClock`. The hook refreshes on midnight, focus, pageshow, visible and a 60-second system-clock/time-zone calibration. It cleans timers/listeners on unmount and makes no closed-page execution promise. User-selected historical dates are preserved when today advances.

Regression evidence is tracked in `docs/reviews/web-local-time-contract/dev_log.md`; focused localDate suites run under UTC, America/Los_Angeles, Asia/Shanghai and Australia/Lord_Howe. Full feature suites retain unrelated behavior coverage. Independent verification remains a separate workflow step.
