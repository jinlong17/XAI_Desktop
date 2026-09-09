import { afterEach, expect, it } from 'vitest';
import { accountScope, createAccountScopeController, generationKey, generationMarkerKey } from '../../../packages/plugin-web-storage/src/internal/accountScope.js';
import { migrateAccount, readGeneration, type MigrationLock } from '../../../packages/plugin-web-storage/src/internal/accountMigration.js';
import { setPref, setPrefAutosave } from '../../../packages/plugin-web-storage/src/internal/storage.js';
import { SEED_TASK_COLS } from '../../../packages/xai-web-tasks/src/internal/seed/tasksMock.js';

// Two controllers represent independent page runtimes sharing the same physical store.
// The injected lock runs the production migration callback; this is not browser-lock evidence.
const lock: MigrationLock = async (_name, run) => run();
afterEach(() => { localStorage.clear(); accountScope.lock(); });
for (const timing of ['before', 'stage', 'verify'] as const) {
  it(`successful ordinary Tasks save remains visible across migration: ${timing}`, async () => {
    const accountId = 'migration-race';
    const oldGeneration = 'initial';
    localStorage.setItem(generationMarkerKey(accountId), JSON.stringify({generation:oldGeneration,migrationId:'initial',previous:null}));
    const writerScope = accountScope.activate(accountScope.lock(accountId), oldGeneration);
    const initial = JSON.parse(JSON.stringify(SEED_TASK_COLS));
    const latest = JSON.parse(JSON.stringify(SEED_TASK_COLS));
    latest[0].tasks[0].title = {en:'Successfully saved while migration runs',zh:'迁移期间成功保存'};
    const originalKey = generationKey(accountId, oldGeneration, 'xai_task_cols');
    localStorage.setItem(originalKey, JSON.stringify(initial));
    let successfulWrites = 0;
    const ordinaryWrite = () => {
      const saved = setPref('xai_task_cols', latest, writerScope);
      expect(saved).toBe(true);
      expect(localStorage.getItem(originalKey)).toBe(JSON.stringify(latest));
      successfulWrites++;
    };
    if (timing === 'before') ordinaryWrite();
    const controller = createAccountScopeController();
    const transition = controller.lock(accountId);
    let migrationError: unknown;
    try {
      await migrateAccount({storage:localStorage,controller,transition,choice:'empty',lock,newId:()=>`move-${timing}`,
        secrets:{
          stage:async()=>{ if(timing==='stage') ordinaryWrite(); },
          verify:async()=>{ if(timing==='verify') ordinaryWrite(); },
        },
      });
    } catch (error) { migrationError = error; }
    expect(successfulWrites).toBe(1);
    const visible = readGeneration(localStorage, accountId)!;
    const visibleRaw = localStorage.getItem(generationKey(accountId, visible.generation, 'xai_task_cols'));
    console.log({timing,migrationRejected:Boolean(migrationError),visibleGeneration:visible.generation,oldGenerationHasLatest:localStorage.getItem(originalKey)===JSON.stringify(latest),visibleGenerationHasLatest:visibleRaw===JSON.stringify(latest)});
    // Either a safe migration refusal or a merged/serialized success may satisfy this oracle.
    // Returning migration success while publishing an older Tasks snapshot may not.
    expect(visibleRaw).toBe(JSON.stringify(latest));
  });
}

for (const timing of ['before', 'stage'] as const) {
  it(`successful account autosave remains visible across migration: ${timing}`, async () => {
    const accountId = 'autosave-migration-race';
    localStorage.setItem(generationMarkerKey(accountId), JSON.stringify({generation:'initial',migrationId:'initial',previous:null}));
    const scope = accountScope.activate(accountScope.lock(accountId), 'initial');
    const suffix = 'migration_race_private';
    const logicalKey = `xai_pref_${suffix}`;
    const physicalKey = generationKey(accountId, 'initial', logicalKey);
    const latest = {text:'Acknowledged latest account preference'};
    localStorage.setItem(physicalKey, JSON.stringify({text:'Initial preference'}));
    let acknowledged = false;
    const save = () => {
      acknowledged = setPrefAutosave(suffix, latest, {scope});
      expect(acknowledged).toBe(true);
      expect(localStorage.getItem(physicalKey)).toBe(JSON.stringify(latest));
    };
    if(timing === 'before') save();
    const controller = createAccountScopeController();
    let rejected = false;
    try {
      await migrateAccount({storage:localStorage,controller,transition:controller.lock(accountId),choice:'empty',lock,newId:()=>`autosave-${timing}`,
        secrets:{stage:async()=>{if(timing==='stage')save();},verify:async()=>{}},
      });
    } catch { rejected = true; }
    expect(acknowledged).toBe(true);
    const visible = readGeneration(localStorage, accountId)!;
    const visibleRaw = localStorage.getItem(generationKey(accountId, visible.generation, logicalKey));
    console.log({domain:'account-autosave',timing,rejected,visibleGeneration:visible.generation,visibleHasLatest:visibleRaw===JSON.stringify(latest)});
    expect(visibleRaw).toBe(JSON.stringify(latest));
  });
}
