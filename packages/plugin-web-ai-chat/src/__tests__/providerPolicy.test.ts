import { describe, expect, it } from "vitest";
import {
  WEB_RUNTIME_PROFILE_DESKTOP_PHASE1_OFFLINE,
  WEB_RUNTIME_PROFILE_WEB_LIVE,
} from "@repo/core";
import {
  policySnapshotToLlmError,
  resolveAiProviderPolicy,
} from "../internal/providerPolicy.js";

describe("providerPolicy resolver", () => {
  it("PP1: anthropic without key -> key_required", () => {
    const snapshot = resolveAiProviderPolicy({
      provider: "anthropic",
      baseUrl: "",
      hasSavedKey: false,
      runtimeProfile: WEB_RUNTIME_PROFILE_WEB_LIVE,
      isOnline: true,
    });
    expect(snapshot.state).toBe("key_required");
    expect(snapshot.reason).toBe("missing_key");
    expect(snapshot.sendEnabled).toBe(false);
    expect(snapshot.testEnabled).toBe(false);
  });

  it("PP2: anthropic with key but desktop offline profile -> network_required", () => {
    const snapshot = resolveAiProviderPolicy({
      provider: "anthropic",
      baseUrl: "",
      hasSavedKey: true,
      runtimeProfile: WEB_RUNTIME_PROFILE_DESKTOP_PHASE1_OFFLINE,
      isOnline: true,
    });
    expect(snapshot.state).toBe("network_required");
    expect(snapshot.reason).toBe("offline_runtime");
  });

  it("PP3: openai-compatible without base url -> base_url_required", () => {
    const snapshot = resolveAiProviderPolicy({
      provider: "openai-compatible",
      baseUrl: "",
      hasSavedKey: true,
      runtimeProfile: WEB_RUNTIME_PROFILE_WEB_LIVE,
      isOnline: true,
    });
    expect(snapshot.state).toBe("base_url_required");
    expect(snapshot.reason).toBe("missing_base_url");
  });

  it("PP4: openai-compatible loopback url -> local_provider_not_enabled", () => {
    const snapshot = resolveAiProviderPolicy({
      provider: "openai-compatible",
      baseUrl: "http://127.0.0.1:11434/v1",
      hasSavedKey: true,
      runtimeProfile: WEB_RUNTIME_PROFILE_WEB_LIVE,
      isOnline: true,
    });
    expect(snapshot.state).toBe("local_provider_not_enabled");
    expect(snapshot.reason).toBe("loopback_local_provider_deferred");
    expect(snapshot.isLocalCandidate).toBe(true);
  });

  it("PP5: openai-compatible remote url with key and online -> ready", () => {
    const snapshot = resolveAiProviderPolicy({
      provider: "openai-compatible",
      baseUrl: "https://api.example.com/v1",
      hasSavedKey: true,
      runtimeProfile: WEB_RUNTIME_PROFILE_WEB_LIVE,
      isOnline: true,
    });
    expect(snapshot.state).toBe("ready");
    expect(snapshot.reason).toBe("ready");
    expect(snapshot.sendEnabled).toBe(true);
    expect(snapshot.testEnabled).toBe(true);
  });

  it("PP6: policySnapshotToLlmError maps deferred local provider to BadKey 403", () => {
    const snapshot = resolveAiProviderPolicy({
      provider: "openai-compatible",
      baseUrl: "http://localhost:11434/v1",
      hasSavedKey: true,
      runtimeProfile: WEB_RUNTIME_PROFILE_WEB_LIVE,
      isOnline: true,
    });
    const err = policySnapshotToLlmError(snapshot);
    expect(err).toMatchObject({
      kind: "BadKey",
      status: 403,
      detail: "local-provider-not-enabled",
    });
  });
});
