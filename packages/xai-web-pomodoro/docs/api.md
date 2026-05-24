# API Contract — xai-web-pomodoro

> The single public surface of `@repo/plugin-web-pomodoro`. Consumers
> (`apps/web/src/routes/modules/shellRegistrations.tsx` + `apps/web/src/App.tsx`
> transitively, plus `@repo/plugin-web-statistics` and
> `@repo/plugin-web-dashboard-widgets` once they ship) MUST go through
> `index.ts`. `src/internal/*` is package-private per CLAUDE.md §Code
> Boundaries.

---

## §0 Public Surface (`src/index.ts`)

```ts
// Side-effect CSS — applied once globally when this package is first imported.
import "./styles.css";

// ---- Components ------------------------------------------------------------
export { PomodoroModule } from "./PomodoroModule";

// ---- Slot registration (consumed by apps/web shellRegistrations.tsx) -------
export { pomodoroWebModuleRegistration } from "./registration";

// ---- Public types ----------------------------------------------------------
export type {
  PomodoroSession,
  PomodoroMode,
} from "./types";

// ---- Constants -------------------------------------------------------------
export { DEFAULT_DURATIONS_MS } from "./internal/durations";
```

Nothing else is exported. Deep imports from `src/internal/*` produce a type
error in consumers (enforced by `package.json` `"exports"` field).

---

## §1 Type Surface

### §1.1 `PomodoroMode`

```ts
export type PomodoroMode = "focus" | "short-break" | "long-break";
```

Matches the `mode` field of the EventMap entry `web:pomodoro:session-finished`
(declared in `packages/core/src/types/events.ts` line 201) byte-for-byte.

### §1.2 `PomodoroSession`

```ts
export interface PomodoroSession {
  /** Stable id. Generated via `pomo_<base36(rand)>` at session start. */
  id: string;
  /** Mode of the session. */
  mode: PomodoroMode;
  /** ISO 8601 instant — when the user pressed Start (NOT including any pre-start idle). */
  startedAt: string;
  /** ISO 8601 instant — when the session ended (either ran to zero or End was pressed). */
  finishedAt: string;
  /**
   * Configured duration in ms (e.g. 25*60_000 for focus).
   * Pulled from `DEFAULT_DURATIONS_MS[mode]` at session start.
   * Future Settings W4 can override this at session-start time.
   */
  durationMs: number;
  /**
   * Actual elapsed timer time across one or more run-pause-resume cycles.
   * For a session that ran to zero: elapsedMs === durationMs.
   * For a session ended early: elapsedMs ∈ [0, durationMs).
   * Pauses are NOT counted in elapsedMs.
   */
  elapsedMs: number;
  /**
   * true → ran to zero (countdown reached 0).
   * false → user pressed End before reaching zero.
   */
  completed: boolean;
}
```

### §1.3 `DEFAULT_DURATIONS_MS`

```ts
export const DEFAULT_DURATIONS_MS: Readonly<Record<PomodoroMode, number>>;
```

Values (locked):

| mode | ms | minutes |
|---|---|---|
| `"focus"` | `25 * 60 * 1000` = `1_500_000` | 25 |
| `"short-break"` | `5 * 60 * 1000` = `300_000` | 5 |
| `"long-break"` | `15 * 60 * 1000` = `900_000` | 15 |

Frozen at module load.

---

## §2 Components

### §2.1 `PomodoroModule`

```ts
import type { Lang } from "@repo/plugin-web-tokens";

export interface PomodoroModuleProps {
  /** Active language. Drives useI18n bundle. */
  lang: Lang;
}

export function PomodoroModule(props: PomodoroModuleProps): JSX.Element;
```

Behavior:

- Renders the module header (title + grow spacer + mute icon + dots icon —
  the dots icon is a no-op stub for v1 per prototype).
- Renders the main column (`section.pomo-main`):
  - Focus-pill (mode selector — stub label "Focus", chevron icon, no-op
    click in v1).
  - Circular timer ring (`<svg>` with grey track + accent progress arc + 
    rotating accent dot at ring tip).
  - Inner number (mm:ss) + state label ("Focusing" / "Paused").
  - Action buttons (Start | Continue | End).
- Renders the right rail (`aside.pomo-side`):
  - 4 overview cards (today's pomos / today's focus minutes / total pomos / total focus hours+minutes).
  - "Focus Record" subheader + `+` icon (no-op stub) + dots icon (no-op stub).
  - Grouped list of completed focus sessions (last 7 days, today first).
- Consumes:
  - `useI18n(lang)` from `@repo/plugin-web-tokens` (read-only, pure).
  - `usePref("xai_pomodoro_sessions")` from `@repo/plugin-web-storage`
    (state + setter; persistence is automatic).
  - Internal `useTimerTick` for live remaining time + ring tip animation.
  - Internal `useLocalToday` for the today/yesterday grouping cutoff.
- Emits `web:pomodoro:session-finished` via `emitWebEvent` on every session
  boundary (both completed-to-zero and ended-early).

### §2.2 Internal components (NOT exported)

- `TimerRing` — SVG progress ring + accent dot.
- `PomodoroOverview` — 4-card grid (today/week/total/streak).
  *Note*: per Frozen Assumption 11, the prototype's labels are "Today's Pomos",
  "Today's Focus", "Total Pomos", "Total Focus" — no "week" or "streak" card
  in the layout. The seed brief's "today/week/streak/total" wording is
  interpreted as the four prototype cards (`pomo.todays_pomos`,
  `pomo.todays_focus`, `pomo.total_pomos`, `pomo.total_focus`); a streak/week
  card is **not** added in v1 (prototype fidelity wins; future iteration row
  may add).
- `FocusRecordList` — grouped session list (last 7 days).
- `RecordRow` — single session entry (time + duration).
- `IconChevR`, `IconDots`, `IconSound`, `IconSoundOff`, `IconPlus`,
  `IconTimer` — inlined SVG glyphs that match the prototype's
  `<Icon name="…">` calls. Inlined locally to avoid extending
  `WebShellIconName` for module-internal needs. Each is a 12–18px stroke icon
  matching `web design/icons.jsx` line definitions.

These live under `src/internal/` and are deliberately not in the public surface.

---

## §3 Slot Registration

### §3.1 `pomodoroWebModuleRegistration`

```ts
import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";

export const pomodoroWebModuleRegistration: WebModuleSlotRegistration;
```

Shape:

```ts
{
  moduleId: "pomodoro",
  label: "Pomodoro",
  defaultChildPath: "",
  children: [
    { path: "",   render: () => <PomodoroModule lang={…} /> },
    { path: "*",  render: () => <PomodoroModule lang={…} /> },
  ],
  icon: "timer",             // already in WebShellIconName (packages/xai-web-shell/src/types.ts line 28)
  railOrder: 7,              // matches existing placeholder at shellRegistrations.tsx line 52
  i18nKey: "nav.pomodoro",   // exists in @repo/plugin-web-tokens bundle (i18n.ts line 17)
  showInRail: true,
}
```

**How `lang` flows in:** same as the SHIPPED countdown row #17 pattern. A
thin `<PomodoroModuleRoute>` wrapper inside
`packages/plugin-web-pomodoro/src/registration.tsx` consumes
`useWebShell()` and forwards `lang` to `<PomodoroModule lang={lang} />`. The
wrapper is package-private; the exported registration constant is the same
shape regardless.

### §3.2 Consumer change (host responsibility — out of this package)

`apps/web/src/routes/modules/shellRegistrations.tsx` line currently reading:

```ts
placeholder("pomodoro",   "Pomodoro",   "timer",     7),
```

is replaced (in P3) with:

```ts
pomodoroWebModuleRegistration,
```

(import added at top of file). No other line in `shellRegistrations.tsx`
changes — sibling W2 rows are free to swap their own placeholder lines
independently.

---

## §4 i18n Keys

### §4.1 Keys read from `@repo/plugin-web-tokens` (already in bundle)

All keys below are already in `packages/plugin-web-tokens/src/i18n.ts`
(EN lines 46–61, ZH lines 240–255). **No bundle edits in this row.**

| Key | EN | ZH |
|---|---|---|
| `pomo.title` | "Pomodoro" | "番茄钟" |
| `pomo.focus` | "Focus" | "专注" |
| `pomo.paused` | "Paused" | "已暂停" |
| `pomo.running` | "Focusing" | "专注中" |
| `pomo.start` | "Start" | "开始" |
| `pomo.pause` | "Pause" | "暂停" |
| `pomo.continue` | "Continue" | "继续" |
| `pomo.end` | "End" | "结束" |
| `pomo.overview` | "Overview" | "总览" |
| `pomo.todays_pomos` | "Today's Pomos" | "今日番茄数" |
| `pomo.todays_focus` | "Today's Focus" | "今日专注" |
| `pomo.total_pomos` | "Total Pomos" | "累计番茄" |
| `pomo.total_focus` | "Total Focus" | "累计专注" |
| `pomo.focus_record` | "Focus Record" | "专注记录" |
| `nav.pomodoro` | "Pomodoro" | "番茄钟" |
| `common.today` | "Today" | "今天" |
| `common.yesterday` | "Yesterday" | "昨天" |

### §4.2 Inline literals (NOT bundled — matches prototype style)

The prototype precedent (`<AddCountdownCard>`) hard-codes minor module-local
labels via `lang === "zh" ? "..." : "..."`. We follow the same pattern for
strings that are NOT in the existing pomo.* bundle.

| Use site | EN | ZH |
|---|---|---|
| Duration unit (minutes display) | "m" | "分" |
| Duration unit (hours display) | "h" | "时" |
| Date label "M/D" formatter (US-style) | (numeric) | (numeric — same) |

Future bundle extension may migrate these; v1 keeps them local to avoid
touching `@repo/plugin-web-tokens` from this row's write scope.

---

## §5 Persistence Contract

### §5.1 Storage shape

Key `xai_pomodoro_sessions` (registry entry already declared in
`@repo/plugin-web-storage/src/internal/registry.ts` lines 302–310,
`proposed: true`).

```ts
// localStorage["xai_pomodoro_sessions"] (JSON-encoded):
//   PomodoroSession[]
```

The registry declares the value as `unknown[]` (`PomodoroSession = unknown`
in the storage layer). Our boundary cast:

```ts
const [rawSessions, setRawSessions] = usePref("xai_pomodoro_sessions");
const sessions: PomodoroSession[] = useMemo(() => {
  if (!Array.isArray(rawSessions)) return [];
  return rawSessions.filter(isPomodoroSession);
}, [rawSessions]);
```

The `isPomodoroSession(x: unknown): x is PomodoroSession` predicate lives in
`src/internal/validate.ts`. Invalid entries log a DEV `console.warn` and are
silently dropped.

### §5.2 Mutation API (internal — exposed only to this package's components)

```ts
// All return new arrays — never mutate in place. usePref's setter performs
// stable JSON-equality check before writing to localStorage.

function appendSession(
  prev: PomodoroSession[],
  session: PomodoroSession,
): PomodoroSession[];
```

Lives in `src/internal/sessionsReducer.ts`. Pure function (no storage IO
inside). v1 has only `appendSession` — no update/delete operations exposed
(the `+` and `…` stub buttons in the prototype are no-ops).

### §5.3 ID generation

```ts
function newSessionId(): string {
  return "pomo_" + Math.floor(Math.random() * 36 ** 8).toString(36).padStart(8, "0");
}
```

No uniqueness guarantee beyond `Math.random()`; on collision, `appendSession`
re-rolls. Collision probability is negligible at human-scale session counts
(< 10⁶ records).

### §5.4 No migration in v1

Schema version stays `1` per registry entry. No `registerMigration` call.

### §5.5 Storage growth bounds

- ~100 bytes per session (JSON-encoded).
- Heavy use (20 sessions/day) over 1 year = ~730 KB.
- localStorage typical limit: 5 MB → comfortable headroom.
- Future "trim older than 1 year" sweep is a separate row.

---

## §6 Timer Lifecycle

### §6.1 State machine (formal — matches design.md §5)

```
            Start                Pause                Resume
   idle ─────────────► running ─────────► paused ─────────────► running
    ▲                    │                  │                     │
    │  End/Tick-to-zero  │                  │ End                 │ End/Tick-to-zero
    └────────────────────┴──────────────────┴─────────────────────┘
```

| Transition | What happens |
|---|---|
| `idle → running` | mint `sessionId` + `sessionStartedAt`; set `startedAt = Date.now()`, `remainingAtStartMs = DEFAULT_DURATIONS_MS[mode]`; kick rAF loop |
| `running → paused` | compute `remainingMs = max(0, remainingAtStartMs - (Date.now() - startedAt))`; accumulate elapsed; cancel rAF |
| `paused → running` | set `startedAt = Date.now()`, `remainingAtStartMs = paused.remainingMs`; kick rAF loop |
| `running → idle` (End) | compute elapsedMs from the current run + any prior pause-accumulated elapsed; append session record with `completed: false`; emit event; advance to next mode in cycle |
| `running → idle` (tick-to-zero) | elapsedMs := durationMs; append session record with `completed: true`; emit event; call `notifySessionEnd` (no-op when flag off); advance to next mode in cycle |
| `paused → idle` (End) | use already-accumulated elapsed; append session record with `completed: false`; emit event; advance to next mode in cycle |

### §6.2 Recompute triggers (the live-tick hook)

1. **On entering `running`** — synchronous initial computation; start rAF
   loop.
2. **Each `requestAnimationFrame`** — compute remaining from `Date.now()`;
   update the rotating-dot's `transform` directly via ref (no React render);
   call `setRemaining(newSeconds)` only when the displayed second changes.
3. **On `visibilitychange → visible`** — synchronous recompute (one extra
   `setState`); rAF resumes naturally (it was paused/throttled during blur).
4. **On `pageshow`** (mobile Safari bfcache) — same as `visibilitychange`.
5. **On unmount** — cancel rAF + remove listeners.

### §6.3 Computation (deterministic, testable)

```ts
function computeRemainingMs(
  startedAt: number,            // Date.now() at run start (epoch ms)
  remainingAtStartMs: number,   // ms remaining when run began
  nowMs: number,                // Date.now() (passed in for testability)
): number {
  return Math.max(0, remainingAtStartMs - (nowMs - startedAt));
}
```

Pure function in `src/internal/computeRemainingMs.ts`. Test cases enumerated
in `docs/test.md` §3 (zero-time → full remaining; exactly-at-zero; mid-run;
post-completion; out-of-order args; large drift).

### §6.4 Mode cycle (deterministic)

```ts
function nextMode(prev: PomodoroMode, focusCountInSession: number): PomodoroMode {
  if (prev !== "focus") return "focus";
  if (focusCountInSession % 4 === 0) return "long-break";
  return "short-break";
}
```

`focusCountInSession` is derived from `sessions.filter(s => s.completed && s.mode === "focus").length` — i.e. every 4th completed focus session triggers a long-break next. Pure function; test in `src/__tests__/nextMode.test.ts`.

---

## §7 Error Semantics

| Error condition | Behavior |
|---|---|
| `usePref` returns non-array (corrupted localStorage) | Coerce to `[]`, DEV warn, no UI crash |
| `usePref` returns array with invalid entries | Filter via `isPomodoroSession`, DEV warn per dropped entry, no UI crash |
| System clock jumps backwards mid-session (NTP/manual) | Display value can briefly increase; next rAF/`visibilitychange` recompute settles. Documented edge case; no special handling. |
| System clock jumps forwards mid-session | Timer "ends" sooner than expected at next rAF; same session-end path. Acceptable. |
| `Date.now()` and `performance.now()` diverge | We only use `Date.now()`. No divergence in our code. |
| StrictMode double-mount | rAF cleanup + listener cleanup handle double-mount; no double-emit (the `running` → `idle` transition is guarded by a `useRef` "emitted-for-sessionId" guard). |
| Storage quota exceeded on `setPref` | `usePref` setter throws; we catch in our setter wrapper and DEV warn — the timer state stays consistent (the session record is dropped but the in-memory state machine continues). |
| `emitWebEvent` synchronous listener throws | The bus's internal try/catch isolates the throw per existing `@repo/xai-web-event-bus` contract; our emit code does not wrap in try/catch. |
| `Notification` API unavailable (older browser, insecure context) | `notifySessionEnd` returns early; no error thrown. (`NOTIFICATIONS_ENABLED` flag is false in v1; this is future-proofing.) |
| Tab refreshed while session is running | Session state is in memory only — lost on refresh. v1 does NOT persist `running`/`paused` state. Documented as a known limitation; future row may add session-resumption. |

---

## §8 Concurrency / Idempotency

- No async network calls. All operations are synchronous DOM/storage actions.
- `setSessions` writes are batched by React's state update cycle; no
  optimistic-then-revert flow.
- `emitWebEvent` is fire-and-forget; idempotency on the consumer side is
  the consumer's responsibility. We do NOT emit the same `sessionId`
  twice — the StrictMode double-mount guard ensures one emit per session.
- StorageEvent (cross-tab sync) is handled by `usePref` already (per
  `@repo/plugin-web-storage` SHIPPED contract); if a sibling tab completes
  a session, our tab's overview cards refresh automatically.
- Two tabs running pomodoro simultaneously is not a supported workflow
  (each tab has its own in-memory `running` state). Documented; future row
  may add cross-tab leader election.

---

## §9 Cross-module Communication

### §9.1 Emit

Single emit point — `src/internal/PomodoroModule.tsx` calls
`emitWebEvent("web:pomodoro:session-finished", payload)` inside the session-end
useEffect that fires once per session boundary.

The payload conforms byte-for-byte to the existing EventMap declaration
(`packages/core/src/types/events.ts` lines 198–206):

```ts
{
  mode: "focus" | "short-break" | "long-break",
  durationMs: number,    // === session.elapsedMs (actual, not configured)
  finishedAt: string,    // ISO 8601 instant; === session.finishedAt
}
```

We do NOT call `emitWebEvent` for the `web:shell:module-change` channel —
that is the rail's job, not the module's.

### §9.2 Listen

NONE in v1. The Pomodoro module does not subscribe to any `web:*` channel.

### §9.3 No new EventMap entries

`packages/core/src/types/events.ts` is **not edited** by this row. The
declaration was already shipped in W1 per ADR §S7.

---

## §10 Versioning

- Package version: `0.0.0` initially. Bumped to `0.1.0` on first ship.
- Public surface stability: §0 lines are SemVer-tracked. Internal
  reorganization (moving files inside `src/internal/`) is patch-level.
- Storage schema version: `1` (per registry entry); a future bump is a
  separate row.

---

## §11 Manifest / package.json contract

```json
{
  "name": "@repo/plugin-web-pomodoro",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "sideEffects": ["./src/styles.css", "./src/index.ts"],
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./src/index.ts"
    }
  },
  "scripts": {
    "lint": "eslint --max-warnings 0 .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "dependencies": {
    "@repo/core": "workspace:*",
    "@repo/plugin-web-tokens": "workspace:*",
    "@repo/plugin-web-storage": "workspace:*",
    "@repo/xai-web-event-bus": "workspace:*",
    "@repo/xai-web-shell": "workspace:*"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/react": "^16.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "jsdom": "^26.0.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "typescript": "5.9.2",
    "vitest": "^3.2.1"
  }
}
```

`manifest.json`:

```json
{
  "name": "plugin-web-pomodoro",
  "status": "In-Dev",
  "type": "ui",
  "owner": "xai-web-pomodoro row #14"
}
```
