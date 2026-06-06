/**
 * TT-WIRE-FEATURES/AIUSAGE/PROVIDERS-PAGE — P4 page wiring to composed row #4 seams.
 *
 * Asserts the final CONFIG pages read through `../adapters` async seams while
 * CONFIG mutation intents route only through `useAdminUi().commands`.
 * Providers remain key-status-only and never render secret material.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { AdminUiProvider, type AdminCommands } from "../components/AdminUiContext";
import { aiUsageReadSeam, featuresReadSeam, providersReadSeam } from "../adapters";
import { AiUsagePage } from "./AiUsagePage";
import { FeaturesPage } from "./FeaturesPage";
import { ProvidersPage } from "./ProvidersPage";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function makeSpyCommands(): AdminCommands {
  const ack = { ok: true, data: { applied: false, auditId: "test" } } as const;
  return {
    banUser: vi.fn(async () => ack),
    bulkBan: vi.fn(async () => ack),
    transferOwnership: vi.fn(async () => ack),
    setFeatureRollout: vi.fn(async () => ack),
    setProviderRouting: vi.fn(async () => ack),
    setQuota: vi.fn(async () => ack),
  };
}

function renderWithCommands(
  node: React.ReactElement,
  commands = makeSpyCommands(),
): { commands: AdminCommands; container: HTMLElement } {
  const { container } = render(
    <AdminUiProvider commandsOverride={commands}>{node}</AdminUiProvider>,
  );
  return { commands, container };
}

describe("TT-WIRE-FEATURES-PAGE: Features reads async seam and commands route through AdminUiContext", () => {
  it("renders seam-backed features and reaches injected rollout command", async () => {
    const expected = await featuresReadSeam.list();
    expect(expected.ok).toBe(true);
    if (!expected.ok) throw new Error("features read seam failed");
    const feature = expected.data.find((f) => f.status !== "off");
    expect(feature).toBeTruthy();

    const { commands } = renderWithCommands(<FeaturesPage />);

    expect(await screen.findByText(feature!.name)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: `${feature!.name} 开关` }));
    const dialog = screen.getByRole("alertdialog", {
      name: `下线「${feature!.name}」？`,
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "下线" }));

    await waitFor(() =>
      expect(commands.setFeatureRollout).toHaveBeenCalledWith({
        key: feature!.key,
        rollout: 0,
      }),
    );
  });
});

describe("TT-WIRE-AIUSAGE-PAGE: AI usage reads async seam and commands route through AdminUiContext", () => {
  it("renders seam-backed spenders and reaches injected quota command", async () => {
    const expected = await aiUsageReadSeam.topSpenders();
    expect(expected.ok).toBe(true);
    if (!expected.ok) throw new Error("AI usage read seam failed");
    const [spender] = expected.data;
    expect(spender).toBeTruthy();

    const { commands } = renderWithCommands(<AiUsagePage />);

    const nameCell = await screen.findByText(spender!.name);
    fireEvent.click(within(nameCell.closest("tr")!).getByRole("button", { name: "调整配额" }));

    await waitFor(() =>
      expect(commands.setQuota).toHaveBeenCalledWith({
        subject: spender!.name,
        quota: spender!.quotaM,
      }),
    );
  });
});

describe("TT-WIRE-PROVIDERS-PAGE: Providers reads async seam, hides secrets, and commands route through AdminUiContext", () => {
  it("renders seam-backed providers and reaches injected routing command without secret material", async () => {
    const expected = await providersReadSeam.list();
    expect(expected.ok).toBe(true);
    if (!expected.ok) throw new Error("providers read seam failed");
    const provider = expected.data.find((p) => p.keyStatus === "configured");
    expect(provider).toBeTruthy();

    const { commands, container } = renderWithCommands(<ProvidersPage />);

    const providerName = (await screen.findAllByText(provider!.name)).find((el) =>
      el.closest(".pcard"),
    );
    expect(providerName).toBeTruthy();
    expect(screen.getAllByText("已配置").length).toBeGreaterThan(0);
    expect(screen.getAllByText("未配置").length).toBeGreaterThan(0);
    expect(container.textContent).not.toMatch(/sk-|sk-ant-|AIza|•{3,}/);

    const card = providerName!.closest(".pcard");
    expect(card).toBeTruthy();
    fireEvent.click(
      within(card as HTMLElement).getByRole("button", { name: "管理限速与默认模型" }),
    );
    const dialog = screen.getByRole("alertdialog", {
      name: `更新「${provider!.name}」默认路由？`,
    });
    fireEvent.change(within(dialog).getByLabelText("type ROUTING to confirm"), {
      target: { value: "ROUTING" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "更新路由" }));

    await waitFor(() =>
      expect(commands.setProviderRouting).toHaveBeenCalledWith({
        plan: "Pro",
        model: provider!.defaultModel,
      }),
    );
  });
});
