import {expect,it} from 'vitest';
import {aggregateRange} from '../../../packages/plugin-web-statistics/src/internal/aggregators';
import {EMPTY_HABITS_STATE} from '../../../packages/plugin-web-statistics/src/internal/isHabitsStateRecord';
it('invalid calendar date must remain undated instead of normalized into March history',()=>{
 const raw=[{tasks:[{done:true,completedAt:'2026-02-30T12:00:00.000Z'}]}];
 const result=aggregateRange('month',[],EMPTY_HABITS_STATE,1,new Date('2026-03-09T12:00:00Z'),'en',raw);
 expect(result.kpis.tasksTotal).toBe(1);expect(result.undatedCompletedTasks).toBe(1);expect(result.taskBuckets.every(n=>n===0)).toBe(true);
});
