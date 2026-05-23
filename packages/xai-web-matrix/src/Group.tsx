/**
 * Group — a collapsible group row inside a quadrant body.
 *
 * Ports the prototype's Group component (module-matrix.jsx lines 57–85)
 * with typed props and typed collapse state.
 *
 * Design: design.md §3 component tree
 */

import { useState } from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import type { MatrixCard, Quadrant } from "./types.js";
import { Card } from "./Card.js";
import { ChevDIcon } from "./internal/icons.js";

export interface GroupProps {
  label: string;
  cards: readonly MatrixCard[];
  lang: Lang;
  quadrant: Quadrant;
  onCardDropped: (cardId: string, to: Quadrant) => void;
}

export function Group({ label, cards, lang, quadrant, onCardDropped }: GroupProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="m-group">
      <button
        type="button"
        className="m-group-head"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <ChevDIcon
          size={13}
          style={{
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
            transition: "transform .2s",
          }}
        />
        <span>{label}</span>
        <span className="col-count">{cards.length}</span>
      </button>
      {open && (
        <ul className="m-rows" aria-label={label}>
          {cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              lang={lang}
              quadrant={quadrant}
              onCardDropped={onCardDropped}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
