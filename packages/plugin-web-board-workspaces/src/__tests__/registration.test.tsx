/**
 * REG1..REG6 — registration surface.
 */

import { describe, it, expect } from "vitest";
import { boardWorkspacesWebModuleRegistration } from "../registration.js";

describe("boardWorkspacesWebModuleRegistration (REG1..REG6)", () => {
  it("REG1: moduleId === 'board'", () => {
    expect(boardWorkspacesWebModuleRegistration.moduleId).toBe("board");
  });

  it("REG2: railOrder === 3", () => {
    expect(boardWorkspacesWebModuleRegistration.railOrder).toBe(3);
  });

  it("REG3: icon === 'kanban'", () => {
    expect(boardWorkspacesWebModuleRegistration.icon).toBe("kanban");
  });

  it("REG4: i18nKey === 'nav.board'", () => {
    expect(boardWorkspacesWebModuleRegistration.i18nKey).toBe("nav.board");
  });

  it("REG5: showInRail === true", () => {
    expect(boardWorkspacesWebModuleRegistration.showInRail).toBe(true);
  });

  it("REG6: children array has '' + '*' routes with render functions", () => {
    const { children } = boardWorkspacesWebModuleRegistration;
    expect(children).toHaveLength(2);
    expect(children[0]!.path).toBe("");
    expect(typeof children[0]!.render).toBe("function");
    expect(children[1]!.path).toBe("*");
    expect(typeof children[1]!.render).toBe("function");
  });
});
