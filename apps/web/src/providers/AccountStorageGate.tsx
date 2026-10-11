import { PomodoroSessionHost } from "@repo/plugin-web-pomodoro/session-host";
import { useEffect, useState, type PropsWithChildren } from 'react';
import { AccountDataGate, accountScope } from '@repo/plugin-web-storage';
import { aiSecretMigrationParticipant } from '@repo/plugin-web-ai-chat';
import { useWebAuthSession } from '@repo/web-auth-device-session/web';

const IDENTITY_EVENT = 'xai:auth:identity-updated';
const IDENTITY_STORAGE_KEY = 'xai:auth:identity-change';

/** Called synchronously by auth before publishing a new identity. No async SDK calls. */
export function invalidateAccountIdentity(accountId: string | null) {
  const previous = accountScope.capture().accountId;
  accountScope.lock(accountId);
  const runtime = globalThis as unknown as Record<string, unknown>;
  delete runtime.__XAI_WEB_TODO_SESSION__;
  delete runtime.__XAI_WEB_TODO_CRYPTO__;
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('xai:web:todo-runtime-updated'));
  window.dispatchEvent(new CustomEvent(IDENTITY_EVENT, { detail: { accountId } }));
  try {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key?.startsWith('xai_oauth_pending_')) sessionStorage.removeItem(key);
    }
    if (previous !== null || accountId !== null) localStorage.setItem(IDENTITY_STORAGE_KEY, JSON.stringify({ accountId, nonce: crypto.randomUUID() }));
  } catch { /* Current-tab revocation above still applies when persistence is unavailable. */ }
}

export function AccountStorageGate({ children }: PropsWithChildren) {
  const { session, state, refreshSession } = useWebAuthSession();
  const accountId = session?.user?.id ?? null;
  const [expected, setExpected] = useState<{ accountId: string | null } | null>(null);
  useEffect(() => {
    const localIdentity = (event: Event) => {
      const detail = (event as CustomEvent<{ accountId: string | null }>).detail;
      setExpected(detail);
    };
    const remoteIdentity = (event: StorageEvent) => {
      if (event.key !== IDENTITY_STORAGE_KEY || !event.newValue) return;
      try {
        const value: unknown = JSON.parse(event.newValue);
        if (!value || typeof value !== 'object' || !('accountId' in value) || (value.accountId !== null && typeof value.accountId !== 'string')) return;
        const next = value.accountId as string | null;
        // A new tab announcing the same identity is not an account transition.
        // Preserve both active workspaces and in-flight migration handles.
        if (accountScope.capture().accountId === next) return;
        accountScope.lock(next);
        setExpected({ accountId: next });
        // Outside the synchronous auth callback. Cached old identities stay gated.
        void refreshSession();
      } catch { /* Ignore malformed coordination metadata. */ }
    };
    window.addEventListener(IDENTITY_EVENT, localIdentity);
    window.addEventListener('storage', remoteIdentity);
    return () => { window.removeEventListener(IDENTITY_EVENT, localIdentity); window.removeEventListener('storage', remoteIdentity); };
  }, [refreshSession]);
  const identityConfirmed = expected === null || expected.accountId === accountId;
  let lang: 'en' | 'zh' = 'en';
  try { if (JSON.parse(localStorage.getItem('xai_pref_lang') ?? '"en"') === 'zh') lang = 'zh'; } catch { /* use English */ }
  return <AccountDataGate accountId={accountId} authenticated={state === 'authenticated' && identityConfirmed} demo={import.meta.env.VITE_WEB_AUTH_MODE === 'mock-authenticated'} lang={lang} secrets={aiSecretMigrationParticipant}><PomodoroSessionHost />{children}</AccountDataGate>;
}
