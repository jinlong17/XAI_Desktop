/**
 * DashHeader — top of the dashboard module: greeting + bilingual date + Add-widget button.
 *
 * Ported from web design/module-dashboard.jsx:160-169 with two adaptations:
 * - The "百事 / Aki" name placeholder is replaced with the i18n key
 *   `dashboard.hello` (already exists in @repo/plugin-web-tokens i18n bundle).
 * - The button receives an `onAddWidget` callback. In v1 (this row) the
 *   callback is wired in P3 to emit `web:dashboard:add-widget-clicked`.
 */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import { useI18n } from "@repo/plugin-web-tokens";
import { getPrefAutosave, usePrefAutosave } from "@repo/plugin-web-storage";

import { formatDashboardDate, pickGreetingKey } from "./internal/greeting.js";

export interface DashHeaderProps {
  /** Active language. */
  lang: Lang;
  /** Current tick — used for greeting band + date subline. */
  now: Date;
  /** Click handler for the Add-widget button. Wired in P3. */
  onAddWidget?: () => void;
}

/** PlusIcon — minimal inline SVG matching the prototype's <Icon name="plus" size={14}/>. */
function PlusIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12l5 5 9-11" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

const HEADER_NOTE_SUFFIX = "dashboard_header_note";
const HEADER_NOTE_OFFSET_SUFFIX = "dashboard_header_note_x";
const HEADER_NOTE_MAX_LENGTH = 120;
const HEADER_NOTE_FALLBACK_RANGE = 320;

const HEADER_NOTE_STR = {
  placeholder: { en: "Add a focus note, reminder, or short message", zh: "添加一句今日重点、提醒或短句" },
  edit: { en: "Edit dashboard note", zh: "编辑工作台备注" },
  save: { en: "Save dashboard note", zh: "保存工作台备注" },
  clear: { en: "Clear dashboard note", zh: "清空工作台备注" },
} as const;

function normalizeHeaderNote(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, HEADER_NOTE_MAX_LENGTH);
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeHeaderNoteOffset(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.round(clampNumber(value, -HEADER_NOTE_FALLBACK_RANGE, HEADER_NOTE_FALLBACK_RANGE));
}

function readInitialHeaderNote(): string {
  return getPrefAutosave<string>(HEADER_NOTE_SUFFIX, {
    codec: "string",
    defaultValue: "",
  }) ?? "";
}

function readInitialHeaderNoteOffset(): number {
  return normalizeHeaderNoteOffset(
    getPrefAutosave<number>(HEADER_NOTE_OFFSET_SUFFIX, {
      codec: "json",
      defaultValue: 0,
    }),
  );
}

export function DashHeader({ lang, now, onAddWidget }: DashHeaderProps) {
  const { s } = useI18n(lang);
  const greetingKey = pickGreetingKey(now);
  const greeting = s(greetingKey);
  const hello = s("dashboard.hello");
  const dateStr = formatDashboardDate(now, lang);
  const addWidget = s("dashboard.add_widget");
  const ariaLabel = s("dashboard.add_widget_aria");
  const inputRef = useRef<HTMLInputElement>(null);
  const laneRef = useRef<HTMLDivElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startOffset: number;
    moved: boolean;
  } | null>(null);
  const suppressNextEditRef = useRef(false);
  const [note, setNote] = useState<string>(() => readInitialHeaderNote());
  const [draft, setDraft] = useState<string>(() => readInitialHeaderNote());
  const [editing, setEditing] = useState<boolean>(false);
  const [noteOffset, setNoteOffset] = useState<number>(() => readInitialHeaderNoteOffset());
  const [movingNote, setMovingNote] = useState<boolean>(false);

  usePrefAutosave(HEADER_NOTE_SUFFIX, note, { codec: "string" });
  usePrefAutosave(HEADER_NOTE_OFFSET_SUFFIX, noteOffset, { codec: "json" });

  const clampNoteOffset = useCallback((value: number): number => {
    const laneEl = laneRef.current;
    const noteEl = noteRef.current;
    if (!laneEl || !noteEl) return normalizeHeaderNoteOffset(value);
    const range = Math.max(0, (laneEl.clientWidth - noteEl.offsetWidth) / 2);
    return Math.round(clampNumber(value, -range, range));
  }, []);

  useEffect(() => {
    if (!editing) return;
    window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  }, [editing]);

  useEffect(() => {
    const onResize = () => {
      setNoteOffset((current) => clampNoteOffset(current));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clampNoteOffset]);

  const beginEdit = useCallback(() => {
    if (suppressNextEditRef.current) {
      suppressNextEditRef.current = false;
      return;
    }
    setDraft(note);
    setEditing(true);
  }, [note]);

  const saveDraft = useCallback(() => {
    const next = normalizeHeaderNote(draft);
    setNote(next);
    setDraft(next);
    setEditing(false);
  }, [draft]);

  const clearNote = useCallback(() => {
    setNote("");
    setDraft("");
    setEditing(false);
  }, []);

  const startNoteMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (editing || event.button !== 0) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest(".dash-note__clear, .dash-note__icon-btn, input")) return;
      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startOffset: noteOffset,
        moved: false,
      };
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    [editing, noteOffset],
  );

  const moveNote = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      const deltaX = event.clientX - drag.startX;
      if (Math.abs(deltaX) > 3) {
        drag.moved = true;
        setMovingNote(true);
        setNoteOffset(clampNoteOffset(drag.startOffset + deltaX));
      }
    },
    [clampNoteOffset],
  );

  const endNoteMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (drag.moved) suppressNextEditRef.current = true;
    dragRef.current = null;
    setMovingNote(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }, []);

  const noteStyle = {
    "--dash-note-x": `${noteOffset}px`,
  } as CSSProperties;

  return (
    <header className="dash-head">
      <div className="dash-head__intro">
        <h1 className="dash-greeting">
          {greeting}, {hello}.
        </h1>
        <div className="dash-date">{dateStr}</div>
      </div>
      <div className="dash-note-lane" ref={laneRef}>
        <div
          ref={noteRef}
          className={`dash-note${editing ? " is-editing" : ""}${note ? " has-note" : ""}${
            movingNote ? " is-moving" : ""
          }`}
          style={noteStyle}
          onPointerDown={startNoteMove}
          onPointerMove={moveNote}
          onPointerUp={endNoteMove}
          onPointerCancel={endNoteMove}
        >
          {editing ? (
            <div className="dash-note__editor">
              <input
                ref={inputRef}
                className="dash-note__input"
                value={draft}
                maxLength={HEADER_NOTE_MAX_LENGTH}
                aria-label={HEADER_NOTE_STR.placeholder[lang]}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    saveDraft();
                  }
                  if (event.key === "Escape") {
                    setDraft(note);
                    setEditing(false);
                  }
                }}
                onBlur={saveDraft}
              />
              <button
                type="button"
                className="dash-note__icon-btn"
                aria-label={HEADER_NOTE_STR.save[lang]}
                onMouseDown={(event) => event.preventDefault()}
                onClick={saveDraft}
              >
                <CheckIcon />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="dash-note__display"
              aria-label={HEADER_NOTE_STR.edit[lang]}
              onClick={beginEdit}
            >
              <span className={note ? "dash-note__text" : "dash-note__placeholder"}>
                {note || HEADER_NOTE_STR.placeholder[lang]}
              </span>
              <EditIcon />
            </button>
          )}
          {!editing && note && (
            <button
              type="button"
              className="dash-note__clear"
              aria-label={HEADER_NOTE_STR.clear[lang]}
              onClick={clearNote}
            >
              <ClearIcon />
            </button>
          )}
        </div>
      </div>
      <button
        type="button"
        className="btn ghost dash-add"
        aria-label={ariaLabel}
        onClick={onAddWidget}
      >
        <PlusIcon />
        <span>{addWidget}</span>
      </button>
    </header>
  );
}
