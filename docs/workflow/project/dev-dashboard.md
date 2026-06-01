# Personal Developer Dashboard

> Machine-facing contract for Codex, Claude Code, Cursor, and other local agents.
> The HTML dashboard is the human cockpit; this document tells machines how to
> use and maintain it.

## Identity

- Name: XAI personal developer dashboard
- Human UI: `docs/prototypes/dev-dashboard/index.html`
- Generated state: `docs/prototypes/dev-dashboard/state.generated.js`
- Manual state base: `docs/workflow/project/dashboard-state.json`
- Generator: `scripts/dashboard/generate-state.mjs`
- Local server: `scripts/dashboard/serve.mjs`
- Sync skill: `.teams/skills/xai-dev-dashboard-sync/SKILL.md`
- Claude skill mirror: `.claude/skills/xai-dev-dashboard-sync/SKILL.md`
- Codex skill mirror: `.codex/skills/xai-dev-dashboard-sync/SKILL.md`
- Template doc: `docs/prototypes/dev-dashboard/TEMPLATE.md`

The dashboard is a local project-management console. It is not a customer-facing
product surface, not the proposed Admin Dashboard, and not a replacement for
`CLAUDE.md`, `AGENTS.md`, `docs/PRODUCT_MODULE_MAP.md`, or ADR-0013.

## Product Routing

Dashboard automation and documentation work is classified as `web` mainline /
project-system / dev-dashboard work. Do not route it to the proposed `admin`
Control Plane unless the task is explicitly about `docs/prototypes/admin-dashboard/`
or a future `/admin` production surface.

## Authority Model

| Layer | Source | Role |
|---|---|---|
| Product routing | `CLAUDE.md`, `AGENTS.md`, `docs/PRODUCT_MODULE_MAP.md` | Authority for task classification and module navigation. |
| Human decisions | `docs/workflow/project/dashboard-state.json` | Manual fields such as priority, branch creation, release gates, and risk acceptance. |
| Generated facts | `scripts/dashboard/generate-state.mjs` | Reads git, roadmap manifests, skill/agent files, docs, release-log, and dev logs. |
| Human cockpit | `docs/prototypes/dev-dashboard/index.html` | Shows Overview, product structure, docs library, Skill / Agent registry, release records, and workflow entry points. |
| Machine contract | this file | Tells agents how to refresh, trust, and update the dashboard. |

## Sync Contract

Agents should refresh or check the dashboard when:

- the operator asks whether the personal dashboard is current;
- a branch switch, merge, release-log update, skill/agent update, or project-system
  doc update changes dashboard source state;
- a task changes `docs/prototypes/dev-dashboard/`,
  `docs/workflow/project/dashboard-state.json`, `.teams/skills/`, `.codex/skills/`,
  `.codex/agents/`, or `docs/workflow/project/release-log.md`;
- final handoff depends on Overview data.

The sync skill owns three alignment checks in one run:

1. refresh or verify the Overview snapshot from current repo evidence;
2. update this machine contract when dashboard behavior, sources, or sync rules
   have changed;
3. update `docs/prototypes/dev-dashboard/TEMPLATE.md` when a dashboard pattern is
   intentionally reusable for future projects.

The skill should apply factual Markdown updates directly. It should report
`needs-review` only when the mismatch requires an operator decision about
roadmap, release, branch, priority, or product-governance state.

Commands:

```bash
pnpm dashboard
```

```bash
pnpm dashboard:serve
```

`dashboard:serve` binds only to `127.0.0.1`, runs the generator on start, and
exposes `/api/refresh` for manual refresh from the browser.

## What Machines May Update

Agents may update:

- project skill docs under `.teams/skills/` and tracked mirrors under `.codex/skills/`;
- Claude skill mirrors under `.claude/skills/` when a project skill should be
  available to Claude Code;
- dashboard source HTML/CSS/JS under `docs/prototypes/dev-dashboard/`;
- generator/server scripts under `scripts/dashboard/`;
- machine and operator docs under `docs/workflow/project/`;
- reusable dashboard template docs under `docs/prototypes/dev-dashboard/`;
- `docs/workflow/project/release-log.md` through `xai-release-log`;
- `docs/workflow/project/dashboard-state.json` only for authored operator-facing
  rows, prompts, links, and manual override copy.

Agents must not auto-update:

- product priority;
- long-lived branch creation;
- release gate decisions;
- risk acceptance;
- roadmap authorization;
- ship status or merge decisions.

## Overview Requirements

Overview must make dashboard freshness visible without requiring the operator to
inspect generated files. It should show:

- last generated time;
- current branch and snapshot commit;
- dirty-file count and notable dirty buckets;
- latest release-log entry;
- dashboard sync skill presence;
- refresh entry (`pnpm dashboard` or serve-mode refresh);
- reminder that the board reads and reminds, but does not decide roadmap, merge,
  or release state.

## Source Inventory

The generator reads at least:

- git branch, latest commit, divergence, status, log, and numstat;
- `docs/workflow/project/dashboard-state.json`;
- `docs/workflow/project/release-log.md`;
- `docs/workflow/project/branch-policy.json`;
- `docs/PLUGIN_MAP.md`;
- whitelisted roadmap manifests under `docs/workflow/roadmap/`;
- `.teams/skills/*/SKILL.md`;
- `.codex/skills/*/SKILL.md`;
- `.codex/agents/*.toml`;
- `.agents/templates/*.md`, `.claude/agents/*.md`, `.cursor/agents/*.md`;
- package `docs/dev_log.md` status panels.

## Verification Pattern

For a dashboard source change, minimum verification is:

```bash
node --check scripts/dashboard/generate-state.mjs
```

```bash
pnpm dashboard
```

For HTML/CSS/JS or Overview changes, also verify the served dashboard at
`http://127.0.0.1:4177/#overview` when practical.

## Release Logging

After a scoped dashboard, skill, or project-system change, append a release-log
entry with `xai-release-log`. Classify it as `project-system / dev-dashboard`
unless the change belongs to a specific product line.

## Drift Rules

- Treat `state.generated.js` as a disposable local snapshot.
- If `generated_at`, `git.latest_commit`, or `development_data.uncommitted_files`
  differs from current repo evidence, refresh before trusting Overview.
- If the generated dashboard and this machine contract disagree, update the
  document and the rendered dashboard in the same change.
- If a new dashboard pattern is meant to be reused in another project, update
  `docs/prototypes/dev-dashboard/TEMPLATE.md`.
- If `xai-dev-dashboard-sync` changes, keep `.teams/skills/`,
  `.claude/skills/`, and `.codex/skills/` discoverability aligned in the same
  change.
