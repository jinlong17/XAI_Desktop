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
| 2 | grid-window-prototype | docs/planning/execution/G0-window-spike.md §G0.2 | window-ground-truth | ready_to_ship | IN_PROGRESS | D-Codex | yes | 2026-05-19 | W1 · Two Grid windows alpha/beta with scoped event evidence. Human ship for G0.1 deferred in unattended mode. |
| 3 | click-through-matrix | docs/planning/execution/G0-window-spike.md §G0.3 | grid-window-prototype | shipped | PENDING | D-Codex | yes | — | W2 · Requires real macOS hit-test matrix; private API comparison. |
| 4 | finder-dnd-path | docs/planning/execution/G0-window-spike.md §G0.4 | grid-window-prototype | shipped | PENDING | D-Codex | yes | — | W2 · Requires Finder drop path evidence for file/folder/App/alias. |
| 5 | spaces-multimonitor-matrix | docs/planning/execution/G0-window-spike.md §G0.5 | click-through-matrix, finder-dnd-path | shipped | PENDING | D-Codex | yes | — | W3 · Requires Spaces/fullscreen/multi-display manual matrix. |
| 6 | mas-sandbox-dry-run | docs/planning/execution/G0-window-spike.md §G0.6 | click-through-matrix, finder-dnd-path | shipped | PENDING | D-Codex | yes | — | W3 · MAS/private API/sandbox entitlements dry run; external signing review may be deferred. |

## Decomposition Rationale

### R1. Source and Gate Order
This manifest is initialized directly from the current authoritative G0 execution pack, not the older Sync/Console/Web sub-PRD flow. G0 is active because no prior G0 manifest, `packages/window-ground-truth/docs/dev_log.md`, or `docs/reviews/window-ground-truth/` evidence exists.

### R2. Feature Boundaries
Each row maps one execution-pack task (§G0.1 through §G0.6) to one Workflow V2 feature. The rows are intentionally serial because G0 is a risk-closing gate and later evidence depends on the initial branch/evidence anchor and prototype.

### R3. Review Status
Manifest review normally stops for human approval. This autorun is unattended, so manifest review is explicitly deferred and recorded in `docs/workflow/roadmap/xai-v1.deferred-gates.md`. Only the low-risk, clearly bounded `window-ground-truth` feature is eligible until a human reviews this manifest or the evidence from G0.1.
