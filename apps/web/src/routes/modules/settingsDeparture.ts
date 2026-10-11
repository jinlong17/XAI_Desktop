/** Narrow host delegate for the currently mounted guarded Web module. */
export type DepartureReason = "sign-out";
export interface DepartureDelegate {
  readonly requestDeparture: (reason: DepartureReason) => Promise<boolean>;
}

let current: DepartureDelegate | null = null;

export function registerDepartureDelegate(delegate: DepartureDelegate): () => void {
  current = delegate;
  return () => { if (current === delegate) current = null; };
}

export function requestDeparture(reason: DepartureReason): Promise<boolean> {
  return current ? current.requestDeparture(reason) : Promise.resolve(true);
}

/** Compatibility names retained for App and existing independent test seams. */
export type SettingsDepartureReason = DepartureReason;
export type SettingsDepartureDelegate = DepartureDelegate;
export const registerSettingsDepartureDelegate = registerDepartureDelegate;
export const requestSettingsDeparture = requestDeparture;
