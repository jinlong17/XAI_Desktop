/**
 * @internal — highlightMatch.ts
 *
 * Wraps case-insensitive occurrences of `query` in the `text` string with
 * <mark>…</mark> tags, AFTER first escaping both strings via escapeHtml.
 *
 * Security: escapeHtml runs BEFORE any substitution, so user-injected
 * <script> payloads in either `text` or `query` are inert by the time
 * the <mark> wrapping runs.
 *
 * Returns a string safe for use with dangerouslySetInnerHTML.
 *
 * api.md §8
 */

import { escapeHtml } from "./escapeHtml.js";

export function highlightMatch(text: string, query: string): string {
  // Step 1: escape the source text first
  const escapedText = escapeHtml(text);

  // Step 2: empty query → return escaped text with no <mark>
  if (!query) {
    return escapedText;
  }

  // Step 3: escape the query too, so that XSS-via-query is neutralized
  const escapedQuery = escapeHtml(query);

  // Step 4: replace all case-insensitive occurrences in the already-escaped text
  // We build a regex from the escaped query string.
  // Note: regex special chars in the query are treated literally via escaping.
  const safeQueryForRegex = escapedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  try {
    const re = new RegExp(safeQueryForRegex, "gi");
    return escapedText.replace(re, (match) => `<mark>${match}</mark>`);
  } catch {
    // Fallback: regex construction failed (malformed query edge case)
    return escapedText;
  }
}
