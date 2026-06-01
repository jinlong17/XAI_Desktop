---
name: xai-dev-dashboard-sync
description: Refresh and verify the XAI personal developer dashboard, including Overview state, the machine-facing dashboard contract, and the reusable dashboard template. Use when the operator asks whether the dev-dashboard is current, wants branch/code/doc/release state synchronized, or needs Codex/Claude to align dashboard docs before trusting the personal project console.
---

# xai-dev-dashboard-sync

Project-layer skill for refreshing the personal developer dashboard and proving
whether its Overview, machine contract, and reusable template reflect the current
repo state.

This skill wraps the existing dashboard generator. It does not replace
`scripts/dashboard/generate-state.mjs`, does not auto-edit roadmap state, does
not merge branches, and does not decide release readiness.

## Alignment Scope

Every run checks three surfaces:

1. Overview snapshot: generated branch, commit, dirty files, key docs, skill /
   agent registry, and latest release-log state.
2. Machine contract: `docs/workflow/project/dev-dashboard.md`, which tells
   Codex, Claude Code, Cursor, and other agents how to use and maintain the
   dashboard.
3. Reusable template: `docs/prototypes/dev-dashboard/TEMPLATE.md`, which
   captures dashboard structure, layout, theme, modules, drawers, docs browser,
   workflow entries, and design principles for future projects.

If the dashboard source behavior changed and a contract/template mismatch is
clear, update the relevant Markdown in the same run. If the mismatch requires an
operator decision, report `needs-review` instead of guessing.

## Triggers

- dashboard sync
- personal developer dashboard freshness
- 个人开发看板是否最新
- refresh dev-dashboard Overview
- sync dashboard branch docs release-log
- xai-dev-dashboard-sync

## Read First

- `docs/workflow/project/dev-dashboard.md`
- `docs/prototypes/dev-dashboard/TEMPLATE.md`
- `docs/prototypes/dev-dashboard/DESIGN.md`
- `docs/workflow/project/dashboard-state.json`
- `docs/workflow/project/release-log.md`
- `docs/workflow/project/usage-guide.md` section 11
- `CLAUDE.md` and `AGENTS.md` dashboard / skill tracking rules when this skill
  changes

## Inputs

Preferred invocation:

```text
/xai-dev-dashboard-sync
Mode: check | refresh | verify
Scope: current working tree | <branch> | <commit/range>
```

If `Mode` is omitted, use `refresh` when the operator asks to synchronize the
dashboard, and `check` when they only ask whether the dashboard is current.

## Hard Constraints

1. Treat the worktree as shared. Read `git status --short` first and do not
   revert or stage unrelated files.
2. Keep generated facts separate from manual decisions. The dashboard may read
   git, docs, skills, roadmap manifests, and release-log entries; it must not
   auto-change product priority, branch creation, risk acceptance, release gates,
   roadmap authorization, or ship status.
3. `docs/prototypes/dev-dashboard/state.generated.js` is a local generated
   artifact. Refresh it locally, but do not rely on committing it for cross-machine
   state.
4. This skill may update dashboard docs, skill docs, release-log entries, and
   tracked skill mirrors. It must not rewrite unrelated dirty files.
5. Do not add a post-commit hook for dashboard refresh. Use generator refresh,
   `dashboard:serve`, or the local `/api/refresh` button.

## Workflow

1. Inspect repo state:
   - `git branch --show-current`
   - `git log -1 --format='%h %cI %s'`
   - `git status --short`
   - if needed, inspect current `state.generated.js` for `generated_at`,
     `git.latest_commit`, and `development_data.uncommitted_files`.
2. Decide whether the snapshot is stale:
   - stale if snapshot commit differs from current HEAD;
   - stale if the dirty-file count differs;
   - stale if key dashboard sources changed after `generated_at`;
   - stale if the operator asked for a fresh sync regardless of age.
3. Audit contract/template drift:
   - compare `docs/workflow/project/dev-dashboard.md` with the current dashboard
     source behavior, generator keys, sync rules, and allowed update boundaries;
   - compare `docs/prototypes/dev-dashboard/TEMPLATE.md` with any reusable
     changes to Overview, product structure, docs library, Skill / Agent,
     release records, workflow entry, theme system, navigation, drawers, or
     file-manager document browsing;
   - update those docs directly when the mismatch is factual and scoped;
   - mark the surface `needs-review` when the change would alter roadmap,
     release, branch, priority, or product-governance decisions.
4. For `refresh` or `verify`, run:
   - `pnpm dashboard`
5. Verify the generator:
   - `node --check scripts/dashboard/generate-state.mjs`
   - confirm generated state contains `sync_status`, `generated_at`,
     current `git.branch`, current `git.latest_commit`, and the dirty-file count.
6. If UI proof is needed, run:
   - `pnpm dashboard:serve`
   - open `http://127.0.0.1:4177/#overview`
   - confirm Overview shows dashboard sync status, last update time, dirty count,
     and this skill in the Skill / Agent registry.
7. Confirm Claude and Codex can discover the skill:
   - `.teams/skills/xai-dev-dashboard-sync/SKILL.md`
   - `.claude/skills/xai-dev-dashboard-sync/SKILL.md`
   - `.codex/skills/xai-dev-dashboard-sync/SKILL.md`
8. Emit a compact sync receipt.

## Sync Receipt

Use this shape in the final response when the skill is run directly:

```text
Dashboard Sync Receipt
  Status:             current | refreshed | stale | partial | blocked
  Branch:             <branch>
  Snapshot commit:    <hash subject>
  Generated at:       <timestamp>
  Dirty files:        <count and notable buckets>
  Skill status:       xai-dev-dashboard-sync present|tracked|local-only|missing
  Machine doc:        aligned | updated | needs-review
  Template doc:       aligned | updated | needs-review
  Release-log latest: <latest release-log entry title>
  Verification:       <commands and results>
  Follow-up:          <none | concrete remaining item>
```

If a Workflow V2 spawned agent executes this skill, place only the receipt inside
the required `## Handoff` block and do not append a conversational follow-up.
