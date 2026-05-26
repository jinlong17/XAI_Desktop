/**
 * CP1..CP8 — CallbackPage tests (test.md §5.3 P3)
 *
 * The CallbackPage uses:
 *  - useSearchParams (react-router) — mocked
 *  - useNavigate (react-router) — mocked
 *  - usePref (@repo/plugin-web-storage) — real jsdom localStorage
 *  - emitWebEvent (@repo/xai-web-event-bus) — spied
 *  - validateAndConsumeState — real (reads sessionStorage)
 */
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import * as eventBus from "@repo/xai-web-event-bus";
import { startOAuth } from "../internal/oauthState.js";

const mockNavigate = vi.fn();
let mockSearchParams: URLSearchParams;

vi.mock("react-router", async (orig) => {
  const actual = await orig<typeof import("react-router")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams, vi.fn()],
  };
});

// Import AFTER mock setup
const { CallbackPage } = await import("../CallbackPage.js");

afterEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  mockNavigate.mockClear();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

beforeEach(() => {
  mockSearchParams = new URLSearchParams();
});

describe("CallbackPage", () => {
  it("CP1: valid state path — flips pref to true", async () => {
    const pending = await startOAuth("notion");
    mockSearchParams = new URLSearchParams({ state: pending.state });

    render(<CallbackPage />);
    // Wait for the useEffect to fire
    await act(async () => {});

    const raw = localStorage.getItem("xai_pref_integrations_connected_notion");
    expect(raw).toBe("true");
  });

  it("CP2: valid state path — emits web:settings:integration-connected exactly once", async () => {
    const emitSpy = vi.spyOn(eventBus, "emitWebEvent");
    const pending = await startOAuth("gcal");
    mockSearchParams = new URLSearchParams({ state: pending.state });

    render(<CallbackPage />);
    await act(async () => {});

    const calls = emitSpy.mock.calls.filter(
      (c) => c[0] === "web:settings:integration-connected",
    );
    expect(calls.length).toBe(1);
    expect(calls[0]![1]).toMatchObject({ providerId: "gcal", mode: "stub" });
  });

  it("CP3: valid state path — clears sessionStorage entry", async () => {
    const pending = await startOAuth("linear");
    mockSearchParams = new URLSearchParams({ state: pending.state });
    expect(sessionStorage.getItem("xai_oauth_pending_linear")).not.toBeNull();

    render(<CallbackPage />);
    await act(async () => {});

    expect(sessionStorage.getItem("xai_oauth_pending_linear")).toBeNull();
  });

  it("CP4: valid state path — displays success banner (oauth.cb.success)", async () => {
    const pending = await startOAuth("notion");
    mockSearchParams = new URLSearchParams({ state: pending.state });

    render(<CallbackPage />);
    await act(async () => {});

    expect(screen.getByText("Authorization received (stub)")).toBeInTheDocument();
  });

  it("CP5: valid state path — navigates back after 2000ms (fake timers)", async () => {
    vi.useFakeTimers();
    const pending = await startOAuth("notion");
    mockSearchParams = new URLSearchParams({ state: pending.state });

    render(<CallbackPage />);
    await act(async () => {});

    expect(mockNavigate).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(2001);
    });

    expect(mockNavigate).toHaveBeenCalledWith(
      "/app/settings/integrations",
      { replace: true },
    );
  });

  it("CP6: invalid state — no sessionStorage entry: does NOT flip pref + does NOT emit + shows invalid banner", async () => {
    const emitSpy = vi.spyOn(eventBus, "emitWebEvent");
    // No startOAuth — no sessionStorage entry
    mockSearchParams = new URLSearchParams({ state: "notion.somestate" });

    render(<CallbackPage />);
    await act(async () => {});

    expect(localStorage.getItem("xai_pref_integrations_connected_notion")).toBeNull();
    const calls = emitSpy.mock.calls.filter(
      (c) => c[0] === "web:settings:integration-connected",
    );
    expect(calls.length).toBe(0);
    expect(screen.getByText(/Invalid authorization state/)).toBeInTheDocument();
  });

  it("CP7: error param (?error=access_denied) — shows oauth.cb.cancelled banner", async () => {
    mockSearchParams = new URLSearchParams({ error: "access_denied" });

    render(<CallbackPage />);
    await act(async () => {});

    expect(screen.getByText("Authorization cancelled")).toBeInTheDocument();
  });

  it("CP8: ZH banner text rendered when lang=zh — test via localI18n directly", async () => {
    // CP8 verifies bilingual: test localI18n returns ZH text for oauth.cb.success
    const { localI18n } = await import("../internal/localI18n.js");
    const t = localI18n("zh");
    expect(t("oauth.cb.success")).toBe("已接收授权（演示）");
    expect(t("oauth.cb.invalid")).toBe("授权状态无效 — 请重新尝试");
    expect(t("oauth.cb.cancelled")).toBe("授权已取消");
  });
});
