import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import {
  applyMobileRuntimeAttributes,
  getBrowserMobileRuntimeProbe,
  getMobileRuntimeFlags,
} from "./mobile/runtime";
import { bootstrapObservability } from "./observability/runtime";
import { AppProviders } from "./providers/AppProviders";
import { router } from "./routes/router";
import { registerServiceWorker } from "./service-worker/register";
import "@repo/plugin-web-tokens";
import "./styles/global.css";

registerServiceWorker();
bootstrapObservability();
applyMobileRuntimeAttributes(
  document.documentElement,
  getMobileRuntimeFlags(getBrowserMobileRuntimeProbe())
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>
);
