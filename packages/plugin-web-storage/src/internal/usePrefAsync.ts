import { useCallback, useEffect, useRef, useState } from "react";
import { decode } from "./codec.js";
import { accountScope, type AccountScope } from "./accountScope.js";
import { PREF_REGISTRY, type WebPrefKey, type WebPrefValue } from "./registry.js";
import { mutatePref, type PrefMutationResult, type PrefSource } from "./prefMutation.js";
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

function snapshot<T>(key: string, codec: Parameters<typeof decode>[0], fallback: T, validate: (value: unknown) => value is T, scope: AccountScope): { value: T; raw: string | null; source: PrefSource } {
  try {
    const raw = localStorage.getItem(accountScope.physicalKey(key, scope));
    if (raw === null) return { value: fallback, raw, source: "absent" };
    const value = decode(codec, raw);
    return value !== null && validate(value) ? { value, raw, source: "valid" } : { value: fallback, raw, source: "invalid" };
  } catch { return { value: fallback, raw: null, source: "unavailable" }; }
}

/** Explicit async hook: old usePref keeps its synchronous tuple contract. */
export function usePrefAsync<K extends WebPrefKey>(key: K, options?: UsePrefAsyncOptions<WebPrefValue<K>>): readonly [WebPrefValue<K>, (next: WebPrefValue<K> | ((current: WebPrefValue<K>) => WebPrefValue<K>)) => Promise<PrefMutationResult<WebPrefValue<K>>>, PrefAsyncMeta<WebPrefValue<K>>] {
  const entry = PREF_REGISTRY[key];
  const validate = options?.validate ?? ((value: unknown): value is WebPrefValue<K> => decode(entry.codec, encodeForValidation(entry.codec, value)) !== null);
  const scope = accountScope.capture();
  const initial = useRef(snapshot(key, entry.codec, entry.default as WebPrefValue<K>, validate, scope));
  const [value, setValue] = useState(initial.current.value);
  const [raw, setRaw] = useState<string | null>(initial.current.raw);
  const [source, setSource] = useState<PrefSource>(initial.current.source);
  const [status, setStatus] = useState<PrefAsyncStatus>(initial.current.source === "valid" || initial.current.source === "absent" ? "idle" : "error");
  const [error, setError] = useState<string | null>(initial.current.source === "valid" || initial.current.source === "absent" ? null : initial.current.source);
  const valueRef = useRef(value); valueRef.current = value;
  const baseRef = useRef(raw); baseRef.current = raw;
  const scopeRef = useRef(scope);
  const sequence = useRef(0);
  const last = useRef<WebPrefValue<K> | null>(null);
  const active = useRef(false);
  const queued = useRef<null | { next: WebPrefValue<K> | ((current: WebPrefValue<K>) => WebPrefValue<K>); resolve: (result: PrefMutationResult<WebPrefValue<K>>) => void }>(null);

  const reload = useCallback(() => {
    const next = snapshot(key, entry.codec, entry.default as WebPrefValue<K>, validate, scopeRef.current);
    setValue(next.value); valueRef.current = next.value; setRaw(next.raw); baseRef.current = next.raw; setSource(next.source);
    setStatus(next.source === "valid" || next.source === "absent" ? "idle" : "error"); setError(next.source === "valid" || next.source === "absent" ? null : next.source);
  }, [entry.codec, entry.default, key, validate]);

  useEffect(() => {
    // A new account/generation is a new binding. Old in-flight calls retain
    // their captured scope and are rejected by the engine rather than retargeted.
    scopeRef.current = scope;
    reload();
    return accountScope.subscribe(reload);
  }, [reload, scope]);
  useEffect(() => subscribeSameTab(key, () => {
    if (status === "dirty" || status === "pending") { setStatus("conflict"); setError("conflict"); return; }
    reload();
  }, scopeRef.current), [key, reload, status]);

  const perform = useCallback(async (next: WebPrefValue<K> | ((current: WebPrefValue<K>) => WebPrefValue<K>), expectedRaw = baseRef.current): Promise<PrefMutationResult<WebPrefValue<K>>> => {
    if (active.current) {
      const local = typeof next === "function" ? valueRef.current : next;
      if (!validate(local)) return { ok: false, reason: "invalid" };
      last.current = local; setValue(local); valueRef.current = local; setStatus("pending"); setError(null);
      return new Promise(resolve => { queued.current = { next, resolve }; });
    }
    active.current = true;
    const op = ++sequence.current;
    // A functional updater is deliberately evaluated only by mutatePref while
    // holding the physical-key lock; evaluating it here would be stale and can
    // run side effects twice.
    const local = typeof next === "function" ? valueRef.current : next;
    if (!validate(local)) { active.current = false; setStatus("error"); setError("invalid"); return { ok: false, reason: "invalid" } as PrefMutationResult<WebPrefValue<K>>; }
    last.current = local; setValue(local); valueRef.current = local; setStatus("pending"); setError(null);
    const capturedScope = scopeRef.current;
    const result = await mutatePref({ key, codec: entry.codec, defaultValue: entry.default as WebPrefValue<K>, validate, next: typeof next === "function" ? next : local, expectedRaw, scope: capturedScope });
    if (result.ok) { setRaw(result.raw); baseRef.current = result.raw; setSource(result.source); }
    const nextQueued = queued.current;
    queued.current = null;
    if (result.ok && nextQueued) {
      active.current = false;
      const later = await perform(nextQueued.next, result.raw);
      nextQueued.resolve(later);
      return result;
    }
    active.current = false;
    if (op === sequence.current && result.ok) { setValue(result.value); valueRef.current = result.value; setStatus("saved"); setError(null); }
    else if (op === sequence.current && !result.ok) { setStatus(result.reason === "conflict" ? "conflict" : "error"); setError(result.reason); }
    if (!result.ok && nextQueued) nextQueued.resolve(result);
    return result;
  }, [entry.codec, entry.default, key, validate]);

  const retry = useCallback(() => perform(last.current ?? valueRef.current, baseRef.current), [perform]);
  const reset = useCallback(async () => {
    const op = ++sequence.current; setStatus("pending"); setError(null);
    const capturedScope = scopeRef.current;
    const result = await mutatePref({ key, codec: entry.codec, defaultValue: entry.default as WebPrefValue<K>, validate, reset: true, expectedRaw: baseRef.current, scope: capturedScope });
    if (op === sequence.current && result.ok) { setValue(result.value); valueRef.current = result.value; setRaw(null); baseRef.current = null; setSource("absent"); setStatus("saved"); }
    else if (op === sequence.current && !result.ok) { setStatus(result.reason === "conflict" ? "conflict" : "error"); setError(result.reason); }
    return result;
  }, [entry.codec, entry.default, key, validate]);
  return [value, perform, { status, source, raw, error, pending: status === "pending", retry, reset, reload }] as const;
}

function encodeForValidation(codec: Parameters<typeof decode>[0], value: unknown): string {
  // The generic registered path validates codec shape only; callers with a domain
  // enum supply the stricter validator through UsePrefAsyncOptions.
  if (codec === "string") return typeof value === "string" ? value : "";
  return JSON.stringify(value);
}
