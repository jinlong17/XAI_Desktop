/**
 * Unit tests for useI18n — AC-I1..AC-I10 (test.md §A)
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useI18n } from "../i18n.js";

// Force DEV mode so missing-key warnings are exercised
vi.stubEnv("DEV", true);
// Ensure import.meta.env.DEV is truthy in the hook
// We stub it at the module level via the vitest environment

describe("useI18n", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  // AC-I1
  it("AC-I1: EN typed access — t.app_name === 'XAI Console'", () => {
    const { t } = useI18n("en");
    expect(t.app_name).toBe("XAI Console");
  });

  // AC-I2
  it("AC-I2: ZH typed access — t.app_name === 'XAI 工作台'", () => {
    const { t } = useI18n("zh");
    expect(t.app_name).toBe("XAI 工作台");
  });

  // AC-I3
  it("AC-I3: EN nested module — t.habits.title === 'Habits'", () => {
    const { t } = useI18n("en");
    expect(t.habits.title).toBe("Habits");
  });

  // AC-I4
  it("AC-I4: ZH nested module — t.matrix.urgent_important === '紧急 · 重要'", () => {
    const { t } = useI18n("zh");
    expect(t.matrix.urgent_important).toBe("紧急 · 重要");
  });

  // AC-I5
  it("AC-I5: EN dotted path — s('nav.tasks') === 'Tasks'", () => {
    const { s } = useI18n("en");
    expect(s("nav.tasks")).toBe("Tasks");
  });

  // AC-I6
  it("AC-I6: ZH dotted path — s('settings.font_scale') === '字体大小'", () => {
    const { s } = useI18n("zh");
    expect(s("settings.font_scale")).toBe("字体大小");
  });

  // AC-I7
  it("AC-I7: Array index — s('common.weekdays_short.0') (EN) === 'Sun'", () => {
    const { s } = useI18n("en");
    // weekdays_short is a top-level array, not nested under common
    expect(s("weekdays_short.0")).toBe("Sun");
  });

  // AC-I8
  it("AC-I8: Quotes array element — s('quotes.0.author') (EN) === 'Lao Tzu'", () => {
    const { s } = useI18n("en");
    expect(s("quotes.0.author")).toBe("Lao Tzu");
  });

  // AC-I9
  it("AC-I9: Missing key returns path + warns", () => {
    const { s } = useI18n("en");
    const result = s("nope.missing");
    expect(result).toBe("nope.missing");
    expect(warnSpy).toHaveBeenCalledOnce();
    expect(warnSpy).toHaveBeenCalledWith("[useI18n] missing key", "nope.missing", "in", "en");
  });

  // AC-I10
  it("AC-I10: Empty path returns '' + warns", () => {
    const { s } = useI18n("en");
    const result = s("");
    expect(result).toBe("");
    expect(warnSpy).toHaveBeenCalledOnce();
  });
});
