/**
 * Compile-time assertion: web:matrix:priority-tagged exists in EventMap.
 * This test file will fail to type-check if the EventMap entry is absent.
 */
import { expectTypeOf, describe, it } from "vitest";
import type { EventMap } from "@repo/core/types";

describe("EventMap web:matrix:priority-tagged presence", () => {
  it("web:matrix:priority-tagged is a key of EventMap", () => {
    type HasKey = "web:matrix:priority-tagged" extends keyof EventMap ? true : false;
    const check: HasKey = true;
    expectTypeOf(check).toEqualTypeOf<true>();
  });

  it("payload has expected shape", () => {
    type Payload = EventMap["web:matrix:priority-tagged"];
    const sample: Payload = {
      cardId: "c1",
      from: "q1",
      to: "q2",
      taggedAt: new Date().toISOString(),
    };
    expectTypeOf(sample.cardId).toEqualTypeOf<string>();
    expectTypeOf(sample.to).toMatchTypeOf<string>();
  });
});
