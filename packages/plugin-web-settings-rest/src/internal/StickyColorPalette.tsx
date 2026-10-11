/**
 * @internal — StickyColorPalette.tsx
 *
 * 13-button color palette for Sticky Note pane.
 * 12 non-random buttons use var(--sticky-note-color-<id>).
 * "random" sentinel uses CONIC_RANDOM inline style.
 *
 * NO hex literals in this component. The hex source data lives only in
 * src/styles.css (OKLCH converted). NH1 regex test enforces zero hex in TSX.
 *
 * API contract: packages/xai-web-settings-rest/docs/api.md §2.2
 */

import * as React from "react";
import type { StickyColorId } from "../types.js";

// The 13 ids in source order (matches web design/module-settings.jsx lines 902-905).
// Also the Sticky pane's strict color domain (the stored `random` sentinel included).
export const STICKY_COLOR_IDS: readonly StickyColorId[] = [
  "sun", "peach", "coral", "sky", "indigo", "lilac",
  "mint", "white", "silver", "graphite", "navy", "midnight",
  "random",
] as const;

// Conic-gradient sentinel for the "random" swatch (references CSS vars, no hex).
const CONIC_RANDOM =
  "conic-gradient(from 0deg, var(--sticky-note-color-coral), var(--sticky-note-color-sun), var(--sticky-note-color-mint), var(--sticky-note-color-indigo), var(--sticky-note-color-lilac), var(--sticky-note-color-coral))";

export interface StickyColorPaletteProps {
  readonly selected: StickyColorId;
  readonly onSelect: (id: StickyColorId) => void;
}

export function StickyColorPalette({
  selected,
  onSelect,
}: StickyColorPaletteProps): React.ReactElement {
  return (
    <div className="sn-colors" role="group" aria-label="Color palette">
      {STICKY_COLOR_IDS.map((id) => {
        const background =
          id === "random"
            ? CONIC_RANDOM
            : `var(--sticky-note-color-${id})`;

        return (
          <button
            key={id}
            type="button"
            className={"sn-sw" + (selected === id ? " active" : "")}
            style={{ background }}
            onClick={() => onSelect(id)}
            aria-label={id}
            aria-pressed={selected === id}
            data-color-id={id}
          >
            {id === "random" && (
              <span aria-hidden="true" style={{ fontSize: "0.7rem", color: "oklch(100% 0 0)" }}>
                ↺
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
