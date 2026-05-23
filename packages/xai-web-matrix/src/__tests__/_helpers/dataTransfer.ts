/**
 * DataTransfer shim for HTML5 DnD tests in jsdom.
 *
 * jsdom's DataTransfer is incomplete. This shim provides the minimal
 * interface needed to simulate drag-start/drop sequences in Vitest + jsdom.
 *
 * Usage:
 *   const dt = createDataTransferShim();
 *   fireEvent.dragStart(card, { dataTransfer: dt });
 *   fireEvent.drop(target, { dataTransfer: dt });
 */

export function createDataTransferShim(
  initial: Record<string, string> = {},
): {
  getData: (k: string) => string;
  setData: (k: string, v: string) => void;
  types: string[];
  effectAllowed: string;
  dropEffect: string;
} {
  const store: Record<string, string> = { ...initial };
  let _effectAllowed = "all";
  let _dropEffect = "move";

  const shim = {
    getData: (k: string) => store[k] ?? "",
    setData: (k: string, v: string) => {
      store[k] = v;
    },
    get types() { return Object.keys(store); },
    get effectAllowed() { return _effectAllowed; },
    set effectAllowed(v: string) { _effectAllowed = v; },
    get dropEffect() { return _dropEffect; },
    set dropEffect(v: string) { _dropEffect = v; },
  };

  return shim;
}

/** Creates a DataTransfer already pre-loaded with a matrix card id. */
export function createMatrixCardTransfer(cardId: string) {
  const MIME = "application/x-xai-matrix-card";
  return createDataTransferShim({ [MIME]: cardId });
}
