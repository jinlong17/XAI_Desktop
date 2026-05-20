# G7 执行包:Phase 4 AI 注入

| 字段 | 值 |
|---|---|
| Gate | G7 |
| 周期 | 3-4.5 周 |
| 前置 | G4/G5/G6 数据和 UI 入口稳定 |
| 输出 | AI Cube 真实可用,但隐私和成本可控 |

## 1. 目标

把 AI 变成 XAI 工作空间的增强层,而不是先做聊天壳。AI 应围绕任务、剪贴板、桌面文件、项目卡片和桌宠状态提供上下文操作。

## 2. 非目标

- 不做开放式 agent 自动执行文件操作。
- 不默认上传剪贴板全文。
- 不做不可解释的自动分类。
- 不做成本无限制的后台推理。

## 3. Epic / Story / Task

| ID | 类型 | 内容 | 验收 |
|---|---|---|---|
| G7-E1 | Epic | AI Cube conversation | 可展开对话,上下文来源可见 |
| G7-S1 | Story | Natural language task | "明天下午提醒我..." 生成 Todo draft |
| G7-S2 | Story | Clipboard AI context | 对选中 clipboard item 总结/改写/提取任务 |
| G7-S3 | Story | Desktop file assist | 对选中文件名/path metadata 生成整理建议 |
| G7-E2 | Epic | AI privacy gate | 每次发送前展示数据类型和范围 |
| G7-S4 | Story | Redaction baseline | secrets/password-like content 默认不发送 |
| G7-E3 | Epic | Pet AI persona | 桌宠变成轻量提醒/反馈化身 |
| G7-E4 | Epic | Cost and latency guard | daily cap,timeout,offline fallback |

## 4. 文件范围

- 新增或迁移 `packages/plugin-ai-cube`
- `packages/plugin-clipboard`
- `packages/plugin-productivity`
- `packages/plugin-organizer`
- `packages/plugin-pet`
- `packages/core/src/events`
- AI provider adapter,具体位置由架构实现决定

## 5. 验收标准

- AI 请求前用户能看到将发送的数据范围。
- 生成 Todo/Card 必须是 draft,用户确认后才写库。
- Clipboard AI 默认只处理用户选中的 item。
- 网络失败不影响非 AI 功能。
- 成本上限可配置,超限时明确降级。

## 6. 测试

```bash
pnpm --filter @repo/plugin-ai-cube test
pnpm --filter @repo/plugin-clipboard test
pnpm check
```

## 7. 手工验证

- 从剪贴板生成 Todo draft。
- 从 Project card 生成 checklist。
- 断网时 AI UI 降级但 app 可用。
- 检查敏感剪贴板内容不默认发送。
