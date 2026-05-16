# Sync 子 PRD — XAI_Desktop 同步数据通道

| 字段 | 值 |
|---|---|
| 父 PRD | `docs/planning/2026-05-12-PRD-v1.md`(主 PRD §5.9) |
| 范围 | 账号系统 + E2E 加密同步协议 + Realtime + 离线队列 + 冲突解决 + 多设备协调 |
| 归属 plugin | `packages/plugin-account/`(主)+ `packages/core-data/`(REST driver) |
| 归属 Phase | Phase 0 子阶段 0.3(骨架)+ Phase 5(完善) |
| 关联 ADR | ADR-0002 双轨发布(沙箱网络 entitlement)、ADR-0003 三个面架构(数据层一致性) |
| 文档作者 | Claude(subagent) |
| 创建日期 | 2026-05-14 |
| 最后更新 | 2026-05-14 |
| 状态 | DRAFT |

---

## 0. 文档定位

本文档是**主 PRD §5.9 + TECHNICAL_REQUIREMENTS §2.1/§2.4 的协议级展开**:

- **不重复**:主 PRD §5.9 已有的 11 条 FR(FR-AC-01~05 / FR-SY-01~06)、TECHNICAL_REQUIREMENTS §2.1 的密钥层级、§2.4 的简版 E2E 协议、§2.5 的隐私默认值——这些是 source of truth,本文档**引用**而不复述。
- **专注**:把那些点扩展成可实施的**完整协议规格** —— 算法参数、消息格式、错误码、状态机、表 schema、冲突解决细节、Realtime 通道设计、离线队列回放规则、凭据轮换、审计、速率限制、成本控制、零知识承诺的工程边界。
- **不做**:UI 设计稿(由 Console / Overlay 各自子 PRD 负责消费 Sync 暴露的 hooks)。

读者:Sync 实现者(主要是我自己)、未来的代码审计人、可能的合规审查方。

---

## 1. 产品目标

### 1.1 为什么必做(决策 A 复述)

主 PRD §5.9 + 2026-05-12 决策 A 已经定:v1 GA 必含完整账号 + 云同步。理由:

1. **三个面(overlay / console / web)需要单一数据源**。没有 Sync = 网页版(Phase 4.5)无法存在 = ADR-0003 三个面架构塌。
2. **多设备是付费转化的核心抓手**:用户买一次,Mac + 网页都用 = 显性价值;只单机 = 与 Maccy 等竞品无差异。
3. **零知识承诺是差异化卖点**:对标滴答清单/Trello,XAI 用 E2E 端到端加密,服务端拿不到内容 = 隐私偏执用户的首选。

### 1.2 关键非目标

- **不做团队协作**(v1 单人;v2 评估)。一个 account_id 对应一个真人。
- **不做 CRDT**(v1 LWW;v2 评估)。冲突极少见且代价小于实现 CRDT 的工程成本。
- **不做端到端实时编辑**(v1 Realtime 仅做"另一端有新版本,请 pull" 的通知,不做协同编辑光标 / OT)。
- **不做剪贴板 / 番茄 session / 桌宠行为同步**(隐私决策 + 价值低,详见 §4)。

### 1.3 长期粘性逻辑

```
注册免费账号 (FR-AC-01)
   ↓ 同步打通 (FR-SY-01~06 + 本文档扩展)
跨设备使用 (Mac + Web)
   ↓ 越多设备 = 越难离开
转付费 / 推荐他人
```

Sync 是这条链的关键节点;Sync 体验差 = 整个商业逻辑断。这就是为什么主 PRD §12 把 R-10 标 🔴 高。

---

## 2. 威胁模型(Threat Model)

本节是后续所有 FR 的论证基础。每个加密类 FR 都映射到下面某个攻击者。

| 攻击者 | 能力 | 后果上限(对我们想保护的资产) | 防护层 |
|---|---|---|---|
| **T1. 服务端被攻破 / 拖库** | 拿到 Supabase Postgres dump + service_role key | **最多拿到 encrypted blob + metadata(updated_at / device_id / entity_type)**。**拿不到任何明文用户数据**(todos 标题、note 内容、grid 配置等)。 | FR-SY-30 服务端零知识承诺 + FR-SY-31 RLS |
| **T2. 中间人(MITM)** | 拿到 HTTPS 流量、可篡改 | TLS 1.3 + cert pinning(FR-SY-33)阻断;退化场景下仍是 encrypted blob,攻击者看不到明文 | FR-SY-33 |
| **T3. 本机被盗(未解锁)** | 物理拿到用户 Mac、设备锁屏 | macOS Keychain `WhenUnlockedThisDeviceOnly` 保护 refresh_token + KEK 缓存,设备锁屏状态下取不到 | FR-AC-08 |
| **T3'. 本机被盗(已解锁 / 已登录)** | 物理拿到 Mac,且已登录 + Keychain 解锁 | 攻击者可读所有数据。**这是认可的残余风险**——本机已登录态超出我们的威胁边界(等同于"已登录的浏览器") | 用户教育:启用 macOS 用户密码 + screen lock |
| **T4. 用户忘主密码** | 失去 KEK 派生能力 | **数据无法恢复**。零知识承诺的代价。唯一恢复路径:首次注册时备份的**助记词**(FR-AC-10) | FR-AC-09 强提示 + FR-AC-10 助记词 |
| **T5. 用户被胁迫**(rubber-hose) | 攻击者强迫用户输入主密码 | 任何 E2E 系统都防不住。**显式不防护**。 | — |
| **T6. 恶意 plugin / 同进程攻击** | 第三方 plugin 沙箱逃逸,读到 KEK / DEK | KEK 不出 macOS Keychain process,DEK 在内存仅作用于加解密临时计算 | FR-SY-25 内存加密层隔离 + 主 PRD §5.10.1 plugin 沙箱 |
| **T7. Realtime 通道被窥探** | 拿到 WebSocket 流量 | 同 T2,看到的仍是 encrypted blob + entity_id;**entity_id 不加密**(用于路由)——这是泄漏面,见 §10 | FR-SY-22 通道加密 |
| **T8. 凭据泄漏**(API key、JWT secret) | 拿到 Supabase service_role key | 等同 T1 | FR-SY-32 凭据轮换 SOP |
| **T9. 离线设备返回**(stale device) | 一台设备长期离线后联网 | 离线队列可能与服务端冲突;LWW 可能让该设备的"旧"编辑丢失 | FR-SY-15 离线 → 全量同步降级 + FR-SY-12 用户撤销 |

**显式不防护的攻击向量**:T5(胁迫)、T3'(已登录本机被盗)、社工拿走助记词。

---

## 3. 密钥层级与流程

### 3.1 层级图(扩展 TECHNICAL_REQUIREMENTS §2.1.1)

```
[ 用户主密码 (永不出内存 / 永不写盘) ]
              │
              │  Argon2id  (t=3, m=64 MiB, p=4, salt=随机 16B 存账号 metadata)
              ▼
[ KEK   32 bytes ]   ──→  缓存到 macOS Keychain
              │                kSecAttrAccessibleWhenUnlockedThisDeviceOnly
              │                key = "xai.kek.<account_id>"
              │
              │  AES-256-GCM  解密
              ▼
[ DEK   32 bytes ]   ←── encrypted_dek 来自服务端(account row)
              │
              │  AES-256-GCM  加密(每条 record nonce 独立)
              ▼
[ encrypted_blob ]   ──→  上传 server.encrypted_blobs.blob 字段

[ 助记词 12 词 ]  =  BIP-39 编码的 DEK 备份(首次注册时一次性展示,用户必须确认)
```

关键不变式:
1. **主密码 永不写盘 / 永不发服务端**。仅在 PasswordPrompt UI 输入瞬间存在于 zeroized 字节数组,派生 KEK 后立刻擦除。
2. **KEK 永不出 Keychain**。从 Keychain 取出后立即用,用完立即 zeroize。重启时重新派生 / 重新取出。
3. **DEK 来自服务端(加密形式)**,本地解密后只在内存。Plugin 不能直接访问 DEK,必须通过 `core-data` 暴露的 `encrypt(record) / decrypt(blob)` 服务接口。
4. **服务端 永不见 KEK 也永不见 DEK 明文**。看到的只有 encrypted_dek、encrypted_blob。

### 3.2 Argon2id 参数固化

| 参数 | 值 | 论证 |
|---|---|---|
| t(迭代) | 3 | OWASP 2024 推荐下限 |
| m(内存) | 64 MiB | 在 macOS 上 ~300ms,可接受 |
| p(并行) | 4 | 现代 Mac 8+ 核充裕 |
| salt | 16 字节随机 / 每账号唯一 | 存 server.accounts.kek_salt |
| 输出长度 | 32 字节 | 喂 AES-256 |

**版本字段**:account row 必须有 `kek_kdf_version INTEGER`(初版=1)。升级路径预留 v2(scrypt / Argon2id 调参后)。

### 3.3 首次注册流程(FR-AC-01 扩展)

```
[Client]                                                [Server]
   │
   │ 1. 用户输入 email + master_password
   │
   │ 2. 客户端生成:
   │    - kek_salt           = csprng(16)
   │    - DEK                = csprng(32)
   │    - account_id         = uuidv7()
   │    - mnemonic           = BIP39_encode(DEK)        ← 用户唯一恢复路径
   │
   │ 3. KEK = Argon2id(master_password, kek_salt)
   │ 4. encrypted_dek = AES256GCM(DEK, key=KEK, nonce=csprng(12))
   │    形式: { v=1, nonce: 12B, ciphertext: 32B, tag: 16B }
   │
   │ 5. POST /auth/signup
   │   ──────────────────────────────────────────────────→
   │   { account_id, email, password_hash_for_supabase,
   │     kek_salt, kek_kdf_version=1, encrypted_dek }
   │                                                          (Supabase auth: 标准 email+pwd)
   │                                                          (accounts 表插一行,包含我们的字段)
   │   ←──────────────────────────────────────────────────
   │   { access_token, refresh_token }
   │
   │ 6. UI 强制流程:展示助记词,用户必须打字回填某 3 个词 ✅
   │ 7. 标记 mnemonic_acknowledged=true(本地 + 服务端 audit log)
   │ 8. refresh_token 存 macOS Keychain
   │ 9. KEK 缓存到 macOS Keychain(WhenUnlockedThisDeviceOnly)
   │ 10. 全部内存中的 DEK / master_password / KEK 临时副本 zeroize
   │
```

注意:Supabase 用户密码哈希是 Supabase 内部的(用于登录认证),与 KEK 派生**完全独立**。即"Supabase 见的密码哈希只能用来 login,不能解 KEK"。

### 3.4 新设备登录流程(FR-AC-02 扩展)

```
[Client B]                                              [Server]
   │
   │ 1. 输入 email + master_password
   │ 2. POST /auth/login → access_token, refresh_token
   │ 3. GET /auth/me  ←  { kek_salt, kek_kdf_version, encrypted_dek }
   │ 4. KEK = Argon2id(master_password, kek_salt)
   │ 5. DEK = AES256GCM_decrypt(encrypted_dek, key=KEK)
   │ 6. 若 GCM auth-tag 校验失败 → 密码错(给"密码错"提示,而非"数据损坏")
   │ 7. 缓存 refresh_token + KEK 到 Keychain
   │ 8. 注册 device_id(uuidv7),POST /sync/devices/register
   │ 9. 触发首次全量 pull(增量同步,since=0)
```

### 3.5 主密码重置(不可恢复路径,FR-AC-03 限制)

**关键决策**:主密码"重置"不是"找回"。

- 用户走"忘记密码" → Supabase auth 走标准邮件验证流程,重置 Supabase 登录密码;**但 KEK 没换** = encrypted_dek 还是旧 KEK 加密的 = 旧 DEK 不可恢复 = **数据不可读**
- UI 必须在重置流程最后一步弹**红色警告**:"重置 Supabase 登录密码后,你必须用助记词恢复数据,否则旧数据将全部丢失。是否继续?"
- 走到这里且用户没助记词 = 默认丢全部数据;允许用户选"清空云端 + 用新密码重新开始"(等效首次注册)

### 3.6 助记词恢复流程(FR-AC-10)

```
[Client]
  │ 1. 用户输入 12 词助记词
  │ 2. DEK = BIP39_decode(words)
  │ 3. 让用户设新 master_password
  │ 4. kek_salt' = csprng(16)
  │ 5. KEK' = Argon2id(new_password, kek_salt')
  │ 6. encrypted_dek' = AES256GCM(DEK, key=KEK', nonce=csprng(12))
  │ 7. PATCH /auth/me  { kek_salt', encrypted_dek', kek_kdf_version=1 }
  │ 8. 后续同新设备登录流程
```

如此用户主密码可换,DEK 不换,历史数据可继续读。

---

## 4. 同步范围矩阵

完整覆盖主 PRD §8 所有表。**这张表是 FR-SY-01 的细化版**。

| 表 / 实体 | 上传? | 加密粒度 | 频率/特殊处理 | 备注 |
|---|---|---|---|---|
| `accounts` | ✅ 元数据明文,KEK / encrypted_dek 字段加密 | metadata 明文 + 加密字段 | 注册 / 登录时 | 见 §3 |
| `settings` | ✅ | 整 row 加密 blob | 写时同步 | 用户偏好 / 主题 / 快捷键映射 |
| `grids` | ✅ | 整 row 加密 blob | 写时同步 | 不含 grid 内部 items |
| `grid_items` | ✅ | 整 row 加密 blob | 写时同步 | payload_json 内可能含本地文件路径 → 上传前 redact 见 §4.2 |
| `auto_classify_rules` | ✅ | 整 row 加密 blob | 写时同步 | |
| `lists`(Todo) | ✅ | 整 row 加密 blob | 写时同步 | |
| `todos` | ✅ | 整 row 加密 blob | 写时同步 + Realtime | 核心数据,优先级最高 |
| `todo_reminders` | ✅ | 整 row 加密 blob | 写时同步 | |
| `labels` | ✅ | 整 row 加密 blob | 写时同步 | |
| `label_assignments` | ✅ | 整 row 加密 blob(联合主键作为 entity_id) | 写时同步 | 跨模块绑定关系 |
| `habits` | ✅ | 整 row 加密 blob | 写时同步 | |
| `habit_logs` | ✅ | 整 row 加密 blob | 写时同步(可 batch) | 高频但小 |
| `boards` | ✅ | 整 row 加密 blob | 写时同步 | |
| `board_lists` | ✅ | 整 row 加密 blob | 写时同步 | |
| `board_cards` | ✅ | 整 row 加密 blob | 写时同步 + Realtime | |
| `board_card_checklist` | ✅ | 整 row 加密 blob | 写时同步 | |
| `notes` | ✅ | 整 row 加密 blob | 写时同步 | content_md 是主要载荷 |
| `progress_trackers` | ✅ | 整 row 加密 blob | 写时同步 | |
| `clipboard_items` | ❌ | — | 不上传 | **隐私决策** |
| `clipboard_ocr` | ❌ | — | 不上传 | |
| `pomodoro_sessions` | ❌ | — | 不上传 | **隐私决策** |
| `pets` | ✅ | 整 row 加密 blob | 写时同步 | 预置 + 自定义形象,跨设备一致 |
| `pet_memory` | ❌ | — | 不上传(v1) | 私密性偏好;v2 再评估 |
| `plugins`(已安装列表) | ✅ | 整 row 加密 blob | 写时同步 | 跨设备保持一致的插件清单 |
| `sync_state` | ❌(本地元数据) | — | 仅本地 | 每设备独立 |

### 4.1 上传字段细节

每条记录的"上传 row"在客户端形成时,**字段一律全部加密成一个 blob**(整 row JSON → AES-256-GCM → ciphertext)。服务端只看见:
```
{ entity_type, entity_id, version, updated_at, deleted_at, device_id, blob, nonce, tag, kdf_version }
```

服务端**不索引 row 内具体字段**(没法,看不到)。所有 entity 内部字段查询(如"找未完成的 todo")都在客户端 SQLite 上做,服务端只是 dumb store。

### 4.2 上传前 redact(grid_items.payload_json)

`grid_items.payload_json` 可能包含 macOS 绝对路径(`/Users/lijinlong/Documents/foo.pdf`)。上传前在 client 侧做:
- 替换 home dir 为 `$HOME`
- 不上传 `security_scoped_bookmark` 二进制(沙箱 token,跨设备无意义)
- 文件指纹 sha256 仍上传(用于跨设备识别"同一文件")

---

## 5. 功能需求

> 主 PRD §5.9 已有 11 条(FR-AC-01~05、FR-SY-01~06)。本节**新增** FR-AC-06 起 + FR-SY-07 起,共 **41 条新 FR**。
> 优先级:**P0 = v1 GA 必做(Phase 0 + Phase 5)**;**P1 = v1.x patch / 公测期补**;**P2 = v2 评估**。

### 5.1 账号(FR-AC-06~10)

| ID | 优先级 | 需求 | 验收标准 | Threat |
|---|---|---|---|---|
| FR-AC-06 | P0 | OAuth via Sign in with Apple / Google | 走 Supabase OAuth provider;登录成功后 Supabase auth 自动给 user_id,**但 KEK 派生仍需用户额外设置一个主密码**(不能用 OAuth provider 作为 KEK 源,因 OAuth 不掌握在我们手里) | T1 |
| FR-AC-07 | P0 | Refresh token 自动续期 | Supabase SDK 自动续期;access_token 过期前 60s 提前续;失败 3 次走"会话过期请重新登录"UI | — |
| FR-AC-08 | P0 | Refresh token + KEK 存 macOS Keychain | `kSecAttrAccessibleWhenUnlockedThisDeviceOnly`;查询前判断 device unlocked | T3 |
| FR-AC-09 | P0 | 主密码强提示 UI | 首次注册流程必含"主密码丢失=数据丢失"3 屏强提示;最后一屏要求打字回填某 3 个助记词的 word index | T4 |
| FR-AC-10 | P0 | 助记词恢复 | 输入 12 词 → 解出 DEK → 重设主密码 → 全量 pull(见 §3.6) | T4 |
| FR-AC-11 | P1 | TOTP 双因素(主 PRD FR-AC-05 P1) | Supabase MFA enrollment;登录时多一步 TOTP | T1/T3 |
| FR-AC-12 | P0 | 账号删除请求(GDPR 30 天硬删) | UI 入口 → 标记 accounts.deletion_scheduled_at = now + 30d;期间登录可撤销;期满 cron 硬删所有该 user 的 encrypted_blobs + accounts row + Supabase auth user | 合规 |
| FR-AC-13 | P0 | 账号删除前数据导出 | 强制删除前展示"导出全部数据"按钮(JSON / Markdown 双格式);用户点了再允许进入 30 天硬删流程 | 合规 |
| FR-AC-14 | P1 | 多设备列表 + 远程登出 | 设置页显示已登录设备(device_id / 名称 / last_active_at);可点"登出该设备"→ 服务端 revoke 该 device 的 refresh_token | T3 |

### 5.2 密钥与加密(FR-SY-07~14)

| ID | 优先级 | 需求 | 验收标准 | Threat |
|---|---|---|---|---|
| FR-SY-07 | P0 | 加密原语:AES-256-GCM, 12B 随机 nonce, 16B auth tag | 加密层独立单测,GCM round-trip 1M 次无错;nonce 来自 OsRng;**禁止 nonce 复用**(独立 record 独立 nonce) | T1/T2 |
| FR-SY-08 | P0 | 加密 envelope 格式 | `{ v: u8, kdf_v: u8, nonce: 12B, ciphertext: var, tag: 16B }`,小端紧凑二进制;v=1 固定 | T1 |
| FR-SY-09 | P0 | 解密失败 = 不影响其他 record | 单条 GCM tag 失败:标记该 entity 为 corrupted、记入 sync_audit_log、继续处理其他 record;不抛全局 panic | — |
| FR-SY-10 | P0 | 内存中 KEK / DEK 显式 zeroize | 使用 `zeroize` crate;Drop 时清内存;不允许 KEK / DEK 进 `serde::Serialize` 范围 | T3'/T6 |
| FR-SY-11 | P0 | 加密层版本字段 | account row 的 `kek_kdf_version` + blob 的 `v` 字段双重独立;允许未来 v2 升级时双写过渡 | 演进 |
| FR-SY-12 | P0 | 加密 / 解密 benchmark 预算 | 加密单条 1KB record < 0.5ms(P95)/ 解密 < 0.3ms;100 record batch encrypt < 50ms | 性能 |
| FR-SY-13 | P1 | Re-key 流程(用户主动换助记词) | UI 入口:生成新 DEK,客户端解密所有 encrypted_blobs → 用新 DEK 重新加密 → batch 上传;过程**不可中断**(原子性走"先建 staging blob,全部成功后 swap" 两阶段) | 应急 |
| FR-SY-14 | P0 | 加密原语 fuzz 测试 | 至少 1M 输入 fuzz(libfuzzer / cargo-fuzz);测 envelope parse / decrypt 在恶意输入下不 panic | T1 |

### 5.3 增量同步协议(FR-SY-15~21)

| ID | 优先级 | 需求 | 验收标准 |
|---|---|---|---|
| FR-SY-15 | P0 | 增量协议(client → server PUSH) | 客户端按 entity_type 维护 `local_updated_at`;PUSH batch 时携带每个 record 的 `version`(单调递增整数,本地) + `updated_at`(ms);见 §7 协议详细 |
| FR-SY-16 | P0 | 增量协议(server → client PULL) | 客户端按 entity_type 维护 `server_cursor`(= 上次 pull 拿到的最大 server_updated_at)。`GET /sync/pull?entity_type=todos&since=<cursor>&limit=500` |
| FR-SY-17 | P0 | Tombstone 删除 | 客户端不真删,标 `deleted_at`;同步上传后服务端也只标 deleted_at,**不物理删**(永久保留 tombstone) |
| FR-SY-18 | P0 | Batch 大小动态 | 上行 PUSH 默认 batch=50 records / 1MB;遇 5xx 或 timeout 自动减半;成功后逐步放大回去 |
| FR-SY-19 | P0 | 同步压缩 | HTTP body 自动 gzip(threshold ≥ 4KB);Realtime 走标准 WS permessage-deflate |
| FR-SY-20 | P0 | 全量同步降级 | 当 client 的 server_cursor 落后 server > 30 天 / records > 50k 时,触发全量 pull(分 page,UI 显示进度) |
| FR-SY-21 | P0 | 同步 P95 预算 | TECHNICAL_REQUIREMENTS §1.2 的预算(2s / 5s)在 1k records / 1MB blob batch 条件下 |

### 5.4 冲突解决(FR-SY-22~26)

| ID | 优先级 | 需求 | 验收标准 |
|---|---|---|---|
| FR-SY-22 | P0 | LWW 基准规则 | 同 entity_id 两版本,取 `updated_at` 大者;**equality 时取 device_id 字典序大者**(确定性) |
| FR-SY-23 | P0 | 时钟偏移防护 | 客户端 PUSH 时,**服务端用 server 时间盖戳** `server_updated_at`;客户端 `updated_at` 仅作 tiebreak hint;client clock 超前 server > 5min 时记 warn 但不拒收 |
| FR-SY-24 | P0 | Tombstone vs Update 优先 | tombstone 优先(deleted_at != NULL 永远胜过 updated_at)。例外:用户在 30 天内"撤销删除"触发 `undelete` 写新版本,该新版本 updated_at 必须 > 原 tombstone updated_at |
| FR-SY-25 | P0 | 用户撤销 / undo | 客户端本地保留 30 天软删数据;UI 可恢复 → 写一条 updated_at = now 的新 row,自动覆盖 tombstone |
| FR-SY-26 | P1 | 冲突日志 + 用户可见 | sync_audit_log 记录每次冲突 LWW 决断;Console 设置页"同步详情"展示最近 100 条冲突,允许用户翻看(P1) |

### 5.5 Realtime 订阅(FR-SY-27~31)

| ID | 优先级 | 需求 | 验收标准 |
|---|---|---|---|
| FR-SY-27 | P0 | Realtime 通道 / 用户 | Supabase Realtime,每个 account_id 一个 channel `sync:<account_id>`;RLS 保证只有本人能订阅 |
| FR-SY-28 | P0 | Realtime 消息载荷 | 服务端发的 message 仅含:`{ entity_type, entity_id, server_updated_at, originator_device_id }`。**不含 encrypted_blob**(避免误以为 Realtime 通道泄漏数据;blob 仍走 REST pull) |
| FR-SY-29 | P0 | Realtime 触发 pull | 客户端收到 Realtime msg → 若 `originator_device_id == self` 则忽略(本设备发的);否则 schedule 一次 `pull(entity_type, since=last_cursor)` |
| FR-SY-30 | P0 | Realtime 推送延迟预算 | P95 < 5s(改动落 server → 另一台设备 UI 刷新);P99 < 15s |
| FR-SY-31 | P1 | Realtime 重连退避 | WebSocket 断开后指数退避(1s, 2s, 4s, ..., 上限 60s);恢复后自动 catch-up pull |

### 5.6 离线模式 + 队列(FR-SY-32~37)

| ID | 优先级 | 需求 | 验收标准 |
|---|---|---|---|
| FR-SY-32 | P0 | 离线写入队列 | 离线时所有 mutation 直接写本地 SQLite + 入 `sync_outbox` 表(见 §6);保持本地 100% 可用 |
| FR-SY-33 | P0 | sync_outbox 表结构 | `(seq INTEGER PRIMARY KEY AUTOINCREMENT, entity_type TEXT, entity_id TEXT, op TEXT, queued_at INTEGER, retries INTEGER DEFAULT 0)`;mutation 顺序由 seq 严格保留 |
| FR-SY-34 | P0 | 回放顺序 | 联网后按 seq 升序回放;同 entity_id 的多条 op 合并(只保留最新一条,因 LWW 已经决定结果) |
| FR-SY-35 | P0 | 回放失败处理 | 单条 push 失败(5xx)→ 退避后重试;4xx(payload 损坏等)→ 标记 dead_letter 并 surface UI;不阻塞后续条目 |
| FR-SY-36 | P0 | 网络变化触发 flush | macOS 监听 `SCNetworkReachability` callback;从离线→在线触发 outbox flush |
| FR-SY-37 | P1 | 离线时间过长的清单整理 | 离线超 7 天 + queue > 1000 条时,弹"压缩本地队列"提示(合并同实体多次写) |

### 5.7 多设备协调(FR-SY-38~41)

| ID | 优先级 | 需求 | 验收标准 |
|---|---|---|---|
| FR-SY-38 | P0 | 设备注册 | 首次登录时 `POST /sync/devices/register { device_id, name=hostname, os=macOS 14.x }`;返回 device_token |
| FR-SY-39 | P0 | 同 account 多窗口协调(单机内) | overlay / console 共享同一 SQLite + 同一 plugin-account 实例(SQLite WAL 模式),走本地 `core-events` 事件,不走云端;**只有 cross-device 才走 Sync** |
| FR-SY-40 | P0 | 同设备多窗口同时编辑同一 todo | 本地走 SQLite 事务序列化;`core-events` 推送变更让另一窗口刷新;**无冲突可能** |
| FR-SY-41 | P0 | 多设备同时编辑同一 todo | 两端都本地写 → 两端都 push → 服务端按 server_updated_at LWW;落后的一端 pull 时被覆盖,UI 显示 toast "本条数据已被其它设备更新"(P1 可点撤销) |

### 5.8 同步状态 UI(FR-SY-42~45)

| ID | 优先级 | 需求 | 验收标准 |
|---|---|---|---|
| FR-SY-42 | P0 | 菜单栏图标四态 | idle(灰) / syncing(旋转蓝) / success(闪一下绿,2s 后回 idle) / error(红,可点) |
| FR-SY-43 | P0 | Console 设置 → 同步状态页 | 显示:登录账号、上次同步时间、各 entity_type 的 last_synced_at、最近 100 条 sync_audit_log |
| FR-SY-44 | P0 | Web 顶栏同步状态 | 网页版顶栏右侧小圆点 + tooltip "最近同步:2 分钟前";loading 时旋转 |
| FR-SY-45 | P0 | 同步状态事件 | 通过 `account:sync-started / sync-completed / sync-failed`(已在 PLUGIN_SDK §4.1 定义)广播给其他 plugin / UI |

### 5.9 失败恢复 + 重试(FR-SY-46~49)

| ID | 优先级 | 需求 | 验收标准 |
|---|---|---|---|
| FR-SY-46 | P0 | 批次部分失败回滚 | 单 PUSH batch 包含 50 条:服务端 atomic 处理(单 transaction);全失败 = 全失败,要么全成 = 整 batch 标 ack。**不允许"5 条成 45 条败"** |
| FR-SY-47 | P0 | 指数退避 + 抖动 | 失败重试:1s, 2s, 4s, 8s, 16s, 32s, 60s(上限);每次乘随机 0.5~1.5 抖动 |
| FR-SY-48 | P0 | 死信队列(dead letter) | 单 record 重试 ≥ 10 次仍 4xx:标 dead_letter、surface 通知"X 条同步失败,点击查看";用户可选"丢弃 / 重试" |
| FR-SY-49 | P0 | 服务端长时不可用降级 | server 5xx 连续 5 分钟:UI 弹一次 "云端暂不可用,本地数据正常";继续本地运行,后台静默重试 |

### 5.10 数据导出 + 账号删除(FR-SY-50~52)

| ID | 优先级 | 需求 | 验收标准 |
|---|---|---|---|
| FR-SY-50 | P0 | 全量导出 JSON | 设置 → "导出数据" → 客户端拉所有本地 SQLite 表(已解密)→ 生成 `xai-export-<date>.json`(含 schema_version);**不导出剪贴板** |
| FR-SY-51 | P0 | 导出 Markdown 子集 | todos / notes / habits / pomodoro 转 .md;打包 zip;主要给"我要换工具"的用户 |
| FR-SY-52 | P0 | 账号删除前强制导出 | FR-AC-13 已述;此处补充:删除请求提交后,客户端**本地数据不立刻删**,保留 30 天与服务端 grace period 对齐 |

### 5.11 隐私默认值 + 选择性禁同步(FR-SY-53~55)

| ID | 优先级 | 需求 | 验收标准 |
|---|---|---|---|
| FR-SY-53 | P0 | 同步默认开启(已登录账号后) | 注册流程默认勾选"启用云同步";用户可在设置任何时刻全局关闭 |
| FR-SY-54 | P0 | 全局同步开关 | 设置 → 隐私 → "云同步" 总开关 OFF 时:停止上传 + 停止 pull + Realtime 断开;UI 显示"仅本地模式"标签 |
| FR-SY-55 | P1 | 模块级禁同步 | 设置 → 隐私 → 同步范围细分;比如可单独关闭"习惯打卡日志"上传(用户重视隐私的子模块) |

### 5.12 服务端零知识承诺(FR-SY-56~58)

| ID | 优先级 | 需求 | 验收标准 |
|---|---|---|---|
| FR-SY-56 | P0 | 服务端无明文字段 | 数据库 schema 审查:除 `accounts.email`、`accounts.created_at`、metadata 字段外,所有用户内容相关字段必须是 blob;PR review checklist |
| FR-SY-57 | P0 | 服务端日志不含 user content | Supabase logs 配置过滤;不允许 `RAISE NOTICE` 含 blob 内容;不允许 trigger 解密 |
| FR-SY-58 | P0 | RLS(Row Level Security)严格 | 见 §6.5:每张 user-data 表必须 RLS policy `user_id = auth.uid()`;Supabase Studio Admin 也走 RLS(非 service_role 视图) |

### 5.13 凭据轮换 + 审计(FR-SY-59~61)

| ID | 优先级 | 需求 | 验收标准 |
|---|---|---|---|
| FR-SY-59 | P0 | service_role key 治理 | `.env.production` 不进 git;只在 CI secret + GitHub Actions runner;季度轮换一次;轮换 SOP 写在 `docs/runbook/credential-rotation.md` |
| FR-SY-60 | P0 | JWT secret 轮换 | Supabase JWT secret 轮换 SOP;轮换时所有用户被迫重登(可接受) |
| FR-SY-61 | P0 | 同步审计日志 | `sync_audit_log` 表(本地 + 服务端各一份);记录 push / pull / conflict / dead_letter / device_register;用户可在 Console 看自己的 |

### 5.14 速率限制 + 成本控制(FR-SY-62~64)

| ID | 优先级 | 需求 | 验收标准 |
|---|---|---|---|
| FR-SY-62 | P0 | 单账号 push QPS 上限 | Supabase edge function rate limit / Postgres advisory lock;100 req/min/account;超限返回 429 + Retry-After |
| FR-SY-63 | P0 | 单账号月流量上限 | Free tier: 500MB/月(blob 上传);超限切只读(可 pull,不能 push);UI 提示升级 |
| FR-SY-64 | P1 | 成本 dashboard | Supabase 项目级 dashboard 每天采:DB 大小 / 月流量 / API call;月度对账输到 `docs/runbook/cost-report-YYYY-MM.md` |

### 5.15 网络弱网处理(FR-SY-65~66)

| ID | 优先级 | 需求 | 验收标准 |
|---|---|---|---|
| FR-SY-65 | P0 | 弱网检测 → batch 动态 | TCP RTT > 1s 或 last 3 req 平均 latency > 3s:batch 自动减半;指标恢复后逐步放大 |
| FR-SY-66 | P0 | 长 timeout 阻断 | 单 push 请求 timeout 30s;超时即视为失败,走 FR-SY-47 退避 |

---

## 6. 数据模型(服务端 Schema)

### 6.1 Postgres 表(Supabase)

```sql
-- ─── 账号 ──────────────────────────────────────────
CREATE TABLE accounts (
  id              UUID PRIMARY KEY,                         -- = auth.users.id
  email           TEXT NOT NULL UNIQUE,
  display_name    TEXT,
  kek_salt        BYTEA NOT NULL,                           -- 16B,Argon2id salt
  kek_kdf_version SMALLINT NOT NULL DEFAULT 1,
  encrypted_dek   BYTEA NOT NULL,                           -- envelope: v|nonce|ct|tag
  mnemonic_acknowledged BOOLEAN NOT NULL DEFAULT false,     -- 助记词回填确认
  mfa_enabled     BOOLEAN NOT NULL DEFAULT false,
  deletion_scheduled_at TIMESTAMPTZ,                        -- GDPR 30 天
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 加密 blob 单表(per entity_type 不分表,用 entity_type 列区分)──
CREATE TABLE encrypted_blobs (
  account_id        UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  entity_type       TEXT NOT NULL,                          -- 'todos' / 'notes' / ...
  entity_id         TEXT NOT NULL,                          -- 客户端生成 uuidv7
  version           BIGINT NOT NULL,                        -- 客户端单调递增
  blob              BYTEA NOT NULL,                         -- 加密 envelope
  client_updated_at BIGINT NOT NULL,                        -- ms,客户端钟,tiebreak hint
  server_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),     -- 服务端权威钟,LWW 用
  deleted_at        TIMESTAMPTZ,                            -- tombstone
  originator_device_id UUID NOT NULL,
  blob_size         INTEGER NOT NULL,                       -- 用于 quota
  PRIMARY KEY (account_id, entity_type, entity_id)
);

CREATE INDEX idx_blobs_pull_cursor
  ON encrypted_blobs (account_id, entity_type, server_updated_at DESC);

CREATE INDEX idx_blobs_realtime
  ON encrypted_blobs (account_id, server_updated_at DESC);

-- ─── 设备登记 ──────────────────────────────────────
CREATE TABLE sync_devices (
  device_id      UUID PRIMARY KEY,
  account_id     UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name           TEXT,                                       -- "lijinlong 的 MacBook Pro"
  os             TEXT,                                       -- "macOS 14.4"
  app_version    TEXT,
  registered_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at     TIMESTAMPTZ                                 -- 用户远程登出
);

-- ─── 审计 ──────────────────────────────────────────
CREATE TABLE sync_audit_log (
  id           BIGSERIAL PRIMARY KEY,
  account_id   UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  device_id    UUID,
  operation    TEXT NOT NULL,                                -- 'push'/'pull'/'login'/'logout'/'mnemonic_reset'/'delete_request'
  entity_type  TEXT,
  count        INTEGER,                                      -- 影响 record 数
  status       TEXT,                                         -- 'ok'/'partial'/'error'
  error_code   TEXT,
  at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_account_at ON sync_audit_log(account_id, at DESC);

-- ─── 配额 ──────────────────────────────────────────
CREATE TABLE sync_quota (
  account_id    UUID PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
  month         DATE NOT NULL,                               -- 月初 1 号
  bytes_pushed  BIGINT NOT NULL DEFAULT 0,
  push_calls    BIGINT NOT NULL DEFAULT 0,
  pull_calls    BIGINT NOT NULL DEFAULT 0,
  tier          TEXT NOT NULL DEFAULT 'free'                 -- free / pro
);
```

### 6.2 RLS Policies(关键!与 FR-SY-58 对应)

```sql
ALTER TABLE accounts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE encrypted_blobs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_devices      ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_audit_log    ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_quota        ENABLE ROW LEVEL SECURITY;

-- accounts 只能读自己
CREATE POLICY accounts_self_read ON accounts
  FOR SELECT USING (id = auth.uid());
CREATE POLICY accounts_self_update ON accounts
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- encrypted_blobs 只能读 / 写自己的
CREATE POLICY blobs_self ON encrypted_blobs
  FOR ALL USING (account_id = auth.uid()) WITH CHECK (account_id = auth.uid());

-- sync_devices 同上
CREATE POLICY devices_self ON sync_devices
  FOR ALL USING (account_id = auth.uid()) WITH CHECK (account_id = auth.uid());

-- audit / quota 只读自己
CREATE POLICY audit_self ON sync_audit_log
  FOR SELECT USING (account_id = auth.uid());
CREATE POLICY quota_self ON sync_quota
  FOR SELECT USING (account_id = auth.uid());
```

**Phase 5 RLS audit 必须项**:用 `SET ROLE authenticated;` 加自动测试,尝试访问他人 user_id → 必须返回 0 行。

### 6.3 客户端 SQLite 新增表

```sql
-- 离线写队列(FR-SY-33)
CREATE TABLE sync_outbox (
  seq         INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,
  entity_id   TEXT NOT NULL,
  op          TEXT NOT NULL,            -- 'upsert' / 'delete'
  queued_at   INTEGER NOT NULL,         -- ms
  retries     INTEGER NOT NULL DEFAULT 0,
  next_retry_at INTEGER,
  dead_letter INTEGER NOT NULL DEFAULT 0,
  last_error  TEXT
);
CREATE INDEX idx_outbox_pending ON sync_outbox(dead_letter, next_retry_at);

-- 同步游标(替代主 PRD §8 的 sync_state,字段扩展)
DROP TABLE IF EXISTS sync_state;
CREATE TABLE sync_state (
  entity_type      TEXT PRIMARY KEY,
  server_cursor    TEXT,                  -- ISO timestamp from server_updated_at
  last_pull_at     INTEGER,
  last_push_at     INTEGER,
  local_version    INTEGER NOT NULL DEFAULT 0   -- 单调递增,每次 mutation +1
);

-- 本地审计(本地查询友好的副本)
CREATE TABLE sync_audit_local (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  at          INTEGER NOT NULL,
  operation   TEXT NOT NULL,
  entity_type TEXT,
  count       INTEGER,
  status      TEXT,
  details     TEXT                          -- JSON: device_id / error / records 列表
);
CREATE INDEX idx_audit_local_at ON sync_audit_local(at DESC);
```

---

## 7. 协议设计

### 7.1 加密 Envelope 二进制格式

```
┌──────┬───────┬─────────┬───────────────┬───────┐
│ v: 1B│kdf:1B │ nonce:  │ ciphertext:   │ tag:  │
│      │       │   12B   │   variable    │  16B  │
└──────┴───────┴─────────┴───────────────┴───────┘
   │       │
   │       └── kek_kdf_version,允许将来 v2 支持不同 KDF
   └── envelope schema version
```

序列化 / 反序列化函数住 `packages/plugin-account/src/crypto/envelope.ts` + Rust mirror。

### 7.2 REST 端点

| 方法 | 路径 | 用途 | 鉴权 |
|---|---|---|---|
| POST | `/auth/signup` | 注册(见 §3.3) | none(Supabase Auth) |
| POST | `/auth/login` | 登录 | none |
| POST | `/auth/refresh` | refresh access_token | refresh_token |
| GET | `/auth/me` | 拉 KEK 元数据 + encrypted_dek | bearer |
| PATCH | `/auth/me` | 改密码 / re-key | bearer |
| DELETE | `/auth/me` | 请求账号删除 | bearer |
| POST | `/sync/devices/register` | 注册新设备 | bearer |
| GET | `/sync/devices` | 列出设备 | bearer |
| DELETE | `/sync/devices/:id` | 远程登出某设备 | bearer |
| POST | `/sync/push` | 批量上传 mutation | bearer |
| GET | `/sync/pull` | 拉取增量 | bearer |
| GET | `/sync/audit` | 拉审计日志 | bearer |
| GET | `/sync/quota` | 查询配额使用 | bearer |
| POST | `/sync/export` | 触发导出(异步生成下载 link) | bearer |

### 7.3 PUSH 协议

**Request**
```
POST /sync/push
Authorization: Bearer <jwt>
Content-Type: application/json; encoding=gzip
X-Device-Id: <uuid>
X-App-Version: 1.0.0

{
  "entity_type": "todos",
  "records": [
    {
      "entity_id": "01HXY...uuidv7...",
      "version": 7,
      "client_updated_at": 1715764800123,
      "blob": "<base64 envelope>",
      "deleted_at": null            // 或 ISO timestamp 表示 tombstone
    },
    ...
  ]
}
```

**Response 200**
```json
{
  "accepted": 50,
  "server_now": "2026-05-15T10:00:00.123Z",
  "results": [
    { "entity_id": "01HXY...", "server_updated_at": "2026-05-15T10:00:00.100Z" },
    ...
  ]
}
```

**Response 409 (LWW lost)** — 不会发生,server 永远接收(LWW 是按 server_updated_at 排序，旧版本仍接收只是没用)。实际不出 409;若需要保留预留 415。

**Response 429**
```json
{ "error": "rate_limited", "retry_after_ms": 5000 }
```

### 7.4 PULL 协议

**Request**
```
GET /sync/pull?entity_type=todos&since=2026-05-15T09:00:00.000Z&limit=500
Authorization: Bearer <jwt>
```

**Response 200**
```json
{
  "records": [
    {
      "entity_id": "01HXY...",
      "version": 7,
      "blob": "<base64 envelope>",
      "server_updated_at": "2026-05-15T10:00:00.100Z",
      "deleted_at": null,
      "originator_device_id": "..."
    }
  ],
  "next_cursor": "2026-05-15T10:00:00.100Z",
  "has_more": false
}
```

### 7.5 Realtime 消息

```json
// channel: sync:<account_id>
// event:   "blob_changed"
{
  "entity_type": "todos",
  "entity_id": "01HXY...",
  "server_updated_at": "2026-05-15T10:00:00.100Z",
  "originator_device_id": "..."
}
```

客户端忽略 originator_device_id == self 的消息。

### 7.6 错误码(对齐 TECHNICAL_REQUIREMENTS §3.3.2 的 E3xxx)

| Code | 含义 |
|---|---|
| E3001 | sync push failed (transport) |
| E3002 | sync push failed (4xx payload) |
| E3003 | sync pull failed |
| E3004 | encryption envelope corrupt(GCM tag failed) |
| E3005 | KEK derivation failed |
| E3006 | DEK decryption failed (= 密码错或 encrypted_dek 损坏) |
| E3007 | mnemonic verify failed |
| E3008 | rate limited (429) |
| E3009 | quota exceeded |
| E3010 | clock skew too large (warn-level) |
| E3011 | dead letter |
| E3012 | conflict resolved (info-level) |
| E3099 | unknown sync error |

### 7.7 版本协商

- HTTP header `Accept-Version: sync.v1`(主 PRD §3.1.5 已提)
- 服务端有多版本时:无 header 视为 sync.v1
- 客户端读 Response header `Sync-Schema-Version` 校验,若 server 返 v2 而 client 是 v1 → 阻塞同步,引导升级

---

## 8. 性能预算

引用 TECHNICAL_REQUIREMENTS §1.2:

| 指标 | 预算(P50) | P95 | 备注 |
|---|---|---|---|
| 单次 push batch(50 records,1MB) | 1.5s | 3s | 含加密 + 网络 |
| 单次 pull batch(500 records) | 2s | 5s | 含网络 + 解密 |
| Realtime push 延迟(改动 → 另端拿到 msg) | 1s | 5s | 不含 pull 时间 |
| KEK 派生(Argon2id) | 200ms | 400ms | 一次性,登录时 |
| 单 record encrypt | 0.3ms | 0.5ms | 1KB record |
| 单 record decrypt | 0.2ms | 0.3ms | |
| 首次全量同步(1k records) | 5s | 10s | 含 pagination |

**回归门**(同 TECHNICAL_REQUIREMENTS §1.2):退化 ≥ 20% 阻塞发布。

---

## 9. 可观测性

引用 TECHNICAL_REQUIREMENTS §1.3:

- **可上报到 Sentry**:错误码(E3xxx)、entity_type、device_id、retry_count、batch_size、http_status、duration_ms
- **绝对禁止上报**:任何 blob 内容、entity_id(可能间接暴露),todo 标题、note 内容
- **本地诊断信息导出**(TECHNICAL_REQUIREMENTS §1.3.3):
  - 各 entity_type 的 last_synced_at
  - outbox 当前长度 + 死信数
  - 最近 100 条 sync_audit_local
  - 服务端版本号、当前账号 user_id(短)

---

## 10. 验收清单

### 10.1 Phase 0 子阶段 0.3 验收(M0-B,2026-07-07)

- [ ] FR-AC-01 / FR-AC-02 / FR-AC-07 / FR-AC-08:邮箱注册 + 登录 + Keychain 持久化跑通
- [ ] FR-SY-07~12:加密层独立可用,通过单元测试 + benchmark
- [ ] FR-SY-15~20:**单表(todos)增量同步**端到端跑通
- [ ] FR-SY-42:菜单栏图标四态显示
- [ ] FR-SY-58 + 6.2 RLS:RLS 自动测试通过
- [ ] 服务端 schema 部署到 staging Supabase 项目

### 10.2 Phase 5 验收(M5 公测,2026-11-24)

- [ ] 所有 P0 FR 完成(41 条)
- [ ] FR-SY-14 fuzz 测试连续跑 24h 无 panic
- [ ] 真机两台 Mac + 一台浏览器同步同账号 30 分钟,数据 100% 一致
- [ ] 恢复演练:① 服务端 staging 数据全删,客户端用助记词恢复(FR-AC-10);② 客户端 SQLite 全删,登录后全量 pull 恢复
- [ ] 多设备并发编辑同一 todo 50 次,无数据丢失 / 无重复 / 最终一致(LWW)
- [ ] 离线 1 小时 + 写 200 条 mutation,联网后 outbox 完全 flush 且与另一端最终一致
- [ ] 弱网模拟(toxiproxy 注入 500ms 延迟 / 10% 丢包),同步仍 P95 < 10s

### 10.3 M6 GA 真机测试(2026-12-22)

- [ ] DMG 完整版 + MAS 沙箱版均通过上面 Phase 5 全部清单
- [ ] 凭据轮换 SOP 演练一次(轮换 service_role + JWT secret,用户登录态优雅过渡)
- [ ] 24 小时压测:模拟 10 个账号 × 持续随机 mutation,无 OOM / 无 SQLite WAL 膨胀
- [ ] R-10 加密同步实现错误 — Phase 5 fuzz + Phase 6 真机 stress + 30 天软删除保留**三层防护**全部生效

---

## 11. 风险与缓解(R-10 详细分解)

| 子风险 ID | 描述 | 等级 | 缓解 | 触发监控 |
|---|---|---|---|---|
| R-10.1 | nonce 复用导致 GCM 灾难性失败 | 🔴 高 | 每条 record 独立 nonce + OsRng;单测断言 1M record 全 unique;代码 review checklist | 单测 + fuzz |
| R-10.2 | 主密码忘 + 助记词丢 = 用户数据永失 | 🔴 高 | UI 三屏强提示 + 打字回填验证(FR-AC-09);助记词导出 PDF / 截图引导;**不承担"找回"承诺**(产品语言要明示) | 用户教育 |
| R-10.3 | LWW 在时钟偏移下丢数据 | 🟡 中 | server_updated_at 权威钟(FR-SY-23);client clock skew 警告;30 天软删 + outbox 死信保护 | sync_audit_log |
| R-10.4 | RLS 配置漏洞,服务端管理员可读 blob | 🟡 中 | 服务端不存明文(零知识承诺),管理员看到也是 blob;RLS 自动测试入 CI | RLS audit |
| R-10.5 | encrypted_dek 损坏(单点失败,丢一个 = 全失败) | 🔴 高 | server 端 encrypted_dek 有 daily backup(supabase backup);客户端登录成功后立即本地 cache 一份加密的 encrypted_dek 到 Keychain | server backup |
| R-10.6 | 升级版本 / re-key 中途中断导致数据状态错乱 | 🔴 高 | Re-key 两阶段:先 staging blob 全部上传成功,再原子 swap account.encrypted_dek → 旧 blob 清理(FR-SY-13);失败回滚 | re-key 演练 |
| R-10.7 | Supabase 拖库被攻击者拿走 dump | 🟡 中 | 零知识承诺;blob 是 AES-256-GCM,2026 算力下不可解 | T1 防护已就位 |
| R-10.8 | 凭据(service_role / JWT)泄漏 | 🟡 中 | 季度轮换 SOP(FR-SY-59);CI secret 隔离 | 凭据轮换记录 |

---

## 12. 待办

- [ ] Phase 0 决策点:Supabase 项目正式注册 + billing 绑定(目前用 Free tier)
- [ ] BIP-39 wordlist 选简体中文版还是英文版?默认英文(国际化更稳),用户可选中文(P1)
- [ ] iOS 客户端的 KEK 派生参数差异(若未来做 iOS,Argon2id 在低端机器可能太重)— v2 议题
- [ ] 是否要做"账户级数据加密版本号"(允许某些字段做客户端解密失败时的 graceful degradation)— Phase 5 末再议
- [ ] Realtime 在网页版的 fallback:若 WebSocket 被企业代理拦截 → 退化为 long polling(SSE)
- [ ] 主密码强度计(zxcvbn)— FR-AC-09 子项,P1
- [ ] 与 Web 端的同步语义对齐(同一账号 Web + Desktop 同时打开是否要做"会话锁定")— P1

---

## 13. 文档变更记录

| 日期 | 版本 | 变更 |
|---|---|---|
| 2026-05-14 | v0.1-DRAFT | 首版:目标 / 威胁模型 / 密钥层级 / 同步范围矩阵 / 41 条新 FR / 服务端 schema / 协议规格 / R-10 子分解 |

— END —
