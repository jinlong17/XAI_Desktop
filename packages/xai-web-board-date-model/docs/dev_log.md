# Dev Log — xai-web-board-date-model

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-board-date-model |
| Title | Web Project module P0 typed date contract — promote `startDate` / `dueDate` to canonical ISO fields, derive today/overdue labels across Board/Table/Calendar/Timeline/Dashboard, and keep legacy `xai_boards_v2` blobs load-safe without introducing schema-version migration work |
| Current Phase | FEATURE_BUILD |
| Status | BUILDING |
| Suggested Next | feature-build P2 |
| Automation Mode | D-Codex+Cursor |
| Verify Cross-vendor | yes |
| Executor | gpt-5.3-codex inline feature-review |
| Updated | 2026-06-03 19:29 PDT |
| Blockers | — |
| Roadmap Manifest | `docs/workflow/roadmap/xai-web-project-module.md` row #3 |
| Dependency Gate | Row #1 docs alignment is already satisfied by `e79ecc5`. Row #2 card-detail modal behavior is already shipped by `de9e120` and must be preserved. Current branch includes `2c0004c` roadmap status context. |
| Write Scope | `docs/reviews/xai-web-board-date-model/` + `packages/xai-web-board-date-model/docs/` during planning. Runtime implementation should stay inside `packages/plugin-web-board-{core,views,workspaces}/`. |

## Artifacts Index

- Discovery review: `docs/reviews/xai-web-board-date-model/20260603-discovery-review.md`
- Design snapshot: `packages/xai-web-board-date-model/docs/design.md`
- API contract: `packages/xai-web-board-date-model/docs/api.md`
- Test strategy: `packages/xai-web-board-date-model/docs/test.md`

## Decision Headline

Recommended build shape is an **incremental typed-date contract** centered in `plugin-web-board-core`:

- `startDate` / `dueDate` become the canonical persisted fields
- Board/Table/Calendar/Timeline/Dashboard consume shared derived helpers instead of raw display strings
- legacy `start` / `due` / `dueEn` / `dueLate` remain tolerated as compatibility data only

This row explicitly avoids two traps:

1. absorbing row #7's storage-contract work early, and
2. leaving localized display strings as business-logic inputs in some views while others move to typed dates

The revise pass additionally freezes three execution rules:

1. recoverable legacy `M/D` uses one board-core year rule anchored to injected local `now` with Dec/Jan rollover correction only,
2. due-state and placement semantics for `dueDate`-only / `startDate`-only / `startDate > dueDate` are fixed across Board/Table/Calendar/Timeline/Dashboard plus row #2 detail modal,
3. compatibility stays in-memory-on-read and explicit-edit-on-write only, with no row #7 storage drift.

## Phase Plan

### Phase P1 — board-core typed contract + safe legacy narrowing

**Owner**

- `packages/plugin-web-board-core/`

**Scope**

1. Freeze `startDate` / `dueDate` as the canonical persisted date fields in the board-card contract.
2. Add or refine pure helpers for:
   - ISO validation
   - recoverable legacy-string hydration
   - derived localized labels
   - derived today/overdue/week booleans
   - frozen current-year-plus-Dec/Jan-rollover `M/D` inference
3. Update guards and persistence narrowing so typed, recoverable-legacy, and ambiguous-legacy cards all load safely.
4. Move Board-card chip rendering to typed helper output instead of direct `due` / `dueEn` / `dueLate` reads.
5. Keep compatibility write behavior centralized in board-core so remaining consumers do not dual-write ad hoc strings.
6. Keep compatibility scope narrow: derive/narrow legacy fields in memory on read and dual-write compatibility outputs on explicit date edits only.

**Acceptance**

- new date edits clearly persist typed ISO values
- legacy-board loads still pass
- ambiguous legacy values fail soft instead of forcing fake dates
- recoverable `M/D` values follow one documented year rule with injected `now` examples around Jan/Dec boundaries

### Phase P2 — migrate primary views to typed helpers

**Owner**

- `packages/plugin-web-board-views/`

**Scope**

1. Update Table due rendering/editing to use typed helper output and typed writes.
2. Update Calendar grouping and day-drop writes to use typed dates.
3. Update Timeline placement and drag writes to use typed dates.
4. Update Dashboard KPIs to derive due-today and overdue from typed helper output.
5. Update filter helper semantics so due-range logic stops depending on raw strings.
6. Freeze cross-view semantics:
   - Board/Table/Dashboard/Planner/filter due state is `dueDate`-only
   - Calendar placement is `dueDate`-only
   - Timeline renders `dueDate`-only as a single-day marker, omits `startDate`-only, and fail-soft omits `startDate > dueDate`

**Acceptance**

- Board/Table/Calendar/Timeline/Dashboard agree on due-today and overdue classification
- drag/drop and shortcut flows commit ISO fields
- no primary view keeps its own standalone date-parsing rule
- `dueDate`-only / `startDate`-only / invalid-range cards behave the same way across every primary view

### Phase P3 — workspace compatibility pass + regression hardening

**Owner**

- `packages/plugin-web-board-workspaces/`
- `packages/plugin-web-board-views/`

**Scope**

1. Preserve row #2 detail-modal `startDate` / `dueDate` editing without UI regression.
2. Align `PlannerPanel` and any board-level due-range compatibility surfaces if their current raw-string rules would contradict the typed model.
3. Add reload/regression coverage for:
   - typed cards
   - recoverable legacy cards
   - ambiguous legacy cards
4. Verify active-card lookup and board switching remain safe when old blobs are present.

**Acceptance**

- detail modal continues to work on the same board writer path
- secondary compatibility surfaces do not contradict the new typed model
- legacy reload scenarios are covered by tests
- explicit editors do not auto-swap or auto-clamp invalid ranges, and reads alone do not trigger migration rewrites

## Acceptance Criteria

1. `startDate` / `dueDate` are the authoritative persisted fields for new date edits.
2. Board due chips are derived from typed-date helpers rather than raw stored display strings.
3. Table due editing and rendering use the typed contract.
4. Calendar placement/day-drop uses the typed contract.
5. Timeline placement/drag uses the typed contract.
6. Dashboard due-today and overdue KPIs use the typed contract.
7. Legacy `xai_boards_v2` payloads with recoverable display dates still load safely.
8. Ambiguous legacy values remain readable and non-crashing without fabricated migration.
9. Row #2 card-detail modal behavior remains intact.
10. No schemaVersion, whole-blob rewrite-on-read, new storage key, backend sync contract, or route change is introduced.
11. Recoverable legacy `M/D` values follow the frozen current-year-plus-Dec/Jan-rollover rule for the same injected `now`.
12. `dueDate`-only / `startDate`-only / `startDate > dueDate` semantics are identical across Board/Table/Calendar/Timeline/Dashboard plus the row #2 detail modal.

## Risks

- **R1 — ambiguous legacy strings:** `Overdue` / `过期` cannot be losslessly converted into real ISO dates and must be handled explicitly.
- **R2 — year inference drift:** the frozen current-year-plus-Dec/Jan-rollover rule must be reused everywhere; any local parser fork will regress Jan/Dec behavior.
- **R3 — timezone/day-boundary regressions:** local-date semantics must be consistent across helpers and views.
- **R4 — partial migration drift:** any remaining raw `card.due` / `card.dueLate` consumer will break cross-view consistency.
- **R5 — row bleed into storage-contract work:** adding `schemaVersion`, whole-blob rewrite-on-read, new storage keys, or sync-entity planning would violate scope.
- **R6 — row #2 regression risk:** the existing card-detail modal is already shipped and must not lose date-edit behavior during refactor.

## Review Focus

Please review specifically:

1. whether `startDate` / `dueDate` should now be treated as the only canonical persisted date fields for row #3,
2. whether the frozen current-year-plus-Dec/Jan-rollover `M/D` rule is precise enough for build and verify,
3. whether the frozen `dueDate`-only / `startDate`-only / invalid-range semantics are precise enough across Board/Table/Calendar/Timeline/Dashboard plus row #2 detail modal,
4. whether the tightened compatibility boundary is explicit enough to keep feature-build out of row #7 storage-contract work.

## Review Notes

1. The revised plan closes the prior blockers: the recoverable legacy `M/D` rule is now frozen with injected-`now` Jan/Dec examples, the `dueDate`-only / `startDate`-only / `startDate > dueDate` semantics are explicit across Board/Table/Calendar/Timeline/Dashboard plus the shipped row #2 detail modal, and the row #7 boundary is tightened to in-memory narrowing plus explicit-edit compatibility dual-writes only.
2. Discovery, design, API, test, and phase ownership now align with the current board package boundaries and are executable for feature-build without blocking ambiguity.

## Work Log

- 2026-06-03 19:13 PDT — `gpt-5.3-codex inline feature-plan` — created discovery review plus design/api/test/dev_log for roadmap row #3; defined canonical ISO date contract, legacy compatibility policy, phase ownership, and test expectations; commits: —; next step: `feature-review`
- 2026-06-03 19:21 PDT — `gpt-5.3-codex inline feature-review` — reviewed discovery/design/api/test/dev_log against roadmap row #3, shipped row #2 card-detail behavior, and row #7 boundary; returned REVISE because the year-inference rule for legacy `M/D` and the partial/range semantics for `startDate` / `dueDate` are not frozen tightly enough for build execution; commits: —; next step: `feature-plan`
- 2026-06-03 19:23 PDT — `gpt-5.3-codex inline feature-plan` — revised discovery/design/api/test/dev_log per review: froze the current-year-plus-Dec/Jan-rollover `M/D` rule with injected-`now` examples, froze cross-view semantics for `dueDate`-only / `startDate`-only / `startDate > dueDate`, and tightened the row #7 boundary to in-memory narrowing plus explicit-edit compatibility dual-writes only; commits: —; next step: `feature-review`
- 2026-06-03 19:29 PDT — `gpt-5.3-codex inline feature-review` — re-reviewed the revised discovery/design/api/test/dev_log set against the prior blockers and current board package boundaries; approved the plan because the frozen date semantics, legacy-year inference rule, and row #7 boundary are now precise enough for phased implementation; commits: —; next step: `feature-build`
- 2026-06-03 19:38 PDT — `gpt-5.4 parent inline feature-build P1` — implemented board-core typed-date helpers, strict ISO validation, recoverable legacy `M/D` inference with Dec/Jan rollover, board-card chip rendering from derived meta, and explicit-date-edit-only compatibility dual-writes; added core regression coverage for typed/recoverable/ambiguous dates and guard behavior; commits: pending; tests: `pnpm --filter @repo/plugin-web-board-core typecheck` PASS, `pnpm --filter @repo/plugin-web-board-core test` PASS (121/121; pre-existing React act() stderr warnings remain); next step: `feature-build P2`
- 2026-06-03 19:47 PDT — `gpt-5.4 parent inline feature-build P2` — migrated Table, Calendar, Timeline, Dashboard, and filter due-state logic to board-core typed date meta; Table/date shortcuts now write `dueDate`, Calendar drops write `dueDate`, Timeline drag writes `{ startDate, dueDate }`, Dashboard/filter derive due-today/overdue/week from meta, and `dateOps` now parses/generates ISO date-only values via board-core; commits: pending; tests: `pnpm --filter @repo/plugin-web-board-views typecheck` PASS, `pnpm --filter @repo/plugin-web-board-views test` PASS (128/128; pre-existing React act() stderr warnings remain), `pnpm --filter @repo/plugin-web-board-core typecheck` PASS, `pnpm --filter @repo/plugin-web-board-core test` PASS (121/121; pre-existing React act() stderr warnings remain); next step: `feature-build P3`
