/**
 * @internal — integrationDisconnectButton.tsx
 *
 * "Disconnect" button for a single OAuth provider.
 *
 * On click:
 *   1. Calls setPref(provider.prefKey, false) to flip the connection flag.
 *   2. Emits web:settings:integration-disconnected typed event.
 *
 * Note: In v1 stub mode, disconnecting only clears local state.
 * To revoke provider-side access, the user must visit the provider's account settings.
 *
 * Design home: packages/plugin-web-settings-rest/docs/design.md §Decision Headline
 * API contract: packages/plugin-web-settings-rest/docs/api.md §6 (P4 scope)
 */

import * as React from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import { emitWebEvent } from "@repo/xai-web-event-bus";
import { localI18n } from "./localI18n.js";
import type { IntegrationProvider } from "./integrationProviders.js";

interface IntegrationDisconnectButtonProps {
  readonly provider: IntegrationProvider;
  readonly lang: Lang;
  /** Called after pref is flipped, to trigger a re-render of the parent pane. */
  readonly onDisconnect: () => void;
}

export function IntegrationDisconnectButton({
  provider,
  lang,
  onDisconnect,
}: IntegrationDisconnectButtonProps): React.ReactElement {
  const t = localI18n(lang);

  const handleDisconnect = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    onDisconnect();
    emitWebEvent("web:settings:integration-disconnected", {
      providerId: provider.id,
      disconnectedAt: new Date().toISOString(),
    });
  };

  return (
    <button
      type="button"
      className="int-disconnect-btn"
      onClick={handleDisconnect}
      title={t("int.disconnect.tooltip")}
      aria-label={`${t("int.btn.disconnect")} ${t(provider.nameKey)}`}
    >
      {t("int.btn.disconnect")}
    </button>
  );
}
