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
import type {
  ClipboardDraft,
  ClipboardEntry,
  ClipboardEntryType,
  ClipboardPrivacySettings,
  DataAdapter,
} from "../types";

const STORAGE_KEY = "xai.plugin-clipboard.entries";
const PRIVACY_KEY = "xai.plugin-clipboard.privacy";

const defaultPrivacy: ClipboardPrivacySettings = {
  redactEnabled: true,
  redactPatterns: ["[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}", "\\b\\d{3}-\\d{2}-\\d{4}\\b"],
  autoClearMinutes: null,
};

const seedEntries: ClipboardEntry[] = [
  {
    id: "clip-email",
    content: "Follow up with design@example.com about the console shell.",
    type: "text",
    source: "mock",
    pinned: true,
    createdAt: "2026-05-20T08:00:00.000Z",
  },
  {
    id: "clip-url",
    content: "https://example.test/productivity-roadmap",
    type: "url",
    source: "browser",
    pinned: false,
    createdAt: "2026-05-20T08:10:00.000Z",
  },
  {
    id: "clip-image",
    content: "mock-screenshot://task-list",
    type: "image",
    source: "screenshot",
    pinned: false,
    createdAt: "2026-05-20T08:15:00.000Z",
  },
];

function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function inferType(content: string): ClipboardEntryType {
  if (/^https?:\/\//.test(content.trim())) return "url";
  if (/function\s|const\s|let\s|=>|class\s/.test(content)) return "code";
  return "text";
}

function readPrivacy(): ClipboardPrivacySettings {
  if (typeof window === "undefined") return defaultPrivacy;
  try {
    const raw = window.localStorage.getItem(PRIVACY_KEY);
    if (!raw) return defaultPrivacy;
    return { ...defaultPrivacy, ...(JSON.parse(raw) as Partial<ClipboardPrivacySettings>) };
  } catch {
    return defaultPrivacy;
  }
}

function writePrivacy(settings: ClipboardPrivacySettings): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PRIVACY_KEY, JSON.stringify(settings));
}

function applyRedactions(content: string, settings: ClipboardPrivacySettings): string {
  if (!settings.redactEnabled) return content;
  return settings.redactPatterns.reduce((next, pattern) => {
    try {
      return next.replace(new RegExp(pattern, "gi"), "[redacted]");
    } catch {
      return next;
    }
  }, content);
}

export interface ClipboardStore {
  entries: ClipboardEntry[];
  privacy: ClipboardPrivacySettings;
  isLoading: boolean;
  error: string | null;
  refresh(): Promise<void>;
  addMockEntry(input: ClipboardDraft): Promise<ClipboardEntry>;
  updateEntry(id: string, patch: Partial<Omit<ClipboardEntry, "id" | "createdAt">>): Promise<void>;
  deleteEntry(id: string): Promise<void>;
  clearUnpinned(): Promise<void>;
  togglePinned(id: string): Promise<void>;
  updatePrivacy(patch: Partial<ClipboardPrivacySettings>): void;
  getEntryById(id: string): ClipboardEntry | null;
  renderContent(entry: ClipboardEntry): string;
}

const ClipboardStoreContext = createContext<ClipboardStore | undefined>(undefined);

export interface ClipboardStoreProviderProps {
  adapter?: DataAdapter<ClipboardEntry>;
  children: ReactNode;
}

export function ClipboardStoreProvider({
  adapter = new LocalStorageAdapter<ClipboardEntry>(STORAGE_KEY, seedEntries),
  children,
}: ClipboardStoreProviderProps) {
  const [entries, setEntries] = useState<ClipboardEntry[]>([]);
  const [privacy, setPrivacy] = useState<ClipboardPrivacySettings>(defaultPrivacy);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const next = await adapter.getAll();
      setEntries(next.sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt)));
      setPrivacy(readPrivacy());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load clipboard history");
    } finally {
      setIsLoading(false);
    }
  }, [adapter]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const autoClearMinutes = privacy.autoClearMinutes;
    if (!autoClearMinutes) return undefined;
    const interval = window.setInterval(() => {
      const cutoff = Date.now() - autoClearMinutes * 60_000;
      entries
        .filter((entry) => !entry.pinned && new Date(entry.createdAt).getTime() < cutoff)
        .forEach((entry) => {
          void adapter.delete(entry.id);
        });
      setEntries((prev) => prev.filter((entry) => entry.pinned || new Date(entry.createdAt).getTime() >= cutoff));
    }, 30_000);
    return () => window.clearInterval(interval);
  }, [adapter, entries, privacy.autoClearMinutes]);

  const persist = useCallback(
    async (entry: ClipboardEntry) => {
      await adapter.save(entry);
      setEntries((prev) => {
        const next = prev.some((current) => current.id === entry.id)
          ? prev.map((current) => (current.id === entry.id ? entry : current))
          : [entry, ...prev];
        return next.sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt));
      });
    },
    [adapter],
  );

  const addMockEntry = useCallback(
    async (input: ClipboardDraft) => {
      const content = input.content.trim();
      if (!content) throw new Error("Clipboard content is required");
      const entry: ClipboardEntry = {
        id: createId("clip"),
        content,
        type: input.type ?? inferType(content),
        source: input.source,
        pinned: input.pinned ?? false,
        createdAt: new Date().toISOString(),
      };
      await persist(entry);
      return entry;
    },
    [persist],
  );

  const updateEntry = useCallback(
    async (id: string, patch: Partial<Omit<ClipboardEntry, "id" | "createdAt">>) => {
      const current = await adapter.getById(id);
      if (!current) return;
      await persist({ ...current, ...patch });
    },
    [adapter, persist],
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      await adapter.delete(id);
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
    },
    [adapter],
  );

  const clearUnpinned = useCallback(async () => {
    await Promise.all(entries.filter((entry) => !entry.pinned).map((entry) => adapter.delete(entry.id)));
    setEntries((prev) => prev.filter((entry) => entry.pinned));
  }, [adapter, entries]);

  const togglePinned = useCallback(
    async (id: string) => {
      const current = await adapter.getById(id);
      if (!current) return;
      await persist({ ...current, pinned: !current.pinned });
    },
    [adapter, persist],
  );

  const updatePrivacy = useCallback((patch: Partial<ClipboardPrivacySettings>) => {
    setPrivacy((current) => {
      const next = { ...current, ...patch };
      writePrivacy(next);
      return next;
    });
  }, []);

  const getEntryById = useCallback(
    (id: string) => entries.find((entry) => entry.id === id) ?? null,
    [entries],
  );

  const renderContent = useCallback((entry: ClipboardEntry) => applyRedactions(entry.content, privacy), [privacy]);

  const value = useMemo<ClipboardStore>(
    () => ({
      entries,
      privacy,
      isLoading,
      error,
      refresh,
      addMockEntry,
      updateEntry,
      deleteEntry,
      clearUnpinned,
      togglePinned,
      updatePrivacy,
      getEntryById,
      renderContent,
    }),
    [
      entries,
      privacy,
      isLoading,
      error,
      refresh,
      addMockEntry,
      updateEntry,
      deleteEntry,
      clearUnpinned,
      togglePinned,
      updatePrivacy,
      getEntryById,
      renderContent,
    ],
  );

  return <ClipboardStoreContext.Provider value={value}>{children}</ClipboardStoreContext.Provider>;
}

export function useClipboardStore(): ClipboardStore {
  const store = useContext(ClipboardStoreContext);
  if (!store) throw new Error("useClipboardStore must be used within ClipboardStoreProvider");
  return store;
}
