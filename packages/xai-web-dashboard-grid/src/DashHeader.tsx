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
  useSyncExternalStore,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import { useI18n } from "@repo/plugin-web-tokens";
import { accountScope, getPrefAutosave, usePrefAutosave, usePrefAutosaveAsync } from "@repo/plugin-web-storage";
import type { AccountScope, PrefMutationResult } from "@repo/plugin-web-storage";

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
const HEADER_NOTE_OPTIONS = {
  codec: "string" as const,
  defaultValue: "",
  validate: (value: unknown): value is string => typeof value === "string",
};

const HEADER_NOTE_STR = {
  placeholder: { en: "Add a focus note, reminder, or short message", zh: "添加一句今日重点、提醒或短句" },
  edit: { en: "Edit dashboard note", zh: "编辑工作台备注" },
  save: { en: "Save dashboard note", zh: "保存工作台备注" },
  clear: { en: "Clear dashboard note", zh: "清空工作台备注" },
  saving: { en: "Saving dashboard note…", zh: "正在保存工作台备注…" },
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

function readInitialHeaderNoteOffset(): number {
  return normalizeHeaderNoteOffset(
    getPrefAutosave<number>(HEADER_NOTE_OFFSET_SUFFIX, {
      codec: "json",
      defaultValue: 0,
    }),
  );
}

type NoteSession = {
  readonly id: number;
  readonly scope: AccountScope;
  readonly physicalKey: string;
  readonly raw: string | null;
};

type NoteOperation = {
  readonly session: NoteSession;
  readonly sequence: number;
  readonly text: string;
  readonly retry: boolean;
};

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
  const account = useSyncExternalStore(accountScope.subscribe, accountScope.capture, accountScope.capture);
  const noteSave = usePrefAutosaveAsync<string>(HEADER_NOTE_SUFFIX, HEADER_NOTE_OPTIONS);
  const [committedNote, setCommittedNote] = useState(noteSave.value);
  const [draft, setDraft] = useState(noteSave.value);
  const [editing, setEditing] = useState<boolean>(false);
  const [noteOffset, setNoteOffset] = useState<number>(() => readInitialHeaderNoteOffset());
  const [movingNote, setMovingNote] = useState<boolean>(false);

  const scope = useRef(accountScope.capture()).current;
  const readRaw = useCallback((suffix: string) => {
    accountScope.assertCurrent(scope);
    return localStorage.getItem(accountScope.physicalKey(`xai_pref_${suffix}`, scope));
  }, [scope]);
  const [baseline] = useState(() => {
    try { return { note: readRaw(HEADER_NOTE_SUFFIX), offset: readRaw(HEADER_NOTE_OFFSET_SUFFIX) }; }
    catch { return { note: null, offset: null }; }
  });
  const sessionRef = useRef<NoteSession | null>(null);
  const operationRef = useRef<NoteOperation | null>(null);
  const failedOperationRef = useRef<NoteOperation | null>(null);
  const draftRef = useRef(draft);
  const nextSessionId = useRef(0);
  const nextOperationId = useRef(0);
  const [noteIssue, setNoteIssue] = useState<string | null>(null);
  const [offsetConflict, setOffsetConflict] = useState(false);
  const [frozenSession, setFrozenSession] = useState(false);
  const [exportFailed, setExportFailed] = useState(false);
  const offsetSave = usePrefAutosave(HEADER_NOTE_OFFSET_SUFFIX, noteOffset, { codec: "json" });
  const notePending = operationRef.current !== null && noteIssue === null;
  const noteUnresolved = notePending || noteIssue !== null || frozenSession;
  const unsaved = noteUnresolved || offsetConflict || offsetSave.saved === false;
  // A frozen A session may retain recovery state, but it must never render A's
  // committed text in B's active header.
  const displayNote = frozenSession ? noteSave.value : committedNote;
  const canWriteOffset = useCallback((suffix: string, expected: string | null) => {
    try { if (readRaw(suffix) === expected) return true; } catch { /* Scope/read failure retains draft. */ }
    setOffsetConflict(true);
    return false;
  }, [readRaw]);
  useEffect(() => {
    try {
      if (offsetSave.saved && readRaw(HEADER_NOTE_OFFSET_SUFFIX) === JSON.stringify(noteOffset)) {
        baseline.offset = JSON.stringify(noteOffset);
      }
    } catch { /* Old component cannot accept another account's persistence. */ }
  }, [baseline, noteOffset, offsetSave.saved, readRaw]);
  useEffect(() => {
    if (!editing && (!sessionRef.current || frozenSession) && noteSave.meta.status !== "pending") setCommittedNote(noteSave.value);
  }, [editing, frozenSession, noteSave.meta.status, noteSave.value]);
  useEffect(() => {
    const session = sessionRef.current;
    if (!session || session.scope === account) return;
    operationRef.current = null;
    failedOperationRef.current = null;
    setFrozenSession(true);
    setNoteIssue("account-changed");
    setCommittedNote(noteSave.value);
    setEditing(false);
  }, [account, noteSave.value]);
  useEffect(() => {
    if (!unsaved && !(editing && draft !== committedNote)) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [unsaved, editing, draft, committedNote]);

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
      if (canWriteOffset(HEADER_NOTE_OFFSET_SUFFIX, baseline.offset)) setNoteOffset((current) => clampNoteOffset(current));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [baseline, canWriteOffset, clampNoteOffset]);

  const setDraftText = useCallback((value: string) => {
    draftRef.current = value;
    setDraft(value);
  }, []);

  const openSession = useCallback((): NoteSession | null => {
    try {
      const captured = accountScope.capture();
      const physicalKey = accountScope.physicalKey("xai_pref_dashboard_header_note", captured);
      const raw = localStorage.getItem(physicalKey);
      if (noteSave.meta.source === "unavailable" || noteSave.meta.raw !== raw) throw new Error("conflict");
      const session = { id: ++nextSessionId.current, scope: captured, physicalKey, raw };
      sessionRef.current = session;
      setFrozenSession(false);
      setNoteIssue(null);
      return session;
    } catch {
      setNoteIssue("conflict");
      return null;
    }
  }, [noteSave.meta.raw, noteSave.meta.source]);

  const beginEdit = useCallback(() => {
    if (suppressNextEditRef.current) {
      suppressNextEditRef.current = false;
      return;
    }
    if (notePending || frozenSession) return;
    if (!openSession()) return;
    setDraftText(committedNote);
    setEditing(true);
  }, [committedNote, frozenSession, notePending, openSession, setDraftText]);

  const settleOperation = useCallback((operation: NoteOperation, result: PrefMutationResult<string>) => {
    if (operationRef.current !== operation) return;
    if (!result.ok) {
      operationRef.current = null;
      failedOperationRef.current = operation;
      setNoteIssue(result.reason);
      return;
    }
    operationRef.current = null;
    failedOperationRef.current = null;
    setCommittedNote(result.value);
    const current = sessionRef.current;
    if (current === operation.session && draftRef.current === operation.text) {
      sessionRef.current = null;
      setNoteIssue(null);
      setEditing(false);
    } else if (current === operation.session) {
      // Keep a newer local draft open, but make its next explicit save compare
      // against the physical result of the operation that just completed.
      sessionRef.current = { ...current, raw: result.raw };
    }
  }, []);

  const submit = useCallback((text: string, retry = false) => {
    const session = sessionRef.current;
    if (!session || frozenSession) { setNoteIssue("account-changed"); return; }
    const active = operationRef.current;
    if (active && active.session === session && active.text === text) return;
    try {
      accountScope.assertCurrent(session.scope);
      const raw = localStorage.getItem(session.physicalKey);
      // An unchanged retry is the one case where a physical raw mismatch may be
      // the engine's own uncertain write. Its opaque token, not this caller,
      // decides whether that exact write can be reconciled.
      if (noteSave.meta.source === "unavailable" || (!retry && (raw !== session.raw || noteSave.meta.raw !== session.raw))) throw new Error("conflict");
    } catch {
      setNoteIssue("conflict");
      return;
    }
    const operation = { session, sequence: ++nextOperationId.current, text, retry };
    operationRef.current = operation;
    if (!retry) failedOperationRef.current = null;
    setNoteIssue(null);
    // The successful preflight is intentionally adjacent to enqueueing: the engine repeats
    // the raw check inside its physical-key lock for the remaining race window.
    const attempt = retry ? noteSave.retry() : noteSave.edit(text);
    void attempt.then((result) => settleOperation(operation, result), () => settleOperation(operation, { ok: false, reason: "storage" }));
  }, [frozenSession, noteSave, settleOperation]);

  const saveDraft = useCallback(() => {
    const next = normalizeHeaderNote(draftRef.current);
    setDraftText(next);
    submit(next);
  }, [setDraftText, submit]);

  const clearNote = useCallback(() => {
    if (notePending || frozenSession) return;
    if (!openSession()) return;
    setDraftText("");
    setEditing(true);
    submit("");
  }, [frozenSession, notePending, openSession, setDraftText, submit]);

  const retrySave = () => {
    const failed = failedOperationRef.current;
    const session = sessionRef.current;
    if (noteIssue && session && failed && !frozenSession) {
      if (noteIssue !== "conflict" && noteIssue !== "account-changed") {
        const next = normalizeHeaderNote(draftRef.current);
        setDraftText(next);
        submit(next, next === failed.text);
      }
    }
    if (offsetSave.saved === false && canWriteOffset(HEADER_NOTE_OFFSET_SUFFIX, baseline.offset)) {
      if (offsetSave.retry()) baseline.offset = JSON.stringify(noteOffset);
    }
  };

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
        if (canWriteOffset(HEADER_NOTE_OFFSET_SUFFIX, baseline.offset)) setNoteOffset(clampNoteOffset(drag.startOffset + deltaX));
      }
    },
    [baseline, canWriteOffset, clampNoteOffset],
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
          className={`dash-note${editing ? " is-editing" : ""}${displayNote ? " has-note" : ""}${
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
                onChange={(event) => setDraftText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    saveDraft();
                  }
                  if (event.key === "Escape" && !noteUnresolved) {
                    sessionRef.current = null;
                    setDraftText(committedNote);
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
              {notePending && <span className="dash-note__saving" role="status">{HEADER_NOTE_STR.saving[lang]}</span>}
            </div>
          ) : (
            <button
              type="button"
              className="dash-note__display"
              aria-label={HEADER_NOTE_STR.edit[lang]}
              onClick={beginEdit}
            >
              <span className={displayNote ? "dash-note__text" : "dash-note__placeholder"}>
                {displayNote || HEADER_NOTE_STR.placeholder[lang]}
              </span>
              <EditIcon />
            </button>
          )}
          {!editing && displayNote && (
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
      {unsaved && <section role="alert" className="dash-note-recovery">
        <p>{lang === "zh" ? "备注或位置未保存。草稿仅保留在此页面；离开前请重试或导出。" : "Note or position was not saved. Drafts stay on this page only; retry or export before leaving."}</p>
        {(noteIssue === "conflict" || noteIssue === "account-changed" || frozenSession || offsetConflict) && <p>{lang === "zh" ? "账户或已保存内容已变化，无法覆盖。请导出草稿后重新打开。" : "The account or saved content changed. Export your draft and reopen to avoid overwriting newer data."}</p>}
        <button type="button" onMouseDown={event => event.preventDefault()} onClick={retrySave}>{lang === "zh" ? "重试备注保存" : "Retry note save"}</button>
        <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => {
          try {
            const session = sessionRef.current;
            if (session) {
              if (frozenSession || session.scope !== accountScope.capture()) throw new Error("account-changed");
              accountScope.assertCurrent(session.scope);
            } else {
              // A device-only offset recovery has no note session to validate;
              // validate the active account scope before exporting its committed note.
              accountScope.physicalKey("xai_pref_dashboard_header_note", accountScope.capture());
            }
            const blob = new Blob([JSON.stringify({ version: 1, kind: "dashboard-note-draft", note: editing ? draftRef.current : displayNote, noteOffset }, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob); const anchor = document.createElement("a");
            anchor.href = url; anchor.download = "dashboard-note-draft.json";
            document.body.appendChild(anchor); anchor.click(); anchor.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000); setExportFailed(false);
          } catch { setExportFailed(true); }
        }}>{lang === "zh" ? "导出备注草稿" : "Export note draft"}</button>
        {exportFailed && <p>{lang === "zh" ? "导出失败，请重试。" : "Export failed. Please retry."}</p>}
      </section>}
    </header>
  );
}
