# Roadmap Seed - desktop-smart-container-file-organizer

> Roadmap: xai-desktop-remaining-p2-p3-future
> Phase tag: P3+ Future
> Branch: dev

## Requirement

Re-evaluate and implement Smart Container file organization only after local-first desktop fundamentals are stable.

## Hard constraints

- Do not dispatch before Phase 3 RC is SHIPPED.
- Do not move Smart Container or file organizer work back into P1 Phase 2.
- Treat overlay host v2 as optional; the Smart Container decision must stand on post-Phase3 product architecture.

## Acceptance signal

The feature produces a clear keep/refactor/drop decision and, if implemented, a file organization slice that respects local-first data, native macOS constraints, and the normal-window host.

## Dependencies (advisory - manifest is authoritative)

Depends On: `desktop-phase3-integrated-rc-gate` SHIPPED. Optional relationship: `desktop-overlay-host-v2`.
