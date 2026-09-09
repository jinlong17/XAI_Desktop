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

---

## §7 Extension: Premium Pane Stripe Checkout Stub (gap-closure row #8)

> APPEND-ONLY extension. §0..§6 above describe the SHIPPED row #24 surface +
> the 2026-05-25 row #7 Integrations OAuth stub and are NOT mutated.
> This section adds the public surface added by the 2026-05-26 Premium pane
> Stripe Checkout stub.
> Design home: `design.md` §"2026-05-26 Extension".

### §7.1 New public exports

```typescript
// Two new page-level exports (router targets).
export { CheckoutSuccessPage } from "./CheckoutSuccessPage.js";
export { CheckoutCancelPage } from "./CheckoutCancelPage.js";

// Topbar-integration component — consumed by @repo/xai-web-shell Topbar.
export { PremiumTierBadge } from "./internal/PremiumTierBadge.js";

// Type export — id union for the 3 tier states.
export type PremiumTier = "free" | "pending" | "premium_stub";
```

`CheckoutSuccessPage` and `CheckoutCancelPage` are React components bound to the two new react-router routes `/app/settings/premium/checkout/success` and `/app/settings/premium/checkout/cancel`. Both have no props (read URL via `useSearchParams()`; consume `useNavigate()`).

`PremiumTierBadge` has no props (reads `usePremiumTier()` internally + uses default `"en"` lang). Returns `null` when effective tier is not `"premium_stub"`.

### §7.2 PremiumTier type + constants (internal)

```typescript
// File: src/internal/premiumTier.ts
export type PremiumTier = "free" | "pending" | "premium_stub";

/** 30-day TTL for premium_stub tier — exported for tests. */
export const PREMIUM_TIER_TTL_MS = 30 * 24 * 60 * 60 * 1000;
```

### §7.3 usePremiumTier hook (internal)

```typescript
// File: src/internal/usePremiumTier.ts

export interface UsePremiumTierResult {
  /** Effective tier (after 30-day filter). */
  readonly effectiveTier: PremiumTier;
  /** Stored raw tier (before 30-day filter). */
  readonly storedTier: PremiumTier;
  /** Stored started_at (ms epoch); 0 if no upgrade yet. */
  readonly startedAt: number;
  /** Setter that writes both prefs atomically + emits web:premium:tier-changed. */
  readonly setTier: (next: PremiumTier) => void;
}

/**
 * Read-side hook returning the effective Premium tier.
 *
 * Effective tier =
 *   if storedTier === "premium_stub" && Date.now() >= startedAt + PREMIUM_TIER_TTL_MS:
 *     "free"   (30-day expiry)
 *   else:
 *     storedTier
 *
 * NEVER ticks a setInterval. NEVER fires a setTimeout. Pure call-site evaluation.
 * SSR-safe: returns "free" + 0 if localStorage is unavailable.
 *
 * setTier() writes both prefs and emits typed event "web:premium:tier-changed".
 * When `next === "premium_stub"`, also writes startedAt = Date.now().
 * When `next === "free"`, also writes startedAt = 0.
 */
export function usePremiumTier(): UsePremiumTierResult;
```

### §7.4 usePremiumConfig hook (internal)

```typescript
// File: src/internal/usePremiumConfig.ts

export interface UsePremiumConfigResult {
  /** The Payment Link URL from VITE_STRIPE_PAYMENT_LINK_URL; "" if missing. */
  readonly paymentLinkUrl: string;
  /** True iff paymentLinkUrl is non-empty AND starts with "https://". */
  readonly configured: boolean;
}

/**
 * Reads import.meta.env.VITE_STRIPE_PAYMENT_LINK_URL at hook call site.
 * Returns `configured: false` if the env var is missing or invalid (does not start with https://).
 * Callers (notably the Upgrade button) MUST disable themselves when `configured` is false.
 */
export function usePremiumConfig(): UsePremiumConfigResult;
```

### §7.5 PremiumTierBadge component (exported in barrel)

```typescript
// File: src/internal/PremiumTierBadge.tsx

/**
 * Renders a "Premium (stub)" badge for the Topbar.
 * Returns null if effective tier is not "premium_stub".
 *
 * Consumed by `packages/xai-web-shell/src/Topbar.tsx` (single import + JSX placement).
 *
 * Internally calls usePremiumTier() — no props.
 *
 * Output HTML when premium_stub:
 *   <span className="premium-tier-badge" data-testid="premium-tier-badge">
 *     Premium (stub)
 *   </span>
 *
 * CSS: oklch(80% 0.16 85) gold background, oklch(25% 0.04 85) text.
 * Defined in plugin-web-settings-rest src/styles.css.
 */
export function PremiumTierBadge(): React.ReactElement | null;
```

### §7.6 New i18n keys (internal `localI18n.ts`)

14 new bilingual entries. Full table:

| Key | EN | ZH |
|---|---|---|
| `premium.badge.tier_stub` | Premium (stub) | 高级版（演示） |
| `premium.disclosure.banner` | v1 Premium is a UX preview. Real subscription enforcement requires desktop client (P1). | v1 高级版仅为 UX 演示。真实订阅功能需在桌面端（P1）实现。 |
| `premium.btn.cancel_sub` | Cancel Subscription | 取消订阅 |
| `premium.btn.cancel_sub_tooltip` | Clearing the local subscription flag will not contact Stripe — manage payment at billing.stripe.com | 清除本地订阅标记不会通知 Stripe — 请前往 billing.stripe.com 管理付款 |
| `premium.upgrade_disabled_tooltip` | Payment Link not configured — see apps/web/deploy/README.md | Payment Link 未配置 — 请参考 apps/web/deploy/README.md |
| `premium.redirect_notice` | Redirecting to Stripe… | 正在跳转至 Stripe… |
| `premium.cb.success` | Subscription activated (stub) | 已激活订阅（演示） |
| `premium.cb.invalid` | Checkout completion could not be confirmed — tier unchanged | 无法确认结账完成 — 等级未变更 |
| `premium.cb.cancel` | Checkout cancelled — tier unchanged | 结账已取消 — 等级未变更 |
| `premium.cb.redirect_notice` | Returning to Premium settings… | 正在返回高级版设置… |
| `premium.tier.free` | Free | 免费版 |
| `premium.tier.premium_stub` | Premium (stub) | 高级版（演示） |
| `premium.tier.label` | Current tier: | 当前等级： |
| `premium.activated_on` | Activated on | 激活日期 |

(The existing `premium.headline_en` + `premium.body_en` from row #24 are preserved unchanged.)

### §7.7 New storage prefs (registered in `packages/plugin-web-storage/src/internal/registry.ts`)

| Key | Codec | Default | Category | Owner | SchemaVersion |
|---|---|---|---|---|---|
| `xai_pref_premium_tier` | string | `"free"` | pref | xai-web-settings-rest | 1 |
| `xai_pref_premium_started_at` | number | `0` | pref | xai-web-settings-rest | 1 |

Added in a labeled block at the tail of `registry.ts` after the row-#7 OAuth integration block:

```typescript
// ---- Premium tier stub (extension 2026-05-26 — gap-closure row #8) ----
// `tier` value union: "free" | "pending" | "premium_stub".
// `started_at` is ms epoch; 0 when tier is not "premium_stub".
// MUST NOT be interpreted as "real subscription is active" by any other code path.
// This is a UX-preview stub only; real subscription enforcement requires desktop
// client (P1). The 30-day timer is client-clock based (R4 in discovery review)
// and is documented in the disclosure banner.
// Caught by chassis resetAllPrefs() via key.startsWith("xai_") filter.
```

Parity test `parity-design-md.test.ts` extended by 2 exempt keys.

### §7.8 New EventMap entry (declaration-only in `packages/core/src/types/events.ts`)

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

No consumer in this row (declaration-only). Forward-compat hook for P1 feature-gating rows. Mirrors row #5 + row #6 + row #7 EventMap-extension precedents.

### §7.9 Callback route declarations (host edit)

`apps/web/src/routes/router.tsx` — adds TWO new children under `path: "app"`, BOTH BEFORE the existing `:moduleId/*` param-matched route AND siblings of the row #7 `settings/integrations/callback` child:

```typescript
{
  // Literal path MUST come before :moduleId/* to win the match.
  // gap-closure row #8 — Premium Stripe Checkout success callback
  path: "settings/premium/checkout/success",
  element: <CheckoutSuccessPage />,
  errorElement: <RouteErrorBoundary scope="premium-checkout" />,
},
{
  // gap-closure row #8 — Premium Stripe Checkout cancel callback
  path: "settings/premium/checkout/cancel",
  element: <CheckoutCancelPage />,
  errorElement: <RouteErrorBoundary scope="premium-checkout" />,
},
```

Placement: siblings of the existing `path: "settings/integrations/callback"` route. Order matters — both literal paths must come BEFORE the `:moduleId/*` param-matched route.

Both routes use the same `scope="premium-checkout"` — `RouteErrorBoundary` `scope` union must be extended in `apps/web/src/routes/RouteErrorBoundary.tsx` from `"root" | "auth" | "app" | "module" | "oauth-callback"` to `"root" | "auth" | "app" | "module" | "oauth-callback" | "premium-checkout"` (single-line additive type widening). Pure additive type extension — no behavior change. Same pattern used in row #7's B2 verify-cycle patch.

### §7.10 Topbar integration (cross-package edit, `@repo/xai-web-shell`)

`packages/xai-web-shell/src/Topbar.tsx` — adds 1 import + 1 JSX placement:

```typescript
// NEW import — gap-closure row #8
import { PremiumTierBadge } from "@repo/plugin-web-settings-rest";

// ... existing function body up to topbar-controls div ...

      <div className="topbar-controls">
        {/* NEW: gap-closure row #8 — gold badge when xai_pref_premium_tier === "premium_stub" */}
        <PremiumTierBadge />

        <div className="seg" role="tablist">
          {/* existing lang toggle */}
```

xai-web-shell's `package.json` gains a `peerDependencies` entry for `@repo/plugin-web-settings-rest`. Tests gain 1 case TB-PREMIUM-1.

### §7.11 Error semantics (extension)

- `CheckoutSuccessPage` does NOT throw on invalid/missing session_id; it renders the "invalid" banner + auto-navigates after 4000ms (same pattern as row #7 CallbackPage invalid path).
- `CheckoutCancelPage` does NOT throw under any input; it is idempotent (always shows "Checkout cancelled — tier unchanged" banner + auto-navigates after 3000ms).
- `usePremiumTier()` does NOT throw on missing localStorage; returns `{ effectiveTier: "free", storedTier: "free", startedAt: 0, setTier: noop }`.
- `usePremiumConfig()` does NOT throw on missing env var; returns `{ paymentLinkUrl: "", configured: false }`.
- `<PremiumTierBadge />` returns `null` when not `premium_stub` — no error path.
- No `fetch()` is called anywhere in the new exports. Confirmed by cross-vendor verify item §8 #5 (discovery review).

### §7.12 CSP impact (companion: `apps/web/public/_headers`)

`connect-src` extended from current state (post row #2 + row #6 + row #7 amendments) by 3 hostnames:

```
Before: connect-src 'self' https://api.anthropic.com https://tile.openstreetmap.org https://api.notion.com https://oauth2.googleapis.com https://api.linear.app
After:  connect-src 'self' https://api.anthropic.com https://tile.openstreetmap.org https://api.notion.com https://oauth2.googleapis.com https://api.linear.app https://js.stripe.com https://checkout.stripe.com https://buy.stripe.com
```

`script-src`: **NOT widened** (no Stripe.js loaded in v1). `frame-src`: **NOT widened** (no embedded Checkout in v1). `form-action` / `worker-src` / `img-src` / `font-src` / other directives: unchanged.

ADR-0008 §S3 D3 amended in-place (FOURTH amendment) per binding precedent from row #2 + row #6 + row #7.

### §7.13 Environment variable contract (`apps/web/deploy/README.md` — NEW doc)

| Variable | Required? | Format | Where set | Notes |
|---|---|---|---|---|
| `VITE_STRIPE_PAYMENT_LINK_URL` | Yes (else Upgrade button is disabled) | `https://buy.stripe.com/test_xxx` (dev) or `https://buy.stripe.com/yyy` (prod) | GitHub repo Secrets → Cloudflare Pages env vars (per-environment); local dev: `apps/web/.env.local` | Test mode Payment Link for preview deploys; Live mode for production. Payment Link must have its `after_completion.redirect.url` set in Stripe Dashboard to `<base-url>/app/settings/premium/checkout/success?session_id={CHECKOUT_SESSION_ID}`. |

NOT used / reserved for future:
- `VITE_STRIPE_PUBLISHABLE_KEY` — reserved for future Buy Button or Embedded Checkout path. NOT loaded in v1.
- `VITE_STRIPE_SECRET_KEY` — **MUST NEVER BE SET** as a `VITE_*` var (Vite inlines `VITE_*` into client bundles). Any future server-side key belongs in a Worker env binding, not a Vite env var.

Documented runbook entries in the new `apps/web/deploy/README.md` (P5):
- "Configure Payment Link" — create Payment Link in Stripe dashboard, set redirect URL, copy URL into env var.
- "Rotate Payment Link" — invalidate old URL in Stripe dashboard, issue new, update env var, re-deploy.
- "Switch dev → prod" — point Cloudflare Pages production env to live-mode URL; preview env stays on test-mode URL.

---

## §8 Extension: Account Delete Wire (gap-closure row #9)

> APPEND-ONLY extension. §0..§7 above describe the SHIPPED row #24 surface +
> the 2026-05-25 row #7 Integrations OAuth stub + the 2026-05-26 row #8 Premium
> Stripe Checkout stub and are NOT mutated. This section adds the public
> surface added by the 2026-05-26 row #9 account-delete wire.
> Design home: `design.md` §"2026-05-26 Extension: Account Delete Wire
> (gap-closure row #9)". Source brief:
> `docs/reviews/xai-web-settings-account-delete-wire/20260524-roadmap-seed.md`.
> Discovery: `docs/reviews/xai-web-settings-account-delete-wire/20260525-discovery-review.md`.

### §8.1 Public exports (this row)

**This row adds NO new exports from `@repo/plugin-web-settings-rest/index.ts`.** All new components and hooks are internal to the package:

- `src/internal/DeleteAccountConfirmModal.tsx` — rewritten in place (already internal; not exported via barrel)
- `src/internal/useAccountDeleteOrchestrator.ts` — new (internal; not exported)
- `src/internal/localI18n.ts` — extended (already internal)

The companion package `@repo/web-auth-device-session` (SHIPPED platform spine) GAINS these exports (declared in its own `src/index.ts`):

```typescript
// File: packages/web-auth-device-session/src/index.ts
export { deleteAccount, AccountDeleteError } from "./auth-actions.js";
export type { AccountDeleteErrorKind, DeleteAccountOptions } from "./auth-actions.js";
export { ACCOUNT_LOCAL_WIPE_IDB_NAMES, wipeRegisteredIDB } from "./wipe.js";
```

See `packages/web-auth-device-session/docs/api.md` extension for full contract.

### §8.2 DeleteAccountConfirmModal (internal, REWRITTEN)

```typescript
interface DeleteAccountConfirmModalProps {
  readonly open: boolean;
  readonly lang: Lang;
  readonly onCancel: () => void;
  /**
   * Called when the user clicks "Continue" on Step 1.
   * Emits the deprecated `web:settings:rest:account-delete-confirmed` event for
   * one release of backwards-compat (row #24 baseline emitter location moved
   * from Step-1-confirm to Step-1-continue; semantically the user expressed
   * intent to delete).
   *
   * Does NOT mean the account was deleted — that happens later in Step 2.
   *
   * @deprecated The event itself is deprecated; the callback is the new
   * interaction surface. Will be removed in P1 desktop pivot.
   */
  readonly onStep1Continue: () => void;
}
```

The previous `onConfirm` prop is REMOVED; orchestration now happens inside the modal via `useAccountDeleteOrchestrator()` (FA-12). The modal owns the full step machine + submit → orchestrator wiring; the parent (`accountPane.tsx`) only provides `open` / `onCancel` / `onStep1Continue` and the `lang` context.

Internal step machine (FA-1) — see `design.md` extension §"State machine (modal)" for diagram.

### §8.3 useAccountDeleteOrchestrator (internal)

```typescript
// File: src/internal/useAccountDeleteOrchestrator.ts

export interface UseAccountDeleteOrchestratorResult {
  /** Current orchestration state — drives the modal step machine. */
  readonly state: "idle" | "submitting" | "wiping" | "success" | "failure";
  /** Set when state === "failure"; null otherwise. */
  readonly error: AccountDeleteError | null;
  /** Start the deletion flow. Idempotent: subsequent calls while non-idle no-op. */
  readonly submit: () => Promise<void>;
  /** Reset orchestrator state back to "idle". Used by the Retry / Cancel handlers. */
  readonly reset: () => void;
}

/**
 * Orchestrates the account-delete flow:
 *
 *   Live auth mode (default — `VITE_WEB_AUTH_MODE` is "live" or unset):
 *     1. Call `deleteAccount(supabaseClient)` from @repo/web-auth-device-session.
 *     2. On success or `kind === "already_deleted"`, proceed.
 *     3. Iterate `Object.keys(PREF_REGISTRY)` → `removePref(key)` per key.
 *     4. Call `wipeRegisteredIDB()` → iterates `ACCOUNT_LOCAL_WIPE_IDB_NAMES` → `indexedDB.deleteDatabase(name)` per name.
 *     5. `window.location.assign("/")`.
 *
 *   Mock-auth mode (`VITE_WEB_AUTH_MODE === "mock-authenticated"`):
 *     1. Skip backend; go directly to step 3 of the live flow.
 *
 * NEVER calls `localStorage.clear()` (DEL-WILDCARD-GUARD source-text guard).
 * NEVER touches localStorage / IDB before backend confirms success in live mode.
 *
 * @since 2026-05-26 (gap-closure row #9)
 */
export function useAccountDeleteOrchestrator(): UseAccountDeleteOrchestratorResult;
```

Reads `VITE_WEB_AUTH_MODE` once at hook init (via `import.meta.env`). Acquires the Supabase client via `useWebAuthSession().client` (consuming `@repo/web-auth-device-session` context).

Test ids: `DEL-ORCH-1` (live happy path), `DEL-ORCH-2` (mock-auth happy path), `DEL-ORCH-3` (live failure — no wipe), `DEL-ORCH-4` (404 idempotency — wipe + redirect), `DEL-WIPE-1` (registry list iterated), `DEL-WIPE-2` (IDB list iterated), `DEL-IDEM-1` (retry-after-success), `DEL-IDB-LIST-1` (constant has expected entries).

### §8.4 New i18n keys (internal `localI18n.ts`)

17 new bilingual entries — see `design.md` extension §"Bilingual i18n delta" for the full table. The existing row-#24 keys `deleteModal.title / .body / .cancel / .confirm` are PRESERVED VERBATIM (no rename; Step 1 still uses `.title` and Step 1 / Step 2 still use `.cancel`). The new keys add Step 1 specifics + Step 2 specifics + 5 error-message variants + retry + mock-auth banner.

### §8.5 Deprecated EventMap entry (declaration-only annotation in `packages/core/src/types/events.ts`)

```typescript
/**
 * Emitted when the user clicks "Continue" on Step 1 of the Delete Account
 * confirm modal. Note: this does NOT mean the account was deleted — it means
 * the user expressed intent to delete and entered Step 2 (type-DELETE gate).
 *
 * @deprecated since 2026-05-26 (gap-closure row #9). The event is preserved
 * for one release of backwards-compat with row #24's emitter. Will be removed
 * in P1 desktop pivot. Consumers should migrate to direct observation of the
 * modal lifecycle (no public surface; this event has no production consumer).
 */
"web:settings:rest:account-delete-confirmed": {
  confirmedAt: string; // ISO 8601 timestamp
};
```

Payload schema UNCHANGED. Only the JSDoc + the emit-site changed (row #24 emitted on confirm; row #9 emits on Step 1 Continue).

### §8.6 Error semantics (extension)

- `DeleteAccountConfirmModal` does NOT throw under any input; failures route to `state: "failure"` + bilingual error banner.
- `useAccountDeleteOrchestrator.submit()` does NOT throw — errors are captured into reducer state.
- `deleteAccount()` (in `@repo/web-auth-device-session`) DOES throw — typed `AccountDeleteError` with `kind` discriminator. The orchestrator catches and maps to reducer state. See `packages/web-auth-device-session/docs/api.md` extension for `AccountDeleteError` contract.
- `signOut()` failure between backend success and local-clear is logged but NOT re-thrown (R9 — the account is already gone; sign-out failure is a non-blocking degradation).
- `wipeRegisteredIDB()` uses `Promise.allSettled` — individual `indexedDB.deleteDatabase` failures are logged but do not abort the wipe (R1 — best-effort local cleanup; the backend deletion is the source of truth).
- `window.location.assign("/")` is the final step; if it throws (browser API failure — never observed) the modal stays in `state: "wiping"`. The user can manually navigate.

### §8.7 CSP impact

**NONE.** `connect-src` already covers `VITE_SUPABASE_URL` via the SHIPPED `web-auth-device-session` package's existing usage. No `_headers` edit. No ADR-0008 amendment. No `csp.test.ts` edit. First wave-2 gap-closure row without CSP changes.

### §8.8 Companion package surface — `@repo/web-auth-device-session` (extension)

This row adds 4 new exports to the SHIPPED `web-auth-device-session/src/index.ts`. Full contract lives in `packages/web-auth-device-session/docs/api.md` extension (NEW append-only section). Summary:

```typescript
// File: packages/web-auth-device-session/src/auth-actions.ts (EDIT)

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

export interface DeleteAccountOptions {
  readonly onProgress?: (phase: "invoking" | "signing-out") => void;
}

/**
 * Invoke the Supabase Edge Function `account-delete` to delete the current
 * user's account, then sign out the local session.
 *
 * On success: returns void.
 * On Edge Function failure: throws `AccountDeleteError` with appropriate kind.
 * On signOut failure AFTER successful invoke: logged + downgraded (does NOT throw).
 *
 * @since 2026-05-26 (gap-closure row #9)
 */
export async function deleteAccount(
  client: SupabaseClient,
  options?: DeleteAccountOptions
): Promise<void>;

// File: packages/web-auth-device-session/src/wipe.ts (NEW)

export const ACCOUNT_LOCAL_WIPE_IDB_NAMES: readonly string[];

export async function wipeRegisteredIDB(): Promise<{
  readonly attempted: readonly string[];
  readonly succeeded: readonly string[];
  readonly failed: readonly { name: string; cause: unknown }[];
}>;
```

The Edge Function `account-delete` itself is NOT provisioned by this row — it is an operational prerequisite documented in `apps/web/deploy/README.md` §"Account-Delete Edge Function". Development and CI tests mock `client.functions.invoke()` to simulate the Edge Function response.

### §8.9 Operator runbook (`apps/web/deploy/README.md` — extension)

P4 of the phase plan adds two new sections to `apps/web/deploy/README.md`:

**§"Account-Delete Edge Function"** documents:
- Edge Function name: `account-delete`.
- Required request: empty body; authorization via the caller's Supabase session token (RLS applied).
- Required response: 200 (deleted) / 401 (session expired) / 403 (permission denied) / 404 (already deleted, idempotent) / 500 (server error).
- Service-role configuration: function uses service-role internally to call `auth.admin.deleteUser(userId)` where `userId` is derived from the caller's session.
- Deploy gate: the function MUST exist in the target Supabase project before live-mode traffic is enabled.

**§"Account-Delete Rollback"** documents the 4 rollback paths from discovery review §12.

### §8.10 Backwards-compatibility surface

- Existing AC1..AC4, AC8 tests in `accountPane.test.tsx` — PRESERVED.
- Existing AC5/AC6/AC7 — REWRITTEN to reflect new Step 1 → Continue semantics (modal still opens on click; "confirm-equivalent" is now Step 2 → "Delete Account" button after type-match).
- Existing AC4 "Delete Account button present" — PRESERVED (button is unchanged in `accountPane.tsx`).
- Existing `deleteModal.title / .body / .cancel / .confirm` i18n keys — PRESERVED VERBATIM (still used as Step 1 fallback).
- Existing `web:settings:rest:account-delete-confirmed` EventMap entry — PRESERVED with `@deprecated` annotation; emit-site moves from Step-1-confirm to Step-1-continue.



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

Account settings now downloads account records with a lifecycle manifest. A separate DeviceRecoveryExport control calls exportDeviceRecoveryData with includeLegacy/includeArchives, both false initially. This is a read-only JSON preservation export, not a restore API. Known device preferences are included; current account namespaces, authentication stores and BYOK stores are excluded. Unsafe/unrecognized selected history is omitted with manifest reasons and visible omission counts.
