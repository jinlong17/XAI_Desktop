/**
 * @internal — integrationProviders.ts
 *
 * The 3 wired OAuth provider configurations for the Integrations pane stub.
 * HC1: exactly 3 providers — Notion / Google Calendar / Linear.
 * HC2: all authorize/token URLs are https:// (assertion in buildAuthorizeUrl).
 *
 * Design home: packages/plugin-web-settings-rest/docs/design.md §"2026-05-25 Extension"
 * API contract: packages/plugin-web-settings-rest/docs/api.md §6.2
 */

export type IntegrationProviderId = "notion" | "gcal" | "linear";

export interface IntegrationProvider {
  readonly id: IntegrationProviderId;
  /** localI18n key for the provider's display name. */
  readonly nameKey: string;
  /** Base authorize endpoint (browser navigation — NOT in CSP connect-src). */
  readonly authorizeUrl: string;
  /** Token endpoint (future use — listed in CSP connect-src per ADR-0008 §S3 D3 third amendment). */
  readonly tokenUrl: string;
  /** Provider-specific OAuth scopes. */
  readonly scopes: readonly string[];
  /** Registered pref key for this provider's connection state. */
  readonly prefKey:
    | "xai_pref_integrations_connected_notion"
    | "xai_pref_integrations_connected_gcal"
    | "xai_pref_integrations_connected_linear";
  /** Placeholder client_id (stub — no real client registered). */
  readonly clientId: string;
  /** OKLCH card background color — matches integrationsPane.tsx FEATURED color. */
  readonly cardColor: string;
  /** 1-char monogram. */
  readonly cardShort: string;
}

/**
 * The 3 wired integration providers.
 *
 * authorizeUrl entries are top-level navigation destinations (browser window.location.assign).
 * They are NOT in CSP connect-src (only tokenUrl entries are allowlisted there).
 * Per discovery §3.2: accounts.google.com and linear.app set X-Frame-Options:DENY;
 * no frame-src widening needed.
 */
export const PROVIDERS: readonly IntegrationProvider[] = [
  {
    id: "notion",
    nameKey: "provider.notion",
    authorizeUrl: "https://api.notion.com/v1/oauth/authorize",
    tokenUrl: "https://api.notion.com/v1/oauth/token",
    scopes: [],
    prefKey: "xai_pref_integrations_connected_notion",
    clientId: "",
    cardColor: "oklch(22% 0 0)",
    cardShort: "N",
  },
  {
    id: "gcal",
    nameKey: "provider.gcal",
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
    prefKey: "xai_pref_integrations_connected_gcal",
    clientId: "",
    cardColor: "oklch(55% 0.16 255)",
    cardShort: "G",
  },
  {
    id: "linear",
    nameKey: "provider.linear",
    authorizeUrl: "https://linear.app/oauth/authorize",
    tokenUrl: "https://api.linear.app/oauth/token",
    scopes: ["read"],
    prefKey: "xai_pref_integrations_connected_linear",
    clientId: "",
    cardColor: "oklch(55% 0.12 265)",
    cardShort: "L",
  },
] as const;
