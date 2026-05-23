/**
 * DataTransfer mock for Calendar DnD tests.
 * Matches the pattern from row #7 board-core test helpers.
 */

export function makeDataTransferMock(): DataTransfer {
  const store: Record<string, string> = {};
  return {
    setData(type: string, data: string) {
      store[type] = data;
    },
    getData(type: string) {
      return store[type] ?? "";
    },
    effectAllowed: "move" as const,
    dropEffect: "move" as const,
    clearData() {
      for (const k in store) delete store[k];
    },
    files: [] as unknown as FileList,
    items: [] as unknown as DataTransferItemList,
    types: [],
  } as unknown as DataTransfer;
}
