/**
 * ErrorBanner tests — EB1..EB5.
 *
 * Tests banner rendering for each LlmError kind + dismiss.
 *
 * Test strategy: packages/xai-web-ai-chat/docs/test.md §7.2 EB1..EB5
 */

import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { act, render, fireEvent } from "@testing-library/react";
import { ErrorBanner } from "../ErrorBanner.js";

describe("ErrorBanner (EB)", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("EB1: kind='BadKey' + detail='not-set' → shows 'configure your API key' copy + settings link", () => {
    const { container } = render(
      <ErrorBanner
        error={{ kind: "BadKey", status: 401, detail: "not-set" }}
        lang="en"
      />,
    );
    expect(container.textContent).toMatch(/configure your API key/i);
    const link = container.querySelector(".ai-error-settings-link");
    expect(link).not.toBeNull();
    expect(link?.textContent).toMatch(/settings.*ai/i);
  });

  it("EB2: kind='BadKey' without 'not-set' detail → shows 'rejected' copy + settings link", () => {
    const { container } = render(
      <ErrorBanner error={{ kind: "BadKey", status: 401 }} lang="en" />,
    );
    expect(container.textContent).toMatch(/rejected/i);
    const link = container.querySelector(".ai-error-settings-link");
    expect(link).not.toBeNull();
  });

  it("EB3: kind='RateLimited' retryAfterSec=30 → countdown 30s then Retry enabled", async () => {
    vi.useFakeTimers();
    const { container } = render(
      <ErrorBanner
        error={{ kind: "RateLimited", status: 429, retryAfterSec: 30 }}
        lang="en"
      />,
    );
    // Initially shows countdown.
    expect(container.textContent).toMatch(/30s/);
    // Retry button disabled while counting.
    const retryBtn = container.querySelector<HTMLButtonElement>(".ai-error-retry")!;
    expect(retryBtn.disabled).toBe(true);

    // Advance 1 second.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(container.textContent).toMatch(/29s/);

    // Advance remaining 29 seconds.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(29_000);
    });
    // Countdown done — retry enabled.
    expect(retryBtn.disabled).toBe(false);
    expect(container.textContent).toMatch(/ready to retry|retry/i);
  });

  it("EB4: kind='Network' → network copy + Retry enabled + clicking Retry invokes onRetry", () => {
    const onRetry = vi.fn();
    const { container } = render(
      <ErrorBanner
        error={{ kind: "Network", cause: new Error("fetch failed") }}
        lang="en"
        onRetry={onRetry}
      />,
    );
    expect(container.textContent).toMatch(/network|connection/i);
    const retryBtn = container.querySelector<HTMLButtonElement>(".ai-error-retry")!;
    expect(retryBtn.disabled).toBe(false);
    act(() => {
      fireEvent.click(retryBtn);
    });
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("EB5: Dismiss button hides the banner", () => {
    const onDismiss = vi.fn();
    const { container } = render(
      <ErrorBanner
        error={{ kind: "Network", cause: new Error("fetch failed") }}
        lang="en"
        onDismiss={onDismiss}
      />,
    );
    const dismissBtn = container.querySelector<HTMLButtonElement>(".ai-error-dismiss")!;
    expect(dismissBtn).not.toBeNull();
    act(() => {
      fireEvent.click(dismissBtn);
    });
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
