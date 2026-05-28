import {
  isDesktopPhase1OfflineRuntime,
  resolveWebRuntimeProfile,
} from "@repo/core";
import { Navigate } from "react-router";

export function LandingPage() {
  const runtimeProfile = resolveWebRuntimeProfile(
    import.meta.env as Record<string, string | undefined>,
  );

  if (isDesktopPhase1OfflineRuntime(runtimeProfile)) {
    return <Navigate to="/app" replace />;
  }

  return (
    <main className="host-page">
      <h1>XAI Web Host</h1>
      <p>Public landing shell placeholder.</p>
    </main>
  );
}
