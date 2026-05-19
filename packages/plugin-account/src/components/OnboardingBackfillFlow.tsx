import { useMemo, useState } from 'react';

import {
  BACKFILL_INCOMPLETE_ERROR,
  MIN_MASTER_PASSWORD_SCORE,
  assertStrongMasterPassword,
  completeOnboardingBackfill,
  createBackfillChallenge,
  createEmergencyKitDocument,
  scoreMasterPassword,
  type BackfillAcknowledgementProof,
  type BackfillAcknowledgementTransport,
  type BackfillAnswers,
  type BackfillChallenge,
  type BackfillLocalValidator,
  type EmergencyKitDocument,
} from '../onboarding-backfill';

export interface OnboardingBackfillFlowProps {
  accountId: string;
  accountEmail: string;
  mnemonic: string;
  secretKey: string;
  dekCheck: string;
  secretKeyCheck: string;
  validator: BackfillLocalValidator;
  transport: BackfillAcknowledgementTransport;
  proof: BackfillAcknowledgementProof;
  onComplete?: () => void;
  onEmergencyKitGenerated?: (document: EmergencyKitDocument) => void;
  createChallenge?: (mnemonic: string, secretKey: string) => BackfillChallenge;
}

type Step = 'loss-warning' | 'emergency-kit' | 'type-back';

export function OnboardingBackfillFlow(props: OnboardingBackfillFlowProps) {
  const [step, setStep] = useState<Step>('loss-warning');
  const [masterPassword, setMasterPassword] = useState('');
  const [kitGenerated, setKitGenerated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [answers, setAnswers] = useState<BackfillAnswers>({
    mnemonicWords: {},
    secretKeyDigits: {},
  });
  const challenge = useMemo(
    () =>
      (props.createChallenge ?? createBackfillChallenge)(
        props.mnemonic,
        props.secretKey,
      ),
    [props],
  );
  const passwordScore = scoreMasterPassword(masterPassword);
  const passwordOk = passwordScore >= MIN_MASTER_PASSWORD_SCORE;

  async function generateKit() {
    setBusy(true);
    setError(undefined);
    try {
      const document = await createEmergencyKitDocument({
        accountEmail: props.accountEmail,
        mnemonic: props.mnemonic,
        secretKey: props.secretKey,
        createdAtIso: new Date().toISOString(),
        qrValue: `xai-desktop-secret-key:v1:${props.secretKey}`,
      });
      props.onEmergencyKitGenerated?.(document);
      setKitGenerated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Emergency Kit generation failed');
    } finally {
      setBusy(false);
    }
  }

  async function complete() {
    setBusy(true);
    setError(undefined);
    try {
      await completeOnboardingBackfill({
        accountId: props.accountId,
        masterPassword,
        challenge,
        answers,
        mnemonic: props.mnemonic,
        secretKey: props.secretKey,
        dekCheck: props.dekCheck,
        secretKeyCheck: props.secretKeyCheck,
        proof: props.proof,
        validator: props.validator,
        transport: props.transport,
      });
      props.onComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : `${BACKFILL_INCOMPLETE_ERROR}: backfill failed`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section style={styles.shell} aria-label="Account recovery backfill">
      <div style={styles.progress}>{stepLabel(step)}</div>
      {step === 'loss-warning' ? (
        <div style={styles.panel}>
          <h1 style={styles.title}>Data loss warning</h1>
          <p style={styles.copy}>
            Losing both the master password and Secret Key permanently locks encrypted Sync data.
          </p>
          <label style={styles.label}>
            Master password
            <input
              style={styles.input}
              type="password"
              value={masterPassword}
              onChange={(event) => setMasterPassword(event.target.value)}
              autoComplete="new-password"
            />
          </label>
          <div style={passwordOk ? styles.meterOk : styles.meterBad}>
            zxcvbn score {passwordScore}/4
          </div>
          <button
            style={styles.button}
            type="button"
            disabled={!passwordOk}
            onClick={() => {
              try {
                assertStrongMasterPassword(masterPassword);
                setStep('emergency-kit');
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Weak master password rejected');
              }
            }}
          >
            Continue
          </button>
        </div>
      ) : null}
      {step === 'emergency-kit' ? (
        <div style={styles.panel}>
          <h1 style={styles.title}>Emergency Kit</h1>
          <p style={styles.copy}>Print or save the kit before continuing.</p>
          <button style={styles.button} type="button" disabled={busy} onClick={generateKit}>
            Generate PDF
          </button>
          <button
            style={styles.secondaryButton}
            type="button"
            disabled={!kitGenerated}
            onClick={() => setStep('type-back')}
          >
            I saved it
          </button>
        </div>
      ) : null}
      {step === 'type-back' ? (
        <div style={styles.panel}>
          <h1 style={styles.title}>Verify recovery details</h1>
          <div style={styles.grid}>
            {challenge.wordPositions.map((position) => (
              <label key={`word-${position}`} style={styles.label}>
                Word {position}
                <input
                  style={styles.input}
                  value={answers.mnemonicWords[position] ?? ''}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      mnemonicWords: { ...current.mnemonicWords, [position]: event.target.value },
                    }))
                  }
                  autoComplete="off"
                />
              </label>
            ))}
            {challenge.secretKeyDigitPositions.map((position) => (
              <label key={`digit-${position}`} style={styles.label}>
                Secret Key digit {position}
                <input
                  style={styles.input}
                  value={answers.secretKeyDigits[position] ?? ''}
                  maxLength={1}
                  inputMode="numeric"
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      secretKeyDigits: {
                        ...current.secretKeyDigits,
                        [position]: event.target.value.slice(-1),
                      },
                    }))
                  }
                  autoComplete="off"
                />
              </label>
            ))}
          </div>
          <button style={styles.button} type="button" disabled={busy} onClick={complete}>
            Complete setup
          </button>
        </div>
      ) : null}
      {error ? <div style={styles.error}>{error}</div> : null}
    </section>
  );
}

function stepLabel(step: Step): string {
  if (step === 'loss-warning') {
    return '1 / 3';
  }
  if (step === 'emergency-kit') {
    return '2 / 3';
  }
  return '3 / 3';
}

const styles = {
  shell: {
    maxWidth: 680,
    color: '#111827',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
  },
  panel: {
    border: '1px solid #d1d5db',
    borderRadius: 8,
    padding: 24,
    background: '#ffffff',
  },
  progress: {
    marginBottom: 12,
    color: '#4b5563',
    fontSize: 13,
    fontWeight: 600,
  },
  title: {
    margin: '0 0 10px',
    fontSize: 24,
    lineHeight: 1.2,
  },
  copy: {
    margin: '0 0 20px',
    lineHeight: 1.5,
    color: '#374151',
  },
  label: {
    display: 'grid',
    gap: 6,
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
  },
  input: {
    minHeight: 40,
    borderRadius: 6,
    border: '1px solid #9ca3af',
    padding: '0 10px',
    font: '15px ui-sans-serif, system-ui, sans-serif',
  },
  meterOk: {
    marginTop: 10,
    marginBottom: 18,
    color: '#166534',
    fontSize: 13,
  },
  meterBad: {
    marginTop: 10,
    marginBottom: 18,
    color: '#991b1b',
    fontSize: 13,
  },
  button: {
    minHeight: 40,
    border: 0,
    borderRadius: 6,
    padding: '0 16px',
    background: '#111827',
    color: '#ffffff',
    fontWeight: 700,
  },
  secondaryButton: {
    minHeight: 40,
    borderRadius: 6,
    border: '1px solid #9ca3af',
    padding: '0 16px',
    marginLeft: 10,
    background: '#ffffff',
    color: '#111827',
    fontWeight: 700,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 14,
    marginBottom: 20,
  },
  error: {
    marginTop: 12,
    color: '#991b1b',
    fontSize: 13,
  },
} satisfies Record<string, React.CSSProperties>;
