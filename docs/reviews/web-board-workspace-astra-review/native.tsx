import React from 'react';
import { createRoot } from 'react-dom/client';
import { accountScope, setPref } from './packages/plugin-web-storage/src/index';
import { loadWorkspacesOrDefault, makeDefaultBoards } from './packages/plugin-web-board-core/src/index';
import { BoardWorkspacesModule } from './packages/plugin-web-board-workspaces/src/BoardWorkspacesModule';
import './packages/plugin-web-tokens/src/tokens.css';
import './packages/plugin-web-tokens/src/layout.css';
import './packages/plugin-web-board-workspaces/src/styles.css';

accountScope.activate(accountScope.lock('fixture-A'), 'A');
const boards = makeDefaultBoards();
const empty = { id: 'empty', name: { en: 'Empty', zh: '空' }, color: 'red' };
setPref('xai_board_workspaces', [...loadWorkspacesOrDefault(null), empty]);
setPref('xai_boards_v2', boards);
setPref('xai_active_board', boards[0]!.id);
const workspaceKey = accountScope.physicalKey('xai_board_workspaces');
const boardKey = accountScope.physicalKey('xai_boards_v2');
const activeKey = accountScope.physicalKey('xai_active_board');
const nativeSet = Storage.prototype.setItem;
let denied: string | null = null;
const workspaceProposals: string[] = [];
Storage.prototype.setItem = function(key, value) {
  if (key === workspaceKey) workspaceProposals.push(value);
  if (key === denied) throw new DOMException('Synthetic quota', 'QuotaExceededError');
  nativeSet.call(this, key, value);
};
(window as any).verify = {
  workspaceKey, boardKey, activeKey,
  proposals: () => workspaceProposals,
  denyWorkspace() { denied = workspaceKey; },
  denyActive() { denied = activeKey; },
  restore() { denied = null; },
  switchToB() {
    accountScope.activate(accountScope.lock('fixture-B'), 'B');
    return { workspaceKey: accountScope.physicalKey('xai_board_workspaces'), boardKey: accountScope.physicalKey('xai_boards_v2') };
  },
};
const corruptMode = new URLSearchParams(location.search).get('corrupt');
const corruptFixtures: Record<string, string> = { board: JSON.stringify([{ id: 'valuable-board', workspaceId: 'empty', title: 'Recover me' }]), 'board-null': 'null', 'board-syntax': '{broken', 'board-empty': '[]' };
if (corruptMode && corruptFixtures[corruptMode]) localStorage.setItem(boardKey, corruptFixtures[corruptMode]!);
const activeFixture = new URLSearchParams(location.search).get('active');
if (activeFixture) localStorage.setItem(activeKey, activeFixture);
if (new URLSearchParams(location.search).get('denyboard') === '1') denied = boardKey;
createRoot(document.getElementById('app')!).render(<BoardWorkspacesModule lang="en" />);
