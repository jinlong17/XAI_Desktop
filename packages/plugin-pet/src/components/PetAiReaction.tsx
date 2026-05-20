import type { PetState } from "../types";

export function PetAiReaction({ state }: { state: PetState }) {
  const label = state === "interact" ? "Action acknowledged" : state === "remind" ? "Reminder generated" : state === "rest" ? "Resting" : "Watching quietly";
  return <span style={{ color: "#64748b", fontSize: 12 }}>{label}</span>;
}
