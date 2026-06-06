# PRD — 番茄钟 / Pomodoro

> Canonical 产品需求文档。由 `xai-feature-dossier-sync` Mode: apply 反向建立（2026-06-01），
> 基于已审草稿 `docs/reviews/xai-web-pomodoro/20260601-prd.draft.md`。
> 规则：每条需求保留 `Source:`；后续迭代仅在 §7 追加；未定项标 `待确认`，不臆造。

| 元信息 | 值 |
|---|---|
| Feature | 番茄钟 / Pomodoro |
| 产品模块 | web |
| Owning package | `@repo/plugin-web-pomodoro`（源码目录 `packages/plugin-web-pomodoro/`，doc-split 已归并 2026-06-01） |
| 当前状态 | SHIPPED（v1 2026-05-23）+ 1 bugfix SHIPPED（2026-05-24） |
| 持久化键 | `xai_pomodoro_sessions`（`PomodoroSession[]`，ADR-0007 §S8） |
| 跨模块事件 | emit `web:pomodoro:session-finished`（下游 Statistics #20 / Dashboard widget #11） |
| 路由 | `/app/pomodoro` |

## 1. Overview — why / problem solved

把原型 `web design/module-pomodoro.jsx`（124 LOC）移植为 typed Vite+React 19 包，提供一个**计时准确（抗后台标签页节流）**的番茄钟：圆形计时器 + Start/Pause/Resume/End + 完成 session 持久化 + 4 张统计卡 + 7 天专注记录，并把 session 通过事件喂给统计/仪表盘。

- Source: origin dev_log Status Panel Title + Decision Headline；discovery review §1 Problem Framing

## 2. Target users & core scenarios

XAI Web Console 使用者（专注/时间管理场景）。核心场景：
1. 点 Start 开始 25 分钟专注；圆环 + 旋转 accent dot 实时显示剩余。
2. 中途 Pause/Resume 精确保留剩余时间；切后台再回来时间仍准。
3. End 提前结束（记 `completed:false`）或自然 tick-to-zero（记 `completed:true`），写入 session。
4. 右栏看 4 张统计卡 + 最近 7 天专注记录。
5. session 通过 `web:pomodoro:session-finished` 供统计/仪表盘消费。

- Source: discovery review §9 Acceptance Signal + §2.5

## 3. In Scope

| 能力 | 说明 | Source |
|---|---|---|
| 圆形计时器 + 控制 | TimerRing（SVG 进度弧 + 旋转 accent dot）+ Start/Pause/Resume/End 状态机 | origin dev_log Title；discovery §2.2(T-A)/§2.4(H-A) |
| 计时精度（抗 tab-blur） | `Date.now()` 绝对截止 + rAF 重绘（按显示秒 gate）+ `visibilitychange`/`pageshow` 重算；无 `setInterval` | discovery §2.2 选 T-A；origin verify Gate 6 |
| session schema + 持久化 | `{id,mode,startedAt,finishedAt,durationMs,elapsedMs,completed}`，`usePref("xai_pomodoro_sessions")`，`isPomodoroSession` 边界校验 | discovery §2.3 选 S-A、§3.5；ADR-0007 §S8 |
| 4 张 overview cards | 今日 pomos / 今日专注分钟 / 总 pomos / 总专注 h+m，`useMemo` 从 sessions 派生 | origin dev_log Title；discovery §2.3/§2.8 |
| 7 天 focus-record 列表 | 按本地日分组、今天置顶、双语日期（Today/Yesterday/M·D） | discovery §2.8 选 L-A |
| 跨模块 emit | `web:pomodoro:session-finished`（focus 完成 + End-early 均发，`durationMs`=实际 elapsed），dedup guard 防 StrictMode 双发 | discovery §2.5 选 E-A；`core/types/events.ts:198-206` |
| 默认时长 + mode-cycle | 硬编码 25/5/15 分；focus→short-break×3→long-break | discovery §2.7 选 D-A |
| 通知 stub | `NOTIFICATIONS_ENABLED=false` feature-flag，无 permission 请求；Settings W4 later flip | discovery §2.6 选 N-A |
| 双语 | 14 个 `pomo.*` key（已在 `plugin-web-tokens`，无新增） | origin review gate #8 |

## 4. Non-Goals（明示不做）

- 任务联动（`linkedTodoId`）—— 桌面 `plugin-productivity` 所有；web 用无 task link 的 `web:pomodoro:session-finished`。Source: discovery §7
- Pomodoro Settings pane（自定义时长/声音/通知开关）—— Settings W4 所有。Source: discovery §7
- 统计聚合视图（Statistics #20 消费）、Dashboard mini-pomodoro widget（#11 消费）—— 不属本包。Source: discovery §7
- 多设备同步 —— `xai_pomodoro_sessions` 仅 localStorage。Source: discovery §7
- session 打标签 / 导出 CSV / Skip break —— 原型无。Source: discovery §7 + §5

## 5. Acceptance Criteria（映射 test ID）

> 完整 AC 见 `packages/plugin-web-pomodoro/docs/test.md`。锚点：

| 验收 | 内容 | test ID | Source |
|---|---|---|---|
| 端到端运行 | 25 focus / 5 short-break 默认跑通 | M1..M15 | discovery §9.1 |
| Pause/Resume 精确 | 跨 tab-blur 暂停不漂移 | UT1..UT8 | discovery §9.2 |
| End-early 诚实记录 | 写 `completed:false` | AC-SCHEMA-3/6/7/8 | discovery §9.3 |
| 完成写入历史 | session 出现在右栏列表 | FRL1..FRL6 | discovery §9.4 |
| 统计/仪表盘可读 | emit + array-read 双通道 | EE1..EE5 + EE-strict | discovery §9.5 |
| 计数器正确性 | DC1..DC9 全绿（含 bugfix 后的 TZ 不变性） | DC1..DC9（122/122） | bugfix Verification Summary |
| 跨厂商 | Chrome/Safari17+/Firefox MV-1..MV-17 | MV-1..MV-17（ship 时手测） | discovery §9.6 |

## 6. Owning modules / packages

| 包 | 角色 |
|---|---|
| `@repo/plugin-web-pomodoro` | 唯一实现包（单包功能） |
| 依赖（只读消费） | `plugin-web-storage`（`usePref`）· `plugin-web-tokens`（i18n）· `xai-web-shell`（slot）· `xai-web-event-bus`（emit）· `@repo/core`（EventMap） |

> 单包功能，无 doc-split 残留（番茄钟 doc 已于 2026-06-01 归并入 `plugin-web-pomodoro/docs/`，原始 lineage 存 `dev_log.origin.md`）。

## 7. Revision History

| Date | Iteration | User-visible change | Source | 状态 |
|---|---|---|---|---|
| 2026-06-01 | PRD 建立 | dossier-sync 反向补账，首次建立 canonical PRD | `docs/reviews/xai-web-pomodoro/20260601-prd.draft.md` | — |
| 2026-05-23 | v1 feature-dev | 圆形计时器 + 控制 + 持久化 + 4 卡 + 7 天列表 + emit | origin dev_log（SHIPPED）；commits `13038fc`/`4f794fd`/`1b1ce4c`/`8e173db` | SHIPPED |
| 2026-05-24 | bugfix | 修复 `derivedCounters.test.ts` 时间漂移（DC3/DC4 每日失败）—— test-only，硬编码 `TODAY_LOCAL` 对齐 setup anchor | canonical dev_log；commit `1a9ba10` | SHIPPED |

## 8. Traceability Matrix

| Requirement | Source | Implementation | Tests |
|---|---|---|---|
| 计时器 + 控制 | origin dev_log / discovery T-A/H-A | `TimerRing.tsx` + `useTimerTick.ts` + `PomodoroModule.tsx` | UT1..UT8 / M1..M15 / TR1..TR4 |
| schema + 持久化 | discovery S-A / ADR §S8 | `types.ts` + `usePref` + `isPomodoroSession` | V1..V8 / AC-SCHEMA |
| 4 卡 + 7 天列表 | discovery S-A/L-A | `PomodoroOverview.tsx` + `FocusRecordList.tsx` + `derivedCounters.ts` | DC1..DC9 / PO1..PO5 / FRL1..FRL6 |
| emit session-finished | discovery E-A | `PomodoroModule` emit + dedup | EE1..EE5 + EE-strict |
| 计数器时间漂移 bugfix | bugfix dev_log / `1a9ba10` | `__tests__/derivedCounters.test.ts` | DC3/DC4 green |

## 9. Open Items（诚实标注，非阻塞）

- **Ship-not-logged**：`release-log.md` 缺 pomodoro v1（2026-05-23）+ bugfix（2026-05-24）两条 SHIPPED → 本轮 `xai-release-log` 补登。
- 无 `待确认`：来源链完整（origin dev_log + discovery + bugfix dev_log + commit SHA）。
