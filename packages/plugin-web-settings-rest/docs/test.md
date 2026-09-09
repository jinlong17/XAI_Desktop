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

---

## §7 Extension: Account Delete Wire (gap-closure row #9)

> APPEND-ONLY extension. §1..§6 above describe the SHIPPED row #24 baseline +
> the 2026-05-25 row #7 Integrations OAuth stub strategy + the 2026-05-26 row #8
> Premium Stripe Checkout stub strategy and are NOT mutated.
> This section adds the test strategy for the 2026-05-26 row #9 account-delete
> real-wire. Design home: `design.md` §"2026-05-26 Extension: Account Delete
> Wire (gap-closure row #9)". API home: `api.md` §8.

### §7.1 Environment (extension)

Inherits the post-row-#8 env (`vitest.config.ts` jsdom + `vitest.setup.ts` clearing
`localStorage` + `sessionStorage` `afterEach`). Additional:

- **`window.location.assign`** — must be stubbed per test that exercises the orchestrator's redirect step. Use the same `Object.defineProperty(window, "location", { value: { ...window.location, assign: vi.fn() }, writable: true })` pattern as row #7 CB3 + row #8 PUB-1.
- **`import.meta.env.VITE_WEB_AUTH_MODE`** — stubbed per test. `vi.stubEnv("VITE_WEB_AUTH_MODE", "mock-authenticated")` for mock-auth tests; `vi.stubEnv("VITE_WEB_AUTH_MODE", "live")` (or undefined) for live-auth tests. Restored via `vi.unstubAllEnvs()` in `afterEach`.
- **`indexedDB.deleteDatabase`** — jsdom does not implement `indexedDB.deleteDatabase` consistently. Tests use `fake-indexeddb` (already a transitive dep via `idb-keyval`) OR mock at the call site. Default: mock via `vi.spyOn(indexedDB, "deleteDatabase").mockImplementation(...)` to return an IDBOpenDBRequest-like object that resolves immediately.
- **Supabase client (`SupabaseClient`)** — fully mocked for unit tests. The orchestrator hook is tested with a minimal `{ functions: { invoke: vi.fn() }, auth: { signOut: vi.fn() } }` mock that satisfies the `deleteAccount()` contract. Real Supabase is never instantiated in tests.
- **`useWebAuthSession()`** — mocked via `vi.mock("@repo/web-auth-device-session/web", ...)` returning a minimal context shape `{ client: mockClient, state: "authenticated", ... }`.

### §7.2 Mock strategy (extension)

- **`emitWebEvent`**: `vi.spyOn(@repo/xai-web-event-bus, "emitWebEvent")` per test that asserts the deprecated event emit (DEL-EVENT-DEP-1).
- **`removePref`**: NOT mocked by default — uses real jsdom localStorage; tests pre-seed keys and assert empty after wipe.
- **`window.location.assign`**: spied per test that exercises the redirect step (DEL-ORCH-1, DEL-ORCH-2, DEL-ORCH-4, DEL-IDEM-1).
- **`indexedDB.deleteDatabase`**: spied per test that exercises the IDB wipe (DEL-WIPE-2, DEL-IDB-LIST-1).
- **`SupabaseClient.functions.invoke`**: spied per test in DAA-1..8 + DEL-ORCH-1 + DEL-ORCH-3 + DEL-ORCH-4.
- **`SupabaseClient.auth.signOut`**: spied per test in DAA-2 + DAA-8 + DEL-ORCH-1.
- **`fetch`**: NOT mocked. The orchestrator never calls `fetch` directly — backend calls go through `client.functions.invoke()` (which itself wraps fetch but is fully mocked).
- **Source-text guard**: `no-localstorage-clear.test.ts` walks `src/**/*.{ts,tsx}` and asserts ZERO occurrences of `localStorage.clear()` substring. Hard cross-vendor verify gate (R4).

### §7.3 Test matrix (extension)

#### P1 — 2-step modal + type-match input + bilingual i18n (UI only — no backend wiring)

| Test ID | File | Description |
|---|---|---|
| **AC1..AC4, AC8** | accountPane.test.tsx | **PRESERVED VERBATIM** — must stay green (Renders without error / ZH+EN name / Delete button present / id+icon+i18nKey correct) |
| AC5 | accountPane.test.tsx | **ADJUSTED**: Delete button opens dialog with Step 1 title visible (was: any dialog content) |
| AC6 | accountPane.test.tsx | **ADJUSTED**: Cancel on Step 1 closes dialog AND does NOT emit deprecated event (was: cancel does not emit) |
| AC7 | accountPane.test.tsx | **ADJUSTED**: Continue on Step 1 still emits deprecated event exactly once (was: Confirm emits exactly once) |
| DEL-STEP-1 | DeleteAccountConfirmModal.test.tsx | Closed → click "Delete" → Step 1 panel visible |
| DEL-STEP-2 | DeleteAccountConfirmModal.test.tsx | Step 1 → click "Continue" → Step 2 panel visible (Step 1 elements unmounted) |
| DEL-STEP-3 | DeleteAccountConfirmModal.test.tsx | Step 2 → input "DELETE" → submit enabled → click submit → state transitions to Submitting |
| DEL-TYPEMATCH-1 | DeleteAccountConfirmModal.test.tsx | input value `"DELETE"` → submit button enabled (NOT aria-disabled) |
| DEL-TYPEMATCH-2 | DeleteAccountConfirmModal.test.tsx | input value `"delete"` (lowercase) → submit button disabled |
| DEL-TYPEMATCH-3 | DeleteAccountConfirmModal.test.tsx | input value `"Delete"` (mixed case) → submit button disabled |
| DEL-TYPEMATCH-4 | DeleteAccountConfirmModal.test.tsx | input value `""` (empty) → submit button disabled |
| DEL-TYPEMATCH-5 | DeleteAccountConfirmModal.test.tsx | input value `"DELETEX"` (extra char) → submit button disabled |
| DEL-TYPEMATCH-6 | DeleteAccountConfirmModal.test.tsx | input value `"DELETE "` (trailing space) → submit button disabled (no trim) |
| DEL-CANCEL-1 | DeleteAccountConfirmModal.test.tsx | Cancel on Step 1 closes modal; onCancel called |
| DEL-CANCEL-2 | DeleteAccountConfirmModal.test.tsx | Cancel on Step 2 closes modal; input cleared on next open |
| DEL-BILINGUAL-1 | DeleteAccountConfirmModal.test.tsx | EN labels rendered on Step 1 + Step 2 (deleteModal.step1_title, deleteModal.step2_title, deleteModal.type_prompt) |
| DEL-BILINGUAL-2 | DeleteAccountConfirmModal.test.tsx | ZH labels rendered on Step 1 + Step 2 |

#### P2 — deleteAccount() helper in @repo/web-auth-device-session (companion package tests)

| Test ID | File | Description |
|---|---|---|
| DAA-1 | packages/web-auth-device-session/src/auth-actions.test.ts | deleteAccount() calls `client.functions.invoke("account-delete")` exactly once with empty body |
| DAA-2 | packages/web-auth-device-session/src/auth-actions.test.ts | On invoke 200, deleteAccount() calls `client.auth.signOut()` exactly once |
| DAA-3 | packages/web-auth-device-session/src/auth-actions.test.ts | On invoke network throw, throws AccountDeleteError with kind="network" |
| DAA-4 | packages/web-auth-device-session/src/auth-actions.test.ts | On invoke 401, throws AccountDeleteError with kind="unauthorized" |
| DAA-5 | packages/web-auth-device-session/src/auth-actions.test.ts | On invoke 403, throws AccountDeleteError with kind="forbidden" |
| DAA-6 | packages/web-auth-device-session/src/auth-actions.test.ts | On invoke 500, throws AccountDeleteError with kind="server" |
| DAA-7 | packages/web-auth-device-session/src/auth-actions.test.ts | On invoke 404 (idempotency), throws AccountDeleteError with kind="already_deleted" |
| DAA-8 | packages/web-auth-device-session/src/auth-actions.test.ts | If signOut throws AFTER successful invoke, deleteAccount() does NOT re-throw (logged + downgraded) |

#### P3 — Orchestrator + local-clear + mock-auth fallback + redirect

| Test ID | File | Description |
|---|---|---|
| DEL-ORCH-1 | useAccountDeleteOrchestrator.test.tsx | Live-auth happy path: submit() → deleteAccount called → signOut called → registry-list iterated → IDB list iterated → window.location.assign("/") called |
| DEL-ORCH-2 | useAccountDeleteOrchestrator.test.tsx | Mock-auth happy path: submit() → deleteAccount NOT called → registry-list iterated → IDB list iterated → window.location.assign("/") called |
| DEL-ORCH-3 | useAccountDeleteOrchestrator.test.tsx | Live-auth failure: deleteAccount throws kind="network" → reducer state="failure" → registry-list NOT iterated → IDB list NOT iterated → window.location.assign NOT called |
| DEL-ORCH-4 | useAccountDeleteOrchestrator.test.tsx | 404 idempotency: deleteAccount throws kind="already_deleted" → reducer treats as success → wipe + redirect |
| DEL-WIPE-1 | useAccountDeleteOrchestrator.test.tsx | All 42 keys from Object.keys(PREF_REGISTRY) iterated; one removePref call per key (count assert) |
| DEL-WIPE-2 | useAccountDeleteOrchestrator.test.tsx | All 3 entries in ACCOUNT_LOCAL_WIPE_IDB_NAMES iterated; one indexedDB.deleteDatabase call per name |
| DEL-IDEM-1 | useAccountDeleteOrchestrator.test.tsx | Calling submit() twice while state=submitting is idempotent (second call no-ops) |
| DEL-IDB-LIST-1 | useAccountDeleteOrchestrator.test.tsx | ACCOUNT_LOCAL_WIPE_IDB_NAMES contains exactly ["web-encrypted-cache", "xai-web-ai-secrets", "xai-web-auth"] at row-#9-time |
| DEL-WIRE-1 | DeleteAccountConfirmModal.test.tsx | Step 2 → submit (mock-auth) → orchestrator state advances through "submitting" → "wiping" → "success" |
| DEL-WIRE-2 | DeleteAccountConfirmModal.test.tsx | Step 2 → submit (live, deleteAccount throws kind="network") → error banner rendered with bilingual copy |
| DEL-WIRE-3 | DeleteAccountConfirmModal.test.tsx | Failure → click Retry → reducer transitions back to Step 2 → submit enabled |
| DEL-MOCK-BANNER-1 | DeleteAccountConfirmModal.test.tsx | mock-auth mode + Step 2 rendered → mock banner EN text visible (deleteModal.mock_banner EN) |
| DEL-MOCK-BANNER-2 | DeleteAccountConfirmModal.test.tsx | mock-auth mode + Step 2 + ZH lang → mock banner ZH text visible |
| DEL-MOCK-BANNER-3 | DeleteAccountConfirmModal.test.tsx | Mock banner has no close button / no dismiss affordance (non-dismissible) |
| DEL-EVENT-DEP-1 | accountPane.test.tsx | Step 1 Continue click emits web:settings:rest:account-delete-confirmed exactly once with payload `{ confirmedAt: <ISO> }` |
| DEL-WILDCARD-GUARD | no-localstorage-clear.test.ts | Source-text guard: zero `localStorage.clear()` occurrences in `packages/plugin-web-settings-rest/src/**/*.{ts,tsx}` AND `packages/web-auth-device-session/src/**/*.{ts,tsx}` |

#### P4 — Cross-vendor verify checklist + JSDoc deprecation + operator runbook + PLUGIN_MAP

P4 is documentation-only — no new automated tests. The 6 cross-vendor verify items are owned by `feature-verify` (see §7.5 below).

### §7.4 Mock surface area summary

| What | How | Where |
|---|---|---|
| `window.location.assign` | `Object.defineProperty(window, "location", ...)` per test | DEL-ORCH-1, DEL-ORCH-2, DEL-ORCH-4, DEL-IDEM-1 |
| `localStorage` | real jsdom; pre-seed keys + assert empty after wipe | DEL-WIPE-1 |
| `sessionStorage` | real jsdom; cleared in `afterEach` (already extended in row #7) | DEL-WIPE-1 (no direct use) |
| `indexedDB.deleteDatabase` | `vi.spyOn(indexedDB, "deleteDatabase")` returning a stub IDBOpenDBRequest | DEL-WIPE-2, DEL-IDB-LIST-1 |
| `import.meta.env.VITE_WEB_AUTH_MODE` | `vi.stubEnv` per test | DEL-ORCH-1 (live), DEL-ORCH-2 (mock), DEL-MOCK-BANNER-1/2/3 (mock) |
| `client.functions.invoke` | spy per test with controlled return | DAA-1..7, DEL-ORCH-1, DEL-ORCH-3, DEL-ORCH-4 |
| `client.auth.signOut` | spy per test | DAA-2, DAA-8, DEL-ORCH-1 |
| `emitWebEvent` | `vi.spyOn` per test asserting the deprecated event | DEL-EVENT-DEP-1 |
| `useWebAuthSession` | `vi.mock("@repo/web-auth-device-session/web")` | DEL-ORCH-1..4, DEL-WIPE-1, DEL-WIPE-2, DEL-WIRE-1..3 |
| `fetch` | NOT mocked (no direct fetch in row #9) | — |

### §7.5 Acceptance criteria (extension)

1. `pnpm --filter @repo/plugin-web-settings-rest lint --max-warnings 0` exits 0
2. `pnpm --filter @repo/plugin-web-settings-rest typecheck` N/A (no script defined; Vitest TS path provides type-check)
3. `pnpm --filter @repo/web-auth-device-session lint --max-warnings 0` exits 0
4. `pnpm --filter @repo/web-auth-device-session test` exits 0 (existing baseline + 8 new DAA tests)
5. `pnpm --filter @repo/web check-types` exits 0 (no new router changes; should remain green from row #8)
6. All ORIGINAL 208 plugin-web-settings-rest tests pass (AC1..AC4, AC8 preserved; AC5/AC6/AC7 adjusted; row #7 + row #8 cases all preserved)
7. NEW ~36 tests pass:
   - P1: ~13 (DEL-STEP-1..3 + DEL-TYPEMATCH-1..6 + DEL-CANCEL-1..2 + DEL-BILINGUAL-1..2)
   - P2: 8 (DAA-1..8)
   - P3: ~15 (DEL-ORCH-1..4 + DEL-WIPE-1..2 + DEL-IDEM-1 + DEL-IDB-LIST-1 + DEL-WIRE-1..3 + DEL-MOCK-BANNER-1..3 + DEL-EVENT-DEP-1 + DEL-WILDCARD-GUARD)
8. `pnpm --filter @repo/plugin-web-storage test` passes (no schema change to registry; existing 88 tests preserved)
9. `pnpm --filter @repo/core test` passes (EventMap JSDoc @deprecated annotation; existing 8 tests preserved)
10. `pnpm --filter @repo/web test` passes (existing 116 tests preserved — NO CSP changes, NO router changes)
11. `pnpm --filter @repo/web build` succeeds (no new dependency)
12. Bundle: zero new NPM dependency; no main-chunk size regression > 5KB
13. Cross-vendor verify (Codex `gpt-5.5-thinking medium`): 6 items per §7.6 below. Cold-read deferral may apply per ADR-0008 carve-out consistent with W1/W2 + row #6/#7/#8 precedent — record decision in `feature-verify` output.

Baseline test counts after row #9 (target):
- plugin-web-settings-rest: 208 + ~28 (P1 + P3 modal/orch/event) = **~236**
- web-auth-device-session: baseline + 8 (DAA-1..8) = **baseline+8**
- plugin-web-storage: 88 (UNCHANGED)
- xai-web-shell: 86 (UNCHANGED)
- web: 116 (UNCHANGED)
- core: 8 (UNCHANGED; only JSDoc edit)

### §7.6 No-`localStorage.clear()` source-text guard

A new test file `src/__tests__/no-localstorage-clear.test.ts` walks `packages/plugin-web-settings-rest/src/**/*.{ts,tsx}` AND `packages/web-auth-device-session/src/**/*.{ts,tsx}` and asserts ZERO occurrences of the literal substring `localStorage.clear()`. This is HC3 (no wildcard wipe) enforcement at the source level. Any future regression that swaps the registry-list iteration for a wildcard wipe fails the test.

Implementation pattern mirrors row #7's `no-math-random.test.ts` and row #8's `no-stripe-secret-key.test.ts` source-text guards.

### §7.7 Cross-vendor verify checklist (for feature-verify)

Owned by `feature-verify` cycle, not by P4. Listed here for completeness:

1. **No wildcard wipe** — Codex cold-read confirms `useAccountDeleteOrchestrator.ts` + `wipe.ts` (in web-auth-device-session) contain zero `localStorage.clear()` calls; iteration uses `Object.keys(PREF_REGISTRY)` exclusively. DEL-WILDCARD-GUARD source-text guard mirrors at source level.
2. **Type-match case-sensitive** — Codex cold-read confirms `DeleteAccountConfirmModal.tsx` Step 2 input handler uses `=== "DELETE"` (strict equality with the literal "DELETE", no `toLowerCase()`, no `.trim()`). DEL-TYPEMATCH-1..6 source-test mirror.
3. **Sequencing (live-auth)** — Codex cold-read confirms the orchestrator's live-auth path calls `deleteAccount()` FIRST, then on success calls registry-wipe + IDB-wipe + redirect. No local mutation precedes backend confirmation. DEL-ORCH-3 source-test mirror.
4. **IDB clear comprehensive** — Codex cold-read confirms `ACCOUNT_LOCAL_WIPE_IDB_NAMES` covers all known IDB databases at the time of cold-read (current list: 3; future additions documented in JSDoc + runbook). DEL-IDB-LIST-1 source-test mirror.
5. **Mock-auth banner unmissable** — Codex inspects `DeleteAccountConfirmModal.tsx` JSX confirming the banner is rendered unconditionally when `VITE_WEB_AUTH_MODE === "mock-authenticated"` AND state is one of step2/submitting/failure; banner has no close button; CSS uses high-contrast amber OKLCH. DEL-MOCK-BANNER-1..3 source-test mirror.
6. **Deprecated event still emitted** — Codex confirms `accountPane.tsx` Step 1 Continue handler still calls `emitWebEvent("web:settings:rest:account-delete-confirmed", { confirmedAt: ... })` (one-release back-compat). EventMap entry in `packages/core/src/types/events.ts` carries the `@deprecated since 2026-05-26 (row #9)` JSDoc annotation. DEL-EVENT-DEP-1 source-test mirror.

Manual smoke (Chrome 120 / Safari 17, deferrable 24h per ADR-0008 carve-out, consistent with row #6/#7/#8 precedent):
- Mock-auth mode → click Delete Account → Step 1 → Continue → Step 2 → mock banner visible → type "delete" lowercase → submit stays disabled → type "DELETE" → submit enabled → click Delete Account → modal shows Submitting → page navigates to "/" → reload → localStorage `xai_*` keys gone + auth state clean.
- Live mode → mock the backend to return 500 → click flow as above → on submit → error banner shows ZH/EN copy → localStorage NOT cleared → retry button restores Step 2 → re-submit succeeds with mocked 200 → cleanup happens → redirect.
- Failure recovery → close tab mid-deletion → reopen → app loads in unauthenticated state (account is gone upstream; local stale data is inert without a session).



## REL-03 Settings regression (2026-09-09)

New coverage uses real scoped localStorage with synthetic A/B/demo identities: account deletion success/failure/already-deleted/reentry; switches during server, secrets and auth clear; no whole-IDB erasure; captured-token request; More reset preservation; export payload exclusion and visible failure; AccountDataGate event; OAuth owner/epoch invalidation and delayed URL cancellation.

Durable recovery additionally verifies tombstone-before-erase, serialized receipt replay while B is active, blocked secrets, failed final receipt commit, malformed-owner metadata, signed-out notice remount, visible retry and receipt event discovery. Scope fixtures now explicitly activate a demo generation; previous raw global-key expectations were replaced by actual physical-key reads/writes. Callback success fixtures now include the required authorization code; missing-code rejection remains a real guard. The old whole-database-list assertion was removed because global database deletion is forbidden by the new contract, replaced by scoped preservation assertions.

Package config uses ESNext/Bundler resolution to match the shipped Vite application and its source-package imports; ImportMeta typing is explicit. No dependencies or lockfile changed by this Settings worker.

Implementation verification: **40 test files / 266 tests PASS**, package typecheck PASS. A separate isolated real Chromium probe (`node packages/plugin-web-settings-rest/docs/verify-browser-deletion-recovery.mjs`) writes native localStorage and IndexedDB fixtures, reloads the full page, shows recovery while unauthenticated, activates B, retries A erasure and confirms A content/ciphertext are removed while B, legacy ciphertext and device preferences survive. Receipt becomes complete only after native cleanup; the notice then disappears. This is an actual page reload, not whole-browser termination or hosted authentication acceptance. The fixture ciphertext is opaque synthetic data: the probe tests native owner-scoped erasure, not cryptographic correctness.


## REL-04 export scope and device recovery

REL-04: DeviceRecoveryExport tests inspect actual Blob JSON: device layout included, A/B account data and unselected history excluded; explicit legacy raw bytes retained exactly; stale account pane refuses download; credential-named history omitted with visible feedback and source retention. Account export test now also requires manifest and restoreSupported:false while preserving account/legacy isolation assertions. Browser download/render verification remains an independent layer.


## REL-06 durable pre-request intent

REL-06 pre-request intent: actual deleteAccount + orchestrator integration tests inject native Storage quota, response loss and post-server receipt failure. Assert zero server calls on first intent write failure; unknown outcome retains account bytes and token-free intent after remount with B; no local retry button without confirmed receipt. HTTP 401/403/404/500 remain unable to authorize local erasure. Existing recovery and captured-owner tests remain unchanged.
