/**
 * AC-SHELL-1: meditationSlotRegistration shape.
 */
import { describe, it, expect } from "vitest";
import { meditationSlotRegistration } from "../registration.js";

describe("meditationSlotRegistration", () => {
  it("AC-SHELL-1: moduleId === 'meditation'", () => {
    expect(meditationSlotRegistration.moduleId).toBe("meditation");
  });

  it("AC-SHELL-1: icon === 'leaf'", () => {
    expect(meditationSlotRegistration.icon).toBe("leaf");
  });

  it("AC-SHELL-1: railOrder === 9", () => {
    expect(meditationSlotRegistration.railOrder).toBe(9);
  });

  it("AC-SHELL-1: showInRail === true", () => {
    expect(meditationSlotRegistration.showInRail).toBe(true);
  });

  it("AC-SHELL-1: i18nKey === 'nav.meditation'", () => {
    expect(meditationSlotRegistration.i18nKey).toBe("nav.meditation");
  });

  it("AC-SHELL-1: has two children render entries (path '' and '*')", () => {
    expect(meditationSlotRegistration.children).toHaveLength(2);
    expect(meditationSlotRegistration.children[0]!.path).toBe("");
    expect(meditationSlotRegistration.children[1]!.path).toBe("*");
  });

  it("AC-SHELL-1: render function name is NOT ModuleRoutePlaceholderPage", () => {
    const renderFn = meditationSlotRegistration.children[0]!.render;
    expect(renderFn.name).not.toBe("ModuleRoutePlaceholderPage");
  });
});
