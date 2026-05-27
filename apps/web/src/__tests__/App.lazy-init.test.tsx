/**
 * App.lazy-init.test.tsx — APP-LP1..APP-LP5
 *
 * Verifies that App.tsx's lazy useState initializers (lang / theme / density)
 * correctly read from localStorage on mount, and fall back gracefully when
 * the key is absent or the value is corrupt JSON.
 *
 * Bugfix: Audit Top-10 #7 — Tb-02/Tb-03/Tb-04
 *   Root cause: App.tsx previously used plain useState("en" / "light" / "comfortable"),
 *   ignoring any localStorage value written by Topbar.tsx persistAndSet.
 *   Fix: lazy initializers call readLocalPref(key, fallback) — see App.tsx.
 *
 * Test IDs: APP-LP1, APP-LP2, APP-LP3, APP-LP4, APP-LP5
 */

import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router";
import { App, readLocalPref } from "../App";

afterEach(() => cleanup());

vi.mock("@repo/xai-web-event-bus", () => ({
  emitWebEvent: vi.fn(),
  onWebEvent: vi.fn(() => () => {}),
  useWebEventListener: vi.fn(),
}));

vi.mock("@repo/web-auth-device-session", () => ({
  useWebAuthSession: () => ({
    client: null,
    clearSessionStorage: vi.fn().mockResolvedValue(undefined),
    state: "authenticated",
    session: null,
    deviceId: null,
    syncVersion: "2026-05",
    refreshSession: vi.fn(),
    ensureDeviceIdentity: vi.fn(),
    setSession: vi.fn(),
  }),
}));

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.removeAttribute("data-density");
  document.documentElement.removeAttribute("data-rail-pos");
  document.documentElement.removeAttribute("data-bg-tone");
  document.documentElement.style.cssText = "";
  vi.clearAllMocks();
});

function renderApp() {
  return render(
    <MemoryRouter initialEntries={["/app/dashboard"]}>
      <Routes>
        <Route path="/app/*" element={<App />}>
          <Route path=":moduleId/*" element={<div />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe("App lazy-init from localStorage (APP-LP1..APP-LP5)", () => {
  it("APP-LP1 — xai_pref_theme='dark' in localStorage → html data-theme='dark' on mount", () => {
    localStorage.setItem("xai_pref_theme", '"dark"');
    renderApp();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("APP-LP2 — xai_pref_lang='zh' in localStorage → Topbar renders 中文 as selected", () => {
    localStorage.setItem("xai_pref_lang", '"zh"');
    const { container } = renderApp();
    // The 中文 button should have aria-selected="true"
    const zhBtn = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent === "中文"
    );
    expect(zhBtn).toBeTruthy();
    expect(zhBtn!.getAttribute("aria-selected")).toBe("true");
  });

  it("APP-LP3 — xai_pref_density='compact' in localStorage → html data-density='compact' on mount", () => {
    localStorage.setItem("xai_pref_density", '"compact"');
    renderApp();
    expect(document.documentElement.getAttribute("data-density")).toBe("compact");
  });

  it("APP-LP4 — localStorage empty → three dims use fallback (en/light/comfortable)", () => {
    // No localStorage keys set
    renderApp();
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(document.documentElement.getAttribute("data-density")).toBe("comfortable");
    // lang fallback verified by EN button being selected (aria-selected=true)
    const { container } = renderApp();
    const enBtn = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent === "EN"
    );
    expect(enBtn).toBeTruthy();
    expect(enBtn!.getAttribute("aria-selected")).toBe("true");
  });

  it("APP-LP5 — corrupt JSON in xai_pref_theme → JSON.parse fails → fallback to 'light' (no throw)", () => {
    localStorage.setItem("xai_pref_theme", "garbage{not-json}");
    expect(() => renderApp()).not.toThrow();
    // fallback: theme defaults to "light"
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });
});

describe("readLocalPref unit tests", () => {
  it("returns fallback when key absent", () => {
    expect(readLocalPref("xai_pref_theme", "light")).toBe("light");
  });

  it("returns parsed value when key present with valid JSON", () => {
    localStorage.setItem("xai_pref_theme", '"dark"');
    expect(readLocalPref("xai_pref_theme", "light")).toBe("dark");
  });

  it("returns fallback when value is corrupt JSON", () => {
    localStorage.setItem("xai_pref_theme", "not-json{");
    expect(readLocalPref("xai_pref_theme", "light")).toBe("light");
  });
});
