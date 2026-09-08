# XAI v1 Parallel Wave Plan — 2026-05-19

> **PAUSED (2026-05-24, per Web P0 Priority Override).** Web Console (`docs/workflow/roadmap/xai-web-console.md`) is the active roadmap. Do NOT start new work on this roadmap. SHIPPED rows remain authoritative for their domain; in-flight items: complete-or-park. Resumes only after P0 Web gap-closure ships and ADR-0009 (Web → Desktop Pivot Plan) is Accepted. Full rationale: `docs/reviews/web-priority-pivot-and-repo-cleanup/20260524-brief.md`.

## 1. 全量 Feature 依赖 DAG

```
G0 (SHIPPED except G0.6 BLOCKED_EXTERNAL)
 └─ G1 (G1.1 SHIPPED, G1.2 READY_TO_SHIP, G1.4 READY_TO_SHIP, G1.6 SHIPPED)
     ├─ G1.3 BLOCKED_EXTERNAL (MAS sandbox)
     ├─ G1.5 BLOCKED (needs G2.1)
     └─ G2 (no manifest yet)
         ├─ G2.1 Repository v0 ──┬──────────────────────────────────────────┐
         ├─ G2.2 SQLite/SQLCipher PoC (← G2.1)                            │
         ├─ G2.3 localStorage migration (← G2.2)                          │
         ├─ G2.4 Keychain opaque handle (← G2.1)                          │
         ├─ G2.5 Tauri capability allowlist (← G2.4)                      │
         ├─ G2.6 Single-table sync baseline (← G2.1, G2.4)               │
         └─ G2.7 DMG/MAS security dry run (← G2.5)                       │
                                                                           │
     ┌─ G3 Organizer loop (← G1 pass + G2.1 Repository) ←────────────────┘
     │   ├─ G3-E1 Grid item model
     │   ├─ G3-E2 Auto-classification rules (← G3-E1)
     │   ├─ G3-E3 Finder collaboration (← G3-E1)
     │   └─ G3-E4 Empty state & error recovery (← G3-E1)
     │
     ├─ G4 Productivity + Clipboard (← G2 pass + G3 stable)
     │   ├─ G4-E1 Global Label system ──┐
     │   ├─ G4-E2 Todo loop (← G4-E1) ─┤
     │   ├─ G4-E3 Pomodoro (← G4-E2)   │
     │   ├─ G4-E4 Habits (← G4-E1)     │
     │   ├─ G4-E5 Clipboard (← G2)     │
     │   └─ G4-E6 Cmd+K search (← G4-E1, G4-E2, G4-E5)
     │                                  │
     ├─ G5 Console + Project (← G4)  ←─┘
     │   ├─ G5-E1 Console shell ────────┐
     │   ├─ G5-E2 Project board         │
     │   ├─ G5-E3 Console↔Desktop link  │
     │   └─ G5-E4 Notification center   │
     │                                   │
     ├─ G6 Widgets + Calendar + Pet (← G5)
     │   ├─ G6-E1 Widget host ──────────┤
     │   ├─ G6-E2 Calendar aggregate    │
     │   ├─ G6-E3 Habit enhanced stats  │
     │   ├─ G6-E4 Time progress widget  │
     │   ├─ G6-E5 Pet basics            │
     │   └─ G6-E6 Personalization       │
     │                                   │
     ├─ G7 AI Experience (← G4/G5/G6)   │
     │   ├─ G7-E1 AI Cube conversation  │
     │   ├─ G7-E2 AI privacy gate       │
     │   ├─ G7-E3 Pet AI persona        │
     │   └─ G7-E4 Cost & latency guard  │
     │                                   │
     ├─ G8 Web Console (← G5 contract + G9 interface)
     │   ├─ G8-E1 Web host shell (reuse plugin-console)
     │   ├─ G8-E2 Web data driver (IndexedDB + remote)
     │   ├─ G8-E3 Web security baseline
     │   └─ G8-E4 Responsive Console    │
     │                                   │
     ├─ G9 Sync Hardening + Beta (← G2 + G8)
     │   ├─ G9-E1 Protocol integrity
     │   ├─ G9-E2 Nonce lease defense
     │   ├─ G9-E3 Device pairing
     │   ├─ G9-E4 Rekey two-phase
     │   ├─ G9-E5 Recovery rehearsals
     │   ├─ G9-E6 Audit & observability
     │   └─ G9-E7 Beta operations
     │
     └─ G10 Release GA (← G9 Beta passed)
         ├─ G10-E1 Release engineering
         ├─ G10-E2 Legal/privacy
         ├─ G10-E3 Marketing site
         ├─ G10-E4 App assets
         ├─ G10-E5 Support ops
         └─ G10-E6 GA acceptance suite
```

## 2. 三条并行 Track

按**包文件零冲突**原则切分：

| Track | 名称 | Codex 窗口 | Gate 覆盖 | 主要 Package | 模式 |
|-------|------|-----------|-----------|-------------|------|
| A | 桌面地基 + 数据层 | Window 1 | G1→G2→G3 | plugin-organizer, core-data, src-tauri/commands | 生产 |
| B | 效率工具 + 控制台 | Window 2 | G4→G5 | plugin-productivity, plugin-clipboard, plugin-labels, plugin-console, plugin-project | Mock 先行 |
| C | 桌面挂件 + Web + AI | Window 3 | G6→G7→G8 | plugin-widgets, plugin-calendar, plugin-pet, plugin-ai-cube, apps/web | Scaffold + Design |

### 文件隔离矩阵

| 文件路径 | Track A | Track B | Track C |
|----------|---------|---------|---------|
| packages/plugin-organizer/ | ✅ own | ❌ | ❌ |
| packages/core-data/ | ✅ own | ❌ | ❌ |
| apps/desktop/src-tauri/src/commands/ | ✅ own | ❌ | ❌ |
| packages/core/src/types/ | ✅ own | read-only | read-only |
| packages/plugin-productivity/ | ❌ | ✅ own | ❌ |
| packages/plugin-clipboard/ | ❌ | ✅ own | ❌ |
| packages/plugin-labels/ | ❌ | ✅ own | ❌ |
| packages/plugin-console/ | ❌ | ✅ own | read-only |
| packages/plugin-project/ | ❌ | ✅ own | ❌ |
| packages/plugin-widgets/ | ❌ | ❌ | ✅ own |
| packages/plugin-calendar/ | ❌ | ❌ | ✅ own |
| packages/plugin-pet/ | ❌ | ❌ | ✅ own |
| packages/plugin-ai-cube/ | ❌ | ❌ | ✅ own |
| apps/web/ | ❌ | ❌ | ✅ own |
| docs/contracts/ | ✅ write | propose only | propose only |
| docs/reviews/<own-features>/ | ✅ own | ✅ own | ✅ own |

## 3. 进度安排 (8-10h per window)

### Window 1 — Track A: 桌面地基 + 数据层 (~10h, 14 features)

| 阶段 | Feature | 预估 | 类型 |
|------|---------|------|------|
| 0h-0.5h | Ship G1.2 + G1.4 | 30min | Ship |
| 0.5h-2h | G2.1 Repository v0 contract | 1.5h | Production |
| 2h-3.5h | G2.2 SQLite/SQLCipher PoC | 1.5h | Production |
| 3.5h-4.5h | G2.3 localStorage migration + G2.4 Keychain | 1h | Production |
| 4.5h-5.5h | G2.5 capability allowlist + G2.6 sync baseline | 1h | Production |
| 5.5h-6.5h | G1.5 grid-persistence (G2.1 解锁后) | 1h | Production |
| 6.5h-7.5h | G3-E1 Grid item model + G3-S3 URL item | 1h | Production |
| 7.5h-8.5h | G3-E2 Auto-classification rules | 1h | Production |
| 8.5h-9.5h | G3-E3 Finder collaboration | 1h | Production |
| 9.5h-10h | G3-E4 Empty state + error recovery + checkpoint | 0.5h | Production |

### Window 2 — Track B: 效率工具 + 控制台 (~10h, 13 features)

| 阶段 | Feature | 预估 | 类型 |
|------|---------|------|------|
| 0h-1.5h | G4-E1 Label system (package init + CRUD + picker UI) | 1.5h | Mock 先行 |
| 1.5h-3h | G4-E2 Todo (Eisenhower view + quick-add) | 1.5h | Mock 先行 |
| 3h-3.5h | G4-E3 Pomodoro timer widget | 0.5h | Mock 先行 |
| 3.5h-4h | G4-E4 Habits calendar view | 0.5h | Mock 先行 |
| 4h-5h | G4-E5 Clipboard history (local privacy-aware) | 1h | Mock 先行 |
| 5h-5.5h | G4-S9 Sequential paste queue | 0.5h | Mock 先行 |
| 5.5h-6h | G4-S10 OCR mode baseline | 0.5h | Mock 先行 |
| 6h-7h | G4-E6 Cmd+K local search | 1h | Mock 先行 |
| 7h-8h | G5-E1 Console shell scaffold | 1h | Scaffold |
| 8h-9h | G5-E2 Project board scaffold | 1h | Scaffold |
| 9h-9.5h | G5-E3 Console↔Desktop linkage | 0.5h | Mock |
| 9.5h-10h | G5-E4 Notification center baseline + checkpoint | 0.5h | Mock |

### Window 3 — Track C: 桌面挂件 + Web + AI (~10h, 15 features)

| 阶段 | Feature | 预估 | 类型 |
|------|---------|------|------|
| 0h-1.5h | G6-E1 Widget host (lifecycle + density/theme) | 1.5h | Scaffold |
| 1.5h-2.5h | G6-E4 Time progress + G6-E2 Calendar mini | 1h | Scaffold |
| 2.5h-3.5h | G6-E5 Pet basics (state/animation/bubble) | 1h | Scaffold |
| 3.5h-4h | G6-E6 Personalization (theme tokens) | 0.5h | Scaffold |
| 4h-4.5h | G6-E3 Habit enhanced stats | 0.5h | Scaffold |
| 4.5h-6h | G8-E1 Web host shell + G8-S1 browser-safe stubs | 1.5h | Design + Mock |
| 6h-7h | G8-E2 Web data driver (IndexedDB) | 1h | Mock |
| 7h-7.5h | G8-E3 Web security baseline | 0.5h | Design |
| 7.5h-8.5h | G8-E4 Responsive Console | 1h | Scaffold |
| 8.5h-9h | G7-E1 AI Cube conversation scaffold | 0.5h | Scaffold |
| 9h-9.5h | G7-E2 AI privacy gate | 0.5h | Design |
| 9.5h-10h | G7-E3 Pet AI persona + G7-E4 Cost guard + checkpoint | 0.5h | Design |

## 4. 契约冲突处理

- Track A 独占 `docs/contracts/` 的写权限。
- Track B/C 如果需要新增 event 或 entity，写入 `docs/reviews/<feature>/proposed-contract-changes.md`。
- 合并时由人工将 proposed changes 合入 contracts。

## 5. 数据层策略

Track B/C 的 plugin 需要数据持久化，但 G2 Repository 还没完成。策略：

```typescript
// 每个 plugin 内部使用 abstract DataAdapter
interface DataAdapter<T> {
  getAll(): Promise<T[]>
  getById(id: string): Promise<T | null>
  save(item: T): Promise<void>
  delete(id: string): Promise<void>
}

// 阶段 1 (现在): MockDataAdapter — localStorage / in-memory
// 阶段 2 (G2 完成后): RepositoryDataAdapter — 接入 core-data Repository
```

Track A 在 G2 阶段会定义 Repository v0 contract，Track B/C 的 MockDataAdapter 接口要与之兼容。

## 6. 合并策略

三个窗口各自在独立 branch 上工作：
- Window 1: `codex/track-a-desktop-foundation`
- Window 2: `codex/track-b-productivity-console`
- Window 3: `codex/track-c-widgets-web-ai`

完成后人工合并到 main，按 Track A → B → C 顺序（Track A 定义 contracts，B/C 适配）。

## 7. 覆盖率汇总

### 本轮覆盖 (3 窗口 × 10h = 42 features)

| 窗口 | Features | Gate 覆盖 |
|------|----------|----------|
| W1 | 14 | G1.2 ship, G1.4 ship, G1.5, G2.1-G2.6, G3-E1/E2/E3/E4/S3 |
| W2 | 13 | G4-E1/E2/E3/E4/E5/E6/S9/S10, G5-E1/E2/E3/E4 |
| W3 | 15 | G6-E1/E2/E3/E4/E5/E6, G7-E1/E2/E3/E4, G8-E1/E2/E3/E4/S1 |

### BLOCKED / 不在本轮

| Feature | 原因 | 何时解锁 |
|---------|------|---------|
| G1.3 native-dnd-path-first | Apple Developer 签名环境 | 人工提供 MAS sandbox |
| G2.7 DMG/MAS security dry run | 需要签名环境 | 同上 |
| G3-S4 One-click Desktop organizer | 依赖 G3-E2 | 本轮 W1 完成 G3-E2 后，下一轮 |
| G3-S5 Folder mapping as Grid source | 依赖 G3-E2 | 同上 |
| G3-S6 Finder tag read/write | 依赖 G3-E3 | 本轮 W1 完成 G3-E3 后，下一轮 |
| G5-S7 Create task from Grid item | 需要 G3 + G5 | 合并后下一轮 |
| G8-S2 Account login | 依赖 G2 + G9 | G9 轮 |
| G8-S3 Device management | 依赖 G9-E3 | G9 轮 |
| G8-S4 Export/import | 依赖 G8-E3 | 下一轮 |
| **G9 全部** (7 Epics) | 依赖 G2 + G8 + Supabase | **第二轮独立窗口** |
| **G10 全部** (6 Epics) | 依赖 G9 Beta + 法律/签名 | **第三轮** |

### 第二轮规划 (本轮完成后)

| 窗口 | 内容 | 预估 |
|------|------|------|
| W4 | G3 剩余 (S4/S5/S6) + G5-S7 + 合并对齐 | 4-6h |
| W5 | G9 Sync hardening 全量 (需要 Supabase) | 8-10h |
| W6 | G8 剩余 (S2/S3/S4) + G10 Release prep | 6-8h |
