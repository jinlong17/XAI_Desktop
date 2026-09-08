import type { ConsoleModuleId, ConsoleViewCapabilities } from "@repo/core/types";
import { Link } from "react-router";
import type { ReactNode } from "react";

export interface AppShellPageProps {
  moduleId: ConsoleModuleId;
  childPath: string;
  modules: Array<{
    moduleId: ConsoleModuleId;
    label: string;
  }>;
  capabilities: ConsoleViewCapabilities;
  content: ReactNode;
}

export function AppShellPage({ moduleId, childPath, modules, capabilities, content }: AppShellPageProps) {
  return (
    <main className="host-page">
      <h1>App Shell</h1>
      <p>Module seam: /app/:moduleId/*</p>
      <p>active module: {moduleId}</p>
      <p>child path: {childPath || "(index)"}</p>
      <nav style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        {modules.map((entry) => (
          <Link key={entry.moduleId} to={`/app/${entry.moduleId}`}>
            {entry.label}
          </Link>
        ))}
      </nav>
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
        <button type="button" onClick={() => capabilities.openCommandPalette(moduleId)}>
          Open Search
        </button>
        <button type="button" onClick={() => capabilities.openSettings(moduleId)}>
          Open Settings
        </button>
      </div>
      {content}
    </main>
  );
}
