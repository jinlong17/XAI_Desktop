# Dev Log — xai-web-board-card-detail

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-board-card-detail |
| Title | Web Project module P0 card-detail slice — wire `/app/board` cards to a real detail modal, persist title/description/date/label/member/link/checklist edits through the current board blob, and keep Board/Table/Calendar/Timeline/Planner aligned without pulling the full typed-date migration into this row |
| Current Phase | FEATURE_AUTO_BUILD |
| Status | READY_FOR_VERIFY |
| Suggested Next | feature-verify |
| Automation Mode | D-Codex+Cursor |
| Verify Cross-vendor | yes |
| Executor | gpt-5.4 inline fallback after feature-verify repair |
| Updated | 2026-06-03 19:01 PDT |
| Blockers | Resolved: `eadc04b` was split into docs + P1/P2/P3 phase commits with full commit bodies, and title edits now mirror both `title.en` and `title.zh` with regression coverage. |
| Roadmap Manifest | `docs/workflow/roadmap/xai-web-project-module.md` row #2 |
| Dependency Gate | Branches containing `e79ecc5 docs(web): formalize project module plan` satisfy the row #1 docs prerequisite for this feature. There is no separate `xai-web-project-prd-sync` dev_log gate in this worktree; re-audit only if the referenced project-module docs drift again. |
| Write Scope | `docs/reviews/xai-web-board-card-detail/` + `packages/xai-web-board-card-detail/docs/` during planning. Runtime implementation is expected to touch `packages/plugin-web-board-{core,views,workspaces}/` only. |

## Artifacts Index

- Discovery review: `docs/reviews/xai-web-board-card-detail/20260603-discovery-review.md`
- Design snapshot: `packages/xai-web-board-card-detail/docs/design.md`
- API contract: `packages/xai-web-board-card-detail/docs/api.md`
- Test strategy: `packages/xai-web-board-card-detail/docs/test.md`

## Decision Headline

Recommended build shape is a **modal-first, route-compatible** card-detail surface owned by `plugin-web-board-workspaces`, backed by **additive board-card schema + compatibility helpers** owned by `plugin-web-board-core`. `plugin-web-board-views` stays light: it passes card-open intents through and remains compatible with the same underlying card entity.

This row deliberately avoids two traps:

1. importing desktop `plugin-project` runtime internals into Web, and
2. absorbing the full `xai-web-board-date-model` rewrite early.

The narrow bridge allowed here is additive ISO date fields plus legacy display derivation if the detail form needs authoritative dates immediately.

## Phase Plan

### Phase P1 — board-core schema bridge + compatibility helpers + shared member source

**Owner**

- `packages/plugin-web-board-core/`

**Scope**

1. Add additive detail-capable card types and optional card fields in `src/types.ts`.
2. Extend `src/internal/isBoardArray.ts` so legacy and enriched cards both validate safely.
3. Extend `src/internal/boardOps.ts` with deterministic card-detail mutation helpers and derived-field normalization.
4. Extract current mock-member options into a shared board-core export.
5. Update seed data only where needed to prove richer card detail paths without breaking existing tests.
6. Update `src/index.ts` public surface for any additive exports introduced by this phase.
7. Add/adjust board-core tests around guards, normalization, and compatibility behavior.

**Acceptance**

- Existing legacy-board tests still pass.
- New detail-field tests pass.
- Checklist/attachment/date compatibility derivation is covered by unit tests.

### Phase P2 — workspace card-detail surface + modal orchestration

**Owner**

- `packages/plugin-web-board-workspaces/`

**Scope**

1. Add route-compatible active-card state to `BoardWorkspacesModule`.
2. Wire Kanban + Planner open-card flows into the new detail surface.
3. Add detail UI sections for title, description, labels, members, start/due, links, and checklist CRUD.
4. Add modal shell + standalone detail-body component(s) so the surface is reusable later by a page route.
5. If phase budget permits, add append-only activity note stub with strictly local semantics.
6. Add workspace package tests for modal open/close, persistence writes, and section-level CRUD.

**Acceptance**

- Kanban and Planner can open the detail modal.
- Title/description/labels/members/links/checklist edits persist through the existing board writer.
- No new storage key is introduced.

### Phase P3 — alternate-view passthrough + cross-view regression hardening

**Owner**

- `packages/plugin-web-board-views/`
- `packages/plugin-web-board-workspaces/`

**Scope**

1. Ensure Table / Calendar / Timeline open the same detail surface.
2. Verify alternate-view components still behave correctly with enriched card data.
3. Add regression tests proving detail edits remain visible across Board/Table/Calendar/Timeline.
4. Tighten reload safety for pre-row and partially enriched localStorage board payloads.

**Acceptance**

- Table, Calendar, Timeline, and Planner all open the same detail surface.
- Detail edits remain visible after reload and across current views.
- No routing/module-registration edit was required for the P0 modal slice.

## Acceptance Criteria

1. Card click from current board UI opens a real detail modal.
2. Detail surface is reusable and does not hard-code itself into a modal-only implementation.
3. Card title edit persists.
4. Card description edit persists.
5. Label and member edits persist using current board-local models.
6. Link/attachment URL list CRUD persists and updates current aggregate display.
7. Checklist item CRUD persists and updates current aggregate display.
8. Start/due edits persist without requiring the full row #3 date migration.
9. Table/Calendar/Timeline/Planner remain consistent with the same underlying card entity.
10. Legacy board blobs without the new fields still load safely.

## Risks

- **R1 — row bleed into `xai-web-board-date-model`:** adding authoritative ISO fields is acceptable only with legacy display compatibility and no broad alternate-view rewrite.
- **R2 — aggregate/detail drift:** derived `checklist` / `attach` / legacy date fields must be normalized from the new canonical fields on every relevant write.
- **R3 — duplicated member truth:** TableView-local member mocks must be centralized before both Table and CardDetail edit members.
- **R4 — stale-card open path:** all open-card entry points must resolve against the active board safely; deleted/missing cards must no-op instead of crashing the shell.
- **R5 — docs prerequisite drift:** roadmap row #2 still depends on row #1 conceptually, but the actionable gate in this worktree is whether branches still include the docs-alignment baseline from commit `e79ecc5`. If those project-module docs drift, build should pause for a quick re-audit.

## Review Focus

Please review specifically:

1. whether the additive schema bridge is the right boundary between row #2 and row #3,
2. whether `description/checklist/activity` should remain plain strings rather than `BilingualText`,
3. whether the exact file ownership split is clear enough for feature-build to execute without architecture drift,
4. whether the corrected `e79ecc5` docs prerequisite and the explicit `BoardMemberOption` owner/shape are now build-executable.

## Review Notes

APPROVED for build. The two prior blockers are resolved: row #1 is now correctly treated as the satisfied `e79ecc5` branch/docs prerequisite, and `BoardMemberOption` / `BOARD_MEMBER_OPTIONS` now have explicit public ownership under `@repo/plugin-web-board-core`.

Phase boundaries, file ownership, and acceptance criteria are concrete enough for `feature-auto-build`. The plan also keeps scope discipline: additive date bridge only, no full typed-date migration, no server-sync/storage-contract work, no real share/permissions, and no host/router expansion.

Non-blocking caution for build workers: keep activity-note support explicitly optional or defer it cleanly, and add manual verification coverage for Planner + Timeline alongside the existing Kanban/Table/Calendar checks.

## Build Notes

Inline fallback was used because `feature-auto-build` could not run in this Codex Desktop account: the worker template requested `gpt-5.3-codex`, which is not supported for this ChatGPT-backed Codex session.

Implemented runtime scope:

1. `@repo/plugin-web-board-core`
   - Added additive detail fields/types: `description`, `checklistItems`, `attachments`, `activity`, `startDate`, `dueDate`.
   - Added `BoardMemberOption` + `BOARD_MEMBER_OPTIONS`.
   - Added guard coverage for enriched cards.
   - Added `normalizeBoardCardDetail` / `mergeBoardCardPatch`; `updateCardInList` now keeps checklist, attachment, and legacy date display fields aligned.

2. `@repo/plugin-web-board-views`
   - Replaced TableView's package-local `MOCK_MEMBERS` with board-core `BOARD_MEMBER_OPTIONS`.
   - Fixed a date-sensitive Timeline integration test by pinning the fixture's system time.

3. `@repo/plugin-web-board-workspaces`
   - Added reusable `BoardCardDetailSurface` and `BoardCardDetailModal`.
   - Wired Board, Planner, Table, Calendar, and Timeline open-card flows to the same detail surface.
   - Persisted title, description, labels, members, checklist items, attachment links, start/due dates, and activity notes through the existing `xai_boards_v2` board writer.
   - Added invalid URL rejection for attachment links.
   - Re-exported the detail surface/modal from the workspaces package barrel.

Verification completed in this worktree:

- `pnpm install --frozen-lockfile` — pass; lockfile already current.
- `pnpm --filter @repo/plugin-web-board-core test` — pass, 112 tests.
- `pnpm --filter @repo/plugin-web-board-views test` — pass after test-time fix, 126 tests.
- `pnpm --filter @repo/plugin-web-board-workspaces test` — pass, 180 tests.
- `pnpm --filter @repo/plugin-web-board-core typecheck` — pass.
- `pnpm --filter @repo/plugin-web-board-views typecheck` — pass.
- `pnpm --filter @repo/plugin-web-board-workspaces typecheck` — pass.
- `pnpm --filter @repo/plugin-web-board-core lint` — pass.
- `pnpm --filter @repo/plugin-web-board-views lint` — pass.
- `pnpm --filter @repo/plugin-web-board-workspaces lint` — pass.
- `pnpm --filter @repo/web dev:mock-auth` — pass; Vite selected `http://localhost:3001/` because port 3000 was occupied.
- `curl -I -L http://localhost:3001/app/board` — pass, HTTP 200.

Known test-suite warnings observed but not introduced by this slice:

- board-core `BoardModule` tests still emit existing React `act(...)` warnings.
- board-views `MapView` / `BoardCalendarView` tests still emit existing React `act(...)` warnings.
- board-workspaces `BoardSwitcher` still emits existing nested-button hydration warnings.
- Chrome/Computer Use browser interaction smoke was attempted but blocked by `cgWindowNotFound`; no screenshot/click proof was captured in this run.

## Verification Notes

Fresh verification in this verify pass:

- `pnpm --filter @repo/plugin-web-board-core test` — pass, 112 tests.
- `pnpm --filter @repo/plugin-web-board-views test` — pass, 126 tests.
- `pnpm --filter @repo/plugin-web-board-workspaces test` — pass, 177 tests.
- `pnpm --filter @repo/plugin-web-board-core typecheck` — pass.
- `pnpm --filter @repo/plugin-web-board-views typecheck` — pass.
- `pnpm --filter @repo/plugin-web-board-workspaces typecheck` — pass.
- `git diff --check` — pass.

Verification findings:

1. **Commit integrity / phase-boundary failure.**
   - `eadc04b feat(web): implement board card detail modal` bundles planning artifacts (`docs/reviews/...`, `packages/xai-web-board-card-detail/docs/...`) and runtime implementation for `plugin-web-board-{core,views,workspaces}` in one commit.
   - This violates `docs/conventions/COMMIT_CONVENTION.md`: each commit must carry a single intent, feature-build commits must reference the phase number, and the commit message must include the required Why/What/Scope/Risk/Docs/Tests body.
   - Because this feature was supposed to respect the P1/P2/P3 phase split, verify cannot mark it READY_TO_SHIP until the build history is reconstructed into phase-bounded commits.

2. **Bilingual title persistence drifts from the frozen contract.**
   - `design.md` frozen assumption #5 says title edits must continue to mirror the same value into both `title.en` and `title.zh`.
   - `packages/plugin-web-board-workspaces/src/BoardCardDetailModal.tsx` currently mirrors only when `card.title.en === card.title.zh`; otherwise it updates only the active language key.
   - Seeded cards such as `bc1` already start with distinct bilingual values (`"Onboarding flow concepts"` / `"新人引导流程概念"`), so editing the title through the detail surface violates the documented persistence contract and lacks a regression test.

Non-blocking note:

- The manual browser-smoke limitation is honestly labeled. This verify pass still has no real click/screenshot proof because the prior Computer Use attempt failed with `cgWindowNotFound`, and the dev log explicitly states that gap.

## Repair Notes

Feature-verify blockers were repaired inline after the BLOCKED handoff:

1. **Commit integrity / phase-boundary repair**
   - Reconstructed the unpushed mixed commit into phase-bounded commits:
     - `d7259b1 docs(web): plan board card detail slice`
     - `e075ae4 feat(web-board-card-detail): phase P1 add card detail schema bridge`
     - `234e74e feat(web-board-card-detail): phase P2 add workspace card detail modal`
     - `5fecc7f feat(web-board-card-detail): phase P3 wire alternate views to detail`
   - Each phase commit includes `Phase`, `Why`, `What`, `Scope`, `Risk`, `Docs`, and `Tests` metadata in the commit body.

2. **Bilingual title mirror repair**
   - `BoardCardDetailSurface` title edits now write `{ en: value, zh: value }` unconditionally.
   - `BWM-DETAIL-2` now asserts both `title.en` and `title.zh` persist to the edited value.

3. **P3 regression hardening**
   - Added `BWM-DETAIL-5..7` to prove Table, Calendar, and Timeline view clicks open the shared detail modal.

Fresh verification after repair:

- `pnpm --filter @repo/plugin-web-board-core test` — pass, 112 tests.
- `pnpm --filter @repo/plugin-web-board-views test` — pass, 126 tests.
- `pnpm --filter @repo/plugin-web-board-workspaces test` — pass, 180 tests.
- `pnpm --filter @repo/plugin-web-board-core typecheck && pnpm --filter @repo/plugin-web-board-core lint` — pass.
- `pnpm --filter @repo/plugin-web-board-views typecheck && pnpm --filter @repo/plugin-web-board-views lint` — pass.
- `pnpm --filter @repo/plugin-web-board-workspaces typecheck && pnpm --filter @repo/plugin-web-board-workspaces lint` — pass.
- `git diff --check` — pass.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-06-03 18:17 | gpt-5.3-codex | feature-plan Fresh — reviewed roadmap/PRD/board package family, produced discovery review + design/api/test/dev_log for the P0 card-detail slice, and set the feature to NEEDS_REVIEW | — | feature-review |
| 2026-06-03 18:24 | gpt-5.3-codex | feature-review REVISE — approved the package boundary and additive-schema approach, but sent the plan back because the row #1 dependency gate is not executable in this worktree and the `BoardMemberOption` contract is undefined | — | feature-plan |
| 2026-06-03 18:26 | gpt-5.3-codex | feature-plan Revise — corrected the dependency gate to the satisfied `e79ecc5` docs baseline, defined the public `BoardMemberOption`/`BOARD_MEMBER_OPTIONS` contract under board-core ownership, and returned the plan for review | — | feature-review |
| 2026-06-03 18:31 | gpt-5.3-codex | feature-review APPROVED — verified the revised dependency gate and shared member contract against repo truth, confirmed the phase split/test scope is executable for auto-build, and advanced the status panel to APPROVED | — | feature-auto-build |
| 2026-06-03 18:48 | gpt-5.4 inline fallback | feature-auto-build inline — implemented board-core additive detail schema/normalization, shared member export, reusable workspaces detail surface/modal, Board/Table/Calendar/Timeline/Planner open-card wiring, attachment URL rejection, and focused tests/lint/typecheck. Build agent could not run because the configured `gpt-5.3-codex` worker model is unavailable in this account. | — | feature-verify |
| 2026-06-03 18:55 | gpt-5.3-codex | feature-verify BLOCKED — reran package tests/typechecks and `git diff --check`, then blocked ship on mixed-scope commit history (`eadc04b`) and bilingual title persistence drifting from the frozen mirror-write contract | eadc04b | feature-build |
| 2026-06-03 19:01 | gpt-5.4 inline fallback | feature-build repair — split the mixed build commit into docs/P1/P2/P3 commits with required metadata, fixed title edits to mirror both bilingual fields, added Table/Calendar/Timeline detail-open regression tests, and reran the full related package test/typecheck/lint matrix plus `git diff --check` | d7259b1, e075ae4, 234e74e, 5fecc7f | feature-verify |
