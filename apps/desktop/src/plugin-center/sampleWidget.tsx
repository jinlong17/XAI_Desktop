import type { PluginInstance, PluginManifest } from "@repo/core/types";

export const SAMPLE_WIDGET_PLUGIN_NAME = "sample-widget";
export const SAMPLE_WIDGET_CONTENT_TYPE = "sample-clock-widget";

export const sampleWidgetManifest: PluginManifest = {
  name: SAMPLE_WIDGET_PLUGIN_NAME,
  version: "0.1.0",
  displayName: "Sample Widget",
  description: "Small built-in desktop widget for the plugin platform.",
  author: "Jinlong",
  enabled: true,
  contentTypes: [SAMPLE_WIDGET_CONTENT_TYPE],
  windows: {
    grid: true,
  },
  events: {
    emit: [],
    listen: [],
  },
  dependencies: ["@repo/core"],
  tauriCommands: [],
};

export function isSampleWidgetInstance(
  instance: PluginInstance | null | undefined,
): instance is PluginInstance {
  return (
    instance?.pluginName === SAMPLE_WIDGET_PLUGIN_NAME &&
    instance.contentType === SAMPLE_WIDGET_CONTENT_TYPE
  );
}

export function SampleWidgetGridContent({
  gridId,
  instance,
}: {
  gridId: string;
  instance: PluginInstance;
}) {
  const createdAt = new Date(instance.createdAt);
  const createdLabel = Number.isNaN(createdAt.getTime())
    ? "Device local"
    : createdAt.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });

  return (
    <main
      style={{
        alignItems: "stretch",
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(239,246,255,0.9))",
        color: "#172033",
        display: "flex",
        flexDirection: "column",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        height: "100%",
        justifyContent: "space-between",
        padding: 16,
        width: "100%",
      }}
    >
      <header
        className="grid-title-bar"
        style={{
          alignItems: "center",
          cursor: "grab",
          display: "flex",
          justifyContent: "space-between",
          userSelect: "none",
        }}
      >
        <span
          style={{
            color: "#334155",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 0,
            textTransform: "uppercase",
          }}
        >
          Sample
        </span>
        <span
          style={{
            background: "rgba(37,99,235,0.12)",
            border: "1px solid rgba(37,99,235,0.18)",
            borderRadius: 999,
            color: "#1d4ed8",
            fontSize: 11,
            fontWeight: 700,
            padding: "3px 8px",
          }}
        >
          {instance.lifecycleState}
        </span>
      </header>
      <section>
        <div
          style={{
            fontSize: 28,
            fontWeight: 750,
            letterSpacing: 0,
            lineHeight: 1.1,
          }}
        >
          Desktop Widget
        </div>
        <div
          style={{
            color: "#475569",
            fontSize: 13,
            lineHeight: 1.45,
            marginTop: 8,
          }}
        >
          {createdLabel} · {Math.round(instance.config.style.opacity * 100)}%
        </div>
      </section>
      <footer
        style={{
          color: "#64748b",
          fontSize: 11,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
        title={gridId}
      >
        {gridId}
      </footer>
    </main>
  );
}
