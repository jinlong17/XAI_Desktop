/**
 * @internal — restPanesById.ts
 *
 * Aggregate map of all 12 panes this row owns, keyed by SettingsPaneId.
 * Exported via public surface (src/index.ts) per api.md §1.4.
 *
 * Phase P1: 5 panes (account, premium, collaborate, hotkeys, about).
 * Phase P2: + smartLists, notifications, dateTime, more, integrations.
 * Phase P3: + sticky (11 original panes).
 * Extension 2026-05-25: + ai (12 total, gap-closure row #2).
 *
 * API contract: packages/xai-web-settings-rest/docs/api.md §1.4
 */

import type { Pane } from "@repo/plugin-web-settings-shell";
import { accountPane } from "../panes/accountPane.js";
import { premiumPane } from "../panes/premiumPane.js";
import { collaboratePane } from "../panes/collaboratePane.js";
import { hotkeysPane } from "../panes/hotkeysPane.js";
import { aboutPane } from "../panes/aboutPane.js";
import { smartListsPane } from "../panes/smartListsPane.js";
import { notificationsPane } from "../panes/notificationsPane.js";
import { dateTimePane } from "../panes/dateTimePane.js";
import { morePane } from "../panes/morePane.js";
import { integrationsPane } from "../panes/integrationsPane.js";
import { stickyPane } from "../panes/stickyPane.js";
import { aiPane } from "../panes/aiPane.js";

export const restPanesById: Readonly<
  Record<
    | "account"
    | "premium"
    | "smart_lists"
    | "notifications"
    | "date_time"
    | "more"
    | "integrations"
    | "collaborate"
    | "sticky"
    | "hotkeys"
    | "about"
    | "ai",
    Pane
  >
> = {
  account: accountPane,
  premium: premiumPane,
  smart_lists: smartListsPane,
  notifications: notificationsPane,
  date_time: dateTimePane,
  more: morePane,
  integrations: integrationsPane,
  collaborate: collaboratePane,
  sticky: stickyPane,
  hotkeys: hotkeysPane,
  about: aboutPane,
  ai: aiPane,
} as const;
