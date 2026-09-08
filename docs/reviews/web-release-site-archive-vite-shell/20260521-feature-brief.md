# Feature Brief — web-release-site-archive-vite-shell

| 字段 | 值 |
|---|---|
| Feature Slug | `web-release-site-archive-vite-shell` |
| 创建日期 | 2026-05-21 |
| 作者 | Codex (`feature-plan` inline) |
| Step 0 QA Gate | PASS |
| 输出状态 | `READY_FOR_DISCOVERY` |
| Source | `docs/reviews/web-release-site-archive-vite-shell/20260521-roadmap-seed.md` |
| 关联文档 | `docs/adr/0006-web-face-hybrid-reuse-boundary.md`、`docs/PLUGIN_MAP.md`、`docs/planning/sub-prds/web/PRD.md`、`docs/planning/sub-prds/web/dev-plan.md`、`docs/workflow/roadmap/web-ticktick-parity.md` |

---

## Structured Brief

### Problem / Motivation

当前 `apps/web` 仍是 Next.js 16 的 release-site / RC shell，内部同时承载 marketing 页面、静态 `/console` mock、部分安全说明与 Supabase proof-of-concept 资产。这与 Web roadmap 的目标态冲突:后续浏览器产品面需要一个薄宿主的 Vite SPA `@repo/web`，而不是继续把旧 RC shell 当成产品真相源。

### Desired Outcome

明确并冻结一个可实施的边界:

- `apps/web` 成为新的 Vite SPA Web Console host
- 旧 Next.js shell 被清晰归档为 release-site/reference 边界
- 旧 marketing/security 资产被保留，但不再冒充未来 `/app/*` 产品宿主
- Turborepo / package scripts / typecheck/build/dev 入口为后续 Web rows 准备好

### Scope

- 规划 `apps/web` 从 Next.js 迁移到 Vite SPA 的宿主骨架边界
- 规划旧 `apps/web` 内容的 archive / rename 方案
- 冻结新宿主允许承载的内容: routing、providers、route guards、service worker hooks、host injection assembly
- 明确哪些现有资产保留为 reference，哪些必须移出未来产品宿主
- 输出后续 build phase 需要触达的 workspace / turbo / script 范围

### Non-goals

- 本轮不实现 Vite scaffold、路由、provider、service worker 或 archive 搬迁
- 不在本 feature 中实现 auth/device/session、sync driver、Console modules 或真实 `/app/*` 页面逻辑
- 不改 `apps/docs`、desktop host、Tauri backend、plugin runtime 代码
- 不决定后续业务模块的 browser-ready 细节

### Constraints

- 目标形态遵循 Web PRD: `apps/web` 为 Vite SPA，包名 `@repo/web`
- 宿主壳必须保持 thin host: routing、providers、service worker hooks、host injection assembly；页面组件不承载业务逻辑
- 必须遵守 `ADR-0006`:允许 Web 专属 host shell / view layer，但共享契约与 Console PRD 行为真理源不变
- 不能破坏 `apps/docs` 或 desktop 脚本
- 必须保留旧 marketing/security 资产作为 reference，而不是直接删除

### Acceptance Criteria

1. 规划文档明确 `apps/web` 的目标边界、archive 方案、以及推荐目录迁移方式。
2. 规划文档明确新宿主最小文件骨架、workspace scripts、Turbo task 调整点与后续 `/app/*` route-guard 挂载口。
3. 规划文档明确哪些现有 Next.js 资产保留为 release-site/reference，哪些不再属于产品真相源。
4. `packages/web-release-site-archive-vite-shell/docs/{design,api,test,dev_log}.md` 齐备，且 `dev_log.md` 状态为 `NEEDS_REVIEW`。

### Open Questions

1. 旧 Next.js shell 的 archive 最终目录应为 `apps/release-site/` 还是其他近义路径?
2. 现有 `apps/web/supabase/` proof 资产是随 archive 一并迁移，还是拆到更独立的 reference 区?
3. 后续 `web-security-csp-sentry` row 是否需要重新接管一部分当前 security 文档的正式归宿?

### Planner Handoff

- 推荐方向: `apps/web` 就地成为新 `@repo/web` Vite SPA，现有 Next.js shell 整体迁移到显式 `release-site` archive 边界。
- 关键评审点: archive 路径命名、Turbo outputs/script 兼容性、reference 资产清单、以及 thin-host 边界是否足够清晰。
- 依赖前提: `ADR-0006` 已接受，`docs/PLUGIN_MAP.md` 已冻结当前 Web planning contract。
