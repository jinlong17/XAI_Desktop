import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import GridWindowApp from "./components/GridWindow/GridWindowApp";
import ControlWindowApp from "./components/ControlWindow/ControlWindowApp";
import "./index.css";

/**
 * Simple hash router for multi-window architecture.
 * Main window loads "/" route
 * Grid windows load "/#/grid?id=xxx" route
 */
function Router() {
  const hash = window.location.hash;

  // Parse grid window route: /#/grid?id=xxx
  if (hash.startsWith("#/grid")) {
    const params = new URLSearchParams(hash.split("?")[1] || "");
    const gridId = params.get("id");

    if (gridId) {
      return <GridWindowApp gridId={gridId} />;
    }
  }

  if (hash.startsWith("#/control")) {
    return <ControlWindowApp />;
  }

  // Default: main app
  return <App />;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>,
);
