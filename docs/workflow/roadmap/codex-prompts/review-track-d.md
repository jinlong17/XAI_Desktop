# Claude Code Review — Track D

直接复制下面的 `Goal:` 块到 Claude Code CLI 执行。

---

```text
全面审查 codex/track-d-repo-integration 分支的改动（103 files, +2238 -104）。
这个分支做了两件事：(1) 5 个遗留 feature 收尾；(2) 9 个 plugin 接入 Repository v0 真实数据层。

审查范围：
git diff main...codex/track-d-repo-integration

审查维度（逐条检查并给出 PASS / ISSUE 结论）：

1. Repository 对接正确性
   - 每个 plugin 的 RepoAdapter 是否正确实现 DataAdapter<T> 接口
   - entity type 是否正确 extends RepoRecord（id, createdAt, updatedAt, version, deletedAt）
   - RepoProvider context 注入是否正确，组件是否不再直接依赖 LocalStorageAdapter
   - LocalStorageAdapter 是否保留为 fallback
   - 涉及 plugin: labels, productivity, clipboard, console, project, widgets, calendar, pet, ai-cube

2. 架构红线（docs/SYSTEM_ARCHITECTURE.md §4）
   - 业务逻辑是否只在 packages/plugin-*/ 内，不在 apps/desktop/src/
   - plugin 间通信是否通过 @repo/core/events，不直接 import
   - Host 是否没有新增业务状态
   - packages/core/src/types/ 是否未被修改（已冻结）
   - docs/contracts/ 是否未被修改（Track D 不拥有写权限）

3. G3 收尾 feature 质量
   - G3-S4 OrganizerOneClick: 扫描逻辑是否合理，是否调用已有 auto-classifier
   - G3-S5 FolderGrid + useFolderMapping: 文件夹监听是否用 mock，接口是否为将来接 Tauri fs watch 预留
   - G3-S6 Finder tag: read_finder_tags / write_finder_tags Tauri command 实现质量，TagPicker 与 LabelPicker 的关系
   - G5-S7 Create task from Grid: event 通信是否使用 typed event，是否避免了 plugin-organizer → plugin-productivity 直接 import
   - G8-S4 ExportService: 加密 bundle 格式是否合理，import 是否有完整性验证

4. 类型安全
   - pnpm -r check-types 是否通过（运行验证）
   - 新增 type 是否与 core-data 的 RepoRecord 兼容
   - 泛型约束是否正确

5. 测试覆盖
   - 有无新增 unit test
   - RepoAdapter 是否有 mock Repo 的测试
   - 关键路径（save → getAll → getById → delete）是否有测试

6. 文档一致性
   - dev_log 是否更新
   - proposed-contract-changes.md 是否记录了需要的 EventMap / Tauri command 变更
   - 新增文件是否有合理的 docs 四件套

验证命令（请运行）：
- git diff --stat main...codex/track-d-repo-integration
- git diff main...codex/track-d-repo-integration -- '*.ts' '*.tsx' | head -500
- pnpm --filter @repo/plugin-labels check-types
- pnpm --filter @repo/plugin-productivity check-types
- pnpm --filter @repo/plugin-clipboard check-types
- pnpm --filter @repo/plugin-console check-types
- pnpm --filter @repo/plugin-project check-types
- pnpm --filter @repo/plugin-widgets check-types
- pnpm --filter @repo/plugin-calendar check-types
- pnpm --filter @repo/plugin-pet check-types
- pnpm --filter @repo/plugin-ai-cube check-types
- pnpm --filter @repo/plugin-organizer check-types
- pnpm --filter desktop build

输出格式（严格遵守）：

## Track D Review — Claude Code

**Reviewer**: Claude Code cross-vendor review
**Branch**: codex/track-d-repo-integration
**Commit**: 1d3e718
**Verdict**: APPROVED / REVISE / BLOCKED

### 1. Repository 对接 — PASS/ISSUE
（每个 plugin 一行结论）

### 2. 架构红线 — PASS/ISSUE
（逐条）

### 3. G3 收尾 feature — PASS/ISSUE
（每个 feature 一行）

### 4. 类型安全 — PASS/ISSUE

### 5. 测试覆盖 — PASS/ISSUE

### 6. 文档一致性 — PASS/ISSUE

### Issues（如有）
- [P0/P1/P2] 具体问题描述 + 修复建议

### Verdict 理由
（1-2 句话）

如果 Verdict 是 REVISE 或 BLOCKED，在 Issues 部分列出具体需要 Codex 修复的项目清单，每项包含：
- 文件路径
- 问题描述
- 修复方向

这个清单将直接传递给 Codex 做修复。
```
