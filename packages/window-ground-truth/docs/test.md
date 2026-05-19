# window-ground-truth — Test Plan

## Acceptance Tests

| Test | Expected |
|---|---|
| `git branch --show-current` | `spike/window-ground-truth` |
| `sw_vers` | macOS product/version/build recorded in evidence README |
| `system_profiler SPHardwareDataType` | model/chip/memory recorded with serial identifiers omitted |
| `system_profiler SPDisplaysDataType` | display count and display names/resolutions recorded |

## Manual Verification

No click-through, DnD, Spaces, fullscreen, or MAS manual gate belongs to G0.1. Those gates are owned by later G0 features.

## Mock Strategy

None. This is a docs/evidence anchor.

## Deferred Gates

- Manifest review: deferred to human.
- Cross-vendor review/verify: deferred because this run is a serial Codex conductor.

