// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import { useEffect } from "react";

import {
  GridSystemProvider,
  useGridSystem,
} from "./useGridSystem";
import type { LayoutStore } from "./layoutStore";
import type { PersistedLayout } from "./types";

/**
 * Builds a fake LayoutStore whose load() blocks until `resolve` is
 * called. We use this to simulate the race: user creates a grid before
 * the async hydrate finishes — the hydrate result must NOT clobber the
 * user's grid (B2 fix).
 */
function deferredLayoutStore(loaded: PersistedLayout) {
  let resolveLoad: () => void = () => undefined;
  const loadPromise = new Promise<void>((r) => {
    resolveLoad = r;
  });
  const saveCalls: PersistedLayout[] = [];
  const store: LayoutStore = {
    async load() {
      await loadPromise;
      return loaded;
    },
    async save(layout) {
      saveCalls.push(layout);
    },
  };
  return {
    store,
    resolveLoad: () => resolveLoad(),
    saveCalls,
  };
}

interface HarnessProps {
  onReady: (api: ReturnType<typeof useGridSystem>) => void;
}

function Harness({ onReady }: HarnessProps) {
  const api = useGridSystem();
  useEffect(() => {
    onReady(api);
  });
  return null;
}

describe("GridSystemProvider hydrate guard", () => {
  it("discards a late hydrate when the user has already created a grid", async () => {
    const loadedLayout: PersistedLayout = {
      grids: [
        {
          id: "grid-from-disk",
          title: "Persisted",
          rect: { x: 0, y: 0, width: 320, height: 480 },
          isLocked: false,
          isFolded: false,
          viewMode: "grid",
          itemIds: [],
        },
      ],
      items: [],
    };
    const { store, resolveLoad } = deferredLayoutStore(loadedLayout);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    let latestApi: ReturnType<typeof useGridSystem> | null = null;
    const onReady = (api: ReturnType<typeof useGridSystem>) => {
      latestApi = api;
    };

    render(
      <GridSystemProvider store={store}>
        <Harness onReady={onReady} />
      </GridSystemProvider>,
    );

    // Initial state: nothing hydrated, no grids.
    expect(latestApi).not.toBeNull();
    expect(latestApi!.grids).toEqual([]);

    // User races the async load: synchronously creates a grid before
    // load() resolves.
    let userGridId = "";
    act(() => {
      userGridId = latestApi!.createGrid(50, 50, "grid-user");
    });
    expect(userGridId).toBe("grid-user");
    expect(latestApi!.grids.map((g) => g.id)).toEqual(["grid-user"]);

    // Now let the async load() resolve. The hydrate must detect
    // userTouched and bail out without clobbering the user's grid.
    await act(async () => {
      resolveLoad();
      // Flush microtasks queued by the await inside the hydrate effect.
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(latestApi!.grids.map((g) => g.id)).toEqual(["grid-user"]);
    // The loaded grid was NOT applied.
    expect(latestApi!.grids.some((g) => g.id === "grid-from-disk")).toBe(false);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        "[useGridSystem] hydrate result discarded",
      ),
    );

    warn.mockRestore();
  });
});
