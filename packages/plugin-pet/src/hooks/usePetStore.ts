import { useCallback, useEffect, useState } from "react";
import { LocalStorageAdapter } from "../data/LocalStorageAdapter";
import { usePetRepoAdapter } from "../data/RepoProvider";
import { canTransition, nextState } from "../stateMachine";
import type { PetEntity, PetReminder, PetState } from "../types";

const PET_STORAGE_KEY = "xai.pet.v1";

export interface PetStoreState {
  pet: PetEntity;
  reminder: PetReminder | undefined;
  setState(state: PetState): void;
  feed(): void;
  hide(): void;
  show(): void;
  dismissBubble(): void;
  generateAiReminder(context: string): void;
}

/** Seed is used only on the very first run; if readPet() returns a stored entity, the stored value wins on mount. */
export function usePetStore(seed: PetEntity = createDefaultPet()): PetStoreState {
  const repoAdapter = usePetRepoAdapter();
  const [fallbackAdapter] = useState(() => new LocalStorageAdapter<PetEntity>(PET_STORAGE_KEY, [seed]));
  const adapter = repoAdapter ?? fallbackAdapter;
  const [pet, setPet] = useState(seed);
  const [reminder, setReminder] = useState<PetReminder>();

  useEffect(() => {
    let cancelled = false;
    void adapter.getAll().then((stored) => {
      if (!cancelled) setPet(stored[0] ?? seed);
    });
    return () => {
      cancelled = true;
    };
  }, [adapter, seed]);

  const persist = useCallback((next: PetEntity) => {
    setPet(next);
    void adapter.save(next);
  }, [adapter]);

  const touch = useCallback((next: PetEntity): PetEntity => ({ ...next, updatedAt: new Date().toISOString(), version: next.version + 1 }), []);

  return {
    pet,
    reminder,
    setState(state) {
      persist(touch({ ...pet, state: nextState(pet.state, state) }));
    },
    feed() {
      persist(touch({ ...pet, energy: Math.min(100, pet.energy + 20), mood: "happy", lastFed: new Date().toISOString(), state: nextState(pet.state, "interact") }));
    },
    hide() {
      persist(touch({ ...pet, hidden: true }));
    },
    show() {
      persist(touch({ ...pet, hidden: false }));
    },
    dismissBubble() {
      setReminder((current) => (current ? { ...current, dismissed: true } : current));
      persist(touch({ ...pet, state: nextState(pet.state, "idle") }));
    },
    generateAiReminder(context) {
      if (!canTransition(pet.state, "remind")) {
        // Pet is resting (or otherwise blocked); callers can wake it via setState("idle").
        return;
      }
      const message = createMockPetAiMessage(pet.personality, context);
      setReminder({ id: `reminder-${Date.now()}`, message, source: "mock-ai", dismissed: false });
      persist(touch({ ...pet, state: nextState(pet.state, "remind"), mood: "focused" }));
    },
  };
}

/** Seed is used only on the very first run; if readPet() returns a stored entity, the stored value wins on mount. */
export function createDefaultPet(): PetEntity {
  const timestamp = new Date().toISOString();
  return {
    id: "pet-default",
    entityType: "pet.pet",
    schemaVersion: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    syncScope: "device-local",
    name: "Mika",
    mood: "calm",
    energy: 72,
    lastFed: timestamp,
    hidden: false,
    state: "idle",
    version: 1,
    personality: {
      name: "Mika",
      voiceTone: "gentle",
      reminderStyle: "minimal",
    },
  };
}

function createMockPetAiMessage(personality: PetEntity["personality"], context: string): string {
  const prefix = personality.voiceTone === "direct" ? "Next:" : personality.voiceTone === "playful" ? "Tiny nudge:" : "A small reminder:";
  return `${prefix} ${context || "check today's focus before opening another task."}`;
}
