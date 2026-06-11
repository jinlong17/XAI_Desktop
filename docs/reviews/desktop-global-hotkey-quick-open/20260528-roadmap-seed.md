# Roadmap Seed - desktop-global-hotkey-quick-open

> Roadmap: xai-desktop-remaining-p2-p3-future
> Phase tag: P1-Phase2
> Branch: dev

## Requirement

Add a global shortcut that shows or focuses the normal desktop app window. Include shortcut conflict handling, a user-visible disabled state, and persisted configuration.

## Hard constraints

- Do not use the hotkey to toggle transparent overlay or grid/control windows.
- Persist only the hotkey setting and state needed for Phase 2; do not introduce Phase 3 storage architecture.
- Native failure or conflict must be visible to the user and recoverable through config/menu affordances.

## Acceptance signal

The configured hotkey focuses the app on macOS, conflict/registration failures are surfaced, and the disabled or changed shortcut state persists across relaunch.

## Dependencies (advisory - manifest is authoritative)

Precondition: `desktop-basic-macos-menu-config-store` SHIPPED.
