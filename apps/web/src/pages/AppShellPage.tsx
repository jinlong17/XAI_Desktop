import { useState } from "react";
import { useDeviceBoundFetch, useWebAuthSession } from "@repo/web-auth-device-session";

export interface AppShellPageProps {
  path: string;
}

export function AppShellPage({ path }: AppShellPageProps) {
  const { state, deviceId } = useWebAuthSession();
  const deviceFetch = useDeviceBoundFetch();
  const [probeResult, setProbeResult] = useState<string>("idle");

  async function probeDeviceSession() {
    if (!deviceFetch) {
      setProbeResult("device_fetch_unavailable");
      return;
    }

    try {
      const response = await deviceFetch("/rest/v1/rpc/device_heartbeat", {
        method: "POST",
        body: JSON.stringify({ device_id: deviceId }),
        headers: {
          "Content-Type": "application/json"
        }
      });
      setProbeResult(`ok:${response.status}`);
    } catch (error: unknown) {
      setProbeResult(error instanceof Error ? error.message : "probe_failed");
    }
  }

  return (
    <main className="host-page">
      <h1>App Shell</h1>
      <p>Guarded app host placeholder for future module mounting.</p>
      <p>route: {path}</p>
      <p>session: {state}</p>
      <p>device: {deviceId ?? "pending"}</p>
      <button type="button" onClick={probeDeviceSession}>
        Probe device-bound request
      </button>
      <p>probe: {probeResult}</p>
    </main>
  );
}
