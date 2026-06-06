# Roadmap Manifest — xai-web-tasks-card-create

- Roadmap Source: `docs/reviews/xai-web-tasks-card-create/20260528-feature-brief.md` (operator brief 2026-05-28) + `docs/reviews/_p0-carve-outs/20260528-tasks-card-create.md` (P0 carve-out, commit `09673f8`)
- Source Code Reference: `packages/xai-web-tasks/` (SHIPPED row #6 baseline 2026-05-23) — extension only; `packages/plugin-web-storage/` is read-only (registry key `xai_task_cols` already present, NO edit)
- Authority Anchor: **ADR-0010 Accepted 2026-05-26 §D4** ("new feature plans require an explicit P0 carve-out commit citing this ADR's D1") — carve-out commit `09673f8` (2026-05-28)
- Init Path: `single-feature` (no decomposition; one feature row spans 3 internal phases)
- Generated: 2026-05-28
- Default Automation Mode: **A-Claude** (inherited from `xai-web-console-gap-closure.md` 2026-05-23 user override + `xai-web-calendar-event-create.md` precedent; can be picked at feature-build dispatch time)
- Default Dependency Semantics: N/A (single row, no internal deps)
- Default Verify Cross-vendor: **yes** (Codex `gpt-5.5-thinking effort=medium` primary; Cursor fallback). MAY DEFER 24h per ADR-0008 §S3 carve-out — deferral recorded in `dev_log.md` verify section.
  - Per-phase: P1 skip (data layer only); P2 same-vendor smoke; **P3 full XVENDOR-CREATE-1..N + Codex cold-read** (or formally deferred per ADR-0008 §S3)
- BG Direct Verified: unreliable-for-feature-loops (inherited; use serial / emit dispatch for `/xai-feature-full-loop` chains).
- Manifest Review: REQUIRED (init stops here; `feature-review` must APPROVE before `feature-build` starts)
- Authority Override: this manifest **does NOT supersede** `xai-web-console.md` or `xai-web-console-gap-closure.md` SHIPPED archives; it adds **one new feature** on top of the SHIPPED 24+9 = 33-row Web Console baseline.
- Interop with PLUGIN_MAP.md: row #6 `@repo/plugin-web-tasks` status STAYS `Stable`. Ship appends a feature note to the row's description column (NOT a status change).

## Features

| # | Slug | Source | Depends On | Dep Semantics | Status | Automation Mode | Verify Cross-vendor | Last Run | Note |
|---|------|--------|------------|---------------|--------|-----------------|---------------------|----------|------|
| 1 | xai-web-tasks-card-create | docs/reviews/xai-web-tasks-card-create/20260528-feature-brief.md | — | — | APPROVED | A-Claude (default) | yes (Codex `gpt-5.5-thinking medium` P3; smoke from P2) | 2026-05-28 | Single-row Tasks card-create feature. Wires the no-op column `+` (`TaskColumn.tsx:68-74`, `col.action==="add"`) to a new `TaskComposer` native `<dialog>` mirroring `EventComposer`/`BoardDeleteConfirmDialog`/`SignOutConfirmDialog`. Adds ONE pure reducer action `addCard` (tasksReducer.ts has only `moveCard`+`toggleComplete` today — confirmed in discovery) + new `internal/ids.ts` `createTaskId()` (mirrors calendar `eventStore/ids.ts`) + `NewTaskDraft` type + local `internal/strings.ts` STR (en+zh). State lifted into `TasksModule` (no new `web:*` channel — Calendar Q5-A). Reuses existing `xai_task_cols` localStorage key (NO registry edit). Single title input fills both `title.en`+`title.zh` (D3). Optional tag (5 presets) + target bucket (defaults to clicked column) + optional bucket-derived date via existing `dateForCol`. Realistic v1 — CREATE ONLY; Edit/Delete DEFERRED (D5: TaskCard onClick already bound to toggle-complete → edit affordance collides; needs updateCard/deleteCard + 2nd dialog + card-affordance redesign, above low-cost bar). 3-phase build (P1 data layer / P2 composer + `+` wire + persistence / P3 tests + cross-vendor). NO new npm dep, NO Supabase, NO IndexedDB, NO auth change, NO `packages/core/` edit, NO `plugin-web-tokens` edit, NO host-shell registration edit. |

## Decomposition Rationale

### R1. Init path: single-feature

The operator brief is a single coherent feature (wire `+` → composer → reducer create → persist). No PRD-to-rows decomposition. The feature is internally phased (3 phases), and each phase is a single `feature-build` run per CLAUDE.md "feature-build does ONE phase per run".

### R2. Why a roadmap manifest for one feature

1. **P0 carve-out audit trail.** ADR-0010 §D4 requires an explicit P0 carve-out for new Web work; a roadmap manifest makes the authority chain (carve-out doc → roadmap → per-package dev_log) discoverable from `docs/workflow/roadmap/`.
2. **Workflow V2 default.** Identical shape to the sibling `xai-web-calendar-event-create.md` manifest — avoids special-casing.

### R3. Why NOT a new umbrella manifest

The carve-out is "a single-feature exception, not a strategic re-prioritization" (carve-out §2 "Specifically NOT triggered"). An umbrella "Web post-carve-out" manifest would imply continued Web work, which the carve-out rejects. One manifest per single feature keeps the framing accurate.

### R4. AskUserQuestion ambiguity resolution

The brief is unambiguous on Must / Planner's-call / Out scope. The planner's-call items (Edit/Delete) are resolved as **deferred** with rationale (D5). **No further AskUserQuestion is required by `feature-plan`.** `feature-review` may revise Q1..Q4 (discovery §6) before approving — notably the Edit/Delete deferral and the optional-date UX.

### R5. AutomationMode / Verify Cross-vendor defaults

- Default Automation Mode: `A-Claude` (inherited; no per-row picker fires at dispatch).
- Default Verify Cross-vendor: `yes` (Codex cold-read at P3; may defer 24h per ADR-0008 §S3).
- Reviewer may override at `feature-review` time.

### R6. Frozen assumptions + open uncertainties

**Frozen (from brief + discovery review §3):**

1. Owning package = `@repo/plugin-web-tasks` (no new package).
2. New files = `src/internal/ids.ts`, `src/internal/strings.ts`, `src/TaskComposer.tsx`.
3. New reducer action = `addCard(prev, draft, targetBucket, now?)` (pure; symmetric with `moveCard`).
4. `NewTaskDraft = { title: string; tag?: TaskTagId; withDate: boolean }` (additive exported type).
5. Persistence = reuse `xai_task_cols` (json codec) — NO registry edit.
6. State lifted into `TasksModule`; NO new `web:*` channel.
7. Composer = native `<dialog>` per `EventComposer` precedent + local `STR_TASK_COMPOSER`.
8. Single title input fills both `title.en` + `title.zh`.
9. Tag picker = 5 presets + "None" radio; bucket picker = 4 buckets; both `role="radiogroup"`.
10. Optional date opt-in → `dateForCol(targetBucket, now)` for non-`nodate` buckets.
11. id via `createTaskId()` — `crypto.randomUUID()` + `t-<base36ts>-<rnd>` fallback.
12. Edit + Delete DEFERRED to a follow-up increment.
13. Cross-vendor: Codex P3; per-phase smoke from P2; may defer 24h.

**Frozen guesses (recorded for reviewer override — discovery §6 Q1..Q4):**

1. Edit/Delete full deferral (Q1) vs folding in a cheaper delete-only slice.
2. Optional-date as opt-in checkbox (Q2) vs always-on for non-`nodate` buckets.
3. Tag "None" as explicit radio (Q3) vs toggle-off row.
4. 3 phases (Q4) vs splitting composer / wire.

### R7. Cycle expectations

- Total estimated effort: **2-4 days** of build + verify (smaller than Calendar's 5-10 because the data layer already exists).
- Total estimated commits: **3-5** (1 phase commit + optional docs sync per phase).
- Test additions: **~35-45 new tests** (10 P1 reducer+ids / ~20 P2 composer+wire+persistence / ~10 P3 integration+a11y+barrel).
- SHIPPED tests stay green throughout: 40 (tasks) + 88 (storage) + web suite — no regression.
- New registry entries: **0** (reuse `xai_task_cols`).
- New CSS rules: ~8 (composer dialog + tag/bucket radios — appended to `styles.css`).
- New i18n keys via `plugin-web-tokens`: **0** (constraint — local STR only).
- New `packages/core/` event channels: **0** (constraint).
- New host-shell registration edits: **0** (slot already SHIPPED).

### R8. Phase exit criteria summary

| Phase | Exits when | Cross-vendor required? |
|---|---|---|
| P1 | `addCard` + `createTaskId` + `NewTaskDraft` land; reducer/ids/validate unit tests green; tasks typecheck + lint clean; SHIPPED 40 tests still green | no |
| P2 | `TaskComposer` RTL coverage (open/close/save/validation/a11y) + bilingual STR parity; column `+` wired in `TasksModule`; created card persists + survives reload (persistence test); empty-bucket create test green | smoke recommended |
| P3 | Integration create→persist→refresh + a11y (ESC/backdrop/autofocus) tests green; index-barrel test (new exports) green; full tasks + web suites green; XVENDOR-CREATE matrix + Codex cold-read pass OR formally deferred per ADR-0008 §S3; dev_log verify section written; PLUGIN_MAP note appended at ship | **Codex cold-read mandatory** |

### R9. Status legend

- `NEEDS_REVIEW` — plan written, awaiting `feature-review`.
- `APPROVED` — `feature-review` PASSED; next is `feature-build` (P1).
- `READY_FOR_VERIFY` — all 3 phases built; awaiting `feature-verify`.
- `READY_TO_SHIP` — verify passed; awaiting `ship`.
- `SHIPPED` — `ship` pushed to `origin/web`.
- `BLOCKED` — any agent set this with a reason; next step usually `feature-plan` (revise) or `feature-build` (fix).

### R10. Run instructions (operator)

After `feature-review` APPROVES:

**Manual mode** (one phase per run, recommended for first run after a feature-plan):

```text
Start the feature-build agent for xai-web-tasks-card-create.   # Phase P1 only
# review the diff + commit, then:
Start the feature-build agent for xai-web-tasks-card-create.   # Phase P2 only
# ...
```

**Auto mode** (cycle build + verify after APPROVED):

```text
Start the feature-dev-loop agent for xai-web-tasks-card-create.   # auto-runs all 3 phases + verify
# then:
Start the ship agent for xai-web-tasks-card-create.
```

### R11. References

- Operator brief: `docs/reviews/xai-web-tasks-card-create/20260528-feature-brief.md`
- Discovery review: `docs/reviews/xai-web-tasks-card-create/20260528-discovery-review.md`
- P0 carve-out doc: `docs/reviews/_p0-carve-outs/20260528-tasks-card-create.md` (commit `09673f8`)
- Authority: `docs/adr/0010-p1-desktop-resume-plan.md` §D4
- Audit trigger: `docs/reviews/_web-noop-audit/20260527-button-action-inventory.md` Top-10 #3 (T-09)
- Sibling precedent (closest): `docs/workflow/roadmap/xai-web-calendar-event-create.md` + `packages/xai-web-calendar/src/EventComposer.tsx` + `packages/xai-web-calendar/src/internal/eventStore/ids.ts`
- Dialog precedents: `packages/plugin-web-board-workspaces/src/BoardDeleteConfirmDialog.tsx`, `packages/xai-web-shell/src/SignOutConfirmDialog.tsx`
- SHIPPED Tasks baseline: `packages/xai-web-tasks/docs/{design,api,test,dev_log}.md`
- Workflow refs: `docs/workflow/SUBAGENT_WORKFLOW_V2.md`, `docs/workflow/SOP_NEW_FEATURE.md`
- Commit convention: `docs/conventions/COMMIT_CONVENTION.md`
- ADR-0007 (web build form): `docs/adr/0007-xai-web-console-build-form.md`
- ADR-0008 §S3 carve-out precedent: `docs/adr/0008-cloudflare-pages-deploy-recipe.md`

## Open Operator Decisions (none blocking)

- None at manifest authoring time. The 4 open questions (discovery §6 Q1..Q4) carry planner picks and are flagged for `feature-review` override — most notably the Edit/Delete deferral (Q1).
