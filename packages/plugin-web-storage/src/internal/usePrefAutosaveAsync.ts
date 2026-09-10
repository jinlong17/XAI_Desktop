import { useCallback, useState } from "react";
import { accountScope } from "./accountScope.js";
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
  const binding = `${String(key)}:${accountScope.capture().epoch}`;
  const [draft, setDraft] = useState({ binding, value });
  const edit = useCallback(async (next: WebPrefValue<K>) => {
    setDraft({ binding, value: next });
    return setValue(next);
  }, [binding, setValue]);
  const localDraft = draft.binding === binding ? draft.value : value;
  return { value: meta.pending || meta.status === "error" || meta.status === "conflict" ? localDraft : value, edit, retry: meta.retry, reset: meta.reset, meta };
}
