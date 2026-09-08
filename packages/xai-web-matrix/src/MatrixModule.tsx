/**
 * MatrixModule — Eisenhower 2×2 Matrix view.
 *
 * - Renders four colored-top-bar quadrants (Q1 red, Q2 amber, Q3 blue, Q4 accent).
 * - Cards drag between quadrants; the move persists to localStorage via usePref.
 * - On every drag-between or keyboard-move, emits `web:matrix:priority-tagged`.
 * - Empty quadrants render the bilingual `common.no_tasks` hint.
 * - M-01 header `+` and M-03 per-quadrant `+` open the MatrixComposer dialog.
 * - Save → addCard (pure reducer) → persist via usePersistedMatrix.addCard.
 *   No emit on create (QE-D: create ≠ move).
 *
 * State is read+written from the shared registry key `xai_matrix_state`
 * via the `usePersistedMatrix` hook.
 *
 * Design: design.md §3, §5, §6, §E.1
 */

import "./matrix.css";

import { useState, useCallback } from "react";
import { useI18n } from "@repo/plugin-web-tokens";
import type { MatrixModuleProps, Quadrant as QuadrantId, NewMatrixCardDraft } from "./types.js";
import { Quadrant } from "./Quadrant.js";
import { MatrixComposer } from "./MatrixComposer.js";
import { usePersistedMatrix } from "./internal/usePersistedMatrix.js";
import { PlusIcon, DotsIcon } from "./internal/icons.js";

const QUADRANT_DEFS = [
  { id: "q1" as const, number: 1 as const, titleKey: "matrix.urgent_important" },
  { id: "q2" as const, number: 2 as const, titleKey: "matrix.not_urgent_important" },
  { id: "q3" as const, number: 3 as const, titleKey: "matrix.urgent_unimportant" },
  { id: "q4" as const, number: 4 as const, titleKey: "matrix.not_urgent_unimportant" },
] as const;

export function MatrixModule({ lang }: MatrixModuleProps) {
  const { s } = useI18n(lang);
  const { state, moveCard, addCard } = usePersistedMatrix();

  // Composer state — lifted into MatrixModule (no web:* channel needed; QE-D)
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerQuadrant, setComposerQuadrant] = useState<QuadrantId>("q1");

  // M-01 header `+` → open composer defaulting to q1 (QE-B)
  const handleHeaderAdd = useCallback(() => {
    setComposerQuadrant("q1");
    setComposerOpen(true);
  }, []);

  // M-03 per-quadrant `+` → open composer pre-targeted to that quadrant (QE-C)
  const handleQuadrantAdd = useCallback((quadrant: QuadrantId) => {
    setComposerQuadrant(quadrant);
    setComposerOpen(true);
  }, []);

  const handleComposerSave = useCallback((draft: NewMatrixCardDraft, target: QuadrantId) => {
    addCard(draft, target);
    setComposerOpen(false);
  }, [addCard]);

  const handleComposerClose = useCallback(() => {
    setComposerOpen(false);
  }, []);

  return (
    <div className="module module-matrix">
      <header className="module-head">
        <h1 className="module-title">{s("matrix.title")}</h1>
        <span className="grow" />
        <button
          type="button"
          className="icon-btn"
          aria-label={lang === "zh" ? "添加" : "Add"}
          onClick={handleHeaderAdd}
        >
          <PlusIcon size={16} />
        </button>
        <button type="button" className="icon-btn" aria-label={lang === "zh" ? "更多" : "More"}>
          <DotsIcon size={16} />
        </button>
      </header>

      <div className="matrix-grid">
        {QUADRANT_DEFS.map((q) => (
          <Quadrant
            key={q.id}
            id={q.id}
            number={q.number}
            titleKey={q.titleKey}
            cards={state[q.id]}
            lang={lang}
            onCardDropped={moveCard}
            onAddCard={handleQuadrantAdd}
          />
        ))}
      </div>

      <MatrixComposer
        open={composerOpen}
        lang={lang}
        defaultQuadrant={composerQuadrant}
        onSave={handleComposerSave}
        onClose={handleComposerClose}
      />
    </div>
  );
}

export default MatrixModule;
