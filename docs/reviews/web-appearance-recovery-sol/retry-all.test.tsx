/**
 * Mode `retry-all` (contract r3 section 12): the production `App` with only the auth-session hook substituted,
 * driven through the pane and the Topbar.
 *
 * At 5cd63ff: H15 (today's bottom "Save & apply" after denied writes on each surface) and H17 (the same button in
 * the clean state), each recorded with attempt counters, bytes and the flash, plus the before-only positive control
 * that the harness drives today's button. On both products (H16, H17): section 5 item 9 and A2.2–A2.7 — render and
 * enabled states (the disabled state in the clean, pending-only, source-only and open-pass states), the clean-state
 * status line, scope and exclusions, one write or remove per member and none elsewhere, no duplicates, exact-draft
 * attribution and supersession, late completions, every A2.4 line in EN and ZH with its precedence, A2.5 focus, and
 * the section 5 item 9 orderings including the controller-ruling-5 cases `fu2-retry-all-theme` and
 * `fu2-retry-all-railPos`, which must FAIL at their step 1 at 5cd63ff.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent } from "@testing-library/react";
import { accountScope } from "@repo/plugin-web-storage";
import {
  ACCENT, applied, appliedFor, attempts, BG, bytes, bytesAll, choose, chooseTopbar, clickReset, configureApp, confirmer, DENSITY, discardAllButton,
  discardOf, download, enc, envelope, expectSingleDownload, exportButton, external, fault, FIELDS, fired, flashShown, flush, FONT, hold,
  isDisabledState, isEnabledState, keyLock, KEYS, LANG, locks, mark, mountApp, msg, nativeSet, need, observe, oldButtons, OWNER_A, pre, RAIL,
  redirects, resetButton, RESET_FIELDS, retryAll, retryAllState, retryOf, RULING5, runRuling5, saveAndApply, says, seed, seedValue, SET, setSlider,
  setup, shown, signOut, slider, statusLine, statusText, stubLocation, successShown, teardown, THEME, topbarChecked, topbarStatus, topbarStatusNamed,
  uiLang, unload, user, W, wait, warns, writes, writesOn,
  type Attempt, type Field, type FieldId, type Lang, type Value,
  storageSelfCheck as fb002SelfCheck, SELF_CHECK_DELEGATION as FB002_DELEGATION, observe as fb002Observe, pre as fb002Pre,
} from "./fixture";

const auth = vi.hoisted(() => {
  const state = { calls: 0, cleared: 0, clientSignOuts: 0 };
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
    clearSessionStorage: async () => { state.cleared += 1; },
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
beforeEach(() => {
  setup();
  auth.value.client = null;
  auth.value.coordinator = undefined;
  auth.state.clientSignOuts = 0;
});
afterEach(() => { teardown(); });

it("FIXTURE F-B002 this file's storage wrappers record and delegate exactly once, never re-enter Storage and never call accountScope helpers", () => {
  const result = fb002SelfCheck();
  fb002Observe("F-B002 self-check", result);
  fb002Pre(result.nested === 0 && result.tripwire === 0 && JSON.stringify(result.delegatedPerCall) === JSON.stringify(FB002_DELEGATION), `F-B002 self-check: ${JSON.stringify(result)}`);
});

const setRemove = (from: number): string[] => attempts(from, undefined, ["set", "remove"]).map((item: Attempt) => (item.op === "set" ? `set:${item.key}=${item.value}` : `remove:${item.key}`) + (item.threw ? "!threw" : ""));
const RA = (lang: Lang = uiLang()): HTMLButtonElement => need(retryAll(lang), "H16/H17: Retry all is always rendered while the pane is mounted (A2.2)");
async function failPane(field: Field, value: Value): Promise<ReturnType<typeof fault>> {
  const quota = fault({ op: "set", key: field.key, label: `${field.id} quota` });
  if (field === FONT) setSlider(FONT, value);
  else choose(field, value);
  await flush();
  fired(quota, `${field.id} write`);
  return quota;
}
async function failTopbar(field: Field, value: Value): Promise<ReturnType<typeof fault>> {
  const quota = fault({ op: "set", key: field.key, label: `${field.id} Topbar quota` });
  chooseTopbar(field, value);
  await flush();
  fired(quota, `${field.id} Topbar write`);
  return quota;
}
const passOpen = (lang: Lang = uiLang()): boolean => statusText() === W[lang].retrying;

// ---------------------------------------------------------------------------
// At 5cd63ff: today's bottom button (H15, H17) and the before-only positive control
// ---------------------------------------------------------------------------

it("PC-BEFORE §12 with no fault the harness drives the current bottom button: at 5cd63ff 'Save & apply' writes the four root keys with today's exact bytes; after the caller it is replaced by Retry all", async () => {
  await mountApp();
  const old = saveAndApply("en");
  if (old) {
    const from = mark();
    fireEvent.click(old);
    await flush();
    observe("PC-BEFORE Save & apply", { writes: setRemove(from), flash: flashShown() });
    expect(setRemove(from).sort(), "PC: 'Save & apply' writes the four root keys with today's bytes").toEqual([`set:${LANG.key}="en"`, `set:${THEME.key}="light"`, `set:${DENSITY.key}="comfortable"`, `set:${FONT.key}=1`].sort());
    expect(bytesAll(), "PC: exactly the four root keys gained today's bytes").toStrictEqual({ lang: '"en"', theme: '"light"', density: '"comfortable"', fontScale: "1", accentHue: null, railPos: null, bgTone: null });
    expect(flashShown(), "PC: the button is operable (it flashes)").toBe(true);
  } else {
    expect(oldButtons(), "A2.1: no 'Save & apply' control remains").toEqual([]);
    need(retryAll("en"), "A2: Retry all replaces it");
  }
});

describe.each(["en", "zh"] as const)("H17 %s", lang => {
  it(`H17 A2.2 ${lang}: in the clean state the bottom primary action is a disabled 'nothing to retry' Retry all; one activation makes zero attempts, changes no bytes and never flashes`, async () => {
    if (lang === "zh") seedValue(LANG, "zh");
    await mountApp();
    pre(uiLang() === lang, `the UI is in ${lang}`);
    const bottom = need(retryAll(lang) ?? saveAndApply(lang), "the bottom primary action exists");
    const label = (bottom.textContent ?? "").trim();
    const ariaDisabled = bottom.getAttribute("aria-disabled");
    const disabledAttr = bottom.hasAttribute("disabled");
    const before = bytesAll();
    const from = mark();
    fireEvent.click(bottom);
    await flush();
    const observation: Record<string, unknown> = { label, ariaDisabled, disabledAttr, writes: setRemove(from), bytes: bytesAll(), flashImmediately: flashShown() };
    await wait(1900);
    observation.flashAfter1900ms = flashShown();
    observe(`H17 ${lang} clean-state activation`, observation);
    expect(observation, "H17 A2.2: a disabled Retry all; zero storage attempts; no bytes change; no 'Saved' flash").toStrictEqual({ label: W[lang].retryAll, ariaDisabled: "true", disabledAttr: false, writes: [], bytes: before, flashImmediately: false, flashAfter1900ms: false });
  });
});

describe.each(["en", "zh"] as const)("H15 %s", lang => {
  it(`H15 ${lang}: after denied writes on each surface the bottom action re-attempts exactly the failed accent (pane) and theme (Topbar) once each, rewrites nothing else, honours locks and never flashes`, async () => {
    if (lang === "zh") seedValue(LANG, "zh");
    await mountApp();
    pre(uiLang() === lang, `the UI is in ${lang}`);
    const accentQuota = await failPane(ACCENT, 230);
    const themeQuota = await failTopbar(THEME, "dark");
    accentQuota.off();
    themeQuota.off();
    const fontDenied = fault({ op: "set", key: FONT.key, label: "font denied (never failed before)" });
    const densityLock = await hold(keyLock(DENSITY));
    const bottom = need(retryAll(lang) ?? saveAndApply(lang), "the bottom primary action exists");
    const label = (bottom.textContent ?? "").trim();
    const from = mark();
    fireEvent.click(bottom);
    await flush();
    const observation: Record<string, unknown> = {
      label,
      writesByKey: Object.fromEntries(FIELDS.map(field => [field.id, writesOn(from, field)])),
      themeDisplayed: { pane: shown(THEME, lang), topbar: topbarChecked(THEME, lang), doc: applied(THEME) },
      flashImmediately: flashShown(),
    };
    await wait(1900);
    observation.flashAfter1900ms = flashShown();
    observe(`H15 ${lang} activation after denied writes`, { ...observation, fontFaultFired: fontDenied.fired });
    await densityLock.release();
    expect(observation, "H15: one attempt per failed field (accent, theme), nothing else, no lock ignored, the Topbar choice kept, no flash").toStrictEqual({
      label: W[lang].retryAll,
      writesByKey: { lang: [], theme: [JSON.stringify("dark")], density: [], accentHue: ["230"], bgTone: [], railPos: [], fontScale: [] },
      themeDisplayed: { pane: "dark", topbar: "dark", doc: "dark" },
      flashImmediately: false,
      flashAfter1900ms: false,
    });
  });
});

// ---------------------------------------------------------------------------
// A2.2: render and enabled states; A2.1 labels and description
// ---------------------------------------------------------------------------

describe.each(["clean", "pending-only", "source-only"] as const)("A2.2 disabled %s", state => {
  it(`H16 H17 A2.2 ${state}: Retry all is rendered with aria-disabled="true", no disabled attribute, a Tab stop, no aria-describedby; click, Enter and Space make zero operations and keep focus`, async () => {
    if (state === "source-only") seed(RAIL, "diagonal");
    await mountApp();
    let held: Awaited<ReturnType<typeof hold>> | null = null;
    if (state === "pending-only") {
      held = await hold(keyLock(THEME));
      choose(THEME, "dark");
      await flush();
    }
    const button = RA();
    expect(retryAllState(button), "A2.2: the disabled state attributes").toMatchObject({ ariaDisabled: "true", disabledAttr: false, describedBy: null, type: "button", testid: "appearance-retry-all", inert: false, hidden: false });
    expect(button.tabIndex, "A2.2: never tabindex=-1").toBeGreaterThanOrEqual(0);
    const u = user();
    act(() => { slider(FONT).focus(); });
    let reached = false;
    for (let index = 0; index < 40 && !reached; index += 1) {
      await u.tab();
      reached = document.activeElement === button;
    }
    expect(reached, "A2.2: Retry all is a Tab stop while disabled").toBe(true);
    const line = statusText();
    const from = mark();
    const lockFrom = locks().log.length;
    await u.keyboard("{Enter}");
    await flush();
    expect(document.activeElement, "A2.2: Enter keeps focus").toBe(button);
    await u.keyboard(" ");
    await flush();
    expect(document.activeElement, "A2.2: Space keeps focus").toBe(button);
    await u.click(button);
    await flush();
    expect(writes(from), "A2.2: a disabled activation makes zero set/remove attempts on every key").toEqual([]);
    expect(locks().productRequests(undefined, lockFrom), "A2.2: a disabled activation starts zero operations").toBe(0);
    expect(statusText(), "A2.2: no state change").toBe(line);
    expect([W.en.retrying, W.en.count(1), W.en.exportFailed].includes(statusText() ?? ""), "§5.9: the status line shows no failure or in-flight line").toBe(false);
    expect(isDisabledState(button), "still disabled").toBe(true);
    if (held) await held.release();
  });
});

it("H16 A2.2 §5.9 the clean-state status line is empty and the disabled button never references it", async () => {
  await mountApp();
  const button = RA();
  const line = need(statusLine(), "A2.4: the status line is always rendered");
  expect({ role: line.getAttribute("role"), text: statusText(), describedBy: button.getAttribute("aria-describedby") }, "§5.9: clean-state status line").toStrictEqual({ role: "status", text: "", describedBy: null });
});

it("H16 A2.2 A2.4 one failed field enables Retry all, described by the count line (EN)", async () => {
  await mountApp();
  await failPane(ACCENT, 230);
  const button = RA();
  expect(isEnabledState(button), "A2.2: enabled when E is non-empty").toBe(true);
  expect(retryAllState(button).describedByStatus, "A2.1: described by the status line while enabled").toBe(true);
  expect(statusText(), "A2.4 rule 3").toBe(W.en.count(1));
});

it("H16 A2.4 one failed field in Chinese: 1 项外观更改未保存。 and the label 全部重试", async () => {
  seedValue(LANG, "zh");
  await mountApp();
  pre(uiLang() === "zh", "the UI is in zh");
  await failPane(ACCENT, 230);
  const button = RA("zh");
  expect(isEnabledState(button)).toBe(true);
  expect(statusText(), "A2.4 rule 3 (ZH)").toBe(W.zh.count(1));
});

it("H16 A2.2 A2.4 all seven failed fields enable Retry all with the count 7; one activation attempts each once in display order", async () => {
  await mountApp();
  const choices: Record<FieldId, Value> = { lang: "zh", theme: "dark", density: "compact", accentHue: 230, bgTone: "mist", railPos: "right", fontScale: 1.1 };
  const quotas = [];
  for (const field of FIELDS) quotas.push(await failPane(field, choices[field.id]));
  const lang = uiLang();
  const button = RA(lang);
  expect(isEnabledState(button)).toBe(true);
  expect(statusText(), "A2.4 rule 3: seven").toBe(W[lang].count(7));
  for (const quota of quotas) quota.off();
  const from = mark();
  fireEvent.click(button);
  await flush();
  expect(attempts(from, undefined, ["set", "remove"]).map(item => item.key), "A2.3: exactly one write per member, in display order").toEqual(FIELDS.map(field => field.key));
  expect(statusText(), "A2.4 rule 4 after the full success").toBe(W[uiLang()].saved);
  expect(isDisabledState(button), "A2.2: disabled after the full success").toBe(true);
});

// ---------------------------------------------------------------------------
// A2.3: scope, exclusions and exactly one attempt per member
// ---------------------------------------------------------------------------

it("H16 A2.3 set drafts from the pane and the Topbar: exactly one write each in display order, none elsewhere; then disabled with no description", async () => {
  await mountApp();
  const accentQuota = await failPane(ACCENT, 230);
  const themeQuota = await failTopbar(THEME, "dark");
  accentQuota.off();
  themeQuota.off();
  const button = RA();
  const from = mark();
  fireEvent.click(button);
  await flush();
  expect(setRemove(from), "A2.3: one write per member (Theme before Accent color), none elsewhere").toEqual([`set:${THEME.key}="dark"`, `set:${ACCENT.key}=230`]);
  expect(statusText(), "A2.4 rule 4").toBe(W.en.saved);
  expect(retryAllState(button), "A2.2: disabled with no description after the full success").toMatchObject({ ariaDisabled: "true", disabledAttr: false, describedBy: null });
  expect(topbarStatus(), "§7.2: no Topbar status after the full success").toBeNull();
  expect(warns(), "§7.3: beforeunload removed after the full success").toBe(false);
});

it("H13 H16 A2.3 a background choice with both writes failing is two members; with only the tone failing it is one", async () => {
  await mountApp();
  const tone = fault({ op: "set", key: BG.key, label: "tone quota" });
  const hue = fault({ op: "set", key: ACCENT.key, label: "hue quota" });
  choose(BG, "mist");
  await flush();
  fired(tone, "tone write");
  fired(hue, "hue write");
  tone.off();
  hue.off();
  const from = mark();
  fireEvent.click(RA());
  await flush();
  expect(setRemove(from), "A2.3: each field of the background choice independently, one write each").toEqual([`set:${ACCENT.key}=230`, `set:${BG.key}=mist`]);
  const toneOnly = fault({ op: "set", key: BG.key, label: "tone only" });
  choose(BG, "peach");
  await flush();
  fired(toneOnly, "tone-only write");
  toneOnly.off();
  const second = mark();
  fireEvent.click(RA());
  await flush();
  expect(setRemove(second), "A2.3: only the failed tone").toEqual([`set:${BG.key}=peach`]);
});

it("H16 A2.3 a slider stream's latest value queued behind a failed predecessor: one attempt per activation while denied; then the predecessor once and the latest as its own attempt", async () => {
  await mountApp();
  const quota = fault({ op: "set", key: FONT.key, label: "font quota" });
  setSlider(FONT, 0.9);
  setSlider(FONT, 0.95);
  setSlider(FONT, 1.05);
  await flush();
  fired(quota, "font write");
  expect(shown(FONT), "the latest value stays displayed").toBe(1.05);
  const button = RA();
  const denied = mark();
  fireEvent.click(button);
  await flush();
  expect(writesOn(denied, FONT).length, "A2.3: exactly one setItem on the member's key while the fault is armed").toBe(1);
  expect(isEnabledState(button), "the member failed again: enabled").toBe(true);
  quota.off();
  const from = mark();
  fireEvent.click(button);
  await flush();
  expect(writesOn(from, FONT).at(-1), "A2.3: the latest proceeds as its own first attempt; final bytes equal the last value").toBe("1.05");
  expect(bytes(FONT)).toBe("1.05");
  expect(statusText()).toBe(W.en.saved);
});

it("H9 H16 A2.3 §6 failed Reset items: one removal each, never a write; 'Defaults restored.' after the reset-only pass", async () => {
  for (const field of RESET_FIELDS) seedValue(field, ({ theme: "dark", density: "compact", fontScale: 1.1, accentHue: 230, railPos: "right", bgTone: "mist" } as Record<string, Value>)[field.id]!);
  await mountApp();
  const rail = fault({ op: "remove", key: RAIL.key, label: "rail remove refused" });
  const accent = fault({ op: "remove", key: ACCENT.key, label: "accent remove refused" });
  const resetFrom = mark();
  clickReset(true);
  await flush(24);
  expect({ rail: writesOn(resetFrom, RAIL), accent: writesOn(resetFrom, ACCENT) }, "H9 §6: one refused removal each").toStrictEqual({ rail: ["<remove>!"], accent: ["<remove>!"] });
  fired(rail, "rail removal");
  fired(accent, "accent removal");
  rail.off();
  accent.off();
  const from = mark();
  fireEvent.click(RA());
  await flush();
  expect(setRemove(from), "A2.3 §6: one removal per failed item, never a write").toEqual([`remove:${ACCENT.key}`, `remove:${RAIL.key}`]);
  expect(statusText(), "A2.4 rule 4: every succeeded member was a reset intent").toBe(W.en.restored);
});

it("H16 A2.3 a valid edit over malformed bytes is refused again and kept; a conflict is kept and never overwritten", async () => {
  seed(RAIL, "diagonal");
  seedValue(THEME, "dark");
  await mountApp();
  choose(RAIL, "right");
  const lock = await hold(keyLock(THEME));
  choose(THEME, "system");
  await flush();
  nativeSet.call(localStorage, THEME.key, JSON.stringify("light"));
  await lock.release();
  pre(bytes(THEME) === JSON.stringify("light"), "the external replacement is present");
  const button = RA();
  expect(isEnabledState(button), "A2.3: the refused edit and the conflict are eligible").toBe(true);
  const from = mark();
  fireEvent.click(button);
  await flush();
  expect(setRemove(from), "A2.3: the invalid source is refused again and the conflict is never overwritten").toEqual([]);
  expect({ rail: bytes(RAIL), theme: bytes(THEME) }).toStrictEqual({ rail: "diagonal", theme: JSON.stringify("light") });
  expect(isEnabledState(button), "both stay unresolved").toBe(true);
  expect(statusText()).toBe(W.en.count(2));
});

it("H16 A2.3 an uncertain write reconciles with exactly one total write", async () => {
  await mountApp();
  const from = mark();
  const readback = fault({ op: "get", key: ACCENT.key, after: { op: "set", key: ACCENT.key, value: "230" }, times: 1, label: "post-write read" });
  choose(ACCENT, 230);
  await flush();
  expect(says(msg.notSaved(ACCENT)), "§5.6: the unverified write is not saved").toBe(true);
  fired(readback, "post-write read");
  fireEvent.click(RA());
  await flush();
  expect(writesOn(from, ACCENT), "A2.3: one total write").toEqual(["230"]);
  expect(statusText()).toBe(W.en.saved);
});

it("H16 A2.3 a failed predecessor with a queued latest: the predecessor once, then the latest's own attempt", async () => {
  await mountApp();
  const lock = await hold(keyLock(ACCENT));
  const failFirst = fault({ op: "set", key: ACCENT.key, value: "230", times: 1, label: "predecessor quota" });
  choose(ACCENT, 230);
  choose(ACCENT, 295);
  await flush();
  expect(bytes(ACCENT), "H8: both wait behind the held lock").toBeNull();
  await lock.release();
  fired(failFirst, "predecessor write");
  const from = mark();
  fireEvent.click(RA());
  await flush();
  expect(writesOn(from, ACCENT), "A2.3: the held predecessor once, then the latest").toEqual(["230", "295"]);
  expect(bytes(ACCENT)).toBe("295");
});

it("H8 H16 A2.3 exclusions: pending, source-only and draft-free fields get zero attempts", async () => {
  seed(RAIL, "diagonal");
  await mountApp();
  choose(DENSITY, "compact");
  await flush();
  pre(bytes(DENSITY) === JSON.stringify("compact"), "density committed (no draft)");
  const accentQuota = await failPane(ACCENT, 230);
  accentQuota.off();
  const lock = await hold(keyLock(THEME));
  choose(THEME, "dark");
  await flush();
  expect(bytes(THEME), "H8: the theme write is pending").toBeNull();
  const from = mark();
  fireEvent.click(RA());
  await flush();
  expect(setRemove(from), "A2.3: only the settled failure is re-attempted").toEqual([`set:${ACCENT.key}=230`]);
  expect(says(msg.saving(THEME)), "the pending field is untouched").toBe(true);
  await lock.release();
  expect(writesOn(from, THEME), "the pending field writes once on its own").toEqual([JSON.stringify("dark")]);
  expect({ rail: writesOn(from, RAIL), density: writesOn(from, DENSITY) }, "source-only and draft-free fields: zero attempts").toStrictEqual({ rail: [], density: [] });
});

// ---------------------------------------------------------------------------
// A2.3: no duplicates
// ---------------------------------------------------------------------------

it("H16 A2.3 a same-turn double activation attempts each member once", async () => {
  await mountApp();
  const a = await failPane(ACCENT, 230);
  const r = await failPane(RAIL, "right");
  a.off();
  r.off();
  const button = RA();
  const from = mark();
  act(() => { button.click(); button.click(); });
  await flush();
  expect(setRemove(from), "A2.3: no duplicate attempts").toEqual([`set:${ACCENT.key}=230`, `set:${RAIL.key}=right`]);
});

it("H8 H16 A2.3 A2.5 an activation while members are pending (click, Enter, Space) adds zero attempts; focus stays on the disabled button", async () => {
  await mountApp();
  (await failPane(ACCENT, 230)).off();
  const lock = await hold(keyLock(ACCENT));
  const u = user();
  const button = RA();
  await u.click(button);
  await flush();
  expect(passOpen(), "A2.4 rule 1: the pass is open").toBe(true);
  expect(isDisabledState(button), "A2.2: an open pass with E empty disables the button").toBe(true);
  expect(retryAllState(button).describedByStatus, "A2.2: described by the in-flight line during the pass").toBe(true);
  expect(document.activeElement, "A2.5: focus stays").toBe(button);
  const from = mark();
  await u.click(button);
  await u.keyboard("{Enter}");
  await u.keyboard(" ");
  await flush();
  expect(document.activeElement, "A2.5: focus stays").toBe(button);
  await lock.release();
  expect(writesOn(from, ACCENT), "A2.3: exactly one attempt, the held one").toEqual(["230"]);
  expect(isDisabledState(button)).toBe(true);
  expect(document.activeElement, "A2.5: focus stays on the button the full success disabled").toBe(button);
});

it("H16 A2.6 a per-field Retry during a pass and a Retry all during a per-field Retry add zero attempts", async () => {
  await mountApp();
  (await failPane(ACCENT, 230)).off();
  (await failPane(RAIL, "right")).off();
  const accentLock = await hold(keyLock(ACCENT));
  const railLock = await hold(keyLock(RAIL));
  const from = mark();
  fireEvent.click(RA());
  await flush();
  const perField = retryOf(ACCENT);
  if (perField) fireEvent.click(perField);
  await flush();
  await accentLock.release();
  expect(writesOn(from, ACCENT), "A2.6: a per-field Retry on a pending member is inert").toEqual(["230"]);
  await railLock.release();
  expect(writesOn(from, RAIL)).toEqual(["right"]);
  (await failPane(THEME, "dark")).off();
  const themeLock = await hold(keyLock(THEME));
  const second = mark();
  fireEvent.click(need(retryOf(THEME), "H12: Retry Theme"));
  await flush();
  fireEvent.click(RA());
  await flush();
  await themeLock.release();
  expect(writesOn(second, THEME), "A2.6: Retry all skips a field whose per-field Retry is pending").toEqual([JSON.stringify("dark")]);
});

// ---------------------------------------------------------------------------
// A2.3: attribution, supersession and late completions
// ---------------------------------------------------------------------------

it("H16 A2.3 a pane edit supersedes a held member; the old completion never makes the newer choice look saved", async () => {
  await mountApp();
  (await failPane(ACCENT, 230)).off();
  const name = keyLock(ACCENT);
  const lock = await hold(name);
  fireEvent.click(RA());
  await flush();
  choose(ACCENT, 295);
  await flush();
  const plan = locks().plan(name, 0);
  await lock.release();
  await plan.waitHeld();
  expect(shown(ACCENT), "A2.3: the newer choice stays displayed").toBe(295);
  expect(says(msg.saving(ACCENT)), "the newer intent is still saving").toBe(true);
  expect(successShown(), "the superseded completion is not a success").toBe(false);
  await plan.release();
  expect(bytes(ACCENT), "the newer choice's bytes are final").toBe("295");
});

it("H16 A2.3 host row q: a Topbar choice supersedes a held theme member; after release the final bytes equal the Topbar choice", async () => {
  await mountApp();
  (await failTopbar(THEME, "dark")).off();
  const name = keyLock(THEME);
  const lock = await hold(name);
  const u = user();
  const button = RA();
  await u.click(button);
  await flush();
  expect(passOpen() && isDisabledState(button), "an open pass disables Retry all").toBe(true);
  chooseTopbar(THEME, "system");
  await flush();
  const plan = locks().plan(name, 0);
  await lock.release();
  await plan.waitHeld();
  expect({ pane: shown(THEME), topbar: topbarChecked(THEME) }, "the Topbar choice is the latest on both surfaces").toStrictEqual({ pane: "system", topbar: "system" });
  expect(successShown(), "the old completion does not mark the new choice saved").toBe(false);
  await plan.release();
  expect(bytes(THEME), "host row q: the final bytes equal the Topbar choice").toBe(JSON.stringify("system"));
});

it("H16 A2.3 a background choice supersedes a held accent member", async () => {
  await mountApp();
  (await failPane(ACCENT, 295)).off();
  const lock = await hold(keyLock(ACCENT));
  fireEvent.click(RA());
  await flush();
  choose(BG, "mist");
  await flush();
  await lock.release();
  expect({ accent: bytes(ACCENT), tone: bytes(BG) }, "A2.3: the background choice is the latest accent intent").toStrictEqual({ accent: "230", tone: "mist" });
  expect(shown(ACCENT)).toBe(230);
});

it("H16 A2.6 Reset during a pass supersedes members on its six fields; a language member continues", async () => {
  await mountApp();
  (await failPane(THEME, "dark")).off();
  (await failPane(LANG, "zh")).off();
  const themeLock = await hold(keyLock(THEME));
  const langLock = await hold(keyLock(LANG));
  fireEvent.click(RA("zh"));
  await flush();
  clickReset(true, "zh");
  await flush();
  await themeLock.release();
  await langLock.release();
  expect(bytes(THEME), "A2.6: the reset governs the theme").toBeNull();
  expect(bytes(LANG), "A2.6: the language member continues").toBe(JSON.stringify("zh"));
});

it("H16 A2.3 a late completion after Discard during an open pass changes nothing", async () => {
  seedValue(ACCENT, 75);
  await mountApp();
  (await failPane(ACCENT, 230)).off();
  const lock = await hold(keyLock(ACCENT));
  fireEvent.click(RA());
  await flush();
  fireEvent.click(need(discardOf(ACCENT), "H12: Discard Accent color"));
  await flush();
  const from = mark();
  await lock.release();
  expect(writesOn(from, ACCENT), "A2.3: the detached member never writes").toEqual([]);
  expect(shown(ACCENT), "the committed value is displayed").toBe(75);
  expect(successShown(), "no success claim").toBe(false);
});

it("H16 A2.5 A2.6 Discard all during an open pass detaches every member; late completions change nothing; focus goes to Reset", async () => {
  await mountApp();
  (await failPane(ACCENT, 230)).off();
  (await failPane(RAIL, "right")).off();
  const accentLock = await hold(keyLock(ACCENT));
  const railLock = await hold(keyLock(RAIL));
  const u = user();
  await u.click(RA());
  await flush();
  expect(passOpen(), "the pass is open").toBe(true);
  await u.click(need(discardAllButton(), "H12: Discard all changes"));
  await flush();
  expect(passOpen(), "A2.6: Discard all closes the pass").toBe(false);
  expect(document.activeElement, "A2.6 §9: focus goes to Reset to defaults").toBe(resetButton());
  const from = mark();
  await accentLock.release();
  await railLock.release();
  expect(setRemove(from), "late completions write nothing").toEqual([]);
  expect(statusText(), "A2.4: the line falls to rules 3–5 (empty)").toBe("");
});

it("H16 §7.4 A2.6 sign-out during an open pass: Cancel lets the pass settle; OK detaches the members with zero writes by the step", async () => {
  stubLocation();
  auth.value.client = { auth: { signOut: async () => { auth.state.clientSignOuts += 1; return {}; } } };
  await mountApp();
  (await failPane(ACCENT, 230)).off();
  const lock = await hold(keyLock(ACCENT));
  fireEvent.click(RA());
  await flush();
  confirmer.answer = false;
  await signOut();
  expect(confirmer.calls, "§7.4: one confirm during an open pass").toEqual([W.en.confirmSignOut]);
  expect(redirects, "Cancel: no redirect").toEqual([]);
  await lock.release();
  expect(bytes(ACCENT), "Cancel: the pass continues to settle").toBe("230");
  (await failPane(RAIL, "right")).off();
  const railLock = await hold(keyLock(RAIL));
  fireEvent.click(RA());
  await flush();
  confirmer.answer = true;
  const from = mark();
  await signOut();
  expect(confirmer.calls.length, "a second confirm for the second sign-out").toBe(2);
  expect(writesOn(from, RAIL), "OK: zero set/remove attempts by the step").toEqual([]);
  expect(redirects, "OK: the sequence continues").toEqual(["/"]);
  await railLock.release();
  expect(writesOn(from, RAIL), "the detached member's late completion writes nothing").toEqual([]);
  expect(accountScope.capture().kind, "identity invalidated").toBe("locked");
});

it("H16 §7.6 unmount during an open pass detaches the members; the late completion writes nothing", async () => {
  const app = await mountApp();
  (await failPane(ACCENT, 230)).off();
  const lock = await hold(keyLock(ACCENT));
  fireEvent.click(RA());
  await flush();
  app.unmount();
  await flush();
  const from = mark();
  await lock.release();
  expect(writesOn(from, ACCENT), "§7.6: no write after unmount").toEqual([]);
  expect(bytes(ACCENT)).toBeNull();
});

it("H16 REL-09 a forced App remount during an open pass detaches the members; the remounted pane shows the committed bytes", async () => {
  seedValue(ACCENT, 75);
  await mountApp();
  (await failPane(ACCENT, 230)).off();
  const lock = await hold(keyLock(ACCENT));
  fireEvent.click(RA());
  await flush();
  await act(async () => {
    window.dispatchEvent(new StorageEvent("storage", { key: "xai:auth:identity-change", newValue: JSON.stringify({ accountId: "appearance-sol-other", nonce: "1" }), storageArea: localStorage }));
  });
  await flush(24);
  await act(async () => {
    window.dispatchEvent(new StorageEvent("storage", { key: "xai:auth:identity-change", newValue: JSON.stringify({ accountId: OWNER_A, nonce: "2" }), storageArea: localStorage }));
  });
  await flush(24);
  pre(document.querySelector(".appearance-pane") !== null, "the App remounted for account A");
  const from = mark();
  await lock.release();
  expect(writesOn(from, ACCENT), "REL-09: the detached member never writes").toEqual([]);
  expect(shown(ACCENT), "the remounted controller shows the committed bytes").toBe(75);
});

// ---------------------------------------------------------------------------
// A2.4 feedback, A2.5 focus, Topbar status, unload, export
// ---------------------------------------------------------------------------

it("H16 A2.4 rule 1 wins while a pass is open, even when a member already failed again; the button is enabled and described (EN)", async () => {
  await mountApp();
  (await failPane(ACCENT, 230)).off();
  const railQuota = await failPane(RAIL, "right");
  const lock = await hold(keyLock(ACCENT));
  const button = RA();
  fireEvent.click(button);
  await flush();
  expect(statusText(), "A2.4 rule 1: Retrying… while a member is pending").toBe(W.en.retrying);
  expect(isEnabledState(button), "A2.2: the member that failed again makes E non-empty").toBe(true);
  expect(retryAllState(button).describedByStatus).toBe(true);
  await lock.release();
  expect(statusText(), "A2.4 rule 3 after the pass settled with one failure").toBe(W.en.count(1));
  railQuota.off();
});

it("H16 A2.4 rule 1 in Chinese: 正在重试未保存的外观更改…", async () => {
  seedValue(LANG, "zh");
  await mountApp();
  pre(uiLang() === "zh", "the UI is in zh");
  (await failPane(ACCENT, 230)).off();
  const lock = await hold(keyLock(ACCENT));
  fireEvent.click(RA("zh"));
  await flush();
  expect(statusText(), "A2.4 rule 1 (ZH)").toBe(W.zh.retrying);
  await lock.release();
  expect(statusText(), "A2.4 rule 4 (ZH)").toBe(W.zh.saved);
});

it("H16 A2.4 rule 2: a failed Export while a draft exists shows the export-failure line; the next pane action clears it", async () => {
  await mountApp();
  await failPane(ACCENT, 230);
  const harness = download();
  harness.hooks.create = () => { throw new Error("url setup"); };
  fireEvent.click(need(exportButton(), "H12: Export Appearance draft"));
  await flush(2);
  expect(statusText(), "A2.4 rule 2").toBe(W.en.exportFailed);
  harness.hooks = {};
  fireEvent.click(RA());
  await flush();
  expect(statusText(), "an enabled Retry all clears the export-failure line").toBe(W.en.count(1));
});

it("H16 A2.5 a keyboard Retry all that fully succeeds keeps focus on the now-disabled button, never on <body> or Reset", async () => {
  await mountApp();
  (await failPane(ACCENT, 230)).off();
  const button = RA();
  const u = user();
  act(() => { button.focus(); });
  await u.keyboard("{Enter}");
  await flush();
  expect(bytes(ACCENT), "Enter started one pass").toBe("230");
  expect(isDisabledState(button), "A2.5: the full success disables the button").toBe(true);
  expect(document.activeElement, "A2.5: focus stays on Retry all").toBe(button);
  expect(statusText()).toBe(W.en.saved);
});

it("H16 A2.5 a partial result keeps focus on the enabled button; Space starts exactly one pass", async () => {
  await mountApp();
  (await failPane(ACCENT, 230)).off();
  const railQuota = await failPane(RAIL, "right");
  const button = RA();
  const u = user();
  act(() => { button.focus(); });
  const from = mark();
  await u.keyboard(" ");
  await flush();
  expect(setRemove(from), "Space: one pass, one attempt per eligible field").toEqual([`set:${ACCENT.key}=230`, `set:${RAIL.key}=right!threw`]);
  expect(isEnabledState(button), "A2.5: partial result keeps it enabled").toBe(true);
  expect(document.activeElement, "A2.5: focus stays").toBe(button);
  expect(statusText()).toBe(W.en.count(1));
  railQuota.off();
});

it("H16 A2.5 host row s: a member held behind the real lock with a write fault armed fails on release; the button becomes enabled, focus stays and the count line becomes its description", async () => {
  await mountApp();
  const quota = await failPane(THEME, "dark");
  const lock = await hold(keyLock(THEME));
  const u = user();
  const button = RA();
  await u.click(button);
  await flush();
  expect(isDisabledState(button), "an open pass with E empty: disabled").toBe(true);
  expect(document.activeElement).toBe(button);
  await lock.release();
  expect(isEnabledState(button), "A2.5: the member failed again: enabled").toBe(true);
  expect(document.activeElement, "A2.5: focus stays").toBe(button);
  expect(retryAllState(button).describedByStatus && statusText() === W.en.count(1), "A2.1: the count line is the description").toBe(true);
  quota.off();
});

it("H16 host row o: a failed Topbar theme, a failed pane accent and a failed Reset item; one Retry all writes or removes each failed key once; the Topbar status hides during the pass and stays absent; unload removed", async () => {
  seedValue(RAIL, "top");
  await mountApp();
  const refusal = fault({ op: "remove", key: RAIL.key, label: "rail remove refused" });
  const resetFrom = mark();
  clickReset(true);
  await flush(24);
  expect(writesOn(resetFrom, RAIL), "H9 §6: the rail removal was attempted once").toEqual(["<remove>!"]);
  fired(refusal, "rail removal");
  const themeQuota = await failTopbar(THEME, "dark");
  const accentQuota = await failPane(ACCENT, 230);
  refusal.off();
  themeQuota.off();
  accentQuota.off();
  const accentLock = await hold(keyLock(ACCENT));
  const u = user();
  const button = RA();
  const from = mark();
  await u.click(button);
  await flush();
  expect(topbarStatus(), "§7.2: the Topbar status is hidden while the members are pending").toBeNull();
  await accentLock.release();
  expect(setRemove(from).sort(), "host row o: exactly one write or remove per failed key, zero on every other key").toEqual([`set:${THEME.key}="dark"`, `remove:${RAIL.key}`, `set:${ACCENT.key}=230`].sort());
  expect(topbarStatus(), "absent after the full success").toBeNull();
  expect(warns(), "beforeunload removed").toBe(false);
  expect(retryAllState(button), "disabled with no description").toMatchObject({ ariaDisabled: "true", describedBy: null, disabledAttr: false });
  expect(document.activeElement, "focus stays on Retry all").toBe(button);
  expect(statusText(), "'Appearance settings saved.' after the last member's verified completion").toBe(W.en.saved);
});

it("H16 host row p: a partial Retry all keeps one key unresolved: the count line, the Topbar status returns, unload warns, Export contains only the unresolved entry, focus stays", async () => {
  await mountApp();
  (await failTopbar(THEME, "dark")).off();
  const accentQuota = await failPane(ACCENT, 230);
  const u = user();
  const button = RA();
  await u.click(button);
  await flush();
  expect(statusText(), "host row p: the count line").toBe(W.en.count(1));
  expect(topbarStatusNamed(), "the Topbar status returns").not.toBeNull();
  expect(warns(), "beforeunload still warns").toBe(true);
  expect(document.activeElement, "focus stays").toBe(button);
  expect(isEnabledState(button), "Retry all stays enabled").toBe(true);
  const harness = download();
  fireEvent.click(need(exportButton(), "H12: Export Appearance draft"));
  await flush(2);
  await expectSingleDownload(harness, envelope({ accentHue: SET(230) }), "partial-pass export");
  accentQuota.off();
});

it("H16 §8 an export during an open pass includes the pending members as their latest unresolved intents", async () => {
  await mountApp();
  (await failPane(ACCENT, 230)).off();
  const lock = await hold(keyLock(ACCENT));
  fireEvent.click(RA());
  await flush();
  expect(passOpen(), "the pass is open").toBe(true);
  const harness = download();
  fireEvent.click(need(exportButton(), "H12: Export Appearance draft"));
  await flush(2);
  await expectSingleDownload(harness, envelope({ accentHue: SET(230) }), "export during an open pass");
  expect(passOpen(), "export never retries or closes the pass").toBe(true);
  await lock.release();
});

it("H16 §5.9 two passes: the second retries only the field that failed after the first began", async () => {
  await mountApp();
  (await failPane(ACCENT, 230)).off();
  const lock = await hold(keyLock(ACCENT));
  fireEvent.click(RA());
  await flush();
  const railQuota = await failPane(RAIL, "right");
  railQuota.off();
  const from = mark();
  fireEvent.click(RA());
  await flush();
  expect(setRemove(from), "§5.9: the second pass retries only the newly eligible field").toEqual([`set:${RAIL.key}=right`]);
  await lock.release();
  expect(writesOn(from, ACCENT), "the first pass's member writes once").toEqual(["230"]);
});

it("H16 §5.9 a member fails again, then its per-field Retry succeeds", async () => {
  await mountApp();
  const quota = await failPane(ACCENT, 230);
  fireEvent.click(RA());
  await flush();
  expect(says(msg.notSaved(ACCENT)), "the member failed again").toBe(true);
  quota.off();
  fireEvent.click(need(retryOf(ACCENT), "H12: Retry Accent color"));
  await flush();
  expect(bytes(ACCENT)).toBe("230");
  expect(isDisabledState(RA())).toBe(true);
});

it("H8 H16 §5.9 §6 Retry all during a Reset batch with one failed item and others pending retries only the failed item", async () => {
  for (const field of RESET_FIELDS) seedValue(field, ({ theme: "dark", density: "compact", fontScale: 1.1, accentHue: 230, railPos: "right", bgTone: "mist" } as Record<string, Value>)[field.id]!);
  await mountApp();
  const themeLock = await hold(keyLock(THEME));
  const densityLock = await hold(keyLock(DENSITY));
  const refusal = fault({ op: "remove", key: RAIL.key, label: "rail remove refused" });
  clickReset(true);
  await flush(24);
  expect(bytes(THEME), "H8: the held theme removal is pending").toBe(JSON.stringify("dark"));
  fired(refusal, "rail removal");
  refusal.off();
  const from = mark();
  fireEvent.click(RA());
  await flush();
  expect(setRemove(from), "§5.9: only the failed reset item, one removal").toEqual([`remove:${RAIL.key}`]);
  await themeLock.release();
  await densityLock.release();
  expect(setRemove(from), "the pending batch members remove once each on their own").toEqual([`remove:${RAIL.key}`, `remove:${THEME.key}`, `remove:${DENSITY.key}`]);
  expect(statusText()).toBe(W.en.restored);
});

it("H16 A2.1 no 'Save & apply'/'保存生效' control and no 'Saved'/'已保存' flash in the failure and success states", async () => {
  await mountApp();
  const quota = await failPane(ACCENT, 230);
  expect(oldButtons(), "A2.1: no old button with a draft").toEqual([]);
  quota.off();
  fireEvent.click(RA());
  await flush();
  expect({ old: oldButtons().length, flash: flashShown() }, "A2.1: no old button or flash after the success").toStrictEqual({ old: 0, flash: false });
});

// ---------------------------------------------------------------------------
// Controller ruling 5: the inherited Features follow-up 2 ordering, through Retry all
// ---------------------------------------------------------------------------

it("R5 fu2-retry-all-theme: in-flight set + Reset + set failure, recovered by Retry all: the failed set, one re-write of the superseded value, then one removal; final verified absence and 'Defaults restored.'", async () => {
  await runRuling5(RULING5["fu2-retry-all-theme"]);
});

it("R5 fu2-retry-all-railPos: in-flight set + Reset + set failure, recovered by Retry all: the failed set, one re-write of the superseded value, then one removal; final verified absence and 'Defaults restored.'", async () => {
  await runRuling5(RULING5["fu2-retry-all-railPos"]);
});

// Referenced for the shared vocabulary.
void appliedFor; void enc; void external; void KEYS; void unload; void topbarStatusNamed;
