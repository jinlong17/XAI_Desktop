/**
 * apps/admin/src/observability/telemetry.ts — row #6 (deploy-observability) P2, AC-3.
 *
 * Pluggable telemetry seam with a provably no-op default. This is the ONLY new runtime
 * surface added by row #6, and it is kept tiny + secret-free by design:
 *
 *   - The `AdminTelemetrySink` interface carries NO DSN / endpoint / token field — there is
 *     literally no place for a credential to live (asserted by TT-TELEMETRY-NO-SECRET-FIELD).
 *   - The default `noopTelemetrySink` performs NO network (`fetch`/XHR), NO storage write
 *     (`localStorage`/`sessionStorage`/`IndexedDB`), and emits NO secret to the console
 *     (asserted by TT-TELEMETRY-NOOP). Neither method ever throws (TT-TELEMETRY-NO-THROW) —
 *     a telemetry sink must never break the app.
 *
 * A real sink (Sentry / console / server) is a documented FUTURE SWAP behind this same
 * interface, injected at the boundary (see AdminErrorBoundary). Wiring a real sink is an
 * OPERATOR step that would also require an ADR-0008 §S6 CSP `connect-src` extension for the
 * ingest host — explicitly NOT part of this slice (see release-operator-runbook.md §
 * Promotion Gate). The admin CSP stays `connect-src 'self'`.
 *
 * Contract authority: apps/admin/docs/deploy-observability/api.md §1.
 */

/** Non-secret context attached to a telemetry call. */
export interface TelemetryContext {
  /** page/route or component identifier — NON-secret label only. */
  scope?: string;
  /** arbitrary non-secret tags; values MUST NOT carry credentials. */
  tags?: Record<string, string | number | boolean>;
}

/**
 * Telemetry sink contract. Implementations MUST NOT throw. The interface deliberately
 * exposes NO transport configuration (no DSN/endpoint/token) — transport wiring belongs to a
 * concrete implementation injected at the boundary, never to this app-facing contract.
 */
export interface AdminTelemetrySink {
  /** Report a caught error. MUST NOT throw. Default impl is a no-op. */
  captureError(error: unknown, ctx?: TelemetryContext): void;
  /** Report a named non-error event. MUST NOT throw. Default impl is a no-op. */
  captureEvent(name: string, ctx?: TelemetryContext): void;
}

/**
 * Row-#6 default sink — DOES NOTHING.
 *
 * No network, no storage, no console output of secrets. Provably secret-free. Real sinks are a
 * documented future swap behind `AdminTelemetrySink` (see release-operator-runbook.md). Wiring a
 * real sink is an OPERATOR step.
 *
 * The arguments are intentionally accepted (to satisfy the interface) and intentionally ignored
 * (no side effect). They are referenced as `void` so the no-op is explicit and lint-clean.
 */
export const noopTelemetrySink: AdminTelemetrySink = {
  captureError(error: unknown, ctx?: TelemetryContext): void {
    void error;
    void ctx;
    // no-op: no network, no storage, no console secret.
  },
  captureEvent(name: string, ctx?: TelemetryContext): void {
    void name;
    void ctx;
    // no-op: no network, no storage, no console secret.
  },
};
