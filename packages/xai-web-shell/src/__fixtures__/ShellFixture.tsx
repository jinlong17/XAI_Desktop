/**
 * ShellFixture — test wrapper for @repo/xai-web-shell component tests.
 *
 * Provides a minimal WebShellProvider + MemoryRouter context with sensible
 * defaults. Tests can override any prop via the fixture props.
 */

import { MemoryRouter } from "react-router";
import { WebShellProvider } from "../registry.js";
import type { WebModuleSlotRegistration } from "../types.js";
import type { Lang, RailPos } from "../types.js";

export const FIXTURE_MODULES: WebModuleSlotRegistration[] = [
  {
    moduleId: "tasks",
    label: "Tasks",
    defaultChildPath: "",
    children: [],
    icon: "check",
    railOrder: 1,
    i18nKey: "nav.tasks",
    showInRail: true,
  },
  {
    moduleId: "dashboard",
    label: "Dashboard",
    defaultChildPath: "",
    children: [],
    icon: "layout",
    railOrder: 2,
    i18nKey: "nav.dashboard",
    showInRail: true,
  },
  {
    moduleId: "settings",
    label: "Settings",
    defaultChildPath: "",
    children: [],
    icon: "sliders",
    railOrder: 99,
    i18nKey: "nav.settings",
    showInRail: false,
  },
];

interface ShellFixtureProps {
  modules?: WebModuleSlotRegistration[];
  lang?: Lang;
  railPos?: RailPos;
  petOn?: boolean;
  setPetOn?: (next: boolean) => void;
  children: React.ReactNode;
  initialEntries?: string[];
}

export function ShellFixture({
  modules = FIXTURE_MODULES,
  lang = "en",
  railPos = "left",
  petOn = false,
  setPetOn = () => {},
  children,
  initialEntries = ["/app/tasks"],
}: ShellFixtureProps) {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <WebShellProvider
        modules={modules}
        lang={lang}
        railPos={railPos}
        petOn={petOn}
        setPetOn={setPetOn}
      >
        {children}
      </WebShellProvider>
    </MemoryRouter>
  );
}
