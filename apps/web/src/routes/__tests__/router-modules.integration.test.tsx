// @vitest-environment jsdom

/**
 * router-modules.integration.test.tsx — host-router-level regression
 * coverage for the W6 "23 SHIPPED modules unreachable at /app/*" P0
 * regression (see packages/web-console-host-router/docs/dev_log.md
 * Bug Report).
 *
 * Three layers:
 *
 *   Layer A — registration resolution (fast, deterministic, all 12 ids).
 *     For each WebModuleSlotRegistration in the rail, prove that
 *     resolveModuleRouteMatch() against the host's
 *     `webModuleRouteRegistrations` returns a match whose render function
 *     name is NOT "ModuleRoutePlaceholderPage" and whose render function
 *     IS the same reference the registration declares. This is the
 *     contract that the diagnose/fix strategy must keep true.
 *
 *   Layer B — real-render deep links (one-per-wave per bug-diagnose
 *     "Required regression test" §AC-W6-FIX-1..6 + composedSettings).
 *     Boots createMemoryRouter(webHostRouteObjects, [`/app/<id>`]) and
 *     asserts (a) the module's distinctive `className="module module-XXX"`
 *     marker appears in the rendered DOM, and (b) the placeholder text
 *     "This module remains placeholder-mounted in W6." does NOT appear.
 *     Covers tasks / matrix / calendar / pomodoro / countdown /
 *     statistics / settings. ai-chat / board / dashboard /
 *     habits / meditation are intentionally omitted from Layer B because
 *     their root-render fetches data / mounts heavy widgets — Layer A
 *     still proves they reach their real render function, which is
 *     exactly the property the W6 regression violated. Per-module render
 *     correctness is covered by each row's own vitest suite.
 *
 *   Layer C — single-source-of-truth invariant (AC-W6-FIX-7).
 *     The host's `webModuleRouteRegistrations` MUST be composed exactly
 *     from `[...webShellModuleRegistrations, todoWebModuleRegistration]`.
 *     If a future change drifts these arrays apart again (which is what
 *     produced the W6 bug), this assertion fires before any feature
 *     verify pass would.
 *
 * Owner: packages/web-console-host-router. Test lives in apps/web because
 * the assembly under test is host-only and not exported.
 */

import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { createRoot, type Root } from "react-dom/client";
import { act } from "react";
import { RouterProvider, createMemoryRouter } from "react-router";
import type { PropsWithChildren } from "react";
import { webHostRouteObjects } from "../router";
import {
  webModuleRouteRegistrations,
  webShellModuleRegistrations,
} from "../modules/shellRegistrations";
import { todoWebModuleRegistration } from "@repo/plugin-productivity/web";
import { resolveModuleRouteMatch } from "../modules/buildModuleRoutes";

// ---- shared mocks (parity with router.integration.test.tsx) ---------------

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
          id: "router-modules-test-account",
          user_metadata: {
            xai_todo_dek_base64: "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=",
            xai_todo_key_id: 1,
            xai_todo_encryption_device_id: "router-modules-test-device",
          },
        },
      },
      deviceId: "router-modules-test-device",
      ensureDeviceIdentity: async () => "router-modules-test-device",
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

async function mountRouter(initialEntries: string[]): Promise<MountedApp> {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  const router = createMemoryRouter(webHostRouteObjects, { initialEntries });

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
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  globalThis.Request = window.Request as typeof Request;
  globalThis.AbortController = window.AbortController as typeof AbortController;
  globalThis.AbortSignal = window.AbortSignal as typeof AbortSignal;
});

// =============================================================================
// Layer A — registration resolution (all 12 shell ids resolve to a real
// render function, not the placeholder, via the seam the host actually uses).
// =============================================================================

describe("AC-W6-FIX-LA: all 12 shell modules resolve via webModuleRouteRegistrations", () => {
  for (const shellReg of webShellModuleRegistrations) {
    it(`AC-W6-FIX-LA/${shellReg.moduleId}: resolves to its real render function (not placeholder)`, () => {
      const match = resolveModuleRouteMatch(
        webModuleRouteRegistrations,
        shellReg.moduleId,
        ""
      );

      expect(match, `module '${shellReg.moduleId}' did not resolve via host array`).not.toBeNull();
      expect(match!.moduleId).toBe(shellReg.moduleId);

      const rootChild = match!.registration.children.find((c) => c.path === "");
      expect(rootChild, `module '${shellReg.moduleId}' missing path:'' child`).toBeDefined();
      expect(
        rootChild!.render.name,
        `module '${shellReg.moduleId}' render fell back to ModuleRoutePlaceholderPage — host router is wired to the wrong array`
      ).not.toBe("ModuleRoutePlaceholderPage");

      // Same reference as the rail registration — proves single source of truth.
      const shellRootChild = shellReg.children.find((c) => c.path === "");
      expect(rootChild!.render, `module '${shellReg.moduleId}' render diverges from shell registration`).toBe(
        shellRootChild!.render
      );
    });
  }

  it("AC-W6-FIX-LA/todos: legacy /app/todos still resolves (transitional shim)", () => {
    const match = resolveModuleRouteMatch(webModuleRouteRegistrations, "todos", "smart:inbox");
    expect(match).not.toBeNull();
    expect(match!.moduleId).toBe("todos");
  });
});

// =============================================================================
// Layer B — real-render deep links per wave (W2..W4).
// Asserts the host route table actually mounts the real module DOM and not
// the deleted ModuleRoutePlaceholderPage.
// =============================================================================

const PLACEHOLDER_TEXT = "This module remains placeholder-mounted in W6.";

interface RealRenderCase {
  ac: string;       // acceptance criterion id
  url: string;      // deep link
  marker: string;   // module-specific className expected in rendered DOM
}

const realRenderCases: RealRenderCase[] = [
  { ac: "AC-W6-FIX-1", url: "/app/tasks",      marker: "module-tasks" },
  { ac: "AC-W6-FIX-2", url: "/app/matrix",     marker: "module-matrix" },
  { ac: "AC-W6-FIX-3", url: "/app/calendar",   marker: "module-cal" },
  { ac: "AC-W6-FIX-4", url: "/app/pomodoro",   marker: "module-pomo" },
  { ac: "AC-W6-FIX-5", url: "/app/countdown",  marker: "module-countdown" },
  { ac: "AC-W6-FIX-6", url: "/app/statistics", marker: "module-stats" },
  { ac: "AC-W6-FIX-7", url: "/app/settings",   marker: "module-settings" },
];

describe("AC-W6-FIX-LB: deep links per wave render the REAL module (not placeholder)", () => {
  for (const { ac, url, marker } of realRenderCases) {
    it(`${ac}: ${url} renders <div class="module ${marker}"> (no W6 placeholder text)`, async () => {
      const app = await mountRouter([url]);

      try {
        const moduleEl = app.container.querySelector(`.${marker}`);
        expect(
          moduleEl,
          `${url} did not render its module-marker '.${marker}' — host router still resolves to a placeholder/NotFound`
        ).not.toBeNull();

        expect(app.container.textContent ?? "").not.toContain(PLACEHOLDER_TEXT);
      } finally {
        await unmountApp(app);
      }
    });
  }
});

// =============================================================================
// Layer C — single-source-of-truth invariant.
// Guarantees a future change cannot reintroduce the two-array drift class.
// =============================================================================

describe("AC-W6-FIX-LC: webModuleRouteRegistrations is composed from the shell array + transitional todos shim", () => {
  it("AC-W6-FIX-LC/length: webModuleRouteRegistrations.length === webShellModuleRegistrations.length + 1", () => {
    expect(webModuleRouteRegistrations).toHaveLength(webShellModuleRegistrations.length + 1);
  });

  it("AC-W6-FIX-LC/order: shell entries come first, in shell-array order", () => {
    for (let i = 0; i < webShellModuleRegistrations.length; i += 1) {
      // Same reference — not a structural copy.
      expect(webModuleRouteRegistrations[i]).toBe(webShellModuleRegistrations[i]);
    }
  });

  it("AC-W6-FIX-LC/shim: last entry is todoWebModuleRegistration (transitional /app/todos seam)", () => {
    const last = webModuleRouteRegistrations[webModuleRouteRegistrations.length - 1];
    expect(last).toBe(todoWebModuleRegistration);
    expect(last!.moduleId).toBe("todos");
  });

  it("AC-W6-FIX-LC/unique: every moduleId in the host array is unique", () => {
    const ids = webModuleRouteRegistrations.map((r) => r.moduleId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
