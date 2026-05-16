# Sync 子开发方案

| 字段 | 值 |
|---|---|
| 对应 PRD | `docs/planning/sub-prds/sync/PRD.md` |
| 父开发计划 | `docs/planning/2026-05-12-product-development-plan-v1.md` |
| 归属 plugin | `packages/plugin-account/`(主)+ `packages/core-data/`(REST driver) |
| 跨越 Phase | Phase 0 子阶段 0.3(骨架,~2 周)+ Phase 5(完善,~3-4 周) |
| 最后更新 | 2026-05-14 |
| 状态 | DRAFT |

---

## 1. 双 Phase 目标

### 1.1 Phase 0 子阶段 0.3(骨架) — ~2 周

> 主 PRD §10.4 子阶段 0.3 的 Supabase 后端骨架 + Sync MVP。**目标:走通端到端单表同步**,验证技术栈和协议假设。

**必交付**:
1. Supabase 项目(staging + prod)注册 + schema 部署
2. `packages/plugin-account/` 包搭骨架(manifest + index + types)
3. 账号注册 / 登录 / Keychain refresh_token 持久化(FR-AC-01, FR-AC-02, FR-AC-07, FR-AC-08)
4. 密钥层级实现(Argon2id + AES-256-GCM 原语 + Envelope 编解码,FR-SY-07~10)
5. **单表(todos)** 增量同步:push + pull,无 Realtime / 无 outbox,LWW 服务端时钟(FR-SY-15~22, FR-SY-46)
6. 菜单栏图标四态(FR-SY-42)
7. RLS 配置 + 自动测试(FR-SY-58)

**不做**:Realtime、离线队列、多设备协调、Re-key、助记词恢复(只生成 + 强提示)、TOTP、模块级禁同步、quota。

**Exit criterion**:两台 Mac 用同一账号,在 todos 上互相能看见对方 5 秒内创建的新条目(手动触发 pull)。

### 1.2 Phase 5(完善) — ~3-4 周

> 主 PRD §10.6 Phase 5。目标:补齐 P0 全集 + 公测前的稳定性 / 安全演练。

**必交付**:
1. Realtime 订阅(FR-SY-27~31)
2. 离线 outbox 队列 + 回放(FR-SY-32~37)
3. 全部 entity_type 接入(覆盖 §4 同步矩阵)
4. 助记词恢复完整流程(FR-AC-10, FR-SY-13)
5. 多设备列表 + 远程登出(FR-AC-14)
6. 同步审计日志 UI(FR-SY-43, FR-SY-26)
7. 弱网处理 + 退避 + 死信(FR-SY-47~49, FR-SY-65~66)
8. quota + rate limit(FR-SY-62~64)
9. 数据导出 + 账号删除(FR-SY-50~52, FR-AC-12, FR-AC-13)
10. fuzz 测试 + R-10 子风险演练(§5 测试策略 + PRD §10.2 验收)
11. OAuth (Apple / Google) — FR-AC-06
12. **P1 可选**:TOTP(FR-AC-11)、模块级禁同步(FR-SY-55)、Realtime fallback for Web

**Exit criterion**:PRD §10.2 Phase 5 验收 7 条全过。

---

## 2. 前置依赖

| 依赖 | 状态 | 阻塞? |
|---|---|---|
| `core-data` 抽象层(SQLite driver) | Phase 0 子阶段 0.3 同步开发(`localStorage → SQLite` 迁移) | 是,必须先有 |
| `core-data` 的 REST driver(对应"三个面"网页版用) | Phase 4.5 网页版要;Phase 0 阶段先只支持本地驱动 + 加一层 sync 适配层 | 否(Phase 0 不需要)|
| `core-events` 的 `account:*` EventMap | 已在 PLUGIN_SDK §4.1 定义,Phase 0 子阶段 0.3 实装 | 是 |
| 主密码 UI(密码强度计 / 助记词回填验证) | Phase 0 末由 plugin-account 自己实现(在 Console 设置页) | 是 |
| Supabase 项目 + billing(Free → Pro 在 Phase 5) | Phase 0 子阶段 0.3 第 1 天注册 | 是 |
| `@repo/ui` 的 PasswordPrompt / MnemonicDisplay / SyncStatusIcon | Phase 0 子阶段 0.3 增组件 | 是 |
| macOS Keychain 访问(Rust `security-framework` crate) | Phase 0 子阶段 0.2 已就位(refresh_token 存)/ 子阶段 0.3 扩展存 KEK | 是 |
| `@repo/core-data` 的 sync 协调钩子 | Phase 0 子阶段 0.3 内部新增 | 是 |
| 控制台 plugin shell(`plugin-console`) | Phase 2.5 才有;**Phase 0 阶段先在 menu bar + 模态框完成所有 sync UI** | 否(降级路径)|

---

## 3. 任务分解

### 3.1 Phase 0 子阶段 0.3 — Sync MVP(~2 周)

> 与 `core-data` SQLite 迁移、`core-fs` 抽象、菜单栏、Supabase 后端骨架同期。Sync 占其中 **~5-7 工作日**。

**Day 1-2 · Supabase + Schema**
- T-01: 注册 Supabase 项目(staging + prod),配置 region(us-east-1)
- T-02: 创建 §6.1 全部表 + §6.2 全部 RLS policy(以 migration 形式,版本化在 `apps/web/supabase/migrations/`)
- T-03: 写 RLS 自动测试(Vitest + `@supabase/supabase-js`,模拟两个 user,互相访问对方数据 expect deny)
- T-04: 启用 Realtime 但 Phase 0 不订阅;先开 toggle

**Day 3-4 · plugin-account 骨架 + 加密原语**
- T-05: `packages/plugin-account/` 包创建,`manifest.json` 按 PLUGIN_SDK §9.11
- T-06: 加密原语 module(`src/crypto/`):argon2.ts、aes-gcm.ts、envelope.ts、mnemonic.ts;**全部用 RustCrypto npm 镜像或调 Rust 侧(优先 Rust)**
- T-07: 加密层独立单测(round-trip / fuzz seed / 已知向量)
- T-08: `src/account.ts` 实装 signup / login(对接 Supabase Auth SDK)
- T-09: Keychain bridge(Rust 命令 `secret_set/secret_get/secret_del`)+ TS 包装

**Day 5 · 同步引擎骨架**
- T-10: `src/sync/engine.ts` 内核:`pushBatch(entity_type, records)` / `pullSince(entity_type, cursor)` / `applyServerRecords(records)`
- T-11: 接入 `core-data` 的 todos 表;在 todos `INSERT/UPDATE/DELETE` 时调 `engine.queuePush(...)` (Phase 0 直接 push 不入 outbox)
- T-12: 菜单栏图标四态 + `account:sync-*` 事件广播

**Day 6-7 · 端到端 + 验收**
- T-13: 两台 mac 真机调试,验证 PRD §10.1 7 条
- T-14: 写 dev_log,提交 phase-end checkpoint

### 3.2 Phase 5 — Sync 完善(~3-4 周)

**Week 1 · Realtime + 全 entity 接入**
- T-21: Supabase Realtime channel `sync:<account_id>` 订阅(`@supabase/supabase-js` Realtime client)
- T-22: 客户端 `RealtimeReceiver` → 触发 `engine.pullSince()`(忽略 self 设备消息,FR-SY-29)
- T-23: 接入剩余 entity_type:settings / grids / grid_items / lists / labels / label_assignments / habits / habit_logs / boards / board_lists / board_cards / board_card_checklist / notes / progress_trackers / pets / plugins
- T-24: 每个 entity 做集成测试(写一条 → 5s 内另一端可见)
- T-25: Realtime 断线重连 + 退避(FR-SY-31)

**Week 2 · 离线 + 多设备**
- T-30: `sync_outbox` 表 + migration
- T-31: 改造 mutation 入口:统一走 `engine.enqueueMutation()` → 写 SQLite + 入 outbox
- T-32: outbox flush 任务(后台 setInterval,网络可用时 + Realtime 断线时也尝试)
- T-33: 网络监测(Rust `SCNetworkReachability` callback → tauri event → TS)
- T-34: 死信队列 UI(toast + 通知 + Console 设置页详情)
- T-35: 设备登记 + 远程登出 UI(FR-AC-14)
- T-36: 多设备并发 mutation 集成测试(2 SQLite + 1 mock server)

**Week 3 · 助记词恢复 + Re-key + Quota**
- T-40: 助记词回填验证 UI(FR-AC-09)
- T-41: 助记词恢复流程端到端(FR-AC-10)
- T-42: Re-key 流程(FR-SY-13):两阶段实现,中断恢复测试
- T-43: quota / rate limit:Supabase edge function(`/sync/push` 包装层)实装 rate limit
- T-44: 配额超限 UI(FR-SY-63)
- T-45: 成本 dashboard 抓取 + 月度对账模板(FR-SY-64)

**Week 4 · 数据导出 / 账号删除 / fuzz / 演练**
- T-50: 全量 JSON 导出 + Markdown 子集导出(FR-SY-50, FR-SY-51)
- T-51: 账号删除流程 + 30 天硬删 cron(Supabase scheduled function)
- T-52: fuzz 测试(`cargo-fuzz`)envelope decode + decrypt
- T-53: 恢复演练 1:服务端 staging 全删 → 助记词恢复
- T-54: 恢复演练 2:本地 SQLite 全删 → 登录 → 全量 pull
- T-55: 演练 3:Re-key 中断 → 重启 → 一致性
- T-56: 弱网压测(toxiproxy:500ms 延迟 / 10% 丢包 / 偶尔断网)
- T-57: 凭据轮换 SOP 演练(写 `docs/runbook/credential-rotation.md`)
- T-58: 24h 压测 10 账号 × 持续 mutation
- T-59: 安全 review + threat-model 复核 + Phase 5 验收

---

## 4. 协议接口契约

### 4.1 TypeScript 类型(`packages/plugin-account/src/types.ts`)

```typescript
// 加密 envelope
export type CipherEnvelope = {
  v: 1;
  kdfVersion: 1;
  nonce: Uint8Array;       // 12B
  ciphertext: Uint8Array;
  tag: Uint8Array;          // 16B
};

// 同步 mutation
export type SyncMutation = {
  entityType: SyncEntityType;
  entityId: string;
  op: 'upsert' | 'delete';
  payload: Record<string, unknown> | null;  // null for delete
  localUpdatedAt: number;
};

export type SyncEntityType =
  | 'settings' | 'grids' | 'grid_items' | 'auto_classify_rules'
  | 'lists' | 'todos' | 'todo_reminders'
  | 'labels' | 'label_assignments'
  | 'habits' | 'habit_logs'
  | 'boards' | 'board_lists' | 'board_cards' | 'board_card_checklist'
  | 'notes' | 'progress_trackers'
  | 'pets' | 'plugins';

// PUSH request
export type PushRequest = {
  entityType: SyncEntityType;
  records: Array<{
    entityId: string;
    version: number;
    clientUpdatedAt: number;
    blob: string;          // base64 envelope
    deletedAt: string | null;
  }>;
};

export type PushResponse = {
  accepted: number;
  serverNow: string;       // ISO
  results: Array<{
    entityId: string;
    serverUpdatedAt: string;
  }>;
};

// PULL response
export type PullResponse = {
  records: Array<{
    entityId: string;
    version: number;
    blob: string;
    serverUpdatedAt: string;
    deletedAt: string | null;
    originatorDeviceId: string;
  }>;
  nextCursor: string;
  hasMore: boolean;
};

// Realtime msg
export type RealtimeBlobChanged = {
  entityType: SyncEntityType;
  entityId: string;
  serverUpdatedAt: string;
  originatorDeviceId: string;
};

// 同步引擎核心接口
export interface SyncEngine {
  pushBatch(entityType: SyncEntityType, records: SyncMutation[]): Promise<PushResponse>;
  pullSince(entityType: SyncEntityType, cursor: string | null, limit?: number): Promise<PullResponse>;
  applyServerRecords(entityType: SyncEntityType, records: PullResponse['records']): Promise<void>;
  enqueueMutation(m: SyncMutation): Promise<void>;       // 写 outbox
  flushOutbox(): Promise<{ flushed: number; deadLetter: number }>;
  onRealtime(msg: RealtimeBlobChanged): void;
  getStatus(): SyncStatusSnapshot;
}

export type SyncStatusSnapshot = {
  state: 'idle' | 'syncing' | 'success' | 'error' | 'offline-only';
  lastSyncedAt: number | null;
  outboxPending: number;
  outboxDeadLetter: number;
  lastError: { code: string; message: string } | null;
};
```

### 4.2 Tauri commands(Rust 侧)

```rust
#[tauri::command] async fn crypto_derive_kek(password: String, salt: Vec<u8>) -> Result<Vec<u8>, String>;
#[tauri::command] async fn crypto_encrypt(plaintext: Vec<u8>, key: Vec<u8>) -> Result<Vec<u8>, String>;
#[tauri::command] async fn crypto_decrypt(envelope: Vec<u8>, key: Vec<u8>) -> Result<Vec<u8>, String>;
#[tauri::command] async fn keychain_set(key: String, value: Vec<u8>) -> Result<(), String>;
#[tauri::command] async fn keychain_get(key: String) -> Result<Vec<u8>, String>;
#[tauri::command] async fn keychain_delete(key: String) -> Result<(), String>;
#[tauri::command] async fn network_reachability_listen() -> Result<(), String>;   // emits "network:online"/"offline"
```

### 4.3 Realtime channel 契约

```typescript
// 客户端订阅
supabase.channel(`sync:${accountId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'encrypted_blobs',
    filter: `account_id=eq.${accountId}`,
  }, (payload) => {
    syncEngine.onRealtime({
      entityType: payload.new.entity_type,
      entityId: payload.new.entity_id,
      serverUpdatedAt: payload.new.server_updated_at,
      originatorDeviceId: payload.new.originator_device_id,
    });
  })
  .subscribe();
```

---

## 5. 测试策略

### 5.1 单测(Phase 0 子阶段 0.3 起,持续)

| 模块 | 覆盖率底线 | 重点 |
|---|---|---|
| `crypto/argon2` | 100% | 已知向量 round-trip;参数版本号断言 |
| `crypto/aes-gcm` | 100% | nonce 唯一性、tag 校验失败、空 / 大 payload 边界 |
| `crypto/envelope` | 100% | 编码 / 解码 / 损坏输入(invalid v / truncated)不 panic |
| `crypto/mnemonic` | 100% | BIP-39 标准向量;打字回填校验逻辑 |
| `sync/engine` | ≥ 80% | mutation 入队、push batch、pull 应用、LWW 决断 |
| `sync/outbox` | ≥ 80% | 顺序回放、合并、死信、退避 |

### 5.2 模糊测试(fuzz)— Phase 5 引入

- `cargo-fuzz` 目标:`envelope_parse`(任意 bytes → 不 panic,要么返回 Err 要么返回 valid struct)
- `cargo-fuzz` 目标:`decrypt`(任意 envelope + 任意 key → 不 panic)
- 连续运行 24h 无 crash 才能进 Phase 5 验收(PRD §10.2)

### 5.3 集成测试(Phase 5 重头)

`packages/plugin-account/tests/integration/`:
- 两个 in-memory SQLite + mock Supabase REST server(用 `msw` 或自建 fake)
- 场景矩阵:
  1. 同设备多窗口写入(只本地事件,不走 server)
  2. 双设备分别写入不同 entity → 各自 push → 各自 pull → 最终一致
  3. 双设备同时写同一 entity → LWW,server 时钟为准
  4. 双设备同时删 + 双设备同时写 → tombstone vs update(FR-SY-24)
  5. 离线写 200 条 → 上线 outbox flush → 与对端一致
  6. 离线 + 写 + 服务端被对端先写过 → 上线 outbox flush 被对端覆盖,toast 显示
  7. 弱网:推一条卡 10s → 重试 → 成功
  8. quota 触限 → 降级到只读

### 5.4 E2E(Phase 5 末)

- 真机两台 Mac(Sonoma + Sequoia)+ 一台 Chrome 同账号
- 跑 PRD §10.2 全部清单
- toxiproxy 注入网络故障组合

### 5.5 恢复演练(Phase 5 末,强制 3 次)

| 场景 | 预期 |
|---|---|
| 服务端 staging 数据全删,客户端用助记词 → 重新加密上传 | 全部数据恢复;旧 server cursor reset |
| 客户端 SQLite 全删,登录后全量 pull | 5 分钟内恢复完整数据 |
| Re-key 中途断电(用 `kill -9`)→ 重启 | 数据一致(staging blob 未 swap 时回滚,已 swap 则继续) |

### 5.6 RLS audit(Phase 0 起,每月跑)

- 自动测试:模拟 user_A 用 token 访问 user_B 的 blob → expect deny
- 模拟 anon role 访问 → expect deny
- 模拟 service_role 访问 → ok(但服务端代码绝不直接拿 service_role 给 client 用)

---

## 6. 风险登记(R-10 子分解 + 新增)

主 PRD §12 R-10 已标 🔴 高。这里展开。

| ID | 风险 | 等级 | 缓解 | 监控 |
|---|---|---|---|---|
| R-10.1 | GCM nonce 复用 | 🔴 高 | OsRng + 单测断言;1M 样本 unique;PR review checklist | unit + fuzz |
| R-10.2 | 主密码丢 = 数据丢 | 🔴 高 | 助记词 + UI 强提示 + 不承诺找回 | 用户教育 |
| R-10.3 | LWW 时钟偏移丢数据 | 🟡 中 | server 时钟权威;30 天软删;outbox 死信 | sync_audit_log |
| R-10.4 | RLS 漏洞 | 🟡 中 | 自动测试 + 月度 audit;零知识 fallback | RLS audit |
| R-10.5 | encrypted_dek 损坏 | 🔴 高 | server backup + 本地 Keychain cache 副本 | server backup |
| R-10.6 | Re-key 中断 | 🔴 高 | 两阶段提交 + 中断恢复演练 | 演练记录 |
| R-12 | Supabase 凭据(service_role / JWT)泄漏 | 🟡 中 | 季度轮换 SOP + CI secret 隔离 + GitHub secret scanning | 轮换记录 |
| R-13 | LWW 算法实现错误导致数据丢失 | 🔴 高 | 单测 LWW 矩阵全覆盖;集成测试场景 1-4;Phase 5 fuzz 一周 | 演练 |
| R-14 | Supabase RLS 漏配 | 🔴 高 | 每张表 RLS 强制 enable + CI 检查;`SET ROLE authenticated` 自动测试;Phase 0 就上 | CI |
| R-15 | Supabase Free tier 突然限流 / 改价 | 🟡 中 | data 层抽象 + 协议设计可移植;若需要可迁自建 PG + 自己 Realtime(WebSocket server) | 月度账单 |
| R-16 | Realtime 在企业代理 / VPN 下失败 | 🟡 中 | fallback 到主动 polling 模式(15s 间隔);UI 显示"Realtime 不可用,正在轮询同步" | Sentry 错误率 |
| R-17 | 助记词存储不当导致泄漏(用户截图存 iCloud) | 🟡 中 | UI 引导文案 + 鼓励"打印纸质保存";不上传助记词 hash 用于验证(可选 P1) | — |
| R-18 | 加密层 npm 包 supply chain 攻击(@noble/ciphers 等) | 🟡 中 | 优先用 Rust 侧加密(RustCrypto)走 Tauri command;TS 侧 npm 包锁版本 + `pnpm audit` | 每月 audit |

---

## 7. 验收门(GA 前 Sync 必达标准)

Phase 5 完成 → Phase 6 公测 / 上架前,Sync 必须全部满足:

1. **功能完整**:PRD §5 全部 P0 FR(41 条 + 主 PRD §5.9 11 条 = 52 条 P0)完成,各自有单测覆盖
2. **性能合规**:PRD §8 全部指标 P95 达标(TECHNICAL_REQUIREMENTS §1.2 性能回归门)
3. **安全演练通过**:
   - fuzz 24h 无 crash
   - RLS 自动测试 100% 通过
   - 3 个恢复演练全通(§5.5)
   - 凭据轮换 SOP 演练一次
4. **真机验收**:PRD §10.2 7 条全过
5. **可观测**:Sentry 已接 E3xxx 错误码,验证一条上报路径
6. **文档完备**:
   - `packages/plugin-account/docs/design.md` / `api.md` / `test.md` / `dev_log.md` 四件套就位
   - `docs/runbook/credential-rotation.md`
   - `docs/runbook/sync-incident-response.md`(应急预案)
   - 助记词遗失场景的用户帮助页(public)
7. **零知识承诺可验证**:外部审计可重现"服务端 dump → 无明文" 的 PoC(自验也可)
8. **R-10 全子项关闭**:每条都有对应单测 / 集成测试 / 演练记录

不满足任一条 = 阻塞 GA。

---

## 8. 与其他模块的协作

| 模块 | 协作点 |
|---|---|
| `core-data` | data layer 提供 mutation hook,plugin-account 监听并入 outbox |
| `core-events` | 广播 `account:sync-*`(已在 PLUGIN_SDK §4.1)给所有 plugin |
| `plugin-organizer` | 上传 grid_items 前 redact 本地路径(§4.2);本地 security-scoped bookmark 不上传 |
| `plugin-productivity` | todos / habits / pomodoro 表的写入路径必须经过 core-data;pomodoro 表特别标 noSync |
| `plugin-clipboard` | clipboard_items / clipboard_ocr 标 noSync(本地)|
| `plugin-console` | Phase 2.5+:设置页显示同步状态 + 审计日志 + 设备列表 |
| `plugin-widgets`(桌宠) | pet_memory 标 noSync(v1);pets row 走同步 |
| `plugin-ai` | AI Cube 设置(API key)走 settings 表加密同步;调用历史不同步 |
| `apps/web` | Phase 4.5 网页版,通过 `core-data` REST driver 复用同协议 |

---

## 9. 文档变更记录

| 日期 | 版本 | 变更 |
|---|---|---|
| 2026-05-14 | v0.1-DRAFT | 首版:双 Phase 拆解、任务清单 ~50 条、协议契约、测试策略、R-10 子分解 + 新增 R-12~R-18 |

— END —
