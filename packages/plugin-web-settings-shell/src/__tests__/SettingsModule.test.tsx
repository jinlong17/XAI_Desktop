import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router";
import { SettingsModule, paneRegistry } from "../index.js";

/**
 * Wrap SettingsModule with a MemoryRouter so its useParams / useNavigate /
 * useLocation hooks resolve. The catch-all `:moduleId/*` route mirrors the
 * shape the live `apps/web/src/routes/router.tsx` uses, so URL splat is
 * extracted from the same hook chain.
 *
 * Pass `initialPath="/app/settings/<id>"` to exercise the deep-link path;
 * default `/app/settings` exercises the default-pane path.
 */
function renderModule(
  lang: "en" | "zh" = "en",
  initialPath = "/app/settings",
) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/app/settings/*" element={<SettingsModule lang={lang} />} />
        <Route path="/app/settings" element={<SettingsModule lang={lang} />} />
      </Routes>
    </MemoryRouter>,
  );
}

/**
 * M1..M10 — SettingsModule composition.
 */
describe("<SettingsModule>", () => {
  it("M1: renders root .module.module-settings > .settings-shell.panel", () => {
    renderModule("en");
    expect(document.querySelector(".module.module-settings")).not.toBeNull();
    expect(
      document.querySelector(".module-settings .settings-shell.panel"),
    ).not.toBeNull();
  });

  it("M2: renders 13 sidebar list-row entries", () => {
    renderModule("en");
    const rows = document.querySelectorAll(".module-settings .list-row");
    expect(rows.length).toBe(13);
  });

  it("M3: sidebar entries grouped into 4 .settings-group containers", () => {
    renderModule("en");
    const groups = document.querySelectorAll(".module-settings .settings-group");
    expect(groups.length).toBe(4);
  });

  it("M4: default active pane is 'account' (data-active=true on first row)", () => {
    renderModule("en");
    const rows = document.querySelectorAll(".module-settings .list-row");
    expect(rows[0]?.getAttribute("data-active")).toBe("true");
  });

  it("M5: clicking the appearance entry switches active", () => {
    renderModule("en");
    const rows = Array.from(
      document.querySelectorAll(".module-settings .list-row"),
    ) as HTMLElement[];
    // appearance is index 6 in the paneRegistry order (Group 2, item 5 of 6)
    const appearanceIdx = paneRegistry.findIndex((p) => p.id === "appearance");
    expect(appearanceIdx).toBeGreaterThanOrEqual(0);
    fireEvent.click(rows[appearanceIdx]!);
    expect(rows[appearanceIdx]!.getAttribute("data-active")).toBe("true");
    expect(rows[0]!.getAttribute("data-active")).toBe("false");
  });

  it("M6: detail container renders the active pane's render output", () => {
    renderModule("en");
    const detail = document.querySelector(".module-settings .settings-detail");
    expect(detail?.getAttribute("data-pane")).toBe("account");
    expect(detail?.textContent).toContain("This pane is not yet available.");
  });

  it("M7: clicking through all 13 entries switches active each time without errors", () => {
    renderModule("en");
    const rows = Array.from(
      document.querySelectorAll(".module-settings .list-row"),
    ) as HTMLElement[];
    for (let i = 0; i < rows.length; i++) {
      fireEvent.click(rows[i]!);
      expect(rows[i]!.getAttribute("data-active")).toBe("true");
    }
  });

  it("M8: EN labels — first sidebar entry is 'Account'", () => {
    renderModule("en");
    expect(screen.getByText("Account")).toBeInTheDocument();
  });

  it("M9: switching lang en → zh re-renders ZH labels", () => {
    const { rerender } = renderModule("en");
    expect(screen.getByText("Account")).toBeInTheDocument();
    rerender(
      <MemoryRouter initialEntries={["/app/settings"]}>
        <Routes>
          <Route path="/app/settings/*" element={<SettingsModule lang="zh" />} />
          <Route path="/app/settings" element={<SettingsModule lang="zh" />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText("账户")).toBeInTheDocument();
  });

  it("M10: settings title shows I18N.<lang>.settings.title", () => {
    renderModule("en");
    expect(
      document.querySelector(".module-settings .settings-h")?.textContent,
    ).toBe("Settings");
  });

  // ---- Deep-link tests (codex C3-CHROME-1 fix, 2026-05-26) ----

  it("M11 (codex C3-CHROME-1): /app/settings/ai deep link selects AI pane on mount", () => {
    renderModule("en", "/app/settings/ai");
    const detail = document.querySelector(".module-settings .settings-detail");
    expect(detail?.getAttribute("data-pane")).toBe("ai");
  });

  it("M12 (codex C3-CHROME-1): /app/settings/integrations deep link selects Integrations pane", () => {
    renderModule("en", "/app/settings/integrations");
    const detail = document.querySelector(".module-settings .settings-detail");
    expect(detail?.getAttribute("data-pane")).toBe("integrations");
  });

  it("M13 (codex C3-CHROME-1): /app/settings/premium deep link selects Premium pane", () => {
    renderModule("en", "/app/settings/premium");
    const detail = document.querySelector(".module-settings .settings-detail");
    expect(detail?.getAttribute("data-pane")).toBe("premium");
  });

  it("M14 (codex C3-CHROME-1): unknown pane id (/app/settings/bogus) falls back to account", () => {
    renderModule("en", "/app/settings/bogus");
    const detail = document.querySelector(".module-settings .settings-detail");
    expect(detail?.getAttribute("data-pane")).toBe("account");
  });

  it("M15 (codex C3-CHROME-1): /app/settings (no splat) defaults to account", () => {
    renderModule("en", "/app/settings");
    const detail = document.querySelector(".module-settings .settings-detail");
    expect(detail?.getAttribute("data-pane")).toBe("account");
  });
});
