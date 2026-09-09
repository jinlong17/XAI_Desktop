/**
 * <MeditationPlayer> — fullscreen player overlay.
 *
 * Renders only when the parent module's `active` flag is true.
 *
 * Layout: position:fixed; inset:0; z-index:100. Covers rail+topbar
 * without coordinating with the shell (per design.md §1 frozen
 * assumption 13).
 *
 * Animations are compositor-only: particle uses transform translateY +
 * opacity; breathing ring uses transform scale (per AC-TOKENS-3 +
 * frozen assumption 14).
 *
 * Ambient sound is generated through Web Audio by useAmbientAudio.
 *
 * Fixed/custom sessions count down to 00:00. Infinite sessions keep running
 * until the user exits. The active view hides setup controls and progress
 * chrome so the player stays quiet and centered.
 */

import { useCallback, useEffect, useRef, useState, type JSX } from "react";
import { useI18n } from "@repo/plugin-web-tokens";
import type { Lang } from "@repo/plugin-web-tokens";
import type {
  AmbientSoundId,
  ClockColorPalette,
  ClockScale,
  ClockVariant,
  Duration,
  DurationMode,
  Scene,
} from "./types.js";
import { ClockDisplay } from "./ClockDisplay.js";
import { Icon } from "./internal/icons.js";
import { PARTICLE_COUNT } from "./internal/scenes.js";
import { formatRemaining } from "./internal/formatRemaining.js";
import { formatElapsed, resolveDurationSeconds } from "./internal/duration.js";
import { elapsedAt, type MeditationSession } from "./internal/sessionController.js";
import { useAmbientAudio } from "./internal/useAmbientAudio.js";

export interface MeditationPlayerProps {
  scene: Scene;
  sceneLabel: string;
  clock: ClockVariant;
  clockScale: ClockScale;
  clockColors: ClockColorPalette;
  sound: AmbientSoundId;
  volume: number;
  /** Session length in minutes. */
  duration: Duration;
  durationMode: DurationMode;
  customDuration: number;
  lang: Lang;
  onExit: () => void;
  sessionControl?: { row: MeditationSession; now: number; error: string | null; busy: boolean; pause: () => void; resume: () => Promise<boolean> };
  onVolumeChange?: (volume: number) => void;
}

export function MeditationPlayer({
  scene,
  sceneLabel,
  clock,
  clockScale,
  clockColors,
  sound,
  volume,
  duration,
  durationMode,
  customDuration,
  lang,
  onExit,
  onVolumeChange,
  sessionControl,
}: MeditationPlayerProps): JSX.Element {
  const { s } = useI18n(lang);
  const [localPaused, setPaused] = useState(false);
  const [now, setNow] = useState(Date.now);
  const timing = useRef({ accumulated: 0, started: Date.now() });
  const total = sessionControl ? (sessionControl.row.durationMs === null ? null : sessionControl.row.durationMs / 1000) : resolveDurationSeconds(durationMode, duration, customDuration);
  const elapsed = sessionControl ? Math.floor(elapsedAt(sessionControl.row, sessionControl.now) / 1000) : Math.floor((timing.current.accumulated + (localPaused ? 0 : Math.max(0, now - timing.current.started))) / 1000);
  const ended = sessionControl ? sessionControl.row.phase === 'ended' || total !== null && elapsed >= total : total !== null && elapsed >= total;
  const paused = sessionControl ? sessionControl.row.phase === 'paused' : localPaused;
  const [controlsOpen, setControlsOpen] = useState<boolean>(false);
  const [controlsVisible, setControlsVisible] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const controlsHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ambient = useAmbientAudio();

  const clearControlsHideTimer = useCallback((): void => {
    if (controlsHideTimer.current === null) return;
    clearTimeout(controlsHideTimer.current);
    controlsHideTimer.current = null;
  }, []);

  const scheduleControlsHide = useCallback((): void => {
    clearControlsHideTimer();
    if (controlsOpen || paused) return;
    controlsHideTimer.current = setTimeout(() => {
      setControlsVisible(false);
      controlsHideTimer.current = null;
    }, 2400);
  }, [clearControlsHideTimer, controlsOpen, paused]);

  const revealControls = useCallback((): void => {
    setControlsVisible(true);
    scheduleControlsHide();
  }, [scheduleControlsHide]);

  useEffect(() => {
    if (paused || ended || sessionControl) return;
    const tick = () => setNow(Date.now());
    const id = setInterval(tick, 250);
    window.addEventListener('pageshow', tick); document.addEventListener('visibilitychange', tick);
    return () => { clearInterval(id); window.removeEventListener('pageshow', tick); document.removeEventListener('visibilitychange', tick); };
  }, [paused, ended, sessionControl]);

  useEffect(() => {
    if (!paused && !ended && !sessionControl?.error) void ambient.play(sound, volume);
    return () => ambient.pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (ambient.state.playing) {
      void ambient.play(sound, volume);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sound]);

  useEffect(() => {
    ambient.setVolume(volume);
  }, [ambient, volume]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const onFullscreenChange = (): void => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    onFullscreenChange();
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => () => clearControlsHideTimer(), [clearControlsHideTimer]);

  useEffect(() => {
    if (controlsOpen || paused) {
      clearControlsHideTimer();
      setControlsVisible(true);
      return;
    }
    scheduleControlsHide();
  }, [clearControlsHideTimer, controlsOpen, paused, scheduleControlsHide]);

  const audioDeadline = sessionControl ? sessionControl.row.deadline : total === null ? null : timing.current.started + total * 1000 - timing.current.accumulated;
  const setAudioDeadline = ambient.setDeadline;
  useEffect(() => { setAudioDeadline(audioDeadline); }, [audioDeadline, setAudioDeadline]);
  const stopAudio = ambient.pause;
  useEffect(() => { if (ended || paused || sessionControl?.error) stopAudio(); }, [ended, paused, sessionControl?.error, stopAudio]);

  const remaining = total === null ? null : Math.max(0, total - elapsed);
  const timeLabel = remaining === null ? formatElapsed(elapsed) : (() => {
    const { mm, ss } = formatRemaining(remaining);
    return `${mm}:${ss}`;
  })();
  const isInfinite = durationMode === "infinite";
  const particleClass = `med-particles med-particles-${scene.animation}`;
  const focusClockVariant: ClockVariant = clock.startsWith("analog") || clock === "breathRing" ? "digital" : clock;
  const soundPlaying = ambient.state.playing && ambient.state.sound === sound;
  const soundToggleLabel = soundPlaying ? s("meditation.pause_sound") : s("meditation.play_sound");
  const controlsShouldShow = controlsVisible || controlsOpen || paused || ended || !!ambient.state.error || !!sessionControl?.error;
  const pauseSession = (): void => {
    if (sessionControl) sessionControl.pause();
    else { timing.current.accumulated += Math.max(0, Date.now() - timing.current.started); setNow(Date.now()); setPaused(true); }
    ambient.pause();
  };
  const resumeSession = (): void => {
    if (ended || sessionControl?.error) return;
    if (sessionControl) { void sessionControl.resume().then(ok => { if (ok && sound !== 'none') void ambient.play(sound, volume); }); return; }
    else { timing.current.started = Date.now(); setNow(Date.now()); setPaused(false); }
    if (sound !== "none") {
      void ambient.play(sound, volume);
    }
  };
  const toggleSound = (): void => {
    if (sound === "none" || ended || paused || sessionControl?.error) return;
    if (soundPlaying) {
      ambient.pause();
    } else {
      void ambient.play(sound, volume);
    }
  };
  const toggleFullscreen = (): void => {
    if (typeof document === "undefined") return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }
    void document.documentElement.requestFullscreen?.();
  };
  const toggleControlsPanel = (): void => {
    setControlsVisible(true);
    setControlsOpen((open) => !open);
  };
  const hideControlsImmediately = (): void => {
    if (controlsOpen || paused) return;
    clearControlsHideTimer();
    setControlsVisible(false);
  };
  const exit = (): void => {
    ambient.pause();
    if (typeof document !== "undefined" && document.fullscreenElement) {
      void document.exitFullscreen();
    }
    onExit();
  };

  return (
    <div
      className={"med-player" + (controlsShouldShow ? " controls-visible" : "") + (controlsOpen ? " controls-open" : "")}
      style={{ background: scene.grad }}
      onPointerEnter={revealControls}
      onPointerMove={revealControls}
      onPointerDown={revealControls}
      onPointerLeave={hideControlsImmediately}
      onFocus={revealControls}
    >
      <div className="med-player-bg" />
      {ended && <p className="med-player-notice" role="status">{lang === 'zh' ? '冥想已结束' : 'Meditation ended'}</p>}
      {ambient.state.error && <div className="med-player-notice" role="alert">{lang === 'zh' ? '音频播放失败，请检查浏览器声音权限并重试。' : ambient.state.error}<button type="button" onClick={toggleSound} disabled={ended || paused || !!sessionControl?.error}>{lang === 'zh' ? '重试播放' : 'Retry audio'}</button></div>}

      {/* Ambient rising particles — compositor-only animation */}
      <div className={particleClass} aria-hidden="true">
        {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${(i * 53) % 100}%`,
              animationDelay: `${i * 0.6}s`,
              animationDuration: `${10 + (i % 4) * 3}s`,
              background: scene.accent,
            }}
          />
        ))}
      </div>

      <div className="med-focus-shell">
        <div className="med-focus-core">
          <div className="med-player-clock med-focus-clock">
            <ClockDisplay
              variant={focusClockVariant}
              accent={scene.accent}
              scale={clockScale}
              colors={clockColors}
              frameless
            />
          </div>
          <div className="mp-session-meta med-focus-meta">
            <span className="mp-scene-name">{sceneLabel}</span>
            <span className="mp-sound-state">{s(`meditation.sounds.${sound}`)}</span>
            <span className="mp-remaining mono" style={{ color: scene.accent }}>
              {isInfinite ? "∞ " : ""}
              {timeLabel}
            </span>
          </div>
        </div>

        <div className="med-focus-controls" role="toolbar" aria-label={s("meditation.player_controls")}>
          <button
            className="mp-primary-control"
            type="button"
            disabled={ended || !!sessionControl?.error || sessionControl?.busy}
            data-control="session"
            onClick={paused ? resumeSession : pauseSession}
            aria-label={paused ? s("meditation.resume") : s("meditation.pause")}
          >
            <Icon name={paused ? "play" : "pause"} size={13} />
            {paused ? s("meditation.resume") : s("meditation.pause")}
          </button>
          <button
            className="mp-sound-toggle"
            type="button"
            data-control="fullscreen"
            onClick={toggleFullscreen}
            aria-pressed={isFullscreen}
            aria-label={isFullscreen ? s("meditation.exit_fullscreen") : s("meditation.fullscreen")}
          >
            <Icon name={isFullscreen ? "fullscreenExit" : "fullscreen"} size={13} />
            {isFullscreen ? s("meditation.exit_fullscreen") : s("meditation.fullscreen")}
          </button>
          <button
            className="mp-sound-toggle"
            type="button"
            data-control="settings"
            onClick={toggleControlsPanel}
            aria-pressed={controlsOpen}
            aria-label={s("meditation.player_controls")}
          >
            <Icon name="sliders" size={13} />
            {s("meditation.player_controls")}
          </button>
          <button className="mp-end-control" type="button" onClick={exit}>
            {s("meditation.end")}
          </button>
        </div>

        {controlsOpen && (
          <div className="mp-control-panel">
          <button
            className="mp-sound-toggle"
            type="button"
            onClick={toggleSound}
            disabled={sound === "none" || ended || paused || !!sessionControl?.error}
            aria-pressed={soundPlaying}
            aria-label={soundToggleLabel}
            title={soundToggleLabel}
          >
            <Icon name={soundPlaying ? "pause" : "sound"} size={13} />
            {s(`meditation.sounds.${sound}`)}
          </button>
          <label className="mp-volume">
            <span>{s("meditation.volume")}</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(event) => onVolumeChange?.(Number(event.currentTarget.value))}
            />
          </label>
          </div>
        )}
      </div>

      <button
        className="med-exit"
        onClick={exit}
        aria-label={s("meditation.exit")}
        type="button"
      >
        <Icon name="close" size={18} />
      </button>
    </div>
  );
}
