# Test Strategy — plugin-web-settings-rest

> **Package**: `@repo/plugin-web-settings-rest`
> **Test runner**: Vitest 3 + jsdom + @testing-library/react
> **Status**: SHIPPED — all 81 tests pass

---

## §1 Environment

- `vitest.config.ts`: jsdom environment
- `vitest.setup.ts`: `@testing-library/jest-dom/vitest` + `afterEach` localStorage.clear
- All tests in `src/__tests__/`

## §2 Mock Strategy

- **localStorage**: real jsdom localStorage (cleared afterEach)
- **emitWebEvent**: `vi.spyOn(@repo/xai-web-event-bus, "emitWebEvent")` per test
- **dialog**: jsdom does not implement `showModal()`/`close()`; both calls are
  guarded by `typeof dialog.method === "function"` in the component

## §3 Test Matrix

### P1 — Scaffold + 5 simple panes

| Test ID | File | Description |
|---------|------|-------------|
| B1 | index-barrel.test.ts | All 11 panes exported with correct ids |
| B2 | index-barrel.test.ts | restPanesById has 11 entries |
| B3 | index-barrel.test.ts | applyRestPanesToRegistry exported as function |
| NH1 | no-hex-literals.test.ts | No hex literals in src ts and tsx files |
| AC1 | accountPane.test.tsx | Renders without error |
| AC2 | accountPane.test.tsx | ZH shows Chinese name |
| AC3 | accountPane.test.tsx | EN shows English name |
| AC4 | accountPane.test.tsx | Delete Account button present |
| AC5 | accountPane.test.tsx | Delete opens dialog |
| AC6 | accountPane.test.tsx | Cancel does not emit event |
| AC7 | accountPane.test.tsx | Confirm emits event exactly once |
| AC8 | accountPane.test.tsx | id + icon + i18nKey correct |
| PR1 | premiumPane.test.tsx | Renders without error |
| PR2 | premiumPane.test.tsx | Bilingual headline |
| PR3 | premiumPane.test.tsx | id + icon + i18nKey correct |
| CL1 | collaboratePane.test.tsx | Renders without error |
| CL2 | collaboratePane.test.tsx | EN labels present |
| CL3 | collaboratePane.test.tsx | ZH labels present |
| CL4 | collaboratePane.test.tsx | Toggle persists pref |
| HK1 | hotkeysPane.test.tsx | Renders without error |
| HK2 | hotkeysPane.test.tsx | 10 rows rendered |
| HK3 | hotkeysPane.test.tsx | id + icon + i18nKey correct |
| AB1 | aboutPane.test.tsx | Renders without error |
| AB2 | aboutPane.test.tsx | Shows version string |
| AB3 | aboutPane.test.tsx | Bilingual description |
| AB4 | aboutPane.test.tsx | id + icon + i18nKey correct |

### P2 — 5 mid-weight panes

| Test ID | File | Description |
|---------|------|-------------|
| SL1 | smartListsPane.test.tsx | Renders without error |
| SL2 | smartListsPane.test.tsx | 12 rows rendered |
| SL3 | smartListsPane.test.tsx | EN section headers |
| SL4 | smartListsPane.test.tsx | ZH section headers |
| SL5 | smartListsPane.test.tsx | Changing select persists pref |
| SL6 | smartListsPane.test.tsx | id + icon + i18nKey correct |
| NF1 | notificationsPane.test.tsx | Renders without error |
| NF2 | notificationsPane.test.tsx | Master toggle present |
| NF3 | notificationsPane.test.tsx | EN labels present |
| NF4 | notificationsPane.test.tsx | ZH labels present |
| NF5 | notificationsPane.test.tsx | Toggle persists notif_enabled |
| NF6 | notificationsPane.test.tsx | Sound select persists notif_done_sound |
| NF7 | notificationsPane.test.tsx | Quiet hours toggle shows time inputs |
| NF8 | notificationsPane.test.tsx | Time inputs hidden when quiet=false |
| NF9 | notificationsPane.test.tsx | id + icon + i18nKey correct |
| DT1 | dateTimePane.test.tsx | Renders without error |
| DT2 | dateTimePane.test.tsx | Start week select present |
| DT3 | dateTimePane.test.tsx | EN labels present |
| DT4 | dateTimePane.test.tsx | ZH labels present |
| DT5 | dateTimePane.test.tsx | Changing start week persists pref |
| DT6 | dateTimePane.test.tsx | id + icon + i18nKey correct |
| MP1 | morePane.test.tsx | Renders without error |
| MP2 | morePane.test.tsx | EN labels present |
| MP3 | morePane.test.tsx | ZH labels present |
| MP4 | morePane.test.tsx | SettingRow label is plain string |
| MP5 | morePane.test.tsx | Language select read-only |
| MP6 | morePane.test.tsx | Window type select persists pref |
| MP7 | morePane.test.tsx | 3 template cards rendered |
| MP8 | morePane.test.tsx | Reset clears More keys, leaves others |
| MP9 | morePane.test.tsx | ZH template names |
| MP10 | morePane.test.tsx | id + icon + i18nKey correct |
| IN1 | integrationsPane.test.tsx | 17 integration cards rendered |
| IN2 | integrationsPane.test.tsx | 3 section headers rendered |
| IN3 | integrationsPane.test.tsx | EN section headers |
| IN4 | integrationsPane.test.tsx | ZH section headers |
| IN5 | integrationsPane.test.tsx | Card click is no-op (no console.warn) |
| IN6 | integrationsPane.test.tsx | No emitWebEvent on card click |

### P3 — Sticky pane + host wire-up

| Test ID | File | Description |
|---------|------|-------------|
| ST1 | stickyPane.test.tsx | Renders without error |
| ST2 | stickyPane.test.tsx | 13 color swatch buttons rendered |
| ST3 | stickyPane.test.tsx | 12 non-random swatches use var(--sticky-note-color-id) |
| ST4 | stickyPane.test.tsx | Random swatch uses conic-gradient |
| ST5 | stickyPane.test.tsx | No hex literals in swatch inline styles |
| ST6 | stickyPane.test.tsx | Clicking swatch persists xai_pref_sticky_color |
| ST7 | stickyPane.test.tsx | 4 spacing buttons rendered |
| ST8 | stickyPane.test.tsx | Clicking spacing button persists pref |
| ST9 | stickyPane.test.tsx | ZH font size options |
| ST10 | stickyPane.test.tsx | id + icon + i18nKey correct |
| RP1 | restPanesById.test.ts | Contains exactly 11 entries |
| RP2 | restPanesById.test.ts | Each entry has correct id, icon, i18nKey |
| RP3 | restPanesById.test.ts | Each pane render is a function |
| AP1 | applyRestPanesToRegistry.test.ts | Returns same length as input |
| AP2 | applyRestPanesToRegistry.test.ts | Substitutes all 11 owned pane ids |
| AP3 | applyRestPanesToRegistry.test.ts | Does not substitute appearance/features |
| AP4 | applyRestPanesToRegistry.test.ts | Idempotent |
| AP5 | applyRestPanesToRegistry.test.ts | Preserves original order |

## §4 Acceptance Criteria

1. `pnpm --filter @repo/plugin-web-settings-rest lint` exits 0 (`--max-warnings 0`)
2. `pnpm --filter @repo/plugin-web-settings-rest typecheck` exits 0
3. All 81 tests pass (15 test files)
4. `pnpm --filter @repo/plugin-web-storage test` passes (parity test +37 keys)
5. `pnpm --filter @repo/core test` passes (EventMap declaration)
6. `pnpm --filter @repo/web build` succeeds (new dep + 11 composition cases)

---

## §5 Extension: Integrations OAuth Stub (gap-closure row #7)

> APPEND-ONLY extension. §1..§4 above describe the SHIPPED row #24 surface and
> are NOT mutated. This section adds the test strategy for the 2026-05-25
> Integrations OAuth stub for 3 providers (Notion / Google Calendar / Linear).
> Design home: `design.md` §"2026-05-25 Extension". API home: `api.md` §6.

### §5.1 Environment (extension)

Inherits the SHIPPED env (`vitest.config.ts` jsdom + `vitest.setup.ts`). Additional:

- **Web Crypto** — jsdom 23+ ships `crypto.getRandomValues` and `crypto.subtle.digest` adequate for PKCE testing. Confirmed in row #6 precedent (`shareUrl.test.ts` SHA-256 path). No polyfill needed.
- **sessionStorage** — real jsdom sessionStorage. `vitest.setup.ts` `afterEach` already clears `localStorage`; **extend** to also clear `sessionStorage` (`sessionStorage.clear()`).
- **window.location.assign** — must be stubbed per test (jsdom's `location` is not navigable). Replace with `vi.spyOn(window.location, "assign").mockImplementation(() => {})` per test that exercises the Connect path.
- **`useNavigate`** — mocked via `vi.mock("react-router", async (orig) => ({ ...await orig(), useNavigate: () => vi.fn() }))`.

### §5.2 Mock strategy (extension)

- **`emitWebEvent`**: `vi.spyOn(@repo/xai-web-event-bus, "emitWebEvent")` per CallbackPage / DisconnectButton test.
- **`crypto.getRandomValues`**: NOT mocked by default (use real jsdom impl). For deterministic test vectors (RFC 7636 §B.1), one `pkce.test.ts` case mocks `crypto.getRandomValues` to return a fixed Uint8Array and asserts the known `code_verifier` + `code_challenge` pair.
- **`crypto.subtle.digest`**: NOT mocked. Real SHA-256 needed for RFC vector verification.
- **`fetch`**: NOT mocked. The stub never calls `fetch` — verified by `vi.spyOn(globalThis, "fetch")` toHaveBeenCalledTimes(0) assertion in CallbackPage success path.
- **No `Math.random` allowed**: source-text guard test (`no-math-random.test.ts` extension OR add to existing `no-hex-literals.test.ts` to cover both bans).

### §5.3 Test matrix (extension)

#### P1 — PKCE + state helpers

| Test ID | File | Description |
|---|---|---|
| PK1 | pkce.test.ts | generateCodeVerifier returns a string |
| PK2 | pkce.test.ts | code_verifier is 43 chars (32 bytes base64url no padding) |
| PK3 | pkce.test.ts | code_verifier charset matches `[A-Za-z0-9_-]` |
| PK4 | pkce.test.ts | two consecutive calls produce different verifiers (entropy smoke) |
| PK5 | pkce.test.ts | computeCodeChallenge produces base64url(SHA-256(verifier)) — RFC 7636 §B.1 vector |
| PK6 | pkce.test.ts | code_challenge is 43 chars |
| PK7 | pkce.test.ts | base64UrlEncode produces no `=` padding |
| PK8 | pkce.test.ts | base64UrlEncode replaces `+` with `-` and `/` with `_` |
| TT-PKCE-NO-MATH-RANDOM | no-math-random.test.ts | source-text guard: zero `Math.random` occurrences in `src/internal/{pkce,oauthState,buildAuthorizeUrl}.ts` |
| OS1 | oauthState.test.ts | startOAuth writes sessionStorage key `xai_oauth_pending_<id>` with parseable JSON |
| OS2 | oauthState.test.ts | startOAuth returns state with `<providerId>.` prefix |
| OS3 | oauthState.test.ts | startOAuth sets expiresAt = now + 10min |
| OS4 | oauthState.test.ts | validateAndConsumeState returns the state on valid roundtrip |
| OS5 | oauthState.test.ts | validateAndConsumeState returns null on TTL expiry |
| OS6 | oauthState.test.ts | validateAndConsumeState returns null on providerId-prefix mismatch |
| OS7 | oauthState.test.ts | validateAndConsumeState clears sessionStorage entry even on failure |
| IP1 | integrationProviders.test.ts | PROVIDERS has exactly 3 entries (Notion, GCal, Linear) |
| IP2 | integrationProviders.test.ts | every authorizeUrl + tokenUrl starts with `https://` |
| IP3 | integrationProviders.test.ts | every prefKey matches a registered key in PREF_REGISTRY |
| IP4 | integrationProviders.test.ts | every IntegrationProviderId is in the type union (compile-time inferred + runtime check) |

#### P2 — URL builder + Connect button

| Test ID | File | Description |
|---|---|---|
| BU1 | buildAuthorizeUrl.test.ts | output URL starts with provider.authorizeUrl |
| BU2 | buildAuthorizeUrl.test.ts | URL includes `code_challenge_method=S256` |
| BU3 | buildAuthorizeUrl.test.ts | URL includes URL-encoded `redirect_uri` |
| BU4 | buildAuthorizeUrl.test.ts | URL includes the state from pendingState |
| BU5 | buildAuthorizeUrl.test.ts | URL includes the code_challenge (derived from codeVerifier) |
| BU6 | buildAuthorizeUrl.test.ts | URL encodes provider.scopes as space-separated `scope=` param |
| CB1 | integrationConnectButton.test.tsx | renders with EN label "Connect" |
| CB2 | integrationConnectButton.test.tsx | renders with ZH label "连接" |
| CB3 | integrationConnectButton.test.tsx | click writes sessionStorage entry + calls window.location.assign once |
| CB4 | integrationConnectButton.test.tsx | does not write localStorage (assert localStorage.length === 0 after click) |

#### P3 — Callback page + connection state

| Test ID | File | Description |
|---|---|---|
| CP1 | CallbackPage.test.tsx | valid state path: flips pref to true |
| CP2 | CallbackPage.test.tsx | valid state path: emits web:settings:integration-connected exactly once |
| CP3 | CallbackPage.test.tsx | valid state path: clears sessionStorage entry |
| CP4 | CallbackPage.test.tsx | valid state path: displays success banner (oauth.cb.success) |
| CP5 | CallbackPage.test.tsx | valid state path: navigates back after 2000ms (use fake timers) |
| CP6 | CallbackPage.test.tsx | invalid state (no sessionStorage entry): does NOT flip pref + does NOT emit + shows oauth.cb.invalid banner |
| CP7 | CallbackPage.test.tsx | error param (?error=access_denied): shows oauth.cb.cancelled banner |
| CP8 | CallbackPage.test.tsx | bilingual: ZH banner text rendered when lang=zh |

#### P4 — Pane integration + Disconnect + banner

| Test ID | File | Description |
|---|---|---|
| **IN1..IN6** | integrationsPane.test.tsx | **PRESERVED VERBATIM** — must stay green (17 placeholder cards still render; click is no-op; no emit) |
| IN-EXT-1 | integrationsPane.test.tsx | "Connected providers" section renders above existing 3 groups |
| IN-EXT-2 | integrationsPane.test.tsx | 3 Connect buttons render when all 3 prefs are false |
| IN-EXT-3 | integrationsPane.test.tsx | flipping a pref to true renders Disconnect button + "Connected (stub)" badge |
| IN-EXT-4 | integrationsPane.test.tsx | stub disclosure banner renders at top of pane (EN) |
| IN-EXT-5 | integrationsPane.test.tsx | stub disclosure banner renders at top of pane (ZH) |
| IN-EXT-6 | integrationsPane.test.tsx | banner is not dismissible (no close button) |
| IN-EXT-7 | integrationsPane.test.tsx | provider labels bilingual (Notion / Google Calendar / Google 日历 / Linear) |
| IN-EXT-8 | integrationsPane.test.tsx | clicking Disconnect flips pref back to false |
| IN-EXT-9 | integrationsPane.test.tsx | clicking Disconnect emits web:settings:integration-disconnected exactly once |
| IN-EXT-10 | integrationsPane.test.tsx | Disconnect tooltip mentions "provider's account settings" |
| IN-EXT-11 | integrationsPane.test.tsx | per-provider state independent (flipping Notion does not change GCal pref) |
| IN-EXT-12 | integrationsPane.test.tsx | no-hex-literals guard: badge + banner styles use OKLCH only |
| DB1 | integrationDisconnectButton.test.tsx | renders with EN label "Disconnect" |
| DB2 | integrationDisconnectButton.test.tsx | renders with ZH label "断开连接" |
| DB3 | integrationDisconnectButton.test.tsx | click flips pref + emits event |
| SB1 | integrationStubBanner.test.tsx | renders with EN copy |
| SB2 | integrationStubBanner.test.tsx | renders with ZH copy |

#### P5 — CSP + router + EventMap

| Test ID | File | Description |
|---|---|---|
| CSP3 | apps/web/src/__tests__/csp.test.ts | connect-src includes https://api.notion.com AND https://oauth2.googleapis.com AND https://api.linear.app |
| RR1 | apps/web/src/routes/router.integration.test.tsx (EDIT) | new `/app/settings/integrations/callback` route resolves to CallbackPage |
| EV1 | packages/core/src/__tests__/events.test.ts (EDIT if file exists) | EventMap has web:settings:integration-connected with required keys |
| EV2 | packages/core/src/__tests__/events.test.ts | EventMap has web:settings:integration-disconnected with required keys |
| PR-EXT | packages/plugin-web-storage/src/__tests__/parity-design-md.test.ts (EDIT) | OWNER_ROW_ADDITIONS includes the 3 new boolean integration prefs |

### §5.4 Mock surface area summary

| What | How | Where |
|---|---|---|
| `window.location.assign` | `vi.spyOn` per test that clicks Connect | CB3 |
| `sessionStorage` | real jsdom; cleared in extended `afterEach` | OS1..OS7, CB3, CP1..CP8 |
| `crypto.getRandomValues` | real jsdom for entropy; mocked once for RFC vector | PK5 |
| `crypto.subtle.digest` | real jsdom (jsdom 23+ provides it) | PK5 |
| `emitWebEvent` | `vi.spyOn` per test that flips connection | CP2, IN-EXT-9, DB3 |
| `useNavigate` | `vi.mock("react-router")` | CP5 |
| `fetch` | spied to assert ZERO calls in success path | CP3 |

### §5.5 Acceptance criteria (extension)

1. `pnpm --filter @repo/plugin-web-settings-rest lint` exits 0 (`--max-warnings 0`)
2. `pnpm --filter @repo/plugin-web-settings-rest typecheck` exits 0
3. All ORIGINAL 81 tests pass (no regression) — IN1..IN6 explicitly preserved
4. NEW ~50 tests pass (PK1..PK8 + TT-PKCE-NO-MATH-RANDOM + OS1..OS7 + IP1..IP4 + BU1..BU6 + CB1..CB4 + CP1..CP8 + IN-EXT-1..12 + DB1..DB3 + SB1..SB2)
5. `pnpm --filter @repo/plugin-web-storage test` passes (parity test +3 keys)
6. `pnpm --filter @repo/core test` passes (EventMap +2 declarations)
7. `pnpm --filter @repo/web test` passes (CSP3 + router integration)
8. `pnpm --filter @repo/web build` succeeds
9. Bundle: zero new dependency; no main-chunk size regression > 5KB
10. Cross-vendor verify (Codex `gpt-5.5-thinking medium`): PKCE correctness (state/code_verifier handling) + no token leakage in URL hash + CSP allowlist minimal (3 new entries, no wildcard, no `frame-src` widening). Cold-read deferral may apply per ADR-0008 carve-out consistent with W1/W2 precedent — record decision in `feature-verify` output.

### §5.6 No-`Math.random` guard

A new test file (or new case in `no-hex-literals.test.ts` — TBD in P1) walks `src/internal/{pkce,oauthState,buildAuthorizeUrl,CallbackPage,integration*}.{ts,tsx}` and asserts ZERO occurrences of the literal substring `Math.random`. This is HC10 enforcement at the source level — any future regression that swaps to `Math.random` (e.g. via a "simplification" PR) fails the test.

### §5.7 No-`localStorage` guard for code_verifier

A focused source-text test asserts that `src/internal/oauthState.ts` does NOT contain the literal substring `localStorage.` (with the dot). This enforces HC10: code_verifier MUST live in sessionStorage only.

### §5.8 Cross-vendor verify checklist (for feature-verify)

Owned by `feature-verify` cycle, not by P5. Listed here for completeness:

1. **PKCE state/code_verifier correctness** — Codex cold-read confirms: state is cryptographically random (verify against PK1..PK8 + OS1..OS7 source); validation is strict (verify OS4..OS6); TTL enforced (verify OS5); state is one-shot (verify OS7); code_verifier never crosses the network (greps `src/` for `code_verifier` substring being POST'd anywhere — must find ZERO).
2. **No URL leakage** — verify the success path does NOT log or persist the authorization `code` (which IS in the URL); inspect CallbackPage to confirm `code` is read via `useSearchParams` and never written anywhere.
3. **CSP minimality** — verify CSP3 source-text guard passes; verify `_headers` adds exactly 3 hostnames; verify no wildcard; verify `frame-src` unchanged.
4. **No real network** — verify `fetch` is never called in any code path under `src/`.
5. **Disconnect is local-only** — verify disconnect flow flips pref + emits event + does NOT POST anywhere.

---

## §6 Extension: Premium Pane Stripe Checkout Stub (gap-closure row #8)

> APPEND-ONLY extension. §1..§5 above describe the SHIPPED row #24 baseline +
> the 2026-05-25 row #7 Integrations OAuth stub strategy and are NOT mutated.
> This section adds the test strategy for the 2026-05-26 Premium pane Stripe
> Checkout stub. Design home: `design.md` §"2026-05-26 Extension". API home:
> `api.md` §7.

### §6.1 Environment (extension)

Inherits the post-row-#7 env (`vitest.config.ts` jsdom + `vitest.setup.ts` clearing
`localStorage` + `sessionStorage` `afterEach`). Additional:

- **`window.location.assign`** — must be stubbed per test (jsdom's `location` is not navigable). Replace via the `Object.defineProperty(window, "location", { value: { ...window.location, assign: vi.fn() }, writable: true })` pattern (same as row #7's CB3 case).
- **`useNavigate`** — mocked via `vi.mock("react-router", async (orig) => ({ ...await orig(), useNavigate: () => vi.fn() }))`.
- **`import.meta.env.VITE_STRIPE_PAYMENT_LINK_URL`** — must be stubbed per test. Use `vi.stubEnv("VITE_STRIPE_PAYMENT_LINK_URL", "https://buy.stripe.com/test_xxx")` in `beforeEach`; restore via `vi.unstubAllEnvs()` in `afterEach`.
- **`Date.now`** — for the 30-day TTL tests (PHK3), mock via `vi.useFakeTimers()` + `vi.setSystemTime(...)`.

### §6.2 Mock strategy (extension)

- **`emitWebEvent`**: `vi.spyOn(@repo/xai-web-event-bus, "emitWebEvent")` per test that flips tier.
- **`window.location.assign`**: spied per test that exercises the Upgrade-click path (PUB-1, premiumPane PT-EXT-1).
- **`useNavigate`**: `vi.mock("react-router", ...)` per CallbackPage-style test (CS5, CC3).
- **`fetch`**: NOT mocked. The stub never calls `fetch` — verified by `vi.spyOn(globalThis, "fetch")` toHaveBeenCalledTimes(0) assertion in success/cancel/upgrade/cancel-button paths (CS-NO-FETCH-1, CC-NO-FETCH-1, PUB-NO-FETCH-1, PCANCEL-NO-FETCH-1).
- **Source-text guards**: no Stripe Secret Key (`sk_test_`/`sk_live_`) and no Stripe.js (`@stripe/stripe-js` or `https://js.stripe.com/` literal import). Both via `readFileSync` walks over `src/**/*.{ts,tsx}`.
- **Local clock**: `vi.useFakeTimers()` + `vi.setSystemTime` for PHK3 (30-day expiry) + CS5/CC3 (setTimeout-based navigate).

### §6.3 Test matrix (extension)

#### P1 — Tier state machine + usePremiumTier + 2 prefs registered

| Test ID | File | Description |
|---|---|---|
| PT1 | premiumTier.test.ts | PREMIUM_TIER_TTL_MS === 30 * 24 * 60 * 60 * 1000 |
| PT2 | premiumTier.test.ts | PremiumTier type has exactly 3 values "free" \| "pending" \| "premium_stub" (compile-time inferred + runtime instance check) |
| PT3 | premiumTier.test.ts | (placeholder for future state-machine helpers if extracted) |
| PT4 | premiumTier.test.ts | (placeholder) |
| PHK1 | usePremiumTier.test.tsx | returns effectiveTier="free", storedTier="free", startedAt=0 when no localStorage entries |
| PHK2 | usePremiumTier.test.tsx | returns effectiveTier="premium_stub" when stored="premium_stub" and started_at = now |
| PHK3 | usePremiumTier.test.tsx | returns effectiveTier="free" when stored="premium_stub" and started_at = now - 31 days (TTL expired; vi.useFakeTimers) |
| PHK4 | usePremiumTier.test.tsx | setTier("premium_stub") writes both prefs + sets startedAt=Date.now() + emits web:premium:tier-changed exactly once |
| PHK5 | usePremiumTier.test.tsx | setTier("free") writes tier="free" + startedAt=0 + emits event |
| PHK6 | usePremiumTier.test.tsx | SSR-safe: returns "free" + 0 when localStorage throws (mocked) |
| PC-CONFIG-1 | usePremiumConfig.test.tsx | returns configured=true + paymentLinkUrl="https://buy.stripe.com/test_xxx" when env stubbed |
| PC-CONFIG-2 | usePremiumConfig.test.tsx | returns configured=false + paymentLinkUrl="" when env empty |
| PC-CONFIG-3 | usePremiumConfig.test.tsx | returns configured=false when env starts with http:// (not https://) |
| PR-COMMENT-1 | registry-comment.test.ts (NEW) | registry.ts contains the FA-12 comment block "MUST NOT be interpreted as 'real subscription'" — source-text guard |
| PR-EXT-8 | parity-design-md.test.ts (EDIT) | OWNER_ROW_ADDITIONS includes both new premium prefs |

#### P2 — Upgrade button + Payment Link redirect + env-var hook

| Test ID | File | Description |
|---|---|---|
| PUB-1 | premiumUpgradeButton.test.tsx | renders enabled when env configured + click calls window.location.assign(envUrl) exactly once |
| PUB-2 | premiumUpgradeButton.test.tsx | renders disabled (aria-disabled="true" + visual style) when env missing + click does NOT call assign |
| PUB-3 | premiumUpgradeButton.test.tsx | bilingual (EN "Upgrade Now" / ZH "立即升级") |
| PUB-4 | premiumUpgradeButton.test.tsx | disabled tooltip uses premium.upgrade_disabled_tooltip (EN + ZH) |
| PUB-NO-FETCH-1 | premiumUpgradeButton.test.tsx | does not call fetch in any branch |

#### P3 — CheckoutSuccessPage + CheckoutCancelPage + EventMap + router edit

| Test ID | File | Description |
|---|---|---|
| CS1 | CheckoutSuccessPage.test.tsx | valid session_id (e.g. "cs_test_xxx"): flips tier to "premium_stub" |
| CS2 | CheckoutSuccessPage.test.tsx | valid session_id: writes started_at = Date.now() |
| CS3 | CheckoutSuccessPage.test.tsx | valid session_id: emits web:premium:tier-changed exactly once with { previous: "free", current: "premium_stub", changedAt: ISO } |
| CS4 | CheckoutSuccessPage.test.tsx | valid session_id: displays success banner (premium.cb.success) |
| CS5 | CheckoutSuccessPage.test.tsx | valid session_id: navigates to /app/settings/premium after 2000ms (vi.useFakeTimers) |
| CS6 | CheckoutSuccessPage.test.tsx | missing session_id (?session_id absent): displays invalid banner + does NOT flip tier + does NOT emit event |
| CS7 | CheckoutSuccessPage.test.tsx | empty session_id (?session_id=): same as missing — invalid path |
| CS8 | CheckoutSuccessPage.test.tsx | bilingual (ZH banner text rendered when lang=zh) |
| CS-INVALID-1 | CheckoutSuccessPage.test.tsx | invalid path: navigates after 4000ms |
| CS-NO-FETCH-1 | CheckoutSuccessPage.test.tsx | does not call fetch in any branch |
| CC1 | CheckoutCancelPage.test.tsx | renders cancel banner (premium.cb.cancel) on first render |
| CC2 | CheckoutCancelPage.test.tsx | bilingual (ZH banner text) |
| CC3 | CheckoutCancelPage.test.tsx | navigates to /app/settings/premium after 3000ms (vi.useFakeTimers) |
| CC4 | CheckoutCancelPage.test.tsx | idempotent re tier: does NOT flip tier under any input |
| CC-DIRECT-1 | CheckoutCancelPage.test.tsx | reachable via direct URL paste (no prior Upgrade click) — same UX as normal cancel |
| CC-NO-FETCH-1 | CheckoutCancelPage.test.tsx | does not call fetch |
| RR-PREMIUM-1 | apps/web/src/routes/router.integration.test.tsx (EDIT) | new `/app/settings/premium/checkout/success` route resolves to CheckoutSuccessPage |
| RR-PREMIUM-2 | apps/web/src/routes/router.integration.test.tsx | new `/app/settings/premium/checkout/cancel` route resolves to CheckoutCancelPage |
| EV3 | packages/core/src/__tests__/events.test.ts (EDIT) | EventMap has web:premium:tier-changed with previous + current + changedAt keys |

#### P4 — Cancel Subscription + PremiumTierBadge + Disclosure banner + 14 bilingual i18n entries + Topbar edit

| Test ID | File | Description |
|---|---|---|
| **PR1..PR3** | premiumPane.test.tsx | **PRESERVED VERBATIM** — must stay green (Renders without error / Bilingual headline / id+icon+i18nKey correct) |
| PT-EXT-1 | premiumPane.test.tsx | Upgrade button is rendered in pane when tier=free (visible) |
| PT-EXT-2 | premiumPane.test.tsx | Cancel Subscription button is rendered ONLY when effective tier=premium_stub |
| PT-EXT-3 | premiumPane.test.tsx | Cancel Subscription button is NOT rendered when tier=free |
| PT-EXT-4 | premiumPane.test.tsx | disclosure banner is rendered unconditionally (in all 3 tier states: free, pending, premium_stub) |
| PT-EXT-5 | premiumPane.test.tsx | tier-aware current-tier label: shows "Free" / "免费版" when tier=free, "Premium (stub)" / "高级版（演示）" when tier=premium_stub |
| PT-EXT-6 | premiumPane.test.tsx | no-hex-literals guard: new CSS classes use OKLCH only |
| PCB-1 | PremiumTierBadge.test.tsx | renders <span class="premium-tier-badge"> with bilingual text when tier=premium_stub |
| PCB-2 | PremiumTierBadge.test.tsx | returns null when tier=free or tier=pending |
| PB-BANNER-1 | premiumDisclosureBanner.test.tsx | renders EN copy when lang=en |
| PB-BANNER-2 | premiumDisclosureBanner.test.tsx | renders ZH copy when lang=zh |
| PB-BANNER-3 | premiumDisclosureBanner.test.tsx | non-dismissible (no `<button>` inside the banner; no close affordance) |
| PCANCEL-1 | premiumCancelButton.test.tsx | click flips tier to "free" (writes both prefs) |
| PCANCEL-2 | premiumCancelButton.test.tsx | click emits web:premium:tier-changed exactly once |
| PCANCEL-3 | premiumCancelButton.test.tsx | bilingual (EN "Cancel Subscription" / ZH "取消订阅") |
| PCANCEL-NO-FETCH-1 | premiumCancelButton.test.tsx | does not call fetch (no Stripe API call in stub) |
| PCANCEL-TOOLTIP-1 | premiumCancelButton.test.tsx | tooltip text contains billing.stripe.com (EN + ZH) |
| TB-PREMIUM-1 | packages/xai-web-shell/src/__tests__/Topbar.test.tsx (EDIT) | PremiumTierBadge mounts in Topbar; renders when premium_stub stored; absent when free |

#### P5 — CSP4 + no-SK guard + no-stripe-js-bundle guard + env-var docs

| Test ID | File | Description |
|---|---|---|
| CSP4 | apps/web/src/__tests__/csp.test.ts (EDIT) | connect-src includes https://js.stripe.com AND https://checkout.stripe.com AND https://buy.stripe.com |
| CSP4-SCRIPT-SRC-CLEAN | apps/web/src/__tests__/csp.test.ts | script-src does NOT contain stripe.com (verifies we did NOT accidentally widen script-src) |
| CSP4-FRAME-SRC-CLEAN | apps/web/src/__tests__/csp.test.ts | frame-src does NOT appear in _headers (verifies we did NOT add a frame-src directive) |
| TT-NO-SK | no-stripe-secret-key.test.ts | source-text guard: zero `sk_test_` AND zero `sk_live_` occurrences in `packages/plugin-web-settings-rest/src/**/*.{ts,tsx}` |
| TT-NO-STRIPE-JS | no-stripe-js-bundle.test.ts | source-text guard: zero `@stripe/stripe-js` imports AND zero `https://js.stripe.com/` literal in `packages/plugin-web-settings-rest/src/**/*.{ts,tsx}` |

### §6.4 Mock surface area summary

| What | How | Where |
|---|---|---|
| `window.location.assign` | `Object.defineProperty(window, "location", ...)` per test | PUB-1, PUB-NO-FETCH-1 |
| `localStorage` / `sessionStorage` | real jsdom; cleared in `afterEach` (already extended in row #7) | PHK1..PHK6, CS1..CS3, PCANCEL-1 |
| `useNavigate` | `vi.mock("react-router")` | CS5, CC3, RR-PREMIUM-1/2 |
| `emitWebEvent` | `vi.spyOn` per test that flips tier | PHK4, PHK5, CS3, PCANCEL-2 |
| `Date.now` | `vi.useFakeTimers()` + `vi.setSystemTime` | PHK3, CS5, CC3 |
| `import.meta.env.VITE_STRIPE_PAYMENT_LINK_URL` | `vi.stubEnv` per test | PC-CONFIG-1/2/3, PUB-1/2 |
| `fetch` | spied to assert ZERO calls | CS-NO-FETCH-1, CC-NO-FETCH-1, PUB-NO-FETCH-1, PCANCEL-NO-FETCH-1 |

### §6.5 Acceptance criteria (extension)

1. `pnpm --filter @repo/plugin-web-settings-rest lint` exits 0 (`--max-warnings 0`)
2. `pnpm --filter @repo/plugin-web-settings-rest typecheck` exits 0 (no `check-types` script in plugin-web-settings-rest; relies on Vitest TypeScript path)
3. `pnpm --filter @repo/web check-types` exits 0 (router.tsx + RouteErrorBoundary scope union extension MUST be type-correct — row #7 B2 verify-cycle precedent)
4. All ORIGINAL 154 tests pass (no regression) — PR1..PR3 + IN1..IN6 + row #7 cases all preserved
5. NEW ~40 tests pass (PT1..PT4 + PHK1..PHK6 + PC-CONFIG-1/2/3 + PR-COMMENT-1 + PUB-1..PUB-4 + PUB-NO-FETCH-1 + CS1..CS8 + CS-INVALID-1 + CS-NO-FETCH-1 + CC1..CC4 + CC-DIRECT-1 + CC-NO-FETCH-1 + PT-EXT-1..6 + PCB-1/2 + PB-BANNER-1/2/3 + PCANCEL-1..3 + PCANCEL-NO-FETCH-1 + PCANCEL-TOOLTIP-1 + TB-PREMIUM-1 + CSP4 + CSP4-SCRIPT-SRC-CLEAN + CSP4-FRAME-SRC-CLEAN + TT-NO-SK + TT-NO-STRIPE-JS + RR-PREMIUM-1/2 + EV3 + PR-EXT-8)
6. `pnpm --filter @repo/plugin-web-storage test` passes (parity test +2 keys)
7. `pnpm --filter @repo/core test` passes (EventMap +1 declaration)
8. `pnpm --filter @repo/web test` passes (CSP4 + CSP4-SCRIPT-SRC-CLEAN + CSP4-FRAME-SRC-CLEAN + RR-PREMIUM-1/2)
9. `pnpm --filter @repo/xai-web-shell test` passes (TB-PREMIUM-1)
10. `pnpm --filter @repo/web build` succeeds
11. Bundle: zero new NPM dependency; no main-chunk size regression > 5KB; no `js.stripe.com` literal in `dist/**/*.js` (bundle source-text scan)
12. **No SK in any bundled artifact**: `grep -r "sk_test_\|sk_live_" apps/web/dist/` returns nothing (cross-vendor verify item #1)
13. **No Stripe.js in any bundled artifact**: `grep -r "@stripe/stripe-js\|Stripe.create" apps/web/dist/` returns nothing (cross-vendor verify item #2)
14. Cross-vendor verify (Codex `gpt-5.5-thinking medium`): items 1-6 from §6.8 below. Cold-read deferral may apply per ADR-0008 carve-out consistent with W1/W2 precedent — record decision in `feature-verify` output.

### §6.6 No-`sk_*` source-text guard

A new test file `src/__tests__/no-stripe-secret-key.test.ts` walks `src/**/*.{ts,tsx}` and asserts ZERO occurrences of the literal substrings `sk_test_` and `sk_live_` (Stripe's Secret Key prefix pattern). This is HC3 enforcement at the source level. Any future regression that pastes an SK (even in a comment) fails the test.

### §6.7 No-`@stripe/stripe-js` source-text guard

A new test file `src/__tests__/no-stripe-js-bundle.test.ts` walks `src/**/*.{ts,tsx}` and asserts ZERO occurrences of:
1. The literal substring `"@stripe/stripe-js"` (NPM package import path)
2. The literal substring `"https://js.stripe.com/"` (CDN import path)

This enforces the v1 architectural constraint: NO Stripe.js loaded in the bundle. Required because adding Stripe.js would force a `script-src` widening + `worker-src blob:` widening + `frame-src` widening, all of which we are explicitly avoiding in v1.

### §6.8 Cross-vendor verify checklist (for feature-verify)

Owned by `feature-verify` cycle, not by P5. Listed here for completeness:

1. **No SK in client bundle** — Codex confirms `apps/web/dist/**/*.js` contains zero `sk_test_` / `sk_live_` substrings AND `packages/plugin-web-settings-rest/src/**/*.{ts,tsx}` source contains zero such substrings. Source-text guard `no-stripe-secret-key.test.ts` mirrors the source-side check.
2. **No Stripe.js bundled** — Codex confirms no `import` from `@stripe/stripe-js` and no `https://js.stripe.com/` literal in `src/**`. Bundle scan confirms `dist/**/*.js` contains no Stripe.js fingerprints (`Stripe.create`, `__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED`).
3. **Disclosure banner unmissable** — Codex inspects `premiumPane.tsx` JSX tree confirming `<PremiumDisclosureBanner />` is rendered unconditionally above all other content; banner has no close button; CSS uses a high-contrast (OKLCH amber/gold) background distinct from neutral pane bg. Manual smoke confirms visibility in all 3 tier states.
4. **CSP minimality** — Codex confirms CSP4 source-text guard passes; `_headers` adds exactly 3 hostnames to `connect-src` (no wildcard, no subdomain wildcard); no `script-src` widening; no `frame-src` widening (CSP4-SCRIPT-SRC-CLEAN + CSP4-FRAME-SRC-CLEAN). Inspect that prior CSP1/CSP2/CSP3 tests still pass (no regression).
5. **No real network in any path** — Codex confirms `fetch()` is never called in any code path under `packages/plugin-web-settings-rest/src/**` related to premium (CheckoutSuccessPage / CheckoutCancelPage / premiumUpgradeButton / premiumCancelButton / usePremiumTier / usePremiumConfig).
6. **30-day timer is client-only and pure** — Codex confirms `usePremiumTier()` uses only `Date.now()` + `localStorage` read; no `setInterval`, no `setTimeout` ticking in background; no `fetch`; pure call-site evaluation.

Manual smoke (Chrome 120 / Safari 17, deferrable 24h per ADR-0008 carve-out, consistent with W1/W2 precedent):
- Click Upgrade → reaches Stripe Checkout test page → complete with `4242 4242 4242 4242` → returns to `/success` → gold badge visible in Topbar.
- Click Upgrade → cancel via back button → tier unchanged.
- After 30 days (or via manual clock rewind for test purposes), badge disappears + pane reverts to free.

