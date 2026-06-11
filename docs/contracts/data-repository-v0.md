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
| `organizer.grid` | `device-local` |
| `organizer.item` | `device-local` |
| `labels.label` | `account-sync` |
| `productivity.todo` | `account-sync` |
| `productivity.habit` | `account-sync` |
| `clipboard.item` | `device-local` |
| `project.board` | `account-sync` |
| `project.card` | `account-sync` |

### 2.1 Deferred future entities (not in v0)

The following entities are reserved for post-v0 work. They are **not** frozen
in `packages/core-data/src/entities.ts` and are listed here only to claim the
`entityType` slug ahead of time. Drivers and the `RepoEntity` union must not
reference them until they ship.

| Entity | syncScope 计划值 | 预计交付 | 备注 |
|---|---|---|---|
| `productivity.pomodoro_session` | `account-sync` | 待 plugin-productivity 番茄钟模块上线 | 与 `productivity.todo` 共享 label 维度 |
| `widgets.widget` | `device-local` | 待 plugin-widget 落地 | 桌面小组件配置,默认设备本地 |
| `account.device` | `account-sync` | 待 G2.4 device pairing 完成 | 用于 device list + remote revoke |

## 3. Repository Interface 目标

```ts
interface Repo<T extends RepoRecord> {
  get(id: string): Promise<T | undefined>;
  put(record: T): Promise<void>;
  delete(id: string): Promise<void>;
  list(query?: RepoListQuery<T>): Promise<T[]>;
  listByIndex<K extends keyof T>(
    field: K,
    value: T[K],
    query?: RepoListQuery<T>,
  ): Promise<T[]>;
  metadata(): Promise<RepoMetadata>;
  transaction<R>(fn: (tx: RepoTransaction<T>) => Promise<R>): Promise<R>;
  migrate(plan: MigrationPlan<T>): Promise<MigrationResult>;
}
```

`list()` 的默认顺序不稳定。需要稳定顺序时必须显式传 query。

## 3.1 Repository v0 Entity 表

`packages/core-data/src/entities.ts` 是 entity 类型的 canonical source。每个具体
entity 都是 `RepoRecord` 的扩展,`entityType` 必须使用下表中固定的 dotted slug。

| Entity (TS) | `entityType` | 默认 syncScope | 关键字段 |
|---|---|---|---|
| `GridEntity` | `organizer.grid` | `device-local` | `title`, `rect`, `itemIds`, `isLocked`, `isFolded`, `viewMode` |
| `GridItemEntity` | `organizer.item` | `device-local` | `gridId`, `kind`, `filename`, `filepath?`, `url?` |
| `LabelEntity` | `labels.label` | `account-sync` | `name`, `color`, `parentId?` |
| `TodoEntity` | `productivity.todo` | `account-sync` | `title`, `done`, `labelIds`, `dueAt?`, `projectId?` |
| `HabitEntity` | `productivity.habit` | `account-sync` | `title`, `cadence`, `completions[]`, `labelIds` |
| `ClipboardEntryEntity` | `clipboard.item` | `device-local`(强制) | `kind`, `payload`, `pinned?` |
| `ProjectEntity` | `project.board` | `account-sync` | `title`, `labelIds`, `archivedAt?` |
| `CardEntity` | `project.card` | `account-sync` | `projectId`, `status`, `position`, `labelIds` |

新增 entity 必须遵守以下规则:

1. `entityType` 形如 `^[a-z]+\.[a-z_]+$`,plugin 段必须真实存在。
2. Device-local 类型必须把 `syncScope` 收窄为字面量 `"device-local"`。
3. `id` 由 plugin 生成,driver 不会自动赋值;命名需 plugin-scoped (例 `grid_<uuid>`)。
4. 修改任何 entity 字段必须同步 `schemaVersion` 提升 + migration plan。

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

每个 driver 必须通过同一组测试 (`packages/core-data/tests/repository-contract.ts` 是
canonical suite):

- CRUD roundtrip。
- list query and stable ordering。
- listByIndex 命中 + query options 组合。
- transaction rollback。
- migration idempotency。
- corrupted storage handling。
- syncScope enforcement。
- encrypted driver wrong-key failure。

Entity-level 测试 (`packages/core-data/tests/entities.test.ts`) 校验:

- 每个 entity 类型可通过 `Repo<RepoEntity>` round-trip。
- `entityType` 命名遵守 `plugin.entity` 正则。
- `listByIndex` 在 entity-owned 字段 (例 `gridId`) 上工作。
- Clipboard 在类型层面被约束为 `device-local`。

## 8. Open Questions

- SQLCipher 具体依赖和 Tauri bundling 策略在 G2 确认。
- Organizer path-backed item 是否默认 sync path metadata,需按 MAS sandbox 结果决定。
- Clipboard Sync 是否进入 v1 默认关闭,PRD 当前倾向默认 device-local。
