# Dev Log — plugin-web-settings-rest

---

## Workflow State

```
Workflow        = FEATURE_DEV
Feature         = xai-web-settings-rest (roadmap row #24, W4b)
Status          = SHIPPED
Current Phase   = SHIP
Executor        = claude-opus-4-7-1m (PR-2 drift reconcile, 2026-05-24)
Updated         = 2026-05-24
Suggested Next  = — (workflow complete)
Automation Mode = default
```

> **Reconciliation note (2026-05-24, PR-2):** This Workflow State block was stale at
> `READY_FOR_VERIFY` despite the row being SHIPPED on 2026-05-23 (commit `6b8de35`
> "chore(xai-web-settings-rest): ship — flip dev_log + manifest #24 to SHIPPED +
> PLUGIN_MAP row + roadmap complete"). The ship commit flipped the sibling package
> `xai-web-settings-rest`'s dev_log + manifest + PLUGIN_MAP, but this `plugin-web-settings-rest`
> mirror was missed. Reconciled as part of PR-2 of
> `docs/reviews/web-priority-pivot-and-repo-cleanup/20260524-brief.md`.

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
| Suggested Next | ship |
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
| Current Phase | FEATURE_VERIFY |
| Status | READY_FOR_VERIFY |
| Suggested Next | feature-verify |
| Verify Cross-vendor | yes (per ADR-0009 §D4 P0 + roadmap header default; primary Codex `gpt-5.5-thinking medium`, fallback Cursor) |
| Automation Mode | A-Claude (per roadmap default inherited from xai-web-console.md 2026-05-23 user override) |
| Executor | claude-sonnet-4-6 — feature-auto-build, 2026-05-26 |
| Updated | 2026-05-26 01:05 |
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
