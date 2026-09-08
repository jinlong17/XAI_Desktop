/**
 * BU1..BU6 — buildAuthorizeUrl tests (test.md §5.3 P2)
 */
import { describe, it, expect, afterEach } from "vitest";
import { buildAuthorizeUrl } from "../internal/buildAuthorizeUrl.js";
import { PROVIDERS } from "../internal/integrationProviders.js";
import type { PendingOAuthState } from "../internal/oauthState.js";

afterEach(() => {
  sessionStorage.clear();
});

const notionProvider = PROVIDERS.find((p) => p.id === "notion")!;
const gcalProvider = PROVIDERS.find((p) => p.id === "gcal")!;
const linearProvider = PROVIDERS.find((p) => p.id === "linear")!;

const STUB_PENDING: PendingOAuthState = {
  state: "notion.teststatevalue123",
  codeVerifier: "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk",
  expiresAt: Date.now() + 600_000,
};

describe("buildAuthorizeUrl", () => {
  it("BU1: output URL starts with provider.authorizeUrl", async () => {
    const url = await buildAuthorizeUrl(notionProvider, STUB_PENDING);
    expect(url).toMatch(new RegExp(`^${notionProvider.authorizeUrl}`));
  });

  it("BU2: URL includes code_challenge_method=S256", async () => {
    const url = await buildAuthorizeUrl(notionProvider, STUB_PENDING);
    expect(decodeURIComponent(url)).toContain("code_challenge_method=S256");
  });

  it("BU3: URL includes URL-encoded redirect_uri", async () => {
    const url = await buildAuthorizeUrl(notionProvider, STUB_PENDING);
    // redirect_uri should be encoded — check for encoded slash or its presence
    expect(url).toContain("redirect_uri=");
    expect(url).toContain("settings%2Fintegrations%2Fcallback");
  });

  it("BU4: URL includes the state from pendingState", async () => {
    const url = await buildAuthorizeUrl(notionProvider, STUB_PENDING);
    expect(url).toContain(`state=${encodeURIComponent(STUB_PENDING.state)}`);
  });

  it("BU5: URL includes the code_challenge derived from codeVerifier", async () => {
    const url = await buildAuthorizeUrl(notionProvider, STUB_PENDING);
    // RFC 7636 §B.1: verifier dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk
    //                → challenge E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM
    expect(url).toContain("code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM");
  });

  it("BU6: URL encodes provider.scopes as space-separated scope= param", async () => {
    const pendingGcal: PendingOAuthState = {
      ...STUB_PENDING,
      state: "gcal.teststatevalue123",
    };
    const url = await buildAuthorizeUrl(gcalProvider, pendingGcal);
    const expectedScope = encodeURIComponent(
      "https://www.googleapis.com/auth/calendar.readonly",
    );
    expect(url).toContain(`scope=${expectedScope}`);

    // Linear has scope "read"
    const pendingLinear: PendingOAuthState = {
      ...STUB_PENDING,
      state: "linear.teststatevalue123",
    };
    const linearUrl = await buildAuthorizeUrl(linearProvider, pendingLinear);
    expect(linearUrl).toContain("scope=read");
  });
});
