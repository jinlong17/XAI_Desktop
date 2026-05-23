/**
 * registration.tsx — shell slot registration for the Board workspace +
 * multi-board layer (row #9).
 *
 * Exports `boardWorkspacesWebModuleRegistration` which REPLACES row #7's
 * `boardCoreWebModuleRegistration` at line 65 of
 * `apps/web/src/routes/modules/shellRegistrations.tsx` (single-line Edit
 * + one import-block swap).
 *
 * The `render` wrapper reads `lang` from `useWebShell()` which is populated
 * by `<WebShellProvider lang={lang}>` in apps/web.
 *
 * API contract: `packages/xai-web-board-workspaces/docs/api.md` §10
 * Design:       `packages/xai-web-board-workspaces/docs/design.md`
 */

import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";
import { useWebShell } from "@repo/xai-web-shell";
import { BoardWorkspacesModule } from "./BoardWorkspacesModule.js";

function BoardWorkspacesModuleRoute() {
  const { lang } = useWebShell();
  return <BoardWorkspacesModule lang={lang} />;
}

export const boardWorkspacesWebModuleRegistration: WebModuleSlotRegistration = {
  moduleId: "board",
  label: "Boards",
  defaultChildPath: "",
  children: [
    { path: "", render: BoardWorkspacesModuleRoute },
    { path: "*", render: BoardWorkspacesModuleRoute },
  ],
  icon: "kanban",
  railOrder: 3,
  i18nKey: "nav.board",
  showInRail: true,
};
