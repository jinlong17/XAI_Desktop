/**
 * App.signout.test.tsx — APP-SO1..APP-SO4
 *
 * Verifies that App.tsx's handleSignOut handler correctly:
 *   1. Calls client.auth.signOut() (best-effort)
 *   2. Calls clearSessionStorage() (always)
 *   3. Calls window.location.assign("/") (always)
 *   4. Handles null client gracefully (mock-unauthenticated mode)
 *
 * Bugfix: Audit Top-10 #1 / Rail-10 — AvatarMenu Sign-out Option C wire.
 *
 * Test IDs: APP-SO1, APP-SO2, APP-SO3, APP-SO4
 */

import { render, fireEvent, act, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router";
import { App } from "../App";

afterEach(() => cleanup());

vi.mock("@repo/xai-web-event-bus", () => ({
  emitWebEvent: vi.fn(),
  onWebEvent: vi.fn(() => () => {}),
  useWebEventListener: vi.fn(),
}));

// window.location.assign mock — jsdom doesn't fully support navigation
const assignMock = vi.fn();
Object.defineProperty(window, "location", {
  value: { assign: assignMock },
  writable: true,
});

// Stub HTMLDialogElement for jsdom
HTMLDialogElement.prototype.showModal = function () {
  this.setAttribute("open", "");
};
HTMLDialogElement.prototype.close = function () {
  this.removeAttribute("open");
};

// ---- Module-level mock factory with a mutable context ----------------------
// Using a mutable object so individual tests can override client / methods
// without needing to replace the entire mock factory.

const mockSignOut = vi.fn();
const mockClearSessionStorage = vi.fn();

// Use a mutable config so APP-SO4 can set client=null without a factory override
const mockSessionConfig = {
  client: null as { auth: { signOut: typeof mockSignOut } } | null,
};
// Default: client with auth.signOut
mockSessionConfig.client = { auth: { signOut: mockSignOut } };

vi.mock("@repo/web-auth-device-session/web", () => ({
  useWebAuthSession: () => ({
    get client() { return mockSessionConfig.client; },
    clearSessionStorage: mockClearSessionStorage,
    state: "authenticated",
    session: null,
    deviceId: null,
    syncVersion: "2026-05",
    refreshSession: vi.fn(),
    ensureDeviceIdentity: vi.fn(),
    setSession: vi.fn(),
  }),
}));

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.removeAttribute("data-density");
  document.documentElement.removeAttribute("data-rail-pos");
  document.documentElement.removeAttribute("data-bg-tone");
  document.documentElement.style.cssText = "";
  assignMock.mockClear();
  mockSignOut.mockClear();
  mockClearSessionStorage.mockClear();
  // Restore default resolved values
  mockSignOut.mockResolvedValue({});
  mockClearSessionStorage.mockResolvedValue(undefined);
  // Restore default client
  mockSessionConfig.client = { auth: { signOut: mockSignOut } };
});

function renderApp() {
  return render(
    <MemoryRouter initialEntries={["/app/dashboard"]}>
      <Routes>
        <Route path="/app/*" element={<App />}>
          <Route path=":moduleId/*" element={<div />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

/**
 * Helper: open AvatarMenu -> click Sign Out menu item (opens dialog) ->
 * click Confirm in dialog.
 */
async function triggerSignOutConfirm(container: HTMLElement) {
  // Open avatar menu
  const avatarBtn = container.querySelector(".rail-avatar");
  if (avatarBtn) await act(async () => { fireEvent.click(avatarBtn); });

  // Click Sign Out menu item (opens confirmation dialog)
  const signOutItem = container.querySelector(".avm-item.danger");
  if (signOutItem) await act(async () => { fireEvent.click(signOutItem); });

  // Click confirm in dialog
  const confirmBtn = container.querySelector(".xai-sign-out-dialog__btn--confirm");
  if (confirmBtn) await act(async () => { fireEvent.click(confirmBtn); });
}

describe("App.tsx handleSignOut (APP-SO1..APP-SO4)", () => {
  it("APP-SO1 — happy path: signOut + clearSessionStorage + redirect all called", async () => {
    const { container } = renderApp();
    await triggerSignOutConfirm(container);
    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(mockClearSessionStorage).toHaveBeenCalledTimes(1);
    expect(assignMock).toHaveBeenCalledWith("/");
  });

  it("APP-SO2 — order: signOut before clearSessionStorage before assign", async () => {
    const callOrder: string[] = [];
    mockSignOut.mockImplementation(async () => { callOrder.push("signOut"); return {}; });
    mockClearSessionStorage.mockImplementation(async () => { callOrder.push("clear"); });
    assignMock.mockImplementation(() => { callOrder.push("assign"); });

    const { container } = renderApp();
    await triggerSignOutConfirm(container);

    expect(callOrder).toEqual(["signOut", "clear", "assign"]);
  });

  it("APP-SO3 — network error on signOut: clearSessionStorage + assign still called (best-effort)", async () => {
    mockSignOut.mockRejectedValue(new Error("network error"));

    const { container } = renderApp();
    await triggerSignOutConfirm(container);

    // signOut threw but the rest of the flow must still execute
    expect(mockClearSessionStorage).toHaveBeenCalledTimes(1);
    expect(assignMock).toHaveBeenCalledWith("/");
  });

  it("APP-SO4 — null client: skips signOut, still calls clearSessionStorage + assign", async () => {
    // Set client to null for this test (simulates mock-unauthenticated mode)
    mockSessionConfig.client = null;

    const { container } = renderApp();
    await triggerSignOutConfirm(container);

    expect(mockSignOut).not.toHaveBeenCalled();
    expect(mockClearSessionStorage).toHaveBeenCalledTimes(1);
    expect(assignMock).toHaveBeenCalledWith("/");
  });
});
