# Roadmap Seed - desktop-overlay-host-v2

> Roadmap: xai-desktop-remaining-p2-p3-future
> Phase tag: P3+ Future
> Branch: dev

## Requirement

Reintroduce transparent overlay as an optional future mode, using quarantined legacy overlay/control/grid assets where useful. It must not replace the normal app host.

## Hard constraints

- Do not dispatch before Phase 3 RC is SHIPPED.
- Overlay is optional mode only; the normal app window remains the default and primary host.
- Reuse quarantined assets where useful, but verify they still satisfy current architecture and security constraints.

## Acceptance signal

The desktop app can offer or evaluate an optional overlay host v2 without regressing the normal-window host, and all reused legacy assets have explicit keep/refactor/drop decisions.

## Dependencies (advisory - manifest is authoritative)

Depends On: `desktop-phase3-integrated-rc-gate` SHIPPED.
