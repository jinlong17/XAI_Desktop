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
  const { state, moveCard, addCard, recovery } = usePersistedMatrix();

  const [exportFailed, setExportFailed] = useState(false);
  const saveError = recovery.failure ? (lang === 'zh'
    ? (recovery.failure === 'conflict' ? '已有较新的数据，未覆盖。请导出草稿后放弃此次更改。' : recovery.failure === 'account' ? '账户已更改，未保存。请返回原账户恢复。' : '尚未保存。请重试或导出草稿。')
    : (recovery.failure === 'conflict' ? 'Newer stored data was preserved. Export the draft and discard this change.' : recovery.failure === 'account' ? 'Account changed. Not saved; return to the original account to recover.' : 'Not saved. Retry or export the draft.')) : null;
  const exportDraft = (draft?: NewMatrixCardDraft, target?: QuadrantId) => {
    try {
      const value = { recovery: recovery.snapshot(), latestDraft: draft, target };
      const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }));
      const link = document.createElement('a'); link.href = url; link.download = 'matrix-unsaved-change.json'; document.body.append(link);
      try { link.click(); } finally { link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); }
      setExportFailed(false);
    } catch { setExportFailed(true); }
  };

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
    if (addCard(draft, target)) { setComposerOpen(false); setExportFailed(false); }
  }, [addCard]);

  const handleComposerClose = useCallback(() => {
    if (!recovery.failure) setComposerOpen(false);
  }, [recovery.failure]);

  return (
    <div className="module module-matrix">
      <header className="module-head">
        <h1 className="module-title">{s("matrix.title")}</h1>
        <span className="grow" />
        <button
          type="button"
          className="icon-btn"
          aria-label={lang === "zh" ? "添加" : "Add"}
          disabled={!!recovery.failure}
          onClick={handleHeaderAdd}
        >
          <PlusIcon size={16} />
        </button>
        <button type="button" className="icon-btn" aria-label={lang === "zh" ? "更多" : "More"}>
          <DotsIcon size={16} />
        </button>
      </header>

      {saveError && !composerOpen && <div className="matrix-save-recovery" role="alert">
        <p>{saveError}</p>
        <button type="button" onClick={() => recovery.retry()}>{lang === 'zh' ? '重试保存' : 'Retry save'}</button>
        <button type="button" onClick={() => exportDraft()}>{lang === 'zh' ? '导出草稿' : 'Export draft'}</button>
        <button type="button" onClick={() => { recovery.discard(); setExportFailed(false); }}>{lang === 'zh' ? '放弃此次更改' : 'Discard change'}</button>
        {exportFailed && <p>{lang === 'zh' ? '导出失败，请检查账户和存储权限。' : 'Export failed. Check account and storage access.'}</p>}
      </div>}
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
            onAddCard={(quadrant) => { if (!recovery.failure) handleQuadrantAdd(quadrant); }}
          />
        ))}
      </div>

      <MatrixComposer
        open={composerOpen}
        lang={lang}
        defaultQuadrant={composerQuadrant}
        onSave={handleComposerSave}
        saveError={saveError}
        exportFailed={exportFailed}
        onExportDraft={exportDraft}
        onDiscard={() => { recovery.discard(); setExportFailed(false); setComposerOpen(false); }}
        onClose={handleComposerClose}
      />
    </div>
  );
}

export default MatrixModule;
