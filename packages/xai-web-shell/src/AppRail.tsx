/**
 * AppRail — 4 rail positions + drag-reorder + module buttons + bottom buttons.
 *
 * Port of web design/shell.jsx lines 69-166.
 * Reads state from useWebShell() + useWebModuleRegistry().
 *
 * CP-APPRAIL-01: the rail order (`xai_rail_order`) is owned by the App-scoped
 * rail-order controller (`useRailOrderController`, provided by the host with
 * `<RailOrderProvider>`); AppRail is its view and makes no storage call of its
 * own. Without a provider AppRail creates its own controller (standalone use).
 *
 * - The rail displays D(order, R): the controller's order (draft, committed
 *   bytes or default) reconciled against the visible registry R.
 * - A drag reorders a preview in memory only (dragstart, dragenter and
 *   dragover make zero storage attempts). Exactly one set intent is admitted at
 *   a `drop` inside `.rail-items`, and only if the order changed; a gesture
 *   that ends without a drop is cancelled and the preview reverts.
 * - The admitted value is the R-1 index-slot merge: modules hidden by Features
 *   (and non-rail or unknown ids) keep their stored index.
 *
 * API contract: packages/xai-web-shell/docs/api.md §2.2
 */

import { useContext, useReducer, useState } from "react";
import { useI18n } from "@repo/plugin-web-tokens";
import { AvatarMenu } from "./AvatarMenu.js";
import { Icon } from "./icons.js";
import { reorderArray } from "./internal/dnd.js";
import { RailOrderControllerContext, useRailOrderController } from "./internal/railOrderController.js";
import { displayRailOrder, isRailPermutation, sameRailOrder } from "./internal/railOrderModel.js";
import { useWebShell, useWebModuleRegistry } from "./registry.js";
import type { AppRailProps, RailOrderController, WebModuleSlotRegistration, WebShellIconName } from "./types.js";

// ---- Bottom-row button definition -----------------------------------------

interface BottomButton {
  id: string;
  icon: WebShellIconName;
  action?: () => void;
}

// ---- AppRail component -----------------------------------------------------

export function AppRail(props: AppRailProps) {
  const shared = useContext(RailOrderControllerContext);
  return shared !== null
    ? <AppRailView {...props} controller={shared} />
    : <StandaloneAppRail {...props} />;
}

/** Without a provider the rail owns its controller (the shell stays usable alone). */
function StandaloneAppRail(props: AppRailProps) {
  const { lang } = useWebShell();
  const controller = useRailOrderController({ lang });
  return <AppRailView {...props} controller={controller} />;
}

/** One HTML5 drag gesture started on a rail button in this document. */
interface RailGesture {
  /** The dragged module id. */
  readonly dragId: string;
  /** D0: the order displayed at dragstart. */
  readonly initial: readonly string[];
  /** P: the in-memory preview order. */
  preview: string[];
  /** A drop already decided this gesture's commit (one gesture, at most one intent). */
  dropped: boolean;
}

function AppRailView({
  activeModuleId,
  onModuleClick,
  onPetToggle,
  onAvatarOpenSettings,
  onAvatarOpenStatistics,
  onSignOut,
  controller,
}: AppRailProps & { readonly controller: RailOrderController }) {
  const { lang, railPos, petOn } = useWebShell();
  const { t } = useI18n(lang);
  const registryModules = useWebModuleRegistry();

  // R: the visible registry (Features-filtered, showInRail, sorted by railOrder).
  const visibleIds: string[] = registryModules.map((m: WebModuleSlotRegistration) => m.moduleId);
  // D(order, R) for the controller's order (draft, committed bytes or default).
  const committedDisplay = displayRailOrder(controller.order, visibleIds);

  // ---- Drag-reorder (HTML5 DnD): preview in memory, one write per drop -----
  const [gesture] = useState<{ current: RailGesture | null }>(() => ({ current: null }));
  const [, rerender] = useReducer((version: number) => version + 1, 0);
  const active = gesture.current;
  // The preview shows only while it is still a permutation of D(S, R) (§6 item 7).
  const validOrder: string[] = active !== null && isRailPermutation(active.preview, committedDisplay)
    ? active.preview
    : committedDisplay;
  const dragId = active?.dragId ?? null;

  // Map ordered ids back to full module objects
  const moduleMap = new Map<string, WebModuleSlotRegistration>(
    registryModules.map((m: WebModuleSlotRegistration) => [m.moduleId, m]),
  );
  const orderedModules: WebModuleSlotRegistration[] = validOrder
    .map((id) => moduleMap.get(id))
    .filter((m): m is WebModuleSlotRegistration => m !== undefined);

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = "move";
    try {
      e.dataTransfer.setData("text/plain", id);
    } catch {
      // Some sandboxed iframes block setData; drag still works via the gesture state
    }
    // Zero storage attempts: the gesture captures D0 and starts the preview P = D0.
    gesture.current = { dragId: id, initial: [...validOrder], preview: [...validOrder], dropped: false };
    rerender();
  };

  // dragenter on a rail button accepts the drag; the dragover that the browser
  // fires at the same button right after it (HTML drag-and-drop processing
  // model) moves the preview, so the dragged button only takes the hovered
  // slot once that dragover has reached the hovered button.
  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // dragover on a rail button: reorder the in-memory preview only (zero storage attempts).
  const onDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    const current = gesture.current;
    if (current === null || current.dropped || current.dragId === id) return;
    if (!isRailPermutation(current.preview, committedDisplay)) return;
    const next = reorderArray(current.preview, current.dragId, id);
    if (next === current.preview) return;
    current.preview = next;
    rerender();
  };

  // A gap of .rail-items accepts the drop of a gesture started here.
  const onItemsDragOver = (e: React.DragEvent) => {
    if (gesture.current !== null) e.preventDefault();
  };

  // drop anywhere inside .rail-items: at most one set intent per gesture.
  const onItemsDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const current = gesture.current;
    // A drop not preceded by a rail-button dragstart here (an external drag) is ignored.
    if (current === null || current.dropped) return;
    current.dropped = true;
    if (sameRailOrder(current.preview, current.initial)) return;
    // The controller merges over S and R at drop time and refuses a non-permutation.
    controller.drop(current.preview, visibleIds);
  };

  // dragend ends the gesture; without a drop it is cancelled and the preview reverts.
  const onDragEnd = () => {
    if (gesture.current === null) return;
    gesture.current = null;
    rerender();
  };

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
  const avatarLabel = lang === "zh" ? "打开账户菜单" : "Open account menu";

  return (
    <aside className="app-rail" data-pos={railPos}>
      {/* Avatar area */}
      <div className="rail-avatar-wrap">
        <button
          type="button"
          className="rail-avatar"
          aria-label={avatarLabel}
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
      <div
        className="rail-items"
        onDragEnter={onItemsDragOver}
        onDragOver={onItemsDragOver}
        onDrop={onItemsDrop}
      >
        {orderedModules.map((mod: WebModuleSlotRegistration) => {
          const icon: WebShellIconName = mod.icon ?? "kanban";
          const label = navLabels[(mod.moduleId as keyof typeof navLabels)] ?? mod.moduleId;
          const labelText = typeof label === "string" ? label : mod.moduleId;
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
              data-tip={labelText}
              aria-label={labelText}
              draggable
              onDragStart={(e) => onDragStart(e, mod.moduleId)}
              onDragEnter={onDragEnter}
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
          const labelText = typeof label === "string" ? label : btn.id;

          return (
            <button
              key={btn.id}
              type="button"
              className={"rail-btn has-tip" + (isActive ? " active" : "")}
              data-tip={labelText}
              aria-label={labelText}
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
