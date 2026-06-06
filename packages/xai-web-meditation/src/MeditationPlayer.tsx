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
}: MeditationPlayerProps): JSX.Element {
  const { s } = useI18n(lang);
  const [elapsed, setElapsed] = useState<number>(0);
  const [paused, setPaused] = useState<boolean>(false);
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
    if (paused) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [paused]);

  useEffect(() => {
    void ambient.play(sound, volume);
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

  const total = resolveDurationSeconds(durationMode, duration, customDuration);
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
  const controlsShouldShow = controlsVisible || controlsOpen || paused;
  const pauseSession = (): void => {
    setPaused(true);
    ambient.pause();
  };
  const resumeSession = (): void => {
    setPaused(false);
    if (sound !== "none") {
      void ambient.play(sound, volume);
    }
  };
  const toggleSound = (): void => {
    if (sound === "none") return;
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
            disabled={sound === "none"}
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
