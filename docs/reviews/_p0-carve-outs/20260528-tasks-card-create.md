# P0 Carve-Out — xai-web-tasks-card-create

**Date:** 2026-05-28
**Authority:** ADR-0010 Accepted 2026-05-26 §D4 — "new feature plans require an explicit P0 carve-out commit citing this ADR's D1"
**Triggering evidence:** [docs/reviews/_web-noop-audit/20260527-button-action-inventory.md](../_web-noop-audit/20260527-button-action-inventory.md) Top-10 #3 (Tasks column `+` add-card) + per-route §2.2 row T-09
**Operator decision:** Real feature (Realistic v1 scope, Tasks-only) per session directive 2026-05-28 ("全都要完成" — complete all remaining Top-10). Mirrors the `xai-web-calendar-event-create` carve-out precedent (2026-05-27).

---

## 1. Background

Audit Top-10 #3 surfaced that the Tasks column `+` button (`col.action === "add"`, `TaskColumn.tsx:68-74`) renders an icon-only add-card affordance with **no `onClick`** — repeated across all 4 bucket columns. The deeper finding: **the Tasks module has no UI path to create a task at all.**

Current Tasks v1 state (per audit §2.2 + recon 2026-05-28):

- `xai_task_cols` is the only persistence key; the **only** write path is drag-drop reschedule (T-12 `setRawCols`).
- Cards are seeded from a fixture (`src/internal/seed/`).
- A real reducer already exists: `src/internal/tasksReducer.ts` + `src/internal/validate.ts` + `src/internal/dateForCol.ts`.
- `TaskCard` is a well-formed immutable model: `id`, bilingual `title {en, zh}`, optional `sub`, `tag` (study/work/personal/todo/other), `date`/`dateZh`/`dateLabel`, `inbox`.
- `BucketId` = `"overdue" | "next7" | "later" | "nodate"` (4 time buckets).
- Task completion toggle (T-10) is in-memory only — **not persisted** (separate concern, see Out of scope).

Unlike `xai-web-calendar-event-create` (which had zero store), Tasks already has the reducer + validation + registry key + typed model. **This carve-out is therefore narrower: it adds the missing CREATE UI and wires it to the existing reducer, rather than building a domain layer from scratch.**

## 2. Scope of this carve-out

This carve-out authorizes **new feature development** on the Web P0 surface (otherwise maintenance-only per ADR-0010 §D1) for the single feature:

**`xai-web-tasks-card-create`** — Realistic v1

### In scope
- **Task Create** (the audit ask): wire the column `+` (`col.action === "add"`) onClick → open a minimal `TaskComposer` dialog → on save, dispatch a create action through the existing `tasksReducer` → persist to `xai_task_cols`.
- **TaskComposer dialog**: title (required) + tag picker (5 existing `TaskTagId` presets, optional) + target bucket (defaults to the column the `+` was clicked in; user may change) + optional date label. Native `<dialog>` mirroring the SHIPPED `EventComposer` / `BoardDeleteConfirmDialog` / `CardDetailDialog` precedent (role, autofocus, ESC/backdrop/Cancel close, a11y).
- **Bilingual title handling**: `TaskCard.title` is a `{en, zh}` bundle. v1 design decision deferred to feature-plan — recommended default: single title input that fills both `en` and `zh` with the same string (user types once), with the field labelled in the active UI lang. (Planner may instead choose dual-field; flag in discovery.)
- **localStorage persistence**: reuse the existing `xai_task_cols` key (no new registry key needed — confirm in discovery). Created cards get a generated stable id (reuse the id scheme the reducer/seed already uses, or add a `createTaskId()` helper mirroring calendar `ids.ts`).
- **Empty-bucket affordance**: a created task lands in the correct bucket even if it was previously empty.
- **Local STR table** for composer labels (en + zh), in-package — NOT `plugin-web-tokens`.

### Planner's call (decide in feature-plan, may include if low-cost)
- **Edit existing card** (CRUD update): click a card → open composer pre-filled → save. The reducer likely already supports replace-on-move; an update action may be cheap. Include only if it does not balloon phases.
- **Delete card** (CRUD delete): if edit is in, delete is a natural sibling (with confirmation per BoardDeleteConfirmDialog precedent). Planner decides.

### Out of scope (explicitly deferred)
- **T-10 completion persistence** — task complete-toggle is in-memory only. This is a real adjacent BUGFIX but is NOT this carve-out's scope. **Flagged as the strongest next-bugfix candidate** after this lands. (Rationale for deferral: keep create-flow phases tight; completion persistence touches a different code path — the `completedIds` set in `TasksModule`.)
- **T-06 Filters header button / T-07 More header button** — separate no-op header controls; defer to a later HIDE/DISABLE bugfix batch.
- **Sidebar smart-list filtering** (T-01..T-05) — the smart lists (All/Today/Tomorrow/Next7/Inbox) never apply a filter to the board. Large separate concern; deferred.
- **Matrix coupling (Audit Top-10 #4)** — #4 Matrix Add depends on this landing, but is its own carve-out/decision afterward.
- **Cross-device sync** (deferred to xai-g2 / Supabase ADR-0011 conversation).
- **IndexedDB migration** (independent later decision per audit Option B framing).
- **Reminders / notifications / recurring tasks / subtasks / attachments / comments.**
- **Drag-drop create** (only `+`-button create in v1; existing drag-reschedule T-12 untouched).

### Specifically NOT triggered by this carve-out
- ADR-0011 (full P0 productization) — this is a **single-feature exception**, not a strategic re-prioritization.
- Reversal of P1 desktop priority — G1 native foundation continues unaffected.
- Reopening of `xai-web-console.md` or `xai-web-console-gap-closure.md` SHIPPED archives.
- New backend / cloud dependency (Supabase, Firebase, etc.).
- New npm dependency.

## 3. Impact on shipped artifacts

### Will be modified
- `packages/xai-web-tasks/src/` — feature implementation (TaskColumn `+` wire, new TaskComposer, TasksModule state for composer + create dispatch, reducer create action if not present, local STR, styles.css).
- `packages/plugin-web-storage/src/internal/registry.ts` — only if discovery finds a new key is needed (default: reuse `xai_task_cols`, no change).

### Will be created
- `docs/workflow/roadmap/xai-web-tasks-card-create.md` — feature roadmap manifest (by `feature-plan`).
- `packages/xai-web-tasks/docs/` extension set — design / api / test / dev_log (by `feature-plan`; the package likely already has these — extend, don't overwrite).
- New components inside `packages/xai-web-tasks/src/` — `TaskComposer.tsx`, possibly `internal/ids.ts`.

### Will NOT be modified
- `xai-web-console.md` / `xai-web-console-gap-closure.md` SHIPPED archives.
- ADR-0010 (this carve-out USES it, doesn't supersede it); ADR-0007 (web build form remains canonical).
- Other `plugin-web-*` packages (no Matrix, no Statistics, no Dashboard cross-coupling in scope — even though StatTasks widget reads a fixture, wiring it to real task counts is OUT of scope here).
- `packages/core/src/types/events.ts` (no new event channel — React state lift covers re-render, per Calendar Q5-A precedent).
- `packages/plugin-web-tokens/` (local STR per precedent).
- `packages/web-auth-device-session/` (no auth changes).
- Desktop / Tauri / sync-v1 surfaces; the `dev` branch.

## 4. Workflow path

Per CLAUDE.md Workflow V2:

```
P0 carve-out commit (this doc)
  ↓
feature-plan → produces:
  - docs/workflow/roadmap/xai-web-tasks-card-create.md (manifest)
  - packages/xai-web-tasks/docs/{design, api, test, dev_log}.md extensions (per-feature contract)
  - phased implementation plan
  ↓
feature-review → APPROVED / REVISE
  ↓
feature-build (one phase per run) → ... → last phase
  ↓
feature-verify → READY_TO_SHIP / BLOCKED
  ↓
ship (human-gated push to origin/web)
```

Cross-vendor manual smoke is DEFERRED per ADR-0008 §S3 24h-evidence carve-out — joins the accumulated Web smoke batch that must clear before the next `xai-web-deploy-cloudflare` ship.

## 5. Acceptance anchor

This carve-out is satisfied when: a user can click the column `+` in the Tasks board, type a task title, pick a tag/bucket, save, see the new card appear in the correct column, and have it survive a page refresh — verified by automated tests + (deferred) cross-vendor manual smoke.
