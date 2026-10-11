/**
 * BoardSwitcher — modal that lists boards grouped by workspace, with search
 * + scope tabs + "+ New board" + delete affordance.
 *
 * Port of `web design/module-board.jsx` lines 1282..1366.
 */

import type { WorkspaceAction } from "./internal/useWorkspaceSaveRecovery.js";
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
  /** Workspace CRUD (W3). All four must be provided to enable the editor UI. */
  onCreateWorkspace?: (name: string) => boolean | void;
  onRenameWorkspace?: (id: string, name: string) => boolean | void;
  onRecolorWorkspace?: (id: string) => void;
  /** Host refuses deletion of non-empty or last workspaces; UI also hides it. */
  onDeleteWorkspace?: (id: string) => void;
  saveError?: string | null;
  pendingAction?: WorkspaceAction;
  exportFailed?: boolean;
  onRetrySave?: (latestName?: string) => boolean;
  onExportSave?: (latestName?: string) => void;
  onDiscardSave?: () => void;
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
  onCreateWorkspace,
  onRenameWorkspace,
  onRecolorWorkspace,
  onDeleteWorkspace,
  saveError, pendingAction, exportFailed, onRetrySave, onExportSave, onDiscardSave,
}: BoardSwitcherProps) {
  const [filter, setFilter] = useState("");
  const [rawScope, setScope] = useState<"all" | string>("all");
  const [wsComposerOpen, setWsComposerOpen] = useState(false);
  const [newWsName, setNewWsName] = useState("");
  const [renamingWsId, setRenamingWsId] = useState<string | null>(null);
  const [renameWsText, setRenameWsText] = useState("");
  // A deleted workspace id may linger in local scope state — fall back to all.
  const scope =
    rawScope === "all" || workspaces.some((ws) => ws.id === rawScope)
      ? rawScope
      : "all";
  const { filtered, groupedByWs } = applyFilter(boards, workspaces, filter, scope, lang);
  const totalFiltered = groupedByWs.reduce((n, g) => n + g.boards.length, 0);
  const wsEditable = Boolean(
    onCreateWorkspace && onRenameWorkspace && onRecolorWorkspace && onDeleteWorkspace,
  );

  const submitNewWorkspace = () => {
    const name = newWsName.trim();
    if (!name || !onCreateWorkspace) return;
    if (onCreateWorkspace(name) === false) return;
    setNewWsName("");
    setWsComposerOpen(false);
  };

  const submitWsRename = () => {
    if (renamingWsId && renameWsText.trim()) {
      if (onRenameWorkspace?.(renamingWsId, renameWsText) === false) return;
    }
    setRenamingWsId(null);
  };

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

        {saveError && <section role="alert" className="bs-save-recovery">
          <p>{lang === 'zh' ? '更改未保存。离开前请重试或导出。' : 'Changes were not saved. Retry or export before leaving.'} {saveError}</p>
          <button type="button" className="btn" onMouseDown={e=>e.preventDefault()} onClick={()=>{
            const latest = pendingAction==='create'?newWsName:pendingAction==='rename'?renameWsText:undefined;
            if(onRetrySave?.(latest)){setWsComposerOpen(false);setNewWsName('');setRenamingWsId(null);}
          }}>{lang === 'zh' ? '重试保存' : 'Retry workspace change'}</button>
          <button type="button" className="btn" onMouseDown={e=>e.preventDefault()} onClick={()=>onExportSave?.(pendingAction==='create'?newWsName:pendingAction==='rename'?renameWsText:undefined)}>{lang === 'zh' ? '导出草稿' : 'Export workspace draft'}</button>
          <button type="button" className="btn" onMouseDown={e=>e.preventDefault()} onClick={()=>{onDiscardSave?.();setWsComposerOpen(false);setNewWsName('');setRenamingWsId(null);}}>{lang === 'zh' ? '放弃更改' : 'Discard workspace change'}</button>
          {exportFailed && <p>{lang === 'zh' ? '导出失败或账户已更改。' : 'Export failed or the account changed.'}</p>}
        </section>}
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
          {wsEditable ? (
            <button
              type="button"
              className="bs-ws-add"
              onClick={() => { if (!saveError) setWsComposerOpen((open) => !open); }}
              data-testid="bs-new-workspace"
            >
              + {lang === "zh" ? "空间" : "Workspace"}
            </button>
          ) : null}
          <span className="grow"></span>
          <button
            type="button"
            className="btn primary bs-new"
            onClick={() => { if (!saveError) onCreate(); }}
            data-testid="bs-new-board"
          >
            + {STR_SWITCHER.newBoard[lang]}
          </button>
        </div>

        {wsComposerOpen && wsEditable ? (
          <div className="bs-ws-composer" data-testid="bs-ws-composer">
            <input
              autoFocus
              value={newWsName}
              placeholder={lang === "zh" ? "新空间名称" : "New workspace name"}
              onChange={(e) => setNewWsName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitNewWorkspace();
                if (e.key === "Escape" && !saveError) setWsComposerOpen(false);
              }}
              data-testid="bs-ws-new-name"
            />
            <button
              type="button"
              className="btn primary"
              onClick={submitNewWorkspace}
              data-testid="bs-ws-new-add"
            >
              {lang === "zh" ? "添加" : "Add"}
            </button>
          </div>
        ) : null}

        <div className="bs-body">
          {(scope === "all"
            ? groupedByWs
            : groupedByWs.filter((g) => g.ws.id === scope)
          ).map(({ ws, boards: wsBoards }) =>
            // Editable mode renders empty workspaces too — a freshly created
            // workspace must be visible to be renamed/recolored/deleted.
            wsBoards.length > 0 || (wsEditable && !filter) ? (
              <section key={ws.id} className="bs-group">
                <header className="bs-group-h">
                  {wsEditable ? (
                    <button
                      type="button"
                      className="ws-dot ws-dot-btn"
                      style={{ background: ws.color }}
                      onClick={() => { if (!saveError) onRecolorWorkspace?.(ws.id); }}
                      aria-label={lang === "zh" ? "更改颜色" : "Change color"}
                      title={lang === "zh" ? "更改颜色" : "Change color"}
                      data-testid={`bs-ws-recolor-${ws.id}`}
                    />
                  ) : (
                    <span className="ws-dot" style={{ background: ws.color }}></span>
                  )}
                  {renamingWsId === ws.id ? (
                    <input
                      autoFocus
                      className="bs-ws-rename"
                      value={renameWsText}
                      onChange={(e) => setRenameWsText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") submitWsRename();
                        if (e.key === "Escape" && !saveError) setRenamingWsId(null);
                      }}
                      onBlur={submitWsRename}
                      data-testid={`bs-ws-rename-input-${ws.id}`}
                    />
                  ) : (
                    <h3>{ws.name[lang]}</h3>
                  )}
                  <span className="muted">{wsBoards.length}</span>
                  {wsEditable && renamingWsId !== ws.id ? (
                    <span className="bs-ws-actions">
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => {
                          if (saveError) return;
                          setRenamingWsId(ws.id);
                          setRenameWsText(ws.name[lang]);
                        }}
                        aria-label={lang === "zh" ? "重命名空间" : "Rename workspace"}
                        data-testid={`bs-ws-rename-${ws.id}`}
                      >
                        ✎
                      </button>
                      {boards.every((b) => b.workspaceId !== ws.id) &&
                      workspaces.length > 1 ? (
                        <button
                          type="button"
                          className="icon-btn danger"
                          onClick={() => { if (!saveError) onDeleteWorkspace?.(ws.id); }}
                          aria-label={lang === "zh" ? "删除空间" : "Delete workspace"}
                          data-testid={`bs-ws-delete-${ws.id}`}
                        >
                          🗑
                        </button>
                      ) : null}
                    </span>
                  ) : null}
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
                      <div key={b.id} className="bs-card-wrap">
                        <button
                          type="button"
                          className={"bs-card" + (isActive ? " active" : "")}
                          onClick={() => { if (!saveError) onPick(b.id); }}
                          data-testid={`bs-card-${b.id}`}
                        >
                          <div className="bs-cover" style={{ background: b.cover }}>
                            <span className="bs-cover-icon" aria-hidden="true">
                              {b.icon ?? (b.template === "pm" ? "▤" : "▦")}
                            </span>
                          </div>
                          <div className="bs-info">
                            <div className="bs-name">{b.name[lang]}</div>
                            {b.description ? (
                              <div className="bs-desc" title={b.description}>
                                {b.description}
                              </div>
                            ) : null}
                            <div className="bs-meta mono">
                              {cardCount} {STR_SWITCHER.cards[lang]}
                            </div>
                          </div>
                        </button>
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
                      </div>
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
