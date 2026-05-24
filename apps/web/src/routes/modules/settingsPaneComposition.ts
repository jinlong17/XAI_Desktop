/**
 * settingsPaneComposition.ts — composes the 13-pane Settings registry by
 * substituting concrete sibling-row panes in place of the placeholder entries
 * exported by `@repo/plugin-web-settings-shell`.
 *
 * Owner: row #23 (xai-web-settings-features-panel) created this file. Sibling
 * rows #22 (xai-web-settings-appearance) and #24 (xai-web-settings-rest) extend
 * the switch below with their own panes — each branch is line-disjoint.
 *
 * Pattern documented in:
 *   packages/xai-web-settings-shell/docs/api.md §8
 *   packages/xai-web-settings-features-panel/docs/api.md §3
 */

import type { Pane } from "@repo/plugin-web-settings-shell";
import { paneRegistry } from "@repo/plugin-web-settings-shell";
// xai-web-settings-features-panel #23
import { featuresPane } from "@repo/plugin-web-settings-features-panel";
// xai-web-settings-rest #24 — 11 remaining panes (line-disjoint with row #22)
import {
  accountPane,
  premiumPane,
  smartListsPane,
  notificationsPane,
  dateTimePane,
  morePane,
  integrationsPane,
  collaboratePane,
  stickyPane,
  hotkeysPane,
  aboutPane,
} from "@repo/plugin-web-settings-rest";
// Sibling rows add their own imports BELOW this comment line — each row adds
// exactly one import + one switch case. Do NOT inline a multi-import here.

/**
 * Returns the composed registry. Always has the same length and entry order
 * as the upstream `paneRegistry` (currently 13). Each substitution preserves
 * the slot's `id` so SettingsSidebar / SettingsModule continue to find it.
 */
export function composeSettingsPaneRegistry(): readonly Pane[] {
  return paneRegistry.map((p) => {
    if (p.id === "features") return featuresPane;
    // ---- xai-web-settings-rest row #24 (line-disjoint with row #22) ----
    if (p.id === "account")       return accountPane;
    if (p.id === "premium")       return premiumPane;
    if (p.id === "smart_lists")   return smartListsPane;
    if (p.id === "notifications") return notificationsPane;
    if (p.id === "date_time")     return dateTimePane;
    if (p.id === "more")          return morePane;
    if (p.id === "integrations")  return integrationsPane;
    if (p.id === "collaborate")   return collaboratePane;
    if (p.id === "sticky")        return stickyPane;
    if (p.id === "hotkeys")       return hotkeysPane;
    if (p.id === "about")         return aboutPane;
    // ---- xai-web-settings-appearance row #22 will add `appearance` here ----
    return p;
  });
}
