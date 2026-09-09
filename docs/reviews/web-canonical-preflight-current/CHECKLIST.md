# Web canonical receipt preflight — current source

固定核对基线：`a9b88ba3e34dca3218bd4770805f3060de8d1d42` (`2026-09-09`, `test(calendar): accept fixed array-time validation`).工作区在核对时已有 Board 相关脏文件；本检查单不依赖、不改动这些文件。既有输入是 `docs/reviews/web-ai-tool-receipt-astra-review/review.md`（以 `daff8ef2c69f...` 为评审基线）和 `docs/reviews/web-canonical-receipt-migration-inventory/review.md`。本文件只为 AI-02 B-D 迁移准备当前源码适配清单；不关闭任何编号，也不声称测试或全仓入口已完备。

## 当前结论与差异

- 当前 HEAD 相对既有 `daff8ef` 的相关差异集中在 Calendar AI 输入验证和 Board workspace/board 保存恢复（`git log daff8ef..HEAD -- packages/xai-web-calendar packages/plugin-web-board-workspaces`）。没有看到 canonical envelope、revision、receipt 或 Web Locks 实现进入 storage 包。
- Calendar 的 A1 语义校验入口已更新：`packages/xai-web-calendar/src/internal/aiCreateSubscriber.ts:74-87`、`packages/xai-web-calendar/src/internal/aiMutateSubscriber.ts:99-115`，但这两处仍直接 `getPref`/`setPref`。
- Board 当前新增的 `useWorkspaceSaveRecovery.ts`、`useBoardComposerRecovery.ts`、`useBoardCreateRecovery.ts` 只覆盖 `xai_board_workspaces` / `xai_boards_v2` / `xai_active_board`；Tasks 关联仍由 `taskLinkCommand.ts` 单独直接读写，不能由 Board 恢复代码代替。

## 1. Canonical storage chassis（B 的先决适配）

- [ ] **Envelope/codec 尚不存在。** 两个目标 key 的 registry 行是 `packages/plugin-web-storage/src/internal/registry.ts:995-1002` (`xai_calendar_events`) 和 `:203-210` (`xai_task_cols`)；归属均为 account（`accountOwnership.ts:26,108`）。需新增按 key 解码、校验 legacy/envelope/corrupt/unsupported 的 result-bearing reader，并只把 `data` 暴露给普通 domain callers。
- [ ] **同步 setPref 是全局绕过点。** `packages/plugin-web-storage/src/internal/storage.ts:118-140` 的 `getPref` 对 decode 失败直接返回 registry default，`:147-209` 的 `setPref` 直接 read/compare/`localStorage.setItem`，`:215-225` 的 `removePref` 直接删除。B-D 不能只改 AI subscriber；canonical key 一旦启用，旧同步 writer、reset 和旧 tab 都必须被拒绝、适配或明确隔离。
- [ ] **同一套投影尚未存在。** `packages/plugin-web-storage/src/internal/usePref.ts:107-147` 初读/写使用普通 codec，`:153-196` 的 StorageEvent 直接 `decode(entry.codec, event.newValue)`，`:200-205` 的 same-tab bus 直接接收 domain value，`:210-217` reset 调 `removePref`。StorageEvent、same-tab、initial read 必须走同一 keyed envelope decoder；raw API 仍应代表实际持久化 bytes。
- [ ] `packages/plugin-web-storage/src/index.ts:37-50,52-70` 当前公开的仍是同步 `getPref/setPref/removePref/usePref/readRawPref`；没有 targeted async canonical command/set 或 decoded snapshot/revision API。需先定义新 API，再迁移调用者，不能让同步 `setPref` 留作目标 key 的未协调后门。

## 2. Tasks：真实读写与隐式投影

### 写入口（必须适配）

- [ ] **Tasks seed/normalization/UI/retry：** `packages/xai-web-tasks/src/TasksModule.tsx:74-90` 通过 `usePref` 读，非法/非数组回退 `SEED_TASK_COLS`；`:94-97` 会把 seed/归一化结果写回；`:113-118` 是普通 UI persistence，所有拖拽、新建、编辑、批量操作和删除最终汇入这些回调（例如 `:183-185`, `:222-243`, `:341-372`）；`:384-390` 是失败保存重试。B 阶段必须避免 malformed envelope 被当 seed，D 阶段这些 callback 必须 await canonical result 并保留 receipts。
- [ ] **AI create：** `packages/xai-web-tasks/src/internal/aiCreateSubscriber.ts:40-56` 直接 `getPref`，空/非数组时使用 seed，再 `setPref`。这是“corrupt-to-default/seed”与 canonical receipt 丢失的关键绕过。
- [ ] **AI update/delete：** `packages/xai-web-tasks/src/internal/aiMutateSubscriber.ts:46-80` 各自 read-modify-write；delete 在 `:52-57` 先要求目标存在，不能满足“已提交 delete replay”；update 在 `:69-79` 使用旧快照。C/D 必须改成同一 canonical command，并把 receipt lookup 放在目标存在性判断前。
- [ ] **Board task link：** `packages/plugin-web-board-workspaces/src/internal/taskLinkCommand.ts:7-22,31-50,53-58` 自己用 `localStorage.getItem` + `JSON.parse` 读取 `xai_task_cols`，`loadTaskColsOrSeed` 后以 `cols !== rawTasks` 拒绝替换形状，并在 `:50` 用同步 `setPref` 写任务。`xai_boards_v2` intent/ack 与 Tasks 写入是有序多 key 操作；canonical envelope 后必须显式 decode domain、preserve receipts，并在签名变 async 时适配 caller。

### 只读投影（不得泄漏 envelope metadata）

- [ ] `packages/plugin-web-ai-chat/src/internal/contextProvider.ts:199-227`；`packages/plugin-web-statistics/src/StatisticsModule.tsx:85-100`；`packages/xai-web-cmdk/src/internal/readModuleStates.ts:46-55`。
- [ ] `packages/xai-web-dashboard-widgets/src/widgets/MailWidget.tsx:36-40`、`MiniCalWidget.tsx:49-53`、`UpcomingWidget.tsx:40-44`、`StatTasks.tsx:29-33`；`StickyComposer.tsx:244-258`。
- [ ] `packages/plugin-web-board-workspaces/src/BoardWorkspacesModule.tsx:271-292` 只读 `xai_task_cols` 用于 Board task projection；不得把它误判为新的 writer。`loadTaskColsOrSeed` 仍需接受 decoded domain，而不是 envelope object。

## 3. Calendar：普通 CRUD、AI CRUD 与恢复

- [ ] **普通 CRUD bridge：** `packages/xai-web-calendar/src/internal/eventStore/useUserCalEvents.ts:58-71` 用 `usePref` 读，但 `persist` 在 `:64-70` 直接读取 physical raw、`JSON.parse` 后与 projected `events` 比较，再用同步 setter 写。Envelope 外层 revision/receipts 会使当前 raw equality 检查错误冲突；需改为 decoded snapshot/revision conflict API，并让 writer 保留最新 receipts。
- [ ] **普通 UI create/update/delete：** `packages/xai-web-calendar/src/CalendarModule.tsx:104-107` 挂载 CRUD hook，`:158-205` 负责编辑前 identity check、create/update/remove；`packages/xai-web-calendar/src/EventComposer.tsx:212-283` 负责表单校验、失败重试状态与 delete。D 阶段需把这些 callbacks 改成可等待的 canonical commit result，失败时保留草稿/冲突语义。
- [ ] **AI create/update/delete：** `packages/xai-web-calendar/src/internal/aiCreateSubscriber.ts:68-94`、`aiMutateSubscriber.ts:87-123` 均直接 `getPref`/纯 reducer/`setPref`。当前日期/时间输入校验已收紧，但仍没有 durable receipt、single-write envelope 或 lock。
- [ ] **Calendar raw recovery/export：** `EventComposer.tsx:322-337` 导出的是未保存草稿，不是 account raw recovery；canonical 方案仍需由 storage lifecycle 提供 whole-envelope/raw export，并明确 user-facing domain export 的投影边界。

## 4. Generic reset/import/rollback/export/delete（不能由 key grep 代替）

- [ ] **Import validation：** `packages/plugin-web-storage/src/internal/accountMigrationValidation.ts:16-30` 直接按 registry codec `JSON.parse/decode` 后调用 Tasks/Calendar validator；需识别 envelope，验证 `data` 与 receipts，unknown/corrupt 保持原 bytes，不得回退成 default/seed。
- [ ] **Import staging：** `packages/plugin-web-storage/src/internal/accountMigration.ts:40-115` 在 migration lock 下枚举 legacy、校验 selected keys、复制 raw 到 candidate generation、写 archive/journal，再写 committed marker。当前是 raw copy，未验证 canonical envelope，也未与目标 key 的 active command writer 共用 lock；`migrateAccount` 的 candidate copy、archive 和 visibility commit 都要保留 receipt-bearing bytes。
- [ ] **Rollback：** `accountMigration.ts:118-138` 只切换 generation marker；需证明与正在等待/执行的 canonical writer 协调，并保留被恢复 generation 的 envelope/receipt 语义。当前 `AccountDataGate.tsx:76-98` 只 await `migrateAccount/rollbackAccount`，没有 canonical writer barrier。
- [ ] **Account raw export/delete：** `packages/plugin-web-storage/src/internal/accountDataLifecycle.ts:16-30` 枚举当前 generation 并返回 raw records；`:33-38` 写 tombstone 后删除 owned generation。必须导出完整 envelope bytes，删除时让等待 writer 在 lock 后重查 tombstone/generation，不能让旧 writer 复活已删除数据。
- [ ] **Device/legacy/archive export：** `packages/plugin-web-storage/src/internal/dataExport.ts:87-115` 枚举所有 storage keys并原样收集 device/legacy/archive；它不是 account envelope decoder。需明确 account export、user-facing Tasks/Calendar domain export、device recovery raw archive 三者的格式边界，unknown future format 仍可 raw recovery。
- [ ] **通用 API/调用边界：** `packages/plugin-web-storage/src/index.ts:63-82` 暴露 migration、rollback、account export/delete、device export；当前没有 canonical reset/import/restore adapter。`AccountDataGate.tsx:39-54,76-98` 是实际 UI 入口。其它依赖 key 枚举的 lifecycle/backup 路径仍需逐一确认，不能以本清单的定向搜索宣称完备。

## 5. Terra 适配顺序与停止条件

- [ ] **B — representation/compatibility：** keyed envelope/snapshot codec；registry-aware `getPref/usePref` + StorageEvent + same-tab projection；Tasks/Calendar migration validators；`useUserCalEvents` raw baseline；`taskLinkCommand` raw read/write；account raw export/restore/delete and generic import/rollback. 先证明 legacy/envelope/unknown/corrupt 与 receipt-preserving ordinary write，再让任何 writer 产生 envelope。
- [ ] **C — six durable commands：** Tasks/Calendar six AI subscribers改用 canonical command；canonical semantic signature、receipt lookup/conflict、delete-last-item replay、single setItem commit；保留现有 A1 Calendar invalid-input refusal。
- [ ] **D — all writers/locks：** TasksModule seed/normal/retry、Calendar CRUD/recovery、Board task link caller、generic import/reset/rollback/delete/export 等全部使用同一 per-key exclusive Web Lock；Web Locks 不可用必须显式失败；目标 key 上禁止旧同步 `setPref/removePref` bypass，旧 tab 也必须有 stale-version 处理。
- [ ] **未核入口：** 本清单没有把所有 `localStorage` 枚举、旧版本 tab、外部/下载恢复器、或其它未命名 generic lifecycle caller 当作已覆盖；在 B-D 进入可发布状态前必须对这些入口取得函数级证据，否则保持 blocker。

固定限制：本文件未运行测试、未修改产品代码、未修改总 ledger、未关闭任何 AI-02/REL 编号。
