import { Fragment, useCallback, useEffect, useRef, useState, useSyncExternalStore, type PropsWithChildren } from 'react';
import { accountScope, generationMarkerKey, type AccountScope } from './internal/accountScope.js';
import { ACCOUNT_LOCAL_KEYS } from './internal/accountOwnership.js';
import { inspectLegacy, listAccountMigrations, migrateAccount, readGeneration, rollbackAccount, type GenerationMarker, type SecretMigrationParticipant } from './internal/accountMigration.js';
import './AccountDataGate.css';

export interface AccountDataGateProps extends PropsWithChildren {
  accountId: string | null;
  authenticated: boolean;
  demo?: boolean;
  lang?: 'en' | 'zh';
  secrets?: SecretMigrationParticipant;
}
const MANAGE_EVENT = 'xai:account-data:manage';
export function requestAccountDataManagement() { window.dispatchEvent(new Event(MANAGE_EVENT)); }
const categories = [
  ['Tasks and boards', '任务与看板', /task|board|list|tag|matrix/],
  ['Time and wellbeing', '时间与健康', /habit|calendar|timer|time_track|timetrack|pomo|meditation|countdown|metric/],
  ['Bookkeeping', '记账', /bk_|bookkeeping/],
  ['AI conversations', 'AI 对话', /ai_/],
] as const;
function categoryFor(key: string) { return categories.findIndex(([, , pattern]) => pattern.test(key)); }

/** The business subtree never mounts before its identified storage generation is ready. */
export function AccountDataGate({ accountId, authenticated, demo = false, lang = 'en', secrets, children }: AccountDataGateProps) {
  const scope = useSyncExternalStore(accountScope.subscribe, accountScope.capture, accountScope.capture);
  const [keys, setKeys] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [adoptSecrets, setAdoptSecrets] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [paused, setPaused] = useState(false);
  const [prepared, setPrepared] = useState(0);
  const [receipt, setReceipt] = useState<GenerationMarker | null>(null);
  const [retry, setRetry] = useState(0);
  const transition = useRef<AccountScope | null>(null);
  const wording = (en: string, zh: string) => lang === 'zh' ? zh : en;
  const ready = authenticated && accountId && scope.accountId === accountId && scope.kind === (demo ? 'demo' : 'account');
  const inspect = useCallback(() => {
    setKeys(demo ? [] : Object.keys(inspectLegacy(localStorage)));
    setSelected([]); setAdoptSecrets(false);
    setPrepared(accountId ? listAccountMigrations(localStorage, accountId, demo).filter(j => j.status === 'prepared').length : 0);
  }, [accountId, demo]);
  useEffect(() => {
    setError(''); setReceipt(null); setPaused(false); setBusy(false);
    if (!authenticated || !accountId) { transition.current = accountScope.lock(); return; }
    const current = accountScope.capture();
    const token = current.kind === 'locked' && current.accountId === accountId ? current : accountScope.lock(accountId);
    transition.current = token;
    try {
      const marker = readGeneration(localStorage, accountId, demo);
      if (marker) accountScope.activate(token, marker.generation, demo);
      else inspect();
    } catch { setError(wording('Local data could not be opened. It has been kept for recovery. Retry when storage is available.', '无法打开本地数据，原数据已保留。存储恢复可用后请重试。')); }
    // Language changes must not restart an account transition.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, authenticated, demo, retry, inspect]);
  useEffect(() => {
    const manage = () => {
      if (!authenticated || !accountId) return;
      transition.current = accountScope.lock(accountId);
      setReceipt(null); setPaused(false); setError('');
      try { inspect(); } catch { setError(wording('Cannot inspect local data. Nothing was changed.', '无法检查本地数据，未作修改。')); }
    };
    const changed = (event: StorageEvent) => {
      if (accountId && (event.key === null || event.key === generationMarkerKey(accountId, demo))) {
        // Revoke stale callbacks synchronously, before React renders the next generation.
        accountScope.lock(accountId);
        setRetry(value => value + 1);
      }
    };
    window.addEventListener(MANAGE_EVENT, manage);
    window.addEventListener('storage', changed);
    return () => { window.removeEventListener(MANAGE_EVENT, manage); window.removeEventListener('storage', changed); };
  }, [accountId, authenticated, demo, inspect, lang]);
  const perform = async (choice: 'empty' | 'import') => {
    const token = transition.current;
    if (!token || busy) return;
    setBusy(true); setError(''); setPaused(false);
    try {
      const marker = await migrateAccount({ storage: localStorage, controller: accountScope, transition: token, choice, selectedKeys: selected, demo, secrets, adoptLegacySecrets: choice === 'import' && adoptSecrets });
      accountScope.assertCurrent(token);
      setReceipt(marker);
    } catch {
      if (accountScope.capture() === token) setError(wording('Import could not finish. Your existing data has been kept. Retry or leave the selected data archived.', '导入未能完成，原数据仍保留。你可以重试，或暂不导入所选数据。'));
    } finally { if (accountScope.capture() === token) setBusy(false); }
  };
  const rollback = async () => {
    const token = transition.current;
    if (!token) return;
    setBusy(true); setError('');
    try {
      const marker = await rollbackAccount({ storage: localStorage, controller: accountScope, transition: token, demo });
      accountScope.assertCurrent(token);
      setReceipt(marker); inspect();
    } catch { if (accountScope.capture() === token) setError(wording('Could not restore the previous version. Current data is kept.', '无法恢复上一版本，当前数据仍保留。')); }
    finally { if (accountScope.capture() === token) setBusy(false); }
  };
  if (ready) return <Fragment key={`${scope.kind}:${scope.accountId}:${scope.generation}:${scope.epoch}`}>{children}</Fragment>;
  if (!authenticated || !accountId) return <main className="account-data-gate"><p role="status">{wording('Waiting for your account…', '正在确认账户…')}</p></main>;
  const groups = [...categories.map(([en, zh], index) => ({ en, zh, keys: keys.filter(k => categoryFor(k) === index && ACCOUNT_LOCAL_KEYS.includes(k)) })), { en: 'Other personal data', zh: '其他个人数据', keys: keys.filter(k => categoryFor(k) === -1 && ACCOUNT_LOCAL_KEYS.includes(k)) }].filter(g => g.keys.length);
  const unclassified = keys.filter(k => !ACCOUNT_LOCAL_KEYS.includes(k)).length;
  return <main className="account-data-gate"><section aria-labelledby="account-data-title" aria-busy={busy}>
    <p className="account-data-eyebrow">{wording('Your local workspace', '你的本地工作空间')}</p>
    <h1 id="account-data-title">{receipt ? wording('Your choice is saved', '已保存你的选择') : wording('Choose how to start', '选择如何开始')}</h1>
    <p>{wording('Data previously saved in this browser has no verified account owner. Keep it separate, or import selected categories into this account. Original data stays available for recovery.', '此浏览器中的旧数据没有可确认的账户归属。你可以将其保留，或选择类别导入当前账户。原数据会继续保留，供恢复使用。')}</p>
    {demo && <p>{wording('Demo data is separate from signed-in accounts. Existing personal data cannot be imported into the demo.', '演示数据与登录账户隔离，不能将旧个人数据导入演示空间。')}</p>}
    {prepared > 0 && <p role="status">{wording('An earlier import did not finish. Its original data is safe; retrying creates a fresh copy.', '有一次导入尚未完成，原数据仍保留。重试将创建新的副本。')}</p>}
    {error && <p role="alert" className="account-data-error">{error}</p>}
    {receipt ? <div className="account-data-actions">
      <button disabled={busy} onClick={() => { if (transition.current) accountScope.activate(transition.current, receipt.generation, demo); }}>{wording('Continue to workspace', '进入工作空间')}</button>
      <button className="secondary" disabled={busy} onClick={() => void rollback()}>{wording('Undo this import', '撤销本次导入')}</button>
    </div> : <>
      {!demo && groups.length > 0 && <fieldset disabled={busy}><legend>{wording('Categories to import', '选择导入类别')}</legend>{groups.map(group => <label key={group.en}>
        <input type="checkbox" checked={group.keys.every(k => selected.includes(k))} onChange={event => setSelected(old => event.target.checked ? [...new Set([...old, ...group.keys])] : old.filter(k => !group.keys.includes(k)))} />
        <span>{lang === 'zh' ? group.zh : group.en}</span>
      </label>)}</fieldset>}
      {unclassified > 0 && <p>{wording('Some older data needs a compatible importer. It will remain archived.', '部分旧数据需要兼容的导入工具，现将继续保留。')}</p>}
      {!demo && secrets && <label className="account-data-secret"><input type="checkbox" disabled={busy} checked={adoptSecrets} onChange={event => setAdoptSecrets(event.target.checked)} /><span>{wording('Also import AI API keys from this browser', '同时导入此浏览器中的 AI API 密钥')}</span></label>}
      {paused ? <p role="status">{wording('Nothing was imported. Choose an option when you are ready.', '尚未导入任何数据。准备好后再选择即可。')}</p> : null}
      <div className="account-data-actions">
        <button disabled={busy} onClick={() => void perform('empty')}>{busy ? wording('Saving…', '正在保存…') : wording('Start without importing', '不导入，直接开始')}</button>
        {!demo && <button className="secondary" disabled={busy || (!selected.length && !adoptSecrets)} onClick={() => void perform('import')}>{wording('Import selected data', '导入所选数据')}</button>}
        <button className="secondary" disabled={busy} onClick={() => setPaused(true)}>{wording('Decide later', '稍后决定')}</button>
        {error && <button className="secondary" disabled={busy} onClick={() => setRetry(value => value + 1)}>{wording('Retry opening storage', '重试打开存储')}</button>}
      </div>
    </>}
  </section></main>;
}
