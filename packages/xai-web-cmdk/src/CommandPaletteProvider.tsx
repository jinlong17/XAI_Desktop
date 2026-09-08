/**
 * CommandPaletteProvider — Context provider for the command palette state.
 *
 * Mounted once at app shell level (wraps <Shell/> in apps/web/src/App.tsx).
 * Exposes state via useCommandPalette() hook.
 *
 * design.md §Component graph
 * api.md §1.6
 */

import { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { UseCommandPalette, CommandPaletteProviderProps } from "./types.js";

// ---- Context ---------------------------------------------------------------

const CommandPaletteContext = createContext<UseCommandPalette | null>(null);

// ---- Provider --------------------------------------------------------------

export function CommandPaletteProvider({ children }: CommandPaletteProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const open = useCallback((opts?: { source?: "shortcut" | "topbar-click" | "programmatic" }) => {
    // Open is idempotent when already open (api.md §13)
    if (isOpen) return;
    void opts; // opts is used by CommandPalette internally to emit the event
    setIsOpen(true);
    setQuery(""); // reset query on each open
  }, [isOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
  }, []);

  const value = useMemo<UseCommandPalette>(
    () => ({ open, close, isOpen, query, setQuery }),
    [open, close, isOpen, query],
  );

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
    </CommandPaletteContext.Provider>
  );
}

// ---- Hook ------------------------------------------------------------------

/**
 * Returns the current command palette context value.
 * Must be called from a descendant of <CommandPaletteProvider/>.
 *
 * api.md §4
 */
export function useCommandPaletteContext(): UseCommandPalette {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) {
    throw new Error("useCommandPalette must be used within <CommandPaletteProvider>");
  }
  return ctx;
}
