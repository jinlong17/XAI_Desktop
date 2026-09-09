import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { BoardWorkspacesModule } from '../../../packages/plugin-web-board-workspaces/src/BoardWorkspacesModule.js';
import { makeDefaultBoards } from '../../../packages/plugin-web-board-core/src/index.js';
import { accountScope } from '../../../packages/plugin-web-storage/src/index.js';
afterEach(cleanup);
it('retains a new card draft and reports failure when canonical board storage rejects the write', async () => {
 const key = accountScope.physicalKey('xai_boards_v2');
 const seed = makeDefaultBoards();
 localStorage.setItem(key, JSON.stringify(seed));
 localStorage.setItem(accountScope.physicalKey('xai_active_board'), seed[0]!.id);
 render(<BoardWorkspacesModule lang="en" />);
 const originalRaw = localStorage.getItem(key);
 const originalSet = Storage.prototype.setItem;
 let rejected = 0;
 vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this:Storage,name,value){
  if(name===key){rejected++;throw new DOMException('quota','QuotaExceededError');}
  originalSet.call(this,name,value);
 });
 fireEvent.click(screen.getAllByTestId('add-card-btn')[0]!);
 fireEvent.change(screen.getByTestId('card-composer-input'),{target:{value:'Unsaved important card'}});
 await act(async()=>{fireEvent.click(screen.getByTestId('card-composer-add'));});
 expect(rejected).toBeGreaterThan(0);
 expect(localStorage.getItem(key)).toBe(originalRaw);
 expect(screen.getByTestId('card-composer-input')).toHaveValue('Unsaved important card');
 expect(screen.getByRole('alert').textContent).toMatch(/not saved|unsaved|save failed/i);
});
