# P0 Carve-Out — xai-web-ai-tool-edit-delete

**Date:** 2026-05-29
**Authority:** ADR-0010 §D4 — new feature plans require an explicit P0 carve-out commit.
**Triggering evidence:** `xai-web-ai-tool-layer` (SHIPPED 2026-05-29) was create-only v1; operator directive 2026-05-29 to extend the AI tool registry with edit/delete.
**Operator decision:** session directive 2026-05-29 — add edit/delete tools (first of two AI enhancements; openai-compatible tool support follows separately).

---

## 1. Background

The SHIPPED AI tool layer (`xai-web-ai-tool-layer`) gives the AI two **create-only** tools (`create_task`, `create_calendar_event`) routed through a mandatory in-chat confirmation → `web:tasks:create-requested`/`web:calendar:create-requested` events → owning-module subscribers (mounted as App.tsx Shell-siblings) → owning reducers.

This carve-out extends that proven path with **edit + delete** tools so the AI can fully manage tasks/events, not just create them.

Recon (2026-05-29):
- **Calendar** `eventStore.ts` already has full CRUD: `updateEvent` (preserves createdAt, bumps updatedAt) + `deleteEvent` (no-op if id missing). **Reuse directly.**
- **Tasks** `tasksReducer.ts` has ONLY `moveCard`/`toggleComplete`/`addCard` — **NO delete, NO update**. New pure reducer actions are required (`deleteCard`, and `updateCard` if task-edit is in scope).
- P4 channels `web:tasks:create-requested` + `web:calendar:create-requested` exist; this carve-out adds update/delete siblings.
- **Targeting dependency**: edit/delete require the AI to reference an existing item by **id**. The context provider (P1) must expose stable task/event ids in its injected snapshot so the model can target update/delete. feature-plan MUST verify the current context shape includes ids and extend it if not.

## 2. Scope

**`xai-web-ai-tool-edit-delete`** — Realistic v1

### In scope
- **New AI tools** (planner finalizes exact set; suggested):
  - `delete_task` (by id) · `delete_calendar_event` (by id) — clear semantics, high value.
  - `update_task` (id + new title at minimum; bucket/tag optional) · `update_calendar_event` (id + changed fields).
- **Tasks reducer additions** (pure, immutable, same style as addCard/moveCard): `deleteCard(taskCols, id)` + `updateCard(taskCols, id, patch)` — preserve untouched cols' referential equality; preserve `done` (T-10) + other fields on update.
- **Calendar**: reuse existing `updateEvent`/`deleteEvent` (no new store logic).
- **New event channels** (additive to `packages/core/src/types/events.ts`, beside the P4 create channels): `web:tasks:update-requested`, `web:tasks:delete-requested`, `web:calendar:update-requested`, `web:calendar:delete-requested` (planner may consolidate shape, e.g. a single `web:tasks:mutate-requested {op}` — pick what fits conventions + the existing per-op create channel precedent).
- **Owning-module subscribers**: extend the App.tsx Shell-sibling subscribers (or add siblings) to handle update/delete → owning reducer.
- **Context provider id exposure**: ensure injected task/event context carries stable ids so the AI can target update/delete (extend P1 context shape if needed — additive).
- **Confirmation MANDATORY** (reuse the SHIPPED ConfirmationCard): delete + update both render a confirmation (proposed change + Confirm/Cancel); execute ONLY on Confirm. **No silent writes** (the SHIPPED lifeline continues).
- **Bounded tool_result round-trip** (reuse the SHIPPED bounded pattern): after Confirm, success tool_result → one final AI acknowledgement; Cancel → is_error tool_result; counter cap stays.

### Planner's call
- Exact tool set (delete-both is the minimum high-value; update-both adds field-patch complexity — planner may phase update after delete).
- Event-channel shape: 4 per-op channels vs consolidated mutate channel.
- `update_task` field set (title-only v1 vs title+bucket+tag).
- Whether delete needs a stricter confirmation (destructive) than update.

### Out of scope
- Bulk operations (delete all / multi-select). Undo. New providers/deps. openai-compatible tool support (separate next carve-out). Cross-device sync.

### Boundary (continues the SHIPPED tool-layer authorizations)
- `packages/core/src/types/events.ts` edit AUTHORIZED (additive channels only; beside existing `web:ai:*` + P4 create channels). Same dev-branch merge-surface flag as P4 (`web:*` ≠ dev's `desktop:*`, low conflict; flag in dev_log).
- `xai-web-tasks` (new reducer actions + subscriber) + `xai-web-calendar` (subscriber reusing existing CRUD) edits are additive within their own packages.

### NOT triggered
- ADR-0011 / P1 reprioritization / SHIPPED-archive reopening. New npm dep. `plugin-web-tokens` (local STR). `dev` branch.

## 3. Impact

### Modified
- `packages/plugin-web-ai-chat/src/internal/` — tool registry (+edit/delete tools), context provider (id exposure if needed), confirmation copy.
- `packages/core/src/types/events.ts` — +update/delete channels (additive).
- `packages/xai-web-tasks/src/internal/tasksReducer.ts` — +`deleteCard`/`updateCard`; subscriber.
- `packages/xai-web-calendar/src/` — update/delete subscriber (reuse store CRUD).
- `apps/web/src/App.tsx` — extend Shell-sibling subscribers.
- respective `docs/`.

### Created
- `docs/workflow/roadmap/xai-web-ai-tool-edit-delete.md` (by feature-plan).

### NOT modified
- Other plugins. `plugin-web-tokens`. Storage registry keys (no new key — reuses `xai_task_cols`/`xai_calendar_events`). SHIPPED archives, ADR, `dev`. Existing P4 create channels / `web:ai:*` (add only).

## 4. Workflow path

carve-out commit → feature-plan → feature-review → feature-build (phases: reducer actions + channels / tools + confirmation / subscribers + round-trip / tests + docs) → feature-verify → ship. Cross-vendor + real-key smoke DEFERRED per ADR-0008 §S3 (operator).

## 5. Acceptance anchor

Satisfied when: with an API key set, the user can ask the AI to delete or edit an existing task/event (referenced from the injected context), see a confirmation card, Confirm it, and have the real item updated/removed via the owning module's reducer (verified in the store) — with no silent writes, delete/update never executing without explicit confirmation, and `done`/other fields preserved on task update. Verified by automated tests (mocked LLM tool-use + event round-trip + reducer unit tests) + (deferred, operator) real-key smoke.
