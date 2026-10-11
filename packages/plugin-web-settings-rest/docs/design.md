# Design — plugin-web-settings-rest

> **Feature**: xai-web-settings-rest (roadmap row #24, W4b)
> **Status**: SHIPPED
> **Last Updated**: 2026-05-23

---

## 1. Purpose

Port the remaining 11 Settings panes from `web design/module-settings.jsx` into a typed
Vite+React 19 sibling package `@repo/plugin-web-settings-rest`. Panes are:
account, premium, smart_lists, notifications, date_time, more, integrations,
collaborate, sticky, hotkeys, about.

Consumes chassis atoms from `@repo/plugin-web-settings-shell` (row #21) via the
slot pattern. Registered via `settingsPaneComposition.ts` created by row #23.

## 2. Package Boundary

- **Package**: `packages/plugin-web-settings-rest/`
- **Exports** (`src/index.ts`): 11 `Pane` objects, `restPanesById`, `applyRestPanesToRegistry`
- **Consumes**: `@repo/plugin-web-settings-shell` chassis atoms via barrel only
- **Peers**: `@repo/plugin-web-tokens`, `@repo/plugin-web-storage`, `@repo/xai-web-event-bus`

## 3. Pane Inventory

| id | File | Controls | Footer |
|----|------|----------|--------|
| account | panes/accountPane.tsx | SVG avatar, name, email, Upgrade/SignOut/Delete | None |
| premium | panes/premiumPane.tsx | Static headline + Upgrade CTA | None |
| smart_lists | panes/smartListsPane.tsx | 12 rows × tri-state select | None (live persist) |
| notifications | panes/notificationsPane.tsx | 8 controls + conditional time inputs | None (live persist) |
| date_time | panes/dateTimePane.tsx | 5 controls | None (live persist) |
| more | panes/morePane.tsx | 14 controls + per-pane reset | None (live persist) |
| integrations | panes/integrationsPane.tsx | 17 placeholder cards (3 groups) | None |
| collaborate | panes/collaboratePane.tsx | 3 live-persist controls | None |
| sticky | panes/stickyPane.tsx | 13-color palette + font + pin + spacing | None (live persist) |
| hotkeys | panes/hotkeysPane.tsx | 10-row read-only table | None |
| about | panes/aboutPane.tsx | Version, build, 4 link buttons | None |

## 4. Internal Modules

| File | Purpose |
|------|---------|
| `src/internal/localI18n.ts` | Typed bilingual STR table; `localI18n(lang)` factory |
| `src/internal/DeleteAccountConfirmModal.tsx` | Native `<dialog>` confirm modal |
| `src/internal/StickyColorPalette.tsx` | 13-swatch component (CSS vars + conic-gradient) |
| `src/internal/restPanesById.ts` | Aggregate map keyed by SettingsPaneId |
| `src/internal/applyRestPanesToRegistry.ts` | Idempotent paneRegistry substitutor |

## 5. Storage Keys (37 new entries)

All 37 keys have `category: "pref"`, `owner: "xai-web-settings-rest"`, `schemaVersion: 1`.
Appended in one labeled block at the tail of `packages/plugin-web-storage/src/internal/registry.ts`.

Keys: `xai_pref_smart_lists`, `xai_pref_notif_enabled`, `xai_pref_notif_done_sound`,
`xai_pref_notif_push_task`, `xai_pref_notif_push_pomo`, `xai_pref_notif_push_habit`,
`xai_pref_notif_quiet`, `xai_pref_notif_quiet_start`, `xai_pref_notif_quiet_end`,
`xai_pref_dt_start_week`, `xai_pref_dt_lunar`, `xai_pref_dt_week_numbers`,
`xai_pref_dt_holidays`, `xai_pref_dt_timezone`,
`xai_pref_more_win_type`, `xai_pref_more_launch_at_login`, `xai_pref_more_minimize_on_launch`,
`xai_pref_more_date_recognition`, `xai_pref_more_remove_date_text`, `xai_pref_more_remove_tags`,
`xai_pref_more_url_parse`, `xai_pref_more_default_date`, `xai_pref_more_default_rem_due`,
`xai_pref_more_default_rem_all`, `xai_pref_more_default_pri`, `xai_pref_more_default_tag`,
`xai_pref_more_default_list`, `xai_pref_more_add_to`, `xai_pref_more_overdue_at`,
`xai_pref_collab_show_avatars`, `xai_pref_collab_default_share`, `xai_pref_collab_mention_notify`,
`xai_pref_sticky_color`, `xai_pref_sticky_font`, `xai_pref_sticky_pin_default`,
`xai_pref_sticky_restore_size`, `xai_pref_sticky_grid_spacing`.

## 6. Chassis Contract Notes

### 6.1 SettingRow label constraint

`SettingRowProps.label` is typed as `string`, not `ReactNode`. The source's
"Remove text in tasks" inline-checkbox (source line 725) uses a JSX fragment as
label — this row works around it by placing the checkbox in the `<SettingRow>`
children slot instead of the `label` prop. Functional parity preserved.

### 6.2 Collaborate pane: no footer

Source uses live `onChange` directly (no save button). Confirmed correct per
Design Review O2.

### 6.3 Reset semantics

Per-pane reset (More pane "Reset Default") calls `removePref` for only the pane's
owned keys. Does NOT call chassis `resetAllPrefs()`. A `resetKey` state counter
forces re-render after reset.

## 7. Event Declarations

`web:settings:rest:account-delete-confirmed: { confirmedAt: string }` — declared
in `packages/core/src/types/events.ts`. Declaration-only; no consumer in this row.

## 8. Sticky-note Color Palette

13 OKLCH custom properties declared in `src/styles.css`:

| id | Approx hex (source) | OKLCH |
|----|---------------------|-------|
| sun | #FFE066 | oklch(90% 0.12 90) |
| peach | #FFB347 | oklch(78% 0.14 68) |
| coral | #FF6B6B | oklch(65% 0.18 27) |
| sky | #74C0FC | oklch(72% 0.12 230) |
| indigo | #4263EB | oklch(45% 0.22 270) |
| lilac | #CC5DE8 | oklch(55% 0.22 310) |
| mint | #51CF66 | oklch(72% 0.18 145) |
| white | #F8F9FA | oklch(97% 0 0) |
| silver | #ADB5BD | oklch(73% 0.005 240) |
| graphite | #495057 | oklch(35% 0.005 240) |
| navy | #1864AB | oklch(30% 0.12 250) |
| midnight | #1A1B1E | oklch(14% 0.005 240) |
| random | (sentinel) | conic-gradient of above |

## 9. Frozen Assumptions

1. Panes shipped (11): account, premium, smart_lists, notifications, date_time, more,
   integrations, collaborate, sticky, hotkeys, about.
2. Composition seam: `settingsPaneComposition.ts` — 11 new switch cases.
3. No tokens.css edit (FA #15 from discovery review).
4. Delete-account: native `<dialog>` confirm-modal; confirm emits
   `web:settings:rest:account-delete-confirmed` (declaration-only).
5. Hotkeys: read-only 10-row table. No rebinding.
6. Integrations: 17 placeholder cards; click is no-op.
7. Sticky palette: `--sticky-note-color-<id>` OKLCH vars in scoped styles.css.
8. Reset: per-pane; `removePref` per owned key only.
9. About version: hard-coded `v 1.2.0 · build 2026.05.23`.

---

## 2026-05-25 Extension: Integrations Pane OAuth Stub (gap-closure row #7)

> APPEND-ONLY extension. SHIPPED row #24 contents above are NOT mutated.
> This block adds the Integrations OAuth stub for 3 providers (Notion / Google
> Calendar / Linear) per `docs/workflow/roadmap/xai-web-console-gap-closure.md`
> row #7. The 14 unwired placeholder cards stay placeholders.

### Decision header

| Field | Value |
|---|---|
| Selected Option | **Composite α** — see §5 of discovery review for sub-decisions A1 (sessionStorage state) + B1 (provider config array) + C1 (callback route under `/app`) + D1 (3 boolean prefs) + E1 (banner + badge) + F1 (declaration-only events) |
| Review Doc | `docs/reviews/xai-web-settings-integrations-3rd-party/20260525-discovery-review.md` |
| Review Date | 2026-05-25 |
| Roadmap Row | `docs/workflow/roadmap/xai-web-console-gap-closure.md` row #7 (W2) |
| Source brief | `docs/reviews/xai-web-settings-integrations-3rd-party/20260524-roadmap-seed.md` |
| Parent ADR | ADR-0009 §D2-G3 (P0 gap-closure) |
| ADR Amendment | **ADR-0008 §S3 D3 — third in-place amendment** per row #2 binding precedent + row #6 precedent. Extend `connect-src` with `https://api.notion.com`, `https://oauth2.googleapis.com`, `https://api.linear.app`. `frame-src` NOT widened (decision §FA-9 below). Update §S6 `_headers` snippet. Extend `apps/web/src/__tests__/csp.test.ts` (+1 case `CSP3`). |
| Target packages | `packages/plugin-web-settings-rest/src/{internal/integrationProviders.ts (NEW), internal/pkce.ts (NEW), internal/oauthState.ts (NEW), internal/buildAuthorizeUrl.ts (NEW), internal/integrationConnectButton.tsx (NEW), internal/integrationDisconnectButton.tsx (NEW), internal/integrationStubBanner.tsx (NEW), CallbackPage.tsx (NEW), panes/integrationsPane.tsx (EDIT), internal/localI18n.ts (EDIT), styles.css (EDIT), index.ts (EDIT — export CallbackPage)}` + `packages/plugin-web-storage/src/internal/registry.ts` (+3 prefs) + `packages/plugin-web-storage/src/__tests__/parity-design-md.test.ts` (+3 exempt keys) + `packages/core/src/types/events.ts` (+2 EventMap declarations) + `apps/web/src/routes/router.tsx` (+1 route child) + `apps/web/public/_headers` (extend connect-src) + `apps/web/src/__tests__/csp.test.ts` (+CSP3 case) + `docs/adr/0008-cloudflare-deploy-target-and-csp.md` (amend §S3 D3) |
| Dispatched by | `xai-roadmap-loop` SERIAL dispatch — Wave 2 second row (after row #6 SHIPPED `a86f58f` 2026-05-25) |
| Last Updated | 2026-05-25 |

### Frozen Assumptions (this extension; lock at plan acceptance)

**FA-1. Stub only.** No real token exchange, no backend, no token persistence. Callback receives `?code=…&state=…`, validates `state`, discards `code`. The only state mutation is the per-provider boolean pref flipping to `true`.

**FA-2. 3 providers only**: Notion, Google Calendar, Linear (HC1 of seed brief). No 4th provider this row.

**FA-3. PKCE generation.** `code_verifier` = 32 random bytes from `crypto.getRandomValues(new Uint8Array(32))` → base64url-encoded (URL-safe charset `[A-Za-z0-9_-]`, no padding). Length is 43 chars (32 bytes → 43 base64url chars without padding). `code_challenge` = base64url(SHA-256(code_verifier)). `code_challenge_method` = `S256`. **NEVER `Math.random`** (HC10 / source-text guarded).

**FA-4. State generation.** `state` = `<providerId>.` + base64url(32 random bytes from `crypto.getRandomValues`). The providerId prefix lets the callback look up the right `sessionStorage` entry without a separate URL param. Total state length ~50 chars.

**FA-5. sessionStorage shape.** Key = `xai_oauth_pending_<providerId>` (one of `xai_oauth_pending_notion` / `xai_oauth_pending_gcal` / `xai_oauth_pending_linear`). Value = JSON `{ state: string, codeVerifier: string, expiresAt: number (ms epoch) }`. **TTL = 10 minutes.** Cleared on: (a) successful callback validation, (b) failed callback validation, (c) explicit "Cancel" UX (not provided in v1 — manual sessionStorage clear), (d) automatic expiry check at callback time. **NEVER `localStorage`** (HC10 / strict ban — verified by source-text guard).

**FA-6. Same-tab navigation** for the OAuth authorize step. Connect handler calls `window.location.assign(authorizeUrl)`. This is a deviation from the seed brief HC2 phrasing "opens in new tab" — justified in discovery review §4.1: new-tab flow requires either `BroadcastChannel` (complex) or `localStorage` for `code_verifier` (HC10 violation). Same-tab is the only HC-compatible path. Flagged in discovery §8 Q1 for `feature-review` confirmation.

**FA-7. Callback route.** New react-router route: `/app/settings/integrations/callback`. Declared in `apps/web/src/routes/router.tsx` as a peer child under `path: "app"` (renders inside `<App>` layout → rail + topbar visible). Owned by `plugin-web-settings-rest` (exports `CallbackPage` from `src/index.ts`). The route element is `<CallbackPage />`. No URL params; the callback reads `useSearchParams()` for `state` + `code`. Other URL params (`error`, `error_description`) handled per `feature-build` P3.

**FA-8. Callback behaviour**:

- On valid state (string match in sessionStorage + TTL not expired + providerId prefix matches): flip `xai_pref_integrations_connected_<providerId>` to `true`; emit `web:settings:integration-connected`; clear sessionStorage entry; display "Authorization received (stub)" green banner; `setTimeout(() => navigate("/app/settings/integrations"), 2000)`.
- On invalid state (mismatch / missing / expired / providerId unknown): clear sessionStorage entry (defense in depth); do NOT flip pref; do NOT emit event; display "Invalid authorization state — please try again" red banner; navigate after 4000ms.
- On provider error (`?error=access_denied`): clear sessionStorage entry; do NOT flip pref; do NOT emit event; display "Authorization cancelled" yellow banner; navigate after 3000ms.

**FA-9. CSP scope.** `connect-src` extended with 3 token endpoints (`api.notion.com`, `oauth2.googleapis.com`, `api.linear.app`). `frame-src` **NOT widened** — all 3 providers set `X-Frame-Options: DENY` on authorize pages per discovery §3.3 evidence. `script-src` / `style-src` / `img-src` / `font-src` / `form-action` unchanged. ADR-0008 §S3 D3 amended in-place (third amendment). `_headers` updated. `csp.test.ts` gains CSP3 source-text guard. **No `*` wildcard. No `'unsafe-inline'`. No subdomain wildcard.**

**FA-10. EventMap (declaration-only).** Two new entries in `packages/core/src/types/events.ts`:

```typescript
"web:settings:integration-connected": {
  providerId: "notion" | "gcal" | "linear";
  mode: "stub";
  connectedAt: string; // ISO timestamp
};
"web:settings:integration-disconnected": {
  providerId: "notion" | "gcal" | "linear";
  disconnectedAt: string; // ISO timestamp
};
```

No consumer in this row. Mirrors row #5 (`web:dashboard:widget-added`) + row #6 (`web:board:share-requested`) precedents. Forward-compat hook for P1 sync rows.

**FA-11. 3 boolean prefs.** Registered in `packages/plugin-web-storage/src/internal/registry.ts` in a labeled block at the tail of the file:

| Key | Codec | Default | Category | Owner | SchemaVersion |
|---|---|---|---|---|---|
| `xai_pref_integrations_connected_notion` | boolean | false | pref | xai-web-settings-rest | 1 |
| `xai_pref_integrations_connected_gcal` | boolean | false | pref | xai-web-settings-rest | 1 |
| `xai_pref_integrations_connected_linear` | boolean | false | pref | xai-web-settings-rest | 1 |

Caught by chassis `resetAllPrefs()` via `key.startsWith("xai_")` filter (consistent with the 37 SHIPPED row-#24 keys). Parity test gains 3 exempt keys.

**FA-12. Stub-mode disclosure**. Pane-top non-dismissible bilingual banner + per-provider "(stub)" badge on Connected state. Banner text: EN "Integrations are in v1 stub mode — authorization flows are wired but no data sync occurs yet." ZH "集成处于 v1 演示模式 — 已接入授权流程，但暂不进行真实数据同步。" Badge: EN "Connected (stub)", ZH "已连接（演示）".

**FA-13. No new package dependency.** All PKCE helpers implemented in-package via Web Crypto API. No `oauth4webapi` / `@auth0/auth0-spa-js` / etc.

**FA-14. The 14 unwired placeholder cards** (currently in FEATURED minus notion+gcal, CALENDAR minus gcal, INTEGRATE minus linear = 14 effective placeholders) keep their existing render + no-op handlers. IN1..IN6 tests stay green via card-count check that respects the +3 wired cards (assertion adjusted from "17 cards" to "at least 17 cards" OR the wired cards live in a separate `<section>` excluded from IN1's grid query).

**FA-15. Append-only doc discipline.** This `design.md` gains ONE new section (this one); `api.md` gains ONE new §6 section; `test.md` gains ONE new §5 section; `dev_log.md` gains ONE new "## Bugfix-Extension Lineage — gap-closure row #7 (2026-05-25)" block. SHIPPED Status Panel + Phase Plan + Work Log + Commits + Blockers preserved verbatim.

### Component graph (extension)

```
@repo/plugin-web-settings-rest (extended)
├── src/CallbackPage.tsx                       — NEW: OAuth callback handler (validate state, flip pref, banner, navigate)
├── src/panes/integrationsPane.tsx             — EDIT: add ConnectedIntegrations section above existing 3 groups; preserve 14 placeholders
├── src/internal/integrationProviders.ts       — NEW: const PROVIDERS array of 3 IntegrationProvider entries
├── src/internal/pkce.ts                       — NEW: generateCodeVerifier(), computeCodeChallenge(), base64url helpers
├── src/internal/oauthState.ts                 — NEW: generateState(providerId), validateState(stateFromUrl), TTL handling
├── src/internal/buildAuthorizeUrl.ts          — NEW: pure function provider + state + codeChallenge → URL
├── src/internal/integrationConnectButton.tsx  — NEW: Connect button per provider; writes sessionStorage, calls window.location.assign
├── src/internal/integrationDisconnectButton.tsx — NEW: Disconnect button per provider; flips pref off, emits event
├── src/internal/integrationStubBanner.tsx     — NEW: pane-top disclosure banner (bilingual, non-dismissible)
├── src/internal/localI18n.ts                  — EDIT: +24 bilingual entries (banner, badge, button labels, callback statuses)
├── src/styles.css                             — EDIT: +banner + badge + connected-section CSS (all OKLCH, no hex)
├── src/index.ts                               — EDIT: + export { CallbackPage }; types: + IntegrationProviderId
└── src/__tests__/
    ├── pkce.test.ts                           — NEW: 8 cases (length, charset, RFC vector, no Math.random)
    ├── oauthState.test.ts                     — NEW: 7 cases (TTL expiry, prefix mismatch, malformed, valid roundtrip)
    ├── integrationProviders.test.ts           — NEW: 4 cases (exactly 3 entries, all https, prefKeys registered)
    ├── buildAuthorizeUrl.test.ts              — NEW: 6 cases (PKCE params, scope, redirect_uri, state)
    ├── integrationConnectButton.test.tsx      — NEW: 4 cases (writes sessionStorage, calls navigate, bilingual)
    ├── integrationDisconnectButton.test.tsx   — NEW: 3 cases (flips pref, emits event, bilingual)
    ├── integrationStubBanner.test.tsx         — NEW: 2 cases (renders, bilingual)
    ├── CallbackPage.test.tsx                  — NEW: 8 cases (valid path, invalid state, expired, error param, missing, URL parsing, event emit, navigate)
    └── integrationsPane.test.tsx              — EDIT: keep IN1..IN6; add IN-EXT-1..IN-EXT-12

apps/web/
├── src/routes/router.tsx                      — EDIT: + 1 route child { path: "settings/integrations/callback", element: <CallbackPage /> }
├── public/_headers                            — EDIT: extend connect-src
└── src/__tests__/csp.test.ts                  — EDIT: + CSP3 case

packages/core/src/types/events.ts              — EDIT: + 2 EventMap declarations

packages/plugin-web-storage/
├── src/internal/registry.ts                   — EDIT: + 3 boolean prefs in labeled block
└── src/__tests__/parity-design-md.test.ts     — EDIT: + 3 exempt keys

docs/adr/0008-cloudflare-deploy-target-and-csp.md — EDIT: amend §S3 D3 + Amendments frontmatter row

docs/PLUGIN_MAP.md                              — EDIT: append "(Extension 2026-05-25 — Integrations OAuth stub gap-closure row #7)" to plugin-web-settings-rest row
```

### State machine (per provider)

```
                              ┌─ user clicks Disconnect ─┐
                              │                          ▼
[ Disconnected ] ─ click Connect ─► [ Connecting (navigating) ]
       ▲                                       │
       │                                       ▼ (window.location.assign)
       │                              [ Awaiting Callback ]
       │                                       │
       │                                       ▼ (provider redirects back)
       │                              [ Validating state ]
       │                                       │
       │              ┌─ invalid / expired / error ─┐    ┌─ valid ─┐
       │              ▼                              ▼              ▼
       │     [ Error banner 4s ]            [ Cancelled 3s ]   [ Connected (stub) ]
       │              │                              │              │
       └──────────────┴──────────────────────────────┴──────────────┘
                              navigate("/app/settings/integrations")
```

- All transitions are pure (no race conditions): Connecting → Awaiting Callback happens because of `window.location.assign` which is a full page-unload, so React state is fresh on callback.
- The state machine is implicit in the user-visible UI; no explicit reducer needed.

### Dependencies (extension)

| Dep | Kind | Why |
|---|---|---|
| `@repo/plugin-web-storage` | existing peer | 3 new boolean prefs via `usePref()` |
| `@repo/plugin-web-tokens` | existing peer | `useI18n(lang)` for global keys + `Lang` type |
| `@repo/xai-web-event-bus` | existing peer | `emitWebEvent("web:settings:integration-connected", ...)` |
| `@repo/core` | indirect via tokens | type-only flow (new EventMap entries declared here) |
| `react-router` | existing in host | callback page uses `useSearchParams`, `useNavigate` |
| Web Crypto API | platform (browser) | `crypto.getRandomValues`, `crypto.subtle.digest("SHA-256", ...)` |

**No new package dependency.** No `oauth4webapi`. No `@types/oauth*`.

### Bilingual i18n delta (preview — full table in `api.md` §6.6)

~24 new keys under `oauth.*` / `int.*` namespace (existing `int.featured` / `int.calendar` / `int.integrate` preserved). Examples:

```
"int.banner.stub": EN "Integrations are in v1 stub mode — authorization flows are wired but no data sync occurs yet."
                   ZH "集成处于 v1 演示模式 — 已接入授权流程，但暂不进行真实数据同步。"
"int.badge.connected_stub": EN "Connected (stub)" ZH "已连接（演示）"
"int.btn.connect": EN "Connect" ZH "连接"
"int.btn.disconnect": EN "Disconnect" ZH "断开连接"
"int.section.connected": EN "Connected providers" ZH "已连接提供商"
"int.disconnect.tooltip": EN "Disconnect clears local state only. To revoke access, visit the provider's account settings."
                          ZH "断开仅清除本地状态。如需撤销授权，请前往提供商账号设置。"
"oauth.cb.success": EN "Authorization received (stub)" ZH "已接收授权（演示）"
"oauth.cb.invalid": EN "Invalid authorization state — please try again" ZH "授权状态无效 — 请重新尝试"
"oauth.cb.cancelled": EN "Authorization cancelled" ZH "授权已取消"
"oauth.cb.redirect_notice": EN "Returning to settings…" ZH "正在返回设置…"
"provider.notion": EN "Notion" ZH "Notion"
"provider.gcal": EN "Google Calendar" ZH "Google 日历"
"provider.linear": EN "Linear" ZH "Linear"
```

### Risks recap (one-liner; full table in discovery §6)

R1 PKCE state collision under fast re-clicks → per-provider namespaced sessionStorage keys. R2 Callback reached without prior state → invalid-state banner + navigate. R3 Popup blocker → moot (same-tab). R4 Notion rate-limit → user-initiated only. R5 Surprise `frame-src` need → cross-vendor verify flag. R6 Provider-side grant not revoked → documented tooltip. R7 TTL too short → 10-min default + clear error path. R8 jsdom crypto stubs → confirmed adequate in row #6 precedent. R9 Other code misinterpreting flags → FA documentation. R10 Cold-read flags strictness → test suite TT-PKCE-1..5 covers validation.


---

## 2026-05-26 Extension: Premium Pane Stripe Checkout Stub (gap-closure row #8)

> APPEND-ONLY extension. SHIPPED row #24 contents above (Workflow State Panel +
> 2026-05-25 row #7 OAuth-stub block) are NOT mutated. This block adds the
> Premium Stripe Checkout stub per
> `docs/workflow/roadmap/xai-web-console-gap-closure.md` row #8.

### Decision header

| Field | Value |
|---|---|
| Selected Option | **Composite α** — see §5 of discovery review for sub-decisions A1 (same-tab redirect Payment Link) + B1 (connect-src +3 hostnames; no script-src/frame-src widening) + C1 (two routes `/success` + `/cancel`) + D1 (two prefs `tier` + `started_at`) + E1 (pure read-side 30-day filter) + F1 (`<PremiumTierBadge />` exported + 1-line Topbar JSX placement) |
| Review Doc | `docs/reviews/xai-web-settings-premium-stripe/20260525-discovery-review.md` |
| Review Date | 2026-05-26 |
| Roadmap Row | `docs/workflow/roadmap/xai-web-console-gap-closure.md` row #8 (W2) |
| Source brief | `docs/reviews/xai-web-settings-premium-stripe/20260524-roadmap-seed.md` |
| Parent ADR | ADR-0009 §D2-G3 (P0 gap-closure) |
| ADR Amendment | **ADR-0008 §S3 D3 — FOURTH in-place amendment** per row #2 + row #6 + row #7 binding precedents. Extend `connect-src` with `https://js.stripe.com`, `https://checkout.stripe.com`, `https://buy.stripe.com`. `script-src` and `frame-src` NOT widened (decision §FA-10 below — same-tab redirect, no Stripe.js bundle, no iframe embed). Update §S6 `_headers` snippet. Extend `apps/web/src/__tests__/csp.test.ts` (+1 case `CSP4`). |
| Target packages | `packages/plugin-web-settings-rest/src/{internal/premiumTier.ts (NEW), internal/usePremiumConfig.ts (NEW), internal/usePremiumTier.ts (NEW), internal/PremiumTierBadge.tsx (NEW), internal/premiumDisclosureBanner.tsx (NEW), internal/premiumUpgradeButton.tsx (NEW), internal/premiumCancelButton.tsx (NEW), CheckoutSuccessPage.tsx (NEW), CheckoutCancelPage.tsx (NEW), panes/premiumPane.tsx (EDIT — keep PR1..3 green), internal/localI18n.ts (EDIT — +14 bilingual entries), styles.css (EDIT — +banner + badge + premium-pane CSS), index.ts (EDIT — export CheckoutSuccessPage + CheckoutCancelPage + PremiumTierBadge + PremiumTier type)}` + `packages/plugin-web-storage/src/internal/registry.ts` (+2 prefs) + `packages/plugin-web-storage/src/__tests__/parity-design-md.test.ts` (+2 exempt keys) + `packages/core/src/types/events.ts` (+1 EventMap declaration `web:premium:tier-changed`) + `packages/xai-web-shell/src/Topbar.tsx` (EDIT — 1 import + 1 JSX placement of `<PremiumTierBadge />`) + `packages/xai-web-shell/src/__tests__/Topbar.test.tsx` (EDIT — +1 case `TB-PREMIUM-1`) + `apps/web/src/routes/router.tsx` (+2 route children) + `apps/web/public/_headers` (extend connect-src) + `apps/web/src/__tests__/csp.test.ts` (+CSP4 case) + `apps/web/deploy/README.md` (NEW — env-var documentation) + `docs/adr/0008-cloudflare-deploy-target-and-csp.md` (amend §S3 D3) + `docs/PLUGIN_MAP.md` (append extension note) |
| Dispatched by | `xai-roadmap-loop` SERIAL dispatch — Wave 2 third row (after row #7 SHIPPED `5085a03` 2026-05-26) |
| Last Updated | 2026-05-26 |

### Frozen Assumptions (this extension; lock at plan acceptance)

**FA-1. Stub only.** No real subscription state in any backend. No webhook. No SK in any client code path. The only state mutation is two boolean/scalar prefs (`xai_pref_premium_tier`, `xai_pref_premium_started_at`) and one declaration-only event (`web:premium:tier-changed`). "Cancel Subscription" is local-flag-only — no Stripe API call.

**FA-2. Same-tab redirect via Payment Link.** Upgrade click → `window.location.assign(VITE_STRIPE_PAYMENT_LINK_URL)`. NO `window.open(...)` (popup-blocker hostile + can't sync state across tabs without HC10-violating `localStorage`). NO Stripe.js bundle. NO embedded iframe. This is the only client-only HC3+HC4-compatible path post 2025-09-30 redirectToCheckout removal (discovery §3.1).

**FA-3. Two new routes** (literal-path siblings of row #7's callback, declared before `:moduleId/*`):
- `/app/settings/premium/checkout/success` → `<CheckoutSuccessPage />` (validates `?session_id=` presence + non-empty; flips tier; emits event; banner; navigates back in 2000ms)
- `/app/settings/premium/checkout/cancel` → `<CheckoutCancelPage />` (idempotent; tier unchanged; banner; navigates back in 3000ms)

**FA-4. Two new registry entries** in `packages/plugin-web-storage/src/internal/registry.ts` (labeled block at tail):

| Key | Codec | Default | Category | Owner | SchemaVersion |
|---|---|---|---|---|---|
| `xai_pref_premium_tier` | string | `"free"` | pref | xai-web-settings-rest | 1 |
| `xai_pref_premium_started_at` | number | `0` | pref | xai-web-settings-rest | 1 |

`xai_pref_premium_tier` value union: `"free" | "pending" | "premium_stub"`. `"pending"` is transitional only (between Upgrade-click and success-callback arrival); the stored value flips `"free" → "pending" → "premium_stub"` (or `"free" → "pending" → "free"` on cancel). Caught by chassis `resetAllPrefs()` via `key.startsWith("xai_")`. Parity test +2 exempt.

**FA-5. `usePremiumTier()` is a pure read-side filter.** Reads both prefs; if `tier === "premium_stub"` AND `started_at + 30*24*3600*1000 <= Date.now()`, returns `"free"` (effective). Optional lazy-cleanup: on first read past expiry, also writes the storage back to `"free"` + clears `started_at`. SSR-safe (returns `"free"` if no `localStorage`). NO setInterval, NO setTimeout — deterministic per call.

**FA-6. Gold badge** is `<PremiumTierBadge />` exported from `plugin-web-settings-rest`. Reads `usePremiumTier()` internally; returns `null` if effective tier is not `"premium_stub"`. Otherwise renders `<span className="premium-tier-badge">{t("premium.badge.tier_stub")}</span>` (text "Premium (stub)" / "高级版（演示）"). Placed via 1-line JSX edit in `packages/xai-web-shell/src/Topbar.tsx` at the left end of `topbar-controls` (before the lang `<div className="seg">`). xai-web-shell test gains 1 case `TB-PREMIUM-1`.

**FA-7. "Cancel Subscription" button** rendered only when effective tier is `"premium_stub"`. onClick:
1. Writes `xai_pref_premium_tier = "free"`.
2. Writes `xai_pref_premium_started_at = 0`.
3. Emits `web:premium:tier-changed` with `{ previous: "premium_stub", current: "free", changedAt: <ISO> }`.
4. No fetch. No Stripe API call. Documented in disclosure tooltip on the button: EN "Clearing the local subscription flag will not contact Stripe — manage payment at billing.stripe.com" / ZH "清除本地订阅标记不会通知 Stripe — 请前往 billing.stripe.com 管理付款"

**FA-8. Disclosure banner** is `<PremiumDisclosureBanner />` — non-dismissible (no close button), rendered unconditionally at the top of the Premium pane in all 3 tier states, OKLCH amber/gold background (`oklch(78% 0.12 85)` background + `oklch(25% 0.04 85)` text). Text:
- EN: "v1 Premium is a UX preview. Real subscription enforcement requires desktop client (P1)."
- ZH: "v1 高级版仅为 UX 演示。真实订阅功能需在桌面端（P1）实现。"

Distinct CSS class (`premium-disclosure-banner`) — does NOT reuse row #7's `int-stub-banner` class (different visual treatment + different rotation in test selectors).

**FA-9. New EventMap entry** in `packages/core/src/types/events.ts`:

```typescript
"web:premium:tier-changed": {
  /** Previous effective tier before this transition. */
  previous: "free" | "pending" | "premium_stub";
  /** New effective tier after this transition. */
  current: "free" | "pending" | "premium_stub";
  /** ISO 8601 timestamp at the moment of transition. */
  changedAt: string;
};
```

No consumer in this row (declaration-only). Mirrors row #5 + row #6 + row #7 precedent. Forward-compat hook for P1 feature-gating rows.

**FA-10. CSP scope (FOURTH amendment).** `connect-src` extended with 3 Stripe hostnames:
- `https://js.stripe.com`
- `https://checkout.stripe.com`
- `https://buy.stripe.com`

`script-src`, `frame-src`, `form-action`, `worker-src` all UNCHANGED. Rationale (discovery §3.3): same-tab `window.location.assign` is a top-level navigation, not subject to `connect-src`; the 3 defensive entries cover any future preflight/analytics. We do NOT load Stripe.js or embed Checkout in v1, so the heavier directives stay clean. ADR-0008 §S3 D3 amended in-place (FOURTH amendment). `_headers` updated. `csp.test.ts` gains CSP4 source-text guard. **No `*` wildcard. No `'unsafe-inline'`. No subdomain wildcard.**

**FA-11. Source-text guards** (added in P5):
- `apps/web/src/__tests__/csp.test.ts` CSP4 case (asserts `_headers` connect-src contains all 3 Stripe hostnames).
- `packages/plugin-web-settings-rest/src/__tests__/no-stripe-secret-key.test.ts` (asserts zero occurrences of `sk_test_` and `sk_live_` literals across `packages/plugin-web-settings-rest/src/**/*.{ts,tsx}`).
- `packages/plugin-web-settings-rest/src/__tests__/no-stripe-js-bundle.test.ts` (asserts zero occurrences of `@stripe/stripe-js` import and `https://js.stripe.com/` literal in source).

These three guards are the row's hard cross-vendor verify gates.

**FA-12. Tier flag scope.** `xai_pref_premium_tier === "premium_stub"` MUST NOT be interpreted by any other plugin/code as a "real subscription is active" signal in v1. This is a UX-stub flag only. Enforcement: registry.ts comment block documents the constraint; api.md §7.7 documents it; PLUGIN_MAP extension note flags v1-stub semantics.

**FA-13. No new package dependency.** No `@stripe/stripe-js`. No `stripe-node`. No `@stripe/react-stripe-js`. Pure same-tab redirect using existing `window.location.assign`. No new NPM dep introduced in any package.json — only `peerDependencies` declarations are added/touched.

**FA-14. PR1..PR3 tests preserved verbatim** (HC9). The 3 existing `premiumPane.test.tsx` cases (Renders without error / Bilingual headline / id+icon+i18nKey correct) MUST stay green. New tests are additive — PT1..PT6 (tier transitions), PB-BANNER-1..3 (disclosure banner), CS1..CS8 (CheckoutSuccessPage), CC1..CC4 (CheckoutCancelPage), PHK1..PHK4 (usePremiumTier hook), PCB-1..2 (PremiumTierBadge), PUB-1..3 (Upgrade button), PCANCEL-1..3 (Cancel button), TB-PREMIUM-1 (xai-web-shell topbar), CSP4 + no-SK + no-stripe-js-bundle source-text guards, parity-test +2 exempt, EV3 EventMap declaration. Approx **40 new tests**.

**FA-15. Append-only doc discipline.** This `design.md` gains ONE new section (this one); `api.md` gains ONE new §7 section; `test.md` gains ONE new §6 section; `dev_log.md` gains ONE new "## Bugfix-Extension Lineage — gap-closure row #8 (2026-05-26)" block. SHIPPED row #24 Workflow State Panel + row #7 Lineage block preserved verbatim.

### Component graph (extension)

```
@repo/plugin-web-settings-rest (extended)
├── src/CheckoutSuccessPage.tsx                — NEW: validates ?session_id, flips tier, emits event, banner, navigates
├── src/CheckoutCancelPage.tsx                 — NEW: idempotent UX confirmation, navigates back
├── src/panes/premiumPane.tsx                  — EDIT: add Upgrade button + Cancel button + disclosure banner + tier-aware copy; PR1..3 green
├── src/internal/premiumTier.ts                — NEW: type PremiumTier + const PREMIUM_TIER_TTL_MS = 30*24*3600*1000
├── src/internal/usePremiumTier.ts             — NEW: read-side hook returning effective tier
├── src/internal/usePremiumConfig.ts           — NEW: read env vars (VITE_STRIPE_PAYMENT_LINK_URL) + disabled fallback
├── src/internal/PremiumTierBadge.tsx          — NEW: exported component for xai-web-shell Topbar
├── src/internal/premiumDisclosureBanner.tsx   — NEW: non-dismissible banner
├── src/internal/premiumUpgradeButton.tsx      — NEW: Upgrade button (disabled if env missing)
├── src/internal/premiumCancelButton.tsx       — NEW: Cancel Subscription button (visible only when premium_stub)
├── src/internal/localI18n.ts                  — EDIT: +14 bilingual entries (badge, banner, button labels, callback statuses, disclaimers)
├── src/styles.css                             — EDIT: +premium-disclosure-banner + premium-tier-badge + premium-upgrade-btn + premium-cancel-btn + premium-cb-page CSS (all OKLCH)
├── src/index.ts                               — EDIT: + export { CheckoutSuccessPage, CheckoutCancelPage, PremiumTierBadge }; + type PremiumTier
└── src/__tests__/
    ├── premiumTier.test.ts                    — NEW: 4 cases (PT1..PT4 transitions)
    ├── usePremiumTier.test.tsx                — NEW: 4 cases (PHK1..PHK4 — free, premium_stub, expired-30d, SSR-safe)
    ├── usePremiumConfig.test.tsx              — NEW: 3 cases (env present / env empty / env invalid)
    ├── PremiumTierBadge.test.tsx              — NEW: 2 cases (renders when premium_stub, returns null when free)
    ├── premiumDisclosureBanner.test.tsx       — NEW: 3 cases (EN, ZH, non-dismissible)
    ├── premiumUpgradeButton.test.tsx          — NEW: 3 cases (calls window.location.assign with env URL, disabled if env empty, bilingual)
    ├── premiumCancelButton.test.tsx           — NEW: 3 cases (flips tier, emits event, bilingual)
    ├── CheckoutSuccessPage.test.tsx           — NEW: 8 cases (CS1..CS8: valid session_id, missing session_id, empty session_id, flips tier, emits event, displays success banner, navigates after 2000ms, bilingual)
    ├── CheckoutCancelPage.test.tsx            — NEW: 4 cases (CC1..CC4: renders, idempotent re tier, navigates after 3000ms, bilingual)
    ├── premiumPane.test.tsx                   — EDIT: PR1..3 preserved + PT-EXT-1..PT-EXT-6 (Upgrade visible/clickable when free, Cancel visible when premium_stub, banner always present, tier-aware copy)
    ├── no-stripe-secret-key.test.ts           — NEW: source-text guard (zero "sk_test_" / "sk_live_" in src/**)
    └── no-stripe-js-bundle.test.ts            — NEW: source-text guard (zero "@stripe/stripe-js" / "https://js.stripe.com/" in src/**)

packages/xai-web-shell/
├── src/Topbar.tsx                              — EDIT: + import { PremiumTierBadge } from "@repo/plugin-web-settings-rest"; + <PremiumTierBadge /> at left end of topbar-controls (1 import + 1 line)
└── src/__tests__/Topbar.test.tsx              — EDIT: + TB-PREMIUM-1 case

apps/web/
├── src/routes/router.tsx                      — EDIT: + 2 route children { path: "settings/premium/checkout/success", element: <CheckoutSuccessPage /> } + { path: "settings/premium/checkout/cancel", element: <CheckoutCancelPage /> } (both BEFORE :moduleId/*)
├── public/_headers                            — EDIT: extend connect-src with 3 Stripe hostnames
├── src/__tests__/csp.test.ts                  — EDIT: + CSP4 case
└── deploy/README.md                           — NEW: env-var documentation (VITE_STRIPE_PAYMENT_LINK_URL setup; secret-rotation runbook for the Payment Link URL)

packages/core/src/types/events.ts              — EDIT: + 1 EventMap declaration "web:premium:tier-changed"

packages/plugin-web-storage/
├── src/internal/registry.ts                   — EDIT: + 2 prefs in labeled block (tier + started_at)
└── src/__tests__/parity-design-md.test.ts     — EDIT: + 2 exempt keys

docs/adr/0008-cloudflare-deploy-target-and-csp.md — EDIT: amend §S3 D3 (FOURTH amendment row) + Amendments frontmatter row + §S6 _headers snippet update

docs/PLUGIN_MAP.md                              — EDIT: append "(Extension 2026-05-26 — Premium Stripe Checkout stub gap-closure row #8)" to plugin-web-settings-rest row + add `@repo/xai-web-shell` to deps list (it was already there)
```

### State machine (premium tier)

```
                                              ┌─ Cancel Subscription click ─┐
                                              │                              ▼
[ free ] ─ Upgrade click ─► [ pending ]                                     [ free ]
   ▲                          │                                              ▲
   │                          ▼ (window.location.assign Payment Link)        │
   │                          │                                              │
   │                          ▼ (Stripe redirects back)                      │
   │                  [ at /success?session_id=... ]                         │
   │                          │                                              │
   │              ┌─ ?session_id missing/empty ─┐    ┌─ valid ─┐             │
   │              ▼                              ▼              ▼             │
   │     [ invalid banner ]              [ free fall-back ] [ premium_stub ] │
   │              │ navigate                     │ navigate     │             │
   │              ▼                              ▼              │             │
   └──────────────┴──────────────────────────────┘              │             │
                              navigate(/app/settings/premium)   │             │
                                                                ▼             │
                                          [ after 30 days OR Cancel click ]   │
                                                                ▼             │
                                                              [ free ] ───────┘
```

- All transitions are pure (no race conditions): pending → premium_stub happens via React state on the new page after `window.location.assign` (full page unload).
- "pending" is short-lived (only between Upgrade click and Stripe-page navigation start). It's stored briefly to allow the disclosure banner to show "Redirecting to Stripe…" — implementation may opt to skip the stored "pending" state and only render the redirecting UI from local component state. Decision deferred to feature-build P2; default is to store `"pending"` for ~100ms before assign.

### Dependencies (extension)

| Dep | Kind | Why |
|---|---|---|
| `@repo/plugin-web-storage` | existing peer | 2 new prefs via `usePref()` |
| `@repo/plugin-web-tokens` | existing peer | `useI18n(lang)` for global keys + `Lang` type |
| `@repo/xai-web-event-bus` | existing peer | `emitWebEvent("web:premium:tier-changed", ...)` |
| `@repo/core` | indirect via tokens | type-only flow (new EventMap entry declared here) |
| `react-router` | existing dep (row #7) | callback pages use `useSearchParams`, `useNavigate` |
| `@repo/xai-web-shell` | NEW peer (limited surface) | Topbar imports `<PremiumTierBadge />` — 1-line JSX placement |
| Web Crypto API | platform (browser) | NOT used in this row (no PKCE; pure redirect) |
| env var `VITE_STRIPE_PAYMENT_LINK_URL` | runtime config | Payment Link URL (per-environment) |

**No new NPM dependency.** `@repo/xai-web-shell` is added as a peer of `plugin-web-settings-rest` (verify package.json `peerDependencies`).

### Bilingual i18n delta (preview — full table in `api.md` §7.6)

~14 new keys under `premium.*` namespace (existing `premium.headline_en` / `premium.body_en` preserved). Examples:

```
"premium.badge.tier_stub": EN "Premium (stub)" ZH "高级版（演示）"
"premium.disclosure.banner": EN "v1 Premium is a UX preview. Real subscription enforcement requires desktop client (P1)."
                             ZH "v1 高级版仅为 UX 演示。真实订阅功能需在桌面端（P1）实现。"
"premium.btn.upgrade":     EN "Upgrade Now" ZH "立即升级"  (already in row #24 — reused via global s("settings.upgrade_now"))
"premium.btn.cancel_sub":  EN "Cancel Subscription" ZH "取消订阅"
"premium.btn.cancel_sub_tooltip":
  EN "Clearing the local subscription flag will not contact Stripe — manage payment at billing.stripe.com"
  ZH "清除本地订阅标记不会通知 Stripe — 请前往 billing.stripe.com 管理付款"
"premium.upgrade_disabled_tooltip":
  EN "Payment Link not configured — see apps/web/deploy/README.md"
  ZH "Payment Link 未配置 — 请参考 apps/web/deploy/README.md"
"premium.redirect_notice":  EN "Redirecting to Stripe…" ZH "正在跳转至 Stripe…"
"premium.cb.success":       EN "Subscription activated (stub)" ZH "已激活订阅（演示）"
"premium.cb.invalid":       EN "Checkout completion could not be confirmed — tier unchanged" ZH "无法确认结账完成 — 等级未变更"
"premium.cb.cancel":        EN "Checkout cancelled — tier unchanged" ZH "结账已取消 — 等级未变更"
"premium.cb.redirect_notice": EN "Returning to Premium settings…" ZH "正在返回高级版设置…"
"premium.tier.free":        EN "Free" ZH "免费版"
"premium.tier.premium_stub":EN "Premium (stub)" ZH "高级版（演示）"
"premium.tier.label":       EN "Current tier:" ZH "当前等级："
```

### Risks recap (one-liner; full table in discovery §6)

R1 Payment Link env missing → disabled button with tooltip + PC-CONFIG-1 test. R2 SK leaked in source → no-stripe-secret-key.test.ts source-text guard. R3 Stripe.js accidentally bundled → no-stripe-js-bundle.test.ts source-text guard. R4 30-day client-clock bypass → documented v1 limitation + disclosure banner. R5 Direct callback URL hit without prior Upgrade → CheckoutSuccessPage validates session_id presence + invalid-state path. R6 Topbar edit breakage → additive 1-line edit + TB-PREMIUM-1. R7 Disclosure banner missed → non-dismissible + amber OKLCH + present in all 3 tier states. R8 Downstream code misreads premium_stub as real subscription → registry comment + api.md §7.7 + FA-12. R9 CSP3 accidentally narrowed when adding CSP4 → CSP3 case retained. R10 Payment Link URL revoked in Stripe dashboard → operator runbook in apps/web/deploy/README.md. R11 Topbar badge CSS conflict → scoped class + manual smoke at ship-time.

---

## 2026-05-26 Extension: Account Delete Wire (gap-closure row #9)

> APPEND-ONLY extension. SHIPPED row #24 contents + the 2026-05-25 row #7
> Integrations OAuth Stub block + the 2026-05-26 row #8 Premium Stripe
> Checkout Stub block above are NOT mutated. This block adds the
> account-delete real wiring per
> `docs/workflow/roadmap/xai-web-console-gap-closure.md` row #9 (W2 LAST).

### Decision header

| Field | Value |
|---|---|
| Selected Option | **Composite α** — see §3 of discovery review for sub-decisions A1 (single `<dialog>` step machine) + B1 (case-sensitive controlled input) + state-machine + D1 (mock-auth banner on Step 2) + E1 (`useAccountDeleteOrchestrator` internal hook) + F1 (early deprecated-event emit on Continue) + G1 (extend `web-auth-device-session` with `deleteAccount()` + `ACCOUNT_LOCAL_WIPE_IDB_NAMES` const) |
| Review Doc | `docs/reviews/xai-web-settings-account-delete-wire/20260525-discovery-review.md` |
| Review Date | 2026-05-26 |
| Roadmap Row | `docs/workflow/roadmap/xai-web-console-gap-closure.md` row #9 (W2 LAST · Account-delete wire) |
| Source brief | `docs/reviews/xai-web-settings-account-delete-wire/20260524-roadmap-seed.md` |
| Parent ADR | ADR-0009 §D2-G3 (P0 gap-closure) |
| ADR Amendment | **NONE.** `connect-src` already covers `VITE_SUPABASE_URL` via the SHIPPED `web-auth-device-session` package's runtime usage. No `_headers` edit. No ADR-0008 amendment. First wave-2 gap-closure row without an ADR amendment. |
| Target packages | `packages/plugin-web-settings-rest/src/{internal/DeleteAccountConfirmModal.tsx (REWRITE — single→2-step), internal/useAccountDeleteOrchestrator.ts (NEW), internal/localI18n.ts (EDIT — +17 bilingual keys), styles.css (EDIT — +modal step CSS + mock banner + error banner — all OKLCH), panes/accountPane.tsx (EDIT — Step 1 Continue emits deprecated event)}` + `packages/web-auth-device-session/src/{auth-actions.ts (EDIT — +deleteAccount + AccountDeleteError), storage.ts (or new wipe.ts — +wipeRegisteredIDB helper), index.ts (EDIT — export deleteAccount, AccountDeleteError, AccountDeleteErrorKind, ACCOUNT_LOCAL_WIPE_IDB_NAMES)}` + `packages/web-auth-device-session/docs/{design.md, api.md, dev_log.md} (APPEND-ONLY extension sections)` + `packages/core/src/types/events.ts (EDIT — JSDoc @deprecated annotation on web:settings:rest:account-delete-confirmed)` + `apps/web/deploy/README.md (EDIT — +§Account-Delete Edge Function + §Account-Delete Rollback)` + `docs/PLUGIN_MAP.md (EDIT — extension notes on plugin-web-settings-rest + web-auth-device-session rows)` |
| Dispatched by | `xai-roadmap-loop` SERIAL dispatch — Wave 2 fourth (LAST) row, after row #8 SHIPPED `00580dd` 2026-05-26 |
| Last Updated | 2026-05-26 |

### Frozen Assumptions (this extension; lock at plan acceptance)

**FA-1. Modal is a single `<dialog>` with internal `useReducer` step state.** States: `"step1" | "step2" | "submitting" | "success" | "failure"`. The dialog opens once; transitions happen inside it. Focus management trivial (one `<dialog>` element). Backdrop click cancels from Step 1 / Step 2 / Failure; ignored during Submitting / Success.

**FA-2. Type-match is case-sensitive, exact "DELETE".** No `trim()`, no case-fold, no unicode normalization. Submit button disabled until `input.value === "DELETE"`. Input is controlled (`useState`).

**FA-3. Real-auth flow** (`VITE_WEB_AUTH_MODE !== "mock-authenticated"`):
1. Step 2 submit → reducer: `step2 → submitting`.
2. Call `deleteAccount(supabaseClient, { onProgress })` — wraps `client.functions.invoke("account-delete")`.
3. On success (or `kind: "already_deleted"`): proceed.
4. `client.auth.signOut()` — sign-out failure is logged but does NOT abort (account is already gone).
5. Iterate `Object.keys(PREF_REGISTRY)` → `removePref(key)` per key (sequential).
6. Iterate `ACCOUNT_LOCAL_WIPE_IDB_NAMES` → `indexedDB.deleteDatabase(name)` per name (parallel via `Promise.allSettled`).
7. `window.location.assign("/")`.

**FA-4. Real-auth failure** (any throw from `deleteAccount`): reducer transitions `submitting → failure`. Error banner shows bilingual text mapped by `AccountDeleteError.kind`. localStorage and IndexedDB untouched. Retry button re-enables submit (transitions `failure → step2`).

**FA-5. Mock-auth flow** (`VITE_WEB_AUTH_MODE === "mock-authenticated"`):
1. Step 2 submit → reducer: `step2 → submitting`.
2. SKIP steps 2-4 of FA-3 (no backend call, no signOut).
3. Run steps 5-7 of FA-3 (localStorage wipe + IDB wipe + redirect).
4. The non-dismissible mock-auth banner is shown on Step 2 (FA-13).

**FA-6. Local-clear uses registered key list.** Source of truth: `Object.keys(PREF_REGISTRY)` from `@repo/plugin-web-storage`. Current count at row-#9-time: 42 keys (20 SHIPPED + 22 row-#24 expansions + 3 row-#7 OAuth prefs + 2 row-#8 Premium prefs). NEVER `localStorage.clear()`. NEVER prefix-match wildcard. Iteration via `for (const key of Object.keys(PREF_REGISTRY)) { removePref(key as WebPrefKey); }`. Tests: DEL-WIPE-1 + DEL-WILDCARD-GUARD (source-text guard).

**FA-7. IDB clear uses fixed-list constant.** `ACCOUNT_LOCAL_WIPE_IDB_NAMES` exported from `@repo/web-auth-device-session/web`. Initial value: `["web-encrypted-cache", "xai-web-ai-secrets", "xai-web-auth"]` (verified at planning time via repo grep). NOT `indexedDB.databases()` (Safari + older browsers don't implement consistently). New databases require manual extension of this constant — JSDoc on the constant states this. Tests: DEL-IDB-LIST-1 + DEL-WIPE-2.

**FA-8. Redirect via `window.location.assign("/")`.** Full-page same-tab navigation forces a clean React tree on next session. NO `useNavigate()` — we want the global state reset that comes from a page reload.

**FA-9. Deprecated event preserved one release.** `web:settings:rest:account-delete-confirmed` still emitted on Step 1 → Continue (NOT on actual deletion). JSDoc on the EventMap entry in `packages/core/src/types/events.ts` annotated `@deprecated since 2026-05-26 (gap-closure row #9); will be removed in P1 desktop pivot.` Payload schema unchanged: `{ confirmedAt: string }`. Semantically the timing changed (Continue click, not Delete click) — JSDoc clarifies.

**FA-10. NEW function `deleteAccount(client, options?)`** added to `packages/web-auth-device-session/src/auth-actions.ts`:
```typescript
export interface DeleteAccountOptions {
  readonly onProgress?: (phase: "invoking" | "signing-out") => void;
}

export type AccountDeleteErrorKind =
  | "network"
  | "unauthorized"
  | "forbidden"
  | "server"
  | "already_deleted"
  | "unknown";

export class AccountDeleteError extends Error {
  readonly kind: AccountDeleteErrorKind;
  readonly cause?: unknown;
  constructor(kind: AccountDeleteErrorKind, message: string, cause?: unknown);
}

export async function deleteAccount(
  client: SupabaseClient,
  options?: DeleteAccountOptions
): Promise<void>;
```
Implementation: `client.functions.invoke("account-delete")` → map response/error to `AccountDeleteErrorKind` discriminator → on success or `already_deleted`, call `client.auth.signOut()` (best-effort, non-throwing). Tests: DAA-1..8 in `packages/web-auth-device-session/src/auth-actions.test.ts`.

**FA-11. NEW const `ACCOUNT_LOCAL_WIPE_IDB_NAMES`** exported from `packages/web-auth-device-session/src/index.ts`:
```typescript
/**
 * Known IndexedDB database names used by the web client.
 *
 * MUST be extended whenever a new package introduces a new IDB database.
 * Used by the account-delete flow to clear durable encrypted local data
 * after a successful backend deletion.
 *
 * NOT derived from `indexedDB.databases()` because Safari + older browsers
 * do not implement that API consistently.
 *
 * @since 2026-05-26 (gap-closure row #9)
 */
export const ACCOUNT_LOCAL_WIPE_IDB_NAMES: readonly string[] = Object.freeze([
  "web-encrypted-cache",
  "xai-web-ai-secrets",
  "xai-web-auth",
]);
```

**FA-12. NEW hook `useAccountDeleteOrchestrator()`** internal to `plugin-web-settings-rest` (NOT exported from barrel — used only by `DeleteAccountConfirmModal.tsx`):
```typescript
export interface UseAccountDeleteOrchestratorResult {
  readonly state: "idle" | "submitting" | "wiping" | "success" | "failure";
  readonly error: AccountDeleteError | null;
  readonly submit: () => Promise<void>;
  readonly reset: () => void;
}

export function useAccountDeleteOrchestrator(): UseAccountDeleteOrchestratorResult;
```
Reads `VITE_WEB_AUTH_MODE` at hook init. Detects whether to call `deleteAccount()` (live) or skip (mock-auth). Orchestrates FA-3 (live) or FA-5 (mock) sequence. Tests: DEL-ORCH-1..4 + DEL-WIPE-1..2.

**FA-13. Mock-auth banner placement (D1).** Top of Step 2 panel only, persistent on Step 2 + Submitting + Failure states. Non-dismissible (no close button). Amber OKLCH `oklch(78% 0.14 80)` background / `oklch(25% 0.04 80)` text (consistent with row #8 disclosure banner palette, lower saturation than row #7 stub banner). Bilingual text:
- EN: "Mock-auth delete (no real backend) — this will only clear local data."
- ZH: "演示模式删除（无真实后端） — 仅清除本地数据。"

Tests: DEL-MOCK-BANNER-1 (EN), DEL-MOCK-BANNER-2 (ZH), DEL-MOCK-BANNER-3 (non-dismissible). Mirror of row #7 SB1/SB2 + row #8 PB-BANNER-1..3 banner pattern.

**FA-14. NO new CSP amendment.** `connect-src` already covers `VITE_SUPABASE_URL` (covered by SHIPPED `web-auth-device-session` runtime). `_headers` UNCHANGED. ADR-0008 UNCHANGED. No `csp.test.ts` edit. First wave-2 gap-closure row without an ADR amendment.

**FA-15. Append-only doc discipline.** This `design.md` gains ONE new section (this one). `api.md` gains ONE new §8 section. `test.md` gains ONE new §7 section. `dev_log.md` gains ONE new "## Bugfix-Extension Lineage — gap-closure row #9 (2026-05-26)" block. 3 prior blocks (SHIPPED row #24 Workflow State Panel + 2026-05-25 row #7 lineage + 2026-05-26 row #8 lineage) preserved verbatim. The companion `packages/web-auth-device-session/docs/{design.md, api.md, dev_log.md}` also gain APPEND-ONLY extension sections (the SHIPPED platform spine is extended, not modified).

### Component graph (extension)

```
@repo/plugin-web-settings-rest (extended)
├── src/internal/DeleteAccountConfirmModal.tsx    — REWRITE: single-step → 2-step step machine + type-match input + bilingual error banner
├── src/internal/useAccountDeleteOrchestrator.ts  — NEW: orchestration hook (live + mock-auth paths)
├── src/internal/localI18n.ts                     — EDIT: +17 bilingual entries (deleteModal.step1_*, step2_*, type_prompt, input_placeholder, confirm_disabled_tooltip, delete_now, submitting, error_*, retry, mock_banner)
├── src/styles.css                                — EDIT: +modal step CSS + .dam-input + .dam-mock-banner + .dam-error + .dam-actions-row (all OKLCH, no hex)
├── src/panes/accountPane.tsx                     — EDIT: Step 1 Continue emits deprecated event (one release)
└── src/__tests__/
    ├── DeleteAccountConfirmModal.test.tsx        — REWRITE: DEL-STEP-1..3 + DEL-TYPEMATCH-1..6 + DEL-CANCEL-1..2 + DEL-BILINGUAL-1..2 + DEL-WIRE-1..3 + DEL-MOCK-BANNER-1..3
    ├── useAccountDeleteOrchestrator.test.tsx     — NEW: DEL-ORCH-1..4 + DEL-WIPE-1..2 + DEL-IDEM-1 + DEL-IDB-LIST-1
    ├── no-localstorage-clear.test.ts             — NEW: source-text guard DEL-WILDCARD-GUARD (zero `localStorage.clear()` substrings in src)
    └── accountPane.test.tsx                      — EDIT: AC1..AC4 + AC8 preserved; AC5/6/7 adjusted for new Step 1 / Step 2 semantics; +DEL-EVENT-DEP-1

@repo/web-auth-device-session (extended — SHIPPED platform spine, scope extension)
├── src/auth-actions.ts                           — EDIT: + deleteAccount(client, options?) + AccountDeleteError + AccountDeleteErrorKind
├── src/storage.ts OR src/wipe.ts (NEW)           — +wipeRegisteredIDB() helper (iterates ACCOUNT_LOCAL_WIPE_IDB_NAMES + calls indexedDB.deleteDatabase)
├── src/index.ts                                  — EDIT: + export deleteAccount, AccountDeleteError, type AccountDeleteErrorKind, ACCOUNT_LOCAL_WIPE_IDB_NAMES, wipeRegisteredIDB
├── src/auth-actions.test.ts                      — EDIT: + DAA-1..8
└── docs/{design.md, api.md, dev_log.md}          — APPEND-ONLY extension sections (small, ~50 lines each)

@repo/core
└── src/types/events.ts                           — EDIT: JSDoc @deprecated annotation on web:settings:rest:account-delete-confirmed

apps/web
└── deploy/README.md                              — EDIT: +§"Account-Delete Edge Function" + §"Account-Delete Rollback"

docs
└── PLUGIN_MAP.md                                 — EDIT: extension notes on plugin-web-settings-rest + web-auth-device-session rows
```

### State machine (modal)

```
                                    ┌─ Cancel / backdrop ─┐
                                    │                      ▼
[Closed] ─ click "Delete Account" ─► [Step1] ──── Continue ──► [Step2] ─ Cancel ─► [Closed]
                                                                  │
                                                                  │ submit (input === "DELETE")
                                                                  ▼
                                                          [Submitting]
                                                                  │
                                            ┌── live: deleteAccount() ──┐
                                            │                            │
                                          200 / 404                  net / 401 / 403 / 500
                                            │                            │
                                            ▼                            ▼
                                          [Wiping]                  [Failure]
                                            │                            │
                                            ▼                            ├─ Retry → [Step2]
                                  signOut → registry wipe →              │
                                  IDB wipe → assign("/")                 └─ Cancel → [Closed]
                                            │
                                            ▼
                                       [Success]
                                  (transient; redirect kills the React tree)

Mock-auth bypass: [Step2] ─ submit ─► [Submitting] ──skip backend──► [Wiping] (same as above from Wiping onward)
```

### Dependencies (extension)

| Dep | Kind | Why |
|---|---|---|
| `@repo/plugin-web-storage` | existing peer | `Object.keys(PREF_REGISTRY)` + `removePref` for registered-key wipe |
| `@repo/plugin-web-tokens` | existing peer | `useI18n(lang)` for global keys + `Lang` type |
| `@repo/xai-web-event-bus` | existing peer | `emitWebEvent("web:settings:rest:account-delete-confirmed", ...)` (deprecated emit on Step 1 Continue) |
| `@repo/web-auth-device-session` | **NEW peer** | `deleteAccount()`, `AccountDeleteError`, `ACCOUNT_LOCAL_WIPE_IDB_NAMES`, `wipeRegisteredIDB()` — declared in package.json peerDependencies |
| `@repo/core` | indirect via tokens | type-only (EventMap @deprecated JSDoc) |
| `@supabase/supabase-js` | platform (transitive via web-auth-device-session) | `client.functions.invoke()` + `client.auth.signOut()` |

**No new NPM dependency.** No new ADR amendment. No `_headers` edit.

### Bilingual i18n delta (preview — full table in `api.md` §8.4)

17 new bilingual keys under `deleteModal.*` namespace. Existing `deleteModal.title / .body / .cancel / .confirm` (row #24) are PRESERVED VERBATIM for backwards compat (used as Step 1 fallback). New keys:

```
deleteModal.step1_title:           EN "Delete your account?" / ZH "确定要删除账号吗？"
deleteModal.step1_body:            EN "This will permanently remove your account, including all synced data and local caches." / ZH "此操作将永久删除您的账号，包括所有已同步数据与本地缓存。"
deleteModal.continue:              EN "Continue" / ZH "继续"
deleteModal.step2_title:           EN "Type DELETE to confirm" / ZH "请输入 DELETE 以确认"
deleteModal.step2_body:            EN "Once you type DELETE and submit, this cannot be undone." / ZH "输入 DELETE 并提交后，此操作不可撤销。"
deleteModal.type_prompt:           EN "Type DELETE (capital letters) to enable the destructive button." / ZH "请输入大写 DELETE 以启用删除按钮。"
deleteModal.input_placeholder:     EN "DELETE" / ZH "DELETE"
deleteModal.confirm_disabled_tooltip: EN "Type DELETE (exact case) above to enable this button." / ZH "请在上方输入精确大写 DELETE 以启用此按钮。"
deleteModal.delete_now:            EN "Delete Account" / ZH "删除账号"
deleteModal.submitting:            EN "Deleting account and clearing local data…" / ZH "正在删除账号并清除本地数据…"
deleteModal.error_network:         EN "Network error — please check your connection and try again." / ZH "网络错误 — 请检查网络连接后重试。"
deleteModal.error_unauthorized:    EN "Session expired — please sign in again before deleting." / ZH "会话已过期 — 请重新登录后再尝试删除。"
deleteModal.error_forbidden:       EN "Account deletion is not permitted for this account." / ZH "此账号无权执行删除操作。"
deleteModal.error_server:          EN "Server error — please try again in a moment." / ZH "服务器错误 — 请稍后重试。"
deleteModal.error_unknown:         EN "Something went wrong — please try again." / ZH "出现未知错误 — 请重试。"
deleteModal.retry:                 EN "Retry" / ZH "重试"
deleteModal.mock_banner:           EN "Mock-auth delete (no real backend) — this will only clear local data." / ZH "演示模式删除（无真实后端） — 仅清除本地数据。"
```

### Risks recap (one-liner; full table in discovery §6)

R1 partial local-clear → sequence localStorage before IDB + best-effort + redirect. R2 tab-close mid-flow → next session fails auth → local stale-but-inert. R3 retry-404 idempotency → map to `already_deleted` kind, proceed to wipe. R4 wildcard wipe accident → DEL-WILDCARD-GUARD source-text test. R5 new IDB not in const → JSDoc + runbook. R6 mock banner missed → non-dismissible + amber OKLCH + DEL-MOCK-BANNER-1..3. R7 unicode lookalikes → exact `===` match. R8 Edge Function not provisioned → runbook + deploy gate. R9 signOut failure → log-only, account is gone. R10 deprecated event confusion → JSDoc @deprecated. R11 unused-var lint nits → preempt with explicit lint-clean impl.



## REL-03 account-local Settings contract (2026-09-09)

- More reset captures the rendered scope and uses the storage public API. It resets only the existing More-owned options: explicitly selected device options retain their original reset semantics; private list/tag defaults target the current account. Stale handlers cannot reset a newly selected account. Other panes, accounts and unowned legacy values remain unchanged.
- Account adds current-generation local JSON export and an entry to AccountDataGate import/rollback. Export excludes authentication, BYOK ciphertext/plaintext, other accounts, device preferences and unowned archives. Download feedback says request initiated and explicitly does not claim a cloud backup.
- Integration OAuth pending state is bound to initiating account/demo kind and generation. In-document epoch handles are revoked on transitions, clearing the pending attempt. On a full OAuth navigation, serialized owner/generation and TTL are checked against resolved authentication; process-local epoch numbers are not assumed stable across reloads. Delayed authorization URL creation cannot navigate after its captured account changes. Legacy attempts without owner metadata are rejected.
- Server account deletion binds the request to the captured access token with implicit SDK sign-out disabled. Only after server success does it begin captured-owner local cleanup. Later completion under B cannot clear B authentication or navigate B away. Registered origin-wide database erasure is no longer used.
- A durable JSON tombstone (`accountPrefix + deleted`) stores only version/accountId/kind/generation/phase/updatedAt before any local deletion. Storage erasure preserves it, all non-null tombstones revoke old readers/writers, and the phase becomes complete only after scoped LS and AI-secret cleanup both finish. No token, key or business content is included. Failure keeps the receipt retryable.
- `AccountDeletionRecoveryNotice({ lang?: 'en' | 'zh' })` is public and can mount outside authenticated routes. It enumerates valid pending tombstones and shows generic copy without account identities/content. Its keyboard-accessible retry only finishes already-authorized local cleanup; it makes no server request, changes no authentication and leaves B/device/unowned data intact. Parent AppProviders mounts this notice globally; host integration is independently verified by the parent.
- `readAccountDeletionReceipt(accountId, demo?)` and `resumeAccountLocalDeletion(receipt)` are public browser-only recovery APIs. A malformed/mismatched receipt cannot authorize cleanup. Completed receipts remain metadata for recovery/audit; this module does not claim cloud synchronization or complete deletion of every future registered backend.

Scope limit: this closes REL-03 compatibility for Settings and the implemented local LS/BYOK stores. Full REL-04/REL-06 deletion inventory, future encrypted-cache namespaces, remote revocation and hosted account-deletion acceptance are not marked complete here. Tests use synthetic accounts and mock the server/AI deletion seam; no real account was deleted.


## REL-04 export scope and device recovery

Account records remain the primary download. Device-wide export is a separate collapsed details section with two explicitly unchecked history choices. Bilingual scope text explains shared layout settings, possible other-owner history, and the lack of direct file restore. Controls retain native keyboard behavior, 44px targets and wrapping. A captured scope prevents stale account panes from issuing downloads after identity changes.


## REL-06 durable pre-request intent

The global recovery notice distinguishes confirmed local cleanup from an unconfirmed server request. An unknown request has no local-cleanup button, never replays the server request, and never changes the active account. This preserves uncertainty after reload without claiming a backend reconciliation capability. The operation ID is local bookkeeping; no unsupported server idempotency contract is claimed.
