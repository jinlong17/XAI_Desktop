# Roadmap Manifest — xai-web-matrix-card-create

- Roadmap Source: `docs/reviews/_p0-carve-outs/20260528-matrix-card-create.md` (P0 carve-out, commit `b9334f7`) + `docs/reviews/xai-web-matrix-card-create/20260528-discovery-review.md`
- Source Code Reference: `packages/xai-web-matrix/` (SHIPPED row #13 baseline 2026-05-23, manifest `status: Production`) — extension only; `packages/plugin-web-storage/` is read-only (registry key `xai_matrix_state` already present, NO edit); `packages/core/` read-only (event channel `web:matrix:priority-tagged` already present, NOT touched)
- Mirror Precedent: `docs/workflow/roadmap/xai-web-tasks-card-create.md` (SHIPPED 2026-05-28, ship `0ba69f0`) — Matrix is architecturally parallel to Tasks; this manifest is a near-clone with the divergences in the Note column + Decomposition Rationale §R6.
- Authority Anchor: **ADR-0010 Accepted 2026-05-26 §D4** ("new feature plans require an explicit P0 carve-out commit citing this ADR's D1") — carve-out commit `b9334f7` (2026-05-28)
- Init Path: `single-feature` (no decomposition; one feature row spans 3 internal phases)
- Generated: 2026-05-28
- Default Automation Mode: **A-Claude** (inherited from `xai-web-tasks-card-create.md` 2026-05-28 + `xai-web-console-gap-closure.md` 2026-05-23 user override; can be picked at feature-build dispatch time)
- Default Dependency Semantics: N/A (single row, no internal deps)
- Default Verify Cross-vendor: **yes** (Codex `gpt-5.5-thinking effort=medium` primary; Cursor fallback). MAY DEFER 24h per ADR-0008 §S3 carve-out — deferral recorded in `dev_log.md` verify section.
  - Per-phase: EP1 skip (data layer only); EP2 same-vendor smoke; **EP3 full XVENDOR-CREATE-1..N + Codex cold-read** (or formally deferred per ADR-0008 §S3)
- BG Direct Verified: unreliable-for-feature-loops (inherited; use serial / emit dispatch for any `/xai-feature-full-loop` chains).
- Manifest Review: REQUIRED (init stops here; `feature-review` must APPROVE before `feature-build` starts)
- Authority Override: this manifest **does NOT supersede** `xai-web-console.md` or `xai-web-console-gap-closure.md` SHIPPED archives; it adds **one new feature** on top of the SHIPPED 24+9 = 33-row Web Console baseline + the SHIPPED `xai-web-tasks-card-create` carve-out.
- Interop with PLUGIN_MAP.md: row #13 `@repo/plugin-web-matrix` status STAYS `Production`. Ship appends a feature note to the row's description column (NOT a status change).

## Features

| # | Slug | Source | Depends On | Dep Semantics | Status | Automation Mode | Verify Cross-vendor | Last Run | Note |
|---|------|--------|------------|---------------|--------|-----------------|---------------------|----------|------|
| 1 | xai-web-matrix-card-create | docs/reviews/_p0-carve-outs/20260528-matrix-card-create.md | — | — | READY_FOR_VERIFY | A-Claude (default) | yes (MAY defer 24h per ADR-0008 §S3; XV-CREATE-1..7 in dev_log) | 2026-05-28 | Single-row Matrix card-create feature (mirror of SHIPPED `xai-web-tasks-card-create`). Wires the no-op header `+` (`MatrixModule.tsx:39-41`, M-01) + per-quadrant `+` (`Quadrant.tsx:81-83`, M-03) to a new `MatrixComposer` native `<dialog>` mirroring `TaskComposer`/`EventComposer`/`BoardDeleteConfirmDialog`. Adds ONE pure reducer action `addCard` in a new `internal/create.ts` (`move.ts` has only `moveCardTo` today — confirmed in discovery R1/R2) + new `internal/ids.ts` `createMatrixId()` (mirrors Tasks `ids.ts`) + `NewMatrixCardDraft` type + local `internal/strings.ts` `STR_MATRIX_COMPOSER` (en+zh). `addCard` dispatched via a new `usePersistedMatrix().addCard(draft, to)` method (hook already exposes a typed `setState` — cleaner than Tasks' raw `setRawCols`). State lifted into `MatrixModule` (no new `web:*` channel — Calendar Q5-A; existing `web:matrix:priority-tagged` NOT touched, create does NOT emit). Reuses existing `xai_matrix_state` localStorage key (NO registry edit). Single title input fills both `title.en`+`title.zh` (D1). Optional tag (5 presets + None). M-01 default quadrant = `q1`; M-03 default = clicked quadrant; composer has a 4-quadrant radiogroup. `addCard` APPENDS to the target quadrant (Matrix move-convention, divergent from Tasks prepend — discovery RE5). Realistic v1 — CREATE ONLY; Edit/Delete DEFERRED (QE-A) — NOTE the divergence from Tasks: Matrix card onClick is FREE (`Card.tsx` has no onClick, only onKeyDown), so a delete-only slice is cheaper here than it was for Tasks → flagged for `feature-review` to optionally fold in. `MatrixCard.taskId` stays undefined (Tasks-join is a separate ADR). 3-phase build (EP1 data layer / EP2 composer + `+` wire + persistence / EP3 tests + cross-vendor). NO new npm dep, NO Supabase, NO IndexedDB, NO auth change, NO `packages/core/` edit, NO `plugin-web-tokens` edit, NO `plugin-web-storage` edit, NO host-shell registration edit. |

## Decomposition Rationale

### R1. Init path: single-feature

The carve-out is a single coherent feature (wire `+` → composer → reducer create → persist). No PRD-to-rows decomposition. The feature is internally phased (3 phases), and each phase is a single `feature-build` run per CLAUDE.md "feature-build does ONE phase per run".

### R2. Why a roadmap manifest for one feature

1. **P0 carve-out audit trail.** ADR-0010 §D4 requires an explicit P0 carve-out for new Web work; a roadmap manifest makes the authority chain (carve-out doc → roadmap → per-package dev_log) discoverable from `docs/workflow/roadmap/`.
2. **Workflow V2 default.** Identical shape to the sibling `xai-web-tasks-card-create.md` manifest — avoids special-casing.

### R3. Why NOT a new umbrella manifest

The carve-out is "a single-feature exception, not a strategic re-prioritization" (carve-out §2 "Specifically NOT triggered"). An umbrella "Web post-carve-out" manifest would imply continued Web work, which the carve-out rejects. One manifest per single feature keeps the framing accurate.

### R4. AskUserQuestion ambiguity resolution

The carve-out is unambiguous on In / Out / Planner's-call scope. The planner's-call items (Edit/Delete; M-01 default quadrant) are resolved with rationale (discovery §6 QE-A / QE-B). **No further AskUserQuestion is required by `feature-plan`.** `feature-review` may revise QE-A..QE-F (discovery §6) before approving — notably the Edit/Delete deferral (where Matrix DIVERGES from Tasks because card onClick is free → a delete-only slice is cheaper here).

### R5. AutomationMode / Verify Cross-vendor defaults

- Default Automation Mode: `A-Claude` (inherited; no per-row picker fires at dispatch).
- Default Verify Cross-vendor: `yes` (Codex cold-read at EP3; may defer 24h per ADR-0008 §S3).
- Reviewer may override at `feature-review` time.

### R6. Frozen assumptions + open uncertainties

**Frozen (from carve-out + discovery review §8):**

1. Owning package = `@repo/plugin-web-matrix` (no new package).
2. New files = `src/internal/ids.ts`, `src/internal/create.ts`, `src/internal/strings.ts`, `src/MatrixComposer.tsx`.
3. New reducer action = `addCard(state, draft, targetQuadrant)` (pure; **appends** to target quadrant — Matrix move-convention, divergent from Tasks prepend).
4. `NewMatrixCardDraft = { title: string; tag?: string }` (additive exported type; NO `withDate` — Matrix has no bucket-derived date).
5. Persistence = reuse `xai_matrix_state` — NO registry edit.
6. State lifted into `MatrixModule`; NO new `web:*` channel; create does NOT emit `web:matrix:priority-tagged`.
7. Composer = native `<dialog>` per `TaskComposer` precedent + local `STR_MATRIX_COMPOSER`.
8. Single title input fills both `title.en` + `title.zh`.
9. Tag picker = 5 presets + "None" radio; quadrant picker = 4 quadrants; both `role="radiogroup"`.
10. id via `createMatrixId()` — `crypto.randomUUID()` + `m-<base36ts>-<rnd>` fallback.
11. `addCard` dispatched via `usePersistedMatrix().addCard(draft, to)` (hook returns `{ state, setState, moveCard, addCard }`).
12. M-01 default quadrant = `q1`; M-03 default = clicked quadrant.
13. Edit + Delete DEFERRED to a follow-up increment.
14. `MatrixCard.taskId` stays undefined (Tasks-join = separate ADR).
15. Cross-vendor: Codex EP3; per-phase smoke from EP2; may defer 24h.

**Frozen guesses (recorded for reviewer override — discovery §6 QE-A..QE-F):**

1. Edit/Delete full deferral (QE-A) vs folding in a cheaper delete-only slice — **DIVERGENT from Tasks**: Matrix card onClick is free, so delete-only is cheaper here.
2. M-01 default quadrant = `q1` (QE-B) vs another default / no preselect.
3. `addCard` no emit (QE-D).
4. Pure reducer in new `internal/create.ts` (QE-E) vs co-locating in a renamed `internal/reducer.ts`.
5. 3 phases (QE-F) vs compressing to 2.

### R7. Cycle expectations

- Total estimated effort: **1.5-3 days** of build + verify (smaller than Tasks because the persisted hook already exposes a typed `setState`, the seed/move/validate scaffolding exists, and the Tasks composer is a near-verbatim template).
- Total estimated commits: **3-5** (1 phase commit + optional docs sync per phase).
- Test additions: **~30-40 new tests** (~8-10 EP1 create+ids / ~18 EP2 composer+wire+persistence / ~10 EP3 integration+a11y+barrel).
- SHIPPED tests stay green throughout: 54 (matrix) + 88 (storage) + web suite — no regression.
- New registry entries: **0** (reuse `xai_matrix_state`).
- New CSS rules: ~8 (composer dialog + tag/quadrant radios — appended to `matrix.css`).
- New i18n keys via `plugin-web-tokens`: **0** (constraint — local STR only).
- New `packages/core/` event channels: **0** (constraint).
- New host-shell registration edits: **0** (slot already SHIPPED).

### R8. Phase exit criteria summary

| Phase | Exits when | Cross-vendor required? |
|---|---|---|
| EP1 | `addCard` (`internal/create.ts`) + `createMatrixId` (`internal/ids.ts`) + `NewMatrixCardDraft` (`types.ts` + barrel) + `STR_MATRIX_COMPOSER` (`internal/strings.ts`) land; create/ids unit tests green; matrix typecheck + lint clean; SHIPPED 54 tests still green | no |
| EP2 | `MatrixComposer` RTL coverage (open/close/save/validation/a11y) + bilingual STR parity; M-01 + M-03 `+` wired in `MatrixModule`/`Quadrant`; `usePersistedMatrix().addCard` dispatch; created card persists + survives reload (persistence test); empty-quadrant create test green | smoke recommended |
| EP3 | Integration create→persist→refresh + a11y (ESC/backdrop/autofocus) tests green; index-barrel test (new `NewMatrixCardDraft` export) green; full matrix + web suites green; XVENDOR-CREATE matrix + Codex cold-read pass OR formally deferred per ADR-0008 §S3; dev_log verify section written; PLUGIN_MAP note appended at ship | **Codex cold-read mandatory** |

### R9. Status legend

- `NEEDS_REVIEW` — plan written, awaiting `feature-review`.
- `APPROVED` — `feature-review` PASSED; next is `feature-build` (EP1).
- `READY_FOR_VERIFY` — all 3 phases built; awaiting `feature-verify`.
- `READY_TO_SHIP` — verify passed; awaiting `ship`.
- `SHIPPED` — `ship` pushed to `origin/web`.
- `BLOCKED` — any agent set this with a reason; next step usually `feature-plan` (revise) or `feature-build` (fix).

### R10. Run instructions (operator)

After `feature-review` APPROVES:

**Manual mode** (one phase per run, recommended for first run after a feature-plan):

```text
Start the feature-build agent for xai-web-matrix-card-create.   # Phase EP1 only
# review the diff + commit, then:
Start the feature-build agent for xai-web-matrix-card-create.   # Phase EP2 only
# ...
```

**Auto mode** (cycle build + verify after APPROVED):

```text
Start the feature-dev-loop agent for xai-web-matrix-card-create.   # auto-runs all 3 phases + verify
# then:
Start the ship agent for xai-web-matrix-card-create.
```

### R11. References

- Discovery review: `docs/reviews/xai-web-matrix-card-create/20260528-discovery-review.md`
- P0 carve-out doc: `docs/reviews/_p0-carve-outs/20260528-matrix-card-create.md` (commit `b9334f7`)
- Authority: `docs/adr/0010-p1-desktop-resume-plan.md` §D4
- Audit trigger: `docs/reviews/_web-noop-audit/20260527-button-action-inventory.md` Top-10 #4 (M-01 / M-03)
- Mirror precedent (closest): `docs/workflow/roadmap/xai-web-tasks-card-create.md` + `packages/xai-web-tasks/src/TaskComposer.tsx` + `packages/xai-web-tasks/src/internal/{ids,tasksReducer,strings}.ts`
- Dialog precedents: `packages/xai-web-tasks/src/TaskComposer.tsx`, `packages/xai-web-calendar/src/EventComposer.tsx`, `packages/plugin-web-board-workspaces/src/BoardDeleteConfirmDialog.tsx`, `packages/xai-web-shell/src/SignOutConfirmDialog.tsx`
- SHIPPED Matrix baseline: `packages/xai-web-matrix/docs/{design,api,test,dev_log}.md`
- Workflow refs: `docs/workflow/SUBAGENT_WORKFLOW_V2.md`, `docs/workflow/SOP_NEW_FEATURE.md`
- Commit convention: `docs/conventions/COMMIT_CONVENTION.md`
- ADR-0007 (web build form): `docs/adr/0007-xai-web-console-build-form.md`
- ADR-0008 §S3 carve-out precedent: `docs/adr/0008-cloudflare-pages-deploy-recipe.md`

## Open Operator Decisions (none blocking)

- None at manifest authoring time. The open questions (discovery §6 QE-A..QE-F) carry planner picks and are flagged for `feature-review` override — most notably the Edit/Delete deferral (QE-A), where Matrix DIVERGES from the Tasks precedent because the card onClick is free.
