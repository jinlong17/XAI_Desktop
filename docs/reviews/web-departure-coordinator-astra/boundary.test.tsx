import React from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, within } from '@testing-library/react';
import { transferableAbortController } from 'node:util';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { DepartureCoordinator, type DepartureGuard, type DepartureCoordinatorRenderProps } from '../../../apps/web/src/routes/modules/departureCoordinator';
import { registerSettingsDepartureDelegate, requestSettingsDeparture } from '../../../apps/web/src/routes/modules/settingsDeparture';

beforeEach(() => vi.stubGlobal('AbortController', transferableAbortController().constructor));
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
const flush = () => act(async () => { await new Promise(resolve => setTimeout(resolve, 0)); });

function scenario() {
  let blocked = true;
  let current = true;
  let mounts = 0;
  let registrations = 0;
  let cleanups = 0;
  const callbacks: DepartureCoordinatorRenderProps[] = [];
  const discard = vi.fn(() => { blocked = false; });
  const exportDraft = vi.fn();
  const guard: DepartureGuard = { token: {}, label: 'Test feature', isCurrent: () => current, isBlocking: () => blocked, discardDraft: discard, exportDraft };
  const registerDelegate = vi.fn(registerSettingsDepartureDelegate);
  function Probe(props: DepartureCoordinatorRenderProps) {
    callbacks.push(props);
    React.useEffect(() => { mounts++; return () => { mounts--; }; }, []);
    React.useEffect(() => {
      registrations++;
      const off = props.registerDepartureGuard(guard);
      return () => { cleanups++; off(); };
    }, [props.registerDepartureGuard]);
    return <div data-testid="probe">Current feature</div>;
  }
  function Scenario() {
    const [lang, setLang] = React.useState<'en' | 'zh'>('en');
    return <><button onClick={() => setLang(x => x === 'en' ? 'zh' : 'en')}>Rerender parent</button>
      <DepartureCoordinator lang={lang} registerSignOutDelegate={registerDelegate}>{props => <Probe {...props}/>}</DepartureCoordinator>
    </>;
  }
  const router = createMemoryRouter([{ path: '/app/settings/*', element: <Scenario/> }, { path: '/app/dashboard', element: <div>Dashboard</div> }], { initialEntries: ['/app/settings/collaborate'] });
  const originalNavigate = router.navigate;
  const ui = render(<RouterProvider router={router}/>);
  return { ui: { ...ui, q: within(ui.container) }, router, originalNavigate, discard, exportDraft, registerDelegate, callbacks,
    state: () => ({ mounts, registrations, cleanups }), invalidate: () => { current = false; } };
}

it('parent language rerenders preserve participant identity, stable callbacks and the original pending intent', async () => {
  const s = scenario(); await flush();
  const firstCallbacks = s.callbacks[0]!;
  await act(async () => { await s.router.navigate('/app/dashboard', { state: { origin: 'first' } }); });
  fireEvent.click(s.ui.q.getByRole('button', { name: 'Rerender parent' })); await flush();
  fireEvent.click(s.ui.q.getByRole('button', { name: 'Rerender parent' })); await flush();
  expect(s.state()).toEqual({ mounts: 1, registrations: 1, cleanups: 0 });
  expect(s.registerDelegate).toHaveBeenCalledTimes(1);
  expect(s.callbacks.every(p => p.registerDepartureGuard === firstCallbacks.registerDepartureGuard && p.isDeparturePending === firstCallbacks.isDeparturePending)).toBe(true);
  expect(firstCallbacks.isDeparturePending()).toBe(true);
  fireEvent.click(s.ui.q.getByRole('button', { name: 'Export current draft' }));
  expect(s.exportDraft).toHaveBeenCalledTimes(1);
  expect(s.router.state.location.pathname).toBe('/app/settings/collaborate');
  fireEvent.click(s.ui.q.getByRole('button', { name: 'Discard local changes and leave' })); await flush();
  expect(s.discard).toHaveBeenCalledTimes(1);
  expect(s.router.state.location).toMatchObject({ pathname: '/app/dashboard', state: { origin: 'first' } });
  expect(s.state()).toEqual({ mounts: 0, registrations: 1, cleanups: 1 });
  expect(s.router.navigate).toBe(s.originalNavigate);
});

it('unmount refuses the pending shared sign-out promise, unregisters the participant and restores native navigate', async () => {
  const s = scenario(); await flush();
  let first!: Promise<boolean>, second!: Promise<boolean>;
  act(() => { first = requestSettingsDeparture('sign-out'); second = requestSettingsDeparture('sign-out'); });
  expect(second).toBe(first);
  expect(s.router.navigate).not.toBe(s.originalNavigate);
  s.ui.unmount();
  expect(await first).toBe(false);
  expect(await second).toBe(false);
  expect(s.discard).not.toHaveBeenCalled();
  expect(s.exportDraft).not.toHaveBeenCalled();
  expect(s.router.navigate).toBe(s.originalNavigate);
  expect(s.state()).toEqual({ mounts: 0, registrations: 1, cleanups: 1 });
  expect(await requestSettingsDeparture('sign-out')).toBe(true);
  await s.router.navigate('/app/dashboard', { state: { after: 'unmount' } });
  expect(s.router.state.location.state).toEqual({ after: 'unmount' });
});

it('old coordinator cleanup cannot unregister a newer settingsDeparture delegate', async () => {
  const s = scenario(); await flush();
  const successor = vi.fn(async () => false);
  const removeSuccessor = registerSettingsDepartureDelegate({ requestDeparture: successor });
  try {
    s.ui.unmount();
    expect(await requestSettingsDeparture('sign-out')).toBe(false);
    expect(successor).toHaveBeenCalledTimes(1);
    expect(s.router.navigate).toBe(s.originalNavigate);
  } finally { removeSuccessor(); }
  expect(await requestSettingsDeparture('sign-out')).toBe(true);
});
