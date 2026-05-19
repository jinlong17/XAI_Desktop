import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import QRCode from 'qrcode';
import zxcvbn from 'zxcvbn';

export const BACKFILL_WORD_COUNT = 6;
export const SECRET_KEY_DIGIT_COUNT = 4;
export const MIN_MASTER_PASSWORD_SCORE = 3;
export const BACKFILL_INCOMPLETE_ERROR = 'E3034';

export interface BackfillChallenge {
  wordPositions: number[];
  secretKeyDigitPositions: number[];
}

export interface BackfillAnswers {
  mnemonicWords: Record<number, string>;
  secretKeyDigits: Record<number, string>;
}

export interface BackfillVerificationResult {
  ok: boolean;
  incorrectMnemonicPositions: number[];
  incorrectSecretKeyDigitPositions: number[];
}

export interface BackfillLocalValidationInput {
  dekCheck: string;
  secretKeyCheck: string;
  mnemonic: string;
  secretKey: string;
}

export interface BackfillLocalValidationResult {
  dekCheckOk: boolean;
  secretKeyCheckOk: boolean;
}

export interface BackfillLocalValidator {
  validate(input: BackfillLocalValidationInput): Promise<BackfillLocalValidationResult>;
}

export interface EmergencyKitPayload {
  accountEmail: string;
  secretKey: string;
  mnemonic: string;
  createdAtIso: string;
  qrValue: string;
}

export interface EmergencyKitDocument {
  filename: string;
  html: string;
  pdfBytes: Uint8Array;
  pdfDataUrl: string;
  qrSvg: string;
}

export interface BackfillAcknowledgementProof {
  challengeId: string;
  message: unknown;
  signature: number[];
}

export interface BackfillAcknowledgementRequest {
  accountId: string;
  proof: BackfillAcknowledgementProof;
  mnemonicAcknowledged: true;
  secretKeyAcknowledged: true;
}

export interface BackfillAcknowledgementTransport {
  acknowledgeOnboardingBackfill(request: BackfillAcknowledgementRequest): Promise<{ status: 'ok' }>;
}

export interface CompleteBackfillInput {
  accountId: string;
  masterPassword: string;
  challenge: BackfillChallenge;
  answers: BackfillAnswers;
  mnemonic: string;
  secretKey: string;
  dekCheck: string;
  secretKeyCheck: string;
  proof: BackfillAcknowledgementProof;
  validator: BackfillLocalValidator;
  transport: BackfillAcknowledgementTransport;
}

export function scoreMasterPassword(masterPassword: string): number {
  return zxcvbn(masterPassword).score;
}

export function assertStrongMasterPassword(masterPassword: string): void {
  if (scoreMasterPassword(masterPassword) < MIN_MASTER_PASSWORD_SCORE) {
    throw new Error(`${BACKFILL_INCOMPLETE_ERROR}: weak master password rejected`);
  }
}

export function createBackfillChallenge(
  mnemonic: string,
  secretKey: string,
  randomInt: (maxExclusive: number) => number = defaultRandomInt,
): BackfillChallenge {
  const words = normalizeMnemonicWords(mnemonic);
  if (words.length !== 24) {
    throw new Error(`${BACKFILL_INCOMPLETE_ERROR}: expected a 24 word mnemonic`);
  }
  const digitPositions = extractSecretKeyDigitPositions(secretKey);
  if (digitPositions.length < SECRET_KEY_DIGIT_COUNT) {
    throw new Error(`${BACKFILL_INCOMPLETE_ERROR}: secret key must contain at least four digits`);
  }

  return {
    wordPositions: chooseUniquePositions(24, BACKFILL_WORD_COUNT, randomInt).sort((a, b) => a - b),
    secretKeyDigitPositions: chooseFromArray(
      digitPositions,
      SECRET_KEY_DIGIT_COUNT,
      randomInt,
    ).sort((a, b) => a - b),
  };
}

export function verifyBackfillChallenge(
  challenge: BackfillChallenge,
  answers: BackfillAnswers,
  mnemonic: string,
  secretKey: string,
): BackfillVerificationResult {
  const words = normalizeMnemonicWords(mnemonic);
  const incorrectMnemonicPositions = challenge.wordPositions.filter((position) => {
    const expected = words[position - 1];
    const actual = answers.mnemonicWords[position]?.trim().toLowerCase();
    return expected === undefined || actual !== expected;
  });
  const secretKeyChars = Array.from(secretKey);
  const incorrectSecretKeyDigitPositions = challenge.secretKeyDigitPositions.filter((position) => {
    const expected = secretKeyChars[position - 1];
    const actual = answers.secretKeyDigits[position]?.trim();
    return expected === undefined || actual !== expected;
  });

  return {
    ok: incorrectMnemonicPositions.length === 0 && incorrectSecretKeyDigitPositions.length === 0,
    incorrectMnemonicPositions,
    incorrectSecretKeyDigitPositions,
  };
}

export async function validateLocalRecoveryChecks(
  validator: BackfillLocalValidator,
  input: BackfillLocalValidationInput,
): Promise<BackfillLocalValidationResult> {
  const result = await validator.validate(input);
  if (!result.dekCheckOk || !result.secretKeyCheckOk) {
    throw new Error(`${BACKFILL_INCOMPLETE_ERROR}: local recovery checks failed`);
  }
  return result;
}

export async function completeOnboardingBackfill(
  input: CompleteBackfillInput,
): Promise<{ status: 'ok' }> {
  assertStrongMasterPassword(input.masterPassword);
  const verification = verifyBackfillChallenge(
    input.challenge,
    input.answers,
    input.mnemonic,
    input.secretKey,
  );
  if (!verification.ok) {
    throw new Error(`${BACKFILL_INCOMPLETE_ERROR}: backfill type-back mismatch`);
  }
  await validateLocalRecoveryChecks(input.validator, {
    dekCheck: input.dekCheck,
    secretKeyCheck: input.secretKeyCheck,
    mnemonic: input.mnemonic,
    secretKey: input.secretKey,
  });
  return input.transport.acknowledgeOnboardingBackfill({
    accountId: input.accountId,
    proof: input.proof,
    mnemonicAcknowledged: true,
    secretKeyAcknowledged: true,
  });
}

export function createEmergencyKitPayload(input: {
  accountEmail: string;
  secretKey: string;
  mnemonic: string;
  createdAtIso?: string;
}): EmergencyKitPayload {
  return {
    accountEmail: input.accountEmail,
    secretKey: input.secretKey,
    mnemonic: normalizeMnemonicWords(input.mnemonic).join(' '),
    createdAtIso: input.createdAtIso ?? new Date().toISOString(),
    qrValue: `xai-desktop-secret-key:v1:${input.secretKey}`,
  };
}

export async function createEmergencyKitDocument(
  payload: EmergencyKitPayload,
): Promise<EmergencyKitDocument> {
  const qrSvg = await QRCode.toString(payload.qrValue, {
    type: 'svg',
    margin: 2,
    errorCorrectionLevel: 'M',
  });
  const qrPngDataUrl = await QRCode.toDataURL(payload.qrValue, {
    margin: 2,
    errorCorrectionLevel: 'M',
  });
  const pdfBytes = await createEmergencyKitPdfBytes(payload, qrPngDataUrl);
  return {
    filename: `xai-emergency-kit-${safeFilenameSegment(payload.accountEmail)}.pdf`,
    html: renderEmergencyKitHtml(payload, qrSvg),
    pdfBytes,
    pdfDataUrl: `data:application/pdf;base64,${bytesToBase64(pdfBytes)}`,
    qrSvg,
  };
}

export function renderEmergencyKitHtml(payload: EmergencyKitPayload, qrSvg: string): string {
  const words = normalizeMnemonicWords(payload.mnemonic);
  const wordList = words
    .map((word, index) => `<li><span>${index + 1}</span>${escapeHtml(word)}</li>`)
    .join('');
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>XAI Emergency Kit</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, sans-serif; margin: 40px; color: #111827; }
    h1 { font-size: 26px; margin: 0 0 8px; }
    .meta { color: #4b5563; margin-bottom: 24px; }
    .secret { border: 1px solid #111827; padding: 14px; font: 18px ui-monospace, monospace; margin: 16px 0; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px 18px; padding: 0; }
    li { list-style: none; font: 14px ui-monospace, monospace; }
    li span { display: inline-block; width: 28px; color: #6b7280; }
    .qr { width: 180px; margin-top: 18px; }
    @media print { body { margin: 24px; } }
  </style>
</head>
<body>
  <h1>XAI Emergency Kit</h1>
  <div class="meta">${escapeHtml(payload.accountEmail)} · ${escapeHtml(payload.createdAtIso)}</div>
  <h2>Secret Key</h2>
  <div class="secret">${escapeHtml(payload.secretKey)}</div>
  <h2>Mnemonic</h2>
  <ol class="grid">${wordList}</ol>
  <div class="qr">${qrSvg}</div>
</body>
</html>`;
}

async function createEmergencyKitPdfBytes(
  payload: EmergencyKitPayload,
  qrPngDataUrl: string,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const mono = await doc.embedFont(StandardFonts.Courier);
  const qrPng = await doc.embedPng(base64ToBytes(qrPngDataUrl.split(',')[1] ?? ''));
  page.drawText('XAI Emergency Kit', {
    x: 48,
    y: 724,
    size: 24,
    font,
    color: rgb(0.07, 0.09, 0.15),
  });
  page.drawText(`${payload.accountEmail}  ${payload.createdAtIso}`, {
    x: 48,
    y: 696,
    size: 10,
    font,
    color: rgb(0.31, 0.35, 0.41),
  });
  page.drawText('Secret Key', { x: 48, y: 650, size: 14, font });
  page.drawText(payload.secretKey, { x: 48, y: 628, size: 12, font: mono });
  page.drawImage(qrPng, { x: 420, y: 564, width: 128, height: 128 });
  page.drawText('Mnemonic', { x: 48, y: 586, size: 14, font });
  const words = normalizeMnemonicWords(payload.mnemonic);
  words.forEach((word, index) => {
    const column = index % 3;
    const row = Math.floor(index / 3);
    page.drawText(`${String(index + 1).padStart(2, '0')}. ${word}`, {
      x: 48 + column * 170,
      y: 558 - row * 24,
      size: 11,
      font: mono,
    });
  });
  return doc.save();
}

function normalizeMnemonicWords(mnemonic: string): string[] {
  return mnemonic.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

function extractSecretKeyDigitPositions(secretKey: string): number[] {
  return Array.from(secretKey)
    .map((char, index) => ({ char, position: index + 1 }))
    .filter(({ char }) => /\d/.test(char))
    .map(({ position }) => position);
}

function chooseUniquePositions(
  totalPositions: number,
  count: number,
  randomInt: (maxExclusive: number) => number,
): number[] {
  return chooseFromArray(
    Array.from({ length: totalPositions }, (_, index) => index + 1),
    count,
    randomInt,
  );
}

function chooseFromArray<T>(values: T[], count: number, randomInt: (maxExclusive: number) => number): T[] {
  const remaining = [...values];
  const selected: T[] = [];
  for (let index = 0; index < count; index += 1) {
    const selectedIndex = randomInt(remaining.length);
    const [value] = remaining.splice(selectedIndex, 1);
    if (value === undefined) {
      throw new Error(`${BACKFILL_INCOMPLETE_ERROR}: challenge generation failed`);
    }
    selected.push(value);
  }
  return selected;
}

function defaultRandomInt(maxExclusive: number): number {
  const bytes = new Uint32Array(1);
  globalThis.crypto.getRandomValues(bytes);
  return bytes[0]! % maxExclusive;
}

function safeFilenameSegment(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'account';
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}
