import { describe, expect, it, vi } from 'vitest';

import {
  BACKFILL_INCOMPLETE_ERROR,
  assertStrongMasterPassword,
  completeOnboardingBackfill,
  createBackfillChallenge,
  createEmergencyKitDocument,
  createEmergencyKitPayload,
  renderEmergencyKitHtml,
  verifyBackfillChallenge,
  type BackfillAnswers,
  type BackfillLocalValidator,
} from '../src/onboarding-backfill';

const MNEMONIC = [
  'abandon',
  'ability',
  'able',
  'about',
  'above',
  'absent',
  'absorb',
  'abstract',
  'absurd',
  'abuse',
  'access',
  'accident',
  'account',
  'accuse',
  'achieve',
  'acid',
  'acoustic',
  'acquire',
  'across',
  'act',
  'action',
  'actor',
  'actress',
  'actual',
].join(' ');

const SECRET_KEY = 'XAI-1234-ABCD-5678';

describe('onboarding backfill challenge', () => {
  it('requires a strong zxcvbn password', () => {
    expect(() => assertStrongMasterPassword('password123')).toThrow(BACKFILL_INCOMPLETE_ERROR);
    expect(() => assertStrongMasterPassword('blue comet river staple 2026!')).not.toThrow();
  });

  it('verifies exactly six mnemonic words and four Secret Key digits', () => {
    const challenge = createBackfillChallenge(MNEMONIC, SECRET_KEY, () => 0);
    expect(challenge.wordPositions).toEqual([1, 2, 3, 4, 5, 6]);
    expect(challenge.secretKeyDigitPositions).toEqual([5, 6, 7, 8]);

    const correct: BackfillAnswers = {
      mnemonicWords: {
        1: 'abandon',
        2: 'ability',
        3: 'able',
        4: 'about',
        5: 'above',
        6: 'absent',
      },
      secretKeyDigits: { 5: '1', 6: '2', 7: '3', 8: '4' },
    };
    expect(verifyBackfillChallenge(challenge, correct, MNEMONIC, SECRET_KEY)).toEqual({
      ok: true,
      incorrectMnemonicPositions: [],
      incorrectSecretKeyDigitPositions: [],
    });

    expect(
      verifyBackfillChallenge(
        challenge,
        {
          ...correct,
          mnemonicWords: { ...correct.mnemonicWords, 3: 'wrong' },
          secretKeyDigits: { ...correct.secretKeyDigits, 8: '9' },
        },
        MNEMONIC,
        SECRET_KEY,
      ),
    ).toMatchObject({
      ok: false,
      incorrectMnemonicPositions: [3],
      incorrectSecretKeyDigitPositions: [8],
    });
  });

  it('runs local checks before acknowledging via Edge transport', async () => {
    const challenge = createBackfillChallenge(MNEMONIC, SECRET_KEY, () => 0);
    const validator: BackfillLocalValidator = {
      validate: vi.fn(async (input) => {
        expect(input.dekCheck).toBe('dek-check');
        expect(input.secretKeyCheck).toBe('sk-check');
        return { dekCheckOk: true, secretKeyCheckOk: true };
      }),
    };
    const transport = {
      acknowledgeOnboardingBackfill: vi.fn(async (request) => {
        expect(request).toMatchObject({
          accountId: 'account-1',
          mnemonicAcknowledged: true,
          secretKeyAcknowledged: true,
        });
        return { status: 'ok' as const };
      }),
    };

    await expect(
      completeOnboardingBackfill({
        accountId: 'account-1',
        masterPassword: 'blue comet river staple 2026!',
        challenge,
        answers: {
          mnemonicWords: {
            1: 'abandon',
            2: 'ability',
            3: 'able',
            4: 'about',
            5: 'above',
            6: 'absent',
          },
          secretKeyDigits: { 5: '1', 6: '2', 7: '3', 8: '4' },
        },
        mnemonic: MNEMONIC,
        secretKey: SECRET_KEY,
        dekCheck: 'dek-check',
        secretKeyCheck: 'sk-check',
        proof: { challengeId: 'challenge-1', message: { msgV: 1 }, signature: [1, 2, 3] },
        validator,
        transport,
      }),
    ).resolves.toEqual({ status: 'ok' });

    expect(validator.validate).toHaveBeenCalledOnce();
    expect(transport.acknowledgeOnboardingBackfill).toHaveBeenCalledOnce();
  });

  it('generates a PDF Emergency Kit with Secret Key and QR payload', async () => {
    const payload = createEmergencyKitPayload({
      accountEmail: 'user@example.com',
      secretKey: SECRET_KEY,
      mnemonic: MNEMONIC,
      createdAtIso: '2026-05-19T12:00:00.000Z',
    });
    const document = await createEmergencyKitDocument(payload);

    expect(document.filename).toBe('xai-emergency-kit-user-example-com.pdf');
    expect(document.html).toContain(SECRET_KEY);
    expect(document.qrSvg).toContain('<svg');
    expect(document.pdfDataUrl).toMatch(/^data:application\/pdf;base64,/);
    expect(new TextDecoder().decode(document.pdfBytes.slice(0, 5))).toBe('%PDF-');
  });

  it('escapes Emergency Kit HTML field values', () => {
    const payload = createEmergencyKitPayload({
      accountEmail: 'user&<>"\'<script@example.com',
      secretKey: 'XAI-&<>"\'<script-1234',
      mnemonic: MNEMONIC,
      createdAtIso: '2026-05-19T12:00:00.000Z',
    });
    const html = renderEmergencyKitHtml(payload, '<svg></svg>');

    expect(html).toContain('user&amp;&lt;&gt;&quot;&#39;&lt;script@example.com');
    expect(html).toContain('XAI-&amp;&lt;&gt;&quot;&#39;&lt;script-1234');
    expect(html).not.toContain('<script');
  });
});
