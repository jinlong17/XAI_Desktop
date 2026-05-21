import { createContext, useContext, type ReactNode } from "react";
import type { AiCubeControlBridge } from "./types";

const AiCubeControlBridgeContext = createContext<AiCubeControlBridge | undefined>(undefined);

export function assertAiCubeControlBridge(
  value: AiCubeControlBridge | undefined,
): AiCubeControlBridge {
  if (!value) {
    throw new Error("useAiCubeControlBridge must be used within AiCubeControlProvider");
  }

  return value;
}

export function AiCubeControlProvider({
  value,
  children,
}: {
  value: AiCubeControlBridge;
  children: ReactNode;
}) {
  return (
    <AiCubeControlBridgeContext.Provider value={value}>
      {children}
    </AiCubeControlBridgeContext.Provider>
  );
}

export function useAiCubeControlBridge(): AiCubeControlBridge {
  return assertAiCubeControlBridge(useContext(AiCubeControlBridgeContext));
}
