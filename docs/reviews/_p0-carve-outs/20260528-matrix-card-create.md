# P0 Carve-Out — xai-web-matrix-card-create

**Date:** 2026-05-28
**Authority:** ADR-0010 Accepted 2026-05-26 §D4 — "new feature plans require an explicit P0 carve-out commit citing this ADR's D1"
**Triggering evidence:** [docs/reviews/_web-noop-audit/20260527-button-action-inventory.md](../_web-noop-audit/20260527-button-action-inventory.md) Top-10 #4 (Matrix Add buttons) + per-route §2.6 rows M-01 / M-03
**Operator decision:** Real feature (Realistic v1 scope, Matrix-only) per session directive 2026-05-28 ("全都要完成"). Mirrors the just-SHIPPED `xai-web-tasks-card-create` carve-out (2026-05-28) — Matrix is architecturally parallel to Tasks.

---

## 1. Background

Audit Top-10 #4 surfaced that the Matrix (Eisenhower 4-quadrant) add buttons — header `+` (M-01, `MatrixModule.tsx:39-41`) and per-quadrant `+` (M-03, `Quadrant.tsx:81-83`) — render but have **no `onClick`**. A user cannot add a card to the matrix at all; existing cards come from seed.

Current Matrix v1 state (per audit §2.6 + recon 2026-05-28):

- `xai_matrix_state` registry key exists; `usePersistedMatrix.ts` wraps `usePref<MatrixState>` with seed hydration + schema-version guard.
- `MatrixState` = `{ schemaVersion: 1, q1/q2/q3/q4: readonly MatrixCard[] }`.
- `MatrixCard` = `{ id, title {en,zh}, date?, dateZh?, tag?, taskId? }` — `taskId` is explicitly **"reserved for a future xai-web-tasks join — undefined in v1"**.
- `Quadrant` = `"q1" | "q2" | "q3" | "q4"`.
- The **only** write path is drag-between-quadrants (M-05 `moveCard`, persists + emits `web:matrix:priority-tagged` with no consumer).

**Matrix is architecturally identical to Tasks**: own store, own persisted reducer-style hook, own typed card model. This carve-out therefore mirrors `xai-web-tasks-card-create` exactly: add the missing CREATE UI and wire it to a new `addCard` action in the existing `usePersistedMatrix` layer.

## 2. Scope of this carve-out

This carve-out authorizes **new feature development** on the Web P0 surface (otherwise maintenance-only per ADR-0010 §D1) for the single feature:

**`xai-web-matrix-card-create`** — Realistic v1

### In scope
- **Card Create** (the audit ask): wire header `+` (M-01) + per-quadrant `+` (M-03) onClick → open a minimal `MatrixComposer` dialog → on save, add a `MatrixCard` to the target quadrant via a new pure `addCard` action in `usePersistedMatrix` → persist to `xai_matrix_state`.
- **MatrixComposer dialog**: title (required) + tag (optional) + target quadrant (M-03 defaults to the clicked quadrant; M-01 header `+` defaults to q1 or a user pick). Native `<dialog>` mirroring the SHIPPED `TaskComposer` / `EventComposer` / `BoardDeleteConfirmDialog` precedent (role, autofocus, ESC/backdrop/Cancel close, a11y).
- **Bilingual title handling**: same decision as TaskComposer — single title input that fills both `en` and `zh`, field labelled in active UI lang. (Planner confirms / improves.)
- **localStorage persistence**: reuse existing `xai_matrix_state` key (no new registry key — confirm in discovery). Generated stable id (reuse `internal/` id scheme or add `createMatrixId()` mirroring tasks `ids.ts`).
- **Empty-quadrant affordance**: created card lands correctly even in a previously empty quadrant.
- **Local STR table** for composer labels (en + zh), in-package — NOT `plugin-web-tokens`.

### Out of scope (explicitly deferred)
- **xai-web-tasks join (`MatrixCard.taskId`)** — the reserved cross-module link stays `undefined` in v1. Coupling Matrix to the Tasks store (reading task priority/urgency, the audit's deeper "ideal" note) is a **separate architectural decision** (ADR-territory), NOT this carve-out. Same posture as `xai-web-tasks-card-create` deferring Matrix coupling.
- **M-02 header More / M-04 quadrant More-actions buttons** — separate no-op controls; defer to later HIDE/DISABLE batch.
- **Edit / Delete existing card** — planner's call (same as Tasks: include only if the persisted-hook makes it cheap and card onClick is free; defer otherwise).
- **`web:matrix:priority-tagged` consumer** — the existing emit stays consumer-less; wiring a consumer is out of scope.
- **Cross-device sync / IndexedDB** (deferred to xai-g2 / Supabase ADR-0011 conversation).
- **Drag-create / reminders / subtasks.**

### Specifically NOT triggered by this carve-out
- ADR-0011 (full P0 productization) — single-feature exception, not a strategic re-prioritization.
- Reversal of P1 desktop priority — G1 native foundation unaffected.
- Reopening `xai-web-console.md` / `xai-web-console-gap-closure.md` SHIPPED archives.
- New backend / cloud dependency; new npm dependency.

## 3. Impact on shipped artifacts

### Will be modified
- `packages/xai-web-matrix/src/` — feature implementation (M-01/M-03 `+` wire, new MatrixComposer, MatrixModule composer state, `usePersistedMatrix` addCard action, local STR, matrix.css).

### Will be created
- `docs/workflow/roadmap/xai-web-matrix-card-create.md` — feature roadmap manifest (by `feature-plan`).
- `packages/xai-web-matrix/docs/` extension set — design / api / test / dev_log (extend, don't overwrite SHIPPED v1).
- New components — `MatrixComposer.tsx`, possibly `internal/ids.ts`.

### Will NOT be modified
- `xai-web-console.md` / `xai-web-console-gap-closure.md` SHIPPED archives; ADR-0010; ADR-0007.
- Other `plugin-web-*` packages — **including `xai-web-tasks`** (no taskId join in v1; Matrix stays independent).
- `packages/core/src/types/events.ts` (no new event channel — React state lift; existing `web:matrix:priority-tagged` untouched).
- `packages/plugin-web-tokens/` (local STR); `web-auth-device-session/`.
- Desktop / Tauri / sync-v1; the `dev` branch.

## 4. Workflow path

Per CLAUDE.md Workflow V2: carve-out commit (this doc) → feature-plan → feature-review → feature-build (phase-per-run) → feature-verify → ship (human-gated push to origin/web). Cross-vendor manual smoke DEFERRED per ADR-0008 §S3 — joins the accumulated Web smoke batch before next `xai-web-deploy-cloudflare` ship.

## 5. Acceptance anchor

Satisfied when: a user can click the Matrix header `+` or a quadrant `+`, type a card title, pick a tag/quadrant, save, see the new card appear in the correct quadrant, and have it survive a page refresh — verified by automated tests + (deferred) cross-vendor manual smoke.
