# XAI 部署架构与上线方案 / Deployment Architecture & Launch Plan

> **状态**：Proposed（沉淀优先 / sediment-before-execute）· 2026-06-06 · Owner: project-system
> **定位**：本文是 XAI 全产品线**部署体系的权威设计文档**（deployment authority doc）。
> 它**综合并落地**以下已有决策，不与其冲突：
> - [ADR-0008](adr/0008-cloudflare-deploy-target-and-csp.md)：Web 部署目标 = Cloudflare Pages + CSP 处置。
> - [ADR-0013](adr/0013-branch-sync-governance.md) §D4：账号云同步拓扑与实体作用域。
> - [ADR-0010](adr/0010-p1-desktop-resume-plan.md)：P1 桌面 App 恢复计划。
> - [`docs/PRODUCT_MODULE_MAP.md`](PRODUCT_MODULE_MAP.md)：六产品线任务归属与导航。
> - [`docs/workflow/roadmap/sync-v1.md`](workflow/roadmap/sync-v1.md)：同步层 #1–#56 实施清单。
>
> **正式 ADR 编号**：部署架构的正式 ADR 编号待跨分支（`web` / `dev` / worktree）编号对齐后再分配
> （当前 0011/0012/0014/0015/0016 在不同分支已被占用，避免合并 `main` 时冲突）。在此之前，本文承担
> ADR 式「Context / Decision / Consequences」职责，可被直接引用。

---

## 0. 阅读指引

| 你想知道 | 看哪节 |
|---|---|
| 现在能不能上线、卡在哪 | §1 成熟度 · §12 待决策 |
| 整体用什么平台、为什么 | §2 架构 · §3 平台组合 |
| 六个产品分别怎么部署 | §4 部署矩阵 |
| Web 具体上线步骤 | §5 Web 上线流程 |
| 多端数据怎么联通 | §6 数据同步与账号云 |
| 上线前要检查什么 | §7 Checklist |
| 花多少钱 | §8 成本 |
| 上线后怎么维护 | §9 维护与发布流程 |
| 接下来按什么顺序做 | §10 执行路线图 |

---

## 1. 当前部署成熟度

分三层判断，避免「能发 Demo」与「账号云同步 GA」两个概念混淆：

| 层 | 成熟度 | 判断 |
|---|---:|---|
| **Web 静态产品（Demo/Preview）** | 🟢 ~95%（设施）/ 62%（完整产品） | Vite 7 + React 19 + RR7；`apps/web/wrangler.toml`、`.github/workflows/deploy-web.yml`、`apps/web/public/_headers`(CSP/HSTS)、`docs/runbooks/cloudflare.md` 全部就绪。mock-authenticated 模式下零后端即可发完整可用 Demo（ADR-0008 已拍板此上线姿态）。 |
| **Web 真实账号登录** | 🟡 ~45% | Auth 边界 + 凭据/登录编排已 ship，但 `plugin-account` 的 `LoginPage.tsx` 仍是 mock stub，Supabase Auth 集成 deferred；CI 对**所有**构建（含生产）固定 `VITE_WEB_AUTH_MODE=mock-authenticated`（不是"生产用 live"）；且账号删除函数 `account-delete` **未随仓库 shipped**（隐私合规阻塞）。 |
| **账号云同步层** | 🟡 ~30%（代码完成、未部署） | 加密原语（AES-256-GCM / HPKE / Ed25519）、outbox、SQLCipher、Supabase Edge Functions（`sync-push`/`sync-pull`/`recovery-proof`/`onboarding-backfill`）、Postgres migrations + RLS **代码均已写完**（sync-v1 #1–#36），但**未部署到任何真实 Supabase 实例**，整条线按 P0 优先级 PAUSED。 |
| **Mac / iOS / Android 数据接入** | 🔴 ~25% | `syncScope` 契约 + local-first + repository 边界已实现；客户端运行时接入未落地。iOS / Android **当前仓库尚无 app**（仅 web + desktop）。 |
| **桌面插件同步** | 🔴 ~30% | 插件须经 repository/runtime adapter 的边界清楚，但账号插件与实时同步仍 In-Dev / Deferred。 |
| **DevOps 上线闭环** | 🟡 ~60% | Cloudflare Pages + GitHub Actions + runbook 已有；生产分支来源、生产 env、监控、备份恢复演练、隐私合规尚未闭环。 |

**结论**：Web 端"上线设施"接近成品级，真正缺的不是工具，是 §12 的三个决策动作 + 一次真实「部署→记录→回滚」闭环（看板当前 0 条真实生产部署记录）。

### 关键阻塞（非「Web 能否 build」）

1. **生产部署源分支未定**：GitHub Actions 现绑定 `main`，但 Web 主线是 `web`，`web` 比 `main` 多出大量产品提交 → 直接发会发出**落后版本**。（§5.0 / §12-A）
2. **首发模式未定**：Public Demo（mock-auth）还是 Real-Auth Private Beta。（§12-B）
3. **Supabase 实例未开通**（sync-v1 #9，纯外部人工任务）→ 阻塞所有真实 Auth 与同步部署。
4. **隐私合规未闭环（Real-Auth 阻塞，Demo 不受影响）**：隐私政策 / 用户协议 / 数据导出说明缺失；且**账号删除 `account-delete` Edge Function 未随仓库 shipped**（`apps/web/deploy/README.md` 明确说明，需单独实现+部署），是 Real-Auth Private Beta 的硬前置（账号删除是合规要求）。

---

## 2. 推荐部署架构

主轴**已选定且正确，不推倒重来**：**Cloudflare Pages（前端）+ Supabase（Auth + Postgres + Edge Functions + Storage）+ GitHub Actions（CI）+ Sentry（监控）**。

```
                         ┌─────────────────────────────────────────┐
                         │            账号云 (Supabase)              │
   Web (CF Pages SPA)    │  Auth(GoTrue) · Postgres + RLS            │  ← 唯一事实源
   IndexedDB/localStorage│  Edge Functions: /sync/push /sync/pull   │     (端到端加密, 服务器零明文)
        │  ▲             │  Storage(加密 blob) · 每日备份 + PITR     │
        │  │ HTTPS/JWT    └──────────────▲───────────────────────────┘
        ▼  │                            │  push/pull 加密信封 (commit_seq 游标)
   ┌────────────┐         ┌─────────────┴──────────────┐
   │  浏览器     │         │  Mac (Tauri, SQLite/SQLCipher + Keychain) │
   └────────────┘         │  iOS / Android (后续, SQLCipher + Keystore)│  ← 各端只跟"账号云"同步,
   [Sentry ← 错误/Web-Vitals]│  Desktop Plugin → repository adapter → App │     端与端之间不直连
   [GitHub Actions → CF Pages]└────────────────────────────┘             (ADR-0013 §D4)
```

### 三条不可破原则（ADR-0013 §D4 已写死，必须坚持）

1. **端不互联，只联云**：Web ⇄ 云 ⇄ App，**绝不** Web ⇄ App 直连。
2. **只有 `account-sync` 实体上云**：`device-local` 永不进远端 outbox。
3. **服务器只存密文**：端到端加密，Supabase 看不到明文（crypto 栈已实现）。

---

## 3. 推荐云平台组合

### 直接采用（已在用 / 应固化）

| 平台 | 用途 | 为什么是它 |
|---|---|---|
| **Cloudflare Pages** | Web 托管 + CDN + 自动 HTTPS + Preview Deploy | 免费档**带宽不限**、SPA 回退自动、`_headers` 原生支持 CSP、PR 自动预览。对 Vite SPA 近乎天花板且基本零成本。仓库已配好。 |
| **Supabase** | Auth + Postgres + Edge Functions + Storage | 一站式拿齐账号/数据库/后端函数/文件存储；RLS 做多租户隔离。后端代码已按 Supabase 写好（migrations + Edge Functions + RLS），换平台 = 重写。 |
| **GitHub Actions** | CI/CD | 已接 `deploy-web.yml`（push→prod / PR→preview）。 |
| **Sentry** | 错误监控 | 代码已集成 `@sentry/react` + sourcemap 上传；免费档 5k errors/月。 |
| **Cloudflare Registrar** | 域名 / DNS | 与 Pages 同账号、成本价、证书与回滚简单。 |

### 暂不引入（避免架构发散）

| 平台 | 结论 |
|---|---|
| Vercel / Netlify | 与 CF Pages 同位竞品。已选 CF（带宽不限、对 Vite SPA 更省），勿三者并存。 |
| Firebase | 与 Supabase 同位，NoSQL + 厂商锁定重；同步协议是按 Postgres+RLS+行级 commit_seq 设计，迁 Firebase = 推翻设计。 |
| Neon / PlanetScale / Turso | Supabase 已自带 Postgres，暂不需要。备胎：Neon（serverless PG，未来 Postgres 瓶颈时平滑接）；Turso（libSQL，适合给端做本地 replica，P2 远期）。PlanetScale 不优先（设计不围绕 MySQL）。 |
| Railway / Render / Fly.io | 跑长驻容器/自管后端用。当前后端是 serverless Edge Functions，无需长驻进程。备选：将来需 WebSocket 实时网关 / 队列时引入 Fly.io（全球边缘）或 Railway。 |
| AWS / GCP / Azure | 🔴 个人开发者长期维护成本过高，不作主栈。仅当用户量到几十万、需专用基础设施时再谈。 |

### 移动端后续

- Mac / iOS：Apple Developer Program **$99/年**（签名/公证/上架）。
- Android：Google Play 一次性 **$25**。
- 推送：Web 用浏览器原生 Web Push（免费）；移动端用 FCM / APNs（**只做推送，不做数据库**）。

---

## 4. 六产品线部署矩阵

> 与 `dashboard-state.json` 的 `deployment.modules` + dev-dashboard「部署 Tab」一一对应；此处是文字权威，看板是可视化镜像。

| 产品线 | key | 部署目标 / 平台 | 来源分支 | 当前状态 | 关键 gate / 缺口 |
|---|---|---|---|---|---|
| **Web 版本** | `web` | Cloudflare Pages / GitHub Actions | `web`（生产源待定，见 §12-A） | 🟢 设施就绪，未登记真实生产部署 | 生产分支来源、真实 URL/版本/smoke 登记、回滚演练 |
| **官方网页** | `site` | Cloudflare Pages（复用 web 基建） | `codex/site/<feature>`（PROPOSED） | 🔴 未部署，未授权开工 | operator 解冻 + 首个下载页版本 |
| **Mac 桌面 App** | `app` | Tauri / DMG / updater | `desktop-next → dev → release/desktop/<ver>` | 🔴 未部署 | G1 native foundation、RC smoke、签名/公证、updater 元数据 |
| **桌面插件** | `plugin` | Desktop plugin host（随 App 分发） | `desktop-plugin-next`（PAUSED） | 🔴 未部署 | 等 App 插件平台恢复排期 |
| **账号云同步** | `sync` | Supabase（Edge Functions + Postgres + RLS） | sync-v1 roadmap wave（PAUSED） | 🟡 代码完成、未 provision | Supabase 实例（#9）、hardening 准入门（#37）、双设备验收（#56） |
| **Admin Dashboard** | `admin` | 原型 / 待定独立构建目标 | `codex/admin/<feature>`（PROPOSED） | 🔴 未部署 | operator 确认优先级 + RBAC 契约 |

**部署解锁顺序**：`web`（Demo）→ `sync`（解冻 + provision）→ `web`（Real-Auth Beta）→ `app`（RC）→ `site` / `admin`（按 operator 授权）。

---

## 5. Web 上线流程

### 5.0 两种模式（不要混在一起）

| 模式 | 用途 | Auth | 数据 |
|---|---|---|---|
| **Public Demo** | 先验证产品体验、官网、反馈闭环 | `mock-authenticated` | 纯浏览器 localStorage/IndexedDB（须配「导出/导入 JSON」兜底） |
| **Private Beta** | 真实账号 + 真实云同步测试 | `live` + Supabase staging/prod | IndexedDB ⇄ 账号云 |

### 5.1 构建
```bash
pnpm install --frozen-lockfile
pnpm --filter @repo/web test          # vitest（约 24 个测试文件 / ~129 用例；以一次干净 CI run 的全绿为发布门，勿写死通过数——
                                      #   2026-06-06 本地实测有 board-views 路由集成测试在重负载下偶发 5s 超时，需复核是否环境性）
pnpm --filter @repo/web build         # 产物 → apps/web/dist/
pnpm --filter @repo/web build:secure  # 带 Sentry sourcemap 的生产构建
```

### 5.2 环境变量
- **构建期（Cloudflare Pages 项目变量）**：`VITE_WEB_AUTH_MODE`、`VITE_STRIPE_PAYMENT_LINK_URL`、`VITE_SENTRY_DSN`、`VITE_RELEASE`。
- **真账号上线追加**：`VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`（anon key 可公开；**service_role key 永不进前端**）。
- **GitHub Secrets**：`CLOUDFLARE_API_TOKEN`(Pages:Edit)、`CLOUDFLARE_ACCOUNT_ID`、`SENTRY_AUTH_TOKEN`。
- `.env.local`（Gemini key 等）保持 gitignore，**绝不进仓库**。

### 5.3 域名 + HTTPS
- 域名走 Cloudflare Registrar。Pages → Custom domains → 加 `app.<domain>` → CF 自动签发并续期证书（HTTPS 零配置）。
- `_headers` 当前 HSTS 已是**最激进档**：`max-age=63072000`(2 年) + `includeSubDomains; preload`。⚠️ `preload` 一旦提交到 hstspreload.org 列表**极难回退**（错误配置会让整个域名长期强制 HTTPS）；若想灰度，应先把 `max-age` 调小并去掉 `preload`，稳定后再升档。上线前确认这是有意为之。

### 5.4 Preview / Production
- **Preview**：每个 PR 自动生成 `https://<hash>.xai-web-console.pages.dev`（已配）。
- **Production**：push 生产源分支触发发布。⚠️ **先解决 §12-A 的 main-vs-web 来源分支问题**，否则发布语义混乱。

### 5.5 回滚
- 首选：Cloudflare Pages 控制台 → Deployments → 选上一个绿色版本 → Rollback（秒级）。
- CLI：`wrangler pages deployment list` → 重新部署旧产物。
- 流程见 [`docs/runbooks/cloudflare.md`](runbooks/cloudflare.md) §3；每次发布前确认上一个 known-good deployment id。
- DB migration 必须**单独**有 rollback 策略（§9）。

### 5.6 日志 / 监控
- 前端错误 + web-vitals → Sentry。注意脚本口径：`build:secure` = 构建 + 上传/校验/清理 sourcemap；**打 deploy mark 是单独步骤**，在 `build:secure:with-deploy`（= `build:secure` + `sourcemaps:deploy:mark`）里。当前 CI（`deploy-web.yml`）用的是**普通 `pnpm --filter @repo/web build`**，尚未接 `build:secure` 链路 —— 接生产监控时需明确选用哪个脚本。
- 部署事件 → GitHub Actions summary。
- 后端 → Supabase Dashboard（Edge Function logs + Postgres logs）+ Cloudflare Analytics。

### 5.7 数据备份
- **Demo 阶段**：数据在用户浏览器，无需服务端备份，但**必须提供「导出/导入 JSON」**（唯一兜底，防 IndexedDB 被清）。
- **接 Supabase 后**：Pro 档每日备份（7 天保留）；另用 `pg_dump`/`pg_cron` 每日导出到 R2 做第二层。**上线前必须做一次 restore drill**，不只是「有备份」。

---

## 6. 数据同步与账号云架构

整体 = **离线优先（offline-first）+ 最终一致的账号云**（不是云端优先），与已实现的 outbox/commit_seq 设计一致，**不需要重新设计，只需落地**。

### 6.1 拓扑与原则

```
Web(IndexedDB+WebCrypto) ─┐
Mac(SQLite/SQLCipher+Keychain) ─┤                ┌─ Postgres: accounts / encrypted_blobs / sync_devices
iOS(SQLCipher+Keychain/SE) ─────┼─ Supabase ─────┤             mutation_dedup / device_dek_wraps
Android(SQLCipher+Keystore) ────┤  Edge Fn        │             encrypted_blobs_conflict_shadow / sync_audit_log
Desktop Plugin → repo adapter → Mac               └─ Realtime: notify-pull
```

| 维度 | 推荐（与现状一致） |
|---|---|
| 用户账号 | Supabase Auth（GoTrue）：邮箱密码 + OAuth（Google/Notion/Linear，CSP 已放行）+ 后续 Passkey |
| 数据库 | Supabase Postgres，RLS 按 `account_id` 行级隔离（代码已写） |
| 本地缓存 | Web=IndexedDB；App=SQLite+SQLCipher（均已实现）；写入先落本地再入 outbox |
| 离线 vs 云端 | **离线优先**；本地永远可读写，网络恢复后 outbox 批量 push、按 `account_commit_seq` 游标 pull |
| 同步节奏 | 近实时最终一致：写后 + 启动/聚焦/网络恢复 + 15–60s 轻量 pull + 手动同步 |
| 冲突解决 | **禁止静默 LWW**；用 `base_revision` + `proposed_revision` + `commit_seq`；简单字段自动合并，复杂实体进 `encrypted_blobs_conflict_shadow` 由 UI 提醒 |
| 多端登录态 | 每设备注册 `device_id` 取 `encryption_device_id` + 上传 `device_pub`(X25519)；per-device DEK wrap；设备列表 + 远程吊销；刷新令牌存 Keychain |
| 端到端加密 | AES-256-GCM + 确定性 CBOR AAD + HPKE per-device wrap + Ed25519 recovery 签名；**服务器零明文** |

### 6.2 数据模型（核心表）

> 表名以 `apps/release-site/supabase/migrations/` 实际迁移为准（下表已对齐实库）。

| 表 | 用途 |
|---|---|
| `accounts` | 账号基础信息（`id` = `auth.users.id`、email、加密显示名） |
| `sync_devices` | 多端设备注册、heartbeat、revoke |
| `encrypted_blobs` | 端到端加密业务数据 |
| `mutation_dedup` | 幂等写入（防重放） |
| `device_dek_wraps` | 每设备密钥包裹 |
| `encrypted_blobs_conflict_shadow` | 冲突检测与恢复 |
| `sync_audit_log` | 安全审计（append-only，hash-chain 完整性，配套 `sync_audit_account_state`） |

### 6.3 落地临界路径

1. 🔓 开通 staging + prod Supabase 项目（sync-v1 #9，外部人工，**总闸**）。
2. 部署已写好的 migrations + RLS + Edge Functions（`apps/release-site/supabase/`）。
3. 把 `LoginPage.tsx` 的 mock stub 换成真 Supabase Auth；并**补实现并部署 `account-delete` Edge Function**（未随仓库 shipped，合规硬前置）。
4. 过 hardening 准入门（#37，10 项 PRD checklist）。
5. 先把 **1 个实体**（如 `productivity.todo`）走通「双设备 30 分钟 100% 一致」验收（#56），再批量接。

### 6.4 每个上云实体必过的 9 项清单（ADR-0013 §D4）

`entityType`（注册到 `packages/core-data/src/entities.ts`）/ `schemaVersion`+迁移 / 本地存储映射（Web IndexedDB ↔ App SQLite）/ push 信封格式 / pull apply 规则 / 冲突策略（非 LWW）/ Web IndexedDB 测试 / App SQLite/outbox 测试 / 双设备同步 smoke。**device-local 实体严禁进远端 outbox。**

执行细节见 [`docs/runbooks/supabase.md`](runbooks/supabase.md)。

---

## 7. 上线前 Checklist

按「先发 Public Demo」最近路径给；带账号同步上线再叠加 §6.4。

| 类别 | 检查项 |
|---|---|
| 功能 | 24 模块逐个冒烟、模块开关开/关不崩、404→SPA 回退、深链直达、OAuth/Stripe 回调在生产域名正确 |
| UI / 主题 | 深色/浅色逐页（图表/Map/空状态）、跟随系统主题无闪烁 |
| 响应式 | 桌面/平板/移动断点、窄屏侧栏折叠、触摸目标 ≥44px、移动 Safari/Chrome/Firefox |
| 数据持久化 | 刷新恢复、清缓存兜底、**导出/导入 JSON**、IndexedDB 配额溢出降级 |
| 登录注册 | （带账号才必查）注册/登录/登出/重置密码/OAuth/token refresh/设备注册；Passkey stub 须隐藏或标注 |
| 安全 | CSP 无 unsafe-inline 漏网、无密钥进前端 bundle、确认 HSTS preload 提交意图（已 max-age 2 年 + preload，不可轻易回退）、RLS、Sentry 脱敏、`pnpm audit` 依赖扫描 |
| 性能 | Lighthouse ≥90、首屏 bundle 预算门、LCP/INP、Service Worker 离线壳、慢网可交互 |
| SEO / 官网 | title/description/favicon/OG image、robots.txt、sitemap.xml、PWA manifest |
| 法务 | 隐私政策、用户协议、账号删除、数据导出说明 |
| 运维 | Sentry 生产 DSN、Cloudflare Analytics、备份 + **restore drill**、回滚、release log |
| 文档 | 部署 runbook、env vars、migration 流程、故障处理 |

---

## 8. 成本估算（USD，个人开发者独立维护）

### A — 免费/极低成本（Demo/早期）
| 项 | 月 |
|---|---:|
| CF Pages | $0（带宽不限，500 builds/月） |
| Supabase Free | $0（7 天无活动暂停，仅 Demo 可接受） |
| Sentry Free | $0（5k errors/月） |
| GitHub Actions | $0（公共仓库免费） |
| 域名 | ~$1（$10–15/年摊） |
| **合计** | **≈ $1–2/月（$15–25/年）** |

### B — 推荐个人开发者方案（正式上线 + 账号同步）
| 项 | 月 |
|---|---:|
| CF Pages | $0 |
| **Supabase Pro** | **$25**（8GB DB / 100k MAU / 不暂停 / 每日备份） |
| Sentry | $0–26 |
| 域名 | ~$1 |
| Apple Developer | ~$8（$99/年，接 App 才需要） |
| **合计** | **≈ $26–60/月（$310–720/年）** |

### C — 用户增长后升级
| 触发点 | 升级 | 增量 |
|---|---|---:|
| MAU>100k / DB>8GB | Supabase Team($599/月) 或附加档 | 阶梯 |
| Postgres 瓶颈 | Neon serverless | $19+/月 |
| 实时网关/队列 | Fly.io / Railway | $5–30+/月 |
| 大文件存储 | Cloudflare R2（出口免费） | $0.015/GB/月 |
| Android 上架 | Google Play | $25 一次性 |

**拐点判断**：$0–25/月 可撑到「几千活跃用户」；接 Mac App 后 +$8/月；真正成本拐点在 ~10 万 MAU。

---

## 9. 维护与发布流程

```
日常开发  →  codex/<area>/<feature>  ──PR(test/build/preview)──▶  web (主线, 自动 preview)
                                                                    │
                                                       (ADR-0013 §D3 gate, W0–W4 + parity receipt)
                                                                    ▼
   App 联动:  web ──▶ desktop-next ──▶ dev ──▶ release/desktop/<ver> ──▶ tag vX.Y.Z
```

| 流程 | 做法 |
|---|---|
| 分支策略 | `web`=Web 主线；生产发布建议引入受保护的生产源（见 §12-A）。`dev`=App 聚焦线，触及需显式确认。 |
| staging/production | CF PR Preview = 天然 staging；Supabase **两套项目**（staging/prod），CI 用 staging key，人工 promote 到 prod |
| GitHub Actions | 部署前置 gate：lint + typecheck + test；后续补 App 签名/公证/DMG workflow |
| DB migration | 顺序文件、**只前进不回滚、向后兼容、带 `schemaVersion`**；先 staging 跑通 + RLS 绿 + 备份，再 promote；禁止生产控制台手改结构 |
| release log | 用 `xai-release-log` skill 维护 `release-log.md`（Why/What/Scope/Risk/Docs/Tests） |
| bug fix | P0 走 hotfix 分支，修复后补测试 + release log；非 P0 进普通迭代（`bug-diagnose → bug-fix → bug-verify → ship`） |
| 版本发布 | Web=`web@x.y.z` 注入 `VITE_RELEASE`（Sentry 关联）；App=`release/desktop/<ver>` + tag |
| 多端同步开发 | 每个上云实体过 §6.4 九项 + 双设备 smoke；Web→App 改动必经 D3 gate，**禁止 Web 改动直接并入 `dev`** |
| 每次上线前 | §7 checklist + preview 冒烟 + 回滚就绪确认 + operator 审批 |

---

## 10. 执行路线图（对应用户 Step 3）

> 每阶段：完成即 commit · 输出阶段性结果 · 更新本文 + 看板 + 部署记录。

### 阶段 1 — 部署架构落地（DevOps 闭环）
- [ ] **前置（§12-D）**：若 `web` 做 release source，先把部署文档/runbook/dashboard state 同步到 `web`，再动 CI；否则保持治理源在 `dev`、不改 CI。
- [ ] 决策并固化生产部署源分支（§12-A）；对齐 `deploy-web.yml` 触发分支。
- [ ] 跑一次真实「部署 → 登记 → 回滚」闭环；补 1 条 `deployment.records`。
- [ ] CI 加部署前置 gate（lint/typecheck/test）。
- **退出条件**：看板出现 ≥1 条真实 Web 生产部署记录 + 回滚演练记录。

### 阶段 2 — 云平台搭建（Supabase）
- [ ] 开通 staging + prod Supabase 项目（#9）。
- [ ] 部署 migrations + RLS + Edge Functions（`apps/release-site/supabase/`）。
- [ ] 配置 Auth（邮箱密码 + OAuth）；接 `VITE_WEB_AUTH_MODE=live`。
- [ ] 启用每日备份 + 做一次 restore drill。
- **退出条件**：staging 真实登录链路跑通；restore drill 通过。

### 阶段 3 — 数据同步层建设
- [ ] 过 hardening 准入门（#37）。
- [ ] 单实体（`productivity.todo`）双设备 30min 100% 一致验收（#56）。
- [ ] 按 §6.4 九项逐步接其余 account-sync 实体。
- **退出条件**：staging two-device sync smoke 通过。

### 阶段 4 — Web 上线准备
- [ ] 补「导出/导入 JSON」数据兜底。
- [ ] 补隐私政策 / 用户协议 / 账号删除 / 数据导出说明。
- [ ] 跑完整 §7 checklist（浏览器 + 移动 + 深浅色 + 刷新恢复 + 安全 + 性能）。
- **退出条件**：§7 全绿 + operator 发布审批。

---

## 11. 部署相关 Skill / Workflow

### 现有（直接复用）
| Skill | 部署用途 |
|---|---|
| `xai-release-log` | 记录发布/系统变更/验证/风险 → `release-log.md` + 看板部署记录 |
| `xai-web-to-desktop-sync` | D3 gate：Web 改动进 Desktop 前 W0–W4 分级 + parity receipt |
| `xai-feature-full-loop` | feature ship 步骤触发 Web 发布 |
| `xai-roadmap-loop` | 同步层 sync-v1 #1–#56 分波推进 |

### 规划（待执行阶段固化，本文先登记说明，暂不建包）
| Skill | 目的 | 触发时机 |
|---|---|---|
| `xai-web-deploy-preflight`（planned） | 上线前自动跑 §7 checklist + 校验 secrets/env/build/CSP + 提示回滚就绪 + 写 `deployment.records` | 真正跑过 2–3 次发布、流程稳定后固化 |
| `xai-account-sync-scope-check`（planned） | 校验新实体是否符合 §6.4 九项、`syncScope` 是否正确（device-local 不得入 outbox） | 同步层解冻、开始接实体时 |

> 规划 skill **不在本轮创建**（建包属执行/工具改动）；本文仅登记说明，避免过早抽象。

---

## 12. 待决策事项（operator 拍板）

| # | 决策 | 选项 | 建议 |
|---|---|---|---|
| **A** | Web 生产部署源分支 | (a) `web` 提升/合并到 `main` 再发；(b) Cloudflare Production 直接部署 `web` | 把 `web` 定为权威 Web release source，并调整 `deploy-web.yml` 触发分支。⚠️ `web…dev` 当前是 **~204/5 大分叉**，不是小差异。 |
| **B** | 首发模式 | Public Demo（mock-auth）/ Real-Auth Private Beta | **先发 Demo 拿反馈**，账号同步并行推进。**不要把 Real-Auth 当首发条件**（它还卡 Supabase + `account-delete` + 隐私合规）。 |
| **C** | Supabase 实例开通时机 | 立即 / 先开 staging，prod 等 Demo+真实登录 smoke 后 | 先开 **staging**；production 等 Demo 反馈 + 真实登录 smoke 通过后再开。 |
| **D** | 治理源 vs 发布执行源 | `dev`=治理/看板记录源；`web`=发布执行源 | 本轮两笔部署文档已落 `dev`（治理记录源，operator 已确认）。但**若决策 A 选 `web` 做 release source，进 Step 3 阶段 1（改 CI / 真实部署）前，必须先把这两笔部署文档 + runbook + dashboard state 同步/cherry-pick 到 `web`（或从 `web` 派生 deployment 分支执行）**，不能让"治理源在 dev、发布源在 web"长期分裂。 |

---

## 13. 参考文档

- [ADR-0008](adr/0008-cloudflare-deploy-target-and-csp.md) — Cloudflare 部署目标与 CSP
- [ADR-0013](adr/0013-branch-sync-governance.md) — 分支与同步治理（§D4 账号云同步）
- [ADR-0010](adr/0010-p1-desktop-resume-plan.md) — P1 桌面恢复计划
- [`docs/PRODUCT_MODULE_MAP.md`](PRODUCT_MODULE_MAP.md) — 六产品线导航
- [`docs/runbooks/cloudflare.md`](runbooks/cloudflare.md) — Cloudflare Pages 运维手册
- [`docs/runbooks/supabase.md`](runbooks/supabase.md) — Supabase / 同步后端运维手册
- [`docs/workflow/roadmap/sync-v1.md`](workflow/roadmap/sync-v1.md) — 同步层 #1–#56 实施清单
- [`docs/contracts/data-repository-v0.md`](contracts/data-repository-v0.md) — 数据仓库契约 / syncScope

---

## 变更记录

| 日期 | 变更 | 作者 |
|---|---|---|
| 2026-06-06 | 初版：综合部署成熟度审查（Claude + Codex 双方分析），沉淀为权威部署架构文档；定义六产品线部署矩阵、Web 两模式上线流程、账号云同步落地路径、4 阶段执行路线图与 4 项待决策 | project-system |
