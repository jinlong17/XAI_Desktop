/**
 * @internal — operation and recovery model of the Settings → Features pane.
 *
 * The 8 module toggles are unscoped device preferences
 * (`xai_pref_features_<id>`, boolean, default on). Each binds the accepted
 * async autosave hook with a strict boolean validator, in `featureIdOrder`
 * with a fixed hook order. Every valid edit and every Reset to defaults
 * intent becomes a field-local draft, and only that exact draft object may
 * settle its field:
 *
 * - a set draft displays its chosen value; a reset draft displays the
 *   registry default (on) and settles only on verified absence or the
 *   engine's verified no-op. Retry re-runs the field's own failed request,
 *   so a reset is retried as a removal and keeps its refusal or uncertainty
 *   authority;
 * - Reset to defaults is a pane-scoped batch of 8 per-key engine resets: no
 *   cross-key rollback, no all-or-nothing promise and no broadcast;
 * - invalid or unreadable stored bytes are source-only (Reload, never a
 *   write, purge or normalization);
 * - drafts are device work and survive account changes, while the host
 *   capabilities (departure guard, export, inline callbacks) belong to the
 *   current permission epoch and refuse once it changes, even before
 *   rerender.
 *
 * Contract: docs/reviews/web-features-recovery-contract/contract.md §5–§9.
 */

import * as React from "react";
import { accountScope, usePrefAutosaveAsync } from "@repo/plugin-web-storage";
import type { PrefAutosaveAsyncResult } from "@repo/plugin-web-storage";
import type { PaneDepartureGuard, PaneDepartureGuardRegistration } from "@repo/plugin-web-settings-shell";
import { featureIdOrder } from "../featureIds.js";
import type { FeatureId } from "../featureIds.js";

type Operation = "set" | "reset";

/** One admitted user intent. Only this exact object may settle its field's work. */
interface Draft {
  readonly operation: Operation;
  /** Displayed intent: the chosen value, or the registry default for a reset. */
  readonly value: boolean;
  readonly session: object;
  /** Reset batch that counts this intent toward "Defaults restored" (null for a set). */
  batch: object | null;
  settledFailure: boolean;
  retryActive: boolean;
}
type Drafts = Record<FeatureId, Draft | null>;
type Bindings = Record<FeatureId, PrefAutosaveAsyncResult<boolean>>;
type DeviceChange = { readonly operation: "set"; readonly value: boolean } | { readonly operation: "reset" };

export type FeatureFieldState = "clean" | "saving" | "resetting" | "not-saved" | "not-reset" | "unavailable";
export interface FeatureFieldView {
  readonly id: FeatureId;
  /** Displayed value: the latest intent while a draft exists, else the stored value or default. */
  readonly on: boolean;
  readonly state: FeatureFieldState;
}
export type FeaturesStatus = "saved" | "restored" | null;

export interface FeaturesRecoveryOptions {
  /** Localized pane label for the host departure prompt (`settings.features`). */
  readonly guardLabel: string;
  readonly registerDepartureGuard?: PaneDepartureGuardRegistration;
}

export interface FeaturesRecovery {
  readonly fields: readonly FeatureFieldView[];
  /** Actual current set or reset drafts exist (pending or failed). */
  readonly hasDraft: boolean;
  readonly exportFailed: boolean;
  /** Truthful pane status, already suppressed while work or source errors exist. */
  readonly status: FeaturesStatus;
  readonly toggle: (id: FeatureId) => void;
  readonly retry: (id: FeatureId) => void;
  readonly discard: (id: FeatureId) => void;
  readonly reload: (id: FeatureId) => void;
  readonly discardAll: () => void;
  readonly exportDraft: () => void;
  /** Asks `confirmReset` before any intent exists; declining touches nothing. */
  readonly resetToDefaults: (confirmReset: () => boolean) => void;
}

/** Registry default of all 8 module toggles (`PREF_REGISTRY`, boolean `true`). */
const DEFAULT_ON = true;
const isBoolean = (value: unknown): value is boolean => typeof value === "boolean";
const STRICT_BOOLEAN = { validate: isBoolean } as const;
const emptyDrafts = (): Drafts => ({
  tasks: null,
  board: null,
  dashboard: null,
  calendar: null,
  matrix: null,
  pomodoro: null,
  habits: null,
  meditation: null,
});

export function useFeaturesRecovery({ guardLabel, registerDepartureGuard }: FeaturesRecoveryOptions): FeaturesRecovery {
  const scope = React.useSyncExternalStore(accountScope.subscribe, accountScope.capture, accountScope.capture);
  // One strict binding per key, in featureIdOrder; the count and hook order never change.
  const tasks = usePrefAutosaveAsync("xai_pref_features_tasks", STRICT_BOOLEAN);
  const board = usePrefAutosaveAsync("xai_pref_features_board", STRICT_BOOLEAN);
  const dashboard = usePrefAutosaveAsync("xai_pref_features_dashboard", STRICT_BOOLEAN);
  const calendar = usePrefAutosaveAsync("xai_pref_features_calendar", STRICT_BOOLEAN);
  const matrix = usePrefAutosaveAsync("xai_pref_features_matrix", STRICT_BOOLEAN);
  const pomodoro = usePrefAutosaveAsync("xai_pref_features_pomodoro", STRICT_BOOLEAN);
  const habits = usePrefAutosaveAsync("xai_pref_features_habits", STRICT_BOOLEAN);
  const meditation = usePrefAutosaveAsync("xai_pref_features_meditation", STRICT_BOOLEAN);
  const bindings: Bindings = { tasks, board, dashboard, calendar, matrix, pomodoro, habits, meditation };

  const bindingsRef = React.useRef(bindings);
  bindingsRef.current = bindings;
  const scopeRef = React.useRef(scope);
  scopeRef.current = scope;
  const epochRef = React.useRef(scope.epoch);
  const decisionTokenRef = React.useRef<object>({});
  const sessionRef = React.useRef<object>({});
  const aliveRef = React.useRef(true);
  const draftsRef = React.useRef<Drafts>(emptyDrafts());
  const resetBatchRef = React.useRef<object | null>(null);
  const [draftVersion, setDraftVersion] = React.useState(0);
  const [exportFailed, setExportFailed] = React.useState(false);
  const [outcome, setOutcome] = React.useState<FeaturesStatus>(null);

  // Device work survives every owner change, but an old host decision must refuse.
  if (epochRef.current !== scope.epoch) {
    epochRef.current = scope.epoch;
    decisionTokenRef.current = {};
  }
  // Unmount detaches every capability and late completion; committed writes and removals stay.
  React.useLayoutEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      decisionTokenRef.current = {};
      draftsRef.current = emptyDrafts();
      resetBatchRef.current = null;
    };
  }, []);

  const changed = React.useCallback(() => setDraftVersion((version) => version + 1), []);
  const liveScope = React.useCallback(
    () => aliveRef.current && accountScope.capture() === scopeRef.current && epochRef.current === scopeRef.current.epoch,
    [],
  );
  const isCurrentDraft = React.useCallback(
    (draft: Draft | null): draft is Draft =>
      Boolean(draft && liveScope() && draft.session === sessionRef.current && isBoolean(draft.value)),
    [liveScope],
  );
  const hasCurrentDraft = React.useCallback(
    () => featureIdOrder.some((id) => isCurrentDraft(draftsRef.current[id])),
    [isCurrentDraft],
  );

  /** Establishes a field's identity, session and operation before anything is enqueued. */
  const admit = React.useCallback((id: FeatureId, operation: Operation, value: boolean, batch: object | null): Draft => {
    const draft: Draft = { operation, value, session: sessionRef.current, batch, settledFailure: false, retryActive: false };
    draftsRef.current[id] = draft;
    return draft;
  }, []);

  const settle = React.useCallback((id: FeatureId, draft: Draft, ok: boolean) => {
    // Superseded, discarded or detached work never revives or clears newer work.
    if (draftsRef.current[id] !== draft) return;
    if (!ok) {
      draft.retryActive = false;
      draft.settledFailure = true;
      changed();
      return;
    }
    draftsRef.current[id] = null;
    const workLeft = featureIdOrder.some((other) => draftsRef.current[other] !== null);
    if (!workLeft && draft.operation === "reset" && draft.batch !== null && draft.batch === resetBatchRef.current) {
      resetBatchRef.current = null;
      setOutcome("restored");
    } else {
      setOutcome("saved");
    }
    changed();
  }, [changed]);
  const settlePredecessor = React.useCallback((id: FeatureId, draft: Draft, ok: boolean) => {
    // Recovering a failed predecessor only lets the field's queue continue. Its
    // result never acknowledges this newer draft; a repeated failure stays retryable.
    if (ok || draftsRef.current[id] !== draft) return;
    draft.retryActive = false;
    changed();
  }, [changed]);
  const submit = React.useCallback((id: FeatureId, draft: Draft) => {
    const binding = bindingsRef.current[id];
    const request = draft.operation === "reset" ? binding.reset() : binding.edit(draft.value);
    void request.then((result) => settle(id, draft, result.ok), () => settle(id, draft, false));
  }, [settle]);

  const edit = React.useCallback((id: FeatureId, value: boolean) => {
    if (!liveScope() || !isBoolean(value)) return;
    // A newer contrary edit supersedes any pending "Defaults restored" claim.
    resetBatchRef.current = null;
    const draft = admit(id, "set", value, null);
    setExportFailed(false);
    setOutcome(null);
    changed();
    submit(id, draft);
  }, [admit, changed, liveScope, submit]);
  /** A switch inverts the latest intent (its draft), never the rendered closure. */
  const toggle = React.useCallback((id: FeatureId) => {
    const draft = draftsRef.current[id];
    const latest = isCurrentDraft(draft) ? draft.value : bindingsRef.current[id].value;
    edit(id, latest !== true);
  }, [edit, isCurrentDraft]);

  const retry = React.useCallback((id: FeatureId) => {
    const draft = draftsRef.current[id];
    if (!isCurrentDraft(draft) || draft.retryActive) return;
    const binding = bindingsRef.current[id];
    const failedRequest = binding.meta.status === "error" || binding.meta.status === "conflict";
    const ownFailure = draft.settledFailure;
    // While the field's own operation is pending, Retry is inert.
    if (!ownFailure && !failedRequest) return;
    // A reset draft is only ever retried as its own failed removal, never as a set.
    if (ownFailure && draft.operation === "reset" && !failedRequest) return;
    draft.retryActive = true;
    if (ownFailure) draft.settledFailure = false;
    changed();
    const attempt = binding.retry();
    if (ownFailure) void attempt.then((result) => settle(id, draft, result.ok), () => settle(id, draft, false));
    else void attempt.then((result) => settlePredecessor(id, draft, result.ok), () => settlePredecessor(id, draft, false));
  }, [changed, isCurrentDraft, settle, settlePredecessor]);

  const discard = React.useCallback((id: FeatureId) => {
    const draft = draftsRef.current[id];
    if (!isCurrentDraft(draft)) return;
    // Detach first: a late completion of the discarded work can never revive it.
    draftsRef.current[id] = null;
    if (draft.batch !== null && draft.batch === resetBatchRef.current) resetBatchRef.current = null;
    changed();
    bindingsRef.current[id].meta.reload();
  }, [changed, isCurrentDraft]);
  /** Visits only actual current drafts; other fields are neither read nor written. */
  const discardAll = React.useCallback(() => {
    for (const id of featureIdOrder) if (isCurrentDraft(draftsRef.current[id])) discard(id);
  }, [discard, isCurrentDraft]);
  const reload = React.useCallback((id: FeatureId) => {
    // Refused at invocation time while the same field holds actual work.
    if (!liveScope() || draftsRef.current[id] !== null) return;
    // A source repair rereads; it never claims a save by itself.
    setOutcome(null);
    bindingsRef.current[id].meta.reload();
  }, [liveScope]);

  const resetToDefaults = React.useCallback((confirmReset: () => boolean) => {
    if (!liveScope()) return;
    let accepted = false;
    try { accepted = confirmReset() === true; } catch { accepted = false; }
    if (!accepted || !liveScope()) return;
    const current = resetBatchRef.current;
    const unresolved = current === null ? [] : featureIdOrder.filter((id) => {
      const draft = draftsRef.current[id];
      return isCurrentDraft(draft) && draft.batch === current;
    });
    if (unresolved.length > 0) {
      // A duplicate activation enqueues no duplicate removal: pending resets
      // continue, and failed ones re-attempt only their own removal.
      for (const id of unresolved) if (draftsRef.current[id]?.settledFailure) retry(id);
      return;
    }
    // Synchronously admit 8 typed reset intents and one batch identity.
    const batch = {};
    resetBatchRef.current = batch;
    const admitted: Array<readonly [FeatureId, Draft]> = [];
    const failedResets: FeatureId[] = [];
    for (const id of featureIdOrder) {
      const existing = draftsRef.current[id];
      if (isCurrentDraft(existing) && existing.operation === "reset") {
        // An unresolved reset keeps its own request and authority; it is never
        // rebased. A failed one re-attempts only its own removal.
        existing.batch = batch;
        if (existing.settledFailure) failedResets.push(id);
        continue;
      }
      admitted.push([id, admit(id, "reset", DEFAULT_ON, batch)]);
    }
    setExportFailed(false);
    setOutcome(null);
    changed();
    for (const [id, draft] of admitted) submit(id, draft);
    for (const id of failedResets) retry(id);
  }, [admit, changed, isCurrentDraft, liveScope, retry, submit]);

  const exportDraft = React.useCallback(() => {
    const token = decisionTokenRef.current;
    const stillCurrent = () => liveScope() && decisionTokenRef.current === token && hasCurrentDraft();
    if (!stillCurrent()) return;
    // Memory only: captured, strictly revalidated drafts; never a Storage call.
    const device: Partial<Record<FeatureId, DeviceChange>> = {};
    for (const id of featureIdOrder) {
      const draft = draftsRef.current[id];
      if (!isCurrentDraft(draft)) continue;
      device[id] = draft.operation === "reset" ? { operation: "reset" } : { operation: "set", value: draft.value };
    }
    if (Object.keys(device).length === 0) return;
    let url: string | null = null;
    let anchor: HTMLAnchorElement | null = null;
    try {
      const blob = new Blob([JSON.stringify({ version: 1, kind: "features-draft", changes: { device } })], { type: "application/json" });
      if (!stillCurrent()) return;
      url = URL.createObjectURL(blob);
      if (!stillCurrent()) return;
      anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "features-draft.json";
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      if (!stillCurrent()) return;
      anchor.click();
      if (stillCurrent()) setExportFailed(false);
    } catch {
      if (stillCurrent()) setExportFailed(true);
    } finally {
      try { anchor?.remove(); } catch { /* cleanup never changes recovery */ }
      try { if (url !== null) URL.revokeObjectURL(url); } catch { /* cleanup never changes recovery */ }
    }
  }, [hasCurrentDraft, isCurrentDraft, liveScope]);

  // Registers whenever the host provides the hook; blocks only while drafts
  // exist. A fresh registration per epoch carries a fresh decision token, and
  // draftVersion re-registers so the host re-evaluates a held departure.
  React.useEffect(() => {
    if (!registerDepartureGuard) return undefined;
    const token = decisionTokenRef.current;
    const capturedScope = scope;
    const isCurrent = () => decisionTokenRef.current === token && liveScope() && accountScope.capture() === capturedScope;
    const guard: PaneDepartureGuard = {
      token,
      label: guardLabel,
      isCurrent,
      isBlocking: () => isCurrent() && hasCurrentDraft(),
      exportDraft: () => { if (isCurrent()) exportDraft(); },
      discardDraft: () => { if (isCurrent()) discardAll(); },
    };
    return registerDepartureGuard(guard);
  }, [discardAll, draftVersion, exportDraft, guardLabel, hasCurrentDraft, liveScope, registerDepartureGuard, scope]);

  const hasDraft = hasCurrentDraft();
  React.useEffect(() => {
    if (!hasDraft) return undefined;
    // A cancelable warning only (not crash durability); never a Storage call.
    const warn = (event: BeforeUnloadEvent) => {
      if (!aliveRef.current || !featureIdOrder.some((id) => draftsRef.current[id] !== null)) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasDraft]);

  const fields = featureIdOrder.map((id): FeatureFieldView => {
    const binding = bindings[id];
    const draft = draftsRef.current[id];
    if (isCurrentDraft(draft)) {
      const failed = !draft.retryActive
        && (draft.settledFailure || binding.meta.status === "error" || binding.meta.status === "conflict");
      const state: FeatureFieldState = draft.operation === "reset"
        ? (failed ? "not-reset" : "resetting")
        : (failed ? "not-saved" : "saving");
      return { id, on: draft.value, state };
    }
    const sourceOnly = binding.meta.source === "invalid" || binding.meta.source === "unavailable";
    return { id, on: binding.value === true, state: sourceOnly ? "unavailable" : "clean" };
  });
  const sourceIssue = featureIdOrder.some((id) => {
    const meta = bindings[id].meta;
    return meta.source === "invalid" || meta.source === "unavailable"
      || meta.status === "error" || meta.status === "conflict" || meta.status === "pending";
  });

  return {
    fields,
    hasDraft,
    exportFailed: hasDraft && exportFailed,
    status: !hasDraft && !sourceIssue ? outcome : null,
    toggle,
    retry,
    discard,
    reload,
    discardAll,
    exportDraft,
    resetToDefaults,
  };
}
