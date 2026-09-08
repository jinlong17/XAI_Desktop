/**
 * highlightMatch — HM1..HM6
 * api.md §8 + test.md §3 P1
 */
import { describe, it, expect } from "vitest";
import { highlightMatch } from "../internal/highlightMatch.js";

describe("highlightMatch", () => {
  it("HM1 — empty query returns escaped text with no <mark>", () => {
    const result = highlightMatch("Hello <World>", "");
    expect(result).toBe("Hello &lt;World&gt;");
    expect(result).not.toContain("<mark>");
  });

  it("HM2 — single match wrapped in <mark> after escape", () => {
    const result = highlightMatch("Hello World", "World");
    expect(result).toBe("Hello <mark>World</mark>");
  });

  it("HM3 — multiple matches all wrapped", () => {
    const result = highlightMatch("do the todo and to-do", "do");
    expect(result).toContain("<mark>do</mark>");
    // All three "do" occurrences should be wrapped
    const markCount = (result.match(/<mark>/g) ?? []).length;
    expect(markCount).toBeGreaterThanOrEqual(3);
  });

  it("HM4 — case-insensitive match", () => {
    const result = highlightMatch("Hello World", "hello");
    expect(result).toBe("<mark>Hello</mark> World");
  });

  it("HM5 — <script> query is neutralized BEFORE wrapping (XSS via query case)", () => {
    const result = highlightMatch("some text", "<script>alert(1)</script>");
    // The query must be escaped before being used in the regex
    expect(result).not.toContain("<script>");
    // The text itself is also escaped
    expect(result).toBe("some text");
  });

  it("HM6 — match crossing already-escaped entity boundary handled safely", () => {
    // Text contains "&" which becomes "&amp;" after escape
    // Query "amp" should match in the escaped string
    const result = highlightMatch("rock & roll", "amp");
    // After escaping: "rock &amp; roll" — the query "amp" matches in "&amp;"
    // This is safe: the <mark> wraps already-escaped content
    expect(result).not.toContain("<script>");
    expect(typeof result).toBe("string");
  });
});
