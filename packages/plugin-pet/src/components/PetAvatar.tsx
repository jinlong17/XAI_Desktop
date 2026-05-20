import type { PetEntity } from "../types";

export function PetAvatar({ pet }: { pet: PetEntity }) {
  const eye = pet.state === "rest" ? "-" : "o";
  // TODO: replace with SVG/sprite before production.
  return (
    <div
      aria-label={`${pet.name} is ${pet.mood}`}
      style={{
        width: 92,
        height: 92,
        borderRadius: "50% 50% 46% 46%",
        display: "grid",
        placeItems: "center",
        background: pet.mood === "sleepy" ? "#cbd5e1" : pet.mood === "happy" ? "#fde68a" : "#bfdbfe",
        boxShadow: "0 14px 34px rgba(15,23,42,0.22)",
        transform: pet.state === "interact" ? "translateY(-4px)" : "translateY(0)",
        transition: "transform 180ms ease",
        fontWeight: 800,
      }}
    >
      {eye}_{eye}
    </div>
  );
}
