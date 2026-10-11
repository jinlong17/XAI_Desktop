/**
 * BoardCreator — modal with 3 template cards + name input + workspace select.
 *
 * Port of `web design/module-board.jsx` lines 1371..1417.
 */

import type { BoardCreateDraft } from "./internal/useBoardCreateRecovery.js";
import { useState } from "react";
import type { BoardTemplate, BoardWorkspace } from "@repo/plugin-web-board-core";
import { BOARD_TEMPLATES } from "@repo/plugin-web-board-core";
import { STR_CREATOR, type Lang } from "./internal/strings.js";

export interface BoardCreatorProps {
  lang: Lang;
  workspaces: readonly BoardWorkspace[];
  onCancel: () => void;
  error?: string | null;
  created?: boolean;
  exportFailed?: boolean;
  onExport?: (draft: BoardCreateDraft) => void;
  onCreate: (templateId: BoardTemplate, name: string, workspaceId: string) => void;
}

export function BoardCreator({ lang, workspaces, onCancel, onCreate, error, created, exportFailed, onExport }: BoardCreatorProps) {
  const [tpl, setTpl] = useState<BoardTemplate>("pm");
  const initialWs = workspaces[0]?.id ?? "";
  const [ws, setWs] = useState<string>(initialWs);
  const [name, setName] = useState<string>(STR_CREATOR.defaultName[lang]);

  const submit = () => {
    const finalName = name.trim() || STR_CREATOR.defaultName[lang];
    onCreate(tpl, finalName, ws);
  };

  return (
    <div className="modal-scrim" onClick={onCancel} data-testid="bc-scrim">
      <div className="board-creator" onClick={(e) => e.stopPropagation()}>
        <header className="bc-head">
          <h2>{STR_CREATOR.createBoard[lang]}</h2>
          <button
            type="button"
            className="icon-btn"
            onClick={onCancel}
            aria-label={lang === "zh" ? "关闭" : "Close"}
          >
            ×
          </button>
        </header>
        <div className="bc-body">
          {error && <div className="bc-create-recovery" role="alert">
            <p>{created ? (lang === 'zh' ? '看板已创建，打开失败。重试只会打开同一个看板。' : 'Board created. Opening failed; retry opens the same board.') : (lang === 'zh' ? '看板未创建，草稿仍保留。' : 'Board was not created. Your draft is retained.')} {error}</p>
            <button type="button" className="btn" onClick={() => onExport?.({ templateId: tpl, name, workspaceId: ws })}>{lang === 'zh' ? '导出草稿' : 'Export draft'}</button>
            {exportFailed && <p>{lang === 'zh' ? '导出失败或账户已更改。' : 'Export failed or the account changed.'}</p>}
          </div>}

          <div className="bc-templates">
            {BOARD_TEMPLATES.map((t) => (
              <button
                disabled={created}
                key={t.id}
                type="button"
                className={"bc-tpl" + (tpl === t.id ? " active" : "")}
                onClick={() => setTpl(t.id)}
                data-testid={`bc-tpl-${t.id}`}
              >
                <div className="bc-tpl-cover" style={{ background: t.cover }}></div>
                <div className="bc-tpl-name">{t.name[lang]}</div>
                <div className="bc-tpl-desc">{t.desc[lang]}</div>
              </button>
            ))}
          </div>
          <div className="bc-form">
            <label className="bc-field">
              <span>{STR_CREATOR.boardName[lang]}</span>
              <input
                disabled={created}
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="bc-name-input"
              />
            </label>
            <label className="bc-field">
              <span>{STR_CREATOR.workspace[lang]}</span>
              <select
                disabled={created}
                value={ws}
                onChange={(e) => setWs(e.target.value)}
                data-testid="bc-ws-select"
              >
                {workspaces.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name[lang]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <footer className="bc-foot">
          <button type="button" className="btn ghost" onClick={onCancel}>
            {STR_CREATOR.cancel[lang]}
          </button>
          <button
            type="button"
            className="btn primary"
            onClick={submit}
            data-testid="bc-submit"
          >
            {created ? (lang === 'zh' ? '重试打开' : 'Retry opening') : error ? (lang === 'zh' ? '重试创建' : 'Retry create') : '+ ' + STR_CREATOR.create[lang]}
          </button>
        </footer>
      </div>
    </div>
  );
}
