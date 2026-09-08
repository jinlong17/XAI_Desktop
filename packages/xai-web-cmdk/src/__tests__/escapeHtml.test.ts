/**
 * escapeHtml — EH1..EH12
 * api.md §7 + test.md §3 P1
 */
import { describe, it, expect } from "vitest";
import { escapeHtml } from "../internal/escapeHtml.js";

describe("escapeHtml", () => {
  it("EH1 — empty string returns empty", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("EH2 — plain ASCII passes through unchanged", () => {
    expect(escapeHtml("hello world 123")).toBe("hello world 123");
  });

  it("EH3 — < → &lt;", () => {
    expect(escapeHtml("<")).toBe("&lt;");
    expect(escapeHtml("a<b")).toBe("a&lt;b");
  });

  it("EH4 — > → &gt;", () => {
    expect(escapeHtml(">")).toBe("&gt;");
    expect(escapeHtml("a>b")).toBe("a&gt;b");
  });

  it("EH5 — & → &amp; (and double-escape safe: &amp; becomes &amp;amp;)", () => {
    expect(escapeHtml("&")).toBe("&amp;");
    expect(escapeHtml("&amp;")).toBe("&amp;amp;");
  });

  it("EH6 — \" → &quot;", () => {
    expect(escapeHtml('"')).toBe("&quot;");
    expect(escapeHtml('say "hello"')).toBe("say &quot;hello&quot;");
  });

  it("EH7 — ' → &#39;", () => {
    expect(escapeHtml("'")).toBe("&#39;");
    expect(escapeHtml("it's")).toBe("it&#39;s");
  });

  it("EH8 — <script>alert(1)</script> fully neutralized", () => {
    const input = "<script>alert(1)</script>";
    const result = escapeHtml(input);
    expect(result).toBe("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(result).not.toContain("<script>");
    expect(result).not.toContain("</script>");
  });

  it("EH9 — surrogate pair preserved", () => {
    // 𝕳 is a surrogate pair: U+1D573
    const input = "𝕳ello";
    expect(escapeHtml(input)).toBe("𝕳ello");
  });

  it("EH10 — RTL marker ‏ preserved", () => {
    // U+200F RIGHT-TO-LEFT MARK
    const rtlMark = "‏";
    const input = `${rtlMark}hello`;
    expect(escapeHtml(input)).toBe(`${rtlMark}hello`);
  });

  it("EH11 — NUL byte preserved", () => {
    const input = "hello\x00world";
    expect(escapeHtml(input)).toBe("hello\x00world");
  });

  it("EH12 — very long string (10k chars) handled without crash", () => {
    const base = "<script>alert(1)</script>&'\">";
    const input = base.repeat(Math.ceil(10000 / base.length)).slice(0, 10000);
    const result = escapeHtml(input);
    expect(result).toBeTruthy();
    expect(result).not.toContain("<script>");
    expect(result.length).toBeGreaterThan(10000); // expanded by entity substitutions
  });
});
