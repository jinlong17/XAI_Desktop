/**
 * TT-TELEMETRY — no-op telemetry sink guard (row #6 P2, AC-3).
 *
 * Proves the default `noopTelemetrySink` is provably side-effect-free and secret-free:
 *   TT-TELEMETRY-NOOP            captureError/captureEvent perform NO fetch/XHR and NO storage
 *                               write, and return undefined.
 *   TT-TELEMETRY-NO-THROW       both methods never throw, including on non-Error arguments.
 *   TT-TELEMETRY-NO-SECRET-FIELD the sink object exposes no DSN/endpoint/token field.
 *
 * Authority: apps/admin/docs/deploy-observability/{api.md §1, test.md §2}.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { noopTelemetrySink, type AdminTelemetrySink } from "./telemetry";

describe("TT-TELEMETRY: noopTelemetrySink is provably no-op + secret-free (AC-3)", () => {
  let fetchSpy: ReturnType<typeof vi.fn>;
  let localSetSpy: ReturnType<typeof vi.spyOn>;
  let sessionSetSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.fn();
    // jsdom provides localStorage/sessionStorage; spy on their writes.
    vi.stubGlobal("fetch", fetchSpy);
    localSetSpy = vi.spyOn(Storage.prototype, "setItem");
    sessionSetSpy = vi.spyOn(window.sessionStorage, "setItem");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("TT-TELEMETRY-NOOP: captureError does no network, no storage write, returns undefined", () => {
    const result = noopTelemetrySink.captureError(new Error("boom"), {
      scope: "test",
      tags: { a: 1, b: "x", c: true },
    });
    expect(result, "captureError must return void").toBeUndefined();
    expect(fetchSpy, "captureError must not call fetch").not.toHaveBeenCalled();
    expect(localSetSpy, "captureError must not write localStorage").not.toHaveBeenCalled();
    expect(sessionSetSpy, "captureError must not write sessionStorage").not.toHaveBeenCalled();
  });

  it("TT-TELEMETRY-NOOP: captureEvent does no network, no storage write, returns undefined", () => {
    const result = noopTelemetrySink.captureEvent("page_view", { scope: "dashboard" });
    expect(result, "captureEvent must return void").toBeUndefined();
    expect(fetchSpy, "captureEvent must not call fetch").not.toHaveBeenCalled();
    expect(localSetSpy, "captureEvent must not write localStorage").not.toHaveBeenCalled();
    expect(sessionSetSpy, "captureEvent must not write sessionStorage").not.toHaveBeenCalled();
  });

  it("TT-TELEMETRY-NO-THROW: captureError never throws on Error, null, string, or undefined", () => {
    expect(() => noopTelemetrySink.captureError(new Error("x"))).not.toThrow();
    expect(() => noopTelemetrySink.captureError(null)).not.toThrow();
    expect(() => noopTelemetrySink.captureError("a string error")).not.toThrow();
    expect(() => noopTelemetrySink.captureError(undefined)).not.toThrow();
  });

  it("TT-TELEMETRY-NO-THROW: captureEvent never throws", () => {
    expect(() => noopTelemetrySink.captureEvent("evt")).not.toThrow();
    expect(() => noopTelemetrySink.captureEvent("evt", { scope: "s", tags: { n: 0 } })).not.toThrow();
  });

  it("TT-TELEMETRY-NO-SECRET-FIELD: the sink exposes no DSN/endpoint/token-shaped field", () => {
    // Structural: the contract has no place to put a credential. Walk own keys (incl. any that a
    // future regression might add) and assert none carries a transport-secret name.
    const SECRET_FIELD_RE = /(dsn|endpoint|url|token|secret|apikey|api_key|key|ingest)/i;
    const keys = Object.keys(noopTelemetrySink as unknown as Record<string, unknown>);
    const offenders = keys.filter((k) => SECRET_FIELD_RE.test(k));
    expect(
      offenders,
      `noopTelemetrySink must expose no transport/secret field; found: ${offenders.join(", ")}`,
    ).toHaveLength(0);
    // The two contract methods are present and are functions.
    const sink: AdminTelemetrySink = noopTelemetrySink;
    expect(typeof sink.captureError).toBe("function");
    expect(typeof sink.captureEvent).toBe("function");
  });
});
