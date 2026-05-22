import type { WebModuleRouteRegistration } from "@repo/core/types";
import { createDefaultConsoleNavItems } from "@repo/plugin-console/web";
import { todoWebModuleRegistration } from "@repo/plugin-productivity/web";
import { ModuleRoutePlaceholderPage } from "../../pages/ModuleRoutePlaceholderPage";

export const webModuleRouteRegistrations: WebModuleRouteRegistration[] = createDefaultConsoleNavItems().map((item) => {
  if (item.id === "todos") {
    return todoWebModuleRegistration;
  }

  return {
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
  };
});
