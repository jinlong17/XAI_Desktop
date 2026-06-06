import {
  addPluginCenterEntryToDesktop,
  createPluginInstanceStore,
  createPluginWindowAdapter,
  createWebStoragePluginInstanceAdapter,
} from "@repo/core/registry";
import type {
  PluginCenterEntry,
  PluginCenterWindowFrame,
  PluginInstance,
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

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return typeof error === "string" ? error : "Unknown Plugin Center error";
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
  const [lastWindow, setLastWindow] = useState<PluginWindowSnapshot | null>(
    null,
  );
  const [addError, setAddError] = useState<string | null>(null);
  const availableCount = entries.filter(
    (entry) => entry.canAddToDesktop,
  ).length;
  const lockedCount = entries.length - availableCount;

  useEffect(() => {
    if (!instanceStore) return;
    let cancelled = false;

    void instanceStore
      .load()
      .then((loadedInstances) => {
        if (!cancelled) {
          setInstances(loadedInstances);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setAddError(formatError(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [instanceStore]);

  const handleAddToDesktop = useCallback(
    async (entry: PluginCenterEntry) => {
      if (!entry.canAddToDesktop || !instanceStore) return;
      setBusyPluginName(entry.pluginName);
      setAddError(null);
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
        setAddError(formatError(error));
      } finally {
        setBusyPluginName(null);
      }
    },
    [instanceStore, instances.length, windowAdapter],
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
                </>
              ) : null}
            </dl>
            {addError ? (
              <div
                role="alert"
                style={{
                  color: "#991b1b",
                  fontSize: 12,
                  lineHeight: 1.4,
                }}
              >
                {addError}
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
        </div>
      </section>
    </main>
  );
}

export default PluginCenterWindow;
