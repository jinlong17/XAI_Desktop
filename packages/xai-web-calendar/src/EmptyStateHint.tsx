/**
 * EmptyStateHint — bilingual hint shown when both fixture and user
 * events are absent in the active viewport.
 *
 * v1.2 always shows the fixture, so this only appears when the operator
 * explicitly suppresses the fixture (Q9-C dev-toggle escape hatch is a
 * future-row option per design.md §16.3). v1 condition is therefore:
 * userEvents.length === 0 — visually communicates "create your first event".
 *
 * a11y: role="status" so screen readers announce when the hint appears.
 *
 * Design: docs/design.md §16.4
 */

import type { JSX } from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import { EMPTY_STATE_HINT, s } from "./internal/strings.js";

export interface EmptyStateHintProps {
  lang: Lang;
}

export function EmptyStateHint({ lang }: EmptyStateHintProps): JSX.Element {
  return (
    <div className="cal-empty-hint" role="status">
      <span>{s(EMPTY_STATE_HINT, "hint", lang)}</span>
    </div>
  );
}
