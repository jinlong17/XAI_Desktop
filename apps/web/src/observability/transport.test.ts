import { describe, expect, it, vi } from "vitest";
import { createBrowserObservabilityTransport } from "./transport";

describe("createBrowserObservabilityTransport", () => {
  it("initializes sentry with privacy-safe defaults", () => {
    const init = vi.fn();
    const captureMessage = vi.fn();

    const transport = createBrowserObservabilityTransport({
      environment: "web-prod",
      release: "web@1.2.3",
      sentryDsn: "https://public@example.ingest.sentry.io/1",
      sentryClient: {
        init,
        captureMessage,
      },
    });

    transport.initialize?.();
    expect(init).toHaveBeenCalledTimes(1);
    const options = init.mock.calls[0]?.[0];
    expect(options.sendDefaultPii).toBe(false);
    expect(options.tracePropagationTargets).toEqual([]);
    expect(options.allowUrls).toHaveLength(1);
    expect(options.denyUrls).toHaveLength(2);
  });

  it("captures error events only when initialized and flushes rum batches", async () => {
    const init = vi.fn();
    const captureMessage = vi.fn();
    const fetchImpl = vi.fn(async () => ({ ok: true }));

    const transport = createBrowserObservabilityTransport({
      environment: "web-staging",
      release: "web@2.0.0",
      sentryDsn: "https://public@example.ingest.sentry.io/1",
      sentryClient: {
        init,
        captureMessage,
      },
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    transport.send({
      channel: "error",
      routeGroup: "app",
      message: "before init",
    });

    expect(captureMessage).toHaveBeenCalledTimes(0);

    transport.initialize?.();

    transport.send({
      channel: "error",
      routeGroup: "module",
      message: "failure /app/task/777?token=abc",
      context: {
        safe: "yes",
        userId: "u-1",
      },
    });

    expect(captureMessage).toHaveBeenCalledTimes(1);
    expect(captureMessage.mock.calls[0]?.[0]).toBe("redacted_error");
    expect(captureMessage.mock.calls[0]?.[1]).toMatchObject({
      extra: { event_channel: "error" },
    });

    transport.send({
      channel: "rum",
      routeGroup: "module",
      message: "LCP",
      context: {
        metric: {
          name: "LCP",
          value: 1200,
          rating: "good",
          attribution: {
            query: "token=abc",
            url: "https://xai.example.com/app/todos/999?token=abc",
            hostType: "desktop",
          },
        },
      },
    });

    await transport.flushRum();
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const fetchCalls = (fetchImpl as unknown as { mock: { calls: Array<[unknown, RequestInit | undefined]> } }).mock.calls;
    const requestInit = fetchCalls[0]?.[1];
    expect(requestInit).toBeDefined();
    expect(typeof requestInit?.body).toBe("string");
    const payload = JSON.parse(requestInit?.body as string);
    expect(payload.routeGroup).toBe("module");
    expect(JSON.stringify(payload)).not.toContain("token=abc");
    expect(JSON.stringify(payload)).not.toContain("999");
  });
});
