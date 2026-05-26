# API — plugin-web-settings-rest

> **Package**: `@repo/plugin-web-settings-rest`
> **Public surface**: `src/index.ts`

---

## §0 Public Exports

```typescript
// 11 individual Pane objects
export { accountPane }      from "./panes/accountPane.js";
export { premiumPane }      from "./panes/premiumPane.js";
export { smartListsPane }   from "./panes/smartListsPane.js";
export { notificationsPane }from "./panes/notificationsPane.js";
export { dateTimePane }     from "./panes/dateTimePane.js";
export { morePane }         from "./panes/morePane.js";
export { integrationsPane } from "./panes/integrationsPane.js";
export { collaboratePane }  from "./panes/collaboratePane.js";
export { stickyPane }       from "./panes/stickyPane.js";
export { hotkeysPane }      from "./panes/hotkeysPane.js";
export { aboutPane }        from "./panes/aboutPane.js";

// Aggregate map keyed by pane id
export { restPanesById } from "./internal/restPanesById.js";

// Composition helper
export { applyRestPanesToRegistry } from "./internal/applyRestPanesToRegistry.js";

// Type re-exports
export type { StickyColorId, StickyFontSize, StickyGridSpacing } from "./types.js";
```

## §1 Pane Contract

Each `Pane` object satisfies the chassis `Pane` interface from
`@repo/plugin-web-settings-shell`:

```typescript
interface Pane {
  id: SettingsPaneId;      // one of 13 closed union members
  icon: string;            // WebShellIconName
  i18nKey: string;         // e.g. "settings.account"
  render: (props: PaneRenderProps) => React.ReactElement;
}

interface PaneRenderProps {
  lang: Lang;              // "en" | "zh"
}
```

## §2 DeleteAccountConfirmModal (internal)

```typescript
interface DeleteAccountConfirmModalProps {
  open: boolean;
  lang: Lang;
  onCancel: () => void;
  onConfirm: () => void;
}
```

Uses native `<dialog>` with `showModal()` / `close()`. jsdom-safe: both calls
are guarded by `typeof dialog.showModal === "function"`.

Confirming emits `web:settings:rest:account-delete-confirmed` via `emitWebEvent`.
Canceling closes without emit. Clicking the backdrop cancels.

## §3 restPanesById

```typescript
const restPanesById: Readonly<Record<SettingsPaneId, Pane>>
```

Map of the 11 owned pane ids to their Pane objects. Keys: account, premium,
smart_lists, notifications, date_time, more, integrations, collaborate, sticky,
hotkeys, about.

## §4 applyRestPanesToRegistry

```typescript
function applyRestPanesToRegistry(
  registry: readonly Pane[]
): readonly Pane[]
```

Substitutes the 11 owned panes into a copy of `registry`, preserving order.
Idempotent — calling twice produces equivalent output. Does not mutate input.
Panes not in the owned set (e.g. appearance, features) are passed through
unchanged.

## §4.1–§4.11 Per-pane Controls

### §4.1 accountPane — id: "account"

Static avatar (SVG OKLCH fills), mock name/email, Upgrade/SignOut/Delete buttons.
Delete opens `DeleteAccountConfirmModal`. Confirm emits
`web:settings:rest:account-delete-confirmed`.

### §4.2 premiumPane — id: "premium"

Static render. Bilingual headline/body. Upgrade CTA is a no-op button.

### §4.3 smartListsPane — id: "smart_lists"

3 sections (Default lists / Organize / Others), 12 total items.
Each row has a `<select>` with 3 options: show / if-not-empty / hide.
Persists to `xai_pref_smart_lists` (JSON codec, object keyed by SmartListId).

### §4.4 notificationsPane — id: "notifications"

8 controls:
- `xai_pref_notif_enabled` — master toggle
- `xai_pref_notif_done_sound` — select (none/subtle/chime/bell/pop)
- `xai_pref_notif_push_task` / `_push_pomo` / `_push_habit` — toggles
- `xai_pref_notif_quiet` — quiet hours master toggle
- `xai_pref_notif_quiet_start` / `_quiet_end` — time inputs (visible only when quiet=true)

### §4.5 dateTimePane — id: "date_time"

5 controls:
- `xai_pref_dt_start_week` — select (monday/sunday/saturday)
- `xai_pref_dt_lunar` / `_week_numbers` / `_holidays` / `_timezone` — toggles

### §4.6 morePane — id: "more"

14 controls. Per-pane "Reset Default" link (`data-testid="more-reset-default"`)
calls `removePref` for each of the 14 owned keys + synthetic StorageEvent.
Language select is read-only (value: "follow").
"Remove text in tasks" checkbox placed in `<SettingRow>` children slot
(chassis label: string constraint — see design.md §6.1).

### §4.7 integrationsPane — id: "integrations"

17 placeholder cards in 3 groups: Featured (3), Calendar (10), Integrate (4).
All colors use OKLCH (no hex literals). Click is a no-op.

### §4.8 collaboratePane — id: "collaborate"

3 live-persist controls:
- `xai_pref_collab_show_avatars` (toggle, default: true)
- `xai_pref_collab_default_share` (select: comment/edit/view, default: "comment")
- `xai_pref_collab_mention_notify` (toggle, default: true)

No SettingsFooter (source uses live onChange).

### §4.9 stickyPane — id: "sticky"

StickyColorPalette (13 swatches) + font size select (4 options) +
pin-default toggle + restore-size toggle + 4 spacing buttons.
Keys: `xai_pref_sticky_color`, `_font`, `_pin_default`, `_restore_size`, `_grid_spacing`.

### §4.10 hotkeysPane — id: "hotkeys"

10-row read-only table (`HOTKEYS_TABLE` const). No edit affordance.

### §4.11 aboutPane — id: "about"

Hard-coded `APP_VERSION = "v 1.2.0"`, `BUILD_DATE = "2026.05.23"`.
4 link buttons (no-op). Bilingual description.

## §5 Error Semantics

- No thrown errors from pane render functions.
- `usePref` returns the registry default if localStorage is unavailable (SSR-safe).
- `dialog.showModal()` and `dialog.close()` are guarded by typeof checks.

---

## §6 Extension: Integrations OAuth Stub (gap-closure row #7)

> APPEND-ONLY extension. §0..§5 above describe the SHIPPED row #24 surface and
> are NOT mutated. This section adds the public surface added by the
> 2026-05-25 Integrations OAuth stub for 3 providers (Notion / Google Calendar /
> Linear). Design home: `design.md` §"2026-05-25 Extension".

### §6.1 New public exports

```typescript
// New page-level export (router target).
export { CallbackPage } from "./CallbackPage.js";

// New type export — id union for the 3 wired providers.
export type IntegrationProviderId = "notion" | "gcal" | "linear";
```

`CallbackPage` is the React component bound to the new react-router route
`/app/settings/integrations/callback`. It has no props (reads URL via
`useSearchParams()`).

### §6.2 IntegrationProvider config shape (internal — not re-exported)

```typescript
// File: src/internal/integrationProviders.ts
export interface IntegrationProvider {
  readonly id: IntegrationProviderId;
  readonly nameKey: string;        // localI18n key, e.g. "provider.notion"
  readonly authorizeUrl: string;   // base authorize endpoint (no query)
  readonly tokenUrl: string;       // token endpoint (allowlisted in CSP)
  readonly scopes: readonly string[]; // provider-specific scope list
  readonly prefKey:                // typed reference to the registered pref
    | "xai_pref_integrations_connected_notion"
    | "xai_pref_integrations_connected_gcal"
    | "xai_pref_integrations_connected_linear";
  readonly clientId: string;       // placeholder in stub (empty string OK)
  readonly cardColor: string;      // OKLCH; matches the existing card color for consistency
  readonly cardShort: string;      // 1-char monogram, matches existing card spec
}

export const PROVIDERS: readonly IntegrationProvider[];
```

### §6.3 PKCE helpers (internal)

```typescript
// File: src/internal/pkce.ts

/**
 * Generate a PKCE code_verifier per RFC 7636 §4.1.
 * Returns base64url(32 bytes from crypto.getRandomValues) — 43 chars, no padding.
 * NEVER uses Math.random (source-text guard enforces this).
 */
export function generateCodeVerifier(): string;

/**
 * Compute code_challenge = base64url(SHA-256(code_verifier)) per RFC 7636 §4.2.
 * Uses crypto.subtle.digest("SHA-256", ...).
 */
export function computeCodeChallenge(codeVerifier: string): Promise<string>;

/**
 * base64url encode a Uint8Array (URL-safe charset, no padding).
 */
export function base64UrlEncode(bytes: Uint8Array): string;
```

### §6.4 OAuth state helpers (internal)

```typescript
// File: src/internal/oauthState.ts

export interface PendingOAuthState {
  readonly state: string;          // "<providerId>." + base64url(random32)
  readonly codeVerifier: string;   // result of generateCodeVerifier()
  readonly expiresAt: number;      // ms epoch; now + TTL_MS (10 min)
}

/**
 * Generate a fresh PendingOAuthState for the given provider.
 * Persists to sessionStorage under key `xai_oauth_pending_<providerId>`.
 * Returns the new state for use in the authorize URL.
 */
export function startOAuth(providerId: IntegrationProviderId): Promise<PendingOAuthState>;

/**
 * Validate a state value received from the callback URL.
 * Returns the original PendingOAuthState if valid, else null.
 *
 * Validation steps (all must pass):
 *   1. state has the form "<providerId>.<base64url>"
 *   2. providerId is a known id
 *   3. sessionStorage key `xai_oauth_pending_<providerId>` exists and parses
 *   4. parsed.state === stateFromUrl (strict ===)
 *   5. parsed.expiresAt > Date.now() (TTL not expired)
 *
 * On any failure: returns null. Caller is responsible for UX feedback.
 * Side-effect: clears the sessionStorage entry on both success and failure
 * (defense in depth — one-shot use).
 */
export function validateAndConsumeState(stateFromUrl: string): PendingOAuthState | null;

/** TTL constant — exported for tests. */
export const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;
```

### §6.5 Authorize URL builder (internal)

```typescript
// File: src/internal/buildAuthorizeUrl.ts

/**
 * Build the full authorize URL for the given provider.
 * Returns a string ready to pass to window.location.assign(...).
 *
 * Query params added:
 *   - client_id        (from provider.clientId)
 *   - redirect_uri     (computed from window.location.origin + "/app/settings/integrations/callback")
 *   - response_type    = "code"
 *   - scope            (space-separated from provider.scopes)
 *   - state            (from pendingState.state)
 *   - code_challenge   (from PKCE)
 *   - code_challenge_method = "S256"
 *
 * Notes:
 *   - Output URL MUST start with https:// (assertion in pure builder).
 *   - No path-traversal: encodeURIComponent applied to each query value.
 *   - For Google: scope literal is "https://www.googleapis.com/auth/calendar.readonly"
 *     (single full-URL scope; space-separator unused for one scope).
 */
export async function buildAuthorizeUrl(
  provider: IntegrationProvider,
  pendingState: PendingOAuthState,
): Promise<string>;
```

### §6.6 New i18n keys (internal `localI18n.ts`)

24 new bilingual entries. Examples (full set added in P4):

| Key | EN | ZH |
|---|---|---|
| `int.banner.stub` | Integrations are in v1 stub mode — authorization flows are wired but no data sync occurs yet. | 集成处于 v1 演示模式 — 已接入授权流程，但暂不进行真实数据同步。 |
| `int.badge.connected_stub` | Connected (stub) | 已连接（演示） |
| `int.btn.connect` | Connect | 连接 |
| `int.btn.disconnect` | Disconnect | 断开连接 |
| `int.section.connected` | Connected providers | 已连接提供商 |
| `int.disconnect.tooltip` | Disconnect clears local state only. To revoke access, visit the provider's account settings. | 断开仅清除本地状态。如需撤销授权，请前往提供商账号设置。 |
| `oauth.cb.success` | Authorization received (stub) | 已接收授权（演示） |
| `oauth.cb.invalid` | Invalid authorization state — please try again | 授权状态无效 — 请重新尝试 |
| `oauth.cb.cancelled` | Authorization cancelled | 授权已取消 |
| `oauth.cb.redirect_notice` | Returning to settings… | 正在返回设置… |
| `provider.notion` | Notion | Notion |
| `provider.gcal` | Google Calendar | Google 日历 |
| `provider.linear` | Linear | Linear |

### §6.7 New storage prefs (registered in `packages/plugin-web-storage/src/internal/registry.ts`)

| Key | Codec | Default | Category | Owner | SchemaVersion |
|---|---|---|---|---|---|
| `xai_pref_integrations_connected_notion` | boolean | false | pref | xai-web-settings-rest | 1 |
| `xai_pref_integrations_connected_gcal` | boolean | false | pref | xai-web-settings-rest | 1 |
| `xai_pref_integrations_connected_linear` | boolean | false | pref | xai-web-settings-rest | 1 |

Added in a labeled block at the tail of `registry.ts` after the SHIPPED 37 row-#24 entries:

```typescript
// ---- Integrations OAuth stub (extension 2026-05-25 — gap-closure row #7) ----
// 3 boolean flags marking per-provider "connected (stub)" state.
// MUST NOT be interpreted as "real connection" by any other code path.
// Caught by chassis resetAllPrefs() via key.startsWith("xai_") filter.
```

Parity test `parity-design-md.test.ts` extended by 3 exempt keys.

### §6.8 New EventMap entries (declaration-only in `packages/core/src/types/events.ts`)

```typescript
"web:settings:integration-connected": {
  providerId: "notion" | "gcal" | "linear";
  mode: "stub";
  connectedAt: string; // ISO 8601
};

"web:settings:integration-disconnected": {
  providerId: "notion" | "gcal" | "linear";
  disconnectedAt: string; // ISO 8601
};
```

No consumer in this row (declaration-only). Mirrors row #5 / row #6 precedents. Forward-compat hook for P1 sync rows.

### §6.9 Callback route declaration (host edit)

`apps/web/src/routes/router.tsx` — adds ONE new child under `path: "app"`:

```typescript
{
  path: "settings/integrations/callback",
  element: <CallbackPage />,
  errorElement: <RouteErrorBoundary scope="oauth-callback" />,
},
```

Placement: sibling of the existing `path: ":moduleId/*"` route. Order matters — the literal path must come BEFORE the param-matched `:moduleId/*` to win the match. The host owns this declaration (cross-package routing is host concern). Plugin owns the page component.

### §6.10 Error semantics (extension)

- `CallbackPage` does NOT throw on invalid/missing state; it renders an error banner + auto-navigates.
- `validateAndConsumeState` returns `null` on any failure; it never throws.
- `generateCodeVerifier` / `computeCodeChallenge` throw `Error("crypto.subtle unavailable")` if running in an environment without Web Crypto (will not happen in supported browsers; test for completeness).
- `buildAuthorizeUrl` throws `Error("authorize URL must be https")` if the provider config has an http authorize URL (defense — config is a `const` so this is a build-time guarantee, but the assertion is a defensive runtime check).
- `aiKeyStorage` is NOT used by this extension (intentionally — no real token storage).

### §6.11 CSP impact (companion: `apps/web/public/_headers`)

`connect-src` extended from current state (post row #2 + row #6 amendments) by 3 hostnames:

```
Before: connect-src 'self' https://api.anthropic.com https://tile.openstreetmap.org
After:  connect-src 'self' https://api.anthropic.com https://tile.openstreetmap.org https://api.notion.com https://oauth2.googleapis.com https://api.linear.app
```

`frame-src`: **NOT widened** (all 3 providers' authorize pages set `X-Frame-Options: DENY`). `frame-ancestors 'none'` and other directives unchanged.

ADR-0008 §S3 D3 amended in-place (third amendment) per binding precedent from row #2.

