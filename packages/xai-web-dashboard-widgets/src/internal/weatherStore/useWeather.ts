/**
 * @internal — React hook bridging the pure Weather store API to usePref.
 *
 * SINGLETON: stores ONE UserWeather | null under "xai_dashboard_weather".
 *
 * Pattern mirrors useStickies.ts (§E) scaled down to a singleton:
 *   - wraps usePref("xai_dashboard_weather")
 *   - narrows the registry unknown → UserWeather | null via getWeather
 *   - set/clear persist via setPref; stable identities via useCallback
 *   - Cross-tab fan-out transitive via usePref's storage listener
 *
 * Design: packages/xai-web-dashboard-widgets/docs/design.md §G
 * API:    packages/xai-web-dashboard-widgets/docs/api.md §G.3.3
 */

import { useCallback } from "react";
import { usePref } from "@repo/plugin-web-storage";
import type { UserWeather, NewWeatherDraft } from "./types.js";
import { getWeather, setWeather, clearWeather } from "./weatherStore.js";

export interface UseWeatherApi {
  /** Live snapshot, reactive via usePref. Null when unset. */
  weather: UserWeather | null;
  /** Persist a new singleton entry. Overwrites any prior value. */
  set: (draft: NewWeatherDraft) => void;
  /** Persist null (unset — honest empty state). */
  clear: () => void;
}

/**
 * Bridge between the pure weatherStore helpers and React state.
 *
 * Persistence key: "xai_dashboard_weather" (codec "json", default null).
 */
export function useWeather(): UseWeatherApi {
  // The registry default for xai_dashboard_weather is null;
  // cast through getWeather at the single point of truth (same pattern as useStickies).
  const [rawStore, setRawStore] = usePref("xai_dashboard_weather");
  const weather = getWeather(rawStore);

  const set = useCallback(
    (draft: NewWeatherDraft) => {
      const snapshot = setWeather(draft);
      setRawStore(snapshot as unknown as null); // registry types as null (default); cast is safe
    },
    [setRawStore],
  );

  const clear = useCallback(() => {
    setRawStore(clearWeather());
  }, [setRawStore]);

  return { weather, set, clear };
}
