# Codex Window 4 — Track D: 收尾 + Repository 数据层对接

直接复制下面的 `Goal:` 块到 Codex 窗口即可。

---

```text
Goal:
Track D worker。8h 连续推进两类工作：(1) 第一轮遗留的 5 个 feature；(2) 把 9 个 plugin 从 MockDataAdapter 接入 Repository v0 真实数据层。不要 ship，不要 push。

Branch: codex/track-d-repo-integration（从 main HEAD 创建）

前置：三个 Track 已合并到 main，全部测试通过。
- core-data 已导出: Repo<T>, RepoRecord, createInMemoryRepo, createTauriRepo, dbInit
- 5 个 Track B plugin 用 LocalStorageAdapter<T>，需要替换
- 4 个 Track C plugin 无 adapter，需要新增

文件所有权（你只能修改这些）:
- packages/plugin-labels/
- packages/plugin-productivity/
- packages/plugin-clipboard/
- packages/plugin-console/
- packages/plugin-project/
- packages/plugin-widgets/
- packages/plugin-calendar/
- packages/plugin-pet/
- packages/plugin-ai-cube/
- packages/plugin-organizer/ (仅 G3 剩余 feature)
- apps/desktop/src-tauri/src/commands/ (仅 G3-S6 Finder tag 需要新 command)
- docs/reviews/<feature>/

禁止修改:
- packages/core-data/ (已冻结)
- packages/core/src/types/ (已冻结)
- apps/web/ (Track E 负责)
- docs/contracts/ (已冻结，提 change 写 proposed-contract-changes.md)

========================================
Part 1: 遗留 Feature（5 个，约 3h）
========================================

1. G3-S4 One-click Desktop organizer
   - 在 plugin-organizer 内
   - "一键整理桌面" 功能：扫描 ~/Desktop 文件，按 G3-E2 auto-classification 规则自动分配到 Grid
   - 使用已有的 useAutoClassifier hook
   - OrganizerOneClick component + 确认对话框
   - 测试: pnpm --filter @repo/plugin-organizer test

2. G3-S5 Folder mapping as Grid source
   - 在 plugin-organizer 内
   - 选择一个文件夹 → Grid 自动映射该文件夹内容
   - FolderGrid component: 监听文件夹变化（mock watcher，实际需要 Tauri fs watch）
   - useFolderMapping hook
   - 如果需要 Tauri command 做 fs watch，用 mock + proposed contract change

3. G3-S6 Finder tag read/write
   - 在 plugin-organizer 内
   - 读取/写入 macOS Finder tag (色标)
   - 需要新 Tauri command: read_finder_tags / write_finder_tags
   - apps/desktop/src-tauri/src/commands/finder.rs 添加 tag 相关命令
   - TagPicker component 对接 plugin-labels 的 LabelPicker 设计
   - 如果 Finder tag API 复杂，先实现 read，write 用 mock

4. G5-S7 Create task from Grid item
   - 跨 plugin 交互: plugin-organizer → plugin-productivity
   - 通过 @repo/core/events 的 typed event 通信，不直接 import
   - 新 event: "organizer:grid:create-task" → payload { gridItemId, title, path }
   - plugin-productivity 监听并创建 Todo
   - 写入 docs/reviews/create-task-from-grid/proposed-contract-changes.md

5. G8-S4 Export/import
   - 在 apps/web/ 或 plugin-account 内（看哪个更合适）
   - 但因为 apps/web 属于 Track E，这里只做 plugin 侧的 export/import 数据工具
   - ExportService: 导出所有 entity 为加密 JSON bundle
   - ImportService: 从 bundle 恢复数据
   - 如果 apps/web 需要对应 UI，写 proposed contract change 留给 Track E

========================================
Part 2: 数据层对接（9 个 plugin，约 5h）
========================================

对接策略：
- 每个 plugin 的 DataAdapter<T> 或 LocalStorageAdapter<T> 替换为 RepoAdapter<T>
- RepoAdapter<T> 内部使用 @repo/core-data 的 Repo<T> 接口
- 通过 React Context (RepoProvider) 注入，组件代码不变
- 保留 LocalStorageAdapter 作为 fallback（Tauri 环境外或 Repository 初始化失败时）
- entity types 必须 extends RepoRecord（添加 createdAt, updatedAt, version, deletedAt）

对接模板（每个 plugin 重复）：

a) 更新 types.ts — entity extends RepoRecord
b) 新建 src/data/RepoAdapter.ts — 实现 DataAdapter<T> 接口，内部调用 Repo<T>
c) 新建 src/data/RepoProvider.tsx — React Context 提供 adapter 选择逻辑
d) 更新 store hook — 从 context 获取 adapter，不再硬编码 LocalStorageAdapter
e) 更新 index.ts — 导出 RepoProvider
f) 保留 LocalStorageAdapter.ts 作为 fallback
g) 更新 docs/dev_log.md

按以下顺序对接（从简单到复杂）：

6. plugin-labels → RepoAdapter
   - Label extends RepoRecord
   - 最简单的 entity，作为模板验证

7. plugin-productivity → RepoAdapter
   - Todo, Habit 两个 entity
   - Pomodoro session 不持久化（内存状态即可）

8. plugin-clipboard → RepoAdapter
   - ClipboardEntry extends RepoRecord
   - 注意隐私字段（redacted content 不进 sync scope）

9. plugin-project → RepoAdapter
   - Project, Card 两个 entity
   - Card 有 order 字段，确保排序保留

10. plugin-console → RepoAdapter
    - Notification extends RepoRecord
    - CommandPalette 搜索改为查询多个 Repo

11. plugin-widgets → 新增 RepoAdapter
    - Widget 配置持久化
    - 目前无 adapter，需要新建完整 data 层

12. plugin-calendar → 新增 RepoAdapter
    - CalendarEvent extends RepoRecord（如果有本地事件）
    - 如果纯聚合模式则不需要 adapter，只需要读取其他 plugin 的数据

13. plugin-pet → 新增 RepoAdapter
    - Pet state 持久化（mood, energy, streak）

14. plugin-ai-cube → 新增 RepoAdapter
    - ConversationHistory extends RepoRecord
    - CostUsage 日计数持久化

每个对接完成后立即运行:
- pnpm --filter @repo/plugin-<name> check-types

全部完成后运行:
- pnpm -r check-types
- pnpm --filter desktop build
- pnpm --filter @repo/core-data test

每 2h checkpoint 写入 docs/workflow/roadmap/xai-v1.track-d-log.md（新建）。

遇到 blocker:
- core-data 接口不兼容: 写 incident + proposed contract change，保留 LocalStorageAdapter
- Tauri command 缺失: 用 mock，记录 proposed contract
- 测试失败: 修复或写 incident 后继续

不要 revert 其他人改动。不要 install 新依赖。不要修改 Track E 的文件。
```
