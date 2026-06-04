import type { BoardListData } from "@repo/plugin-web-board-core";
import { STR_ARCHIVED_LISTS, STR_HEADER, type Lang } from "./internal/strings.js";

export interface ArchivedListsManagerProps {
  lists: readonly BoardListData[];
  lang: Lang;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onRestore: (listId: string) => void;
  onDeletePermanent: (listId: string) => void;
}

const LIST_KEY_LABEL: Record<string, { en: string; zh: string }> = {
  backlog: { en: "Backlog", zh: "待办池" },
  today: { en: "Today", zh: "今天" },
  week: { en: "Week", zh: "本周" },
  later: { en: "Later", zh: "以后" },
  done: { en: "Done", zh: "已完成" },
};

function resolveListName(list: BoardListData, lang: Lang): string {
  const customName = list.customName?.[lang];
  if (customName) return customName;
  if (list.key) return LIST_KEY_LABEL[list.key]?.[lang] ?? list.key;
  return lang === "zh" ? "未命名" : "Untitled";
}

export function ArchivedListsManager({
  lists,
  lang,
  open,
  onToggle,
  onClose,
  onRestore,
  onDeletePermanent,
}: ArchivedListsManagerProps) {
  return (
    <div className="archive-manager-wrap">
      <button
        type="button"
        className={"board-icon-btn" + (open ? " active" : "")}
        data-testid="archive-toggle"
        aria-expanded={open}
        onClick={onToggle}
      >
        {STR_HEADER.archived[lang]}
        {lists.length > 0 ? <span className="archive-count">{lists.length}</span> : null}
      </button>

      {open ? (
        <>
          <div
            className="archive-popover-scrim"
            data-testid="archive-popover-scrim"
            onClick={onClose}
          />
          <div className="archive-popover" data-testid="archive-popover">
            <header className="archive-popover-head">
              <span>{STR_ARCHIVED_LISTS.title[lang]}</span>
              <button
                type="button"
                className="icon-btn"
                onClick={onClose}
                aria-label={lang === "zh" ? "关闭" : "Close"}
              >
                ✕
              </button>
            </header>
            <div className="archive-popover-body">
              {lists.length === 0 ? (
                <div className="archive-empty">
                  {STR_ARCHIVED_LISTS.empty[lang]}
                </div>
              ) : (
                lists.map((list) => (
                  <div
                    key={list.id}
                    className="archive-row"
                    data-testid="archive-list-row"
                    data-list-id={list.id}
                  >
                    <div className="archive-row-main">
                      <span className="archive-row-name">{resolveListName(list, lang)}</span>
                      <span className="archive-row-meta">
                        {list.cards.length} {STR_ARCHIVED_LISTS.cards[lang]}
                      </span>
                    </div>
                    <div className="archive-row-actions">
                      <button
                        type="button"
                        className="board-icon-btn"
                        data-testid={`archive-restore-${list.id}`}
                        onClick={() => {
                          onRestore(list.id);
                          onClose();
                        }}
                      >
                        {STR_ARCHIVED_LISTS.restore[lang]}
                      </button>
                      <button
                        type="button"
                        className="board-icon-btn"
                        data-testid={`archive-delete-${list.id}`}
                        onClick={() => {
                          if (window.confirm(STR_ARCHIVED_LISTS.deleteConfirm[lang])) {
                            onDeletePermanent(list.id);
                            onClose();
                          }
                        }}
                      >
                        {STR_ARCHIVED_LISTS.deletePermanent[lang]}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
