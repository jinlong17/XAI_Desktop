// TODO(events): subscribe to "ai-cube:mock-action" via @repo/core/events bus when wired. Currently a no-op.
export type { PetEntity, PetMood, PetPersonality, PetReminder, PetState } from "./types";
export { LocalStorageAdapter } from "./data/LocalStorageAdapter";
export { RepoAdapter as PetRepoAdapter } from "./data/RepoAdapter";
export { PetRepoProvider, usePetRepoAdapter } from "./data/RepoProvider";
export type { PetRepoProviderProps } from "./data/RepoProvider";
export { canTransition } from "./stateMachine";
export { createDefaultPet, usePetStore } from "./hooks/usePetStore";
export { PetAvatar } from "./components/PetAvatar";
export { PetBubble } from "./components/PetBubble";
export { PetPanel } from "./components/PetPanel";
export { PetAiReaction } from "./components/PetAiReaction";
