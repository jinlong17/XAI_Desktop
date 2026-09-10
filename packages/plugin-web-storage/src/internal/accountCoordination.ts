import { accountPrefix } from "./accountScope.js";

export type AccountLockMode = "shared" | "exclusive";
export type AccountCoordinationLock = <T>(name: string, mode: AccountLockMode, run: () => Promise<T>) => Promise<T>;

/** Shared by every generation of one account; generation is deliberately excluded. */
export function accountLifecycleLockName(accountId: string, demo = false): string {
  return `${accountPrefix(accountId, demo)}lifecycle`;
}

/** Browser Web Locks adapter. Callers turn an unavailable lock into their typed result. */
export const browserAccountLock: AccountCoordinationLock = async (name, mode, run) => {
  if (typeof navigator === "undefined" || !navigator.locks) {
    throw new Error("Account coordination lock unavailable.");
  }
  return navigator.locks.request(name, { mode }, run);
};
