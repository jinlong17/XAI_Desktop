/**
 * @internal — registry.ts
 *
 * Module-scoped Map<WebModuleId, ModuleSearchAdapter>.
 * Registration is additive: calling registerSearchAdapter with an existing
 * id replaces the adapter (last-registration-wins).
 *
 * Test helpers (__resetCmdkRegistry, getRegisteredAdapters) are exported
 * from the public barrel (src/index.ts) gated by a check on NODE_ENV.
 * However they are always exported from this internal file; the gate is at
 * the barrel layer.
 *
 * api.md §3
 */

import type { WebModuleId } from "@repo/core/types";
import type { ModuleSearchAdapter } from "../types.js";

// Module-scoped registry map (singleton per JS module instance)
const _registry = new Map<WebModuleId, ModuleSearchAdapter>();

/**
 * Register (or replace) a search adapter for a module.
 *
 * - Replaces an existing adapter and logs console.warn in development.
 * - Returns void.
 *
 * api.md §3
 */
export function registerSearchAdapter(
  moduleId: WebModuleId,
  adapter: ModuleSearchAdapter,
): void {
  if (_registry.has(moduleId) && process.env.NODE_ENV === "development") {
    console.warn(
      `[xai-web-cmdk] registerSearchAdapter: adapter for "${moduleId}" is being replaced. ` +
      "This may indicate accidental dual-registration.",
    );
  }
  _registry.set(moduleId, adapter);
}

/**
 * Returns a copy of the current registry Map.
 * Useful for testing and for buildIndex iteration.
 */
export function getRegisteredAdapters(): ReadonlyMap<WebModuleId, ModuleSearchAdapter> {
  return _registry;
}

/**
 * Clears the registry. ONLY for use in tests.
 *
 * Call this in beforeEach to ensure deterministic per-test state.
 * Not intended for production use.
 */
export function __resetCmdkRegistry(): void {
  _registry.clear();
}
