import { describe, expect, test } from "vitest";
import {
  BOARD_INTEGRATION_PROVIDER_IDS,
  BOARD_INTEGRATION_PROVIDERS,
  createBoardIntegrationAttachment,
  getBoardIntegrationProvider,
  isBoardIntegrationProviderId,
} from "../index.js";

describe("integrationAdapters", () => {
  test("IA1 provider catalog covers supported Board integration link adapters", () => {
    expect(BOARD_INTEGRATION_PROVIDER_IDS).toEqual([
      "gcal",
      "github",
      "linear",
      "drive",
      "link",
    ]);
    expect(BOARD_INTEGRATION_PROVIDERS.map((provider) => provider.label)).toEqual([
      "Google Calendar",
      "GitHub",
      "Linear",
      "Google Drive",
      "Link",
    ]);
  });

  test("IA2 provider guard narrows known provider ids", () => {
    expect(isBoardIntegrationProviderId("github")).toBe(true);
    expect(isBoardIntegrationProviderId("notion")).toBe(false);
  });

  test("IA3 creates a normalized provider-backed attachment", () => {
    const result = createBoardIntegrationAttachment({
      id: " att-1 ",
      providerId: "github",
      url: "https://github.com/example/repo/issues/1",
      title: "Issue 1",
      externalId: " GH-1 ",
    });

    expect(result.status).toBe("valid");
    if (result.status !== "valid") throw new Error("expected valid result");
    expect(result.attachment).toEqual({
      id: "att-1",
      url: "https://github.com/example/repo/issues/1",
      title: "Issue 1",
      source: {
        kind: "integration",
        providerId: "github",
        providerName: "GitHub",
        externalId: "GH-1",
      },
    });
  });

  test("IA4 rejects missing ids, unknown providers, and non-http urls", () => {
    expect(
      createBoardIntegrationAttachment({
        id: "",
        providerId: "linear",
        url: "https://linear.app/acme/issue/ABC-1",
      }),
    ).toEqual({ status: "invalid", reason: "missing-id" });

    expect(
      createBoardIntegrationAttachment({
        id: "att-1",
        providerId: "notion" as "linear",
        url: "https://notion.so/page",
      }),
    ).toEqual({ status: "invalid", reason: "unknown-provider" });

    expect(
      createBoardIntegrationAttachment({
        id: "att-1",
        providerId: "drive",
        url: "javascript:alert(1)",
      }),
    ).toEqual({ status: "invalid", reason: "invalid-url" });
  });

  test("IA5 provider lookup returns catalog metadata", () => {
    expect(getBoardIntegrationProvider("gcal")).toEqual({
      id: "gcal",
      label: "Google Calendar",
      category: "calendar",
    });
  });
});
