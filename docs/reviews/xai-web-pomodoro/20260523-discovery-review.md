# Discovery Review — xai-web-pomodoro

> Date: 2026-05-23
> Author: feature-plan (dispatched by xai-roadmap-loop · W2b Parallel-Agent mode)
> Seed brief: `docs/reviews/xai-web-pomodoro/20260523-roadmap-seed.md`
> Manifest row: `docs/workflow/roadmap/xai-web-console.md` row #14 (W2 · Module)
> ADR anchor: `docs/adr/0007-xai-web-console-build-form.md` §S4 (port map row `module-pomodoro.jsx` → `packages/plugin-web-pomodoro/`) + §S5 (JSX→TSX rules) + §S7 (event bus rules) + §S8 (`xai_pomodoro_sessions` proposed key)
> Verify Cross-vendor: **yes** (per seed brief — circular timer + live second-hand + tab-blur survival must render identically in Chrome / Safari 17+ / Firefox latest)
> Concurrent siblings (W2b parallel): #6 xai-web-tasks · #15 xai-web-habits — **write-scope-disjoint**, no shared planning files (write scope: `packages/xai-web-pomodoro/` + `docs/reviews/xai-web-pomodoro/` only).

---

## 1. Problem Framing

The Pomodoro module is a leaf-position W2 row. Its job is to port one prototype file (`web design/module-pomodoro.jsx`, 124 LOC) into a typed, build-clean, persistence-real Vite+React 19 module that registers into the shell's slot registry.

Six W1/W2 packages are SHIPPED (or ready) and constitute the primitives this row consumes:

| Primitive | Shipped package | Surface used by pomodoro |
|---|---|---|
| Tokens + i18n + apply* helpers | `@repo/plugin-web-tokens` | `useI18n(lang)` for `pomo.title` / `pomo.focus` / `pomo.start` / `pomo.continue` / `pomo.end` / `pomo.paused` / `pomo.running` / `pomo.overview` / `pomo.todays_pomos` / `pomo.todays_focus` / `pomo.total_pomos` / `pomo.total_focus` / `pomo.focus_record` — full bundle already present at `packages/plugin-web-tokens/src/i18n.ts` lines 46–61 (EN) and 240–255 (ZH); zero new keys required |
| Typed localStorage persistence | `@repo/plugin-web-storage` | `usePref("xai_pomodoro_sessions")` — registry entry already declared in `packages/plugin-web-storage/src/internal/registry.ts` lines 302–310 with `proposed: true`, `default: [] as PomodoroSession[]`, `owner: "xai-web-pomodoro"`, `schemaVersion: 1`. ADR §S8 reserves the key as renameable; we choose to **keep it verbatim** (see §3.5) |
| Typed cross-module event bus | `@repo/xai-web-event-bus` + `@repo/core/types/events` | `EventMap` already declares `web:pomodoro:session-finished` at `packages/core/src/types/events.ts` lines 198–206 (`mode` + `durationMs` + `finishedAt`) — declaration is **W1-shipped**; this row decides whether to emit it (see §2.5) |
| Module slot registry | `@repo/xai-web-shell` | `WebModuleSlotRegistration` — host's `apps/web/src/routes/modules/shellRegistrations.tsx` line 52 currently has `placeholder("pomodoro", "Pomodoro", "timer", 7)`; this row swaps it for the real route. Icon `"timer"` already in `WebShellIconName` (`packages/xai-web-shell/src/types.ts` line 28) |
| SVG icon glyph "timer" | `@repo/xai-web-shell` icons | `<Icon name="timer">` ships in `packages/xai-web-shell/src/icons.tsx` line 27 — used by the `.rec-dot` history rows. **Also used inline** in the prototype for the focus-pill chevron + sound/dots header buttons (`chevR`, `sound`, `soundOff`, `dots`, `plus`) — most of these are NOT in WebShellIconName today. Discovery decides whether to (a) extend the shell icon set or (b) inline minimal SVG locally |
| CSS tokens + layout | `@repo/plugin-web-tokens` | `tokens.css` already loaded as global side-effect import; `.module-pomo` / `.pomo-side` / `.timer-ring` / etc. selectors live in `web design/layout.css` lines 657–744 — port verbatim into the new package's `styles.css` |

The seed brief sets a focused decision surface:

1. **Timer accuracy across tab-blur** — the prototype uses `setInterval(..., 1000)` which drifts on background tabs (browsers throttle setInterval to 1× per second minimum, often dropping callbacks). The seed brief mandates absolute timestamps. We must choose the timestamp source (`Date.now()` vs `performance.now()`), the redraw trigger (`requestAnimationFrame` vs `setInterval(250)` vs midnight-style precomputed timeout), and the visibility-change recompute strategy.
2. **Session schema shape** — seed brief says "completed sessions persisted to `xai_pomodoro_sessions`". We must lock the shape inside `@repo/plugin-web-pomodoro` without mutating the storage registry (`PomodoroSession = unknown` per §S8). Schema must satisfy the four overview cards (today/week/streak/total) + history-list display.
3. **Live second-hand visual** — prototype shows a thin SVG circle with progress + a small accent dot at 12 o'clock that rotates as time decrements. Seed brief calls out "live second hand". We must decide whether the second-hand is a separate independent SVG element (sub-second redraw) or whether the existing progress ring already serves that role.
4. **Start / Pause / Resume / End semantics** — prototype only has Start + End (no Pause); the End button resets to full focus duration. Seed brief explicitly adds Pause + Resume. We must define the state machine and what "End early" persists (does an interrupted session count?).
5. **Cross-module events** — `web:pomodoro:session-finished` is already declared in `EventMap`. Statistics (#20) and Dashboard mini-pomodoro widget (#11) are the named downstream subscribers per the seed brief. Should we emit in v1, or defer (declaration-only) until those rows ship?
6. **Notification on session-end** — seed brief gates this on the Settings Notifications pane (W4, not yet built). We must define the feature flag boundary so the build doesn't depend on Settings shipping.
7. **Default durations + focus modes** — prototype hard-codes `FOCUS = 30 * 60` (30 min, not the canonical 25 min Pomodoro Technique). Seed brief acceptance signal says "25/5 default". We must decide whether to (a) hard-code 25/5 with no Settings hook, or (b) read from Settings with a 25/5 fallback.
8. **Focus-session history list** — seed brief says "feed Statistics + Dashboard mini-pomodoro widget" — both downstream. The list also needs to render itself in the right rail (today's records grouped by day). We must decide whether to compute "today / week / streak / total" derived counters on-the-fly from the session array or store them as separate state.

This row also has to avoid touching files owned by sibling rows (#6 tasks, #15 habits) currently planning in parallel. The shell registrations file (`apps/web/src/routes/modules/shellRegistrations.tsx`) is touched by multiple W2 rows — the **build phase**, not this plan, decides how to coordinate (see §4 R-MERGE). EventMap (`packages/core/src/types/events.ts`) is **not touched** by this row since the channel is already declared.

---

## 2. Candidate Options

### 2.1 Module mount

The shell already chose Option C (slot/registry + URL routing) per row #5's discovery. This row has no choice here — it must produce a `WebModuleSlotRegistration` whose `children` mount the Pomodoro component. No further analysis needed; the mechanism is settled.

### 2.2 Timer accuracy — three approaches

The seed brief mandates: "Timer must keep accurate time across tab-blur (use absolute timestamps, not setInterval-only)." Three concrete approaches considered:

#### Option T-A — `Date.now()` deadline + `requestAnimationFrame` redraw + `visibilitychange` recompute

State stores `running.startedAt` (epoch ms when the current run began) and `running.remainingAtStart` (seconds remaining when the run began). On every animation frame, compute:

```ts
const elapsedMs = Date.now() - running.startedAt;
const remaining = Math.max(0, running.remainingAtStart - Math.floor(elapsedMs / 1000));
```

When Pause fires, capture the current `remaining` into `paused.remaining` and clear `running`. When Resume fires, re-stamp `startedAt = Date.now()` and `remainingAtStart = paused.remaining`. When the tab is hidden, the browser throttles or stops `requestAnimationFrame`; on `visibilitychange → visible`, recompute synchronously from `Date.now()` — the display jumps to the correct value.

**Pros**
- Single source of truth: `Date.now()` walls past tab-blur (browsers do NOT freeze `Date.now()`; only the rAF/timer callbacks).
- Sub-second redraw enables the live second-hand without extra machinery.
- Cheap: rAF only runs when tab is visible; no background CPU.
- Idempotent: `visibilitychange` recompute gives the right value regardless of how long the tab was blurred.

**Cons**
- `requestAnimationFrame` redraws at ~60 Hz even though the displayed seconds tick at 1 Hz — minor overdraw. Mitigated by gating the React `setState` call to only fire when the *displayed* second has changed.
- System clock changes (NTP correction, user manual edit, DST jump) would shift the deadline. Acceptable: pomodoro is 25-minute scale; clock drift > 1s during a single session is rare.

#### Option T-B — `setInterval(250ms)` + `Date.now()` deadline computation

Same data model as T-A, but redraw is driven by a 250ms `setInterval` instead of rAF. Background-tab throttling clamps setInterval to ≥ 1000ms; we accept that during background, the *displayed* number can be up to ~1s stale until the next callback. `visibilitychange` recompute fixes display-on-return.

**Pros**
- Simpler: no rAF chaining.
- Lower CPU cost than rAF when foreground.

**Cons**
- The "live second-hand" claim suffers: at 250ms cadence, the second-hand rotates in 90° jumps within each second, which is exactly the "ticking" aesthetic the seed brief calls out as undesirable.
- jsdom + fake-timers tests are slightly trickier (must advance time in 250ms slices instead of frame-by-frame).

#### Option T-C — Web Worker + `postMessage` tick

A dedicated `Worker` running its own loop, posting `{ remaining }` to the main thread.

**Pros**
- Fully immune to main-thread blocking + tab throttling.

**Cons**
- Way over-engineered for a single-session, seconds-resolution UI.
- Adds a build artifact (`pomodoro.worker.ts`) to Vite's worker pipeline — none of the existing W1/W2 packages use Vite workers, so this would be the first precedent. The seed brief does NOT mention workers.
- `web-architecture-adr-lite` does not bless workers for v1.
- Background-throttle resistance is not needed: the user's own UI is the only consumer; on `visibilitychange → visible` recompute, T-A delivers the same final correctness.

**Verdict:** **Option T-A selected** — `Date.now()` deadline + `requestAnimationFrame` redraw (gated by displayed-second change) + `visibilitychange` recompute on return-to-tab + `pagehide`/`pageshow` listener for mobile Safari. Matches the precision-with-low-cost balance of `useDaysUntil` from the SHIPPED `xai-web-countdown` row #17 (single-timer-per-module pattern, visibility-recompute).

### 2.3 Session schema — two variants

#### Option S-A — Flat array of `PomodoroSession` records

```ts
type PomodoroMode = "focus" | "short-break" | "long-break";

interface PomodoroSession {
  id: string;                  // "pomo_<base36(rand)>"
  mode: PomodoroMode;          // "focus" | "short-break" | "long-break"
  startedAt: string;           // ISO 8601 UTC instant
  finishedAt: string;          // ISO 8601 UTC instant
  durationMs: number;          // configured duration (may differ from finishedAt - startedAt if "End early" with partial credit)
  completed: boolean;          // true → ran to zero; false → ended early
}
```

`xai_pomodoro_sessions` is `PomodoroSession[]`. The four overview cards derive from this array via pure functions:

- `todays_pomos` = count of `s where s.mode === "focus" && s.completed && day(s.finishedAt) === today_local`
- `todays_focus` (minutes) = sum of `durationMs/60000` for the same filter
- `total_pomos` = count of all `focus` + `completed` sessions
- `total_focus` (hours+minutes) = sum of `durationMs` over all `focus` + `completed`
- `streak` (days) = consecutive past days with ≥1 completed focus session; today counts if it has ≥1

**Pros**
- One source of truth — every counter is a `useMemo` from `sessions`.
- Statistics (#20) and Dashboard widget (#11) can read the same array via `usePref("xai_pomodoro_sessions")` directly (no extra channel needed beyond the optional event in §2.5).
- Easy to delete a single record (history list "…" menu — stubbed in v1 per prototype).
- `completed: false` records the "End early" case for honesty without inflating counters.

**Cons**
- Reading all sessions to compute counters is O(N). Acceptable: a heavy user produces ~20 sessions/day × 365 = ~7300/year; filtering an array of that size in `useMemo` is microsecond-scale.

#### Option S-B — Separate counters + most-recent sessions

Persist `{ counters: {todaysPomos, todaysFocusMs, totalPomos, totalFocusMs, streak, lastDate}, recentSessions: PomodoroSession[100] }`. Counters reset at local midnight via `useDaysUntil`-style timer.

**Pros**
- O(1) counter reads.

**Cons**
- Two sources of truth (counters + sessions) → consistency bugs.
- Midnight rollover must atomically: (a) move today's counters into total, (b) reset today's counters, (c) compute streak delta. A power-off across the boundary loses the rollover; recovery logic is required.
- Statistics (#20) and Dashboard (#11) consume `recentSessions` slice, not full history — historical statistics over a month wouldn't be possible without growing the slice.

**Verdict:** **Option S-A selected** — flat array; counters derived. Matches the canonical "store events, derive counts" pattern; clean for Statistics consumption.

### 2.4 Live second-hand visual

Prototype's `<svg>` has two circles:

1. The grey track (`stroke="var(--border-1)"`, no animation).
2. The accent progress arc (`strokeDashoffset` interpolated from `progress`).

Plus a small filled dot at `cx=150, cy=150-r` (top center) — but this is **static** in the prototype, anchored to the top of the ring; it is NOT a rotating second-hand.

The seed brief says "live second hand". Two interpretations:

#### Option H-A — Rotating accent dot at the ring head

Place the dot at the end of the *drawn* arc rather than fixed at 12 o'clock. Compute its position as `(cx + r*cos(θ-90°), cy + r*sin(θ-90°))` where `θ = progress * 360°`. As progress increases, the dot rides the ring tip clockwise. Sub-second smoothness comes from rAF redraw.

**Pros**
- Visually communicates "this thing is alive" — the dot moves every animation frame.
- Single SVG element, no extra structure.
- Mirrors Apple's Workout Ring aesthetic the prototype clearly drew from.

**Cons**
- Slight deviation from the prototype's static-dot-at-top rendering. Acceptable: the prototype's hard-coded position was a static design illustration; the spec calls for live motion.

#### Option H-B — Separate analog second-hand line + dot

Add a `<line>` from center to ring edge that rotates once per minute. Two visual elements (ring + hand).

**Pros**
- Most analog-clock-like.

**Cons**
- Conflicts with the ring-progress metaphor: the ring already encodes elapsed-fraction; a separate hand encodes seconds-of-minute. Two different metrics on one face is visually confusing.
- Prototype has zero precedent for the hand element.

**Verdict:** **Option H-A selected** — rotate the existing accent dot along the ring tip; sub-second motion via rAF.

### 2.5 Cross-module event emission

`web:pomodoro:session-finished` is already in `EventMap` with payload `{ mode, durationMs, finishedAt }`. The seed brief notes Statistics (#20) and Dashboard mini-pomodoro widget (#11) are downstream subscribers, but both are unshipped.

#### Option E-A — Emit + listener-ready in v1

Call `emitWebEvent("web:pomodoro:session-finished", { mode, durationMs, finishedAt })` inside the "session-finished" code path (whether by ticking to zero OR by End-with-partial-credit toggle if we decide to count it). No new EventMap entries.

**Pros**
- When Statistics (#20) builds, no retro-fit needed.
- The optional Dashboard mini-pomodoro widget can already wire up.
- ADR §S7 endorses `web:<module>:<verb>-<noun>`.
- Zero cost: the bus is fire-and-forget; no listener means no-op.

**Cons**
- Slightly more code than not emitting — but the "more" is one function call wrapped in a useEffect.

#### Option E-B — Declaration-only; defer emit to Statistics row

Don't call `emitWebEvent` in v1. Statistics #20 adds the emit later.

**Pros**
- Smaller v1 surface; one fewer thing to test.

**Cons**
- Statistics #20 cannot wire up without touching THIS package's code. Two write scopes for one feature. Violates owner-row discipline.
- Future row would need to re-test the timer state machine to add an emit at the right point.

**Verdict:** **Option E-A selected** — emit on every completed focus session. Skip on `mode === "short-break"` / `mode === "long-break"` per payload type (mode field is a literal union but our v1 only ever fires the focus mode; declaration accepts all three for future-proofing). Also emit on "End early" if `completed: false` — payload includes `durationMs` (the *actual* elapsed time, not the configured duration) so Statistics can choose to ignore partials.

### 2.6 Notifications gating

The seed brief says notifications fire at session-end *if* Settings Notifications pane is wired. Settings W4 is unshipped. Two options:

#### Option N-A — Feature flag `notificationsEnabled` constant, default false

Hard-code `const NOTIFICATIONS_ENABLED = false` in `src/internal/notifications.ts`. The `notifySessionEnd()` function checks this flag and returns early. Settings W4, when it ships, replaces the constant with a `usePref` read.

**Pros**
- Zero runtime cost in v1.
- Settings W4's wire-up is a one-line change in this package's notifications module.
- No `Notification.permission` request in v1 — avoids the permission UX surprise.

**Cons**
- Slight code-shape coupling between this row and Settings W4 — Settings has to know to flip the constant. Acceptable: ADR §S7 + the seed brief explicitly defers this.

#### Option N-B — Skip notifications entirely until Settings ships

Don't include any notifications module. Settings W4 owns the entire feature.

**Pros**
- Smallest surface.

**Cons**
- "Defer to Settings ship time" in the seed brief implies the *mechanism* lives somewhere — Settings is a config pane, not the bell-ringer. The Pomodoro module is the natural owner of "ring a bell when MY session ends".
- Splitting the work two-ways (Pomodoro owns timing, Settings owns config-flag) is cleaner than Settings owning both.

**Verdict:** **Option N-A selected** — feature flag with internal stub. The flag boundary is in `src/internal/notifications.ts`; Settings W4 can flip it without touching the timer state machine.

### 2.7 Default durations + focus modes

Acceptance signal mandates "25/5 default". Prototype hard-codes 30 min. Options:

#### Option D-A — Hard-code 25/5/15 in module constants

```ts
const DEFAULT_FOCUS_MS = 25 * 60 * 1000;
const DEFAULT_SHORT_BREAK_MS = 5 * 60 * 1000;
const DEFAULT_LONG_BREAK_MS = 15 * 60 * 1000;
```

No Settings hook in v1. Mode-cycle: focus → short-break → focus → short-break → focus → short-break → focus → long-break → (loop).

**Pros**
- Canonical Pomodoro Technique values.
- No dependency on Settings W4.
- Zero state; pure constants.

**Cons**
- User cannot customize. Acceptable for v1; can be lifted later via a Settings pref read.

#### Option D-B — Read from Settings prefs with 25/5/15 fallback

`usePref("xai_pomodoro_durations")` — but this key is not in the registry. Adding it would require a write to `packages/plugin-web-storage`, which is out of scope.

**Verdict:** **Option D-A selected** — hard-code 25/5/15 constants. Future row may add a `xai_pomodoro_durations` registry entry + Settings pane; this is out of v1 scope.

### 2.8 Focus-session history list — rendering source

The right rail has both: (a) the 4 overview cards (deterministic counters from the session array) and (b) the "Focus Record" history list grouped by day. Two display options:

#### Option L-A — Last 7 days of focus sessions, grouped by local-day, today first

```ts
groupBy(s => localDateOf(s.finishedAt))  // descending by day
  .slice(0, 7)                            // last 7 days only (cap for UI density)
  .map(group => ({
    date: group.key,         // "2026-05-23" → formatted "Today" / "Yesterday" / "5/21"
    items: group.values.map(s => ({
      time: formatTime(s.finishedAt),  // "14:32"
      dur:  formatDuration(s.durationMs),  // "25:00"
    })),
  }))
```

The prototype's `MOCK.focusRecords` exactly matches this shape (`g.date[lang]` + `g.items` with `time` + `dur`).

**Pros**
- Direct mapping from prototype's data structure.
- 7-day cap prevents the list from growing unbounded (UI density).
- Statistics #20 still sees the full unbounded array via `usePref`.

**Cons**
- 7-day cap is arbitrary; "show more" affordance is a stub for now.

#### Option L-B — Show all history

Render the full unbounded list. Add virtualization later.

**Cons**
- DOM grows linearly with usage; first-render perf degrades after ~6 months of use.

**Verdict:** **Option L-A selected** — last 7 days with group-by-day, today at top. Bilingual date formatting (today/yesterday/MM-DD) via a small `formatRecordDate(date, lang)` helper.

---

## 3. Recommendation Summary

| Axis | Selected | Notes |
|---|---|---|
| Module mount | C (slot registry) | settled by row #5 |
| Timer accuracy | T-A | `Date.now()` deadline + rAF + `visibilitychange` recompute |
| Session schema | S-A | flat `PomodoroSession[]` array; counters derived |
| Second-hand | H-A | rotate accent dot at ring tip; sub-second via rAF |
| Cross-module events | E-A | emit `web:pomodoro:session-finished` on completion (+ partial) |
| Notifications | N-A | feature flag stub; Settings W4 flips later |
| Defaults | D-A | hard-code 25/5/15; no Settings hook in v1 |
| History list | L-A | last 7 days, grouped by local day |
| Persistence key | (settled) | `xai_pomodoro_sessions` (kept verbatim — ADR §S8 reserved as `proposed: true`) |
| Cross-vendor | yes | rAF + `<svg>` + `<input>` / native focus rings all baseline; no `<dialog>` modal needed for v1 |

### 3.5 Persistence-key decision (recorded for clarity)

The ADR-0007 §S8 registry declares `xai_pomodoro_sessions` with `proposed: true`. We **keep the key verbatim** — no rename — because:

1. The name is descriptive, ADR-consistent, and already documented for Statistics (#20) consumption.
2. Renaming would require a write to `packages/plugin-web-storage/src/internal/registry.ts` — out of scope for this row's planning write-scope (`packages/xai-web-pomodoro/` + `docs/reviews/xai-web-pomodoro/` only).
3. A future row may tighten the value type from `unknown[]` to `PomodoroSession[]` once consumers are settled; v1 tightens locally via a `isPomodoroSession(x): x is PomodoroSession` predicate at the storage boundary.

---

## 4. Risks

| ID | Risk | Severity | Mitigation |
|---|---|---|---|
| R1 | `Date.now()` jumps if user changes system clock mid-session | LOW | Acceptable — pomodoro is single-session, user-supervised. Document in api.md §7 error semantics. |
| R2 | Background-tab throttling delays `visibilitychange` recompute | LOW | `Date.now()` survives the blur; recompute is synchronous on return. Test H4 in test.md exercises this with fake timers. |
| R3 | rAF + React state update causes excessive re-renders | LOW | Gate `setState` to fire only when displayed second changes (cheap diff). |
| R4 | StrictMode double-mount leaks two rAF callbacks | LOW | `useEffect` cleanup cancels the rAF + clears refs. Test H5 covers. |
| R5 | `Notification` API permission prompt without Settings UX | NONE | N-A flag default `false`; no permission request in v1. |
| R6 | Sibling W2 race on `shellRegistrations.tsx` line 52 (pomodoro placeholder) | LOW | Single-line edit in P3; siblings own different lines; auto-build retry-on-lock pattern per countdown row #17 precedent. |
| R7 | `web:pomodoro:session-finished` payload shape can't change once shipped | LOW | Declaration is already in `@repo/core/types/events.ts`; we conform to existing payload (`mode`/`durationMs`/`finishedAt`). |
| R8 | Mobile Safari freezes rAF after long blur — recompute on `pageshow` (bfcache) needed | LOW | Listen to `pageshow` in addition to `visibilitychange`. Documented in api.md §6.2. |
| R9 | History list grows unbounded → localStorage quota | LOW | 7-day display cap; underlying array unbounded but JSON-encoded session record is ~100 bytes → 7300 records/year = ~730KB. localStorage typical limit is 5MB; comfortable headroom. Future row can add a "trim older than 1 year" sweep. |
| R10 | Inline literals for Pause/Resume vs `pomo.start`/`pomo.continue` mapping | LOW | Use bundled `pomo.start` (for stopped state) and `pomo.continue` (for paused state) per existing prototype. "Pause" while running uses `pomo.start` semantics inverted — we override label to `pomo.pause` (already in bundle EN line 52 / ZH line 246). |

---

## 5. Open Questions (deferred to build)

| Q | Owner |
|---|---|
| Should the focus-pill (top of timer area) be a real menu (Focus / Short Break / Long Break selector) or a no-op stub matching the prototype? | Build (P2) — pick stub for v1 unless trivial |
| Sound playback at session-end — Web Audio API or `<audio>`? | Build (P2) — pick `<audio>` (lighter); gated by mute icon (already in prototype) |
| "Skip break" affordance — present in some Pomodoro UIs, absent from prototype | Out of scope for v1 |

---

## 6. External Research Summary

WebSearch query: `"React pomodoro timer setInterval drift tab background absolute timestamp 2026"` (2026-05-23).

Findings reinforce the T-A choice:

- `setInterval` drifts on background tabs (browser throttling clamps to ≥1000ms minimum, often dropping callbacks). Documented in multiple community write-ups (DEV.to, FreeCodeCamp forum).
- Web Workers (T-C) are the most robust against tab throttling, but are over-engineered for a single-session, seconds-resolution UI and add Vite worker pipeline complexity not present in any other W1/W2 row.
- Absolute-timestamp deadline + `visibilitychange` recompute is the standard fix the community converges on for "lightweight UI timer".

Sources reviewed:
- https://dev.to/vaatiesther/how-to-build-a-pomodoro-timer-in-react-lad
- https://forum.freecodecamp.org/t/slow-timer-with-pomodoro-react-app/652613
- https://www.jamesbaum.co.uk/blether/creating-a-pomodoro-timer-app-with-react-redux/

These are illustrative; no third-party library is adopted in v1 (the implementation is small and project-stack-aligned).

---

## 7. Out of Scope

- **Task linkage** — prototype's `productivity:pomodoro-completed` event has `linkedTodoId`; that channel is owned by `@repo/plugin-productivity` (desktop). The web row uses `web:pomodoro:session-finished` (no task link). Future row may add link.
- **Pomodoro Settings pane** — durations, sound choice, notification toggle — owned by Settings W4 (#22..#24).
- **Statistics aggregation views** — Statistics #20 consumes our event + session array; doesn't belong here.
- **Dashboard mini-pomodoro widget** — Dashboard widgets row #11 consumes our event + array; doesn't belong here.
- **Long-running streak history** — counters compute on-the-fly; persisted "streak as of YYYY-MM-DD" snapshot is not stored. Acceptable for v1.
- **Multi-device sync** — `xai_pomodoro_sessions` is localStorage-only (per ADR §S5 UI-pref-vs-data-entity coordination); cross-device sync is not in scope.
- **Tagging sessions with a project or label** — not in prototype.
- **Export to CSV** — not in prototype.

---

## 8. Architecture / boundary check

- `packages/core/` edits: **NONE** (EventMap entry already shipped W1).
- `packages/plugin-web-storage/` edits: **NONE** (key already declared `proposed: true`).
- `packages/plugin-web-tokens/` edits: **NONE** (i18n bundle already has `pomo.*` keys).
- `packages/xai-web-shell/` edits: **NONE** (`"timer"` icon already exists; `WebModuleSlotRegistration` is a type-only import).
- `packages/xai-web-event-bus/` edits: **NONE** (consume `emitWebEvent` only).
- `apps/web/src/routes/modules/shellRegistrations.tsx` edit: **single-line swap** at line 52 + import line (P3 only).
- `apps/web/package.json` edit: **single dep line** add `@repo/plugin-web-pomodoro: workspace:*` (P3 only).
- `docs/PLUGIN_MAP.md` edit: **single row add** (`plugin-web-pomodoro: In-Dev`) (P3 only).

Write scope (planning phase): `packages/xai-web-pomodoro/docs/` + `docs/reviews/xai-web-pomodoro/` ONLY.
Write scope (build phase, P1+P2): `packages/plugin-web-pomodoro/` ONLY.
Write scope (build phase, P3): adds the three host-touch points above.

---

## 9. Acceptance Signal Re-statement

Per seed brief, READY_TO_SHIP requires:

1. Pomodoro runs end-to-end (25 focus / 5 short-break default).
2. Pause + Resume preserves remaining time exactly (no drift across tab-blur during pause).
3. End early either: (a) discards the session (V-1 decision: write a `completed: false` record so Statistics has visibility) or (b) saves with partial credit. **Decision: option (a) — write `completed: false`**.
4. Finish writes a session record visible in the right-rail history list.
5. The record is read by Statistics + Dashboard (channel + array both available — verified by emit-test + array-read-test).
6. Manual cross-vendor walk passes on Chrome / Safari 17+ / Firefox.

---

## 10. Sibling W2b parallel dispatch note

Concurrent siblings (per dispatch prompt): **#6 xai-web-tasks · #15 xai-web-habits**.

Each sibling owns a different placeholder line in `apps/web/src/routes/modules/shellRegistrations.tsx`:

- #6 tasks → currently at line 47 (`placeholder("tasks", ...)`)
- #14 pomodoro → currently at line 52 (`placeholder("pomodoro", "Pomodoro", "timer", 7)`)
- #15 habits → currently at line 53 (`placeholder("habits", ...)`)

Build-phase P3 in each row swaps its OWN line. No logical conflict because lines are disjoint. **Risk R6** (git index lock race during concurrent commits) is mitigated by:

1. Read `shellRegistrations.tsx` fresh inside P3 (do NOT cache from P1/P2).
2. Edit ONLY the pomodoro line + import; leave sibling lines untouched even if a sibling has already swapped theirs.
3. Retry git operations on lock with exponential backoff (200ms → 400ms → 800ms → 1600ms → 3200ms; max 5 attempts; per dispatch prompt "8-20s × 5" guidance).
4. After P3 commit, assert `webShellModuleRegistrations.length === 12` (unchanged) as regression catch.

Pattern proven by the W2a precedent (xai-web-countdown row #17 + xai-web-matrix row #13 + xai-web-pet row #19).
