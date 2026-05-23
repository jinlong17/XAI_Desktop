// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import {
  applyNonceToStyleElement,
  createNonceStyleElement,
  NONCE_HTML_ATTRIBUTE,
  NONCE_META_NAME,
  readRuntimeNonce,
  requireRuntimeNonce,
} from "./nonce";

describe("nonce helpers", () => {
  it("extracts nonce from meta seam first", () => {
    document.head.innerHTML = `<meta name="${NONCE_META_NAME}" content="nonce-from-meta" />`;
    document.documentElement.setAttribute(NONCE_HTML_ATTRIBUTE, "nonce-from-html");

    const nonce = readRuntimeNonce(document);
    expect(nonce).toEqual({ value: "nonce-from-meta", source: "meta" });
  });

  it("extracts nonce from html token seam", () => {
    document.head.innerHTML = "";
    document.documentElement.setAttribute(NONCE_HTML_ATTRIBUTE, "nonce-from-html");

    const nonce = requireRuntimeNonce(document);
    expect(nonce).toEqual({ value: "nonce-from-html", source: "html-token" });
  });

  it("applies nonce to runtime-created style elements", () => {
    document.head.innerHTML = `<meta name="${NONCE_META_NAME}" content="nonce-from-meta" />`;
    const style = createNonceStyleElement(document, "body { color: red; }");

    expect(style.getAttribute("nonce")).toBe("nonce-from-meta");
    expect(style.textContent).toContain("color: red");

    const manualStyle = document.createElement("style");
    applyNonceToStyleElement(manualStyle, { value: "manual", source: "meta" });
    expect(manualStyle.getAttribute("nonce")).toBe("manual");
  });

  it("throws when runtime nonce is missing", () => {
    document.head.innerHTML = "";
    document.documentElement.removeAttribute(NONCE_HTML_ATTRIBUTE);
    expect(() => requireRuntimeNonce(document)).toThrowError("missing_runtime_nonce");
  });
});
