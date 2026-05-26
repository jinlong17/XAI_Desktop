/**
 * PK1..PK8 — PKCE helper tests (test.md §5.3 P1)
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { generateCodeVerifier, computeCodeChallenge, base64UrlEncode } from "../internal/pkce.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("PKCE helpers", () => {
  it("PK1: generateCodeVerifier returns a string", () => {
    const verifier = generateCodeVerifier();
    expect(typeof verifier).toBe("string");
  });

  it("PK2: code_verifier is 43 chars (32 bytes → base64url, no padding)", () => {
    const verifier = generateCodeVerifier();
    expect(verifier.length).toBe(43);
  });

  it("PK3: code_verifier charset matches [A-Za-z0-9_-]", () => {
    const verifier = generateCodeVerifier();
    expect(verifier).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("PK4: two consecutive calls produce different verifiers (entropy smoke)", () => {
    const v1 = generateCodeVerifier();
    const v2 = generateCodeVerifier();
    expect(v1).not.toBe(v2);
  });

  it("PK5: computeCodeChallenge produces correct base64url(SHA-256(verifier)) — RFC 7636 §B.1 vector", async () => {
    // RFC 7636 §B.1 test vector:
    // code_verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"
    // code_challenge = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"
    const verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
    const challenge = await computeCodeChallenge(verifier);
    expect(challenge).toBe("E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM");
  });

  it("PK6: code_challenge is 43 chars", async () => {
    const verifier = generateCodeVerifier();
    const challenge = await computeCodeChallenge(verifier);
    expect(challenge.length).toBe(43);
  });

  it("PK7: base64UrlEncode produces no = padding", () => {
    const bytes = new Uint8Array([1, 2, 3, 4, 5]);
    const result = base64UrlEncode(bytes);
    expect(result).not.toContain("=");
  });

  it("PK8: base64UrlEncode replaces + with - and / with _", () => {
    // Craft bytes that produce + and / in standard base64
    // 0xFB = 11111011, 0xFF = 11111111, 0xFF = 11111111 → "+///" in base64
    const bytes = new Uint8Array([0xfb, 0xff, 0xff]);
    const result = base64UrlEncode(bytes);
    expect(result).not.toContain("+");
    expect(result).not.toContain("/");
    expect(result).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});
