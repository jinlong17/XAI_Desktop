import * as Sentry from "@sentry/react";
import { createRumBatcher } from "./rum";
import { sanitizeSentryBreadcrumb, sanitizeSentryEvent, toSentryCaptureContext, type SentryClient } from "./sentry";
import type { ObservabilityEvent, ObservabilityTransport } from "./types";

export interface BrowserObservabilityTransportOptions {
  environment: "web-dev" | "web-staging" | "web-prod";
  release: string;
  sentryDsn?: string;
  sentryClient?: SentryClient;
  fetchImpl?: typeof fetch;
}

export interface BrowserObservabilityRuntimeState {
  sentryInitialized: boolean;
  rumQueueSize: number;
}

function resolveSentryClient(options: BrowserObservabilityTransportOptions): SentryClient | undefined {
  if (options.sentryClient) {
    return options.sentryClient;
  }

  if (typeof Sentry.init === "function" && typeof Sentry.captureMessage === "function") {
    return {
      init: (config) => {
        Sentry.init(config as unknown as Parameters<typeof Sentry.init>[0]);
      },
      captureMessage: (message, context) => {
        Sentry.withScope((scope) => {
          scope.setLevel(context.level);
          scope.setTags(context.tags);
          scope.setExtras(context.extra);
          Sentry.captureMessage(message);
        });
      },
    };
  }

  const candidate = (globalThis as { __XAI_SENTRY__?: SentryClient }).__XAI_SENTRY__;
  if (candidate && typeof candidate.init === "function" && typeof candidate.captureMessage === "function") {
    return candidate;
  }

  return undefined;
}

export function createBrowserObservabilityTransport(
  options: BrowserObservabilityTransportOptions
): ObservabilityTransport & { getState: () => BrowserObservabilityRuntimeState; flushRum: () => Promise<void> } {
  let sentryInitialized = false;
  const rumBatcher = createRumBatcher({
    environment: options.environment,
    release: options.release,
    fetchImpl: options.fetchImpl,
  });
  const sentryClient = resolveSentryClient(options);

  return {
    initialize() {
      if (!options.sentryDsn || !sentryClient) {
        sentryInitialized = false;
        return;
      }

      sentryClient.init({
        dsn: options.sentryDsn,
        environment: options.environment,
        release: options.release,
        sendDefaultPii: false,
        allowUrls: [/^https?:\/\/[^/]+/i],
        denyUrls: [/^chrome-extension:\/\//i, /^moz-extension:\/\//i],
        tracePropagationTargets: [],
        beforeSend: sanitizeSentryEvent,
        beforeBreadcrumb: sanitizeSentryBreadcrumb,
      });

      sentryInitialized = true;
    },
    send(event: ObservabilityEvent) {
      if (event.channel === "rum") {
        rumBatcher.enqueue(event.routeGroup, event.context?.metric);
        return;
      }

      if (!sentryInitialized || !sentryClient) {
        return;
      }

      const sentryEvent = sanitizeSentryEvent({
        message: event.message,
        level: "error",
        extra: event.context,
      });

      if (!sentryEvent?.message) {
        return;
      }

      sentryClient.captureMessage(sentryEvent.message, toSentryCaptureContext(event, options));
    },
    getState() {
      return {
        sentryInitialized,
        rumQueueSize: rumBatcher.size(),
      };
    },
    flushRum: rumBatcher.flush,
  };
}
