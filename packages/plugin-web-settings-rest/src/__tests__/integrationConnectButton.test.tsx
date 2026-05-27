/**
 * CB1..CB4 — IntegrationConnectButton tests (test.md §5.3 P2)
 */
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { IntegrationConnectButton } from "../internal/integrationConnectButton.js";
import { PROVIDERS } from "../internal/integrationProviders.js";

const notionProvider = PROVIDERS.find((p) => p.id === "notion")!;

// jsdom's window.location.assign is read-only; use defineProperty to mock it.
let assignMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  assignMock = vi.fn();
  Object.defineProperty(window, "location", {
    value: { ...window.location, assign: assignMock },
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
  sessionStorage.clear();
  vi.restoreAllMocks();
});

describe("IntegrationConnectButton", () => {
  it("CB1: renders with EN label 'Connect'", () => {
    render(<IntegrationConnectButton provider={notionProvider} lang="en" />);
    expect(screen.getByRole("button", { name: /Connect/i })).toBeInTheDocument();
  });

  it("CB2: renders with ZH label '连接'", () => {
    render(<IntegrationConnectButton provider={notionProvider} lang="zh" />);
    expect(screen.getByRole("button", { name: /连接/i })).toBeInTheDocument();
  });

  it("CB3: click writes sessionStorage entry + calls window.location.assign once", async () => {
    render(<IntegrationConnectButton provider={notionProvider} lang="en" />);
    const btn = screen.getByRole("button", { name: /Connect/i });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(assignMock).toHaveBeenCalledTimes(1);
    });

    const raw = sessionStorage.getItem("xai_oauth_pending_notion");
    expect(raw).not.toBeNull();

    const called = assignMock.mock.calls[0]?.[0] as string;
    expect(called).toMatch(/^https:\/\/api\.notion\.com\/v1\/oauth\/authorize/);
  });

  it("CB4: does not write localStorage (assert localStorage.length === 0 after click)", async () => {
    render(<IntegrationConnectButton provider={notionProvider} lang="en" />);
    const btn = screen.getByRole("button", { name: /Connect/i });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(assignMock).toHaveBeenCalledTimes(1);
    });

    expect(localStorage.length).toBe(0);
  });

  it("CB5: desktop offline profile keeps connect disabled and prevents navigation", async () => {
    vi.stubEnv("VITE_WEB_RUNTIME_PROFILE", "desktop-phase1-offline");
    render(<IntegrationConnectButton provider={notionProvider} lang="en" />);
    const btn = screen.getByRole("button", { name: /Connect/i });
    expect(btn).toBeDisabled();

    fireEvent.click(btn);
    await waitFor(() => {
      expect(assignMock).not.toHaveBeenCalled();
    });
  });
});
