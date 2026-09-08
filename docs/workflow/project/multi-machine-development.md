# 多电脑开发与 GitHub 完整性准则

> 状态：Accepted（operator confirmed 2026-09-08）
> 范围：project-system；扩展 ADR-0013 的分支治理，不改变 Web/App/Plugin
> 产品线的独立性，也不授权任何跨线合并、发布或解冻。

## 1. 完整性的定义

GitHub 是项目代码、项目文档、开发规则和可恢复 Git 历史的交换事实源。
“已经同步”必须满足：在任意一台授权电脑上 fresh clone、fetch 全部远端 refs，
再通过安全渠道恢复密钥后，可以继续开发；不得依赖某台电脑独有的工作区、stash、
reflog、隐藏 ref、未跟踪源码或聊天记录。

完整仓库不是把 `web`、`dev` 等独立产品线强行合成一个分支。完整性由“正确的远端
分支拓扑 + 每个工作分支已发布 + 明确的本地资产策略”共同组成。

## 2. 事实来源分类

| 内容 | 事实来源 | 规则 |
|---|---|---|
| 源码、测试、PRD、ADR、开发日志、Agent/Skill/Workflow 配置 | GitHub Git refs | 必须 tracked、commit、push |
| 未完成但需要跨电脑继续的工作 | 独占短分支上的 WIP commit | 必须 push；stash 不能作为交接载体 |
| 历史恢复材料 | `codex/archive/*` 远端归档分支 | 只恢复目标文件/提交，禁止整条合并进长期分支 |
| `.env*`、API token、私钥、签名材料 | 密码管理器或加密迁移渠道 | 禁止进入 Git；Git 只保存无值模板 |
| 依赖、构建产物、缓存、生成快照 | 本机可重建 | 不上传；保存生成命令和版本约束 |
| Codex/Claude/Cursor 登录态与个人任务历史 | 对应应用同步或加密机器迁移 | 不是项目事实源，不能替代 Git handoff |

## 3. 多电脑并行规则

1. 一个可写短分支在同一时间只能由一台电脑/一个 worktree 拥有。两台电脑处理同一
   feature 时使用不同的 sibling branches，例如
   `codex/web/search-mbp` 与 `codex/web/search-studio`，再通过 PR、cherry-pick 或
   受治理的合并汇合。
2. 不在多台电脑上同时直接修改 `main`、`web`、`dev`、`desktop-next` 或
   `desktop-plugin-next`。长期分支只接收已审查的整合提交。
3. 每次开始前执行 fetch/prune，确认目标远端分支和本地基线；禁止从过期本地分支
   开始新工作。
4. 每个可恢复检查点都要 commit。切换电脑、结束当天工作或暂停超过一个会话前，
   必须 push 当前短分支，即使提交标题标为 `wip:`。
5. 禁止对长期分支 force-push。个人独占短分支如确需改写，只能在确认没有其他电脑
   消费后使用 `--force-with-lease`。
6. `web` 与 `dev` 的分叉是 ADR-0013 定义的正常产品线差异；多电脑完整性不得被解释
   为强制对齐或绕过 D3。

## 4. 开始工作门禁

```bash
git fetch --all --prune --tags
git status --short --branch
git branch -vv
git worktree list
```

- 当前工作区若有不属于本任务的改动，先确认所有权，不覆盖、不清理。
- 当前分支必须有 upstream；若准备写入，确认该分支没有被另一台电脑/另一个 worktree
  同时占用。
- 远端领先时先整合远端变化，再写新代码。

## 5. 切换电脑 / 会话收尾门禁

普通收尾：

```bash
pnpm git:sync-check -- --fetch
```

迁移电脑、清理 worktree 或定期深度审计：

```bash
pnpm git:sync-check -- --fetch --deep
```

通过条件：

- 工作树干净；
- 所有本地分支都有 upstream，且没有 ahead / gone；
- `git rev-list --branches --not --remotes --count` 为 `0`；
- `git rev-list --all --not --remotes --count` 为 `0`；
- `git rev-list --reflog --not --remotes --count` 为 `0`；
- 所有 stash commit 已能从远端 ref 到达；
- `--deep` 时不存在只保留在本机对象库里的 unreachable commit；
- 项目级 Agent/Skill/Workflow 跟踪面没有未跟踪文件；
- 本机 `.env.local` 出现的变量名都存在于 tracked `.env.example`，但值不得进入 Git。

如果检查失败，先 commit/push 或建立经过密钥扫描的 `codex/archive/*` 恢复分支；不得
用删除 stash、清 reflog 或垃圾回收来伪造通过。

## 6. Stash、隐藏 refs 与归档

- stash 仅用于同一电脑上的短暂上下文切换，不是跨电脑工作流。
- 需要继续开发的 stash 应恢复到独占短分支，形成 WIP commit 并 push。
- 只需要保留证据的旧 stash/隐藏 ref，可在密钥扫描后推到 `codex/archive/*`。
- 归档分支不代表代码已验证、已发布或应被合并；恢复时先阅读 diff，只提取需要的
  commit 或文件。
- `git fsck` 的 dangling blob/tree 不是开发事实源；但 dangling commit 在删除前必须
  判定为冗余或远端化。

## 7. 本地资产与密钥

- `apps/web/.env.local`：禁止上传；变量名由
  `apps/web/.env.example` 跟踪，值通过密码管理器/加密渠道在各电脑恢复。
- `web design/`：历史设计源，当前由远端恢复分支
  `codex/archive/web-design-source` 保存；不属于默认构建输入，不得整分支合并。
- `docs/prototypes/dev-dashboard/state.generated.js`：每台电脑运行 `pnpm dashboard`
  重建，不作为跨电脑事实源。
- `node_modules/`、`.turbo/`、`dist/`、`.next/`、Rust `target/`：全部重建。

任何新的“被 `.gitignore` 忽略但开发不可替代”的文件都必须在同一提交中选择一种
策略：改为 tracked、放入明确的远端制品库/归档 ref，或记录安全恢复渠道。不得只写
“保存在本机”。

## 8. 当前迁移归档基线（2026-09-08）

- `codex/archive/migration-20260908-stash-00` … `-22`：23 个历史 stash。
- `codex/archive/migration-20260908-reflog`：当时 63 个 reflog-only commits。
- `codex/archive/migration-20260908-unreachable`：当时 170 个 unreachable commits。
- `codex/archive/migration-20260908-codex-snapshot`：Codex 隐藏快照。
- `codex/archive/migration-20260908-design-assets` 与稳定别名
  `codex/archive/web-design-source`：历史 Web 设计源。

这些 refs 是灾难恢复层。日常开发应从对应产品线的长期分支创建新的独占短分支，
不要从迁移归档分支继续常规开发。
