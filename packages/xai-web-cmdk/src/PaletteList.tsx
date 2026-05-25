/**
 * PaletteList — result list for the command palette.
 *
 * - role="listbox" container
 * - Maps SearchHit[] to PaletteResultRow items
 * - Renders empty state when hits.length === 0
 * - Scrolls active row into view on activeIndex change
 *
 * test.md PL1..PL5
 */

import { useEffect, useRef } from "react";
import type { SearchHit } from "./types.js";
import type { Lang } from "@repo/plugin-web-tokens";
import { PaletteResultRow } from "./PaletteResultRow.js";

interface PaletteListProps {
  hits: readonly SearchHit[];
  activeIndex: number;
  query: string;
  lang: Lang;
  onSelect: (hit: SearchHit) => void;
  emptyText?: string;
}

export function PaletteList({
  hits,
  activeIndex,
  query,
  lang,
  onSelect,
  emptyText,
}: PaletteListProps) {
  const listRef = useRef<HTMLUListElement>(null);

  // Scroll active row into view when activeIndex changes
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector(`#cmdk-row-${activeIndex}`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  if (hits.length === 0) {
    return (
      <div className="cmdk-empty">
        {emptyText ?? (lang === "zh" ? "无结果" : "No results")}
      </div>
    );
  }

  return (
    <ul
      ref={listRef}
      className="cmdk-list"
      role="listbox"
      aria-label={lang === "zh" ? "搜索结果" : "Search results"}
    >
      {hits.map((hit, i) => (
        <PaletteResultRow
          key={hit.id}
          hit={hit}
          isActive={i === activeIndex}
          query={query}
          lang={lang}
          index={i}
          onSelect={() => onSelect(hit)}
        />
      ))}
    </ul>
  );
}
