import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppProviders } from "./providers/AppProviders";
import { HostRouter } from "./routes/HostRouter";
import { registerServiceWorker } from "./service-worker/register";
import "./styles/global.css";

registerServiceWorker();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <HostRouter />
    </AppProviders>
  </StrictMode>
);
