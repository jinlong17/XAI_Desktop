/**
 * CountdownModule — the top-level route component for the Countdown module.
 *
 * - Reads `usePref("xai_countdowns")` and filters via `isCountdownCard`.
 * - Renders the module header + card grid.
 * - Manages modal state for create / edit.
 *
 * Design: packages/xai-web-countdown/docs/design.md §4
 * API contract: packages/xai-web-countdown/docs/api.md §2.1
 */

import React, { useMemo, useState } from "react";
import type { CountdownCard } from "./types.js";
import type { Lang } from "@repo/plugin-web-tokens";
import { useI18n } from "@repo/plugin-web-tokens";
import { usePref } from "@repo/plugin-web-storage";
import { isCountdownCard } from "./internal/validate.js";
import { addCard, updateCard, deleteCard } from "./internal/cardsReducer.js";
import { CountdownCardView } from "./CountdownCardView.js";
import { AddCountdownCard } from "./AddCountdownCard.js";
import { CountdownEditDialog } from "./internal/CountdownEditDialog.js";

export interface CountdownModuleProps {
  lang: Lang;
}

type ModalState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; card: CountdownCard };

export function CountdownModule({ lang }: CountdownModuleProps) {
  const { t } = useI18n(lang);

  // Persistence — raw value may be unknown[]
  const [rawCards, setRawCards] = usePref("xai_countdowns");

  // Filter and validate at the boundary
  const cards: CountdownCard[] = useMemo(() => {
    if (!Array.isArray(rawCards)) return [];
    return rawCards.filter(isCountdownCard);
  }, [rawCards]);

  // Modal state
  const [modal, setModal] = useState<ModalState>({ mode: "closed" });

  function openCreate() {
    setModal({ mode: "create" });
  }

  function openEdit(card: CountdownCard) {
    setModal({ mode: "edit", card });
  }

  function closeModal() {
    setModal({ mode: "closed" });
  }

  function handleSave(draft: Omit<CountdownCard, "id">) {
    if (modal.mode === "create") {
      setRawCards((prev) => {
        const prevArr = Array.isArray(prev) ? (prev as unknown[]).filter(isCountdownCard) : [];
        return addCard(prevArr, draft);
      });
    } else if (modal.mode === "edit") {
      const id = modal.card.id;
      setRawCards((prev) => {
        const prevArr = Array.isArray(prev) ? (prev as unknown[]).filter(isCountdownCard) : [];
        return updateCard(prevArr, id, draft);
      });
    }
    closeModal();
  }

  function handleDelete(id: string) {
    setRawCards((prev) => {
      const prevArr = Array.isArray(prev) ? (prev as unknown[]).filter(isCountdownCard) : [];
      return deleteCard(prevArr, id);
    });
    closeModal();
  }

  return (
    <div className="module module-countdown">
      <header className="module-head">
        <h1 className="module-title">
          {t.countdown.title}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{ marginLeft: 4 }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </h1>
        <span className="grow" />
        <button
          type="button"
          className="icon-btn"
          aria-label={lang === "zh" ? "新建倒计时" : "Add Countdown"}
          onClick={openCreate}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <button type="button" className="icon-btn" aria-label={t.common.more}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>
      </header>

      <div className="countdown-grid">
        {cards.map((card) => (
          <CountdownCardView
            key={card.id}
            card={card}
            lang={lang}
            onClick={() => openEdit(card)}
          />
        ))}
        <AddCountdownCard lang={lang} onClick={openCreate} />
      </div>

      {/* Modal */}
      {modal.mode !== "closed" && (
        <CountdownEditDialog
          card={modal.mode === "edit" ? modal.card : null}
          lang={lang}
          onSave={handleSave}
          onDelete={handleDelete}
          onCancel={closeModal}
        />
      )}
    </div>
  );
}
