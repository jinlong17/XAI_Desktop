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
 * No <audio> element is instantiated (frozen assumption 16). Ambient
 * sound is label-only.
 *
 * No auto-exit when remaining === 0 — user must press Exit (matches
 * prototype; documented in api.md §3.2).
 */

import { useEffect, useState, type JSX } from "react";
import { useI18n } from "@repo/plugin-web-tokens";
import type { Lang } from "@repo/plugin-web-tokens";
import type { AmbientSoundId, ClockVariant, Duration, Scene } from "./types.js";
import { ClockDisplay } from "./ClockDisplay.js";
import { Icon } from "./internal/icons.js";
import { PARTICLE_COUNT } from "./internal/scenes.js";
import { formatRemaining } from "./internal/formatRemaining.js";

export interface MeditationPlayerProps {
  scene: Scene;
  clock: ClockVariant;
  sound: AmbientSoundId;
  /** Session length in minutes. */
  duration: Duration;
  lang: Lang;
  onExit: () => void;
}

export function MeditationPlayer({
  scene,
  clock,
  sound,
  duration,
  lang,
  onExit,
}: MeditationPlayerProps): JSX.Element {
  const { s } = useI18n(lang);
  const [elapsed, setElapsed] = useState<number>(0);

  useEffect(() => {
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const total = duration * 60;
  const remaining = Math.max(0, total - elapsed);
  const progress = Math.min(1, elapsed / total);
  const { mm, ss } = formatRemaining(remaining);

  return (
    <div className="med-player" style={{ background: scene.grad }}>
      <div className="med-player-bg" />

      {/* Ambient rising particles — compositor-only animation */}
      <div className="med-particles" aria-hidden="true">
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

      {/* Central live clock */}
      <div className="med-player-clock">
        <ClockDisplay variant={clock} accent={scene.accent} />
      </div>

      {/* Breathing ring + label */}
      <div className="med-breathe">
        <div className="breathe-ring" style={{ borderColor: scene.accent }} />
        <div className="breathe-label" style={{ color: scene.accent }}>
          {s("meditation.breathe")}
        </div>
      </div>

      {/* Bottom progress band + countdown + sound name */}
      <div className="med-player-footer">
        <div className="mp-progress">
          <div
            className="mp-progress-bar"
            style={{ width: `${progress * 100}%`, background: scene.accent }}
          />
        </div>
        <div className="mp-foot-row">
          <span className="mp-remaining mono" style={{ color: scene.accent }}>
            {mm}:{ss}
          </span>
          <span className="grow" />
          <span className="mp-info">
            <Icon name="sound" size={13} /> {s(`meditation.sounds.${sound}`)}
          </span>
        </div>
      </div>

      <button
        className="med-exit"
        onClick={onExit}
        aria-label={s("meditation.exit")}
        type="button"
      >
        <Icon name="close" size={18} />
      </button>
    </div>
  );
}
