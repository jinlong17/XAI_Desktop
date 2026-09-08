// Type-only reliance on @repo/plugin-widgets' public WidgetManifestRegistration. The exported calendarWidgetManifest is a no-op when plugin-widgets is not present.
import type { WidgetManifestRegistration } from "@repo/plugin-widgets";
import { CalendarWidget } from "./components/CalendarWidget";

export const calendarWidgetManifest: WidgetManifestRegistration = {
  pluginName: "calendar",
  widgets: [
    {
      type: "calendar-mini",
      title: "Calendar",
      defaultSize: { width: 320, height: 430 },
      defaultConfig: {},
      render: () => <CalendarWidget />,
    },
  ],
};
