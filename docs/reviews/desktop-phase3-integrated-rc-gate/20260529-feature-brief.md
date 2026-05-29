# Feature Brief - desktop-phase3-integrated-rc-gate

> Date: 2026-05-29
> Executor: feature-plan (Codex, gpt-5 inline)
> Source: `docs/reviews/desktop-phase3-integrated-rc-gate/20260528-roadmap-seed.md`
> Roadmap: `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md` row `#18`

## Feature Title

Phase 3 Integrated Desktop RC Gate

## Canonical Name

`desktop-phase3-integrated-rc-gate`

## Naming Rationale

The roadmap slug already matches the real job of this row:

- `desktop-phase3` keeps the scope on the shipped Phase 3 local-first desktop runtime on branch `dev`
- `integrated-rc-gate` makes this an evidence and readiness gate, not a new implementation slice
- the row composes rows `#10` through `#17` into one release-candidate verdict before any P3 Future unlock

## Motivation

Rows `#10` through `#17` are now shipped and cover the underlying Phase 3 capabilities:

- SQLite foundation
- canonical repository bridge
- browser-data import
- offline edit queue
- reconnect replay
- AI offline provider policy
- calendar degraded mode
- backup/export/import

What is still missing is one integrated gate that proves the active desktop app can be judged as a Phase 3 whole instead of only as isolated shipped rows. That gate needs to answer:

- whether the local-first surfaces behave coherently across offline create/edit/relaunch flows
- whether reconnect, backup/restore, AI degraded behavior, and calendar degraded behavior compose cleanly
- which residual risks are repo-side defects versus manual real-macOS or contract-truth residuals

The requirement text also names notes, but upstream row `#11` explicitly froze notes as unsupported because the current repo has no canonical active note-content owner. This row must report that truth explicitly rather than invent hidden note CRUD inside an evidence gate.

## Target Outcome

Produce an approved implementation plan that:

- defines one integrated evidence pass for:
  - tasks
  - board
  - habits
  - pomodoro
  - notes contract truth
  - pet state
  - settings
  - reconnect sync
  - backup/restore
  - AI offline/degraded behavior
  - calendar degraded/reconnect behavior
- keeps repo-side readiness separate from manual real-macOS readiness
- uses the shipped runtime seams and test commands that already exist in the repo
- allows only narrow report or helper work during build if a small harness is needed
- ends with `packages/desktop-phase3-integrated-rc-gate/docs/dev_log.md` at `NEEDS_REVIEW` with `Suggested Next = feature-review`

## In Scope

- integrated Phase 3 repo-side baseline and dependency ledger
- offline create/edit/relaunch evidence for the active local-first surfaces:
  - `@repo/plugin-web-tasks`
  - `@repo/plugin-web-board-workspaces`
  - `@repo/plugin-web-habits`
  - `@repo/plugin-web-pomodoro`
  - `@repo/plugin-web-pet`
  - `@repo/plugin-web-settings-rest`
- notes truthfulness check against the frozen unsupported contract
- reconnect sync smoke using the existing desktop runtime seam
- backup/export/import smoke using the existing desktop runtime seam
- AI provider offline/degraded behavior in `@repo/plugin-web-ai-chat` and settings consumers
- calendar degraded/reconnect behavior in `@repo/plugin-web-calendar` and settings consumers
- integrated residual-risk classification and final RC verdict artifact

## Out of Scope

- new Phase 3 implementation work for tasks, board, habits, pomodoro, pet, settings, reconnect, backup, AI, or calendar beyond minimal evidence/harness support
- any hidden note-content model or new notes package
- reopening rows `#10` through `#17` as planning targets
- organizer, overlay, control-window, or legacy desktop restoration work
- ship itself; this row must stop at READY_TO_SHIP evidence

## Hard Constraints

- Do not treat this row as a new feature build; it is an integrated evidence gate.
- Do not start from pre-Phase-3 assumptions; rows `#10` through `#17` are already `SHIPPED`.
- Keep manual real-macOS smoke distinct from repo-side readiness.
- Use repo-real owners and seams:
  - `@repo/core-data`
  - `@repo/plugin-web-storage`
  - `@repo/plugin-web-tasks`
  - `@repo/plugin-web-board-core`
  - `@repo/plugin-web-board-workspaces`
  - `@repo/plugin-web-habits`
  - `@repo/plugin-web-pomodoro`
  - `@repo/plugin-web-pet`
  - `@repo/plugin-web-ai-chat`
  - `@repo/plugin-web-calendar`
  - `@repo/plugin-web-settings-rest`
  - `apps/web/src/providers/AppProviders.tsx`
- Do not rewrite the row `#11` notes decision inside this gate; classify it honestly.
- `ship` remains human-triggered even though the parent session may later proceed automatically after verify.

## Dependency Hints

- roadmap and seed:
  - `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md`
  - `docs/reviews/desktop-phase3-integrated-rc-gate/20260528-roadmap-seed.md`
- shipped Phase 3 rows:
  - `packages/desktop-local-first-sqlite-foundation/docs/dev_log.md`
  - `packages/desktop-local-first-repository-bridge/docs/dev_log.md`
  - `packages/desktop-local-first-web-data-migration/docs/dev_log.md`
  - `packages/desktop-local-first-offline-edit-queue/docs/dev_log.md`
  - `packages/desktop-local-first-sync-reconnect/docs/dev_log.md`
  - `packages/desktop-ai-offline-provider-policy/docs/dev_log.md`
  - `packages/desktop-calendar-sync-degraded-mode/docs/dev_log.md`
  - `packages/desktop-local-first-backup-export-import/docs/dev_log.md`
- active runtime seams:
  - `apps/web/src/providers/AppProviders.tsx`
  - `packages/plugin-web-storage/src/index.ts`
  - `packages/core-data/src/index.ts`
  - `packages/core-data/src/desktop-bridge.ts`
- active module registration truth:
  - `apps/web/src/routes/modules/shellRegistrations.tsx`

## Acceptance Signal

- One integrated RC evidence report classifies every Phase 3 surface in scope.
- Repo-side readiness is supported by current executable gates, not only inherited shipped status.
- Manual/macOS-only residuals are called out separately and honestly.
- Notes is reported as an explicit unsupported-contract residual unless review reopens implementation scope elsewhere.
- The integrated verdict is sufficient to decide whether Phase 3 is `READY_TO_SHIP` before P3 Future rows unlock.
