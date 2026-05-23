/**
 * registration.tsx — shell slot registration for the Board (Kanban) module.
 *
 * Exports `boardCoreWebModuleRegistration` which is consumed by
 * `apps/web/src/routes/modules/shellRegistrations.tsx` (replaces line 59's
 * `placeholder("board", "Boards", "kanban", 3)`).
 *
 * The `render` wrapper reads `lang` from `useWebShell()` which is populated
 * by `<WebShellProvider lang={lang}>` in apps/web.
 *
 * API contract: `packages/xai-web-board-core/docs/api.md` §7
 * Design: `packages/xai-web-board-core/docs/design.md`
 */

import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";
import { useWebShell } from "@repo/xai-web-shell";
import { BoardModule } from "./BoardModule.js";

function BoardModuleRoute() {
  const { lang } = useWebShell();
  return <BoardModule lang={lang} />;
}

export const boardCoreWebModuleRegistration: WebModuleSlotRegistration = {
  moduleId: "board",
  label: "Boards",
  defaultChildPath: "",
  children: [
    { path: "", render: BoardModuleRoute },
    { path: "*", render: BoardModuleRoute },
  ],
  icon: "kanban",
  railOrder: 3,
  i18nKey: "nav.board",
  showInRail: true,
};
