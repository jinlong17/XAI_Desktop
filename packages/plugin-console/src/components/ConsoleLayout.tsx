import { useMemo, useState, type ReactNode } from "react";
import { createDefaultConsoleNavItems, type PluginSlotRegistry } from "../registry/PluginSlotRegistry";
import type { ConsoleNavItem } from "../types";
import { CommandPalette } from "./CommandPalette";
import { ConsoleSearch } from "./ConsoleSearch";
import { ConsoleSettings } from "./ConsoleSettings";
import { NotificationPanel } from "./NotificationPanel";

export interface ConsoleLayoutProps {
  registry?: PluginSlotRegistry;
  navItems?: ConsoleNavItem[];
  title?: string;
  children?: ReactNode;
}

function Placeholder({ label }: { label: string }) {
  return (
    <section style={{ color: "#6b7280", display: "grid", minHeight: 260, placeItems: "center" }}>
      <span>{label} slot ready</span>
    </section>
  );
}

export function ConsoleLayout({ registry, navItems, title = "XAI Console", children }: ConsoleLayoutProps) {
  const items = useMemo(() => {
    const registered = registry?.getNavItems() ?? [];
    return [...createDefaultConsoleNavItems(), ...registered, ...(navItems ?? [])].sort(
      (a, b) => a.order - b.order || a.label.localeCompare(b.label),
    );
  }, [navItems, registry]);
  const [activeId, setActiveId] = useState(items[0]?.id ?? "todos");
  const activeItem = items.find((item) => item.id === activeId) ?? items[0] ?? null;
  const ActiveComponent = activeItem?.render;

  let mainContent: ReactNode = children;
  if (!mainContent && activeItem?.id === "settings") mainContent = <ConsoleSettings />;
  if (!mainContent && activeItem?.id === "notifications") mainContent = <NotificationPanel />;
  if (!mainContent && ActiveComponent) mainContent = <ActiveComponent />;
  if (!mainContent) mainContent = <Placeholder label={activeItem?.label ?? "Console"} />;

  return (
    <div
      style={{
        background: "#f8fafc",
        color: "#111827",
        display: "grid",
        gridTemplateColumns: "220px minmax(0, 1fr)",
        minHeight: "100vh",
      }}
    >
      <aside style={{ background: "#ffffff", borderRight: "1px solid #e5e7eb", display: "grid", gridTemplateRows: "auto 1fr", padding: 12 }}>
        <strong style={{ fontSize: 18 }}>{title}</strong>
        <nav aria-label="Console navigation" style={{ display: "grid", gap: 4, marginTop: 16, alignContent: "start" }}>
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveId(item.id)}
              style={{
                alignItems: "center",
                background: activeItem?.id === item.id ? "#111827" : "transparent",
                border: 0,
                borderRadius: 8,
                color: activeItem?.id === item.id ? "#ffffff" : "#374151",
                cursor: "pointer",
                display: "flex",
                gap: 8,
                minHeight: 36,
                padding: "0 10px",
                textAlign: "left",
              }}
              type="button"
            >
              <span aria-hidden="true">{item.icon ?? "•"}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badgeCount ? <span>{item.badgeCount}</span> : null}
            </button>
          ))}
        </nav>
      </aside>
      <main style={{ display: "grid", gridTemplateRows: "auto 1fr", minWidth: 0 }}>
        <header
          style={{
            alignItems: "center",
            background: "#ffffff",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            gap: 12,
            justifyContent: "space-between",
            minHeight: 62,
            padding: "0 18px",
          }}
        >
          <div>
            <strong>{activeItem?.label ?? "Console"}</strong>
            <span style={{ color: "#6b7280", display: "block", fontSize: 12 }}>{activeItem?.pluginId ?? "console"}</span>
          </div>
          <ConsoleSearch />
        </header>
        <div style={{ minWidth: 0, overflow: "auto", padding: 18 }}>{mainContent}</div>
      </main>
      <CommandPalette />
    </div>
  );
}
