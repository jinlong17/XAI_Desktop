# 产品模块导航地图 / Product Module Map

> **权威来源**：[ADR-0013](adr/0013-branch-sync-governance.md) §D1（六产品线）/§D2（分支拓扑）/§D3（Web→Desktop 同步闸门）/§D4（账号云同步），与 [`CLAUDE.md`](../CLAUDE.md) §“Product module map & task routing”。
> 本文是 Codex / Claude / Cursor 的**任务归属 + 开发导航**单一事实源，并镜像到 [`dashboard-state.json`](workflow/project/dashboard-state.json) 的 `product_lines` Product Module Registry。dev-dashboard 的总览、产品结构图、部署、发布记录、文档库和 Skill / Agent 页面都从该 registry 派生。
>
> **长期平台路线（planning-only）**：未来 iPhone / iPad / Apple Watch / Android / 浏览器扩展 等平台的进入时机、定位与协同见 [`docs/planning/LONG_TERM_PRODUCT_ROADMAP.md`](planning/LONG_TERM_PRODUCT_ROADMAP.md)（机器可读镜像为 `module-classification.json` 的 `future_surfaces`，标 planning-only，**永不**作为 active 分类目标）。本文只覆盖当前六模块。

## 如何使用

1. **先归类**：接到任务后，用第 0 节速查表的“任务归属信号”把它落到**唯一一个**模块。
2. **再取导航**：进入该模块详情，按它的 *开发目标 / 推荐 skill / prompt 模板 / 开发 workflow* 推进。
3. **看联动**：用该模块的 *进入下一模块（transitions）* 判断完成后流向哪里、触发条件、用哪条 branch 与 skill；用 *影响 / 需同步更新（impacts）* 判断本次改动是否要联动其它模块。

**全局硬规则（不可违反）：**

- `web → app` **只能经 D3 gate**（`xai-web-to-desktop-sync`，W0–W4 + parity receipt）；**禁止**把 Web 改动直接合进 `dev`。
- `sync` **只搬 `syncScope: account-sync` 的实体**；`device-local` 永不上云（ADR-0013 §D4，9 项完整性清单）。
- `site` / `admin` 为 **PROPOSED（owner-deferred）**：未经 operator 确认，不得开新工作分支、不得当作 active 开发线，先用 `xai-feature-brief` 规范化占位。
- `desktop-plugin-next` 已创建为插件长分支；`desktop-next` / `release/desktop/<version>` 仍是 defined-not-yet-created，创建是独立的 operator 确认步骤，任何触及 `dev` 的操作都需显式确认。
- 站内（同一条 Web 线）的部署/CSP 改动（`apps/web/wrangler.toml`、`apps/web/public/_headers`）走 **ADR-0008 扩展协议 + feature-plan/review**，**不走 D3**（D3 只判定 Web 变更对 App 的影响）。

## 0. 任务归属速查（routing table）

| # | 模块 | key | 主 / 短分支 | 任务归属信号（命中即归该模块） | 状态 |
|---|---|---|---|---|---|
| 1 | Web | `web` | web / codex/web/<feature> | 改动落在 apps/web/(Vite SPA host shell:App.tsx、main.tsx、routes、providers)或 packages/xai-web-*、packages/plugin-web-* 任一包内；涉及 24 个 Web 模块的 UI/交互:任务、看板(6 视图)、Dashboard 网格、日历、四象限、番茄、习惯、冥想、倒计时、统计、AI 对话、桌宠、设置(13 面板)、命令面板(cmdk)；涉及浏览器持久化:xai_* localStorage 键(如 xai_dash_order)、usePref/WebPrefRegistry、加密 IndexedDB 缓存,或 web:<module>:<verb>-<noun> 类型化事件总线(@repo/core/events,如 web:calendar:create-requested、web:habits:checkin-recorded) | P0 · active |
| 2 | Mac 桌面版 App | `app` | desktop-next -> dev | 改动落在 apps/desktop/ 或 src-tauri/ 的 Mac 壳 / Web 容器 / native chrome：主窗口承载 Web SPA、菜单栏、托盘、离线缓存、账号+Keychain、自动更新、系统通知、深链、开机启动、`桌面插件`入口按钮；物理 host 可实现 Tauri 命令，但产品身份不是桌面整理器 | P1 · active app lane |
| 3 | 桌面整理插件 / Widget | `plugin` | desktop-plugin-next | 改动落在桌面插件平台运行时（多窗口 engine、native overlay、click-through、Spaces/多显示器矩阵、grid persistence、Plugin Host/SDK）或 packages/plugin-{organizer,clipboard,widgets,pet} 等 P2 插件包；需求提到 桌面整理 / Smart Container / Grid 容器 / 快速入口 / 快速操作小窗 / 浮动小组件 Widget / 便签 / 桌面宠物 / 冥想；即使运行时代码物理在 host，产品归属仍是 plugin | Phase 1 foundation complete · Phase 2 code path complete · packages paused |
| 4 | 账号云同步层 | `sync` | sync-v1 roadmap wave | 实体出现 syncScope: account-sync / device-local 字段,或要在 packages/core-data/src/entities.ts 注册新 entityType(形如 productivity.todo,须匹配 ^[a-z]+\.[a-z_]+$)；涉及 /sync/push、/sync/pull、加密信封(envelope)、outbox、commit_seq 游标、nonce lease、AES-256-GCM、HPKE、device_id / encryption_device_id 等同步协议要素；需求是 Web IndexedDB ⇄ 服务端 encrypted blobs ⇄ App SQLite/SQLCipher 之间收敛,而非 Web 单端 UI 或 App 原生壳本身 | P2 · paused |
| 5 | 官方网页 | `site` | codex/site/<feature> | 关键词命中:官方网页 / 官网 / marketing 站 / 下载页 / download page / 自动更新 / auto-update / updater / appcast / 发布说明 / release notes / 落地页 landing；分发与发布产物:.dmg / installer / 安装包 / updater metadata / latest.json / appcast.xml,且来源绑定 release/desktop/<version> 与 tag vX.Y.Z(ADR-0013 D2,该分支为 defined-not-yet-created)；部署设施复用:apps/web/wrangler.toml、apps/web/deploy/*、Cloudflare Pages、apps/web/public/_headers / CSP 仅为站点本身(ADR-0008),而非 apps/web/ 的 24 个产品模块 | proposed |
| 6 | Admin Dashboard | `admin` | codex/admin/<feature> | 路径命中:docs/prototypes/admin-dashboard/index.html、INTEGRATION_PLAN.md,或拟建的 apps/admin/、/admin 独立构建目标、codex/admin/<feature> 分支；关键词命中:管理中台 / 控制面 / Control Plane / 运营后台 / 后台管理,以及总览看板、运营队列、用户管理、组织/空间、功能管理、订阅计费、审计日志；AI 治理类:Provider 配置、模型×套餐权限矩阵、套餐分层路由、AI 用量配额、成本上限、provider secret handle(服务端加密密钥句柄,浏览器只拿状态不拿密钥) | proposed |

> 完整的归属信号、prompt 模板与 workflow 见下方各模块详情。

## 模块详情

### 1. Web （`web`）

- **状态**：P0 · active · Web 主线
- **推荐 branch**：web / codex/web/<feature>
- **关键依赖**：App UI 源头
- **开发目标**：在 web 分支上以生产级 Vite SPA + plugin-web-*/xai-web-* 插件开发 Web 版本功能与缺陷修复,Web 是最完整的产品面,也是 App 复用的 UI 源头。

**任务归属信号**

- 改动落在 apps/web/(Vite SPA host shell:App.tsx、main.tsx、routes、providers)或 packages/xai-web-*、packages/plugin-web-* 任一包内
- 涉及 24 个 Web 模块的 UI/交互:任务、看板(6 视图)、Dashboard 网格、日历、四象限、番茄、习惯、冥想、倒计时、统计、AI 对话、桌宠、设置(13 面板)、命令面板(cmdk)
- 涉及浏览器持久化:xai_* localStorage 键(如 xai_dash_order)、usePref/WebPrefRegistry、加密 IndexedDB 缓存,或 web:<module>:<verb>-<noun> 类型化事件总线(@repo/core/events,如 web:calendar:create-requested、web:habits:checkin-recorded)
- 涉及 AI 配置/对话适配:window.claude.complete shim、xai-web-ai-chat、aiPane、secretStore、claudeStreamAdapter、llmProvider
- 涉及 Web 发布面:Cloudflare Pages、wrangler.toml、apps/web/deploy/、CSP/Sentry、_headers、sw.js、设备会话登录(web-auth-device-session)
- 需求是纯浏览器侧、零 Tauri 依赖(ADR-0003/0007:plugin-web-* 必须平台无关),不触碰 apps/desktop/ 或原生命令

**推荐 skill / agent**

- `xai-feature-brief` — 拿到一个模糊的 Web 功能/扩展/重构想法时,先规范化为结构化 brief(分类、依赖扫描、mock 策略),再交给 feature-plan。
- `xai-feature-full-loop` — 单个 Web 功能要端到端跑完 plan→review→build→verify→ship 时,在父会话直接编排整条 Workflow V2 流水线。
- `xai-web-to-desktop-sync` — 一个已落地的 Web 改动可能影响 Desktop,需要在 web→desktop-next 之前做 W0–W4 分级并产出 Parity Receipt 时(离开本模块流向 App 的唯一通道)。
- `xai-web-deploy-preflight` — Web 改动触及 Cloudflare Pages、`deploy-web.yml`、`wrangler.toml`、`_headers`、Sentry sourcemap 或生产/预览发布证据时,先产出部署 preflight receipt;它不部署、不推 main、不声明 live smoke。
- `xai-roadmap-loop` — 要把一份已评审的 Web 路线图(如 docs/workflow/roadmap/xai-web-console.md)按波次批量推进多个功能到 READY_TO_SHIP 时。
- `xai-release-log` — 每完成一个 Web 可见增量并 ship 后,登记发布日志。

**开发 workflow**

1. 规范化:对模糊想法先跑 xai-feature-brief 产出结构化 brief(分类/依赖扫描/mock 策略),明确落点在 apps/web/ 或某个 plugin-web-*/xai-web-* 包。
2. 规划+评审:feature-plan 给出方案 → feature-review 评审定稿(NEEDS_REVIEW→APPROVED);单功能可改用 xai-feature-full-loop 在父会话一把跑完。
3. 实现:在 codex/web/<feature> 短分支上 feature-build,一次一个 phase,业务逻辑只进 packages/plugin-web-*,模块间走 @repo/core/events,UI 偏好走 localStorage、数据实体走加密 IndexedDB。
4. 验证:feature-verify 跑 vitest + vite build 绿灯;部署/CSP/Cloudflare 相关改动额外跑 xai-web-deploy-preflight;必要时浏览器手动 smoke(Chrome/Safari/Firefox)作为部署就绪门。
5. 发布:ship 合入 web,触发 Cloudflare Pages 发布(ADR-0008);随后 xai-release-log 登记增量并用 xai-dev-dashboard-sync 刷新看板证据。
6. 跨面判定:若改动可能影响 Desktop,在 web→desktop-next 之前跑 xai-web-to-desktop-sync 做 W0–W4 分级并产出 Parity Receipt(Verdict: NO_APP_CHANGE|GATE_ONLY|DESKTOP_DELTA_REQUIRED|BLOCKED),这是 Web 流向 App 的唯一通道。

**常用 prompt（可直接复制）**

<details><summary>新功能(规范化→规划)</summary>

```text
Start the feature-plan agent.
  动机:web design/DESIGN.md 定义的某 Web 模块需要新增/增强一项面向用户的能力(在 apps/web/ + packages/plugin-web-* 内)。
  目标:在 packages/plugin-web-<module>/ 内实现该能力,host shell(apps/web/src/App.tsx)注册,模块间仅通过 @repo/core/events 的 web:<module>:<verb>-<noun> 通道通信。
  范围:仅限本 Web 插件包 + 其 docs 四件套;UI 偏好走 localStorage(usePref/WebPrefRegistry),数据实体走加密 IndexedDB;不改 apps/desktop/、不发明新数据契约。
  约束:纯浏览器、零 Tauri 依赖(ADR-0003/0007);React 19 + TS 5.9,禁止新增状态库;短分支 codex/web/<feature>,发布目标 Cloudflare Pages(ADR-0008);若可能影响 Desktop,ship 前须经 D3 gate 分级。
```

</details>

<details><summary>Web 缺陷修复</summary>

```text
Start the bug-diagnose agent.
  现象:<Web 模块在浏览器中的具体异常,例如 Dashboard 拖拽顺序刷新后丢失 / AI 配置保存后读取为空>。
  预期:<正确行为,例如 xai_dash_order 持久化后刷新仍保留 / aiPane 保存的密钥经 secretStore 正确回读>。
  实际:<观测到的错误行为>。
  线索:怀疑 packages/{xai-web-*,plugin-web-*}/src/internal/ 下的某文件(如 sanitizeOrder / useDashOrder / secretStore / llmProvider);复现路径 apps/web/ dev server,浏览器侧 localStorage/IndexedDB 状态相关。
```

</details>

<details><summary>整条路线图批量推进</summary>

```text
/xai-roadmap-loop
  source: docs/workflow/roadmap/xai-web-console.md
  mode: run
  范围:仅推进 xai-web-* / plugin-web-* 行(Web 版本模块),按波次依赖序并行,目标把每个 eligible 行推到 READY_TO_SHIP。
  约束:在 web 分支 / codex/web/<feature> 短分支上作业;不触碰 apps/desktop/、dev;每个可见增量 ship 后登记 xai-release-log。
```

</details>

**进入下一模块（触发条件 · branch · skill）**

| → 目标模块 | 触发条件 | branch | skill | 说明 |
|---|---|---|---|---|
| Mac 桌面版 App（`app`） | 一个已落地的 Web 改动触碰共享 UI / @repo/core 接缝、或在 desktop 运行时(VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline)行为不同,需要带入 Desktop App | web → desktop-next(经 D3 gate;desktop-next 已定义但尚未创建,创建需 operator 确认) | `xai-web-to-desktop-sync` | 跑 D3 分级:W0 仅记录、W1 合入 desktop-next 跑 web build+tauri build 门、W2 加 desktop 离线/运行时/profile 测试,产出 Parity Receipt(NO_APP_CHANGE\|GATE_ONLY\|DESKTOP_DELTA_REQUIRED\|BLOCKED)。这是 Web 改动流向 App 的唯一通道,不是把 dev 拉成 web 的子集。 |
| Mac 桌面版 App（`app`） | Web 改动需要新的 Tauri/Rust 原生能力(新 command、capability、NSWindow/原生行为)才能在 App 落地,即 D3 分级为 W3 | desktop-next（defined-not-yet-created）/ desktop-plugin-next（已创建） | `xai-feature-full-loop` | W3 原生 delta 是真正的新工作,不是 merge:先用 xai-web-to-desktop-sync 判出 W3/DESKTOP_DELTA_REQUIRED,再把原生增量路由到 desktop 侧的 xai-feature-full-loop 全流程,而非从 web 直接合并；触达 desktop-next / dev 仍需 operator 确认。 |
| 官方网页（`site`） | 需求落在官方网页/下载页/自动更新宿主(marketing + download + auto-update host),复用 Cloudflare 部署基建但与 release/desktop/<version> 绑定 | codex/site/<feature>(site 线 PROPOSED,owner-deferred;短分支约定已定,实际开工尚未授权) | `xai-feature-brief` | site 与 web 共用 Cloudflare 部署基建与 ADR-0008,但属独立产品线且为 PROPOSED/owner-deferred(ADR-0013 §S7 #2,本轮治理 out of scope、未授权开工):先用 brief 规范化占位,勿在 apps/web/ Console 内塞下载/官网逻辑,勿当作已批准的 active work 直接推进。 |
| Admin Dashboard（`admin`） | 需求落在管理中台/控制面(AI 配置、用量、权限、审计、运维操作),即与 docs/prototypes/admin-dashboard/index.html 原型同源的 Control Plane 能力,而非 Web Console 终端用户面 | codex/admin/<feature>(admin 线 PROPOSED,六线中最低优先级,owner-deferred;短分支约定已定,尚无包、无 roadmap、未授权开工) | `xai-feature-brief` | admin Control Plane 与 Web Console 的 AI 配置/用量面同源但属独立产品线,目前仅原型(docs/prototypes/admin-dashboard/index.html),PROPOSED/owner-deferred(ADR-0013 §S7 #3):先用 brief 规范化占位,勿把后台管理/审计/运维逻辑塞进 apps/web/ Console,勿当作已批准 active work。 |

**影响 / 需同步更新的模块**

| 受影响模块 | 何时 | 需要的动作 |
|---|---|---|
| Mac 桌面版 App（`app`） | Web 改动落在共享 UI / @repo/core 事件或类型、或 desktop 运行时敏感的代码(W1/W2/W3/W4),且需要带入 Desktop App | 在 web→desktop-next 之前运行 xai-web-to-desktop-sync 做 W0–W4 分级并产出 Parity Receipt;W3 需在 desktop-next/desktop-plugin-next 经 xai-feature-full-loop 补原生 delta,W4 需 xai-desktop-release-gate(含 macOS 手动 smoke、签名/公证/DMG/updater 证据)。这是 Web→App 的唯一通道(D3 gate),非分支对齐。 |
| 账号云同步层（`sync`） | Web 新增/修改 account-sync 实体(syncScope: account-sync,如任务卡片、看板、习惯打卡的远端同步形态),改动 Web IndexedDB 侧的 outbox/push/pull 形态 | 注意:web↔sync 不是分支 promotion,而是 ADR-0013 D4 的实体作用域闸门(只有 syncScope: account-sync 实体才同步,device-local 永不同步)。按 D4 九项完整性清单补齐:entityType(注册到 packages/core-data/src/entities.ts)、schemaVersion、本地存储映射、push 信封、pull apply 规则、冲突策略(非静默 LWW)、Web IndexedDB 测试 + App SQLite 测试 + 双设备同步 smoke;device-local 实体严禁进远端 outbox。 |
| 官方网页（`site`） | Web Console 发布管线/Cloudflare 部署配置(wrangler.toml、apps/web/deploy/、_headers、CSP)发生变更,而官网下载页复用同一套部署基建 | 同步评估官方网页(site 线,PROPOSED/owner-deferred)的 Cloudflare 部署/CSP 配置与下载/自动更新宿主,确保与 ADR-0008 + release/desktop/<version> 产物保持一致;site 尚未授权开工,仅做兼容性评估,不在本模块内落官网逻辑。 |
| Admin Dashboard（`admin`） | Web 改动触及与管理中台同源的 AI 配置/用量/权限/审计面(aiPane、secretStore、用量统计、权限模型),可能与 docs/prototypes/admin-dashboard/index.html 原型的 Control Plane 形态产生交集 | 记录对 admin Control Plane(PROPOSED,六线最低优先级,owner-deferred,仅原型无包)的潜在影响,保持配置/数据契约前向兼容;admin 尚无 roadmap、未授权开工,不在 Web Console 内实现后台管理逻辑。 |

---

### 2. Mac 桌面版 App （`app`）

- **状态**：P1 · active app lane · 独立桌面开发线
- **推荐 branch**：desktop-next -> dev
- **关键依赖**：依赖 Web + Tauri host
- **开发目标**：把 Web SPA 作为 Mac 原生 App 承载起来，并补齐 native chrome（菜单栏、托盘、离线缓存、账号+Keychain、自动更新、系统通知、深链、开机启动、`桌面插件`入口）。App 以 Web 为 UI 源构建，走自己的分支方向（dev 为 App RC，与 web 分叉是正常状态）；多窗口 / overlay / 桌面整理的产品归属在 `plugin`。

**任务归属信号**

- 改动落在 apps/desktop/ 或 src-tauri/ 的 Mac 壳 / Web 容器 / native chrome，而非 apps/web/ 的 Web UI 源
- 出现主窗口承载 Web SPA、菜单栏/托盘、离线缓存、账号+Keychain、auto-update、系统通知、deep link、launch-at-login、`桌面插件`入口按钮等壳能力
- 涉及离线/本地优先运行时,如 VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline、App SQLite(SQLCipher)、xai-desktop-layout localStorage 键(ADR-0013 D3 W2 引用此离线 profile)
- 需要新增 Tauri/Rust host command 或 platform/macos 适配来支撑 Mac 壳或插件平台；按产品意图区分归属：壳/native chrome = app，多窗口/overlay/插件平台运行时 = plugin（物理代码仍可在 host）
- 短分支形如 codex/desktop/<feature>,目标长分支为 desktop-next -> dev(App RC,均 defined, not yet created)
- 签名/公证/DMG/updater 等仅在 release/desktop/<version> 冻结分支处理(不在此模块常规开发)

**推荐 skill / agent**

- `feature-plan` — 新增 App 原生/运行时能力时,作为标准 feature 流水线入口,附 动机/目标/范围/约束 brief 启动规划(feature-plan -> feature-review -> feature-build -> feature-verify -> ship)。
- `xai-feature-full-loop` — D3 判定为 W3 native-bridge-needed(需要新 Tauri 命令/capability/NSWindow 行为)时,用 /xai-feature-full-loop 在 desktop-next / desktop-plugin-next 上把原生增量当作真正的新工作整轮跑通(不是 merge)。
- `bug-diagnose` — App **壳运行时**(离线缓存、账号会话/Keychain、菜单栏/托盘、通知、深链、自动更新、Web SPA 容器)出现回归时,作为 bugfix 流水线入口,附 现象/预期/实际/线索 brief(bug-diagnose -> bug-fix -> bug-verify -> ship);**多窗口 / grid / overlay 回归归插件平台段**(走 codex/plugin/*),不在此处。
- `xai-web-to-desktop-sync` — 工作来源是一笔 web 改动时:用此 D3 闸口技能按 ADR-0013 把它分类为 W0-W4 并产出 Parity Receipt,判断是否需要在 App 侧补增量;它是 web -> App 的唯一入口桥,不在 App 内部独立发起。
- `xai-desktop-release-gate` — D3 判定 W4 release-risk,或 App 改动触及签名、公证、DMG、updater、release/desktop/<version>、dev RC 时,产出桌面发布 gate receipt;它不创建分支、不触碰 dev、不签名/公证/上传。
- `xai-release-log` — 每完成一个可见的 App 增量(G1 锚点 SHIPPED 或 dev RC 推进)后,登记 docs/workflow/project/release-log.md。

**开发 workflow**

1. 接收工作来源:要么是 App 原生新需求(直接 Start the feature-plan agent),要么是一笔 web 改动经 /xai-web-to-desktop-sync(D3)判为需要 App 增量(W2/W3/W4)后进入本模块;W0 仅记录不进入,W1 仅过门禁。
2. 标准 feature 流水线:feature-plan -> feature-review -> feature-build(一次一阶段,跑完停)-> feature-verify -> ship;原生桥接类(W3)改用 /xai-feature-full-loop 在 desktop-next / desktop-plugin-next 上整轮跑(真正新工作,不是 merge)。
3. 原生回归走 bugfix 流水线:bug-diagnose -> bug-fix -> bug-verify -> ship。
4. 验证按 D3 层级补齐:W1 跑 Web build gate + desktop tauri build gate;W2 加 offline/runtime/profile 测试;W4 跑 xai-desktop-release-gate,在推进到 dev / release/desktop/<version> 前加人工 macOS smoke、签名/公证/DMG/updater 元数据证明。
5. 可见增量完成后用 xai-release-log 登记;推进到 desktop-next -> dev(App RC)-> release/desktop/<version> 的分支动作均需操作者显式确认(这些长分支 defined, not yet created;凡触达 dev 需显式确认)。

**常用 prompt（可直接复制）**

<details><summary>Mac 壳能力新功能（菜单栏 / 托盘 / 通知）</summary>

```text
Start the feature-plan agent.
  动机:Mac 壳需要在菜单栏/托盘提供"同步状态 + 快速操作"入口,让用户不打开主窗也能看状态、快速新建。
  目标:在 apps/desktop/ + src-tauri/ 上实现 menubar/tray 菜单 + 原生通知,复用 Web SPA 的账号/数据;不引入多窗口编排。
  范围:仅 App 壳通道(codex/desktop/<feature> -> desktop-next,defined, not yet created),壳能力 = 菜单栏/托盘/离线缓存/账号+Keychain/自动更新/系统通知/深链/开机启动;不做多窗口/挂件/桌面整理(那是 plugin 平台 codex/plugin/*)。
  约束:壳只承载 Web SPA + 原生 chrome;多窗口/overlay/grid 运行时归桌面插件平台;遵守 ADR-0013 D3 与 SYSTEM_ARCHITECTURE。
```

</details>

<details><summary>Web 增量同步到 App</summary>

```text
/xai-web-to-desktop-sync
  来源:web 分支最近一批改动(共享 UI / @repo/core seam,可能在 desktop runtime 下行为不同)
  目标:按 ADR-0013 D3 把这批改动分类为 W0-W4,产出 Parity Receipt(Verdict: NO_APP_CHANGE | GATE_ONLY | DESKTOP_DELTA_REQUIRED | BLOCKED;Desktop impact: auth/offline/storage/native/window/release),判断是否需要在 desktop-next 补 App 增量
  范围:web -> desktop-next 的 D3 闸口;W3 则路由到 /xai-feature-full-loop 作为原生新工作(real new work,不是直接 merge);W0 仅记录不合并
  约束:注意 VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline 离线 profile;W2 需补 offline/runtime/profile 测试;触达 dev / release/desktop/<version> 需操作者显式确认(desktop-next/dev/release 均 defined, not yet created)
```

</details>

<details><summary>Mac 壳运行时 Bug</summary>

```text
Start the bug-diagnose agent.
  现象:App 在 desktop-phase1-offline profile 下重启后,菜单栏同步状态停在旧值/离线缓存未回读,账号会话需重新登录。
  预期:壳重启后从离线缓存 + Keychain 恢复账号会话与最近同步状态,菜单栏图标正确反映。
  实际:重启后状态错误或被登出。
  线索:怀疑壳的离线缓存(encrypted cache)/Keychain 会话回读时序;仅复现在 apps/desktop/ 壳运行时,Web 浏览器路径正常。
```

</details>

**进入下一模块（触发条件 · branch · skill）**

| → 目标模块 | 触发条件 | branch | skill | 说明 |
|---|---|---|---|---|
| 桌面整理插件 / Widget（`plugin`） | 改动落在桌面插件平台运行时 / Widget / 插件 SDK(plugin-organizer、widgets 等)而非 Mac 壳/native chrome 本身 | desktop-plugin-next / codex/plugin/<feature> | `xai-feature-full-loop` | 插件平台线与 Mac 壳隔离,避免插件平台 churn 动摇 App RC；多窗口/overlay 运行时代码可物理落在 host，但产品归属是 plugin。Phase 1 系统底座与 Phase 2 common capability code path 已完成；clipboard/widgets/pet/meditation 等具体插件包仍需真实 host smoke 和 operator 确认后解冻。 |
| 账号云同步层（`sync`） | 需要新增/改动 account-sync 实体的端侧落地(App SQLite outbox、push/pull 应用规则、两端冲突策略) | codex/sync/<feature>(并入 desktop-next/dev 通道,均 defined, not yet created) | `xai-feature-full-loop` | 按 ADR-0013 D4:Web 与 App 不互相同步,都同步到一个账号云;只有 syncScope=account-sync 实体进 outbox,device-local 永不同步。sync-v1 线在 G1 SHIPPED 前 paused,需操作者解冻。 |
| Web（`web`） | 诊断发现根因在共享 UI / @repo/core 源头,需回到 Web 主线修复(D3 反向 / hotfix back-merge) | web / codex/web/<feature> | `bug-diagnose` | App 与 Web 是两条独立聚焦分支,共享改动按需在 web 修复后再经 D3(/xai-web-to-desktop-sync)正向流回 desktop-next;不要为对齐而强行 force-merge 两条线。 |

**影响 / 需同步更新的模块**

| 受影响模块 | 何时 | 需要的动作 |
|---|---|---|
| Web（`web`） | App 侧诊断/集成发现共享 UI 或 @repo/core seam 的问题源自 Web 源码(App 以 Web 为 UI 源构建) | 在 web / codex/web/<feature> 修复源头,再经 D3(/xai-web-to-desktop-sync)产出 Parity Receipt 正向流回 desktop-next,而非只在 App 侧打补丁 |
| 账号云同步层（`sync`） | App 新增/变更需要跨设备同步的 account-sync 实体,或改动 App SQLite 落地映射 | 在 codex/sync/<feature> 按 ADR-0013 D4 完整性补齐:entityType/schemaVersion/本地映射/push 格式/pull 应用规则/冲突策略 + Web IndexedDB 测试 + App SQLite 测试 + 两设备同步 smoke(builds on docs/contracts/data-repository-v0.md + sync-v1) |
| 官方网页（`site`） | App 推进到 release/desktop/<version> 冻结并产出 DMG / updater 元数据 / 版本号 | 在 codex/site/<feature> 更新官方网页的下载页与自动更新 host(复用 ADR-0008 Cloudflare 部署基建,docs/adr/0008-cloudflare-deploy-target-and-csp.md),使其指向新的 release 工件。注意 site 线为 PROPOSED(owner-deferred,ADR-0013 Open Questions S7),无包无 roadmap,需操作者确认后才动工 |
| 桌面整理插件 / Widget（`plugin`） | App host 改动了插件依赖的 SDK / 多窗口契约 / 窗口命令契约，或产品意图属于桌面原生超能力层 | 在 desktop-plugin-next / codex/plugin/<feature> 同步更新插件平台与受影响插件,就绪后 merge 回 desktop-next(Phase 1 系统底座与 Phase 2 common capability code path 已完成；具体插件包等真实 host smoke 和 operator 确认后再解冻) |

---

### 3. 桌面整理插件 / Widget （`plugin`）

- **状态**：Phase 1 系统底座完成 · Phase 2 common capability code path 完成 · 插件包 paused
- **推荐 branch**：desktop-plugin-next
- **关键依赖**：依赖桌面 App 插件平台
- **开发目标**：拆成两层推进：**插件平台运行时/G1 锚点**（multi-window engine、grid persistence、window-command、Widget Host/SDK、Plugin Center contract）已完成 Phase 1 系统底座，Phase 2 common capability code path 已用 sample-widget host flow 跑通，产品归 plugin、物理执行可在 P1 App lane；**具体插件包**（clipboard/widgets/pet/meditation 等）仍属 paused，等真实 macOS host smoke 和 operator 确认后解冻。插件数据默认 syncScope: device-local（留本机、永不入远端 outbox），仅在显式标记 account-sync 时才经同步层跨设备。

**任务归属信号**

- 改动落在 apps/desktop/ 的插件槽位（plugin slots），或 packages/plugin-{organizer,clipboard,widgets,pet} 等 P2 插件包（plugin-meditation 当前为 PLUGIN_MAP Planned 行、尚未建包）
- 需求提到 桌面整理 / Smart Container / Grid 容器 / 拖拽归类 / 文件夹与 App 整理 / 浮动小组件 Widget / 便签 / 桌面宠物 / 冥想
- 涉及插件平台 / SDK / Widget Host / 插件清单 manifest.json / 插件注册装载（plugin platform / plugin SDK），归 desktop-plugin-next 隔离线
- 涉及 Plugin Center 的**产品契约**（可添加插件目录、`PluginInstance`、`AddToDesktopRequest`、实例 settings schema、内置插件 maturity/status、placement/pin/click-through 等实例模型）归 plugin；Mac App 控制面板按钮和必要的 host 容器命令归 app 物理实现
- 插件本地数据带 syncScope: device-local（已注册的如 clipboard.item；ADR-0013 D4 还以 widgets.widget 为示例）——不入远端 outbox，留在本设备；只有显式声明 account-sync 才走同步层
- 分支线索：short = codex/plugin/<feature>，long = desktop-plugin-next（已创建；触达 desktop-next / dev 仍需 operator 确认）
- 状态线索：需求若是 multi-window engine / grid persistence / window-command / Widget Host-SDK 等 **G1 平台运行时锚点**，它是 active gate，不在 P2 冻结内；需求若是 clipboard/widgets/pet/meditation 等插件包，则仍是 P2 PAUSED，等真实 host smoke 和 operator 解冻确认后再开工。

**推荐 skill / agent**

- `xai-feature-brief` — 插件需求待开工但描述还很粗时，先把它规范化成结构化 brief（动机/目标/范围/约束），并按 PLUGIN_MAP 扫描对 @repo/core、插件平台/SDK 的依赖与 mock 策略。
- `feature-plan` — G1 已 SHIPPED、具体插件包解冻后，对某个插件/Widget 能力启动标准特性管线的第一步（feature-plan → feature-review → feature-build → feature-verify → ship）。
- `xai-feature-full-loop` — G1 平台运行时锚点或插件平台/SDK 需要一条龙跑完整 Workflow V2 时使用；尤其当 D3 把某个 Web 改动判为 W3 native-bridge-needed、需要在 desktop-next/desktop-plugin-next 上做真实原生 delta 时。
- `xai-release-log` — 任一可见的插件/Widget 增量完成后，把它登记进发布日志，保持 plugin 产品线进度可追溯。

**开发 workflow**

1. 先分层：若是 G1 平台运行时锚点（multi-window / grid / window-command / Widget Host-SDK），Phase 1 与 Phase 2 common capability code path 已完成，后续先做真实 host smoke；若是具体插件包（clipboard/widgets/pet/meditation），operator 确认解冻前保持 PAUSED，先用 xai-feature-brief 规范化并入队，不开 feature-build。
2. active gate 或解冻后插件包开短分支 codex/plugin/<feature>（基于 desktop-plugin-next；凡触及 desktop-next / dev 需 operator 确认）。第一阶段执行路线见 `docs/planning/execution/desktop-plugin-platform-phase1.md`；每个小步只完成一个系统能力并用 scoped commit 记录 Why / What / Scope / Risk / Docs / Tests。
3. 按对应管线推进：G1 平台运行时走 xai-feature-full-loop；解冻后具体插件包走 feature-plan → feature-review → feature-build（每次一阶段后停下等人工确认）→ feature-verify → ship。
4. 数据落点判定：每个插件实体先在 packages/core-data/src/entities.ts 定 syncScope。device-local（已注册的如 clipboard.item；widgets.widget 为 ADR-0013 D4 示例、尚未注册）留本机、永不入远端 outbox；仅当确需跨设备才声明 account-sync 并交给 sync 线按 D4 九项清单补齐——本模块不自行实现同步。
5. 插件间协作只走 @repo/core/events，业务逻辑全部在 packages/plugin-*，index.ts 为唯一公共出口；依赖前先查 PLUGIN_MAP，只有 Stable/Production（如 organizer）可直依，Planned/In-Dev（含 clipboard/widgets/pet 自身）须 mock。本模块只在 plugin 线推进，绝不分叉进 PROPOSED 的 site/admin 线（二者均未授权开工）。
6. Plugin Center 拆分判定：`桌面插件`入口按钮、Plugin Center window、实例 placement、pin、click-through、permissions 属 app；插件目录、AddToDesktop contract、实例 settings schema 和 `packages/plugin-*` 内容属 plugin。一个 feature 同时触及时，先在 plan 中拆 App delta 与 Plugin delta，不把入口需求写进 Web 工作台。
7. 若改动需要从 Web 侧拉取共享 UI/逻辑，或被判定为原生桥需求，走 D3（xai-web-to-desktop-sync）分类（W0–W4）后再在 desktop-next/desktop-plugin-next 上落地，并产出 Parity Receipt（Verdict: NO_APP_CHANGE | GATE_ONLY | DESKTOP_DELTA_REQUIRED | BLOCKED）。
8. 每个可见增量 ship 后用 xai-release-log 登记，保持 plugin 产品线进度可追溯。

**常用 prompt（可直接复制）**

<details><summary>插件需求规范化（解冻前先入队）</summary>

```text
/xai-feature-brief
动机：为 macOS App 的桌面整理插件平台补一个浮动便签 Widget，用户可在桌面贴便签并随 Grid 一起整理。
目标：在 packages/plugin-widgets 内提供 StickyNote Widget，挂载到 apps/desktop 的插件槽位，支持新建/编辑/拖拽/折叠。
范围：仅 plugin 线（codex/plugin/<feature> → desktop-plugin-next），不改 apps/web、不碰 dev 的原生窗口契约。
约束：这是具体插件包需求，当前 P2 PAUSED，须等 G1/平台运行时 SHIPPED 后才进入 feature-plan；便签数据默认 syncScope: device-local（ADR-0013 D4），不入远端 outbox。
```

</details>

<details><summary>插件特性标准管线（G1 解冻后）</summary>

```text
Start the feature-plan agent.
动机：剪贴板历史插件需要把最近复制项以可整理的卡片形式呈现在桌面 Grid 中。
目标：在 packages/plugin-clipboard 实现 clipboard.item 列表 + 写入桌面 Grid 容器，经 @repo/core/events 与 organizer 协作（禁止插件间直接 import）。
范围：plugin 线，落在 packages/plugin-clipboard 与 apps/desktop 插件槽位；分支 codex/plugin/clipboard-history。
约束：clipboard.item 在 packages/core-data/src/entities.ts 已注册为 syncScope: device-local，永不进同步层（ADR-0013 D4）；依赖 organizer（PLUGIN_MAP=Stable）可直依，其余 Planned/In-Dev 插件（clipboard/widgets 自身仍 Planned）须 mock。
```

</details>

<details><summary>插件平台/SDK 一条龙</summary>

```text
/xai-feature-full-loop
动机：Widget Host 需要一个稳定的插件注册/装载 SDK，让第三方 Widget 通过 manifest.json 声明槽位与生命周期。
目标：在 desktop-plugin-next 上落地 Widget SDK 契约（注册表 + 槽位 API + manifest 校验），index.ts 为唯一公共出口。
范围：plugin 平台线（desktop-plugin-next；进入 desktop-next 需 operator 确认），不改 web 产品线 UI。
约束：若是 G1 平台运行时/SDK 锚点，可作为 active gate 推进；若是第三方或具体插件包 SDK 能力，则随插件包冻结等 G1 SHIPPED 后启动。涉及 Tauri/Rust 原生桥（D3 判 W3）按 D3 走原生 delta 而非合并。
```

</details>

<details><summary>插件平台运行时（多窗口 / grid / window-command）</summary>

```text
/xai-feature-full-loop
动机：桌面插件平台需要把 multi-grid 事件作用域收敛到每个原生 grid 窗口，避免跨窗口事件串扰（原 G1 native foundation 工作）。
目标：基于已 SHIPPED 的 window-command-contract，通过 @repo/core/events 实现按 grid 窗口隔离的事件订阅/广播；落地多窗口引擎 / grid 持久化。
范围：插件平台运行时（codex/plugin/<feature> → desktop-plugin-next）。多窗口引擎 / overlay / grid / window-command 的代码物理在 host（apps/desktop/src-tauri，app 通道执行），但**产品归属是插件平台**，不是 Mac 壳——所以走 plugin 线、不走 codex/desktop/*。
约束：本条是 **G1 平台运行时锚点 = active gate**（P1 App-lane 执行、plugin-platform 产品），**不在 P2 冻结内**——P2 冻结的是插件**包**（clipboard/widgets/pet/meditation），它们等 G1/平台运行时 SHIPPED 后才解冻；遵守 SYSTEM_ARCHITECTURE 多窗口红线；插件包只消费窗口命令、不实现原生层；原生拖拽用 @dnd-kit/core。
```

</details>

**进入下一模块（触发条件 · branch · skill）**

| → 目标模块 | 触发条件 | branch | skill | 说明 |
|---|---|---|---|---|
| 账号云同步层（`sync`） | 某插件实体确实需要跨设备（用户在 Web 与 App 间共享同一份数据），须从默认 device-local 升为 syncScope: account-sync | codex/sync/<feature> | `feature-plan` | 切到 sync 线按 ADR-0013 D4 九项清单补齐 entityType（registered in packages/core-data/src/entities.ts）/schemaVersion/本地存储映射/push 格式/pull 应用规则/冲突策略（非静默 LWW）/Web IndexedDB 测试/App SQLite 测试/双设备 smoke；本模块只声明 account-sync，不自实现同步管线。sync 线 P2 PAUSED until G1 SHIPPED。 |
| Mac 桌面版 App（`app`） | 插件需求其实只落在 Mac 壳 / Web 容器 / native chrome（如控制面板入口、菜单栏/托盘/通知/更新/账号壳能力），而非桌面插件平台运行时 | codex/desktop/<feature> | `feature-plan` | Mac 壳归 app；涉及 dev 的操作需操作者显式确认。若需求意图是多窗口/overlay/Widget/实例模型，即使命令物理在 host，也应切回 plugin。 |
| Mac 桌面版 App（`app`） | 新增 Mac App 控制面板的 `桌面插件`入口按钮或打开 Plugin Center 所需的 host 容器命令 | codex/desktop/<feature> | `feature-plan` | 入口按钮和 host 容器命令是 App delta；Plugin Center 目录、AddToDesktop contract、实例 settings schema、placement/pin/click-through 和具体插件渲染归 plugin。MVP 入口形态已拍板为“控制面板一级入口 + 轻量 Plugin Center + 设置页全局偏好”。 |
| Mac 桌面版 App（`app`） | 某 Web 改动经 D3 判定为 W3 native-bridge-needed，需要新增 Tauri/Rust 命令或原生能力来支撑插件平台 | desktop-plugin-next | `xai-feature-full-loop` | W3 是真实新原生工作而非合并：按 ADR-0013 D3 路由到 /xai-feature-full-loop 在 desktop-plugin-next 上做插件平台原生 delta；若需进入 desktop-next，则另经 operator 确认并产出 Parity Receipt（Verdict: DESKTOP_DELTA_REQUIRED）。desktop-plugin-next 已创建。 |

**影响 / 需同步更新的模块**

| 受影响模块 | 何时 | 需要的动作 |
|---|---|---|
| 账号云同步层（`sync`） | 本模块把某插件实体的 syncScope 从 device-local 改为 account-sync（需要跨设备） | 在 packages/core-data/src/entities.ts 注册新的 entityType（^[a-z]+\.[a-z_]+$ dotted slug）并定 schemaVersion，由 sync 线按 D4 九项清单补 push/pull/冲突策略与双设备 smoke；否则该实体永不入远端 outbox。 |
| Mac 桌面版 App（`app`） | 插件平台/Widget 需要新的 host 原生能力（Tauri 命令、NSWindow 行为、点击穿透或 Grid 原生窗口契约变更） | 物理实现可在 app 线（apps/desktop/src-tauri 的 commands/ 与 platform/macos/）新增对应命令与契约，并更新 @repo/core/events 中的窗口命令契约；但产品归属仍记录为 plugin 平台运行时，插件包只消费、不实现原生层。 |
| Mac 桌面版 App（`app`） | Plugin Center 入口从文档进入实现阶段 | 在 apps/desktop 控制面板加入 `桌面插件` 一级入口、打开 Plugin Center 容器，并将设置页限定为全局偏好；不要把管理中心实现成 Web 工作台页面或独立完整产品线。 |
| Web（`web`） | 插件平台的共享能力源自 Web 侧某改动，需经 D3 同步过来（W1/W2/W3） | 由 web 线发起 D3 分类（xai-web-to-desktop-sync），产出 Parity Receipt 后再在 desktop-next/desktop-plugin-next 落地；plugin 模块据此承接原生/运行时 delta。 |
| Mac 桌面版 App（`app`） | 新增/改动插件包后需要让 App 真正装载它 | 在 apps/desktop 的插件注册入口（main.tsx 装载点）补 import 注册，并在 docs/PLUGIN_MAP.md 增/改对应行状态（如把 clipboard/widgets/meditation 从 Planned 推进），保持全局状态机一致。 |

---

### 4. 账号云同步层 （`sync`）

- **状态**：P2 · paused · 基建合同
- **推荐 branch**：sync-v1 roadmap wave
- **关键依赖**：连接 Web / App / Plugin
- **开发目标**：为 Web 与 App 三端建设统一的账号云同步层,让仅 syncScope: account-sync 作用域的实体经加密信封安全收敛到同一账号云(Web IndexedDB ⇄ /sync/push、/sync/pull ⇄ 服务端 encrypted blobs ⇄ App SQLite);device-local 实体绝不入云。

**任务归属信号**

- 实体出现 syncScope: account-sync / device-local 字段,或要在 packages/core-data/src/entities.ts 注册新 entityType(形如 productivity.todo,须匹配 ^[a-z]+\.[a-z_]+$)
- 涉及 /sync/push、/sync/pull、加密信封(envelope)、outbox、commit_seq 游标、nonce lease、AES-256-GCM、HPKE、device_id / encryption_device_id 等同步协议要素
- 需求是 Web IndexedDB ⇄ 服务端 encrypted blobs ⇄ App SQLite/SQLCipher 之间收敛,而非 Web 单端 UI 或 App 原生壳本身
- 出现冲突解决(conflict shadow / 非 silent LWW)、两端两设备同步 smoke、recovery / mnemonic / rekey、设备列表与远程吊销(account.device)
- 改动落在 packages/plugin-account 的 push/pull engine、sync-v1 crypto stack、Supabase RLS / Edge Function,或 docs/workflow/roadmap/sync-v1.md 列出的 #1-#56 feature

**推荐 skill / agent**

- `xai-feature-brief` — 新增或扩展某个 account-sync 实体/能力前,先把想法规范化为结构化 brief,并据 ADR-0013 D4 九项完整性清单(entityType、schemaVersion、本地映射、push/pull 格式、冲突策略、三类测试)做依赖与缺口扫描
- `feature-plan` — brief 就绪后进入标准 feature 流水线的规划阶段,产出落在 codex/sync/<feature> 的实现计划(注意 sync-v1 PAUSED,需在 G1 SHIPPED + 操作者解冻确认后才执行)
- `xai-feature-full-loop` — 一个已 review 的 account-sync feature 要在父会话内端到端推进(plan→review→build→verify→ship)而不嵌套 meta-orchestrator 时
- `xai-release-log` — 任一可见的同步层增量落地后,记录 release log,保持 sync-v1 roadmap 行状态与发布记录一致
- `xai-roadmap-loop` — sync-v1 解冻后需要按波次批量推进 docs/workflow/roadmap/sync-v1.md 中 PENDING 的 #38-#56 feature 到 READY_TO_SHIP 时

**开发 workflow**

1. 确认解冻前提:sync-v1 当前 PAUSED(docs/workflow/roadmap/sync-v1.md,ADR-0010 §D2 sync-v1 stays PAUSED until G1 SHIPPED),仅在 G1 SHIPPED 且操作者确认后才开新工作;否则只做记录/规划,不落实现。
2. 用 xai-feature-brief 把需求规范化,并对照 ADR-0013 D4 九项完整性清单逐项扫描(account-sync 需 1-9 全齐;device-local 只需 1-3 与 7,免 4-6/8-9 且绝不入云)。
3. 进入标准 feature 流水线 feature-plan → feature-review → feature-build → feature-verify → ship,实现落在 codex/sync/<feature> 短分支;严格区分 account-sync 与 device-local,后者绝不入 remote outbox。
4. 验证三类测试:Web IndexedDB 测试、App SQLite/outbox 测试、两设备同步 smoke(设备 A 写→设备 B 收敛),并确认冲突走 conflict shadow 或显式 merge(非 silent LWW)。
5. 落地后用 xai-release-log 记录增量并回写 sync-v1 roadmap 行状态;若该改动影响 Web↔App 共享代码,再按 ADR-0013 D3 用 xai-web-to-desktop-sync 分类(W0-W4)并出 parity receipt 评估跨线分享。

**常用 prompt（可直接复制）**

<details><summary>新增 account-sync 实体(走 D4 九项清单)</summary>

```text
Start the feature-plan agent.
  动机:需要让某业务实体在 Web 与 App 之间通过账号云同步(例如 productivity.pomodoro_session)。
  目标:按 ADR-0013 D4 九项完整性清单交付一个 account-sync feature——定义 entityType(注册到 packages/core-data/src/entities.ts,符合 ^[a-z]+\.[a-z_]+$)、schemaVersion + migration plan、Web IndexedDB↔App SQLite 列映射、push mutation(outbox→/sync/push 信封)、pull apply 规则(/sync/pull PullRecord→本地 upsert/冲突路由)、冲突策略(flag 或显式 merge,禁止 silent LWW),以及 Web IndexedDB 测试、App SQLite/outbox 测试、两设备同步 smoke。
  范围:仅 syncScope: account-sync 实体;不改 sync-v1 crypto 协议本体,只复用 /sync/push、/sync/pull 与现有 envelope。落在 codex/sync/<feature>。
  约束:sync-v1 当前 PAUSED(解冻须等 G1 SHIPPED + 操作者确认);device-local 实体绝不能进入 remote outbox;遵守 docs/contracts/data-repository-v0.md §2/§6 与 ADR-0013 D4。
```

</details>

<details><summary>同步层缺陷诊断(数据未收敛/冲突异常)</summary>

```text
Start the bug-diagnose agent.
  现象:某 account-sync 实体在设备 A 写入后,设备 B 拉取后未收敛(或出现非预期 silent last-write-wins)。
  预期:post-write push 后,设备 B 在 start/focus/network-recover/15-60s 轻量拉取任一触发下收敛;冲突应被 flag 成 conflict shadow 或按实体显式 merge(ADR-0013 D4)。
  实际:设备 B 数据停留在旧版本,或冲突被静默覆盖。
  线索:怀疑 packages/plugin-account push/pull engine 的 commit_seq 游标、outbox 同事务写入、或 /sync/push 冲突影子(conflict shadow)逻辑;核对 docs/contracts/data-repository-v0.md §6 与 ADR-0013 D4。
  约束:停留在 sync 模块边界内,落在 codex/sync/<feature>;不改 Web 单端 UI 与 App 原生壳。
```

</details>

<details><summary>device-local 实体不得入云的回归校验</summary>

```text
Start the feature-plan agent.
  动机:确保新增/改动的实体严格遵守 syncScope 过滤,device-local(如 clipboard.item、widgets.widget)绝不进入 remote outbox。
  目标:补齐 syncScope enforcement 测试与 entity 表约束,验证 device-local 在类型层被收窄为字面量 "device-local" 且不入 /sync/push。
  范围:packages/core-data 的 entities.ts + repository contract 测试;仅 sync 作用域,不触及具体业务实体行为。落在 codex/sync/<feature>。
  约束:遵守 docs/contracts/data-repository-v0.md §2.1/§6 与 ADR-0013 D4 scope filter;不解冻其它 PAUSED 工作。
```

</details>

**进入下一模块（触发条件 · branch · skill）**

| → 目标模块 | 触发条件 | branch | skill | 说明 |
|---|---|---|---|---|
| Web（`web`） | 同步层改动需要在 Web 端落地承载它的 UI/IndexedDB 适配(如 Console 同步状态页、冲突恢复 UI、设备列表) | codex/web/<feature> | `feature-plan` | Web 是端到端验收的写入/读取入口;sync 协议稳定后,Web 侧 UI 与 IndexedDB 映射在 web 线独立推进,二者通过 account-sync 契约对接而非互相直连(D4:Web 与 App 不互相同步,都汇入同一账号云)。 |
| Mac 桌面版 App（`app`） | 同步层需要新的 Tauri/Rust 原生增量(crypto_* IPC、SQLCipher 打开路径、Keychain ACL)或 App SQLite 侧落地 | codex/desktop/<feature> | `xai-web-to-desktop-sync` | 属 D3 W3 native-bridge-needed:web→app 唯一通道是 D3 gate(由 xai-web-to-desktop-sync 分类并出 parity receipt);原生 delta 是真正新工作而非合并,经闸门后由 xai-feature-full-loop(/xai-feature-full-loop)在 desktop-next（defined-not-yet-created）或 desktop-plugin-next（已创建）承接；触及 dev 需显式确认。 |
| Admin Dashboard（`admin`） | 需要在控制台/管理面观测同步用量、审计日志(sync_audit_log)、配额限流或设备权限/吊销治理 | codex/admin/<feature> | `feature-plan` | Admin Dashboard 为 PROPOSED(六线最低,无 package、无 roadmap,原型在 docs/prototypes/admin-dashboard/index.html);在 owner 将 ADR-0013 状态由 Proposed flip 为 Accepted 前无 active-work 授权,只先在原型/契约层登记。同步层只提供数据与事件,治理/可视化在 admin 线承接。 |

**影响 / 需同步更新的模块**

| 受影响模块 | 何时 | 需要的动作 |
|---|---|---|
| Mac 桌面版 App（`app`） | 新增/修改 account-sync 实体的 schemaVersion 或字段,改变服务端 encrypted blob 或 outbox 信封格式 | 在 apps/desktop 的 App SQLite/SQLCipher 侧同步列映射与 migration,并补 App SQLite/outbox 测试,确保 App 仍能解析新信封;经 ADR-0013 D3(W2/W3)分类评估原生影响,W3 原生 delta 走 /xai-feature-full-loop。 |
| Web（`web`） | 新增/修改 account-sync 实体或冲突策略 | 在 apps/web 的 IndexedDB 本地映射与 pull apply 规则同步更新,补 Web IndexedDB 测试,并在涉及冲突时提供 conflict shadow 恢复 UI 入口。 |
| Admin Dashboard（`admin`） | 新增 sync 审计/配额/设备治理相关字段或事件(如 sync_audit_log、quota、device list) | 更新 Admin Control Plane 的用量/审计/权限视图数据契约,使其能读取并展示新增的同步治理数据(admin 当前为 PROPOSED 无 active-work 授权,先在原型/契约层登记)。 |

---

### 5. 官方网页 （`site`）

- **状态**：proposed · 拟定
- **推荐 branch**：codex/site/<feature>
- **关键依赖**：承接 Web/App/Sync 发布信息
- **开发目标**：官方网页线(PROPOSED / owner-deferred)只承接 App 的下载、自动更新与发布说明分发,复用 Cloudflare 部署设施(ADR-0008)并绑定 release/desktop/<version> + tag vX.Y.Z(ADR-0013 D2),绝不托管任何产品内部功能。

**任务归属信号**

- 关键词命中:官方网页 / 官网 / marketing 站 / 下载页 / download page / 自动更新 / auto-update / updater / appcast / 发布说明 / release notes / 落地页 landing
- 分发与发布产物:.dmg / installer / 安装包 / updater metadata / latest.json / appcast.xml,且来源绑定 release/desktop/<version> 与 tag vX.Y.Z(ADR-0013 D2,该分支为 defined-not-yet-created)
- 部署设施复用:apps/web/wrangler.toml、apps/web/deploy/*、Cloudflare Pages、apps/web/public/_headers / CSP 仅为站点本身(ADR-0008),而非 apps/web/ 的 24 个产品模块
- 短分支前缀 codex/site/<feature>(ADR-0013 D2,官网/下载/updater/发布站工作),当前为 PROPOSED / owner-deferred,尚未授权动工
- 边界排除信号:凡涉及产品功能本体(AI 配置、看板、日历、IndexedDB 数据、syncScope、Tauri 运行时、桌面插件)一律不属于 site —— site 只承接 release info,不托管产品内部

**推荐 skill / agent**

- `xai-feature-brief` — operator 显式确认解冻 site 线后,把「下载页 / 自动更新源 / 发布说明站」这类模糊想法规范化成结构化 brief,标注它无既有 package、需新建 codex/site/<feature> 分支
- `feature-plan` — brief 就绪后进入标准 feature 流水线(feature-plan -> feature-review -> feature-build -> feature-verify -> ship)的第一步,规划站点结构、与 release/desktop/<version> 产物的绑定方式,以及复用 apps/web/wrangler.toml + apps/web/deploy/* 的边界
- `xai-release-log` — site 每产出一个可见增量(落地页上线、下载链接接通、updater 源切换)后,按惯例写 docs/workflow/project/release-log.md
- `xai-web-deploy-preflight` — site 解冻后复用 Cloudflare Pages / `_headers` / wrangler 部署链路时,用它证明 preview/production 发布前置条件;纯 preflight 不代表 site 线已授权开工。
- `xai-web-to-desktop-sync` — 仅当某站点改动其实触及 App 的产物/更新契约本身(updater feed 格式、签名产物路径、版本号)且需在 web↔desktop-next 间共享时,才按 ADR-0013 D3 的 W0–W4 分类并产出 parity receipt;W4 再交给 xai-desktop-release-gate;纯站点内/纯 web 部署改动不走此技能

**开发 workflow**

1. 前置闸门:site 为 PROPOSED / owner-deferred,无既有 package(ADR-0013 §S7 #2)。除非 operator 显式确认解冻,否则不开 codex/site/<feature>、不动工——先停在「待授权」态。
2. 解冻后用 xai-feature-brief 把下载页 / 自动更新源 / 发布说明站规范化成 brief,明确边界:只承接 release info,不托管产品内部。
3. 走标准 feature 流水线 feature-plan -> feature-review -> feature-build -> feature-verify -> ship,全程在 codex/site/<feature>,复用 apps/web/wrangler.toml + apps/web/deploy/* + Cloudflare Pages(ADR-0008),站点 _headers/CSP 与 apps/web/public/_headers 隔离;部署前跑 xai-web-deploy-preflight。
4. 产物来源严格绑定 release/desktop/<version> 冻结产物与 tag vX.Y.Z(ADR-0013 D2,该分支 defined-not-yet-created,创建需 operator 确认)——下载链接、updater feed、release notes 三者同源同版本。
5. 每个可见增量上线后用 xai-release-log 记入 docs/workflow/project/release-log.md。
6. 若某改动触及 App 的产物/更新契约本身(updater feed 格式、签名产物路径、版本号)需在 web↔desktop-next 间共享,才用 xai-web-to-desktop-sync 按 W0–W4 分类并产出 parity receipt,W4 再交给 xai-desktop-release-gate;纯站点 _headers/CSP/部署配置改动不走 D3,按 ADR-0008 扩展协议 + xai-web-deploy-preflight 处理。

**常用 prompt（可直接复制）**

<details><summary>需求规范化(解冻后第一步)</summary>

```text
/xai-feature-brief
动机:App 即将进入 release/desktop/<version> 冻结发布,需要一个官方网页承接 macOS 客户端的下载与自动更新分发,对外提供可分享的下载入口。
目标:在 codex/site/<feature> 上规划官方网页线 v1——下载页 + auto-update 源 + 发布说明,产物来源绑定 release/desktop/<version> 与 tag vX.Y.Z(ADR-0013 D2,该分支 defined-not-yet-created),复用 apps/web/wrangler.toml + apps/web/deploy/* + Cloudflare Pages(ADR-0008)。
范围:仅官方网页本体(marketing 落地页 / 下载页 / updater feed / release notes 渲染);不托管任何产品内部功能(无 AI 配置、看板、日历、IndexedDB、Tauri 运行时)。
约束:site 当前为 PROPOSED / owner-deferred,无既有 package——需 operator 显式确认解冻后方可动工;站点 CSP/_headers 仅覆盖站点自身,不得回归 apps/web/public/_headers 既有 24 模块契约(按 ADR-0008 扩展协议处理)。
```

</details>

<details><summary>进入 feature-plan</summary>

```text
Start the feature-plan agent for site.
动机:官方网页线需要把 App 的发布产物(.dmg、updater metadata、release notes)暴露成稳定的对外站点。
目标:规划下载页结构、auto-update feed 格式,以及与 release/desktop/<version> -> tag vX.Y.Z 的产物绑定契约,复用 apps/web/wrangler.toml 与 apps/web/deploy/* 的 Cloudflare Pages 部署路径(ADR-0008)。
范围:仅 codex/site/<feature> 内的站点资产与部署配置;不改动 apps/web/ 产品模块,不引入产品数据契约或 syncScope。
约束:复用而非新建部署设施(ADR-0008);站点 _headers/CSP 与 apps/web/public/_headers 互不污染;owner 未显式解冻前停在计划态。
```

</details>

<details><summary>产物绑定遇到 App 契约问题时</summary>

```text
Start the bug-diagnose agent for site.
现象:官方网页下载页 / 自动更新源拿到的产物与 release/desktop/<version> 实际产出的 .dmg / updater metadata 不一致或版本错位。
预期:站点严格从 release/desktop/<version> 冻结产物 + tag vX.Y.Z 取数,下载链接与 updater feed 始终指向当前已发布版本(ADR-0013 D2)。
实际:下载到旧版本 / updater feed 指向不存在的产物 / 版本号与 tag 不匹配。
线索:怀疑产物来源未绑定到 release 分支冻结产物,或站点构建复用 apps/web/deploy/* 时混入了 web 产品构建配置——若问题落在 App 产物格式/签名/updater 本身,需用 xai-web-to-desktop-sync 按 D3 确认是否属跨线契约改动。
```

</details>

**进入下一模块（触发条件 · branch · skill）**

| → 目标模块 | 触发条件 | branch | skill | 说明 |
|---|---|---|---|---|
| Mac 桌面版 App（`app`） | 站点要承接的 .dmg / updater metadata / 签名产物本身需要 App 端在 release/desktop/<version> 冻结流程中产出或调整其格式(W3/W4 release-risk) | web → desktop-next → dev → release/desktop/<version>(desktop-next / dev / release/desktop/<version> 均为 ADR-0013 D2 已定义、尚未创建;触及 dev 与创建任一分支需 operator 显式确认) | `xai-web-to-desktop-sync` → `xai-desktop-release-gate` | site 只消费 App 的发布产物,不生产;产物格式/签名/updater feed 的改动属 App 线 release 工作,经 D3 W4 分类后交给 xai-desktop-release-gate(含 manual macOS smoke、签名/公证/DMG/updater 证据)才可进入 dev 与 release/desktop/<version>,site 再绑定其 tag vX.Y.Z 产物。 |
| Web（`web`） | 站点改动其实落在共享部署设施(apps/web/wrangler.toml、apps/web/deploy/*、Cloudflare 配置)或共享 apps/web/public/_headers / CSP 上,可能影响 apps/web/ 既有 24 模块的部署与安全头 | codex/site/<feature> → web(Web release: Cloudflare Pages,ADR-0008) | `feature-plan` | 这是同一条 Web 线内的 ADR-0008 部署/CSP 改动,不跨产品线到 App,因此不走 D3 闸门(xai-web-to-desktop-sync)。按 ADR-0008 §S3/§S6 扩展协议,经 feature-plan -> feature-review 评审 _headers 内容、§S6 片段与 apps/web/src/__tests__/csp.test.ts 守卫测试,确保不回归 web 产品线既有部署/CSP 契约。 |

**影响 / 需同步更新的模块**

| 受影响模块 | 何时 | 需要的动作 |
|---|---|---|
| Mac 桌面版 App（`app`） | site 要新增/改动某个下载产物或自动更新字段(如 updater feed 增加新平台、签名产物路径变更) | App 线须在 release/desktop/<version> 冻结流程中按 ADR-0013 D2 产出对应 .dmg / updater metadata,经 xai-web-to-desktop-sync 分类为 W4 后再跑 xai-desktop-release-gate(含 manual macOS smoke、签名/公证/DMG/updater 证据),site 才能绑定该 tag 产物。 |
| Web（`web`） | site 复用并修改了共享部署设施(apps/web/wrangler.toml、apps/web/deploy/*)或 apps/web/public/_headers 的 CSP/安全头 | 按 ADR-0008 §S3/§S6 扩展协议(经 feature-plan -> feature-review,不走 D3)同步更新 _headers 内容、§S6 片段与 apps/web/src/__tests__/csp.test.ts 守卫测试,并确认 apps/web/ 既有 24 模块的部署与 CSP 契约未回归。 |

---

### 6. Admin Dashboard （`admin`）

- **状态**：proposed · 控制面候选
- **推荐 branch**：codex/admin/<feature>
- **关键依赖**：依赖账号、权限、计量和审计合同
- **开发目标**：把 docs/prototypes/admin-dashboard/ 单文件管理中台原型,在 operator 确认优先级与 package/deploy 目标后,落地为与用户端隔离的 Admin 控制面(AI 配置、用量、权限、审计、运营),覆盖 AI 配置、用量、权限、审计与运营。

**任务归属信号**

- 路径命中:docs/prototypes/admin-dashboard/index.html、INTEGRATION_PLAN.md,或拟建的 apps/admin/、/admin 独立构建目标、codex/admin/<feature> 分支
- 关键词命中:管理中台 / 控制面 / Control Plane / 运营后台 / 后台管理,以及总览看板、运营队列、用户管理、组织/空间、功能管理、订阅计费、审计日志
- AI 治理类:Provider 配置、模型×套餐权限矩阵、套餐分层路由、AI 用量配额、成本上限、provider secret handle(服务端加密密钥句柄,浏览器只拿状态不拿密钥)
- 权限与审计类:RBAC 权限矩阵、角色与权限、append-only 审计 hash 链、admin claim / 管理员路由守卫、service-role API + RLS、type-to-confirm 高危操作
- 多租户运营类:席位 used/cap、overage/dunning 催款、转移所有权、功能灰度 rollout、配额步进、SSO/2FA/IP 白名单/会话超时等系统设置
- 明确区别信号:'后台/中台/给管理员/运营用'(归 admin),而非面向终端用户的 apps/web 模块栏功能,也不是 site 官网下载页

**推荐 skill / agent**

- `xai-feature-brief` — 把某个 admin 页面/能力(如 admin shell、RBAC 契约、Provider 配置)的散乱想法规范化为结构化 brief,做依赖扫描与 mock 策略后再进 feature-plan;尤其当 owner 刚确认要不要启动 admin 线时。
- `xai-feature-full-loop` — operator 确认 admin 线优先级与 package/deploy 目标后,按单个 feature-sized 切片(第一个切片=xai-admin-dashboard-shell)端到端跑 plan→review→build→verify→ship。
- `xai-roadmap-loop` — 已确认要批量推进 docs/workflow/roadmap/xai-admin-dashboard-system-integration.md 的 6 行 manifest(shell→契约/RBAC→users/orgs/billing→AI/provider→audit/ops→deploy)时,init 解析后逐波 dispatch。
- `xai-release-log` — 任一 admin 可见增量(隔离 shell、路由守卫、某页接通 typed adapter、审计链落地)完成后,记录 release-log。
- `bug-diagnose` — admin 原型或已落地 admin 面出现缺陷(如路由守卫漏放非管理员、type-to-confirm 失效、审计未追加、密钥泄漏到浏览器 bundle)时,作为 bugfix 流水线入口。

**开发 workflow**

1. 前置门:admin 是 ADR-0013 D1 六线中最低的 PROPOSED(仅原型,无 package/active-roadmap),启动前必须 operator 确认 admin 线优先级 + package/deploy 目标;未确认则只停留在 docs/prototypes/admin-dashboard/ 原型阶段,不写生产代码、不授权新工作。
2. 确认启动后,先用 xai-feature-brief 把目标切片规范化(依赖扫描:@repo/web-auth-device-session、plugin-web-ai-chat secret store、audit-log-integrity 等;凡 docs/PLUGIN_MAP.md 中为 In-Dev 的 owner 行先 mock 或裹在 admin 专用契约后)。
3. 单切片走标准 feature 流水线 feature-plan → feature-review → feature-build → feature-verify → ship,或用 xai-feature-full-loop 端到端;实现顺序固定:先 admin shell + 路由守卫,再数据契约/RBAC,再读多写少页面,最后受控 mutation。
4. 批量推进时用 xai-roadmap-loop 解析 docs/workflow/roadmap/xai-admin-dashboard-system-integration.md(6 行 manifest),逐波 dispatch,严守依赖:写操作前 RBAC/契约必须 green,billing mutation 需 webhook-backed Stripe state,provider 只下发加密密钥句柄。
5. 每个可见增量完成后用 xai-release-log 记录;缺陷走 bug-diagnose → bug-fix → bug-verify → ship。
6. 全程在 codex/admin/<feature> 分支;admin 工作天然 W0(web-only,与 App 运行时无关),除非确实改动共享 @repo/* seam 才需 D3 分类(由 xai-web-to-desktop-sync 实施);在 operator 显式激活前,admin roadmap 不得进入 web→desktop-next(defined, not yet created)→dev 的 promotion。

**常用 prompt（可直接复制）**

<details><summary>规范化 admin shell 需求(入口 brief)</summary>

```text
/xai-feature-brief
需求:把 docs/prototypes/admin-dashboard/ 单文件原型落地为与 apps/web 隔离的 Admin 控制面第一切片——独立 admin surface(apps/admin/ 或隔离的 /admin 构建目标)+ 管理员路由守卫 + typed mock adapter 保留现有原型页面。
背景:ADR-0013 D1 标记 admin 为 PROPOSED(六线最低、仅原型),需先做依赖扫描与 mock 策略再决定是否进 feature-plan。
约束:不得抢占 Web/App 资源;浏览器永不接收 service-role 凭据或 provider 密钥;高危操作 type-to-confirm + 审计;分支用 codex/admin/<feature>。
参考:docs/prototypes/admin-dashboard/INTEGRATION_PLAN.md §3-§4、docs/workflow/roadmap/xai-admin-dashboard-system-integration.md 第 1 行。
```

</details>

<details><summary>端到端跑第一个 admin 切片(operator 确认后)</summary>

```text
/xai-feature-full-loop
Requirement: Implement the first Admin Dashboard system integration slice: isolated admin shell, admin-only route guard wired through @repo/web-auth-device-session with admin-claim negative tests, and typed mock adapters that preserve the current prototype pages without any production data access.
Suggested Feature Slug: xai-admin-dashboard-shell
Automation Mode: D-Codex
Verify Cross-vendor: yes
约束:apps/admin/ 或隔离 /admin 构建目标,独立 CSP/env/deploy;浏览器不得拿到 service-role 凭据或 provider 密钥;codex/admin/<feature> 分支;admin 线保持 Proposed,未经 operator 确认不向 dev 推进。
```

</details>

<details><summary>批量推进 admin 接入 roadmap(已确认启动 admin 线)</summary>

```text
/xai-roadmap-loop mode: init
Roadmap Source: docs/workflow/roadmap/xai-admin-dashboard-system-integration.md
Verify Cross-vendor: yes
说明:六行切片按依赖顺序——1 shell → 2 数据契约/RBAC(写操作前必须 green)→ 3 users/orgs/billing(billing 变更先 gate)→ 4 功能/AI/provider 路由(只下发密钥句柄)→ 5 审计/运营队列(每次 mutation append actor/action/target/IP/result)→ 6 部署隔离/可观测/runbook。本 roadmap 在 operator 显式激活 admin 线前不得进入 dev promotion。
```

</details>

**进入下一模块（触发条件 · branch · skill）**

| → 目标模块 | 触发条件 | branch | skill | 说明 |
|---|---|---|---|---|
| Web（`web`） | admin 落地需要复用/改动 apps/web 已有的共享能力(如 @repo/web-auth-device-session 设备会话、plugin-web-ai-chat 的 secret store 概念、settings-rest 的 Stripe stub、audit-log-integrity hash 链),且改动会回流到面向终端用户的 Web 共享代码 | codex/web/<feature>(改完汇入 web) | `xai-feature-brief 然后 feature-plan` | admin 复用的底座 session/secret/billing/audit 多由 web 线 packages/{web-auth-device-session, plugin-web-ai-chat, plugin-web-settings-rest} 拥有;若 admin 需求要扩展这些共享包,改动归 web 线、走 codex/web/<feature>,admin 侧仅消费其稳定接口。 |
| 账号云同步层（`sync`） | admin 的审计/用量/组织读模型需要落到账号云同步的实体或 syncScope 模型(account-sync vs device-local),即 admin 数据要跨 Web IndexedDB ⇄ 账号云 ⇄ App SQLite | codex/sync/<feature> | `xai-feature-brief 然后 feature-plan` | 账号云同步线 P2 PAUSED(G1 SHIPPED 前不启动),且受 ADR-0013 D4 治理:admin 审计为 append-only、与用户 sync audit 隔离;只有 syncScope: account-sync 的实体才同步(device-local 永不同步),须按 D4 在 packages/core-data/src/entities.ts 定义 entityType/schemaVersion/冲突策略等,归 sync 线而非 admin。 |
| Mac 桌面版 App（`app`） | operator 明确要求把 admin 控制面以原生壳/桌面运行时承载(几乎不会发生,admin 默认是浏览器端隔离 surface);若真需 Tauri/Rust 原生桥接才触发 | codex/desktop/<feature>(经 desktop-next,defined, not yet created) | `xai-web-to-desktop-sync(D3 W0–W4 分类)然后 /xai-feature-full-loop` | admin 设计为浏览器端隔离 surface,通常与 App 无关(D3 判为 W0 web-only,record only);仅当出现 W3 native-bridge 需求时,原生增量才作为真实新工作经 desktop-next（defined-not-yet-created）或 desktop-plugin-next（已创建）承接。 |

**影响 / 需同步更新的模块**

| 受影响模块 | 何时 | 需要的动作 |
|---|---|---|
| Web（`web`） | admin 的路由守卫/会话需要 @repo/web-auth-device-session 暴露 admin claim、撤销设备处理,或需要扩展 plugin-web-ai-chat secret store / settings-rest Stripe stub | 在 web 线对应共享包新增 admin-claim/role 契约与负向测试、把 provider 凭据迁到服务端加密密钥句柄;改动归 codex/web/<feature>,admin 侧只消费稳定接口,避免在 apps/admin 复制底座逻辑。 |
| 账号云同步层（`sync`） | admin 引入需要跨设备/跨端持久化的实体(审计 ledger、用量 ledger、组织/席位读模型)并标记为 account-sync | 按 ADR-0013 D4 在 packages/core-data/src/entities.ts 注册 entityType + schemaVersion,定义 push/pull/冲突策略与三类测试;admin 审计须与用户 sync audit 物理隔离(append-only、复用 audit-log-integrity hash-chain 先例),该契约工作归 sync 线(P2 PAUSED)。 |
| Mac 桌面版 App（`app`） | admin 共享了某段会进入 App 运行时的 @repo/core 或共享 UI seam(罕见;admin 默认与 App 无关) | 运行 xai-web-to-desktop-sync 做 W0–W4 分类并产出 parity receipt;默认判为 W0(NO_APP_CHANGE,record only),仅当确有共享改动才升级到 W1+ 并补 App 侧门禁(desktop-next defined, not yet created)。 |
| 官方网页（`site`） | admin 线需要独立部署目标(apps/admin/ 或隔离 /admin),复用 Cloudflare 部署基建做 CSP/env/deploy 隔离 | 与官网线(site,PROPOSED)协调复用 apps/web/deploy/*、wrangler.toml 的部署/CSP 约定,为 admin 配置独立路由守卫、env 与 deploy controls,确保不与用户端 apps/web 或官网下载页共用凭据与构建目标。 |

---

## 维护

- 本文与 `dashboard-state.json` 的 `product_lines` Product Module Registry 同源；改模块定义时必须同步 `labels`、`visual`、`overview`、`tracking`、`features`、`goal`、`routing`、`skills`、`prompts`、`workflow`、`transitions`、`impacts`，避免总览和产品结构图重新分叉。
- 路由规则的跨平台同步：本文 ↔ [`CLAUDE.md`](../CLAUDE.md) §Product module map ↔ [`AGENTS.md`](../AGENTS.md) §3 ↔ [`.cursor/rules/product-module-routing.mdc`](../.cursor/rules/product-module-routing.mdc)。
- 边界 / 分支 / 闸门的事实变更以 [ADR-0013](adr/0013-branch-sync-governance.md) 为准；本文只做导航编排，不改治理结论。
- **跨模块同步扇出**（完成一个模块后,同步/适配/检查下游模块）以 [ADR-0014](adr/0014-cross-module-sync-orchestration.md) + 机读 [`sync-registry.json`](workflow/project/sync-registry.json) 为准。入口 = `xai-sync-fanout-dispatch`（读 registry 语义规则派发,触发语:「Web 版本功能已完成，执行后续同步 workflow」）；边动作复用 `xai-web-to-desktop-sync`（D3）/ `xai-web-deploy-preflight`（Web deploy gate）/ `xai-desktop-release-gate`（Desktop W4 gate）/ `xai-account-sync-scope-check`（D4,receipt-only）/ `xai-release-log`+`xai-dev-dashboard-sync`（收口）/ `xai-feature-brief`（site/admin/plugin 冻结线草案）。冻结线只产 receipt/草案,不落源码。
