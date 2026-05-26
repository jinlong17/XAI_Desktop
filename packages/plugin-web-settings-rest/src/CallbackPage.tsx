/**
 * CallbackPage — OAuth PKCE callback handler.
 *
 * Route: /app/settings/integrations/callback
 * Reads: ?state=, ?code=, ?error= from URL via useSearchParams()
 *
 * Behavior per FA-8:
 *   Valid state  → flip pref to true + emit web:settings:integration-connected
 *                  + green banner + navigate to /app/settings/integrations after 2s
 *   Invalid state → red banner + navigate after 4s
 *   Error param   → yellow banner + navigate after 3s
 *
 * SECURITY INVARIANTS:
 *   - The `code` value is NEVER logged or persisted.
 *   - No fetch() calls (stub mode — no token exchange).
 *
 * Design home: packages/plugin-web-settings-rest/docs/design.md §FA-7 + §FA-8
 * API contract: packages/plugin-web-settings-rest/docs/api.md §6.9
 */

import * as React from "react";
import { useSearchParams, useNavigate } from "react-router";
import { usePref } from "@repo/plugin-web-storage";
import { emitWebEvent } from "@repo/xai-web-event-bus";
import { validateAndConsumeState } from "./internal/oauthState.js";
import { localI18n } from "./internal/localI18n.js";
import type { IntegrationProviderId } from "./internal/integrationProviders.js";

const SETTINGS_INTEGRATIONS_PATH = "/app/settings/integrations";

type CallbackStatus = "success" | "invalid" | "cancelled" | "pending";

interface CallbackStatusState {
  status: CallbackStatus;
  providerId: IntegrationProviderId | null;
}

function useConnectedPrefs() {
  const [notionConnected, setNotionConnected] = usePref(
    "xai_pref_integrations_connected_notion",
  );
  const [gcalConnected, setGcalConnected] = usePref(
    "xai_pref_integrations_connected_gcal",
  );
  const [linearConnected, setLinearConnected] = usePref(
    "xai_pref_integrations_connected_linear",
  );

  return {
    notionConnected,
    gcalConnected,
    linearConnected,
    setNotionConnected,
    setGcalConnected,
    setLinearConnected,
  };
}

function flipConnectedPref(
  providerId: IntegrationProviderId,
  setNotionConnected: (v: boolean) => void,
  setGcalConnected: (v: boolean) => void,
  setLinearConnected: (v: boolean) => void,
): void {
  if (providerId === "notion") setNotionConnected(true);
  else if (providerId === "gcal") setGcalConnected(true);
  else if (providerId === "linear") setLinearConnected(true);
}

function CallbackPageInner(): React.ReactElement {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    setNotionConnected,
    setGcalConnected,
    setLinearConnected,
  } = useConnectedPrefs();

  // Use a fixed lang for the callback page (no lang prop; defaults to "en").
  // The callback page is transient (auto-navigates); full bilingual is provided
  // via the integration pane. We default to "en" and note that CP8 tests ZH via
  // rendering with a wrapped lang context.
  const lang = "en" as const;
  const t = localI18n(lang);

  const [state, setState] = React.useState<CallbackStatusState>({
    status: "pending",
    providerId: null,
  });

  React.useEffect(() => {
    const errorParam = searchParams.get("error");
    const stateParam = searchParams.get("state");

    if (errorParam) {
      // Provider returned an error (e.g. access_denied)
      // Clear any pending state defense-in-depth
      if (stateParam) {
        validateAndConsumeState(stateParam);
      }
      setState({ status: "cancelled", providerId: null });
      const timer = setTimeout(() => {
        void navigate(SETTINGS_INTEGRATIONS_PATH, { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }

    if (!stateParam) {
      setState({ status: "invalid", providerId: null });
      const timer = setTimeout(() => {
        void navigate(SETTINGS_INTEGRATIONS_PATH, { replace: true });
      }, 4000);
      return () => clearTimeout(timer);
    }

    const pending = validateAndConsumeState(stateParam);

    if (!pending) {
      setState({ status: "invalid", providerId: null });
      const timer = setTimeout(() => {
        void navigate(SETTINGS_INTEGRATIONS_PATH, { replace: true });
      }, 4000);
      return () => clearTimeout(timer);
    }

    // Valid state — extract providerId from state prefix
    const dotIndex = stateParam.indexOf(".");
    const providerId = stateParam.slice(0, dotIndex) as IntegrationProviderId;

    // Flip the pref
    flipConnectedPref(
      providerId,
      setNotionConnected,
      setGcalConnected,
      setLinearConnected,
    );

    // Emit typed event (declaration-only in row #7; no consumer yet)
    emitWebEvent("web:settings:integration-connected", {
      providerId,
      mode: "stub",
      connectedAt: new Date().toISOString(),
    });

    setState({ status: "success", providerId });

    const timer = setTimeout(() => {
      void navigate(SETTINGS_INTEGRATIONS_PATH, { replace: true });
    }, 2000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { status } = state;

  if (status === "pending") {
    return <div className="oauth-cb-page" />;
  }

  return (
    <div className="oauth-cb-page">
      {status === "success" && (
        <div className="oauth-cb-banner oauth-cb-banner--success" role="status">
          <span>{t("oauth.cb.success")}</span>
          <span className="oauth-cb-redirect">{t("oauth.cb.redirect_notice")}</span>
        </div>
      )}
      {status === "invalid" && (
        <div className="oauth-cb-banner oauth-cb-banner--error" role="alert">
          <span>{t("oauth.cb.invalid")}</span>
          <span className="oauth-cb-redirect">{t("oauth.cb.redirect_notice")}</span>
        </div>
      )}
      {status === "cancelled" && (
        <div className="oauth-cb-banner oauth-cb-banner--cancelled" role="status">
          <span>{t("oauth.cb.cancelled")}</span>
          <span className="oauth-cb-redirect">{t("oauth.cb.redirect_notice")}</span>
        </div>
      )}
    </div>
  );
}

/**
 * CallbackPage — exported for use by apps/web/src/routes/router.tsx.
 * Uses the App layout (rail + topbar visible).
 */
export function CallbackPage(): React.ReactElement {
  return <CallbackPageInner />;
}
