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

const STORAGE_KEY = "xai-desktop-layout";
const TITLE_BAR_HEIGHT = 40;

const DEBUG_CLEAR_ON_STARTUP = false;

interface GridSystemContextValue {
  grids: GridBox[];
  items: Record<string, DesktopItem>;
  createGrid: (x: number, y: number) => void;
  updateGrid: (id: string, patch: Partial<GridBox>) => void;
  toggleFold: (id: string) => void;
  deleteGrid: (id: string) => void;
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

function loadLayout(): PersistedLayout | null {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PersistedLayout;
  } catch {
    return null;
  }
}

function saveLayout(payload: PersistedLayout) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function GridSystemProvider({ children }: { children: ReactNode }) {
  const [grids, setGrids] = useState<GridBox[]>([]);
  const [items, setItems] = useState<Record<string, DesktopItem>>({});
  const [hydrated, setHydrated] = useState(false);
  const heightCache = useRef<Record<string, number>>({});
  const saveTimer = useRef<number | null>(null);

  // Hydrate
  useEffect(() => {
    if (DEBUG_CLEAR_ON_STARTUP) {
      localStorage.removeItem(STORAGE_KEY);
      setGrids([]);
      setItems({});
      setHydrated(true);
      return;
    }

    const data = loadLayout();
    if (data) {
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
  }, []);

  const createGrid = useCallback(
    (x: number, y: number) => {
      const id = toId();
      const base = defaultGrid(id, x, y);

      // Create empty grid - no mock data
      const nextGrid: GridBox = { ...base, itemIds: [] };
      setGrids((prev) => [...prev, nextGrid]);
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
      saveLayout(payload);
    }, 1000);
    return () => {
      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current);
      }
    };
  }, [grids, items, hydrated]);

  const value = useMemo<GridSystemContextValue>(
    () => ({
      grids,
      items,
      createGrid,
      updateGrid,
      toggleFold,
      deleteGrid,
      moveItem,
      toggleLock,
      addItem,
      addItemToGrid,
      findGridAtPosition,
    }),
    [createGrid, deleteGrid, grids, items, moveItem, toggleFold, toggleLock, updateGrid, addItem, addItemToGrid, findGridAtPosition],
  );

  return <GridSystemContext.Provider value={value}>{children}</GridSystemContext.Provider>;
}

export function useGridSystem(): GridSystemContextValue {
  const ctx = useContext(GridSystemContext);
  if (!ctx) throw new Error("useGridSystem must be used within a GridSystemProvider");
  return ctx;
}
