/**
 * Finder collaboration client (G3-E3).
 *
 * Wraps the Tauri `reveal_in_finder` / `open_path` commands and never
 * imports `@tauri-apps/api` directly (red line #4). The caller must
 * pass an `invoke` function obtained from `useTauriInvoke()`.
 */

type InvokeFn = <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;

export interface FinderClient {
  revealInFinder(path: string): Promise<void>;
  openPath(path: string): Promise<void>;
}

export function createFinderClient(invoke: InvokeFn): FinderClient {
  return {
    async revealInFinder(path: string) {
      await invoke<void>("reveal_in_finder", { input: { path } });
    },
    async openPath(path: string) {
      await invoke<void>("open_path", { input: { path } });
    },
  };
}
