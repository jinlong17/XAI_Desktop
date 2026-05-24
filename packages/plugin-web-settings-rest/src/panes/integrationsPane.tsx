/**
 * integrationsPane — Settings → Integrations & Import pane.
 *
 * 3 grouped sections × 17 placeholder cards.
 * Card click: DEV-only console.warn / PROD no-op. No event emit.
 *
 * Port of web design/module-settings.jsx lines 827-873.
 * API contract: packages/xai-web-settings-rest/docs/api.md §4.7 + §2.4
 */

import * as React from "react";
import type { Pane, PaneRenderProps } from "@repo/plugin-web-settings-shell";
import { useI18n } from "@repo/plugin-web-tokens";
import { localI18n } from "../internal/localI18n.js";
import type { IntegrationCardId } from "../types.js";

interface IntegrationCardSpec {
  readonly id: IntegrationCardId;
  readonly name: string;
  /** OKLCH or CSS color expression — no hex literals */
  readonly color: string;
  readonly short: string;
}

// Non-blocking O2 note: using OKLCH replacements for integration logo backgrounds
// that were originally hex in the source. The palette uses semantic approximations.
const FEATURED: readonly IntegrationCardSpec[] = [
  { id: "wechat",  name: "WeChat",          color: "oklch(55% 0.18 145)", short: "W" },
  { id: "gcal",    name: "Google Calendar", color: "oklch(55% 0.16 255)", short: "G" },
  { id: "notion",  name: "Notion",          color: "oklch(22% 0 0)",      short: "N" },
] as const;

const CALENDAR: readonly IntegrationCardSpec[] = [
  { id: "local",    name: "Local Calendars",   color: "oklch(60% 0.16 25)",  short: "L" },
  { id: "gcal",     name: "Google Calendar",   color: "oklch(55% 0.16 255)", short: "G" },
  { id: "outlook",  name: "Outlook Calendar",  color: "oklch(50% 0.14 260)", short: "O" },
  { id: "exchange", name: "Exchange Calendar", color: "oklch(48% 0.14 260)", short: "E" },
  { id: "icloud",   name: "iCloud Calendar",   color: "oklch(60% 0.10 230)", short: "i" },
  { id: "wecom",    name: "WeCom Calendar",    color: "oklch(55% 0.18 145)", short: "W" },
  { id: "dingtalk", name: "DingTalk Calendar", color: "oklch(55% 0.16 240)", short: "D" },
  { id: "feishu",   name: "Feishu Calendar",   color: "oklch(55% 0.16 255)", short: "F" },
  { id: "caldav",   name: "CalDAV",            color: "oklch(70% 0.14 60)",  short: "C" },
  { id: "url",      name: "URL",               color: "oklch(60% 0.16 245)", short: "U" },
] as const;

const INTEGRATE: readonly IntegrationCardSpec[] = [
  { id: "slack",   name: "Slack",            color: "oklch(35% 0.08 310)", short: "S" },
  { id: "linear",  name: "Linear",           color: "oklch(55% 0.12 265)", short: "L" },
  { id: "gh",      name: "GitHub",           color: "oklch(22% 0 0)",      short: "G" },
  { id: "todoist", name: "Todoist (Import)", color: "oklch(55% 0.18 25)",  short: "T" },
] as const;

interface IntegrationCardProps {
  readonly spec: IntegrationCardSpec;
}

function IntegrationCard({ spec }: IntegrationCardProps): React.ReactElement {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    // Placeholder cards — no event emit. No-op in production.
    e.preventDefault();
  };

  return (
    <button type="button" className="int-card" onClick={handleClick} aria-label={spec.name}>
      <span
        className="int-logo"
        style={{ background: spec.color }}
        aria-hidden="true"
      >
        {spec.short}
      </span>
      <span className="int-name">{spec.name}</span>
    </button>
  );
}

function IntegrationsPaneContent({ lang }: PaneRenderProps): React.ReactElement {
  const { s } = useI18n(lang);
  const t = localI18n(lang);

  return (
    <div className="int-pane">
      <h4 className="int-h">{t("int.featured")}</h4>
      <div className="int-grid">
        {FEATURED.map((spec) => (
          <IntegrationCard key={spec.id} spec={spec} />
        ))}
      </div>

      <h4 className="int-h">{t("int.calendar")}</h4>
      <div className="int-grid">
        {CALENDAR.map((spec) => (
          <IntegrationCard key={spec.id} spec={spec} />
        ))}
      </div>

      <h4 className="int-h">{t("int.integrate")}</h4>
      <div className="int-grid">
        {INTEGRATE.map((spec) => (
          <IntegrationCard key={spec.id} spec={spec} />
        ))}
      </div>

      {/* Suppress unused s variable warning */}
      {s("settings.integrations") && null}
    </div>
  );
}

export const integrationsPane: Pane = {
  id: "integrations",
  icon: "download",
  i18nKey: "settings.integrations",
  render: (props: PaneRenderProps): React.ReactElement => (
    <IntegrationsPaneContent {...props} />
  ),
};
