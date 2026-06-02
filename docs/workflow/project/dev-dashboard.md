# Personal Developer Dashboard

> Machine-facing contract for Codex, Claude Code, Cursor, and other local agents.
> The HTML dashboard is the human cockpit; this document tells machines how to
> use and maintain it.

## Identity

- Name: XAI personal developer dashboard
- Human UI: `docs/prototypes/dev-dashboard/index.html`
- Generated state: `docs/prototypes/dev-dashboard/state.generated.js`
- Manual state base: `docs/workflow/project/dashboard-state.json`
- Product Module Registry: `docs/workflow/project/dashboard-state.json` field
  `product_lines`
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

Module / feature classification authority: `docs/MODULE_BOUNDARIES.md` (human-readable
Web/App/Plugin boundary), `docs/workflow/project/module-classification.json`
(machine-readable taxonomy + routing signals + drift checks), and the
`xai-module-classify` skill. `docs/PRODUCT_MODULE_MAP.md` remains the routing-signal
source; `dashboard-state.json.product_lines` is the Product Module Registry that
the dashboard renders. When the boundary or classification changes, update
`module-classification.json`, `docs/PRODUCT_MODULE_MAP.md`, and the matching
registry entry in `dashboard-state.json` in the same change.

Each registry entry owns the shared module definition for Overview, Product
structure, Deployment, Release records, Docs library, and Skill / Agent routing:

- `title`, `subtitle`, `badge`, `status`, `branch`, `dependency`, `next`,
  `tracker`, `features`, `goal`, `routing`, `skills`, `prompts`, `workflow`,
  `transitions`, and `impacts` define the canonical module.
- `labels` defines context-specific names (`overview`, `deployment`, `release`)
  without creating a second module source.
- `visual` defines shared module color and icon.
- `overview` defines the Overview card/action fields (`phase`, `running`,
  `progress_fallback`, `recent_update`, `todo_fallback`, `target`).
- `tracking` defines roadmap manifests, anchor docs, release aliases, plugin-map
  filters, and region grouping.

Do not add separate hard-coded module maps in dashboard JavaScript. New surfaces
must read the enriched `product_lines` objects from `state.generated.js`.

For local product-app entry buttons, prefer `target.type: "ops"` with the
matching local ops target and route, for example Web `target: "web"` plus
`route: "/app/dashboard"`. Do not hard-code common Vite ports such as 5173 in
module actions; those ports are often occupied by another project. Ops targets
must distinguish dashboard-managed, current-repo, and other-project listeners,
and block automatic opening when the port belongs to another project.

## Authority Model

| Layer | Source | Role |
|---|---|---|
| Product routing | `CLAUDE.md`, `AGENTS.md`, `docs/PRODUCT_MODULE_MAP.md` | Authority for task classification and module navigation. |
| Human decisions / Product Module Registry | `docs/workflow/project/dashboard-state.json` | Manual fields such as priority, branch creation, release gates, risk acceptance, and shared module definitions under `product_lines`. |
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

## Docs Library Requirements

The docs library must keep the dashboard governance docs easy to inspect and
share with other tools:

- `docs/workflow/project/dev-dashboard.md` and
  `docs/prototypes/dev-dashboard/TEMPLATE.md` belong in the required-docs
  recommendation group;
- document copy actions should copy the absolute local filesystem path, using
  `repo_root` from `state.generated.js` plus the repository-relative path;
- the reader may show repository-relative paths for scanning, but the copy
  action is for opening files in other software or handing paths to another
  agent.

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
