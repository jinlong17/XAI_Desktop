# Feature Brief — xai-web-tasks-card-create

**Date:** 2026-05-28
**Source:** Operator instruction (verbatim brief) attached to `feature-plan` Task spawn
**Canonical name:** `xai-web-tasks-card-create`
**Owning package:** `@repo/plugin-web-tasks` (extension; package row already SHIPPED 2026-05-23, PLUGIN_MAP row #6)
**Carve-out authority:** `docs/reviews/_p0-carve-outs/20260528-tasks-card-create.md` (committed `09673f8`, dated 2026-05-28 — ADR-0010 §D4 P0 carve-out)

---

## 1. Motivation

Audit Top-10 #3 (`docs/reviews/_web-noop-audit/20260527-button-action-inventory.md` §2.2 row T-09) surfaced the Tasks column `+` add-card button as a no-op stub:

- `TaskColumn.tsx:68-74` renders an icon-only `+` button (`col.action === "add"`) with **no `onClick`** — repeated across the `next7` / `later` / `nodate` columns.
- The deeper finding: **the Tasks module has no UI path to create a task at all.** The only persistence write path is drag-drop reschedule (T-12 `setRawCols` via `moveCard`).
- Cards are seeded from a fixture (`src/internal/seed/tasksMock.ts`).

Unlike `xai-web-calendar-event-create` (which had zero store), Tasks already ships a real reducer (`src/internal/tasksReducer.ts`), validation (`validate.ts`), a date helper (`dateForCol.ts`), the `xai_task_cols` registry key, and a well-formed immutable `TaskCard` model. **This carve-out is therefore narrower: it adds the missing CREATE UI and one create reducer action, then wires the existing persistence path.**

## 2. Target outcome

Users can, on `/app/tasks`, click a column `+` → open a minimal `TaskComposer` dialog → type a title, optionally pick a tag and target bucket → save → the new card appears at the top of the correct column (including a previously empty column) → and the card survives a page reload (`localStorage` `xai_task_cols` round-trip).

## 3. Scope (Realistic v1, Tasks-only)

### Must (v1.0)

- **Create**: wire column `+` (`col.action === "add"`) onClick → open `TaskComposer` native `<dialog>` with title (required) + tag picker (5 presets, optional) + target bucket (defaults to clicked column; user may change) + optional date label.
- **Reducer create action**: add a pure `addCard(prev, draft, targetBucket, now?)` to `tasksReducer.ts` (does NOT exist today) that prepends a new card to the target bucket with date fields derived via `dateForCol`.
- **Stable id**: add `internal/ids.ts` → `createTaskId()` mirroring calendar `eventStore/ids.ts` (`crypto.randomUUID()` + jsdom fallback).
- **Persistence**: reuse existing `xai_task_cols` key (no registry edit). Created card flows through the established `setRawCols(next as unknown as ...)` boundary-cast path.
- **Empty-bucket affordance**: a created task lands in the correct bucket even if it was previously empty.
- **Local STR table** (en + zh) for composer labels — NOT `plugin-web-tokens`.
- **a11y**: native `<dialog>` per `EventComposer` / `BoardDeleteConfirmDialog` / `SignOutConfirmDialog` precedent — `role`/`aria-modal`, autofocus title, ESC / backdrop / Cancel close.

### Planner's call — DEFERRED (see discovery review §3 D5)

- **Edit existing card** + **Delete card**: deferred to a follow-up increment. Rationale: `TaskCard` already binds `onClick`/Enter/Space to toggle-complete, so an edit affordance would collide and need a separate trigger + a `updateCard`/`deleteCard` reducer pair + a confirm dialog. That meaningfully increases phase count and risk — fails the "only if low-cost" bar. v1 = create-only.

### Out of scope (explicitly deferred — per carve-out §2)

- T-10 completion persistence (in-memory only; strongest next-bugfix candidate; touches a different code path — `completedIds` in `TasksModule`).
- T-06 Filters / T-07 More header no-ops (later HIDE/DISABLE batch).
- Sidebar smart-list filtering (T-01..T-05).
- Matrix coupling (Audit Top-10 #4 — depends on this landing).
- Cross-device sync / IndexedDB / reminders / recurring / subtasks / drag-create.
- Any change to `packages/plugin-web-storage` (no new key; reuse `xai_task_cols`).
- Wiring StatTasks dashboard widget to real task counts.

### Specifically NOT triggered

- ADR-0011 (full P0 productization) — single-feature exception, not a re-prioritization.
- Reversal of P1 desktop priority.
- Reopening `xai-web-console.md` / `xai-web-console-gap-closure.md` SHIPPED archives.
- New backend / cloud dependency or new npm dependency.
- `packages/core/src/types/events.ts` edit (React state lift, no new channel — per Calendar Q5-A).

## 4. Constraints (hard inputs)

- **Branch**: `web` (do NOT touch `dev`).
- **Authority**: ADR-0010 §D4 P0 carve-out (commit `09673f8`).
- **Reuse precedents**: `xai-web-calendar/src/EventComposer.tsx` (closest — composer dialog), `plugin-web-board-workspaces/src/BoardDeleteConfirmDialog.tsx` (mode prop + a11y), `xai-web-shell/src/SignOutConfirmDialog.tsx` (base template).
- **Bilingual title**: single title input fills both `title.en` + `title.zh` with the same string (planner decision — see discovery §3 D3); field label follows active UI lang.
- **Registry key**: reuse `xai_task_cols` (registry.ts:197-204) — confirmed present.
- **Cross-vendor**: manual smoke may be deferred per ADR-0008 §S3.

## 5. Acceptance anchor

Satisfied when a user can click a column `+`, type a title, pick a tag/bucket, save, see the card appear at the top of the correct column, and have it survive a reload — verified by automated tests + (deferred) cross-vendor manual smoke.

## 6. Three-faces decision

- This is a **Web Module** (P0 surface), package `@repo/plugin-web-tasks` (PLUGIN_MAP row #6, `Stable`).
- No host (`apps/desktop/`) change. No `packages/core/` change. No new typed-event channel.
- All new logic stays inside `packages/xai-web-tasks/src/` (business slice) per ADR-0007 one-module-one-package.

## 7. Plugin-map status check

Deps consumed (`@repo/core`, `@repo/plugin-web-tokens`, `@repo/plugin-web-storage`, `@repo/xai-web-shell`) are all `Stable`. No mocking needed. Row #6 stays `Stable`; ship appends a feature note (NOT a status change).

## 8. References

- P0 carve-out: `docs/reviews/_p0-carve-outs/20260528-tasks-card-create.md`
- Discovery review: `docs/reviews/xai-web-tasks-card-create/20260528-discovery-review.md`
- Audit trigger: `docs/reviews/_web-noop-audit/20260527-button-action-inventory.md` Top-10 #3 (T-09)
- Sibling precedent: `docs/workflow/roadmap/xai-web-calendar-event-create.md` + `packages/xai-web-calendar/src/EventComposer.tsx`
- Authority: `docs/adr/0010-p1-desktop-resume-plan.md` §D4
- Original SHIPPED Tasks plan: `packages/xai-web-tasks/docs/{design,api,test,dev_log}.md`
