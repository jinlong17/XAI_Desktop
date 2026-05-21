import { useState, type FormEvent } from 'react';

export interface AccountLoginPageProps {
  onOAuthStart?: (provider: 'mock-oauth') => Promise<string> | string;
  onPasswordLogin?: (input: { email: string; password: string }) => Promise<string> | string;
  onPasskeyStart?: (input: { webAuthnAvailable: boolean }) => Promise<string> | string;
}

export function LoginPage({ onOAuthStart, onPasswordLogin, onPasskeyStart }: AccountLoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('Supabase Auth is deferred; mock provider is active.');

  async function handlePassword(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const nextMessage =
      (await onPasswordLogin?.({ email, password })) ??
      `Mock session prepared for ${email || 'account@example.com'}.`;
    setMessage(nextMessage);
  }

  async function handleOAuth(): Promise<void> {
    const nextMessage =
      (await onOAuthStart?.('mock-oauth')) ??
      'Mock OAuth provider completed. Replace with Supabase Auth after the deferred gate clears.';
    setMessage(nextMessage);
  }

  async function handlePasskey(): Promise<void> {
    const webAuthnAvailable = typeof window !== 'undefined' && 'PublicKeyCredential' in window;
    const nextMessage =
      (await onPasskeyStart?.({ webAuthnAvailable })) ??
      (webAuthnAvailable
        ? 'WebAuthn API detected. Passkey ceremony remains a stub until real challenge endpoints exist.'
        : 'WebAuthn API is unavailable in this runtime.');
    setMessage(nextMessage);
  }

  return (
    <section style={styles.shell} aria-label="Account login">
      <div style={styles.heading}>
        <p style={styles.eyebrow}>Account</p>
        <h1 style={styles.title}>Sign in</h1>
      </div>
      <div style={styles.panel}>
        <button type="button" style={styles.secondaryButton} onClick={() => void handleOAuth()}>
          Continue with mock OAuth
        </button>
        <button type="button" style={styles.secondaryButton} onClick={() => void handlePasskey()}>
          Use passkey
        </button>
        <form style={styles.form} onSubmit={(event) => void handlePassword(event)}>
          <label style={styles.label}>
            Email
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              autoComplete="email"
            />
          </label>
          <label style={styles.label}>
            Password
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
              autoComplete="current-password"
            />
          </label>
          <button type="submit" style={styles.button}>
            Continue
          </button>
        </form>
      </div>
      <p style={styles.message}>{message}</p>
    </section>
  );
}

const styles = {
  shell: {
    display: 'grid',
    gap: 18,
    maxWidth: 520,
  },
  heading: {
    display: 'grid',
    gap: 4,
  },
  eyebrow: {
    margin: 0,
    color: '#287a55',
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
  },
  title: {
    margin: 0,
    fontSize: 42,
  },
  panel: {
    display: 'grid',
    gap: 12,
    border: '1px solid #d7ddd4',
    borderRadius: 8,
    padding: 18,
    background: '#ffffff',
  },
  form: {
    display: 'grid',
    gap: 12,
  },
  label: {
    display: 'grid',
    gap: 6,
    color: '#1f2933',
  },
  input: {
    minHeight: 38,
    border: '1px solid #d7ddd4',
    borderRadius: 8,
    padding: '8px 10px',
  },
  button: {
    minHeight: 38,
    border: '1px solid #2457a6',
    borderRadius: 8,
    background: '#2457a6',
    color: '#ffffff',
    padding: '0 12px',
  },
  secondaryButton: {
    minHeight: 38,
    border: '1px solid #d7ddd4',
    borderRadius: 8,
    background: '#f6f7f4',
    color: '#1f2933',
    padding: '0 12px',
  },
  message: {
    margin: 0,
    color: '#667085',
  },
};
