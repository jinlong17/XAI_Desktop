import { prepareAccountFixture } from "../../../apps/web/src/__tests__/accountFixture.js";
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
import { App } from "../../../apps/web/src/App";

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
  coordinator: undefined as { capture: () => { generation: string; owner: string }; signOut: ReturnType<typeof vi.fn> } | undefined,
};
// Default: client with auth.signOut
mockSessionConfig.client = { auth: { signOut: mockSignOut } };

vi.mock("@repo/web-auth-device-session/web", () => ({
  useWebAuthSession: () => ({
    get client() { return mockSessionConfig.client; },
    get coordinator() { return mockSessionConfig.coordinator; },
    clearSessionStorage: mockClearSessionStorage,
    state: "authenticated",
    session: { user: { id: "host-test-account" } },
    deviceId: null,
    syncVersion: "2026-05",
    refreshSession: vi.fn(),
    ensureDeviceIdentity: vi.fn(),
    setSession: vi.fn(),
  }),
}));

beforeEach(() => {
  mockSessionConfig.coordinator = undefined;
  localStorage.clear();
  prepareAccountFixture();
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
  expect(avatarBtn).not.toBeNull(); await act(async () => { fireEvent.click(avatarBtn!); });

  // Click Sign Out menu item (opens confirmation dialog)
  const signOutItem = container.querySelector(".avm-item.danger");
  expect(signOutItem).not.toBeNull(); await act(async () => { fireEvent.click(signOutItem!); });

  // Click confirm in dialog
  const confirmBtn = container.querySelector(".xai-sign-out-dialog__btn--confirm");
  expect(confirmBtn).not.toBeNull(); await act(async () => { fireEvent.click(confirmBtn!); });
}


import {accountScope} from '@repo/plugin-web-storage';
import {registerSettingsDepartureDelegate} from '../../../apps/web/src/routes/modules/settingsDeparture';
let removeDelegate:(()=>void)|undefined;
afterEach(()=>{removeDelegate?.();removeDelegate=undefined;});
for(const decision of ['stay','permit','scope','auth'] as const)it(`actual App captured signout boundary: ${decision}`,async()=>{
 let captured={owner:'host-test-account',generation:'auth-A'};
 const signOut=vi.fn(async()=>({status:'failed',reason:'test-stop-after-dispatch'}));
 mockSessionConfig.coordinator={capture:()=>({...captured}),signOut};
 let resolve!:(value:boolean)=>void;const gate=new Promise<boolean>(r=>resolve=r);
 const preflight=vi.fn(()=>gate);removeDelegate=registerSettingsDepartureDelegate({requestDeparture:preflight});
 const ui=renderApp();await act(async()=>{await new Promise(r=>setTimeout(r,0));});const scope=accountScope.capture();
 await triggerSignOutConfirm(ui.container);expect(preflight).toHaveBeenCalledTimes(1);expect(accountScope.capture()).toBe(scope);expect(signOut).not.toHaveBeenCalled();expect(mockClearSessionStorage).not.toHaveBeenCalled();expect(assignMock).not.toHaveBeenCalled();
 if(decision==='scope')await act(async()=>{accountScope.lock('B');});
 if(decision==='auth')captured={...captured,generation:'auth-B'};
 const before=accountScope.capture();await act(async()=>resolve(decision!=='stay'));
 if(decision==='permit'){expect(signOut).toHaveBeenCalledTimes(1);expect(signOut).toHaveBeenCalledWith({owner:'host-test-account',generation:'auth-A'});}else{expect(signOut).not.toHaveBeenCalled();expect(accountScope.capture()).toBe(before);}
 expect(mockClearSessionStorage).not.toHaveBeenCalled();expect(assignMock).not.toHaveBeenCalled();
});
it('actual App legacy fallback Stay preserves current scope and does no auth/clear/redirect',async()=>{removeDelegate=registerSettingsDepartureDelegate({requestDeparture:async()=>false});const ui=renderApp();await act(async()=>{await new Promise(r=>setTimeout(r,0));});const scope=accountScope.capture();await triggerSignOutConfirm(ui.container);expect(accountScope.capture()).toBe(scope);expect(mockSignOut).not.toHaveBeenCalled();expect(mockClearSessionStorage).not.toHaveBeenCalled();expect(assignMock).not.toHaveBeenCalled();});
