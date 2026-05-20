# Proposed Contract Changes: Notification Center Baseline

## Need

The console notification center needs typed events from productivity workflows once Track A exposes the canonical EventMap.

## Proposed Events

- `productivity:pomodoro-completed`
  - Payload: `{ todoId?: string; completedAt: string; cycleCount: number }`
- `productivity:todo-due`
  - Payload: `{ todoId: string; title: string; dueDate: string }`
- `productivity:habit-reminder`
  - Payload: `{ habitId: string; name: string; reminderAt: string }`
- `console:notification-read`
  - Payload: `{ notificationId: string; readAt: string }`

## Notes

Track B currently seeds mock notifications through `useNotificationStore` and does not edit `docs/contracts` or core event types.
