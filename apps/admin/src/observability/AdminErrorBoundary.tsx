/**
 * apps/admin/src/observability/AdminErrorBoundary.tsx — row #6 (deploy-observability) P2, AC-3.
 *
 * Class error boundary mounted at the app root, BELOW `AdminRouteGate` (see App.tsx), so a render
 * error in any admin descendant:
 *   - is forwarded to the injected `AdminTelemetrySink` (default `noopTelemetrySink`) via
 *     `componentDidCatch`, and
 *   - causes `render()` to return a CSP-clean fallback panel instead of crashing the React tree.
 *
 * Mounting below the guard is deliberate: if the guard fails closed (non-admin / unauthenticated
 * session) it renders its own forbidden fallback and this boundary never wraps admin content — a
 * render error can therefore never expose admin UI on a non-admin session.
 *
 * The fallback is CSP-clean (no inline `<style>`/`<script>`; styled via the existing admin
 * stylesheet OKLCH token classes), consistent with the `script-src 'self'` / no-`unsafe-inline`
 * posture (TT-ERRORBOUNDARY-FALLBACK-CLEAN + the CSP guard).
 *
 * The sink is injectable for tests (pass a spy) and for the future real wiring (an OPERATOR step;
 * see release-operator-runbook.md). This component adds NO network and NO secret.
 *
 * Contract authority: apps/admin/docs/deploy-observability/api.md §2.
 */
import React from "react";
import { type AdminTelemetrySink, noopTelemetrySink } from "./telemetry";

export interface AdminErrorBoundaryProps {
  children: React.ReactNode;
  /** injected sink; defaults to noopTelemetrySink. */
  sink?: AdminTelemetrySink;
  /** CSP-clean fallback UI; defaults to a minimal token-styled panel. */
  fallback?: React.ReactNode;
}

interface AdminErrorBoundaryState {
  hasError: boolean;
}

/** Default fallback — token-styled, no inline style/script (CSP-clean). */
function DefaultErrorFallback(): React.ReactElement {
  return (
    <div className="admin-error-fallback" role="alert">
      <h1>控制台遇到错误</h1>
      <p>页面渲染时出现问题。请刷新重试；如持续出现，请联系管理员。</p>
      <p className="admin-error-fallback__hint">
        Admin error boundary · render error contained · no data was sent
      </p>
    </div>
  );
}

export class AdminErrorBoundary extends React.Component<
  AdminErrorBoundaryProps,
  AdminErrorBoundaryState
> {
  constructor(props: AdminErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): AdminErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    const sink = this.props.sink ?? noopTelemetrySink;
    // Forward to the injected sink. The sink contract guarantees no throw, but guard anyway so a
    // misbehaving custom sink can never re-crash the boundary.
    try {
      sink.captureError(error, {
        scope: "admin-root",
        tags: { componentStack: info.componentStack ? "present" : "absent" },
      });
    } catch {
      // Telemetry must never break the app; swallow any sink error.
    }
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? <DefaultErrorFallback />;
    }
    return this.props.children;
  }
}
