import { useCallback, useEffect, useState } from "react";
import type {
  CalendarProviderId,
  CalendarProviderStateEntity,
} from "@repo/core-data";
import {
  getDesktopLocalFirstCalendarProviderState,
  getDesktopLocalFirstCalendarProviderStateKey,
  patchDesktopLocalFirstCalendarProviderState,
  subscribeSameTab,
} from "./storage.js";

export function useDesktopLocalFirstCalendarProviderState(
  providerId: CalendarProviderId,
): readonly [
  state: CalendarProviderStateEntity | null,
  patch: (
    next: {
      connectionState?: CalendarProviderStateEntity["connectionState"];
      availability?: CalendarProviderStateEntity["availability"];
      lastAttemptAt?: string;
      lastSuccessAt?: string;
      lastFailureCode?: string;
      lastFailureMessage?: string;
      needsReconnectRefresh?: boolean;
    },
  ) => Promise<CalendarProviderStateEntity | null>,
] {
  const [state, setState] = useState<CalendarProviderStateEntity | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return getDesktopLocalFirstCalendarProviderState(providerId);
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    setState(getDesktopLocalFirstCalendarProviderState(providerId));
    const key = getDesktopLocalFirstCalendarProviderStateKey(providerId);
    return subscribeSameTab(key, (nextValue) => {
      if (!nextValue || typeof nextValue !== "object") {
        setState(null);
        return;
      }
      setState(nextValue as CalendarProviderStateEntity);
    });
  }, [providerId]);

  const patch = useCallback(
    async (
      next: {
        connectionState?: CalendarProviderStateEntity["connectionState"];
        availability?: CalendarProviderStateEntity["availability"];
        lastAttemptAt?: string;
        lastSuccessAt?: string;
        lastFailureCode?: string;
        lastFailureMessage?: string;
        needsReconnectRefresh?: boolean;
      },
    ): Promise<CalendarProviderStateEntity | null> => {
      const updated = await patchDesktopLocalFirstCalendarProviderState(
        providerId,
        next,
      );
      if (updated) {
        setState(updated);
      }
      return updated;
    },
    [providerId],
  );

  return [state, patch] as const;
}
