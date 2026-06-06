# Discovery Review — xai-web-calendar-event-create

> Feature: Calendar event CRUD + simple recurrence + localStorage persistence
> Owning package: `@repo/plugin-web-calendar` (extension — row #12 + gap-closure row #4 baseline both SHIPPED)
> Authority: ADR-0010 Accepted 2026-05-26 §D4 P0 carve-out (`docs/reviews/_p0-carve-outs/20260527-calendar-event-create.md`, operator brief cites carve-out commit `bc573b1`)
> Seed brief: `docs/reviews/xai-web-calendar-event-create/20260527-feature-brief.md`
> Discovery executor: claude-opus-4-7 (feature-plan)
> Date: 2026-05-27

---

## 0. Discovery method

Read-only static analysis on the existing `packages/xai-web-calendar/` source
tree (49 files, 17 test files = 187 source + 197 SHIPPED test cases) +
`packages/plugin-web-storage/src/internal/registry.ts` (53 entries) +
`packages/xai-web-shell/src/SignOutConfirmDialog.tsx` +
`packages/plugin-web-board-workspaces/src/CardDetailDialog.tsx` (dialog
patterns) + `packages/core/src/types/events.ts` (channel surface) +
audit Top-10 doc (`docs/reviews/_web-noop-audit/20260527-button-action-inventory.md`).

This is a **pure-frontend additive feature** with zero external dependencies,
zero backend, zero new npm packages. No web research is required — the
constraint set explicitly bans third-party libraries (recurrence libs like
`rrule.js`, `date-fns/rrule`, etc. would all violate "no new npm dep").
Therefore: **no external research required**.

The feature also has **no candidate solutions to compare**: all the
candidates are internal architectural choices (where the event store lives,
which dialog pattern to mirror, how to handle recurrence expansion).
Those internal choices are enumerated as Q1..Q12 in §3.

---

## 1. Existing surface map (read-only inspection)

### 1.1 `packages/xai-web-calendar/src/` (current state, post-gap-closure-row-#4)

```
src/
├── index.ts                    — barrel; exports CalendarModule + slot + 11 types
├── CalendarModule.tsx          — top-level; (view, activeDate, focusedFromDeepLink) state
├── CalendarToolbar.tsx         — list / title / + / view-seg / nav-arrows / today / dots
├── MonthGrid.tsx + MonthRow + MonthCell + WeekdayHeader   — Month view
├── WeekView.tsx + TimeGrid + TimeGridAllDayStrip + TimeGridHourRow + TimeGridDayColumn + EventBlock
├── DayView.tsx                 — 1-column TimeGrid wrapper
├── CalendarBanner.tsx          — "Sample data — switch to your account…"
├── registration.tsx            — calendarSlotRegistration (railOrder 5)
├── types.ts                    — CalendarModuleProps, CalendarView ("month"|"week"|"day")
├── styles.css                  — tokens-only; 4 oklch event colors + DST + active-day
└── internal/
    ├── sampleEvents.ts         — SAMPLE_EVENTS const (68 events, 31 day-keys, +5 endTime)
    ├── monthGridCells.ts       — month layout helper
    ├── dateKeys.ts             — UTC helpers (pad2 / utcDateKey / leap / daysInMonth)
    ├── parseDateKey.ts         — local helpers (parse / format / step / dateKeyMonth)
    ├── weekWindow.ts           — weekWindowFor → 7 dateKeys
    ├── timeGridMath.ts         — HOUR_HEIGHT_PX, parseHHMM, hourToRow, rowsForBlock, dstHoursForDay
    ├── placeEventBlocks.ts     — greedy first-fit packer → EventBlock[]
    ├── isoWeekNumber.ts        — ISO 8601 week-num
    ├── holidays.ts             — table-driven holiday lookup
    ├── weekdays.ts             — weekdayLabels rotation
    ├── formatMonth.ts          — "May 2026" / "2026 年 5 月"
    └── icons.tsx               — inline SVGs (list / plus / arrowL / arrowR / dots / star / chevR)
```

### 1.2 Current `CalEvent` shape (post-extension)

```ts
// internal/sampleEvents.ts
export type CalEventColor = "mint" | "amber" | "blue" | "violet";

export interface CalEvent {
  c: CalEventColor;
  t: { en: string; zh: string };
  time?: string;                 // "HH:MM" start (optional)
  endTime?: string;              // "HH:MM" end (optional; added by gap-closure row #4)
}

export type CalEventsByDay = Record<number, CalEvent[]>;  // 1..31 day-of-month index
```

**Critical limitation found:** `CalEventsByDay` is keyed by **day-of-month integer (1..31)**, NOT by full date. The entire fixture renders as "May 2026" regardless of `displayedMonth`. This works for the SHIPPED demo (anchor month = May 2026) but **cannot serve user-created events in arbitrary months** — a `2026-08-15 birthday` would render on Aug 15 visually only because the consumer code passes `SAMPLE_EVENTS[15]` whenever any month shows day 15. This is documented at `packages/xai-web-calendar/docs/dev_log.md:1003` (risk R-NEW-1 from the diagnose Option B section): **"schema migration, not additive"**.

Implication for this feature: user events MUST be keyed by full date (`"YYYY-MM-DD"` or equivalent). We can either (a) replace `CalEventsByDay` shape entirely, or (b) introduce a NEW user-event shape and a merge layer at the view boundary. See Q1.

### 1.3 Current `CalendarToolbar` `+` button (the trigger)

```tsx
// CalendarToolbar.tsx:39-41 (current)
<button type="button" className="icon-btn" data-testid="cal-add">
  <CalIcon name="plus" size={16} />
</button>
```

No `onClick`. No `aria-label`. No callback prop on `CalendarToolbarProps`. This is the user-facing entry-point we wire.

### 1.4 Storage registry entries already owned by xai-web-calendar

`packages/plugin-web-storage/src/internal/registry.ts`:

- `xai_pref_week_start` (line 401-408 area; category=`pref`, default=0) — owned by xai-web-calendar via SHIPPED row #12.
- `xai_calendar_view` (line 861-868; category=`module`, default="month") — owned by xai-web-calendar via SHIPPED gap-closure row #4.

Pattern: when xai-web-calendar adds a new key, it appends at file-tail with explicit comments tying to a roadmap row. **Family naming convention**: `xai_calendar_*` for module-scoped data (NOT user-prefs), category=`"module"`.

The proposed key for this feature is `xai_calendar_events` — follows the same `xai_calendar_*` family + `category: "module"` rule.

### 1.5 Dialog pattern precedents (3 reference implementations)

| File | Purpose | Closure mechanism | i18n strategy |
|---|---|---|---|
| `packages/xai-web-shell/src/SignOutConfirmDialog.tsx` | Confirmation modal (no form) | `dialog.showModal()` + `cancel` event + backdrop click | `useI18n(lang).s("avatar.sign_out_confirm_*")` — uses `plugin-web-tokens` |
| `packages/plugin-web-board-workspaces/src/CardDetailDialog.tsx` | Read-only data dialog | `dialog.showModal()` + `cancel` event + backdrop click | local `STR_CARD_DETAIL` import from `internal/strings.ts` (no tokens edit) |
| `packages/xai-web-dashboard-grid/src/AddWidgetPicker.tsx` (gap-closure row #5) | Picker grid with click-to-add | `dialog.showModal()` + escape | `useI18n` — adds `dashboard.picker.*` keys |

The brief explicitly mandates the **local STR table pattern** (no `plugin-web-tokens` edit). Closest precedent = `CardDetailDialog.tsx` + its `internal/strings.ts`. We mirror that exactly for the new `EventComposer` dialog.

### 1.6 Event-bus channel surface (read-only)

`packages/core/src/types/events.ts`:

- `web:shell:module-change` — consumed by Calendar (deep-link receive); not touched here.
- Calendar does NOT currently emit any `web:*` event (`AC-EVENT-7` grep test enforces).

For this feature, the question is whether internal "events changed" notifications need to cross window/tab boundaries. Answer (recommended): NO — the entire feature lives inside a single React tree under `<CalendarModule />`. State lifting + React's natural re-render covers HC1/HC2/HC3 without any `web:*` channel. (Cross-tab consistency comes for free via the standard `storage` event that `usePref` already listens for.) See Q5.

### 1.7 i18n source-of-truth

`packages/plugin-web-tokens/src/i18n.ts` owns the `cal.*` namespace
(`cal.month` / `cal.week` / `cal.day` / `cal.today` / `cal.sample_banner` /
`cal.coming_soon` / `cal.holiday_mayday` / `cal.holiday_mothers_day`).

Brief forbids editing this file. New strings go into a local
`packages/xai-web-calendar/src/internal/strings.ts` (NEW) per `CardDetailDialog`
precedent.

---

## 2. Audit / authority alignment

| Audit / authority | Reference | Alignment |
|---|---|---|
| Audit Top-10 #2 (C-02 add-event no-op) | `docs/reviews/_web-noop-audit/20260527-button-action-inventory.md` §2.5 row C-02 + §2.5 recommended-next-action "full event CRUD is an ADR-scale change" | This feature IS the ADR-scale change. |
| ADR-0010 §D4 P0 carve-out | `docs/adr/0010-p1-desktop-resume-plan.md:105-115` | This feature uses the carve-out (already landed). |
| P0 carve-out doc | `docs/reviews/_p0-carve-outs/20260527-calendar-event-create.md` | Active. Authorizes new feature on Web P0 surface. |
| design.md §15.2 HC8 | `packages/xai-web-calendar/docs/design.md:602` "no editing UI at all in v1, per HC8" | Will be lifted by an inline footnote in P5 of this feature (see Q11). |
| dev_log HC8 line 766 | `packages/xai-web-calendar/docs/dev_log.md:712` | Same — append-only footnote in the per-feature Bugfix-Extension Lineage style. |
| PLUGIN_MAP row #12 (Stable / Production) | `docs/PLUGIN_MAP.md:117` | Unchanged. Extension adds a note in P5 (no status change). |

---

## 3. Open questions (Q1..Q12 — for `feature-review` to APPROVE/REVISE)

### Q1 — User-event storage schema: replace `CalEventsByDay` (A) vs new user-event shape + merge layer (B)?

| Option | Pros | Cons | Planner pick |
|---|---|---|---|
| **A** Migrate `CalEventsByDay` (day-of-month) → `CalEventsByDateKey` (`Record<"YYYY-MM-DD", CalEvent[]>`); SAMPLE_EVENTS becomes a 1-month dictionary keyed by "2026-05-DD" | Single in-memory shape; consumers (`MonthCell` / `WeekView` / `DayView`) only read one map | Touches every existing view consumer; 197 SHIPPED tests need re-verification; SAMPLE_EVENTS transcription breaks byte-parity (controlled drift) | — |
| **B** Keep `SAMPLE_EVENTS: CalEventsByDay` as-is; introduce new `UserCalEvent` type (id, date, …) + new `CalEventsByDateKey: Record<string, UserCalEvent[]>` for user data; merge at view boundary via a pure `mergeEventsForMonth(month, year, fixture, userEvents) → CalEventsByDay` helper | SHIPPED 197 tests stay green untouched; SAMPLE_EVENTS byte-parity preserved; fixture can become opt-in toggle without breaking fallback render | Two shapes co-exist; merge layer has its own complexity (recurrence expansion, color preservation) | **B** |

**Planner recommendation: B** — minimizes blast radius on SHIPPED tests, lets the SAMPLE_EVENTS disposition (Q9) become a UI toggle, makes the new schema explicit (id is mandatory; date is full-date string).

### Q2 — User event schema (minimum field set)

Recommended `UserCalEvent` shape:

```ts
export type RecurrenceKind = "none" | "daily" | "weekly";

export interface RecurrenceRule {
  kind: RecurrenceKind;          // "daily" | "weekly"; "none" = no rule
  // Future extensions reserved: until?, byWeekday?, interval?
}

export type EventColorPreset = "mint" | "amber" | "blue" | "violet" | "rose";
// 5 presets. 4 from SHIPPED tokens, +1 "rose" (new CSS var) per Q4.
// Default = "mint" (same as SHIPPED most-frequent fixture color).

export interface UserCalEvent {
  id: string;                    // crypto.randomUUID() — opaque
  title: string;                 // user input (plain text, trimmed)
  startISO: string;              // "YYYY-MM-DDTHH:MM" (local clock, no TZ suffix per scope constraint)
  endISO: string;                // "YYYY-MM-DDTHH:MM" (local clock); >= startISO; >= start + 5 min
  colorPreset: EventColorPreset; // default "mint"
  recurrence: RecurrenceRule | null;   // null = non-recurring
  createdAt: string;             // ISO ms — for tie-break sort
  updatedAt: string;             // ISO ms — bumped on edit
}
```

**Planner recommendation: ACCEPT this shape.** All-day events are out of scope, so `startISO` is always full date+time. Cross-day events are out of scope, so `startISO.split("T")[0] === endISO.split("T")[0]` is an invariant. Recurrence stored as a rule (NOT pre-expanded instances) — expansion happens at view boundary per Q3.

### Q3 — Recurrence expansion strategy

| Option | Description | Planner pick |
|---|---|---|
| **A** Pre-expand on save (write N copies for the next N occurrences) | Simplifies render; complicates edit/delete; storage blow-up | — |
| **B** Store rule; expand at render time per (year, month) viewport window | Storage stays small; edit/delete is single-entity; renderer must cap expansion at a sensible horizon | **B** |
| **C** Store rule; expand once per session, cache in memory | Mixed; offers little over B with React's natural memoization | — |

**Planner recommendation: B with bounded horizon.** Expansion helper signature:

```ts
export function expandRecurrence(
  event: UserCalEvent,
  windowStartKey: string,       // "YYYY-MM-DD"
  windowEndKey: string,
  maxInstances: number = 366    // hard cap to prevent infinite loop
): UserCalEvent[];
```

For Month view: window = month (28-31 days); for Week view: window = 7 days; for Day view: window = 1 day. `maxInstances: 366` = ~1-year worst case for daily recurrence on a Year window (future row). The cap is a safety belt against bad future-row inputs — daily over a month window yields ≤31 instances.

Risk: visible blow-up in some weird state. Mitigation: `expandRecurrence` is pure + tested with daily-1-year, weekly-1-year, malformed-rule, zero-window degenerates.

### Q4 — Color preset count (3 vs 4 vs 5)

| Option | Count | Tokens needed | Planner pick |
|---|---|---|---|
| **A** 3 (mint / amber / blue) | 3 | 0 new (SHIPPED) | — |
| **B** 4 (mint / amber / blue / violet) | 4 | 0 new (SHIPPED) | — |
| **C** 5 (mint / amber / blue / violet / rose) | 5 | 1 new CSS rule in `styles.css` (`.cal-event.ev-rose` + `.cal-event-block.ev-rose` + dark overrides) — pure additive | **C** |

**Planner recommendation: C — 5 presets.** Brief says "3-5 preset colors". 5 spreads coverage well without crowding; 4 (B) re-uses SHIPPED palette unchanged. Either B or C is acceptable for review override. The brief explicitly allows "CSS-var or existing tokens"; the `rose` hue 350 fits the existing oklch palette pattern (170/70/245/295 in SHIPPED → add 350). No new tokens.css edit — additive rules go in `xai-web-calendar/styles.css` only.

### Q5 — Cross-component change notification: lift state up (A) vs new `web:calendar:events-changed` channel (B)

| Option | Pros | Cons | Planner pick |
|---|---|---|---|
| **A** State lifted into `CalendarModule`; `useState<UserCalEvent[]>` + setter passed down through props | Zero new event channel; zero `packages/core/` edit; React natural re-render covers HC1/HC2/HC3 | Props drill 3 levels (Module → Toolbar → ?) for the create-trigger | **A** |
| **B** New `web:calendar:events-changed` channel emit on every CRUD | Decouples views from store | Requires `packages/core/src/types/events.ts` edit (brief forbids unless justified); adds emit-listen latency for no observable user benefit | — |

**Planner recommendation: A.** The brief says channel additions need "feature-plan明确说明 + reason" — the reason fails: in-process re-render is already synchronous and zero-latency. Cross-tab consistency is handled by `usePref`'s standard `storage` event listener (already wired). No emit needed. AC-EVENT-7 invariant preserved.

### Q6 — Event store location: package-local `internal/eventStore.ts` (A) vs new sibling package `plugin-web-calendar-event-store` (B)

| Option | Pros | Cons | Planner pick |
|---|---|---|---|
| **A** All state + persistence + helpers under `packages/xai-web-calendar/src/internal/eventStore.ts` + a `useUserCalEvents()` hook in `internal/useUserCalEvents.ts` | One package, one publish; mirrors SHIPPED `xai_calendar_view` extension pattern (gap-closure row #4) | Slightly larger surface area inside xai-web-calendar (~5 new internal files) | **A** |
| **B** New `packages/plugin-web-calendar-event-store/` with its own manifest, tests, docs | Cleaner separation if a future row wants to share the store with desktop | Forces new manifest + slot registration + 4-doc init for what is fundamentally one feature in one consumer; doubles PR review surface | — |

**Planner recommendation: A.** Mirrors gap-closure row #4's "extension lives inside the same package" precedent. Reduces total file count, manifest churn, and review load. Future row can extract if a second consumer materializes.

### Q7 — Empty state UX (HC6)

When `userEvents.length === 0` AND `SAMPLE_EVENTS` is hidden (Q9 toggle off):

| Option | Description | Planner pick |
|---|---|---|
| **A** Bilingual centered hint "No events yet — click + to create" + arrow pointing at toolbar | Discoverable | **A** |
| **B** Just empty grid (no hint) | Minimal | — |
| **C** Auto-open composer on first load | Intrusive | — |

**Planner recommendation: A.** Bilingual STR `EMPTY_STATE_HINT.en/zh`. Rendered as a `.cal-empty-hint` div inside `<MonthGrid />` / `<WeekView />` / `<DayView />` when computed events for the viewport === 0. Doesn't block existing UI; pure visual hint.

### Q8 — Composer affordance (dialog open trigger map)

| Trigger | Result |
|---|---|
| Toolbar `+` click | Opens composer with today's date + 09:00-10:00 default + colorPreset "mint" + recurrence null |
| Click existing user event (Month chip, Week/Day block) | Opens composer pre-filled with that event |
| Click existing fixture event (when fixture is shown) | Opens **read-only** view (or short toast "Sample event — not editable") — fixture is not user data |
| Empty-state CTA "Create event" button | Same as toolbar `+` |
| Right-click on user event | (Out of scope for v1 — context menu is "Should" not "Must"; defer to follow-up unless edit/delete in dialog suffices) |

**Planner recommendation:** Wire toolbar `+` + click-existing-event for Must scope. Delete = button inside dialog (HC3 "Delete in-dialog" satisfies brief). Right-click context menu deferred to a follow-up row.

### Q9 — `SAMPLE_EVENTS` fixture disposition

| Option | Description | Planner pick |
|---|---|---|
| **A** Always-on fixture (current behavior) | Familiar; useful for demo | — |
| **B** Hide fixture once any user event exists | Auto-graceful transition | — |
| **C** Dev-only toggle (`xai_calendar_show_fixture: boolean`, default `true` in dev, `false` in prod build) | Easy demo path | — |
| **D** Move fixture to a "onboarding tour" mode toggled by a settings switch | Overengineered | — |
| **E** Always-on but visually marked as "Sample" with a small badge on each fixture chip | Honest; never hides | **E** + **B-fallback** |

**Planner recommendation: E primary; B as fallback if reviewer prefers auto-hide.**

E: render every fixture chip with a small `.cal-sample-badge` (text "Sample" / "示例") and the existing `cal.sample_banner` text stays. Fixture chips are NOT editable (Q8). Once a user creates real events, both fixture + real coexist visually distinguishable.

B: alternative — hide fixture when `userEvents.length > 0`. Simpler but loses the demo data after the first save.

Reviewer should pick. Default = E for honesty + demoability; both options have the same data layer (no schema fork).

### Q10 — Banner copy update

The current banner says: "Sample data — switch to your account to see real events." After this feature, users CAN have real events without an account. The banner copy is misleading.

| Option | Action | Planner pick |
|---|---|---|
| **A** Edit `plugin-web-tokens/i18n.ts` `cal.sample_banner` | Brief forbids tokens edit | — |
| **B** Override locally: when `SAMPLE_EVENTS` is visible AND user has 0 events → keep banner; when user has ≥1 events → hide banner | No tokens edit | **B** |
| **C** Leave banner; no-op | Honesty regression | — |
| **D** Replace banner with a local STR "Tip: events are stored in this browser only." (local string) | New local STR, no tokens edit | acceptable variant |

**Planner recommendation: B** — hide CalendarBanner once `userEvents.length > 0`. Keeps banner truthful when fixture is the only content. Composes with Q9-E nicely.

### Q11 — design.md HC8 lift mechanism (inline vs addendum)

| Option | Description | Planner pick |
|---|---|---|
| **A** Inline footnote on `design.md` §15.2 #8: "HC8 lifted in v1.1 per ADR-0010 §D4 carve-out 2026-05-27, see §16 (this feature)." + append new §16 with the lift rationale + new feature scope | One file; reader sees the lift in context | **A** |
| **B** New superseding addendum `packages/xai-web-calendar/docs/design.md` §16 only (no §15.2 edit) — readers must cross-reference | Append-only purity | — |
| **C** New file `packages/xai-web-calendar/docs/design-addendum-event-create.md` | Separates the lift entirely | — |

**Planner recommendation: A.** Single tiny footnote on §15.2 #8 is reader-friendly without losing the append-only history (the original §15 stays byte-identical except for the new sentence at the end of #8). Coupled with a new §16 "2026-05-27 Extension — Event CRUD (HC8 lift)" that mirrors the pattern of §15 "2026-05-25 Extension — Week + Day Views".

If reviewer disagrees, B is acceptable (zero §15.2 edit; §16 explicitly says "HC8 lifted per ADR-0010 §D4 carve-out — see §16"). Planner prefers A but flags both as valid.

### Q12 — Verify cross-vendor strategy

Per Workflow V2 default: cross-vendor verify is mandatory unless explicitly deferred.

| Phase | Cross-vendor scope | Planner pick |
|---|---|---|
| **P1 (data layer)** | Unit + integration; no UI. Skip cross-vendor. | skip |
| **P2 (composer dialog)** | Native `<dialog>` is implemented differently in Safari (focus trap quirks) vs Chrome. Cross-vendor smoke recommended at end of P2. | smoke-recommended |
| **P3 (Month wire)** | Visual + click. | smoke-recommended |
| **P4 (Week/Day wire + recurrence)** | Recurrence expansion is the highest-correctness-risk area. | **Codex cold-read mandatory** |
| **P5 (HC8 lift + polish)** | Docs + verify checklist. | full XVENDOR-CREATE-1..6 + Codex 5 items |

**Planner recommendation:** Codex `gpt-5.5-thinking effort=medium` for the P4 + P5 cross-vendor cold-read (focus on recurrence math + DST × recurrence interaction + persistence round-trip semantics). Per-phase same-vendor smoke during build. Final XVENDOR matrix in P5 verify step.

---

## 4. Frozen assumptions (16, lock at plan acceptance — review can revise)

1. Owning package = `@repo/plugin-web-calendar` (NO new package per Q6-A).
2. New file directory = `packages/xai-web-calendar/src/internal/eventStore/` (new subdirectory for cohesion).
3. User event schema = `UserCalEvent` per Q2 (id / title / startISO / endISO / colorPreset / recurrence / createdAt / updatedAt).
4. Recurrence rules = `{ kind: "daily" | "weekly" }` only (no monthly, no until, no exceptions) per scope.
5. Recurrence expansion = render-time, pure helper, bounded `maxInstances: 366` per Q3-B.
6. Persistence = `xai_calendar_events` localStorage key (NEW registry entry), codec `"json"`, default `{}` (object indexed by event id), category `"module"`, owner `"xai-web-calendar"`, schemaVersion 1.
7. Storage shape = `Record<string, UserCalEvent>` (id → event). NOT a date-keyed map (a single event ID owns one canonical entity; date-keying happens at render-time via `mergeAndIndex` helper).
8. State lifting per Q5-A; NO new `web:*` event channel.
9. Composer = native `<dialog>` per `CardDetailDialog.tsx` precedent; local `STR_EVENT_COMPOSER` table per `internal/strings.ts` (NEW); NO `plugin-web-tokens` edit.
10. Triggers = toolbar `+` + click-existing-user-event (Q8). Right-click context menu DEFERRED.
11. 5 color presets per Q4-C: mint / amber / blue / violet / rose (rose = new oklch in styles.css; NO tokens edit).
12. Fixture disposition per Q9-E: badge fixture chips as "Sample"; fixture chips remain non-editable; user events render alongside.
13. Banner per Q10-B: hide `<CalendarBanner />` when `userEvents.length > 0`; pass `userEventCount` prop from `CalendarModule`.
14. Empty state per Q7-A: bilingual hint "Click + to create your first event" + arrow.
15. HC8 lift mechanism per Q11-A: inline footnote on `design.md` §15.2 #8 + new §16 "2026-05-27 Extension — Event CRUD". Mirror the §15 append-only pattern.
16. Cross-vendor: Codex `gpt-5.5-thinking medium` mandatory in P4 + P5; per-phase same-vendor smoke OK during build.

---

## 5. Risks (R1..R12)

| ID | Risk | Severity | Mitigation |
|---|---|---|---|
| R1 | Recurrence expansion infinite loop on bad rule | High | Pure `expandRecurrence` helper with hard `maxInstances: 366` cap + unit tests (R1.1 daily over year window, R1.2 weekly over year, R1.3 malformed `kind`, R1.4 invalid date range, R1.5 cap reached). |
| R2 | Performance — recurrence × 365 days × N user events in Month view | Medium | Bounded window = month (≤31 days); expansion cap 366; memoize via `useMemo([userEvents, displayedMonth, view])`. Perf budget: viewport recomputation ≤ 16ms for 100 user events with daily recurrence. PB-CREATE-1 test. |
| R3 | Day-of-month vs full-date schema clash (R-NEW-1 from diagnose) | High | Mitigated via Q1-B merge layer. Fixture stays day-of-month; user events keyed by full date; merge helper unifies at view boundary. `MonthCell` receives a pre-built `CalEvent[]` array (no schema awareness needed). |
| R4 | Localstorage 5MB cap with daily-recurring user events | Low | Rule-not-instances storage means each event = ~200 bytes. 5MB = ~25,000 events. Brief says realistic v1 not multi-year horizon. |
| R5 | Recurrence + DST interaction (a 09:00 event on Mar 8 2026 spring-forward) | Medium | Local-clock semantics — store HH:MM string, not Date. Render-time conversion uses local `Date` constructor; DST shifts are visible as 1-hour gaps in the day's hour grid but the event's HH:MM stays stable. Test PB-DST-1 covers Mar 8 daily-recurring 09:30 event renders correctly on Mar 7/Mar 8 (spring-forward day) / Mar 9. |
| R6 | Composer ESC vs unsaved-changes prompt | Medium | v1: ESC discards changes (matches `CardDetailDialog` / `SignOutConfirmDialog`). Tooltip "Unsaved changes — press ESC again to discard" is gold-plating; defer. Add visible "Cancel" button to make discard explicit. |
| R7 | Click-event on Month chip vs delete button propagation | Medium | Use `event.stopPropagation()` on dialog action buttons; AC-DIALOG-7 asserts. |
| R8 | Bilingual STR drift (EN says something ZH doesn't) | Low | `STR_EVENT_COMPOSER` is a typed `Record<string, { en: string; zh: string }>` — TypeScript enforces parity at compile time (test helper `assertBilingual(STR_EVENT_COMPOSER)`). |
| R9 | Migration — first user open after upgrade has no `xai_calendar_events` key | None | `usePref` default `{}` is returned when key absent. Zero-state is the empty object. No migration code needed. |
| R10 | Crypto.randomUUID unavailable in old browsers | Low | Brief targets Safari 17+ / Chrome 120+ / Firefox 121+; all have `crypto.randomUUID()`. Fallback = simple `Date.now() + Math.random().toString(36)` if undefined. Tested via mocked `globalThis.crypto`. |
| R11 | HC8 lift documented in design.md but reader of dev_log line 766 still sees the original "no editing UI" assertion | Low | Mitigation: dev_log gains the same append-only footnote pattern in the new "Bugfix-Extension Lineage — feature row #..." block introduced by this feature. Reader sees both: the original assertion + the lift note. |
| R12 | Two SHIPPED extension blocks already on §15 (design.md) — third extension §16 might exceed reader-friendly file length | Low | `design.md` is currently ~810 lines (one §15 extension); +1 more §16 extension keeps it at ~1100 — still within file-mental-model. Future row might break out a separate `design-event-create.md` doc; not required now. |

Severity legend: Low (mitigated by pattern), Medium (test-covered), High (architectural — addressed by frozen assumption).

---

## 6. Selected option & rationale

**Selected combination:**

- Q1: B (new shape + merge layer)
- Q2: ACCEPT (id / title / startISO / endISO / colorPreset / recurrence / createdAt / updatedAt)
- Q3: B (render-time expansion, bounded)
- Q4: C (5 presets, +1 new CSS rule)
- Q5: A (state lifted; no new channel)
- Q6: A (package-local internal subdir)
- Q7: A (bilingual empty-state hint)
- Q8: toolbar `+` + click-existing event (right-click DEFERRED)
- Q9: E (badge fixture as "Sample"; non-editable)
- Q10: B (hide banner when userEvents.length > 0)
- Q11: A (inline footnote + new §16)
- Q12: Codex `gpt-5.5-thinking medium` cross-vendor mandatory P4+P5

**Why this combination is right:**

1. **Minimum blast radius on SHIPPED code.** Q1-B + Q6-A + Q5-A together mean the SHIPPED 197+ test cases stay untouched in their assertions; we only ADD tests, not modify them. Q11-A inline footnote preserves design.md history.
2. **Honors all hard constraints in the brief.** No new npm dep; no Supabase/IndexedDB; no auth changes; no `packages/core/` edits; no `plugin-web-tokens` edits; no SHIPPED manifest churn.
3. **Reuses every existing pattern.** Dialog = `CardDetailDialog`; local STR = `internal/strings.ts`; event-store = `xai_calendar_view` extension precedent; recurrence math = pure helper like `placeEventBlocks` + `dstHoursForDay`.
4. **Lands all 7 HCs in 5 phases** (see §7).
5. **HC8 lift is a single inline edit + an append-only §16** — minimum mutation of existing docs.
6. **Cross-vendor verify is risk-targeted** — Codex cold-read fires only when recurrence math + DST × recurrence enters scope.

---

## 7. Phased build plan (5 phases — one feature-build per run)

| Phase | Scope | Tests gate | Cross-vendor |
|---|---|---|---|
| **P1** Data layer + types + EventStore + persistence + pure helpers + tests | New `internal/eventStore/{types.ts, eventStore.ts, useUserCalEvents.ts, expandRecurrence.ts, mergeEventsForViewport.ts, ids.ts}` + `internal/strings.ts` skeleton; new registry entry `xai_calendar_events`; +~40 unit tests; types-d updates | All P1 helpers ≥ 95% branches; SHIPPED 197 stay green; storage tests +2 AC-REGISTRY-CREATE-1..2 | skip |
| **P2** EventComposer dialog component + STR + tests + styles | New `EventComposer.tsx` + `internal/strings.ts` finalize; `styles.css` additive (`.event-composer`, `.event-composer__field`, `.event-composer__actions`, +5 `.ev-rose` rules); +~25 component tests | Composer 100% RTL coverage; open/close/save/delete/recurrence/color | smoke-recommended |
| **P3** Calendar toolbar `+` wire + Month view integration + tests | `CalendarToolbar.tsx` gain `onAdd` prop; `CalendarModule.tsx` state lift `userEvents`; `MonthCell.tsx` click handler on user event chips; user events render alongside fixture (badged "Sample" per Q9-E); empty-state hint; banner-hide logic | +~20 integration tests (HC1+HC6 via Month) | smoke-recommended |
| **P4** Week/Day view integration + recurrence expansion + DST × recurrence tests | `WeekView.tsx` + `DayView.tsx` consume merge layer; recurrence expansion wired through `expandRecurrence` + `mergeEventsForViewport`; click-event in time grid for edit | +~20 integration tests + DST × recurrence (PB-DST-1) + perf budget (PB-CREATE-1) | **Codex cold-read mandatory** |
| **P5** HC8 lift annotation + design.md §16 + verify checklist + PLUGIN_MAP note + final cleanup | design.md §15.2 #8 footnote + new §16; api.md §11; test.md §9; dev_log new "Bugfix-Extension Lineage" or equivalent; PLUGIN_MAP row #12 note; cross-vendor smoke matrix; Codex cold-read 5 items | All P4 + ~5 polish tests; coverage ≥ targets | full XVENDOR-CREATE-1..6 + Codex 5 |

Total estimated new tests: ~110 (40 P1 + 25 P2 + 20 P3 + 20 P4 + 5 P5). SHIPPED 197+88+106 = 391 stay green throughout.

Estimated commits: ~7-10 (1 per phase + 1 docs sync per phase). Each commit follows `type(scope): summary` + Why/What/Scope/Risk/Docs/Tests body per `docs/conventions/COMMIT_CONVENTION.md`.

---

## 8. Out-of-scope (explicitly deferred)

Out of scope confirmed against operator brief §"Won't" list:

- Tasks card creation (Audit Top-10 #3) — separate decision.
- Timezone awareness (browser local TZ).
- Cross-device sync (deferred to ADR-0011 / xai-g2).
- Drag-drop reschedule.
- Multi-day events.
- Reminders / notifications.
- Recurrence: monthly, yearly, until-date, byWeekday, exceptions.
- Labels / categories beyond preset colors.
- IndexedDB migration.
- Real backend (Supabase / Firebase / etc.).
- Auth changes.

Also deferred but not in brief's Won't list:

- Right-click context menu (Q8) — defer to follow-up row.
- Drag-to-resize event blocks in Week/Day — already deferred by gap-closure row #4.
- Unsaved-changes prompt on ESC (R6) — defer.

---

## 9. Architectural risk: low

- No `packages/core/` edit (no new event channel per Q5-A).
- No new `manifest.json` package (Q6-A).
- No new npm dependency.
- One additive registry entry `xai_calendar_events` (matches `xai_calendar_view` precedent SHIPPED 2026-05-25).
- One additive CSS rule family (5 ev-rose + dark) — tokens-only, no `tokens.css` edit.
- HC8 lift = 1 footnote + 1 new §16 append. dev_log gets append-only bugfix-extension-lineage block.
- All SHIPPED tests stay green (zero existing-test mutation).
- PLUGIN_MAP row #12 gets a note appended in P5 (no Status change — stays `Stable`).

---

## 10. Cross-vendor verify proposal

Primary cross-vendor verifier: **Codex `gpt-5.5-thinking effort=medium`** (cold-read focus on recurrence math + DST × recurrence + persistence round-trip semantics).

Fallback: **Cursor** when Codex quota exhausted.

Mandatory phases: **P4 (recurrence wired) + P5 (final verify checklist)**.

Cross-vendor smoke matrix (P5):

- XVENDOR-CREATE-1: open `/app/calendar` in Safari 17+ → click `+` → composer opens → enter title + dates → save → event renders.
- XVENDOR-CREATE-2: same in Chrome 120+.
- XVENDOR-CREATE-3: same in Firefox 121+.
- XVENDOR-CREATE-4: refresh after save → event preserved (all 3 browsers).
- XVENDOR-CREATE-5: create daily-recurring event → verify visible on Day + Week + Month (Chrome).
- XVENDOR-CREATE-6: edit existing event → save → view updates (all 3 browsers).

Codex cold-read items (P4 + P5, 5 total):

- Codex-1: review `expandRecurrence` algorithm correctness against the simple "daily/weekly only" spec + maxInstances cap.
- Codex-2: review `mergeEventsForViewport` purity + memo key choice.
- Codex-3: review persistence round-trip — does `usePref<"xai_calendar_events">` correctly preserve `UserCalEvent[]` shape across reload?
- Codex-4: review DST × recurrence — does a 09:30 daily event display correctly on spring-forward day (Mar 8 2026)?
- Codex-5: review HC8 lift annotation completeness (footnote + §16 + dev_log block).

XVENDOR + Codex may DEFER per ADR-0008 §S3 24h-evidence carve-out precedent if operator time-boxed; deferral recorded in `dev_log.md` verify section per matrix / habits / countdown precedent.

---

## 11. References

- Operator brief: `docs/reviews/xai-web-calendar-event-create/20260527-feature-brief.md`
- P0 carve-out: `docs/reviews/_p0-carve-outs/20260527-calendar-event-create.md`
- Audit Top-10: `docs/reviews/_web-noop-audit/20260527-button-action-inventory.md` §2.5
- ADR-0010 §D4: `docs/adr/0010-p1-desktop-resume-plan.md:105-115`
- design.md §15.2 HC8: `packages/xai-web-calendar/docs/design.md:602`
- dev_log HC8 line: `packages/xai-web-calendar/docs/dev_log.md:712`
- Dialog pattern precedents: `packages/xai-web-shell/src/SignOutConfirmDialog.tsx`; `packages/plugin-web-board-workspaces/src/CardDetailDialog.tsx`; `packages/xai-web-dashboard-grid/src/AddWidgetPicker.tsx`
- Storage precedent for `xai_calendar_view`: `packages/plugin-web-storage/src/internal/registry.ts:861-868`
- Diagnose Option B section: `packages/xai-web-calendar/docs/dev_log.md:986-1010` (risks R-NEW-1..5)
- Workflow: `docs/workflow/SUBAGENT_WORKFLOW_V2.md` + `docs/workflow/SOP_NEW_FEATURE.md`
- Commit convention: `docs/conventions/COMMIT_CONVENTION.md`
- ADR-0007 (web build form): `docs/adr/0007-xai-web-console-build-form.md`
