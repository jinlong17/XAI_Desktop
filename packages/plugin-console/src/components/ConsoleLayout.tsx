import { emitEvent } from "@repo/core/events";
import type { ConsoleViewRegistration } from "@repo/core/types";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useCommandPalette } from "../hooks/useCommandPalette";
import type { ConsoleNavItem } from "../types";
import { CommandPalette } from "./CommandPalette";
import { ConsoleSearch } from "./ConsoleSearch";
import { ConsoleSettings } from "./ConsoleSettings";
import { NotificationPanel } from "./NotificationPanel";

const SHELL_STORAGE_KEY = "xai.console.shell.v1";
const MIN_SIDEBAR_WIDTH = 180;
const MAX_SIDEBAR_WIDTH = 420;
const MIN_LIST_WIDTH = 260;
const MAX_LIST_WIDTH = 560;
const MIN_DETAIL_WIDTH = 320;

const BUILTIN_ITEMS: ConsoleNavItem[] = [
  {
    id: "notifications",
    pluginId: "console",
    label: "Notifications",
    icon: "bell",
    order: 90,
  },
  {
    id: "settings",
    pluginId: "console",
    label: "Settings",
    icon: "settings",
    order: 100,
  },
  {
    id: "calendar",
    pluginId: "calendar",
    label: "Calendar",
    icon: "calendar",
    order: 130,
  },
  {
    id: "widgets",
    pluginId: "widgets",
    label: "Widgets",
    icon: "sparkles",
    order: 140,
  },
];

const ICON_MAP: Record<string, string> = {
  "check-square": "[T]",
  timer: "[P]",
  repeat: "[H]",
  grid: "[M]",
  tag: "[L]",
  bell: "[N]",
  settings: "[S]",
  calendar: "[C]",
  sparkles: "[W]",
};

interface PersistedShellState {
  activeId: string;
  query: string;
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  listWidth: number;
  themeMode: "light" | "dark" | "system";
  density: "comfortable" | "compact";
  fontScale: number;
  selection: Record<string, string | number | boolean | null>;
}

const DEFAULT_STATE: PersistedShellState = {
  activeId: "tasks",
  query: "",
  sidebarCollapsed: false,
  sidebarWidth: 228,
  listWidth: 340,
  themeMode: "light",
  density: "comfortable",
  fontScale: 1,
  selection: {},
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function loadPersistedState(): PersistedShellState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(SHELL_STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<PersistedShellState>;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      sidebarWidth: clamp(parsed.sidebarWidth ?? DEFAULT_STATE.sidebarWidth, MIN_SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH),
      listWidth: clamp(parsed.listWidth ?? DEFAULT_STATE.listWidth, MIN_LIST_WIDTH, MAX_LIST_WIDTH),
      fontScale: clamp(parsed.fontScale ?? DEFAULT_STATE.fontScale, 0.9, 1.3),
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function listRowsFor(moduleId: string): Array<{ id: string; title: string; subtitle: string }> {
  if (moduleId === "settings") {
    return [
      { id: "appearance", title: "Appearance", subtitle: "Theme, density, and font scale" },
      { id: "notifications", title: "Notifications", subtitle: "Channel and schedule controls" },
      { id: "shortcuts", title: "Shortcuts", subtitle: "Keyboard and quick actions" },
    ];
  }
  if (moduleId === "notifications") {
    return [
      { id: "unread", title: "Unread", subtitle: "Unacknowledged updates" },
      { id: "system", title: "System", subtitle: "Runtime warnings and degrade notices" },
      { id: "all", title: "All events", subtitle: "Historical activity stream" },
    ];
  }
  if (moduleId === "calendar" || moduleId === "widgets") {
    return [{ id: "placeholder", title: "Placeholder", subtitle: "This module remains disabled in this phase" }];
  }
  return [
    { id: `${moduleId}-inbox`, title: "Inbox", subtitle: "Pending or recently changed entities" },
    { id: `${moduleId}-today`, title: "Today", subtitle: "Items prioritized for today" },
    { id: `${moduleId}-upcoming`, title: "Upcoming", subtitle: "Next tasks and scheduled items" },
  ];
}

function toNavItem(registration: ConsoleViewRegistration): ConsoleNavItem {
  return {
    id: registration.moduleId,
    pluginId: registration.sidebar.group,
    label: registration.sidebar.label,
    icon: registration.sidebar.icon,
    order: registration.sidebar.order,
    render: registration.render as never,
  };
}

export interface ConsoleLayoutProps {
  views?: ConsoleViewRegistration[];
  navItems?: ConsoleNavItem[];
  title?: string;
  children?: ReactNode;
}

export function ConsoleLayout({
  views = [],
  navItems,
  title = "XAI Console",
  children,
}: ConsoleLayoutProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<PersistedShellState>(() => loadPersistedState());
  const viewById = useMemo(
    () => new Map(views.map((view) => [view.moduleId, view])),
    [views],
  );
  const moduleNavItems = useMemo(() => views.map(toNavItem), [views]);
  const items = useMemo(() => {
    const merged = [...moduleNavItems, ...(navItems ?? []), ...BUILTIN_ITEMS];
    return merged.sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
  }, [moduleNavItems, navItems]);
  const activeItem = items.find((item) => item.id === state.activeId) ?? items[0] ?? null;

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SHELL_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (!activeItem && items[0]) {
      setState((current) => ({ ...current, activeId: items[0]?.id ?? "tasks" }));
    }
  }, [activeItem, items]);

  const setActiveModule = useCallback((moduleId: string, source: "sidebar" | "command-palette" | "shortcut" | "restore") => {
    setState((current) => ({ ...current, activeId: moduleId }));
    void emitEvent("console:navigate-module", { moduleId, source });
  }, []);

  const activeRows = useMemo(() => listRowsFor(activeItem?.id ?? "tasks"), [activeItem?.id]);
  const selectedRowId = String(state.selection.listId ?? activeRows[0]?.id ?? "");
  const activeRow = activeRows.find((row) => row.id === selectedRowId) ?? activeRows[0] ?? null;

  const palette = useCommandPalette({
    onExecute: (result) => {
      const moduleId =
        result.entity.type === "label"
          ? "labels"
          : result.entity.type === "todo"
            ? "tasks"
            : result.entity.type === "habit"
              ? "habits"
              : result.entity.type === "project"
                ? "matrix"
                : "notifications";
      setActiveModule(moduleId, "command-palette");
      setState((current) => ({
        ...current,
        query: result.entity.title,
        selection: { ...current.selection, listId: result.entity.id },
      }));
      void emitEvent("console:search-opened", {
        query: result.entity.title,
        source: "programmatic",
      });
    },
  });

  const beginResize = useCallback(
    (target: "sidebar" | "list", startX: number) => {
      const startSidebar = state.sidebarCollapsed ? 56 : state.sidebarWidth;
      const startList = state.listWidth;
      const containerWidth = containerRef.current?.getBoundingClientRect().width ?? 1200;

      const onMove = (event: MouseEvent) => {
        const delta = event.clientX - startX;
        setState((current) => {
          if (target === "sidebar") {
            const nextSidebar = clamp(startSidebar + delta, MIN_SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH);
            const maxList = Math.max(
              MIN_LIST_WIDTH,
              Math.min(MAX_LIST_WIDTH, containerWidth - nextSidebar - MIN_DETAIL_WIDTH),
            );
            return {
              ...current,
              sidebarCollapsed: false,
              sidebarWidth: nextSidebar,
              listWidth: clamp(current.listWidth, MIN_LIST_WIDTH, maxList),
            };
          }

          const sidebarWidth = current.sidebarCollapsed ? 56 : current.sidebarWidth;
          const maxList = Math.max(
            MIN_LIST_WIDTH,
            Math.min(MAX_LIST_WIDTH, containerWidth - sidebarWidth - MIN_DETAIL_WIDTH),
          );
          return {
            ...current,
            listWidth: clamp(startList + delta, MIN_LIST_WIDTH, maxList),
          };
        });
      };

      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [state.listWidth, state.sidebarCollapsed, state.sidebarWidth],
  );

  const activeView = activeItem ? viewById.get(activeItem.id) : undefined;
  const activeModuleId = activeItem?.id ?? "tasks";
  const listId = activeRow?.id ?? "";

  const detailContent = useMemo(() => {
    if (children) return children;
    if (activeModuleId === "settings") return <ConsoleSettings />;
    if (activeModuleId === "notifications") return <NotificationPanel />;
    if (activeModuleId === "calendar" || activeModuleId === "widgets") {
      return (
        <section style={{ color: "#6b7280", display: "grid", minHeight: 260, placeItems: "center" }}>
          <span>{activeItem?.label ?? "Module"} remains a disabled placeholder in this phase</span>
        </section>
      );
    }
    if (!activeView) {
      return (
        <section style={{ color: "#6b7280", display: "grid", minHeight: 260, placeItems: "center" }}>
          <span>{activeItem?.label ?? "Module"} does not have a registered ConsoleView</span>
        </section>
      );
    }

    const ActiveComponent = activeView.render;
    return (
      <ActiveComponent
        capabilities={{
          navigate: (route) => {
            setState((current) => ({
              ...current,
              activeId: route.moduleId,
              selection: {
                ...current.selection,
                listId: route.listId ?? current.selection.listId ?? null,
                detailId: route.detailId ?? current.selection.detailId ?? null,
              },
            }));
            void emitEvent("console:navigate-module", {
              moduleId: route.moduleId,
              listId: route.listId,
              detailId: route.detailId,
              source: "restore",
            });
          },
          openCommandPalette: (query) => {
            palette.open();
            setState((current) => ({ ...current, query: query ?? current.query }));
            void emitEvent("console:search-opened", { query, source: "programmatic" });
          },
          focusPane: () => {},
          persistState: async (partial) => {
            setState((current) => ({
              ...current,
              activeId: partial.moduleId ?? current.activeId,
              selection: {
                ...current.selection,
                listId: partial.listId ?? current.selection.listId ?? null,
                detailId: partial.detailId ?? current.selection.detailId ?? null,
              },
            }));
          },
          requestReconcile: async (reason) => {
            void emitEvent("console:reconcile-requested", {
              moduleId: activeModuleId,
              reason,
            });
          },
        }}
        moduleId={activeModuleId}
        query={state.query}
        route={{
          moduleId: activeModuleId,
          listId,
          detailId: String(state.selection.detailId ?? ""),
        }}
        selection={{
          listId,
          detailId: String(state.selection.detailId ?? ""),
        }}
        theme={{
          mode: state.themeMode,
          density: state.density,
          fontScale: state.fontScale,
        }}
      />
    );
  }, [activeItem?.label, activeModuleId, activeView, children, listId, palette, state]);

  return (
    <div
      ref={containerRef}
      style={{
        background: state.themeMode === "dark" ? "#0f172a" : "#f8fafc",
        color: state.themeMode === "dark" ? "#e5e7eb" : "#111827",
        display: "grid",
        fontSize: `${Math.round(14 * state.fontScale)}px`,
        gridTemplateColumns: `${state.sidebarCollapsed ? 56 : state.sidebarWidth}px ${state.listWidth}px minmax(${MIN_DETAIL_WIDTH}px, 1fr)`,
        minHeight: "100vh",
      }}
    >
      <aside
        style={{
          background: state.themeMode === "dark" ? "#111827" : "#ffffff",
          borderRight: "1px solid #e5e7eb",
          display: "grid",
          gridTemplateRows: "auto 1fr auto",
          minWidth: 0,
          padding: state.sidebarCollapsed ? 8 : 12,
          position: "relative",
        }}
      >
        <div style={{ display: "flex", justifyContent: state.sidebarCollapsed ? "center" : "space-between" }}>
          {state.sidebarCollapsed ? null : <strong style={{ fontSize: 18 }}>{title}</strong>}
          <button
            aria-label="Toggle sidebar"
            onClick={() => {
              setState((current) => ({
                ...current,
                sidebarCollapsed: !current.sidebarCollapsed,
              }));
              void emitEvent("console:sidebar-toggled", {
                collapsed: !state.sidebarCollapsed,
              });
            }}
            type="button"
          >
            {state.sidebarCollapsed ? "→" : "←"}
          </button>
        </div>
        <nav aria-label="Console navigation" style={{ display: "grid", gap: 6, marginTop: 12, alignContent: "start" }}>
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id, "sidebar")}
              style={{
                alignItems: "center",
                background: activeItem?.id === item.id ? "#111827" : "transparent",
                border: 0,
                borderRadius: 8,
                color: activeItem?.id === item.id ? "#ffffff" : "#4b5563",
                cursor: "pointer",
                display: "flex",
                fontSize: 14,
                gap: 8,
                minHeight: 36,
                padding: "0 10px",
                textAlign: "left",
              }}
              type="button"
            >
              <span aria-hidden="true">{ICON_MAP[item.icon ?? ""] ?? "•"}</span>
              {state.sidebarCollapsed ? null : <span style={{ flex: 1 }}>{item.label}</span>}
            </button>
          ))}
        </nav>
        {!state.sidebarCollapsed ? (
          <small style={{ color: "#6b7280", marginTop: 8 }}>Calendar and Widgets stay placeholder-only in this phase.</small>
        ) : null}
        {!state.sidebarCollapsed ? (
          <div
            onMouseDown={(event) => beginResize("sidebar", event.clientX)}
            style={{
              cursor: "col-resize",
              inset: "0 0 0 auto",
              position: "absolute",
              width: 6,
            }}
          />
        ) : null}
      </aside>

      <section
        style={{
          background: state.themeMode === "dark" ? "#0b1220" : "#f9fafb",
          borderRight: "1px solid #e5e7eb",
          display: "grid",
          gridTemplateRows: "auto 1fr",
          minWidth: 0,
          position: "relative",
        }}
      >
        <header style={{ borderBottom: "1px solid #e5e7eb", minHeight: 52, padding: "12px 14px" }}>
          <strong>{activeItem?.label ?? "Module"} list</strong>
        </header>
        <div style={{ display: "grid", gap: 8, overflow: "auto", padding: 12 }}>
          {activeRows.map((row) => (
            <button
              key={row.id}
              onClick={() => {
                setState((current) => ({
                  ...current,
                  selection: { ...current.selection, listId: row.id, detailId: `${row.id}:detail` },
                }));
                void emitEvent("console:detail-selection-changed", {
                  moduleId: activeModuleId,
                  selection: { listId: row.id, detailId: `${row.id}:detail` },
                });
              }}
              style={{
                background: selectedRowId === row.id ? "#e5e7eb" : "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                display: "grid",
                gap: 2,
                padding: 10,
                textAlign: "left",
              }}
              type="button"
            >
              <strong>{row.title}</strong>
              <span style={{ color: "#6b7280", fontSize: 12 }}>{row.subtitle}</span>
            </button>
          ))}
        </div>
        <div
          onMouseDown={(event) => beginResize("list", event.clientX)}
          style={{
            cursor: "col-resize",
            inset: "0 0 0 auto",
            position: "absolute",
            width: 6,
          }}
        />
      </section>

      <main style={{ display: "grid", gridTemplateRows: "auto 1fr", minWidth: 0 }}>
        <header
          style={{
            alignItems: "center",
            background: state.themeMode === "dark" ? "#0f172a" : "#ffffff",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            gap: 8,
            minHeight: 62,
            padding: "0 14px",
          }}
        >
          <div style={{ minWidth: 160 }}>
            <strong>{activeItem?.label ?? "Console"}</strong>
            <span style={{ color: "#6b7280", display: "block", fontSize: 12 }}>{activeItem?.pluginId ?? "console"}</span>
          </div>
          <ConsoleSearch
            onOpenPalette={() => {
              palette.open();
              void emitEvent("console:search-opened", { source: "click" });
            }}
          />
          <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
            <select
              aria-label="Theme mode"
              onChange={(event) =>
                setState((current) => ({
                  ...current,
                  themeMode: event.target.value as PersistedShellState["themeMode"],
                }))
              }
              value={state.themeMode}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
            <select
              aria-label="Density"
              onChange={(event) =>
                setState((current) => ({
                  ...current,
                  density: event.target.value as PersistedShellState["density"],
                }))
              }
              value={state.density}
            >
              <option value="comfortable">Comfortable</option>
              <option value="compact">Compact</option>
            </select>
            <button
              onClick={() =>
                setState((current) => ({
                  ...current,
                  fontScale: clamp(current.fontScale - 0.05, 0.9, 1.3),
                }))
              }
              type="button"
            >
              A-
            </button>
            <button
              onClick={() =>
                setState((current) => ({
                  ...current,
                  fontScale: clamp(current.fontScale + 0.05, 0.9, 1.3),
                }))
              }
              type="button"
            >
              A+
            </button>
          </div>
        </header>
        <section style={{ minWidth: 0, overflow: "auto", padding: state.density === "compact" ? 12 : 18 }}>
          {detailContent}
        </section>
      </main>

      <CommandPalette controller={palette} />
    </div>
  );
}
