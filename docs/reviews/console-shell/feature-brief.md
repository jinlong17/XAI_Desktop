# G5-E1 Console Shell Scaffold Feature Brief

## Goal

Create the control console shell that can host productivity, labels, clipboard, project, notification, and settings views through a sidebar registry.

## Scope

- `ConsoleLayout` with sidebar, header, and main area.
- `PluginSlotRegistry` for plugin nav registration.
- `ConsoleSearch` global search UI shell.
- `ConsoleSettings` placeholder sections.
- Default mock nav entries for Label/Todo/Pomodoro/Habit/Clipboard/Project/Notification/Settings.

## Out of Scope

- Host integration.
- Direct imports from in-development plugins.
- Repository-backed search.

## Validation

- `pnpm --filter @repo/plugin-console check-types`
