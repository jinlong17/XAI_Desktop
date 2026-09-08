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
import { LocalStorageAdapter } from "../data/LocalStorageAdapter";
import { useClipboardRepoAdapter } from "../data/RepoProvider";
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
  acknowledgedRedactIrreversibility: false,
  redactPatterns: ["[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}", "\\b\\d{3}-\\d{2}-\\d{4}\\b"],
  autoClearMinutes: null,
};

const seedEntries: ClipboardEntry[] = [
  {
    id: "clip-email",
    entityType: "clipboard.entry",
    schemaVersion: 1,
    syncScope: "device-local",
    content: "Follow up with design@example.com about the console shell.",
    type: "text",
    source: "mock",
    pinned: true,
    createdAt: "2026-05-20T08:00:00.000Z",
    updatedAt: "2026-05-20T08:00:00.000Z",
    version: 1,
  },
  {
    id: "clip-url",
    entityType: "clipboard.entry",
    schemaVersion: 1,
    syncScope: "device-local",
    content: "https://example.test/productivity-roadmap",
    type: "url",
    source: "browser",
    pinned: false,
    createdAt: "2026-05-20T08:10:00.000Z",
    updatedAt: "2026-05-20T08:10:00.000Z",
    version: 1,
  },
  {
    id: "clip-image",
    entityType: "clipboard.entry",
    schemaVersion: 1,
    syncScope: "device-local",
    content: "mock-screenshot://task-list",
    type: "image",
    source: "screenshot",
    pinned: false,
    createdAt: "2026-05-20T08:15:00.000Z",
    updatedAt: "2026-05-20T08:15:00.000Z",
    version: 1,
  },
];

function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function inferType(content: string): ClipboardEntryType {
  const trimmed = content.trim();
  if (/^https?:\/\//.test(trimmed)) return "url";
  const hasStructural = /[{};]|=>|\bfunction\b|\bclass\b/.test(trimmed);
  const looksMultilineCode = trimmed.includes("\n") && /^\s{2,}|\t/.test(trimmed);
  if (hasStructural && (looksMultilineCode || /^[{[]/.test(trimmed))) return "code";
  return "text";
}

function sortEntries(entries: ClipboardEntry[]): ClipboardEntry[] {
  return [...entries].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt));
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
  adapter,
  children,
}: ClipboardStoreProviderProps) {
  const repoAdapter = useClipboardRepoAdapter();
  const [fallbackAdapter] = useState(() => new LocalStorageAdapter<ClipboardEntry>(STORAGE_KEY, seedEntries));
  const stableAdapter = adapter ?? repoAdapter ?? fallbackAdapter;
  const [entries, setEntries] = useState<ClipboardEntry[]>([]);
  const [privacy, setPrivacy] = useState<ClipboardPrivacySettings>(defaultPrivacy);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const entriesRef = useRef<ClipboardEntry[]>(entries);

  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  const backfillRedactedEntries = useCallback(
    async (sourceEntries: ClipboardEntry[], settings: ClipboardPrivacySettings) => {
      const changedEntries: ClipboardEntry[] = [];
      for (const entry of sourceEntries) {
        const redacted = applyRedactions(entry.content, settings);
        if (redacted !== entry.content) {
          const nextEntry = { ...entry, content: redacted, updatedAt: new Date().toISOString(), version: entry.version + 1 };
          await stableAdapter.save(nextEntry);
          changedEntries.push(nextEntry);
        }
      }
      return changedEntries;
    },
    [stableAdapter],
  );

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const storedPrivacy = readPrivacy();
      const next = await stableAdapter.getAll();
      const changedEntries = storedPrivacy.redactEnabled ? await backfillRedactedEntries(next, storedPrivacy) : [];
      const changedById = new Map(changedEntries.map((entry) => [entry.id, entry]));
      setEntries(sortEntries(next.map((entry) => changedById.get(entry.id) ?? entry)));
      setPrivacy(storedPrivacy);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load clipboard history");
    } finally {
      setIsLoading(false);
    }
  }, [backfillRedactedEntries, stableAdapter]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const autoClearMinutes = privacy.autoClearMinutes;
    if (!autoClearMinutes) return undefined;
    const interval = window.setInterval(() => {
      const cutoff = Date.now() - autoClearMinutes * 60_000;
      const stale = entriesRef.current.filter((entry) => !entry.pinned && new Date(entry.createdAt).getTime() < cutoff);
      if (stale.length === 0) return;
      stale.forEach((entry) => {
        void stableAdapter.delete(entry.id);
      });
      setEntries((prev) => prev.filter((entry) => entry.pinned || new Date(entry.createdAt).getTime() >= cutoff));
    }, 30_000);
    return () => window.clearInterval(interval);
  }, [stableAdapter, privacy.autoClearMinutes]);

  const persist = useCallback(
    async (entry: ClipboardEntry) => {
      await stableAdapter.save(entry);
      setEntries((prev) => {
        const next = prev.some((current) => current.id === entry.id)
          ? prev.map((current) => (current.id === entry.id ? entry : current))
          : [entry, ...prev];
        return sortEntries(next);
      });
    },
    [stableAdapter],
  );

  const addMockEntry = useCallback(
    async (input: ClipboardDraft) => {
      const content = applyRedactions(input.content.trim(), privacy);
      if (!content) throw new Error("Clipboard content is required");
      const entry: ClipboardEntry = {
        id: createId("clip"),
        entityType: "clipboard.entry",
        schemaVersion: 1,
        syncScope: "device-local",
        content,
        type: input.type ?? inferType(content),
        source: input.source,
        pinned: input.pinned ?? false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      };
      await persist(entry);
      return entry;
    },
    [persist, privacy],
  );

  const updateEntry = useCallback(
    async (id: string, patch: Partial<Omit<ClipboardEntry, "id" | "createdAt">>) => {
      const current = await stableAdapter.getById(id);
      if (!current) return;
      const sanitizedPatch =
        typeof patch.content === "string" ? { ...patch, content: applyRedactions(patch.content, privacy) } : patch;
      await persist({ ...current, ...sanitizedPatch, updatedAt: new Date().toISOString(), version: current.version + 1 });
    },
    [persist, privacy, stableAdapter],
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      await stableAdapter.delete(id);
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
    },
    [stableAdapter],
  );

  const clearUnpinned = useCallback(async () => {
    await Promise.all(entries.filter((entry) => !entry.pinned).map((entry) => stableAdapter.delete(entry.id)));
    setEntries((prev) => prev.filter((entry) => entry.pinned));
  }, [entries, stableAdapter]);

  const togglePinned = useCallback(
    async (id: string) => {
      const current = await stableAdapter.getById(id);
      if (!current) return;
      await persist({ ...current, pinned: !current.pinned });
    },
    [persist, stableAdapter],
  );

  const updatePrivacy = useCallback((patch: Partial<ClipboardPrivacySettings>) => {
    setPrivacy((current) => {
      const next = { ...current, ...patch };
      writePrivacy(next);
      if (patch.redactEnabled === true && !current.redactEnabled) {
        void backfillRedactedEntries(entriesRef.current, next).then((changedEntries) => {
          if (changedEntries.length === 0) return;
          const changedById = new Map(changedEntries.map((entry) => [entry.id, entry]));
          setEntries((prev) => sortEntries(prev.map((entry) => changedById.get(entry.id) ?? entry)));
        });
      }
      return next;
    });
  }, [backfillRedactedEntries]);

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
