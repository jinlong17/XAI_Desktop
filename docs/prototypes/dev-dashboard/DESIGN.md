# Dev Dashboard — Design & Upgrade Plan

> **Status:** Proposed design (2026-05-30). Authority for upgrading the dev-dashboard
> from a static display page into a **local project control console**.
> Quick-start / how-to-open lives in `README.md`; this file is the *why* and the *plan*.
> Governance authority: [`docs/adr/0013-branch-sync-governance.md`](../../adr/0013-branch-sync-governance.md) (Proposed).

---

## 1. Purpose

The dev-dashboard is a **solo-developer cockpit**, not a slide. It exists to answer
four questions at a glance (the "4-question cockpit", per the 2026-05-30 review round):

1. **现在做什么** — the single next action.
2. **在哪条线做** — which branch / product line.
3. **用哪个 workflow / skill** — the entry to run.
4. **做到什么状态了** — real progress, not a hand-typed label.

Design rule: **少说明,多状态;少介绍,多操作入口.** The board surface must not carry
meta-explanations ("中文优先 / 个人开发者 / Gemini 风格" etc.) — the operator already
knows. Every pixel is either a *fact* or an *action entry*.

## 2. Origin — three-expert synthesis

This design merges three independent reviews (2026-05-30): a senior-PM agent, a
full-stack-architect agent, and Codex. They converged on:

- The board is a **cockpit, not an explainer**.
- **Auto-track = yes, but split machine facts from human judgment** (the load-bearing rule).
- Pipeline = **generator → `dashboard-state.json` (manual overrides) → `state.generated.js` → HTML**, with **no `file://` fetch** (see §4).
- **Branch ≠ product line** (see §6).
- Six product lines are **layered, not flat**; admin-dashboard is a separate control plane.

The one disagreement — number of long-lived branches — was decided by the operator
(+ Codex): **keep 5 long-lived lanes** (`web` / `desktop-next` / `desktop-plugin-next`
/ `dev` / `release/desktop/<version>`). The agents' "collapse to 3" is noted and overruled.

## 3. Core principles

| Principle | Meaning |
|---|---|
| **Auto facts, human judgment** | The console *reads and reminds*; it never auto-edits roadmap, auto-merges, or auto-decides ship/priority. AI skills may *suggest*; the operator confirms. |
| **Serve is the real-tool carrier** | The "open a doc / browse the tree / search" capability requires a local server; `file://` cannot read directories or run `rg`. The static snapshot stays as a fallback. |
| **Branch ≠ product line** | Branches serve integration risk + release cadence; product work happens on short `codex/<area>/<feature>` branches. Divergence between long lines is expected, not drift. |
| **Generated state is disposable** | `state.generated.js` is a per-machine build artifact — it must NOT be tracked (see §5 Phase 0). |

## 4. Architecture

### Current stack (exists today)

| File | Role | Lines |
|---|---|---|
| `scripts/dashboard/generate-state.mjs` | Reads git + skills + release-log + `dashboard-state.json` → writes `state.generated.js`. Pure Node stdlib, zero deps. | ~79 |
| `docs/workflow/project/dashboard-state.json` | **Manual overrides base** (priority, branch creation, release-gate, risk — the human-judgment fields). 9 top-level keys. | ~341 |
| `docs/prototypes/dev-dashboard/state.generated.js` | `window.XAI_DASHBOARD_STATE = {…}` — the global the HTML reads. | generated |
| `docs/prototypes/dev-dashboard/index.html` | Page skeleton only; loads generated state, stylesheet, and ordered plain scripts. | ~399 |
| `docs/prototypes/dev-dashboard/styles.css` | Dashboard visual system and responsive layout. | ~2319 |
| `docs/prototypes/dev-dashboard/js/*.js` | Vanilla browser scripts split by surface (`state`, `theme`, `overview`, `product-flow`, `docs-library`, `skill-agent`, `ops-panels`, `nav`, `main`). No build step. | ~2521 |

### `file://` constraint (already solved — keep it)

Opening the board from disk means `fetch()`/XHR are blocked. The board therefore loads
state via `<script src="./state.generated.js">` which **assigns a global**, not via a
runtime JSON fetch. Any future change must keep emitting a JS sidecar (or inline into the
HTML) — **never** read a sibling `.json` at runtime. The local server (§5 Phase 2) is what
unlocks fetch-based features (tree / md / search), and only when served from `127.0.0.1`.
The hand-authored CSS and JS files are plain relative static assets, so both `file://`
preview and `dashboard:serve` must keep serving them without a bundler or module loader.

### Data sources → board sections (auto / semi / manual)

| Source | Parseability | Feeds |
|---|---|---|
| `git` (branch, commit, `rev-list --left-right web...dev`, `log --numstat`) | trivial / reliable | branch, divergence KPI, dev-data page |
| `docs/PLUGIN_MAP.md` | cleanest (`\| slug \| dir \| status \|`) | per-plugin status counts |
| `docs/workflow/roadmap/*.md` (the ~14 with a `\| # \| Slug \| … \| Status \|` header — whitelist, not all 32) | good, fixed columns | per-line roadmap progress |
| `.teams/skills/*/SKILL.md` | trivial (dir presence) | skill registry |
| `docs/workflow/project/release-log.md` | clean (`### ` headings) | latest release entry |
| `dashboard-state.json` | authored | the manual-override fields |
| `packages/*/docs/dev_log.md` | **drifts** (3 header variants, table vs bullet) | deferred to a later phase — needs normalization first |

## 5. Upgrade plan — phased, single-commit each

> Run **one phase at a time, confirm, then next** — five phases at once is too heavy for
> a single session. Each phase is one commit. Do not push / flip Accepted / touch `dev`
> as part of this work.

### Phase 0 — prerequisite fix (do first)

- ⚠️ **`state.generated.js` is currently git-tracked → two-machine conflict source** (it
  carries machine-specific branch/commit/timestamp, and every `generate` run dirties the
  tree). Fix: `git rm --cached docs/prototypes/dev-dashboard/state.generated.js` + add it
  to `.gitignore`. Each machine regenerates locally.
- Generator's `ahead_behind` currently queries `origin/web...HEAD` (wrong). Change to
  `git rev-list --left-right --count origin/web...origin/dev` → real web↔dev divergence.

### Phase 1 — 4-question cockpit + real per-line status

- Homepage = the 4 questions (§1). Delete vanity counters (产品6 / 分支4 / skill5) and the
  meta-explanation text.
- Wire `skillGrid` to `window.XAI_DASHBOARD_STATE.skills_found` (drop the hardcoded array).
- web↔dev divergence KPI as a real number (e.g. 147/184), labeled "两条独立专注线,差异正常"
  — **not** a red alert.
- Generator gains parsers (Node stdlib): `PLUGIN_MAP.md` table + whitelisted roadmap
  manifests → status counts. Parse failure degrades to `[]` (HTML fallback), never throws.
- Six lines rendered in **3 zones**: 主产品链 (Web→Desktop App→Plugin/Widget→Account Sync)
  · Admin Dashboard as a separate **Control Plane** · 项目系统 (workflow / skill / branch /
  release). Per-line status comes from the parsed counts, not a hand-typed string.
- `generated_at` staleness badge; `pnpm dashboard` script.

### Phase 2 — local server + document library (the "real tool" leap)

- `scripts/dashboard/serve.mjs` — pure Node stdlib HTTP, **127.0.0.1 only**, no deps. On
  start: run `generate`. Routes: `/` (board), `/api/tree?dir=` (whitelisted: `docs/`,
  `docs/adr`, `docs/workflow`, `.teams/skills`, `.codex/agents`, `packages/*/docs`),
  `/api/file?path=` (render md; path must stay inside the whitelist — reject traversal),
  `/api/search?q=` (`rg`, degrade to `grep`), `/api/refresh` (re-run generate).
  `pnpm dashboard:serve`.
- New **"文档库"** page (serve-only; `file://` shows a "needs serve" hint): left dir-tree +
  center md renderer (render, not summarize) + top `rg` search + actions (open / copy path /
  Finder open / refresh). **Current-branch-linked docs** (on `web` → Web/ADR/D3; on `dev` →
  Desktop RC/G1/native). Skill/Agent registry (trigger / purpose / path / tracked?).

### Phase 3 — dev-data page

- Separate **"开发数据"** page from pure git: today's commits · 7-day trend · added/deleted
  lines (`--numstat`) · changes by directory (docs / apps/web / apps/desktop / .teams/skills)
  · recent commits by branch · uncommitted file count · docs-vs-code ratio · last push time ·
  skill changes. Sources: `git log --since --numstat`, `git diff --stat`, `git status --short`.
  (Cadence is real — ~443 commits/7d as of 2026-05-30 — so this page has signal.)

### Phase 4 — branch-policy → ADR-0013 D2 + board consumes it

- ADR-0013 D2: per long-lived branch add **目标 / 允许变更类型 / 禁止变更类型 / 上下游 /
  预期 drift 判据** (judge by "is the thing that *should* be shared being held up", NOT by
  commit count). `dev` having more commits than `web` is explicitly **expected** (Tauri /
  native / signing / packaging). Also add the 6 per-area short-branch conventions
  `codex/{web,desktop,plugin,sync,site,admin}/<feature>`; mark admin-dashboard as **Control
  Plane** in D1.
- Optional machine-readable `docs/workflow/project/branch-policy.json` consumed by generator
  + board; ADR points to it.
- Board branch zone shows the policy (goal / allowed / forbidden / drift-expected? / last
  D3·merge·release), **not** "who has more commits = anomaly".

### Phase 5 — hooks (last, optional, careful)

- ⚠️ **Do not use `post-commit`** — it's already taken by `scripts/cowork/git-post-commit`,
  and at ~443 commits/7d a post-commit refresh is meaningless thrash.
- Use **`post-merge` + `post-checkout`** to refresh the snapshot (branch-switch / merge is
  exactly when "context changed, swap the linked docs" should fire — serves Phase 2/4).
- For two-machine consistency: `.githooks/` + `git config core.hooksPath .githooks`, but
  **migrate the existing cowork `post-commit` into `.githooks/` as a chained call** or it
  gets shadowed. Document in `usage-guide.md`.
- Safest start: **no hook at all** — serve runs `generate` on start + a manual refresh button.

## 6. What stays manual (never auto-decided)

Product priority · whether something is truly `READY_TO_SHIP` · creating a long-lived branch ·
entering a release · whether a requirement is worth doing. The console surfaces *evidence*;
the operator decides. These map to the `manual_fields` already declared in
`dashboard-state.json`.

## 7. References

- [`docs/adr/0013-branch-sync-governance.md`](../../adr/0013-branch-sync-governance.md) — D1 product lines, D2 branch topology (+ branch-policy per Phase 4), D3 web↔desktop sync gate, D5 two-independent-focus-branches.
- [`docs/workflow/project/handbook.md`](../../workflow/project/handbook.md) — solo-dev navigation handbook.
- [`docs/workflow/project/usage-guide.md`](../../workflow/project/usage-guide.md) — workflow how-to.
- `README.md` (this folder) — how to open / run the board.
- `scripts/dashboard/generate-state.mjs` · `docs/workflow/project/dashboard-state.json` — the existing generator + manual-overrides base.
