# Discovery Review — web-plugin-map-contract-reconcile

| 字段 | 值 |
|---|---|
| Feature | `web-plugin-map-contract-reconcile` |
| 日期 | 2026-05-21 |
| 执行者 | Codex (`feature-plan` inline) |
| 外部调研 | No external research required |

## Problem Framing

Later Web rows currently risk planning against stale package names and fake readiness signals:

- `docs/PLUGIN_MAP.md` still models Todo, Pomodoro, and Habits as standalone planned plugins even though the live repo uses `packages/plugin-productivity/`.
- `docs/PLUGIN_MAP.md` does not register the real `packages/plugin-project/` package and does not make the Web planning status of `plugin-console`, `plugin-calendar`, and related packages explicit enough for later rows.
- `docs/planning/sub-prds/web/dev-plan.md` still claims several packages are already Stable and that `manifest.windows.web = true` is "in place", but the current manifests do not support that statement.
- `ADR-0006` already chose the hybrid rule, so Web planning must distinguish shared contract owners from the future browser host shell instead of assuming source reuse or standalone Web-only plugin renames.

## Source Evidence

- `docs/PLUGIN_MAP.md`
  - lists `todo`, `pomodoro`, and `habits` as planned standalone plugins
  - omits `project` from the plugin table
  - does not describe current Web build eligibility semantics for the real package set
- Live manifests under `packages/`
  - `packages/plugin-productivity/manifest.json`
  - `packages/plugin-console/manifest.json`
  - `packages/plugin-project/manifest.json`
  - `packages/plugin-labels/manifest.json`
  - `packages/plugin-calendar/manifest.json`
  - `packages/plugin-account/manifest.json`
- `docs/planning/sub-prds/web/dev-plan.md`
  - says `plugin-console` is already Stable
  - says `plugin-productivity` / `plugin-project` / `plugin-labels` / `plugin-calendar` / `plugin-account` are Stable and `manifest.windows.web = true`
- `docs/adr/0006-web-face-hybrid-reuse-boundary.md`
  - Web uses the hybrid rule: shared contracts and Console PRD truth, but Web-specific host shell/view-layer implementation is allowed

## Options

### Option A — Minimal `PLUGIN_MAP` row cleanup only

Update just the plugin table entries and stop there.

Pros:
- Smallest edit footprint.
- Fixes the most obvious stale names.

Cons:
- Leaves Web build eligibility ambiguous.
- Leaves the Web dev-plan free to keep asserting false `manifest.windows.web` readiness.
- Does not clearly separate the shared Console package boundary from the future browser host shell.

### Option B — Reconcile `PLUGIN_MAP` plus one authoritative Web planning anchor

Update `docs/PLUGIN_MAP.md` to register the real package owners, add an explicit Web planning contract table, and align `docs/planning/sub-prds/web/dev-plan.md` to that authority.

Pros:
- Fixes the naming drift and the readiness drift together.
- Gives later rows one canonical place to answer package ownership and current Web eligibility.
- Preserves the docs-only scope and follows `ADR-0006`.

Cons:
- Leaves broader non-Web package-map debt for later cleanup.
- Requires careful wording so package-local progress is not confused with Stable dependency authority.

### Option C — Broad PRD/dev-plan rewrite across all Web planning docs

Sweep `docs/PLUGIN_MAP.md`, Web PRD, Web dev-plan, roadmap notes, and related plugin docs in one row.

Pros:
- Most complete cleanup.
- Reduces the chance of leftover stale text in adjacent docs.

Cons:
- Too broad for this W1 docs/contracts row.
- Higher risk of trampling unrelated user edits in a dirty worktree.
- Blurs a contract-reconciliation task into a roadmap rewrite.

## Recommendation

Choose **Option B**.

That keeps this row sharply scoped while still solving the real blocker:

1. Register the real package owners that later Web rows must target.
2. Replace stale standalone Todo/Pomodoro/Habits plugin assumptions with a canonical capability-to-package mapping.
3. Make current Web build eligibility explicit without pretending that runtime manifests already declare browser readiness.
4. State clearly that `plugin-console` is the shared Console contract package, while the future browser host shell is a later Web row governed by `ADR-0006`.

## Contract Rules To Freeze

1. `@repo/plugin-productivity` is the canonical owner for Todo, Pomodoro, and Habits capability planning.
2. `@repo/plugin-project`, `@repo/plugin-labels`, `@repo/plugin-calendar`, and `@repo/plugin-account` are real package boundaries that must be reflected in registry docs.
3. `plugin-console` is a shared Console contract/package boundary, not the same thing as the future Web host shell.
4. Absence of `windows.web` in current manifests means later rows must treat Web enablement as explicit future work, not an already-landed fact.
5. `docs/PLUGIN_MAP.md` remains the dependency authority even when package-local docs report `READY_FOR_VERIFY` or other local progress.

## Risks

- Some adjacent package docs still use older local workflow formats, so future reviewers may be tempted to over-trust package-local status instead of `docs/PLUGIN_MAP.md`.
- This row does not reconcile every live package in the repo; it fixes the package truth required to unblock the Web roadmap.
- Later Web implementation rows may discover additional browser-only exceptions that still need explicit deviation notes under `ADR-0006`.

## Open Questions

- Should a later docs-only cleanup reconcile remaining non-Web package-map drift such as other live packages that are outside this roadmap slice?
- Should the future Web host package expose its own package-map row once `web-release-site-archive-vite-shell` creates the canonical browser host boundary?
