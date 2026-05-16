# Web 子开发方案 — XAI_Desktop 网页版

| 字段 | 值 |
|---|---|
| 父 PRD | `docs/planning/2026-05-12-PRD-v1.md`(主 PRD §10.2 / §5.15) |
| 本档 PRD | `./PRD.md`(Web 子 PRD) |
| 归属 Phase | Phase 4.5(4-6 周,主 PRD §10.6 路线图) |
| 文档作者 | Claude(subagent) |
| 创建日期 | 2026-05-14 |
| 状态 | DRAFT v0.2(2026-05-16 同步 PRD v0.2 的契约重写) |

---

## 1. Phase 4.5 目标

主 PRD §10.6 路线图给 Web 的时间窗:**4-6 周**,夹在 Phase 4(AI 注入)与 Phase 5(账号 + 同步完善 + 公测)之间。

> 累计窗口:36 → 42 周(2026-12-08 进入 → 2027-01-19 出门,主 PRD v1.0 GA 目标 2027-05)。

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

## 3. 任务分解(按周拆,4-6 周)

> 排期假设独开全职;6 周是 worst case(含 buffer)。每周收尾产出可演示物 + 真机/真浏览器走查。

### Week 1 — 骨架 + 认证(W1)

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

### Week 2 — Sync blob driver + 第一个模块(Todo)

**目标**:Todo 模块可用,数据走 Sync push/pull encrypted blob 通道。

| 任务 | 输出 |
|---|---|
| `packages/core-data/src/driver-sync-blob/` 实现(**不是 driver-rest**)| 实现 Repository 接口;内部调 `/sync/pull`、`/sync/push`、RPC;仅传 encrypted_blob |
| 端点契约对齐 `sub-prds/sync/PRD.md`(若未提交则与同步层 agent 联合定 v0)| `apps/web/src/contracts/sync.ts` |
| 本地 `entity_index` Object Store(明文 sort/filter key + FTS) | IndexedDB schema |
| 本地全文搜索(`flexsearch` / `lunr` 基准 → 选定)| Web Worker 跑;FR-WEB-22c |
| mutation 幂等性:`mutation_id`(uuid v7)+ `idempotency_key`(sha256) | FR-WEB-24 |
| `base_version` + 服务端 409 处理 | FR-WEB-43 三方 diff 数据基础 |
| 加密前入队的 mutation pipeline(DEK 在内存才允许加密字段写)| FR-WEB-41/46 |
| TanStack Query v5 集成 + persistor(IndexedDB)| `providers/DataProvider.tsx` |
| 重试 + 退避 + jitter + dead-letter + 错误 toast + 401 跳登录 | FR-WEB-24~25 |
| `plugin-productivity` 注册到 `apps/web/src/main.tsx` | import register |
| Todo list / detail / 完成 / 加 Todo / 改标题 可用(本地 entity_index 渲染)| 复用 ConsoleView |
| 移动断点初步实现(Todo 单栏切换)| FR-WEB-47 |

**Week 2 演示物**:Web Todo CRUD 全走 Sync push/pull 通道,网络面板验证只有 `/sync/*` 请求(无 `/rest/v1/todos`);刷新页不丢数据;本地搜索可用。

### Week 3 — 实时同步 + 项目管理 / Labels / Calendar / Habits

**目标**:第二批模块上 + Realtime 通道打通。

| 任务 | 输出 |
|---|---|
| Realtime 订阅封装(`packages/core-events/src/web-bus.ts`)| BroadcastChannel + Supabase `sync:<account_id>` 双桥;**metadata-only**(不订 postgres_changes) |
| 收到 metadata → 入 pull queue(去抖 300ms)→ 调 `/sync/pull` → 本地解密 → 失效 TanStack Query | FR-WEB-31~35 |
| 重连指数退避 + jitter + cursor gap 检测 + visibilitychange catch-up + WS 失败降级 polling | FR-WEB-33~34b |
| 多标签 leader 选举(Web Lock API + BroadcastChannel)| FR-WEB-37 |
| `device_revoked` Realtime 事件 → 被撤销设备立即 signOut + 清 IndexedDB | FR-WEB-17 |
| 桌面 ↔ Web 5s 双向同步实测(真机 + Chrome)| FR-WEB-36 |
| `plugin-project` 注册 + 看板视图 web build | 复用 |
| `plugin-labels` 注册 + Labels 管理页 | 复用 |
| `plugin-calendar` 注册 + 桌面日历(网页版只读为主)| 复用 |
| `plugin-productivity` 中的 Habits 视图启用 | 复用 |
| Console host 注入桩(`packages/core/src/host/web/`):文件下载 / 通知 / 快捷键 / DnD / 设置 / 搜索 adapter / 错误边界 | PRD §4.2 契约 |
| sidebar 集成 + 模块切换 | 复用 ConsoleHost(`WebHost`)|

**Week 3 演示物**:三栏 console UI 在浏览器中跑通 4 个模块;两台设备同账号实测同步。

### Week 4 — 离线 + Service Worker + 主密码 / E2E

**目标**:断网体验过关;敏感字段端到端可见。

| 任务 | 输出 |
|---|---|
| Service Worker 注册 + Workbox 配置(precache revision 绑 git SHA;HTML no-store + immutable assets) | FR-WEB-44 / §9.4.1 |
| SW 紧急 kill switch(`/sw-kill.js` + `/?reset=1`)| FR-WEB-45 |
| IndexedDB **加密前入队** mutation 实现(`pending_mutations`;DEK 不在内存禁止加密字段写)| FR-WEB-41/46 |
| `dead_letter_mutations` Object Store + 失败 ≥ 3 次入队 + UI 视图 | FR-WEB-24c/43c |
| 离线检测(`navigator.onLine` + 主动 ping + WS DISCONNECTED 任一为 true)+ sidebar 状态指示 + 全局 banner | FR-WEB-39/40 |
| **三方 diff 冲突 UI**:base / local / remote 三栏 + 选保留方 + audit log 写入 | FR-WEB-43 |
| 主密码 challenge 弹窗(登录后单独询问)| FR-WEB-20/88 |
| Argon2id WASM(`hash-wasm`,memoryCost 64MB / iter 3)接入 + 真机基准(低端 iPhone P95 < 1.5s)| KEK 派生 |
| `encrypted_dek` 本地 IndexedDB 镜像 + 服务端拉 | FR-WEB-46 |
| E2E 字段渲染分支:有 DEK 显明文,无 DEK 显"已加密"(本地索引 fallback 渲染)| FR-WEB-117 |
| KEK / DEK 内存生命周期管理(5min idle 自动清零 + 提示用户)| FR-WEB-89/46b |

**Week 4 演示物**:关 Wi-Fi 改 5 条 Todo + 1 条 note(DEK 在内存)→ 联网 30s 内全部 push;DEK 不在内存时尝试改加密字段 → 提示输主密码;制造冲突(两端同时改)→ 三方 diff 弹出可选保留方。

### Week 5 — 安全 / 部署管线 / PWA / i18n / 移动 / 兼容性

**目标**:从"能用"到"能上线"。

| 任务 | 输出 |
|---|---|
| CSP / HSTS / Referrer-Policy / X-Frame-Options / Permissions-Policy / Report-To 在 Vercel/CF edge 配 headers | FR-WEB-80~87b |
| CSP 先发 **Report-Only**(staging 1 周收 Sentry violation)→ enforce | §5.12.2 / FR-WEB-82b |
| Vercel/CF edge middleware 注入随机 nonce 给 `style-src 'nonce-...'` | §5.12.3 |
| `securityheaders.com` 扫到 A+ | 验证 |
| 多设备页(`devices` 表数据 + 撤销 RPC + Realtime 联动)| FR-WEB-17/17b/17c |
| 跨标签会话同步 BroadcastChannel + Web Lock leader 选举 | FR-WEB-15/37 |
| **数据导出走客户端打包**(Blob URL + JSZip in Worker;服务端不接触明文)| FR-WEB-118/119 |
| 账号删除 + 30 天恢复窗口 + Realtime `account_deleted` 广播 | FR-WEB-120/121 |
| Cookie / consent banner + GDPR 子处理者清单页 | FR-WEB-122/122b/123/123c |
| PWA manifest + apple-touch-icon + iOS A2HS + 安装提示策略(3 次操作 + 无桌面 App)| FR-WEB-55~58 / §5.7.1 |
| i18n 三语切换(zh-CN/zh-TW/en)| FR-WEB-98~102 |
| 部署管线:GitHub Actions → Vercel preview / staging / prod 三档 | §9 |
| Sentry sourcemap CI:`sentry-cli releases new $SHA` → `sourcemaps upload --validate` → `finalize` → `deploys new`;生产 sourcemap 不公开 | FR-WEB-95 |
| Playwright CI 四浏览器矩阵(chromium/webkit/firefox/Edge)| CI 配置 |
| **真机走查清单**:macOS Safari / iPhone Safari / Android Chrome / Firefox ETP / Edge 企业策略 | §5.11.2 |
| Lighthouse CI 门(landing Perf ≥ 90 / `/app/todos` ≥ 80)+ bundle 体积监控(`size-limit`)| FR-WEB-68/69 |
| Web Vitals RUM(LCP/INP/CLS/TTFB)按 route_group 分桶 | FR-WEB-70 |
| 移动浏览器 viewport 验证:无 `maximum-scale=1`,可双指缩放;visualViewport 监听键盘 | FR-WEB-111/49b |

**Week 5 演示物**:`staging.app.xai-desktop.app` 公开访问;扫 A+;Lighthouse 通过门。

### Week 6 — buffer / 真机走查 / 文档 / 私测放量

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

**Week 6 演示物**:可以发邀请给 Phase 5 公测群。

> Week 6 是 buffer;若 Week 1~5 顺,Week 6 可提早收尾(留时间给 Phase 5)。

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
| Sync | `/sync/pull` | POST | `{cursor, max_batch, entity_types}` → `{items[], next_cursor, has_more}`;**仅返 encrypted_blob** |
| Sync | `/sync/push` | POST | `{mutations[]}` → 逐条 ok / conflict / rejected;含 `idempotency_key` 24h 去重 |
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

**鉴权**:所有 `/sync/*` 和 `/rest/v1/*` 走 `Authorization: Bearer <access_token>` + `apikey: <anon_key>`。

**版本协商**:所有请求 `X-Sync-Version: 2026-05`(初版);后端 `Sunset` header / 426 Upgrade Required 触发升级提示。

### 4.2 WebView slot vs ConsoleView slot 的差异

> 来自 `PLUGIN_SDK.md §3.1`:`PluginComponents.WebView` 与 `.ConsoleView` 同源,但接受不同 `host` 注入。

| 维度 | ConsoleView | WebView |
|---|---|---|
| 数据 driver | SQLite | **Sync blob**(实现 Repository,底层走 Sync push/pull encrypted blob;本档 §4.1)|
| 事件总线 | Tauri event | BroadcastChannel + Supabase Realtime(`sync:<account_id>` metadata-only)|
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
// metadata-only;不含 record
'web:realtime-event': {
  entity_type: string;
  entity_id: string;
  server_updated_at: string;
  originator_device_id: string;
  version: number;
};
'web:realtime-device-revoked': { device_id: string; reason: string };
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

**重点测试用例**:
- Sync blob driver:加密前入队、mutation_id / idempotency_key 去重、base_version 409 处理、dead-letter 进入与重试
- Realtime metadata → pull trigger / cursor gap / visibilitychange catch-up / WS 降级 polling
- 离线编辑:DEK 在内存正常加密;DEK 不在内存拒绝加密字段写
- KEK 派生(Argon2id WASM)+ DEK 解密 + 内存清零(5min idle)
- 跨标签 BroadcastChannel 登出广播 + leader 选举
- PKCE flow:state/code_verifier 校验 + open-redirect 兜底 + Apple private relay 接受
- Sentry beforeSend redact:断言 entity body 不在 payload;token 不在错误堆栈
- CSP violation 报告流程

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

---

## 7. 验收门(进入 Phase 5 之前必达)

### 7.1 必达项(blocker)

- [ ] M5 验收清单(PRD §10.1)全 ✅(v0.2 已扩到含 PKCE / 自定义 storage / 客户端导出 / 三方 diff 等)
- [ ] 桌面 ↔ Web 真机 + 浏览器并排同步 5s 内可见(Sync push/pull + Realtime metadata 链路)
- [ ] 离线编辑 20 条上线 30s 内全部 push(含 dead-letter 兜底)
- [ ] Chrome / Edge / Safari / Firefox Playwright 全 green + 真机 iPhone Safari + macOS Safari 走查
- [ ] Lighthouse landing Perf ≥ 90 / `/app/todos` ≥ 80 / A11y ≥ 90
- [ ] securityheaders.com A+ 评级
- [ ] CSP enforce 后 1 周 zero violation(Report-Only 模式 1 周 + enforce 1 周)
- [ ] Sentry redact 测试通过 + source map 可解(CI 标准化命令)+ release tag 正确
- [ ] 数据导出(客户端打包验证服务端零接触明文)+ 账号删除(30 天恢复 + Realtime 广播)流程跑通
- [ ] 多设备列表 + 撤销 RPC + 被撤销设备 Realtime 立即登出(无需用户主动刷新)
- [ ] 30 分钟挂线 reconnect cursor gap 检测正确,无丢漏
- [ ] WS 被代理禁后降级 polling 工作正常

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

— END —
