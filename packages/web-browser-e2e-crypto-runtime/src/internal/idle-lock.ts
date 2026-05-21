import type {
  BrowserCryptoState,
  LockReason,
  RuntimeTransition,
  RuntimeTransitionListener,
} from "../types";

type TimerHandle = ReturnType<typeof setTimeout>;

export interface LockTransitionStore {
  getState(): BrowserCryptoState;
  subscribe(listener: RuntimeTransitionListener): () => void;
  transitionToUnlocking(): RuntimeTransition;
  transitionToUnlocked(currentKeyId: number, idleDeadlineMs: number | null): RuntimeTransition;
  lock(reason?: LockReason, errorCode?: string): RuntimeTransition | null;
  setIdleDeadline(idleDeadlineMs: number | null): void;
}

export function createLockTransitionStore(input?: {
  nowMs?: () => number;
  initialState?: BrowserCryptoState;
}): LockTransitionStore {
  const nowMs = input?.nowMs ?? Date.now;
  const listeners = new Set<RuntimeTransitionListener>();
  let state: BrowserCryptoState =
    input?.initialState ?? {
      status: "locked",
      currentKeyId: null,
      unlockedAt: null,
      idleDeadlineMs: null,
      lastLockReason: "manual",
    };

  function emit(transition: RuntimeTransition): RuntimeTransition {
    for (const listener of [...listeners]) {
      listener(transition);
    }
    return transition;
  }

  return {
    getState() {
      return { ...state };
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    transitionToUnlocking() {
      const from = state.status;
      state = {
        status: "unlocking",
        currentKeyId: null,
        unlockedAt: null,
        idleDeadlineMs: null,
      };
      return emit({
        from,
        to: "unlocking",
        reason: "unlock",
        at: nowMs(),
        currentKeyId: null,
      });
    },
    transitionToUnlocked(currentKeyId, idleDeadlineMs) {
      const from = state.status;
      const at = nowMs();
      state = {
        status: "unlocked",
        currentKeyId,
        unlockedAt: at,
        idleDeadlineMs,
      };
      return emit({
        from,
        to: "unlocked",
        reason: "unlock",
        at,
        currentKeyId,
      });
    },
    lock(reason = "manual", errorCode) {
      if (state.status === "locked") {
        return null;
      }
      const from = state.status;
      state = {
        status: "locked",
        currentKeyId: null,
        unlockedAt: null,
        idleDeadlineMs: null,
        lastLockReason: reason,
      };
      return emit({
        from,
        to: "locked",
        reason,
        at: nowMs(),
        currentKeyId: null,
        errorCode,
      });
    },
    setIdleDeadline(idleDeadlineMs) {
      state = { ...state, idleDeadlineMs };
    },
  };
}

export interface IdleLockController {
  configure(input: { timeoutMs: number | null; onIdle: () => void }): void;
  bump(): void;
  clear(): void;
  getDeadlineMs(): number | null;
}

export function createIdleLockController(input?: {
  nowMs?: () => number;
  setTimer?: (callback: () => void, timeoutMs: number) => TimerHandle;
  clearTimer?: (timer: TimerHandle) => void;
}): IdleLockController {
  const nowMs = input?.nowMs ?? Date.now;
  const setTimer = input?.setTimer ?? setTimeout;
  const clearTimer = input?.clearTimer ?? clearTimeout;
  let timer: TimerHandle | null = null;
  let timeoutMs: number | null = null;
  let deadlineMs: number | null = null;
  let onIdle: (() => void) | null = null;

  function clear(): void {
    if (timer !== null) {
      clearTimer(timer);
      timer = null;
    }
    deadlineMs = null;
  }

  function schedule(): void {
    clear();
    if (timeoutMs === null || onIdle === null) {
      return;
    }
    if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) {
      throw new TypeError("idle timeoutMs must be a positive integer or null");
    }
    deadlineMs = nowMs() + timeoutMs;
    timer = setTimer(() => {
      timer = null;
      deadlineMs = null;
      onIdle?.();
    }, timeoutMs);
  }

  return {
    configure(inputConfig) {
      timeoutMs = inputConfig.timeoutMs;
      onIdle = inputConfig.onIdle;
      schedule();
    },
    bump() {
      schedule();
    },
    clear,
    getDeadlineMs() {
      return deadlineMs;
    },
  };
}
