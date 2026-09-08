/**
 * InboxPanel — capture-style list (260px) for off-board ideas.
 *
 * Port of `web design/module-board.jsx` lines 1174..1217.
 */

import { useState } from "react";
import type { InboxCardShape } from "./internal/types.js";
import { STR_INBOX, type Lang } from "./internal/strings.js";

export interface InboxPanelProps {
  cards: readonly InboxCardShape[];
  setCards: (updater: (prev: InboxCardShape[]) => InboxCardShape[]) => void;
  lang: Lang;
  /**
   * Called when user clicks the × (remove) button on a card.
   * Semantics: "request delete confirmation" — host owns the confirmation gate
   * (BoardDeleteConfirmDialog). B-28 fix: was direct delete with no gate.
   */
  onRequestRemove: (id: string) => void;
}

export function InboxPanel({ cards, setCards, lang, onRequestRemove }: InboxPanelProps) {
  const [text, setText] = useState("");

  const add = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const newCard: InboxCardShape = {
      id: "ix-" + Date.now().toString(36),
      text: { en: trimmed, zh: trimmed },
    };
    setCards((prev) => [newCard, ...prev]);
    setText("");
  };

  return (
    <section className="board-panel inbox-panel" data-testid="inbox-panel">
      <header className="panel-head">
        <span className="panel-icon" aria-hidden="true">
          ✉
        </span>
        <h2>{STR_INBOX.inbox[lang]}</h2>
        <span className="col-count">{cards.length}</span>
        <span className="grow"></span>
      </header>
      <div className="ix-composer">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") add();
          }}
          placeholder={STR_INBOX.composerPlaceholder[lang]}
          data-testid="inbox-composer-input"
        />
      </div>
      <div className="ix-body">
        {cards.map((c) => (
          <article key={c.id} className="ix-card">
            <div className="ix-text">{c.text[lang] || c.text.en}</div>
            <div className="ix-meta">
              <span className="grow"></span>
              <button
                type="button"
                className="icon-btn"
                onClick={() => onRequestRemove(c.id)}
                aria-label={lang === "zh" ? "删除" : "Remove"}
                data-testid={`inbox-remove-${c.id}`}
              >
                ×
              </button>
            </div>
          </article>
        ))}
        {cards.length === 0 && <div className="ix-empty">{STR_INBOX.empty[lang]}</div>}
      </div>
    </section>
  );
}
