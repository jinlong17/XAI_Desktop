import {it,expect} from 'vitest';
import {taskCardFromBoardLink,findBoardLinkedTask} from '../../../packages/xai-web-tasks/src/taskLink';
import {withTaskCompletion,toggleComplete,updateCard,moveCard} from '../../../packages/xai-web-tasks/src/internal/tasksReducer';
import {SEED_TASK_COLS} from '../../../packages/xai-web-tasks/src/internal/seed/tasksMock';
const source={type:'board-card' as const,boardId:'board-independent',listId:'old-list',cardId:'stable-card'};
const original=taskCardFromBoardLink({...source,title:{en:'Source',zh:'来源'}});
it('legacy container explicit false is not completed; absent done undoes without invented date',()=>{
 for(const done of [undefined,false]){const cols=SEED_TASK_COLS.map(c=>({...c,tasks:[],completed:[],count:0})) as any;cols[3].completed=[{...original,...(done===undefined?{}:{done})}];
 expect(findBoardLinkedTask(cols,{...source,listId:'new-list'})?.completed).toBe(done===undefined);
 if(done===undefined){const undone=toggleComplete(cols,original.id,new Date('2026-09-09T00:00:00Z'));const found=findBoardLinkedTask(undone,source)!;expect(found.completed).toBe(false);expect(found.task.completedAt).toBeUndefined();expect(found.task.source).toEqual(source);}}
});
it('idempotent completion retains exact instant, undo and recompletion create only a new real transition',()=>{
 const first=withTaskCompletion(original,true,new Date('2026-09-09T00:00:00.123Z'));expect(first.completedAt).toBe('2026-09-09T00:00:00.123Z');expect(withTaskCompletion(first,true,new Date('2026-09-10T00:00:00Z'))).toBe(first);
 const undone=withTaskCompletion(first,false);expect(undone.completedAt).toBeUndefined();expect(withTaskCompletion(undone,true,new Date('2026-09-10T00:00:00.987Z')).completedAt).toBe('2026-09-10T00:00:00.987Z');
 const legacy={...original,done:true};expect(withTaskCompletion(legacy,true)).toBe(legacy);expect(legacy).not.toHaveProperty('completedAt');
});
it('metadata and movement preserve exact source and absolute completion time across stale list metadata',()=>{
 const completed=withTaskCompletion(original,true,new Date('2026-11-01T01:30:00.123-08:00'));let cols=SEED_TASK_COLS.map(c=>({...c,tasks:[],completed:[],count:0})) as any;cols[3].tasks=[completed];cols=updateCard(cols,original.id,{done:true,notes:'retain user detail'});cols=moveCard(cols,original.id,'nodate','later');const result=findBoardLinkedTask(cols,{...source,listId:'moved-board-list'})!;expect(result.completed).toBe(true);expect(result.task.completedAt).toBe('2026-11-01T09:30:00.123Z');expect(result.task.source).toEqual(source);expect(result.task.notes).toBe('retain user detail');
});
