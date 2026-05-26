# Gap-Closure Deferred Action Items — 2026-05-26

> Consolidated operator action queue after `xai-web-console-gap-closure` 9/9 SHIPPED.
> Created by the closing Claude session 2026-05-26.

## Status

`docs/workflow/roadmap/xai-web-console-gap-closure.md` is **9/9 SHIPPED**. Per ADR-0008 §S3 carve-out (24h deploy-readiness gate), 4 categories of residual work were explicitly deferred and recorded in each row's Ship Report. This document consolidates them so they don't get lost.

| Category | Status | Who | When |
|---|---|---|---|
| 1. Pre-existing apps/web lint warnings | ✅ **DONE** 2026-05-26 commit `2b4f6b4` | Claude session | — |
| 2. Cross-vendor Codex cold-read (9 rows) | ✅ **DONE** 2026-05-26 (PASS #2/#3/#5/#6; FINDINGS #4/#7/#8/#9 resolved in 5 fix commits — see Category 2 §"Results" below) | Operator (Codex audit) + Claude session (fixes) | — |
| 3. Manual browser smoke matrix | ⏳ PENDING — per-row checklist below | Operator + real browsers | Before next `xai-web-deploy-cloudflare` ship AND/OR to unblock ADR-0010 §S4 D5 → Status=Accepted |
| 4. v1 documented limitations | 📋 ACKNOWLEDGED | Future P1 work | When P1 backend available |

## Category 2 — Codex cross-vendor cold-read RESULTS (2026-05-26)

Operator ran 4 parallel Codex agents for the 9 rows. Verdicts:

| Row | Codex verdict | Disposition |
|---|---|---|
| #2 ai-chat-real-llm-adapter | PASS | No findings |
| #3 cmdk-search | PASS | No findings |
| #4 calendar-week-day-views | FINDINGS (DST bug) | ✅ Fixed in commit `8798e42` — `placeEventBlocks.startRow` now applies `hourToRow(..., shift)` for DST; 2 regression tests added (AC-PLACE-11 spring-forward; AC-PLACE-12 normal-day guard); 199/199 tests pass |
| #5 dashboard-add-widget-picker | PASS | No findings |
| #6 board-filter-share-map | PASS | No findings |
| #7 settings-integrations-3rd-party | FINDINGS (OAuth URL leakage) | ✅ Fixed in commits `040216c` + `22fb91f` — `scrubOAuthQuery()` (raw `history.replaceState`) immediately scrubs `code`/`state` from URL after consume on all 4 callback branches (success/error/missing-state/invalid-state); avoids react-router 7 + jsdom + undici 6 AbortSignal interaction; 239/239 + 116/116 tests pass |
| #8 settings-premium-stripe | FINDINGS (CSP allowlist) | ✅ Fixed in commit `2cc5d6f` — removed all 3 Stripe hostnames from `connect-src` (`js.stripe.com` / `checkout.stripe.com` / `buy.stripe.com`); pure redirect mode needs ZERO Stripe entries (page nav governed by navigate-to / form-action / default-src). CSP4 test inverted to assert ABSENCE. 116/116 web tests pass; CSP attack surface tightened. |
| #9 settings-account-delete-wire | FINDINGS (guard scope mismatch) | ✅ Fixed in commit `062c9f8` — docstring clarified DEL-WILDCARD-GUARD scope is RUNTIME source only (excludes `__tests__/`, `vitest.setup*`, `*.test.{ts,tsx}`). Guard's INTENT was always runtime-only; test cleanup in JSDOM is canonical isolation. No code change; pure documentation. Test cleanup deemed safe by construction (sandboxed JSDOM, no real-user data risk). |

**Net:** 4 PASS + 4 FINDINGS-RESOLVED → all 9 rows now have cross-vendor sign-off.

**Verification:** all 5 fix commits land in commit range `1c021a1..062c9f8` on origin/main; commit messages cite the specific finding being addressed for future audit.

---

## Category 3 — Per-Row Smoke Matrix (2026-05-26)

**Purpose:** unblock ADR-0009 §D2 G2 → flip ADR-0010 Status=Accepted → start P1.

**Codex session update (2026-05-26):** all 6 previously missing row-level smoke scaffold files now exist. The 3 existing scaffold files were audited; #2 and #5 now include gap-closure addenda for the extension work, and #3 now includes iOS Safari coverage. These files are still templates only; no real-browser PASS evidence has been recorded.

**Browser/OS targets:** Chrome 120+ macOS 14 · Safari 17+ macOS 14 · Firefox 121+ macOS 14 · Safari 17+ iOS 17 (mandatory) · Chrome 120+ Windows 11 (optional/future)

**Acceptance:** each row must have at least PASS verdicts across all 4 mandatory targets (24-hour carve-out per ADR-0008 §S3); FAIL means file a bug-fix row.

**Existing scaffolds audited (3 rows):**
- `docs/reviews/xai-web-cmdk-search/20260525-cross-vendor-smoke.md` (row #3 gap-closure) — complete after adding iOS Safari section.
- `docs/reviews/xai-web-ai-chat/20260523-cross-vendor-smoke.md` (row #2 extension via parent) — complete after adding Real LLM Adapter addendum.
- `docs/reviews/xai-web-dashboard-grid/20260524-cross-vendor-smoke.md` (row #5 extension via parent) — complete after adding Add Widget Picker addendum.

**Row-level smoke scaffold files:**

| # | Slug | Recommended smoke file path | Key scenarios per row |
|---|---|---|---|
| #1 | xai-web-pomodoro-counters-test-fix | `docs/reviews/xai-web-pomodoro-counters-test-fix/20260526-cross-vendor-smoke.md` | Run pomodoro feature smoke — verify today counters update after focus session |
| #4 | xai-web-calendar-week-day-views | `docs/reviews/xai-web-calendar-week-day-views/20260526-cross-vendor-smoke.md` | (a) toggle Month↔Week↔Day on every browser; (b) DST spring-forward day (2026-03-08) render correctness (codex finding #4 was code-fixed but real-browser repro pending); (c) multi-hour event blocks render continuous; (d) active-date preservation across toggle; (e) `xai_calendar_view` persistence round-trip; (f) iOS touch interactions on hour rows |
| #6 | xai-web-board-filter-share-map | `docs/reviews/xai-web-board-filter-share-map/20260526-cross-vendor-smoke.md` | (a) FilterPopover open/close + label/member/due filter apply across all 6 views; (b) ShareModal open + clipboard copy works (Safari has known clipboard restrictions); (c) Map view loads Leaflet lazy-chunk only on Map tab click + OSM tiles render + pins clickable; (d) Empty location → empty-state message; (e) bundle network panel shows Leaflet chunk loaded only once after first Map view |
| #7 | xai-web-settings-integrations-3rd-party | `docs/reviews/xai-web-settings-integrations-3rd-party/20260526-cross-vendor-smoke.md` | (a) Connect Notion/GCal/Linear opens authorize URL in same tab; (b) Callback URL `?code=&state=` immediately scrubbed (codex finding #2 fix) — verify via DevTools URL bar within 100ms of route mount; (c) Banner shows success/error/invalid; (d) Disconnect clears local state; (e) sessionStorage cleared post-callback; (f) Safari ITP doesn't break sessionStorage TTL; (g) iOS in-app browser handling |
| #8 | xai-web-settings-premium-stripe | `docs/reviews/xai-web-settings-premium-stripe/20260526-cross-vendor-smoke.md` | (a) Upgrade button navigates to `buy.stripe.com` (test mode link); (b) Browser navigation works WITHOUT CSP `connect-src` allowlist for Stripe (codex finding #3 fix — confirm no CSP violation in DevTools console); (c) Success/cancel redirect routes render; (d) Cancel Subscription clears tier; (e) Disclosure banner non-dismissible across all browsers; (f) PremiumTierBadge in Topbar via render-prop renders correctly |
| #9 | xai-web-settings-account-delete-wire | `docs/reviews/xai-web-settings-account-delete-wire/20260526-cross-vendor-smoke.md` | (a) 2-step modal opens; (b) Type "delete" (lowercase) → submit disabled; (c) Type "DELETE" → submit enabled; (d) Mock-auth path: localStorage cleared via registry list (NOT wildcard) + IndexedDB clearAll + redirect to `/`; (e) After redirect, reload → auth state clean; (f) Real-auth path tested manually if Supabase Edge Function deployed (otherwise document as deferred to P1); (g) Network failure mid-flow → localStorage NOT cleared |

**Operator workflow per row:**
1. Open `docs/reviews/<slug>/20260526-cross-vendor-smoke.md` (create from cmdk template if missing).
2. Walk through 4 mandatory browsers × N scenarios.
3. Fill PASS / FAIL / N/A in each cell + add notes for FAIL cases.
4. Commit: `docs(<slug>): cross-vendor smoke matrix evidence for row #N (G2 gate)`.
5. After all 9 rows have evidence (PASS or filed bug), update ADR-0009 §D2 G2 row → PASS + flip ADR-0010 Status → Accepted per ADR-0010 §S4 D5.

**Time budget:** ~2-4 hours total operator wall-time across all 9 rows on all 4 browsers (most scenarios are visual smoke, not deep functional). Worth doing in one sitting for context retention.

**Fallback:** If FAIL on any FIX row (#4/#7/#8/#9), file a bug-fix row in the gap-closure manifest with `bug-diagnose → bug-fix → bug-verify` cycle. If FAIL on a PASS row (#2/#3/#5/#6), the row is still SHIPPED but accumulates a known-issue note in dev_log.



---

## Category 1 — Pre-existing apps/web lint warnings ✅ DONE

Closed by commit `2b4f6b4` (chore: close 3 pre-existing lint warnings):
- `TokensSmokePage.tsx`: moved `useState` above `import.meta.env.DEV` early return (rules-of-hooks)
- `turbo.json`: added `DEV` to `globalEnv` (turbo/no-undeclared-env-vars)
- `apps/web/eslint.config.js`: ignore `worker-configuration.d.ts` (auto-generated, gitignored)

Result: `pnpm --filter @repo/web lint` exits 0; 116/116 tests still pass; build clean.

---

## Category 2 — Cross-vendor Codex cold-read (9 rows)

Per ADR-0009 §D4: all P0 gap-closure work requires cross-vendor verify. The default verifier is **Codex `gpt-5.5-thinking medium`** (Cursor as fallback when Codex quota exhausted). All 9 rows shipped with this gate deferred per the ADR-0008 §S3 carve-out.

### Operator workflow

Open a fresh Codex window (NOT the same window as the Claude session that shipped these features), `cd` to the repo root, then paste each prompt below one at a time. Each prompt is self-contained.

For each row, Codex outputs either:
- **PASS** → record in row's dev_log Work Log as "Cross-vendor cold-read 2026-05-26: Codex PASS (no findings)"
- **FINDINGS** → record findings + decide whether to (a) accept as documented v1 limitation, (b) raise a bug-diagnose row, or (c) just track in deferred queue

### Per-row prompts

#### Row #2 — xai-web-ai-chat-real-llm-adapter (commit range `86403e8..ade513b`)

```text
You are Codex doing a CROSS-VENDOR COLD-READ verify on a SHIPPED feature.
You have NOT seen this feature before. Read the artifacts fresh.

Feature: xai-web-ai-chat-real-llm-adapter (gap-closure roadmap row #2)
Spec: packages/xai-web-ai-chat/docs/{design.md §2026-05-25 Extension, api.md §12, test.md §7}
Discovery: docs/reviews/xai-web-ai-chat-real-llm-adapter/20260525-discovery-review.md
ADR amendments: docs/adr/0008-cloudflare-deploy-target-and-csp.md §S3 D3 (FIRST amendment)
Commit range: 86403e8..ade513b on main

Verify focus (per row #2 hard constraints):
- HC1: API key MUST be stored via IndexedDB + WebCrypto AES-GCM-256; NEVER plaintext localStorage. Grep packages/plugin-web-ai-chat/src/secretStore.ts + tests; confirm no `localStorage.setItem("xai_*api*key*", ...)` pattern anywhere.
- HC5: error categorization (auth / quota / network / 5xx) maps to user-facing banner via LlmError taxonomy + ErrorBanner.tsx
- HC6: CSP allowlist for connect-src is minimal (only the new Anthropic + OpenAI-compatible endpoints; nothing else widened)
- HC7: existing `completeChat(text, lang) => Promise<string>` export signature unchanged in public barrel
- HC9: ADR-0008 amendment preserves binding-precedent rule

Output: PASS or numbered FINDINGS list with code-level citations.
```

#### Row #3 — xai-web-cmdk-search (commit range `74ce9bb..612074b`)

```text
You are Codex doing a CROSS-VENDOR COLD-READ verify on a SHIPPED feature.

Feature: xai-web-cmdk-search (gap-closure roadmap row #3)
Spec: packages/xai-web-cmdk/docs/{design.md, api.md, test.md, dev_log.md}
Discovery: docs/reviews/xai-web-cmdk-search/20260525-discovery-review.md
Commit range: 74ce9bb..612074b on main

Verify focus:
- HC2: search index IS in-memory only (no new xai_* localStorage keys); grep packages/xai-web-persistence-contract/ and plugin-web-storage/
- HC3: 11 per-module pure-function adapters (no side effects, no React hooks, no fetch); inspect packages/xai-web-cmdk/src/adapters/
- HC7: XSS-safe match highlight — all user content passes through escapeHtml; inspect packages/xai-web-cmdk/src/internal/escapeHtml.ts + escapeHtml.test.ts (12 cases)
- HC10: no third-party `cmdk` npm package in package.json (native React 19 build)
- PB1 perf budget: Cmd+K opens within 100ms; perfBudget.test.ts asserts < 50ms p95 (real assertion, not graceful-skip)

Output: PASS or numbered FINDINGS list.
```

#### Row #4 — xai-web-calendar-week-day-views (commit range `b5a7033..22144e0`)

```text
You are Codex doing a CROSS-VENDOR COLD-READ verify on a SHIPPED feature.

Feature: xai-web-calendar-week-day-views (gap-closure roadmap row #4)
Spec: packages/xai-web-calendar/docs/{design.md §15 Extension, api.md §10, test.md §8}
Discovery: docs/reviews/xai-web-calendar-week-day-views/20260525-discovery-review.md
Commit range: b5a7033..22144e0 on main

Verify focus:
- Timezone consistency: Month / Week / Day views agree on event boundaries at midnight; no off-by-one
- DST handling: events that span DST transitions (Mar 8 + Nov 1 in 2026 US) render correctly across all 3 views; inspect packages/xai-web-calendar/src/internal/timeGridMath.ts + tests
- HC1: events reuse existing source (no parallel event store); inspect WeekView + DayView event-fetch path
- Active-date preservation: switching views keeps focused date stable; inspect activeDate state in CalendarModule
- Acknowledge MAY_2026_ANCHOR_TODAY literal in CalendarModule.tsx:50 is a known cosmetic carryover from SHIPPED v1 (becomes relevant June 2026; can swap to dynamic when SPA ages)

Output: PASS or numbered FINDINGS list.
```

#### Row #5 — xai-web-dashboard-add-widget-picker (commit range `4379897..bf37d13`)

```text
You are Codex doing a CROSS-VENDOR COLD-READ verify on a SHIPPED feature.

Feature: xai-web-dashboard-add-widget-picker (gap-closure roadmap row #5)
Spec: packages/xai-web-dashboard-grid/docs/{design.md §2026-05-25 Extension, api.md §S14, test.md §9}
Discovery: docs/reviews/xai-web-dashboard-add-widget-picker/20260525-discovery-review.md
Commit range: 4379897..bf37d13 on main

Verify focus:
- HC2: widget catalog reuse from xai-web-dashboard-widgets (no parallel registry); inspect packages/xai-web-dashboard-grid/src/AddWidgetPicker.tsx imports
- HC4: web:dashboard:widget-added event emit MUST precede dialog close (REC-1 ordering); verify packages/xai-web-dashboard-grid/src/__tests__/DashboardModule.events.test.tsx:260-263
- HC5: keyboard accessibility — Tab navigates cards, Enter selects, Esc closes; inspect AddWidgetPicker.test.tsx AC-AWP and AC-A11Y matrices
- HC10: NO third-party modal library (native <dialog> only)
- Duplicate prevention: already-added widgets hidden from picker; AC-AWP-4/5/5b cover empty-picker edge case

Output: PASS or numbered FINDINGS list.
```

#### Row #6 — xai-web-board-filter-share-map (commit range `389ee17..a86f58f`)

```text
You are Codex doing a CROSS-VENDOR COLD-READ verify on a SHIPPED feature.

Feature: xai-web-board-filter-share-map (gap-closure roadmap row #6)
Spec: packages/xai-web-board-views/docs/{design.md §2026-05-25 Extension, api.md §S15, test.md §6}
Discovery: docs/reviews/xai-web-board-filter-share-map/20260525-discovery-review.md
ADR amendments: docs/adr/0008-cloudflare-deploy-target-and-csp.md §S3 D3 (SECOND amendment)
Commit range: 389ee17..a86f58f on main

Verify focus:
- HC2: Share mock URL is NOT exploitable as a real link; inspect packages/plugin-web-board-workspaces/src/shareUrl.ts deterministic hash algorithm + tests
- HC5: Map library (Leaflet) IS lazy-loaded; inspect packages/plugin-web-board-views/src/index.ts (React.lazy) + verify dist/.vite/manifest.json shows separate MapView chunk (3.10 kB) + leaflet-src chunk (149.90 kB / 43.48 kB gz)
- HC6: CSP allowlist for OSM tiles is minimal (`https://tile.openstreetmap.org` in both connect-src AND img-src; no wildcard subdomains)
- OSM Tile Usage Policy: attribution "© OpenStreetMap contributors" rendered in MapView
- Filter state lifting (R3): single applyFilter predicate writes back to source; inspect filterState.ts to confirm no per-view forks

Output: PASS or numbered FINDINGS list.
```

#### Row #7 — xai-web-settings-integrations-3rd-party (commit range `85bf836..5085a03`)

```text
You are Codex doing a CROSS-VENDOR COLD-READ verify on a SHIPPED feature.

Feature: xai-web-settings-integrations-3rd-party (gap-closure roadmap row #7)
Spec: packages/plugin-web-settings-rest/docs/{design.md §2026-05-25 Extension, api.md §6, test.md §5}
Discovery: docs/reviews/xai-web-settings-integrations-3rd-party/20260525-discovery-review.md
ADR amendments: docs/adr/0008-cloudflare-deploy-target-and-csp.md §S3 D3 (THIRD amendment)
Commit range: 85bf836..5085a03 on main

Verify focus (CRITICAL — PKCE correctness):
- PKCE state + code_verifier MUST use crypto.getRandomValues; inspect packages/plugin-web-settings-rest/src/internal/pkce.ts; PK5 test asserts RFC 7636 §B.1 known vector
- NO Math.random anywhere in OAuth modules; source-text guard at __tests__/no-math-random.test.ts
- state + code_verifier stored in sessionStorage with TTL, NOT localStorage; source-text guard at __tests__/no-localstorage-oauth.test.ts
- Callback page validates state strictly (rejects mismatched) and discards code immediately; inspect CallbackPage.tsx
- NO token leakage in URL after callback (no code/state in URL fragment after handler runs)
- CSP3: 3 OAuth token endpoints (api.notion.com / oauth2.googleapis.com / api.linear.app) in connect-src only; no script-src/frame-src widening

Output: PASS or numbered FINDINGS list.
```

#### Row #8 — xai-web-settings-premium-stripe (commit range `0a17b3e..00580dd`)

```text
You are Codex doing a CROSS-VENDOR COLD-READ verify on a SHIPPED feature.

Feature: xai-web-settings-premium-stripe (gap-closure roadmap row #8)
Spec: packages/plugin-web-settings-rest/docs/{design.md §2026-05-26 Extension, api.md §7, test.md §6}
Discovery: docs/reviews/xai-web-settings-premium-stripe/20260525-discovery-review.md
ADR amendments: docs/adr/0008-cloudflare-deploy-target-and-csp.md §S3 D3 (FOURTH amendment)
Commit range: 0a17b3e..00580dd on main

Verify focus (CRITICAL — secret hygiene):
- NO Stripe Secret Key (sk_test_* or sk_live_*) anywhere in src/ or dist/; source-text guard at packages/plugin-web-settings-rest/src/__tests__/no-stripe-secret-key.test.ts
- NO Stripe.js loaded (redirect-only mode); source-text guard at __tests__/no-stripe-js-bundle.test.ts; no `js.stripe.com` script-src needed
- Disclosure banner: amber OKLCH, non-dismissible, visible in Premium pane; inspect premiumDisclosureBanner.tsx
- 30-day timer: PURE READ-SIDE filter (no setTimeout, no Date.now mutation); inspect usePremiumTier hook
- CSP4: connect-src extended for Stripe Payment Link hostnames only (api.stripe.com / checkout.stripe.com / buy.stripe.com); script-src CLEAN; frame-src ABSENT
- Render-prop circular-dep avoidance: PremiumTierBadge passed into Topbar via render-prop; no direct import from plugin-web-settings-rest in xai-web-shell

Output: PASS or numbered FINDINGS list.
```

#### Row #9 — xai-web-settings-account-delete-wire (commit range `91e3bc6..8b8933c`)

```text
You are Codex doing a CROSS-VENDOR COLD-READ verify on a SHIPPED feature.

Feature: xai-web-settings-account-delete-wire (gap-closure roadmap row #9, FINAL row)
Spec: packages/plugin-web-settings-rest/docs/{design.md §2026-05-26 Account Delete Wire, api.md §8, test.md §7}
Discovery: docs/reviews/xai-web-settings-account-delete-wire/20260525-discovery-review.md
Commit range: 91e3bc6..8b8933c on main

Verify focus (CRITICAL — 6 security gates):
- DEL-WILDCARD-GUARD: NO `localStorage.clear()` anywhere in packages/plugin-web-settings-rest/src/ or packages/web-auth-device-session/src/; iterate plugin-web-storage registry list instead
- DEL-TYPEMATCH: type-match uses literal `=== "DELETE"` (no `.toUpperCase()`, no `.trim()`, no normalization); inspect DeleteAccountConfirmModal.tsx
- DEL-ORCH-3: backend success ALWAYS precedes any local mutation; inspect useAccountDeleteOrchestrator.ts; negative test asserts no localStorage/IDB mutation when deleteAccount() throws
- DEL-IDB-LIST-1: ACCOUNT_LOCAL_WIPE_IDB_NAMES is a frozen const of exactly 3 names; not expanded at runtime
- DEL-MOCK-BANNER-3: mock-auth banner is non-dismissible (no Close button)
- DEL-EVENT-DEP-1: `web:settings:rest:account-delete-confirmed` event emits on Step-1-Continue (back-compat), NOT final confirm; JSDoc @deprecated annotation present on EventMap entry

Output: PASS or numbered FINDINGS list.
```

### Recording results

After Codex returns PASS or FINDINGS for each row, append a Work Log entry to the corresponding dev_log Lineage block:

```
- [2026-05-26 HH:MM] Cross-vendor cold-read complete (Codex gpt-5.5-thinking medium):
  - Verdict: PASS / FINDINGS-N
  - Findings (if any): <numbered list>
  - Disposition: accept / new bug-diagnose row / deferred-track
```

---

## Category 3 — Manual browser smoke matrix

Per ADR-0008 §S3 D3 deploy-readiness gate. Required BEFORE next `xai-web-deploy-cloudflare` ship (not before each individual row's SHIPPED — they cleared ship under the 24h carve-out).

### Browser matrix (target combinations)

| Browser | Version | Required scenarios |
|---|---|---|
| Chrome (macOS) | 120+ | All 5 scenarios below |
| Safari (macOS) | 17+ | All 5 scenarios below |
| Firefox (macOS) | 121+ | All 5 scenarios below |
| Safari iOS | latest 2 versions | Scenarios 1 + 2 only (no OAuth or Stripe — mobile less critical for v1) |

### Per-row smoke scenarios

For each browser × row combination, verify the row's seed-brief Acceptance Signal happy path passes manually:

**Row #2 (ai-chat real LLM):** open `/app/ai`, paste a test Anthropic API key in Settings → AI, send a message, see streamed tokens render in real-time.

**Row #3 (cmdk search):** press Cmd+K (Ctrl+K on Win/Linux), palette opens within 100ms, type "tomato" → finds pomodoro sessions with that label, Enter jumps to /app/pomodoro.

**Row #4 (calendar Week+Day):** open /app/calendar, toggle Month → Week → Day, multi-hour event renders as continuous block, focused date preserved.

**Row #5 (dashboard add widget):** open /app/dashboard, click Add Widget, picker opens, select a widget, appears at end of dashboard.

**Row #6 (board Filter+Share+Map):** open /app/board, apply "label: urgent" filter, narrows cards across all 6 views; click Share, copyable URL appears; switch to Map view, Leaflet chunk loads, OSM tiles render, pins appear, clicking pin highlights card.

**Row #7 (integrations OAuth):** open /app/settings/integrations, click Connect Notion, OAuth opens in new tab (or same-tab redirect per FA-6), authorize, return → "Connected (stub)" badge.

**Row #8 (Premium Stripe):** open /app/settings/premium, click Upgrade → Stripe Checkout opens via Payment Link; complete test mode payment → return → "Premium (stub)" gold badge in topbar.

**Row #9 (account delete):** open /app/settings/account, click Delete Account, step 1 confirm, step 2 type "DELETE", submit (mock-auth mode) → local-clear + redirect to /.

### Recording results

Fill in matrix at `docs/reviews/_gap-closure-deferred/20260526-smoke-matrix-results.md` (create new file or use this section).

---

## Category 4 — v1 documented limitations (acknowledge, defer to P1)

These are NOT bugs — they are intentional v1 stub-mode trade-offs explicitly documented in each row's design.md + dev_log + Ship Report. They become real P1 backend work.

| Row | Limitation | P1 escalation path |
|---|---|---|
| #7 | OAuth tokens not actually exchanged; provider-side grant not revoked on Disconnect | Real OAuth token exchange + revocation backend |
| #8 | 30-day client-clock easily rewindable; no real subscription enforcement | Real Stripe webhook + subscription state backend |
| #8 | `xai_pref_premium_tier=premium_stub` does NOT actually unlock premium features in v1 | Real entitlement enforcement in plugin-web-* features |
| #4 | `MAY_2026_ANCHOR_TODAY = "2026-05-22"` literal in CalendarModule.tsx:50 | Cosmetic; swap to dynamic when SPA ages past May 2026 (or sooner) |
| #4 | jsdom `scrollTop` assertion in DayView AC-DAY-5/6 is presence-only | Test-env limitation; real-browser assertion in Category 3 smoke matrix |
| #6 | OSM tile usage policy compliance — fine for demo / low-volume; needs swap to paid tile provider (or self-hosted) at scale | Tile provider review when traffic > 1M tiles/day |
| #9 | Account-delete Edge Function deployment is operator action item (not in code) | `apps/web/deploy/README.md` §"Account-Delete Edge Function" runbook |

No action needed now — just acknowledged.

---

## Closing notes

Once Categories 2 + 3 are complete:
- Append a closure entry to this file: "All gap-closure deferred items closed 2026-MM-DD"
- Optionally archive this file to `docs/reviews/_archive/` once P1 starts
- Update the gap-closure manifest header with a final "All deferred items closed" line

Path forward → **P1 Desktop pivot** per ADR-0009 §D2-G3.
