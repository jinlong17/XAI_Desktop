/**
 * AppRail — 4 rail positions + drag-reorder + module buttons + bottom buttons.
 *
 * Port of web design/shell.jsx lines 69-166.
 * Reads state from useWebShell() + useWebModuleRegistry().
 * Persists rail order via usePref("xai_rail_order") from @repo/plugin-web-storage.
 *
 * API contract: packages/xai-web-shell/docs/api.md §2.2
 */

import { useState } from "react";
import { useI18n } from "@repo/plugin-web-tokens";
import { usePref } from "@repo/plugin-web-storage";
import type { ConsoleModuleId } from "@repo/core/types";
import { AvatarMenu } from "./AvatarMenu.js";
import { Icon } from "./icons.js";
import { reorderArray } from "./internal/dnd.js";
import { useWebShell, useWebModuleRegistry } from "./registry.js";
import type { AppRailProps, WebModuleSlotRegistration, WebShellIconName } from "./types.js";

// ---- Bottom-row button definition -----------------------------------------

interface BottomButton {
  id: string;
  icon: WebShellIconName;
  action?: () => void;
}

// ---- AppRail component -----------------------------------------------------

export function AppRail({ activeModuleId, onModuleClick, onPetToggle, onAvatarOpenSettings, onAvatarOpenStatistics, onSignOut }: AppRailProps) {
  const { lang, railPos, petOn } = useWebShell();
  const { t } = useI18n(lang);
  const registryModules = useWebModuleRegistry();

  // Persist rail order via @repo/plugin-web-storage
  const [prefOrder, setPrefOrder] = usePref("xai_rail_order");

  // Reconcile prefOrder against registry:
  // 1. filter any ids in prefOrder not in the registry
  // 2. append any registry ids missing from prefOrder
  const registryIds = new Set(registryModules.map((m: WebModuleSlotRegistration) => m.moduleId));
  const validOrder: ConsoleModuleId[] = [];
  const seenIds = new Set<string>();

  for (const id of prefOrder) {
    if (registryIds.has(id)) {
      validOrder.push(id);
      seenIds.add(id);
    } else if (
      typeof import.meta !== "undefined" &&
      (import.meta as { env?: { DEV?: boolean } }).env?.DEV
    ) {
      console.warn(`[xai-web-shell] xai_rail_order contains unknown id "${id}" — filtered out`);
    }
  }
  // Append any registry modules not in the persisted order
  for (const m of registryModules) {
    if (!seenIds.has(m.moduleId)) {
      validOrder.push(m.moduleId);
    }
  }

  // Map ordered ids back to full module objects
  const moduleMap = new Map<string, WebModuleSlotRegistration>(
    registryModules.map((m: WebModuleSlotRegistration) => [m.moduleId, m]),
  );
  const orderedModules: WebModuleSlotRegistration[] = validOrder
    .map((id) => moduleMap.get(id))
    .filter((m): m is WebModuleSlotRegistration => m !== undefined);

  // ---- Drag-reorder (HTML5 DnD) --------------------------------------------
  const [dragId, setDragId] = useState<string | null>(null);

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = "move";
    try {
      e.dataTransfer.setData("text/plain", id);
    } catch {
      // Some sandboxed iframes block setData; drag still works via dragId state
    }
    setDragId(id);
  };

  const onDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (!dragId || dragId === id) return;
    const nextOrder = reorderArray(validOrder, dragId, id);
    setPrefOrder(nextOrder as typeof prefOrder);
  };

  const onDragEnd = () => setDragId(null);

  // ---- Avatar menu state ---------------------------------------------------
  const [avatarOpen, setAvatarOpen] = useState(false);

  // ---- Bottom buttons ------------------------------------------------------
  // Rail-05/06/07 fix: sync/notif/help have no real action (onClick=undefined).
  // HIDE them rather than render as no-op clickable buttons.
  // Pet button is retained — it has a real onPetToggle action.
  const bottomButtons: BottomButton[] = [
    {
      id: "pet",
      icon: "paw",
      action: () => {
        onPetToggle();
      },
    },
  ];

  const navLabels = t.nav;

  return (
    <aside className="app-rail" data-pos={railPos}>
      {/* Avatar area */}
      <div className="rail-avatar-wrap">
        <button
          type="button"
          className="rail-avatar"
          onClick={() => setAvatarOpen((v) => !v)}
        >
          <div className="avatar-img">
            <svg viewBox="0 0 40 40" width="36" height="36">
              <defs>
                <linearGradient id="avg" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0" stopColor="#d8c8b7" />
                  <stop offset="1" stopColor="#a08877" />
                </linearGradient>
              </defs>
              <rect width="40" height="40" fill="url(#avg)" />
              <circle cx="20" cy="16" r="6" fill="#fff" opacity=".7" />
              <ellipse cx="20" cy="32" rx="11" ry="7" fill="#fff" opacity=".55" />
            </svg>
          </div>
        </button>
        <AvatarMenu
          open={avatarOpen}
          onClose={() => setAvatarOpen(false)}
          onOpenSettings={onAvatarOpenSettings}
          onOpenStatistics={onAvatarOpenStatistics}
          onSignOut={onSignOut}
        />
      </div>

      {/* Module buttons */}
      <div className="rail-items">
        {orderedModules.map((mod: WebModuleSlotRegistration) => {
          const icon: WebShellIconName = mod.icon ?? "kanban";
          const label = navLabels[(mod.moduleId as keyof typeof navLabels)] ?? mod.moduleId;
          const isActive = activeModuleId === mod.moduleId;
          const isDragging = dragId === mod.moduleId;

          return (
            <button
              key={mod.moduleId}
              type="button"
              className={
                "rail-btn has-tip" +
                (isActive ? " active" : "") +
                (isDragging ? " dragging" : "")
              }
              data-tip={typeof label === "string" ? label : mod.moduleId}
              draggable
              onDragStart={(e) => onDragStart(e, mod.moduleId)}
              onDragOver={(e) => onDragOver(e, mod.moduleId)}
              onDragEnd={onDragEnd}
              onClick={() => {
                if (!dragId) onModuleClick(mod.moduleId);
              }}
            >
              <Icon name={icon} size={20} />
            </button>
          );
        })}
      </div>

      {/* Bottom utility buttons */}
      <div className="rail-bottom">
        {bottomButtons.map((btn) => {
          const isActive = btn.id === "pet" ? petOn : false;
          const label = btn.id === "pet"
            ? (navLabels["pet"] ?? "pet")
            : btn.id;

          return (
            <button
              key={btn.id}
              type="button"
              className={"rail-btn has-tip" + (isActive ? " active" : "")}
              data-tip={typeof label === "string" ? label : btn.id}
              onClick={btn.action}
            >
              <Icon name={btn.icon} size={18} />
            </button>
          );
        })}
      </div>
    </aside>
  );
}
