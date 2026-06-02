# PRD — 设置·功能开关 / Settings · Features（子）

> Canonical 子 PRD（主壳见 `docs/product/settings/prd.md`）。`xai-feature-dossier-sync` Mode: apply（2026-06-01）。
> 基于 `docs/reviews/settings/20260601-prd.draft.md`。规则：每条带 `Source:`；迭代仅在 §7 追加。

| 元信息 | 值 |
|---|---|
| Feature | 设置·功能开关（子面板） |
| 包 | `@repo/xai-web-settings-features-panel`（目录 `packages/xai-web-settings-features-panel/`） |
| 状态 | SHIPPED（W4b #23） |
| 持久化 | `xai_pref_features_{tasks…meditation}` 8 个 boolean（default true） |

## 1. Overview
功能开关面板：8 个模块的 on/off + SVG 缩略图。关闭后侧栏 rail 隐藏该模块，深链访问显示 Disabled 空态。
- Source: features dev_log Title L5；features discovery §1

## 2. Target users & core scenarios
Web Console 使用者。场景：关闭不用的模块 → rail 即时隐藏 → 直接访问被禁模块路由时显示 Disabled 空态。
- Source: features discovery §1

## 3. In Scope
| 能力 | Source |
|---|---|
| 8 模块 on/off 开关 + SVG 缩略图 | features dev_log Title；discovery §1 |
| rail 过滤（关闭即隐藏模块） | features discovery §1 |
| 禁用模块深链空态 | features discovery §1 |
| 持久化 `xai_pref_features_*` 8 boolean default true | features api.md L69–76 |

## 4. Non-Goals
- 不含 pet；不含 countdown（defer 到 rest）；v1 不要求跨 tab 同步。Source: features discovery §1NB/§3/§5R3

## 5. Acceptance Criteria
| AC 组 | Source |
|---|---|
| AC-FILTER-* / AC-PREFS-* / AC-PANE-* / AC-FB-* / AC-WRAP-* / AC-REG-* | features test.md §A–E |
| 集成 AC-APP-*；5 seed AC | features test.md §E；verify-report |

## 6. Owning packages
`@repo/xai-web-settings-features-panel`（单 pane + rail 过滤逻辑）。

## 7. Revision History
| Date | Iteration | User-visible change | Source | 状态 |
|---|---|---|---|---|
| 2026-06-01 | PRD 建立 | dossier-sync 反向补账 | `docs/reviews/settings/20260601-prd.draft.md` | — |
| 2026-05-23 | W4b #23 | 8 模块开关 + 缩略图 + rail 过滤 + 禁用空态 | features dev_log；`85761cd`/`79cd0e7`/`9822c42` | SHIPPED |

## 8. Traceability
| Requirement | Source | Implementation | Tests |
|---|---|---|---|
| 8 模块开关 | features dev_log / discovery §1 | Features pane（8 toggle + 缩略图） | AC-PREFS/PANE |
| rail 过滤 + 禁用空态 | features discovery §1 | rail filter + Disabled 空态 | AC-FILTER/FB |

## 9. Open Items
- Cross-vendor smoke ship-time defer。Source: features dev_log L22–23
