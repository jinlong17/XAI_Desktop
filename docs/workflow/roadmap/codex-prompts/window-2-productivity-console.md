# Codex Window 2 — Track B: 效率工具 + 控制台

直接复制下面的 `Goal:` 块到 Codex 窗口即可。

---

```text
Goal:
你是 Track B worker，负责效率工具和控制台。8-10 小时连续推进以下 feature，用 mock 数据层先行构建完整 UI 和业务逻辑。不要 ship，不要 push。

你是三个并行 Codex 窗口之一：
- Track A (另一个窗口): 桌面地基 + 数据层 — G1 ship → G2 全量 → G3 闭环
- Track B (你): 效率工具 + 控制台 — G4 全量 + G5 全量 mock 先行
- Track C (另一个窗口): 桌面挂件 + Web + AI — G6 + G7 + G8 全量 scaffold

Branch: codex/track-b-productivity-console
从当前 HEAD 创建此 branch 后开始工作。

文件所有权（你只能修改这些）:
- packages/plugin-productivity/  (新建或已有)
- packages/plugin-clipboard/  (新建或已有)
- packages/plugin-labels/  (新建或已有)
- packages/plugin-console/  (新建或已有)
- packages/plugin-project/  (新建或已有)
- docs/reviews/<你负责的 feature>/
- 你自己新建 package 的 docs/

禁止修改:
- packages/plugin-organizer/
- packages/core-data/  (Track A 负责)
- packages/core/src/types/  (Track A 负责, 你只读)
- apps/desktop/src-tauri/  (Track A 负责)
- apps/desktop/src/windows/  (Track A 负责)
- packages/plugin-widgets/
- packages/plugin-calendar/
- packages/plugin-pet/
- packages/plugin-ai-cube/
- apps/web/
- docs/contracts/  (Track A 独占, 你要提新 contract 写到 docs/reviews/<feature>/proposed-contract-changes.md)

数据层策略 — Mock 先行:
G2 Repository 正在 Track A 构建，你现在用 MockDataAdapter:

interface DataAdapter<T> {
  getAll(): Promise<T[]>
  getById(id: string): Promise<T | null>
  save(item: T): Promise<void>
  delete(id: string): Promise<void>
}

// 每个 plugin 内部实现 LocalStorageAdapter<T>
// G2 完成后替换为 RepositoryAdapter<T>
// adapter 通过 React Context 注入，组件不直接依赖具体实现

Feature 序列（按优先级顺序执行）:

1. G4-E1 Global Label system — plugin-labels
   - 新建 packages/plugin-labels/ (package.json + tsconfig.json + manifest.json)
   - Label entity: { id, name, color, icon?, createdAt }
   - LabelPicker component (keyboard/multi-select/recent)
   - LabelBadge component
   - useLabelStore hook (backed by MockDataAdapter)
   - Export via packages/plugin-labels/src/index.ts
   - Feature brief: docs/reviews/label-system/feature-brief.md
   - 测试: pnpm --filter @repo/plugin-labels check-types

2. G4-E2 Todo moderate loop — plugin-productivity
   - 新建 packages/plugin-productivity/ (如果不存在)
   - Todo entity: { id, title, description, status, priority, quadrant, dueDate, labels[], pomodoroCount, createdAt }
   - Eisenhower quadrant view (urgent×important 2×2 grid)
   - TodoItem, TodoList, TodoQuickAdd components
   - useTodoStore hook (MockDataAdapter)
   - Quick-add 交互: 输入标题 → 自动分配象限
   - 测试: check-types

3. G4-E3 Pomodoro timer
   - 在 plugin-productivity 内添加
   - PomodoroTimer component (25/5/15 min cycles)
   - PomodoroOverlay (desktop lightweight timer，纯 React 实现)
   - usePomodoroStore hook
   - 与 Todo 联动: 选择 Todo 开始 Pomodoro

4. G4-E4 Habits basics
   - 在 plugin-productivity 内添加
   - Habit entity: { id, name, frequency, streak, history[], labels[] }
   - HabitCalendarMini component (热力图/打卡日历)
   - HabitCard component
   - useHabitStore hook (MockDataAdapter)

5. G4-E5 Clipboard local history — plugin-clipboard
   - 新建 packages/plugin-clipboard/
   - ClipboardEntry entity: { id, content, type, source?, pinned, createdAt }
   - ClipboardList component (带类型过滤和搜索)
   - ClipboardPrivacy controls (redact patterns, auto-clear timer)
   - useClipboardStore hook (MockDataAdapter)
   - 注意: 实际系统剪贴板监听需要 Tauri command (G2.4+)，现在用 mock 输入

6. G5-E1 Console shell scaffold — plugin-console
   - 新建 packages/plugin-console/ (如果不存在)
   - ConsoleLayout component (sidebar + main area + header)
   - PluginSlotRegistry: 让各 plugin 注册 sidebar nav items
   - ConsoleSearch component (全局搜索 UI shell, 搜索逻辑后接)
   - ConsoleSettings component (placeholder sections)
   - 整合 Label/Todo/Clipboard 的 nav entries

7. G4-S9 Sequential paste queue
   - 在 plugin-clipboard 内添加
   - PasteQueue component: 多条剪贴板内容按顺序粘贴
   - 用户选择多条 → 依次 paste → 自动前进到下一条
   - usePasteQueue hook

8. G4-S10 OCR mode baseline (UI contract)
   - 在 plugin-clipboard 内添加
   - OcrPreview component: 图片类剪贴板的文字识别结果展示
   - 实际 OCR 引擎用 mock (将来接 macOS Vision 或 AI)
   - 只定义 UI contract 和数据流，不实现真实 OCR

9. G4-E6 Cmd+K local search
   - 在 plugin-console 内或独立 hook
   - CommandPalette component (Cmd+K 唤起)
   - 跨实体搜索: Label, Todo, Habit, Clipboard, Project
   - SearchResult component (带 action: open/reveal/copy/create)
   - useCommandPalette hook
   - 搜索后端用 mock in-memory filter (将来接 Repository query)

10. G5-E1 Console shell scaffold — plugin-console
    - 新建 packages/plugin-console/ (如果不存在)
    - ConsoleLayout component (sidebar + main area + header)
    - PluginSlotRegistry: 让各 plugin 注册 sidebar nav items
    - ConsoleSearch component (全局搜索 UI shell, 搜索逻辑后接)
    - ConsoleSettings component (placeholder sections)
    - 整合 Label/Todo/Clipboard 的 nav entries

11. G5-E2 Project board scaffold — plugin-project
    - 新建 packages/plugin-project/
    - Project entity: { id, name, lists[], labels[] }
    - Card entity: { id, title, listId, order, labels[], dueDate, checklist[] }
    - BoardView component (看板拖拽, 纯 React state)
    - CardDetail component (description + checklist + labels)
    - useProjectStore hook (MockDataAdapter)

12. G5-E3 Console↔Desktop linkage
    - ConsoleDesktopBridge: Console 操作触发桌面行为的 event 接口
    - "Create task from Grid item" 的 mock 交互 (需要 plugin-organizer event, 用 mock)
    - GridItemToTask conversion utility
    - proposed contract: docs/reviews/console-desktop-link/proposed-contract-changes.md

13. G5-E4 Notification center baseline
    - 在 plugin-console 内
    - NotificationPanel component (侧边栏通知列表)
    - Notification entity: { id, type, title, body, read, createdAt, sourcePlugin }
    - useNotificationStore hook (MockDataAdapter)
    - Pomodoro 完成 / Todo 到期 / Habit 提醒的 mock 通知

每个新 plugin 的初始化步骤:
1. packages/plugin-xxx/package.json (name: @repo/plugin-xxx)
2. packages/plugin-xxx/tsconfig.json (extends typescript-config)
3. packages/plugin-xxx/manifest.json (plugin metadata)
4. packages/plugin-xxx/src/index.ts (唯一 public surface)
5. packages/plugin-xxx/src/types.ts (local entity types)
6. packages/plugin-xxx/src/hooks/ (state management)
7. packages/plugin-xxx/src/components/ (UI)
8. packages/plugin-xxx/docs/ (dev_log.md, design.md, api.md, test.md)
9. docs/reviews/<slug>/feature-brief.md

每个 feature 的工作流 (简化版):
1. Feature brief
2. 简短 plan (记录在 dev_log)
3. 实现 + 小 commit
4. check-types
5. 更新 dev_log

每 2 小时 checkpoint:
- 写入 docs/workflow/roadmap/xai-v1.track-b-log.md (新建)

如果需要新的 EventMap event 或 Tauri command:
- 不要修改 docs/contracts/ 或 packages/core/src/types/
- 写入 docs/reviews/<feature>/proposed-contract-changes.md
- 用 mock/stub 代替真实 event

测试命令:
- pnpm --filter @repo/plugin-labels check-types (如果存在)
- pnpm --filter @repo/plugin-productivity check-types
- pnpm --filter @repo/plugin-clipboard check-types
- pnpm --filter @repo/plugin-console check-types
- pnpm --filter @repo/plugin-project check-types

遇到 blocker 不要停止:
- 需要 Tauri command: 用 mock，记录 proposed contract change
- 需要 Repository: 用 MockDataAdapter
- 需要 core/types 变更: 用 local type + proposed change
- 测试失败: 尝试修复，修不了写 incident，继续

不要清理/revert/删除其他人或其他窗口的改动。
不要修改 Track A/C 的文件。
不要 install 新依赖（如果需要新 npm 包，写入 incident 并 mock）。
```
