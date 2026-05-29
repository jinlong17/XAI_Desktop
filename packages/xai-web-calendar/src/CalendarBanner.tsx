/**
 * CalendarBanner — sample-data banner at the bottom of the module.
 *
 * Matches prototype `.cal-banner` block (module-calendar.jsx:80-84).
 */

import type { JSX } from "react";
import type { I18NBundle, Lang } from "@repo/plugin-web-tokens";
import { CalIcon } from "./internal/icons.js";
import type { CalendarProviderSyncStatus } from "./internal/providerSyncStatus.js";

interface CalendarBannerProps {
  t: I18NBundle;
  lang: Lang;
  providerStatus: CalendarProviderSyncStatus;
}

function providerStatusCopy(
  status: CalendarProviderSyncStatus,
  t: I18NBundle,
  lang: Lang,
): string {
  const zh = lang === "zh";
  if (status === "provider-offline") {
    return zh
      ? "本地日历可用，第三方同步离线"
      : "Local calendar is available, provider sync is offline";
  }
  if (status === "provider-needs-reconnect") {
    return zh
      ? "本地日历可用，第三方同步需重连后刷新"
      : "Local calendar is available, provider sync will refresh after reconnect";
  }
  if (status === "provider-auth-required") {
    return zh
      ? "本地日历可用，第三方同步需要重新授权"
      : "Local calendar is available, provider sync requires re-auth";
  }
  if (status === "provider-transport-unavailable") {
    return zh
      ? "本地日历可用，第三方同步通道不可用"
      : "Local calendar is available, provider sync transport is unavailable";
  }
  if (status === "provider-sync-failed") {
    return zh
      ? "本地日历可用，第三方同步上次失败"
      : "Local calendar is available, last provider sync failed";
  }
  return zh
    ? "本地日历可用"
    : "Local calendar is available";
}

export function CalendarBanner({
  t,
  lang,
  providerStatus,
}: CalendarBannerProps): JSX.Element {
  const providerCopy = providerStatusCopy(providerStatus, t, lang);
  return (
    <div className="cal-banner">
      <CalIcon name="star" size={14} />
      <span>{t.cal.sample_banner}</span>
      <span className="cal-provider-status">{providerCopy}</span>
      <button type="button" className="banner-upgrade">
        {t.common.upgrade} <CalIcon name="chevR" size={12} />
      </button>
    </div>
  );
}
