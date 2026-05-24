/**
 * premiumPane — Settings → Premium pane.
 *
 * Static render with emblem, bilingual headline, body, and Upgrade CTA (no-op v1).
 *
 * Port of web design/module-settings.jsx lines 136-151.
 * API contract: packages/xai-web-settings-rest/docs/api.md §4.2
 */

import * as React from "react";
import type { Pane, PaneRenderProps } from "@repo/plugin-web-settings-shell";
import { useI18n } from "@repo/plugin-web-tokens";
import { localI18n } from "../internal/localI18n.js";

function PremiumPaneContent({ lang }: PaneRenderProps): React.ReactElement {
  const { s } = useI18n(lang);
  const t = localI18n(lang);

  return (
    <div className="premium-pane">
      <h3 className="pane-title">{s("settings.premium")}</h3>
      <div className="premium-card">
        <div className="premium-emblem" aria-hidden="true">
          <svg viewBox="0 0 26 26" width="26" height="26" fill="currentColor">
            <path d="M13 2l2.9 6.3 6.8.9-5 4.7 1.3 6.8L13 17.7l-6 3.3 1.3-6.8-5-4.7 6.8-.9z" />
          </svg>
        </div>
        <h4>{t("premium.headline_en")}</h4>
        <p>{t("premium.body_en")}</p>
        <button
          type="button"
          className="btn primary"
          style={{ height: 36, padding: "0 22px" }}
        >
          {s("settings.upgrade_now")}
        </button>
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
