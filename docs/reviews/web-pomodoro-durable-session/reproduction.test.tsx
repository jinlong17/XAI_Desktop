/** Correct expectations; baseline failures are diagnostic, never invert to bless data loss. */
import React from '../../../packages/plugin-web-pomodoro/node_modules/react';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, renderHook, screen } from '../../../packages/plugin-web-pomodoro/node_modules/@testing-library/react';
import { accountScope } from '../../../packages/plugin-web-storage/src/index';
import { PomodoroModule } from '../../../packages/plugin-web-pomodoro/src/PomodoroModule';
import { useTimerTick } from '../../../packages/plugin-web-pomodoro/src/internal/useTimerTick';
import { appendSession } from '../../../packages/plugin-web-pomodoro/src/internal/sessionsReducer';
const now = new Date('2026-06-01T10:00:00Z').getTime();
beforeEach(() => { Object.defineProperty(navigator, 'locks', { configurable:true, value: { request: async (_name:string, run:()=>unknown) => run() } }); localStorage.clear(); accountScope.activate(accountScope.lock('pomo-A'), 'fixture'); vi.useFakeTimers(); vi.setSystemTime(now); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.useRealTimers(); localStorage.clear(); });
it('running session survives route unmount/remount under the same account', async () => {
 const first=renderHook(()=>useTimerTick());await act(async()=>first.result.current.start());
 const original=first.result.current.timerState;first.unmount();vi.setSystemTime(now+60_000);
 const next=renderHook(()=>useTimerTick());
 expect(next.result.current.timerState.kind).toBe('running');
 if(original.kind==='running' && next.result.current.timerState.kind==='running')expect(next.result.current.timerState.sessionId).toBe(original.sessionId);
});
it('paused session survives remount without counting away time', async () => {
 const first=renderHook(()=>useTimerTick());await act(async()=>first.result.current.start());vi.setSystemTime(now+60_000);await act(async()=>first.result.current.pause());
 const remaining=first.result.current.displayedRemainingMs;first.unmount();vi.setSystemTime(now+3_600_000);
 const next=renderHook(()=>useTimerTick());expect([next.result.current.timerState.kind,next.result.current.displayedRemainingMs]).toEqual(['paused',remaining]);
});
it('two same-account observers see one active session rather than independent controllers', async () => {
 const one=renderHook(()=>useTimerTick()); const two=renderHook(()=>useTimerTick());await act(async()=>one.result.current.start());
 expect(two.result.current.timerState.kind).toBe('running');
});
it('identity lock removes the old active timer from the current observer', async () => {
 const hook=renderHook(()=>useTimerTick());await act(async()=>hook.result.current.start());
 await act(async()=>{accountScope.activate(accountScope.lock('pomo-B'),'fixture');});
 expect(hook.result.current.timerState.kind).toBe('idle');
});
it('late return records actual deadline, not the callback observation time', async () => {
 render(<PomodoroModule lang="en"/>);await act(async()=>{fireEvent.click(screen.getByTestId('start-btn'));});
 vi.setSystemTime(now+30*60_000);await act(async()=>vi.advanceTimersByTime(120));
 const records=JSON.parse(localStorage.getItem(accountScope.physicalKey('xai_pomodoro_sessions'))??'[]');
 expect(records).toHaveLength(1);expect(records[0].finishedAt).toBe(new Date(now+25*60_000).toISOString());
 expect(records[0].recordedAt).toBeDefined();
});
it('session append is idempotent by stable sessionId', async () => {
 const session={id:'same',mode:'focus' as const,startedAt:new Date(now).toISOString(),finishedAt:new Date(now+1000).toISOString(),durationMs:1000,elapsedMs:1000,completed:true};
 expect(appendSession(appendSession([],session),session)).toHaveLength(1);
});
it('failed record save cannot report saved or discard retryable completion', async () => {
 render(<PomodoroModule lang="en"/>);await act(async()=>{fireEvent.click(screen.getByTestId('start-btn'));});vi.setSystemTime(now+1000);
 const key=accountScope.physicalKey('xai_pomodoro_sessions');const original=Storage.prototype.setItem;
 vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(k,value){if(k===key)throw new DOMException('full','QuotaExceededError');return original.call(this,k,value);});
 await act(async()=>{fireEvent.click(screen.getByTestId('end-btn'));});
 expect(localStorage.getItem(key)).toBeNull();expect(screen.queryByText('Timer stopped and saved.')).toBeNull();
 expect(screen.getByRole('alert').textContent).toMatch(/retry|save/i);
});
it('control: in-mount pause/resume excludes pause time', async () => {
 const hook=renderHook(()=>useTimerTick());await act(async()=>hook.result.current.start());vi.setSystemTime(now+60_000);await act(async()=>hook.result.current.pause());
 expect(hook.result.current.displayedRemainingMs).toBe(24*60_000);vi.setSystemTime(now+600_000);await act(async()=>hook.result.current.resume());
 vi.setSystemTime(now+660_000);await act(async()=>vi.advanceTimersByTime(120));expect(hook.result.current.displayedRemainingMs).toBeLessThanOrEqual(23*60_000);
});
