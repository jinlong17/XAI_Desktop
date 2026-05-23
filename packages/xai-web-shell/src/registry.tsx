/**
 * WebShellProvider + useWebShell + useWebModuleRegistry
 *
 * Slot/registry pattern — host populates modules array at <WebShellProvider>;
 * child components read context via hooks.
 *
 * API contract: packages/xai-web-shell/docs/api.md §1.2 + §1.3
 */

import { createContext, useContext, useMemo } from "react";
import type { WebModuleSlotRegistration, WebShellProviderProps } from "./types.js";
import type { Lang, RailPos } from "./types.js";

// ---- Context shape ---------------------------------------------------------

interface WebShellContextValue {
  lang: Lang;
  railPos: RailPos;
  petOn: boolean;
  setPetOn: (next: boolean) => void;
  modules: WebModuleSlotRegistration[];
}

const WebShellContext = createContext<WebShellContextValue | null>(null);

// ---- WebShellProvider ------------------------------------------------------

export function WebShellProvider({
  modules,
  lang,
  railPos,
  petOn,
  setPetOn,
  children,
}: WebShellProviderProps) {
  const value = useMemo<WebShellContextValue>(
    () => ({ lang, railPos, petOn, setPetOn, modules }),
    [lang, railPos, petOn, setPetOn, modules],
  );

  return (
    <WebShellContext.Provider value={value}>
      {children}
    </WebShellContext.Provider>
  );
}

// ---- useWebShell -----------------------------------------------------------

/**
 * Returns the active shell context (lang, railPos, petOn, setPetOn).
 * Throws outside <WebShellProvider>.
 */
export function useWebShell(): {
  lang: Lang;
  railPos: RailPos;
  petOn: boolean;
  setPetOn: (next: boolean) => void;
} {
  const ctx = useContext(WebShellContext);
  if (ctx === null) {
    throw new TypeError(
      "[xai-web-shell] useWebShell must be inside <WebShellProvider>",
    );
  }
  return { lang: ctx.lang, railPos: ctx.railPos, petOn: ctx.petOn, setPetOn: ctx.setPetOn };
}

// ---- useWebModuleRegistry --------------------------------------------------

/**
 * Returns the sorted, rail-visible module list.
 * - Filters by showInRail === true.
 * - Sorts by railOrder ascending (ties by id alphabetical).
 * - Referentially stable across renders unless modules changes.
 */
export function useWebModuleRegistry(): readonly WebModuleSlotRegistration[] {
  const ctx = useContext(WebShellContext);
  if (ctx === null) {
    throw new TypeError(
      "[xai-web-shell] useWebModuleRegistry must be inside <WebShellProvider>",
    );
  }

  return useMemo(() => {
    const visible = ctx.modules.filter((m) => {
      // Safe default: showInRail defaults to true if field is missing
      return (m as Partial<WebModuleSlotRegistration>).showInRail !== false;
    });
    return [...visible].sort((a, b) => {
      const ao = (a as Partial<WebModuleSlotRegistration>).railOrder ?? Number.MAX_SAFE_INTEGER;
      const bo = (b as Partial<WebModuleSlotRegistration>).railOrder ?? Number.MAX_SAFE_INTEGER;
      if (ao !== bo) return ao - bo;
      return a.moduleId.localeCompare(b.moduleId);
    });
  }, [ctx.modules]);
}
