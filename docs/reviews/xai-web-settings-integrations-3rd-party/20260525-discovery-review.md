# Discovery Review — xai-web-settings-integrations-3rd-party (gap-closure row #7)

| Field | Value |
|---|---|
| Slug | `xai-web-settings-integrations-3rd-party` |
| Roadmap | `docs/workflow/roadmap/xai-web-console-gap-closure.md` row #7 (W2) |
| Seed brief | `docs/reviews/xai-web-settings-integrations-3rd-party/20260524-roadmap-seed.md` |
| Parent ADR | ADR-0009 §D2-G3 (P0 gap-closure) |
| Companion ADR | **ADR-0008 §S3 D3** — to be amended IN-PLACE (third amendment) per row #2 binding precedent + row #6 precedent |
| Target package | `packages/plugin-web-settings-rest/` (Stable, SHIPPED row #24 2026-05-23; PLUGIN_MAP row #24) — **extend** Integrations pane |
| Pattern reference | row #2 ai-chat (CSP amend precedent + sensitive-data via WebCrypto) + row #5 dashboard (native `<dialog>` modal) + row #6 board-map (CSP-3rd-party-host pattern) |
| Pattern setter for | row #8 settings-premium-stripe (callback URL pattern) + future P1 sync rows |
| Dispatched by | `xai-roadmap-loop` SERIAL Wave 2 second row (after row #6 SHIPPED `a86f58f` 2026-05-25) |
| Author | Claude Opus 4.7 (1M context) — feature-plan, 2026-05-25 |

---

## 1. Problem framing

The Settings → Integrations pane (`packages/plugin-web-settings-rest/src/panes/integrationsPane.tsx`) was shipped 2026-05-23 (row #24) as **17 placeholder cards in 3 groups** (Featured / Calendar / Integrate) — each card's click handler is a no-op (`e.preventDefault()`; no event emit; no console.warn). Row #24 §4.7 of `api.md` is explicit: "Click is a no-op."

For the P1 Desktop launch gate (ADR-0009 §D2-G3 requires ≥5/9 gap-closure rows SHIPPED), this row closes **Gap 6a** by wiring **3 representative providers** with a real OAuth authorization-code + PKCE flow. v1 is **stub-only**: the callback page discards the authorization code; no token is ever stored; the only state change is a per-provider boolean flag in localStorage indicating "Connected (stub)".

The goal is **pattern establishment** more than feature completeness:

1. Establish the **OAuth callback URL** (`/app/settings/integrations/callback`) — a new react-router route the host (`apps/web/src/routes/router.tsx`) does not yet declare. This callback URL is reusable by row #8 (Stripe `success_url`) and any future P1 sync rows.
2. Establish the **CSP `connect-src` allowlist pattern** for 3 new OAuth token-exchange hostnames (Notion / Google / Linear). Per the binding precedent set by ADR-0008 §S3 D3 (amended 2026-05-25 for row #2 `api.anthropic.com` and row #6 `tile.openstreetmap.org`), every new external origin extends the same `_headers` file + `csp.test.ts` source-text guard.
3. Establish the **PKCE state + code-verifier** generation pattern (`crypto.getRandomValues` + `base64url` encode, stored in `sessionStorage` with TTL). This pattern is reusable by any future OAuth-bearing row.

The "stub-only" framing is deliberate per HC3 of the seed brief — building a real token-exchange backend is out of scope for the Web Console (no Worker layer until ADR-0008 D3 follow-up). When the real backend lands, the only delta is the callback handler swap (validate state + POST to token endpoint instead of discard); every other piece (provider config, PKCE generation, UI cards, CSP allowlist, callback route, connection-state flag) is forward-compatible.

---

## 2. Current state of the Integrations pane

### 2.1 Source code (read 2026-05-25)

`packages/plugin-web-settings-rest/src/panes/integrationsPane.tsx` (118 LOC):

- Pure presentational component.
- Three `readonly` const arrays: `FEATURED` (3 cards) / `CALENDAR` (10 cards) / `INTEGRATE` (4 cards).
- Each card: `<button>` with `onClick={(e) => e.preventDefault()}` — no event emit, no logging.
- `IntegrationCardSpec` shape: `{ id: IntegrationCardId, name: string, color: string (OKLCH), short: string }`.
- `IntegrationCardId` union (in `src/types.ts`) lists 16 ids: wechat, gcal, notion, local, outlook, exchange, icloud, wecom, dingtalk, feishu, caldav, url, slack, linear, gh, todoist.
- I18n: `localI18n.ts` already defines `int.featured` / `int.calendar` / `int.integrate` section headers (bilingual).

### 2.2 Settings pane composition seam

`apps/web/src/routes/modules/settingsPaneComposition.ts` substitutes the placeholder Pane object via `paneRegistry.map(p => p.id === "integrations" ? integrationsPane : p)`. This row does **NOT** change the composition seam — `integrationsPane` keeps the same id and barrel export. The pane's internal render tree expands.

### 2.3 SHIPPED Status Panel

`packages/plugin-web-settings-rest/docs/dev_log.md` Workflow State block shows `Status = SHIPPED` (PR-2 drift reconciled 2026-05-24). HC9 — this MUST be preserved verbatim. The extension lineage block APPENDS below the existing content (mirroring row #6 precedent in `packages/xai-web-board-views/docs/dev_log.md`).

### 2.4 Tests baseline

`packages/plugin-web-settings-rest/docs/test.md` §3 records 81 tests across 15 files (15 test files × ~5 tests average). The 6 `IN1..IN6` tests in `integrationsPane.test.tsx` cover the 17-card baseline:

- IN1: 17 integration cards rendered
- IN2: 3 section headers rendered
- IN3/IN4: EN/ZH section headers
- IN5: card click is a no-op (no `console.warn`)
- IN6: no `emitWebEvent` on card click

This row **MUST NOT** break IN1..IN6 — the existing card count + structure is preserved. New tests are appended (IN-EXT-1..N, distinct test IDs).

### 2.5 Prototype reference

`web design/module-settings.jsx` is the authoritative prototype (Claude-Artifact UI source per ADR-0007). Row #24 ported lines 827-873 (the placeholder grid layout). For this extension, the prototype offers no new design — the 3 OAuth provider cards reuse the existing `int-card` / `int-logo` / `int-name` CSS classes from `styles.css`. New visual elements (Connect/Disconnect buttons, Connected badge, stub-mode banner) are designed as additive minimal additions.

---

## 3. Prior CSP state (after row #2 + row #6 amendments)

`apps/web/public/_headers` (read 2026-05-25):

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com;
  img-src 'self' data: blob: https://tile.openstreetmap.org;
  connect-src 'self' https://api.anthropic.com https://tile.openstreetmap.org;
  font-src 'self' data: https://fonts.gstatic.com;
  object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests
```

ADR-0008 §S3 D3 Amendments frontmatter row records: row #2 (`api.anthropic.com`) + row #6 (`tile.openstreetmap.org` × 2 directives). This row will add the **third** amendment row.

`apps/web/src/__tests__/csp.test.ts` (read 2026-05-25) has two source-text guards:

- `CSP1`: connect-src includes `https://api.anthropic.com`
- `CSP2`: connect-src + img-src both include `https://tile.openstreetmap.org`

This row will add `CSP3`: connect-src includes the 3 OAuth token endpoints.

### 3.1 What hostnames must `connect-src` allow

For the **stub** v1, the callback page does NOT POST to the token endpoint (HC3 — discard the code). However the seed brief Acceptance Signal item 5 reads "CSP report-uri 0 violations on happy-path connect" — meaning the OAuth **authorize** flow (browser navigates to provider's authorize URL in a new tab) must not be blocked.

`window.open(...)` to a third-party origin does **NOT** require `connect-src`; it's a top-level navigation governed by `frame-src` only if the new tab is iframed. Since we open a **new tab** (`target="_blank"`), no CSP directive applies to it — the new tab is its own browsing context.

Therefore, in strict stub mode, **`connect-src` widening is NOT strictly required**. However, for forward-compatibility with the real token-exchange (P1 work) and to honor the seed brief HC4 framing ("decide `frame-src` … most providers redirect, not iframe — confirm"), we will still amend ADR-0008 + `_headers` + `csp.test.ts` for the 3 token endpoints. This avoids re-litigating the same decision when the real backend lands and matches the binding precedent from rows #2 and #6.

### 3.2 The 3 token endpoints to add

Per the WebSearch evidence (Notion / Google / Linear OAuth docs, 2026-05-25):

| Provider | Token endpoint | Authorize endpoint |
|---|---|---|
| Notion | `https://api.notion.com/v1/oauth/token` | `https://api.notion.com/v1/oauth/authorize` |
| Google Calendar | `https://oauth2.googleapis.com/token` | `https://accounts.google.com/o/oauth2/v2/auth` |
| Linear | `https://api.linear.app/oauth/token` (per official docs) | `https://linear.app/oauth/authorize` |

`connect-src` additions (stripped to hostnames; no path):

- `https://api.notion.com`
- `https://oauth2.googleapis.com`
- `https://api.linear.app`

Note: `accounts.google.com` and `linear.app` are top-level navigation destinations (the authorize page lives there). Per §3.1 these do NOT need `connect-src`. They are pure browser-navigation targets.

### 3.3 `frame-src` decision

All 3 providers' authorize flows redirect the **top window** to the provider's domain (or open a new tab in our case). None of them are iframe-friendly:

- Google explicitly forbids embedding accounts.google.com in iframes via `X-Frame-Options: DENY`.
- Notion likewise sets `X-Frame-Options`.
- Linear's authorize page is similarly frame-blocked.

**Decision**: `frame-src` remains unchanged (`frame-ancestors 'none'` is the current strict default — different directive, but the point is we add no `frame-src` allowances). The seed brief HC4 question "decide `frame-src`" is therefore answered: **no `frame-src` widening**. The 3 providers open in a new tab (`target="_blank"` + `rel="noopener noreferrer"`) and the user manually returns to the app after authorize.

This is documented in the design.md extension §FA-Z below to lock the decision.

---

## 4. Candidate options

The Step 0 brief already fixed the high-level approach (PKCE stub, 3 specific providers, callback URL pattern). The remaining design choices are tactical. Below are 3 axes with options analyzed.

### 4.1 Axis A — PKCE state storage location

State + code_verifier must survive the round-trip from "user clicks Connect" → "user authorizes on provider" → "browser lands on callback URL". They cannot live in component state (component unmounts when new tab opens).

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **A1. `sessionStorage` with TTL** (selected) | Survives within the tab's browsing context — but cleared on tab close; survives across page navigations / refreshes within the tab; never crosses to other tabs. TTL (e.g. 10 min) prevents stale state. Plain string serialization is fine — no encryption needed since the values are short-lived. | The callback page lands in a **new** tab (the one opened by Connect), which means the new tab does NOT share `sessionStorage` with the originating tab. **Critical implication**: the new tab cannot validate state via sessionStorage. We must use either `BroadcastChannel` between tabs OR open the OAuth flow in the **same** tab. Decision: open in same tab (top-level navigation via `window.location.href`) — simpler, no cross-tab plumbing, matches OAuth spec recommendation. | Selected |
| A2. `localStorage` with TTL | Cross-tab — survives across windows. Survives forever (until cleared). | HC10 explicitly forbids `localStorage` for `code_verifier` (broad surface area, persists across sessions, accessible to all same-origin JS including XSS payloads). Rejected. | Rejected |
| A3. URL fragment / state param round-trip | No storage needed. | The OAuth `state` parameter goes out and comes back in the URL — but `code_verifier` is the *secret* and MUST NOT cross the network. PKCE definition requires verifier stays client-side. Rejected. | Rejected |
| A4. `IndexedDB` | Cross-tab; persists. | Overkill for short-lived (10 min) data; async API complicates the synchronous "open authorize URL" branch; also persists across sessions which is wrong for the security model. Rejected. | Rejected |

**Selected: A1 + open-in-same-tab.**

**Refinement**: the seed brief HC2 says "OAuth authorization URL opens in **new tab**." This conflicts with A1's same-tab requirement. We resolve as follows:

- The **Connect** button uses `window.location.assign(authorizeUrl)` — **top-level navigation in the current tab**. This is the standard OAuth web flow and trivially survives `sessionStorage`.
- The user authorizes on the provider's site → provider redirects back to `${origin}/app/settings/integrations/callback?state=...&code=...`.
- The callback route reads `sessionStorage`, validates state, displays "Authorization received (stub)", then `Navigate`s back to `/app/settings/integrations` after 2s.

This is a small interpretive deviation from the seed brief's "new tab" wording. **Justification**: opening OAuth in a new tab is a desktop-app idiom (Tauri, Electron), not a web idiom. The Web Console is a SPA. New-tab OAuth in a SPA requires either: (a) `BroadcastChannel` between tabs (complex), or (b) reading `code_verifier` from `localStorage` (HC10 violation). Same-tab is the only HC-compatible choice.

This deviation is flagged for `feature-review` to confirm.

### 4.2 Axis B — Provider config shape

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **B1. Single `IntegrationProvider` const array** (selected) | One source of truth. Easy to iterate for rendering 3 cards. Clean abstraction proves "3 providers behave identically" (Acceptance Signal item 4). Each entry: `{ id, name, authorizeUrl, tokenUrl, scopes, prefKey, icon, color }`. | Adds a new internal module (`providers.ts`). | Selected |
| B2. Inline per-provider components | More React-native (each provider as its own component). | Duplicates the OAuth machinery 3 times. Hard to ensure parity. Rejected. | Rejected |
| B3. Plugin-registry shape (extensible at runtime) | Future-proof for adding 4th provider. | Over-engineering for HC1 (3 providers only). Rejected. | Rejected |

**Selected: B1.** Module home: `packages/plugin-web-settings-rest/src/internal/integrationProviders.ts`.

### 4.3 Axis C — Callback page placement

The callback route `/app/settings/integrations/callback` is a new react-router route. It must mount inside the `<App>` layout (which provides `WebShellProvider`) so the post-callback navigation back to `/app/settings/integrations` is seamless.

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **C1. New top-level child under `/app`** (selected) | Reachable as `/app/settings/integrations/callback`. Renders inside `<App>` layout (rail + topbar visible) — matches "user lands back where they were". Easy to declare in `router.tsx`. The deep-link path is semantically grouped under settings/integrations. | Adds one route declaration in `apps/web/src/routes/router.tsx` (host concern). | Selected |
| C2. Inside the Settings module (sub-route of `settings/integrations`) | Cleaner module ownership. | Requires the SettingsModule to be a router-aware element — current shellRegistrations treats each module as a flat `<Routes>` mounted at `/app/:moduleId/*`. Adding a callback sub-route here means SettingsModule needs to declare its own router. More invasive. Rejected. | Rejected |
| C3. Pure handler (no UI; window.close on detect) | No UI — perfect for new-tab flow. | Same-tab flow needs UI (the "Authorization received" feedback). Rejected for this row's same-tab decision. | Rejected |

**Selected: C1.** Declared in `router.tsx` as a peer child of `path: ":moduleId/*"`. The callback page is owned by `plugin-web-settings-rest` (exported as `CallbackPage`) and the host just wires the route.

### 4.4 Axis D — Connection state shape

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **D1. 3 separate boolean prefs** (selected per seed brief HC6) | Each provider independent. Easy to test (toggle one without affecting others). Matches the `xai_pref_features_*` family precedent (row #23). | 3 new entries in registry. | Selected |
| D2. Single JSON pref (`xai_pref_integrations_connected`) | One key in registry. | Compound shape; mutation requires read-merge-write; harder to test in isolation. Rejected. | Rejected |

**Selected: D1.** Keys: `xai_pref_integrations_connected_notion` / `xai_pref_integrations_connected_gcal` / `xai_pref_integrations_connected_linear`. Category `pref`, codec `boolean`, default `false`, owner `xai-web-settings-rest`, schemaVersion `1`.

### 4.5 Axis E — Stub-mode disclosure

Acceptance Signal item 3 (callback page shows "Authorization received (v1 stub)") plus HC3 ("clear visual stub-mode indicator") require explicit signaling.

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **E1. Pane-top disclosure banner + per-provider "(stub)" badge** (selected) | Two layers of disclosure — pane-level for first-time visitors, badge for any state that says Connected. Bilingual. Non-dismissible (this is not transient state — the entire feature is stub). | None material. | Selected |
| E2. Per-card disclosure tooltip | Less visible. Easy to miss. Rejected. | | Rejected |
| E3. Modal on first connect | Intrusive; no reason to interrupt. | | Rejected |

**Selected: E1.** Banner text (EN): "Integrations are in v1 stub mode — authorization flows are wired but no data sync occurs yet." Badge text: "Connected (stub)".

### 4.6 Axis F — EventMap declaration

Should this row emit a typed event when a connection happens?

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **F1. Declaration-only `web:settings:integration-connected`** (selected) | Mirrors row #5 (`web:dashboard:widget-added` declaration-only) + row #6 (`web:board:share-requested` declaration-only) precedents. Forward-compatible for P1 sync rows that subscribe. Zero consumers in this row. | One new EventMap entry in `packages/core/src/types/events.ts`. | Selected |
| F2. No event emit | Simpler. | Inconsistent with sibling-row precedent. Loses forward-compat hook for P1 sync. Rejected. | Rejected |

**Selected: F1.** Payload: `{ providerId: "notion" | "gcal" | "linear"; mode: "stub"; connectedAt: string (ISO) }`. Mirrored on Disconnect: `web:settings:integration-disconnected` with `{ providerId, disconnectedAt }`.

---

## 5. Recommendation

**Composite α** (sum of A1-same-tab + B1 + C1 + D1 + E1 + F1):

1. PKCE state + code_verifier stored in `sessionStorage` with 10-min TTL. Both generated via `crypto.getRandomValues(new Uint8Array(32))` + `base64url` (URL-safe, no padding). `code_challenge = base64url(SHA-256(code_verifier))`.
2. OAuth opens in the **same tab** via `window.location.assign(authorizeUrl)`. The seed brief's "new tab" wording is overridden per §4.1 justification — flagged for `feature-review` to confirm.
3. Callback route `/app/settings/integrations/callback` declared in `apps/web/src/routes/router.tsx` as a peer child under `path: "app"`. Renders inside `<App>` layout (rail + topbar visible). Owned by `plugin-web-settings-rest` (exports `CallbackPage`).
4. Callback validates `state` against `sessionStorage`. On match: flip the per-provider boolean pref to `true`, clear sessionStorage entries, display "Authorization received (stub)" banner, `setTimeout(() => navigate("/app/settings/integrations"), 2000)`. On mismatch / missing: display error "Invalid authorization state — please try again" + clear sessionStorage + navigate after 4s.
5. Provider config in `packages/plugin-web-settings-rest/src/internal/integrationProviders.ts` — 3 entries.
6. 3 boolean prefs registered in `packages/plugin-web-storage/src/internal/registry.ts` (HC6).
7. Disconnect clears the per-provider pref + emits `web:settings:integration-disconnected`. Works in stub mode (just flips the flag).
8. Pane-top stub disclosure banner (bilingual, non-dismissible) + per-provider "(stub)" badge on Connected state.
9. ADR-0008 §S3 D3 amended in-place — **third** amendment — adding 3 token endpoints to `connect-src`. `frame-src` NOT widened (decision §3.3). Update `_headers` + add CSP3 source-text guard to `apps/web/src/__tests__/csp.test.ts`.
10. EventMap: 2 new declaration-only entries (`web:settings:integration-connected` + `web:settings:integration-disconnected`).
11. The existing 14 placeholder cards (the 17 minus the 3 we wire) remain placeholders. They render in the same grid layout below the 3 wired cards. Their click-handlers stay as no-op (IN5 + IN6 tests stay green).

This composite satisfies all 10 HCs and the Acceptance Signal.

---

## 6. Risks register

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| R1 | PKCE state collision under fast re-clicks (user clicks Connect Notion, then Connect Linear within milliseconds — second click overwrites sessionStorage state for first) | M | Use one sessionStorage key per provider: `xai_oauth_pending_<providerId>`. Each provider's state is namespaced. State validation in callback reads the namespace from the `state` value itself (state encodes the providerId prefix) → look up the matching sessionStorage key. |
| R2 | Callback page reached without prior sessionStorage state (user refreshes the callback URL; or user bookmarks the callback URL; or direct deep-link) | H | On missing sessionStorage entry: display "Invalid authorization state — please try again" banner + Auto-navigate to `/app/settings/integrations` after 4s. Do NOT silently 200. Do NOT flip any pref. |
| R3 | OAuth tab blocked by popup blocker | LOW (same-tab; popup blockers don't block `window.location.assign`) | Selecting same-tab navigation per §4.1 sidesteps this entirely. If a future revision swaps to new-tab, the Connect handler must check `window.open(...)` return value and display "Popup blocked — please allow popups for this site and try again". Mitigation already in design via decision choice. |
| R4 | Provider rate-limits OAuth start (Notion has strict limits per public docs) | LOW | The browser-initiated authorize navigation is one-shot per user click. No background retry. Rate-limit only matters for the (deferred) token-exchange step. Documented as a v1 non-issue. |
| R5 | CSP `frame-src` is unexpectedly needed if a provider's redirect chain includes an iframe step (Linear has occasionally used a CDN intermediate) | LOW | §3.3 confirms current docs say all 3 providers `X-Frame-Options: DENY` their authorize pages. Even if a CDN intermediate iframes briefly, the navigation is top-level for the user's perspective. Mitigation: if observed in feature-verify smoke, add minimal `frame-src` entry in a 4th ADR amendment. Flagged for cross-vendor verify cold-read. |
| R6 | Disconnect doesn't actually revoke the OAuth grant on the provider side (the user still appears as "authorized" in Notion/Google/Linear's account settings) | M | This is a v1 limitation — explicitly documented in the disconnect button tooltip: "Disconnect clears local state only. To revoke access, visit the provider's account settings." Bilingual. |
| R7 | State / code_verifier TTL too short — user takes >10 min to authorize, returns to callback with valid state in URL but expired sessionStorage entry | M | TTL = 10 min (within `xai_oauth_pending_<id>` JSON entry: `{ state, codeVerifier, expiresAt }`). On expiry: same path as R2 (Invalid state banner + navigate after 4s). Documented. |
| R8 | `crypto.getRandomValues` unavailable in test environment (jsdom historically partial-stubs SubtleCrypto) | LOW | jsdom 23+ ships full `crypto.getRandomValues` (the test runner this repo uses; row #6 confirmed via `shareUrl.test.ts` using `SubtleCrypto.digest`). For `crypto.subtle.digest("SHA-256", ...)` (needed for `code_challenge`), same jsdom support. Smoke: a single test that asserts the helper returns a 43+ char base64url string. |
| R9 | The 3 boolean prefs propagation — host code or another plugin might read these and try to do real sync | LOW | Document in design.md FA: "the 3 booleans are STUB markers only. No other code path is allowed to interpret them as 'real connection exists'. P1 sync rows will introduce a separate `xai_integrations_v1` JSON shape with token references." |
| R10 | Cross-vendor cold-read (Codex `gpt-5.5-thinking`) flags PKCE state validation as not strict enough | M | Mitigation built into design: state validation uses `===` after JSON-parse + structural shape check + TTL check + providerId-prefix check. Cold-read targets `validateOAuthState` (pure function) — test coverage TT-PKCE-1..5 covers the strictness. |

---

## 7. Web research evidence

WebSearch performed 2026-05-25 (this run); summarized findings re-stated in §3.2 / §3.3 above.

**Search queries**:

1. `Notion OAuth authorization-code PKCE authorize endpoint 2026` — confirmed `https://api.notion.com/v1/oauth/token` as the token endpoint. PKCE generically supported by OAuth client libraries.
2. `Google Calendar OAuth2 PKCE authorize endpoint scope calendar.readonly 2026` — confirmed `https://accounts.google.com/o/oauth2/v2/auth` authorize endpoint, `https://oauth2.googleapis.com/token` token endpoint, and the scope literal `https://www.googleapis.com/auth/calendar.readonly`.
3. `Linear OAuth PKCE authorize URL scopes read 2026` — confirmed `https://linear.app/oauth/authorize` (with `code_challenge` + `code_challenge_method=S256` params) and default `read` scope.

**Sources**:

- [Notion Authorization Guide](https://developers.notion.com/guides/get-started/authorization)
- [Using OAuth 2.0 to Access Google APIs](https://developers.google.com/identity/protocols/oauth2)
- [Choose Google Calendar API scopes](https://developers.google.com/workspace/calendar/api/auth)
- [Linear OAuth 2.0 Authentication](https://linear.app/developers/oauth-2-0-authentication)
- [Linear Developers Authentication](https://developers.linear.app/docs/oauth/authentication)

No vendored OAuth library is required (no dependency-add for the stub). For the future real implementation, the team can re-evaluate `oauth4webapi` (zero-dep PKCE helper) at that time. **No new package dependency in this row.**

---

## 8. Open questions for feature-review

1. **Same-tab vs new-tab** (§4.1): the seed brief says "new tab" but same-tab is the only PKCE-correct path. Confirm OK or specify a different cross-tab handshake mechanism.
2. **`accounts.google.com` redirect chain** (§3.2): Google's authorize URL is `https://accounts.google.com/o/oauth2/v2/auth` not `oauth2.googleapis.com`. The authorize URL is browser-navigated, not fetched — so it does NOT need `connect-src`. Confirm CSP allowlist is minimal (only `oauth2.googleapis.com` for future token endpoint).
3. **State payload shape** — current proposal encodes providerId as a prefix in the state value (e.g. `state = "notion." + base64url(random32)`). This lets the callback look up the right sessionStorage entry. Alternative: pass providerId as a separate URL param. Either works; prefix is simpler. Confirm.
4. **Linear `redirect_uri` registration** — for the real backend, the registered redirect URI must include both dev (`http://localhost:3000/app/settings/integrations/callback`) and prod (`https://<*.pages.dev>/app/settings/integrations/callback`). In stub mode this is moot (provider rejects unregistered URIs anyway → user just sees provider error). Document in design FA.
5. **Pane re-shuffle** — the 3 newly-wired providers (Notion / GCal / Linear) currently sit in 3 different groups (Notion in Featured, GCal in Featured + Calendar duplicate, Linear in Integrate). Plan to add a new top section "Connected (stub)" containing the 3 wired cards, and leave the 14 unwired cards in their existing groups below. Confirm UI ordering.

These are tactical; none block planning. Listed for the reviewer.

---

## 9. Frozen Assumptions (this row only)

These lock at plan acceptance.

1. **Stub-only.** No real token exchange. No backend. Callback discards `code`.
2. **3 providers only**: Notion, Google Calendar, Linear (HC1).
3. **Authorize flow opens in same tab** via `window.location.assign(authorizeUrl)`. Deviation from seed brief "new tab" justified §4.1.
4. **PKCE state + code_verifier**: 32 bytes from `crypto.getRandomValues` → base64url-encoded. `code_challenge_method = S256`. `code_challenge = base64url(SHA-256(code_verifier))`.
5. **sessionStorage key shape**: `xai_oauth_pending_<providerId>` → JSON `{ state, codeVerifier, expiresAt }`. TTL = 10 minutes.
6. **Callback route**: `/app/settings/integrations/callback` — declared in `apps/web/src/routes/router.tsx` as peer child under `path: "app"`.
7. **3 boolean prefs** in `plugin-web-storage` registry: `xai_pref_integrations_connected_{notion,gcal,linear}`. Default `false`. Category `pref`. Owner `xai-web-settings-rest`. SchemaVersion 1.
8. **No real Disconnect.** Disconnect clears the local flag + emits event. Provider-side revocation requires the user to visit the provider's account settings (documented in tooltip).
9. **CSP**: ADR-0008 §S3 D3 amended in-place (third amendment). `connect-src` extended with `https://api.notion.com`, `https://oauth2.googleapis.com`, `https://api.linear.app`. `frame-src` NOT widened (§3.3). `_headers` updated. `csp.test.ts` gains CSP3 guard.
10. **EventMap**: 2 new declaration-only entries — `web:settings:integration-connected` + `web:settings:integration-disconnected`. No consumer in this row.
11. **Append-only doc discipline.** `design.md` + `api.md` + `test.md` get one new section each. `dev_log.md` gets one new "Bugfix-Extension Lineage" block. SHIPPED row #24 Status Panel + Phase Plan + Work Log preserved verbatim.
12. **No new package dependency.** All PKCE helpers implemented in-package via Web Crypto API.
13. **Stub-mode disclosure**: pane-top banner (bilingual, non-dismissible) + per-provider "(stub)" badge on Connected state.
14. **The 14 unwired cards** keep their existing render + no-op handlers. IN1..IN6 tests stay green.

---

## 10. Phase plan (5 phases)

| Phase | Scope | Files touched |
|---|---|---|
| **P1** | Provider config + PKCE helpers + sessionStorage handling + 3 prefs registered | `packages/plugin-web-settings-rest/src/internal/{integrationProviders.ts (NEW), pkce.ts (NEW), oauthState.ts (NEW)}` + `packages/plugin-web-storage/src/internal/registry.ts` (+3 new entries in labeled block) + `packages/plugin-web-storage/src/__tests__/parity-design-md.test.ts` (+3 exempt keys) + `packages/plugin-web-settings-rest/src/__tests__/{pkce.test.ts (NEW), oauthState.test.ts (NEW), integrationProviders.test.ts (NEW)}` |
| **P2** | Connect button + authorize URL builder + Connect handler (writes sessionStorage + navigates) | `packages/plugin-web-settings-rest/src/internal/buildAuthorizeUrl.ts (NEW)` + `packages/plugin-web-settings-rest/src/internal/integrationConnectButton.tsx (NEW)` + `packages/plugin-web-settings-rest/src/__tests__/{buildAuthorizeUrl.test.ts, integrationConnectButton.test.tsx}` |
| **P3** | Callback route + state validation + stub-mode banner + connection-flag flip | `packages/plugin-web-settings-rest/src/CallbackPage.tsx (NEW)` + `packages/plugin-web-settings-rest/src/index.ts` (export `CallbackPage`) + `apps/web/src/routes/router.tsx` (+1 route child) + `packages/core/src/types/events.ts` (+2 EventMap declarations) + `packages/plugin-web-settings-rest/src/__tests__/CallbackPage.test.tsx` |
| **P4** | Disconnect + per-provider UI (3 Connected (stub) cards added above existing 17) + pane-top disclosure banner + bilingual i18n keys | `packages/plugin-web-settings-rest/src/panes/integrationsPane.tsx` (EDIT — add ConnectedIntegrations section above existing 3 groups) + `packages/plugin-web-settings-rest/src/internal/integrationDisconnectButton.tsx (NEW)` + `packages/plugin-web-settings-rest/src/internal/integrationStubBanner.tsx (NEW)` + `packages/plugin-web-settings-rest/src/internal/localI18n.ts` (+ ~24 new bilingual entries) + `packages/plugin-web-settings-rest/src/styles.css` (+ banner + badge CSS) + `packages/plugin-web-settings-rest/src/__tests__/integrationsPane.test.tsx` (EDIT — add IN-EXT-1..IN-EXT-12 tests; preserve IN1..IN6) + tests for Disconnect + Banner |
| **P5** | ADR-0008 §S3 D3 THIRD amendment + `_headers` update + `csp.test.ts` CSP3 guard + bundle/build verify | `docs/adr/0008-cloudflare-deploy-target-and-csp.md` (EDIT — add Amendments frontmatter row + §S3 D3 amendment block + §S6 `_headers` snippet update) + `apps/web/public/_headers` (EDIT — extend `connect-src` with 3 hostnames) + `apps/web/src/__tests__/csp.test.ts` (EDIT — add CSP3 case) + `docs/PLUGIN_MAP.md` (EDIT — append `(Extension 2026-05-25 — Integrations OAuth stub gap-closure row #7)` note to plugin-web-settings-rest row) |
| **P6** (verify-only) | Cross-vendor verify checklist (PKCE correctness + no URL leakage + CSP minimality) — owned by `feature-verify` not `feature-build` | Verify-report doc; no code edits |

Total new files: 9 (provider config + pkce + state + buildUrl + connect btn + disconnect btn + banner + CallbackPage + 8 test files).
Total edited files: 8 (registry.ts, parity test, integrationsPane.tsx, localI18n.ts, styles.css, router.tsx, events.ts, _headers, csp.test.ts, ADR-0008, PLUGIN_MAP.md).

Test counts (new): ~30 tests across 8 new test files + 12 new cases in integrationsPane.test.tsx + 1 new CSP3 case.

Bundle impact: zero new package dependency. Module-level code addition ~600-800 LOC across plugin-web-settings-rest, mostly internal/. No lazy-chunk needed (small footprint, eagerly loaded with Settings module).

---

## 11. Test strategy preview

Detailed in `test.md` extension. Highlights:

- **PKCE correctness suite** (`pkce.test.ts`): code_verifier length (43-128), code_verifier charset (URL-safe), code_challenge = base64url(SHA-256(verifier)) (use a known test vector from RFC 7636 §B.1), `crypto.getRandomValues` called (spy), no `Math.random` anywhere (source-text guard).
- **State validation suite** (`oauthState.test.ts`): TTL expiry → rejected; providerId prefix mismatch → rejected; structurally invalid JSON → rejected; correct triple → accepted.
- **3-provider abstraction** (`integrationProviders.test.ts`): exactly 3 entries; each has required fields (id/name/authorizeUrl/tokenUrl/scopes/prefKey/icon/color); all 3 prefKeys match the registered prefs; all 3 authorize URLs are https (no http).
- **Callback behaviors** (`CallbackPage.test.tsx`): valid state path → pref flipped + event emitted + navigate after 2s; invalid state → error banner + navigate after 4s; missing sessionStorage → invalid path; URL query parsing robust to URL-encoded chars.
- **CSP guards** (`csp.test.ts`): CSP3 — `connect-src` contains all 3 OAuth token hostnames.
- **Pane regression** (`integrationsPane.test.tsx`): IN1..IN6 must stay green (the 17 placeholder cards still render + click is no-op); IN-EXT-1..12 cover the new Connected (stub) section + banner + per-provider Connect/Disconnect + stub badge + bilingual.
- **Cross-vendor cold-read** (Codex `gpt-5.5-thinking`): verify PKCE state/code_verifier handled correctly + no token leakage in URL hash + CSP allowlist is minimal. Deferred 24h per ADR-0008 carve-out consistent with W1/W2 precedent.

Acceptance criteria (extension):

1. `pnpm --filter @repo/plugin-web-settings-rest lint` exits 0
2. `pnpm --filter @repo/plugin-web-settings-rest typecheck` exits 0
3. All 81 existing tests + new tests pass (~111 total)
4. `pnpm --filter @repo/plugin-web-storage test` passes (parity test +3 keys)
5. `pnpm --filter @repo/core test` passes (EventMap +2 declarations)
6. `pnpm --filter @repo/web test` passes (CSP3 case)
7. `pnpm --filter @repo/web build` succeeds
8. Cross-vendor cold-read: PKCE strictness + CSP minimality + no URL leakage

---

## 12. Doc-extension contract (HC8 / append-only)

- `packages/plugin-web-settings-rest/docs/design.md` — APPEND one section: "## 2026-05-25 Extension: Integrations Pane OAuth Stub (gap-closure row #7)"
- `packages/plugin-web-settings-rest/docs/api.md` — APPEND one section: "## §6 Extension: Integrations OAuth Stub (gap-closure row #7)"
- `packages/plugin-web-settings-rest/docs/test.md` — APPEND one section: "## §5 Extension: Integrations OAuth Stub (gap-closure row #7)"
- `packages/plugin-web-settings-rest/docs/dev_log.md` — APPEND one block: "## Bugfix-Extension Lineage — gap-closure row #7 (2026-05-25)"
- SHIPPED Status Panel + Phase Plan + Work Log + Commits + Blockers sections preserved **verbatim**.

---

## 13. Handoff

- **Discovery review status**: complete, ready for review.
- **Next step**: feature-review (per Workflow V2 contract).
- **Dispatched by**: `xai-roadmap-loop` SERIAL dispatch — Wave 2 second row, after row #6 SHIPPED `a86f58f` 2026-05-25.

### Sources

- [Notion Authorization Guide](https://developers.notion.com/guides/get-started/authorization)
- [Using OAuth 2.0 to Access Google APIs](https://developers.google.com/identity/protocols/oauth2)
- [Choose Google Calendar API scopes](https://developers.google.com/workspace/calendar/api/auth)
- [Linear OAuth 2.0 Authentication](https://linear.app/developers/oauth-2-0-authentication)
- [Linear Developers Authentication](https://developers.linear.app/docs/oauth/authentication)
