/**
 * Shell — composition of AppRail + Topbar + main slot.
 *
 * Composes the three shell components into the full application layout.
 * Uses <Outlet/> from react-router when no children are passed.
 *
 * API contract: packages/xai-web-shell/docs/api.md §2.1
 */

import { Outlet, useNavigate, useParams } from "react-router";
import { useWebShell } from "./registry.js";
import { AppRail } from "./AppRail.js";
import { Topbar } from "./Topbar.js";
import type { ShellProps } from "./types.js";
import { emitWebEvent } from "@repo/xai-web-event-bus";
import type { WebModuleId } from "@repo/core/types";

export function Shell({
  lang,
  setLang,
  theme,
  setTheme,
  density,
  setDensity,
  onOpenSearch,
  children,
  premiumBadge,
  appearanceStatus,
  railOrderStatus,
  onSignOut,
}: ShellProps) {
  const { railPos, petOn, setPetOn } = useWebShell();
  const navigate = useNavigate();
  const params = useParams();
  const activeModuleId = params.moduleId ?? null;

  const onModuleClick = (moduleId: string) => {
    emitWebEvent("web:shell:module-change", { moduleId: moduleId as WebModuleId, source: "app-rail" });
    void navigate(`/app/${moduleId}`);
  };

  const onOpenSettings = () => {
    emitWebEvent("web:shell:module-change", { moduleId: "settings" as WebModuleId, source: "shortcut" });
    void navigate("/app/settings");
  };

  // AvatarMenu shortcuts — must emit source="shortcut" (not "app-rail")
  // per api.md §3.2-§3.4 + AC-EMIT-4 + AC-EMIT-5 + dev_log Q3 resolution.
  const onAvatarOpenSettings = () => {
    emitWebEvent("web:shell:module-change", { moduleId: "settings" as WebModuleId, source: "shortcut" });
    void navigate("/app/settings");
  };

  const onAvatarOpenStatistics = () => {
    emitWebEvent("web:shell:module-change", { moduleId: "statistics" as WebModuleId, source: "shortcut" });
    void navigate("/app/statistics");
  };

  const onPetToggle = () => {
    const next = !petOn;
    setPetOn(next);
    emitWebEvent("web:shell:pet-toggle", { on: next, source: "rail-bottom" });
  };

  return (
    <div className="app" data-rail-pos={railPos}>
      <AppRail
        activeModuleId={activeModuleId}
        onModuleClick={onModuleClick}
        onPetToggle={onPetToggle}
        onAvatarOpenSettings={onAvatarOpenSettings}
        onAvatarOpenStatistics={onAvatarOpenStatistics}
        onSignOut={onSignOut}
      />
      <Topbar
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        density={density}
        setDensity={setDensity}
        onOpenSettings={onOpenSettings}
        onOpenSearch={onOpenSearch}
        premiumBadge={premiumBadge}
        appearanceStatus={appearanceStatus}
        railOrderStatus={railOrderStatus}
      />
      <main className="app-main">
        {children ?? <Outlet />}
      </main>
    </div>
  );
}
