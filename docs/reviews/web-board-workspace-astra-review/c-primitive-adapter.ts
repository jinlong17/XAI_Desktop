/** Reviewer-owned binding seam. Bind only to the author's fixed committed API. */
import type { AccountScope } from '@repo/plugin-web-storage';
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
export const BINDING_READY = false;
export async function runPrimitive(_input: Input): Promise<Outcome> {
  throw new Error('C adapter is not bound: wait for a fixed product commit and its actual API; do not report a product verdict.');
}
