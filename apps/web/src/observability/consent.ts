import type { ObservabilityConsentState } from "./types";

export const OBSERVABILITY_CONSENT_KEY = "xai:web:observability-consent";

const VALID_CONSENT = new Set<ObservabilityConsentState>(["unknown", "granted", "denied"]);

export function resolveObservabilityConsent(raw: string | null | undefined): ObservabilityConsentState {
  if (!raw) {
    return "unknown";
  }

  const normalized = raw.trim().toLowerCase();
  return VALID_CONSENT.has(normalized as ObservabilityConsentState)
    ? (normalized as ObservabilityConsentState)
    : "unknown";
}

export function readObservabilityConsent(storage?: Pick<Storage, "getItem"> | null): ObservabilityConsentState {
  if (!storage) {
    return "unknown";
  }

  return resolveObservabilityConsent(storage.getItem(OBSERVABILITY_CONSENT_KEY));
}
