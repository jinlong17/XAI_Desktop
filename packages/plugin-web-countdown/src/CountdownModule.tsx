import React, { useEffect, useMemo, useState } from "react";
import type { CountdownCard, CountdownViewMode } from "./types.js";
import type { Lang } from "@repo/plugin-web-tokens";
import { useI18n } from "@repo/plugin-web-tokens";
import { usePref } from "@repo/plugin-web-storage";
import {
  addCard,
  deleteCard,
  duplicateCard,
  hideCard,
  pinCard,
  restoreCard,
  updateCard,
} from "./internal/cardsReducer.js";
import {
  isCardVisible,
  isHistoryCard,
  mergePresetCountdowns,
  sortedCountdowns,
} from "./internal/presetCards.js";
import { computeCountdownMetrics, toDateString, todayDateString } from "./internal/countdownMath.js";
import { CountdownCardView } from "./CountdownCardView.js";
import { AddCountdownCard } from "./AddCountdownCard.js";
import { CountdownEditDialog } from "./internal/CountdownEditDialog.js";
import { IconGlyph } from "./internal/icons.js";

export interface CountdownModuleProps {
  lang: Lang;
}

type ModalState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; card: CountdownCard };

const VIEWS: readonly CountdownViewMode[] = ["cards", "list", "timeline", "calendar", "history"];

function viewLabel(view: CountdownViewMode, lang: Lang): string {
  const zh: Record<CountdownViewMode, string> = {
    cards: "卡片",
    list: "紧凑列表",
    timeline: "时间线",
    calendar: "日历",
    history: "历史",
  };
  const en: Record<CountdownViewMode, string> = {
    cards: "Cards",
    list: "Compact list",
    timeline: "Timeline",
    calendar: "Calendar",
    history: "History",
  };
  return lang === "zh" ? zh[view] : en[view];
}

function monthTitle(date: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === "zh" ? "zh-CN" : "en-US", { month: "long", year: "numeric" }).format(date);
}

function sameStorageShape(a: unknown, b: CountdownCard[]): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function CountdownModule({ lang }: CountdownModuleProps) {
  const { t } = useI18n(lang);
  const [rawCards, setRawCards] = usePref("xai_countdowns");
  const [modal, setModal] = useState<ModalState>({ mode: "closed" });
  const [view, setView] = useState<CountdownViewMode>("cards");
  const [now, setNow] = useState(() => new Date());
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));

  const todayKey = todayDateString(now);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60_000);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") setNow(new Date());
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useEffect(() => {
    setRawCards((prev) => {
      const merged = mergePresetCountdowns(prev, new Date());
      return sameStorageShape(prev, merged) ? prev : merged;
    });
  }, [setRawCards, todayKey]);

  const cards = useMemo(() => mergePresetCountdowns(rawCards, now), [rawCards, now]);
  const activeCards = useMemo(() => sortedCountdowns(cards.filter(isCardVisible)), [cards]);
  const historyCards = useMemo(() => sortedCountdowns(cards.filter((card) => isHistoryCard(card, now))), [cards, now]);
  const completedCount = historyCards.filter((card) => computeCountdownMetrics(card, now, lang).isPast).length;
  const pinnedCount = activeCards.filter((card) => card.is_pinned).length;
  const presetCount = cards.filter((card) => card.source === "preset").length;

  function openCreate() {
    setModal({ mode: "create" });
  }

  function openEdit(card: CountdownCard) {
    setModal({ mode: "edit", card });
  }

  function closeModal() {
    setModal({ mode: "closed" });
  }

  function mutateCards(mutator: (cards: CountdownCard[]) => CountdownCard[]) {
    setRawCards((prev) => mutator(mergePresetCountdowns(prev, new Date())));
  }

  function handleSave(draft: Omit<CountdownCard, "id">) {
    mutateCards((prev) => {
      if (modal.mode === "create") return addCard(prev, draft);
      if (modal.mode === "edit") return updateCard(prev, modal.card.id, draft);
      return prev;
    });
    closeModal();
  }

  function handleDelete(id: string) {
    mutateCards((prev) => deleteCard(prev, id));
    closeModal();
  }

  function cardHandlers() {
    return {
      onEdit: openEdit,
      onDelete: (id: string) => mutateCards((prev) => deleteCard(prev, id)),
      onHide: (id: string) => mutateCards((prev) => hideCard(prev, id, true)),
      onPin: (id: string, pinned: boolean) => mutateCards((prev) => pinCard(prev, id, pinned)),
      onDuplicate: (id: string) => mutateCards((prev) => duplicateCard(prev, id)),
    };
  }

  return (
    <div className="module module-countdown">
      <header className="cd-page-head">
        <div>
          <p className="cd-kicker">{lang === "zh" ? "时间规划" : "Time planning"}</p>
          <h1 className="module-title">{t.countdown.title}</h1>
        </div>
        <div className="cd-page-actions">
          <button type="button" className="cd-btn" onClick={() => setView("history")}>
            <IconGlyph name="restore" size={14} />{viewLabel("history", lang)}
          </button>
          <button type="button" className="cd-btn primary" onClick={openCreate} aria-label={lang === "zh" ? "新建倒计时" : "New countdown"}>
            <IconGlyph name="plus" size={14} />{lang === "zh" ? "新建" : "New"}
          </button>
        </div>
      </header>

      <section className="cd-overview" aria-label={lang === "zh" ? "倒计时概览" : "Countdown overview"}>
        <div><span>{activeCards.length}</span><p>{lang === "zh" ? "可见倒计时" : "visible"}</p></div>
        <div><span>{pinnedCount}</span><p>{lang === "zh" ? "已固定" : "pinned"}</p></div>
        <div><span>{presetCount}</span><p>{lang === "zh" ? "自动预设" : "presets"}</p></div>
        <div><span>{completedCount}</span><p>{lang === "zh" ? "历史完成" : "completed"}</p></div>
      </section>

      <nav className="cd-view-tabs" aria-label={lang === "zh" ? "倒计时视图" : "Countdown views"}>
        {VIEWS.map((item) => (
          <button
            key={item}
            type="button"
            className={item === view ? "selected" : ""}
            onClick={() => setView(item)}
            aria-pressed={item === view}
          >
            {viewLabel(item, lang)}
          </button>
        ))}
      </nav>

      {view === "cards" && (
        <div className="countdown-grid">
          {activeCards.map((card) => <CountdownCardView key={card.id} card={card} lang={lang} now={now} {...cardHandlers()} />)}
          <AddCountdownCard lang={lang} onClick={openCreate} />
        </div>
      )}

      {view === "list" && (
        <div className="cd-list-view">
          {activeCards.map((card) => <CountdownCardView key={card.id} card={card} lang={lang} now={now} density="list" {...cardHandlers()} />)}
        </div>
      )}

      {view === "timeline" && (
        <div className="cd-timeline-view">
          {activeCards.map((card) => <CountdownCardView key={card.id} card={card} lang={lang} now={now} density="timeline" {...cardHandlers()} />)}
        </div>
      )}

      {view === "calendar" && (
        <CalendarView
          cards={activeCards}
          lang={lang}
          now={now}
          month={calendarMonth}
          onMonthChange={setCalendarMonth}
          onEdit={openEdit}
        />
      )}

      {view === "history" && (
        <HistoryView
          cards={historyCards}
          lang={lang}
          now={now}
          onRestore={(id) => mutateCards((prev) => restoreCard(prev, id, new Date()))}
          onDuplicate={(id) => mutateCards((prev) => duplicateCard(prev, id))}
        />
      )}

      {modal.mode !== "closed" && (
        <CountdownEditDialog
          card={modal.mode === "edit" ? modal.card : null}
          lang={lang}
          onSave={handleSave}
          onDelete={handleDelete}
          onCancel={closeModal}
        />
      )}
    </div>
  );
}

interface CalendarViewProps {
  readonly cards: readonly CountdownCard[];
  readonly lang: Lang;
  readonly now: Date;
  readonly month: Date;
  readonly onMonthChange: (month: Date) => void;
  readonly onEdit: (card: CountdownCard) => void;
}

function CalendarView({ cards, lang, now, month, onMonthChange, onEdit }: CalendarViewProps) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const leading = first.getDay();
  const cells = Array.from({ length: leading + daysInMonth }, (_, index) => {
    if (index < leading) return null;
    return new Date(month.getFullYear(), month.getMonth(), index - leading + 1);
  });
  const weekdays = lang === "zh" ? ["日", "一", "二", "三", "四", "五", "六"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <section className="cd-calendar-view">
      <header>
        <button type="button" className="cd-mini-action" onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
          <IconGlyph name="chevL" size={14} />
        </button>
        <h2>{monthTitle(month, lang)}</h2>
        <button type="button" className="cd-mini-action" onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
          <IconGlyph name="chevR" size={14} />
        </button>
      </header>
      <div className="cd-calendar-grid cd-calendar-grid--weekdays">
        {weekdays.map((day) => <b key={day}>{day}</b>)}
      </div>
      <div className="cd-calendar-grid">
        {cells.map((date, index) => {
          const key = date ? toDateString(date) : `empty-${index}`;
          const events = date ? cards.filter((card) => card.target_date === toDateString(date)) : [];
          const isToday = date ? toDateString(date) === todayDateString(now) : false;
          return (
            <div key={key} className={isToday ? "today" : ""}>
              {date && <span>{date.getDate()}</span>}
              {events.map((card) => (
                <button key={card.id} type="button" onClick={() => onEdit(card)}>
                  {lang === "zh" ? card.title.zh || card.title.en : card.title.en || card.title.zh}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}

interface HistoryViewProps {
  readonly cards: readonly CountdownCard[];
  readonly lang: Lang;
  readonly now: Date;
  readonly onRestore: (id: string) => void;
  readonly onDuplicate: (id: string) => void;
}

function HistoryView({ cards, lang, now, onRestore, onDuplicate }: HistoryViewProps) {
  if (cards.length === 0) {
    return (
      <section className="cd-empty-history">
        <IconGlyph name="restore" size={24} />
        <h2>{lang === "zh" ? "还没有历史记录" : "No history yet"}</h2>
        <p>{lang === "zh" ? "隐藏、删除或完成的倒计时会出现在这里。" : "Hidden, deleted, and completed countdowns appear here."}</p>
      </section>
    );
  }
  return (
    <section className="cd-history-view">
      {cards.map((card) => {
        const metrics = computeCountdownMetrics(card, now, lang);
        const title = lang === "zh" ? card.title.zh || card.title.en : card.title.en || card.title.zh;
        const stateLabel = card.status === "deleted"
          ? (lang === "zh" ? "已删除" : "Deleted")
          : card.is_hidden
            ? (lang === "zh" ? "已隐藏" : "Hidden")
            : metrics.isPast
              ? (lang === "zh" ? "已完成" : "Completed")
              : (lang === "zh" ? "历史" : "History");
        return (
          <article key={card.id}>
            <span className="cd-history-state">{stateLabel}</span>
            <div>
              <h2>{title}</h2>
              <p>{metrics.fullTargetLabel} · {card.created_at ? new Date(card.created_at).toLocaleDateString() : ""}</p>
            </div>
            <button type="button" onClick={() => onRestore(card.id)}><IconGlyph name="restore" size={13} />{lang === "zh" ? "重新启用" : "Restore"}</button>
            <button type="button" onClick={() => onDuplicate(card.id)}><IconGlyph name="copy" size={13} />{lang === "zh" ? "复制为新倒计时" : "Copy as new"}</button>
          </article>
        );
      })}
    </section>
  );
}
