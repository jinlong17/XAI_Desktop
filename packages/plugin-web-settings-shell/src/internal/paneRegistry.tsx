/**
 * @internal — paneRegistry.tsx
 *
 * Canonical 13-pane registry. Each pane has a placeholder `render` that
 * sibling rows (#22 / #23 / #24) REPLACE by composing a new array via the
 * pattern documented in api.md §8.
 *
 * Order matches `web design/module-settings.jsx` lines 27-50 and
 * DESIGN.md §4.12.
 *
 * API contract: packages/xai-web-settings-shell/docs/api.md §5.2
 */

import * as React from "react";
import type { Pane, PaneRenderProps, SettingsPaneId } from "../types.js";
import type { WebShellIconName } from "@repo/xai-web-shell";

function placeholderRender({ lang }: PaneRenderProps): React.ReactElement {
  return (
    <div className="pane-placeholder">
      {lang === "zh"
        ? "此设置面板暂未开放。"
        : "This pane is not yet available."}
    </div>
  );
}

/**
 * Helper to construct a placeholder Pane object.
 *
 * Sibling rows substitute this entry with their own `Pane` whose `render`
 * returns real content.
 */
function placeholderPane(
  id: SettingsPaneId,
  icon: WebShellIconName,
  i18nKey: `settings.${string}`,
): Pane {
  return { id, icon, i18nKey, render: placeholderRender };
}

/**
 * Default 13-pane registry. Order is significant — matches the source layout.
 */
export const paneRegistry: readonly Pane[] = [
  // Group 1: account, premium
  placeholderPane("account",       "sliders",  "settings.account"),
  placeholderPane("premium",       "star",     "settings.premium"),

  // Group 2: features, smart_lists, notifications, date_time, appearance, more
  placeholderPane("features",      "sliders",  "settings.features"),
  placeholderPane("smart_lists",   "sparkle",  "settings.smart_lists"),
  placeholderPane("notifications", "bell",     "settings.notifications"),
  placeholderPane("date_time",     "timer",    "settings.date_time"),
  placeholderPane("appearance",    "sun",      "settings.appearance"),
  placeholderPane("ai",            "sparkle",  "settings.ai"),
  placeholderPane("more",          "help",     "settings.more"),

  // Group 3: integrations, collaborate, sticky, hotkeys
  placeholderPane("integrations",  "download", "settings.integrations"),
  placeholderPane("collaborate",   "sliders",  "settings.collaborate"),
  placeholderPane("sticky",        "pin",      "settings.sticky"),
  placeholderPane("hotkeys",       "search",   "settings.hotkeys"),

  // Group 4: about
  placeholderPane("about",         "help",     "settings.about"),
] as const;
