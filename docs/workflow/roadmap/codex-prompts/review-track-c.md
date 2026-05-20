# Cross-vendor Review Prompt — Track C (桌面挂件 + Web + AI)

直接复制下面整块到 Claude Code CLI 执行。

---

```text
你是交叉审查 agent。请对 Track C (codex/track-c-widgets-web-ai) 的业务 commit 做独立 feature-review。

## 背景

Track C 由 Codex 执行，负责 G6（桌面挂件）、G7（AI 体验）和 G8（Web 控制台）的 scaffold 实现。
三个并行 Track 同时开发：
- Track A (桌面地基 + 数据层) — 已完成 G2 Repository、G3 Organizer，生产代码
- Track B (效率工具 + 控制台) — G4 + G5，mock 数据层，5 个新 plugin
- Track C (你要审查的) — G6 + G7 + G8 scaffold，4 个新 plugin + Web app

## 要审查的 commits

Branch: codex/track-c-widgets-web-ai
Base: 744d578 (feat(repository-v0-contract): freeze Repository v0 entity surface)

| Commit | 内容 |
|--------|------|
| 5e96b72 | feat(widgets): scaffold widget host and built-ins |
| a75bf33 | feat(calendar): add mini calendar widget scaffold |
| 954409f | feat(pet): scaffold companion pet interactions |
| 15a4c0a | feat(ai-cube): scaffold guarded mock conversation |
| 7a6c8f1 | feat(web): add browser-safe console shell |
| 9ae1b58 | docs(track-c): record web verification |
| 92e2ba6 | feat(core-data-sqlite-driver): Tauri db_* command bridge + TS createTauriRepo |

新建/修改的 packages:
- packages/plugin-widgets/ (Widget host + WidgetFrame + TimeProgress + Countdown + Personalization)
- packages/plugin-calendar/ (CalendarMini month view + CalendarDay + HabitHeatmap)
- packages/plugin-pet/ (PetAvatar + PetBubble + PetPanel + AI persona + state machine)
- packages/plugin-ai-cube/ (AiCubePanel + PrivacyGate + CostGuard + mock conversation)
- apps/web/ (Web console shell + IndexedDB adapter + responsive layout + CSP)

## 已知问题 (审查时需要确认严重程度)

1. Track C 违反了文件隔离规则，修改了 Track A 独占的文件:
   - apps/desktop/src-tauri/src/commands/database.rs (重复了 G2.2 sqlite driver)
   - packages/core-data/ 下约 12 个文件
   - docs/contracts/data-repository-v0.md, tauri-commands-v0.md
   → 评估: Track C 的这些修改是否与 Track A 版本一致？冲突严重程度？

2. packages/plugin-labels/ 被三个 Track 都创建了
   → 评估: Track C 的 plugin-labels 版本与 Track B 的差异

3. Track C 额外做了大量 G9 (Sync) 相关工作 (看 commit 列表):
   - supabase-schema-migrations (Phase 4-6)
   - nonce-lease-server, push-edge-function, recovery-proof-edge-function
   - rls-policies-and-tests, rls-fuzz-property
   - protocol-integrity-integration-tests
   - audit-log-integrity, commit-seq-authority
   - rekey-two-phase, onboarding-backfill-ui
   → 评估: 这些超出原始 prompt scope 的工作质量如何？能否纳入正式 roadmap？

## 审查步骤

1. 切换到 Track C branch 读代码:
   git checkout codex/track-c-widgets-web-ai

2. 对每个 plugin 检查:

   a) 架构合规 (docs/SYSTEM_ARCHITECTURE.md §4 红线):
      - index.ts 是唯一 public surface？
      - 业务逻辑全部在 plugin 内？
      - plugin 之间不直接 import？
      - Widget 注册机制是否通过 core registry 而非直接 import？

   b) 数据层设计:
      - MockDataAdapter 是否正确实现？
      - apps/web/ 的 IndexedDB adapter 是否功能完整？
      - 与 Repository v0 contract 兼容性？

   c) 组件质量:
      - Widget host 的拖拽/调整大小是否有合理的实现？
      - Pet state machine (idle → remind → interact → rest) 是否完整？
      - AI Cube 的 mock conversation 是否有合理的 UX flow？
      - Web app 的 responsive breakpoints 是否合理？
      - CSP 配置是否正确？

   d) 文件隔离违规 (重点):
      - 列出所有不应修改的文件
      - 评估每个违规文件的冲突严重程度
      - 判断合并时应保留 Track A 还是 Track C 的版本

   e) 超出 scope 的 G9 工作:
      - supabase migration schema 设计是否合理？
      - RLS policies 是否安全？
      - Edge functions 是否可用？
      - Protocol integrity tests 覆盖是否充分？
      - 这些代码的质量是否达到 production 水平？

   f) Plugin 初始化:
      - package.json / tsconfig.json / manifest.json 完整？
      - docs/ 四件套存在？

   g) 测试:
      - 运行可用的 check-types
      - 如果 apps/web/ 可构建，运行 pnpm --filter web build
      (workspace link 缺失导致的失败记录但不算 BLOCKED)

3. 特别关注:
   - Widget host 的扩展机制是否允许第三方 widget 注册
   - Pet 非侵入模式的 UX
   - AI privacy gate 的安全设计 (redaction 是否有效)
   - Web host shell 对 Tauri API 的降级策略是否完整
   - IndexedDB adapter 的 offline-first 策略是否可靠
   - CSP policy 是否足够严格又不阻断正常功能

## 输出格式

对每个 plugin + web app 输出一个 review block:

## Plugin: plugin-xxx

**Commit(s)**: <hash>
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
- (列出违规文件及建议处理方式)

### 建议的 next-step
- ...

---

额外输出 G9 超出 scope 工作的单独审查:

## G9 Bonus Work Review

**Commits**: (列出所有 G9 相关 commit)
**Verdict**: ADOPT | PARTIAL_ADOPT | REJECT

### 涉及范围
- Supabase migrations: ...
- Edge functions: ...
- RLS policies: ...
- Protocol tests: ...

### 质量评估
- 代码质量: ...
- 安全性: ...
- 测试覆盖: ...
- 与 G9 execution pack 的对齐程度: ...

### 采纳建议
- 哪些可以直接纳入 G9 roadmap？
- 哪些需要重写？
- 哪些应该丢弃？

---

最后输出总结 block:

## Track C 总结

| Package | Verdict | P0 | P1 | P2 | DataAdapter 迁移 | 隔离违规 |
|---------|---------|----|----|----|-----------------|---------| 
| plugin-widgets | ... | ... | ... | ... | ... | ... |
| plugin-calendar | ... | ... | ... | ... | ... | ... |
| plugin-pet | ... | ... | ... | ... | ... | ... |
| plugin-ai-cube | ... | ... | ... | ... | ... | ... |
| apps/web | ... | ... | ... | ... | ... | ... |
| G9 bonus | ... | ... | ... | ... | — | — |

### 文件隔离冲突清单
| 文件 | Track A 版本 | Track C 版本 | 合并建议 |
|------|-------------|-------------|---------|
| ... | ... | ... | keep A / keep C / manual merge |

### 合并建议
- 合并顺序建议
- 必须丢弃的 Track C 文件 (与 Track A 重复的)
- G9 bonus work 的处理方式
- 合并前必须修复的 P0 列表

将完整审查报告写入: docs/reviews/track-c-cross-review/claude-review.md
```
