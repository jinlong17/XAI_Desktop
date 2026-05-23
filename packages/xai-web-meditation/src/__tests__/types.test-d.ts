/**
 * AC-TYPE-1..6 — type-level assertions via expectTypeOf.
 */
import { describe, it, expectTypeOf } from "vitest";
import type {
  AmbientSoundId,
  ClockVariant,
  Duration,
  MeditationPrefs,
  SceneId,
} from "../types.js";
import { meditationSlotRegistration } from "../registration.js";
import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";

describe("type contracts", () => {
  it("AC-TYPE-1: SceneId is the literal union of 5 known scenes", () => {
    expectTypeOf<SceneId>().toEqualTypeOf<"forest" | "ocean" | "night" | "rain" | "void">();
  });

  it("AC-TYPE-2: ClockVariant is the literal union of 4 variants", () => {
    expectTypeOf<ClockVariant>().toEqualTypeOf<"digital" | "split" | "analog" | "minimal">();
  });

  it("AC-TYPE-3: AmbientSoundId is the literal union of 5 sounds", () => {
    expectTypeOf<AmbientSoundId>().toEqualTypeOf<
      "none" | "water" | "rain" | "waves" | "forest"
    >();
  });

  it("AC-TYPE-4: Duration is the literal union of 5 numbers", () => {
    expectTypeOf<Duration>().toEqualTypeOf<5 | 10 | 15 | 25 | 45>();
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
