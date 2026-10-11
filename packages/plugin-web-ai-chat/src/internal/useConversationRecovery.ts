import { useCallback, useRef, useState } from "react";
import { accountScope, usePref } from "@repo/plugin-web-storage";
import { isAiConvoRecord } from "./isAiConvoRecord.js";
import type { AiConvoRecord } from "../types.js";

type Operation = "messages" | "select" | "delete";
type Pending = { records: AiConvoRecord[]; baseline: string | null; operation: Operation; blocked?: boolean; done?: () => void };

/** Mounted-page recovery only. The original raw baseline survives every failed retry. */
export function useConversationRecovery() {
  const [raw, write] = usePref("xai_ai_convos");
  const [restored, setRestored] = useState<{ source: typeof raw; records: AiConvoRecord[] } | null>(null);
  const visibleRaw = restored?.source === raw ? restored.records : raw;
  const [scope] = useState(() => accountScope.capture());
  const pending = useRef<Pending | null>(null);
  const committed = useRef<AiConvoRecord[]>([]);
  committed.current = Array.isArray(visibleRaw) ? (visibleRaw as unknown[]).filter(isAiConvoRecord) : [];
  const [error, setError] = useState<"unsaved" | "conflict" | "owner" | null>(null);
  const read = useCallback(() => {
    accountScope.assertCurrent(scope);
    return localStorage.getItem(accountScope.physicalKey("xai_ai_convos", scope));
  }, [scope]);
  const [initialBaseline] = useState(() => { try { return read(); } catch { return undefined; } });
  const observed = useRef(initialBaseline);
  const retry = useCallback(() => {
    const draft = pending.current;
    if (!draft) return true;
    try {
      if (draft.blocked || read() !== draft.baseline) { setError("conflict"); return false; }
      if (!write(draft.records)) { setError("unsaved"); return false; }
      observed.current = JSON.stringify(draft.records);
      committed.current = draft.records;
      pending.current = null;
      setError(null);
      draft.done?.();
      return true;
    } catch { setError("owner"); return false; }
  }, [read, write]);
  const save = useCallback((update: (records: AiConvoRecord[]) => AiConvoRecord[], operation: Operation = "messages", done?: () => void) => {
    if (!accountScope.isReady(scope)) { setError("owner"); return false; }
    if (pending.current && (operation !== "messages" || pending.current.operation !== "messages")) return false;
    try {
      const previous = pending.current;
      const baseline = previous ? previous.baseline : observed.current;
      if (baseline === undefined) { setError("unsaved"); return false; }
      let source = previous?.records;
      if (!source) {
        // Build from the exact observed bytes underlying this editing session.
        // External writes, including events not yet delivered, must not make a
        // stale transcript look current. Do not drop malformed stored records.
        const parsed: unknown = baseline === null ? [] : JSON.parse(baseline);
        if (!Array.isArray(parsed) || !parsed.every(isAiConvoRecord)) {
          pending.current = { records: update(committed.current), baseline, operation, done, blocked: true };
          setError("conflict"); return false;
        }
        source = parsed;
      }
      pending.current = {
        records: update(source), baseline, operation, done,
        blocked: previous?.blocked,
      };
    } catch { setError("unsaved"); return false; }
    return retry();
  }, [retry, scope]);
  const discard = useCallback(() => {
    if (!accountScope.isReady(scope)) { setError("owner"); return false; }
    try {
      const baseline = read();
      const parsed: unknown = baseline === null ? [] : JSON.parse(baseline);
      if (!Array.isArray(parsed) || !parsed.every(isAiConvoRecord)) { setError("conflict"); return false; }
      observed.current = baseline;
      setRestored({ source: raw, records: parsed });
      committed.current = parsed;
      pending.current = null;
      setError(null);
      return true;
    } catch { setError("unsaved"); return false; }
  }, [scope, read, raw]);
  const snapshot = useCallback(() => {
    accountScope.assertCurrent(scope);
    if (!accountScope.isReady(scope)) throw new Error("Account changed");
    return { records: pending.current?.records ?? committed.current, operation: pending.current?.operation ?? null };
  }, [scope]);
  return { raw: visibleRaw, save, retry, discard, snapshot, error, pending };
}
