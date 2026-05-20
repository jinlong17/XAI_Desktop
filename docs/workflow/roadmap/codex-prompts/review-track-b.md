# Cross-vendor Review Prompt — Track B (效率工具 + 控制台)

直接复制下面整块到 Claude Code CLI 执行。

---

```text
你是交叉审查 agent。请对 Track B (codex/track-b-productivity-console) 的 6 个业务 commit 做独立 feature-review。

## 背景

Track B 由 Codex 执行，负责 G4（效率工具）和 G5（控制台）的 mock 先行实现。
三个并行 Track 同时开发：
- Track A (桌面地基 + 数据层) — 已完成 G2 Repository、G3 Organizer，生产代码
- Track B (你要审查的) — G4 + G5，mock 数据层，5 个新 plugin
- Track C (挂件 + Web + AI) — G6 + G7 + G8 scaffold

## 要审查的 commits

Branch: codex/track-b-productivity-console
Base: 83c0baf (docs(ship): mark G0.1-G0.5 and G1.1+G1.6 as SHIPPED)

| Commit | 内容 |
|--------|------|
| a6bd997 | feat(labels): add global label plugin scaffold |
| 4ca14b1 | feat(productivity): add todo pomodoro and habits scaffold |
| 06dd704 | feat(clipboard): add local history paste queue and ocr mock |
| b711852 | feat(console): add shell search bridge and notifications |
| 1a31b34 | feat(project): add project board scaffold |
| 6f0ed0e | docs(track-b): add console contracts and checkpoint log |

新建的 5 个 plugin packages:
- packages/plugin-labels/ (Label CRUD + picker + badge)
- packages/plugin-productivity/ (Todo Eisenhower + Pomodoro timer + Habits calendar)
- packages/plugin-clipboard/ (Clipboard history + privacy + paste queue + OCR mock)
- packages/plugin-console/ (Console shell + Cmd+K search + notifications + desktop bridge)
- packages/plugin-project/ (Project board + Card 看板拖拽)

## 审查步骤

1. 切换到 Track B branch 读代码:
   git checkout codex/track-b-productivity-console

2. 对每个 plugin 检查:

   a) 架构合规 (docs/SYSTEM_ARCHITECTURE.md §4 红线):
      - index.ts 是唯一 public surface？其他文件不被外部直接 import？
      - 业务逻辑全部在 plugin 内，不在 Host？
      - plugin 之间不直接 import，通过 event 通信？
      - 类型定义在 plugin/src/types.ts (local) 或 core/types (global)？

   b) 数据层设计:
      - MockDataAdapter / LocalStorageAdapter 是否正确实现？
      - 接口是否兼容 Track A 的 Repository v0 contract (packages/core-data/src/types.ts)？
      - React Context 注入是否干净？组件是否直接依赖具体实现？

   c) 组件质量:
      - React 组件是否有合理的 props 类型？
      - hooks 是否遵循 React 规则？
      - 有无明显的性能问题（大列表无虚拟化、频繁 re-render）？
      - 有无 XSS / injection 风险？

   d) 文件隔离:
      - 是否修改了 Track A/C 的专属文件？
      - packages/core-data/ 是否被修改？(应该没有)
      - docs/contracts/ 是否被修改？(应该只写 proposed-contract-changes.md)

   e) Plugin 初始化:
      - package.json name 是 @repo/plugin-xxx？
      - tsconfig.json extends typescript-config？
      - manifest.json 存在？
      - docs/ 四件套 (dev_log.md, design.md, api.md, test.md) 存在？

   f) 测试:
      - 运行 pnpm --filter @repo/plugin-labels check-types 2>/dev/null
      - 运行 pnpm --filter @repo/plugin-productivity check-types 2>/dev/null
      - 运行 pnpm --filter @repo/plugin-clipboard check-types 2>/dev/null
      - 运行 pnpm --filter @repo/plugin-console check-types 2>/dev/null
      - 运行 pnpm --filter @repo/plugin-project check-types 2>/dev/null
      (如果 workspace link 缺失导致失败，记录但不算 BLOCKED)

3. 特别关注:
   - plugin-labels 被三个 Track 都创建了，检查 Track B 版本是否是最完整的
   - Cmd+K (CommandPalette) 的跨实体搜索接口设计是否合理
   - Clipboard privacy controls 是否有安全隐患
   - Project board 的拖拽逻辑是否正确处理 order 持久化
   - Console shell 的 PluginSlotRegistry 机制是否可扩展

## 输出格式

对每个 plugin 输出一个 review block:

## Plugin: plugin-xxx

**Commit**: <hash>
**Verdict**: APPROVED | REVISE | BLOCKED

### Strengths (max 4)
- ...

### Issues (severity-tagged)
- [P0] ... (must fix before merge)
- [P1] ... (should fix before production)
- [P2] ... (nice to have)

### DataAdapter 兼容性
- 与 Repository v0 contract 的差距: ...
- 迁移难度: Low / Medium / High

### 文件隔离违规
- (列出违规文件，如果有)

### 建议的 next-step
- ...

---

最后输出一个总结 block:

## Track B 总结

| Plugin | Verdict | P0 | P1 | P2 | DataAdapter 迁移难度 |
|--------|---------|----|----|----|--------------------|
| plugin-labels | ... | ... | ... | ... | ... |
| plugin-productivity | ... | ... | ... | ... | ... |
| plugin-clipboard | ... | ... | ... | ... | ... |
| plugin-console | ... | ... | ... | ... | ... |
| plugin-project | ... | ... | ... | ... | ... |

### 合并建议
- 合并顺序建议
- 冲突预期
- 合并前必须修复的 P0 列表

将完整审查报告写入: docs/reviews/track-b-cross-review/claude-review.md
```
