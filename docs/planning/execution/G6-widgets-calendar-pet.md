# G6 执行包:Phase 3 Widgets + Calendar + 基础桌宠

| 字段 | 值 |
|---|---|
| Gate | G6 |
| 周期 | 6-7 周 |
| 前置 | G5 Console/Project 稳定 |
| 输出 | 桌面陪伴层与轻量聚合视图 |

## 1. 目标

在不破坏工作效率的前提下增加桌面陪伴与状态感:Widgets、桌面日历、习惯增强、时间进度条、基础桌宠、主题个性化。

## 2. 非目标

- 不做娱乐化主导的桌宠游戏。
- 不做完整日历双向同步。
- 不做动画资源大制作。
- 不做 AI 对话能力,AI 留到 G7。

## 3. Epic / Story / Task

| ID | 类型 | 内容 | 验收 |
|---|---|---|---|
| G6-E1 | Epic | Widget host | clock/weather/note/progress/habit widgets |
| G6-S1 | Story | Widget lifecycle | add/remove/move/resize/persist |
| G6-S2 | Story | Widget density/theme | compact/comfortable,light/dark |
| G6-E2 | Epic | Desktop calendar | 汇总 Todo due、Pomodoro、Habit、Project due |
| G6-S3 | Story | Calendar mini/month view | 只读聚合,点击进 Console |
| G6-E3 | Epic | Habit enhanced stats | streak/calendar/weekly summary |
| G6-E4 | Epic | Time progress/countdown | day/week/month/project countdown |
| G6-E5 | Epic | Basic pet | 状态、动画、提醒气泡、可隐藏 |
| G6-S4 | Story | Pet non-intrusive mode | 不抢焦点,不遮挡关键操作 |
| G6-E6 | Epic | Personalization | theme tokens, wallpaper-aware contrast baseline |

## 4. 文件范围

- 新增 `packages/plugin-widgets`
- 新增 `packages/plugin-calendar`
- 新增 `packages/plugin-pet`
- `packages/plugin-productivity`
- `packages/plugin-project`
- `packages/core/src/types/window.ts`
- `apps/desktop/src-tauri/src/commands/window.rs`

## 5. 验收标准

- Widget 可添加、移动、重启恢复。
- Calendar 至少聚合 Todo due、Project card due、Habit log。
- Pet 可完全关闭,默认不遮挡工作。
- 7 天长跑不出现窗口堆积和内存明显增长。
- 主题和密度不破坏 G3-G5 的信息布局。

## 6. 测试

```bash
pnpm --filter @repo/plugin-widgets test
pnpm --filter @repo/plugin-calendar test
pnpm --filter @repo/plugin-pet test
pnpm check
```

## 7. 手工验证

- 添加 5 个 widgets,重启后恢复。
- Calendar 点击 due item 跳到 Console detail。
- Pet 开关、隐藏、提醒气泡、Space 切换。
