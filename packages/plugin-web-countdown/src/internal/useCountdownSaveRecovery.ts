import { useRef, useState } from 'react';
import { accountScope, usePref } from '@repo/plugin-web-storage';
import type { CountdownCard } from '../types.js';
import { mergePresetCountdowns } from './presetCards.js';

type ChangeKind = 'editor' | 'delete' | 'action' | 'presets';
type Pending = { kind: ChangeKind; next: CountdownCard[]; baseline: string | null };

/** One retained proposal for every card mutation; a failed write is never a committed view. */
export function useCountdownSaveRecovery() {
  const [rawCards, setRawCards] = usePref('xai_countdowns');
  const [owner] = useState(() => accountScope.capture());
  const pending = useRef<Pending | null>(null);
  const preparation = useRef<(() => boolean) | null>(null);
  const [error, setError] = useState<string | null>(null);
  const key = () => { accountScope.assertCurrent(owner); return accountScope.physicalKey('xai_countdowns', owner); };
  function persist(proposal: Pending): boolean {
    try {
      const raw = localStorage.getItem(key());
      if (raw !== proposal.baseline || raw !== null && JSON.stringify(JSON.parse(raw)) !== JSON.stringify(rawCards)) {
        throw new Error('Newer stored data exists. Export the draft and reopen before saving.');
      }
      if (!setRawCards(proposal.next)) throw new Error('Storage rejected this change.');
      pending.current = null; preparation.current = null; setError(null); return true;
    } catch (failure) {
      setError(String(failure)); return false;
    }
  }
  function mutate(mutator: (cards: CountdownCard[]) => CountdownCard[], kind: ChangeKind = 'action'): boolean {
    if (pending.current && !(kind === 'editor' && pending.current.kind === 'editor')) return false;
    preparation.current = () => mutate(mutator, kind);
    try {
      const raw = localStorage.getItem(key());
      const next = mutator(mergePresetCountdowns(rawCards, new Date()));
      const proposal = { next, kind, baseline: pending.current ? pending.current.baseline : raw };
      pending.current = proposal;
      return persist(proposal);
    } catch (failure) { setError(String(failure)); return false; }
  }
  return {
    rawCards, error, mutate,
    retry: (kind?: ChangeKind) => pending.current ? (!kind || pending.current.kind === kind) && persist(pending.current) : preparation.current?.() ?? false,
    discard: () => { pending.current = null; preparation.current = null; setError(null); },
    reject: (message: string) => { setError(message); return false; },
    snapshot: () => ({ version: 1, kind: 'countdown-unsaved-change', stored: localStorage.getItem(key()), pending: pending.current }),
  };
}
