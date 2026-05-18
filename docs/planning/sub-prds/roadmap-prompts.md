# 子 PRD → roadmap-loop 调用 prompt 集

> 创建日期:2026-05-18
> 用途:把 3 份子 PRD(Sync / Console / Web)分别灌入 `xai-roadmap-loop` skill 的 `init` 模式,产出 3 份 roadmap manifest,然后逐波 `run`。
> 配套:`docs/workflow/_portable/06-roadmap-orchestration.md`(协议)+ `docs/workflow/_portable/usage-guide.md` §6(实操)+ `docs/workflow/_portable/07-automation-mode-picker.md`(Automation Mode 选择)

---

## 0. Pre-flight — 必须先满足的 4 件事

照本节顺序检查 / 修补,缺一不可:

| # | 项 | 检查命令 / 操作 |
|---|---|---|
| 1 | 15 个 worker agents 已 register | `ls .claude/agents/` 应见 15 个 .md(已具备) |
| 2 | **`xai-roadmap-loop` skill 已 land** | `ls .claude/skills/xai-roadmap-loop/SKILL.md`(可能未具备,从 `docs/workflow/_portable/06-roadmap-orchestration.md` 文档**最末附录的 SKILL.md draft** 拷贝,把所有 `<skill_prefix>` 替换为 `xai-`,放到 `.claude/skills/xai-roadmap-loop/SKILL.md`) |
| 3 | **`xai-feature-brief` skill 已 land**(Step 0) | 同上,从 `_portable/03-step0-brief-spec.md` 取规格,生成 SKILL.md;每个 feature 进 `feature-plan` 前都会被自动调用 |
| 4 | manifest 目录已建 | `mkdir -p docs/workflow/project/roadmap/`(roadmap manifest 落地处)+ `mkdir -p docs/reviews/`(Step 0 feature-brief 落地处) |

> 注:第 2、3 项 SKILL.md draft 在 portable 文档里是带占位符的,land 之前**必须**全文件搜索替换 `<skill_prefix>` → `xai-` 一次。

**如果你的项目 skill 前缀不是 `xai-`**,把下方 prompts 里所有 `xai-` 字样替换为你的实际前缀。

---

## 1. 跑 3 个 roadmap 的总顺序

```
Sync init      → 人工 review manifest → Sync   run wave 0 → batch ship → Sync   run wave 1 → ...
                                          (Sync 骨架到位 Phase 0 子阶段 0.3 完成后,Console 可启动)
                                                                                  ↓
                                                  Console init → 人工 review → Console run wave 0 → ...
                                                  (Console 主体完成 Phase 2.5 后,Web 可启动)
                                                                                  ↓
                                                          Web init → 人工 review → Web run wave 0 → ...
```

**关键依赖**:
- **Console 启动**需要 Sync **骨架版本** ready(账号注册登录 + 单表同步打通,Phase 0 子阶段 0.3 末)
- **Web 启动**需要 Console **三栏外壳 + 业务模块** 全部 Stable(Phase 2.5 末)+ Sync **完整版本** ready(Phase 5)

所以**不要并行** 3 个 roadmap。这就是为什么有"3 个 sub-PRD + 3 份 manifest",而不是"1 个大 roadmap"。

---

## 2. Sync — 跑 First(R-10 高风险,先把协议落地)

### 2.1 init 命令(粘到 Claude Code 主会话)

```text
/xai-roadmap-loop
mode: init
input_kind: prd
source: docs/planning/sub-prds/sync/PRD.md
roadmap_name: sync-v1
extra_context:
  - docs/planning/sub-prds/sync/dev-plan.md
  - docs/TECHNICAL_REQUIREMENTS.md
  - docs/SYSTEM_ARCHITECTURE.md
  - docs/PLUGIN_SDK.md
  - docs/adr/0002-dual-track-release.md
notes: |
  这是端到端加密同步层的全集 PRD,产物路径 packages/plugin-account/ + packages/core-data/(REST driver)。
  分两个 Phase:
    - Phase 0 子阶段 0.3:Supabase 骨架 + 账号注册登录 + 单表同步打通(2 周)
    - Phase 5:E2E 协议完整 + Realtime + 冲突 + 离线 + 多设备(3-4 周)
  R-10 是 v1 第二高风险(仅次于 R-00 透明 overlay)。
  PRD §11 已把 R-10 分解为 R-10.1~R-10.8 + 新增 R-12~R-18 共 14 项。
  请按密码学最佳实践拆 feature(密钥层级、AES-GCM nonce 管理、KEK/DEK 分离、HPKE per-device wrap、
  Ed25519 recovery、Realtime channel 安全、RLS、凭据轮换、恢复演练 等)。
  每个 feature 都要在 seed brief 写清"密码学组件"与"威胁模型对应威胁 ID"。
```

### 2.2 manifest review 自查清单(init 停下后必看)

打开 `docs/workflow/project/roadmap/sync-v1.md`,逐项检查:

- [ ] **Decomposition Rationale 章节**清楚标了哪些 feature 来自 PRD §5.x 哪个 FR 群,有没有合并错的
- [ ] **wave 0**(可启动 feature)只含**纯 Rust / 纯协议骨架**(如 `argon2id-kek-derivation` / `aes-gcm-blob-codec` / `supabase-schema-skeleton`),不含 Realtime / Edge Function
- [ ] **Phase 0 vs Phase 5** 拆分清楚:Phase 0 子集标 `wave: 0~1`,Phase 5 完整标 `wave: 2+`
- [ ] 每个 feature 的 `dependencies` 链合理(`per-device-wrap` 在 `hpke-base` 之后;`recovery-flow` 在 `ed25519-signing` 之后)
- [ ] 每个 feature 的 seed brief 都引用了**至少 1 条威胁模型 ID**(如 "缓解 §2 A4 服务端被攻破")
- [ ] **fuzz 24h** 和**3 次恢复演练**是独立 feature,不是验收附加项
- [ ] `Default Automation Mode:` 设为 **`A-Claude`**(密码学代码不交给外部 CLI,审计成本高)
- [ ] `Verify Cross-vendor:` 设为 **`yes`**(verify 必须用另一个执行者,防同一执行者自证正确)
- [ ] BLOCKED_EXTERNAL 行有没有 — 期待会有 1~2 个(Supabase 项目实例 + Apple Developer 账号)

如果有 5+ 处需要调整,直接手编 manifest;如果根本性走偏(比如把 Phase 5 features 全塞进 wave 0),重跑 `init` 并补 `notes`。

### 2.3 run 命令(每波)

```text
/xai-roadmap-loop
manifest: docs/workflow/project/roadmap/sync-v1.md
```

会打出 N 个 `feature-full-loop` 启动 block(N = 当波可启动 feature 数)。

**强制**:每个 block 单独开**新会话**粘贴执行。不要在同一会话里跑多个,会撞 dev_log 写权限。

### 2.4 batch ship(每波末)

每个 SHIPPED queue 里的 feature 都跑一次:

```text
Start the ship agent for <slug>.
```

`ship` 强制人工确认 push。同会话顺次 ship 一波是 OK 的。

### 2.5 Sync 完成判定

`sync-v1.md` 状态机走到 `ALL_SHIPPED` 且通过下面 3 个 gate:
- fuzz harness 跑满 24 小时,0 crash + 0 panic
- 3 次恢复演练(主密码丢失 / 服务端数据库 dump / 单设备被吊销)全部按 rehearsal script 通过
- RLS audit checklist 全勾(详见 sync PRD dev-plan §6)

---

## 3. Console — 跑 Second(Sync 骨架到位后启动)

### 3.1 init 命令

```text
/xai-roadmap-loop
mode: init
input_kind: prd
source: docs/planning/sub-prds/console/PRD.md
roadmap_name: console-v1
extra_context:
  - docs/planning/sub-prds/console/dev-plan.md
  - docs/PLUGIN_SDK.md
  - docs/SYSTEM_ARCHITECTURE.md
  - docs/TECHNICAL_REQUIREMENTS.md
  - docs/adr/0003-three-faces-architecture.md
  - docs/planning/sub-prds/sync/PRD.md   # Console 需要消费 sync 的 account events
notes: |
  这是 XAI_Desktop 整体控制台(独立三栏窗口)子产品的全集 PRD,Phase 2.5。
  产物路径 packages/plugin-console/(三栏外壳)+ 各业务 plugin 的 ConsoleView slot。
  关键:Console 本身不带新功能,而是聚合 productivity / labels / calendar / project /
  clipboard / widgets 等业务 plugin 的 ConsoleView。
  每个 feature 要么是"三栏外壳级"(plugin-console 内),要么是"某业务 plugin 的 ConsoleView 实现"。
  请按"先骨架后填充"拆 feature:
    wave 0:三栏外壳基础、sidebar 导航壳、PluginRegistry ConsoleView slot
    wave 1+:逐 plugin 实现 ConsoleView(productivity/labels/calendar/project/...)
    wave 末:全局 Cmd+K 搜索、通知中心、设置面板、键盘流总验收
  依赖 sync 子 roadmap 的 wave 0~1(账号登录 + Realtime 订阅基础)已 SHIPPED。
  每个 feature 的 seed brief 要写清"承载的 ConsoleView 类型"和"键盘流契约"。
```

### 3.2 manifest review 自查清单

- [ ] **wave 0** 只含"三栏外壳骨架"(无业务模块视图),业务 ConsoleView 都在 wave 1+
- [ ] 每个 plugin 的 ConsoleView 是**独立 feature**(不要把 productivity 的 ConsoleView 和 calendar 的 ConsoleView 合并)
- [ ] sidebar 8 个模块(Todo / 日历 / 四象限 / 番茄 / 习惯 / 项目管理 / Label / 搜索 / 设置)每个都有对应 feature
- [ ] **依赖 sync-v1** 的 feature 用 `external_dependencies: [sync-v1#account-login, sync-v1#realtime-channel]` 标出
- [ ] 性能预算 feature(冷启动 trace、模块切换 60fps 验证)独立成 feature,不要塞进其他 feature
- [ ] empty / error states 是独立横向 feature(一次性给所有模块加),不要每个模块各加一次
- [ ] `Default Automation Mode:` 设为 **`D-Codex+Cursor`**(UI heavy 代码,quota 弹性高)
- [ ] `Verify Cross-vendor:` 设为 **`yes`**
- [ ] 与主 PRD §10.2 M3 里程碑日期(2026-09-01)对齐,如果 wave 数 × 平均周期超了要砍 P1 features

### 3.3 run 命令

```text
/xai-roadmap-loop
manifest: docs/workflow/project/roadmap/console-v1.md
```

### 3.4 Console 完成判定

- `console-v1.md` 状态 ALL_SHIPPED
- 真机验收:全键盘可达 / 多显示器 / 与 overlay 数据实时一致 / 公证后首启无弹窗
- 性能基准达标:冷启动 < 2s P50,模块切换 < 100ms P50

---

## 4. Web — 跑 Third(Console + Sync 都完成后启动)

### 4.1 init 命令

```text
/xai-roadmap-loop
mode: init
input_kind: prd
source: docs/planning/sub-prds/web/PRD.md
roadmap_name: web-v1
extra_context:
  - docs/planning/sub-prds/web/dev-plan.md
  - docs/planning/sub-prds/console/PRD.md   # Web 复用 Console UI
  - docs/planning/sub-prds/sync/PRD.md      # Web 跑同一份 Sync 协议
  - docs/PLUGIN_SDK.md
  - docs/adr/0003-three-faces-architecture.md
  - docs/TECHNICAL_REQUIREMENTS.md
notes: |
  这是 XAI_Desktop 网页版子产品的全集 PRD,Phase 4.5。
  产物路径 apps/web/(Vite SPA 入口)+ packages/core-data/ 的 REST driver(已在 sync-v1 完成)
  + 各业务 plugin 的 WebView slot(若与 ConsoleView 不同)。
  心智模型:Web = Console React 组件树 + 浏览器壳 + REST data driver + 浏览器特有约束。
  请按浏览器特有维度拆 feature:
    wave 0:Vite SPA 入口、apps/web 脚手架、Supabase Auth web 集成、REST driver wire-up
    wave 1:复用 Console 模块的 WebView(逐 plugin)、路由与深链接
    wave 2:Service Worker + IndexedDB 离线 + 离线队列
    wave 3:响应式断点、PWA、Web Vitals 验收、CSP 加固
    wave 末:部署管线、staging、回滚演练、GDPR、监控
  依赖:console-v1 ALL_SHIPPED + sync-v1 ALL_SHIPPED(包括 fuzz 24h + 恢复演练)。
  每个 feature 的 seed brief 要写清"用到的浏览器 API"+"兼容性矩阵特殊处理"。
```

### 4.2 manifest review 自查清单

- [ ] **wave 0** 只含 Web 脚手架 + 数据 driver 切换,无 UI 复用 feature
- [ ] 每个业务 plugin 的 WebView 在 manifest 里**显式有一行**(productivity-web-view / labels-web-view / ...),哪怕实现就是 "= ConsoleView"
- [ ] **依赖 console-v1 + sync-v1** 用 `external_dependencies` 写清,缺一阻塞 wave 0
- [ ] Service Worker / IndexedDB / 离线队列 是**独立的 wave 2 feature**,不要并入其他 wave
- [ ] CSP / HSTS / Cookie 安全 是独立 hardening feature,不要塞进 auth flow
- [ ] **Lighthouse / Web Vitals 验收** 是独立 verification feature
- [ ] **3 浏览器矩阵测试**(Chrome / Safari / Firefox)是独立 feature,各占 1 个 slot
- [ ] **回滚演练 + staging 切流量**是 wave 末 feature
- [ ] `Default Automation Mode:` 设为 **`D-Codex+Cursor`**
- [ ] `Verify Cross-vendor:` 设为 **`yes`**
- [ ] 与主 PRD §10.2 M5(公测 2026-11-24)对齐,留出 2 周公测窗口

### 4.3 run 命令

```text
/xai-roadmap-loop
manifest: docs/workflow/project/roadmap/web-v1.md
```

### 4.4 Web 完成判定

- `web-v1.md` 状态 ALL_SHIPPED
- 3 浏览器矩阵测试全部 pass(无 P0/P1 bug)
- Lighthouse: Performance ≥ 85 / Accessibility ≥ 95 / Best Practices ≥ 95 / SEO ≥ 90
- Web Vitals: LCP < 2.5s / FID < 100ms / CLS < 0.1(75 percentile)
- 同账号在 Web 和桌面 App 真机双向同步 < 5s

---

## 5. 三大常见坑(每跑一个 roadmap 都要避开)

### 5.1 不要在同一个 Claude Code 会话里 spawn meta-orchestrator

`SUBAGENT_WORKFLOW_V2.md` 里已经记录:`feature-full-loop` / `bugfix-full-loop` 被 spawn 时 Claude Code 不给 Task 工具,会立即 BLOCKED。所以:

- ❌ 不要让主会话 Task-spawn `feature-full-loop`
- ✅ 让 main session 直接当 orchestrator,顺序 Task-spawn `feature-plan` → `feature-review` → `feature-auto-build` → `feature-verify`,每步间读 dev_log

但 `xai-roadmap-loop` skill 本身**不会**spawn meta-orchestrator,它默认走 `dispatch: emit-prompts`,只是把 N 个 block 打到 stdout,你在 **N 个新会话**里粘贴执行。这就绕开了运行时约束。

### 5.2 子 roadmap 之间的依赖是"全 SHIPPED 等待",不是"骨架就够了"

虽然 Console 的 init 时机可以早(Sync 骨架到位即可),但 **Console wave 0 真正执行**需要 sync-v1 里被 Console 依赖的具体 feature(account-login / realtime-channel / sqlite-schema)处于 `Status: SHIPPED`。`xai-roadmap-loop run` 会检查 `external_dependencies` 字段,缺一不发 block。

### 5.3 init 之后必须**真的人工审 manifest**

`init` 决定的是 wave 切分 + 依赖图,一旦进入 run 模式很难回头。**重点审 3 件事**:

1. 每个 feature 是否真的"原子" —— 单一团队能在 1-3 天内完成?
2. 依赖图有没有死环 —— `xai-roadmap-loop init` 会拒绝写带环 manifest,但**事实性**依赖错位(A 应在 B 之前但写反了)它检不出
3. wave 间能否真"并行" —— 同 wave 的 features 是否共享某未列依赖(如同一个 plugin 包内的 conflict)

---

## 6. 紧急情况:roadmap-loop skill 还没 land 怎么办?

如果 §0 的 Pre-flight #2 / #3 失败(skill 没 land),有两个救火方案:

**方案 A — 现在 land 这两个 skill(推荐)**

按 `docs/workflow/_portable/06-roadmap-orchestration.md` 文档最末附录的 SKILL.md draft + `_portable/03-step0-brief-spec.md` 的规格,把两份 SKILL.md 放到 `.claude/skills/xai-roadmap-loop/` 和 `.claude/skills/xai-feature-brief/`,替换 `<skill_prefix>` → `xai-`。约 30 分钟工作量。

**方案 B — 暂时退回 Level 1 手工分发**

每个 sub-PRD 自己拆 N 个 feature(看子 PRD 自带的 dev-plan §3 任务分解),然后对每个 feature:

```text
Start the feature-plan agent for <slug>.
Attached brief: docs/planning/sub-prds/<surface>/dev-plan.md (relevant phase)
Constraints: <hard constraints from the PRD>
```

完成 plan → review → 你 confirm → build → verify → ship 的标准 5 步循环。每个 feature 之间手工切。

方案 B 适合**只跑 Sync wave 0**(最关键的密码学骨架,无论如何要保住),后面 Console / Web 等 roadmap-loop 落地了再上 Level 3。

---

## 7. 一句话总结

```
land 2 个 skill → Sync init+review → Sync run × N + ship → Console init+review →
Console run × N + ship → Web init+review → Web run × N + ship → v1 GA
```

每个 `init` 后停下**真审 manifest**,每个 `run` 后开 N 个新会话并行执行,每波末 batch ship。
