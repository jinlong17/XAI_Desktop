import type { WebModuleRouteRegistration } from "@repo/core/types";
import { describe, expect, it } from "vitest";
import {
  assertUniqueModuleRegistrations,
  resolveDefaultModulePath,
  resolveModuleRouteMatch,
} from "./buildModuleRoutes";

const NullComponent = () => null;

function createRegistration(moduleId: string, childPaths: string[]): WebModuleRouteRegistration {
  return {
    moduleId,
    label: moduleId,
    defaultChildPath: "inbox",
    children: childPaths.map((path) => ({ path, render: NullComponent })),
  };
}

describe("buildModuleRoutes", () => {
  it("throws for duplicate module registrations", () => {
    expect(() =>
      assertUniqueModuleRegistrations([
        createRegistration("todos", ["", "*"]),
        createRegistration("todos", ["", "*"]),
      ])
    ).toThrowError("duplicate_module_registration:todos");
  });

  it("resolves default module redirect path from first registration", () => {
    const path = resolveDefaultModulePath([
      createRegistration("todos", ["", "*"]),
      createRegistration("projects", ["", "*"]),
    ]);

    expect(path).toBe("/app/todos/inbox");
  });

  it("matches exact module child route", () => {
    const match = resolveModuleRouteMatch(
      [createRegistration("todos", ["", "inbox", "*"])],
      "todos",
      "inbox"
    );

    expect(match?.moduleId).toBe("todos");
    expect(match?.childPath).toBe("inbox");
  });

  it("matches wildcard child route when exact path is missing", () => {
    const match = resolveModuleRouteMatch(
      [createRegistration("todos", ["", "*"])],
      "todos",
      "deep/child"
    );

    expect(match?.moduleId).toBe("todos");
    expect(match?.childPath).toBe("deep/child");
  });

  it("returns null for unknown module", () => {
    const match = resolveModuleRouteMatch(
      [createRegistration("todos", ["", "*"])],
      "labels",
      "inbox"
    );

    expect(match).toBeNull();
  });
});
