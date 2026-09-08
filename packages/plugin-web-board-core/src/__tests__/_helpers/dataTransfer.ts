/**
 * Test helper — minimal HTML5 DataTransfer mock for jsdom.
 *
 * jsdom does not implement DataTransfer fully. Tests that need to assert
 * `dataTransfer.setData(MIME, payload)` from a drag-start handler use this
 * helper to feed a synthetic object onto the fireEvent dragstart payload.
 */

export interface DataTransferMock {
  effectAllowed: string;
  dropEffect: string;
  types: string[];
  setData: (format: string, data: string) => void;
  getData: (format: string) => string;
  data: Map<string, string>;
}

export function makeDataTransferMock(): DataTransferMock {
  const data = new Map<string, string>();
  const types: string[] = [];
  return {
    effectAllowed: "none",
    dropEffect: "none",
    types,
    setData(format: string, value: string) {
      data.set(format, value);
      if (!types.includes(format)) types.push(format);
    },
    getData(format: string) {
      return data.get(format) ?? "";
    },
    data,
  };
}
