/**
 * CheckoutCancelPage — Stripe Checkout cancel callback.
 *
 * Route: /app/settings/premium/checkout/cancel
 * Behavior per FA-3:
 *   Idempotent — tier is NEVER changed.
 *   Shows "Checkout cancelled — tier unchanged" amber banner.
 *   Navigates back to /app/settings/premium after 3000ms.
 *
 * Note: This route is provided for UX symmetry with the success route.
 * In Stripe's Payment Link configuration, the "after_completion.redirect.url"
 * is set to the success URL; the cancel route handles browser back navigation
 * or any payment_link_cancel_url configuration.
 *
 * SECURITY INVARIANTS:
 *   - NO Stripe Secret Key.
 *   - NO fetch().
 *   - NO tier mutation.
 *
 * Design home: packages/plugin-web-settings-rest/docs/design.md §FA-3
 * API contract: packages/plugin-web-settings-rest/docs/api.md §7 (P3 scope)
 * Extension 2026-05-26 — Premium Pane Stripe Checkout Stub (gap-closure row #8)
 */

import * as React from "react";
import { useNavigate } from "react-router";
import { localI18n } from "./internal/localI18n.js";

const PREMIUM_SETTINGS_PATH = "/app/settings/premium";
const CANCEL_REDIRECT_MS = 3000;

function CheckoutCancelPageInner(): React.ReactElement {
  const navigate = useNavigate();
  const t = localI18n("en");
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      void navigate(PREMIUM_SETTINGS_PATH, { replace: true });
    }, CANCEL_REDIRECT_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) {
    return <div className="premium-cb-page" data-testid="premium-cb-page" />;
  }

  return (
    <div className="premium-cb-page" data-testid="premium-cb-page">
      <div
        className="premium-cb-banner premium-cb-banner--cancelled"
        role="status"
        data-testid="premium-cb-banner-cancelled"
      >
        <p>{t("premium.cb.cancel")}</p>
        <p className="premium-cb-redirect">{t("premium.cb.redirect_notice")}</p>
      </div>
    </div>
  );
}

/**
 * CheckoutCancelPage — exported for use by apps/web/src/routes/router.tsx.
 * Uses the App layout (rail + topbar visible).
 */
export function CheckoutCancelPage(): React.ReactElement {
  return <CheckoutCancelPageInner />;
}
