import { invoke } from "@tauri-apps/api/core";
import type { GridWindowRect, GridWindowSnapshot } from "@repo/core/types";

export type { GridWindowRect, GridWindowSnapshot };

/**
 * Create a new grid window at the specified position
 */
export async function createGridWindow(
  gridId: string,
  rect: GridWindowRect
): Promise<GridWindowSnapshot> {
  try {
    const snapshot = await invoke<GridWindowSnapshot>("create_grid_window", {
      gridId,
      rect,
    });
    console.log(`✅ Created grid window: ${gridId}`);
    return snapshot;
  } catch (error) {
    console.error(`❌ Failed to create grid window: ${gridId}`, error);
    throw error;
  }
}

/**
 * Update an existing grid window's position and size
 */
export async function updateGridWindow(
  gridId: string,
  rect: GridWindowRect
): Promise<GridWindowSnapshot> {
  try {
    return await invoke<GridWindowSnapshot>("update_grid_window", {
      gridId,
      rect,
    });
  } catch (error) {
    console.error(`❌ Failed to update grid window: ${gridId}`, error);
    throw error;
  }
}

/**
 * Close and destroy a grid window
 */
export async function closeGridWindow(gridId: string): Promise<void> {
  try {
    await invoke("close_grid_window", {
      gridId,
    });
    console.log(`🗑️ Closed grid window: ${gridId}`);
  } catch (error) {
    console.error(`❌ Failed to close grid window: ${gridId}`, error);
    throw error;
  }
}

export async function listGridWindows(): Promise<GridWindowSnapshot[]> {
  try {
    return await invoke<GridWindowSnapshot[]>("list_grid_windows");
  } catch (error) {
    console.error("❌ Failed to list grid windows", error);
    throw error;
  }
}

export async function focusGridWindow(gridId: string): Promise<GridWindowSnapshot> {
  try {
    return await invoke<GridWindowSnapshot>("focus_grid_window", {
      gridId,
    });
  } catch (error) {
    console.error(`❌ Failed to focus grid window: ${gridId}`, error);
    throw error;
  }
}
