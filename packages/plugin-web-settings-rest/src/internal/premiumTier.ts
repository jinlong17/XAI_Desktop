/**
 * @internal — premiumTier.ts
 *
 * Type definitions and constants for the Premium tier state machine.
 *
 * API contract: packages/plugin-web-settings-rest/docs/api.md §7.2
 * Extension 2026-05-26 — Premium Pane Stripe Checkout Stub (gap-closure row #8)
 *
 * FA-12: `xai_pref_premium_tier === "premium_stub"` MUST NOT be interpreted by
 * any other plugin/code as "real subscription is active" in v1. This is a
 * UX-stub flag only. The disclosure banner makes this explicit to the user.
 */

/**
 * All possible premium tier values stored in `xai_pref_premium_tier`.
 *
 * - "free"          — no premium (default)
 * - "pending"       — Upgrade clicked; short-lived transitional state while
 *                     navigating to Stripe Payment Link (typically < 1s)
 * - "premium_stub"  — Success callback received; 30-day client-clock window
 *                     starts. NOTE: THIS IS A UX-STUB FLAG. Not a real
 *                     subscription signal. Real enforcement requires P1
 *                     desktop client or a Worker-level entitlement check.
 */
export type PremiumTier = "free" | "pending" | "premium_stub";

/**
 * 30-day TTL for the premium_stub tier in milliseconds.
 * After this window, usePremiumTier() returns "free" (effective downgrade).
 *
 * Pure constant — no setInterval, no setTimeout, no fetch.
 * Evaluated at call-site on each usePremiumTier() call.
 */
export const PREMIUM_TIER_TTL_MS: number = 30 * 24 * 60 * 60 * 1000;
