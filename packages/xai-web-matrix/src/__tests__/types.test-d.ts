/**
 * AC-TYPE-1..4: Compile-time type assertions.
 * These tests validate that cross-package contracts are type-sound.
 *
 * Extended for xai-web-matrix-card-create (EP1):
 * NewMatrixCardDraft compile-time shape check.
 */
import { expectTypeOf, describe, it } from "vitest";
import type { WebPrefKey, WebPrefValue } from "@repo/plugin-web-storage";
import type { EventMap } from "@repo/core/types";
import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";
import { MATRIX_STORAGE_KEY } from "../constants.js";
import { matrixSlotRegistration } from "../registration.js";
import type { MatrixState, NewMatrixCardDraft } from "../types.js";

describe("type assertions", () => {
  it("AC-TYPE-1: MATRIX_STORAGE_KEY is assignable to WebPrefKey", () => {
    expectTypeOf(MATRIX_STORAGE_KEY).toMatchTypeOf<WebPrefKey>();
  });

  it("AC-TYPE-2: web:matrix:priority-tagged extends keyof EventMap", () => {
    // This will compile only if the key is in EventMap
    type HasKey = "web:matrix:priority-tagged" extends keyof EventMap ? true : false;
    const check: HasKey = true;
    expectTypeOf(check).toEqualTypeOf<true>();
  });

  it("AC-TYPE-3: MatrixState is assignable to WebPrefValue<xai_matrix_state>", () => {
    const state: MatrixState = {
      schemaVersion: 1,
      q1: [],
      q2: [],
      q3: [],
      q4: [],
    };
    // WebPrefValue<"xai_matrix_state"> is unknown — MatrixState is assignable to unknown
    expectTypeOf(state).toMatchTypeOf<WebPrefValue<"xai_matrix_state">>();
  });

  it("AC-TYPE-4: matrixSlotRegistration is WebModuleSlotRegistration", () => {
    expectTypeOf(matrixSlotRegistration).toMatchTypeOf<WebModuleSlotRegistration>();
  });

  // EP1 extension — NewMatrixCardDraft compile-time shape
  it("EP1: NewMatrixCardDraft has required title: string and optional tag: string", () => {
    const draft: NewMatrixCardDraft = { title: "hello" };
    expectTypeOf(draft.title).toMatchTypeOf<string>();
    expectTypeOf(draft.tag).toMatchTypeOf<string | undefined>();
  });
});
