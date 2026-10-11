/**
 * Mode `reset` (contract r3 section 12): all of section 6 — the normative confirmation, a declined reset, six
 * verified absences that never write and keep language, verified no-ops for absent keys, per-field removal refusal
 * ×6 with reset drafts and recovery, partial reset, duplicate Reset while pending, invalid and unavailable source
 * refusal without purge, readback uncertainty, conflict, status timing, an unrelated save, the pane-local control,
 * isolation, one run while locked (standalone pane) and one run under a demo scope (production App). Hypothesis H9
 * (and H8/H12 where the before product ignores locks or lacks recovery UI).
 */
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import { accountScope } from "@repo/plugin-web-storage";
import { appearancePane } from "@repo/plugin-web-settings-appearance";
import {
  ACCENT, activate, applied, appliedFor, attempts, BG, bus, bytes, bytesAll, clickReset, configureApp, confirmer, DENSITY, discardOf, enc,
  enabled, external, fault, FIELDS, fired, flush, FONT, go, hold, keyLock, KEYS, LANG, lockAccount, mark, marker, mountApp, mountStandalone,
  msg, need, OLD_RESET_CONFIRM, OWNER_A, observe, others, paneOrNull, pre, productStorageEvents, RAIL, resetButton, resetButtons, RESET_FIELDS,
  retryOf, says, seed, seedValue, setup, shown, sidebarRow, snapshot, statusText, successShown, teardown, THEME, topbarStatus, topbarStatusNamed,
  uiLang, usePaneRoot, W, warns, writes, writesOn, choose, reloadOf,
  type Field, type FieldId, type Value,
  storageSelfCheck as fb002SelfCheck, SELF_CHECK_DELEGATION as FB002_DELEGATION, observe as fb002Observe, pre as fb002Pre,
  statusLine,
} from "./fixture";

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

it("FIXTURE F-B002 this file's storage wrappers record and delegate exactly once, never re-enter Storage and never call accountScope helpers", () => {
  const result = fb002SelfCheck();
  fb002Observe("F-B002 self-check", result);
  fb002Pre(result.nested === 0 && result.tripwire === 0 && JSON.stringify(result.delegatedPerCall) === JSON.stringify(FB002_DELEGATION), `F-B002 self-check: ${JSON.stringify(result)}`);
});

/** Non-default committed values for the six Reset fields; language is stored as "en". */
const SEEDED: Record<Exclude<FieldId, "lang">, Value> = { theme: "dark", density: "compact", fontScale: 1.1, accentHue: 230, railPos: "right", bgTone: "mist" };
function seedAll(langValue: "en" | "zh" = "en"): void {
  seedValue(LANG, langValue);
  for (const field of RESET_FIELDS) seedValue(field, SEEDED[field.id as Exclude<FieldId, "lang">]);
}
const RESET_KEYS = RESET_FIELDS.map(field => field.key);
const expectAbsent = (fields: readonly Field[], tag: string): void => {
  expect(Object.fromEntries(fields.map(field => [field.key, bytes(field)])), tag).toStrictEqual(Object.fromEntries(fields.map(field => [field.key, null])));
};
const defaultsShown = (fields: readonly Field[]): Record<string, Value | string> => Object.fromEntries(fields.map(field => [field.id, shown(field)]));
const defaultsOf = (fields: readonly Field[]): Record<string, Value> => Object.fromEntries(fields.map(field => [field.id, field.defaultValue]));

// ---------------------------------------------------------------------------
// Confirmation, decline and the working removal (positive controls)
// ---------------------------------------------------------------------------

it("H9 §6 the reset confirmation names the six fields and keeps language (EN)", async () => {
  seedAll();
  await mountApp();
  const produced = clickReset(false);
  observe("reset confirmation EN", produced);
  expect(produced[0], "H9 §5: the normative EN confirmation text").toBe(W.en.confirmReset);
});

it("H9 §6 the reset confirmation names the six fields and keeps language (ZH)", async () => {
  seedAll("zh");
  await mountApp();
  pre(uiLang() === "zh", "the stored Chinese language is displayed");
  const produced = clickReset(false, "zh");
  observe("reset confirmation ZH", produced);
  expect(produced[0], "H9 §5: the normative ZH confirmation text").toBe(W.zh.confirmReset);
  expect(produced[0], "the 5cd63ff text is gone").not.toBe(OLD_RESET_CONFIRM.zh);
});

it("PC §6 a declined confirmation makes zero get, set or remove attempts on every key and changes nothing", async () => {
  seedAll();
  await mountApp();
  const displayed = defaultsShown(FIELDS);
  const stored = bytesAll();
  const from = mark();
  clickReset(false);
  expect(attempts(from).map(item => `${item.op}:${item.key}`), "§6 declined: zero get/set/remove attempts until the declined action returns").toEqual([]);
  await flush();
  expect(bytesAll(), "declined: bytes unchanged").toStrictEqual(stored);
  expect(defaultsShown(FIELDS), "declined: display unchanged").toStrictEqual(displayed);
});

it("PC §6 an accepted reset removes the three registered keys", async () => {
  seedAll();
  await mountApp();
  clickReset(true);
  await flush();
  expectAbsent([ACCENT, RAIL, BG], "PC: the registered keys are removed");
});

// ---------------------------------------------------------------------------
// Meaning: six verified absences, never writes, language kept
// ---------------------------------------------------------------------------

it("H9 §6 an accepted reset removes exactly the six keys by verified absence, never writes, keeps language and applies the defaults", async () => {
  seedAll();
  await mountApp();
  const unrelated = snapshot();
  const from = mark();
  clickReset(true);
  await flush(24);
  observe("reset writes", writes(from));
  expect(bytesAll(), "H9 §6: the six keys are absent and language is unchanged").toStrictEqual({ lang: enc(LANG, "en"), theme: null, density: null, fontScale: null, accentHue: null, railPos: null, bgTone: null });
  expect(attempts(from, KEYS, ["set"]).map(item => `${item.key}=${item.value}`), "H9 §6: Reset never writes a default value").toEqual([]);
  expect(attempts(from, RESET_KEYS, ["remove"]).map(item => item.key).sort(), "§6: exactly one removal per seeded key").toEqual([...RESET_KEYS].sort());
  expect(attempts(from, [LANG.key]).map(item => item.op), "§6: Reset never reads, writes or removes xai_pref_lang").toEqual([]);
  expect(defaultsShown(RESET_FIELDS), "§6: the pane displays the six defaults").toStrictEqual(defaultsOf(RESET_FIELDS));
  expect(Object.fromEntries(RESET_FIELDS.map(field => [field.id, applied(field)])), "§6: the document applies the six defaults").toStrictEqual(Object.fromEntries(RESET_FIELDS.map(field => [field.id, appliedFor(field, field.defaultValue)])));
  expect(statusText(), "H9 §6: 'Defaults restored.' after all six verified absences").toBe(W.en.restored);
  expect(snapshot(), "§6: every other key keeps its exact bytes").toStrictEqual(unrelated);
});

it("H9 §6 an already-absent key completes as a verified no-op: no removeItem and no seeded default bytes", async () => {
  await mountApp();
  const from = mark();
  clickReset(true);
  await flush(24);
  expect(attempts(from, RESET_KEYS, ["remove"]).map(item => item.key), "§6: absent keys complete without a removeItem call").toEqual([]);
  expect(attempts(from, KEYS, ["set"]).map(item => `${item.key}=${item.value}`), "§6: no default bytes are seeded").toEqual([]);
  expect(bytesAll(), "everything stays absent").toStrictEqual({ lang: null, theme: null, density: null, fontScale: null, accentHue: null, railPos: null, bgTone: null });
  expect(statusText(), "H9 §6: verified no-ops complete the batch: 'Defaults restored.'").toBe(W.en.restored);
});

it("H9 H12 §6 A2.4 after a successful batch with only the registered keys stored, the always-rendered status line reads 'Defaults restored.'", async () => {
  seedValue(ACCENT, 230);
  seedValue(RAIL, "right");
  seedValue(BG, "mist");
  await mountApp();
  clickReset(true);
  await flush(24);
  pre(bytes(ACCENT) === null && bytes(RAIL) === null && bytes(BG) === null, "the registered removals ran");
  const line = need(statusLine(), "H9 H12 A2.4: the pane status line is always rendered");
  expect({ role: line.getAttribute("role"), text: statusText() }, "H9 §6: 'Defaults restored.' after the six reset operations completed").toStrictEqual({ role: "status", text: W.en.restored });
});

it("H8 H9 §6 'Defaults restored.' appears only after all six complete; a held removal shows its pending message and the default meanwhile", async () => {
  seedAll();
  await mountApp();
  const lock = await hold(keyLock(RAIL));
  clickReset(true);
  await flush();
  expect(bytes(RAIL), "H8: the held per-key lock keeps the rail bytes").toBe("right");
  expect(successShown(), "§6: no success line while a removal is pending").toBe(false);
  expect(shown(RAIL), "§6: the pending reset displays the default").toBe("left");
  expect(applied(RAIL), "§6: the pending reset applies the default").toBe("left");
  expect(says(msg.resetting(RAIL)), `H12: "${msg.resetting(RAIL)}"`).toBe(true);
  expect(topbarStatus(), "§7.2: a pending-only reset shows no Topbar status").toBeNull();
  expect(warns(), "§7.3: pending reset drafts warn on unload").toBe(true);
  await lock.release();
  expect(bytes(RAIL), "the removal completes after release").toBeNull();
  expect(statusText(), "H9 §6: 'Defaults restored.' once all six completed").toBe(W.en.restored);
  expect(warns(), "no warning after the batch completed").toBe(false);
});

// ---------------------------------------------------------------------------
// Per-field removal refusal ×6 with reset drafts and recovery
// ---------------------------------------------------------------------------

it.each(RESET_FIELDS.map(field => ({ id: field.id })))("H9 §6 $id: a refused removal keeps a reset draft that displays the default with feedback and recovery; Retry re-attempts removal only", async ({ id }) => {
  const field = RESET_FIELDS.find(entry => entry.id === id)!;
  seedAll();
  await mountApp();
  const refusal = fault({ op: "remove", key: field.key, label: `${id} remove refused` });
  const from = mark();
  clickReset(true);
  await flush(24);
  expect(writesOn(from, field), `H9 §6: the reset attempts exactly one removal of ${field.key} and never writes it`).toEqual(["<remove>!"]);
  fired(refusal, `${id} removal`);
  expect(bytes(field), "the refused removal kept the bytes").toBe(enc(field, SEEDED[id as Exclude<FieldId, "lang">]));
  expect(shown(field), "H9 §6: the reset draft displays the default").toBe(field.defaultValue);
  expect(applied(field), "H9 §6: the reset draft applies the default").toBe(appliedFor(field, field.defaultValue));
  expect(says(msg.notReset(field)), `H9 H12: "${msg.notReset(field)}"`).toBe(true);
  expectAbsent(others(field, LANG).filter(entry => RESET_FIELDS.includes(entry)), "the other five removals succeeded");
  const retry = need(retryOf(field), `H12: ${W.en.retry(field.label.en)}`);
  need(discardOf(field), `H12: ${W.en.discard(field.label.en)}`);
  expect(topbarStatusNamed("en"), "§7.2: the Topbar status shows for the failed reset").not.toBeNull();
  expect(warns(), "§7.3: the failed reset warns on unload").toBe(true);
  expect(successShown(), "no success line while a reset item failed").toBe(false);
  refusal.off();
  const retried = mark();
  fireEvent.click(retry);
  await flush();
  expect(writesOn(retried, field), "§6: Retry of a reset draft re-attempts removal only and never writes").toEqual(["<remove>"]);
  expect(writes(retried).filter(entry => !entry.endsWith(`:${field.key}`)), "§6: successful fields are not removed again").toEqual([]);
  expect(bytes(field)).toBeNull();
  expect(statusText(), "§6: 'Defaults restored.' once the last item completed").toBe(W.en.restored);
  expect(topbarStatus(), "no Topbar status after recovery").toBeNull();
});

it("H9 §6 partial reset with two refused removals: Retry targets only the unresolved fields, one removal each", async () => {
  seedAll();
  await mountApp();
  const accent = fault({ op: "remove", key: ACCENT.key, label: "accent remove refused" });
  const theme = fault({ op: "remove", key: THEME.key, label: "theme remove refused" });
  const from = mark();
  clickReset(true);
  await flush(24);
  expect({ theme: writesOn(from, THEME), accent: writesOn(from, ACCENT) }, "H9 §6: each refused key had exactly one removal attempt").toStrictEqual({ theme: ["<remove>!"], accent: ["<remove>!"] });
  fired(accent, "accent removal");
  fired(theme, "theme removal");
  expect({ theme: says(msg.notReset(THEME)), accent: says(msg.notReset(ACCENT)) }, "H9 H12: both fields report the failed reset").toStrictEqual({ theme: true, accent: true });
  expect(statusText(), "A2.4 rule 3: two unresolved").toBe(W.en.count(2));
  accent.off();
  theme.off();
  const first = mark();
  fireEvent.click(need(retryOf(ACCENT), "H12: Retry Accent color"));
  await flush();
  expect(writes(first), "Retry Accent color removes only the accent").toEqual([`remove:${ACCENT.key}`]);
  expect(statusText(), "one unresolved").toBe(W.en.count(1));
  const second = mark();
  fireEvent.click(need(retryOf(THEME), "H12: Retry Theme"));
  await flush();
  expect(writes(second), "Retry Theme removes only the theme").toEqual([`remove:${THEME.key}`]);
  expect(statusText(), "'Defaults restored.' after the last item").toBe(W.en.restored);
});

it("H8 §6 a duplicate Reset while the batch is pending enqueues no duplicate removal", async () => {
  seedAll();
  await mountApp();
  const lock = await hold(keyLock(RAIL));
  const from = mark();
  clickReset(true);
  await flush();
  expect(bytes(RAIL), "H8: the held per-key lock keeps the rail bytes").toBe("right");
  const again = resetButtons()[0];
  if (again && enabled(again)) {
    confirmer.answer = true;
    fireEvent.click(again);
    await flush();
  }
  await lock.release();
  expect(writesOn(from, RAIL), "§6: exactly one removal of the pending key across both activations").toEqual(["<remove>"]);
  for (const field of others(RAIL, LANG)) expect(writesOn(from, field).filter(entry => entry === "<remove>").length, `${field.id}: one removal in total`).toBe(1);
  expect(bytes(RAIL)).toBeNull();
});

// ---------------------------------------------------------------------------
// Invalid and unavailable sources, uncertainty, conflict
// ---------------------------------------------------------------------------

it("§6 REL-07 an invalid registered source refuses the reset: the bytes are never purged and the intent is kept until Discard", async () => {
  seedAll();
  seed(RAIL, "diagonal");
  await mountApp();
  clickReset(true);
  await flush(24);
  expect(bytes(RAIL), "§6: Reset is never authority to purge malformed bytes").toBe("diagonal");
  expect(says(msg.notReset(RAIL)), `§6 H12: "${msg.notReset(RAIL)}"`).toBe(true);
  const retried = mark();
  fireEvent.click(need(retryOf(RAIL), "H12: Retry Sidebar position"));
  await flush();
  expect(writesOn(retried, RAIL), "Retry is refused again without writing").toEqual([]);
  expect(bytes(RAIL)).toBe("diagonal");
  fireEvent.click(need(discardOf(RAIL), "H12: Discard Sidebar position"));
  await flush();
  expect(says(msg.unavailable(RAIL)), "Discard returns to the source-only alert").toBe(true);
  need(reloadOf(RAIL), "H12: Reload Sidebar position");
  expect(bytes(RAIL)).toBe("diagonal");
});

it("§6 REL-07 an invalid root source refuses the reset without writing or purging", async () => {
  seedAll();
  seed(THEME, '"neon"');
  await mountApp();
  const from = mark();
  clickReset(true);
  await flush(24);
  expect(writesOn(from, THEME), "§6: an invalid root source is neither rewritten nor removed").toEqual([]);
  expect(bytes(THEME)).toBe('"neon"');
  expect(says(msg.notReset(THEME)), `§6 H12: "${msg.notReset(THEME)}"`).toBe(true);
});

it("§6 an unavailable source (throwing getItem) refuses the reset and keeps the intent; nothing is removed", async () => {
  seedAll();
  const denied = fault({ op: "get", key: RAIL.key, label: "rail read denied" });
  await mountApp();
  fired(denied, "rail mount read");
  const from = mark();
  clickReset(true);
  await flush(24);
  expect(writesOn(from, RAIL), "§6: an unreadable source is never removed").toEqual([]);
  expect(bytes(RAIL)).toBe("right");
  expect(says(msg.notReset(RAIL)), `§6 H12: "${msg.notReset(RAIL)}"`).toBe(true);
  denied.off();
});

it("§6 a removal whose readback is denied is uncertain; Retry verifies absence with exactly one total removal", async () => {
  seedAll();
  await mountApp();
  const readback = fault({ op: "get", key: RAIL.key, times: 1, after: { op: "remove", key: RAIL.key }, label: "rail readback denied" });
  const from = mark();
  clickReset(true);
  await flush(24);
  fired(readback, "rail readback");
  expect(says(msg.notReset(RAIL)), `§6 H12: the uncertain removal reports "${msg.notReset(RAIL)}"`).toBe(true);
  expect(successShown(), "no success line while the removal is uncertain").toBe(false);
  fireEvent.click(need(retryOf(RAIL), "H12: Retry Sidebar position"));
  await flush();
  expect(writesOn(from, RAIL), "§6: exactly one total removal reconciles the uncertainty").toEqual(["<remove>"]);
  expect(bytes(RAIL)).toBeNull();
  expect(says(msg.notReset(RAIL)), "the reconciled removal clears the failure").toBe(false);
  expect(statusText(), "'Defaults restored.' after the reconciliation").toBe(W.en.restored);
});

it("H8 §6 an external replacement during a held reset is a preserved conflict; Retry never overwrites it", async () => {
  seedAll();
  await mountApp();
  const lock = await hold(keyLock(RAIL));
  clickReset(true);
  await flush();
  expect(bytes(RAIL), "H8: the held per-key lock keeps the rail bytes").toBe("right");
  await external(RAIL.key, "top");
  await lock.release();
  expect(bytes(RAIL), "§6: the external bytes are preserved").toBe("top");
  expect(says(msg.notReset(RAIL)), "§6: the reset draft is kept").toBe(true);
  const retried = mark();
  fireEvent.click(need(retryOf(RAIL), "H12: Retry Sidebar position"));
  await flush();
  expect(writesOn(retried, RAIL), "§6: Retry never gains authority to overwrite").toEqual([]);
  expect(bytes(RAIL)).toBe("top");
});

it("H9 §6 §5.7 an unrelated field still saves while reset recovery is blocked", async () => {
  seedAll();
  await mountApp();
  const refusal = fault({ op: "remove", key: RAIL.key, label: "rail remove refused" });
  clickReset(true);
  await flush(24);
  fired(refusal, "rail removal");
  expect(says(msg.notReset(RAIL)), `H9 H12: "${msg.notReset(RAIL)}"`).toBe(true);
  choose(ACCENT, 295);
  await flush();
  expect(bytes(ACCENT), "§6: an unrelated field still saves").toBe("295");
  expect(says(msg.notReset(RAIL)), "the blocked reset item stays unresolved").toBe(true);
});

it("H9 §5.7 one field's set failing while another field's reset succeeds (language set, theme reset)", async () => {
  seedAll();
  await mountApp();
  clickReset(true);
  await flush(24);
  expect(bytes(THEME), "H9: the theme reset removes the key").toBeNull();
  const quota = fault({ op: "set", key: LANG.key, label: "lang quota" });
  choose(LANG, "zh");
  await flush();
  fired(quota, "lang write");
  expect(says(msg.notSaved(LANG, "zh")), "H2 H12: the language set failure is reported").toBe(true);
  expect(says(msg.notReset(THEME, "zh")), "the successful theme reset has no failure").toBe(false);
});

it("H9 §5.7 one field's reset failing while another field's set succeeds (rail reset, language set)", async () => {
  seedAll();
  await mountApp();
  const refusal = fault({ op: "remove", key: RAIL.key, label: "rail remove refused" });
  clickReset(true);
  await flush(24);
  fired(refusal, "rail removal");
  choose(LANG, "zh");
  await flush();
  expect(bytes(LANG), "the language set succeeds").toBe(enc(LANG, "zh"));
  expect(says(msg.notReset(RAIL, "zh")), `H9 H12: "${msg.notReset(RAIL, "zh")}"`).toBe(true);
  need(retryOf(RAIL, "zh"), "H12: 重试 侧栏位置");
});

it("H9 §6 repeating an unchanged failed reset keeps its refusal and never rebases", async () => {
  seedAll();
  await mountApp();
  const refusal = fault({ op: "remove", key: ACCENT.key, label: "accent remove refused" });
  clickReset(true);
  await flush(24);
  fired(refusal, "accent removal");
  expect(says(msg.notReset(ACCENT)), `H9 H12: "${msg.notReset(ACCENT)}"`).toBe(true);
  const from = mark();
  fireEvent.click(need(retryOf(ACCENT), "H12: Retry Accent color"));
  await flush();
  fireEvent.click(need(retryOf(ACCENT), "Retry Accent color again"));
  await flush();
  expect(writesOn(from, ACCENT), "§6: each Retry is one removal attempt and never a write").toEqual(["<remove>!", "<remove>!"]);
  expect(bytes(ACCENT)).toBe("230");
  expect(says(msg.notReset(ACCENT)), "the refusal is kept").toBe(true);
});

it("H9 §6 a clean completed batch may receive a fresh reset; an intervening edit is a new intent", async () => {
  seedAll();
  await mountApp();
  clickReset(true);
  await flush(24);
  expect(bytes(THEME), "H9: the first batch removes the theme").toBeNull();
  choose(THEME, "dark");
  await flush();
  expect(bytes(THEME), "the intervening edit is stored").toBe(enc(THEME, "dark"));
  const from = mark();
  clickReset(true);
  await flush(24);
  expect(writesOn(from, THEME), "the fresh reset removes the new value once").toEqual(["<remove>"]);
  expect(bytes(THEME)).toBeNull();
  expect(statusText(), "'Defaults restored.' after the fresh batch").toBe(W.en.restored);
});

it("H8 §6 an admitted batch continues while the pane is unmounted; no success claim on remount", async () => {
  seedAll();
  const app = await mountApp();
  const lock = await hold(keyLock(RAIL));
  clickReset(true);
  await flush();
  expect(bytes(RAIL), "H8: the held per-key lock keeps the rail bytes").toBe("right");
  fireEvent.click(sidebarRow("About"));
  await flush();
  pre(paneOrNull() === null, "the Appearance pane unmounted");
  await lock.release();
  expect(bytes(RAIL), "§6: the batch continued while the pane was unmounted").toBeNull();
  await go(app, "/app/settings/appearance");
  expect(says(msg.notReset(RAIL)) || says(msg.resetting(RAIL)), "no leftover draft after completion").toBe(false);
  expect(successShown(), "§5.7: a batch that completed while unmounted makes no success claim on remount").toBe(false);
  expect(topbarStatus(), "no Topbar status").toBeNull();
});

// ---------------------------------------------------------------------------
// Control, isolation, locked and demo scopes, wording
// ---------------------------------------------------------------------------

it("H9 §6 A2.8 the Reset control is pane-local (data-testid appearance-reset-defaults) and the shared footer is gone", async () => {
  await mountApp();
  const control = resetButton();
  const root = paneOrNull();
  pre(root, "pane mounted");
  expect({
    testid: control.getAttribute("data-testid"),
    footer: root.querySelectorAll(".pane-footer, .pane-save, [data-testid='settings-footer-reset'], [data-testid='settings-footer-save']").length,
  }, "§6 A2.8: pane-local Reset, no SettingsFooter, no .pane-footer/.pane-save").toStrictEqual({ testid: "appearance-reset-defaults", footer: 0 });
});

it("PC §6 §10.7 an accepted reset leaves every key other than the seven byte-identical", async () => {
  seedAll();
  nativeSetUnrelated();
  await mountApp();
  const before = snapshot();
  clickReset(true);
  await flush(24);
  expect(snapshot(), "§10.7: every other key keeps its exact bytes").toStrictEqual(before);
});

function nativeSetUnrelated(): void {
  for (const [key, value] of [["xai_pref_features_tasks", "false"], ["xai_pet_id", "pip"], ["xai_pet_pos", JSON.stringify({ x: 300, y: 200 })], ["xai_rail_order", JSON.stringify(["tasks", "ai"])], ["xai_pref_sticky_color", "sky"]] as const) {
    localStorage.setItem(key, value);
  }
}

it("§6 §10.7 an accepted reset dispatches zero StorageEvents and zero web:settings:preference-changed events", async () => {
  seedAll();
  await mountApp();
  const events = productStorageEvents().length;
  clickReset(true);
  await flush(24);
  expect({ storageEvents: productStorageEvents().length - events, preferenceChanged: bus.preference.map(entry => entry.key) }, "§10.7: Reset broadcasts nothing").toStrictEqual({ storageEvents: 0, preferenceChanged: [] });
});

it("H9 §6 while the account scope is locked the batch still removes the six keys (standalone pane, no account gate)", async () => {
  seedAll();
  lockAccount("appearance-sol-locked");
  const view = mountStandalone(appearancePane.render({ lang: "en" }));
  usePaneRoot(view.container as HTMLElement);
  await flush();
  pre(accountScope.capture().kind === "locked", "the scope stays locked");
  clickReset(true, "en");
  await flush(24);
  expect(bytesAll(), "H9 §6: six verified absences while locked; language kept").toStrictEqual({ lang: enc(LANG, "en"), theme: null, density: null, fontScale: null, accentHue: null, railPos: null, bgTone: null });
});

it("H9 §6 under a demo scope the production App batch removes the six keys by verified absence and restores defaults", async () => {
  vi.stubEnv("VITE_WEB_AUTH_MODE", "mock-authenticated");
  marker(OWNER_A, "g1", true);
  activate(OWNER_A, "g1", true);
  seedAll();
  await mountApp();
  pre(accountScope.capture().kind === "demo" && accountScope.capture().accountId === OWNER_A, "the production AccountDataGate activated the demo scope");
  pre(paneOrNull() !== null, "the pane renders under the demo scope");
  const from = mark();
  clickReset(true);
  await flush(24);
  expect(bytesAll(), "H9 §6: six verified absences under a demo scope; language kept").toStrictEqual({ lang: enc(LANG, "en"), theme: null, density: null, fontScale: null, accentHue: null, railPos: null, bgTone: null });
  expect(attempts(from, KEYS, ["set"]).length, "never writes").toBe(0);
  expect(statusText(), "'Defaults restored.' under a demo scope").toBe(W.en.restored);
});

it("H9 H12 §5 wording in Chinese: a refused rail removal shows 侧栏位置未恢复默认。 with 重试 侧栏位置", async () => {
  seedAll("zh");
  await mountApp();
  pre(uiLang() === "zh", "the stored Chinese language is displayed");
  const refusal = fault({ op: "remove", key: RAIL.key, label: "rail remove refused" });
  clickReset(true, "zh");
  await flush(24);
  fired(refusal, "rail removal");
  expect(shown(RAIL, "zh"), "H9: the reset draft displays the default").toBe("left");
  expect(says(W.zh.notReset("侧栏位置")), "H9 H12: 侧栏位置未恢复默认。").toBe(true);
  need(retryOf(RAIL, "zh"), "H12: 重试 侧栏位置");
  expect(statusText(), "A2.4 rule 3 in Chinese").toBe(W.zh.count(1));
});

// Keep the imported helpers referenced (they document the vocabulary shared with the other modes).
void DENSITY; void FONT; void BG;
