import { useEffect, useRef, useState } from 'react';
import { accountScope } from '@repo/plugin-web-storage';

type Proposal = { next: string[]; kind: string; after?: () => void };
export function useOrderSaveRecovery(persisted: readonly string[], setter: (next: string[]) => boolean) {
  const [owner] = useState(() => accountScope.capture());
  const key = () => { accountScope.assertCurrent(owner); return accountScope.physicalKey('xai_dash_order', owner); };
  const baseline = useRef<string | null | undefined>(undefined);
  if (baseline.current === undefined) { try { baseline.current = localStorage.getItem(key()); } catch { /* Mutations expose scope/read failure. */ } }
  const pending = useRef<Proposal | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (pending.current) return;
    try {
      accountScope.assertCurrent(owner);
      const raw = localStorage.getItem(accountScope.physicalKey('xai_dash_order', owner));
      if (raw !== null && JSON.stringify(JSON.parse(raw)) === JSON.stringify(persisted)) baseline.current = raw;
    } catch { /* Do not adopt an unreadable or different account's baseline. */ }
  }, [owner, persisted]);
  function commit(proposal: Proposal): boolean {
    try {
      const raw = localStorage.getItem(key());
      if (raw !== baseline.current || raw !== null && JSON.stringify(JSON.parse(raw)) !== JSON.stringify(persisted)) throw new Error('Newer dashboard order exists. Export and reopen before changing it.');
      if (!setter(proposal.next)) throw new Error('Dashboard order was not saved.');
      baseline.current = JSON.stringify(proposal.next); pending.current = null; setError(null); proposal.after?.(); return true;
    } catch (failure) { setError(String(failure)); return false; }
  }
  function save(next: string[], after?: () => void, kind = 'reorder') {
    if (pending.current && (kind !== 'reorder' || pending.current.kind !== kind)) return false;
    const proposal = { next, after, kind }; pending.current = proposal; return commit(proposal);
  }
  return { save, recovery: {
    error,
    retry: () => pending.current ? commit(pending.current) : false,
    discard: () => {
      try { const physical = key(); pending.current = null; baseline.current = localStorage.getItem(physical); setError(null); window.dispatchEvent(new StorageEvent('storage', { key: physical, storageArea: localStorage })); }
      catch { setError('Cannot reopen saved dashboard order.'); }
    },
    snapshot: () => ({ version: 1, kind: 'dashboard-order', stored: localStorage.getItem(key()), draft: pending.current?.next ?? null, operation: pending.current?.kind ?? null }),
  } };
}
