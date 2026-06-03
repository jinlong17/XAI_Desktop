# Personal Developer Dashboard

> Machine-facing contract for Codex, Claude Code, Cursor, and other local agents.
> The HTML dashboard is the human cockpit; this document tells machines how to
> use and maintain it.

## Identity

- Name: XAI personal developer dashboard
- Human UI: `docs/prototypes/dev-dashboard/index.html`
- Dashboard README: `docs/prototypes/dev-dashboard/README.md`
- Generated state: `docs/prototypes/dev-dashboard/state.generated.js`
- Manual state base: `docs/workflow/project/dashboard-state.json`
- Product Module Registry: `docs/workflow/project/dashboard-state.json` field
  `product_lines`
- Testing Registry: `docs/workflow/project/dashboard-state.json` field
  `testing`
- Skill / Agent Knowledge Registry:
  `docs/prototypes/dev-dashboard/state.generated.js` field
  `skill_agent_registry`
- Generator: `scripts/dashboard/generate-state.mjs`
- Local server: `scripts/dashboard/serve.mjs`
- Sync skill: `.teams/skills/xai-dev-dashboard-sync/SKILL.md`
- Claude skill mirror: `.claude/skills/xai-dev-dashboard-sync/SKILL.md`
- Codex skill mirror: `.codex/skills/xai-dev-dashboard-sync/SKILL.md`
- Template doc: `docs/prototypes/dev-dashboard/TEMPLATE.md`
- Boundary spec: `docs/prototypes/dev-dashboard/BOUNDARIES.md`

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
structure, Testing, Deployment, Release records, Docs library, and Skill / Agent
routing:

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

Testing data must reference modules by `product_lines[key]`. Do not add a second
hard-coded Web/App/Plugin/Sync/Site/Admin module table in dashboard JavaScript or
test-report scripts.

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

The sync skill owns six alignment checks in one run:

1. refresh or verify the Overview snapshot from current repo evidence;
2. update this machine contract when dashboard behavior, sources, or sync rules
   have changed;
3. update `docs/prototypes/dev-dashboard/TEMPLATE.md` when a dashboard pattern is
   intentionally reusable for future projects.
4. update `docs/prototypes/dev-dashboard/BOUNDARIES.md` when concrete page/card
   ownership, Owner / Mirror / Shared-Widget rules, color semantics, navigation,
   or data-source boundaries change.
5. refresh or verify testing status from the Testing Registry, release-log
   `Verification` fields, known local report paths, and CI / pipeline
   configuration evidence.
6. refresh or verify the Skill / Agent knowledge registry, including new or
   modified definitions, classification, generated descriptions, automatic
   field completion, unresolved needs-action items, source-backfill notes,
   workflow links, document links, maintenance status, and mirror status.

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
- reusable dashboard template and boundary docs under `docs/prototypes/dev-dashboard/`;
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

- `docs/workflow/project/dev-dashboard.md`,
  `docs/prototypes/dev-dashboard/README.md`,
  `docs/prototypes/dev-dashboard/TEMPLATE.md`, and
  `docs/prototypes/dev-dashboard/BOUNDARIES.md` belong in the required-docs
  recommendation group;
- document copy actions should copy the absolute local filesystem path, using
  `repo_root` from `state.generated.js` plus the repository-relative path;
- the reader may show repository-relative paths for scanning, but the copy
  action is for opening files in other software or handing paths to another
  agent.

## Testing Requirements

The dashboard must expose test status in four places:

- a dedicated `#testing` page;
- compact status on Overview module cards and the Overview testing summary;
- the Product structure module detail / drawer for the selected module;
- Deployment and Release records where a module or version has relevant
  verification evidence.

Testing Registry entries must cover the six module keys `web`, `app`, `plugin`,
`sync`, `site`, and `admin`. Each module may include:

- latest test time;
- conclusion;
- pass / fail / partial / unknown status;
- failure count;
- duration;
- pipeline status;
- report path;
- commands;
- category rows for `self_test`, `unit`, `e2e`, `backend`, `frontend_page`,
  `build`, `pre_deploy`, and `regression`.

Dashboard-local evidence that belongs to the project system itself must use
`project-system`, not `admin`. This includes `dev-dashboard`, `dashboard-state`,
`generate-state`, `xai-dev-dashboard-sync`, and local dashboard smoke records.
Those records may appear in Testing / Release record lists, but they must not
change the six Product Module Registry cards or Admin module health.

The generator may derive additional test records from
`docs/workflow/project/release-log.md` `Verification` fields and may scan known
local report paths such as `playwright-report/`, `test-results/`, and
`coverage/`. It may list GitHub Actions workflow files as `configured`, but must
not report a workflow as passing unless a real queried result or local evidence
proves it. CI not queried is `not queried`, not green.

Testing evidence is advisory for the operator. The dashboard must not
auto-decide release readiness, ship status, merge status, or risk acceptance from
test results.

## Skill / Agent Requirements

The Skill / Agent page is a knowledge base for executable project capabilities,
not only a file list. Each registry entry should expose:

- name;
- type: Skill or Agent, plus source subtype such as Project Skill, Codex Skill,
  Portable Skill, or Workflow Agent;
- category and category color;
- usage scenario;
- function description;
- inputs;
- outputs;
- usage frequency;
- related workflow;
- related docs;
- maintenance status;
- last updated time;
- short note;
- trigger examples when present;
- path and tracked / local-only / modified / mirror-missing status.

The generator owns the normalized `skill_agent_registry` object. UI code should
render that registry and keep fallback behavior only for stale local snapshots.
The sync result must end with a conclusion:

- `resolved`: every entry has usable dashboard fields after extraction or
  deterministic generation;
- `needs-action`: at least one entry cannot be classified or filled without
  human judgment.

If the registry generates a description, input/output summary, workflow link,
or note from heuristics instead of an explicit source section, keep the
generated value visible and expose it as a source-backfill note. Do not count it
as an unresolved gap once the dashboard entry is usable.

The registry must also expose `source_completeness` separately from display
completeness. Display completeness means the dashboard entry is usable after
deterministic generation. Source completeness means the required fields came
from the Skill / Agent source files without generated backfill.

Every dashboard sync should check:

- new skills;
- new agents;
- modified Skill / Agent definitions;
- unresolved descriptions, inputs, outputs, notes, workflow links, or related
  docs after automatic fill;
- unclear categories, with a classification suggestion;
- source-backfill notes for generated fields that could be written back to
  source files later;
- project skill mirror status across `.teams/skills`, `.claude/skills`, and
  `.codex/skills` when applicable.

## Source Inventory

The generator reads at least:

- git branch, latest commit, divergence, status, log, and numstat;
- `docs/workflow/project/dashboard-state.json`;
- `docs/workflow/project/release-log.md`;
- `docs/workflow/project/dashboard-state.json` `testing`;
- known local test reports: `playwright-report/`, `test-results/`, `coverage/`;
- `.github/workflows/*.yml` / `.yaml` for configured pipeline inventory;
- `docs/workflow/project/branch-policy.json`;
- `docs/PLUGIN_MAP.md`;
- whitelisted roadmap manifests under `docs/workflow/roadmap/`;
- `.teams/skills/*/SKILL.md`;
- `.codex/skills/*/SKILL.md`;
- `docs/workflow/_portable/skills/*/SKILL.md`;
- `.codex/agents/*.toml`;
- `.agents/templates/*.md`, `.claude/agents/*.md`, `.cursor/agents/*.md`;
- generated `skill_agent_registry` metadata and gap summaries;
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

For Testing changes, also verify `http://127.0.0.1:4177/#testing`, confirm all
six module cards render, and confirm Overview / Product structure / Deployment /
Release surfaces show testing status without overflow on desktop and mobile.

For Skill / Agent registry changes, also verify
`http://127.0.0.1:4177/#skill-agent`, confirm summary counts, category index,
required fields, resolved / needs-action conclusion, source-backfill badges,
maintenance status, doc buttons, and 390px mobile wrapping render without
horizontal overflow.

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
