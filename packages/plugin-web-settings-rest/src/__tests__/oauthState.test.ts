/**
 * OS1..OS7 — OAuth state machine tests (test.md §5.3 P1)
 */
import { describe, it, expect, afterEach } from "vitest";
import { startOAuth, validateAndConsumeState, OAUTH_STATE_TTL_MS } from "../internal/oauthState.js";

afterEach(() => {
  sessionStorage.clear();
});

describe("OAuth state machine", () => {
  it("OS1: startOAuth writes sessionStorage key xai_oauth_pending_<id> with parseable JSON", async () => {
    await startOAuth("notion");
    const raw = sessionStorage.getItem("xai_oauth_pending_notion");
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed).toHaveProperty("state");
    expect(parsed).toHaveProperty("codeVerifier");
    expect(parsed).toHaveProperty("expiresAt");
  });

  it("OS2: startOAuth returns state with <providerId>. prefix", async () => {
    const pending = await startOAuth("gcal");
    expect(pending.state).toMatch(/^gcal\./);
  });

  it("OS3: startOAuth sets expiresAt ≈ now + 10min", async () => {
    const before = Date.now();
    const pending = await startOAuth("linear");
    const after = Date.now();

    expect(pending.expiresAt).toBeGreaterThanOrEqual(before + OAUTH_STATE_TTL_MS);
    expect(pending.expiresAt).toBeLessThanOrEqual(after + OAUTH_STATE_TTL_MS);
  });

  it("OS4: validateAndConsumeState returns the state on valid roundtrip", async () => {
    const pending = await startOAuth("notion");
    const result = validateAndConsumeState(pending.state);
    expect(result).not.toBeNull();
    expect(result?.state).toBe(pending.state);
    expect(result?.codeVerifier).toBe(pending.codeVerifier);
  });

  it("OS5: validateAndConsumeState returns null on TTL expiry", async () => {
    // Write a manually expired entry
    const key = "xai_oauth_pending_gcal";
    const expired = {
      state: "gcal.expiredtoken",
      codeVerifier: "abc",
      expiresAt: Date.now() - 1000, // already expired
    };
    sessionStorage.setItem(key, JSON.stringify(expired));

    const result = validateAndConsumeState("gcal.expiredtoken");
    expect(result).toBeNull();
  });

  it("OS6: validateAndConsumeState returns null on providerId-prefix mismatch", async () => {
    const pending = await startOAuth("notion");
    // Tamper the state prefix to point to a different provider
    const tamperedState = "linear." + pending.state.slice(pending.state.indexOf(".") + 1);
    const result = validateAndConsumeState(tamperedState);
    expect(result).toBeNull();
  });

  it("OS7: validateAndConsumeState clears sessionStorage entry even on failure", async () => {
    // Write a valid entry (result not needed — called for sessionStorage side-effect)
    await startOAuth("linear");
    expect(sessionStorage.getItem("xai_oauth_pending_linear")).not.toBeNull();

    // Attempt validation with wrong state (will fail)
    validateAndConsumeState("linear.wrongtoken");

    // The sessionStorage entry should be cleared
    expect(sessionStorage.getItem("xai_oauth_pending_linear")).toBeNull();
  });
});
