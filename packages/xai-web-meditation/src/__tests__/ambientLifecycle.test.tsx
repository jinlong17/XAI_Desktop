import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useAmbientAudio } from '../internal/useAmbientAudio.js';
import { accountScope } from '@repo/plugin-web-storage';
const contexts: FakeAudio[] = [];
class FakeAudio {
  state: AudioContextState = 'running'; sampleRate = 10; destination = {}; currentTime = 0;
  sources: { start: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn> }[] = [];
  resume: () => Promise<void> = async () => { this.state = 'running'; };
  constructor() { contexts.push(this); }
  createBuffer(_channels: number, length: number) { return { getChannelData: () => new Float32Array(length) }; }
  createBufferSource() { const source = { start: vi.fn(), stop: vi.fn(), connect: vi.fn(), loop: false, buffer: null }; this.sources.push(source); return source; }
  gains: ReturnType<FakeAudio["makeGain"]>[] = [];
  createGain() { const gain = this.makeGain(); this.gains.push(gain); return gain; }
  makeGain() { return { connect: vi.fn(), disconnect: vi.fn(), gain: { value: 0, setTargetAtTime: vi.fn(), setValueAtTime: vi.fn(), cancelScheduledValues: vi.fn() } }; }
  createBiquadFilter() { return { type: '', frequency: { value: 0 }, Q: { value: 0 }, connect: vi.fn() }; }
}
afterEach(() => { contexts.forEach(ctx => ctx.state = 'closed'); vi.unstubAllGlobals(); });
describe('ambient audio lifetime', () => {
  it('schedules silence on the native audio timeline independently of JS ticks', async () => {
    vi.useFakeTimers(); vi.setSystemTime(100000); vi.stubGlobal('AudioContext', FakeAudio);
    const hook = renderHook(useAmbientAudio); act(() => hook.result.current.setDeadline(105000));
    await act(async () => { await hook.result.current.play('water', .5); });
    const ctx = contexts.at(-1)!; expect(ctx.gains[0]!.gain.setValueAtTime).toHaveBeenCalledWith(0, 5);
    act(() => hook.result.current.setVolume(.2)); expect(ctx.gains[0]!.gain.setValueAtTime).toHaveBeenLastCalledWith(0, 5); hook.unmount();
  });
  it('autoplay resume that never settles becomes a visible retryable error', async () => {
    vi.useFakeTimers(); vi.stubGlobal('AudioContext', FakeAudio); const hook = renderHook(useAmbientAudio);
    await act(async () => { await hook.result.current.play('water', .5); }); const ctx = contexts.at(-1)!;
    act(() => hook.result.current.pause()); ctx.state = 'suspended'; ctx.resume = () => new Promise(() => {});
    let pending!: Promise<boolean>; act(() => { pending = hook.result.current.play('water', .5); });
    await act(async () => { await vi.advanceTimersByTimeAsync(4000); expect(await pending).toBe(false); });
    expect(hook.result.current.state.error).toContain('retry'); hook.unmount();
  });
  it('reports permission rejection; retry starts sound, pause and unmount stop all sources', async () => {
    vi.stubGlobal('AudioContext', FakeAudio); const hook = renderHook(useAmbientAudio);
    await act(async () => { await hook.result.current.play('water', .5); });
    const ctx = contexts.at(-1)!; expect(hook.result.current.state.playing).toBe(true);
    act(() => hook.result.current.pause()); expect(ctx.sources.every(source => source.stop.mock.calls.length === 1)).toBe(true);
    ctx.state = 'suspended'; ctx.resume = async () => { throw Error('permission'); };
    await act(async () => { expect(await hook.result.current.play('water', .5)).toBe(false); });
    expect(hook.result.current.state.error).toContain('permission'); expect(hook.result.current.state.playing).toBe(false);
    ctx.resume = async () => { ctx.state = 'running'; };
    await act(async () => { await hook.result.current.play('water', .5); }); expect(hook.result.current.state.error).toBeNull();
    hook.unmount(); expect(ctx.sources.every(source => source.stop.mock.calls.length === 1)).toBe(true);
  });
  it('pending AudioContext resume cannot resurrect sound after pause or account change', async () => {
    vi.stubGlobal('AudioContext', FakeAudio); const hook = renderHook(useAmbientAudio);
    await act(async () => { await hook.result.current.play('water', .5); }); const ctx = contexts.at(-1)!;
    act(() => hook.result.current.pause()); ctx.state = 'suspended'; let resolve!: () => void;
    ctx.resume = () => new Promise<void>(done => { resolve = () => { ctx.state = 'running'; done(); }; });
    let pending!: Promise<boolean>; act(() => { pending = hook.result.current.play('water', .5); });
    act(() => { hook.result.current.pause(); accountScope.activate(accountScope.lock('next'), 'B'); });
    await act(async () => { resolve(); expect(await pending).toBe(false); });
    expect(ctx.sources).toHaveLength(2); expect(hook.result.current.state.playing).toBe(false); hook.unmount();
  });
});
