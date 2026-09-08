/**
 * @internal — escapeHtml.ts
 *
 * Pure HTML-escape helper. Converts 5 special characters to HTML entities.
 * All other characters pass through unchanged.
 *
 * This is NOT a sanitizer — it does not allowlist "safe" tags.
 * It is a pure escape that makes user-supplied content safe to embed in HTML.
 *
 * api.md §7
 *
 * Mappings:
 *   &  → &amp;
 *   <  → &lt;
 *   >  → &gt;
 *   "  → &quot;
 *   '  → &#39;
 */
export function escapeHtml(s: string): string {
  // Replace in a single pass using a regex alternation.
  // Order matters: & must be first to avoid double-escaping.
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
