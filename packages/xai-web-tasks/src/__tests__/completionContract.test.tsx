import React from 'react';
import {it,expect,vi} from 'vitest';
import {act,render,fireEvent,screen} from '@testing-library/react';
import {accountScope,getPref} from '@repo/plugin-web-storage';
import {TasksModule} from '../TasksModule.js';
import {toggleComplete,updateCard,moveCard} from '../internal/tasksReducer.js';
import {SEED_TASK_COLS} from '../internal/seed/tasksMock.js';
import {findBoardLinkedTask,taskCardFromBoardLink,upsertBoardLinkedTask} from '../taskLink.js';
import type {TaskCol} from '../types.js';
const source={type:'board-card' as const,boardId:'b',listId:'first',cardId:'c'};
function fixture(){const cols:TaskCol[]=SEED_TASK_COLS.map(c=>({...c,tasks:[],completed:[],count:0}));cols[3]={...cols[3]!,tasks:[taskCardFromBoardLink({...source,title:{en:'linked',zh:'linked'}})]};return cols;}
it('stamps only real transitions, preserves through metadata and move, clears and restamps on undo/recomplete',()=>{
 let cols=fixture();const id=cols[3]!.tasks[0]!.id;const first=new Date('2026-01-01T00:00:00Z');vi.setSystemTime(first);
 cols=toggleComplete(cols,id);expect(cols[3]!.tasks[0]!.completedAt).toBe(first.toISOString());
 vi.setSystemTime(new Date('2026-01-02T00:00:00Z'));cols=updateCard(cols,id,{done:true,notes:'changed'});
 expect(cols[3]!.tasks[0]).toMatchObject({notes:'changed',completedAt:first.toISOString()});
 cols=moveCard(cols,id,'nodate','later');expect(findBoardLinkedTask(cols,{...source,listId:'moved'})?.task.completedAt).toBe(first.toISOString());
 cols=toggleComplete(cols,id);expect(findBoardLinkedTask(cols,source)?.task.completedAt).toBeUndefined();
 cols=toggleComplete(cols,id);expect(findBoardLinkedTask(cols,source)?.task.completedAt).toBe('2026-01-02T00:00:00.000Z');
});
it('legacy completion remains undated on idempotent patch and link retry preserves user state',()=>{
 const cols=fixture(),task={...cols[3]!.tasks[0]!,done:true,notes:'user'};cols[3]={...cols[3]!,tasks:[task]};
 expect(updateCard(cols,task.id,{done:true})[3]!.tasks[0]!.completedAt).toBeUndefined();
 expect(upsertBoardLinkedTask(cols,taskCardFromBoardLink({...source,title:{en:'old',zh:'old'}}),'nodate',true)[3]!.tasks[0]).toEqual(task);
});
it('legacy completed group checkbox truly restores the task without inventing completion time',async()=>{
 const cols=fixture(),task=cols[3]!.tasks[0]!;cols[3]={...cols[3]!,tasks:[],completed:[task]};
 localStorage.setItem(accountScope.physicalKey('xai_task_cols'),JSON.stringify(cols));render(<TasksModule lang="en"/>);
 fireEvent.click(screen.getByRole('checkbox',{checked:true}));
 await act(async()=>{});
 const stored=getPref('xai_task_cols') as unknown as TaskCol[];const restored=stored[3]!.tasks.find(t=>t.id===task.id)!;
 expect(restored).toMatchObject({done:false,source});expect(restored.completedAt).toBeUndefined();expect(stored[3]!.completed).toHaveLength(0);
});
