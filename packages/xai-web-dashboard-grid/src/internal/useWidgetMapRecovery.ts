import { useCallback, useEffect, useRef, useState } from 'react';
import { accountScope, setPrefAutosave } from '@repo/plugin-web-storage';

/** Account-owned maps: publish only committed state, retaining the latest failed proposal separately. */
export function useWidgetMapRecovery<T>(suffix: string, normalize: (raw: unknown) => T) {
  const [owner] = useState(() => accountScope.capture());
  const physical = useCallback(() => { accountScope.assertCurrent(owner); return accountScope.physicalKey(`xai_pref_${suffix}`, owner); }, [owner, suffix]);
  const [initial] = useState(() => {
    try { const raw = localStorage.getItem(physical()); return { raw, value: normalize(raw === null ? null : JSON.parse(raw)), error: null as string | null }; }
    catch { return { raw: null, value: normalize(null), error: 'Saved widget data could not be read. Reopen or export before changing it.' }; }
  });
  const [value, setValue] = useState(initial.value);
  const baseline = useRef(initial.raw);
  const committed = useRef(value); committed.current = value;
  const pending = useRef<T | null>(null);
  const [error, setError] = useState<string | null>(initial.error);
  const save = useCallback((next: T): boolean => {
    pending.current = next;
    try {
      const raw = localStorage.getItem(physical());
      if (raw !== baseline.current) throw new Error('Newer saved data exists. Export your changes and reopen.');
      if (!setPrefAutosave(suffix, next, { codec: 'json', scope: owner })) throw new Error('Widget changes were not saved.');
      baseline.current = JSON.stringify(next); pending.current = null; committed.current = next; setValue(next); setError(null); return true;
    } catch (failure) { setError(String(failure)); return false; }
  }, [owner, physical, suffix]);
  const update = useCallback((change: (current: T) => T) => save(change(pending.current ?? committed.current)), [save]);
  useEffect(() => {
    const receive = (event: StorageEvent) => {
      if (!accountScope.isReady(owner)) return;
      try {
        if (event.key !== physical() && event.key !== null) return;
        if (pending.current !== null) { setError('Saved data changed while changes are pending. Export and reopen.'); return; }
        const raw = localStorage.getItem(physical()); const next = normalize(raw === null ? null : JSON.parse(raw));
        baseline.current = raw; committed.current = next; setValue(next); setError(null);
      } catch { setError('Saved widget data could not be read.'); }
    };
    window.addEventListener('storage', receive); return () => window.removeEventListener('storage', receive);
  }, [normalize, owner, physical]);
  return { value, update, recovery: {
    error,
    retry: () => pending.current !== null ? save(pending.current) : false,
    discard: () => {
      try { const raw = localStorage.getItem(physical()), next = normalize(raw === null ? null : JSON.parse(raw)); baseline.current = raw; pending.current = null; committed.current = next; setValue(next); setError(null); } catch { setError('Cannot reopen saved widget data.'); }
    },
    snapshot: () => ({ version: 1, kind: suffix, stored: localStorage.getItem(physical()), draft: pending.current }),
  } };
}
