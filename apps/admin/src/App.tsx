/**
 * apps/admin App root.
 *
 * Phase 2: wires the permission boundary. The shell mounts the read-only
 * `WebAuthSessionProvider` (so `useWebAuthSession()` has context) and gates the
 * admin surface behind `AdminRouteGate` — the CORE boundary of slice #1.
 *
 * Auth posture (design.md assumption #3): `mock-authenticated`. No real Supabase
 * `config` is supplied this slice, so `useWebAuthSession().state` resolves to
 * `"unconfigured"` and the guard FAILS CLOSED (renders the forbidden fallback)
 * unless a session + admin claim are present. This proves the fail-closed default.
 *
 * Phase 4 ports the 10 pages behind this same guard via AdminLayout.
 *
 * Row #6 (deploy-observability) P2: wraps the admin content in `AdminErrorBoundary`, mounted
 * BELOW `AdminRouteGate`. A render error inside the admin tree is caught + forwarded to the
 * injected telemetry sink (default no-op, secret-free) and a CSP-clean fallback renders instead
 * of crashing. Mounting below the guard means a render error never exposes admin UI on a
 * non-admin session (the guard still fails closed first). See api.md §2.
 */
import React from "react";
import { WebAuthSessionProvider } from "@repo/web-auth-device-session";
import { AdminRouteGate } from "./auth/AdminRouteGate";
import { AdminLayout } from "./components/AdminLayout";
import { AdminErrorBoundary } from "./observability/AdminErrorBoundary";

function ForbiddenFallback(): React.ReactElement {
  return (
    <div className="admin-gate-fallback" role="alert">
      <h1>需要管理员权限</h1>
      <p>该控制台仅对持有管理员凭证的内部人员开放。</p>
      <p className="admin-gate-fallback__hint">
        Admin-only surface · fail-closed guard · mock-authenticated posture
      </p>
    </div>
  );
}

export default function App(): React.ReactElement {
  return (
    <WebAuthSessionProvider>
      <AdminRouteGate fallback={<ForbiddenFallback />}>
        <AdminErrorBoundary>
          <AdminLayout />
        </AdminErrorBoundary>
      </AdminRouteGate>
    </WebAuthSessionProvider>
  );
}
