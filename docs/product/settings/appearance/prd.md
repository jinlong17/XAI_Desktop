# PRD — 设置·外观 / Settings · Appearance（子）

> Canonical 子 PRD（主壳见 `docs/product/settings/prd.md`）。`xai-feature-dossier-sync` Mode: apply（2026-06-01）。
> 基于 `docs/reviews/settings/20260601-prd.draft.md`。规则：每条带 `Source:`；迭代仅在 §7 追加。

| 元信息 | 值 |
|---|---|
| Feature | 设置·外观（子面板） |
| 包 | `@repo/xai-web-settings-appearance`（目录 `packages/xai-web-settings-appearance/`） |
| 状态 | SHIPPED（W4b #22） |
| 持久化 | 复用 `xai_accent_hue` / `xai_rail_pos` / `xai_bg_tone`（无新增 key）+ 4 维经 event bus |

## 1. Overview
外观面板：7 维实时绑定（语言 / 主题 / 密度 / 强调色 / 背景 tone / 侧栏位置 / 字号），含预览卡、滑块、Save/Reset，所见即所得。
- Source: appearance dev_log Title L5；appearance discovery §1

## 2. Target users & core scenarios
Web Console 使用者。场景：调强调色/主题/密度等 → 预览卡实时反映 → Save 持久化或 Reset 还原。
- Source: appearance discovery §1

## 3. In Scope
| 能力 | Source |
|---|---|
| 7 维外观（语言/主题/密度/强调色/背景tone/侧栏位置/字号）实时绑定 | appearance discovery §1 表格 |
| 预览卡 + 滑块 + Save/Reset（AC-RESET-6 单次 confirm） | appearance test.md；dev_log L210–244 |
| 持久化 3 key（`xai_accent_hue`/`xai_rail_pos`/`xai_bg_tone`）；pane 仅写 6 个 canonical `xai_bg_tone` id | appearance api.md L207–209；discovery §5 #3/#4 |

## 4. Non-Goals
- Pet on/off 不在此 pane（属 shell pet 通道）。Source: appearance discovery §5 #1
- 不扩展 `PaneRenderProps`；Reset 不含 `lang`。Source: appearance discovery §5 #11/#7

## 5. Acceptance Criteria
| AC 组 | Source |
|---|---|
| AC-CONST-* / AC-LIVE-* / AC-RENDER-* / AC-I18N-* / AC-SAVE-* / AC-RESET-*（含 AC-RESET-6） / AC-REG-* | appearance test.md |
| 集成 AC-COMP-* / AC-APP-* / AC-PERSIST-* / AC-RESET-INT-* / AC-EVT-* | appearance test.md |
| feature-verify 20 gates | appearance dev_log L221–244 |

## 6. Owning packages
`@repo/xai-web-settings-appearance`（单 pane，嵌入主壳 composition 缝）。

## 7. Revision History
| Date | Iteration | User-visible change | Source | 状态 |
|---|---|---|---|---|
| 2026-06-01 | PRD 建立 | dossier-sync 反向补账 | `docs/reviews/settings/20260601-prd.draft.md` | — |
| 2026-05-23 | W4b #22 | 7 维外观实时预览与持久化 | appearance dev_log；`61f6177`/`17f9f18` | SHIPPED |

## 8. Traceability
| Requirement | Source | Implementation | Tests |
|---|---|---|---|
| 7 维实时外观 | appearance dev_log / discovery §1 | Appearance pane（7 控件 + 预览） | AC-LIVE/RENDER |
| 持久化 + Reset | appearance api.md / discovery §5 | 3 key + `resetAllPrefs` 联动 | AC-SAVE/RESET |

## 9. Open Items
- Cross-vendor smoke ship-time queued。Source: appearance dev_log L243
- 局部 vs 全局 Reset 文案（design §15 `confirmMessage?` TBD）。Source: appearance design §15
