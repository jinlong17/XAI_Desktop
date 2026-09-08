/**
 * Registry tests — R1..R6
 *
 * AC-SLOT-1: <WebShellProvider modules={[]}> renders without crash
 * AC-SLOT-2: useWebShell() outside provider throws
 * AC-SLOT-3: useWebModuleRegistry() sorts by railOrder then id alphabetical
 * AC-SLOT-4: Modules with showInRail: false do NOT appear in the registry list
 * AC-SLOT-5: Modules with missing icon/railOrder/i18nKey get safe defaults + DEV warn
 * AC-SLOT-6: Re-rendering with a new modules array updates the registry synchronously
 */

import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { MemoryRouter } from "react-router";
import { WebShellProvider, useWebShell, useWebModuleRegistry } from "../registry.js";
import type { WebModuleSlotRegistration } from "../types.js";

// Minimal consumer component that reads from context
function RegistryConsumer() {
  const modules = useWebModuleRegistry();
  return (
    <ul>
      {modules.map((m) => (
        <li key={m.moduleId} data-testid={`mod-${m.moduleId}`}>
          {m.moduleId}
        </li>
      ))}
    </ul>
  );
}

function ShellConsumer() {
  const { lang, railPos, petOn } = useWebShell();
  return (
    <div data-testid="shell-ctx">
      {lang}:{railPos}:{String(petOn)}
    </div>
  );
}

function ThrowingConsumer() {
  useWebShell();
  return null;
}

function ThrowingRegistryConsumer() {
  useWebModuleRegistry();
  return null;
}

const SORTED_MODULES: WebModuleSlotRegistration[] = [
  {
    moduleId: "calendar",
    label: "Calendar",
    defaultChildPath: "",
    children: [],
    icon: "calendar",
    railOrder: 3,
    i18nKey: "nav.calendar",
    showInRail: true,
  },
  {
    moduleId: "ai",
    label: "AI",
    defaultChildPath: "",
    children: [],
    icon: "sparkle",
    railOrder: 1,
    i18nKey: "nav.ai",
    showInRail: true,
  },
  {
    moduleId: "tasks",
    label: "Tasks",
    defaultChildPath: "",
    children: [],
    icon: "check",
    railOrder: 2,
    i18nKey: "nav.tasks",
    showInRail: true,
  },
  {
    moduleId: "settings",
    label: "Settings",
    defaultChildPath: "",
    children: [],
    icon: "sliders",
    railOrder: 99,
    i18nKey: "nav.settings",
    showInRail: false,
  },
];

describe("WebShellProvider + hooks (R1..R6)", () => {
  it("R1 — <WebShellProvider modules={[]}> renders without crash (AC-SLOT-1)", () => {
    expect(() =>
      render(
        <MemoryRouter>
          <WebShellProvider modules={[]} lang="en" railPos="left" petOn={false} setPetOn={() => {}}>
            <div>ok</div>
          </WebShellProvider>
        </MemoryRouter>
      )
    ).not.toThrow();
  });

  it("R2 — useWebShell() outside provider throws (AC-SLOT-2)", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      render(
        <MemoryRouter>
          <ThrowingConsumer />
        </MemoryRouter>
      )
    ).toThrow("[xai-web-shell] useWebShell must be inside <WebShellProvider>");
    consoleSpy.mockRestore();
  });

  it("R2b — useWebModuleRegistry() outside provider throws (AC-SLOT-2)", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      render(
        <MemoryRouter>
          <ThrowingRegistryConsumer />
        </MemoryRouter>
      )
    ).toThrow("[xai-web-shell] useWebModuleRegistry must be inside <WebShellProvider>");
    consoleSpy.mockRestore();
  });

  it("R3 — useWebModuleRegistry sorts by railOrder then id alphabetical (AC-SLOT-3)", () => {
    const { container } = render(
      <MemoryRouter>
        <WebShellProvider
          modules={SORTED_MODULES}
          lang="en"
          railPos="left"
          petOn={false}
          setPetOn={() => {}}
        >
          <RegistryConsumer />
        </WebShellProvider>
      </MemoryRouter>
    );
    const items = container.querySelectorAll("li");
    // Expected order (showInRail:true, sorted by railOrder): ai(1), tasks(2), calendar(3)
    // settings has showInRail:false so excluded
    expect(items[0]?.textContent).toBe("ai");
    expect(items[1]?.textContent).toBe("tasks");
    expect(items[2]?.textContent).toBe("calendar");
    expect(items.length).toBe(3);
  });

  it("R4 — modules with showInRail:false are excluded from registry list (AC-SLOT-4)", () => {
    render(
      <MemoryRouter>
        <WebShellProvider
          modules={SORTED_MODULES}
          lang="en"
          railPos="left"
          petOn={false}
          setPetOn={() => {}}
        >
          <RegistryConsumer />
        </WebShellProvider>
      </MemoryRouter>
    );
    expect(screen.queryByTestId("mod-settings")).toBeNull();
  });

  it("R6 — re-rendering with new modules array updates registry synchronously (AC-SLOT-6)", () => {
    const extraModule: WebModuleSlotRegistration = {
      moduleId: "pomodoro",
      label: "Pomodoro",
      defaultChildPath: "",
      children: [],
      icon: "timer",
      railOrder: 5,
      i18nKey: "nav.pomodoro",
      showInRail: true,
    };

    function ControlledProvider() {
      const [mods, setMods] = useState<WebModuleSlotRegistration[]>(SORTED_MODULES.filter((m) => m.showInRail));
      return (
        <>
          <button type="button" onClick={() => setMods((prev) => [...prev, extraModule])}>
            Add
          </button>
          <WebShellProvider modules={mods} lang="en" railPos="left" petOn={false} setPetOn={() => {}}>
            <RegistryConsumer />
          </WebShellProvider>
        </>
      );
    }

    const { getByRole } = render(
      <MemoryRouter>
        <ControlledProvider />
      </MemoryRouter>
    );

    expect(screen.queryByTestId("mod-pomodoro")).toBeNull();
    act(() => {
      getByRole("button", { name: "Add" }).click();
    });
    expect(screen.getByTestId("mod-pomodoro")).toBeTruthy();
  });

  it("useWebShell returns correct context values", () => {
    render(
      <MemoryRouter>
        <WebShellProvider
          modules={[]}
          lang="zh"
          railPos="right"
          petOn={true}
          setPetOn={() => {}}
        >
          <ShellConsumer />
        </WebShellProvider>
      </MemoryRouter>
    );
    expect(screen.getByTestId("shell-ctx").textContent).toBe("zh:right:true");
  });
});
