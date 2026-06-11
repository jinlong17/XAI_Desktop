# Roadmap Seed - desktop-phase2-integrated-rc-gate

> Roadmap: xai-desktop-remaining-p2-p3-future
> Phase tag: P1-Phase2
> Branch: dev

## Requirement

Run the integrated Phase 2 RC gate across notifications, status bar, hotkey, full menu, auto-update/update-disabled behavior, and last-data cache smoke on real macOS.

## Hard constraints

- Do not implement missing Phase 2 feature scope here except minimal verifier-owned blockers.
- Treat `desktop-real-macos-release-smoke` as a required external-release condition even though Phase 2 implementation can run in parallel.
- Keep the gate focused on the normal-window desktop app.

## Acceptance signal

An integrated RC evidence report shows PASS or classified blockers for all Phase 2 slices on real macOS, with external-release readiness separated from repo-side build/test readiness.

## Dependencies (advisory - manifest is authoritative)

Depends On: all Phase 2 implementation rows READY_TO_SHIP or SHIPPED.
