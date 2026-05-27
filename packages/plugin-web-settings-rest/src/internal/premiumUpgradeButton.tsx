/**
 * @internal — premiumUpgradeButton.tsx
 *
 * "Upgrade Now" button that redirects to the Stripe Payment Link via same-tab
 * navigation (FA-2: window.location.assign — no popup, no new tab).
 *
 * When `VITE_STRIPE_PAYMENT_LINK_URL` is not configured:
 *   - Button is rendered in disabled state.
 *   - Tooltip shows "Payment Link not configured — see apps/web/deploy/README.md".
 *   - This covers the PC-CONFIG-2 test and R1 risk.
 *
 * SECURITY INVARIANTS (HC3 CRITICAL):
 *   - NO Stripe Secret Key (sk_live_* / sk_test_*) in any code path.
 *   - NO @stripe/stripe-js import.
 *   - NO Math.random.
 *   - NO fetch to any Stripe API.
 *   - Payment Link URL comes from env var (public, not a secret).
 *
 * Design home: packages/plugin-web-settings-rest/docs/design.md §FA-2
 * API contract: packages/plugin-web-settings-rest/docs/api.md §7 (P2 scope)
 * Extension 2026-05-26 — Premium Pane Stripe Checkout Stub (gap-closure row #8)
 */

import * as React from "react";
import {
  isDesktopPhase1OfflineRuntime,
  resolveWebRuntimeProfile,
} from "@repo/core";
import type { Lang } from "@repo/plugin-web-tokens";
import { localI18n } from "./localI18n.js";
import { usePremiumConfig } from "./usePremiumConfig.js";
import { usePremiumTier } from "./usePremiumTier.js";

interface PremiumUpgradeButtonProps {
  readonly lang: Lang;
}

export function PremiumUpgradeButton({
  lang,
}: PremiumUpgradeButtonProps): React.ReactElement {
  const t = localI18n(lang);
  const runtimeProfile = resolveWebRuntimeProfile(
    import.meta.env as Record<string, string | undefined>,
  );
  const isDesktopOfflineRuntime =
    isDesktopPhase1OfflineRuntime(runtimeProfile);
  const { paymentLinkUrl, configured } = usePremiumConfig();
  const { setTier } = usePremiumTier();

  const handleUpgrade = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    if (!configured || !paymentLinkUrl || isDesktopOfflineRuntime) return;

    // Set tier to "pending" briefly before navigation (FA-3 — short-lived state).
    // This is a transitional UX state only; the actual full-page navigation
    // happens immediately after via window.location.assign.
    setTier("pending");

    // Same-tab redirect — the only HC3+HC4-compatible path post 2025-09-30
    // stripe.redirectToCheckout removal (discovery §3.1).
    window.location.assign(paymentLinkUrl);
  };

  if (!configured || isDesktopOfflineRuntime) {
    return (
      <button
        type="button"
        className="premium-upgrade-btn premium-upgrade-btn--disabled"
        disabled
        title={
          isDesktopOfflineRuntime
            ? (lang === "zh"
              ? "桌面离线模式暂不支持升级"
              : "Upgrade is unavailable in desktop offline mode")
            : t("premium.upgrade_disabled_tooltip")
        }
        aria-label={t("premium.btn.upgrade")}
        data-testid="premium-upgrade-btn-disabled"
      >
        {t("premium.btn.upgrade")}
      </button>
    );
  }

  return (
    <button
      type="button"
      className="premium-upgrade-btn"
      onClick={handleUpgrade}
      aria-label={t("premium.btn.upgrade")}
      data-testid="premium-upgrade-btn"
    >
      {t("premium.btn.upgrade")}
    </button>
  );
}
