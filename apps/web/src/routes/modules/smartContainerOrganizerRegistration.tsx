import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";
import { OrganizerWorkspaceModule } from "@repo/plugin-organizer";

function OrganizerRouteHost() {
  return (
    <OrganizerWorkspaceModule
      runtimeEnv={import.meta.env as Record<string, string | undefined>}
    />
  );
}

export const organizerWebModuleRegistration: WebModuleSlotRegistration = {
  moduleId: "organizer",
  label: "Organizer",
  defaultChildPath: "",
  children: [
    { path: "", render: OrganizerRouteHost },
    { path: "*", render: OrganizerRouteHost },
  ],
  icon: "grid4",
  railOrder: 12,
  i18nKey: "nav.organizer",
  showInRail: true,
};
