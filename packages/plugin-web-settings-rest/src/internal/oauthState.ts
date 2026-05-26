/**
 * @internal — oauthState.ts
 *
 * OAuth PKCE state management using sessionStorage.
 *
 * SECURITY INVARIANTS:
 *   - NEVER uses Math.random — source-text guard enforces this.
 *   - NEVER uses localStorage — code_verifier lives in sessionStorage only.
 *   - state and code_verifier are one-shot: consumed (cleared) on validate.
 *   - TTL = 10 minutes.
 *
 * sessionStorage key format: xai_oauth_pending_<providerId>
 * Value shape: { state, codeVerifier, expiresAt }
 *
 * Design home: packages/plugin-web-settings-rest/docs/design.md §FA-4 + §FA-5
 * API contract: packages/plugin-web-settings-rest/docs/api.md §6.4
 */

import type { IntegrationProviderId } from "./integrationProviders.js";
import { generateCodeVerifier, base64UrlEncode } from "./pkce.js";

/** TTL for pending OAuth state — 10 minutes in ms. */
export const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

export interface PendingOAuthState {
  readonly state: string;         // "<providerId>." + base64url(random32)
  readonly codeVerifier: string;  // result of generateCodeVerifier()
  readonly expiresAt: number;     // ms epoch; now + OAUTH_STATE_TTL_MS
}

const KNOWN_PROVIDER_IDS: readonly IntegrationProviderId[] = [
  "notion",
  "gcal",
  "linear",
];

function sessionKey(providerId: IntegrationProviderId): string {
  return `xai_oauth_pending_${providerId}`;
}

/**
 * Generate a fresh PendingOAuthState for the given provider.
 *
 * - Persists to sessionStorage under key `xai_oauth_pending_<providerId>`.
 * - Returns the new state for use in the authorize URL.
 * - NEVER uses Math.random; NEVER uses localStorage.
 */
export async function startOAuth(
  providerId: IntegrationProviderId,
): Promise<PendingOAuthState> {
  const codeVerifier = generateCodeVerifier();

  // state = "<providerId>." + base64url(32 random bytes)
  const stateBytes = new Uint8Array(32);
  crypto.getRandomValues(stateBytes);
  const stateRandom = base64UrlEncode(stateBytes);
  const state = `${providerId}.${stateRandom}`;

  const expiresAt = Date.now() + OAUTH_STATE_TTL_MS;

  const pending: PendingOAuthState = { state, codeVerifier, expiresAt };

  sessionStorage.setItem(
    sessionKey(providerId),
    JSON.stringify(pending),
  );

  return pending;
}

/**
 * Validate a state value received from the OAuth callback URL.
 *
 * Validation steps (all must pass):
 *   1. state has the form "<providerId>.<base64url>"
 *   2. providerId is a known id
 *   3. sessionStorage key `xai_oauth_pending_<providerId>` exists and parses
 *   4. parsed.state === stateFromUrl (strict ===)
 *   5. parsed.expiresAt > Date.now() (TTL not expired)
 *
 * On any failure: returns null.
 * Side-effect: clears the sessionStorage entry on both success and failure (one-shot use).
 */
export function validateAndConsumeState(
  stateFromUrl: string,
): PendingOAuthState | null {
  // Step 1 + 2: extract providerId from state prefix
  const dotIndex = stateFromUrl.indexOf(".");
  if (dotIndex === -1) return null;

  const providerId = stateFromUrl.slice(0, dotIndex) as IntegrationProviderId;
  if (!KNOWN_PROVIDER_IDS.includes(providerId)) {
    return null;
  }

  const key = sessionKey(providerId);
  const raw = sessionStorage.getItem(key);

  // Always clear the entry (defense in depth — one-shot use)
  sessionStorage.removeItem(key);

  if (!raw) return null;

  let parsed: PendingOAuthState;
  try {
    parsed = JSON.parse(raw) as PendingOAuthState;
  } catch {
    return null;
  }

  // Step 4: strict string equality
  if (parsed.state !== stateFromUrl) return null;

  // Step 5: TTL check
  if (parsed.expiresAt <= Date.now()) return null;

  return parsed;
}
