/**
 * BoardSwitcher — modal that lists boards grouped by workspace, with search
 * + scope tabs + "+ New board" + delete affordance.
 *
 * Port of `web design/module-board.jsx` lines 1282..1366.
 */

import { useState } from "react";
import type { Board, BoardWorkspace } from "@repo/plugin-web-board-core";
import { STR_SWITCHER, type Lang } from "./internal/strings.js";

export interface BoardSwitcherProps {
  lang: Lang;
  workspaces: readonly BoardWorkspace[];
  boards: readonly Board[];
  activeBoardId: string;
  onPick: (boardId: string) => void;
  onCreate: () => void;
  /**
   * Called when user clicks the trash icon on a board card.
   * Semantics: "request delete confirmation" — the HOST owns the confirmation
   * gate (BoardDeleteConfirmDialog), matching the host-level state-lift pattern
   * used for CardDetailDialog (Audit Top-10 #5). No window.confirm() here.
   */
  onRequestDelete: (boardId: string) => void;
  onClose: () => void;
}

/** Compute the visible groups + filtered boards for the current search + scope. */
function applyFilter(
  boards: readonly Board[],
  workspaces: readonly BoardWorkspace[],
  filter: string,
  scope: "all" | string,
  lang: Lang,
): { filtered: Board[]; groupedByWs: { ws: BoardWorkspace; boards: Board[] }[] } {
  const q = filter.toLowerCase();
  const filtered = boards.filter((b) => {
    if (scope !== "all" && b.workspaceId !== scope) return false;
    if (q && !b.name[lang].toLowerCase().includes(q)) return false;
    return true;
  });
  const groupedByWs = workspaces.map((ws) => ({
    ws,
    boards: filtered.filter((b) => b.workspaceId === ws.id),
  }));
  return { filtered, groupedByWs };
}

export function BoardSwitcher({
  lang,
  workspaces,
  boards,
  activeBoardId,
  onPick,
  onCreate,
  onRequestDelete,
  onClose,
}: BoardSwitcherProps) {
  const [filter, setFilter] = useState("");
  const [scope, setScope] = useState<"all" | string>("all");
  const { filtered, groupedByWs } = applyFilter(boards, workspaces, filter, scope, lang);
  const totalFiltered = groupedByWs.reduce((n, g) => n + g.boards.length, 0);

  // B-12 fix: request confirmation from host instead of using window.confirm().
  // Host owns the BoardDeleteConfirmDialog state (pendingDelete).
  const handleDelete = (e: React.MouseEvent, boardId: string) => {
    e.stopPropagation();
    onRequestDelete(boardId);
  };

  return (
    <div className="modal-scrim" onClick={onClose} data-testid="bs-scrim">
      <div className="board-switcher" onClick={(e) => e.stopPropagation()}>
        <header className="bs-head">
          <div className="bs-search">
            <input
              autoFocus
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={STR_SWITCHER.searchPlaceholder[lang]}
              data-testid="bs-search-input"
            />
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label={lang === "zh" ? "关闭" : "Close"}
          >
            ×
          </button>
        </header>

        <div className="bs-scopes">
          <button
            type="button"
            aria-selected={scope === "all"}
            onClick={() => setScope("all")}
          >
            {STR_SWITCHER.all[lang]}
          </button>
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              type="button"
              aria-selected={scope === ws.id}
              onClick={() => setScope(ws.id)}
            >
              <span className="ws-dot" style={{ background: ws.color }}></span>
              {ws.name[lang]}
            </button>
          ))}
          <span className="grow"></span>
          <button
            type="button"
            className="btn primary bs-new"
            onClick={onCreate}
            data-testid="bs-new-board"
          >
            + {STR_SWITCHER.newBoard[lang]}
          </button>
        </div>

        <div className="bs-body">
          {(scope === "all"
            ? groupedByWs
            : groupedByWs.filter((g) => g.ws.id === scope)
          ).map(({ ws, boards: wsBoards }) =>
            wsBoards.length > 0 ? (
              <section key={ws.id} className="bs-group">
                <header className="bs-group-h">
                  <span className="ws-dot" style={{ background: ws.color }}></span>
                  <h3>{ws.name[lang]}</h3>
                  <span className="muted">{wsBoards.length}</span>
                </header>
                <div className="bs-grid">
                  {wsBoards.map((b) => {
                    const cardCount = b.lists.reduce(
                      (n, l) => n + l.cards.length,
                      0,
                    );
                    const isActive = b.id === activeBoardId;
                    const showDelete = !isActive && totalFiltered > 1;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        className={"bs-card" + (isActive ? " active" : "")}
                        onClick={() => onPick(b.id)}
                        data-testid={`bs-card-${b.id}`}
                      >
                        <div className="bs-cover" style={{ background: b.cover }}>
                          <span className="bs-cover-icon" aria-hidden="true">
                            {b.template === "pm" ? "▤" : "▦"}
                          </span>
                        </div>
                        <div className="bs-info">
                          <div className="bs-name">{b.name[lang]}</div>
                          <div className="bs-meta mono">
                            {cardCount} {STR_SWITCHER.cards[lang]}
                          </div>
                        </div>
                        {showDelete && (
                          <button
                            type="button"
                            className="bs-delete"
                            title={STR_SWITCHER.deleteTitle[lang]}
                            data-testid={`bs-delete-${b.id}`}
                            onClick={(e) => handleDelete(e, b.id)}
                          >
                            🗑
                          </button>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : null,
          )}
          {filtered.length === 0 && (
            <div className="bs-empty">{STR_SWITCHER.noMatching[lang]}</div>
          )}
        </div>
      </div>
    </div>
  );
}
