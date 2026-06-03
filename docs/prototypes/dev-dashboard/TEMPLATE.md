# Personal Developer Dashboard Template

> Reusable template for creating a local personal developer dashboard in another
> system-level project. Keep project-specific names as examples, not requirements.

## Purpose

Build a local cockpit that answers four questions at a glance:

1. What should I work on now?
2. Which branch or product line owns it?
3. Which workflow, skill, or agent should run?
4. What is the current evidence-backed status?

The dashboard reads and reminds. It must not auto-decide priorities, merge
branches, mark releases ready, or rewrite roadmap state.

## Recommended File Layout

```text
docs/prototypes/dev-dashboard/
  index.html
  styles.css
  state.generated.js
  js/
    state.js
    testing.js
    overview.js
    product-flow.js
    docs-library.js
    skill-agent.js
    ops-panels.js
    nav.js
    theme.js
    theme-bootstrap.js
    main.js
scripts/dashboard/
  generate-state.mjs
  serve.mjs
docs/workflow/project/
  dashboard-state.json
  dev-dashboard.md
  release-log.md
```

`state.generated.js` should be ignored by git. Regenerate it locally.

## Data Pipeline

```text
git + docs + roadmap + skills + release-log
  -> scripts/dashboard/generate-state.mjs
  -> docs/prototypes/dev-dashboard/state.generated.js
  -> static HTML/CSS/JS dashboard
```

Keep a no-bundler path. The static file can open through `file://`, and the local
server can unlock document browsing, search, refresh, and raw file reads.

Use one Product Module Registry for every module-aware surface. In XAI this is
`docs/workflow/project/dashboard-state.json.product_lines`; in a new project it
can be an equivalent JSON field or file. The registry should own canonical
module fields plus context labels, visual tokens, Overview fields, roadmap
manifest bindings, docs anchors, release aliases, features, routing, skills,
prompts, workflow, transitions, and impacts. Overview cards, product structure,
deployment cards, release module cards, docs filters, and Skill / Agent module
references should all read from that registry after generation.

Use a separate Testing Registry for test result facts, but reference product
modules by the Product Module Registry key. In XAI this is
`docs/workflow/project/dashboard-state.json.testing`, with `modules[]`,
`records[]`, `pipelines[]`, and `report_sources[]`.

## Dashboard Sections

| Section | Role | Minimum content |
|---|---|---|
| Overview | Daily cockpit | Last update, branch, snapshot commit, dirty files, next action, sync state, module cards from the Product Module Registry. |
| Product structure | Module navigation | Product lines, dependencies, transitions, impact links, branch rules from the same module registry. |
| Testing results | Quality cockpit | Per-module latest test time, conclusion, pass/fail/partial status, failure count, category rows, pipeline status, duration, and report links. |
| Docs library | File-manager style docs browser | Whitelisted roots, directory tree, Markdown preview, search, refresh, registry-provided module doc anchors. |
| Skill / Agent | Execution registry | Project skills, local skills, agent variants, triggers, tracked/local status, registry-provided module routing skills. |
| Release records | Change history | Overall releases, per-module release cards, detailed release rows, module aliases from the registry. |
| Workflow entry | Operator action surface | Feature, bugfix, roadmap, ship, sync, release-log entry points. |
| Dev data | Git-derived activity | Commits, numstat, dirty count, docs/code ratio, recent branch commits, daily / weekly / monthly trend charts. |

## Overview Design

Overview should be dense and operational:

- top card with title, generated time, branch, freshness badge;
- signal cards for branch divergence, roadmap count, skills, dashboard sync;
- focus rows for current line, current policy, sync rules, and release-log state;
- product flow mini-map;
- module cards for current product surfaces, sourced from the Product Module
  Registry rather than an Overview-only config;
- compact test-result badges per module and a Testing summary card when the
  project has a Testing Registry;
- deployment or release summary when relevant.

Avoid hero marketing copy. Avoid explaining the dashboard to the operator inside
the cockpit. Every visible item should be a fact, status, or action entry.

## Visual System

Use a restrained operational UI:

- small-radius cards, usually 8px or less;
- compact headings inside panels;
- color roles mapped to product modules, not arbitrary decoration;
- module color roles read from the Product Module Registry where possible;
- persistent theme modes: system, light, dark;
- accent swatches plus custom color;
- no decorative gradient blobs or unrelated illustration;
- responsive grids with stable dimensions for navigation, cards, boards, and
  workflow nodes.

Example module color roles:

| Role | Example color |
|---|---|
| Web / primary product | blue |
| Desktop / app lane | green |
| Plugin / extension lane | purple |
| Sync / shared account layer | cyan |
| Site / public distribution | yellow |
| Admin / control plane | red |

## Navigation

Recommended order:

1. Overview
2. Task progress
3. Dev data
   - Provide a time-dimension switch for Today, last 7 days, weekly, and monthly.
   - Render charts for weekly commit comparison, monthly commit comparison,
     weekly active-day trend, and monthly active-day trend; do not leave this as
     numeric cards only.
4. Branch management
5. Product structure
6. Deployment
7. Testing results
8. Docs library
9. Skill and Agent
10. Release records

Persist custom order in localStorage. Provide a compact reset button.

## Detail Drawers

Use drawers for module details instead of nested cards:

- title, subtitle, status, branch, dependency;
- development goal;
- routing signals;
- recommended skills and prompts;
- workflow steps;
- transitions to the next module;
- impacted modules and docs.
- current test conclusion, latest test time, failure count, pipeline status, and
  category rows when the Testing Registry is available.

The drawer should support direct action buttons such as "open doc", "locate in
product map", or "open module target".

For local product-app targets, route through a dashboard ops target when the
dashboard provides one, instead of hard-coding common dev ports. This lets the
dashboard detect whether a port is already owned by another project before it
opens the product route. If a common port is occupied by a different project,
the dashboard should show the ops/status panel instead of opening that URL.

## Document Browser

The docs page should behave like a lightweight file manager:

- left tree for whitelisted roots;
- center Markdown/text preview;
- search bar using `rg` with fallback to `grep`;
- required-doc recommendations for the machine contract and reusable template;
- actions: open raw, copy absolute path, reveal in Finder, refresh;
- serve-only capabilities should show a clear unavailable state under `file://`.

Whitelist only project docs, workflow docs, skill/agent roots, and package docs.
Reject path traversal.

## Skill / Agent Page

Show skills and agents as an executable knowledge base, not only a list of
names. The generator should emit a normalized `skill_agent_registry` with:

- name;
- type: Skill or Agent, plus source subtype;
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

The page should group entries by workflow category, keep project skills before
generic local skills when possible, and show a registry conclusion:

- `resolved` when every entry has usable fields after extraction or
  deterministic generation;
- `needs-action` only when a field cannot be filled or classified without human
  judgment.

Generated fallback copy is allowed and should complete the dashboard entry. Show
it as a source-backfill note so maintainers know which source files could be
improved later, but do not keep the dashboard in a permanent missing-field state
once the generated registry has supplied the value.

## Release Records

Use structured release-log entries with:

- date;
- product line;
- branch / commit;
- user-visible change;
- developer/system delta;
- verification;
- risk / follow-up.

Render both an overall release summary and per-module cards.

## Testing Results

Use a dedicated testing page instead of burying test health inside Deployment or
Release records. Deployment says "where is it running"; Testing says "what proof
exists". A recommended testing schema:

```json
{
  "testing": {
    "summary": {},
    "categories": [
      { "key": "self_test", "label": "自测结果" },
      { "key": "unit", "label": "单元测试" },
      { "key": "e2e", "label": "端到端测试" },
      { "key": "backend", "label": "后端测试" },
      { "key": "frontend_page", "label": "前端页面测试" },
      { "key": "build", "label": "构建测试" },
      { "key": "pre_deploy", "label": "部署前检查" },
      { "key": "regression", "label": "回归测试" }
    ],
    "modules": [],
    "records": [],
    "pipelines": [],
    "report_sources": []
  }
}
```

The generator may derive records from release-log `Verification` fields and
known report paths, but CI should stay `not queried` unless a real current result
is queried. Test evidence informs the operator; it must not auto-mark a release
ready.

## Machine Contract

Add a machine-facing Markdown document, usually:

```text
docs/workflow/project/dev-dashboard.md
```

It should tell agents where the dashboard lives, how to refresh it, what sources
feed it, what may be updated automatically, and what remains operator-only.

## Sync Skill

Add a project skill, usually:

```text
.teams/skills/<project>-dev-dashboard-sync/SKILL.md
```

Expose the same skill to each local AI runtime that should recognize it, for
example `.claude/skills/<project>-dev-dashboard-sync` and
`.codex/skills/<project>-dev-dashboard-sync` as symlinks to the project source.

The skill should run the generator, verify the snapshot, audit the machine
contract, audit this reusable template, and emit a sync receipt. It should not
duplicate generator parsing logic.

Recommended receipt fields:

```text
Overview sync: current | refreshed | stale | blocked
Machine doc:  aligned | updated | needs-review
Template doc: aligned | updated | needs-review
```

Use `needs-review` only when the difference requires an operator decision about
roadmap, release, branch, priority, or product-governance state. Apply factual
contract/template updates directly.

## Adaptation Checklist

When creating a new dashboard from this template:

- define product modules and long-lived branch topology;
- decide which state is generated and which state is manual;
- define roadmap manifest format;
- choose skill/agent roots;
- choose release-log format;
- define document whitelist;
- implement `generate-state` before polishing UI;
- keep generated state ignored;
- add a machine-facing dashboard contract;
- add a sync skill;
- expose the sync skill to the intended local AI runtimes;
- add release-log entries for dashboard changes.
