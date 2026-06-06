/**
 * TT-ERRORBOUNDARY — AdminErrorBoundary guard (row #6 P2, AC-3).
 *
 *   TT-ERRORBOUNDARY-CATCH         a child that throws on render → boundary renders the fallback
 *                                 (not the crashed child) AND the injected spy sink.captureError
 *                                 was called once with the error.
 *   TT-ERRORBOUNDARY-PASSTHROUGH   a non-throwing child renders normally; sink not called.
 *   TT-ERRORBOUNDARY-FALLBACK-CLEAN the rendered fallback contains no inline <style>/<script>
 *                                 (CSP-clean), consistent with script-src 'self' / no unsafe-inline.
 *   TT-ERRORBOUNDARY-DEFAULT-SINK  with no sink prop, defaults to noopTelemetrySink (no throw, no
 *                                 side effect) and still renders the fallback.
 *
 * Authority: apps/admin/docs/deploy-observability/{api.md §2, test.md §2}.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { AdminErrorBoundary } from "./AdminErrorBoundary";
import type { AdminTelemetrySink } from "./telemetry";

function Boom(): React.ReactElement {
  throw new Error("render exploded");
}

function Ok(): React.ReactElement {
  return <div data-testid="ok-child">healthy child</div>;
}

function makeSpySink(): AdminTelemetrySink & {
  captureError: ReturnType<typeof vi.fn>;
  captureEvent: ReturnType<typeof vi.fn>;
} {
  return {
    captureError: vi.fn(),
    captureEvent: vi.fn(),
  };
}

describe("TT-ERRORBOUNDARY: AdminErrorBoundary catches + forwards + renders clean fallback (AC-3)", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // React logs the caught error to console.error by design; silence it for clean test output.
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    errorSpy.mockRestore();
  });

  it("TT-ERRORBOUNDARY-CATCH: renders fallback and forwards the error to the injected sink", () => {
    const sink = makeSpySink();
    render(
      <AdminErrorBoundary sink={sink} fallback={<div data-testid="fallback">fallback shown</div>}>
        <Boom />
      </AdminErrorBoundary>,
    );
    // Fallback is shown, the crashed child is not.
    expect(screen.getByTestId("fallback")).toBeTruthy();
    expect(screen.queryByTestId("ok-child")).toBeNull();
    // The error was forwarded exactly once, carrying the original Error.
    expect(sink.captureError).toHaveBeenCalledTimes(1);
    const firstArg = sink.captureError.mock.calls[0]?.[0];
    expect(firstArg).toBeInstanceOf(Error);
    expect((firstArg as Error).message).toBe("render exploded");
    // The context scope identifies the admin root.
    const ctxArg = sink.captureError.mock.calls[0]?.[1] as { scope?: string } | undefined;
    expect(ctxArg?.scope).toBe("admin-root");
  });

  it("TT-ERRORBOUNDARY-PASSTHROUGH: a healthy child renders and the sink is not called", () => {
    const sink = makeSpySink();
    render(
      <AdminErrorBoundary sink={sink}>
        <Ok />
      </AdminErrorBoundary>,
    );
    expect(screen.getByTestId("ok-child")).toBeTruthy();
    expect(sink.captureError).not.toHaveBeenCalled();
  });

  it("TT-ERRORBOUNDARY-FALLBACK-CLEAN: the default fallback contains no inline <style>/<script>", () => {
    const { container } = render(
      <AdminErrorBoundary>
        <Boom />
      </AdminErrorBoundary>,
    );
    // The default fallback rendered (no custom fallback passed).
    expect(container.querySelector(".admin-error-fallback"), "default fallback must render").toBeTruthy();
    // CSP-clean: no inline style/script elements injected by the fallback.
    expect(container.querySelector("style"), "fallback must not inject an inline <style>").toBeNull();
    expect(container.querySelector("script"), "fallback must not inject an inline <script>").toBeNull();
    // No inline style attribute either (consistent with no-unsafe-inline posture).
    expect(
      container.querySelector("[style]"),
      "fallback must not carry an inline style attribute",
    ).toBeNull();
  });

  it("TT-ERRORBOUNDARY-DEFAULT-SINK: with no sink prop it defaults to noopTelemetrySink and still renders fallback", () => {
    // No sink prop → defaults to noopTelemetrySink. Must not throw, must render the default fallback.
    expect(() =>
      render(
        <AdminErrorBoundary>
          <Boom />
        </AdminErrorBoundary>,
      ),
    ).not.toThrow();
    expect(screen.getByText(/控制台遇到错误/)).toBeTruthy();
  });
});
