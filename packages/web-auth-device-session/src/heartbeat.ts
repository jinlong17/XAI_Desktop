export interface HeartbeatScheduler {
  start(): void;
  stop(): void;
  isRunning(): boolean;
}

export interface CreateHeartbeatSchedulerOptions {
  onTick: () => Promise<void> | void;
  intervalMs?: number;
  documentRef?: Document;
}

const DEFAULT_INTERVAL_MS = 5 * 60 * 1000;

export function createHeartbeatScheduler(options: CreateHeartbeatSchedulerOptions): HeartbeatScheduler {
  const intervalMs = options.intervalMs ?? DEFAULT_INTERVAL_MS;
  const documentRef = options.documentRef;
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const onVisible = () => {
    if (!documentRef || documentRef.visibilityState !== "visible") {
      return;
    }

    void options.onTick();
  };

  return {
    start() {
      if (intervalId) {
        return;
      }

      void options.onTick();
      intervalId = setInterval(() => {
        void options.onTick();
      }, intervalMs);

      documentRef?.addEventListener("visibilitychange", onVisible);
    },
    stop() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }

      documentRef?.removeEventListener("visibilitychange", onVisible);
    },
    isRunning() {
      return intervalId !== null;
    }
  };
}
