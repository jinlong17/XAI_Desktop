/**
 * DayOverview — date-first popover before opening the event composer.
 *
 * Clicking a date in year/month view should first answer "what is planned on
 * this day?" before offering creation. User events can be opened for editing;
 * fixture/sample events remain read-only.
 */

import type { MouseEvent, ReactElement } from "react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import type { MergedCalEvent } from "./internal/eventStore/mergeEventsForViewport.js";
import { SAMPLE_BADGE, STR_DAY_OVERVIEW, s } from "./internal/strings.js";

export interface DayOverviewProps {
  open: boolean;
  dateKey: string | null;
  events: MergedCalEvent[];
  lang: Lang;
  onNewEvent: (dateKey: string) => void;
  onUserEventClick: (userId: string) => void;
  onClose: () => void;
}

function formatOverviewDate(dateKey: string | null, lang: Lang): string {
  if (!dateKey) return "";
  const [year, month, day] = dateKey.split("-").map((n) => Number(n));
  if (!year || !month || !day) return dateKey;
  return new Intl.DateTimeFormat(lang === "zh" ? "zh-CN" : "en-US", {
    timeZone: "UTC",
    weekday: "long",
    year: "numeric",
    month: lang === "zh" ? "numeric" : "short",
    day: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}

function eventTitle(event: MergedCalEvent, lang: Lang): string {
  return lang === "zh" ? event.t.zh : event.t.en;
}

function eventMeta(event: MergedCalEvent, lang: Lang): string {
  if (event._allDay || !event.time) return s(STR_DAY_OVERVIEW, "all_day", lang);
  return event.endTime ? `${event.time}-${event.endTime}` : event.time;
}

export function DayOverview({
  open,
  dateKey,
  events,
  lang,
  onNewEvent,
  onUserEventClick,
  onClose,
}: DayOverviewProps): ReactElement | null {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = "day-overview-title";
  const dateLabel = useMemo(() => formatOverviewDate(dateKey, lang), [dateKey, lang]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      if (!el.open) el.showModal();
    } else if (el.open) {
      el.close();
    }
  }, [open]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handler = () => onClose();
    el.addEventListener("cancel", handler);
    return () => el.removeEventListener("cancel", handler);
  }, [onClose]);

  const handleBackdropClick = useCallback(
    (e: MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) onClose();
    },
    [onClose],
  );

  if (!open || !dateKey) return null;

  return (
    <dialog
      ref={dialogRef}
      className="day-overview"
      aria-modal="true"
      aria-labelledby={titleId}
      data-testid="day-overview"
      onClick={handleBackdropClick}
    >
      <div className="day-overview__content">
        <div className="day-overview__header">
          <div>
            <p className="day-overview__eyebrow">{s(STR_DAY_OVERVIEW, "title", lang)}</p>
            <h2 id={titleId} className="day-overview__title">{dateLabel}</h2>
          </div>
          <button
            type="button"
            className="day-overview__close"
            aria-label={s(STR_DAY_OVERVIEW, "close", lang)}
            onClick={onClose}
          >
            x
          </button>
        </div>

        {events.length > 0 ? (
          <div className="day-overview__list">
            {events.map((event, index) => {
              const source = event._source ?? "fixture";
              const userId = event._userId;
              const isUser = source === "user" && Boolean(userId);
              const title = eventTitle(event, lang);
              const note = isUser
                ? s(STR_DAY_OVERVIEW, "editable_note", lang)
                : s(STR_DAY_OVERVIEW, "sample_note", lang);
              return (
                <button
                  key={`${userId ?? title}-${index}`}
                  type="button"
                  className={`day-overview__event ev-${event.c}`}
                  data-source={source}
                  disabled={!isUser}
                  onClick={() => {
                    if (userId) onUserEventClick(userId);
                  }}
                >
                  <span className="day-overview__event-dot" />
                  <span className="day-overview__event-main">
                    <span className="day-overview__event-title">{title}</span>
                    <span className="day-overview__event-sub">
                      {eventMeta(event, lang)}
                      {event._tag ? <span className="day-overview__tag">{event._tag}</span> : null}
                      {source === "fixture" ? (
                        <span className="cal-sample-badge">{s(SAMPLE_BADGE, "label", lang)}</span>
                      ) : null}
                    </span>
                  </span>
                  <span className="day-overview__event-note">{note}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="day-overview__empty">
            {s(STR_DAY_OVERVIEW, "empty", lang)}
          </div>
        )}

        <div className="day-overview__actions">
          <button type="button" className="event-composer__btn" onClick={onClose}>
            {s(STR_DAY_OVERVIEW, "close", lang)}
          </button>
          <button
            type="button"
            className="event-composer__btn event-composer__btn--primary"
            onClick={() => onNewEvent(dateKey)}
          >
            {s(STR_DAY_OVERVIEW, "new_event", lang)}
          </button>
        </div>
      </div>
    </dialog>
  );
}
