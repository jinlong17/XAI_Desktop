import type { RepoRecord } from "@repo/core-data";

export type PetMood = "calm" | "focused" | "happy" | "sleepy";
export type PetState = "idle" | "remind" | "interact" | "rest";

export interface PetPersonality {
  name: string;
  voiceTone: "gentle" | "direct" | "playful";
  reminderStyle: "minimal" | "coach" | "celebrate";
}

export interface PetEntity extends RepoRecord {
  entityType: "pet.pet";
  name: string;
  mood: PetMood;
  energy: number;
  lastFed: string;
  personality: PetPersonality;
  hidden: boolean;
  state: PetState;
  version: number;
  deletedAt?: string;
}

export interface DataAdapter<T extends { id: string }> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  save(item: T): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface PetReminder {
  id: string;
  message: string;
  source: "mock-ai" | "habit" | "calendar" | "manual";
  dismissed: boolean;
}
