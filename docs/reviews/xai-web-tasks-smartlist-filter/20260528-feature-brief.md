# Feature Brief — xai-web-tasks-smartlist-filter

**Date:** 2026-05-28
**Workflow:** FEATURE_DEV (increment / extension of SHIPPED row #6 `@repo/plugin-web-tasks`)
**Authority:** ADR-0010 §D4 P0 carve-out — commit `eacf1e5`; carve-out doc `docs/reviews/_p0-carve-outs/20260528-tasks-smartlist-filter.md`.
**Audit trigger:** `docs/reviews/_web-noop-audit/20260527-button-action-inventory.md` §2.2 T-01 (sidebar smart-list rows highlight but never filter) + 2026-05-28 usability recheck.
**Operator decision:** item 3 local cluster #3 (T-10 done ✅ + dashboard-real-data ✅ already SHIPPED).

---

## 1. Three-faces decision

This is a **Web Console module extension**, not a host/core/desktop-plugin change. Per ADR-0006/ADR-0007 the owning unit is `@repo/plugin-web-tasks` (directory `packages/xai-web-tasks/`). All new code lands inside that package's `src/`. Host shell (`apps/web/`), `@repo/core`, and `packages/plugin-web-storage` are **read-only** in this slice.

## 2. Target plugin status

- Row #6 `@repo/plugin-web-tasks` = **Stable** (SHIPPED 2026-05-23 v1; extended 2026-05-28 card-create, also SHIPPED). Status STAYS Stable. Ship appends a feature note to the PLUGIN_MAP row description — NOT a status change.
- This is the **third iteration** on the package (v1 board → card-create → smart-list filter).

## 3. Motivation

The Tasks left sidebar renders 6 smart-list rows (All / Today / Tomorrow / Next 7 Days / Inbox / Summary). Clicking a row only flips a `data-active` highlight: `activeList` is trapped in `TasksSidebar.tsx:56` component-local `useState("all")`, is never lifted to `TasksModule`, and is never used to filter the 4-bucket board. `TasksModule.tsx` does not reference `activeList` at all. **The entire left sidebar is a cosmetic no-op.**

## 4. Target outcome

- Clicking a smart-list row **really filters** the board cards.
- No-match shows an **honest empty state** ("Nothing in Today" etc.).
- **All** restores the full board.
- Filtering is a **pure VIEW concept** — it MUST NOT mutate the stored `xai_task_cols`, and MUST NOT touch the `tasksReducer` create/move/toggle logic. T-10 `done` persistence + card-create `addCard` + T-12 drag must all stay intact.

## 5. Scope

### In scope
- Lift `activeList` from `TasksSidebar` to `TasksModule` (state owner) via props + callback.
- Add a pure `filterCardsByList(cols, activeList, now?)` selector (view-only — derives a filtered render shape, never writes).
- Apply the filter to the displayed cards:
  - **All** — no filter (current behaviour).
  - **Today / Tomorrow / Next 7 Days** — date-derived predicates (planner defines the basis in discovery — see §7).
  - **Inbox** — `TaskCard.inbox === true`.
  - **Summary** — planner's call (overview/count vs. defer — see §7).
- Honest empty state per filtered column / board.
- Active highlight stays in sync after the lift.

### Out of scope
- Header "Filters" / "More" no-op buttons (T-06/T-07).
- Custom list / tag CRUD or membership filtering (planner's call — default defer).
- Cross-device sync.
- Any change to stored data, reducer mutations, `packages/core/src/types/events.ts`, `plugin-web-tokens`, `plugin-web-storage` registry, other plugins, host-shell registration, SHIPPED archive / ADR / `dev` branch.

## 6. Constraints (hard)

- **Branch**: `web` only — do NOT touch `dev`.
- **Filtering is a VIEW concept**: lift `activeList` + add pure selector; absolutely no `tasksReducer` create/move/toggle change; absolutely no mutation of stored `xai_task_cols`.
- **No new event channel**: props lift only (Calendar Q5-A / card-create Iteration-2 precedent). NO `packages/core/src/types/events.ts` edit.
- **Bilingual**: empty-state strings via local STR (`internal/strings.ts`), NOT a `plugin-web-tokens` edit.
- **Registry**: default NO new key (session-only selection) unless persistence is trivially justified.
- Card date semantics: the board's 4 buckets are `overdue / next7 / later / nodate`; smart-lists are a different axis (Today/Tomorrow/Next7/Inbox/Summary). Discovery must read `internal/dateForCol.ts` + `TaskCard.date` to define each predicate.

## 7. Planner's-call items (discovery decides + justifies)

1. **Custom lists + tag rows filter too, or defer?** Default: **defer** (no list/tag membership model exists in the stored shape).
2. **Summary smart-list** — overview/count view, or defer?
3. **Persist selection across reload (new pref key) vs session-only?** Default: **session-only** (no new key).

## 8. Acceptance anchor

Satisfied when: clicking a smart-list (e.g. Today) filters the board to only matching cards; an honest empty state appears when none match; "All" restores the full board; filtering never mutates `xai_task_cols` (drag/create/complete still work) — verified by automated tests + (deferred) cross-vendor smoke per ADR-0008 §S3.

## 9. Planner handoff

Drive: feature-plan → feature-review → feature-build → feature-verify → ship. This round = plan only. NO implementation code.
