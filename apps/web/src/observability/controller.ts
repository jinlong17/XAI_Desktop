import type { ObservabilityConsentState, ObservabilityEvent, ObservabilityTransport } from "./types";

const NOOP_TRANSPORT: ObservabilityTransport = {
  send: () => {},
};

export interface ObservabilityController {
  getConsent: () => ObservabilityConsentState;
  setConsent: (consent: ObservabilityConsentState) => void;
  setTransport: (transport: ObservabilityTransport) => void;
  initialize: () => boolean;
  capture: (event: ObservabilityEvent) => boolean;
}

export function createObservabilityController(
  consent: ObservabilityConsentState,
  transport: ObservabilityTransport = NOOP_TRANSPORT
): ObservabilityController {
  let consentState: ObservabilityConsentState = consent;
  let targetTransport: ObservabilityTransport = transport;
  let initialized = false;

  const shouldSend = () => consentState === "granted";

  return {
    getConsent: () => consentState,
    setConsent: (nextConsent) => {
      consentState = nextConsent;
      if (nextConsent !== "granted") {
        initialized = false;
      }
    },
    setTransport: (nextTransport) => {
      targetTransport = nextTransport;
      initialized = false;
    },
    initialize: () => {
      if (!shouldSend()) {
        return false;
      }
      if (initialized) {
        return true;
      }
      targetTransport.initialize?.();
      initialized = true;
      return true;
    },
    capture: (event) => {
      if (!shouldSend()) {
        return false;
      }
      if (!initialized) {
        targetTransport.initialize?.();
        initialized = true;
      }
      targetTransport.send(event);
      return true;
    },
  };
}
