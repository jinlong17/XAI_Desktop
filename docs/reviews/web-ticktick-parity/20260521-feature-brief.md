# Feature Brief — web-ticktick-parity

| 字段 | 值 |
|---|---|
| Feature Slug | `web-ticktick-parity` |
| 创建日期 | 2026-05-21 |
| 作者 | Claude(xai-feature-brief skill) |
| Step 0 QA Gate | PASS |
| 输出状态 | `READY_FOR_DISCOVERY` |
| 关联审计 | `docs/reviews/web-ticktick-parity-audit-2026-05-21.md` |
| 关联 PRD | `docs/planning/sub-prds/web/PRD.md`、`docs/planning/sub-prds/web/dev-plan.md`、主 PRD §5.15、ADR-0003、ADR-0006 |

---

## Structured Brief

### Problem / Motivation

`apps/web/` 当前是桌面 App 的营销 / Release-Candidate 落地站 + Sync 安全基线展示壳(由 G8/G10 路线图的 `web-host-shell` / `web-data-driver` / `web-security-baseline` 产出):`/console` 是写死的静态 mock(`apps/web/app/console/page.tsx:17-22`),`/login`·`/devices`·`/export` 全走 `accountMocks.ts`,并通过 `createTauriCapabilityStub` 把自己定义为"降级的桌面"(`apps/web/docs/capabilities.md`)。它**不是** Web 子 PRD 定义的 TickTick Web Console——没有真实任务管理实体、没有 SPA 模块路由(`/app/todos` 等一个都不存在)、没有同步/离线接线。用户判断准确:它像"桌面整理映射",不像"嘀嗒清单 Web 全功能版"。

### Target User / Actor

- 主:已订阅桌面 App 的用户,在出差 / 客户机 / 借用设备时用浏览器查改任务、看习惯进度。
- 次:转化漏斗新用户(landing → 注册 → 浏览器内试用 → 下载桌面 App)。
- 次:企业受限设备用户(锁了原生安装,只能用浏览器)。
- (PRD §2)

### Desired Outcome

`apps/web` 成为一个**独立的浏览器 SPA 子系统**,对齐 TickTick Web 的核心全功能:任务管理(Inbox / Lists / Tags / Smart Lists / Subtasks / Reminders / Recurrence / Priority / Notes)、视图(List / Calendar / Matrix;Kanban 由独立项目模块承载)、Pomodoro / Habit / Statistics、搜索 / 快捷键 / 主题 / 多端同步 / 离线;通过账号与桌面 App 共享同一后端数据,桌面 ↔ Web 双向实时可见。

### Scope

- 全新 `apps/web`,技术栈 **Vite SPA**(React Router + History API + 自管 Service Worker),与 ADR-0003 架构图中"网页版 = Vite SPA + Supabase API"一致。
- **Web 专属实现**任务 / 项目 / 习惯 / 番茄 / 标签 / 日历 / 搜索的浏览器形态(用户决策,见 ADR-lite Trigger)。
- 浏览器端 Auth(邮箱 + Apple/Google OAuth PKCE)+ 自建 `devices`/`app_sessions` + `X-Device-Id` 校验(Web PRD §5.1)。
- `core-data` Sync blob driver:实现 `Repository<T>`,底层走 Sync `/sync/pull`·`/sync/push`·RPC(Web PRD §5.2,FR-WEB-21/22)。
- 浏览器端加密栈(Argon2id via WASM + AES-GCM via SubtleCrypto,non-extractable CryptoKey;Web PRD §5.1.1/§5.12 FR-WEB-88),与 Sync W0–W3 的 Rust 加密原语对齐 RFC 向量。
- Realtime metadata-only 订阅 → 增量 pull(Web PRD §5.3)。
- 离线:IndexedDB at-rest 加密、加密 mutation 队列、dead-letter、三方 diff 冲突 UI(Web PRD §5.4)。
- 响应式三档断点 + 移动端只读(Web PRD §5.5)。
- 客户端零知识数据导出 / 账号删除 UI(Web PRD §5.18)。
- 部署管线 / CSP enforce / Sentry web / SEO landing(Web PRD §5.9–5.14)。
- 现有 `apps/web` 整体归档为 release-site;CSP / Supabase 后端资产作为参考可移植。

### Non-goals

- 桌面 overlay / click-through / 浮动 Grid / 桌宠 / AiCube 浮窗 / 全屏冥想——依赖 macOS 原生,Web 不做(Web PRD §1.3)。
- 多人协作 / 邀请 / 评论 / 活动流——v1 明确不做(PRD §5.2.3、§5.14.3)。
- 公开分享链接 `/share/*`——v1 不实现,直接 404,等 Sync 子 PRD 出 share envelope(Web PRD §5.18.2,FR-WEB-65)。
- TickTick 的 Timeline 视图 / 自定义 Filter 构建器 / Achievements——不在 PRD 范围。
- 移动端原生 App——Phase 5+。
- 浏览器扩展 Quick Capture——P2(Web PRD §5.15)。
- 复用桌面端窗口 / Tauri command / SQLite driver 等桌面专属概念。

### Feature Classification

- **Architecture Kind**:新增独立宿主壳子系统(`apps/web` 第三个面)+ 跨多 plugin 业务域 + `@repo/core-data` 新 driver + `@repo/core` 新 Web host 注入桩。
- **User Surface**:浏览器 SPA(end user),非桌面 overlay / 控制台窗口。
- **Change Type**:架构迁移 + 新建子系统(现 `apps/web` 归档,新建 Vite SPA)。
- **Risk Level**:**高**——新技术栈选型、新外部 driver、浏览器加密栈、跨 plugin 平台无关性、与已 ship Sync 协议对接、CSP/PWA 发布边界。
- **Target Feature State**:N/A(目标是新建;被引用的 plugin 状态见下)。

### Impacted Layers

- Frontend(Web SPA):Yes — 全新 `apps/web` Vite SPA。
- Backend:Yes — Supabase `devices`/`app_sessions` 表 + RPC + `X-Device-Id` middleware(Web PRD §5.1.3);Sync `/sync/*` 端点已由 W0–W3 提供。
- Database:Yes — `devices`/`app_sessions`/`sync_events` 等增量(由 Sync 子 PRD 归口建表)。
- Model API:No。
- Sandbox Execution:No。
- Third-party Integration:Yes — Supabase Auth(Apple/Google OAuth PKCE)、Sentry web、Vercel/Cloudflare 部署。
- Auth / Permission:Yes — 浏览器 Auth、设备会话、E2E 主密码 challenge。
- Analytics / Observability:Yes — Sentry web + Web Vitals RUM + CSP violation report。
- Registration / Loading Boundary:Yes — 新 Vite SPA 的 plugin 注册 / 路由注册 / Service Worker 版本契约。

### Candidate Modules / Dependencies

> 依赖状态以包目录现实为准。**`docs/PLUGIN_MAP.md` 已过期**:它把 todo/pomodoro/habits 列为独立 Planned plugin,但实际已合并进 `plugin-productivity`(该包未登记);`plugin-console`/`project`/`labels`/`calendar`/`pet` 也未登记。planner 阶段须同步修订 PLUGIN_MAP。

| 模块 | 当前状态(实测) | 本 feature 关系 |
|---|---|---|
| `plugin-productivity`(Todo+Pomodoro+Habit) | dev_log `READY_FOR_VERIFY` | 业务参考源;用户选"Web 专属重写"→ 不直接复用代码,作为契约/行为参考 |
| `plugin-console`(三栏外壳/命令面板/通知) | dev_log `READY_FOR_VERIFY` | 同上,UI 行为参考 |
| `plugin-project` / `plugin-labels` / `plugin-calendar` | 见各 docs/dev_log | 同上 |
| `plugin-account`(账号/设备/同步引擎/rekey) | `In-Dev`(PLUGIN_MAP) | 同步引擎 push/pull + 登录契约参考;Web 需 WebCrypto 适配 |
| `@repo/core` | `Stable` | 平台无关,可依赖;缺 `src/host/web/` 注入桩(需新增) |
| `@repo/core-data` | `In-Dev` | Repository v0 接口可依赖;缺 Sync blob driver(本 feature 交付) |
| `@repo/ui` | `In-Dev` | 共享组件,用 Mock 解耦 |
| Sync W0–W3(crypto / sync-engine / edge functions / migrations) | `Shipped` | `/sync/pull`·`/sync/push`·RPC 端点 + Supabase SQL/Edge Function,作为对接后端 |

### Constraints

- 不复用桌面专属概念(窗口 / click-through / grid / Tauri command / SQLite driver)。
- 平台无关 React 组件:不 import 任何 Tauri / 原生 API,原生能力走依赖注入 `host` 接口(主 PRD §5.15.3、Web PRD §4.2)。
- 零知识硬规则:业务实体全字段进 `encrypted_blob`,服务端不看明文;IndexedDB 所有用户内容派生物件 at-rest 加密或 lock 时 wipe(Web PRD §0.1)。
- 浏览器加密栈须与 Sync W0–W3 的 Rust 实现对齐 RFC 9106/8032/9180/8949 向量。
- `X-Device-Id` 强制校验所有 `/sync/*` 与 RPC(FR-WEB-17e)。
- 不修改任何 `dev_log.md`(本 brief 阶段)。
- Console 三栏布局 / 键盘流 / 主题的"真理之源"是 `sub-prds/console/PRD.md`(状态待确认)。

### Data / Security / Cost / Release Notes

- **Data**:新增 `devices` / `app_sessions` / `sync_events` 等表(Sync 子 PRD 归口);IndexedDB `xai-cache` 库含 `entity_blobs`/`entity_index`/`entity_sort_keys`/`pending_mutations`/`dead_letter_mutations`/`auth_tokens`/`auth_keys`(Web PRD §8.2)。
- **Security**:浏览器端 Auth token 落 IndexedDB(显式威胁模型:防磁盘取证 / 跨用户,**不防同源 XSS**,Web PRD §5.1.1.a);严格 CSP enforce + SRI + react-markdown sanitize;E2E 主密码 challenge,KEK/DEK 为 non-extractable CryptoKey 仅驻内存。
- **Cost**:Supabase Auth/Realtime/Storage 用量;Vercel/CF 托管;Sentry 配额。
- **Release**:dual-track 不适用(纯 Web);CSP 走 staging Report-Only 1 周 → prod enforce(FR-WEB-82/82b);Service Worker precache 绑 git SHA + 紧急 kill switch(FR-WEB-44/45)。

### Acceptance Criteria

> Step 0 仅给"子系统级验收骨架";具体 FR 级验收由 roadmap / feature-plan 细化。每条二元可判定。

1. 新 `apps/web` 以 Vite 构建,`pnpm --filter @repo/web build` 与 `dev` 通过;现 Next.js `apps/web` 已归档(移出或明确标注为 release-site,不再是 Web 子系统真理源)。
2. 浏览器内可完成:邮箱注册 → 邮箱验证 → 登录 → 落到 `/app/todos`;Apple/Google OAuth PKCE 回调成功。
3. `core-data` Sync blob driver 实现 `Repository<T>`,与 SQLite driver 跑同一契约测试 spec 全 green(FR-WEB-21)。
4. 至少 Todo / Habit / Pomodoro / Calendar / Labels / 搜索六模块在浏览器中可真实增删改查(非 mock),数据经 `encrypted_blob` 往返 Sync 后端。
5. 桌面 App ↔ Web 同一账号:一侧改一条任务,在线 P95 ≤ 5s 另一侧可见(FR-WEB-36)。
6. 离线:断网后本地可浏览/编辑,加密 mutation 入队;复网按序回放;409 冲突触发三方 diff UI(Web PRD §5.4)。
7. Eisenhower Matrix 视图、Todo 日历视图在浏览器可用(FR-TD-06/13)。
8. CSP 在 prod enforce,部署后 7 天 zero violation;Lighthouse landing Perf ≥ 90、`/app/todos` Perf ≥ 80、A11y ≥ 90(FR-WEB-68/82)。
9. Chrome / Safari / Firefox 三浏览器主路径 Playwright E2E 全 green(dev-plan §7)。
10. Web 端任何组件不 import Tauri / 原生 API;原生能力全走注入式 `host` 接口(主 PRD §5.15.3)。
11. `docs/PLUGIN_MAP.md` 已更新登记 `apps/web`(Web Console)及相关 plugin 真实状态。

### Success Signals

- 新用户可在不下载桌面 App 的情况下于浏览器完成核心任务管理(转化漏斗指标)。
- 多端用户"换设备不丢功能"焦虑下降。
- 桌面 ↔ Web 同步延迟 P95 ≤ 5s 的实测达成率。

---

## Open Questions / Unknowns

1. **`ADR-0003` 冲突已解决** — `docs/adr/0006-web-face-hybrid-reuse-boundary.md` 已收窄 Web 面规则:Web 保留 clean rewrite 的宿主壳/视图层实现权，但必须共享数据契约、Sync/Repository 语义，并以 Console PRD 作为共享 UI truth source。后续 plan/build 不再以“必须直接复用 plugin 源码”作为硬门。
2. **Console 子 PRD 角色已冻结** — `sub-prds/console/PRD.md` 继续作为 Web 共享模块的 UI 真理源;若后续 feature 因浏览器约束偏离，必须在对应 Web docs 中显式记录例外。
3. **浏览器加密栈对齐方式** — 与 Sync W0–W3 Rust 加密原语对齐:是共享同一套 WASM,还是 Web 独立实现 + 共享 RFC 向量门?`待确认`,需与 Sync owner 对齐。
4. **Sync 端点就绪度** — `/sync/pull` 的 `since_seq` 分页 + `sync_events` per-account WAL、`X-Device-Id` middleware 是否已在 Edge Function 落地?dev-plan §2 标注 Web 启动需 Sync 至少 v0 可用。`待确认`。
5. **现 `apps/web` 归档落点** — 归档为 `apps/web-release-site` 独立 app,还是并入 landing 路由?营销 landing 是否随新 SPA 重写?`待确认`。
6. **`@repo/web` 包命名与 Turborepo 接线** — dev-plan 假设包名 `@repo/web`;需确认 monorepo task 注册。`待确认`。
7. **roadmap 拆分边界** — Web 子 PRD 已分 Phase 4.5a/4.5b;roadmap init 时 wave 0 的原子 feature 边界、Automation Mode、并发 cap 由 roadmap-loop init + 人工 review 决定。`待确认`。

---

## ADR-lite Trigger

- **Needed**:Resolved
- **Decision Topic**:Web 子系统的代码复用策略。
- **Resolution**:`docs/adr/0006-web-face-hybrid-reuse-boundary.md` 采用混合规则:共享契约与 Console UI truth，允许 Web 独立宿主壳/浏览器视图层实现。
- **Residual Follow-up**:后续 Web feature 需记录任何浏览器特有偏离，并补足 contract / behavior parity 验收。
- 第二 ADR 触发点:技术栈 Vite SPA vs Next.js——已由用户拍板 Vite(且与 ADR-0003 架构图一致),建议在 `design.md` decision snapshot 记录即可,不需独立 ADR。

---

## Three-faces boundary check

- 本变更拥有面:**新增"网页版"宿主壳(第三个面)** + `@repo/core-data` 新 driver + `@repo/core` 新 Web host 注入桩。
- 业务逻辑落点:Web 专属实现的任务 / 项目 / 习惯 / 番茄 / 标签业务逻辑必须落在 Web 子系统的 plugin / feature 层,**不得**塞进 `apps/web` 宿主壳的 shell/routing/providers,也**不得**塞进 `packages/core/`。
- `apps/web` 宿主壳只做:routing、providers、Service Worker、host 注入桩装配。
- 风险:用户选"Web 专属重写"后,容易把业务逻辑直接写进 `apps/web/app/*` 页面组件(现 Next.js 版正是此反模式:`console/page.tsx` 直接写死任务)。plan 阶段须明确 Web 子系统内部的 plugin/feature 分层。

---

## Planner Handoff

> 推进粒度:用户选定**整体走 roadmap**。建议下一步为 `/xai-roadmap-loop mode: init`(input_kind: prd,source: `docs/planning/sub-prds/web/PRD.md`),把本 brief 与审计报告写进 `notes:`。以下 handoff 同时可直接喂 `feature-plan`(若 roadmap 拆出的首个 feature 需要)。

```text
Motivation: apps/web 当前是桌面 App 营销/RC 站 + Sync 安全基线壳,/console 为静态 mock,
  无真实任务管理形态。需重建为独立 TickTick Web Console 子系统。
Goal: 全新 Vite SPA apps/web,对齐 TickTick Web 核心全功能(任务管理/视图/Pomodoro/Habit/
  统计/搜索/快捷键/主题/多端同步/离线),与桌面 App 共享同一后端数据,桌面↔Web 双向实时可见。
Scope: 见 Structured Brief §Scope。技术栈 Vite SPA;Web 专属重写实现;现 apps/web 归档为
  release-site;整体走 roadmap(Web 子 PRD Phase 4.5a/4.5b)。
Non-goals: 桌面 overlay/click-through/grid/桌宠/冥想;多人协作/分享链接;Timeline/Filter/
  Achievements;移动端原生 App;浏览器扩展。
Constraints: 平台无关 React 组件(不 import Tauri/原生 API,走注入 host 接口);零知识硬规则
  (业务实体全字段进 encrypted_blob);浏览器加密栈对齐 Sync W0-W3 RFC 向量;X-Device-Id 强制
  校验;不复用桌面专属概念;Console 三栏 UI 以 sub-prds/console/PRD.md 为参考源。
Dependencies: Sync W0-W3(Shipped,/sync/* 端点+Supabase SQL/Edge Function);@repo/core
  (Stable);@repo/core-data(In-Dev,需交付 Sync blob driver);plugin-account(In-Dev,
  同步引擎契约);plugin-productivity/console/project/labels/calendar(READY_FOR_VERIFY,
  作为行为/契约参考——用户选 Web 专属重写,不直接复用代码)。
Automation Mode: A-Claude(高风险:架构选型/加密栈/平台边界)。
Verify Cross-vendor: no(按用户指定;建议 roadmap review 时复议为 yes)。
Acceptance Criteria: 见 Structured Brief §Acceptance Criteria(11 条)。
Open Questions: 见本档 §Open Questions(7 项);其中 ADR-0003 冲突为最高优先,planner 必须先解。
ADR-lite: Needed=Yes,Topic=Web 复用策略(plugin 复用 vs Web 专属重写,可能 supersede ADR-0003)。

Planner must first decide:
1. 按 `ADR-0006` 推进后续 Web roadmap；若出现浏览器特有偏离，逐条落文档，不回到“是否必须源码复用”的抽象争论。
2. roadmap wave 0 的原子 feature 边界与依赖图。
3. 浏览器加密栈与 Sync W0-W3 的对齐方式。
4. 现 apps/web(Next.js)的归档落点。
```

---

## Saved brief path

`docs/reviews/web-ticktick-parity/20260521-feature-brief.md`
