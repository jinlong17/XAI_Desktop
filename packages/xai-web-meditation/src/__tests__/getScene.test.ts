/**
 * Unit on getScene fallback semantics.
 */
import { describe, it, expect } from "vitest";
import { getScene } from "../internal/getScene.js";
import { SCENES } from "../internal/scenes.js";

describe("getScene", () => {
  it("returns the matching scene for each valid id", () => {
    for (const sc of SCENES) {
      expect(getScene(sc.id)).toEqual(sc);
    }
  });

  it("returns ocean (SCENES[1]) as fallback (cast guard)", () => {
    // Cast through unknown to bypass the literal-union type for the test.
    const result = getScene("mars" as unknown as typeof SCENES[number]["id"]);
    expect(result.id).toBe("ocean");
  });
});
