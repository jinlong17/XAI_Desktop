# Web 文档分裂归属决议 — Doc Split Resolution

> 配套：`20260601-traceability-audit.md` §1（分裂发现）
> 状态：**已执行**（canonical 规则 + PRD 粒度 2026-06-01 签字；动作 A/B 已于 2026-06-01 执行——见 §7 执行记录。剩余"引用路径统一"见 §8 follow-up）
> 决策来源：codex 复核 + 操作者 2026-06-01 指令

## 1. 背景

存在一次未完成的 `xai-web-*` → `plugin-web-*` 迁移：源码 100% 已在 `plugin-web-*`，
但运行态文档（design/api/test/dev_log）大多遗留在 `xai-web-*`，其中 `pomodoro` /
`settings-rest` 的 `dev_log` 分叉成两份。按单一包名无法完成"源码→需求→测试"追溯。

## 2. Canonical 规则（已签字 2026-06-01）

| 资产 | Canonical 落点 | 现状 | 动作 |
|---|---|---|---|
| 源码 | `packages/plugin-web-<f>/src/` | 已是现状 | 无 |
| 运行态四件套 `design/api/test/dev_log` | `packages/plugin-web-<f>/docs/` | 多在 `xai-web-*` | 迁移/合并 |
| 长期产品 PRD | `docs/product/<feature>/prd.md` | 不存在 | 后续 draft→apply |

原则：**运行文档跟源码走（plugin-web），产品 PRD 按功能走（docs/product），不按 npm 包。**

## 3. Canonical 映射表

迁移动作图例：**A** = 单份遗留，`git mv` 历史到 plugin-web；**B** = 双份分叉，人工合并；
**C** = 基础设施，无 dev_log，无需 PRD（可选补 design/api/test）。

| 功能 | canonical 源码包 | 现有 dev_log | 需 PRD? | PRD 落点（功能级） | 动作 |
|---|---|---|---|---|---|
| AI 对话 | `plugin-web-ai-chat` | 仅 `xai-web-ai-chat`（plugin 侧无 docs 目录） | 是 | `docs/product/ai-chat/` | A |
| 看板·视图 | `plugin-web-board-views` | 仅 `xai-web-board-views` | 是（并入看板） | `docs/product/board/` | A |
| 看板·工作区 | `plugin-web-board-workspaces` | 仅 `xai-web-board-workspaces` | 是（并入看板） | `docs/product/board/` | A |
| 看板·核心 | `plugin-web-board-core` | 仅 `xai-web-board-core` | 否（看板基础设施） | —（并入看板 PRD） | A |
| 倒数日 | `plugin-web-countdown` | 仅 `xai-web-countdown` | 是 | `docs/product/countdown/` | A |
| 设置·shell | `plugin-web-settings-shell` | 仅 `xai-web-settings-shell` | 是（并入设置） | `docs/product/settings/` | A |
| 统计 | `plugin-web-statistics` | 仅 `xai-web-statistics` | 是 | `docs/product/statistics/` | A |
| 番茄钟 | `plugin-web-pomodoro` | **双份** xai-web + plugin-web | 是 | `docs/product/pomodoro/` | **B** |
| 设置·rest | `plugin-web-settings-rest` | **双份** xai-web + plugin-web | 是（并入设置） | `docs/product/settings/` | **B** |
| 存储 | `plugin-web-storage` | 无 | 否（基础设施） | — | C |
| tokens | `plugin-web-tokens` | 无 | 否（基础设施） | — | C |

> 未分裂、状态健康（源码+文档同在 `xai-web-*`，无需迁移）：`tasks` `calendar` `matrix`
> `meditation` `habits` `pet` `cmdk` `dashboard-grid` `dashboard-widgets`。

## 4. dev_log 合并策略（动作 B — 人工，禁止机器自动吞）

通则：**`plugin-web-*` 下的 dev_log 成为未来 canonical**；`xai-web-*` 作为历史来源合并进去，
至少保留迁移前的 SHIPPED / Iteration / Verify 记录；逐段 diff，两份都不许整体覆盖或丢弃。

### 4.1 pomodoro（两份互补，必须合并）

| 来源 | 行数 | 性质 | 关键内容 |
|---|---|---|---|
| `xai-web-pomodoro/docs/dev_log.md` | 302 | FEATURE_DEV / SHIPPED / 0 iteration | **原始功能全貌**：circular timer、Start/Pause/Resume/End、4 cards、7-day list、`web:pomodoro:session-finished`（截至 2026-05-23） |
| `plugin-web-pomodoro/docs/dev_log.md` | 190 | BUGFIX / 6 block | **迁移后修复**：`derivedCounters.test.ts` 时间漂移等（截至 2026-05-24） |

动作：以 `plugin-web` 为 canonical，在其顶部新增 `## Origin (pre-migration, from xai-web-pomodoro)`
段，并入 xai-web 的原始功能 Title + SHIPPED + Phase 记录；保留 plugin-web 现有 6 个 bugfix block。
合并后 xai-web 版标记 `superseded → see plugin-web-pomodoro/docs/dev_log.md` 并保留为归档。

### 4.2 settings-rest（plugin-web 是当前真相）

| 来源 | 行数 | 性质 | 关键内容 |
|---|---|---|---|
| `plugin-web-settings-rest/docs/dev_log.md` | **1459** | 32 block / 88 SHIPPED hits / 最新 2026-05-28 | **当前真相**：含大量 audit 修复 + FEATURE_DEV 段（163 行处） |
| `xai-web-settings-rest/docs/dev_log.md` | 475 | FEATURE_DEV / SHIPPED / 0 iteration | 迁移前原始 11-panes 功能描述（截至 2026-05-23） |

动作：以 `plugin-web` 为 canonical 主体。先核对 plugin-web 版是否已含原始 11-panes 功能全貌：
若已含 → xai-web 版直接标记 `archived-superseded`；若缺 → 仅把 xai-web 的原始功能描述补成
`## Origin` 段。不反向覆盖 plugin-web 的 1459 行。

## 5. 建议执行顺序（后续任务，非本轮）

1. 操作者签字确认 §2 canonical 规则（统一到 `plugin-web-*`）。
2. 动作 A 的 7 个功能：`git mv packages/xai-web-<f>/docs/* packages/plugin-web-<f>/docs/`
   （plugin 侧无 docs 则先建），保留 git 历史；清理空的 `xai-web-<f>` 目录。
3. 动作 B 的 2 个功能：按 §4 人工合并，单独 commit，便于回溯。
4. 动作 C 的 2 个基础设施包：按需补 `design/api/test`，不建 PRD。
5. 完成后再跑 `xai-feature-dossier-sync Mode: draft`，分裂功能此时已有稳定 canonical 包。

## 6. 决议记录与待确认

### 已确认（2026-06-01 操作者签字）

1. **Canonical 规则**：运行态四件套统一到 `packages/plugin-web-*/docs/`（跟源码）；
   产品 PRD 统一到 `docs/product/<feature>/`（按功能，不按 npm 包）。
2. **PRD 粒度**：
   - **看板**：合 1 个 `docs/product/board/prd.md`；`board-core` / `board-views` /
     `board-workspaces` 列为 Owning packages（用户只感知一个看板）。
   - **设置**：**1 主 + 按需子** —— `docs/product/settings/prd.md` 覆盖 13-pane 外壳
     与简单开关型 pane；对有独立风险/流程的 pane 各开子 PRD：`account.md`、`premium.md`、
     `notifications.md`、`appearance.md`、`integrations.md`。
   - **单一功能**（tasks / calendar / pomodoro / countdown / statistics / ai-chat）：
     一功能一 PRD。
   - **判断尺**：一个子模块/pane 是否独立成 PRD = 它是否有独立的"为什么 / 验收 / 边界 /
     风险"。纯开关 → 并入主 PRD 一节；有独立流程、数据模型、外部依赖或不可逆风险 → 拆子 PRD。

### 已执行（2026-06-01）

3. 动作 A 的 `git mv` + 动作 B 的双份合并已执行。见 §7。

## 7. 执行记录（2026-06-01）

**动作 A（4 功能，整目录 `git mv`）**：`board-core` / `board-views` /
`board-workspaces` / `settings-shell` 的四件套整体 `git mv` 到
`packages/plugin-web-<f>/docs/`（plugin 侧原无 docs），保留 git rename 历史；
4 个空的 `xai-web-<f>` 残留目录已删除。

> 注：决议 §3 映射表列出的 `ai-chat` / `countdown` / `statistics` 也是动作 A，
> 但**本轮未执行**（操作者本轮范围为"设置/看板 + 双份合并"）。留待下一轮动作 A 收尾。

**动作 B（2 功能，人工合并）**：
- `pomodoro`：原始四件套并入 `plugin-web-pomodoro/docs/`；原始 dev_log 归档为
  同目录 `dev_log.origin.md`（302 行原始功能全貌完整保留）；plugin canonical
  dev_log（190 行 bugfix）的 4 处 lineage 指针改指 `./dev_log.origin.md` 与本目录四件套。
- `settings-rest`：原始 dev_log 归档为 `plugin-web-settings-rest/docs/dev_log.origin.md`
  （475 行）；过时的原始 design/api/test 删除（plugin 侧已有 canonical 版，git 历史可查）；
  canonical dev_log（1459 行）顶部加 `Doc-split 归并` Origin 段，历史叙述（含 PR-2
  reconciliation note）原样保留。

**验证**：staged 24 条全部为 `packages/*/docs/` 路径，0 条非 docs；41 个 runtime
`src` 改动保持 unstaged 未触碰（治理与 runtime 隔离）。6 个 `xai-web-<f>` 残留目录全删。

## 8. Follow-up：引用路径统一（独立专项，本轮未做）

迁移后仍有指向旧地址 `packages/xai-web-<f>/docs/...` 的引用，本质是"rename 后更新引用"，
本轮**有意不做**（避免污染 runtime + 控制范围）。分两类：

| 类别 | 位置 | 规模（估） | 是否碰 runtime | 处理建议 |
|---|---|---|---|---|
| 文档侧死链 | 迁移后 canonical 文档的自/交叉引用（如 `settings-shell/docs/design.md` "Docs host"、`board-views/docs/dev_log.md` 多处、各 dev_log Artifacts Index） | ~7 文档、数十行 | 否（纯 docs） | 安全；可单独 docs commit |
| src 注释死链 | `plugin-web-{pomodoro,board-views,...}/src/**` 文件头 `* Design: packages/xai-web-.../docs/...` 注释 | ~28+ src 文件 | **是**（会新增 runtime modified） | 须独立 commit，勿混入文档治理 |

**不改项（非死链，勿动）**：
- pomodoro canonical dev_log 中"原 `packages/xai-web-pomodoro/docs/*`"——有意的历史出处标注。
- 两个 `dev_log.origin.md` 内部的旧路径——归档快照，保持原貌。
- `docs/reviews/xai-web-<f>/...` review artifact 路径——按发生时 feature 名命名的历史记录。

**统一规则**：真死链一律 `packages/xai-web-<f>/docs` → `packages/plugin-web-<f>/docs`（前缀替换）。
