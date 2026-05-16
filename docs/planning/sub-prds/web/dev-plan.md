# Web 子开发方案 — XAI_Desktop 网页版

| 字段 | 值 |
|---|---|
| 父 PRD | `docs/planning/2026-05-12-PRD-v1.md`(主 PRD §10.2 / §5.15) |
| 本档 PRD | `./PRD.md`(Web 子 PRD) |
| 归属 Phase | Phase 4.5(4-6 周,主 PRD §10.6 路线图) |
| 文档作者 | Claude(subagent) |
| 创建日期 | 2026-05-14 |
| 状态 | DRAFT v0.3(2026-05-16 同步 PRD v0.3 的契约二次重写 + 排期拆 Phase 4.5a/4.5b)|

---

## 1. Phase 4.5 目标

> v0.3 codex Minor 调整:4-6 周排期已不可信(v0.2 + v0.3 新增 Sync blob driver、本地 FTS、设备会话、三方 diff、CSP nonce edge、真机矩阵、entity_blobs + entity_sort_keys 加密索引、sync_events seq、Quick Capture envelope、CSP `/__csp_report` 自建端点、X-Device-Id middleware 等)。**拆为 Phase 4.5a 核心 Web(4 周)+ Phase 4.5b 离线/PWA/合规硬化(4 周)= 共 8 周**,worst case 10 周。

主 PRD §10.6 路线图给 Web 的时间窗原为 4-6 周,v0.3 修订为 **8-10 周**;夹在 Phase 4(AI 注入)与 Phase 5(账号 + 同步完善 + 公测)之间。

> 累计窗口:36 → 44/46 周(2026-12-08 进入 → 2027-02-02/2027-02-16 出门,主 PRD v1.0 GA 目标 2027-05;若 Phase 4.5b 与 Phase 5 部分并行则可拉回 2027-01)。

**Phase 4.5 收尾标准**:
1. `app.xai-desktop.app` 在 staging 跑通完整流程(注册 / 登录 / 三模块编辑 / 同步 / 离线)
2. 桌面 ↔ Web 5s 内双向可见(真机+浏览器并排)
3. Lighthouse 主路径 Performance ≥ 80、A11y ≥ 90
4. Chrome / Safari / Firefox 三浏览器 Playwright 全 green
5. Sentry 接好 + source map + 隐私 redact 验证

未达标的项不直接阻塞 Phase 5(账号同步公测可以并行打磨),但**列为 Phase 5 必清的债**,见 §7 验收门。

---

## 2. 前置依赖

| 依赖 | 来源 | 必须状态 |
|---|---|---|
| `core-data` SQLite driver 稳定 | Phase 0 子阶段 0.3 | ✅ Stable(已交付才能起 Phase 4.5) |
| `core-data` Sync blob driver 占位 trait | Phase 0 子阶段 0.3 | ✅ Repository trait 定义完(ADR-0003 衍生);本档 §5.2 在此 trait 上实现 Sync push/pull 协议绑定 |
| `plugin-console` 三栏外壳 | Phase 2.5 | ✅ Stable;在桌面端跑通真机 |
| `plugin-productivity` / `plugin-project` / `plugin-labels` / `plugin-calendar` / `plugin-account` | Phase 2 / 2.5 | ✅ Stable;`manifest.windows.web = true` 已就位 |
| Supabase 后端骨架(Auth + Postgres + Realtime) | Phase 0 子阶段 0.3 | ✅ schema 已 deploy;Auth 已开通 OAuth provider |
| 同步层 v1(增量 + E2E + 冲突 LWW) | Phase 5(主 PRD §5.9)— 但 **Web 启动前需 v0 可用** | ⚠️ Phase 4.5 启动时同步层至少 v0(单端推/拉跑通),Phase 5 与 Web 并行打磨 |
| Apple Developer 账号 + OAuth client(Apple/Google) | Phase 0 末 | ✅ |
| 域名 `xai-desktop.app` 已注册 + DNS 接 Vercel/CF | Phase 0 末 | ✅ |

**风险阻塞**:若任一前置不到位,Phase 4.5 不启动,改先补齐(参考主 PRD R-00 思路:不在坏地基上盖楼)。

---

## 3. 任务分解(按周拆,Phase 4.5a 4 周 + Phase 4.5b 4 周;worst case +2 周)

> v0.3 codex Minor:排期独开全职;原 4-6 周不可信;改为两阶段。每周收尾产出可演示物 + 真机/真浏览器走查。
>
> **Phase 4.5a 核心 Web(Week 1~4)**:可登录 / Sync blob driver / 三模块跑通 / Realtime metadata / 主密码解锁;staging 可演示但不公开。
> **Phase 4.5b 离线/PWA/合规硬化(Week 5~8)**:离线编辑队列 + dead-letter + 三方 diff + PWA + CSP enforce + 真机矩阵 + 客户端导出 + 账号删除 + 多设备 + 部署管线;`staging.app.xai-desktop.app` 公开可访问 + 内部灰度。
>
> 原 Week 1~6 标签下文保留,但归类到 Phase 4.5a/b。

### Phase 4.5a / Week 1 — 骨架 + 认证

**目标**:`apps/web` 可启动,登录后落到空白 SPA。

| 任务 | 输出 |
|---|---|
| 创建 `apps/web/` 目录(`package.json` + `vite.config.ts` + `tsconfig.json`) | scaffold |
| 配 Turborepo task(`build` / `dev` / `lint`) | turbo.json 更新 |
| Router 骨架(`/`, `/auth/*`, `/app/*`)+ 路由级权限保护 | `routes/` |
| AuthProvider:Supabase JS SDK 初始化 + onAuthStateChange + Context | `providers/AuthProvider.tsx` |
| 登录页 / 注册页 / 找回密码 / OAuth 回调 / 邮箱验证 | FR-WEB-08~13 |
| Supabase JS SDK **自定义 storage adapter**(IndexedDB + AES-GCM 加密 at-rest)| `providers/AuthProvider.tsx` 内部 |
| OAuth PKCE flow(state + code_verifier 走 sessionStorage;`exchangeCodeForSession`;`next` 白名单)| FR-WEB-11/12/20b/20c |
| 自建 `devices` / `sessions` 表 + 4 个 RPC(`device_register` / `device_heartbeat` / `device_revoke` / `revoke_others_rpc`)| Supabase SQL migration + RLS |
| 登录后调 `device_register`;每 5min `heartbeat`;`visibilitychange=visible` 立即一次 | `providers/DeviceProvider.tsx` |
| Sentry web SDK init(env: web-dev) | `providers/SentryProvider.tsx` |
| landing page 占位(`/`)— 最小 hero + "立即试用" + "下载 macOS App" | `pages/Landing.tsx` |

**Week 1 演示物**:本地 `pnpm --filter @repo/web dev` → 注册 → 邮箱验证 → 登录 → 落到空白 `/app/todos`。

**Week 1 风险**:(a) OAuth 回调在 localhost 坑(redirect URI 必须 https 或 localhost 例外 + Supabase Dashboard allowlist);(b) `devices`/`sessions` 表 + RPC 需要 Sync 子 PRD 同步确认 schema(本档 PRD §5.1.3 给的是初稿);(c) Argon2id WASM 在低端 iPhone 上的延迟。

### Phase 4.5a / Week 2 — Sync blob driver + entity_blobs + 第一个模块(Todo)

**目标**:Todo 模块可用,数据走 Sync push/pull encrypted blob 通道。

| 任务 | 输出 |
|---|---|
| `packages/core-data/src/driver-sync-blob/` 实现(**不是 driver-rest**)| 实现 Repository 接口;内部调 `/sync/pull`、`/sync/push`、RPC;仅传 encrypted_blob;**所有请求带 `X-Device-Id`**(FR-WEB-17e) |
| 端点契约对齐 `sub-prds/sync/PRD.md`(若未提交则与同步层 agent 联合定 v0)| `apps/web/src/contracts/sync.ts` |
| **IndexedDB 三层存储**:`entity_blobs`(encrypted 原件)+ `entity_index`(非敏感 metadata)+ `entity_sort_keys`(DEK 派生 index key 加密 sort key) | §8.2 schema |
| `sync_state.cursor` + `sync_state.sentinel` 本地 cursor / 回收检测 | IndexedDB |
| 本地全文搜索(`flexsearch` 基准选定)**Worker 内存 only**;主密码 lock / 5min idle wipe;持久部分只存 entity_id → blob 反向指针 | Web Worker;FR-WEB-22c |
| mutation 幂等性:`mutation_id`(uuid v7)+ `idempotency_key`(sha256) | FR-WEB-24 |
| `base_version` + 服务端 409 处理 | FR-WEB-43 三方 diff 数据基础 |
| 加密前入队的 mutation pipeline(DEK 在内存才允许加密字段写)| FR-WEB-41/46 |
| TanStack Query v5 集成 + persistor(IndexedDB)| `providers/DataProvider.tsx` |
| 重试 + 退避 + jitter + dead-letter + 错误 toast + 401 跳登录 | FR-WEB-24~25 |
| `plugin-productivity` 注册到 `apps/web/src/main.tsx` | import register |
| Todo list / detail / 完成 / 加 Todo / 改标题 可用(本地 entity_index 渲染)| 复用 ConsoleView |
| 移动断点初步实现(Todo 单栏切换)| FR-WEB-47 |

**Week 2 演示物**:Web Todo CRUD 全走 Sync push/pull 通道,网络面板验证只有 `/sync/*` 请求(无 `/rest/v1/todos`);刷新页不丢数据;本地搜索可用。

### Phase 4.5a / Week 3 — 实时同步(seq WAL)+ 项目管理 / Labels / Calendar / Habits

**目标**:第二批模块上 + Realtime 通道打通。

| 任务 | 输出 |
|---|---|
| Realtime 订阅封装(`packages/core-events/src/web-bus.ts`)| BroadcastChannel + Supabase `sync:<account_id>` 双桥;**metadata-only + seq**(payload `{entity_type, entity_id, seq, server_updated_at, originator_device_id}`) |
| 收到 metadata → 入 pull queue(去抖 300ms)→ 调 `/sync/pull` body `{since_seq, entity_types, limit:200}` → 本地解密 → 失效 TanStack Query | FR-WEB-31~35 |
| 重连指数退避 + jitter + **seq gap 检测**(`seq !== last_seen_seq+1` 触发补齐)+ visibilitychange catch-up + WS 失败降级 polling | FR-WEB-33~34b |
| 多标签 leader 选举(`feature-detect` `BroadcastChannel` + `Web Lock API`,缺失时降级 `localStorage` storage 事件;**iOS PWA standalone vs Safari tab partition 不通的兜底必须验证**)| FR-WEB-37 / FR-WEB-79b |
| `device_revoked` Realtime 事件 → 被撤销设备立即 signOut + 清 IndexedDB | FR-WEB-17 |
| 桌面 ↔ Web 5s 双向同步实测(真机 + Chrome)| FR-WEB-36 |
| `plugin-project` 注册 + 看板视图 web build | 复用 |
| `plugin-labels` 注册 + Labels 管理页 | 复用 |
| `plugin-calendar` 注册 + 桌面日历(网页版只读为主)| 复用 |
| `plugin-productivity` 中的 Habits 视图启用 | 复用 |
| Console host 注入桩(`packages/core/src/host/web/`):文件下载 / 通知 / 快捷键 / DnD / 设置 / 搜索 adapter / 错误边界 | PRD §4.2 契约 |
| sidebar 集成 + 模块切换 | 复用 ConsoleHost(`WebHost`)|

**Week 3 演示物**:三栏 console UI 在浏览器中跑通 4 个模块;两台设备同账号实测同步。

### Phase 4.5a / Week 4 — 主密码 / E2E 解锁 + Phase 4.5a 收尾

**目标**:主密码解锁链路 + entity_sort_keys 加密索引 + Phase 4.5a 收尾(staging 可演示但未公开)。

| 任务 | 输出 |
|---|---|
| 主密码 challenge 弹窗(登录后单独询问)| FR-WEB-20/88 |
| Argon2id WASM(`hash-wasm`,memoryCost 64MB / iter 3)接入 + 真机基准(低端 iPhone P95 < 1.5s)| KEK 派生 |
| `encrypted_dek` 本地 IndexedDB 镜像 + 服务端拉 | FR-WEB-46 |
| **`entity_sort_keys` 加密敏感 sort key**(DEK 派生 index key,AES-GCM,每条独立 nonce);解锁后批量解密 + 写入 | §8.2 / FR-WEB-22b |
| Worker 内 FTS 索引重建(分批解密 `entity_blobs` + flexsearch index);进度条 + 5min idle wipe | FR-WEB-22c |
| 主密码输入 Uint8Array 处理 + zeroize best effort + JS limit 声明 | FR-WEB-88 |
| E2E 字段渲染分支:有 DEK 显明文(从 entity_blobs 即时解密),无 DEK 显"已加密"(只用 entity_index 元数据)| FR-WEB-117 |
| KEK / DEK 内存生命周期管理(5min idle 自动清零 + 提示用户 + Worker FTS index 清)| FR-WEB-89/46b |
| Phase 4.5a 收尾验证:登录 / 三模块跑通 / Realtime metadata 5s / 解锁后可读写加密 | 内部演示 |

**Week 4 演示物**:登录 → 三模块跑通 → 主密码弹窗 → 解锁后看到所有 Todo / 看板内容;5min idle 后自动 lock,加密字段切回占位;Worker FTS index 重建可见进度。

> **Phase 4.5a 完成度准入(进 Phase 4.5b 前)**:Week 1~4 全部任务可演示;Sync 子 PRD 必须给出 v0 `sync_events seq` 实现 + devices/app_sessions 表 + X-Device-Id middleware,否则 4.5b 不启动。

### Phase 4.5b / Week 5 — 离线编辑 + Service Worker + 冲突 diff

**目标**:断网体验过关;敏感字段端到端可用;dead-letter + 三方 diff 走通。

| 任务 | 输出 |
|---|---|
| Service Worker 注册 + Workbox 配置(precache revision 绑 git SHA;HTML no-store + immutable assets) | FR-WEB-44 / §9.4.1 |
| SW 紧急 kill switch(`/sw-kill.js` + `/?reset=1`)| FR-WEB-45 |
| **IndexedDB 加密前入队 mutation 实现**(`pending_mutations` 只存 encrypted_blob;DEK 不在内存禁止任何业务实体写入,**v0.3 删非加密快路径**)| FR-WEB-41/46 |
| `dead_letter_mutations` Object Store + 失败 ≥ 3 次入队 + UI "未同步更改"页 + 手动重试/丢弃/导出 | FR-WEB-24c/43c |
| 离线检测(`navigator.onLine` + 主动 ping + WS DISCONNECTED 任一为 true)+ sidebar 状态指示 + 全局 banner | FR-WEB-39/40 |
| **三方 diff 冲突 UI**:base / local / remote 三栏(从 `entity_blobs` + `pending_mutations.base_encrypted_snapshot` + server 409 返回的 `remote_encrypted_blob` 各自解密)+ 选保留方 + audit log 写入 | FR-WEB-43 |
| 离线 mutation 限额 500 + dead-letter 算入限额 + 顶部 banner | FR-WEB-42 |

**Week 5 演示物**:关 Wi-Fi 改 5 条 Todo + 1 条 note(DEK 在内存)→ 联网 30s 内全部 push;DEK 不在内存时尝试改业务实体 → 拒绝并提示输主密码;制造冲突(两端同时改)→ 三方 diff 弹出可选保留方。

> **注**:原 v0.2 dev-plan 把 Week 5 的内容大杂烩塞了安全 + 部署 + PWA + 多设备 + 导出 + 真机,v0.3 拆为 Week 6(多设备/安全栈/导出)+ Week 7(PWA/i18n/部署/兼容性)。原 "Week 5 演示物 = staging 公开访问 + A+" 改为 Week 7 演示物。

### Phase 4.5b / Week 6 — 多设备 + 安全栈 + 客户端导出

**目标**:多设备登出真实可用;CSP 灰度到 enforce;客户端导出与账号删除跑通。

| 任务 | 输出 |
|---|---|
| 多设备页(`devices` 视图 + `device_revoke` RPC + Realtime 联动)| FR-WEB-17/17b/17c |
| **X-Device-Id middleware**:服务端中间件(Sync 子 PRD 提供;Web 端 e2e 验证被撤销设备业务 API 403)| FR-WEB-17e |
| 跨标签会话同步 BroadcastChannel + Web Lock leader 选举 + partition 兜底 | FR-WEB-15/37/79b |
| **数据导出走客户端打包**(Blob URL + JSZip in Worker;DevTools 验证服务端零接触明文)| FR-WEB-118/119 |
| 账号删除 + 30 天恢复窗口(`deletion_scheduled_at` / `deletion_requested_at`)+ Realtime `account_deleted` 广播 | FR-WEB-120/121 |
| Cookie / consent banner(必要 / Sentry / 分析三档分离)+ GDPR 子处理者清单页 | FR-WEB-122/122b/123/123c |
| CSP `/__csp_report` 自建端点(Vercel/CF edge function + Supabase `csp_violations` 表) | FR-WEB-82 |
| CSP 先发 **Report-Only**(staging 1 周收 violation 到 csp_violations 表)→ 修代码 → enforce | §5.12.2 / FR-WEB-82b |
| Vercel/CF edge middleware 注入随机 nonce 给 `style-src 'nonce-...'` | §5.12.3 |
| HSTS / Referrer-Policy / X-Frame-Options / Permissions-Policy / Report-To headers | FR-WEB-80~87b |
| `securityheaders.com` 扫到 A+ | 验证 |

**Week 6 演示物**:登录 A → 登录 B → A 撤销 B → B 在线即时收 Realtime 登出;B 离线后再上线调 `/sync/*` 服务端 403 `device_revoked` → 自动清 IndexedDB + 重登;客户端导出在 DevTools network 面板验证无明文 zip。

### Phase 4.5b / Week 7 — PWA + i18n + 部署管线 + 兼容性

**目标**:`staging.app.xai-desktop.app` 公开可访问;Lighthouse + Web Vitals 达标;真机矩阵跑通。

| 任务 | 输出 |
|---|---|
| PWA manifest + apple-touch-icon + iOS A2HS + 安装提示策略(3 次操作 + 无桌面 App + 14 天冷却)| FR-WEB-55~58 / §5.7.1 |
| i18n 三语切换(zh-CN/zh-TW/en);登录后 account-global,登录前 localStorage 兜底 | FR-WEB-98~102 |
| 部署管线:GitHub Actions → Vercel preview / staging / prod 三档 | §9 |
| Sentry sourcemap CI 固定顺序:`releases new → set-commits → sourcemaps inject → upload --validate → finalize → 删除 .map → deploy → deploys new` | FR-WEB-95 |
| Sentry redact 单测断言:entity_id 不在 payload(只见短 hash)、query string 已清、扩展事件不上报 | FR-WEB-94 |
| Playwright CI 四浏览器矩阵(chromium/webkit/firefox/Edge)+ Web Vitals RUM(LCP/INP/CLS/TTFB)按 route_group 分桶 | FR-WEB-70 / CI 配置 |
| Lighthouse CI 门(landing Perf ≥ 90 / `/app/todos` ≥ 80)+ bundle 体积监控(`size-limit`)| FR-WEB-68/69 |
| 移动浏览器 viewport 验证:无 `maximum-scale=1`,可双指缩放;visualViewport 监听键盘;输入字号 ≥ 16px | FR-WEB-111/49b |
| Safari `persisted()` + sentinel 兜底真机走查(7 天未访问回收恢复链路)| FR-WEB-78b |
| **真机走查清单**:macOS Safari / iPhone Safari / Android Chrome / Firefox ETP / Edge 企业策略 | §5.11.2 |

**Week 7 演示物**:`staging.app.xai-desktop.app` 公开访问;扫 A+;Lighthouse 通过门;真机走查清单全 ✅。

### Phase 4.5b / Week 8 — buffer / 真机走查 / 文档 / 私测放量

**目标**:Phase 5 公测前的最后打磨。

| 任务 | 输出 |
|---|---|
| §10.1 M5 验收清单全过 | 全部 ✅ |
| 中国大陆访问性 PoC(若未在 Week 1 做)+ 速度数据 | RW-08 决策 |
| 隐私政策 + 服务条款 zh-CN/zh-TW/en 三语 | FR-WEB-123 |
| Sentry redact 测试(写 unit test 断言 beforeSend 抹掉 entity body) | FR-WEB-94 |
| Source map 上传 + 模拟错误验证可解栈 | FR-WEB-95 |
| 内部 5-10 人灰度(从 Phase 4 收的早期用户中挑) | 反馈收集 |
| 已知 bug 列表 + 优先级 | dev_log.md |
| dev_log.md 状态置 READY_FOR_VERIFY | 交接 |

**Week 8 演示物**:可以发邀请给 Phase 5 公测群。

> Week 8 是 buffer;若 Week 1~7 顺,Week 8 可提早收尾(留时间给 Phase 5);若不顺,可加到 Week 9~10 worst case。

---

## 4. 接口契约

### 4.1 后端 endpoint 清单(Web 直接调用)

> 详细签名 / 错误码 / 鉴权头对齐 `sub-prds/sync/PRD.md`;本节是 Web 端依赖的清单视图。

| 模块 | endpoint | 方法 | 说明 |
|---|---|---|---|
| Auth | `/auth/v1/signup` | POST | Supabase 默认 |
| Auth | `/auth/v1/token?grant_type=password` | POST | Supabase 默认 |
| Auth | `/auth/v1/token?grant_type=refresh_token` | POST | Supabase 默认;**滚动 refresh token** |
| Auth | `/auth/v1/recover` | POST | 找回密码 |
| Auth | `/auth/v1/authorize?provider=apple/google` + PKCE | GET | OAuth 跳转(PKCE flow,带 `code_challenge`)|
| Auth | `/auth/v1/verify` (`type=signup` / `recovery` / `magiclink`) | POST | OTP / 邮箱验证 |
| Auth | `/auth/v1/logout` | POST | 注销(scope='local') |
| Sync | `/sync/pull` | POST | `{since_seq, entity_types?, limit≤500}` → `{items[], next_seq, has_more}`;**仅返 encrypted_blob + metadata + seq**;服务端**始终分页** |
| Sync | `/sync/push` | POST | `{mutations[]}` → 逐条 ok / conflict / rejected / device_revoked;含 `idempotency_key` 24h 去重;`blob_aad` 必含 entity_id||version,server verify |
| RPC | `/rest/v1/rpc/device_register` | POST | `{device_id, platform, device_name, user_agent}` |
| RPC | `/rest/v1/rpc/device_heartbeat` | POST | `{device_id}` |
| RPC | `/rest/v1/rpc/device_revoke` | POST | `{device_id}` → Realtime 广播 |
| RPC | `/rest/v1/rpc/revoke_others_rpc` | POST | 批量撤销除当前外 |
| RPC | `/rest/v1/rpc/device_list_rpc` | POST | 读 `devices` 视图 |
| RPC | `/rest/v1/rpc/account_request_delete` | POST | 触发账号删除(30 天延迟)|
| RPC | `/rest/v1/rpc/account_undelete` | POST | 30 天内恢复 |
| RPC | `/rest/v1/rpc/capture.create` | POST | **P2**;浏览器扩展 quick capture;**仅接 encrypted payload** + scope `quick_capture:write` + 固定 extension ID allowlist |
| Storage | `/storage/v1/object/avatars/...` | GET/PUT | 头像(非加密)|
| Realtime | `wss://<project>.supabase.co/realtime/v1/websocket` | WS | 订阅 channel `sync:<account_id>`、`presence:<account_id>`;**metadata-only payload**(不订 postgres_changes) |
| Health | `/healthz` | GET | 自检 |

**已删除**:`/rest/v1/<business_table>` 直连(todos/lists/boards 等),因服务端零知识无明文业务字段;统一改 `/sync/push` + `/sync/pull` 的 encrypted_blob 通道。**保留**的 PostgREST 表只有 `accounts`、`account_settings`(account-global 明文部分)、`devices`、`sessions`、`audit_logs`。

**鉴权**:所有 `/sync/*` 和 `/rest/v1/*`(除 `device_register`)走:
```
Authorization: Bearer <access_token>
apikey:        <anon_key>
X-Device-Id:   <device_uuid>     -- v0.3 必传;服务端 middleware 校验 devices.revoked_at IS NULL
X-Sync-Version: 2026-05
```

服务端 middleware 错误码:`401 unknown_device` / `403 device_revoked { revoked_at }` / `426 upgrade_required`。

**版本协商**:`X-Sync-Version: 2026-05`(初版);后端 `Sunset` header / 426 Upgrade Required 触发升级提示。

**服务端 schema 增量(Sync 子 PRD 实施)**:`encrypted_blobs`(整 row 加密)+ `sync_events(account_id, seq BIGINT)`(per-account WAL)+ `devices` + `app_sessions`(无 refresh_token_hash)+ `audit_logs` + `csp_violations`(自建 CSP report 落地)。**没有** 业务表 `todos` / `lists` / `boards`,**也没有** `account_settings`(走 encrypted_blob 的一种 entity_type)。

### 4.2 WebView slot vs ConsoleView slot 的差异

> 来自 `PLUGIN_SDK.md §3.1`:`PluginComponents.WebView` 与 `.ConsoleView` 同源,但接受不同 `host` 注入。

| 维度 | ConsoleView | WebView |
|---|---|---|
| 数据 driver | SQLite | **Sync blob**(实现 Repository,底层走 Sync push/pull encrypted blob + X-Device-Id 强制校验;本档 §4.1)|
| 事件总线 | Tauri event | BroadcastChannel + Supabase Realtime(`sync:<account_id>` metadata-only + per-account `seq` WAL)|
| 文件能力 | core-fs(NSWorkspace 等)| core-fs web stub(只支持下载 / blob URL,不支持本机路径)|
| 通知能力 | macOS UserNotifications | Web Notification API(P1)/ 内嵌 toast(P0)|
| 快捷键 | tauri-plugin-global-shortcut | KeyboardEvent + 浏览器保留键避让(`/` 触发搜索,不绑 Cmd+K)|
| 窗口管理 | core-window | 浏览器原生(history / tab close / visibilitychange 监听)|
| 文件拖入 | Tauri onDragDropEvent | HTML5 DnD API(仅文本/URL,不读真实路径)|
| 剪贴板监听 | NSPasteboard polling / NSEvent | **不支持**(manifest 静态剔除,build 失败兜底)|

**默认实现策略**:大多数 plugin **只实现 ConsoleView**,WebView 通过同一组件 + 在 host 层注入的不同 hook 实现复用(零 import 区分);只有需要平台分支的 plugin 显式提供独立 `WebView`(如 plugin-organizer 在 Web 上 GridContent 是只读卡片预览,不接拖入)。

### 4.3 EventMap Web 端补充

继承 `PLUGIN_SDK.md §4.1` 的 `web:*` 前缀,Phase 4.5 落地:

```ts
'web:realtime-connected': { account_id: string };
'web:realtime-disconnected': { reason: string };
// metadata-only;不含 record;v0.3 加 seq
'web:realtime-event': {
  entity_type: string;
  entity_id: string;
  seq: number;                              // per-account WAL 序号(v0.3 新增)
  server_updated_at: string;
  originator_device_id: string;
  version: number;
};
'web:realtime-device-revoked': { device_id: string; revoked_at: string; reason: string };
'web:device-id-rejected': { reason: 'unknown_device' | 'device_revoked'; revoked_at?: string };
'web:realtime-account-deleted': { scheduled_at: string };
'web:offline-mode-changed': { online: boolean; downgradeToPolling: boolean };
'web:pending-mutation-flushed': { count: number };
'web:pending-mutation-dead-lettered': { mutation_id: string; reason: string };
'web:conflict-detected': { entity_type: string; entity_id: string; mutation_id: string };
'web:master-password-required': {};
'web:master-password-resolved': {};
'web:master-password-idle-expired': {};
```

新增事件必须先在 `packages/core-events/src/event-map.ts` 添加类型 + 在 manifest emit/listen 声明,再写代码。

---

## 5. 测试策略

### 5.1 单测(Vitest)

| 范围 | 覆盖率 | 备注 |
|---|---|---|
| `apps/web/src/` | ≥ 50% | Host 层逻辑少,重点测 providers / 路由守卫 / device fingerprint |
| `packages/core-data/src/driver-sync-blob/` | ≥ 85% | 关键 driver,bug 影响所有模块;两 driver 契约测试 + spec 共享 |
| `packages/core-events/src/web-bus.ts` | ≥ 80% | 同上;含 cursor gap / leader 选举 |
| Plugin 复用:无新增覆盖率(plugin 已在桌面端覆盖)| — | 但需 web build 模式下 smoke 跑通 + manifest 静态剔除验证 |

**重点测试用例**(v0.3 扩展):
- Sync blob driver:加密前入队、mutation_id / idempotency_key 去重、base_version 409 处理、dead-letter 进入与重试、`blob_aad` 校验
- Realtime metadata → pull trigger / **seq gap 检测** / visibilitychange catch-up / WS 降级 polling
- **X-Device-Id middleware**:被撤销设备业务 API 全 403;`device_revoked` 客户端拦截即时登出
- **本地 at-rest 加密**:`entity_blobs` ciphertext 写入与读取;`entity_sort_keys` DEK 派生 index key 加解密;Worker FTS index lock 时 wipe;关页重启后 IndexedDB 中无明文 sort key
- 离线编辑:DEK 在内存正常加密;DEK 不在内存拒绝任何业务实体写(v0.3 删非加密快路径)
- **Token at-rest 加密**:wrap_key non-extractable;关浏览器重开 unwrap 成功;切账号 wrap_key 替换
- KEK 派生(Argon2id WASM)+ DEK 解密 + 内存清零(5min idle)+ Uint8Array.fill(0) zeroize
- 跨标签 BroadcastChannel 登出广播 + leader 选举 + **PWA standalone vs Safari tab partition 降级路径**
- PKCE flow:state/code_verifier 校验 + open-redirect 兜底(v1 `next` 白名单无 `/share`)+ Apple private relay 接受
- Sentry beforeSend redact:断言 **entity_id 不在 payload(只见短 hash)**、query string 已清、扩展事件不上报
- CSP 自建 `/__csp_report` 端点 scrub + `csp_violations` 表落地;Sentry opt-in 转发分支
- **Safari IDB sentinel 兜底**:删 sentinel → 触发全量重拉

### 5.2 集成(Vitest + msw)

mock fetch + IndexedDB(`fake-indexeddb`)跑:
- 登录 → 拉数据 → 缓存命中
- 关网 → 改数据 → 联网回放
- 多个 mutation 合并写

### 5.3 E2E(Playwright)

**浏览器矩阵**:Chromium + WebKit + Firefox(每 PR 跑 chromium,merge 前跑全套)。

**核心 flow**:
1. 注册 → 邮箱验证 → 登录 → 看到 Todo;Apple PKCE + private relay 兜底单独跑
2. 加 Todo → 改 → 完成 → 刷新仍在;Sync push/pull 网络面板验证(无 PostgREST 业务表 CRUD)
3. 切到项目管理 → 拖卡片 → 看板状态变;Realtime metadata → pull trigger 链路
4. 模拟离线 → 改 5 条 → 上线 → 全部同步;模拟 4 次失败 → dead-letter 队列
5. 主密码弹窗 → 输入 → 加密字段可见;DEK 不在内存时加密字段写被拒
6. 多设备:登录 A → 登录 B → A 撤销 B → B 收到 Realtime 立即登出
7. 数据导出:本地解密 + 下载 zip;DevTools 验证服务端只有 encrypted blob
8. 移动 viewport(iPhone 13)Todo 完成;可双指缩放(无 maximum-scale)
9. 30 分钟挂线 → reconnect → cursor gap 触发全量 catch-up,无丢数据
10. 制造冲突(并排开两 tab 同时改同一 Todo)→ 409 → 三方 diff UI

### 5.4 Lighthouse CI

```yaml
# .github/workflows/lighthouse.yml
- assert: performance >= 80
- assert: accessibility >= 90
- assert: best-practices >= 90
- assert: seo >= 90
```

路由覆盖:`/`、`/auth/login`、`/app/todos`(空数据 + 50 条数据两个 fixture)。

### 5.5 浏览器存储模拟测试

用 `fake-indexeddb` + `vitest` 跑:
- 配额超限处理
- 数据库版本升级迁移
- 清站点数据后恢复

### 5.6 真机 / 真浏览器走查清单(每周末跑一次)

| 设备 | 浏览器 | 验证点 |
|---|---|---|
| MacBook | Chrome / Safari / Firefox | 三栏布局 / 同步 / 离线 |
| iPad(模拟器) | Safari | 平板两栏 |
| iPhone | Safari | 移动只读 + Todo 完成 |
| Android(模拟器) | Chrome | 移动只读 |
| Windows VM | Edge | 桌面三栏 + 同步 |

---

## 6. 风险登记(Web 特有,与 PRD §11 一致;v0.2 同步)

| ID | 风险 | 缓解 | 触发标志 |
|---|---|---|---|
| RW-01 | Service Worker bug 导致 stale 缓存 | HTML no-store + precache 绑 git SHA + 紧急 `/sw-kill.js` + `Clear-Site-Data` header | 用户反馈"看到旧版本" |
| RW-02 | Safari ITP 阻止 OAuth | PKCE flow + 同源 callback + sessionStorage 存 state;真 macOS Safari 走查 | Playwright WebKit + 真机 fail |
| RW-03 | Supabase Realtime quota | 多标签共享 channel + WS 失败降级 polling | Supabase Dashboard 报警 |
| RW-04 | 主密码遗忘 | 注册强制助记词;UI 反复提示 ≠ 账号密码 | 客服 ticket |
| RW-05 | 中国大陆访问慢 | Week 6 PoC;若 P95 > 5s 则 Phase 5 切 CF Pages | RUM 数据 |
| RW-06 | 数据 driver 双 driver 行为漂移 | 契约测试两 driver 跑同一 spec | 契约测试 fail |
| RW-07 | E2E 字段在错误日志泄漏 | Sentry beforeSend + 单测断言 + code review checklist | Sentry 抽查 |
| RW-08 | 离线编辑顺序冲突 | mutation_id + idempotency_key + base_version + 三方 diff;v1 不做 CRDT | 用户反馈 |
| RW-09 | PWA 安装后行为偏离 | standalone 与 tab 行为一致;不做独立功能 | 手动验证 |
| RW-10 | `.app` 域名证书 / HSTS preload 故障 | 多 CA 备份 + 监控 + Vercel 自动续 | 证书到期告警 |
| RW-11 | Sync 子 PRD v1 未完成时 Web 上线 | Phase 4.5 准入门:Sync v0(含 encrypted_blobs + devices/sessions 表)至少跑通;v1 完善与 Web 并行 | Sync 子 PRD dev_log 状态 |
| RW-12 | bundle 体积超预算 | CI 体积门 + lazy 拆分 + dynamic import 检查 | CI fail |
| RW-13 | **(v0.2)**Web Storage token XSS 直读 | 严格 CSP + 无 unsafe-inline + SRI + react-markdown sanitize + ESLint no-danger + 短 TTL + Dependabot + 月度 audit | CSP violation / npm audit fail |
| RW-14 | **(v0.2)**WS 被企业代理禁 | polling 降级 + UI 显式告知 | WS 连续失败计数 |
| RW-15 | **(v0.2)**mutation 重复/顺序乱 | idempotency_key 24h 去重 + base_version If-Match + dead-letter | 服务端 audit log |
| RW-16 | **(v0.2)**Console 与 Web 设置漂移 | §5.6.1 device-local vs account-global 映射表 | 设置同步抽查 |
| RW-17 | **(v0.2)**share envelope 协议延迟 | Share 链接 v1 不实现,P1 触发条件清晰 | Sync 子 PRD share envelope 章节 |
| RW-18 | **(v0.2)**devices/sessions 迁移依赖 | Phase 4.5 启动前 Sync 子 PRD 必须确认 §5.1.3 schema | Sync 子 PRD 状态 |
| RW-19 | **(v0.2)**本地 FTS 性能差(大账号)| Web Worker 跑 + 增量索引 + 分批解密;低端机基准测 | Web Vitals INP > 200ms |
| RW-20 | **(v0.3)**本地明文索引/FTS 持久化破坏 E2E at-rest | `entity_blobs` 存原件加密;`entity_sort_keys` DEK 派生加密;FTS Worker 内存 only;lock/idle wipe | 真机检查 IDB 无明文 |
| RW-21 | **(v0.3)**X-Device-Id middleware 未实现 → 撤销不真实 | Phase 4.5a 准入门:Sync 子 PRD middleware 必须就绪;e2e 测试被撤销设备 403 全覆盖 | Sync 子 PRD 状态 + e2e fail |
| RW-22 | **(v0.3)**Sync cursor gap 检测靠 seq,Sync 子 PRD 未建 sync_events 表 | Phase 4.5a 准入门;本档 §5.2.1.b 给初稿 | Sync 子 PRD 状态 |
| RW-23 | **(v0.3)**SPA 同源 XSS 直读 token(承担风险)| §5.1.1.a 显式威胁模型表;§5.12 完整安全栈;隐私页用户告知 | CSP violation / npm audit fail |
| RW-24 | **(v0.3)**SW `Clear-Site-Data: storage` 误清丢 pending mutations | 默认 cache only;P0/P1 才清 storage 走 runbook;UI 状态页公示 | 用户反馈 |
| RW-25 | **(v0.3)**iOS PWA standalone vs Safari tab partition leader 选举失败 | feature-detect BroadcastChannel + Web Lock,缺失降级独立 WS + localStorage 事件;真机走查 | 真机 fail |
| RW-26 | **(v0.3)**排期低估 4-6 周 | 拆 4.5a + 4.5b 共 8 周(worst case 10 周);准入门隔离 | Week 4 演示物未达 |

---

## 7. 验收门(进入 Phase 5 之前必达)

### 7.1 必达项(blocker)

- [ ] M5 验收清单(PRD §10.1)全 ✅(v0.3 扩到含 X-Device-Id middleware / entity_blobs at-rest / FTS Worker wipe / sync_events seq gap / SW Clear-Site-Data 谨慎用 / Sentry redact entity_id 用短 hash)
- [ ] 桌面 ↔ Web 真机 + 浏览器并排同步 5s 内可见(Sync push/pull + Realtime metadata + seq 链路)
- [ ] 离线编辑 20 条上线 30s 内全部 push(含 dead-letter 兜底);DEK 不在内存时业务实体写全拒
- [ ] **被撤销设备业务 API 全 403** 验证(在线 Realtime 立即登出;离线再上线服务端拦截)
- [ ] **IndexedDB 真机检查无明文**:`entity_blobs` ciphertext / `entity_sort_keys` ciphertext / FTS index 不持久 / lock 后 entity_index 仍只有非敏感 metadata
- [ ] **关浏览器重开仍登录** + 切账号 wrap_key 替换正常
- [ ] Chrome / Edge / Safari / Firefox Playwright 全 green + 真机 iPhone Safari + macOS Safari 走查
- [ ] Lighthouse landing Perf ≥ 90 / `/app/todos` ≥ 80 / A11y ≥ 90
- [ ] securityheaders.com A+ 评级
- [ ] CSP enforce 后 1 周 zero violation(Report-Only 模式 1 周 + enforce 1 周);**`/__csp_report` 自建端点 + `csp_violations` 表落地**
- [ ] Sentry redact 测试通过(**断言无完整 entity_id,只见 entity_type + 短 hash**)+ source map 可解(CI 顺序 build→inject→upload→delete→deploy)+ release tag 正确
- [ ] 数据导出(客户端打包验证服务端零接触明文)+ 账号删除(`deletion_scheduled_at` 30 天 + Realtime 广播)流程跑通
- [ ] 多设备列表 + 撤销 RPC + 被撤销设备 Realtime 立即登出(无需用户主动刷新)
- [ ] 30 分钟挂线 reconnect **seq gap** 检测正确,无丢漏
- [ ] WS 被代理禁后降级 polling 工作正常
- [ ] iOS PWA standalone vs Safari tab partition 不通时 leader 选举降级有效
- [ ] Safari `persisted()` + sentinel:删 sentinel 触发全量重拉,真机 7 天后访问可恢复

### 7.2 期望项(非 blocker,但记入 Phase 5 债)

- [ ] PWA 可安装(Chrome / Edge,§5.7.1 策略)
- [ ] 中国大陆访问 P95 < 5s(若不达则 RW-05 触发)
- [ ] 浏览器扩展端点预留就绪(Quick Capture RPC + scope + extension ID allowlist)
- [ ] 共享链接(FR-WEB-65,v1 不实现,P1 等 share envelope 协议)

### 7.3 不达标处理

- blocker 全 ✅ → dev_log 置 `READY_FOR_VERIFY` → 进 feature-verify
- blocker 有 ❌ → dev_log 置 `BLOCKED` + 列原因 → 不进 Phase 5,Phase 4.5 延期
- 期望项有 ❌ → 记入 `Phase 5 carry-over` 列表

---

## 8. 文档变更记录

| 日期 | 版本 | 变更 |
|---|---|---|
| 2026-05-14 | v0.1 (DRAFT) | 首版,按 4-6 周拆分到 Week 1~6;接口契约 + 测试矩阵 + 验收门 |
| 2026-05-16 | v0.2 (DRAFT) | 同步 PRD v0.2 的契约重写:(1) Week 1 加 PKCE flow + 自定义 storage + devices/sessions 表 + 4 个 RPC;(2) Week 2 改 driver-sync-blob(非 driver-rest)+ 本地 entity_index + FTS;(3) Week 3 改 Realtime metadata-only + cursor gap + WS 降级 polling + leader 选举 + host 注入桩;(4) Week 4 加密前入队 + dead-letter + 三方 diff;(5) Week 5 CSP Report-Only → enforce + Sentry sourcemap CI 命令 + 多设备 RPC + 真机矩阵 + Web Vitals INP;(6) §4.1 端点清单删 PostgREST 业务表 CRUD,改 /sync/* + RPC;(7) §4.3 EventMap 改 metadata-only event + 新增 conflict / dead-letter / idle-expired 事件;(8) §6 风险登记加 RW-13~19 |
| 2026-05-16 | v0.3 (DRAFT) | 同步 PRD v0.3 的二次重写 + 排期拆分:(1) §1 拆 Phase 4.5a(4 周核心)+ Phase 4.5b(4 周离线/合规)共 8 周(worst 10 周);(2) Week 2 改 IndexedDB 三层(entity_blobs + entity_index 非敏感 metadata + entity_sort_keys DEK 派生加密);FTS Worker 内存 only;(3) Week 3 Realtime payload 带 seq + gap 检测 + iOS partition 兜底;(4) Week 4 重组为"主密码解锁 + sort_keys 加密 + FTS 重建 + Phase 4.5a 准入门";(5) Week 5 改"离线编辑 + dead-letter + 三方 diff";Week 6 新增"多设备 + X-Device-Id middleware + 客户端导出 + CSP enforce";Week 7 改"PWA + i18n + 部署 + 真机";Week 8 buffer;(6) §4.1 鉴权头加 X-Device-Id;sync_events seq + 删 account_settings 明文表;blob_aad 校验;(7) §4.3 EventMap 加 seq 字段 + `web:device-id-rejected` 事件;(8) §5 测试用例加 at-rest 加密 + sentinel 兜底 + entity_id 短 hash 断言;(9) §6 风险加 RW-20~26 |

— END —
