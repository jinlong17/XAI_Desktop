import { accountPrefix, generationKey, type AccountScope } from './accountScope.js';
import { ownershipForKey } from './accountOwnership.js';
import { recoveryKeyExclusion } from './lifecycleDeclaration.js';
import { makeExportManifest, type ExportOmission } from './dataExport.js';
type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'>;
function prefix(scope: AccountScope) {
  if (scope.kind === 'locked' || !scope.accountId || !scope.generation) throw new Error('A captured authenticated account scope is required.');
  return accountPrefix(scope.accountId, scope.kind === 'demo');
}
function keys(storage: Store) {
  const result: string[]=[];
  for(let index=0;index<storage.length;index++) { const key=storage.key(index);if(key!==null) result.push(key); }
  return result;
}
/** Export explicitly captured owner data, even if auth changed while a request was running. */
export function exportAccountLocalData(scope: AccountScope, storage: Store = localStorage) {
  prefix(scope);
  const ownedPrefix=generationKey(scope.accountId!,scope.generation!,'',scope.kind==='demo');
  const records: Record<string,string>={};
  const omitted: ExportOmission[]=[];
  for(const physical of keys(storage)) {
    if(!physical.startsWith(ownedPrefix)) continue;
    const logical=decodeURIComponent(physical.slice(ownedPrefix.length));
    if(ownershipForKey(logical)!=='account') continue;
    const reason=recoveryKeyExclusion(logical);
    if(reason) { omitted.push({section:'account',key:logical,reason}); continue; }
    const raw=storage.getItem(physical);
    if(raw!==null) records[logical]=raw;
  }
  return {version:1 as const,kind:'account-records' as const,accountId:scope.accountId!,generation:scope.generation!,records,manifest:makeExportManifest('account-current-generation',{account:records},['captured-account-current-generation-records'],['device-preferences','other-accounts','prior-and-candidate-generations','unassigned-originals-and-archives','auth-session-and-oauth-state','byok-and-device-cryptographic-material','cloud-data'],omitted)};
}
/** After confirmed account deletion: never target whatever account is current now. */
export function deleteAccountLocalData(scope: AccountScope, storage: Store = localStorage): void {
  const ownedPrefix=prefix(scope), tombstone=`${ownedPrefix}deleted`;
  // Stop older tabs from creating new account records while scoped cleanup is in progress.
  if (storage.getItem(tombstone) === null) storage.setItem(tombstone,'1');
  for(const key of keys(storage)) if(key.startsWith(ownedPrefix) && key!==tombstone) storage.removeItem(key);
}
