# XAI Release Log

> Chinese-first release and project-system change log for solo development.
> Keep newest entries first. Use `.teams/skills/xai-release-log/SKILL.md` when
> appending entries.

## 2026-09-08

### 产品上线运行闭环方案更新

- Product line: project-system / web mainline
- Branch / commit: codex/web/production-launch-operations-20260908 / 基于 web 9257be4 的文档变更
- User-visible change: 现有 [docs/DEPLOYMENT.md](../../DEPLOYMENT.md) 升级为 Production Launch & Operations 统一入口，覆盖当前能力/缺口、Cloudflare 与 Supabase 架构、Web/Mac/移动端账号和支付、CI/CD、监控/日志/预算、备份恢复及分阶段执行顺序。
- Developer/system delta: 固定 web/main/dev/plugin/mobile 基线并保存[日期证据](../../reviews/production-launch-operations/20260908-current-state-audit.md)；修正 Cloudflare/Supabase/Web deploy 和 Mac release/support 手册；补 README/handbook 入口；同步看板部署摘要与最新 CI，保留历史记录及既有模块/分支治理。修正构建变量来源、无效回滚指令、删除 404 误判、同步入口缺口和 Premium stub 的上线口径。没有产品运行时代码变更。
- Verification: 文档相对链接/标题锚点检查 passed（68 项）；package script 名称检查 passed（37 处）；JSON parse 和 git diff --check passed；node --check scripts/dashboard/generate-state.mjs、pnpm dashboard、pnpm dashboard:verify-static、pnpm dashboard:verify-modules passed（六模块、66 个 Skill/Agent，registry resolved）。机器契约/模板/边界无需变更，未改看板渲染行为；未重跑全量产品测试。只读查询确认 2026-09-08 GitHub mock build 通过，OSV/cargo-deny/Cloudflare credentials gate 失败，详见日期证据。
- Risk / follow-up: 文档交付不等于实施或上线。Cloudflare 当前部署清单与 Supabase 项目配置因认证不可用而未核验；真实账号删除、同步鉴权/恢复、服务端 billing/entitlement、告警和恢复演练仍须按主文档阶段落地。此短分支仅保存文档，不推进 main/dev、不部署、不解冻产品线。

### 多电脑开发 GitHub 完整性门禁

- Product line: project-system / web mainline
- Branch / commit: `web` / `03d3db3`
- User-visible change: 无产品运行时变更。项目现在明确 GitHub 远端 refs 是多电脑开发的交换事实源；切换电脑前必须保证可恢复工作已经 commit + push，stash、reflog、隐藏 ref 和未跟踪源码不得只留在一台电脑。
- Developer/system delta: 新增 `docs/workflow/project/multi-machine-development.md`、可复制的 `new-mac-development-handoff-prompt.md` 和可执行的 `pnpm git:sync-check -- --fetch [--deep]` 门禁；同步 AGENTS / CLAUDE / Cursor / workflow / handbook / usage guide / ADR-0013 / branch-policy / consistency-checks；新增无值的 `apps/web/.env.example`，只同步本机环境变量名，不上传密钥；记录 2026-09-08 迁移归档 refs 作为灾难恢复层，且明确不得把归档分支整条合并到长期产品线。
- Verification: `git diff --check` passed；`bash -n scripts/ci/check-multi-machine-sync.sh` passed；`shellcheck scripts/ci/check-multi-machine-sync.sh` passed；JSON parse passed for `package.json`、`branch-policy.json`、`consistency-checks.json`；staged secret-pattern scan passed；`.env.example` value check passed；dirty-tree negative test correctly failed；`pnpm git:sync-check -- --fetch --deep` passed after pushing `03d3db3`（4 local branches aligned；0 branch/ref/reflog-only commits；23/23 stashes remote-reachable；0 unreachable commits；0 failures / 0 warnings）。
- Risk / follow-up: `.env.local`、API token、签名材料与应用登录态仍必须经密码管理器或加密迁移渠道恢复；GitHub branch protection API 因当前私有仓库套餐返回 403，暂不能把长期分支保护配置为服务端强制门禁，因此当前以项目规则、脚本和 PR 纪律执行；现有 `web→main` PR #2（draft）和 `dev→main` PR #1 保持独立，未因本次完整性审计执行跨线合并或发布。

## 2026-07-09

### Web / Cloudflare / Desktop Readiness Gate Cleanup

- Product line: web / app / project-system
- Branch / commit: `web` / `78160fd`（Cloudflare preview source remains `2966bba`）
- User-visible change: Cloudflare Pages preview 已发布到 `https://web.xai-web-console.pages.dev`（latest deployment `280a3451-3912-4e4e-8dd0-46baa3e217d2` / source `2966bba`）；Web 构建产物的入口 JS chunk 从约 534 kB 降到约 290 kB；Web 默认测试现在覆盖 `apps/web/deploy/security` 的 CSP / RUM / headers 测试；新增 Web CSS 不再违反 raw color 策略；AI 智谈在 390px mobile 首屏不再默认展开聊天侧栏遮挡主内容。
- Developer/system delta: pnpm overrides 同步到 workspace 配置并保留 pnpm 9 兼容配置；pnpm 11 build-script allowlist 固化到 `pnpm-workspace.yaml`；新增 `.npmrc` 禁止 pnpm 11 在 turbo 子任务中并发 verify/install，避免无 TTY / `uv_cwd` 伪失败；升级 Vite/Vitest/Turbo/Wrangler 与 OSV 报告的 npm 安全补丁版本；修复 supply-chain workflow 的 cargo-deny manifest 参数、Ubuntu Tauri 系统依赖、失效 OSV action pin，改为 SHA256 校验的 `osv-scanner` v2.3.8 binary；修复 Desktop build 的 TypeScript unused / lib-target 兼容问题；Desktop Vite 按 React / interaction / plugin / core 切 chunk，并把 `registerAccountPlugin()` 改走 `@repo/plugin-account/register-plugin` 窄入口，避免 Desktop 卷入整包 account/sync/rekey surface；Web manual chunks 合并 board/planning 共享依赖，消除 Vite circular chunk warning；修复 `platform::macos` 条件编译边界，让 Linux CI 可编译 crypto/keychain 的非 macOS stub，同时继续把 Cocoa window extension 限制在 macOS；Deploy Web credentials preflight 抽成 `scripts/ci/check-cloudflare-pages-token.sh` 并暴露 `pnpm cloudflare:verify-token`，在 Wrangler 失败时输出本项目需要的 token scope（Account → Cloudflare Pages → Edit、User → Memberships → Read、Account → Account Settings → Read），并在 runbook / ADR / deployment doc 中同步；个人开发看板记录当前 `web` 领先 `main` 66 commits，并把 Metric Tracker 纳入 Web 功能列表；同步 `desktop-plugin-next` 已存在的跨平台路由规则；将 Web color literal baseline 从 918 条收缩到 808 条历史债务。
- Verification: `CI=true corepack pnpm install --frozen-lockfile` passed；`tmp osv-scanner v2.3.8 scan source --config=scripts/ci/osv-scanner.toml --lockfile=pnpm-lock.yaml --lockfile=apps/desktop/src-tauri/Cargo.lock` passed（700 npm + 599 Cargo packages；18 reviewed Tauri Linux GTK/unic exceptions filtered；No issues found）；`bash scripts/ci/check-exact-pins.sh` passed；`cargo metadata --locked --manifest-path apps/desktop/src-tauri/Cargo.toml --format-version 1` passed；`bash scripts/ci/check-verify-strict.sh` passed；`cargo deny --manifest-path apps/desktop/src-tauri/Cargo.toml --all-features check advisories bans licenses sources` passed；`cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto crypto::rfc_vectors` passed（5 tests，含 `78160fd` 后复跑）；`bash scripts/ci/check-cbor-aad-cross-impl.sh` passed；`corepack pnpm --filter @repo/web check-types` passed；`corepack pnpm --filter @repo/web build` passed（max JS chunk `feature-board-planning` 301 kB；no 500 kB / circular warning）；`corepack pnpm --filter @repo/web test` passed（27 files / 143 tests，含 deploy/security 4 tests）；`corepack pnpm --filter desktop build` passed（Desktop 最大 chunk `vendor-react` 约 193 kB，原 1.67 MB warning 已消失；`78160fd` 后复跑 passed）；`CI=true corepack pnpm exec turbo run check-types --force` passed（45 tasks / 0 cached）；`corepack pnpm web:check-colors` passed（0 new raw colors / 808 legacy entries quarantined）；`corepack pnpm --filter @repo/plugin-web-ai-chat test` passed（29 files / 253 tests，存在既有 React act warning）；`corepack pnpm --filter @repo/plugin-web-ai-chat typecheck` passed；`VITE_WEB_AUTH_MODE=mock-authenticated corepack pnpm --filter @repo/web build` passed；`corepack pnpm exec wrangler pages deploy ./apps/web/dist --project-name=xai-web-console --branch=web --commit-hash=2966bba ...` passed；`corepack pnpm exec wrangler pages deployment list --project-name=xai-web-console` confirmed latest Preview deployment `280a3451-3912-4e4e-8dd0-46baa3e217d2` / source `2966bba`；`curl -I -L https://280a3451.xai-web-console.pages.dev/app/ai` returned HTTP/2 200 with CSP / permissions-policy / HSTS / noindex headers；Playwright screenshots passed for latest preview `/app/ai` at 1280x720 and 390x844, including mobile sidebar-collapsed state；GitHub PR #2 `web -> main` queried run passed all Supply-chain security jobs（Rust exact pins + lock check、OSV scanner、cargo-deny、RFC crypto vectors + CBOR cross-check）；`bash -n scripts/ci/check-cloudflare-pages-token.sh` passed；missing-env negative check for `scripts/ci/check-cloudflare-pages-token.sh` exited 1 with expected error；`actionlint .github/workflows/deploy-web.yml` passed；Ruby YAML parse for `deploy-web.yml` passed；`jq empty package.json docs/workflow/project/dashboard-state.json` passed；`corepack pnpm dashboard` passed；`corepack pnpm dashboard:verify-static` passed；`corepack pnpm dashboard:verify-modules` passed。
- Risk / follow-up: GitHub PR #2 远端 supply-chain 已通过，代码侧安全/供应链门禁当前可判定；Deploy Web 最新 run 仍失败，根因为 GitHub secret `CLOUDFLARE_API_TOKEN` 认证/权限无效（Cloudflare API code 10000 / missing `User->Memberships->Read` / membership roles 读取失败），workflow credentials preflight 正确阻断但 secret 仍需 operator 在 GitHub 更新/轮换；Cloudflare Workers Builds 外部检查也失败，Cloudflare Pages 项目 `xai-web-console` 仍未绑定 Git Provider；latest Preview deployment=`280a3451-3912-4e4e-8dd0-46baa3e217d2` / source=`2966bba` 已由本地 Wrangler 发布，latest Production deployment=`1cc04a60-02b8-4579-97f1-52f84de3d3d6` / source=`9a61669`（约 1 month ago）仍不是当前改动；Web 仍有 808 条历史 raw color baseline 债务但当前策略门已通过；production 仍需 `web→main` promote、GitHub secret 修复、production deployment id / URL / smoke / rollback 记录。

## 2026-06-18

### Dev Dashboard Skill / Agent Registry Classification Sync

- Product line: project-system / dev-dashboard
- Branch / commit: `web` / `8f27adb3`; `codex/mobile/native-thin-shell-mvp` / `dcf284c0`
- User-visible change: 个人开发看板的 Skill / Agent 页面不再把 `stitch-design-taste` 留在 `needs-action`，当前工作区刷新后 66 个 Skill / Agent 条目均为 resolved。
- Developer/system delta: `scripts/dashboard/generate-state.mjs` 将 `stitch-design-taste` 明确归入 quality 分类，避免设计质量类 skill 被误判为 reference / unclear category；本地 `state.generated.js` 仍作为每机器快照，不进仓库。
- Verification: bundled Node `--check scripts/dashboard/generate-state.mjs` passed；bundled Node `scripts/dashboard/generate-state.mjs` passed；generated registry reported `skill_status=resolved`, `skill_entries=66`, `unresolved=0`；`git diff --check HEAD^ HEAD` passed；`pnpm dashboard` not run because `pnpm` is not available in this shell PATH.
- Risk / follow-up: 低风险；65 个条目仍依赖生成器自动补齐 source-backfill 字段，可后续按需回写源 skill / agent 定义。

## 2026-06-09

### Web 项目看板 W1：真实标签/成员目录 + 优先级 + chip 解析

- Product line: web
- Branch / commit: `claude/laughing-wright-d1e797` / `823ddf7..7181917` + `53c7ace`（已提交，未 push）
- User-visible change: `/app/board` 卡片标签/成员不再显示成灰色乱码 id（`l1`/`u1`），改为彩色标签名 + 成员首字母头像；卡片新增优先级 chip；卡片详情弹窗可新建/改名/换色/删除标签（删除联动从所有卡片剥离引用）、新建/改名成员、设置四级优先级（urgent/high/medium/low）。修复看板模板 `l1..l5` 孤儿标签 id。
- Developer/system delta: `Board.labels`/`Board.members` 看板级目录（缺省惰性回退 `DEFAULT_BOARD_LABELS`/`DEFAULT_BOARD_MEMBERS`，旧 localStorage 零迁移、纯增量）；`BoardCard.priority` + `BOARD_PRIORITIES`；`isBoardArray` 守卫扩展校验新字段（防持久化丢数据）；TableView/Dashboard 改从看板目录解析；`apps/web/src/service-worker/register.ts` 改为仅 PROD 注册（dev 主动反注册，根治 Vite dev 下 SW 缓存导致"改了不生效"）；新增 `docs/reviews/xai-web-project-module/20260609-board-usability-audit.md` 审查报告 + `docs/planning/sub-prds/web/project-board-data-model.md` 数据模型 PRD。
- Verification: board-core + board-workspaces 全绿（含新增解析/优先级断言 BC2b–f、CAT1–8、V9）；两包 `typecheck` + `lint` 干净；Vite 实测服务最新源。备注：W1 当时 preview 浏览器被历史 service worker + bfcache 钉住初始 chunk 未能截图，已由 dev 守卫根治，W2 起干净 preview 实拍确认。
- Risk / follow-up: 低——纯增量、旧数据零迁移。新增持久化字段落在 `syncScope: account-sync` 实体上，接同步前须过 `xai-account-sync-scope-check`（ADR-0013 §D4，sync 线 paused）。

### Web 项目看板 W2：看板元数据编辑 + 优先级贯通多视图 + 按优先级过滤

- Product line: web
- Branch / commit: `claude/laughing-wright-d1e797` / `cf9231a..7db9393`（已提交，未 push）
- User-visible change: 看板可改名/换图标/写描述/换封面（`BoardSettingsModal`，8 预设封面，header ✎ 入口；标题与切换器显示自定义图标/描述）；TableView 新增可编辑「优先级」列（chip + popover 设置/清除）；Dashboard 新增「按优先级分布」柱状图；Filter 支持按优先级过滤（按板持久化）。
- Developer/system delta: `Board.icon`/`Board.description` 字段 + 守卫 + `BOARD_COVER_PRESETS`；`FilterState.priorities` facet（跨 facet AND、facet 内 OR）+ FilterPopover 优先级区 + `xai_board_filter_by_id` 序列化含 `priorities`（旧存储宽容缺省）；顺带修复 FilterPopover 标签/成员行从原始 id 改为目录解析显示名。
- Verification: board-core 204 + board-views 138 + board-workspaces 277 = 619 测试全绿（新增 FIL-P1..3、TV-P1..2、BD-P1..2、FP-P1/N1、BWM-SET-1..2、BWM-FILTER-P、V10）；3 包 tsc + lint 干净；干净 preview 实拍确认 chip 解析、🚀 图标持久化、封面切换、Urgent 卡面 chip。
- Risk / follow-up: 低——纯增量。

### Web 项目看板 W3：Table 列排序 + Workspace CRUD（消灭最后一个冻结目录）

- Product line: web
- Branch / commit: `claude/laughing-wright-d1e797` / `f9cbf44..d6feef5`（已提交，未 push）
- User-visible change: TableView 标题/优先级/截止日三列可点击排序（三态循环，缺值恒末位）；看板切换器内可新建工作空间、行内改名（✎）、换色（点色点轮换）、删除空空间（仅空且非最后一个）。工作空间不再是冻结的两个种子。
- Developer/system delta: 新持久化键 `xai_board_workspaces`（PREF_REGISTRY + AC-REG-8/AC-PARITY owner-row 契约登记）；board-core `isBoardWorkspace`/`isBoardWorkspaceArray` 守卫 + `loadWorkspacesOrDefault`（null/malformed/empty → `DEFAULT_WORKSPACES`）；BoardSwitcher 可编辑态渲染空工作空间分组；审查/数据模型文档收尾 + 范围外项理由。
- Verification: board-core 206 + board-views 141 + board-workspaces 281 = 628 测试全绿（新增 WSP-1/2、TV-S1..3、BWM-WS-1..4）；4 包 tsc + lint 干净；live 实拍：新建 "Client Projects" 空间出现在 scope 栏 + 分组（带 ✎/🗑），`Priority ▼` 排序置顶 Urgent 卡。
- Risk / follow-up: 已知遗留（改动前即失败，已立独立任务卡）：`plugin-web-storage` 的 AC-PARITY-1/2 因 `web design/DESIGN.md` 缺 §9.2 键表而 fail。明确门禁外/未做：文件上传（需 IndexedDB 决策，localStorage 配额放不下 blob）、真实分享后端、账号云同步接线（ADR-0013 §D4，sync 线 paused，不得擅自解冻）。**跨机说明**：本批 14 commit 在 `web` 线、尚未 push；如需流向 Desktop 须走 ADR-0013 §D3 `xai-web-to-desktop-sync`（W0–W4 + parity receipt），禁止直接并入 `dev`。

## 2026-06-06

### 个人开发看板主目录启动入口

- Product line: project-system / dev-dashboard
- Branch / commit: `web` / local cherry-pick
- User-visible change: 主目录新增可双击的 `open-dashboard.command`；打开个人开发看板时会自动请求启动 Web mock 服务，看板内「使用和操作」页可直接打开 Web 首页和 Web App(`/app/dashboard`)。
- Developer/system delta: 新增 `scripts/dashboard/open.mjs` 作为看板启动器；`serve.mjs` 补齐 nvm/Homebrew/local PATH 并解析 `pnpm` / `corepack pnpm`；使用页区分 Web 首页和 Web App route，启动 mock 后默认打开 `/app/dashboard`。
- Verification: `node --check scripts/dashboard/open.mjs` passed；`node --check scripts/dashboard/serve.mjs` passed；`node --check scripts/dashboard/generate-state.mjs` passed；`node --check docs/prototypes/dev-dashboard/js/usage-ops.js` passed；`zsh -n open-dashboard.command` passed；`git diff --check HEAD^ HEAD` passed；`node scripts/dashboard/generate-state.mjs` passed；`node scripts/dashboard/verify-product-modules.mjs` passed；`node scripts/dashboard/verify-static.mjs` passed；`./open-dashboard.command` no-browser smoke passed with port fallback to 4178 during parallel run；narrow-PATH `./open-dashboard.command` no-browser smoke passed and detected Web as `already-running`。
- Risk / follow-up: Web 服务启动依赖本机存在 `pnpm` 或 `corepack pnpm`；如果 3000 已由外部服务占用，看板会跳过重复启动并按 ops 状态展示。

## 2026-06-04

### Desktop Plugin 产品边界与长期平台路线落地

- Product line: desktop-plugin / project-system
- Branch / commit: `codex/web/dev-dashboard-authority-refactor` / local working tree
- User-visible change: 无运行时功能变更。产品结构现在明确 Mac Desktop 是“Web 容器壳 + native chrome”，Desktop Plugin 承担“桌面原生超能力层”（多窗口/overlay/Widget/快速入口），未来 iPhone / iPad / Apple Watch / Android / 浏览器扩展只进入 planning-only 路线图，不进入当前开发队列。
- Developer/system delta: 新增 `docs/planning/LONG_TERM_PRODUCT_ROADMAP.md`；同步 `CLAUDE.md`、`AGENTS.md`、Cursor 路由规则、`MODULE_BOUNDARIES.md`、`PRODUCT_MODULE_MAP.md`、Plugin PRD、`module-classification.json`、`dashboard-state.json` 和 `xai-module-classify` 三端 skill/rule 镜像；个人开发看板产品结构图新增 `future_surfaces` 只读规划层。
- Verification: `module-classification.json` / `dashboard-state.json` JSON parse passed；dashboard JS and generator `node --check` passed；xai-module-classify Team/Codex/Claude mirrors match；`git diff --check` passed；`pnpm dashboard` passed；`pnpm dashboard:verify-static` passed；`pnpm dashboard:verify-modules` passed；local HTTP smoke on `http://127.0.0.1:4177` confirmed `futureSurfaces` container, `renderFutureSurfaces()` call, future-surface card script, generated `future_surfaces=5`, App goal contains Web SPA, and Plugin goal contains 插件平台运行时.
- Risk / follow-up: 本次只落实治理、文档、分类和看板；不创建 `desktop-plugin-next`，不启动 feature-build，不实现 Plugin Center / Widget Host / 多窗口运行时代码。后续产品开发仍需等 G1 解冻和 operator 确认。

### Desktop Plugin 入口模型与看板状态对齐

- Product line: desktop-plugin / project-system
- Branch / commit: `codex/web/dev-dashboard-authority-refactor` / local working tree
- User-visible change: 无运行时功能变更。产品文档与个人开发看板现在明确 Desktop Plugin 的未来入口是 Mac App 控制面板一级入口 + 轻量 Plugin Center + 设置页全局偏好；看板的 Desktop Plugin 模块卡标明 `Paused until G1`、入口设计已决、实现未开工。
- Developer/system delta: `docs/planning/sub-prds/plugin/PRD.md` 新增 Plugin Center / Entry Model、MVP 添加流程、实例设置和风险顺序；`docs/PLUGIN_SDK.md` 新增 `PluginInstance` / `PluginCenterEntry` / `AddToDesktop` contract；`docs/MODULE_BOUNDARIES.md` 与 `docs/PRODUCT_MODULE_MAP.md` 明确“入口归 App、内容归 plugin”的路由；`dashboard-state.json` 更新 plugin 产品线状态卡，`docs/prototypes/dev-dashboard/BOUNDARIES.md` 固化状态卡只读 Product Module Registry 的边界。
- Verification: `docs/workflow/project/dashboard-state.json` JSON parse passed；`node --check scripts/dashboard/generate-state.mjs` passed；`pnpm dashboard` passed；generated `state.generated.js` confirmed plugin status/running/feature card values；`pnpm dashboard:verify-static` passed；`pnpm dashboard:verify-modules` passed。
- Risk / follow-up: 本次为 docs-only / contract-only，不解冻 P2、不实现 Plugin Center、不启动 feature-build。后续仍按 G1 后顺序推进：Organizer closeout → Widget Host MVP → Clipboard MVP（先修 `clipboard.item` vs `clipboard.entry` 契约漂移）→ Pet basic；Meditation desktop plugin 继续延后。

### 项目 Skill 体系补齐：部署 / 桌面发布 gate + Cursor 镜像

- Product line: project-system / workflow governance
- Branch / commit: `codex/web/dev-dashboard-authority-refactor` / local working tree
- User-visible change: 个人开发看板和产品结构导航现在能看到 13 个固定项目 skill；Web 部署相关改动有 `xai-web-deploy-preflight` 前置检查入口，Mac Desktop W4 发版风险有 `xai-desktop-release-gate` 入口，Cursor 也拥有全部 XAI 项目 skill 的 `.mdc` 镜像。
- Developer/system delta: 新增 `.teams/skills/xai-web-deploy-preflight` 与 `.teams/skills/xai-desktop-release-gate`，并镜像到 `.claude/skills`、`.codex/skills`、`.cursor/rules`；把 `xai-feature-brief` 升级为六产品线 intake，把 `xai-feature-dossier-sync` Scope 扩到 `site/admin/project-system`，并让 `xai-dev-dashboard-sync` / `xai-consistency-audit` 显式检查 Cursor mirrors；更新 ADR-0014、`sync-registry.json`、`PRODUCT_MODULE_MAP.md`、`dashboard-state.json`、usage-guide、consistency checks 和 dashboard generator，让部署 / 桌面发布 gate 可被 fanout dispatch、看板和文档库发现。
- Verification: `node --check scripts/dashboard/generate-state.mjs` passed；`sync-registry.json` / `dashboard-state.json` / `consistency-checks.json` JSON parse passed；XAI skill mirror check passed (`teams=13 missing=0`)；XAI skill content mirror check passed (`skills=13 failures=0`)；`pnpm dashboard` passed；`pnpm dashboard:verify-static` passed；`pnpm dashboard:verify-modules` passed；`python3 scripts/lint/check_portable_sync.py` passed。
- Risk / follow-up: 新增两个 gate 均为 receipt/preflight-only，不会自动部署、签名、公证、上传、创建 release 分支或触碰 `dev`；`xai-sync-fanout-dispatch` 仍是 planner/router，不是强制自动执行器。

## 2026-06-03

### 个人开发看板边界规范闭环

- Product line: project-system / dev-dashboard
- Branch / commit: `web` / local working tree
- User-visible change: 个人开发看板新增可跟踪的 `README.md` 入口和 `BOUNDARIES.md` 页面/卡片边界规范，并让同步 skill 在每次运行时核对它们，避免模板引用未纳入 Git 的配套文件。
- Developer/system delta: 将 `docs/prototypes/dev-dashboard/README.md` 和 `docs/prototypes/dev-dashboard/BOUNDARIES.md` 纳入 tracked scope；`xai-dev-dashboard-sync` 的项目源 skill 增加 README 和 Boundary spec 作为 Read First / drift audit 输入，并把 Boundary spec 作为第六个 alignment surface 和 receipt 字段；`docs/workflow/project/dev-dashboard.md` 同步记录六项 alignment check；`generate-state.mjs` 将 README / BOUNDARIES 加入必读文档、sync sources 和 dashboard-docs dirty bucket。
- Verification: `node --check scripts/dashboard/generate-state.mjs` passed；`pnpm dashboard` passed；generated state confirmed `README.md` and `BOUNDARIES.md` appear in must-read docs and sync sources；`pnpm dashboard:verify-modules` passed；`pnpm dashboard:verify-static` passed.
- Risk / follow-up: `.claude/skills/xai-dev-dashboard-sync` and `.codex/skills/xai-dev-dashboard-sync` are symlink mirrors to `.teams/skills/xai-dev-dashboard-sync`, so the tracked source skill is the only file that needs committing.

### 个人开发看板数据边界修复

- Product line: project-system / dev-dashboard
- Branch / commit: `web` / local working tree
- User-visible change: 个人开发看板的测试结果、发布记录和模块健康结论不再把 `dev-dashboard` / `project-system` 证据归到 Admin；Skill / Agent 页新增源文件完整度指标，区分“展示字段已补齐”和“源文件已补齐”。
- Developer/system delta: `release-testing.mjs` 抽出 release-log Verification 判定，先识别 `0 failures / 0 errors` 等零失败表达再匹配失败词；`generate-state.mjs` 将 `project-system/dev-dashboard` 拆成独立 release/testing 归类，收窄 Admin aliases，并为 `skill_agent_registry` 增加 `source_completeness`；`verify-static.mjs` 新增 release verdict fixture 和 `theme-bootstrap.js` 顺序检查；`verify-product-modules.mjs` 允许 release 卡展示 `project-system` 支持类，同时继续强制六个 Product Module Registry key。
- Verification: `node --check` passed for dashboard generator, release-testing helper, static/module verifiers, and changed dashboard JS files；`dashboard-state.json` JSON parse passed；`pnpm dashboard` passed；generated state confirmed dev-dashboard release entries under `project-system`, zero-failure testing record as `pass` with `failure_count=0`, Admin testing `failure_count=0`, `source_completeness` present, and release modules including separate `project-system` card；`pnpm dashboard:verify-modules` passed；`pnpm dashboard:verify-static` passed.
- Risk / follow-up: `source_completeness` correctly reports most Skill / Agent entries still rely on generated backfill; this is now visible as a source-documentation follow-up, not a dashboard display gap.

### 个人开发看板 Skill / Agent 知识库

- Product line: project-system / dev-dashboard
- Branch / commit: `web` / local working tree
- User-visible change: 个人开发看板「Skill 和 Agent」页升级为可维护知识库，不再只显示名称列表；每个 Skill / Agent 展示类型、分类、使用场景、功能说明、输入、输出、使用频率、关联 workflow、关联文档、维护状态、最近更新时间和简短注释，并给出 `resolved` / `needs-action` 结论。自动补齐后的字段不再作为长期缺口显示，只作为源文件可回写提示。
- Developer/system delta: `generate-state.mjs` 新增 `skill_agent_registry`，扫描 `.teams/skills`、`.codex/skills`、portable skills、canonical agent templates 和 Codex/Claude/Cursor agent 变体，自动分类、提取/生成简介与注释、识别新增/修改项、维护状态、镜像状态、真正 unresolved 项和 source-backfill 项；`skill-agent.js` 改为从 registry 渲染知识库；同步更新 `xai-dev-dashboard-sync`、机器契约、模板、设计说明和 usage-guide。
- Verification: `node --check scripts/dashboard/generate-state.mjs` passed；`node --check docs/prototypes/dev-dashboard/js/state.js` passed；`node --check docs/prototypes/dev-dashboard/js/skill-agent.js` passed；`pnpm dashboard` passed and generated `skill_agent_registry` with 58 entries, 33 skills, 25 agents, 13 required fields, category summaries, changed-item detection, and missing-metadata report；`pnpm dashboard:serve` served `http://127.0.0.1:4177`；served `state.generated.js` check passed；Safari visual smoke showed desktop Skill / Agent page with counts, categories, field cards and gap badges；Chrome headless 390px screenshot completed；Chrome CDP 390px metrics passed (`innerWidth=390`, `scrollWidth=390`, 58 entries, 6 count cards, 6 categories, required labels present, `xai-dev-dashboard-sync` entry present, no content overflow).
- Risk / follow-up: 当前 registry 已为所有条目生成可读字段并给出 resolved 结论；大多数 Skill / Agent 源文件仍缺显式 `Note` / 输入 / 输出段落，现作为 source-backfill 提示保留，后续可逐条回写源文件以减少自动生成依赖。

### 个人开发看板测试结果面板

- Product line: project-system / dev-dashboard
- Branch / commit: `codex/web/dev-dashboard-test-results` / local working tree
- User-visible change: 个人开发看板新增「测试结果」Tab，按 Web、Mac 桌面版本、桌面插件、账号云同步、官网、管理者 Dashboard 展示最近测试时间、结论、通过状态、失败项、分类测试结果、pipeline 状态、耗时和报告入口；总览模块卡片、产品结构详情、部署记录和发布记录也同步显示测试状态。
- Developer/system delta: `dashboard-state.json` 新增 `testing` registry；`generate-state.mjs` 合并人工测试登记、release-log `Verification` 派生记录、已知本地报告路径和 GitHub Actions workflow inventory，并把 `testing` 回填到 `product_lines`；新增 `testing.js` 渲染测试页和跨页面测试徽标；同步更新 `xai-dev-dashboard-sync`、机器契约、模板、设计说明和 usage-guide。CI workflow 只标 `configured / not queried`，不会被伪造成通过。
- Verification: `node --check scripts/dashboard/generate-state.mjs` passed；`node --check` passed for changed dashboard JS files；`dashboard-state.json` JSON parse passed；`pnpm dashboard` passed；generated state confirmed 6 testing modules, 17 test records, 3 pipeline rows, 5 report sources, and `product_lines[*].testing` present；`pnpm dashboard:serve` served on `http://127.0.0.1:4178` because 4177 was already occupied by an older local server；Chrome/Playwright smoke passed for `#testing`, `#overview`, product detail, `#deployment`, `#release-log`, and 390px mobile with 6 testing cards, 0 horizontal overflow, 0 HTTP failures, and 0 console errors.
- Risk / follow-up: 看板现在能展示并同步测试状态，但远端 CI 最新结论仍需后续接 GitHub check 查询；当前只把 workflow 文件存在性标为 configured/not queried，符合“不伪造 green”的规则。

## 2026-06-02

### Web 记账模块 Cloud Design 正式接入

- Product line: web
- Branch / commit: `codex/web/bookkeeping` / local working tree
- User-visible change: Web Console 新增 `/app/bookkeeping` 正式记账模块，rail 显示「记账」，可管理账本、账户、收支/转账/预付记录、分类、预算、资产、投资和周期账单；支持计算器金额输入、日历每日收支、明细搜索筛选、统计图表、CSV 导入导出和刷新后本地保留。
- Developer/system delta: 新增 `@repo/plugin-web-bookkeeping` 包、Cloud Design 对齐 docs 四件套和 canonical PRD；host 接入 workspace dependency、shell registration、wallet icon、`nav.bookkeeping` i18n；看板 Web feature 列表从 proposed 更新为 in-dev。存储使用 `xai_bk_state_v2` + 4 个偏好键，adapter 标记 `syncStatus: "device-local"`，仅预留账号云同步接口，不写 sync entities；修复 dev/StrictMode 下保存一次重复写入两条记录的状态副作用问题。
- Verification: `pnpm --filter @repo/plugin-web-bookkeeping lint` passed；`pnpm --filter @repo/plugin-web-bookkeeping check-types` passed；`pnpm --filter @repo/plugin-web-bookkeeping test` passed；`pnpm --filter @repo/web check-types` passed；`pnpm --filter @repo/xai-web-shell check-types` passed；`pnpm --filter @repo/xai-web-shell lint` passed；`pnpm --filter @repo/plugin-web-tokens check-types` passed；host shell/router/rail filter targeted tests passed；changed Web files targeted eslint passed；`pnpm --filter @repo/web build` passed；Browser smoke at `/app/bookkeeping` passed（8 tabs、单次保存无重复、reload 持久化、390px 无横向溢出）。
- Risk / follow-up: full `pnpm --filter @repo/web lint` 仍被既有 `apps/web/src/App.tsx` restricted-import warning 阻断，非本次改动；账号云同步和 Desktop/App 下沉需后续分别走 D4 / D3 gate。

### 个人开发看板开发数据周/月趋势

- Product line: project-system / dev-dashboard
- Branch / commit: `web` / local working tree
- User-visible change: 开发数据页新增时间维度切换（今日 / 最近 7 天 / 按周 / 按月），并用图表展示周 commit 数对比、月 commit 数对比、周开发活跃度趋势、月开发活跃度趋势；不再只停留在今日和 7 日数字。
- Developer/system delta: `scripts/dashboard/generate-state.mjs` 新增 `weekly_stats`（最近 8 周）和 `monthly_stats`（最近 6 个月），每个周期记录 commit 数、活跃天数、活跃率和日期范围；`ops-panels.js` 渲染维度 tabs、摘要卡和柱状图；同步更新 dev-dashboard 模板与设计说明。
- Verification: `node --check scripts/dashboard/generate-state.mjs` passed; `node --check docs/prototypes/dev-dashboard/js/ops-panels.js` passed; `git diff --check` passed; `pnpm dashboard` passed; `pnpm dashboard:serve` served `http://127.0.0.1:4177/#dev-data`; Browser smoke confirmed desktop tabs + weekly/monthly/7-day/today chart switching and 390px weekly/monthly responsive views with no horizontal overflow.
- Risk / follow-up: `state.generated.js` 仍是本机快照；提交后再次运行 `pnpm dashboard` 可把 dirty count 降到提交后的真实状态。

### Web 六大功能反向补建 canonical PRD + 历史 SHIPPED 补登

- Product line: web
- Branch / commit: `web` / `b569461`（tasks/board/calendar PRD 已提交）+ local working tree（pomodoro/dashboard/settings PRD + calendar 收口 + 本条目未提交）
- User-visible change: 无（纯文档治理；用户在产品上看不到变化）。本条为反向补账——下列功能均为**历史已 SHIPPED**，此前缺 canonical PRD 与 release-log 记录。
- Developer/system delta: 用 `xai-feature-dossier-sync` 反向为 6 个已 SHIPPED 的 web 功能建立 `docs/product/<feature>/prd.md`（仓库首批功能级 canonical PRD）：清单 tasks、看板 board（3 包合 1）、日历 calendar、番茄钟 pomodoro、仪表盘 dashboard（grid+widgets 合 1）、设置 settings（主壳 + appearance/features/rest 3 子 PRD）。各功能历史 ship 日期/commit 见对应 PRD §7（tasks/board/calendar/pomodoro 于 2026-05-23~24；dashboard 系列 2026-05-23~29；settings W4 系列 2026-05-23~28）。同时收口 calendar 一处 traceability 异常：工具栏「+」按钮 bugfix（dev_log block3，停在 `FIX_READY`）查证为被 `xai-web-calendar-event-create`（Option B 真实 CRUD，SHIPPED `bc573b1`）取代，已标 `superseded` 并回写 dev_log + PRD。
- Verification: 来源核验（每条需求映射 dev_log SHIPPED block / commit SHA / discovery review，无来源项标 `待确认`）；未跑测试（纯文档变更）；calendar/dashboard/settings 多处 cross-vendor manual smoke 在历史 ship 时即标 DEFERRED（ADR-0008 §S3 24h carve-out），本轮如实保留为未闭合项，未声称已完成。
- Risk / follow-up: release-log 此前缺这 6 个 web 功能的 ship 历史（本条补账）；dashboard 组件移除 AC-RM-1..7 仅存在于 dev_log 未进 test.md；多处 cross-vendor smoke 矩阵未闭合（pre-cloudflare-ship 前需补）；settings baseline ship commit SHA、AI pane 是否在 ai-chat 单独追溯等列为各 PRD §9 `待确认`；pomodoro/dashboard/settings PRD + calendar 收口本条目尚未提交。

### 跨模块同步编排 v1：sync-registry + D4 / 扇出 skill

- Product line: project-system / sync
- Branch / commit: `web` / `7d26e51`
- User-visible change: 完成一个核心模块后,可用一句话「Web 版本功能已完成，执行后续同步 workflow」触发跨模块同步扇出;系统按语义规则判定该同步到哪些模块,并产出每条 lane 的 prompt / 回执,多窗口并行处理。
- Developer/system delta: 新增机读 `docs/workflow/project/sync-registry.json`(语义触发规则 + 4 类可复用动作 + 单写者文件归属 + 波次);新增 skill `xai-account-sync-scope-check`(ADR-0013 D4 范围 / 9 项完备性检查,receipt-only)与 `xai-sync-fanout-dispatch`(语义派发入口),单源置于 `.teams/skills` 并镜像到 `.claude` / `.codex`;把 `xai-release-log` 暴露给 Claude(补 `.claude/skills` symlink);新增 review 回执 `docs/reviews/clipboard-entitytype-drift/`、`docs/reviews/web-sync-2026-06-01/`(D3=W0 record-only / site=none / admin=forward-compat)。
- Verification: `node -e` 校验 sync-registry.json 为合法 JSON;两个新 skill 的 `.claude` / `.codex` symlink 解析到 SKILL.md;skill 列表确认已注册;D4 / 派发 skill 已在真实 delta 上 dry-run 跑通。
- Risk / follow-up: skill 为 receipt / plan-only,不实现同步、不解冻 paused 线、不写 entities.ts / 插件 types.ts;clipboard entityType 漂移(`clipboard.item` vs `clipboard.entry`)已开独立任务跟进。

### 治理基线对齐：ADR-0013 接受 + ADR-0014 同步编排 + ADR-0008 CSP 记账

- Product line: project-system / governance
- Branch / commit: `web` / `09d49e3`, `135183e`
- User-visible change: 分支与同步治理基线现在一致——ADR-0010 / ADR-0013 / ADR-0014 均为 Accepted;开发看板分支板的 `adr_status` 显示 Accepted。
- Developer/system delta: ADR-0013 翻为 Accepted(operator 确认,§S7 #2–#7 保留为 deferred follow-up);新增并接受 ADR-0014(跨模块同步编排:4 类动作 / 语义 registry / 单写者归属 / 冻结线护栏 / Codex 复核固化为标准一步);`branch-policy.json` `adr_status` Proposed→Accepted;`CLAUDE.md` §分支治理标题与 `PRODUCT_MODULE_MAP.md §维护` 同步;ADR-0008 补记 2026-06-01 web 批次的 `connect-src` 新 host(OpenAI / Groq / `*.ingest.sentry.io`),§S6 snippet 校正到与 `_headers` 一致并修正通配声明。
- Verification: `branch-policy.json` 校验为合法 JSON;ADR-0013 自身状态无残留 Proposed;ADR-0008 三个新 host 命中 + 通配声明已校正。
- Risk / follow-up: ADR-0008 文档暂领先代码——实现该 CSP 的 `apps/web/public/_headers` + `csp.test.ts`(CSP6)仍在未提交的 web 批次里,提交那批后代码与文档对齐;创建 desktop-next / 触及 dev 仍为 operator 确认步骤。

### 文档库必读入口和绝对路径复制

- Product line: project-system / dev-dashboard
- Branch / commit: `web` / local working tree
- User-visible change: 文档库的必读文档现在直接显示看板机器说明和看板可复用模板；推荐卡片提供复制按钮，文档详情和全屏阅读器复制的是本机绝对路径。
- Developer/system delta: `scripts/dashboard/generate-state.mjs` 输出 `repo_root` 并把两份看板治理文档提升到 must-read；`docs-library.js` 统一将仓库相对路径转换为绝对路径再复制；同步更新看板机器说明和模板文档的文档库规则。
- Verification: `node --check scripts/dashboard/generate-state.mjs` passed; `node --check docs/prototypes/dev-dashboard/js/docs-library.js` passed; `git diff --check` passed; `pnpm dashboard` passed; dashboard API returned both target docs; Chrome headless DOM dump confirmed must-read entries, copy buttons, and absolute path rendering.
- Risk / follow-up: 无。

## 2026-06-01

### 看板同步 Skill 三层对齐

- Product line: project-system / dev-dashboard
- Branch / commit: `web` / local working tree
- User-visible change: `xai-dev-dashboard-sync` 现在明确把 Overview 同步、机器说明文档对齐、可复用模板对齐作为一次运行里的三层检查；Claude Code 和 Codex 都有项目 skill 入口。
- Developer/system delta: 更新 `.teams/skills/xai-dev-dashboard-sync/SKILL.md` 的触发描述、同步范围、drift audit 和 sync receipt；新增 `.claude/skills/xai-dev-dashboard-sync` 镜像 symlink；同步更新 `CLAUDE.md`、`AGENTS.md`、`docs/workflow/project/dev-dashboard.md`、`docs/prototypes/dev-dashboard/TEMPLATE.md`、dashboard state 和 usage-guide。
- Verification: `node --check scripts/dashboard/generate-state.mjs` passed; `git diff --check` passed; Claude/Codex symlink discovery check passed; `pnpm dashboard` passed.
- Risk / follow-up: 无；Skill 仍只自动更新事实性契约/模板内容，不自动决定 roadmap、branch、priority、release gate 或 ship 状态。

## 2026-05-31

### 个人开发看板同步契约

- Product line: project-system / dev-dashboard
- Branch / commit: `web` / local working tree
- Version: dev-dashboard v0.4 → v0.5
- Added: 新增 `xai-dev-dashboard-sync` 项目 Skill、机器可读的 `docs/workflow/project/dev-dashboard.md`、可复用的 `docs/prototypes/dev-dashboard/TEMPLATE.md`。
- Improved: Overview 新增看板同步状态区，展示上次更新时间、当前快照、未提交变更、同步 Skill 状态、最新 release-log entry 和关键来源文件更新时间。
- User-visible change: 打开个人开发看板总览即可判断看板是否刚刷新、当前工作区是否有未提交变更，以及应该用哪个同步入口刷新。
- Developer/system delta: `scripts/dashboard/generate-state.mjs` 输出 `sync_status`，文档库收录看板机器说明、模板和同步 Skill；`AGENTS.md`、`CLAUDE.md`、handbook 和 usage-guide 增加看板契约入口。
- Verification: `node --check scripts/dashboard/generate-state.mjs` passed; `node --check` passed for updated dashboard JS files; `pnpm dashboard` passed; `pnpm dashboard:serve` served the dashboard locally; headless Chrome DOM/screenshot smoke at 1440px and 390px confirmed Overview renders Dashboard sync, last update time, dirty count, `xai-dev-dashboard-sync`, and latest release-log entry; staged refresh shows sync skill status as tracked.
- Risk / follow-up: `state.generated.js` 仍是本机生成快照，不作为跨机器事实源；提交后再次刷新会把 dirty count 降到剩余并行 Web 改动范围。

### 发布记录看板升级

- Product line: project-system / dev-dashboard
- Branch / commit: `web` / local working tree
- Version: dev-dashboard v0.3 → v0.4
- Added: 发布记录页拆成「整体发布记录」「模块发布卡片」「详细发布记录」三个层级；模块覆盖 Web 分支、App / Mac 桌面版本、桌面插件、账号云同步、官网、管理者 / 开发者 Dashboard。
- Improved: 整体发布记录改成接近 GitHub Release 的摘要卡片，展示发布日期、版本标记、新增功能、优化内容、修复问题、影响范围和面向用户 / 开发者的说明；详细记录中的长验证信息改为两行摘要块，避免横向撑破页面。
- Fixed: 修复本地 dashboard server 下打开 `release-log.md` 可能落到 `/workflow/project/release-log.md` 并返回 not found 的链接路径问题。
- Impact: 个人开发看板、release-log 解析脚本、本地 dashboard server、`docs/workflow/project/release-log.md` 的结构化字段。
- Audience note: 开发者可以按模块快速判断变更影响；产品使用者可以先看整体版本摘要，不必阅读细节 commit。
- User-visible change: 发布记录从单一时间线升级为模块化发布看板，并保留整体版本更新摘要。
- Developer/system delta: `scripts/dashboard/generate-state.mjs` 输出结构化 release entries / modules / overall releases；看板页面按新数据渲染多色模块卡片；server 增加 raw markdown 打开路径。
- Verification: `node --check scripts/dashboard/generate-state.mjs` passed; `node --check scripts/dashboard/serve.mjs` passed; `node scripts/dashboard/generate-state.mjs` passed; local server `GET /api/raw?path=docs/workflow/project/release-log.md` returned 200 `text/markdown`; Playwright screenshot smoke rendered overall release cards, module cards, and detailed release rows at `#release-log`; follow-up screenshots confirmed the release page no longer stretches horizontally and the product-flow right detail panel is compact.
- Risk / follow-up: 旧历史条目未必都有 Version / Added / Fixed 字段，生成器会降级使用 User-visible change 和 Developer/system delta。

### Admin Dashboard 系统接入路线图

- Product line: admin-dashboard / project-system
- Branch / commit: `web` / local working tree
- User-visible change: Admin Dashboard 原型新增系统接入计划，开发者看板的 Admin Control Plane 不再只是 `prototype only`，而是读取 6 行待办 roadmap。
- Developer/system delta: 新增 `docs/prototypes/admin-dashboard/INTEGRATION_PLAN.md` 和 `docs/workflow/roadmap/xai-admin-dashboard-system-integration.md`；`scripts/dashboard/generate-state.mjs` 将 admin roadmap 纳入 allowlist、状态计数和相关文档。
- Verification: `node scripts/dashboard/generate-state.mjs` passed; generated snapshot shows Admin `6 rows · PENDING:6`; `node --check` passed for dashboard scripts; local dashboard API served the integration plan and 6 roadmap rows.
- Risk / follow-up: 仍是规划/接入入口，不是生产 Admin surface；下一步从 `xai-admin-dashboard-shell` 开始走 Workflow V2。

## 2026-05-30

### 看板 Web 产品状态生成修正

- Product line: project-system
- Branch / commit: `web` / local working tree
- User-visible change: 产品结构图中的 Web 恢复显示为 `P0 · active` / `Web 主线`，不再被 roadmap/dev_log 统计覆盖成 `needs attention`。
- Developer/system delta: `scripts/dashboard/generate-state.mjs` 保留产品线权威 `badge/status`，把任务统计只放在 `status_counts/status_summary`；同步修正 `branch-policy.json` 中残留的 P0 carve-out 旧文案。
- Verification: `node scripts/dashboard/generate-state.mjs` passed; Chrome/Playwright smoke confirmed product-flow Web card shows `P0 · active` / `Web 主线`, no longer shows `needs attention`, detail panel matches, and branch policy page no longer exposes P0 carve-out.
- Risk / follow-up: 旧 review/carve-out 历史文档仍可能保留旧规则表述，但不作为当前看板状态源。

### Web 主线规则修正

- Product line: project-system
- Branch / commit: `web` / local working tree
- User-visible change: 修正项目规则入口，明确 `web` 分支是 Web 产品主线；Web 新功能和 bugfix 走普通 workflow，不再要求 P0 carve-out。
- Developer/system delta: 更新 `CLAUDE.md`、`docs/PLUGIN_MAP.md`、ADR-0010、ADR-0013、developer handbook 和 dashboard snapshot 文案；保留历史 carve-out/review 作为当时政策下的审计记录。
- Verification: Text audit confirmed current authority docs no longer state Web is maintenance-only or require P0 carve-out for new Web work.
- Risk / follow-up: 旧 review/carve-out 文件仍包含历史表述；它们是过去执行证据，不作为当前规则入口。

### 看板产品结构图和 branch 工作流动画

- Product line: project-system
- Branch / commit: `web` / local working tree
- User-visible change: 产品结构图补回完整产品关系流程图，Web、Mac 桌面版 App、桌面插件 / Widget、账号云同步层、官方网页、Admin Dashboard 以节点和动态连线展示；点击节点会同步右侧详情和模块选中状态。
- Developer/system delta: 新增 `product_links` 和 `branch_workflow` 快照字段；产品页增加 file:// 可用的 SVG 动态连线、节点选中动画，以及从 brief / roadmap 到 release/desktop/* 的 branch 发布工作流。
- Verification: Chrome/Playwright smoke passed: product-flow page active, 6 map nodes, 7 animated edges, 6 branch workflow steps, 6 module cards, map click updates Admin detail and module selection, module click updates map selection, release branch step updates workflow meta, direct `#release-log` hides map nodes, new release row appears, and 390px mobile overflow check passed.
- Risk / follow-up: 仍是静态流程快照；后续可把 branch 工作流节点接到真实 git branch、roadmap manifest 和 release gate 状态。

### 看板操作化和自动跟踪 v0

- Product line: project-system
- Branch / commit: `web` / local working tree
- User-visible change: 总览页从说明型文案改成个人工作流控制台，补齐 Web、Mac 桌面版 App、桌面插件 / Widget、账号云同步层、官方网页、Admin Dashboard 六个独立模块。
- Developer/system delta: 新增 `docs/workflow/project/dashboard-state.json` 和 `scripts/dashboard/generate-state.mjs`，生成 `docs/prototypes/dev-dashboard/state.generated.js` 供 file:// 静态看板读取；自动事实和人工决策字段分开。
- Verification: Chrome/Playwright smoke passed: forbidden explanatory hero/topbar phrases absent, overview KPI renders, overview card opens product page, 6 module cards render, Admin detail opens, direct `#release-log` hides product cards, release row appears, and 390px mobile overflow check passed.
- Risk / follow-up: 自动跟踪 v0 仍是生成快照，不是后台实时服务；后续可以接入 roadmap manifest、dev_log 和 release gate。

### 看板移除内部说明头部

- Product line: project-system
- Branch / commit: `web` / local working tree
- User-visible change: 移除看板顶部的文件路径、中文优先说明、Gemini 风格说明和 P1/Web 状态标签，让页面只保留导航和当前分页内容。
- Developer/system delta: 删除 `topbar` / `crumb` / `toolbar` 结构及样式，避免把实现说明暴露在操作界面。
- Verification: Chrome/Playwright smoke passed: topbar removed, internal top text absent, `#release-log` page still works, product page switch still works, and 390px mobile overflow check passed.
- Risk / follow-up: 无。

### 看板分页导航

- Product line: project-system
- Branch / commit: `web` / local working tree
- User-visible change: 左侧导航从锚点长滚动改为分页切换；点击总览、产品结构图、手册和 skill、分支管理、发布 log 时只显示对应页面。
- Developer/system delta: 新增 `data-page` / `data-page-section` 路由、active nav 状态和 hash 同步，避免所有模块堆在一个超长页面里。
- Verification: Chrome/Playwright page-switch smoke passed: direct `#release-log` load, sidebar page switching, hidden inactive pages, docs reader visibility, product card click, and 390px mobile overflow check.
- Risk / follow-up: 仍是静态 HTML，看板内容刷新后续再接 roadmap / release log 自动数据源。

### 看板产品线模块跟踪

- Product line: project-system
- Branch / commit: `web` / local working tree
- User-visible change: 产品区从关系节点图调整为 5 条顺序模块 tracking card：Web、Mac 桌面版 App、桌面整理插件 / Widget、账号云同步层、官方网页。
- Developer/system delta: 每个模块独立展示状态、推荐 branch、依赖、下一步和跟踪字段；点击模块后右侧展示详细定位和关系。
- Verification: Chrome/Playwright static smoke passed: 5 module cards, official-site detail branch escaping, 4 detail metrics, desktop module overflow check, branch overflow check, and 390px mobile overflow check.
- Risk / follow-up: 模块状态仍是静态 snapshot；后续需要把 roadmap 或 release log 自动汇入模块状态。

### 个人开发看板 v0

- Product line: project-system
- Branch / commit: `web` / local working tree
- User-visible change: 新增中文优先的单人开发看板，包含产品结构流程图、文档分页阅读器、skill 说明、branch 管理说明和发布 log 面板。
- Developer/system delta: 看板从暗色工程面板改为蓝白浅色控制台；产品线、branch、Workflow V2、D3 gate、release log 进入同一个导航入口。
- Verification: Chrome/Playwright static smoke passed: product-node click animation, document pagination, release rows, skill rows, branch overflow check, and 390px mobile overflow check.
- Risk / follow-up: 看板仍是静态 prototype；真实 roadmap 状态后续需要自动或半自动刷新。

### 发布日志 skill

- Product line: project-system
- Branch / commit: `web` / local working tree
- User-visible change: 增加 `xai-release-log`，用于按日期记录功能增量、系统变更、验证结果和后续风险。
- Developer/system delta: 新增 `.teams/skills/xai-release-log/SKILL.md`，并把 `docs/workflow/project/release-log.md` 作为日志权威文件。
- Verification: `rg` docs audit confirmed handbook, dashboard, release log, and skill references.
- Risk / follow-up: 后续 ship 或系统治理变更需要把 release log 纳入收口检查。
