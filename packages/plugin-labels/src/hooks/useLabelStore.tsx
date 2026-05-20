import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { LocalStorageAdapter } from "../data/LocalStorageAdapter";
import type { DataAdapter, Label, LabelDraft, LabelStore } from "../types";

const STORAGE_KEY = "xai.plugin-labels.labels";
const RECENT_KEY = "xai.plugin-labels.recent";
const FALLBACK_COLORS = ["#2563eb", "#16a34a", "#dc2626", "#9333ea", "#ea580c", "#0891b2"];

const seedLabels: Label[] = [
  { id: "label-focus", name: "Focus", color: "#2563eb", icon: "target", createdAt: "2026-05-20T00:00:00.000Z" },
  { id: "label-waiting", name: "Waiting", color: "#9333ea", icon: "clock", createdAt: "2026-05-20T00:00:00.000Z" },
  { id: "label-home", name: "Home", color: "#16a34a", icon: "home", createdAt: "2026-05-20T00:00:00.000Z" },
];

function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? "[]") as string[];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function writeRecent(ids: string[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RECENT_KEY, JSON.stringify(ids.slice(0, 8)));
}

const LabelStoreContext = createContext<LabelStore | undefined>(undefined);

export interface LabelStoreProviderProps {
  adapter?: DataAdapter<Label>;
  children: ReactNode;
}

export function LabelStoreProvider({
  adapter,
  children,
}: LabelStoreProviderProps) {
  const [defaultAdapter] = useState(
    () => new LocalStorageAdapter<Label>(STORAGE_KEY, seedLabels),
  );
  const stableAdapter = adapter ?? defaultAdapter;

  const [labels, setLabels] = useState<Label[]>([]);
  const [recentLabelIds, setRecentLabelIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const next = await stableAdapter.getAll();
      setLabels(next.sort((a, b) => a.name.localeCompare(b.name)));
      setRecentLabelIds(readRecent());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load labels");
    } finally {
      setIsLoading(false);
    }
  }, [stableAdapter]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createLabel = useCallback(
    async (input: LabelDraft) => {
      const color = input.color ?? FALLBACK_COLORS[labels.length % FALLBACK_COLORS.length] ?? "#2563eb";
      const label: Label = {
        id: createId("label"),
        name: input.name.trim(),
        color,
        icon: input.icon?.trim() || undefined,
        createdAt: new Date().toISOString(),
      };
      if (!label.name) throw new Error("Label name is required");
      await stableAdapter.save(label);
      setLabels((prev) => [...prev, label].sort((a, b) => a.name.localeCompare(b.name)));
      return label;
    },
    [stableAdapter, labels.length],
  );

  const updateLabel = useCallback(
    async (id: string, patch: Partial<Omit<Label, "id" | "createdAt">>) => {
      const current = await stableAdapter.getById(id);
      if (!current) return;
      const next: Label = {
        ...current,
        ...patch,
        name: patch.name?.trim() ?? current.name,
        icon: patch.icon?.trim() || patch.icon,
      };
      await stableAdapter.save(next);
      setLabels((prev) => prev.map((label) => (label.id === id ? next : label)));
    },
    [stableAdapter],
  );

  const deleteLabel = useCallback(
    async (id: string) => {
      await stableAdapter.delete(id);
      setLabels((prev) => prev.filter((label) => label.id !== id));
      setRecentLabelIds((prev) => {
        const next = prev.filter((recentId) => recentId !== id);
        writeRecent(next);
        return next;
      });
    },
    [stableAdapter],
  );

  const markRecent = useCallback((labelIds: string[]) => {
    setRecentLabelIds((prev) => {
      const next = [...labelIds, ...prev.filter((id) => !labelIds.includes(id))].slice(0, 8);
      writeRecent(next);
      return next;
    });
  }, []);

  const getLabelById = useCallback(
    (id: string) => labels.find((label) => label.id === id) ?? null,
    [labels],
  );

  const value = useMemo<LabelStore>(
    () => ({
      labels,
      recentLabelIds,
      isLoading,
      error,
      refresh,
      createLabel,
      updateLabel,
      deleteLabel,
      markRecent,
      getLabelById,
    }),
    [
      labels,
      recentLabelIds,
      isLoading,
      error,
      refresh,
      createLabel,
      updateLabel,
      deleteLabel,
      markRecent,
      getLabelById,
    ],
  );

  return <LabelStoreContext.Provider value={value}>{children}</LabelStoreContext.Provider>;
}

export function useLabelStore(): LabelStore {
  const store = useContext(LabelStoreContext);
  if (!store) {
    throw new Error("useLabelStore must be used within LabelStoreProvider");
  }
  return store;
}
