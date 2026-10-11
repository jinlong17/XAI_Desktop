import { act, renderHook } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { accountScope } from '@repo/plugin-web-storage';
import { makeDefaultBoards } from '@repo/plugin-web-board-core';
import { useBoardComposerRecovery } from '../internal/useBoardComposerRecovery.js';
import { useBoardCreateRecovery } from '../internal/useBoardCreateRecovery.js';
it('accepts genuine null storage and null source during initial composer creation',()=>{
 const key=accountScope.physicalKey('xai_boards_v2');localStorage.removeItem(key);const board=makeDefaultBoards()[0]!;const save=vi.fn(next=>{localStorage.setItem(key,JSON.stringify(next));return true;});const {result}=renderHook(()=>useBoardComposerRecovery(null,board.id,save));
 act(()=>{expect(result.current.submit('card','First new card',board.lists[0]!.id)).toBe(true);});expect(save).toHaveBeenCalledTimes(1);expect(JSON.parse(localStorage.getItem(key)!)[0].lists[0].cards.at(-1).title.en).toBe('First new card');
});
it('accepts genuine null storage and null source during initial BoardCreator creation',()=>{
 const key=accountScope.physicalKey('xai_boards_v2');localStorage.removeItem(key);const board=makeDefaultBoards()[0]!;const save=vi.fn(next=>{localStorage.setItem(key,JSON.stringify(next));return true;});const select=vi.fn(()=>true);const {result}=renderHook(()=>useBoardCreateRecovery(null,[{id:board.workspaceId,name:{en:'Test',zh:'Test'},color:'red'}],save,select));
 act(()=>{expect(result.current.create({templateId:'pm',name:'First new board',workspaceId:board.workspaceId})).toBe(true);});expect(save).toHaveBeenCalledTimes(1);expect(select).toHaveBeenCalledTimes(1);expect(JSON.parse(localStorage.getItem(key)!).at(-1).name.en).toBe('First new board');
});
