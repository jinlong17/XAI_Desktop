/**
 * PomodoroModule — root route component for the Pomodoro module.
 *
 * P2 version: full timer state machine + usePref persistence + emitWebEvent.
 * Wires useTimerTick, appendSession, isPomodoroSession boundary cast,
 * and the `web:pomodoro:session-finished` emit per design.md §7.
 *
 * Design: packages/xai-web-pomodoro/docs/design.md §5+§6+§7
 * API contract: packages/xai-web-pomodoro/docs/api.md §2.1
 */

import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import { useI18n } from "@repo/plugin-web-tokens";
import { getPrefAutosave, usePref, usePrefAutosave } from "@repo/plugin-web-storage";
import type { PomodoroSession, PomodoroMode } from "./types.js";
import { isPomodoroSession } from "./internal/validate.js";
import { nextMode } from "./internal/nextMode.js";
import { formatDuration } from "./internal/formatDuration.js";
import { notifySessionEnd } from "./internal/notifications.js";
import { useTimerTick } from "./internal/useTimerTick.js";
import { TimerRing } from "./TimerRing.js";
import { PomodoroOverview } from "./PomodoroOverview.js";
import { FocusRecordList } from "./FocusRecordList.js";
import {
  IconChevR,
  IconDots,
  IconMaximize,
  IconMinimize,
  IconSound,
  IconSoundOff,
  IconPlus,
} from "./internal/icons.js";

export interface PomodoroModuleProps {
  /** Active language. Drives useI18n bundle. */
  lang: Lang;
}

const DISPLAY_STYLE_IDS = [
  "digital",
  "ring",
  "clockwise",
  "apple",
  "minimal",
  "focus",
] as const;
type PomodoroDisplayStyle = (typeof DISPLAY_STYLE_IDS)[number];

const THEME_CHOICES = [
  { id: "coral", hue: 25, label: { en: "Coral", zh: "珊瑚红" } },
  { id: "amber", hue: 72, label: { en: "Amber", zh: "琥珀" } },
  { id: "sage", hue: 145, label: { en: "Sage", zh: "鼠尾草" } },
  { id: "teal", hue: 185, label: { en: "Teal", zh: "青蓝" } },
  { id: "blue", hue: 245, label: { en: "Blue", zh: "蓝色" } },
  { id: "violet", hue: 285, label: { en: "Violet", zh: "紫罗兰" } },
  { id: "rose", hue: 340, label: { en: "Rose", zh: "玫瑰" } },
] as const;
type PomodoroThemeId = (typeof THEME_CHOICES)[number]["id"];

const SOUND_CHOICES = [
  { id: "soft-chime", label: { en: "Soft Chime", zh: "轻柔铃声" } },
  { id: "bell", label: { en: "Bell", zh: "清脆铃" } },
  { id: "digital", label: { en: "Digital", zh: "电子提示" } },
  { id: "none", label: { en: "None", zh: "无提示音" } },
] as const;
type PomodoroSoundId = (typeof SOUND_CHOICES)[number]["id"];

const POMODORO_PRESETS = [
  { id: "focus-25", mode: "focus", minutes: 25, label: { en: "25 min", zh: "25 分钟" } },
  { id: "focus-30", mode: "focus", minutes: 30, label: { en: "30 min", zh: "30 分钟" } },
  { id: "focus-15", mode: "focus", minutes: 15, label: { en: "15 min", zh: "15 分钟" } },
  { id: "break-5", mode: "short-break", minutes: 5, label: { en: "5 min break", zh: "5 分钟休息" } },
  { id: "break-10", mode: "short-break", minutes: 10, label: { en: "10 min break", zh: "10 分钟休息" } },
  { id: "break-15", mode: "long-break", minutes: 15, label: { en: "15 min break", zh: "15 分钟长休" } },
] as const;
type PomodoroPresetId = (typeof POMODORO_PRESETS)[number]["id"] | "custom";

const FOCUS_ROUNDS_PER_CYCLE = 4;
const FOCUS_CONTROLS_IDLE_MS = 2400;

const DISPLAY_STYLE_LABELS: Record<PomodoroDisplayStyle, { en: string; zh: string }> = {
  digital: { en: "Digital", zh: "数字倒计时" },
  ring: { en: "Ring", zh: "圆环倒计时" },
  clockwise: { en: "Clockwise", zh: "顺时针进度" },
  apple: { en: "Apple", zh: "Apple 视觉" },
  minimal: { en: "Minimal", zh: "极简模式" },
  focus: { en: "Focus", zh: "专注模式" },
};

function label(lang: Lang, copy: { en: string; zh: string }): string {
  return lang === "zh" ? copy.zh : copy.en;
}

function minutesToMs(minutes: number): number {
  return minutes * 60 * 1000;
}

function clampCustomMinutes(value: number): number {
  if (!Number.isFinite(value)) return 25;
  return Math.min(180, Math.max(1, Math.round(value)));
}

function isPresetId(value: unknown): value is PomodoroPresetId {
  return (
    value === "custom" ||
    (typeof value === "string" &&
      POMODORO_PRESETS.some((preset) => preset.id === value))
  );
}

function isDisplayStyle(value: unknown): value is PomodoroDisplayStyle {
  return typeof value === "string" && (DISPLAY_STYLE_IDS as readonly string[]).includes(value);
}

function isThemeId(value: unknown): value is PomodoroThemeId {
  return typeof value === "string" && THEME_CHOICES.some((theme) => theme.id === value);
}

function isSoundId(value: unknown): value is PomodoroSoundId {
  return typeof value === "string" && SOUND_CHOICES.some((sound) => sound.id === value);
}

function presetForId(id: PomodoroPresetId) {
  if (id === "custom") return null;
  return POMODORO_PRESETS.find((preset) => preset.id === id) ?? POMODORO_PRESETS[0]!;
}

function defaultPresetForMode(mode: PomodoroMode) {
  if (mode === "short-break") return POMODORO_PRESETS.find((preset) => preset.id === "break-5")!;
  if (mode === "long-break") return POMODORO_PRESETS.find((preset) => preset.id === "break-15")!;
  return POMODORO_PRESETS.find((preset) => preset.id === "focus-25")!;
}

function currentRoundFor(mode: PomodoroMode, completedFocusCount: number): number {
  if (mode === "focus") {
    return (completedFocusCount % FOCUS_ROUNDS_PER_CYCLE) + 1;
  }
  const completedInCycle = Math.max(1, completedFocusCount);
  return ((completedInCycle - 1) % FOCUS_ROUNDS_PER_CYCLE) + 1;
}

function isKeyboardControlTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.tagName === "BUTTON" ||
    target.tagName === "INPUT" ||
    target.tagName === "SELECT" ||
    target.tagName === "TEXTAREA"
  );
}

function playPromptSound(soundId: PomodoroSoundId, muted: boolean) {
  if (muted || soundId === "none" || typeof window === "undefined") return;
  type AudioContextConstructor = new () => AudioContext;
  const audioWindow = window as unknown as {
    AudioContext?: AudioContextConstructor;
    webkitAudioContext?: AudioContextConstructor;
  };
  const AudioContextCtor = audioWindow.AudioContext ?? audioWindow.webkitAudioContext;
  if (!AudioContextCtor) return;

  try {
    const ctx = new AudioContextCtor();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    const frequency =
      soundId === "bell" ? 880 : soundId === "digital" ? 660 : 523.25;

    oscillator.type = soundId === "digital" ? "square" : "sine";
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.45);
    window.setTimeout(() => {
      void ctx.close();
    }, 520);
  } catch {
    // Audio preview should never block the timer UI.
  }
}

export function PomodoroModule({ lang }: PomodoroModuleProps) {
  const { t } = useI18n(lang);

  // ---- Persistence: usePref with boundary validation ----------------------
  const [rawSessions] = usePref("xai_pomodoro_sessions");
  const sessions: PomodoroSession[] = useMemo(() => {
    if (!Array.isArray(rawSessions)) return [];
    return (rawSessions as unknown[]).filter((x): x is PomodoroSession => {
      const ok = isPomodoroSession(x);
      if (!ok && process.env.NODE_ENV !== "production") {
        console.warn("[plugin-web-pomodoro] Dropped invalid session record:", x);
      }
      return ok;
    });
  }, [rawSessions]);

  // ---- User display preferences -------------------------------------------
  const [activePresetId, setActivePresetId] = useState<PomodoroPresetId>(() => {
    const saved = getPrefAutosave<PomodoroPresetId>("pomodoro_preset", {
      defaultValue: "focus-25",
    });
    return isPresetId(saved) ? saved : "focus-25";
  });
  const [customMinutes, setCustomMinutes] = useState(() => {
    const saved = getPrefAutosave<number>("pomodoro_custom_minutes", {
      defaultValue: 45,
    });
    return clampCustomMinutes(saved ?? 45);
  });
  const [displayStyle, setDisplayStyle] = useState<PomodoroDisplayStyle>(() => {
    const saved = getPrefAutosave<PomodoroDisplayStyle>("pomodoro_display_style", {
      defaultValue: "apple",
    });
    return isDisplayStyle(saved) ? saved : "apple";
  });
  const [themeId, setThemeId] = useState<PomodoroThemeId>(() => {
    const saved = getPrefAutosave<PomodoroThemeId>("pomodoro_theme", {
      defaultValue: "coral",
    });
    return isThemeId(saved) ? saved : "coral";
  });
  const [soundId, setSoundId] = useState<PomodoroSoundId>(() => {
    const saved = getPrefAutosave<PomodoroSoundId>("pomodoro_sound", {
      defaultValue: "soft-chime",
    });
    return isSoundId(saved) ? saved : "soft-chime";
  });
  const [muted, setMuted] = useState(() => {
    const saved = getPrefAutosave<boolean>("pomodoro_muted", {
      defaultValue: false,
    });
    return typeof saved === "boolean" ? saved : false;
  });
  const [completionNotice, setCompletionNotice] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [focusControlsVisible, setFocusControlsVisible] = useState(false);

  usePrefAutosave("pomodoro_preset", activePresetId);
  usePrefAutosave("pomodoro_custom_minutes", customMinutes);
  usePrefAutosave("pomodoro_display_style", displayStyle);
  usePrefAutosave("pomodoro_theme", themeId);
  usePrefAutosave("pomodoro_sound", soundId);
  usePrefAutosave("pomodoro_muted", muted);

  // ---- Emit dedup guard (StrictMode double-mount safe) --------------------


  // Ref to the accent dot for direct DOM transform in rAF loop
  const accentDotRef = useRef<SVGCircleElement | null>(null);

  // ---- Completed focus count (for nextMode) --------------------------------
  const completedFocusCount = useMemo(
    () => sessions.filter((s) => s.mode === "focus" && s.completed).length,
    [sessions],
  );

  // Stable ref to completedFocusCount to avoid stale closure in onTickToZero
  const completedFocusCountRef = useRef(completedFocusCount);
  completedFocusCountRef.current = completedFocusCount;

  // Ref to hold timerTick.reset so onTickToZero can call it
  const resetRef = useRef<((nextMode: PomodoroMode, durationMs?: number) => void) | null>(null);
  const focusControlsTimerRef = useRef<number | null>(null);

  // ---- Tick-to-zero handler (injected into useTimerTick) ------------------
  // Stable callback — does not change between renders
  const onTickToZeroRef = useRef<
    ((
      mode: PomodoroMode,
      durationMs: number,
      elapsedMs: number,
      sessionId: string,
      sessionStartedAt: string,
    ) => void) | null
  >(null);

  // Implement the callback (stable, uses refs only)
  onTickToZeroRef.current = (
    mode: PomodoroMode,
    _durationMs: number,
    elapsedMs: number,
  ) => {
    playPromptSound(soundId, muted);
    notifySessionEnd(mode, elapsedMs);
    setIsFullscreen(false);
    setFocusControlsVisible(false);

    // Advance mode
    const focusCountAfter =
      completedFocusCountRef.current;
    const nextModeValue = nextMode(mode, focusCountAfter);
    const nextPreset = defaultPresetForMode(nextModeValue);
    setActivePresetId(nextPreset.id);
    setCompletionNotice(
      lang === "zh"
        ? `${modeLabelFor(mode)}完成，已切换到${modeLabelFor(nextModeValue)}。`
        : `${modeLabelFor(mode)} complete. Next up: ${modeLabelFor(nextModeValue)}.`,
    );
    resetRef.current?.(nextModeValue, minutesToMs(nextPreset.minutes));
  };

  // Stable wrapper for useTimerTick
  const onTickToZero = useMemo(() => {
    return (
      mode: PomodoroMode,
      durationMs: number,
      elapsedMs: number,
      sessionId: string,
      sessionStartedAt: string,
    ) => {
      onTickToZeroRef.current?.(mode, durationMs, elapsedMs, sessionId, sessionStartedAt);
    };
  // stable — no deps (uses refs only)
  }, []);

  // ---- Timer hook ---------------------------------------------------------
  const timerTick = useTimerTick({
    dotRef: accentDotRef,
    dotProgressMode: displayStyle === "ring" ? "remaining" : "elapsed",
    onTickToZero,
    onCommitted: (record) => {
      if (!record.completed) {
        setIsFullscreen(false);
        setCompletionNotice(lang === "zh" ? "本次计时已停止并保存。" : "Timer stopped and saved.");
      }
    },
  });

  useEffect(() => {
    if (!isFullscreen) {
      setFocusControlsVisible(false);
      return undefined;
    }
    return () => {
      if (focusControlsTimerRef.current) {
        window.clearTimeout(focusControlsTimerRef.current);
        focusControlsTimerRef.current = null;
      }
    };
  }, [isFullscreen]);

  // Keep resetRef in sync
  resetRef.current = timerTick.reset;

  const { timerState, displayedRemainingMs, start, pause, resume, end, reset } = timerTick;

  const activePreset = presetForId(activePresetId);
  const selectedMode = activePreset?.mode ?? "focus";
  const selectedDurationMs = activePreset
    ? minutesToMs(activePreset.minutes)
    : minutesToMs(customMinutes);
  const currentMode = timerState.mode;
  const isRunning = timerState.kind === "running";
  const isPaused = timerState.kind === "paused";
  const isIdle = timerState.kind === "idle";

  useEffect(() => {
    if (timerState.kind === "idle") {
      reset(selectedMode, selectedDurationMs);
    }
  }, [reset, selectedDurationMs, selectedMode, timerState.kind]);

  // ---- Stop button handler ------------------------------------------------
  function handleStop() {
    if (timerState.kind !== "idle") end();
  }

  function handleReset() {
    setCompletionNotice(null);
    if (timerState.kind === "idle") {
      reset(selectedMode, selectedDurationMs);
      return;
    }
    reset(timerState.mode, timerState.durationMs);
  }

  function handlePresetClick(presetId: PomodoroPresetId) {
    setActivePresetId(presetId);
    setCompletionNotice(null);
    const preset = presetForId(presetId);
    const mode = preset?.mode ?? "focus";
    const durationMs = preset ? minutesToMs(preset.minutes) : minutesToMs(customMinutes);
    if (timerState.kind === "idle") {
      reset(mode, durationMs);
    }
  }

  function handleCustomMinutesChange(value: number) {
    const nextMinutesValue = clampCustomMinutes(value);
    setCustomMinutes(nextMinutesValue);
    setActivePresetId("custom");
    setCompletionNotice(null);
    if (timerState.kind === "idle") {
      reset("focus", minutesToMs(nextMinutesValue));
    }
  }

  function enterFocusFullscreen() {
    setFocusControlsVisible(false);
    setIsFullscreen(true);
  }

  function exitFocusFullscreen() {
    setIsFullscreen(false);
    setFocusControlsVisible(false);
  }

  const revealFocusControls = useCallback(() => {
    if (!isFullscreen) return;
    setFocusControlsVisible(true);
    if (focusControlsTimerRef.current) {
      window.clearTimeout(focusControlsTimerRef.current);
    }
    focusControlsTimerRef.current = window.setTimeout(() => {
      setFocusControlsVisible(false);
      focusControlsTimerRef.current = null;
    }, FOCUS_CONTROLS_IDLE_MS);
  }, [isFullscreen]);

  useEffect(() => {
    if (!isFullscreen || typeof window === "undefined") return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFullscreen(false);
        setFocusControlsVisible(false);
        return;
      }

      if (
        (event.key === " " || event.key === "Spacebar" || event.code === "Space") &&
        !event.repeat &&
        !isKeyboardControlTarget(event.target)
      ) {
        event.preventDefault();
        revealFocusControls();
        if (isIdle) {
          setCompletionNotice(null);
          start(selectedDurationMs);
        } else if (isRunning) {
          pause();
        } else if (isPaused) {
          resume();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isFullscreen,
    isIdle,
    isPaused,
    isRunning,
    pause,
    resume,
    revealFocusControls,
    selectedDurationMs,
    start,
  ]);

  const progress = useMemo(() => {
    const durationMs = timerState.durationMs;
    const elapsed = durationMs - displayedRemainingMs;
    return Math.min(1, elapsed / durationMs);
  }, [displayedRemainingMs, timerState.durationMs]);

  function modeLabelFor(m: PomodoroMode) {
    if (m === "focus") return t.pomo.focus;
    if (m === "short-break") return lang === "zh" ? "短休" : "Short Break";
    return lang === "zh" ? "长休" : "Long Break";
  }

  const stateLabel = isRunning
    ? t.pomo.running
    : isPaused
      ? t.pomo.paused
      : lang === "zh"
        ? "准备开始"
        : "Ready";

  const activeTheme = THEME_CHOICES.find((theme) => theme.id === themeId) ?? THEME_CHOICES[0]!;
  const moduleStyle = {
    "--accent-hue": String(activeTheme.hue),
  } as React.CSSProperties;
  const elapsedMinutes = Math.floor((timerState.durationMs - displayedRemainingMs) / 60_000);
  const totalMinutes = Math.round(timerState.durationMs / 60_000);
  const displayStyleLabel = label(lang, DISPLAY_STYLE_LABELS[displayStyle]);
  const soundLabel =
    SOUND_CHOICES.find((sound) => sound.id === soundId)?.label ?? SOUND_CHOICES[0]!.label;
  const currentRound = currentRoundFor(currentMode, completedFocusCount);

  return (
    <div
      className="module module-pomo"
      data-display-style={displayStyle}
      data-fullscreen={isFullscreen ? "true" : "false"}
      data-running={isRunning ? "true" : "false"}
      style={moduleStyle}
    >
      {timerTick.conflict && <p role="status" className="pomo-notice">{lang === "zh" ? "计时已在其他标签页更改，现已刷新。请检查当前状态后重新操作。" : "The timer changed in another tab and has been refreshed. Review its current state before choosing an action."}</p>}
      {timerTick.error && <section role="alert" className="pomo-notice pomo-recovery">
        <p>{timerTick.error}</p>
        <button type="button" onClick={() => { void timerTick.retry(); }}>{lang === "zh" ? "重试保存" : "Retry save"}</button>
        <button type="button" onClick={() => {
          try {
            const blob = new Blob([timerTick.exportRecovery()], { type: "application/json" });
            const url = URL.createObjectURL(blob); const anchor = document.createElement("a");
            anchor.href = url; anchor.download = "pomodoro-recovery.json"; anchor.click(); URL.revokeObjectURL(url);
          } catch { /* Scope changed: do not export another account. */ }
        }}>{lang === "zh" ? "导出恢复数据" : "Export recovery data"}</button>
      </section>}
      {/* Module header */}
      <header className="module-head pomo-head">
        <div className="pomo-title-block">
          <h1 className="module-title">{t.pomo.title}</h1>
          <span className="pomo-head-sub">
            {modeLabelFor(currentMode)} · {displayStyleLabel}
          </span>
        </div>
        <span className="grow" />
        <span className="pomo-status-chip" data-testid="pomo-status-chip">
          <span className="pomo-status-dot" />
          {stateLabel}
        </span>
        <button
          type="button"
          className="icon-btn"
          aria-label={
            muted
              ? lang === "zh"
                ? "取消静音"
                : "Unmute"
              : lang === "zh"
                ? "静音"
                : "Mute"
          }
          onClick={() => setMuted((m) => !m)}
          data-testid="mute-btn"
        >
          {muted ? <IconSoundOff /> : <IconSound />}
        </button>
        <button
          type="button"
          className="icon-btn pomo-fullscreen-btn"
          aria-label={
            isFullscreen
              ? lang === "zh"
                ? "退出全屏"
                : "Exit fullscreen"
              : lang === "zh"
                ? "进入全屏"
                : "Enter fullscreen"
          }
          aria-pressed={isFullscreen}
          onClick={() => {
            if (isFullscreen) {
              exitFocusFullscreen();
            } else {
              enterFocusFullscreen();
            }
          }}
          data-testid="fullscreen-btn"
        >
          {isFullscreen ? <IconMinimize /> : <IconMaximize />}
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-label={lang === "zh" ? "更多" : "More"}
          data-testid="dots-btn"
        >
          <IconDots />
        </button>
      </header>

      <div className="pomo-shell">
        {/* Main column */}
        <section className="pomo-main">
          <div className="pomo-stage">
            <div className="pomo-stage-top">
              <button
                type="button"
                className="focus-pill"
                aria-label={lang === "zh" ? "当前模式" : "Current mode"}
              >
                <span>{modeLabelFor(currentMode)}</span>
                <IconChevR size={12} />
              </button>
              <span className="pomo-session-chip">
                {elapsedMinutes}/{totalMinutes} {lang === "zh" ? "分钟" : "min"}
              </span>
            </div>

            <div
              className="pomo-timer-frame"
              onDoubleClick={enterFocusFullscreen}
              data-testid="pomo-timer-frame"
              title={lang === "zh" ? "双击进入全屏专注" : "Double-click for fullscreen focus"}
            >
              <TimerRing
                ref={accentDotRef}
                progress={progress}
                running={isRunning}
                variant={displayStyle}
              />
              <div className="timer-inner">
                <span className="timer-kicker">{modeLabelFor(currentMode)}</span>
                <span className="timer-num">{formatDuration(displayedRemainingMs)}</span>
                <span className="timer-state" data-testid="timer-state">
                  {stateLabel}
                </span>
              </div>
            </div>

            <div className="pomo-progress-strip" aria-hidden="true">
              <span style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>

            {completionNotice && (
              <div className="pomo-notice" role="status" data-testid="completion-notice">
                {completionNotice}
              </div>
            )}

            <div className="pomo-actions" data-testid="pomo-actions">
              {isIdle && (
                <button
                  type="button"
                  className="btn primary"
                  aria-label={t.pomo.start}
                  disabled={!timerTick.available || !!timerTick.error || timerTick.settlementPending}
                  data-testid="start-btn"
                  onClick={() => {
                    setCompletionNotice(null);
                    start(selectedDurationMs);
                  }}
                >
                  {t.pomo.start}
                </button>
              )}
              {isRunning && (
                <>
                  <button
                    type="button"
                    className="btn ghost"
                    aria-label={t.pomo.pause}
                    disabled={!timerTick.available || !!timerTick.error || timerTick.settlementPending}
                  data-testid="pause-btn"
                    onClick={pause}
                  >
                    {t.pomo.pause}
                  </button>
                  <button
                    type="button"
                    className="btn ghost"
                    aria-label={lang === "zh" ? "停止" : "Stop"}
                    disabled={!timerTick.available || !!timerTick.error || timerTick.settlementPending}
                  data-testid="end-btn"
                    onClick={handleStop}
                  >
                    {lang === "zh" ? "停止" : "Stop"}
                  </button>
                </>
              )}
              {isPaused && (
                <>
                  <button
                    type="button"
                    className="btn primary"
                    aria-label={t.pomo.continue}
                    disabled={!timerTick.available || !!timerTick.error || timerTick.settlementPending}
                  data-testid="continue-btn"
                    onClick={resume}
                  >
                    {t.pomo.continue}
                  </button>
                  <button
                    type="button"
                    className="btn ghost"
                    aria-label={lang === "zh" ? "停止" : "Stop"}
                    disabled={!timerTick.available || !!timerTick.error || timerTick.settlementPending}
                  data-testid="end-btn-paused"
                    onClick={handleStop}
                  >
                    {lang === "zh" ? "停止" : "Stop"}
                  </button>
                </>
              )}
              <button
                type="button"
                className="btn ghost"
                aria-label={lang === "zh" ? "重置" : "Reset"}
                disabled={!timerTick.available || !!timerTick.error || timerTick.settlementPending}
                  data-testid="reset-btn"
                onClick={handleReset}
              >
                {lang === "zh" ? "重置" : "Reset"}
              </button>
            </div>
          </div>

          <section className="pomo-control-panel" aria-label={lang === "zh" ? "番茄钟设置" : "Pomodoro settings"}>
            <div className="pomo-control-row">
              <div className="pomo-control-label">{lang === "zh" ? "预设" : "Preset"}</div>
              <div className="dur-row" role="list">
                {POMODORO_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className={`dur-chip${activePresetId === preset.id ? " active" : ""}`}
                    aria-pressed={activePresetId === preset.id}
                    disabled={!isIdle}
                    data-testid={`preset-${preset.id}`}
                    onClick={() => handlePresetClick(preset.id)}
                  >
                    {label(lang, preset.label)}
                  </button>
                ))}
                <button
                  type="button"
                  className={`dur-chip${activePresetId === "custom" ? " active" : ""}`}
                  aria-pressed={activePresetId === "custom"}
                  disabled={!isIdle}
                  data-testid="preset-custom"
                  onClick={() => handlePresetClick("custom")}
                >
                  {lang === "zh" ? "自定义" : "Custom"}
                </button>
                <label
                  className={`pomo-custom-minutes${activePresetId === "custom" ? " active" : ""}`}
                  aria-hidden={activePresetId === "custom" ? "false" : "true"}
                >
                  <span>{lang === "zh" ? "分钟" : "Min"}</span>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={customMinutes}
                    disabled={!isIdle}
                    data-testid="custom-minutes-input"
                    onFocus={() => handlePresetClick("custom")}
                    onChange={(event) => handleCustomMinutesChange(Number(event.target.value))}
                  />
                </label>
              </div>
            </div>

            <div className="pomo-control-row">
              <div className="pomo-control-label">{lang === "zh" ? "显示" : "Display"}</div>
              <div className="pomo-style-grid" role="list">
                {DISPLAY_STYLE_IDS.map((id) => (
                  <button
                    key={id}
                    type="button"
                    className={`pomo-style-btn${displayStyle === id ? " active" : ""}`}
                    aria-pressed={displayStyle === id}
                    data-testid={`style-${id}`}
                    onClick={() => setDisplayStyle(id)}
                  >
                    {label(lang, DISPLAY_STYLE_LABELS[id])}
                  </button>
                ))}
              </div>
            </div>

            <div className="pomo-control-row">
              <div className="pomo-control-label">{lang === "zh" ? "颜色" : "Color"}</div>
              <div className="pomo-theme-row">
                {THEME_CHOICES.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    className={`pomo-color-dot${themeId === theme.id ? " active" : ""}`}
                    style={{ "--accent-hue": String(theme.hue) } as React.CSSProperties}
                    aria-label={label(lang, theme.label)}
                    aria-pressed={themeId === theme.id}
                    data-testid={`theme-${theme.id}`}
                    onClick={() => setThemeId(theme.id)}
                  />
                ))}
              </div>
            </div>

            <div className="pomo-control-row">
              <div className="pomo-control-label">{lang === "zh" ? "提示音" : "Sound"}</div>
              <div className="pomo-sound-row">
                <select
                  className="pomo-select"
                  value={soundId}
                  aria-label={lang === "zh" ? "选择提示音" : "Select alert sound"}
                  data-testid="sound-select"
                  onChange={(event) => setSoundId(event.target.value as PomodoroSoundId)}
                >
                  {SOUND_CHOICES.map((sound) => (
                    <option key={sound.id} value={sound.id}>
                      {label(lang, sound.label)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn ghost pomo-preview-btn"
                  data-testid="sound-preview-btn"
                  onClick={() => playPromptSound(soundId, muted)}
                >
                  {lang === "zh" ? "试听" : "Preview"}
                </button>
                <span className="pomo-sound-current">{label(lang, soundLabel)}</span>
              </div>
            </div>
          </section>
        </section>

        {/* Right rail / side panel */}
        <aside className="pomo-side">
          <section className="pomo-side-section">
            <h2 className="side-h">{t.pomo.overview}</h2>
            <PomodoroOverview sessions={sessions} lang={lang} />
          </section>

          <section className="pomo-side-section pomo-history-section">
            <div className="record-head">
              <h2 className="side-h" style={{ flex: 1 }}>
                {t.pomo.focus_record}
              </h2>
              <button
                type="button"
                className="icon-btn"
                aria-label={lang === "zh" ? "手动添加" : "Add manually"}
                data-testid="add-record-btn"
              >
                <IconPlus size={14} />
              </button>
              <button
                type="button"
                className="icon-btn"
                aria-label={lang === "zh" ? "更多" : "More"}
                data-testid="record-dots-btn"
              >
                <IconDots size={14} />
              </button>
            </div>
            <FocusRecordList sessions={sessions} lang={lang} />
          </section>
        </aside>
      </div>

      {isFullscreen && (
        <section
          className="pomo-focus-overlay"
          data-testid="pomo-focus-overlay"
          data-controls-visible={focusControlsVisible ? "true" : "false"}
          data-paused={isPaused ? "true" : "false"}
          aria-label={lang === "zh" ? "番茄钟全屏专注模式" : "Pomodoro fullscreen focus mode"}
          onPointerMove={revealFocusControls}
          onPointerLeave={() => setFocusControlsVisible(false)}
          onFocusCapture={revealFocusControls}
        >
          <div className="pomo-focus-aura" aria-hidden="true" />
          <button
            type="button"
            className="pomo-focus-exit"
            aria-label={lang === "zh" ? "退出全屏" : "Exit fullscreen"}
            data-testid="focus-exit-btn"
            onClick={exitFocusFullscreen}
          >
            <IconMinimize size={18} />
          </button>

          <div className="pomo-focus-hero">
            <div className="pomo-focus-heading">
              <span className="pomo-focus-eyebrow">{t.pomo.title}</span>
              <h2>{modeLabelFor(currentMode)}</h2>
              <p>{stateLabel}</p>
            </div>

            <div className="pomo-focus-ring">
              <TimerRing
                ref={accentDotRef}
                progress={progress}
                running={isRunning}
                variant={displayStyle === "digital" ? "apple" : displayStyle}
              />
              <div className="pomo-focus-time">
                <span className="pomo-focus-phase">
                  {lang === "zh" ? "当前阶段" : "Current phase"}
                </span>
                <span className="pomo-focus-num">{formatDuration(displayedRemainingMs)}</span>
                <span className="pomo-focus-mode">{modeLabelFor(currentMode)}</span>
              </div>
            </div>

            <dl className="pomo-focus-stats">
              <div>
                <dt>{lang === "zh" ? "当前轮次" : "Round"}</dt>
                <dd>{currentRound}</dd>
              </div>
              <div>
                <dt>{lang === "zh" ? "总轮次" : "Total rounds"}</dt>
                <dd>{FOCUS_ROUNDS_PER_CYCLE}</dd>
              </div>
            </dl>
          </div>

          <div className="pomo-focus-controls" data-testid="pomo-focus-controls">
            {isIdle && (
              <button
                type="button"
                className="btn primary"
                aria-label={t.pomo.start}
                disabled={!timerTick.available || !!timerTick.error || timerTick.settlementPending}
                  data-testid="focus-start-btn"
                onClick={() => {
                  setCompletionNotice(null);
                  start(selectedDurationMs);
                }}
              >
                {t.pomo.start}
              </button>
            )}
            {isRunning && (
              <button
                type="button"
                className="btn ghost"
                aria-label={t.pomo.pause}
                disabled={!timerTick.available || !!timerTick.error || timerTick.settlementPending}
                  data-testid="focus-pause-btn"
                onClick={pause}
              >
                {t.pomo.pause}
              </button>
            )}
            {isPaused && (
              <button
                type="button"
                className="btn primary"
                aria-label={t.pomo.continue}
                disabled={!timerTick.available || !!timerTick.error || timerTick.settlementPending}
                  data-testid="focus-continue-btn"
                onClick={resume}
              >
                {t.pomo.continue}
              </button>
            )}
            {!isIdle && (
              <button
                type="button"
                className="btn ghost"
                aria-label={lang === "zh" ? "停止" : "Stop"}
                disabled={!timerTick.available || !!timerTick.error || timerTick.settlementPending}
                  data-testid="focus-stop-btn"
                onClick={handleStop}
              >
                {lang === "zh" ? "停止" : "Stop"}
              </button>
            )}
            <button
              type="button"
              className="btn ghost"
              aria-label={lang === "zh" ? "退出全屏" : "Exit fullscreen"}
              data-testid="focus-exit-action-btn"
              onClick={exitFocusFullscreen}
            >
              {lang === "zh" ? "退出全屏" : "Exit"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
