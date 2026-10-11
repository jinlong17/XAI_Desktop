import { afterEach, describe, expect, it, vi } from 'vitest';
import { accountScope, lifecycleForKey } from '@repo/plugin-web-storage';
import { createMeditationController, ACTIVE_KEY, elapsedAt } from '../internal/sessionController.js';
import { DEFAULT_PREFS } from '../constants.js';
const physical = () => accountScope.physicalKey(ACTIVE_KEY);
afterEach(() => vi.restoreAllMocks());
describe('durable meditation business protocol', () => {
  it('stops its observation timer after durable expiry', async () => {
    vi.useFakeTimers(); vi.setSystemTime(0); const c = createMeditationController(); const release = c.retain();
    const intervals = vi.spyOn(globalThis, 'setInterval'), clears = vi.spyOn(globalThis, 'clearInterval');
    await c.command('start', { ...DEFAULT_PREFS, duration: 1 }); expect(intervals).toHaveBeenCalledTimes(1);
    const ownedTimer = intervals.mock.results[0]!.value;
    await vi.advanceTimersByTimeAsync(60000); expect(c.getSnapshot().active!.phase).toBe('ended'); expect(clears).toHaveBeenCalledWith(ownedTimer); release();
  });
  it('B can start while A lock remains held; late A cannot change B busy or data', async () => {
    const c = createMeditationController(); await c.command('start', DEFAULT_PREFS); const keyA = physical(), bytesA = localStorage.getItem(keyA);
    let release!: () => void;
    Object.defineProperty(navigator, 'locks', { configurable: true, value: { request: (name: string, fn: () => void) => name.endsWith(keyA) ? new Promise<void>((resolve, reject) => { release = () => { try { fn(); resolve(); } catch (error) { reject(error); } }; }) : Promise.resolve().then(fn) } });
    const old = c.command('end'); accountScope.activate(accountScope.lock('new B'), 'B');
    expect(await c.command('start', DEFAULT_PREFS)).toBe(true); const bytesB = localStorage.getItem(physical());
    release(); expect(await old).toBe(false); expect(localStorage.getItem(physical())).toBe(bytesB); expect(localStorage.getItem(keyA)).toBe(bytesA); expect(c.getSnapshot().busy).toBe(false);
  });
  it('manual end clamps clock rollback to the current run start', async () => {
    vi.useFakeTimers(); vi.setSystemTime(100000); const c = createMeditationController(); await c.command('start', DEFAULT_PREFS);
    vi.setSystemTime(50000); await c.command('end'); expect(c.getSnapshot().active).toMatchObject({ endedAt: 100000, accumulatedElapsedMs: 0 });
  });
  it('uses absolute time through suspension; paused time excludes absence and resume keeps remaining duration', async () => {
    vi.useFakeTimers(); vi.setSystemTime(100000);
    const c = createMeditationController(); await c.command('start', DEFAULT_PREFS);
    vi.setSystemTime(160000); expect(elapsedAt(c.getSnapshot().active!, Date.now())).toBe(60000);
    await c.command('pause'); const paused = c.getSnapshot().active!;
    vi.setSystemTime(1160000); expect(elapsedAt(paused, Date.now())).toBe(60000);
    await c.command('resume'); expect(c.getSnapshot().active!.deadline).toBe(2000000);
  });
  it('fresh controller recovers same session and ends once at original deadline', async () => {
    vi.useFakeTimers(); vi.setSystemTime(100000);
    const c = createMeditationController(); await c.command('start', DEFAULT_PREFS);
    const initial = c.getSnapshot().active!; vi.setSystemTime(2000000);
    const reopened = createMeditationController(); await reopened.command('reconcile');
    expect(reopened.getSnapshot().active).toMatchObject({ sessionId: initial.sessionId, phase: 'ended', reason: 'elapsed', endedAt: initial.deadline, revision: 1 });
    const bytes = localStorage.getItem(physical()); await c.command('reconcile'); await reopened.command('reconcile');
    expect(localStorage.getItem(physical())).toBe(bytes);
  });
  it('never expires an infinite session and records manual end exactly once', async () => {
    vi.useFakeTimers(); vi.setSystemTime(0); const c = createMeditationController();
    await c.command('start', { ...DEFAULT_PREFS, durationMode: 'infinite' }); vi.setSystemTime(1e10); await c.command('reconcile');
    expect(c.getSnapshot().active!.phase).toBe('running'); await c.command('end');
    expect(c.getSnapshot().active).toMatchObject({ durationMs: null, reason: 'manual', accumulatedElapsedMs: 1e10 });
    const bytes = localStorage.getItem(physical()); await c.command('end'); expect(localStorage.getItem(physical())).toBe(bytes);
  });
  it('failed pause retains original bytes and retries captured elapsed time', async () => {
    vi.useFakeTimers(); vi.setSystemTime(0); const c = createMeditationController(); await c.command('start', DEFAULT_PREFS);
    vi.setSystemTime(30000); const bytes = localStorage.getItem(physical());
    const fail = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw Error('quota'); });
    expect(await c.command('pause')).toBe(false); expect(localStorage.getItem(physical())).toBe(bytes); expect(c.getSnapshot().error).toContain('quota');
    fail.mockRestore(); vi.setSystemTime(60000); expect(await c.retry()).toBe(true); expect(c.getSnapshot().active!.accumulatedElapsedMs).toBe(30000);
  });
  it('completion quota failure leaves original running bytes and recovers one terminal record', async () => {
    vi.useFakeTimers(); vi.setSystemTime(0); const c = createMeditationController(); await c.command('start', DEFAULT_PREFS);
    const bytes = localStorage.getItem(physical()); vi.setSystemTime(1000000);
    const fail = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw Error('quota'); });
    expect(await c.command('reconcile')).toBe(false); expect(localStorage.getItem(physical())).toBe(bytes);
    fail.mockRestore(); await c.retry(); expect(c.getSnapshot().active).toMatchObject({ phase: 'ended', revision: 1, endedAt: 900000 });
  });
  it('stale revision loses without permanent retry and accepts a new deliberate action', async () => {
    const a = createMeditationController(); await a.command('start', DEFAULT_PREFS);
    const b = createMeditationController(); await b.command('reconcile'); await b.command('pause');
    expect(await a.command('end')).toBe(false); expect(a.getSnapshot().conflict).toBe(true);
    expect(await a.command('resume')).toBe(true); expect(a.getSnapshot().active!.phase).toBe('running');
  });
  it('old queued command cannot write to newly activated B', async () => {
    const a = createMeditationController(); await a.command('start', DEFAULT_PREFS); const keyA = physical(), bytes = localStorage.getItem(keyA);
    let run!: () => void;
    Object.defineProperty(navigator, 'locks', { configurable: true, value: { request: (_name: string, fn: () => void) => new Promise<void>((resolve, reject) => { run = () => { try { fn(); resolve(); } catch (error) { reject(error); } }; }) } });
    const pending = a.command('end'); accountScope.activate(accountScope.lock('B'), 'B'); run();
    expect(await pending).toBe(false); expect(localStorage.getItem(keyA)).toBe(bytes); expect(localStorage.getItem(physical())).toBeNull();
  });
  it('malformed stored bytes are exportable and never silently replaced', async () => {
    localStorage.setItem(physical(), '{broken'); const c = createMeditationController();
    expect(await c.command('start', DEFAULT_PREFS)).toBe(false); expect(c.exportRecovery()).toBe('{broken'); expect(localStorage.getItem(physical())).toBe('{broken');
  });
  it('no Web Locks explicitly refuses a new timer without writing', async () => {
    Object.defineProperty(navigator, 'locks', { configurable: true, value: undefined }); const c = createMeditationController();
    expect(await c.command('start', DEFAULT_PREFS)).toBe(false); expect(c.getSnapshot().error).toContain('Web Locks'); expect(localStorage.getItem(physical())).toBeNull();
  });
  it('active key participates in account lifecycle', () => {
    expect(lifecycleForKey(ACTIVE_KEY)).toMatchObject({ ownership: 'account', accountDeletion: 'erase-owned-generations', exportScope: 'account-current-generation' });
  });
});
