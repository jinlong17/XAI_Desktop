/**
 * Mode `fields` (contract r3 section 12): per field ×7 in the production App — latest-choice failure and Retry
 * (pane, and Topbar for language, theme and density), source truth (every section 5 item 2 value and a throwing
 * getItem), Saved truth, targeted Discard and Reload, Discard all, the background dual intent and late completions.
 * Hypotheses H1, H2, H3, H4, H6, H7, H12 and H13.
 *
 * Every business assertion states the fixed-product requirement. It is expected to FAIL at 5cd63ff wherever the
 * tagged hypothesis holds, and must PASS unchanged on the fixed product.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import {
  ACCENT, applied, appliedFor, BG, byId, bytes, choose, chooseTopbar, configureApp, DENSITY, discardAllButton, discardOf, enc, exportButton,
  fault, FIELDS, fired, flashShown, flush, FONT, hold, keyLock, LANG, lockState, locks, mark, mountApp, msg, nativeSet, need, oldButtons,
  others, RAIL, rejections, reloadOf, retryAll, retryOf, routeError, saveAndApply, says, seed, seedValue, setSlider, setup, shown, statusText,
  successShown, teardown, THEME, topbarChecked, topbarStatus, topbarStatusNamed, touches, uiLang, W, warns, writes, writesOn,
  type Field, type FieldId, type Lang, type Value,
  storageSelfCheck as fb002SelfCheck, SELF_CHECK_DELEGATION as FB002_DELEGATION, observe as fb002Observe, pre as fb002Pre,
  observe, appRailPos, statusLine, pre,
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

/** The latest choice each field makes from absent (bgTone "mist" pairs accent 230). */
const CHOICE: Record<FieldId, Value> = { lang: "zh", theme: "dark", density: "compact", accentHue: 230, bgTone: "mist", railPos: "right", fontScale: 1.1 };
/** Committed baselines for Discard and late-completion cases, and the choice made over them. */
const OVER: Record<FieldId, { baseline: Value; choice: Value }> = {
  lang: { baseline: "zh", choice: "en" },
  theme: { baseline: "dark", choice: "system" },
  density: { baseline: "compact", choice: "comfortable" },
  accentHue: { baseline: 295, choice: 230 },
  bgTone: { baseline: "peach", choice: "mist" },
  railPos: { baseline: "top", choice: "right" },
  fontScale: { baseline: 0.9, choice: 1.1 },
};
/** A non-crashing malformed value per field (section 5 item 2), used where the App must stay mounted. */
const MALFORMED: Record<FieldId, string> = { lang: "en", theme: '"neon"', density: '"cozy"', fontScale: "2", accentHue: "abc", railPos: "diagonal", bgTone: "neon" };
const tagOf = (field: Field): string => (field.kind === "registered" ? "H1" : "H2");

/** A pane choice that always reports a change (range inputs ignore a change to the same value). */
async function pick(field: Field, value: Value): Promise<void> {
  if (field === FONT) {
    if (shown(FONT) === value) { setSlider(FONT, value === 1.05 ? 1.1 : 1.05); await flush(); }
    setSlider(FONT, value);
    return;
  }
  choose(field, value);
}
function seedOver(field: Field): void {
  seedValue(field, OVER[field.id].baseline);
  if (field === BG) seedValue(ACCENT, 35);
}

// ---------------------------------------------------------------------------
// Latest-choice failure and Retry, per field (pane surface)
// ---------------------------------------------------------------------------

describe.each(FIELDS.map(field => ({ id: field.id })))("$id", ({ id }) => {
  const field = byId(id);

  it(`${tagOf(field)} ${id}: a failed pane write keeps the latest choice displayed and applied, with failed feedback, Retry, Discard, Export, Topbar status and unload warning; Retry saves exact bytes and claims the truthful saved line`, async () => {
    await mountApp();
    const quota = fault({ op: "set", key: field.key, times: 1, label: `${id} quota` });
    await pick(field, CHOICE[id]);
    await flush();
    fired(quota, `${id} write`);
    const lang = uiLang();
    expect(shown(field, lang), `${tagOf(field)}: ${id} keeps displaying the latest choice after its write failed`).toBe(CHOICE[id]);
    expect(applied(field), `${tagOf(field)}: ${id} keeps applying the latest choice`).toBe(appliedFor(field, CHOICE[id]));
    expect(bytes(field), "the previous (absent) bytes remain after the failed write").toBeNull();
    expect(says(msg.notSaved(field, lang)), `${tagOf(field)}/H12: "${msg.notSaved(field, lang)}" failed feedback`).toBe(true);
    const retry = need(retryOf(field, lang), `H12: ${W[lang].retry(field.label[lang])}`);
    need(discardOf(field, lang), `H12: ${W[lang].discard(field.label[lang])}`);
    need(exportButton(lang), `H12: ${W[lang].exportDraft}`);
    expect(topbarStatusNamed(lang), "§7.2 the Topbar status shows for a settled failure").not.toBeNull();
    expect(warns(), "§7.3 beforeunload warns while the failed choice is unsaved").toBe(true);
    expect(successShown(), "no success line while work is unresolved").toBe(false);
    expect(flashShown(), "H4: no Saved flash").toBe(false);
    const from = mark();
    fireEvent.click(retry);
    await flush();
    expect(writesOn(from, field), "Retry writes exactly the latest bytes once").toEqual([enc(field, CHOICE[id])]);
    expect(bytes(field)).toBe(enc(field, CHOICE[id]));
    expect(shown(field, lang)).toBe(CHOICE[id]);
    expect(retryOf(field, lang), "the matching latest success clears the field's recovery").toBeNull();
    expect(says(msg.notSaved(field, lang)), "the failed feedback clears after the latest success").toBe(false);
    expect(topbarStatus(), "no Topbar status after the latest success").toBeNull();
    expect(warns(), "no beforeunload warning after the latest success").toBe(false);
    expect(statusText(), "H12: a genuine latest success with no outstanding issue shows the truthful saved line").toBe(W[lang].saved);
    expect(rejections, "no unhandled rejection").toEqual([]);
  });

  it(`H12 §5.8 ${id}: targeted Discard makes zero set/remove attempts, rereads only its field and returns the display and the document to the committed value`, async () => {
    seedOver(field);
    await mountApp();
    const quota = fault({ op: "set", key: field.key, label: `${id} quota` });
    await pick(field, OVER[id].choice);
    await flush();
    fired(quota, `${id} write`);
    const lang = uiLang();
    expect(shown(field, lang), `${tagOf(field)}: the failed choice stays displayed`).toBe(OVER[id].choice);
    const discard = need(discardOf(field, lang), `H12: ${W[lang].discard(field.label[lang])}`);
    const from = mark();
    fireEvent.click(discard);
    await flush();
    expect(writes(from), "§5.8 Discard makes zero set/remove attempts").toEqual([]);
    expect(touches(from, others(field)), "§5.8 Discard rereads only its own field").toEqual([]);
    const after = uiLang();
    expect(shown(field, after), "§5.8 the display returns to the committed value").toBe(OVER[id].baseline);
    expect(applied(field), "§5.8 the document returns to the committed value").toBe(appliedFor(field, OVER[id].baseline));
    if (field === LANG) expect(after, "§5.8 for language the whole application returns to the committed language").toBe("zh");
    expect(says(msg.notSaved(field, after)), "the failed feedback is gone").toBe(false);
    expect(topbarStatus(), "no Topbar status after Discard").toBeNull();
    expect(warns(), "no beforeunload warning after Discard").toBe(false);
    expect(bytes(field), "the committed bytes are unchanged").toBe(enc(field, OVER[id].baseline));
  });

  it(`${field.kind === "registered" ? "H7" : "§5.2"} H12 §5.8 ${id}: a source-only issue shows Reload; Reload of repaired bytes makes zero writes, rereads only its field, clears the alert and claims no save`, async () => {
    seed(field, MALFORMED[id]);
    await mountApp();
    expectNoRouteError();
    const lang = uiLang();
    expect(says(msg.unavailable(field, lang)), `${field.kind === "registered" ? "H7" : "§5.2"}/H12: "${msg.unavailable(field, lang)}" source alert`).toBe(true);
    const reload = need(reloadOf(field, lang), `H12: ${W[lang].reload(field.label[lang])}`);
    const repaired = CHOICE[id];
    nativeSet.call(localStorage, field.key, enc(field, repaired));
    const from = mark();
    fireEvent.click(reload);
    await flush();
    expect(writes(from), "§5.8 Reload makes zero set/remove attempts").toEqual([]);
    expect(touches(from, others(field)), "§5.8 Reload rereads only its own field").toEqual([]);
    const after = uiLang();
    expect(shown(field, after), "Reload displays the repaired stored value").toBe(repaired);
    expect(says(msg.unavailable(field, after)), "Reload clears the source alert").toBe(false);
    expect(successShown(), "§5.7 a source-only Reload repair does not by itself claim a save").toBe(false);
  });

  it(`§5.2 ${id}: a valid edit over malformed bytes is a failed draft that never overwrites them; Reload never erases it; Retry is refused again; Discard returns to Reload-only`, async () => {
    seed(field, MALFORMED[id]);
    await mountApp();
    expectNoRouteError();
    await pick(field, CHOICE[id]);
    await flush();
    const lang = uiLang();
    expect(bytes(field), "§5.2: a valid edit never silently overwrites an invalid source").toBe(MALFORMED[id]);
    expect(shown(field, lang), "the valid choice is displayed as the latest draft").toBe(CHOICE[id]);
    expect(says(msg.notSaved(field, lang)), "§5.2 failed feedback").toBe(true);
    const retry = need(retryOf(field, lang), `H12: ${W[lang].retry(field.label[lang])}`);
    need(discardOf(field, lang), `H12: ${W[lang].discard(field.label[lang])}`);
    expect(topbarStatusNamed(lang), "§5.2 Topbar status").not.toBeNull();
    expect(warns(), "§5.2 unload warning").toBe(true);
    const reload = reloadOf(field, lang);
    if (reload) {
      fireEvent.click(reload);
      await flush();
      expect(shown(field, uiLang()), "§5.8 Reload refuses to erase the same field's actual draft").toBe(CHOICE[id]);
    }
    const retried = mark();
    fireEvent.click(retry);
    await flush();
    expect(writesOn(retried, field), "Retry never gains authority over the invalid source").toEqual([]);
    expect(bytes(field)).toBe(MALFORMED[id]);
    const from = mark();
    fireEvent.click(need(discardOf(field, uiLang()), "Discard after the refused Retry"));
    await flush();
    const after = uiLang();
    expect(writes(from), "Discard makes zero set/remove attempts").toEqual([]);
    expect(says(msg.unavailable(field, after)), "Discard returns the field to its source-only alert").toBe(true);
    need(reloadOf(field, after), "Reload-only after Discard");
    expect(retryOf(field, after), "no Retry after Discard").toBeNull();
    expect(bytes(field)).toBe(MALFORMED[id]);
  });

  it(`H8 §5.8 ${id}: a late completion after Discard never revives the discarded choice`, async () => {
    seedOver(field);
    await mountApp();
    const lock = await hold(keyLock(field));
    await pick(field, OVER[id].choice);
    await flush();
    expect(bytes(field), "H8: the held per-key lock keeps the bytes unchanged").toBe(enc(field, OVER[id].baseline));
    const lang = uiLang();
    expect(says(msg.saving(field, lang)), `"${msg.saving(field, lang)}" while held`).toBe(true);
    fireEvent.click(need(discardOf(field, lang), `H12: ${W[lang].discard(field.label[lang])}`));
    await flush();
    expect(shown(field, uiLang()), "Discard returns to the committed value while the write is held").toBe(OVER[id].baseline);
    await lock.release();
    expect(bytes(field), "§5.8 the late completion never writes the discarded choice").toBe(enc(field, OVER[id].baseline));
    expect(shown(field, uiLang()), "§5.8 the late completion never revives the discarded choice").toBe(OVER[id].baseline);
    expect(says(msg.notSaved(field, uiLang())) || says(msg.saving(field, uiLang())), "no feedback for discarded work").toBe(false);
    expect(warns(), "no unload warning after the discarded work").toBe(false);
  });
});

function expectNoRouteError(): void {
  expect(routeError(), "H6/§5.2: no route error boundary").toBeNull();
}

// ---------------------------------------------------------------------------
// Latest-choice failure on the Topbar surface (language, theme, density)
// ---------------------------------------------------------------------------

describe.each([LANG, THEME, DENSITY].map(field => ({ id: field.id })))("Topbar $id", ({ id }) => {
  const field = byId(id);
  it(`H3 ${id}: a failed Topbar choice stays checked and applied, shows the Topbar status and the pane message; Retry saves and removes the status`, async () => {
    await mountApp();
    const quota = fault({ op: "set", key: field.key, times: 1, label: `${id} topbar quota` });
    chooseTopbar(field, CHOICE[id]);
    await flush();
    fired(quota, `${id} Topbar write`);
    const lang = uiLang();
    expect(topbarChecked(field, lang), "H3: the Topbar keeps the choice checked").toBe(CHOICE[id]);
    expect(applied(field), "H3: the document keeps applying the choice").toBe(appliedFor(field, CHOICE[id]));
    expect(bytes(field), "the failed write left the bytes absent").toBeNull();
    expect(topbarStatusNamed(lang), "H3/§7.2: the Topbar status appears for the failed Topbar choice").not.toBeNull();
    expect(shown(field, lang), "§5.4 one sequence per field: the pane shows the Topbar choice").toBe(CHOICE[id]);
    expect(says(msg.notSaved(field, lang)), `H3/H12: "${msg.notSaved(field, lang)}" in the pane`).toBe(true);
    const retry = need(retryOf(field, lang), `H12: ${W[lang].retry(field.label[lang])}`);
    const from = mark();
    fireEvent.click(retry);
    await flush();
    expect(writesOn(from, field), "Retry writes the Topbar choice once").toEqual([enc(field, CHOICE[id])]);
    expect(topbarStatus(), "a successful Retry removes the Topbar status").toBeNull();
    expect(warns(), "no unload warning after the success").toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Source truth: every section 5 item 2 value and a throwing getItem per field
// ---------------------------------------------------------------------------

const H6_VALUES: ReadonlyArray<readonly [FieldId, string]> = [
  ["lang", '"fr"'], ["lang", "null"], ["lang", "1"],
  ["fontScale", "0"], ["fontScale", "-1"], ["fontScale", "null"], ["fontScale", '"big"'], ["fontScale", '"1"'],
  ["accentHue", "Infinity"],
];
const SOURCE_VALUES: ReadonlyArray<readonly [FieldId, string]> = [
  ["lang", '"fr"'], ["lang", "en"], ["lang", ""], ["lang", "null"], ["lang", "1"], ["lang", '"EN"'],
  ["theme", '"neon"'], ["theme", "dark"], ["theme", '"Dark"'], ["theme", "123"],
  ["density", '"cozy"'], ["density", "{}"], ["density", "compact"],
  ["fontScale", "0"], ["fontScale", "-1"], ["fontScale", "null"], ["fontScale", '"big"'], ["fontScale", "2"], ["fontScale", "0.5"], ["fontScale", '"1"'],
  ["accentHue", "abc"], ["accentHue", "Infinity"], ["accentHue", "-5"], ["accentHue", "361"], ["accentHue", "12.5"],
  ["railPos", "diagonal"], ["railPos", "Left"], ["railPos", ""], ["railPos", " left"],
  ["bgTone", "sage"], ["bgTone", "neon"], ["bgTone", "Mist"], ["bgTone", ""],
];
const sourceTag = (id: FieldId, raw: string): string => (H6_VALUES.some(([field, value]) => field === id && value === raw) ? "H6" : byId(id).kind === "registered" ? "H7" : "§5.2");

async function expectSourceOnly(field: Field, raw: string | null, tag: string): Promise<void> {
  expect(routeError(), `${tag}: the stored ${field.key} bytes must not make the /app route render the route error boundary`).toBeNull();
  const lang = uiLang();
  expect(shown(field, lang), `${tag}: an unavailable source displays the default`).toBe(field.defaultValue);
  expect(applied(field), `${tag}: an unavailable source applies the default`).toBe(appliedFor(field, field.defaultValue));
  expect(says(msg.unavailable(field, lang)), `${tag}/H12: "${msg.unavailable(field, lang)}" source alert`).toBe(true);
  const reload = need(reloadOf(field, lang), `H12: ${W[lang].reload(field.label[lang])}`);
  expect(retryOf(field, lang), "source-only: no Retry").toBeNull();
  expect(discardOf(field, lang), "source-only: no Discard").toBeNull();
  expect(exportButton(lang), "source-only: no Export").toBeNull();
  expect(topbarStatus(), "source-only: no Topbar status").toBeNull();
  expect(warns(), "source-only: no unload warning").toBe(false);
  expect(successShown(), "source-only: no saved claim").toBe(false);
  fireEvent.click(reload);
  await flush();
  expect(says(msg.unavailable(field, uiLang())), "Reload of still-unavailable bytes keeps the alert").toBe(true);
  if (raw !== null) expect(bytes(field), "mount and Reload never rewrite, purge or normalize").toBe(raw);
}

it.each(SOURCE_VALUES)("§5.2 %s=%j at load: no route error, the default displayed and applied, a Reload-only source alert, zero writes", async (id, raw) => {
  const field = byId(id);
  seed(field, raw);
  const from = mark();
  await mountApp();
  const root = document.documentElement;
  observe(`source-at-load ${id}=${JSON.stringify(raw)}`, { routeError: routeError(), html: { theme: root.getAttribute("data-theme"), density: root.getAttribute("data-density"), fontSize: root.style.fontSize, accentHue: root.style.getPropertyValue("--accent-hue"), bgTone: root.getAttribute("data-bg-tone"), railPos: root.getAttribute("data-rail-pos") }, appRailPos: appRailPos() });
  await expectSourceOnly(field, raw, sourceTag(id, raw));
  expect(writesOn(from, field), "§5.2 zero set/remove attempts on the field").toEqual([]);
});

it.each(FIELDS.map(field => ({ id: field.id })))("H7 §5.2 $id with a throwing getItem: no route error, the default displayed and applied, a Reload-only source alert, zero writes", async ({ id }) => {
  const field = byId(id);
  seedValue(field, OVER[id].choice);
  const denied = fault({ op: "get", key: field.key, label: `${id} read denied` });
  const from = mark();
  await mountApp();
  fired(denied, `${id} mount read`);
  await expectSourceOnly(field, enc(field, OVER[id].choice), field.kind === "registered" ? "H7" : "§5.2");
  expect(writesOn(from, field), "§5.2 zero set/remove attempts on the field").toEqual([]);
});

// ---------------------------------------------------------------------------
// Saved truth, Discard all, the background dual intent and wording
// ---------------------------------------------------------------------------

it("H12 §5.7 A2.4 after a genuine latest success the always-rendered status line reads 'Appearance settings saved.'", async () => {
  await mountApp();
  choose(ACCENT, 295);
  await flush();
  pre(bytes(ACCENT) === "295", "the accent edit was stored");
  const line = need(statusLine(), "H12 A2.4: the pane status line is always rendered");
  expect({ role: line.getAttribute("role"), text: statusText() }, "H12 §5.7: a genuine latest success shows the truthful saved line").toStrictEqual({ role: "status", text: W.en.saved });
});

it("H4 A2.1 after a failed write the bottom action never shows Saved; no 'Save & apply' control remains", async () => {
  await mountApp();
  const quota = fault({ op: "set", key: ACCENT.key, label: "accent quota" });
  choose(ACCENT, 230);
  await flush();
  fired(quota, "accent write");
  const bottom = saveAndApply() ?? retryAll();
  if (bottom) fireEvent.click(bottom);
  await flush();
  expect(flashShown(), "H4: no 'Saved'/'已保存' after a failed write, whatever the bottom action does").toBe(false);
  expect(successShown(), "H4: no success line while the accent write is unsaved").toBe(false);
  expect(oldButtons().map(element => (element.textContent ?? "").trim()), "A2.1: no 'Save & apply'/'保存生效' control").toEqual([]);
});

it("H1 H2 H12 §5.7 all seven fields unresolved at once: each keeps its choice and message, the count line reads 7, Discard all visits only drafts with zero writes", async () => {
  await mountApp();
  const quotas = FIELDS.map(field => fault({ op: "set", key: field.key, label: `${field.id} quota` }));
  for (const field of FIELDS) { await pick(field, CHOICE[field.id]); await flush(); }
  for (const [index, field] of FIELDS.entries()) fired(quotas[index]!, `${field.id} write`);
  const lang = uiLang();
  for (const field of FIELDS) {
    expect(shown(field, lang), `${tagOf(field)}: ${field.id} keeps its latest choice`).toBe(CHOICE[field.id]);
    expect(says(msg.notSaved(field, lang)), `${tagOf(field)}/H12: "${msg.notSaved(field, lang)}"`).toBe(true);
  }
  expect(statusText(), "A2.4 rule 3: the count line").toBe(W[lang].count(7));
  const discardAll = need(discardAllButton(lang), `H12: ${W[lang].discardAll}`);
  const from = mark();
  fireEvent.click(discardAll);
  await flush();
  expect(writes(from), "§5.8 Discard all makes zero set/remove attempts").toEqual([]);
  const after = uiLang();
  expect(after, "the whole application returns to the committed language").toBe("en");
  for (const field of FIELDS) expect(shown(field, after), `${field.id} returns to its committed default`).toBe(field.defaultValue);
  expect(exportButton(after), "no Export without drafts").toBeNull();
  expect(topbarStatus(), "no Topbar status without drafts").toBeNull();
  expect(warns(), "no unload warning without drafts").toBe(false);
});

it("H12 §5.7 with all seven unresolved, a targeted Retry saves only its field and the count drops to 6", async () => {
  await mountApp();
  const quotas = FIELDS.map(field => fault({ op: "set", key: field.key, label: `${field.id} quota` }));
  for (const field of FIELDS) { await pick(field, CHOICE[field.id]); await flush(); }
  for (const [index, field] of FIELDS.entries()) fired(quotas[index]!, `${field.id} write`);
  const lang = uiLang();
  const retry = need(retryOf(THEME, lang), `H12: ${W[lang].retry(THEME.label[lang])}`);
  quotas[FIELDS.indexOf(THEME)]!.off();
  const from = mark();
  fireEvent.click(retry);
  await flush();
  expect(writes(from).filter(entry => !entry.startsWith(`set:${THEME.key}=`)), "§5.7 a field's success never retries, rewrites or discards a sibling").toEqual([]);
  expect(bytes(THEME)).toBe(enc(THEME, "dark"));
  expect(statusText(), "A2.4 rule 3: the count drops to 6").toBe(W[lang].count(6));
  for (const field of others(THEME)) expect(says(msg.notSaved(field, lang)), `${field.id} stays unresolved`).toBe(true);
});

it("H1 §5.4 background choice with both writes failing keeps both intents; each Retry writes only its own field", async () => {
  await mountApp();
  const toneQuota = fault({ op: "set", key: BG.key, label: "tone quota" });
  const hueQuota = fault({ op: "set", key: ACCENT.key, label: "hue quota" });
  choose(BG, "mist");
  await flush();
  fired(toneQuota, "tone write");
  fired(hueQuota, "hue write");
  expect(shown(BG), "H1: the tone keeps the latest choice").toBe("mist");
  expect(shown(ACCENT), "H1: the accent shows the tone's hue").toBe(230);
  expect({ tone: applied(BG), hue: applied(ACCENT) }, "both are applied").toStrictEqual({ tone: "mist", hue: 230 });
  expect({ tone: says(msg.notSaved(BG)), hue: says(msg.notSaved(ACCENT)) }, "H12: both fields report the failure").toStrictEqual({ tone: true, hue: true });
  toneQuota.off();
  hueQuota.off();
  const first = mark();
  fireEvent.click(need(retryOf(BG), "H12: Retry Background palette"));
  await flush();
  expect(writes(first), "Retry Background palette writes only the tone").toEqual([`set:${BG.key}=mist`]);
  const second = mark();
  fireEvent.click(need(retryOf(ACCENT), "H12: Retry Accent color"));
  await flush();
  expect(writes(second), "Retry Accent color writes only the hue").toEqual([`set:${ACCENT.key}=230`]);
  expect({ tone: bytes(BG), hue: bytes(ACCENT) }).toStrictEqual({ tone: "mist", hue: "230" });
});

it("H1 §5.7 background choice whose tone write fails while the accent write succeeds: only the tone is unresolved", async () => {
  await mountApp();
  const toneQuota = fault({ op: "set", key: BG.key, label: "tone quota" });
  choose(BG, "mist");
  await flush();
  fired(toneQuota, "tone write");
  expect(shown(BG), "H1: the tone keeps the latest choice").toBe("mist");
  expect(bytes(ACCENT), "the accent write committed").toBe("230");
  expect(says(msg.notSaved(BG)), "H12: the tone reports the failure").toBe(true);
  expect(says(msg.notSaved(ACCENT)), "the committed accent has no failure").toBe(false);
});

it("H13 a background choice whose accent write fails while the tone commits keeps the hue displayed with feedback", async () => {
  await mountApp();
  const hueQuota = fault({ op: "set", key: ACCENT.key, label: "hue quota" });
  choose(BG, "mist");
  await flush();
  fired(hueQuota, "hue write");
  expect(bytes(BG), "the tone write committed").toBe("mist");
  expect(shown(BG)).toBe("mist");
  expect(shown(ACCENT), "H13: the accent keeps displaying the tone's hue after its write failed").toBe(230);
  expect(applied(ACCENT), "H13: the accent keeps applying the tone's hue").toBe(230);
  expect(says(msg.notSaved(ACCENT)), "H13/H12: \"Accent color was not saved.\"").toBe(true);
  need(retryOf(ACCENT), "H12: Retry Accent color");
});

it("H8 §5.5 a missing Web Lock capability refuses the write with failed feedback; Retry after restoration saves (theme and railPos)", async () => {
  await mountApp();
  lockState.missing = true;
  choose(THEME, "dark");
  choose(RAIL, "right");
  await flush();
  expect({ theme: bytes(THEME), rail: bytes(RAIL) }, "H8/§5.5: without navigator.locks every write is refused").toStrictEqual({ theme: null, rail: null });
  expect({ theme: shown(THEME), rail: shown(RAIL) }, "the choices stay displayed").toStrictEqual({ theme: "dark", rail: "right" });
  expect({ theme: says(msg.notSaved(THEME)), rail: says(msg.notSaved(RAIL)) }, "H12: failed feedback").toStrictEqual({ theme: true, rail: true });
  lockState.missing = false;
  fireEvent.click(need(retryOf(THEME), "H12: Retry Theme"));
  fireEvent.click(need(retryOf(RAIL), "H12: Retry Sidebar position"));
  await flush();
  expect({ theme: bytes(THEME), rail: bytes(RAIL) }).toStrictEqual({ theme: enc(THEME, "dark"), rail: "right" });
});

it("H8 §5.5 a rejected Web Lock request refuses the write with failed feedback; Retry after the lock is allowed saves (theme and railPos)", async () => {
  await mountApp();
  locks().deny(keyLock(THEME));
  locks().deny(keyLock(RAIL));
  choose(THEME, "dark");
  choose(RAIL, "right");
  await flush();
  expect({ theme: bytes(THEME), rail: bytes(RAIL) }, "H8/§5.5: a rejected per-key lock refuses the write").toStrictEqual({ theme: null, rail: null });
  expect({ theme: says(msg.notSaved(THEME)), rail: says(msg.notSaved(RAIL)) }, "H12: failed feedback").toStrictEqual({ theme: true, rail: true });
  locks().allow(keyLock(THEME));
  locks().allow(keyLock(RAIL));
  fireEvent.click(need(retryOf(THEME), "H12: Retry Theme"));
  fireEvent.click(need(retryOf(RAIL), "H12: Retry Sidebar position"));
  await flush();
  expect({ theme: bytes(THEME), rail: bytes(RAIL) }).toStrictEqual({ theme: enc(THEME, "dark"), rail: "right" });
});

it("H1 H12 §5 wording in Chinese: a failed accent write shows 主题色未保存。 with 重试 主题色 and 放弃 主题色", async () => {
  seedValue(LANG, "zh");
  await mountApp();
  const lang: Lang = uiLang();
  pre_lang(lang);
  const quota = fault({ op: "set", key: ACCENT.key, label: "accent quota" });
  choose(ACCENT, 230, lang);
  await flush();
  fired(quota, "accent write");
  expect(shown(ACCENT, lang), "H1: the accent keeps the latest choice").toBe(230);
  expect(says(W.zh.notSaved("主题色")), "H12: 主题色未保存。").toBe(true);
  need(retryOf(ACCENT, "zh"), "H12: 重试 主题色");
  need(discardOf(ACCENT, "zh"), "H12: 放弃 主题色");
  expect(statusText(), "A2.4 rule 3 in Chinese").toBe(W.zh.count(1));
});

function pre_lang(lang: Lang): void {
  if (lang !== "zh") throw new Error("PRECONDITION: the stored Chinese language is displayed");
}
