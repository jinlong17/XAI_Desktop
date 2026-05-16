# Web 子开发方案 — XAI_Desktop 网页版

| 字段 | 值 |
|---|---|
| 父 PRD | `docs/planning/2026-05-12-PRD-v1.md`(主 PRD §10.2 / §5.15) |
| 本档 PRD | `./PRD.md`(Web 子 PRD) |
| 归属 Phase | Phase 4.5(4-6 周,主 PRD §10.6 路线图) |
| 文档作者 | Claude(subagent) |
| 创建日期 | 2026-05-14 |
| 状态 | DRAFT |

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
| `core-data` REST driver 占位 trait | Phase 0 子阶段 0.3 | ✅ trait 定义完(ADR-0003 衍生) |
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
| Cookie 配置(SameSite=Lax + Secure + HttpOnly) | Supabase config |
| Sentry web SDK init(env: web-dev) | `providers/SentryProvider.tsx` |
| landing page 占位(`/`)— 最小 hero + "立即试用" + "下载 macOS App" | `pages/Landing.tsx` |

**Week 1 演示物**:本地 `pnpm --filter @repo/web dev` → 注册 → 邮箱验证 → 登录 → 落到空白 `/app/todos`。

**Week 1 风险**:OAuth 回调在 localhost 配置坑(redirect URI 必须 https 或 localhost 例外)。

### Week 2 — REST driver + 第一个模块(Todo)

**目标**:Todo 模块可用,数据从 Supabase 来。

| 任务 | 输出 |
|---|---|
| `packages/core-data/src/driver-rest/` 实现 | REST driver |
| 端点契约对齐 `sub-prds/sync/PRD.md`(若未提交则与同步层 agent 同步) | 端点表 |
| TanStack Query v5 集成 + persistor(IndexedDB) | `providers/DataProvider.tsx` |
| 重试 + 错误 toast + 401 跳登录 | FR-WEB-24/25 |
| `plugin-productivity` 注册到 `apps/web/src/main.tsx` | import register |
| Todo list / detail / 完成 / 加 Todo / 改标题 可用 | 复用 ConsoleView |
| 移动断点初步实现(Todo 单栏切换) | FR-WEB-47 |

**Week 2 演示物**:Web Todo CRUD,刷新页不丢数据,移动模拟器 375px 可用。

### Week 3 — 实时同步 + 项目管理 / Labels / Calendar / Habits

**目标**:第二批模块上 + Realtime 通道打通。

| 任务 | 输出 |
|---|---|
| Realtime 订阅封装(`packages/core-events/src/web-bus.ts`) | BroadcastChannel + Supabase channel 双桥 |
| `web:realtime-*` 事件接到 TanStack Query invalidate | FR-WEB-31~35 |
| 桌面 ↔ Web 5s 双向同步实测(真机 + Chrome) | FR-WEB-36 |
| `plugin-project` 注册 + 看板视图 web build | 复用 |
| `plugin-labels` 注册 + Labels 管理页 | 复用 |
| `plugin-calendar` 注册 + 桌面日历(网页版只读为主) | 复用 |
| `plugin-productivity` 中的 Habits 视图启用 | 复用 |
| sidebar 集成 + 模块切换 | 复用 ConsoleHost(`WebHost`) |

**Week 3 演示物**:三栏 console UI 在浏览器中跑通 4 个模块;两台设备同账号实测同步。

### Week 4 — 离线 + Service Worker + 主密码 / E2E

**目标**:断网体验过关;敏感字段端到端可见。

| 任务 | 输出 |
|---|---|
| Service Worker 注册 + Workbox 配置(network-first HTML / cache-first static) | FR-WEB-44 |
| IndexedDB 离线编辑队列实现(`pending_mutations` Object Store) | FR-WEB-41~43 |
| 离线检测 + sidebar 状态指示 + 全局 banner | FR-WEB-39/40 |
| 冲突 toast + 跳 diff 视图 | FR-WEB-43 |
| 主密码 challenge 弹窗(登录后单独询问) | FR-WEB-20/88 |
| Argon2id WASM(`hash-wasm` 或 `argon2-browser`)接入 | KEK 派生 |
| `encrypted_dek` 本地 IndexedDB 镜像 + 服务端拉 | FR-WEB-46 |
| E2E 字段渲染分支:有 DEK 显明文,无 DEK 显"已加密" | FR-WEB-117 |
| KEK / DEK 内存生命周期管理(5min idle 清) | FR-WEB-89 |

**Week 4 演示物**:关 Wi-Fi 改 5 条 Todo + 1 条 note → 联网 30s 内全部 push;主密码错误 → 加密字段不可见但其他正常。

### Week 5 — 安全 / 部署管线 / PWA / i18n / 移动 / 兼容性

**目标**:从"能用"到"能上线"。

| 任务 | 输出 |
|---|---|
| CSP / HSTS / Referrer-Policy / X-Frame-Options 在 Vercel/CF 配 headers | FR-WEB-80~87 |
| `securityheaders.com` 扫到 A+ | 验证 |
| 多设备登出页(已登录设备列表) | FR-WEB-17 |
| 跨标签会话同步 BroadcastChannel | FR-WEB-15 |
| 数据导出 + 账号删除 UI(后端走 RPC) | FR-WEB-118~121 |
| PWA manifest + apple-touch-icon + iOS A2HS | FR-WEB-55~58 |
| i18n 三语切换(zh-CN/zh-TW/en) | FR-WEB-98~102 |
| 部署管线:GitHub Actions → Vercel preview / staging / prod 三档 | §9 |
| Playwright CI 三浏览器矩阵(chromium/webkit/firefox) | CI 配置 |
| Lighthouse CI 门 + bundle 体积监控 | FR-WEB-68/69 |
| 移动浏览器(iPhone Safari 真机 + Chrome Android)走查 | FR-WEB-106~111 |

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
| Auth | `/auth/v1/token?grant_type=refresh_token` | POST | Supabase 默认 |
| Auth | `/auth/v1/recover` | POST | 找回密码 |
| Auth | `/auth/v1/authorize?provider=apple/google` | GET | OAuth 跳转 |
| Auth | `/auth/v1/logout` | POST | 注销 |
| Auth | `/auth/v1/sessions` | GET | 多设备列表 |
| Auth | `/auth/v1/sessions/:id` | DELETE | 撤销单设备 |
| Data | `/rest/v1/<table>` | GET/POST/PATCH/DELETE | PostgREST 风格;table ∈ {todos, lists, labels, label_assignments, boards, board_lists, board_cards, board_card_checklist, habits, habit_logs, pomodoro_sessions, settings, accounts, progress_trackers} |
| Data | `/rest/v1/rpc/quick_capture_create_todo` | POST | P2 浏览器扩展端点 |
| Data | `/rest/v1/rpc/account_request_export` | POST | 触发数据导出 |
| Data | `/rest/v1/rpc/account_request_delete` | POST | 触发账号删除(30 天延迟) |
| Storage | `/storage/v1/object/avatars/...` | GET/PUT | 头像 |
| Storage | `/storage/v1/object/exports/...` | GET | 数据导出 zip 下载 |
| Realtime | `wss://<project>.supabase.co/realtime/v1/websocket` | WS | postgres_changes 订阅 |
| Health | `/healthz` | GET | 自检 |

**鉴权**:所有 `/rest/v1/*` 和 `/storage/v1/*` 走 `Authorization: Bearer <access_token>` + `apikey: <anon_key>`。

**版本协商**:所有请求 `Accept-Version: 2026-05`(初版);后端 Sunset header 触发升级提示。

### 4.2 WebView slot vs ConsoleView slot 的差异

> 来自 `PLUGIN_SDK.md §3.1`:`PluginComponents.WebView` 与 `.ConsoleView` 同源,但接受不同 `host` 注入。

| 维度 | ConsoleView | WebView |
|---|---|---|
| 数据 driver | SQLite | REST(本档 §4.1) |
| 事件总线 | Tauri event | BroadcastChannel + Supabase Realtime |
| 文件能力 | core-fs(NSWorkspace 等) | core-fs web stub(只支持下载 / blob URL,不支持本机路径) |
| 通知能力 | macOS UserNotifications | Web Notification API(P1)/ 内嵌 toast(P0) |
| 快捷键 | tauri-plugin-global-shortcut | KeyboardEvent + 浏览器保留键避让 |
| 窗口管理 | core-window | 浏览器原生(history / tab close 监听) |
| 文件拖入 | Tauri onDragDropEvent | HTML5 DnD API(仅文本/URL,不读真实路径) |

**默认实现策略**:大多数 plugin **只实现 ConsoleView**,WebView 通过同一组件 + 在 host 层注入的不同 hook 实现复用(零 import 区分);只有需要平台分支的 plugin 显式提供独立 `WebView`(如 plugin-organizer 在 Web 上 GridContent 是只读卡片预览,不接拖入)。

### 4.3 EventMap Web 端补充

继承 `PLUGIN_SDK.md §4.1` 的 `web:*` 前缀,Phase 4.5 落地:

```ts
'web:realtime-connected': { userId: string };
'web:realtime-disconnected': { reason: string };
'web:realtime-event': { table: string; eventType: 'INSERT' | 'UPDATE' | 'DELETE'; record: unknown };
'web:offline-mode-changed': { online: boolean };
'web:pending-mutation-flushed': { count: number };
'web:master-password-required': {};
'web:master-password-resolved': {};
```

新增事件必须先在 `packages/core-events/src/event-map.ts` 添加类型 + 在 manifest emit/listen 声明,再写代码。

---

## 5. 测试策略

### 5.1 单测(Vitest)

| 范围 | 覆盖率 | 备注 |
|---|---|---|
| `apps/web/src/` | ≥ 50% | Host 层逻辑少,重点测 providers / 路由守卫 |
| `packages/core-data/src/driver-rest/` | ≥ 80% | 关键 driver,bug 影响所有模块 |
| `packages/core-events/src/web-bus.ts` | ≥ 80% | 同上 |
| Plugin 复用:无新增覆盖率(plugin 已在桌面端覆盖) | — | 但需 web build 模式下 smoke 跑通 |

**重点测试用例**:
- REST driver 重试 / 401 / 取消 / 乐观更新回滚
- Realtime 事件 → invalidate / 合并
- 离线编辑队列回放顺序 / 限额
- KEK 派生 + DEK 解密 + 内存清零
- 跨标签 BroadcastChannel 登出广播
- Sentry beforeSend redact

### 5.2 集成(Vitest + msw)

mock fetch + IndexedDB(`fake-indexeddb`)跑:
- 登录 → 拉数据 → 缓存命中
- 关网 → 改数据 → 联网回放
- 多个 mutation 合并写

### 5.3 E2E(Playwright)

**浏览器矩阵**:Chromium + WebKit + Firefox(每 PR 跑 chromium,merge 前跑全套)。

**核心 flow**:
1. 注册 → 邮箱验证 → 登录 → 看到 Todo
2. 加 Todo → 改 → 完成 → 刷新仍在
3. 切到项目管理 → 拖卡片 → 看板状态变
4. 模拟离线 → 改 5 条 → 上线 → 全部同步
5. 主密码弹窗 → 输入 → 加密字段可见
6. 多设备登出
7. 数据导出请求
8. 移动 viewport(iPhone 13)Todo 完成

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

## 6. 风险登记(Web 特有)

| ID | 风险 | 缓解 | 触发标志 |
|---|---|---|---|
| RW-01 | Service Worker bug 导致 stale 缓存 | HTML 走 network-first;紧急时用户走 settings 清缓存(FR-WEB-45) | 用户反馈"看到旧版本" |
| RW-02 | Safari ITP 阻止 OAuth | OAuth 域同源 + SameSite=Lax;Playwright WebKit 必跑 | Playwright WebKit fail |
| RW-03 | Supabase Realtime quota | 多标签共享 channel(FR-WEB-37);监控连接数 | Supabase Dashboard 报警 |
| RW-04 | 主密码遗忘 | 注册时强制助记词;UI 反复提示 ≠ 账号密码 | 客服 ticket |
| RW-05 | 中国大陆访问慢 | Week 6 PoC;若 P95 > 5s 则 Phase 5 切 CF Pages | RUM 数据 |
| RW-06 | 数据 driver 双 driver 行为漂移 | 契约测试两 driver 跑同一 spec | 契约测试 fail |
| RW-07 | E2E 字段在错误日志泄漏 | Sentry beforeSend + 单测断言 + code review checklist | Sentry 抽查 |
| RW-08 | 离线编辑顺序冲突 | last-write-wins + toast 通知;v1 不做 CRDT | 用户反馈 |
| RW-09 | PWA 安装后行为偏离 | standalone 与浏览器 chrome 模式行为一致;不做独立功能 | 手动验证 |
| RW-10 | `.app` 域名证书 / HSTS preload 故障 | 多 CA 备份 + 监控 + Vercel 自动续 | 证书到期告警 |
| RW-11 | Phase 5 同步层 v1 未完成时 Web 上线 | Phase 4.5 准入门:同步 v0 至少跑通;v1 完善与 Web 并行 | 同步层 dev_log 状态 |
| RW-12 | bundle 体积超预算导致首屏慢 | CI 体积门 + lazy 拆分 + dynamic import 检查 | CI fail |

---

## 7. 验收门(进入 Phase 5 之前必达)

### 7.1 必达项(blocker)

- [ ] M5 验收清单(本档 §10.1 of PRD)全 ✅
- [ ] 桌面 ↔ Web 真机 + 浏览器并排同步 5s 内可见
- [ ] 离线编辑 20 条上线 30s 内全部 push
- [ ] Chrome / Safari / Firefox Playwright 全 green
- [ ] Lighthouse 主路径 Perf ≥ 80 / A11y ≥ 90
- [ ] securityheaders.com A+ 评级
- [ ] CSP 无违反(report-only 模式 1 周清零)
- [ ] Sentry redact 测试通过 + source map 可解
- [ ] 数据导出 + 账号删除流程跑通

### 7.2 期望项(非 blocker,但记入 Phase 5 债)

- [ ] PWA 可安装(Chrome / Edge)
- [ ] 中国大陆访问 P95 < 5s(若不达则 RW-05 触发)
- [ ] 浏览器扩展端点预留就绪
- [ ] 共享链接(FR-WEB-65)上线

### 7.3 不达标处理

- blocker 全 ✅ → dev_log 置 `READY_FOR_VERIFY` → 进 feature-verify
- blocker 有 ❌ → dev_log 置 `BLOCKED` + 列原因 → 不进 Phase 5,Phase 4.5 延期
- 期望项有 ❌ → 记入 `Phase 5 carry-over` 列表

---

## 8. 文档变更记录

| 日期 | 版本 | 变更 |
|---|---|---|
| 2026-05-14 | v0.1 (DRAFT) | 首版,按 4-6 周拆分到 Week 1~6;接口契约 + 测试矩阵 + 验收门 |

— END —
