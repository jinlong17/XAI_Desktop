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
- Gate Verdict: CONDITIONAL_GO (2026-05-19 22:54 PDT) — DMG/private path can proceed to G1; MAS signed/sandbox runtime validation remains deferred and non-blocking for G1 native foundation. G0.1-G0.5 SHIPPED 2026-05-19 on spike/window-ground-truth.

## Features

| # | Slug | Source | Depends On | Dep Semantics | Status | Automation Mode | Verify Cross-vendor | Last Run | Note |
|---|------|--------|------------|---------------|--------|-----------------|---------------------|----------|------|
| 1 | window-ground-truth | docs/planning/execution/G0-window-spike.md §G0.1 | — | — | SHIPPED | D-Codex | yes | 2026-05-19 | SHIPPED 2026-05-19 · Pushed to origin/spike/window-ground-truth. Build commit `3b571f6`; evidence anchor complete. |
| 2 | grid-window-prototype | docs/planning/execution/G0-window-spike.md §G0.2 | window-ground-truth | shipped | SHIPPED | D-Codex | yes | 2026-05-19 | SHIPPED 2026-05-19 · Pushed to origin/spike/window-ground-truth. Runtime fixed/confirmed via commits `7b7ff35`, `f65a1b5`, `a33c74d`. |
| 3 | click-through-matrix | docs/planning/execution/G0-window-spike.md §G0.3 | grid-window-prototype | shipped | SHIPPED | D-Codex | yes | 2026-05-19 | SHIPPED 2026-05-19 · Pushed to origin/spike/window-ground-truth. Default runtime hit-test passes; MAS fallback risk tracked under G0.6. |
| 4 | finder-dnd-path | docs/planning/execution/G0-window-spike.md §G0.4 | grid-window-prototype | shipped | SHIPPED | D-Codex | yes | 2026-05-19 | SHIPPED 2026-05-19 · Pushed to origin/spike/window-ground-truth. Tauri file/folder/.app/alias paths confirmed; `PRESERVE_ALIAS_PATH` in ADR-0005; commits `58c926d`, `18b48da`. |
| 5 | spaces-multimonitor-matrix | docs/planning/execution/G0-window-spike.md §G0.5 | click-through-matrix, finder-dnd-path | shipped | SHIPPED | D-Codex | yes | 2026-05-19 | SHIPPED 2026-05-19 · Pushed to origin/spike/window-ground-truth. User confirmed Grid follows across Spaces/multi-display on DELL setup. |
| 6 | mas-sandbox-dry-run | docs/planning/execution/G0-window-spike.md §G0.6 | click-through-matrix, finder-dnd-path | ready_to_ship | BLOCKED_EXTERNAL | D-Codex | yes | 2026-05-19 | BLOCKED_EXTERNAL 2026-05-19 · `mas-sandbox` compile fallback passes private-API-disabled `cargo check`; Apple Developer/signed sandbox runtime evidence deferred and decoupled from G1 DMG/private path. Not shipped — requires Apple Developer signing environment. See docs/workflow/roadmap/xai-v1.deferred-gates.md Entry 13. |

## Decomposition Rationale

### R1. Source and Gate Order
This manifest is initialized directly from the current authoritative G0 execution pack, not the older Sync/Console/Web sub-PRD flow. G0 is active because no prior G0 manifest, `packages/window-ground-truth/docs/dev_log.md`, or `docs/reviews/window-ground-truth/` evidence exists.

### R2. Feature Boundaries
Each row maps one execution-pack task (§G0.1 through §G0.6) to one Workflow V2 feature. The rows are intentionally serial because G0 is a risk-closing gate and later evidence depends on the initial branch/evidence anchor and prototype.

### R3. Review Status
Manifest review normally stops for human approval. This autorun is unattended, so manifest review is explicitly deferred and recorded in `docs/workflow/roadmap/xai-v1.deferred-gates.md`. Only the low-risk, clearly bounded `window-ground-truth` feature is eligible until a human reviews this manifest or the evidence from G0.1.

### R4. Conditional Go
2026-05-19 user confirmation closes the G0.5 Spaces/multi-display runtime blocker for the current DMG/private path. G0.6 MAS signed/sandbox runtime validation still requires Apple Developer/signing or equivalent sandbox environment, so it remains deferred as an external release gate. G1 native foundation may proceed under Conditional Go using the DMG/private path, while MAS-specific behavior stays behind `mas-sandbox` validation.

### R5. Ship Record
G0.1-G0.5 shipped 2026-05-19 by human-authorized push to `origin/spike/window-ground-truth`. G0.6 remains BLOCKED_EXTERNAL pending Apple Developer signing environment; this does not block G1 native foundation under the Conditional Go DMG/private-path decision.
