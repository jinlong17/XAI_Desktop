## REL-01 local due-date contract (2026-09-09)

This section supersedes historical yearless/bucket-only date rules below (including D-QT and old dateForCol offsets).

- `TaskCard.dueDate` / `NewTaskDraft.dueDate` are optional strict `YYYY-MM-DD` local calendar identities. Legacy `date`, `dateZh`, and `dateLabel` are display data only: never infer a year, shift their day, or delete a historical task because no real due date exists. Invalid string dates remain visible for manual repair; predicates do not count them.
- Today includes dated tasks due today **and overdue**; Tomorrow is exactly the next local day; Next 7 Days is `(today, today + 7 calendar days]`. These predicates inspect dates across all stored columns, including completed groups, and never mutate input.
- The rendered/persisted time columns regroup known dates as Today / Overdue (`<= today`), Next 7 Days, and Later. Legacy unknown dates retain their original column; moving a list or tag does not fabricate a date. Shared `useLocalDayClock` refreshes midnight and browser resume. Date identity survives reload and DST.
- Composer explicitly accepts a date; detail edits accept a date or clear it. Date edits regroup immediately. Clearing a date moves to No Date. An explicit cross-time-column move schedules Today / Overdue = today, Next 7 Days = tomorrow, Later = eight days from today; No Date clears dueDate and stale date labels. Same-column moves are no-ops. Source, subtitle, notes, tags, list, and completion survive moves.
- `TaskCardPatch.dueDate`: omitted preserves date; null clears; valid string replaces; invalid string rejects the patch. Legacy `withDate` callers remain supported through the same date presets. Board-linked inputs retain validated dueDate and source.
- Uses only public `@repo/plugin-web-tokens` date helpers. Device-local persistence only; does not enable cloud sync or guarantee background JavaScript execution when a tab is closed.

# Design — `@repo/plugin-web-tasks`

> Decision snapshot for the Tasks module port.
> Discovery review: [docs/reviews/xai-web-tasks/20260523-discovery-review.md](../../../docs/reviews/xai-web-tasks/20260523-discovery-review.md)
> Governing ADR: [docs/adr/0007-xai-web-console-build-form.md](../../../docs/adr/0007-xai-web-console-build-form.md) §S4 + §S6 + §S7 + §S8
> Roadmap row: xai-web-console #6 (wave W2b, parallel with #14 pomodoro, #15 habits)
> Source prototype: `web design/module-tasks.jsx` (286 lines, ≈11.5 KB)
> Status: PLANNED — pending feature-review

---

## 1. Decision

Implement the Tasks module as a single workspace package `@repo/plugin-web-tasks` (directory `packages/xai-web-tasks/`), porting the prototype's:

1. 2nd-level **sidebar** (Smart Lists / Custom Lists / Filters / Tags / Calendar Subscription / Completed / Won't Do / Trash).
2. **4-column time-bucket main view** (`overdue` / `next7` / `later` / `nodate`).
3. **Task cards** with checkbox / tag pill / date / inbox indicator / completed + dragging states.
4. **Cross-column DnD** that **rewrites the dropped card's due date** to the destination bucket (Overdue=-3d / Next7=+2d / Later=+30d / NoDate=clear) and persists to `xai_task_cols` via `usePref`.

### Selected options (from discovery §2)

| Axis | Option | Rationale |
|---|---|---|
| A — Persistence shape | **A1** Persist full `TaskCol[]`; cast `usePref` raw value through `unknown` + validate guard | Faithful to prototype's reload-restores-board behaviour; matches `xai_countdowns` precedent. |
| B — Seed location | **B1** Local `src/internal/seed/tasksMock.ts` | ADR-0007 frozen assumption 2 (one module = one package); no new shared seed package. |
| C — DnD mechanism | **C1** HTML5 DnD (`draggable` + `dataTransfer`) | 1:1 port; no new dep; jsdom-compatible for happy-path. |
| D — Date-rewrite helper | **D1** Extracted pure `dateForCol(bucketId, now?)` | Test-friendly with `vi.setSystemTime()`; mirrors `computeDaysUntil.ts` discipline. |

---

## 2. Frozen assumptions

These are the hard inputs from the seed brief + ADR-0007. Changing any requires re-running feature-plan, not silent edits.

1. **Toolchain & layout** — `packages/xai-web-tasks/` with `package.json` + `manifest.json` + `tsconfig.json` + `src/index.ts` + `docs/` four-pack. NPM name `@repo/plugin-web-tasks`. React 19, TS 5.9, Vite 7. Per ADR-0007 §S4 frozen assumption 2.
2. **Sole shell registration** — exports `tasksWebModuleRegistration: WebModuleSlotRegistration` consumed by `apps/web/src/routes/modules/shellRegistrations.tsx`. Replaces (not adds-alongside) the existing `placeholder("tasks", "Tasks", "check", 2)`. `railOrder: 2`, `icon: "check"`, `showInRail: true`, `i18nKey: "nav.tasks"`.
3. **i18n** — every visible string flows through `useI18n(lang).s(path)` from `@repo/plugin-web-tokens`. No literal strings. EN/中文 parity is acceptance-blocking. Required keys already present in tokens (`common.*`, `tasks.all`, `tag.*`); P1 plan does not add new keys.
4. **Persistence** — `usePref("xai_task_cols")` from `@repo/plugin-web-storage` is the only persistence API touched. The key is already in the registry (per ADR-0007 §S8); we do **not** edit `packages/plugin-web-storage`.
5. **No new state libraries** — `useState` + `useReducer` + `usePref` only. ADR-0007 JSX→TSX rule 10.
6. **DnD constraints** — destination-column highlight uses accent color via `.drop-target` class + tokens variable; topbar shows hint while dragging (string sourced from i18n).
7. **No event emission in v1** — the prototype emits nothing; this row keeps that. A potential `web:tasks:*` channel family is reserved for a later iteration (Statistics row #20 dependency).
8. **Cross-vendor**: yes — file scope is `packages/xai-web-tasks/`, `docs/reviews/xai-web-tasks/`, and three precise Edits to shared files (`apps/web/src/routes/modules/shellRegistrations.tsx`, `apps/web/package.json`, and **conditionally** `apps/web/src/App.tsx` only if outlet-context wiring needs it; see §5).
9. **Parallel-Agent safety** — sibling rows #14, #15 run concurrently; all shared-file Edits use unique anchors and follow the git-index retry policy (8 / 12 / 16 / 20 / 20 s × 5).
10. **Supersession** — this row supersedes `web-ticktick-parity` row `web-todo-first-slice`'s UI surface (seed brief §Authority). Data-layer hand-off is non-scope.

---

## 3. Dependency overview

### Workspace dependencies (declared in `package.json`)

| Dep | Why |
|---|---|
| `@repo/core` | `EventMap` host (no events emitted in v1; declared for future). |
| `@repo/plugin-web-tokens` | `useI18n`, `Lang` type, design tokens via side-effect CSS chain. |
| `@repo/plugin-web-storage` | `usePref("xai_task_cols")`. |
| `@repo/xai-web-shell` | `WebModuleSlotRegistration`, `useWebShell` (for lang in slot wrapper). |
| `@repo/xai-web-event-bus` (devDep only) | Type-only future hook; not imported in v1 sources. |

### Inverse: who depends on us?

In v1, only `apps/web/` (host shell) — via `shellRegistrations.tsx`. No plugin imports `@repo/plugin-web-tasks` directly (ADR-0007 §S7 forbids inter-plugin imports).

### Plugin-map status check

Per CLAUDE.md "Before Working on Any Plugin": deps consumed here (`@repo/core`, `@repo/plugin-web-tokens`, `@repo/plugin-web-storage`, `@repo/xai-web-shell`, `@repo/xai-web-event-bus`) are all SHIPPED siblings of this row's wave. ADR-0007 §S6 lists the SHIPPED bases. No mocking needed.

---

## 4. Module structure

```
packages/xai-web-tasks/
├─ docs/
│  ├─ design.md             ← this file
│  ├─ api.md
│  ├─ test.md
│  └─ dev_log.md
├─ src/
│  ├─ index.ts              ← public surface
│  ├─ types.ts              ← TaskCard, TaskCol, BucketId, etc.
│  ├─ TasksModule.tsx       ← root component
│  ├─ TasksSidebar.tsx      ← 2nd-level sidebar
│  ├─ TaskColumn.tsx        ← single column (head + body + empty hint)
│  ├─ TaskCard.tsx          ← card view (checkbox + meta)
│  ├─ CompletedGroup.tsx    ← collapsible completed list inside nodate
│  ├─ registration.tsx      ← tasksWebModuleRegistration slot
│  ├─ styles.css            ← side-effect CSS (uses tokens vars)
│  └─ internal/
│     ├─ tasksReducer.ts    ← pure move/toggle/seed/validate helpers
│     ├─ dateForCol.ts      ← pure bucket date rewrite
│     ├─ validate.ts        ← isTaskColsArray, isTaskCard guards
│     └─ seed/
│        └─ tasksMock.ts    ← typed port of web design/i18n.js MOCK fragments
├─ package.json
├─ manifest.json
├─ tsconfig.json
├─ vitest.config.ts
└─ vitest.setup.ts
```

Public surface (`src/index.ts`) exports — **only**:
- `TasksModule` component
- `tasksWebModuleRegistration` (the `WebModuleSlotRegistration` consumed by host)
- Public types: `TaskCard`, `TaskCol`, `BucketId`, `TasksModuleProps`

Internal modules (`src/internal/**`) are **not** part of the public surface (CLAUDE.md "Code Boundaries").

---

## 5. Host-shell wiring

Two Edits on shared files; both have unique anchors so sibling agents cannot collide:

### Edit 1 — `apps/web/src/routes/modules/shellRegistrations.tsx`

Replace the placeholder line:

```diff
- placeholder("tasks",      "Tasks",      "check",     2),
+ tasksWebModuleRegistration,
```

…and add the import:

```ts
import { tasksWebModuleRegistration } from "@repo/plugin-web-tasks";
```

Anchor: `placeholder("tasks",      "Tasks",      "check",     2),` — unique in file (verified).

### Edit 2 — `apps/web/package.json`

Add to `dependencies`:

```diff
  "@repo/plugin-web-matrix": "workspace:*",
+ "@repo/plugin-web-tasks": "workspace:*",
```

Anchor: `"@repo/plugin-web-matrix": "workspace:*",` — unique (verified).

### `apps/web/src/App.tsx` — **no edit required**

The `WebShellProvider` already passes `lang` down via `useWebShell()`, which is what `registration.tsx` will read in its `TasksModuleRoute` wrapper (exact pattern: countdown row's `registration.tsx` lines 24-27). No outlet-context change needed.

---

## 6. Persistence contract

- Key: `xai_task_cols` (already in `PREF_REGISTRY`; codec `json`, owner `xai-web-tasks`, schemaVersion 1).
- Registry-declared type: `TaskColsState = Record<string, boolean>` — **this is a placeholder type**; the actual persisted shape is a full `TaskCol[]` array.
- Boundary pattern (mirrors `xai-web-countdown`):

  ```ts
  const [raw, setRaw] = usePref("xai_task_cols");
  const cols = useMemo<TaskCol[]>(() => {
    if (!isTaskColsArray(raw)) return SEED_TASK_COLS;
    return raw;
  }, [raw]);
  ```

- On first load (key absent), seed from `tasksMock.ts` and **do not write** until first user action — this matches the countdown pattern and avoids polluting empty installs.
- On every reducer commit, write the full new `TaskCol[]`.
- Schema migration: none in v1. If a future row tightens the registry type to `TaskCol[]`, this row's guard remains correct because `isTaskColsArray` is the more specific check.

### Future events (not implemented in v1)

The following channel-key reservations are documented for traceability **only** — no implementation, no EventMap addition in this row:

- `web:tasks:card-completed { taskId, bucketId, completedAt }` — emit when a card is toggled to completed.
- `web:tasks:bucket-changed { taskId, fromBucketId, toBucketId, newDueDate, changedAt }` — emit when DnD moves a card.

These would be consumed by Statistics (#20). Adding them belongs to a later iteration; documenting the names here lets reviewers reason about the future contract.

---

## 7. Phase plan (mirrors `dev_log.md`)

- **P1 — Scaffold + read-only render**: package files, public surface stubs, seed `tasksMock.ts`, `TasksSidebar`, `TaskColumn`, `TaskCard`, `CompletedGroup` rendering the seed data; no DnD; no persistence; no host wire-up yet.
- **P2 — DnD + date-rewrite + persistence + host slot**: `dateForCol`, `tasksReducer`, HTML5 DnD wiring (`onDragStart` / `onDragOver` / `onDrop`), `.drop-target` accent highlight, topbar drag hint, `usePref` round-trip, Edit `shellRegistrations.tsx` + `apps/web/package.json`.
- **P3 — Tests + cross-vendor + real-browser sweep**: vitest suite (reducer + dateForCol + validate + RTL render), barrel test, registration test, pnpm install, typecheck, lint, manual real-browser DnD round-trip on macOS Safari/Chrome (acceptance signal from seed brief).

Each phase ends with feature-build STOP per Workflow V2 rule.

---

## 8. Out of scope

- Real Smart-Lists / Filters / Tags / Calendar Subscription navigation (sidebar rows render as decorative).
- Task create / edit / delete UI (the prototype has only toggle-complete + DnD-reschedule).
- Per-list filtering of the 4-column view (the prototype always shows all tasks regardless of `list` state — verified in `module-tasks.jsx`).
- Touch / pointer DnD (HTML5 DnD is mouse-only).
- Cross-tab realtime sync of `xai_task_cols` beyond what `usePref` already offers (it already broadcasts `storage` events; we get this for free).
- Any change to `packages/plugin-web-storage` (including tightening `TaskColsState`).
- Event emission (deferred — see §6 "Future events").

---

## 9. Open questions

(Tracked verbatim in `dev_log.md`.)

- **Q1**: Is the `Postpone +` action button on the `overdue` column a functioning button in v1, or decorative? — **Provisional answer: decorative** (prototype's button has no `onClick`). Confirm at review.
- **Q2**: When DnD moves a card *to* the `nodate` bucket, does the card lose its tag pill? — **Answer: No.** Prototype lines 195-196 say "Keep tag/inbox". Only `date`, `dateZh`, `dateLabel`, and `sub` are stripped on bucket change.
- **Q3**: Does `tasksWebModuleRegistration` need a non-empty `defaultChildPath`? — **Answer: No.** Countdown registration uses `defaultChildPath: ""` + a single `{ path: "", render }` row plus `{ path: "*", render }` for unknown sub-paths. We mirror that.

---

# Extension — xai-web-tasks-card-create (2026-05-28)

> APPENDED extension. The SHIPPED v1 content above (§1–§9) is unchanged.
> Decision snapshot only — discovery detail lives in the review doc, not here.

## E.0 Decision snapshot

| Field | Value |
|---|---|
| Feature | `xai-web-tasks-card-create` (column `+` → TaskComposer → reducer create → persist) |
| Selected Option | A1 (state lift in `TasksModule`) + B1 (`addCard` pure reducer action) + C1 (optional bucket-derived date) + D1 (single bilingual title) + E1 (native `<dialog>`) + D5 (Edit/Delete DEFERRED) |
| Discovery / Review Doc | `docs/reviews/xai-web-tasks-card-create/20260528-discovery-review.md` |
| Feature Brief | `docs/reviews/xai-web-tasks-card-create/20260528-feature-brief.md` |
| Roadmap Manifest | `docs/workflow/roadmap/xai-web-tasks-card-create.md` |
| Review Date / Version | 2026-05-28 (v1 — pending feature-review) |
| Governing Authority | ADR-0010 §D4 P0 carve-out (`docs/reviews/_p0-carve-outs/20260528-tasks-card-create.md`, commit `09673f8`) |

## E.1 Frozen assumptions (extension)

Changing any of these requires re-running feature-plan, not a silent edit.

1. **No new package** — all new code lands in `packages/xai-web-tasks/src/`.
2. **New files**: `src/internal/ids.ts`, `src/internal/strings.ts`, `src/TaskComposer.tsx`.
3. **One new reducer action** — `addCard(prev, draft, targetBucket, now?)`, pure, symmetric with `moveCard` (prepend + `count+1` + referential equality for untouched columns). `tasksReducer.ts` had ONLY `moveCard` + `toggleComplete` before this feature (confirmed in discovery §1).
4. **New exported type** — `NewTaskDraft = { title: string; tag?: TaskTagId; withDate: boolean }` (additive in `types.ts`).
5. **Persistence reuse** — `xai_task_cols` (registry.ts:197-204; json codec, owner `xai-web-tasks`). NO `packages/plugin-web-storage` edit. Created card flows through the SHIPPED `setRawCols(next as unknown as ...)` boundary cast.
6. **No new event channel** — composer state lifts into `TasksModule` via `useState`; NO `packages/core/src/types/events.ts` edit (Calendar Q5-A precedent).
7. **Composer** — native `<dialog>` + `showModal()`/`close()` + `cancel`(ESC) + backdrop-click + `setTimeout(0)` autofocus, mirroring `EventComposer.tsx`. Tag picker + bucket picker are `role="radiogroup"`.
8. **Single bilingual title** — one input fills both `title.en` + `title.zh`; label follows active UI lang.
9. **Local STR** — `src/internal/strings.ts` (en+zh). NO `plugin-web-tokens` edit. Existing tokens keys (`common.add`, `tag.*`, column keys) keep flowing through `useI18n`.
10. **Date on create** — optional. If opted-in and target ≠ `nodate`, reuse `dateForCol(targetBucket, now)`. No free-form date picker in v1.
11. **id** — `createTaskId()` (`crypto.randomUUID()` + `t-<base36ts>-<rnd>` fallback) mirroring `calendar/eventStore/ids.ts`. Disjoint from seed's `t<digit>`/`c<digit>` namespace.
12. **Edit + Delete DEFERRED** — `TaskCard` onClick is already bound to toggle-complete (`TaskCard.tsx:49,52`), so an edit affordance collides; Edit/Delete needs `updateCard`/`deleteCard` + a 2nd dialog + a card-affordance redesign (above the low-cost bar). Pre-scoped as the next increment.
13. **No host-shell edit** — the slot (`tasksWebModuleRegistration`, railOrder 2) already SHIPPED; create needs no registration change.

## E.2 Dependency overview (extension)

No new dependencies. Reuses the SHIPPED dep set (`@repo/core`, `@repo/plugin-web-tokens`, `@repo/plugin-web-storage`, `@repo/xai-web-shell`) — all `Stable`. Internal reuse: `dateForCol`, `validate.isTaskCard`/`isTaskColsArray`, `usePref("xai_task_cols")`, `useI18n`. New internal precedent borrowed from `packages/xai-web-calendar/src/internal/eventStore/ids.ts` (pattern only — not an import; no inter-plugin import per ADR-0007 §S7).

## E.3 Module structure delta

```
packages/xai-web-tasks/src/
├─ TaskComposer.tsx           ← NEW: native <dialog> create form
├─ types.ts                   ← +NewTaskDraft (additive export)
├─ TasksModule.tsx            ← +composer state (open/targetBucket) + addCard dispatch + onAddCard handler
├─ TaskColumn.tsx             ← +onAddCard?(bucketId) prop; wire the +button onClick
├─ styles.css                 ← +composer dialog rules (appended)
└─ internal/
   ├─ ids.ts                  ← NEW: createTaskId()
   ├─ strings.ts              ← NEW: STR_TASK_COMPOSER (en+zh)
   └─ tasksReducer.ts         ← +addCard pure action
```

Public surface (`src/index.ts`) gains `NewTaskDraft` type export (and may export `TaskComposer` if a consumer ever needs it — v1 keeps it internal to the module, surfaced only via `TasksModule`).

## E.4 Phase plan (extension — mirrors dev_log Phase Plan)

- **EP1 — Data layer**: `internal/ids.ts` (`createTaskId`), `addCard` in `tasksReducer.ts`, `NewTaskDraft` in `types.ts` + barrel export, `internal/strings.ts`. Unit tests (reducer addCard + ids shape). No UI yet. SHIPPED 40 tests stay green.
- **EP2 — Composer + wire + persistence**: `TaskComposer.tsx` (native dialog, single title input, tag radiogroup, bucket radiogroup, optional-date opt-in, inline title-required error, ESC/backdrop/Cancel). `onAddCard` prop on `TaskColumn`; wire the `+` onClick. Composer state in `TasksModule`; save → `addCard` → `setRawCols`. RTL + persistence tests (create → localStorage round-trip; empty-bucket create).
- **EP3 — Integration + a11y + cross-vendor**: end-to-end create→persist→refresh test; a11y tests (autofocus, ESC, backdrop); index-barrel test for new export; full tasks + web suites green; Codex cold-read (or deferred per ADR-0008 §S3); dev_log verify section; PLUGIN_MAP note at ship.

Each phase ends with `feature-build` STOP per Workflow V2.

## E.5 Out of scope (extension)

- Edit / Delete card UI (deferred — E.1 #12).
- Free-form date entry (bucket-derived only — C1).
- T-10 completion persistence (different code path).
- Event emission / Statistics / Matrix coupling.
- Any `plugin-web-storage`, `plugin-web-tokens`, `packages/core`, or host-shell edit.

---

# Extension — xai-web-tasks-smartlist-filter (2026-05-28)

> APPENDED extension (Iteration 3). The SHIPPED v1 content (§1–§9) and the
> card-create extension (§E.0–§E.5) above are unchanged.
> Decision snapshot only — discovery detail lives in the review doc, not here.

## F.0 Decision snapshot

| Field | Value |
|---|---|
| Feature | `xai-web-tasks-smartlist-filter` (lift `activeList` to `TasksModule` + pure `filterCardsByList` view selector) |
| Selected Option | **A1** (state lift into `TasksModule`, props down to sidebar) + **B1** (bucket-derived pure selector — NOT date-string parsing) + **session-only** (Q3, no registry key) + **DEFER** custom-list/tag filtering (Q1) + **Summary-as-all** (Q2) + **D1** board-level honest empty state |
| Discovery / Review Doc | `docs/reviews/xai-web-tasks-smartlist-filter/20260528-discovery-review.md` |
| Feature Brief | `docs/reviews/xai-web-tasks-smartlist-filter/20260528-feature-brief.md` |
| Roadmap Manifest | `docs/workflow/roadmap/xai-web-tasks-smartlist-filter.md` |
| Review Date / Version | 2026-05-28 (v1 — pending feature-review) |
| Governing Authority | ADR-0010 §D4 P0 carve-out (`docs/reviews/_p0-carve-outs/20260528-tasks-smartlist-filter.md`, commit `eacf1e5`) |

## F.1 Frozen assumptions (extension)

Changing any of these requires re-running feature-plan, not a silent edit.

1. **No new package** — all new code lands in `packages/xai-web-tasks/src/`.
2. **Filtering is a VIEW concept** — a pure `filterCardsByList(cols, list, now?)` selector produces a *filtered render shape*; it NEVER writes storage, NEVER calls `moveCard`/`toggleComplete`/`addCard`. The stored `xai_task_cols` is never mutated by the filter.
3. **`activeList` lifts into `TasksModule`** via `useState` (default `"all"`); `TasksSidebar` becomes a controlled component receiving `activeList` + `onSelectList` props. NO `packages/core/src/types/events.ts` edit (props lift only — card-create Iteration-2 / Calendar Q5-A precedent).
4. **Bucket-derived predicates (B1), NOT date-string parsing (B2/B3 rejected).** `TaskCard.date` is a year-less display string in two formats (`"7/31"` / `"Jun 14"`) and `next7` cards have no `date` at all (discovery §1.2). Temporal class is derived from **bucket membership** (the board's existing persisted date semantics via `dateForCol`), not by parsing strings. No `TaskCard` schema change.
5. **Per-list predicates** (discovery §3): `all`→identity; `inbox`→`card.inbox===true` across all buckets incl. `nodate.completed`; `next7`→`next7` bucket cards; `today`→`overdue` bucket cards (bucket approximation — Q-T); `tomorrow`→`next7` bucket cards (bucket approximation — Q-T); `summary`→identity (Q2 treat-as-all).
6. **Session-only selection** — NO new registry key, NO `plugin-web-storage` edit. The existing `xai_pref_smart_lists` (owner `xai-web-settings-rest`, `Record<string,string>`) is NOT reused (wrong owner + wrong shape — discovery §1.5).
7. **Custom-list + tag rows DEFERRED** (Q1) — no list/tag membership model exists; those rows become explicitly non-selecting (inert) this iteration. Only the 6 `SmartListId`s drive the filter.
8. **Honest empty state (D1)** — when a filter is active and the board yields zero cards, render a board-level "Nothing in {list}" message from a NEW local STR entry; suppress the per-column "drop here" hint while filtering. NO `plugin-web-tokens` edit.
9. **Local STR only** — new empty-state strings append to `src/internal/strings.ts` (en+zh). NO `plugin-web-tokens` edit.
10. **No host-shell edit** — slot `tasksWebModuleRegistration` (railOrder 2) already SHIPPED; filtering needs no registration change.
11. **SHIPPED behaviour preserved** — drag (T-12/moveCard), create (`addCard`), complete (T-10/`toggleComplete`), and persistence boundary are untouched; their existing test suites must stay green.

## F.2 Dependency overview (extension)

No new dependencies. Reuses the SHIPPED dep set (`@repo/core`, `@repo/plugin-web-tokens`, `@repo/plugin-web-storage`, `@repo/xai-web-shell`) — all `Stable`. Internal reuse: `usePref("xai_task_cols")` (read only), `BucketId`/`TaskCol`/`TaskCard` types, `useI18n` (existing keys), the SHIPPED `setRawCols` boundary cast (untouched). New internal: `filterCardsByList` selector + a `SmartListId` type export decision (F.3).

## F.3 Module structure delta

```
packages/xai-web-tasks/src/
├─ internal/
│  └─ filterCardsByList.ts   ← NEW: pure view selector (cols, list, now?) → cols
├─ types.ts                  ← +SmartListId type (additive; shared by sidebar + selector)
├─ TasksSidebar.tsx          ← activeList/onSelectList become props (remove local useState);
│                               custom-list/tag rows made non-selecting (Q1)
├─ TasksModule.tsx           ← +activeList useState + onSelectList; filtered view via useMemo;
│                               board-level empty state; mutation handlers stay on UNFILTERED taskCols
├─ TaskColumn.tsx            ← suppress per-column "drop here" hint when a filter is active (small prop)
├─ internal/strings.ts       ← +empty-state STR entries (en+zh)
└─ styles.css                ← +empty-state rule (appended, if needed)
```

Public surface (`src/index.ts`): `SmartListId` MAY be exported if a consumer needs it; v1 keeps it internal-to-module unless review prefers exporting (the type is currently a local alias in `TasksSidebar.tsx:39`). `filterCardsByList` stays internal (`src/internal/**`).

## F.4 Phase plan (extension — mirrors dev_log Phase Plan)

- **FP1 — Lift + selector + structural lists**: `internal/filterCardsByList.ts` (pure: `all`/`inbox`/`next7`/`today`/`tomorrow`/`summary` predicates); `SmartListId` in `types.ts`; lift `activeList` into `TasksModule` + pass props to `TasksSidebar` (controlled); apply the filter via `useMemo` to the rendered columns; make custom-list/tag rows non-selecting. Unit tests for the selector (each list + no-mutation identity) + the lift wiring. **Critical: T-FILT-NOMUT + T-FILT-COUNT prove storage is untouched.** SHIPPED suites stay green.
- **FP2 — Date predicates polish + empty state + docs + cross-vendor**: confirm/finalize the `today`/`tomorrow` bucket approximation (Q-T); board-level honest empty state + suppress per-column "drop here" hint under filter; local STR additions; RTL tests (click each smart-list → board filters; empty state shows; All restores); full tasks + web suites + build; Codex cold-read of the new selector (or defer per ADR-0008 §S3); verify section; PLUGIN_MAP note at ship.

Each phase ends with `feature-build` STOP per Workflow V2.

> If `feature-review` prefers, FP1 may be split (lift vs. selector) — planner judges 2 phases right-sized because the selector and the lift are co-dependent for any visible behaviour (Q-PHASE).

## F.5 Out of scope (extension)

- Custom-list / tag membership filtering (Q1 defer — no membership model).
- A real Summary dashboard/KPI view (Q2 — treat-as-all; overlaps Statistics #20).
- Persisting the active-list selection across reload (Q3 — session-only).
- Any `TaskCard` schema change / real ISO due-date field (B3 rejected).
- Any reducer mutation change (`moveCard`/`toggleComplete`/`addCard` untouched).
- Any `plugin-web-storage` registry, `plugin-web-tokens`, `packages/core`, host-shell, other-plugin, SHIPPED-archive, ADR, or `dev`-branch edit.
- Header "Filters"/"More" buttons (T-06/T-07 — separate).

## REL-05 — rejected writes retain editable drafts

The shared `usePref` setter reports committed success. Tasks publishes list/tag metadata only after its scoped autosave succeeds, and closes the composer or metadata dialog only after a committed save. Detail editing retains the current form across failure and language changes. Failed deletion keeps the detail panel open. A visible failure panel beside each editor offers an explicit JSON export of its latest form values; retry uses the current form, not an older queued snapshot.

Every write and draft export uses the module/editor's captured account scope. The host still unmounts account-specific UI on identity changes; retained callbacks independently reject old-account retry/export. Drafts are deliberately in memory while the editor stays open; the explicit download is the recovery artifact if the user needs to close the page. This does not claim that unsaved drafts survive an unannounced page/process exit.

Non-editor actions retain their failed proposed state with retry/export. List/tag deletion first commits dependent task references, then removes metadata: a canonical task write failure cannot leave dangling metadata references. A later metadata failure keeps the old metadata and reports a retryable failed removal; these two keys are not an atomic transaction.
