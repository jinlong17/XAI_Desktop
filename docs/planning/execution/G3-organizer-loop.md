# G3 执行包:Phase 1 Organizer 日用闭环

| 字段 | 值 |
|---|---|
| Gate | G3 |
| 周期 | 2-3 周 |
| 前置 | G1 通过,G2 Repository contract 可用 |
| 输出 | 用户可日用的桌面整理 MVP |

## 1. 目标

把 G1 的 Grid 地基变成完整桌面整理体验,对齐 Apple Stacks / File Zones 的低学习成本,但保留 XAI 的自定义 Grid、规则、项目语境和后续 Console 聚合能力。

## 2. 非目标

- 不做重度文件管理器。
- 不复制 Finder。
- 不做云同步。
- 不做团队共享桌面。

## 3. Epic / Story / Task

| ID | 类型 | 内容 | 验收 |
|---|---|---|---|
| G3-E1 | Epic | Grid item 模型产品化 | 文件、文件夹、App、URL、文本占位四类 item 可创建/编辑/删除 |
| G3-S1 | Story | Finder 文件拖入后生成 file item | 显示名称、icon、path、missing state |
| G3-S2 | Story | 拖入 App bundle 后生成 app item | 点击可 launch 或 reveal in Finder |
| G3-S3 | Story | 新建 URL item | URL 校验、favicon fallback、open external |
| G3-E2 | Epic | 自动分类规则 | 按 kind/extension/tag/source folder 放入 Grid |
| G3-S4 | Story | 一键整理当前 Desktop | dry run preview + apply + undo |
| G3-S5 | Story | 文件夹映射 | 指定文件夹作为 Grid source,保留原文件位置 |
| G3-E3 | Epic | Finder 协作 | Reveal、rename missing、remove broken link |
| G3-S6 | Story | Finder tag 读取/写入策略 | 至少读取 tag;写入若权限不足则 graceful fallback |
| G3-E4 | Epic | 空状态和错误恢复 | 用户知道下一步怎么做 |
| G3-S7 | Story | Grid 空状态 | 允许 drop、add URL、choose folder |
| G3-S8 | Story | 失效路径状态 | 不崩溃,可 locate/relink/remove |

## 4. 文件范围

- `packages/plugin-organizer/src/*`
- `packages/plugin-organizer/docs/*`
- `packages/core-data/src/*`
- `apps/desktop/src-tauri/src/commands/window.rs`
- `apps/desktop/src-tauri/src/commands/*` 中 Finder/Open/Reveal 相关 command,如需新增必须更新 Tauri 契约。

## 5. 验收标准

- 用户可创建至少 2 个 Grid,拖入真实文件并重启恢复。
- 一键整理 Desktop 有 preview,不会直接移动用户文件。
- 所有 destructive action 有 undo 或确认。
- 缺失文件不导致白屏。
- Organizer docs 四件套同步更新。

## 6. 测试

```bash
pnpm --filter @repo/plugin-organizer test
pnpm --filter @repo/core-data test
pnpm --filter desktop test
pnpm check
```

## 7. 手工验证

- Desktop 有 20+ 文件时执行 dry run。
- 拖入文件夹、App、URL。
- 删除原文件后打开 XAI,检查 missing state。
- 双 Grid 同时操作,检查 state 不串。
