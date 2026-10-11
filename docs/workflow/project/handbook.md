# XAI Developer Handbook

> Thin navigation layer for solo development. This page links the existing
> authority docs; it does not replace `developer.md`,
> `docs/workflow/project/usage-guide.md`, or ADR-0013.

## Authority Anchors

| Topic | Authority |
|---|---|
| Branch topology, product lines, Web to Desktop gate, account cloud-sync contract | `docs/adr/0013-branch-sync-governance.md` |
| Multi-machine branch ownership, GitHub completeness, handoff and local-asset policy | `docs/workflow/project/multi-machine-development.md` |
| New MacBook copy-paste setup and verification prompt | `docs/workflow/project/new-mac-development-handoff-prompt.md` |
| Current P0/P1/P2 active-focus order | `CLAUDE.md` "Current Priority" + Branch & sync governance |
| Repository layout and branch map entrypoint | `developer.md` §3 and §3.5 |
| Workflow entrypoints and branch/sync usage notes | `docs/workflow/project/usage-guide.md` §16 and §17 |
| Release log / changelog | `docs/workflow/project/release-log.md` |
| Developer dashboard generated state | `docs/workflow/project/dashboard-state.json` + `scripts/dashboard/generate-state.mjs` |
| Admin-dashboard visual reference | `docs/prototypes/admin-dashboard/index.html` |

## Product-Line Map

Product priority and development lanes are separate. ADR-0013 keeps both
columns visible so Web can remain the active product mainline while Desktop
continues on its independent App lane.

| # | Product line | Where | Priority | Current status | Work rule |
|---|---|---|---|---|---|
| 1 | web | `apps/web/` | P0 | active mainline | Feature and bug-fix work are permitted on `web`; run D3 before Desktop promotion. |
| 2 | mac desktop App | `apps/desktop/` | P1 | active App lane | G1 native foundation continues independently. |
| 3 | desktop organizer plugins / widgets | `apps/desktop/` plugin slots | P2 | paused | Resume after G1 ships. |
| 4 | account cloud-sync layer | sync-v1 stack + server | P2 | paused | Resume after G1. Governed by ADR-0013 §D4. |
| 5 | official website | not yet a package | PROPOSED | proposed | Distribution/download/updater host; start trigger still operator-confirmed. |
| 6 | admin-dashboard | `docs/prototypes/admin-dashboard/index.html` + `docs/workflow/roadmap/xai-admin-dashboard-system-integration.md` | P3 roadmap-gated | operator-activated | Start with `xai-admin-dashboard-shell`; no production writes before RBAC/audit/secret/deploy gates. |

## Branch Topology

ADR-0013 defines the model but does not create new branches. Creating
`desktop-next`, `desktop-plugin-next`, or any `release/*` branch remains a
separate operator-confirmed action, especially anything touching `dev`.

```text
codex/web/<feature>
  -> web                         Web mainline / Web release source
  -> desktop-next                Web to App sync integration, D3 gate runs here
      <-> desktop-plugin-next    App plugin platform / SDK isolation lane
  -> dev                         App-focused stable mainline / App RC (independent focus, not a web subset)
  -> release/desktop/<version>   freeze-only branch, tag vX.Y.Z
```

Rules to remember:

- `web` and `dev` are two independent focus branches; their divergence is normal, not drift (do not force them equal).
- Web changes reach Desktop through D3 classification and a parity receipt
  before `web -> desktop-next`.
- `dev` advances through `desktop-next -> dev` promotion or release hotfix
  back-merge, never by an ad hoc ungated `web -> dev` merge.
- `release/desktop/<version>` is freeze-only: version, changelog, signing,
  notarization, dmg, updater metadata, and release-blocker hotfixes.

## D3 Gate Tiers

| Tier | Name | Required action |
|---|---|---|
| W0 | web-only | Record only; no Desktop merge required. |
| W1 | shared-ui-safe | Merge to `desktop-next`; run Web build + desktop `tauri build`. |
| W2 | desktop-runtime-affected | Run W1 gates plus offline/runtime/profile checks. |
| W3 | native-bridge-needed | Route native delta through `/xai-feature-full-loop` on the Desktop lane. |
| W4 | release-risk | RC/release gate with manual macOS smoke before promotion. |

## Skill Directory

Project-layer workflow skills:

| Skill | Path | Status |
|---|---|---|
| `xai-feature-brief` | `.teams/skills/xai-feature-brief/SKILL.md` | landed |
| `xai-feature-full-loop` | `.teams/skills/xai-feature-full-loop/SKILL.md` | landed |
| `xai-roadmap-loop` | `.teams/skills/xai-roadmap-loop/SKILL.md` | landed |
| `xai-web-to-desktop-sync` | `.teams/skills/xai-web-to-desktop-sync/SKILL.md` | landed (ADR-0013 §D3 gate) |
| `xai-release-log` | `.teams/skills/xai-release-log/SKILL.md` | landed (dated release / project-system log) |

Portable public skills mirrored for this repo:

| Skill | Codex path |
|---|---|
| `agent-behavioral-guidelines` | `.codex/skills/agent-behavioral-guidelines/SKILL.md` |
| `codebase-explorer` | `.codex/skills/codebase-explorer/SKILL.md` |
| `composition-patterns` | `.codex/skills/composition-patterns/SKILL.md` |
| `frontend-dev` | `.codex/skills/frontend-dev/SKILL.md` |
| `gh-fix-ci` | `.codex/skills/gh-fix-ci/SKILL.md` |
| `planning-with-files` | `.codex/skills/planning-with-files/SKILL.md` |
| `security-skills-claude-code` | `.codex/skills/security-skills-claude-code/SKILL.md` |
| `skill-creator` | `.codex/skills/skill-creator/SKILL.md` |
| `superpowers` | `.codex/skills/superpowers/SKILL.md` |
| `workflow-router` | `.codex/skills/workflow-router/SKILL.md` |

## Workflow Levels

| Level | Entry | Use when |
|---|---|---|
| 1 - Manual subagent workflow | `docs/workflow/SOP_NEW_FEATURE.md` or `docs/workflow/SOP_BUGFIX.md` | You need step-by-step control or recovery. |
| 2 - Single-feature parent recipe | `/xai-feature-full-loop` | One normal feature or bugfix should run hands-off until before `ship`. |
| 3 - Roadmap orchestration | `/xai-roadmap-loop` | A reviewed PRD or roadmap manifest needs multiple features advanced by waves. |

`ship` remains a human-triggered gate. Roadmap or feature loops should stop
before shipping unless the operator explicitly starts `ship`.

## Solo Development Rhythm

1. Pick the product line and confirm the current work rule: P0 Web active
   mainline, P1 Desktop active App lane, P2 lines paused, proposed lines not
   authorized yet.
2. Pick the workflow level. Use Level 1 for recovery, Level 2 for one feature,
   and Level 3 for roadmap waves.
3. For Web work, branch from `web` using a short-lived feature branch. For any
   Web to Desktop movement, run the D3 gate before it reaches `desktop-next`.
4. Keep Desktop candidate work on the downstream lane: `desktop-next` promotes
   to `dev` only after the integration cycle is green.
5. Treat `web`/`dev` divergence as the normal state of two focus branches. Do
   not force-merge or rebase one onto the other to make them equal; share specific
   changes on-demand via the D3 gate, and reconcile at `main`.
6. After a shipped feature or project-system change, append a dated entry to
   `docs/workflow/project/release-log.md` through `xai-release-log`.
7. Before finishing workflow/agent/skill changes, audit project-level untracked
   files exactly as `AGENTS.md` requires.

## Prototype Entry

The single-file internal dashboard for this handbook is:

```text
docs/prototypes/dev-dashboard/index.html
```

Machine-facing rules for AI / Codex / Claude Code are in:

```text
docs/workflow/project/dev-dashboard.md
```

It is an operator navigation aid, not a shipped product surface. Refresh its
file-safe generated state before reviewing or committing dashboard changes:

```bash
node scripts/dashboard/generate-state.mjs
```

When the task is specifically to check or synchronize dashboard freshness, use
the project skill:

```text
xai-dev-dashboard-sync
```

The generator writes:

```text
docs/prototypes/dev-dashboard/state.generated.js
```

The state model intentionally separates automatically refreshed facts from
manual decisions. Git status, latest commit, project skill presence, and latest
release-log entry can be generated; priority, branch creation, risk acceptance,
and release gates remain operator decisions.
