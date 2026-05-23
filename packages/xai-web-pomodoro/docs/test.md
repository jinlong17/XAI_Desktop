# Test Strategy — xai-web-pomodoro

> Acceptance criteria grid + concrete test mapping. Each AC row maps to one
> or more test cases under `packages/plugin-web-pomodoro/src/__tests__/`
> (created during P1+P2+P3). The Manual Verify section (§5) is the cross-vendor
> gate that READY_TO_SHIP depends on (per row #14 manifest entry
> `Verify Cross-vendor: yes`).

## §1 Toolchain

- Unit / component tests: Vitest + `@testing-library/react@^16` (same
  versions as sibling rows shipped from W1/W2).
- Test environment: `jsdom@^26`.
- React 19 + StrictMode in every test root.
- Mock strategy:
  - `@repo/plugin-web-storage`'s `usePref` is consumed for **real**
    (real localStorage-backed). Tests use `localStorage.clear()` in
    `afterEach`.
  - `@repo/plugin-web-tokens`'s `useI18n` is consumed for **real**.
  - `@repo/xai-web-shell` — only types are imported. The
    `WebModuleSlotRegistration` shape is asserted via a barrel test
    (B-type-check).
  - `@repo/xai-web-event-bus` — `emitWebEvent` consumed for **real**.
    Tests use `onWebEvent("web:pomodoro:session-finished", ...)` to verify
    payload contents.
  - `Date.now()` and `requestAnimationFrame` mocked via `vi.useFakeTimers()` +
    `vi.setSystemTime()` for the timer state machine. `rAF` is shimmed in
    `vitest.setup.ts` to a `setTimeout(0)` polyfill so fake timers can drive
    frame advancement.
  - `document.visibilityState` + `visibilitychange` event dispatched
    manually in tests that exercise return-to-tab.
  - `Notification` API is NOT used in v1 (feature flag is `false`).
- Lint: 0 warnings (`pnpm --filter @repo/plugin-web-pomodoro lint`).
- Coverage target: ≥ 90% statements and branches inside
  `packages/plugin-web-pomodoro/src/` (excluding `__fixtures__/` and
  `__tests__/`).

## §2 Test File Inventory (planned)

| File | Tests | Purpose |
|---|---|---|
| `src/__tests__/index-barrel.test.ts` | B1..B5 | Public surface is exactly what api.md §0 lists; no deep imports succeed; type-shape asserts via `expectTypeOf` |
| `src/__tests__/computeRemainingMs.test.ts` | C1..C8 | Pure function: zero elapsed → full remaining; full elapsed → 0; over-elapsed → 0 clamped; partial elapsed → ms math; large `nowMs - startedAt` → 0; negative arg ordering tolerated; sub-second precision (250ms granularity expected); idempotent same-input |
| `src/__tests__/nextMode.test.ts` | N1..N6 | Cycle: focus + count 1..3 → short-break; focus + count 4 → long-break; focus + count 5..7 → short-break; focus + count 8 → long-break; non-focus (any count) → focus; identity on edge `count === 0` |
| `src/__tests__/validate.test.ts` | V1..V8 | `isPomodoroSession` accepts valid; rejects missing id, missing mode, invalid mode literal, missing startedAt, missing finishedAt, missing durationMs (not number), missing elapsedMs (not number), missing completed (not boolean), extra fields tolerated |
| `src/__tests__/sessionsReducer.test.ts` | R1..R5 | `appendSession` appends to end, immutability (input array unchanged), preserves order, handles empty starting array, handles 1000+ existing sessions (perf smoke) |
| `src/__tests__/derivedCounters.test.ts` | DC1..DC9 | Pure derivation helpers (`countTodaysPomos`, `sumTodaysFocusMs`, `countTotalPomos`, `sumTotalFocusMs`, `computeStreak`): empty array → all zero; only-non-focus → all zero; today's focus only counted in today's counters; yesterday excluded from "today"; total includes all completed focus regardless of date; non-completed excluded from totals; streak = 0 when nothing today AND nothing yesterday; streak counts back through consecutive days; streak breaks at first gap |
| `src/__tests__/formatLocalTime.test.ts` | F1..F3 | `formatLocalTime("2026-05-23T14:32:00Z")` → `"14:32"` (in user local TZ); midnight rendered as `00:00`; one-digit hour padded |
| `src/__tests__/formatDuration.test.ts` | FD1..FD5 | `formatDuration(25*60_000)` → `"25:00"`; `12*60_000 + 34_000` → `"12:34"`; 0 → `"0:00"`; sub-second flooring (`12_500ms` → `"0:12"`); over-hour values (`3700_000` → `"61:40"`) |
| `src/__tests__/formatRecordDate.test.ts` | FR1..FR6 | "2026-05-23" matches today → `"Today"` (en) / `"今天"` (zh); "2026-05-22" → `"Yesterday"` / `"昨天"`; "2026-05-20" → `"5/20"` (en) / `"5月20日"` (zh); cross-year handled; both langs handled |
| `src/__tests__/useTimerTick.test.tsx` | UT1..UT8 | Hook: idle state → no rAF; transition idle→running starts rAF; tick fires rerender ONLY on second-change (rAF spy counts > setState calls); pause cancels rAF; resume restarts rAF; visibilitychange recompute on return; pageshow recompute on bfcache return; unmount cleanup clears rAF + listeners; StrictMode double-mount no leak |
| `src/__tests__/TimerRing.test.tsx` | TR1..TR4 | Renders grey track + accent progress arc; `strokeDashoffset` interpolated from progress prop; accent dot transform rotates as progress increases; progress=0 dot at top (12 o'clock); progress=0.25 dot at 3 o'clock |
| `src/__tests__/PomodoroOverview.test.tsx` | PO1..PO5 | Renders 4 cards with correct labels (lang-correct); today's pomos counter; today's focus minutes formatted (e.g. "75m"); total focus hours+minutes formatted (e.g. "1h 15m"); zero values render as "0" |
| `src/__tests__/FocusRecordList.test.tsx` | FRL1..FRL6 | Empty array → empty list (no group headers); single today session → 1 group with 1 row; sessions across 3 days → 3 groups, today first; >7 days → truncates to 7 groups; rows show formatted time + duration; bilingual date label |
| `src/__tests__/PomodoroModule.test.tsx` | M1..M15 | Empty state (no sessions): renders idle UI, no records, all-zero counters; click Start: state → running, ring animates; tick to zero: writes session to localStorage with completed=true; counters reflect new session; Pause mid-run: state → paused, remaining frozen; Resume from pause: state → running, remaining picks up; End mid-run: writes completed=false session; mode-cycle advances to short-break after focus; emits web:pomodoro:session-finished on completion; emits on End-early; payload contains correct mode/durationMs(=elapsedMs)/finishedAt; lang switch en↔zh re-renders labels; StrictMode double-mount no double-persist + no double-emit; corrupted localStorage entry filtered + DEV warn; mute icon toggles muted state (UI-only in v1) |
| `src/__tests__/registration.test.tsx` | RG1..RG3 | `pomodoroWebModuleRegistration` satisfies `WebModuleSlotRegistration`; moduleId/icon/railOrder/i18nKey match design.md §3.1 / api.md §3.1; defaultChildPath empty + 2 children entries |
| `src/__tests__/eventEmit.integration.test.tsx` | EE1..EE5 | Subscribe via `onWebEvent`; trigger session completion; assert single event fires with correct payload; no event fires on Pause; no event fires on Resume; one event per session id (StrictMode double-mount yields one emit, not two) |

## §3 Acceptance Criteria Grid

### AC-TIMER (Live timer + tab-blur survival)

| AC | Statement | Test |
|---|---|---|
| AC-TIMER-1 | Pressing Start transitions state idle→running and begins decrement | M2, UT2 |
| AC-TIMER-2 | Displayed seconds tick down at 1 Hz when tab is foreground | M2, UT3 |
| AC-TIMER-3 | Accent dot rotates sub-second (60 Hz rAF) | TR3 (transform assert) |
| AC-TIMER-4 | Pause freezes the displayed remaining; no further decrement | M5, UT4 |
| AC-TIMER-5 | Resume continues from the paused remaining (no drift) | M6, UT5 |
| AC-TIMER-6 | Backgrounded tab + 5-minute foreground return → displayed value reflects 5 minutes elapsed (visibilitychange recompute) | UT6, MV-7 (manual) |
| AC-TIMER-7 | Backgrounded tab → mobile Safari bfcache → restore → pageshow recompute | UT7, MV-8 (manual) |
| AC-TIMER-8 | StrictMode double-mount: only one rAF loop active (no leak) | UT8 |
| AC-TIMER-9 | Unmount during running: cancels rAF + removes listeners | UT8 |
| AC-TIMER-10 | Tick-to-zero auto-transitions running→idle and advances mode | M3, M8 |

### AC-SCHEMA (Storage shape)

| AC | Statement | Test |
|---|---|---|
| AC-SCHEMA-1 | `xai_pomodoro_sessions` value is `PomodoroSession[]` (array; never object) | M3, V1 |
| AC-SCHEMA-2 | Completing a focus session persists a record immediately | M3 |
| AC-SCHEMA-3 | Each record has all 7 fields (id, mode, startedAt, finishedAt, durationMs, elapsedMs, completed) | M3, V1 |
| AC-SCHEMA-4 | `completed: true` for tick-to-zero session | M3 |
| AC-SCHEMA-5 | `completed: false` for End-early session | M7 |
| AC-SCHEMA-6 | `elapsedMs` equals `durationMs` for completed sessions | M3 |
| AC-SCHEMA-7 | `elapsedMs < durationMs` for End-early sessions | M7 |
| AC-SCHEMA-8 | Pause-then-resume does NOT inflate `elapsedMs` (pauses excluded) | M5+M6 sequence |
| AC-SCHEMA-9 | Corrupted localStorage entry (missing field) filtered out + DEV warn | M14, V2..V8 |
| AC-SCHEMA-10 | Cross-tab `storage` event refreshes overview cards (already by usePref contract) | M-cross-tab (covered transitively by usePref tests; smoke test here) |

### AC-EVENT (`web:pomodoro:session-finished` emit)

| AC | Statement | Test |
|---|---|---|
| AC-EVENT-1 | Event fires on tick-to-zero session completion | EE1, M9 |
| AC-EVENT-2 | Event fires on End-early session completion | EE2, M10 |
| AC-EVENT-3 | Event payload `mode` matches the session's mode | EE3, M11 |
| AC-EVENT-4 | Event payload `durationMs` equals session's `elapsedMs` (actual elapsed, NOT configured) | EE3, M11 |
| AC-EVENT-5 | Event payload `finishedAt` matches session's `finishedAt` | EE3, M11 |
| AC-EVENT-6 | NO event fires on Pause | EE4 |
| AC-EVENT-7 | NO event fires on Resume | EE5 |
| AC-EVENT-8 | StrictMode double-mount: exactly ONE emit per session id (no duplicate) | EE-strict, M13 |

### AC-OVERVIEW (4 cards)

| AC | Statement | Test |
|---|---|---|
| AC-OV-1 | Today's pomos = count of completed focus sessions today (local TZ) | DC1..DC3, PO2 |
| AC-OV-2 | Today's focus = sum of elapsedMs/60_000 (minutes) for same filter | DC4, PO3 |
| AC-OV-3 | Total pomos = count of all completed focus sessions | DC5, PO2 |
| AC-OV-4 | Total focus = sum of elapsedMs across all completed focus, formatted h+m | DC6, PO4 |
| AC-OV-5 | Yesterday's sessions excluded from "today's" counters | DC7 |
| AC-OV-6 | Non-focus sessions (short-break, long-break) excluded from all overview counters | DC2 |
| AC-OV-7 | End-early sessions excluded from totals (only `completed: true` counted) | DC8 |
| AC-OV-8 | Zero-value cards render as `"0"` (not blank) | PO5 |

### AC-RECORD (Focus record list)

| AC | Statement | Test |
|---|---|---|
| AC-REC-1 | Empty sessions array → empty list (no group headers, no rows) | FRL1, M1 |
| AC-REC-2 | Single completed-today session → 1 group ("Today") + 1 row | FRL2 |
| AC-REC-3 | Sessions span 3 days → 3 groups, today first | FRL3 |
| AC-REC-4 | More than 7 distinct days → first 7 only | FRL4 |
| AC-REC-5 | Row shows formatted local time (HH:MM) | FRL5 |
| AC-REC-6 | Row shows formatted duration (M:SS) | FRL5 |
| AC-REC-7 | "Today" / "Yesterday" / "M/D" date labels (en) | FRL6, FR1..FR6 |
| AC-REC-8 | "今天" / "昨天" / "M月D日" date labels (zh) | FRL6, FR1..FR6 |
| AC-REC-9 | Non-completed sessions excluded from record list | FRL-completed-only |
| AC-REC-10 | Non-focus sessions excluded from record list | FRL-focus-only |

### AC-MODE-CYCLE (Mode rotation)

| AC | Statement | Test |
|---|---|---|
| AC-MC-1 | After 1st completed focus → mode = short-break | M8, N1 |
| AC-MC-2 | After 4th completed focus → mode = long-break | N2 |
| AC-MC-3 | After short-break completion → mode = focus | N5 |
| AC-MC-4 | After long-break completion → mode = focus | N5 |
| AC-MC-5 | End-early does NOT count toward 4-focus long-break trigger | M-no-credit (focus count uses completed:true filter per nextMode contract) |

### AC-I18N (Bilingual)

| AC | Statement | Test |
|---|---|---|
| AC-I18N-1 | `lang="en"` renders "Pomodoro" title + "Focusing"/"Paused" state labels | M12-en |
| AC-I18N-2 | `lang="zh"` renders "番茄钟" title + "专注中"/"已暂停" state labels | M12-zh |
| AC-I18N-3 | Action buttons: "Start"/"Continue"/"End" (en) ↔ "开始"/"继续"/"结束" (zh) | M12 |
| AC-I18N-4 | Overview labels switch lang | PO1 (both langs) |
| AC-I18N-5 | Record date labels switch lang | FR1..FR6, FRL6 |
| AC-I18N-6 | Lang switch at runtime re-renders all labels without remount | M12 |

### AC-REGISTRATION (Shell slot)

| AC | Statement | Test |
|---|---|---|
| AC-REG-1 | `pomodoroWebModuleRegistration` satisfies `WebModuleSlotRegistration` type | RG1 |
| AC-REG-2 | `moduleId="pomodoro"`, `icon="timer"`, `railOrder=7`, `i18nKey="nav.pomodoro"` | RG2 |
| AC-REG-3 | `defaultChildPath=""`, `children` has `""` + `"*"` entries | RG3 |

### AC-BARREL (Public surface)

| AC | Statement | Test |
|---|---|---|
| AC-BARREL-1 | `index.ts` exports `PomodoroModule`, `pomodoroWebModuleRegistration`, `DEFAULT_DURATIONS_MS` | B1 |
| AC-BARREL-2 | `index.ts` exports types `PomodoroSession`, `PomodoroMode` | B2 |
| AC-BARREL-3 | No other exports leak | B3 |
| AC-BARREL-4 | Deep import from `src/internal/*` is forbidden by `package.json` exports | B4 (typecheck) |
| AC-BARREL-5 | Type shape of `PomodoroSession` matches api.md §1.2 byte-for-byte | B5 (`expectTypeOf`) |

## §4 Test mock fixtures

### `src/__fixtures__/sessions.ts`

```ts
import type { PomodoroSession } from "../types";

const TODAY = "2026-05-23T14:30:00.000Z";       // matches vitest.setup.ts TEST_NOW
const YESTERDAY = "2026-05-22T15:00:00.000Z";
const TWO_DAYS_AGO = "2026-05-21T16:00:00.000Z";

export const FIXTURE_FOCUS_TODAY: PomodoroSession = {
  id: "pomo_test01",
  mode: "focus",
  startedAt: "2026-05-23T14:05:00.000Z",
  finishedAt: "2026-05-23T14:30:00.000Z",
  durationMs: 25 * 60 * 1000,
  elapsedMs: 25 * 60 * 1000,
  completed: true,
};

export const FIXTURE_FOCUS_TODAY_PARTIAL: PomodoroSession = {
  id: "pomo_test02",
  mode: "focus",
  startedAt: "2026-05-23T13:00:00.000Z",
  finishedAt: "2026-05-23T13:12:34.000Z",
  durationMs: 25 * 60 * 1000,
  elapsedMs: 12 * 60_000 + 34_000,
  completed: false,
};

export const FIXTURE_FOCUS_YESTERDAY: PomodoroSession = {
  id: "pomo_test03",
  mode: "focus",
  startedAt: "2026-05-22T14:35:00.000Z",
  finishedAt: "2026-05-22T15:00:00.000Z",
  durationMs: 25 * 60 * 1000,
  elapsedMs: 25 * 60 * 1000,
  completed: true,
};

export const FIXTURE_SHORT_BREAK_TODAY: PomodoroSession = {
  id: "pomo_test04",
  mode: "short-break",
  startedAt: "2026-05-23T14:30:00.000Z",
  finishedAt: "2026-05-23T14:35:00.000Z",
  durationMs: 5 * 60 * 1000,
  elapsedMs: 5 * 60 * 1000,
  completed: true,
};

export const FIXTURE_INVALID: unknown = {
  id: "pomo_bad",
  mode: "focus",
  startedAt: "2026-05-23T14:00:00.000Z",
  // missing finishedAt — should fail predicate
  durationMs: 25 * 60 * 1000,
  elapsedMs: 25 * 60 * 1000,
  completed: true,
};
```

### `vitest.setup.ts` (root jsdom shim)

```ts
import { vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom";

// requestAnimationFrame polyfill driven by fake timers
if (typeof globalThis.requestAnimationFrame !== "function") {
  globalThis.requestAnimationFrame = (cb: FrameRequestCallback): number => {
    return setTimeout(() => cb(Date.now()), 16) as unknown as number;
  };
}
if (typeof globalThis.cancelAnimationFrame !== "function") {
  globalThis.cancelAnimationFrame = (id: number): void => {
    clearTimeout(id);
  };
}

// Set a stable test "now"
const TEST_NOW = new Date(2026, 4, 23, 14, 30, 0); // 2026-05-23 14:30 local

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(TEST_NOW);
});

afterEach(() => {
  vi.useRealTimers();
  localStorage.clear();
});
```

## §5 Manual Verify (Cross-vendor — required for READY_TO_SHIP)

Per row #14 `Verify Cross-vendor: yes`. The following checklist MUST be
walked in all three target browsers before `feature-verify` flips to
READY_TO_SHIP.

### Browsers in scope

- Chrome latest (Chromium 120+)
- Safari 17+ on macOS
- Firefox latest (122+)

### Manual checklist

| # | Step | Expected | Browsers |
|---|---|---|---|
| MV-1 | Navigate to `/app/pomodoro` from rail click | Module mounts; URL becomes `/app/pomodoro`; AppRail Pomodoro button highlighted | All 3 |
| MV-2 | Empty state (clear localStorage first, reload) | All-zero counters; "Focus Record" empty list; idle state showing "25:00" | All 3 |
| MV-3 | Press Start | State label → "Focusing"; ring begins to fill; mm:ss decrements every second; accent dot rotates smoothly (not jumpy) | All 3 |
| MV-4 | Wait 30 seconds of foreground ticking | Display shows "24:30" (±1s tolerance) | All 3 |
| MV-5 | Press End mid-run | State → idle; ring resets to full; a `completed: false` record appears in Focus Record list "Today" group | All 3 |
| MV-6 | Press Start; press Pause after 10s | State → "Paused"; remaining frozen at ~"24:50"; ring stops animating; accent dot static | All 3 |
| MV-7 | While paused, wait 30s of foreground; press Continue | Display still shows "24:50" (no drift during pause); state → "Focusing"; resumes ticking from 24:50 | All 3 |
| MV-8 | Press Start; switch to another tab for 2 minutes; switch back | Display jumps to "22:50" (2 min elapsed during blur); rAF resumes; ticking continues | All 3 |
| MV-9 | On mobile Safari (or simulated bfcache): hide tab via App Switcher for 1 minute, restore | `pageshow` fires; display recomputes; ticking continues | Safari (mobile or sim) |
| MV-10 | Set a focus session to 5 seconds (temp constant in DEV); wait for tick-to-zero | At zero: state → idle; record appears with `completed: true`; mode-cycle advances → short-break (label changes from "Focus" to "Short Break" in focus-pill) | All 3 |
| MV-11 | Switch lang en↔zh via Topbar | Title "Pomodoro" ↔ "番茄钟"; state label "Focusing" ↔ "专注中"; buttons "Start"/"Continue"/"End" ↔ "开始"/"继续"/"结束"; "Today's Pomos" ↔ "今日番茄数"; record dates "Today" ↔ "今天" | All 3 |
| MV-12 | Reload page mid-running | Timer state lost (documented limitation); idle UI; previously-completed sessions persist | All 3 |
| MV-13 | Open browser DevTools → Application → Local Storage; verify `xai_pomodoro_sessions` is `[{ id, mode, ... }, ...]` | JSON array shape per api.md §1.2 | All 3 |
| MV-14 | Subscribe to `web:pomodoro:session-finished` via temporary DevTools console listener; complete a session | Event fires once with correct payload `{ mode, durationMs, finishedAt }` | All 3 |
| MV-15 | Mute icon click | Toggles mute icon (soundOff ↔ sound); no audible effect in v1 (sound deferred) | All 3 |
| MV-16 | Complete 4 focus sessions in a row | 4th tick-to-zero → mode-cycle advances to "long-break" (15:00) instead of "short-break" (5:00) | All 3 |
| MV-17 | Verify ring rendering: progress arc + rotating dot at arc tip | Dot visibly rotates from 12 o'clock position around the ring as time elapses; arc fills clockwise | All 3 (visual) |

### Cross-vendor concerns

- **Safari `<svg>` `transform` attribute** — historically Safari was lazy about applying `transform="rotate(...)"` via DOM `setAttribute`. We use `style.transform` on the `<circle>` element if Safari shows lag (fallback in P1 if MV-17 reveals issue). MV-3 and MV-17 are the focus checks.
- **Firefox `requestAnimationFrame` while throttled** — Firefox can throttle rAF to 1 Hz in background tabs. Our `visibilitychange` recompute is the safety net (MV-8).
- **mobile Safari bfcache** — `pageshow` event fires when restoring from bfcache; our listener catches this (MV-9).
- **Time-zone offset on `formatLocalTime`** — `toLocaleTimeString` with explicit `hour12: false` for HH:MM is consistent across all three browsers when locale falls back to UTC for unknown lang. We pass `lang` as locale ("en" / "zh") which both browsers handle identically for time format.

## §6 Coverage gates

- Statement coverage: ≥ 90% in `packages/plugin-web-pomodoro/src/`
- Branch coverage: ≥ 90%
- Excluded from coverage: `src/__fixtures__/`, `src/__tests__/`,
  `src/styles.css`.

## §7 Build verification

- `pnpm --filter @repo/plugin-web-pomodoro lint` → 0 warnings
- `pnpm --filter @repo/plugin-web-pomodoro typecheck` → clean (tsc --noEmit)
- `pnpm --filter @repo/plugin-web-pomodoro test` → all suites green
- `pnpm --filter @repo/plugin-web-pomodoro test:coverage` → meets §6 gates
- `pnpm --filter @repo/web check-types` → clean (host-side type compat)
- `pnpm --filter @repo/web build` → Vite production build green (ship-time gate)

## §8 Test execution order (build-phase)

Phase P1 implements + tests:
- `index-barrel.test.ts` (B1..B5 — partial; full once registration lands in P3)
- `validate.test.ts` (V1..V8)
- `computeRemainingMs.test.ts` (C1..C8)
- `nextMode.test.ts` (N1..N6)
- `sessionsReducer.test.ts` (R1..R5)
- `formatLocalTime.test.ts` (F1..F3)
- `formatDuration.test.ts` (FD1..FD5)
- `formatRecordDate.test.ts` (FR1..FR6)
- `derivedCounters.test.ts` (DC1..DC9)
- `TimerRing.test.tsx` (TR1..TR4)
- `PomodoroOverview.test.tsx` (PO1..PO5)
- `FocusRecordList.test.tsx` (FRL1..FRL6)

Phase P2 implements + tests:
- `useTimerTick.test.tsx` (UT1..UT8)
- `PomodoroModule.test.tsx` (M1..M15)
- `eventEmit.integration.test.tsx` (EE1..EE5)

Phase P3 implements + tests:
- `registration.test.tsx` (RG1..RG3)
- `index-barrel.test.ts` re-run with `pomodoroWebModuleRegistration` added (B1 full)
- Optional `apps/web/src/__tests__/pomodoro.smoke.test.tsx` (smoke mount via MemoryRouter on `/app/pomodoro`; if host smoke conventions don't yet establish this, defer to manual verify §5).
