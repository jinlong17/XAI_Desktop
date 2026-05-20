# Codex Window 1 — Track A: 桌面地基 + 数据层

直接复制下面的 `Goal:` 块到 Codex 窗口即可。

---

```text
Goal:
你是 Track A worker，负责桌面地基和数据层。8-10 小时连续推进以下 feature 序列到 READY_TO_SHIP 或 BLOCKED，不要 ship，不要 push。

你是三个并行 Codex 窗口之一：
- Track A (你): 桌面地基 + 数据层 — G1 ship → G2 全量生产 → G3 Organizer 闭环
- Track B (另一个窗口): 效率工具 + 控制台 — G4 全量 + G5 全量 mock 先行
- Track C (另一个窗口): 桌面挂件 + Web + AI — G6 + G7 + G8 全量 scaffold

Branch: codex/track-a-desktop-foundation
从当前 HEAD 创建此 branch 后开始工作。

文件所有权（你只能修改这些）:
- packages/plugin-organizer/
- packages/core-data/
- packages/core/src/types/
- apps/desktop/src-tauri/src/commands/
- apps/desktop/src-tauri/src/platform/
- apps/desktop/src-tauri/capabilities/
- apps/desktop/src/windows/GridWindow.tsx
- docs/contracts/  (你独占 contracts 写权限)
- docs/workflow/roadmap/  (你负责的 manifest)
- docs/reviews/<你负责的 feature>/
- packages/window-command-contract/docs/
- packages/grid-shell-organizer-content/docs/
- packages/multi-grid-event-scope/docs/
- packages/grid-persistence/docs/
- packages/repository-v0-contract/docs/

禁止修改:
- packages/plugin-productivity/
- packages/plugin-clipboard/
- packages/plugin-labels/
- packages/plugin-console/
- packages/plugin-project/
- packages/plugin-widgets/
- packages/plugin-calendar/
- packages/plugin-pet/
- packages/plugin-ai-cube/
- apps/web/

Feature 序列（按优先级顺序执行）:

1. Ship G1.2 grid-shell-organizer-content
   - 状态已经是 READY_TO_SHIP
   - 更新 manifest 到 SHIPPED
   - push 到 origin (已授权)
   - 然后更新 G1.4 的依赖状态

2. Ship G1.4 multi-grid-event-scope
   - 状态已经是 READY_TO_SHIP
   - 更新 manifest 到 SHIPPED
   - push

3. G2.1 Repository v0 contract
   - 读取 docs/planning/execution/G2-data-security-foundation.md
   - 初始化 G2 manifest: docs/workflow/roadmap/xai-g2-data-security.md
   - 在 packages/core-data/ 定义 Repository v0 接口:
     - Entity base type (id, createdAt, updatedAt, version, deletedAt)
     - Repository<T> interface (getAll, getById, save, delete, query)
     - 具体 entity types: GridItem, Label, Todo, Habit, ClipboardEntry, Project, Card
   - 更新 docs/contracts/data-repository-v0.md
   - 写 unit tests
   - 测试: pnpm --filter @repo/core-data test

4. G2.2 SQLite/SQLCipher PoC
   - 在 packages/core-data/ 实现 SQLite driver
   - Tauri command: apps/desktop/src-tauri/src/commands/database.rs
   - 参考已有的 packages/core-data-sqlite-driver/ 和 packages/sqlcipher-local-db/
   - 测试: cargo test

5. G2.3 localStorage migration adapter
   - 从现有 localStorage 数据迁移到 SQLite
   - 向后兼容: 如果 SQLite 不可用，回退到 localStorage

6. G2.4 Keychain opaque handle
   - 参考已有的 packages/keychain-bridge-macos/ 和 packages/rust-keyvault-opaque-handle/
   - Tauri command: apps/desktop/src-tauri/src/commands/keychain.rs

7. G2.5 Tauri capability allowlist
   - 审计并最小化 apps/desktop/src-tauri/capabilities/default.json
   - 只开放已实现的 window/database/keychain commands
   - 更新 docs/contracts/tauri-commands-v0.md

8. G2.6 Single-table sync baseline
   - 在 packages/plugin-account/ 实现单表同步原型
   - 参考已有的 packages/single-table-todos-e2e/
   - 需要 G2.1 Repository + G2.4 Keychain
   - 如果 Supabase 不可用，用 mock remote，标 deferred gate

9. G1.5 grid-persistence (在 G2.1 完成后解锁)
   - Grid rect/item placement 的 repository 接口
   - 接入 G2.1 Repository v0
   - 启动恢复所有 open Grid 或 last active Grid
   - 损坏 state 不导致白屏，Control 可 reset
   - 测试: pnpm --filter @repo/plugin-organizer test

10. G3-E1 Grid item model productization
    - 读取 docs/planning/execution/G3-organizer-loop.md
    - GridItem entity 接入 Repository (G2.1 完成后)
    - Finder file/folder/app drag-in 生成 typed item
    - 测试: pnpm --filter @repo/plugin-organizer test

11. G3-S3 New URL item
    - URL entity: 用户手动输入 URL 创建 Grid item
    - URL 元数据提取 (title/favicon, mock 或 fetch)
    - 与 GridItem model 集成

12. G3-E2 Auto-classification rules
    - 规则引擎: 按文件类型/扩展名/路径模式自动分类
    - RuleSet entity: { id, name, conditions[], targetGrid }
    - useAutoClassifier hook
    - 内置默认规则集 (图片/文档/代码/应用)

13. G3-E3 Finder collaboration
    - Reveal in Finder (打开文件所在目录)
    - Rename from Grid (重命名同步到 Finder)
    - Remove from Grid (只从 Grid 移除，不删除原文件)
    - Tauri commands: reveal_in_finder, rename_file

14. G3-E4 Empty state and error recovery
    - Grid 空状态引导 (drop/add URL/choose folder)
    - 无效路径处理 (文件被删除/移动后的错误状态)

每个 feature 的工作流:
1. 如果没有 feature brief，创建 docs/reviews/<slug>/feature-brief.md
2. 简短 plan (直接在 dev_log 中记录)
3. 实现 + 小 commit
4. 跑相关测试
5. 更新 dev_log Status Panel
6. 如果需要人工验证/真机/外部账号，写 deferred gate 到 docs/workflow/roadmap/xai-v1.deferred-gates.md

每 0.5 小时 checkpoint:
- 写入 docs/workflow/roadmap/xai-v1.autorun-20260519.md (追加，不要覆盖已有内容)

测试命令:
- pnpm --filter @repo/core-data test
- pnpm --filter @repo/core check-types
- pnpm --filter @repo/plugin-organizer check-types
- pnpm --filter desktop build
- cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
- cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml

遇到 blocker 不要停止整个 run:
- 测试失败: 尝试修复，修不了写 incident 到 docs/workflow/roadmap/xai-v1.incidents.md
- 依赖缺失: 标 BLOCKED，继续下一个 feature
- 人工验证: 写 deferred gate，继续

不要清理/revert/删除其他人或其他窗口的改动。
不要修改 Track B/C 的文件。
不要 install 新依赖（node_modules 和 Cargo deps 已预装）。
```
