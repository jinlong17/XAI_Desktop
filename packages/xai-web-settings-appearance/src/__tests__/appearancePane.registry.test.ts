/**
 * AC-REG-1..AC-REG-4 — pane registry entry surface.
 */
import { describe, it, expect } from "vitest";
import * as React from "react";
import { appearancePane } from "../internal/appearancePane.js";

describe("appearancePane registry entry", () => {
  it("AC-REG-1: id === 'appearance'", () => {
    expect(appearancePane.id).toBe("appearance");
  });

  it("AC-REG-2: i18nKey === 'settings.appearance'", () => {
    expect(appearancePane.i18nKey).toBe("settings.appearance");
  });

  it("AC-REG-3: icon === 'sun' (valid WebShellIconName matching chassis placeholder)", () => {
    expect(appearancePane.icon).toBe("sun");
  });

  it("AC-REG-4: render({ lang: 'en' }) returns a React element for <AppearancePane lang='en' />", () => {
    const el = appearancePane.render({ lang: "en" });
    expect(React.isValidElement(el)).toBe(true);
  });
});
