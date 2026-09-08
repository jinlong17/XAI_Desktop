/**
 * registration.tsx — shell slot registration for the Board Views module (row #8).
 *
 * Exports `boardViewsWebModuleRegistration` which may be consumed by
 * `apps/web/src/routes/modules/shellRegistrations.tsx` when row #8 directly
 * occupies the "board" slot. In the W2e build, row #9 (board-workspaces)
 * already occupies railOrder 3 and wraps the view picker inside its own shell,
 * so this registration is exported but NOT inserted into shellRegistrations.tsx
 * during the W2e parallel build — it is available for future use (e.g., a
 * standalone deployment without board-workspaces).
 *
 * The `render` wrapper reads `lang` from `useWebShell()` which is populated
 * by `<WebShellProvider lang={lang}>` in apps/web.
 *
 * API contract: packages/xai-web-board-views/docs/api.md §9
 * Row anchor: xai-web-board-views (#8, Wave W2e)
 */

import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";
import { useWebShell } from "@repo/xai-web-shell";
import { BoardModule } from "./BoardModule.js";

function BoardViewsRoute() {
  const { lang } = useWebShell();
  return <BoardModule lang={lang} />;
}

/**
 * Shell slot registration for the Board Views module.
 *
 * moduleId: "board" — same as board-core row #7 (this row supersedes it
 *   when used directly; in W2e the board-workspaces row #9 occupies the slot).
 * railOrder: 3 — matches prototype DEFAULT_ITEMS ordering.
 * showInRail: true — the Board route is always visible in the side rail.
 */
export const boardViewsWebModuleRegistration: WebModuleSlotRegistration = {
  moduleId: "board",
  label: "Boards",
  defaultChildPath: "",
  children: [
    { path: "", render: BoardViewsRoute },
    { path: "*", render: BoardViewsRoute },
  ],
  icon: "kanban",
  railOrder: 3,
  i18nKey: "nav.board",
  showInRail: true,
};
