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
| Current Phase | FEATURE_VERIFY |
| Status | READY_FOR_VERIFY |
| Suggested Next | feature-verify |
| Verify Cross-vendor | yes (per ADR-0009 §D4 P0 + roadmap header default; primary Codex `gpt-5.5-thinking medium`, fallback Cursor) |
| Automation Mode | A-Claude (per roadmap default inherited from xai-web-console.md 2026-05-23 user override) |
| Executor | claude-sonnet-4-6 — feature-auto-build, 2026-05-25 |
| Updated | 2026-05-25 |
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

