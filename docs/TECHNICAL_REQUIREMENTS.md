# TECHNICAL_REQUIREMENTS.md — 技术实现要求

> 本文档定义 XAI_Desktop 的**技术实施标准**:测试 / 性能 / 安全 / 构建 / 依赖 / 跨平台抽象。
> 与 `SYSTEM_ARCHITECTURE.md`(系统宪法 / 不变的架构约束)互补 —— 本文档是**可演进的实施标准**。
> 最后更新:2026-05-14 · 对齐 PRD v1.6-draft

---

## 目录

1. 验收 + 性能(测试要求 / 性能预算 / 可观测性)
2. 安全 / 隐私实现
3. 工程化(构建发布管线 / 外部依赖 / 编码规范扩充)
4. 跨平台抽象(Rust trait 设计)

---

## 1. 验收 + 性能

### 1.1 测试要求

#### 1.1.1 覆盖率底线

| 包 | 单测覆盖率 | 说明 |
|---|---|---|
| `packages/core-*`(数据/事件/快捷键/fs) | ≥ 80% | 基础设施,所有 plugin 共用,bug 影响面大 |
| `packages/plugin-*`(业务模块) | ≥ 60% | 业务逻辑,关注核心路径 |
| `packages/ui` | ≥ 40% | 组件库,视觉回归优先 |
| `apps/desktop/src-tauri/`(Rust) | ≥ 70% | 窗口/剪贴板/fs 等原生交互 |
| `apps/desktop/src`(Host) | 无强制覆盖率,聚焦集成测试 | 几乎零业务逻辑 |

工具:Vitest(前端)+ `cargo test`(Rust)+ Playwright(E2E,Phase 2 起接入)。

#### 1.1.2 测试分层

| 层 | 范围 | 频次 | 工具 |
|---|---|---|---|
| **单测(Unit)** | 函数 / 组件 / 单个 hook | 每次 CI | Vitest, cargo test |
| **集成(Integration)** | Plugin 内多模块协作 / Rust↔TS 桥 | 每次 PR | Vitest + mock Tauri |
| **契约(Contract)** | 跨 Plugin 事件 payload / API schema | 每次 PR | core-events 自动类型校验 + Zod 运行时 |
| **端到端(E2E)** | 关键用户流程(新建 Grid、拖文件、剪贴板、Todo CRUD) | 合并 main 前 | Playwright + Tauri WebDriver |
| **真机验收(Manual)** | 每个 Phase 验收必跑 | 每 Phase 末 | 见 §1.1.3 真机清单 |

#### 1.1.3 真机验收清单(每个 Phase 必过)

> 上次踩过"代码写完 ≠ 真机能跑"的坑(R-11),所以每 Phase 验收**以真机实测通过为准**。

| 验收点 | 适用 Phase | 通过标准 |
|---|---|---|
| macOS Sonoma / Sequoia 双版本能装 + 启动 | 每 Phase | 双系统真机各跑一次 |
| 多 Space 切换不丢窗口 | Phase 0+ | 3 个 Space 来回切 10 次 |
| Stage Manager 兼容 | Phase 0+ | 开关 Stage Manager 行为正常 |
| 全屏 App 进出 | Phase 0+ | 进入全屏 App 后 overlay/grids 行为可预期 |
| 点击穿透 + 文件拖入并存 | Phase 0+ | 桌面图标可点 & Grid 可接收拖入 |
| 屏幕共享时剪贴板面板自动隐藏 | Phase 2+ | QuickTime / Zoom 屏幕共享时验 |
| 桌宠 idle / 状态指示动画 | Phase 3+ | 番茄/同步/AI 思考态触发动画 |
| 控制台 ↔ overlay 数据实时一致 | Phase 2.5+ | 一处改 Todo,另一处立即刷新 |
| 网页版 ↔ 桌面 App 同步 | Phase 4.5+ | 浏览器改 → 桌面 App 5 秒内可见 |
| 公证后 .dmg 双击首启 | Phase 6 | 无 "无法验证开发者" 弹窗 |
| MAS 沙箱版功能子集行为正常 | Phase 6 | 沙箱限制下剪贴板/fs 走 fallback 路径 OK |

#### 1.1.4 Bug 回归保护

每个 bug fix 必须**先写一个能复现的失败测试**,再修。回归测试纳入 CI(`tests/regression/<issue-id>.test.ts`)。

---

### 1.2 性能预算

> PRD §6.1 列了目标值,本节给出**强制预算 + 监测办法 + 越线动作**。

| 指标 | 预算 | P95 | 监测办法 | 越线动作 |
|---|---|---|---|---|
| 冷启动(splash → 主面板可交互) | 2.0s | 3.0s | tauri-plugin-log 启动 trace | 阻塞合并,降级或拆 lazy |
| 主面板唤起(快捷键 → 显示) | 100ms | 200ms | Performance.mark 埋点 | 阻塞合并 |
| 剪贴板入库延迟(NSPasteboard change → SQLite) | 100ms | 200ms | Rust 端 instant 计时 | 阻塞合并 |
| 剪贴板搜索(1 万条记录) | 200ms | 400ms | FTS5 索引 + EXPLAIN QUERY PLAN | 加索引或分页 |
| 桌面 100+ 文件自动分类 | 1s | 2s | tracing | 改后台执行 + 进度条 |
| 后台空闲 CPU(均值,5 分钟采样) | 0.5% | 1.0% | macOS Activity Monitor + 自检 | 找定时器泄漏 |
| 内存常驻(空闲态,启动后 5 分钟) | 200 MB | 300 MB | macOS Activity Monitor | 找内存泄漏 |
| 数据库占用(用 1 年后估算) | 500 MB | 1 GB | SQLite VACUUM + 监控 | 加自动清理 |
| 同步增量推 / 拉(P95) | 2s | 5s | Sentry transaction | 改成 streaming |

**性能回归门**(Phase 2 起):每次发版前跑性能基准,任何指标退化 ≥ 20% 阻塞发布。

---

### 1.3 可观测性

#### 1.3.1 日志

- **Rust 侧**:`tracing` crate + `tracing-subscriber`,按 module 配级别;生产构建仅 INFO+;debug 构建可 TRACE。
- **前端**:`packages/core-data` 提供 `logger` 接口,内部走 `tauri-plugin-log`;开发期可配 console fallback。
- **禁止** 生产用 `console.log` / `println!`(已在 SYSTEM_ARCHITECTURE §4 红线 7 限定)。
- **日志位置**:`~/Library/Logs/XAI_Desktop/`,按日轮转,默认保留 7 天。
- **隐私**:日志**严禁**写入剪贴板内容、文件完整路径、用户输入的 Todo 标题等。所有用户内容字段做 redact(写成 `<text:42chars>`)。

#### 1.3.2 错误链 + 上报

- Rust 用 `thiserror` / `anyhow` 串错误链,转成 TS 时携带 `code` + `message` + `context`。
- 前端用 Result 风格(`@repo/core/result`)而非 throw,关键路径强制类型化错误。
- **Sentry 接入**(opt-in,默认关):
  - 用户首启时弹"是否启用匿名错误上报"对话框
  - 仅上报崩溃栈 / 错误链 / 设备型号 / OS 版本,**不带用户内容**
  - DSN 配在 `.env`,sourcemap 通过 sentry-cli 在 build 时上传
- 关键错误(同步失败 / 数据库锁 / 沙箱权限被拒)走系统 Notification + 控制台日志双通道。

#### 1.3.3 自检 & 健康指标

控制台 → 设置 → "诊断信息"页可导出:
- 当前数据库大小、各表记录数
- 最近一次同步状态 + 耗时
- 当前活跃窗口列表 + 内存占用
- 最近 100 条 ERROR 日志(已 redact)
- 系统信息(macOS 版本、Apple Silicon/Intel、屏幕数)

用户报 bug 时一键导出,贴给我们诊断。

---

## 2. 安全 / 隐私实现

### 2.1 密钥与加密(v0.4 与 `sub-prds/sync/PRD.md` v0.4-DRAFT 对齐)

> **本节只保留全局不变量**;完整协议(per-device wrap / Ed25519 recovery / CBOR AAD / 6 个 Critical 修复 / 11 个 High)是 `sub-prds/sync/PRD.md` v0.4-DRAFT 的内容,**Sync PRD 是协议唯一 source of truth**;本节如与 Sync PRD 冲突,以 Sync PRD 为准。

#### 2.1.1 密钥层级(v0.4)

```
master_password (永不出本机) + secret_key 128-bit (客户端生成,Emergency Kit 备份)
        │
        ├── KEK = Argon2id(master_password, salt=kek_salt, secret=secret_key, t=3,m=64MiB,p=4)
        │     ├── SQLite db_key = HKDF(KEK, "xai.sqlite.v1") → SQLCipher 4 整库加密
        │     └── KEK 仅缓存 macOS Keychain (WhenUnlockedThisDeviceOnly, ACL=bundle id)
        │
        ├── device_priv = csprng(32) (本地 CSPRNG,X25519 priv)    ← v0.4 C-A:不从 KEK 派生
        │     存 macOS Keychain "xai.devicekey.<account_id>.<device_id>"
        │     device_pub = X25519_pub(device_priv) 上传 sync_devices.device_pub
        │
        ├── auth_password = Argon2id(HKDF(master_password ‖ secret_key, ...), t=1,m=16MiB,p=1)
        │                 → 发 Supabase Auth (真"双因子登录":secret_key 错则 login 失败)
        │
        └── recovery_seed = HKDF-Expand(DEK_current, "xai.recovery.sig.v1")
              (recovery_priv, recovery_pub) = Ed25519_from_seed(recovery_seed)
              server 只存 recovery_signing_pub (32B);PATCH /auth/me 需 Ed25519 签名

DEK_v_n 32B  ←── X25519_decrypt(device_priv, device_dek_wraps[device_id, key_id=n].wrap)
        │       (DEK 不再用 KEK 直接包装;每 active device 持自己 wrap 行)
        │
        │  AES-256-GCM:
        │   nonce = encryption_device_id (8B server 分配 UNIQUE per device) ‖ counter (4B)
        │   ⚠ counter checkpoint 双重锚点:SQLCipher next_counter + Keychain ThisDeviceOnly high_water
        │   AAD = deterministic CBOR map (RFC 8949 §4.2),含 proposed_revision/key_id/encryption_device_id/...
        ▼
encrypted_blob

24 词 BIP-39 助记词 = DEK_current 备份(256-bit;只恢复当前 key,retired key 限制见 Sync PRD §3.6)
```

**v0.4 关键不变式**:
- **master_password + secret_key 永不离开本机**;auth_password 派生**必须**包含 secret_key(否则不是双因子)
- **KEK 永不出 macOS Keychain**;ACL=bundle id;用完 zeroize
- **device_priv 由本地 CSPRNG 独立生成**(v0.4 C-A 核心修复),**绝不从 KEK 派生**;仅存 Keychain;旧设备无法算出新设备 device_priv
- **DEK 常驻 Rust 侧 KeyVault**(JS / plugin 永远只见 opaque `key_handle`)
- **DEK 不用 KEK 直接包装**;每 active device 持自己的 wrap(HPKE Base mode);撤销 device 删 wrap 行真正排除旧设备
- **encrypted_blobs 客户端只读**(v0.4 C-D);所有写入走 /sync/push Edge Function service_role
- **accounts 敏感字段 client UPDATE 被 RLS 禁**;变更需 Edge Function + Ed25519 recovery proof + 完整 payload binding
- **nonce 双重锚点**(v0.4 C-C):SQLCipher + Keychain ThisDeviceOnly;Time Machine 回滚 SQLite 后 Keychain 锚点未变 → 拒绝加密
- **本地 SQLite 由 SQLCipher 4 加密**(AES-256-CBC + HMAC-SHA512,默认模式)
- 主密码 + 24 词助记词同时丢 = 数据无法恢复

#### 2.1.2 加密算法(v0.2)

- 对称加密:**AES-256-GCM** with **AAD = deterministic CBOR**(详见 sync PRD FR-SY-67 / §7.1.2,RFC 8949 §4.2);nonce = `encryption_device_id (8B,server 分配,unique per device) ‖ counter (4B,per device per key_id)`;**三端统一 server nonce lease**(sync PRD §6.1 nonce_lease 表 + C-C v0.5)保证 counter 不回滚;server 端 `UNIQUE(account_id, key_id, encryption_device_id, counter)` 硬约束作最后防线(C-B);到 2^32 强制 Re-key
- 文件指纹:**HMAC-SHA256(DEK, file)**(防跨账号关联)
- 哈希:**SHA-256** + **HMAC-SHA256**(派生 dek_check / secret_key_check 等)
- 签名:**Ed25519**(recovery proof,sync PRD FR-SY-69 / §3.5)
- 密钥交换:**X25519 + HPKE Base mode (RFC 9180)**(per-device DEK wrap,info 绑定 wrap AAD schema;sealed_box 表述已废弃,FR-SY-76)
- 密钥派生:**Argon2id**(KEK 强参数 + auth_password 弱参数,**dual-factor:auth_password 必含 secret_key**)+ **HKDF-SHA256**(子密钥 / db_key / device_seed / recovery_seed)
- 助记词:**BIP-39 24 词**(256-bit + 8-bit checksum)
- 本地 SQLite 加密:**SQLCipher 4**(AES-256-CBC + HMAC-SHA512,默认模式;**不是 AES-GCM**)
- 导出文件:**[age](https://age-encryption.org/)** 加密,key 由 master_password ‖ secret_key 派生
- 传输:**TLS 1.3**;客户端校验证书指纹

不允许任何 MD5 / SHA-1 / DES / 3DES / ECB 模式 / 自己实现加密原语;不允许 JS 侧持有 raw key。

#### 2.1.3 哪些字段加密(v0.2 修订:本地全加密)

| 字段 | 本地加密 | 云上传 | 备注 |
|---|---|---|---|
| 所有本地 SQLite 表(桌面端) | ✅ **SQLCipher 4 整库加密**(AES-256-CBC + HMAC-SHA512) | (按 sub-prds/sync §4 同步矩阵) | sync PRD FR-SY-74 |
| 所有本地 IndexedDB 表(Web 端,v0.3 新) | ✅ **WebCrypto 字段级 AES-GCM**;db_key = HKDF(KEK_from_PBKDF2_in_WebWorker, "xai.indexeddb.v1");key 不出 ServiceWorker;**会话级缓存,关闭浏览器即清** | 同上 | 详 sync PRD §3.7.1(待补)及 Web 子 PRD;**重要**:Web 端因 IndexedDB 无原生整库加密,采用字段级 + 短生命周期 key 缓解。威胁模型 T3'(已登录浏览器被盗)残余风险高于桌面 |
| `clipboard_items.*` | ✅ SQLCipher / WebCrypto | ❌ 不上传 | 隐私优先 |
| `todos.*` / `notes.*` / `habits.*` / `grids.*` 等 | ✅ SQLCipher / WebCrypto | ✅ E2E 加密 blob(CBOR AAD) | |
| `accounts.refresh_token` | ✅ Keychain (桌面) / ✅ **HttpOnly + Secure cookie**(Web,不进 JS) | — | Web 端 refresh_token 由 server 设置 HttpOnly cookie,JS 不可读 |
| `pomodoro_sessions` | ✅ SQLCipher / WebCrypto | ❌ 不上传 | 隐私优先 |
| 文件指纹(grid_items.payload_json 内) | ✅ | ✅ HMAC-SHA256(DEK, file) | HMAC 替代明文 SHA-256 |
| 日志文件 | ❌ 明文(已 redact,无 user content) | ❌ 不上传 | redact 防泄漏 |
| 导出 .json.age | ✅ age 加密 (key = master_password ‖ secret_key 派生) | — | FR-SY-70 / M-8 |

### 2.2 macOS 沙箱 entitlements 清单(MAS 版)

```xml
<!-- entitlements.mas.plist 关键条目 -->
<key>com.apple.security.app-sandbox</key>
<true/>

<!-- 文件访问:用户主动选才能访问 -->
<key>com.apple.security.files.user-selected.read-write</key><true/>
<key>com.apple.security.files.bookmarks.app-scope</key><true/>

<!-- 网络:账号 + 同步 + 天气 API -->
<key>com.apple.security.network.client</key><true/>

<!-- Downloads 读写(可选,文件夹映射用) -->
<key>com.apple.security.files.downloads.read-write</key><true/>
```

**显式不申请**:
- ❌ `com.apple.security.cs.disable-library-validation`(避免 Apple 审核警告)
- ❌ `com.apple.security.automation.apple-events`(暂不需 AppleScript)
- ❌ `com.apple.security.device.camera/microphone`(隐私敏感,非必要不申请)

DMG 完整版不启用沙箱,但仍走 hardened runtime + notarization。

### 2.3 macOS 权限请求规范

| 权限 | 用途 | 请求时机 |
|---|---|---|
| 屏幕录制权限 | 用 `CGDisplayIsCaptured()` 检测屏幕共享(隐藏剪贴板面板) | 首次启用剪贴板时引导授权 |
| Accessibility 权限 | 全局快捷键监听 | 首次设置快捷键时引导授权 |
| 完全磁盘访问 | 文件夹映射 / 自动分类扫描 ~/Desktop 之外 | 首次创建文件夹映射时引导 |
| 通知权限 | Todo / 番茄 / 桌宠气泡 / 同步状态 | 首次需要通知时 |

引导文案:每次都解释"为什么需要"+ 关闭后哪些功能不可用 + 用户可以拒绝(降级路径)。

### 2.4 E2E 加密同步协议(v0.5 简版,完整规格见 `sub-prds/sync/PRD.md` v0.5-DRAFT)

1. **首次注册**:client 生成 DEK + Secret Key + 24 词助记词 + device_priv (本地 CSPRNG) → 派生 KEK(含 Secret Key)→ device_pub 上传 → wrap_v1 = HPKE_seal(device_pub, DEK_v1) 写 device_dek_wraps → server 分配 encryption_device_id → Supabase Auth 创建 user (account_id = auth.users.id,**client 不自定 account_id**)
2. **新设备登录**:client 本地 CSPRNG 生成新 device_keypair → 注册 status='pending_dek_wrap' → **必须经过用户可验证设备配对**(6 词 fingerprint / QR 扫码,Signal Safety Number 风格)→ donor 确认匹配后才 grant_dek_wrap → status='active' → 拿到 wrap → HPKE_open 解出 DEK
3. **数据同步**:client 本地计算 base+1 = proposed_revision → 即时 CBOR AAD 加密 → **一次 push**(/sync/push 走 Edge Function);server 端 UNIQUE(account_id, key_id, encryption_device_id, counter) 硬约束 + 校验 envelope.enc_dev_id 与 JWT.device_id 一致;**encrypted_blobs 客户端只读**
4. **冲突**:commit_seq 全局账户级 + conditional write;loser 完整 AAD context 入 conflict_shadow 30 天
5. **设备撤销**:DELETE device_dek_wraps + revoked_at → Re-key 生成 DEK_v_n+1 + **新 24 词 + 新 recovery_signing_pub**(UI 阻断式回填确认);旧 device 即使重登也无新 wrap
6. **PATCH /auth/me**:Ed25519 签名 message 绑定 `SHA256(CBOR_canonical(完整 new_payload))`(唯一 schema,字段级 hash 已废弃)
7. **服务端零知识**:Supabase 后端永远不见 KEK / DEK / master_password / secret_key / device_priv / recovery_seed 明文;**account_commit_seq 只防粗暴回滚不防 equivocation,v2 评估 Merkle root**
6. **回滚 / 调包防护**:每实体单调 revision 写入 AAD;客户端拒收 `revision <= max_seen`;集成测试覆盖恶意 server 拷贝 blob 场景
7. **恢复防护**:PATCH `/auth/me` 必须附 recovery proof(`HMAC(HKDF(DEK, "xai.recovery.proof.v1"), challenge ‖ ...)`),server Argon2id 校验
8. **设备撤销**:撤销 device + revoke refresh_token + **强制 Re-key**(生成 DEK_v2 + 双读 + 原子 swap)
9. **Realtime**:Supabase Realtime **Private Channels + Authorization**;channel 名含 auth.uid(),RLS 校验

### 2.4.1 协议级关键字段(v0.3,详见 sub-prds/sync §6 / §7)

| 字段 | 位置 | 作用 |
|---|---|---|
| `revision BIGINT` | encrypted_blobs + CBOR AAD | 每实体单调,client 提交 proposed_revision = base + 1, server 不重写;防 rollback(FR-SY-68 / C-E) |
| `key_id INTEGER` | envelope + accounts.current_dek_key_id + account_keyring | DEK 版本,Re-key 双读;keyring.can_retire 控制何时可 GC(C-F) |
| `commit_seq BIGINT` | encrypted_blobs(全局 BIGSERIAL,账户级单 cursor 不分 entity_type) | 权威排序与 cursor(H-02/H-04/H-J) |
| `mutation_id UUIDv7` | PUSH request + mutation_dedup(90d GC) | Idempotency(FR-SY-72) |
| `CBOR AAD` | 即时计算,不存 envelope 内 | AEAD 绑定 entity 语境;canonical encoding(FR-SY-67 / C-G / RFC 8949 §4.2) |
| `encryption_device_id BIGINT` | sync_devices + envelope + nonce 高 8B | server 分配 unique per device,作 GCM nonce 高位(C-C) |
| `secret_key_check BYTEA` | accounts | 客户端验 secret_key;auth_password 也含 secret_key(H-L) |
| `recovery_signing_pub BYTEA` | accounts | Ed25519 32B 公钥;PATCH /auth/me 验签;client 直接 UPDATE 被 RLS 禁(FR-SY-69 / C-A / C-B) |
| `device_pub BYTEA` | sync_devices | X25519 32B 公钥;per-device DEK wrap(FR-SY-76 / C-D) |
| `device_dek_wraps` (新表) | server | (account_id, device_id, key_id) → X25519_sealed_box(device_pub, DEK_v_key_id);撤销 device 删行真正排除旧设备(C-D) |
| `current_account_commit_seq` | accounts | 全账户级单调监测,client 持久化 last_seen,检测 server 全量回滚(FR-SY-77 / H-A) |

### 2.5 隐私默认值

- 默认**不上传**任何遥测 / 分析数据
- 默认**关**:崩溃上报(Sentry)、可选诊断数据
- 默认**开**:剪贴板敏感信息过滤、屏幕共享自动隐藏、密码管理器 App 黑名单
- 不引入任何第三方分析 SDK(无 Firebase / Mixpanel / Google Analytics)

---

## 3. 工程化

### 3.1 构建发布管线

#### 3.1.1 桌面 App 构建矩阵

| Target | 命令 | 输出 | 大小预算 |
|---|---|---|---|
| **DMG 完整版**(Apple Silicon) | `pnpm tauri build --target aarch64-apple-darwin --features full` | `XAI_Desktop-vX.Y.Z-arm64.dmg` | ≤ 60 MB |
| **DMG 完整版**(Intel) | `pnpm tauri build --target x86_64-apple-darwin --features full` | `XAI_Desktop-vX.Y.Z-x64.dmg` | ≤ 60 MB |
| **DMG Universal** | `tauri-cli` 自动合并 | `XAI_Desktop-vX.Y.Z-universal.dmg` | ≤ 100 MB |
| **MAS 沙箱版** | `pnpm tauri build --features sandbox -- --bundles app` | `XAI_Desktop.app`(待 MAS 提交) | ≤ 60 MB |

Cargo features 分 `full` / `sandbox`,在 Rust 侧用 `#[cfg(feature = "...")]` 切代码路径。

#### 3.1.2 公证流程(DMG)

```bash
# 1. 构建 + 签名
pnpm tauri build --target universal-apple-darwin

# 2. 公证(notarytool)
xcrun notarytool submit XAI_Desktop-vX.Y.Z-universal.dmg \
  --apple-id "$APPLE_ID" --team-id "$TEAM_ID" \
  --password "$APP_SPECIFIC_PASSWORD" --wait

# 3. 装订(stapler)
xcrun stapler staple XAI_Desktop-vX.Y.Z-universal.dmg

# 4. 验证
xcrun stapler validate XAI_Desktop-vX.Y.Z-universal.dmg
spctl -a -vv -t install XAI_Desktop-vX.Y.Z-universal.dmg
```

公证需要 `Developer ID Application` 证书(Apple Developer Program $99/年)。

#### 3.1.3 MAS 提交流程

1. Distribution profile(MAS 专用,自动通过 Xcode 或 fastlane)
2. `productbuild --component XAI_Desktop.app /Applications --sign "3rd Party Mac Developer Installer: ..."` 生成 .pkg
3. 上传到 App Store Connect(`xcrun altool --upload-app` 或 Transporter)
4. 提交审核(每次首发 + 重大版本)

#### 3.1.4 自动更新(DMG 版)

- 用 `tauri-plugin-updater`
- 更新源:GitHub Releases
- 每次发版:
  ```bash
  pnpm tauri signer sign  # 签 update manifest
  gh release create vX.Y.Z ./dist/*  # 推到 GitHub Releases
  ```
- 客户端检查频率:启动时 + 每天 06:00 本地一次
- 强制更新只在严重安全 fix 时启用(默认允许 skip)

#### 3.1.5 Web 部署

- 前端:Vercel 或 Cloudflare Pages 静态托管(`pnpm --filter @repo/web build`)
- 后端:Supabase(托管 PG + Auth + Storage)
- 域名:暂定 `xai-desktop.app`(主站)/ `app.xai-desktop.app`(Web Console)
- CI:GitHub Actions 部署 web,merge to main 自动发布
- 桌面 App 与 Web 共用一套后端,API 版本号通过 `Accept-Version` header 协商

#### 3.1.6 CI/CD 流水线

| 触发 | 动作 |
|---|---|
| PR 提交 | lint + typecheck + 单测 + cargo test |
| PR merge to main | 上面 + 集成测试 + E2E(快速集) |
| Tag `v*` | 完整 E2E + 真机清单提示 + 构建 DMG + 上传 GitHub Release(草稿) |
| Manual workflow | 公证 + MAS 提交(防误触) |

工具:GitHub Actions(开始就上,不要拖)。

---

### 3.2 外部依赖与服务清单

#### 3.2.1 SaaS 服务

| 服务 | 用途 | 计费层 | v1 月成本估算 | 替代方案 |
|---|---|---|---|---|
| **Supabase** | Auth + Postgres + Storage + Realtime | Free → Pro($25/月,Phase 5 切) | $0(冷启)→ $25(公测后) | 自建 PG + Auth0 |
| **Anthropic Claude API** | AI Cube(Phase 4) | 按调用 | $50~200(预算上限可配) | OpenAI / 本地 Ollama |
| **Open-Meteo** | 天气数据 | 完全免费 | $0 | OpenWeatherMap |
| **Sentry**(opt-in) | 错误上报 | Free(5K events/月) | $0 | 自建 GlitchTip |
| **Vercel / Cloudflare Pages** | Web 前端托管 | Free → Pro | $0~20 | Netlify |
| **GitHub Releases** | DMG 分发 + 更新 manifest | 公开仓库免费 | $0 | 自建 mirror |
| **Apple Developer Program** | DMG 公证 + MAS 上架 | $99/年 | $8.25/月均摊 | 无替代(macOS 必备) |

**v1 GA 前总月成本估算:$15~50/月**(账号刚起来,流量低)
**v1 公测后:$50~250/月**(看用户增长)

#### 3.2.2 npm / Cargo 关键依赖

| 包 | 版本 | 用途 | 替代评估 |
|---|---|---|---|
| `@tauri-apps/api` | 2.x | Tauri 前端 SDK | 无替代 |
| `tauri` | 2.x | Rust 后端 | Electron / Wails(已选 Tauri) |
| `tauri-plugin-sql` | 2.x | SQLite | 自己用 rusqlite |
| `tauri-plugin-updater` | 2.x | 自动更新 | sparkle(更成熟,但需原生集成) |
| `tauri-plugin-global-shortcut` | 2.x | 全局快捷键 | 自己用 carbon hotkey |
| `tauri-plugin-log` | 2.x | 日志 | 自己用 tracing |
| `@dnd-kit/core` | 6.x | 拖拽 | react-dnd |
| `react` / `react-dom` | 19.x | UI | — |
| `vite` | 7.x | 构建 | — |
| `vitest` | 最新稳定 | 单测 | Jest |
| `playwright` | 最新稳定 | E2E | Cypress |
| `@anthropic-ai/sdk` | 最新稳定 | AI Cube(Phase 4) | 自己写 HTTP |
| `cocoa` / `objc2` | 0.24 / 最新 | macOS native | 直接 FFI |
| `tracing` / `thiserror` / `anyhow` | 最新稳定 | Rust 日志 / 错误 | — |
| `serde` / `serde_json` | 最新稳定 | 序列化 | — |
| `argon2` | Rust 实现最新 | 密码哈希 | scrypt(性能略差) |
| `aes-gcm` | RustCrypto 最新 | 对称加密 | ring(更快但更复杂) |

**依赖治理**:每季度跑 `pnpm audit` + `cargo audit`,任何 high/critical CVE 一周内修。

---

### 3.3 编码规范扩充

> SYSTEM_ARCHITECTURE.md §4 已有 12 条架构红线,本节是补**日常编码约定**(不变更架构,但日常 PR 需遵守)。

#### 3.3.1 命名

- 文件:kebab-case(`smart-container.tsx`、`use-grid-system.ts`);例外:React 组件文件可用 PascalCase(团队约定一致即可)
- TS 类型:PascalCase(`GridBox`, `DesktopItem`)
- TS 常量:UPPER_SNAKE(`DEFAULT_GRID_SIZE`)
- TS 函数 / 变量:camelCase
- React 组件:PascalCase
- React hook:`use` 前缀
- Rust 模块 / 文件:snake_case
- Rust 类型:PascalCase
- Rust 函数 / 变量:snake_case
- 事件名:`<plugin>:<action>`(SYSTEM_ARCHITECTURE §6.1)
- DB 表 / 字段:snake_case
- 文档 / ADR 文件:小写 + 短横,`0002-dual-track-release.md`

#### 3.3.2 日志约定

- 级别:`error`(用户可见问题)/ `warn`(异常但已恢复)/ `info`(关键事件)/ `debug`(开发期)/ `trace`(细节)
- 不在生产用 `console.log` / `println!`
- 日志 message 用英文(便于 grep 与跨语言一致)
- 用户内容字段 redact(见 §1.3.1)
- 给 error 加 `error.code`(分级 `E1xxx` 系统 / `E2xxx` 业务 / `E3xxx` 同步 / `E4xxx` AI)

#### 3.3.3 异常 / 错误处理

- Rust 公开 API 返回 `Result<T, AppError>`,内部可用 `anyhow::Result` 收敛
- TS 关键路径用 `Result<T, E>` 风格(`@repo/core/result`),不依赖 try/catch 传播
- 不允许吞 error(必须 log 或返回上游)
- 用户可见错误:友好文案 + 复制错误码 + 一键导出诊断

#### 3.3.4 i18n / 文案

- v1 三语:简体中文 / 繁体 / 英文
- 所有用户可见文案走 i18n 资源文件(`packages/ui/i18n/<lang>.json`),不允许在组件内硬编码中文
- 中文文案首选简体作为源语言,翻译走 AI 辅助 + 人工校
- 日期 / 数字格式按 Intl API 走系统 locale
- v1 不做 RTL(预留接口)

#### 3.3.5 Commit / PR

按 `docs/conventions/COMMIT_CONVENTION.md` 走,本节不重复。

---

## 4. 跨平台抽象(Rust trait 设计)

> v1 仅 macOS,但决策 E 要求 Rust 侧把"窗口能力、剪贴板能力、文件系统能力、通知能力"抽象成 trait 预留 Win/Linux 接口。本节定义这些 trait 的契约。

### 4.1 设计原则

- 所有平台特定调用必须经过 trait
- macOS 实现住在 `src-tauri/src/platform/macos/`,用 `#[cfg(target_os = "macos")]` 隔离
- Win/Linux 实现在 Phase 5+ 添加,目录结构对称
- 业务 commands 只依赖 trait,不直接 import 平台代码

```
src-tauri/src/
├── platform/
│   ├── mod.rs              # pub use traits + platform-specific re-exports
│   ├── traits.rs           # 所有 platform trait 定义
│   ├── macos/
│   │   ├── mod.rs
│   │   ├── window.rs       # impl WindowOps for MacOSWindow
│   │   ├── clipboard.rs    # impl ClipboardOps
│   │   ├── fs.rs           # impl FileSystemOps
│   │   └── notification.rs # impl NotificationOps
│   ├── windows/            # Phase 5+
│   └── linux/              # Phase 5+(Wayland/X11 各一个 sub-impl)
```

### 4.2 核心 traits(契约草图)

```rust
// platform/traits.rs

pub trait WindowOps: Send + Sync {
    fn set_always_on_top(&self, on: bool) -> Result<()>;
    fn set_level_above_desktop(&self) -> Result<()>;          // macOS: setLevel, Win: HWND_TOPMOST 调整
    fn set_ignores_mouse_events(&self, ignore: bool) -> Result<()>;
    fn join_all_spaces(&self) -> Result<()>;                  // macOS only(Win/Linux no-op)
    fn set_visible_in_all_workspaces(&self) -> Result<()>;    // 跨平台命名
    fn capture_state(&self) -> Result<WindowState>;
}

pub trait ClipboardOps: Send + Sync {
    fn current_change_count(&self) -> u64;
    fn read_current(&self) -> Result<ClipboardContent>;
    fn write(&self, content: &ClipboardContent) -> Result<()>;
    fn source_app_bundle_id(&self) -> Option<String>;         // macOS/Win 可拿,Linux 部分
    fn is_screen_being_recorded(&self) -> bool;               // macOS: CGDisplayIsCaptured
}

pub trait FileSystemOps: Send + Sync {
    fn read_metadata(&self, path: &Path) -> Result<FileMetadata>;
    fn icon_for_path(&self, path: &Path) -> Result<Vec<u8>>;  // macOS: NSWorkspace, Win: SHGetFileInfo
    fn watch_directory(&self, path: &Path) -> Result<Receiver<FsEvent>>;
    fn open_with_default_app(&self, path: &Path) -> Result<()>;
    fn reveal_in_file_manager(&self, path: &Path) -> Result<()>;
    fn create_security_scoped_bookmark(&self, path: &Path) -> Result<Vec<u8>>;  // 沙箱版用
}

pub trait NotificationOps: Send + Sync {
    fn send(&self, title: &str, body: &str, options: NotificationOptions) -> Result<()>;
    fn cancel_all(&self) -> Result<()>;
    fn permission_status(&self) -> PermissionStatus;
}

pub trait ShortcutOps: Send + Sync {
    fn register(&mut self, id: &str, key: &str, handler: BoxedHandler) -> Result<()>;
    fn unregister(&mut self, id: &str) -> Result<()>;
    fn list_registered(&self) -> Vec<RegisteredShortcut>;
}
```

### 4.3 平台差异表

| 能力 | macOS | Windows(Phase 5+) | Linux(Phase 5+) |
|---|---|---|---|
| 窗口透明 + click-through | NSWindow + ignoresMouseEvents | WS_EX_LAYERED + WS_EX_TRANSPARENT | X11: XShape;Wayland: 部分受限 |
| 窗口分层置于桌面图标之上 | setLevel(desktop_icon_level + N) | HWND_BOTTOM + 监听 SHELLDLL_DefView | WM-specific |
| 跨工作区/Space 显示 | NSWindowCollectionBehavior.CanJoinAllSpaces | Win10+: NSWindowCollectionBehaviorSticky | Wayland: portal API |
| 全局快捷键 | RegisterEventHotKey + Accessibility 权限 | RegisterHotKey | X11: XGrabKey;Wayland: portal |
| 剪贴板监听 | NSPasteboard.changeCount poll | AddClipboardFormatListener | X11: PRIMARY/CLIPBOARD selection |
| 屏幕共享检测 | CGDisplayIsCaptured | GetCapture / DwmIsCompositionEnabled | 较难,先 stub |
| 文件图标 | NSWorkspace iconForFile | SHGetFileInfo | xdg-mime |
| 通知 | UserNotifications framework | Windows.UI.Notifications | libnotify |

### 4.4 Phase 0 必须做的最小集

> Phase 0 仅 macOS,但 trait **接口本身**要在 Phase 0 定义好,实现先只有 macOS;Win/Linux 留 `unimplemented!()` 占位。这样 Phase 5+ 添加新平台只是补 impl,不动业务代码。

最小集(Phase 0 子阶段 0.2 / 0.3 完成):
- `WindowOps`(完整)
- `FileSystemOps`(完整,含 security-scoped bookmark 给沙箱版)
- `ShortcutOps`(完整)
- `ClipboardOps`(Phase 2 才需要,Phase 0 可不实现,但 trait 先定义)
- `NotificationOps`(Phase 2 才需要,同上)

---

## 5. 文档变更记录

| 日期 | 版本 | 变更 |
|---|---|---|
| 2026-05-14 | v1.0 | 首版,4 章全:验收性能 / 安全隐私 / 工程化 / 跨平台抽象 |

— END —
