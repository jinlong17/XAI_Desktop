import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";
import { describe, expect, it } from "vitest";
import { bookkeepingWebModuleRegistration } from "../registration.js";

describe("bookkeepingWebModuleRegistration", () => {
  it("registers bookkeeping as a rail-visible Web module", () => {
    const reg: WebModuleSlotRegistration = bookkeepingWebModuleRegistration;

    expect(reg.moduleId).toBe("bookkeeping");
    expect(reg.label).toBe("Bookkeeping");
    expect(reg.icon).toBe("wallet");
    expect(reg.i18nKey).toBe("nav.bookkeeping");
    expect(reg.showInRail).toBe(true);
    expect(reg.children.map((child) => child.path)).toEqual(["", "*"]);
    expect(reg.children[0]?.render).toBeTypeOf("function");
  });
});
