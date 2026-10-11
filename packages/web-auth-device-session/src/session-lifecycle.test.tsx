// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Session, SupabaseClient, SupportedStorage } from "@supabase/supabase-js";
import { WebAuthSessionProvider, useWebAuthSession, type WebAuthSessionContextValue } from "./session";
import type { DeviceIdentityStore } from "./device-store";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function session(id: string, token = `${id}-token`): Session {
  return { access_token: token, refresh_token: `${id}-refresh`, expires_in: 3600, token_type: "bearer", user: { id } } as Session;
}
const response = (value: Session | null) => ({ data: { session: value }, error: null });
function authClient(read: () => Promise<ReturnType<typeof response>>) {
  let listener: ((event: string, value: Session | null) => void) | undefined;
  const unsubscribe = vi.fn();
  const getSession = vi.fn(read);
  const onAuthStateChange = vi.fn((next: typeof listener) => {
    listener = next;
    return { data: { subscription: { unsubscribe } } };
  });
  return {
    client: { auth: { getSession, onAuthStateChange } } as unknown as SupabaseClient,
    emit: (value: Session | null, event = "SIGNED_IN") => listener?.(event, value),
    getSession,
    unsubscribe,
  };
}
const identityStore: DeviceIdentityStore = {
  get: async () => "fixture-device", set: async () => undefined,
  clear: async () => undefined, ensure: async () => "fixture-device",
};
const roots: Root[] = [];
afterEach(async () => {
  for (const root of roots.splice(0)) await act(async () => root.unmount());
  document.body.innerHTML = "";
});
async function mount(client: SupabaseClient, onIdentityChange = vi.fn(), storage?: SupportedStorage) {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  let current!: WebAuthSessionContextValue;
  const holder = document.createElement("div"); document.body.append(holder);
  const root = createRoot(holder); roots.push(root);
  function Consumer() {
    current = useWebAuthSession();
    return <output>{current.state}:{current.session?.user.id ?? "none"}</output>;
  }
  async function render(nextClient: SupabaseClient) {
    await act(async () => root.render(
      <WebAuthSessionProvider client={nextClient} storage={storage} deviceStore={identityStore} onIdentityChange={onIdentityChange}>
        <Consumer />
      </WebAuthSessionProvider>,
    ));
  }
  await render(client);
  return {
    get value() { return current; }, holder, render,
    async unmount() { roots.splice(roots.indexOf(root), 1); await act(async () => root.unmount()); },
  };
}

describe("auth identity lifecycle ordering", () => {
  it("keeps a newer auth event when the initial getSession returns an older account", async () => {
    const initial = deferred<ReturnType<typeof response>>();
    const auth = authClient(() => initial.promise);
    const identity = vi.fn();
    const view = await mount(auth.client, identity);
    expect(view.value.state).toBe("loading");
    await act(async () => auth.emit(session("B")));
    await act(async () => initial.resolve(response(session("A"))));
    expect(view.value.session?.user.id).toBe("B");
    expect(view.holder.textContent).toBe("authenticated:B");
    expect(identity.mock.calls).toEqual([["B"]]);
  });

  it("publishes token refresh without invalidating the same account identity", async () => {
    const auth = authClient(async () => response(session("A")));
    const identity = vi.fn();
    const view = await mount(auth.client, identity);
    await act(async () => auth.emit(session("A", "new-token"), "TOKEN_REFRESHED"));
    expect(view.value.session?.access_token).toBe("new-token");
    expect(view.value.state).toBe("authenticated");
    expect(identity.mock.calls).toEqual([["A"]]);
  });

  it("invalidates identity synchronously before awaiting durable session deletion", async () => {
    const deletion = deferred<void>();
    const order: string[] = [];
    const storage: SupportedStorage = {
      getItem: async () => null, setItem: async () => undefined,
      removeItem: vi.fn((key: string) => { order.push(`remove:${key}`); return deletion.promise; }),
    };
    const auth = authClient(async () => response(session("A")));
    const identity = vi.fn((id: string | null) => order.push(`identity:${id}`));
    const view = await mount(auth.client, identity, storage);
    order.length = 0;
    let clearing!: Promise<void>;
    act(() => {
      clearing = view.value.clearSessionStorage();
      expect(order).toEqual(["identity:null", "remove:xai-web-auth"]);
    });
    expect(view.value.session).toBeNull();
    expect(view.value.state).toBe("unauthenticated");
    await act(async () => { deletion.resolve(); await clearing; });
    expect(order).toEqual(["identity:null", "remove:xai-web-auth", "remove:xai-web-auth-code-verifier"]);
  });

  it("does not publish a pending request or old auth event after unmount", async () => {
    const initial = deferred<ReturnType<typeof response>>();
    const auth = authClient(() => initial.promise);
    const identity = vi.fn();
    const view = await mount(auth.client, identity);
    await view.unmount();
    await act(async () => { initial.resolve(response(session("A"))); auth.emit(session("B")); });
    expect(identity).not.toHaveBeenCalled();
    expect(auth.unsubscribe).toHaveBeenCalledOnce();
  });

  it("does not allow the replaced client's pending read or callback to replace the new account", async () => {
    const pending = deferred<ReturnType<typeof response>>();
    const old = authClient(() => pending.promise);
    const next = authClient(async () => response(session("B")));
    const identity = vi.fn();
    const view = await mount(old.client, identity);
    await view.render(next.client);
    await act(async () => { pending.resolve(response(session("A"))); old.emit(session("C")); });
    expect(view.value.client).toBe(next.client);
    expect(view.value.session?.user.id).toBe("B");
    expect(identity.mock.calls).toEqual([["B"]]);
    expect(old.unsubscribe).toHaveBeenCalledOnce();
  });

  it("setSession updates state and invalidates an older in-flight request", async () => {
    const initial = deferred<ReturnType<typeof response>>();
    const auth = authClient(() => initial.promise);
    const identity = vi.fn();
    const view = await mount(auth.client, identity);
    await act(async () => view.value.setSession(session("B")));
    expect(view.value.state).toBe("authenticated");
    await act(async () => initial.resolve(response(session("A"))));
    expect(view.value.session?.user.id).toBe("B");
    await act(async () => view.value.setSession(null));
    expect(view.value.state).toBe("unauthenticated");
    expect(view.value.session).toBeNull();
    expect(identity.mock.calls).toEqual([["B"], [null]]);
  });
});
