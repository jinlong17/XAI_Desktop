import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { GridWindow } from "./windows/GridWindow";
import { ControlWindow } from "./windows/ControlWindow";
import { ConsoleWindow } from "./windows/ConsoleWindow";
import "./index.css";
import { registerAccountPlugin } from "@repo/plugin-account/register-plugin";
import { registerAiCubePlugin } from "@repo/plugin-ai-cube";
import { registerConsolePlugin } from "../../../packages/plugin-console/src";
import { registerLabelsPlugin } from "../../../packages/plugin-labels/src";
import { registerProductivityPlugin } from "../../../packages/plugin-productivity/src";

/**
 * Simple hash router for multi-window architecture.
 * Main window loads "/" route
 * Grid windows load "/#/grid?id=xxx" route
 * Control window loads "/#/control" route
 * Console window loads "/#/console" route
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

  // Default: main app
  return <App />;
}

// Static plugin registration — above createRoot (red line #1/#8: registration only, no sync logic)
registerAccountPlugin();
registerAiCubePlugin();
registerProductivityPlugin();
registerLabelsPlugin();
registerConsolePlugin();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>,
);
