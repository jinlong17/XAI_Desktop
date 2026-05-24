/**
 * composedSettingsRegistration.tsx — host-side replacement for
 * `settingsShellWebModuleRegistration` that mounts SettingsModule with the
 * composed pane registry from `settingsPaneComposition.ts`.
 *
 * Owner: row #23 (xai-web-settings-features-panel) created this file. Sibling
 * rows #22 / #24 may extend the composition function (NOT this file) — this
 * file is the single seam between the chassis and the host route table.
 *
 * The wrapper is a thin re-implementation of `SettingsModule` from
 * @repo/plugin-web-settings-shell that uses our composed pane registry
 * instead of the chassis-default placeholder one. Sidebar + Detail layout is
 * unchanged.
 */

import * as React from "react";
import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";
import { useWebShell } from "@repo/xai-web-shell";
import { SectionBlock } from "@repo/plugin-web-settings-shell";
import type { Pane, SettingsPaneId } from "@repo/plugin-web-settings-shell";
import { useI18n } from "@repo/plugin-web-tokens";
import { composeSettingsPaneRegistry } from "./settingsPaneComposition.js";

// ---- ComposedSettingsModule -------------------------------------------------

/** Same UX as settings-shell's SettingsModule but reads the composed registry. */
function ComposedSettingsModule(): React.ReactElement {
  const { lang } = useWebShell();
  const composed = React.useMemo(() => composeSettingsPaneRegistry(), []);
  const [active, setActive] = React.useState<SettingsPaneId>("account");
  const activePane = composed.find((p) => p.id === active) ?? composed[0]!;
  const { s } = useI18n(lang);

  return (
    <div className="module module-settings">
      <div className="settings-shell panel">
        <aside className="settings-sidebar">
          <h2 className="settings-h">{s("settings.title")}</h2>
          <SectionBlock>
            {composed.map((p) => (
              <div
                key={p.id}
                className="list-row"
                data-active={active === p.id ? "true" : "false"}
                role="button"
                tabIndex={0}
                onClick={() => setActive(p.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActive(p.id);
                  }
                }}
              >
                <span className="grow">{s(p.i18nKey)}</span>
              </div>
            ))}
          </SectionBlock>
        </aside>
        <section className="settings-detail" data-pane={activePane.id}>
          {activePane.render({ lang })}
        </section>
      </div>
    </div>
  );
}

/**
 * Host-side replacement for `settingsShellWebModuleRegistration` whose
 * children render the composed paneRegistry. `showInRail` stays `false` —
 * Settings remains reachable only via Topbar / AvatarMenu.
 */
export const composedSettingsRegistration: WebModuleSlotRegistration = {
  moduleId: "settings",
  label: "Settings",
  defaultChildPath: "",
  children: [
    { path: "",  render: ComposedSettingsModule },
    { path: "*", render: ComposedSettingsModule },
  ],
  icon: "sliders",
  railOrder: 99,
  i18nKey: "nav.settings",
  showInRail: false,
};

// Mark Pane import usage so eslint does not complain about unused type imports.
export type { Pane };
