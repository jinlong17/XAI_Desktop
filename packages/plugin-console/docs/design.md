# Plugin Console Design

## Scope

`@repo/plugin-console` owns the control console shell, plugin slot registry, local search UI, Cmd+K command palette, desktop bridge mock, and notification center baseline.

## Decisions

- The console does not import planned/in-development plugins directly.
- Sidebar integration uses `PluginSlotRegistry` and default mock nav entries for Labels, Todos, Pomodoro, Habits, Clipboard, Projects, Notifications, and Settings.
- Cmd+K search uses local in-memory filtering over `SearchableEntity` objects until repository query exists.
- Desktop linkage is modeled by `ConsoleDesktopBridge`, an in-memory event bridge with explicit proposed contracts.
- Notifications use `DataAdapter<ConsoleNotification>` and package-local LocalStorage mock persistence.
