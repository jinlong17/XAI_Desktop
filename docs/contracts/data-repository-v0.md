# Data Repository Contract v0

| 字段 | 值 |
|---|---|
| Owner | `@repo/core-data` |
| Source | `packages/core-data/src/types.ts` |
| 状态 | Draft |
| 适用 | Desktop SQLite/SQLCipher, Web IndexedDB/remote encrypted blob, tests |

## 1. 原则

- Plugin 不直接访问 localStorage、SQLite、IndexedDB 或 Supabase。
- Plugin 只依赖 Repository interface。
- Repository driver 不 import plugin package。
- 所有记录必须包含 `id`、`entityType`、`schemaVersion`、`createdAt`、`updatedAt`。
- Device-local 与 syncable 数据必须显式区分。
- Clipboard 默认 device-local。

## 2. Record Model

```ts
interface RepoRecord {
  id: string;
  entityType: string;
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
  syncScope: "device-local" | "account-sync";
}
```

Entity type 使用 `plugin.entity`:

| Entity | syncScope 默认值 |
|---|---|
| `organizer.grid` | `account-sync` |
| `organizer.item` | `account-sync` 或 `device-local`,按 path 权限决定 |
| `labels.label` | `account-sync` |
| `productivity.todo` | `account-sync` |
| `productivity.pomodoro_session` | `account-sync` |
| `productivity.habit` | `account-sync` |
| `clipboard.item` | `device-local` |
| `project.board` | `account-sync` |
| `project.card` | `account-sync` |
| `widgets.widget` | `device-local` |
| `account.device` | `account-sync` |

## 3. Repository Interface 目标

```ts
interface Repo<T extends RepoRecord> {
  get(id: string): Promise<T | undefined>;
  put(record: T): Promise<void>;
  delete(id: string): Promise<void>;
  list(query?: RepoListQuery): Promise<T[]>;
  transaction<R>(fn: (tx: RepoTransaction) => Promise<R>): Promise<R>;
  migrate(plan: MigrationPlan): Promise<MigrationResult>;
}
```

`list()` 的默认顺序不稳定。需要稳定顺序时必须显式传 query。

## 4. Driver

| Driver | 用途 | 要求 |
|---|---|---|
| in-memory | tests | 复用 contract tests |
| localStorage migration | one-time import | 只读旧数据,不作为长期 driver |
| SQLite | desktop dev baseline | 支持 transaction/index |
| SQLCipher | desktop secure baseline | 错 key 不可读 |
| IndexedDB | Web local cache | 不存明文 secret |
| Remote encrypted blob | Sync/Web | 只传 encrypted envelope |

## 5. Migration Rules

- Migration 必须幂等。
- Migration failure 不删除旧数据。
- Migration 必须记录 source version、target version、startedAt、completedAt。
- 用户可导出迁移前数据或保留 fallback。

## 6. Sync Rules

- `device-local` 不进入 remote outbox。
- `account-sync` 写入必须具备 account/device context。
- Remote blob 不存明文 payload。
- Conflict resolution 必须 deterministic,不能靠 UI 随机顺序。

## 7. Testing Contract

每个 driver 必须通过同一组测试:

- CRUD roundtrip。
- list query and stable ordering。
- transaction rollback。
- migration idempotency。
- corrupted storage handling。
- syncScope enforcement。
- encrypted driver wrong-key failure。

## 8. Open Questions

- SQLCipher 具体依赖和 Tauri bundling 策略在 G2 确认。
- Organizer path-backed item 是否默认 sync path metadata,需按 MAS sandbox 结果决定。
- Clipboard Sync 是否进入 v1 默认关闭,PRD 当前倾向默认 device-local。
