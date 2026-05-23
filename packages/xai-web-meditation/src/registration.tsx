/**
 * registration.tsx — meditationSlotRegistration for the Web Console rail.
 *
 * Exports a WebModuleSlotRegistration for the meditation module.
 * The MeditationSlotHost wrapper reads useWebShell().lang so the module
 * gets the active language without coupling to the host directly.
 *
 * Design: docs/design.md §8
 * API contract: docs/api.md §1.4
 */

import type { JSX } from "react";
import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";
import { useWebShell } from "@repo/xai-web-shell";
import { MeditationModule } from "./MeditationModule.js";

/** Inner host wrapper: reads lang from the shell context. */
function MeditationSlotHost(): JSX.Element {
  const { lang } = useWebShell();
  return <MeditationModule lang={lang} />;
}

/** Slot registration for the Web Console AppRail. */
export const meditationSlotRegistration: WebModuleSlotRegistration = {
  moduleId: "meditation",
  label: "Meditation",
  defaultChildPath: "",
  children: [
    { path: "", render: MeditationSlotHost },
    { path: "*", render: MeditationSlotHost },
  ],
  icon: "leaf",
  railOrder: 9,
  i18nKey: "nav.meditation",
  showInRail: true,
};
