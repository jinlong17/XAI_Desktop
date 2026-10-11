import { useCallback } from "react";
import { ownershipForKey } from "./accountOwnership.js";
import { PREF_REGISTRY, type PrefCodec, type WebPrefKey, type WebPrefValue } from "./registry.js";
import { validatePrefCodecValue, validateRegisteredPrefValue, type PrefMutationResult } from "./prefMutation.js";
import { prefCodecValidator, usePrefAsyncBinding, type PrefAsyncBinding, type PrefAsyncMeta } from "./usePrefAsync.js";

export interface UsePrefAutosaveAsyncDynamicOptions<T> {
  readonly codec: PrefCodec;
  readonly defaultValue: T;
  readonly validate: (value: unknown) => value is T;
}

export interface PrefAutosaveAsyncResult<T> {
  readonly value: T;
  readonly edit: (value: T) => Promise<PrefMutationResult<T>>;
  readonly retry: () => Promise<PrefMutationResult<T>>;
  readonly reset: () => Promise<PrefMutationResult<T>>;
  readonly meta: PrefAsyncMeta<T>;
}

type RegisteredOptions<T> = { readonly validate?: (value: unknown) => value is T };

function isDynamicOptions<T>(options: RegisteredOptions<T> | UsePrefAutosaveAsyncDynamicOptions<T> | undefined): options is UsePrefAutosaveAsyncDynamicOptions<T> {
  return options !== undefined && ("codec" in options || "defaultValue" in options);
}

function validDefault<T>(key: string, options: UsePrefAutosaveAsyncDynamicOptions<T>): boolean {
  try {
    return options.validate(options.defaultValue)
      && validatePrefCodecValue(options.codec, options.defaultValue)
      && validateRegisteredPrefValue(key, options.defaultValue);
  } catch {
    return false;
  }
}

function composeValidator<T>(key: string, codec: PrefCodec, validate?: (value: unknown) => value is T): (value: unknown) => value is T {
  const boundary = prefCodecValidator<T>(codec, key);
  if (!validate) return boundary;
  return (value: unknown): value is T => {
    if (!boundary(value)) return false;
    try { return validate(value); } catch { return false; }
  };
}

/** Resolve and validate an autosave binding before any hook state is created. */
export function resolvePrefAutosaveAsyncBinding<T>(
  keyOrSuffix: string,
  options?: RegisteredOptions<T> | UsePrefAutosaveAsyncDynamicOptions<T>,
): PrefAsyncBinding<T> {
  const registered = PREF_REGISTRY[keyOrSuffix as WebPrefKey];
  if (registered && !isDynamicOptions(options)) {
    return {
      key: keyOrSuffix,
      codec: registered.codec,
      defaultValue: registered.default as T,
      validate: composeValidator(keyOrSuffix, registered.codec, options?.validate),
    };
  }

  if (!isDynamicOptions(options)
    || typeof keyOrSuffix !== "string"
    || keyOrSuffix.length === 0
    || keyOrSuffix.startsWith("xai_pref_")
    || keyOrSuffix.includes("/")
    || typeof options.validate !== "function") {
    throw new TypeError("Open-ended preference bindings require a suffix, codec, defaultValue, and validator");
  }
  if (options.codec !== "string" && options.codec !== "number" && options.codec !== "boolean" && options.codec !== "json") {
    throw new TypeError("Unsupported preference codec");
  }

  const key = `xai_pref_${keyOrSuffix}`;
  if (!/^xai_pref_[^/]+$/.test(key)) throw new TypeError("Invalid preference suffix");
  ownershipForKey(key);
  const generatedEntry = PREF_REGISTRY[key as WebPrefKey];
  if (generatedEntry && generatedEntry.codec !== options.codec) throw new TypeError("Registered preference codec mismatch");
  if (!validDefault(key, options)) throw new TypeError("Invalid preference defaultValue");
  return { key, codec: options.codec, defaultValue: options.defaultValue, validate: composeValidator(key, options.codec, options.validate) };
}

/** Explicit draft-owning async variant; the legacy autosave hook remains write-only. */
export function usePrefAutosaveAsync<K extends WebPrefKey>(key: K, options?: RegisteredOptions<WebPrefValue<K>>): PrefAutosaveAsyncResult<WebPrefValue<K>>;
export function usePrefAutosaveAsync<T>(suffix: string, options: UsePrefAutosaveAsyncDynamicOptions<T>): PrefAutosaveAsyncResult<T>;
export function usePrefAutosaveAsync<T>(
  keyOrSuffix: string,
  options?: RegisteredOptions<T> | UsePrefAutosaveAsyncDynamicOptions<T>,
): PrefAutosaveAsyncResult<T> {
  const resolved = resolvePrefAutosaveAsyncBinding(keyOrSuffix, options);
  const [value, setValue, meta] = usePrefAsyncBinding(resolved);
  const edit = useCallback((next: T) => setValue(next), [setValue]);
  return { value, edit, retry: meta.retry, reset: meta.reset, meta };
}
