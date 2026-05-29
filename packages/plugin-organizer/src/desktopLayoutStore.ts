import {
  createTauriRepo,
  migrateOrganizerLayoutToRepos,
  type GridEntity,
  type GridItemEntity,
  type OrganizerLayoutMigrationResult,
  type Repo,
  type StorageLike,
} from "@repo/core-data";
import {
  localStorageLayoutStore,
  repositoryLayoutStore,
  type LayoutStore,
} from "./layoutStore";

type InvokeFn = <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;

export const ORGANIZER_GRID_REPO_NAMESPACE = "plugin-organizer-grids";
export const ORGANIZER_ITEM_REPO_NAMESPACE = "plugin-organizer-items";

export interface OrganizerDesktopLayoutStoreOptions {
  canUseTauriRepo?: () => boolean;
  createGridRepo?: (invoke: InvokeFn) => Repo<GridEntity>;
  createItemRepo?: (invoke: InvokeFn) => Repo<GridItemEntity>;
  migrationStorage?: StorageLike | null;
  localStore?: LayoutStore;
  onMigrationResult?: (result: OrganizerLayoutMigrationResult) => void;
  onMigrationError?: (error: unknown) => void;
}

export function canUseOrganizerTauriRepoRuntime(): boolean {
  return (
    typeof window !== "undefined" &&
    Boolean((window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__)
  );
}

export function createOrganizerDesktopLayoutStore(
  invoke: InvokeFn,
  options: OrganizerDesktopLayoutStoreOptions = {},
): LayoutStore {
  const fallbackStore = options.localStore ?? localStorageLayoutStore();
  const useTauriRepo = options.canUseTauriRepo ?? canUseOrganizerTauriRepoRuntime;
  if (!useTauriRepo()) {
    return fallbackStore;
  }

  const gridRepo =
    options.createGridRepo?.(invoke) ??
    createTauriRepo<GridEntity>(invoke, {
      namespace: ORGANIZER_GRID_REPO_NAMESPACE,
      schemaVersion: 1,
    });
  const itemRepo =
    options.createItemRepo?.(invoke) ??
    createTauriRepo<GridItemEntity>(invoke, {
      namespace: ORGANIZER_ITEM_REPO_NAMESPACE,
      schemaVersion: 1,
    });
  const repoStore = repositoryLayoutStore({ gridRepo, itemRepo });

  let bootstrapOnce: Promise<void> | null = null;
  const ensureBootstrap = async (): Promise<void> => {
    if (bootstrapOnce) {
      await bootstrapOnce;
      return;
    }
    bootstrapOnce = (async () => {
      const storage = resolveMigrationStorage(options.migrationStorage);
      if (!storage) {
        return;
      }
      try {
        const result = await migrateOrganizerLayoutToRepos({
          storage,
          gridRepo,
          itemRepo,
          removeLegacy: false,
        });
        options.onMigrationResult?.(result);
      } catch (error) {
        options.onMigrationError?.(error);
      }
    })();
    await bootstrapOnce;
  };

  return {
    async load() {
      await ensureBootstrap();
      return repoStore.load();
    },
    async save(layout) {
      await ensureBootstrap();
      await repoStore.save(layout);
    },
  };
}

function resolveMigrationStorage(
  value: OrganizerDesktopLayoutStoreOptions["migrationStorage"],
): StorageLike | null {
  if (value === null) return null;
  if (value !== undefined) return value;
  if (typeof localStorage === "undefined") return null;
  return localStorage as unknown as StorageLike;
}
