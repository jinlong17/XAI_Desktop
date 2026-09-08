/**
 * registration.ts — public hook re-export.
 *
 * Exposes useCommandPalette() as the canonical public hook name.
 * The implementation is in CommandPaletteProvider.tsx (co-located with Context).
 *
 * api.md §4
 */

export { useCommandPaletteContext as useCommandPalette } from "./CommandPaletteProvider.js";
