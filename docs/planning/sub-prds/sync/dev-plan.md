# Sync 子开发方案

| 字段 | 值 |
|---|---|
| 对应 PRD | `docs/planning/sub-prds/sync/PRD.md` v0.4-DRAFT |
| 父开发计划 | `docs/planning/2026-05-12-product-development-plan-v1.md` |
| 归属 plugin | `packages/plugin-account/`(主)+ `packages/core-data/`(REST driver) |
| 跨越 Phase | Phase 0 子阶段 0.3(骨架,**v0.4 重估 16-22 工日**)+ **Phase 4.8 协议硬化里程碑(~3 周,TLA+ / property tests 前置)** + Phase 5(完善,~5-6 周) |
| 最后更新 | 2026-05-16 |
| 状态 | v0.5-DRAFT(协议硬化第四轮联动修订) |
| 关联审查 | `docs/planning/sub-prds/sync/REVIEW-2026-05-15.md` v0.2~v0.5 round 全部 Critical/High 已落实 |

---

> ⚠ **v0.5 重要**:此文档的 §1~§3 部分历史段落仍含 v0.2/v0.3 残留(里程碑/工日/Argon2 recovery proof/旧 envelope/旧 task 编号)。**实施时以 §1 当前 v0.5 表述 + Sync PRD v0.5-DRAFT 为唯一施工依据**。所有 Critical / High 修复对应位置见 `REVIEW-2026-05-15.md` v0.5 round 执行记录。

## 1. 三 Phase 目标(v0.5 协议硬化第四轮)

### 1.1 Phase 0 子阶段 0.3(骨架) — **v0.5 重估 18-24 工日**(C-A 用户配对 + C-C nonce lease + per-device wrap UI 工时)

> 主 PRD §10.4 子阶段 0.3 的 Supabase 后端骨架 + Sync MVP。**目标:走通端到端单表同步**,验证 v0.2 协议假设。

**必交付**:
1. Supabase 项目(staging + prod)注册 + schema 部署(含 v0.2 新表 account_keyring / mutation_dedup / encrypted_blobs_conflict_shadow / staging_blobs / device_sync_progress / entity_type ENUM)
2. `packages/plugin-account/` 包搭骨架(manifest + index + types)
3. 账号注册 / 登录 / Keychain refresh_token 持久化(FR-AC-01, FR-AC-02, FR-AC-07, FR-AC-08)
4. **密钥层级实现 v0.2**:Argon2id KEK + auth_password 弱化派生(C-01)+ Secret Key(FR-SY-73)+ AES-256-GCM 原语含 AAD(FR-SY-67)+ deterministic nonce(H-01 / FR-SY-07)+ Envelope 含 key_id(C-07 / FR-SY-08)+ Recovery proof(FR-SY-69)
5. **24 词 BIP-39**(C-05 / FR-AC-10):用 `@scure/bip39` + Rust `bip39` crate,跨实现兼容测试
6. **DEK 常驻 Rust KeyVault + opaque key_handle**(C-06 / FR-SY-75):Tauri command 改写见 §4.2 v0.2
7. **SQLCipher 接入**(C-09 / FR-SY-74):db_key 由 KEK 派生,SQLite 文件加密
8. **单表(todos)增量同步 v0.2**:push 含 mutation_id + base_revision + commit_seq,pull 用 commit_seq cursor;conditional write 冲突走 207 + conflict shadow(FR-SY-15~26 / FR-SY-71 / FR-SY-72)
9. 菜单栏图标四态(FR-SY-42)
10. **RLS v0.2 配置 + 自动测试 + RLS fuzz 框架雏形**(FR-SY-58 / H-08):含 device 校验

**不做**:Realtime、离线队列、多设备协调、Re-key 重加密、助记词恢复完整流程(只生成 + 强提示 + 验证回填)、TOTP、模块级禁同步、quota。

**Exit criterion**:两台 Mac 用同一账号 + 同一 secret_key,在 todos 上互相能看见对方 5 秒内创建的新条目(手动触发 pull),且服务端 dump 不能解出任何 todo 内容。

### 1.2 **Phase 4.8 协议硬化里程碑(v0.5 ~ 3-4 周)**

> **在 Phase 5 全 entity 接入之前必须完成**,否则 Phase 5 改不动协议层。详见 PRD v0.2 §10.x。

**必交付**:
1. **AAD 绑定全实体生效**(FR-SY-67):所有 entity_type 的 encrypt 路径强制传 AAD;集成测试"server 调包密文 → 客户端拒收"
2. **Revision rollback 拒收**(FR-SY-68):client `entity_state` 表 + max_seen_revision 校验;测试"server 回滚 revision → 客户端告警"
3. **Recovery proof 完整 PATCH 路径**(FR-SY-69):Edge Function 实装 challenge / proof / Argon2id 校验
4. **Re-key 两阶段 + keyring**(FR-SY-13 升 P0 + C-07):双读、原子 swap、中断恢复;`kill -9` 在 4 个关键点演练
5. **Mutation idempotency 全协议生效**(FR-SY-72):dedup 表 + 唯一索引;重发 10 次测试
6. **TLA+ 协议模型**(P-03):2-3 设备 × 短序列 mutation 模型检查;反例 → 修协议或写"已知限制"
7. **RLS fuzz**:property-based 1000 用户 × 100 设备 cross-tenant 0 行
8. **Tauri capability allowlist 全启用**(FR-SY-75):非授权 plugin 调 `crypto_*` 拒绝

**Exit criterion**:PRD §10.x 协议硬化里程碑准入门 10 条全过。

### 1.3 Phase 5(完善) — **v0.5 重估 ~6-7 周**

> 主 PRD §10.6 Phase 5。目标:补齐 P0 全集 + 公测前的稳定性 / 安全演练。

**必交付**:
1. Realtime 订阅 v0.2(FR-SY-27~31)— **Private Channels + Authorization 强制**(H-09)
2. 离线 outbox 队列 + 回放 v0.2(FR-SY-32~37)— **同事务原子性 + DAG 拓扑合并**(M-12 / H-06)
3. 全部 entity_type 接入(覆盖 §4 同步矩阵)
4. 助记词恢复完整流程(FR-AC-10, FR-SY-13)
5. 多设备列表 + 远程登出 **+ 强制 Re-key**(FR-AC-14 升 P0,H-11)
6. 同步审计日志 UI(FR-SY-43, FR-SY-26)+ 冲突 shadow 恢复 UI(FR-SY-71)
7. 弱网处理 + 退避 + 死信(FR-SY-47~49, FR-SY-65~66)
8. quota + rate limit(FR-SY-62~64)
9. 数据导出 .json.age + 账号删除(FR-SY-50~52 / FR-SY-70 加密导出,FR-AC-12, FR-AC-13)
10. fuzz 测试 24h + 4 个恢复演练 + 零知识 PoC + SQLite dump PoC(§5 测试策略 + PRD §10.2 验收)
11. OAuth (Apple / Google) **+ Passkey 选项**(FR-AC-06 / H-12)
12. **Supply chain 硬化**(H-13):cargo vet / sigstore npm signature / dependency-review-action / Tauri capability strict mode
13. **P1 可选**:TOTP(FR-AC-11)、模块级禁同步(FR-SY-55)、Realtime fallback for Web

**Exit criterion**:PRD §10.2 Phase 5 验收 13 条全过 + **REVIEW-2026-05-15.md Critical + High 全数关闭**。

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

### 3.1 Phase 0 子阶段 0.3 — Sync MVP(v0.2 重估 ~10-14 工作日)

> 与 `core-data` SQLite 迁移、`core-fs` 抽象、菜单栏、Supabase 后端骨架同期。v0.2 加入 AAD / key_id / revision / mutation_id / Secret Key / SQLCipher / KeyVault opaque handle 等协议级要素,工日翻倍。

**Day 1-2 · Supabase + Schema(v0.2 含 5 张新表)**
- T-01: 注册 Supabase 项目(staging + prod),配置 region(us-east-1)
- T-02: 创建 §6.1 全部表 + ENUM `sync_entity_type` + §6.2 全部 RLS policy(以 migration 形式,版本化在 `apps/web/supabase/migrations/`)
- T-03: 写 RLS 自动测试(Vitest + `@supabase/supabase-js`,模拟两个 user,互相访问对方数据 expect deny)+ device 校验测试(撤销 device 的 token 不能 INSERT,H-08)
- T-04: 启用 Realtime **Private Channels + Authorization**(H-09),配置 `realtime.messages` RLS policy;Phase 0 暂不订阅,但配置就位

**Day 3-5 · plugin-account 骨架 + 加密原语 v0.2**
- T-05: `packages/plugin-account/` 包创建,`manifest.json` 按 PLUGIN_SDK §9.11
- T-06: 加密原语 module — **Rust 主实现** `apps/desktop/src-tauri/src/crypto/`:
  - `argon2.rs`:KEK 派生(t=3, m=64MiB, p=4, secret=secret_key)+ auth_password 派生(t=1, m=16MiB, p=1)
  - `aes_gcm.rs`:AES-256-GCM 含 AAD 接口
  - `envelope.rs`:`{v|kdf|key_id|nonce|aad_len|aad|ct|tag}` 序列化 / 反序列化
  - `mnemonic.rs`:24 词 BIP-39(`bip39` crate)
  - `kdf.rs`:HKDF(SQLite db_key / recovery proof secret 派生)
- T-07: 加密层独立单测(round-trip / 已知向量 / AAD mismatch / 24 词跨实现兼容)+ cargo-fuzz 配置(空跑)
- T-08: **KeyVault 实装**(Rust 侧 `key_vault.rs`):KeyHandleId + opaque handle map,JS 只拿 u32(FR-SY-75);Tauri command `crypto_encrypt_for(...)` / `crypto_decrypt(...)` 不接受 raw key
- T-09: `src/account.ts` 实装 signup(C-01 流程,master_password 派生 auth_password + KEK)/ login(含 Secret Key 验证)
- T-10: Keychain bridge(Rust 命令 `secret_set/secret_get/secret_del`,ACL 限定 bundle id)+ TS 包装
- T-11: **SQLCipher 接入**(FR-SY-74):rusqlite + sqlcipher feature;`db_key = HKDF(KEK, "xai.sqlite.v1")`;启动时 `PRAGMA key`,关闭时清

**Day 6-9 · 同步引擎骨架 v0.2**
- T-12: `src/sync/engine.ts` 内核:`pushBatch(entityType, records)` 含 mutation_id / base_revision / commit_seq / AAD / `pullSince(entityType, commit_seq_cursor)` / `applyServerRecords(records)` 含 revision 校验
- T-13: Recovery proof Edge Function(`supabase/functions/auth-me-patch/index.ts`):challenge 生成 / proof 校验 / Argon2id 比对(FR-SY-69)
- T-14: PUSH Edge Function(`supabase/functions/sync-push/index.ts`):conditional write + idempotency(mutation_dedup)+ 冲突 shadow 写入 + 207 partial response
- T-15: 接入 `core-data` 的 todos 表;在 INSERT/UPDATE/DELETE 时同事务写 entity 表 + sync_outbox(M-12);Phase 0 暂不开 outbox flush(直接 push 走 engine)
- T-16: 菜单栏图标四态 + `account:sync-*` 事件广播

**Day 10-12 · 端到端 + 验收**
- T-17: 两台 mac 真机调试,验证 PRD §10.1 9 条
- T-18: **零知识 PoC 雏形**:Supabase Studio 看 todos blob,确认不可读
- T-19: **SQLite dump PoC**:复制 SQLite 文件到另一 user 账号,确认不可打开(FR-SY-74)
- T-20: 写 dev_log,提交 phase-end checkpoint

**风险预留**:如 KeyVault / SQLCipher / Recovery proof 任一遇阻 +2-3 天,总预算上限 14 工作日;超出走 PRD §10.1 范围裁剪。

### 3.1.5 Phase 4.8 — 协议硬化里程碑(v0.2 新,~2 周)

> 在 Phase 5 全 entity 接入之前**强制完成**。详见 PRD §10.x 准入门。

**Week A · AAD / revision / recovery proof 全协议验证**
- T-A1: 集成测试"server 拷贝 blob A 到 blob B 位置"→ 客户端拒收(FR-SY-67)
- T-A2: 集成测试"server UPDATE 旧 revision"→ 客户端拒收 + surface 告警 + 上报 E3015(FR-SY-68)
- T-A3: 集成测试"无 recovery proof 的 PATCH /auth/me"→ server 401(FR-SY-69)
- T-A4: Edge Function 性能测试:recovery proof Argon2id 校验 < 500ms

**Week B · Re-key 全链路 + TLA+ 模型**
- T-B1: Re-key 流程端到端(用户主动 + 设备撤销触发);staging_blobs 双写;`kill -9` 在 4 个关键点(初始化 / staging 30% / staging 70% / swap 前 / swap 后)
- T-B2: TLA+ 协议建模(`docs/spec/sync.tla`):2-3 设备 × 短 mutation 序列;模型检查通过(或反例 → 修协议或写"已知限制")
- T-B3: RLS fuzz(`fast-check`)1000 用户 × 100 设备 cross-tenant 零泄漏
- T-B4: Tauri capability allowlist 启用 + 非授权 plugin 调 `crypto_*` 拒绝测试
- T-B5: Mutation idempotency 重发 10 次只产 1 revision 测试
- T-B6: 24 词 BIP-39 跨实现兼容测试(`@scure/bip39` ↔ Rust `bip39`)
- T-B7: 准入门 checklist 全过 → 提交里程碑 checkpoint

### 3.2 Phase 5 — Sync 完善(v0.2 重估 ~4-5 周)

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
- T-53: 恢复演练 1:服务端 staging 全删 → 助记词 + 本地 SQLite 完整 device 协作恢复(M-6)
- T-54: 恢复演练 2:本地 SQLite 全删 → 登录 + donor device 协作 grant DEK wrap → 全量 pull
- T-55: 演练 3:Re-key 中断 → kill -9 在 staging 30%/70%/swap 前/swap 后 4 点 → 一致性
- T-55b: 演练 4:撤销 device A → device A 即使再登录也无法解新 blob(C-D R-10.11)
- T-56: 弱网压测(toxiproxy:500ms 延迟 / 10% 丢包 / 偶尔断网)
- T-57: 凭据轮换 SOP 演练(写 `docs/runbook/credential-rotation.md`)
- T-58: 24h 压测 10 账号 × 持续 mutation
- T-59: 安全 review + threat-model 复核 + Phase 5 验收

---

## 4. 协议接口契约

### 4.1 TypeScript 类型(v0.3 重写,`packages/plugin-account/src/types.ts`)

> v0.3 关键变化:`version → revision/proposedRevision/baseRevision`、`serverUpdatedAt → commitSeq`、`deletedAt → softDeleted/hardDeleted`、新增 `mutationId/keyId/causalDeps`、新增 device wrap 类型 / Ed25519 recovery 类型 / CBOR AAD 类型;`nextCursor` 是 BIGINT `commitSeq` 而非 timestamp。

```typescript
// ── 协议版本 ─────────────────────────────────────
export const SYNC_PROTOCOL_VERSION = 1;       // L-4 分离协议版本与文档版本

// ── 加密 envelope(v0.4 H-8:BIGINT 用 bigint/string,不用 number)─────
export type CipherEnvelope = {
  v: 1;
  kdfVersion: 1;
  keyId: number;
  encryptionDeviceId: bigint;                 // 8B,server 分配
  counter: number;                            // 4B,per device per key
  ciphertext: Uint8Array;
  tag: Uint8Array;                            // 16B
  // AAD 不存 envelope,由 client 即时 CBOR-encode (§7.1.2)
};

export type SyncEntityType =
  | 'settings' | 'grids' | 'grid_items' | 'auto_classify_rules'
  | 'lists' | 'todos' | 'todo_reminders'
  | 'labels' | 'label_assignments'
  | 'habits' | 'habit_logs'
  | 'boards' | 'board_lists' | 'board_cards' | 'board_card_checklist'
  | 'notes' | 'progress_trackers'
  | 'pets' | 'plugins';

// ── 同步 mutation(v0.3 outbox 入参)──────────────
export type SyncMutation = {
  entityType: SyncEntityType;
  entityId: string;
  op: 'upsert' | 'soft_delete' | 'hard_delete';
  payload: Record<string, unknown> | null;
  baseRevision: number | null;                // C-E:读取时看到的 revision,首次 create 为 null
  mutationId: string;                         // UUIDv7,FR-SY-72 idempotency
  causalDeps?: Array<{ entityId: string; maxSeenRevision: number }>;  // P-01
  clientUpdatedAt: number;                    // 仅展示
};

// ── PUSH request ─────────────────────────────────
export type PushRecord = {
  entityId: string;
  mutationId: string;
  baseRevision: number | null;
  proposedRevision: number;                   // v0.3 C-E:client 提交 = base + 1
  blob: string;                               // base64 envelope
  softDelete: boolean;
  hardDelete: boolean;
  causalDeps?: Array<{ entityId: string; maxSeenRevision: number }>;
  clientUpdatedAt: number;
};

export type PushRequest = {
  entityType: SyncEntityType;
  records: PushRecord[];
};

// ── PUSH response(v0.3:207 partial,逐条 status,H-F)──
export type PushResultOk = {
  status: 'ok';
  entityId: string;
  appliedRevision: number;
  commitSeq: string;                          // v0.4 H-8:BIGINT 用 string 表达,JSON number 精度不够
};
export type PushResultConflict = {
  status: 'conflict';
  entityId: string;
  serverRevision: number;
  serverBlob: string;
  winnerCommitSeq: number;
  yourLoserBlobSavedToShadowId: number;
};
export type PushResultCausalDepUnsatisfied = {
  status: 'causal_dep_unsatisfied';
  entityId: string;
  missingDep: { entityId: string; neededRevision: number; serverRevision: number };
};
export type PushResultDuplicate = {
  status: 'duplicate_mutation_id';
  entityId: string;
  previousRevision: number;
  previousCommitSeq: number;
};
export type PushResultRevisionMismatch = {
  status: 'revision_mismatch';
  entityId: string;
  reason: string;
};
export type PushResultItem =
  | PushResultOk | PushResultConflict | PushResultCausalDepUnsatisfied
  | PushResultDuplicate | PushResultRevisionMismatch;

export type PushResponse = {
  accepted: number;
  rejected: number;
  results: PushResultItem[];
  serverNow: string;
};

// ── PULL response(v0.3:commit_seq cursor,全局账户级,H-J)──
export type PullRecord = {
  entityType: SyncEntityType;                 // v0.4 H-7:账户级全局 cursor → 必须含 entity_type
  entityId: string;
  revision: number;
  keyId: number;
  blob: string;
  commitSeq: string;                          // v0.4 H-8
  softDeleted: boolean;
  hardDeleted: boolean;
  originatorDeviceId: string;
};

export type PullResponse = {
  records: PullRecord[];
  nextCommitSeq: string;                      // v0.4 H-8:BIGINT → string
  currentAccountCommitSeq: string;            // v0.4 H-8 + H-A
  hasMore: boolean;
};

// ── Realtime msg(v0.4 H-8 commit_seq string)──────────────
export type RealtimeBlobChanged = {
  entityType: SyncEntityType;
  entityId: string;
  commitSeq: string;
  originatorDeviceId: string;
};

// ── Per-device DEK wrap (v0.3 新,C-D)──────────
export type DeviceDekWrap = {
  accountId: string;
  deviceId: string;
  keyId: number;
  wrap: string;                               // base64 X25519 sealed_box envelope
  grantedByDeviceId: string;
};

// ── Recovery proof (v0.3,C-A)────────────────────
export type RecoveryChallenge = {
  challengeId: string;
  challenge: Uint8Array;                      // 32B
  ttlSeconds: number;
  boundToAccountId: string;
};
export type RecoveryProofPayload = {
  challengeId: string;
  // CBOR canonical message + Ed25519 signature
  message: Uint8Array;
  signature: Uint8Array;                      // 64B
  newPayload: Record<string, unknown>;
};

// ── 同步引擎核心接口(v0.3 重签名)─────────────────
export interface SyncEngine {
  pushBatch(entityType: SyncEntityType, records: PushRecord[]): Promise<PushResponse>;
  pullSince(cursor: string, limit?: number): Promise<PullResponse>;        // v0.4 H-7/H-8:全局 cursor (string)
  applyServerRecords(records: PullRecord[]): Promise<void>;                 // v0.4 H-7:PullRecord 自含 entityType
  enqueueMutation(m: SyncMutation): Promise<void>;
  flushOutbox(): Promise<{ flushed: number; deadLetter: number }>;
  onRealtime(msg: RealtimeBlobChanged): void;
  getStatus(): SyncStatusSnapshot;
  // v0.3 新增
  verifyAccountCommitSeqMonotone(serverSeq: number): Promise<void>;        // H-A
  triggerRekey(reason: 'user_action' | 'device_revoked' | 'counter_exhausted'): Promise<void>;  // FR-SY-13
  grantDekWrapForNewDevice(targetDeviceId: string, targetDevicePub: Uint8Array): Promise<void>; // C-D
}

export type SyncStatusSnapshot = {
  state: 'idle' | 'syncing' | 'success' | 'error' | 'offline-only' | 'rekey-in-progress';
  lastSyncedAt: number | null;
  outboxPending: number;
  outboxDeadLetter: number;
  lastError: { code: string; message: string } | null;
  currentKeyId: number;
  lastSeenAccountCommitSeq: number;
};
```

### 4.2 Tauri commands(Rust 侧 v0.3 重写,C-06 / C-A / C-D / C-G / FR-SY-75 / FR-SY-76)

> **重要变更**:JS 永远不接触 raw KEK / DEK,只拿 `KeyHandleId`(u32)。Rust 侧 KeyVault 统一管理密钥生命周期 + 自动组 AAD。Tauri `capabilities/main.json` 限制 `crypto_*` 命令调用方为 `plugin-account` + `core-data` 两个 plugin。

```rust
// 类型
pub struct KeyHandleId(u32);   // opaque id,JS 侧只见到这个

pub enum KeyKind { Kek, Dek }
pub struct KeyVault { /* in-memory map<KeyHandleId, ZeroizeBox<[u8;32]>> */ }

// ── 派生 + 缓存 ──────────────────────────────
#[tauri::command]
async fn crypto_derive_kek(
    master_password: String,
    secret_key: Vec<u8>,
    kek_salt: Vec<u8>,
    kek_kdf_version: u8,
) -> Result<KeyHandleId, String>;
// 内部:Argon2id(master_password, salt=kek_salt, secret=secret_key, t=3, m=64MiB, p=4)

#[tauri::command]
async fn crypto_derive_auth_password(
    master_password: String,
    secret_key: Vec<u8>,    // v0.3 H-L:auth_password 必含 secret_key
    email: String,
) -> Result<String, String>;
// 内部:HKDF(master_password ‖ secret_key, salt=email||"xai.auth.v1") + Argon2id(t=1,m=16MiB,p=1)

// v0.4 C-A 修订:device key 由本地 CSPRNG 独立生成,不从 KEK 派生
#[tauri::command]
async fn crypto_generate_device_keypair(
    account_id: String,
    device_id: String,
) -> Result<(KeyHandleId /*device_priv handle*/, Vec<u8> /*device_pub 32B*/), String>;
// 内部:device_priv = csprng(32); device_pub = X25519_compute_pub(device_priv);
//       keychain_set("xai.devicekey.{account_id}.{device_id}", device_priv,
//                    accessibility=WhenUnlockedThisDeviceOnly, acl=bundle_id);
//       device_priv 立即 zeroize 内存(只留 Keychain + KeyVault handle)

// v0.3 C-D 改:DEK 不再由 KEK 解,改由 device_priv 解 device_dek_wraps row
#[tauri::command]
async fn crypto_unwrap_dek_for_device(
    device_priv_handle: KeyHandleId,
    wrap_envelope: Vec<u8>,             // X25519 sealed_box from device_dek_wraps[*].wrap
    account_id: String,
    target_device_id: String,
    key_id: u32,
    granted_by_device_id: String,
) -> Result<KeyHandleId /*dek_handle*/, String>;
// 内部:X25519_decrypt + 验 CBOR AAD = wrap AAD schema (§7.1.2.2)

// v0.3 C-D 新:为新 device 生成 wrap (donor 操作)
#[tauri::command]
async fn crypto_wrap_dek_for_devices(
    dek_handle: KeyHandleId,
    targets: Vec<(String /*device_id*/, Vec<u8> /*device_pub*/)>,
    account_id: String,
    key_id: u32,
    granted_by_device_id: String,
) -> Result<Vec<Vec<u8> /*wrap envelopes*/>, String>;

// v0.3 C-A 新:Ed25519 recovery 签名
#[tauri::command]
async fn crypto_recovery_keypair_from_dek(
    dek_handle: KeyHandleId,
) -> Result<(KeyHandleId /*recovery_priv*/, Vec<u8> /*recovery_pub 32B*/), String>;
// 内部:recovery_seed = HKDF-Expand(DEK, "xai.recovery.sig.v1"); Ed25519_from_seed

#[tauri::command]
async fn crypto_recovery_sign_payload(
    recovery_priv_handle: KeyHandleId,
    challenge_id: String,
    account_id: String,
    // v0.4 C-E 修订:message 绑定完整 payload canonical hash,不再字段级 hash 白名单
    new_payload_canonical_cbor: Vec<u8>,      // 整个 new_payload 的 CBOR canonical encoding
    ts_ms: u64,
) -> Result<(Vec<u8> /*cbor message*/, Vec<u8> /*signature 64B*/), String>;
// 内部:payload_canonical_hash = SHA256(new_payload_canonical_cbor);
//       message = CBOR_canonical({1: 1, 2: challenge_id, 3: account_id,
//                                  4: payload_canonical_hash, 5: ts_ms});
//       Ed25519_sign(recovery_priv, message)

// ── 业务侧加解密(JS 永远不传 key,v0.3 AAD 用 CBOR)─────
#[tauri::command]
async fn crypto_encrypt_for(
    dek_handle: KeyHandleId,
    entity_type: String,
    entity_id: String,
    proposed_revision: u64,    // v0.3 C-E:client 提交 = base+1
    key_id: u32,
    deleted_flag: u8,
    schema_version: u32,
    // ⚠ v0.4 H-9:encryption_device_id 不再由 JS 传,Rust KeyVault 从可信本地 device state 读
    plaintext: Vec<u8>,
) -> Result<Vec<u8>, String>;
// 内部:从 device state 读自己的 encryption_device_id;
//       校验 SQLCipher.next_counter >= Keychain.high_water(C-C 锚点);
//       AAD = CBOR_canonical map (§7.1.2.1);nonce = enc_dev_id || counter

// v0.4 C-C 新:nonce 锚点校验(可独立调,Phase 4.8 演练 / 启动检查)
#[tauri::command]
async fn crypto_check_nonce_anchor(
    account_id: String,
    key_id: u32,
) -> Result<bool /*ok*/, String>;
// 内部:对比 SQLCipher.nonce_counter[key_id].next_counter vs Keychain.high_water_<account_id>_<key_id>
//       若 SQLCipher < Keychain → 备份回滚检测到 → 返回 E3021,client 触发 Re-key

#[tauri::command]
async fn crypto_decrypt(
    dek_handle: KeyHandleId,
    envelope: Vec<u8>,
    entity_type: String,
    entity_id: String,
    expected_revision: u64,     // AAD 校验值
    deleted_flag: u8,
    schema_version: u32,
) -> Result<Vec<u8>, String>;
// 内部:从 envelope 取 encryption_device_id + counter 重建 nonce;按调用方提供的 AAD schema 重建

// ── BIP-39 24 词助记词 ─────────────
#[tauri::command]
async fn crypto_bip39_encode_24w(dek_handle: KeyHandleId) -> Result<String, String>;
#[tauri::command]
async fn crypto_bip39_decode_24w(mnemonic: String) -> Result<KeyHandleId, String>;

// ── handle 生命周期 ─────────────────────────
#[tauri::command]
async fn key_vault_drop(handle: KeyHandleId) -> Result<(), String>;

// ── SQLCipher / Keychain ────────────────────
#[tauri::command]
async fn sqlcipher_open(kek_handle: KeyHandleId, db_path: String) -> Result<(), String>;
#[tauri::command]
async fn keychain_set(key: String, value: Vec<u8>) -> Result<(), String>;
#[tauri::command]
async fn keychain_get(key: String) -> Result<Vec<u8>, String>;
#[tauri::command]
async fn keychain_delete(key: String) -> Result<(), String>;
#[tauri::command]
async fn network_reachability_listen() -> Result<(), String>;
```

**Capability config**(`apps/desktop/src-tauri/capabilities/main.json`):
```jsonc
{
  "permissions": [
    { "identifier": "crypto:*",
      "allow": [{ "plugin": "plugin-account" }, { "plugin": "core-data" }],
      "deny": [{ "plugin": "*" }, { "window": "renderer-*" }] }
  ]
}
```

### 4.3 Realtime channel 契约(v0.3 H-I:必 private:true)

```typescript
// 客户端订阅 — 必须 config.private = true,启用 Supabase Realtime Authorization
const channel = supabase.channel(`sync:${accountId}`, {
  config: { private: true },   // H-I 强制,无此参数走 public 模式 = 任意 authenticated 用户可订阅
});

channel
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'encrypted_blobs',
    filter: `account_id=eq.${accountId}`,
  }, (payload) => {
    syncEngine.onRealtime({
      entityType: payload.new.entity_type,
      entityId: payload.new.entity_id,
      commitSeq: payload.new.commit_seq,                  // v0.3 替代 server_updated_at
      originatorDeviceId: payload.new.originator_device_id,
    });
  })
  .subscribe();

// 同时配置 realtime.messages RLS policy(supabase/realtime/policies.sql):
// CREATE POLICY private_sync_channel ON realtime.messages
//   USING (extension = 'postgres_changes'
//          AND realtime.topic() = 'sync:' || auth.uid());
//
// 集成测试:user_B 订阅 sync:<user_A_id> → 必须返回 0 消息

// device_joined 事件(C-D donor 监听)
channel.on('broadcast', { event: 'device_joined' }, (payload) => {
  // payload.new = { new_device_id, new_device_pub }
  syncEngine.grantDekWrapForNewDevice(payload.new_device_id, payload.new_device_pub);
});
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
| `sync/engine` | ≥ 80% | mutation 入队 + DAG 合并、push batch (proposed_revision=base+1)、pull 应用 (revision rollback 拒收)、conditional write 冲突路径 (FR-SY-71 shadow)、squash 规则 (H-N) |
| `crypto/aad_cbor` | 100% | 3 条测试向量 Rust+Python+JS 一致 (C-G);恶意输入不 panic |
| `crypto/ed25519_recovery` | 100% | sign/verify round-trip;message hash 不一致拒收 (C-A) |
| `crypto/per_device_wrap` | 100% | X25519 sealed_box round-trip;撤销 device 删 wrap → 解密失败 (C-D) |
| `crypto/nonce_counter` | 100% | checkpoint 预写;backup 回滚检测 (C-C R-10.18) |
| `sync/outbox` | ≥ 80% | 顺序回放、合并、死信、退避 |

### 5.2 模糊测试(fuzz)— Phase 5 引入

- `cargo-fuzz` 目标:`envelope_parse`(任意 bytes → 不 panic,要么返回 Err 要么返回 valid struct)
- `cargo-fuzz` 目标:`decrypt`(任意 envelope + 任意 key → 不 panic)
- 连续运行 24h 无 crash 才能进 Phase 5 验收(PRD §10.2)

### 5.3 集成测试(Phase 5 重头,v0.3 重写 — 移除所有 LWW / server clock 表述)

`packages/plugin-account/tests/integration/`:
- 两个 in-memory SQLite + mock Supabase REST server(用 `msw` 或自建 fake)
- 场景矩阵:
  1. 同设备多窗口写入(只本地事件,不走 server)
  2. 双设备分别写入不同 entity → 各自 push → 各自 pull → 最终一致
  3. **双设备同时写同一 entity → 后到者 base_revision 错 → server 返 409 + loser 入 conflict shadow**(v0.3 H-G / FR-SY-71;原"LWW server 时钟为准"废弃)
  4. **双设备同时删 + 双设备同时写 → 按 commit_seq 决胜,delete 也是 mutation 无特殊优先级**(v0.3 H-03;原 tombstone-优先废弃)
  5. 离线写 200 条 → outbox squash 同 entity 多次写 → 上线 flush → 与对端一致(H-N)
  6. 离线 + 写 + 服务端被对端先写过 → 上线 flush → conflict 走 shadow → toast 提示用户恢复 loser
  7. 弱网:推一条卡 10s → 重试 → 成功(mutation_id 幂等,server 第二次返回 duplicate_mutation_id)
  8. quota 触限 → 降级到只读
  9. **v0.3 新:server 调包 blob A→B 位置 → AAD 不一致 → client 解密失败 + audit log + 告警**(C-G FR-SY-67)
  10. **v0.3 新:server UPDATE 旧 revision → client 拒收 (FR-SY-68) + E3015 告警** (C-E)
  11. **v0.3 新:撤销 device A → device A 即使再 login(secret_key 仍正确)→ 取不到新 DEK_v_n+1 wrap → 不能解新 blob**(C-D R-10.11)
  12. **v0.3 新:无 recovery proof signature 直接 PATCH /auth/me → 拒绝 + E3014**(C-A C-B)
  13. **v0.3 新:client 直接 UPDATE accounts 敏感列(绕过 Edge Function)→ RLS 拒绝**(C-B)
  14. **v0.3 新:SQLite backup 回滚后 next_counter > checkpoint_high_water → 加密拒绝 + 触发 Re-key**(C-C R-10.18)
  15. **v0.3 新:Re-key 期间在线写入 → snapshot_commit_seq 之前用 DEK_v_n → 之后用 DEK_v_n+1 → swap 时一致**(FR-SY-13 H-E)
  16. **v0.3 新:新 device 注册 → donor device 5 分钟未响应 → 进 pending_user_action → 助记词恢复路径** (C-D / §3.4.1)

### 5.4 E2E(Phase 5 末)

- 真机两台 Mac(Sonoma + Sequoia)+ 一台 Chrome 同账号
- 跑 PRD §10.2 全部清单
- toxiproxy 注入网络故障组合

### 5.5 恢复演练(Phase 5 末,v0.2 修订为 4 次,对应 PRD §10.2)

| 场景 | 剧本 | 预期 |
|---|---|---|
| **① 服务端 staging 数据全删 → 助记词 + 设备协作恢复**(M-06 修订) | 1. 在客户端 A(SQLite 仍完整)执行 staging Supabase 表全 DELETE<br>2. 客户端 A 用 KEK 解 SQLCipher → 读所有明文 → 用同一 DEK 重加密 → 全量 push 到 server<br>3. 客户端 B(全新设备)输入邮箱 + master_password + 24 词助记词 + 新 secret_key<br>4. recovery proof PATCH `/auth/me`<br>5. 全量 pull | A B 数据一致;旧 server cursor reset;commit_seq 从 1 重新开始 |
| **② 客户端 SQLite 全删,登录后全量 pull** | 删除 `~/Library/.../xai.db*`;重启应用 → 重新登录 → 全量 pull | 5 分钟内恢复完整数据 |
| **③ Re-key 中途 `kill -9`** | 触发 Re-key(用户主动或撤销设备)→ 在 staging 30% / 70% / swap 前 / swap 后 4 个点 `kill -9` 进程 → 重启 | 数据一致:staging 未 swap → 回滚 + 重试;已 swap → 继续(keyring 双读保证) |
| **④ 设备撤销 → 强制 Re-key 演练**(R-10.11) | 1. 双设备 A B 同账号<br>2. A 上撤销 B → server 走 `sync_devices.revoked_at = now()` + 触发 Re-key<br>3. B 设备即使保留 KEK + 旧 DEK,**重新登录后**也无法解新 blob(新 blob 用 DEK_v2 加密,旧 DEK 在 keyring 标 retired) | B 设备解新 blob 失败;A 设备正常 |

### 5.6 RLS audit(Phase 0 起,每月跑)

- 自动测试:模拟 user_A 用 token 访问 user_B 的 blob → expect deny
- 模拟 anon role 访问 → expect deny
- 模拟 service_role 访问 → ok(但服务端代码绝不直接拿 service_role 给 client 用)

---

## 6. 风险登记(R-10 子分解 + 新增)

主 PRD §12 R-10 已标 🔴 高。这里展开。

| ID | 风险 | 等级 | 缓解 | 监控 |
|---|---|---|---|---|
| R-10.1 | GCM nonce 复用 | 🔴 高 | **v0.3**:deterministic nonce = encryption_device_id (server 分配 unique per device,8B) ‖ counter (per device per key,4B + SQLCipher 预写 checkpoint 防 backup 回滚) (C-C);counter 达 2^32 强制 Re-key;单测断言 1M unique | unit + fuzz + backup 回滚演练 |
| R-10.2 | 主密码丢 = 数据丢 | 🔴 高 | 助记词 + UI 强提示 + 不承诺找回 | 用户教育 |
| R-10.3 | 分布式写入冲突丢数据 | 🟡 中 | **v0.3**:commit_seq 权威 + conditional write + conflict shadow 30 天 + DAG 拓扑合并 | sync_audit_log |
| R-10.4 | RLS 漏洞 | 🟡 中 | 自动测试 + 月度 audit;零知识 fallback | RLS audit |
| R-10.5 | encrypted_dek 损坏 | 🔴 高 | server backup + 本地 Keychain cache 副本 | server backup |
| R-10.6 | Re-key 中断 | 🔴 高 | 两阶段提交 + 中断恢复演练 | 演练记录 |
| R-12 | Supabase 凭据(service_role / JWT)泄漏 | 🟡 中 | 季度轮换 SOP + CI secret 隔离 + GitHub secret scanning | 轮换记录 |
| R-13 | conditional write 算法实现错误导致数据丢失 | 🔴 高 | **v0.3**:单测 base_revision/proposed_revision 矩阵 + 集成场景 3/4/15 + Phase 5 fuzz 一周 | 演练 |
| R-19 | per-device wrap 实现复杂度引入 bug | 🟡 中 | TLA+ 模型必含设备撤销与新 device 加入场景;Phase 4.8 准入门;真机 4 演练剧本 | TLA+ + 演练 |
| R-20 | Ed25519 / X25519 误用(常见:错误 seed 长度/编码) | 🟡 中 | 用 `ed25519-dalek` + `x25519-dalek` rust-crypto 系列;3 条测试向量;wycheproof 测试集 | 单测 + 向量 |
| R-21 | CBOR canonical encoding 跨实现不一致 | 🟡 中 | Rust + Python + JS 三实现交叉验证;3 条向量入 CI;`ciborium` + `cbor2` + `cbor-x` | CI |
| R-14 | Supabase RLS 漏配 | 🔴 高 | 每张表 RLS 强制 enable + CI 检查;`SET ROLE authenticated` 自动测试;Phase 0 就上 | CI |
| R-15 | Supabase Free tier 突然限流 / 改价 | 🟡 中 | data 层抽象 + 协议设计可移植;若需要可迁自建 PG + 自己 Realtime(WebSocket server) | 月度账单 |
| R-16 | Realtime 在企业代理 / VPN 下失败 | 🟡 中 | fallback 到主动 polling 模式(15s 间隔);UI 显示"Realtime 不可用,正在轮询同步" | Sentry 错误率 |
| R-17 | 助记词存储不当导致泄漏(用户截图存 iCloud) | 🟡 中 | UI 引导文案 + 鼓励"打印纸质保存";不上传助记词 hash 用于验证(可选 P1) | — |
| R-18 | **Supply chain 攻击(npm / crates / Tauri 自动更新)** | 🟡 中 | v0.2 强化(H-13):① 加密**全在 Rust 侧**(`aes-gcm` / `argon2` / `bip39` / `sqlcipher` 等)走 Tauri command,TS 侧不持有 raw key;② `cargo vet` + `cargo crev` 审查所有 crypto 依赖;③ npm `pnpm` lockfile 配 [Sigstore npm signature](https://docs.npmjs.com/generating-provenance-statements) 校验;④ GitHub Action 加 `actions/dependency-review-action` 阻断高危依赖;⑤ Tauri capability strict allowlist(见 §4.2);⑥ 自动更新走签名验证(主 PRD §5.10.1 集成);⑦ Reproducible build:hermetic Docker + SHA256 入 release notes | 每月 audit + CI 自动 |

---

## 7. 验收门(GA 前 Sync 必达标准)

Phase 5 完成 → Phase 6 公测 / 上架前,Sync 必须全部满足:

1. **功能完整**:PRD §5 全部 P0 FR(41 条 + 主 PRD §5.9 11 条 = 52 条 P0)完成,各自有单测覆盖
2. **性能合规**:PRD §8 全部指标 P95 达标(TECHNICAL_REQUIREMENTS §1.2 性能回归门)
3. **安全演练通过**:
   - fuzz 24h 无 crash
   - RLS 自动测试 100% 通过
   - **4 个恢复演练全通**(§5.5,v0.3 含设备撤销 → 强制 Re-key 演练)
   - 凭据轮换 SOP 演练一次
4. **真机验收**:PRD §10.2 13 条全过(v0.3 含零知识 PoC / SQLite dump PoC / 加密导出 PoC / 设备撤销 re-key 演练 / 调包 / rollback / CBOR 一致 / 协议硬化里程碑准入门)
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
| 2026-05-15 | **v0.2-DRAFT(协议硬化联动)** | 与 PRD v0.2 联动。主要变更:<br>① **新增 Phase 4.8 协议硬化里程碑(~2 周)**;Phase 5 之前必须完成 AAD / revision / recovery proof / Re-key keyring / TLA+ 模型 / RLS fuzz / Tauri capability allowlist<br>② Phase 0 子阶段 0.3 工日从 5-7 重估为 **10-14**,任务清单从 T-01~T-14 扩到 T-01~T-20<br>③ Phase 5 工日从 3-4 周重估为 **4-5 周**<br>④ **Tauri command 重写**(§4.2):JS 只拿 opaque KeyHandleId,Rust 侧 KeyVault 持有 raw key + 自动组 AAD;capability allowlist 限 plugin-account / core-data<br>⑤ **R-18 supply chain 强化**:cargo vet + sigstore + dependency-review + reproducible build<br>⑥ 恢复演练从 3 次扩到 **4 次**,含设备撤销 → 强制 Re-key 演练(R-10.11);恢复剧本修正(M-06)<br>⑦ 测试策略加 property-based / TLA+ / RLS fuzz / `kill -9` 注入<br>⑧ 验收门 §7 加入"REVIEW-2026-05-15.md Critical + High 全数关闭" |
| 2026-05-16 | **v0.3-DRAFT(协议硬化第二轮联动)** | 与 PRD v0.3 联动。主要变更:<br>① **TypeScript §4.1 重写**:version→revision/proposedRevision/baseRevision、serverUpdatedAt→commitSeq、deletedAt→softDeleted/hardDeleted;加 PushResultItem 5 status、PullResponse.currentAccountCommitSeq(H-A)、DeviceDekWrap、RecoveryChallenge/RecoveryProofPayload;pullSince 改全局 cursor(H-J)<br>② **Tauri command §4.2 扩展**:加 crypto_derive_device_keypair / crypto_unwrap_dek_for_device / crypto_wrap_dek_for_devices(C-D)、crypto_recovery_keypair_from_dek / crypto_recovery_sign_payload(C-A);auth_password 派生加 secret_key 入参(H-L);AAD 改 CBOR(C-G)<br>③ **Realtime §4.3 加 `config:{private:true}`**(H-I);加 device_joined broadcast(C-D)<br>④ **测试策略 §5.3 重写**:移除所有 LWW / server clock 表述,加 v0.3 8 个新场景<br>⑤ **风险表 §6 加 R-19~R-21**(per-device wrap 复杂度 / Ed25519 X25519 误用 / CBOR encoding 跨实现一致);单测覆盖加 4 个新模块<br>⑥ **GA 数字对齐**:恢复演练 3→4,真机验收 7→13<br>⑦ Phase 0 工日 10-14→**14-18**;Phase 4.8 2 周→**3 周**;Phase 5 4-5 周→**5-6 周** |
| 2026-05-16 | **v0.4-DRAFT(协议硬化第三轮联动,修复 v0.3 致命缺陷)** | 与 PRD v0.4 联动。主要变更:<br>① **C-A 致命修复**:Tauri `crypto_derive_device_keypair`(由 KEK 派生)废弃,改 `crypto_generate_device_keypair`(本地 CSPRNG + Keychain),旧设备不能算出新设备 device_priv<br>② **C-C 新命令** `crypto_check_nonce_anchor`:每次加密前校验 SQLCipher.next_counter vs Keychain.high_water,Time Machine 回滚拒绝<br>③ **H-9** `crypto_encrypt_for` 移除 `encryption_device_id` 入参,Rust KeyVault 从可信 device state 读<br>④ **C-E** `crypto_recovery_sign_payload` 改接收完整 payload canonical CBOR,签名绑定 `SHA256(payload_canonical)` 而非字段级 hash<br>⑤ **H-8 TypeScript**:`commitSeq` / `nextCommitSeq` / `currentAccountCommitSeq` 改 `string`(JSON number 精度不够 BIGINT)<br>⑥ **H-7**:`pullSince(cursor: string)` 全局账户级,删 entity_type 参数;`PullRecord` 必须含 `entityType`;`applyServerRecords(records)` 不再分 entity_type 调用<br>⑦ Phase 0 工日 14-18 → **16-22**;Phase 4.8 改"先 TLA+/property tests 再实现",最低模型必含 6 场景:设备撤销 + 新设备加入并发、rekey swap 前后 crash、offline squash revision、重复 mutation replay、staging delta replay、server rollback/equivocation<br>⑧ RLS fuzz 扩展为 same-account pending/revoked/stolen-token 组合 |
| 2026-05-16 | **v0.5-DRAFT(协议硬化第四轮联动)** | 与 PRD v0.5 联动。主要变更:<br>① **C-A 致命修复**:donor 自动 grant 被恶意服务端伪造攻击 → §3.4.1 重写为用户可验证设备配对(6 词 fingerprint + QR);Edge Function /sync/devices/grant_dek_wrap 要求 user_confirmed=true + confirmation_proof;UI 加"待确认设备" 流程<br>② **C-B**:encrypted_blobs schema 拆 encryption_device_id + counter 字段 + UNIQUE 索引;server 解析 envelope 头校验 JWT.device_id 对应<br>③ **C-C**:三端统一 server nonce lease 替代仅 Keychain 锚点;新表 nonce_lease + RPC fn_grant_nonce_lease;Web 端无 Keychain 也安全<br>④ **C-D**:Re-key 阻断式生成新 24 词 + 新 recovery_signing_pub;UI 强制回填 6 词;未确认禁止 swap<br>⑤ **C-E** §7.1.2.3 message schema 删字段级 hash,唯一 schema = payload_canonical_hash<br>⑥ **C-F** lazy encrypt 明确 one-shot push,删除两阶段 reservation 暗示<br>⑦ **High 12** 集中:H-1 pending→active 唯一事务;H-3 entity_state 加 last_blob_hash + last_commit_seq + last_key_id;H-4 PullResponse 加 currentAccountCommitSeq;H-5 Realtime 触发 pull 改全局 cursor;H-6 conflict_shadow / staging SELECT 加 active device;H-7 注册 account_id = auth.users.id;H-8 DDL 顺序 + commit_seq SECURITY DEFINER SQL;H-11 TypeScript BIGINT 统一 string<br>⑧ **Phase 0 工日** 16-22 → **18-24**;**Phase 5 工日** 5-6 周 → **6-7 周**;Phase 4.8 加新场景:donor grant 伪造攻击 / nonce reuse 提交 / Web 备份回滚 / Re-key 助记词阻断 |

— END —
