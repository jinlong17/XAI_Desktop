/**
 * renderHabits helper — wraps HabitsModule in WebShellProvider for tests.
 */
import React from "react";
import { render, type RenderResult } from "@testing-library/react";
import { WebShellProvider } from "@repo/xai-web-shell";
import type { Lang } from "@repo/plugin-web-tokens";
import { HabitsModule } from "../../HabitsModule.js";
import { habitsSlotRegistration } from "../../registration.js";

export function renderHabits(lang: Lang = "en", weekStart: "sun" | "mon" = "sun"): RenderResult {
  return render(
    <WebShellProvider
      modules={[habitsSlotRegistration]}
      lang={lang}
      railPos="left"
      petOn={false}
      setPetOn={() => {}}
    >
      <HabitsModule lang={lang} weekStart={weekStart} />
    </WebShellProvider>
  );
}
