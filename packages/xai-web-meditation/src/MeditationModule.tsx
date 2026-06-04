/**
 * <MeditationModule> — top-level component.
 *
 * Renders the picker/configuration view and mounts <MeditationPlayer> as a
 * fullscreen overlay when `active` is true.
 */

import { useMemo, useState, type JSX } from "react";
import { useI18n } from "@repo/plugin-web-tokens";
import type {
  AmbientSoundId,
  ClockColorPalette,
  ClockScale,
  ClockVariant,
  CustomScene,
  CustomSceneId,
  Duration,
  DurationMode,
  MeditationModuleProps,
  PresetDuration,
  Scene,
  SceneAnimation,
  SceneId,
} from "./types.js";
import { PRESET_DURATIONS } from "./constants.js";
import { PickerGroup } from "./PickerGroup.js";
import { ClockDisplay } from "./ClockDisplay.js";
import { MeditationPlayer } from "./MeditationPlayer.js";
import { Icon } from "./internal/icons.js";
import { SCENES, sceneFromCustom } from "./internal/scenes.js";
import { getScene } from "./internal/getScene.js";
import { useMeditationPrefs } from "./internal/useMeditationPrefs.js";
import { useAmbientAudio } from "./internal/useAmbientAudio.js";

const CLOCK_VARIANTS: readonly ClockVariant[] = [
  "digital",
  "digitalSoft",
  "digitalFocus",
  "split",
  "splitStack",
  "analog",
  "analogFine",
  "analogBold",
  "analogZen",
  "minimal",
  "minimalDots",
  "breathRing",
];
const CLOCK_SCALES: readonly ClockScale[] = ["compact", "normal", "large", "larger"];
const SOUND_IDS: readonly AmbientSoundId[] = [
  "none",
  "water",
  "rain",
  "waves",
  "thunder",
  "forest",
  "whiteNoise",
];
const DURATIONS: readonly PresetDuration[] = PRESET_DURATIONS;
const ANIMATIONS: readonly SceneAnimation[] = ["particles", "rain", "waves", "aurora", "still"];
const COLOR_KEYS: ReadonlyArray<keyof ClockColorPalette> = [
  "digits",
  "hands",
  "ring",
  "background",
  "highlight",
];

type CustomSceneDraft = Omit<CustomScene, "id"> & { id?: CustomSceneId };

function soundIconName(sound: AmbientSoundId): "rain" | "soundOff" | "sound" {
  if (sound === "rain") return "rain";
  if (sound === "none") return "soundOff";
  return "sound";
}

function makeCustomSceneId(): CustomSceneId {
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Date.now().toString(36);
  return `custom:${suffix}`;
}

function sceneName(scene: Scene, translate: (path: string) => string): string {
  return scene.name ?? translate(`meditation.scenes.${scene.id}`);
}

function durationLabel(
  mode: DurationMode,
  duration: Duration,
  customDuration: number,
  translate: (path: string) => string,
): string {
  if (mode === "infinite") return translate("meditation.infinite");
  const minutes = mode === "custom" ? customDuration : duration;
  return `${minutes} ${translate("meditation.mins")}`;
}

function draftFromCurrent(scene: Scene, prefs: ReturnType<typeof useMeditationPrefs>[0]): CustomSceneDraft {
  return {
    name: scene.name ?? "Quiet custom",
    background: "#101820",
    gradientFrom: prefs.clockColors.highlight,
    gradientTo: prefs.clockColors.background,
    animation: scene.animation,
    sound: prefs.sound,
    clock: prefs.clock,
    clockScale: prefs.clockScale,
    clockColors: prefs.clockColors,
    durationMode: prefs.durationMode,
    duration: prefs.duration,
    customDuration: prefs.customDuration,
  };
}

export function MeditationModule({ lang }: MeditationModuleProps): JSX.Element {
  const { s } = useI18n(lang);
  const [prefs, setPrefs] = useMeditationPrefs();
  const [active, setActive] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(true);
  const [fixedDraft, setFixedDraft] = useState<string>("60");
  const scene = getScene(prefs.scene, prefs.customScenes);
  const [editingSceneId, setEditingSceneId] = useState<CustomSceneId | "new">("new");
  const [draft, setDraft] = useState<CustomSceneDraft>(() => draftFromCurrent(scene, prefs));
  const ambient = useAmbientAudio();

  const allScenes = useMemo(
    () => [...SCENES, ...prefs.customScenes.map(sceneFromCustom)] as readonly Scene[],
    [prefs.customScenes],
  );
  const fixedDurations = useMemo(
    () => [...DURATIONS, ...prefs.customFixedDurations].sort((a, b) => a - b),
    [prefs.customFixedDurations],
  );

  const setClockColor = (key: keyof ClockColorPalette, value: string): void => {
    setPrefs({
      ...prefs,
      clockColors: {
        ...prefs.clockColors,
        [key]: value,
      },
    });
  };

  const setVolume = (volume: number): void => {
    setPrefs({ ...prefs, volume });
    ambient.setVolume(volume);
  };

  const applyCustomScene = (custom: CustomScene): void => {
    setPrefs({
      ...prefs,
      scene: custom.id,
      sound: custom.sound,
      clock: custom.clock,
      clockScale: custom.clockScale,
      clockColors: custom.clockColors,
      durationMode: custom.durationMode,
      duration: custom.duration,
      customDuration: custom.customDuration,
    });
  };

  const onPickScene = (id: SceneId): void => {
    const custom = prefs.customScenes.find((item) => item.id === id);
    if (custom) {
      applyCustomScene(custom);
      return;
    }
    setPrefs({ ...prefs, scene: id });
  };

  const onPickClock = (variant: ClockVariant): void => {
    setPrefs({ ...prefs, clock: variant });
  };

  const onPickSound = (sound: AmbientSoundId): void => {
    setPrefs({ ...prefs, sound });
    if (sound === "none") {
      ambient.pause();
      return;
    }
    if (ambient.state.playing && ambient.state.sound === sound) {
      ambient.pause();
      return;
    }
    void ambient.play(sound, prefs.volume);
  };

  const onPickDuration = (duration: Duration): void => {
    setPrefs({ ...prefs, duration, durationMode: "preset" });
  };

  const addFixedDuration = (): void => {
    const minutes = Math.max(1, Math.min(240, Math.round(Number(fixedDraft))));
    if (!Number.isFinite(minutes)) return;
    const isBuiltIn = DURATIONS.includes(minutes as PresetDuration);
    const exists = prefs.customFixedDurations.includes(minutes);
    const customFixedDurations = isBuiltIn || exists
      ? prefs.customFixedDurations
      : [...prefs.customFixedDurations, minutes].sort((a, b) => a - b);
    setPrefs({ ...prefs, customFixedDurations, duration: minutes, durationMode: "preset" });
    setFixedDraft(String(minutes));
  };

  const deleteFixedDuration = (duration: Duration): void => {
    const customFixedDurations = prefs.customFixedDurations.filter((item) => item !== duration);
    setPrefs({
      ...prefs,
      customFixedDurations,
      duration: prefs.duration === duration ? 15 : prefs.duration,
      durationMode: prefs.duration === duration ? "preset" : prefs.durationMode,
    });
  };

  const onCustomDuration = (value: number): void => {
    const customDuration = Math.max(1, Math.min(240, Math.round(value)));
    setPrefs({ ...prefs, customDuration, durationMode: "custom" });
  };

  const onStart = (): void => {
    ambient.pause();
    setSettingsOpen(false);
    setActive(true);
  };

  const onExit = (): void => {
    setActive(false);
  };

  const startNewScene = (): void => {
    setEditingSceneId("new");
    setDraft(draftFromCurrent(scene, prefs));
  };

  const editCustomScene = (custom: CustomScene): void => {
    setEditingSceneId(custom.id);
    setDraft({ ...custom });
  };

  const saveCustomScene = (): void => {
    const id = editingSceneId === "new" ? makeCustomSceneId() : editingSceneId;
    const nextScene: CustomScene = {
      id,
      name: draft.name.trim() || s("meditation.custom_scene"),
      background: draft.background,
      gradientFrom: draft.gradientFrom,
      gradientTo: draft.gradientTo,
      animation: draft.animation,
      sound: draft.sound,
      clock: draft.clock,
      clockScale: draft.clockScale,
      clockColors: draft.clockColors,
      durationMode: draft.durationMode,
      duration: draft.duration,
      customDuration: draft.customDuration,
    };
    const customScenes =
      editingSceneId === "new"
        ? [...prefs.customScenes, nextScene]
        : prefs.customScenes.map((item) => (item.id === id ? nextScene : item));
    setPrefs({ ...prefs, customScenes, scene: id });
    setEditingSceneId(id);
    setDraft({ ...nextScene });
  };

  const deleteCustomScene = (id: CustomSceneId): void => {
    const customScenes = prefs.customScenes.filter((item) => item.id !== id);
    setPrefs({
      ...prefs,
      customScenes,
      scene: prefs.scene === id ? "ocean" : prefs.scene,
    });
    startNewScene();
  };

  return (
    <div className="module module-meditation">
      {!active && (
      <div className="med-config">
        <header className="module-head">
          <h1 className="module-title">
            <Icon name="leaf" size={18} /> {s("meditation.title")}
          </h1>
          <span className="grow" />
          <button
            className="icon-btn"
            type="button"
            aria-label={s("meditation.clock_settings")}
            aria-pressed={settingsOpen}
            onClick={() => setSettingsOpen((open) => !open)}
          >
            <Icon name="sliders" size={16} />
          </button>
        </header>

        <div className="med-layout">
        <div className="med-preview" style={{ background: scene.grad }}>
          <div className="med-preview-overlay" />
          <ClockDisplay
            variant={prefs.clock}
            accent={scene.accent}
            scale={prefs.clockScale}
            colors={prefs.clockColors}
          />
          <div className="med-preview-foot">
            <div className="mp-meta">
              <span>
                <Icon name="leaf" size={12} /> {sceneName(scene, s)}
              </span>
              <span>
                <Icon name="clock" size={12} /> {s(`meditation.clocks.${prefs.clock}`)}
              </span>
              <span>
                <Icon name="sound" size={12} /> {s(`meditation.sounds.${prefs.sound}`)}
              </span>
              <span>
                <Icon name="timer" size={12} />{" "}
                {durationLabel(prefs.durationMode, prefs.duration, prefs.customDuration, s)}
              </span>
            </div>
            <button className="btn primary med-start" type="button" onClick={onStart}>
              <Icon name="play" size={14} /> {s("meditation.start")}
            </button>
          </div>
        </div>

        <div className="med-pickers">
          <PickerGroup title={s("meditation.pick_scene")}>
            <div className="scene-grid">
              {allScenes.map((sc) => {
                const isActive = prefs.scene === sc.id;
                return (
                  <div key={sc.id} className={"scene-shell" + (isActive ? " active" : "")}>
                    <button
                      type="button"
                      className="scene-card"
                      style={{ background: sc.grad }}
                      onClick={() => onPickScene(sc.id)}
                      aria-pressed={isActive}
                    >
                      <span className="scene-label">{sceneName(sc, s)}</span>
                    </button>
                    {sc.id.startsWith("custom:") && (
                      <div className="scene-actions">
                        <button
                          type="button"
                          className="mini-action"
                          onClick={() => {
                            const custom = prefs.customScenes.find((item) => item.id === sc.id);
                            if (custom) editCustomScene(custom);
                          }}
                          aria-label={s("meditation.edit_scene")}
                        >
                          <Icon name="edit" size={13} />
                        </button>
                        <button
                          type="button"
                          className="mini-action danger"
                          onClick={() => deleteCustomScene(sc.id as CustomSceneId)}
                          aria-label={s("meditation.delete_scene")}
                        >
                          <Icon name="trash" size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </PickerGroup>

          <PickerGroup title={s("meditation.duration")}>
            <div className="duration-panel">
              <div className="dur-mode-label">{s("meditation.fixed_duration")}</div>
              <div className="dur-row">
                {fixedDurations.map((d) => {
                  const isActive = prefs.durationMode === "preset" && prefs.duration === d;
                  const isCustom = prefs.customFixedDurations.includes(d);
                  return (
                    <span key={d} className={"dur-item" + (isCustom ? " custom-fixed" : "")}>
                      <button
                        type="button"
                        className={"dur-chip" + (isActive ? " active" : "") + (isCustom ? " user" : "")}
                        onClick={() => onPickDuration(d)}
                        aria-pressed={isActive}
                      >
                        {d}
                        <span className="dur-unit">{s("meditation.mins")}</span>
                      </button>
                      {isCustom && (
                        <button
                          type="button"
                          className="dur-remove"
                          onClick={() => deleteFixedDuration(d)}
                          aria-label={`${s("meditation.remove_fixed_duration")} ${d}`}
                        >
                          <Icon name="close" size={11} />
                        </button>
                      )}
                    </span>
                  );
                })}
                <label className="dur-add">
                  <span>{s("meditation.add_fixed_duration")}</span>
                  <input
                    type="number"
                    min="1"
                    max="240"
                    value={fixedDraft}
                    onChange={(event) => setFixedDraft(event.currentTarget.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") addFixedDuration();
                    }}
                  />
                  <button type="button" onClick={addFixedDuration} aria-label={s("meditation.add_fixed_duration")}>
                    <Icon name="plus" size={13} />
                  </button>
                </label>
              </div>
              <div className="dur-custom-row">
                <label>
                  <span>{s("meditation.custom_duration")}</span>
                  <input
                    type="number"
                    min="1"
                    max="240"
                    value={prefs.customDuration}
                    onChange={(event) => onCustomDuration(Number(event.currentTarget.value))}
                    onFocus={() => setPrefs({ ...prefs, durationMode: "custom" })}
                  />
                </label>
                <button
                  type="button"
                  className={"dur-chip dur-infinite" + (prefs.durationMode === "infinite" ? " active" : "")}
                  onClick={() => setPrefs({ ...prefs, durationMode: "infinite" })}
                  aria-pressed={prefs.durationMode === "infinite"}
                >
                  {s("meditation.infinite_mode")}
                </button>
              </div>
            </div>
          </PickerGroup>

          <PickerGroup title={s("meditation.pick_sound")}>
            <div className="sound-grid">
              {SOUND_IDS.map((sd) => {
                const isActive = prefs.sound === sd;
                const isPlaying = ambient.state.playing && ambient.state.sound === sd;
                return (
                  <button
                    key={sd}
                    type="button"
                    className={"sound-card" + (isActive ? " active" : "")}
                    onClick={() => onPickSound(sd)}
                    aria-pressed={isActive}
                    data-playing={isPlaying ? "true" : "false"}
                  >
                    <Icon name={isPlaying ? "pause" : soundIconName(sd)} size={16} />
                    <span>{s(`meditation.sounds.${sd}`)}</span>
                  </button>
                );
              })}
            </div>
            <label className="volume-row">
              <span>{s("meditation.volume")}</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={prefs.volume}
                onChange={(event) => setVolume(Number(event.currentTarget.value))}
              />
            </label>
          </PickerGroup>

          {settingsOpen && (
            <PickerGroup title={s("meditation.clock_settings")}>
              <div className="clock-settings">
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
                          <ClockDisplay
                            variant={c}
                            accent="var(--text-1)"
                            scale="compact"
                            colors={prefs.clockColors}
                            mini
                            staticMode
                          />
                        </div>
                        <div className="cc-label">{s(`meditation.clocks.${c}`)}</div>
                      </button>
                    );
                  })}
                </div>
                <div className="segmented">
                  {CLOCK_SCALES.map((scale) => (
                    <button
                      key={scale}
                      type="button"
                      className={prefs.clockScale === scale ? "active" : ""}
                      onClick={() => setPrefs({ ...prefs, clockScale: scale })}
                      aria-pressed={prefs.clockScale === scale}
                    >
                      {s(`meditation.clock_sizes.${scale}`)}
                    </button>
                  ))}
                </div>
                <div className="color-grid">
                  {COLOR_KEYS.map((key) => (
                    <label key={key}>
                      <span>{s(`meditation.clock_colors.${key}`)}</span>
                      <input
                        type="color"
                        value={prefs.clockColors[key]}
                        onChange={(event) => setClockColor(key, event.currentTarget.value)}
                      />
                    </label>
                  ))}
                </div>
              </div>
            </PickerGroup>
          )}

          <PickerGroup title={s("meditation.custom_scene")}>
            <div className="custom-scene-editor">
              <div className="editor-head">
                <strong>
                  {editingSceneId === "new" ? s("meditation.new_scene") : s("meditation.edit_scene")}
                </strong>
                <button type="button" className="text-btn" onClick={startNewScene}>
                  {s("meditation.new_scene")}
                </button>
              </div>
              <label className="field-row">
                <span>{s("meditation.scene_name")}</span>
                <input
                  type="text"
                  value={draft.name}
                  onChange={(event) => setDraft({ ...draft, name: event.currentTarget.value })}
                />
              </label>
              <div className="color-grid scene-color-grid">
                {(["background", "gradientFrom", "gradientTo"] as const).map((key) => (
                  <label key={key}>
                    <span>{s(`meditation.scene_fields.${key}`)}</span>
                    <input
                      type="color"
                      value={draft[key]}
                      onChange={(event) => setDraft({ ...draft, [key]: event.currentTarget.value })}
                    />
                  </label>
                ))}
              </div>
              <div className="field-grid">
                <label>
                  <span>{s("meditation.animation")}</span>
                  <select
                    value={draft.animation}
                    onChange={(event) =>
                      setDraft({ ...draft, animation: event.currentTarget.value as SceneAnimation })
                    }
                  >
                    {ANIMATIONS.map((item) => (
                      <option key={item} value={item}>
                        {s(`meditation.animations.${item}`)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>{s("meditation.pick_sound")}</span>
                  <select
                    value={draft.sound}
                    onChange={(event) =>
                      setDraft({ ...draft, sound: event.currentTarget.value as AmbientSoundId })
                    }
                  >
                    {SOUND_IDS.map((item) => (
                      <option key={item} value={item}>
                        {s(`meditation.sounds.${item}`)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>{s("meditation.pick_clock")}</span>
                  <select
                    value={draft.clock}
                    onChange={(event) =>
                      setDraft({ ...draft, clock: event.currentTarget.value as ClockVariant })
                    }
                  >
                    {CLOCK_VARIANTS.map((item) => (
                      <option key={item} value={item}>
                        {s(`meditation.clocks.${item}`)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>{s("meditation.default_duration")}</span>
                  <input
                    type="number"
                    min="1"
                    max="240"
                    value={draft.customDuration}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        durationMode: "custom",
                        customDuration: Math.max(1, Math.min(240, Number(event.currentTarget.value))),
                      })
                    }
                  />
                </label>
              </div>
              <button type="button" className="btn primary save-scene" onClick={saveCustomScene}>
                <Icon name="save" size={14} /> {s("meditation.save_scene")}
              </button>
            </div>
          </PickerGroup>
        </div>
        </div>
      </div>
      )}

      {active && (
        <MeditationPlayer
          scene={scene}
          sceneLabel={sceneName(scene, s)}
          clock={prefs.clock}
          clockScale={prefs.clockScale}
          clockColors={prefs.clockColors}
          sound={prefs.sound}
          volume={prefs.volume}
          duration={prefs.duration}
          durationMode={prefs.durationMode}
          customDuration={prefs.customDuration}
          lang={lang}
          onExit={onExit}
          onVolumeChange={setVolume}
        />
      )}
    </div>
  );
}

export default MeditationModule;
