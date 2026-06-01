/**
 * StickiesWidget — sticky note stack with create + delete.
 *
 * Ported from `web design/module-dashboard.jsx` lines 431-449 (baseline).
 * Extended by xai-web-dashboard-stickies-create (SP3) to wire useStickies +
 * StickyComposer + per-sticky delete + fixture-as-sample disposition.
 *
 * Disposition (G1 decision):
 *   - Empty store (list.length === 0): render 3 read-only STICKIES fixture
 *     samples + empty hint. Samples carry data-sample="true" and NO .sticky-del.
 *   - Non-empty store: render user stickies only (no fixtures). Each sticky
 *     has a per-sticky × delete button (.sticky-del).
 *
 * IMPORTANT render split (RS4 / OQ6):
 *   - Fixture path: `n.text[lang]` (bilingual), `n.color` (raw hex literal).
 *     MUST NOT route fixture hex through STICKY_COLORS (would key-miss).
 *   - User path: `s.text` (single string), `STICKY_COLORS[s.color]` (token→hex).
 *
 * StickiesWidget is a stable React component — hooks survive grid re-renders
 * (exactly like ClockWidget). No state lifts outside the widget.
 *
 * Design: packages/xai-web-dashboard-widgets/docs/design.md §E
 * API:    packages/xai-web-dashboard-widgets/docs/api.md §E
 */
import { useState } from "react";
import { useI18n } from "@repo/plugin-web-tokens";
import type { Lang } from "@repo/plugin-web-tokens";

import { Icon } from "../internal/Icon.js";
import { STICKIES } from "../internal/fixtures.js";
import { useStickies } from "../internal/stickiesStore/useStickies.js";
import { STICKY_COLORS } from "../internal/stickiesStore/types.js";
import { StickyComposer } from "../StickyComposer.js";
import { str } from "../internal/strings.js";

export interface StickiesWidgetProps {
  lang: Lang;
}

export function StickiesWidget({ lang }: StickiesWidgetProps) {
  const { s } = useI18n(lang);
  const { list, create, remove } = useStickies();
  const [composerOpen, setComposerOpen] = useState(false);

  const hasUserStickies = list.length > 0;

  return (
    <div className="widget-content w-stickies-body">
      <div className="wgt-h">
        <Icon name="note" size={14} />
        <span>{s("dashboard.sticky_notes")}</span>
        <span className="grow" />
        <button
          type="button"
          className="icon-btn"
          data-no-drag
          aria-label={str("aria_add", lang)}
          onClick={() => setComposerOpen(true)}
        >
          <Icon name="plus" size={14} />
        </button>
      </div>

      <div className="sticky-stack">
        {hasUserStickies ? (
          /* User sticky path: single-string text + preset color token */
          list.map((s, i) => (
            <div
              key={s.id}
              className="sticky"
              style={{
                background: STICKY_COLORS[s.color],
                transform: `rotate(${(i - 1) * 2}deg)`,
                position: "relative",
              }}
            >
              {s.text}
              <button
                type="button"
                className="sticky-del"
                data-no-drag
                aria-label={`${str("aria_delete", lang)}: ${s.text}`}
                onClick={() => remove(s.id)}
              >
                ×
              </button>
            </div>
          ))
        ) : (
          /* Empty-store path: fixture samples (read-only, bilingual) + hint */
          <>
            {STICKIES.map((n, i) => (
              <div
                key={n.id}
                className="sticky sticky--sample"
                data-sample="true"
                style={{
                  background: n.color,        // raw hex literal — NOT STICKY_COLORS
                  transform: `rotate(${(i - 1) * 2}deg)`,
                }}
                aria-label={str("aria_sample", lang)}
              >
                {n.text[lang]}
              </div>
            ))}
            <p className="sticky-empty-hint">{str("hint_empty", lang)}</p>
          </>
        )}
      </div>

      <StickyComposer
        open={composerOpen}
        lang={lang}
        onSave={(draft) => {
          create(draft);
          setComposerOpen(false);
        }}
        onClose={() => setComposerOpen(false)}
      />
    </div>
  );
}
