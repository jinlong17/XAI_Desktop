/**
 * AC-TYPE-1..6: Compile-time type assertions.
 */
import { expectTypeOf, describe, it } from "vitest";
import type { WebPrefKey, WebPrefValue } from "@repo/plugin-web-storage";
import type { EventMap } from "@repo/core/types";
import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";
import { HABITS_STORAGE_KEY } from "../constants.js";
import { habitsSlotRegistration } from "../registration.js";
import type { HabitsState, Habit, WeekStart } from "../types.js";

describe("type assertions", () => {
  it("AC-TYPE-1: HABITS_STORAGE_KEY is assignable to WebPrefKey", () => {
    expectTypeOf(HABITS_STORAGE_KEY).toMatchTypeOf<WebPrefKey>();
  });

  it("AC-TYPE-2: web:habits:checkin-recorded extends keyof EventMap", () => {
    type HasKey = "web:habits:checkin-recorded" extends keyof EventMap ? true : false;
    const check: HasKey = true;
    expectTypeOf(check).toEqualTypeOf<true>();
  });

  it("AC-TYPE-3: HabitsState is assignable to WebPrefValue<xai_habits_state>", () => {
    const state: HabitsState = {
      schemaVersion: 1,
      habits: [],
      checkIns: {},
      diaries: {},
    };
    // WebPrefValue<"xai_habits_state"> is unknown — HabitsState is assignable to unknown
    expectTypeOf(state).toMatchTypeOf<WebPrefValue<"xai_habits_state">>();
  });

  it("AC-TYPE-4: habitsSlotRegistration is WebModuleSlotRegistration", () => {
    expectTypeOf(habitsSlotRegistration).toMatchTypeOf<WebModuleSlotRegistration>();
  });

  it("AC-TYPE-5: Habit.title requires both en and zh", () => {
    // @ts-expect-error zh is missing
    const _: Habit = { id: "h_1", emoji: "🌱", title: { en: "X" }, createdAt: "2026-01-01T00:00:00.000Z" };
    void _;
  });

  it("AC-TYPE-6: WeekStart is a strict literal union", () => {
    // @ts-expect-error 'tuesday' is not a valid WeekStart
    const _: WeekStart = "tuesday";
    void _;
  });
});
