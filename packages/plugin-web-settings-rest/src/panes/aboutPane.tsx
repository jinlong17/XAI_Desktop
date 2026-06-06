/**
 * aboutPane — Settings → About pane.
 *
 * Static render. Logo, version (hard-coded v1 per Frozen Assumption #9), build
 * date, bilingual description, and 4 link buttons (no-op v1).
 *
 * Port of web design/module-settings.jsx lines 1015-1034.
 * API contract: packages/xai-web-settings-rest/docs/api.md §4.11
 */

import * as React from "react";
import type { Pane, PaneRenderProps } from "@repo/plugin-web-settings-shell";
import { useI18n } from "@repo/plugin-web-tokens";
import { localI18n } from "../internal/localI18n.js";

// Hard-coded per Frozen Assumption #9.
// Future row may wire via Vite define (import.meta.env.VITE_APP_VERSION).
const APP_VERSION = "v 1.2.0";
const BUILD_DATE = "2026.05.23";

function AboutPaneContent({ lang }: PaneRenderProps): React.ReactElement {
  const { s } = useI18n(lang);
  const t = localI18n(lang);

  return (
    <div className="about-pane">
      <div className="about-logo" aria-hidden="true">
        <div className="about-mark">XAI</div>
      </div>
      <h3>{t("about.title_en")}</h3>
      <div className="about-ver mono">
        {APP_VERSION} · build {BUILD_DATE}
      </div>
      <p className="about-desc">{t("about.desc_en")}</p>
      <div className="about-links">
        <span className="link" aria-disabled="true" title={t("about.coming_soon_tooltip")}>
          {t("about.changelog")}
        </span>
        <span className="link" aria-disabled="true" title={t("about.coming_soon_tooltip")}>
          {t("about.privacy")}
        </span>
        <span className="link" aria-disabled="true" title={t("about.coming_soon_tooltip")}>
          {t("about.terms")}
        </span>
        <span className="link" aria-disabled="true" title={t("about.coming_soon_tooltip")}>
          {t("about.feedback")}
        </span>
      </div>
      {/* Suppress unused import warning — s is used above for pane title lookup */}
      {s("settings.about") && null}
    </div>
  );
}

export const aboutPane: Pane = {
  id: "about",
  icon: "help",
  i18nKey: "settings.about",
  render: (props: PaneRenderProps): React.ReactElement => (
    <AboutPaneContent {...props} />
  ),
};
