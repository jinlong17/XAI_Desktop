/**
 * @internal — premiumDisclosureBanner.tsx
 *
 * Non-dismissible amber disclosure banner rendered unconditionally at the top
 * of the Premium pane in all 3 tier states (free / pending / premium_stub).
 *
 * Distinct CSS class `premium-disclosure-banner` — does NOT reuse row #7's
 * `int-stub-banner` class (different visual treatment).
 *
 * Text (FA-8):
 *   EN: "v1 Premium is a UX preview. Real subscription enforcement requires
 *       desktop client (P1)."
 *   ZH: "v1 高级版仅为 UX 演示。真实订阅功能需在桌面端（P1）实现。"
 *
 * Design home: packages/plugin-web-settings-rest/docs/design.md §FA-8
 * API contract: packages/plugin-web-settings-rest/docs/api.md §7 (P4 scope)
 * Extension 2026-05-26 — Premium Pane Stripe Checkout Stub (gap-closure row #8)
 */

import * as React from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import { localI18n } from "./localI18n.js";

interface PremiumDisclosureBannerProps {
  readonly lang: Lang;
}

export function PremiumDisclosureBanner({
  lang,
}: PremiumDisclosureBannerProps): React.ReactElement {
  const t = localI18n(lang);

  return (
    <div
      className="premium-disclosure-banner"
      role="note"
      data-testid="premium-disclosure-banner"
      // Non-dismissible: no close button (PB-BANNER-3 test)
    >
      {t("premium.disclosure.banner")}
    </div>
  );
}
