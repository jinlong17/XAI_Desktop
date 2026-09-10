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
import { accountScope, usePrefAutosaveAsync } from "@repo/plugin-web-storage";
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
const HEADER_NOTE_OFFSET_OPTIONS = {
  codec: "json" as const,
  defaultValue: 0,
  validate: (value: unknown): value is number => typeof value === "number" && Number.isFinite(value),
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

type OffsetGesture = {
  readonly pointerId: number;
  readonly startX: number;
  readonly startOffset: number;
  raw: string | null;
  moved: boolean;
};

type OffsetOperation = {
  readonly value: number;
  readonly raw: string | null;
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
  const dragRef = useRef<OffsetGesture | null>(null);
  const suppressNextEditRef = useRef(false);
  const account = useSyncExternalStore(accountScope.subscribe, accountScope.capture, accountScope.capture);
  const noteSave = usePrefAutosaveAsync<string>(HEADER_NOTE_SUFFIX, HEADER_NOTE_OPTIONS);
  const [committedNote, setCommittedNote] = useState(noteSave.value);
  const [draft, setDraft] = useState(noteSave.value);
  const [editing, setEditing] = useState<boolean>(false);
  const offsetSave = usePrefAutosaveAsync<number>(HEADER_NOTE_OFFSET_SUFFIX, HEADER_NOTE_OFFSET_OPTIONS);
  const [noteOffset, setNoteOffset] = useState<number>(() => normalizeHeaderNoteOffset(offsetSave.value));
  const noteOffsetRef = useRef(noteOffset);
  const offsetDesiredRef = useRef(offsetSave.value);
  const offsetOperationRef = useRef<OffsetOperation | null>(null);
  const ignoredOffsetOperationsRef = useRef(new Set<OffsetOperation>());
  const failedOffsetOperationRef = useRef<OffsetOperation | null>(null);
  const [movingNote, setMovingNote] = useState<boolean>(false);
  const sessionRef = useRef<NoteSession | null>(null);
  const operationRef = useRef<NoteOperation | null>(null);
  const failedOperationRef = useRef<NoteOperation | null>(null);
  const draftRef = useRef(draft);
  const nextSessionId = useRef(0);
  const nextOperationId = useRef(0);
  const [noteIssue, setNoteIssue] = useState<string | null>(null);
  const [offsetIssue, setOffsetIssue] = useState<string | null>(null);
  const [frozenSession, setFrozenSession] = useState(false);
  const [exportFailed, setExportFailed] = useState(false);
  const notePending = operationRef.current !== null && noteIssue === null;
  const noteUnresolved = notePending || noteIssue !== null || frozenSession;
  const offsetPending = offsetOperationRef.current !== null && offsetIssue === null;
  const offsetGestureDirty = dragRef.current?.moved === true;
  const offsetSourceIssue = offsetSave.meta.source === "invalid" || offsetSave.meta.source === "unavailable"
    ? offsetSave.meta.source
    : null;
  const offsetHookIssue = offsetSave.meta.status === "error" ? (offsetSave.meta.error ?? "storage") : null;
  const offsetUnresolved = offsetPending || offsetIssue !== null || offsetGestureDirty || offsetSourceIssue !== null || offsetHookIssue !== null;
  const unsaved = noteUnresolved || offsetUnresolved;
  // A frozen A session may retain recovery state, but it must never render A's
  // committed text in B's active header.
  const displayNote = frozenSession ? noteSave.value : committedNote;
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

  const setVisibleOffset = useCallback((value: number) => {
    noteOffsetRef.current = value;
    setNoteOffset(value);
  }, []);

  useEffect(() => {
    if (dragRef.current || offsetOperationRef.current || offsetIssue) return;
    offsetDesiredRef.current = offsetSave.value;
    setVisibleOffset(clampNoteOffset(offsetSave.value));
  }, [clampNoteOffset, offsetIssue, offsetSave.value, setVisibleOffset]);

  useEffect(() => {
    if (!editing) return;
    window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  }, [editing]);

  useEffect(() => {
    const onResize = () => {
      setVisibleOffset(clampNoteOffset(offsetDesiredRef.current));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clampNoteOffset, setVisibleOffset]);

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

  const settleOffset = useCallback((operation: OffsetOperation, result: PrefMutationResult<number>) => {
    if (ignoredOffsetOperationsRef.current.delete(operation)) return;
    if (!result.ok) {
      if (offsetOperationRef.current !== operation) return;
      offsetOperationRef.current = null;
      failedOffsetOperationRef.current = operation;
      setOffsetIssue(result.reason);
      return;
    }
    const gesture = dragRef.current;
    // A completed predecessor may update the baseline captured by a later drag
    // only when that drag still names the same raw value. This preserves a real
    // external conflict while allowing the hook's own verified 40 -> 70 chain.
    if (gesture?.raw === operation.raw) gesture.raw = result.raw;
    if (noteOffsetRef.current === operation.value) {
      offsetDesiredRef.current = result.value;
      setVisibleOffset(clampNoteOffset(result.value));
    }
    if (offsetOperationRef.current !== operation) return;
    offsetOperationRef.current = null;
    failedOffsetOperationRef.current = null;
    setOffsetIssue(null);
  }, [clampNoteOffset, setVisibleOffset]);

  const submitOffset = useCallback((value: number, raw: string | null, retry = false) => {
    const active = offsetOperationRef.current;
    if (active && active.value === value) return;
    try {
      const current = localStorage.getItem("xai_pref_dashboard_header_note_x");
      if (offsetSave.meta.source === "unavailable" || (!retry && (current !== raw || offsetSave.meta.raw !== raw))) throw new Error("conflict");
    } catch {
      setOffsetIssue("conflict");
      return;
    }
    const operation = { value, raw };
    offsetOperationRef.current = operation;
    if (!retry) failedOffsetOperationRef.current = null;
    setOffsetIssue(null);
    const attempt = retry ? offsetSave.retry() : offsetSave.edit(value);
    void attempt.then((result) => settleOffset(operation, result), () => settleOffset(operation, { ok: false, reason: "storage" }));
  }, [offsetSave, settleOffset]);

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
    const failedOffset = failedOffsetOperationRef.current;
    if (offsetIssue && failedOffset) {
      const latest = noteOffsetRef.current;
      submitOffset(latest, failedOffset.raw, latest === failedOffset.value);
    }
  };

  const reloadOffsetSource = useCallback(() => {
    const active = offsetOperationRef.current;
    if (active) {
      ignoredOffsetOperationsRef.current.add(active);
      offsetOperationRef.current = null;
    }
    offsetSave.meta.reload();
  }, [offsetSave.meta]);

  const startNoteMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (editing || event.button !== 0) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest(".dash-note__clear, .dash-note__icon-btn, input")) return;
      let raw: string | null;
      try {
        raw = localStorage.getItem("xai_pref_dashboard_header_note_x");
        if (offsetSave.meta.source === "unavailable" || offsetSave.meta.raw !== raw) throw new Error("conflict");
      } catch {
        setOffsetIssue("conflict");
        return;
      }
      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startOffset: noteOffsetRef.current,
        raw,
        moved: false,
      };
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    [editing, offsetSave.meta.raw, offsetSave.meta.source],
  );

  const moveNote = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      const deltaX = event.clientX - drag.startX;
      if (Math.abs(deltaX) > 3) {
        drag.moved = true;
        setMovingNote(true);
        const next = clampNoteOffset(drag.startOffset + deltaX);
        offsetDesiredRef.current = next;
        setVisibleOffset(next);
      }
    },
    [clampNoteOffset, setVisibleOffset],
  );

  const endNoteMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (drag.moved) suppressNextEditRef.current = true;
    dragRef.current = null;
    setMovingNote(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    if (drag.moved) submitOffset(noteOffsetRef.current, drag.raw);
  }, [submitOffset]);

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
        {(noteIssue === "conflict" || noteIssue === "account-changed" || frozenSession || offsetIssue === "conflict") && <p>{lang === "zh" ? "账户或已保存内容已变化，无法覆盖。请导出草稿后重新打开。" : "The account or saved content changed. Export your draft and reopen to avoid overwriting newer data."}</p>}
        <button type="button" onMouseDown={event => event.preventDefault()} onClick={retrySave}>{lang === "zh" ? "重试备注保存" : "Retry note save"}</button>
        {offsetSourceIssue && <button type="button" onMouseDown={event => event.preventDefault()} onClick={reloadOffsetSource}>{lang === "zh" ? "重新读取备注位置" : "Reload note position"}</button>}
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
