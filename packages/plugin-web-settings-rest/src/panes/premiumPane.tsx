/**
 * premiumPane — Settings → Premium pane.
 *
 * SHIPPED row #24: Static render with Star SVG + bilingual headline + body + no-op Upgrade CTA.
 * Extension 2026-05-26 (gap-closure row #8): Adds tier-aware Upgrade button (Payment Link
 * redirect), Cancel Subscription button, disclosure banner, tier-aware copy.
 *
 * PR1..PR3 tests (SHIPPED row #24) are preserved verbatim per FA-14:
 *   PR1: renders without error (EN)
 *   PR2: bilingual — EN shows English headline
 *   PR3: bilingual — ZH shows Chinese headline
 *
 * Port of web design/module-settings.jsx lines 136-151.
 * API contract: packages/xai-web-settings-rest/docs/api.md §4.2 + §7 (P4)
 */

import * as React from "react";
import {
  isDesktopPhase1OfflineRuntime,
  resolveWebRuntimeProfile,
} from "@repo/core";
import type { Pane, PaneRenderProps } from "@repo/plugin-web-settings-shell";
import { useI18n } from "@repo/plugin-web-tokens";
import { localI18n } from "../internal/localI18n.js";
import { usePremiumTier } from "../internal/usePremiumTier.js";
import { PremiumDisclosureBanner } from "../internal/premiumDisclosureBanner.js";
import { PremiumUpgradeButton } from "../internal/premiumUpgradeButton.js";
import { PremiumCancelButton } from "../internal/premiumCancelButton.js";

function PremiumPaneContent({ lang }: PaneRenderProps): React.ReactElement {
  const { s } = useI18n(lang);
  const t = localI18n(lang);
  const runtimeProfile = resolveWebRuntimeProfile(
    import.meta.env as Record<string, string | undefined>,
  );
  const isDesktopOfflineRuntime =
    isDesktopPhase1OfflineRuntime(runtimeProfile);
  const { effectiveTier, startedAt } = usePremiumTier();

  return (
    <div className="premium-pane">
      <h3 className="pane-title">{s("settings.premium")}</h3>

      {/* Non-dismissible disclosure banner — present in all 3 tier states (FA-8 / PB-BANNER-1..3) */}
      <PremiumDisclosureBanner lang={lang} />

      <div className="premium-card">
        <div className="premium-emblem" aria-hidden="true">
          <svg viewBox="0 0 26 26" width="26" height="26" fill="currentColor">
            <path d="M13 2l2.9 6.3 6.8.9-5 4.7 1.3 6.8L13 17.7l-6 3.3 1.3-6.8-5-4.7 6.8-.9z" />
          </svg>
        </div>
        <h4>{t("premium.headline_en")}</h4>
        <p>{t("premium.body_en")}</p>

        {/* Tier-aware current tier label */}
        <div className="premium-tier-row" data-testid="premium-tier-label">
          <span>{t("premium.tier.label")}</span>
          <strong>
            {effectiveTier === "premium_stub"
              ? t("premium.tier.premium_stub")
              : effectiveTier === "pending"
                ? t("premium.tier.premium_stub")
                : t("premium.tier.free")}
          </strong>
        </div>

        {/* Activated date — only visible when premium_stub */}
        {effectiveTier === "premium_stub" && startedAt > 0 && (
          <p className="premium-tier-row" style={{ fontSize: "0.82rem" }}>
            {lang === "zh"
              ? `已激活：${new Date(startedAt).toLocaleDateString("zh-CN")}`
              : `Activated: ${new Date(startedAt).toLocaleDateString("en-US")}`}
          </p>
        )}

        {/* Upgrade button — only visible when NOT premium_stub */}
        {effectiveTier !== "premium_stub" && (
          <PremiumUpgradeButton lang={lang} />
        )}
        {isDesktopOfflineRuntime && (
          <p data-testid="premium-offline-note">
            {lang === "zh"
              ? "桌面离线模式下支付回调不可用。"
              : "Payment callbacks are unavailable in desktop offline mode."}
          </p>
        )}

        {/* Cancel Subscription button — only visible when premium_stub */}
        <PremiumCancelButton lang={lang} />
      </div>
    </div>
  );
}

export const premiumPane: Pane = {
  id: "premium",
  icon: "star",
  i18nKey: "settings.premium",
  render: (props: PaneRenderProps): React.ReactElement => (
    <PremiumPaneContent {...props} />
  ),
};
