/**
 * <SettingsModule lang> — outer chassis for the Settings module.
 *
 * Owns `useState<SettingsPaneId>("account")`. Renders sidebar + detail.
 * The 13-pane registry is the default placeholder set; sibling rows
 * #22 / #23 / #24 will substitute entries via the composition pattern
 * documented in api.md §8.
 *
 * Port of web design/module-settings.jsx lines 23-100 (SettingsModule).
 *
 * API contract: packages/xai-web-settings-shell/docs/api.md §2.1
 */

import * as React from "react";
import { useState } from "react";
import type { SettingsModuleProps, SettingsPaneId } from "./types.js";
import { paneRegistry } from "./internal/paneRegistry.js";
import { SettingsSidebar } from "./internal/SettingsSidebar.js";
import { SettingsDetail } from "./internal/SettingsDetail.js";

export function SettingsModule({ lang }: SettingsModuleProps): React.ReactElement {
  const [active, setActive] = useState<SettingsPaneId>("account");

  const activePane =
    paneRegistry.find((p) => p.id === active) ?? paneRegistry[0]!;

  return (
    <div className="module module-settings">
      <div className="settings-shell panel">
        <SettingsSidebar
          lang={lang}
          panes={paneRegistry}
          active={active}
          onSelect={setActive}
        />
        <SettingsDetail lang={lang} active={activePane} />
      </div>
    </div>
  );
}
