# Sync 子 PRD — XAI_Desktop 同步数据通道

> **PAUSED (2026-05-24, per Web P0 Priority Override).** Sync stack (account, E2E crypto, Realtime, offline queue, conflict resolution, multi-device coordination) is part of P1/P2. The SHIPPED sync-v1 crypto packages under `packages/{kdf-primitives, aes-gcm-aead-core, hpke-per-device-wrap, sync-engine-{push,pull}, ...}` are preserved as-is and remain authoritative for their domain. Do not start new sync work against this PRD until P0 Web gap-closure ships and ADR-0009 is Accepted. Authority basis: `docs/workflow/roadmap/xai-web-console.md` §Authority Override 2026-05-23. Full rationale: `docs/reviews/web-priority-pivot-and-repo-cleanup/20260524-brief.md`.

| 字段 | 值 |
|---|---|
| 父 PRD | `docs/planning/2026-05-12-PRD-v1.md`(主 PRD §5.9) |
| 范围 | 账号系统 + E2E 加密同步协议 + Realtime + 离线队列 + 冲突解决 + 多设备协调 |
| 归属 plugin | `packages/plugin-account/`(主)+ `packages/core-data/`(REST driver) |
| 归属 Phase | Phase 0 子阶段 0.3(骨架)+ Phase 5(完善) |
| 关联 ADR | ADR-0002 双轨发布(沙箱网络 entitlement)、ADR-0003 三个面架构(数据层一致性) |
| 文档作者 | Claude(subagent) |
| 创建日期 | 2026-05-14 |
| 最后更新 | 2026-05-16 |
| 状态 | v0.6-DRAFT(协议硬化第五轮) |
| 关联审查 | `docs/planning/sub-prds/sync/REVIEW-2026-05-15.md` v0.2~v0.6 round 全部 Critical/High/Medium/Low 已落实 |

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
- **不做 CRDT**(v1 走 conditional write + conflict shadow,不做字段级合并;v2 评估 notes 上 Yjs)。**v0.3 注**:原 v0.1 "LWW" 表述已废弃,详见 §5.4。
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
v0.4 修订:T11 更新为 per-device wrap 真实边界 + 残余风险"已撤销设备本地 SQLCipher 缓存的明文 + 已在 KeyVault 派生的 raw DEK 即使撤销后短时仍可解历史 blob,UI 必须提示用户撤销后清理本地数据"。

| 攻击者 | 能力 | 后果上限(对我们想保护的资产) | 防护层 |
|---|---|---|---|
| **T1. 服务端被攻破 / 拖库(被动)** | 拿到 Supabase Postgres dump + service_role key,但只读 | 最多拿到 encrypted blob + metadata(updated_at / device_id / entity_type)。拿不到任何明文用户数据。**注意**:可对弱口令账号离线 Argon2id 字典攻击 → 由 Secret Key(FR-SY-73)抬高成本至不可行,详见 §3.2 | FR-SY-56~58 零知识承诺 + RLS;FR-SY-73 Secret Key |
| **T1.1. 恶意服务端 / 拿到 service_role 写权限(主动)** | 可 INSERT / UPDATE / DELETE encrypted_blobs / accounts / sync_devices | **可调包密文**(无 AAD 时)/ **可静默回滚密文**(无 revision 时)/ **可替换 encrypted_dek 让用户数据不可读**(无 recovery proof 时)/ **v0.5 新:可伪造 fake pending device(自定义 attacker_pub)诱导真实 donor 自动 grant wrap → 攻击者拿到 DEK 明文**(由 C-A v0.5 用户可验证设备配对阻断,见 §3.4.1)。v0.2~v0.5 通过 FR-SY-67(AAD)/ FR-SY-68(revision)/ FR-SY-69(recovery proof)/ FR-SY-76(donor 必须用户确认 device_pub fingerprint)阻断 | FR-SY-67/68/69/76 |
| **T2. 中间人(MITM)** | 拿到 HTTPS 流量、可篡改 | TLS 1.3 + cert pinning 阻断;退化场景下仍是 encrypted blob,攻击者看不到明文 | TLS 1.3 + cert pin |
| **T3. 本机被盗(未解锁)** | 物理拿到用户 Mac、设备锁屏 | macOS Keychain `WhenUnlockedThisDeviceOnly` 保护 refresh_token + KEK 缓存;SQLite 文件由 SQLCipher 加密(FR-SY-74),db_key 由 KEK 派生 → 锁屏状态下取不到 | FR-AC-08 + FR-SY-74 |
| **T3.5. 拿到 disk image(未启用 FileVault 或冷盘备份泄漏)** | 拿到 SQLite 文件 + Keychain 文件副本(非 live 系统) | 若 FR-SY-74 SQLCipher 已实装,db_key 由 master_password 派生,攻击者必须暴力破解 master_password;Keychain 文件即使拿到也需登录密码解锁 | FR-SY-74 + onboarding 强提示 FileVault |
| **T3'. 本机被盗(已解锁 / 已登录)** | 物理拿到 Mac,且已登录 + Keychain 解锁 | 攻击者可读所有数据。**认可的残余风险**——本机已登录态超出威胁边界(等同"已登录的浏览器") | 用户教育:启用 macOS 用户密码 + screen lock |
| **T4. 用户忘主密码** | 失去 KEK 派生能力 | 数据无法恢复。零知识承诺的代价。唯一恢复路径:首次注册时备份的助记词(FR-AC-10,v0.2 改为 24 词) | FR-AC-09 强提示 + FR-AC-10 助记词 |
| **T5. 用户被胁迫**(rubber-hose) | 攻击者强迫用户输入主密码 | 任何 E2E 系统都防不住。**显式不防护** | — |
| **T6. 恶意 plugin / 同进程攻击** | 第三方 plugin 沙箱逃逸,试图读 KEK / DEK | KEK 不出 macOS Keychain;v0.2 起 DEK 常驻 Rust KeyVault,JS 只拿 opaque key_handle(FR-SY-75);Tauri capability allowlist 限定 crypto_* 命令只能 plugin-account / core-data 调 | FR-SY-75 + Tauri allowlist + 主 PRD §5.10.1 plugin 沙箱 |
| **T7. Realtime 通道被窥探** | 拿到 WebSocket 流量 / 订阅他人 channel | TLS 阻断流量;v0.2 起 Supabase Realtime 必须启用 Private Channels + Authorization(FR-SY-27),订阅时 RLS 校验 channel name 含 auth.uid();即使被订阅看到的仍是 entity_id 等 metadata,blob 不在 Realtime 通道(FR-SY-28) | FR-SY-27/28 |
| **T8. 凭据泄漏**(service_role / JWT secret / OAuth secret) | 拿到 Supabase 高权限凭据 | 等同 T1 + T1.1;凭据轮换 SOP 限定 2 小时内冻结(FR-SY-59) | FR-SY-59~60 + `docs/runbook/credential-rotation.md` |
| **T9. 离线设备返回**(stale device) | 一台设备长期离线后联网 | 离线队列与服务端冲突按 commit_seq 决胜(v0.2 改);loser 写入冲突 shadow 30 天保留(FR-SY-71)防止静默丢失 | FR-SY-20 全量同步降级 + FR-SY-71 冲突 shadow |
| **T10. Supply chain(npm / crates / Tauri 自动更新)** | 攻击者篡改某个依赖发布到镜像 | v0.2 起 cargo vet + sigstore npm signature + dependency-review-action 阻断;自动更新签名验证(主 PRD §5.10.1);Tauri capability strict allowlist 限制 IPC 调用面 | dev-plan §6 R-18 + FR-SY-75 |
| **T11. 设备撤销后旧设备解密新数据** | 卖出 / 丢失的 Mac 上仍有 KEK + DEK Keychain cache | v0.2 起设备撤销必须配合 Re-key(FR-AC-14 + FR-SY-13):生成新 DEK_v2,所有 blob 重加密;旧 DEK 在 keyring 标 retired,旧设备无法解密新数据 | FR-AC-14 + FR-SY-13 |
| **T12. Downgrade attack(强制旧协议)** | MITM / 恶意 server 让客户端走 v1 弱协议 | 客户端必须发 `Accept-Version` header,缺失视为 400;envelope `v` 与 `kdf_v` 字段固化,客户端拒收低于自身已知 min_version 的 envelope | §7.7 + FR-SY-08 |
| **T13. 备份泄漏(Time Machine / iCloud Backup)** | 拿到用户备份镜像 | SQLite 由 SQLCipher 加密(FR-SY-74);Keychain 项 `WhenUnlockedThisDeviceOnly` 不会进 iCloud Keychain;导出文件 v0.2 默认加密(FR-SY-50 改) | FR-SY-74 + FR-SY-50 |

**显式不防护的攻击向量**:
- T5(胁迫):任何 E2E 防不住,提供 panic password / 假账号是 v2 议题
- T3'(已登录本机被盗):用户责任,提示启用 screen lock
- 社工拿走助记词:用户教育
- T1.1 在 v1 不实装 Merkle root,**对"伪造合法 revision 但篡改 commit 时间序"的精细攻击不防护**;Re-key 期间 Invisible Salamanders(AES-GCM 非 key-committing)亦不防护,见 §11 R-10.9;v2 评估 AES-GCM-SIV / 显式 commitment

**残余风险显式登记**:任何"防护层"标灰的攻击向量必须在 §11 R-10 子风险表追踪;v2 路线图须明确升级方案。

---

## 3. 密钥层级与流程

### 3.1 层级图(v0.3 重绘:per-device DEK wrap + Ed25519 recovery + dual-factor auth)

```
[ 用户主密码 master_password (永不出本机) ]
[ Secret Key  secret_key   (128-bit,客户端首次注册生成,用户必须保存) ]
              │
              ├──────────────────────────────────┐
              │                                  │
              │ Argon2id(master_password,        │ HKDF(master_password ‖ secret_key,    H-L
              │   salt=kek_salt,                 │   salt=email ‖ "xai.auth.v1",         dual-factor
              │   secret=secret_key,             │   info="xai.auth.v1") → 16B
              │   t=3, m=64MiB, p=4) → 32B       │ 再走 Argon2id(t=1, m=16MiB, p=1)
              ▼                                  ▼
[ KEK 32 bytes ]                          [ auth_password 32 bytes ]
   │  │  │                                       │
   │  │  │ ⚠ v0.4 C-A 修订:device key 由本地 CSPRNG 独立生成 │ 发 Supabase Auth
   │  │  │   device_priv = csprng(32) (X25519 priv) │ (内部 bcrypt)
   │  │  │   device_pub  = X25519_pub(device_priv)  │ ⚠ 必须含 secret_key 才能
   │  │  │   device_priv 仅存 Keychain WhenUnlocked │   真"双因子登录"
   │  │  │     ThisDeviceOnly, ACL=bundle id        │
   │  │  │   ⛔ 绝不从 KEK 派生 ⛔                  │
   │  │  │   (否则旧设备能算出新设备 device_priv,  │
   │  │  │    per-device wrap 形同虚设)             │
   │  │  │   device_pub 上传 sync_devices           │
   │  │  │                                       │
   │  │  │ HKDF(KEK,"xai.sqlite.v1") → db_key    │
   │  │  │  → SQLCipher                          │
   │  │  │  (AES-256-CBC + HMAC-SHA512,SQLCipher 4 默认)
   │  │  │                                       │
   │  │  │ KEK 缓存 macOS Keychain               │
   │  │  │  WhenUnlockedThisDeviceOnly, ACL=bundle id
   │  │  │                                       │
   │  │  ▼                                       │
   │  [ device_priv (X25519,Keychain) ] 解锁 device_dek_wraps[device_id, key_id].wrap
   │  │  │       │
   │  │  │       └─ X25519_decrypt(device_priv, wrap) ──► DEK_v_n
   │  │  ▼                                       │
   │  (recovery_seed = HKDF-Expand(DEK_current, "xai.recovery.sig.v1"))
   │  (recovery_signing_keypair = Ed25519_from_seed(recovery_seed))
   │  server 只存 recovery_signing_pub(32B)
   │     │                                       │
   │     ▼                                       │
   │  PATCH /auth/me 必须 client Ed25519_sign(payload_canonical_hash)  FR-SY-69 / §7.1.2.3
   │
   ▼
[ DEK_v_n 32 bytes (key_id=n) ] (常驻 Rust KeyVault,JS 拿 opaque key_handle)
              │
              │ AES-256-GCM 加密
              │ nonce = encryption_device_id (8B,server 分配 unique per device, FR-SY-07)
              │       ‖ counter (4B,per device per key_id,checkpoint 防 backup 回滚)
              │ AAD = deterministic CBOR map(C-G, RFC 8949 §4.2),固定 schema 见 §7.1
              ▼
[ encrypted_blob (envelope) ]  ──►  server.encrypted_blobs.blob

[ 24 词 BIP-39 助记词 (256-bit + 8-bit checksum) ]
        = 当前 active DEK 完整备份;首次注册一次性展示,必须回填确认 6 个词
        ⚠ C-F:只能恢复"当前 active key 下" 的数据;retired key 下的 blob 必须先全部
           re-encrypt 到 current key 才能 retire (server cron 校验 can_retire)

[ Secret Key 备份卡片 (打印 / PDF, 128-bit) ]
        = Argon2id secret + auth_password 必含项 ⇒ 真正的"双因子登录"
        - 没有 secret_key,即使知道 master_password 也无法登录(auth_password 算不出)
        - 不能离线字典攻击(128-bit 高熵);server 只存 secret_key_check 单向 hash
        - 首次注册必须回填某 4 位 ✅

[ Ed25519 recovery_signing_pub (server 持,32B 公钥) ]
        - 服务端永远拿不到 priv (= seed 来自 DEK,server 没有 DEK)
        - PATCH /auth/me 走 Edge Function + 签名验证 (C-A / FR-SY-69)
        - accounts 表敏感列 client 直接 UPDATE 被禁 (C-B / §6.2)

[ 本地 SQLite ]
        = SQLCipher (AES-256-CBC + HMAC-SHA512); db_key 由 KEK 派生不写盘
        - 文件离开本机 + 无 master_password → 不可读 (FR-SY-74)
```

关键不变式(v0.3):
1. **master_password + secret_key 永不离开本机**。auth_password 派生**必须包含 secret_key**(H-L);secret_key 错 ⇒ login 失败(不是 login 后才知道)。
2. **KEK 永不出 macOS Keychain**;ACL 限定 bundle id;用完立即 zeroize(FR-SY-10)。
3. **DEK 不用账户 KEK 直接包装存 server**(原 v0.2 设计的根本缺陷)。**v0.4 C-A 进一步修订**:device_keypair 必须由设备本地 CSPRNG 独立生成,**绝不从 KEK 派生**。device_priv 仅存 macOS Keychain(`xai.devicekey.<account_id>.<device_id>`,WhenUnlockedThisDeviceOnly,ACL 限定 bundle id);device_pub 上传 `sync_devices.device_pub`。DEK_v_n 用每个 active device 的 device_pub 包装存 `device_dek_wraps` 表多行(PK=(account_id, device_id, key_id))。撤销 device → server 删该 device 全部 wrap + sync_devices.revoked_at → 旧 device 即使能算 KEK 也无 wrap 可解,**且新设备 device_priv 也不可由旧设备计算**(因为 CSPRNG 独立)。**重要后果**:新设备登录**必须** donor device 协作 grant wrap 或助记词恢复重新走 §3.6,**不能仅凭 master_password+secret_key 单独算出能解新 wrap 的 device_priv**。
4. **DEK 常驻 Rust 侧 KeyVault**;JS / plugin 只拿 opaque `key_handle`(FR-SY-75)。
5. **服务端永不见明文**:KEK / DEK / master_password / secret_key / device_priv / recovery_seed 一概不见。看到:device_dek_wraps[*].wrap(密文)、encrypted_blobs.blob(密文)、auth_password(单向)、secret_key_check(单向 hash)、recovery_signing_pub(公钥)、device_pub(公钥)。
6. **AEAD AAD 必须用 deterministic CBOR 绑定语境**(C-02 + C-G);见 FR-SY-67 / §7.1。
7. **每实体单调 revision**:client 提交 `proposed_revision = base_revision + 1`,server 验证不重写(C-E / FR-SY-68);AAD 含 proposed_revision;rollback 拒收。
8. **GCM nonce = encryption_device_id (8B,server 分配 per device,唯一) ‖ counter (4B,per device per key_id)**(C-C / FR-SY-07);counter checkpoint 预写防 backup 回滚;到 2^32 强制 Re-key。
9. **PATCH accounts 敏感字段必须经 Edge Function + Ed25519 recovery proof**(C-A / C-B);RLS 禁 client 直接 UPDATE。
10. **设备撤销 = 删 device_dek_wraps 行 + Re-key 重新分发**(C-D / FR-AC-14 / FR-SY-13);旧 device 即使再次登录也无法解新 DEK。

### 3.2 Argon2id / HKDF 参数固化(v0.2 修订)

#### KEK 派生(强参数,主路径)

| 参数 | 值 | 论证 |
|---|---|---|
| 算法 | Argon2id | [RFC 9106](https://www.rfc-editor.org/rfc/rfc9106) memory-hard,抗 GPU / ASIC |
| t(迭代) | 3 | RFC 9106 §4 推荐的 memory-constrained 配置 |
| m(内存) | 64 MiB | macOS ~300ms;Web (WASM) 单独 benchmark,可能调到 32 MiB |
| p(并行) | 4 | 现代 Mac 充裕;Web 端 p=1 |
| salt | 16 字节随机 / 每账号唯一 | 存 server.accounts.kek_salt |
| secret(pepper) | secret_key(128-bit) | **客户端持有**,server 无;抬高 T1 离线字典攻击成本至不可行(对应 H-14) |
| 输出长度 | 32 字节 | 喂 AES-256 |

**版本字段**:account row 必须有 `kek_kdf_version SMALLINT`(初版=1)。升级路径预留 v2(参数调整或换 Argon2id-SIV)。

#### auth_password 派生(v0.4 H-2 重写:必含 secret_key,真"双因子登录")

| 参数 | 值 | 论证 |
|---|---|---|
| Step 1 | HKDF-SHA256(**master_password ‖ secret_key**, salt=email\|\|"xai.auth.v1", info="xai.auth.v1") → 16B intermediate | 域分离;email 作 salt;**必含 secret_key**(原 v0.3 master-only 表述被 H-2 废弃) |
| Step 2 | Argon2id(intermediate, salt=email\|\|"xai.auth.v1", t=1, m=16MiB, p=1) → 32B `auth_password` | 弱参数,性能开销低,客户端每次登录都跑 |
| 用途 | Base64(auth_password) 作为 Supabase Auth 的 password 字段 | Supabase Auth 内部再 bcrypt 存储 |
| 安全声明 | secret_key 错 ⇒ auth_password 错 ⇒ Supabase login 失败,真"双因子登录"(H-L);server 即使拿到 auth_password 也无法反推 master_password / secret_key(HKDF + Argon2 不可逆);**任何流程(注册 / 登录 / 助记词恢复)的 auth_password 派生必须遵循本表,不允许 master-only 派生**(C-F) | H-2 / H-L / C-F |

**v2 升级路径**:迁 [OPAQUE](https://datatracker.ietf.org/doc/draft-irtf-cfrg-opaque/)(IETF CFRG draft,**截至 2026-05 尚未成为 RFC**,原 v0.2 "RFC 9807" 引用错误,L-1 修正)做真正零知识口令认证。在 §11 R-10 子风险表里追踪。

### 3.3 首次注册流程(FR-AC-01 v0.3 重写:per-device wrap + Ed25519 recovery + dual-factor)

```
[Client]                                                [Server]
   │
   │ 1. 用户输入 email + master_password
   │
   │ 2. 客户端生成:
   │    - ⚠ v0.5 H-7:account_id 由 Supabase Auth 返回(= auth.users.id),client 不自定
   │    - device_id       = uuidv7()
   │    - kek_salt        = csprng(16)
   │    - secret_key      = csprng(16)                    ← 128-bit,用户必须保存
   │    - DEK_v1          = csprng(32)
   │    - mnemonic        = BIP39_24w_encode(DEK_v1)      ← 24 词 (256-bit + 8-bit checksum)
   │
   │ 3. KEK = Argon2id(master_password, kek_salt, secret=secret_key, t=3,m=64MiB,p=4)
   │ 4. auth_password = Argon2id(HKDF(master_password ‖ secret_key, salt=email‖"xai.auth.v1",
   │                                    info="xai.auth.v1"), t=1,m=16MiB,p=1)   ← H-L dual-factor
   │    (没有 secret_key,server 即使猜 master_password 也算不出 auth_password)
   │
   │ 5. ⚠ v0.4 C-A:device key 必须本地 CSPRNG 独立生成,不从 KEK 派生
   │    device_priv = csprng(32)                     ← X25519 private key
   │    device_pub  = X25519_compute_pub(device_priv)
   │    keychain_set("xai.devicekey.{account_id}.{device_id}", device_priv)
   │      ACL: WhenUnlockedThisDeviceOnly, application=bundle id only
   │    device_priv 立即从内存 zeroize(只留 Keychain 副本)
   │    device_pub 上传 sync_devices.device_pub
   │
   │ 6. wrap_v1 = X25519_encrypt(device_pub, DEK_v1)        ← per-device wrap (C-D)
   │    用 sealed_box / HPKE 模式;envelope: { v=1, ephemeral_pub: 32B, ciphertext, tag }
   │
   │ 7. dek_check        = HMAC-SHA256(DEK_v1, "xai.dek.check.v1")
   │    secret_key_check = HMAC-SHA256(secret_key, "xai.sk.check.v1")
   │ 8. recovery_seed                = HKDF-Expand(DEK_v1, "xai.recovery.sig.v1") → 32B
   │    (recovery_priv, recovery_signing_pub) = Ed25519_from_seed(recovery_seed)
   │    server 只存 recovery_signing_pub (32B)
   │
   │ 9. POST /auth/signup
   │   ──────────────────────────────────────────────────→
   │   { email, auth_password,                              ← server 内部走 Supabase Auth 创建 user
   │     kek_salt, kek_kdf_version=1,
   │     current_key_id=1,
   │     dek_check, secret_key_check, recovery_signing_pub,
   │     device: { client_device_id, device_pub, wrap_v1,
   │               name="Mac-XXXX"(随机), os_major, app_version
   │             },
   │     mnemonic_acknowledged_at_client=false }
   │                                                  Server (Edge Function):
   │                                                  - Supabase Auth 创建 user → 拿 user_id (= auth.uid())
   │                                                  - INSERT accounts (id = user_id, **不接受 client account_id**, H-7)
   │                                                  - 分配 encryption_device_id (BIGSERIAL,8B)
   │                                                  - INSERT sync_devices (含 device_pub + encryption_device_id)
   │                                                  - INSERT device_dek_wraps
   │                                                  - INSERT account_keyring (key_id=1, status='active', can_retire=false)
   │   ←──────────────────────────────────────────────────
   │   { account_id, access_token, refresh_token, encryption_device_id }
   │
   │ 10. UI 强制流程(顺序):
   │     a. 展示 24 词助记词;用户必须打字回填某 6 个词 ✅
   │     b. 展示 secret_key 备份卡片(QR + 文本 + 建议打印);用户必须回填某 4 位 ✅
   │     c. 客户端本地用 secret_key_check 验证用户回填正确
   │     d. 标记 mnemonic_acknowledged=true + secret_key_acknowledged=true(走 Edge Function +
   │        Ed25519 proof,因 accounts UPDATE 由 service_role 控制)
   │ 11. refresh_token 存 macOS Keychain
   │ 12. KEK 缓存到 Keychain;device_priv 也存 Keychain
   │ 13. SQLite db_key = HKDF(KEK, "xai.sqlite.v1");打开 SQLCipher (AES-256-CBC+HMAC-SHA512)
   │ 14. 内存中 DEK_v1 / master_password / KEK / secret_key / device_priv 临时副本 zeroize
   │     (DEK_v1 解后只留 Rust KeyVault opaque handle,后续加密用)
   │
```

注意 v0.3 关键变化:
- 旧设计 `accounts.encrypted_dek` 字段被**废弃**;DEK 改为存 `device_dek_wraps` 表的多行(每 active device 一行)。这让设备撤销可以真正排除旧设备(C-D)。
- `auth_password` 包含 secret_key(H-L),secret_key 错就 login 失败,真正的双因子。
- `recovery_signing_pub` 替代原 `recovery_proof_hash`(C-A)。
- `encryption_device_id` 由 server 分配 BIGSERIAL,作 GCM nonce 高 8 字节(C-C)。

### 3.4 新设备登录流程(FR-AC-02 v0.3 重写:dual-factor + per-device wrap)

```
[Client B]                                              [Server]
   │
   │ 1. 用户输入 email + master_password + secret_key (扫码 / 手输 / Emergency Kit)
   │ 2. auth_password = Argon2id(HKDF(master_password ‖ secret_key, salt=email‖"xai.auth.v1",
   │                                  info="xai.auth.v1"), t=1,m=16MiB,p=1)
   │    (注:secret_key 错 ⇒ auth_password 错 ⇒ 直接 login 失败,无需 server 单独校验)
   │ 3. POST /auth/login (email, auth_password)
   │    Server 内部 bcrypt 校验失败 → 401 (E3013 secret_key 或 master_password 错)
   │    成功 → access_token, refresh_token
   │   ←──────────────────────────────────────────────────
   │
   │ 4. GET /auth/me  ←  { kek_salt, kek_kdf_version,
   │                       current_key_id, keyring (key_id, status),
   │                       dek_check, secret_key_check, recovery_signing_pub,
   │                       current_account_commit_seq }                       ← H-A 单调监测
   │    (不再返回 encrypted_dek;DEK 通过 device_dek_wraps 拿)
   │
   │ 5. 客户端本地校验:HMAC(secret_key,"xai.sk.check.v1") == secret_key_check
   │    (理论上 step 3 已过 = secret_key 正确,这一步是 belt+suspenders)
   │
   │ 6. KEK = Argon2id(master_password, kek_salt, secret=secret_key, t=3,m=64MiB,p=4)
   │    ⚠ v0.4 C-A:device key 仍由 client B 本地 CSPRNG 独立生成
   │    device_priv = csprng(32);device_pub = X25519_compute_pub(device_priv)
   │    keychain_set("xai.devicekey.{account_id}.{new_device_id}", device_priv)
   │    (B 的 device_priv 与 A 完全独立;A 不可能算出 B 的 device_priv)
   │
   │ 7. POST /sync/devices/register
   │    { device_id=uuidv7, device_pub, name="Mac-XXXX", os, app_version }
   │    ──────────────────────────────────────────────────→
   │                                                  Server:
   │                                                  - 分配 encryption_device_id
   │                                                  - INSERT sync_devices
   │                                                  - 通知所有 active device:有新 device 加入,
   │                                                    需为新 device 生成 wrap(走 Realtime "device_joined" 事件)
   │                                                  - 状态:device pending_dek_wrap
   │   ←──────────────────────────────────────────────────
   │   { encryption_device_id, status: "pending_dek_wrap" }
   │
   │ 8. 等待已有 device 上线为新 device 生成 wrap(详 §3.4.1)
   │    或:client B 用助记词恢复(走 FR-AC-10 / §3.6)
   │
   │ 9. 一旦 device_dek_wraps[device_id, current_key_id] 出现:
   │    GET /sync/dek_wrap?key_id=current → { wrap, key_id }
   │    DEK_current = X25519_decrypt(device_priv, wrap)
   │    校验 HMAC(DEK_current, "xai.dek.check.v1") == dek_check
   │       (失败 → 服务端可能 tamper,surface 告警,不继续)
   │
   │ 10. 缓存 refresh_token + KEK + device_priv 到 Keychain
   │ 11. SQLite db_key = HKDF(KEK, "xai.sqlite.v1");打开 SQLCipher
   │ 12. 持久化 last_seen_account_commit_seq = current_account_commit_seq (H-A 全量回滚监测)
   │ 13. 触发首次全量 pull(since_commit_seq=0)
```

#### 3.4.1 已有设备为新 device 生成 wrap(v0.5 C-A 重写:用户可验证设备配对)

> ⚠ **v0.5 关键修复 C-A**:原 v0.4 设计"Realtime broadcast device_joined → donor 自动 HPKE_seal(new_device_pub, DEK)"被废弃。**问题**:恶意服务端 / 拿到 service_role 的攻击者可 INSERT 一台 fake pending device(device_pub = 攻击者公钥),然后 broadcast device_joined;真实 donor 自动加密 DEK 给攻击者公钥并上传 wrap → 攻击者用私钥解出 DEK。零知识承诺直接塌。
>
> **修复**:donor grant 必须经过**用户可验证的端到端设备配对**(类似 Signal Safety Number / WhatsApp Verify Security Code)。Realtime 仅通知 donor UI 有 pending device,不触发自动 grant;donor 必须手动确认新 device 显示的 fingerprint 匹配。

```
[新 Device B 登录后]                                     [Server]
   │  1. POST /sync/devices/register
   │     → server 分配 encryption_device_id,status='pending_dek_wrap'
   │  2. B 端 UI 显示完整配对 payload(两种载体都给):
   │     - QR 码 = CBOR_canonical({
   │              "v": 1,
   │              "account_id": ...,
   │              "target_device_id": new_device_id,
   │              "target_device_pub": new_device_pub raw 32B,   ← ⚠ v0.6 C-B:必须含完整 pub
   │              "protocol_version": "sync.protocol=1" })
   │     - SAS 6 词验证码 = BIP39_wordlist 按 11-bit 分组 from SHA256(QR_canonical)[:66 bit]
   │       (H-4 RFC SAS:取 transcript hash 前 66 bit / 11 = 6 words)
   │  3. B 进入"等待配对"屏

[Donor Device A] ←── Realtime "device_pending" event (含 new_device_id only) ───
   │  4. A 端 UI 弹"待确认的新设备"通知;**绝不自动 grant**
   │  5. 用户点开通知 → A 显示对话框:
   │     "请在新设备上扫描 QR 码,或手输 6 词验证码"
   │  6. 用户在 A 上扫 B 的 QR 或 手输 6 词:
   │     A 解 CBOR_canonical(QR_payload) → 得到 qr.target_device_pub 等字段
   │     ⚠ **v0.6 C-B 关键**:A 必须用 **qr.target_device_pub** 做后续 HPKE,
   │                          **不是** server 返回的 new_device_pub_from_server
   │     A 同时拉 server: GET /sync/devices/<new_device_id> → server_row
   │     A 本地比对 SHA256(qr.target_device_pub) vs SHA256(server_row.device_pub):
   │       - 一致 → server 没篡改,继续(标 server_pub_matches=true)
   │       - 不一致 → **拒绝 grant + E3031 server_pub_mismatch + UI 严重告警**
   │                  ("服务端返回的设备公钥与新设备显示的不同,可能是中间人攻击")
   │     若选 6 词路径:A 用 qr 字段重算 SAS hash,与用户输入 6 词比对
   │  7. (qr 验证通过后)A 本地从 KeyVault 取 DEK_current
   │  8. wrap_for_new = HPKE_seal(
   │                       recipient_pub = qr.target_device_pub,           ← ⚠ 用 QR 内 pub
   │                       plaintext = DEK_current,
   │                       info = "xai.dek.wrap.v1",                       ← H-5 HPKE info:域分离
   │                       aad = CBOR_canonical(wrap_aad_schema 7.1.2.2))  ← H-5 HPKE aad:wrap metadata
   │  9. 对账户所有 non-retired key_id 重复 step 8
   │  10. 生成 transcript = CBOR_canonical({account_id, new_device_id,
   │                          target_device_pub_hash: SHA256(qr.target_device_pub),
   │                          server_pub_hash: SHA256(server_row.device_pub),
   │                          donor_device_id, wraps_hash: SHA256(concat(wraps))})
   │     transcript_signature = Ed25519_sign(donor_recovery_signing_priv, transcript)
   │   (v0.6 C-B:confirmation_proof 改为 Ed25519 签名 transcript,server 不可伪造)
   │  11. POST /sync/devices/grant_dek_wrap
   │      { target_device_id, wraps: [{key_id, wrap}, ...],
   │        user_confirmed: true,
   │        transcript, transcript_signature }
   │   ──────────────────────────────────────────────→
   │                                              Server (Edge Function):
   │                                              - 校验 donor active (H-1)
   │                                              - 校验 target.status = 'pending_dek_wrap'
   │                                              - SELECT FOR UPDATE target row(H-10)
   │                                              - 必须 user_confirmed=true,否则 E3026
   │                                              - Ed25519_verify(donor recovery_signing_pub,
   │                                                              transcript, transcript_signature)
   │                                                通过才接受(transcript 含两个 pub hash,server
   │                                                即使中间篡改也不能伪造签名)
   │                                              - 校验 transcript.target_device_pub_hash 
   │                                                与 server_row.device_pub hash 一致(防 server 已被攻破)
   │                                              - 事务内:INSERT device_dek_wraps + 
   │                                                UPDATE sync_devices SET status='active'(H-1 唯一路径)
   │                                              - Realtime 通知 B:wrap ready
```

**UX 注意**:
- 单设备用户想登第二台:必须保留第一台 + 走配对流程。若第一台不可用,走助记词恢复(§3.6)。
- "device_pending" 通知不会自动激活新设备;用户不点确认或指纹不匹配 → 新设备永远不能解 DEK。
- 5 分钟未配对 → server cron 自动把 pending device 标 expired,清理后允许新一次注册重试。
- **设备撤销**:撤销的 donor 不能再 grant(H-1 + RLS + RPC 三层校验)。

**关键变化(vs v0.4)**:
- v0.4 自动 grant 被 codex 第四轮审查指出可被 service_role 攻击伪造,v0.5 强制用户验证。
- 用户体验上多 1 步(确认/扫码),但这是端到端加密产品的必要代价(参考 1Password / Bitwarden / Signal 同样的设备添加确认)。
- 旧 device 撤销 ⇒ 删 device_dek_wraps 行 + Re-key,旧设备即使重登也无法解新 DEK。

### 3.5 主密码 / Secret Key 重置(不可恢复路径,FR-AC-03 v0.2 限制)

**关键决策**:重置 = 失去旧数据,除非走助记词恢复。

- 用户走"忘记密码 / 忘记 secret key" → 客户端要求**输入助记词**(FR-AC-10 流程)。流程见 §3.6。
- **不允许**仅凭邮箱 reset 重新设置密码(原 v0.1 设计被 C-04 否决,因为该路径让攻击者接管邮箱后即可永久毁掉用户数据)。
- 若用户连助记词都丢:UI 强提示"全部数据将丢失",二次确认后允许"清空云端 + 用新密码 + 新 secret_key + 新 DEK 重新开始"(等效首次注册)。

**Recovery 防护(v0.3-A 修订:Ed25519 签名,详 FR-SY-69)**:
- `PATCH /auth/me` 改 encrypted_dek / kek_salt / secret_key_check / recovery_signing_pub 等敏感字段必须由 Edge Function service_role 处理,**RLS 不允许 client 直接 UPDATE accounts 任何敏感列**(C-B,详 §6.2)。
- Edge Function 工作流(v0.4 C-E 修订:绑定完整 payload):
  ```
  POST /auth/recovery_challenge          → server 返回 { challenge_id, challenge: 32B random,
                                            ttl: 5min, bound_to: account_id }
  client 用 (DEK from 助记词) 派生 recovery_seed = HKDF-Expand(DEK, "xai.recovery.sig.v1")
  client 从 recovery_seed 还原 Ed25519 keypair
  client 构造 new_payload(完整 PATCH body,包含 auth_password / kek_salt /
                          secret_key_check / 新 device 信息 / Supabase Auth 相关字段)
  client 计算 payload_canonical_hash = SHA256(CBOR_canonical(new_payload))
  message = CBOR_canonical({
                "v": 1,
                "challenge_id": ...,
                "account_id": ...,
                "payload_canonical_hash": payload_canonical_hash,      ← v0.4 C-E:绑定完整 payload
                "ts": <client_unix_ms> })
  signature = Ed25519_sign(recovery_signing_priv, message)
  PATCH /auth/me { challenge_id, message, signature, new_payload }
  Edge Function 校验(v0.4 严格化):
    1. challenge_id 未过期 / 未被使用过(防 replay)
    2. message.account_id == auth.uid()
    3. ⚠ SHA256(CBOR_canonical(new_payload)) == message.payload_canonical_hash
       (整体 payload 绑定,任何字段被替换都会让 hash 不一致)
    4. Ed25519_verify(recovery_signing_pub from accounts, message, signature) == true
    5. new_payload 字段白名单校验(防 server 接受意料外字段;但任何允许字段都被 hash 覆盖)
  通过 → service_role UPDATE accounts(并标 challenge 已用)
  ```
- **C-E 修复点**:原 v0.3 message 只含 `new_*_hash` 字段级 hash,server 可篡改 PATCH body 里**未列入 hash 的字段**(如 auth_password 切换为攻击者控制值)绕过签名。v0.4 message 改为绑定 `SHA256(CBOR_canonical(整个 new_payload))`,任何字段变动都让 hash 不一致 → 签名校验失败。
- **协议正确性**:server 只 verify 签名,无须 raw seed;签名绑定完整 payload 防字段篡改。

### 3.6 助记词恢复流程(FR-AC-10 v0.3 修订:Ed25519 签名 + 限于当前 key)

```
[Client]
  │ 1. 用户输入 24 词助记词
  │ 2. DEK_current = BIP39_24w_decode(words)   ← 256-bit 完整无损恢复(仅当前 key)
  │ 3. 让用户设新 master_password + 新 secret_key(可选:复用旧 secret_key 若还记得)
  │ 4. kek_salt' = csprng(16)
  │ 5. KEK' = Argon2id(new_master_password, kek_salt', secret=new_secret_key, t=3,m=64MiB,p=4)
  │ 6. ⚠ v0.4 C-F:auth_password' 必须与注册一致,**包含 secret_key**(原 v0.3 退回 master-only 是漏洞):
  │    auth_password' = Argon2id(HKDF(new_master_password ‖ new_secret_key,
  │                                    salt=email‖"xai.auth.v1",
  │                                    info="xai.auth.v1"), t=1,m=16MiB,p=1)
  │ 7. ⚠ v0.4 C-A:设备注册时 device_priv 由本地 CSPRNG 独立生成 (X25519,32B)
  │    device_pub' = X25519_compute_pub(device_priv')
  │    keychain_set("xai.devicekey.{account_id}.{new_device_id}", device_priv')
  │    (KEK' 不再参与 device key 派生)
  │ 8. 用 device_pub' 包装 DEK_current → wrap_for_this_device'(HPKE Base mode, H-3)
  │    (KEK' 只用于派生 SQLite db_key + Argon2id auth_password)
  │ 9. recovery_seed = HKDF-Expand(DEK_current, "xai.recovery.sig.v1")
  │    (recovery_priv, recovery_pub) = Ed25519_keypair_from_seed(recovery_seed)
  │    (注意:recovery_pub 与 server 上原 recovery_signing_pub 必须一致 → 否则助记词错或 server 被篡改)
  │ 10. GET /auth/recovery_challenge → server 返回 challenge
  │ 11. new_payload = {
  │       "kek_salt": kek_salt', "auth_password": auth_password',
  │       "secret_key_check": secret_key_check',
  │       "new_device": { "device_id": new_device_id, "device_pub": device_pub',
  │                       "wrap_for_this_device": wrap_for_this_device',
  │                       /* ⚠ v0.4 C-F:encryption_device_id 由 server 分配,client 不传 */ },
  │       "kek_kdf_version": 1 }
  │     payload_canonical_hash = SHA256(CBOR_canonical(new_payload))
  │     message = CBOR_canonical({"v":1, "challenge_id":..., "account_id":...,
  │                                "payload_canonical_hash": payload_canonical_hash, "ts":...})
  │     signature = Ed25519_sign(recovery_priv, message)
  │ 12. PATCH /auth/me { challenge_id, message, signature, new_payload }
  │ 13. Edge Function 校验:
  │     ① SHA256(CBOR_canonical(new_payload)) == payload_canonical_hash
  │     ② Ed25519_verify(recovery_signing_pub, message, signature) == true
  │     ③ 通过 → 分配 encryption_device_id (server 端) + service_role UPDATE → 返回新 token + 新 encryption_device_id
  │ 14. 后续同新设备登录流程(SQLCipher 用 KEK' 派生 db_key,device_priv' 存 Keychain)
```

**重要限制(C-F)**:24 词助记词只能恢复**当前 active DEK** 下的数据。如果账号曾经历过 Re-key(撤销设备触发,见 FR-AC-14),旧 key_id 下的 blob 必须满足 `keyring.can_retire = true`(server cron 校验"该 key_id 下无任何 blob/conflict_shadow/staging_blobs")才能 retire,否则禁止 retire — 这保证助记词恢复时不会有"看得见 metadata 但解不开" 的孤儿数据。如果用户从未做过 Re-key,所有数据都在当前 key 下,助记词可完整恢复。**v2 议题**:helmet seed 方案(24 词作 root seed,HKDF 派生整个 keyring)可消除该限制,详 §12.3。

**前提**:用户必须持有助记词 + 设新主密码 + 设新 secret_key。助记词丢 = 数据丢(零知识承诺的代价,在 onboarding 三屏强提示)。

<!-- §3.2 / §3.3 / §3.4 / §3.5 / §3.6 已在上方 v0.2 重绘段落中给出 -->

### 3.7 本地存储加密(FR-SY-74 v0.3 修订:SQLCipher 4 默认参数,H-K)

主 PRD `TECHNICAL_REQUIREMENTS §2.1.3` 原"todos.title 本地明文"在 v0.2 被废弃。**本地 SQLite 必须由 SQLCipher 4 加密**:

- 数据库密钥 `db_key = HKDF-SHA256(KEK, salt=account_id, info="xai.sqlite.v1") → 32B`
- **SQLCipher 4 默认 AES-256-CBC + HMAC-SHA512**(不是 AES-GCM,原 v0.2 写法错误)
- 配置(verified 参数,SQLCipher 4 ≥ 4.5):
  ```sql
  PRAGMA cipher_compatibility = 4;        -- 强制走 v4 默认参数
  PRAGMA key = "x'<32 byte hex of db_key>'";  -- raw key 模式,跳过 PBKDF2(已是高熵)
  -- 不要写 PRAGMA cipher='aes-256-gcm',SQLCipher 4 不支持 GCM
  ```
- db_key 不写盘、不进 Keychain;每次应用启动 / Keychain 解锁后由 KEK 实时派生
- 数据库文件位置:`~/Library/Application Support/XAI_Desktop/xai.db`(沙箱版走 container 路径)
- **降级路径**:用户卸载或迁移数据,通过"导出 → 加密 zip"路径(FR-SY-50),不允许导出明文 SQLite
- onboarding 强提示用户启用 FileVault(双重保护)
- 演练:Phase 5 验收必须包含"拿到 SQLite 文件副本 → 无 master_password 不可读"的 PoC(§10.2)
- **Phase 0 兼容性验证**:用 `sqlcipher` CLI 打开 db 必须失败;用对应版本 rusqlite + sqlcipher feature 打开必须成功

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

每条记录的"上传 row"在客户端形成时,**字段一律全部加密成一个 blob**(整 row JSON → AES-256-GCM → ciphertext)。服务端只看见(v0.3 修订):
```
{ account_id, entity_type, entity_id,
  revision, key_id,                                    -- v0.3 C-E/C-07
  blob (含 encryption_device_id+counter+ciphertext+tag, AAD 即时计算 — 不存),
  commit_seq, client_updated_at, deleted_at, hard_deleted,
  originator_device_id, mutation_id, blob_size }      -- v0.3 mutation_id 幂等 (FR-SY-72)
```

服务端**不索引 row 内具体字段**(没法,看不到)。所有 entity 内部字段查询(如"找未完成的 todo")都在客户端 SQLite 上做,服务端只是 dumb store。

### 4.2 上传前 redact(grid_items.payload_json)

`grid_items.payload_json` 可能包含 macOS 绝对路径(`/Users/lijinlong/Documents/foo.pdf`)。上传前在 client 侧做:
- 替换 home dir 为 `$HOME`
- 不上传 `security_scoped_bookmark` 二进制(沙箱 token,跨设备无意义)
- **文件指纹改为 keyed hash(v0.2 修订,对应 H-10)**:`fingerprint = HMAC-SHA256(DEK, file_content_sha256)`,**每账号独立命名空间**,跨账号无法关联;原 SHA-256 明文上传方案废弃

### 4.3 本地 SQLite 加密(v0.2 新增,对应 C-09)

所有本地缓存表均在 SQLCipher 加密数据库内,见 §3.7。无明文 SQLite。

---

## 5. 功能需求

> 主 PRD §5.9 已有 11 条(FR-AC-01~05、FR-SY-01~06)。本节扩展(v0.3 更新计数):
> - 账号:FR-AC-06~14(9 条)
> - 加密原语 + 协议:FR-SY-07~14(8 条)+ FR-SY-67~78(12 条)= 20 条
> - 同步协议 + 冲突 + Realtime + 离线 + 多设备 + UI + 失败恢复 + 导出 + 隐私 + 零知识 + 凭据 + 速率 + 弱网:FR-SY-15~66(52 条)
> - **v0.3 合计扩展 FR ≈ 81 条**,其中 P0 多数(详各表标注)
> 优先级:**P0 = v1 GA 必做(Phase 0 + Phase 5)**;**P1 = v1.x patch / 公测期补**;**P2 = v2 评估**。

### 5.1 账号(FR-AC-06~10)

| ID | 优先级 | 需求 | 验收标准 | Threat |
|---|---|---|---|---|
| FR-AC-06 | P0 | **OAuth via Sign in with Apple / Google + Passkey 可选(v0.2,H-12)** | 走 Supabase OAuth provider;OAuth 完成 Supabase auth 后,**KEK 源**用户三选一:(a) 设主密码 + Secret Key(默认,与邮箱路径一致);(b) Passkey + Secure Enclave 派生 KEK(macOS 14+);(c) OAuth provider 的 OIDC `sub` 走客户端侧 PRF 派生(v2);拒绝弱密码(zxcvbn ≥ 3) | T1 |
| FR-AC-07 | P0 | Refresh token 自动续期 | Supabase SDK 自动续期;access_token 过期前 60s 提前续;失败 3 次走"会话过期请重新登录"UI;轮换时 Realtime WS 主动断连重建(L-04) | — |
| FR-AC-08 | P0 | Refresh token + KEK 存 macOS Keychain | `kSecAttrAccessibleWhenUnlockedThisDeviceOnly`;ACL 限定 trusted application list(只 XAI_Desktop bundle id);查询前判断 device unlocked | T3 |
| FR-AC-09 | P0 | **主密码 + Secret Key 强提示 UI(v0.2 修订)** | 首次注册流程必含"主密码 + Secret Key 双丢失=数据丢失"3 屏强提示;最后一屏要求:(a) 打字回填 24 词助记词中某 6 个 ✅;(b) 打字回填 secret_key 某 4 位 ✅;rejected weak password(zxcvbn ≥ 3) | T4 |
| FR-AC-10 | P0 | **24 词助记词恢复(v0.2 修订,C-05)** | 输入 24 词 BIP-39(256-bit + 8-bit checksum)→ 解出 DEK → 校验 dek_check → 重设 master_password + secret_key → recovery proof → 全量 pull(见 §3.6) | T4 |
| FR-AC-11 | P1 | TOTP 双因素(主 PRD FR-AC-05 P1) | Supabase MFA enrollment;登录时多一步 TOTP | T1/T3 |
| FR-AC-12 | P0 | 账号删除请求(GDPR 30 天硬删) | UI 入口 → 标记 accounts.deletion_scheduled_at = now + 30d;期间登录可撤销;期满 cron 硬删所有该 user 的 encrypted_blobs + accounts row + Supabase auth user | 合规 |
| FR-AC-13 | P0 | 账号删除前数据导出 | 强制删除前展示"导出全部数据"按钮(.json.age 加密版,FR-SY-70);用户点了再允许进入 30 天硬删流程 | 合规 |
| FR-AC-14 | P0 | **多设备列表 + 远程撤销 + 强制 Re-key(v0.3 重写,C-D)** | 设置页显示已登录设备(device_id / 随机名 / last_active_at);可点"撤销该设备":(1) revoke refresh_token,(2) `sync_devices.revoked_at = now() AND status='revoked'`,(3) **DELETE FROM device_dek_wraps WHERE device_id=...** (旧 device 不再有 wrap 可解),(4) 触发 FR-SY-13 Re-key:生成 DEK_v_n+1 → 用其他 active device 的 device_pub 包装 → 重加密所有 blob 到 DEK_v_n+1;撤销前 UI 强提示;**device 名默认 "Mac-XXXX" 不用 hostname**(L-3) | T11 |

### 5.2 密钥与加密(FR-SY-07~14 v0.2 修订 + FR-SY-67~75 新增)

| ID | 优先级 | 需求 | 验收标准 | Threat |
|---|---|---|---|---|
| FR-SY-07 | P0 | **加密原语 v0.5**:AES-256-GCM + deterministic nonce + **三端 nonce lease 统一锚点** | nonce = `encryption_device_id (8B server 分配) ‖ counter (4B per device per key_id)`;**v0.5 C-C 改三端统一为 server-side nonce lease**(Keychain 锚点降级为 macOS 端可选补强):client 每次启动 / lease 用尽时 `POST /sync/nonce_lease { key_id, count: N }` → server 在 `nonce_lease` 表 INSERT 一个 `(encryption_device_id, lease_start, lease_end)` 单调递增 lease;client 必须在 lease 范围内用 counter,超出 → `POST` 申请下一段 lease(server 保证 lease 单调,旧 lease 用过的 counter 不会重发);Web 端 / macOS 端走同套机制 → 跨平台一致 nonce 唯一性;**C-B server UNIQUE(account_id, key_id, encryption_device_id, counter) 是最后一道防线**;到 0xFFFFFF00 强制 Re-key;v2 议题:AES-GCM-SIV(R-10.9)消除 nonce-misuse 假设 | T1/T2/T13(C-C v0.5) |
| FR-SY-08 | P0 | **加密 envelope 格式 v0.3** | `{ v: u8, kdf_v: u8, key_id: u32 LE, encryption_device_id: u64 LE, counter: u32 LE, ciphertext: var, tag: 16B }`;**nonce 不在 envelope 内单独存,由 (encryption_device_id, counter) 拼接计算**,客户端解密时重建;AAD **不存 envelope 内**,由 client 按 §7.1 FR-SY-67 deterministic CBOR 规则即时计算;v=1, kdf_v=1, key_id ≥ 1 | T1(C-C/C-G) |
| FR-SY-09 | P0 | 解密失败 = 不影响其他 record | 单条 GCM tag 失败:标记该 entity 为 corrupted、记入 sync_audit_log、surface "可疑活动" 告警(可能是 T1.1 调包)、继续处理其他 record;不抛全局 panic | T1.1 |
| FR-SY-10 | P0 | **内存中 KEK / DEK 显式 zeroize v0.2** | 使用 `zeroize` crate;**用完立即 zeroize**(不依赖 Drop);DEK 仅在 Rust 侧 KeyVault 持有,不允许进 `serde::Serialize` / 不允许跨 JS boundary | T3'/T6/L-06 |
| FR-SY-11 | P0 | 加密层版本字段 | account row `kek_kdf_version` + blob `v` + `key_id` 三重独立;v2 升级时双写过渡 | 演进 |
| FR-SY-12 | P0 | 加密 / 解密 benchmark 预算 | 加密单条 1KB record < 0.5ms(P95)/ 解密 < 0.3ms;100 record batch encrypt < 50ms;Web (WASM) 单独基线表 | 性能 |
| FR-SY-13 | P0 | **Re-key 流程 v0.6(C-D 阻断助记词 + H-7 quarantine 模式)** | 触发:用户主动 / 撤销设备 / counter 达 2^32。**v0.6 H-7 紧急撤销 quarantine**:撤销设备 → 立即标 `accounts.key_quarantine_at = now()` → 旧 key_id 立即拒绝新写入(/sync/push 返回 E3033 key_quarantined);未撤销 device 仍可本机离线只读 + 导出;用户必须完成 Re-key 阻断式新助记词回填后才解 quarantine。完整流程:(a) keyring INSERT 新 key_id, status='staging';(b) **置 quarantine** 暂停旧 key 新写入;(c) donor 生成 DEK_v_n+1 + 新 24 词助记词 + 新 recovery_signing_keypair;(d) **UI 阻断**:展示新助记词 + 强制 6 词回填;(e) Ed25519 recovery proof PATCH server recovery_signing_pub_v_n+1;(f) 用所有 active device pub HPKE_seal DEK_v_n+1 → device_dek_wraps;(g) 按 batch 重加密 blob → staging_blobs;(h) server 原子 swap current_dek_key_id + 旧 key_id status='retired' + 清 quarantine;未完成步骤 c-h → quarantine 持续;UX 提示 | T11(C-D + H-7) |
| FR-SY-14 | P0 | 加密原语 fuzz 测试 | 至少 24h fuzz(`cargo-fuzz`);envelope parse / decrypt / AAD 解析在恶意输入下不 panic | T1 |
| **FR-SY-67** | P0 | **AEAD AAD = Deterministic CBOR(v0.3 重写,C-G)** | 每次加密 AAD 用 RFC 8949 §4.2 deterministic CBOR encoding,integer-keyed map,固定 schema;blob 加密 schema 见 §7.1.2.1(9 字段含 account_id / entity_type / entity_id / proposed_revision / key_id / deleted_flag / schema_version / encryption_device_id);wrap / recovery message AAD schema 见 §7.1.2.2/3;**AAD 不存 envelope 内**,client encrypt/decrypt 都按规则即时计算;原 v0.2 `||` 拼接方案废弃;Rust 用 `ciborium` + canonical writer;集成测试:server 拷 blob A 到 blob B 位置 → 客户端解密失败;测试向量 3 条进 Phase 4.8 准入门 | T1.1(C-G) |
| **FR-SY-68** | P0 | **单调 revision + 精细 rollback 区分(v0.4 H-6 修订)** | 每实体维护单调 `revision BIGINT`,客户端本地表 `entity_state(entity_id, max_seen_revision, last_blob_hash, last_commit_seq)`;pull 时按 `(entity_id, revision, commit_seq, blob_hash)` 区分:① revision == max_seen AND blob_hash == last_blob_hash → **幂等重复**(忽略);② revision == max_seen AND key_id 改变 AND server commit_seq > local last → **合法 re-encrypt**(Re-key 中);③ revision < max_seen OR (revision == max_seen AND blob_hash != last_blob_hash AND commit_seq < last) → **真 rollback**,拒收 + E3015 告警;原 v0.3 "revision <= max_seen 一律拒收" 会误杀幂等和合法 re-encrypt | T1.1(H-6) |
| **FR-SY-69** | P0 | **Recovery proof Ed25519(v0.5 强化:每次 Re-key 必更新 recovery_signing_pub)** | 注册时存 `recovery_signing_pub` (32B Ed25519 public key);client 端 `recovery_seed = HKDF-Expand(DEK_current, "xai.recovery.sig.v1")` 还原 keypair;PATCH `/auth/me` 任何敏感字段必须 Edge Function 处理:`POST /auth/recovery_challenge` → 拿 challenge → client 用 Ed25519 签 `CBOR_canonical({1:msg_v, 2:challenge_id, 3:account_id, 4:payload_canonical_hash, 5:ts})`(v0.4 C-E 完整 payload binding,**唯一 schema**,v0.3 字段级 hash schema 废弃);PATCH 带 message + signature → server verify;**v0.5 C-D 联动**:每次 Re-key(FR-SY-13)必须用旧 recovery_signing_priv 签名提交新 recovery_signing_pub_v_n+1,否则 Re-key 不允许 swap | T1.1(C-A v0.5) |
| **FR-SY-70** | P0 | **导出文件默认加密(v0.3 修订 M-8:含 secret_key)** | `xai-export-<date>.json.age` 用 [age](https://age-encryption.org/) 加密;**key 由 master_password + secret_key 共同派生**:`HKDF(master_password ‖ secret_key, salt="xai.export.v1", info=date) → 32B`(v0.2 只用 master_password 抗字典弱于主数据,M-8 修正);UI 默认加密导出,选明文导出需二次确认 + 红色警告;Markdown 子集同样加密;或可让用户选"生成随机 file key + 单独保存" 模式 | T13(C-10) |
| **FR-SY-71** | P0 | **冲突 shadow + 完整 AAD metadata(v0.4 C-H 强化)** | server 对每条被 `conditional write` 覆盖的 loser blob 写 `encrypted_blobs_conflict_shadow`,**含完整 AAD context**(key_id / encryption_device_id / counter / revision / deleted_flag / schema_version / blob_size / mutation_id / loser_commit_seq);Console 设置页"同步详情" 展示 + 支持"恢复 loser":client 用 shadow row 重建 CBOR AAD → 解密 loser blob → 让用户决定保留哪份 → 写入新 revision 走 PUSH;30 天 GC;FR-SY-26 配套 | T9(C-H/H-G) |
| **FR-SY-72** | P0 | **Mutation idempotency(v0.2 新,H-07)** | 每 mutation 带 `mutation_id UUIDv7`(client 生成,持久化在 outbox);server `encrypted_blobs` + `mutation_dedup` 表按 `(account_id, mutation_id)` UNIQUE;重复 mutation_id 返回上次 result(true idempotency),不产生新 revision | 网络抖动 / 重试 |
| **FR-SY-73** | P0 | **Secret Key 抗字典攻击(v0.2 新,H-14)** | 客户端首次注册生成 128-bit secret_key;Argon2id KEK 派生时作 `secret=` 参数(RFC 9106 §3.1);server 只存 `secret_key_check = HMAC(secret_key, "xai.sk.check.v1")`;UI 强提示打印 / PDF 备份 Emergency Kit;登录新设备必须输入(扫码 / 手输);丢 secret_key 走助记词恢复 | T1(C-01 配套) |
| **FR-SY-74** | P0 | **本地 SQLite SQLCipher 加密(v0.3 H-K 修正)** | `db_key = HKDF(KEK, "xai.sqlite.v1") → 32B`;SQLCipher 4 默认 **AES-256-CBC + HMAC-SHA512**(不是 AES-256-GCM,原 v0.2 写法错误);用 `PRAGMA key = "x'<32 byte hex>'"`(raw key 模式)避免 PBKDF2 二次派生(因为我们的 db_key 已经是 HKDF 派生的高熵 key);`PRAGMA cipher_compatibility = 4`;db_key 不写盘;Phase 5 验收:disk image dump → SQLite 文件 → 无 master_password 不可读 | T3/T3.5/T13 |
| **FR-SY-75** | P0 | **DEK + device_priv 常驻 Rust KeyVault(v0.3 扩展,C-06 / C-D)** | DEK 永不出 Rust 进程内 KeyVault;**device_priv 也常驻**(unwrap DEK 时用);JS 只拿 opaque `key_handle: u32`;Tauri command:`crypto_encrypt_for(entity_type, entity_id, proposed_revision, plaintext) -> envelope`(server 端自动查 KeyVault + 组 CBOR AAD,详 §7.1)/ `crypto_unwrap_dek_for_device(wrap_envelope) -> dek_handle` / `crypto_wrap_dek_for_devices(dek_handle, device_pubs[]) -> wraps[]` / `crypto_recovery_sign(challenge, new_payload_hash) -> signature`;Tauri capability allowlist:`crypto_*` 命令只允许 plugin-account / core-data 调 | T6/T10(C-06) |
| **FR-SY-76** | P0 | **Per-device DEK wrap + 用户可验证设备配对(v0.5 C-A 强化)** | 每 active device 注册时 client **本地 CSPRNG 独立生成** X25519 device_keypair(device_priv = csprng(32));device_priv 仅存 macOS Keychain (`xai.devicekey.<account_id>.<device_id>`, WhenUnlockedThisDeviceOnly, ACL=bundle id);device_pub 上传 `sync_devices.device_pub`;`device_dek_wraps` 表存 `(account_id, device_id, key_id) → HPKE_seal(device_pub, DEK_v_key_id, info=CBOR_canonical(wrap_aad_schema))`(HPKE Base mode RFC 9180,X25519+HKDF-SHA256+AES-GCM);**v0.5 C-A**:donor grant 必须经过**用户可验证的端到端配对**(6 词 fingerprint 或 QR 码),`grant_dek_wrap` RPC 必须收到 `user_confirmed=true + confirmation_proof`,server 端独立计算 fingerprint 并比对;Realtime 仅发"device_pending" 通知 UI,**不触发自动 grant**;详 §3.4.1;新错误码 E3026 user_confirmation_required | T11/T1.1(C-A v0.5) |
| **FR-SY-77** | P0 | **账户级 commit_seq 单调监测(v0.3 新,H-A 轻量替代 Merkle root)** | accounts.current_account_commit_seq BIGINT;每次任何 mutation commit 都自增;client 本地 sync_state.last_seen_account_commit_seq 持久化;每次 PULL/login 拿到 server 返回 current_account_commit_seq → 校验 `>= last_seen`,若 `<` 则表示**server 试图全账户回滚**,surface 严重告警 + 暂停同步 + 联系用户;不是密码学级 Merkle,但能检测整体回滚;v2 议题:升级为 Merkle root / hash chain | T1.1 |
| **FR-SY-78** | P0 | **离线 squash + lazy encrypt at flush(v0.5 C-F 明确 one-shot push)** | outbox 不存预加密 ciphertext,改存 plaintext payload + 元数据;同 entity 多次编辑取最新 plaintext + 最新 mutation_id;**flush 时 client 单步**:① 从本地 `entity_state` 读 `base_revision = max_seen_revision`;② 计算 `proposed_revision = base_revision + 1`;③ 用 proposed_revision 构造 CBOR AAD;④ 即时加密(nonce 从 nonce_counter 取,counter 必须在 active lease 内 — C-C);⑤ **一次 POST /sync/push** 带完整 envelope + base_revision + proposed_revision;⑥ server 验证 `base_revision == server.current_revision`,通过则 INSERT(`applied_revision = proposed_revision`),失败 → 409 conflict shadow;**禁止两阶段 reservation**(原 v0.4 "server 先返 proposed_revision 再加密" 暗示被废弃 — 与 PUSH 请求形态矛盾且增加竞态) | 离线 / C-F v0.5 |

### 5.3 增量同步协议(FR-SY-15~21 v0.2 修订)

| ID | 优先级 | 需求 | 验收标准 |
|---|---|---|---|
| FR-SY-15 | P0 | **增量协议 client→server PUSH(v0.3,C-E)** | 每 record 携带:`entity_id`, `proposed_revision`(= base_revision + 1,client 提交,**server 验证不重写**), `base_revision`(读取时看到的 revision,conditional write), `mutation_id`(UUIDv7), `client_updated_at`(ms,仅展示用); server 校验 `base_revision == current_revision AND proposed_revision == current_revision + 1` 才接受,否则返回 409 + conflict payload(FR-SY-71);**AAD 用 proposed_revision**(client 加密时已知),server 不改 revision → AAD 一致 → 解密通过;见 §7.3 |
| FR-SY-16 | P0 | **增量协议 server→client PULL(v0.4 H-7 账户级全局)** | 客户端维护**单一**全局 `account_commit_seq_cursor` BIGINT(不分 entity_type);`GET /sync/pull?since_commit_seq=<commit_seq>&limit=500` 不接受 entity_type 参数,server 返回混合 entity_type 排序结果;PullRecord 必须含 `entity_type`;client 按 entity_type 路由到对应表;原 v0.3 "按 entity_type cursor" 与账户级全局排序 (FR-SY-22) 矛盾,被废弃 |
| FR-SY-17 | P0 | **Tombstone 软删除(v0.2 修订)** | 客户端不真删,标 `deleted_at`;服务端 tombstone 90 天 + 所有已注册设备 ACK 后可由 cron 物理 GC(M-11);Phase 5 加 device_sync_progress 表跟踪;v1 保守起见 v1.0 GA 不开 GC,只标"可 GC" 状态 |
| FR-SY-18 | P0 | Batch 大小动态 | 上行 PUSH 默认 batch=50 records / 1MB;遇 5xx 或 timeout 自动减半;成功后逐步放大回去 |
| FR-SY-19 | P0 | 同步压缩 | HTTP body 自动 gzip(threshold ≥ 4KB);Realtime 走标准 WS permessage-deflate |
| FR-SY-20 | P0 | 全量同步降级 | 当 client 的 `commit_seq_cursor` 落后 server > 100k 或 > 30 天时,触发全量 pull(分 page,UI 显示进度) |
| FR-SY-21 | P0 | 同步 P95 预算 | TECHNICAL_REQUIREMENTS §1.2 的预算(2s / 5s)在 1k records / 1MB blob batch 条件下 |

### 5.4 冲突解决(FR-SY-22~26 v0.2 重写)

> v0.2 重要变更:原 LWW + tombstone-优先 + updated_at-tiebreak 方案被 commit_seq + conditional write + 冲突 shadow 替代。详见审查报告 H-02 / H-03 / H-04 / H-05。

| ID | 优先级 | 需求 | 验收标准 |
|---|---|---|---|
| FR-SY-22 | P0 | **权威排序 = `(server_commit_seq, entity_id)`(v0.3 强化)** | server 用 `commit_seq BIGSERIAL`(全局,**账户级单 cursor 不分 entity_type**,H-J)在每次 commit 自增;**这是唯一的全局排序权威**;client 提交 proposed_revision = base+1(C-E),server 验证 + 分配 commit_seq + 不改 revision;客户端 timestamp 仅用于展示 |
| FR-SY-23 | P0 | 时钟偏移仅作展示 hint | `client_updated_at` 仅展示;`server_commit_seq` 决定顺序;client clock 超前 / 落后 server > 5min 时仅记 warn 不影响协议 |
| FR-SY-24 | P0 | **delete = mutation,无特殊优先级(v0.2 重写)** | delete 也是 mutation,按 commit_seq 决胜;undelete 是写新 revision,自然按 commit_seq 决胜,不靠时间比较(H-03);区分 `soft_delete`(用户操作,默认)vs `hard_delete`(用户在 settings 显式触发清理,跳过 30 天保留) |
| FR-SY-25 | P0 | 用户撤销 / undo | 客户端本地保留 30 天软删数据;UI 可恢复 → 写一条新 revision 的 mutation,自动按 commit_seq 决胜覆盖 tombstone |
| FR-SY-26 | P0 | **冲突日志 + 用户可见(升 P0,与 FR-SY-71 联动)** | sync_audit_log 记录每次 409 conditional-write 拒绝;Console 设置页"同步详情"展示最近 100 条冲突 + loser shadow;允许用户翻看 / 恢复 loser |

### 5.5 Realtime 订阅(FR-SY-27~31 v0.2 修订)

| ID | 优先级 | 需求 | 验收标准 |
|---|---|---|---|
| FR-SY-27 | P0 | **Realtime Private Channels + Authorization(v0.3 H-I 强制)** | Supabase Realtime **必须**用 `supabase.channel(name, { config: { private: true } })` 启用 Private Channels + Authorization(`config.private: true` 不是可选);每个 account_id 一个 channel `sync:<account_id>`;`realtime.messages` RLS policy:`USING (extension = 'postgres_changes' AND realtime.topic() = 'sync:' \|\| auth.uid())`;集成测试:user_B 订阅 `sync:<user_A_id>` channel → expect 0 message |
| FR-SY-28 | P0 | Realtime 消息载荷 | 服务端发的 message 仅含:`{ entity_type, entity_id, commit_seq, originator_device_id }`。**不含 encrypted_blob**(避免误以为 Realtime 通道泄漏数据;blob 仍走 REST pull) |
| FR-SY-29 | P0 | **Realtime 触发 pull(v0.5 H-5 改账户级)** | 客户端收到 Realtime msg → 若 `originator_device_id == self` 则忽略;否则 schedule `pull(since_commit_seq = local_account_commit_seq_cursor)`(不带 entity_type,与 v0.4 H-J/H-7 全局 cursor 一致;原"按 entity_type"调用残留废弃) |
| FR-SY-30 | P0 | Realtime 推送延迟预算 | P95 < 5s(改动落 server → 另一台设备 UI 刷新);P99 < 15s;Realtime 乱序到达由 commit_seq 排序自然处理(P-04) |
| FR-SY-31 | P0 | **Realtime 重连退避(升 P0)** | WebSocket 断开后指数退避(1s, 2s, 4s, ..., 上限 60s);恢复后自动 catch-up pull;JWT 过期时主动断连重连(L-04) |

### 5.6 离线模式 + 队列(FR-SY-32~37 v0.2 修订)

| ID | 优先级 | 需求 | 验收标准 |
|---|---|---|---|
| FR-SY-32 | P0 | **离线写入队列(原子事务,v0.2 强化,M-12)** | 离线时所有 mutation 在**同一 SQLite transaction** 内完成:`BEGIN IMMEDIATE; -- 写 entity 表 -- 写 sync_outbox -- COMMIT;`;crash 中间状态绝不出现(本地有数据但无 outbox 记录) |
| FR-SY-33 | P0 | sync_outbox 表结构(v0.2 扩展) | 增加 `mutation_id`, `base_revision`, `causal_deps`(JSON,引用的其他 entity 的 max_seen revision,P-01);见 §6.3 |
| FR-SY-34 | P0 | **回放顺序按依赖 DAG(v0.2 重写,H-06 / P-01)** | 联网后按 seq 升序回放,但**合并去重时按实体 DAG 拓扑排序**:parent-delete 必须等待所有 child-delete 已合并;label-delete 前必须 cascade 写 label_assignments tombstone;不跨依赖合并 |
| FR-SY-35 | P0 | 回放失败处理 | 单条 push 失败(5xx)→ 退避后重试;4xx(payload 损坏)→ 标记 dead_letter 并 surface UI;409 conflict → 拉最新 + UI 提示用户选择 merge / 覆盖 / 保留双份(FR-SY-71);不阻塞后续条目 |
| FR-SY-36 | P0 | 网络变化触发 flush | macOS 监听 `SCNetworkReachability` callback;从离线→在线触发 outbox flush |
| FR-SY-37 | P1 | 离线时间过长的清单整理 | 离线超 7 天 + queue > 1000 条时,弹"压缩本地队列"提示(按 DAG 合并同实体多次写) |

### 5.7 多设备协调(FR-SY-38~41)

| ID | 优先级 | 需求 | 验收标准 |
|---|---|---|---|
| FR-SY-38 | P0 | **设备注册(v0.3 修订,L-3 / M-10)** | 首次登录时 `POST /sync/devices/register { device_id, device_pub, name="Mac-XXXX"(随机,不用 hostname), os_major="macOS 14"(模糊不到 patch), app_version="1.0.x"(不到 patch) }`;返回 `{ device_token, encryption_device_id }` | |
| FR-SY-39 | P0 | 同 account 多窗口协调(单机内) | overlay / console 共享同一 SQLite + 同一 plugin-account 实例(SQLite WAL 模式),走本地 `core-events` 事件,不走云端;**只有 cross-device 才走 Sync** |
| FR-SY-40 | P0 | 同设备多窗口同时编辑同一 todo | 本地走 SQLite 事务序列化;`core-events` 推送变更让另一窗口刷新;**无冲突可能** |
| FR-SY-41 | P0 | **多设备同时编辑同一 todo(v0.2 修订)** | 两端都本地写 → 两端都 push(各自带 base_revision)→ server 按 conditional write 决胜,loser 返回 409 + 自动入 conflict shadow(FR-SY-71);落后的一端 UI toast "本条数据已被其它设备更新,你的版本已保留 30 天,点击恢复";依赖按 commit_seq 排序,无静默丢失(H-05) |

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
| FR-SY-46 | P0 | **批次处理模型 v0.3(H-F)** | 改 per-record transaction:服务端逐条处理,**允许混合 status**(ok / conflict / causal_dep_unsatisfied / duplicate / revision_mismatch),返回 207 详细 result(见 §7.3 v0.3);客户端按 result 逐条更新 outbox(成功删除,conflict 走 FR-SY-71,死信走 FR-SY-48);原 v0.2 "batch atomic 整批全成或全败" 与 207 partial response 矛盾,被废弃 |
| FR-SY-47 | P0 | 指数退避 + 抖动 | 失败重试:1s, 2s, 4s, 8s, 16s, 32s, 60s(上限);每次乘随机 0.5~1.5 抖动 |
| FR-SY-48 | P0 | 死信队列(dead letter) | 单 record 重试 ≥ 10 次仍 4xx:标 dead_letter、surface 通知"X 条同步失败,点击查看";用户可选"丢弃 / 重试" |
| FR-SY-49 | P0 | 服务端长时不可用降级 | server 5xx 连续 5 分钟:UI 弹一次 "云端暂不可用,本地数据正常";继续本地运行,后台静默重试 |

### 5.10 数据导出 + 账号删除(FR-SY-50~52)

| ID | 优先级 | 需求 | 验收标准 |
|---|---|---|---|
| FR-SY-50 | P0 | **全量导出 .json.age(v0.2 默认加密,C-10)** | 设置 → "导出数据" → 客户端拉所有本地 SQLite 表(已解密) → 生成 `xai-export-<date>.json.age`(默认加密,见 FR-SY-70);**不导出剪贴板**;选明文导出需二次确认 + 红色警告;UI 强提示"放进 iCloud Drive 会丢失 E2E 保护" |
| FR-SY-51 | P0 | 导出 Markdown 子集(默认加密) | todos / notes / habits / pomodoro 转 .md;打包 .zip.age 加密(同 FR-SY-70 派生 key);明文 zip 需二次确认 |
| FR-SY-52 | P0 | 账号删除前强制导出 | FR-AC-13 已述;此处补充:删除请求提交后,客户端**本地数据不立刻删**,保留 30 天与服务端 grace period 对齐 |

### 5.11 隐私默认值 + 选择性禁同步(FR-SY-53~55)

| ID | 优先级 | 需求 | 验收标准 |
|---|---|---|---|
| FR-SY-53 | P0 | **同步默认显式确认(v0.3 M-5 修订)** | 注册流程**不默认勾选**云同步;首次登录后弹"启用云同步" 屏,用户显式确认才开;隐私偏执用户可保持仅本地模式;notes / API keys / pomodoro session 提供独立开关默认 OFF;原 v0.2 "默认开启" 设计与隐私承诺张力被废弃 |
| FR-SY-54 | P0 | 全局同步开关 | 设置 → 隐私 → "云同步" 总开关 OFF 时:停止上传 + 停止 pull + Realtime 断开;UI 显示"仅本地模式"标签 |
| FR-SY-55 | P1 | 模块级禁同步 | 设置 → 隐私 → 同步范围细分;比如可单独关闭"习惯打卡日志"上传(用户重视隐私的子模块) |

### 5.12 服务端零知识承诺(FR-SY-56~58 v0.2 修订)

| ID | 优先级 | 需求 | 验收标准 |
|---|---|---|---|
| FR-SY-56 | P0 | 服务端无明文字段(显式例外清单,M-04) | 零知识例外清单(管理 / Auth 必需):`accounts.email`、`accounts.created_at`、`accounts.id`、`sync_devices.name/os/app_version`、`sync_audit_log` 元数据;其余用户内容字段必须 blob;PR review checklist;`accounts.display_name` 改为 `encrypted_display_name` 或可选保留为客户端加密 |
| FR-SY-57 | P0 | 服务端日志不含 user content | Supabase logs 配置过滤;禁止 `RAISE NOTICE` 含 blob;禁止 trigger 解密;sync_audit_log 的 `device_id` 必须 hash 化(`HMAC(account_id, device_id)`,M-03) |
| FR-SY-58 | P0 | **RLS 严格(v0.2 强化,H-08 / M-02)** | 见 §6.2:每张 user-data 表 RLS policy + **设备校验**(`originator_device_id IN active_devices`);**显式声明**:RLS 防 client/authenticated 越权,不防 service_role / Supabase Studio Admin(后者由零知识承诺保护:能看 ciphertext 但不能解);Phase 5 RLS fuzz 模拟 1000 用户随机访问 |

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

### 6.1 Postgres 表(v0.5)

> **v0.5 H-8 重要**:migration 执行顺序必须为 `accounts → sync_devices → account_keyring → device_dek_wraps → encrypted_blobs → encrypted_blobs_conflict_shadow → staging_blobs → nonce_lease → mutation_dedup → device_sync_progress`。`device_dek_wraps` FK 到 `sync_devices` 必须在 `sync_devices` 建表后才能 ALTER 加。下方按部署顺序列出。
>
> **v0.5 H-9 commit_seq 可部署 SQL**:

> v0.2 修订摘要:`encrypted_blobs` 加 `revision / key_id / commit_seq / mutation_id` 字段;`accounts` 加 `secret_key_check / dek_check / recovery_proof_hash / current_dek_key_id / encrypted_display_name`;新增 `account_keyring` / `encrypted_blobs_conflict_shadow` / `mutation_dedup` / `device_sync_progress` / `staging_blobs` 表;`entity_type` 改 ENUM。

```sql
-- ─── H-9 commit_seq global sequence + 分配 RPC ──────
CREATE SEQUENCE account_commit_seq_global;                   -- 简化:全租户共享 sequence

CREATE OR REPLACE FUNCTION fn_alloc_commit_seq(p_account_id UUID)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_seq BIGINT;
BEGIN
  -- v0.6 H-13:防止单帐户 commit_seq 倒退;原 hashtext() 32-bit 易碰撞,改 UUID 高/低 64-bit 拆分
  PERFORM pg_advisory_xact_lock(
    (('x' || substr(p_account_id::text, 1, 16))::bit(64))::bigint,
    (('x' || substr(p_account_id::text, 20, 12) || substr(p_account_id::text, 25, 4))::bit(64))::bigint
  );
  v_new_seq := nextval('account_commit_seq_global');
  UPDATE accounts
    SET current_account_commit_seq = v_new_seq
    WHERE id = p_account_id
      AND current_account_commit_seq < v_new_seq;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'account % not found or commit_seq regression', p_account_id;
  END IF;
  RETURN v_new_seq;
END;
$$;
REVOKE ALL ON FUNCTION fn_alloc_commit_seq(UUID) FROM PUBLIC;
-- 只在 /sync/push Edge Function 内以 service_role 调用,REPEATABLE READ 事务里

-- ─── ENUM ──────────────────────────────────────────
CREATE TYPE sync_entity_type AS ENUM (
  'settings','grids','grid_items','auto_classify_rules',
  'lists','todos','todo_reminders','labels','label_assignments',
  'habits','habit_logs','boards','board_lists','board_cards',
  'board_card_checklist','notes','progress_trackers','pets','plugins'
);  -- 对应 M-09

-- ─── 账号(v0.3:移除 encrypted_dek + current_dek_key_id;迁移到 device_dek_wraps/keyring)──
CREATE TABLE accounts (
  id                          UUID PRIMARY KEY,             -- = auth.users.id
  email                       TEXT NOT NULL UNIQUE,
  encrypted_display_name      BYTEA,                        -- 客户端加密(M-04)
  kek_salt                    BYTEA NOT NULL,               -- 16B Argon2id salt
  kek_kdf_version             SMALLINT NOT NULL DEFAULT 1,
  current_dek_key_id          INTEGER NOT NULL DEFAULT 1,   -- 当前 active key_id(C-07)
  secret_key_check            BYTEA NOT NULL,               -- HMAC(secret_key,"xai.sk.check.v1") (FR-SY-73)
  dek_check                   BYTEA NOT NULL,               -- HMAC(DEK_current,"xai.dek.check.v1") (M-13)
  recovery_signing_pub        BYTEA NOT NULL,               -- v0.3 Ed25519 public key 32B (FR-SY-69)
  mnemonic_acknowledged       BOOLEAN NOT NULL DEFAULT false,
  secret_key_acknowledged     BOOLEAN NOT NULL DEFAULT false,
  mfa_enabled                 BOOLEAN NOT NULL DEFAULT false,
  current_account_commit_seq  BIGINT NOT NULL DEFAULT 0,    -- v0.3 H-A 全账户回滚监测
  key_quarantine_at           TIMESTAMPTZ,                  -- v0.6 H-7:Re-key 紧急 quarantine 起始;NOT NULL 时旧 key 拒新写
  deletion_scheduled_at       TIMESTAMPTZ,                  -- GDPR 30 天
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── DEK Keyring(v0.3 修订:移除 encrypted_dek,加 can_retire)──
CREATE TABLE account_keyring (
  account_id  UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  key_id      INTEGER NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('active','retired','staging')),
  can_retire  BOOLEAN NOT NULL DEFAULT false,                -- v0.3 C-F:server cron 检查"该 key_id 下无任何 blob/shadow/staging" 才置 true
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  retired_at  TIMESTAMPTZ,
  PRIMARY KEY (account_id, key_id)
);

-- ─── Per-device DEK wraps(v0.3 新表,C-D)──
CREATE TABLE device_dek_wraps (
  account_id  UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  device_id   UUID NOT NULL,
  key_id      INTEGER NOT NULL,
  wrap        BYTEA NOT NULL,                                -- v0.4 H-3 改 HPKE Base mode (RFC 9180):
                                                             -- X25519 + HKDF-SHA256 + AES-GCM
                                                             -- info 参数绑定 CBOR AAD wrap schema (§7.1.2.2)
                                                             -- envelope: { v=1, enc:32B (ephemeral_pub), ct, tag:16B }
  granted_by_device_id UUID,                                 -- audit:donor 设备(注册时为 self)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, device_id, key_id),
  FOREIGN KEY (account_id, key_id) REFERENCES account_keyring(account_id, key_id) ON DELETE CASCADE
  -- v0.6 H-3:device_id FK 到 sync_devices 必须在 sync_devices 建表后 ALTER 加(见下方)
);

-- v0.6 H-3:device_dek_wraps.device_id FK 到 sync_devices,sync_devices 建表后 ALTER 加
-- ALTER TABLE device_dek_wraps
--   ADD CONSTRAINT fk_dek_wraps_device
--   FOREIGN KEY (device_id) REFERENCES sync_devices(device_id) ON DELETE CASCADE;
-- (该 ALTER 语句移到 §6.1 末尾 sync_devices 之后执行)

CREATE INDEX idx_dek_wraps_device
  ON device_dek_wraps (account_id, device_id);              -- 撤销 device 时按 device_id 批量删

-- v0.4 H-10:grant RPC 内必须以 SELECT ... FOR UPDATE 锁定 target device sync_devices 行
-- 并在事务内验证 status='active',否则拒绝 INSERT wrap;详 Edge Function /sync/devices/grant_dek_wrap

-- ─── 加密 blob 单表(v0.2 大改:加 revision / key_id / commit_seq / mutation_id)──
CREATE TABLE encrypted_blobs (
  account_id        UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  entity_type       sync_entity_type NOT NULL,
  entity_id         TEXT NOT NULL,                           -- 客户端生成 uuidv7
  revision          BIGINT NOT NULL,                         -- 单调(FR-SY-68)
  key_id            INTEGER NOT NULL,                        -- 引用 account_keyring(C-07)
  -- v0.5 C-B:nonce 字段拆出 envelope,作 server columns 加 UNIQUE 约束
  encryption_device_id BIGINT NOT NULL,                      -- nonce 高 8B,从 envelope 解析
  counter           BIGINT NOT NULL,                         -- nonce 低 4B,从 envelope 解析
  blob              BYTEA NOT NULL,                          -- AES-GCM envelope 完整字节(含 v|kdf|key_id|enc_dev_id|counter|ct|tag)
  commit_seq        BIGINT NOT NULL,                         -- H-4:由 fn_alloc_commit_seq SECURITY DEFINER RPC 分配
  client_updated_at BIGINT NOT NULL,                         -- ms,仅展示用
  server_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),      -- 仅审计用
  deleted_at        TIMESTAMPTZ,                             -- tombstone(soft)
  hard_deleted      BOOLEAN NOT NULL DEFAULT false,          -- 用户显式硬删(FR-SY-24)
  originator_device_id UUID NOT NULL,
  mutation_id       UUID NOT NULL,                           -- idempotency(FR-SY-72)
  blob_size         INTEGER NOT NULL,                        -- 用于 quota
  PRIMARY KEY (account_id, entity_type, entity_id)
);

-- v0.6 C-A:used_nonces 不可删 ledger,所有写路径 first-insert,GCM nonce 全局唯一硬不变量
-- 替代 v0.5 仅 encrypted_blobs UNIQUE 方案(漏 hard_deleted/staging/shadow)
CREATE TABLE used_nonces (
  account_id            UUID NOT NULL,
  key_id                INTEGER NOT NULL,
  encryption_device_id  BIGINT NOT NULL,
  counter               BIGINT NOT NULL CHECK (counter BETWEEN 0 AND 4294967295),  -- H-6:4B 上界
  source                TEXT NOT NULL CHECK (source IN ('blob','staging','rekey_swap','shadow_loser')),
  inserted_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, key_id, encryption_device_id, counter)
  -- 注:**永不 DELETE**;hard_deleted blob 也不释放 nonce(防 attacker hard-delete 后复用 nonce)
);
-- 所有 nonce 消费路径(encrypted_blobs / staging_blobs / encrypted_blobs_conflict_shadow / re-key swap)
-- 必须在同一事务内先 INSERT used_nonces;违反 PK = nonce 复用 → E3027 + 严重告警

-- v0.5 encrypted_blobs 内 UNIQUE 索引保留作冗余防线(双重保险)
CREATE UNIQUE INDEX uniq_encrypted_blobs_nonce
  ON encrypted_blobs (account_id, key_id, encryption_device_id, counter)
  WHERE hard_deleted = false;

CREATE UNIQUE INDEX idx_blobs_mutation_id
  ON encrypted_blobs (account_id, mutation_id);              -- v0.2 idempotency 唯一索引

CREATE INDEX idx_blobs_pull_cursor
  ON encrypted_blobs (account_id, entity_type, commit_seq);  -- v0.2 commit_seq 作 cursor

CREATE INDEX idx_blobs_realtime
  ON encrypted_blobs (account_id, commit_seq);

-- ─── commit_seq 全局序列(v0.2)─────────────────────
-- 用 BIGSERIAL,在 INSERT trigger / RPC 内分配,保证全局单调
-- 客户端 PULL cursor 就是 last_seen commit_seq

-- ─── Mutation 去重(v0.3 H-H:GC 90 天,覆盖典型离线窗口 + 死信触发用户响应)─────────────────
CREATE TABLE mutation_dedup (
  account_id    UUID NOT NULL,
  mutation_id   UUID NOT NULL,
  result        JSONB NOT NULL,                              -- 上次 push 的 PushResponse JSON
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, mutation_id)
);
CREATE INDEX idx_mutation_dedup_gc
  ON mutation_dedup (created_at);                            -- v0.3 > 90 天后 GC(原 7 天太短,H-H)

-- ─── 冲突 shadow(v0.4 C-H 扩展:存完整 AAD metadata 才能 30 天后重建解密)
CREATE TABLE encrypted_blobs_conflict_shadow (
  id                       BIGSERIAL PRIMARY KEY,
  account_id               UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  entity_type              sync_entity_type NOT NULL,
  entity_id                TEXT NOT NULL,
  loser_blob               BYTEA NOT NULL,                          -- 被覆盖的 loser envelope
  -- v0.4 C-H:完整 AAD context,loser 30 天后还原解密所需
  loser_key_id             INTEGER NOT NULL,                        -- 用哪个 DEK 版本加密
  loser_encryption_device_id BIGINT NOT NULL,                       -- nonce 高 8B
  loser_counter            INTEGER NOT NULL,                        -- nonce 低 4B
  loser_revision           BIGINT NOT NULL,                         -- AAD 中的 revision
  loser_deleted_flag       SMALLINT NOT NULL,                       -- AAD deleted_flag
  loser_schema_version     INTEGER NOT NULL,                        -- AAD schema_version
  loser_blob_size          INTEGER NOT NULL,                        -- 校验用
  loser_mutation_id        UUID NOT NULL,                           -- audit
  loser_device_id          UUID NOT NULL,                           -- 提交者 device
  loser_commit_seq         BIGINT,                                  -- 若 loser 曾被分配过 commit_seq
  rejected_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  winner_commit_seq        BIGINT NOT NULL                          -- 被哪一次 commit 覆盖的
);
CREATE INDEX idx_conflict_shadow_gc
  ON encrypted_blobs_conflict_shadow (rejected_at);                 -- > 30 天 GC

-- 恢复 loser 流程:client SELECT 该 row → 用 loser_* 字段重建 CBOR AAD →
-- 用 device_dek_wraps[device_id, loser_key_id] 解出 DEK_v_loser_key_id →
-- AES-GCM_decrypt(loser_blob, key=DEK, nonce=loser_encryption_device_id||loser_counter, AAD=rebuilt) →
-- 用户决定保留哪份 → 走正常 PUSH 路径写入新 revision

-- ─── Staging blobs(v0.4 H-5 明确:re-encrypt 不改 entity revision,只换 key + rekey_session ordering)
CREATE TABLE staging_blobs (
  account_id              UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  rekey_session_id        UUID NOT NULL,                        -- 一次 Re-key 一个 session
  snapshot_commit_seq     BIGINT NOT NULL,                      -- session 开始时账户 commit_seq 快照
  new_key_id              INTEGER NOT NULL,
  entity_type             sync_entity_type NOT NULL,
  entity_id               TEXT NOT NULL,
  -- v0.4 H-5:re-encrypt 保留原 entity revision 不变,但需要保存全部 AAD context
  preserved_revision      BIGINT NOT NULL,                      -- 复制原 blob.revision(不变,只换 key)
  new_encryption_device_id BIGINT NOT NULL,                     -- 重加密时所用 device(donor 自己的 enc_dev_id)
  new_counter             INTEGER NOT NULL,                     -- 重加密时所用 counter
  new_blob                BYTEA NOT NULL,                       -- 用 DEK_v_new 重加密
  preserved_deleted_flag  SMALLINT NOT NULL,                    -- 0/1/2 同原 blob,不变
  preserved_schema_version INTEGER NOT NULL,
  source_mutation_id      UUID NOT NULL,                        -- 原 blob 的 mutation_id(audit)
  rekey_session_order     BIGSERIAL,                            -- session 内 ordering;swap 按此顺序应用
  uploaded_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, rekey_session_id, entity_type, entity_id)
);

-- v0.3 Re-key 期间在线写入:client 按 snapshot_commit_seq 之前的写 DEK_v_n 进 staging,
-- 之后的(包括 swap 时刻起)写 DEK_v_n+1 直接进 encrypted_blobs;swap 时 server 把 staging
-- 中所有 entity 原子 swap 进 encrypted_blobs(server-side TRANSACTION + DELETE old + INSERT new)

-- ─── Device 同步进度(v0.2,M-11 GC tombstone 用)───
CREATE TABLE device_sync_progress (
  account_id          UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  device_id           UUID NOT NULL,
  last_ack_commit_seq BIGINT NOT NULL DEFAULT 0,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, device_id)
);

-- ─── 设备登记(v0.3:加 device_pub + encryption_device_id;os/app_version 模糊化)──
CREATE TABLE sync_devices (
  device_id              UUID PRIMARY KEY,
  account_id             UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  device_pub             BYTEA NOT NULL,                    -- v0.3 X25519 public key 32B (C-D)
  encryption_device_id   BIGINT NOT NULL UNIQUE,            -- v0.3 server 分配,8B 唯一,作 GCM nonce 高位 (C-C)
  name                   TEXT,                              -- 默认随机化 "Mac-XXXX"(L-05),不存 hostname
  os_major               TEXT,                              -- v0.3 模糊化:仅大版本如 "macOS 14"(M-10)
  app_version            TEXT,                              -- "1.0.x" 粒度,不到 patch (M-10)
  status                 TEXT NOT NULL DEFAULT 'pending_dek_wrap'
                         CHECK (status IN ('pending_dek_wrap','active','revoked')),
  registered_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at             TIMESTAMPTZ                        -- 撤销 → device_dek_wraps 全删 + 触发 Re-key
);

CREATE SEQUENCE encryption_device_id_seq START WITH 1;     -- 全局 unique per device

-- v0.6 H-3:sync_devices 建表后,补 device_dek_wraps 的 FK
ALTER TABLE device_dek_wraps
  ADD CONSTRAINT fk_dek_wraps_device
  FOREIGN KEY (device_id) REFERENCES sync_devices(device_id) ON DELETE CASCADE;

-- v0.5 C-C:server 端 nonce lease 表(三端统一 nonce 唯一性)
CREATE TABLE nonce_lease (
  id                   BIGSERIAL PRIMARY KEY,
  account_id           UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  encryption_device_id BIGINT NOT NULL REFERENCES sync_devices(encryption_device_id) ON DELETE CASCADE,
  key_id               INTEGER NOT NULL,
  lease_start          BIGINT NOT NULL CHECK (lease_start BETWEEN 0 AND 4294967295),  -- v0.6 H-6
  lease_end            BIGINT NOT NULL CHECK (lease_end   BETWEEN 0 AND 4294967295),  -- v0.6 H-6
  granted_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (lease_end >= lease_start)
);
-- v0.6 C-A:用 btree_gist EXCLUDE 防 lease 范围重叠(EXCLUDE USING gist 配合 int8range)
-- 简化版:RPC fn_grant_nonce_lease 内 SELECT ... FOR UPDATE 锁 (account_id, enc_dev_id, key_id) 最大 lease_end,
--          新 lease.lease_start = max_lease_end + 1,保证严格单调不重叠
ALTER TABLE nonce_lease ADD CONSTRAINT no_lease_overlap
  EXCLUDE USING gist (
    account_id WITH =,
    encryption_device_id WITH =,
    key_id WITH =,
    int8range(lease_start, lease_end, '[]') WITH &&
  );
-- 启用 RLS(v0.6 H-2)
ALTER TABLE nonce_lease ENABLE ROW LEVEL SECURITY;
-- 不开放 client SELECT/INSERT/UPDATE/DELETE,所有访问走 fn_grant_nonce_lease SECURITY DEFINER
CREATE INDEX idx_nonce_lease_lookup
  ON nonce_lease (account_id, encryption_device_id, key_id, lease_end);
-- 申请 lease 走 SECURITY DEFINER RPC fn_grant_nonce_lease(account_id, key_id, count):
--   SELECT FOR UPDATE 锁定该 (account_id, encryption_device_id, key_id) 最大 lease_end
--   INSERT new lease (lease_start = max_lease_end+1, lease_end = lease_start+count-1)
--   返回 (lease_start, lease_end)

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

### 6.2 RLS Policies(v0.2 强化,FR-SY-58 / H-08 对应)

```sql
ALTER TABLE accounts                          ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_keyring                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_dek_wraps                  ENABLE ROW LEVEL SECURITY;  -- v0.3 新
ALTER TABLE encrypted_blobs                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE encrypted_blobs_conflict_shadow   ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging_blobs                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE mutation_dedup                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_sync_progress              ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_devices                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_audit_log                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_quota                        ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- accounts(v0.3 重写:C-B 撤销 client UPDATE)
-- ─────────────────────────────────────────────
CREATE POLICY accounts_self_read ON accounts
  FOR SELECT USING (id = auth.uid());
-- v0.3 删除原 accounts_self_update;所有 UPDATE 走 Edge Function service_role + Ed25519 recovery proof
-- 注:Supabase Auth 自己的字段(如 email/password)走 Supabase Auth API,与本表 RLS 无关

-- ─────────────────────────────────────────────
-- account_keyring(v0.3:只读)
-- ─────────────────────────────────────────────
CREATE POLICY keyring_self_read ON account_keyring
  FOR SELECT USING (account_id = auth.uid());
-- 写由 Edge Function service_role(创建新 key_id / 标 retired / GC)

-- ─────────────────────────────────────────────
-- device_dek_wraps(v0.4 C-B 严格化:只读自己 device + active)
-- ─────────────────────────────────────────────
-- 读:仅当前 JWT device 自己的 wrap,且 device 必须 active(不允许 pending)
CREATE POLICY dek_wraps_self_active_read ON device_dek_wraps
  FOR SELECT USING (
    account_id = auth.uid()
    AND device_id = (auth.jwt() ->> 'device_id')::uuid
    AND device_id IN (
      SELECT device_id FROM sync_devices
      WHERE account_id = auth.uid()
        AND status = 'active'
        AND revoked_at IS NULL
    )
  );
-- 写:由 Edge Function /sync/devices/grant_dek_wrap 验过 donor active + target active 后走 service_role
-- 不开放 client INSERT/UPDATE/DELETE

-- ─────────────────────────────────────────────
-- encrypted_blobs(v0.4 C-D 客户端只读;C-B SELECT 加 active 校验)
-- ─────────────────────────────────────────────
-- 读:JWT device 必须 active(不允许 pending / revoked)
CREATE POLICY blobs_self_active_read ON encrypted_blobs
  FOR SELECT USING (
    account_id = auth.uid()
    AND (auth.jwt() ->> 'device_id')::uuid IN (
      SELECT device_id FROM sync_devices
      WHERE account_id = auth.uid()
        AND status = 'active'
        AND revoked_at IS NULL
    )
  );

-- ⚠ v0.4 C-D:删除 blobs_self_write / blobs_self_update policy
-- 所有写入(INSERT / UPDATE / DELETE)由 /sync/push Edge Function 走 service_role
-- 客户端永远不能直接 mutate encrypted_blobs,这样 conditional write / mutation_dedup /
-- conflict shadow / commit_seq 分配的不变量才能由 server 保证

-- ─────────────────────────────────────────────
-- conflict shadow / staging blobs:H-D 改只读
-- ─────────────────────────────────────────────
-- v0.5 H-6:conflict_shadow / staging SELECT 加 active device 校验,与 encrypted_blobs 同等
CREATE POLICY conflict_shadow_self_active_read ON encrypted_blobs_conflict_shadow
  FOR SELECT USING (
    account_id = auth.uid()
    AND (auth.jwt() ->> 'device_id')::uuid IN (
      SELECT device_id FROM sync_devices
      WHERE account_id = auth.uid() AND status = 'active' AND revoked_at IS NULL
    )
  );

CREATE POLICY staging_blobs_self_active_read ON staging_blobs
  FOR SELECT USING (
    account_id = auth.uid()
    AND (auth.jwt() ->> 'device_id')::uuid IN (
      SELECT device_id FROM sync_devices
      WHERE account_id = auth.uid() AND status = 'active' AND revoked_at IS NULL
    )
  );
-- 写由 Edge Function /sync/rekey/upload_staging 控制

-- ─────────────────────────────────────────────
-- mutation_dedup / device_sync_progress
-- ─────────────────────────────────────────────
-- v0.6 H-11:mutation_dedup / device_sync_progress 加 active device 校验
CREATE POLICY mutation_dedup_self_active ON mutation_dedup
  FOR SELECT USING (
    account_id = auth.uid()
    AND (auth.jwt() ->> 'device_id')::uuid IN (
      SELECT device_id FROM sync_devices
      WHERE account_id = auth.uid() AND status = 'active' AND revoked_at IS NULL
    )
  );

CREATE POLICY device_progress_self_active ON device_sync_progress
  FOR SELECT USING (
    account_id = auth.uid()
    AND (auth.jwt() ->> 'device_id')::uuid IN (
      SELECT device_id FROM sync_devices
      WHERE account_id = auth.uid() AND status = 'active' AND revoked_at IS NULL
    )
  );

-- ─────────────────────────────────────────────
-- sync_devices
-- ─────────────────────────────────────────────
-- v0.6 M-6:sync_devices SELECT 默认 active-only;pending device 只读自己的 row(用于配对状态)
CREATE POLICY devices_self_active_read ON sync_devices
  FOR SELECT USING (
    account_id = auth.uid()
    AND (
      -- 任意 active device 可读账户内所有 active devices(用于设置页设备列表)
      (auth.jwt() ->> 'device_id')::uuid IN (
        SELECT device_id FROM sync_devices
        WHERE account_id = auth.uid() AND status = 'active' AND revoked_at IS NULL
      )
      OR
      -- pending device 只能读自己的 row(查 status / 等 grant)
      device_id = (auth.jwt() ->> 'device_id')::uuid
    )
  );
-- INSERT(注册新设备)、UPDATE revoked_at(撤销)由 Edge Function 控制

-- ─────────────────────────────────────────────
-- audit / quota:只读自己
-- ─────────────────────────────────────────────
CREATE POLICY audit_self ON sync_audit_log
  FOR SELECT USING (account_id = auth.uid());
CREATE POLICY quota_self ON sync_quota
  FOR SELECT USING (account_id = auth.uid());

-- Realtime 授权(v0.6 H-12 强化:含 active device 校验)
-- supabase.channel(`sync:${accountId}`, { config: { private: true } }) 必须 private:true
-- realtime.messages RLS:
--   USING (extension = 'postgres_changes'
--          AND realtime.topic() = 'sync:' || auth.uid()
--          AND (auth.jwt() ->> 'device_id')::uuid IN (
--            SELECT device_id FROM public.sync_devices
--            WHERE account_id = auth.uid() AND status = 'active' AND revoked_at IS NULL
--          ))
-- 测试:revoked device token 订阅 sync:<self_account_id> → 0 message
```

**Phase 5 RLS audit 必须项(v0.4 强化)**:
1. `SET ROLE authenticated; SET request.jwt.claims = ...` 模拟 user_A token 访问 user_B 数据 → 0 行
2. **RLS fuzz**(v0.4 扩展):property-based 1000 用户 × 100 设备 × **同账户 pending/revoked/stolen-token 组合** → 零泄漏
3. **JWT device_id claim 测试**(H-B/H-C):被撤销 device / pending device 的 token 不能 SELECT encrypted_blobs / device_dek_wraps
4. **device_dek_wraps SELECT 隔离**(v0.4 C-B):JWT device A 尝试读 device B 的 wrap → 0 行
5. **encrypted_blobs client UPDATE**(v0.4 C-D):authenticated 用户尝试 `UPDATE encrypted_blobs SET ...` → 拒绝(无 UPDATE policy);所有写入必须经 /sync/push Edge Function
6. **encrypted_blobs client INSERT/DELETE**(v0.4 C-D):同上,RLS 无对应 policy → 拒绝
7. **accounts 直接 UPDATE 测试**(C-B):RLS 无 UPDATE policy → 拒绝;敏感字段变更必须经 Edge Function + Ed25519 recovery proof
8. **device_dek_wraps 写测试**:authenticated 用户 INSERT/UPDATE wrap → 拒绝
9. **staging_blobs 写测试**(H-D):client INSERT/UPDATE staging → 拒绝
10. **grant RPC 行锁测试**(v0.4 H-10):在 grant_dek_wrap 事务内 target device status 被另一连接改为 revoked → grant 必须失败回滚
11. **显式声明**:RLS 防 authenticated/anon role 越权,**不防 service_role**(由零知识承诺保护)

### 6.3 客户端 SQLite 新增表(v0.2,所有表在 SQLCipher 加密 DB 内,FR-SY-74)

```sql
-- 离线写队列(v0.4 C-G:存 plaintext + 元数据,flush 时才加密)
CREATE TABLE sync_outbox (
  seq             INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type     TEXT NOT NULL,
  entity_id       TEXT NOT NULL,
  op              TEXT NOT NULL,                -- 'upsert' / 'soft_delete' / 'hard_delete'
  mutation_id     TEXT NOT NULL UNIQUE,         -- UUIDv7,idempotency (FR-SY-72)
  base_revision   INTEGER,                      -- conditional write,NULL = first create (FR-SY-15)
  causal_deps     TEXT,                         -- JSON [{entity_id, max_seen_revision}] (P-01)
  payload_plain   BLOB,                         -- v0.4 C-G:plaintext payload(SQLCipher 已加密本表)
                                                -- soft_delete/hard_delete 时为 NULL
  schema_version  INTEGER NOT NULL,             -- 加密时进 AAD 用
  queued_at       INTEGER NOT NULL,
  retries         INTEGER NOT NULL DEFAULT 0,
  next_retry_at   INTEGER,
  dead_letter     INTEGER NOT NULL DEFAULT 0,
  last_error      TEXT
);
CREATE INDEX idx_outbox_pending ON sync_outbox(dead_letter, next_retry_at);

-- flush 流程(v0.4):
-- 1. SELECT outbox rows WHERE dead_letter=0 AND (next_retry_at IS NULL OR next_retry_at <= now())
-- 2. DAG 拓扑排序 + same-entity squash(取最新 payload_plain + 最新 mutation_id)
-- 3. 对每条:
--    a. 用当前 KeyVault dek_handle + entity 上下文 + base_revision+1(= proposed_revision)即时加密
--       AAD = CBOR map 含 proposed_revision = base_revision + 1
--    b. POST /sync/push { ... proposed_revision: base+1, blob: ciphertext, ... }
--    c. server 验证 base_revision == current_revision (conditional write,FR-SY-15) → 应用
-- 4. 207 partial response:逐条更新 outbox(ok 删除,conflict 走 FR-SY-71 shadow,死信走 FR-SY-48)

-- 同步游标(v0.3:H-J 全局账户级 cursor,不按 entity_type;nonce counter 移到 key 级别)
DROP TABLE IF EXISTS sync_state;
CREATE TABLE sync_state (
  id                          INTEGER PRIMARY KEY CHECK (id = 1),  -- 单行
  account_commit_seq_cursor   INTEGER NOT NULL DEFAULT 0,    -- v0.4 H-7:单一全局 cursor 不分 entity_type
  last_pull_at                INTEGER,
  last_push_at                INTEGER,
  last_seen_account_commit_seq INTEGER NOT NULL DEFAULT 0           -- v0.3 H-A 全账户回滚监测
);

-- v0.5 C-C:nonce lease(三端统一,server 端唯一权威);本地 sync_state 仅记下一个要用的 counter
CREATE TABLE nonce_counter (
  key_id              INTEGER PRIMARY KEY,
  next_counter        BIGINT NOT NULL,                          -- 下一个要用的 counter(必须在 active lease 范围内)
  active_lease_end    BIGINT NOT NULL                           -- 当前 lease 上限;next_counter > active_lease_end → 申请新 lease
);
-- macOS Keychain 可选补强:`xai.nonce_high_water.<account_id>.<key_id>` 双写防 SQLite 备份回滚
-- Web 端无 Keychain → 完全依赖 server lease + UNIQUE 约束(C-B)

-- v0.5 H-3:entity_state schema 加 last_blob_hash + last_commit_seq,FR-SY-68 区分幂等 / re-encrypt / rollback
CREATE TABLE entity_state (
  entity_type         TEXT NOT NULL,
  entity_id           TEXT NOT NULL,
  max_seen_revision   INTEGER NOT NULL,
  last_blob_hash      BLOB NOT NULL,                         -- SHA-256 of last seen envelope bytes
  last_commit_seq     INTEGER NOT NULL,                      -- 配合 H-6 rollback 精细区分
  last_key_id         INTEGER NOT NULL,                      -- 配合区分合法 re-encrypt(key_id 变,revision 不变)
  PRIMARY KEY (entity_type, entity_id)
);

-- 本地审计(本地查询友好的副本)
CREATE TABLE sync_audit_local (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  at          INTEGER NOT NULL,
  operation   TEXT NOT NULL,
  entity_type TEXT,
  count       INTEGER,
  status      TEXT,
  details     TEXT                          -- JSON: device_id_hash / error / records 列表
);
CREATE INDEX idx_audit_local_at ON sync_audit_local(at DESC);

-- KeyVault state(v0.2,FR-SY-75:DEK 不写盘,但其他 key handle 状态写)
CREATE TABLE key_vault_meta (
  key_id          INTEGER PRIMARY KEY,
  algorithm       TEXT NOT NULL,                          -- 'AES-256-GCM'
  status          TEXT NOT NULL CHECK (status IN ('active','retired','staging')),
  created_at      INTEGER NOT NULL
);
```

---

## 7. 协议设计

### 7.1 加密 Envelope + AAD CBOR(v0.3 重写:C-G canonical encoding)

#### 7.1.1 Envelope 二进制格式

```
┌──────┬────────┬──────────┬─────────────────────────┬──────────────┬──────────────┬──────┐
│ v:1B │ kdf:1B │ key_id:  │ encryption_device_id:   │ counter: 4B  │ ciphertext:  │ tag: │
│      │        │   4B LE  │   8B LE                 │   LE         │  variable    │ 16B  │
└──────┴────────┴──────────┴─────────────────────────┴──────────────┴──────────────┴──────┘
   │       │        │              │                      │
   │       │        │              │                      └── 4B counter,per (device, key_id),低位先 (LE)
   │       │        │              └── 8B server-assigned encryption_device_id, unique per device (LE)
   │       │        │                    nonce = encryption_device_id ‖ counter (=12B GCM nonce 直接组装)
   │       │        └── DEK key_id,引用 account_keyring (C-07)
   │       └── kek_kdf_version
   └── envelope schema version,v=1 固定;v=2 预留(可能切 AES-GCM-SIV,见 §11 R-10.9)
```

**v0.3 关键变化(对 v0.2)**:
- **AAD 不再存 envelope 内**(原 v0.2 `aad_len + aad` 字段废弃);AAD 由 client 按 §7.1.2 deterministic CBOR 规则**即时计算**,加密时塞入 GCM AAD 参数,解密时同样规则重建。这避免了"AAD 拼接歧义"(C-G)和"server 调包 AAD 字段冒充其他实体"两类风险。
- nonce 拆为 `encryption_device_id + counter` 两个独立字段(C-C);**JS / plugin 永远不直接构造 nonce**,由 Rust 侧 KeyVault 内部 nonce_counter 表维护。

#### 7.1.2 AAD = Deterministic CBOR(RFC 8949 §4.2,C-G)

**所有 AEAD AAD 必须用 deterministic CBOR encoding**,固定 map schema,integer keys。Rust 用 `ciborium` crate + custom canonical writer 实现(确保 sort keys by integer + 最短长度编码 + no indefinite length)。

##### 7.1.2.1 blob 加密 AAD(用于 encrypted_blobs)

CBOR map(integer keys,按 key 升序):

| Key (int) | 字段 | Type | 含义 |
|---|---|---|---|
| 1 | aad_v | uint | AAD schema version,固定 1 |
| 2 | account_id | bstr (16B) | UUID raw bytes |
| 3 | entity_type | text | enum 字符串(见 §6.1 ENUM) |
| 4 | entity_id | text | 客户端生成 uuidv7 |
| 5 | proposed_revision | uint | 该 blob 的 revision(C-E,client 提交 = base+1) |
| 6 | key_id | uint | DEK 版本号 |
| 7 | deleted_flag | uint | 0=normal, 1=soft_deleted, 2=hard_deleted |
| 8 | schema_version | uint | entity 内 payload schema 版本 |
| 9 | encryption_device_id | uint | 加密时所用的 device 标识(防 device 间冒充) |

##### 7.1.2.2 device_dek_wraps wrap AAD

| Key (int) | 字段 | Type | 含义 |
|---|---|---|---|
| 1 | aad_v | uint | 固定 2(区分 wrap AAD schema) |
| 2 | account_id | bstr (16B) | |
| 3 | target_device_id | bstr (16B) | wrap 接收方 device |
| 4 | key_id | uint | 该 wrap 对应的 DEK 版本 |
| 5 | granted_by_device_id | bstr (16B) | donor device(防中间人替换 donor 来源) |

(注:wrap 用 X25519 sealed_box,本身有 HPKE AEAD 包装;AAD 进 HPKE 的 `info` 参数。)

##### 7.1.2.3 recovery message 签名 AAD(v0.5 C-E:唯一 schema,完整 payload binding)

> ⚠ **v0.5 重要**:原 v0.3 字段级 hash schema(new_kek_salt_hash / new_secret_key_check_hash / new_device_pub_hash / new_encrypted_dek_for_device_hash)**已废弃**。codex 第三轮指出字段级 hash 让 server 可篡改未列入 hash 的字段(如 auth_password)绕过签名。v0.4 起改为绑定整个 new_payload 的 canonical hash。本表为唯一权威 schema。

Ed25519 签的不是 raw bytes,而是 CBOR canonical encode 的 message map:

| Key (int) | 字段 | Type | 含义 |
|---|---|---|---|
| 1 | msg_v | uint | 固定 1 |
| 2 | challenge_id | bstr (16B) | server 返回的 challenge UUID |
| 3 | account_id | bstr (16B) | |
| 4 | payload_canonical_hash | bstr (32B) | **SHA256(CBOR_canonical(完整 new_payload))**;Edge Function 收到 PATCH 后用同样 CBOR canonical encode + SHA256 重算,与本字段比对;任何 new_payload 字段被替换/增删都会让 hash 不一致 → 签名校验失败 |
| 5 | ts | uint | client unix ms |

#### 7.1.3 Canonical encoding 规则(必读)

按 [RFC 8949 §4.2.1](https://www.rfc-editor.org/rfc/rfc8949.html#section-4.2.1) Core Deterministic Encoding Requirements:
- 所有 map 的 key 按字节序升序(integer keys 按数字升序自然等价)
- integer 用最短长度编码(0~23 用 1 字节,24~255 用 2 字节,等等)
- text/bytes 长度也用最短长度编码
- 禁止 indefinite-length
- 禁止 tagged 类型

#### 7.1.4 测试向量(必须进 Phase 4.8 准入门)

3 条向量,用 Python `cbor2` lib + Rust `ciborium` 各算一遍,bytes 必须一致:

```python
# Vector 1: blob AAD
aad_input = {
    1: 1,
    2: bytes.fromhex("01h0XY...account_uuid_16B..."),
    3: "todos",
    4: "01HXY01ABC...",
    5: 7,        # proposed_revision
    6: 1,        # key_id
    7: 0,        # not deleted
    8: 1,        # schema_version
    9: 100042,   # encryption_device_id
}
expected_cbor = bytes.fromhex("a9 01 01 02 50 ... ...")  # 固定向量

# Vector 2: wrap AAD
# Vector 3: recovery message
```

完整 fixture 存 `apps/desktop/src-tauri/tests/fixtures/cbor_aad_vectors.json`。

#### 7.1.5 实施层

- Rust 主实现:`apps/desktop/src-tauri/src/crypto/aad.rs` 用 `ciborium` + custom canonical writer;`envelope.rs` 用此模块计算 AAD
- TS 侧不直接 parse envelope / 不直接组 AAD;走 `key_handle` API(FR-SY-75)。Web 端如需镜像走 WebCrypto + 同款 CBOR 库(JS `cbor-x`)。

### 7.2 REST 端点

| 方法 | 路径 | 用途 | 鉴权 |
|---|---|---|---|
| POST | `/auth/signup` | 注册(见 §3.3) | none(Supabase Auth) |
| POST | `/auth/login` | 登录 | none |
| POST | `/auth/refresh` | refresh access_token | refresh_token |
| GET | `/auth/me` | 拉 KEK 元数据 + keyring + recovery_signing_pub + current_dek_key_id(v0.6 H-9,不再含 encrypted_dek) | bearer |
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

### 7.3 PUSH 协议(v0.2 修订:conditional write + mutation_id)

**Request**
```
POST /sync/push
Authorization: Bearer <jwt>
Content-Type: application/json; encoding=gzip
X-Device-Id: <uuid>
X-App-Version: 1.0.0
Accept-Version: sync.protocol=1                               (v0.3 L-4 / T12)

{
  "entity_type": "todos",
  "records": [
    {
      "entity_id": "01HXY...uuidv7...",
      "mutation_id": "01HXY...uuidv7...",                     // FR-SY-72 idempotency
      "base_revision": 6,                                      // FR-SY-15 conditional write,首次创建传 null
      "proposed_revision": 7,                                  // v0.3 C-E: client 提交,= base+1
      "blob": "<base64 envelope (含 key_id+encryption_device_id+counter+ciphertext+tag)>",
      "client_updated_at": 1715764800123,                      // 仅展示用
      "causal_deps": [                                         // P-01
        { "entity_id": "label_01HXY...", "max_seen_revision": 3 }
      ],
      "soft_delete": false,                                    // FR-SY-24 区分 soft/hard
      "hard_delete": false
    },
    ...
  ]
}
```

**Response 200(全部成功)— v0.4 H-11 清残留**
```json
{
  "accepted": 50,
  "server_now": "2026-05-15T10:00:00.123Z",
  "results": [
    {
      "entity_id": "01HXY...",
      "mutation_id": "01HXY...",
      "applied_revision": 7,                                    // = client.proposed_revision (C-E)
                                                                // server 不重新分配,只验证
      "commit_seq": "1234567"                                   // v0.4 H-8:BIGINT → string
    }
  ]
}
```

**Response 207(per-record partial,v0.4 H-11 与 FR-SY-46 一致)** — 不再"整 batch atomic";server 按 per-record transaction 处理,逐条返回 status:
```json
{
  "accepted": 47,
  "rejected": 3,
  "results": [
    { "entity_id": "01HXY...A", "status": "ok",
      "applied_revision": 7,                                       // = client.proposed_revision (C-E)
      "commit_seq": "1234567" },                                  // v0.6 M-2:string
    { "entity_id": "01HXY...B", "status": "conflict",
      "server_revision": 9, "server_blob": "<base64>", "winner_commit_seq": "1234500",
      "your_loser_blob_saved_to_shadow_id": 42 },
    { "entity_id": "01HXY...C", "status": "causal_dep_unsatisfied",
      "missing_dep": { "entity_id": "label_...", "needed_revision": 5, "server_revision": 4 } },
    { "entity_id": "01HXY...D", "status": "duplicate_mutation_id",
      "previous_revision": 7, "previous_commit_seq": "1230000" },  // v0.6 M-2:string
    { "entity_id": "01HXY...E", "status": "revision_mismatch",
      "reason": "proposed_revision != base_revision + 1",          // v0.3 C-E 协议错
  ]
}
```

**Response 429**
```json
{ "error": "rate_limited", "retry_after_ms": 5000 }
```

**Response 400 / 410(downgrade 防护)**
- 缺 `Accept-Version` header → 400 `{ "error": "version_required" }`(T12 / L-03)
- envelope `v` 低于 server `min_version` → 410 `{ "error": "envelope_version_too_old", "min": 1 }`

### 7.4 PULL 协议(v0.2 修订:commit_seq cursor)

**Request(v0.4 H-7:账户级全局 cursor)**
```
GET /sync/pull?since_commit_seq=1234500&limit=500
Authorization: Bearer <jwt>
Accept-Version: sync.protocol=1
```

**Response 200**
```json
{
  "records": [
    {
      "entity_type": "todos",                     // v0.4 H-7:必须含 entity_type
      "entity_id": "01HXY...",
      "revision": 7,
      "key_id": 1,
      "blob": "<base64 envelope>",
      "commit_seq": "1234567",                    // v0.4 H-8:BIGINT → string,JSON number 精度不够
      "soft_deleted": false,
      "hard_deleted": false,
      "originator_device_id": "..."
    }
  ],
  "next_commit_seq": "1234567",
  "current_account_commit_seq": "1234600",                    // v0.5 H-4:H-A 全账户单调监测必返字段
  "has_more": false
}
```

**客户端处理**:① 对每条 record 按 H-6 区分 (entity_id, revision, commit_seq, blob_hash):幂等忽略 / 合法 re-encrypt 更新 entity_state.last_key_id / 真 rollback 拒收 + E3015 告警(FR-SY-68);② 校验 `current_account_commit_seq >= sync_state.last_seen_account_commit_seq`,否则 E3024 全账户回滚告警(FR-SY-77)。

### 7.5 Realtime 消息(v0.2 修订:commit_seq + Private Channels)

```json
// channel: sync:<account_id>  (Private Channel,Authorization 校验 RLS,FR-SY-27 / H-09)
// event:   "blob_changed"
{
  "entity_type": "todos",
  "entity_id": "01HXY...",
  "commit_seq": "1234567",                                  // v0.6 M-2:string (BIGINT 精度)
  "originator_device_id": "..."
}
```

客户端忽略 `originator_device_id == self` 的消息;否则 schedule `pull(entity_type, since_commit_seq=local_cursor)`。

### 7.6 错误码(对齐 TECHNICAL_REQUIREMENTS §3.3.2 的 E3xxx,v0.2 扩展)

| Code | 含义 |
|---|---|
| E3001 | sync push failed (transport) |
| E3002 | sync push failed (4xx payload) |
| E3003 | sync pull failed |
| E3004 | encryption envelope corrupt(GCM tag failed) |
| E3005 | KEK derivation failed |
| E3006 | DEK unwrap failed (= 密码错 / secret_key 错 / device_dek_wraps row 损坏) |
| E3007 | mnemonic verify failed |
| E3008 | rate limited (429) |
| E3009 | quota exceeded |
| E3010 | clock skew too large (warn-level) |
| E3011 | dead letter |
| E3012 | conflict (409 / 207) — 客户端可走 FR-SY-71 恢复 loser |
| E3013 | secret_key verify failed (FR-SY-73) — 提示用户重输 secret_key |
| E3014 | recovery proof signature failed (FR-SY-69 v0.3) — Ed25519 verify 失败 / message hash 与 payload 不一致 / challenge 已过期或重用 → 拒绝 PATCH |
| E3015 | revision rollback rejected (FR-SY-68) — 客户端拒收旧 revision,**可疑活动告警** |
| E3016 | AAD mismatch (FR-SY-67) — server 调包密文嫌疑,**可疑活动告警** |
| E3017 | mutation_id duplicate handled (info,FR-SY-72 idempotency) |
| E3018 | causal_dep unsatisfied — 客户端补依赖后重试 |
| E3019 | downgrade detected (T12) — Accept-Version 缺失 / envelope version 过旧 |
| E3020 | sqlcipher init failed (FR-SY-74) |
| E3021 | **nonce rollback detected (v0.4 C-C)** — SQLCipher.next_counter < Keychain.high_water,SQLite 文件被备份回滚 → 拒绝加密 + 强制 Re-key |
| E3022 | **conflict shadow AAD rebuild failed (v0.4 C-H)** — shadow row 元数据残缺,loser 解密失败 |
| E3023 | **device wrap missing (v0.4)** — `device_dek_wraps[device_id, key_id]` 不存在,需 donor 协作或助记词恢复 |
| E3024 | **account_commit_seq rollback (v0.4 FR-SY-77)** — server 返回的 current_account_commit_seq < local last_seen → 严重告警,暂停同步 |
| E3025 | **CBOR non-canonical (v0.4 C-G)** — AAD CBOR encoding 不符合 RFC 8949 §4.2 deterministic 规则 |
| E3026 | **user_confirmation_required (v0.5 C-A)** — donor grant_dek_wrap 缺 user_confirmed=true / confirmation_proof 不匹配 → 拒收 |
| E3027 | **nonce_reuse_detected (v0.5 C-B)** — encrypted_blobs UNIQUE(account_id, key_id, encryption_device_id, counter) 违反 → 拒收 + 严重告警(可能 client bug 或恶意提交) |
| E3028 | **rekey_mnemonic_unconfirmed (v0.5 C-D)** — Re-key 未完成阻断式新助记词 + 新 recovery_signing_pub UI 回填确认 → 拒绝 swap |
| E3029 | **nonce_lease_exhausted (v0.5 C-C)** — Web 端 nonce lease 用尽,需重新申请 |
| E3030 | **nonce_lease_not_owned (v0.5 C-C)** — counter 不在已分配的 lease 范围内 → 拒收 |
| E3031 | **server_pub_mismatch (v0.6 C-B)** — donor 扫到的 QR.target_device_pub 与 server_row.device_pub hash 不一致 → 拒收,可能 server 被攻破或中间人 |
| E3032 | **transcript_signature_invalid (v0.6 C-B)** — donor Ed25519 transcript 签名验证失败 → 拒收 |
| E3033 | **key_quarantined (v0.6 H-7)** — accounts.key_quarantine_at NOT NULL,旧 key_id 处于 quarantine,等待用户完成 Re-key 助记词回填 |
| E3099 | unknown sync error |

### 7.7 版本协商(v0.3 修订,L-4:协议版本与文档版本分开)

- HTTP header `Accept-Version: sync.protocol=1`(协议版本与文档版本明确区分:文档当前 v0.6-DRAFT,协议当前 `sync.protocol=1`)
- server 收到缺 header 的请求 → 400 `version_required`(E3019)
- 客户端读 Response header `Sync-Protocol-Version` 校验,若 server 返 `2` 而 client 是 `1` → 阻塞同步,引导升级
- envelope `v` 字段固化在 AAD 间接绑定(C-G),**MITM 无法降级**(改 v 会让 AAD 不一致 → GCM tag fail)

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

- **可上报到 Sentry**:错误码(E3xxx)、entity_type、**device_id_hash = HMAC(account_id, device_id)**(v0.3 M-2 改 hash;原 raw device_id 与 FR-SY-57 不一致)、retry_count、batch_size、http_status、duration_ms
- **绝对禁止上报**:任何 blob 内容、entity_id(可能间接暴露)、原始 device_id、hostname、todo 标题、note 内容
- **本地诊断信息导出**(TECHNICAL_REQUIREMENTS §1.3.3):
  - 各 entity_type 的 last_synced_at
  - outbox 当前长度 + 死信数
  - 最近 100 条 sync_audit_local
  - 服务端版本号、当前账号 user_id(短)

---

## 10. 验收清单

### 10.1 Phase 0 子阶段 0.3 验收(M0-B,2026-07-07 — v0.2 工日重估 10-14 工日)

- [ ] FR-AC-01 / FR-AC-02 / FR-AC-07 / FR-AC-08:邮箱注册 + 登录 + Keychain 持久化跑通
- [ ] **FR-SY-73(Secret Key)+ FR-AC-09(双回填验证)** 注册流程完整(v0.2 新)
- [ ] FR-SY-07~12 / FR-SY-67 / FR-SY-68 / FR-SY-75:加密层独立可用,**含 AAD / key_id / revision / KeyVault opaque handle**;通过单元测试 + benchmark
- [ ] FR-SY-74:SQLCipher 启用,db_key 由 KEK 派生,无 master_password 不可读 SQLite(v0.2 新)
- [ ] FR-SY-15~22(v0.2 含 commit_seq / mutation_id / base_revision):**单表(todos)增量同步**端到端跑通,含 conditional write 冲突路径
- [ ] FR-SY-42:菜单栏图标四态显示
- [ ] FR-SY-58 + §6.2 RLS:RLS 自动测试通过(含 device 校验,v0.2 新)
- [ ] 服务端 schema 部署到 staging Supabase 项目(含 v0.2 新表 account_keyring / mutation_dedup / conflict_shadow / staging_blobs / device_sync_progress)

### 10.x **协议硬化里程碑准入门(v0.2 新,详见 dev-plan v0.2 §1.x,2026-10-07)**

> 在 Phase 5 全 entity 接入之前必须先关闭这一里程碑,否则 Phase 5 改不动。

- [ ] **所有 Critical(C-01~C-10)已实装并通过单元 + 集成测试**(参见 REVIEW-2026-05-15.md 对应 C 编号)
- [ ] **AAD 绑定测试**:服务端把 blob A 拷到 blob B 位置 → 客户端解密失败(FR-SY-67)
- [ ] **Revision rollback 测试**:服务端 UPDATE 旧 revision → 客户端拒收并告警(FR-SY-68)
- [ ] **Recovery proof 测试**:无 proof 的 PATCH `/auth/me` → server 拒绝(FR-SY-69)
- [ ] **24 词助记词跨实现兼容**:用 `@scure/bip39` + Rust `bip39` crate 各编码一份,互相解码一致(FR-AC-10 / C-05)
- [ ] **Tauri capability allowlist 测试**:非 plugin-account/core-data 的 plugin 调 `crypto_*` 命令 → 拒绝(FR-SY-75 / C-06)
- [ ] **Re-key 中断恢复**:`kill -9` 在 staging 30% / 70% / swap 前 / swap 后 4 个点重试,数据一致(FR-SY-13 / C-07)
- [ ] **RLS fuzz**:property-based 1000 用户 × 100 设备模拟,cross-tenant 数据零泄漏
- [ ] **Mutation idempotency**:同一 mutation_id 重发 10 次 → 只产生 1 个 revision(FR-SY-72)
- [ ] **TLA+ / property-based 协议模型**:2-3 个设备 × 短序列 mutation 模型检查无反例(P-03)

### 10.2 Phase 5 验收(M5 公测,2026-11-24 — v0.2 工日 4-5 周)

- [ ] 所有 P0 FR 完成(v0.2 共 52 条:原 41 + 新增 11 条 FR-SY-67~72 / 73 / 74 / 75 + FR-AC-14 升 P0)
- [ ] FR-SY-14 fuzz 测试连续跑 24h 无 panic
- [ ] 真机两台 Mac + 一台浏览器同步同账号 30 分钟,数据 100% 一致
- [ ] **属性测试(property-based)**:`fast-check` 生成随机 mutation 序列 + 随机网络分区,断言两端最终一致;运行 100k 轮(M-10)
- [ ] **进程 `kill -9` × 100 次**随机注入(写 blob / 写 outbox / Re-key 中)
- [ ] **时钟跳变测试**:NTP 调整 ±1h / ±1d,同步不崩
- [ ] 恢复演练 4 个(v0.2 修订):
  - [ ] ① 服务端 staging 数据全删 → 客户端 A(本地 SQLite 仍完整)用 KEK 解密 → 用新 DEK 重加密 → push 全量 → 客户端 B 用 24 词助记词 + 新 secret_key 恢复 → pull 全量 → A B 数据一致(M-06 修订)
  - [ ] ② 客户端 SQLite 全删,登录后全量 pull 恢复
  - [ ] ③ Re-key 中途 `kill -9` → 重启 → 数据一致(staging 未 swap 回滚,已 swap 继续)
  - [ ] ④ **设备撤销 → 强制 Re-key**:撤销 device A → device B 触发 Re-key → device A 即使重新登录也无法解新 blob(R-10.11)
- [ ] 多设备并发编辑同一 todo 50 次,无数据丢失 / 无重复 / 最终一致;**loser 全部进 conflict shadow 可恢复**(FR-SY-71)
- [ ] 离线 1 小时 + 写 200 条 mutation,联网后 outbox 完全 flush 且与另一端最终一致;**含跨实体依赖场景**(create label → assign → delete label,DAG 拓扑正确,H-06)
- [ ] 弱网模拟(toxiproxy 注入 500ms 延迟 / 10% 丢包),同步仍 P95 < 10s
- [ ] **零知识 PoC**(v0.2 新):外部审计可重现"服务端 Postgres dump → 没有 master_password / secret_key → 不能解任何 blob"
- [ ] **SQLite dump PoC**(v0.2 新,FR-SY-74):取走 SQLCipher 文件 → 没有 master_password → 不能读
- [ ] **导出文件加密验证**(FR-SY-70):`xai-export.json.age` 不输入主密码不可解

### 10.3 M6 GA 真机测试(2026-12-22)

- [ ] DMG 完整版 + MAS 沙箱版均通过上面 Phase 5 全部清单
- [ ] 凭据轮换 SOP 演练一次(轮换 service_role + JWT secret,用户登录态优雅过渡);**含分级响应剧本演练**(M-05)
- [ ] 24 小时压测:模拟 10 个账号 × 持续随机 mutation,无 OOM / 无 SQLite WAL 膨胀
- [ ] R-10 全子风险关闭:R-10.1~R-10.13 每条都有对应测试 / 演练记录
- [ ] **审查报告 REVIEW-2026-05-15.md 中 Critical + High 全数关闭**(v0.2 新)

---

## 11. 风险与缓解(R-10 详细分解)

| 子风险 ID | 描述 | 等级 | 缓解 | 触发监控 |
|---|---|---|---|---|
| R-10.1 | nonce 复用导致 GCM 灾难性失败 | 🔴 高 | **v0.3**:deterministic nonce = encryption_device_id (server 分配 unique per device) ‖ counter (per device per key_id) + SQLCipher 预写 checkpoint 防 backup 回滚(C-C);单测断言 1M unique;代码 review checklist | 单测 + fuzz |
| R-10.2 | 主密码忘 + 助记词丢 = 用户数据永失 | 🔴 高 | UI 三屏强提示 + 打字回填验证(FR-AC-09);助记词导出 PDF / 截图引导;**不承担"找回"承诺**(产品语言要明示) | 用户教育 |
| R-10.3 | 分布式写入冲突丢数据 | 🟡 中 | **v0.3**:commit_seq 权威排序 + conditional write(base_revision)+ conflict shadow loser 保留 30 天 + DAG 拓扑合并;原 LWW + server_updated_at 方案已废弃 | sync_audit_log |
| R-10.4 | RLS 配置漏洞,服务端管理员可读 blob | 🟡 中 | 服务端不存明文(零知识承诺),管理员看到也是 blob;RLS 自动测试入 CI | RLS audit |
| R-10.5 | encrypted_dek 损坏(单点失败,丢一个 = 全失败) | 🔴 高 | server 端 encrypted_dek 有 daily backup(supabase backup);客户端登录成功后立即本地 cache 一份加密的 encrypted_dek 到 Keychain | server backup |
| R-10.6 | 升级版本 / re-key 中途中断导致数据状态错乱 | 🔴 高 | Re-key 两阶段:先 staging blob 全部上传成功,再原子 swap account.encrypted_dek → 旧 blob 清理(FR-SY-13);失败回滚 | re-key 演练 |
| R-10.7 | Supabase 拖库被攻击者拿走 dump | 🟡 中 | 零知识承诺;blob 是 AES-256-GCM,2026 算力下不可解;Secret Key(FR-SY-73)抗离线字典攻击 | T1 防护已就位 |
| R-10.8 | 凭据(service_role / JWT / OAuth secret)泄漏 | 🟡 中 | 季度轮换 SOP(FR-SY-59);CI secret 隔离;`docs/runbook/credential-rotation.md` 分级响应剧本(M-05) | 凭据轮换记录 |
| R-10.9 | **Invisible Salamanders(AES-GCM 非 key-committing,Re-key 期间风险)** | 🟡 中 | v1 显式不防护,在威胁模型 §2 / 用户文档声明;v2 评估迁 AES-GCM-SIV(RFC 8452)或在 plaintext 头部加 commitment HMAC | 论文跟踪 + v2 spec |
| R-10.10 | **本地 SQLite 在已解锁 / disk image dump 下被读** | 🟡 中 | SQLCipher 加密(FR-SY-74);db_key 由 KEK 派生,KEK 在 Keychain `WhenUnlockedThisDeviceOnly`;onboarding 强提示 FileVault;Phase 5 验收必含 SQLite dump 不可读 PoC | Phase 5 演练 |
| R-10.11 | **设备撤销后旧设备仍能解密新数据** | 🟡 中 | 撤销设备强制走 Re-key(FR-AC-14 + FR-SY-13)生成 DEK_v2;keyring 标 retired;Phase 5 演练 | Phase 5 演练 |
| R-10.12 | **Tauri command 暴露 raw key 让 plugin/renderer 拿到 DEK** | 🔴 高 | DEK 常驻 Rust KeyVault(FR-SY-75);JS 只拿 opaque key_handle;Tauri capability allowlist 限定 crypto_* 调用方;架构层在 Phase 0 子阶段 0.3 之前必须改图纸 | 代码 review checklist |
| R-10.13 | **协议级缺陷(无 AAD / 无 revision / 无 recovery proof)** | 🔴 高 | 协议硬化里程碑(详 dev-plan v0.2 §1.x):AAD / revision / recovery proof / mutation_id / commit_seq / Re-key keyring 全部进 schema 后才进 Phase 5 全 entity 接入 | 里程碑准入门 |
| R-10.14 | **v0.3 助记词只能恢复当前 key,retired key 下数据丢失风险**(C-F) | 🟡 中 | keyring.can_retire 由 server cron 校验"该 key_id 下无任何 blob/shadow/staging" 才置 true;不能 retire 的 key 长期保留;v2 议题:helmet seed 方案(24 词作 root seed,HKDF 派生整个 keyring) | server cron + R-10.14 v2 跟踪 |
| R-10.15 | **v0.3 per-device wrap 复杂度风险**(C-D) | 🟡 中 | 新 device 注册必须靠 donor device 协作或助记词恢复;UI 必须清楚提示;5 分钟 timeout;TLA+ 模型必须覆盖"撤销期间新 device 加入"场景 | TLA+ 模型 + 真机演练 |
| R-10.16 | **v0.3 Ed25519 recovery 私钥推断错误风险**(C-A) | 🟡 中 | recovery_seed = HKDF-Expand(DEK, fixed_info),DEK 错 → 推不出正确签名;client 本地先用 dek_check 校验 DEK,再走签名;签名失败差错码 E3014 显式 | 单测 + 集成测试 |
| R-10.17 | **v0.3 CBOR canonical encoding 实现不一致**(C-G) | 🟡 中 | 3 条测试向量 Rust + JS + Python 三实现交叉验证;`ciborium` + `cbor-x` + `cbor2`;CI 强制跑 | 测试向量 + CI |
| R-10.18 | **nonce 备份回滚(v0.4 C-C 强化)** | 🔴 高 | v0.4:Keychain ThisDeviceOnly 存 high_water 锚点(不进 iCloud Keychain);每次加密前对比 SQLCipher.next_counter vs Keychain.high_water;不一致 → 拒绝 + E3021 + 强制 Re-key | Phase 5 演练:Time Machine 恢复 SQLite → 加密拒绝 |
| R-10.19 | **v0.3 device key 由 KEK 派生根本性缺陷(v0.4 C-A 修复)** | 🔴 高 | v0.4:device_priv 由本地 CSPRNG 独立生成,仅存 Keychain;旧设备无法算出新设备 device_priv;新设备必须 donor 协作或助记词恢复 | TLA+ 模型必含 device 撤销 / 新设备加入场景 |
| R-10.20 | **conflict shadow AAD rebuild 失败导致 loser 不可恢复(v0.4 C-H 修复)** | 🟡 中 | shadow 存完整 AAD context(key_id/encryption_device_id/counter/revision/deleted_flag/schema_version/blob_size/mutation_id);loser 恢复时重建 AAD;Phase 5 演练:30 天后恢复 loser 必须可解 | 单测 + 演练 |
| R-10.21 | **outbox plaintext 在 SQLCipher 被回滚 + Keychain 锁定时的残余风险(v0.4 C-G)** | 🟢 低 | SQLCipher 整库加密 + Keychain WhenUnlocked,设备锁屏拿不到;Time Machine 回滚 SQLite 后 outbox 内 plaintext 即使被读也无 KEK 解;Re-key 拒绝加密保证不会用错 revision 上传 | 文档说明 |
| R-10.22 | **v0.4 donor 自动 grant 被恶意服务端伪造攻击**(已 v0.5 C-A 修) | 🔴 高 | v0.5:donor grant 必须用户可验证(6 词 fingerprint / QR);Realtime 仅通知 UI 不触发自动 grant;Edge Function 强制校验 user_confirmed=true + confirmation_proof | Phase 4.8 TLA+ 含伪造设备攻击场景 |
| R-10.23 | **nonce 服务端约束缺失**(已 v0.5 C-B 修) | 🔴 高 | v0.5:encrypted_blobs 拆 encryption_device_id + counter 字段,UNIQUE(account_id, key_id, encryption_device_id, counter);server 校验 envelope.enc_dev_id 与 JWT.device_id 对应一致 | 集成测试:同 nonce 二次提交 → 拒收 E3027 |
| R-10.24 | **Web 端 nonce 备份回滚**(已 v0.5 C-C 修) | 🟡 中 | v0.5:三端统一 server nonce lease;Web 端无 Keychain → 完全靠 lease + UNIQUE;macOS 端 lease + Keychain 双重 | Phase 5 演练:Web profile 还原 → 加密拒绝 |
| R-10.25 | **Re-key 让旧助记词失效**(已 v0.5 C-D 修) | 🟡 中 | v0.5:Re-key 阻断式生成新 24 词 + 新 recovery_signing_pub,UI 强制回填确认;未确认禁止 swap;onboarding/console 强提示更新备份 | Phase 5 演练:Re-key 后用旧助记词恢复 → 失败,用新助记词 → 成功 |

---

## 12. 待办

### 12.1 v0.2 范围内待决策(本周内)
- [ ] Phase 0 决策点:Supabase 项目正式注册 + billing 绑定(目前用 Free tier)
- [ ] **`zxcvbn` 主密码 + secret_key 强度计**实装时机(建议 Phase 0 子阶段 0.3,与 FR-AC-09 并)
- [ ] OAuth (FR-AC-06) 走 (a) 默认主密码+Secret Key / (b) Passkey + Secure Enclave 二选一作为 v1 GA 配置

### 12.2 v0.3 / v1.x 议题(REVIEW-2026-05-15.md Medium / Low 项)
- [ ] **M-07**:同步默认开启改"首次登录显式确认",notes / pomodoro / API keys 独立开关 OFF
- [ ] **M-08**:整 row 加密 vs 字段级 merge — notes 长文本上 CRDT 评估(与 §1.2 v2 议题对齐)
- [ ] **M-10**:Phase 5 验收强度补 property-based / kill -9 / 时钟跳变(已在 §10.2 补,但实施细节待写)
- [ ] **M-11**:tombstone GC 实装(v1.0 GA 只标可 GC,v1.1 开启 cron)
- [ ] **L-01**:威胁模型 "防 vs 不防" 矩阵进一步细化为附录
- [ ] **L-02**:BIP-39 中文 wordlist v1 不开;v1.x 引入需双 wordlist 回归测试
- [ ] **L-05**:device.name 默认随机化已在 FR-AC-14 标注,UI 实装待 Phase 5

### 12.3 v2 长线议题
- [ ] **C-08 / R-10.9**:迁 AES-GCM-SIV(RFC 8452)消除 Invisible Salamanders 风险
- [ ] **C-01 v2**:迁 OPAQUE PAKE(IETF CFRG draft,截至 2026-05 未成为 RFC,L-1 修正)实现真正零知识口令认证
- [ ] **C-03 v2**:账户级 Merkle root / hash chain,防御"恶意服务端伪造合法 revision 但篡改 commit 时间序"
- [ ] iOS 客户端的 KEK 派生参数差异(若未来做 iOS,Argon2id 在低端机器可能太重)
- [ ] Realtime 在网页版的 fallback:若 WebSocket 被企业代理拦截 → 退化为 long polling(SSE)
- [ ] 与 Web 端的同步语义对齐(同一账号 Web + Desktop 同时打开是否要做"会话锁定")

---

## 13. 文档变更记录

| 日期 | 版本 | 变更 |
|---|---|---|
| 2026-05-14 | v0.1-DRAFT | 首版:目标 / 威胁模型 / 密钥层级 / 同步范围矩阵 / 41 条新 FR / 服务端 schema / 协议规格 / R-10 子分解 |
| 2026-05-16 | **v0.6-DRAFT(协议硬化第五轮,修复 v0.5 新发现 Critical)** | 基于第五轮 codex 审查 3 Critical + 13 High + 11 Medium + 4 Low + 5 协议正确性 全部落实。**致命修复**:① **C-A used_nonces 不可删 ledger**:v0.5 UNIQUE 索引漏 hard_deleted/staging/lease,GCM nonce 全局唯一不是硬不变量;v0.6 新表 used_nonces 所有写路径 first-insert,跨 encrypted_blobs/staging_blobs/shadow/rekey_swap 全局唯一;nonce_lease 加 EXCLUDE USING gist 防 lease 范围重叠;counter CHECK BETWEEN 0 AND 4294967295;② **C-B QR 完整 pub binding**:v0.5 donor 计算 fingerprint = hash(server pub) 但 HPKE 也用 server pub,server 控制 pub 即可让 fingerprint 匹配但 wrap 给攻击者;v0.6 QR 必须含完整 CBOR(account_id + target_device_id + target_device_pub raw + protocol_version),donor 用 QR 内 pub 不用 server pub 做 HPKE;本地比对 QR pub hash vs server row pub hash → 不一致 E3031;confirmation_proof 改 donor Ed25519 签名 transcript;③ **C-C dev-plan §1~§3 真正 v0.6-only 重写**:头部加 v0.6 实施必读警示明示所有废弃旧片段(device_joined 自动 grant / crypto_derive_device_keypair / sealed_box / Argon2id recovery / pullSince(entityType) / Keychain-only nonce / encrypted_dek);Realtime 示例改 device_pending 通知 UI 不自动 grant。**High 13**:H-1 注册 wrap_v1 时机 + H-2 nonce_lease ENABLE RLS + H-3 DDL ALTER FK 真顺序 + H-4 SAS 6 词 11-bit 标准化 + H-5 HPKE info vs aad + H-6 counter CHECK 上界 + H-7 Re-key 紧急 quarantine + H-8 TECH §2.4 HMAC 残留删 + H-9 /auth/me 文案 + H-10 dev-plan sealed_box → HPKE + H-11 mutation_dedup RLS active + H-12 Realtime RLS device active + H-13 advisory_lock UUID 高/低 64-bit。**Medium 11**:CBOR 真实向量 / 207 commit_seq string / 同步矩阵 accounts 字段 / Web IndexedDB lifecycle / sync_devices SELECT active-only + pending 只读自己 / verifyAccountCommitSeqMonotone string / 版本协商文档版本 v0.6 / etc。**Low 4**:device_seed zeroize / new_payload_hash / 父 PRD 标题 / 历史 round 标识统一。**协议正确性 5**:account_commit_seq 不防 equivocation 显式 UI/风险表 / Re-key swap SQL 不变量 / 207 DAG 失败处理 / tombstone GC v1 不物理 / 离线 squash undo log。**新错误码** E3031-E3033。**Open(v0.6.1/v2)**:CBOR 真实 fixture / device_sync_progress ACK RPC / Phase 4.8 TLA+ 实际编写 / dev-plan §3 完整 v0.6 任务清单 / OPAQUE / helmet seed / AES-GCM-SIV / Merkle root |
| 2026-05-16 | **v0.5-DRAFT(协议硬化第四轮,修复 v0.4 新发现 Critical)** | 基于第四轮 codex 审查 6 Critical + 12 High 全部落实。**致命修复**:① **C-A donor 自动 grant → 用户可验证设备配对**:v0.4 Realtime broadcast 触发 donor 自动 HPKE_seal 给 server 提供的 new_device_pub,恶意 service_role 可 INSERT fake pending device + 攻击者公钥让真实 donor 把 DEK 包给攻击者;v0.5 改 §3.4.1 为用户可验证 6 词 fingerprint / QR 配对(Signal Safety Number 风格),Edge Function /sync/devices/grant_dek_wrap 强制 user_confirmed=true + confirmation_proof,Realtime 仅通知 UI 不触发自动 grant;② **C-B nonce 服务端硬约束**:envelope 内 encryption_device_id / counter 拆为 server columns,UNIQUE(account_id, key_id, encryption_device_id, counter);server 校验 envelope.enc_dev_id 与 JWT.device_id 对应一致;违反 → E3027 nonce_reuse_detected;③ **C-C 三端统一 server nonce lease**:Keychain ThisDeviceOnly 锚点只覆盖 macOS;Web IndexedDB 可被浏览器 profile 恢复旧快照;v0.5 改三端统一 server-side nonce lease,新表 nonce_lease + RPC fn_grant_nonce_lease;macOS 可选 Keychain 锚点补强;④ **C-D Re-key 阻断式新助记词 + 更新 recovery_signing_pub**:v0.4 Re-key 让旧 24 词助记词只能恢复 DEK_v1,recovery_seed 也基于 DEK_current 失效;v0.5 强制 Re-key 流程生成新 24 词 + 新 recovery_signing_keypair_v_n+1,UI 阻断式回填 6 词验证,未确认禁止 swap → E3028;⑤ **C-E Recovery message 唯一 schema**:删 §7.1.2.3 字段级 new_*_hash schema(让 server 可篡改未列字段),唯一 schema 改为 {1:msg_v, 2:challenge_id, 3:account_id, 4:payload_canonical_hash, 5:ts};⑥ **C-F lazy encrypt 明示 one-shot push**:删除"server 先返 proposed_revision 再加密" 两阶段暗示,改 client 本地 base+1 → 即时加密 → 一次 push;server 验 base_revision == current。**High 12 条**:H-1 pending→active 唯一事务路径;H-2 HPKE 替代 sealed_box;H-3 entity_state schema 加 last_blob_hash + last_commit_seq + last_key_id;H-4 PullResponse 加 currentAccountCommitSeq;H-5 Realtime 触发 pull 改全局 cursor;H-6 conflict_shadow + staging SELECT 加 active device;H-7 注册 account_id = auth.users.id;H-8 DDL 部署顺序明示;H-9 commit_seq SECURITY DEFINER RPC fn_alloc_commit_seq 可部署 SQL;H-11 TypeScript BIGINT 统一 string;H-12 TECH §2.4 旧 rollback / sealed_box 清理。**Medium/Low**:OPAQUE 引用统一 draft;同步范围矩阵 accounts 字段对齐;父 PRD §5.9 指针 v0.5。**R-10 新增** R-10.22~R-10.25。**新错误码** E3026-E3030。**Phase 0 工日** 16-22 → **18-24**;**Phase 5** 5-6 周 → **6-7 周**。**Open(v2)**:OPAQUE PAKE;helmet seed(与 per-device wrap 权衡);AES-GCM-SIV;Merkle root 替代 account_commit_seq 单调监测(不防 equivocation 显式声明) |
| 2026-05-16 | **v0.4-DRAFT(协议硬化第三轮,修复 v0.3 致命缺陷)** | 基于第三轮 codex 审查 Critical + High 全部落实。**致命修复**:① **C-A device key 由 KEK 派生 → 本地 CSPRNG**:v0.3 用 `HKDF-Expand(KEK, "xai.devicekey.v1")` 让旧设备能算新设备 device_priv,per-device wrap 整套安全前提塌;v0.4 改 `device_priv = csprng(32)` 仅存 Keychain;② **C-B RLS device_dek_wraps SELECT 限自身 active device**;encrypted_blobs SELECT 加 status='active' 校验;pending device 不能读 wrap/blobs;③ **C-C nonce 双重锚点**:Keychain ThisDeviceOnly high_water + SQLCipher next_counter 双写;Time Machine 回滚 SQLite 后 Keychain 未变 → 加密拒绝 + E3021;④ **C-D encrypted_blobs 客户端只读**:删除 RLS write policy,所有写入走 /sync/push Edge Function service_role;⑤ **C-E Recovery 签名绑定完整 payload**:message 含 `SHA256(CBOR_canonical(new_payload))` 而非字段级 hash,防 server 篡改未列入 hash 字段;⑥ **C-F 助记词恢复修正**:auth_password' 必含 secret_key(与注册一致);encryption_device_id 由 server 分配 client 不传;⑦ **C-G outbox lazy encrypt**:outbox 改存 plaintext + 元数据(SQLCipher 已加密本表),flush 时即时加密用正确 proposed_revision,避免 squash 让 AAD 与 revision 不一致 → tag fail;⑧ **C-H conflict shadow 完整 AAD metadata**:加 key_id/encryption_device_id/counter/revision/deleted_flag/schema_version/blob_size/mutation_id/loser_commit_seq,30 天后 loser 可重建 AAD 解密。**High 11 条**:H-2 §3.2 auth_password 表必含 secret_key;H-3 X25519 wrap 改 HPKE Base mode (RFC 9180);H-4 commit_seq BIGSERIAL + SECURITY DEFINER RPC fn_alloc_commit_seq;H-5 Re-key staging 不改 entity revision 只换 key + rekey_session_order;H-6 revision rollback 改 `(entity_id, revision, commit_seq, blob_hash)` 区分幂等 vs re-encrypt vs 真 rollback;H-7 PULL 改账户级全局 cursor (PullRecord 含 entity_type);H-8 BIGINT 改 string (JSON number 精度不够);H-9 crypto_encrypt_for 不接 encryption_device_id (Rust 从 device state 读);H-10 device_dek_wraps FK to sync_devices + grant RPC SELECT FOR UPDATE;H-11 REST 协议示例清 v0.2 残留 (server 分配 revision / batch atomic)。**Medium/Low**:CBOR 测试向量改真实向量;OPAQUE 引用统一 draft;Realtime topic 加 device claim;错误码补 E3021-E3025;同步范围矩阵 accounts 字段对齐;父 PRD §5.9 标题升 v0.3/v0.4。**R-10 子风险扩展**:R-10.18 强化为高 + Keychain 锚点;R-10.19 device key 派生缺陷(已修);R-10.20 shadow AAD rebuild;R-10.21 outbox plaintext 残余风险。**协议正确性**:Phase 4.8 TLA+ 模型升级为前置阻断,最低必含 6 场景。**Open(v2)**:OPAQUE PAKE;helmet seed;AES-GCM-SIV;Merkle root(account_commit_seq 不是密码学完整性,只防粗暴回滚)|
| 2026-05-16 | **v0.3-DRAFT(协议硬化第二轮)** | 基于第二轮 codex 审查(REVIEW-2026-05-15.md v0.3 round)Critical + High 全部落实。**核心改动**:<br>**密钥协议**:① Recovery proof 改 Ed25519 签名(C-A,原 Argon2id+HMAC 双校验协议矛盾废弃);② Per-device DEK wrap(C-D):DEK 不再用 KEK 直接包装,改用每 active device 的 X25519 device_pub 包装存 `device_dek_wraps` 表;撤销 device 删该行 + Re-key,真正排除旧设备;③ auth_password 派生加 secret_key(H-L)实现真正 dual-factor 登录;④ GCM nonce = encryption_device_id (8B server 分配) ‖ counter (4B + checkpoint 预写)(C-C);⑤ proposed_revision = base + 1 由 client 提交 server 不重写(C-E)<br>**AAD canonical**:⑥ AAD 改 deterministic CBOR (RFC 8949 §4.2,C-G);3 条测试向量进 Phase 4.8 准入门;AAD 不再存 envelope 内<br>**Schema**:⑦ 新表 `device_dek_wraps`(C-D)+ `nonce_counter` (C-C);accounts 移除 `encrypted_dek` + `recovery_proof_hash`,加 `recovery_signing_pub` (32B Ed25519) + `current_account_commit_seq` (H-A);sync_devices 加 `device_pub` + `encryption_device_id` + `status`;account_keyring 加 `can_retire` (C-F);staging_blobs 加 revision/commit_seq/source_mutation_id 等 (H-E)<br>**RLS**:⑧ accounts client UPDATE 撤销(C-B);所有 RLS WITH CHECK 加 originator_device_id = JWT.device_id(H-C);SELECT 也校验 device 未撤销(H-B);staging_blobs 改只读(H-D);device_dek_wraps 写由 Edge Function service_role<br>**协议**:⑨ PUSH 改 per-record + 207 partial response(H-F);batch atomic 废弃;⑩ PULL cursor 改账户级全局 commit_seq(H-J);⑪ Realtime 必须 `config:{private:true}` (H-I);⑫ mutation_dedup GC 7d → 90d (H-H);⑬ FR-SY-71 conflict shadow 升 P0 (H-G);⑭ 离线 squash 规则 FR-SY-78 (H-N)<br>**本地**:⑮ SQLCipher 改 AES-256-CBC + HMAC-SHA512 (SQLCipher 4 默认,H-K);⑯ Web IndexedDB 字段级 AES-GCM via WebCrypto<br>**其他**:⑰ 同步默认显式确认 (M-5);⑱ age 导出 key 含 secret_key (M-8);⑲ Sentry device_id 改 hash (M-2);⑳ sync.v1 → sync.protocol=1 (L-4);㉑ R-10 子风险扩到 R-10.18;㉒ FR 计数对齐到 ~81 条<br>**协议正确性**:Phase 4.8 TLA+ 模型升级为阻断准入项,必含设备撤销 / 新 device 加入 / Re-key 并发 / 离线重放 / 全量恢复 / 重复 mutation 6 场景<br>**Open**:OPAQUE 引用改 draft (L-1);Helmet seed (helmet-style root) v2 议题 (C-F 限制说明);AES-GCM-SIV v2 (R-10.9) |
| 2026-05-15 | **v0.2-DRAFT(协议硬化第一轮)** | 基于第一轮审查 `REVIEW-2026-05-15.md` Critical + High 全面落实。主要变更:<br>**密钥**:① master_password 与 auth_password 完全分离(C-01);② 24 词 BIP-39 编码 256-bit DEK(C-05);③ 客户端 Secret Key 抗字典攻击(FR-SY-73 / H-14);④ Recovery proof 阻断恶意 PATCH(C-04 / FR-SY-69)<br>**加密原语**:① AAD 必须绑定 entity 语境(C-02 / FR-SY-67);② Deterministic nonce(H-01);③ Envelope 加 `key_id`(C-07);④ Re-key 两阶段 + keyring(FR-SY-13 升 P0);⑤ DEK 常驻 Rust KeyVault,JS 只拿 opaque handle(C-06 / FR-SY-75)<br>**协议**:① Conditional write + base_revision(H-05);② Mutation_id 全局 idempotency(H-07 / FR-SY-72);③ commit_seq BIGSERIAL 替代 timestamp 作权威排序与 cursor(H-02/H-04);④ delete 不再有特殊优先级,按 commit_seq 决胜(H-03);⑤ Outbox 按依赖 DAG 合并(H-06);⑥ 冲突 shadow 30 天保留(FR-SY-71);⑦ Realtime Private Channels + Authorization 强制(H-09)<br>**本地存储**:① SQLCipher 加密本地 SQLite(C-09 / FR-SY-74);② 导出文件默认 age 加密(C-10 / FR-SY-70);③ outbox 与 entity 写入同事务原子性(M-12)<br>**多设备**:① 设备撤销强制 Re-key(H-11 / FR-AC-14 升 P0);② RLS 加 device 校验(H-08);③ JWT embed device_id claim<br>**Schema**:① 新增 `account_keyring` / `mutation_dedup` / `encrypted_blobs_conflict_shadow` / `staging_blobs` / `device_sync_progress` 5 张表;② accounts 加 `secret_key_check / dek_check / recovery_proof_hash / current_dek_key_id`;③ encrypted_blobs 加 `revision / key_id / commit_seq / mutation_id`;④ `entity_type` 改 ENUM(M-09)<br>**威胁模型**:新增 T1.1 / T3.5 / T10~T13;补"防 vs 不防"边界(L-01);R-10 子风险扩展到 R-10.13<br>**验收**:新增 §10.x 协议硬化里程碑准入门;Phase 5 验收加零知识 PoC / SQLite dump PoC / 导出文件加密验证<br>**Open**:Invisible Salamanders(R-10.9)v1 不防护,v2 评估 AES-GCM-SIV;OPAQUE 为 C-01 的 v2 升级路径 |

— END —
