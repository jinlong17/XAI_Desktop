# Design Snapshot — xai-web-pomodoro

> Decision crystal. Rationale lives in
> `docs/reviews/xai-web-pomodoro/20260523-discovery-review.md`. This file is
> intentionally short — it locks the picked option + frozen assumptions only.

## Selected Option

**Bundle:** T-A (absolute `Date.now()` deadline + `requestAnimationFrame` redraw + `visibilitychange` recompute) + S-A (flat `PomodoroSession[]` array; counters derived) + H-A (rotating accent dot at ring tip) + E-A (emit `web:pomodoro:session-finished` on completion + partial) + N-A (notifications feature-flag stub) + D-A (hard-coded 25/5/15 durations) + L-A (last-7-days history list grouped by local day).

`@repo/plugin-web-pomodoro` is a leaf React package registering one slot into
`apps/web/src/routes/modules/shellRegistrations.tsx`. All completed sessions
persist through `usePref("xai_pomodoro_sessions")`. The event channel
`web:pomodoro:session-finished` is already declared in
`packages/core/src/types/events.ts` (W1-shipped) — we emit only. No edits to
`@repo/plugin-web-storage`, `@repo/plugin-web-tokens`, `@repo/core`,
`@repo/xai-web-shell`, or `@repo/xai-web-event-bus` source files in this row.

## Review Doc Path

`docs/reviews/xai-web-pomodoro/20260523-discovery-review.md`

## Review Date / Version

2026-05-23 · v1 (W2 row #14 · parallel-Agent dispatch with siblings #6 tasks / #15 habits)

## Frozen Assumptions (12)

1. **Package name** — `@repo/plugin-web-pomodoro` (per ADR-0007 §S4 port map
   row `module-pomodoro.jsx` → `packages/plugin-web-pomodoro/`).
   Lives at `packages/plugin-web-pomodoro/`. Planning docs live under
   `packages/xai-web-pomodoro/docs/` per project convention (row-slug for
   planning artifacts; package-slug for the runtime package — same pattern as
   the SHIPPED `xai-web-countdown` → `plugin-web-countdown` split). When the
   build phase scaffolds the runtime package it MUST use
   `packages/plugin-web-pomodoro/`.

2. **Public surface (index.ts)** — exports `PomodoroModule` (the route
   element), `pomodoroWebModuleRegistration` (`WebModuleSlotRegistration`
   produced by this package), type `PomodoroSession`, type `PomodoroMode`,
   const `DEFAULT_DURATIONS_MS`. Nothing else. `src/internal/` is
   package-private per CLAUDE.md §Code Boundaries.

3. **Session schema (locked, byte-for-byte storage shape)**

   ```ts
   type PomodoroMode = "focus" | "short-break" | "long-break";

   interface PomodoroSession {
     id: string;                 // "pomo_<base36(rand)>"
     mode: PomodoroMode;
     startedAt: string;          // ISO 8601 instant — Date(now).toISOString()
     finishedAt: string;         // ISO 8601 instant
     durationMs: number;         // configured duration of the session
                                 // (NOT necessarily finishedAt - startedAt
                                 //  when paused + resumed)
     elapsedMs: number;          // actual elapsed timer time, paused excluded
     completed: boolean;         // true → ran to zero; false → "End early"
   }
   ```

   Validated at storage boundary via `isPomodoroSession(x)` predicate inside
   `src/internal/validate.ts`. Invalid entries from corrupted localStorage are
   filtered out with a DEV `console.warn` (silent in prod).

4. **Persistence flow** — single hook call in `PomodoroModule`:
   `const [sessions, setSessions] = usePref("xai_pomodoro_sessions")` from
   `@repo/plugin-web-storage`. **Zero** direct `localStorage.*` calls.
   The registry default (`[]`) is consumed as-is; no schema migrations
   declared for v1. The `proposed: true` flag on the registry entry stays
   (we are NOT renaming the key — `xai_pomodoro_sessions` is kept).

5. **Timer state machine (locked)**

   ```ts
   type TimerState =
     | { kind: "idle";    mode: PomodoroMode; remainingMs: number }
     | { kind: "running"; mode: PomodoroMode; startedAt: number;
         remainingAtStartMs: number; sessionStartedAt: string;
         sessionId: string }
     | { kind: "paused";  mode: PomodoroMode; remainingMs: number;
         sessionStartedAt: string; sessionId: string;
         elapsedSoFarMs: number };
   ```

   Transitions:
   - `idle` --(Start)--> `running` (mint sessionId + sessionStartedAt)
   - `running` --(Pause)--> `paused` (capture remainingMs and accumulate elapsed)
   - `paused` --(Resume)--> `running` (re-stamp startedAt; remainingAtStartMs = paused.remainingMs)
   - `running` --(End)--> `idle` (write a `completed: false` session record with actual elapsedMs; mode-cycle to next mode; emit event)
   - `running` --(tick → zero)--> `idle` (write a `completed: true` session record; mode-cycle to next mode; emit event; ring bell if notifications flag is on)
   - `paused` --(End)--> `idle` (write a `completed: false` record with accumulated elapsedMs; emit event)

   Mode cycle: focus → short-break → focus → short-break → focus → short-break → focus → long-break → focus … (4 focus per long-break).

6. **Live-tick strategy** — `useTimerTick(running, paused)` internal hook in
   `src/internal/useTimerTick.ts`:
   - When state is `running`, schedule a `requestAnimationFrame` loop. On each
     frame, compute `displayedRemaining = max(0, remainingAtStartMs - (Date.now() - startedAt))`.
     Use `useState` only when the **displayed second** (`floor(remaining/1000)`)
     changes — gates re-renders to 1 Hz despite 60 Hz frames.
   - The accent dot position re-renders every frame (sub-second motion) via a
     dedicated `useRef` + direct DOM `setAttribute("transform", ...)` on the
     dot element. Avoids 60 Hz React re-renders.
   - When state transitions to `paused` or `idle`, cancel rAF.
   - On `visibilitychange → visible` AND on `pageshow`, force a recompute by
     re-reading `Date.now()` and calling `setState` once — recovers the
     display jump that the throttled-rAF missed.
   - Cleanup clears rAF + removes listeners on unmount.

7. **Cross-module communication (one event)** — On every session boundary
   (whether completed-to-zero or ended-early), call:

   ```ts
   emitWebEvent("web:pomodoro:session-finished", {
     mode,
     durationMs: actualElapsedMs,  // real elapsed, NOT configured duration
     finishedAt: new Date().toISOString(),
   });
   ```

   The payload shape matches the existing EventMap declaration in
   `packages/core/src/types/events.ts` lines 198–206 byte-for-byte. We do NOT
   add new entries to EventMap. Statistics #20 and Dashboard mini-pomodoro
   widget #11 subscribe in their own rows.

8. **Notifications gating (feature flag)** — `src/internal/notifications.ts`
   exports:

   ```ts
   export const NOTIFICATIONS_ENABLED = false; // Settings W4 flips this when shipping
   export function notifySessionEnd(mode: PomodoroMode, durationMs: number): void;
   ```

   When `NOTIFICATIONS_ENABLED === false`, `notifySessionEnd` is a no-op.
   When true (set later by Settings W4 or replaced with a usePref read), it
   calls `new Notification(...)` after checking `Notification.permission`.
   The Pomodoro module calls `notifySessionEnd` in the completed-to-zero code
   path; this is a single function-call boundary the future row can replace.

9. **Default durations (locked constants)** — `src/internal/durations.ts`:

   ```ts
   export const DEFAULT_DURATIONS_MS: Readonly<Record<PomodoroMode, number>> = {
     focus:        25 * 60 * 1000,  // 25 minutes (canonical Pomodoro)
     "short-break": 5 * 60 * 1000,  //  5 minutes
     "long-break": 15 * 60 * 1000,  // 15 minutes (every 4th focus)
   };
   ```

   `DEFAULT_DURATIONS_MS` is exported from the public surface so Statistics
   and the Dashboard widget can label histograms consistently.

10. **History list (locked)**
    - Source: full `sessions` array from `usePref("xai_pomodoro_sessions")`.
    - Filter: `s.mode === "focus" && s.completed === true`.
    - Group by `localDateOf(s.finishedAt)` (YYYY-MM-DD in user's local TZ).
    - Sort groups: today first, then descending.
    - Cap: first 7 day-groups (per L-A decision).
    - Within each group: items sorted by `finishedAt` descending; each item
      shows `formatLocalTime(finishedAt)` (e.g. `14:32`) + `formatDuration(elapsedMs)`
      (`25:00` or `12:34`).
    - Group date label: `"Today"` / `"Yesterday"` / `"M/D"` (English) and
      `"今天"` / `"昨天"` / `"M月D日"` (Chinese), via internal
      `formatRecordDate(date, lang)` helper.

11. **Counter derivations (locked)** — all four overview cards derive via
    `useMemo` from the `sessions` array. No persisted counter state.

    ```ts
    todays_pomos  = sessions.filter(s => s.mode==="focus" && s.completed
                                       && localDate(s.finishedAt) === todayLocal).length
    todays_focus  = round( sum( elapsedMs of same filter ) / 60_000 )  // minutes
    total_pomos   = sessions.filter(s => s.mode==="focus" && s.completed).length
    total_focus   = sum( elapsedMs of same filter )  // displayed as Hh Mm
    streak_days   = consecutive past local-days back from today (or yesterday
                    if today has none yet) with ≥1 completed focus session
    ```

    `useMemo` deps: `[sessions, todayLocal]`. The `todayLocal` value comes
    from the same midnight-rollover hook the live-tick uses (single
    `setTimeout` to next local midnight; pattern lifted from the SHIPPED
    `useDaysUntil` in `xai-web-countdown`).

12. **CSS surface** — port `web design/layout.css` lines 657–744 (pomodoro
    block, ~88 lines) verbatim into `packages/plugin-web-pomodoro/src/styles.css`.
    Tokens (`--bg-panel`, `--border-1`, `--r-pill`, `--accent`, `--accent-ink`,
    `--accent-soft`, `--bg-hover`, `--fs-sm`, `--fs-md`, `--fs-xs`, `--text-1`,
    `--text-2`, `--text-3`, `--r-sm`, `--dur-fast`, `--ease-out`) are already
    provided by `@repo/plugin-web-tokens` via the host's global `tokens.css`
    side-effect import. Module CSS is loaded via `import "./styles.css"` at
    the top of `src/index.ts` (Vite handles side-effect CSS).
    The `@media` responsive collapse at line 1617 (`.module-pomo {
    grid-template-columns: 1fr; }`) is included in the verbatim port.
    The `.pomo-dots` block at line 3073 is **not** in scope — it belongs to
    the Dashboard mini-pomodoro widget (row #11).

## Out of Scope

- **Settings pane integration** — durations + sound choice + notification
  toggle are owned by Settings W4 (#22..#24). Future row replaces the
  feature-flag constant with a `usePref` read.
- **Task linkage** — `linkedTodoId` (present in desktop's
  `productivity:pomodoro-completed`) is intentionally absent from
  `web:pomodoro:session-finished` payload (EventMap already declares the
  payload without it).
- **Sound effects** — the mute icon button is wired locally (toggle in-component
  state), but no audio fires in v1. Sound delivery deferred to the notifications
  feature flag flip.
- **Pomodoro Settings deep-link** — the prototype's `…` (dots) header button
  and the focus-pill chevron are no-op stubs in v1 (match prototype).
- **Statistics aggregation views** — Statistics #20 consumes our event +
  session array.
- **Dashboard mini-pomodoro widget** — Dashboard widgets row #11 consumes
  our event + array.
- **Cross-device sync of session history** — `xai_pomodoro_sessions` is
  localStorage-only (per ADR §S5 UI-pref-vs-data-entity coordination boundary
  notes; not a data-entity for sync). Sync is out of scope.
- **Trim old sessions** — list grows unbounded in storage. ~100 bytes/record
  × 7300/year = ~730KB; well under localStorage's typical 5MB cap. A future
  housekeeping row may add a "trim older than 1 year" sweep.
- **Manual session entry** — the prototype's `+` button in the record-head is
  a no-op stub in v1 (no manual-add UI).

## Dependency Overview

```
@repo/plugin-web-pomodoro              (this row)
  ├── @repo/core                        (workspace:* — types only: WebModuleId, EventMap)
  ├── @repo/plugin-web-tokens           (workspace:* — useI18n; CSS already in apps/web bundle via host)
  ├── @repo/plugin-web-storage          (workspace:* — usePref("xai_pomodoro_sessions"))
  ├── @repo/xai-web-event-bus           (workspace:* — emitWebEvent)
  └── @repo/xai-web-shell               (workspace:* — type WebModuleSlotRegistration + useWebShell)

devDeps:
  ├── @repo/eslint-config
  ├── @repo/typescript-config
  ├── @types/react ^19
  ├── @types/react-dom ^19
  ├── @testing-library/jest-dom ^6
  ├── @testing-library/react ^16
  ├── jsdom ^26
  └── vitest ^3.2.1

peerDeps:
  └── react ^19, react-dom ^19
```

Host consumer (`apps/web/`) takes a workspace dep on `@repo/plugin-web-pomodoro`
and replaces the existing `placeholder("pomodoro", "Pomodoro", "timer", 7)`
row in `apps/web/src/routes/modules/shellRegistrations.tsx` (line 52) with
the imported `pomodoroWebModuleRegistration` constant from this package.

## ADR Anchors

- `docs/adr/0007-xai-web-console-build-form.md` §S4 (port mapping row 14 — `module-pomodoro.jsx` → `packages/plugin-web-pomodoro/`)
- `docs/adr/0007-xai-web-console-build-form.md` §S5 (JSX→TSX 10 rules — full conformance)
- `docs/adr/0007-xai-web-console-build-form.md` §S7 (cross-module via `@repo/core/events` only — emit `web:pomodoro:session-finished`; no new EventMap entries)
- `docs/adr/0007-xai-web-console-build-form.md` §S8 (`xai_pomodoro_sessions` proposed key kept verbatim; v1 uses it as declared)
