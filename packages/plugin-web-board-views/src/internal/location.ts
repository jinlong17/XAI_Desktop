/**
 * @internal — location validation guard.
 *
 * Gap-closure row #6: Map view location guard.
 * Exported via board-views index.ts barrel for consumer use.
 */

export interface CardLocation {
  /** WGS84 latitude, -90..90. */
  lat: number;
  /** WGS84 longitude, -180..180. */
  lng: number;
  /** Optional human-readable label rendered in the pin popup. */
  label?: string;
}

/**
 * Returns true if `loc` is a valid CardLocation:
 * - Object with numeric `lat` and `lng`
 * - Both lat and lng are finite (no NaN/Infinity)
 * - Math.abs(lat) <= 90
 * - Math.abs(lng) <= 180
 * - Optional `label` is a string if present
 */
export function isValidLocation(loc: unknown): loc is CardLocation {
  if (!loc || typeof loc !== "object" || Array.isArray(loc)) return false;
  const obj = loc as Record<string, unknown>;
  if (typeof obj.lat !== "number" || !isFinite(obj.lat)) return false;
  if (typeof obj.lng !== "number" || !isFinite(obj.lng)) return false;
  if (Math.abs(obj.lat) > 90) return false;
  if (Math.abs(obj.lng) > 180) return false;
  if (obj.label !== undefined && typeof obj.label !== "string") return false;
  return true;
}
