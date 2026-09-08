/**
 * Finder collaboration client (G3-E3).
 *
 * Wraps the Tauri `reveal_in_finder` / `open_path` /
 * `register_path_bookmark` / `clear_path_bookmark` commands and never
 * imports `@tauri-apps/api` directly (red line #4). The caller must
 * pass an `invoke` function obtained from `useTauriInvoke()`.
 *
 * G3-E3 P0 (honest provenance): the Rust side now requires every
 * `reveal_in_finder` / `open_path` target to be present in the
 * in-memory `BookmarkRegistry`. Callers MUST invoke `registerBookmark`
 * for each user-authorized path (drag-drop or open-panel selection)
 * before they can be revealed/opened, otherwise the Rust command
 * returns `E3004 sync capability denied — no user-authorized bookmark`.
 */

type InvokeFn = <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;

export interface FinderClient {
  revealInFinder(path: string): Promise<void>;
  openPath(path: string): Promise<void>;
  /**
   * Record a user-authorized path bookmark. Required before
   * `revealInFinder` / `openPath` will succeed for that path.
   * Idempotent — safe to call multiple times for the same path.
   */
  registerBookmark(path: string): Promise<void>;
  /**
   * Remove a previously-registered path bookmark. Idempotent —
   * removing an absent path is not an error.
   */
  clearBookmark(path: string): Promise<void>;
  readFinderTags(path: string): Promise<FinderTagPayload[]>;
  writeFinderTags(path: string, tags: FinderTagPayload[]): Promise<void>;
}

export interface FinderTagPayload {
  name: string;
  color?: string;
}

export function createFinderClient(invoke: InvokeFn): FinderClient {
  return {
    async revealInFinder(path: string) {
      await invoke<void>("reveal_in_finder", { input: { path } });
    },
    async openPath(path: string) {
      await invoke<void>("open_path", { input: { path } });
    },
    async registerBookmark(path: string) {
      await invoke<void>("register_path_bookmark", { input: { path } });
    },
    async clearBookmark(path: string) {
      await invoke<void>("clear_path_bookmark", { input: { path } });
    },
    async readFinderTags(path: string) {
      return invoke<FinderTagPayload[]>("read_finder_tags", { input: { path } });
    },
    async writeFinderTags(path: string, tags: FinderTagPayload[]) {
      await invoke<void>("write_finder_tags", { input: { path, tags } });
    },
  };
}
