import { useMemo, type CSSProperties } from "react";
import { builtInWidgetManifest } from "./builtInWidgets";
import { WidgetFrame } from "./WidgetFrame";
import { createSeedWidget, useWidgetStore } from "../hooks/useWidgetStore";
import { createWidgetRegistry } from "../registry";
import type { WidgetDefinition, WidgetManifestRegistration } from "../types";

const EMPTY_REGISTRATIONS: readonly WidgetManifestRegistration[] = [];

export interface WidgetHostProps {
  registrations?: readonly WidgetManifestRegistration[];
  height?: number;
}

const hostStyle: CSSProperties = {
  position: "relative",
  minHeight: 540,
  overflow: "hidden",
  background:
    "linear-gradient(135deg, rgba(248,250,252,0.82), rgba(226,232,240,0.54)), var(--xai-widget-wallpaper)",
  border: "1px solid var(--xai-widget-border)",
  borderRadius: 12,
};

export function WidgetHost({ registrations = EMPTY_REGISTRATIONS, height = 540 }: WidgetHostProps) {
  const registry = useMemo(() => createWidgetRegistry([builtInWidgetManifest, ...registrations]), [registrations]);
  const seed = useMemo(
    () => [
      createSeedWidget("time-progress", { width: 260, height: 230 }, { mode: "day" }),
      createSeedWidget("countdown", { width: 260, height: 180 }, { title: "Launch review", targetDate: "2026-06-01" }),
    ],
    [],
  );
  const store = useWidgetStore(seed);
  const tokens = getThemeStyle(store.preferences.contrast);

  return (
    <div style={{ ...tokens, ...hostStyle, height }}>
      <div style={{ position: "absolute", inset: 12, display: "flex", gap: 8, zIndex: 2 }}>
        <button type="button" onClick={() => void store.setDensity("compact")}>
          Compact
        </button>
        <button type="button" onClick={() => void store.setDensity("comfortable")}>
          Comfortable
        </button>
        <button type="button" onClick={() => void store.setWallpaperTone("dark")}>
          Mock dark wallpaper
        </button>
      </div>
      {store.widgets
        .filter((widget) => widget.visible)
        .map((widget) => {
          const definition = registry.get(widget.type);
          if (!definition) {
            return null;
          }
          return (
            <WidgetFrame
              key={widget.id}
              widget={widget}
              title={definition.title}
              density={store.preferences.density}
              onChange={(id, patch) => void store.updateWidget(id, patch)}
              onHide={(id) => void store.updateWidget(id, { visible: false })}
            >
              {renderWidget(definition, widget, store.preferences.density)}
            </WidgetFrame>
          );
        })}
    </div>
  );
}

function renderWidget(
  definition: WidgetDefinition,
  widget: Parameters<WidgetDefinition["render"]>[0]["widget"],
  density: Parameters<WidgetDefinition["render"]>[0]["density"],
) {
  return definition.render({ widget, config: { ...definition.defaultConfig, ...widget.config }, density });
}

function getThemeStyle(contrast: "standard" | "high"): CSSProperties {
  return {
    "--xai-widget-bg": contrast === "high" ? "rgba(255,255,255,0.94)" : "rgba(255,255,255,0.78)",
    "--xai-widget-fg": "#172033",
    "--xai-widget-muted": "#64748b",
    "--xai-widget-border": "rgba(15,23,42,0.18)",
    "--xai-widget-accent": "#2563eb",
    "--xai-widget-danger": "#dc2626",
    "--xai-widget-radius": "10px",
    "--xai-widget-wallpaper": "#d8e2f2",
  } as CSSProperties;
}
