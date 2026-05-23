/**
 * BoardCreator — modal with 3 template cards + name input + workspace select.
 *
 * Port of `web design/module-board.jsx` lines 1371..1417.
 */

import { useState } from "react";
import type { BoardTemplate, BoardWorkspace } from "@repo/plugin-web-board-core";
import { BOARD_TEMPLATES } from "@repo/plugin-web-board-core";
import { STR_CREATOR, type Lang } from "./internal/strings.js";

export interface BoardCreatorProps {
  lang: Lang;
  workspaces: readonly BoardWorkspace[];
  onCancel: () => void;
  onCreate: (templateId: BoardTemplate, name: string, workspaceId: string) => void;
}

export function BoardCreator({ lang, workspaces, onCancel, onCreate }: BoardCreatorProps) {
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
          <div className="bc-templates">
            {BOARD_TEMPLATES.map((t) => (
              <button
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
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="bc-name-input"
              />
            </label>
            <label className="bc-field">
              <span>{STR_CREATOR.workspace[lang]}</span>
              <select
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
            + {STR_CREATOR.create[lang]}
          </button>
        </footer>
      </div>
    </div>
  );
}
