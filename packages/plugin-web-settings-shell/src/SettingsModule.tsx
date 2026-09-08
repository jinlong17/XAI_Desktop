/**
 * <SettingsModule lang> — outer chassis for the Settings module.
 *
 * Owns `useState<SettingsPaneId>(initial)`. Renders sidebar + detail.
 * The 13-pane registry is the default placeholder set; sibling rows
 * #22 / #23 / #24 substitute entries via the composition pattern
 * documented in api.md §8.
 *
 * Port of web design/module-settings.jsx lines 23-100 (SettingsModule).
 *
 * CODEX C3-CHROME-1 (2026-05-26): deep-link support. `/app/settings/<id>`
 * URL splat is read at mount + on navigation to pre-select the requested
 * pane. Sidebar clicks also update the URL via navigate(). Falls back to
 * "account" when the splat is missing or doesn't match a known pane id.
 *
 * API contract: packages/xai-web-settings-shell/docs/api.md §2.1
 */

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import type { SettingsModuleProps, SettingsPaneId } from "./types.js";
import { paneRegistry } from "./internal/paneRegistry.js";
import { SettingsSidebar } from "./internal/SettingsSidebar.js";
import { SettingsDetail } from "./internal/SettingsDetail.js";

/** All 13 valid pane ids — derived from paneRegistry to stay in sync. */
const VALID_PANE_IDS: ReadonlySet<SettingsPaneId> = new Set(
  paneRegistry.map((p) => p.id),
);

/**
 * Parse the URL splat (e.g. `"ai"`, `"integrations"`, `"premium"`, or `""`)
 * into a known SettingsPaneId. Defaults to "account" when the splat is
 * empty, missing, or doesn't match a registered pane.
 */
function resolveInitialPane(urlSplat: string | undefined): SettingsPaneId {
  if (!urlSplat) return "account";
  const candidate = urlSplat.toLowerCase().split("/")[0] ?? "";
  if (VALID_PANE_IDS.has(candidate as SettingsPaneId)) {
    return candidate as SettingsPaneId;
  }
  return "account";
}

export function SettingsModule({ lang }: SettingsModuleProps): React.ReactElement {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const urlSplat = params["*"];

  const [active, setActive] = useState<SettingsPaneId>(() => resolveInitialPane(urlSplat));

  // Sync URL → state when the splat changes (browser back/forward, deep link
  // navigation, programmatic navigate). Avoids feedback loops by comparing
  // the resolved pane against current `active`.
  useEffect(() => {
    const next = resolveInitialPane(urlSplat);
    if (next !== active) {
      setActive(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSplat]);

  // Sync state → URL when the user clicks a sidebar entry. Default pane
  // "account" maps to `/app/settings` (no trailing splat); all others get
  // `/app/settings/<id>` so deep links remain copy-pasteable.
  const handleSelect = useCallback(
    (next: SettingsPaneId) => {
      setActive(next);
      const targetPath =
        next === "account" ? "/app/settings" : `/app/settings/${next}`;
      if (location.pathname !== targetPath) {
        navigate(targetPath, { replace: false });
      }
    },
    [location.pathname, navigate],
  );

  const activePane =
    paneRegistry.find((p) => p.id === active) ?? paneRegistry[0]!;

  return (
    <div className="module module-settings">
      <div className="settings-shell panel">
        <SettingsSidebar
          lang={lang}
          panes={paneRegistry}
          active={active}
          onSelect={handleSelect}
        />
        <SettingsDetail lang={lang} active={activePane} />
      </div>
    </div>
  );
}
