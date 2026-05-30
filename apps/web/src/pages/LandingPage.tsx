import {
  isDesktopPhase1OfflineRuntime,
  resolveWebRuntimeProfile,
} from "@repo/core";
import { Navigate } from "react-router";

/**
 * Resolves whether the page is running with a pre-authenticated mock session
 * (VITE_WEB_AUTH_MODE=mock-authenticated). Used by LandingPage to bypass the
 * landing placeholder and jump straight to /app, matching the desktop Phase-1
 * requirement that the App opens directly in the main view without a login gate.
 *
 * This is orthogonal to the runtime profile: the offline profile check handled
 * the same redirect under the prior desktop-phase1-offline baseline; now that
 * the desktop uses web-live profile, the auth-mode check carries the redirect.
 */
function isMockAuthenticated(env: Record<string, string | undefined>): boolean {
  return env.VITE_WEB_AUTH_MODE === "mock-authenticated";
}

export function LandingPage() {
  const env = import.meta.env as Record<string, string | undefined>;
  const runtimeProfile = resolveWebRuntimeProfile(env);

  // Redirect to /app for desktop-phase1-offline profile (legacy path, kept for
  // future offline re-enablement) or for mock-authenticated mode (Phase-1
  // web-live desktop path: session is pre-mocked, no login gate needed).
  if (isDesktopPhase1OfflineRuntime(runtimeProfile) || isMockAuthenticated(env)) {
    return <Navigate to="/app" replace />;
  }

  return (
    <main className="host-page">
      <h1>XAI Web Host</h1>
      <p>Public landing shell placeholder.</p>
    </main>
  );
}
