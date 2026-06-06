# PRD — 设置 / Settings（主壳）

> Canonical 主 PRD。由 `xai-feature-dossier-sync` Mode: apply 反向建立（2026-06-01），
> 基于已审草稿 `docs/reviews/settings/20260601-prd.draft.md`。
> **主 + 子结构（粒度决议 §6 已签字）**：本文件是设置功能的主壳 PRD；各面板见子 PRD：
> `docs/product/settings/appearance/prd.md` · `docs/product/settings/features/prd.md` · `docs/product/settings/rest/prd.md`。
> 规则：每条需求保留 `Source:`；后续迭代仅在 §7 追加；未定项标 `待确认`，不臆造。

| 元信息 | 值 |
|---|---|
| Feature | 设置 / Settings |
| 产品模块 | web |
| 主壳包 | `@repo/plugin-web-settings-shell`（目录 `packages/plugin-web-settings-shell/`，doc-split 已归并） |
| 子面板包 | `xai-web-settings-appearance` · `xai-web-settings-features-panel` · `plugin-web-settings-rest`（各有子 PRD） |
| 当前状态 | SHIPPED（W4a 主壳 + W4b 3 面板 + rest 3 gap-closure + About bugfix） |
| 持久化键 | 主壳无新增（Reset 遍历 `PREF_REGISTRY` 的 `xai_*`） |
| 路由 | `/app/settings` |

## 1. Overview — why / problem solved

提供 Web Console 的统一设置入口：一个 13 分组侧栏的设置页壳，编排所有设置面板（外观/功能开关/账号/通知/集成等），并提供全局 Save & apply + Reset to defaults。各面板内容由子包交付，主壳只负责信息架构、组合缝（composition）与全局 Save/Reset 语义。

- Source: shell dev_log Status Panel L9；shell discovery §1–§2；roadmap row #21

## 2. Target users & core scenarios

XAI Web Console 使用者。核心场景：
1. 进入 `/app/settings`，左侧 13 分组导航，点选切换面板。
2. 修改设置后底部 Save & apply（1800ms「Saved/已保存」反馈）。
3. Reset to defaults：清 `xai_*` prefs + 广播 7 个 canonical pref。

- Source: shell discovery §1；shell dev_log §Acceptance

## 3. In Scope（主壳）

| 能力 | 说明 | Source |
|---|---|---|
| 13-pane 侧栏壳 | Account / Premium / Features / Smart Lists / Notifications / Date & Time / Appearance / More / Integrations / Collaborate / Sticky Note / Hotkeys / About | shell dev_log L9；shell discovery §1 |
| atomic 组件契约 | `Toggle` / `SettingRow` / `SectionBlock` / `SettingsFooter` 复用原子 | shell test.md §3（TG/SR/SB/F 组） |
| composition 缝 | `settingsPaneComposition.ts` 把 placeholder 替换为子包真实 pane | shell discovery §2；subagent 探查 §A |
| Save & apply | 1800ms「Saved」反馈 | shell dev_log §Acceptance |
| Reset to defaults | 遍历 `PREF_REGISTRY` 清 `xai_*` + 广播 7 canonical pref | shell dev_log L48；discovery §5 #5 |
| 共通道事件 | `web:settings:preference-changed` | shell discovery §5 |
| 模块注册 | `showInRail: false`（设置不在主 rail 显示为模块） | shell discovery §5 #6 |

## 4. Non-Goals（明示不做）

- 各 pane 的具体内容由 sibling 子包交付，主壳仅 placeholder + 原子 UI。Source: shell discovery §1
- 无新 storage key；无新 EventMap；v1 无 active-pane URL 路由。Source: shell discovery §5 #5/#6/#11

## 5. Acceptance Criteria

| AC 组 | 内容 | Source |
|---|---|---|
| TG1–4 / SR1–4 / SB1–2 | atomic 组件 | shell test.md §3 |
| R1–R8 | `resetAllPrefs` | shell test.md §3 |
| F1–F8 | `SettingsFooter` | shell test.md §3 |
| M1–M10 | `SettingsModule` | shell test.md §3 |
| RG1–3 / B1–3 | registration + barrel | shell test.md §3 |
| feature AC 1–8 | 整 feature 级 | shell dev_log §Acceptance L154–165 |

## 6. Owning modules / packages

| 包 | 角色 | 子 PRD |
|---|---|---|
| `@repo/plugin-web-settings-shell` | 主壳（本 PRD） | — |
| `@repo/xai-web-settings-appearance` | 外观面板 | `docs/product/settings/appearance/prd.md` |
| `@repo/xai-web-settings-features-panel` | 功能开关面板 | `docs/product/settings/features/prd.md` |
| `@repo/plugin-web-settings-rest` | 11 baseline panes + 扩展 | `docs/product/settings/rest/prd.md` |

> W4 依赖顺序：shell #21 → 并行/后续 appearance #22 / features #23 / rest #24。Source: shell dev_log L333

## 7. Revision History

| Date | Iteration | User-visible change | Source | 状态 |
|---|---|---|---|---|
| 2026-06-01 | PRD 建立 | dossier-sync 反向补账，首次建立主壳 canonical PRD | `docs/reviews/settings/20260601-prd.draft.md` | — |
| 2026-05-23 | W4a #21 | 13-pane 侧栏壳 + Save/Reset + 双语 | shell dev_log；`3cb7e6a`/`f637a3d`/`39da7af` | SHIPPED |

> 各面板迭代历史见对应子 PRD §7。

## 8. Traceability Matrix

| Requirement | Source | Implementation | Tests |
|---|---|---|---|
| 13-pane 侧栏壳 | shell dev_log / discovery §1 | `SettingsModule` + paneRegistry | M1–M10 |
| atomic 组件 | shell test.md §3 | `Toggle`/`SettingRow`/`SectionBlock`/`SettingsFooter` | TG/SR/SB/F |
| Reset 全局 | shell dev_log L48 | `resetAllPrefs` | R1–R8 |
| composition 缝 | shell discovery §2 | `settingsPaneComposition.ts` | RG1–3 |

## 9. Open Items（诚实标注，非阻塞）

- **Ship-not-logged**：`release-log.md` 缺 settings 全系列 → 本轮 `xai-release-log` 补登。
- **🟡 待确认**：全局 Reset 文案 vs 各 pane 局部 Reset（appearance design §15 `confirmMessage?` TBD）——待产品决策是否纳入 chassis SemVer minor。Source: appearance design §15
- **Cross-vendor smoke**：shell ship-time queued（Codex/Cursor）。Source: shell dev_log L13
