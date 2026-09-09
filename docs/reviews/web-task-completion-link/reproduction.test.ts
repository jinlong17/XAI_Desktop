import {it,expect} from 'vitest';
import {taskCardFromBoardLink,findBoardLinkedTask,upsertBoardLinkedTask} from '../../../packages/xai-web-tasks/src/taskLink';
import {moveCard,toggleComplete,updateCard} from '../../../packages/xai-web-tasks/src/internal/tasksReducer';
import {SEED_TASK_COLS} from '../../../packages/xai-web-tasks/src/internal/seed/tasksMock';
const source={type:'board-card' as const,boardId:'b',listId:'l',cardId:'c'};
function cols(){const cols=SEED_TASK_COLS.map(c=>({...c,tasks:[],completed:[],count:0}));cols[1].tasks=[taskCardFromBoardLink({...source,title:{en:'linked',zh:'linked'}})] as any;return cols;}
it('T05 move preserves stable source and lookup',()=>{const initial=cols(),task=initial[1].tasks[0];const moved=moveCard(initial,task.id,'next7','later');expect(findBoardLinkedTask(moved,source)?.task.source).toEqual(source)});
it('T05 completed flag is visible to Board',()=>{const initial=cols();expect(findBoardLinkedTask(toggleComplete(initial,initial[1].tasks[0].id),source)?.completed).toBe(true)});
it('moving Board card to another list preserves link',()=>{expect(findBoardLinkedTask(cols(),{...source,listId:'other'})?.task.id).toBeTruthy()});
it('completion records an actual timestamp and undo clears it',()=>{const initial=cols(),id=initial[1].tasks[0].id;const done=toggleComplete(initial,id);expect(Number.isFinite(Date.parse((done[1].tasks[0] as any).completedAt))).toBe(true);expect((toggleComplete(done,id)[1].tasks[0] as any).completedAt).toBeUndefined()});
it('relink retry does not erase task edits or completion',()=>{const initial=cols(),task={...initial[1].tasks[0],done:true,completedAt:'2026-01-01T01:00:00.000Z',notes:'user edit'};initial[1].tasks=[task] as any;const next=upsertBoardLinkedTask(initial,taskCardFromBoardLink({...source,title:{en:'original',zh:'original'}}),'nodate',true);expect(next[1].tasks[0]).toEqual(task)});
