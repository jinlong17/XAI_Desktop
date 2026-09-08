/**
 * registration.tsx — matrixSlotRegistration for the Web Console rail.
 *
 * Exports a WebModuleSlotRegistration for the matrix module.
 * The MatrixSlotHost wrapper reads useWebShell().lang so the module
 * gets the active language without coupling to the host directly.
 *
 * Design: design.md §8
 * API contract: api.md §1.4
 */

import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";
import { useWebShell } from "@repo/xai-web-shell";
import { MatrixModule } from "./MatrixModule.js";

/** Inner host wrapper: reads lang from the shell context. */
function MatrixSlotHost() {
  const { lang } = useWebShell();
  return <MatrixModule lang={lang} />;
}

/** Slot registration for the Web Console AppRail. */
export const matrixSlotRegistration: WebModuleSlotRegistration = {
  moduleId: "matrix",
  label: "Matrix",
  defaultChildPath: "",
  children: [
    { path: "", render: MatrixSlotHost },
    { path: "*", render: MatrixSlotHost },
  ],
  icon: "grid4",
  railOrder: 6,
  i18nKey: "nav.matrix",
  showInRail: true,
};
