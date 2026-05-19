# Events Contract v0

| 字段 | 值 |
|---|---|
| Owner | `@repo/core` |
| Source | `packages/core/src/types/events.ts` |
| 状态 | Draft |
| 适用 | Desktop Host, Web Host, all plugins |

## 1. 原则

- Event name 使用 `domain:resource:action`。
- Payload 必须是 JSON-serializable。
- 跨 Grid 事件必须包含 `gridId`。
- Account/Sync 事件是 local bus signal,不是网络协议。
- Plugin 可以监听其他 domain 的 public event,但只有 owner domain 可以 emit owner event。
- Event 不传 raw secret、raw DEK、access token、完整 clipboard secret。

## 2. 命名空间

| Namespace | Owner | 用途 |
|---|---|---|
| `organizer:*` | `plugin-organizer` | Grid、file drop、desktop organization |
| `productivity:*` | `plugin-productivity` | Todo、Pomodoro、Habits |
| `clipboard:*` | `plugin-clipboard` | Clipboard item lifecycle,privacy status |
| `labels:*` | `plugin-labels` | Label CRUD and assignment |
| `console:*` | `plugin-console` | Console route/search/slot |
| `project:*` | `plugin-project` | Board/list/card |
| `widgets:*` | `plugin-widgets` | Widget lifecycle |
| `calendar:*` | `plugin-calendar` | Calendar aggregate |
| `pet:*` | `plugin-pet` | Pet state/reminder |
| `ai:*` | `plugin-ai-cube` | AI draft/action state |
| `account:*` | `plugin-account` | Login/sync/device local signals |
| `app:*` | Host/core | settings,interactive mode,theme |

## 3. v0 EventMap 目标

### Organizer

| Event | Payload | Emit | Listen |
|---|---|---|---|
| `organizer:grid:ready` | `{ gridId: string }` | Grid shell | organizer,host |
| `organizer:grid:update` | `{ gridId: string; changes: Partial<GridBox> }` | organizer | host |
| `organizer:grid:close` | `{ gridId: string }` | host/organizer | host/organizer |
| `organizer:grid:create-request` | `{ gridId?: string; rect: Rect; source?: "control" \| "shortcut" }` | control | host |
| `organizer:file:drop` | `{ gridId: string; files: DroppedFile[] }` | grid/native | organizer |
| `organizer:item:selected` | `{ gridId: string; itemId: string }` | organizer | console/ai |

`DroppedFile` target:

```ts
interface DroppedFile {
  path: string;
  name: string;
  kind: "file" | "folder" | "app" | "alias" | "unknown";
  size?: number;
  securityScope?: "none" | "bookmark-required" | "bookmark-granted";
}
```

### Productivity / Labels / Clipboard

| Event | Payload | Owner |
|---|---|---|
| `labels:changed` | `{ labelId: string; action: "created" \| "updated" \| "deleted" }` | labels |
| `productivity:todo:changed` | `{ todoId: string; action: "created" \| "updated" \| "completed" \| "deleted" }` | productivity |
| `productivity:pomodoro:completed` | `{ sessionId: string; todoId?: string }` | productivity |
| `clipboard:item:created` | `{ itemId: string; kind: ClipboardKind }` | clipboard |
| `clipboard:privacy:changed` | `{ recording: boolean; reason?: string }` | clipboard |

Clipboard event payloads must not include full content. Consumers load content through the clipboard repository with permission checks.

### Console / Project / AI

| Event | Payload | Owner |
|---|---|---|
| `console:navigate` | `{ route: string; entityId?: string; source?: string }` | console |
| `console:search:submitted` | `{ query: string; source: "cmdk" \| "console" }` | console |
| `project:card:changed` | `{ cardId: string; boardId: string; action: string }` | project |
| `ai:draft:created` | `{ draftId: string; kind: "todo" \| "card" \| "label" }` | ai |

AI events only reference drafts. Persisting generated content requires user confirmation through the owning plugin.

### Account / Sync

| Event | Payload | Owner |
|---|---|---|
| `account:logged-in` | `{ userId: string }` | account |
| `account:logged-out` | `{ userId: string }` | account |
| `account:sync:started` | `{ kind: "push" \| "pull" \| "rekey" }` | account |
| `account:sync:completed` | `{ kind: "push" \| "pull" \| "rekey"; durationMs: number }` | account |
| `account:sync:failed` | `{ kind: "push" \| "pull" \| "rekey"; code: string; message: string }` | account |
| `account:device:revoked` | `{ deviceId: string }` | account |

## 4. Implementation Rules

- `emitEvent<K extends keyof EventMap>(name: K, payload: EventMap[K])` 是唯一 emit 入口。
- `useEventListener<K extends keyof EventMap>(name: K, handler: ...)` 是 React listener 入口。
- EventMap breaking change 必须更新本文件。
- 未登记 event 不允许进入 production code。
- Current desktop compatibility alias: `organizer:create-grid-request` carries `{ gridId?: string; rect: Rect }` until the implementation fully migrates to `organizer:grid:create-request`.

## 5. 测试

- Event payload type tests。
- Grid event without `gridId` rejected or ignored。
- Account events do not carry secrets。
- Multi-window listener cleanup prevents duplicate handling。
