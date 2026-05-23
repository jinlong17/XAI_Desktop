import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { emitEvent } from "@repo/core/events";
import { LocalStorageAdapter } from "../data/LocalStorageAdapter";
import type { DataAdapter, PomodoroMode, PomodoroSettings, PomodoroState, PomodoroStatus } from "../types";

const STORAGE_KEY = "xai.plugin-productivity.pomodoro";
const SESSION_ID = "pomodoro-session-current";

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakEvery: 4,
};

function secondsForMode(mode: PomodoroMode, settings: PomodoroSettings): number {
  if (mode === "focus") return settings.focusMinutes * 60;
  if (mode === "short-break") return settings.shortBreakMinutes * 60;
  return settings.longBreakMinutes * 60;
}

function nextModeAfterFocus(cyclesCompleted: number, settings: PomodoroSettings): PomodoroMode {
  return cyclesCompleted > 0 && cyclesCompleted % settings.longBreakEvery === 0 ? "long-break" : "short-break";
}

const defaultState: PomodoroState = {
  mode: "focus",
  status: "idle",
  activeTodoId: null,
  remainingSeconds: secondsForMode("focus", DEFAULT_SETTINGS),
  cyclesCompleted: 0,
  lastCompletedTodoId: null,
  lastCompletedAt: null,
  settings: DEFAULT_SETTINGS,
};

interface PomodoroRecord extends PomodoroState {
  id: string;
}

export interface PomodoroStore extends PomodoroState {
  start(todoId?: string | null): void;
  pause(): void;
  resume(): void;
  reset(mode?: PomodoroMode): void;
  selectTodo(todoId: string | null): void;
  skip(): void;
  updateSettings(patch: Partial<PomodoroSettings>): void;
}

const PomodoroStoreContext = createContext<PomodoroStore | undefined>(undefined);

export interface PomodoroStoreProviderProps {
  adapter?: DataAdapter<PomodoroRecord>;
  children: ReactNode;
}

export function PomodoroStoreProvider({ adapter, children }: PomodoroStoreProviderProps) {
  const [defaultAdapter] = useState(() => new LocalStorageAdapter<PomodoroRecord>(STORAGE_KEY, []));
  const stableAdapter = adapter ?? defaultAdapter;
  const [state, setState] = useState<PomodoroState>(defaultState);
  const hydratedRef = useRef(false);
  // Dedup: tracks the last-emitted completedAt ISO to prevent re-emit on re-renders.
  const lastEmittedAtRef = useRef<string | null>(null);
  // Capture pre-completion snapshot so the emit effect can read the completed session's mode/duration.
  const completionSnapshotRef = useRef<{
    mode: PomodoroMode;
    durationMs: number;
    cyclesCompleted: number;
    linkedTodoId: string | null;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    hydratedRef.current = false;
    void stableAdapter.getById(SESSION_ID).then((row) => {
      if (cancelled) return;
      if (row) {
        const status: PomodoroStatus = row.status === "running" ? "paused" : row.status;
        setState({
          mode: row.mode,
          status,
          activeTodoId: row.activeTodoId,
          remainingSeconds: row.remainingSeconds,
          cyclesCompleted: row.cyclesCompleted,
          lastCompletedTodoId: row.lastCompletedTodoId,
          lastCompletedAt: row.lastCompletedAt,
          settings: row.settings,
        });
      }
      hydratedRef.current = true;
    });
    return () => {
      cancelled = true;
    };
  }, [stableAdapter]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    void stableAdapter.save({ id: SESSION_ID, ...state });
  }, [stableAdapter, state]);

  useEffect(() => {
    if (state.status !== "running") return undefined;
    const timer = window.setInterval(() => {
      setState((current) => {
        if (current.status !== "running") return current;
        if (current.remainingSeconds > 1) {
          return { ...current, remainingSeconds: current.remainingSeconds - 1 };
        }
        const completedAt = new Date().toISOString();
        if (current.mode === "focus") {
          const cyclesCompleted = current.cyclesCompleted + 1;
          const mode = nextModeAfterFocus(cyclesCompleted, current.settings);
          // Capture snapshot before the state transition for the emit effect.
          completionSnapshotRef.current = {
            mode: current.mode,
            durationMs: secondsForMode(current.mode, current.settings) * 1000,
            cyclesCompleted,
            linkedTodoId: current.activeTodoId,
          };
          return {
            ...current,
            mode,
            status: "completed",
            remainingSeconds: secondsForMode(mode, current.settings),
            cyclesCompleted,
            lastCompletedTodoId: current.activeTodoId,
            lastCompletedAt: completedAt,
          };
        }
        // Break mode completion
        completionSnapshotRef.current = {
          mode: current.mode,
          durationMs: secondsForMode(current.mode, current.settings) * 1000,
          cyclesCompleted: current.cyclesCompleted,
          linkedTodoId: null,
        };
        return {
          ...current,
          mode: "focus",
          status: "completed",
          remainingSeconds: secondsForMode("focus", current.settings),
          lastCompletedTodoId: null,
          lastCompletedAt: completedAt,
        };
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [state.status]);

  // Emit productivity:pomodoro-completed once per session completion.
  useEffect(() => {
    if (state.status !== "completed" || !state.lastCompletedAt) return;
    if (lastEmittedAtRef.current === state.lastCompletedAt) return;
    const snapshot = completionSnapshotRef.current;
    if (!snapshot) return;
    lastEmittedAtRef.current = state.lastCompletedAt;
    void emitEvent("productivity:pomodoro-completed", {
      mode: snapshot.mode,
      cyclesCompleted: snapshot.cyclesCompleted,
      linkedTodoId: snapshot.linkedTodoId,
      completedAt: state.lastCompletedAt,
      durationMs: snapshot.durationMs,
    }).catch(() => undefined);
  }, [state.status, state.lastCompletedAt]);

  const start = useCallback((todoId?: string | null) => {
    setState((current) => ({
      ...current,
      activeTodoId: todoId === undefined ? current.activeTodoId : todoId,
      mode: "focus",
      status: "running",
      remainingSeconds: current.mode === "focus" ? current.remainingSeconds : secondsForMode("focus", current.settings),
    }));
  }, []);

  const pause = useCallback(() => {
    setState((current) => ({ ...current, status: current.status === "running" ? "paused" : current.status }));
  }, []);

  const resume = useCallback(() => {
    setState((current) => ({ ...current, status: current.status === "paused" ? "running" : current.status }));
  }, []);

  const reset = useCallback((mode: PomodoroMode = "focus") => {
    setState((current) => ({
      ...current,
      mode,
      status: "idle",
      remainingSeconds: secondsForMode(mode, current.settings),
      lastCompletedTodoId: null,
      lastCompletedAt: null,
    }));
  }, []);

  const selectTodo = useCallback((todoId: string | null) => {
    setState((current) => ({ ...current, activeTodoId: todoId }));
  }, []);

  const skip = useCallback(() => {
    setState((current) => {
      const mode = current.mode === "focus" ? nextModeAfterFocus(current.cyclesCompleted + 1, current.settings) : "focus";
      return {
        ...current,
        mode,
        status: "idle",
        remainingSeconds: secondsForMode(mode, current.settings),
      };
    });
  }, []);

  const updateSettings = useCallback((patch: Partial<PomodoroSettings>) => {
    setState((current) => {
      const settings = { ...current.settings, ...patch };
      return { ...current, settings, remainingSeconds: secondsForMode(current.mode, settings) };
    });
  }, []);

  const value = useMemo<PomodoroStore>(
    () => ({ ...state, start, pause, resume, reset, selectTodo, skip, updateSettings }),
    [state, start, pause, resume, reset, selectTodo, skip, updateSettings],
  );

  return <PomodoroStoreContext.Provider value={value}>{children}</PomodoroStoreContext.Provider>;
}

export function usePomodoroStore(): PomodoroStore {
  const store = useContext(PomodoroStoreContext);
  if (!store) throw new Error("usePomodoroStore must be used within PomodoroStoreProvider");
  return store;
}
