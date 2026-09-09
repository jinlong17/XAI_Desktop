import { useEffect, useState } from "react";
import { localDateKey, nextLocalDayStart } from "./localDate.js";

/** Resample on midnight, resume and periodic system clock/time-zone calibration. */
export function useLocalDayClock(): { now: Date; dayKey: string } {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const refresh = () => {
      clearTimeout(timer);
      const current = new Date();
      setNow(current);
      timer = setTimeout(refresh, Math.max(1, Math.min(60_000, nextLocalDayStart(current).getTime() - current.getTime())));
    };
    const onVisibility = () => { if (document.visibilityState === "visible") refresh(); };
    refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("pageshow", refresh);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pageshow", refresh);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
  return { now, dayKey: localDateKey(now) };
}
