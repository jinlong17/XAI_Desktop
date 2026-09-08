/**
 * registration.test.tsx — T-REG-1 (P2), T-REG-2 (P3 extended)
 *
 * T-REG-1: static shape of tasksWebModuleRegistration.
 * T-REG-2: mounting TasksModuleRoute inside WebShellProvider renders EN sidebar heading.
 * Phase: P2 (T-REG-1) / P3 (T-REG-2)
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { WebShellProvider } from "@repo/xai-web-shell";
import { tasksWebModuleRegistration } from "../registration.js";

describe("tasksWebModuleRegistration", () => {
  // T-REG-1: static shape
  it("T-REG-1: moduleId === tasks, railOrder === 2, icon === check, showInRail === true, i18nKey === nav.tasks", () => {
    expect(tasksWebModuleRegistration.moduleId).toBe("tasks");
    expect(tasksWebModuleRegistration.railOrder).toBe(2);
    expect(tasksWebModuleRegistration.icon).toBe("check");
    expect(tasksWebModuleRegistration.showInRail).toBe(true);
    expect(tasksWebModuleRegistration.i18nKey).toBe("nav.tasks");
  });

  it("T-REG-1b: defaultChildPath is empty string", () => {
    expect(tasksWebModuleRegistration.defaultChildPath).toBe("");
  });

  it("T-REG-1c: children has path:'' and path:'*' rows", () => {
    const paths = tasksWebModuleRegistration.children.map((c) => c.path);
    expect(paths).toContain("");
    expect(paths).toContain("*");
    expect(paths).toHaveLength(2);
  });

  it("T-REG-1d: each child has a render function", () => {
    for (const child of tasksWebModuleRegistration.children) {
      expect(typeof child.render).toBe("function");
    }
  });
});

// ---------------------------------------------------------------------------
// T-REG-2 — mounting TasksModuleRoute via WebShellProvider (P3)
// ---------------------------------------------------------------------------

describe("tasksWebModuleRegistration — T-REG-2 RTL render", () => {
  it("T-REG-2: TasksModuleRoute inside WebShellProvider renders EN Tasks heading", () => {
    // Cast to a no-props component for testing — TasksModuleRoute reads lang
    // from useWebShell() context, so route-level props are not consumed.
    const TasksModuleRoute = tasksWebModuleRegistration.children[0]!.render as React.ComponentType;
    render(
      <WebShellProvider
        modules={[tasksWebModuleRegistration]}
        lang="en"
        railPos="left"
        petOn={false}
        setPetOn={() => {}}
      >
        <TasksModuleRoute />
      </WebShellProvider>,
    );
    // The module title h1 should read "All" (tasks.all in EN)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("All");
  });
});
