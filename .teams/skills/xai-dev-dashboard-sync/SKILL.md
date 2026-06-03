---
name: xai-dev-dashboard-sync
description: Refresh and verify the XAI personal developer dashboard, including Overview state, the machine-facing dashboard contract, and the reusable dashboard template. Use when the operator asks whether the dev-dashboard is current, wants branch/code/doc/release state synchronized, or needs Codex/Claude to align dashboard docs before trusting the personal project console.
---

# xai-dev-dashboard-sync

Project-layer skill for refreshing the personal developer dashboard and proving
whether its Overview, machine contract, reusable template, Skill / Agent
knowledge registry, and testing surfaces reflect the current repo state.

This skill wraps the existing dashboard generator. It does not replace
`scripts/dashboard/generate-state.mjs`, does not auto-edit roadmap state, does
not merge branches, and does not decide release readiness.

## Alignment Scope

Every run checks five surfaces:

1. Overview snapshot: generated branch, commit, dirty files, key docs, skill /
   agent registry, and latest release-log state.
2. Machine contract: `docs/workflow/project/dev-dashboard.md`, which tells
   Codex, Claude Code, Cursor, and other agents how to use and maintain the
   dashboard.
3. Reusable template: `docs/prototypes/dev-dashboard/TEMPLATE.md`, which
   captures dashboard structure, layout, theme, modules, drawers, docs browser,
   workflow entries, and design principles for future projects.
4. Testing status: `docs/workflow/project/dashboard-state.json.testing`,
   release-log `Verification` fields, local test report paths, and configured
   CI / pipeline inventory.
5. Skill / Agent knowledge registry: project skills, Codex skills, portable
   skills, canonical agent templates, and platform agent variants, including
   classification, usage notes, inputs, outputs, workflow links, doc links,
   maintenance state, recent updates, and missing-metadata gaps.

If the dashboard source behavior changed and a contract/template mismatch is
clear, update the relevant Markdown in the same run. If the mismatch requires an
operator decision, report `needs-review` instead of guessing.

## Triggers

- dashboard sync
- personal developer dashboard freshness
- 个人开发看板是否最新
- refresh dev-dashboard Overview
- sync dashboard branch docs release-log
- sync dashboard test results
- 个人开发看板测试结果同步
- sync dashboard skill agent registry
- Skill / Agent 知识库同步
- xai-dev-dashboard-sync

## Read First

- `docs/workflow/project/dev-dashboard.md`
- `docs/prototypes/dev-dashboard/TEMPLATE.md`
- `docs/prototypes/dev-dashboard/DESIGN.md`
- `docs/workflow/project/dashboard-state.json`
- `scripts/dashboard/generate-state.mjs`
- `docs/prototypes/dev-dashboard/js/skill-agent.js`
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
   - compare Testing Registry behavior with the Testing page, Overview module
     cards, Product structure detail, Deployment records, and Release records;
   - compare Skill / Agent Registry behavior with the Skill / Agent page,
     docs library entries, generated required fields, category colors, and gap
     badges;
   - update those docs directly when the mismatch is factual and scoped;
   - mark the surface `needs-review` when the change would alter roadmap,
     release, branch, priority, or product-governance decisions.
4. Audit Skill / Agent knowledge:
   - scan `.teams/skills/*/SKILL.md`, `.codex/skills/*/SKILL.md`,
     `docs/workflow/_portable/skills/*/SKILL.md`, `.agents/templates/*.md`,
     `.codex/agents/*.toml`, `.claude/agents/*.md`, and
     `.cursor/agents/*.md`;
   - detect new and modified Skill / Agent files from `git status --short`;
   - classify each entry into feature, bugfix, automation, governance, quality,
     authoring, or reference using name, path, description, triggers, workflow
     references, and related docs;
   - extract or deterministically generate name, type, category, usage scenario,
     function description, inputs, outputs, usage frequency, related workflow,
     related docs, maintenance status, last updated time, and short note;
   - apply those generated values to `skill_agent_registry` so the dashboard
     reaches a concrete `resolved` / `needs-action` conclusion instead of
     permanently showing missing fields;
   - treat generated intro / input / output / note / workflow / doc values as
     source-backfill notes, not blocking gaps, when the dashboard entry is
     already usable;
   - flag only unresolved items that cannot be classified or filled
     deterministically as `needs-action`;
   - emit classification suggestions for entries that remain in `reference` or
     otherwise look under-classified, then update the registry conclusion after
     the automatic fill step.
5. Audit testing evidence:
   - read `docs/workflow/project/dashboard-state.json` `testing.modules`,
     `testing.records`, `testing.pipelines`, and `testing.report_sources`;
   - scan `docs/workflow/project/release-log.md` `Verification` fields and
     extract per-module conclusion, status, category hints, failure count when
     available, and report path;
   - scan known local report locations (`playwright-report/`, `test-results/`,
     `coverage/`) for existence only;
   - scan `.github/workflows/*.yml` / `.yaml` as configured pipeline inventory;
   - keep CI honest: workflow presence is `configured` / `not queried`, never
     `passed` unless a real current result is queried and recorded;
   - sync status to the dedicated Testing page, Overview, Product structure,
     Deployment records, and Release records through the generator / dashboard
     state, not via a separate hard-coded module map.
6. For `refresh` or `verify`, run:
   - `pnpm dashboard`
7. Verify the generator:
   - `node --check scripts/dashboard/generate-state.mjs`
   - confirm generated state contains `sync_status`, `generated_at`,
     current `git.branch`, current `git.latest_commit`, the dirty-file count,
     `testing.modules` for the six Product Module Registry keys, and
     `skill_agent_registry.conclusion`, `skill_agent_registry.summary`, and
     `skill_agent_registry.entries`.
8. If UI proof is needed, run:
   - `pnpm dashboard:serve`
   - open `http://127.0.0.1:4177/#overview`
   - confirm Overview shows dashboard sync status, last update time, dirty count,
     and this skill in the Skill / Agent registry.
   - open `http://127.0.0.1:4177/#testing`
   - confirm six testing module cards render, category rows appear, pipeline /
     report lists render, and Overview / Product structure / Deployment /
     Release surfaces show test status without desktop or 390px mobile overflow.
   - open `http://127.0.0.1:4177/#skill-agent`
   - confirm Skill / Agent counts, category index, required fields,
     resolved / needs-action conclusion badges, source-backfill notes, doc
     buttons, maintenance status, and long text wrapping render without desktop
     or 390px mobile overflow.
9. Confirm Claude and Codex can discover the skill:
   - `.teams/skills/xai-dev-dashboard-sync/SKILL.md`
   - `.claude/skills/xai-dev-dashboard-sync/SKILL.md`
   - `.codex/skills/xai-dev-dashboard-sync/SKILL.md`
10. Emit a compact sync receipt.

## Short Note

This skill is the dashboard freshness and knowledge-registry sync gate. It may
refresh generated facts and factual docs, but it must not decide roadmap,
branch, release, priority, or ship state.

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
  Skill/Agent KB:     resolved | needs-action:<count> | updated | needs-review
  Source backfill:    <count of generated values that could be written back later>
  Testing status:     aligned | updated | needs-review
  Release-log latest: <latest release-log entry title>
  Verification:       <commands and results>
  Follow-up:          <none | concrete remaining item>
```

If a Workflow V2 spawned agent executes this skill, place only the receipt inside
the required `## Handoff` block and do not append a conversational follow-up.
