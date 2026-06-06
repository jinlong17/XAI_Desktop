/**
 * CheckoutSuccessPage — Stripe Checkout success callback.
 *
 * Route: /app/settings/premium/checkout/success
 * Reads: ?session_id= from URL via useSearchParams()
 *
 * Behavior per FA-3:
 *   Valid session_id (present + non-empty):
 *     → flip xai_pref_premium_tier to "premium_stub"
 *     → set xai_pref_premium_started_at to Date.now()
 *     → emit web:premium:tier-changed
 *     → green banner
 *     → navigate to /app/settings/premium after 2000ms
 *
 *   Invalid session_id (missing or empty):
 *     → tier UNCHANGED
 *     → invalid banner
 *     → navigate to /app/settings/premium after 3000ms
 *
 * SECURITY INVARIANTS (HC3 CRITICAL):
 *   - NO Stripe Secret Key (sk_live_* / sk_test_*) in any code path.
 *   - NO @stripe/stripe-js import.
 *   - NO fetch() calls. session_id presence-only validation (cannot
 *     validate without SK — v1 stub trust model per HC3 + CS-INVALID-1).
 *   - session_id is NEVER logged or persisted.
 *
 * Design home: packages/plugin-web-settings-rest/docs/design.md §FA-3
 * API contract: packages/plugin-web-settings-rest/docs/api.md §7 (P3 scope)
 * Extension 2026-05-26 — Premium Pane Stripe Checkout Stub (gap-closure row #8)
 */

import * as React from "react";
import { useSearchParams, useNavigate } from "react-router";
import { emitWebEvent } from "@repo/xai-web-event-bus";
import { localI18n } from "./internal/localI18n.js";
import { usePremiumTier } from "./internal/usePremiumTier.js";

const PREMIUM_SETTINGS_PATH = "/app/settings/premium";
const SUCCESS_REDIRECT_MS = 2000;
const INVALID_REDIRECT_MS = 3000;

type CheckoutSuccessStatus = "pending" | "success" | "invalid";

function CheckoutSuccessPageInner(): React.ReactElement {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const t = localI18n("en");
  const { setTier, setStartedAt, effectiveTier } = usePremiumTier();

  const [status, setStatus] = React.useState<CheckoutSuccessStatus>("pending");

  React.useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId || sessionId.trim().length === 0) {
      // Missing or empty session_id — invalid path
      setStatus("invalid");
      const timer = setTimeout(() => {
        void navigate(PREMIUM_SETTINGS_PATH, { replace: true });
      }, INVALID_REDIRECT_MS);
      return () => clearTimeout(timer);
    }

    // Valid session_id (presence-only per v1 stub trust model — no SK to validate with)
    // Capture the previous tier before mutation
    const previousTier = effectiveTier;

    // Flip tier + start the 30-day clock
    const now = Date.now();
    setStartedAt(now);
    setTier("premium_stub");

    // Emit typed event (declaration-only; no consumer in v1)
    emitWebEvent("web:premium:tier-changed", {
      previous: previousTier,
      current: "premium_stub",
      changedAt: new Date(now).toISOString(),
    });

    setStatus("success");

    const timer = setTimeout(() => {
      void navigate(PREMIUM_SETTINGS_PATH, { replace: true });
    }, SUCCESS_REDIRECT_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "pending") {
    return <div className="premium-cb-page" data-testid="premium-cb-page" />;
  }

  return (
    <div className="premium-cb-page" data-testid="premium-cb-page">
      {status === "success" && (
        <div
          className="premium-cb-banner premium-cb-banner--success"
          role="status"
          data-testid="premium-cb-banner-success"
        >
          <p>{t("premium.cb.success")}</p>
          <p className="premium-cb-redirect">{t("premium.cb.redirect_notice")}</p>
        </div>
      )}
      {status === "invalid" && (
        <div
          className="premium-cb-banner premium-cb-banner--invalid"
          role="alert"
          data-testid="premium-cb-banner-invalid"
        >
          <p>{t("premium.cb.invalid")}</p>
          <p className="premium-cb-redirect">{t("premium.cb.redirect_notice")}</p>
        </div>
      )}
    </div>
  );
}

/**
 * CheckoutSuccessPage — exported for use by apps/web/src/routes/router.tsx.
 * Uses the App layout (rail + topbar visible).
 */
export function CheckoutSuccessPage(): React.ReactElement {
  return <CheckoutSuccessPageInner />;
}
