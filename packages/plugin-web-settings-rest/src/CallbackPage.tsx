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

/**
 * Scrub OAuth `code`/`state`/`error` query params from the visible URL
 * WITHOUT involving react-router's navigation machinery. We use raw
 * `window.history.replaceState` because react-router 7's setSearchParams
 * triggers an internal navigate cycle that under jsdom + undici 6 produces
 * a spurious "Expected signal to be an instance of AbortSignal" unhandled
 * rejection (see codex finding #2 patch cycle 2 dev_log). Production
 * behaviour is identical: the URL's query becomes empty and no new
 * history entry is pushed.
 */
function scrubOAuthQuery(): void {
  if (typeof window === "undefined" || !window.history?.replaceState) return;
  const url = new URL(window.location.href);
  if (url.search === "") return;
  url.search = "";
  window.history.replaceState(window.history.state, "", url.toString());
}

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
    const codeParam = searchParams.get("code");

    if (errorParam) {
      // Provider returned an error (e.g. access_denied)
      // Clear any pending state defense-in-depth
      if (stateParam) {
        validateAndConsumeState(stateParam);
      }
      setState({ status: "cancelled", providerId: null });
      // CODEX FINDING #2: scrub query immediately so error/state don't linger.
      scrubOAuthQuery();
      const timer = setTimeout(() => {
        void navigate(SETTINGS_INTEGRATIONS_PATH, { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }

    if (!stateParam) {
      setState({ status: "invalid", providerId: null });
      // CODEX FINDING #2: scrub query (defensive — no state but may have code).
      scrubOAuthQuery();
      const timer = setTimeout(() => {
        void navigate(SETTINGS_INTEGRATIONS_PATH, { replace: true });
      }, 4000);
      return () => clearTimeout(timer);
    }

    const pending = validateAndConsumeState(stateParam);

    if (!pending) {
      setState({ status: "invalid", providerId: null });
      // CODEX FINDING #2: scrub query — state was malformed/expired, code still in URL.
      scrubOAuthQuery();
      const timer = setTimeout(() => {
        void navigate(SETTINGS_INTEGRATIONS_PATH, { replace: true });
      }, 4000);
      return () => clearTimeout(timer);
    }

    if (!codeParam) {
      setState({ status: "invalid", providerId: null });
      scrubOAuthQuery();
      const timer = setTimeout(() => {
        void navigate(SETTINGS_INTEGRATIONS_PATH, { replace: true });
      }, 4000);
      return () => clearTimeout(timer);
    }

    // Valid state and code — extract providerId from state prefix
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

    // CODEX FINDING #2 (2026-05-26): Immediately scrub `code`/`state` from
    // the URL after consuming them. Previously the URL retained the OAuth
    // params for the full 2s success-display window (and 3s/4s on the
    // error/invalid branches above), leaking them into browser history,
    // shareable URLs, screenshots, and referrer headers if the user
    // navigated elsewhere mid-display. Uses raw history.replaceState (NOT
    // react-router's setSearchParams) to avoid a jsdom+undici AbortSignal
    // unhandled rejection from react-router 7's internal navigate cycle.
    scrubOAuthQuery();

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
