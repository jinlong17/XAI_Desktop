import type { ConsoleModuleId } from "@repo/core/types";
import { Link } from "react-router";
import type { ReactNode } from "react";

export interface AppShellPageProps {
  moduleId: ConsoleModuleId;
  childPath: string;
  modules: Array<{
    moduleId: ConsoleModuleId;
    label: string;
  }>;
  content: ReactNode;
}

export function AppShellPage({ moduleId, childPath, modules, content }: AppShellPageProps) {
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
      {content}
    </main>
  );
}
