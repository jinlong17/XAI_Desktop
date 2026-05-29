# P0 Carve-Out — xai-web-tasks-smartlist-filter

**Date:** 2026-05-28
**Authority:** ADR-0010 §D4 — new feature plans require an explicit P0 carve-out commit.
**Triggering evidence:** Audit §2.2 T-01..T-05 + usability recheck — Tasks sidebar smart-lists (All/Today/Tomorrow/Next7/Inbox/Summary) highlight on click but never filter the board.
**Operator decision:** item 3 local cluster #3 per session directive 2026-05-28.

---

## 1. Background

`TasksSidebar.tsx:56` holds `activeList` as **component-local** `useState("all")`; clicking a smart-list row only flips `data-active` highlight (`:67 onClick={() => setActiveList(item.id)}`). The value is **never lifted to `TasksModule`** and **never filters** the 4 bucket columns — `TasksModule.tsx` does not reference `activeList` at all. So the entire left sidebar is a cosmetic no-op.

The board's 4 buckets are `overdue / next7 / later / nodate`; the smart-lists are a DIFFERENT axis (All/Today/Tomorrow/Next7/Inbox/Summary). Filtering requires date-derived predicates on cards, not a 1:1 bucket map.

## 2. Scope

**`xai-web-tasks-smartlist-filter`** — Realistic v1

### In scope
- Lift `activeList` from `TasksSidebar` to `TasksModule` (state owner) via props/callback; persist selection to a new-or-reused pref **only if cheap** (planner's call — default: in-memory session state, NO new registry key unless trivially justified).
- Apply a real filter to the displayed cards based on `activeList`:
  - **All** — no filter (current behaviour).
  - **Today / Tomorrow / Next 7 Days** — date-derived predicates on card due date (planner defines the date field + basis; reuse `internal/dateForCol.ts` if it already computes this).
  - **Inbox** — cards with `inbox: true` (the `TaskCard.inbox` field already exists).
  - **Summary** — planner's call (may be a count/overview view OR deferred — justify).
- Honest empty state when a filter yields no cards ("Nothing in Today" etc.).
- Active filter visibly reflected (the existing `data-active` highlight already works; ensure it stays in sync after lift).

### Planner's call
- Custom lists (Research Papers/Personal Life/Career Planning/Reminders — `TasksSidebar` `cl.id` rows) + tag rows: filter too, or defer? Default: **defer** custom-lists/tags to keep v1 tight (they need a list/tag membership model that may not exist). Justify in discovery.
- Whether selection persists across reload (pref key) vs session-only.

### Out of scope
- Header "Filters"/"More" no-op buttons (T-06/T-07) — separate later.
- Custom list / tag CRUD.
- Cross-device sync.

### NOT triggered
- New external dep / API / CSP. `packages/core/src/types/events.ts` edit (state lift via props, no event channel). `plugin-web-tokens` (local STR). Other plugins. SHIPPED archive / ADR / `dev`.

## 3. Impact

### Modified
- `packages/xai-web-tasks/src/TasksSidebar.tsx` (lift state out), `TasksModule.tsx` (own activeList + apply filter), possibly `internal/` (add a `filterCardsByList` pure selector), `internal/strings.ts` (empty-state keys), `styles.css` if needed.
- `packages/xai-web-tasks/docs/` extend.

### Created
- `docs/workflow/roadmap/xai-web-tasks-smartlist-filter.md` (by feature-plan).

### NOT modified
- `tasksReducer` create/move/toggle logic (filtering is a VIEW concern, not a data mutation — must NOT alter stored `xai_task_cols`). T-10 `done` + #3 `addCard` + T-12 drag stay intact.
- registry (default no new key), core/events, tokens, other plugins, archives, ADR, `dev`.

## 4. Workflow path

carve-out commit → feature-plan → feature-review → feature-build → feature-verify → ship. Cross-vendor smoke DEFERRED per ADR-0008 §S3.

## 5. Acceptance anchor

Satisfied when: clicking a smart-list (e.g. Today) filters the board to only matching cards, shows an honest empty state when none match, "All" restores the full board, and filtering is a pure view concern that never mutates `xai_task_cols` (drag/create/complete still work) — verified by automated tests + (deferred) cross-vendor smoke.
