/** Reviewer-owned binding seam. Bind only to the author's fixed committed API. */
import type { AccountScope } from '@repo/plugin-web-storage';
import { commitCanonicalCommand, setCanonicalCommandActivationForTests, canonicalCommandReceiptId, canonicalCommandSignature } from '@repo/plugin-web-storage';
import { vi } from 'vitest';
export type Data = Record<string, { title: string }>;
export type Lock = <T>(name: string, run: () => Promise<T>) => Promise<T>;
export type Outcome = { ok: true; targetId: string } | { ok: false; code: string };
export type Input = {
  scope: AccountScope;
  requestId: string;
  signature: string;
  enabled?: boolean;
  lock?: Lock;
  initial: () => Data;
  validate: (value: unknown) => value is Data;
  mutate: (value: Data) => { data: unknown; targetId: string };
};
export const BINDING_READY = true;
export const channel = 'astra:calendar-command';
export const signatureFor = canonicalCommandSignature;
export const receiptIdentity = (requestId: string) => canonicalCommandReceiptId(channel, requestId)!;
export const resetActivation = () => setCanonicalCommandActivationForTests(false);
export async function runPrimitive(input: Input): Promise<Outcome> {
  // Omitted activation leaves the production default untouched.
  if (input.enabled !== undefined) setCanonicalCommandActivationForTests(input.enabled);
  if (input.lock) vi.stubGlobal('navigator', { locks: { request: input.lock } });
  const result = await commitCanonicalCommand({
    key: 'xai_calendar_events', scope: input.scope, channel,
    requestId: input.requestId, operation: input.signature,
    validate: input.validate, initialize: input.initial,
    mutate: data => ({ ok: true, ...input.mutate(data) }) as { ok: true; data: Data; targetId: string },
  });
  return result.ok ? { ok: true, targetId: result.targetId } : { ok: false, code: result.reason };
}
