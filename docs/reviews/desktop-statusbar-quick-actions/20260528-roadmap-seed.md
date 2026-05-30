# Roadmap Seed - desktop-statusbar-quick-actions

> Roadmap: xai-desktop-remaining-p2-p3-future
> Phase tag: P1-Phase2
> Branch: dev

## Requirement

Add a macOS status bar icon with quick actions to open/focus the app, start pomodoro, view today's tasks, and expose basic app status.

## Hard constraints

- This is a status bar affordance for the normal desktop app, not a transparent overlay or replacement host.
- Keep business logic in owning Web/plugin surfaces or typed boundaries; the Tauri host should only bridge native shell behavior.
- Notification integration is optional, not a hard dependency, unless feature-plan finds a concrete shared scheduling contract.

## Acceptance signal

The status bar menu works on macOS, can focus the normal app window, invokes the scoped quick actions, and degrades clearly when a target action is unavailable.

## Dependencies (advisory - manifest is authoritative)

Precondition: `desktop-basic-macos-menu-config-store` SHIPPED. Optional relationship: `desktop-native-notifications-reminders`.
