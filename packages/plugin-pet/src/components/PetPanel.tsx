import { usePetStore } from "../hooks/usePetStore";
import { PetAiReaction } from "./PetAiReaction";
import { PetAvatar } from "./PetAvatar";
import { PetBubble } from "./PetBubble";

export function PetPanel() {
  const store = usePetStore();
  if (store.pet.hidden) {
    return (
      <button type="button" onClick={store.show}>
        Show pet
      </button>
    );
  }

  return (
    <section style={{ display: "grid", gap: 12, justifyItems: "start" }}>
      <PetBubble reminder={store.reminder} onDismiss={store.dismissBubble} />
      <PetAvatar pet={store.pet} />
      <div style={{ display: "grid", gap: 4 }}>
        <strong>{store.pet.name}</strong>
        <span>Energy {store.pet.energy}%</span>
        <PetAiReaction state={store.pet.state} />
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" onClick={store.feed}>
          Feed
        </button>
        <button type="button" onClick={() => store.generateAiReminder("finish the active planning note.")}>
          Mock AI nudge
        </button>
        <button type="button" onClick={() => store.setState("rest")}>
          Rest
        </button>
        <button type="button" onClick={store.hide}>
          Hide
        </button>
      </div>
    </section>
  );
}
