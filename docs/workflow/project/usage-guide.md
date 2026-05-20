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

本文件只补项目层说明。它不会改变 canonical manifest 路径:

```text
docs/workflow/roadmap/<roadmap_name>.md
```

`docs/workflow/project/` 是项目层教程和 playbook 目录,不是 roadmap manifest 目录。

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
ls .teams/skills/xai-feature-brief/SKILL.md
ls .teams/skills/xai-feature-full-loop/SKILL.md
ls .teams/skills/xai-roadmap-loop/SKILL.md
ls .claude/skills/xai-feature-brief/SKILL.md
ls .claude/skills/xai-feature-full-loop/SKILL.md
ls .claude/skills/xai-roadmap-loop/SKILL.md
```

当前 XAI 约定:

- 15 个 Workflow V2 agent 三端生成: Claude / Codex / Cursor。
- 9 个 portable public skills 三端生成,包含 `agent-behavioral-guidelines`。
- 3 个 XAI project-layer skills:
  - `xai-feature-brief`
  - `xai-feature-full-loop`
  - `xai-roadmap-loop`
- `.claude/skills/xai-*` 是指向 `.teams/skills/xai-*` 的 symlink。

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
Automation Mode: <A-Claude | B-Codex | B-Cursor | C-Codex | C-Cursor | D-Codex | D-Cursor | D-Codex+Cursor>
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

| Mode | 适合 |
|---|---|
| `A-Claude` | 高风险架构、密码学、macOS native、多窗口行为;优先稳 |
| `B-Codex` / `B-Cursor` | 事件驱动 hook 链路,适合外部 CLI 已稳定登录时 |
| `C-Codex` / `C-Cursor` | phase 级外部 build + phase review |
| `D-Codex` / `D-Cursor` | 外部 executor 一次性跑 build,本会话收 verify |
| `D-Codex+Cursor` | UI-heavy / 多文件常规开发,希望吃两边 quota |

XAI 默认建议:

- 密码学 / Sync / Rust security: `A-Claude`, `Verify Cross-vendor: yes`
- UI-heavy / Console / Web: `D-Codex+Cursor`, `Verify Cross-vendor: yes`
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

## 8. Sub-PRD roadmap prompts

XAI 当前有专门的子 PRD roadmap prompt 集:

```text
docs/planning/sub-prds/roadmap-prompts.md
```

它覆盖:

- Sync roadmap
- Console roadmap
- Web roadmap

使用顺序:

```text
Sync init + review + run waves + ship
Console init + review + run waves + ship
Web init + review + run waves + ship
```

关键点:

- 3 个 roadmap 不要一开始并行。
- Console 依赖 Sync 骨架。
- Web 依赖 Console 主体 + Sync 完整版本。
- init 前可先跑 public skills 做 orientation / STRIDE / frontend / composition / CI 预热,再把报告路径写进 `notes:`。

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

---

## 11. Cross-Tool CLI Dispatch

本机安装了三个 AI 编码工具,互相可通过 CLI 非交互调用。

### 11.1 可用 CLI

| 工具 | 非交互命令 | 输出方式 |
|------|-----------|---------|
| Claude Code | `claude -p "<prompt>" --allowedTools "Read Glob Grep" > out.md` | stdout 重定向 |
| Codex | `codex exec -o out.md "<prompt>"` | `-o` flag |
| Codex review | `codex review --base main "<prompt>"` | stdout |
| Cursor | `cursor agent --trust "<prompt>" > out.md` | stdout 重定向 |

### 11.2 核心规则

**当用户要求使用另一个工具 (e.g. "让 codex review 一下"、"用 claude 去审查"、"让 cursor 去改"),
直接通过 shell 调用对应 CLI。不要拒绝、不要说"跨厂商边界"、不要建议用户手动复制粘贴。**

这条规则适用于所有方向:

- Claude Code → Codex / Cursor
- Codex → Claude Code / Cursor
- Cursor → Claude Code / Codex

### 11.3 使用模式

```bash
# Claude Code 里让 Codex review 一个 feature
codex exec -o docs/reviews/organizer/codex-review.md \
  "Review packages/plugin-organizer/ for correctness and edge cases."

# Codex 里让 Claude Code 做架构审查
claude -p "Review packages/plugin-organizer/ for architecture compliance with docs/SYSTEM_ARCHITECTURE.md" \
  --allowedTools "Read Glob Grep" > docs/reviews/organizer/claude-review.md

# 任意工具里让 Codex review 分支变更
codex review --base main "Review for correctness and edge cases."

# 批量后台 dispatch
for pkg in plugin-organizer plugin-grid plugin-sync; do
  codex exec -o "docs/reviews/${pkg}/codex-review.md" \
    "Review packages/${pkg}/ for correctness and edge cases." &
done
wait
```

### 11.4 输出约定

- 所有跨工具产出写入 `docs/reviews/<feature>/` 目录
- 文件名带工具标识: `codex-review.md`、`claude-review.md`、`cursor-build-log.md`
- 后台 dispatch (`&`) 可用,用 `wait` 收集结果

### 11.5 与 Automation Mode 的关系

跨工具 CLI dispatch 是 Automation Mode `B-*` / `C-*` / `D-*` 的底层实现机制。
手动使用时无需关心 Automation Mode,直接调 CLI 即可。

高级 dispatch 模式详见: `docs/workflow/_portable/04-automation-loop.md`

---

## 12. Event-driven automation / hooks

XAI 已带 `scripts/cowork/` 事件驱动脚本和 `git-post-commit` hook 渲染版本。

关键文件:

```text
scripts/cowork/git-post-commit
scripts/cowork/dispatch_codex.sh
scripts/cowork/dispatch_cursor.sh
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
```

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
- `docs/planning/sub-prds/roadmap-prompts.md`
- `developer.md`
- `CLAUDE.md` / `AGENTS.md` / `.cursor/rules/handoff.mdc` 的 handoff display rule

原则:

- `_portable/` 变更代表源规范更新,不要在 target 里长期手改。
- project-layer skills 不会自动和 spec 完全一致;需要人工重派生。
- active `.claude/agents/` 可能和 `.claude/agents-v2/` 不同;如果你实际跑 Claude Code,确认是否需要 `--replace-claude`。
- `check_portable_sync.py PASS` 只说明 portable/mirror 同步,不代表 project-layer skill 已吸收新版规范。

---

## 14. 常见故障和恢复

### 14.1 `feature-full-loop` / `bugfix-full-loop` 被 spawn 后 BLOCKED

原因:Claude Code spawned subagent 默认拿不到 `Task` 工具,无法再 spawn worker。

恢复:

- 单 feature 用 `/xai-feature-full-loop`。
- roadmap 用 `/xai-roadmap-loop`,在中文 dispatch 确认里选 `emit` / `bg` / `serial`。
- 手动恢复时直接派发 worker agents。

### 14.2 roadmap run 没有发出下一波

检查:

- manifest rows 是否有 `BLOCKED` / `BLOCKED_EXTERNAL`。
- 依赖 row 是否已 `SHIPPED` 或允许 `READY_TO_SHIP`。
- 对应 feature 的 `packages/<feature>/docs/dev_log.md` 是否真实存在。
- `Automation Mode` 是否是合法 8 变体之一。

### 14.3 bg session 启动后找不到 worktree

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

### 14.4 dev_log 状态和 manifest 不一致

以 `dev_log.md` Status Panel 作为 feature 执行真相,以 roadmap manifest 作为队列真相。
重新跑:

```text
/xai-roadmap-loop
manifest: docs/workflow/roadmap/<roadmap_name>.md
```

让 reconcile 修正 manifest。

### 14.5 macOS native / 多窗口功能 verify 卡住

这类功能不能只靠单元测试:

- 真机 macOS 13+。
- 多显示器。
- Mission Control / Spaces。
- window level / focus / drag-drop。
- Tauri command 输入输出。
- notarized 首启路径,如果影响发布。

`xai-feature-full-loop` 的最终 Handoff 必须把 real-hardware verification 是否仍未完成写清楚。

---

## 15. 日常命令速查

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

## 16. 每天开工 checklist

- [ ] 读目标 plugin 的 `packages/<feature>/docs/dev_log.md` Status Panel。
- [ ] 查 `docs/PLUGIN_MAP.md`,确认依赖 plugin 是否 Stable / Production。
- [ ] 新 feature 先走 `/xai-feature-brief` 或 `/xai-feature-full-loop`。
- [ ] 多 feature 先走 `/xai-roadmap-loop mode: init`,人工 review manifest 后再 run。
- [ ] 需要并行时优先考虑 roadmap `dispatch: bg`,但先确认 bg preflight。
- [ ] 涉及多窗口 / macOS native / Tauri command 时,安排真机验证。
- [ ] ship 前确认 `READY_TO_SHIP`,不要跳过 `feature-verify` / `bug-verify`。
- [ ] subagent commit 应带对应 `Co-authored-by: <agent> <workflow-v2@local>` trailer。

---

## 17. 入口索引

| 想做什么 | 入口 |
|---|---|
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
| 跨工具 CLI dispatch | 本文件 §11 |
| 查 plugin 状态 | `docs/PLUGIN_MAP.md` |
