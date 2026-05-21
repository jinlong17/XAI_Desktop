# web-plugin-map-contract-reconcile — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Option B — reconcile `docs/PLUGIN_MAP.md`, add an explicit Web planning contract table, and align `docs/planning/sub-prds/web/dev-plan.md` to that authority |
| Review Doc Path | `docs/reviews/web-plugin-map-contract-reconcile/20260521-discovery-review.md` |
| Review Date/Version | 2026-05-21 |
| Feature Type | W1 docs/contracts reconciliation |
| ADR Anchor | `docs/adr/0006-web-face-hybrid-reuse-boundary.md` |

## Frozen Assumptions

- This feature is docs-only. It must not change plugin runtime behavior, manifests, registry code, or host wiring.
- `ADR-0006` is the governing stance: Web may rewrite its host shell and browser view layer, but later rows must share contracts and Console PRD behavior.
- `plugin-console` is the shared Console contract/package boundary for Web planning, not proof that the current package can be imported unchanged into a browser host.
- Todo, Pomodoro, and Habits are capability modules owned by `@repo/plugin-productivity`, not real standalone plugin packages in the current repo.
- Absence of `manifest.windows.web` in current manifests means "not yet declared runtime-ready for Web", not "forbidden forever". Build eligibility must be earned in later Web rows.
- `docs/PLUGIN_MAP.md` remains the dependency authority; package-local `dev_log.md` progress does not by itself promote a dependency to Stable.

## Scope Boundary

This feature owns only:

- `docs/reviews/web-plugin-map-contract-reconcile/`
- `packages/web-plugin-map-contract-reconcile/docs/`
- `docs/PLUGIN_MAP.md`
- `docs/planning/sub-prds/web/dev-plan.md`

It must not modify:

- `apps/web/`
- any `packages/plugin-*/src/` implementation files
- `packages/core/` or `packages/core-data/`
- `apps/desktop/` or `apps/desktop/src-tauri/`

## Dependency Overview

- Upstream source: `docs/reviews/web-plugin-map-contract-reconcile/20260521-roadmap-seed.md`
- Governing ADR: `docs/adr/0006-web-face-hybrid-reuse-boundary.md`
- Authority docs touched: `docs/PLUGIN_MAP.md`, `docs/planning/sub-prds/web/dev-plan.md`
- Downstream Web rows relying on this truth: `web-release-site-archive-vite-shell`, `web-console-host-router`, `web-todo-first-slice`, `web-productivity-habits-pomodoro`, `web-project-label-calendar`
