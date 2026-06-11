# Roadmap Seed - desktop-last-data-cache-polish

> Roadmap: xai-desktop-remaining-p2-p3-future
> Phase tag: P1-Phase2
> Branch: dev

## Requirement

Ensure the desktop app opens with last-known user data where available when offline. This is cache/display polish for Phase 2, not full offline editing or local-first sync.

## Hard constraints

- Do not create a new local-first repository, migration system, edit queue, or conflict model in this feature.
- Preserve browser Web behavior and existing Web storage contracts.
- Offline display must clearly distinguish cached data from live/synced state where that distinction matters.

## Acceptance signal

After an online session with user-visible data, the desktop app can relaunch offline and show appropriate last-known data or empty-state fallbacks without blocking `/app` launch.

## Dependencies (advisory - manifest is authoritative)

Preconditions: `desktop-web-auth-offline-mode` SHIPPED and `web-external-runtime-offline-gates` SHIPPED.
