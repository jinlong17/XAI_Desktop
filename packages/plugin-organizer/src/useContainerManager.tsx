import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

/**
 * ## Container Manager Context
 *
 * Keeps multiple independent file containers alive on the desktop layer without
 * touching unrelated plugins (e.g., Sticky Notes, Four Quadrants). The host can
 * mount this provider once and render `SmartContainer` for each record.
 */

export type ViewMode = "grid" | "list";

export interface ContainerData {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  viewMode: ViewMode;
  filterRules?: string[]; // placeholder for per-container filtering (e.g., ["*.jpg"])
}

export interface ContainerManagerContextValue {
  containers: ContainerData[];
  addContainer: (initial?: Partial<ContainerData>) => string;
  updateContainer: (id: string, patch: Partial<ContainerData>) => void;
  removeContainer: (id: string) => void;
}

const DEFAULT_SIZE = 220;

const MOCK_CONTAINERS: ContainerData[] = [
  {
    id: "container-alpha",
    title: "新建画布",
    x: 48,
    y: 96,
    width: DEFAULT_SIZE,
    height: DEFAULT_SIZE,
    viewMode: "grid",
  },
  {
    id: "container-beta",
    title: "Project Assets",
    x: 320,
    y: 160,
    width: DEFAULT_SIZE + 40,
    height: DEFAULT_SIZE + 40,
    viewMode: "list",
  },
  {
    id: "container-gamma",
    title: "Screenshots",
    x: 620,
    y: 220,
    width: DEFAULT_SIZE,
    height: DEFAULT_SIZE + 60,
    viewMode: "grid",
    filterRules: ["*.png"],
  },
];

const ContainerManagerContext = createContext<ContainerManagerContextValue | undefined>(
  undefined,
);

const generateId = () =>
  (globalThis.crypto?.randomUUID?.() ?? `container-${Math.random().toString(16).slice(2)}`);

export function ContainerManagerProvider({ children }: { children: ReactNode }) {
  const [containers, setContainers] = useState<ContainerData[]>(MOCK_CONTAINERS);

  const addContainer = useCallback((initial?: Partial<ContainerData>) => {
    const id = initial?.id ?? generateId();
    const next: ContainerData = {
      id,
      title: initial?.title ?? "新建画布",
      x: initial?.x ?? 64,
      y: initial?.y ?? 120,
      width: initial?.width ?? DEFAULT_SIZE,
      height: initial?.height ?? DEFAULT_SIZE,
      viewMode: initial?.viewMode ?? "grid",
      filterRules: initial?.filterRules,
    };
    setContainers((prev) => [...prev, next]);
    return id;
  }, []);

  const updateContainer = useCallback((id: string, patch: Partial<ContainerData>) => {
    setContainers((prev) =>
      prev.map((container) => (container.id === id ? { ...container, ...patch } : container)),
    );
  }, []);

  const removeContainer = useCallback((id: string) => {
    setContainers((prev) => prev.filter((container) => container.id !== id));
  }, []);

  const value = useMemo<ContainerManagerContextValue>(
    () => ({ containers, addContainer, updateContainer, removeContainer }),
    [addContainer, containers, removeContainer, updateContainer],
  );

  return <ContainerManagerContext.Provider value={value}>{children}</ContainerManagerContext.Provider>;
}

export function useContainerManager(): ContainerManagerContextValue {
  const ctx = useContext(ContainerManagerContext);
  if (!ctx) {
    throw new Error("useContainerManager must be used within a ContainerManagerProvider");
  }
  return ctx;
}
