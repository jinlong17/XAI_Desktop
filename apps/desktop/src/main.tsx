import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { GridWindow } from "./windows/GridWindow";
import { ControlWindow } from "./windows/ControlWindow";
import { ConsoleWindow } from "./windows/ConsoleWindow";
import { PluginCenterWindow } from "./windows/PluginCenterWindow";
import "./index.css";
import { registerAccountPlugin } from "@repo/plugin-account";
import { registerAiCubePlugin } from "@repo/plugin-ai-cube";
import { registerConsolePlugin } from "@repo/plugin-console";
import { registerLabelsPlugin } from "@repo/plugin-labels";
import { registerOrganizerPlugin } from "@repo/plugin-organizer";
import { registerProductivityPlugin } from "@repo/plugin-productivity";

/**
 * Simple hash router for multi-window architecture.
 * Main window loads "/" route
 * Grid windows load "/desktop-host/index.html#/grid?id=xxx" route
 * Control window loads "/desktop-host/index.html#/control" route
 * Console window loads "/desktop-host/index.html#/console" route
 * Plugin Center window loads "/desktop-host/index.html#/plugin-center" route
 */
function Router() {
  const hash = window.location.hash;

  // Parse grid window route: /#/grid?id=xxx
  if (hash.startsWith("#/grid")) {
    const params = new URLSearchParams(hash.split("?")[1] || "");
    const gridId = params.get("id");

    if (gridId) {
      return <GridWindow gridId={gridId} />;
    }
  }

  if (hash.startsWith("#/control")) {
    return <ControlWindow />;
  }

  if (hash.startsWith("#/console")) {
    return <ConsoleWindow />;
  }

  if (hash.startsWith("#/plugin-center")) {
    return <PluginCenterWindow />;
  }

  // Default: main app
  return <App />;
}

// Static plugin registration — above createRoot (red line #1/#8: registration only, no sync logic)
registerAccountPlugin();
registerAiCubePlugin();
registerOrganizerPlugin();
registerProductivityPlugin();
registerLabelsPlugin();
registerConsolePlugin();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>,
);
