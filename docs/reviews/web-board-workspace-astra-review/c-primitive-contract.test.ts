import { beforeAll, beforeEach, afterEach, expect, it, vi } from 'vitest';
import { accountScope, generationKey, generationMarkerKey, accountPrefix } from '@repo/plugin-web-storage';
import { BINDING_READY, runPrimitive, signatureFor, receiptIdentity, resetActivation, type Data, type Input, type Lock } from './c-primitive-adapter.js';

beforeAll(() => { if (!BINDING_READY) throw Error('PREPARATION ONLY: fixed-commit C binding not supplied.'); });
const logical = 'xai_calendar_events';
const owner = 'astra-c';
const generation = 'g1';
const physical = generationKey(owner, generation, logical);
const marker = generationMarkerKey(owner);
const deleteOperation = 'delete:item:v1';
const receipt = { operationVersion: 1, signature: signatureFor(deleteOperation), result: { ok: true, targetId: 'item' }, committedAt: '2026-09-09T12:00:00.000Z' };
const envelope = (data: unknown = {}, receipts: Record<string, unknown> = {}, revision = 1) => ({ format: 'xai-command-state', version: 1, revision, data, receipts });
const validate = (value: unknown): value is Data => value !== null && typeof value === 'object' && !Array.isArray(value) && Object.values(value).every(row => row !== null && typeof row === 'object' && typeof row.title === 'string');
const lock: Lock = async (_name, run) => run();
const opts = (patch: Partial<Input> = {}): Input => ({ scope: accountScope.capture(), requestId: 'ai:req1', signature: 'create:item:v1', enabled: true, lock, initial: () => ({}), validate, mutate: data => ({ data: { ...data, item: { title: 'Created' } }, targetId: 'item' }), ...patch });
const bytes = () => localStorage.getItem(physical);
const put = (value: unknown) => localStorage.setItem(physical, JSON.stringify(value));
const operations = () => vi.spyOn(Storage.prototype, 'setItem');
beforeEach(() => {
  localStorage.clear(); accountScope.activate(accountScope.lock(owner), generation);
  localStorage.setItem(marker, JSON.stringify({ generation, migrationId: 'existing', previous: null }));
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); resetActivation(); });

it('activation is disabled by default: no mutator or storage write', async () => {
  const mutate = vi.fn(opts().mutate); const write = operations();
  const result = await runPrimitive(opts({ enabled: undefined, mutate }));
  expect(result.ok).toBe(false); expect(mutate).not.toHaveBeenCalled(); expect(write).not.toHaveBeenCalled(); expect(bytes()).toBeNull();
});
it('first physically absent dataset commits data and receipt together with exactly one same-key write', async () => {
  const write = operations(); const result = await runPrimitive(opts());
  expect(result).toEqual({ ok: true, targetId: 'item' });
  expect(write.mock.calls).toHaveLength(1); expect(write.mock.calls[0]![0]).toBe(physical);
  const value = JSON.parse(bytes()!); expect(value.data.item.title).toBe('Created');
  expect(Object.values(value.receipts)).toContainEqual(expect.objectContaining({ signature: signatureFor('create:item:v1'), result: { ok: true, targetId: 'item' } }));
});
it('valid legacy upgrades once, preserving the existing data alongside receipt', async () => {
  put({ old: { title: 'Old' } }); const write = operations();
  expect((await runPrimitive(opts())).ok).toBe(true);
  expect(write).toHaveBeenCalledTimes(1); expect(JSON.parse(bytes()!).data).toEqual({ old: { title: 'Old' }, item: { title: 'Created' } });
});
it.each(['null','envelope-null','array','invalid-json','unsupported','bad-receipt'])('rejects %s source without seeding or rewriting', async mode => {
  const raw = mode === 'null' ? 'null' : mode === 'invalid-json' ? '{broken' : JSON.stringify(mode === 'envelope-null' ? envelope(null) : mode === 'array' ? [] : mode === 'unsupported' ? { ...envelope(), version: 2 } : envelope({}, { bad: {} }));
  localStorage.setItem(physical, raw); const write = operations(); const mutate = vi.fn(opts().mutate); const initial = vi.fn(() => ({}));
  expect((await runPrimitive(opts({ mutate, initial }))).ok).toBe(false);
  expect(write).not.toHaveBeenCalled(); expect(mutate).not.toHaveBeenCalled(); expect(initial).not.toHaveBeenCalled(); expect(bytes()).toBe(raw);
});
it('quota before the only write preserves exact legacy bytes and leaves request retryable', async () => {
  put({ old: { title: 'Old' } }); const raw = bytes(); const native = Storage.prototype.setItem;
  const failure = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function(k, v) { if (k === physical) throw new DOMException('quota', 'QuotaExceededError'); native.call(this, k, v); });
  expect((await runPrimitive(opts())).ok).toBe(false); expect(bytes()).toBe(raw);
  failure.mockRestore(); expect((await runPrimitive(opts())).ok).toBe(true); const committed = bytes();
  expect((await runPrimitive(opts())).ok).toBe(true); expect(bytes()).toBe(committed);
});
it('receipt replay precedes mutation/target lookup and survives fresh same-account scope', async () => {
  expect((await runPrimitive(opts({ signature: deleteOperation, mutate: () => ({ data: {}, targetId: 'item' }) }))).ok).toBe(true);
  const raw = bytes(); accountScope.activate(accountScope.lock(owner), generation);
  const mutate = vi.fn(() => { throw Error('target no longer exists'); }); const write = operations();
  expect(await runPrimitive(opts({ signature: deleteOperation, mutate }))).toEqual({ ok: true, targetId: 'item' });
  expect(mutate).not.toHaveBeenCalled(); expect(write).not.toHaveBeenCalled(); expect(bytes()).toBe(raw);
});
it('lost response after commit replays the exact saved result with no second mutation or write', async () => {
  await runPrimitive(opts()); // Deliberately discard the successful caller response.
  const raw = bytes(); const mutate = vi.fn(opts().mutate); const write = operations();
  expect(await runPrimitive(opts({ mutate }))).toEqual({ ok: true, targetId: 'item' });
  expect(mutate).not.toHaveBeenCalled(); expect(write).not.toHaveBeenCalled(); expect(bytes()).toBe(raw);
});
it('same request with different signature conflicts without calling mutator', async () => {
  await runPrimitive(opts()); const raw = bytes(); const mutate = vi.fn(opts().mutate); const write = operations();
  expect((await runPrimitive(opts({ signature: 'different', mutate }))).ok).toBe(false);
  expect(mutate).not.toHaveBeenCalled(); expect(write).not.toHaveBeenCalled(); expect(bytes()).toBe(raw);
});
it('full receipt capacity rejects a new identity but permits existing replay without eviction', async () => {
  const receipts = Object.fromEntries(Array.from({ length: 512 }, (_, i) => [receiptIdentity(`ai:r${i}`), receipt])); put(envelope({}, receipts)); const raw = bytes();
  const mutate = vi.fn(opts().mutate); const write = operations();
  expect((await runPrimitive(opts({ requestId: 'ai:new', mutate }))).ok).toBe(false);
  expect(await runPrimitive(opts({ requestId: 'ai:r0', signature: deleteOperation, mutate }))).toEqual({ ok: true, targetId: 'item' });
  expect(mutate).not.toHaveBeenCalled(); expect(write).not.toHaveBeenCalled(); expect(bytes()).toBe(raw);
});
it.each(['__proto__','constructor','toString'])('receipt identity %s remains an own JSON property and replays safely', async requestId => {
  expect((await runPrimitive(opts({ requestId }))).ok).toBe(true); const raw = bytes();
  expect(Object.hasOwn(JSON.parse(raw!).receipts, receiptIdentity(requestId))).toBe(true);
  const mutate = vi.fn(() => { throw Error('must not replay'); });
  expect((await runPrimitive(opts({ requestId, mutate }))).ok).toBe(true); expect(mutate).not.toHaveBeenCalled(); expect(bytes()).toBe(raw);
});
it.each([null, [], { item: { title: 17 } }])('validates mutator output %j before committing any receipt', async output => {
  put({}); const raw = bytes(); const write = operations();
  expect((await runPrimitive(opts({ mutate: () => ({ data: output, targetId: 'item' }) }))).ok).toBe(false);
  expect(write).not.toHaveBeenCalled(); expect(bytes()).toBe(raw);
});
it('rejects an invalid successful target identifier before committing', async () => {
  const write = operations(); expect((await runPrimitive(opts({ mutate: data => ({ data, targetId: '' }) }))).ok).toBe(false); expect(write).not.toHaveBeenCalled();
});
it('lock acquisition rejection never executes unlocked', async () => {
  const mutate = vi.fn(opts().mutate); const write = operations(); const unavailable: Lock = async () => { throw Error('lock unavailable'); };
  expect((await runPrimitive(opts({ lock: unavailable, mutate }))).ok).toBe(false); expect(mutate).not.toHaveBeenCalled(); expect(write).not.toHaveBeenCalled();
});
it('missing browser Web Locks rejects without an unlocked fallback', async () => {
  vi.stubGlobal('navigator', {});
  const mutate = vi.fn(opts().mutate); const write = operations();
  expect((await runPrimitive(opts({ lock: undefined, mutate }))).ok).toBe(false);
  expect(mutate).not.toHaveBeenCalled(); expect(write).not.toHaveBeenCalled();
});
it('revision exhaustion rejects a new command without corrupting the record', async () => {
  put(envelope({}, {}, Number.MAX_SAFE_INTEGER)); const raw = bytes(); const write = operations();
  expect((await runPrimitive(opts())).ok).toBe(false); expect(write).not.toHaveBeenCalled(); expect(bytes()).toBe(raw);
});
it.each(['generation-changed','generation-removed','tombstone','owner-changed'])('rechecks %s at lock acquisition before mutation', async mode => {
  put({ old: { title: 'Old' } }); const raw = bytes(); const captured = accountScope.capture(); const mutate = vi.fn(opts().mutate);
  const delayed: Lock = async (_name, run) => {
    if (mode === 'generation-changed') localStorage.setItem(marker, JSON.stringify({ generation: 'g2', migrationId: 'other', previous: generation }));
    else if (mode === 'generation-removed') localStorage.removeItem(marker);
    else if (mode === 'tombstone') localStorage.setItem(`${accountPrefix(owner)}deleted`, '1');
    else accountScope.activate(accountScope.lock('other'), 'g2');
    return run();
  };
  expect((await runPrimitive(opts({ scope: captured, lock: delayed, mutate }))).ok).toBe(false);
  expect(mutate).not.toHaveBeenCalled(); expect(bytes()).toBe(raw);
  expect(localStorage.getItem(generationKey('other', 'g2', logical))).toBeNull();
});
it('two same-identity commands serialized by the supplied lock commit only once', async () => {
  const tails = new Map<string, Promise<void>>(); const names: string[] = [];
  const serial: Lock = (name, run) => { names.push(name); const next = (tails.get(name) ?? Promise.resolve()).then(run); tails.set(name, next.then(() => {}, () => {})); return next; };
  const mutate = vi.fn(opts().mutate); const write = operations();
  const result = await Promise.all([runPrimitive(opts({ lock: serial, mutate })), runPrimitive(opts({ lock: serial, mutate }))]);
  expect(result).toEqual([{ ok: true, targetId: 'item' }, { ok: true, targetId: 'item' }]);
  expect(names).toHaveLength(2); expect(names[0]).toBe(names[1]); expect(mutate).toHaveBeenCalledTimes(1); expect(write).toHaveBeenCalledTimes(1);
});
