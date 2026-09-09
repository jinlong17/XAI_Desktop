/**
 * @internal — useMeditationPrefs.ts
 *
 * Wraps @repo/plugin-web-storage usePref with the xai_meditation_prefs
 * key + validation clamp.
 *
 * This wrapper accepts complete values. Capture `prefs` in
 * the click handler closure when updating one field:
 *     onClick={() => setPrefs({ ...prefs, scene: id })}
 */

import { useRef, useState } from "react";
import { accountScope, usePref } from "@repo/plugin-web-storage";
import type { MeditationPrefs } from "../types.js";
import { DEFAULT_PREFS } from "../constants.js";
import { validatePrefs } from "./validate.js";

/**
 * React hook — returns the validated MeditationPrefs blob and a setter
 * that reports whether writing the full localStorage value succeeded.
 */
export function useMeditationPrefs() {
  const [raw, setRaw] = usePref("xai_meditation_prefs", DEFAULT_PREFS);
  // raw comes from PREF_REGISTRY default (MeditationPrefsBlob = unknown);
  // validatePrefs clamps to typed MeditationPrefs.
  const safe = validatePrefs(raw);
  const scope = useRef(accountScope.capture());
  const pending = useRef<{ value: MeditationPrefs; baseline: string | null } | null>(null);
  const [failure, setFailure] = useState<'write' | 'conflict' | 'account' | null>(null);
  const key = () => {
    accountScope.assertCurrent(scope.current);
    return accountScope.physicalKey('xai_meditation_prefs', scope.current);
  };
  const commit = (next: MeditationPrefs, replacePending = false): boolean => {
    if (pending.current && !replacePending) return false;
    let physical: string;
    try { physical = key(); } catch { setFailure('account'); return false; }
    try {
      const current = localStorage.getItem(physical);
      const baseline = pending.current ? pending.current.baseline : current;
      pending.current = { value: next, baseline };
      if (current !== baseline) { setFailure('conflict'); return false; }
      if (!setRaw(next)) { setFailure('write'); return false; }
      pending.current = null;
      setFailure(null);
      return true;
    } catch {
      // Preserve the proposed value even when reading is denied. Its baseline
      // is unknown; a non-empty value on retry must be treated as a conflict.
      if (!pending.current) pending.current = { value: next, baseline: null };
      setFailure('write');
      return false;
    }
  };
  return [safe, commit, {
    failure,
    retry: () => pending.current ? commit(pending.current.value, true) : false,
    discard: () => { pending.current = null; setFailure(null); },
    snapshot: () => { key(); return pending.current?.value ?? null; }
  }] as const;
}
