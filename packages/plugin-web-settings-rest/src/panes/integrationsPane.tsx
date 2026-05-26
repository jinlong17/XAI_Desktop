/**
 * integrationsPane — Settings → Integrations & Import pane.
 *
 * SHIPPED row #24: 17 placeholder cards in 3 groups (Featured/Calendar/Integrate).
 * Extension 2026-05-25 (gap-closure row #7): Adds "Connected providers" section
 * above the 3 groups for the 3 wired OAuth providers (Notion / GCal / Linear).
 *
 * Per Note 2 from feature-review: when a provider is in "Connected" state, its
 * placeholder card in the group grids is filtered out to avoid visual duplication.
 * The 14 unwired placeholder cards always remain as-is.
 *
 * Card click for PLACEHOLDER cards: DEV-only console.warn / PROD no-op. No event emit.
 *
 * Port of web design/module-settings.jsx lines 827-873.
 * API contract: packages/xai-web-settings-rest/docs/api.md §4.7 + §2.4 + §6 (P4)
 */

import * as React from "react";
import type { Pane, PaneRenderProps } from "@repo/plugin-web-settings-shell";
import { useI18n } from "@repo/plugin-web-tokens";
import { usePref } from "@repo/plugin-web-storage";
import { localI18n } from "../internal/localI18n.js";
import { PROVIDERS } from "../internal/integrationProviders.js";
import { IntegrationConnectButton } from "../internal/integrationConnectButton.js";
import { IntegrationDisconnectButton } from "../internal/integrationDisconnectButton.js";
import { IntegrationStubBanner } from "../internal/integrationStubBanner.js";
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

  // Per-provider connection state
  const [notionConnected, setNotionConnected] = usePref(
    "xai_pref_integrations_connected_notion",
  );
  const [gcalConnected, setGcalConnected] = usePref(
    "xai_pref_integrations_connected_gcal",
  );
  const [linearConnected, setLinearConnected] = usePref(
    "xai_pref_integrations_connected_linear",
  );

  // Map of providerId → connected state
  const connectedMap: Record<string, boolean> = {
    notion: notionConnected,
    gcal: gcalConnected,
    linear: linearConnected,
  };

  // Map of providerId → disconnect handler
  const disconnectHandlers: Record<string, () => void> = {
    notion: () => setNotionConnected(false),
    gcal: () => setGcalConnected(false),
    linear: () => setLinearConnected(false),
  };

  // Filter placeholder groups: hide wired-provider cards that are connected
  // (they appear in the "Connected providers" section instead)
  const connectedWiredIds = new Set<IntegrationCardId>(
    PROVIDERS.filter((p) => connectedMap[p.id]).map((p) => p.id),
  );
  const filterConnected = (spec: IntegrationCardSpec): boolean =>
    !connectedWiredIds.has(spec.id);

  const visibleFeatured = FEATURED.filter(filterConnected);
  // CALENDAR group has gcal but not the other wired providers — filter gcal when connected
  const visibleCalendar = CALENDAR.filter(filterConnected);
  const visibleIntegrate = INTEGRATE.filter(filterConnected);

  return (
    <div className="int-pane">
      {/* Stub disclosure banner — non-dismissible (FA-12) */}
      <IntegrationStubBanner lang={lang} />

      {/* Connected providers section */}
      <section className="int-connected-section" data-testid="int-connected-section">
        <h4 className="int-h">{t("int.section.connected")}</h4>
        <div className="int-connected-grid">
          {PROVIDERS.map((provider) => {
            const isConnected = connectedMap[provider.id] ?? false;
            return (
              <div key={provider.id} className="int-connected-card">
                <span
                  className="int-logo"
                  style={{ background: provider.cardColor }}
                  aria-hidden="true"
                >
                  {provider.cardShort}
                </span>
                <span className="int-name">{t(provider.nameKey)}</span>
                {isConnected && (
                  <span className="int-badge-connected">
                    {t("int.badge.connected_stub")}
                  </span>
                )}
                {isConnected ? (
                  <IntegrationDisconnectButton
                    provider={provider}
                    lang={lang}
                    onDisconnect={disconnectHandlers[provider.id]!}
                  />
                ) : (
                  <IntegrationConnectButton provider={provider} lang={lang} />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Existing 3 groups — placeholder cards (with deduplication for connected wired providers) */}
      <h4 className="int-h">{t("int.featured")}</h4>
      <div className="int-grid">
        {visibleFeatured.map((spec) => (
          <IntegrationCard key={spec.id + spec.name} spec={spec} />
        ))}
      </div>

      <h4 className="int-h">{t("int.calendar")}</h4>
      <div className="int-grid">
        {visibleCalendar.map((spec) => (
          <IntegrationCard key={spec.id + spec.name} spec={spec} />
        ))}
      </div>

      <h4 className="int-h">{t("int.integrate")}</h4>
      <div className="int-grid">
        {visibleIntegrate.map((spec) => (
          <IntegrationCard key={spec.id + spec.name} spec={spec} />
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
