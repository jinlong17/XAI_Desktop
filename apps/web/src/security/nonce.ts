export interface RuntimeNonceSource {
  value: string;
  source: "meta" | "html-token";
}

export const NONCE_META_NAME = "xai-csp-nonce";
export const NONCE_HTML_ATTRIBUTE = "data-csp-nonce";

export function readRuntimeNonce(doc: Document): RuntimeNonceSource | null {
  const meta = doc.querySelector(`meta[name="${NONCE_META_NAME}"]`);
  const metaValue = meta?.getAttribute("content")?.trim();
  if (metaValue) {
    return { value: metaValue, source: "meta" };
  }

  const htmlValue = doc.documentElement.getAttribute(NONCE_HTML_ATTRIBUTE)?.trim();
  if (htmlValue) {
    return { value: htmlValue, source: "html-token" };
  }

  return null;
}

export function requireRuntimeNonce(doc: Document): RuntimeNonceSource {
  const nonce = readRuntimeNonce(doc);
  if (!nonce) {
    throw new Error("missing_runtime_nonce");
  }

  return nonce;
}

export function applyNonceToStyleElement(style: HTMLStyleElement, nonce: RuntimeNonceSource): HTMLStyleElement {
  style.setAttribute("nonce", nonce.value);
  return style;
}

export function createNonceStyleElement(doc: Document, cssText: string): HTMLStyleElement {
  const nonce = requireRuntimeNonce(doc);
  const style = doc.createElement("style");
  style.textContent = cssText;
  return applyNonceToStyleElement(style, nonce);
}
