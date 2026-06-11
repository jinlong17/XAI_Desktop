import { useEffect, useState, type PropsWithChildren, type ReactElement } from "react";
import type { DesktopQuickOpenSnapshot } from "./types";
import {
  bindDesktopQuickOpenAdapter,
  getDesktopQuickOpenSnapshot,
  refreshDesktopQuickOpenSnapshot,
  subscribeDesktopQuickOpenSnapshot,
} from "./runtime";

export function useDesktopQuickOpenSnapshot(): DesktopQuickOpenSnapshot {
  const [snapshot, setSnapshot] = useState<DesktopQuickOpenSnapshot>(
    getDesktopQuickOpenSnapshot(),
  );

  useEffect(() => {
    const unsubscribe = subscribeDesktopQuickOpenSnapshot(setSnapshot);
    return unsubscribe;
  }, []);

  return snapshot;
}

export function DesktopGlobalHotkeyQuickOpenBridge({
  children,
}: PropsWithChildren): ReactElement {
  useEffect(() => {
    void refreshDesktopQuickOpenSnapshot();
    const unsubscribe = bindDesktopQuickOpenAdapter();
    return unsubscribe;
  }, []);

  return <>{children}</>;
}
