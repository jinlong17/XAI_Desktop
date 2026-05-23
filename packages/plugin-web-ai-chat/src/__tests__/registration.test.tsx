/**
 * registration shape + route render tests.
 *
 * Design: packages/xai-web-ai-chat/docs/test.md §3 — R
 */

import { describe, it, expect } from "vitest";
import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";
import { aiChatWebModuleRegistration } from "../registration.js";

describe("aiChatWebModuleRegistration (R)", () => {
  it("R1: satisfies WebModuleSlotRegistration type (compile-time + runtime shape)", () => {
    const reg: WebModuleSlotRegistration = aiChatWebModuleRegistration;
    expect(reg).toBeDefined();
  });

  it("R2: moduleId === 'ai'", () => {
    expect(aiChatWebModuleRegistration.moduleId).toBe("ai");
  });

  it("R3: railOrder === 1, icon === 'sparkle', i18nKey === 'nav.ai'", () => {
    expect(aiChatWebModuleRegistration.railOrder).toBe(1);
    expect(aiChatWebModuleRegistration.icon).toBe("sparkle");
    expect(aiChatWebModuleRegistration.i18nKey).toBe("nav.ai");
  });

  it("R4: showInRail === true and label is 'XAI Chat'", () => {
    expect(aiChatWebModuleRegistration.showInRail).toBe(true);
    expect(aiChatWebModuleRegistration.label).toBe("XAI Chat");
  });

  it("R5: defaultChildPath === '' and children has '' + '*' entries with renderable render props", () => {
    expect(aiChatWebModuleRegistration.defaultChildPath).toBe("");
    expect(aiChatWebModuleRegistration.children).toHaveLength(2);
    const paths = aiChatWebModuleRegistration.children.map((c) => c.path);
    expect(paths).toContain("");
    expect(paths).toContain("*");
    for (const child of aiChatWebModuleRegistration.children) {
      expect(typeof child.render).toBe("function");
    }
  });
});
