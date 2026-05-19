import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { GridWindow } from "./windows/GridWindow";
import { ControlWindow } from "./windows/ControlWindow";
import "./index.css";
import { registerAccountPlugin } from "@repo/plugin-account";

/**
 * Simple hash router for multi-window architecture.
 * Main window loads "/" route
 * Grid windows load "/#/grid?id=xxx" route
 * Control window loads "/#/control" route
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

  // Default: main app
  return <App />;
}

// Static plugin registration — above createRoot (red line #1/#8: registration only, no sync logic)
registerAccountPlugin();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>,
);
