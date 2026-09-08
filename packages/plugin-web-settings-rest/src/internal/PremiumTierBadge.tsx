/**
 * @internal — PremiumTierBadge.tsx
 *
 * Gold badge rendered in the Topbar when effective premium tier is "premium_stub".
 * Returns null otherwise (no rendering overhead for free users).
 *
 * Exported from plugin barrel (index.ts) for use by xai-web-shell Topbar.tsx.
 * This is the ONLY cross-package import surface for row #8 (F1 decision: 1 component
 * exported + 1-line Topbar JSX placement).
 *
 * Text: "Premium (stub)" / "高级版（演示）" — locked per feature-review Q2.
 *
 * Design home: packages/plugin-web-settings-rest/docs/design.md §FA-6
 * API contract: packages/plugin-web-settings-rest/docs/api.md §7.5
 * Extension 2026-05-26 — Premium Pane Stripe Checkout Stub (gap-closure row #8)
 */

import * as React from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import { usePremiumTier } from "./usePremiumTier.js";
import { localI18n } from "./localI18n.js";

interface PremiumTierBadgeProps {
  readonly lang?: Lang;
}

export function PremiumTierBadge({
  lang = "en",
}: PremiumTierBadgeProps): React.ReactElement | null {
  const { effectiveTier } = usePremiumTier();
  const t = localI18n(lang);

  if (effectiveTier !== "premium_stub") {
    return null;
  }

  return (
    <span
      className="premium-tier-badge"
      data-testid="premium-tier-badge"
      aria-label={t("premium.badge.tier_stub")}
    >
      {t("premium.badge.tier_stub")}
    </span>
  );
}
