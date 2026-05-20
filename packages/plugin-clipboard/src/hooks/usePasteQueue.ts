import { useCallback, useEffect, useMemo, useState } from "react";
import type { ClipboardEntry, PasteQueueState } from "../types";

export interface PasteQueueController extends PasteQueueState {
  currentEntry: ClipboardEntry | null;
  queuedEntries: ClipboardEntry[];
  setQueue(entryIds: string[]): void;
  toggleEntry(entryId: string): void;
  start(): void;
  pause(): void;
  pasteCurrent(): Promise<void>;
  advance(): void;
  reset(): void;
}

export interface UsePasteQueueOptions {
  entries: ClipboardEntry[];
  delayMs?: number;
  onPaste?: (entry: ClipboardEntry) => Promise<void> | void;
}

export function usePasteQueue({ entries, delayMs = 800, onPaste }: UsePasteQueueOptions): PasteQueueController {
  const [state, setState] = useState<PasteQueueState>({
    entryIds: [],
    currentIndex: 0,
    status: "idle",
    completedIds: [],
  });

  const queuedEntries = useMemo(
    () => state.entryIds.map((id) => entries.find((entry) => entry.id === id)).filter((entry): entry is ClipboardEntry => Boolean(entry)),
    [entries, state.entryIds],
  );
  const currentEntry = queuedEntries[state.currentIndex] ?? null;

  const setQueue = useCallback((entryIds: string[]) => {
    setState({ entryIds, currentIndex: 0, status: "idle", completedIds: [] });
  }, []);

  const toggleEntry = useCallback((entryId: string) => {
    setState((current) => {
      const entryIds = current.entryIds.includes(entryId)
        ? current.entryIds.filter((id) => id !== entryId)
        : [...current.entryIds, entryId];
      return { ...current, entryIds, currentIndex: 0, completedIds: [] };
    });
  }, []);

  const start = useCallback(() => {
    setState((current) => ({ ...current, status: current.entryIds.length > 0 ? "running" : "idle" }));
  }, []);

  const pause = useCallback(() => {
    setState((current) => ({ ...current, status: current.status === "running" ? "paused" : current.status }));
  }, []);

  const advance = useCallback(() => {
    setState((current) => {
      const nextIndex = current.currentIndex + 1;
      return {
        ...current,
        currentIndex: Math.min(nextIndex, Math.max(current.entryIds.length - 1, 0)),
        status: nextIndex >= current.entryIds.length ? "completed" : current.status,
      };
    });
  }, []);

  const pasteCurrent = useCallback(async () => {
    if (!currentEntry) return;
    await onPaste?.(currentEntry);
    setState((current) => {
      const completedIds = current.completedIds.includes(currentEntry.id)
        ? current.completedIds
        : [...current.completedIds, currentEntry.id];
      const nextIndex = current.currentIndex + 1;
      return {
        ...current,
        completedIds,
        currentIndex: Math.min(nextIndex, Math.max(current.entryIds.length - 1, 0)),
        status: nextIndex >= current.entryIds.length ? "completed" : current.status,
      };
    });
  }, [currentEntry, onPaste]);

  useEffect(() => {
    if (state.status !== "running" || !currentEntry) return undefined;
    const timer = window.setTimeout(() => {
      void pasteCurrent();
    }, delayMs);
    return () => window.clearTimeout(timer);
  }, [state.status, currentEntry, delayMs, pasteCurrent]);

  const reset = useCallback(() => {
    setState((current) => ({ ...current, currentIndex: 0, status: "idle", completedIds: [] }));
  }, []);

  return {
    ...state,
    currentEntry,
    queuedEntries,
    setQueue,
    toggleEntry,
    start,
    pause,
    pasteCurrent,
    advance,
    reset,
  };
}
