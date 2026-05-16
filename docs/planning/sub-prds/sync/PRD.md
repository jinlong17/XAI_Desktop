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
| 最后更新 | 2026-05-15 |
| 状态 | v0.2-DRAFT(协议硬化) |
| 关联审查 | `docs/planning/sub-prds/sync/REVIEW-2026-05-15.md` Critical + High 已落实 |

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
v0.2 修订:新增 T1.1 / T3.5 / T10~T13;明确"防 vs 不防"边界(对应审查报告 L-01)。

| 攻击者 | 能力 | 后果上限(对我们想保护的资产) | 防护层 |
|---|---|---|---|
| **T1. 服务端被攻破 / 拖库(被动)** | 拿到 Supabase Postgres dump + service_role key,但只读 | 最多拿到 encrypted blob + metadata(updated_at / device_id / entity_type)。拿不到任何明文用户数据。**注意**:可对弱口令账号离线 Argon2id 字典攻击 → 由 Secret Key(FR-SY-73)抬高成本至不可行,详见 §3.2 | FR-SY-56~58 零知识承诺 + RLS;FR-SY-73 Secret Key |
| **T1.1. 恶意服务端 / 拿到 service_role 写权限(主动)** | 可 INSERT / UPDATE / DELETE encrypted_blobs / accounts | **可调包密文**(无 AAD 时)/ **可静默回滚密文**(无 revision 时)/ **可替换 encrypted_dek 让用户数据不可读**(无 recovery proof 时)。v0.2 通过 FR-SY-67(AAD)/ FR-SY-68(revision)/ FR-SY-69(recovery proof)阻断 | FR-SY-67/68/69 |
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

### 3.1 层级图(v0.2 重绘,扩展 TECHNICAL_REQUIREMENTS §2.1.1)

```
[ 用户主密码 master_password (永不出内存 / 永不写盘 / 永不直接发 server) ]
[ Secret Key  secret_key   (128-bit,客户端首次注册生成,用户必须保存) ]
              │
              ├────────────────────────────┐
              │                            │
              │ Argon2id(master_password,  │ HKDF(master_password,
              │   salt=kek_salt,           │   salt=email||"xai.auth.v1",
              │   secret=secret_key,       │   info="xai.auth.v1") → 16B
              │   t=3, m=64MiB, p=4) → 32B │ 再走 Argon2id(t=1, m=16MiB, p=1)
              ▼                            ▼
[ KEK 32 bytes ]                    [ auth_password 32 bytes ]
              │                            │
              │ 缓存 macOS Keychain        │ 发送给 Supabase Auth 作为登录密码
              │ WhenUnlockedThisDevOnly    │ (Supabase Auth 内部再 bcrypt)
              │ key="xai.kek.<account_id>" │
              │                            │
              │  AES-256-GCM 解密(AAD)    │
              ▼                            │
[ DEK 32 bytes (key_id) ]          ←── server.accounts.encrypted_dek + keyring
              │
              │  AES-256-GCM 加密
              │  nonce = device_id||counter (FR-SY-07 v0.2 deterministic)
              │  AAD   = account_id||entity_type||entity_id||revision
              │          ||key_id||deleted_flag||schema_version (FR-SY-67)
              ▼
[ encrypted_blob ]   ──→  上传 server.encrypted_blobs.blob 字段

[ 助记词 24 词 BIP-39 (256-bit + 8-bit checksum) ]
        = DEK 的完整无损备份(首次注册一次性展示,用户必须确认)
        ↕  独立另存
[ Secret Key 备份卡片(打印 + PDF) ]
        = Argon2 抗字典攻击的高熵 secret
        - 用户必须**同时持有 master_password + secret_key** 才能登录新设备
        - 服务端不存 secret_key,但存 secret_key_check = HMAC(secret_key, "xai.sk.check.v1")
          (低熵-resistant hash;不可用于离线字典攻击 secret_key,因 secret_key 自身 128-bit)

[ 本地 SQLite ]
        = SQLCipher 加密;db_key = HKDF(KEK, "xai.sqlite.v1") → 32B (FR-SY-74)
        - SQLite 文件即使被物理拿走,无 KEK 不可读
```

关键不变式(v0.2):
1. **master_password 永不离开本机**。仅在 PasswordPrompt UI 输入瞬间存在于 zeroized 字节数组。派生 KEK 与 auth_password 后立刻擦除。**Supabase 收到的 auth_password 与 KEK 在密码学上完全独立**——server 即使持有 dump 也无法从 auth_password 反推 master_password 跑 Argon2id(因为 auth_password 已经过 HKDF + 弱化 Argon2 派生,熵不可逆)。
2. **secret_key 永不发服务端**。仅 secret_key_check 上传。注册时由客户端 CSPRNG 生成 128-bit,**必须经用户回填验证**(同助记词流程)才能完成注册。
3. **KEK 永不出 Keychain**。从 Keychain 取出后立即用,用完立即 zeroize。重启时重新派生 / 重新取出。
4. **DEK 来自服务端(加密形式)**,本地解密后**只在 Rust 侧 KeyVault**。JS / plugin **永远不持有 raw DEK**,只拿 opaque `key_handle`(FR-SY-75)。
5. **服务端永不见 KEK / DEK / master_password / secret_key 明文**。看到的只有 encrypted_dek、encrypted_blobs.blob、auth_password(已派生,不等于 master_password)、secret_key_check(单向 hash)。
6. **AAD 必须绑定语境**(C-02):每次加密都把 entity 元数据塞进 AEAD 的 AAD,server 调包密文 = GCM tag fail。详见 FR-SY-67。
7. **每实体单调 revision**(C-03):AAD 含 revision,客户端拒收 `revision < max_seen`,server 无法静默回滚。

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

#### auth_password 派生(弱参数,仅供 Supabase Auth 登录用)

| 参数 | 值 | 论证 |
|---|---|---|
| Step 1 | HKDF-SHA256(master_password, salt=email\|\|"xai.auth.v1", info="xai.auth.v1") → 16B intermediate | 域分离;email 作 salt 避免跨账号 rainbow table |
| Step 2 | Argon2id(intermediate, salt=email\|\|"xai.auth.v1", t=1, m=16MiB, p=1) → 32B `auth_password` | 弱参数(故意),性能开销低,客户端登录每次都跑 |
| 用途 | Base64(auth_password) 作为 Supabase Auth 的 password 字段 | Supabase Auth 内部再 bcrypt 存储 |
| 安全声明 | 即使 server 拿到 auth_password,**也无法反推 master_password**(HKDF + Argon2 不可逆);更无法跑 Argon2id 解 KEK(KEK 需要 master_password + secret_key + kek_salt 三者) | C-01 修复 |

**v2 升级路径**:迁 [OPAQUE](https://datatracker.ietf.org/doc/draft-irtf-cfrg-opaque/)(RFC 9807) 做真正的零知识口令认证。在 §11 R-10 子风险表里追踪。

### 3.3 首次注册流程(FR-AC-01 v0.2 扩展)

```
[Client]                                                [Server]
   │
   │ 1. 用户输入 email + master_password
   │
   │ 2. 客户端生成:
   │    - kek_salt        = csprng(16)
   │    - secret_key      = csprng(16)              ← 128-bit,用户必须保存(H-14)
   │    - DEK             = csprng(32)
   │    - account_id      = uuidv7()
   │    - mnemonic        = BIP39_24w_encode(DEK)   ← 24 词(C-05),256-bit + 8-bit checksum
   │
   │ 3. KEK            = Argon2id(master_password, kek_salt, secret=secret_key, t=3,m=64MiB,p=4)
   │ 4. auth_password  = Argon2id(HKDF(master_password, email||"xai.auth.v1"), t=1,m=16MiB,p=1)
   │ 5. encrypted_dek  = AES256GCM_encrypt(
   │                       plaintext=DEK,
   │                       key=KEK,
   │                       nonce=device_id||counter_init,
   │                       AAD=account_id||"dek_wrap"||key_id=1||kek_kdf_version=1)
   │    形式: { v=1, kdf_v=1, key_id=1, nonce: 12B, ciphertext: 32B, tag: 16B }
   │ 6. dek_check        = HMAC-SHA256(DEK, "xai.dek.check.v1")             ← M-13 本地可验
   │ 7. secret_key_check = HMAC-SHA256(secret_key, "xai.sk.check.v1")       ← 防 secret_key 写错
   │ 8. recovery_proof_secret = HKDF(DEK, "xai.recovery.proof.v1") → 32B    ← C-04
   │    recovery_proof_hash   = Argon2id(recovery_proof_secret, salt=account_id, t=3,m=64MiB,p=1)
   │
   │ 9. POST /auth/signup
   │   ──────────────────────────────────────────────────→
   │   { account_id, email, auth_password,
   │     kek_salt, kek_kdf_version=1,
   │     encrypted_dek, current_key_id=1,
   │     dek_check, secret_key_check, recovery_proof_hash,
   │     mnemonic_acknowledged_at_client=false }
   │                                                          (Supabase Auth: 标准 email+pwd)
   │                                                          (accounts 表插一行,所有上述字段持久化)
   │   ←──────────────────────────────────────────────────
   │   { access_token, refresh_token }
   │
   │ 10. UI 强制流程(顺序):
   │     a. 展示 24 词助记词;用户必须打字回填某 6 个词 ✅
   │     b. 展示 secret_key 备份卡片(QR + 文本 + 建议打印);用户必须回填某 4 位 ✅
   │     c. 客户端本地用 secret_key_check 验证用户回填正确
   │     d. 标记 mnemonic_acknowledged=true + secret_key_acknowledged=true(上传)
   │ 11. refresh_token 存 macOS Keychain
   │ 12. KEK 缓存到 macOS Keychain(WhenUnlockedThisDeviceOnly)
   │ 13. SQLite db_key = HKDF(KEK, "xai.sqlite.v1");打开 SQLCipher 数据库(FR-SY-74)
   │ 14. 全部内存中的 DEK / master_password / KEK / secret_key 临时副本 zeroize
   │
```

注意:Supabase Auth 收到的 `auth_password` 与 KEK 派生在密码学上**完全独立**——即使 Supabase 拿到所有 server 数据库 dump,也无法从 auth_password / kek_salt 反推 KEK(缺 master_password 与 secret_key 两个客户端独占要素)。

### 3.4 新设备登录流程(FR-AC-02 v0.2 扩展)

```
[Client B]                                              [Server]
   │
   │ 1. 输入 email + master_password + secret_key (扫码 / 手输)
   │ 2. 验证 secret_key:HMAC(secret_key, "xai.sk.check.v1") 与服务端拉到的 secret_key_check 对比
   │    (不通过 = secret_key 错,提示用户重输)
   │ 3. auth_password = Argon2id(HKDF(master_password, email||"xai.auth.v1"), t=1,m=16MiB,p=1)
   │ 4. POST /auth/login (email, auth_password) → access_token, refresh_token
   │ 5. GET /auth/me  ←  { kek_salt, kek_kdf_version,
   │                       encrypted_dek, current_key_id, keyring,
   │                       dek_check, secret_key_check, recovery_proof_hash }
   │ 6. KEK = Argon2id(master_password, kek_salt, secret=secret_key, t=3,m=64MiB,p=4)
   │ 7. DEK = AES256GCM_decrypt(encrypted_dek, key=KEK,
   │             nonce=envelope.nonce,
   │             AAD=account_id||"dek_wrap"||key_id||kek_kdf_version)
   │ 8. 若 GCM auth-tag 校验失败 → 密码错(给"密码错"提示,而非"数据损坏")
   │ 9. 校验 HMAC(DEK, "xai.dek.check.v1") == dek_check
   │    (失败 = 服务端可能被篡改,surface "可疑活动" 告警,不允许继续)
   │ 10. 缓存 refresh_token + KEK 到 Keychain
   │ 11. 注册 device_id(uuidv7),POST /sync/devices/register
   │ 12. SQLite db_key = HKDF(KEK, "xai.sqlite.v1");打开 SQLCipher 数据库
   │ 13. 触发首次全量 pull(增量同步,since=0)
```

**关键改动**:登录必须输入 master_password + secret_key 二者(类似 1Password Emergency Kit)。若用户只记得密码不记得 secret_key → 无法登录新设备,但已登录设备仍可用(此时引导导出 secret_key)。

### 3.5 主密码 / Secret Key 重置(不可恢复路径,FR-AC-03 v0.2 限制)

**关键决策**:重置 = 失去旧数据,除非走助记词恢复。

- 用户走"忘记密码 / 忘记 secret key" → 客户端要求**输入助记词**(FR-AC-10 流程)。流程见 §3.6。
- **不允许**仅凭邮箱 reset 重新设置密码(原 v0.1 设计被 C-04 否决,因为该路径让攻击者接管邮箱后即可永久毁掉用户数据)。
- 若用户连助记词都丢:UI 强提示"全部数据将丢失",二次确认后允许"清空云端 + 用新密码 + 新 secret_key + 新 DEK 重新开始"(等效首次注册)。

**Recovery 防护(C-04 修复)**:
- `PATCH /auth/me` 改 encrypted_dek / kek_salt / secret_key_check 时,**必须**提交 recovery proof:
  ```
  client → GET /auth/recovery_challenge → server 返回 challenge (32B random, TTL 5min)
  client 用 (DEK from 助记词) 派生 recovery_proof_secret = HKDF(DEK, "xai.recovery.proof.v1")
  client 计算 proof = HMAC(recovery_proof_secret, challenge||account_id||new_encrypted_dek_hash)
  client PATCH /auth/me { ..., proof, challenge_id }
  server 校验 Argon2id(recovery_proof_secret, salt=account_id) == recovery_proof_hash
       AND HMAC(recovery_proof_secret, challenge||account_id||hash) == proof
  ```
- 攻击者即使接管 Supabase session 也无法 PATCH(没有 DEK → 无法派生 recovery_proof_secret)。
- 详见 FR-SY-69。

### 3.6 助记词恢复流程(FR-AC-10 v0.2 扩展)

```
[Client]
  │ 1. 用户输入 24 词助记词
  │ 2. DEK = BIP39_24w_decode(words)   ← 256-bit 完整无损恢复
  │ 3. 让用户设新 master_password
  │ 4. 让用户生成或输入新 secret_key(可选:复用旧 secret_key 若用户还记得)
  │ 5. kek_salt' = csprng(16)
  │ 6. KEK' = Argon2id(new_master_password, kek_salt', secret=new_secret_key, t=3,m=64MiB,p=4)
  │ 7. auth_password' = Argon2id(HKDF(new_master_password, email||"xai.auth.v1"), t=1,m=16MiB,p=1)
  │ 8. encrypted_dek' = AES256GCM(DEK, key=KEK', nonce=csprng(12), AAD=account_id||"dek_wrap"||...)
  │ 9. recovery proof:GET /auth/recovery_challenge → 计算 proof
  │ 10. PATCH /auth/me with recovery proof
  │     { kek_salt', encrypted_dek', auth_password',
  │       secret_key_check', kek_kdf_version=1,
  │       proof, challenge_id }
  │ 11. server 校验 proof 通过 → 写入 → 返回新 access_token / refresh_token
  │ 12. 后续同新设备登录流程
```

如此用户主密码 + secret_key 都可换,DEK 不换,历史数据可继续读。
**前提**:用户必须持有助记词。助记词丢 = 数据丢(零知识承诺的代价,在 onboarding 三屏强提示)。

<!-- §3.2 / §3.3 / §3.4 / §3.5 / §3.6 已在上方 v0.2 重绘段落中给出 -->

### 3.7 本地存储加密(FR-SY-74 v0.2 新增,对应 C-09)

主 PRD `TECHNICAL_REQUIREMENTS §2.1.3` 原"todos.title 本地明文"在 v0.2 被废弃。**本地 SQLite 必须由 SQLCipher 加密**:

- 数据库密钥 `db_key = HKDF-SHA256(KEK, salt=account_id, info="xai.sqlite.v1") → 32B`
- SQLCipher 配置:`PRAGMA cipher = 'aes-256-gcm'; PRAGMA kdf_iter = 256000;`
- db_key 不写盘、不进 Keychain;每次应用启动 / Keychain 解锁后由 KEK 实时派生
- 数据库文件位置:`~/Library/Application Support/XAI_Desktop/xai.db`(沙箱版走 container 路径)
- **降级路径**:用户卸载或迁移数据,通过"导出 → 加密 zip"路径(FR-SY-50),不允许导出明文 SQLite
- onboarding 强提示用户启用 FileVault(双重保护)
- 演练:Phase 5 验收必须包含"拿到 SQLite 文件副本 → 无 master_password 不可读"的 PoC(§10.2)

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
- **文件指纹改为 keyed hash(v0.2 修订,对应 H-10)**:`fingerprint = HMAC-SHA256(DEK, file_content_sha256)`,**每账号独立命名空间**,跨账号无法关联;原 SHA-256 明文上传方案废弃

### 4.3 本地 SQLite 加密(v0.2 新增,对应 C-09)

所有本地缓存表均在 SQLCipher 加密数据库内,见 §3.7。无明文 SQLite。

---

## 5. 功能需求

> 主 PRD §5.9 已有 11 条(FR-AC-01~05、FR-SY-01~06)。本节**新增** FR-AC-06 起 + FR-SY-07 起,共 **41 条新 FR**。
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
| FR-AC-14 | P0 | **多设备列表 + 远程登出 + 强制 Re-key(v0.2 升 P0,H-11)** | 设置页显示已登录设备(device_id / 名称 / last_active_at);可点"撤销该设备" → 服务端 revoke refresh_token + `sync_devices.revoked_at = now()` + **触发用户走 Re-key 流程**(FR-SY-13):生成 DEK_v2 重加密所有 blob;撤销前 UI 强提示"撤销后必须 Re-key,否则旧设备仍能解密历史数据";device 名默认随机化("Mac-XXXX"),不用 hostname | T11 |

### 5.2 密钥与加密(FR-SY-07~14 v0.2 修订 + FR-SY-67~75 新增)

| ID | 优先级 | 需求 | 验收标准 | Threat |
|---|---|---|---|---|
| FR-SY-07 | P0 | **加密原语 v0.2**:AES-256-GCM, **deterministic nonce**, 16B auth tag | nonce = `device_id (4B) ‖ counter (8B)`,counter 来自客户端持久化单调递增计数器(crash-safe,落 SQLCipher `sync_state.next_nonce_counter`);**禁止 nonce 复用**;单测断言 1M record 全 unique;单 DEK 生命周期 message 上限 2^48 触发 Re-key 警告 | T1/T2(H-01) |
| FR-SY-08 | P0 | **加密 envelope 格式 v0.2** | `{ v: u8, kdf_v: u8, key_id: u32, nonce: 12B, aad_len: u16, aad: var, ciphertext: var, tag: 16B }`,小端紧凑二进制;v=1, kdf_v=1, key_id ≥ 1 | T1(C-02/C-07) |
| FR-SY-09 | P0 | 解密失败 = 不影响其他 record | 单条 GCM tag 失败:标记该 entity 为 corrupted、记入 sync_audit_log、surface "可疑活动" 告警(可能是 T1.1 调包)、继续处理其他 record;不抛全局 panic | T1.1 |
| FR-SY-10 | P0 | **内存中 KEK / DEK 显式 zeroize v0.2** | 使用 `zeroize` crate;**用完立即 zeroize**(不依赖 Drop);DEK 仅在 Rust 侧 KeyVault 持有,不允许进 `serde::Serialize` / 不允许跨 JS boundary | T3'/T6/L-06 |
| FR-SY-11 | P0 | 加密层版本字段 | account row `kek_kdf_version` + blob `v` + `key_id` 三重独立;v2 升级时双写过渡 | 演进 |
| FR-SY-12 | P0 | 加密 / 解密 benchmark 预算 | 加密单条 1KB record < 0.5ms(P95)/ 解密 < 0.3ms;100 record batch encrypt < 50ms;Web (WASM) 单独基线表 | 性能 |
| FR-SY-13 | P0 | **Re-key 流程 v0.2(强制升级至 P0)** | 用户主动 / 设备撤销触发(FR-AC-14)。两阶段:(a) keyring 加新 key_id;(b) 客户端按 batch 用 DEK_new 重加密所有 blob → 写入 staging_blobs 表 → 全部成功后 server 原子 swap encrypted_dek + current_key_id → (c) 旧 key_id 在 keyring 标 retired;Re-key 期间客户端按 envelope.key_id 双读;中断恢复测试通过 | 应急 / T11(C-07) |
| FR-SY-14 | P0 | 加密原语 fuzz 测试 | 至少 24h fuzz(`cargo-fuzz`);envelope parse / decrypt / AAD 解析在恶意输入下不 panic | T1 |
| **FR-SY-67** | P0 | **AEAD AAD 必须绑定语境(v0.2 新)** | 每次加密 AAD = `account_id ‖ entity_type ‖ entity_id ‖ revision ‖ key_id ‖ deleted_flag ‖ schema_version`(blob 加密);AAD = `account_id ‖ "dek_wrap" ‖ key_id ‖ kek_kdf_version`(encrypted_dek 包装);解密失败 = 拒收 + audit log;集成测试:服务端把 blob A 拷到 blob B 的位置 → 客户端解密失败 | T1.1(C-02) |
| **FR-SY-68** | P0 | **单调 revision + rollback 拒收(v0.2 新)** | 每实体维护单调 `revision BIGINT`,客户端本地表 `entity_state(entity_id, max_seen_revision)`;pull 时 `incoming.revision <= local.max_seen` → 拒收 + surface "服务器试图回滚旧版本" 告警;revision 写入 AAD(FR-SY-67) | T1.1(C-03) |
| **FR-SY-69** | P0 | **Recovery proof(v0.2 新)** | 注册时存 `recovery_proof_hash = Argon2id(HKDF(DEK, "xai.recovery.proof.v1"), salt=account_id, t=3,m=64MiB,p=1)` 在 server;PATCH `/auth/me` 任何字段必须先 `GET /auth/recovery_challenge` 拿 32B random challenge,提交 `proof = HMAC(recovery_proof_secret, challenge ‖ account_id ‖ hash(new_payload))`;server 校验通过才允许 PATCH | T1.1(C-04) |
| **FR-SY-70** | P0 | **导出文件默认加密(v0.2 新,FR-SY-50 配套)** | `xai-export-<date>.json.age` 用 [age](https://age-encryption.org/) 加密;key 由用户重新输入主密码派生(`HKDF(master_password, salt="xai.export.v1", info=date)`);UI 默认加密导出,要选明文导出需二次确认 + 红色警告"明文导出失去 E2E 保护";Markdown 子集同样加密 | T13(C-10) |
| **FR-SY-71** | P1 | **冲突 shadow(v0.2 新,H-05 配套)** | server 对每条被 `conditional write` 覆盖的 loser blob 在 `encrypted_blobs_conflict_shadow` 保留 30 天;Console 设置页"同步详情" 展示并支持"恢复 loser" 操作;FR-SY-26 配套 | T9(H-05) |
| **FR-SY-72** | P0 | **Mutation idempotency(v0.2 新,H-07)** | 每 mutation 带 `mutation_id UUIDv7`(client 生成,持久化在 outbox);server `encrypted_blobs` + `mutation_dedup` 表按 `(account_id, mutation_id)` UNIQUE;重复 mutation_id 返回上次 result(true idempotency),不产生新 revision | 网络抖动 / 重试 |
| **FR-SY-73** | P0 | **Secret Key 抗字典攻击(v0.2 新,H-14)** | 客户端首次注册生成 128-bit secret_key;Argon2id KEK 派生时作 `secret=` 参数(RFC 9106 §3.1);server 只存 `secret_key_check = HMAC(secret_key, "xai.sk.check.v1")`;UI 强提示打印 / PDF 备份 Emergency Kit;登录新设备必须输入(扫码 / 手输);丢 secret_key 走助记词恢复 | T1(C-01 配套) |
| **FR-SY-74** | P0 | **本地 SQLite SQLCipher 加密(v0.2 新,C-09)** | `db_key = HKDF(KEK, "xai.sqlite.v1") → 32B`;`PRAGMA cipher = 'aes-256-gcm'`;db_key 不写盘;Phase 5 验收:disk image dump → SQLite 文件 → 无 master_password 不可读 | T3/T3.5/T13 |
| **FR-SY-75** | P0 | **DEK 常驻 Rust KeyVault(v0.2 新,C-06)** | DEK 永不出 Rust 进程内的 KeyVault;JS 只拿 opaque `key_handle: u32`;Tauri command 改为 `crypto_encrypt_for(entity_type, entity_id, revision, plaintext) -> envelope`(server 端自动查 KeyVault + 组 AAD);Tauri capability allowlist:`crypto_*` 命令只允许 plugin-account / core-data 调,其他 plugin / renderer 默认拒绝 | T6/T10(C-06) |

### 5.3 增量同步协议(FR-SY-15~21 v0.2 修订)

| ID | 优先级 | 需求 | 验收标准 |
|---|---|---|---|
| FR-SY-15 | P0 | **增量协议 client→server PUSH(v0.2)** | 每 record 携带:`entity_id`, `revision`(=本地 max_seen + 1), `base_revision`(读取时看到的 revision,**conditional write**), `mutation_id`(UUIDv7), `client_updated_at`(ms,仅展示用); server 校验 `base_revision == current` 才接受,否则返回 409 + conflict payload(FR-SY-71);见 §7.3 |
| FR-SY-16 | P0 | **增量协议 server→client PULL(v0.2)** | 客户端按 entity_type 维护 `server_commit_seq_cursor`(= 上次 pull 拿到的最大 `commit_seq`,BIGINT);`GET /sync/pull?entity_type=todos&since=<commit_seq>&limit=500`;复合 cursor 不再用 timestamp(H-04) |
| FR-SY-17 | P0 | **Tombstone 软删除(v0.2 修订)** | 客户端不真删,标 `deleted_at`;服务端 tombstone 90 天 + 所有已注册设备 ACK 后可由 cron 物理 GC(M-11);Phase 5 加 device_sync_progress 表跟踪;v1 保守起见 v1.0 GA 不开 GC,只标"可 GC" 状态 |
| FR-SY-18 | P0 | Batch 大小动态 | 上行 PUSH 默认 batch=50 records / 1MB;遇 5xx 或 timeout 自动减半;成功后逐步放大回去 |
| FR-SY-19 | P0 | 同步压缩 | HTTP body 自动 gzip(threshold ≥ 4KB);Realtime 走标准 WS permessage-deflate |
| FR-SY-20 | P0 | 全量同步降级 | 当 client 的 `commit_seq_cursor` 落后 server > 100k 或 > 30 天时,触发全量 pull(分 page,UI 显示进度) |
| FR-SY-21 | P0 | 同步 P95 预算 | TECHNICAL_REQUIREMENTS §1.2 的预算(2s / 5s)在 1k records / 1MB blob batch 条件下 |

### 5.4 冲突解决(FR-SY-22~26 v0.2 重写)

> v0.2 重要变更:原 LWW + tombstone-优先 + updated_at-tiebreak 方案被 commit_seq + conditional write + 冲突 shadow 替代。详见审查报告 H-02 / H-03 / H-04 / H-05。

| ID | 优先级 | 需求 | 验收标准 |
|---|---|---|---|
| FR-SY-22 | P0 | **权威排序 = `(server_commit_seq, entity_id)`(v0.2)** | server 用 `commit_seq BIGSERIAL` 在每次 commit 自增;**这是唯一的全局排序权威**;客户端 timestamp 仅用于展示"最后修改时间",不参与冲突决议(H-02) |
| FR-SY-23 | P0 | 时钟偏移仅作展示 hint | `client_updated_at` 仅展示;`server_commit_seq` 决定顺序;client clock 超前 / 落后 server > 5min 时仅记 warn 不影响协议 |
| FR-SY-24 | P0 | **delete = mutation,无特殊优先级(v0.2 重写)** | delete 也是 mutation,按 commit_seq 决胜;undelete 是写新 revision,自然按 commit_seq 决胜,不靠时间比较(H-03);区分 `soft_delete`(用户操作,默认)vs `hard_delete`(用户在 settings 显式触发清理,跳过 30 天保留) |
| FR-SY-25 | P0 | 用户撤销 / undo | 客户端本地保留 30 天软删数据;UI 可恢复 → 写一条新 revision 的 mutation,自动按 commit_seq 决胜覆盖 tombstone |
| FR-SY-26 | P0 | **冲突日志 + 用户可见(升 P0,与 FR-SY-71 联动)** | sync_audit_log 记录每次 409 conditional-write 拒绝;Console 设置页"同步详情"展示最近 100 条冲突 + loser shadow;允许用户翻看 / 恢复 loser |

### 5.5 Realtime 订阅(FR-SY-27~31 v0.2 修订)

| ID | 优先级 | 需求 | 验收标准 |
|---|---|---|---|
| FR-SY-27 | P0 | **Realtime Private Channels + Authorization(v0.2 强制,H-09)** | Supabase Realtime 必须启用 [Private Channels + Authorization](https://supabase.com/docs/guides/realtime/authorization);每个 account_id 一个 channel `sync:<account_id>`;`realtime.messages` RLS policy:`USING (extension = 'postgres_changes' AND realtime.topic() = 'sync:' \|\| auth.uid())`;集成测试:user_B 订阅 `sync:<user_A_id>` channel → expect 0 message |
| FR-SY-28 | P0 | Realtime 消息载荷 | 服务端发的 message 仅含:`{ entity_type, entity_id, commit_seq, originator_device_id }`。**不含 encrypted_blob**(避免误以为 Realtime 通道泄漏数据;blob 仍走 REST pull) |
| FR-SY-29 | P0 | Realtime 触发 pull | 客户端收到 Realtime msg → 若 `originator_device_id == self` 则忽略;否则 schedule `pull(entity_type, since=local_commit_seq_cursor)` |
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
| FR-SY-38 | P0 | 设备注册 | 首次登录时 `POST /sync/devices/register { device_id, name=hostname, os=macOS 14.x }`;返回 device_token |
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
| FR-SY-46 | P0 | 批次部分失败回滚 | 单 PUSH batch 包含 50 条:服务端 atomic 处理(单 transaction);全失败 = 全失败,要么全成 = 整 batch 标 ack。**不允许"5 条成 45 条败"** |
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
| FR-SY-53 | P0 | 同步默认开启(已登录账号后) | 注册流程默认勾选"启用云同步";用户可在设置任何时刻全局关闭 |
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

### 6.1 Postgres 表(Supabase v0.2)

> v0.2 修订摘要:`encrypted_blobs` 加 `revision / key_id / commit_seq / mutation_id` 字段;`accounts` 加 `secret_key_check / dek_check / recovery_proof_hash / current_dek_key_id / encrypted_display_name`;新增 `account_keyring` / `encrypted_blobs_conflict_shadow` / `mutation_dedup` / `device_sync_progress` / `staging_blobs` 表;`entity_type` 改 ENUM。

```sql
-- ─── ENUM ──────────────────────────────────────────
CREATE TYPE sync_entity_type AS ENUM (
  'settings','grids','grid_items','auto_classify_rules',
  'lists','todos','todo_reminders','labels','label_assignments',
  'habits','habit_logs','boards','board_lists','board_cards',
  'board_card_checklist','notes','progress_trackers','pets','plugins'
);  -- 对应 M-09

-- ─── 账号 ──────────────────────────────────────────
CREATE TABLE accounts (
  id                     UUID PRIMARY KEY,                  -- = auth.users.id
  email                  TEXT NOT NULL UNIQUE,
  encrypted_display_name BYTEA,                             -- v0.2:客户端加密(M-04)
  kek_salt               BYTEA NOT NULL,                    -- 16B,Argon2id salt
  kek_kdf_version        SMALLINT NOT NULL DEFAULT 1,
  encrypted_dek          BYTEA NOT NULL,                    -- envelope: v|kdf|key_id|nonce|aad_len|aad|ct|tag
  current_dek_key_id     INTEGER NOT NULL DEFAULT 1,        -- v0.2 keyring 当前 active key_id (C-07)
  secret_key_check       BYTEA NOT NULL,                    -- v0.2 HMAC(secret_key,"xai.sk.check.v1") (FR-SY-73)
  dek_check              BYTEA NOT NULL,                    -- v0.2 HMAC(DEK,"xai.dek.check.v1") (M-13)
  recovery_proof_hash    BYTEA NOT NULL,                    -- v0.2 Argon2id(HKDF(DEK,...), salt=account_id) (FR-SY-69)
  mnemonic_acknowledged  BOOLEAN NOT NULL DEFAULT false,
  secret_key_acknowledged BOOLEAN NOT NULL DEFAULT false,   -- v0.2 secret_key 回填确认
  mfa_enabled            BOOLEAN NOT NULL DEFAULT false,
  deletion_scheduled_at  TIMESTAMPTZ,                       -- GDPR 30 天
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── DEK Keyring(v0.2 新,C-07)──────────────────
CREATE TABLE account_keyring (
  account_id    UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  key_id        INTEGER NOT NULL,
  encrypted_dek BYTEA NOT NULL,                              -- 该 key_id 的 DEK,用当前 KEK 加密
  status        TEXT NOT NULL CHECK (status IN ('active','retired','staging')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  retired_at    TIMESTAMPTZ,
  PRIMARY KEY (account_id, key_id)
);

-- ─── 加密 blob 单表(v0.2 大改:加 revision / key_id / commit_seq / mutation_id)──
CREATE TABLE encrypted_blobs (
  account_id        UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  entity_type       sync_entity_type NOT NULL,               -- v0.2 ENUM
  entity_id         TEXT NOT NULL,                           -- 客户端生成 uuidv7
  revision          BIGINT NOT NULL,                         -- v0.2 单调,server 决定(FR-SY-68)
  key_id            INTEGER NOT NULL,                        -- v0.2 引用 account_keyring(C-07)
  blob              BYTEA NOT NULL,                          -- 加密 envelope(含 AAD,FR-SY-67)
  commit_seq        BIGINT NOT NULL,                         -- v0.2 全局单调,排序权威(H-02/H-04)
  client_updated_at BIGINT NOT NULL,                         -- ms,仅展示用
  server_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),      -- 仅审计用
  deleted_at        TIMESTAMPTZ,                             -- tombstone(soft)
  hard_deleted      BOOLEAN NOT NULL DEFAULT false,          -- v0.2 用户显式硬删(FR-SY-24)
  originator_device_id UUID NOT NULL,
  mutation_id       UUID NOT NULL,                           -- v0.2 idempotency(FR-SY-72)
  blob_size         INTEGER NOT NULL,                        -- 用于 quota
  PRIMARY KEY (account_id, entity_type, entity_id)
);

CREATE UNIQUE INDEX idx_blobs_mutation_id
  ON encrypted_blobs (account_id, mutation_id);              -- v0.2 idempotency 唯一索引

CREATE INDEX idx_blobs_pull_cursor
  ON encrypted_blobs (account_id, entity_type, commit_seq);  -- v0.2 commit_seq 作 cursor

CREATE INDEX idx_blobs_realtime
  ON encrypted_blobs (account_id, commit_seq);

-- ─── commit_seq 全局序列(v0.2)─────────────────────
-- 用 BIGSERIAL,在 INSERT trigger / RPC 内分配,保证全局单调
-- 客户端 PULL cursor 就是 last_seen commit_seq

-- ─── Mutation 去重(v0.2,FR-SY-72)─────────────────
CREATE TABLE mutation_dedup (
  account_id    UUID NOT NULL,
  mutation_id   UUID NOT NULL,
  result        JSONB NOT NULL,                              -- 上次 push 的 PushResponse JSON
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, mutation_id)
);
CREATE INDEX idx_mutation_dedup_gc
  ON mutation_dedup (created_at);                            -- > 7 天后可 GC

-- ─── 冲突 shadow(v0.2,FR-SY-71)───────────────────
CREATE TABLE encrypted_blobs_conflict_shadow (
  id                 BIGSERIAL PRIMARY KEY,
  account_id         UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  entity_type        sync_entity_type NOT NULL,
  entity_id          TEXT NOT NULL,
  loser_blob         BYTEA NOT NULL,                         -- 被覆盖的 loser envelope
  loser_revision     BIGINT NOT NULL,
  loser_device_id    UUID NOT NULL,
  rejected_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  winner_commit_seq  BIGINT NOT NULL                         -- 是被哪一次 commit 覆盖的
);
CREATE INDEX idx_conflict_shadow_gc
  ON encrypted_blobs_conflict_shadow (rejected_at);          -- > 30 天 GC

-- ─── Staging blobs(Re-key 用,C-07)────────────────
CREATE TABLE staging_blobs (
  account_id      UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  rekey_session_id UUID NOT NULL,                            -- 一次 Re-key 一个 session
  new_key_id      INTEGER NOT NULL,
  entity_type     sync_entity_type NOT NULL,
  entity_id       TEXT NOT NULL,
  new_blob        BYTEA NOT NULL,                            -- 用 DEK_new 重加密的 envelope
  uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, rekey_session_id, entity_type, entity_id)
);

-- ─── Device 同步进度(v0.2,M-11 GC tombstone 用)───
CREATE TABLE device_sync_progress (
  account_id          UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  device_id           UUID NOT NULL,
  last_ack_commit_seq BIGINT NOT NULL DEFAULT 0,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, device_id)
);

-- ─── 设备登记(v0.2)─────────────────────────────
CREATE TABLE sync_devices (
  device_id      UUID PRIMARY KEY,
  account_id     UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name           TEXT,                                       -- v0.2:默认随机化 "Mac-XXXX"(L-05)
  os             TEXT,                                       -- "macOS 14.4"
  app_version    TEXT,
  registered_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at     TIMESTAMPTZ                                 -- 用户远程撤销 → 触发 Re-key
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

### 6.2 RLS Policies(v0.2 强化,FR-SY-58 / H-08 对应)

```sql
ALTER TABLE accounts                          ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_keyring                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE encrypted_blobs                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE encrypted_blobs_conflict_shadow   ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging_blobs                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE mutation_dedup                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_sync_progress              ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_devices                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_audit_log                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_quota                        ENABLE ROW LEVEL SECURITY;

-- accounts 只能读自己;PATCH 必须由 Edge Function 验过 recovery proof 才走 service_role
CREATE POLICY accounts_self_read ON accounts
  FOR SELECT USING (id = auth.uid());
CREATE POLICY accounts_self_update ON accounts
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
  -- 注:涉及 encrypted_dek / kek_salt / secret_key_check / recovery_proof_hash 字段的 UPDATE
  --     强制走 Edge Function /auth/me PATCH,其内部校验 recovery proof,RLS 只是基础防线

-- keyring 只能读自己,写由 Edge Function 控制
CREATE POLICY keyring_self_read ON account_keyring
  FOR SELECT USING (account_id = auth.uid());

-- encrypted_blobs:v0.2 加 device 校验(H-08)
CREATE POLICY blobs_self_read ON encrypted_blobs
  FOR SELECT USING (account_id = auth.uid());

CREATE POLICY blobs_self_write ON encrypted_blobs
  FOR INSERT WITH CHECK (
    account_id = auth.uid()
    AND originator_device_id IN (
      SELECT device_id FROM sync_devices
      WHERE account_id = auth.uid() AND revoked_at IS NULL
    )
  );

CREATE POLICY blobs_self_update ON encrypted_blobs
  FOR UPDATE USING (account_id = auth.uid())
  WITH CHECK (
    account_id = auth.uid()
    AND originator_device_id IN (
      SELECT device_id FROM sync_devices
      WHERE account_id = auth.uid() AND revoked_at IS NULL
    )
  );

-- conflict shadow / staging blobs:只读自己,写由 Edge Function
CREATE POLICY conflict_shadow_self_read ON encrypted_blobs_conflict_shadow
  FOR SELECT USING (account_id = auth.uid());

CREATE POLICY staging_blobs_self ON staging_blobs
  FOR ALL USING (account_id = auth.uid()) WITH CHECK (account_id = auth.uid());

-- mutation_dedup / device_sync_progress:只读自己
CREATE POLICY mutation_dedup_self ON mutation_dedup
  FOR SELECT USING (account_id = auth.uid());

CREATE POLICY device_progress_self ON device_sync_progress
  FOR SELECT USING (account_id = auth.uid());

-- sync_devices:撤销由 Edge Function 走 service_role
CREATE POLICY devices_self_read ON sync_devices
  FOR SELECT USING (account_id = auth.uid());

-- audit / quota 只读自己
CREATE POLICY audit_self ON sync_audit_log
  FOR SELECT USING (account_id = auth.uid());
CREATE POLICY quota_self ON sync_quota
  FOR SELECT USING (account_id = auth.uid());

-- Realtime 授权(FR-SY-27 / H-09):channel 名必须含 auth.uid()
-- 详见 Edge Function 配置文件 supabase/realtime/policies.sql
```

**Phase 5 RLS audit 必须项(v0.2 强化)**:
1. 用 `SET ROLE authenticated; SET request.jwt.claims = ...` 加自动测试,模拟 user_A token 访问 user_B 数据 → 0 行
2. **RLS fuzz**:property-based 测试模拟 1000 用户 × 100 设备,随机生成 RLS 查询,断言 cross-tenant 数据零泄漏
3. JWT 包含 `device_id` claim,RLS 直接 `auth.jwt() ->> 'device_id'`,验"被撤销设备的 token 无法 INSERT"
4. **显式声明**:RLS 防 authenticated/anon role 越权,**不防 service_role**(后者由零知识承诺保护)

### 6.3 客户端 SQLite 新增表(v0.2,所有表在 SQLCipher 加密 DB 内,FR-SY-74)

```sql
-- 离线写队列(FR-SY-33 v0.2 扩展:加 mutation_id / base_revision / causal_deps)
CREATE TABLE sync_outbox (
  seq             INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type     TEXT NOT NULL,
  entity_id       TEXT NOT NULL,
  op              TEXT NOT NULL,                -- 'upsert' / 'delete' / 'hard_delete'
  mutation_id     TEXT NOT NULL UNIQUE,         -- v0.2 UUIDv7,idempotency (FR-SY-72)
  base_revision   INTEGER,                      -- v0.2 conditional write,NULL = first create (FR-SY-15)
  causal_deps     TEXT,                         -- v0.2 JSON [{entity_id, max_seen_revision}] (P-01)
  queued_at       INTEGER NOT NULL,             -- ms
  retries         INTEGER NOT NULL DEFAULT 0,
  next_retry_at   INTEGER,
  dead_letter     INTEGER NOT NULL DEFAULT 0,
  last_error      TEXT
);
CREATE INDEX idx_outbox_pending ON sync_outbox(dead_letter, next_retry_at);

-- 同步游标(v0.2 改:cursor 用 commit_seq 而非 timestamp,H-04)
DROP TABLE IF EXISTS sync_state;
CREATE TABLE sync_state (
  entity_type             TEXT PRIMARY KEY,
  server_commit_seq_cursor INTEGER NOT NULL DEFAULT 0,    -- v0.2 拉取游标
  last_pull_at            INTEGER,
  last_push_at            INTEGER,
  next_nonce_counter      INTEGER NOT NULL DEFAULT 0      -- v0.2 deterministic nonce 计数器(FR-SY-07)
);

-- 实体级 revision 跟踪(v0.2,FR-SY-68 rollback 防护)
CREATE TABLE entity_state (
  entity_type        TEXT NOT NULL,
  entity_id          TEXT NOT NULL,
  max_seen_revision  INTEGER NOT NULL,
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

### 7.1 加密 Envelope 二进制格式(v0.2 修订:加 key_id + AAD)

```
┌──────┬───────┬─────────┬─────────┬─────────┬─────────────┬───────────────┬───────┐
│ v: 1B│kdf:1B │ key_id: │ nonce:  │ aad_len:│  aad:       │ ciphertext:   │ tag:  │
│      │       │   4B    │   12B   │   2B    │  variable   │   variable    │  16B  │
└──────┴───────┴─────────┴─────────┴─────────┴─────────────┴───────────────┴───────┘
   │       │       │         │         │           │
   │       │       │         │         │           └── associated data(明文,绑定密文语境,FR-SY-67)
   │       │       │         │         │               blob 加密:account_id ‖ entity_type ‖ entity_id
   │       │       │         │         │                       ‖ revision ‖ key_id ‖ deleted_flag ‖ schema_version
   │       │       │         │         │               encrypted_dek 包装:account_id ‖ "dek_wrap"
   │       │       │         │         │                       ‖ key_id ‖ kek_kdf_version
   │       │       │         │         └── AAD 字节数(u16 LE)
   │       │       │         └── deterministic nonce = device_id (4B) ‖ counter (8B)(FR-SY-07)
   │       │       └── DEK key_id,引用 account_keyring;Re-key 期间客户端按 key_id 选 DEK 解密(C-07)
   │       └── kek_kdf_version
   └── envelope schema version,v=1 固定;v=2 预留(可能切 AES-GCM-SIV,见 §11 R-10.9)
```

**编/解码不变式**:
- `aad` 由调用方按 §3 / FR-SY-67 规则组装并传入,**不能省略**
- decrypt 时调用方必须传入相同 AAD;不匹配 = GCM tag fail = 拒收
- nonce 由客户端 KeyVault 内部维护 counter,**JS / plugin 不直接构造 nonce**

序列化 / 反序列化函数住 Rust 侧 `apps/desktop/src-tauri/src/crypto/envelope.rs`;TS 侧只走 `key_handle` API,不直接 parse envelope(FR-SY-75)。

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

### 7.3 PUSH 协议(v0.2 修订:conditional write + mutation_id)

**Request**
```
POST /sync/push
Authorization: Bearer <jwt>
Content-Type: application/json; encoding=gzip
X-Device-Id: <uuid>
X-App-Version: 1.0.0
Accept-Version: sync.v1                                       (T12 / L-03)

{
  "entity_type": "todos",
  "records": [
    {
      "entity_id": "01HXY...uuidv7...",
      "mutation_id": "01HXY...uuidv7...",                     // v0.2 idempotency (FR-SY-72)
      "base_revision": 6,                                      // v0.2 conditional write,首次创建传 null (FR-SY-15)
      "blob": "<base64 envelope with AAD + key_id>",           // v0.2 envelope 含 AAD (FR-SY-67)
      "client_updated_at": 1715764800123,                      // 仅展示用
      "causal_deps": [                                         // v0.2 (P-01)
        { "entity_id": "label_01HXY...", "max_seen_revision": 3 }
      ],
      "soft_delete": false,                                    // v0.2 区分 soft/hard (FR-SY-24)
      "hard_delete": false
    },
    ...
  ]
}
```

**Response 200(全部成功)**
```json
{
  "accepted": 50,
  "server_now": "2026-05-15T10:00:00.123Z",
  "results": [
    {
      "entity_id": "01HXY...",
      "mutation_id": "01HXY...",
      "revision": 7,                                            // v0.2 server 分配新 revision
      "commit_seq": 1234567                                     // v0.2 全局 commit_seq
    }
  ]
}
```

**Response 200(部分 conflict,FR-SY-71)** — 整 batch 仍按 FR-SY-46 atomic;若有任一条 base_revision 失败 / causal_deps 未满足 → 整 batch 返回 207,逐条标 status:
```json
{
  "accepted": 47,
  "rejected": 3,
  "results": [
    { "entity_id": "01HXY...A", "status": "ok", "revision": 7, "commit_seq": 1234567 },
    { "entity_id": "01HXY...B", "status": "conflict",
      "server_revision": 9, "server_blob": "<base64>", "winner_commit_seq": 1234500,
      "your_loser_blob_saved_to_shadow_id": 42 },
    { "entity_id": "01HXY...C", "status": "causal_dep_unsatisfied",
      "missing_dep": { "entity_id": "label_...", "needed_revision": 5, "server_revision": 4 } },
    { "entity_id": "01HXY...D", "status": "duplicate_mutation_id",
      "previous_revision": 7, "previous_commit_seq": 1230000 }    // FR-SY-72 idempotency hit
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

**Request**
```
GET /sync/pull?entity_type=todos&since_commit_seq=1234500&limit=500
Authorization: Bearer <jwt>
Accept-Version: sync.v1
```

**Response 200**
```json
{
  "records": [
    {
      "entity_id": "01HXY...",
      "revision": 7,
      "key_id": 1,
      "blob": "<base64 envelope>",
      "commit_seq": 1234567,
      "soft_deleted": false,
      "hard_deleted": false,
      "originator_device_id": "..."
    }
  ],
  "next_commit_seq": 1234567,
  "has_more": false
}
```

**客户端处理**:对每条 record 校验 `revision > entity_state.max_seen_revision`(FR-SY-68),否则拒收并 surface "可疑活动" 告警(T1.1)。

### 7.5 Realtime 消息(v0.2 修订:commit_seq + Private Channels)

```json
// channel: sync:<account_id>  (Private Channel,Authorization 校验 RLS,FR-SY-27 / H-09)
// event:   "blob_changed"
{
  "entity_type": "todos",
  "entity_id": "01HXY...",
  "commit_seq": 1234567,                                    // v0.2 替代 server_updated_at
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
| E3006 | DEK decryption failed (= 密码错或 encrypted_dek 损坏) |
| E3007 | mnemonic verify failed |
| E3008 | rate limited (429) |
| E3009 | quota exceeded |
| E3010 | clock skew too large (warn-level) |
| E3011 | dead letter |
| E3012 | conflict (409 / 207) — 客户端可走 FR-SY-71 恢复 loser |
| E3013 | secret_key verify failed (FR-SY-73) — 提示用户重输 secret_key |
| E3014 | recovery proof failed (FR-SY-69) — 拒绝 PATCH,可能是非法 reset |
| E3015 | revision rollback rejected (FR-SY-68) — 客户端拒收旧 revision,**可疑活动告警** |
| E3016 | AAD mismatch (FR-SY-67) — server 调包密文嫌疑,**可疑活动告警** |
| E3017 | mutation_id duplicate handled (info,FR-SY-72 idempotency) |
| E3018 | causal_dep unsatisfied — 客户端补依赖后重试 |
| E3019 | downgrade detected (T12) — Accept-Version 缺失 / envelope version 过旧 |
| E3020 | sqlcipher init failed (FR-SY-74) |
| E3099 | unknown sync error |

### 7.7 版本协商(v0.2 强化,T12 / L-03)

- HTTP header `Accept-Version: sync.v1` **必发**(原 v0.1 "缺失视为 v1" 被废弃,弱化 downgrade 防护)
- server 收到缺 header 的请求 → 400 `version_required`(E3019)
- 客户端读 Response header `Sync-Schema-Version` 校验,若 server 返 v2 而 client 是 v1 → 阻塞同步,引导升级
- envelope `v` 字段固化在 AAD 间接绑定,**MITM 无法降级**(改 v 会让 AAD 不一致 → GCM tag fail)

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
| R-10.1 | nonce 复用导致 GCM 灾难性失败 | 🔴 高 | 每条 record 独立 nonce + OsRng;单测断言 1M record 全 unique;代码 review checklist | 单测 + fuzz |
| R-10.2 | 主密码忘 + 助记词丢 = 用户数据永失 | 🔴 高 | UI 三屏强提示 + 打字回填验证(FR-AC-09);助记词导出 PDF / 截图引导;**不承担"找回"承诺**(产品语言要明示) | 用户教育 |
| R-10.3 | LWW 在时钟偏移下丢数据 | 🟡 中 | server_updated_at 权威钟(FR-SY-23);client clock skew 警告;30 天软删 + outbox 死信保护 | sync_audit_log |
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
- [ ] **C-01 v2**:迁 OPAQUE PAKE(RFC 9807)实现真正零知识口令认证
- [ ] **C-03 v2**:账户级 Merkle root / hash chain,防御"恶意服务端伪造合法 revision 但篡改 commit 时间序"
- [ ] iOS 客户端的 KEK 派生参数差异(若未来做 iOS,Argon2id 在低端机器可能太重)
- [ ] Realtime 在网页版的 fallback:若 WebSocket 被企业代理拦截 → 退化为 long polling(SSE)
- [ ] 与 Web 端的同步语义对齐(同一账号 Web + Desktop 同时打开是否要做"会话锁定")

---

## 13. 文档变更记录

| 日期 | 版本 | 变更 |
|---|---|---|
| 2026-05-14 | v0.1-DRAFT | 首版:目标 / 威胁模型 / 密钥层级 / 同步范围矩阵 / 41 条新 FR / 服务端 schema / 协议规格 / R-10 子分解 |
| 2026-05-15 | **v0.2-DRAFT(协议硬化)** | 基于 `REVIEW-2026-05-15.md` Critical + High 全面落实。主要变更:<br>**密钥**:① master_password 与 auth_password 完全分离(C-01);② 24 词 BIP-39 编码 256-bit DEK(C-05);③ 客户端 Secret Key 抗字典攻击(FR-SY-73 / H-14);④ Recovery proof 阻断恶意 PATCH(C-04 / FR-SY-69)<br>**加密原语**:① AAD 必须绑定 entity 语境(C-02 / FR-SY-67);② Deterministic nonce(H-01);③ Envelope 加 `key_id`(C-07);④ Re-key 两阶段 + keyring(FR-SY-13 升 P0);⑤ DEK 常驻 Rust KeyVault,JS 只拿 opaque handle(C-06 / FR-SY-75)<br>**协议**:① Conditional write + base_revision(H-05);② Mutation_id 全局 idempotency(H-07 / FR-SY-72);③ commit_seq BIGSERIAL 替代 timestamp 作权威排序与 cursor(H-02/H-04);④ delete 不再有特殊优先级,按 commit_seq 决胜(H-03);⑤ Outbox 按依赖 DAG 合并(H-06);⑥ 冲突 shadow 30 天保留(FR-SY-71);⑦ Realtime Private Channels + Authorization 强制(H-09)<br>**本地存储**:① SQLCipher 加密本地 SQLite(C-09 / FR-SY-74);② 导出文件默认 age 加密(C-10 / FR-SY-70);③ outbox 与 entity 写入同事务原子性(M-12)<br>**多设备**:① 设备撤销强制 Re-key(H-11 / FR-AC-14 升 P0);② RLS 加 device 校验(H-08);③ JWT embed device_id claim<br>**Schema**:① 新增 `account_keyring` / `mutation_dedup` / `encrypted_blobs_conflict_shadow` / `staging_blobs` / `device_sync_progress` 5 张表;② accounts 加 `secret_key_check / dek_check / recovery_proof_hash / current_dek_key_id`;③ encrypted_blobs 加 `revision / key_id / commit_seq / mutation_id`;④ `entity_type` 改 ENUM(M-09)<br>**威胁模型**:新增 T1.1 / T3.5 / T10~T13;补"防 vs 不防"边界(L-01);R-10 子风险扩展到 R-10.13<br>**验收**:新增 §10.x 协议硬化里程碑准入门;Phase 5 验收加零知识 PoC / SQLite dump PoC / 导出文件加密验证<br>**Open**:Invisible Salamanders(R-10.9)v1 不防护,v2 评估 AES-GCM-SIV;OPAQUE 为 C-01 的 v2 升级路径 |

— END —
