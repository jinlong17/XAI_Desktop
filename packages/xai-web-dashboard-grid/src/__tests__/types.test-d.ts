/**
 * AC-TYPES-1..6: compile-time checks for the public type contract.
 *
 * These tests exercise expectTypeOf — purely type-level. Vitest runs them
 * by reading the file at test time; no runtime assertions besides the
 * `describe` / `it` scaffolding.
 */
import { describe, expectTypeOf, it } from "vitest";
import type { ReactNode } from "react";

import type { Lang } from "@repo/plugin-web-tokens";

import type {
  DashboardModuleProps,
  WidgetRegistration,
  WidgetRenderContext,
  WidgetSpanClass,
} from "../types.js";

describe("public types", () => {
  it("AC-TYPES-1: WidgetRegistration.id is string", () => {
    expectTypeOf<WidgetRegistration["id"]>().toEqualTypeOf<string>();
  });

  it("AC-TYPES-2: WidgetSpanClass is the union of 8 literals", () => {
    type Expected =
      | "w-clock"
      | "w-stat"
      | "w-weather"
      | "w-mini-cal"
      | "w-timezones"
      | "w-stickies"
      | "w-mail"
      | "w-upcoming";
    expectTypeOf<WidgetSpanClass>().toEqualTypeOf<Expected>();
  });

  it("AC-TYPES-2: WidgetRegistration.span is WidgetSpanClass", () => {
    expectTypeOf<WidgetRegistration["span"]>().toEqualTypeOf<WidgetSpanClass>();
  });

  it("AC-TYPES-3: WidgetRegistration.render is (ctx: WidgetRenderContext) => ReactNode", () => {
    expectTypeOf<WidgetRegistration["render"]>().toEqualTypeOf<
      (ctx: WidgetRenderContext) => ReactNode
    >();
  });

  it("AC-TYPES-4: WidgetRenderContext.lang is Lang", () => {
    expectTypeOf<WidgetRenderContext["lang"]>().toEqualTypeOf<Lang>();
  });

  it("WidgetRenderContext.now is Date", () => {
    expectTypeOf<WidgetRenderContext["now"]>().toEqualTypeOf<Date>();
  });

  it("AC-TYPES-5: WidgetRenderContext.goTo is (moduleId: string) => void", () => {
    expectTypeOf<WidgetRenderContext["goTo"]>().toEqualTypeOf<(moduleId: string) => void>();
  });

  it("AC-TYPES-6: DashboardModuleProps.widgets is WidgetRegistration[]", () => {
    expectTypeOf<DashboardModuleProps["widgets"]>().toEqualTypeOf<WidgetRegistration[]>();
  });

  it("DashboardModuleProps.lang is Lang", () => {
    expectTypeOf<DashboardModuleProps["lang"]>().toEqualTypeOf<Lang>();
  });

  it("DashboardModuleProps.goTo is optional (moduleId: string) => void", () => {
    expectTypeOf<DashboardModuleProps["goTo"]>().toEqualTypeOf<
      ((moduleId: string) => void) | undefined
    >();
  });

  it("WidgetRegistration.ariaLabel is optional bilingual pair", () => {
    expectTypeOf<WidgetRegistration["ariaLabel"]>().toEqualTypeOf<
      { en: string; zh: string } | undefined
    >();
  });
});
