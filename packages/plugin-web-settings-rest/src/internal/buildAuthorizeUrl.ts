/**
 * @internal — buildAuthorizeUrl.ts
 *
 * Builds the full OAuth authorize URL for same-tab navigation.
 *
 * SECURITY INVARIANTS:
 *   - NEVER uses Math.random.
 *   - Output URL MUST start with https://.
 *   - All query values are encodeURIComponent-encoded.
 *
 * Design home: packages/plugin-web-settings-rest/docs/design.md §FA-6
 * API contract: packages/plugin-web-settings-rest/docs/api.md §6.5
 */

import type { IntegrationProvider } from "./integrationProviders.js";
import type { PendingOAuthState } from "./oauthState.js";
import { computeCodeChallenge } from "./pkce.js";

/**
 * Build the full authorize URL for the given provider.
 *
 * Query params added:
 *   - client_id            (provider.clientId; may be empty in stub)
 *   - redirect_uri         (window.location.origin + "/app/settings/integrations/callback")
 *   - response_type        = "code"
 *   - scope                (space-joined provider.scopes; omitted if empty)
 *   - state                (pendingState.state)
 *   - code_challenge       (base64url(SHA-256(codeVerifier)))
 *   - code_challenge_method= "S256"
 */
export async function buildAuthorizeUrl(
  provider: IntegrationProvider,
  pendingState: PendingOAuthState,
): Promise<string> {
  if (!provider.authorizeUrl.startsWith("https://")) {
    throw new Error(
      `authorize URL must be https: got ${provider.authorizeUrl}`,
    );
  }

  const redirectUri =
    window.location.origin + "/app/settings/integrations/callback";

  const codeChallenge = await computeCodeChallenge(pendingState.codeVerifier);

  const params = new URLSearchParams();
  if (provider.clientId) {
    params.set("client_id", provider.clientId);
  }
  params.set("redirect_uri", redirectUri);
  params.set("response_type", "code");
  if (provider.scopes.length > 0) {
    params.set("scope", provider.scopes.join(" "));
  }
  params.set("state", pendingState.state);
  params.set("code_challenge", codeChallenge);
  params.set("code_challenge_method", "S256");

  return `${provider.authorizeUrl}?${params.toString()}`;
}
