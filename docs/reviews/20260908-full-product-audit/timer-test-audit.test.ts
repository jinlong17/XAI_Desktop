// Read-only audit characterization. Passing cases reproduce current defects,
// rather than asserting those defects are desirable product behavior.
import { describe, it, expect, afterEach, vi } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { useTimerTick } from '../../../packages/plugin-web-pomodoro/src/internal/useTimerTick';
import { createTimeTrackerEntry, writeTimeTrackerEntries, readTimeTrackerEntries, getTimeTrackerSnapshot } from '../../../packages/plugin-web-time-tracker/src/internal/storage';
import { entryDuration } from '../../../packages/plugin-web-time-tracker/src/internal/time';
import { taskCardFromBoardLink, findBoardLinkedTask } from '../../../packages/xai-web-tasks/src/taskLink';
import { moveCard, toggleComplete } from '../../../packages/xai-web-tasks/src/internal/tasksReducer';
import { filterCardsByList } from '../../../packages/xai-web-tasks/src/internal/filterCardsByList';
import { aggregateRange } from '../../../packages/plugin-web-statistics/src/internal/aggregators';
import { utcDateKey } from '../../../packages/xai-web-habits/src/internal/dateKeys';
import { usePersistedMatrix } from '../../../packages/xai-web-matrix/src/internal/usePersistedMatrix';

afterEach(() => { cleanup(); localStorage.clear(); vi.useRealTimers(); });
const source = { type: 'board-card' as const, boardId: 'audit-board', listId: 'audit-list', cardId: 'audit-card' };
function taskCols() {
  return [
    {id:'overdue', tasks:[], count:0},
    {id:'next7', tasks:[taskCardFromBoardLink({...source, title:{en:'Audit',zh:'审查'}, dueDate:'2026-09-09'})],count:1},
    {id:'later',tasks:[],count:0}, {id:'nodate',tasks:[],count:0}
  ] as any;
}
describe('audit current behavior', () => {
  it('POMO-1 running state is lost on unmount and remount', () => {
    const first=renderHook(()=>useTimerTick());
    act(()=>first.result.current.start());
    expect(first.result.current.timerState.kind).toBe('running');
    first.unmount();
    const reopened=renderHook(()=>useTimerTick());
    expect(reopened.result.current.timerState.kind).toBe('idle');
  });
  it('TT-1 persisted open segment resumes mathematically after close', () => {
    const start=new Date(2026,8,8,10).getTime();
    writeTimeTrackerEntries([createTimeTrackerEntry('study',null,start,null,{en:'audit',zh:'审查'})]);
    expect(entryDuration(readTimeTrackerEntries()[0]!,start+7_200_000)).toBe(7_200_000);
  });
  it('TT-2 previous-day running segment wrongly contributes zero today', () => {
    const start=new Date(2026,8,7,23,50).getTime();
    const now=new Date(2026,8,8,0,10).getTime();
    writeTimeTrackerEntries([createTimeTrackerEntry('study',null,start,null,{en:'audit',zh:'审查'})]);
    const snapshot=getTimeTrackerSnapshot(now);
    expect(snapshot.activeTotalMs).toBe(20*60_000);
    expect(snapshot.todayTotalMs).toBe(0); // expected product result: ten minutes
  });
  it('TT-3 future completed entry wrongly contributes to today snapshot', () => {
    const now=new Date(2026,8,8,10).getTime();
    const tomorrow=new Date(2026,8,9,10).getTime();
    writeTimeTrackerEntries([createTimeTrackerEntry('study',null,tomorrow,tomorrow+3_600_000,{en:'audit',zh:'审查'})]);
    expect(getTimeTrackerSnapshot(now).todayTotalMs).toBe(3_600_000);
  });
  it('TASK-1 moving a linked task loses board source and lookup', () => {
    const cols=taskCols(); const id=cols[1].tasks[0].id;
    expect(findBoardLinkedTask(cols,source)).not.toBeNull();
    const moved=moveCard(cols,id,'next7','later',new Date(2026,8,8));
    expect(moved[2]!.tasks[0]!.source).toBeUndefined();
    expect(findBoardLinkedTask(moved,source)).toBeNull();
  });
  it('TASK-2 board lookup ignores done flag used by Tasks completion', () => {
    const cols=taskCols(); const id=cols[1].tasks[0].id;
    const completed=toggleComplete(cols,id);
    expect(completed[1]!.tasks[0]!.done).toBe(true);
    expect(findBoardLinkedTask(completed,source)?.completed).toBe(false);
  });
  it('TASK-3 tomorrow smart list never ages even a year later', () => {
    const cols=taskCols();
    expect(filterCardsByList(cols,'tomorrow',new Date(2027,8,8))[1]!.tasks).toHaveLength(1);
  });
  it('STAT-1 one-minute aborted focus session is counted as 25 minutes', () => {
    const now=new Date('2026-09-08T12:00:00Z');
    const session={mode:'focus',durationMs:25*60_000,elapsedMs:60_000,completed:false,finishedAt:now.toISOString()} as const;
    const agg=aggregateRange('week',[session],{schemaVersion:1,habits:[],checkIns:{},diaries:{}} as any,1,now,'en',[]);
    expect(agg.kpis.focusMinutesTotal).toBe(25);
  });
  it('HABIT-1 local evening is assigned to following UTC date', () => {
    const evening=new Date('2026-09-08T18:00:00-07:00');
    expect(utcDateKey(evening)).toBe('2026-09-09');
  });
  it('MATRIX-1 intentionally persisted empty state is replaced by samples', () => {
    localStorage.setItem('xai_matrix_state',JSON.stringify({schemaVersion:1,q1:[],q2:[],q3:[],q4:[]}));
    const result=renderHook(()=>usePersistedMatrix());
    expect(result.result.current.state.q4.length).toBeGreaterThan(0);
  });
});
