import type {
  ArchivedBoardCardRecord,
  BoardListData,
} from "@repo/plugin-web-board-core";
import { STR_ARCHIVED_CARDS, type Lang } from "./internal/strings.js";

export interface ArchivedCardsManagerProps {
  records: readonly ArchivedBoardCardRecord[];
  lang: Lang;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  resolveListName: (list: BoardListData, lang: Lang) => string;
  onRestore: (listId: string, cardId: string) => void;
  onDeletePermanent: (listId: string, cardId: string) => void;
}

export function ArchivedCardsManager({
  records,
  lang,
  open,
  onToggle,
  onClose,
  resolveListName,
  onRestore,
  onDeletePermanent,
}: ArchivedCardsManagerProps) {
  return (
    <div className="archive-manager-wrap">
      <button
        type="button"
        className={"board-icon-btn" + (open ? " active" : "")}
        data-testid="archive-cards-toggle"
        aria-expanded={open}
        onClick={onToggle}
      >
        {STR_ARCHIVED_CARDS.toolbar[lang]}
        {records.length > 0 ? <span className="archive-count">{records.length}</span> : null}
      </button>

      {open ? (
        <>
          <div
            className="archive-popover-scrim"
            data-testid="archive-cards-popover-scrim"
            onClick={onClose}
          />
          <div className="archive-popover" data-testid="archive-cards-popover">
            <header className="archive-popover-head">
              <span>{STR_ARCHIVED_CARDS.title[lang]}</span>
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
              {records.length === 0 ? (
                <div className="archive-empty">
                  {STR_ARCHIVED_CARDS.empty[lang]}
                </div>
              ) : (
                records.map(({ listId, list, card }) => (
                  <div
                    key={`${listId}:${card.id}`}
                    className="archive-row"
                    data-testid="archive-card-row"
                    data-list-id={listId}
                    data-card-id={card.id}
                  >
                    <div className="archive-row-main">
                      <span className="archive-row-name">{card.title[lang]}</span>
                      <span className="archive-row-meta">
                        {resolveListName(list, lang)}
                      </span>
                    </div>
                    <div className="archive-row-actions">
                      <button
                        type="button"
                        className="board-icon-btn"
                        data-testid={`archive-card-restore-${listId}-${card.id}`}
                        onClick={() => {
                          onRestore(listId, card.id);
                          onClose();
                        }}
                      >
                        {STR_ARCHIVED_CARDS.restore[lang]}
                      </button>
                      <button
                        type="button"
                        className="board-icon-btn"
                        data-testid={`archive-card-delete-${listId}-${card.id}`}
                        onClick={() => {
                          if (window.confirm(STR_ARCHIVED_CARDS.deleteConfirm[lang])) {
                            onDeletePermanent(listId, card.id);
                            onClose();
                          }
                        }}
                      >
                        {STR_ARCHIVED_CARDS.deletePermanent[lang]}
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
