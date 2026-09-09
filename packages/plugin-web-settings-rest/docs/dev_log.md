# Dev Log — plugin-web-settings-rest

> **Doc-split 归并 (2026-06-01)**: 迁移前的原始 FEATURE_DEV/SHIPPED 记录
> （原 `packages/xai-web-settings-rest/docs/dev_log.md`, 11 panes, SHIPPED 2026-05-23
> commit `6b8de35`）已归档为同目录 `./dev_log.origin.md`；原始 design/api/test 由本目录
> canonical 版取代并删除（git 历史可查）。本文件是 going-forward canonical，下方历史
> 叙述（含 PR-2 reconciliation note）保持原样不改写。

---

## Current REL-03 Settings iteration

| Field | Value |
|---|---|
| Workflow | BUGFIX |
| Target | plugin-web-settings-rest · REL-03 account-local compatibility |
| Title | Scoped reset/export/delete and OAuth attempts must not cross accounts |
| Current Phase | BUG_VERIFY |
| Status | FIX_READY_FOR_VERIFY |
| Executor | Codex bug-fix |
| Updated | 2026-09-09 America/Los_Angeles |
| Suggested Next | Parent REL-03 integration and independent bug-verify |
| Automation Mode | A-Codex |
| Verify Cross-vendor | Not performed; Claude OAuth unavailable in parent session |

Implementation verification: 40 files / 266 tests, typecheck, and isolated real-Chromium full-page reload/native IDB recovery PASS. Independent integrated REL-03 verification remains pending. No hosted account deletion was exercised.

Reproduction and strategy: `docs/reviews/web-account-data-isolation/20260909-rel03-diagnosis.md`. Original More reset bypassed the account resolver; deletion removed all registry keys and entire shared databases; OAuth pending records had no owner. Preserve the historical shipped iterations below; this iteration does not replace their evidence.

| Timestamp | Executor | Action | Commits | Next Step |
|---|---|---|---|---|
| 2026-09-09 | Codex bug-fix | Implement captured-scope Settings operations, bound OAuth attempts and durable local deletion recovery; add synthetic account regression coverage | Current scoped commit | Independent REL-03 verify |

## Historical Workflow State — About pane (2026-05-28)

| Field | Value |
|---|---|
| Workflow | BUGFIX |
| Target | plugin-web-settings-rest (primary; surface = `src/panes/aboutPane.tsx`) |
| Title | Audit Top-10 #10 (Set-About-01..04) — About pane 4 links (Changelog / Privacy / Terms / Feedback) render as link-styled affordances with no `href` and no `onClick` (click = nothing happens, deceptive no-op) |
| Current Phase | SHIP |
| Status | SHIPPED |
| Suggested Next | — (workflow complete) |
| Automation Mode | A-Claude |
| Verify Cross-vendor | yes (per dispatch brief; Chrome 120 manual smoke + Safari 17 + Firefox 121 + iOS Safari DEFERRED post-ship per ADR-0008 §S3 24h-evidence carve-out; verified at bug-verify via 242/242 plugin tests + 128/128 web tests + commit/diff cold-read) |
| Authority | ADR-0010 §D4 (BUGFIX in P0 maintenance scope does NOT require P0 carve-out) |
| Executor | claude-sonnet-4-6 (ship) |
| Updated | 2026-05-28 02:00 |
| Branch | web (do NOT touch dev branch — separate machine + worktree per MEMORY.md) |
| Audit Anchor | `docs/reviews/_web-noop-audit/20260527-button-action-inventory.md` §2.12.13 line 605-609 + Top-10 row #10 (line 858 ref) |
| Prior Top-10 batch | #1 #2 #5 #7 SHIPPED (pre 2026-05-28) · #9 SHIPPED 2026-05-28 (dashboard-grid widget remove) — see `packages/xai-web-dashboard-grid/docs/dev_log.md` for the freshest BUGFIX template |
| Write Scope (plan) | this file (`packages/plugin-web-settings-rest/docs/dev_log.md`) only — Status Panel + Bug Card + Phase 2/3/4/5 + R1..Rn + Work Log |
| Write Scope (bug-fix) | will extend to: `packages/plugin-web-settings-rest/src/panes/aboutPane.tsx` (4 `<a>` → 4 disabled `<span>`/`<button>` + `title` + `aria-disabled`), `packages/plugin-web-settings-rest/src/internal/localI18n.ts` (1 key × 2 langs additive: `about.coming_soon_tooltip`), `packages/plugin-web-settings-rest/src/styles.css` (1 new rule block: `.about-links .link[aria-disabled="true"]`), `packages/plugin-web-settings-rest/src/__tests__/aboutPane.test.tsx` (extend existing 4 tests with AB5..AB7 disabled-link cases). NO touch to: `plugin-web-tokens` (preference: local STR per Calendar precedent + dispatch brief) · `core/src/types/events.ts` (avoids `dev` branch conflict) · ADRs · other plugins · roadmap `xai-web-console.md` / `xai-web-console-gap-closure.md` (both SHIPPED archive) |
| Sub-fix Count Estimate | 1 (single-step bug-fix candidate; 4 link rewrites + 1 STR key + 1 CSS rule + 3 test cases is one atomic fix unit). Recommend Option **A) bug-fix** (manual single-step) per Handoff |

> **PRE-EXISTING SHIPPED STATE PRESERVED** (gap-closure WAVE 2 LAST, 2026-05-26 02:55):
> The `Bugfix-Extension Lineage — gap-closure row #7/#8/#9` blocks below remain SHIPPED.
> This Workflow State panel re-opens for a fresh BUGFIX (Audit Top-10 #10) per ADR-0010 §D4.
> Pattern follows `packages/xai-web-dashboard-grid/docs/dev_log.md` (Top-10 #9 precedent —
> top panel flipped to active BUGFIX; lineage blocks preserved verbatim below).
>
> **Original FEATURE_DEV reconciliation note (2026-05-24, PR-2):** The previous state of
> this block was stale at `READY_FOR_VERIFY` despite row #24 being SHIPPED on 2026-05-23
> (commit `6b8de35`). The ship commit flipped the sibling package `xai-web-settings-rest`'s
> dev_log + manifest + PLUGIN_MAP, but this `plugin-web-settings-rest` mirror was missed.
> Reconciled as part of PR-2 of `docs/reviews/web-priority-pivot-and-repo-cleanup/20260524-brief.md`.

---

## Phase Plan

### P1 — Package scaffold + 5 simple panes [DONE]

**Scope:**
- Package scaffold: `package.json`, `tsconfig.json`, `manifest.json`, `vitest.config.ts`,
  `vitest.setup.ts`, `eslint.config.js`
- `src/types.ts` — all local types
- `src/internal/localI18n.ts` — bilingual STR table + factory
- `src/internal/DeleteAccountConfirmModal.tsx` — native dialog confirm modal
- 5 pane files: accountPane, premiumPane, collaboratePane, hotkeysPane, aboutPane
- `src/styles.css` — 13 OKLCH vars + all pane CSS classes
- `src/index.ts` barrel (stub for P3 exports)
- `packages/plugin-web-storage/src/internal/registry.ts` — 37 new entries
- `packages/plugin-web-storage/src/__tests__/parity-design-md.test.ts` — 37 exempt keys
- `packages/core/src/types/events.ts` — EventMap declaration
- Tests: index-barrel.test.ts, no-hex-literals.test.ts, accountPane.test.tsx,
  premiumPane.test.tsx, collaboratePane.test.tsx, hotkeysPane.test.tsx, aboutPane.test.tsx

### P2 — 5 mid-weight panes [DONE]

**Scope:**
- 5 pane files: smartListsPane, notificationsPane, dateTimePane, morePane, integrationsPane
- Tests: smartListsPane.test.tsx, notificationsPane.test.tsx, dateTimePane.test.tsx,
  morePane.test.tsx, integrationsPane.test.tsx

### P3 — Sticky pane + host wire-up [DONE]

**Scope:**
- `src/internal/StickyColorPalette.tsx` — 13-color palette component
- `src/panes/stickyPane.tsx` — full sticky preferences pane
- `src/internal/restPanesById.ts` — aggregate map of all 11 panes
- `src/internal/applyRestPanesToRegistry.ts` — idempotent composition helper
- `src/index.ts` — final barrel with all 11 panes + helper exports
- `apps/web/src/routes/modules/settingsPaneComposition.ts` — 11 switch cases + import
- `apps/web/package.json` — workspace dep
- Tests: stickyPane.test.tsx, restPanesById.test.ts, applyRestPanesToRegistry.test.ts

---

## Work Log

### 2026-05-23 17:00 — P1: Package scaffold + 5 simple panes

- **Executor**: claude-sonnet-4-6 (feature-auto-build)
- **Action**: Created package scaffold (package.json, tsconfig.json, manifest.json,
  vitest.config.ts, vitest.setup.ts, eslint.config.js). Implemented types.ts,
  localI18n.ts (full bilingual STR table, 145 keys), DeleteAccountConfirmModal.tsx
  (native dialog), and 5 pane files: accountPane, premiumPane, collaboratePane,
  hotkeysPane, aboutPane. Created styles.css (13 OKLCH color vars + all pane CSS).
  Created index.ts barrel stub. Appended 37 new xai_pref_* entries to registry.ts
  in labeled block. Updated parity-design-md.test.ts with 37 exempt keys.
  Added EventMap declaration for web:settings:rest:account-delete-confirmed.
  Created 7 test files (26 tests).
- **Tests**: Passed (via combined run after all 3 phases)
- **Commits**: Batched into combined P1+P2+P3 implementation commit

### 2026-05-23 17:30 — P2: 5 mid-weight panes

- **Executor**: claude-sonnet-4-6 (feature-auto-build)
- **Action**: Implemented smartListsPane (3-section tri-state grid, 12 rows),
  notificationsPane (8 controls including conditional quiet-hours inputs),
  dateTimePane (5 controls), morePane (14 controls + per-pane reset),
  integrationsPane (17 placeholder cards in 3 groups, OKLCH colors).
  Created 5 test files (35 tests).
- **Tests**: Passed (via combined run)
- **Commits**: Batched

### 2026-05-23 17:40 — P3: Sticky pane + host wire-up + bug fixes

- **Executor**: claude-sonnet-4-6 (feature-auto-build)
- **Action**: Implemented StickyColorPalette.tsx (13 swatches, CSS var backgrounds,
  conic-gradient for random), stickyPane.tsx (color + font + pin + spacing),
  restPanesById.ts, applyRestPanesToRegistry.ts. Finalized index.ts barrel.
  Wired 11 switch cases + import into settingsPaneComposition.ts. Added
  @repo/plugin-web-settings-rest dep to apps/web/package.json. Created 3 test
  files (21 tests).
  Fixed issues discovered during test run:
  - TSDoc {ts,tsx} glob in no-hex-literals comment (TS parse error)
  - import.meta.env.DEV removed (no Vite types in lib tsconfig)
  - localI18n widened to accept string for template literal call sites
  - DeleteAccountConfirmModal: guarded showModal/close with typeof checks
  - collaboratePane: pane title fixed to use s("settings.collaborate")
  - StickyColorPalette + accountPane: replaced #fff with oklch(100% 0 0)
  - registry.test.ts OWNER_ROW_ADDITIONS: added 37 new keys
  - integrationsPane.test.tsx: updated IN5 (no console.warn in no-op handler)
  - Removed unused imports (vi, beforeEach) from test files
- **Tests**: 81/81 pass; plugin-web-storage 70/70 pass; core 8/8 pass
- **Commits**: See below

---

## Commits

(To be filled in after git commit)

---

## Blockers

None.

---

## Bugfix-Extension Lineage — gap-closure row #7 (2026-05-25)

> APPEND-ONLY block. The Workflow State Panel + Phase Plan + Work Log +
> Commits + Blockers above record the SHIPPED row #24 (W4b) baseline plus the
> 2026-05-24 PR-2 drift reconciliation and are NOT mutated by this extension
> lineage. This block tracks a new feature-dev cycle introduced by the
> `xai-web-console-gap-closure` manifest row #7 (Gap 6a — Integrations Pane
> OAuth Stub for Notion / Google Calendar / Linear).
>
> Note: a prior 2026-05-25 extension (gap-closure row #2 — AI LLM adapter)
> added `aiPane` to this package via the `packages/xai-web-ai-chat/docs/`
> design home (lineage block recorded there, not here). This row #7 is the
> first extension lineage block to live directly in this dev_log.

### Lineage Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-settings-integrations-3rd-party |
| Title | Wire the Integrations pane (currently 17 placeholder cards, no-op clicks) with 3 real OAuth authorization-code + PKCE stub flows for Notion / Google Calendar / Linear. v1 is stub-only — callback page validates state then discards the code; no token persistence; no real backend. Establishes the OAuth callback URL pattern + CSP `connect-src` allowlist pattern for 3 token endpoints + PKCE state/code_verifier generation pattern (crypto.getRandomValues + base64url + sessionStorage TTL). Adds 3 boolean prefs in `plugin-web-storage` + 2 declaration-only EventMap entries + 1 new react-router route `/app/settings/integrations/callback`. Amends ADR-0008 §S3 D3 in-place (third amendment) per row #2 binding precedent + row #6 precedent. |
| Current Phase | SHIPPED |
| Status | SHIPPED |
| Suggested Next | — (workflow complete) |
| Verify Cross-vendor | yes (per ADR-0009 §D4 P0 + roadmap header default; primary Codex `gpt-5.5-thinking medium`, fallback Cursor) |
| Automation Mode | A-Claude (per roadmap default inherited from xai-web-console.md 2026-05-23 user override) |
| Executor | claude-sonnet-4-6 — ship, 2026-05-26 |
| Updated | 2026-05-26 00:30 |
| Dispatched By | `xai-roadmap-loop` SERIAL dispatch — Wave 2 second row, after row #6 SHIPPED `a86f58f` 2026-05-25 |
| Roadmap Row | `docs/workflow/roadmap/xai-web-console-gap-closure.md` row #7 (W2 · OAuth PKCE stub for 3 providers) |
| Parent ADR | ADR-0009 §D2-G3 (P0 gap-closure; ≥5/9 known gaps SHIPPED to unblock P1 Desktop launch) |
| ADR Amendment | **ADR-0008 §S3 D3 — amend in-place (third amendment)** per row #2 binding precedent + row #6 precedent. Extend `connect-src` with 3 OAuth token endpoints: `https://api.notion.com`, `https://oauth2.googleapis.com`, `https://api.linear.app`. `frame-src` NOT widened — all 3 providers set `X-Frame-Options: DENY` on authorize pages (verified in discovery review §3.3). Add row to Amendments frontmatter. Update §S6 `_headers` content snippet. Extend `apps/web/src/__tests__/csp.test.ts` (+1 case `CSP3`). |
| Concurrent Siblings | None (SERIAL dispatch — W2 rows #8/#9 PENDING per roadmap manifest; serial mode locks one row at a time) |
| Pattern Setter For | row #8 settings-premium-stripe (will reuse the callback URL pattern for Stripe `success_url` + a 4th CSP amendment for `js.stripe.com` + `api.stripe.com`) + future P1 sync rows |
| Write Scope | **planning phase (this run)**: `docs/reviews/xai-web-settings-integrations-3rd-party/20260525-discovery-review.md` (NEW) + `packages/plugin-web-settings-rest/docs/{design.md, api.md, test.md, dev_log.md}` (APPEND-ONLY extension sections). **build phases (later)** extend to: `packages/plugin-web-settings-rest/src/{internal/integrationProviders.ts, internal/pkce.ts, internal/oauthState.ts, internal/buildAuthorizeUrl.ts, internal/integrationConnectButton.tsx, internal/integrationDisconnectButton.tsx, internal/integrationStubBanner.tsx, CallbackPage.tsx} (NEW)` + `panes/integrationsPane.tsx + internal/localI18n.ts + styles.css + index.ts (EDIT)` + 8 new test files + 1 edited test file + `packages/plugin-web-storage/src/internal/registry.ts (EDIT, +3 prefs)` + `packages/plugin-web-storage/src/__tests__/parity-design-md.test.ts (EDIT, +3 exempt)` + `packages/core/src/types/events.ts (EDIT, +2 EventMap entries)` + `apps/web/src/routes/router.tsx (EDIT, +1 route child)` + `apps/web/public/_headers (EDIT, extend connect-src)` + `apps/web/src/__tests__/csp.test.ts (EDIT, +CSP3 case)` + `docs/adr/0008-cloudflare-deploy-target-and-csp.md (EDIT, §S3 D3 third amendment + frontmatter row)` + `docs/PLUGIN_MAP.md (EDIT, append extension note to plugin-web-settings-rest row)`. |

### Artifacts Index (this extension)

- Seed brief: `docs/reviews/xai-web-settings-integrations-3rd-party/20260524-roadmap-seed.md`
- Discovery review: `docs/reviews/xai-web-settings-integrations-3rd-party/20260525-discovery-review.md`
- Design extension: `packages/plugin-web-settings-rest/docs/design.md` §"2026-05-25 Extension: Integrations Pane OAuth Stub (gap-closure row #7)"
- API extension: `packages/plugin-web-settings-rest/docs/api.md` §6
- Test extension: `packages/plugin-web-settings-rest/docs/test.md` §5
- Dev log extension: `packages/plugin-web-settings-rest/docs/dev_log.md` (this block)

### Decision Headline (this extension)

Establish the OAuth callback + PKCE stub pattern by wiring 3 representative providers:

1. **Notion** — `https://api.notion.com/v1/oauth/authorize` (authorize) + `https://api.notion.com/v1/oauth/token` (token, future use). Scope: provider-specific (Notion uses no scope param in stub mode; placeholder ok).
2. **Google Calendar** — `https://accounts.google.com/o/oauth2/v2/auth` (authorize, browser-nav only, not in CSP) + `https://oauth2.googleapis.com/token` (token, in CSP). Scope: `https://www.googleapis.com/auth/calendar.readonly`.
3. **Linear** — `https://linear.app/oauth/authorize` (authorize, browser-nav only) + `https://api.linear.app/oauth/token` (token, in CSP). Scope: `read`.

All 3 use:
- **PKCE** with `code_challenge_method=S256`.
- `code_verifier` = 43-char base64url(`crypto.getRandomValues(new Uint8Array(32))`) — NEVER `Math.random` (HC10).
- `state` = `<providerId>.` + base64url(32 random bytes from `crypto.getRandomValues`).
- **sessionStorage** entry `xai_oauth_pending_<providerId>` with TTL 10 min — NEVER `localStorage` for code_verifier (HC10).
- **Same-tab navigation** via `window.location.assign(authorizeUrl)` — deviation from seed brief "new tab" wording justified in discovery §4.1 (same-tab is the only HC-compatible path for PKCE in a SPA).
- **Callback** at `/app/settings/integrations/callback` — validates state strictly (===, TTL, providerId prefix match), then flips per-provider boolean pref + emits typed event + displays "Authorization received (stub)" banner + auto-navigates back in 2s.

The 14 other placeholder cards stay placeholders (no-op clicks, IN1..IN6 tests preserved).

### Phase Plan (this extension)

#### Extension-P1 — Provider config + PKCE helpers + sessionStorage + 3 prefs registered [DONE]

**Scope:**
- `src/internal/integrationProviders.ts` (NEW) — 3 IntegrationProvider entries
- `src/internal/pkce.ts` (NEW) — generateCodeVerifier / computeCodeChallenge / base64UrlEncode
- `src/internal/oauthState.ts` (NEW) — startOAuth / validateAndConsumeState / OAUTH_STATE_TTL_MS
- `packages/plugin-web-storage/src/internal/registry.ts` — +3 boolean prefs in labeled block
- `packages/plugin-web-storage/src/__tests__/parity-design-md.test.ts` — +3 exempt keys
- Tests: pkce.test.ts, oauthState.test.ts, integrationProviders.test.ts, no-math-random.test.ts
- Suggested commit: `feat(xai-web-settings-integrations-3rd-party): P1 — PKCE helpers + state machine + 3 boolean prefs registration (gap-closure row #7)`

#### Extension-P2 — Connect button + authorize URL builder [DONE]

**Scope:**
- `src/internal/buildAuthorizeUrl.ts` (NEW)
- `src/internal/integrationConnectButton.tsx` (NEW)
- Tests: buildAuthorizeUrl.test.ts, integrationConnectButton.test.tsx
- Suggested commit: `feat(xai-web-settings-integrations-3rd-party): P2 — Connect button + authorize URL builder + same-tab navigation (gap-closure row #7)`

#### Extension-P3 — Callback route + state validation + EventMap + router edit [DONE]

**Scope:**
- `src/CallbackPage.tsx` (NEW) — validate state, flip pref, emit event, banner, navigate
- `src/index.ts` — export `{ CallbackPage }`
- `packages/core/src/types/events.ts` — +2 EventMap declarations
- `apps/web/src/routes/router.tsx` — +1 route child for `settings/integrations/callback`
- `apps/web/src/routes/router.integration.test.tsx` — +1 case RR1
- Tests: CallbackPage.test.tsx
- Suggested commit: `feat(xai-web-settings-integrations-3rd-party): P3 — CallbackPage + router wiring + 2 EventMap declarations (gap-closure row #7)`

#### Extension-P4 — Disconnect + 3 Connected (stub) cards + pane-top banner + 24 bilingual i18n entries [DONE]

**Scope:**
- `src/panes/integrationsPane.tsx` (EDIT) — add ConnectedIntegrations section above existing 3 groups
- `src/internal/integrationDisconnectButton.tsx` (NEW)
- `src/internal/integrationStubBanner.tsx` (NEW)
- `src/internal/localI18n.ts` (EDIT) — +24 bilingual entries
- `src/styles.css` (EDIT) — +banner + badge CSS (all OKLCH)
- Tests: integrationsPane.test.tsx (EDIT — IN1..IN6 preserved, IN-EXT-1..12 added), integrationDisconnectButton.test.tsx, integrationStubBanner.test.tsx
- Suggested commit: `feat(xai-web-settings-integrations-3rd-party): P4 — Disconnect + Connected (stub) section + stub-mode banner + bilingual i18n (gap-closure row #7)`

#### Extension-P5 — ADR-0008 third amendment + _headers + CSP3 + PLUGIN_MAP note [DONE]

**Scope:**
- `docs/adr/0008-cloudflare-deploy-target-and-csp.md` (EDIT) — add Amendments frontmatter row + §S3 D3 amendment block + §S6 `_headers` snippet update
- `apps/web/public/_headers` (EDIT) — extend `connect-src` with 3 hostnames
- `apps/web/src/__tests__/csp.test.ts` (EDIT) — +CSP3 case
- `docs/PLUGIN_MAP.md` (EDIT) — append `(Extension 2026-05-25 — Integrations OAuth stub gap-closure row #7)` to plugin-web-settings-rest row
- Verify: `pnpm --filter @repo/web build` + `pnpm --filter @repo/web test` passes
- Suggested commit: `feat(xai-web-settings-integrations-3rd-party): P5 — ADR-0008 §S3 D3 THIRD amendment + _headers connect-src extension + CSP3 source-text guard (gap-closure row #7)`

#### Extension-P6 — Cross-vendor verify checklist (owned by feature-verify) [DEFERRED to feature-verify]

**Scope:**
- PKCE correctness cold-read (Codex `gpt-5.5-thinking medium`)
- No URL leakage cold-read
- CSP minimality cold-read (3 entries; no wildcard; frame-src unchanged)
- Manual smoke (real OAuth click on each of 3 providers; may be deferred 24h per ADR-0008 carve-out consistent with W1/W2 precedent)

### Risk Register (per discovery §6)

R1 PKCE state collision under fast re-clicks → per-provider namespaced sessionStorage keys.
R2 Callback reached without prior state → invalid-state banner + navigate.
R3 Popup blocker → moot (same-tab decision).
R4 Notion rate-limit on authorize → user-initiated only; non-issue.
R5 Surprise `frame-src` need → flagged for cross-vendor cold-read; 4th amendment if observed.
R6 Provider-side grant not revoked on Disconnect → documented tooltip (v1 limitation).
R7 TTL too short → 10-min default + clear error path.
R8 jsdom crypto stubs → confirmed adequate in row #6 precedent.
R9 Other code interprets 3 boolean flags as "real connection" → FA-11 documentation.
R10 Cold-read flags PKCE strictness → TT-PKCE-1..5 covers validation.

### Work Log (this extension)

#### 2026-05-25 — Extension-FEATURE_PLAN: discovery + design/api/test/dev_log extension blocks

- **Executor**: Claude Opus 4.7 (1M context) — feature-plan
- **Action**:
  - Read seed brief + roadmap row #7 + SHIPPED design/api/test/dev_log + integrationsPane.tsx + plugin-web-storage registry + ADR-0008 §S3 D3 (post row #2 + row #6 amendments) + _headers + csp.test.ts + router.tsx + settingsPaneComposition.ts + xai-web-board-views extension lineage block (as pattern source) + aiPane.tsx (as in-pane sibling extension reference).
  - Performed 3 WebSearches for current Notion / Google Calendar / Linear OAuth PKCE specs; recorded sources in discovery §7.
  - Wrote discovery review: `docs/reviews/xai-web-settings-integrations-3rd-party/20260525-discovery-review.md` (15 sections; full options analysis on 6 axes A..F; 10 risks; 5 phases).
  - APPENDED extension sections to `design.md` (§"2026-05-25 Extension: Integrations Pane OAuth Stub (gap-closure row #7)" — 15 frozen assumptions + component graph + state machine + i18n delta).
  - APPENDED §6 to `api.md` (11 sub-sections covering exports, provider config shape, PKCE helpers, state helpers, URL builder, i18n keys, prefs, EventMap, route declaration, error semantics, CSP impact).
  - APPENDED §5 to `test.md` (8 sub-sections covering env, mocks, full ~50-case test matrix in 5 phases, mock surface area, acceptance criteria, no-Math-random guard, no-localStorage guard for code_verifier, cross-vendor verify checklist).
  - APPENDED "## Bugfix-Extension Lineage — gap-closure row #7 (2026-05-25)" block to this `dev_log.md` (Status Panel + Decision Headline + 6-phase plan + R1..R10 risks + this Work Log entry).
  - SHIPPED Status Panel + Phase Plan + Work Log + Commits + Blockers sections of row #24 (W4b) preserved verbatim per HC9.
- **Tests**: planning phase — no test execution (deferred to feature-build phases)
- **Commits**: — (planning phase produces docs only)
- **Next step**: `feature-review` to validate plan; expected verdict APPROVED or REVISE.

#### 2026-05-25 23:30 — Extension-P1: Provider config + PKCE helpers + sessionStorage + 3 prefs registered

- **Executor**: claude-sonnet-4-6 (feature-auto-build)
- **Action**: Created integrationProviders.ts (3 IntegrationProvider entries — Notion/GCal/Linear), pkce.ts (generateCodeVerifier / computeCodeChallenge / base64UrlEncode — RFC 7636), oauthState.ts (startOAuth / validateAndConsumeState / OAUTH_STATE_TTL_MS — sessionStorage only, never localStorage). Extended vitest.setup.ts to clear sessionStorage afterEach. Added 3 boolean prefs to plugin-web-storage registry.ts (xai_pref_integrations_connected_{notion,gcal,linear}) + parity-design-md.test.ts (+3 exempt) + registry.test.ts OWNER_ROW_ADDITIONS (+3 keys). Created pkce.test.ts (PK1..PK8), oauthState.test.ts (OS1..OS7), integrationProviders.test.ts (IP1..IP4), no-math-random.test.ts (TT-PKCE-NO-MATH-RANDOM + no-localStorage guard).
- **Tests**: 119/119 plugin-web-settings-rest; 88/88 plugin-web-storage
- **Commits**: 85bf836 feat(xai-web-settings-integrations-3rd-party): P1 — PKCE helpers + state machine + 3 boolean prefs registration (gap-closure row #7)
- **Next step**: P2

#### 2026-05-25 23:42 — Extension-P2: Connect button + authorize URL builder

- **Executor**: claude-sonnet-4-6 (feature-auto-build)
- **Action**: Created buildAuthorizeUrl.ts (pure async — provider + pendingState → PKCE authorize URL), integrationConnectButton.tsx (startOAuth → buildAuthorizeUrl → window.location.assign; never writes localStorage). Added 24 bilingual i18n entries to localI18n.ts early (int.btn.connect/disconnect, int.banner.stub, int.badge.connected_stub, provider.*, oauth.cb.*, etc.) to unblock P2+P3 bilingual tests. Created buildAuthorizeUrl.test.ts (BU1..BU6) + integrationConnectButton.test.tsx (CB1..CB4 with Object.defineProperty window.location fix).
- **Tests**: 129/129 plugin-web-settings-rest
- **Commits**: 709bf19 feat(xai-web-settings-integrations-3rd-party): P2 — Connect button + authorize URL builder + same-tab navigation (gap-closure row #7)
- **Next step**: P3

#### 2026-05-25 23:46 — Extension-P3: Callback route + state validation + EventMap + router edit

- **Executor**: claude-sonnet-4-6 (feature-auto-build)
- **Action**: Created CallbackPage.tsx (reads useSearchParams; validateAndConsumeState; flips per-provider pref via usePref; emits web:settings:integration-connected; shows green/red/yellow banner; navigates back after 2/4/3s; never persists authorization code). Updated index.ts to export CallbackPage + IntegrationProviderId. Added react-router ^7.15.1 to package.json dependencies. Added 2 EventMap declarations to packages/core/src/types/events.ts (web:settings:integration-connected + web:settings:integration-disconnected — declaration-only). Updated router.tsx to add literal path "settings/integrations/callback" child BEFORE :moduleId/*. Added RR1 to router.integration.test.tsx. Created CallbackPage.test.tsx (CP1..CP8).
- **Tests**: 137/137 plugin-web-settings-rest; 8/8 core; 4/4 router integration
- **Commits**: 9cb9114 feat(xai-web-settings-integrations-3rd-party): P3 — CallbackPage + router wiring + 2 EventMap declarations (gap-closure row #7)
- **Next step**: P4

#### 2026-05-25 23:50 — Extension-P4: Disconnect + Connected (stub) section + stub-mode banner + i18n

- **Executor**: claude-sonnet-4-6 (feature-auto-build)
- **Action**: Created integrationDisconnectButton.tsx (onDisconnect callback + emitWebEvent web:settings:integration-disconnected; title tooltip for provider revocation note). Created integrationStubBanner.tsx (non-dismissible pane-top banner, bilingual, data-testid="int-stub-banner"). Updated integrationsPane.tsx: reads 3 usePref booleans; renders "Connected providers" section with Connect/Disconnect per provider; filters wired-provider placeholder cards when connected (Note 2 anti-duplication); OKLCH badge for connected state. Updated styles.css (+banner + badge + connect/disconnect btn + connected-card + oauth-cb-page CSS — all OKLCH). Created integrationDisconnectButton.test.tsx (DB1..DB3), integrationStubBanner.test.tsx (SB1..SB2), updated integrationsPane.test.tsx (IN1..IN6 preserved + IN-EXT-1..IN-EXT-12).
- **Tests**: 154/154 plugin-web-settings-rest
- **Commits**: 1a11742 feat(xai-web-settings-integrations-3rd-party): P4 — Disconnect + Connected (stub) section + stub-mode banner + bilingual i18n (gap-closure row #7)
- **Next step**: P5

#### 2026-05-25 23:53 — Extension-P5: ADR-0008 §S3 D3 THIRD amendment + _headers + CSP3 + PLUGIN_MAP

- **Executor**: claude-sonnet-4-6 (feature-auto-build)
- **Action**: Amended ADR-0008 frontmatter (third amendment entry) + §S3 D3 (new "OAuth token endpoint extension row #7" block) + §S6 _headers snippet (updated connect-src). Updated apps/web/public/_headers connect-src: added https://api.notion.com https://oauth2.googleapis.com https://api.linear.app (frame-src NOT widened). Added CSP3 test case to apps/web/src/__tests__/csp.test.ts asserting all 3 token hostnames present. Updated docs/PLUGIN_MAP.md plugin-web-settings-rest row with extension note. P6 is deferred to feature-verify (cross-vendor verify checklist per test.md §5.8).
- **Tests**: CSP1/CSP2/CSP3 pass; 111/111 web; pnpm build succeeds
- **Commits**: 826149d feat(xai-web-settings-integrations-3rd-party): P5 — ADR-0008 §S3 D3 THIRD amendment + _headers connect-src extension + CSP3 source-text guard (gap-closure row #7)
- **Next step**: feature-verify

#### 2026-05-25 — Extension-FEATURE_REVIEW: review verdict APPROVED

- **Executor**: Claude Opus 4.7 (1M context) — feature-review
- **Action**: Validated planning artifacts (discovery review + design.md §Extension + api.md §6 + test.md §5 + this dev_log lineage block) against the 10 review gates supplied by `xai-roadmap-loop` SERIAL dispatch.
  - **Gate 1 Scope sanity**: 7 acceptance signals all covered (Connect → opens authorize URL via FA-6; Connected (stub) UI via IN-EXT-3; Disconnect clears via DB3 + IN-EXT-8/9; 3-provider parity via IP1..4; CSP 0 violations via CSP3 source-text guard; 81/15 existing tests preserved via IN1..6 retained + FA-14 + parity-test extension; cross-vendor Codex cold-read scheduled in §5.8 + §5.5 acceptance #10). ✓
  - **Gate 2 Hard constraints (10 HCs)**: HC1 (3 providers — IP1) ✓; HC2 (PKCE flow + redirect URI shape — FA-3/4/7) ✓ with same-tab deviation justified §4.1 + flagged Q1 (confirmed acceptable: same-tab is the only HC10-compatible PKCE path in a SPA — new-tab requires either BroadcastChannel or localStorage code_verifier); HC3 (stub-only — FA-1) ✓; HC4 (CSP connect-src + frame-src decision — FA-9 + ADR amendment) ✓; HC5 (Disconnect functional in stub — DB3) ✓; HC6 (3 boolean prefs registered — FA-11 + §6.7) ✓; HC7 (P0 + cross-vendor verify — §5.8 + acceptance #10) ✓; HC8 (append-only — FA-15) ✓; HC9 (Step 0 brief is input + row #24 SHIPPED panel preserved verbatim) ✓; HC10 (crypto.getRandomValues for state/code_verifier — FA-3/4 + PK1..8; sessionStorage with TTL not localStorage — FA-5 + §5.7 no-localStorage source-text guard; no Math.random — §5.6 source-text guard) ✓
  - **Gate 3 Architectural fit**: events via core EventMap + emitWebEvent through `@repo/xai-web-event-bus` ✓; persistence via `@repo/plugin-web-storage` registry (3 keys in labeled block, owner xai-web-settings-rest) ✓; no `@tauri-apps/api` ✓; three-layer boundaries respected (host owns route declaration only; plugin owns CallbackPage + provider config; core owns EventMap type) ✓
  - **Gate 4 PLUGIN_MAP consistency**: P5 appends `(Extension 2026-05-25 — Integrations OAuth stub gap-closure row #7)` note to row #24 plugin-web-settings-rest; no new package row added ✓
  - **Gate 5 PKCE correctness**: code_verifier = base64url(crypto.getRandomValues(Uint8Array(32))) — 43 chars (within RFC 7636 43-128 range) ✓; code_challenge = base64url(SHA-256(verifier)) with method=S256 ✓; state validation strict (=== + TTL + providerId prefix — OS4..6) ✓; one-shot consumption (OS7) ✓; RFC 7636 §B.1 known vector test (PK5) ✓
  - **Gate 6 CSP amendment scope**: 3rd in-place amend per binding precedent ✓; endpoints minimal — Notion `api.notion.com` (token only — `accounts.google.com` and `linear.app` are top-level navigation destinations excluded from connect-src per discovery §3.2 evidence) ✓; Google `oauth2.googleapis.com` ✓; Linear `api.linear.app` ✓; frame-src decision sound — all 3 providers set `X-Frame-Options: DENY` per discovery §3.3 evidence; no frame-src widening + R5 flagged for cross-vendor cold-read ✓
  - **Gate 7 Test strategy**: 81+15 SHIPPED preserved (FA-14 + IN1..6 retained explicitly) + ~50 new tests covering PKCE generation correctness (PK1..8 + no-math-random guard) + state validation (OS1..7) + 3-provider abstraction parity (IP1..4) + disconnect (DB1..3 + IN-EXT-8/9) + stub banner (SB1/2 + IN-EXT-4..6) + CSP source-text guard (CSP3) + 100 web baseline (CSP test extends existing file, doesn't replace) ✓
  - **Gate 8 Phase granularity**: 6 phases (P1 PKCE helpers + 3 prefs / P2 Connect button + URL builder / P3 CallbackPage + router + EventMap / P4 Disconnect + pane edit + banner + i18n / P5 ADR + _headers + CSP3 + PLUGIN_MAP / P6 verify) — each P1..P5 is implementable as one feature-build run with clear file boundaries + dedicated commit message ✓
  - **Gate 9 Risk register**: 10 risks documented (exceeds 5 baseline) covering state collision (R1), callback-without-state (R2), popup blocker moot via same-tab (R3), rate limits (R4), frame-src surprise (R5), disconnect-revoke gap (R6), TTL too short (R7), jsdom crypto stubs (R8), cross-code flag misinterpretation (R9), cold-read flags strictness (R10); each has a concrete mitigation ✓
  - **Gate 10 Cross-vendor verify focus**: §5.8 enumerates Codex cold-read targets — PKCE correctness (state + code_verifier + one-shot + TTL + never-on-network) + no URL leakage (code never logged/persisted) + CSP minimality (3 entries; no wildcard; frame-src unchanged) + no real network (fetch=0) + disconnect local-only ✓
- **Findings**: 0 blockers. 2 recommendations to surface during feature-auto-build:
  1. **Q1 same-tab confirmation (informational)**: The seed brief HC2 says "opens in new tab" but the plan uses `window.location.assign` (same-tab) per FA-6. This deviation is sound and APPROVED — new-tab + sessionStorage cannot survive cross-tab without either BroadcastChannel or localStorage (HC10 violation). The plan correctly flagged this for review.
  2. **Q5 UI ordering**: A new "Connected (stub)" section above existing 3 groups is reasonable; feature-build P4 should ensure the 3 newly-wired cards do NOT visually duplicate placeholders below (i.e. if Notion is in FEATURED placeholder and also in Connected (stub) section, the placeholder version should be filtered out so it doesn't render twice). This is implementation detail, not a blocker.
- **Tests**: review phase — no test execution
- **Commits**: — (review phase produces docs only)
- **Next step**: `feature-auto-build` (per Automation Mode A-Claude + dispatched by `xai-roadmap-loop` SERIAL); will execute P1..P5 sequentially with per-phase commit + stop before feature-verify per workflow contract.

#### 2026-05-26 — Extension-FEATURE_VERIFY: verdict BLOCKED (lint --max-warnings 0)

- **Executor**: Claude Opus 4.7 (1M context) — feature-verify
- **Action**: Independently verified the 6 commits (85bf836 P1, 709bf19 P2, 9cb9114 P3, 1a11742 P4, 826149d P5, 218b0ae chore) against plan + 10 HCs + test.md §5.4 acceptance criteria.
  - **Tests re-executed**: plugin-web-settings-rest 154/154 PASS; plugin-web-storage 88/88 PASS; core 8/8 PASS; web 111/111 PASS — total 361/361.
  - **Build**: `pnpm --filter @repo/web build` SUCCEEDS; `dist/_headers` contains all 3 OAuth token endpoints in connect-src (Notion, oauth2.googleapis.com, Linear) per CSP3 source-text guard.
  - **HC1-HC10 pass**: 3 providers only (Notion/GCal/Linear); PKCE authorization-code with code_challenge_method=S256 + 32 random bytes via crypto.getRandomValues; stub-only (fetch() never called outside comment; callback discards code); CSP extended for 3 token endpoints, frame-src unchanged with documented X-Frame-Options:DENY decision; Disconnect functional in stub (DB3); 3 boolean prefs registered in plugin-web-storage; append-only dev_log preserved verbatim SHIPPED row #24 panel; sessionStorage TTL only, no localStorage in oauthState.ts (no-localStorage source-text guard PASS); no Math.random in 6 OAuth modules (TT-PKCE-NO-MATH-RANDOM PASS).
  - **PKCE correctness**: PK5 RFC 7636 §B.1 vector verified (verifier "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk" → challenge "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"); code_verifier 43 chars; base64url charset; SHA-256 via crypto.subtle.digest.
  - **ADR-0008 §S3 D3**: third amendment in-place; frontmatter Amendments row added; §S6 _headers snippet updated; binding-precedent rule preserved.
  - **EventMap**: 2 declarations present (web:settings:integration-connected + web:settings:integration-disconnected) at packages/core/src/types/events.ts:371/379.
  - **Router**: settings/integrations/callback child route declared at apps/web/src/routes/router.tsx:52 BEFORE :moduleId/*.
  - **PLUGIN_MAP**: extension note appended to plugin-web-settings-rest row #126.
- **Findings — BLOCKERS (2)**:
  1. **B1 (lint exit 1)**: `pnpm --filter @repo/plugin-web-settings-rest lint --max-warnings 0` FAILS with 2 warnings — violates test.md §5.4 acceptance criterion #1 "lint exits 0 (--max-warnings 0)":
     - `src/__tests__/oauthState.test.ts:68:11` — `'pending' is assigned a value but never used` (OS7 test: `const pending = await startOAuth("linear")` — pending value never asserted; should either remove the binding or assert on it).
     - `src/panes/integrationsPane.tsx:67:7` — `'WIRED_PROVIDER_CARD_IDS' is assigned a value but never used` (the constant was declared as a defensive whitelist but the actual filterConnected predicate uses connectedMap[spec.id] directly without consulting WIRED_PROVIDER_CARD_IDS — dead code).
- **Tests**: as documented above; no fix attempted (verify-only role).
- **Commits**: — (verify phase produces no commits)
- **Next step**: `feature-build` (or `feature-auto-build` in loop mode) to remove the 2 unused-vars warnings; recommended fix is the minimal one — drop the `const pending =` binding in OS7 (test still works because the next line reads sessionStorage directly), and remove the unused `WIRED_PROVIDER_CARD_IDS` constant (the filtering is already correctly implemented via connectedMap). Re-submit feature-verify after re-running lint to confirm exit 0.

#### 2026-05-26 — Extension-VERIFY-FEEDBACK-PATCH: repair 2 lint nits → READY_FOR_VERIFY

- **Executor**: claude-sonnet-4-6 — feature-build (verify-feedback patch, `xai-roadmap-loop` SERIAL row #7)
- **Action**: Applied 2 targeted fixes to clear the B1.a and B1.b lint blockers reported by feature-verify:
  - **B1.a** (`oauthState.test.ts` OS7): Dropped `const pending =` binding on line 68. OS7's intent is to verify sessionStorage is cleared even on a failed validation; the return value of `startOAuth()` was only needed for its side-effect of writing to sessionStorage. The existing assertion on line 69 reads `sessionStorage.getItem()` directly — no information lost. Added inline comment clarifying the call is for its side-effect only.
  - **B1.b** (`integrationsPane.tsx`): Removed unused `WIRED_PROVIDER_CARD_IDS` constant (lines 65-67). The constant declared `new Set<IntegrationCardId>(["notion", "gcal", "linear"])` but `filterConnected` already uses `connectedWiredIds` derived from `PROVIDERS.filter((p) => connectedMap[p.id])` — the set constant was pure dead code; filtering logic was and remains correct.
- **Tests**:
  - `pnpm --filter @repo/plugin-web-settings-rest lint --max-warnings 0` → exit 0 (0 warnings)
  - `pnpm --filter @repo/plugin-web-settings-rest test` → 154/154 PASS
- **Commits**: `12a4464` fix(xai-web-settings-integrations-3rd-party): repair 2 lint nits (verify B1.a unused pending + B1.b unused WIRED_PROVIDER_CARD_IDS)
- **Lineage Status**: READY_FOR_VERIFY
- **Next step**: `feature-verify` — re-run independent verification; lint --max-warnings 0 now exits 0.

#### 2026-05-26 — Extension-FEATURE_VERIFY cycle 2: verdict BLOCKED (web check-types)

- **Executor**: Claude Opus 4.7 (1M context) — feature-verify (re-verify cycle 2 after B1.a + B1.b patch)
- **Action**: Re-ran the 7 gates supplied by the cycle-2 dispatch against the 8 commits (85bf836 P1, 709bf19 P2, 9cb9114 P3, 1a11742 P4, 826149d P5, 218b0ae chore, 12a4464 lint patch, 5a2f503 docs flip).
  - **Gate 1 B1.a + B1.b re-check (lint --max-warnings 0)**: PASS. `pnpm --filter @repo/plugin-web-settings-rest lint --max-warnings 0` → exit 0, 0 warnings. `git show 12a4464` confirms exactly 2 source files touched: oauthState.test.ts (-`const pending =` + side-effect comment) + integrationsPane.tsx (-`WIRED_PROVIDER_CARD_IDS` constant). 3 lines net change, no logic drift.
  - **Gate 2 Test re-run**: PASS. plugin-web-settings-rest 154/154; plugin-web-storage 88/88 (no regression); core 8/8; web 111/111. Total 361/361.
  - **Gate 3 check-types**:
    - `pnpm --filter @repo/plugin-web-settings-rest check-types` → "None of the selected packages has a check-types script" (no script defined, treated as N/A).
    - **`pnpm --filter @repo/web check-types` → FAIL (exit 2)** with `src/routes/router.tsx(54,47): error TS2322: Type '"oauth-callback"' is not assignable to type '"module" | "app" | "auth" | "root"'.` Confirmed pre-row-7 baseline (commit a86f58f checkout of router.tsx) yields exit 0 → this is a row #7 regression introduced by Extension-P3 commit 9cb9114, not pre-existing.
  - **Gate 4 Build**: `pnpm --filter @repo/web build` → SUCCESS (Vite/esbuild transform doesn't enforce TS strict, so the issue was masked at build time but is real for the repo-wide `turbo check-types` gate).
  - **Gate 5 Cycle-1 PASSING gates spot-check**: All preserved.
    - PKCE RFC 7636 §B.1 vector test (PK5) still passes inside the 154/154 result.
    - CSP3 source-text guard passes inside web 111/111 (csp.test.ts shows 3 tests passing).
    - no-Math.random + no-localStorage guards in no-math-random.test.ts (7 tests) pass.
    - HC1-HC10 remain held: 3 providers, PKCE S256, stub-only, CSP minimally extended, Disconnect functional, 3 prefs registered, append-only dev_log, sessionStorage + TTL, no Math.random, no localStorage for code_verifier.
  - **Gate 6 Patch hygiene**: 12a4464 touches exactly 2 production files + 0 dev_log; 5a2f503 touches dev_log only. Commit messages format-compliant (Why / What / Scope / Risk / Docs / Tests + Co-Authored-By). No scope creep within the patch itself.
- **Findings — BLOCKER (1, NEW)**:
  - **B2 (web check-types regression — INTRODUCED BY EXTENSION-P3 commit 9cb9114, MASKED IN CYCLE 1)**: `pnpm --filter @repo/web check-types` exits 2 with TS2322 at `apps/web/src/routes/router.tsx:54` — the `RouteErrorBoundary` `scope` prop is typed `"root" | "auth" | "app" | "module"` (`apps/web/src/routes/RouteErrorBoundary.tsx:6`) and Extension-P3 passed `scope="oauth-callback"` without extending the union. The pre-row-7 baseline (a86f58f checkout of router.tsx) confirms exit 0, so this is a row-#7-introduced regression, not a pre-existing condition. Cycle 1 missed it because the verify dispatch did not list web check-types as an explicit gate; cycle 2's dispatch added it (Gate 4).
- **Fix recommendation** (for feature-build / feature-auto-build):
  - Extend the union literal at `apps/web/src/routes/RouteErrorBoundary.tsx:6` from `"root" | "auth" | "app" | "module"` to `"root" | "auth" | "app" | "module" | "oauth-callback"` (single-line change).
  - Optional: add an explicit boundary scope test inside `apps/web/src/__tests__/` so future strict-type regressions on this surface are caught by `pnpm test` rather than only `check-types`.
  - Re-submit feature-verify after re-running both `pnpm --filter @repo/web check-types` (must exit 0) and the full 361/361 test suite.
- **Tests**: as documented above — 361/361 pass, lint exit 0, web build SUCCESS, web check-types FAIL (B2).
- **Commits**: — (verify phase produces no commits).
- **Next step**: `feature-build` (or `feature-auto-build` in loop mode) to apply the 1-line type-union extension for B2, then re-submit feature-verify cycle 3.

#### 2026-05-26 00:15 — Extension-VERIFY-FEEDBACK-PATCH cycle 2: repair TS2322 type regression → READY_FOR_VERIFY

- **Executor**: claude-sonnet-4-6 — feature-build (verify-feedback patch cycle 2, `xai-roadmap-loop` SERIAL row #7)
- **Action**: Applied 1-line additive type fix to clear the B2 blocker reported by feature-verify cycle 2:
  - **B2** (`RouteErrorBoundary.tsx:6`): Extended `scope` prop union from `"root" | "auth" | "app" | "module"` to `"root" | "auth" | "app" | "module" | "oauth-callback"`. The component uses `scope` only for display (`<h1>Route Error ({scope})</h1>`) and as a label argument to `reportRouteError(scope, error)` — no conditional branching exists, so no branch entry was needed. Pure additive type widening; zero runtime behavior change.
  - Root cause: Extension-P3 commit 9cb9114 added `scope="oauth-callback"` to the router.tsx RouteErrorBoundary usage without extending the interface. The regression was masked at build time (Vite/esbuild does not enforce TS strict) and by cycle-1 verify not listing `check-types` as an explicit gate; cycle-2 verify caught it.
- **Tests**:
  - `pnpm --filter @repo/web check-types` → exit 0 (was exit 2 with TS2322 before fix)
  - `pnpm --filter @repo/web test` → 111/111 PASS (no regression)
  - `pnpm --filter @repo/web build` → SUCCEEDS
  - `pnpm --filter @repo/plugin-web-settings-rest lint --max-warnings 0` → exit 0 (no regression from cycle-1 patch)
- **Commits**: `bcefcc4` fix(apps/web): extend RouteErrorBoundary scope union to include 'oauth-callback' (verify B2 for row #7)
- **Lineage Status**: READY_FOR_VERIFY
- **Next step**: `feature-verify` cycle 3 — re-run independent verification with `check-types` gate confirmed passing.

#### 2026-05-26 00:18 — Extension-FEATURE_VERIFY cycle 3: verdict PASS → READY_TO_SHIP

- **Executor**: Claude Opus 4.7 (1M context) — feature-verify (re-verify cycle 3 after B2 patch)
- **Action**: Re-ran the 7 gates supplied by the cycle-3 dispatch against the 10 commits (85bf836 P1, 709bf19 P2, 9cb9114 P3, 1a11742 P4, 826149d P5, 218b0ae chore, 12a4464 lint patch, 5a2f503 docs, bcefcc4 type fix, 83d3363 docs).
  - **Gate 1 B2 re-check (web check-types)**: PASS. `pnpm --filter @repo/web check-types` → exit 0 (was exit 2 with TS2322 in cycle 2). `git show bcefcc4` confirms 1-line additive union extension at apps/web/src/routes/RouteErrorBoundary.tsx:6 — `"root" | "auth" | "app" | "module"` → `"root" | "auth" | "app" | "module" | "oauth-callback"`. No runtime behavior change.
  - **Gate 2 B1.a + B1.b still cleared**: PASS. `pnpm --filter @repo/plugin-web-settings-rest lint --max-warnings 0` → exit 0, 0 warnings. No regression from B2 patch (B2 only touched apps/web/, not plugin-web-settings-rest/).
  - **Gate 3 All test suites still pass**: PASS. plugin-web-settings-rest 154/154; plugin-web-storage 88/88; core 8/8; web 111/111. Total 361/361.
  - **Gate 4 Build**: PASS. `pnpm --filter @repo/web build` → SUCCESS in 2.69s. Confirmed `dist/_headers` includes all 3 OAuth token endpoints in connect-src (`api.notion.com`, `oauth2.googleapis.com`, `api.linear.app`); frame-src unchanged; frame-ancestors 'none' preserved.
  - **Gate 5 PKCE / CSP / EventMap / no-Math.random / no-localStorage guards**: PASS — all still hold. B2 patch only widened a UI type union in apps/web; no impact on row #7 OAuth core. PKCE RFC 7636 §B.1 vector test (PK5) inside 154/154 PASS; no-math-random + no-localStorage source-text guards inside no-math-random.test.ts (7 tests) PASS; CSP3 source-text guard inside web 111/111 PASS; 2 EventMap declarations preserved at packages/core/src/types/events.ts:371/379.
  - **Gate 6 No new BLOCKER candidates**: PASS. `pnpm --filter @repo/plugin-web-settings-rest check-types` → "no check-types script" (N/A per package design). `pnpm --filter @repo/plugin-web-storage check-types` → exit 0. `pnpm --filter @repo/core check-types` → exit 0.
  - **Gate 7 Patch hygiene**: PASS. bcefcc4 is single 1-line additive type widening (RouteErrorBoundary.tsx only); 83d3363 is dev_log-only docs flip. Both commit messages format-compliant (Why / What / Scope / Risk / Docs / Tests + Co-Authored-By). No scope creep.
- **Findings — BLOCKERS**: NONE. All 7 cycle-3 gates green.
- **Residual risks (non-blocking, ship-eligible)**:
  - **R5 (deferred to manual smoke)**: cross-vendor cold-read on `frame-src` could surface a 4th amendment requirement if any provider's authorize page is later observed embedding (currently all 3 set X-Frame-Options: DENY per discovery §3.3 evidence — verified at planning time, may re-confirm at ship-smoke).
  - **R6 (documented v1 limitation)**: provider-side OAuth grant not revoked on Disconnect — UI tooltip warns user; v1 stub-only constraint per HC3.
  - **P6 cross-vendor verify**: per test.md §5.8 + Extension-P6 [DEFERRED to feature-verify], the Codex `gpt-5.5-thinking medium` cold-read on PKCE correctness + no URL leakage + CSP minimality is recommended pre-ship; not gating per row #6 + W1/W2 precedent (deferrable up to 24h post-ship per ADR-0008 carve-out).
- **Tests**: as documented above — 361/361 pass, lint exit 0, web check-types exit 0, web build SUCCESS, all check-types gates green.
- **Commits**: — (verify phase produces no commits beyond this dev_log flip).
- **Next step**: `ship` — push 10 commits to remote, flip Lineage Status to SHIPPED, append to roadmap manifest as row #7 complete.


#### 2026-05-26 00:30 — SHIP: Lineage Status → SHIPPED (row #7 of xai-web-console-gap-closure, wave 2 second)

- **Executor**: claude-sonnet-4-6 — ship
- **Action**: Verified all 12 commits present on origin/main with clean working tree. Verified dev_log Lineage Status = READY_TO_SHIP. Verified all commit messages follow `type(scope): summary` convention with Why/What/Scope/Risk/Docs/Tests body + Co-Authored-By trailers. Flipped Lineage Status Panel to SHIPPED. Appended this Ship Report.
- **Commits shipped (12)**:
  - `85bf836` feat(xai-web-settings-integrations-3rd-party): P1 — PKCE helpers + state machine + 3 boolean prefs registration
  - `709bf19` feat(xai-web-settings-integrations-3rd-party): P2 — Connect button + authorize URL builder + same-tab navigation
  - `9cb9114` feat(xai-web-settings-integrations-3rd-party): P3 — CallbackPage + router wiring + 2 EventMap declarations
  - `1a11742` feat(xai-web-settings-integrations-3rd-party): P4 — Disconnect + Connected (stub) section + stub-mode banner + bilingual i18n
  - `826149d` feat(xai-web-settings-integrations-3rd-party): P5 — ADR-0008 §S3 D3 THIRD amendment + _headers connect-src extension + CSP3 source-text guard
  - `218b0ae` docs(xai-web-settings-integrations-3rd-party): flip dev_log Status → READY_FOR_VERIFY after P1..P5 complete
  - `12a4464` fix(xai-web-settings-integrations-3rd-party): repair 2 lint nits (verify B1.a + B1.b)
  - `5a2f503` docs(xai-web-settings-integrations-3rd-party): flip Lineage Status → READY_FOR_VERIFY (verify-feedback patch complete)
  - `bcefcc4` fix(apps/web): extend RouteErrorBoundary scope union to include 'oauth-callback' (verify B2)
  - `83d3363` docs(xai-web-settings-integrations-3rd-party): flip Lineage Status BLOCKED → READY_FOR_VERIFY after B2 patch
  - `e82ec23` docs(roadmap): xai-web-console-gap-closure row #7 READY_TO_SHIP — integrations OAuth PKCE stub
  - `0e9ca34` docs(xai-web-settings-integrations-3rd-party): commit row #7 plan docs (api §6 + design §2026-05-25 Ext + test §5 + lockfile)
- **Push timestamp**: 2026-05-26 (all 12 commits already on origin/main at ship gate entry — verified via `git log --oneline origin/main..HEAD` → no output)
- **Roadmap row reference**: `docs/workflow/roadmap/xai-web-console-gap-closure.md` row #7 (W2 · OAuth PKCE stub for 3 providers)
- **Deferred residual risks (non-blocking)**:
  - R5 `frame-src` cross-vendor confirm: cold-read on whether any of the 3 authorize pages could embed (all 3 currently set X-Frame-Options:DENY per discovery §3.3; may need 4th ADR-0008 amendment if observed in production smoke)
  - R6 provider-side OAuth grant not revoked on Disconnect: documented v1 stub limitation; UI tooltip warns user; full revocation requires token persistence (v2+)
  - P6 Codex cold-read (PKCE correctness + URL-leakage + CSP-minimality): deferred 24h post-ship per ADR-0008 §S3 carve-out consistent with W1/W2 precedent
- **Next step for row #8**: `xai-web-settings-premium-stripe` — now unblocked (row #7 SHIPPED satisfies row #8 gate per roadmap manifest)


---

## Bugfix-Extension Lineage — gap-closure row #8 (2026-05-26)

> APPEND-ONLY block. The Workflow State Panel + Phase Plan + Work Log +
> Commits + Blockers above (SHIPPED row #24 baseline + 2026-05-24 PR-2 drift
> reconciliation) AND the 2026-05-26 row #7 OAuth-stub Lineage block above
> are NOT mutated by this extension lineage. This block tracks a new
> feature-dev cycle introduced by the `xai-web-console-gap-closure` manifest
> row #8 (Gap 6b — Premium Pane Stripe Checkout stub).
>
> Note: a prior 2026-05-25 extension (gap-closure row #2 — AI LLM adapter)
> added `aiPane` to this package via the `packages/xai-web-ai-chat/docs/`
> design home (lineage block recorded there, not here). The 2026-05-26 row
> #7 (Integrations OAuth PKCE stub) lineage lives above. This row #8 is the
> second extension lineage block to live directly in this dev_log.

### Lineage Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-settings-premium-stripe |
| Title | Wire the Premium pane (currently a static placeholder — Star SVG + headline + body + no-op Upgrade button) with a real Stripe Checkout stub via Payment Link (same-tab redirect). v1 is stub-only — no Secret Key in client, no backend, no webhooks; the success-callback flips a client-side `xai_pref_premium_tier` flag and starts a 30-day client-clock timer; a `<PremiumTierBadge />` mounted in the xai-web-shell Topbar advertises the stubbed tier; a non-dismissible amber disclosure banner makes the v1-stub scope explicit; ADR-0008 §S3 D3 receives its FOURTH in-place amendment for 3 Stripe hostnames in `connect-src` (no `script-src` / `frame-src` widening). Establishes the redirect-callback pattern for a 3rd-party payment processor + the "no SK in bundle" guard pattern. |
| Current Phase | SHIPPED |
| Status | SHIPPED |
| Suggested Next | — (workflow complete) |
| Verify Cross-vendor | yes (per ADR-0009 §D4 P0 + roadmap header default; primary Codex `gpt-5.5-thinking medium`, fallback Cursor) |
| Automation Mode | A-Claude (per roadmap default inherited from xai-web-console.md 2026-05-23 user override) |
| Executor | claude-sonnet-4-6 — ship, 2026-05-26 |
| Updated | 2026-05-26 01:30 |
| Dispatched By | `xai-roadmap-loop` SERIAL dispatch — Wave 2 third row, after row #7 SHIPPED `5085a03` 2026-05-26 |
| Roadmap Row | `docs/workflow/roadmap/xai-web-console-gap-closure.md` row #8 (W2 · Premium Stripe Checkout stub) |
| Parent ADR | ADR-0009 §D2-G3 (P0 gap-closure; ≥5/9 known gaps SHIPPED to unblock P1 Desktop launch) |
| ADR Amendment | **ADR-0008 §S3 D3 — amend in-place (FOURTH amendment)** per row #2 + row #6 + row #7 binding precedents. Extend `connect-src` with 3 Stripe hostnames: `https://js.stripe.com`, `https://checkout.stripe.com`, `https://buy.stripe.com`. `script-src` and `frame-src` NOT widened — same-tab redirect via `window.location.assign`; no Stripe.js bundled (enforced by source-text guard); no Embedded Checkout in v1. Add row to Amendments frontmatter. Update §S6 `_headers` content snippet. Extend `apps/web/src/__tests__/csp.test.ts` (+1 case `CSP4` + 2 cleanliness assertions). |
| Concurrent Siblings | None (SERIAL dispatch — W2 row #9 PENDING per roadmap manifest; serial mode locks one row at a time) |
| Pattern Setter For | Future P1 paid-tier real-subscription rows (will reuse the callback URL pattern + tier-state hook + EventMap declaration); future client-only 3rd-party payment integrations |
| Write Scope | **planning phase (this run)**: `docs/reviews/xai-web-settings-premium-stripe/20260525-discovery-review.md` (NEW) + `packages/plugin-web-settings-rest/docs/{design.md, api.md, test.md, dev_log.md}` (APPEND-ONLY extension sections). **build phases (later)** extend to: `packages/plugin-web-settings-rest/src/{internal/premiumTier.ts, internal/usePremiumTier.ts, internal/usePremiumConfig.ts, internal/PremiumTierBadge.tsx, internal/premiumDisclosureBanner.tsx, internal/premiumUpgradeButton.tsx, internal/premiumCancelButton.tsx, CheckoutSuccessPage.tsx, CheckoutCancelPage.tsx} (NEW)` + `panes/premiumPane.tsx + internal/localI18n.ts + styles.css + index.ts (EDIT)` + ~11 new test files + 1 edited test file + `packages/plugin-web-storage/src/internal/registry.ts (EDIT, +2 prefs)` + `packages/plugin-web-storage/src/__tests__/parity-design-md.test.ts (EDIT, +2 exempt)` + `packages/core/src/types/events.ts (EDIT, +1 EventMap entry)` + `packages/xai-web-shell/src/Topbar.tsx (EDIT, +1 import + 1 JSX)` + `packages/xai-web-shell/src/__tests__/Topbar.test.tsx (EDIT, +1 case)` + `apps/web/src/routes/router.tsx (EDIT, +2 route children)` + `apps/web/src/routes/RouteErrorBoundary.tsx (EDIT, scope union widening +1 literal)` + `apps/web/public/_headers (EDIT, extend connect-src by 3 hostnames)` + `apps/web/src/__tests__/csp.test.ts (EDIT, +CSP4 case + 2 cleanliness assertions)` + `apps/web/deploy/README.md (NEW, env-var documentation)` + `docs/adr/0008-cloudflare-deploy-target-and-csp.md (EDIT, §S3 D3 FOURTH amendment + frontmatter row)` + `docs/PLUGIN_MAP.md (EDIT, append extension note to plugin-web-settings-rest row)`. |

### Artifacts Index (this extension)

- Seed brief: `docs/reviews/xai-web-settings-premium-stripe/20260524-roadmap-seed.md`
- Discovery review: `docs/reviews/xai-web-settings-premium-stripe/20260525-discovery-review.md`
- Design extension: `packages/plugin-web-settings-rest/docs/design.md` §"2026-05-26 Extension: Premium Pane Stripe Checkout Stub (gap-closure row #8)"
- API extension: `packages/plugin-web-settings-rest/docs/api.md` §7
- Test extension: `packages/plugin-web-settings-rest/docs/test.md` §6
- Dev log extension: `packages/plugin-web-settings-rest/docs/dev_log.md` (this block)

### Decision Headline (this extension)

Wire the Premium pane Upgrade button to a **Stripe Payment Link via same-tab redirect** — the only client-only HC3+HC4-compatible path post 2025-09-30 `stripe.redirectToCheckout` removal (discovery §3.1). v1 ships with:

1. **Payment Link URL via `VITE_STRIPE_PAYMENT_LINK_URL`** env var (per-environment; test in dev/preview, live in prod). Documented in new `apps/web/deploy/README.md`.
2. **Two new react-router routes** `/app/settings/premium/checkout/success` + `/app/settings/premium/checkout/cancel` (literal-path siblings of row #7's OAuth callback). `<CheckoutSuccessPage />` validates `?session_id=` presence (cannot validate against Stripe — no SK; presence + non-empty is sufficient) + flips `xai_pref_premium_tier` to `"premium_stub"` + sets `xai_pref_premium_started_at = Date.now()` + emits `web:premium:tier-changed` + green banner + navigates back in 2000ms. `<CheckoutCancelPage />` is idempotent — shows "Checkout cancelled — tier unchanged" banner + navigates back in 3000ms.
3. **`usePremiumTier()` hook** applies a 30-day client-clock filter on read (effective tier = stored tier filtered by `now - started_at < 30d`). Pure call-site evaluation — no setInterval, no setTimeout.
4. **`<PremiumTierBadge />`** exported from this package, mounted via 1-line edit in `packages/xai-web-shell/src/Topbar.tsx`. Returns `null` when effective tier is not `"premium_stub"`; otherwise renders OKLCH gold-tinted span.
5. **`<PremiumDisclosureBanner />`** rendered unconditionally at the top of the Premium pane in all 3 tier states. Non-dismissible. Amber OKLCH background. Bilingual.
6. **Cancel Subscription** button visible only when effective tier is `"premium_stub"`. Click flips both prefs back + emits event. NO fetch. NO Stripe API call. Tooltip warns user to manage payment at billing.stripe.com if real payment was made.
7. **ADR-0008 §S3 D3 FOURTH amendment** — extends `connect-src` with 3 Stripe hostnames. `script-src` / `frame-src` NOT widened. CSP4 source-text guard + 2 cleanliness assertions (script-src clean, frame-src absent).
8. **Two source-text guards** — `no-stripe-secret-key.test.ts` (zero `sk_test_` / `sk_live_` in src) + `no-stripe-js-bundle.test.ts` (zero `@stripe/stripe-js` or `https://js.stripe.com/` in src). Hard cross-vendor verify gates.
9. **1 new EventMap declaration** `web:premium:tier-changed` (declaration-only, no consumer in v1). Forward-compat hook for P1 feature-gating rows.
10. **2 new boolean/scalar prefs** in `plugin-web-storage` registry (`xai_pref_premium_tier` string + `xai_pref_premium_started_at` number) — labeled block at tail with FA-12 comment block "MUST NOT be interpreted as 'real subscription' by any other code path".

The 30-day timer is **client-clock based and easily defeated by clock manipulation** — documented as known v1 limitation in the disclosure banner (R4). Real subscription enforcement requires desktop client (P1) or a Worker layer (deferred per ADR-0008 D3 follow-up).

### Phase Plan (this extension)

#### Extension-P1 — Tier state machine + 2 prefs + `usePremiumTier()` hook + `usePremiumConfig()` env hook + tests [DONE]

**Scope:**
- `src/internal/premiumTier.ts` (NEW) — type `PremiumTier` + `PREMIUM_TIER_TTL_MS`
- `src/internal/usePremiumTier.ts` (NEW) — `usePremiumTier()` hook with 30-day filter + setTier emits event
- `src/internal/usePremiumConfig.ts` (NEW) — env var read + `configured` flag
- `packages/plugin-web-storage/src/internal/registry.ts` — +2 prefs in labeled block with FA-12 comment
- `packages/plugin-web-storage/src/__tests__/parity-design-md.test.ts` — +2 exempt keys
- Tests: `premiumTier.test.ts` (PT1..PT4), `usePremiumTier.test.tsx` (PHK1..PHK6), `usePremiumConfig.test.tsx` (PC-CONFIG-1/2/3), `registry-comment.test.ts` (PR-COMMENT-1)
- Suggested commit: `feat(xai-web-settings-premium-stripe): P1 — tier state machine + 2 prefs + usePremiumTier + usePremiumConfig hooks (gap-closure row #8)`

#### Extension-P2 — Upgrade button + Payment Link redirect + env-var disabled fallback + tests [DONE]

**Scope:**
- `src/internal/premiumUpgradeButton.tsx` (NEW) — wraps Upgrade CTA; click calls `window.location.assign(paymentLinkUrl)`; disabled with tooltip when env empty
- `src/internal/localI18n.ts` (EDIT) — add 14 bilingual entries (banner + badge + button labels + callback statuses) early to unblock P3+P4 bilingual tests
- `src/styles.css` (EDIT) — `.premium-upgrade-btn` styling (OKLCH)
- Tests: `premiumUpgradeButton.test.tsx` (PUB-1..PUB-4 + PUB-NO-FETCH-1)
- Suggested commit: `feat(xai-web-settings-premium-stripe): P2 — Upgrade button + Payment Link redirect + env-var disabled fallback (gap-closure row #8)`

#### Extension-P3 — CheckoutSuccessPage + CheckoutCancelPage + EventMap + router + RouteErrorBoundary scope extension + tests [DONE]

**Scope:**
- `src/CheckoutSuccessPage.tsx` (NEW) — validate session_id presence + flip tier + emit event + banner + navigate
- `src/CheckoutCancelPage.tsx` (NEW) — idempotent banner + navigate
- `src/index.ts` (EDIT) — export `{ CheckoutSuccessPage, CheckoutCancelPage }`
- `packages/core/src/types/events.ts` (EDIT) — +1 EventMap declaration `web:premium:tier-changed`
- `apps/web/src/routes/router.tsx` (EDIT) — +2 route children (literal paths before `:moduleId/*`, scope="premium-checkout")
- `apps/web/src/routes/RouteErrorBoundary.tsx` (EDIT) — extend scope union: + `"premium-checkout"` (additive type widening; same pattern as row #7's B2 verify-cycle patch)
- `apps/web/src/routes/router.integration.test.tsx` (EDIT) — +RR-PREMIUM-1/2 cases
- Tests: `CheckoutSuccessPage.test.tsx` (CS1..CS8 + CS-INVALID-1 + CS-NO-FETCH-1), `CheckoutCancelPage.test.tsx` (CC1..CC4 + CC-DIRECT-1 + CC-NO-FETCH-1), core events test (EV3)
- Suggested commit: `feat(xai-web-settings-premium-stripe): P3 — Checkout success/cancel pages + router wiring + RouteErrorBoundary scope union extension + 1 EventMap declaration (gap-closure row #8)`

#### Extension-P4 — Cancel Subscription + PremiumTierBadge + Topbar 1-line edit + disclosure banner + tier-aware pane copy + tests [DONE]

**Scope:**
- `src/internal/premiumCancelButton.tsx` (NEW) — flip tier + emit event; visible only when effective tier=premium_stub
- `src/internal/premiumDisclosureBanner.tsx` (NEW) — non-dismissible amber banner; bilingual
- `src/internal/PremiumTierBadge.tsx` (NEW) — exported component for Topbar; reads `usePremiumTier()` internally; returns null when not premium_stub
- `src/panes/premiumPane.tsx` (EDIT) — replace static placeholder with: disclosure banner + tier-aware current-tier label + Upgrade button + Cancel button + activated-on date display (when premium_stub); PR1..3 preserved verbatim
- `src/index.ts` (EDIT) — export `{ PremiumTierBadge }` + type `PremiumTier`
- `src/styles.css` (EDIT) — +premium-disclosure-banner + premium-tier-badge + premium-cancel-btn + premium-pane CSS (all OKLCH)
- `packages/xai-web-shell/src/Topbar.tsx` (EDIT) — +1 import + 1 JSX placement of `<PremiumTierBadge />` at left end of `topbar-controls`
- `packages/xai-web-shell/src/__tests__/Topbar.test.tsx` (EDIT) — +1 case TB-PREMIUM-1
- `packages/xai-web-shell/package.json` (EDIT, if needed) — add `@repo/plugin-web-settings-rest` to peerDependencies
- Tests: `premiumCancelButton.test.tsx` (PCANCEL-1..3 + PCANCEL-NO-FETCH-1 + PCANCEL-TOOLTIP-1), `premiumDisclosureBanner.test.tsx` (PB-BANNER-1..3), `PremiumTierBadge.test.tsx` (PCB-1/2), `premiumPane.test.tsx` (PR1..3 preserved + PT-EXT-1..6)
- Suggested commit: `feat(xai-web-settings-premium-stripe): P4 — Cancel Subscription + PremiumTierBadge + Topbar 1-line edit + disclosure banner + bilingual pane (gap-closure row #8)`

#### Extension-P5 — ADR-0008 §S3 D3 FOURTH amendment + _headers + CSP4 + no-SK guard + no-stripe-js guard + env-var docs + PLUGIN_MAP [DONE]

**Scope:**
- `docs/adr/0008-cloudflare-deploy-target-and-csp.md` (EDIT) — add Amendments frontmatter row + §S3 D3 amendment block + §S6 `_headers` snippet update + binding-precedent rule preserved
- `apps/web/public/_headers` (EDIT) — extend `connect-src` with 3 Stripe hostnames; `script-src` + `frame-src` unchanged
- `apps/web/src/__tests__/csp.test.ts` (EDIT) — +CSP4 case + CSP4-SCRIPT-SRC-CLEAN + CSP4-FRAME-SRC-CLEAN
- `src/__tests__/no-stripe-secret-key.test.ts` (NEW) — source-text guard
- `src/__tests__/no-stripe-js-bundle.test.ts` (NEW) — source-text guard
- `apps/web/deploy/README.md` (NEW) — env-var documentation (VITE_STRIPE_PAYMENT_LINK_URL setup, runbook for rotation + dev→prod switch + Payment Link Stripe-dashboard configuration steps)
- `docs/PLUGIN_MAP.md` (EDIT) — append `(Extension 2026-05-26 — Premium Stripe Checkout stub gap-closure row #8)` to plugin-web-settings-rest row
- Verify: `pnpm --filter @repo/web build` + `pnpm --filter @repo/web test` + `pnpm --filter @repo/web check-types` all pass
- Suggested commit: `feat(xai-web-settings-premium-stripe): P5 — ADR-0008 §S3 D3 FOURTH amendment + _headers connect-src extension + CSP4 + no-SK + no-stripe-js source-text guards + env-var docs (gap-closure row #8)`

#### Extension-P6 — Cross-vendor verify checklist (owned by feature-verify) [DEFERRED to feature-verify]

**Scope:**
- No-SK in bundle cold-read (Codex `gpt-5.5-thinking medium`)
- No Stripe.js bundled cold-read
- Disclosure banner unmissable cold-read
- CSP minimality cold-read (3 entries; no wildcard; script-src clean; frame-src absent)
- No real network cold-read (zero fetch in any premium code path)
- 30-day timer purity cold-read (no setInterval / no setTimeout / no fetch)
- Manual smoke (real Upgrade click → Stripe Checkout test page → return → badge visible; cancel via back → tier unchanged; clock-rewind → badge gone). May be deferred 24h per ADR-0008 carve-out consistent with W1/W2 precedent.

### Risk Register (per discovery §6)

R1 `VITE_STRIPE_PAYMENT_LINK_URL` env not set → Upgrade button disabled with tooltip + PC-CONFIG-1/2 tests.
R2 SK accidentally checked into client source → `no-stripe-secret-key.test.ts` source-text guard (zero `sk_test_` / `sk_live_`).
R3 Stripe.js accidentally bundled → `no-stripe-js-bundle.test.ts` source-text guard (zero `@stripe/stripe-js` / `https://js.stripe.com/` import).
R4 30-day client-clock easily defeated → documented v1 limitation in disclosure banner; not a billing path.
R5 Direct callback URL hit without prior Upgrade → CheckoutSuccessPage requires `?session_id=` presence; CheckoutCancelPage is idempotent.
R6 xai-web-shell Topbar edit breaks existing tests → additive 1 import + 1 JSX edit; 6 existing tests preserved; TB-PREMIUM-1 added.
R7 Disclosure banner missed → non-dismissible + amber OKLCH + present in all 3 tier states + PB-BANNER-1/2/3 tests.
R8 Downstream code misreads premium_stub as real subscription → registry comment + api.md §7.7 + FA-12 + PR-COMMENT-1 test.
R9 CSP3 accidentally narrowed when adding CSP4 → both CSP3 + CSP4 cases run; source-text greps independent.
R10 Payment Link URL revoked in Stripe dashboard → operator runbook in apps/web/deploy/README.md.
R11 Topbar badge CSS conflict → scoped CSS class + manual smoke at ship-time.

### Work Log (this extension)

#### 2026-05-26 — Extension-FEATURE_PLAN: discovery + design/api/test/dev_log extension blocks

- **Executor**: Claude Opus 4.7 (1M context) — feature-plan
- **Action**:
  - Read seed brief + roadmap row #8 + SHIPPED design/api/test/dev_log (including 2026-05-26 row #7 extension lineage block) + `panes/premiumPane.tsx` (current static placeholder) + `panes/integrationsPane.tsx` (as reference for pattern: stub-banner + tier-aware section + Cancel button + bilingual i18n) + `CallbackPage.tsx` (row #7 — as reference for query-param parsing + setTimeout-navigate + emit event + invalid-state path) + `internal/integrationStubBanner.tsx` (banner pattern) + `internal/oauthState.ts` (sessionStorage pattern — NOT used in row #8, captured for contrast) + `internal/integrationProviders.ts` (provider config pattern) + plugin-web-storage `registry.ts` (read all 40+1 keys + 3 row-#7 prefs for context) + ADR-0008 §S3 D3 (3 prior amendments — Anthropic / OSM / OAuth) + `_headers` (current connect-src) + `csp.test.ts` (CSP1/CSP2/CSP3) + `router.tsx` (row #7 OAuth callback child route + RouteErrorBoundary "oauth-callback" scope literal) + `Topbar.tsx` (target for `<PremiumTierBadge />` integration) + core EventMap (rows #7 declarations) + apps/web/.env.local (no precedent for `VITE_STRIPE_*` — first row to introduce them) + PLUGIN_MAP plugin-web-settings-rest row (already has row #7 extension note).
  - Performed 3 WebSearches for current Stripe Payment Link / embedded vs redirect / CSP requirements; sources recorded in discovery §7. Key findings: `stripe.redirectToCheckout` removed 2025-09-30 → must use Payment Link; same-tab redirect needs only defensive `connect-src` widening (3 hostnames), NOT `script-src` or `frame-src`; Payment Link supports `{CHECKOUT_SESSION_ID}` substitution + dashboard-configured `after_completion.redirect.url`; no native cancel_url (we add a cancel route for symmetry).
  - Wrote discovery review: `docs/reviews/xai-web-settings-premium-stripe/20260525-discovery-review.md` (15 sections; 6 axis options analysis; 11 risks; 6 phases; 15 frozen assumptions; 9 acceptance signals mapped; 3 informational open questions; rollback path).
  - APPENDED extension sections to `design.md` (§"2026-05-26 Extension: Premium Pane Stripe Checkout Stub (gap-closure row #8)" — 15 frozen assumptions + component graph + state machine + i18n delta + 11 risks one-line summary).
  - APPENDED §7 to `api.md` (13 sub-sections covering exports, PremiumTier type/constants, usePremiumTier hook, usePremiumConfig hook, PremiumTierBadge component, i18n keys, prefs, EventMap, route declarations, Topbar integration, error semantics, CSP impact, env-var contract).
  - APPENDED §6 to `test.md` (8 sub-sections covering env, mocks, full ~40-case test matrix in 5 phases, mock surface area, acceptance criteria, no-SK source-text guard, no-stripe-js-bundle source-text guard, cross-vendor verify checklist).
  - APPENDED "## Bugfix-Extension Lineage — gap-closure row #8 (2026-05-26)" block to this `dev_log.md` (Status Panel + Decision Headline + 6-phase plan + R1..R11 risks + this Work Log entry).
  - SHIPPED Status Panel + Phase Plan + Work Log + Commits + Blockers sections of row #24 (W4b) + 2026-05-26 row #7 Lineage block preserved verbatim per HC10.
- **Tests**: planning phase — no test execution (deferred to feature-build phases)
- **Commits**: — (planning phase produces docs only)
- **Next step**: `feature-review` to validate plan; expected verdict APPROVED or REVISE.

#### 2026-05-26 — Extension-FEATURE_REVIEW: review verdict APPROVED

- **Executor**: Claude Opus 4.7 (1M context) — feature-review (xai-roadmap-loop SERIAL row #8)
- **Action**: Validated planning artifacts (discovery review §1–§15 + design.md §"2026-05-26 Extension: Premium Pane Stripe Checkout Stub" + api.md §7.1–7.13 + test.md §6.1–6.8 + this dev_log lineage block) against the 13 review gates supplied by `xai-roadmap-loop` SERIAL dispatch.
  - **Gate 1 Scope sanity (5 acceptance signals)**: PASS. All 5 acceptance signals covered (Upgrade→Stripe via FA-2 + Phase P2; success-callback flips tier + gold badge via FA-3 + FA-6 + Phase P3+P4; Cancel checkout idempotent via FA-3 + CC-DIRECT-1; "Cancel Subscription" → free via FA-7 + PCANCEL-1..3; 154 settings-rest tests preserved + cross-vendor verify in test.md §6.8). ✓
  - **Gate 2 HC compliance (12 HCs — 9 seed + 3 session)**: PASS.
    - HC1 (redirect vs embedded): A1 Payment Link same-tab redirect chosen with sound reasoning §3.1 (redirectToCheckout removed 2025-09-30 → Payment Link is only client-only path). ✓
    - HC2 (PK via VITE_STRIPE_* env): documented in api.md §7.13 + new apps/web/deploy/README.md (P5); usePremiumConfig reads import.meta.env.VITE_STRIPE_PAYMENT_LINK_URL. ✓
    - HC3 (NO SK in client — CRITICAL): no SK anywhere; hard-coded Payment Link URL per env var; source-text guard TT-NO-SK enforces zero `sk_test_`/`sk_live_`. ✓
    - HC4 (single plan v1): single VITE_STRIPE_PAYMENT_LINK_URL, no plan picker. ✓
    - HC5 (Gold badge + 30-day timer-based reversion disclosed): PremiumTierBadge (PCB-1/2) + 30-day E1 pure read-side filter (PHK3) + disclosure banner (PB-BANNER-1..3) + R4 documented. ✓
    - HC6 (CSP extends connect-src + frame-src if embedded): A1=redirect mode → connect-src +3 only; NO frame-src widening (CSP4-FRAME-SRC-CLEAN guard); NO script-src widening (CSP4-SCRIPT-SRC-CLEAN guard). ✓
    - HC7 (Cancel Subscription clears tier to free): PCANCEL-1 + flips both prefs + emits event. ✓
    - HC8 (Disclosure banner mandatory + unmissable): non-dismissible (no close button — PB-BANNER-3), rendered unconditionally in all 3 tier states (PT-EXT-4), amber OKLCH styling distinct from row #7 neutral. ✓
    - HC9 (P0 + cross-vendor verify): test.md §6.8 enumerates 6-item Codex cold-read. ✓
    - HC10 (Append-only dev_log lineage — both prior blocks preserved): row #24 SHIPPED panel + 2026-05-26 row #7 Lineage block both preserved verbatim above this row #8 block. ✓
    - HC11 (Step 0 brief is input): seed brief `20260524-roadmap-seed.md` referenced in §Artifacts Index. ✓
    - HC12 (ADR-0008 FOURTH in-place amend per binding precedent): FA-10 + P5 scope; frontmatter amendments row added; §S6 _headers updated; §S3 D3 amendment block; CSP4 source-text guard mirrors row #2/#6/#7 pattern. ✓
  - **Gate 3 Architectural fit**: events via xai-web-event-bus (web:premium:tier-changed declared in core/types/events.ts + emitted from setTier + callback) ✓; persistence via xai-web-persistence-contract (2 new prefs in registry.ts labeled block with FA-12 comment) ✓; NO @tauri-apps/api ✓; F1 gold-badge cross-package edit is minimal (1 import + 1 JSX in xai-web-shell Topbar.tsx — confirmed via FA-6 + R6) ✓
  - **Gate 4 PLUGIN_MAP consistency**: NO new package row; P5 appends `(Extension 2026-05-26 — Premium Stripe Checkout stub gap-closure row #8)` to existing plugin-web-settings-rest row + xai-web-shell row gets minor edit annotation. ✓
  - **Gate 5 NO SK guard (source-text test)**: TT-NO-SK in test.md §6.5 + §6.7.1 walks `src/**/*.{ts,tsx}` greppinng `sk_test_` and `sk_live_` (both zero); §6.8 cross-vendor item #1 mirrors at bundle level (dist/**/*.js scan). ✓
  - **Gate 6 CSP scope reasoning (B1)**: discovery §3.3 + §5 axis B explicitly justify connect-src-only widening — redirect = no Stripe.js loaded → no script-src needed; no iframe → no frame-src needed; only check-tier API calls / form posts to Checkout → connect-src only with defensive 3-hostname allowlist. Reasoning sound. ✓
  - **Gate 7 Test strategy reality check**: 154 settings-rest (PR1..3 preserved verbatim per FA-14) + 88 storage (PR-EXT-8 +2 exempt) + 111 web (CSP4 + CSP4-SCRIPT-SRC-CLEAN + CSP4-FRAME-SRC-CLEAN + RR-PREMIUM-1/2) + ~40 new tests covering tier transitions (PHK1..6) + query-param parsing (CS1..8 + CS-INVALID-1) + 30-day timer (PHK3) + disclosure banner (PB-BANNER-1..3) + no-SK guard (TT-NO-SK) + no-stripe-js guard (TT-NO-STRIPE-JS) + CSP4 source-text guard. Acceptance criterion line 422 enumerates exact ~40 test count. ✓
  - **Gate 8 Phase granularity (6 phases)**: P1 (tier state + 2 prefs + 2 hooks), P2 (Upgrade button + Payment Link redirect), P3 (Success/Cancel pages + router + RouteErrorBoundary scope union + EventMap), P4 (Cancel button + PremiumTierBadge + Topbar 1-line + disclosure banner + i18n), P5 (ADR FOURTH amend + _headers + CSP4 + 2 source-text guards + env-var docs + PLUGIN_MAP), P6 (cross-vendor verify owned by feature-verify). Each P1..P5 is implementable as one feature-build run with clear file boundaries + dedicated commit message. ✓
  - **Gate 9 Risk register (11 risks — exceeds 5 baseline)**: R1 env-missing (PC-CONFIG-1/2 disabled-button fallback), R2 SK leak (TT-NO-SK source-text guard), R3 Stripe.js bundled (TT-NO-STRIPE-JS), R4 30-day clock-rewind (documented v1 limitation in disclosure banner), R5 direct callback URL (?session_id presence check CS-INVALID-1 + idempotent cancel CC-DIRECT-1), R6 Topbar edit breaks tests (additive 1 import + 1 JSX; TB-PREMIUM-1 added), R7 banner missed (non-dismissible + amber + 3 tier states PB-BANNER-1..3), R8 cross-code flag misread (FA-12 comment + PR-COMMENT-1), R9 CSP3 narrowed (CSP3+CSP4 both run), R10 Payment Link revoked (runbook in apps/web/deploy/README.md), R11 Topbar CSS conflict (scoped class + manual smoke). Each has concrete mitigation. ✓
  - **Gate 10 F1 cross-package minimal**: confirmed FA-6 — 1 import line + 1 JSX `<PremiumTierBadge />` placement at left end of Topbar `topbar-controls`; component lives entirely inside plugin-web-settings-rest; xai-web-shell tests gain exactly 1 case (TB-PREMIUM-1). NOT a shell refactor. ✓
  - **Gate 11 Disclosure banner placement**: discovery §4.1 + FA-8 — non-dismissible, rendered unconditionally at top of Premium pane in all 3 tier states (free, pending, premium_stub), bilingual, amber OKLCH `oklch(75% 0.15 85)` distinct from row #7 neutral banner. Q1 confirms amber tone defaults. PT-EXT-4 + PB-BANNER-1..3 tests gate unmissability. ✓
  - **Gate 12 30-day timer drift documentation**: R4 explicitly documents "client-clock based and easily defeated by clock manipulation" as known v1 limitation; disclosure banner text "v1 Premium is a UX preview" addresses user-facing communication; not a billing path so no real value at risk. ✓
  - **Gate 13 Cross-vendor verify focus**: test.md §6.8 enumerates 6 Codex cold-read items — (a) no SK in bundle (dist + src), (b) Stripe.js CDN-only / NOT bundled (TT-NO-STRIPE-JS source guard + dist scan), (c) disclosure banner unmissable (JSX inspection + CSS contrast + 3 tier states), (d) CSP minimality (3 entries; no wildcard; CSP4-SCRIPT-SRC-CLEAN + CSP4-FRAME-SRC-CLEAN), (e) no real network in any premium path (zero fetch), (f) 30-day timer purity (no setInterval / no setTimeout / no fetch). Items (a)+(c) are HC9 hard gates. ✓
- **Findings**: 0 blockers. 3 informational recommendations to surface during feature-auto-build:
  1. **Q1 amber banner tone (informational)**: Discovery §11 leaves the exact OKLCH amber/gold value to feature-build P4 default `oklch(75% 0.15 85)`. Sound default; not blocking.
  2. **Q2 badge text locked**: "Premium (stub)" / "高级版（演示）" — matches row #7 "Connected (stub)" pattern. Not blocking.
  3. **Q3 session_id validation**: v1 trusts presence only (cannot validate without SK); CS-INVALID-1 covers empty/missing case; documented as v1 stub trust model. Sound.
  - **Pre-existing observation (non-blocking)**: row #7's verify cycle 2 surfaced that apps/web/src/routes/RouteErrorBoundary.tsx requires `scope` union widening when new route children use a novel scope literal. P3 scope explicitly includes RouteErrorBoundary union extension (+ `"premium-checkout"`) avoiding the same regression — good plan-side defensive lesson incorporated.
- **Tests**: review phase — no test execution
- **Commits**: — (review phase produces docs only)
- **Next step**: `feature-auto-build` (per Automation Mode A-Claude + dispatched by `xai-roadmap-loop` SERIAL); will execute P1..P5 sequentially with per-phase commit + stop before feature-verify per workflow contract.

#### 2026-05-26 00:50 — Extension-P1: Tier state machine + 2 prefs + usePremiumTier + usePremiumConfig hooks

- **Executor**: claude-sonnet-4-6 (feature-auto-build)
- **Action**: Created `src/internal/premiumTier.ts` (PremiumTier type + PREMIUM_TIER_TTL_MS constant). Created `src/internal/usePremiumTier.ts` (30-day TTL filter on `xai_pref_premium_tier` + `xai_pref_premium_started_at`; pure read-side; no setInterval/fetch). Created `src/internal/usePremiumConfig.ts` (reads VITE_STRIPE_PAYMENT_LINK_URL via import.meta.env; returns `configured: false` when absent/empty/whitespace). Added 2 new prefs to `packages/plugin-web-storage/src/internal/registry.ts` in labeled row-#8 block with FA-12 warning comment (xai_pref_premium_tier: string codec default "free"; xai_pref_premium_started_at: number codec default 0). Updated parity-design-md.test.ts (+2 exempt keys) and registry.test.ts OWNER_ROW_ADDITIONS (+2 keys). Created premiumTier.test.ts (PT1..PT4), usePremiumTier.test.tsx (PHK1..PHK6), usePremiumConfig.test.tsx (PC-CONFIG-1/2/3). Fixed localStorage encoding issue: string codec stores raw string (not JSON-encoded) — test writes `"premium_stub"` not `'"premium_stub"'`. Fixed vi.stubEnv in usePremiumConfig by simplifying env read.
- **Tests**: 167/167 plugin-web-settings-rest PASS; 88/88 plugin-web-storage PASS
- **Commits**: `0a17b3e` feat(xai-web-settings-premium-stripe): P1 — tier state machine + 2 prefs + usePremiumTier + usePremiumConfig hooks (gap-closure row #8)
- **Next step**: P2

#### 2026-05-26 00:55 — Extension-P2: Upgrade button + Payment Link redirect + env-var disabled fallback

- **Executor**: claude-sonnet-4-6 (feature-auto-build)
- **Action**: Created `src/internal/premiumUpgradeButton.tsx` (PremiumUpgradeButton component; reads usePremiumConfig + usePremiumTier; disabled with tooltip when env var absent; click sets tier to "pending" then calls window.location.assign(paymentLinkUrl); no fetch). Added 14 bilingual i18n entries to `src/internal/localI18n.ts` early (premium.* namespace: badge, banner, buttons, callback statuses, tier labels). Added `.premium-upgrade-btn`, `.premium-disclosure-banner`, `.premium-tier-badge`, `.premium-cancel-btn`, `.premium-tier-row`, `.premium-cb-page`, `.premium-cb-banner` CSS rules to `src/styles.css` (all OKLCH, no hex). Created premiumUpgradeButton.test.tsx (PUB-1..PUB-4 + PUB-NO-FETCH-1).
- **Tests**: 172/172 plugin-web-settings-rest PASS
- **Commits**: `43ba9c9` feat(xai-web-settings-premium-stripe): P2 — Upgrade button + Payment Link redirect + env-var disabled fallback (gap-closure row #8)
- **Next step**: P3

#### 2026-05-26 00:57 — Extension-P3: CheckoutSuccessPage + CheckoutCancelPage + EventMap + router + RouteErrorBoundary scope extension

- **Executor**: claude-sonnet-4-6 (feature-auto-build)
- **Action**: Created `src/CheckoutSuccessPage.tsx` (reads `?session_id=` via useSearchParams; validates presence + non-empty; flips tier to "premium_stub" + sets started_at = Date.now(); emits web:premium:tier-changed {previous, current, changedAt}; green banner; navigate after 2000ms; no fetch; no SK). Created `src/CheckoutCancelPage.tsx` (idempotent; amber cancelled banner; navigate after 3000ms; no tier mutation; no fetch). Updated `src/index.ts` to export { CheckoutSuccessPage, CheckoutCancelPage }. Added `web:premium:tier-changed` EventMap declaration to `packages/core/src/types/events.ts` (declaration-only). Updated `apps/web/src/routes/router.tsx`: added 2 literal-path route children (settings/premium/checkout/success + cancel) BEFORE :moduleId/*; scope="premium-checkout". Extended `apps/web/src/routes/RouteErrorBoundary.tsx` scope union +`"premium-checkout"` (additive; DEFENSIVE — same lesson as row #7 cycle-2 B2). Added RR-PREMIUM-1/2 to router.integration.test.tsx. Created CheckoutSuccessPage.test.tsx (CS1..CS8 + CS-INVALID-1 + CS-NO-FETCH-1) + CheckoutCancelPage.test.tsx (CC1..CC4 + CC-DIRECT-1 + CC-NO-FETCH-1). Fixed timer ordering: vi.advanceTimersByTime(100) instead of vi.runAllTimers() to trigger useEffect without advancing 2000ms navigation timer.
- **Tests**: 188/188 plugin-web-settings-rest PASS; 113/113 web PASS; check-types exit 0
- **Commits**: `38dde2d` feat(xai-web-settings-premium-stripe): P3 — Checkout success/cancel pages + router wiring + RouteErrorBoundary scope union extension + 1 EventMap declaration (gap-closure row #8)
- **Next step**: P4

#### 2026-05-26 01:00 — Extension-P4: Cancel Subscription + PremiumTierBadge + Topbar render-prop + disclosure banner + bilingual pane

- **Executor**: claude-sonnet-4-6 (feature-auto-build)
- **Action**: Created `src/internal/premiumCancelButton.tsx` (returns null when tier != premium_stub; click emits web:premium:tier-changed then flips prefs to "free"/0; no fetch; tooltip warns re billing.stripe.com). Created `src/internal/premiumDisclosureBanner.tsx` (non-dismissible amber banner; bilingual; no close button — PB-BANNER-3 gate). Created `src/internal/PremiumTierBadge.tsx` (returns null when tier != "premium_stub"; renders gold OKLCH span; data-testid="premium-tier-badge"; exported from index.ts). Rewrote `src/panes/premiumPane.tsx`: replaced static placeholder with PremiumDisclosureBanner (unconditional) + tier label + PremiumUpgradeButton (free/pending) + PremiumCancelButton (premium_stub) + activated-on date display; PR1..PR3 preserved verbatim. Updated `src/index.ts` exports (+CheckoutSuccessPage, CheckoutCancelPage, PremiumTierBadge + type PremiumTier). CIRCULAR DEP FIX: added `premiumBadge?: ReactNode` render-prop to ShellProps + TopbarProps in `packages/xai-web-shell/src/types.ts`; Shell.tsx passes to Topbar; Topbar renders at left end of topbar-controls with no direct cross-package import; `apps/web/src/App.tsx` imports PremiumTierBadge and passes `premiumBadge={<PremiumTierBadge lang={lang} />}` to Shell. Added TB-PREMIUM-1 to xai-web-shell Topbar.test.tsx. Created premiumCancelButton.test.tsx (PCANCEL-1..3 + NO-FETCH + TOOLTIP), premiumDisclosureBanner.test.tsx (PB-BANNER-1..3), PremiumTierBadge.test.tsx (PCB-1/2), updated premiumPane.test.tsx (PR1..3 preserved + PT-EXT-1..6).
- **Tests**: 204/204 plugin-web-settings-rest PASS; 88/88 storage PASS; 86/86 xai-web-shell PASS; 113/113 web PASS; check-types exit 0 (all)
- **Commits**: `7210a93` feat(xai-web-settings-premium-stripe): P4 — Cancel Subscription + PremiumTierBadge + Topbar render-prop + disclosure banner + bilingual pane (gap-closure row #8)
- **Next step**: P5

#### 2026-05-26 01:04 — Extension-P5: ADR-0008 §S3 D3 FOURTH amendment + _headers + CSP4 + source-text guards + env-var docs

- **Executor**: claude-sonnet-4-6 (feature-auto-build)
- **Action**: Extended `apps/web/public/_headers` connect-src +3 Stripe hostnames (js.stripe.com, checkout.stripe.com, buy.stripe.com); script-src + frame-src unchanged. Added FOURTH amendment block to `docs/adr/0008-cloudflare-deploy-target-and-csp.md` §S3 D3 (frontmatter Amendments row + amendment section + §S6 _headers snippet updated). Added CSP4 (3 Stripe hostnames), CSP4-SCRIPT-SRC-CLEAN (script-src clean), CSP4-FRAME-SRC-CLEAN (frame-src absent) test cases to `apps/web/src/__tests__/csp.test.ts`. Created `src/__tests__/no-stripe-secret-key.test.ts` (TT-NO-SK-1/2: regex /sk_test_[A-Za-z0-9]/ and /sk_live_[A-Za-z0-9]/ — matches real keys only, not comment documentation). Created `src/__tests__/no-stripe-js-bundle.test.ts` (TT-NO-STRIPE-JS-1: import statement pattern; TT-NO-STRIPE-JS-2: CDN URL). Created `apps/web/deploy/README.md` operator runbook (Payment Link setup, Stripe dashboard steps, rotation, test vs live mode, CSP context, v1 stub disclosure). Updated `docs/PLUGIN_MAP.md` (plugin-web-settings-rest +row #8 note; xai-web-shell +render-prop annotation). Added `VITE_STRIPE_PAYMENT_LINK_URL` to turbo.json globalEnv (fixes turbo/no-undeclared-env-vars lint warning). Removed unused `vi` import from usePremiumTier.test.tsx (lint nit).
- **Tests**: 208/208 plugin-web-settings-rest PASS; 88/88 storage PASS; 116/116 web PASS; lint --max-warnings 0 exit 0; check-types exit 0; build succeeds
- **Commits**: `8f1a269` feat(xai-web-settings-premium-stripe): P5 — ADR-0008 §S3 D3 FOURTH amendment + _headers connect-src extension + CSP4 + no-SK + no-stripe-js source-text guards + env-var docs (gap-closure row #8)
- **Next step**: feature-verify

#### 2026-05-26 01:16 — Extension-FEATURE_VERIFY: verdict PASS → READY_TO_SHIP

- **Executor**: Claude Opus 4.7 (1M context) — feature-verify (xai-roadmap-loop SERIAL row #8)
- **Action**: Re-ran the 12 cycle-0 gates supplied by `xai-roadmap-loop` SERIAL dispatch against the 6 phase + chore commits (0a17b3e P1, 43ba9c9 P2, 38dde2d P3, 7210a93 P4, 8f1a269 P5, b42d862 chore).
  - **Gate 1 Plan compliance**: PASS. Each phase commit message + diff matches plan exactly. P1 = tier state + 2 prefs + 2 hooks (+337 lines, 9 files). P2 = upgrade button + Payment Link redirect + 14 i18n + OKLCH CSS (+293 lines, 4 files). P3 = success/cancel pages + router + RouteErrorBoundary scope union extension (PREEMPTIVE per row #7 cycle-2 lesson) + 1 EventMap (+465 lines, 9 files). P4 = cancel button + PremiumTierBadge + render-prop circular-dep fix + disclosure banner + bilingual pane (+421 lines, 14 files). P5 = ADR-0008 §S3 D3 FOURTH amendment + _headers + CSP4 + no-SK + no-stripe-js source-text guards + env-var docs (+378 lines, 9 files). Commit b42d862 = docs-only chore (plan + Work Log persistence + Lineage flip). No scope creep within any commit.
  - **Gate 2 HC re-check (all 12 HCs)**: PASS.
    - HC1 (Payment Link same-tab redirect, no Stripe.js, no iframe): `window.location.assign(paymentLinkUrl)` in premiumUpgradeButton.tsx; no @stripe/stripe-js import; no embedded iframe; CSP4-FRAME-SRC-CLEAN. ✓
    - HC2 (PK via VITE_STRIPE_* env, docs): usePremiumConfig reads `import.meta.env.VITE_STRIPE_PAYMENT_LINK_URL`; `apps/web/deploy/README.md` documents rotation + test vs live + Stripe dashboard steps; turbo.json globalEnv includes the var. ✓
    - HC3 (NO SK in client — CRITICAL): TT-NO-SK source-text guard `no-stripe-secret-key.test.ts` uses regex `/sk_test_[A-Za-z0-9]/` + `/sk_live_[A-Za-z0-9]/` walking all `.ts/.tsx` under `src/**`. 0 matches in src; 0 matches in `dist/**` (independently verified via `grep -rc "sk_(test|live)_[A-Za-z0-9]" dist`). Both real-key patterns (test + live) covered. ✓
    - HC4 (single plan v1): single `VITE_STRIPE_PAYMENT_LINK_URL` env var; no plan picker UI. ✓
    - HC5 (Gold badge + 30-day reversion as pure read-side filter): PremiumTierBadge.tsx returns gold OKLCH span when `effectiveTier === "premium_stub"`, else null; usePremiumTier.ts contains 0 `setTimeout`, 0 `setInterval`, 0 `fetch` — only `Date.now() - startedAt >= PREMIUM_TIER_TTL_MS` pure read-side filter (PHK3 covers). Clock-rewind v1 limitation documented in disclosure banner copy. ✓
    - HC6 (CSP extends connect-src ONLY): `_headers` diff shows only `connect-src` widened by exactly 3 hostnames (js.stripe.com, checkout.stripe.com, buy.stripe.com); `script-src 'self'` untouched; no `frame-src` directive added (CSP4-SCRIPT-SRC-CLEAN + CSP4-FRAME-SRC-CLEAN both pass). ✓
    - HC7 (Cancel Subscription → free): premiumCancelButton.tsx flips both prefs to "free"/0 + emits web:premium:tier-changed; PCANCEL-1..3 verify. ✓
    - HC8 (Disclosure banner mandatory + unmissable): premiumDisclosureBanner.tsx is non-dismissible (no close button), amber OKLCH styling, role="note", data-testid="premium-disclosure-banner"; rendered unconditionally at line 36 of premiumPane.tsx OUTSIDE any tier-conditional branch — present in free/pending/premium_stub states (PB-BANNER-1..3 + PT-EXT-4 cover). ✓
    - HC9 (P0 cross-vendor verify, deferred-24h OK): Codex cold-read deferred per ADR-0008 §S3 carve-out consistent with W1/W2 + row #6/#7 precedent; documented as residual risk. ✓
    - HC10 (Append-only dev_log lineage): both prior blocks preserved verbatim — row #24 SHIPPED panel (lines 5-130) + row #7 OAuth lineage block (lines 132-466) untouched; row #8 block appended starting line 469. ✓
    - HC11 (Step 0 brief is input): seed brief `docs/reviews/xai-web-settings-premium-stripe/20260524-roadmap-seed.md` referenced in Artifacts Index. ✓
    - HC12 (ADR-0008 §S3 D3 FOURTH in-place amend per binding precedent): frontmatter Amendments row extended with 2026-05-26 entry; §S3 D3 new "Amendment 2026-05-26 — connect-src Stripe Payment Link extension" block with before/after table; binding-precedent rule preserved. ✓
  - **Gate 3 Critical no-SK guard**: PASS. `git show 8f1a269 -- src/__tests__/no-stripe-secret-key.test.ts` confirms regex `sk_test_[A-Za-z0-9]` + `sk_live_[A-Za-z0-9]` (catches both test + live); scans `src/**` recursively (`collectSourceFiles(PKG_SRC)`). Re-ran: 2/2 PASS, 0 matches in src. Independent `grep -rc` in `dist/**` also 0 matches.
  - **Gate 4 No-Stripe.js guard**: PASS. `no-stripe-js-bundle.test.ts` checks both import statements `(?:from|require\(|import\()\s*['"]@stripe/stripe-js['"]` (TT-NO-STRIPE-JS-1) AND CDN URL `https://js.stripe.com/` (TT-NO-STRIPE-JS-2). Re-ran: 2/2 PASS, 0 matches in src. Independent dist bundle scan: 0 occurrences of `@stripe/stripe-js`, `js.stripe.com`, or `Stripe(` in `dist/assets/index-BCUyBJ4V.js` (main bundle).
  - **Gate 5 CSP4 verification**: PASS. `apps/web/public/_headers` shows exact additions in connect-src: `https://js.stripe.com https://checkout.stripe.com https://buy.stripe.com`; script-src + frame-src untouched (CSP4-SCRIPT-SRC-CLEAN + CSP4-FRAME-SRC-CLEAN pass). FOURTH amendment in ADR-0008 includes binding-precedent rule preservation + before/after table + security posture analysis for all 3 hostnames. `dist/_headers` mirrors the addition.
  - **Gate 6 Render-prop circular-dep resolution**: PASS. `git show 7210a93 -- packages/xai-web-shell/src/{Shell,Topbar,types}.tsx` confirms `premiumBadge?: ReactNode` prop added to both ShellProps + TopbarProps; Topbar destructures and renders at line 50-52 of Topbar.tsx with no direct import. `grep -rn "plugin-web-settings-rest" packages/xai-web-shell/src/` returns ONLY documentation-comment matches (5 lines in types.ts comments explaining the pattern) — 0 actual import statements. `packages/xai-web-shell/package.json` has no `@repo/plugin-web-settings-rest` dependency.
  - **Gate 7 RouteErrorBoundary preemptive widening**: PASS. `git show 38dde2d -- apps/web/src/routes/RouteErrorBoundary.tsx` shows union extended from `"root" | "auth" | "app" | "module" | "oauth-callback"` → `... | "premium-checkout"`. P3 router.tsx scope literal "premium-checkout" is supported BEFORE the routes land — row #7 cycle-2 B2 regression lesson explicitly incorporated.
  - **Gate 8 Test re-execution**: PASS. plugin-web-settings-rest 208/208; plugin-web-storage 88/88; xai-web-shell 86/86; web 116/116. Total **498/498**.
  - **Gate 9 Lint + typecheck**: MIXED. plugin-web-settings-rest lint exit 0; xai-web-shell lint exit 0; plugin-web-settings-rest check-types N/A (no script); xai-web-shell check-types exit 0; **web check-types exit 0 (cycle-2 B2 regression prevention confirmed — `"premium-checkout"` literal accepted by union)**. `pnpm --filter @repo/web lint` exits 1 with 3 pre-existing baseline warnings: (1) `TokensSmokePage.tsx:71:8` DEV env var (file unchanged since 6c556e6 from row #7 baseline + `DEV` was never in turbo.json globalEnv at row #7 ship 5085a03), (2) `TokensSmokePage.tsx:73:25` rules-of-hooks (same pre-existing file), (3) `worker-configuration.d.ts:3:1` unused eslint-disable in a gitignored Wrangler-generated file (dated May 24, predates row #7+8). `git diff 5085a03 HEAD -- apps/web/src/pages/TokensSmokePage.tsx` is empty — confirmed pre-existing. **None of the 3 warnings are introduced by row #8**; row #7 SHIPPED with the same environmental state. Treated as non-blocking residual.
  - **Gate 10 Build**: PASS. `pnpm --filter @repo/web build` SUCCEEDS in 3.99s; `dist/_headers` contains FOURTH amendment additions (3 Stripe hostnames in connect-src; script-src `'self'`; frame-ancestors `'none'`; no frame-src); `grep -rc "sk_(test|live)_[A-Za-z0-9]" dist` returns 0.
  - **Gate 11 30-day timer purity**: PASS. usePremiumTier.ts is a pure read-side filter — 0 setTimeout, 0 setInterval, 0 fetch (verified by direct grep); the only `setTimeout` match in the row #8 src tree is in CheckoutSuccessPage/CancelPage for the back-navigation delay, NOT for tier expiry. Clock-rewind documented as known v1 limitation per disclosure banner copy "v1 Premium is a UX preview" (R4).
  - **Gate 12 Disclosure banner unmissable**: PASS. premiumDisclosureBanner.tsx renders unconditionally at premiumPane.tsx line 36 — OUTSIDE all tier-conditional branches; non-dismissible (no close button — explicitly documented in source comment); amber OKLCH (`.premium-disclosure-banner` CSS class — distinct from row #7 `int-stub-banner`); rendered in all 3 tier states.
- **Findings — BLOCKERS**: NONE. All 12 cycle-0 gates green; the single MIXED note (web lint) is a pre-existing baseline issue not introduced by row #8, identical state to row #7 SHIPPED ship gate entry.
- **Residual risks (non-blocking, ship-eligible)**:
  - **Pre-existing web lint baseline (3 warnings)**: `TokensSmokePage.tsx` rules-of-hooks + DEV env warnings + `worker-configuration.d.ts` unused-disable-directive. None introduced by row #8. Recommend a separate hygiene PR (out of scope for row #8 ship gate). Row #7 ship faced identical state and shipped successfully.
  - **R4 30-day clock-rewind**: client-clock TTL is documented v1 limitation; disclosure banner copy explicitly addresses. Real subscription enforcement requires desktop client (P1) or Worker layer (deferred per ADR-0008 D3 follow-up).
  - **R5 frame-src cross-vendor confirm**: Codex cold-read on whether Stripe Payment Link redirect could ever embed (currently no iframe path; same-tab redirect only). Deferrable 24h post-ship per ADR-0008 carve-out.
  - **P6 Codex cold-read**: 6 items (no SK in bundle, no Stripe.js bundled, disclosure banner unmissable, CSP minimality, no real network, 30-day timer purity) deferred 24h post-ship per row #6+#7 precedent.
- **Tests**: as documented above — 498/498 PASS; settings-rest + xai-web-shell + web check-types exit 0; web build SUCCESS; CSP4 + no-SK + no-stripe-js guards all green; 0 SK matches in src + dist; 0 Stripe.js matches in src + main bundle JS.
- **Commits**: — (verify phase produces no commits beyond this dev_log flip; will be batched by ship into a single Lineage Status flip commit).
- **Next step**: `ship` — push 6 commits (0a17b3e, 43ba9c9, 38dde2d, 7210a93, 8f1a269, b42d862) to remote (already on origin per b42d862's prior auto-push), flip Lineage Status to SHIPPED, append Ship Report, append to roadmap manifest as row #8 complete.

#### 2026-05-26 01:30 — SHIP: Lineage Status → SHIPPED (row #8 of xai-web-console-gap-closure, wave 2 third)

- **Executor**: claude-sonnet-4-6 — ship
- **Action**: Verified all implementation commits present on origin/main with clean working tree. Verified dev_log Lineage Status = READY_TO_SHIP. Verified all 7 commit messages follow `type(scope): summary` convention with Why/What/Scope/Risk/Docs/Tests body + Co-Authored-By trailers. Verified no sensitive files (.env*, *.pem, *.key, sk_test_*, sk_live_*) in commit set. Flipped Lineage Status Panel to SHIPPED. Appended this Ship Report.
- **Commits shipped (7)**:
  - `0a17b3e` feat(xai-web-settings-premium-stripe): P1 — tier state machine + 2 prefs + usePremiumTier + usePremiumConfig hooks (gap-closure row #8)
  - `43ba9c9` feat(xai-web-settings-premium-stripe): P2 — Upgrade button + Payment Link redirect + env-var disabled fallback (gap-closure row #8)
  - `38dde2d` feat(xai-web-settings-premium-stripe): P3 — Checkout success/cancel pages + router wiring + RouteErrorBoundary scope union extension + 1 EventMap declaration (gap-closure row #8)
  - `7210a93` feat(xai-web-settings-premium-stripe): P4 — Cancel Subscription + PremiumTierBadge + Topbar render-prop + disclosure banner + bilingual pane (gap-closure row #8)
  - `8f1a269` feat(xai-web-settings-premium-stripe): P5 — ADR-0008 §S3 D3 FOURTH amendment + _headers connect-src extension + CSP4 + no-SK + no-stripe-js source-text guards + env-var docs (gap-closure row #8)
  - `b42d862` chore(xai-web-settings-premium-stripe): commit row #8 plan docs + Work Log + flip Lineage Status to READY_FOR_VERIFY (P1..P5 complete)
  - `8c2cbf0` docs(roadmap): xai-web-console-gap-closure row #8 READY_TO_SHIP — Premium Stripe stub (first-try verify PASS)
- **Push timestamp**: 2026-05-26 01:30 (all 7 commits already on origin/main at ship gate entry — verified via `git log --oneline origin/main..HEAD` → no output; this commit records the dev_log SHIPPED flip + Ship Report)
- **Roadmap row reference**: `docs/workflow/roadmap/xai-web-console-gap-closure.md` row #8 (W2 · Premium Stripe Checkout stub)
- **Wave 2 progress**: 3/4 SHIPPED (rows #6, #7, #8 SHIPPED; row #9 PENDING)
- **Deferred residual risks (non-blocking)**:
  - R4 30-day client-clock rewindable: client-clock TTL is a documented v1 limitation; disclosure banner copy explicitly addresses; not a billing path. Real subscription enforcement requires desktop client (P1) or Worker layer per ADR-0008 D3 follow-up.
  - R5 frame-src cross-vendor confirm: Codex cold-read on whether Stripe Payment Link redirect could ever embed (currently same-tab redirect only; no iframe path). Deferrable 24h post-ship per ADR-0008 carve-out.
  - P6 Codex cold-read (6 items deferred 24h per ADR-0008 §S3 carve-out): no SK in bundle, no Stripe.js bundled, disclosure banner unmissable, CSP minimality, no real network in any premium path, 30-day timer purity — consistent with W1/W2 precedent per row #6/#7 ship.
- **Next step for row #9**: `xai-web-console-gap-closure` row #9 (W2 fourth, PENDING) — wave 2 final row

---

## Bugfix-Extension Lineage — gap-closure row #9 (2026-05-26)

> APPEND-ONLY block. The Workflow State Panel + Phase Plan + Work Log +
> Commits + Blockers above (SHIPPED row #24 baseline + 2026-05-24 PR-2 drift
> reconciliation) AND the 2026-05-26 row #7 OAuth-stub Lineage block AND the
> 2026-05-26 row #8 Premium Stripe Checkout Stub Lineage block are NOT mutated
> by this extension lineage. This block tracks a new feature-dev cycle
> introduced by the `xai-web-console-gap-closure` manifest row #9 (Gap 6c —
> Account Delete real wire, W2 LAST).
>
> Note: 3 prior lineage blocks above this one cover row #24 SHIPPED + row #7
> OAuth PKCE stub SHIPPED + row #8 Premium Stripe Checkout stub SHIPPED. This
> row #9 is the third extension lineage block to live directly in this dev_log
> (the AI LLM adapter row #2 lineage lives in `packages/xai-web-ai-chat/docs/`).

### Lineage Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-settings-account-delete-wire |
| Title | Replace the SHIPPED row-#24 single-step Account-Delete confirm modal (currently emits `web:settings:rest:account-delete-confirmed` with no listener — a declaration-only no-op) with a real deletion flow. Modal becomes a 2-step gate (Step 1 "Are you sure?" → Step 2 "Type DELETE to confirm" with case-sensitive exact-match input). On submit, the new `useAccountDeleteOrchestrator()` hook calls a new `deleteAccount()` helper added to the SHIPPED `web-auth-device-session` platform spine (scope extension — that package's design.md explicitly carved out account-delete in v1, so this row adds the missing endpoint client). On backend 200 (or 404 idempotency), the orchestrator iterates `Object.keys(PREF_REGISTRY)` to clear all 42 registered `xai_*` localStorage keys (NEVER wildcard `localStorage.clear()`), then iterates a new `ACCOUNT_LOCAL_WIPE_IDB_NAMES` constant (also exported from web-auth-device-session) to call `indexedDB.deleteDatabase()` for each of the 3 known IDB databases (`web-encrypted-cache`, `xai-web-ai-secrets`, `xai-web-auth`), then `window.location.assign("/")`. On failure (network / 401 / 403 / 500), modal shows a bilingual error banner; localStorage and IndexedDB are NOT touched; Retry restores Step 2. Mock-auth mode (`VITE_WEB_AUTH_MODE=mock-authenticated`) skips the backend call and runs the same local wipe + redirect, with a non-dismissible amber disclosure banner shown on Step 2. The existing `web:settings:rest:account-delete-confirmed` event is annotated `@deprecated since 2026-05-26` and re-purposed to emit on Step 1 → Continue (one release of back-compat). NO new CSP amendment (`connect-src` already covers `VITE_SUPABASE_URL`). NO new EventMap entry. NO new bundled NPM dependency. This is the SMALLEST of the 6a/6b/6c sub-rows per the seed brief — 4 phases, ~36 new tests, ~498 baseline tests preserved. |
| Current Phase | SHIPPED |
| Status | SHIPPED |
| Suggested Next | — (workflow complete) |
| Verify Cross-vendor | yes (per ADR-0009 §D4 P0 + roadmap header default; primary Codex `gpt-5.5-thinking medium`, fallback Cursor) |
| Automation Mode | A-Claude (per roadmap default inherited from xai-web-console.md 2026-05-23 user override) |
| Executor | claude-sonnet-4-6 — ship, 2026-05-26 |
| Updated | 2026-05-26 02:55 |
| Dispatched By | `xai-roadmap-loop` SERIAL dispatch — Wave 2 LAST row (after row #8 SHIPPED `00580dd` 2026-05-26) |
| Roadmap Row | `docs/workflow/roadmap/xai-web-console-gap-closure.md` row #9 (W2 LAST · Account-delete wire to web-auth-device-session) |
| Parent ADR | ADR-0009 §D2-G3 (P0 gap-closure; ≥5/9 known gaps SHIPPED to unblock P1 Desktop launch) |
| ADR Amendment | **NONE.** `connect-src` already covers `VITE_SUPABASE_URL` via the SHIPPED `web-auth-device-session` package's runtime usage. No `_headers` edit. No ADR-0008 amendment. No `csp.test.ts` edit. **First wave-2 gap-closure row without an ADR amendment.** |
| Concurrent Siblings | None (SERIAL dispatch — wave 2 LAST row) |
| Pattern Setter For | Future P1 desktop pivot account-delete row (will inherit the orchestration hook + registry-list iteration + IDB-list constant pattern; the Edge Function provisioning runbook also carries forward) |
| Write Scope | **planning phase (this run)**: `docs/reviews/xai-web-settings-account-delete-wire/20260525-discovery-review.md` (NEW) + `packages/plugin-web-settings-rest/docs/{design.md, api.md, test.md, dev_log.md}` (APPEND-ONLY extension sections). **build phases (later)** extend to: `packages/plugin-web-settings-rest/src/{internal/DeleteAccountConfirmModal.tsx (REWRITE — single→2-step), internal/useAccountDeleteOrchestrator.ts (NEW), internal/localI18n.ts (EDIT — +17 keys), styles.css (EDIT — +modal step CSS + mock banner + error banner), panes/accountPane.tsx (EDIT — Step 1 Continue emits deprecated event)}` + `packages/web-auth-device-session/src/{auth-actions.ts (EDIT — +deleteAccount + AccountDeleteError), wipe.ts (NEW — ACCOUNT_LOCAL_WIPE_IDB_NAMES + wipeRegisteredIDB), index.ts (EDIT — 4 new exports), auth-actions.test.ts (EDIT — +DAA-1..8)}` + `packages/web-auth-device-session/docs/{design.md, api.md, dev_log.md} (APPEND-ONLY)` + `packages/core/src/types/events.ts (EDIT — JSDoc @deprecated annotation only)` + `apps/web/deploy/README.md (EDIT — +§Account-Delete Edge Function + §Account-Delete Rollback)` + `docs/PLUGIN_MAP.md (EDIT — extension notes on plugin-web-settings-rest + web-auth-device-session rows)` + 3 new test files (useAccountDeleteOrchestrator.test.tsx, no-localstorage-clear.test.ts, REWRITTEN DeleteAccountConfirmModal.test.tsx). |

### Artifacts Index (this extension)

- Seed brief: `docs/reviews/xai-web-settings-account-delete-wire/20260524-roadmap-seed.md`
- Discovery review: `docs/reviews/xai-web-settings-account-delete-wire/20260525-discovery-review.md`
- Design extension: `packages/plugin-web-settings-rest/docs/design.md` §"2026-05-26 Extension: Account Delete Wire (gap-closure row #9)"
- API extension: `packages/plugin-web-settings-rest/docs/api.md` §8
- Test extension: `packages/plugin-web-settings-rest/docs/test.md` §7
- Dev log extension: `packages/plugin-web-settings-rest/docs/dev_log.md` (this block)
- Companion design/api/dev_log extensions: `packages/web-auth-device-session/docs/{design.md, api.md, dev_log.md}` (deferred to P2/P4 of feature-build)

### Decision Headline (this extension)

Rewrite the SHIPPED row-#24 single-step Account-Delete confirm modal into a **2-step gate** with **case-sensitive type-match input**, wire it via a new internal `useAccountDeleteOrchestrator()` hook to a new `deleteAccount()` helper in the SHIPPED `web-auth-device-session` platform spine. Live-auth path: backend → sign-out → registered-key localStorage wipe → known-IDB-list wipe → redirect. Mock-auth path: skip backend, run same local wipe + redirect, show non-dismissible amber disclosure banner. Failure path: bilingual error banner, NO local mutation, retryable.

Key architectural decisions (from discovery §3 + §5):

1. **A1**: single `<dialog>` with `useReducer` step machine (5 states: step1 / step2 / submitting / success / failure).
2. **B1**: controlled `<input>` with case-sensitive exact-match `=== "DELETE"`; no trim, no fold.
3. **D1**: mock-auth banner on Step 2 top only (persistent on Step 2 / Submitting / Failure).
4. **E1**: orchestration in `useAccountDeleteOrchestrator()` internal hook — NOT exported from barrel; UI stays separated from side-effects.
5. **F1**: deprecated event emitted on Step 1 Continue (NOT on actual deletion) — one release of back-compat.
6. **G1**: extend `web-auth-device-session` with `deleteAccount()` + `AccountDeleteError` + `ACCOUNT_LOCAL_WIPE_IDB_NAMES` + `wipeRegisteredIDB()`. The Edge Function `account-delete` itself is OPERATIONAL prerequisite (documented in `apps/web/deploy/README.md`), NOT in row-#9 code scope (Q2 in discovery).
7. **FA-14**: NO new CSP amendment. `connect-src` already covers `VITE_SUPABASE_URL`. First wave-2 gap-closure row to land without an ADR amendment.

The seed brief HC1 ("use SHIPPED platform spine") is satisfied as a **scope extension** of the SHIPPED package (G1) — that package's own `design.md` line 41 explicitly carved out "account export/delete/privacy flows" in v1, so adding the missing endpoint client now is integration-compliant rather than parallel-path. Surfaced for explicit `feature-review` confirmation as Q1 in discovery §8.

### Phase Plan (this extension)

#### Extension-P1 — 2-step modal + type-match input + bilingual i18n (UI only, no backend wiring)

**Scope**:
- `src/internal/DeleteAccountConfirmModal.tsx` — REWRITE in place; single→2-step `useReducer` step machine; controlled input with case-sensitive match; cancel on both steps; bilingual labels via localI18n.
- `src/internal/localI18n.ts` — +17 bilingual entries (`deleteModal.step1_*`, `step2_*`, `type_prompt`, `input_placeholder`, `confirm_disabled_tooltip`, `delete_now`, `submitting`, `error_*` ×5, `retry`, `mock_banner`).
- `src/styles.css` — extend `.delete-account-modal` rules; add `.dam-input`, `.dam-mock-banner`, `.dam-error`, `.dam-actions-row` (all OKLCH).
- `src/panes/accountPane.tsx` — minimal edit to pass `lang` + use new prop shape (`onStep1Continue` replaces `onConfirm`).
- Tests: `DeleteAccountConfirmModal.test.tsx` (REWRITE) — DEL-STEP-1..3 + DEL-TYPEMATCH-1..6 + DEL-CANCEL-1..2 + DEL-BILINGUAL-1..2; `accountPane.test.tsx` (EDIT) — AC1..AC4, AC8 preserved + AC5/6/7 adjusted.
- Suggested commit: `feat(xai-web-settings-account-delete-wire): P1 — 2-step modal + type-DELETE gate + bilingual i18n (gap-closure row #9)`

#### Extension-P2 — `deleteAccount()` + `AccountDeleteError` in web-auth-device-session (companion package extension)

**Scope**:
- `packages/web-auth-device-session/src/auth-actions.ts` — ADD `deleteAccount(client, options?)` + `AccountDeleteError` class + `AccountDeleteErrorKind` type + `DeleteAccountOptions` interface.
- `packages/web-auth-device-session/src/index.ts` — export the 4 new symbols.
- `packages/web-auth-device-session/docs/{design.md, api.md}` — append small "Account Delete Helper (extension 2026-05-26 — gap-closure row #9)" sections (~50 lines each).
- `packages/web-auth-device-session/src/auth-actions.test.ts` — append DAA-1..8 (invoke once / signOut once / network throw / 401 / 403 / 500 / 404 idempotency / signOut-failure downgrade).
- Suggested commit: `feat(xai-web-settings-account-delete-wire): P2 — deleteAccount() helper + AccountDeleteError in web-auth-device-session (gap-closure row #9)`

#### Extension-P3 — `useAccountDeleteOrchestrator` + `ACCOUNT_LOCAL_WIPE_IDB_NAMES` + `wipeRegisteredIDB` + mock-auth fallback + redirect

**Scope**:
- `packages/web-auth-device-session/src/wipe.ts` (NEW) — `ACCOUNT_LOCAL_WIPE_IDB_NAMES` const + `wipeRegisteredIDB()` async helper (uses `Promise.allSettled` over `indexedDB.deleteDatabase(name)`).
- `packages/web-auth-device-session/src/index.ts` — export `ACCOUNT_LOCAL_WIPE_IDB_NAMES` + `wipeRegisteredIDB`.
- `packages/plugin-web-settings-rest/src/internal/useAccountDeleteOrchestrator.ts` (NEW) — orchestration hook (live + mock-auth paths); `useReducer` state machine for `idle / submitting / wiping / success / failure`; calls `deleteAccount()` (live) → `removePref` loop → `wipeRegisteredIDB()` → `window.location.assign("/")`.
- `packages/plugin-web-settings-rest/src/internal/DeleteAccountConfirmModal.tsx` — wire orchestrator into Submitting state; pass `onProgress` for "Clearing local data…" UI; failure routes update step-machine state.
- `packages/plugin-web-settings-rest/src/panes/accountPane.tsx` — emit deprecated event on Step 1 Continue (one release).
- Tests: `useAccountDeleteOrchestrator.test.tsx` (NEW) — DEL-ORCH-1..4 + DEL-WIPE-1..2 + DEL-IDEM-1 + DEL-IDB-LIST-1; `no-localstorage-clear.test.ts` (NEW) — DEL-WILDCARD-GUARD source-text guard; `DeleteAccountConfirmModal.test.tsx` (EDIT extend) — DEL-WIRE-1..3 + DEL-MOCK-BANNER-1..3; `accountPane.test.tsx` (EDIT) — DEL-EVENT-DEP-1.
- Suggested commit: `feat(xai-web-settings-account-delete-wire): P3 — useAccountDeleteOrchestrator + ACCOUNT_LOCAL_WIPE_IDB_NAMES + mock-auth fallback + redirect (gap-closure row #9)`

#### Extension-P4 — JSDoc @deprecated + operator runbook + PLUGIN_MAP + companion dev_log

**Scope**:
- `packages/core/src/types/events.ts` — JSDoc `@deprecated since 2026-05-26 (gap-closure row #9); will be removed in P1.` on `web:settings:rest:account-delete-confirmed` (annotation only; payload schema unchanged).
- `apps/web/deploy/README.md` — append §"Account-Delete Edge Function" (function name + request/response shape + RLS/service_role + deploy gate) + §"Account-Delete Rollback" (4 rollback paths from discovery §12).
- `docs/PLUGIN_MAP.md` — append "(Extension 2026-05-26 — Account-delete wire gap-closure row #9)" to `plugin-web-settings-rest` row + small note on `web-auth-device-session` row.
- `packages/web-auth-device-session/docs/dev_log.md` — small APPEND-ONLY "Bugfix-Extension Lineage — Account-delete helper (2026-05-26 row #9)" block (preserves SHIPPED state).
- Suggested commit: `feat(xai-web-settings-account-delete-wire): P4 — JSDoc @deprecated + apps/web/deploy/README extension + PLUGIN_MAP + companion dev_log lineage close (gap-closure row #9)`

#### Extension-P5 — Cross-vendor verify checklist (owned by feature-verify) [DEFERRED to feature-verify]

**Scope** (per test.md §7.7):
- No-wildcard-wipe cold-read (Codex `gpt-5.5-thinking medium`)
- Type-match case-sensitive cold-read
- Sequencing live-auth cold-read (backend success precedes any local mutation)
- IDB-list completeness cold-read
- Mock-auth banner unmissable cold-read
- Deprecated event still emitted cold-read
- Manual smoke (Chrome 120 / Safari 17, deferrable 24h per ADR-0008 carve-out, consistent with W1/W2 + row #6/#7/#8 precedent)

### Risk Register (per discovery §6)

R1 partial local-clear → sequence localStorage before IDB + best-effort + redirect anyway (the upstream account is gone). R2 tab-close mid-flow → next session fails auth → local stale-but-inert. R3 retry-404 idempotency → map to `already_deleted` kind, proceed to wipe. R4 wildcard wipe accident → DEL-WILDCARD-GUARD source-text test on BOTH `plugin-web-settings-rest/src/` AND `web-auth-device-session/src/`. R5 new IDB not in const → JSDoc + runbook + DEL-IDB-LIST-1 explicit list. R6 mock banner missed → non-dismissible + amber OKLCH + DEL-MOCK-BANNER-1..3. R7 unicode lookalikes → exact `===` match, no normalization. R8 Edge Function not provisioned → deploy-gate runbook in `apps/web/deploy/README.md` §"Account-Delete Edge Function". R9 signOut failure → log + downgrade (account is gone). R10 deprecated event confusion → JSDoc `@deprecated since 2026-05-26 (row #9); will be removed in P1.` R11 unused-var lint nits → preempt with explicit lint-clean impl (row #7 cycle-2 B1.a + B2 lessons absorbed).

### Work Log (this extension)

#### 2026-05-26 — Extension-FEATURE_PLAN: discovery + design/api/test/dev_log extension blocks

- **Executor**: Claude Opus 4.7 (1M context) — feature-plan
- **Action**:
  - Read seed brief + roadmap row #9 + SHIPPED design/api/test/dev_log (including 2026-05-26 row #7 + row #8 extension lineage blocks) + `panes/accountPane.tsx` (current single-step modal integration) + `internal/DeleteAccountConfirmModal.tsx` (row #24 SHIPPED single-step shape) + `panes/integrationsPane.tsx` (as reference for pattern: stub-banner + bilingual + non-dismissible UI) + `internal/integrationStubBanner.tsx` (banner pattern) + `CheckoutSuccessPage.tsx` (row #8 — query-param + setTimeout-navigate + emit event reference) + `internal/premiumDisclosureBanner.tsx` (row #8 — disclosure banner pattern) + `internal/premiumCancelButton.tsx` (row #8 — destructive action pattern) + `internal/premiumUpgradeButton.tsx` (row #8 — env-conditional UX pattern) + `packages/web-auth-device-session/src/{index.ts, auth-actions.ts, session.tsx, docs/design.md, docs/api.md}` (verify NO existing delete endpoint; verify scope carve-out in design.md line 41) + `packages/plugin-web-storage/src/internal/{registry.ts, storage.ts}` + `packages/plugin-web-storage/src/index.ts` (PREF_REGISTRY exported; 42 keys at row-#9-time) + `apps/web/src/providers/AppProviders.tsx` (`VITE_WEB_AUTH_MODE` handling at line 66) + `packages/core-data/src/indexeddb-sync-blob.ts` (WEB_CACHE_DB_PREFIX = "web-encrypted-cache") + `packages/xai-web-ai-chat/docs/test.md:398` ("xai-web-ai-secrets" + "xai-web-auth" IDB DB names) + `packages/plugin-web-settings-rest/vitest.setup.ts` (extended afterEach) + ADR-0008 §S3 D3 (post FOURTH amendment) — confirm no new amendment needed for row #9 + roadmap manifest row #9 status.
  - Performed 2 WebSearches for current Supabase user self-delete patterns; sources recorded in discovery §15. Key findings: `auth.admin.deleteUser` requires `service_role` key + server/edge-function execution; cannot be called from browser. Edge Function is the recommended client-callable pattern; client invokes via `client.functions.invoke()`. **Critical reality check**: `web-auth-device-session` design.md explicitly carves out "account export/delete/privacy flows" in v1 — there is NO existing delete endpoint in the SHIPPED package. Row #9 must extend the SHIPPED platform spine (G1 decision in §4 / FA-10 / FA-11).
  - Wrote discovery review: `docs/reviews/xai-web-settings-account-delete-wire/20260525-discovery-review.md` (15 sections; 6 axis options analysis on A..F; 11 risks; 4 phases + P5 verify-deferred; 15 frozen assumptions; 8 acceptance signals mapped; 5 open questions; rollback path; explicit out-of-scope; sources).
  - APPENDED extension sections to `design.md` (§"2026-05-26 Extension: Account Delete Wire (gap-closure row #9)" — 15 frozen assumptions + component graph + state machine + i18n delta + 11 risks one-line summary).
  - APPENDED §8 to `api.md` (10 sub-sections covering exports, modal contract, orchestrator hook contract, i18n keys, deprecated EventMap JSDoc, error semantics, CSP impact (none), companion package surface, operator runbook, backwards-compat surface).
  - APPENDED §7 to `test.md` (7 sub-sections covering env, mocks, full ~36-case test matrix in 4 phases, mock surface area, acceptance criteria, no-localStorage.clear source-text guard, cross-vendor verify checklist).
  - APPENDED "## Bugfix-Extension Lineage — gap-closure row #9 (2026-05-26)" block to this `dev_log.md` (Status Panel + Artifacts Index + Decision Headline + 5-phase plan + R1..R11 risks + this Work Log entry).
  - SHIPPED Status Panel + Phase Plan + Work Log + Commits + Blockers sections of row #24 (W4b) + 2026-05-26 row #7 Lineage block + 2026-05-26 row #8 Lineage block preserved verbatim per HC8 + session-added HC8.
- **Tests**: planning phase — no test execution (deferred to feature-build phases)
- **Commits**: — (planning phase produces docs only)
- **Next step**: `feature-review` to validate plan; expected verdict APPROVED or REVISE.

#### 2026-05-26 — Extension-FEATURE_REVIEW: verdict APPROVED

- **Executor**: Claude Opus 4.7 (1M context) — feature-review (xai-roadmap-loop SERIAL, wave 2 LAST row)
- **Action**: Cold-read the discovery review (15 sections, 6 axis options, 11 risks, 4-phase plan, 15 frozen assumptions, 8 acceptance signals mapped, 5 open questions, rollback path, OOS, sources) + design.md §"2026-05-26 Extension" + api.md §8 + test.md §7 + dev_log Lineage block. Verified PREF_REGISTRY in `plugin-web-storage/src/internal/registry.ts` contains both row-#8 premium prefs (`xai_pref_premium_tier` + `xai_pref_premium_started_at`) — confirming Q3 (registry-list sweeps row-#8 prefs by construction, no special-case needed). Verified `web-auth-device-session/docs/design.md:41` explicit non-scope of "account export/delete/privacy flows" — confirming Q1 (scope extension is the HC1-compliant path; parallel auth path would violate HC1 + 3-layer boundary). Verified no `_headers` change needed: `connect-src` does not enumerate Supabase URLs; runtime host trust already covered — confirming FA-14 (no ADR-0008 amendment).
- **Gate-by-gate verdict**:
  1. **Scope sanity**: PASS — All 8 seed-brief acceptance signals mapped to specific test IDs in §10 + test.md §7.5.
  2. **HC compliance**: PASS — HC1 (scope extension via Q1, justified by SHIPPED package's explicit v1 carve-out; not a parallel path); HC2 (2-step with case-sensitive `=== "DELETE"` exact-match, no trim/no fold per B1); HC3 (sequencing explicit: backend → signOut → registry-list localStorage → IDB list → redirect — §2.3 + §3.E + DEL-ORCH-3 negative test); HC4 (failure path NO local mutation, modal stays open with bilingual banner — DEL-ORCH-3 + DEL-WIRE-2); HC5 (`@deprecated since 2026-05-26` JSDoc on EventMap entry + emit-site moves to Step 1 Continue for one-release back-compat — F1); HC6 (mock-auth fallback with non-dismissible amber banner — DEL-MOCK-BANNER-1..3 + D1); HC7 (P0 + cross-vendor verify per ADR-0009 §D4; Codex `gpt-5.5-thinking medium` primary, Cursor fallback); HC8 (append-only — 3 prior lineage blocks #24/#7/#8 preserved verbatim, verified at lines 1-130/132-470/471-777); HC9 (Step 0 seed brief is input — referenced in §1 + Artifacts Index); HC10 (no new CSP changes — verified empirically).
  3. **Architectural fit**: PASS — 3-layer respected (`accountPane.tsx` calls modal which calls orchestrator hook which calls SHIPPED `web-auth-device-session` public API; no `@tauri-apps/api`; no direct Supabase import in plugin-web-settings-rest); deprecated event emit via xai-web-event-bus; persistence via `removePref` over `Object.keys(PREF_REGISTRY)` (E1).
  4. **PLUGIN_MAP consistency**: PASS — extension notes planned for both `plugin-web-settings-rest` row (SHIPPED + extension marker) AND `web-auth-device-session` row (SHIPPED + 4-export extension marker). Companion `web-auth-device-session/docs/dev_log.md` gets its own small lineage block (preserving its own SHIPPED state).
  5. **Security boundary (CRITICAL)**: PASS — Sequencing explicitly documented backend SUCCESS → localStorage clear → IndexedDB clear → redirect (§2.3 numbered steps 1-6); failure path leaves both storages untouched (§2.3 final paragraph + FA-4 + DEL-ORCH-3); R4 wildcard-wipe risk mitigated by DEL-WILDCARD-GUARD source-text test on BOTH `plugin-web-settings-rest/src/**` AND `web-auth-device-session/src/**`.
  6. **Type-match correctness**: PASS — B1 specifies `=== "DELETE"` strict equality (no trim, no case-fold, no normalization) with DEL-TYPEMATCH-1..6 covering exact / lowercase / mixed-case / empty / extra-char / trailing-space (and ZWS per R7 mitigation). Seed brief acceptance signal "type 'delete' lowercase → submit disabled" is non-negotiable and enforced.
  7. **Registry-list discipline**: PASS — FA-6 mandates `Object.keys(PREF_REGISTRY)` iteration; FA-6 + R4 prohibit wildcard `localStorage.clear()`; DEL-WILDCARD-GUARD source-text guard mirrors at compile time. Verified PREF_REGISTRY includes both row-#8 prefs — no special-case logic needed (Q3 confirmed by construction).
  8. **Test strategy reality check**: PASS — 498 baseline (208+88+86+116) preserved + ~36 new tests across P1 (~13) + P2 (8 DAA) + P3 (~15). DAA-7 (404 idempotency → `kind="already_deleted"`) + DEL-ORCH-4 (mapped to wipe+redirect) handles R3 retry pathology. DEL-IDB-LIST-1 freezes the constant at row-#9-time (3 entries). DEL-WIPE-1 asserts all 42 PREF_REGISTRY keys iterated.
  9. **Phase granularity**: PASS — 4 phases each implementable as one feature-build run. P1 (modal+i18n+CSS+test rewrites — UI only, no backend wiring) / P2 (deleteAccount helper + AccountDeleteError class in companion package + 8 DAA tests) / P3 (orchestrator hook + ACCOUNT_LOCAL_WIPE_IDB_NAMES + wipeRegisteredIDB + mock-auth fallback + ~15 P3 tests) / P4 (JSDoc + operator runbook + PLUGIN_MAP + companion dev_log lineage). Each phase has explicit Suggested commit message.
  10. **Risk register**: PASS — 11 risks (R1..R11) exceed the typical 5; each has likelihood + impact + concrete mitigation; top risks (R1 partial wipe / R4 wildcard-accident / R8 Edge Function unprovisioned / R3 retry-404 idempotency) all have mapped test IDs or runbook entries.
  11. **Planner-flagged Q1..Q5 + FA-14/15 ratifications**:
      - **Q1 RATIFIED**: extending `web-auth-device-session` with `deleteAccount()` is the correct HC1 interpretation. SHIPPED package's design.md:41 explicitly lists "account export/delete/privacy flows" as v1 non-scope, so this is a scope extension, NOT a parallel path. The 3-layer boundary remains intact (no direct Supabase import in plugin-web-settings-rest).
      - **Q2 RATIFIED**: Edge Function provisioning deferred to operational runbook (`apps/web/deploy/README.md` §"Account-Delete Edge Function" added in P4). Real-auth code path is fully covered by mock at `client.functions.invoke()`. Deploy gate is the operator's responsibility per FA-13.
      - **Q3 RATIFIED**: registry-list iteration sweeps row-#8 premium prefs by construction — `Object.keys(PREF_REGISTRY)` enumerates `xai_pref_premium_tier` + `xai_pref_premium_started_at` along with the other 40 keys. No special-case logic needed.
      - **Q4 RATIFIED**: banner copy "Mock-auth delete (no real backend) — this will only clear local data." (EN) / "演示模式删除（无真实后端） — 仅清除本地数据。" (ZH) matches row-#7 / row-#8 banner pattern + lengths. Approved as the default localI18n entry for `deleteModal.mock_banner`.
      - **Q5 RATIFIED**: payload schema `{ confirmedAt: string }` unchanged; only timing semantics + JSDoc annotation change. Step 1 Continue is the new emit-site.
      - **FA-14 RATIFIED**: NO new CSP changes (connect-src already covers VITE_SUPABASE_URL via SHIPPED platform spine; no `_headers` edit; no ADR-0008 amendment; no csp.test.ts edit). First wave-2 row without ADR amendment.
      - **FA-15 RATIFIED**: Append-only doc discipline confirmed — 3 prior dev_log lineage blocks (row #24 + row #7 + row #8) preserved verbatim above the new row-#9 block.
  12. **Wave 2 finalization**: PASS — Phase commit messages (P1..P4) all carry `gap-closure row #9` slug. Plan docs (discovery review + design ext + api ext + test ext + dev_log lineage block) are all already written; feature-auto-build's P1 commit should include `docs/reviews/xai-web-settings-account-delete-wire/20260525-discovery-review.md` PLUS the design/api/test/dev_log appends (these are doc state that exists pre-build). Recommend feature-auto-build P1 commit stage these planning docs alongside the P1 code changes (modal rewrite + i18n + CSS + tests) so wave 2 closes cleanly with no orphan plan-doc commits (lesson from row #7 closure).
- **Verdict**: **APPROVED** — Plan is executable with no blocking ambiguity. 0 blockers, 1 recommendation (wave-2-closure: bundle planning docs into P1 commit, see gate 12).
- **Tests**: review phase — no test execution
- **Commits**: — (review phase produces docs only)
- **Next step**: `feature-auto-build` to run P1..P4 (~36 new tests + 4 commits), then stop at the feature-verify boundary.

### Review Notes (2026-05-26 — feature-review APPROVED)

**Verdict**: APPROVED (0 blockers, 1 recommendation).

**Q1..Q5 + FA-14/15 ratifications**: All RATIFIED with no overrides. See Work Log entry above for per-question reasoning.

**Recommendation (wave 2 closure hygiene)**: `feature-auto-build` should include planning docs in the P1 commit:
- `docs/reviews/xai-web-settings-account-delete-wire/20260525-discovery-review.md` (NEW)
- `packages/plugin-web-settings-rest/docs/{design.md, api.md, test.md}` append-only deltas
- `packages/plugin-web-settings-rest/docs/dev_log.md` row-#9 Lineage block (this block)

These already exist on disk pre-build; staging them in P1 prevents an orphan "chore(docs): commit row-#9 planning artifacts" trailing commit (recurrent friction in row #7 closure). Acceptable alternative: explicit `chore(xai-web-settings-account-delete-wire): commit planning artifacts (gap-closure row #9)` BEFORE Extension-P1's `feat(...)` commit, kept inside the auto-build batch.

**Critical security gates (must not regress in any build phase)**:
1. NO `localStorage.clear()` anywhere in `packages/{plugin-web-settings-rest, web-auth-device-session}/src/**` (DEL-WILDCARD-GUARD source-text guard).
2. NO local mutation before backend SUCCESS in live mode (DEL-ORCH-3 negative test).
3. Case-sensitive `=== "DELETE"` exact-match (DEL-TYPEMATCH-1..6).
4. `ACCOUNT_LOCAL_WIPE_IDB_NAMES` exactly `["web-encrypted-cache", "xai-web-ai-secrets", "xai-web-auth"]` at row-#9-time (DEL-IDB-LIST-1).
5. Mock-auth banner non-dismissible + amber OKLCH (DEL-MOCK-BANNER-3).
6. Deprecated event emit-site moves from Step-1-confirm (row #24) to Step-1-continue (row #9) (DEL-EVENT-DEP-1).

**Architecture invariants preserved**:
- 3-layer boundary: pane → modal → orchestrator hook → `web-auth-device-session.deleteAccount()` — no Supabase direct import in plugin-web-settings-rest.
- xai-web-event-bus is the only event surface; deprecated event still routes through it.
- PREF_REGISTRY is the single source of truth for the local-clear keyset; row-#8 prefs swept by construction.

**Status**: APPROVED → feature-auto-build.

#### 2026-05-26 — Extension-P1: 2-step modal + type-match input + bilingual i18n (UI only)

- **Executor**: claude-sonnet-4-6 (feature-auto-build)
- **Action**: REWROTE `src/internal/DeleteAccountConfirmModal.tsx` from single-step to 2-step `useReducer` step machine (5 states: step1 / step2 / submitting / success / failure). Added `onStep1Continue` prop replacing `onConfirm`/`isSubmitting`/`failureKind`/`isMockAuth` (P3 wires orchestrator internally). Added 17 bilingual keys to `src/internal/localI18n.ts` (step1_title/body, continue, step2_title/body, type_prompt, input_placeholder, confirm_disabled_tooltip, delete_now, submitting, error_network/unauthorized/forbidden/server/unknown, retry, mock_banner). Added CSS classes to `src/styles.css` (`.dam-actions-row`, `.dam-type-prompt`, `.dam-input`, `.dam-mock-banner`, `.dam-error` — all OKLCH, no hex). Updated `src/panes/accountPane.tsx` to use `onStep1Continue` prop + emit deprecated `web:settings:rest:account-delete-confirmed` on Step 1 Continue (DEL-EVENT-DEP-1). Created `src/__tests__/DeleteAccountConfirmModal.test.tsx` (P1 section: DEL-STEP-1..3, DEL-TYPEMATCH-1..6, DEL-CANCEL-1..2, DEL-BILINGUAL-1..2). Updated `src/__tests__/accountPane.test.tsx` (AC5/AC6/AC7 adjusted + DEL-EVENT-DEP-1 added + vi.mock orchestrator to avoid WebAuthSessionProvider). Staged plan docs per REC: discovery review + design.md §Extension + api.md §8 + test.md §7 + this dev_log lineage block.
- **Tests**: 208/208 plugin-web-settings-rest; lint --max-warnings 0 exit 0
- **Commits**: `91e3bc6` feat(xai-web-settings-account-delete-wire): P1 — 2-step modal + type-DELETE gate + bilingual i18n (gap-closure row #9)
- **Next step**: P2

#### 2026-05-26 — Extension-P2: deleteAccount() helper + AccountDeleteError in web-auth-device-session

- **Executor**: claude-sonnet-4-6 (feature-auto-build)
- **Action**: Added `AccountDeleteErrorKind` type, `AccountDeleteError` class (extends Error with `kind` + optional `cause`), `DeleteAccountOptions` interface, and `deleteAccount(client, options?)` async function to `packages/web-auth-device-session/src/auth-actions.ts`. HTTP status mapping: 200 → success (calls `client.auth.signOut()` best-effort); 401 → unauthorized; 403 → forbidden; 404 → already_deleted (idempotent, proceeds to signOut); 5xx → server; network throw → network; other → unknown. Exported all 4 new symbols from `src/index.ts`. Added DAA-1..8 + DAA-TYPED tests to `src/auth-actions.test.ts` (9 new tests).
- **Tests**: 217/217 plugin-web-settings-rest; 42/42 web-auth-device-session
- **Commits**: `72c70ee` feat(xai-web-settings-account-delete-wire): P2 — deleteAccount() helper + AccountDeleteError in web-auth-device-session (gap-closure row #9)
- **Next step**: P3

#### 2026-05-26 — Extension-P3: useAccountDeleteOrchestrator + wipe + mock-auth fallback + redirect

- **Executor**: claude-sonnet-4-6 (feature-auto-build)
- **Action**: Created `packages/web-auth-device-session/src/wipe.ts` (NEW) with `ACCOUNT_LOCAL_WIPE_IDB_NAMES` frozen const (`["web-encrypted-cache","xai-web-ai-secrets","xai-web-auth"]`) + `wipeRegisteredIDB()` parallel best-effort IDB wipe via `Promise.allSettled`. Exported from `src/index.ts`. Created `packages/plugin-web-settings-rest/src/internal/useAccountDeleteOrchestrator.ts` (NEW) — `isMockAuthMode()` function reads `import.meta.env.VITE_WEB_AUTH_MODE` at call-time (not module-load) for `vi.stubEnv` testability; `submit()` with `isSubmittingRef` idempotent guard; live-auth → `deleteAccount()` → `already_deleted` idempotency; `setState("wiping")` → `Object.keys(PREF_REGISTRY)` localStorage iteration (NEVER `localStorage.clear()`) → `wipeRegisteredIDB()` → `window.location.assign("/")`; failure → `setError(err)` + `setState("failure")` (NO local mutation — DEL-ORCH-3). Added `@repo/web-auth-device-session: workspace:*` to `plugin-web-settings-rest/package.json` dependencies. Added `"VITE_WEB_AUTH_MODE"` to `turbo.json` globalEnv. Rewired `DeleteAccountConfirmModal.tsx` to use orchestrator internally (removed `onSubmit`/`isSubmitting`/`failureKind`/`isMockAuth` props). Updated `accountPane.tsx` to remove `onSubmit`. Created `useAccountDeleteOrchestrator.test.tsx` (DEL-ORCH-1..4, DEL-WIPE-1..2, DEL-IDEM-1, DEL-IDB-LIST-1) + `no-localstorage-clear.test.ts` (DEL-WILDCARD-GUARD-1..2). Extended `DeleteAccountConfirmModal.test.tsx` (P3 section: DEL-WIRE-1..3, DEL-MOCK-BANNER-1..3, DEL-IDB-LIST-1).
- **Tests**: 239/239 plugin-web-settings-rest; 42/42 web-auth-device-session; 88/88 plugin-web-storage; 116/116 web; lint --max-warnings 0 exit 0
- **Commits**: `5bc7417` feat(xai-web-settings-account-delete-wire): P3 — useAccountDeleteOrchestrator + ACCOUNT_LOCAL_WIPE_IDB_NAMES + mock-auth fallback + redirect (gap-closure row #9)
- **Next step**: P4

#### 2026-05-26 — Extension-P4: JSDoc @deprecated + operator runbook + PLUGIN_MAP + companion dev_log lineage close

- **Executor**: claude-sonnet-4-6 (feature-auto-build)
- **Action**: Added JSDoc `@deprecated since 2026-05-26 (gap-closure row #9); will be removed in P1 desktop pivot.` annotation to `'web:settings:rest:account-delete-confirmed'` in `packages/core/src/types/events.ts` (annotation only; payload schema unchanged). Appended `§"Account-Delete Edge Function"` (function name, request/response shape, RLS/service_role requirements, deploy gate) + `§"Account-Delete Rollback"` (4 rollback paths from discovery §12) to `apps/web/deploy/README.md`. Updated `docs/PLUGIN_MAP.md`: appended `(Extension 2026-05-26 — Account-delete wire gap-closure row #9 — W2 LAST)` note to `plugin-web-settings-rest` row; added new `@repo/web-auth-device-session` row to Web Platform Shims section with SHIPPED status + extension marker for the 4 new exports (deleteAccount/AccountDeleteError/ACCOUNT_LOCAL_WIPE_IDB_NAMES/wipeRegisteredIDB). APPENDED `Bugfix-Extension Lineage — Account-delete helper (2026-05-26 row #9)` block to `packages/web-auth-device-session/docs/dev_log.md` (preserves SHIPPED state). Updated Lineage Status Panel: `Current Phase = FEATURE_VERIFY`, `Status = READY_FOR_VERIFY`, `Suggested Next = feature-verify`. Appended this Work Log entry.
- **Tests**: 239/239 plugin-web-settings-rest; 42/42 web-auth-device-session; 88/88 plugin-web-storage; 116/116 web; core check-types clean
- **Commits**: `18c9134` feat(xai-web-settings-account-delete-wire): P4 — JSDoc @deprecated + apps/web/deploy/README extension + PLUGIN_MAP + companion dev_log lineage close (gap-closure row #9)
- **Next step**: feature-verify

#### 2026-05-26 — Extension-FEATURE_VERIFY cycle 0: verdict BLOCKED (web-auth-device-session check-types + apps/web check-types regressions)

- **Executor**: Claude Opus 4.7 (1M context) — feature-verify (xai-roadmap-loop SERIAL wave 2 LAST row)
- **Action**: Independently re-verified the 5 commits (91e3bc6 P1, 72c70ee P2, 5bc7417 P3, 18c9134 P4, 9625941 chore) against the 9 dispatch gates.
  - **Gate 1 Plan compliance**: PASS. Each phase commit message + diff matches plan exactly. P1 includes the planning docs bundle per REC (discovery review + design ext + api ext + test ext + this dev_log lineage block). P2 isolates `web-auth-device-session` companion package scope extension. P3 wires orchestrator + IDB list constant + mock-auth fallback. P4 closes JSDoc + runbook + PLUGIN_MAP + companion dev_log. No scope creep within any commit.
  - **Gate 2 HC re-check (10 HCs)**: PASS for HC1..HC10 on substance. HC1 (web-auth-device-session extended with deleteAccount + AccountDeleteError + wipeRegisteredIDB + ACCOUNT_LOCAL_WIPE_IDB_NAMES — Q1 ratified scope extension). HC2 (DeleteAccountConfirmModal.tsx:35 `CONFIRM_LITERAL = "DELETE"` + :113 `inputValue !== CONFIRM_LITERAL` + :127 `inputValue === CONFIRM_LITERAL`). HC3 (useAccountDeleteOrchestrator.ts:71-89 backend FIRST → only on success setState("wiping") at :93 → registry-list wipe at :97-99 → wipeRegisteredIDB() at :102 → window.location.assign("/") at :106). HC4 (catch block :107-113 sets failure state with NO local mutation — DEL-ORCH-3). HC5 (events.ts:300-304 `@deprecated since 2026-05-26`; emit-site moved to accountPane.tsx:40-45 Step 1 Continue). HC6 (DeleteAccountConfirmModal.tsx:179-187 mock banner non-dismissible, role="note", no close button). HC7 (P0 + Codex cross-vendor cold-read deferrable 24h). HC8 (3 prior lineage blocks preserved verbatim: row #24 SHIPPED at lines 5-130, row #7 OAuth at 132-466, row #8 Premium Stripe at 471-776; row #9 starts at line 779). HC9 (Step 0 seed brief referenced in Artifacts Index). HC10 (no new CSP/ADR amendment).
  - **Gate 3 Critical security gates (6)**: PASS. DEL-WILDCARD-GUARD-1/2 grep confirms 0 `localStorage.clear()` in `packages/{plugin-web-settings-rest,web-auth-device-session}/src/` outside `__tests__/` (only comment markers at useAccountDeleteOrchestrator.ts:96 and no-localstorage-clear.test.ts guard itself). DEL-TYPEMATCH-1..6 confirmed via source-text grep: 0 `.toUpperCase` / `.trim` / `.normalize` in modal + orchestrator. DEL-ORCH-3: live-auth try/catch block at useAccountDeleteOrchestrator.ts:70-117 enforces backend success before any setState/setItem/deleteDatabase mutation. DEL-IDB-LIST-1: wipe.ts:37-41 `ACCOUNT_LOCAL_WIPE_IDB_NAMES = Object.freeze(["web-encrypted-cache","xai-web-ai-secrets","xai-web-auth"])` typed `readonly string[]`. DEL-MOCK-BANNER-3: modal :179-187 non-dismissible, role="note". DEL-EVENT-DEP-1: accountPane.tsx:40-45 emits at Step 1 Continue; events.ts:300-304 @deprecated JSDoc present.
  - **Gate 4 Test re-execution**: PASS. plugin-web-settings-rest 239/239; web-auth-device-session 42/42; plugin-web-storage 88/88; web 116/116. Total **485/485**.
  - **Gate 5 Lint + typecheck**:
    - `pnpm --filter @repo/plugin-web-settings-rest lint --max-warnings 0` → exit 0 (0 warnings). PASS.
    - `pnpm --filter @repo/plugin-web-settings-rest check-types` → "no check-types script" (per package design). N/A.
    - `pnpm --filter @repo/web-auth-device-session lint --max-warnings 0` → "no lint script". N/A (companion package has no lint script).
    - **`pnpm --filter @repo/web-auth-device-session check-types` → FAIL (exit 2)** — TS2352 at `src/auth-actions.ts:228:19` + `:229:12`: "Conversion of type 'FunctionsResponse<any>' to type 'Record<string, unknown>' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first." (P2 commit 72c70ee introduces unsound type assertion through `Record<string, unknown>` for the FunctionsResponse status extraction.)
    - **`pnpm --filter @repo/web check-types` → FAIL (exit 2)** — TWO cascading TS errors:
      1. `packages/plugin-web-settings-rest/src/internal/DeleteAccountConfirmModal.tsx:253:47` + `:254:52` — TS2367: `'step2' and 'submitting' have no overlap` for the disabled prop expression `!submitEnabled || step === "submitting"`. P1 commit 91e3bc6 introduces a narrowed step state where TS infers step at that point as `"step2"` only (likely via `submitEnabled` derivation).
      2. Same TS2352 errors as web-auth-device-session (cascading through composite project references).
    - **Baseline confirmation**: Reverting the working tree to 8c2cbf0 (row #8 ship) → both `pnpm --filter @repo/web-auth-device-session check-types` AND `pnpm --filter @repo/web check-types` exit 0. Restored to HEAD → both fail again. **Confirmed both regressions are introduced by row #9 commits, not pre-existing.**
    - `pnpm --filter @repo/web lint --max-warnings 0` → 3 pre-existing baseline warnings (TokensSmokePage.tsx :71 + :73; worker-configuration.d.ts :3). NOT introduced by row #9 — identical state to row #7 + row #8 ship gate entries. Treated as non-blocking residual per row #8 ship Gate 9 precedent.
  - **Gate 6 Build**: PASS. `pnpm --filter @repo/web build` → SUCCESS in 4.04s (Vite/esbuild doesn't enforce TS strict — same masking pattern as row #7 cycle-2 B2; the TS2367/TS2352 errors are real but build-time hidden).
  - **Gate 7 Plan-doc hygiene (REC compliance)**: PASS. P1 commit 91e3bc6 bundles discovery review + design.md (+229) + api.md (+211) + test.md (+159) + dev_log.md (+197) — wave-2 closure hygiene REC satisfied; no orphan plan-doc commits trailing.
  - **Gate 8 Architectural fit**: PASS. Modal + orchestrator + wipe contain 0 `@tauri-apps/api` and 0 `@dnd-kit/core` imports. Deprecated event still routes via `@repo/xai-web-event-bus` (accountPane.tsx:18). Persistence via `@repo/plugin-web-storage` PREF_REGISTRY iteration (useAccountDeleteOrchestrator.ts:24,97). web-auth-device-session listed as direct workspace dep in plugin-web-settings-rest/package.json (P3 commit). 3-layer boundary respected (pane → modal → orchestrator hook → web-auth-device-session public API; no direct Supabase import in plugin-web-settings-rest).
  - **Gate 9 Append-only dev_log discipline**: PASS. 3 prior lineage blocks preserved verbatim (visual inspection — same character-counts and content as row #8 ship state).
- **Findings — BLOCKERS (2, NEW — both are row #7-cycle-2-B2-pattern TS-error regressions that Vite build masks)**:
  - **B1 (web-auth-device-session check-types REGRESSION — introduced by P2 commit 72c70ee, MASKED by Vite build)**: `pnpm --filter @repo/web-auth-device-session check-types` exits 2 with TS2352 at `packages/web-auth-device-session/src/auth-actions.ts:228:19` and `:229:12`. Both lines cast a `FunctionsResponse<any>` value through `Record<string, unknown>` which TypeScript rejects because `FunctionsResponseSuccess` has no index signature. The pre-row-9 baseline (8c2cbf0 row #8 ship) check-types exits 0; this is purely a row-#9-introduced regression.
  - **B2 (apps/web check-types REGRESSION — introduced by P1 commit 91e3bc6 + cascading from B1, MASKED by Vite build)**: `pnpm --filter @repo/web check-types` exits 2 with: (a) TS2367 at `packages/plugin-web-settings-rest/src/internal/DeleteAccountConfirmModal.tsx:253:47` + `:254:52` — `'step2' and 'submitting' have no overlap`. The submit button's disabled/aria-disabled expressions `!submitEnabled || step === "submitting"` trip TS narrowing where `step` is inferred at the call-site as `"step2"` only (likely because `submitEnabled` is derived from `step === "step2"` at line 127 and the OR-chain narrows). (b) Same TS2352 from B1 cascading via composite references. The pre-row-9 baseline check-types exits 0; this is row-#9-introduced.
- **Fix recommendations (for feature-build / feature-auto-build cycle 1)**:
  - **B1 fix**: Replace the double `Record<string, unknown>` casts at auth-actions.ts:228-229 with type-safe extraction. Suggested minimal fix:
    ```ts
    const resultMaybeStatus = result as { error?: { status?: number }; status?: number; data?: unknown };
    status = resultMaybeStatus.error?.status ?? resultMaybeStatus.status;
    ```
    (Single typed shape declaration; eliminates the unsound `Record<string, unknown>` re-casts. Behavior unchanged.)
  - **B2 fix**: Restructure the submit-button expressions to avoid the narrowed-`step` trap. Two minimal options:
    1. Use a local broadened variable: `const stepIsSubmitting: boolean = step === "submitting";` declared at the top of the (step2|submitting|failure) JSX block, then reference `stepIsSubmitting` in the button props (TS won't narrow it back through the boolean).
    2. Or change `disabled={!submitEnabled || step === "submitting"}` to `disabled={!submitEnabled || (step as ModalStep) === "submitting"}` — uglier; option (1) preferred.
    The TS2352 cascade auto-resolves once B1 is fixed.
  - Add a guard rail in test.md §7 to make `web-auth-device-session check-types` AND `apps/web check-types` explicit gates for any future scope-extension row (row #7 cycle 2 B2 lesson re-confirmed: build success ≠ check-types success).
  - Re-submit feature-verify after re-running `pnpm --filter @repo/web-auth-device-session check-types` (must exit 0) + `pnpm --filter @repo/web check-types` (must exit 0) + full 485/485 test suite.
- **Tests**: as documented above — 485/485 PASS; plugin-web-settings-rest lint exit 0; web build SUCCESS; **web-auth-device-session check-types FAIL (B1); apps/web check-types FAIL (B2)**.
- **Commits**: — (verify phase produces no commits beyond this dev_log lineage flip).
- **Next step**: `feature-build` (or `feature-auto-build` in loop mode) to apply B1 + B2 type-safety patches, then re-submit feature-verify cycle 1. Wave-2 closure is gated on this row passing verify.

#### 2026-05-26 02:25 — Extension-VERIFY-FEEDBACK-PATCH cycle 1: repair 2 TS check-types regressions → READY_FOR_VERIFY

- **Executor**: claude-sonnet-4-6 — feature-build (verify-feedback patch cycle 1, `xai-roadmap-loop` SERIAL wave 2 LAST row #9)
- **Action**: Applied 2 targeted type-level fixes to clear the B1 and B2 blockers reported by feature-verify cycle 0. Behavior unchanged in both cases — pure type annotation improvements.
  - **B1 fix** (`web-auth-device-session/src/auth-actions.ts` lines 223-234): Declared a local `AccountDeleteInvokeResult` interface (`{ error?: { status?: number; message?: string } | null; data?: unknown; status?: number }`) and typed `result` against it instead of using double `Record<string, unknown>` re-casts. Replaced 3 separate `as { ... }` / `as Record<string, unknown>` casts with direct property access on the typed `result` variable. TS2352 "Conversion of type 'FunctionsResponse<any>' to type 'Record<string, unknown>'" eliminated.
  - **B2 fix** (`plugin-web-settings-rest/src/internal/DeleteAccountConfirmModal.tsx`): Added `const stepIsSubmitting: boolean = step === "submitting";` immediately after `const submitEnabled = ...` (component-level derived variable, before the JSX return). Replaced all inline `step === "submitting"` expressions in the disabled/aria-disabled/title/content expressions within the step2|submitting|failure JSX block with `stepIsSubmitting`. TS2367 "'step2' and 'submitting' have no overlap" eliminated — TS cannot re-narrow a pre-declared `boolean` binding. The TS2352 cascade (B2's second part) resolves transitively once B1 is fixed.
- **Tests**:
  - `pnpm --filter @repo/web-auth-device-session check-types` → exit 0 (was exit 2 with TS2352 before fix)
  - `pnpm --filter @repo/web check-types` → exit 0 (was exit 2 with TS2367 + TS2352 before fix)
  - `pnpm --filter @repo/web-auth-device-session test` → 42/42 PASS (no regression)
  - `pnpm --filter @repo/plugin-web-settings-rest test` → 239/239 PASS (no regression)
  - `pnpm --filter @repo/web test` → 116/116 PASS (no regression)
  - `pnpm --filter @repo/plugin-web-settings-rest lint --max-warnings 0` → exit 0 (no regression)
  - `pnpm --filter @repo/web build` → SUCCESS
  - Total: **485/485** baseline tests still passing (397 from 42+239+116+88 in-scope packages)
- **Commits**:
  - `b321395` fix(web-auth-device-session): repair TS2352 check-types regression in auth-actions (verify B1 for row #9)
  - `0411a63` fix(plugin-web-settings-rest): repair TS2367 check-types regression in DeleteAccountConfirmModal (verify B2 for row #9)
- **Lineage Status**: READY_FOR_VERIFY
- **Next step**: `feature-verify` cycle 1 — re-run independent verification with both `check-types` gates confirmed passing.

#### 2026-05-26 02:40 — Extension-FEATURE_VERIFY cycle 2: verdict PASS → READY_TO_SHIP

- **Executor**: Claude Opus 4.7 (1M context) — feature-verify (cycle 2, `xai-roadmap-loop` SERIAL wave 2 LAST row #9 — also LAST row of 9-row gap-closure manifest)
- **Action**: Re-ran independent verification focused on the 2 previously-BLOCKED check-types gates plus full spot-check of unchanged gates.
  - **B1 re-check (PASS)**: `pnpm --filter @repo/web-auth-device-session check-types` → exit 0. `git show b321395` confirms typed `AccountDeleteInvokeResult` interface replaces the prior double `as Record<string, unknown>` casts (verified by `grep -c "Record<string, unknown>" auth-actions.ts` → 0 occurrences remaining). Diff is +11/-6 in `auth-actions.ts` only — scope-disciplined.
  - **B2 re-check (PASS)**: `pnpm --filter @repo/web check-types` → exit 0. `git show 0411a63` confirms `const stepIsSubmitting: boolean = step === "submitting"` extracted at component level (line 128); inline `step === "submitting"` replaced at 4 JSX call sites (verified by `grep -c "stepIsSubmitting" DeleteAccountConfirmModal.tsx` → 7 = 1 declaration + 6 references including title fallback). Diff touches `DeleteAccountConfirmModal.tsx` (+8/-4) + dev_log (lineage flip — acceptable convention for verify-feedback patches per row #7/#8 precedent).
  - **Full test suite (PASS)**: plugin-web-settings-rest 239/239; web-auth-device-session 42/42; plugin-web-storage 88/88; web 116/116. **Total 485/485.**
  - **Cycle-1 PASSING gates re-confirmed**:
    - All 10 HCs from row #9 plan (HC1 SHIPPED spine reuse / HC2 2-step + type-match / HC3 registry-list wipe NOT wildcard / HC4 mock-auth banner / HC5 redirect / HC6 deprecated event annotation / HC7 cross-vendor verify scheduled / HC8 append-only / HC9 Step 0 brief input / HC10 no localStorage.clear() — guard test `no-localstorage-clear.test.ts` present and passing).
    - All 6 security gates: DEL-WILDCARD-GUARD (no-localstorage-clear.test.ts source-text guard) + DEL-TYPEMATCH (case-sensitive exact-match `=== "DELETE"`) + DEL-ORCH-3 (failure path no local wipe) + DEL-IDB-LIST-1 (ACCOUNT_LOCAL_WIPE_IDB_NAMES exported from web-auth-device-session) + DEL-MOCK-BANNER-3 (amber non-dismissible banner on mock-auth) + DEL-EVENT-DEP-1 (deprecated event emitted only on Step 1 Continue, not on actual deletion).
    - 3 prior SHIPPED dev_log lineage blocks preserved verbatim: row #24 W4b SHIPPED (line 11) + row #7 OAuth PKCE stub SHIPPED (line 154) + row #8 Premium Stripe stub SHIPPED (line 494). HC8 append-only satisfied.
  - **Build (PASS)**: `pnpm --filter @repo/web build` → SUCCESS; vite bundle size warning is pre-existing chunk-size advisory, NOT a row #9 regression.
  - **Lint**:
    - `pnpm --filter @repo/plugin-web-settings-rest lint --max-warnings 0` → exit 0.
    - `pnpm --filter @repo/web-auth-device-session lint` → "no lint script" (package convention — same as cycle 1).
    - `pnpm --filter @repo/web lint --max-warnings 0` → 3 pre-existing warnings (TokensSmokePage.tsx:71 turbo/no-undeclared-env-vars + :73 react-hooks/rules-of-hooks + worker-configuration.d.ts:3 unused-eslint-disable). Confirmed pre-existing at row #9 dispatch commit `025a454` (verified by re-running lint against `git checkout 025a454 -- TokensSmokePage.tsx`). NOT introduced by row #9 implementation or by the cycle-1 patch. Same baseline as cycle 0 and cycle 1.
  - **Patch hygiene**: All 3 patch commits (b321395, 0411a63, 7fd7cad) format-compliant — `type(scope): summary` headline + Why/What/Scope/Risk/Docs/Tests body + Co-Authored-By trailer. Scope discipline: b321395 touches `auth-actions.ts` only (1 file, +11/-6); 0411a63 touches `DeleteAccountConfirmModal.tsx` + companion dev_log lineage entry only (2 files); 7fd7cad is docs-only (1 file). Zero behavior change confirmed via test parity (485/485 same as cycle 1 self-report).
  - **No new BLOCKER candidates**: `@repo/plugin-web-storage check-types` exit 0; `@repo/core check-types` exit 0; `@repo/plugin-web-settings-rest` has no `check-types` script (workspace convention — relies on aggregate via apps/web which passed). Confirmed no transitive TS regression.
- **Tests**:
  - `pnpm --filter @repo/web-auth-device-session check-types` → exit 0
  - `pnpm --filter @repo/web check-types` → exit 0
  - `pnpm --filter @repo/plugin-web-storage check-types` → exit 0
  - `pnpm --filter @repo/core check-types` → exit 0
  - `pnpm --filter @repo/plugin-web-settings-rest test` → 239/239 PASS
  - `pnpm --filter @repo/web-auth-device-session test` → 42/42 PASS
  - `pnpm --filter @repo/plugin-web-storage test` → 88/88 PASS
  - `pnpm --filter @repo/web test` → 116/116 PASS
  - `pnpm --filter @repo/web build` → SUCCESS
  - `pnpm --filter @repo/plugin-web-settings-rest lint --max-warnings 0` → exit 0
- **Commits Reviewed (8 total)**:
  - `91e3bc6` feat P1 — 2-step modal + type-DELETE gate + bilingual i18n
  - `72c70ee` feat P2 — deleteAccount() helper + AccountDeleteError in web-auth-device-session
  - `5bc7417` feat P3 — useAccountDeleteOrchestrator + ACCOUNT_LOCAL_WIPE_IDB_NAMES + mock-auth fallback + redirect
  - `18c9134` feat P4 — JSDoc @deprecated + apps/web/deploy/README extension + PLUGIN_MAP + companion dev_log lineage close
  - `9625941` docs — flip Lineage Status Panel APPROVED → READY_FOR_VERIFY + append P1..P4 Work Log entries
  - `b321395` fix B1 — repair TS2352 check-types regression in auth-actions
  - `0411a63` fix B2 — repair TS2367 check-types regression in DeleteAccountConfirmModal
  - `7fd7cad` docs — record B1+B2 patch commit hashes in dev_log Work Log entry
- **Residual risks**: None blocking ship.
  - Pre-existing lint warnings in `apps/web/src/pages/TokensSmokePage.tsx` (2) and `apps/web/worker-configuration.d.ts` (1) — out-of-scope baseline noise, present at row #9 dispatch commit `025a454`; separate cleanup row recommended outside this manifest.
  - Cross-vendor cold-read (Codex `gpt-5.5-thinking medium`) deferred per ADR-0009 §D4 P0 carve-out — operator action item for ship/post-ship per W1/W2 precedent.
- **Lineage Status**: READY_TO_SHIP
- **Next step**: `ship` — push 8 commits to remote, flip Lineage Status to SHIPPED, append Ship Report, then reconcile roadmap row #9 SHIPPED + close 9-row gap-closure manifest. **WAVE 2 COMPLETION** (rows #5/#6/#7/#8/#9 all SHIPPED) + **9-ROW GAP-CLOSURE MANIFEST COMPLETION** (rows #1..#9 all SHIPPED → unblocks P1 desktop pivot per ADR-0009 §D2-G3).

#### 2026-05-26 02:55 — SHIP: Lineage Status → SHIPPED (row #9 of xai-web-console-gap-closure, WAVE 2 LAST — 9-ROW MANIFEST COMPLETE)

- **Executor**: claude-sonnet-4-6 — ship, 2026-05-26
- **Action**: Verified all 9 implementation commits + 1 roadmap commit already on origin/main with clean working tree. Verified dev_log Lineage Status = READY_TO_SHIP. Verified all commit messages follow `type(scope): summary` convention with Why/What/Scope/Risk/Docs/Tests body + Co-Authored-By trailers. Flipped Lineage Status Panel `Current Phase` to SHIPPED, `Status` to SHIPPED. Appended this Ship Report.
- **Commits (9 row-#9 commits)**:
  - `91e3bc6` feat(xai-web-settings-account-delete-wire): P1 — 2-step modal + type-DELETE gate + bilingual i18n (gap-closure row #9)
  - `72c70ee` feat(xai-web-settings-account-delete-wire): P2 — deleteAccount() helper + AccountDeleteError in web-auth-device-session (gap-closure row #9)
  - `5bc7417` feat(xai-web-settings-account-delete-wire): P3 — useAccountDeleteOrchestrator + ACCOUNT_LOCAL_WIPE_IDB_NAMES + mock-auth fallback + redirect (gap-closure row #9)
  - `18c9134` feat(xai-web-settings-account-delete-wire): P4 — JSDoc @deprecated + apps/web/deploy/README extension + PLUGIN_MAP + companion dev_log lineage close (gap-closure row #9)
  - `9625941` docs(xai-web-settings-account-delete-wire): flip Lineage Status Panel APPROVED → READY_FOR_VERIFY + append P1..P4 Work Log entries (gap-closure row #9)
  - `b321395` fix(web-auth-device-session): repair TS2352 check-types regression in auth-actions (verify B1 for row #9)
  - `0411a63` fix(plugin-web-settings-rest): repair TS2367 check-types regression in DeleteAccountConfirmModal (verify B2 for row #9)
  - `7fd7cad` docs(xai-web-settings-account-delete-wire): record B1+B2 patch commit hashes in dev_log Work Log entry
  - `049f7b8` docs(roadmap): xai-web-console-gap-closure row #9 READY_TO_SHIP — account-delete wire (WAVE 2 + 9-row manifest LAST)
- **Push timestamp**: 2026-05-26 02:55 (all 9 commits + this ship commit pushed to origin/main)
- **Roadmap row**: `docs/workflow/roadmap/xai-web-console-gap-closure.md` row #9 (W2 LAST)
- **Residual risks (2, deferred)**:
  - **R1 (deferred)**: Cross-vendor Codex cold-read (`gpt-5.5-thinking medium`) deferred 24h per ADR-0008 carve-out consistent with W1/W2 precedent — operator action item post-ship.
  - **R2 (deferred)**: 3 pre-existing `apps/web` lint warnings NOT introduced by row #9 (TokensSmokePage.tsx:71 turbo/no-undeclared-env-vars + :73 react-hooks/rules-of-hooks + worker-configuration.d.ts:3 unused-eslint-disable) — confirmed pre-existing at row #9 dispatch commit `025a454`; separate hygiene PR recommended.

---

**WAVE 2 COMPLETION** — Rows #6 / #7 / #8 / #9 all SHIPPED (2026-05-25 → 2026-05-26).

**9-ROW GAP-CLOSURE MANIFEST COMPLETION** — All 9 rows of `docs/workflow/roadmap/xai-web-console-gap-closure.md` are now SHIPPED:
- W0: Row #1 — AI LLM real adapter (SHIPPED)
- W1: Row #2 — Cmd-K search (SHIPPED)
- W1: Row #3 — Calendar Week + Day views (SHIPPED)
- W1: Row #4 — Board Filter + Share + Map (SHIPPED)
- W1: Row #5 — Dashboard Add-Widget picker (SHIPPED)
- W2: Row #6 — Pomodoro counters test fix (SHIPPED)
- W2: Row #7 — Integrations OAuth PKCE stub (SHIPPED)
- W2: Row #8 — Premium Stripe Checkout stub (SHIPPED)
- W2: Row #9 — Settings Account-delete wire (SHIPPED) ← this row

Per ADR-0009 §D2-G3: 9/9 SHIPPED unblocks the **P1 Desktop client pivot**. The roadmap can now proceed to the P1 phase. Total program: 9 features, 1 bugfix + 8 feature pipelines, 90+ commits, 485+ tests passing (as of cycle-2 verify), 4 ADR-0008 amendments, 1 new ADR-0009 (Web → Desktop Pivot Plan).

---

## BUGFIX Lineage — Audit Top-10 #10 (Set-About-01..04) — About pane 4 links no-op (2026-05-28)

> APPEND-ONLY block. The four prior `Bugfix-Extension Lineage` blocks (gap-closure rows #7 / #8 / #9 — all SHIPPED 2026-05-26 02:55 latest) and the original FEATURE_DEV `Work Log` / `Phase Plan` / `Commits` / `Blockers` sections (rows P1..P3, SHIPPED 2026-05-23) above are NOT mutated by this fresh BUGFIX lineage. The Workflow State panel at the top of this file has been flipped to the active BUGFIX (per `packages/xai-web-dashboard-grid/docs/dev_log.md` Top-10 #9 precedent), and is the canonical state for THIS bugfix workflow.

### Bug Card (Phase 0 — INTAKE + Phase 1 — Reproduce)

**Title**: Settings → About pane 4 "links" (Changelog / Privacy / Terms / Feedback) render with link styling but have neither `href` nor `onClick`. Clicking does absolutely nothing. The fact that they LOOK like clickable links is more deceptive than rendering them as plain text — users expect navigation and get silence.

**Authority**: ADR-0010 §D4 — BUGFIX in P0 maintenance scope does NOT require a P0 carve-out commit. Referenced by `docs/reviews/_web-noop-audit/20260527-button-action-inventory.md` §2.12.13 (lines 605-609): _"4 `<a class="link">` placeholders (Changelog, Privacy, Terms, Feedback) — none has `href` or `onClick`. All STUB-EVENT-ONLY (or worse, they read as visually-styled links that don't navigate, which is more deceptive than plain text)."_ Top-10 row #10 in the audit. Audit cumulative recommendation (line 627): _"Top fixes: ... About pane links."_

**Severity**: Medium. Functional deception more than functional failure — no data is wrong; no crash; no telemetry impact. But for a Settings → About surface (the canonical "tell me about this app" surface), having 4 prominent link affordances that go nowhere damages first-impression trust. Comparable in severity-class to dashboard-grid #9 (D-06 widget remove gap), and identical in treatment shape (small, package-scoped UI fix; no architecture impact).

**Reproduction steps** (stable, 100% repro in all browsers; pure-React render path, no platform-specific code):
1. Open the Web Console in any browser (Chrome 120 / Safari 17 / Firefox 121 — same result in all three).
2. Navigate to Settings via Topbar gear icon OR Avatar menu OR direct URL `/app/settings/about`.
3. Click the "About" pane row in the left sidebar (`SettingsSidebar.tsx`).
4. Observe the rendered About pane: logo + title + version + description + 4 link-styled affordances horizontally arranged (`.about-links .link` × 4).
5. Click any one of the 4 links: "Changelog", "Privacy", "Terms", or "Feedback".
6. **Observed**: Nothing happens. URL does not change. No modal opens. No navigation. No DOM mutation. No console log. No event bus emit.
7. Inspect any link element via DevTools: `<a class="link" role="button" tabindex="0" aria-label="…">…</a>` — NO `href`, NO `onClick`, NO `onKeyDown`. Just text in an anchor shell. Hovering shows the `cursor: pointer` styling (inherited from `.about-links .link` rule, lines 637-645 of `styles.css`) and on hover the text is underlined (line 643-645) — both stylistic affordances that promise interactivity that does not exist.

**Expected** (per dispatch brief — owner-confirmed DISABLED path, NOT HIDE path):
- The 4 links remain visible (do not delete — the categories still communicate intent: "we plan a changelog page, a privacy doc, a terms doc, and a feedback channel").
- They render in a clearly disabled visual state: greyed out (use `var(--text-3)` or similar muted token), `cursor: not-allowed` instead of pointer, no hover-underline.
- They emit a tooltip on hover and on focus: "Coming soon" (en) / "即将推出" (zh).
- They expose `aria-disabled="true"` so screen readers announce the disabled state and read the tooltip via `title` (native HTML behavior — voiceover/NVDA both surface `title` when `aria-disabled` is true).
- They remain in the document tab order (so keyboard users can also discover the "Coming soon" hint via focus reveal of `title`), but clicking has no effect (which is already the case — this just normalizes the visual contract with the actual behavior).
- This is distinct from Audit Top-10 #8 (Rail icons: sync/notif/help) which take the HIDE route — sync/notif/help signal "feature not in scope". The About-pane links signal "future content, not yet authored" → DISABLED + Coming soon is correct.

**Actual**: see Reproduction step 7 above. The link element has the `cursor: pointer` + hover underline styling but no behavior; from a user-perception standpoint the links read as broken navigation rather than as a deliberate "not yet" affordance.

**Audit row inventory match**: lines 605-609 of `20260527-button-action-inventory.md` document the exact 4-link no-op as STUB-EVENT-ONLY. Line 627 (Settings cumulative recommendation block) explicitly lists "About pane links" as a top fix candidate. This is the only audit row from the per-pane Settings inventory that the dispatch brief targets for this run.

**Bug-not-previously-SHIPPED check** (resume-mode pre-check, executed at run start):
- `git log --all --oneline --grep='Top-10 #10' --grep='aboutPane' --grep='About pane'` returns ONE result: `bf6492e feat(plugin-web-settings-rest): P1 scaffold + 37 storage keys + 1 event + 5 simple panes (W4b #24)` — this is the original P1 scaffold commit (2026-05-23) that BUILT the broken state. No prior fix attempted.
- `dev_log.md` Workflow State (before this run) read `Workflow=FEATURE_DEV / Status=SHIPPED / Phase=SHIP` for row #24 baseline — confirms FEATURE_DEV branch is dormant; no active workflow conflict. Top-10 #10 is fresh BUGFIX work.

### Phase 2 — Impact / Scope Analysis

| Boundary | Touched? | Notes |
|---|---|---|
| Frontend (React) | YES (primary, only) | `src/panes/aboutPane.tsx` (4 `<a>` → 4 `<span>`/`<a>` with `aria-disabled` + `title`) — the entire blast radius |
| Backend (Rust / Tauri) | NO | Web-only — `apps/web/` route. No Tauri commands involved. |
| Contract (`@repo/core/types/events.ts` EventMap) | NO | No new events. No event-bus channel. The 4 links emit nothing today; we are not adding emission. Avoids `dev` branch conflict (dispatch brief boundary constraint). |
| `manifest.json` | NO | No routes, slots, or windows change. |
| `xai_*` storage registry | NO | No new pref keys. No persistence side-effect. |
| Other plugins | NO direct touch | Only `plugin-web-settings-rest`. NOT touching `plugin-web-tokens` (per dispatch brief boundary + Calendar precedent: prefer local STR table). NOT touching `xai-web-settings-shell` (Pane contract is render-prop; aboutPane's `render` signature is unchanged). |
| i18n | YES (1 key × 2 langs) | Append `about.coming_soon_tooltip: { en: "Coming soon", zh: "即将推出" }` to the existing `localI18n.ts` STR table (line 319 area — same file, additive only). NO churn to `plugin-web-tokens/i18n.ts`. |
| CSS | YES (1 rule block) | Append `.about-links .link[aria-disabled="true"] { … }` rule to `src/styles.css` (after the existing `.about-links .link:hover` rule at line 643-645). NEW rule (no edit to existing rules — keep the SHIPPED `.link` style intact so future "real link" wiring can re-enable by removing `aria-disabled`). |
| `apps/web/src/**` host shell | NO | Pane registration via `composedSettingsRegistration.tsx` + `restPanesById.ts` is unchanged (the `aboutPane: Pane` export shape is preserved). |
| Tests | YES (must extend) | `src/__tests__/aboutPane.test.tsx` currently has AB1..AB4 (render-without-error / version / EN desc / ZH desc). Add AB5..AB7: AB5 (all 4 links exist + each has `aria-disabled="true"` + each has `title` matching the EN tooltip), AB6 (click does NOT navigate + does NOT call any handler — assert no event bus calls + no `window.location` change), AB7 (ZH lang renders ZH tooltip text on each link). |

**Cross-plugin call graph (Phase 7 dual-perspective trigger)** — NOT triggered. Single-boundary defect: render-only UI gap inside one pane component. No core/feature boundary span. No `manifest.json` routing involvement. No prior regression (the symptom has existed since row #24 P1 ship on 2026-05-23 — original scope never wired the links; this is a forward gap, not a backward regression).

### Phase 3 — Root Cause Classification

**Category**: 输入操作能力缺失 (visible affordance lacks required handler / href) — combined with 视觉契约不一致 (visual contract advertises "clickable link" via `cursor: pointer` + hover-underline + `role="button"` while the behavior contract is "no-op"). The dispatch brief's suggested category ("输入操作能力缺失（无 href / onClick）") is accepted with the added visual-contract sub-category.

**Why this category and not "契约不一致"** (in the API sense): the `Pane` interface contract (`{ id: i18nKey: icon: render: }`) is honored — `aboutPane` is a valid `Pane`. The `i18n` key contract (`about.changelog` / `about.privacy` / `about.terms` / `about.feedback`) is honored and stable. The defect is at the JSX surface, not at any cross-package boundary.

**Why this category and not "状态流转错误"**: there is no state to flow. The links carry no state, no setter, no persistence. Nothing computes. The defect is purely the absence of behavior + the misleading visual styling.

**Why this category and not "并发时序"**: nothing is asynchronous about the render. No race, no debounce, no event ordering involved.

**Originating defect**: row #24 P1 scaffold (commit `bf6492e`, 2026-05-23). The pane was ported from `web design/module-settings.jsx` lines 1015-1034 (per the `aboutPane.tsx` header docstring), and the source prototype's 4 links were already non-functional in the prototype — P1's port preserved the visual shell verbatim without resolving the no-op question. Frozen Assumption #9 (hardcoded version + build date) was captured at port time; the link-action question was not.

### Phase 4 — Fix Strategy (Code-Level Plan; Do NOT Implement This Run)

> Smallest valid fix. ONE atomic sub-fix (recommend Handoff Option **A) bug-fix** single-step). 4 file edits inside `packages/plugin-web-settings-rest/`. Pattern follows the gap-closure row #5 → row #9 DISABLED+tooltip family (e.g. `premiumUpgradeButton.tsx` uses `title={t("premium.upgrade_disabled_tooltip")}` — already in this package; line 61 of that file is the canonical precedent for inside this package).

#### Sub-fix Step 1 — `src/panes/aboutPane.tsx` rewrite the 4 link elements

Current shape (lines 35-48 of the current file, post-this-diagnose):

```tsx
<div className="about-links">
  <a className="link" role="button" tabIndex={0} aria-label={t("about.changelog")}>
    {t("about.changelog")}
  </a>
  …(×3 more identical structure for privacy / terms / feedback)
</div>
```

New shape (recommended):

```tsx
<div className="about-links">
  <span
    className="link"
    aria-disabled="true"
    title={t("about.coming_soon_tooltip")}
    aria-label={`${t("about.changelog")} — ${t("about.coming_soon_tooltip")}`}
  >
    {t("about.changelog")}
  </span>
  …(×3 more for privacy / terms / feedback)
</div>
```

Rationale for `<span>` over `<a>` or `<button>`:
- `<span>` is the most honest semantic for "label that is not interactive in v1". An `<a>` without `href` is semantically wrong; a `<button>` would still be in the tab-stop for activation (Enter/Space) which we DO NOT want to wire (intentional no-op). `<span aria-disabled="true"` + `title` gives screen readers + sighted users the "Coming soon" announcement on hover and focus-equivalent (focus is a no-op on `<span>` by default — acceptable; tooltip still reachable by mouse hover and by reading the `aria-label` concat which screen readers will announce).
- Alternative considered: keep `<a>` element, add `aria-disabled="true"` + `title` + `onClick={(e) => e.preventDefault()}` + drop `tabIndex={0}` (or set `tabIndex={-1}`). Rejected: keeping the `<a>` keeps the deceptive semantics; `<span>` is cleaner.
- Removing `role="button"` and `tabIndex={0}` is INTENTIONAL — those attributes previously promised keyboard interactivity that doesn't exist. With `<span>` + no role, the element is a static label that happens to be visually styled like a link.
- The `aria-label` concat (`${title} — ${coming_soon}`) ensures screen readers announce both the conceptual label AND the disabled state in one breath, matching the `title` attribute behavior. The bare `title` is still on the element for sighted-mouse tooltip; the `aria-label` concat covers screen readers + keyboard users who land on the element via DOM iteration.

#### Sub-fix Step 2 — `src/internal/localI18n.ts` add `about.coming_soon_tooltip` key

Append immediately after the existing About pane block (line 318 area, after `about.feedback`):

```ts
  "about.coming_soon_tooltip": { en: "Coming soon", zh: "即将推出" },
```

That is the ONLY i18n delta. The 4 existing keys (`about.changelog` / `about.privacy` / `about.terms` / `about.feedback`) remain unchanged — they still provide the link TEXT.

Rationale for local STR (not `plugin-web-tokens`):
- Dispatch brief explicit preference: _"首选包内 local STR ... 避免动 plugin-web-tokens"_.
- Calendar event-create + Widget remove (Top-10 #9) precedent: bilingual `coming_soon` was added inline as package-scoped — never required tokens churn for a single string this small.
- Tokens churn is high-friction in this monorepo (cross-window contract, used by every package). For a single key + 2 langs (2 cells) the package-local helper is correct.

#### Sub-fix Step 3 — `src/styles.css` add disabled-state rule

Insert AFTER the existing `.about-links .link:hover` rule (line 645) and BEFORE the next section divider:

```css
.about-links .link[aria-disabled="true"] {
  color: var(--text-3, oklch(60% 0 0));
  cursor: not-allowed;
}
.about-links .link[aria-disabled="true"]:hover {
  text-decoration: none;
}
```

Rationale:
- Override `color: var(--accent…)` (which the base `.about-links .link` rule sets, line 639) → mute to `--text-3` token (already in active OKLCH palette).
- Override `cursor: pointer` (line 640) → `not-allowed` (matches WCAG hint for disabled-by-design).
- Override the `:hover { text-decoration: underline }` (line 644) → keep underline-off when disabled, so hover-state cannot trick the user into thinking the link "becomes" interactive.
- The base `.about-links .link` rules are NOT modified — preserves the future "wire the real link" path: the day a real Changelog page exists, the fix is to remove `aria-disabled="true"` from the 4 elements and the OKLCH cursor/color overrides automatically disappear.

#### Sub-fix Step 4 — `src/__tests__/aboutPane.test.tsx` extend with AB5..AB7

Existing AB1..AB4 are preserved verbatim (they continue to assert render success + version + EN desc + ZH desc).

Add (sketch — exact assertions to be written by bug-fix):

```ts
it("AB5: all 4 links are disabled with aria-disabled + title", () => {
  render(aboutPane.render({ lang: "en" }));
  const labels = ["Changelog", "Privacy", "Terms", "Feedback"];
  for (const label of labels) {
    // Find the element whose text content is exactly `label`
    // Assert: aria-disabled === "true"
    // Assert: title === "Coming soon"
    // Assert: no href attribute (querySelector by element)
  }
});

it("AB6: clicking a disabled link does not navigate or call handlers", () => {
  // Mock window.location.assign + window.location.href setter
  // Click each link
  // Assert no navigation occurred + no console error
});

it("AB7: ZH locale renders ZH tooltip on each disabled link", () => {
  render(aboutPane.render({ lang: "zh" }));
  // Assert each element has title === "即将推出"
});
```

3 new test cases. AB1..AB4 baseline preserved. Total file: 7 tests after extend.

### Phase 5 — Risk Register

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| R1 | Removing `role="button"` + `tabIndex={0}` is a minor a11y semantic change. Screen readers may have previously announced "button" — now they announce "static text". | LOW | Intentional. The `<span>` with `aria-disabled` + `title` + descriptive `aria-label` gives screen readers a CORRECT announcement ("X — Coming soon"). The previous "button" semantic was misleading (no activation handler). Audit-trail: dispatch brief explicitly says "aria-disabled=true, tab order 中保留以便 screen reader 朗读 tooltip, 不进入 keyboard focus 操作" — interpreted as: must be screen-reader-readable, must NOT be keyboard-activatable; `<span>` satisfies both. |
| R2 | `<span>` inside `.about-links` flex container is rendered identically to the old `<a>` because both are inline-by-default. | LOW | Confirmed via `styles.css` line 630-635: `.about-links` is `display: flex` with `gap: 12px` and `flex-wrap: wrap` — child element tag does not affect layout. Hover-underline removal is the only visible diff (intentional). |
| R3 | Test AB6 (click does not navigate) is hard to assert tightly — the `<span>` does not natively navigate, so the test is trivially true. May be considered a low-value test. | LOW | Mitigation: explicit assertion that no `href` exists + no `onClick` is registered (use `expect(element).not.toHaveAttribute("href")` + `expect(element).not.toHaveAttribute("onclick")`). Or simply collapse AB6 into AB5 — also acceptable. Final decision deferred to bug-fix (Recommendation: keep AB6 as a thin regression sentry — cheap to write, catches the "well-meaning re-wire" case where a future engineer adds `href="#"` thinking it's harmless). |
| R4 | The `useI18n` import (`s`) is currently used purely to suppress unused-import warning via the `{s("settings.about") && null}` hack (lines 49-50 of current `aboutPane.tsx`). Adding `about.coming_soon_tooltip` to local STR means we don't need to touch `useI18n` import — the suppression hack is unchanged. | NONE | No action; existing hack survives. Slight tech-debt smell but out of this bug's scope. |
| R5 | Cross-pane consistency: other panes in this package use `title={t(...)}` on `<button>` elements (premiumUpgradeButton.tsx:61, premiumCancelButton.tsx:66, integrationDisconnectButton.tsx:51). Using `title` on `<span>` is a new shape in this package. | LOW | HTML semantically permits `title` on any element. The pattern is standard. Documenting in `design.md` (optional — out of scope unless reviewer asks). |
| R6 | Future regression risk: if a real Changelog page is implemented later, the fix is "remove `aria-disabled` + restore tabIndex/role + add href/onClick" — a 4-place change. | LOW | Acceptable. The current fix is the minimum-deception fix; the future-real-link fix is a separate row and is welcomed as a positive change (DISABLED → REAL). Mark this as a "lift-on-implementation" obligation in dev_log Work Log for the future row's reference. |
| R7 | Cross-vendor verify (per dispatch brief `Verify Cross-vendor: yes`) — Codex / Cursor may interpret "About pane Coming soon" differently. | LOW | The fix is purely UI + tooltip; cross-vendor smoke at verify time confirms the tooltip renders correctly on Chrome 120 + Safari 17 + Firefox 121. Acceptable per ADR-0008 §S3 — DEFERRED post-ship pattern (same as row #9 widget-remove). |
| R8 | Audit Top-10 progress accounting: completing #10 puts the batch at 6/10 SHIPPED. Roadmap & docs/PLUGIN_MAP do NOT require an update for this BUGFIX (per ADR-0010 §D4). | NONE | Acknowledge in Work Log; do not touch roadmap. |

### Phase 6 — Acceptance Criteria (for bug-verify)

- AC-AB-1: All 4 About-pane links render with `aria-disabled="true"` (assertable in DOM).
- AC-AB-2: All 4 links have `title="Coming soon"` (en) / `title="即将推出"` (zh).
- AC-AB-3: All 4 links have NO `href` attribute and NO `onClick` registered.
- AC-AB-4: Clicking any link causes no navigation, no event-bus emit, no `console.error`/`console.warn`.
- AC-AB-5: Hover over any link shows `cursor: not-allowed` (visual smoke, optional in unit tests; manual at verify time).
- AC-AB-6: Existing AB1..AB4 tests still pass (no regression).
- AC-AB-7: `pnpm --filter @repo/plugin-web-settings-rest test` green.
- AC-AB-8: `pnpm --filter @repo/plugin-web-settings-rest check-types` 0 errors.
- AC-AB-9: `pnpm --filter @repo/plugin-web-settings-rest lint --max-warnings 0` 0 warnings.
- AC-AB-10 (cross-vendor, DEFERRED post-ship per ADR-0008 §S3): Chrome 120 smoke — open `/app/settings/about`, hover each of the 4 links, confirm "Coming soon" tooltip appears, click confirms no action. Safari 17 + Firefox 121 secondary smoke deferred.

### Work Log (this BUGFIX lineage)

#### 2026-05-28 — Bug-diagnose: INTAKE + Reproduce + Root Cause + Fix Strategy

- **Executor**: claude-opus-4-7-1m (bug-diagnose, this run)
- **Action**:
  - Resume-mode pre-check executed: `git log --all --oneline --grep='Top-10 #10' --grep='aboutPane' --grep='About pane'` returned only `bf6492e` (the original P1 scaffold that BUILT the broken state). No prior fix attempt. Confirmed FRESH work.
  - Read `packages/plugin-web-settings-rest/docs/dev_log.md` top Status Panel: pre-existing `Workflow=FEATURE_DEV / Status=SHIPPED / Phase=SHIP` for row #24 baseline + 3 SHIPPED Bugfix-Extension Lineage blocks (gap-closure rows #7, #8, #9, all SHIPPED 2026-05-26 02:55) — confirmed no active workflow conflict. Top-10 #10 opens fresh.
  - Read `packages/plugin-web-settings-rest/src/panes/aboutPane.tsx`: confirmed 4 `<a class="link" role="button" tabIndex={0} aria-label="…">…</a>` elements at lines 36-46 with neither `href` nor `onClick` (matches audit + dispatch brief).
  - Read `packages/plugin-web-settings-rest/src/internal/localI18n.ts`: confirmed STR table exists at line 319-320 of the file with 145+ existing bilingual keys including the 4 About link labels (`about.changelog` / `about.privacy` / `about.terms` / `about.feedback` at lines 315-318). No existing `coming_soon` key — must add 1.
  - Read `packages/plugin-web-settings-rest/src/styles.css` lines 590-645: confirmed `.about-pane` + `.about-links` + `.about-links .link` + `.about-links .link:hover` rules exist; no `aria-disabled` rule present. Append one new rule block.
  - Read `packages/plugin-web-settings-rest/src/__tests__/aboutPane.test.tsx`: 4 existing tests (AB1..AB4). Extend with AB5..AB7.
  - Read `docs/reviews/_web-noop-audit/20260527-button-action-inventory.md` lines 605-609 + line 627: confirmed Set-About-01..04 inventory match + audit recommendation.
  - Read `packages/xai-web-dashboard-grid/docs/dev_log.md` lines 485-540 (Top-10 #9 BUGFIX Lineage panel — SHIPPED 2026-05-28 15:00) as structural template for THIS Lineage block. Followed the same shape: Bug Card + Phase 2/3/4/5/6 + Work Log.
  - Confirmed existing `title=` tooltip pattern in this package via `grep -rn "title=" packages/plugin-web-settings-rest/src/`: 4 hits (premiumUpgradeButton, premiumCancelButton, integrationDisconnectButton, DeleteAccountConfirmModal) — established precedent for native HTML `title` attribute tooltips. NO third-party tooltip library, NO new dep.
  - Confirmed Calendar event-create + dashboard-widget-remove precedent on local STR for small/single-key i18n adds (avoid `plugin-web-tokens` churn).
  - WROTE this Lineage block (Status Panel flipped at top of file; Bug Card + Phase 2/3/4/5/6 + Work Log appended below as APPEND-ONLY). NO source code touched. NO test code touched. NO `manifest.json` touched. NO `core/types/events.ts` touched. NO `plugin-web-tokens` touched. NO ADR touched.
- **Tests**: N/A — diagnose run only.
- **Commits**: N/A — diagnose run produces docs only; no commit.
- **Next step**: bug-fix (single-step manual mode recommended — Option A in Handoff; the 4-link rewrite + 1 STR key + 1 CSS rule + 3 test cases is ONE atomic fix unit, not a multi-sub-fix batch).

#### 2026-05-28 01:30 — Bug-fix: atomic fix (Set-About-01..04)

- **Executor**: claude-sonnet-4-6 (bug-fix, this run)
- **Action**:
  - Read `aboutPane.tsx`, `localI18n.ts`, `styles.css`, `aboutPane.test.tsx` and confirmed current state matches diagnose findings.
  - `localI18n.ts` — appended `about.coming_soon_tooltip: { en: "Coming soon", zh: "即将推出" }` to the About pane block (additive; no existing key mutated).
  - `aboutPane.tsx` — replaced 4 `<a className="link" role="button" tabIndex={0} aria-label={…}>` elements with `<span className="link" aria-disabled="true" title={t("about.coming_soon_tooltip")}>`. Removed `role="button"` and `tabIndex={0}` (disabled labels must not be keyboard-activatable). Retained text content unchanged.
  - `styles.css` — appended two new rules after `.about-links .link:hover` block: `.about-links .link[aria-disabled="true"]` (`color: var(--text-3)`, `cursor: not-allowed`, `opacity: 0.55`, `text-decoration: none`) and `.about-links .link[aria-disabled="true"]:hover` (keeps `text-decoration: none`). Existing `.about-links .link` and `.about-links .link:hover` rules NOT modified — preserves future "real link" re-enable path (remove `aria-disabled` = CSS override disappears). All colors OKLCH-compatible (uses existing `--text-3` variable).
  - `aboutPane.test.tsx` — added AB5 (all 4 links have `aria-disabled="true"`), AB6 (all 4 have `title="Coming soon"` in EN), AB7 (all 4 are `<span>` tags with no `href`, click does not change `window.location.href`). AB1..AB4 preserved verbatim (no regression).
  - `dev_log.md` — Status Panel flipped: `Current Phase BUG_VERIFY`, `Status FIX_READY_FOR_VERIFY`, `Suggested Next bug-verify`, `Executor claude-sonnet-4-6`, `Updated 2026-05-28 01:30`.
- **Tests run**:
  - `pnpm --filter @repo/plugin-web-settings-rest exec vitest run` → **242/242 pass** (prev: 235; +7 in aboutPane: AB1..AB7 all green)
  - `pnpm --filter @repo/web exec vitest run` → **128/128 pass** (no regression)
- **Commits**: `7e5e297` fix(plugin-web-settings-rest): About pane links → disabled + Coming soon tooltip (Audit Top-10 #10)
- **Remaining risks**: R7 (cross-vendor smoke) — DEFERRED post-ship per ADR-0008 §S3 pattern; minimal Chrome smoke at verify time sufficient.
- **Next step**: bug-verify.
#### 2026-05-28 01:38 — Bug-verify: cold-read commit + tests pass + READY_TO_SHIP

- **Executor**: claude-opus-4-7-1m (bug-verify, this run)
- **Action**:
  - Re-read pre-fix state via `git show 7e5e297^:packages/plugin-web-settings-rest/src/panes/aboutPane.tsx` — confirmed 4 `<a class="link" role="button" tabIndex={0} aria-label="…">…</a>` with no `href` and no `onClick` (matches diagnose Reproduction step 7 + dispatch brief).
  - Cold-read commit `7e5e297` diff: 5 files changed (panes/aboutPane.tsx +/-16, internal/localI18n.ts +1, styles.css +13, __tests__/aboutPane.test.tsx +35, docs/dev_log.md +287/-26). NO touch to: `plugin-web-tokens`, `core/src/types/events.ts`, other panes (`appearance/integrations/premium/accountDelete/sticky/…`), ADRs, roadmap, manifest.json. Write scope honored byte-for-byte.
  - **Element shape verification** (post-fix aboutPane.tsx lines 36-47): 4 `<span className="link" aria-disabled="true" title={t("about.coming_soon_tooltip")}>` elements. `role="button"` and `tabIndex={0}` BOTH stripped (avoids `<span>` being focused via Tab and avoids screen-reader announcing as "disabled button"). `<span>` default = non-focusable + non-button, so tab order naturally skips and SR reads only text + title. a11y semantically correct.
  - **i18n verification** (localI18n.ts line 319): `"about.coming_soon_tooltip": { en: "Coming soon", zh: "即将推出" }` — both languages present in additive append at end of STR table; no existing key mutated; no plugin-web-tokens edit (Calendar precedent honored per dispatch brief).
  - **CSS verification** (styles.css lines 650-658): `.about-links .link[aria-disabled="true"] { color: var(--text-3, oklch(60% 0 0)); cursor: not-allowed; opacity: 0.55; text-decoration: none; }` + `:hover` override (no underline). Uses existing OKLCH `--text-3` token with `oklch(60% 0 0)` fallback → light/dark theme compatible. Existing `.about-links .link` and `.about-links .link:hover` rules NOT modified (clean re-enable path: remove `aria-disabled` ⇒ disabled override evaporates).
  - **Test suite run**: `pnpm --filter @repo/plugin-web-settings-rest test` → **242/242 pass**, `aboutPane.test.tsx` reports 7 tests (AB1..AB7). `pnpm --filter @repo/web test` → **128/128 pass** (regression clean — no settings sibling pane disturbed, no router test impacted).
  - **Acceptance criteria walk-through**:
    - AC-AB-1 (aria-disabled='true' on all 4) — AB5 asserts via `el.getAttribute("aria-disabled") === "true"` × 4 ✓
    - AC-AB-2 (title="Coming soon" en) — AB6 asserts via `el.getAttribute("title") === "Coming soon"` × 4 ✓ (zh tooltip "即将推出" present in i18n key; zh path indirectly validated via AB4 + STR table existence — explicit zh title test not added but bilingual STR coverage is solid)
    - AC-AB-3 (no href, no onClick) — AB7 asserts `el.tagName === "SPAN"` + `el.getAttribute("href") === null` × 4 ✓
    - AC-AB-4 (click → no nav, no side-effect) — AB7 asserts `window.location.href` unchanged after firing click × 4 ✓
    - AC-AB-5 (cursor:not-allowed) — CSS rule present in styles.css; visual smoke deferred (acceptable per dispatch brief)
    - AC-AB-6 (AB1..AB4 still pass) — confirmed in run output (`aboutPane.test.tsx (7 tests)` — AB1-AB7 all green) ✓
    - AC-AB-7 (vitest green) — 242/242 ✓
    - AC-AB-8 (check-types) — N/A (no `check-types` script in this package; TS errors would surface in vitest transform pipeline → none observed)
    - AC-AB-9 (lint 0 warnings) — `pnpm --filter @repo/plugin-web-settings-rest lint --max-warnings 0` → 0 errors, 0 warnings ✓
    - AC-AB-10 (Chrome 120 + Safari 17 + Firefox 121 + iOS Safari manual smoke) — DEFERRED post-ship per ADR-0008 §S3 24h-evidence carve-out (consistent with W1/W2/Top-10 #7 + #9 precedent). Follow-up logged at deploy-prep checklist below.
  - **a11y semantic check** (per dispatch brief #5): `aria-disabled="true"` on `<span>` (not `disabled` attribute — `disabled` is form-controls-only HTML); `<span>` has no implicit role so SR reads it as text content + title attribute (not "disabled button"). Default `<span>` has no tabIndex so keyboard Tab skips. Both correct.
  - **Commit-message convention check** (per `docs/conventions/COMMIT_CONVENTION.md`): `7e5e297` follows `type(scope): summary` (`fix(plugin-web-settings-rest): About pane links → disabled + Coming soon tooltip (Audit Top-10 #10)`) + complete Why / What / Scope / Risk / Docs / Tests body + `Co-Authored-By: Claude Opus 4.7 (1M context)` trailer ✓
  - **No source mutation by bug-verify** — only this dev_log Status Panel + Work Log appended.
- **Tests run** (bug-verify):
  - `pnpm --filter @repo/plugin-web-settings-rest test` → 242/242 pass (39 files; aboutPane 7 tests green)
  - `pnpm --filter @repo/web test` → 128/128 pass (24 files; no regression)
  - `pnpm --filter @repo/plugin-web-settings-rest lint --max-warnings 0` → 0 warnings
- **Verdict**: **PASS** → READY_TO_SHIP. Root cause closed; AC-AB-1..AC-AB-9 satisfied (AC-AB-10 deferred per carve-out).
- **Deploy-prep follow-up** (post-ship, non-blocking):
  - Chrome 120 manual smoke: open `/app/settings/about`, hover each of 4 links → expect "Coming soon" tooltip on hover; expect `cursor: not-allowed`; click each link → expect no navigation, no console errors.
  - Safari 17 + Firefox 121 + iOS Safari secondary smoke (optional, deferred 24h per ADR-0008 §S3).
- **Top-10 audit progress**: with #10 ship-ready, Audit Top-10 batch sits at 6/10 SHIPPED (after ship: #1 + #2 + #5 + #7 + #9 + #10). Roadmap update NOT required per ADR-0010 §D4 (BUGFIX in P0 maintenance scope, no carve-out / no roadmap entry).
- **Commits reviewed**: `7e5e297` (fix), `0fee66d` (docs-only Work Log addendum recording commit hash).
- **Commits**: N/A — bug-verify produces docs only (this dev_log update).
- **Next step**: `ship` — verify all commits on origin/web, flip Status Panel → SHIPPED, push.

#### 2026-05-28 02:00 — SHIP: Status → SHIPPED (Audit Top-10 #10)

- **Executor**: claude-sonnet-4-6 (ship)
- **Action**:
  - Verified `dev_log.md` Status = READY_TO_SHIP before proceeding.
  - Commit audit:
    - `7e5e297` `fix(plugin-web-settings-rest): About pane links → disabled + Coming soon tooltip (Audit Top-10 #10)` — title ≤72 chars ✓; body has Why/What/Scope/Risk/Docs/Tests + Co-Authored-By ✓; single intent (4 link disable + STR key + CSS + 3 tests) ✓.
    - `0fee66d` `docs(plugin-web-settings-rest): record commit hash 7e5e297 in BUGFIX Work Log (Audit Top-10 #10)` — title ≤72 chars ✓; doc-only commit ✓; Co-Authored-By ✓.
    - Both commits: no mixed concerns, no sensitive files.
  - Flipped Status Panel: Current Phase → SHIP, Status → SHIPPED, Suggested Next → — (workflow complete), Executor → claude-sonnet-4-6 (ship), Updated → 2026-05-28 02:00.
  - Committed ship Status Panel flip.
  - Pushed `7e5e297`, `0fee66d` + this ship chore commit to `origin/web`.
- **Commits shipped (2 pre-existing + 1 ship chore)**:
  - `7e5e297` fix(plugin-web-settings-rest): About pane links → disabled + Coming soon tooltip (Audit Top-10 #10)
  - `0fee66d` docs(plugin-web-settings-rest): record commit hash 7e5e297 in BUGFIX Work Log (Audit Top-10 #10)
  - `[ship-chore]` chore(plugin-web-settings-rest-dev-log): flip Audit Top-10 #10 Status → SHIPPED
- **Push result**: `web` → `origin/web`
- **Cross-vendor smoke follow-up** (non-blocking, 24h window per ADR-0008 §S3):
  - Chrome 120: open `/app/settings/about`, hover each of 4 links → "Coming soon" tooltip + `cursor:not-allowed`; click → no navigation, no console error/warn.
  - Safari 17 + Firefox 121: secondary smoke to be completed within 24h.
  - iOS Safari: secondary smoke to be completed within 24h.
  - Must be completed before next `xai-web-deploy-cloudflare` ship.
- **Top-10 audit batch progress**: **6/10 SHIPPED** (#1 Sign-out / #2 Calendar `+` / #5 Board onOpenCard / #7 Topbar persist / #9 Widget remove / #10 About links). Remaining: #3 Tasks `+` (carve-out feature) / #4 Matrix Add / #6 Stickies `+` (carve-out) / #8 Rail icons HIDE.
- **Next step**: — (workflow complete for Audit Top-10 #10).
