import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DesktopItem, GridBox, PersistedLayout } from "./types";
import { defaultGrid } from "./mockData";
import {
  ORGANIZER_LAYOUT_STORAGE_KEY,
  localStorageLayoutStore,
  type LayoutStore,
} from "./layoutStore";

const STORAGE_KEY = ORGANIZER_LAYOUT_STORAGE_KEY;
const TITLE_BAR_HEIGHT = 40;

const DEBUG_CLEAR_ON_STARTUP = false;

interface GridSystemContextValue {
  grids: GridBox[];
  items: Record<string, DesktopItem>;
  createGrid: (x: number, y: number, requestedId?: string) => string;
  updateGrid: (id: string, patch: Partial<GridBox>) => void;
  toggleFold: (id: string) => void;
  deleteGrid: (id: string) => void;
  clearAll: () => void;
  moveItem: (itemId: string, fromId: string, toId: string) => void;
  toggleLock: (id: string) => void;
  addItem: (item: DesktopItem) => void;
  addItemToGrid: (gridId: string, itemId: string) => void;
  findGridAtPosition: (x: number, y: number) => GridBox | null;
}

const GridSystemContext = createContext<GridSystemContextValue | undefined>(undefined);

const toId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `grid-${Math.random().toString(16).slice(2)}`;

export interface GridSystemProviderProps {
  children: ReactNode;
  /**
   * Optional opt-in seam for the G1.5 Repository-backed persistence
   * adapter. Defaults to `localStorageLayoutStore()` to preserve the
   * historical synchronous localStorage path.
   *
   * Both `load()` and `save()` throws are caught by the adapter so a
   * corrupted state can never whiteout the desktop.
   */
  store?: LayoutStore;
}

export function GridSystemProvider({ children, store }: GridSystemProviderProps) {
  const layoutStore = useMemo(() => store ?? localStorageLayoutStore(), [store]);
  const [grids, setGrids] = useState<GridBox[]>([]);
  const [items, setItems] = useState<Record<string, DesktopItem>>({});
  const [hydrated, setHydrated] = useState(false);
  const heightCache = useRef<Record<string, number>>({});
  const saveTimer = useRef<number | null>(null);

  // Hydrate
  useEffect(() => {
    if (DEBUG_CLEAR_ON_STARTUP) {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(STORAGE_KEY);
      }
      setGrids([]);
      setItems({});
      setHydrated(true);
      return;
    }

    let cancelled = false;
    void (async () => {
      let data: PersistedLayout | null = null;
      try {
        data = await layoutStore.load();
      } catch {
        // Defence in depth — every concrete LayoutStore already swallows
        // its own errors. We catch here so a future store implementation
        // cannot whiteout the desktop on startup.
        data = null;
      }
      if (cancelled) return;
      if (data && Array.isArray(data.grids) && Array.isArray(data.items)) {
        const mappedItems: Record<string, DesktopItem> = {};
        data.items.forEach((item) => {
          mappedItems[item.id] = item;
        });
        setItems(mappedItems);
        setGrids(data.grids);
      } else {
        setGrids([]);
        setItems({});
      }
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [layoutStore]);

  const createGrid = useCallback(
    (x: number, y: number, requestedId?: string) => {
      const id = requestedId ?? toId();
      const base = defaultGrid(id, x, y);

      // Create empty grid - no mock data
      const nextGrid: GridBox = { ...base, itemIds: [] };
      setGrids((prev) => (prev.some((grid) => grid.id === id) ? prev : [...prev, nextGrid]));
      return id;
    },
    [],
  );

  const updateGrid = useCallback(
    (id: string, patch: Partial<GridBox>) => {
      setGrids((prev) => prev.map((grid) => (grid.id === id ? { ...grid, ...patch } : grid)));
    },
    [],
  );

  const toggleFold = useCallback(
    (id: string) => {
      setGrids((prev) =>
        prev.map((grid) => {
          if (grid.id !== id) return grid;
          if (!grid.isFolded) {
            heightCache.current[id] = grid.rect.height;
            return { ...grid, isFolded: true, rect: { ...grid.rect, height: TITLE_BAR_HEIGHT } };
          }
          const restoredHeight = heightCache.current[id] ?? 220;
          return { ...grid, isFolded: false, rect: { ...grid.rect, height: restoredHeight } };
        }),
      );
    },
    [],
  );

  const deleteGrid = useCallback(
    (id: string) => {
      setGrids((prev) => {
        const nextGrids = prev.filter((grid) => grid.id !== id);
        return nextGrids;
      });
    },
    [],
  );

  // Wipe all grids + items and forget the persisted layout. useMultiWindowGrids
  // observes `grids` going from N to 0 and will close every native window.
  const clearAll = useCallback(() => {
    setGrids([]);
    setItems({});
    heightCache.current = {};
    void layoutStore.save({ grids: [], items: [] });
  }, [layoutStore]);

  const moveItem = useCallback(
    (itemId: string, fromId: string, toId: string) => {
      if (fromId === toId) return;
      setGrids((prev) =>
        prev.map((grid) => {
          if (grid.id === fromId) {
            return { ...grid, itemIds: grid.itemIds.filter((id) => id !== itemId) };
          }
          if (grid.id === toId) {
            return { ...grid, itemIds: [...grid.itemIds, itemId] };
          }
          return grid;
        }),
      );
    },
    [],
  );

  const toggleLock = useCallback((id: string) => {
    setGrids((prev) =>
      prev.map((grid) => (grid.id === id ? { ...grid, isLocked: !grid.isLocked } : grid)),
    );
  }, []);

  const addItem = useCallback((item: DesktopItem) => {
    setItems((prev) => ({ ...prev, [item.id]: item }));
  }, []);

  const addItemToGrid = useCallback((gridId: string, itemId: string) => {
    setGrids((prev) =>
      prev.map((grid) =>
        grid.id === gridId && !grid.itemIds.includes(itemId)
          ? { ...grid, itemIds: [...grid.itemIds, itemId] }
          : grid
      ),
    );
  }, []);

  const findGridAtPosition = useCallback(
    (x: number, y: number): GridBox | null => {
      // Find the grid that contains the given position
      return grids.find((grid) => {
        const { rect } = grid;
        return (
          x >= rect.x &&
          x <= rect.x + rect.width &&
          y >= rect.y &&
          y <= rect.y + rect.height
        );
      }) || null;
    },
    [grids],
  );

  // Debounced persistence
  useEffect(() => {
    if (!hydrated) return;
    if (saveTimer.current) {
      window.clearTimeout(saveTimer.current);
    }
    saveTimer.current = window.setTimeout(() => {
      const payload: PersistedLayout = { grids, items: Object.values(items) };
      void layoutStore.save(payload);
    }, 1000);
    return () => {
      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current);
      }
    };
  }, [grids, items, hydrated, layoutStore]);

  const value = useMemo<GridSystemContextValue>(
    () => ({
      grids,
      items,
      createGrid,
      updateGrid,
      toggleFold,
      deleteGrid,
      clearAll,
      moveItem,
      toggleLock,
      addItem,
      addItemToGrid,
      findGridAtPosition,
    }),
    [
      addItem,
      addItemToGrid,
      clearAll,
      createGrid,
      deleteGrid,
      findGridAtPosition,
      grids,
      items,
      moveItem,
      toggleFold,
      toggleLock,
      updateGrid,
    ],
  );

  return <GridSystemContext.Provider value={value}>{children}</GridSystemContext.Provider>;
}

export function useGridSystem(): GridSystemContextValue {
  const ctx = useContext(GridSystemContext);
  if (!ctx) throw new Error("useGridSystem must be used within a GridSystemProvider");
  return ctx;
}

/**
 * Same as useGridSystem, but returns null instead of throwing when no
 * GridSystemProvider is present. Use this in components that may render in
 * windows that don't host the grid state (e.g. per-grid native windows).
 */
export function useGridSystemOptional(): GridSystemContextValue | null {
  return useContext(GridSystemContext) ?? null;
}
