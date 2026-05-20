import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { SyncOperationKind } from "@repo/plugin-account";

type SyncMenuBarStatus = "idle" | "syncing" | "success" | "error";

interface SyncStartedPayload {
  kind: SyncOperationKind;
}

interface SyncCompletedPayload {
  kind: SyncOperationKind;
  durationMs: number;
}

interface SyncFailedPayload {
  kind: SyncOperationKind;
  error: string;
}

interface SyncMenuBarPayload {
  status: SyncMenuBarStatus;
  kind?: SyncOperationKind;
  message?: string;
  frame?: number;
}

const SUCCESS_FLASH_MS = 2_000;
const SPINNER_FRAME_MS = 250;

export function useSyncMenuBarStatus(): void {
  useEffect(() => {
    let disposed = false;
    let successTimer: number | undefined;
    let spinnerTimer: number | undefined;
    let spinnerFrame = 0;

    const clearSuccessTimer = () => {
      if (successTimer !== undefined) {
        window.clearTimeout(successTimer);
        successTimer = undefined;
      }
    };

    const clearSpinnerTimer = () => {
      if (spinnerTimer !== undefined) {
        window.clearInterval(spinnerTimer);
        spinnerTimer = undefined;
      }
    };

    const setStatus = (payload: SyncMenuBarPayload) => {
      void invoke("sync_set_menubar_status", { payload });
    };

    const startSpinner = (kind: SyncOperationKind) => {
      clearSuccessTimer();
      clearSpinnerTimer();
      spinnerFrame = 0;
      setStatus({ status: "syncing", kind, frame: spinnerFrame });
      spinnerTimer = window.setInterval(() => {
        spinnerFrame = (spinnerFrame + 1) % 4;
        setStatus({ status: "syncing", kind, frame: spinnerFrame });
      }, SPINNER_FRAME_MS);
    };

    const stopAtIdle = () => {
      clearSpinnerTimer();
      clearSuccessTimer();
      setStatus({ status: "idle" });
    };

    const unlisteners = [
      listen<SyncStartedPayload>("account:sync-started", (event) => {
        if (!disposed) {
          startSpinner(event.payload.kind);
        }
      }),
      listen<SyncCompletedPayload>("account:sync-completed", (event) => {
        if (disposed) {
          return;
        }
        clearSpinnerTimer();
        setStatus({
          status: "success",
          kind: event.payload.kind,
          message: `Completed in ${event.payload.durationMs}ms`,
        });
        clearSuccessTimer();
        successTimer = window.setTimeout(stopAtIdle, SUCCESS_FLASH_MS);
      }),
      listen<SyncFailedPayload>("account:sync-failed", (event) => {
        if (disposed) {
          return;
        }
        clearSpinnerTimer();
        clearSuccessTimer();
        setStatus({
          status: "error",
          kind: event.payload.kind,
          message: event.payload.error,
        });
      }),
    ];

    setStatus({ status: "idle" });

    return () => {
      disposed = true;
      clearSuccessTimer();
      clearSpinnerTimer();
      for (const unlisten of unlisteners) {
        void unlisten.then((fn) => fn());
      }
    };
  }, []);
}
