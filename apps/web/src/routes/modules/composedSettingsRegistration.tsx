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
import { useBlocker, useNavigate, useParams, useLocation } from "react-router";
import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";
import { useWebShell } from "@repo/xai-web-shell";
import { SectionBlock } from "@repo/plugin-web-settings-shell";
import type { Pane, PaneDepartureGuard, SettingsPaneId } from "@repo/plugin-web-settings-shell";
import { useI18n } from "@repo/plugin-web-tokens";
import { composeSettingsPaneRegistry } from "./settingsPaneComposition.js";
import { registerSettingsDepartureDelegate } from "./settingsDeparture.js";

// ---- ComposedSettingsModule -------------------------------------------------

/**
 * Resolve the URL splat (e.g. "ai", "integrations", "premium", or "") to a
 * registered pane id. Falls back to "account" when the splat is missing or
 * doesn't match any composed pane.
 *
 * CODEX C3-CHROME-1 cycle 2 (2026-05-26): the prior fix landed in
 * `packages/plugin-web-settings-shell/src/SettingsModule.tsx` but the live
 * `apps/web` route mounts THIS component (`ComposedSettingsModule`) which
 * had its own `useState("account")` and ignored the URL. Both layers now
 * read the splat.
 */
function resolveInitialPane(
  urlSplat: string | undefined,
  composed: readonly Pane[],
): SettingsPaneId {
  if (!urlSplat) return "account";
  const candidate = urlSplat.toLowerCase().split("/")[0] ?? "";
  const match = composed.find((p) => p.id === candidate);
  return match ? match.id : "account";
}

/** Same UX as settings-shell's SettingsModule but reads the composed registry. */
function ComposedSettingsModule(): React.ReactElement {
  const { lang } = useWebShell();
  const composed = React.useMemo(() => composeSettingsPaneRegistry(), []);
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const urlSplat = params["*"];

  const active = resolveInitialPane(urlSplat, composed);
  const guardRef = React.useRef<PaneDepartureGuard | null>(null);
  const [guardVersion, setGuardVersion] = React.useState(0);
  const registerDepartureGuard = React.useCallback((guard: PaneDepartureGuard) => {
    guardRef.current = guard;
    setGuardVersion(version => version + 1);
    return () => {
      if (guardRef.current?.token === guard.token) {
        guardRef.current = null;
        setGuardVersion(version => version + 1);
      }
    };
  }, []);
  const canBlock = React.useCallback(() => {
    const guard = guardRef.current;
    return Boolean(guard && guard.isCurrent() && guard.isBlocking());
  }, []);
  const blocker = useBlocker(({ currentLocation, nextLocation }) =>
    currentLocation.pathname !== nextLocation.pathname && canBlock(),
  );
  const [signOutDecision, setSignOutDecision] = React.useState<((allow: boolean) => void) | null>(null);

  // State → URL sync (sidebar click). Default "account" maps to clean
  // `/app/settings` (no splat) so the landing URL stays shareable.
  const handleSelect = React.useCallback(
    (next: SettingsPaneId) => {
      const targetPath =
        next === "account" ? "/app/settings" : `/app/settings/${next}`;
      if (location.pathname !== targetPath) {
        navigate(targetPath, { replace: false });
      }
    },
    [location.pathname, navigate],
  );

  React.useEffect(() => registerSettingsDepartureDelegate({
    requestDeparture: () => {
      if (!canBlock()) return Promise.resolve(true);
      return new Promise(resolve => setSignOutDecision(() => resolve));
    },
  }), [canBlock]);
  React.useEffect(() => {
    if (blocker.state === "blocked" && !canBlock()) blocker.proceed();
  }, [blocker, canBlock, guardVersion]);
  const stay = React.useCallback(() => {
    if (blocker.state === "blocked") blocker.reset();
    if (signOutDecision) signOutDecision(false);
    setSignOutDecision(null);
  }, [blocker, signOutDecision]);
  const exportCurrentDraft = React.useCallback(() => guardRef.current?.exportDraft(), []);
  const discardAndLeave = React.useCallback(() => {
    const guard = guardRef.current;
    if (!guard || !guard.isCurrent()) { stay(); return; }
    guard.discardDraft();
    if (blocker.state === "blocked") blocker.proceed();
    if (signOutDecision) signOutDecision(true);
    setSignOutDecision(null);
  }, [blocker, signOutDecision, stay]);

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
                onClick={() => handleSelect(p.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelect(p.id);
                  }
                }}
              >
                <span className="grow">{s(p.i18nKey)}</span>
              </div>
            ))}
          </SectionBlock>
        </aside>
        <section className="settings-detail" data-pane={activePane.id}>
          {activePane.render({ lang, registerDepartureGuard })}
        </section>
        {(blocker.state === "blocked" || signOutDecision) && (
          <div className="settings-departure-dialog" role="dialog" aria-modal="true" aria-label="Unsaved Smart Lists draft" onKeyDown={event => { if (event.key === "Escape") stay(); }} tabIndex={-1}>
            <p>Smart Lists has unsaved changes.</p>
            <button type="button" onClick={stay}>Stay</button>
            <button type="button" onClick={exportCurrentDraft}>Export current draft</button>
            <button type="button" onClick={discardAndLeave}>Discard local changes and leave</button>
          </div>
        )}
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
