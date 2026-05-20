import { useState, type FormEvent } from "react";
import { useProjectStore } from "../hooks/useProjectStore";
import type { Card } from "../types";
import { CardDetail } from "./CardDetail";

function CardTile({
  card,
  onDropAbove,
  onOpen,
}: {
  card: Card;
  onDropAbove: (draggedId: string, beforeCard: Card) => void;
  onOpen: (card: Card) => void;
}) {
  return (
    <article
      draggable
      onClick={() => onOpen(card)}
      onDragOver={(event) => event.preventDefault()}
      onDragStart={(event) => event.dataTransfer.setData("text/plain", card.id)}
      onDrop={(event) => {
        event.stopPropagation();
        const draggedId = event.dataTransfer.getData("text/plain");
        if (draggedId && draggedId !== card.id) onDropAbove(draggedId, card);
      }}
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        cursor: "grab",
        display: "grid",
        gap: 8,
        padding: 10,
      }}
    >
      <strong>{card.title}</strong>
      <div style={{ color: "#6b7280", display: "flex", flexWrap: "wrap", fontSize: 12, gap: 8 }}>
        {card.dueDate ? <time dateTime={card.dueDate}>{card.dueDate}</time> : null}
        {card.checklist.length > 0 ? (
          <span>
            {card.checklist.filter((item) => item.done).length}/{card.checklist.length}
          </span>
        ) : null}
      </div>
    </article>
  );
}

export function BoardView() {
  const { activeProject, cards: allCards, createCard, getCardsByList, moveCard } = useProjectStore();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  if (!activeProject) {
    return <section style={{ padding: 16 }}>No project selected.</section>;
  }
  const selectedCard = selectedCardId ? allCards.find((card) => card.id === selectedCardId) ?? null : null;

  const submitCard = (event: FormEvent<HTMLFormElement>, listId: string) => {
    event.preventDefault();
    const title = drafts[listId]?.trim();
    if (!title) return;
    void createCard({ title, listId });
    setDrafts((current) => ({ ...current, [listId]: "" }));
  };

  return (
    <section style={{ display: "grid", gap: 14 }}>
      <header>
        <strong style={{ fontSize: 20 }}>{activeProject.name}</strong>
      </header>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        {activeProject.lists
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((list) => {
            const cards = getCardsByList(list.id);
            return (
              <section
                key={list.id}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  const cardId = event.dataTransfer.getData("text/plain");
                  if (cardId) void moveCard(cardId, list.id, cards.length);
                }}
                style={{ background: "#f3f4f6", borderRadius: 8, display: "grid", gap: 10, minHeight: 280, padding: 10 }}
              >
                <header style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
                  <strong>{list.title}</strong>
                  <span style={{ color: "#6b7280", fontSize: 12 }}>{cards.length}</span>
                </header>
                <div style={{ display: "grid", gap: 8 }}>
                  {cards.map((card) => (
                    <CardTile
                      card={card}
                      key={card.id}
                      onDropAbove={(draggedId, beforeCard) => {
                        const targetIndex = cards.findIndex((current) => current.id === beforeCard.id);
                        const draggedIndex = cards.findIndex((current) => current.id === draggedId);
                        const order = draggedIndex > -1 && draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
                        void moveCard(draggedId, list.id, order);
                      }}
                      onOpen={(nextCard) => setSelectedCardId(nextCard.id)}
                    />
                  ))}
                </div>
                <form onSubmit={(event) => submitCard(event, list.id)} style={{ display: "flex", gap: 6 }}>
                  <input
                    aria-label={`Add card to ${list.title}`}
                    onChange={(event) => setDrafts((current) => ({ ...current, [list.id]: event.target.value }))}
                    placeholder="Add card"
                    style={{ border: "1px solid #d1d5db", borderRadius: 8, flex: 1, minHeight: 34, padding: "0 8px" }}
                    value={drafts[list.id] ?? ""}
                  />
                  <button type="submit">Add</button>
                </form>
              </section>
            );
          })}
      </div>
      {selectedCard ? <CardDetail card={selectedCard} /> : null}
    </section>
  );
}
