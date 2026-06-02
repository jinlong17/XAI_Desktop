# ADR-0014 — Cross-Module Sync Orchestration / 跨模块同步编排

## S1 — 概述 / Header

| 字段 / Field | 值 / Value |
|---|---|
| ADR # | 0014 |
| Title | Cross-Module Sync Orchestration — 完成一个核心模块后,如何把同步/适配/检查固化成可复用、可触发、可并行的动作 |
| 状态 / Status | **Accepted** — 2026-06-01 (operator-confirmed flip by Jinlong)；builds on ADR-0013（同日 2026-06-01 经 operator flip 为 Accepted）——治理基线一致 |
| 日期 / Date | 2026-06-01 |
| 决策者 / Author | Claude Opus 4.8 (1M context) — drafted at operator (Jinlong) request；经一次独立 Codex (`codex exec`, gpt-5.x) 对抗复核后修订 |
| Supersedes | none |
| Builds on / Extends | ADR-0010（amended active-focus order）、ADR-0013（branch topology + D3 gate + D4 account-sync）、ADR-0008（Cloudflare deploy + CSP）、`docs/contracts/account-sync-verification-gates.md`（D4 权威）、`docs/PRODUCT_MODULE_MAP.md`（六模块路由）、`docs/workflow/project/branch-policy.json` |
| Related | `docs/workflow/project/sync-registry.json`（本 ADR 的机读伴生物）、`.teams/skills/xai-{web-to-desktop-sync,release-log,dev-dashboard-sync,feature-brief}`、`.githooks/` |

---

本 ADR 是 **编排层 / orchestration-layer**,不是优先级转向。它**完全遵循** ADR-0010
的 P0/P1/P2 active-focus 顺序与 ADR-0013 的分支治理,**不新增任何对冻结线的开工授权**。
它只回答一个运营问题:

> 当我集中几天做完一个核心模块(典型是 Web)后,如何用**一句话**触发后续模块的
> 同步/适配/检查,让它们尽量**并行**跑完,最后**统一验证 + reconcile**,而不必每次
> 重新打开命令行、重新解释背景、重新说明"这个功能要同步到哪个模块"。

---

## S2 — 背景 / Context

### S2.1 操作者的目标(原始想法)

把线性开发:

```
Web 3天 → Desktop 3天 → Plugin 3天 → CloudSync 3天 → 官网 3天 → Dashboard 3天 ≈ 20 天
```

变成:

```
Web 集中 3 天 → 一句话触发多条同步 → 多窗口并行处理 → 统一验证/合并/部署 ≈ 5 天
```

### S2.2 诚实的压缩来源(预期管理)

压缩**不是**"六模块同时从零开发"。压缩来自两点,且仅此两点:

1. **消灭重复解释**:把"哪个改动要同步到哪个模块、走哪个门、产出什么"固化成机读规则,
   一句话即可派发。
2. **并行化"检查 / 适配 / 草案 / 回执"这层开销**——而**不是**并行化"落地源码"。

**硬约束(来自 ADR-0010 / ADR-0013,本 ADR 不改)**:`site`/`admin` 是 PROPOSED,
`sync`/`plugin` 是 P2 PAUSED(until G1 SHIPPED)。这四条线在解冻前**只能产出
diff / 草案 / 检查回执,不能落地产品源码、不能开实作分支**。因此真实形态是
**半自动:检测 → 提议 → 产回执 → 挂在 operator 解冻门后**,不是全自动 merge。

### S2.3 已存在、可复用的零件(避免重造)

| 能力 | 现状 |
|---|---|
| Web→Desktop D3 门(W0–W4 + parity receipt) | ✅ `xai-web-to-desktop-sync`(classifier + handoff,不 merge/不 ship) |
| 发布记录 / changelog | ✅ `xai-release-log` skill；唯一 changelog 面 `docs/workflow/project/release-log.md` |
| dev-dashboard / 产品结构图 同步 | ✅ `xai-dev-dashboard-sync` skill + `.githooks/{post-merge,post-checkout,post-commit}`（自动跑 `scripts/dashboard/generate-state.mjs`） |
| 需求规范化 / 占位 brief | ✅ `xai-feature-brief` |
| 单功能流水线 / 批量 | ✅ `xai-feature-full-loop` / `xai-roadmap-loop` |
| 机读分支拓扑 | ✅ `docs/workflow/project/branch-policy.json` |
| D4 account-sync 权威契约 | ✅ `docs/contracts/account-sync-*.md`（8 个,含 verification-gates） |

**唯一真实缺口**:没有一个 skill 校验 ADR-0013 §D4 的 account-sync 9 项完备性
+ device-local-永不上云;没有一个"看着模块做完→语义派发下游"的入口。

---

## S3 — 这份方案是怎么得出的(方法学,本身是一条决策)

本 ADR 不是单源直出,而是经过一次 **grounding + 对抗复核** 的流程,这个流程本身被
固化为 D5:

1. **Grounding**:一个 8-agent workflow 并行读真实仓库 + 联网调研成熟实践
   (monorepo affected-graph / release automation / parallel multi-agent),综合出
   初版 9 条 workflow 设计。
2. **独立对抗复核**:用 `codex exec -s read-only`(只读沙箱)让 Codex 独立核验初版的
   每一条事实声明并批判设计。Codex 给出 **REVISE**,命中多处真实错误。
3. **复验 + 采纳**:操作者侧(Claude)对 Codex 的每条反驳**独立复验**(不盲信),
   确认全部成立后修订成本 ADR。

### S3.1 Codex 复核命中、且经复验采纳的修正(决策依据)

| 初版错误 | 修正 | 证据 |
|---|---|---|
| 称"只有 4 个 xai-* skill" | 实有 6→现 7 个(`xai-dev-dashboard-sync`、`xai-feature-dossier-sync` 等) | `.claude/skills/` symlink 列表 |
| 称 `entities.ts` 是唯一 entityType 注册表 | entityType **分散**在各包 `types.ts`;`entities.ts` 只是中心映射之一 | `widgets.widget`/`project.project`/`clipboard.entry`/`sync.outbox` 各自定义 |
| 让 D4 workflow `feat(core-data): register entity` | **违反 sync 冻结**——D4 改为 **receipt-only,绝不写源码** | ADR-0010 P2 PAUSED |
| 建议"补一条 web→sync 假依赖边" | web→core-data **已传递存在**(via plugin-console/productivity),不必伪造 | `apps/web/package.json` + 两包 `package.json` |
| 称 dashboard"无防漂移自动化" | 已有 `xai-dev-dashboard-sync` + `.githooks` | `.githooks/post-merge` |
| 9 条固定 lane | 对 solo dev 过重 → 压成 **4 类动作 + 语义规则** | — |
| 漏引 D4 权威 | 以 `docs/contracts/account-sync-verification-gates.md` 为准 | 文件存在 |

> 结论:**"跨切面设计 / registry 锁定前,先过一遍独立 Codex 只读对抗复核"** 应成为
> 标准一步(D5)。它便宜、只读、专治"单源陈旧"。

---

## S4 — 决策 / Decision

### D1 — 用「4 类可复用动作」取代「六模块两两 workflow / 9 条固定 lane」

机读定义见 `docs/workflow/project/sync-registry.json` 的 `actions[]`。

| 动作 id | 职责 | skill | 写源码? | parallel | 依赖 |
|---|---|---|---|---|---|
| `d3_web_to_desktop` | Web→Desktop D3 回执(W0–W4) | ✅ `xai-web-to-desktop-sync` | 否 | ✅ | — |
| `d4_account_sync_scope_check` | account-sync D4 范围+9 项检查 | 🆕 `xai-account-sync-scope-check` | **否(receipt-only)** | ✅ | — |
| `release_and_dashboard_sync` | release-log 追加 + dashboard 镜像同步(收口) | ✅ `xai-release-log` + `xai-dev-dashboard-sync` | 否 | ❌ | 前三者 |
| `frozen_line_impact_brief` | site/admin/plugin 影响草案 | ✅ `xai-feature-brief` | **否(brief-only)** | ✅ | — |

**被砍/降级**(均按 Codex,经复验同意):
- `web_to_plugin` → 并入 `d3_web_to_desktop` 的 optional impact note,不单列。
- `desktop_to_plugin` → 不是 web 扇出;等 plugin 线解冻再独立建。
- `cloud_sync_fanout` → 并入 `d4_account_sync_scope_check` 的双端 receipt,不写源码。
- `xai-structure-sync` → **不新建**;收口复用已存在的 `xai-dev-dashboard-sync` + git hooks。

**净结果:真正要新建的 skill 只有 1 个**(`xai-account-sync-scope-check`)+ 1 个派发器。

### D2 — 用「语义触发 registry」做派发,而非 `turbo --affected` 魔法

`turbo --affected` 看 workspace 依赖图,但**它不懂语义**——它不知道"Web IndexedDB
形态变了 = 需要 D4 检查"。因此派发的真正杠杆是 `sync-registry.json` 的 `rules[]`:
对 **changed paths + 关键字 + entityType/syncScope diff** 做语义匹配。

```
path 命中 entities.ts | **/types.ts | sync-outbox.ts 且 diff 含 entityType/syncScope → d4 检查
path 命中 apps/web/** 且触 @repo/core 共享 seam / 运行时 profile               → d3
path 命中 wrangler.toml | _headers | deploy/** 或关键字 CSP/download/updater     → site brief
path 命中 aiPane | secretStore | usage | web-auth-device-session                 → admin brief
事件 任一 dev_log → SHIPPED                                                      → release+dashboard
路由/Map/skill mirror 变化                                                       → dashboard-mirror-sync
```

派发器 `xai-sync-fanout-dispatch`(Phase 2 新建)读此表,产出每个命中动作的
**copy-paste prompt(多窗口)** 或 spawn worktree-pinned subagent。**不伪造 web→sync 依赖**。

### D3 — 单写者文件归属(防并行冲突)

并行的前提是"每个文件只有一个写者"。完整表见 registry `file_ownership[]`,关键:

| 文件 | 唯一 owner |
|---|---|
| `release-log.md` | `release_and_dashboard_sync` |
| dashboard 镜像链(`dashboard-state.json`/`state.generated.js`/`generate-state.mjs`) | `release_and_dashboard_sync`（`state.generated.js` 只生成、禁手改) |
| `PRODUCT_MODULE_MAP.md` + `CLAUDE.md`/`AGENTS.md`/`.cursor` 路由 + skill mirror | `release_and_dashboard_sync`（改后跑 Agent/Skill Tracking 审计) |
| `entities.ts` + `docs/contracts/account-sync-*.md` | `d4_account_sync_scope_check`（**只读检查,不写**) |
| `turbo.json` | `release_and_dashboard_sync` |
| `docs/reviews/<f>/*-d3-receipt.md` / `*-d4-check.md` | 对应 d3 / d4 |

**收口动作(`release_and_dashboard_sync`)必须等所有影响 routing/release/dashboard/
skill-surface 的 lane 完成**,而非只等三条。

### D4 — 冻结线护栏

`site`/`admin`/`sync`/`plugin` 命中的动作**只产 receipt/草案**:
- 不写产品源码、不改各包 `types.ts`/`entities.ts`、不开 `codex/{site,admin,plugin}/*` 实作分支。
- 创建 `desktop-next`/`desktop-plugin-next`/`release/*`、任何触及 `dev`、任何解冻,
  都是 **operator 显式确认的独立步骤**,不进任何并行 wave。
- `web→app` 永远只产 D3 receipt + `merge-to-desktop-next` handoff,**绝不在集成分支
  直接 merge 进 `dev`**。

### D5 — 锁定前的独立 Codex 对抗复核(standing step)

任何跨切面设计 / 本 registry 的结构性变更,在锁定前应跑一次
`codex exec -s read-only`(只读、不写、不联网即可)做对抗复核,核验事实声明 + 挑战设计,
再据其结论(经复验)修订。本 ADR 即按此流程产出(见 S3)。

---

## S5 — 方案 / v1 Rollout(分阶段,每步独立有价值)

| Phase | 内容 | 风险 | 状态 |
|---|---|---|---|
| **0** | 暴露 `xai-release-log`(symlink 进 `.claude/skills`)+ 写 `sync-registry.json`(最小语义规则,不固化 9 lane) | 零(纯增量,不动冻结线) | ✅ **本 ADR 提交时完成** |
| **1** | 建唯一新 skill `xai-account-sync-scope-check`：权威 = `account-sync-verification-gates.md`,只产 check receipt,默认禁止源码落地;首个用例 = clipboard 漂移(见 S6) | 中(最高 ROI) | 待启动 |
| **2** | 建派发器 `xai-sync-fanout-dispatch`：走 registry 语义规则,输出多窗口 prompt 或 spawn subagent | 中 | 待启动 |
| **3** | 收口复用 `xai-dev-dashboard-sync` + `.githooks` 做 mirror lint;site/admin/plugin 专属 skill **等 operator 解冻后再建** | 低 | 待启动 |

### S5.1 目标运行时形态

```
集中 3 天做完 web
  → 「Web 版本功能已完成,执行后续同步 workflow」
  → xai-sync-fanout-dispatch 读 sync-registry.json 语义规则,判定命中动作
  → Wave 1（并行,各 worktree）: d3_web_to_desktop · d4_account_sync_scope_check · frozen_line_impact_brief
  → Wave 2（收口）: release_and_dashboard_sync
  → 各 lane 产出绿色门 artifact(D3 receipt / D4 check / 草案 / release 条目)
  → 收敛到 integration/web-sync-<date> → 跑一次全量 check-types+lint+test
  → operator-gated reconcile 进 main（ADR-0013 §D5）
  → web→app 的 D3 handoff 留 operator 确认,绝不直接进 dev
```

### S5.2 branch / commit / merge

- **branch**:每个并行动作一个 git worktree,base = `origin/web`,六短分支约定
  `codex/{web|desktop|plugin|sync|site|admin}/<feature>`;每 worktree 复制(非 symlink).env + 不同 PORT;WIP ≤ 5。
- **commit**:`type(scope): summary` + Why/What/Scope/Risk/Docs/Tests;scope == 模块 key;
  **每个 worktree 只提交它独占的文件集,绝不在一个 commit 混跨 owner**(规避 git reset 工作树丢失)。
- **merge**:fan-out-then-verify → 短命 `integration/web-sync-<date>` 收敛 → 全量绿 →
  operator-gated reconcile 进 main。CI 镜像同图(4 lane 并行 + 收口 fan-in,reusable ref 钉 SHA)。

---

## S6 — 后果 / Consequences

### 正面
- 一句话扇出,消灭重复解释;solo dev 心智负担从"6 模块两两关系"降到"4 类动作 + 规则表"。
- 只新建 1 个 skill,其余全复用;不与现有治理冲突。
- 冻结线护栏 + 单写者归属,使并行**安全**;唯一可能的共享写面(core-data/contracts)被 receipt-only 化解。

### 负面 / 风险
- 语义规则需人工维护(路径/关键字漂移会漏触发)——靠 D5 复核 + Phase 3 mirror lint 缓解。
- `release_and_dashboard_sync` 是串行收口瓶颈(刻意,为防镜像链并发写)。
- site/admin/plugin 的"真正建设"仍受冻结约束;本编排只把它们的**待办草案**前置,不解冻。

### S6.1 首个被发现的真实漂移(D4 第一个用例)

**`clipboard` entityType 漂移(severity: medium)**:
- `packages/core-data/src/entities.ts:82,128` 注册 `clipboard.item`,且
  `repo-utils.ts:38-42` 的 **E3005 守卫按 `clipboard.item` 强制 device-local**;
- 但 `plugin-clipboard` 运行时全程用 `clipboard.entry`
  (`types.ts:14`、`data/RepoAdapter.ts:4`、`hooks/useClipboardStore.tsx:34/47/60/229`)。
- **风险**:device-local-永不上云的守卫按 `clipboard.item` 匹配,而插件真实记录是
  `clipboard.entry`,守卫可能**没罩住**插件数据。
- **处置**:作为 `xai-account-sync-scope-check` 的首个用例核查并 reconcile 哪个串是
  canonical;**已 spawn 独立任务跟进,不在本 ADR 内修复**。

---

## S7 — References

- `docs/workflow/project/sync-registry.json` — 本 ADR 的机读伴生物(actions/rules/file_ownership/dispatch/rollout)
- ADR-0010、ADR-0013、ADR-0008
- `docs/contracts/account-sync-verification-gates.md`(+ 同目录 account-sync-* 7 份)
- `docs/PRODUCT_MODULE_MAP.md`、`docs/workflow/project/branch-policy.json`
- skills: `xai-web-to-desktop-sync`、`xai-release-log`、`xai-dev-dashboard-sync`、`xai-feature-brief`
- `.githooks/{post-merge,post-checkout,post-commit}`、`scripts/dashboard/generate-state.mjs`
