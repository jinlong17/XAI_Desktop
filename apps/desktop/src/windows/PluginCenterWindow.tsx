import {
  addPluginCenterEntryToDesktop,
  createPluginInstanceStore,
  createPluginWindowAdapter,
  createWebStoragePluginInstanceAdapter,
  deletePluginInstanceOnDesktop,
  disablePluginInstanceOnDesktop,
  enablePluginInstanceOnDesktop,
  hidePluginInstanceOnDesktop,
  restoreEnabledPluginInstancesOnDesktop,
  summarizePluginWindowCapabilityError,
  summarizePluginWindowNativeApplication,
  type PluginWindowCapabilityErrorSeverity,
  type PluginWindowCapabilityErrorState,
  type PluginWindowNativeApplicationStatus,
  updatePluginInstanceConfigOnDesktop,
} from "@repo/core/registry";
import type {
  PluginCenterEntry,
  PluginCenterWindowFrame,
  PluginInstance,
  PluginInstanceSizePreset,
  PluginInstanceStyleMode,
  PluginWindowSnapshot,
} from "@repo/core/types";
import { invoke } from "@tauri-apps/api/core";
import {
  getCurrentWindow,
  LogicalPosition,
  LogicalSize,
} from "@tauri-apps/api/window";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getBuiltInPluginCenterEntries } from "../plugin-center/catalog";

const shellTokens = {
  color: {
    surfaceCanvas: "#f8fafc",
    surfaceGlass: "rgba(255, 255, 255, 0.82)",
    borderSubtle: "rgba(15, 23, 42, 0.12)",
    borderStrong: "rgba(17, 24, 39, 0.25)",
    textPrimary: "#0b1220",
    textSecondary: "#475569",
  },
  radius: {
    md: 8,
  },
  typography: {
    fontFamilySans:
      '"Space Grotesk", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontWeightMedium: 500,
    fontWeightSemibold: 600,
  },
} as const;

const SIZE_PRESETS: Record<
  PluginInstanceSizePreset,
  { preset: PluginInstanceSizePreset; width: number; height: number }
> = {
  small: { preset: "small", width: 240, height: 180 },
  medium: { preset: "medium", width: 320, height: 240 },
  large: { preset: "large", width: 420, height: 320 },
};

const STYLE_MODES: PluginInstanceStyleMode[] = [
  "system",
  "light",
  "dark",
  "minimal",
];

function statusLabel(status: PluginCenterEntry["status"]): string {
  switch (status) {
    case "available":
      return "Available";
    case "planned":
      return "Planned";
    case "disabled":
      return "Disabled";
    case "shipped":
      return "Shipped";
    case "unavailable":
      return "Unavailable";
    default:
      return status;
  }
}

function addEligibilityLabel(entry: PluginCenterEntry): string {
  return entry.canAddToDesktop ? "Eligible" : "Locked";
}

function formatList(values: readonly string[]): string {
  return values.length > 0 ? values.join(", ") : "None";
}

function lifecycleLabel(instance: PluginInstance): string {
  switch (instance.lifecycleState) {
    case "enabled":
      return "Enabled";
    case "disabled":
      return "Disabled";
    case "hidden":
      return "Hidden";
    case "destroyed":
      return "Destroyed";
    default:
      return instance.lifecycleState;
  }
}

function nativeStatusLabel(status: PluginWindowNativeApplicationStatus): string {
  switch (status) {
    case "applied":
      return "Applied";
    case "fallback":
      return "Fallback";
    case "not-requested":
      return "Not requested";
    default:
      return status;
  }
}

function nativeStatusColor(status: PluginWindowNativeApplicationStatus): string {
  switch (status) {
    case "applied":
      return "#166534";
    case "fallback":
      return "#92400e";
    case "not-requested":
      return shellTokens.color.textSecondary;
    default:
      return shellTokens.color.textSecondary;
  }
}

function capabilitySeverityLabel(
  severity: PluginWindowCapabilityErrorSeverity,
): string {
  switch (severity) {
    case "blocked":
      return "Blocked";
    case "warning":
      return "Warning";
    case "recoverable":
      return "Recoverable";
    default:
      return severity;
  }
}

function capabilitySeverityColor(
  severity: PluginWindowCapabilityErrorSeverity,
): string {
  switch (severity) {
    case "blocked":
      return "#991b1b";
    case "warning":
      return "#92400e";
    case "recoverable":
      return "#1d4ed8";
    default:
      return shellTokens.color.textSecondary;
  }
}

async function captureCurrentFrame(): Promise<PluginCenterWindowFrame> {
  const currentWindow = getCurrentWindow();
  const [position, size, isFullscreen] = await Promise.all([
    currentWindow.outerPosition(),
    currentWindow.outerSize(),
    currentWindow.isFullscreen(),
  ]);
  return {
    x: position.x,
    y: position.y,
    width: size.width,
    height: size.height,
    isFullscreen,
    navStateVersion: 1,
  };
}

export function PluginCenterWindow() {
  const entries = useMemo(() => getBuiltInPluginCenterEntries(), []);
  const instanceStore = useMemo(() => {
    if (typeof window === "undefined") return null;
    return createPluginInstanceStore({
      adapter: createWebStoragePluginInstanceAdapter(window.localStorage),
    });
  }, []);
  const windowAdapter = useMemo(
    () =>
      createPluginWindowAdapter({
        sourceLabel: "plugin-center",
        invoke: (command, args) => invoke(command, args),
      }),
    [],
  );
  const [instances, setInstances] = useState<PluginInstance[]>([]);
  const [busyPluginName, setBusyPluginName] = useState<string | null>(null);
  const [busyInstanceId, setBusyInstanceId] = useState<string | null>(null);
  const [lastWindow, setLastWindow] = useState<PluginWindowSnapshot | null>(
    null,
  );
  const [capabilityError, setCapabilityError] =
    useState<PluginWindowCapabilityErrorState | null>(null);
  const availableCount = entries.filter(
    (entry) => entry.canAddToDesktop,
  ).length;
  const lockedCount = entries.length - availableCount;
  const lastWindowNativeStates = useMemo(
    () =>
      lastWindow ? summarizePluginWindowNativeApplication(lastWindow) : [],
    [lastWindow],
  );

  useEffect(() => {
    if (!instanceStore) return;
    let cancelled = false;

    void restoreEnabledPluginInstancesOnDesktop({
      store: instanceStore,
      windowAdapter,
    })
      .then((result) => {
        if (!cancelled) {
          setInstances(result.instances);
          const lastRestored = result.restored[result.restored.length - 1];
          if (lastRestored?.window) {
            setLastWindow(lastRestored.window);
          }
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setCapabilityError(summarizePluginWindowCapabilityError(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [instanceStore, windowAdapter]);

  const handleAddToDesktop = useCallback(
    async (entry: PluginCenterEntry) => {
      if (!entry.canAddToDesktop || !instanceStore) return;
      setBusyPluginName(entry.pluginName);
      setCapabilityError(null);
      try {
        const result = await addPluginCenterEntryToDesktop(entry, {
          store: instanceStore,
          windowAdapter,
          config: {
            placement: {
              x: 120 + instances.length * 24,
              y: 120 + instances.length * 24,
            },
            size: {
              preset: "medium",
              width: 320,
              height: 240,
            },
          },
        });
        setInstances(instanceStore.list());
        setLastWindow(result.window);
      } catch (error) {
        setCapabilityError(summarizePluginWindowCapabilityError(error));
      } finally {
        setBusyPluginName(null);
      }
    },
    [instanceStore, instances.length, windowAdapter],
  );

  const runInstanceAction = useCallback(
    async (
      instanceId: string,
      action: () => Promise<{ window?: PluginWindowSnapshot } | void>,
    ) => {
      if (!instanceStore) return;
      setBusyInstanceId(instanceId);
      setCapabilityError(null);
      try {
        const result = await action();
        setInstances(instanceStore.list());
        if (result?.window) {
          setLastWindow(result.window);
        }
      } catch (error) {
        setCapabilityError(summarizePluginWindowCapabilityError(error));
      } finally {
        setBusyInstanceId(null);
      }
    },
    [instanceStore],
  );

  const handleEnableInstance = useCallback(
    (instance: PluginInstance) =>
      runInstanceAction(instance.id, () =>
        enablePluginInstanceOnDesktop(instance.id, {
          store: instanceStore!,
          windowAdapter,
        }),
      ),
    [instanceStore, runInstanceAction, windowAdapter],
  );

  const handleDisableInstance = useCallback(
    (instance: PluginInstance) =>
      runInstanceAction(instance.id, () =>
        disablePluginInstanceOnDesktop(instance.id, {
          store: instanceStore!,
          windowAdapter,
        }),
      ),
    [instanceStore, runInstanceAction, windowAdapter],
  );

  const handleHideInstance = useCallback(
    (instance: PluginInstance) =>
      runInstanceAction(instance.id, () =>
        hidePluginInstanceOnDesktop(instance.id, {
          store: instanceStore!,
          windowAdapter,
        }),
      ),
    [instanceStore, runInstanceAction, windowAdapter],
  );

  const handleDeleteInstance = useCallback(
    (instance: PluginInstance) =>
      runInstanceAction(instance.id, async () => {
        await deletePluginInstanceOnDesktop(instance.id, {
          store: instanceStore!,
          windowAdapter,
        });
        setLastWindow((current) =>
          current?.instanceId === instance.id ? null : current,
        );
      }),
    [instanceStore, runInstanceAction, windowAdapter],
  );

  const handleResetPosition = useCallback(
    (instance: PluginInstance) =>
      runInstanceAction(instance.id, () =>
        updatePluginInstanceConfigOnDesktop(
          instance.id,
          {
            placement: { x: 120, y: 120 },
          },
          {
            store: instanceStore!,
            windowAdapter,
          },
        ),
      ),
    [instanceStore, runInstanceAction, windowAdapter],
  );

  const handleSizeChange = useCallback(
    (instance: PluginInstance, preset: PluginInstanceSizePreset) =>
      runInstanceAction(instance.id, () =>
        updatePluginInstanceConfigOnDesktop(
          instance.id,
          {
            size: SIZE_PRESETS[preset],
          },
          {
            store: instanceStore!,
            windowAdapter,
          },
        ),
      ),
    [instanceStore, runInstanceAction, windowAdapter],
  );

  const handleOpacityChange = useCallback(
    (instance: PluginInstance, opacity: number) =>
      runInstanceAction(instance.id, () =>
        updatePluginInstanceConfigOnDesktop(
          instance.id,
          {
            style: { opacity },
          },
          {
            store: instanceStore!,
            windowAdapter,
          },
        ),
      ),
    [instanceStore, runInstanceAction, windowAdapter],
  );

  const handleStyleChange = useCallback(
    (instance: PluginInstance, mode: PluginInstanceStyleMode) =>
      runInstanceAction(instance.id, () =>
        updatePluginInstanceConfigOnDesktop(
          instance.id,
          {
            style: { mode },
          },
          {
            store: instanceStore!,
            windowAdapter,
          },
        ),
      ),
    [instanceStore, runInstanceAction, windowAdapter],
  );

  useEffect(() => {
    let cancelled = false;

    const restoreAndSync = async () => {
      const frame = await invoke<PluginCenterWindowFrame>(
        "get_plugin_center_window_frame",
      ).catch(() => null);
      if (!frame || cancelled) return;
      const currentWindow = getCurrentWindow();
      await currentWindow
        .setPosition(new LogicalPosition(frame.x, frame.y))
        .catch(() => undefined);
      await currentWindow
        .setSize(new LogicalSize(frame.width, frame.height))
        .catch(() => undefined);
      if (frame.isFullscreen) {
        await currentWindow.setFullscreen(true).catch(() => undefined);
      }
    };

    const persist = async () => {
      const frame = await captureCurrentFrame().catch(() => null);
      if (!frame) return;
      await invoke("set_plugin_center_window_frame", { frame }).catch(
        () => undefined,
      );
    };

    void restoreAndSync();
    const onUnload = () => {
      void persist();
    };
    window.addEventListener("beforeunload", onUnload);
    const interval = window.setInterval(() => {
      void persist();
    }, 2500);

    return () => {
      cancelled = true;
      window.removeEventListener("beforeunload", onUnload);
      window.clearInterval(interval);
      void persist();
    };
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: shellTokens.color.surfaceCanvas,
        color: shellTokens.color.textPrimary,
        fontFamily: shellTokens.typography.fontFamilySans,
        display: "grid",
        gridTemplateRows: "auto 1fr",
      }}
    >
      <header
        style={{
          borderBottom: `1px solid ${shellTokens.color.borderSubtle}`,
          padding: "18px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              color: shellTokens.color.textSecondary,
              fontSize: 12,
              fontWeight: shellTokens.typography.fontWeightMedium,
              textTransform: "uppercase",
            }}
          >
            Desktop Plugin Platform
          </div>
          <h1
            style={{
              fontSize: 22,
              lineHeight: 1.2,
              margin: "4px 0 0",
              fontWeight: shellTokens.typography.fontWeightSemibold,
            }}
          >
            Plugin Center
          </h1>
        </div>
        <div
          style={{
            border: `1px solid ${shellTokens.color.borderSubtle}`,
            borderRadius: shellTokens.radius.md,
            color: shellTokens.color.textSecondary,
            fontSize: 12,
            padding: "6px 10px",
          }}
        >
          Phase 1 Shell
        </div>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "180px minmax(0, 1fr)",
          minHeight: 0,
        }}
      >
        <nav
          aria-label="Plugin Center sections"
          style={{
            borderRight: `1px solid ${shellTokens.color.borderSubtle}`,
            padding: 16,
            display: "grid",
            alignContent: "start",
            gap: 8,
          }}
        >
          {["Catalog", "Desktop", "Settings"].map((item, index) => (
            <button
              key={item}
              type="button"
              disabled={index !== 0}
              style={{
                border: `1px solid ${
                  index === 0
                    ? shellTokens.color.borderStrong
                    : shellTokens.color.borderSubtle
                }`,
                borderRadius: shellTokens.radius.md,
                background:
                  index === 0 ? shellTokens.color.surfaceGlass : "transparent",
                color:
                  index === 0
                    ? shellTokens.color.textPrimary
                    : shellTokens.color.textSecondary,
                cursor: index === 0 ? "default" : "not-allowed",
                fontSize: 13,
                fontWeight: shellTokens.typography.fontWeightMedium,
                minHeight: 34,
                textAlign: "left",
                padding: "0 10px",
              }}
            >
              {item}
            </button>
          ))}
        </nav>

        <div
          style={{
            padding: 24,
            display: "grid",
            alignContent: "start",
            gap: 16,
          }}
        >
          <section
            style={{
              border: `1px solid ${shellTokens.color.borderSubtle}`,
              borderRadius: shellTokens.radius.md,
              background: shellTokens.color.surfaceGlass,
              padding: 18,
              display: "grid",
              gap: 10,
            }}
          >
            <div
              style={{
                color: shellTokens.color.textPrimary,
                fontSize: 16,
                fontWeight: shellTokens.typography.fontWeightSemibold,
              }}
            >
              Catalog
            </div>
            <dl
              style={{
                color: shellTokens.color.textSecondary,
                fontSize: 13,
                display: "grid",
                gridTemplateColumns: "140px minmax(0, 1fr)",
                gap: "8px 12px",
                margin: 0,
              }}
            >
              <dt>Registry source</dt>
              <dd style={{ margin: 0, color: shellTokens.color.textPrimary }}>
                Built-in
              </dd>
              <dt>Available</dt>
              <dd style={{ margin: 0, color: shellTokens.color.textPrimary }}>
                {availableCount}
              </dd>
              <dt>Locked</dt>
              <dd style={{ margin: 0, color: shellTokens.color.textPrimary }}>
                {lockedCount}
              </dd>
              <dt>Desktop instances</dt>
              <dd style={{ margin: 0, color: shellTokens.color.textPrimary }}>
                {instances.length}
              </dd>
              {lastWindow ? (
                <>
                  <dt>Last window</dt>
                  <dd
                    style={{ margin: 0, color: shellTokens.color.textPrimary }}
                  >
                    {lastWindow.instanceId}
                  </dd>
                  <dt>Native state</dt>
                  <dd
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 6,
                      margin: 0,
                    }}
                  >
                    {lastWindowNativeStates.map((state) => (
                      <span
                        key={state.key}
                        style={{
                          border: `1px solid ${shellTokens.color.borderSubtle}`,
                          borderRadius: shellTokens.radius.md,
                          color: nativeStatusColor(state.status),
                          fontSize: 11,
                          lineHeight: 1.2,
                          padding: "4px 6px",
                        }}
                        title={`${state.label}: ${state.value}`}
                      >
                        {state.label}: {nativeStatusLabel(state.status)}
                      </span>
                    ))}
                  </dd>
                </>
              ) : null}
            </dl>
            {capabilityError ? (
              <div
                role="alert"
                style={{
                  border: `1px solid ${shellTokens.color.borderSubtle}`,
                  borderRadius: shellTokens.radius.md,
                  color: shellTokens.color.textPrimary,
                  fontSize: 12,
                  lineHeight: 1.4,
                  padding: "8px 10px",
                }}
              >
                <div
                  style={{
                    color: capabilitySeverityColor(capabilityError.severity),
                    fontWeight: shellTokens.typography.fontWeightSemibold,
                  }}
                >
                  {capabilityError.title} ·{" "}
                  {capabilitySeverityLabel(capabilityError.severity)}
                </div>
                <div style={{ marginTop: 4 }}>{capabilityError.message}</div>
                <div
                  style={{
                    color: shellTokens.color.textSecondary,
                    marginTop: 4,
                  }}
                >
                  {capabilityError.code} · {capabilityError.capability} ·{" "}
                  {capabilityError.recoverable
                    ? "Recoverable"
                    : "Not recoverable"}
                </div>
              </div>
            ) : null}
          </section>

          <section
            style={{
              border: `1px solid ${shellTokens.color.borderSubtle}`,
              borderRadius: shellTokens.radius.md,
              background: shellTokens.color.surfaceGlass,
              overflow: "hidden",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr style={{ color: shellTokens.color.textSecondary }}>
                  {[
                    "Plugin",
                    "Status",
                    "Surfaces",
                    "Content",
                    "Desktop",
                    "Action",
                  ].map((heading) => (
                    <th
                      key={heading}
                      scope="col"
                      style={{
                        borderBottom: `1px solid ${shellTokens.color.borderSubtle}`,
                        fontWeight: shellTokens.typography.fontWeightMedium,
                        padding: "10px 12px",
                        textAlign: "left",
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.pluginName}>
                    <td
                      style={{
                        borderBottom: `1px solid ${shellTokens.color.borderSubtle}`,
                        padding: "12px",
                        verticalAlign: "top",
                      }}
                    >
                      <div
                        style={{
                          color: shellTokens.color.textPrimary,
                          fontWeight: shellTokens.typography.fontWeightSemibold,
                        }}
                      >
                        {entry.displayName}
                      </div>
                      <div
                        style={{
                          color: shellTokens.color.textSecondary,
                          fontSize: 12,
                          marginTop: 4,
                        }}
                      >
                        {entry.pluginName}
                      </div>
                    </td>
                    <td
                      style={{
                        borderBottom: `1px solid ${shellTokens.color.borderSubtle}`,
                        color: shellTokens.color.textPrimary,
                        padding: "12px",
                        verticalAlign: "top",
                      }}
                    >
                      {statusLabel(entry.status)}
                    </td>
                    <td
                      style={{
                        borderBottom: `1px solid ${shellTokens.color.borderSubtle}`,
                        color: shellTokens.color.textSecondary,
                        padding: "12px",
                        verticalAlign: "top",
                      }}
                    >
                      {formatList(entry.supportedSurfaces)}
                    </td>
                    <td
                      style={{
                        borderBottom: `1px solid ${shellTokens.color.borderSubtle}`,
                        color: shellTokens.color.textSecondary,
                        padding: "12px",
                        verticalAlign: "top",
                      }}
                    >
                      {formatList(entry.contentTypes)}
                    </td>
                    <td
                      style={{
                        borderBottom: `1px solid ${shellTokens.color.borderSubtle}`,
                        color: shellTokens.color.textPrimary,
                        padding: "12px",
                        verticalAlign: "top",
                      }}
                    >
                      {addEligibilityLabel(entry)}
                    </td>
                    <td
                      style={{
                        borderBottom: `1px solid ${shellTokens.color.borderSubtle}`,
                        padding: "12px",
                        verticalAlign: "top",
                      }}
                    >
                      <button
                        type="button"
                        disabled={
                          !entry.canAddToDesktop ||
                          busyPluginName === entry.pluginName
                        }
                        onClick={() => {
                          void handleAddToDesktop(entry);
                        }}
                        style={{
                          border: `1px solid ${shellTokens.color.borderSubtle}`,
                          borderRadius: shellTokens.radius.md,
                          background: entry.canAddToDesktop
                            ? shellTokens.color.textPrimary
                            : "transparent",
                          color: entry.canAddToDesktop
                            ? shellTokens.color.surfaceCanvas
                            : shellTokens.color.textSecondary,
                          cursor: entry.canAddToDesktop
                            ? "pointer"
                            : "not-allowed",
                          fontSize: 12,
                          minHeight: 30,
                          minWidth: 64,
                          padding: "0 10px",
                          opacity:
                            busyPluginName === entry.pluginName ? 0.72 : 1,
                        }}
                      >
                        {busyPluginName === entry.pluginName
                          ? "Adding"
                          : entry.canAddToDesktop
                            ? "Add"
                            : "Locked"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section
            style={{
              border: `1px solid ${shellTokens.color.borderSubtle}`,
              borderRadius: shellTokens.radius.md,
              background: shellTokens.color.surfaceGlass,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                borderBottom: `1px solid ${shellTokens.color.borderSubtle}`,
                color: shellTokens.color.textPrimary,
                fontSize: 16,
                fontWeight: shellTokens.typography.fontWeightSemibold,
                padding: "14px 16px",
              }}
            >
              Desktop Instances
            </div>
            {instances.length === 0 ? (
              <div
                style={{
                  color: shellTokens.color.textSecondary,
                  fontSize: 13,
                  padding: "14px 16px",
                }}
              >
                No instances
              </div>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr style={{ color: shellTokens.color.textSecondary }}>
                    {[
                      "Instance",
                      "State",
                      "Placement",
                      "Size",
                      "Style",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        scope="col"
                        style={{
                          borderBottom: `1px solid ${shellTokens.color.borderSubtle}`,
                          fontWeight: shellTokens.typography.fontWeightMedium,
                          padding: "10px 12px",
                          textAlign: "left",
                        }}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {instances.map((instance) => {
                    const busy = busyInstanceId === instance.id;
                    return (
                      <tr key={instance.id}>
                        <td
                          style={{
                            borderBottom: `1px solid ${shellTokens.color.borderSubtle}`,
                            padding: "12px",
                            verticalAlign: "top",
                          }}
                        >
                          <div
                            style={{
                              color: shellTokens.color.textPrimary,
                              fontWeight:
                                shellTokens.typography.fontWeightSemibold,
                            }}
                          >
                            {instance.pluginName}
                          </div>
                          <div
                            style={{
                              color: shellTokens.color.textSecondary,
                              fontSize: 12,
                              marginTop: 4,
                            }}
                          >
                            {instance.id}
                          </div>
                        </td>
                        <td
                          style={{
                            borderBottom: `1px solid ${shellTokens.color.borderSubtle}`,
                            color: shellTokens.color.textPrimary,
                            padding: "12px",
                            verticalAlign: "top",
                          }}
                        >
                          {lifecycleLabel(instance)}
                        </td>
                        <td
                          style={{
                            borderBottom: `1px solid ${shellTokens.color.borderSubtle}`,
                            color: shellTokens.color.textSecondary,
                            padding: "12px",
                            verticalAlign: "top",
                          }}
                        >
                          {Math.round(instance.config.placement.x)},{" "}
                          {Math.round(instance.config.placement.y)}
                        </td>
                        <td
                          style={{
                            borderBottom: `1px solid ${shellTokens.color.borderSubtle}`,
                            padding: "12px",
                            verticalAlign: "top",
                          }}
                        >
                          <select
                            value={instance.config.size.preset}
                            disabled={busy}
                            onChange={(event) => {
                              void handleSizeChange(
                                instance,
                                event.target.value as PluginInstanceSizePreset,
                              );
                            }}
                            style={{
                              minHeight: 30,
                              minWidth: 96,
                            }}
                          >
                            {Object.keys(SIZE_PRESETS).map((preset) => (
                              <option key={preset} value={preset}>
                                {preset}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td
                          style={{
                            borderBottom: `1px solid ${shellTokens.color.borderSubtle}`,
                            padding: "12px",
                            verticalAlign: "top",
                          }}
                        >
                          <div
                            style={{
                              display: "grid",
                              gap: 8,
                              minWidth: 160,
                            }}
                          >
                            <select
                              value={instance.config.style.mode}
                              disabled={busy}
                              onChange={(event) => {
                                void handleStyleChange(
                                  instance,
                                  event.target.value as PluginInstanceStyleMode,
                                );
                              }}
                              style={{ minHeight: 30 }}
                            >
                              {STYLE_MODES.map((mode) => (
                                <option key={mode} value={mode}>
                                  {mode}
                                </option>
                              ))}
                            </select>
                            <input
                              type="range"
                              min="0.4"
                              max="1"
                              step="0.1"
                              value={instance.config.style.opacity}
                              disabled={busy}
                              onChange={(event) => {
                                void handleOpacityChange(
                                  instance,
                                  Number(event.target.value),
                                );
                              }}
                            />
                          </div>
                        </td>
                        <td
                          style={{
                            borderBottom: `1px solid ${shellTokens.color.borderSubtle}`,
                            padding: "12px",
                            verticalAlign: "top",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 6,
                            }}
                          >
                            {[
                              {
                                label: "Enable",
                                onClick: () => handleEnableInstance(instance),
                                disabled: instance.lifecycleState === "enabled",
                              },
                              {
                                label: "Disable",
                                onClick: () => handleDisableInstance(instance),
                                disabled:
                                  instance.lifecycleState === "disabled",
                              },
                              {
                                label: "Hide",
                                onClick: () => handleHideInstance(instance),
                                disabled: instance.lifecycleState === "hidden",
                              },
                              {
                                label: "Reset",
                                onClick: () => handleResetPosition(instance),
                                disabled: false,
                              },
                              {
                                label: "Delete",
                                onClick: () => handleDeleteInstance(instance),
                                disabled: false,
                              },
                            ].map((action) => (
                              <button
                                key={action.label}
                                type="button"
                                disabled={busy || action.disabled}
                                onClick={() => {
                                  void action.onClick();
                                }}
                                style={{
                                  border: `1px solid ${shellTokens.color.borderSubtle}`,
                                  borderRadius: shellTokens.radius.md,
                                  background: "transparent",
                                  color: shellTokens.color.textPrimary,
                                  cursor:
                                    busy || action.disabled
                                      ? "not-allowed"
                                      : "pointer",
                                  fontSize: 12,
                                  minHeight: 30,
                                  padding: "0 10px",
                                }}
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

export default PluginCenterWindow;
