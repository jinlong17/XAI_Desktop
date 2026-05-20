# Codex Window 1 — Track A: 桌面地基 + 数据层

直接复制下面的 `Goal:` 块到 Codex 窗口即可。

---

```text
Goal:
Track A worker，负责桌面地基和数据层。8-10h 连续推进以下 feature 到 READY_TO_SHIP 或 BLOCKED。不要 ship，不要 push。

三并行窗口之一：
- Track A (你): G1 ship → G2 全量生产 → G3 Organizer 闭环
- Track B (另一窗口): G4+G5 mock 先行 (plugin-productivity/clipboard/labels/console/project)
- Track C (另一窗口): G6+G7+G8 scaffold (plugin-widgets/calendar/pet/ai-cube, apps/web)

Branch: codex/track-a-desktop-foundation（从 HEAD 创建）

文件所有权（只能修改这些）:
- packages/plugin-organizer/, packages/core-data/, packages/core/src/types/
- apps/desktop/src-tauri/src/commands/, apps/desktop/src-tauri/src/platform/, apps/desktop/src-tauri/capabilities/
- apps/desktop/src/windows/GridWindow.tsx
- docs/contracts/ (独占写权限), docs/workflow/roadmap/, docs/reviews/<feature>/
- packages/window-command-contract/docs/, packages/grid-shell-organizer-content/docs/
- packages/multi-grid-event-scope/docs/, packages/grid-persistence/docs/, packages/repository-v0-contract/docs/

禁止修改 Track B/C 所有 package 和 apps/web/。

Feature 序列（按优先级顺序）:

1. Ship G1.2 grid-shell-organizer-content — READY_TO_SHIP，更新 manifest→SHIPPED，push (已授权)
2. Ship G1.4 multi-grid-event-scope — 同上

3. G2.1 Repository v0 contract
   - 读 docs/planning/execution/G2-data-security-foundation.md
   - core-data 定义 Entity base type + Repository<T> interface (getAll/getById/save/delete/query)
   - 具体 entity: GridItem, Label, Todo, Habit, ClipboardEntry, Project, Card
   - 更新 docs/contracts/data-repository-v0.md，写 unit tests

4. G2.2 SQLite/SQLCipher PoC — core-data SQLite driver + Tauri command database.rs，参考已有 core-data-sqlite-driver/ 和 sqlcipher-local-db/
5. G2.3 localStorage migration — 迁移到 SQLite，回退兼容
6. G2.4 Keychain opaque handle — 参考 keychain-bridge-macos/ 和 rust-keyvault-opaque-handle/，Tauri command keychain.rs
7. G2.5 Tauri capability allowlist — 审计最小化 capabilities/default.json，更新 tauri-commands-v0.md
8. G2.6 Single-table sync baseline — 参考 single-table-todos-e2e/，Supabase 不可用则 mock + deferred gate

9. G1.5 grid-persistence（G2.1 完成后解锁）
   - Grid rect/item placement 接入 Repository v0
   - 启动恢复所有 open Grid，损坏 state 不导致白屏

10. G3-E1 Grid item model productization — GridItem entity 接入 Repository，Finder file/folder/app drag-in 生成 typed item
11. G3-S3 New URL item — 手动输入 URL 创建 Grid item，元数据提取
12. G3-E2 Auto-classification rules — 按文件类型/扩展名/路径自动分类，内置默认规则集
13. G3-E3 Finder collaboration — Reveal in Finder / Rename / Remove，Tauri commands
14. G3-E4 Empty state + error recovery — 空状态引导，无效路径处理

每个 feature 工作流: brief → plan → 实现+小commit → 测试 → 更新 dev_log。
每 0.5h checkpoint 写入 xai-v1.autorun-20260519.md（追加不覆盖）。
人工验证/真机/外部账号 → deferred gate。测试失败 → 写 incident 后继续下一个。
不要 revert 其他人改动。不要 install 新依赖。

测试: pnpm --filter @repo/core-data test, pnpm --filter @repo/core check-types, pnpm --filter @repo/plugin-organizer check-types, pnpm --filter desktop build, cargo test/check
```
