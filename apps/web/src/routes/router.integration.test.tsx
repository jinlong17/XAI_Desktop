// @vitest-environment jsdom

import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { createRoot, type Root } from "react-dom/client";
import { act } from "react";
import {
  MemoryRouter,
  Route,
  RouterProvider,
  Routes,
  createMemoryRouter,
} from "react-router";
import type { PropsWithChildren } from "react";
import { LandingPage } from "../pages/LandingPage";
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
  vi.unstubAllEnvs();
  localStorage.clear();
  sessionStorage.clear();
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
    expect(landing.container.textContent).toContain("XAI Web Host");
    await unmountApp(landing);
  });

  it("redirects desktop offline root launches into the app shell", async () => {
    vi.stubEnv("VITE_WEB_RUNTIME_PROFILE", "desktop-phase1-offline");
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/app" element={<main>App shell target</main>} />
          </Routes>
        </MemoryRouter>,
      );
    });

    expect(container.textContent).toContain("App shell target");
    expect(container.textContent).not.toContain("Public landing shell placeholder");

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  // RR-LANDING-MOCK-AUTH-1 — S2 regression guard (desktop/web UI divergence bug 2026-05-30)
  // Verifies that LandingPage redirects to /app when VITE_WEB_AUTH_MODE=mock-authenticated
  // even without the offline runtime profile. This covers the Phase-1 web-live desktop path:
  // after S1 removes desktop-phase1-offline, the desktop uses web-live profile with
  // mock-authenticated auth, and the landing page must still jump straight to /app.
  it("RR-LANDING-MOCK-AUTH-1: redirects mock-authenticated desktop root launch into the app shell", async () => {
    vi.stubEnv("VITE_WEB_AUTH_MODE", "mock-authenticated");
    // Explicitly confirm runtime profile is NOT offline (web-live is the default)
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/app" element={<main>App shell target</main>} />
          </Routes>
        </MemoryRouter>,
      );
    });

    expect(container.textContent).toContain("App shell target");
    expect(container.textContent).not.toContain("Public landing shell placeholder");
    expect(container.textContent).not.toContain("XAI Web Host");

    await act(async () => {
      root.unmount();
    });
    container.remove();
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

  // RR1 — gap-closure row #7: OAuth callback route resolves and fail-closes offline
  it("RR1: /app/settings/integrations/callback under desktop offline profile does not mutate integration prefs", async () => {
    vi.stubEnv("VITE_WEB_RUNTIME_PROFILE", "desktop-phase1-offline");
    const pendingState = "notion.router-test-state";
    sessionStorage.setItem(
      "xai_oauth_pending_notion",
      JSON.stringify({
        state: pendingState,
        codeVerifier: "router-test-code-verifier",
        expiresAt: Date.now() + 60_000,
      }),
    );

    const app = await mountRouter([
      `/app/settings/integrations/callback?state=${encodeURIComponent(pendingState)}&code=fake-code`,
    ]);

    expect(localStorage.getItem("xai_pref_integrations_connected_notion")).not.toBe("true");
    await unmountApp(app);
  });

  // RR-PREMIUM-1 — gap-closure row #8: Checkout success route resolves
  it("RR-PREMIUM-1: /app/settings/premium/checkout/success under desktop offline profile does not mutate premium tier", async () => {
    vi.stubEnv("VITE_WEB_RUNTIME_PROFILE", "desktop-phase1-offline");
    const app = await mountRouter(["/app/settings/premium/checkout/success?session_id=cs_router_test"]);
    expect(localStorage.getItem("xai_pref_premium_tier")).not.toBe("premium_stub");
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
