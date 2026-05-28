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
import {
  useDesktopUpdaterActions,
  useDesktopUpdaterSnapshot,
} from "@repo/desktop-auto-update-release-channel/web";
import { localI18n } from "../internal/localI18n.js";

// Hard-coded per Frozen Assumption #9.
// Future row may wire via Vite define (import.meta.env.VITE_APP_VERSION).
const APP_VERSION = "v 1.2.0";
const BUILD_DATE = "2026.05.23";

function AboutPaneContent({ lang }: PaneRenderProps): React.ReactElement {
  const { s } = useI18n(lang);
  const t = localI18n(lang);
  const updaterSnapshot = useDesktopUpdaterSnapshot();
  const { check } = useDesktopUpdaterActions();

  const canCheck = updaterSnapshot.availability !== "disabled" && updaterSnapshot.availability !== "checking";
  const statusText = t(`about.updaterAvailability.${updaterSnapshot.availability}`);
  const reasonText = updaterSnapshot.reasonCode
    ? t(`about.updaterReason.${updaterSnapshot.reasonCode}`)
    : "";

  const checkLabel = updaterSnapshot.availability === "checking"
    ? t("about.updaterAction.checking")
    : t("about.updaterAction.check");

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
        <a className="link" role="button" tabIndex={0} aria-label={t("about.changelog")}>
          {t("about.changelog")}
        </a>
        <a className="link" role="button" tabIndex={0} aria-label={t("about.privacy")}>
          {t("about.privacy")}
        </a>
        <a className="link" role="button" tabIndex={0} aria-label={t("about.terms")}>
          {t("about.terms")}
        </a>
        <a className="link" role="button" tabIndex={0} aria-label={t("about.feedback")}>
          {t("about.feedback")}
        </a>
      </div>

      <section className="about-updater" aria-label={t("about.updaterTitle")}>
        <h4>{t("about.updaterTitle")}</h4>
        <div className="about-updater-grid">
          <div className="about-updater-row">
            <span>{t("about.updaterStatus")}</span>
            <strong>{statusText}</strong>
          </div>
          <div className="about-updater-row">
            <span>{t("about.updaterChannel")}</span>
            <strong>{updaterSnapshot.channel}</strong>
          </div>
          {reasonText ? (
            <div className="about-updater-row">
              <span>{t("about.updaterReason")}</span>
              <strong>{reasonText}</strong>
            </div>
          ) : null}
          {updaterSnapshot.updateVersion ? (
            <div className="about-updater-row">
              <span>{t("about.updaterVersion")}</span>
              <strong>{updaterSnapshot.updateVersion}</strong>
            </div>
          ) : null}
        </div>
        <button
          className="btn"
          type="button"
          disabled={!canCheck}
          onClick={() => {
            if (!canCheck) {
              return;
            }
            void check();
          }}
        >
          {canCheck ? checkLabel : t("about.updaterAction.unavailable")}
        </button>
        {updaterSnapshot.availability === "update-available"
          && updaterSnapshot.reasonCode === "install_unavailable" ? (
            <p className="about-updater-note">{t("about.installUnavailable")}</p>
          ) : null}
      </section>

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
