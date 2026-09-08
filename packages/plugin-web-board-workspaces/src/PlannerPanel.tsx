/**
 * PlannerPanel — today's time-slot view (320px wide; hours 8am..7pm).
 *
 * Slots are seeded from cards whose board-core typed date meta is due today.
 * When no due-today cards exist, 3 sample slots render.
 *
 * Port of `web design/module-board.jsx` lines 1222..1277.
 */

import type { BoardListData, BoardCardData } from "@repo/plugin-web-board-core";
import { getBoardCardDateMeta } from "@repo/plugin-web-board-core";
import { STR_PLANNER, PLANNER_WEEKDAYS_ZH, type Lang } from "./internal/strings.js";

export interface PlannerPanelProps {
  lists: readonly BoardListData[];
  lang: Lang;
  /** Optional now-injection for deterministic tests. Defaults to new Date(). */
  now?: Date;
  /** Optional click handler for real-card slots. */
  onOpenCard?: (cardId: string, listId: string) => void;
}

type PlannerColor = "green" | "blue" | "amber" | "purple";

interface RealSlot {
  kind: "real";
  card: BoardCardData;
  listId: string;
  hour: number;
  color: PlannerColor;
}
interface SampleSlot {
  kind: "sample";
  label: string;
  hour: number;
  color: PlannerColor;
}
type Slot = RealSlot | SampleSlot;

const SLOT_COLORS: readonly PlannerColor[] = ["green", "blue", "amber", "purple"];

function formatHourLabel(h: number): string {
  // 8a, 9a, ..., 12p, 1p, ..., 11p
  const isAM = h < 12 || h === 24;
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}${isAM ? "a" : "p"}`;
}

function formatDateLabel(now: Date, lang: Lang): string {
  if (lang === "zh") {
    const m = now.getMonth() + 1;
    const d = now.getDate();
    const w = PLANNER_WEEKDAYS_ZH[now.getDay()] ?? "";
    return `${m}月${d}日 ${w}`;
  }
  // en-US: "May 23, Fri"
  const weekday = now.toLocaleDateString("en-US", { weekday: "short" });
  const monthDay = now.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${monthDay}, ${weekday}`;
}

export function computePlannerSlots(
  lists: readonly BoardListData[],
  now: Date,
  lang: Lang,
): Slot[] {
  const dueToday: { card: BoardCardData; listId: string }[] = [];
  for (const l of lists) {
    for (const card of l.cards) {
      if (getBoardCardDateMeta(card, { now }).isDueToday) {
        dueToday.push({ card, listId: l.id });
      }
    }
  }

  if (dueToday.length === 0) {
    return [
      { kind: "sample", label: STR_PLANNER.deepFocus[lang], hour: 9, color: "green" },
      { kind: "sample", label: STR_PLANNER.review[lang], hour: 11, color: "amber" },
      { kind: "sample", label: STR_PLANNER.walk[lang], hour: 14, color: "blue" },
    ];
  }

  return dueToday.slice(0, 6).map((entry, i) => ({
    kind: "real" as const,
    card: entry.card,
    listId: entry.listId,
    hour: 9 + i * 2,
    color: SLOT_COLORS[i % SLOT_COLORS.length] ?? "green",
  }));
}

export function PlannerPanel({ lists, lang, now, onOpenCard }: PlannerPanelProps) {
  const actualNow = now ?? new Date();
  const slots = computePlannerSlots(lists, actualNow, lang);
  const slotByHour = new Map<number, Slot>();
  for (const s of slots) slotByHour.set(s.hour, s);

  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8..19

  return (
    <section className="board-panel planner-panel" data-testid="planner-panel">
      <header className="panel-head">
        <span className="panel-icon" aria-hidden="true">
          📅
        </span>
        <h2>{STR_PLANNER.planner[lang]}</h2>
        <span className="grow"></span>
      </header>
      <div className="pl-date">{formatDateLabel(actualNow, lang)}</div>
      <div className="pl-body">
        {hours.map((h) => {
          const slot = slotByHour.get(h);
          return (
            <div key={h} className="pl-row">
              <div className="pl-h mono">{formatHourLabel(h)}</div>
              <div className="pl-slot">
                {slot && (
                  <button
                    type="button"
                    className={"pl-event pl-color-" + slot.color}
                    onClick={() => {
                      if (slot.kind === "real" && onOpenCard) {
                        onOpenCard(slot.card.id, slot.listId);
                      }
                    }}
                    data-testid={`planner-slot-${h}`}
                  >
                    <span className="pl-event-title">
                      {slot.kind === "real" ? slot.card.title[lang] : slot.label}
                    </span>
                    <span className="pl-event-time mono">
                      {(h % 12 === 0 ? 12 : h % 12).toString()}:00
                    </span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
