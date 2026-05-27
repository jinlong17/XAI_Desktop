# XAI Desktop Web 完整度审计与 P1 重定义

Date: 2026-05-26  
Repo: `/Users/jinlong/Desktop/jinlong_project/XAI_Desktop`  
Design source: `/Users/jinlong/Desktop/jinlong_project/web design`  
Current branch reality: `dev` = 桌面端开发分支，`web` = Web 开发分支。原任务中的 `desktop/tauri-web-mirror-v1` / `web/post-mirror-optimization` 不再作为新建分支建议，仅作为被现有分支替代的命名。

## Executive Summary

- `web design/` 实际只有 12 个 `module-*.jsx`，不是 24 个；仓库中的 "24/24 SHIPPED" 对应的是 ADR-0007 / roadmap 将原型拆成的 24 个实现交付行。这个口径在 `docs/workflow/roadmap/xai-web-console.md:23` 到 `docs/workflow/roadmap/xai-web-console.md:47` 内成立。
- `apps/web/` 作为 Tauri Mac wrap 的 UI 源整体够格，但还不能直接宣称 Phase 1 Ready：默认 live auth、外部在线能力降级、以及 `apps/desktop/` 当前仍是旧 overlay 产品形态，都会影响 Phase 1 离线 UI launch。
- Part 2 结论：**CONDITIONAL_GO**。Phase 1 可以在 `dev` 桌面分支启动，但需要先关闭 4 个 blocker，不能直接把当前 `apps/desktop/` 当作普通 Mac app shell。
- Part 3 推荐：Phase 1 采用 **A 复用**，即 Tauri 直接复用 `apps/web` / `plugin-web-*`。Phase 3 再评估共享层或本地优先仓储抽象。
- Part 4 patch roadmap 已单独整理到 `docs/audit/2026-05-26-patch-roadmap-source.md`，供后续 roadmap loop 或人工排期使用。

## Part 1 - Web 完整度审计

### 1.1 Source 口径纠正

外部参考原型位于 `/Users/jinlong/Desktop/jinlong_project/web design`。实际文件清单中只有 12 个 `module-*.jsx`：AI、Board、Calendar、Countdown、Dashboard、Habits、Matrix、Meditation、Pomodoro、Settings、Statistics、Tasks。设计文档把 Search 说明为集成在 `app.jsx`，并列出完整文件分布：`/Users/jinlong/Desktop/jinlong_project/web design/DESIGN.md:424` 到 `/Users/jinlong/Desktop/jinlong_project/web design/DESIGN.md:449`。

仓库的 Web 交付口径来自 ADR-0007 的 Vite+TS + `packages/plugin-web-*` 决策：`docs/adr/0007-xai-web-console-build-form.md:83` 到 `docs/adr/0007-xai-web-console-build-form.md:99`，以及 24 行 traceability/roadmap 拆分：`docs/adr/0007-xai-web-console-build-form.md:345` 到 `docs/adr/0007-xai-web-console-build-form.md:369`、`docs/workflow/roadmap/xai-web-console.md:23` 到 `docs/workflow/roadmap/xai-web-console.md:47`。

### 1.2 24 行 parity 审计

| # | Web 交付行 / 模块 | 档位 | 依据 |
|---:|---|---|---|
| 1 | `xai-web-build-form-adr` | PARITY | 参考原型已被正式转为 Vite/TS monorepo 架构，Option C 与决策记录完整：`docs/adr/0007-xai-web-console-build-form.md:83`、`docs/adr/0007-xai-web-console-build-form.md:122`。roadmap 标为 SHIPPED：`docs/workflow/roadmap/xai-web-console.md:23`。 |
| 2 | `xai-web-tokens-and-i18n` | MINOR | token/i18n 包已存在并 port 了设计 i18n：`packages/plugin-web-tokens/src/i18n.ts:1`、`packages/plugin-web-tokens/src/i18n.ts:568`、`packages/plugin-web-tokens/src/i18n.ts:631`。但部分模块仍保留本地 STR 表，未做到严格全局集中：`packages/xai-web-board-workspaces/docs/design.md:47`、`packages/xai-web-board-views/docs/dev_log.md:197`。 |
| 3 | `xai-web-persistence-contract` | MINOR | storage registry + `usePref` 覆盖 web prefs：`packages/plugin-web-storage/src/index.ts:1`、`packages/plugin-web-storage/src/internal/registry.ts:135`、`packages/plugin-web-storage/src/internal/usePref.ts:98`。但 durable entity 的 local-first 分层仍是 Phase 3 议题：`packages/xai-web-build-form-adr/docs/design.md:246`。 |
| 4 | `xai-web-typed-event-bus` | PARITY | roadmap 已交付事件契约行：`docs/workflow/roadmap/xai-web-console.md:26`。该层作为 shell/module 通信基础使用，未发现缺口影响 Phase 1 wrap。 |
| 5 | `xai-web-shell-core` | PARITY | shell 注册明确说明 12 个 shell-visible 模块均为真实实现、无 placeholder：`apps/web/src/routes/modules/shellRegistrations.tsx:1` 到 `apps/web/src/routes/modules/shellRegistrations.tsx:17`。App 挂载 provider/shell/pet/palette：`apps/web/src/App.tsx:119` 到 `apps/web/src/App.tsx:151`。 |
| 6 | Tasks | PARITY | 设计要求见 `/Users/jinlong/Desktop/jinlong_project/web design/DESIGN.md:99` 到 `/Users/jinlong/Desktop/jinlong_project/web design/DESIGN.md:105`；roadmap SHIPPED：`docs/workflow/roadmap/xai-web-console.md:28`。 |
| 7 | Board core | PARITY | 设计 Board 源见 `/Users/jinlong/Desktop/jinlong_project/web design/DESIGN.md:107` 到 `/Users/jinlong/Desktop/jinlong_project/web design/DESIGN.md:135`。seed 数据已补 Map location：`packages/plugin-web-board-core/src/internal/seed/board-data.ts:61`、`packages/plugin-web-board-core/src/internal/seed/board-data.ts:94`、`packages/plugin-web-board-core/src/internal/seed/board-data.ts:126`。 |
| 8 | Board views | MINOR | Table/List/Map/Files 等视图口径来自 `/Users/jinlong/Desktop/jinlong_project/web design/DESIGN.md:119` 到 `/Users/jinlong/Desktop/jinlong_project/web design/DESIGN.md:127`。Map 使用 OSM tiles：`packages/plugin-web-board-views/src/MapView.tsx:1`、`packages/plugin-web-board-views/src/MapView.tsx:30`，离线只会影响地图瓦片；gap re-smoke 仍记录 stale-origin caveat：`docs/reviews/_gap-closure-deferred/20260526-chrome-cycle3-after-layer-fixes.md:40`。 |
| 9 | Board workspaces | PARITY | 工作区/板配置与 route registration 已接入：`apps/web/src/routes/modules/shellRegistrations.tsx:65`。设计源为 `/Users/jinlong/Desktop/jinlong_project/web design/DESIGN.md:107` 到 `/Users/jinlong/Desktop/jinlong_project/web design/DESIGN.md:135`。 |
| 10 | Dashboard grid | PARITY | 设计源为 `/Users/jinlong/Desktop/jinlong_project/web design/DESIGN.md:136` 到 `/Users/jinlong/Desktop/jinlong_project/web design/DESIGN.md:148`；PLUGIN_MAP 记录 Web 模块映射：`docs/PLUGIN_MAP.md:123`。 |
| 11 | Dashboard widgets | PARITY | Dashboard widget 映射同样记录在 `docs/PLUGIN_MAP.md:124`，roadmap SHIPPED：`docs/workflow/roadmap/xai-web-console.md:33`。 |
| 12 | Calendar | PARITY | 设计源为 `/Users/jinlong/Desktop/jinlong_project/web design/DESIGN.md:150` 到 `/Users/jinlong/Desktop/jinlong_project/web design/DESIGN.md:155`；gap closure 中 week/day parity 行已 SHIPPED：`docs/workflow/roadmap/xai-web-console-gap-closure.md:27`。 |
| 13 | Eisenhower Matrix | PARITY | 设计源为 `/Users/jinlong/Desktop/jinlong_project/web design/DESIGN.md:156` 到 `/Users/jinlong/Desktop/jinlong_project/web design/DESIGN.md:160`；roadmap SHIPPED：`docs/workflow/roadmap/xai-web-console.md:35`。 |
| 14 | Pomodoro | PARITY | 设计源为 `/Users/jinlong/Desktop/jinlong_project/web design/DESIGN.md:161` 到 `/Users/jinlong/Desktop/jinlong_project/web design/DESIGN.md:164`；gap closure 的 timer controls 行 SHIPPED：`docs/workflow/roadmap/xai-web-console-gap-closure.md:24`。 |
| 15 | Habits | PARITY | 设计源为 `/Users/jinlong/Desktop/jinlong_project/web design/DESIGN.md:166` 到 `/Users/jinlong/Desktop/jinlong_project/web design/DESIGN.md:169`；roadmap SHIPPED：`docs/workflow/roadmap/xai-web-console.md:37`。 |
| 16 | Meditation | MINOR | 设计源包含 breathe/sounds/ambient categories：`/Users/jinlong/Desktop/jinlong_project/web design/DESIGN.md:171` 到 `/Users/jinlong/Desktop/jinlong_project/web design/DESIGN.md:176`。Web UI 已交付，但无 audio playback 被记录为 limitation：`docs/PLUGIN_MAP.md:118`。 |
| 17 | Countdown | PARITY | 设计源为 `/Users/jinlong/Desktop/jinlong_project/web design/DESIGN.md:178` 到 `/Users/jinlong/Desktop/jinlong_project/web design/DESIGN.md:181`；roadmap SHIPPED：`docs/workflow/roadmap/xai-web-console.md:39`。 |
| 18 | AI chat | MINOR | 设计原型调用 `window.claude.complete(text)`：`/Users/jinlong/Desktop/jinlong_project/web design/module-ai.jsx:76`，Web 版有 demo fallback：`packages/plugin-web-ai-chat/src/internal/demoReply.ts:8`。但 live 模式会访问外部 LLM endpoint：`packages/plugin-web-ai-chat/src/internal/claudeStreamAdapter.ts:48`、`packages/plugin-web-ai-chat/src/internal/llmProvider.ts:100`。 |
| 19 | Desktop Pet | PARITY | 设计源为 `/Users/jinlong/Desktop/jinlong_project/web design/DESIGN.md:211` 到 `/Users/jinlong/Desktop/jinlong_project/web design/DESIGN.md:218`；Web 迁移映射记录在 `docs/PLUGIN_MAP.md:119`。注意旧桌面透明 pet/overlay 不属于新 P1。 |
| 20 | Statistics | PARITY | 设计源为 `/Users/jinlong/Desktop/jinlong_project/web design/DESIGN.md:183` 到 `/Users/jinlong/Desktop/jinlong_project/web design/DESIGN.md:192`；roadmap SHIPPED：`docs/workflow/roadmap/xai-web-console.md:42`。 |
| 21 | Settings shell | PARITY | settings composed route/deep link 注册已在生产装配层实现：`apps/web/src/routes/modules/composedSettingsRegistration.tsx:27` 到 `apps/web/src/routes/modules/composedSettingsRegistration.tsx:84`。Chrome C3 re-smoke PASS：`docs/reviews/_gap-closure-deferred/20260526-chrome-cycle3-after-layer-fixes.md:21`。 |
| 22 | Settings appearance | PARITY | 设计源为 `/Users/jinlong/Desktop/jinlong_project/web design/DESIGN.md:194` 到 `/Users/jinlong/Desktop/jinlong_project/web design/DESIGN.md:209`；roadmap SHIPPED：`docs/workflow/roadmap/xai-web-console.md:45`。 |
| 23 | Settings features panel | PARITY | feature toggles 在 PLUGIN_MAP 中作为 Web module row 记录：`docs/PLUGIN_MAP.md:129`；App 按 feature prefs 过滤模块：`apps/web/src/App.tsx:110` 到 `apps/web/src/App.tsx:117`。 |
| 24 | Settings rest | MINOR | 外部集成/OAuth/Stripe/账号动作都有 UI 与 stub/redirect，但不是离线能力：OAuth callback 明确无 token exchange：`packages/plugin-web-settings-rest/src/CallbackPage.tsx:13`；provider URLs 在 `packages/plugin-web-settings-rest/src/internal/integrationProviders.ts:37`；Stripe redirect 在 `packages/plugin-web-settings-rest/src/internal/premiumUpgradeButton.tsx:41`。 |

### 1.3 插件注册点与 shell slot

- `apps/web/src/routes/modules/shellRegistrations.tsx:1` 到 `apps/web/src/routes/modules/shellRegistrations.tsx:17` 明确说明当前 12 个 shell-visible 模块都是实际实现，且无 placeholder。
- `apps/web/src/routes/modules/shellRegistrations.tsx:57` 到 `apps/web/src/routes/modules/shellRegistrations.tsx:81` 汇总所有 module registration。`apps/web/src/routes/modules/shellRegistrations.tsx:112` 到 `apps/web/src/routes/modules/shellRegistrations.tsx:115` 只追加 legacy `/app/todos` shim。
- `apps/web/src/routes/router.tsx:39` 到 `apps/web/src/routes/router.tsx:75` 让 `/app/:moduleId/*` 与 callback route 进入同一 App shell。
- `packages/xai-web-shell/src/registry.tsx:28` 到 `packages/xai-web-shell/src/registry.tsx:46` 提供 registry provider，`packages/xai-web-shell/src/registry.tsx:71` 到 `packages/xai-web-shell/src/registry.tsx:96` 按 slot/module 排序输出。

结论：注册点与 shell slot 对新 P1 Phase 1 够用。缺口不是模块没挂载，而是桌面 host 与离线/外部能力策略。

### 1.4 i18n key 对齐

- `packages/plugin-web-tokens/src/i18n.ts:1` 到 `packages/plugin-web-tokens/src/i18n.ts:10` 记录其来源是 Artifact i18n port。
- `packages/plugin-web-tokens/src/i18n.ts:568` 到 `packages/plugin-web-tokens/src/i18n.ts:604` 做了 zh 结构 parity 校验辅助。
- `packages/plugin-web-tokens/src/i18n.ts:631` 到 `packages/plugin-web-tokens/src/i18n.ts:685` 暴露 `useI18n`。
- i18n 单测覆盖结构与 key：`packages/plugin-web-tokens/src/__tests__/i18n.test.ts:24` 到 `packages/plugin-web-tokens/src/__tests__/i18n.test.ts:92`。

结论：基础 key/结构合格；MINOR 风险是部分模块存在本地 STR 表，后续若做严格多语言，需要集中化清理。

### 1.5 gap-closure commits 抽查

抽查提交：`c91f768`、`3ecadc1`、`5d1d3a0`、`debc51a`、`1eda68f`。

| Commit | 验证结论 |
|---|---|
| `c91f768` | 修 settings shell URL splat，但后续证明还需要生产装配层补丁。不能单独作为最终 PASS 证据。 |
| `3ecadc1` | 修 CmdK adapter sideEffects / statement-form imports。后续 Chrome C3 re-smoke 记录 CmdK PASS：`docs/reviews/_gap-closure-deferred/20260526-chrome-cycle3-after-layer-fixes.md:30` 到 `docs/reviews/_gap-closure-deferred/20260526-chrome-cycle3-after-layer-fixes.md:36`。 |
| `5d1d3a0` | 补 board seed map location，但同样需要后续生产装配层修正。Board Map PASS 记录在 `docs/reviews/_gap-closure-deferred/20260526-chrome-cycle3-after-layer-fixes.md:38` 到 `docs/reviews/_gap-closure-deferred/20260526-chrome-cycle3-after-layer-fixes.md:46`。 |
| `debc51a` | 关键提交，修 C3-CHROME-1+3 的 production-mounted layers。Settings deep link PASS 记录在 `docs/reviews/_gap-closure-deferred/20260526-chrome-cycle3-after-layer-fixes.md:21` 到 `docs/reviews/_gap-closure-deferred/20260526-chrome-cycle3-after-layer-fixes.md:28`。 |
| `1eda68f` | 文档化 Chrome cycle-3 re-smoke，summary 表显示 3 项 PASS：`docs/reviews/_gap-closure-deferred/20260526-chrome-cycle3-after-layer-fixes.md:13` 到 `docs/reviews/_gap-closure-deferred/20260526-chrome-cycle3-after-layer-fixes.md:19`。gate 解释在 `docs/reviews/_gap-closure-deferred/20260526-chrome-cycle3-after-layer-fixes.md:52` 到 `docs/reviews/_gap-closure-deferred/20260526-chrome-cycle3-after-layer-fixes.md:60`。 |

结论：`24/24 + 9/9 SHIPPED` 对 roadmap/gap-closure 文档口径基本成立，但它不是“所有浏览器、所有外部 provider、Cloudflare live deploy 都已经真实验收”的意思。

### 1.6 Cloudflare Pages 部署 URL

- `apps/web/wrangler.toml:1` 到 `apps/web/wrangler.toml:3` 配置了 Cloudflare Pages 项目名 `xai-web-console` 与 output `./dist`。
- 预期 URL 写在部署设计文档：`packages/xai-web-deploy-cloudflare/docs/design.md:111` 到 `packages/xai-web-deploy-cloudflare/docs/design.md:116`。
- 实际 live deploy gate 在 dev_log 中仍是 DEFERRED：`packages/xai-web-deploy-cloudflare/docs/dev_log.md:338`；部署流程需要 secrets 和 mock-auth build：`.github/workflows/deploy-web.yml:46` 到 `.github/workflows/deploy-web.yml:61`。

本机执行 curl `https://xai-web-console.pages.dev/` 与 `/app/tasks` 失败，错误为 DNS 无法解析 host，因此没有抓到 index.html 或 module route HTML。该项不阻塞 Tauri 本地包装，但说明“线上 URL 可达”不是当前审计可确认事实。

### 1.7 运行时外部依赖与 Phase 1 离线 UI launch 风险

| 外部依赖 | 证据 | 是否阻塞 Tauri 离线 UI 打开 |
|---|---|---|
| Supabase auth / live device RPC | 默认 auth mode 为 live，除非设置 `VITE_WEB_AUTH_MODE`：`apps/web/src/providers/AppProviders.tsx:64` 到 `apps/web/src/providers/AppProviders.tsx:73`。未配置 client 时 session state 为 unconfigured：`packages/web-auth-device-session/src/session.tsx:64` 到 `packages/web-auth-device-session/src/session.tsx:72`。App route guard 会重定向 login：`packages/web-auth-device-session/src/guards.tsx:23` 到 `packages/web-auth-device-session/src/guards.tsx:40`。 | **阻塞，若不修。** Tauri Phase 1 必须用 mock-authenticated 或 desktop-local session provider，保证 `/app` 离线可打开。 |
| Supabase device RPC / account-delete Edge Function | device RPC fetch 走 `/rest/v1/rpc/device_register` / heartbeat：`packages/web-auth-device-session/src/device-transport.ts:61` 到 `packages/web-auth-device-session/src/device-transport.ts:98`。account-delete 外部 function 见 `apps/web/deploy/README.md:116` 到 `apps/web/deploy/README.md:121` 与 `packages/web-auth-device-session/src/auth-actions.ts:197` 到 `packages/web-auth-device-session/src/auth-actions.ts:208`。 | 不应阻塞 launch，但必须在 desktop/offline mode 下 gated。 |
| AI provider fetch | live stream fetch 在 `packages/plugin-web-ai-chat/src/internal/claudeStreamAdapter.ts:48` 到 `packages/plugin-web-ai-chat/src/internal/claudeStreamAdapter.ts:99`；Anthropic 默认 endpoint 在 `packages/plugin-web-ai-chat/src/internal/llmProvider.ts:100` 到 `packages/plugin-web-ai-chat/src/internal/llmProvider.ts:109`。无 key/demo fallback 见 `packages/plugin-web-ai-chat/src/internal/claudeAdapter.ts:1` 到 `packages/plugin-web-ai-chat/src/internal/claudeAdapter.ts:9`。 | 不阻塞 launch，但离线应显示“联网后可用”或 demo fallback，不应无限 loading。 |
| OSM map tiles | Map view 使用 OSM tile URL：`packages/plugin-web-board-views/src/MapView.tsx:1` 到 `packages/plugin-web-board-views/src/MapView.tsx:18`，tile URL 组装见 `packages/plugin-web-board-views/src/MapView.tsx:30` 到 `packages/plugin-web-board-views/src/MapView.tsx:32`。 | 不阻塞 launch；离线地图瓦片缺失需要降级提示或占位。 |
| OAuth provider redirects | Provider URLs 见 `packages/plugin-web-settings-rest/src/internal/integrationProviders.ts:37` 到 `packages/plugin-web-settings-rest/src/internal/integrationProviders.ts:78`；Connect button 使用 `window.location.assign`：`packages/plugin-web-settings-rest/src/internal/integrationConnectButton.tsx:37` 到 `packages/plugin-web-settings-rest/src/internal/integrationConnectButton.tsx:45`。 | 不阻塞 launch；离线/桌面 mode 应 disabled 或提示。 |
| Stripe payment link | payment link env 与 disabled 状态见 `packages/plugin-web-settings-rest/src/internal/usePremiumConfig.ts:47` 到 `packages/plugin-web-settings-rest/src/internal/usePremiumConfig.ts:57`，redirect button 见 `packages/plugin-web-settings-rest/src/internal/premiumUpgradeButton.tsx:41` 到 `packages/plugin-web-settings-rest/src/internal/premiumUpgradeButton.tsx:53`。 | 不阻塞 launch；只影响付费按钮。 |
| CSP / external allowlist | `_headers` connect-src 包含 Anthropic、OSM、Notion、Google OAuth、Linear：`apps/web/public/_headers:1` 到 `apps/web/public/_headers:7`。CSP 测试覆盖这些 host：`apps/web/src/__tests__/csp.test.ts:31` 到 `apps/web/src/__tests__/csp.test.ts:93`。 | 不阻塞 Tauri bundle，但说明在线能力必须被显式分层。 |
| Service Worker / PWA cache | 注册是可选的：`apps/web/src/service-worker/register.ts:1` 到 `apps/web/src/service-worker/register.ts:13`。当前 `sw.js` 只有 install/activate，无 fetch/cache：`apps/web/public/sw.js:1` 到 `apps/web/public/sw.js:7`。 | 不阻塞 Tauri 静态 bundle launch；阻塞“Web/PWA 自身离线缓存已完成”的说法。 |

## Part 2 - Phase 1 GO / NO-GO 决策

### 2.1 apps/web 是否够格作为 Tauri wrap 源

**够格，但必须带条件启动。** `apps/web/` 的模块完整度和 shell 注册已经足够作为 Mac Phase 1 的 UI 源。真正的 Phase 1 风险集中在：

- `apps/desktop/` 当前不是普通窗口 Web wrap，而是旧 overlay/grid/control 产品形态。
- `apps/web/` 默认 live auth 会在无 Supabase/离线环境下把 `/app` gate 掉。
- 外部在线能力需要 desktop/offline mode 降级。
- 当前 web live deploy 不是审计可达事实，但这不影响本地 Tauri bundle 作为源。

### 2.2 Phase 1 blocker

当前分支已按用户确认拆好：`dev` 做桌面，`web` 做 Web。因此这里的“fork 前必须修”改写为“`dev` 分支启动 Phase 1 首个可验收 milestone 前必须修”。

| Blocker | 原因 | 证据 |
|---|---|---|
| `desktop-tauri-web-dist-normal-window` | 当前 Tauri scaffold 是旧透明 overlay/click-through 多窗口，不是普通 Mac app window。 | `apps/desktop/src-tauri/tauri.conf.json:14` 到 `apps/desktop/src-tauri/tauri.conf.json:32`；`apps/desktop/src/App.tsx:20` 到 `apps/desktop/src/App.tsx:25`；`apps/desktop/src-tauri/src/lib.rs:135` 到 `apps/desktop/src-tauri/src/lib.rs:187`；`apps/desktop/src-tauri/src/platform/macos/window_ext.rs:32` 到 `apps/desktop/src-tauri/src/platform/macos/window_ext.rs:50`。 |
| `desktop-web-auth-offline-mode` | 默认 live auth 可能导致离线/未配置 Supabase 时 `/app` 不能进入。 | `apps/web/src/providers/AppProviders.tsx:64` 到 `apps/web/src/providers/AppProviders.tsx:73`；`packages/web-auth-device-session/src/guards.tsx:23` 到 `packages/web-auth-device-session/src/guards.tsx:40`；Cloudflare CI 已用 mock-authenticated 作为 web 展示方案：`.github/workflows/deploy-web.yml:48` 到 `.github/workflows/deploy-web.yml:51`。 |
| `web-external-runtime-offline-gates` | AI、OSM、OAuth、Stripe、Supabase live RPC 都是在线能力；Phase 1 要保证 UI 离线 launch 并清晰降级。 | AI: `packages/plugin-web-ai-chat/src/internal/claudeStreamAdapter.ts:48`；OSM: `packages/plugin-web-board-views/src/MapView.tsx:30`；OAuth: `packages/plugin-web-settings-rest/src/internal/integrationConnectButton.tsx:37`；Stripe: `packages/plugin-web-settings-rest/src/internal/premiumUpgradeButton.tsx:41`；Supabase RPC: `packages/web-auth-device-session/src/device-transport.ts:61`。 |
| `desktop-phase1-build-packaging-pipeline` | Tauri build 当前指向 `apps/desktop` 自身 dist/dev server，不是 `apps/web` static dist。 | `apps/desktop/src-tauri/tauri.conf.json:6` 到 `apps/desktop/src-tauri/tauri.conf.json:10`；`apps/desktop/package.json:6` 到 `apps/desktop/package.json:18`；`apps/web/package.json:6` 到 `apps/web/package.json:15`。 |

### 2.3 可由 `web` 分支并行处理的 non-blocker

- Cloudflare Pages live URL / DNS / secrets smoke。当前 expected URL 存在，但 live deploy gate deferred：`packages/xai-web-deploy-cloudflare/docs/design.md:111`、`packages/xai-web-deploy-cloudflare/docs/dev_log.md:338`。
- Safari / Firefox / iOS / 外部 provider 手动验收补证；当前 C3 证据集中在 Chrome：`docs/reviews/_gap-closure-deferred/20260526-chrome-cycle3-after-layer-fixes.md:3` 到 `docs/reviews/_gap-closure-deferred/20260526-chrome-cycle3-after-layer-fixes.md:7`。
- CSP/Stripe 文档漂移清理：README 描述 Stripe CSP 需求在 `apps/web/deploy/README.md:93` 到 `apps/web/deploy/README.md:112`，但当前 CSP test 明确 Stripe host 不应出现在 connect-src：`apps/web/src/__tests__/csp.test.ts:95` 到 `apps/web/src/__tests__/csp.test.ts:123`。
- PWA service worker asset cache。当前 `sw.js` 没有 fetch/cache：`apps/web/public/sw.js:1` 到 `apps/web/public/sw.js:7`。
- Board Map stale local data migration/backfill。Chrome re-smoke 已 PASS 但有 stale-origin caveat：`docs/reviews/_gap-closure-deferred/20260526-chrome-cycle3-after-layer-fixes.md:40` 到 `docs/reviews/_gap-closure-deferred/20260526-chrome-cycle3-after-layer-fixes.md:46`。
- 本地 STR 表集中化，属于 i18n 质量项，不阻塞 Phase 1。

### 2.4 apps/desktop 当前 Tauri 脚手架

`docs/workflow/roadmap/xai-g1-native-foundation.md:3` 声明旧 G0.1-G0.5 shipped、G0.6 external blocked；G1 rows 记录如下：`docs/workflow/roadmap/xai-g1-native-foundation.md:21` 到 `docs/workflow/roadmap/xai-g1-native-foundation.md:26`。

实际代码仍是旧产品定义：

- 主窗口 transparent、decorations false、skipTaskbar、hidden title、Overlay titlebar：`apps/desktop/src-tauri/tauri.conf.json:22` 到 `apps/desktop/src-tauri/tauri.conf.json:31`。
- React App 设置 pointer-events none 并挂旧 Organizer/Grid：`apps/desktop/src/App.tsx:1` 到 `apps/desktop/src/App.tsx:25`。
- Rust setup 主动配置 main overlay 并创建 control window：`apps/desktop/src-tauri/src/lib.rs:135` 到 `apps/desktop/src-tauri/src/lib.rs:187`。
- macOS extension 让窗口加入 all spaces、transparent、ignore cursor events：`apps/desktop/src-tauri/src/platform/macos/window_ext.rs:19` 到 `apps/desktop/src-tauri/src/platform/macos/window_ext.rs:50`。
- grid window 创建仍是 transparent/decorations false/skip taskbar：`apps/desktop/src-tauri/src/commands/window.rs:199` 到 `apps/desktop/src-tauri/src/commands/window.rs:245`。

需要改成普通窗口 + Phase 1 原生集成的清单：

- `tauri.conf.json`：移除 `transparent`、`decorations:false`、`shadow:false`、`skipTaskbar:true`、`hiddenTitle:true`、Overlay titlebar；打开 resizable；title 改为普通 app 名。
- Rust setup：停止 `configure_main_overlay`、control/grid window 启动、click-through 行为；保留必要的 app/window command 最小集合。
- 前端入口：让 Tauri load `apps/web` static dist，不再启动旧 Organizer/Grid React shell。
- capabilities：收窄旧 grid/control/window create 权限，只保留 Phase 1 所需 window/menu/store/open 权限。
- 菜单：从旧 tray/status menubar 转为基础 macOS app menu；status bar icon 放到 Phase 2。

### 2.5 Phase 1 原生集成 effort 估计

| 项 | Effort | 说明 |
|---|---|---|
| Dock 图标 | S | icon 资源和 bundle icon 配置已存在：`apps/desktop/src-tauri/tauri.conf.json:38` 到 `apps/desktop/src-tauri/tauri.conf.json:47`。仍需品牌/签名 polish。 |
| 原生普通窗口 | M | 必须拆旧 overlay/control/grid 和 click-through 行为，范围跨 config、Rust setup、capabilities、desktop React shell。 |
| `.dmg` 打包 | M | Tauri bundle 已打开，但签名/公证/CI 还未作为 Phase 1 验收闭环。 |
| 基础 macOS 菜单栏 | M | 当前有 tray/status menu：`apps/desktop/src-tauri/src/commands/menubar.rs:59` 到 `apps/desktop/src-tauri/src/commands/menubar.rs:116`，但不是完整 File/Edit/View/Window/Help app menu。 |
| 本地缓存 | S/M | Web prefs 已有 localStorage/IndexedDB 基础；若 Phase 1 只要求 UI 状态缓存是 S/M，若要求 Tauri store/file archive 则 M。 |
| 登录态保存 | M | Web Supabase auth 可保存 session，但 Phase 1 离线打开需要 desktop-local/mock session policy 与 guard 对齐。 |

### 2.6 最终结论

**CONDITIONAL_GO。**

允许在现有 `dev` 桌面分支启动 Phase 1，但第一阶段必须先处理上面 4 个 blocker。`apps/web/` 的 UI 完整度已足够作为源；当前不能 GO 的原因不是 Web 模块缺失，而是桌面 scaffold 仍是旧 overlay 产品定义，并且默认 live auth/在线依赖尚未按离线 launch gate 收口。

## Part 3 - 双分支并行策略 + ADR-0011 草稿

### 3a. Branch 策略

用户已确认当前分支分工：

| 机器 | 分支 | Scope |
|---|---|---|
| 机器 A | `dev` | 当前桌面端开发；承接 P1 Phase 1 Tauri Web wrap。 |
| 机器 B | `web` | 继续 Web 优化、deploy smoke、non-blocker gap closure。 |

原任务建议的 `desktop/tauri-web-mirror-v1` 与 `web/post-mirror-optimization` 不再作为新分支创建建议。如果需要保留语义，可用 PR title、tag 或 milestone 名表达。

#### 代码共享策略推荐

推荐 **A 复用：Tauri 内直接复用 `apps/web` / `plugin-web-*`**。

理由：

- Phase 1 的目标是 1-2 周内获得能跑的 Mac app；复用 Web UI 是唯一与该节奏匹配的方案。
- 当前 Web parity 主要集中在 `plugin-web-*` 与 `xai-web-shell`，直接包装可减少二次 port 风险。
- 旧 `apps/desktop` 的 overlay/grid/control 代码与新 P1 定义冲突，不应作为 UI 迁移主线。
- 短期代价是 desktop 分支会依赖 Web 命名空间；接受这个代价，Phase 3 再拆 `plugin-shared-*` 或 local-first repository。

不推荐 Phase 1 采用 B Port，因为它会把 24 行 Web parity 重新实现一遍；不推荐一开始采用 C 共享层，因为前期抽象成本会拖慢首个 Mac app 验收。

#### 同步节奏

- `dev` 每日 cherry-pick `web` 分支的高优先级修复，尤其是 shell registry、tokens/i18n、auth guard、storage contract。
- 每周一次 `web -> dev` sync PR，集中处理非紧急 UX/bugfix。
- 对 typed event、storage registry、module registration、route contract 建版本锁或 contract tests；两分支不能隐式改契约。

#### 冲突边界裁判

- `packages/core`、`packages/ui`、`packages/xai-web-shell` 属共享契约区，任何分支改动都需要说明对另一分支的兼容性。
- `web` 拥有 Web UX、deploy、browser parity 的主导权。
- `dev` 拥有 Tauri host、native capability、offline launch、packaging 的主导权。
- 若两边同时改 shell registry/route/auth/storage，优先选择保持 `web` 生产行为不破坏，再在 `dev` 通过 adapter 或 build env 收敛桌面差异。

### 3b. ADR-0011 草稿

Title: P1 Desktop 重定义为 React+Tauri+Local-first 混合桌面应用；旧 overlay/文件整理计划降级 P3

Status: DRAFT，待用户 Accept。

#### Context

用户已确认 P1 三阶段重定义。现有 ADR-0010 / CLAUDE.md / xai-g1-native-foundation 把 P1 G1 描述为透明 overlay、Smart Container 文件整理和桌面整理插件，这是产品定义错误。新的 P1 是普通 Mac 桌面应用，架构为 React Web UI + Tauri 原生能力 + local-first 数据层。

#### Decision

P1 Desktop 重新定义为三阶段：

1. Phase 1 - 快速桌面化：Tauri 包装 `apps/web` React 静态资源，提供 Dock 图标、普通原生窗口、`.dmg` 安装包、基础 macOS 菜单栏、应用配置存档、本地缓存、登录态保存，并保证 UI 离线可 launch。
2. Phase 2 - 桌面体验增强：系统通知、状态栏图标、全局快捷键、本地上次数据缓存、自动更新、完整 File/Edit/View/Window/Help macOS 菜单。
3. Phase 3 - Local-first / 数据离线可用：tasks、board、habits、pomodoro、notes、pet basic state、local settings 必须离线可用；AI agent、第三方 calendar sync、在线数据分析可降级；多设备同步、账号系统、云端协作需要联网。

Architecture: **React Web UI + Tauri native + local-first data layer**。

#### Supersedes

Supersedes ADR-0010 中 §G1 关于 "native overlay foundation" 的描述，以及把 transparent overlay / Smart Container 文件整理作为 P1 主线的全部判断。相关旧描述见 `docs/adr/0010-p1-desktop-resume-plan.md:65` 到 `docs/adr/0010-p1-desktop-resume-plan.md:87`。

#### Demoted to P3 Future

透明 overlay shell、Smart Container 文件整理、`plugin-{organizer, clipboard, widgets, meditation, pet}` 桌面整理插件全部降级为 P3 Future，待 P1 Phase 3 local-first 完成后重新评估。旧 organizer 透明 host 证据见 `docs/PLUGIN_MAP.md:163` 到 `docs/PLUGIN_MAP.md:175`。

#### 旧 P1 7 个插件处置建议

| Plugin | 建议 | 理由 |
|---|---|---|
| `plugin-account` | 保留但重定义 | Phase 1 只保留登录态/本地 session；多设备 sync 与云账号协作放 Phase 3。旧状态见 `docs/PLUGIN_MAP.md:93`。 |
| `plugin-console` | 合并/降级 | Phase 1 使用 Web shell，不需要旧 desktop console 作为核心 UI。旧状态见 `docs/PLUGIN_MAP.md:94`。 |
| `plugin-productivity` | 保留概念，复用 Web | tasks/habits/pomodoro 已在 Web 侧实现；不以旧 desktop package 为 Phase 1 源。旧状态见 `docs/PLUGIN_MAP.md:95`。 |
| `plugin-ai-cube` | 降级/合并 | 新 P1 使用 Web AI chat 与离线降级；native AI cube/overlay 不属于 Phase 1。旧状态见 `docs/PLUGIN_MAP.md:97`。 |
| `plugin-calendar` | 保留 Web calendar | Phase 1 复用 Web Calendar；通知是 Phase 2，第三方 sync 是 Phase 3。旧状态见 `docs/PLUGIN_MAP.md:99`。 |
| `plugin-labels` | 合并 | 标签应并入 tasks/board/project 数据模型，不作为 Phase 1 standalone desktop plugin。旧状态见 `docs/PLUGIN_MAP.md:101`。 |
| `plugin-project` | 保留概念，复用 Web board/workspaces | Project/workspace 能力应从 Web board/workspaces 起步；local-first repository Phase 3 再抽象。旧状态见 `docs/PLUGIN_MAP.md:102`。 |

#### Phase 3 local-first 技术栈预选

- SQLite via Tauri SQL / Rust layer：推荐。优点是 durable、可迁移、可查询、适合 sync log 和冲突处理；代价是 schema/migration/repository 层投入更高。
- IndexedDB：适合继续服务纯 Web，迁移成本低；但在桌面端备份、查询、跨进程控制、可观测性上弱于 SQLite。
- 本地 JSON 文件：实现最快，适合 config/export；但并发、索引、迁移、冲突合并都弱，不适合作为 Phase 3 主数据源。

推荐：Phase 3 桌面主数据源选 SQLite；Web 继续用 IndexedDB/localStorage 作为 browser fallback；提供一次性导入/迁移桥。

#### Consequences

- Phase 1 可以立即围绕 `apps/web` 启动，不再等待 overlay/file organizer 完整化。
- 旧 G0/G1 overlay 成果降级为参考资产，不再定义 P1 成功标准。
- `dev` 分支的首要工作从“继续完善 overlay”变为“普通 Tauri host + Web static dist + 离线 launch gate”。
- `web` 分支继续作为 UI 与模块 parity 的 source of truth。
- `plugin-web-*` 会在短期内被 desktop 复用，命名边界不完美但符合 Phase 1 节奏。
- Phase 2 原生能力必须以普通 app 体验为中心，而不是 overlay 特效。
- Phase 3 local-first 需要单独 ADR，因为它涉及存储选型、sync log、冲突策略和账号边界。
- 接受 ADR 后，需要回写/更新 ADR-0010、CLAUDE.md、PLUGIN_MAP、xai-g1-native-foundation 等源文档；本次审计按约束不修改这些文件。

## Part 4 - Patch Roadmap

已生成 roadmap source doc：`docs/audit/2026-05-26-patch-roadmap-source.md`。

该 roadmap 只列审计 surfaced 的可修补项，按用户最新分支分工标注为：

- A=desktop (`dev`)
- B=web (`web`)

