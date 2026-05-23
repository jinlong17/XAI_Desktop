/**
 * <MeditationModule> — top-level component.
 *
 * Renders the picker view (preview card + 4 picker sections) and
 * mounts <MeditationPlayer> as a fullscreen overlay when `active`
 * is true.
 *
 * Persisted state: scene / clock / sound / duration via usePref
 * (single blob xai_meditation_prefs, schemaVersion 1).
 *
 * Local-only state: `active` — wiped on reload (Q3 resolution).
 *
 * No events emitted — meditation is a pure UI module in v1 (statistics
 * row #20 will declare its own consumer channel if needed in the
 * future).
 *
 * Lang flows in via props; rail navigation is handled by the shell.
 */

import { useState, type JSX } from "react";
import { useI18n } from "@repo/plugin-web-tokens";
import type {
  AmbientSoundId,
  ClockVariant,
  Duration,
  MeditationModuleProps,
  SceneId,
} from "./types.js";
import { PickerGroup } from "./PickerGroup.js";
import { ClockDisplay } from "./ClockDisplay.js";
import { MeditationPlayer } from "./MeditationPlayer.js";
import { Icon } from "./internal/icons.js";
import { SCENES } from "./internal/scenes.js";
import { getScene } from "./internal/getScene.js";
import { useMeditationPrefs } from "./internal/useMeditationPrefs.js";

const CLOCK_VARIANTS: readonly ClockVariant[] = ["digital", "split", "analog", "minimal"];
const SOUND_IDS: readonly AmbientSoundId[] = ["none", "water", "rain", "waves", "forest"];
const DURATIONS: readonly Duration[] = [5, 10, 15, 25, 45];

function soundIconName(sound: AmbientSoundId): "rain" | "soundOff" | "sound" {
  if (sound === "rain") return "rain";
  if (sound === "none") return "soundOff";
  return "sound";
}

export function MeditationModule({ lang }: MeditationModuleProps): JSX.Element {
  const { s } = useI18n(lang);
  const [prefs, setPrefs] = useMeditationPrefs();
  const [active, setActive] = useState<boolean>(false);

  const scene = getScene(prefs.scene);

  const onPickScene = (id: SceneId): void => {
    setPrefs({ ...prefs, scene: id });
  };
  const onPickClock = (variant: ClockVariant): void => {
    setPrefs({ ...prefs, clock: variant });
  };
  const onPickSound = (sound: AmbientSoundId): void => {
    setPrefs({ ...prefs, sound });
  };
  const onPickDuration = (duration: Duration): void => {
    setPrefs({ ...prefs, duration });
  };
  const onStart = (): void => {
    setActive(true);
  };
  const onExit = (): void => {
    setActive(false);
  };

  return (
    <div className="module module-meditation">
      <header className="module-head">
        <h1 className="module-title">
          <Icon name="leaf" size={18} /> {s("meditation.title")}
        </h1>
        <span className="grow" />
        <button className="icon-btn" type="button" aria-label={s("meditation.title")}>
          <Icon name="dots" size={16} />
        </button>
      </header>

      <div className="med-layout">
        {/* Preview card */}
        <div className="med-preview" style={{ background: scene.grad }}>
          <div className="med-preview-overlay" />
          <ClockDisplay variant={prefs.clock} accent={scene.accent} mini />
          <div className="med-preview-foot">
            <div className="mp-meta">
              <span>
                <Icon name="leaf" size={12} /> {s(`meditation.scenes.${prefs.scene}`)}
              </span>
              <span>
                <Icon name="clock" size={12} /> {s(`meditation.clocks.${prefs.clock}`)}
              </span>
              <span>
                <Icon name="sound" size={12} /> {s(`meditation.sounds.${prefs.sound}`)}
              </span>
              <span>
                <Icon name="timer" size={12} /> {prefs.duration} {s("meditation.mins")}
              </span>
            </div>
            <button className="btn primary med-start" type="button" onClick={onStart}>
              <Icon name="play" size={14} /> {s("meditation.start")}
            </button>
          </div>
        </div>

        {/* Picker columns */}
        <div className="med-pickers">
          <PickerGroup title={s("meditation.pick_scene")}>
            <div className="scene-grid">
              {SCENES.map((sc) => {
                const isActive = prefs.scene === sc.id;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    className={"scene-card" + (isActive ? " active" : "")}
                    style={{ background: sc.grad }}
                    onClick={() => onPickScene(sc.id)}
                    aria-pressed={isActive}
                  >
                    <span className="scene-label">{s(`meditation.scenes.${sc.id}`)}</span>
                  </button>
                );
              })}
            </div>
          </PickerGroup>

          <PickerGroup title={s("meditation.pick_clock")}>
            <div className="clock-grid">
              {CLOCK_VARIANTS.map((c) => {
                const isActive = prefs.clock === c;
                return (
                  <button
                    key={c}
                    type="button"
                    className={"clock-card" + (isActive ? " active" : "")}
                    onClick={() => onPickClock(c)}
                    aria-pressed={isActive}
                  >
                    <div className="cc-preview">
                      <ClockDisplay variant={c} accent="var(--text-1)" mini staticMode />
                    </div>
                    <div className="cc-label">{s(`meditation.clocks.${c}`)}</div>
                  </button>
                );
              })}
            </div>
          </PickerGroup>

          <PickerGroup title={s("meditation.pick_sound")}>
            <div className="sound-grid">
              {SOUND_IDS.map((sd) => {
                const isActive = prefs.sound === sd;
                return (
                  <button
                    key={sd}
                    type="button"
                    className={"sound-card" + (isActive ? " active" : "")}
                    onClick={() => onPickSound(sd)}
                    aria-pressed={isActive}
                  >
                    <Icon name={soundIconName(sd)} size={16} />
                    <span>{s(`meditation.sounds.${sd}`)}</span>
                  </button>
                );
              })}
            </div>
          </PickerGroup>

          <PickerGroup title={s("meditation.duration")}>
            <div className="dur-row">
              {DURATIONS.map((d) => {
                const isActive = prefs.duration === d;
                return (
                  <button
                    key={d}
                    type="button"
                    className={"dur-chip" + (isActive ? " active" : "")}
                    onClick={() => onPickDuration(d)}
                    aria-pressed={isActive}
                  >
                    {d}
                    <span className="dur-unit">{s("meditation.mins")}</span>
                  </button>
                );
              })}
            </div>
          </PickerGroup>
        </div>
      </div>

      {active && (
        <MeditationPlayer
          scene={scene}
          clock={prefs.clock}
          sound={prefs.sound}
          duration={prefs.duration}
          lang={lang}
          onExit={onExit}
        />
      )}
    </div>
  );
}

export default MeditationModule;
