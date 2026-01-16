import { invoke } from "@tauri-apps/api/core";

export interface GridWindowRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Create a new grid window at the specified position
 */
export async function createGridWindow(
  gridId: string,
  rect: GridWindowRect
): Promise<void> {
  try {
    await invoke("create_grid_window", {
      gridId,
      rect,
    });
    console.log(`✅ Created grid window: ${gridId}`);
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
): Promise<void> {
  try {
    await invoke("update_grid_window", {
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
