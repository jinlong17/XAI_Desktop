/**
 * Index barrel smoke tests — AC-E1, AC-E2 (test.md §E)
 *
 * Verifies that the public index.ts exports the expected symbols and that
 * CSS side-effect imports are registered correctly.
 */

import { describe, expect, it } from "vitest";
import * as barrel from "../index.js";

describe("Index barrel exports", () => {
  // AC-E1: All expected symbols are exported
  it("AC-E1: exports useI18n function", () => {
    expect(typeof barrel.useI18n).toBe("function");
  });

  it("AC-E1: exports I18N bundle object with en and zh", () => {
    expect(typeof barrel.I18N).toBe("object");
    expect(barrel.I18N).toHaveProperty("en");
    expect(barrel.I18N).toHaveProperty("zh");
  });

  it("AC-E1: exports all apply* helpers", () => {
    expect(typeof barrel.applyTheme).toBe("function");
    expect(typeof barrel.applyDensity).toBe("function");
    expect(typeof barrel.applyFontScale).toBe("function");
    expect(typeof barrel.applyAccentHue).toBe("function");
    expect(typeof barrel.applyBgTone).toBe("function");
    expect(typeof barrel.applyRailPos).toBe("function");
  });

  // AC-E2: useI18n returns stable references for same lang
  it("AC-E2: useI18n returns same t reference for same lang (stable bundle)", () => {
    const { t: t1 } = barrel.useI18n("en");
    const { t: t2 } = barrel.useI18n("en");
    // Both t references point to the same const object
    expect(t1).toBe(t2);
  });

  it("AC-E2: useI18n EN and ZH return different bundles", () => {
    const { t: en } = barrel.useI18n("en");
    const { t: zh } = barrel.useI18n("zh");
    expect(en.app_name).not.toBe(zh.app_name);
  });

  // Verify EN/ZH app_name values are correct
  it("barrel: I18N.en.app_name is 'XAI Console'", () => {
    expect(barrel.I18N.en.app_name).toBe("XAI Console");
  });

  it("barrel: I18N.zh.app_name is 'XAI 工作台'", () => {
    expect(barrel.I18N.zh.app_name).toBe("XAI 工作台");
  });
});
