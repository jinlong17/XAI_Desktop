# Consistency Audit — 2026-09-08

- Branch / commit: `web` @ `97fd7f4`
- Scope: full multi-machine source-of-truth audit
- Verdict: DRIFT_FOUND → operator-confirmed apply
- Snapshot fresh: prior dashboard verification matched `97fd7f4`; generated snapshot remains local-only by design

## Findings

| # | Check | Group | Severity | Evidence | Type | Action |
|---|---|---|---|---|---|---|
| 1 | `multi_machine_handoff_contract` | registration/freshness | DRIFT | `AGENTS.md` and `CLAUDE.md` only require project Agent/Skill files to be pushed; no general source/stash/ref handoff gate exists | record drift | Add canonical multi-machine contract and executable check |
| 2 | `fixed_machine_ownership` | branch governance | DRIFT | `docs/adr/0013-branch-sync-governance.md` §S2 assigns one physical machine to `web` and another to `dev` | record drift | Replace fixed hardware ownership with per-task/per-branch ownership |
| 3 | `local_recovery_state` | source of truth | BLOCKER (resolved before apply) | 23 stashes, 63 reflog-only commits, 170 unreachable commits, one Codex snapshot, and ignored design sources existed only locally at audit start | recovery drift | Secret-scan and publish isolated `codex/archive/*` refs; do not merge archives |
| 4 | `secret_restore_contract` | source of truth | DRIFT | `apps/web/.env.local` exists but no tracked `.env.example` existed | record drift | Track names-only template; keep values outside Git |
| 5 | `branch_protection_unavailable` | GitHub enforcement | INFO | GitHub protection API returns HTTP 403 for this private repository/account plan | external constraint | Enforce one-machine-per-short-branch and no-force rules in project docs/checks |

## Detection Evidence

- `main`, `web`, `dev`, and `desktop-plugin-next` were clean and aligned with upstream.
- `git rev-list --branches --not --remotes --count` = `0`.
- `git rev-list --reflog --not --remotes --count` = `0` after archival.
- `git rev-list --all --not --remotes --count` = `0` after archival.
- All 23 local stash commits are reachable from remote archive refs.
- Project Agent/Skill/Workflow tracked-surface audit returned no untracked files.
- Open PRs remain `web → main` (#2, draft) and `dev → main` (#1); this audit does not merge them.

## Confirmed Apply Set

- Add `docs/workflow/project/multi-machine-development.md` as the canonical operating contract.
- Add `scripts/ci/check-multi-machine-sync.sh` and `pnpm git:sync-check`.
- Add names-only `apps/web/.env.example`.
- Amend ADR-0013, machine-readable branch policy, developer handbook, usage guide, and Codex/Claude/Cursor entry rules.
- Record the project-system change in the release log after verification.

## Operator-gated / Not Changed

- No `web ↔ dev` equalization or archive-branch merge.
- No product priority, release, deploy, long-lived branch creation, or frozen-line change.
- Secret values and application login/history data remain outside GitHub and require a secure migration channel.
