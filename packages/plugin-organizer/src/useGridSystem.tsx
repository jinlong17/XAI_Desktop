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
import { defaultGrid, generateMockItems } from "./mockData";

const STORAGE_KEY = "xai-desktop-layout";
const TITLE_BAR_HEIGHT = 40;

interface GridSystemContextValue {
  grids: GridBox[];
  items: Record<string, DesktopItem>;
  createGrid: (x: number, y: number) => void;
  updateGrid: (id: string, patch: Partial<GridBox>) => void;
  toggleFold: (id: string) => void;
  deleteGrid: (id: string) => void;
  moveItem: (itemId: string, fromId: string, toId: string) => void;
  toggleLock: (id: string) => void;
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
  const heightCache = useRef<Record<string, number>>({});
  const saveTimer = useRef<number | null>(null);

  // Hydrate
  useEffect(() => {
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

  // Debounced persistence
  useEffect(() => {
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
  }, [grids, items]);

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
    }),
    [createGrid, deleteGrid, grids, items, moveItem, toggleFold, toggleLock, updateGrid],
  );

  return <GridSystemContext.Provider value={value}>{children}</GridSystemContext.Provider>;
}

export function useGridSystem(): GridSystemContextValue {
  const ctx = useContext(GridSystemContext);
  if (!ctx) throw new Error("useGridSystem must be used within a GridSystemProvider");
  return ctx;
}
