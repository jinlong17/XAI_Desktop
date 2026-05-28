# Roadmap Seed - desktop-native-notifications-reminders

> Roadmap: xai-desktop-remaining-p2-p3-future
> Phase tag: P1-Phase2
> Branch: dev

## Requirement

Add macOS system notifications for task reminders, pomodoro completion, and calendar reminders. Keep scheduling scoped to desktop-native presentation and existing app data, without introducing Phase 3 local-first sync/storage behavior.

## Hard constraints

- Do not add full local-first editing, sync queues, or storage migrations in this feature.
- Respect notification permission flows and clear disabled/unsupported states.
- Use shipped normal-window and menu/config contracts as preconditions; do not revive overlay as the notification surface.

## Acceptance signal

The desktop app can trigger and display notifications for task, pomodoro, and calendar reminder scenarios, with tests or smoke evidence for permission denied, disabled, and offline states.

## Dependencies (advisory - manifest is authoritative)

Preconditions: `desktop-basic-macos-menu-config-store` SHIPPED. `desktop-real-macos-release-smoke` can run in parallel but must pass before external release.
