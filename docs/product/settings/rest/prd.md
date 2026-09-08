# PRD — 设置·其余面板 / Settings · Rest（子）

> Canonical 子 PRD（主壳见 `docs/product/settings/prd.md`）。`xai-feature-dossier-sync` Mode: apply（2026-06-01）。
> 基于 `docs/reviews/settings/20260601-prd.draft.md`。规则：每条带 `Source:`；迭代仅在 §7 追加；未定项标 `待确认`。
> 本子 PRD 含 baseline 11 panes + 3 个 gap-closure 扩展（integrations / premium / account-delete）+ About bugfix。

| 元信息 | 值 |
|---|---|
| Feature | 设置·其余面板（子，11 panes + 扩展） |
| 包 | `@repo/plugin-web-settings-rest`（目录 `packages/plugin-web-settings-rest/`，doc-split 已归并 2026-06-01） |
| 状态 | SHIPPED（baseline W4b #24 + gap #7/#8/#9 + About bugfix #10） |
| 历史 lineage | `dev_log.origin.md`（原 `xai-web-settings-rest/docs/`，归档 2026-06-01） |

## 1. Overview
交付设置页除外观/功能开关外的 11 个面板（Account / Premium / Smart Lists / Notifications / Date & Time / More / Integrations / Collaborate / Sticky Note / Hotkeys / About），并在 gap-closure 阶段补齐 Integrations OAuth stub、Premium Stripe stub、Account delete wire（均为 stub-only，无真实后端）。
- Source: rest discovery §1；rest `dev_log.origin.md` Status Panel L9

## 2. Target users & core scenarios
Web Console 使用者。场景：管理账号（头像/升级/登出/删号）、通知、日期时间、智能列表、第三方集成、便签颜色、热键查看、关于页等。
- Source: rest discovery §1 表格

## 3. In Scope

### 3.1 Baseline 11 panes（W4b #24）
11 个非 placeholder 设置页 + 37 个 pref + 删号 confirm modal（v1 仅 modal 流程，无真实删号）。
- Source: rest `dev_log.origin.md` L9–11；doc-split commit `6b8de35`

### 3.2 Integrations OAuth stub（gap #7）
Notion / GCal / Linear 的 Connect/Disconnect + OAuth 回调页（PKCE state 存 sessionStorage `xai_oauth_pending_*`，10min TTL）+ Connected(stub) 区 + disclosure banner；其余 14 张卡保持 no-op。新增 `xai_pref_integrations_connected_{notion,gcal,linear}`。
- Source: integrations discovery §1/§4.1/§4.4/§9；rest dev_log Lineage #7

### 3.3 Premium Stripe stub（gap #8）
Upgrade → Payment Link；success/cancel 回调页；`premium_stub` 徽章；Cancel Subscription；disclosure banner。新增 `xai_pref_premium_tier` + `xai_pref_premium_started_at`（30 天 read-side 过期）。
- Source: premium discovery §1–§4.1/§2.5；rest dev_log #8

### 3.4 Account delete wire（gap #9）
2 步删号（Type DELETE 匹配）；live/mock 清本地 registered keys（迭代 `PREF_REGISTRY` 全部 `xai_*`，约 42 keys）+ IDB 3 库（`web-encrypted-cache`/`xai-web-ai-secrets`/`xai-web-auth`）+ 跳转 `/`。Edge Function 本体不 ship。
- Source: account-delete discovery §1/§2.3；rest dev_log #9

### 3.5 About 链接 bugfix（Audit Top-10 #10）
About 4 链接改为 disabled + 「Coming soon/即将推出」tooltip（不隐藏、不提供真实页面）。
- Source: rest dev_log BUGFIX L1191–1197；commit `7e5e297`

## 4. Non-Goals
- baseline：无真实 OAuth / 热键重绑定 / 账号资料编辑；删号 v1 仅 modal+事件。Source: rest discovery §1/§5
- #7：无 token 持久化 / 无 backend；14 张未接线卡保持 no-op。Source: integrations discovery §1/§9
- #8：无 SK / webhook / 真实订阅 / 功能 gating / Stripe.js 内嵌。Source: premium discovery §4.2
- #9：Edge Function 本体不 ship；无 GDPR export；无撤销删号 grace。Source: account-delete discovery §13
- About #10：不隐藏链接；不提供真实 Changelog/Privacy/Terms/Feedback 页。Source: rest dev_log BUGFIX L1191

## 5. Acceptance Criteria
| 范围 | AC/test 组 | Source |
|---|---|---|
| baseline | lint/typecheck + 81 tests + storage parity +37 + web build；各 pane 矩阵（如 IN1–IN6） | rest test.md §3–§4 |
| #7 integrations | PK1–8 / OS1–7 / IP1–4 / IN-EXT-* / CSP3 / no-Math.random / no-localStorage guards | rest test.md §5 |
| #8 premium | PT* / CS* / CC* / PCANCEL* / PB-BANNER* / TT-NO-SK* / TT-NO-STRIPE-JS* / CSP4* / 保留 PR1–3 | rest test.md §6 |
| #9 account-delete | DEL-STEP-* / DEL-TYPEMATCH-* / DEL-ORCH-* / DEL-WIPE-* / DEL-WILDCARD-GUARD / DAA-1..8 | rest test.md §7 |
| About #10 | AC-AB-1..10 / AB5–AB7 | rest dev_log BUGFIX L1355–1366 |

## 6. Owning packages
`@repo/plugin-web-settings-rest`（11 baseline panes + 3 gap-closure 扩展 + About bugfix；CallbackPage / panes/*）。

## 7. Revision History
| Date | Iteration | User-visible change | Source | 状态 |
|---|---|---|---|---|
| 2026-06-01 | PRD 建立 | dossier-sync 反向补账 | `docs/reviews/settings/20260601-prd.draft.md` | — |
| 2026-05-23 | W4b #24 baseline | 11 panes + 37 pref + 删号 modal | rest `dev_log.origin.md`；`6b8de35` | SHIPPED |
| 2026-05-26 | gap #7 | Integrations OAuth stub | integrations discovery；rest dev_log #7 | SHIPPED |
| 2026-05-26 | gap #8 | Premium Stripe stub | premium discovery；rest dev_log #8 | SHIPPED |
| 2026-05-26 | gap #9 | Account delete wire | account-delete discovery；rest dev_log #9 | SHIPPED |
| 2026-05-28 | bugfix #10 | About 4 链接 disabled + Coming soon | rest dev_log BUGFIX；`7e5e297` | SHIPPED |

## 8. Traceability Matrix
| Requirement | Source | Implementation | Tests |
|---|---|---|---|
| 11 baseline panes | rest origin dev_log / discovery | `panes/*` + 37 pref | baseline 矩阵 |
| Integrations stub | integrations discovery / dev_log #7 | OAuth CallbackPage + connected keys | PK/OS/IP |
| Premium stub | premium discovery / dev_log #8 | Payment Link + tier keys | PT/CS/CC |
| Account delete | account-delete discovery / dev_log #9 | 2-step modal + wipe orchestrator | DEL-*/DAA |
| About 链接 bugfix | rest dev_log BUGFIX / `7e5e297` | About pane disabled links | AC-AB-1..10 |

## 9. Open Items（诚实标注，非阻塞）
- **baseline Commits 段占位**：canonical dev_log L139–141 仍 `(To be filled in)`；权威 ship 证据在 `dev_log.origin.md` L335–337。
- **🟡 待确认 #1**：baseline row #24 权威 ship SHA（doc-split 写 `6b8de35`；origin 列 `bf6492e`…`5abeb4d`）→ 以 git/PLUGIN_MAP 为准。
- **🟡 待确认 #2**：AI pane（`panes/aiPane.tsx`）追溯属 `packages/xai-web-ai-chat/`，不在本 settings PRD 边界 → 是否在 ai-chat 单独建 PRD 待定。Source: rest dev_log #7 注 L160
- **Ship-not-logged**：`release-log.md` 缺 rest 全系列 → 本轮 `xai-release-log` 补登。
- **Cross-vendor smoke**：#7/#8/#9 + About 多处 24h defer（ADR-0008 §S3）；`docs/reviews/*/20260526-cross-vendor-smoke.md` 存在但未确认人工 PASS。
