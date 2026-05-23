/**
 * registration shape + route render tests.
 *
 * Design: packages/xai-web-ai-chat/docs/test.md §3 — R
 */

import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { WebShellProvider } from "@repo/xai-web-shell";
import { aiChatWebModuleRegistration } from "../registration.js";

describe("aiChatWebModuleRegistration (R)", () => {
  it("R1: moduleId === 'ai'", () => {
    expect(aiChatWebModuleRegistration.moduleId).toBe("ai");
  });

  it("R2: railOrder === 1", () => {
    expect(aiChatWebModuleRegistration.railOrder).toBe(1);
  });

  it("R3: icon === 'sparkle'", () => {
    expect(aiChatWebModuleRegistration.icon).toBe("sparkle");
  });

  it("R4: i18nKey === 'nav.ai'", () => {
    expect(aiChatWebModuleRegistration.i18nKey).toBe("nav.ai");
  });

  it("R5: showInRail === true", () => {
    expect(aiChatWebModuleRegistration.showInRail).toBe(true);
  });

  it("R6: children[0].render renders an <AiChatModule> when wrapped in WebShellProvider", () => {
    const Render = aiChatWebModuleRegistration.children[0]!.render;
    const { container } = render(
      <WebShellProvider
        modules={[aiChatWebModuleRegistration]}
        lang="en"
        railPos="left"
        petOn={false}
        setPetOn={() => undefined}
      >
        <Render />
      </WebShellProvider>,
    );
    expect(container.querySelector(".module-ai")).not.toBeNull();
  });
});
