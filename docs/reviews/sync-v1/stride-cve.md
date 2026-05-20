# Sync v1 — STRIDE × Trust-Boundary + Crypto-Dependency CVE Review

| 字段 | 值 |
|---|---|
| 评审对象 | `docs/planning/sub-prds/sync/PRD.md` v0.6-DRAFT(端到端加密同步层) |
| 评审方法 | Phoenix Security `security-skills-claude-code` bundle — STRIDE × Trust Boundary + attack-surface enumeration + dependency CVE check |
| 评审者 | Claude (security-review subagent) |
| 评审日期 | 2026-05-14 |
| 知识截止 | 2026-01(密码学依赖版本/CVE 状态以此为准,凡不确定处显式标注并要求 `cargo audit` 复核) |
| 关联 | roadmap-prompts.md §2.0;PRD §2 威胁模型、§3 密钥层级、§11 R-10 |

---

## 0. 执行摘要

PRD v0.6 的威胁模型在 v0.2→v0.6 经历了五轮 codex 硬化,**密码学协议层已相当成熟**:per-device HPKE wrap、deterministic CBOR AAD、单调 revision、Ed25519 recovery proof、server-side nonce lease、用户可验证设备配对 —— 这些都是教科书级的正确选择,大部分 STRIDE Tampering / Spoofing 维度已被显式覆盖。

但本次 STRIDE × 信任边界系统化复盘发现 **PRD 的覆盖偏向 Tampering / Information Disclosure,而 Repudiation 与若干 Elevation-of-Privilege / DoS 维度存在结构性盲点**。最关键的三个 GAP(详见 §2.4)是:

1. **Repudiation 全域近乎空白** —— `sync_audit_log` 由 service_role 写、客户端只读,无密码学不可否认性;恶意服务端可静默篡改或删除审计记录,任何"谁在何时 grant 了哪台设备 / 改了哪个敏感字段"的争议都无法仲裁。STRIDE 的 R 维度对 T1.1 / T8 / T11 几乎没有专门防护层。
2. **设备配对 SAS 通道的 DoS / 社工降级未建模** —— §3.4.1 把 donor 手动确认作为信任锚,但 PRD 未对"攻击者高频注册 fake pending device 淹没真实用户 donor UI(确认疲劳 → 用户盲点)"建模,这是对 C-A 修复的二阶绕过(Tampering+DoS 复合),无对应 R-10 子风险。
3. **依赖供应链的 Elevation-of-Privilege 具体化不足** —— T10 / R-10 只在策略层提 `cargo vet` + sigstore,但 PRD 未锁定 7 个密码学依赖的**具体 crate + 最低版本 + 已知 footgun**(aes-gcm nonce-reuse panic 行为、argon2 参数 vs RFC 9106、hpke crate 的 RFC 9180 成熟度、sqlcipher 商业 keying 陷阱)。这是把"依赖 CVE"作为一次性策略而非持续门禁的 EoP 风险。

整体结论:**协议设计 Tampering 维度 = 强;Repudiation = 弱;DoS = 中等偏弱;依赖治理 = 策略有、工程门禁缺**。建议把下方 §2.4 的 GAP-T*、§3 的依赖锁定表、§4 的映射纳入 roadmap 分解,并在 Phase 4.8 协议硬化准入门追加 Repudiation / 审计完整性验收项。

---

## 1. 信任边界与攻击面枚举

在跑 STRIDE 之前,先固化 Sync 层的信任边界(trust boundary, TB),STRIDE 必须逐边界跑。

```
TB-1  master_password / secret_key 输入  ───┐
TB-2  Rust KeyVault 进程边界 (DEK/device_priv 常驻)
TB-3  JS/plugin ↔ Tauri IPC (key_handle opaque)
TB-4  macOS Keychain (KEK / device_priv / refresh_token / nonce high_water)
TB-5  本机 SQLCipher DB 文件 (静态盘)
TB-6  网络传输 (TLS 1.3 + cert pin)
TB-7  Supabase Postgres + RLS (authenticated/anon role)
TB-8  Supabase Edge Function (service_role,零知识承诺的执行点)
TB-9  Supabase Realtime channel (Private + Authorization)
TB-10 设备配对 SAS/QR 带外通道 (人作为信任锚)
TB-11 备份介质 (Time Machine / iCloud / 冷盘 / 导出文件)
TB-12 依赖供应链 (crates.io / npm / Tauri 自动更新)
```

PRD §2 列了 13 个攻击者(T1, T1.1, T2, T3, T3.5, T3', T4, T5, T6, T7, T8, T9, T10, T11, T12, T13 —— 实际 16 个,任务描述说"9 个"应以 PRD 实际为准)。下方矩阵对 **每个攻击者 × STRIDE 6 维**逐格判定。

---

## 2. STRIDE × 攻击者覆盖矩阵

图例:✅ = PRD 有显式防护层并标 FR/C 编号;➖ = 该维度对此攻击者不适用 / 显式不防护(PRD 已声明);⚠️ = 部分覆盖 / 隐含但未显式建模;❌ **GAP** = 应覆盖但 PRD 缺失或薄弱。

### 2.1 服务端类攻击者 (TB-7 / TB-8)

| 攻击者 | S (Spoofing) | T (Tampering) | R (Repudiation) | I (Info Disclosure) | D (DoS) | E (Elevation) |
|---|---|---|---|---|---|---|
| **T1 拖库(被动只读)** | ➖ | ➖ | ➖ | ✅ 零知识 FR-SY-56~58 + RLS + AES-256-GCM blob;Secret Key FR-SY-73 抗离线字典 | ➖ | ➖ |
| **T1.1 恶意服务端(主动写)** | ✅ AAD 绑定 FR-SY-67;donor 来源绑定 §7.1.2.2 | ✅ revision FR-SY-68 + recovery proof FR-SY-69 + commit_seq 监测 FR-SY-77 + UNIQUE nonce FR-SY-77/C-B | ❌ **GAP-T1** 无审计完整性;server 可静默改/删 sync_audit_log;无 Merkle/hash-chain(v1 显式不做,§2 已承认但仅 v2 议题,无 v1 补偿控制) | ✅ 零知识 | ⚠️ **GAP-D1** server 可拒绝服务/选择性丢 mutation;commit_seq 单调检测能发现回滚但不能区分"恶意 stall";无客户端侧 liveness/canary | ✅ RLS service_role 边界 + Edge Function 白名单校验 |
| **T8 凭据泄漏(service_role/JWT/OAuth)** | ⚠️ 等同 T1.1,但 PRD 未明确"泄漏的 JWT 仍受 device active RLS 限制"对 **stale-but-active JWT** 的窗口 | ✅ 同 T1.1 + 凭据轮换 FR-SY-59 2h 冻结 | ❌ **GAP-T1** 同上;且轮换事件本身无防篡改记录 | ⚠️ JWT 泄漏窗口内可读 metadata(blob 仍密文);PRD 未量化 access_token TTL 与撤销延迟 | ⚠️ 同 GAP-D1 | ✅ RLS + runbook 分级 |

### 2.2 网络/通道类攻击者 (TB-6 / TB-9 / TB-10)

| 攻击者 | S | T | R | I | D | E |
|---|---|---|---|---|---|---|
| **T2 MITM** | ✅ cert pin | ✅ TLS 1.3 + AAD/GCM tag(改 envelope v → tag fail) | ➖ | ✅ 退化仍是密文 blob | ⚠️ **GAP-D2** cert-pin 导致的 pin-mismatch 下客户端行为(硬失败 vs 软降级)未在 PRD 定义;企业 TLS 中间盒场景 §12.3 仅列待办 | ➖ |
| **T7 Realtime 通道窥探** | ✅ Private Channels + Authorization FR-SY-27 | ✅ blob 不进 Realtime FR-SY-28 | ➖ | ✅ 仅 metadata 可见;v0.6 H-12 RLS 含 active device 校验 | ⚠️ 订阅风暴/广播放大无速率建模(见 GAP-D3) | ✅ RLS channel name 含 auth.uid() + active device |
| **T12 Downgrade attack** | ✅ Accept-Version header | ✅ envelope v 经 AAD 间接绑定,改 v → GCM fail;client 拒收 < min_version | ⚠️ 降级尝试未必落审计(取决于 GAP-T1) | ➖ | ➖ | ✅ E3019 |
| **设备配对带外通道 (TB-10)** | ✅ v0.5 C-A 用户可验证 SAS/QR + v0.6 C-B Ed25519 transcript 签名 | ✅ transcript 绑定双 pub hash | ⚠️ donor 确认动作本身无独立审计轨;争议时无法证明"用户是否真的确认过" | ✅ DEK 仅经 HPKE seal 给已验证 pub | ❌ **GAP-T2** **fake-pending-device 洪水 → donor 确认疲劳**:攻击者(持 service_role,等价 T1.1)可高频 INSERT pending device,Realtime 反复弹 donor UI,诱导用户习惯性点确认 → 二阶绕过 C-A。PRD 有 5min timeout 但无频率限制 / 无"未知设备激增"告警 / 无确认疲劳缓解,无对应 R-10 子风险 | ✅ user_confirmed + transcript verify |

### 2.3 终端/本机类攻击者 (TB-1..TB-5)

| 攻击者 | S | T | R | I | D | E |
|---|---|---|---|---|---|---|
| **T3 本机被盗(锁屏)** | ➖ | ➖ | ➖ | ✅ Keychain WhenUnlockedThisDeviceOnly + SQLCipher FR-SY-74 | ➖ | ➖ |
| **T3.5 disk image / 冷盘备份** | ➖ | ➖ | ➖ | ✅ SQLCipher db_key 由 master_password 派生 + FileVault 提示 | ➖ | ➖ |
| **T3' 本机被盗(已解锁登录态)** | ➖ | ➖ | ➖ | ➖ 显式不防护(用户责任) | ➖ | ➖ |
| **T6 恶意 plugin / 同进程** | ✅ Tauri capability allowlist crypto_* | ⚠️ key_handle opaque 防直接读 key,但 PRD 未建模"恶意 plugin 滥用 *合法* key_handle 大量 encrypt/decrypt"(confused deputy) | ❌ **GAP-T3** 无 per-plugin crypto 调用审计;滥用 key_handle 不可追溯到具体 plugin | ✅ DEK 不出 KeyVault FR-SY-75;zeroize FR-SY-10 | ⚠️ 恶意 plugin 可耗尽 KeyVault / 触发海量 Argon2id?未建模本地 DoS | ✅ allowlist 限定 plugin-account/core-data |

### 2.4 用户/流程类攻击者 + 离线/供应链 (TB-11 / TB-12)

| 攻击者 | S | T | R | I | D | E |
|---|---|---|---|---|---|---|
| **T4 忘主密码** | ➖ | ➖ | ➖ | ➖ | ➖ | ➖ 助记词 FR-AC-10(产品代价) |
| **T5 胁迫 (rubber-hose)** | ➖ | ➖ | ➖ | ➖ 显式不防护 | ➖ | ➖ |
| **T9 离线设备返回 (stale)** | ✅ device active RLS | ✅ commit_seq 决胜 + conflict shadow FR-SY-71 30d | ⚠️ loser 被覆盖有 shadow 记录,但"谁覆盖了谁"无签名级证据 | ✅ shadow 含完整 AAD,可恢复 | ⚠️ stale device 大量回放 → 全量 pull 降级 FR-SY-20,但无回放放大攻击建模 | ➖ |
| **T10 / T11 供应链 + 设备撤销后解密** | ✅ T11: per-device wrap + Re-key FR-AC-14/FR-SY-13 | ✅ T10: cargo vet + sigstore(策略层) | ⚠️ Re-key 操作链 c-h 无防篡改审计 | ✅ T11 旧 device 无 wrap | ➖ | ❌ **GAP-T3'(供应链 EoP)** PRD 把依赖治理停在策略层(T10/R-10),**未锁定 7 个密码学依赖的具体 crate/版本/footgun,也未把 `cargo audit` + advisory-DB 作为 CI 持续门禁**。一个被植入后门的 aes-gcm/argon2/hpke 依赖 = 整个零知识承诺直接 EoP。详见 §3 |
| **T13 备份泄漏** | ➖ | ✅ nonce rollback 检测 R-10.18/C-C | ➖ | ✅ SQLCipher + FR-SY-50 加密导出 + WhenUnlocked 不进 iCloud Keychain | ➖ | ➖ |

### 2.5 矩阵汇总:发现的 GAP

| GAP ID | STRIDE 维度 | 影响攻击者 | 简述 | 建议归属 |
|---|---|---|---|---|
| **GAP-T1** | Repudiation | T1.1, T8, T11(Re-key) | 审计日志无密码学完整性;恶意 service_role 可静默改/删 `sync_audit_log`、轮换记录、Re-key 操作链;v1 无 Merkle/hash-chain 补偿 | 新增 R-10.26;Phase 4.8 准入门 |
| **GAP-T2** | Tampering + DoS(复合) | 设备配对通道 / T1.1 | fake-pending-device 洪水 → donor 确认疲劳 → 二阶绕过 C-A 用户验证;无频率限制 / 无激增告警 / 无确认疲劳缓解 | 新增 R-10.27 |
| **GAP-T3'** | Elevation of Privilege | T10(供应链) | 7 个密码学依赖未锁定具体 crate/版本/footgun;`cargo audit` 非 CI 持续门禁 | §3 依赖锁定表 → Phase 0 子阶段 0.3 |
| GAP-T3 | Repudiation / EoP | T6 | 恶意 plugin 滥用合法 key_handle(confused deputy)不可追溯;无 per-plugin crypto 调用审计/配额 | R-10.12 扩展 |
| GAP-D1 | DoS | T1.1, T8 | 恶意 server 选择性丢 mutation / 拖延;commit_seq 检回滚但无 liveness canary | R-10 新增(中) |
| GAP-D2 | DoS | T2 | cert-pin mismatch 下客户端行为未定义;企业 TLS 中间盒仅列 v2 待办 | §7.7 补充 |
| GAP-D3 | DoS | T7 | Realtime 订阅风暴 / 广播放大无速率建模 | FR-SY-62~64 关联 |

> **特别说明(任务要求重点关注 Tampering / Repudiation / EoP)**:Tampering 维度 PRD 覆盖**充分**(AAD/revision/recovery proof/nonce lease/transcript 签名构成完整链)。**Repudiation 是全局最弱维度** —— 整个 §2 威胁模型没有任何攻击者的 R 列有专门防护层,所有"防护层"列都是 Tampering/Disclosure 控制。**EoP 维度**协议内(RLS/Edge Function/KeyVault)很强,但**跨信任边界的 EoP(供应链 TB-12、恶意 plugin TB-3)只有策略没有工程门禁**。

---

## 3. 密码学依赖清单 + CVE / Advisory 状态

> ⚠️ **知识截止声明**:以下版本与 CVE 状态以 2026-01 知识为准。Rust 生态版本演进快,**所有版本号与 advisory 状态必须在落地前用 `cargo audit` + RustSec advisory-db + `cargo deny` + npm `osv-scanner` 复核**。本表的价值是"锁定 crate 选型 + 标注已知 footgun",不是"权威当前版本"。

| # | 用途 (PRD) | 生态 | 推荐 crate / 库 | 截止 2026-01 已知成熟版本 | 已知 CVE / Advisory / Footgun(**重点**) |
|---|---|---|---|---|---|
| 1 | Argon2id KEK + auth_password (FR-SY-73, §3.2) | Rust crate | `argon2`(RustCrypto/password-hashes) | 0.5.x 系列 | 无已知 RUSTSEC 利用级 CVE。**Footgun**:PRD 参数 t=3,m=64MiB,p=4 对桌面合理且符合 RFC 9106 §4 的 memory-constrained profile;但 **auth_password 弱参数 t=1,m=16MiB,p=1 偏低** —— 因前置 HKDF 已混入 128-bit secret_key 故可接受,但必须在设计文档显式论证"弱参数依赖 secret_key 高熵作为补偿",否则审计方会判为弱 KDF。Web/WASM 端 m=64MiB 在低端机 OOM 风险 —— PRD §3.2 已标"Web 单独 benchmark"。建议 pin `argon2` 并在 CI 跑 RFC 9106 测试向量。 |
| 2 | AES-256-GCM blob 加密 (FR-SY-07/08) | Rust crate | `aes-gcm`(RustCrypto/AEADs) | 0.10.x 系列 | RUSTSEC 历史上有过 `aes-gcm` 早期版本(< 0.10)与 `aes`(< 0.7)的实现/timing 类 advisory,**0.10.x 已修**;务必 pin ≥ 当前修复线并以 `cargo audit` 为准。**核心 Footgun(PRD R-10.1/R-10.9 已部分识别)**:① **nonce 复用 = 灾难性**(泄漏 authentication key)—— PRD 用 server-side nonce lease + UNIQUE 约束 + Keychain high_water + 强制 2^32 Re-key 缓解,设计正确;实现时严禁 JS 侧构造 nonce(PRD 已规定 Rust KeyVault 独占)。② **非 key-committing(Invisible Salamanders)** —— PRD R-10.9 显式 v1 不防护,Re-key 期间风险已登记,v2 评估 AES-GCM-SIV(RFC 8452,Rust `aes-gcm-siv` crate)或 plaintext 头部 commitment HMAC。**建议 v1 补偿**:即便不做 SIV,在 AAD 里已绑定 key_id(已做),可考虑在 plaintext 前缀加一个 `HMAC(DEK, "commit"||entity_id)` 32B commitment 作为低成本 key-commitment,堵 Re-key 窗口 —— 这是对 R-10.9 的可选 v1 加固建议。 |
| 3 | X25519 (device key, §3.1) | Rust crate | `x25519-dalek` | 2.x 系列 | `x25519-dalek` / `curve25519-dalek` 历史有过 timing-side-channel RUSTSEC advisory(curve25519-dalek < 4.x 的某些版本);**务必 pin curve25519-dalek ≥ 4 修复线**并 `cargo audit`。**Footgun**:contributory behavior / 全零公钥小子群点 —— `x25519-dalek` 2.x 已按 RFC 7748 处理,但 PRD 应在 §3.4.1 显式要求"收到的 device_pub 做有效性检查(拒绝全零/低阶点)"。HPKE 库通常已内置此检查(见 #5)。 |
| 4 | Ed25519 (recovery proof, FR-SY-69) | Rust crate | `ed25519-dalek` | 2.x 系列 | **重要 CVE**:`ed25519-dalek` < 2.0 存在 **"Chalkias double-pubkey oracle / signature malleability"** 类 advisory(RUSTSEC-2022-0093,签名 API 误用导致私钥泄漏风险);**必须用 2.x 且使用 `verify_strict`**。**Footgun**:Ed25519 的 cofactored vs cofactorless 验证差异 + malleability —— PRD recovery proof 是安全关键路径(改敏感字段全靠它),Edge Function 端如果用 JS/Deno 验证需选用经审计的库并启用 strict verification;PRD 应在 FR-SY-69 验收标准明确"verify_strict / RFC 8032 严格模式"。 |
| 5 | HPKE per-device DEK wrap (FR-SY-76, §3.4.1) | Rust crate | `hpke`(rozbb/hpke-rs)或 `hpke-rs` | 0.1x / 评估期 | **成熟度警示**:HPKE = **RFC 9180(已正式 RFC,2022 发布,标准本身成熟)**;但 Rust 生态实现(`hpke` / `hpke-rs`)相对年轻、审计覆盖不及 libsodium 的 sealed_box。PRD §3.3 step 6 措辞"sealed_box / HPKE 模式"含糊 —— **必须二选一并固化**:推荐 **HPKE Base mode (RFC 9180), DHKEM(X25519, HKDF-SHA256) + HKDF-SHA256 + AES-256-GCM**(PRD FR-SY-76 已写此组合,正确)。**Footgun**:① HPKE 的 `info` 与 `aad` 区别 —— PRD H-5 已正确区分(info=域分离,aad=wrap metadata),保持;② 选定 crate 后 pin 版本 + `cargo audit` + 跑 RFC 9180 测试向量进 Phase 4.8 准入门;③ 若 Rust HPKE crate 成熟度顾虑过高,fallback 可用经长期审计的 libsodium `crypto_box_seal`(等价 sealed box),但会牺牲 RFC 9180 的 info/aad 上下文绑定 —— 不推荐降级。 |
| 6 | SQLCipher 本地库加密 (FR-SY-74, §3.7) | Rust crate(FFI) | `rusqlite` + `sqlcipher`/`bundled-sqlcipher` feature,底层 SQLCipher 4(Zetetic) | rusqlite 0.3x;SQLCipher 4.5+ | **License Pitfall(重点)**:SQLCipher 社区版 = **BSD 风格(可商用)**,但 **SQLCipher Commercial/Enterprise** 是 Zetetic 商业授权 —— 双轨发布(ADR-0002 沙箱/非沙箱)若打包 SQLCipher 二进制,需确认走的是社区版且 license 合规进入 NOTICE。**Keying Footgun**:① PRD 用 `PRAGMA key = "x'<hex>'"` raw key 模式(正确,跳过 PBKDF2 二次派生,因 db_key 已是 HKDF 高熵);② **必须 `PRAGMA cipher_compatibility = 4`**(PRD 已写),否则跨 SQLCipher 版本默认参数漂移会导致旧库打不开;③ **SQLCipher 4 默认 = AES-256-CBC + HMAC-SHA512,非 GCM**(PRD H-K 已修正原 v0.2 错误,正确);④ raw key PRAGMA 走字符串拼接 —— 实现必须防 hex 注入(用参数化或严格 32B hex 校验)。无已知利用级 CVE 影响 4.5+,但 SQLite 本体 CVE 会传导 —— `cargo audit` 对 bundled SQLite 版本同样适用。 |
| 7 | Supabase Rust client (core-data REST driver) | Rust crate / 自研 HTTP | `postgrest-rs` / `supabase-rs`(社区)或自研 `reqwest` 薄封装 | 社区 crate 不成熟 | **成熟度/供应链警示(重点)**:截止 2026-01,**Supabase 官方 Rust SDK 不成熟**,社区 `supabase-rs` / `postgrest-rs` 维护活跃度与审计覆盖远不及 supabase-js。**建议**:core-data REST driver **不依赖低活跃社区 crate,改为基于 `reqwest`(经审计、广泛使用)自研薄封装**,把信任面收敛到 reqwest + serde + rustls。Realtime 走 WebSocket(`tokio-tungstenite`)。所有这些进 §3 依赖锁定 + `cargo deny` 许可证/来源白名单。**Footgun**:rustls vs native-tls —— cert pinning(T2)实现需选定 TLS 栈,推荐 `rustls` + 自定义 `ServerCertVerifier` 做 pin,PRD §2 T2 "cert pinning" 缺实现层规格,建议补 ADR。 |

### 3.1 依赖治理建议(回应 GAP-T3')

PRD T10 / R-10 把供应链停在"cargo vet + sigstore + dependency-review-action"策略层。**建议升级为可执行门禁**,纳入 Phase 0 子阶段 0.3 准入:

1. `Cargo.toml` **精确 pin** 上述 7 类依赖到具体版本(`=x.y.z` 或 lockfile + `--locked` CI)。
2. CI 强制 `cargo audit`(RustSec advisory-db)+ `cargo deny`(许可证白名单含 SQLCipher 社区版判定 + 来源白名单)+ npm 侧 `osv-scanner`,**任一 advisory = 阻断合并**。
3. 三类安全关键 crate(`aes-gcm` / `ed25519-dalek` verify_strict / HPKE)在 Phase 4.8 协议硬化准入门**跑官方 RFC 测试向量**(RFC 9106 / RFC 8032 / RFC 9180 / RFC 8949),与已有 CBOR 测试向量(R-10.17)同一门禁。
4. `ed25519-dalek` 必须 ≥ 2.x 且代码层强制 `verify_strict`(对应历史 RUSTSEC-2022-0093 类风险)。
5. 把"依赖 CVE 复核"做成 **季度例行 + 每次依赖 bump 触发**,与凭据轮换 SOP(FR-SY-59)同级别 runbook 化。

---

## 4. 威胁 → Sync 功能区缓解映射(供 roadmap 分解)

下表把每个 PRD 攻击者映射到具体 Sync 功能区,**新增列标注本评审发现的 GAP 应补的功能**。功能区缩写:KDF=密钥派生;KEK/DEK=KEK/DEK 分层;NONCE=AES-GCM nonce 管理;HPKE=per-device wrap;ED=Ed25519 recovery;RT=Realtime 通道安全;RLS=行级安全;ROT=凭据轮换;REH=恢复演练;AUD=审计完整性(**新**);PAIR=设备配对防滥用(**新**);SUPPLY=依赖门禁(**新**)。

| 攻击者 | PRD 既有缓解功能区 | 关键 FR / C / R | 本评审建议补充(GAP) |
|---|---|---|---|
| T1 拖库被动 | KDF(Argon2id+secret_key)、KEK/DEK、RLS、零知识 | FR-SY-56~58/73, R-10.7 | — |
| T1.1 恶意服务端写 | HPKE(AAD 绑定)、NONCE(revision)、ED(recovery proof)、commit_seq 监测 | FR-SY-67/68/69/76/77, C-A/B/E | **AUD**: GAP-T1 审计完整性(hash-chain/Merkle v1 补偿或至少 append-only + 客户端本地审计镜像比对) |
| T2 MITM | TLS 1.3 + cert pin、AAD/GCM tag | §2 T2, FR-SY-08 | **GAP-D2**: cert-pin mismatch 客户端行为规格 + 企业中间盒决策(补 ADR) |
| T3 / T3.5 / T13 本机/备份 | SQLCipher(db_key←KEK)、Keychain ACL、加密导出 | FR-SY-74/50, R-10.10/18 | SUPPLY: SQLCipher license 合规 + raw-key hex 注入防护 |
| T3' 已登录被盗 | 显式不防护(用户教育) | §2 T3' | — |
| T4 / T5 忘密码/胁迫 | 助记词恢复 / 显式不防护 | FR-AC-09/10, R-10.2 | — |
| T6 恶意 plugin | KEK/DEK(KeyVault)、IPC allowlist、zeroize | FR-SY-75/10, R-10.12 | **GAP-T3**: per-plugin crypto 调用审计 + key_handle 使用配额(confused-deputy) |
| T7 Realtime 窥探 | RT(Private Channel + Authorization + active device RLS) | FR-SY-27/28, H-12 | **GAP-D3**: Realtime 订阅/广播速率建模(关联 FR-SY-62~64) |
| T8 凭据泄漏 | ROT(2h 冻结)、RLS、runbook | FR-SY-59/60, R-10.8 | **AUD**: 轮换事件防篡改记录;量化 access_token TTL + 撤销延迟窗口 |
| T9 stale device | NONCE(commit_seq 决胜)、conflict shadow | FR-SY-20/71, R-10.3/20 | 回放放大攻击建模(中优先) |
| T10 供应链 | SUPPLY(cargo vet+sigstore 策略) | §2 T10, R-10 | **GAP-T3'**: §3.1 依赖锁定表 + cargo audit/deny CI 门禁 + RFC 测试向量准入门 |
| T11 设备撤销后解密 | HPKE(per-device wrap)、KEK/DEK Re-key、REH | FR-AC-14/FR-SY-13/76, R-10.11/19/22/25 | **GAP-T2**: PAIR fake-pending-device 洪水 → 确认疲劳缓解(频率限制+激增告警);Re-key 操作链 AUD |
| T12 Downgrade | 版本协商、envelope v 经 AAD 绑定 | §7.7, FR-SY-08, R-10.13 | 降级尝试落审计(依赖 GAP-T1 修复) |

### 4.1 roadmap 分解建议(优先级)

- **P0(进 Phase 0 子阶段 0.3 / Phase 4.8 准入门)**:GAP-T3'(依赖锁定表 + cargo audit/deny CI + RFC 向量门禁)。这是最低成本、最高杠杆的加固,且不改协议。
- **P0(进 Phase 4.8 准入门 + 新增 R-10.26)**:GAP-T1 审计完整性 —— 至少 append-only `sync_audit_log` + 客户端本地保留审计镜像并在 PULL 时做"账户级审计条目数/最后哈希"一致性校验(轻量,类比 FR-SY-77 commit_seq 单调监测的思路,可复用同款"server 回滚检测"模式)。完整 Merkle 留 v2(§12.3 C-03 已列)。
- **P1(新增 R-10.27)**:GAP-T2 设备配对防滥用 —— pending device 注册频率限制 + "短时间多个未知设备"告警 + donor UI 反确认疲劳(显示历史确认次数 / 强制阅读 fingerprint)。
- **P1**:GAP-T3 per-plugin crypto 审计(扩展 R-10.12);GAP-D2 cert-pin 行为 ADR。
- **P2**:GAP-D1 / GAP-D3 DoS / liveness canary;回放放大建模。

---

## 5. 附:PRD 已做得好的地方(避免误读为全是问题)

- Tampering 链条完整且经五轮硬化:AAD(CBOR canonical)→ revision → recovery proof(完整 payload binding,修了字段级 hash 绕过)→ nonce lease + UNIQUE → transcript Ed25519 签名 → commit_seq 单调监测。这是同步类产品里少见的严谨度。
- 把 device key 从 KEK 派生改为本地 CSPRNG 独立生成(C-A/R-10.19),是关键的正确修复,堵死"旧设备算出新设备私钥"。
- 设备配对从"自动 grant"改为"用户可验证 SAS/QR + transcript 签名"(C-A v0.5 / C-B v0.6),对标 Signal/1Password,方向正确 —— GAP-T2 只是其二阶绕过,不否定该设计。
- 显式不防护项(T3'/T5/社工/Invisible Salamanders v1)都诚实登记并要求 v2 跟踪,符合威胁建模最佳实践。
- nonce 管理三端统一为 server-side lease + UNIQUE 最后防线,是对 GCM 最大 footgun 的扎实工程化。

---

## 6. 结论

PRD v0.6 的密码学**协议设计成熟度高**,Tampering / Information Disclosure 维度覆盖充分。本次 STRIDE × 信任边界系统化复盘的核心产出是三个结构性 GAP:**(1) Repudiation 维度全域薄弱(无审计完整性),(2) 设备配对的确认疲劳二阶绕过未建模,(3) 密码学依赖治理停在策略层、缺工程门禁**。三者均不要求重构协议,可作为 roadmap 增量项纳入 Phase 0.3 / Phase 4.8 准入门与 R-10 子风险表扩展。依赖侧 7 个 crate 的选型与 footgun 已在 §3 锁定,但所有版本/CVE 状态须以落地时 `cargo audit` + RustSec advisory-db 复核为准(知识截止 2026-01)。
