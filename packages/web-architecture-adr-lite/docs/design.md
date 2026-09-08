# web-architecture-adr-lite — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Option C — hybrid rule: Web-specific shell/view layer with shared contracts and Console UI truth |
| Review Doc Path | docs/reviews/web-architecture-adr-lite/20260521-discovery-review.md |
| Review Date/Version | 2026-05-21 |
| Feature Type | W0 ADR-lite / docs-only architecture decision |
| ADR Record | docs/adr/0006-web-face-hybrid-reuse-boundary.md |

## Frozen Assumptions

- This slice resolves an architecture conflict only; it does not start Web implementation.
- Web keeps the clean rewrite at host shell and browser view-layer scope.
- `ADR-0003` remains directionally valid for shared contracts, but Web is narrowed by `ADR-0006`.
- `docs/planning/sub-prds/console/PRD.md` remains the UI truth source for shared module IA and interaction behavior.
- Later Web rows must document any intentional browser-only deviation from Console PRD.

## Scope Boundary

This feature owns only:

- `docs/adr/0006-web-face-hybrid-reuse-boundary.md`
- `docs/reviews/web-architecture-adr-lite/`
- `packages/web-architecture-adr-lite/docs/`
- minimal Web planning reference updates required to point at the accepted ADR

It must not modify:

- `apps/web/`
- `packages/plugin-*` runtime code
- `packages/core/`
- `packages/core-data/`
- `apps/desktop/` or `apps/desktop/src-tauri/`

## Dependency Overview

- Upstream source: `docs/reviews/web-architecture-adr-lite/20260521-roadmap-seed.md`
- Context docs: `docs/adr/0003-three-faces-architecture.md`, `docs/planning/sub-prds/web/PRD.md`, `docs/planning/sub-prds/console/PRD.md`
- Downstream rows: all `web-ticktick-parity` implementation rows, especially `web-release-site-archive-vite-shell`, `web-console-host-router`, `web-sync-blob-driver`
