import { useCallback, useRef, useState } from "react";
import { accountScope, usePref } from "@repo/plugin-web-storage";

/** A failed toggle keeps its exact desired value; retry never toggles twice. */
export function useChatPreference(key: "xai_ai_insights" | "xai_ai_voice") {
  const [value, write] = usePref(key);
  const [scope] = useState(() => accountScope.capture());
  const [baseline] = useState(() => { try { return localStorage.getItem(key); } catch { return undefined; } });
  const observed = useRef(baseline);
  const pending = useRef<{ value: boolean; baseline: string | null } | null>(null);
  const [error, setError] = useState(false);
  const retry = useCallback(() => {
    if (!pending.current) return true;
    try {
      accountScope.assertCurrent(scope);
      if (localStorage.getItem(key) !== pending.current.baseline || !write(pending.current.value)) {
        setError(true); return false;
      }
      observed.current = String(pending.current.value);
      pending.current = null; setError(false); return true;
    } catch { setError(true); return false; }
  }, [key, scope, write]);
  const toggle = useCallback(() => {
    try {
      accountScope.assertCurrent(scope);
      if (observed.current === undefined) { setError(true); return; }
      if (!pending.current) pending.current = { value: !value, baseline: observed.current };
      retry();
    } catch { setError(true); }
  }, [scope, value, retry]);
  const discard = () => {
    try { accountScope.assertCurrent(scope); observed.current = localStorage.getItem(key); pending.current = null; setError(false); }
    catch { setError(true); }
  };
  return { value, toggle, retry, error, pending, discard };
}
