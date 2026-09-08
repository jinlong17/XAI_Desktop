/**
 * BoardSettingsModal — edit the active board's metadata: name, icon,
 * description, and cover (preset gradient swatches).
 *
 * Follows the card-detail idiom: each change patches immediately through
 * `onPatchBoard` (single writeActiveBoard write per change); Close just
 * dismisses the dialog.
 */

import { useEffect } from "react";
import { BOARD_COVER_PRESETS } from "@repo/plugin-web-board-core";
import type { Board } from "@repo/plugin-web-board-core";
import type { Lang } from "./internal/strings.js";

export interface BoardMetaPatch {
  /** Plain string; the host maps it to bilingual {en, zh}. */
  name?: string;
  icon?: string;
  description?: string;
  cover?: string;
}

export interface BoardSettingsModalProps {
  board: Board;
  lang: Lang;
  onPatchBoard: (patch: BoardMetaPatch) => void;
  onClose: () => void;
}

const STR = {
  heading: { en: "Board settings", zh: "看板设置" },
  name: { en: "Name", zh: "名称" },
  icon: { en: "Icon", zh: "图标" },
  iconHint: { en: "Emoji or short glyph", zh: "Emoji 或短字符" },
  description: { en: "Description", zh: "描述" },
  cover: { en: "Cover", zh: "封面" },
  close: { en: "Close", zh: "关闭" },
};

export function BoardSettingsModal({
  board,
  lang,
  onPatchBoard,
  onClose,
}: BoardSettingsModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="modal-scrim"
      data-testid="board-settings-modal"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="board-settings"
        role="dialog"
        aria-modal="true"
        aria-label={STR.heading[lang]}
      >
        <header className="bset-head">
          <h2>{STR.heading[lang]}</h2>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label={STR.close[lang]}
            data-testid="board-settings-close"
          >
            ×
          </button>
        </header>

        <div className="bset-body">
          <label className="bset-row">
            <span>{STR.name[lang]}</span>
            <input
              value={board.name[lang]}
              onChange={(event) => onPatchBoard({ name: event.target.value })}
              data-testid="board-settings-name"
            />
          </label>

          <label className="bset-row">
            <span>{STR.icon[lang]}</span>
            <input
              value={board.icon ?? ""}
              maxLength={4}
              placeholder={STR.iconHint[lang]}
              onChange={(event) =>
                onPatchBoard({ icon: event.target.value || undefined })
              }
              data-testid="board-settings-icon"
            />
          </label>

          <label className="bset-row">
            <span>{STR.description[lang]}</span>
            <textarea
              value={board.description ?? ""}
              rows={3}
              onChange={(event) =>
                onPatchBoard({ description: event.target.value || undefined })
              }
              data-testid="board-settings-description"
            />
          </label>

          <div className="bset-row">
            <span>{STR.cover[lang]}</span>
            <div className="bset-covers" data-testid="board-settings-covers">
              {BOARD_COVER_PRESETS.map((cover, index) => (
                <button
                  key={cover}
                  type="button"
                  className={
                    "bset-cover" + (board.cover === cover ? " active" : "")
                  }
                  style={{ background: cover }}
                  onClick={() => onPatchBoard({ cover })}
                  aria-label={`${STR.cover[lang]} ${index + 1}`}
                  data-testid={`board-settings-cover-${index}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
