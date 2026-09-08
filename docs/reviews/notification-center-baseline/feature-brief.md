# G5-E4 Notification Center Baseline Feature Brief

## Goal

Create a baseline notification center in the console for Pomodoro completion, Todo due, and Habit reminder notifications.

## Scope

- Notification entity: `{ id, type, title, body, read, createdAt, sourcePlugin }`
- `useNotificationStore` backed by `DataAdapter<ConsoleNotification>`
- `NotificationPanel` for read/delete operations
- Mock seed notifications from productivity workflows

## Out of Scope

- OS notification APIs.
- Cross-window event ingestion.
- Scheduling engine.

## Validation

- `pnpm --filter @repo/plugin-console check-types`
