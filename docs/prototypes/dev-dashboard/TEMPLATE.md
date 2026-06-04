# Personal Developer Dashboard — Reusable Template

> A **copy-to-another-project** spec for building a local, single-developer
> dashboard ("dev cockpit"). It captures the structure, visual system, layout,
> color logic, data pipeline, card boundaries, and management surfaces of the XAI
> dev-dashboard, **generalized** so an AI can regenerate an equivalent dashboard
> in a different project.
>
> **How to use this template in a new project:** hand this file to an AI and say
> "build me a dev dashboard like this for `<project>`". Project-specific names
> (module keys, branches, paths, ports) appear as **examples in `‹angle brackets›`
> or labeled "example"** — replace them; keep the rules. The companion files in a
> live install are `BOUNDARIES.md` (this project's concrete per-card boundaries),
> `DESIGN.md` (why), and a machine contract (`docs/workflow/project/dev-dashboard.md`).

## Table of Contents

1. Positioning — what the dashboard is for
2. Core principles
3. File layout & data pipeline
4. Page structure & Tab design
5. Navigation rules
6. Card boundary model — Owner / Mirror / Shared-Widget
7. Per-page card structure (per section type)
8. Color system & tokens
9. Theme modes (implementation contract)
10. Product flow diagram design
11. Product module color definition
12. Layout rules & breakpoints
13. Docs library structure
14. Skill / Agent management structure
15. Workflow management structure
16. Deployment record structure
17. Testing result structure
18. Release record structure
19. Operations manual structure
20. Card-adding rules
21. Anti-duplication & boundary rules
22. Data-source rules
23. Machine contract
24. Sync skill
25. Adaptation checklist

---

## 1. Positioning

Build a local cockpit that answers four questions at a glance:

1. **What should I work on now?**
2. **Which branch / product line owns it?**
3. **Which workflow, skill, or agent should run?**
4. **What is the current evidence-backed status?**

Design rule: **less explanation, more state; less intro, more action entries.**
The dashboard *reads and reminds*. It must never auto-decide priorities, merge
branches, mark releases ready, or rewrite roadmap state. Every visible item is a
**fact**, a **status**, or an **action entry** — no marketing hero copy, no
meta-explanation of the dashboard inside the dashboard.

It is a **solo-developer console**, not a team BI tool and not a slide.

---

## 2. Core principles

| Principle | Meaning |
|---|---|
| **Auto facts, human judgment** | The console reads/reminds; it never auto-edits roadmap, auto-merges, or auto-decides ship/priority. AI may *suggest*; the operator confirms. |
| **Serve is the real-tool carrier** | Doc-browse / tree / search need a local server; `file://` cannot read directories or run search. The static snapshot is the fallback. |
| **Branch ≠ product line** | Long-lived branches serve integration risk & release cadence; feature work happens on short branches. Divergence between long lines is expected, not drift. |
| **Generated state is disposable** | The generated state file is a per-machine build artifact — **git-ignored**, regenerated locally. |
| **One registry per data domain** | Modules, testing, skills each have a single registry; every surface reads it. Never hand-code a second copy. |
| **Owner / Mirror / Shared-Widget** | Each data domain has one detail Owner; other pages show only summaries (Mirror) or status badges (Shared-Widget). This is the rule that prevents duplication (§6). |

---

## 3. File layout & data pipeline

```text
docs/prototypes/dev-dashboard/
  index.html              # shell only: loads state, css, ordered plain scripts
  styles.css              # the visual system (tokens + components + responsive)
  state.generated.js      # window.<PROJECT>_DASHBOARD_STATE = {…}  — GIT-IGNORED
  README.md               # how to open / run (the ops manual entry point)
  TEMPLATE.md             # this template (kept fresh by the sync skill)
  BOUNDARIES.md           # this project's concrete per-page/per-card boundaries
  DESIGN.md               # why + upgrade plan
  js/
    main.js               # boot: dispatch all render fns, wire hash routing
    state.js              # consume the global; distribute consts; static fallbacks
    nav.js                # nav registry (single source of truth) + drag/reorder
    theme.js              # theme mode + accent (system/light/dark)
    theme-bootstrap.js    # pre-paint FOUC guard (mirrors theme.js storage keys)
    utils.js              # shared helpers (badgeClass, copyText, …)
    overview.js           # aggregator page
    product-flow.js       # product structure / module registry OWNER
    deployment.js         # deployment OWNER
    testing.js            # testing OWNER + shared test-status badge widget
    docs-library.js       # docs browser OWNER
    skill-agent.js        # skill/agent registry OWNER
    usage-ops.js          # commands + live process control OWNER
    ops-panels.js         # (legacy grab-bag — prefer one-file-per-page; see §4)
scripts/dashboard/
  generate-state.mjs      # reads git+docs+roadmap+skills+release-log → state.generated.js
  serve.mjs               # 127.0.0.1-only static + /api server (no deps)
docs/workflow/project/
  dashboard-state.json    # MANUAL overrides base + Product Module Registry + Testing Registry
  dev-dashboard.md        # machine contract (rules for AI agents)
  release-log.md          # release source of truth
```

**Pipeline:**

```text
git + docs + roadmap + skills + release-log
  → scripts/dashboard/generate-state.mjs          (Node stdlib, zero deps)
  → state.generated.js  (window.<PROJECT>_DASHBOARD_STATE = {…})
  → static HTML/CSS/JS dashboard
```

**`file://` constraint (keep it):** the board loads state via
`<script src="./state.generated.js">` that **assigns a global** — never a runtime
`fetch()` of a sibling `.json` (blocked under `file://`). The local server unlocks
fetch-based features (tree / md / search / refresh), 127.0.0.1 only. CSS/JS stay
plain relative static assets — no bundler, no module loader.

**Two registries (single source per domain):**
- **Product Module Registry** — owns canonical module fields + context labels +
  visual tokens + overview fields + roadmap bindings + docs anchors + release
  aliases + features + routing + skills + prompts + workflow + transitions +
  impacts. Example location: `dashboard-state.json.product_lines`. *Every*
  module-aware surface reads this after generation.
- **Testing Registry** — test facts, referencing modules by their registry key.
  Example: `dashboard-state.json.testing` with `modules[]` / `records[]` /
  `pipelines[]` / `report_sources[]`.

---

## 4. Page structure & Tab design

The dashboard is a **hash-routed single page** (no framework router). Each tab maps
to one `<section data-page-section="‹id›">`; switching toggles `.is-active`.

**Tab design rules:**
- `data-page` (nav) === `data-page-section` (content) === `location.hash`.
- Deep-linkable: `#‹id›` selects the tab on load; `hashchange` re-selects.
- Active nav item gets `.is-active`; unknown hash falls back to the first tab
  (log a console note so a stale link is visible).
- **Prefer one render module per page.** Avoid a grab-bag file that renders
  multiple unrelated pages (the XAI install's `ops-panels.js` is the anti-pattern
  to not repeat — it renders 4 unrelated tabs).
- **Each tab is one section container.** Avoid the multi-section-sharing-one-id
  pattern (XAI's `overview` spans 5 sections — documented as a known exception).
- Add per-page mount hooks if any page is heavy; do not assume eager render of
  all pages stays cheap forever.

**Recommended tab set, grouped (11 tabs / 5 groups):**

| Group | Tabs | Owner domain |
|---|---|---|
| **Cockpit** | Overview | sync state (native) + mirrors of all |
| **Progress** | Task progress · Dev data | dev_log tasks · git activity |
| **Product** | Product structure · Branch management | module registry · branch policy |
| **Delivery & Quality** | Deployment · Testing · Release records | deploy · test · release |
| **Knowledge & Ops** | Docs library · Skill & Agent · Usage & Ops | docs · skill registry · commands |

To **add a new page**: add to the nav registry (single source) → add a
`<section data-page-section>` → register a render fn in `main.js` → assign it to a
group → declare its Owner domain in `BOUNDARIES.md`.

---

## 5. Navigation rules

| Dimension | Rule |
|---|---|
| **Single source** | Nav items come **only** from a JS registry (`DEFAULT_NAV_ITEMS`). Do not keep a parallel static `<a>` list in HTML — it will silently drift. |
| **Layout** | Fixed-width left vertical rail (example 248px), sticky, glass background; collapses to a horizontal scrollable top bar below the mobile breakpoint (it does not disappear). |
| **Grouping** | Split a long list into logical groups with dividers (≈5 groups for ~11 tabs); keep related pages adjacent. |
| **Color** | Nav items are neutral; the **active** item uses the accent. Optional subtle per-group tint. **Never** apply the product-module palette to nav (avoids "page = module" confusion). |
| **Sort** | Default order from the registry; user drag-reorder persisted to `localStorage`; provide a reset control. Sanitizer dedupes and appends missing pages. |
| **Drag** | Pointer drag (small activation threshold) + keyboard arrows; drop indicators. |
| **Routing** | Hash-based; see §4. |

---

## 6. Card boundary model — Owner / Mirror / Shared-Widget

**The single rule that prevents duplication.** Most "two cards show the same thing"
problems come from re-implementing one data domain on two pages. Constrain it:

| Role | Definition | Rules |
|---|---|---|
| **Owner** | The one page that renders a data domain's **full detail** | The detail renderer exists exactly once; new detail only goes on the Owner page |
| **Mirror** | A **re-display** of an Owner's domain on another page — may be thin (a summary) or **rich (full cards/graph)**; the aggregator/Overview is *encouraged* to be rich | ① **reuse the Owner's renderer / data / status vocabulary** (reuse, don't fork a second implementation) ② link back to the Owner ③ the Owner stays the single definition of the canonical renderer + data shape. **How much to show is the page's call; the only ban is forking a second implementation (the drift source)** |
| **Shared-Widget** | A small read-only **status badge** embedded on multiple pages | must be a *single shared function*, maintained by its data Owner; embed as an indicator only — never expand it into a second detail card |

**Decision test** before showing content another page already owns: *Am I forking a
second renderer/vocabulary (❌, it will drift), re-displaying via the Owner's
renderer/data (✅ Mirror — rich or thin), or embedding a shared status badge
(✅ Shared-Widget)?* Appearing on screen more than once is **not** duplication —
duplication is a second *implementation*, not a second *appearance*. Rich
re-display is the aggregator's value, not debt.

Maintain a **data-domain → Owner** table in `BOUNDARIES.md` for the concrete
project. The aggregator (Overview) may re-display richly — it just does so by
**reusing** Owner renderers/data, never by forking a parallel implementation.

---

## 7. Per-page card structure (by section type)

Each card is specified by six fields. When adding a card, fill all six —
**especially "Excludes,"** which is where the boundary lives.

> **Card spec format:** `Responsibility / Shows / Excludes / Data source / Color / Interactions`

### Overview (rich aggregator) — ~6–7 cards
- **Snapshot header** (native) — generated-time, branch, freshness badge, dirty
  count. *Excludes* any business detail.
- **Focus rows** (native) — current priority lines. *Excludes* module cards, task
  lists.
- **KPI signal grid** (native, aggregated) — headline numbers only (1 tile each).
  *Excludes* trend charts (→ Dev data), branch detail (→ Branches).
- **Sync status** (native; Overview owns it) — last refresh, snapshot commit,
  dirty buckets, sync-skill status, latest release.
- **Module re-display** (→ Product structure) — Overview is a rich cockpit, so it
  *may* show the mini flow **and** module cards (and a drawer). Implement by
  **reusing** Product-structure's renderers/data (drawer reuses the detail
  renderer; shared status vocabulary) — richness is the operator's choice, not
  duplication. The only thing to avoid is a forked second renderer.
- **Quick-skill strip** (→ Skill & Agent) — curated high-frequency entries.
  *Excludes* the full registry/fields.

### Detail Owner page (e.g. Product structure) — structure + track + detail
- **Structure map** — node graph of modules + edges. Interactions: click → select.
- **Sequence/flow card** — ordered steps (e.g. branch workflow).
- **Owner-specific orchestration / registry card (optional)** — project-specific
  workflow or sync registries may live here when the Product structure page owns
  the domain. Declare the data source in `BOUNDARIES.md`; keep styles in
  `styles.css` tokens, not inline JS.
- **Module track** — one card per module, optionally region-grouped (the "N module
  cards"). Card top-border uses the module color.
- **Detail panel/drawer** — the per-module dossier (goal / features by status /
  status grid / routing / skills / prompts / workflow / transitions / impacts /
  docs). The Owner of the deep-dive; mirrors elsewhere reuse this renderer.

### Quality/Delivery Owner page (Deployment / Testing / Release) — summary + cards + records (+ aside)
- **Summary grid** — top-line KPIs from one `summary()` function.
- **Per-module cards** — module-keyed, may embed a Shared-Widget (e.g. test badge).
- **Records list** — chronological history.
- **Aside** — secondary lists (env+issues, pipelines+reports). Consolidate
  related lists into one aside card; don't restate the module fact-grid.

### Registry Owner page (Docs / Skill & Agent) — summary + index + board
- **Summary counts** — completeness/health tiles.
- **Category/jump index** — navigation into the board.
- **Board** — category sections × entry cards (full field grid per entry).

### Detail card field format
A module/entry detail card should expose a consistent field grid (10±):
type, category, scenario, inputs, outputs, frequency, related workflow, status,
last-updated, note — plus action buttons (open doc, locate, open target).

---

## 8. Color system & tokens

Define **all** colors as CSS custom properties on `:root` (light = base) with a
`:root[data-theme="dark"]` override layer. Naming: flat kebab-case,
semantic-role-first (`--bg`, `--surface`, `--text`, `--line`, `--muted`); depth
layers get numeric suffixes (`--surface-2/-3`); modules get `--module-‹color›` +
`--module-‹color›-bg`. Accent is a runtime-injected `--theme-primary`.

**Core token set (example values — keep the roles, retune the hues):**

| Token | Light example | Role |
|---|---|---|
| `--theme-primary` / `--theme-primary-rgb` | `#1a73e8` / `26,115,232` | brand/accent (runtime-overridable) |
| `--bg` / `--bg-2` | `#e6eefb` / `#eef6ff` | page background layers |
| `--surface` / `--surface-2` / `--surface-3` | `#ffffff` / `#f8fbff` / `#edf5ff` | card / raised / track surfaces |
| `--surface-glass` | `rgba(255,255,255,.76)` | rail / glass (backdrop-blur) |
| `--surface-code` / `--surface-code-ink` | `#edf5ff` / `#0f4d9a` | code bg / code ink |
| `--line` / `--line-strong` | `#cdddf2` / `#b9d3f4` | borders |
| `--text` / `--muted` / `--faint` | `#142033` / `#5a6980` / `#647288` | text scale |
| `--green/-cyan/-blue/-yellow/-red/-purple` | status hues | status palette (see below) |
| `--shadow` / `--shadow-soft` | `0 20px 50px …/.12` | elevation |
| `--radius` | `8px` | corner radius — **use the token**, don't hardcode `8px` everywhere |

**Status badge palette (7 semantic colors — do not add an 8th):**

| class | meaning |
|---|---|
| `b-green` | success / deployed / pass / shipped / fresh / as-expected |
| `b-cyan` | in-progress / deploying / in-dev / active / running(unmanaged) |
| `b-blue` | ready / planned / new / info / policy markers / default fallback |
| `b-yellow` | pending / paused / partial / stale-ish / warning / not-generated |
| `b-red` | failure / error / risk / contested / missing |
| `b-purple` | rollback-needed / stale record |
| `b-gray` | neutral / unknown / not-deployed / proposed / empty state |

**Token discipline (avoid the XAI install's debt):**
- Keep one shared `[data-tone]` block; don't copy-paste per component family.
- Don't hardcode hex that duplicates an existing token (doc/importance palettes
  should reference module/status tokens, not re-spell their hex).
- Every hardcoded shadow/chrome color must have a dark-theme counterpart, or use
  `rgba(var(--theme-primary-rgb), …)` so it follows the accent.

---

## 9. Theme modes (implementation contract)

- **Three modes, two themes:** `system` / `light` / `dark`. `system` resolves via
  `prefers-color-scheme`. Base `:root` = light; dark is the override layer.
- **Storage:** two `localStorage` keys — one for mode
  (`‹project›.themeMode.v1`), one for accent (`‹project›.accent.v1`).
- **Applied via** attributes on `<html>`: `dataset.themeMode` (raw) +
  `dataset.theme` (resolved light/dark); accent as inline `--theme-primary` /
  `--theme-primary-rgb`.
- **System follow:** a `matchMedia("(prefers-color-scheme: dark)")` listener
  live-updates only while mode = `system`.
- **FOUC guard:** an early IIFE (`theme-bootstrap.js`) sets the attributes +
  accent from `localStorage` **before paint**. It necessarily duplicates the
  storage-key strings and validators from `theme.js` — keep the two in sync
  (single source for the key names if possible).
- **Accent system:** a few preset swatches + a free color picker; because
  `--blue: var(--theme-primary)`, changing the accent recolors the whole brand
  cascade live.

---

## 10. Product flow diagram design

The product flow/structure diagram is the visual map of the Product Module
Registry. Spec:

- **Nodes** = modules from the registry. Each node shows: icon/dot, title, stage
  label + progress %, a progress bar. Node fill/border uses the module color
  (§11). Node click → select module (drives the detail panel) or open drawer.
- **Edges** = relationships from a `product_links` list of `[from, to, tone]`,
  with tones for `main` / `soft` / `control`-plane links. Render as SVG paths
  between fixed node anchors.
- **Zones/regions** = group modules into a small number of bands (example: a main
  product chain · a control-plane · a project-system zone). Region labels carry a
  one-line note. Unassigned modules default to a catch-all region.
- **Stage derivation:** compute a node's stage (`not-started / active / risk /
  done`) from `progress` + blocked/risk keywords; summarize counts under the map.
- **Layout views (optional):** allow switching graph layouts; persist the choice
  in `localStorage`. Provide a static reflow fallback below the wide breakpoint
  (drop the absolutely-positioned SVG to a stacked grid).
- **One graph implementation.** If the Overview shows a mini map, it is a Mirror
  that reuses the same node data + module colors — not a second graph renderer
  with its own status logic.

---

## 11. Product module color definition

**One fixed color per module across every page.** Define it once via a
`[data-product="‹key›"]` selector block that sets local `--tone` / `--tone-bg`
from the `--module-*` tokens; every module card/node/bar reads `var(--tone)`.

Reach the same six (N) tokens through a small set of attribute aliases that all
point at the *same* tokens: `data-product` (nodes), `data-tone` (cards),
`data-from`/`data-to`/`data-module` (edges/transitions). Do not invent per-page
module colors.

**Example mapping (replace keys/hues per project):**

| Module key (example) | Token | Light hex |
|---|---|---|
| `web` (primary product) | `--module-blue` | `#1a73e8` |
| `app` (desktop lane) | `--module-green` | `#34a853` |
| `plugin` (extension lane) | `--module-purple` | `#7c4dff` |
| `sync` (shared account layer) | `--module-cyan` | `#12b5cb` |
| `site` (public distribution) | `--module-yellow` | `#b56f00` |
| `admin` (control plane) | `--module-red` | `#ea4335` |

The module's `visual` token (color + icon) should live in the Product Module
Registry, so a new module gets a color by registry entry, not a CSS edit + a JS
map edit.

---

## 12. Layout rules & breakpoints

**Shell:** `display:grid; grid-template-columns: ‹rail›px minmax(0,1fr)` — fixed
rail + fluid main. Main content caps at a max-width (example 1480px), centered,
with consistent page padding.

**Primitives:**
- `.surface` card = `background var(--surface)` + `1px solid var(--line)` +
  `border-radius var(--radius)` + `box-shadow var(--shadow)`; `.pad` = inner
  padding (example 18px).
- **Module card recipe:** `border-top: 4px solid var(--tone)` + tinted
  `linear-gradient(--tone-bg → surface)` + soft shadow + hover lift.
- **Two-column split:** `grid-template-columns: minmax(0,1fr) minmax(‹min›,.‹frac›fr)`
  with `align-items:start`; the right column is a sticky aside.
- **Grids:** KPI = `repeat(4,minmax(0,1fr))`; self-reflowing card grids =
  `repeat(auto-fit,minmax(‹min›,1fr))`.

**Spacing & radius:** keep a small, consistent scale (gaps clustering around
4/8/12/14/18; radius via `--radius` + `999px` for pills). Don't scatter ad-hoc px.

**Breakpoints (desktop-first; example values):**

| Max-width | What changes |
|---|---|
| ~1460px | wide SVG/metro layouts drop to a static node grid |
| ~1180px | all 2-col layouts → single column; asides become static; KPI → 2-col |
| ~860px | rail collapses to a horizontal scrollable top nav; nav titles/handles hidden |
| ~620px | phone tier: KPI → 1-col; type scale shrinks; secondary meta columns hidden |

---

## 13. Docs library structure

A lightweight file-manager, **hybrid tree + derived taxonomy**:

- **Tree side (serve mode):** real recursive folders via `/api/tree`, a two-pane
  Miller layout (folder list + one-level tree) + breadcrumb/up. Browsable roots
  are **whitelisted** (project docs, workflow docs, skill/agent roots, package
  docs, design dir); reject path traversal.
- **Curated side:** recommendation groups + root shortcuts from the generated
  state (`doc_hub.groups` / `.roots`).
- **Classification (computed client-side, not folders), two axes:**
  - **family** → e.g. rules / skill / workflow / system / reference (with a label
    + theme color each).
  - **importance** → e.g. must-read / required / system-level / reference (regex
    on path). Themed colors per family/importance.
- **Doc types:** Folder, Markdown, rule files, agent config (TOML), JSON, text —
  each with an icon.
- **Panels:** toolbar (mode pill + search + refresh) · recommendations · folder
  3-pane · inspector (meta grid + outline) · preview + fullscreen reader.
- **Actions:** open raw, copy absolute path (built from `repo_root` + relative
  path), reveal in OS file manager, refresh. Serve-only features show a clear
  "needs local server" state under `file://`/static.
- **No orphan renderers:** remove any render fn whose DOM target doesn't exist.

---

## 14. Skill / Agent management structure

Show skills/agents as an **executable knowledge base**, not a name list. The
generator emits a normalized `skill_agent_registry` with per-entry fields:
name · type (Skill/Agent) + source subtype · category + category color · scenario
· function description · inputs · outputs · usage frequency · related workflow ·
related docs · maintenance status · last-updated · short note · trigger examples ·
path + tracked/local-only/modified/mirror-missing status.

**Three cards:** summary counts (incl. source-completeness vs display-completeness)
· category jump index · catalog board (category sections × entry cards with the
full field grid + copy-name + doc buttons).

**Grouping — expose two axes:**
- **Management grouping (primary, matches the operator's mental model):**
  `frequent` (curated high-frequency entries — same source as the Overview
  quick-skill strip) · `system` (governance/infra) · `sync` (cross-surface sync
  gates) · `dev` (feature/bugfix/build). Adapt the bucket names per project.
- **Functional category (secondary):** governance / automation / quality /
  authoring / feature / bugfix / reference.

Show a registry conclusion: `resolved` when every entry has usable fields (after
extraction or deterministic generation), `needs-action` only when a field needs
human judgment. Generated backfill is allowed and completes the entry — surface it
as a source-backfill note (so source files can improve later) rather than leaving a
permanent missing-field state. The "frequent/curated" list must be **single-source**
with the Overview mirror.

---

## 15. Workflow management structure

Workflow management can be either **(a) a dedicated tab** or **(b) distributed**
across existing pages — pick one and state it; do not imply a tab that doesn't
exist. The recommended 11-tab set (§4) uses the **distributed model**: per-module
workflow steps + copyable prompts live in the Product-structure detail panel,
workflow skills/agents live on the Skill/Agent page, and commands live on the
Ops manual. Add a standalone Workflow tab only if those three can't carry it.

Whichever model you choose, the **structure** below is what a workflow surface
(tab or distributed cards) must expose so the operator can route a requirement
without remembering command syntax:

- **Entry-point cards** — one per workflow lane (example: feature / bugfix /
  roadmap / ship / sync / release-log). Each card shows: lane name, when-to-use,
  the canonical invocation, and a copyable prompt template.
- **Per-workflow prompt template** — a fill-in-the-blanks block (goal / scope /
  constraints / expected output) the operator can copy into an executor.
- **State awareness (optional)** — if the project has a workflow state machine
  (e.g. `dev_log.md` status), show the current status + suggested next step.
- **Boundary:** this surface *routes and reminds*; it does not run ship/merge and
  does not edit workflow state files. It links to the docs (Docs library) and the
  task surface (Task progress) rather than restating their content.

---

## 16. Deployment record structure

Deployment answers **"where is it running, what version, what happened"** —
distinct from Testing ("what proof exists") and Release ("what changed").

Recommended `deployment` schema:

```json
{
  "deployment": {
    "summary": { "avg_progress": 0, "online_version": "", "overall_status": "" },
    "flow": { "targets": [], "steps": [], "assets": [], "gates": [] },
    "modules": [
      { "key": "‹module›", "status": "deployed|deploying|ready|failed|rollback|pending|not_deployed",
        "progress": 0, "environment": "", "url_or_route": "", "ops_target": "",
        "last_deployed_at": "", "version": "", "platform": "", "branch": "",
        "next": "", "issues": [], "testing_status": "" }
    ],
    "records": [
      { "date": "", "module": "", "summary": "", "environment": "", "platform": "",
        "version": "", "commit": "", "status": "", "testing_status": "" }
    ]
  }
}
```

**Cards:** summary grid · flow board (targets/steps/assets/pre-deploy gates) ·
per-module cards (with the test-status Shared-Widget) · records list · env+issues
aside (one consolidated card — don't restate the module fact-grid). Module status
uses the deployment status palette (§8). Cross-link to the Ops manual's
build/deploy commands (the "how"), since this page is the "what."

---

## 17. Testing result structure

A dedicated testing page (don't bury test health inside Deployment or Release).
Recommended schema:

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
    "modules": [], "records": [], "pipelines": [], "report_sources": []
  }
}
```

**Cards:** summary grid · per-module test cards (status/conclusion/latest/failures/
pipeline/duration/category pills/report) · records list · pipeline+reports aside.
The generator may derive records from release-log `Verification` fields + known
report paths, but **CI stays `not queried` unless a real current result is
queried** — never report green from a workflow file's mere existence. Test
evidence informs the operator; it must not auto-mark a release ready.

**Testing owns the cross-page test-status badge** (a single shared function);
Deployment and Release embed that badge as a Shared-Widget, never a second card.

---

## 18. Release record structure

Structured release-log entries:
date · product line · branch/commit · user-visible change · developer/system delta
· verification · risk/follow-up.

**Cards:** overall release cards · per-module release cards (with test
Shared-Widget) · detailed time-ordered rows. Parse from a `release-log.md` source
of truth via a release-log skill; the dashboard renders, it does not author
release state. In serve mode, allow opening the raw release-log file.

---

## 19. Operations manual structure

A human-facing "how to run this" surface **and** a `README.md` in the dashboard
folder (so a fresh copy of the folder has an entry point — don't rely on an
external doc). Cover:

- **Open / run:** `file://` (static fallback) vs the local server
  (`‹pnpm dashboard:serve›`, 127.0.0.1, example port); `‹pnpm dashboard›` to
  regenerate state; the manual refresh button.
- **Command cards, grouped:** start service · open pages · update code · build &
  deploy · logs & status · stop & FAQ. Each command is copyable.
- **Live process control (the one "live" card):** start/open/stop/refresh the dev
  server through the serve API; show port/PID/source/logs. Route product targets
  through an **ops target** (not a hardcoded dev port) so the dashboard can detect
  when a port is owned by another project and show the ops panel instead of
  opening a wrong URL.
- **Boundary:** the Ops manual holds the *commands* ("how"); the Deployment/Testing
  pages hold the *state* ("what"). They cross-link; they don't restate each other.
- **Portability:** build absolute paths from `repo_root`; **never** bake a
  machine-specific absolute path (e.g. `/Users/you/...`) into static HTML.

---

## 20. Card-adding rules

When a new piece of information arrives, route it with this procedure (don't
"just put it on Overview"):

1. **Classify the data domain** and find its **Owner** page (§6 table in
   `BOUNDARIES.md`).
2. If it's a **new module attribute** → add it to the **Product Module Registry**;
   it surfaces on the module detail card. Never add a second module table.
3. If it's a **new module** → add a registry key + a color token; the track/flow
   pick it up. No CSS-per-module edit.
4. If it's a **new fact in an existing domain** (deploy/test/release/git/task) →
   it flows from that domain's generated source onto the Owner page.
5. If the operator **wants it visible on Overview** → add a **Mirror** (summary +
   link reusing the Owner's summary fn), never a cloned detail card.
6. Fill all six card fields (§7), **especially "Excludes."**
7. Update `BOUNDARIES.md` (and `TEMPLATE.md` if the pattern is reusable); the sync
   skill verifies alignment.

---

## 21. Anti-duplication & boundary rules

1. **Owner is unique** — one detail renderer per domain; new detail only on the Owner.
2. **Mirror trio** — summary cards must reuse the Owner summary fn, link to the
   Owner, and not clone the detail renderer.
3. **Shared-Widget single source** — cross-page status badges are one shared
   function owned by the data Owner.
4. **One registry per domain** — modules/testing/skills; new surfaces read the
   registry; no second hard-coded module table (enforced by the machine contract).
5. **Status vocabulary is single-source** — one shared `statusMeta` + the 7-color
   palette; don't redefine status maps per file.
6. **Colors don't cross semantics** — module colors mean modules; status colors
   mean status; nav never uses module colors.
7. **Overview may re-display richly — but by reuse (shared renderer/data/vocab),
   never by forking a second implementation.** On-screen re-appearance is not
   duplication; a forked implementation is.
8. **Commands vs state are separate pages** — the Ops manual ("how") and the
   delivery pages ("what") cross-link, not embed each other.
9. **One file per page** — render module ↔ page is 1:1; no grab-bag module.
10. **Delete orphans** — render fns with no DOM target and state keys with no
    consumer are removed (or explicitly labeled machine-only).

---

## 22. Data-source rules

- **Generated (live from repo):** git state, dev activity, skill/agent registry,
  docs tree, roadmap counts, release rows, branch policy, task aggregation,
  computed signals/overview. Never hand-edit these in the generated file.
- **Manual (authored base):** priority/focus rows, KPI labels, the Product Module
  Registry base, deployment registry, testing base, product links, branch
  workflow. Edited in `dashboard-state.json` (operator-facing rows/links/prompts).
- **Hybrid:** module registry + testing — authored base, generator enriches (e.g.
  injects test status). The generator's final snapshot spreads the authored JSON,
  then overwrites/adds the live keys.
- **Source-of-truth map (keep one):** `BOUNDARIES.md` §"data-source per card"
  table: state key → source (git / dev_log / release-log / doc tree / manual) →
  consuming surface.
- **Portability:** the generated state holds a machine `repo_root`; that's why it
  is git-ignored and regenerated per machine. Avoid baking machine paths anywhere
  tracked. Prefer glob scans over hardcoded allowlists (so new roadmap manifests /
  docs are auto-discovered).

---

## 23. Machine contract

Add a machine-facing Markdown doc (example
`docs/workflow/project/dev-dashboard.md`) that tells AI agents:
where the dashboard lives, how to refresh it, what sources feed it, **what may be
auto-updated** (skill docs, dashboard HTML/CSS/JS, generator/server, project
workflow docs, the template, release-log via the release skill, and authored rows
in the state JSON) and **what is operator-only** (product priority, long-lived
branch creation, release-gate decisions, risk acceptance, roadmap authorization,
ship/merge status). Include: treat the generated state as disposable; no second
module table; no baked dev ports; CI honesty (`configured` ≠ `passed`); copy
absolute paths from `repo_root`; if the rendered board and the contract disagree,
update both in one change.

---

## 24. Sync skill

Add a project skill (example
`.teams/skills/‹project›-dev-dashboard-sync/SKILL.md`), exposed to each local AI
runtime via symlinks (e.g. `.claude/skills/…`, `.codex/skills/…`). In one run it:
(1) refreshes the Overview snapshot, (2) updates the machine contract when behavior/
sources change, (3) updates **this template** when a pattern becomes reusable,
(4) refreshes testing status, (5) refreshes the skill/agent registry. It wraps the
generator (doesn't duplicate parsing), applies factual Markdown updates directly,
and reports `needs-review` only for operator decisions.

Recommended receipt fields:

```text
Overview sync: current | refreshed | stale | blocked
Machine doc:   aligned | updated | needs-review
Template doc:  aligned | updated | needs-review
Boundaries:    aligned | updated | needs-review
Skill-Agent KB / Testing / Release-log latest / Follow-up
```

> Note: the sync skill keeps the template *fresh*; it does not by itself make the
> template *complete*. Completeness against this 25-section structure is an
> authoring task (this file).

---

## 25. Adaptation checklist

When creating a new dashboard from this template:

- [ ] Define product modules (N keys) + assign each a color token; put them in a
      Product Module Registry.
- [ ] Define long-lived branch topology + per-branch policy (goal / allowed /
      forbidden / upstream / downstream / drift judgement).
- [ ] Decide generated vs manual state; choose roadmap-manifest + release-log
      formats; choose skill/agent roots; define the docs whitelist.
- [ ] Implement `generate-state` (Node stdlib, zero deps) before polishing UI;
      keep generated state git-ignored.
- [ ] Build the shell: nav registry (single source) + grouped tabs + hash routing
      + theme (system/light/dark + accent + FOUC guard).
- [ ] Implement the color tokens + 7-status palette + `[data-product]` module
      colors; use `--radius` (don't hardcode).
- [ ] Build pages **one render file per page**; declare each page's Owner domain
      in `BOUNDARIES.md`; apply the Owner/Mirror/Shared-Widget model.
- [ ] Add the product-flow diagram, deployment/testing/release structures, docs
      library, skill/agent registry, workflow entries, and the ops manual +
      `README.md`.
- [ ] Add the machine contract + the sync skill; expose the skill to the intended
      AI runtimes; add a release-log entry for the dashboard itself.
- [ ] Verify: `node --check generate-state.mjs` + run the generator + open the
      served board on its example port.
