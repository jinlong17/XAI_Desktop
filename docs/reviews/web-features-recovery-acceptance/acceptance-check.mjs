#!/usr/bin/env node
/**
 * CP-FEATURES-01 final acceptance (batch 32): independent, read-only checks at fixed product 5cd63ff.
 *
 * Usage (from the worktree root):
 *   XAI_DEPS_ROOT=<read-only main checkout> node docs/reviews/web-features-recovery-acceptance/acceptance-check.mjs <suffix>
 *
 * It executes no product code. It reads committed git objects of this worktree (git runs with cwd = this
 * worktree), reads the dependency checkout's pnpm-lock.yaml only to compare its SHA-256, and writes exactly one
 * log next to this file with an exclusive create (it refuses to overwrite). Exit: 0 when every check passes,
 * 1 when any check fails.
 *
 * Expected values are taken from the primary receipts named per item (not from the E25 receipt) except where
 * E25 is itself the primary receipt (E6 file table, E18–E25).
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../../..");
const SUFFIX = process.argv[2];
if (!SUFFIX || !/^[a-z0-9-]+$/.test(SUFFIX)) throw Error("usage: acceptance-check.mjs <suffix>");
// Dry runs may redirect output outside the repository (refused inside it); committed evidence uses HERE.
const OUT_DIR = process.env.XAI_ACCEPT_OUTPUT_DIR ? resolve(process.env.XAI_ACCEPT_OUTPUT_DIR) : HERE;
if (OUT_DIR !== HERE && (OUT_DIR + "/").startsWith(ROOT + "/")) throw Error("XAI_ACCEPT_OUTPUT_DIR must be outside the repository");
const OUT = join(OUT_DIR, `acceptance-check-${SUFFIX}-5cd63ff.log`);
if (existsSync(OUT)) throw Error(`Evidence exists; use a new suffix: ${OUT}`);
const DEPS = process.env.XAI_DEPS_ROOT;

const FIXED = "5cd63ff652f02a2c726187fe12cbc796218d31c0";
const BEFORE = "f359be6d838393e0f9e93efd80b88b5b09f6144e";
const LOCK = "df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9";
const FINAL = "0056299ae8333352cf7c9d7acea30fe8cad8a91f";
const FB002 = "05b21f412a01101759c604f593d09dc26bdda729";
const PKG = "packages/xai-web-settings-features-panel";
const R = "docs/reviews";

const lines = [];
let failures = 0;
let checks = 0;
const log = (text) => lines.push(text);
const check = (ok, id, detail = "") => {
  checks += 1;
  if (!ok) failures += 1;
  log(`${ok ? "PASS" : "FAIL"} ${id}${detail ? " | " + detail : ""}`);
  return ok;
};
const git = (args, encoding = "utf8") => {
  const out = execFileSync("git", args, { cwd: ROOT, encoding, maxBuffer: 256 * 1024 * 1024 });
  return encoding === "utf8" ? out.trim() : out;
};
const gitOk = (args) => { try { execFileSync("git", args, { cwd: ROOT, stdio: "ignore" }); return true; } catch { return false; } };
const sha256 = (data) => createHash("sha256").update(data).digest("hex");
const blob = (rev, path) => git(["cat-file", "blob", `${rev}:${path}`], "buffer");
const text = (rev, path) => blob(rev, path).toString("utf8");

// ---------------------------------------------------------------------------------------------------------------
log(`acceptance_check=${SUFFIX}`);
log(`runner_sha256=${sha256(readFileSync(fileURLToPath(import.meta.url)))}`);
log(`root=${ROOT}`);
const HEAD = git(["rev-parse", "HEAD"]);
log(`head=${HEAD}`);
log(`node=${process.version}`);

log("\n## 1. Fixed points");
check(git(["rev-parse", "5cd63ff^{commit}"]) === FIXED, "fixed-resolves", FIXED);
check(git(["rev-parse", "f359be6^{commit}"]) === BEFORE, "before-resolves", BEFORE);
check(git(["rev-parse", `${FIXED}^{tree}`]) === "404bf819a42e20b3e4d372c18a981832ccd54954", "fixed-tree", "404bf819a42e20b3e4d372c18a981832ccd54954");
check(git(["rev-parse", `${BEFORE}^{tree}`]) === "2280bc7617d52dc6c4356da257d57940ecb174ec", "before-tree", "2280bc7617d52dc6c4356da257d57940ecb174ec");
check(gitOk(["merge-base", "--is-ancestor", BEFORE, FIXED]) && gitOk(["merge-base", "--is-ancestor", FIXED, HEAD]), "ancestry before->fixed->head");
check(git(["diff", "--name-only", FIXED, HEAD, "--", "apps", "packages", "package.json", "pnpm-lock.yaml"]) === "", "docs-head-carries-fixed-product-unchanged");
const outsideAcceptance = git(["status", "--porcelain", "--untracked-files=all"]).split("\n").filter(Boolean)
  .filter(line => !line.slice(3).startsWith(`${R}/web-features-recovery-acceptance/`));
check(outsideAcceptance.length === 0, "worktree-clean-outside-acceptance-dir", outsideAcceptance.join(";") || "none");
const lockFixed = sha256(blob(FIXED, "pnpm-lock.yaml"));
const lockBefore = sha256(blob(BEFORE, "pnpm-lock.yaml"));
check(lockFixed === LOCK && lockBefore === LOCK, "lockfile-gate-committed", `fixed=${lockFixed} before=${lockBefore}`);
if (DEPS) {
  const depsLock = sha256(readFileSync(join(DEPS, "pnpm-lock.yaml")));
  check(depsLock === LOCK, "lockfile-gate-dependency-checkout(read-only)", depsLock);
} else log("NOTE XAI_DEPS_ROOT not set; dependency lockfile not compared");
check(git(["log", "--format=%H", "--", `${R}/web-features-recovery-contract/contract.md`]) === "6ded3dc70a35f9290c59fad652997a0e458c1607", "contract-single-commit-6ded3dc");
log(`INFO contract_sha256=${sha256(blob(HEAD, `${R}/web-features-recovery-contract/contract.md`))}`);
log(`INFO selection_sha256=${sha256(blob(HEAD, `${R}/web-next-caller-selection/selection-f359be6.md`))}`);

// ---------------------------------------------------------------------------------------------------------------
log("\n## 2. Section 14 rule: E1-E5 committed before Terra (5cd63ff)");
for (const [id, c] of [["E1/E2", "11e0afb6d9c6932314f5434dc5d53e5a51c8cdca"], ["E3", "b732c27f330eb3368901d38f4423722f651c112f"], ["E4/E5", "4c5323f70d55e66d3627ee79d4fd84ef9d19dd2c"]]) {
  check(gitOk(["merge-base", "--is-ancestor", c, FIXED]) && c !== FIXED, `before-evidence-${id}-is-ancestor-of-terra`, c);
}

// ---------------------------------------------------------------------------------------------------------------
log("\n## 3. E6: Terra fixed SHA, section 11 file boundary, file hashes, commit-message record");
const S11 = [
  ["A", `${PKG}/src/__tests__/FeaturesPaneRecovery.test.tsx`, "5365f404d612cf25b4c1fb32487e41c052140274f359a53de1cdadc2e0bf8ee6"],
  ["A", `${PKG}/src/__tests__/featuresLockFixture.ts`, "b190596f0ebc7272c8caf7362d7f9146788c296dd612e881973ddc465a04510e"],
  ["A", `${PKG}/src/internal/featuresRecovery.ts`, "0e73fadd1cb941ca8f26e86a38c493fe9da94a278c335798a92accbff5f74e6f"],
  ["A", `${PKG}/src/internal/featuresRecoveryCopy.ts`, "d4409bd70b7df1227cbeabaf6c00bb0f2abb14c1f81f488905c2e76354b822bc"],
  ["M", `${PKG}/docs/api.md`, "46f6d7ff532ed8b6f8e6bd63bbb0dd753674ab5bf44a848cc0a498c1851e079f"],
  ["M", `${PKG}/docs/test.md`, "1c13c59dd21bb71e13aada054191450998b6473955ba34c5efd2a3e3a68f0740"],
  ["M", `${PKG}/src/FeaturesPane.tsx`, "54a3f10c90fdc415a9c1bb89801fe4cdc1870022235752229e9180a2a683d701"],
  ["M", `${PKG}/src/__tests__/FeaturesPane.test.tsx`, "993f0d069b9dc23de53d910d5dda4967eca2e436596ec3fbc2b33fad16ed1d64"],
  ["M", `${PKG}/src/internal/featuresPane.tsx`, "572bdd478954059f02dde83c8ec7383f992ca0f6f33f8b5e2c96ba85e7f935a7"],
  ["M", `${PKG}/src/styles.css`, "65fdf6f08b299c242bf79397a5e731fa0b605cc2f5a7476e2778a4caa350b5c3"],
  ["M", `${PKG}/src/types.ts`, "f97c4e6212d99723d9baeb1133866f05860db7b97ce274ba2be0b27128cd8406"],
];
const productDiff = git(["diff", "--name-status", BEFORE, FIXED, "--", "apps", "packages", "package.json", "pnpm-lock.yaml"]).split("\n").filter(Boolean).map(l => l.split("\t"));
const expectedSet = S11.map(([s, p]) => `${s} ${p}`).sort();
check(JSON.stringify(productDiff.map(([s, p]) => `${s} ${p}`).sort()) === JSON.stringify(expectedSet), "e6-product-diff-is-exactly-the-11-section-11-files", `${productDiff.length} entries`);
const nonDocs = git(["diff", "--name-only", BEFORE, FIXED, "--", ".", ":(exclude)docs"]).split("\n").filter(Boolean).sort();
check(JSON.stringify(nonDocs) === JSON.stringify(S11.map(([, p]) => p).sort()), "e6-full-diff-outside-docs-is-the-same-11-files", `${nonDocs.length}`);
const e25Receipt = text(HEAD, `${R}/web-features-recovery-final/review-final-regressions-5cd63ff.md`);
const solFixedReceipt = text(HEAD, `${R}/web-features-recovery-sol/fixed-5cd63ff.md`);
for (const [, path, expected] of S11) {
  const got = sha256(blob(FIXED, path));
  const inE25 = e25Receipt.includes(got);
  const inE7prefix = solFixedReceipt.includes(got.slice(0, 8));
  check(got === expected && inE25, `e6-file-sha256 ${path}`, `${got} e25_full=${inE25} e7_prefix8=${inE7prefix}`);
  check(git(["diff", "--name-only", FIXED, HEAD, "--", path]) === "", `e6-file-unchanged-since-fixed ${path}`);
}
const numstat = Object.fromEntries(git(["diff", "--numstat", BEFORE, FIXED, "--", PKG]).split("\n").filter(Boolean).map(l => { const [a, d, p] = l.split("\t"); return [p, [Number(a), Number(d)]]; }));
check(JSON.stringify(numstat[`${PKG}/src/styles.css`]) === "[84,0]", "styles-additions-only", JSON.stringify(numstat[`${PKG}/src/styles.css`]));
const typesDiff = git(["diff", "-U0", BEFORE, FIXED, "--", `${PKG}/src/types.ts`]).split("\n").filter(l => /^[+-][^+-]/.test(l));
check(typesDiff.every(l => l.startsWith("+")) && typesDiff.some(l => l.includes("readonly registerDepartureGuard?: PaneDepartureGuardRegistration;")) && typesDiff.some(l => l.includes('import type { PaneDepartureGuardRegistration } from "@repo/plugin-web-settings-shell";')),
  "types-only-adds-optional-registerDepartureGuard-and-its-type-import", `${typesDiff.length} changed lines, all additions`);
const paneRegDiff = git(["diff", "-U0", BEFORE, FIXED, "--", `${PKG}/src/internal/featuresPane.tsx`]).split("\n").filter(l => /^[+-][^+-]/.test(l));
check(paneRegDiff.length === 5 && paneRegDiff.some(l => l === "+  render: (props: PaneRenderProps) => <FeaturesPane {...props} />,") && paneRegDiff.some(l => l === "-  render: ({ lang }) => <FeaturesPane lang={lang} />,"),
  "pane-registration-only-forwards-render-props", paneRegDiff.join(" ⏎ "));
const fixedStyles = text(FIXED, `${PKG}/src/styles.css`);
const beforeStyles = text(BEFORE, `${PKG}/src/styles.css`);
check(fixedStyles.startsWith(beforeStyles), "styles-fixed-file-begins-with-before-file-byte-for-byte");
const added = fixedStyles.slice(beforeStyles.length).replace(/\/\*[\s\S]*?\*\//g, "");
const preludes = [...added.matchAll(/([^{}]+)\{/g)].map(m => m[1].trim()).filter(Boolean);
const selectors = preludes.filter(s => !s.startsWith("@"));
const flat = selectors.flatMap(s => s.split(",").map(x => x.trim()));
log(`INFO added_at_rules=${JSON.stringify(preludes.filter(s => s.startsWith("@")))}`);
log(`INFO added_selectors=${JSON.stringify(flat)}`);
check(flat.length > 0 && flat.every(s => s.startsWith(".features-pane")), "every-added-selector-scoped-under-.features-pane", `${flat.length} selector occurrences`);
check([...added.matchAll(/@([a-z-]+)/g)].every(m => m[1] === "media"), "only-at-rule-is-@media");
const commitObject = git(["cat-file", "commit", FIXED], "buffer");
const message = commitObject.toString("utf8");
log(`INFO e6-commit-object-sha256=${sha256(commitObject)} (git cat-file commit ${FIXED})`);
check(message.includes("Tests: features package 45/45") && message.includes("@repo/web 156/156"), "e6-terra-package-run-recorded-in-commit-message", "features 45/45; @repo/web 156/156");
check(git(["rev-parse", `${FIXED}^`]) === "8d53038dc0e095678f30340afd6713e2b86551e0", "e6-terra-parent-8d53038");

// ---------------------------------------------------------------------------------------------------------------
log("\n## 4. E19 independently: protected paths have identical object ids at f359be6 and 5cd63ff");
const PROTECTED = ["packages/plugin-web-storage", "packages/plugin-web-settings-shell", "packages/xai-web-shell", "packages/xai-web-pet", "packages/xai-web-cmdk", "packages/plugin-web-tokens", "packages/xai-web-settings-appearance", "packages/plugin-web-settings-rest", "packages/xai-web-dashboard-grid", "packages/xai-web-dashboard-widgets", "apps", "package.json", "pnpm-lock.yaml"];
for (const p of PROTECTED) {
  const a = git(["rev-parse", `${BEFORE}:${p}`]);
  const b = git(["rev-parse", `${FIXED}:${p}`]);
  check(a === b, `protected ${p}`, a);
}
const featuresProtected = git(["ls-tree", "-r", "--name-only", BEFORE, "--", PKG]).split("\n").filter(Boolean)
  .filter(p => !S11.some(([, q]) => q === p));
let fpSame = 0;
for (const p of featuresProtected) {
  const a = git(["rev-parse", `${BEFORE}:${p}`]);
  let b = "";
  try { b = git(["rev-parse", `${FIXED}:${p}`]); } catch { b = "MISSING"; }
  if (a === b) fpSame += 1; else check(false, `features-protected-file ${p}`, `${a} -> ${b}`);
}
check(fpSame === featuresProtected.length, "features-package-files-outside-section-11-unchanged", `${fpSame}/${featuresProtected.length} (includes src/index.ts, featureIds.ts, the 4 reader files, FeatureThumb.tsx, package.json, configs, docs/design.md, docs/dev_log.md, docs/verify-report.md)`);
for (const p of ["src/index.ts", "src/featureIds.ts", "src/useFeaturePrefs.ts", "src/filterModulesByFeaturePrefs.ts", "src/withDisabledFallback.tsx", "src/DisabledFeatureFallback.tsx", "src/internal/FeatureThumb.tsx", "package.json", "docs/design.md", "docs/dev_log.md", "docs/verify-report.md"]) {
  check(featuresProtected.includes(`${PKG}/${p}`), `named-protected-file-present-and-covered ${p}`);
}

// ---------------------------------------------------------------------------------------------------------------
log("\n## 5. E18 independently: section 10 item 9 search (outside docs/ and *.md)");
const PATTERNS = ["xai_pref_features_", "featurePrefKey(", "featurePrefKey", "resetAllFeaturePrefs", "resetAllPrefs", "useFeaturePrefs", "withDisabledFallback", "filterModulesByFeaturePrefs", "DisabledFeatureFallback", "readEnabledSearchModules"];
const counts = (rev, pattern) => {
  let out = "";
  try { out = git(["grep", "-I", "-c", "-F", "-e", pattern, rev, "--", ".", ":(exclude)docs", ":(exclude)*.md"]); } catch { out = ""; }
  return Object.fromEntries(out.split("\n").filter(Boolean).map(l => { const rest = l.slice(rev.length + 1); const i = rest.lastIndexOf(":"); return [rest.slice(0, i), Number(rest.slice(i + 1))]; }));
};
const s11Paths = new Set(S11.map(([, p]) => p));
let deltaRows = 0;
for (const pattern of PATTERNS) {
  const a = counts(BEFORE, pattern), b = counts(FIXED, pattern);
  const files = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const f of files) {
    if ((a[f] ?? 0) === (b[f] ?? 0)) continue;
    deltaRows += 1;
    check(s11Paths.has(f), `search-delta-in-section-11-file ${pattern} ${f}`, `${a[f] ?? 0}->${b[f] ?? 0}`);
  }
}
check(deltaRows === 9, "search-delta-row-count-equals-E18-receipt(9)", String(deltaRows));
const productSrc = git(["ls-tree", "-r", "--name-only", FIXED, "--", `${PKG}/src`]).split("\n").filter(p => p && !p.includes("/__tests__/") && /\.(ts|tsx)$/.test(p));
const srcText = Object.fromEntries(productSrc.map(p => [p, text(FIXED, p)]));
const countIn = (paths, needle) => paths.reduce((n, p) => n + (srcText[p].split(needle).length - 1), 0);
check(countIn(productSrc, "new StorageEvent") === 0 && countIn(productSrc, "dispatchEvent(") === 0, "features-product-source-zero-StorageEvent-and-dispatchEvent", `${productSrc.length} files`);
for (const needle of ["BroadcastChannel", "postMessage", "CustomEvent", "new Event(", "sessionStorage", "SettingsFooter", "confirmAction", "resetAllPrefs"]) {
  check(countIn(productSrc, needle) === 0, `features-product-source-zero ${needle} (additional, D2/D3)`);
}
const paneAndHelpers = [`${PKG}/src/FeaturesPane.tsx`, `${PKG}/src/internal/featuresRecovery.ts`, `${PKG}/src/internal/featuresRecoveryCopy.ts`];
for (const needle of ["usePref(", "setPref(", "removePref(", "localStorage", "getPref("]) {
  check(countIn(paneAndHelpers, needle) === 0, `pane-and-helpers-zero ${needle}`);
}

// ---------------------------------------------------------------------------------------------------------------
log("\n## 6. Evidence hashes: every artifact enumerated by E25 recomputed from the committed blob, provenance, primary receipts");
const ITEM = {
  E1: { commit: "11e0afb6d9c6932314f5434dc5d53e5a51c8cdca", receipts: [`${R}/web-features-recovery-sol/README.md`] },
  E2: { commit: "11e0afb6d9c6932314f5434dc5d53e5a51c8cdca", receipts: [`${R}/web-features-recovery-sol/README.md`] },
  E3: { commit: "b732c27f330eb3368901d38f4423722f651c112f", receipts: [`${R}/web-features-recovery-independent/before-f359be6.md`] },
  E4: { commit: "4c5323f70d55e66d3627ee79d4fd84ef9d19dd2c", receipts: [`${R}/web-features-recovery-native/before-f359be6.md`] },
  E5: { commit: "4c5323f70d55e66d3627ee79d4fd84ef9d19dd2c", receipts: [`${R}/web-features-recovery-f1/before-f359be6.md`] },
  E6: { commit: FIXED, receipts: [`${R}/web-features-recovery-final/review-final-regressions-5cd63ff.md`], rev: FIXED },
  E7: { commit: "eb37a59cde093e4433923aefb5a2354aca6f1129", receipts: [`${R}/web-features-recovery-sol/fixed-5cd63ff.md`] },
  E8: { commit: "eb37a59cde093e4433923aefb5a2354aca6f1129", receipts: [`${R}/web-features-recovery-independent/fixed-5cd63ff.md`] },
  E9: { commit: "58a93ef2d4a27ef53bc2944078b3f0e1e5cdc844", receipts: [`${R}/web-features-recovery-native/review-controls-reset-export-5cd63ff.md`] },
  E10: { commit: "58a93ef2d4a27ef53bc2944078b3f0e1e5cdc844", receipts: [`${R}/web-features-recovery-native/review-controls-reset-export-5cd63ff.md`] },
  E11: { commit: "58a93ef2d4a27ef53bc2944078b3f0e1e5cdc844", receipts: [`${R}/web-features-recovery-native/review-controls-reset-export-5cd63ff.md`] },
  E12: { commit: "312b27c873b16c84b2aca66210d96a52777c1447", receipts: [`${R}/web-features-recovery-native/review-host-downstream-5cd63ff.md`] },
  E13: { commit: "312b27c873b16c84b2aca66210d96a52777c1447", receipts: [`${R}/web-features-recovery-native/review-host-downstream-5cd63ff.md`] },
  E14: { commit: "5905e3750f39f6ab12ab7b6a8a697a2507b90c5a", receipts: [`${R}/web-features-recovery-native/review-visual-keyboard-5cd63ff.md`, `${R}/web-features-recovery-native/native-5cd63ff-v2-visual.log`, `${R}/web-features-recovery-native/native-5cd63ff-v2-visual-zh.log`, `${R}/web-features-recovery-native/native-5cd63ff-v1-visual.log`, `${R}/web-features-recovery-native/native-5cd63ff-v1-visual-zh.log`] },
  E15: { commit: "5905e3750f39f6ab12ab7b6a8a697a2507b90c5a", receipts: [`${R}/web-features-recovery-native/review-visual-keyboard-5cd63ff.md`] },
  E16: { commit: "eb37a59cde093e4433923aefb5a2354aca6f1129", receipts: [`${R}/web-features-recovery-f1/fixed-5cd63ff.md`] },
  E17: { commit: "eb37a59cde093e4433923aefb5a2354aca6f1129", receipts: [`${R}/web-features-recovery-f1/fixed-5cd63ff.md`] },
};
for (const id of ["E18", "E19", "E20", "E21", "E22", "E23", "E24"]) ITEM[id] = { commit: FINAL, receipts: [`${R}/web-features-recovery-final/review-final-regressions-5cd63ff.md`, `${R}/web-features-recovery-final/hashes-features-final-v1.log`] };
const hashLog = text(HEAD, `${R}/web-features-recovery-final/hashes-features-final-v1.log`).split("\n");
const entries = [];
let section = null;
for (const line of hashLog) {
  const head = line.match(/^## (E\d+)(-[a-zA-Z0-9-]+)?\s+(?:producing commit ([0-9a-f]{40})|produced by this batch)/);
  if (head) { section = { id: head[1], sub: head[2] ?? "", commit: head[3] ?? FINAL }; continue; }
  const m = line.match(/^ {2}([0-9a-f]{64}) (\S+) \|/);
  if (m && section) entries.push({ ...section, hash: m[1], path: m[2] });
}
log(`INFO e25_hash_log_entries=${entries.length} distinct_paths=${new Set(entries.map(e => e.path)).size}`);
const receiptCache = new Map();
const receiptText = (p) => { if (!receiptCache.has(p)) receiptCache.set(p, text(HEAD, p)); return receiptCache.get(p); };
const perItem = {};
for (const e of entries) {
  const spec = ITEM[e.id];
  const rev = spec.rev ?? HEAD;
  const data = blob(rev, e.path);
  const got = sha256(data);
  const it = (perItem[e.id] ??= { files: 0, ok: 0, full: 0, prefix: 0, self: 0, none: 0, provenance: 0 });
  it.files += 1;
  if (got === e.hash) it.ok += 1; else check(false, `hash-mismatch ${e.id}${e.sub} ${e.path}`, `${got} vs e25 ${e.hash}`);
  if (rev === HEAD) {
    const wt = sha256(readFileSync(join(ROOT, e.path)));
    if (wt !== got) check(false, `worktree-differs ${e.path}`);
    const last = git(["log", "-1", "--format=%H", "--", e.path]);
    const addedIn = git(["log", "--diff-filter=A", "--format=%H", "--", e.path]);
    const expectedCommit = e.sub === "-cited-E7" ? ITEM.E7.commit : spec.commit;
    if (last === expectedCommit && addedIn === expectedCommit) it.provenance += 1;
    else check(false, `provenance ${e.id}${e.sub} ${e.path}`, `last=${last} added=${addedIn} expected=${expectedCommit}`);
  } else {
    if (git(["log", "-1", "--format=%H", FIXED, "--", e.path]) === FIXED) it.provenance += 1;
    else check(false, `provenance ${e.id} ${e.path}`);
  }
  const receipts = e.sub === "-cited-E7" ? ITEM.E7.receipts : spec.receipts;
  if (receipts.includes(e.path)) it.self += 1;
  else if (receipts.some(r => r !== e.path && receiptText(r).includes(got))) it.full += 1;
  else if (receipts.some(r => r !== e.path && new RegExp(`\\b${got.slice(0, 8)}`).test(receiptText(r)))) it.prefix += 1;
  else it.none += 1;
}
for (const [id, it] of Object.entries(perItem)) {
  check(it.ok === it.files && it.provenance === it.files, `${id} all enumerated artifacts recomputed and in their producing commit`,
    `files=${it.files} sha_ok=${it.ok} provenance_ok=${it.provenance} primary_receipt_full=${it.full} primary_receipt_prefix8=${it.prefix} receipt_itself=${it.self} not_in_primary_receipt=${it.none}`);
}
for (const id of Object.keys(ITEM)) check(perItem[id]?.files > 0, `${id} present in the E25 enumeration`);

log("\n## 7. One principal artifact per item: recomputed here and found in full in its primary receipt");
const PRINCIPAL = [
  ["E1", `${R}/web-features-recovery-sol/verify-fixed.mjs`, `${R}/web-features-recovery-sol/README.md`],
  ["E1", `${R}/web-features-recovery-sol/fixture.tsx`, `${R}/web-features-recovery-sol/README.md`],
  ["E2", `${R}/web-features-recovery-sol/fields-before2-f359be6.log`, `${R}/web-features-recovery-sol/README.md`],
  ["E2", `${R}/web-features-recovery-sol/downstream-before2-f359be6.log`, `${R}/web-features-recovery-sol/README.md`],
  ["E3", `${R}/web-features-recovery-independent/host-before1-f359be6.log`, `${R}/web-features-recovery-independent/before-f359be6.md`],
  ["E4", `${R}/web-features-recovery-native/native-f359be6-before1-h6.log`, `${R}/web-features-recovery-native/before-f359be6.md`],
  ["E4", `${R}/web-features-recovery-native/native-f359be6-before1-h10-375-zh.png`, `${R}/web-features-recovery-native/before-f359be6.md`],
  ["E5", `${R}/web-features-recovery-f1/f1-f359be6-features-before1.log`, `${R}/web-features-recovery-f1/before-f359be6.md`],
  ["E6", `${PKG}/src/internal/featuresRecovery.ts`, `${R}/web-features-recovery-final/review-final-regressions-5cd63ff.md`, FIXED],
  ["E7", `${R}/web-features-recovery-sol/reset-fixed1-5cd63ff.log`, `${R}/web-features-recovery-sol/fixed-5cd63ff.md`],
  ["E8", `${R}/web-features-recovery-independent/host-fixed1-5cd63ff.log`, `${R}/web-features-recovery-independent/fixed-5cd63ff.md`],
  ["E9", `${R}/web-features-recovery-native/native-5cd63ff-fixed1-controls.log`, `${R}/web-features-recovery-native/review-controls-reset-export-5cd63ff.md`],
  ["E10", `${R}/web-features-recovery-native/native-5cd63ff-fixed1-reset.log`, `${R}/web-features-recovery-native/review-controls-reset-export-5cd63ff.md`],
  ["E11", `${R}/web-features-recovery-native/native-5cd63ff-fixed1-export-x5-all-eight-pending-resets-features-draft.json`, `${R}/web-features-recovery-native/review-controls-reset-export-5cd63ff.md`],
  ["E12", `${R}/web-features-recovery-native/native-5cd63ff-fixed1-host.log`, `${R}/web-features-recovery-native/review-host-downstream-5cd63ff.md`],
  ["E13", `${R}/web-features-recovery-native/native-5cd63ff-fixed1-downstream.log`, `${R}/web-features-recovery-native/review-host-downstream-5cd63ff.md`],
  ["E14", `${R}/web-features-recovery-native/native-5cd63ff-v2-visual-zh.log`, `${R}/web-features-recovery-native/review-visual-keyboard-5cd63ff.md`],
  ["E14", `${R}/web-features-recovery-native/native-5cd63ff-v2-visual-zh-768-pet-on-clean.png`, `${R}/web-features-recovery-native/native-5cd63ff-v2-visual-zh.log`],
  ["E15", `${R}/web-features-recovery-native/native-5cd63ff-v2-visual.log`, `${R}/web-features-recovery-native/review-visual-keyboard-5cd63ff.md`],
  ["E16", `${R}/web-sticky-recovery-f1/f1-5cd63ff-race-fixed1.log`, `${R}/web-features-recovery-f1/fixed-5cd63ff.md`],
  ["E16", `${R}/web-sticky-recovery-f1/f1-5cd63ff-sticky-fixed1.log`, `${R}/web-features-recovery-f1/fixed-5cd63ff.md`],
  ["E17", `${R}/web-features-recovery-f1/f1-5cd63ff-features-fixed1.log`, `${R}/web-features-recovery-f1/fixed-5cd63ff.md`],
  ["E18", `${R}/web-features-recovery-final/search-features-final-v1-5cd63ff.log`, `${R}/web-features-recovery-final/review-final-regressions-5cd63ff.md`],
  ["E19", `${R}/web-features-recovery-final/protected-diff-features-final-v1-5cd63ff.log`, `${R}/web-features-recovery-final/review-final-regressions-5cd63ff.md`],
  ["E20", `${R}/web-features-recovery-final/storage-check-types-features-final-v1-5cd63ff.log`, `${R}/web-features-recovery-final/review-final-regressions-5cd63ff.md`],
  ["E20", `${R}/web-features-recovery-sol/bytes-features-final-v1-5cd63ff.log`, `${R}/web-features-recovery-final/review-final-regressions-5cd63ff.md`],
  ["E21", `${R}/web-features-recovery-final/features-test-features-final-v1-5cd63ff.log`, `${R}/web-features-recovery-final/review-final-regressions-5cd63ff.md`],
  ["E21", `${R}/web-features-recovery-final/features-readers-features-final-v1-f359be6.log`, `${R}/web-features-recovery-final/review-final-regressions-5cd63ff.md`],
  ["E22", `${R}/web-features-recovery-final/web-test-features-final-v1-5cd63ff.log`, `${R}/web-features-recovery-final/review-final-regressions-5cd63ff.md`],
  ["E23", `${R}/web-features-recovery-final/settings-shell-test-features-final-v1-5cd63ff.log`, `${R}/web-features-recovery-final/review-final-regressions-5cd63ff.md`],
  ["E24", `${R}/web-features-recovery-final/settings-rest-test-features-final-v1-5cd63ff.log`, `${R}/web-features-recovery-final/review-final-regressions-5cd63ff.md`],
  ["E24", `${R}/web-features-recovery-final/compare-accepted-features-final-v1.log`, `${R}/web-features-recovery-final/review-final-regressions-5cd63ff.md`],
  ["E25", `${R}/web-features-recovery-final/hashes-features-final-v1.log`, `${R}/web-features-recovery-final/review-final-regressions-5cd63ff.md`],
];
for (const [id, path, receipt, rev = HEAD] of PRINCIPAL) {
  const got = sha256(blob(rev, path));
  check(receiptText(receipt).includes(got), `${id} principal ${path}`, `sha256=${got} found_in=${receipt}`);
}
const e25Hash = sha256(blob(HEAD, `${R}/web-features-recovery-final/review-final-regressions-5cd63ff.md`));
check(e25Hash.startsWith("eab9c343") && git(["log", "--format=%H", "--", `${R}/web-features-recovery-final/review-final-regressions-5cd63ff.md`]) === FINAL,
  "E25 receipt recomputed (control plane records eab9c343...) and produced only by 0056299", e25Hash);
const e25Ids = [...e25Receipt.matchAll(/^\| (E\d+) \|/gm)].map(m => m[1]);
const want = Array.from({ length: 24 }, (_, i) => `E${i + 1}`);
check(want.every(id => e25Ids.includes(id)), "E25 enumerates E1-E24 in its section 7 table", e25Ids.filter(id => want.includes(id)).length + "/24");

// ---------------------------------------------------------------------------------------------------------------
log("\n## 8. E14 screenshots: every v2 PNG hash equals its v2 log screenshot record");
for (const logName of ["native-5cd63ff-v2-visual.log", "native-5cd63ff-v2-visual-zh.log"]) {
  const recs = text(HEAD, `${R}/web-features-recovery-native/${logName}`).split("\n").filter(l => l.startsWith('{"name":"screenshot"')).map(l => JSON.parse(l));
  let ok = 0;
  for (const rec of recs) {
    const got = sha256(blob(HEAD, `${R}/web-features-recovery-native/${rec.file}`));
    if (got === rec.sha256) ok += 1; else check(false, `png ${rec.file}`, `${got} vs ${rec.sha256}`);
  }
  check(recs.length === 12 && ok === 12, `e14-png-hashes ${logName}`, `${ok}/${recs.length}`);
}

// ---------------------------------------------------------------------------------------------------------------
log("\n## 9. E11 disk JSON: envelope shape (parsed from the committed artifacts)");
const IDS = ["tasks", "board", "dashboard", "calendar", "matrix", "pomodoro", "habits", "meditation"];
const jsons = git(["ls-tree", "--name-only", HEAD, `${R}/web-features-recovery-native/`]).split("\n").filter(p => p.endsWith("-features-draft.json"));
for (const p of jsons) {
  const raw = blob(HEAD, p).toString("utf8");
  let env; try { env = JSON.parse(raw); } catch { env = null; }
  const device = env?.changes?.device ?? {};
  const shapeOk = env && env.version === 1 && env.kind === "features-draft" && JSON.stringify(Object.keys(env.changes)) === '["device"]'
    && Object.keys(env).sort().join(",") === "changes,kind,version"
    && Object.entries(device).every(([k, v]) => IDS.includes(k) && ((v.operation === "set" && typeof v.value === "boolean" && Object.keys(v).length === 2) || (v.operation === "reset" && Object.keys(v).length === 1)))
    && !/xai_pref|xai:account|xai:demo|account|timestamp/i.test(raw);
  const summary = Object.entries(device).map(([k, v]) => `${k}:${v.operation}${v.operation === "set" ? "=" + v.value : ""}`).join(",");
  check(shapeOk, `e11-envelope ${p.split("/").pop()}`, summary);
}
const x5 = JSON.parse(blob(HEAD, `${R}/web-features-recovery-native/native-5cd63ff-fixed1-export-x5-all-eight-pending-resets-features-draft.json`).toString("utf8"));
check(JSON.stringify(Object.keys(x5.changes.device).sort()) === JSON.stringify([...IDS].sort()) && Object.values(x5.changes.device).every(v => v.operation === "reset"), "e11-x5-all-eight-pending-resets-are-8-reset-entries");
check(jsons.length === 10, "e11-ten-disk-artifacts(9 shapes + recovered x10b)", String(jsons.length));

// ---------------------------------------------------------------------------------------------------------------
log("\n## 10. Log content assertions (before failures correct, fixed results PASS)");
const totals = (path) => { const l = text(HEAD, path).split("\n").find(x => x.startsWith("totals ")); return l ?? ""; };
const SOL_BEFORE = { bytes: [17, 0], fields: [0, 49], reset: [2, 29], queues: [0, 40], "continuity-export": [3, 23], downstream: [9, 6], original: [6, 0], "readers-features": [17, 0], "readers-web": [18, 0] };
for (const [mode, [p, f]] of Object.entries(SOL_BEFORE)) {
  const t = totals(`${R}/web-features-recovery-sol/${mode}-before2-f359be6.log`);
  check(t.includes(`passed=${p} failed=${f}`) && t.includes("precondition_failures=0"), `E2 ${mode} before2`, t);
  const u = totals(`${R}/web-features-recovery-sol/${mode}-fixed1-5cd63ff.log`);
  check(u.includes(`passed=${p + f} failed=0`) && u.includes("precondition_failures=0") && u.includes("unhandled_error_lines=0"), `E7 ${mode} fixed1`, u);
}
for (const mode of Object.keys(SOL_BEFORE)) {
  const before = text(HEAD, `${R}/web-features-recovery-sol/${mode}-before2-f359be6.log`);
  check(!/^case \d+ FAILED PRECONDITION/m.test(before) && !/PRECONDITION:/.test(before), `E2 ${mode} zero PRECONDITION lines`);
}
check(totals(`${R}/web-features-recovery-independent/host-before1-f359be6.log`).includes("passed=7 failed=33") && totals(`${R}/web-features-recovery-independent/host-before1-f359be6.log`).includes("precondition_failures=0"), "E3 host before1 7/33, precondition 0");
check(totals(`${R}/web-features-recovery-independent/host-fixed1-5cd63ff.log`).includes("passed=40 failed=0") && totals(`${R}/web-features-recovery-independent/host-fixed1-5cd63ff.log`).includes("runtime_error_lines=0"), "E8 host fixed1 40/40, runtime errors 0");
const last = (path) => { const ls = text(HEAD, path).trim().split("\n"); return JSON.parse(ls[ls.length - 1]); };
const h5 = last(`${R}/web-features-recovery-native/native-f359be6-before1-h5.log`);
const h6 = last(`${R}/web-features-recovery-native/native-f359be6-before1-h6.log`);
const h10 = last(`${R}/web-features-recovery-native/native-f359be6-before1-h10.log`);
check(JSON.stringify(h5.requirementFailures) === JSON.stringify(["H5-a:event-dispatched-despite-fault", "H5-d:no-failure-feedback-or-retry"]) && h5.runtimeErrors === 0, "E4 h5 correct before FAILs (H5-a, H5-d)", JSON.stringify(h5.requirementFailures));
check(JSON.stringify(h6.requirementFailures) === JSON.stringify(["§10.5-during:no-relock-gate-or-remount"]) && h6.runtimeErrors === 0, "E4 h6 correct before FAIL (section 10.5 during)", JSON.stringify(h6.requirementFailures));
check(JSON.stringify(h10.requirementFailures) === JSON.stringify(["H10-en-b:375-grid-minimum-overflows-pane", "H10-zh-b:375-grid-minimum-overflows-pane"]) && h10.runtimeErrors === 0, "E4 h10 correct before FAILs (EN, ZH)", JSON.stringify(h10.requirementFailures));
const f1b = last(`${R}/web-features-recovery-f1/f1-f359be6-features-before1.log`);
const f1s = last(`${R}/web-features-recovery-f1/f1-f359be6-selfcheck-before1.log`);
check(f1b.verdict === "before-not-held" && f1b.deferredFailures.length === 8 && f1s.verdict === "harness-valid" && f1s.checks === 105, "E5 F1 features before-not-held (8 deferred) and selfcheck harness-valid (105)");
for (const [id, name] of [["E9", "native-5cd63ff-fixed1-controls.log"], ["E10", "native-5cd63ff-fixed1-reset.log"], ["E11", "native-5cd63ff-fixed1-export.log"], ["E12", "native-5cd63ff-fixed1-host.log"], ["E13", "native-5cd63ff-fixed1-downstream.log"], ["E14/E15", "native-5cd63ff-v2-visual.log"], ["E14/E15", "native-5cd63ff-v2-visual-zh.log"]]) {
  const p = `${R}/web-features-recovery-native/${name}`;
  const r = last(p);
  const falses = text(HEAD, p).split('"pass":false').length - 1;
  check(r.pass === true && r.runtimeErrors === 0 && falses === 0, `${id} ${name}`, `pass=${r.pass} checks=${r.checks} product=${r.productChecks} pass_false_records=${falses}`);
}
for (const mode of ["sticky", "more", "collaborate", "selfcheck", "notifications", "date-time", "smart-lists", "header", "pomodoro", "race"]) {
  const p = `${R}/web-sticky-recovery-f1/f1-5cd63ff-${mode}-fixed1.log`;
  const body = text(HEAD, p);
  const r = last(p);
  check(r.pass === true && !body.includes('"pass":false') && !body.includes("Invalid blocker state transition"), `E16 ${mode}`, `verdict=${r.verdict ?? "pass"} checks=${r.checks}`);
}
const f1f = last(`${R}/web-features-recovery-f1/f1-5cd63ff-features-fixed1.log`);
check(f1f.verdict === "fixed-pass" && f1f.pass === true && f1f.runtimeErrors === 0 && f1f.deferredFailures.length === 0, "E17 F1 features fixed-pass", `checks=${f1f.checks}`);
const outcomes = JSON.stringify(f1f.cases ?? f1f.outcomes ?? f1f);
check(["r1", "d1", "r2", "rb"].every(c => outcomes.includes(`"${c}"`)), "E17 cases r1 d1 r2 rb present in the result record");
const finalLog = (n) => text(HEAD, `${R}/web-features-recovery-final/${n}`);
const exitOf = (n) => (finalLog(n).match(/^exit=(\d+)$/m) ?? [])[1];
for (const n of ["search-features-final-v1-5cd63ff.log", "protected-diff-features-final-v1-5cd63ff.log", "storage-check-types-features-final-v1-5cd63ff.log", "features-typecheck-features-final-v1-5cd63ff.log", "features-lint-features-final-v1-5cd63ff.log", "web-check-types-features-final-v1-5cd63ff.log", "web-lint-features-final-v1-5cd63ff.log"]) {
  check(exitOf(n) === "0", `E18-E22 ${n} exit=0`);
}
for (const [n, t] of [["features-test-features-final-v1-5cd63ff.log", "files=7 tests=45 passed=45 failed=0"], ["features-readers-features-final-v1-5cd63ff.log", "files=5 tests=17 passed=17 failed=0"], ["features-readers-features-final-v1-f359be6.log", "files=5 tests=17 passed=17 failed=0"], ["web-test-features-final-v1-5cd63ff.log", "files=28 tests=156 passed=156 failed=0"], ["settings-shell-test-features-final-v1-5cd63ff.log", "files=11 tests=54 passed=54 failed=0"], ["settings-rest-test-features-final-v1-5cd63ff.log", "files=44 tests=314 passed=314 failed=0"]]) {
  check(exitOf(n) === "0" && finalLog(n).includes(`totals ${t}`), `E21-E24 ${n}`, t);
}
check(text(HEAD, `${R}/web-features-recovery-sol/bytes-features-final-v1-5cd63ff.log`).includes("totals cases=17 passed=17 failed=0") && /case 004 PASSED/.test(text(HEAD, `${R}/web-features-recovery-sol/bytes-features-final-v1-5cd63ff.log`)), "E20 Sol bytes 17/17 with lifecycle case 004 PASSED");
const CALLERS = { "more-fields": 22, "more-reset": 20, "more-queues": 14, "more-owner-export": 13, "more-original": 15, "more-host": 11, "notifications-core": 11, "notifications-recovery": 3, "notifications-operations": 2, "notifications-boundaries": 4, "notifications-extended": 10, "notifications-original": 11, "notifications-astra-boundaries": 24, "notifications-astra-host": 15, "notifications-parent-host": 12, datetime: 7 };
for (const [mode, n] of Object.entries(CALLERS)) {
  const t = totals(`${R}/web-features-recovery-final/${mode}-features-final-v1-5cd63ff.log`);
  check(t.includes(`cases=${n} passed=${n} failed=0`) && exitOf(`${mode}-features-final-v1-5cd63ff.log`) === "0", `E24 ${mode} @5cd63ff`, t.slice(0, 60));
}
for (const [mode, n] of [["bytes", 13], ["fields", 47], ["queues", 27], ["continuity-export", 22], ["original", 10]]) {
  const body = text(HEAD, `${R}/web-sticky-recovery-sol/${mode}-features-final-v1-5cd63ff.log`);
  check(new RegExp(`Tests\\s+${n} passed \\(${n}\\)`).test(body), `E24 sticky ${mode} ${n}`);
}
check(/Tests\s+28 passed \(28\)/.test(text(HEAD, `${R}/web-sticky-recovery-independent/host-features-final-v1-5cd63ff.log`)), "E24 sticky host 28");
const mb = (s, r) => totals(`${R}/web-features-recovery-final/more-boundaries-features-final-${s}-${r}.log`);
log(`INFO E24 more-boundaries (frozen oracle): v1@5cd63ff ${mb("v1", "5cd63ff")} | v1@f359be6 ${mb("v1", "f359be6")} | v2@5cd63ff ${mb("v2", "5cd63ff")} | v2@f359be6 ${mb("v2", "f359be6")}`);

// ---------------------------------------------------------------------------------------------------------------
log("\n## 11. F-B002 (batch 31, 05b21f4): corrected oracle, hashes, matrix recomputed from the 72 run logs");
const FB = `${R}/web-more-recovery-fb002`;
const reviewFb = text(HEAD, `${FB}/review-fb002.md`);
check(sha256(blob(HEAD, `${FB}/review-fb002.md`)).startsWith("d1fa0e42"), "fb002 receipt hash (control plane records d1fa0e42...)", sha256(blob(HEAD, `${FB}/review-fb002.md`)));
const listed = [...reviewFb.matchAll(/^([0-9a-f]{64}) {2}(\S+)$/gm)].map(m => [m[1], m[2]]);
let fbOk = 0;
for (const [h, p] of listed) {
  const got = sha256(blob(HEAD, `${FB}/${p}`));
  const prov = git(["log", "--format=%H", "--", `${FB}/${p}`]) === FB002;
  if (got === h && prov) fbOk += 1; else check(false, `fb002 file ${p}`, `${got} vs ${h} prov=${prov}`);
}
check(listed.length === 83 && fbOk === 83, "fb002 all 83 listed files recomputed = receipt, each added only in 05b21f4", `${fbOk}/${listed.length}`);
const frozen = text(HEAD, `${R}/web-more-recovery-sol/boundaries.test.tsx`).split("\n");
const corrected = text(HEAD, `${FB}/boundaries.corrected.test.tsx`).split("\n");
const diffLines = frozen.map((l, i) => (l === corrected[i] ? null : i + 1)).filter(Boolean);
check(frozen.length === corrected.length && JSON.stringify(diffLines) === "[18,19]", "fb002 corrected oracle differs from the frozen oracle only on L18-19", `lines=${frozen.length} differing=${JSON.stringify(diffLines)}`);
check(sha256(blob(HEAD, `${R}/web-more-recovery-sol/boundaries.test.tsx`)) === "dcbaf57e55f7e907660abacaf233de83dcf769da97b878a9036e358a3dd8ef3e" && sha256(blob(HEAD, `${R}/web-more-recovery-sol/fixture.tsx`)) === "b117d2044850cbea822367a0f2bbe9a326e27e4c9b5e5537427b5e0b37b87928", "fb002 frozen More oracle and fixture unchanged (dcbaf57e..., b117d204...)");
check(git(["log", "--format=%H", "--", `${R}/web-more-recovery-sol/boundaries.test.tsx`]) === git(["rev-parse", "8e12334^{commit}"]), "fb002 frozen oracle has one commit (8e12334)");
const matrix = {};
for (const name of git(["ls-tree", "--name-only", HEAD, `${FB}/logs/`]).split("\n").filter(p => /\/(corrected|original)-(full|case002)-v1r\d+-[0-9a-f]+\.log$/.test(p))) {
  const body = text(HEAD, name);
  const [, oracle, scope, rev] = name.match(/\/(corrected|original)-(full|case002)-v1r\d+-([0-9a-f]+)\.log$/);
  const t = body.split("\n").find(l => l.startsWith("totals ")) ?? "";
  const passed = Number((t.match(/passed=(\d+)/) ?? [])[1]);
  const failed = Number((t.match(/failed=(\d+)/) ?? [])[1]);
  const rangeLine = body.split("\n").find(l => l.startsWith("rangeerror ")) ?? "";
  const rangeCases = Number((rangeLine.match(/cases=(\d+)/) ?? [])[1] ?? 0);
  const c002 = /case 002 PASSED/.test(body);
  const key = `${oracle}/${scope}/${rev}`;
  const cell = (matrix[key] ??= { runs: 0, clean: 0, c002: 0, range: 0 });
  cell.runs += 1; if (failed === 0 && passed > 0) cell.clean += 1; if (c002) cell.c002 += 1; if (rangeCases > 0) cell.range += 1;
}
for (const [k, c] of Object.entries(matrix).sort()) log(`INFO fb002 cell ${k}: runs=${c.runs} all_pass_runs=${c.clean} case002_pass=${c.c002} runs_with_rangeerror=${c.range}`);
for (const rev of ["7b216a3", "f359be6", "5cd63ff"]) {
  const c = matrix[`corrected/full/${rev}`];
  check(c && c.runs === 10 && c.clean === 10 && c.c002 === 10 && c.range === 0, `fb002 corrected full @${rev} 10/10 runs all-pass, 0 RangeError`);
  const d = matrix[`corrected/case002/${rev}`];
  check(d && d.runs === 3 && d.c002 === 3, `fb002 corrected case002 alone @${rev} 3/3`);
}
const before = matrix["corrected/full/afbfb24"];
check(before && before.runs === 10 && before.c002 === 0 && before.range === 0, "fb002 corrected full @afbfb24: case 002 fails 10/10 with 0 RangeError (business before failure)");
let businessBefore = 0;
for (const name of git(["ls-tree", "--name-only", HEAD, `${FB}/logs/`]).split("\n").filter(p => /\/corrected-(full|case002)-v1r\d+-afbfb24\.log$/.test(p))) {
  if (text(HEAD, name).includes("expected null to be 'invalid-bool'")) businessBefore += 1;
}
check(businessBefore === 13, "fb002 corrected oracle @afbfb24: 13/13 runs carry the business assertion expected null to be 'invalid-bool'", String(businessBefore));

// ---------------------------------------------------------------------------------------------------------------
log("\n## 12. Ruling facts read from the committed evidence");
const obs = (name, id) => text(HEAD, `${R}/web-features-recovery-native/${name}`).split("\n").filter(l => l.includes(`"id":"${id}"`)).map(l => JSON.parse(l))[0];
for (const [lang, name] of [["EN", "native-5cd63ff-v2-visual.log"], ["ZH", "native-5cd63ff-v2-visual-zh.log"]]) {
  for (const stage of ["before", "fixed"]) {
    for (const w of [375, 414, 768, 1024, 1440]) {
      const o = obs(name, `${stage}:${w}:pet-on-default-position`);
      const nf = (o?.notFullyHit ?? []).map(x => `${x.desc}(center=${x.centerTarget},petHits=${x.petHits})`).join(";") || "none";
      log(`INFO R-PET ${lang} ${stage} ${w}: pet=${JSON.stringify(o?.pet?.rect)} covered=${JSON.stringify(o?.coveredByPet)} notFullyHit=${nf}`);
      if (w !== 768) check((o?.coveredByPet ?? []).length === 0, `R-PET ${lang} ${stage} ${w} no pet coverage`);
    }
  }
}
const statusRec = (name) => text(HEAD, `${R}/web-features-recovery-native/${name}`).split("\n").filter(l => l.includes('"action":"Enter on Discard all changes"')).map(l => JSON.parse(l))[0];
for (const [lang, name] of [["EN", "native-5cd63ff-v2-visual.log"], ["ZH", "native-5cd63ff-v2-visual-zh.log"]]) {
  const r = statusRec(name);
  const allDisplayedEqualStored = IDS.every(id => (r.physical[id] === null ? "true" : r.physical[id]) === r.displayed[id]);
  log(`INFO ruling-6 ${lang} keyboard Discard all: status=${JSON.stringify(r.status)} mutations=${r.mutations.length} recovery_blocks=${r.recovery.length} focus=${r.focus.desc} inPane=${r.focus.inPane} featureReads=${r.featureReads.length} displayed_equals_stored=${allDisplayedEqualStored} physical=${JSON.stringify(r.physical)}`);
  check(r.mutations.length === 0 && r.recovery.length === 0 && allDisplayedEqualStored && r.focus.inPane === true, `ruling-6 ${lang} after Discard all: zero mutations, no drafts, every displayed value equals stored bytes, focus in pane`);
}

// ---------------------------------------------------------------------------------------------------------------
log("\n## 13. Evidence directories only ever received additions");
for (const dir of ["web-features-recovery-sol", "web-features-recovery-independent", "web-features-recovery-native", "web-features-recovery-f1", "web-features-recovery-final", "web-more-recovery-fb002", "web-features-recovery-contract"]) {
  const statuses = git(["log", "--format=", "--name-status", "--", `${R}/${dir}`]).split("\n").filter(Boolean).map(l => l[0]);
  check(statuses.length > 0 && statuses.every(s => s === "A"), `only-additions ${dir}`, `${statuses.length} entries`);
}

// ---------------------------------------------------------------------------------------------------------------
log("\n## 14. This review's single bounded rerun (corrected More boundaries oracle at 5cd63ff, runner verify-fb002.mjs)");
const rerunPath = join(HERE, "corrected-full-accept1-5cd63ff.log");
if (existsSync(rerunPath)) {
  const body = readFileSync(rerunPath, "utf8");
  const has = (s) => body.includes(s);
  log(`INFO rerun_log_sha256=${sha256(readFileSync(rerunPath))}`);
  check(has("requested_revision=5cd63ff") && has(`resolved_commit=${FIXED}`) && has("oracle=corrected") && has("scope=full"), "rerun identity (5cd63ff, corrected, full)");
  check(has(`expected_lockfile_sha256=${LOCK}`) && has(`dependency_lockfile_sha256=${LOCK}`) && has(`archive_lockfile_sha256=${LOCK}`) && has(`extracted_lockfile_sha256=${LOCK}`), "rerun lockfile gate (4 equal values)");
  check(has("runner_sha256=d2150cd4794f7a51a5b72d9a7260dd8b7996a5c35adaa655da85719bfaf936a4") && has("oracle_run_sha256=2e88c1db3e4045ef44c856b86b23f61322ca5002a45062f80a494cb3ac5e50f8") && has("frozen_fixture_sha256=b117d2044850cbea822367a0f2bbe9a326e27e4c9b5e5537427b5e0b37b87928"), "rerun used the committed runner, corrected oracle and frozen fixture");
  check(has("pin_unaliased_repo_imports=0") && has("pin_required_provenance_missing=none") && has("harness_checks=PASS (19/19)"), "rerun @repo pin guard and harness");
  check(has("vitest_exit=0") && /^exit=0$/m.test(body) && has("totals cases=10 passed=10 failed=0") && has("rangeerror cases=0 output_lines=0") && has("case 002 PASSED"), "rerun result 10/10, case 002 PASSED, 0 RangeError");
} else check(false, "rerun log present", rerunPath);

log(`\nsummary checks=${checks} failures=${failures}`);
log(`exit=${failures === 0 ? 0 : 1}`);
writeFileSync(OUT, lines.join("\n") + "\n", { flag: "wx" });
console.log(`${failures === 0 ? "PASS" : "FAIL"} ${OUT} checks=${checks} failures=${failures}`);
process.exitCode = failures === 0 ? 0 : 1;
