/**
 * DIAGNOSTIC replay for the oracle disputes OE-1 and OE-2 (CP-APPEARANCE-01, control-plane batch 41).
 *
 * This file is not an oracle and gates nothing. It replays the frozen steps of `continuity-export` case 006
 * (`../web-appearance-recovery-sol/continuity-export.test.tsx:180–193`) and case 007 (`:195–221`) unchanged up to the
 * disputed point, and then only records what the product did, through the frozen fixture's `observe()` (one
 * `SOL-OBS <tag> <json>` line each). It asserts nothing about the product, so it runs to the end on both products;
 * the only checks are the frozen fixture's own preconditions and its one-confirm check inside `clickReset`.
 *
 * It answers two questions the frozen oracle cannot, because it stops at its first failed assertion:
 *   OE-1  After the native, event-less write that follows the mount, what does Reset to defaults do with those
 *         bytes, the reset drafts and the status, and what do Retry and Discard of a conflicted item then do?
 *   OE-2  What does the Mist choice write when only the tone write fails, and what is committed at unmount?
 */
import { afterEach, beforeEach, it, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import { accountLifecycleLockName } from "@repo/plugin-web-storage";
import { appearancePane } from "@repo/plugin-web-settings-appearance";
import {
  ACCENT, attempts, BG, bytes, choose, clickReset, configureApp, discardOf, fault, fired, flush, hold, mark, mountStandalone, msg,
  observe, OWNER_A, pre, RAIL, retryOf, says, seedValue, setup, shown, statusText, teardown, unload, usePaneRoot, warns, writes,
} from "./fixture";

// The same auth-session substitution and route-table import as the frozen continuity-export file, so the module graph
// and the fixture's environment are the ones that file runs in.
const auth = vi.hoisted(() => {
  const state = { calls: 0 };
  const value: Record<string, unknown> = {
    state: "authenticated",
    session: { user: { id: "appearance-sol-A" } },
    client: null,
    coordinator: undefined,
    authError: null,
    signOutFailed: false,
    reportSignOutFailure: undefined,
    deviceId: null,
    syncVersion: "2026-05",
    refreshSession: async () => null,
    ensureDeviceIdentity: async () => "appearance-sol-device",
    clearSessionStorage: async () => undefined,
    setSession: () => undefined,
  };
  return { state, value };
});
vi.mock("../../../packages/web-auth-device-session/src/session", async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, useWebAuthSession: () => { auth.state.calls += 1; return auth.value; } };
});

import { webHostRouteObjects } from "../../../apps/web/src/routes/router";

configureApp(webHostRouteObjects);
beforeEach(() => { setup(); });
afterEach(() => { teardown(); });

function standalone(): ReturnType<typeof mountStandalone> {
  const view = mountStandalone(appearancePane.render({ lang: "en" }));
  usePaneRoot(view.container as HTMLElement);
  return view;
}
const fieldState = () => ({
  bytes: { accent: bytes(ACCENT), rail: bytes(RAIL), bg: bytes(BG) },
  shown: { accent: shown(ACCENT), rail: shown(RAIL), bg: shown(BG) },
  notReset: { accent: says(msg.notReset(ACCENT)), rail: says(msg.notReset(RAIL)), bg: says(msg.notReset(BG)) },
  notSaved: { accent: says(msg.notSaved(ACCENT)), rail: says(msg.notSaved(RAIL)), bg: says(msg.notSaved(BG)) },
  retry: { accent: retryOf(ACCENT) !== null, rail: retryOf(RAIL) !== null, bg: retryOf(BG) !== null },
  discard: { accent: discardOf(ACCENT) !== null, rail: discardOf(RAIL) !== null, bg: discardOf(BG) !== null },
  statusLine: statusText(),
  unloadWarns: warns(),
});

it("REPLAY OE-1 case 006 steps unchanged (native write after mount, no StorageEvent), then record Reset, Retry and Discard", async () => {
  const accountLock = await hold(accountLifecycleLockName(OWNER_A));
  standalone();
  await flush();
  choose(ACCENT, 295);
  await flush();
  observe("OE-1 after the accent edit", { accent: bytes(ACCENT) });
  seedValue(RAIL, "top");
  seedValue(BG, "peach");
  const resetFrom = mark();
  clickReset(true, "en");
  await flush(24);
  observe("OE-1 after Reset to defaults", { writes: writes(resetFrom), ...fieldState() });
  const retryButton = retryOf(RAIL);
  const retryFrom = mark();
  if (retryButton) { fireEvent.click(retryButton); await flush(); }
  observe("OE-1 after Retry Sidebar position", { retryRendered: retryButton !== null, writes: writes(retryFrom), rail: bytes(RAIL), notReset: says(msg.notReset(RAIL)), statusLine: statusText() });
  const discardButton = discardOf(RAIL);
  const discardFrom = mark();
  if (discardButton) { fireEvent.click(discardButton); await flush(); }
  observe("OE-1 after Discard Sidebar position", { discardRendered: discardButton !== null, writes: writes(discardFrom), rail: bytes(RAIL), shown: shown(RAIL), notReset: says(msg.notReset(RAIL)), statusLine: statusText() });
  await accountLock.release();
});

it("REPLAY OE-2 case 007 steps unchanged up to the Mist choice with only the tone write failing, then record the writes and the bytes at unmount", async () => {
  seedValue(RAIL, "top");
  const view = standalone();
  await flush();
  clickReset(true, "en");
  await flush(24);
  pre(bytes(RAIL) === null, "a committed removal before unmount");
  choose(ACCENT, 295);
  await flush();
  pre(bytes(ACCENT) === "295", "a committed write before unmount");
  const quota = fault({ op: "set", key: BG.key, label: "bg quota" });
  const mistFrom = mark();
  choose(BG, "mist");
  await flush();
  fired(quota, "bg write");
  observe("OE-2 after the Mist choice", { writes: writes(mistFrom), ...fieldState() });
  view.unmount();
  const afterUnmount = mark();
  observe("OE-2 after unmount", { unloadWarns: unload().warned, accent: bytes(ACCENT), rail: bytes(RAIL), bg: bytes(BG), attemptsSinceUnmount: attempts(afterUnmount).length });
});
