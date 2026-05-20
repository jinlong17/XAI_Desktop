import { useCallback, useEffect, useState } from "react";
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

export function usePetStore(seed: PetEntity = createDefaultPet()): PetStoreState {
  const [pet, setPet] = useState(seed);
  const [reminder, setReminder] = useState<PetReminder>();

  useEffect(() => {
    const stored = readPet();
    if (stored) {
      setPet(stored);
    }
  }, []);

  const persist = useCallback((next: PetEntity) => {
    setPet(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PET_STORAGE_KEY, JSON.stringify(next));
    }
  }, []);

  return {
    pet,
    reminder,
    setState(state) {
      persist({ ...pet, state, updatedAt: new Date().toISOString() });
    },
    feed() {
      persist({ ...pet, energy: Math.min(100, pet.energy + 20), mood: "happy", lastFed: new Date().toISOString(), state: "interact" });
    },
    hide() {
      persist({ ...pet, hidden: true, updatedAt: new Date().toISOString() });
    },
    show() {
      persist({ ...pet, hidden: false, updatedAt: new Date().toISOString() });
    },
    dismissBubble() {
      setReminder((current) => (current ? { ...current, dismissed: true } : current));
      persist({ ...pet, state: "idle", updatedAt: new Date().toISOString() });
    },
    generateAiReminder(context) {
      const message = createMockPetAiMessage(pet.personality, context);
      setReminder({ id: `reminder-${Date.now()}`, message, source: "mock-ai", dismissed: false });
      persist({ ...pet, state: "remind", mood: "focused", updatedAt: new Date().toISOString() });
    },
  };
}

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
    personality: {
      name: "Mika",
      voiceTone: "gentle",
      reminderStyle: "minimal",
    },
  };
}

function readPet(): PetEntity | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  try {
    const raw = window.localStorage.getItem(PET_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PetEntity) : undefined;
  } catch {
    return undefined;
  }
}

function createMockPetAiMessage(personality: PetEntity["personality"], context: string): string {
  const prefix = personality.voiceTone === "direct" ? "Next:" : personality.voiceTone === "playful" ? "Tiny nudge:" : "A small reminder:";
  return `${prefix} ${context || "check today's focus before opening another task."}`;
}
