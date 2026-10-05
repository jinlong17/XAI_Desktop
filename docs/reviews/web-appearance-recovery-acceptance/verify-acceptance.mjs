#!/usr/bin/env node
/**
 * verify-acceptance.mjs — read-only checks for the CP-APPEARANCE-01 final acceptance (control-plane batch 52).
 *
 * Usage, from the worktree root:
 *   node docs/reviews/web-appearance-recovery-acceptance/verify-acceptance.mjs <suffix>
 *
 * What it does (all read only):
 *   A  identity: docs head, product equality with 419e56d, lockfile constant at both product SHAs;
 *   B  contract r3: SHA-256, revision history r1 -> r2 -> r3, A1 and A3-A9 byte-identical across revisions, counts;
 *   C  product scope: the 5cd63ff..419e56d diff against contract §11, the §10 item 8 protected paths, the
 *      24073b5..419e56d delta (F-APP-1/2), the append-only stylesheet chain, additive-only files;
 *   D  product static checks: §10 item 9 spellings, Retry all markup (A2.1/A2.2/A2.8), the normative EN/ZH copy (§5),
 *      the appended CSS scope and the disabled rule set (§9), the Topbar slot, the sign-out step placement, the
 *      Topbar breakpoint facts behind the line-606 erratum, the F-APP root-cause rules in protected tokens CSS;
 *   E  evidence: re-derives every SHA-256 listed in the E27 hash log, checks each listed producing commit, and
 *      cross-checks principal artifacts of E1-E27 against the hash cited in their producer's own receipt;
 *   F  outcomes parsed from the raw logs (not from receipts): before and fixed Sol, host, native, F1, packages,
 *      accepted callers, F-FD1, E25;
 *   N  negative controls showing that the hash, tree, copy, CSS-scope, log and §11 checks can fail.
 *
 * It executes no product application code. The one exception is evaluating the pure copy module
 * `internal/appearanceRecoveryCopy.ts` from the 419e56d git object (types stripped in memory) to compare its strings
 * with the contract table. It writes exactly one new log beside itself and refuses to overwrite it.
 * Exit 0 when every check passes, 1 otherwise.
 */

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, openSync, writeSync, closeSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { stripTypeScriptTypes } from "node:module";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../../..");
const suffix = process.argv[2];
if (!suffix || !/^[a-z0-9-]+$/.test(suffix)) {
  console.error("usage: node verify-acceptance.mjs <suffix>");
  process.exit(2);
}
// A development smoke run may redirect the log outside the repository; evidence runs write beside this file.
const OUT_DIR = process.env.XAI_ACCEPTANCE_OUT_DIR ? resolve(process.env.XAI_ACCEPTANCE_OUT_DIR) : HERE;
if (OUT_DIR !== HERE && (OUT_DIR === ROOT || OUT_DIR.startsWith(`${ROOT}/`))) {
  console.error("XAI_ACCEPTANCE_OUT_DIR must be outside the repository");
  process.exit(2);
}
const OUT = join(OUT_DIR, `acceptance-checks-${suffix}.log`);
if (existsSync(OUT)) {
  console.error(`Evidence exists; use a new suffix: ${OUT}`);
  process.exit(1);
}

// ---- constants -------------------------------------------------------------------------------------------------
const DOCS_HEAD = "8c88dd2b629a509faa6cd153b53456b01b8758bb";
const FIXED = "419e56de9f23e4467fea806fbd4a990e1f429941";
const BEFORE = "5cd63ff652f02a2c726187fe12cbc796218d31c0";
const R1 = "24073b522262d8b4bec0abfa29347db28adbdd9e";
const R2 = "5bbf473872073472188957f430057412e8798131";
const FINAL_BATCH = "c6d1ed4c8a95ff44d451619f949da80ae95ccf8d";
const CONTRACT = "docs/reviews/web-appearance-recovery-contract/contract.md";
const CONTRACT_SHA = "ef1b573c9f1366ec0fc342d8960eb5a2975a8d1c75904da04134edb57212d90d";
const CONTRACT_REVS = {
  r1: "e9fbdb7ef21c86936da22b666cd80dfc34a3c609",
  r2: "b2e5eb20891c4bdbe4749ff5229207af7a210918",
  r3: "706c9a3186e27d80f7c05f065981f111cf80e3a7",
};
const LOCK_SHA = "df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9";
const APP_PKG = "packages/xai-web-settings-appearance";
const SHELL_PKG = "packages/xai-web-shell";
const CP = "docs/reviews/20260908-full-product-audit/CURRENT-CONTROL-PLANE.md";
const R = "docs/reviews";

// ---- helpers ---------------------------------------------------------------------------------------------------
const lines = [];
const results = [];
function log(text) { lines.push(text); }
function check(id, pass, detail = "") {
  results.push({ id, pass: Boolean(pass) });
  log(`${pass ? "PASS" : "FAIL"} ${id}${detail ? ` | ${typeof detail === "string" ? detail : JSON.stringify(detail)}` : ""}`);
}
function git(args, encoding = "utf8") {
  return execFileSync("git", args, { cwd: ROOT, encoding, maxBuffer: 1 << 30 });
}
function gitOk(args) {
  try { execFileSync("git", args, { cwd: ROOT, stdio: "ignore" }); return true; } catch { return false; }
}
const sha = (buf) => createHash("sha256").update(buf).digest("hex");
const blob = (rev, path) => git(["show", `${rev}:${path}`], "buffer");
const text = (rev, path) => blob(rev, path).toString("utf8");
const file = (path) => readFileSync(join(ROOT, path));
const nameList = (out) => out.split("\n").map((s) => s.trim()).filter(Boolean).sort();
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// =================================================================================================================
log(`acceptance-checks suffix=${suffix}`);
log(`cwd_root=${ROOT}`);
log(`node=${process.version}`);
log(`started=${new Date().toISOString()}`);

// ---- A identity ------------------------------------------------------------------------------------------------
log("## A identity");
const head = git(["rev-parse", "HEAD"]).trim();
check("A1 docs head is the batch-52 control-plane commit", head === DOCS_HEAD, { head });
check("A2 the docs head carries the fixed product unchanged (apps, packages, package.json, pnpm-lock.yaml)",
  git(["diff", "--name-only", FIXED, "HEAD", "--", "apps", "packages", "package.json", "pnpm-lock.yaml"]).trim() === "");
const lockFixed = sha(blob(FIXED, "pnpm-lock.yaml"));
const lockBefore = sha(blob(BEFORE, "pnpm-lock.yaml"));
check("A3 lockfile SHA-256 equals the contract gate at 419e56d and 5cd63ff", lockFixed === LOCK_SHA && lockBefore === LOCK_SHA, { lockFixed, lockBefore });

// ---- B contract ------------------------------------------------------------------------------------------------
log("## B contract r3");
const contractNow = file(CONTRACT);
check("B1 contract SHA-256 at HEAD equals r3", sha(contractNow) === CONTRACT_SHA, sha(contractNow));
check("B2 contract SHA-256 at 706c9a3 equals r3", sha(blob(CONTRACT_REVS.r3, CONTRACT)) === CONTRACT_SHA);
const contractLog = git(["log", "--format=%H", "--", CONTRACT]).trim().split("\n");
check("B3 contract history is exactly r3 706c9a3, r2 b2e5eb2, r1 e9fbdb7", same(contractLog, [CONTRACT_REVS.r3, CONTRACT_REVS.r2, CONTRACT_REVS.r1]), contractLog);
const touched = (rev) => nameList(git(["show", "--name-only", "--format=", rev]));
check("B4 r1 commit added only the selection memo and the contract",
  same(touched(CONTRACT_REVS.r1), ["docs/reviews/web-appearance-recovery-contract/contract.md", "docs/reviews/web-next-caller-selection/selection-5cd63ff.md"]), touched(CONTRACT_REVS.r1));
check("B5 r2 commit changed only the contract", same(touched(CONTRACT_REVS.r2), [CONTRACT]));
check("B6 r3 commit changed only the contract", same(touched(CONTRACT_REVS.r3), [CONTRACT]));
function section(src, startPrefix, endPrefix) {
  const all = src.split("\n");
  const s = all.findIndex((l) => l.startsWith(startPrefix));
  const e = all.findIndex((l, i) => i > s && l.startsWith(endPrefix));
  return s < 0 || e < 0 ? null : all.slice(s, e).join("\n");
}
const revText = Object.fromEntries(Object.entries(CONTRACT_REVS).map(([k, v]) => [k, text(v, CONTRACT)]));
const a1 = Object.fromEntries(Object.entries(revText).map(([k, v]) => [k, section(v, "**A1 —", "**A2 —")]));
const a39 = Object.fromEntries(Object.entries(revText).map(([k, v]) => [k, section(v, "**A3 —", "**D-notes.**")]));
check("B7 A1 text byte-identical in r1, r2 and r3", a1.r1 !== null && a1.r1 === a1.r2 && a1.r2 === a1.r3, { r1: a1.r1 && sha(a1.r1), r2: a1.r2 && sha(a1.r2), r3: a1.r3 && sha(a1.r3) });
check("B8 A3-A9 text byte-identical in r1, r2 and r3", a39.r1 !== null && a39.r1 === a39.r2 && a39.r2 === a39.r3, { r1: a39.r1 && sha(a39.r1), r3: a39.r3 && sha(a39.r3) });
const c3 = revText.r3;
const hyp = [...c3.matchAll(/^\| (H\d+) \|/gm)].map((m) => m[1]);
const gates = [...c3.matchAll(/^\| (\d+)\. [^|]+\|/gm)].map((m) => Number(m[1]));
const eItems = [...c3.matchAll(/^\| (E\d+) \|/gm)].map((m) => m[1]);
check("B9 r3 counts: hypotheses H1-H17, gates 1-10, evidence E1-E27 (contiguous, once each)",
  same(hyp, Array.from({ length: 17 }, (_, i) => `H${i + 1}`)) && same(gates, Array.from({ length: 10 }, (_, i) => i + 1)) && same(eItems, Array.from({ length: 27 }, (_, i) => `E${i + 1}`)),
  { hyp: hyp.length, gates, eItems: eItems.length });
check("B10 r3 records both product-owner decisions (A2 decision and 'Always shown (decision two)')",
  c3.includes("The product owner chose option (ii) on 2026-10-04") && c3.includes("**Always shown (decision two).**") && c3.includes("Disabled means `aria-disabled=\"true\"`, never the native `disabled` attribute."));

// ---- C product scope -------------------------------------------------------------------------------------------
log("## C product scope");
const productDiff = nameList(git(["diff", "--name-only", BEFORE, FIXED, "--", "apps", "packages", "package.json", "pnpm-lock.yaml"]));
const fullDiffNonDocs = nameList(git(["diff", "--name-only", BEFORE, FIXED])).filter((p) => !p.startsWith("docs/"));
const addedFiles = new Set(nameList(git(["diff", "--name-only", "--diff-filter=A", BEFORE, FIXED, "--", "apps", "packages"])));
function section11(path) {
  if (path.startsWith(`${APP_PKG}/`)) {
    const rel = path.slice(APP_PKG.length + 1);
    if (["src/AppearancePane.tsx", "src/types.ts", "src/index.ts", "src/styles.css", "docs/api.md", "docs/test.md"].includes(rel)) return "appearance";
    if (rel.startsWith("src/__tests__/")) return "appearance-test";
    if (rel.startsWith("src/internal/") && addedFiles.has(path)) return "appearance-new-internal";
    return null;
  }
  if (path.startsWith(`${SHELL_PKG}/`)) {
    const rel = path.slice(SHELL_PKG.length + 1);
    return ["src/Topbar.tsx", "src/Shell.tsx", "src/types.ts", "src/__tests__/Topbar.test.tsx", "docs/api.md"].includes(rel) ? "shell" : null;
  }
  if (path === "apps/web/src/App.tsx") return "app";
  if (/^apps\/web\/src\/__tests__\/App\.appearance[^/]*\.test\.tsx$/.test(path) && addedFiles.has(path)) return "app-new-test";
  return null;
}
const unclassified = productDiff.filter((p) => section11(p) === null);
check("C1 product diff 5cd63ff..419e56d has 26 files, every one a contract §11 file", productDiff.length === 26 && unclassified.length === 0, { count: productDiff.length, unclassified });
check("C2 full diff outside docs/ equals the product diff", same(fullDiffNonDocs, productDiff), { count: fullDiffNonDocs.length });
const newInternal = productDiff.filter((p) => section11(p) === "appearance-new-internal");
check("C3 at most four new Appearance internal modules (exactly the four roles)", newInternal.length === 4 && newInternal.every((p) => addedFiles.has(p)), newInternal);
const protectedTrees = [
  "packages/plugin-web-storage", "packages/plugin-web-settings-shell", "packages/plugin-web-tokens", "packages/core",
  "packages/xai-web-event-bus", "packages/xai-web-pet", "packages/xai-web-cmdk", "packages/xai-web-settings-features-panel",
  "packages/plugin-web-settings-rest", "packages/xai-web-dashboard-grid", "packages/xai-web-dashboard-widgets",
];
for (const p of protectedTrees) {
  const before = git(["rev-parse", `${BEFORE}:${p}`]).trim();
  const fixed = git(["rev-parse", `${FIXED}:${p}`]).trim();
  check(`C4 protected tree unchanged: ${p}`, before === fixed, { tree: fixed });
}
for (const p of ["package.json", "pnpm-lock.yaml"]) check(`C4 protected file unchanged: ${p}`, git(["rev-parse", `${BEFORE}:${p}`]).trim() === git(["rev-parse", `${FIXED}:${p}`]).trim());
const appProtected = ["src/internal/appearancePane.tsx", "src/constants.ts", "src/appearanceDefaults.ts", "package.json", "manifest.json", "tsconfig.json", "vitest.config.ts", "vitest.setup.ts", "eslint.config.js", "docs/design.md", "docs/dev_log.md"];
for (const rel of appProtected) {
  const p = `${APP_PKG}/${rel}`;
  check(`C5 Appearance §11-protected file unchanged: ${rel}`, git(["rev-parse", `${BEFORE}:${p}`]).trim() === git(["rev-parse", `${FIXED}:${p}`]).trim());
}
check("C6 settings-shell SettingsFooter, confirmAction and resetAllPrefs unchanged (shared code untouched, A2)",
  ["src/SettingsFooter.tsx", "src/internal/confirmAction.ts", "src/internal/resetAllPrefs.ts"].every((rel) => {
    const p = `packages/plugin-web-settings-shell/${rel}`;
    return gitOk(["cat-file", "-e", `${FIXED}:${p}`]) && git(["rev-parse", `${BEFORE}:${p}`]).trim() === git(["rev-parse", `${FIXED}:${p}`]).trim();
  }));
// Docs-only evidence commits interleave on the audit branch, so the product delta is judged outside docs/.
const nonDocs = (out) => nameList(out).filter((p) => !p.startsWith("docs/"));
const d1 = nonDocs(git(["diff", "--name-only", R1, FIXED]));
const d1a = nonDocs(git(["diff", "--name-only", R1, R2]));
const d1b = nonDocs(git(["diff", "--name-only", R2, FIXED]));
const STY = `${APP_PKG}/src/styles.css`;
check("C7 delta 24073b5..419e56d outside docs/ is exactly styles.css and the two guard tests",
  same(d1, [`${APP_PKG}/src/__tests__/AppearancePane.focus-ring.test.tsx`, `${APP_PKG}/src/__tests__/AppearancePane.selected-focus.test.tsx`, STY].sort()), d1);
check("C8 24073b5..5bbf473 = styles.css + focus-ring test; 5bbf473..419e56d = styles.css + selected-focus test",
  same(d1a, [`${APP_PKG}/src/__tests__/AppearancePane.focus-ring.test.tsx`, STY].sort()) && same(d1b, [`${APP_PKG}/src/__tests__/AppearancePane.selected-focus.test.tsx`, STY].sort()), { d1a, d1b });
const cssBefore = blob(BEFORE, STY), cssR1 = blob(R1, STY), cssR2 = blob(R2, STY), cssFixed = blob(FIXED, STY);
const startsWith = (big, small) => big.length >= small.length && big.subarray(0, small.length).equals(small);
check("C9 styles.css append-only chain: 419e56d ⊇ 5bbf473 ⊇ 24073b5 ⊇ 5cd63ff (byte prefixes)",
  startsWith(cssFixed, cssR2) && startsWith(cssR2, cssR1) && startsWith(cssR1, cssBefore),
  { before: [cssBefore.length, sha(cssBefore)], r1: [cssR1.length, sha(cssR1)], r2: [cssR2.length, sha(cssR2)], fixed: [cssFixed.length, sha(cssFixed)] });
for (const p of [`${APP_PKG}/src/types.ts`, `${APP_PKG}/src/index.ts`, STY, `${SHELL_PKG}/src/types.ts`, `${SHELL_PKG}/src/Shell.tsx`]) {
  const removed = git(["diff", "-U0", BEFORE, FIXED, "--", p]).split("\n").filter((l) => l.startsWith("-") && !l.startsWith("---"));
  check(`C10 additive only (no removed line): ${p}`, removed.length === 0, { removed: removed.length });
}
const usedAppDiff = git(["diff", "--numstat", BEFORE, FIXED, "--", "apps/web/src/App.tsx", `${SHELL_PKG}/src/Topbar.tsx`]).trim();
log(`INFO numstat App.tsx and Topbar.tsx: ${usedAppDiff.replace(/\n/g, " ; ")}`);

// ---- D product static checks -----------------------------------------------------------------------------------
log("## D product static checks at 419e56d");
const appSrcFiles = nameList(git(["ls-tree", "-r", "--name-only", FIXED, `${APP_PKG}/src`])).filter((p) => !p.includes("/__tests__/"));
const forbidden = ["localStorage", "setPref(", "removePref(", "usePref(", "emitWebEvent(", "new StorageEvent", "dispatchEvent(", "SettingsFooter", "pane-footer", "pane-save"];
const counts = Object.fromEntries(forbidden.map((f) => [f, 0]));
for (const p of appSrcFiles) { const t = text(FIXED, p); for (const f of forbidden) counts[f] += t.split(f).length - 1; }
check("D1 Appearance product source (non-test src) has zero of each §10 item 9 spelling", Object.values(counts).every((n) => n === 0), { files: appSrcFiles.length, counts });
const topbar = text(FIXED, `${SHELL_PKG}/src/Topbar.tsx`);
check("D2 Topbar.tsx has zero localStorage and no persistAndSet", !topbar.includes("localStorage") && !topbar.includes("persistAndSet"));
const appTsx = text(FIXED, "apps/web/src/App.tsx");
const appBefore = text(BEFORE, "apps/web/src/App.tsx");
check("D3 App.tsx: no writeLocalPref, localStorage.setItem, preference-changed subscriber or usePref(",
  ["writeLocalPref", "localStorage.setItem", "onWebEvent(\"web:settings:preference-changed\"", "usePref("].every((f) => !appTsx.includes(f)));
const readFn = (src) => { const s = src.indexOf("export function readLocalPref"); const e = src.indexOf("\n}\n", s); return s < 0 || e < 0 ? null : src.slice(s, e + 2); };
check("D4 readLocalPref byte-identical between 5cd63ff and 419e56d", readFn(appTsx) !== null && readFn(appTsx) === readFn(appBefore), readFn(appTsx) && sha(readFn(appTsx)));
const exportsOf = (src) => [...src.matchAll(/^export (?:function|const) (\w+)/gm)].map((m) => m[1]).sort();
check("D5 App.tsx public exports unchanged (App, createPetToggleHandler, createSettingsOpenHandler, readLocalPref)", same(exportsOf(appTsx), exportsOf(appBefore)), exportsOf(appTsx));
const signoutLines = appTsx.split("\n");
const departIdx = signoutLines.map((l, i) => (l.includes('requestSettingsDeparture("sign-out")') ? i : -1)).filter((i) => i >= 0);
check("D6 the Appearance sign-out step is awaited on the line immediately before each requestSettingsDeparture(\"sign-out\") (2 branches)",
  departIdx.length === 2 && departIdx.every((i) => /if \(!await confirmAppearanceSignOut\(\)\) return;/.test(signoutLines[i - 1])), departIdx.map((i) => signoutLines[i - 1].trim()));
check("D7 App creates exactly one controller and provides it", (appTsx.match(/useAppearanceController\(\)/g) ?? []).length === 1 && appTsx.includes("<AppearanceProvider controller={appearance}>"));
check("D8 App passes appearanceStatus and the controller's edits to Shell",
  appTsx.includes("appearanceStatus={<AppearanceStatus onReview={reviewAppearance} />}") && ["setLang={appearance.setLang}", "setTheme={appearance.setTheme}", "setDensity={appearance.setDensity}"].every((s) => appTsx.includes(s)));
check("D9 Review callback emits the shortcut module-change event, then navigates once to the pane",
  /emitWebEvent\("web:shell:module-change", \{ moduleId: "settings", source: "shortcut" \}\);\s*\n\s*void navigate\("\/app\/settings\/appearance"\);/.test(appTsx));
const premiumIdx = topbar.indexOf("{premiumBadge ? premiumBadge : null}");
const statusIdx = topbar.indexOf("{appearanceStatus ? appearanceStatus : null}");
const prefIdx = topbar.indexOf('<div className="topbar-pref"');
const between = premiumIdx >= 0 && statusIdx > premiumIdx ? topbar.slice(premiumIdx + "{premiumBadge ? premiumBadge : null}".length, statusIdx) : "x";
check("D10 Topbar renders the appearanceStatus slot immediately after premiumBadge and before the popover", premiumIdx >= 0 && statusIdx > premiumIdx && prefIdx > statusIdx && /^\s*(\{\/\*[^*]*\*\/\}\s*)?$/.test(between));
check("D11 Topbar option setters are called directly (one call, no storage)",
  ["const chooseLang = (next: Lang) => setLang(next);", "const chooseTheme = (next: Theme) => setTheme(next);", "const chooseDensity = (next: Density) => setDensity(next);"].every((s) => topbar.includes(s)));
const actions = text(FIXED, `${APP_PKG}/src/internal/AppearanceActions.tsx`);
const retryTag = actions.slice(actions.indexOf("<button", actions.indexOf('className="appearance-actions-row"')), actions.indexOf("</button>", actions.indexOf('data-testid="appearance-retry-all"')));
check("D12 Retry all is an always-rendered native <button type=\"button\"> with the §5 test id, aria-disabled when E is empty, and never disabled/inert/hidden/tabIndex",
  retryTag.includes('type="button"') && retryTag.includes('data-testid="appearance-retry-all"') && retryTag.includes('aria-disabled={enabled ? undefined : "true"}')
  && !/(^|[^-\w])disabled\s*=/.test(retryTag) && !/\binert\b|\bhidden\b|aria-hidden|tabIndex/.test(retryTag) && !/\{[^}]*&&\s*\(\s*<button[^>]*appearance-retry-all/.test(actions),
  { tag: retryTag.replace(/\s+/g, " ").slice(0, 400) });
check("D13 Retry all is described by the status line only while enabled or a pass is open, and its label is the copy constant",
  actions.includes("const described = enabled || controller.passOpen;") && retryTag.includes("aria-describedby={described ? statusId : undefined}") && actions.includes("{copy.retryAll}"));
const order = ['data-testid="appearance-status-line"', 'data-testid="appearance-retry-all"', 'data-testid="appearance-export-draft"', 'data-testid="appearance-discard-all"', 'data-testid="appearance-reset-defaults"'].map((s) => actions.indexOf(s));
check("D14 bottom action area DOM order: status line, Retry all, Export, Discard all, Reset (A2.8)", order.every((v, i) => v >= 0 && (i === 0 || v > order[i - 1])), order);
check("D15 the status line is always rendered with role=\"status\"", /<p className="appearance-status-line" role="status" data-testid="appearance-status-line"/.test(actions));
check("D16 Export and Discard all render only while drafts exist", (actions.match(/\{controller\.hasDraft && \(/g) ?? []).length === 2);
const status = text(FIXED, `${APP_PKG}/src/internal/AppearanceStatus.tsx`);
const statusCode = status.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
check("D17 Topbar status renders nothing unless E is non-empty and only calls onReview (no storage, no retry)",
  statusCode.includes("if (controller === null || controller.unsavedCount === 0) return null;") && statusCode.includes("onClick={() => onReview()}") && !/localStorage|retry/i.test(statusCode));
const ctl = text(FIXED, `${APP_PKG}/src/internal/appearanceController.tsx`);
check("D18 controller: Retry all order is the pane display order; Reset fields exclude language",
  ctl.includes('"lang", "theme", "density", "accentHue", "bgTone", "railPos", "fontScale",') && ctl.includes('const RESET_FIELDS: readonly AppearanceFieldId[] = ["theme", "density", "accentHue", "bgTone", "railPos", "fontScale"];'));
check("D19 controller: retryAll derives E live and is inert when E is empty, before clearing any line",
  /retryAll: \(\) => \{\s*\n\s*if \(!state\.alive\) return;[\s\S]{0,200}const members = APPEARANCE_FIELD_ORDER\.filter\(canRetry\);\s*\n\s*if \(members\.length === 0\) return;\s*\n\s*clearPaneLine\(\);/.test(ctl));
check("D20 controller: strict validators equal the §2 domains (accent integer 0-360, font scale finite 0.85-1.15, six tones, four rail positions)",
  ctl.includes("typeof value === \"number\" && Number.isInteger(value) && value >= 0 && value <= 360")
  && ctl.includes("typeof value === \"number\" && Number.isFinite(value) && value >= 0.85 && value <= 1.15")
  && ctl.includes('const BG_TONE_IDS: readonly string[] = ["default", "cream", "mist", "lavender", "peach", "graphite"];')
  && ctl.includes('value === "left" || value === "right" || value === "top" || value === "bottom"'));
check("D21 controller: root keys use the open-ended suffix path with the json codec; registered keys the registered path",
  ['usePrefAutosaveAsync("lang", LANG_BINDING)', 'usePrefAutosaveAsync("theme", THEME_BINDING)', 'usePrefAutosaveAsync("density", DENSITY_BINDING)', 'usePrefAutosaveAsync("font_scale", FONT_SCALE_BINDING)', 'usePrefAutosaveAsync("xai_accent_hue", ACCENT_BINDING)', 'usePrefAutosaveAsync("xai_bg_tone", BG_TONE_BINDING)', 'usePrefAutosaveAsync("xai_rail_pos", RAIL_BINDING)'].every((s) => ctl.includes(s))
  && (ctl.match(/codec: "json"/g) ?? []).length === 4);
check("D22 controller makes no raw storage, event, lock or broadcast call", !/localStorage|dispatchEvent|emitWebEvent|navigator\.locks|StorageEvent/.test(ctl));

// D23-D24: normative copy (§5) evaluated from the 419e56d copy module and compared with the contract table.
const copySrc = text(FIXED, `${APP_PKG}/src/internal/appearanceRecoveryCopy.ts`);
const copyMod = await import(`data:text/javascript;charset=utf-8,${encodeURIComponent(stripTypeScriptTypes(copySrc))}`);
const en = copyMod.appearanceRecoveryCopy("en");
const zh = copyMod.appearanceRecoveryCopy("zh");
const L = "<Label>";
const rows = [
  ["retryName", en.retryName(L), zh.retryName(L)], ["discardName", en.discardName(L), zh.discardName(L)], ["reloadName", en.reloadName(L), zh.reloadName(L)],
  ["reset", en.reset, zh.reset], ["exportDraft", en.exportDraft, zh.exportDraft], ["discardAll", en.discardAll, zh.discardAll], ["retryAll", en.retryAll, zh.retryAll],
  ["saving", en.saving(L), zh.saving(L)], ["resetting", en.resetting(L), zh.resetting(L)], ["notSaved", en.notSaved(L), zh.notSaved(L)], ["notReset", en.notReset(L), zh.notReset(L)],
  ["unavailable", en.unavailable(L), zh.unavailable(L)], ["saved", en.saved, zh.saved], ["restored", en.restored, zh.restored], ["exportFailed", en.exportFailed, zh.exportFailed],
  ["retrying", en.retrying, zh.retrying], ["notSavedCount(1)", en.notSavedCount(1), zh.notSavedCount(1)],
  ["notSavedCount(n)", en.notSavedCount(7).replace(/^7 /, "<n> "), zh.notSavedCount(7).replace(/^7 /, "<n> ")],
  ["confirmReset", en.confirmReset, zh.confirmReset], ["statusName", en.statusName, zh.statusName], ["statusText", en.statusText, zh.statusText], ["confirmSignOut", en.confirmSignOut, zh.confirmSignOut],
];
const tStart = c3.indexOf("**Normative wording.**");
const tEnd = c3.indexOf("All wording appears in the language currently displayed.");
const table = c3.slice(tStart, tEnd);
const contractStrings = new Set([...table.matchAll(/`([^`]+)`/g)].map((m) => m[1]));
const missing = [];
for (const [id, e, z] of rows) { if (!contractStrings.has(e)) missing.push(`${id} en ${JSON.stringify(e)}`); if (!contractStrings.has(z)) missing.push(`${id} zh ${JSON.stringify(z)}`); }
check("D23 every EN/ZH recovery string (44) equals a backticked string of the contract §5 normative table", missing.length === 0 && rows.length === 22, missing);
const ellipsisOk = en.retrying.endsWith("…") && zh.retrying.endsWith("…");
const pluralOk = en.notSavedCount(1) === "1 appearance change is not saved." && en.notSavedCount(2) === "2 appearance changes are not saved." && zh.notSavedCount(1) === "1 项外观更改未保存。" && zh.notSavedCount(3) === "3 项外观更改未保存。";
check("D24 in-flight line ends with U+2026; EN count line singular/plural, ZH one form", ellipsisOk && pluralOk);
const noOldCopy = !Object.values(en).concat(Object.values(zh)).some((v) => typeof v === "string" && /Save & apply|保存生效|^Saved$|^已保存$/.test(v));
check("D25 no 'Save & apply'/'保存生效'/'Saved'/'已保存' string in the copy module", noOldCopy);

// D26-D29: the appended CSS (§9 scopes and the disabled rule set).
function stripComments(css) { return css.replace(/\/\*[\s\S]*?\*\//g, ""); }
function parseRules(css, context = "") {
  const out = [];
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf("{", i);
    if (open < 0) break;
    const prelude = css.slice(i, open).trim();
    let depth = 1, j = open + 1;
    while (j < css.length && depth > 0) { if (css[j] === "{") depth++; else if (css[j] === "}") depth--; j++; }
    const body = css.slice(open + 1, j - 1);
    if (prelude.startsWith("@")) out.push(...parseRules(body, prelude));
    else out.push({ context, selectors: prelude.split(",").map((s) => s.trim()).filter(Boolean), declarations: body.split(";").map((d) => d.trim()).filter(Boolean) });
    i = j;
  }
  return out;
}
const appended = cssFixed.subarray(cssBefore.length).toString("utf8");
const rules = parseRules(stripComments(appended));
const selectors = rules.flatMap((r) => r.selectors.map((s) => ({ s, context: r.context })));
const inScope = (s) => /^\.appearance-pane(\s|$)/.test(s) || /^\.appearance-recovery-/.test(s) || /^\.appearance-status/.test(s);
const outOfScope = selectors.filter(({ s }) => !inScope(s));
check("D26 every appended selector is under .appearance-pane, .appearance-recovery-* or .appearance-status* (17 selectors)", outOfScope.length === 0 && selectors.length === 17, { count: selectors.length, outOfScope });
const atRules = [...new Set(rules.map((r) => r.context).filter(Boolean))].sort();
check("D27 appended at-rules are only @media (max-width: 640px) and @media (max-width: 767px); no !important, sticky or fixed position",
  same(atRules, ["@media (max-width: 640px)", "@media (max-width: 767px)"]) && !/!important|position\s*:\s*(sticky|fixed)/.test(appended), atRules);
const disabledRule = rules.filter((r) => r.selectors.some((s) => s.includes('[aria-disabled="true"]')));
const decl = disabledRule.length === 1 ? Object.fromEntries(disabledRule[0].declarations.map((d) => d.split(":").map((x) => x.trim()))) : {};
check("D28 the disabled Retry all rule is one rule set under .appearance-pane declaring only colours and the cursor, from neutral tokens",
  disabledRule.length === 1 && disabledRule[0].selectors.length === 1 && disabledRule[0].selectors[0] === '.appearance-pane .appearance-actions .appearance-retry-all[aria-disabled="true"]'
  && same(Object.keys(decl).sort(), ["background-color", "border-color", "color", "cursor"]) && decl["background-color"] === "var(--bg-panel-2)" && decl["border-color"] === "var(--border-1)" && decl.color === "var(--text-3)" && decl.cursor === "not-allowed",
  decl);
check("D29 no appended rule sets pointer-events or touches an --accent/--red/--danger token outside the two focus rules",
  !/pointer-events/.test(appended) && rules.filter((r) => !r.selectors.some((s) => s.includes(":focus-visible"))).every((r) => !r.declarations.some((d) => /--accent|--red|--danger/.test(d))));
const ring = 'outline: 2px solid color-mix(in oklch, var(--accent) 58%, transparent)';
const fApp1 = rules.find((r) => r.selectors[0] === '.appearance-pane .slider-row input[type="range"]:focus-visible');
const fApp2 = rules.find((r) => r.selectors[0] === ".appearance-pane .accent-sw.active:focus-visible");
check("D30 F-APP-1 rule restores the global ring on the Font scale slider (outline + offset 2px only)", fApp1 && same(fApp1.declarations, [ring, "outline-offset: 2px"]));
check("D31 F-APP-2 rule draws the global ring outside the selected swatch and keeps the selection as a box-shadow (paint-only)", fApp2 && same(fApp2.declarations, [ring, "outline-offset: 4px", "box-shadow: 0 0 0 2px var(--text-1)"]));
const tokensCss = text(FIXED, "packages/plugin-web-tokens/src/tokens.css");
check("D32 the global focus ring in protected tokens.css matches the F-APP rules' outline", tokensCss.includes(`[role="button"]:focus-visible {\n  ${ring};\n  outline-offset: 2px;\n}`));
const layoutCss = text(FIXED, "packages/plugin-web-tokens/src/layout.css");
check("D33 root causes stay in protected layout.css: slider-row outline none; accent-sw.active ring; popover option focus outline none then checked tint",
  /\.slider-row input\[type="range"\] \{[^}]*outline: none;/.test(layoutCss) && /\.accent-sw\.active \{\s*outline: 2px solid var\(--text-1\);/.test(layoutCss)
  && /\.topbar-pref-option:hover,\s*\n\.topbar-pref-option:focus-visible \{[^}]*outline: none;/.test(layoutCss)
  && layoutCss.indexOf('.topbar-pref-option[aria-checked="true"]') > layoutCss.indexOf(".topbar-pref-option:focus-visible"));
const blockAt = (start) => {
  const s = layoutCss.indexOf(start);
  if (s < 0 || layoutCss.indexOf(start, s + 1) >= 0) return null; // exactly one such block
  const next = layoutCss.indexOf("\n@media", s + 1);
  return layoutCss.slice(s, next < 0 ? layoutCss.length : next);
};
const b760 = blockAt("@media (max-width: 760px) {");
const b641 = blockAt("@media (min-width: 641px) and (max-width: 767px) {");
const b768 = blockAt("@media (min-width: 768px) and (max-width: 1024px) {");
check("D34 Topbar summary hidden at <=760 px and at 641-767 px, only width-capped at 768-1024 px: visible from 768 px (line-606 erratum facts)",
  b760 !== null && /\.topbar-pref-summary \{ display: none; \}/.test(b760) && b641 !== null && /\.topbar-pref-summary \{\s*display: none;/.test(b641)
  && b768 !== null && /\.topbar-pref-summary \{\s*max-width: 148px;\s*\}/.test(b768) && !/\.topbar-pref-summary \{[^}]*display: none/.test(b768));
const statusTextHidden = rules.some((r) => r.context === "@media (max-width: 767px)" && r.selectors.includes(".appearance-status-text") && r.declarations.includes("display: none"));
check("D35 the Topbar status text is hidden at max-width 767px (shown from 768 px, following the summary)", statusTextHidden);
check("D36 the pane registers no Settings route guard (protected render forwards only lang; no registerDepartureGuard in the package source)",
  text(FIXED, `${APP_PKG}/src/internal/appearancePane.tsx`).includes("render: ({ lang }) => <AppearancePane lang={lang} />,")
  && appSrcFiles.every((p) => !text(FIXED, p).includes("registerDepartureGuard")));

// D37: the bundle reorder (Appearance stylesheet now earlier) can only matter where an Appearance rule matches an
// element outside Appearance markup. Every unscoped selector of the 5cd63ff sheet must carry at least one class that
// no non-Appearance source (TS/TSX/JS outside the package, tests and CSS excluded) uses.
const classUsedOutside = new Map();
function usedOutside(cls) {
  if (!classUsedOutside.has(cls)) {
    let hits = "";
    try {
      hits = git(["grep", "-I", "-l", "-E", `(^|[^A-Za-z0-9_-])${cls.replace(/[-]/g, "\\-")}([^A-Za-z0-9_-]|$)`, FIXED, "--", "apps", "packages",
        `:(exclude)${APP_PKG}`, ":(exclude)*.css", ":(exclude)**/__tests__/**", ":(exclude)*.md", ":(exclude)**/docs/**"]);
    } catch { hits = ""; }
    classUsedOutside.set(cls, hits.trim().split("\n").filter(Boolean));
  }
  return classUsedOutside.get(cls);
}
const beforeSelectors = parseRules(stripComments(cssBefore.toString("utf8"))).flatMap((r) => r.selectors).filter((s) => !/^\.appearance-pane(\s|$)/.test(s));
const unbound = beforeSelectors.filter((s) => {
  const classes = [...new Set((s.match(/\.[A-Za-z][A-Za-z0-9_-]*/g) ?? []).map((c) => c.slice(1)))];
  return classes.length === 0 || classes.every((c) => usedOutside(c).length > 0);
});
check("D37 every unscoped selector of the original Appearance sheet is bound to Appearance-only markup, so the stylesheet reorder cannot restyle other modules",
  beforeSelectors.length > 0 && unbound.length === 0, { unscopedSelectors: beforeSelectors.length, unbound, sharedClasses: [...classUsedOutside].filter(([, v]) => v.length > 0).map(([k, v]) => `${k}:${v.length}`) });

// ---- E evidence hashes -----------------------------------------------------------------------------------------
log("## E evidence hashes");
const hashLogPath = `${R}/web-appearance-recovery-final/hashes-appearance-final-v1.log`;
const hashLog = file(hashLogPath).toString("utf8").split("\n");
let current = null;
const perSection = new Map();
let total = 0, mismatches = [], provenance = [];
for (const raw of hashLog) {
  const head = /^## (.+?) (?:producing commit ([0-9a-f]{40})|at revision ([0-9a-f]+)|\(untracked under docs\/reviews\/ at hashing time\))/.exec(raw);
  if (head) { current = { name: head[1], commit: head[2] ?? null, rev: head[3] ?? null, batch: /^This batch/.test(head[1]) }; perSection.set(current.name, { files: 0, ok: 0 }); continue; }
  const m = /^  ([0-9a-f]{64}) (\S+)(?: \||$)/.exec(raw);
  if (!m || !current) continue;
  total++;
  const [, listed, path] = m;
  const actual = current.rev ? sha(blob(FIXED, path)) : sha(file(path));
  const stat = perSection.get(current.name);
  stat.files++;
  if (actual === listed) stat.ok++; else mismatches.push({ section: current.name, path, listed, actual });
  if (!current.rev) {
    const last = git(["log", "-1", "--format=%H", "--", path]).trim();
    const expected = current.batch ? FINAL_BATCH : current.commit;
    if (last !== expected) provenance.push({ section: current.name, path, last, expected });
  }
}
for (const [name, s] of perSection) log(`INFO hash-log section "${name}": ${s.ok}/${s.files} re-derived equal`);
check(`E0 every hash in the E27 hash log re-derives equal (697 entries: 590 committed + 107 batch 51)`, total === 697 && mismatches.length === 0, { total, mismatches: mismatches.slice(0, 5) });
check("E0b every committed artifact's last commit is its listed producing commit (unchanged since); batch-51 files last touched by c6d1ed4", provenance.length === 0, provenance.slice(0, 5));

// Principal artifacts per item, each checked against the hash cited in its producer's own receipt (or the control
// plane's 8-hex prefix), with the adding commit and "unchanged since" re-derived from git.
const S = `${R}/web-appearance-recovery-sol`, I = `${R}/web-appearance-recovery-independent`, N = `${R}/web-appearance-recovery-native`;
const F1 = `${R}/web-appearance-recovery-f1`, T = `${R}/web-appearance-recovery-terra`, OE = `${R}/web-appearance-recovery-oracle-erratum`;
const FIN = `${R}/web-appearance-recovery-final`, K1 = `${R}/web-native-keyinput-k1`;
const FINAL_RECEIPT = `${FIN}/review-final-regressions-419e56d.md`;
const principals = [
  ["E1", `${S}/verify-fixed.mjs`, `${S}/README.md`, "full", "bd09456"],
  ["E1", `${S}/retry-all.test.tsx`, `${S}/README.md`, "full", "bd09456"],
  ["E1", `${S}/queues.test.tsx`, `${S}/README.md`, "full", "bd09456"],
  ["E1", `${S}/README.md`, CP, "prefix8", "bd09456"],
  ["E2", `${S}/retry-all-before3-5cd63ff.log`, `${S}/README.md`, "full", "bd09456"],
  ["E2", `${S}/queues-before3-5cd63ff.log`, `${S}/README.md`, "full", "bd09456"],
  ["E2", `${S}/fields-before3-5cd63ff.log`, `${S}/README.md`, "full", "bd09456"],
  ["E3", `${I}/host-before3-5cd63ff.log`, `${I}/README.md`, "full", "b997235"],
  ["E3", `${I}/README.md`, CP, "prefix8", "b997235"],
  ["E4", `${N}/before-5cd63ff.md`, CP, "prefix8", "72538d1"],
  ["E4", `${N}/native-5cd63ff-before1-h14.log`, `${N}/before-5cd63ff.md`, "full", "72538d1"],
  ["E4", `${N}/native-5cd63ff-before1-h15.log`, `${N}/before-5cd63ff.md`, "full", "72538d1"],
  ["E4", `${N}/native-5cd63ff-before1-h17.log`, `${N}/before-5cd63ff.md`, "full", "72538d1"],
  ["E4/E5 K-1", `${K1}/review-k1.md`, CP, "prefix8", "6b9f0ee"],
  ["E5", `${F1}/before-5cd63ff.md`, CP, "prefix8", "72538d1"],
  ["E5", `${F1}/f1-5cd63ff-appearance-before1.log`, `${F1}/before-5cd63ff.md`, "full", "72538d1"],
  ["E6 r1", `${T}/implementation.md`, FINAL_RECEIPT, "full", "4874170"],
  ["E6 r1", `${T}/appearance-test.log`, FINAL_RECEIPT, "prefix8", "4874170"],
  ["E6 r2", `${T}/r2-appearance-test.log`, `${T}/implementation-r2.md`, "full", "0d34bf2"],
  ["E6 r3", `${T}/r3-appearance-test.log`, `${T}/implementation-r3.md`, "full", "5766c1e"],
  ["E6 r3", `${T}/r3-web-test.log`, `${T}/implementation-r3.md`, "full", "5766c1e"],
  ["E7", `${S}/fixed-24073b5.md`, CP, "prefix8", "31d6335"],
  ["E7", `${S}/retry-all-fixed1-24073b5.log`, `${S}/fixed-24073b5.md`, "full", "31d6335"],
  ["E7", `${S}/queues-fixed1-24073b5.log`, `${S}/fixed-24073b5.md`, "full", "31d6335"],
  ["E7 OE", `${OE}/review-oe.md`, CP, "prefix8", "26cfce8"],
  ["E7 OE", `${OE}/continuity-export.corrected.test.tsx`, `${OE}/review-oe.md`, "full", "26cfce8"],
  ["E7 rerun", `${S}/retry-all-appearance-final-v1-419e56d.log`, hashLogPath, "full", "c6d1ed4"],
  ["E7 rerun", `${OE}/corrected-appearance-final-v1-419e56d.log`, FINAL_RECEIPT, "prefix8", "c6d1ed4"],
  ["E8", `${I}/host-fixed1-24073b5.log`, `${S}/fixed-24073b5.md`, "full", "31d6335"],
  ["E8 rerun", `${I}/host-appearance-final-v1-419e56d.log`, FINAL_RECEIPT, "full", "c6d1ed4"],
  ["E9", `${N}/review-controls-reset-export-24073b5.md`, CP, "prefix8", "3419542"],
  ["E9", `${N}/native-24073b5-fixed1-controls.log`, `${N}/review-controls-reset-export-24073b5.md`, "full", "3419542"],
  ["E10", `${N}/native-24073b5-fixed1-reset.log`, `${N}/review-controls-reset-export-24073b5.md`, "full", "3419542"],
  ["E11", `${N}/native-24073b5-fixed1-export.log`, `${N}/review-controls-reset-export-24073b5.md`, "full", "3419542"],
  ["E12", `${N}/review-host-downstream-retryall-24073b5.md`, CP, "prefix8", "32e6753"],
  ["E12", `${N}/native-24073b5-fixed1-host.log`, `${N}/review-host-downstream-retryall-24073b5.md`, "full", "32e6753"],
  ["E13", `${N}/native-24073b5-fixed1-downstream.log`, `${N}/review-host-downstream-retryall-24073b5.md`, "full", "32e6753"],
  ["E14", `${N}/review-visual-keyboard-419e56d.md`, CP, "prefix8", "2696855"],
  ["E14", `${N}/native-419e56d-fixed1-visual-en.log`, `${N}/review-visual-keyboard-419e56d.md`, "full", "2696855"],
  ["E14", `${N}/native-419e56d-fixed1-visual-zh.log`, `${N}/review-visual-keyboard-419e56d.md`, "full", "2696855"],
  ["E15", `${N}/native-419e56d-fixed1-keyboard-en.log`, `${N}/review-visual-keyboard-419e56d.md`, "full", "2696855"],
  ["E15", `${N}/native-419e56d-fixed1-keyboard-zh.log`, `${N}/review-visual-keyboard-419e56d.md`, "full", "2696855"],
  ["E16", `${R}/web-sticky-recovery-f1/f1-24073b5-sticky-fixed1.log`, `${S}/fixed-24073b5.md`, "full", "31d6335"],
  ["E16 rerun", `${R}/web-sticky-recovery-f1/f1-419e56d-sticky-appearance-final-v1.log`, FINAL_RECEIPT, "full", "c6d1ed4"],
  ["E16 rerun", `${R}/web-features-recovery-f1/f1-419e56d-features-appearance-final-v1.log`, FINAL_RECEIPT, "prefix8", "c6d1ed4"],
  ["E17", `${F1}/f1-24073b5-appearance-fixed1.log`, `${S}/fixed-24073b5.md`, "full", "31d6335"],
  ["E17 rerun", `${K1}/f1-419e56d-appearance-appearance-final-v1.log`, FINAL_RECEIPT, "full", "c6d1ed4"],
  ["E18", `${FIN}/search-appearance-final-v1-419e56d.log`, FINAL_RECEIPT, "full", "c6d1ed4"],
  ["E19", `${FIN}/protected-diff-appearance-final-v1-419e56d.log`, FINAL_RECEIPT, "full", "c6d1ed4"],
  ["E20", `${R}/web-features-recovery-final/storage-check-types-appearance-final-v1-419e56d.log`, FINAL_RECEIPT, "full", "c6d1ed4"],
  ["E20", `${S}/bytes-appearance-final-v1-419e56d.log`, FINAL_RECEIPT, "full", "c6d1ed4"],
  ["E21", `${FIN}/appearance-test-appearance-final-v1-419e56d.log`, FINAL_RECEIPT, "full", "c6d1ed4"],
  ["E22", `${FIN}/shell-test-appearance-final-v1-419e56d.log`, FINAL_RECEIPT, "full", "c6d1ed4"],
  ["E23", `${FIN}/web-test-appearance-final-v1-419e56d.log`, FINAL_RECEIPT, "full", "c6d1ed4"],
  ["E24", `${FIN}/compare-accepted-appearance-final-v1.log`, FINAL_RECEIPT, "full", "c6d1ed4"],
  ["E24", `${R}/web-features-recovery-sol/downstream-appearance-final-v1-419e56d.log`, FINAL_RECEIPT, "full", "c6d1ed4"],
  ["E24", `${R}/web-more-recovery-fb002/logs/corrected-full-appearance-final-v1-419e56d.log`, FINAL_RECEIPT, "prefix8", "c6d1ed4"],
  ["E25", `${FIN}/native-419e56d-appearance-final-v1-downstream.log`, FINAL_RECEIPT, "full", "c6d1ed4"],
  ["E26", `${N}/native-24073b5-fixed1-retryall.log`, `${N}/review-host-downstream-retryall-24073b5.md`, "full", "32e6753"],
  ["E26", `${N}/native-24073b5-fixed1-retryall.log`, FINAL_RECEIPT, "full", "32e6753"],
  ["E27", FINAL_RECEIPT, CP, "prefix8", "c6d1ed4"],
  ["E27", hashLogPath, FINAL_RECEIPT, "full", "c6d1ed4"],
];
const items = new Set();
for (const [item, path, receipt, mode, commit7] of principals) {
  const h = sha(file(path));
  const receiptText = file(receipt).toString("utf8");
  const cited = mode === "full" ? receiptText.includes(h) : new RegExp(`${h.slice(0, 8)}(?![0-9a-f])`).test(receiptText);
  const added = git(["log", "--diff-filter=A", "--format=%H", "--", path]).trim().split("\n").filter(Boolean);
  const last = git(["log", "-1", "--format=%H", "--", path]).trim();
  const ok = cited && added.length === 1 && added[0].startsWith(commit7) && last === added[0];
  items.add(item.split(" ")[0]);
  check(`E-${item} ${path.replace(`${R}/`, "")} sha256=${h}`, ok, { citedIn: receipt.replace(`${R}/`, ""), mode, addedBy: added.map((c) => c.slice(0, 7)), unchangedSince: last === added[0] });
}
const covered = [...items].flatMap((s) => s.split("/")).filter((s) => /^E\d+$/.test(s));
const allIds = Array.from({ length: 27 }, (_, i) => `E${i + 1}`);
check("E-cover at least one independently re-derived hash for every ID E1-E27", allIds.every((id) => covered.includes(id)), allIds.filter((id) => !covered.includes(id)));
const finalReceipt = file(FINAL_RECEIPT).toString("utf8");
const enumerated = [...finalReceipt.matchAll(/^\| (E\d+) \| /gm)].map((m) => m[1]);
check("E-27 the E27 receipt enumerates E1-E26 in order, once each", same(enumerated, allIds.slice(0, 26)), enumerated);

// ---- F outcomes parsed from the raw logs -----------------------------------------------------------------------
log("## F outcomes from raw logs");
const totals = (path) => {
  const t = file(path).toString("utf8");
  const m = [...t.matchAll(/^totals (.*)$/gm)].pop();
  return m ? Object.fromEntries(m[1].split(" ").map((kv) => kv.split("=")).map(([k, v]) => [k, Number(v)])) : null;
};
const caseLines = (path) => [...file(path).toString("utf8").matchAll(/^case (\d{3}) (PASSED|FAILED)( PRECONDITION)? \| (.*)$/gm)].map((m) => ({ n: m[1], status: m[2], pre: Boolean(m[3]), name: m[4] }));
const before3 = { bytes: [65, 65, 0], fields: [89, 1, 88], reset: [34, 4, 30], queues: [56, 1, 55], "continuity-export": [26, 4, 22], host: [33, 6, 27], "retry-all": [48, 2, 46] };
for (const [mode, [cases, passed, failed]] of Object.entries(before3)) {
  const t = totals(`${S}/${mode}-before3-5cd63ff.log`);
  check(`F1 E2 Sol ${mode} before3 at 5cd63ff: ${cases} cases, ${passed} pass, ${failed} correct FAIL, 0 PRECONDITION`, t && t.cases === cases && t.passed === passed && t.failed === failed && t.precondition_failures === 0, t);
}
const orig = totals(`${S}/original-before2-5cd63ff.log`);
check("F1 E2 Sol original before2 at 5cd63ff: 97/97 (operable 'Save & apply' controls included)", orig && orig.passed === 97 && orig.failed === 0, orig);
for (const [mode, names] of [["queues", ["fu2-retry-theme", "fu2-retry-railPos"]], ["retry-all", ["fu2-retry-all-theme", "fu2-retry-all-railPos"]]]) {
  const t = file(`${S}/${mode}-before3-5cd63ff.log`).toString("utf8").split("\n");
  for (const name of names) {
    const i = t.findIndex((l) => new RegExp(`^case \\d{3} FAILED \\| R5 ${name}:`).test(l));
    check(`F2 ruling-5 ${name} is a correct business FAIL at step 1 at 5cd63ff`, i >= 0 && /AssertionError: R5 .* step 1 \(H8\)/.test(t[i + 1] ?? ""), (t[i + 1] ?? "").trim().slice(0, 160));
  }
}
const fixedCounts = { bytes: 65, fields: 89, reset: 34, queues: 56, host: 33, "retry-all": 48 };
for (const [rev, tag] of [["24073b5", "fixed1-24073b5"], ["419e56d", "appearance-final-v1-419e56d"]]) {
  for (const [mode, n] of Object.entries(fixedCounts)) {
    const t = totals(`${S}/${mode}-${tag}.log`);
    check(`F3 E7 Sol ${mode} at ${rev}: ${n}/${n}, 0 PRECONDITION`, t && t.cases === n && t.passed === n && t.failed === 0 && t.precondition_failures === 0, t);
  }
  const ce = caseLines(`${S}/continuity-export-${tag}.log`);
  const ceFailed = ce.filter((c) => c.status === "FAILED").map((c) => c.n);
  check(`F4 E7 frozen continuity-export at ${rev}: 24/26, failures exactly OE-1 (006) and OE-2 (007), none PRECONDITION`, ce.length === 26 && same(ceFailed, ["006", "007"]) && ce.every((c) => !c.pre), ceFailed);
  const corr = totals(`${OE}/corrected-${tag}.log`);
  check(`F4 E7 corrected continuity-export at ${rev}: 26/26 (OE ruling)`, corr && corr.cases === 26 && corr.passed === 26 && corr.precondition_failures === 0, corr);
  for (const [mode, names] of [["queues", ["fu2-retry-theme", "fu2-retry-railPos"]], ["retry-all", ["fu2-retry-all-theme", "fu2-retry-all-railPos"]]]) {
    const cl = caseLines(`${S}/${mode}-${tag}.log`);
    check(`F5 ruling-5 cases PASS at ${rev} (${mode})`, names.every((name) => cl.some((c) => c.status === "PASSED" && c.name.startsWith(`R5 ${name}:`))));
  }
  const host = totals(`${I}/host-${tag}.log`);
  check(`F6 E8 parent host at ${rev}: 33/33`, host && host.cases === 33 && host.passed === 33 && host.precondition_failures === 0, host);
}
const o1 = totals(`${S}/original-fixed1-24073b5.log`), o2 = totals(`${S}/original-appearance-final-v1-419e56d.log`);
log(`INFO original fixed1-24073b5 totals ${JSON.stringify(o1)}; final-v1-419e56d ${JSON.stringify(o2)}`);
const h3 = totals(`${I}/host-before3-5cd63ff.log`);
check("F7 E3 parent host before3 at 5cd63ff: 33 cases, 4 pass, 29 correct FAIL, 0 PRECONDITION", h3 && h3.cases === 33 && h3.passed === 4 && h3.failed === 29 && h3.precondition_failures === 0, h3);
const resultOf = (path) => {
  const rec = file(path).toString("utf8").split("\n").filter((l) => l.startsWith("{") && l.includes('"name":"result"')).pop();
  try { return rec ? JSON.parse(rec) : null; } catch { return null; }
};
for (const m of ["h3", "h5", "h6", "h10", "h14", "h15", "h17"]) {
  const r = resultOf(`${N}/native-5cd63ff-before1-${m}.log`);
  check(`F8 E4 native before ${m}: harness valid with correct before FAILs`, r && r.harnessValid === true && Array.isArray(r.verdicts) && r.verdicts.some((v) => /=FAIL$/.test(v)), r && { checks: r.checks, fails: r.verdicts.filter((v) => /=FAIL$/.test(v)).length });
}
const e5 = resultOf(`${F1}/f1-5cd63ff-appearance-before1.log`), e5s = resultOf(`${F1}/f1-5cd63ff-selfcheck-before1.log`);
check("F9 E5 F1-shape at 5cd63ff: selfcheck harness-valid, appearance before-correct", e5 && e5.verdict === "before-correct" && e5.harnessValid && e5s && e5s.harnessValid && e5s.pass === true, { e5: e5 && e5.verdict, selfcheck: e5s && e5s.verdict });
for (const m of ["controls", "reset", "export", "host", "downstream", "retryall"]) {
  const r = resultOf(`${N}/native-24073b5-fixed1-${m}.log`);
  check(`F10 native ${m} at 24073b5 (E9-E13/E26): pass, harness valid, 0 runtime errors`, r && r.pass === true && r.harnessValid === true && r.runtimeErrors === 0, r && { checks: r.checks, productChecks: r.productChecks });
}
for (const m of ["visual-en", "visual-zh", "keyboard-en", "keyboard-zh"]) {
  const r = resultOf(`${N}/native-419e56d-fixed1-${m}.log`);
  check(`F11 E14/E15 ${m} at 419e56d: pass, harness valid, 0 runtime errors, 0 console warnings`, r && r.pass === true && r.harnessValid === true && r.runtimeErrors === 0 && r.consoleWarnings === 0, r && { checks: r.checks, productChecks: r.productChecks });
}
const f16 = ["sticky", "more", "collaborate", "selfcheck", "notifications", "date-time", "smart-lists", "header", "pomodoro", "race"].map((m) => `${R}/web-sticky-recovery-f1/f1-419e56d-${m}-appearance-final-v1.log`)
  .concat(["selfcheck", "features"].map((m) => `${R}/web-features-recovery-f1/f1-419e56d-${m}-appearance-final-v1.log`));
const f16ok = f16.map((p) => { const r = resultOf(p) ?? (() => { const l = file(p).toString("utf8").split("\n").filter((x) => x.includes('"name":"result"')).pop(); try { return JSON.parse(l); } catch { return null; } })(); return r && (r.pass === true || r.verdict === "pass") && (r.runtimeErrors ?? 0) === 0 && !file(p).toString("utf8").includes("Invalid blocker state transition"); });
check("F12 E16 at 419e56d: all 12 frozen F1 invocations pass, 0 runtime errors, no 'Invalid blocker state transition'", f16ok.length === 12 && f16ok.every(Boolean), f16ok);
const e17 = resultOf(`${K1}/f1-419e56d-appearance-appearance-final-v1.log`), e17s = resultOf(`${K1}/f1-419e56d-selfcheck-appearance-final-v1.log`);
check("F13 E17 at 419e56d (K-1 copy): appearance fixed-pass a1-a4 with F1 signature 0; selfcheck harness-valid",
  e17 && e17.verdict === "fixed-pass" && e17.outcomes.length === 4 && e17.outcomes.every((o) => o.state === "fixed-pass" && o.f1Signature === false) && e17s && e17s.verdict === "harness-valid", e17 && e17.outcomes.map((o) => o.state));
const tailOf = (p) => file(p).toString("utf8").trim().split("\n").slice(-2).join(" ");
check("F14 E18 search and E19 protected-diff logs exit 0 with all assertions", /assertions=118\/118 harness=64\/64 exit=0/.test(tailOf(`${FIN}/search-appearance-final-v1-419e56d.log`)) && /assertions=118\/118 harness=64\/64 exit=0/.test(tailOf(`${FIN}/protected-diff-appearance-final-v1-419e56d.log`)));
check("F15 delta audit log exit 0 with 21/21 assertions", /assertions=21\/21 harness=18\/18 exit=0/.test(tailOf(`${FIN}/delta-appearance-final-v1-419e56d.log`)));
const pk = (name) => totals(`${FIN}/${name}-appearance-final-v1-419e56d.log`);
const at = pk("appearance-test"), st = pk("shell-test"), wt = pk("web-test"), wt0 = totals(`${FIN}/web-test-appearance-final-v1-5cd63ff.log`);
check("F16 E21-E23 package tests: Appearance 137/137, shell 115/115, web 178/178; web control at 5cd63ff 156/156",
  at && at.tests === 137 && at.failed === 0 && st && st.tests === 115 && st.failed === 0 && wt && wt.tests === 178 && wt.failed === 0 && wt0 && wt0.tests === 156 && wt0.failed === 0, { at, st, wt, wt0 });
const exit0 = ["appearance-typecheck", "appearance-lint", "shell-check-types", "shell-lint", "web-check-types", "web-lint"].map((n) => /^exit=0$/m.test(file(`${FIN}/${n}-appearance-final-v1-419e56d.log`).toString("utf8")));
check("F17 E21-E23 typecheck/check-types and lint exit 0 (6 logs)", exit0.every(Boolean), exit0);
const ca = file(`${FIN}/compare-accepted-appearance-final-v1.log`).toString("utf8");
const diffs = [...ca.matchAll(/^DIFF (.*)$/gm)].map((m) => m[1]);
check("F18 E24 comparison: 54 MATCH, 1 DIFF, and every DIFF line is the Features Sol downstream count (F-FD1)", /## Summary: 54 MATCH, 1 DIFF/.test(ca) && diffs.length >= 1 && diffs.every((d) => d.trim().startsWith("features-sol downstream: 14/15")), diffs);
const fd = caseLines(`${R}/web-features-recovery-sol/downstream-appearance-final-v1-419e56d.log`);
check("F19 F-FD1: frozen Features downstream at 419e56d fails only case 012, as a PRECONDITION", fd.length === 15 && same(fd.filter((c) => c.status === "FAILED").map((c) => `${c.n}${c.pre ? "P" : ""}`), ["012P"]));
const fdc1 = totals(`${FIN}/diagnostics/features-sol-downstream-corrected-appearance-final-v1-419e56d.log`), fdc0 = totals(`${FIN}/diagnostics/features-sol-downstream-corrected-appearance-final-v1-5cd63ff.log`);
check("F20 F-FD1: the two-token corrected copy passes 15/15 at 419e56d and at 5cd63ff", fdc1 && fdc1.passed === 15 && fdc0 && fdc0.passed === 15, { fdc1, fdc0 });
const fdDiff = file(`${FIN}/diagnostics/features-downstream.corrected.diff`).toString("utf8").split("\n").filter((l) => /^[+-][^+-]/.test(l));
check("F21 F-FD1 corrected diff changes exactly two lines, 'sage' -> 'mist'", fdDiff.length === 4 && fdDiff.filter((l) => l.startsWith("-")).every((l) => l.includes('"sage"')) && fdDiff.filter((l) => l.startsWith("+")).every((l) => l.includes('"mist"')), fdDiff);
const more = totals(`${R}/web-more-recovery-fb002/logs/corrected-full-appearance-final-v1-419e56d.log`);
check("F22 C-FB002: More corrected boundaries oracle 10/10 at 419e56d", more && more.cases === 10 && more.passed === 10, more);
const e25 = file(`${FIN}/native-419e56d-appearance-final-v1-downstream.log`).toString("utf8").split("\n").filter((l) => l.startsWith('{"pass"')).pop();
const e25r = e25 ? JSON.parse(e25) : null;
check("F23 E25 Features native downstream (copy) at 419e56d: pass, 140 product checks, 0 runtime errors", e25r && e25r.pass === true && e25r.harnessValid === true && e25r.productChecks === 140 && e25r.runtimeErrors === 0, e25r && { checks: e25r.checks });
const e25diff = file(`${FIN}/native-host-harness.e25.diff`).toString("utf8").split("\n").filter((l) => /^-[^-]/.test(l));
check("F24 E25 harness copy removes exactly one line, the caller-bound Features-only delta precondition", e25diff.length === 1 && e25diff[0].includes('"baseline:fixed-delta-only-in-features-package"'));
check("F25 E25 runner, fixture and prelude are byte-identical to the frozen Features files",
  ["verify-native-downstream.mjs", "native-downstream.tsx", "native-host-prelude.js"].every((f) => sha(file(`${FIN}/${f}`)) === sha(file(`${R}/web-features-recovery-native/${f}`))));
const cr = file(`${FIN}/compare-reruns-appearance-final-v1.log`).toString("utf8");
check("F26 cheap reruns at 419e56d vs 24073b5: 26 MATCH, 0 DIFF", /## Summary: 26 MATCH, 0 DIFF/.test(cr));
const nativeRunnersSending = ["verify-native-fixed.mjs", "verify-native-host-retryall.mjs", "verify-visual-keyboard-419e56d.mjs"].map((f) => /nativeVirtualKeyCode\s*:/.test(file(`${N}/${f}`).toString("utf8")));
check("F27 K-1: no fixed-product native runner (E9-E15, E26) and no E17/E25 copy sends nativeVirtualKeyCode",
  nativeRunnersSending.every((x) => !x) && !/nativeVirtualKeyCode\s*:/.test(file(`${K1}/verify-f1-appearance-k1.mjs`).toString("utf8")) && !/nativeVirtualKeyCode\s*:/.test(file(`${FIN}/native-host-harness.mjs`).toString("utf8")), nativeRunnersSending);

// ---- N negative controls: the checks above can fail ------------------------------------------------------------
log("## N negative controls");
const realHash = sha(file(FINAL_RECEIPT));
const corrupted = `${realHash[0] === "0" ? "1" : "0"}${realHash.slice(1)}`;
check("N1 a one-character-corrupted SHA-256 does not equal the re-derived hash (hash comparison is sensitive)", corrupted !== realHash && sha(file(FINAL_RECEIPT)) !== corrupted);
check("N2 the tree comparison detects a changed package (Appearance tree differs between 5cd63ff and 419e56d)",
  git(["rev-parse", `${BEFORE}:${APP_PKG}`]).trim() !== git(["rev-parse", `${FIXED}:${APP_PKG}`]).trim());
check("N3 the copy comparison rejects strings absent from the contract table ('Save & apply', 'Saved', '已保存')",
  !contractStrings.has("Save & apply") && !contractStrings.has("Saved") && !contractStrings.has("已保存") && contractStrings.size >= 44, { tableStrings: contractStrings.size });
const synthetic = parseRules(stripComments(".topbar-pref-option:focus-visible { outline: 2px solid red; }\n@media (max-width: 640px) { .pane-footer { position: sticky; } }"));
check("N4 the CSS scope predicate flags out-of-scope selectors (synthetic .topbar-pref-option and .pane-footer rules)",
  synthetic.flatMap((r) => r.selectors).filter((s) => !inScope(s)).length === 2);
const beforeRetryAll = totals(`${S}/retry-all-before3-5cd63ff.log`);
check("N5 the log parser reports failures where they exist (Sol retry-all before3 has 46 failures)", beforeRetryAll && beforeRetryAll.failed === 46);
check("N6 the product diff classifier rejects a non-§11 path", section11("apps/web/src/routes/modules/departureCoordinator.tsx") === null && section11(`${APP_PKG}/src/constants.ts`) === null && section11(`${SHELL_PKG}/src/AppRail.tsx`) === null);
const ptUses = usedOutside("pane-title"), activeUses = usedOutside("active");
check("N7 the D37 class search finds classes that other modules do use ('pane-title', 'active'), so D37 is not vacuous",
  ptUses.length > 0 && activeUses.length > 0, { "pane-title": ptUses.length, active: activeUses.length });

// ---- summary ---------------------------------------------------------------------------------------------------
const failed = results.filter((r) => !r.pass);
log(`## summary checks=${results.length} passed=${results.length - failed.length} failed=${failed.length}`);
for (const f of failed) log(`FAILED ${f.id}`);
log(`finished=${new Date().toISOString()}`);
log(`exit=${failed.length === 0 ? 0 : 1}`);
const fd2 = openSync(OUT, "wx");
writeSync(fd2, `${lines.join("\n")}\n`);
closeSync(fd2);
console.log(`checks=${results.length} failed=${failed.length} log=${OUT}`);
process.exit(failed.length === 0 ? 0 : 1);
