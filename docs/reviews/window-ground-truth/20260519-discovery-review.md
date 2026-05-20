# Discovery Review — window-ground-truth

| Field | Value |
|---|---|
| Feature | window-ground-truth |
| Gate | G0 — window spike |
| Source | docs/planning/execution/G0-window-spike.md §G0.1 |
| Date | 2026-05-19 |
| Mode | Fresh plan |

## Problem Framing

G0 requires real evidence for native window behavior before any G1 production implementation. The first task is not a product feature; it is an evidence anchor that makes later manual and automated validation reproducible.

## Discovery Scope

No external research is required. The task is an internal workflow and evidence setup step with an explicit execution-pack source.

## Candidate Options

### Option A — Branch plus evidence directory only

Create `spike/window-ground-truth`, add `docs/reviews/window-ground-truth/README.md`, and track Workflow V2 state in `packages/window-ground-truth/docs/`.

Benefits:
- Matches G0.1 exactly.
- Keeps production code untouched.
- Gives later G0 tasks a stable place for screenshots, command output, and manual matrices.

Risks:
- Does not prove any native behavior by itself.
- Requires later human review before higher-risk G0 tasks.

### Option B — Start G0.2 prototype immediately

Create the evidence directory and begin Grid prototype work in one feature.

Benefits:
- Faster path to behavioral evidence.

Risks:
- Violates the one-task-per-feature rule.
- Mixes setup with production-adjacent native/window code.
- Makes it harder to identify the exact G0.1 acceptance baseline.

## Recommendation

Use Option A. It is the only option that preserves the G0 task boundary and keeps this feature low risk under unattended execution.

## Risks And Open Questions

- Human manifest review is deferred for the unattended run.
- Cross-vendor review/verify cannot be performed in this single serial Codex conductor.
- Later G0 tasks require real manual macOS validation and may not be suitable for unattended completion.

## Evidence Commands

- `git branch --show-current`
- `sw_vers`
- `system_profiler SPHardwareDataType`
- `system_profiler SPDisplaysDataType`

