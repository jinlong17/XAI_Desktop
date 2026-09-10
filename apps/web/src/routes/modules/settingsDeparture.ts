/** Narrow host delegate for the currently mounted composed Settings pane. */
export type SettingsDepartureReason = "sign-out";
export interface SettingsDepartureDelegate {
  readonly requestDeparture: (reason: SettingsDepartureReason) => Promise<boolean>;
}

let current: SettingsDepartureDelegate | null = null;

export function registerSettingsDepartureDelegate(delegate: SettingsDepartureDelegate): () => void {
  current = delegate;
  return () => { if (current === delegate) current = null; };
}

export function requestSettingsDeparture(reason: SettingsDepartureReason): Promise<boolean> {
  return current ? current.requestDeparture(reason) : Promise.resolve(true);
}
