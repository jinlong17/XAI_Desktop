/**
 * @internal — usePremiumConfig.ts
 *
 * Reads the Payment Link URL from the Vite env var `VITE_STRIPE_PAYMENT_LINK_URL`.
 *
 * HC3 CRITICAL: No Secret Key (sk_live_* / sk_test_*) ANYWHERE in this module
 * or any module that depends on it. Payment Link URL is a public URL —
 * not a secret key. See FA-2 for rationale.
 *
 * API contract: packages/plugin-web-settings-rest/docs/api.md §7.4
 * Extension 2026-05-26 — Premium Pane Stripe Checkout Stub (gap-closure row #8)
 */

/**
 * The Payment Link configuration shape returned by `usePremiumConfig()`.
 */
export interface PremiumConfig {
  /**
   * The Stripe Payment Link URL to redirect to on Upgrade click.
   * Populated from `VITE_STRIPE_PAYMENT_LINK_URL`.
   *
   * `null` when the env var is absent or empty — causes the Upgrade button
   * to render in a disabled state with a tooltip (PC-CONFIG-2 test).
   */
  readonly paymentLinkUrl: string | null;

  /**
   * `true` when `paymentLinkUrl` is a non-empty string (button is enabled).
   * `false` when `paymentLinkUrl` is null or empty (button is disabled with tooltip).
   */
  readonly configured: boolean;
}

/**
 * Returns the Premium payment configuration derived from build-time env vars.
 *
 * This is NOT a hook — it is a plain function that reads `import.meta.env`
 * at call time. It is named `usePremiumConfig` to signal it is intended for
 * use in React components but it has no side-effects and does not call
 * React hooks internally.
 *
 * @example
 * const { paymentLinkUrl, configured } = usePremiumConfig();
 * if (!configured) { // show disabled button }
 * else { window.location.assign(paymentLinkUrl!); }
 */
export function usePremiumConfig(): PremiumConfig {
  // Vite replaces import.meta.env.* at build time.
  // At test time (vitest), import.meta.env is available and vi.stubEnv patches it.
  const raw: string | undefined = import.meta.env.VITE_STRIPE_PAYMENT_LINK_URL;

  const paymentLinkUrl = raw && raw.trim().length > 0 ? raw.trim() : null;

  return {
    paymentLinkUrl,
    configured: paymentLinkUrl !== null,
  };
}
