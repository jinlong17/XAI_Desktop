# G4 执行包:Phase 2 效率套件 + 剪贴板 + 全局 Label

| 字段 | 值 |
|---|---|
| Gate | G4 |
| 周期 | 6-7.5 周 |
| 前置 | G2 通过,G3 Organizer 日用闭环稳定 |
| 输出 | Todo/Pomodoro/Habits/Clipboard/Labels/Cmd+K 本地效率核心 |

## 1. 目标

补齐用户每日高频效率闭环。对标 TickTick 的轻量个人效率、Raycast Clipboard 的键盘优先、Maccy 的本地隐私,但不扩成团队协作或重度 GTD。

## 2. 非目标

- 不做协作任务。
- 不做甘特图。
- 不做完整日历同步。
- 不默认上传剪贴板。
- 不做复杂自动化平台。

## 3. Epic / Story / Task

| ID | 类型 | 内容 | 验收 |
|---|---|---|---|
| G4-E1 | Epic | 全局 Label 系统 | Todo/Clipboard/Project/Calendar 可复用同一 label model |
| G4-S1 | Story | Label CRUD | name/color/icon/scope,不可产生孤儿引用 |
| G4-S2 | Story | Label picker | 支持键盘搜索、多选、最近使用 |
| G4-E2 | Epic | Todo 中度闭环 | inbox/list/detail/due/priority/subtask |
| G4-S3 | Story | Eisenhower 四象限 | 仅作为 Todo 视图,不新建实体 |
| G4-S4 | Story | Todo 快速添加 | Cmd+K 或 quick tray 可建任务 |
| G4-E3 | Epic | Pomodoro | 任务绑定、计时、暂停、完成记录 |
| G4-S5 | Story | 桌面轻量计时器 | 不遮挡主要工作,支持最小化 |
| G4-E4 | Epic | Habits 基础 | habit CRUD、每日打卡、连续天数 |
| G4-S6 | Story | Habit calendar mini view | Phase 2 只做轻量统计 |
| G4-E5 | Epic | Clipboard 本地历史 | 文本/图片/文件/link 基础类型 |
| G4-S7 | Story | Clipboard privacy controls | 禁用应用、暂停记录、清空历史 |
| G4-S8 | Story | 类型过滤和搜索 | text/image/file/url/code filters |
| G4-S9 | Story | 顺序粘贴 | queue + next paste,失败可恢复 |
| G4-S10 | Story | OCR mode baseline | 手动 OCR 或延后到 G7,但 UI contract 先定 |
| G4-E6 | Epic | Cmd+K 本地搜索 | 搜 organizer/todo/clipboard/labels |
| G4-S11 | Story | 搜索结果可 action | open/reveal/copy/create task |

## 4. 文件范围

- 新增 `packages/plugin-productivity`
- 新增 `packages/plugin-clipboard`
- 新增 `packages/plugin-labels`
- `packages/core/src/types/events.ts`
- `packages/core-data/src/*`
- `apps/desktop/src-tauri/src/commands/clipboard.rs` 如需新增
- `apps/desktop/src-tauri/capabilities/*.json`

## 5. 数据边界

| Entity | 说明 |
|---|---|
| `label` | 全局标签,不可归属单插件 |
| `todo` | 个人任务,中度字段 |
| `pomodoro_session` | 计时记录 |
| `habit` / `habit_log` | 习惯和打卡 |
| `clipboard_item` | 本地历史,默认 device-local |

Clipboard 默认 device-local。除非用户明确开启 Sync,否则不进入云端 outbox。

## 6. 验收标准

- Todo/Pomodoro/Habit 至少完成一个完整日常使用循环。
- Clipboard 支持禁用应用、搜索、类型过滤、清空、暂停。
- Cmd+K P95 本地搜索 < 300ms,按 1000 条剪贴板记录测试。
- Label 不出现跨插件引用断裂。
- 隐私设置可以一键停止剪贴板记录。

## 7. 测试

```bash
pnpm --filter @repo/plugin-productivity test
pnpm --filter @repo/plugin-clipboard test
pnpm --filter @repo/plugin-labels test
pnpm --filter @repo/core-data test
pnpm check
```

## 8. 手工验证

- 复制密码管理器内容时确认 disabled app 生效。
- 复制图片、文件、URL、代码片段后搜索。
- 用顺序粘贴完成 5 条连续粘贴。
- 创建 Todo 并绑定 Pomodoro 完成。
