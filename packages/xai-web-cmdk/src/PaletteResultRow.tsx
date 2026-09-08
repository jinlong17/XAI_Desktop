/**
 * PaletteResultRow — single search result row.
 *
 * - role="option" (child of role="listbox")
 * - aria-selected when activeIndex matches this row's index
 * - Renders escaped match highlight via dangerouslySetInnerHTML (XSS-safe — HC7)
 * - Click calls onSelect
 *
 * api.md §11 CSS class contract + HC7 XSS safety
 * test.md PR1..PR4
 */

import type { SearchHit } from "./types.js";
import type { Lang } from "@repo/plugin-web-tokens";
import { highlightMatch } from "./internal/highlightMatch.js";

interface PaletteResultRowProps {
  hit: SearchHit;
  isActive: boolean;
  query: string;
  lang: Lang;
  index: number;
  onSelect: () => void;
}

export function PaletteResultRow({
  hit,
  isActive,
  query,
  lang,
  index,
  onSelect,
}: PaletteResultRowProps) {
  const label = lang === "zh" ? (hit.label.zh || hit.label.en) : hit.label.en;
  const sub = hit.sub
    ? (lang === "zh" ? (hit.sub.zh || hit.sub.en) : hit.sub.en)
    : undefined;

  // XSS-safe highlight: escapeHtml runs inside highlightMatch BEFORE <mark> wrapping (HC7)
  const highlightedLabel = highlightMatch(label, query);

  return (
    <li
      className={`cmdk-row${isActive ? " active" : ""}`}
      role="option"
      aria-selected={isActive}
      id={`cmdk-row-${index}`}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSelect();
      }}
      tabIndex={-1}
    >
      <span
        className="cmdk-row-label"
        // Security: highlightMatch always escapes before marking (HC7)
        dangerouslySetInnerHTML={{ __html: highlightedLabel }}
      />
      {sub && (
        <span className="cmdk-row-sub">{sub}</span>
      )}
    </li>
  );
}
