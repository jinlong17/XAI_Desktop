# Manual Browser Smoke Checklist — XAI Admin Console (row #6, AC-4)

> Human-runnable cross-vendor smoke checklist for the admin surface (`apps/admin`).
> Satisfies the roadmap row-#6 "Browser smoke" / "Verify Cross-vendor" gate.
> **This file is the artifact; real PASS/FAIL + browser-version rows are filled at
> `feature-verify` / on real hardware. A blank checklist is NOT evidence.**
>
> Scope: the 10 ported prototype pages + the row-#6 error-boundary fallback. Auth
> posture is `mock-authenticated` (design.md assumption #3) — to exercise the pages,
> run with `VITE_ADMIN_MOCK_CLAIM=true` so the fail-closed guard admits the session.
> Items marked **[auto]** already have automated TT-* coverage (rows #1/#4 + row-#6
> observability tests) and need only a confirming glance; **[manual]** items require
> human execution and are the real cross-vendor value of this checklist.

## How to run

```bash
# From repo root — serve the admin surface in dev (mock-authenticated):
VITE_ADMIN_MOCK_CLAIM=true pnpm --filter @repo/admin dev   # http://localhost:4200

# OR smoke the production build locally (closest to the deployed artifact):
pnpm --filter @repo/admin build
pnpm --filter @repo/admin preview                          # http://localhost:4201
```

Run the full pass in **each** target browser. Record the exact build/version string.

## Browser matrix (fill the version actually tested)

| Vendor | Min target | Version tested | Date | Tester |
|---|---|---|---|---|
| Chromium (Chrome/Edge) | latest stable | _______ | ____ | ____ |
| Firefox | latest stable | _______ | ____ | ____ |
| WebKit (Safari) | latest stable | _______ | ____ | ____ |

Mobile / responsive pass (≤ 414px width, e.g. iPhone-class viewport): run at least once.

| Form factor | Viewport | Version tested | Date | Tester |
|---|---|---|---|---|
| Mobile / responsive | ≤ 414px | _______ | ____ | ____ |

---

## Per-page scenarios

> Fill `PASS` / `FAIL` (+ note) per browser column. `[auto]` rows cross-link the
> automated test that already asserts the behaviour at the unit/component level —
> the manual check confirms it renders/behaves the same in a real browser.

### 1. Dashboard (`DashboardPage.tsx`)

| # | Scenario | Auto cover | Chromium | Firefox | WebKit | Mobile |
|---|---|---|---|---|---|---|
| 1.1 | Page mounts; multi-tab (概览/增长/功能效率/AI 成本/营收) switch without error | [auto] `pages.smoke.test.tsx` | | | | |
| 1.2 | Operations queue (异常登录·工单·催款·超额组织·高成本用户·沉睡管理员) renders rows | [manual] | | | | |
| 1.3 | KPI sparklines + 活跃趋势/Provider 分布 charts render (no broken SVG) | [manual] | | | | |
| 1.4 | 功能使用排行 + 使用时段热力图 render | [manual] | | | | |

### 2. Users (`UsersPage.tsx`)

| # | Scenario | Auto cover | Chromium | Firefox | WebKit | Mobile |
|---|---|---|---|---|---|---|
| 2.1 | Page mounts; dense user table scrolls + sorts | [auto] `wiring.users-orgs-billing.test.tsx` (seam-backed) | | | | |
| 2.2 | Saved-view segmented control (全部/活跃/超额/高成本/30天未登录) filters the table | [manual] | | | | |
| 2.3 | Filter chips add/remove and narrow results | [manual] | | | | |
| 2.4 | User-detail **drawer ↔ full-page (A-B)** opens, traps focus, closes on Esc | [manual] | | | | |
| 2.5 | Bulk-select + bulk action reaches the (no-op) command adapter (no real mutation) | [auto] `wiring.users-orgs-billing.test.tsx` | | | | |

### 3. Orgs / Spaces (`OrgsPage.tsx`)

| # | Scenario | Auto cover | Chromium | Firefox | WebKit | Mobile |
|---|---|---|---|---|---|---|
| 3.1 | Page mounts; seats used/cap render (over-cap red bar shows when exceeded) | [auto] `pages.smoke.test.tsx` | | | | |
| 3.2 | Org-detail drawer (概览/成员/用量/账单 tabs) opens + traps focus | [manual] | | | | |
| 3.3 | Transfer-ownership **type-to-confirm** modal: confirm disabled until exact word typed | [auto] `ConfirmModal.test.tsx` | | | | |

### 4. Features (`FeaturesPage.tsx`)

| # | Scenario | Auto cover | Chromium | Firefox | WebKit | Mobile |
|---|---|---|---|---|---|---|
| 4.1 | Page mounts; global toggles (上线/灰度/下线) render | [auto] `wiring.feature-ai-provider.test.tsx` | | | | |
| 4.2 | Free·Pro·Team tiered quota rows render | [manual] | | | | |
| 4.3 | Feature drawer (灰度 slider + cohort rules + dependencies + quota stepper) opens | [manual] | | | | |

### 5. AI Usage & Quota (`AiUsagePage.tsx`)

| # | Scenario | Auto cover | Chromium | Firefox | WebKit | Mobile |
|---|---|---|---|---|---|---|
| 5.1 | Page mounts; plan default-quota policy renders | [auto] `pages.smoke.test.tsx` | | | | |
| 5.2 | Top-consumer list (near-limit / over-quota warnings) renders | [manual] | | | | |

### 6. Providers (`ProvidersPage.tsx`)

| # | Scenario | Auto cover | Chromium | Firefox | WebKit | Mobile |
|---|---|---|---|---|---|---|
| 6.1 | Page mounts; provider cards render **status/handle only** (NO key material visible) | [auto] `no-provider-key.test.ts` + `wiring.feature-ai-provider.test.tsx` | | | | |
| 6.2 | Model × plan permission matrix renders | [manual] | | | | |
| 6.3 | Plan-tier routing policy (default/fallback model, monthly cost cap, request cap, overage) renders | [manual] | | | | |

### 7. Roles & Permissions (`RolesPage.tsx`)

| # | Scenario | Auto cover | Chromium | Firefox | WebKit | Mobile |
|---|---|---|---|---|---|---|
| 7.1 | Page mounts; role cards + RBAC permission matrix render | [auto] `rbac.test.ts` (predicate) + `pages.smoke.test.tsx` | | | | |
| 7.2 | Matrix is read-as-advisory (no destructive action without confirm) | [manual] | | | | |

### 8. Billing / Subscription (`BillingPage.tsx`)

| # | Scenario | Auto cover | Chromium | Firefox | WebKit | Mobile |
|---|---|---|---|---|---|---|
| 8.1 | Page mounts; MRR/ARPPU + plan distribution render | [auto] `wiring.users-orgs-billing.test.tsx` | | | | |
| 8.2 | Recent transactions table renders | [manual] | | | | |

### 9. Audit Log (`AuditPage.tsx`)

| # | Scenario | Auto cover | Chromium | Firefox | WebKit | Mobile |
|---|---|---|---|---|---|---|
| 9.1 | Page mounts; type + time-range (今天/7天/30天) filters narrow the log | [auto] `pages.smoke.test.tsx` + `opsQueueReadModel.test.ts` | | | | |
| 9.2 | Log is read-only (no edit/delete affordance — append-only audit) | [manual] | | | | |

### 10. System Settings (`SettingsPage.tsx`)

| # | Scenario | Auto cover | Chromium | Firefox | WebKit | Mobile |
|---|---|---|---|---|---|---|
| 10.1 | Page mounts; org info + security (强制 2FA / 会话超时 / IP 白名单 / SSO) render | [auto] `pages.smoke.test.tsx` | | | | |
| 10.2 | Notification webhook field renders + accepts input (no real network on submit) | [manual] | | | | |

---

## Cross-cutting scenarios

### C1 — Fail-closed guard (slice #1 core boundary)

| # | Scenario | Auto cover | Chromium | Firefox | WebKit | Mobile |
|---|---|---|---|---|---|---|
| C1.1 | With `VITE_ADMIN_MOCK_CLAIM` unset (or no session), the surface renders the **forbidden fallback**, not admin content | [auto] `AdminRouteGate.test.tsx` | | | | |

### C2 — Error boundary fallback (row #6 P2, AC-3)

| # | Scenario | Auto cover | Chromium | Firefox | WebKit | Mobile |
|---|---|---|---|---|---|---|
| C2.1 | A forced render error inside the admin tree shows the **`.admin-error-fallback`** panel ("控制台遇到错误"), the app does not white-screen | [auto] `AdminErrorBoundary.test.tsx` (TT-ERRORBOUNDARY-CATCH/DEFAULT-SINK) | | | | |
| C2.2 | The fallback is **CSP-clean** (no console CSP violation; no inline style/script blocked) | [auto] `AdminErrorBoundary.test.tsx` (TT-ERRORBOUNDARY-FALLBACK-CLEAN) + `csp.test.ts` | | | | |
| C2.3 | DevTools console shows **no network request to any telemetry/ingest host** when the error fires (no-op sink) | [auto] `telemetry.test.ts` (TT-TELEMETRY-NOOP) + `no-telemetry-secret.test.ts` | | | | |

> To force C2.1 in a real browser without shipping a bug: temporarily throw inside a
> page component in a local build (revert before commit), or use React DevTools to
> trigger a render error. The automated tests already prove the boundary contract;
> C2 is the cross-vendor visual confirmation.

### C3 — CSP / security headers (served by `_headers`)

| # | Scenario | Auto cover | Chromium | Firefox | WebKit | Mobile |
|---|---|---|---|---|---|---|
| C3.1 | Response carries the tight CSP (`default-src 'self'`, `connect-src 'self'`, `frame-ancestors 'none'`) — check DevTools → Network → response headers on the deployed `*.pages.dev` | [auto] `csp.test.ts` (source-text) | | | | |
| C3.2 | No CSP violation reported in the console during a normal page tour | [manual] | | | | |
| C3.3 | **No request to `*.ingest.sentry.io`** or any external origin (admin must NOT inherit web's ingest host) | [auto] `csp.test.ts` (TT-CSP-NO-WILDCARD) + `no-telemetry-secret.test.ts` | | | | |

### C4 — Accessibility / keyboard (focus traps)

| # | Scenario | Auto cover | Chromium | Firefox | WebKit | Mobile |
|---|---|---|---|---|---|---|
| C4.1 | Tab key cycles within an open modal/drawer and does not escape to the page behind | [manual] | | | | |
| C4.2 | Esc closes the top-most modal/drawer and restores focus to the trigger | [manual] | | | | |

---

## Sign-off

- [ ] All 10 pages mounted without console error in **every** browser column.
- [ ] All `[manual]` rows have a recorded PASS/FAIL + note.
- [ ] Error-boundary fallback (C2) confirmed cross-vendor.
- [ ] No CSP violation and **no telemetry/ingest network** observed (C2.3 / C3.3).
- [ ] Mobile/responsive pass completed at ≤ 414px.

**Result:** ____ PASS / ____ FAIL  ·  **Signed:** __________  ·  **Date:** __________

> A FAIL on any row blocks `READY_TO_SHIP` until triaged. Cheaply-automatable failures
> should be promoted into a new TT-* test following the existing guard patterns.
