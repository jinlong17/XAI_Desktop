import { useCallback, useState } from "react";
import type { WebPrefKey, WebPrefValue } from "./registry.js";
import { usePrefAsync, type PrefAsyncMeta } from "./usePrefAsync.js";
import type { PrefMutationResult } from "./prefMutation.js";

/** Explicit draft-owning async variant; the legacy autosave hook remains write-only. */
export function usePrefAutosaveAsync<K extends WebPrefKey>(key: K, options?: { validate?: (value: unknown) => value is WebPrefValue<K> }): {
  readonly value: WebPrefValue<K>;
  readonly edit: (value: WebPrefValue<K>) => Promise<PrefMutationResult<WebPrefValue<K>>>;
  readonly retry: () => Promise<PrefMutationResult<WebPrefValue<K>>>;
  readonly reset: () => Promise<PrefMutationResult<WebPrefValue<K>>>;
  readonly meta: PrefAsyncMeta<WebPrefValue<K>>;
} {
  const [value, setValue, meta] = usePrefAsync(key, options);
  const [draft, setDraft] = useState(value);
  const edit = useCallback(async (next: WebPrefValue<K>) => {
    setDraft(next);
    return setValue(next);
  }, [setValue]);
  return { value: meta.pending || meta.status === "error" || meta.status === "conflict" ? draft : value, edit, retry: meta.retry, reset: meta.reset, meta };
}
