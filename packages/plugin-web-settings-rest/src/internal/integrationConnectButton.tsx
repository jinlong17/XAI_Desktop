/**
 * @internal — integrationConnectButton.tsx
 *
 * "Connect" button for a single OAuth provider.
 *
 * On click:
 *   1. Calls startOAuth(provider.id) to write sessionStorage + generate state.
 *   2. Calls buildAuthorizeUrl(provider, pendingState) to get the full URL.
 *   3. Calls window.location.assign(url) — same-tab navigation (FA-6).
 *
 * SECURITY INVARIANTS:
 *   - NEVER uses Math.random.
 *   - NEVER writes localStorage (sessionStorage only via startOAuth).
 *
 * Design home: packages/plugin-web-settings-rest/docs/design.md §FA-6
 * API contract: packages/plugin-web-settings-rest/docs/api.md §6 (P2 scope)
 */

import * as React from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import { localI18n } from "./localI18n.js";
import type { IntegrationProvider } from "./integrationProviders.js";
import { startOAuth } from "./oauthState.js";
import { buildAuthorizeUrl } from "./buildAuthorizeUrl.js";

interface IntegrationConnectButtonProps {
  readonly provider: IntegrationProvider;
  readonly lang: Lang;
}

export function IntegrationConnectButton({
  provider,
  lang,
}: IntegrationConnectButtonProps): React.ReactElement {
  const t = localI18n(lang);

  const handleConnect = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ): Promise<void> => {
    e.preventDefault();
    try {
      const pendingState = await startOAuth(provider.id);
      const url = await buildAuthorizeUrl(provider, pendingState);
      window.location.assign(url);
    } catch {
      // Silent failure in stub mode — connect attempt failed; no UX needed here.
    }
  };

  return (
    <button
      type="button"
      className="int-connect-btn"
      onClick={(e) => { void handleConnect(e); }}
      aria-label={`${t("int.btn.connect")} ${t(provider.nameKey)}`}
    >
      {t("int.btn.connect")}
    </button>
  );
}
