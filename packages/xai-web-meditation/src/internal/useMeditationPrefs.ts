/**
 * @internal — useMeditationPrefs.ts
 *
 * Wraps @repo/plugin-web-storage usePref with the xai_meditation_prefs
 * key + validation clamp.
 *
 * NOTE: usePref does NOT accept a functional setter. Capture `prefs` in
 * the click handler closure when updating one field:
 *     onClick={() => setPrefs({ ...prefs, scene: id })}
 */

import { usePref } from "@repo/plugin-web-storage";
import type { MeditationPrefs } from "../types.js";
import { DEFAULT_PREFS } from "../constants.js";
import { validatePrefs } from "./validate.js";

/**
 * React hook — returns the validated MeditationPrefs blob and a setter
 * that writes the full object to localStorage atomically.
 */
export function useMeditationPrefs(): readonly [MeditationPrefs, (next: MeditationPrefs) => void] {
  const [raw, setRaw] = usePref("xai_meditation_prefs", DEFAULT_PREFS);
  // raw comes from PREF_REGISTRY default (MeditationPrefsBlob = unknown);
  // validatePrefs clamps to typed MeditationPrefs.
  const safe = validatePrefs(raw);
  const setSafe = (next: MeditationPrefs): void => {
    setRaw(next);
  };
  return [safe, setSafe] as const;
}
