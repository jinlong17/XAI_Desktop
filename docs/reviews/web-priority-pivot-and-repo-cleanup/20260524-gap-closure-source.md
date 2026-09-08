# Web Gap-Closure Roadmap Source — C17 Known Gaps

| 字段 | 值 |
|---|---|
| 作者 | Claude Opus 4.7 (1M) |
| 日期 | 2026-05-24 |
| 用途 | xai-roadmap-loop init 的 roadmap source doc，产出 `docs/workflow/roadmap/xai-web-console-gap-closure.md` |
| 父 ADR | ADR-0009 §D2-G3 + §S6 follow-up |
| 父 Brief | `docs/reviews/web-priority-pivot-and-repo-cleanup/20260524-brief.md` §4.2 |
| 父 Roadmap | `docs/workflow/roadmap/xai-web-console.md` (24/24 SHIPPED — baseline) |
| 状态 | DRAFT — 待 xai-roadmap-loop init 解析 |

---

## 0. 来源 + 优先级

这 7 处缺口来自 **2026-05-24 用户手工 web audit**（在主对话里贴出的"人工功能检查清单"+"我建议你人工优先查的遗漏"）。这些缺口**不在原 xai-web-console.md 24 行 manifest 范围内**——它们是 SHIPPED 后才被发现的功能闭环缺口。

Per ADR-0009 D2-G3：至少 5/7 缺口 SHIPPED 才能解锁 P1 Desktop 启动。

---

## 1. Authority Override

- **Source priority:** 本档为 source-of-truth；与已 SHIPPED xai-web-console.md 24 行**不冲突**（24 行保持 SHIPPED 锚定，本档新增 7 行）。
- **Default Automation Mode:** `A-Claude` (同 xai-web-console.md per 2026-05-23 user override)
- **Default Dependency Semantics:** `shipped`
- **Default Verify Cross-vendor:** `yes` (Codex `gpt-5.5-thinking medium` primary; Cursor fallback)
- **Wave Concurrency Cap:** 3
- **Manifest Review:** REQUIRED (init stops here)
- **Reuse from xai-web-console.md SHIPPED:** all 24 rows + xai-web-deploy-cloudflare (treated as deps, not re-listed)

---

## 2. 7 Gap Definitions

### Gap 1 — AI Real-LLM Adapter (replace demo shim)

| 字段 | 值 |
|---|---|
| 候选 slug | `xai-web-ai-chat-real-llm-adapter` |
| 优先级 | High（用户最关心的功能闭环）|
| 影响包 | `packages/xai-web-ai-chat/` + `packages/plugin-web-ai-chat/` |
| 当前状态 | Option A `completeChat` 是 typed no-op，返回 bilingual demo line（600-1200ms jitter）|
| 目标 | 接入真实 LLM（Anthropic Claude API / OpenAI-compatible / 用户自带 API key）|
| 范围 | (a) Adapter 接口设计（streaming / token usage / error）；(b) API key 安全存储（不写 localStorage 明文）；(c) Settings → AI pane 集成；(d) error/retry/rate-limit UX |
| 不范围 | RAG / tool-use / file upload streaming（留给后续 row）|
| 依赖 | xai-web-ai-chat (#18 SHIPPED), xai-web-settings-rest (#24 SHIPPED), web-security-csp-sentry (CSP fetch domains 需扩) |
| 估时 | 1-2 天（含 cross-vendor verify）|
| 风险 | CSP `connect-src` 白名单需要 ADR 改动；API key 存储边界（已暂停 web-sync-blob-driver 不能复用）|

### Gap 2 — Cmd-K Global Search

| 字段 | 值 |
|---|---|
| 候选 slug | `xai-web-cmdk-search` |
| 优先级 | High（DESIGN.md §6 frozen UI 之一，目前完全缺失）|
| 影响包 | 新增 `packages/xai-web-cmdk/` + 修 `packages/xai-web-shell/` 顶栏（只读 input → command palette trigger）|
| 当前状态 | shell 顶栏 input 是 readOnly，无 Cmd-K 全局命令 |
| 目标 | (a) Cmd+K 触发 overlay；(b) 模块级搜索（11 个 rail 模块）；(c) Task/Card/Habit/Event 跨模块搜索；(d) 键盘导航 + Enter 跳转 |
| 范围 | 搜索 index 在内存（不写 localStorage），数据源走各模块的 usePref；UI 复用 xai-web-tokens；emit `web:search:invoked` event |
| 不范围 | 模糊搜索（Fuse.js）/ 历史记录 / AI 联想 — 留给后续 row |
| 依赖 | xai-web-shell (#5 SHIPPED), xai-web-event-bus (#4 SHIPPED), 所有 11 个模块包 (read-only inspection) |
| 估时 | 2-3 天 |
| 风险 | 跨模块搜索性能（11 个 usePref 并发读）；可能需要 web-event-bus 加一个 `web:search:*` channel family |

### Gap 3 — Calendar Week + Day Views

| 字段 | 值 |
|---|---|
| 候选 slug | `xai-web-calendar-week-day-views` |
| 优先级 | Medium |
| 影响包 | `packages/xai-web-calendar/` (#12 SHIPPED) |
| 当前状态 | Month view 可用；Week / Day view 是 "coming soon" 占位 |
| 目标 | (a) Week view (7 列 × 24 行时段)；(b) Day view (1 列时段)；(c) 三视图 toggle；(d) 跨视图保持 selected date |
| 范围 | 复用现有 month-grid 事件源；新增 2 个 view component；persistence: 加 `xai_calendar_view` (=`month`/`week`/`day`) |
| 不范围 | 事件创建/编辑流程的 UI 重做（保留 month modal） |
| 依赖 | xai-web-calendar (#12 SHIPPED) |
| 估时 | 1.5-2 天 |
| 风险 | 时段渲染性能（24 × 7 cells × 事件数 cross-product） |

### Gap 4 — Board Filter + Share + Map Views Implementation

| 字段 | 值 |
|---|---|
| 候选 slug | `xai-web-board-filter-share-map` |
| 优先级 | Medium |
| 影响包 | `packages/xai-web-board-views/` (#8 SHIPPED, 但 Map 是 SVG 占位) + `packages/xai-web-board-workspaces/` (#9 SHIPPED, Filter+Share 当前禁用) |
| 当前状态 | Filter / Share 按钮禁用；Map view 是 SVG placeholder |
| 目标 | (a) Filter — by label / by member / by due range；(b) Share — generate read-only link（先 mock，真 share 留给 P1 桌面端 / sync）；(c) Map — 真实地理可视化（用 cards 的 location 字段，若无 → empty state） |
| 范围 | Filter 只影响渲染；Share 是 UI-only stub（emit `web:board:share-requested`）；Map 替换 SVG placeholder 为 Leaflet 或类似 |
| 不范围 | Share 的真实后端实现；filter 持久化（v1 临时 state） |
| 依赖 | xai-web-board-core (#7), xai-web-board-views (#8), xai-web-board-workspaces (#9) — 全 SHIPPED |
| 估时 | 2-3 天 |
| 风险 | Map 依赖三方包（Leaflet 体积 ~150KB），需要确认 bundle budget；Share 的 mock 边界要写清楚 |

### Gap 5 — Dashboard Add-Widget Picker

| 字段 | 值 |
|---|---|
| 候选 slug | `xai-web-dashboard-add-widget-picker` |
| 优先级 | Medium |
| 影响包 | `packages/xai-web-dashboard-grid/` (#10 SHIPPED) + `packages/xai-web-dashboard-widgets/` (#11 SHIPPED) |
| 当前状态 | Add Widget 按钮点击只 emit `web:dashboard:add-widget-clicked` event，没有真实 picker UI |
| 目标 | (a) Modal picker 列出 10 widgets（来自 #11 widget pack）；(b) 每个有预览缩略图；(c) 选中后写入 `xai_dash_order` |
| 范围 | UI 复用 native `<dialog>`（同 settings 套路）；不动 #10 #11 的 widget 实现；只动 add-widget 触发逻辑 |
| 不范围 | 自定义 widget 创建；widget marketplace |
| 依赖 | xai-web-dashboard-grid (#10), xai-web-dashboard-widgets (#11) — SHIPPED |
| 估时 | 0.5-1 天 |
| 风险 | 最低；范围最小 |

### Gap 6 — Settings Integrations + Paywall Actions

| 字段 | 值 |
|---|---|
| 候选 slug | `xai-web-settings-integrations-paywall` |
| 优先级 | Medium-Low（功能性强、商业意义大，但闭环复杂） |
| 影响包 | `packages/plugin-web-settings-rest/` (#24 SHIPPED) — Account 删除、Premium 升级、Integrations 卡片 |
| 当前状态 | 多处 no-op：Premium / Integrations / About 链接、账号删除 confirm modal emit event 但无后端动作 |
| 目标 | (a) Integrations — 至少 3 个真实 OAuth 集成 stub（Notion / Google Calendar / Linear）；(b) Premium pane — Stripe checkout 集成 stub；(c) Account delete — wire 到 web-auth-device-session（已 SHIPPED）的真实删除流 |
| 范围 | Web-only；不涉及桌面 IAP（StoreKit 是 P1 范围）；OAuth callback URL 写死 dev/prod |
| 不范围 | 真实 OAuth 流（v1 是 stub 跳转）；Stripe webhook 处理（v1 不闭环到 backend） |
| 依赖 | plugin-web-settings-rest (#24), web-auth-device-session (SHIPPED platform spine), web-security-csp-sentry (CSP `connect-src` for OAuth + Stripe domains) |
| 估时 | 3-4 天（最大的一块；可能需要拆 sub-rows） |
| 风险 | 商业逻辑边界；CSP 改动需要 ADR；可能跨 web-ticktick-parity DEFERRED 行的边界（需仔细对照） |

### Gap 7 — Pomodoro derivedCounters Test Fix (test-only)

| 字段 | 值 |
|---|---|
| 候选 slug | `xai-web-pomodoro-counters-test-fix` |
| 优先级 | High（已知的测试漂移，影响整个 web package 测试套件可信度） |
| 影响包 | `packages/plugin-web-pomodoro/` (#14 SHIPPED, dev_log/Stable) — 测试文件 `derivedCounters.test.ts:41` |
| 当前状态 | Test fixture 用 `2026-05-23`；但 `TODAY_LOCAL` 在 fake timers 生效前求值，实际取本机 `2026-05-24 PDT`，测试漂移 |
| 目标 | (a) 重排 fake-timer setup 顺序，使 `TODAY_LOCAL` 在 fixture date 下求值；(b) 或者把 fixture date 改成 today-relative；(c) 跑 `pnpm --filter @repo/plugin-web-pomodoro test` 全绿 |
| 范围 | 仅测试文件 + 可能的 test setup 文件；不动产品代码 |
| 不范围 | 任何产品逻辑改动 |
| 依赖 | none — 纯 test-only fix |
| 估时 | 0.5 天（最小 row） |
| 风险 | 极低；最适合作为第一个 ship 的 row（验证 gap-closure roadmap pipeline） |

---

## 3. Dependency Graph (proposed for xai-roadmap-loop init)

```
W0 — 1 row (smallest, fastest, pipeline validator)
  Gap 7  xai-web-pomodoro-counters-test-fix
        ▼
W1 — 4 rows (parallel; high-priority, mostly independent)
  Gap 1  xai-web-ai-chat-real-llm-adapter
  Gap 2  xai-web-cmdk-search
  Gap 3  xai-web-calendar-week-day-views
  Gap 5  xai-web-dashboard-add-widget-picker
        ▼ (Gap 1 ships)
W2 — 2 rows (depend on Gap 1's CSP/secrets pattern)
  Gap 4  xai-web-board-filter-share-map
  Gap 6  xai-web-settings-integrations-paywall
```

Total: 7 rows across 3 waves. Estimated wall-clock: 1.5-3 weeks depending on
parallel agent dispatch.

---

## 4. Init-Time Decisions Required (xai-roadmap-loop init will prompt)

- **Granularity check:** Gap 6 (settings integrations + paywall) may need pre-split
  into 3 sub-rows (Integrations / Premium / Account-delete). Defer to init's
  AskUserQuestion.
- **Build form per row:** all 7 are extensions to existing SHIPPED packages — no
  new build-form ADR needed; reuse ADR-0007. Defer to init confirmation.
- **Authority override propagation:** confirm this gap-closure manifest does NOT
  supersede ADR-0009 or xai-web-console.md; it's additive.
- **Cross-vendor verify gate:** confirmed `yes` per ADR-0009 D2.

---

## 5. Out of Scope (explicitly NOT in this gap-closure roadmap)

- Anything in `apps/desktop/` or P1 packages (per ADR-0009 D1).
- Anything in `packages/plugin-{organizer, clipboard, widgets, meditation, pet}/`
  (P2 per ADR-0009 D1).
- New ADRs for the 7 gaps themselves (reuse ADR-0007 build form).
- `web-sync-blob-driver` work (DEFERRED on web-ticktick-parity per 2026-05-23
  override).
- Pre-existing P1 build red (`apps/desktop` TS6133/TS6196 errors) — not a P0
  blocker per ADR-0009 D4.

---

## 6. Handoff (for xai-roadmap-loop init)

### Status

- Source doc: this file
- Init Path: `decompose` (7 distinct gaps, each warranting its own row)
- Target manifest: `docs/workflow/roadmap/xai-web-console-gap-closure.md`
- Default automation mode + verify cross-vendor: inherit from xai-web-console.md
  (A-Claude / yes)

### Next Step

Run xai-roadmap-loop init pointing at this source doc. After manifest is
produced + reviewed, run mode dispatches Wave 0 (Gap 7 pomodoro test fix —
smallest, fastest, validates the pipeline) first.
