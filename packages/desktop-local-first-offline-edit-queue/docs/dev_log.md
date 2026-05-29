# desktop-local-first-offline-edit-queue - Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | desktop-local-first-offline-edit-queue |
| Title | Desktop Local-First Offline Edit Queue |
| Current Phase | SHIP |
| Status | SHIPPED |
| Suggested Next | — |
| Automation Mode | B-Codex |
| Verify Cross-vendor | yes |
| Executor | ship (Codex, gpt-5.3-codex inline) |
| Updated | 2026-05-29 03:05 PDT |
| Brief | `docs/reviews/desktop-local-first-offline-edit-queue/20260529-feature-brief.md` |
| Discovery Review | `docs/reviews/desktop-local-first-offline-edit-queue/20260529-discovery-review.md` |
| Risks | Residual verify risk is limited to pre-existing non-blocking build/test warnings outside row `#13` ownership (Vitest `act(...)` noise in `@repo/plugin-web-storage`, Vite chunk-size warnings in `@repo/web`, and Rust dead-code warnings during desktop bundling). Manual real-macOS queue/relaunch smoke remains a future release-gate concern, not a blocker for this row verify pass. |
| Blockers | — |
| Review Notes | APPROVED. Keep `@repo/core-data` `sync.outbox` as the canonical row `#13` seam; a separate `sync.queue_state` record is not required by plan and is acceptable only as a `core-data`-owned compatibility escape hatch if status metadata cannot be extended safely in-place. Preserve explicit non-queueable handling for all device-local surfaces, require durable rollback-safety metadata before any destructive rollback, never imply remote acknowledgement/success in this row, and use only package-local executable verification commands for touched packages. |

## Roadmap Context

- Manifest: `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md`
- Row: `#13`
- Seed: `docs/reviews/desktop-local-first-offline-edit-queue/20260528-roadmap-seed.md`
- Dependency baseline:
  - row `#11` `desktop-local-first-repository-bridge` is `SHIPPED`
  - row `#12` `desktop-local-first-web-data-migration` is `SHIPPED`
  - ADR authority exists at `docs/adr/0012-phase3-local-first-storage.md`

## Phase Plan

### Phase 1 - Queue contract hardening

Status: DONE (`836a4616`)

- extend or wrap the existing `sync.outbox` contract with durable queue status metadata
- define mutation id, boundary key, base revision, local revision, and rollback metadata
- ensure entity row and queue row still share one `Repo.transaction`
- refuse split repositories and reserved outbox id collisions

Exit gates:

- `pnpm --filter @repo/core-data test`
- `pnpm --filter @repo/core-data check-types`

### Phase 2 - Representative offline staging helpers

Status: DONE (`0ffd22da`)

- add helper API to stage `put` and `delete` mutations for representative `account-sync` entities
- cover `productivity.todo`, `productivity.habit`, `project.board`, and `project.card`
- return explicit non-queueable results for device-local records
- preserve row `#12` import ledger records and browser behavior

Exit gates:

- `pnpm --filter @repo/core-data test`
- `pnpm --filter @repo/plugin-web-storage test`
- targeted package tests for touched entity owners

### Phase 3 - Retry, conflict, and rollback observability

Status: DONE (`0a6ace15`)

- list queued mutations in commit sequence order
- persist retryable failure and conflict markers
- implement safe rollback checks and audit metadata
- surface local queue summary without remote replay

Exit gates:

- `pnpm --filter @repo/core-data test`
- `pnpm --filter @repo/plugin-web-storage test`
- `pnpm --filter @repo/web test`

### Phase 4 - Desktop wiring and scope audit

Status: DONE (`a55c4567`)

- wire queue-aware write paths only where desktop runtime already writes local-first records
- keep browser runtime browser-only
- rerun cross-stack gates
- audit that row `#14`, `#16`, `#17`, overlay/control/grid, and hidden notes model did not leak in

Exit gates:

- `pnpm --filter @repo/core-data test`
- `pnpm --filter @repo/core-data check-types`
- `pnpm --filter @repo/plugin-web-storage test`
- `pnpm --filter @repo/plugin-web-storage check-types`
- `pnpm --filter @repo/web test`
- `pnpm --filter @repo/web check-types`
- `pnpm --filter @repo/web build`
- `pnpm --filter desktop tauri build --debug --bundles app`

## Explicit Deferrals

- no row `#14` reconnect/cloud replay, pull, merge, remote acknowledgement, or scheduler
- no row `#16` calendar degraded mode
- no row `#17` backup/export/import UX or snapshot policy
- no browser migration/import redo
- no browser-auth/session, AI secret, or encrypted cache import
- no hidden note-content persistence
- no overlay/control/grid/organizer restoration

## Review Focus

- Is extending `sync.outbox` the right row `#13` approach, or should build add a sidecar `sync.queue_state` row?
- Are device-local non-queueable rules strict enough?
- Are rollback safety checks concrete enough to avoid overwriting newer local edits?
- Is the row `#14` replay boundary explicit enough?
- Are verification gates executable in this repo?

## Work Log

| Timestamp | Executor | Action | Commits | Tests | Next |
|---|---|---|---|---|---|
| 2026-05-29 02:39 PDT | feature-plan (Codex, gpt-5.4 inline fallback) | Fresh planning pass after the spawned plan worker failed to produce artifacts. Normalized the roadmap seed into a formal feature brief, reviewed ADR-0012, shipped row `#11` and row `#12` docs/dev logs, inspected `@repo/core-data` repository and `sync-outbox` seams, and wrote discovery/design/api/test/dev_log artifacts. Recommended extending the existing `sync.outbox` seam for durable offline queue state, refusing device-local queueing, exposing retry/conflict/rollback state locally, and keeping reconnect/cloud replay deferred to row `#14`. | — | Not run (planning docs only) | feature-review |
| 2026-05-29 02:44 PDT | feature-review (Codex, gpt-5.4 inline fallback) | Reviewed the feature brief, discovery/design/api/test/dev_log artifacts against ADR-0012, the shipped row `#11`/`#12` contracts, and the live `@repo/core-data` `sync-outbox` seam. Approved the plan because it keeps row `#13` scoped to local staging and sync-log state only, uses the existing outbox contract as the primary seam, keeps device-local records explicit non-queueable, and preserves safe rollback/no-fake-remote-success constraints. Recorded one execution note for build/verify: prefer only package-local commands that actually exist when selecting touched-package gates. | — | `pnpm --filter @repo/core-data check-types` PASS; `pnpm --filter @repo/plugin-web-storage check-types` PASS; gate audit confirmed some sibling packages use `typecheck` rather than `check-types` | feature-auto-build |
| 2026-05-29 02:49 PDT | feature-auto-build (Codex, gpt-5.3-codex inline fallback) | Completed Phase 1 queue-contract hardening on canonical `sync.outbox`: added queue status/boundary/local revision/rollback safety metadata with validation guards while preserving same-transaction atomicity and split-repo/id-collision protections. | `836a4616` | `pnpm --filter @repo/core-data test` PASS; `pnpm --filter @repo/core-data check-types` PASS | feature-auto-build |
| 2026-05-29 02:52 PDT | feature-auto-build (Codex, gpt-5.3-codex inline fallback) | Completed Phase 2 representative staging helpers in `@repo/core-data`: added deterministic row #13 mutation-id staging APIs for todo/habit/project-board/project-card plus explicit non-queueable result semantics for device-local and unsupported surfaces. Confirmed row #12 import tests remain green. | `0ffd22da` | `pnpm --filter @repo/core-data test` PASS; `pnpm --filter @repo/plugin-web-storage test` PASS | feature-auto-build |
| 2026-05-29 02:54 PDT | feature-auto-build (Codex, gpt-5.3-codex inline fallback) | Completed Phase 3 local observability APIs: ordered queue listing, queue summary, retryable-failure/conflict/rollback-pending markers, and rollback apply with divergence guard (`rollback_not_safe` -> conflict). No remote replay/ack paths added. | `0a6ace15` | `pnpm --filter @repo/core-data test` PASS; `pnpm --filter @repo/plugin-web-storage test` PASS; `pnpm --filter @repo/web test` PASS | feature-auto-build |
| 2026-05-29 02:58 PDT | feature-auto-build (Codex, gpt-5.3-codex inline fallback) | Completed Phase 4 desktop wiring: bridged account-sync write families (`productivity.todo`, `productivity.habit`, `project.board`, `project.card`) to row #13 staging helpers in desktop runtime only, kept browser import path and device-local records non-queueable, and reran full cross-stack/build gates. Scope audit confirmed no row #14/#16/#17 or overlay/control/grid/hidden-note leakage. | `a55c4567` | `pnpm --filter @repo/core-data test` PASS; `pnpm --filter @repo/core-data check-types` PASS; `pnpm --filter @repo/plugin-web-storage test` PASS; `pnpm --filter @repo/plugin-web-storage check-types` PASS; `pnpm --filter @repo/web test` PASS; `pnpm --filter @repo/web check-types` PASS; `pnpm --filter @repo/web build` PASS; `pnpm --filter desktop tauri build --debug --bundles app` PASS | feature-verify |
| 2026-05-29 03:03 PDT | feature-verify (Codex, gpt-5.4 inline fallback) | Verified commits `836a4616`, `0ffd22da`, `0a6ace15`, `a55c4567`, and `249fe138` against the row `#13` design/api/test contracts and the requested scope. Confirmed `@repo/core-data` `sync.outbox` remains the only durable queue seam, account-sync staging is limited to todo/habit/project board/card, device-local settings/pet/pomodoro/board workspace writes stay non-queueable, rollback refuses destructive overwrite on divergence, and no row `#14`/`#16`/`#17` or overlay/control/grid/browser-import scope leaked into the implementation. | `836a4616`, `0ffd22da`, `0a6ace15`, `a55c4567`, `249fe138` | `pnpm --filter @repo/core-data test` PASS; `pnpm --filter @repo/core-data check-types` PASS; `pnpm --filter @repo/plugin-web-storage test` PASS; `pnpm --filter @repo/plugin-web-storage check-types` PASS; `pnpm --filter @repo/web test` PASS; `pnpm --filter @repo/web check-types` PASS; `pnpm --filter @repo/web build` PASS; `pnpm --filter desktop tauri build --debug --bundles app` PASS | ship |
| 2026-05-29 03:05 PDT | ship (Codex, gpt-5.3-codex inline) | Ship gate complete. Revalidated commit integrity/scope for `836a4616`, `0ffd22da`, `0a6ace15`, `a55c4567`, and `249fe138` over `c8b5cd4e..HEAD`, confirmed no sensitive-file leakage, pushed row `#13` commits to `origin/dev`, and updated dev-log + roadmap row `#13` to `SHIPPED` with row `#14` dependency-unblocked semantics. | `836a4616`, `0ffd22da`, `0a6ace15`, `a55c4567`, `249fe138` | Reused feature-verify PASS evidence (no code changes) | workflow complete |
