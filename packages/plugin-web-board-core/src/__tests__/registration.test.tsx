import { describe, expect, test } from "vitest";
import { boardCoreWebModuleRegistration } from "../registration.js";

describe("registration", () => {
  test("RG1 moduleId === 'board'", () => {
    expect(boardCoreWebModuleRegistration.moduleId).toBe("board");
  });

  test("RG2 railOrder === 3", () => {
    expect(boardCoreWebModuleRegistration.railOrder).toBe(3);
  });

  test("RG3 icon === 'kanban'", () => {
    expect(boardCoreWebModuleRegistration.icon).toBe("kanban");
  });

  test("RG4 showInRail === true", () => {
    expect(boardCoreWebModuleRegistration.showInRail).toBe(true);
  });

  test("RG5 i18nKey === 'nav.board'", () => {
    expect(boardCoreWebModuleRegistration.i18nKey).toBe("nav.board");
  });

  test("RG6 children includes a render fn at path '' and '*'", () => {
    const paths = boardCoreWebModuleRegistration.children.map((c) => c.path);
    expect(paths).toEqual(["", "*"]);
    for (const child of boardCoreWebModuleRegistration.children) {
      expect(typeof child.render).toBe("function");
    }
  });

  test("RG7 label === 'Boards'", () => {
    expect(boardCoreWebModuleRegistration.label).toBe("Boards");
  });

  test("RG8 defaultChildPath === ''", () => {
    expect(boardCoreWebModuleRegistration.defaultChildPath).toBe("");
  });
});
