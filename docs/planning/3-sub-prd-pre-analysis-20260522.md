# 3 子 PRD 架构预梳理 (Handoff 版) — 2026-05-22

| 字段 | 值 |
|---|---|
| 作者 | Claude (skill-workflow-router pre-analysis, task-mode) |
| 触发输入 | 用户提议 "PRD 三个大功能 → 切 3 长期分支并行开发" |
| 决策 | 不切长期分支;**用现役 roadmap manifest 继续推进** (不是建新 manifest) |
| 仓库当前状态 (2026-05-22) | main = `9f0173f`, 仅 main 一个本地分支, 远程仅 main + 2 个 wt-* |
| 触及 input 数 | 1 主 PRD + 3 sub-PRD/dev-plan 集 + 3 execution gate + 1 ADR + 6 plugin dev_log + 现役 2 个 roadmap manifest + PLUGIN_MAP + sub-prds/roadmap-prompts.md + usage-guide.md |
| 范围 | 只读分析;无代码改动;无 dev_log 写入;不 dispatch V2 agent |
| 用途 | **后续交接到新 session / 新人时的入门 + 决策依据** |

---

## 0. 给接手人 — 项目背景 + 关键文档地图

### 0.1 项目极简介

**XAI_Desktop** 是 macOS 透明桌面 overlay + AI Smart Container,Tauri 2 + React 19 + pnpm Turborepo monorepo。架构:

- **Host** (`apps/desktop/src/`): Tauri shell — 只做 routing / providers / window 壳,零业务逻辑
- **Core** (`packages/core/`): 基础设施 + types + typed events + PluginRegistry,零业务逻辑
- **Plugins** (`packages/plugin-*/`): 业务逻辑全在这,跨 plugin 通过 `@repo/core/events` 通信
- **Rust backend** (`apps/desktop/src-tauri/`): commands + macOS platform adapters

子 PRD 体系 (主 PRD `docs/planning/2026-05-12-PRD-v1.md` 顶部 line 7 明确):

> 子 PRD = `sub-prds/console/PRD.md` · `sub-prds/web/PRD.md` · `sub-prds/sync/PRD.md`(2026-05-14 起,本主 PRD 退为"产品总览 + 16 模块索引",深度规格分到子 PRD)

### 0.2 Workflow V2 三层心智模型

`docs/workflow/project/usage-guide.md:32` 定义了 3 层驱动方式:

| Level | 输入 | 编排者 | 何时用 |
|---|---|---|---|
| Level 1 手动 subagent | `Start the feature-plan agent...` | 你逐步派发 worker | 完全掌控、调试、BLOCKED 恢复 |
| Level 2 单 feature skill | `/xai-feature-full-loop` | parent session 直接派发 worker | 一个 feature 从需求跑到 READY_TO_SHIP |
| Level 3 roadmap skill | `/xai-roadmap-loop` | manifest + wave 编排 | 一份 PRD/roadmap 拆成多个 feature 按依赖推进 |

**状态文件永远是** `packages/<feature>/docs/dev_log.md`。`<feature>` 通常是完整 plugin slug,例如 `packages/plugin-organizer/docs/dev_log.md`。

### 0.3 接手人必读文档清单

按依赖顺序读:

| # | 文档 | 用途 |
|---|---|---|
| 1 | [CLAUDE.md](CLAUDE.md) | 项目工作指南 (Workflow V2 调用约定) |
| 2 | [docs/SYSTEM_ARCHITECTURE.md](docs/SYSTEM_ARCHITECTURE.md) | 系统宪法 — 12 条编码红线 |
| 3 | [docs/PLUGIN_MAP.md](docs/PLUGIN_MAP.md) | 全局状态机 — 所有 plugin 真实依赖状态 (任何工作前先查) |
| 4 | [docs/workflow/project/usage-guide.md](docs/workflow/project/usage-guide.md) | XAI 实例 workflow 使用教程 (656 lines) |
| 5 | [docs/adr/0006-web-face-hybrid-reuse-boundary.md](docs/adr/0006-web-face-hybrid-reuse-boundary.md) | Web 混合复用边界 (ADR 治理 ADR-0003) |
| 6 | 子 PRD 三件套 | [console/PRD](docs/planning/sub-prds/console/PRD.md) + [web/PRD](docs/planning/sub-prds/web/PRD.md) + [sync/PRD](docs/planning/sub-prds/sync/PRD.md) |
| 7 | [docs/planning/sub-prds/roadmap-prompts.md](docs/planning/sub-prds/roadmap-prompts.md) | 当前权威 roadmap 入口 (覆盖 G0-G10 路径) |
| 8 | [docs/planning/execution/README.md](docs/planning/execution/README.md) + G0-G10 | 执行包 (gate-by-gate) |
| 9 | 现役 roadmap manifest | [sync-v1.md](docs/workflow/roadmap/sync-v1.md) + [web-ticktick-parity.md](docs/workflow/roadmap/web-ticktick-parity.md) |
| 10 | 各 plugin dev_log | `packages/plugin-*/docs/dev_log.md` (每个的 Status Panel 是真相) |

### 0.4 关键约束 (编码红线摘要 — 详 `docs/SYSTEM_ARCHITECTURE.md`)

- 业务逻辑 → `packages/plugin-*/`,**绝不在** `apps/desktop/src/`
- Plugin 间通信 → `@repo/core/events`,**绝不**直接 import 另一个 plugin internal
- `index.ts` 是 Plugin 唯一公开 surface,**绝不**从 `plugin-*/src/internal/` 引用
- Host depends on Plugin/Core only; Plugin depends on Core only; **绝不反向**
- 涉及多窗口/Tauri command/macOS native 的改动,**ship 前必须真机验证**

---

## 0.5 ⚠️ 项目当前真实状态 (核心: 推翻"3 个并行 roadmap" 旧认知)

**用户最初问的"是不是切 3 个长期分支独立开发"对应了一个早期想法**:用 3 个并行 roadmap (sync / console / web) 分别推进。但项目在 2026-05-19 后已经改向。请接手人**必须**了解:

### 0.5.1 `sub-prds/roadmap-prompts.md` (2026-05-19) 明确废弃了 3 个并行 roadmap

引用原文 lines 7-15:

> 本文件不再把 v1 拆成 Sync、Console、Web 三条平行 roadmap。当前权威工程入口已经变为:
> - `docs/planning/execution/README.md`
> - `docs/planning/execution/G0-window-spike.md`
> - `docs/planning/execution/G1-native-foundation.md`
> - `docs/planning/execution/G2-data-security-foundation.md`
> - `docs/planning/BACKLOG-v1.md`
> - `docs/contracts/README.md`
> - `docs/workflow/project/usage-guide.md`

### 0.5.2 但是 `usage-guide.md §8` 又说要走 3 个 roadmap (drift!)

`docs/workflow/project/usage-guide.md:338-362` 写:

> XAI 当前有专门的子 PRD roadmap prompt 集: `docs/planning/sub-prds/roadmap-prompts.md`
> 它覆盖: Sync roadmap · Console roadmap · Web roadmap
> 使用顺序: Sync init + review + run waves + ship → Console init + ... → Web init + ...

**这跟 roadmap-prompts.md 顶部声明矛盾。** 接手人需要知道:**真实在跑的是 G0-G10 execution + 现役 2 个 manifest (sync-v1 + web-ticktick-parity),不是 3 个独立 sub-PRD roadmap。**

### 0.5.3 现役 roadmap manifest 真实状态

**sync-v1.md** ([docs/workflow/roadmap/sync-v1.md](docs/workflow/roadmap/sync-v1.md), 2026-05-14 起跑,29+ 个 row Shipped):
- W0-W3 共 **29 个包 Shipped** (crypto / KDF / envelope / KeyVault / HPKE / Ed25519 / SQLCipher / commit-seq / RLS / nonce-lease / push/pull engine / Edge functions / Re-key / RFC vectors / RLS fuzz / audit log)
- 数十条 deferred gates 在 [sync-v1.deferred-gates.md](docs/workflow/roadmap/sync-v1.deferred-gates.md) 待跑
- **BLOCKED_EXTERNAL**: `supabase-project-provisioning` (#9) + `apple-developer-account` (#10)
- **BLOCKED**: `tla-protocol-model` (#33, 缺 JRE)
- 剩 Phase 5 完善: Realtime 全 entity / outbox flush / 设备登出 UI / quota / 数据导出 / 账号删除 / fuzz 24h / 4 演练

**web-ticktick-parity.md** ([docs/workflow/roadmap/web-ticktick-parity.md](docs/workflow/roadmap/web-ticktick-parity.md), 2026-05-21 起跑,25 个 row,**9 个 SHIPPED**):

| # | Slug | Status |
|---|---|---|
| 1 | web-architecture-adr-lite | SHIPPED (2026-05-21) |
| 2 | web-plugin-map-contract-reconcile | SHIPPED |
| 3 | web-sync-crypto-contract-preflight | SHIPPED |
| 4 | web-external-env-provisioning | BLOCKED_EXTERNAL (domains/DNS/Vercel/OAuth secrets) |
| 5 | web-release-site-archive-vite-shell | SHIPPED |
| 6 | web-auth-device-session | SHIPPED |
| 7 | web-browser-e2e-crypto-runtime | SHIPPED |
| 8 | web-sync-blob-driver | PENDING (W4 — `@repo/core-data driver-sync-blob`) |
| 9 | web-encrypted-indexeddb-cache | SHIPPED (2026-05-22) |
| 10 | web-console-host-router | SHIPPED (2026-05-22) |
| 11 | web-todo-first-slice | SHIPPED (2026-05-22) |
| 12 | web-realtime-metadata-sync | PENDING (W8) |
| 13 | web-offline-outbox-conflicts | PENDING (W9) |
| 14 | web-productivity-habits-pomodoro | PENDING (W9) |
| 15 | web-project-label-calendar | PENDING (W9) |
| 16 | web-search-keyboard-theme | PENDING (W10) |
| 17 | web-statistics-views | PENDING (W10) |
| 18 | web-responsive-mobile | PENDING (W10) |
| 19 | web-device-management-revoke | PENDING (W10) |
| 20 | web-security-csp-sentry | PENDING → 实际近期 commits 显示已接近 ship (`568e557 docs(web-security-csp-sentry): mark workflow shipped state`) |
| 21 | web-export-delete-privacy | PENDING (W11) |
| 22 | web-pwa-sw-release | PENDING (W11) |
| 23 | web-i18n-seo-landing | PENDING (W11) |
| 24 | web-deploy-ci-browser-matrix | PENDING (W12) |
| 25 | web-ga-acceptance-suite | PENDING (W13, exit gate) |

→ **Web 不是 "0% 实现"**,而是已在 W4 节点附近 (driver-sync-blob 待开始, security-csp-sentry 接近 ship)。

**Console**: **没有独立 roadmap manifest**。走 plugin-by-plugin 的 manual workflow:
- `plugin-console` 已 SHIPPED 2026-05-21 ([dev_log](packages/plugin-console/docs/dev_log.md) 全 5 phase 完成)
- 业务 plugin (productivity/labels/project/calendar) 由 "Track B Codex worker" 在 2026-05-20 做完 READY_FOR_VERIFY
- PLUGIN_MAP 全局状态仍 In-Dev (drift,详 §2.4)

### 0.5.4 接手人应该如何看待这次预梳理

本报告**不是**新建一份并行 roadmap manifest 的提议。本报告的实际用途:

1. **盘点当前 3 个子 PRD 涉及的 unit 实际在跑到哪里**
2. **找出 drift / 矛盾** (usage-guide vs roadmap-prompts、dev_log vs PLUGIN_MAP)
3. **画出剩余工作的依赖图,作为 G2-G10 路径推进的辅助参考**
4. **不替代** G0-G10 execution + sync-v1.md + web-ticktick-parity.md 这些权威工程入口

---

## 1. 3 子 PRD 范围摘要

### 1.1 console — Console 桌面壳

| 项 | 值 |
|---|---|
| PRD 路径 | [docs/planning/sub-prds/console/PRD.md](docs/planning/sub-prds/console/PRD.md) |
| 版本/状态 | v0.2-rev1-DRAFT (2026-05-16) — 已通过两轮审查 (REVIEW-2026-05-15.md C/M/m + Codex 二轮 5 项全修) |
| dev-plan | [docs/planning/sub-prds/console/dev-plan.md](docs/planning/sub-prds/console/dev-plan.md) — 5 周拆解 (W1-W5) |
| 执行 gate | [G5-console-project](docs/planning/execution/G5-console-project.md) Phase 2.5, 4-6 周 |
| 主 PRD 章节 | §5.13 / §10.6 |
| Phase 归属 | **Phase 2.5** (M2 → M3 之间) |
| FR 数量 | 145 条 (P0-Shell ~70 / P0-View ~30 / P0-Project ~8 / P1-Phase3 ~30 / P2-Later ~7) |
| 当前实施 | plugin-console SHIPPED 2026-05-21;5 phase 全过 |
| 涉及 unit | plugin-console (主), plugin-project, plugin-productivity, plugin-labels, plugin-calendar (灰显占位), plugin-widgets/进度条 |

**核心交付**: 三栏 Console 窗口 (Sidebar + List + Detail) + Cmd+K 全局搜索 + 通知中心 + 设置容器壳 + 主题/密度/i18n + Console ↔ overlay 实时一致 + 跨窗口脚本 X-01~X-06。

### 1.2 web — Web Console (浏览器面)

| 项 | 值 |
|---|---|
| PRD 路径 | [docs/planning/sub-prds/web/PRD.md](docs/planning/sub-prds/web/PRD.md) |
| 版本/状态 | v0.3-DRAFT (2026-05-16) |
| dev-plan | [docs/planning/sub-prds/web/dev-plan.md](docs/planning/sub-prds/web/dev-plan.md) — Phase 4.5a + 4.5b = **8 周 (worst 10)** |
| 执行 gate | [G8-web-console](docs/planning/execution/G8-web-console.md) 8-10 周 |
| 现役 manifest | [web-ticktick-parity.md](docs/workflow/roadmap/web-ticktick-parity.md) 25 row, 9 SHIPPED |
| 主 PRD 章节 | §5.15 / §10.6 |
| Phase 归属 | **Phase 4.5** (Phase 4 AI 之后, Phase 5 公测之前) |
| 治理 ADR | **[ADR-0006: Web 混合复用边界](docs/adr/0006-web-face-hybrid-reuse-boundary.md)** (Accepted 2026-05-21) — 收窄 ADR-0003,Web 允许独立 host shell + view layer,但**必须共享** `@repo/core` / `@repo/core-data` 契约 / Sync blob protocol / Console PRD IA |
| 涉及 unit | apps/web (Next.js → Vite 重写), 全部 plugin 在浏览器 host 下的 WebView, packages/core-data 的 Sync blob driver, Supabase 后端 |

**核心交付** (v0.3 重写): Vite SPA host shell + PKCE OAuth + Supabase 自定义 storage (IDB + AES-GCM) + 自建 devices/sessions 表 + X-Device-Id middleware + Sync blob driver + IndexedDB 三层加密存储 (entity_blobs / entity_index / entity_sort_keys) + Worker FTS + Realtime metadata seq + 主密码 Argon2id WASM + 三方 diff 冲突 UI + Service Worker + PWA + CSP enforce + Sentry redact + 真机矩阵 (5 浏览器)。

### 1.3 sync — 账号 + 端到端同步

| 项 | 值 |
|---|---|
| PRD 路径 | [docs/planning/sub-prds/sync/PRD.md](docs/planning/sub-prds/sync/PRD.md) |
| 版本/状态 | v0.6-DRAFT (2026-05-16) — 经历 **5 轮协议硬化** (v0.2~v0.6),Critical/High 全数关闭 |
| dev-plan | [docs/planning/sub-prds/sync/dev-plan.md](docs/planning/sub-prds/sync/dev-plan.md) — 三阶段 |
| 执行 gate | [G9-sync-hardening-beta](docs/planning/execution/G9-sync-hardening-beta.md) 6-7 周 |
| 现役 manifest | [sync-v1.md](docs/workflow/roadmap/sync-v1.md) (29+ row Shipped) + [sync-v1.deferred-gates.md](docs/workflow/roadmap/sync-v1.deferred-gates.md) |
| 主 PRD 章节 | §5.9 |
| Phase 归属 | **Phase 0.3 骨架 (18-24 工日)** + **Phase 4.8 协议硬化 (3-4 周, TLA+/property tests 前置)** + **Phase 5 完善 (6-7 周)** |
| 涉及 unit | plugin-account (主), packages/core-data (REST/Sync blob driver), Supabase backend, 30+ Shipped crypto/sync 包 (PLUGIN_MAP §"Roadmap / CI Gate Anchors") |

**核心交付**: Argon2id KEK + 24 词 BIP-39 + Secret Key + AES-256-GCM with AAD + deterministic nonce + Envelope codec + HPKE per-device wrap + Ed25519 recovery proof + SQLCipher + commit_seq 全局 cursor + conditional write + mutation idempotency + Realtime private channel + Re-key 两阶段 + RLS fuzz + TLA+ 协议模型 + 4 个恢复演练。

---

## 2. 当前实现度切分 (Shipped / In-Dev / Planned / drift)

数据源: [docs/PLUGIN_MAP.md](docs/PLUGIN_MAP.md) (2026-05-21 更新) + 6 个相关 plugin 的 dev_log.md + 2 个现役 manifest。

### 2.1 sync 子 PRD 的实现度

**Roadmap Anchors (W0-W3 共 29 个 Shipped,大多带 deferred gate)**:

| Slug | 描述 | 来源 wave | 主要 deferred gate |
|---|---|---|---|
| crypto-deps-lockdown | 7 crypto deps exact-pin + CI gate | W0 | (none material) |
| kdf-primitives | Argon2id KEK/auth_password + HKDF | W0 | independent verify + release bench |
| aes-gcm-aead-core | AES-256-GCM + AAD + detached tag | W0 | release-mode <0.5ms encrypt 1KB P95 |
| deterministic-cbor-aad | deterministic CBOR AAD schemas | W0 | JS/Python cross-impl vector + blob-swap integration |
| bip39-mnemonic-24w | 24 词 BIP-39 active DEK 备份 | W0 | formal independent review (admit gate for #37) |
| cipher-envelope-codec | binary envelope codec + nonce 重建 | W0 | full cargo-fuzz 24h (scoped to #47) |
| rust-keyvault-opaque-handle | Rust in-memory KeyVault, u32 handle | W1 | independent verify + capability allowlist enforcement |
| x25519-device-keypair | 本地 CSPRNG X25519 device key | W1 | real macOS Keychain ACL on signed build + Supabase device_pub upload |
| hpke-per-device-wrap | HPKE Base mode per-device DEK wrap | W1 | RFC 9180 vectors + device_dek_wraps write integration |
| ed25519-recovery-signing | DEK 派生 Ed25519 recovery proof | W1 | RFC 8032 vectors + Edge Function verify integration + re-key recovery pub ceremony |
| sqlcipher-local-db | SQLCipher KEK-derived db_key | W1 | SQLite dump PoC + sqlcipher CLI compatibility + repository migration (in #20) |
| account-signup-login | plugin-account signup/login/refresh | W1 | Real Supabase signup E2E + Tauri crypto wiring + signed Keychain ACL + UI re-login |
| menubar-sync-status-icon | 四态托盘图标 adapter | W1 | Real macOS visual/click validation |
| crypto-tauri-commands | Tauri crypto_* + KeyVault opaque handle + window allowlist | W1 | Live CryptoCommandState + capability integration test from allowed/denied windows |
| core-data-sqlite-driver | @repo/core-data SQLite driver boundary | W1 | Bind to Rust SQLCipher (#16) + copied-file PoC + entity/outbox schema |
| commit-seq-authority | global commit_seq RPC SECURITY DEFINER | W2 | Supabase deploy + Edge service_role transaction + client pull rollback monitor |
| realtime-private-channel-config | Realtime private channel + RLS | W1 | Live Realtime deploy + cross-account negative test |
| rls-policies-and-tests | Docker-backed Vitest RLS harness | W2 | Live Supabase hosted run |
| nonce-lease-server | nonce lease RPC + used_nonces ledger | W2 | Live Supabase deploy + Edge E3027/E3029/E3030 mapping + Keychain high_water rollback rehearsal |
| sync-engine-push | plaintext outbox squash + lazy encrypt + UUIDv7 mutation_id | W2 | Real Tauri crypto wiring + SQLCipher persistent outbox + hosted /sync/push + multi-device E2E |
| sync-engine-pull | global commit_seq cursor + revision rollback guard | W2 | Hosted /sync/pull + decrypt/apply routing + Realtime-triggered scheduling |
| push-edge-function | /sync/push Edge core handler | W2 | Live Supabase deploy + service_role DB adapter + JWT extraction + concurrent Postgres integration |
| recovery-proof-edge-function | recovery challenge + PATCH proof core | W2 | Live Supabase deploy + persistent challenge storage + strict Ed25519 verifier + real Rust E2E |
| single-table-todos-e2e | todo 同事务 entity+outbox push/pull | W2 | Hosted deploy + real two-Mac 5s + Realtime path + SQLCipher dump PoC + visual menu-bar |
| protocol-integrity-integration-tests | blob-swap AAD / revision rollback / mutation idempotency | W3 Phase 4.8 | Live deploy + malicious plugin/window runtime + recovery/KDF release-mode benchmark |
| rekey-two-phase | plugin-account 两阶段 rekey + E3033 guard | W3 Phase 4.8 | Real blocking mnemonic UI + Tauri crypto_* HPKE invocation + Edge wiring + kill-9 rehearsals + two-Mac device-revoke E2E |
| tla-protocol-model | docs/spec/sync.tla + 6 mandatory scenarios | W3 Phase 4.8 | **Blocked: install JRE + TLC run + counterexample resolution** |
| rfc-test-vectors-gate | RFC 9106/8032/9180 + 8949 CBOR | W3 Phase 4.8 | Hosted GitHub Actions + branch-protection required-status-check |
| rls-fuzz-property | Docker fast-check RLS 1000×100 fuzz | W3 Phase 4.8 | Hosted Supabase property run |
| audit-log-integrity | append-only audit log + E3025 detection | W3 Phase 4.8 | Live Supabase deploy + runtime severe-alert UI wiring |

**BLOCKED_EXTERNAL (人工外部依赖)**:
- `supabase-project-provisioning` (#9): 注册 staging+prod + billing + region
- `apple-developer-account` (#10): 签名构建 Keychain ACL + MAS sandbox

**In-Dev (核心 plugin)**:
- `plugin-account` ([dev_log](packages/plugin-account/docs/dev_log.md): wave-W3 audit log integrity, 2026-05-19)
- `@repo/core-data` (PLUGIN_MAP 2026-05-22)

**未做 (sync 子 PRD scope 内还需要的 Phase 5 完善)**:
- Realtime 订阅全 entity 接入 (currently 单 todo)
- 离线 outbox flush + 网络监测
- 设备登记 + 远程登出 UI
- quota + rate limit
- 数据导出 .json.age
- 账号删除 30 天延迟 + Realtime 广播
- cargo-fuzz 24h
- 4 个恢复演练 (server wipe / local wipe / Re-key kill-9 / device revoke)
- Passkey 选项 (P1)
- supply chain 硬化 (cargo vet + sigstore + dependency-review-action)

### 2.2 console 子 PRD 的实现度

**已 Shipped (代码 + V2 流程)**:
- `plugin-console` ([dev_log](packages/plugin-console/docs/dev_log.md): **SHIPPED 2026-05-21**)
  - Console TickTick parity host shell
  - Phase 1-5 全过: 契约冻结 → 桌面 shell + Tauri window 命令 → productivity ConsoleView 整合 → labels ConsoleView 整合 → reconcile/ack/degrade gates
  - manifest-driven `ui.consoleSidebar.entries` 契约
  - Sidebar/List/Detail shell + 持久化 pane widths/nav/theme/density/font scale state
  - Tauri console window commands: open/close/focus/get/set frame
  - Phase 5 reconcile mock chain (`console:reconcile-requested` + `console:ack-applied`)
  - 200ms timeout partial-result degradation

**READY_FOR_VERIFY 但 PLUGIN_MAP 仍 In-Dev**:
- `plugin-project` ([dev_log](packages/plugin-project/docs/dev_log.md)): Track B Codex 2026-05-20, 看板 + Card detail + Repository v0 migration. **待补**: emit `project:card-created` / `project:card-moved` / `project:card-updated` via `@repo/core/events`.
- `plugin-productivity` ([dev_log](packages/plugin-productivity/docs/dev_log.md)): Track B Codex 2026-05-20, Todo + Pomodoro + Habit + 四象限 + Repository v0. **待补**: emit `productivity:pomodoro-completed` / `productivity:todo-due` / `productivity:habit-reminder` once `@repo/core/events` stabilizes.
- `plugin-labels` ([dev_log](packages/plugin-labels/docs/dev_log.md)): Track B Codex 2026-05-20, LabelStore + LabelPicker + Repository v0. **待补**: emit `labels:created` / `labels:updated` / `labels:deleted` once `@repo/core/events` stabilizes.

**仍 In-Dev 基础态**:
- `plugin-calendar` ([dev_log](packages/plugin-calendar/docs/dev_log.md)): Track D 2026-05-20, mock + Repository v0. console 子 PRD 内部分**灰显占位**, Phase 3 才补。

**未做 (console 子 PRD W3-W5 真验收)**:
- 真机 macOS Sonoma + Sequoia 双系统全 §9.1-§9.5 走查 (12 + 6 + 互转 + 灰显 + X-01~X-06 跨窗口脚本)
- 性能 P95 (Cmd+K 300ms / 实时同步 400ms) 中量数据 (10K Todo + 1K Project card) 实测 (M1/M2/Intel 三档)
- VoiceOver 走通 tree/listbox/grid/calendar/dialog/toolbar
- i18n zh-CN/zh-TW/en 三语 (PRD 收敛为简中 100%/繁中+英文 ≥80% 缺失键回退简中)
- 7 天长跑 + Console ↔ overlay 无漂移

### 2.3 web 子 PRD 的实现度

**根据 `web-ticktick-parity.md` 现役 manifest**:

**已 SHIPPED (9 个)**: web-architecture-adr-lite / web-plugin-map-contract-reconcile / web-sync-crypto-contract-preflight / web-release-site-archive-vite-shell / web-auth-device-session / web-browser-e2e-crypto-runtime / web-encrypted-indexeddb-cache / web-console-host-router / web-todo-first-slice。

**实际近期接近 ship (commit 痕迹)**: web-security-csp-sentry (`568e557 docs(web-security-csp-sentry): mark workflow shipped state` 在 main HEAD 之前 2 个 commits)。

**PENDING (15 个,按 wave 排)**:

| Wave | Row(s) | 主要工作 |
|---|---|---|
| W4 | web-sync-blob-driver | `@repo/core-data` driver-sync-blob 实现 Repository over /sync/pull + /sync/push |
| W8 | web-realtime-metadata-sync | `sync:<account_id>` metadata + seq gap + 5s 可见 |
| W9 | web-offline-outbox-conflicts | encrypted pending_mutations + dead-letter + 三方 diff |
| W9 | web-productivity-habits-pomodoro | Habit + Pomodoro 浏览器模块 |
| W9 | web-project-label-calendar | Project boards + labels + calendar 浏览器模块 |
| W10 | web-search-keyboard-theme | 全局搜索 + 浏览器安全快捷键 + 主题/密度 |
| W10 | web-statistics-views | TickTick 式统计 |
| W10 | web-responsive-mobile | desktop/tablet/mobile + a11y + safe-area |
| W10 | web-device-management-revoke | 设备列表 + 撤销 + 跨 tab + 403 拦截 |
| W11 | web-security-csp-sentry | CSP Report-Only/enforce + nonce edge + Sentry redact + sourcemap (实际近期 commits 显示已接近完成) |
| W11 | web-export-delete-privacy | 客户端零知识导出 + 账号删除/恢复 + consent + 隐私页 |
| W11 | web-pwa-sw-release | Service Worker + manifest + 更新提示 + kill switch + PWA install |
| W11 | web-i18n-seo-landing | landing/auth/legal SEO + sitemap + zh-CN/zh-TW/en |
| W12 | web-deploy-ci-browser-matrix | GitHub Actions + Vercel/CF staging/prod + Playwright + Lighthouse + size + RUM |
| W13 | web-ga-acceptance-suite | Roadmap exit gate: PRD §10.1/§10.2 + brief acceptance 全过 |

**BLOCKED_EXTERNAL**: web-external-env-provisioning (domains/DNS, Vercel/CF, OAuth redirect allowlists, Sentry/Vercel/Supabase secrets)。

### 2.4 关键 drift / inconsistency 待修

| ID | drift | 影响 | 推荐修复 |
|---|---|---|---|
| D-1 | `plugin-console` dev_log SHIPPED 2026-05-21,**但 PLUGIN_MAP 仍标 In-Dev** | 下游 plugin 依赖 console 时仍走 mock-first | ship 时同步更新 PLUGIN_MAP (建一个 `plugin-console-stable-promotion` row) |
| D-2 | `plugin-productivity/labels/project` 都 READY_FOR_VERIFY,**但 PLUGIN_MAP 仍 In-Dev** | 同上 | 各跑完 feature-verify + ship + PLUGIN_MAP 同步,统称 `*-stable-promotion` |
| D-3 | `productivity:* / labels:* / project:*` typed events 集体缺失 emit | 跨窗口/跨 tab 行为依赖断链 | 在 `@repo/core/events` EventMap 加类型后,3 个 plugin 各自补 emit |
| D-4 | `usage-guide.md §8` 跟 `sub-prds/roadmap-prompts.md` 顶部声明矛盾 (3 个 sub-PRD roadmap vs G0-G10 路径) | 接手人困惑 | 重写 usage-guide.md §8 为 "3 子 PRD 由 sync-v1 + web-ticktick-parity + console plugin-by-plugin 三条路径推进,不是 3 个独立 roadmap manifest" |
| D-5 | `tla-protocol-model` (sync W3) Blocked 因 JRE 缺失 | Phase 4.8 admit gate 卡住 | 装 JRE + TLC run + 反例处理 |
| D-6 | sync-v1.deferred-gates.md 30+ 条 deferred,绝大多数需要 #9 supabase-project-provisioning + #10 apple-developer-account 解锁 | Phase 5 完善路径强依赖这两个 EXTERNAL row | 人工外部 provision,然后批量回跑 deferred gates |

---

## 3. 依赖关系图

### 3.1 三子 PRD 真实依赖链

```mermaid
graph TD
    subgraph sync ["sync (基础设施 + 协议)"]
        S_W03["W0-W3 已 Shipped<br/>29 packages"]
        S_P5["Phase 5 完善<br/>Realtime/outbox/UI/quota/导出/删除/fuzz/演练"]
        S_W03 --> S_P5
    end

    subgraph console ["console (桌面壳)"]
        C_PC["plugin-console SHIPPED<br/>(5 phase 全过)"]
        C_BIZ["plugin-productivity/labels/project<br/>READY_FOR_VERIFY"]
        C_VERIFY["真机验收 + i18n + 性能 + a11y<br/>(W3-W5 验收待跑)"]
        S_W03 -.提供 core-data Repository v0 + crypto.-> C_PC
        S_W03 -.提供 core-data Repository v0.-> C_BIZ
        C_PC --> C_VERIFY
        C_BIZ --> C_VERIFY
    end

    subgraph web ["web (浏览器面, 已 9/25 SHIPPED)"]
        W_DONE["W0-W3 SHIPPED<br/>(adr / preflight / scaffold / auth-device / e2e-crypto / idb-cache / host-router / todo-first)"]
        W_W4["W4: web-sync-blob-driver"]
        W_W8_10["W8-W10: realtime / offline / modules / search / stats / responsive / device-mgmt"]
        W_W11_13["W11-W13: CSP / export / PWA / i18n / deploy / GA"]
        S_W03 -.HPKE/Ed25519/AES-GCM/commit_seq.-> W_DONE
        S_W03 -.devices/sessions/X-Device-Id.-> W_W4
        C_PC -.Console PRD IA + ui.consoleSidebar 契约.-> W_DONE
        C_PC -.ConsoleView render mapping.-> W_W8_10
        W_DONE --> W_W4 --> W_W8_10 --> W_W11_13
    end

    style S_W03 fill:#dfd
    style C_PC fill:#dfd
    style W_DONE fill:#dfd
```

### 3.2 跨子 PRD 硬依赖事实清单

| 依赖项 | 上游 | 下游 | 当前状态 |
|---|---|---|---|
| `@repo/core-data` Repository<T> 契约 + SQLite driver | sync W1 (Shipped) | console + web | ✅ Shipped boundary; In-Dev 标识仅因 Web driver 未补 |
| `@repo/core-data` Sync blob driver (浏览器侧) | sync Phase 5 + web W4 | web Phase 4.5a Week 2+ | ❌ web-sync-blob-driver PENDING (W4) |
| `@repo/core` typed events: `console:*` / `productivity:*` / `labels:*` / `project:*` / `account:*` | sync Shipped (account:*) + 3 个 plugin 待补 | console (ack/reconcile chain) + web (跨窗口/跨 tab) | ⚠️ console `console:*` Shipped; productivity/labels/project emit **未补** (Drift D-3) |
| Console PRD 共享 IA / 三栏 / 键盘流 | console (Shipped) | web (ADR-0006 强制对齐) | ✅ console PRD v0.2-rev1 是 web "UI truth source" |
| HPKE + Ed25519 + AES-GCM Rust crypto 全套 | sync W0-W1 (Shipped) | sync Phase 4.8 + 5 + web (TS 镜像) | ✅ Shipped, Rust 主实现 |
| Supabase devices/sessions 表 + X-Device-Id middleware | sync Phase 4.8 + 5 | web W4 web-sync-blob-driver 准入门 | ❌ schema 部分就位,middleware 未做 |
| commit_seq global cursor + sync_events seq WAL | sync W2-W3 (Shipped) | web Realtime gap 检测 | ✅ Shipped |
| Re-key 两阶段 + keyring | sync Phase 4.8 (Shipped) | 全 entity 切 DEK 时;web W9 web-offline-outbox-conflicts | ✅ 包 Shipped, live kill-9 演练 deferred |
| Supabase project + Apple Developer 签名 | external | sync 30+ deferred gates + web 部署 | ❌ BLOCKED_EXTERNAL (人工 provision) |

### 3.3 Console 自身的依赖闭环已通

`plugin-console` SHIPPED 时(2026-05-21),它的 Phase 3/4 整合是基于 `manifest.ui.consoleSidebar.entries` 契约 + Contract Mock retirement(productivity/labels 已用真实 ConsoleView)。**plugin-console 本身已 OK**,缺的是 PLUGIN_MAP 标识升级 (drift 修正) 和真机验收。

---

## 4. 真实 Wave 建议 (基于现役 manifest 继续推进, 不是建新)

**核心更正**: 不建议跑 `/xai-roadmap-loop init` 新建 `xai-v1-3sub-prd-2026-05.md` manifest,因为已有现役:
- `sync-v1.md` (Phase 5 完善 + deferred gate 回跑)
- `web-ticktick-parity.md` (W4 起 PENDING rows 继续)
- console: plugin-by-plugin manual,无独立 manifest

下面是**剩余工作的 wave 编排建议**,可以并行或串行,接手人 dispatch 时分别 continue 对应 manifest。

### 4.1 Wave 0 — 现役解锁 + drift 修正 (1-2 周, 多线并行)

| Row / Action | Track | 依据 | ETA | 入口 |
|---|---|---|---|---|
| **W0.A**: 完成 `web-security-csp-sentry` ship | web-ticktick-parity #20 | 近期 commits 显示已接近 ship state | 0.5-1 天 | 现役 manifest #20 PENDING → ship |
| **W0.B**: 修 D-3 — 在 `@repo/core/events` EventMap 加 `productivity:* / labels:* / project:*` 类型 + 3 plugin 各自 emit | 跨 plugin | 3 个 dev_log "Known Gap" | 2-3 天 (3 个独立 feature row) | 走 manual `Start the feature-plan agent.` per plugin |
| **W0.C**: 修 D-1/D-2 — plugin-console + productivity/labels/project 跑完 feature-verify + ship + PLUGIN_MAP Stable 升级 | console | 4 个 plugin dev_log 都 READY_FOR_VERIFY/SHIPPED 但 PLUGIN_MAP 仍 In-Dev | 1-1.5 周 (4 个 plugin) | per-plugin feature-verify + ship + PLUGIN_MAP edit |
| **W0.D**: 解 D-5 — 装 JRE + TLC run `docs/spec/sync.tla` | sync-v1 #33 | sync-v1.deferred-gates.md:33 | 0.5 天 | manual `java -jar tla2tools.jar ... docs/spec/sync.tla` |
| **W0.E**: 修 D-4 — 重写 `usage-guide.md §8` 校准跟 `roadmap-prompts.md` 一致 | docs | 内部矛盾 | 0.5 天 | manual edit |
| **W0.F**: 外部 provision — Supabase staging+prod (#9) + Apple Developer 签名 (#10) | external | sync-v1 BLOCKED_EXTERNAL + web-external-env-provisioning | 人工时间 (账号 + billing) | 人工 |

**Wave 0 出口**: 现役 drift 全修;外部依赖就位;Web 接近完成 CSP-Sentry 这道 W11 ship;3 个 plugin Stable;plugin-console PLUGIN_MAP 升 Stable;TLA+ 模型跑通 (admit gate for sync Phase 4.8 余下)。

### 4.2 Wave 1 — sync Phase 5 完善 (4-6 周, 现役 sync-v1 manifest continue)

外部 provision 完成后,sync-v1 的 deferred gates 大批可解。建议按 dev-plan §3.2 顺序:

| Row / Action | 依据 | ETA |
|---|---|---|
| **W1.1**: Realtime 全 entity 接入 (T-21~T-25, dev-plan §3.2 Week 1) | sync dev-plan §3.2 Week 1 | 5-7 工日 |
| **W1.2**: 离线 outbox flush + 网络监测 + 死信 UI + 设备登记/远程登出 UI (T-30~T-36, Week 2) | sync dev-plan §3.2 Week 2 | 5-7 工日 |
| **W1.3**: 助记词恢复 + Re-key 实战 + quota/rate limit (T-40~T-45, Week 3) | sync dev-plan §3.2 Week 3 | 5-7 工日 |
| **W1.4**: 全量导出 + 账号删除 + cargo-fuzz 24h + 4 演练剧本 (T-50~T-59, Week 4) | sync dev-plan §3.2 Week 4 | 7-10 工日 |
| **W1.5**: 解锁 sync-v1.deferred-gates.md 中 "Live Supabase deploy" 类条目 (~10 条) | sync-v1.deferred-gates.md | 跟 W1.1-W1.4 同期回跑 |

**Wave 1 出口**: sync Phase 5 验收 13 条全过 (PRD §10.2);plugin-account PLUGIN_MAP Stable;sync-v1.deferred-gates 大部分关闭。

### 4.3 Wave 2 — web W4-W10 (5-7 周, 现役 web-ticktick-parity manifest continue)

继续现役 manifest 的 PENDING rows:

| Row | 依据 | 依赖 |
|---|---|---|
| **W2.1**: web-sync-blob-driver (#8) | manifest 已规划 | core-data Repository v0 (Shipped) + Sync v0 (需 W1 部分) |
| **W2.2**: web-realtime-metadata-sync (#12) | 现役 | sync_events seq (Shipped) + W2.1 |
| **W2.3**: web-offline-outbox-conflicts (#13) | 现役 | W2.2 + Re-key keyring (Shipped) |
| **W2.4**: web-productivity-habits-pomodoro (#14) | 现役 | console host router (Shipped) + W2.3 |
| **W2.5**: web-project-label-calendar (#15) | 现役 | 同 W2.4 |
| **W2.6**: web-search-keyboard-theme (#16) | 现役 | W2.4 + W2.5 |
| **W2.7**: web-statistics-views (#17) | 现役 | W2.4 + W2.5 + W2.6 |
| **W2.8**: web-responsive-mobile (#18) | 现役 | W2.4 + W2.5 |
| **W2.9**: web-device-management-revoke (#19) | 现役 | web-auth-device-session (Shipped) + W2.2 |

**Wave 2 出口**: web 全部 plugin module 接入完成,设备管理可用,移动可用。

### 4.4 Wave 3 — web W11-W13 + GA 准备 (3-5 周)

| Row | 依据 |
|---|---|
| **W3.1**: web-export-delete-privacy (#21) | 现役 |
| **W3.2**: web-pwa-sw-release (#22) | 现役 |
| **W3.3**: web-i18n-seo-landing (#23) | 现役 |
| **W3.4**: web-deploy-ci-browser-matrix (#24) | 现役,需 W0.F 完成 |
| **W3.5**: web-ga-acceptance-suite (#25) | 现役,exit gate |

**Wave 3 出口**: Web roadmap 全过;Phase 5 公测准备就绪;G10 Release GA 启动门打开。

### 4.5 Wave 序的关键不变式

- 任何 row 都走完整 V2 流程: `feature-plan → feature-review → feature-build (N phases) → feature-verify → ship`
- 每个 row 在 main 上有清晰 phase commits,**不开长期 feature 分支**
- Wave 之间软 gate: 上 wave 的关键 row ship 后启动下 wave;不需要严格全 ship 才能开下 wave (依赖 DAG 已经在 manifest 里)
- 每个 ship 必须同步更新 PLUGIN_MAP (防 drift)

---

## 5. 风险登记 (带 owner 字段)

### 5.1 跨 Wave 风险

| ID | 风险 | 等级 | 触发标志 | 缓解 | Owner |
|---|---|---|---|---|---|
| GR-1 | PLUGIN_MAP drift 集体未修 | 🟡 中 | 4 plugin dev_log SHIPPED/READY 但 PLUGIN_MAP In-Dev | Wave 0.C 一次性 ship 升级 | Track B Codex + ship agent |
| GR-2 | productivity/labels/project typed events 集体缺失 | 🟡 中 | 3 个 dev_log "Known Gap" | Wave 0.B 在 `@repo/core/events` 加类型后 3 plugin 各自 emit | feature-plan agent / Track B |
| GR-3 | sync deferred gates 30+ 条积累 | 🔴 高 | sync-v1.deferred-gates.md 全集 | 大部分依赖 #9/#10 external,W0.F 后批量回跑 | Track A 或 sync 专责 |
| GR-4 | usage-guide vs roadmap-prompts 矛盾误导接手人 | 🟡 中 | drift D-4 | Wave 0.E 重写 usage-guide §8 | docs maintainer (人工) |

### 5.2 macOS 真机门 (Console)

| ID | 风险 | 等级 | 触发标志 | 缓解 | Owner |
|---|---|---|---|---|---|
| MR-1 | Sonoma + Sequoia 双系统差异 (多 Space / Stage Manager / 拔屏 / 全屏) | 🟡 中 | Console PRD §5.8.2 S-01~S-11 未真机跑 | Wave 0.C plugin-console verify 含双系统真机走查 | feature-verify (Claude) |
| MR-2 | Tauri menu bar + NSToolbar accessory 差异 | 🟡 中 | plugin-console dev_log 注 "Real macOS verification deferred" | 同 MR-1 | 同 MR-1 |
| MR-3 | click-through (`setIgnoresMouseEvents`) 在不同 macOS 版本上的边界 | 🟢 低 | PLUGIN_MAP `click-through-matrix` 标 Blocked (G0.3) | G0 spike 已有,Wave 0 内补真机 evidence | Track A |

### 5.3 双渠道发布 (DMG + MAS)

| ID | 风险 | 等级 | 触发标志 | 缓解 | Owner |
|---|---|---|---|---|---|
| RR-1 | MAS 沙箱限制可能阻断剪贴板 / 全局快捷键 / 屏幕共享自动隐藏 | 🔴 高 | PLUGIN_MAP `mas-sandbox-dry-run` Blocked (G0.6) | Wave 0.F 跑 MAS sandbox real-evidence | external + Track A |
| RR-2 | DMG 自动更新签名链 vs MAS App Store 双轨 | 🟡 中 | 主 PRD §5.10.1 自动更新签名 | Phase 5/6 由 G10 release-ga 处理 | G10 owner |

### 5.4 ADR-0006 Web 混合边界纪律

| ID | 风险 | 等级 | 触发标志 | 缓解 | Owner |
|---|---|---|---|---|---|
| AR-1 | Web rows 偏离 Console PRD IA 但不留 "偏离记录" | 🟡 中 | 没纪律就会演变成事实双轨 | 每个 web W2.* row 在 design.md 内做 "Console-PRD-deviations" 章节,review gate 强制检查 | feature-review |
| AR-2 | Web 自行发明新数据契约,绕开 `Repository<T>` / Sync blob protocol | 🔴 高 | ADR-0006 实施规则明确禁止 | feature-review agent 卡口;CI lint Web 包对 PostgREST 业务表直连 | feature-review + CI |

### 5.5 deferred gates (按 wave 归位)

| 类别 | 大致条目数 | 处理 wave |
|---|---|---|
| Real Supabase deploy + RLS / Realtime / Edge Function 跑通 | ~10 条 | Wave 0.F + Wave 1 同期集中 |
| Cross-vendor RFC vectors live run (RFC 9106/8032/9180/8949) | ~3 条 | Wave 0.D (TLA+ row 一起,作为 admit gate) |
| Live two-Mac/SQLCipher dump | ~5 条 | Wave 1.4 (恢复演练) |
| kill-9 Re-key 实战 | ~4 条 | Wave 1.4 |
| Keychain ACL + accessibility on signed build | ~3 条 | W0.F (Apple Developer 后) + W1 plugin-account stable verify |
| MAS sandbox real-evidence | ~2 条 | W0.F + G0.6 row |
| Web 部署 + DNS + OAuth allowlist | ~5 条 | W0.F (external) + Wave 3 web-deploy |

---

## 6. 下一步推荐

### 6.1 短答 (接手人执行顺序)

1. **不要建新 manifest**,直接 continue 现役 `sync-v1.md` + `web-ticktick-parity.md`
2. **Wave 0 先跑** (1-2 周, 多线并行可行):
   - W0.A: ship `web-security-csp-sentry` (近期 commits 显示已接近)
   - W0.B: 3 plugin emit typed events
   - W0.C: 4 plugin 升 PLUGIN_MAP Stable (verify + ship)
   - W0.D: TLA+ JRE + run
   - W0.E: 修 usage-guide §8 文档矛盾
   - W0.F (人工): Supabase + Apple Developer
3. **Wave 1**: sync Phase 5 (4 周)
4. **Wave 2**: web W4-W10 (5-7 周)
5. **Wave 3**: web W11-W13 + GA (3-5 周)

### 6.2 单 row 入口模板 (从 usage-guide.md §5 抽出, 给接手人直接复制)

**A. 新 feature (单 row)** — Level 2 推荐:

```text
/xai-feature-full-loop
Requirement: <1-3 句:为什么做、谁用、解决什么>
Automation Mode: A-Claude
Verify Cross-vendor: yes
```

**B. resume 一个已存在 feature**:

```text
/xai-feature-full-loop
Feature: plugin-<name>
```

**C. 来自 roadmap bg session 的 resume**:

```text
/xai-feature-full-loop
Feature: plugin-<name>
Roadmap Manifest: docs/workflow/roadmap/<roadmap_name>.md
Background Session: <session_id_or_name>
Worktree: <absolute_worktree_path>
```

**D. 手动 Level 1 (调试 / BLOCKED 恢复)**:

```text
Start the feature-plan agent.        # attach brief
Start the feature-review agent for <feature>.
Start the feature-build agent for <feature>.   # 一次一个 phase
Start the feature-verify agent for <feature>.
Start the ship agent for <feature>.
```

### 6.3 推荐 Automation Mode (从 usage-guide.md §6)

| 场景 | Mode | Cross-vendor |
|---|---|---|
| 密码学 / Sync / Rust security | `A-Claude` | yes |
| UI-heavy / Console / Web | `D-Codex+Cursor` | yes |
| 小修小补 | Level 1 + agent-behavioral-guidelines | — |

### 6.4 Wave 0 W0.B 的 starter prompt 示例 (productivity emit events)

```text
/xai-feature-full-loop
Requirement: 给 plugin-productivity 补 emit `productivity:pomodoro-completed`、`productivity:todo-due`、`productivity:habit-reminder` 这三个 typed events。当前 dev_log 的 "Known Gaps" 一节明确列出待补;@repo/core/events EventMap 已稳定 (plugin-console 走的就是 typed events);整合点是 Todo/Pomodoro/Habit store 的 mutation 出口。
Automation Mode: D-Codex+Cursor
Verify Cross-vendor: yes
```

类似的 W0.B labels / project 各一个 row。

### 6.5 Wave 1 W1.1 starter (sync Realtime 全 entity)

```text
/xai-feature-full-loop
Feature: sync-engine-realtime-all-entity
Requirement: 在 plugin-account 接入 Supabase Realtime channel `sync:<account_id>` (Private Channels 强制),订阅后对剩余 entity_type (settings/grids/grid_items/lists/labels/label_assignments/habits/habit_logs/boards/board_lists/board_cards/board_card_checklist/notes/progress_trackers/pets/plugins) 触发 engine.pullSince()。忽略 self 设备消息 (FR-SY-29)。断线重连 + 指数退避 + seq gap 检测 (FR-SY-31)。每个 entity 加集成测试 (写一条 → 5s 内另一端可见)。依据 sub-prds/sync/dev-plan.md §3.2 Week 1 T-21~T-25。
Automation Mode: A-Claude
Verify Cross-vendor: yes
Roadmap Manifest: docs/workflow/roadmap/sync-v1.md
```

---

## 7. Mock-first 纪律 + PLUGIN_MAP 升级流程

### 7.1 Mock-first 是 Workflow V2 的关键不变式

`docs/PLUGIN_MAP.md` 顶部 line 4-6:

> AI 开发 / 调用任何 Plugin 前,必须先查阅此表。
> 只有状态为 Stable 或 Production 的 Plugin 才能被作为稳定依赖。
> 状态为 In-Dev / Testing 的 Plugin 必须使用 Mock 数据解耦。

**任何 feature row 在 plan 阶段都要明确**:
- 它依赖哪些 plugin?
- 那些 plugin 在 PLUGIN_MAP 中是 Stable/Production 吗?
- 如果是 In-Dev/Testing → 必须 mock-first,不直接依赖

### 7.2 PLUGIN_MAP 升级流程 (4 步)

```text
plugin 的 dev_log Status → READY_FOR_VERIFY
  ↓ feature-verify agent run (pass)
plugin 的 dev_log Status → READY_TO_SHIP
  ↓ ship agent run (pushes to main + 同步更新 PLUGIN_MAP 行)
PLUGIN_MAP 状态 In-Dev → Stable
  ↓ 下游 feature plan 可以"硬依赖"了 (不需要 mock-first)
```

**ship agent 必须做的 PLUGIN_MAP 更新** (项目当前 drift 的根因就是这步常被跳):
1. 编辑 `docs/PLUGIN_MAP.md` 对应行的 "状态" 列
2. 编辑 "说明" 列加一句最新 verify pass 描述
3. 编辑 "最后更新" 列日期
4. commit 时 `docs(plugin-map): promote plugin-<name> to Stable`

### 7.3 已知 drift 待批量修复 (Wave 0.C)

| Plugin | dev_log Status | PLUGIN_MAP 当前 | PLUGIN_MAP 期望 |
|---|---|---|---|
| plugin-console | SHIPPED (2026-05-21) | In-Dev | Stable |
| plugin-productivity | READY_FOR_VERIFY (2026-05-20) | In-Dev | Stable (verify pass 后) |
| plugin-labels | READY_FOR_VERIFY (2026-05-20) | In-Dev | Stable (verify pass 后) |
| plugin-project | READY_FOR_VERIFY (2026-05-20) | In-Dev | Stable (verify pass 后) |

---

## 8. 附录: 关键命令 + grep 模板

### 8.1 接手人快速摸底命令

```bash
# 1. 当前仓库状态
git status
git worktree list
git branch
git log --oneline -10

# 2. 现役 roadmap manifest 当前状态
ls docs/workflow/roadmap/*.md
grep -E "SHIPPED|PENDING|BLOCKED" docs/workflow/roadmap/sync-v1.md
grep -E "SHIPPED|PENDING|BLOCKED" docs/workflow/roadmap/web-ticktick-parity.md

# 3. plugin 实际状态 (dev_log Status Panel)
grep -E "^\| Status \||^- Status:" packages/plugin-*/docs/dev_log.md

# 4. PLUGIN_MAP 当前
cat docs/PLUGIN_MAP.md | head -100

# 5. 找最近活动的 plugin/feature
git log --since=2026-05-15 --pretty=format:'%h %s' --name-only | head -50

# 6. 找 deferred gates 全集
cat docs/workflow/roadmap/sync-v1.deferred-gates.md
cat docs/workflow/roadmap/xai-v1.deferred-gates.md

# 7. Workflow agent 配置 (15 个 V2 agent 三端生成)
ls .claude/agents .codex/agents .cursor/agents
ls .teams/skills/xai-*

# 8. 测试某个 plugin (验证 mock 可跑)
pnpm --filter @repo/plugin-<name> test
pnpm --filter @repo/plugin-<name> check-types
pnpm --filter desktop build      # 全局 host typecheck/build gate
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
```

### 8.2 常见 dev_log Status → 下一步映射

| Status | 下一步 (Level 1) | Level 2/3 |
|---|---|---|
| `NEEDS_REVIEW` + `→ feature-review` | `Start the feature-review agent for <feature>.` | — |
| `NEEDS_REVIEW` + `→ feature-plan` (revise) | `Start the feature-plan agent for <feature>.` | — |
| `APPROVED` | `Start the feature-build agent for <feature>.` | `Start the feature-dev-loop agent for <feature>.` |
| `READY_FOR_VERIFY` | `Start the feature-verify agent for <feature>.` | — |
| `BLOCKED` + `→ feature-build` | `Start the feature-build agent for <feature>.` (fix) | `Start the feature-dev-loop agent for <feature>.` |
| `FIX_READY` | `Start the bug-fix agent for <feature>.` | `Start the bugfix-loop agent for <feature>.` |
| `FIX_READY_FOR_VERIFY` | `Start the bug-verify agent for <feature>.` | — |
| `READY_TO_SHIP` | `Start the ship agent for <feature>.` | — |
| `SHIPPED` | 完成 | — |

### 8.3 V2 agent 生成命令

```bash
# 安全模式 (Claude → .claude/agents-v2/)
./scripts/setup_subagents_v2.sh

# 替换 Claude 主动 agents
./scripts/setup_subagents_v2.sh --include-skills --replace-claude --force

# 只生成特定 target
./scripts/setup_subagents_v2.sh --targets codex,cursor

# Preview only
./scripts/setup_subagents_v2.sh --dry-run
```

### 8.4 关键 grep 模板 (接手人调研用)

```bash
# 找某个 entity_type 是哪个 plugin 在用
grep -rn "entityType.*'<name>'" packages/plugin-*/src/

# 找某个 typed event 的声明位置
grep -rn "'<event>:'" packages/core/src/events/

# 找某个 Tauri command 的 Rust 实现
grep -rn "#\[tauri::command\]" apps/desktop/src-tauri/src/commands/

# 找一个 plugin 是否真的 emit 某个 event
grep -rn "core/events" packages/plugin-<name>/src/

# 检查 contract 文档跟代码是否一致
diff <(grep "fn_" apps/web/supabase/migrations/*.sql) <(grep "rpc/" docs/contracts/*.md)
```

---

## 9. 变更记录

| 日期 | 版本 | 变更 |
|---|---|---|
| 2026-05-22 (草稿) | v0.1 | 首版 6 节,未识别 web-ticktick-parity manifest 真实状态,未识别 roadmap-prompts.md 跟 usage-guide 矛盾 |
| 2026-05-22 (本版) | v0.2 (handoff) | **核心修正**: 1) 识别 web-ticktick-parity 已 9/25 SHIPPED, web 不是 "0% 实现"; 2) 识别 roadmap-prompts.md 已废弃 3 并行 roadmap 路径, drift D-4 加入风险登记; 3) Wave 建议改为 continue 现役 manifest 而非新建; 4) 加 §0 接手人入门 (项目背景 + 文档地图 + 编码红线); 5) 加 §7 mock-first 纪律 + PLUGIN_MAP 升级流程; 6) 加 §8 附录命令 + grep 模板 + Status 映射; 7) 加 owner 字段到风险表 |

---

STATUS: PRE_ANALYSIS_READY · 等待用户决定下一步 (推荐: continue 现役 sync-v1 + web-ticktick-parity manifest, 不建新; 先跑 Wave 0 drift 修正)
