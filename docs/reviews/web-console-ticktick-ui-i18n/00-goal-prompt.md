# Goal Prompt — web-console-ticktick-ui-i18n

## Pre-flight before pasting the prompt

Author: Claude (W0.* drift cleanup session, 2026-05-23)
Route: `Goal Prompt` -> `Claude`
Workflow entry: `/xai-feature-full-loop`
Suggested slug: `web-console-ticktick-ui-i18n`
Recommended working branch: `dev` (current — do NOT cut a long-lived `web-*` branch; V2 phase commits land on dev. If PR isolation is needed at ship time, squash or cherry-pick then.)

Environment notes captured 2026-05-23:

- `codex` CLI is NOT installed on this machine (`which codex` -> not found).
  Project-side `.codex/agents/` (25 toml) and `.codex/config.toml` are ready,
  but the `Verify Cross-vendor: yes` step needs a running Codex CLI as the
  second vendor. Three resolutions:
    (a) Install `codex` CLI before running this feature.
    (b) Change the prompt below to `Verify Cross-vendor: no`.
    (c) Keep `yes`; verify will report cross-vendor as a deferred gate.
- Automation Mode `A-Claude` works without Codex (Claude is the primary
  executor); only the cross-vendor verify step needs Codex.

Reference docs that the agent must read first (already in repo):

- `CLAUDE.md`, `AGENTS.md`
- `docs/SYSTEM_ARCHITECTURE.md` (12 coding red lines)
- `docs/PLUGIN_MAP.md`
- `docs/workflow/project/usage-guide.md`
- `docs/adr/0006-web-face-hybrid-reuse-boundary.md`
- `docs/planning/sub-prds/web/PRD.md` + `docs/planning/sub-prds/web/dev-plan.md`
- `docs/workflow/roadmap/web-ticktick-parity.md` (10/25 SHIPPED at 2026-05-22)

## Paste this into a fresh Claude session

```text
/xai-feature-full-loop

Requirement:
The XAI Web Console currently feels sparse and stylistically immature compared
with TickTick / DIDA. Deliver a TickTick-inspired Web Console visual + IA
refresh with practical information density, polished spacing, responsive
behavior, and first-class language selection for zh-CN and en. Use the
provided TickTick screenshots as product reference: mint icon rail, calm
task sidebar, dense list/kanban task boards, Habit split list/detail,
Pomodoro timer + record panel, Calendar month grid, Eisenhower matrix, and
Settings/account language controls.

Suggested Feature Slug: web-console-ticktick-ui-i18n
Automation Mode: A-Claude
Verify Cross-vendor: yes

Context:
- Repo (correct path): /Users/jinlong/Desktop/jinlong_project/XAI_Desktop
- Current branch: dev (do NOT branch further; trunk-based via Workflow V2).
- Read first, in order:
  - CLAUDE.md
  - AGENTS.md
  - docs/SYSTEM_ARCHITECTURE.md (12 coding red lines)
  - docs/PLUGIN_MAP.md
  - docs/workflow/project/usage-guide.md
  - docs/adr/0006-web-face-hybrid-reuse-boundary.md
  - docs/planning/sub-prds/web/PRD.md and docs/planning/sub-prds/web/dev-plan.md
  - docs/workflow/roadmap/web-ticktick-parity.md (10/25 SHIPPED at 2026-05-22)
- Already-shipped anchors to reuse, do not rebuild:
  - packages/web-release-site-archive-vite-shell (Vite SPA host shell)
  - packages/web-console-host-router (host router + slot contract)
  - packages/web-auth-device-session (PKCE + X-Device-Id)
  - packages/web-browser-e2e-crypto-runtime
  - packages/web-encrypted-indexeddb-cache
  - packages/web-todo-first-slice (W7 baseline)
  - packages/web-security-csp-sentry (W11, just shipped on dev today)
- Run apps/web locally via `pnpm --filter web dev` (Vite dev server, port
  printed at startup — typically http://localhost:5173). Do NOT open the
  Tauri desktop dev server (port 1420). This feature is browser-only.

Scope (in / out):

In scope:
- Visual + IA refresh of apps/web Console product surface only:
  - Icon rail, primary sidebar, task list, kanban, Habit list/detail,
    Pomodoro timer panel, Calendar month grid, Eisenhower matrix,
    Settings/account shell.
  - Language selector + zh-CN / en locale resources for visible navigation,
    module headers, controls, empty states, settings labels.
  - Typography scale, spacing tokens, color tokens, density controls only
    if they materially improve TickTick-like usability.
  - Responsive behavior down to ~768px without text overlap (mobile-first
    polish is OUT of scope and belongs to row #18 web-responsive-mobile).
- Mock-first data sources: this feature must NOT block on row #8
  web-sync-blob-driver (W4 PENDING) or row #12 web-realtime-metadata-sync
  (W8 PENDING). Use plugin-local mocks / fixtures via Repository<T> in
  read-only mode where real wiring is not yet shipped.

Out of scope (leave to existing roadmap rows):
- Real Sync blob driver / encrypted outbox / 3-way conflict UI (rows #8,
  #13).
- Real Realtime metadata sync (row #12).
- Browser keyboard shortcut system + global Cmd+K search (row #16
  web-search-keyboard-theme — UI can stub a search input, do not wire it).
- Statistics views (row #17), full responsive/mobile (row #18), device
  management revoke flows (row #19).
- Export/delete/privacy pages, Service Worker / PWA install (rows #21,
  #22).
- Landing/auth/legal SEO pages (row #23 web-i18n-seo-landing) — i18n in
  THIS row is Console-only, not marketing.
- Browser CI / Playwright matrix (row #24).
- Desktop console (plugin-console) — already SHIPPED; do not modify it.

Architectural guardrails:
- Follow ADR-0006: apps/web owns browser shell / routing / composition
  only. Business UI belongs in owning plugin packages with browser-safe
  entrypoints (or new browser-only view layer packages if the owning
  plugin still depends on Tauri).
- @repo/core / @repo/core-data contracts and Sync blob protocol are
  authoritative — do NOT invent new data contracts or bypass
  Repository<T>.
- Console PRD IA (docs/planning/sub-prds/console/PRD.md) is the UI truth
  source; any browser-only deviation must be documented in this feature's
  design.md under a "Console-PRD-deviations" section.
- @repo/ui generic primitives are fine to extend; new business components
  live inside the owning plugin, not in @repo/ui.
- No direct Tauri imports in browser-rendered code (`@tauri-apps/*`,
  `tauri://`, `__TAURI__`). Verify with a build-output grep gate.
- Mock-first: any plugin status In-Dev in docs/PLUGIN_MAP.md must be
  used via mock data, not direct hard dependency.

Manifest reconciliation:
- This feature is NEW and not yet in docs/workflow/roadmap/web-ticktick-parity.md.
- During feature-plan, propose adding a new row to the manifest immediately
  after the SHIPPED block (suggest slug + depends_on + wave). Do NOT modify
  existing wave rows #14, #15, #16, #18, #23 to absorb this work — they
  retain their separate roadmap scope and unblock later.
- During ship, update the manifest row to SHIPPED with the same evidence
  format used for prior SHIPPED rows (date + commit chain + brief).

Design acceptance:
- The first usable Web Console screen feels like a real TickTick-style
  productivity console, not a sparse scaffold.
- Tasks, Habit, Pomodoro, Calendar, Matrix, Settings/Account, and language
  switching share coherent IA even where some data is local/mock.
- Layout works on desktop (>=1280px) and narrower (~768px) without text
  overlap, modal clipping, or chrome jumping.
- Compact controls, stable dimensions, realistic sample states, dense but
  calm visual hierarchy; avoid one-note palettes, oversized cards,
  decorative orbs, placeholder-dominated screens.
- zh-CN and en copy complete for every visible navigation, module header,
  control, empty state, and settings language label. Missing keys must
  fall back to zh-CN per Console PRD language rule.

Verification:
- Scoped gates: typecheck / lint / test / build for every touched package
  and apps/web.
- Run `pnpm --filter web dev`, open the printed http://localhost:<port>
  URL in a real browser (not just curl), screenshot:
  - Each module landing screen at ~1440px width.
  - The same module at ~768px width.
  - Language switch zh-CN -> en applied to the navigation rail and
    Settings panel.
- Cross-vendor verify (yes): the second-vendor runner must independently
  open the dev server and confirm screenshots match the produced assets.
  If `codex` CLI is unavailable, record cross-vendor as a deferred gate
  in this row's dev_log and proceed (do not silently skip).
- Browser-safety gate: after `pnpm --filter web build`, grep the built
  output (dist/ or equivalent) for `@tauri-apps`, `tauri://`, `__TAURI__`
  and fail if any matches.
- If real backend wiring is unavailable (Sync blob, Realtime, hosted
  Supabase), document the deferred path honestly in
  docs/workflow/roadmap/sync-v1.deferred-gates.md or this row's
  feature dev_log. Do NOT silently mock through a gate.

Expected output:
- Follow Workflow V2 through plan -> review -> build (one phase at a
  time) -> verify -> ship.
- Write/update the feature docs four-pack under the owning location:
  - If you choose to host this under apps/web view-layer packages, put
    docs under that package's docs/.
  - design.md must include the "Console-PRD-deviations" section.
- Update dev_log.md state truthfully at every transition. Maintain the
  Status Panel + Suggested Next + Work Log per the V2 contract.
- During ship: also update docs/workflow/roadmap/web-ticktick-parity.md
  (insert the new row), docs/PLUGIN_MAP.md (if any plugin status
  changes), and any deferred-gates row created during verify.
- End with the required `## Handoff` block + `### Next Step` section
  only, preserving the project handoff format.
```

## TickTick screenshot references

When pasting this prompt into a new session, attach the TickTick screenshots
(mint icon rail, sidebar, list/kanban, Habit, Pomodoro, Calendar, Matrix,
Settings/account language) as image inputs so the agent can ground the
design acceptance criteria against real reference frames.

## Post-paste expectations

1. The agent reads CLAUDE.md, AGENTS.md, and the docs listed in `Context`.
2. The agent runs feature-plan, producing `docs/reviews/web-console-ticktick-ui-i18n/`
   discovery review + brief + plan, plus the feature docs four-pack under
   the chosen package location.
3. The agent stops at the review gate; the user reviews the plan and either
   approves or requests revisions.
4. Once approved, the agent runs feature-build phase by phase, committing
   to dev with `feat/fix/docs(<slug>): <phase>` style messages.
5. feature-verify produces the verification report; on READY_TO_SHIP, the
   user can run the `ship` agent to push and update the manifest.
