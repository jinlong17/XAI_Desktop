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

import { accountScope, type AccountScope } from "@repo/plugin-web-storage";
import type { IntegrationProviderId } from "./integrationProviders.js";
import { generateCodeVerifier, base64UrlEncode } from "./pkce.js";

/** TTL for pending OAuth state — 10 minutes in ms. */
export const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

export interface PendingOAuthState {
  readonly state: string;         // "<providerId>." + base64url(random32)
  readonly codeVerifier: string;  // result of generateCodeVerifier()
  readonly owner: { readonly accountId: string; readonly kind: "account" | "demo"; readonly generation: string; readonly epoch: number };
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

// Ephemeral handles reject callbacks from an earlier epoch in this document.
// On full OAuth navigation, the serialized owner/generation survives; the host
// resolves auth before mounting the callback, rather than comparing process epochs.
const pendingHandles = new Map<string, AccountScope>();
let observedScope = accountScope.capture();
accountScope.subscribe(() => {
  const previous = observedScope;
  observedScope = accountScope.capture();
  if (previous === observedScope || previous.kind === "locked") return;
  for (const providerId of KNOWN_PROVIDER_IDS) {
    try {
      const key = sessionKey(providerId);
      const raw = sessionStorage.getItem(key);
      if (!raw) continue;
      const pending = JSON.parse(raw) as PendingOAuthState;
      if (pending.owner?.accountId === previous.accountId && pending.owner.kind === previous.kind) {
        sessionStorage.removeItem(key);
        pendingHandles.delete(pending.state);
      }
    } catch { /* Transient attempts are rejected if storage is unavailable. */ }
  }
});

export function assertPendingOAuthCurrent(pending: PendingOAuthState, scope = accountScope.capture()): void {
  accountScope.assertCurrent(scope);
  if (!accountScope.isReady(scope) || !pending.owner ||
      pending.owner.accountId !== scope.accountId || pending.owner.kind !== scope.kind ||
      pending.owner.generation !== scope.generation) throw new Error("OAuth attempt belongs to another account");
  const handle = pendingHandles.get(pending.state);
  if (handle) accountScope.assertCurrent(handle);
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
  scope: AccountScope = accountScope.capture(),
): Promise<PendingOAuthState> {
  accountScope.assertCurrent(scope);
  if (!accountScope.isReady(scope) || !scope.accountId || !scope.generation || scope.kind === "locked") throw new Error("Unlock the account before connecting an integration");
  const codeVerifier = generateCodeVerifier();

  // state = "<providerId>." + base64url(32 random bytes)
  const stateBytes = new Uint8Array(32);
  crypto.getRandomValues(stateBytes);
  const stateRandom = base64UrlEncode(stateBytes);
  const state = `${providerId}.${stateRandom}`;

  const expiresAt = Date.now() + OAUTH_STATE_TTL_MS;

  const pending: PendingOAuthState = { state, codeVerifier, expiresAt, owner: { accountId: scope.accountId, kind: scope.kind, generation: scope.generation, epoch: scope.epoch } };
  const previousRaw = sessionStorage.getItem(sessionKey(providerId));
  if (previousRaw) {
    try { pendingHandles.delete((JSON.parse(previousRaw) as PendingOAuthState).state); } catch { /* invalid transient record will be replaced */ }
  }
  pendingHandles.set(state, scope);

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

  const capturedHandle = pendingHandles.get(parsed.state);
  pendingHandles.delete(parsed.state);
  if (capturedHandle) {
    try { accountScope.assertCurrent(capturedHandle); } catch { return null; }
  }

  // Step 4: strict string equality
  if (parsed.state !== stateFromUrl) return null;

  // Step 5: TTL check
  if (!Number.isFinite(parsed.expiresAt) || parsed.expiresAt <= Date.now()) return null;
  if (typeof parsed.codeVerifier !== "string" || !parsed.codeVerifier) return null;
  try { assertPendingOAuthCurrent(parsed); } catch { return null; }
  finally { pendingHandles.delete(parsed.state); }
  return parsed;
}
