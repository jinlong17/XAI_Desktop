/**
 * @internal — Leaflet dynamic-import seam.
 *
 * Centralises the dynamic `import("leaflet")` so that:
 * 1. Vite sees a single chunk split point → leaflet lands in one chunk.
 * 2. Tests can mock this module in isolation without touching the library.
 *
 * Gap-closure row #6 — P5 Map view.
 */

import type * as L from "leaflet";

/** Cached module promise so we only load once per session. */
let _leafletPromise: Promise<typeof L> | null = null;

/**
 * Returns the Leaflet module, loading it lazily on first call.
 * All subsequent calls return the same cached promise.
 */
export function loadLeaflet(): Promise<typeof L> {
  if (!_leafletPromise) {
    _leafletPromise = import("leaflet").then((m) => m);
  }
  return _leafletPromise;
}

/** Reset the cached module (for testing). */
export function _resetLeafletCache(): void {
  _leafletPromise = null;
}
