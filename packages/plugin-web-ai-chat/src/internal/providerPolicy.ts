import {
  isDesktopPhase1OfflineRuntime,
  type WebRuntimeProfile,
} from "@repo/core";
import type { AiProvider } from "./secretStore.js";
import type { LlmError } from "./llmErrors.js";

export type AiConfiguredProvider = AiProvider;

export type AiProviderPolicyState =
  | "ready"
  | "network_required"
  | "key_required"
  | "base_url_required"
  | "local_provider_not_enabled";

export type AiProviderPolicyReason =
  | "ready"
  | "offline_runtime"
  | "browser_offline"
  | "missing_key"
  | "missing_base_url"
  | "loopback_local_provider_deferred";

export interface ResolveAiProviderPolicyInput {
  provider: AiConfiguredProvider;
  baseUrl: string;
  hasSavedKey: boolean;
  runtimeProfile: WebRuntimeProfile;
  isOnline: boolean;
}

export interface AiProviderPolicySnapshot {
  provider: AiConfiguredProvider;
  state: AiProviderPolicyState;
  sendEnabled: boolean;
  testEnabled: boolean;
  isLocalCandidate: boolean;
  reason: AiProviderPolicyReason;
}

function isLoopbackOrLocalBaseUrl(rawBaseUrl: string): boolean {
  const trimmed = rawBaseUrl.trim();
  if (!trimmed) return false;
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return false;
  }
  const hostname = parsed.hostname.toLowerCase();
  if (
    hostname === "localhost" ||
    hostname === "0.0.0.0" ||
    hostname === "::1" ||
    hostname.endsWith(".local")
  ) {
    return true;
  }
  return /^127\./.test(hostname);
}

export function readBrowserOnlineState(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine !== false;
}

export function resolveAiProviderPolicy(
  input: ResolveAiProviderPolicyInput,
): AiProviderPolicySnapshot {
  const { provider, baseUrl, hasSavedKey, runtimeProfile, isOnline } = input;
  const isLocalCandidate =
    provider === "openai-compatible" && isLoopbackOrLocalBaseUrl(baseUrl);

  if (provider === "openai-compatible" && !baseUrl.trim()) {
    return {
      provider,
      state: "base_url_required",
      sendEnabled: false,
      testEnabled: false,
      isLocalCandidate: false,
      reason: "missing_base_url",
    };
  }

  if (isLocalCandidate) {
    return {
      provider,
      state: "local_provider_not_enabled",
      sendEnabled: false,
      testEnabled: false,
      isLocalCandidate: true,
      reason: "loopback_local_provider_deferred",
    };
  }

  if (!hasSavedKey) {
    return {
      provider,
      state: "key_required",
      sendEnabled: false,
      testEnabled: false,
      isLocalCandidate: false,
      reason: "missing_key",
    };
  }

  if (isDesktopPhase1OfflineRuntime(runtimeProfile)) {
    return {
      provider,
      state: "network_required",
      sendEnabled: false,
      testEnabled: false,
      isLocalCandidate: false,
      reason: "offline_runtime",
    };
  }

  if (!isOnline) {
    return {
      provider,
      state: "network_required",
      sendEnabled: false,
      testEnabled: false,
      isLocalCandidate: false,
      reason: "browser_offline",
    };
  }

  return {
    provider,
    state: "ready",
    sendEnabled: true,
    testEnabled: true,
    isLocalCandidate: false,
    reason: "ready",
  };
}

export function policySnapshotToLlmError(
  snapshot: AiProviderPolicySnapshot,
): LlmError {
  switch (snapshot.state) {
    case "key_required":
      return { kind: "BadKey", status: 401, detail: "not-set" };
    case "base_url_required":
      return { kind: "BadKey", status: 401, detail: "no-url-configured" };
    case "local_provider_not_enabled":
      return { kind: "BadKey", status: 403, detail: "local-provider-not-enabled" };
    case "network_required":
      return {
        kind: "Network",
        cause: new Error(snapshot.reason),
        detail: snapshot.reason,
      };
    case "ready":
      return {
        kind: "Server",
        status: 0,
        body: "policySnapshotToLlmError called for ready policy",
      };
  }
}
