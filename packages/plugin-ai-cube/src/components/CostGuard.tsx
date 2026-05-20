"use client";

import type { CostGuardApi } from "../hooks/useCostGuard";

export function CostGuard({ guard }: { guard: CostGuardApi }) {
  return (
    <section style={{ display: "grid", gap: 6, padding: 10, background: "#f8fafc", borderRadius: 8 }}>
      <strong>Cost guard</strong>
      <span>
        {guard.usedToday}/{guard.dailyLimit} mock calls today
      </span>
      <label>
        Daily limit
        <input type="number" min={1} value={guard.dailyLimit} onChange={(event) => guard.setDailyLimit(Number(event.target.value))} />
      </label>
      <label>
        <input type="checkbox" checked={guard.offline} onChange={(event) => guard.setOffline(event.target.checked)} /> Offline fallback
      </label>
    </section>
  );
}
