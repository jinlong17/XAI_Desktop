# 新 MacBook 开发接手 Prompt

> 类型：Goal prompt（Codex / Claude Code 通用）
> 预计时间：环境已安装约 30–60 分钟；首次安装 Xcode / Rust / Node 约 1–2 小时。
> 涉及范围：project-system / multi-machine-handoff；只做接手、验证和环境恢复，
> 不授权产品线合并、发布、部署或删除归档。

把下面整段复制到新 MacBook 上、已打开项目目录的 Codex 或 Claude Code 会话。
如果仓库尚未 clone，也可以先在一个空目录会话中粘贴；执行者应从 clone 开始。

```text
请把这台 MacBook 配置为 XAI_Desktop 的一个安全、可恢复的并行开发节点，并完成
GitHub 远端完整性与本地开发环境检查。

项目仓库：git@github.com:jinlong17/XAI_Desktop.git
任务类型：project-system / multi-machine-handoff
目标：从 GitHub 和安全密钥渠道恢复开发能力；不要依赖旧电脑的未提交文件、stash、
reflog、Codex/Claude 聊天记录或应用本地状态。
预计时间：环境已安装约 30–60 分钟；首次安装约 1–2 小时。

执行原则：
1. 先只读检查，不要直接修改 main、web、dev、desktop-next 或
   desktop-plugin-next，不要 merge、rebase、force-push、发布、部署或删除任何
   codex/archive/* ref。
2. 完整阅读 AGENTS.md、CLAUDE.md、developer.md、
   docs/workflow/project/multi-machine-development.md、
   docs/workflow/project/usage-guide.md 和
   docs/adr/0013-branch-sync-governance.md，再执行项目命令。
3. GitHub 远端 refs 是项目交换事实源。若发现远端状态比本文记录更新，以 fetch 后的
   远端为准，不要把分支回退到历史快照。
4. 不读取、不输出、不提交任何密钥值。只核对变量名；.env.local、API token、
   Apple signing 资料和应用登录态必须由密码管理器或加密渠道恢复。

请依次完成：

A. 仓库与 GitHub
- 若仓库不存在，clone 上述 SSH 地址；若 SSH 未配置，先诊断 GitHub SSH/gh 登录，
  不要临时把 token 写入文件或命令历史。
- 运行 git fetch --all --prune --tags、git remote -v、git status --short --branch、
  git branch -a -vv、git worktree list。
- 确认至少可以看到 main、web、dev、desktop-plugin-next，以及
  codex/archive/migration-20260908-* 和 codex/archive/web-design-source 的远端 refs。
- 2026-09-08 的治理基线包含提交 03d3db3 和 7b19448；只确认它们可从远端到达，
  不要据此覆盖更新的远端 HEAD。

B. 软件与运行时
- 检查 macOS 13+、git、GitHub CLI、Xcode Command Line Tools、Node、Corepack、
  pnpm、Rust stable/cargo。Node 优先使用仓库 .nvmrc（当前为 22），pnpm 使用
  package.json 的 packageManager（当前为 pnpm 9），不要盲目安装 latest 覆盖项目版本。
- Codex Desktop/CLI、Claude Code/Desktop、Cursor 属于按实际工作流选择的开发客户端；
  检查登录和仓库权限，但不要把它们的个人聊天记录当作项目状态。
- Wrangler、Tauri 等项目 CLI 优先使用仓库 scripts 或 pnpm workspace 版本；先查看
  manifest，再决定是否需要全局安装。不要无依据安装额外工具。
- 输出一张表：软件、要求版本、实测版本、状态、缺失时的安全安装建议。未经我确认，
  不要执行需要管理员权限或会改变系统级配置的安装。

C. 依赖与本地资产
- 使用 Corepack 激活项目声明的 pnpm 版本，然后执行 pnpm install --frozen-lockfile。
- 根据 apps/web/.env.example 核对 apps/web/.env.local 的变量名覆盖情况；缺值只列变量名，
  不显示值。告诉我需要从密码管理器恢复哪些类别。
- 不迁移 node_modules、.turbo、dist、.next、Rust target 或
  docs/prototypes/dev-dashboard/state.generated.js；它们应在新电脑重建。
- 运行 pnpm dashboard，随后运行 pnpm dashboard:verify-static 和
  pnpm dashboard:verify-modules。

D. 完整性门禁
- 运行 pnpm git:sync-check -- --fetch --deep。
- 若失败，逐项报告 dirty file、本地独有 branch/ref/reflog commit、未远端化 stash、
  unreachable commit、未跟踪项目配置或缺失 env 变量名；不要通过删除数据伪造通过。
- 只在我指定具体开发任务和产品模块后，按 AGENTS.md 的六模块路由创建一条这台电脑
  独占的 codex/<module>/<feature>-<machine> 短分支，并立即设置 upstream。

E. 最终输出
- 给出 READY 或 BLOCKED 结论。
- 分开报告：GitHub/分支状态、软件环境、依赖安装、密钥/本地资产、门禁结果、阻塞项。
- 列出运行过的命令和关键结果，但不要泄露密钥、token、个人路径中的敏感内容。
- 明确说明本次没有执行哪些动作：跨产品线合并、发布、部署、force-push、归档删除。
- 如果 READY，给出下一步安全开始开发的三条命令；如果 BLOCKED，给出最小修复步骤，
  修复后重新运行深度门禁。
```

## 使用说明

- 若只使用 Codex，把 prompt 粘到项目的新 Codex 任务即可。
- 若只使用 Claude Code，同一 prompt 可直接使用；其 Workflow V2 Handoff 必须按
  `CLAUDE.md` 原样显示。
- 新电脑尚未拿到密钥时，GitHub 与依赖检查仍可先完成；最终结论应标为
  `BLOCKED: secure secret restore pending`，不能把密钥缺失伪报为 READY。
