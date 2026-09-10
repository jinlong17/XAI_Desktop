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
import type { DashboardHeaderDepartureGuardRegistration } from "./types.js";

import { formatDashboardDate, pickGreetingKey } from "./internal/greeting.js";

export interface DashHeaderProps {
  /** Active language. */
  lang: Lang;
  /** Current tick — used for greeting band + date subline. */
  now: Date;
  /** Click handler for the Add-widget button. Wired in P3. */
  onAddWidget?: () => void;
  /** Optional app-owned host departure registration. */
  registerDepartureGuard?: DashboardHeaderDepartureGuardRegistration;
  /** True while the app host holds a guarded departure intent. */
  isDeparturePending?: () => boolean;
  /** App-owned recognition for a pointer target that will navigate away. */
  isDepartureTarget?: (target: EventTarget | null) => boolean;
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
  readonly revision: number;
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
  readonly id: number;
  readonly value: number;
  readonly raw: string | null;
  /** Only a failed hook operation owns an opaque hook retry token. */
  readonly retryable: boolean;
};

type BlurSaveSnapshot = {
  readonly session: NoteSession;
  readonly revision: number;
};

type NavigationPointer = {
  readonly pointerId: number;
  readonly target: EventTarget | null;
};

export function DashHeader({ lang, now, onAddWidget, registerDepartureGuard, isDeparturePending, isDepartureTarget }: DashHeaderProps) {
  const { s } = useI18n(lang);
  const greetingKey = pickGreetingKey(now);
  const greeting = s(greetingKey);
  const hello = s("dashboard.hello");
  const dateStr = formatDashboardDate(now, lang);
  const addWidget = s("dashboard.add_widget");
  const ariaLabel = s("dashboard.add_widget_aria");
  const inputRef = useRef<HTMLInputElement>(null);
  const isDeparturePendingRef = useRef(isDeparturePending);
  isDeparturePendingRef.current = isDeparturePending;
  const isDepartureTargetRef = useRef(isDepartureTarget);
  isDepartureTargetRef.current = isDepartureTarget;
  const navigationPointerRef = useRef<NavigationPointer | null>(null);
  const deferredNavigationBlurRef = useRef<BlurSaveSnapshot | null>(null);
  const blurTimerRef = useRef<number | null>(null);
  const laneRef = useRef<HTMLDivElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<OffsetGesture | null>(null);
  const suppressNextEditRef = useRef(false);
  const account = useSyncExternalStore(accountScope.subscribe, accountScope.capture, accountScope.capture);
  const accountRef = useRef(account);
  accountRef.current = account;
  const noteSave = usePrefAutosaveAsync<string>(HEADER_NOTE_SUFFIX, HEADER_NOTE_OPTIONS);
  const noteSaveRef = useRef(noteSave);
  noteSaveRef.current = noteSave;
  const [committedNote, setCommittedNote] = useState(noteSave.value);
  const [draft, setDraft] = useState(noteSave.value);
  const [editing, setEditing] = useState<boolean>(false);
  const offsetSave = usePrefAutosaveAsync<number>(HEADER_NOTE_OFFSET_SUFFIX, HEADER_NOTE_OFFSET_OPTIONS);
  const offsetSaveRef = useRef(offsetSave);
  offsetSaveRef.current = offsetSave;
  const [noteOffset, setNoteOffset] = useState<number>(() => normalizeHeaderNoteOffset(offsetSave.value));
  const noteOffsetRef = useRef(noteOffset);
  const offsetDesiredRef = useRef(offsetSave.value);
  const offsetOperationRef = useRef<OffsetOperation | null>(null);
  const ignoredOffsetOperationsRef = useRef(new Set<OffsetOperation>());
  const failedOffsetOperationRef = useRef<OffsetOperation | null>(null);
  const nextOffsetOperationId = useRef(0);
  const [movingNote, setMovingNote] = useState<boolean>(false);
  const sessionRef = useRef<NoteSession | null>(null);
  const operationRef = useRef<NoteOperation | null>(null);
  const failedOperationRef = useRef<NoteOperation | null>(null);
  const draftRef = useRef(draft);
  const draftRevisionRef = useRef(0);
  const noteIntentRevisionRef = useRef<number | null>(null);
  const nextSessionId = useRef(0);
  const nextOperationId = useRef(0);
  const [draftVersion, setDraftVersion] = useState(0);
  const disposedRef = useRef(false);
  const guardTokenRef = useRef<object>({});
  const [noteIssue, setNoteIssue] = useState<string | null>(null);
  const [offsetIssue, setOffsetIssue] = useState<string | null>(null);
  const [offsetSourceConflict, setOffsetSourceConflict] = useState(false);
  const [frozenSession, setFrozenSession] = useState(false);
  const [exportFailed, setExportFailed] = useState(false);
  const editingRef = useRef(editing);
  const committedNoteRef = useRef(committedNote);
  const frozenSessionRef = useRef(frozenSession);
  editingRef.current = editing;
  committedNoteRef.current = committedNote;
  frozenSessionRef.current = frozenSession;
  const notePending = operationRef.current !== null && noteIssue === null;
  const noteSourceIssue = noteSave.meta.source === "invalid" || noteSave.meta.source === "unavailable"
    ? noteSave.meta.source
    : null;
  const noteActualDraft = !frozenSession && (
    (editing && noteIntentRevisionRef.current !== null) || operationRef.current !== null || failedOperationRef.current !== null
  );
  const offsetPending = offsetOperationRef.current !== null && offsetIssue === null;
  const offsetGestureDirty = dragRef.current?.moved === true;
  const offsetSourceIssue = offsetSave.meta.source === "invalid" || offsetSave.meta.source === "unavailable"
    ? offsetSave.meta.source
    : null;
  const offsetHookIssue = offsetSave.meta.status === "error" ? (offsetSave.meta.error ?? "storage") : null;
  const offsetActualDraft = offsetPending || offsetIssue !== null || offsetGestureDirty || failedOffsetOperationRef.current !== null;
  const hasCurrentDraft = noteActualDraft || offsetActualDraft;
  const hasSourceOnlyIssue = noteSourceIssue !== null || offsetSourceIssue !== null || offsetHookIssue !== null || offsetSourceConflict;
  const hasRecoveryNotice = hasCurrentDraft || frozenSession || hasSourceOnlyIssue;
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
    guardTokenRef.current = {};
    setDraftVersion(version => version + 1);
  }, [account, noteSave.value]);
  useEffect(() => {
    // Every owner epoch gets a distinct decision capability. This makes an
    // old callback refuse itself even when a host happens to retain it.
    guardTokenRef.current = {};
    setDraftVersion(version => version + 1);
  }, [account]);
  useEffect(() => {
    if (!hasCurrentDraft && !frozenSession) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasCurrentDraft, frozenSession]);
  useEffect(() => {
    disposedRef.current = false;
    return () => { disposedRef.current = true; guardTokenRef.current = {}; };
  }, []);
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

  const setDraftText = useCallback((value: string, actualIntent = true) => {
    draftRef.current = value;
    setDraft(value);
    draftRevisionRef.current += 1;
    noteIntentRevisionRef.current = actualIntent ? draftRevisionRef.current : null;
    setDraftVersion(version => version + 1);
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
      setDraftVersion(version => version + 1);
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
    setDraftText(committedNote, false);
    setEditing(true);
  }, [committedNote, frozenSession, notePending, openSession, setDraftText]);

  const settleOperation = useCallback((operation: NoteOperation, result: PrefMutationResult<string>) => {
    if (operationRef.current !== operation) return;
    if (!result.ok) {
      operationRef.current = null;
      failedOperationRef.current = operation;
      setNoteIssue(result.reason);
      setDraftVersion(version => version + 1);
      return;
    }
    operationRef.current = null;
    failedOperationRef.current = null;
    setCommittedNote(result.value);
    const current = sessionRef.current;
    if (current === operation.session && draftRevisionRef.current === operation.revision) {
      sessionRef.current = null;
      noteIntentRevisionRef.current = null;
      setNoteIssue(null);
      setEditing(false);
    } else if (current === operation.session) {
      // Keep a newer local draft open, but make its next explicit save compare
      // against the physical result of the operation that just completed.
      sessionRef.current = { ...current, raw: result.raw };
    }
    setDraftVersion(version => version + 1);
  }, []);

  const submit = useCallback((text: string, retry = false) => {
    const session = sessionRef.current;
    if (!session || frozenSession) { setNoteIssue("account-changed"); return; }
    const active = operationRef.current;
    if (active && active.session === session && active.revision === draftRevisionRef.current) return;
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
    const operation = { session, sequence: ++nextOperationId.current, revision: draftRevisionRef.current, text, retry };
    operationRef.current = operation;
    if (!retry) failedOperationRef.current = null;
    setNoteIssue(null);
    setDraftVersion(version => version + 1);
    // The successful preflight is intentionally adjacent to enqueueing: the engine repeats
    // the raw check inside its physical-key lock for the remaining race window.
    const attempt = retry ? noteSave.retry() : noteSave.edit(text);
    void attempt.then((result) => settleOperation(operation, result), () => settleOperation(operation, { ok: false, reason: "storage" }));
  }, [frozenSession, noteSave, settleOperation]);

  const saveDraft = useCallback(() => {
    const next = normalizeHeaderNote(draftRef.current);
    if (next !== draftRef.current) setDraftText(next);
    submit(next);
  }, [setDraftText, submit]);

  // The async preference result object changes as its status changes. Keep the
  // global blur listeners stable and resolve the current save callback only at
  // the point an ordinary blur is allowed to persist.
  const saveDraftRef = useRef(saveDraft);
  saveDraftRef.current = saveDraft;

  const canSaveBlurSnapshot = useCallback((snapshot: BlurSaveSnapshot) => {
    if (disposedRef.current || isDeparturePendingRef.current?.()) return false;
    if (sessionRef.current !== snapshot.session || draftRevisionRef.current !== snapshot.revision || frozenSessionRef.current) return false;
    try {
      accountScope.assertCurrent(snapshot.session.scope);
      return true;
    } catch {
      return false;
    }
  }, []);

  const scheduleBlurSave = useCallback((snapshot: BlurSaveSnapshot) => {
    if (blurTimerRef.current !== null) window.clearTimeout(blurTimerRef.current);
    blurTimerRef.current = window.setTimeout(() => {
      blurTimerRef.current = null;
      if (canSaveBlurSnapshot(snapshot)) saveDraftRef.current();
    }, 0);
  }, [canSaveBlurSnapshot]);
  const scheduleBlurSaveRef = useRef(scheduleBlurSave);
  scheduleBlurSaveRef.current = scheduleBlurSave;

  const saveAfterBlur = useCallback(() => {
    // Pointerdown and the coordinator's dialog focus both blur the editor
    // before their click/navigation turn completes. Let that turn reserve its
    // first departure intent before deciding whether this was an ordinary blur.
    const session = sessionRef.current;
    if (!session) return;
    const snapshot = { session, revision: draftRevisionRef.current };
    if (navigationPointerRef.current !== null) {
      deferredNavigationBlurRef.current = snapshot;
      return;
    }
    scheduleBlurSave(snapshot);
  }, [scheduleBlurSave]);

  useEffect(() => {
    const settleNavigationPointer = (event: PointerEvent) => {
      const candidate = navigationPointerRef.current;
      if (!candidate || candidate.pointerId !== event.pointerId) return;
      navigationPointerRef.current = null;
      const deferred = deferredNavigationBlurRef.current;
      deferredNavigationBlurRef.current = null;
      if (deferred) scheduleBlurSaveRef.current(deferred);
    };
    const settleWindowBlur = () => {
      navigationPointerRef.current = null;
      const deferred = deferredNavigationBlurRef.current;
      deferredNavigationBlurRef.current = null;
      if (deferred) scheduleBlurSaveRef.current(deferred);
    };
    const capturePointerDown = (event: PointerEvent) => {
      navigationPointerRef.current = isDepartureTargetRef.current?.(event.target)
        ? { pointerId: event.pointerId, target: event.target }
        : null;
    };
    document.addEventListener("pointerdown", capturePointerDown, true);
    window.addEventListener("pointerup", settleNavigationPointer, true);
    window.addEventListener("pointercancel", settleNavigationPointer, true);
    window.addEventListener("blur", settleWindowBlur);
    return () => {
      document.removeEventListener("pointerdown", capturePointerDown, true);
      window.removeEventListener("pointerup", settleNavigationPointer, true);
      window.removeEventListener("pointercancel", settleNavigationPointer, true);
      window.removeEventListener("blur", settleWindowBlur);
      navigationPointerRef.current = null;
      deferredNavigationBlurRef.current = null;
      if (blurTimerRef.current !== null) window.clearTimeout(blurTimerRef.current);
    };
  }, []);

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
      setDraftVersion(version => version + 1);
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
    // A predecessor may settle after a newer caller-preflight failure. It has
    // committed its own value, but must not clear the newer recovery identity
    // or let the source effect snap the visible desired coordinate backwards.
    if (failedOffsetOperationRef.current === null || failedOffsetOperationRef.current === operation) {
      failedOffsetOperationRef.current = null;
      setOffsetIssue(null);
      setOffsetSourceConflict(false);
    }
    setDraftVersion(version => version + 1);
  }, [clampNoteOffset, setVisibleOffset]);

  const submitOffset = useCallback((value: number, raw: string | null, retry = false) => {
    const operation = { id: ++nextOffsetOperationId.current, value, raw, retryable: false };
    try {
      const current = localStorage.getItem("xai_pref_dashboard_header_note_x");
      if (offsetSave.meta.source === "unavailable" || (!retry && (current !== raw || offsetSave.meta.raw !== raw))) throw new Error("conflict");
    } catch {
      // A moved gesture has a real desired coordinate even if the caller-side
      // raw preflight rejects it before the async hook can enqueue. Retain that
      // operation so guard/export/discard have the same truth as the visible
      // coordinate, rather than treating it as a source-only problem.
      failedOffsetOperationRef.current = operation;
      setOffsetIssue("conflict");
      setDraftVersion(version => version + 1);
      return;
    }
    const hookOperation = { ...operation, retryable: !retry || offsetOperationRef.current === null };
    offsetOperationRef.current = hookOperation;
    if (!retry) failedOffsetOperationRef.current = null;
    setOffsetIssue(null);
    setOffsetSourceConflict(false);
    setDraftVersion(version => version + 1);
    const attempt = retry ? offsetSave.retry() : offsetSave.edit(value);
    void attempt.then((result) => settleOffset(hookOperation, result), () => settleOffset(hookOperation, { ok: false, reason: "storage" }));
  }, [offsetSave, settleOffset]);

  const retrySave = () => {
    const failed = failedOperationRef.current;
    const session = sessionRef.current;
    if (noteIssue && session && failed && !frozenSession) {
      if (noteIssue !== "conflict" && noteIssue !== "account-changed") {
        const next = normalizeHeaderNote(draftRef.current);
        if (next !== draftRef.current) setDraftText(next);
        submit(next, next === failed.text);
      }
    }
    const failedOffset = failedOffsetOperationRef.current;
    if (offsetIssue && failedOffset) {
      const latest = noteOffsetRef.current;
      const canUseRetryToken = latest === failedOffset.value
        && failedOffset.retryable
        && offsetOperationRef.current === null;
      submitOffset(latest, failedOffset.raw, canUseRetryToken);
    }
  };

  const reloadOffsetSource = useCallback(() => {
    const active = offsetOperationRef.current;
    if (active) {
      ignoredOffsetOperationsRef.current.add(active);
      offsetOperationRef.current = null;
    }
    offsetSave.meta.reload();
    setOffsetSourceConflict(false);
    setDraftVersion(version => version + 1);
  }, [offsetSave.meta]);

  const startNoteMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (editing || event.button !== 0) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest(".dash-note__clear, .dash-note__icon-btn, input")) return;
      let raw: string | null;
      try {
        raw = localStorage.getItem("xai_pref_dashboard_header_note_x");
        if (offsetSave.meta.source === "unavailable") throw new Error("unavailable");
        if (offsetSave.meta.raw !== raw) {
          setOffsetSourceConflict(true);
          setDraftVersion(version => version + 1);
          return;
        }
      } catch {
        // Merely pressing without crossing the movement threshold is never a
        // position draft. The hook's source alert remains available for repair.
        return;
      }
      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startOffset: noteOffsetRef.current,
        raw,
        moved: false,
      };
      setDraftVersion(version => version + 1);
    },
    [editing, offsetSave.meta.raw, offsetSave.meta.source],
  );

  const moveNote = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      const deltaX = event.clientX - drag.startX;
      if (Math.abs(deltaX) > 3) {
        event.currentTarget.setPointerCapture?.(event.pointerId);
        drag.moved = true;
        setMovingNote(true);
        const next = clampNoteOffset(drag.startOffset + deltaX);
        offsetDesiredRef.current = next;
        setVisibleOffset(next);
        setDraftVersion(version => version + 1);
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
    setDraftVersion(version => version + 1);
    if (drag.moved) submitOffset(noteOffsetRef.current, drag.raw);
  }, [submitOffset]);

  // The host guard deliberately reads the current refs. A note is only a
  // current-user draft when its captured edit session still belongs to the
  // active account. Position work is device-local and therefore survives an
  // account epoch without lending the old note session to the new owner.
  const hasLiveCurrentDraft = useCallback(() => {
    const currentScope = accountScope.capture();
    const noteSession = sessionRef.current;
    const noteCurrent = !frozenSessionRef.current
      && noteSession?.scope === currentScope
      && ((editingRef.current && noteIntentRevisionRef.current !== null)
        || operationRef.current !== null || failedOperationRef.current !== null);
    const offsetCurrent = dragRef.current?.moved === true
      || offsetOperationRef.current !== null || failedOffsetOperationRef.current !== null;
    return Boolean(noteCurrent || offsetCurrent);
  }, []);

  const discardCurrentDraft = useCallback(() => {
    if (!hasLiveCurrentDraft()) return;
    const currentScope = accountScope.capture();
    const noteSession = sessionRef.current;
    const discardNote = !frozenSessionRef.current && noteSession?.scope === currentScope
      && ((editingRef.current && noteIntentRevisionRef.current !== null)
        || operationRef.current !== null || failedOperationRef.current !== null);
    if (discardNote) {
      const currentNoteSave = noteSaveRef.current;
      operationRef.current = null;
      failedOperationRef.current = null;
      sessionRef.current = null;
      setNoteIssue(null);
      setDraftText(currentNoteSave.value, false);
      setEditing(false);
      currentNoteSave.meta.reload();
    }
    const discardOffset = dragRef.current?.moved === true
      || offsetOperationRef.current !== null || failedOffsetOperationRef.current !== null;
    if (discardOffset) {
      const currentOffsetSave = offsetSaveRef.current;
      const active = offsetOperationRef.current;
      if (active) ignoredOffsetOperationsRef.current.add(active);
      dragRef.current = null;
      offsetOperationRef.current = null;
      failedOffsetOperationRef.current = null;
      setMovingNote(false);
      setOffsetIssue(null);
      currentOffsetSave.meta.reload();
    }
    setExportFailed(false);
    setDraftVersion(version => version + 1);
  }, [hasLiveCurrentDraft, setDraftText]);

  const exportCurrentDraft = useCallback((decisionScope = accountScope.capture(), decisionToken = guardTokenRef.current) => {
    let anchor: HTMLAnchorElement | null = null;
    let url: string | null = null;
    const stillCurrent = () => !disposedRef.current
      && guardTokenRef.current === decisionToken
      && accountScope.capture() === decisionScope
      && hasLiveCurrentDraft();
    try {
      if (!stillCurrent()) return;
      const noteSession = sessionRef.current;
      const noteIsCurrent = !frozenSessionRef.current && noteSession?.scope === decisionScope;
      // A source failure cannot establish account ownership. Current editable
      // text is safe; otherwise use only a valid live current projection.
      const currentNoteSave = noteSaveRef.current;
      const note = noteIsCurrent
        ? (editingRef.current ? draftRef.current : committedNoteRef.current)
        : currentNoteSave.meta.source === "valid" || currentNoteSave.meta.source === "absent"
          ? currentNoteSave.value
          : "";
      const offset = normalizeHeaderNoteOffset(noteOffsetRef.current);
      if (typeof note !== "string" || !Number.isFinite(offset)) throw new Error("invalid-draft");
      const blob = new Blob([JSON.stringify({ version: 1, kind: "dashboard-note-draft", note, noteOffset: offset }, null, 2)], { type: "application/json" });
      url = URL.createObjectURL(blob);
      if (!stillCurrent()) return;
      anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "dashboard-note-draft.json";
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      if (!stillCurrent()) return;
      anchor.click();
      if (stillCurrent()) setExportFailed(false);
    } catch {
      if (!disposedRef.current && guardTokenRef.current === decisionToken && accountScope.capture() === decisionScope) setExportFailed(true);
    } finally {
      try { anchor?.remove(); } catch { /* export cleanup never changes drafts */ }
      try { if (url) URL.revokeObjectURL(url); } catch { /* export cleanup never changes drafts */ }
    }
  }, [hasLiveCurrentDraft]);

  const guardToken = guardTokenRef.current;
  useEffect(() => {
    if (!registerDepartureGuard) return undefined;
    const decisionScope = account;
    const isCurrent = () => !disposedRef.current
      && guardTokenRef.current === guardToken
      && accountScope.capture() === decisionScope;
    return registerDepartureGuard({
      token: guardToken,
      label: lang === "zh" ? "工作台备注" : "Dashboard header",
      isCurrent,
      isBlocking: () => isCurrent() && hasLiveCurrentDraft(),
      exportDraft: () => { if (isCurrent()) exportCurrentDraft(decisionScope, guardToken); },
      discardDraft: () => { if (isCurrent()) discardCurrentDraft(); },
    });
  }, [account, discardCurrentDraft, draftVersion, exportCurrentDraft, guardToken, hasLiveCurrentDraft, lang, registerDepartureGuard]);

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
                  if (event.key === "Escape" && !notePending && noteIssue === null && !frozenSession) {
                    sessionRef.current = null;
                    setDraftText(committedNote, false);
                    setEditing(false);
                  }
                }}
                onBlur={saveAfterBlur}
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
      {hasRecoveryNotice && <section role="alert" className="dash-note-recovery">
        {hasCurrentDraft ? <p>{frozenSession ? (lang === "zh" ? "当前设备位置尚未保存，可以导出或重试；此前账户的备注不会包含在此恢复操作中。" : "The current device position is unsaved and can be retried or exported. This recovery does not include the previous account's note.") : (lang === "zh" ? "备注或位置未保存。草稿仅保留在此页面；离开前请重试或导出。" : "Note or position was not saved. Drafts stay on this page only; retry or export before leaving.")}</p> : <p>{lang === "zh" ? "备注位置的已保存来源不可用。请重新读取；这不是新的未保存草稿。" : "The saved note position source is unavailable. Reload it; this is not a new unsaved draft."}</p>}
        {(noteIssue === "conflict" || noteIssue === "account-changed" || offsetIssue === "conflict" || offsetSourceConflict) && !frozenSession && <p>{lang === "zh" ? "账户或已保存内容已变化，无法覆盖。请导出草稿后重新打开。" : "The account or saved content changed. Export your draft and reopen to avoid overwriting newer data."}</p>}
        {frozenSession && <p>{lang === "zh" ? "此前账户的备注草稿保留在此会话中，但当前账户不能导出或放弃它。" : "The previous account's note draft remains protected in this session, but the current account cannot export or discard it."}</p>}
        {(hasCurrentDraft || frozenSession || offsetSourceConflict) && <button type="button" onMouseDown={event => event.preventDefault()} onClick={retrySave}>{lang === "zh" ? "重试备注保存" : "Retry note save"}</button>}
        {noteSourceIssue && <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => noteSave.meta.reload()}>{lang === "zh" ? "重新读取备注" : "Reload dashboard note"}</button>}
        {offsetSourceIssue && <button type="button" onMouseDown={event => event.preventDefault()} onClick={reloadOffsetSource}>{lang === "zh" ? "重新读取备注位置" : "Reload note position"}</button>}
        {hasCurrentDraft && <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => exportCurrentDraft(account, guardToken)}>{frozenSession ? (lang === "zh" ? "导出当前设备位置草稿" : "Export current device draft") : (lang === "zh" ? "导出备注草稿" : "Export note draft")}</button>}
        {frozenSession && <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => setExportFailed(true)}>{lang === "zh" ? "导出旧备注草稿" : "Export note draft"}</button>}
        {exportFailed && <p>{lang === "zh" ? "导出失败，请重试。" : "Export failed. Please retry."}</p>}
      </section>}
    </header>
  );
}
