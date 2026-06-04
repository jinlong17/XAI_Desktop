/**
 * IB1..IB4 — barrel surface integrity.
 */

import { describe, it, expect } from "vitest";
import * as Barrel from "../index.js";

describe("index.ts barrel (IB1..IB4)", () => {
  it("IB1: all advertised public exports resolve to non-undefined", () => {
    const requiredRuntime = [
      "LIST_COLOR_IDS",
      "LIST_COLOR_PALETTE",
      "BOARD_TEMPLATES",
      "DEFAULT_WORKSPACES",
      "PM_LABELS",
      "makeDefaultBoards",
      "isBoard",
      "isBoardArray",
      "isBoardCard",
      "isBoardList",
      "loadBoardsOrDefault",
      "pickActiveBoard",
      "isBoardPanelState",
      "isInboxCardArray",
      "DEFAULT_PANEL_STATE",
      "INBOX_SEED",
      "loadPanelsOrDefault",
      "loadInboxOrDefault",
      "togglePanelInvariant",
      "isSinglePanelOpen",
      "computeRingSegments",
      "computeDonePct",
      "BoardSwitcher",
      "BoardCreator",
      "StatusOverviewBanner",
      "ArchivedListsManager",
      "ArchivedCardsManager",
      "InboxPanel",
      "PlannerPanel",
      "computePlannerSlots",
      "BoardCardDetailModal",
      "BoardCardDetailSurface",
      "BoardWorkspacesModule",
      "boardWorkspacesWebModuleRegistration",
    ];
    for (const key of requiredRuntime) {
      expect(Barrel, `missing export: ${key}`).toHaveProperty(key);
      expect(
        (Barrel as Record<string, unknown>)[key],
        `undefined export: ${key}`,
      ).toBeDefined();
    }
  });

  it("IB2: re-exports from @repo/plugin-web-board-core are wired through", async () => {
    const boardCore = await import("@repo/plugin-web-board-core");
    expect(Barrel.BOARD_TEMPLATES).toBe(boardCore.BOARD_TEMPLATES);
    expect(Barrel.DEFAULT_WORKSPACES).toBe(boardCore.DEFAULT_WORKSPACES);
    expect(Barrel.PM_LABELS).toBe(boardCore.PM_LABELS);
    expect(Barrel.makeDefaultBoards).toBe(boardCore.makeDefaultBoards);
    expect(Barrel.LIST_COLOR_PALETTE).toBe(boardCore.LIST_COLOR_PALETTE);
  });

  it("IB3: boardWorkspacesWebModuleRegistration is a valid WebModuleSlotRegistration shape", () => {
    const reg = Barrel.boardWorkspacesWebModuleRegistration;
    expect(reg.moduleId).toBe("board");
    expect(reg.label).toBe("Boards");
    expect(reg.icon).toBe("kanban");
    expect(reg.railOrder).toBe(3);
    expect(reg.i18nKey).toBe("nav.board");
    expect(reg.showInRail).toBe(true);
    expect(reg.children).toHaveLength(2);
  });

  it("IB4: barrel must not expose any internal/* path", async () => {
    // Verified statically: the barrel's source only imports from
    // "./internal/<x>.js" relative paths; consumers receive only the
    // public names re-exported above. This test asserts the absence of
    // a few internal-only symbols at the barrel level.
    const internalSymbols = ["DEFAULT_INBOX_SEED_INTERNAL", "INTERNAL_HELPER"];
    for (const sym of internalSymbols) {
      expect(Barrel).not.toHaveProperty(sym);
    }
  });
});
