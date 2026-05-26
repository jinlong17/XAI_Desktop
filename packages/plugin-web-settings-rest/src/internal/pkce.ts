/**
 * @internal — pkce.ts
 *
 * PKCE helpers per RFC 7636.
 *
 * SECURITY INVARIANTS:
 *   - NEVER uses Math.random — source-text guard enforces this.
 *   - All randomness from crypto.getRandomValues (Web Crypto API).
 *
 * Design home: packages/plugin-web-settings-rest/docs/design.md §FA-3
 * API contract: packages/plugin-web-settings-rest/docs/api.md §6.3
 */

/**
 * URL-safe base64 encode a Uint8Array with no padding.
 * RFC 4648 §5: replaces '+' with '-' and '/' with '_', strips '=' padding.
 */
export function base64UrlEncode(bytes: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * Generate a PKCE code_verifier per RFC 7636 §4.1.
 *
 * Implementation:
 *   - 32 bytes from crypto.getRandomValues
 *   - base64url-encoded (URL-safe charset [A-Za-z0-9_-], no padding)
 *   - Result length: 43 chars (32 bytes → 44 base64 chars → 43 without padding)
 *
 * NEVER uses Math.random.
 */
export function generateCodeVerifier(): string {
  if (
    typeof crypto === "undefined" ||
    typeof crypto.getRandomValues !== "function"
  ) {
    throw new Error("crypto.getRandomValues unavailable");
  }
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

/**
 * Compute code_challenge = base64url(SHA-256(code_verifier)) per RFC 7636 §4.2.
 *
 * Uses crypto.subtle.digest("SHA-256", ...).
 * The verifier string is UTF-8 encoded before hashing.
 */
export async function computeCodeChallenge(codeVerifier: string): Promise<string> {
  if (
    typeof crypto === "undefined" ||
    typeof crypto.subtle === "undefined"
  ) {
    throw new Error("crypto.subtle unavailable");
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(new Uint8Array(hashBuffer));
}
