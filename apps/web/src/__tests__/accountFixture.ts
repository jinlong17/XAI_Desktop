import { accountScope, generationMarkerKey } from '@repo/plugin-web-storage';

/** Existing shell/router tests model an already initialized authenticated workspace. */
export function prepareAccountFixture(accountId = 'host-test-account') {
  localStorage.setItem(generationMarkerKey(accountId), JSON.stringify({ generation: 'fixture', migrationId: 'fixture', previous: null }));
  const transition = accountScope.lock(accountId);
  accountScope.activate(transition, 'fixture');
}
