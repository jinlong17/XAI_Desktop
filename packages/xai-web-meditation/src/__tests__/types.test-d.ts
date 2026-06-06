/**
 * AC-TYPE-1..6 — type-level assertions via expectTypeOf.
 */
import { describe, it, expectTypeOf } from "vitest";
import type {
  AmbientSoundId,
  BaseSceneId,
  ClockVariant,
  CustomSceneId,
  Duration,
  MeditationPrefs,
  PresetDuration,
  SceneId,
} from "../types.js";
import { meditationSlotRegistration } from "../registration.js";
import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";

describe("type contracts", () => {
  it("AC-TYPE-1: BaseSceneId is the literal union of 5 known scenes", () => {
    expectTypeOf<BaseSceneId>().toEqualTypeOf<"forest" | "ocean" | "night" | "rain" | "void">();
    expectTypeOf<SceneId>().toEqualTypeOf<BaseSceneId | CustomSceneId>();
  });

  it("AC-TYPE-2: ClockVariant is the literal union of 12 variants", () => {
    expectTypeOf<ClockVariant>().toEqualTypeOf<
      | "digital"
      | "digitalSoft"
      | "digitalFocus"
      | "split"
      | "splitStack"
      | "analog"
      | "analogFine"
      | "analogBold"
      | "analogZen"
      | "minimal"
      | "minimalDots"
      | "breathRing"
    >();
  });

  it("AC-TYPE-3: AmbientSoundId is the literal union of 7 sounds", () => {
    expectTypeOf<AmbientSoundId>().toEqualTypeOf<
      "none" | "water" | "rain" | "waves" | "thunder" | "forest" | "whiteNoise"
    >();
  });

  it("AC-TYPE-4: PresetDuration is literal, Duration accepts user minutes", () => {
    expectTypeOf<PresetDuration>().toEqualTypeOf<5 | 10 | 15 | 25 | 45>();
    expectTypeOf<Duration>().toEqualTypeOf<number>();
  });

  it("AC-TYPE-5: MeditationPrefs.scene is SceneId (not string)", () => {
    expectTypeOf<MeditationPrefs["scene"]>().toEqualTypeOf<SceneId>();
    expectTypeOf<MeditationPrefs["clock"]>().toEqualTypeOf<ClockVariant>();
    expectTypeOf<MeditationPrefs["sound"]>().toEqualTypeOf<AmbientSoundId>();
    expectTypeOf<MeditationPrefs["duration"]>().toEqualTypeOf<Duration>();
  });

  it("AC-TYPE-6: meditationSlotRegistration satisfies WebModuleSlotRegistration", () => {
    expectTypeOf(meditationSlotRegistration).toMatchTypeOf<WebModuleSlotRegistration>();
  });
});
