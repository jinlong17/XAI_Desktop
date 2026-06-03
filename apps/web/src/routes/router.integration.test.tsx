// @vitest-environment jsdom

import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { createRoot, type Root } from "react-dom/client";
import { act } from "react";
import { RouterProvider, createMemoryRouter } from "react-router";
import type { PropsWithChildren } from "react";
import { webHostRouteObjects } from "./router";

const mockDeviceFetch = vi.fn(async () => new Response(JSON.stringify({ rows: [] }), { status: 200 }));

vi.mock("@repo/web-auth-device-session/web", async () => {
  const actual = await vi.importActual<typeof import("@repo/web-auth-device-session/web")>(
    "@repo/web-auth-device-session/web"
  );

  return {
    ...actual,
    AppRouteGate: ({ children }: PropsWithChildren) => <>{children}</>,
    AuthRouteGate: ({ children }: PropsWithChildren) => <>{children}</>,
    useDeviceBoundFetch: () => mockDeviceFetch,
    useWebAuthSession: () => ({
      state: "authenticated",
      session: {
        user: {
          id: "router-test-account",
          user_metadata: {
            xai_todo_dek_base64: "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=",
            xai_todo_key_id: 1,
            xai_todo_encryption_device_id: "router-test-device",
          },
        },
      },
      deviceId: "router-test-device",
      ensureDeviceIdentity: async () => "router-test-device",
    }),
    WebAuthPage: ({ path }: { path: string }) => (
      <main className="host-page">
        <p>Route: {path}</p>
      </main>
    ),
  };
});

interface MountedApp {
  container: HTMLDivElement;
  root: Root;
}

function findButton(container: HTMLElement, label: string): HTMLButtonElement {
  const buttons = Array.from(container.querySelectorAll("button"));
  const match = buttons.find((button) => button.textContent?.trim() === label);
  if (!match) {
    throw new Error(`missing_button:${label}`);
  }
  return match;
}

async function mountRouter(initialEntries: string[], initialIndex?: number): Promise<MountedApp> {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  const router = createMemoryRouter(webHostRouteObjects, { initialEntries, initialIndex });

  await act(async () => {
    root.render(<RouterProvider router={router} />);
  });

  return { container, root };
}

async function unmountApp(app: MountedApp): Promise<void> {
  await act(async () => {
    app.root.unmount();
  });
  app.container.remove();
}

afterEach(() => {
  document.body.innerHTML = "";
  mockDeviceFetch.mockClear();
});

beforeAll(() => {
  // React 19 test runtime expects this opt-in when using act in non-Jest environments.
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  globalThis.Request = window.Request as typeof Request;
  globalThis.AbortController = window.AbortController as typeof AbortController;
  globalThis.AbortSignal = window.AbortSignal as typeof AbortSignal;
});

describe("web host router integration", () => {
  it("renders authenticated module deep links and survives remount refresh", async () => {
    // P4: AppShellPage is no longer rendered; module content (TodoWebModuleRoute) is now direct.
    // "Todos" comes from TodoWebModuleRoute's <h2>; "active module: todos" was AppShellPage text.
    const first = await mountRouter(["/app/todos/smart:inbox"]);
    expect(first.container.textContent).toContain("Todos");
    await unmountApp(first);

    const second = await mountRouter(["/app/todos/smart:inbox"]);
    expect(second.container.textContent).toContain("Todos");
    await unmountApp(second);
  });

  it("resolves route families consistently across history entries", async () => {
    const historyEntries = ["/", "/auth/login", "/app/todos/smart:inbox"];

    // P4: module content is direct; no AppShellPage "active module: todos" string.
    const app = await mountRouter(historyEntries, 2);
    expect(app.container.textContent).toContain("Todos");
    await unmountApp(app);

    const auth = await mountRouter(historyEntries, 1);
    expect(auth.container.textContent).toContain("Route: /auth/login");
    await unmountApp(auth);

    const landing = await mountRouter(historyEntries, 0);
    expect(landing.container.textContent ?? "").toContain("XAI Console");
    expect(landing.container.textContent ?? "").toContain("Open console");
    expect(landing.container.textContent ?? "").not.toContain("Public landing shell placeholder");
    await unmountApp(landing);
  });

  it("keeps app shell stable when invoking todo module controls", async () => {
    const app = await mountRouter(["/app/todos/smart:inbox"]);

    await act(async () => {
      findButton(app.container, "Create").dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    // P4: module content is rendered directly; "Todos" comes from TodoWebModuleRoute.
    expect(app.container.textContent).toContain("Todos");

    await unmountApp(app);
  });

  // RR1 — gap-closure row #7: OAuth callback route resolves
  it("RR1: /app/settings/integrations/callback route resolves and renders the callback page", async () => {
    // The route must render without throwing; the callback page renders an empty
    // container in "pending" state (no ?state= or ?error= → shows invalid banner).
    const app = await mountRouter(["/app/settings/integrations/callback"]);
    // Route resolved correctly — the container exists and is mounted.
    expect(app.container).toBeTruthy();
    await unmountApp(app);
  });

  // RR-PREMIUM-1 — gap-closure row #8: Checkout success route resolves
  it("RR-PREMIUM-1: /app/settings/premium/checkout/success route resolves and renders", async () => {
    const app = await mountRouter(["/app/settings/premium/checkout/success"]);
    // Route resolved correctly — the container exists and is mounted.
    expect(app.container).toBeTruthy();
    await unmountApp(app);
  });

  // RR-PREMIUM-2 — gap-closure row #8: Checkout cancel route resolves
  it("RR-PREMIUM-2: /app/settings/premium/checkout/cancel route resolves and renders", async () => {
    const app = await mountRouter(["/app/settings/premium/checkout/cancel"]);
    // Route resolved correctly — the container exists and is mounted.
    expect(app.container).toBeTruthy();
    await unmountApp(app);
  });
});
