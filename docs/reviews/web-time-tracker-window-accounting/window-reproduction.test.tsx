/** Correct business expectations: failures reproduce TT-01; never invert to bless the defect. */
import React from '../../../packages/plugin-web-time-tracker/node_modules/react';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '../../../packages/plugin-web-time-tracker/node_modules/@testing-library/react';
import { accountScope } from '../../../packages/plugin-web-storage/src/index';
import { TimeTrackerModule } from '../../../packages/plugin-web-time-tracker/src/TimeTrackerModule';
import { createTimeTrackerEntry, getTimeTrackerSnapshot, writeTimeTrackerEntries } from '../../../packages/plugin-web-time-tracker/src/internal/storage';
import { entryDuration } from '../../../packages/plugin-web-time-tracker/src/internal/time';
const minute=60_000;
const at=(value:string)=>new Date(value).getTime();
const entry=(start:string,end:string|null)=>createTimeTrackerEntry('cat_work',null,at(start),end===null?null:at(end),{en:'window test',zh:'窗口测试'});
beforeEach(()=>{localStorage.clear();accountScope.activate(accountScope.lock('window-A'),'fixture');vi.useFakeTimers();vi.setSystemTime(at('2026-05-01T12:00:00'));});
afterEach(()=>{cleanup();vi.useRealTimers();localStorage.clear();});
const dayTotal=()=>document.querySelector('.tt-day-head .tt-head-spacer + span')?.textContent;
it('widget allocates only 10 minutes after midnight from a 23:50–00:10 entry',()=>{
 writeTimeTrackerEntries([entry('2026-04-30T23:50:00','2026-05-01T00:10:00')]);
 expect(getTimeTrackerSnapshot().todayTotalMs).toBe(10*minute);
});
it('main day view allocates 10 minutes to each adjacent day, retaining the source record',()=>{
 writeTimeTrackerEntries([entry('2026-04-30T23:50:00','2026-05-01T00:10:00')]);render(<TimeTrackerModule lang="en" />);
 const today=dayTotal();fireEvent.click(screen.getByLabelText('Previous day'));const yesterday=dayTotal();
 expect([today,yesterday]).toEqual(['10m · 1','10m · 1']);
});
it('future closed records contribute zero to today and this week',()=>{
 writeTimeTrackerEntries([entry('2026-05-02T13:00:00','2026-05-02T14:00:00')]);
 const snapshot=getTimeTrackerSnapshot();expect([snapshot.todayTotalMs,snapshot.weekTotalMs,snapshot.entriesToday]).toEqual([0,0,0]);
});
it('a segment ending after now contributes elapsed time only',()=>{
 writeTimeTrackerEntries([entry('2026-05-01T11:50:00','2026-05-01T12:10:00')]);
 expect(getTimeTrackerSnapshot().todayTotalMs).toBe(10*minute);
});
it('week boundary includes the intersecting Monday portion of a Sunday-started entry',()=>{
 vi.setSystemTime(at('2026-05-04T12:00:00'));writeTimeTrackerEntries([entry('2026-05-03T23:50:00','2026-05-04T00:10:00')]);
 expect(getTimeTrackerSnapshot().weekTotalMs).toBe(10*minute);
});
it('custom insight month-total includes a prior-month entry intersecting this month',()=>{
 writeTimeTrackerEntries([entry('2026-04-30T23:50:00','2026-05-01T00:10:00')]);
 localStorage.setItem(accountScope.physicalKey('xai_tt_insights_v1'),JSON.stringify([{iid:'month',type:'month-total',catId:null}]));
 render(<TimeTrackerModule lang="en" />);fireEvent.click(screen.getAllByText('Insights')[0]!);
 const card=Array.from(document.querySelectorAll('.tt-ins-card')).find(node=>node.querySelector('.tt-ins-head strong')?.textContent==='This month');
 expect(card,'month card exists').toBeTruthy();expect(card?.querySelector('.tt-ins-num strong')?.textContent).toBe('10m');
});
it.each([
 ['spring','2026-03-07T23:50:00','2026-03-09T00:10:00','2026-03-09T12:00:00','23h 00m · 1'],
 ['fall','2026-10-31T23:50:00','2026-11-02T00:10:00','2026-11-02T12:00:00','25h 00m · 1'],
])('%s DST natural day gets its actual elapsed intersection',(_label,start,end,now,expected)=>{
 vi.setSystemTime(at(now));writeTimeTrackerEntries([entry(start,end)]);render(<TimeTrackerModule lang="en" />);
 fireEvent.click(screen.getByLabelText('Previous day'));expect(dayTotal()).toBe(expected);
});
it('paused multi-segment entry counts the later-day segment without counting the pause',()=>{
 const value=entry('2026-04-30T23:50:00','2026-04-30T23:55:00');
 writeTimeTrackerEntries([{...value,segments:[...value.segments,{start:at('2026-05-01T00:05:00'),end:at('2026-05-01T00:10:00')}]}]);
 expect(getTimeTrackerSnapshot().todayTotalMs).toBe(5*minute);
});
it('control: a segment ending exactly at today start contributes nothing today',()=>{
 writeTimeTrackerEntries([entry('2026-04-30T23:50:00','2026-05-01T00:00:00')]);
 expect(getTimeTrackerSnapshot().todayTotalMs).toBe(0);
});
it('control: absolute lifetime segment duration already handles spring/fall elapsed hours',()=>{
 expect(new Date('2026-03-08T12:00:00').getTimezoneOffset()).toBe(420);
 expect(entryDuration(entry('2026-03-08T00:00:00','2026-03-09T00:00:00'),at('2026-03-10T12:00:00'))).toBe(23*60*minute);
 expect(entryDuration(entry('2026-11-01T00:00:00','2026-11-02T00:00:00'),at('2026-11-03T12:00:00'))).toBe(25*60*minute);
});
