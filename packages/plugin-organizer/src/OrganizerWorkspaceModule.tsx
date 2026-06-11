import { DndContext } from "@dnd-kit/core";
import { useCallback, useMemo, useState, type CSSProperties } from "react";
import { GridSystemProvider, useGridSystem } from "./useGridSystem";
import { SmartContainer } from "./SmartContainer";
import { createOrganizerDesktopLayoutStore } from "./desktopLayoutStore";
import { createFinderClient } from "./finderClient";
import type { DesktopItem, GridBox } from "./types";
import { createGridItemsFromFinderDrop } from "./gridItemFactory";
import { TauriEvent, useTauriEvent, useTauriInvoke } from "@repo/core/hooks";
import {
  isDesktopPhase1OfflineRuntime,
  resolveWebRuntimeProfile,
} from "@repo/core";

interface OrganizerWorkspaceModuleProps {
  runtimeEnv?: Record<string, string | undefined>;
}

interface TauriDragDropPayload {
  paths?: unknown;
  position?: {
    x?: unknown;
    y?: unknown;
  };
}

export function OrganizerWorkspaceModule({
  runtimeEnv = {},
}: OrganizerWorkspaceModuleProps) {
  const runtime = resolveWebRuntimeProfile(runtimeEnv);
  const runtimeSupported = isDesktopPhase1OfflineRuntime(runtime);
  const { invoke } = useTauriInvoke();
  const layoutStore = useMemo(
    () => createOrganizerDesktopLayoutStore(invoke),
    [invoke],
  );

  if (!runtimeSupported) {
    return (
      <section className="host-page" style={{ display: "grid", placeItems: "center" }}>
        <div style={unsupportedCardStyle}>
          <h2 style={{ margin: "0 0 10px", fontSize: 18 }}>
            Organizer Is Desktop-Only
          </h2>
          <p style={{ margin: 0, lineHeight: 1.5 }}>
            Smart Container file organizer is mounted only in the desktop
            normal-window runtime and is not enabled in web-live.
          </p>
        </div>
      </section>
    );
  }

  return (
    <GridSystemProvider store={layoutStore}>
      <OrganizerWorkspaceSurface />
    </GridSystemProvider>
  );
}

function OrganizerWorkspaceSurface() {
  const {
    grids,
    items,
    createGrid,
    updateGrid,
    deleteGrid,
    toggleFold,
    toggleLock,
    addItem,
    addItemToGrid,
    findGridAtPosition,
  } = useGridSystem();
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const { invoke } = useTauriInvoke();
  const finderClient = useMemo(() => createFinderClient(invoke), [invoke]);

  const addDroppedPaths = useCallback(
    (gridId: string, paths: string[]) => {
      const grid = grids.find((entry) => entry.id === gridId);
      if (!grid) return;
      const existing = new Set(
        grid.itemIds
          .map((itemId) => items[itemId]?.filepath)
          .filter((filepath): filepath is string => typeof filepath === "string"),
      );
      const newPaths = paths.filter((path) => path.startsWith("/") && !existing.has(path));
      if (newPaths.length === 0) return;

      for (const path of newPaths) {
        void finderClient.registerBookmark(path).catch(() => undefined);
      }

      const created = createGridItemsFromFinderDrop(
        gridId,
        newPaths.map((path) => ({
          filepath: path,
          filename: basename(path),
        })),
      );
      created.forEach((entry) => {
        addItem(toDesktopItem(entry));
        addItemToGrid(gridId, entry.id);
      });
    },
    [addItem, addItemToGrid, finderClient, grids, items],
  );

  const resolveDropTargetGrid = useCallback(
    (payload: TauriDragDropPayload): GridBox => {
      const x = toNumberOr(payload.position?.x, 72);
      const y = toNumberOr(payload.position?.y, 120);
      const existing = findGridAtPosition(x, y);
      if (existing) return existing;
      const createdId = createGrid(x, y);
      return {
        id: createdId,
        title: "New Grid",
        rect: { x, y, width: 280, height: 340 },
        isLocked: false,
        isFolded: false,
        viewMode: "grid",
        itemIds: [],
      };
    },
    [createGrid, findGridAtPosition],
  );

  useTauriEvent<TauriDragDropPayload>(
    TauriEvent.DRAG_DROP,
    (event) => {
      setIsDraggingFile(false);
      const paths = coerceDropPaths(event.payload);
      if (paths.length === 0) return;
      const target = resolveDropTargetGrid(event.payload);
      addDroppedPaths(target.id, paths);
    },
    { enabled: true },
  );
  useTauriEvent(TauriEvent.DRAG_ENTER, () => setIsDraggingFile(true), {
    enabled: true,
  });
  useTauriEvent(TauriEvent.DRAG_OVER, () => setIsDraggingFile(true), {
    enabled: true,
  });
  useTauriEvent(TauriEvent.DRAG_LEAVE, () => setIsDraggingFile(false), {
    enabled: true,
  });

  const orderedGrids = useMemo(
    () => [...grids].sort((a, b) => a.id.localeCompare(b.id)),
    [grids],
  );

  return (
    <DndContext>
      <section
        className="host-page"
        style={{
          position: "relative",
          minHeight: "calc(100vh - 96px)",
          borderRadius: 20,
          border: "1px solid rgba(148, 163, 184, 0.32)",
          background:
            "radial-gradient(circle at 16% 20%, rgba(14, 116, 144, 0.16), transparent 42%), radial-gradient(circle at 86% 22%, rgba(30, 64, 175, 0.16), transparent 38%), linear-gradient(180deg, rgba(248, 250, 252, 0.96), rgba(226, 232, 240, 0.92))",
          overflow: "hidden",
          outline: isDraggingFile ? "2px dashed rgba(8, 145, 178, 0.9)" : "none",
          outlineOffset: "-2px",
        }}
      >
        <header style={headerStyle}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20 }}>Smart Container Organizer</h2>
            <p style={{ margin: "6px 0 0", color: "#334155", fontSize: 13 }}>
              Native path-first drop, device-local persistence, session-based Finder authorization.
            </p>
          </div>
          <button
            type="button"
            onClick={() => createGrid(88, 148)}
            style={newGridButtonStyle}
          >
            New Grid
          </button>
        </header>

        <div style={{ position: "absolute", inset: "88px 0 0 0" }}>
          {orderedGrids.map((grid) => (
            <SmartContainer
              key={grid.id}
              data={grid}
              items={grid.itemIds
                .map((itemId) => items[itemId])
                .filter((item): item is DesktopItem => Boolean(item))}
              onUpdate={updateGrid}
              onClose={deleteGrid}
              onDelete={deleteGrid}
              onToggleFold={toggleFold}
              onToggleLock={toggleLock}
              onFocus={() => undefined}
              onUpdateItem={(itemId, patch) => {
                const current = items[itemId];
                if (!current) return;
                addItem({ ...current, ...patch });
              }}
              gridOpacity={0.88}
              gridBlur
            />
          ))}
          {orderedGrids.length === 0 ? (
            <div style={emptyStateStyle}>
              Drop files, folders, or apps here to create your first Smart Container.
            </div>
          ) : null}
        </div>
      </section>
    </DndContext>
  );
}

function coerceDropPaths(payload: TauriDragDropPayload): string[] {
  if (!Array.isArray(payload.paths)) return [];
  return payload.paths.filter(
    (value): value is string => typeof value === "string" && value.length > 0,
  );
}

function toDesktopItem(entry: ReturnType<typeof createGridItemsFromFinderDrop>[number]): DesktopItem {
  return {
    id: entry.id,
    filename: entry.filename,
    filepath: entry.filepath ?? "",
    type: entry.kind,
    icon: entry.icon,
    size: entry.size,
    createdAt: Date.parse(entry.createdAt) || Date.now(),
    url: entry.url,
  };
}

function basename(path: string): string {
  const trimmed = path.replace(/\/+$/, "");
  const parts = trimmed.split("/");
  const last = parts[parts.length - 1];
  return last && last.length > 0 ? last : path;
}

function toNumberOr(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

const unsupportedCardStyle: CSSProperties = {
  maxWidth: 560,
  padding: 24,
  borderRadius: 16,
  border: "1px solid rgba(148, 163, 184, 0.36)",
  background: "rgba(15, 23, 42, 0.75)",
  color: "#e2e8f0",
};

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  padding: "16px 20px",
  borderBottom: "1px solid rgba(148, 163, 184, 0.32)",
  backdropFilter: "blur(5px)",
};

const newGridButtonStyle: CSSProperties = {
  border: "1px solid rgba(15, 23, 42, 0.45)",
  borderRadius: 999,
  padding: "8px 14px",
  background: "rgba(255,255,255,0.88)",
  fontWeight: 600,
  cursor: "pointer",
};

const emptyStateStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "grid",
  placeItems: "center",
  color: "#0f172a",
  fontSize: 14,
  fontWeight: 600,
};
