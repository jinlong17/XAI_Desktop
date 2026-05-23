/**
 * makeConvoFromUserText pure-helper tests.
 *
 * Design: packages/xai-web-ai-chat/docs/test.md §3 — M
 */

import { describe, it, expect } from "vitest";
import { makeConvoFromUserText, TITLE_MAX_LEN } from "../internal/makeConvoFromUserText.js";

describe("makeConvoFromUserText (M)", () => {
  it("M1: id starts with 'c-'", () => {
    expect(makeConvoFromUserText("hi", "en").id.startsWith("c-")).toBe(true);
  });

  it("M2: title equals text.slice(0, 32) for short input", () => {
    expect(makeConvoFromUserText("hello world", "en").title).toBe("hello world");
  });

  it("M3: title at 0 chars yields empty string (caller must short-circuit empty sends)", () => {
    expect(makeConvoFromUserText("", "en").title).toBe("");
  });

  it("M4: title at exactly 32 chars stays 32", () => {
    const text32 = "a".repeat(TITLE_MAX_LEN);
    expect(makeConvoFromUserText(text32, "en").title.length).toBe(TITLE_MAX_LEN);
  });

  it("M5: title at 64 chars truncates to 32", () => {
    const text64 = "a".repeat(TITLE_MAX_LEN * 2);
    expect(makeConvoFromUserText(text64, "en").title.length).toBe(TITLE_MAX_LEN);
  });

  it("M6: time = 'Just now' when lang='en'", () => {
    expect(makeConvoFromUserText("x", "en").time).toBe("Just now");
  });

  it("M7: time = '刚刚' when lang='zh'", () => {
    expect(makeConvoFromUserText("x", "zh").time).toBe("刚刚");
  });
});
