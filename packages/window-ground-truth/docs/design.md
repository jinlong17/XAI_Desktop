# window-ground-truth — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Option A — branch plus evidence directory only |
| Review Doc Path | docs/reviews/window-ground-truth/20260519-discovery-review.md |
| Review Date/Version | 2026-05-19 |
| Feature Type | Roadmap evidence anchor |

## Frozen Assumptions

- G0 is the active gate because no prior G0 manifest or window-ground-truth artifacts existed at run start.
- G0.1 may be completed without changing production code.
- Later G0 tasks must use the evidence directory for command output, screenshots, and manual matrices.
- Manifest review is deferred and must be completed by a human before treating the full G0 manifest as approved.

## Scope Boundary

This feature owns only:
- `docs/reviews/window-ground-truth/`
- `packages/window-ground-truth/docs/`
- G0 roadmap/autorun status docs
- optional `docs/PLUGIN_MAP.md` roadmap-anchor bookkeeping

It must not modify:
- `apps/desktop/src/`
- `apps/desktop/src-tauri/`
- `packages/plugin-organizer/src/`
- `packages/core/src/events/`
- `docs/contracts/*`

## Dependency Overview

- Upstream source: `docs/planning/execution/G0-window-spike.md` §G0.1.
- Downstream features: G0.2 `grid-window-prototype`, G0.3 `click-through-matrix`, G0.4 `finder-dnd-path`, G0.5 `spaces-multimonitor-matrix`, G0.6 `mas-sandbox-dry-run`.
- No runtime package dependency.

