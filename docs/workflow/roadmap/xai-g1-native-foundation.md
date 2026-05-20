# Roadmap Manifest — xai-g1-native-foundation

- Roadmap Source: docs/planning/execution/G1-native-foundation.md
- Init Path: execution-pack
- Generated: 2026-05-19
- Default Automation Mode: D-Codex
- Default Dependency Semantics: shipped
- Default Verify Cross-vendor: yes
- Wave Concurrency Cap: 1
- Dispatch: serial inline Codex conductor
- Manifest Review: DEFERRED (unattended run; see docs/workflow/roadmap/xai-v1.deferred-gates.md)
- Gate Prerequisite: G0 Go or Conditional Go
- Gate Status: CONDITIONAL_GO_UNBLOCKED (2026-05-19 22:54 PDT)

## Features

| # | Slug | Source | Depends On | Dep Semantics | Status | Automation Mode | Verify Cross-vendor | Last Run | Note |
|---|------|--------|------------|---------------|--------|-----------------|---------------------|----------|------|
| 1 | window-command-contract | docs/planning/execution/G1-native-foundation.md §G1.1 | G0 Go/Conditional Go | shipped | READY_FOR_VERIFY | D-Codex | yes | 2026-05-19 | Production command contract implemented: structured errors, snapshots, list/focus commands, core TS types, and contract docs. |
| 2 | grid-shell-organizer-content | docs/planning/execution/G1-native-foundation.md §G1.2 | window-command-contract | shipped | BLOCKED | D-Codex | yes | 2026-05-19 | Safe prep only via user override; boundary docs complete, production implementation blocked by G0/G1.1. |
| 3 | native-dnd-path-first | docs/planning/execution/G1-native-foundation.md §G1.3 | finder-dnd-path | shipped | BLOCKED | D-Codex | yes | 2026-05-19 | Safe prep only via user override; G0.4 is READY_TO_SHIP, production implementation still blocked by MAS/security-scope evidence and G0 gate status. |
| 4 | multi-grid-event-scope | docs/planning/execution/G1-native-foundation.md §G1.4 | grid-window-prototype | shipped | BLOCKED | D-Codex | yes | 2026-05-19 | Safe prep only via user override; event-scope audit complete, production implementation blocked by G0/G1.1. |
| 5 | grid-persistence | docs/planning/execution/G1-native-foundation.md §G1.5 | window-command-contract | shipped | BLOCKED | D-Codex | yes | 2026-05-19 | Safe prep only via user override; production implementation blocked by G1.1 and G2 Repository v0. |
| 6 | host-business-residuals | docs/planning/execution/G1-native-foundation.md §G1.6 | — | — | READY_TO_SHIP | D-Codex | yes | 2026-05-19 | READY_TO_SHIP 2026-05-19 · Audit-only residual inventory complete; production cleanup remains blocked by G0/G1 sequencing. |

## Decomposition Rationale

### R1. Source and Gate Status
This manifest maps one G1 execution-pack task to one Workflow V2 feature. G1 production implementation was initially blocked because G0 was not Go or Conditional Go. On 2026-05-19, G0 reached Conditional Go for the DMG/private path after G0.5 user runtime confirmation; MAS signed/sandbox validation remains an external deferred gate.

### R2. Safe-Prep Boundary
Only documentation, contract planning, and mock/brief work proceeded while G0 was blocked. Production changes to `commands/window.rs`, `window_ext.rs`, capabilities, Host shell, or Organizer runtime may now proceed only within the G1.1 approved scope and DMG/private-path assumptions; MAS-specific behavior must remain behind the `mas-sandbox` deferred validation path.
