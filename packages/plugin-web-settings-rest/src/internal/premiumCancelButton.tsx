/**
 * @internal — premiumCancelButton.tsx
 *
 * "Cancel Subscription" button visible only when effective tier is "premium_stub".
 *
 * On click:
 *   1. Sets xai_pref_premium_tier to "free".
 *   2. Sets xai_pref_premium_started_at to 0.
 *   3. Emits web:premium:tier-changed with { previous: "premium_stub", current: "free" }.
 *   4. NO fetch. NO Stripe API call.
 *
 * Tooltip warns: "Clearing the local subscription flag will not contact Stripe —
 * manage payment at billing.stripe.com"
 *
 * SECURITY INVARIANTS:
 *   - NO Stripe Secret Key.
 *   - NO fetch() to any Stripe API.
 *   - Local state-only operation.
 *
 * Design home: packages/plugin-web-settings-rest/docs/design.md §FA-7
 * API contract: packages/plugin-web-settings-rest/docs/api.md §7 (P4 scope)
 * Extension 2026-05-26 — Premium Pane Stripe Checkout Stub (gap-closure row #8)
 */

import * as React from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import { emitWebEvent } from "@repo/xai-web-event-bus";
import { localI18n } from "./localI18n.js";
import { usePremiumTier } from "./usePremiumTier.js";

interface PremiumCancelButtonProps {
  readonly lang: Lang;
}

export function PremiumCancelButton({
  lang,
}: PremiumCancelButtonProps): React.ReactElement | null {
  const t = localI18n(lang);
  const { effectiveTier, setTier, setStartedAt } = usePremiumTier();

  // Only visible when effective tier is premium_stub (FA-7)
  if (effectiveTier !== "premium_stub") {
    return null;
  }

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();

    // Emit BEFORE flipping the pref so event payload reflects the transition accurately
    emitWebEvent("web:premium:tier-changed", {
      previous: "premium_stub",
      current: "free",
      changedAt: new Date().toISOString(),
    });

    // Flip both prefs to "free" / 0
    setTier("free");
    setStartedAt(0);
  };

  return (
    <button
      type="button"
      className="premium-cancel-btn"
      onClick={handleCancel}
      title={t("premium.btn.cancel_sub_tooltip")}
      aria-label={t("premium.btn.cancel_sub")}
      data-testid="premium-cancel-btn"
    >
      {t("premium.btn.cancel_sub")}
    </button>
  );
}
