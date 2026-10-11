import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { accountScope } from "@repo/plugin-web-storage";
import type { PrefMutationResult } from "@repo/plugin-web-storage";
import type { PomodoroDepartureGuardRegistration } from "../types.js";

export type PomodoroPreferenceField =
  | "preset"
  | "customMinutes"
  | "displayStyle"
  | "theme"
  | "sound"
  | "muted";

type Draft = {
  readonly id: number;
  readonly retry: () => Promise<PrefMutationResult<unknown>>;
  readonly discard: () => void;
  settledFailure: boolean;
};

type Snapshot = Readonly<{
  preset: unknown;
  customMinutes: unknown;
  displayStyle: unknown;
  theme: unknown;
  sound: unknown;
  muted: unknown;
}>;

type Options = {
  readonly lang: "en" | "zh";
  readonly registerDepartureGuard?: PomodoroDepartureGuardRegistration;
  readonly snapshot: Snapshot;
  readonly validateSnapshot: (snapshot: Snapshot) => boolean;
};

export function usePreferenceDepartureRecovery({
  lang,
  registerDepartureGuard,
  snapshot,
  validateSnapshot,
}: Options) {
  const epoch = useSyncExternalStore(
    accountScope.subscribe,
    () => accountScope.capture().epoch,
    () => accountScope.capture().epoch,
  );
  const draftsRef = useRef(new Map<PomodoroPreferenceField, Draft>());
  const sequenceRef = useRef(0);
  const disposedRef = useRef(false);
  const epochRef = useRef(epoch);
  const snapshotRef = useRef(snapshot);
  const validateSnapshotRef = useRef(validateSnapshot);
  const [draftVersion, setDraftVersion] = useState(0);
  const [exportFailed, setExportFailed] = useState(false);
  epochRef.current = epoch;
  snapshotRef.current = snapshot;
  validateSnapshotRef.current = validateSnapshot;

  const changed = useCallback(() => setDraftVersion(version => version + 1), []);
  const edit = useCallback(<T,>(
    field: PomodoroPreferenceField,
    value: T,
    operation: (value: T) => Promise<PrefMutationResult<T>>,
    retry: () => Promise<PrefMutationResult<T>>,
    discard: () => void,
  ): Promise<PrefMutationResult<T>> => {
    const id = ++sequenceRef.current;
    draftsRef.current.set(field, {
      id,
      retry: retry as () => Promise<PrefMutationResult<unknown>>,
      discard,
      settledFailure: false,
    });
    changed();
    const promise = operation(value);
    void promise.then(result => {
      if (result.ok && draftsRef.current.get(field)?.id === id) {
        draftsRef.current.delete(field);
        changed();
      } else if (!result.ok && draftsRef.current.get(field)?.id === id) {
        const current = draftsRef.current.get(field);
        if (current) current.settledFailure = true;
      }
    });
    return promise;
  }, [changed]);

  const retryDrafts = useCallback(() => {
    for (const [field, draft] of draftsRef.current) {
      if (!draft.settledFailure) continue;
      draft.settledFailure = false;
      void draft.retry().then(result => {
        if (result.ok && draftsRef.current.get(field)?.id === draft.id) {
          draftsRef.current.delete(field);
          changed();
        } else if (!result.ok && draftsRef.current.get(field)?.id === draft.id) {
          draft.settledFailure = true;
        }
      });
    }
  }, [changed]);

  const discardDrafts = useCallback(() => {
    const drafts = [...draftsRef.current.values()];
    draftsRef.current.clear();
    for (const draft of drafts) draft.discard();
    setExportFailed(false);
    changed();
  }, [changed]);

  const discardFields = useCallback((fields: readonly PomodoroPreferenceField[]) => {
    const discarded: Draft[] = [];
    for (const field of fields) {
      const draft = draftsRef.current.get(field);
      if (!draft) continue;
      draftsRef.current.delete(field);
      discarded.push(draft);
    }
    for (const draft of discarded) draft.discard();
    if (discarded.length > 0) {
      setExportFailed(false);
      changed();
    }
  }, [changed]);

  const exportDraft = useCallback((decisionEpoch = epochRef.current) => {
    let anchor: HTMLAnchorElement | null = null;
    let url: string | null = null;
    const isDecisionCurrent = () => !disposedRef.current
      && decisionEpoch === accountScope.capture().epoch;
    try {
      if (!isDecisionCurrent() || draftsRef.current.size === 0) return;
      const values = snapshotRef.current;
      if (!validateSnapshotRef.current(values)) throw new Error("invalid-preference-snapshot");
      const blob = new Blob([
        JSON.stringify({ version: 1, kind: "pomodoro-preference-draft", values }, null, 2),
      ], { type: "application/json" });
      url = URL.createObjectURL(blob);
      anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "pomodoro-preferences.json";
      document.body.appendChild(anchor);
      if (!isDecisionCurrent() || draftsRef.current.size === 0) return;
      anchor.click();
      setExportFailed(false);
    } catch {
      if (isDecisionCurrent()) setExportFailed(true);
    } finally {
      try { anchor?.remove(); } catch { /* best-effort cleanup */ }
      try { if (url) URL.revokeObjectURL(url); } catch { /* best-effort cleanup */ }
    }
  }, []);

  const decisionToken = useMemo(() => ({ epoch }), [epoch]);
  useEffect(() => {
    if (!registerDepartureGuard) return undefined;
    const decisionEpoch = epoch;
    return registerDepartureGuard({
      token: decisionToken,
      label: lang === "zh" ? "番茄钟偏好" : "Pomodoro preferences",
      isBlocking: () => !disposedRef.current
        && accountScope.capture().epoch === decisionEpoch
        && draftsRef.current.size > 0,
      isCurrent: () => !disposedRef.current && accountScope.capture().epoch === decisionEpoch,
      exportDraft: () => exportDraft(decisionEpoch),
      discardDraft: () => {
        if (!disposedRef.current && accountScope.capture().epoch === decisionEpoch) discardDrafts();
      },
    });
  }, [decisionToken, discardDrafts, draftVersion, epoch, exportDraft, lang, registerDepartureGuard]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (draftsRef.current.size === 0) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);
  useEffect(() => {
    disposedRef.current = false;
    return () => { disposedRef.current = true; };
  }, []);

  return {
    edit,
    retryDrafts,
    discardDrafts,
    discardFields,
    exportDraft,
    hasDrafts: draftsRef.current.size > 0,
    draftVersion,
    exportFailed,
  };
}
