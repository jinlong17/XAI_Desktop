# Workflow 使用教程 — XAI_Desktop 实例

> **Project 层实操教程。** 面向在 XAI_Desktop 里跑 Workflow V2 的开发者:什么时候用哪个
> skill / agent、敲什么命令、状态在哪里看、卡住后怎么恢复。
>
> 这是 `docs/workflow/_portable/usage-guide.md` 的 **XAI_Desktop 实例版**。portable 层负责
> 跨项目规格;本文件只讲 XAI 的真实路径、真实命名、真实约束。

---

## 0. 这份文档和 portable 层的关系

XAI_Desktop 的 workflow 分两层:

| 层 | 路径 | 作用 | 能不能直接改 |
|---|---|---|---|
| Portable spec | `docs/workflow/_portable/` | 跨项目 Workflow V2 规格、agent templates、public skills、hook scripts | 不建议在目标项目手改;通过 resync 从源仓库同步 |
| Project layer | `docs/workflow/`, `.teams/skills/`, 本文件 | XAI 的路径、plugin 约定、macOS 真机门、项目 SOP | 可以按 XAI 需要维护 |
| Cross-tool policy | `docs/workflow/project/workflow.md` | Codex + Claude Code 并行开发的分工、branch、commit、review、防冲突规则 | 可以按 XAI 需要维护 |

本文件只补项目层说明。它不会改变 canonical manifest 路径:

```text
docs/workflow/roadmap/<roadmap_name>.md
```

`docs/workflow/project/` 是项目层教程和 playbook 目录,不是 roadmap manifest 目录。

如果问题是"这次应该用 Codex 还是 Claude Code,以及两者如何接力",先读
`docs/workflow/project/workflow.md`;再按本文件选择具体命令。

---

## 1. XAI Workflow 的心智模型

XAI_Desktop 使用三层驱动方式,底层都是同一套 V2 状态机:

| Level | 你敲什么 | 谁编排 | 什么时候用 |
|---|---|---|---|
| Level 1 手动 subagent | `Start the feature-plan agent...` 等 | 你逐步派发 worker | 要完全掌控、调试流程、恢复 BLOCKED |
| Level 2 单 feature skill | `/xai-feature-full-loop` | parent session 直接派发 worker | 一个 feature 从需求跑到 `READY_TO_SHIP` |
| Level 3 roadmap skill | `/xai-roadmap-loop` | manifest + wave 编排 | 一份 PRD / roadmap 拆成多个 feature 并按依赖推进 |

核心状态文件永远是:

```text
packages/<feature>/docs/dev_log.md
```

XAI 的 `<feature>` 通常是完整 plugin slug,例如:

```text
packages/plugin-organizer/docs/dev_log.md
packages/plugin-account/docs/dev_log.md
```

---

## 2. 前置检查

开始跑 workflow 前先确认这些东西存在:

```bash
ls .claude/agents
ls .codex/agents
ls .cursor/agents
ls docs/workflow/_portable/skills/workflow-router/SKILL.md
ls .claude/skills/skill-workflow-router/SKILL.md
ls .codex/agents/skill-workflow-router.toml
ls .codex/skills/workflow-router/SKILL.md
ls .cursor/rules/skill-workflow-router.mdc
ls .teams/skills/xai-feature-brief/SKILL.md
ls .teams/skills/xai-feature-full-loop/SKILL.md
ls .teams/skills/xai-roadmap-loop/SKILL.md
ls .teams/skills/xai-web-to-desktop-sync/SKILL.md
ls .claude/skills/xai-feature-brief/SKILL.md
ls .claude/skills/xai-feature-full-loop/SKILL.md
ls .claude/skills/xai-roadmap-loop/SKILL.md
ls .claude/skills/xai-web-to-desktop-sync/SKILL.md
ls .codex/skills/xai-web-to-desktop-sync/SKILL.md
ls .cursor/rules/xai-web-to-desktop-sync.mdc
```

当前 XAI 约定:

- 15 个 Workflow V2 agent 三端生成: Claude / Codex / Cursor。
- 10 个 portable public skills 三端生成,包含 `agent-behavioral-guidelines` 和
  `workflow-router`。
- 4 个 XAI project-layer skills:
  - `xai-feature-brief`
  - `xai-feature-full-loop`
  - `xai-roadmap-loop`
  - `xai-web-to-desktop-sync`
- `.claude/skills/xai-*` / `.codex/skills/xai-*` 是指向 `.teams/skills/xai-*` 的 symlink。
- `.cursor/rules/xai-*.mdc` 是 XAI project-layer skill 的 Cursor surface。

如果改过 `.agents/templates/`、`.agents/project_background.md` 或 portable public skills,重生成:

```bash
./scripts/setup_subagents_v2.sh --include-skills
```

如果要把 Claude active agents 也覆盖为新版:

```bash
./scripts/setup_subagents_v2.sh --include-skills --replace-claude --force
```

---

## 3. XAI 的 feature 单元

XAI 的默认 feature 单元是一个 plugin package:

```text
packages/plugin-<name>/
```

每个 plugin 必须维护四件套:

| 文件 | 用途 |
|---|---|
| `design.md` | 设计快照、依赖、选型、冻结假设 |
| `api.md` | exports、typed events、Tauri command、错误语义 |
| `test.md` | 测试策略、mock 策略、验收标准 |
| `dev_log.md` | Workflow V2 状态机和 Work Log |

配套 review artifacts:

```text
docs/reviews/<feature>/<YYYYMMDD>-feature-brief.md
docs/reviews/<feature>/<YYYYMMDD>-discovery-review.md
```

核心项目约束:

- Host (`apps/desktop/src/`) 只做 shell / routing / providers / window 壳,不放业务逻辑。
- Core (`packages/core/`) 只放基础设施、types、typed events、hooks、PluginRegistry,不放业务逻辑。
- Plugin (`packages/plugin-*`) 放业务逻辑。
- Plugin 间通信走 `packages/core/src/events/` typed events,不要直接 import 另一个 plugin 的内部文件。
- 涉及多窗口、Tauri command、macOS NSWindow / focus / drag-drop / screen capture 的改动,ship 前必须真机验证。

详细规则见:

- `developer.md`
- `CLAUDE.md`
- `docs/SYSTEM_ARCHITECTURE.md`
- `docs/PLUGIN_SDK.md`
- `docs/PLUGIN_MAP.md`
- `docs/workflow/SOP_NEW_FEATURE.md`
- `docs/workflow/SOP_BUGFIX.md`

---

## 4. Level 1 — 手动 feature workflow

手动模式适合你想逐步掌控、review 每个阶段,或从 BLOCKED 恢复。
Codex 当前会话也可以按这个 Level 1 顺序 inline 执行;这正是 `A-Codex` 在 spawn 深度不够时的落地方式。

标准 feature 流程:

```text
/xai-feature-brief
Start the feature-plan agent.
Start the feature-review agent for <feature>.
Start the feature-build agent for <feature>.
Start the feature-build agent for <feature>.      # 重复直到所有 phase 完成
Start the feature-verify agent for <feature>.
Start the ship agent for <feature>.
```

更高自动化的 build 方式:

```text
Start the feature-auto-build agent for <feature>.
```

注意:

- `feature-build` 一次只跑一个 phase。
- `feature-auto-build` 会跑完 approved plan 的所有剩余 phase,停在 verify 前。
- `ship` 永远是人工触发,不要让 roadmap-loop 或 feature-full-loop 自动 ship。
- 每次 worker 返回后都要读 `packages/<feature>/docs/dev_log.md` 的 Status Panel。

常见 Status → 下一步:

| Status | 下一步 |
|---|---|
| `NEEDS_REVIEW` | `feature-review` |
| `APPROVED` | `feature-build` 或 `feature-auto-build` |
| `READY_FOR_VERIFY` | `feature-verify` |
| `READY_TO_SHIP` | `ship` |
| `BLOCKED` | 读 Blockers,回到对应上游角色修复 |
| `SHIPPED` | 完成 |

---

## 5. Level 2 — 单 feature 全流程

推荐入口:

```text
/xai-feature-full-loop
Requirement: <1-3 句:为什么做、谁用、解决什么>
Automation Mode: <A-Claude | A-Codex | B-Codex | B-Cursor | C-Codex | C-Cursor | D-Codex | D-Cursor | D-Codex+Cursor>
Verify Cross-vendor: yes
```

已存在 feature 的 resume:

```text
/xai-feature-full-loop
Feature: plugin-<name>
```

如果来自 roadmap bg session,保留这些字段:

```text
/xai-feature-full-loop
Feature: plugin-<name>
Roadmap Manifest: docs/workflow/roadmap/<roadmap_name>.md
Background Session: <session_id_or_name>
Worktree: <absolute_worktree_path>
```

`xai-feature-full-loop` 做什么:

1. 必要时调用 `xai-feature-brief` 形成 Step 0 brief。
2. 派发 `feature-plan`。
3. 派发 `feature-review`;如 REVISE,回到 `feature-plan`。
4. 根据 `Verify Cross-vendor` 派发 `feature-auto-build` 或可用的 loop worker。
5. 派发 `feature-verify`。
6. 停在 `READY_TO_SHIP`,输出 copy-pasteable ship next step。

它不会做什么:

- 不 spawn `feature-full-loop` meta-orchestrator。
- 不写 Status Panel。
- 不运行 `ship`。
- 不清理 background session / worktree。

---

## 6. Automation Mode 怎么选

`Automation Mode` 控制 build / review / verify 怎么分配给 Claude、Codex、Cursor。
合法枚举是 portable 规格中的 9 个:

| Mode | 适合 |
|---|---|
| `A-Claude` | 高风险架构、密码学、macOS native、多窗口行为;优先稳 |
| `A-Codex` | 长时间在当前 Codex session 里连续开发;Codex 作为 lead,不把实现外包给 `codex exec` |
| `B-Codex` / `B-Cursor` | 事件驱动 hook 链路,适合外部 CLI 已稳定登录时 |
| `C-Codex` / `C-Cursor` | phase 级外部 build + phase review |
| `D-Codex` / `D-Cursor` | 外部 executor 一次性跑 build,本会话收 verify |
| `D-Codex+Cursor` | UI-heavy / 多文件常规开发,希望吃两边 quota |

`A-Codex` 和 `D-Codex` 的区别:

- `A-Codex`:Codex 是 lead。当前 Codex session 负责 plan / build / verify 的编排;spawn 深度不够时 inline 执行 worker contract。
- `D-Codex`:另一个 lead 把 build phase 委派给 Codex external executor。它不是 Codex 长跑主模式。

XAI 默认建议:

- 密码学 / Sync / Rust security: `A-Claude`, `Verify Cross-vendor: yes`
- 长时间在 Codex 里推进: `A-Codex`, `Verify Cross-vendor: yes`
- UI-heavy / Console / Web 且由 Claude lead 调度外部执行: `D-Codex+Cursor`, `Verify Cross-vendor: yes`
- 小修小补:可以用 `agent-behavioral-guidelines` + Level 1,避免过度编排

`Verify Cross-vendor: yes` 是默认推荐。它要求 build 和 verify 不由同一执行者自证正确。

---

## 7. Level 3 — Roadmap orchestration

当你有一份 PRD / roadmap,需要拆成多个 feature,用:

```text
/xai-roadmap-loop
mode: init
input_kind: prd
source: docs/planning/<roadmap-or-prd>.md
roadmap_name: <roadmap_name>
notes: |
  额外上下文、强制拆分规则、依赖提示、推荐 Automation Mode 等。
```

输出 manifest:

```text
docs/workflow/roadmap/<roadmap_name>.md
```

`init` 必须停在人工 review gate。review 时重点看:

- feature 是否够原子,通常 1-3 天可完成。
- dependency graph 是否合理。
- wave 0 是否只包含真正可独立启动的基础 feature。
- `Default Automation Mode:` 是否合适。
- `Default Verify Cross-vendor:` 是否为 `yes`。
- `Wave Concurrency Cap:` 是否适合 bg 并发。
- `BLOCKED_EXTERNAL` 是否合理保留外部依赖。

review 完再 run:

```text
/xai-roadmap-loop
manifest: docs/workflow/roadmap/<roadmap_name>.md
```

新版 `xai-roadmap-loop` 每次 run 都会先中文确认 dispatch mode。不要在 prompt 里预写
`dispatch:`;让确认门决定。

| Dispatch | 行为 | 什么时候用 |
|---|---|---|
| `emit` | 打印 `/xai-feature-full-loop` blocks,你开新会话粘贴 | 最稳、最便携、bg 未验证 |
| `bg` | `claude --bg --name ...` 启后台 session,Agent View 监控 | Claude Code 推荐并行路径 |
| `serial` | 当前会话逐个 feature 串行执行 parent-session recipe | 想要单 transcript、不并行 |
| `spawn` | legacy nested spawn `feature-full-loop` | 日常不要用;需要 >=4 层 nested agent |

Codex 当前会话推进 roadmap 时优先选 `serial` 并配合 `Default Automation Mode: A-Codex`;
如果想开多个新 Codex 会话粘贴执行,选 `emit`。`bg` 是 Claude Code / Agent View 路径,
不要把它当成 Codex background automation。

`emit` 输出 block 类似:

```text
/xai-feature-full-loop
Feature: plugin-<name>
Automation Mode: <resolved mode>
Verify Cross-vendor: <yes|no>
Requirement: <resolved requirement>
```

`bg` preflight:

- 工作树干净,或 `git config worktree.baseRef head`,或 prompt 已内联所有必要内容。
- `BG Direct Verified: yes`,或先完成 `claude --bg` smoke test。
- `Wave Concurrency Cap` 默认 3;超过 cap 的 row 保持 `PENDING`,Note 标 `QUEUED_BG cap=N`。
- `claude -p` 不是 bg path;不要把 headless mode 当 Agent View background session。

bg feature 到 `READY_TO_SHIP` 后,按 skill 输出的 handoff ship:

```text
Start the ship agent for plugin-<name>.
Background Session: <session_id_or_name>
Roadmap Manifest: docs/workflow/roadmap/<roadmap_name>.md
```

如果 session 不明确,补:

```text
Worktree: <absolute_worktree_path>
```

---

## 8. 子 PRD 怎么落到 Workflow V2(现役路径)

> 历史背景:旧版曾把 v1 拆成 Sync / Console / Web 三条独立 roadmap manifest 串行推进。
> 这种 framing 已在 2026-05-19 由 `docs/planning/sub-prds/roadmap-prompts.md`
> 顶部正式废弃,**当前不要再按"三条独立 manifest"思考**。

### 8.1 当前权威入口

按 `docs/planning/sub-prds/roadmap-prompts.md` 顶部声明,v1 工程顶层 truth 是:

- `docs/planning/execution/README.md` + G0-G10 执行包
- `docs/planning/BACKLOG-v1.md`
- `docs/contracts/README.md`
- 这份 `docs/workflow/project/usage-guide.md`

子 PRD (`sub-prds/sync/PRD.md` · `sub-prds/console/PRD.md` · `sub-prds/web/PRD.md`) 仍然是
对应模块的深度规格来源,但**不**对应独立的 roadmap manifest。

### 8.2 三子 PRD 当前真实推进路径

| 子 PRD | 现役路径 | 现役 manifest / 入口 |
|---|---|---|
| **sync** | 单 roadmap manifest, continue | `docs/workflow/roadmap/sync-v1.md` (W0-W3 大量 Shipped, Phase 5 完善剩余) + `sync-v1.deferred-gates.md` |
| **web** | 单 roadmap manifest, continue | `docs/workflow/roadmap/web-ticktick-parity.md` (25 row, 10 已 SHIPPED at 2026-05-22) |
| **console** | plugin-by-plugin manual,**无**独立 manifest | `plugin-console` 已 SHIPPED;`plugin-productivity/labels/project` 走 Level 1/2 verify+ship,最后做真机走查 |

### 8.3 调度规则

- **不要为子 PRD 新建 manifest**(`/xai-roadmap-loop init`):现役 sync-v1 / web-ticktick-parity
  已覆盖 sync + web,console 不需要 manifest 层。
- 推进现役 manifest 用 `/xai-roadmap-loop` run 模式,具体见 §7。
- 推进单个 feature(含 console 的 plugin)用 `/xai-feature-full-loop`,具体见 §5。
- 子 PRD 自身的修订 / 新章节 / discovery 仍然在子 PRD 文件里改;但**别**用 `/xai-roadmap-loop init`
  把它们再解构成新 manifest。
- init 前可先跑 public skills 做 orientation / STRIDE / frontend / composition / CI 预热,
  再把报告路径写进 feature 或 row 的 `notes:`。

### 8.4 跨子 PRD 依赖顺序(参考)

- console 依赖 sync 提供的 `@repo/core-data` Repository<T> 契约 + crypto 套件(均已 Shipped)。
- web 依赖 sync 的 Sync blob protocol(`web-sync-blob-driver` 是 web manifest 内的 W4 row)+ console
  的 PRD IA / `ui.consoleSidebar.entries` 契约(由 `ADR-0006` 强制对齐)。
- 子 PRD 间的硬依赖落到 manifest 的 `depends_on` 列里,wave 排程自动处理;新增子 PRD 间依赖
  时直接编辑 manifest row,不再开新 manifest。

---

## 9. Bugfix workflow

手动 bugfix:

```text
Start the bug-diagnose agent.
Start the bug-fix agent for <feature>.
Start the bug-verify agent for <feature>.
Start the ship agent for <feature>.
```

自动 bugfix loop:

```text
Start the bugfix-loop agent for <feature>.
Start the ship agent for <feature>.
```

注意 Claude Code nested spawn 限制:如果 loop agent 无法 spawn worker,回到手动模式:

```text
bug-diagnose → bug-fix → bug-verify → ship
```

XAI bugfix 必须满足:

- 可复现。
- 根因明确。
- 回归测试或等价验证明确。
- 涉及 macOS native / 多窗口 / Tauri command 时,真机验证。
- 修改 typed events / API 时,同步 `api.md` 和相关 listeners。

---

## 10. Public skills 怎么用

Portable public skills 是 description-triggered 的辅助能力。常用:

| Skill | 触发场景 |
|---|---|
| `agent-behavioral-guidelines` | 小修、小改、不要 over-engineer、每步验证 |
| `codebase-explorer` | 不熟悉模块、要 orientation map |
| `planning-with-files` | 长任务要 `task_plan.md` |
| `superpowers` | 先设计、再实现、需要分解 |
| `workflow-router` | 把自由需求/问题转换成可复制的 Claude/Codex goal prompt,或当前窗口 task prompt 预览 |
| `security-skills-claude-code` | STRIDE、攻击面、依赖 CVE |
| `frontend-dev` | UI 页面 / component polish |
| `composition-patterns` | React compound / slot / render-prop 设计 |
| `gh-fix-ci` | GitHub Actions / PR checks 失败 |
| `skill-creator` | 写或改 SKILL.md |

Project-layer skills:

| Skill | 用途 |
|---|---|
| `xai-feature-brief` | Step 0 需求规范化 |
| `xai-feature-full-loop` | 单 feature parent-session 全流程 |
| `xai-roadmap-loop` | 多 feature roadmap orchestration |
| `xai-web-to-desktop-sync` | ADR-0013 D3 Web→Desktop 同步门 / parity receipt |

---

## 11. Dev dashboard / local project console

本地项目控制台在 `docs/prototypes/dev-dashboard/index.html`。它只做
**读取 + 提醒**: 读取 git、roadmap manifest、PLUGIN_MAP、skill/agent 注册表和
白名单文档;不自动改 roadmap、不 merge、不判断发布。

机器说明文档在 `docs/workflow/project/dev-dashboard.md`。AI / Codex /
Claude Code 需要判断看板是否最新时，使用 `xai-dev-dashboard-sync`。

刷新一次静态快照:

```bash
pnpm dashboard
```

启动本地文档库和 API:

```bash
pnpm dashboard:serve
```

serve 只绑定 `127.0.0.1`。默认地址:

```text
http://127.0.0.1:4177
```

如果 4177 被占用,脚本会自动顺延端口。serve 启动时会先运行
`scripts/dashboard/generate-state.mjs`;看板里的刷新按钮也只会重跑这个生成脚本。

可读 API:

| Route | 用途 |
|---|---|
| `GET /` | dev-dashboard HTML |
| `GET /api/tree?dir=<path>` | 白名单目录树 |
| `GET /api/file?path=<path>` | 读取白名单内文本/Markdown |
| `GET /api/search?q=<term>` | `rg` 搜索;无 `rg` 时降级 `grep` |
| `GET /api/refresh` | 重跑 dashboard snapshot |

白名单: `docs/`, `docs/adr`, `docs/workflow`, `.teams/skills`,
`.codex/agents`, `packages/*/docs`。路径穿越会被拒绝。

当前不启用 dashboard git hook。443/周这类 commit 频率下,post-commit 刷新噪音
高;serve 启动刷新 + 手动刷新按钮已经足够。若以后要加 hook,必须避免覆盖
`scripts/cowork/git-post-commit`,并按 `.githooks/` 链式迁移。

## 12. Event-driven automation / hooks

XAI 已带 `scripts/cowork/` 事件驱动脚本和 `git-post-commit` hook 渲染版本。

关键文件:

```text
scripts/cowork/git-post-commit
scripts/cowork/dispatch_codex.sh
scripts/cowork/dispatch_cursor.sh
scripts/cowork/dispatch_claude.sh
scripts/cowork/codex_wrapper.sh
scripts/cowork/cursor_wrapper.sh
scripts/cowork/lib_hook_helpers.sh
scripts/cowork/lib_phase_verdict.sh
```

前置:

```bash
brew install coreutils util-linux
codex --version
cursor-agent --version
cursor-agent login
claude --version
```

Claude bg dispatch is opt-in. The hook keeps Codex -> Claude cross-vendor review/verify as
`MANUAL_CLAUDE` until this checkout explicitly enables it:

```bash
claude --bg --name cowork-smoke "Reply with: cowork bg smoke ok"
claude agents --cwd /Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop
git config cowork.claudeBg true
```

`dispatch_claude.sh` only proves launch. It does not mark cross-vendor PASS; the Claude session must
write the normal `dev_log.md` Status Panel update and any review/receipt artifact.

hook 通知 resume 格式应是 skill-first:

```text
/xai-feature-full-loop Feature: <feature>
```

不是:

```text
Start the feature-full-loop agent for <feature>.
```

如果 hook 行为异常,先查:

```bash
python3 scripts/lint/check_portable_sync.py
rg -n "Start the feature-full-loop agent|/xai-feature-full-loop Feature" scripts/cowork docs/workflow/_portable/scripts
```

---

## 13. Resync / portable 更新后的检查

当源仓库 Any2Knowledge 的 portable workflow 更新后,XAI 用 resync 吃更新。通常在源项目里跑:

```text
/a2k-workflow-migrate target: /Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop mode: resync
```

resync 后在 XAI 里检查:

```bash
python3 scripts/lint/check_portable_sync.py
python3 scripts/setup_subagents_v2.py --dry-run --targets claude,codex,cursor --include-skills --replace-claude
git status --short
```

需要人工 review 的常见 project-layer delta:

- `.teams/skills/xai-feature-full-loop/SKILL.md`
- `.teams/skills/xai-roadmap-loop/SKILL.md`
- `docs/workflow/SUBAGENT_WORKFLOW_V2.md`
- `docs/workflow/SOP_NEW_FEATURE.md`
- `docs/workflow/SOP_BUGFIX.md`
- `docs/workflow/project/usage-guide.md`
- `docs/workflow/project/workflow.md`
- `docs/planning/sub-prds/roadmap-prompts.md`
- `developer.md`
- `CLAUDE.md` / `AGENTS.md` / `.cursor/rules/handoff.mdc` 的 handoff display rule

原则:

- `_portable/` 变更代表源规范更新,不要在 target 里长期手改。
- project-layer skills 不会自动和 spec 完全一致;需要人工重派生。
- active `.claude/agents/` 可能和 `.claude/agents-v2/` 不同;如果你实际跑 Claude Code,确认是否需要 `--replace-claude`。
- `check_portable_sync.py PASS` 只说明 portable/mirror 同步,不代表 project-layer skill 已吸收新版规范。

---

## 13. 常见故障和恢复

### 13.1 `feature-full-loop` / `bugfix-full-loop` 被 spawn 后 BLOCKED

原因:Claude Code spawned subagent 默认拿不到 `Task` 工具,无法再 spawn worker。

恢复:

- 单 feature 用 `/xai-feature-full-loop`。
- roadmap 用 `/xai-roadmap-loop`,在中文 dispatch 确认里选 `emit` / `bg` / `serial`。
- 手动恢复时直接派发 worker agents。

### 13.2 roadmap run 没有发出下一波

检查:

- manifest rows 是否有 `BLOCKED` / `BLOCKED_EXTERNAL`。
- 依赖 row 是否已 `SHIPPED` 或允许 `READY_TO_SHIP`。
- 对应 feature 的 `packages/<feature>/docs/dev_log.md` 是否真实存在。
- `Automation Mode` 是否是合法 9 变体之一。
  - 当前合法值含 `A-Codex`;如果旧 manifest 因为 `A-Codex` 被标 BLOCKED,人工改回 `PENDING` 后重跑。

### 13.3 bg session 启动后找不到 worktree

先查:

```bash
claude agents --cwd /Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop
git worktree list
```

ship 时提供:

```text
Start the ship agent for <feature>.
Background Session: <session_id_or_name>
Roadmap Manifest: docs/workflow/roadmap/<roadmap_name>.md
Worktree: <absolute_worktree_path>
```

不要在 ship 成功前删除 background session;删除 session 可能删除 worktree。

### 13.4 ship 后残留文件 / 临时分支未清理

`ship` 成功 push 且写入 `SHIPPED` 后,必须执行 post-ship cleanliness:

```bash
git status --short --untracked-files=all
git clean -nd
git clean -ndX
git worktree list --porcelain
git branch --format='%(refname:short) %(upstream:short) %(worktreepath)'
```

原则:

- 只自动清理安全白名单: `.DS_Store`, `.turbo/`, `coverage/`, `dist/`, `build/`, `.next/`,本次 run 明确生成的空临时目录或日志。
- 不默认删除 `node_modules/`, `.pnpm-store/`, `.env*`, `.claude/worktrees/`,background session,本地 DB,浏览器 profile,或无法证明归属的 untracked source。
- 分支只删本 feature/session 可证明拥有的临时分支,且必须不在任何 worktree 上、已 merge 到目标或刚被 push 覆盖。
- 分支删除只能用 `git branch -d BRANCH_NAME`;除非用户明确二次授权,不要用 `git branch -D`。
- Handoff 必须报告 `Cleanliness`, `Cleanup Performed`, `Branches Deleted`, `Cleanup Deferred`。

### 13.5 dev_log 状态和 manifest 不一致

以 `dev_log.md` Status Panel 作为 feature 执行真相,以 roadmap manifest 作为队列真相。
重新跑:

```text
/xai-roadmap-loop
manifest: docs/workflow/roadmap/<roadmap_name>.md
```

让 reconcile 修正 manifest。

### 13.6 macOS native / 多窗口功能 verify 卡住

这类功能不能只靠单元测试:

- 真机 macOS 13+。
- 多显示器。
- Mission Control / Spaces。
- window level / focus / drag-drop。
- Tauri command 输入输出。
- notarized 首启路径,如果影响发布。

`xai-feature-full-loop` 的最终 Handoff 必须把 real-hardware verification 是否仍未完成写清楚。

---

## 14. 日常命令速查

```bash
# 开发
pnpm install
pnpm --filter desktop tauri dev
./scripts/restart.sh
./scripts/clean-and-restart.sh

# 构建 / 测试
pnpm build
pnpm lint
pnpm typecheck
pnpm --filter @repo/core test
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml

# workflow 生成 / 校验
./scripts/setup_subagents_v2.sh --include-skills
./scripts/setup_subagents_v2.sh --include-skills --replace-claude --force
python3 scripts/lint/check_portable_sync.py
python3 scripts/setup_subagents_v2.py --dry-run --targets claude,codex,cursor --include-skills --replace-claude

# 查旧式 resume 文案
rg -n "Start the feature-full-loop agent|/xai-feature-full-loop Feature" scripts/cowork docs/workflow/_portable/scripts
```

---

## 15. 每天开工 checklist

- [ ] 读目标 plugin 的 `packages/<feature>/docs/dev_log.md` Status Panel。
- [ ] 查 `docs/PLUGIN_MAP.md`,确认依赖 plugin 是否 Stable / Production。
- [ ] 新 feature 先走 `/xai-feature-brief` 或 `/xai-feature-full-loop`。
- [ ] 多 feature 先走 `/xai-roadmap-loop mode: init`,人工 review manifest 后再 run。
- [ ] 需要并行时优先考虑 roadmap `dispatch: bg`,但先确认 bg preflight。
- [ ] 涉及多窗口 / macOS native / Tauri command 时,安排真机验证。
- [ ] ship 前确认 `READY_TO_SHIP`,不要跳过 `feature-verify` / `bug-verify`。
- [ ] ship 后检查 Handoff 里的 `Cleanliness` / `Branches Deleted` / `Cleanup Deferred`,确认临时文件、worktree、分支残留没有被忽略。
- [ ] subagent commit 应带对应 `Co-authored-by: <agent> <workflow-v2@local>` trailer。

---

## 16. 入口索引

| 想做什么 | 入口 |
|---|---|
| 把想法转换成 Claude/Codex goal 或当前窗口 task prompt | `use workflow-router` |
| 跑单个新 feature | `/xai-feature-full-loop` |
| 手动跑 feature | `docs/workflow/SOP_NEW_FEATURE.md` + Level 1 agents |
| 跑 bugfix | `docs/workflow/SOP_BUGFIX.md` |
| 跑一组 PRD / roadmap | `/xai-roadmap-loop` |
| 跑 Sync / Console / Web 子 PRD | `docs/planning/sub-prds/roadmap-prompts.md` |
| 查 portable 规格 | `docs/workflow/_portable/usage-guide.md` |
| 查状态契约 | `docs/workflow/_portable/02-handoff-and-state.md` |
| 查自动化模式 | `docs/workflow/_portable/04-automation-loop.md` |
| 查 roadmap 规范 | `docs/workflow/_portable/06-roadmap-orchestration.md` |
| 查 mode picker | `docs/workflow/_portable/07-automation-mode-picker.md` |
| 查 XAI 架构红线 | `docs/SYSTEM_ARCHITECTURE.md` |
| 查 plugin 状态 | `docs/PLUGIN_MAP.md` |
| 查分支拓扑 / Web→Desktop 同步治理 / 账号云同步契约 | `docs/adr/0013-branch-sync-governance.md` |

---

## 17. 分支与同步治理 (ADR-0013)

`docs/adr/0013-branch-sync-governance.md`(Proposed)是分支拓扑、Web→Desktop 同步门、
账号云同步 per-feature 契约的权威。它是**附加治理**,不改变 ADR-0010 的 P0/P1/P2 active-focus
顺序。跑 workflow 时相关的几条:

- **`web` 与 `dev` 是独立 focus branches**(§D5):`web` 聚焦 Web 产品,`dev` 聚焦
  Desktop/App。二者各自前进,分叉是正常状态,不是 subset/superset,也不是需要靠强行 merge 来"追平"的 drift。
- **分支拓扑**(§D2,已定义未创建):`codex/web/<feature>` → `web` → (同步门) →
  `desktop-next` ↔ `desktop-plugin-next` → `dev`(App RC) → `release/desktop/<version>` → tag。
  创建 `desktop-next` / `desktop-plugin-next` / `release/*` 是单独的、需 operator 确认的步骤
  (任何触及 `dev` 的操作都要显式确认),目前只有 `web` / `dev` / `main`。
- **Web→Desktop 同步门**(§D3):每个 Web 改动在流入 `desktop-next` 前先分类 W0–W4,产出 parity
  receipt。实现这个门的 `xai-web-to-desktop-sync` skill 已落地;若当前 runtime 无法加载该 skill,才按 §D3 手动 fallback,
  但仍必须产出同一份 parity receipt。
- **账号云同步**(§D4,基于 `data-repository-v0` 的 syncScope + sync-v1):Web 与 App **不互相**同步,
  二者都同步到同一个账号云(Web IndexedDB ⇄ `/sync/push`,`/sync/pull` ⇄ server encrypted blobs ⇄
  App SQLite)。只有 `syncScope: account-sync` 实体会同步;`device-local` 永不进 outbox。新增
  account-sync feature 必须满足 §D4 的 9 项完成度清单。
