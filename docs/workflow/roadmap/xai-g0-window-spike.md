# Roadmap Manifest — xai-g0-window-spike

- Roadmap Source: docs/planning/execution/G0-window-spike.md
- Init Path: execution-pack
- Generated: 2026-05-19
- Default Automation Mode: D-Codex
- Default Dependency Semantics: shipped
- Default Verify Cross-vendor: yes
- Wave Concurrency Cap: 1
- Dispatch: serial inline Codex conductor
- Manifest Review: DEFERRED (unattended run; see docs/workflow/roadmap/xai-v1.deferred-gates.md)

## Features

| # | Slug | Source | Depends On | Dep Semantics | Status | Automation Mode | Verify Cross-vendor | Last Run | Note |
|---|------|--------|------------|---------------|--------|-----------------|---------------------|----------|------|
| 1 | window-ground-truth | docs/planning/execution/G0-window-spike.md §G0.1 | — | — | READY_TO_SHIP | D-Codex | yes | 2026-05-19 | READY_TO_SHIP 2026-05-19 (Codex serial inline; build commit `3b571f6`) · G0.1 evidence anchor complete. Deferred gates recorded in docs/workflow/roadmap/xai-v1.deferred-gates.md |
| 2 | grid-window-prototype | docs/planning/execution/G0-window-spike.md §G0.2 | window-ground-truth | ready_to_ship | BLOCKED | D-Codex | yes | 2026-05-19 | PATCHED 2026-05-19 (commit `14e04c2`) after user reported `+ New Grid` did not create a native window; automated checks pass, but human runtime confirmation is required before READY_TO_SHIP. |
| 3 | click-through-matrix | docs/planning/execution/G0-window-spike.md §G0.3 | grid-window-prototype | ready_to_ship | BLOCKED | D-Codex | yes | 2026-05-19 | BLOCKED 2026-05-19 · Safe prep matrix created; real macOS click-through evidence required. Deferred gates and incident recorded. |
| 4 | finder-dnd-path | docs/planning/execution/G0-window-spike.md §G0.4 | grid-window-prototype | ready_to_ship | BLOCKED | D-Codex | yes | 2026-05-19 | BLOCKED 2026-05-19 · Safe prep matrix created; real Finder drop path evidence required. Deferred gates and incident recorded. |
| 5 | spaces-multimonitor-matrix | docs/planning/execution/G0-window-spike.md §G0.5 | click-through-matrix, finder-dnd-path | deferred_manual | BLOCKED | D-Codex | yes | 2026-05-19 | BLOCKED 2026-05-19 · User override skipped blocked G0.3/G0.4 for safe prep only; real Spaces/fullscreen/multi-display evidence required. |
| 6 | mas-sandbox-dry-run | docs/planning/execution/G0-window-spike.md §G0.6 | click-through-matrix, finder-dnd-path | deferred_manual | BLOCKED | D-Codex | yes | 2026-05-19 | BLOCKED 2026-05-19 · User override skipped blocked G0.3/G0.4 for safe prep only; MAS/private-API runtime evidence required. |

## Decomposition Rationale

### R1. Source and Gate Order
This manifest is initialized directly from the current authoritative G0 execution pack, not the older Sync/Console/Web sub-PRD flow. G0 is active because no prior G0 manifest, `packages/window-ground-truth/docs/dev_log.md`, or `docs/reviews/window-ground-truth/` evidence exists.

### R2. Feature Boundaries
Each row maps one execution-pack task (§G0.1 through §G0.6) to one Workflow V2 feature. The rows are intentionally serial because G0 is a risk-closing gate and later evidence depends on the initial branch/evidence anchor and prototype.

### R3. Review Status
Manifest review normally stops for human approval. This autorun is unattended, so manifest review is explicitly deferred and recorded in `docs/workflow/roadmap/xai-v1.deferred-gates.md`. Only the low-risk, clearly bounded `window-ground-truth` feature is eligible until a human reviews this manifest or the evidence from G0.1.
