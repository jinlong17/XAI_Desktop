/**
 * Host integration test — row #24 (xai-web-settings-rest).
 * CP1..CP3 (packages/xai-web-settings-rest/docs/dev_log.md §Phase P3 step 5).
 *
 * Verifies that `composeSettingsPaneRegistry()` correctly substitutes all 12
 * panes owned by @repo/plugin-web-settings-rest into the 14-pane chassis.
 * Extension 2026-05-25: ai pane added (gap-closure row #2), chassis grew from 13 → 14.
 */
import { describe, it, expect } from "vitest";
import { paneRegistry } from "@repo/plugin-web-settings-shell";
import {
  accountPane,
  premiumPane,
  smartListsPane,
  notificationsPane,
  dateTimePane,
  morePane,
  integrationsPane,
  collaboratePane,
  stickyPane,
  hotkeysPane,
  aboutPane,
  aiPane,
} from "@repo/plugin-web-settings-rest";
import { composeSettingsPaneRegistry } from "../routes/modules/settingsPaneComposition.js";

describe("composeSettingsPaneRegistry — row #24 rest panes (CP1..CP3)", () => {
  it("CP1: composed pane list length equals 14 (full chassis after ai pane extension)", () => {
    const composed = composeSettingsPaneRegistry();
    // After #22 (appearance), #23 (features), #24 (12 panes including ai) substitute
    // into the 14-pane chassis registry, the list must remain exactly 14 entries.
    // Extension 2026-05-25: chassis grew from 13 → 14 with ai pane (gap-closure row #2).
    expect(composed.length).toBe(14);
    expect(composed.length).toBe(paneRegistry.length);
  });

  it("CP2: each of the 12 row #24 owned ids resolves to its exported Pane object", () => {
    const composed = composeSettingsPaneRegistry();

    expect(composed.find((p) => p.id === "account")).toBe(accountPane);
    expect(composed.find((p) => p.id === "premium")).toBe(premiumPane);
    expect(composed.find((p) => p.id === "smart_lists")).toBe(smartListsPane);
    expect(composed.find((p) => p.id === "notifications")).toBe(notificationsPane);
    expect(composed.find((p) => p.id === "date_time")).toBe(dateTimePane);
    expect(composed.find((p) => p.id === "more")).toBe(morePane);
    expect(composed.find((p) => p.id === "integrations")).toBe(integrationsPane);
    expect(composed.find((p) => p.id === "collaborate")).toBe(collaboratePane);
    expect(composed.find((p) => p.id === "sticky")).toBe(stickyPane);
    expect(composed.find((p) => p.id === "hotkeys")).toBe(hotkeysPane);
    expect(composed.find((p) => p.id === "about")).toBe(aboutPane);
    expect(composed.find((p) => p.id === "ai")).toBe(aiPane);
  });

  it("CP3: non-owned ids in the chassis registry have identity preserved", () => {
    const composed = composeSettingsPaneRegistry();
    // Ids substituted by row #22, #23, or #24 — identity is intentionally changed.
    const SUBSTITUTED_IDS = new Set([
      "features",      // row #23
      "appearance",    // row #22
      "account",
      "premium",
      "smart_lists",
      "notifications",
      "date_time",
      "more",
      "integrations",
      "collaborate",
      "sticky",
      "hotkeys",
      "about",
      "ai",            // row #24 (gap-closure row #2, 2026-05-25)
    ]);
    for (let i = 0; i < paneRegistry.length; i++) {
      const orig = paneRegistry[i]!;
      const next = composed[i]!;
      // All entries preserve their id regardless of substitution.
      expect(next.id).toBe(orig.id);
      // Non-substituted entries must be the exact same object reference.
      if (!SUBSTITUTED_IDS.has(orig.id)) {
        expect(next).toBe(orig);
      }
    }
  });
});
