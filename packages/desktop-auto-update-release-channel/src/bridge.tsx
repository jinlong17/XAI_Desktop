import { useEffect, useState, type PropsWithChildren, type ReactElement } from "react";
import type { DesktopUpdaterSnapshot } from "./types";
import {
  bindDesktopUpdaterAdapter,
  checkDesktopForUpdates,
  getDesktopUpdaterSnapshot,
  refreshDesktopUpdaterSnapshot,
  subscribeDesktopUpdaterSnapshot,
} from "./runtime";

export function useDesktopUpdaterSnapshot(): DesktopUpdaterSnapshot {
  const [snapshot, setSnapshot] = useState<DesktopUpdaterSnapshot>(
    getDesktopUpdaterSnapshot(),
  );

  useEffect(() => {
    const unsubscribe = subscribeDesktopUpdaterSnapshot(setSnapshot);
    return unsubscribe;
  }, []);

  return snapshot;
}

export function useDesktopUpdaterActions(): {
  refresh: () => Promise<DesktopUpdaterSnapshot>;
  check: () => Promise<DesktopUpdaterSnapshot>;
} {
  return {
    refresh: refreshDesktopUpdaterSnapshot,
    check: checkDesktopForUpdates,
  };
}

export function DesktopAutoUpdateReleaseChannelBridge({
  children,
}: PropsWithChildren): ReactElement {
  useEffect(() => {
    void refreshDesktopUpdaterSnapshot();
    const unsubscribe = bindDesktopUpdaterAdapter();
    return unsubscribe;
  }, []);

  return <>{children}</>;
}
