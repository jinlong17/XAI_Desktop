/**
 * Pages render smoke (Phase 4) — AC-2: all 10 ported pages render through their
 * typed adapters behind the admin UI context, without throwing.
 *
 * This complements TT-ADAPTER-* (data layer) and TT-NO-INLINE-MOCK (source-text)
 * by exercising the actual React render of every page.
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { AdminUiProvider } from "../components/AdminUiContext";
import { ADMIN_PAGES } from "./index";

afterEach(() => cleanup());

describe("Pages render smoke: all 10 pages mount without throwing", () => {
  it("registry has exactly the 10 prototype views (Tweaks excluded)", () => {
    expect(ADMIN_PAGES.map((p) => p.key)).toEqual([
      "dashboard",
      "users",
      "boards",
      "features",
      "ai",
      "providers",
      "roles",
      "billing",
      "audit",
      "settings",
    ]);
  });

  for (const page of ADMIN_PAGES) {
    it(`renders "${page.title}" (${page.key})`, () => {
      const { Component } = page;
      const { container } = render(
        <AdminUiProvider>
          <Component />
        </AdminUiProvider>,
      );
      // a mounted page produces a non-empty subtree
      expect(container.querySelector(".page")).toBeTruthy();
    });
  }
});
