// TODO(events): subscribe to "ai-cube:mock-action" via @repo/core/events bus when wired. Currently a no-op.
export type { PetEntity, PetMood, PetPersonality, PetReminder, PetState } from "./types";
export { canTransition } from "./stateMachine";
export { createDefaultPet, usePetStore } from "./hooks/usePetStore";
export { PetAvatar } from "./components/PetAvatar";
export { PetBubble } from "./components/PetBubble";
export { PetPanel } from "./components/PetPanel";
export { PetAiReaction } from "./components/PetAiReaction";
