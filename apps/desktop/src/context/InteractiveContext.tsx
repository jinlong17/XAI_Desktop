import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface InteractiveContextValue {
  isHoveringInteractive: boolean;
  setHoveringInteractive: (hovering: boolean) => void;
}

const InteractiveContext = createContext<InteractiveContextValue | undefined>(undefined);

export function InteractiveProvider({ children }: { children: ReactNode }) {
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);

  const setHoveringInteractive = useCallback((hovering: boolean) => {
    setIsHoveringInteractive(hovering);
  }, []);

  return (
    <InteractiveContext.Provider value={{ isHoveringInteractive, setHoveringInteractive }}>
      {children}
    </InteractiveContext.Provider>
  );
}

export function useInteractive() {
  const ctx = useContext(InteractiveContext);
  if (!ctx) {
    throw new Error("useInteractive must be used within InteractiveProvider");
  }
  return ctx;
}

/**
 * Hook to create mouse enter/leave handlers for interactive elements.
 * When mouse enters, setIgnoreCursorEvents(false) allows the window to receive events.
 */
export function useInteractiveHandlers() {
  const { setHoveringInteractive } = useInteractive();

  const onMouseEnter = useCallback(() => {
    setHoveringInteractive(true);
  }, [setHoveringInteractive]);

  const onMouseLeave = useCallback(() => {
    setHoveringInteractive(false);
  }, [setHoveringInteractive]);

  return { onMouseEnter, onMouseLeave };
}
