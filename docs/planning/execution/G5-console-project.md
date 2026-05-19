# G5 执行包:Phase 2.5 整体控制台 + 项目看板

| 字段 | 值 |
|---|---|
| Gate | G5 |
| 周期 | 4-6 周 |
| 前置 | G4 数据模型与 Label 稳定 |
| 输出 | Console 深度管理窗口 + Trello 式个人项目看板 |

## 1. 目标

建立 XAI 的第二个核心用户面:整体控制台。控制台对齐 TickTick 的 sidebar/list/detail 信息密度和 Trello 的 board/list/card 流转,但保持个人工作台定位。

## 2. 非目标

- 不做多人协作。
- 不做 Power-Ups。
- 不做复杂权限系统。
- 不做重度报表。

## 3. Epic / Story / Task

| ID | 类型 | 内容 | 验收 |
|---|---|---|---|
| G5-E1 | Epic | Console shell | sidebar + list + detail + command bar |
| G5-S1 | Story | Plugin slot registry | Productivity/Clipboard/Project/Settings 可注册 view |
| G5-S2 | Story | 全局搜索页 | 支持跨实体 search/filter/action |
| G5-S3 | Story | Settings section | 隐私、快捷键、外观、同步入口 |
| G5-E2 | Epic | Project board | board/list/card/checklist/due/label |
| G5-S4 | Story | Board CRUD | 创建、归档、重命名 |
| G5-S5 | Story | Card drag flow | list 间拖拽稳定,顺序持久化 |
| G5-S6 | Story | Card detail | description/checklist/due/labels/link todo |
| G5-E3 | Epic | Console 与 Desktop 联动 | Grid item 可关联 project/todo |
| G5-S7 | Story | 从 Grid 创建 task/card | context action 可用 |
| G5-E4 | Epic | 通知中心 baseline | due/pomodoro/sync/privacy warning |

## 4. 文件范围

- 新增 `packages/plugin-console`
- 新增 `packages/plugin-project`
- `packages/plugin-productivity`
- `packages/plugin-labels`
- `apps/desktop/src/windows/ControlWindow.tsx`
- `apps/desktop/src/windows/ConsoleWindow.tsx` 如需新增
- `packages/core/src/registry/*`

## 5. UX 标准

- Console 是工作台,不是 landing page。
- 信息密度高,留白克制。
- 常用操作键盘可达。
- 侧边栏、列表、详情都不能出现卡片套卡片。
- 页面标题和按钮文本不能挤压或换行失控。

## 6. 验收标准

- Console 可独立打开并完成 Todo/Clipboard/Project 基础管理。
- Project board 支持至少 3 list、50 card 流畅拖拽。
- Board/Card 数据重启后恢复。
- Console slot 不硬编码单个 plugin internal。
- Settings 中能看到 Clipboard privacy 和 Sync account 状态。

## 7. 测试

```bash
pnpm --filter @repo/plugin-console test
pnpm --filter @repo/plugin-project test
pnpm --filter desktop test
pnpm check
```

## 8. 手工验证

- 创建 project board,拖动 20 张 card。
- 从 Grid item 创建 Card。
- 在 Console 搜索 Todo/Clipboard/Card。
- 关闭再打开 Console,检查 layout 和 selection。
