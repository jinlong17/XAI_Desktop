# ADR-0012: Phase 3 Desktop Local-First Storage

| 字段 | 值 |
|------|---|
| 状态 | Accepted |
| 日期 | 2026-05-28 |
| 决策者 | desktop-local-first-storage-adr (feature-auto-build, Codex gpt-5.3-codex inline) |
| 关联路线图 | `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md` row `#9` |
| 上位约束 | `docs/adr/0011-p1-react-tauri-local-first-hybrid.md` |

## 背景

Phase 3 需要在实现前冻结本地优先存储架构。当前仓库已存在三类证据：

- 桌面侧：`sqlcipher-local-db`、`core-data-sqlite-driver`、Tauri `database` commands
- 共享契约侧：`@repo/core-data` Repository v0 / outbox 契约
- Web/浏览器侧：`@repo/plugin-web-storage`（localStorage）与 IndexedDB 相关包

这些证据可以支撑决策，但都不是自动授权。必须先冻结：

- Desktop 主存储归属
- Web/Desktop 所有权边界
- import/migration 语义
- sync log/outbox 与 conflict 语义
- live path 与 backup/export 策略
- 下游行可依赖的稳定前提

## 方案对比

### 方案 A: Desktop 主存储 = SQLite（经 Tauri/Rust 管理）

优点：

- 符合 Desktop local-first 系统记录（system of record）需求
- 支持 schema migration、可观察测试、崩溃后恢复
- 支持 durable outbox / append-only sync log / conflict 标记
- 与现有 `@repo/core-data` 仓库契约及 SQLite 证据方向一致

缺点：

- 实现成本高于浏览器存储复用
- 需要明确 import/migration 边界与重试语义

### 方案 B: 复用浏览器 IndexedDB 作为 Desktop 主存储

优点：

- 初期改造成本低
- 可复用部分浏览器持久化代码

缺点：

- 与 Desktop 原生数据路径、可观测性、备份恢复策略不匹配
- 不利于明确 queue/conflict durability 语义
- 与 ADR-0011 的 hybrid native 方向不一致

### 方案 C: 文件优先（JSON/文档）作为主存储

优点：

- 初期实现简单
- 手工可读性强

缺点：

- 并发、迁移、索引和冲突管理能力弱
- 容易混淆 live store 与 export artifact
- 不适合作为 Phase 3 持久化与 sync 语义基座

## 决策

选择方案 A，并冻结如下决策：

### D1. 主存储与 live path

- Desktop 主存储为 SQLite。
- Live DB 由 Tauri/Rust 持有，路径位于 `app.path().app_data_dir()` 下。
- `app_config_dir()` 继续仅承载 host/config 数据，不承载 Phase 3 live entity store。

### D2. Web/Desktop 所有权边界

- Web 运行时继续拥有浏览器存储：
  - `@repo/plugin-web-storage`（localStorage）
  - 浏览器 IndexedDB 的 cache/sync 相关实现
- Desktop 运行时继续拥有原生 live DB、迁移、import/export 文件系统动作。
- Web 与 Desktop 共享的是契约与类型，而非共享同一 live store。

### D3. Browser → Desktop import 边界

- 浏览器数据是 Desktop import source，不是 Desktop live store。
- Import 必须满足：idempotent、observable、retryable、default non-destructive。
- 默认不删除/覆写浏览器源数据。
- 本 ADR 不授权浏览器本地存储与 Desktop live DB 的后台双向同步。

### D4. Repository 契约归属（必须引用既有 seam）

`@repo/core-data` 继续作为共享仓库契约 owner。下游实现必须以以下 seam 为准：

- `Repo<T extends RepoRecord>`
- `RepoRecord`
- `SyncScope = "device-local" | "account-sync"`
- `sync-outbox` 既有先例（stable mutation id + durable queue + same-transaction enqueue expectation）

下游可以在契约之下实现 desktop-native driver，但不得另建 plugin 私有并行仓库契约。

### D5. Sync log / outbox 方向

- Durable sync log/outbox 与实体记录同属 Desktop SQLite durability 平面。
- `account-sync` 写入必须具备事务性队列耦合（entity + queue state 可恢复）。
- queue/retry/failure/conflict 状态必须跨重启保留。

### D6. Conflict 语义

- 禁止静默 last-write-wins 作为默认冲突策略。
- `device-local` 记录不进入远端同步。
- `account-sync` 记录可离线排队，但冲突/失败必须显式可见（可审计、可追踪），不得伪装成功。
- 冲突检测/状态归属在数据层冻结；冲突展示/交互由下游 UI 行实现。

### D7. Backup/export 与 live path 分离

- Backup/export artifact 与 live DB 路径分离。
- restore/import 走 repository-level 校验流程，不允许默认“盲拷贝覆盖 live DB 文件”。

### D8. App-managed snapshots 的明确决议

- 自动快照（app-managed snapshots）**不在本 ADR 内落地实现**。
- 本 ADR 仅冻结约束：若后续引入快照，必须属于 backup/export/import 策略域，且保持与 live DB 路径分离。
- 快照策略（触发、保留、轮转、清理）明确下放到 `desktop-local-first-backup-export-import` 行。

### D9. Backup/export artifact 角色

- JSON/archive 等文件格式仅作为 backup/export/import artifact，不作为 canonical live store。

### D10. Scope guard

本 ADR 为架构门（architecture gate），不实现：

- 生产存储代码 / migration 代码
- queue/sync/reconnect 运行时实现
- Web 存储重写
- overlay/control/grid 或 organizer 范围恢复

## 下游解锁规则

本 ADR Accepted 后：

- `desktop-local-first-sqlite-foundation` 可实现 live DB + migration + desktop 文件策略，但不得重开主存储选型。
- `desktop-local-first-repository-bridge` 可基于 `@repo/core-data` 契约对接业务实体，不得新增平行仓库契约。
- `desktop-local-first-web-data-migration` 可实现 browser→desktop import，但必须遵循 D3。
- `desktop-local-first-offline-edit-queue` 可实现队列与回放，但必须遵循 D5/D6。
- `desktop-local-first-sync-reconnect` 可实现重连同步，但不得削弱显式冲突/失败语义。
- `desktop-local-first-backup-export-import` 可实现 artifact UX 与 snapshot 策略（承接 D8）。

## 后果

正面：

- 为 Phase 3 下游行提供单一、可执行的契约基线
- 保持 Web 行为稳定并避免 live store 混用
- 明确 queue/conflict/backup 边界，降低后续返工

负面：

- 下游实现成本上升（需要原生 SQLite 路径与导入链路）
- 需要在后续行补齐 snapshot 与 restore 细节验证

## 验收检查点（供 feature-verify）

- 是否明确选择 SQLite 为 Desktop 主存储
- 是否明确 Web/Desktop 所有权边界与单向 import 语义
- 是否显式引用 `Repo` / `RepoRecord` / `SyncScope` / `sync-outbox` seam
- 是否显式决定 snapshot 策略被 deferred 到 backup/export/import 行
- 是否定义下游解锁规则且无实现越界
