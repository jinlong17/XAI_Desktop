/**
 * TT-WIRE-USERS/ORGS/BILLING-PAGE — P4 page wiring to composed row #3 seams.
 *
 * Asserts the final admin pages read through `../adapters` async seams while
 * destructive user/org intents route only through `useAdminUi().commands`.
 * Billing remains read-only and exposes no mutation affordance.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { AdminUiProvider } from "../components/AdminUiContext";
import type { GuardedCommandAdapter } from "../adapters/guardedCommands";
import { billingReadSeam, orgsReadSeam, usersReadSeam } from "../adapters";
import { BillingPage } from "./BillingPage";
import { OrgsPage } from "./OrgsPage";
import { UsersPage } from "./UsersPage";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function makeSpyCommands(): GuardedCommandAdapter {
  const ack = { ok: true, data: { applied: false, auditId: "test" } } as const;
  return {
    banUser: vi.fn(async () => ack),
    bulkBan: vi.fn(async () => ack),
    transferOwnership: vi.fn(async () => ack),
  };
}

function renderWithCommands(
  node: React.ReactElement,
  commands = makeSpyCommands(),
): { commands: GuardedCommandAdapter; container: HTMLElement } {
  const { container } = render(
    <AdminUiProvider commandsOverride={commands}>{node}</AdminUiProvider>,
  );
  return { commands, container };
}

describe("TT-WIRE-USERS-PAGE: Users reads async seam and commands route through AdminUiContext", () => {
  it("renders seam-backed users and reaches injected ban/bulk-ban commands", async () => {
    const expected = await usersReadSeam.list({ view: "all" });
    expect(expected.ok).toBe(true);
    if (!expected.ok) throw new Error("users read seam failed");
    const [first, second] = expected.data;
    expect(first).toBeTruthy();
    expect(second).toBeTruthy();

    const { commands } = renderWithCommands(<UsersPage />);

    const firstEmail = await screen.findByText(first!.email);
    fireEvent.click(firstEmail.closest("tr")!);
    const drawer = screen.getByRole("dialog", { name: "用户详情" });
    fireEvent.click(within(drawer).getByRole("button", { name: "封禁" }));
    const banDialog = screen.getByRole("alertdialog", { name: "封禁该用户？" });
    fireEvent.click(within(banDialog).getByRole("button", { name: "封禁" }));

    await waitFor(() =>
      expect(commands.banUser).toHaveBeenCalledWith({ email: first!.email }),
    );

    fireEvent.click(screen.getByLabelText(`select ${first!.name}`));
    fireEvent.click(screen.getByLabelText(`select ${second!.name}`));
    fireEvent.click(screen.getByRole("button", { name: "批量封禁" }));
    const bulkDialog = screen.getByRole("alertdialog", {
      name: `批量封禁 2 个用户？`,
    });
    fireEvent.change(within(bulkDialog).getByLabelText("type BAN to confirm"), {
      target: { value: "BAN" },
    });
    fireEvent.click(within(bulkDialog).getByRole("button", { name: "全部封禁" }));

    await waitFor(() =>
      expect(commands.bulkBan).toHaveBeenCalledWith({
        emails: [first!.email, second!.email],
      }),
    );
  });
});

describe("TT-WIRE-ORGS-PAGE: Orgs reads async seam and commands route through AdminUiContext", () => {
  it("renders seam-backed orgs and reaches injected transfer command", async () => {
    const expected = await orgsReadSeam.list();
    expect(expected.ok).toBe(true);
    if (!expected.ok) throw new Error("orgs read seam failed");
    const [org] = expected.data;
    expect(org).toBeTruthy();

    const { commands } = renderWithCommands(<OrgsPage />);

    const orgName = await screen.findByText(org!.name);
    fireEvent.click(orgName.closest("tr")!);
    const drawer = screen.getByRole("dialog", { name: "组织详情" });
    fireEvent.click(within(drawer).getByRole("button", { name: "转移所有权" }));
    const transferDialog = screen.getByRole("alertdialog", { name: "转移所有权？" });
    fireEvent.change(within(transferDialog).getByLabelText("type TRANSFER to confirm"), {
      target: { value: "TRANSFER" },
    });
    fireEvent.click(within(transferDialog).getByRole("button", { name: "转移" }));

    await waitFor(() =>
      expect(commands.transferOwnership).toHaveBeenCalledWith({
        org: org!.name,
        toMember: "",
      }),
    );
  });
});

describe("TT-WIRE-BILLING-PAGE: Billing reads async seam and stays read-only", () => {
  it("renders seam-backed billing content without calling or exposing mutations", async () => {
    const metrics = await billingReadSeam.metrics();
    const txns = await billingReadSeam.transactions();
    expect(metrics.ok).toBe(true);
    expect(txns.ok).toBe(true);
    if (!metrics.ok || !txns.ok) throw new Error("billing read seam failed");

    const { commands, container } = renderWithCommands(<BillingPage />);

    expect(await screen.findByText(metrics.data.mrr)).toBeTruthy();
    expect(await screen.findByText(txns.data[0]!.org)).toBeTruthy();
    expect(container.querySelector(".page--billing")).toBeTruthy();
    expect(container.querySelector(".btn--danger")).toBeNull();
    expect(commands.banUser).not.toHaveBeenCalled();
    expect(commands.bulkBan).not.toHaveBeenCalled();
    expect(commands.transferOwnership).not.toHaveBeenCalled();
  });
});
