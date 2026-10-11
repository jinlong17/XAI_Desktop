/**
 * @internal — the App-scoped rail-order controller (CP-APPRAIL-01).
 *
 * `xai_rail_order` is an unscoped device preference. The controller binds it
 * through the accepted async autosave engine on the registered path (`json`
 * codec, registry default) with the strict A5 validator, so:
 *
 * - invalid or unreadable stored bytes are source-only: the rail displays
 *   D(DEFAULT_RAIL_ORDER, R), the Topbar status offers Reload, and nothing is
 *   ever rewritten, purged or normalized;
 * - every drop admits exactly one absolute set intent whose value is the A2
 *   index-slot merge (R-1), computed when the drop is admitted. That intent is
 *   the field's exact draft object, and only that object may settle it: the
 *   draft displays at once and only the matching latest success clears it
 *   (verified bytes or the engine's verified no-op);
 * - Retry re-runs the field's own held request once (its kind and token), so
 *   an uncertain or refused write keeps its authority; Discard detaches the
 *   draft before the safe reload; Export is memory-only;
 * - the controller keeps a `beforeunload` warning while a draft exists and
 *   owns the sign-out step. It never reads or writes account machinery.
 *
 * Contract: docs/reviews/web-apprail-order-recovery-contract/contract.md r1,
 * R-1, A2–A8 and §5–§8.
 */

import * as React from "react";
import { PREF_REGISTRY, usePrefAutosaveAsync } from "@repo/plugin-web-storage";
import type { PrefAutosaveAsyncResult, PrefMutationResult, RailItemId } from "@repo/plugin-web-storage";
import type { Lang } from "@repo/plugin-web-tokens";
import type {
  RailOrderController,
  RailOrderControllerOptions,
  RailOrderProviderProps,
  RailOrderStatusKind,
} from "../types.js";
import { railOrderCopy } from "./railOrderCopy.js";
import { isRailOrder, mergeRailOrder } from "./railOrderModel.js";

// Registered binding: the registry keeps its codec, default and bytes; the caller adds the strict domain.
const RAIL_ORDER_BINDING = { validate: isRailOrder as (value: unknown) => value is RailItemId[] } as const;

type Binding = PrefAutosaveAsyncResult<string[]>;
type BindingMeta = Binding["meta"];

/** One admitted drop. Only this exact object may settle the field's work. */
interface Draft {
  /** The full stored order the write would store (the A2 merge). */
  readonly value: string[];
  /**
   * The binding meta rendered when the intent was admitted. A rendered engine
   * status is only trusted for this draft once a later render exists.
   */
  readonly admittedMeta: BindingMeta;
  /** The draft's own request failed and nothing is re-attempting it. */
  settledFailure: boolean;
  /** A Retry for this draft (its own request or a held predecessor) is in flight. */
  retryActive: boolean;
  /** The draft was settled unsuccessful at least once since it was admitted (A8 rule (a)). */
  everFailed: boolean;
}

interface ControllerState {
  binding: Binding;
  lang: Lang;
  alive: boolean;
  draft: Draft | null;
  exportFailed: boolean;
}

interface Operations {
  readonly canRetry: () => boolean;
  readonly currentOrder: () => string[];
  readonly drop: RailOrderController["drop"];
  readonly retry: RailOrderController["retry"];
  readonly discard: RailOrderController["discard"];
  readonly reload: RailOrderController["reload"];
  readonly exportDraft: RailOrderController["exportDraft"];
  readonly confirmSignOut: RailOrderController["confirmSignOut"];
}

const refusal = (): Promise<PrefMutationResult<unknown>> => Promise.resolve({ ok: false, reason: "storage" });

/**
 * The committed order: the binding's strictly validated value, which the
 * engine already replaces by the registry default (`DEFAULT_RAIL_ORDER`) for
 * absent, invalid or unreadable bytes.
 */
function committedOrder(binding: Binding): string[] {
  const value: unknown = binding.value;
  if (isRailOrder(value)) return value;
  const fallback: unknown = PREF_REGISTRY.xai_rail_order.default;
  return isRailOrder(fallback) ? [...fallback] : [];
}

function createOperations(state: ControllerState, notify: () => void): Operations {
  /** The rendered engine status shows a held failed request for this draft's field. */
  const failedShown = (draft: Draft): boolean => {
    const meta = state.binding.meta;
    return meta !== draft.admittedMeta && (meta.status === "error" || meta.status === "conflict");
  };
  /**
   * Retry is runnable: an actual draft, nothing in flight or runnable for it,
   * and the field's queue held by a failed request (its own, or a failed
   * predecessor the latest draft is queued behind).
   */
  const canRetry = (): boolean => {
    if (!state.alive) return false;
    const draft = state.draft;
    if (draft === null || draft.retryActive) return false;
    return draft.settledFailure || failedShown(draft);
  };

  /** S at this moment: the draft's value, else the committed bytes, else the default. */
  const currentOrder = (): string[] => (state.draft !== null ? state.draft.value : committedOrder(state.binding));

  const settle = (draft: Draft, ok: boolean): void => {
    // Superseded, discarded or detached work never revives or clears newer work.
    if (!state.alive || state.draft !== draft) return;
    if (!ok) {
      draft.retryActive = false;
      draft.settledFailure = true;
      draft.everFailed = true;
      notify();
      return;
    }
    state.draft = null;
    // The export-failure line belongs to the draft: clearing the draft clears it.
    state.exportFailed = false;
    notify();
  };
  const settlePredecessor = (draft: Draft, ok: boolean): void => {
    // Recovering a failed predecessor only lets the field's queue continue. Its
    // result never acknowledges this newer draft; a repeated failure stays retryable.
    if (ok || !state.alive || state.draft !== draft) return;
    draft.retryActive = false;
    notify();
  };

  /** Detaches the draft before the safe reload: zero writes, rereads only this key. */
  const detach = (): boolean => {
    const draft = state.draft;
    if (draft === null) return false;
    state.draft = null;
    try {
      state.binding.meta.reload();
    } catch {
      /* the detached draft stays detached */
    }
    return true;
  };

  return {
    canRetry,
    currentOrder,
    drop: (order, visible) => {
      if (!state.alive) return false;
      // The merge always uses S and R at drop time (§6 item 7).
      const merged = mergeRailOrder(currentOrder(), visible, order);
      if (merged === null) return false;
      // Establish the field's identity before anything is enqueued (§5 item 3).
      const draft: Draft = {
        value: merged,
        admittedMeta: state.binding.meta,
        settledFailure: false,
        retryActive: false,
        everFailed: false,
      };
      state.draft = draft;
      state.exportFailed = false;
      let request: Promise<PrefMutationResult<unknown>>;
      try {
        request = state.binding.edit(merged);
      } catch {
        request = refusal();
      }
      void request.then((result) => settle(draft, result.ok), () => settle(draft, false));
      notify();
      return true;
    },
    retry: () => {
      if (!canRetry()) return;
      const draft = state.draft;
      if (draft === null) return;
      state.exportFailed = false;
      const ownFailure = draft.settledFailure;
      draft.retryActive = true;
      draft.settledFailure = false;
      draft.everFailed = true;
      let attempt: Promise<PrefMutationResult<unknown>>;
      try {
        attempt = state.binding.retry();
      } catch {
        attempt = refusal();
      }
      if (ownFailure) void attempt.then((result) => settle(draft, result.ok), () => settle(draft, false));
      else void attempt.then((result) => settlePredecessor(draft, result.ok), () => settlePredecessor(draft, false));
      notify();
    },
    discard: () => {
      if (!state.alive || !detach()) return;
      state.exportFailed = false;
      notify();
    },
    reload: () => {
      // Refused at invocation time while an actual draft exists.
      if (!state.alive || state.draft !== null) return;
      state.exportFailed = false;
      // A source repair rereads; it never claims a save by itself.
      try {
        state.binding.meta.reload();
      } catch {
        /* the source stays as it is */
      }
      notify();
    },
    exportDraft: () => {
      const draft = state.draft;
      const live = (): boolean => state.alive && state.draft !== null;
      if (!live() || draft === null || !isRailOrder(draft.value)) return;
      // Memory only: the captured, strictly validated draft; never a Storage call.
      const envelope = {
        version: 1,
        kind: "rail-order-draft",
        changes: { device: { railOrder: { operation: "set", value: [...draft.value] } } },
      };
      const before = state.exportFailed;
      let failed = false;
      let url: string | null = null;
      let anchor: HTMLAnchorElement | null = null;
      try {
        const blob = new Blob([JSON.stringify(envelope)], { type: "application/json" });
        if (!live()) return;
        url = URL.createObjectURL(blob);
        if (!live()) return;
        anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "rail-order-draft.json";
        anchor.style.display = "none";
        document.body.appendChild(anchor);
        if (!live()) return;
        anchor.click();
      } catch {
        failed = true;
      } finally {
        try { anchor?.remove(); } catch { /* cleanup never changes recovery */ }
        try { if (url !== null) URL.revokeObjectURL(url); } catch { /* cleanup never changes recovery */ }
      }
      if (!state.alive) return;
      state.exportFailed = failed;
      if (failed !== before) notify();
    },
    confirmSignOut: async () => {
      if (!state.alive || state.draft === null) return true;
      let proceed = false;
      try {
        proceed = window.confirm(railOrderCopy(state.lang).confirmSignOut) === true;
      } catch {
        proceed = false;
      }
      if (!proceed) return false;
      // OK discards the draft with zero set or remove attempts; late completions are ignored.
      detach();
      state.exportFailed = false;
      notify();
      return true;
    },
  };
}

/**
 * Creates the rail-order controller. Call it once per owner: App calls it once
 * inside `AccountStorageGate`; an `<AppRail>` without a provider owns its own.
 */
export function useRailOrderController({ lang }: RailOrderControllerOptions): RailOrderController {
  // One strict binding; the hook order never changes.
  const binding = usePrefAutosaveAsync("xai_rail_order", RAIL_ORDER_BINDING) as unknown as Binding;

  const [, setVersion] = React.useState(0);
  const [{ state, operations }] = React.useState(() => {
    const initial: ControllerState = { binding, lang, alive: true, draft: null, exportFailed: false };
    return { state: initial, operations: createOperations(initial, () => setVersion((version) => version + 1)) };
  });
  state.binding = binding;
  state.lang = lang;

  const draft = state.draft;
  const meta = binding.meta;
  const failedNow = draft !== null
    && !draft.retryActive
    && (draft.settledFailure || (meta !== draft.admittedMeta && (meta.status === "error" || meta.status === "conflict")));
  // A latest draft held behind a failed predecessor counts as settled unsuccessful (A8).
  if (draft !== null && failedNow) draft.everFailed = true;
  const hasDraft = draft !== null;
  let statusKind: RailOrderStatusKind | null = null;
  if (draft !== null) {
    if (draft.everFailed) statusKind = failedNow ? "failed" : "saving";
  } else if (meta.source === "invalid" || meta.source === "unavailable") {
    statusKind = "source";
  }

  // Unmount detaches the draft, callbacks and late completions; committed writes stay.
  React.useLayoutEffect(() => {
    state.alive = true;
    return () => {
      state.alive = false;
      state.draft = null;
      state.exportFailed = false;
    };
  }, [state]);

  // A cancelable warning while a draft exists (not crash durability); never a Storage call.
  React.useEffect(() => {
    if (!hasDraft) return undefined;
    const warn = (event: BeforeUnloadEvent): void => {
      if (!state.alive || state.draft === null) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasDraft, state]);

  return {
    lang,
    order: operations.currentOrder(),
    hasDraft,
    statusKind,
    canRetry: operations.canRetry(),
    exportFailed: state.exportFailed && hasDraft,
    drop: operations.drop,
    retry: operations.retry,
    discard: operations.discard,
    reload: operations.reload,
    exportDraft: operations.exportDraft,
    confirmSignOut: operations.confirmSignOut,
  };
}

// ---- Provider -------------------------------------------------------------------

/** The App-scoped controller, provided to AppRail and the Topbar status. */
export const RailOrderControllerContext = React.createContext<RailOrderController | null>(null);

/** Provides an existing controller (created once by the host) to its subtree. */
export function RailOrderProvider({ controller, children }: RailOrderProviderProps): React.ReactElement {
  return <RailOrderControllerContext.Provider value={controller}>{children}</RailOrderControllerContext.Provider>;
}
