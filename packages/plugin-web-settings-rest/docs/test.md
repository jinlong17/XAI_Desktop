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
