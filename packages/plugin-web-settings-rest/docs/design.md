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


