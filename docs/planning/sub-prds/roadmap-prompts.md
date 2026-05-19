# 子 PRD → roadmap-loop 调用 prompt 集

> 创建日期:2026-05-18
> 用途:把 3 份子 PRD(Sync / Console / Web)分别灌入 `xai-roadmap-loop` skill 的 `init` 模式,产出 3 份 roadmap manifest,然后逐波 `run`。
> 配套:`docs/workflow/_portable/06-roadmap-orchestration.md`(协议)+ `docs/workflow/_portable/usage-guide.md` §6(实操)+ `docs/workflow/_portable/07-automation-mode-picker.md`(Automation Mode 选择)

---

## 0. Pre-flight — 必须先满足的 4 件事

照本节顺序检查,缺一不可:

| # | 项 | 检查命令 / 操作 |
|---|---|---|
| 1 | 15 个 worker agents 已 register | `ls .claude/agents/` 应见 15 个 .md(已具备) |
| 2 | **`xai-roadmap-loop` skill 已 land** | `ls .claude/skills/xai-roadmap-loop/SKILL.md`(已具备;来源 `.teams/skills/xai-roadmap-loop/SKILL.md`) |
| 3 | **`xai-feature-brief` / `xai-feature-full-loop` skills 已 land** | `ls .claude/skills/xai-feature-brief/SKILL.md .claude/skills/xai-feature-full-loop/SKILL.md`(已具备) |
| 4 | manifest 目录已建 | `mkdir -p docs/workflow/roadmap/`(roadmap manifest 落地处)+ `mkdir -p docs/reviews/`(Step 0 feature-brief 落地处) |

> 注:`roadmap_name:` 在下面的 init prompt 里保留为命名 hint。若 skill 报不识别该字段,删除这一行并让它从 `source:` 文件名推断 manifest 名。

**如果你的项目 skill 前缀不是 `xai-`**,把下方 prompts 里所有 `xai-` 字样替换为你的实际前缀。

---

## 0.5 项目可用的 Claude skill(用于 init 预热)

`.claude/skills/` 下已 register 的 portable public skills + XAI project-layer skills,按对哪个子 roadmap 最有杠杆做映射:

| Skill | 描述 | Sync | Console | Web |
|---|---|:-:|:-:|:-:|
| `codebase-explorer` | 在不熟的代码库里 orient + 出 module 图 + 总结约定 | ✅ | ✅ | ✅ |
| `planning-with-files` | 持久化 task_plan.md(survive context reset 的 day-level 进度) | ✅ | ✅ | ✅ |
| `superpowers` | plan-first / subagent 分解(和 roadmap-loop init 同理念) | ✅ | ✅ | ✅ |
| `security-skills-claude-code` | STRIDE 威胁建模 + 攻击面枚举 + 依赖 CVE 检查 | ✅✅ | — | ✅ |
| `frontend-dev` | Tailwind utility-first + Framer Motion + 语义组件组合 | — | ✅✅ | ✅✅ |
| `composition-patterns` | compound / render-prop / slot 模式;避免 boolean prop 泛滥 | — | ✅✅ | ✅ |
| `gh-fix-ci` | GitHub Actions / 部署管线 fail 时定位 | ✅ | ✅ | ✅✅ |
| `skill-creator` | 写 / 编辑 / 测 SKILL.md(meta) | — | — | — |
| `agent-behavioral-guidelines` | 小改动 / surgical edit / 不 over-engineer / 每步验证 | ✅ | ✅ | ✅ |

**使用模式**:每个子 roadmap 的 prompt 都有一节 §X.0 "init 之前的 skill 预热",列出该 roadmap 应该先跑哪几个 skill,产出报告;init 命令把这些报告路径和希望参考的 skill 写进 `notes:`。新版 `xai-roadmap-loop` 没有 `extra_context:` / `skills_during_decomposition:` 字段。

**run 模式 dispatch**:不要在 prompt 里预写 `dispatch:`。新版 `xai-roadmap-loop` 每次 run 都会先用中文确认 `emit` / `bg` / `serial` / `spawn` 四种模式。推荐选择:

- Sync:默认选 `bg`；如果 worktree / smoke test 没过,选 `emit`。
- Console:推荐 `bg`；ConsoleView 多 feature 波次适合 Agent View 并行。
- Web:推荐 `bg`；部署 / PWA / responsive / security hardening 可按 wave 并行。

`bg` 模式 preflight:工作树干净,或 `git config worktree.baseRef head`,或 prompt 内联了所有必要内容;manifest header `BG Direct Verified: yes` 或先完成 `claude --bg` smoke test;确认 `Wave Concurrency Cap` 足够,默认 3,超出会标 `QUEUED_BG`。

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

### 2.0 init 之前的 skill 预热(强烈建议)

Sync 是密码学协议层,**STRIDE 威胁建模 + 项目结构 orient** 必须先跑。按顺序在主会话敲:

```text
Skill: codebase-explorer
焦点:packages/plugin-account/ + packages/core-data/ + apps/desktop/src-tauri/ 的当前状态;
绘出未来 Sync 落地涉及的所有模块入口点 + 已有的事件命名约定。
```

```text
Skill: security-skills-claude-code
任务:对 docs/planning/sub-prds/sync/PRD.md 跑一次 STRIDE × Trust Boundary 分析,
特别看 §2 已列的 9 个攻击者有没有 STRIDE 维度漏(尤其 Tampering / Repudiation / EoP)。
另外:列 packages/plugin-account/ 已计划引入的依赖(argon2、aes-gcm、x25519、ed25519、
hpke、sqlcipher、supabase-rs)各自的最近 CVE 状态。
```

```text
Skill: planning-with-files
任务:给 sync-v1 创建一份持久化 task_plan.md(放 docs/workflow/roadmap/sync-v1.tasks.md),
roadmap manifest 是 wave/feature 视图,task_plan.md 是 day-level 进度视图,两者互补。
```

```text
Skill: superpowers
触发:对 Sync 协议这种"动手前必须先想清楚"的工作,先用 plan-first 分解。
```

三个 skill 跑完(尤其 STRIDE 报告)之后,把它们的产物贴进下方 init 命令的 `extra_context` 里。

### 2.1 init 命令(粘到 Claude Code 主会话)

```text
/xai-roadmap-loop
mode: init
input_kind: prd
source: docs/planning/sub-prds/sync/PRD.md
roadmap_name: sync-v1
notes: |
  额外上下文:
    - docs/planning/sub-prds/sync/dev-plan.md
    - docs/TECHNICAL_REQUIREMENTS.md
    - docs/SYSTEM_ARCHITECTURE.md
    - docs/PLUGIN_SDK.md
    - docs/adr/0002-dual-track-release.md
    - <把 §2.0 codebase-explorer 产出的 orientation 报告路径填这里>
    - <把 §2.0 security-skills-claude-code 产出的 STRIDE + CVE 报告路径填这里>
  分解时请参考 security-skills-claude-code 的 STRIDE 结果,确保每条 FR 对应到威胁缓解;
  同步维护 docs/workflow/roadmap/sync-v1.tasks.md;保持 superpowers 的 plan-first 分解心智。

  这是端到端加密同步层的全集 PRD,产物路径 packages/plugin-account/ + packages/core-data/(REST driver)。
  分两个 Phase:
    - Phase 0 子阶段 0.3:Supabase 骨架 + 账号注册登录 + 单表同步打通(2 周)
    - Phase 5:E2E 协议完整 + Realtime + 冲突 + 离线 + 多设备(3-4 周)
  R-10 是 v1 第二高风险(仅次于 R-00 透明 overlay)。
  PRD §11 已把 R-10 分解为 R-10.1~R-10.8 + 新增 R-12~R-18 共 14 项。
  请按密码学最佳实践拆 feature(密钥层级、AES-GCM nonce 管理、KEK/DEK 分离、HPKE per-device wrap、
  Ed25519 recovery、Realtime channel 安全、RLS、凭据轮换、恢复演练 等)。
  每个 feature 都要在 seed brief 写清"密码学组件"+"威胁模型对应威胁 ID"+"STRIDE 维度"。
  生成 wave 划分时,wave 0 必须只含纯算法/纯协议骨架(无 Realtime / Edge Function)。
```

### 2.2 manifest review 自查清单(init 停下后必看)

打开 `docs/workflow/roadmap/sync-v1.md`,逐项检查:

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
manifest: docs/workflow/roadmap/sync-v1.md
```

skill 会先弹中文 dispatch 确认。Sync 推荐选 `bg`;如果 bg preflight 没过,选 `emit`。

`emit` 会打出 N 个 `/xai-feature-full-loop` 启动 block(N = 当波可启动 feature 数),格式类似:

```text
/xai-feature-full-loop
Feature: <slug>
Automation Mode: <resolved mode>
Verify Cross-vendor: <yes|no>
Requirement: <resolved requirement>
```

`emit` 模式下,每个 block 单独开**新会话**粘贴执行。不要在同一会话里跑多个,会撞 dev_log 写权限。`bg` 模式下由 `claude --bg --name ...` 启后台 session,用 Agent View 监控,每波末按 skill 输出的 bg-aware ship block 收口。

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

### 3.0 init 之前的 skill 预热

```text
Skill: codebase-explorer
焦点:packages/plugin-organizer/、packages/core/(已有 plugin 体系起点)的当前实现;
绘出 ConsoleView slot 落地后,每个业务 plugin 需要新增 / 改造的文件清单。
特别关注 packages/plugin-* 已有的 events 命名是否符合 PLUGIN_SDK.md §4 EventMap 规范。
```

```text
Skill: frontend-dev
任务:为 Console 三栏 + 各模块 ConsoleView 准备视觉 / 交互设计标准 ——
Tailwind utility 选型、Framer Motion 过渡动画时长、空状态 / 错误状态的组件模板、
紧凑 / 标准 / 宽松密度的 token 表。
```

```text
Skill: composition-patterns
任务:为 plugin-console 三栏外壳 + 各 plugin ConsoleView slot 设计组合方案;
明确用 compound components(三栏整体) + slot pattern(ConsoleView 注入) + render prop
(sidebar 自定义渲染)中的哪几个,避免 boolean prop proliferation。产出一份 RFC 短文。
```

```text
Skill: planning-with-files
任务:为 console-v1 创建 docs/workflow/roadmap/console-v1.tasks.md
```

```text
Skill: superpowers
触发:plan-first / subagent 分解
```

### 3.1 init 命令

```text
/xai-roadmap-loop
mode: init
input_kind: prd
source: docs/planning/sub-prds/console/PRD.md
roadmap_name: console-v1
notes: |
  额外上下文:
    - docs/planning/sub-prds/console/dev-plan.md
    - docs/PLUGIN_SDK.md
    - docs/SYSTEM_ARCHITECTURE.md
    - docs/TECHNICAL_REQUIREMENTS.md
    - docs/adr/0003-three-faces-architecture.md
    - docs/planning/sub-prds/sync/PRD.md   # Console 需要消费 sync 的 account events
    - <把 §3.0 codebase-explorer 产出的 orientation 报告路径填这里>
    - <把 §3.0 composition-patterns 产出的三栏 RFC 路径填这里>
    - <把 §3.0 frontend-dev 产出的视觉/交互 token 表路径填这里>
  分解时请参考 composition-patterns 区分"外壳级"vs"slot 注入级";参考 frontend-dev
  保持每个 ConsoleView 的视觉/动效一致性;同步维护 docs/workflow/roadmap/console-v1.tasks.md;
  保持 superpowers 的 plan-first 分解心智。

  这是 XAI_Desktop 整体控制台(独立三栏窗口)子产品的全集 PRD,Phase 2.5。
  产物路径 packages/plugin-console/(三栏外壳)+ 各业务 plugin 的 ConsoleView slot。
  关键:Console 本身不带新功能,而是聚合 productivity / labels / calendar / project /
  clipboard / widgets 等业务 plugin 的 ConsoleView。
  每个 feature 要么是"三栏外壳级"(plugin-console 内),要么是"某业务 plugin 的 ConsoleView 实现"。
  请按"先骨架后填充"拆 feature:
    wave 0:三栏外壳基础、sidebar 导航壳、PluginRegistry ConsoleView slot
    wave 1+:逐 plugin 实现 ConsoleView(productivity/labels/calendar/project/...)
    wave 末:全局 Cmd+K 搜索、通知中心、设置面板、键盘流总验收
  Console wave 1+ 可能一次有 6+ 个 plugin ConsoleView feature;若 run 时选择 bg 并希望更高并发,
  review manifest 时可把 header `Wave Concurrency Cap:` 从默认 3 调到 6。
  依赖 sync 子 roadmap 的 wave 0~1(账号登录 + Realtime 订阅基础)已 SHIPPED。
  每个 feature 的 seed brief 要写清"承载的 ConsoleView 类型"、"键盘流契约"、
  "用到的 composition pattern(compound/slot/render-prop 之一)"。
```

### 3.2 manifest review 自查清单

- [ ] **wave 0** 只含"三栏外壳骨架"(无业务模块视图),业务 ConsoleView 都在 wave 1+
- [ ] 每个 plugin 的 ConsoleView 是**独立 feature**(不要把 productivity 的 ConsoleView 和 calendar 的 ConsoleView 合并)
- [ ] sidebar 8 个模块(Todo / 日历 / 四象限 / 番茄 / 习惯 / 项目管理 / Label / 搜索 / 设置)每个都有对应 feature
- [ ] **依赖 sync-v1** 的 feature 在 `Note` 标 `blocked-by: sync-v1#account-login + sync-v1#realtime-channel SHIPPED`;`xai-roadmap-loop` 不会自动跨 manifest 检查,按 §1 总顺序人工守门
- [ ] 性能预算 feature(冷启动 trace、模块切换 60fps 验证)独立成 feature,不要塞进其他 feature
- [ ] empty / error states 是独立横向 feature(一次性给所有模块加),不要每个模块各加一次
- [ ] `Default Automation Mode:` 设为 **`D-Codex+Cursor`**(UI heavy 代码,quota 弹性高)
- [ ] `Verify Cross-vendor:` 设为 **`yes`**
- [ ] 与主 PRD §10.2 M3 里程碑日期(2026-09-01)对齐,如果 wave 数 × 平均周期超了要砍 P1 features

### 3.3 run 命令

```text
/xai-roadmap-loop
manifest: docs/workflow/roadmap/console-v1.md
```

skill 会先弹中文 dispatch 确认。Console 推荐选 `bg`;如果想保守人工分发,选 `emit`。

### 3.4 Console 完成判定

- `console-v1.md` 状态 ALL_SHIPPED
- 真机验收:全键盘可达 / 多显示器 / 与 overlay 数据实时一致 / 公证后首启无弹窗
- 性能基准达标:冷启动 < 2s P50,模块切换 < 100ms P50

---

## 4. Web — 跑 Third(Console + Sync 都完成后启动)

### 4.0 init 之前的 skill 预热

```text
Skill: codebase-explorer
焦点:apps/web/ 当前的 scaffold 状态、packages/core-data/ 的 REST driver 已落地情况、
packages/plugin-console/ 哪些组件已可平台无关复用;给出 Web 启动时需要新增的目录骨架草图。
```

```text
Skill: frontend-dev
任务:为 Web 端响应式断点(桌面 / 平板 / 手机只读)+ PWA shell + Service Worker 提示
产出视觉/交互模板。包含 Lighthouse Performance 优化清单(LCP / FID / CLS 目标对应的具体技术决策)。
```

```text
Skill: composition-patterns
任务:确认 ConsoleView slot 复用方案在浏览器壳下不变 —— 哪些组件必须做平台分支
(如 macOS Cmd 键 vs Web Ctrl 键的键盘流),哪些可零改动复用。
```

```text
Skill: security-skills-claude-code
任务:对 docs/planning/sub-prds/web/PRD.md 跑一次 Web 视角的 STRIDE:
- 浏览器端 KEK 内存驻留的 攻击面(XSS / Service Worker hijack / 跨标签)
- Cookie / Session 治理(SameSite / Secure / HttpOnly / token 存储位置)
- CSP / HSTS / Subresource Integrity 配置 baseline
- Supabase Auth + Realtime 在 RLS 配错时的横向数据访问风险
- Vercel / Cloudflare Pages 部署配置中的常见漏洞
另:列 Web 用到的 npm 依赖(@supabase/supabase-js、workbox、idb、react-router 等)的 CVE 状态。
```

```text
Skill: gh-fix-ci
任务:为 Web 的 GitHub Actions + Vercel/Cloudflare 部署 workflow 草拟一份"出问题怎么排"的 SOP,
将作为 Phase 4.5 末"部署管线 + 回滚演练"feature 的 onboarding。
```

```text
Skill: planning-with-files
任务:为 web-v1 创建 docs/workflow/roadmap/web-v1.tasks.md
```

```text
Skill: superpowers
触发:plan-first / subagent 分解
```

### 4.1 init 命令

```text
/xai-roadmap-loop
mode: init
input_kind: prd
source: docs/planning/sub-prds/web/PRD.md
roadmap_name: web-v1
notes: |
  额外上下文:
    - docs/planning/sub-prds/web/dev-plan.md
    - docs/planning/sub-prds/console/PRD.md   # Web 复用 Console UI
    - docs/planning/sub-prds/sync/PRD.md      # Web 跑同一份 Sync 协议
    - docs/PLUGIN_SDK.md
    - docs/adr/0003-three-faces-architecture.md
    - docs/TECHNICAL_REQUIREMENTS.md
    - <把 §4.0 codebase-explorer 产出的目录骨架草图路径填这里>
    - <把 §4.0 frontend-dev 产出的响应式 + Lighthouse 优化清单路径填这里>
    - <把 §4.0 composition-patterns 产出的"哪些组件需平台分支"清单路径填这里>
    - <把 §4.0 security-skills-claude-code 产出的 Web STRIDE + CVE 报告路径填这里>
    - <把 §4.0 gh-fix-ci 产出的部署排障 SOP 路径填这里>
  分解时请参考 frontend-dev 保持每个 WebView 的响应式 / 性能预算一致性;参考
  composition-patterns 明确 ConsoleView vs WebView 的复用边界;参考 security-skills-claude-code
  覆盖浏览器特有威胁建模;参考 gh-fix-ci 设计部署管线 features 的 CI 排障路径;同步维护
  docs/workflow/roadmap/web-v1.tasks.md;保持 superpowers 的 plan-first 分解心智。

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
  每个 feature 的 seed brief 要写清"用到的浏览器 API"、"兼容性矩阵特殊处理"、
  "Lighthouse / Web Vitals 影响维度"、"对应 STRIDE 维度"。
```

### 4.2 manifest review 自查清单

- [ ] **wave 0** 只含 Web 脚手架 + 数据 driver 切换,无 UI 复用 feature
- [ ] 每个业务 plugin 的 WebView 在 manifest 里**显式有一行**(productivity-web-view / labels-web-view / ...),哪怕实现就是 "= ConsoleView"
- [ ] **依赖 console-v1 + sync-v1** 在 `Note` 标 `blocked-by: console-v1 ALL_SHIPPED + sync-v1 ALL_SHIPPED`;`xai-roadmap-loop` 不会自动跨 manifest 检查,不要在前置 roadmap 完成前 run
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
manifest: docs/workflow/roadmap/web-v1.md
```

skill 会先弹中文 dispatch 确认。Web 推荐选 `bg`;若部署或安全 hardening wave 需要人工逐项掌控,选 `emit`。

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
- ✅ 用 `/xai-feature-full-loop` skill 作为单 feature 的 parent-session recipe
- ✅ 如果确实想在一个 transcript 里串行跑完整 roadmap wave,在 `xai-roadmap-loop` 的中文 dispatch 确认里选 `serial`;它会直接派发 `feature-plan` → `feature-review` → `feature-auto-build` → `feature-verify`,每步间读 dev_log

`xai-roadmap-loop` 默认候选是 `emit`:只打印 N 个 `/xai-feature-full-loop` block,你在 N 个新会话里粘贴执行。Claude Code 推荐并行路径是 `bg`:用 `claude --bg --name ...` 启后台 session,Agent View 监控,并把 manifest row 标为 `IN_PROGRESS`。日常不要选 `spawn`,除非宿主明确支持 >=4 层 nested agent。

### 5.2 子 roadmap 之间的依赖是"全 SHIPPED 等待",不是"骨架就够了"

虽然 Console 的 init 时机可以早(Sync 骨架到位即可),但 **Console wave 0 真正执行**需要 sync-v1 里被 Console 依赖的具体 feature(account-login / realtime-channel / sqlite-schema)处于 `Status: SHIPPED`。`xai-roadmap-loop run` 只会自动检查**同一份 manifest 内**的 `Depends On` + `Dep Semantics`;跨 roadmap 依赖靠 §1 总顺序、manifest `Note` 里的 `blocked-by:` 标注和人工守门。

### 5.3 init 之后必须**真的人工审 manifest**

`init` 决定的是 wave 切分 + 依赖图,一旦进入 run 模式很难回头。**重点审 3 件事**:

1. 每个 feature 是否真的"原子" —— 单一团队能在 1-3 天内完成?
2. 依赖图有没有死环 —— `xai-roadmap-loop init` 会拒绝写带环 manifest,但**事实性**依赖错位(A 应在 B 之前但写反了)它检不出
3. wave 间能否真"并行" —— 同 wave 的 features 是否共享某未列依赖(如同一个 plugin 包内的 conflict)

---

## 6. 当前可用 dispatch 模式怎么选?

- **emit**:最稳。只输出 `/xai-feature-full-loop` block,不启动后台任务,不把 row 标成 `IN_PROGRESS`。适合小 wave 或还没验证 bg 的机器。
- **bg**:Claude Code 推荐并行路径。启动后台 session + Agent View 监控,默认并发 3;适合 Console / Web 这类多 plugin wave。
- **serial**:一个主会话串行执行,不并行,但能避免多窗口管理。适合小 wave 或你想保留单 transcript。
- **spawn**:legacy 高风险路径。会嵌套 spawn `feature-full-loop`,Claude Code 默认和 Codex `max_depth=2` 都不推荐。

每次 run 都让 `xai-roadmap-loop` 的中文确认门来最终决定,不要在 prompt 里预写 `dispatch:`。

---

## 7. 一句话总结

```
skills 已就绪 → Sync init+review → Sync run × N + ship → Console init+review →
Console run × N + ship → Web init+review → Web run × N + ship → v1 GA
```

每个 `init` 后停下**真审 manifest**,每个 `run` 先通过中文 dispatch 确认选择 `emit` / `bg` / `serial` / `spawn`,每波末 batch ship。
