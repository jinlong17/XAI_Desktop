import type { ConsoleViewCapabilities } from "@repo/core/types";

export interface ModuleRoutePlaceholderPageProps {
  moduleId: string;
  childPath: string;
  capabilities: ConsoleViewCapabilities;
}

export function ModuleRoutePlaceholderPage({ moduleId, childPath, capabilities }: ModuleRoutePlaceholderPageProps) {
  async function downloadSample() {
    await capabilities.download({
      filename: `${moduleId}-placeholder.txt`,
      mimeType: "text/plain",
      blob: new Blob([`module=${moduleId};path=${childPath}`], { type: "text/plain" }),
    });
  }

  async function notifySample() {
    await capabilities.notify({
      title: `Module: ${moduleId}`,
      body: `child=${childPath || "(index)"}`,
      tag: `module-${moduleId}`,
    });
  }

  async function runUnsupportedStubs() {
    await capabilities.beginDrag({ moduleId, childPath });
    await capabilities.invokeNativeCapability("desktop-window-focus");
  }

  return (
    <section>
      <h2>{moduleId}</h2>
      <p>Module route: /app/{moduleId}/{childPath || "(index)"}</p>
      <p>This module remains placeholder-mounted in W6.</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
        <button type="button" onClick={() => capabilities.openCommandPalette(moduleId)}>
          Search Stub
        </button>
        <button type="button" onClick={() => capabilities.openSettings(moduleId)}>
          Settings Stub
        </button>
        <button type="button" onClick={downloadSample}>
          Download Stub
        </button>
        <button type="button" onClick={notifySample}>
          Notification Stub
        </button>
        <button type="button" onClick={runUnsupportedStubs}>
          Unsupported Native Stub
        </button>
      </div>
    </section>
  );
}
