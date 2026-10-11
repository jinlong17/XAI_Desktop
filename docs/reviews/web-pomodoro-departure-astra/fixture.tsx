import React from 'react';
import { act, fireEvent, render } from '@testing-library/react';
import { expect, vi } from 'vitest';
import { PomodoroModule } from '../../../packages/plugin-web-pomodoro/src/PomodoroModule';
export * from '../web-d2-pomo-device-astra/fixture';
import { nativeSet, key, type Name } from '../web-d2-pomo-device-astra/fixture';

// Structural public capability only; no import of an implementation hook or app.
export interface Guard { token: object; isCurrent(): boolean; isBlocking(): boolean; exportDraft(): void; discardDraft(): void; }
export function withGuard() {
  let latest: Guard | undefined;
  const props = { lang: 'en' as const, registerDepartureGuard: (guard: Guard) => { latest = guard; return () => {}; } };
  const ui = render(<PomodoroModule {...props}/>);
  return { ui, guard: () => { expect(latest, 'real component must publish its public preference departure capability').toBeDefined(); return latest!; } };
}
export function unload() { const e = new Event('beforeunload', { cancelable: true }); window.dispatchEvent(e); return e.defaultPrevented; }
export const clickRetry = (ui: ReturnType<typeof render>) => fireEvent.click(ui.getByRole('button', { name: 'Retry preferences' }));
export function deny(names: Name[]) { return vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function(this: Storage, k: string, value: string) { if (names.some(name => key(name) === k)) throw new DOMException('quota', 'QuotaExceededError'); nativeSet.call(this, k, value); }); }
export function exportCapture() {
  const blobs: Blob[] = [];
  const clicks: string[] = [];
  const revoke = vi.fn();
  vi.stubGlobal('URL', class extends URL { static createObjectURL(b: Blob) { blobs.push(b); return 'blob:astra-pomo'; } static revokeObjectURL = revoke; });
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function(this: HTMLAnchorElement) { clicks.push(this.download); });
  return { blobs, clicks, revoke, async json() { expect(blobs.length).toBeGreaterThan(0); return JSON.parse(await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsText(blobs.at(-1)!); })); } };
}
export const invoke = async (operation: () => void) => act(async () => { operation(); });
