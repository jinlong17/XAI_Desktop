/**
 * PaletteInput — controlled monospace search input.
 *
 * - Autofocuses on mount via autoFocus attribute.
 * - Fires setQuery on every change event.
 * - Delegates ↑/↓/Esc/Enter key events upward (does not call setQuery).
 * - Renders with .cmdk-input class (monospace via CSS).
 * - aria-label from i18n placeholder (HC6 accessibility).
 *
 * api.md §11 CSS class contract
 * test.md PI1..PI5
 */

import { useI18n } from "@repo/plugin-web-tokens";
import type { Lang } from "@repo/plugin-web-tokens";

interface PaletteInputProps {
  query: string;
  setQuery: (next: string) => void;
  lang: Lang;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function PaletteInput({ query, setQuery, lang, onKeyDown }: PaletteInputProps) {
  const { s } = useI18n(lang);
  const placeholder = s("common.search_placeholder");

  return (
    <div className="cmdk-input-wrapper">
      {/* Search icon (decorative) */}
      <svg
        className="cmdk-search-icon"
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 10L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <input
        className="cmdk-input"
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-label={placeholder}
        placeholder={placeholder}
        value={query}
          autoFocus
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}
