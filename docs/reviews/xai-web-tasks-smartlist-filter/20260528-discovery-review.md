# Discovery Review — xai-web-tasks-smartlist-filter

**Date:** 2026-05-28
**Author:** feature-plan (Claude Opus claude-opus-4-8)
**Feature brief:** `docs/reviews/xai-web-tasks-smartlist-filter/20260528-feature-brief.md`
**Carve-out:** `docs/reviews/_p0-carve-outs/20260528-tasks-smartlist-filter.md` (ADR-0010 §D4, commit `eacf1e5`)
**Owning package:** `@repo/plugin-web-tasks` (`packages/xai-web-tasks/`) — SHIPPED row #6, Stable.

> Decision detail lives here, NOT in `design.md` (design.md carries only the decision snapshot per SOP §1.5).

---

## 0. Solution-scan classification

| Question | Answer |
|---|---|
| Feature class | **Business-orchestration** (lift state + pure view selector inside an existing module). NOT a standard reusable-library problem; NOT a project-core capability (no macOS/Tauri/multi-window). |
| Web research needed? | **No external research required.** This is purely internal view logic over an already-SHIPPED data shape. No new dependency, no library selection, no API/CSP decision. (Per SOP §1.5, technology-selection research is skipped when the feature is internal business logic with no external dependency decisions.) |
| Candidate options | Internal design axes only (§2). No 3rd-party candidates to compare. |

---

## 1. Recon — verified against ACTUAL source (not assumed)

Every claim below was read from source on 2026-05-28.

### 1.1 The no-op confirmed

- `TasksSidebar.tsx:56` — `const [activeList, setActiveList] = useState<string>("all");` (component-local).
- `TasksSidebar.tsx:66-67` — smart-list row `data-active={activeList === item.id}` + `onClick={() => setActiveList(item.id)}`. Highlight only.
- `TasksSidebar.tsx:87-91` — custom-list rows ALSO bind `data-active`/`onClick` to the same `activeList` (so custom-list + smart-list share one selection variable today).
- `TasksSidebar.tsx:111` — tag rows have NO click handler (pure decorative).
- `TasksModule.tsx` — renders `<TaskssSidebar lang={lang} />` (no `activeList` prop) and maps `taskCols.map((col) => <TaskColumn …/>)` with **no filter**. `activeList` is never referenced. **Confirmed cosmetic no-op.**
- `TasksSidebar.tsx:39` — `type SmartListId = "all" | "today" | "tomorrow" | "next7" | "inbox" | "summary";` — closed set, matches the brief.

### 1.2 The card date shape — THE LOAD-BEARING DISCOVERY FINDING

`TaskCard` (`types.ts:38-61`) date fields:
- `date?: string` — **display string with NO YEAR**, e.g. `"7/31"`, `"Jun 14"`, `"9/10"`.
- `dateZh?: string` — display string, e.g. `"6 月 14 日"`.
- `dateLabel?: TaskTitleBundle` — bilingual *label* text, e.g. `{ en: "Next Mon", zh: "下周一" }`.
- There is **no ISO date, no timestamp, no Date object** anywhere on a card.

Seed reality (`internal/seed/tasksMock.ts`) — the data the board actually shows:
- `overdue` (10 cards): all have `date` like `"7/31"`, `"9/10"`, `"10/24"` + `inbox: true`. These are **arbitrary holiday/demo dates**, NOT computed-from-today.
- `next7` (2 cards `t11`/`t12`): have NO `date` at all — only `sub` text ("Next Mon") and `dateLabel` ("Next Wed"). **Unparseable.**
- `later` (13 cards): have `date` like `"Jun 14"`, `"Sep 7"`, `"Oct 31"` — holiday dates, again arbitrary.
- `nodate` (1 active `t26` + 6 completed `c1..c6`): no date; `t26` + all 6 completed have `inbox: true`.

**Consequence:** A robust "is this card's due date == today / tomorrow / within 7 days" predicate **cannot** be computed from the stored card shape. `card.date` has no year, mixes two formats (`M/D` vs `Mon D`), and the most semantically-relevant column (`next7`) has no `date` field at all. Parsing those strings into real dates would be (a) lossy/ambiguous, (b) fragile across the EN/ZH split, and (c) still wrong for `next7` cards. Any attempt to do so risks needing a schema change to `xai_task_cols` — which is **explicitly forbidden** by the carve-out.

### 1.3 The bucket axis IS the date axis the board already trusts

`dateForCol.ts:25-56` + `tasksReducer.moveCard` (`tasksReducer.ts:49-76`) define the board's date semantics by **bucket membership**, not by parsing `card.date`:
- `overdue` ⇒ "today − 3 days" (past due).
- `next7` ⇒ "today + 2 days" (within the next 7 days).
- `later` ⇒ "today + 30 days" (beyond a week).
- `nodate` ⇒ no date.

When a user drags a card to a bucket, `moveCard` REWRITES the card's `date`/`dateZh` to match that bucket (or strips them for `nodate`). So **the bucket a card lives in is the single source of truth for its temporal class** — it is deterministic, already persisted, and already what the UI visually communicates. `card.date` is merely a derived display string of that bucket decision.

### 1.4 Reducer / persistence surface (no-mutation anchors)

- `tasksReducer.ts` exports exactly THREE actions: `moveCard` (L30), `toggleComplete` (L108), `addCard` (L143). All three are pure and write through `setRawCols`. **None of them may change in this feature.**
- `TasksModule.tsx:28` — `const [rawCols, setRawCols] = usePref("xai_task_cols");` + boundary cast at L56/L104/L118. This write path stays untouched; filtering reads `taskCols` and never calls `setRawCols`.
- Registry: `xai_task_cols` at `plugin-web-storage/src/internal/registry.ts:197-204` (json codec, owner `xai-web-tasks`, default `{}`). NO edit.

### 1.5 Existing pref key relevant to the persistence planner's-call

Audit doc §3.3 (`20260527-button-action-inventory.md:783-785`) flags `xai_pref_smart_lists` as "written by SmartListsPane; not consumed by Tasks sidebar." Verified at `registry.ts:523-528`: key `xai_pref_smart_lists`, codec `json`, default `{}` as `Record<string, string>`, **owner `xai-web-settings-rest`**. This is a *settings-pane visibility/config* map owned by a different module — it does NOT represent a single active-list selection and reusing/widening it would cross a module ownership boundary. It is therefore NOT a fit for persisting `activeList` (see Q3).

### 1.6 Module gating (build-time relevance, from card-create review Rec-E1)

The host wraps the Tasks slot in `withDisabledFallback(tasksWebModuleRegistration, "tasks")` (shellRegistrations.tsx). When `xai_pref_features_tasks` is OFF the route renders `<DisabledFeatureFallback>`. The sidebar/filter only mounts when Tasks is ENABLED. This does NOT affect the plan (filter lives inside `TasksModule`, which only mounts when ON) but the EP/manual sweep should note "Tasks must be enabled in Settings" so a tester doesn't file a false "filter does nothing" bug.

---

## 2. Design options + decision

### Axis A — Where does `activeList` live?

| Option | Description | Verdict |
|---|---|---|
| **A1 (CHOSEN)** | Lift `activeList` into `TasksModule` via `useState`; pass `activeList` + `onSelectList` down to `TasksSidebar` as props (controlled component). | **CHOSEN.** Minimal, mirrors the card-create Iteration-2 state-lift precedent (composer state lifted into `TasksModule`, no channel). The state owner is also the board owner, so the filter can be applied where the columns render. |
| A2 | Emit a `web:tasks:list-changed` event from sidebar; `TasksModule` subscribes. | **REJECTED.** Violates the "no new event channel" constraint (would edit `packages/core/src/types/events.ts`). Over-engineered for parent↔child within one module. |
| A3 | Keep `activeList` in sidebar; pass a render-callback up. | **REJECTED.** Inverts data flow awkwardly; the board (parent) needs the value, so the value belongs in the parent. |

### Axis B — How is the filter computed?

| Option | Description | Verdict |
|---|---|---|
| **B1 (CHOSEN) — bucket-derived predicate** | `filterCardsByList` maps each smart-list to a set of buckets and/or a card-field predicate, deriving the temporal class from **bucket membership** (the board's existing, persisted, deterministic date semantics — §1.3), not from parsing `card.date`. | **CHOSEN.** Faithful to how the board already encodes time; deterministic; needs zero schema change; honest about what the data supports. |
| B2 — parse `card.date` into real dates | Parse `"7/31"` / `"Jun 14"` / `dateZh` into `Date`, compare to `now`. | **REJECTED.** §1.2: no year, two formats, EN/ZH split, and `next7` cards have NO `date` to parse. Lossy, fragile, and would push toward a forbidden schema change. |
| B3 — add an ISO `due` field to cards | Extend `TaskCard` + migrate `xai_task_cols`. | **REJECTED — out of scope.** Mutates the stored shape; forbidden by the carve-out. Pre-scoped as a future increment if real due-dates are ever needed. |

### Axis C — Filter granularity (which cards a list shows)

`filterCardsByList(cols, activeList, now?)` returns a *view shape* — the same `TaskCol[]` structure with each column's `tasks` (and `completed`) arrays filtered down. Columns are always all 4 (so headers/empty-states render); only their card arrays shrink. This keeps `TaskColumn`/`TaskCard`/`CompletedGroup` signatures unchanged (they already accept a `TaskCol`). **Pure function, no writes.**

### Per-list predicate table (CHOSEN — B1)

| Smart-list | Predicate (bucket-derived) | Rationale |
|---|---|---|
| **all** | identity — return `cols` unchanged. | Current behaviour; the only list that shows everything. |
| **inbox** | keep cards where `card.inbox === true` (across ALL buckets, including `nodate.completed`). | Field already exists (`TaskCard.inbox`); brief mandates this exact semantics. Seed yields 10 (overdue) + 1 active + 6 completed (nodate) = 17 inbox cards. |
| **next7** | keep cards in the `next7` bucket. | The board's `next7` bucket IS "within the next 7 days" (`dateForCol` = today+2d). Bucket membership is the honest, deterministic basis. Seed → 2 cards (`t11`,`t12`). |
| **today** | keep cards in the `overdue` bucket (due today-or-earlier, i.e. needs attention now). See §3 note. | The stored shape has no per-day resolution finer than the 4 buckets (§1.2). "Today" maps to the most-urgent dated bucket the board models. Documented limitation — see §3 + Q-T. |
| **tomorrow** | keep cards in the `next7` bucket (the nearest *future* dated bucket). See §3 note. | Same resolution limit: there is no "tomorrow" bucket. "Tomorrow" maps to the nearest upcoming dated bucket (`next7`). Documented limitation — see §3 + Q-T. |
| **summary** | overview view: show ALL buckets (like `all`) but this is the planner's-call item — see §5 Q2. Default resolution: **treat as `all` (no-op filter) in v1**, OR defer with a friendly "coming soon" panel. Planner recommends **treat-as-all** (cheapest, honest, no dead row). | See Q2. |

> **IMPORTANT honesty note (Q-T):** Because the stored card shape has only 4 temporal buckets and no real per-day due dates (§1.2), `today` and `tomorrow` cannot be a precise calendar-day filter. The chosen mapping (`today→overdue`, `tomorrow→next7`) is a *defensible bucket approximation* of those labels, not a true date match. This is called out explicitly for `feature-review` to confirm or override (it is the single most judgment-dependent decision in the plan). The alternative — making `today`/`tomorrow` return empty until a real `due` field exists — was rejected as a worse UX (a permanently-empty list looks broken). A second alternative is folded into Q-T for the reviewer.

### Axis D — Empty state

When a filtered column has zero `tasks` (and zero `completed`), `TaskColumn` already renders its `isEmpty` placeholder ("Drop tasks here" / "拖任务到这里", TaskColumn.tsx:97-102). For a filtered view this is misleading. **CHOSEN — D1:** when a filter is active (activeList ≠ "all") AND the whole board yields zero cards, render a board-level honest empty state ("Nothing in {list}" / "{list} 里没有任务") sourced from a new local STR entry. Per-column empty placeholders may stay as-is (they already read fine when only some columns are empty), OR be suppressed under an active filter — planner leans **board-level empty state + suppress the per-column "drop here" hint while filtering** (a "drop here" prompt is wrong when the user is viewing a read-only filter). Reviewer may simplify to board-level only.

---

## 3. Per-list predicate — precise definitions (for api.md)

`filterCardsByList(cols: TaskCol[], list: SmartListId, now?: Date): TaskCol[]` — PURE. Returns a new array; never mutates `cols`; never writes storage. Untouched columns may be returned by reference where the predicate keeps all their cards (referential-equality discipline mirroring `moveCard`).

```
all       → cols                                   (identity)
inbox     → each col: tasks.filter(t => t.inbox === true),
                       completed?.filter(t => t.inbox === true)
next7     → keep col "next7" cards; other cols → tasks: []
today     → keep col "overdue" cards; other cols → tasks: []   (bucket approximation — Q-T)
tomorrow  → keep col "next7" cards;  other cols → tasks: []     (bucket approximation — Q-T)
summary   → cols (identity, v1)                    (Q2 — treat-as-all)
```

- `count` on each returned column is recomputed to match the filtered `tasks.length` so the column header count is honest under the filter (this is a *derived view value*, NOT a write to storage — the persisted `count` in `xai_task_cols` is untouched).
- `completed` arrays are filtered for `inbox` (only `nodate` has a `completed` group); for bucket-based lists, `completed` is emptied unless the bucket itself is kept.
- `now` is threaded for symmetry/testability even though the v1 predicates are bucket-based (no clock dependency yet) — keeps the signature future-proof if a real `due` field ever lands, and matches the `dateForCol(bucketId, now?)` discipline.

---

## 4. No-mutation guarantee (the headline constraint)

The filter is a **read-only projection**:
1. `filterCardsByList` is a pure function: input `TaskCol[]` → output `TaskCol[]`. It allocates new arrays; it never calls `setRawCols`, never touches `localStorage`, never invokes `moveCard`/`toggleComplete`/`addCard`.
2. `TasksModule` computes the filtered view via `useMemo` from `taskCols` + `activeList`, and renders the *filtered* shape — but every mutation handler (`handleDrop`, `handleToggle`, `handleComposerSave`) continues to operate on the **unfiltered** `taskCols` and writes through the SHIPPED `setRawCols` boundary cast. Drag/create/complete therefore see the full board, never the filtered subset.
3. Test T-FILT-NOMUT (see test.md §F) asserts: after applying every smart-list filter in turn, `localStorage.getItem("xai_task_cols")` is byte-identical to before (or absent if it started absent) — the filter writes nothing.

This is the property that makes the whole feature safe: **the selector reads; the reducer writes; they never cross.**

---

## 5. Planner's-call resolutions

### Q1 — Custom lists + tag rows: filter too, or defer? → **DEFER** (justified)

- **Decision: DEFER.** Custom-list rows (`CUSTOM_LISTS` in TasksSidebar.tsx:23-28: research/personal/career/reminders) and tag rows (`TAGS`:31-37) are **hard-coded decorative fixtures** with NO membership model on `TaskCard`. A card has a single optional `tag?: TaskTagId` but the sidebar's custom-lists are a *different* taxonomy (Research Papers / Career Planning / Reminders) with no field linking a card to a custom list at all. Filtering by them would require inventing a list-membership model and a tag-assignment UI — far beyond a view-only carve-out.
- **Sub-decision (cleanup):** custom-list rows currently share `activeList` with smart-lists (TasksSidebar.tsx:87). After the lift, clicking a custom-list row must NOT silently produce an unfiltered-or-broken board. Planner recommends: custom-list + tag rows become **explicitly non-selecting** in this iteration (they keep their decorative look but do not drive the board filter; only the 6 smart-list ids feed `filterCardsByList`). This avoids a half-wired "click research → board does nothing visible / board clears unexpectedly" bug. Reviewer to confirm whether to (a) make them inert, or (b) leave them highlighting-only but routing to `all`.
- Pre-scoped as a future increment ("tasks-list-membership") if real custom-list/tag filtering is ever wanted.

### Q2 — Summary smart-list: overview/count view or defer? → **TREAT-AS-ALL in v1** (justified)

- **Decision: treat `summary` as a no-op (identity) filter in v1** — clicking Summary shows the full board, same as All.
- Rationale: a real "Summary" (counts dashboard / KPI overview) is a genuine sub-feature (its own layout, aggregation, charts) that overlaps the SHIPPED Statistics module (#20) and would balloon this carve-out. Returning the full board is honest (Summary = "everything at a glance") and leaves no dead/broken row. The alternative — a "coming soon" panel — adds a decorative placeholder the audit would later flag as another no-op. Treat-as-all is the cleaner v1.
- Reviewer may instead choose **defer-with-disabled-look** (render Summary row but non-selecting) — flagged as Q2 for override.

### Q3 — Persist selection across reload vs session-only? → **SESSION-ONLY, no new registry key** (justified)

- **Decision: session-only.** `activeList` lives in `TasksModule` `useState` (default `"all"`), resets on reload. NO registry edit.
- Rationale: (a) the carve-out's default is session-only "unless trivially justified"; (b) the only existing candidate key `xai_pref_smart_lists` is owned by `xai-web-settings-rest` with a `Record<string,string>` shape that does not represent a single active-list selection (§1.5) — reusing it crosses a module ownership boundary and misuses its schema; (c) adding a brand-new `xai_*` key would touch `plugin-web-storage` registry, which the carve-out lists under "NOT modified"; (d) a transient view filter resetting to "All" on reload is a reasonable, common UX (matches the board-views/board-workspaces filter state, which is also render-only and resets on board switch per their SHIPPED design).
- Reviewer may override to "persist via a new `xai_pref_tasks_active_list` key" — flagged as Q3; if chosen it is a one-line additive registry entry, but it then expands the file scope beyond the carve-out and should be re-authorized.

---

## 6. Risks + open questions (for feature-review)

| ID | Risk | Mitigation |
|---|---|---|
| R1 | Filtering accidentally mutates `xai_task_cols` | `filterCardsByList` is pure; mutation handlers operate on unfiltered `taskCols`; T-FILT-NOMUT asserts byte-identical storage after all filters (§4). |
| R2 | `today`/`tomorrow` bucket approximation surprises a reviewer/user | Documented as the load-bearing judgment call (§2 Q-T); no precise per-day data exists (§1.2); empty-list alternative rejected as worse UX. Reviewer confirms or overrides. |
| R3 | Custom-list/tag rows left in a half-wired state after the lift | Q1 sub-decision: make them explicitly non-selecting (inert) this iteration; only 6 smart-list ids drive the filter. |
| R4 | Filtered empty column shows misleading "Drop tasks here" | D1: board-level honest empty state + suppress per-column "drop here" hint while a filter is active. |
| R5 | Recomputed `count` confused with persisted `count` | The view `count` is derived in the selector for display honesty only; storage `count` untouched (§3). T-FILT-COUNT asserts the storage value is unchanged. |
| R6 | Regression to SHIPPED drag/create/complete | All three reducer actions and the persistence boundary are untouched; existing T-RD/T-ADD/T-PER/T-MOD/T-CR suites must stay green (no edits to those code paths). |
| R7 | Cross-vendor smoke not run in-session | DEFER per ADR-0008 §S3; record (i)/(ii)/(iii) checklist in verify section at deferral time. |

### Open questions (carry planner picks; reviewer may override)

- **Q-T (date approximation):** Confirm `today→overdue` + `tomorrow→next7` bucket approximation (planner pick) vs. an alternative (e.g. `today`→`overdue`+`next7` union, or empty-until-real-due-field). **Planner recommends the documented bucket approximation.**
- **Q1 (custom/tag rows):** Confirm DEFER + make rows inert (planner pick) vs. route-to-all.
- **Q2 (summary):** Confirm treat-as-all (planner pick) vs. defer-with-disabled-look.
- **Q3 (persistence):** Confirm session-only / no new key (planner pick) vs. add `xai_pref_tasks_active_list` (would re-expand scope).
- **Q-PHASE:** Confirm 2-phase split (P1 lift + selector + All/Inbox/Summary-as-all; P2 date predicates + empty state + tests + docs) — see design §E.4.

---

## 7. Recommendation

Proceed with **A1 (state lift) + B1 (bucket-derived pure selector) + session-only (Q3) + DEFER custom/tag (Q1) + Summary-as-all (Q2)**, implemented as a 2-phase build inside `packages/xai-web-tasks/src/` with zero edits to reducer mutations, stored data, registry, core/events, tokens, host-shell, other plugins, SHIPPED archive, ADR, or `dev`. The single decision needing reviewer sign-off is **Q-T** (the today/tomorrow bucket approximation), which is unavoidable given the SHIPPED card shape has no real per-day due dates.
