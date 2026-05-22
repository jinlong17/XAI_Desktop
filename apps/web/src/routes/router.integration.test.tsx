// @vitest-environment jsdom

import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { createRoot, type Root } from "react-dom/client";
import { act } from "react";
import { RouterProvider, createMemoryRouter } from "react-router";
import type { PropsWithChildren } from "react";
import { webHostRouteObjects } from "./router";

vi.mock("@repo/web-auth-device-session/web", async () => {
  const actual = await vi.importActual<typeof import("@repo/web-auth-device-session/web")>(
    "@repo/web-auth-device-session/web"
  );

  return {
    ...actual,
    AppRouteGate: ({ children }: PropsWithChildren) => <>{children}</>,
    AuthRouteGate: ({ children }: PropsWithChildren) => <>{children}</>,
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
    const first = await mountRouter(["/app/todos/inbox"]);
    expect(first.container.textContent).toContain("active module: todos");
    expect(first.container.textContent).toContain("Module route: /app/todos/inbox");
    await unmountApp(first);

    const second = await mountRouter(["/app/todos/inbox"]);
    expect(second.container.textContent).toContain("active module: todos");
    expect(second.container.textContent).toContain("Module route: /app/todos/inbox");
    await unmountApp(second);
  });

  it("resolves route families consistently across history entries", async () => {
    const historyEntries = ["/", "/auth/login", "/app/todos/inbox"];

    const app = await mountRouter(historyEntries, 2);
    expect(app.container.textContent).toContain("active module: todos");
    await unmountApp(app);

    const auth = await mountRouter(historyEntries, 1);
    expect(auth.container.textContent).toContain("Route: /auth/login");
    await unmountApp(auth);

    const landing = await mountRouter(historyEntries, 0);
    expect(landing.container.textContent).toContain("XAI Web Host");
    await unmountApp(landing);
  });

  it("keeps app shell stable when invoking unsupported capability stubs", async () => {
    const app = await mountRouter(["/app/todos/inbox"]);

    await act(async () => {
      findButton(app.container, "Unsupported Native Stub").dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(app.container.textContent).toContain("active module: todos");
    expect(app.container.textContent).toContain("Module route: /app/todos/inbox");

    await unmountApp(app);
  });
});
