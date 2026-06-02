# PRD — 记账 / Bookkeeping

> Canonical 产品需求文档。基于 Cloud Design 需求文档正向建立（2026-06-02）。
> 规则：每条需求保留 `Source:`；后续迭代仅在 §7 追加；未定项标 `待确认`，不臆造。

| 元信息 | 值 |
|---|---|
| Feature | 记账 / Bookkeeping |
| 产品模块 | web |
| Owning package | `@repo/plugin-web-bookkeeping`（目录 `packages/plugin-web-bookkeeping/`） |
| 当前状态 | READY_TO_REVIEW（feature branch） |
| 持久化键 | `xai_bk_state_v2` · `xai_bk_dash_order` · `xai_bk_dash_split` · `xai_bk_view` · `xai_bk_calendar_mode` |
| 同步状态 | `device-local`，预留 storage adapter，未接账号云同步 |
| 路由 | `/app/bookkeeping` |

## 1. Overview

在 Web Console 中提供一个真实可操作、可持久化的个人记账模块，覆盖账本、账户、收支、转账、预算、资产、投资、周期账单、统计、日历和导入导出。

- Source: `/Users/lijinlong/Desktop/AI_Desktop/web design/记账模块-需求与设计.md` §1-§4

## 2. Target Users & Scenarios

Web Console 用户需要在一个正式模块里管理日常账本：快速记一笔、查看明细、按日历回看每日收入/支出、按分类分析支出、维护账户资产、管理预算和周期扣费。

- Source: 需求文档「功能完整性要求」12 项；Cloud Design `module-bookkeeping.jsx`

## 3. In Scope

| 能力 | Source |
|---|---|
| Web 导航入口、路由、正式模块接入 | 需求文档 §2 |
| 8 个主视图：总看板 / 日历 / 明细 / 统计 / 预算 / 资产 / 投资 / 周期 | 需求文档设计文件列表 |
| 账本、账户、分类、交易、周期、投资、预算、偏好数据结构 | 需求文档 §3 |
| 支出 / 收入 / 转账 / 预付记录 | 需求文档 §4 |
| 计算器金额输入、日期/时间、备注模板、标签、商家/地点、报销/私密/周期标记 | `bk-record.jsx` / 需求文档 §4 |
| 分类新增、编辑、删除，子分类和备注模板维护 | `bk-modals.jsx` / 需求文档 §4 |
| 统计、日历、筛选、搜索随数据变化 | 需求文档 §4 |
| 本地刷新后保留数据 | 需求文档 §3/§4 |

## 4. Non-Goals

- 不实现云端账号同步、不写 sync registry entity、不解冻 paused sync line。Source: 当前实现 `syncStatus: "device-local"`
- 不实现银行/支付平台真实导入 API。Source: 需求文档仅要求可保存和预留同步接口
- 不实现桌面 App 合并。Source: AGENTS/CLAUDE Web to App D3 gate

## 5. Acceptance Criteria

| AC | 说明 | Evidence |
|---|---|---|
| AC-REG | Web shell 注册 `/app/bookkeeping`，rail icon/text 可见 | `registration.test.tsx` + host router tests |
| AC-STORE | `xai_bk_state_v2` 和偏好键可读写，坏数据回退 seed | `storage.test.ts` |
| AC-TX | 新增/删除交易更新账户余额和衍生统计 | `state-analytics.test.ts` |
| AC-CAL | 日历每日收入/支出按交易聚合 | `state-analytics.test.ts` |
| AC-UI | 页面 tab 渲染，记一笔弹窗可保存并持久化 | `BookkeepingModule.test.tsx` |
| AC-BUILD | Web host 类型检查和生产 build 通过 | dev_log verification |

## 6. Owning Package

`@repo/plugin-web-bookkeeping` 是单包功能模块，host 只负责依赖、路由注册、shell icon 和 i18n 文案。

## 7. Revision History

| Date | Iteration | User-visible change | Source | 状态 |
|---|---|---|---|---|
| 2026-06-02 | Cloud Design port | 正式接入 Web 记账模块 | 本 PRD + package dev_log | READY_TO_REVIEW |

## 8. Traceability

| Requirement | Source | Implementation | Tests |
|---|---|---|---|
| 正式 Web 接入 | 需求文档 §2 | `shellRegistrations.tsx` + `registration.tsx` | host shell/router tests |
| 本地持久化 + 同步预留 | 需求文档 §3 | `internal/storage.ts` + `BookkeepingStorageAdapter` | `storage.test.ts` |
| 记一笔 + 计算器 | 需求文档 §4 | `BookkeepingModule.tsx` + `Calculator.tsx` | `BookkeepingModule.test.tsx` |
| 统计/日历联动 | 需求文档 §4 | `internal/analytics.ts` | `state-analytics.test.ts` |
| 分类/账户/账本/周期/投资管理 | 需求文档 §3/§4 | modal components in `BookkeepingModule.tsx` | typecheck + browser smoke target |

## 9. Open Items

- 云同步 adapter 需要等账号同步线明确 entity contract 后单独做 D4 scope check 和实现。
- Desktop/App parity 不在本分支；如需要下沉，下一步走 `xai-web-to-desktop-sync` D3。
- 真实银行/券商/汇率 API、移动端细节和跨设备冲突解决均待确认。
