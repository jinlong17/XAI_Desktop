import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import { AppProviders } from "./providers/AppProviders";
import { router } from "./routes/router";
import { registerServiceWorker } from "./service-worker/register";
import "./styles/global.css";

registerServiceWorker();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>
);
