# Phase 2 - Offline Local-first Surface Matrix

- Feature: `desktop-phase3-integrated-rc-gate` (row `#18`)
- Date: 2026-05-29
- Executor: `feature-auto-build (Codex gpt-5.3-codex inline)`
- Scope: integrated offline local-first matrix for tasks/board/habits/pomodoro/notes/pet/settings

## Evidence Inputs

- Phase 1 repo-side baseline: `docs/reviews/desktop-phase3-integrated-rc-gate/20260529-phase1-integrated-repo-baseline.md` (`25/25` command pass)
- Desktop offline bridge mount and globals: `apps/web/src/providers/AppProviders.tsx` (offline runtime bridge mount at `mountDesktopLocalFirstRepositoryBridge`, runtime globals setup)
- Storage bridge public exports: `packages/plugin-web-storage/src/index.ts`
- Notes unsupported contract: `packages/core-data/src/desktop-bridge.ts` (`NOTES_UNSUPPORTED_ERROR`)
- Pet top-level mount truth: `apps/web/src/App.tsx` (`DesktopPet` sibling mount under shell provider)
- Module registration truth (no notes module): `apps/web/src/routes/modules/shellRegistrations.tsx`

## Surface Matrix

| Surface | Integrated Classification | Repo-side Evidence | Manual/macOS Residual |
|---|---|---|---|
| `tasks` | `PASS` | `pnpm --filter @repo/plugin-web-tasks test` passed in Phase 1 baseline; desktop local-first bridge mounted in offline runtime. | Offline create/edit/relaunch interaction on real desktop shell is not executed in this run (`BLOCKED_ENVIRONMENT`). |
| `board` | `PASS` | `pnpm --filter @repo/plugin-web-board-core test` + `typecheck`, `pnpm --filter @repo/plugin-web-board-workspaces test` + `typecheck` all passed; bridge mounted in offline runtime. | Real desktop offline relaunch board interaction is not executed in this run (`BLOCKED_ENVIRONMENT`). |
| `habits` | `PASS` | `pnpm --filter @repo/plugin-web-habits test` passed; bridge mounted in offline runtime. | Real desktop offline relaunch habits interaction is not executed in this run (`BLOCKED_ENVIRONMENT`). |
| `pomodoro` | `PASS` | `pnpm --filter @repo/plugin-web-pomodoro test` passed; bridge mounted in offline runtime. | Real desktop offline relaunch pomodoro interaction is not executed in this run (`BLOCKED_ENVIRONMENT`). |
| `pet` | `PASS` | `pnpm --filter @repo/plugin-web-pet test` passed; `DesktopPet` is mounted at app root in `apps/web/src/App.tsx`. | Real desktop offline relaunch pet-state continuity is not executed in this run (`BLOCKED_ENVIRONMENT`). |
| `settings` | `PASS` | `pnpm --filter @repo/plugin-web-settings-shell test` + `typecheck`, `pnpm --filter @repo/plugin-web-settings-rest test` + `typecheck` passed; storage/bridge baseline passed. | Real desktop offline relaunch settings persistence UX is not executed in this run (`BLOCKED_ENVIRONMENT`). |
| `notes` | `DEFERRED_OUT_OF_SCOPE` | `NOTES_UNSUPPORTED_ERROR` in `packages/core-data/src/desktop-bridge.ts` explicitly marks notes unsupported under row #11 contract; shell registration list has no notes module registration. | No manual execution expected in this row; this is a contract-truth classification, not a test omission. |

## Phase 2 Verdict

- Integrated offline local-first matrix verdict: `PASS` for supported surfaces with explicit manual residuals.
- Notes classification: `DEFERRED_OUT_OF_SCOPE` by frozen upstream contract truth (not a regression in this row).
- No new implementation added; this phase is evidence-only per row #18 scope.
