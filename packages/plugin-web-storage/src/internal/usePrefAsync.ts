import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { decode, encode } from "./codec.js";
import { accountScope, type AccountScope } from "./accountScope.js";
import { PREF_REGISTRY, type PrefCodec, type WebPrefKey, type WebPrefValue } from "./registry.js";
import { mutatePref, type PrefMutationReason, type PrefMutationResult, type PrefSource } from "./prefMutation.js";
import { subscribeSameTab } from "./sameTabBus.js";

export type PrefAsyncStatus = "idle" | "dirty" | "pending" | "saved" | "error" | "conflict";
export interface PrefAsyncMeta<T> {
  readonly status: PrefAsyncStatus;
  readonly source: PrefSource;
  readonly raw: string | null;
  readonly error: string | null;
  readonly pending: boolean;
  readonly retry: () => Promise<PrefMutationResult<T>>;
  readonly reset: () => Promise<PrefMutationResult<T>>;
  readonly reload: () => void;
}

export interface UsePrefAsyncOptions<T> { readonly validate?: (value: unknown) => value is T; }
export interface PrefAsyncBinding<T> {
  readonly key: string;
  readonly codec: PrefCodec;
  readonly defaultValue: T;
  readonly validate: (value: unknown) => value is T;
}

type Setter<T> = T | ((current: T) => T);
type Request<T> = {
  kind: "set" | "reset";
  next?: Setter<T>;
  reconcileToken?: string;
  sequence: number;
  resolves: Array<(result: PrefMutationResult<T>) => void>;
};
type View<T> = {
  binding: string;
  value: T;
  raw: string | null;
  source: PrefSource;
  status: PrefAsyncStatus;
  error: string | null;
};
type Controller<T> = View<T> & {
  scope: AccountScope;
  disposed: boolean;
  running: boolean;
  sequence: number;
  visualSequence: number;
  queue: Request<T>[];
  failed: Request<T> | null;
  activePromise: Promise<PrefMutationResult<T>> | null;
  observedRaw: string | null | undefined;
};

function readSnapshot<T>(key: string, codec: Parameters<typeof decode>[0], fallback: T, validate: (value: unknown) => value is T, scope: AccountScope): Omit<View<T>, "binding" | "status" | "error"> {
  try {
    const raw = localStorage.getItem(accountScope.physicalKey(key, scope));
    if (raw === null) return { value: fallback, raw, source: "absent" };
    const value = decode(codec, raw);
    return value !== null && validate(value) ? { value, raw, source: "valid" } : { value: fallback, raw, source: "invalid" };
  } catch { return { value: fallback, raw: null, source: "unavailable" }; }
}

function initialView<T>(binding: string, source: Omit<View<T>, "binding" | "status" | "error">): View<T> {
  const healthy = source.source === "valid" || source.source === "absent";
  return { binding, ...source, status: healthy ? "idle" : "error", error: healthy ? null : source.source };
}

function controllerFrom<T>(view: View<T>, scope: AccountScope): Controller<T> {
  return { ...view, scope, disposed: false, running: false, sequence: 0, visualSequence: 0, queue: [], failed: null, activePromise: null, observedRaw: undefined };
}

export function prefCodecValidator<T>(codec: Parameters<typeof decode>[0]): (value: unknown) => value is T {
  return (value: unknown): value is T => {
    if (codec === "string") return typeof value === "string";
    try {
      const encoded = encode(codec, value);
      return encoded !== null && decode(codec, encoded) !== null;
    } catch { return false; }
  };
}

function refusal<T>(reason: PrefMutationReason): PrefMutationResult<T> {
  return { ok: false, reason };
}

/** Shared registered/open-ended implementation. Callers must resolve the binding first. */
export function usePrefAsyncBinding<T>({ key, codec, defaultValue, validate }: PrefAsyncBinding<T>): readonly [T, (next: Setter<T>) => Promise<PrefMutationResult<T>>, PrefAsyncMeta<T>] {
  const validateRef = useRef(validate);
  validateRef.current = validate;
  const scope = useSyncExternalStore(accountScope.subscribe, accountScope.capture, accountScope.capture);
  const encodedDefault = encode(codec, defaultValue);
  const binding = JSON.stringify([key, codec, encodedDefault, scope.epoch]);
  const fresh = useMemo(
    () => initialView(binding, readSnapshot(key, codec, defaultValue, validateRef.current, scope)),
    [binding, codec, key, scope],
  );
  const controllerRef = useRef<Controller<T> | null>(null);
  if (controllerRef.current === null) controllerRef.current = controllerFrom(fresh, scope);
  const [view, setView] = useState<View<T>>(fresh);
  const [subscriptionVersion, setSubscriptionVersion] = useState(0);
  const visible = view.binding === binding ? view : fresh;

  const update = useCallback((controller: Controller<T>, patch: Partial<View<T>>) => {
    Object.assign(controller, patch);
    if (!controller.disposed && controllerRef.current === controller) {
      setView({ binding: controller.binding, value: controller.value, raw: controller.raw, source: controller.source, status: controller.status, error: controller.error });
    }
  }, []);

  const settleQueued = useCallback((controller: Controller<T>, result: PrefMutationResult<T>) => {
    for (const request of controller.queue.splice(0)) for (const resolve of request.resolves) resolve(result);
  }, []);

  const dispose = useCallback((controller: Controller<T>) => {
    if (controller.disposed) return;
    controller.disposed = true;
    controller.failed = null;
    settleQueued(controller, refusal("account-changed"));
  }, [settleQueued]);

  useLayoutEffect(() => {
    const current = controllerRef.current;
    if (!current || current.binding !== binding || current.disposed) {
      if (current) dispose(current);
      const next = controllerFrom(fresh, scope);
      controllerRef.current = next;
      setView(fresh);
    }
    const bound = controllerRef.current;
    return () => { if (bound) dispose(bound); };
  }, [binding, dispose, fresh, scope]);

  const project = useCallback((controller: Controller<T>) => {
    if (controller.disposed || controllerRef.current !== controller) return;
    const next = readSnapshot(key, codec, defaultValue, validateRef.current, controller.scope);
    if (controller.running || controller.queue.length > 0) {
      controller.observedRaw = next.raw;
      return;
    }
    if (controller.status === "dirty" || controller.status === "error" || controller.status === "conflict") {
      update(controller, { status: "conflict", error: "conflict" });
      return;
    }
    update(controller, { ...next, status: next.source === "valid" || next.source === "absent" ? "idle" : "error", error: next.source === "valid" || next.source === "absent" ? null : next.source });
  }, [codec, defaultValue, key, update]);

  useEffect(() => {
    const controller = controllerRef.current;
    if (!controller || controller.binding !== binding || controller.disposed) return;
    const unsubscribe = subscribeSameTab(key, () => project(controller), controller.scope);
    let physicalKey: string | null = null;
    try { physicalKey = accountScope.physicalKey(key, controller.scope); } catch { /* invalid binding stays inert */ }
    const onStorage = (event: StorageEvent) => {
      if (event.storageArea === localStorage && (event.key === physicalKey || event.key === null)) project(controller);
    };
    window.addEventListener("storage", onStorage);
    return () => { unsubscribe(); window.removeEventListener("storage", onStorage); };
  }, [binding, key, project, subscriptionVersion]);

  const run = useCallback((controller: Controller<T>) => {
    if (controller.disposed || controller.running || controller.failed || controller.queue.length === 0) return;
    const request = controller.queue.shift()!;
    controller.running = true;
    const liveValidate = (value: unknown): value is T => !controller.disposed
      && controllerRef.current === controller
      && accountScope.capture() === controller.scope
      && validateRef.current(value);
    const expectedRaw = request.kind === "reset" || typeof request.next !== "function" ? controller.raw : undefined;
    const attempt = mutatePref<T>({
      key,
      codec,
      defaultValue,
      validate: liveValidate,
      ...(request.kind === "reset" ? { reset: true } : { next: request.next }),
      ...(expectedRaw !== undefined ? { expectedRaw } : {}),
      ...(request.reconcileToken ? { reconcileToken: request.reconcileToken } : {}),
      scope: controller.scope,
    }).catch(() => refusal<T>("storage"));
    controller.activePromise = attempt;
    void attempt.then((result) => {
      controller.running = false;
      controller.activePromise = null;
      for (const resolve of request.resolves) resolve(result);
      if (controller.disposed || controllerRef.current !== controller) return;

      if (!result.ok) {
        request.reconcileToken = result.retryToken;
        controller.failed = request;
        update(controller, { status: result.reason === "conflict" ? "conflict" : "error", error: result.reason });
        return;
      }

      controller.failed = null;
      controller.raw = result.raw;
      controller.source = result.source;
      const observedConflict = controller.observedRaw !== undefined && controller.observedRaw !== result.raw;
      controller.observedRaw = undefined;
      if (observedConflict) {
        controller.failed = controller.queue.at(-1) ?? request;
        update(controller, { status: "conflict", error: "conflict" });
        return;
      }
      if (controller.queue.length > 0) {
        update(controller, { status: "pending", error: null });
        queueMicrotask(() => run(controller));
        return;
      }
      if (request.sequence >= controller.visualSequence) controller.visualSequence = request.sequence;
      update(controller, { value: result.value, raw: result.raw, source: result.source, status: "saved", error: null });
    });
  }, [codec, defaultValue, key, update]);

  const enqueue = useCallback((controller: Controller<T>, request: Omit<Request<T>, "resolves">): Promise<PrefMutationResult<T>> => {
    if (controller.disposed || controllerRef.current !== controller || accountScope.capture() !== controller.scope) return Promise.resolve(refusal("account-changed"));
    controller.failed = null;
    return new Promise((resolve) => {
      const tail = controller.queue.at(-1);
      if (request.kind === "set" && typeof request.next !== "function" && tail?.kind === "set" && typeof tail.next !== "function") {
        tail.next = request.next;
        tail.sequence = request.sequence;
        tail.resolves.push(resolve);
      } else {
        controller.queue.push({ ...request, resolves: [resolve] });
      }
      run(controller);
    });
  }, [run]);

  const perform = useCallback((next: Setter<T>): Promise<PrefMutationResult<T>> => {
    const controller = controllerRef.current;
    if (!controller || controller.binding !== binding || controller.disposed) return Promise.resolve(refusal("account-changed"));
    const sequence = ++controller.sequence;
    if (typeof next !== "function") {
      if (!validateRef.current(next)) {
        update(controller, { status: "error", error: "invalid" });
        return Promise.resolve(refusal("invalid"));
      }
      controller.visualSequence = sequence;
      update(controller, { value: next, status: "pending", error: null });
    } else {
      update(controller, { status: "pending", error: null });
    }
    return enqueue(controller, { kind: "set", next, sequence });
  }, [binding, enqueue, update]);

  const retry = useCallback((): Promise<PrefMutationResult<T>> => {
    const controller = controllerRef.current;
    if (!controller || controller.binding !== binding || controller.disposed) return Promise.resolve(refusal("account-changed"));
    if (controller.activePromise) return controller.activePromise;
    const failed = controller.failed;
    if (failed) {
      controller.failed = null;
      const retryRequest = { kind: failed.kind, next: failed.next, reconcileToken: failed.reconcileToken, sequence: ++controller.sequence } as Omit<Request<T>, "resolves">;
      update(controller, { status: "pending", error: null });
      controller.queue.unshift({ ...retryRequest, resolves: [] });
      run(controller);
      return controller.activePromise ?? Promise.resolve(refusal("storage"));
    }
    return perform(controller.value);
  }, [binding, perform, run, update]);

  const reset = useCallback((): Promise<PrefMutationResult<T>> => {
    const controller = controllerRef.current;
    if (!controller || controller.binding !== binding || controller.disposed) return Promise.resolve(refusal("account-changed"));
    settleQueued(controller, refusal("conflict"));
    controller.failed = null;
    const sequence = ++controller.sequence;
    update(controller, { status: "pending", error: null });
    return enqueue(controller, { kind: "reset", sequence });
  }, [binding, enqueue, settleQueued, update]);

  const reload = useCallback(() => {
    const current = controllerRef.current;
    if (!current || current.binding !== binding) return;
    dispose(current);
    const nextView = initialView(binding, readSnapshot(key, codec, defaultValue, validateRef.current, scope));
    const next = controllerFrom(nextView, scope);
    controllerRef.current = next;
    setView(nextView);
    setSubscriptionVersion(version => version + 1);
  }, [binding, codec, defaultValue, dispose, key, scope]);

  return [visible.value, perform, { status: visible.status, source: visible.source, raw: visible.raw, error: visible.error, pending: visible.status === "pending", retry, reset, reload }] as const;
}

/** Explicit registered async hook: old usePref keeps its synchronous tuple contract. */
export function usePrefAsync<K extends WebPrefKey>(key: K, options?: UsePrefAsyncOptions<WebPrefValue<K>>): readonly [WebPrefValue<K>, (next: Setter<WebPrefValue<K>>) => Promise<PrefMutationResult<WebPrefValue<K>>>, PrefAsyncMeta<WebPrefValue<K>>] {
  type T = WebPrefValue<K>;
  const entry = PREF_REGISTRY[key];
  const defaultValidate = useMemo(() => prefCodecValidator<T>(entry.codec), [entry.codec]);
  return usePrefAsyncBinding({
    key,
    codec: entry.codec,
    defaultValue: entry.default as T,
    validate: options?.validate ?? defaultValidate,
  });
}
