import type { PetState } from "./types";

const TRANSITIONS: Record<PetState, readonly PetState[]> = {
  idle: ["remind", "interact", "rest"],
  remind: ["interact", "idle"],
  interact: ["idle", "rest"],
  rest: ["idle"],
};

export function canTransition(from: PetState, to: PetState): boolean {
  return from === to || TRANSITIONS[from].includes(to);
}

export function nextState(from: PetState, to: PetState): PetState {
  if (canTransition(from, to)) return to;
  const nodeEnv = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV;
  if (typeof console !== "undefined" && nodeEnv !== "production") {
    console.warn(`[plugin-pet] illegal transition ${from} -> ${to}; staying at ${from}`);
  }
  return from;
}
