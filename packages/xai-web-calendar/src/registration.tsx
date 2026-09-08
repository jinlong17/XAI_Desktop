/**
 * registration.tsx — calendarSlotRegistration for the Web Console rail.
 *
 * Exports a WebModuleSlotRegistration for the calendar module.
 * The CalendarSlotHost wrapper reads useWebShell().lang so the module
 * gets the active language without coupling to the host directly.
 *
 * Design: docs/design.md §8
 * API contract: docs/api.md §1.3
 */

import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";
import { useWebShell } from "@repo/xai-web-shell";
import { CalendarModule } from "./CalendarModule.js";

/** Inner host wrapper: reads lang from the shell context. */
function CalendarSlotHost() {
  const { lang } = useWebShell();
  return <CalendarModule lang={lang} />;
}

/** Slot registration for the Web Console AppRail (railOrder 5). */
export const calendarSlotRegistration: WebModuleSlotRegistration = {
  moduleId: "calendar",
  label: "Calendar",
  defaultChildPath: "",
  children: [
    { path: "", render: CalendarSlotHost },
    { path: "*", render: CalendarSlotHost },
  ],
  icon: "calendar",
  railOrder: 5,
  i18nKey: "nav.calendar",
  showInRail: true,
};
