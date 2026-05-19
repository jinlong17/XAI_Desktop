# Feature Brief — window-ground-truth

| Field | Value |
|---|---|
| Feature | window-ground-truth |
| Gate | G0 — window spike |
| Source | docs/planning/execution/G0-window-spike.md §G0.1 |
| Date | 2026-05-19 |
| Executor | Codex serial inline conductor |

## Requirement

Create the G0.1 spike branch and evidence directory that will anchor all later window-ground-truth validation. This feature must not implement window behavior; it only establishes the review/evidence surface and records the current machine environment.

## Scope

- Create or switch to branch `spike/window-ground-truth`.
- Create `docs/reviews/window-ground-truth/README.md`.
- Create the roadmap anchor docs under `packages/window-ground-truth/docs/`.
- Record machine model, macOS version, display count, test date, and the commands used to collect evidence.
- Update the G0 roadmap manifest and autorun logs.

## Non-goals

- No Grid prototype.
- No click-through, DnD, Spaces, fullscreen, MAS, or sandbox implementation.
- No changes to Host, plugin business logic, Tauri commands, EventMap, Repository contracts, or capabilities.
- No ship or push.

## Acceptance

- `git branch --show-current` returns `spike/window-ground-truth`.
- `docs/reviews/window-ground-truth/README.md` exists and includes machine model, macOS version, display count, and test date.
- `packages/window-ground-truth/docs/dev_log.md` tracks Workflow V2 status.
- Manifest and autorun logs identify G0 as active and `window-ground-truth` as the first eligible feature.

## Tests

- `git branch --show-current`
- `sw_vers`
- `system_profiler SPHardwareDataType`
- `system_profiler SPDisplaysDataType`

## Docs Impact

- `docs/workflow/roadmap/xai-g0-window-spike.md`
- `docs/workflow/roadmap/xai-v1.autorun-20260519.md`
- `docs/workflow/roadmap/xai-v1.deferred-gates.md`
- `docs/reviews/window-ground-truth/README.md`
- `packages/window-ground-truth/docs/design.md`
- `packages/window-ground-truth/docs/api.md`
- `packages/window-ground-truth/docs/test.md`
- `packages/window-ground-truth/docs/dev_log.md`

## Contract Impact

None. This feature does not add or modify EventMap entries, Repository interfaces, Tauri commands, capabilities, or ADR decisions.

