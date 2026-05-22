import type { WebModuleRouteRegistration } from "@repo/core/types";
import { createDefaultConsoleNavItems } from "@repo/plugin-console/web";
import { ModuleRoutePlaceholderPage } from "../../pages/ModuleRoutePlaceholderPage";

export const webModuleRouteRegistrations: WebModuleRouteRegistration[] = createDefaultConsoleNavItems().map((item) => ({
  moduleId: item.id,
  label: item.label,
  defaultChildPath: "inbox",
  children: [
    {
      path: "",
      render: ModuleRoutePlaceholderPage,
    },
    {
      path: "inbox",
      render: ModuleRoutePlaceholderPage,
    },
    {
      path: "*",
      render: ModuleRoutePlaceholderPage,
    },
  ],
}));
