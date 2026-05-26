/**
 * DB1..DB3 — IntegrationDisconnectButton tests (test.md §5.3 P4)
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { IntegrationDisconnectButton } from "../internal/integrationDisconnectButton.js";
import { PROVIDERS } from "../internal/integrationProviders.js";
import * as eventBus from "@repo/xai-web-event-bus";

const linearProvider = PROVIDERS.find((p) => p.id === "linear")!;

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe("IntegrationDisconnectButton", () => {
  it("DB1: renders with EN label 'Disconnect'", () => {
    render(
      <IntegrationDisconnectButton
        provider={linearProvider}
        lang="en"
        onDisconnect={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: /Disconnect/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Disconnect/i }).textContent).toBe("Disconnect");
  });

  it("DB2: renders with ZH label '断开连接'", () => {
    render(
      <IntegrationDisconnectButton
        provider={linearProvider}
        lang="zh"
        onDisconnect={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: /断开/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /断开/i }).textContent).toBe("断开连接");
  });

  it("DB3: click calls onDisconnect + emits web:settings:integration-disconnected", () => {
    const emitSpy = vi.spyOn(eventBus, "emitWebEvent");
    const onDisconnect = vi.fn();

    render(
      <IntegrationDisconnectButton
        provider={linearProvider}
        lang="en"
        onDisconnect={onDisconnect}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Disconnect/i }));

    expect(onDisconnect).toHaveBeenCalledTimes(1);

    const disconnectCalls = emitSpy.mock.calls.filter(
      (c) => c[0] === "web:settings:integration-disconnected",
    );
    expect(disconnectCalls.length).toBe(1);
    expect(disconnectCalls[0]![1]).toMatchObject({ providerId: "linear" });
  });
});
