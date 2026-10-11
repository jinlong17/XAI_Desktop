#!/usr/bin/env node
// CP-APPRAIL-01 final acceptance checks (batch 65). Read-only: git object reads,
// SHA-256 re-derivation, log parsing, source greps and a pure-model property check.
// It never runs the product, a dev server, a browser or a package script.
//
// Usage (from the worktree root):
//   node docs/reviews/web-apprail-order-recovery-acceptance/verify-acceptance.mjs <scratch-dir>
// Writes docs/reviews/web-apprail-order-recovery-acceptance/acceptance-checks-f9eb4b1.log
// (refuses to overwrite). <scratch-dir> must lie outside the repository; the pure
// model `railOrderModel.ts` is extracted there from `git show f9eb4b1:` and
// imported through Node's built-in type stripping.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const OUT_DIR = "docs/reviews/web-apprail-order-recovery-acceptance";
const LOG = join(OUT_DIR, "acceptance-checks-f9eb4b1.log");
const FIXED = "f9eb4b1f207bc4b46f547b90afc250424b3c8695";
const BEFORE = "419e56de9f23e4467fea806fbd4a990e1f429941";
const CONTRACT = "docs/reviews/web-apprail-order-recovery-contract/contract.md";
const CONTRACT_SHA = "b9e407b3867ec41b2c380ac09f9efba71747c81b63d24e8263a64b7ee7095cde";
const LOCK_SHA = "df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9";
const R = "docs/reviews/";

if (existsSync(LOG)) { console.error(`refusing to overwrite ${LOG}`); process.exit(2); }
const scratch = process.argv[2];
if (!scratch || resolve(scratch).startsWith(ROOT)) { console.error("pass a scratch dir outside the repository"); process.exit(2); }
mkdirSync(scratch, { recursive: true });

const out = [];
let failures = 0;
let passes = 0;
const line = (s) => out.push(s);
const check = (id, ok, detail = "") => {
  if (ok) passes += 1; else failures += 1;
  line(`${ok ? "PASS" : "FAIL"} [${id}] ${detail}`);
  return ok;
};
const git = (...args) => execFileSync("git", args, { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 30, stdio: ["ignore", "pipe", "pipe"] });
const gitBuf = (...args) => execFileSync("git", args, { cwd: ROOT, maxBuffer: 1 << 30, stdio: ["ignore", "pipe", "pipe"] });
const sha = (buf) => createHash("sha256").update(buf).digest("hex");
const shaFile = (p) => sha(readFileSync(join(ROOT, p)));
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const lastCommit = (p) => git("log", "-1", "--format=%H", "--", p).trim();
const addCommits = (p) => git("log", "--diff-filter=A", "--format=%H", "--", p).trim().split("\n").filter(Boolean);

line("acceptance-checks=f9eb4b1");
line(`head=${git("rev-parse", "HEAD").trim()}`);
line(`node=${process.version}`);

// ---- A. Fixed points ------------------------------------------------------------
line("## A. Fixed points");
check("A1 fixed resolves", git("rev-parse", "f9eb4b1").trim() === FIXED, FIXED);
check("A2 fixed tree", git("rev-parse", "f9eb4b1^{tree}").trim() === "05887cf113639116b228a25041a37b3d5c69a322");
check("A3 docs head equals fixed product", git("diff", "--name-only", FIXED, "HEAD", "--", "apps", "packages", "package.json", "pnpm-lock.yaml").trim() === "", "git diff --name-only f9eb4b1 HEAD -- apps packages package.json pnpm-lock.yaml is empty");
check("A4 lockfile unchanged", sha(gitBuf("show", `${BEFORE}:pnpm-lock.yaml`)) === LOCK_SHA && sha(gitBuf("show", `${FIXED}:pnpm-lock.yaml`)) === LOCK_SHA, LOCK_SHA);
check("A5 contract r1 hash at HEAD", shaFile(CONTRACT) === CONTRACT_SHA, CONTRACT_SHA);
check("A6 contract r1 hash at f7726d7", sha(gitBuf("show", `f7726d7:${CONTRACT}`)) === CONTRACT_SHA);
const contractHistory = git("log", "--format=%h", "--", CONTRACT).trim().split("\n");
check("A7 contract history is r1 only", contractHistory.length === 1 && contractHistory[0].startsWith("f7726d7"), contractHistory.join(","));
check("A8 E1-E5 commits precede Terra", ["d6ea500", "6e9ec9c", "04ee6a2"].every((c) => {
  try { git("merge-base", "--is-ancestor", c, FIXED); return true; } catch { return false; }
}), "d6ea500, 6e9ec9c, 04ee6a2 are ancestors of f9eb4b1");
check("A9 Terra parent", git("rev-parse", `${FIXED}^`).trim().startsWith("145b073"), "f9eb4b1^ = 145b073");
check("A10 E6 run record parent", git("rev-parse", "0d440ca^").trim() === FIXED);

// ---- B. Product diff and protected surface -------------------------------------
line("## B. Product diff, §11 and protected paths");
const S11 = [
  "apps/web/src/App.tsx", "apps/web/src/__tests__/App.railorder.test.tsx",
  "packages/xai-web-shell/docs/api.md", "packages/xai-web-shell/docs/test.md",
  "packages/xai-web-shell/src/AppRail.tsx", "packages/xai-web-shell/src/Shell.tsx",
  "packages/xai-web-shell/src/Topbar.tsx", "packages/xai-web-shell/src/types.ts",
  "packages/xai-web-shell/src/index.ts", "packages/xai-web-shell/src/railOrderStatus.css",
  "packages/xai-web-shell/src/internal/RailOrderStatus.tsx", "packages/xai-web-shell/src/internal/railOrderController.tsx",
  "packages/xai-web-shell/src/internal/railOrderCopy.ts", "packages/xai-web-shell/src/internal/railOrderModel.ts",
  "packages/xai-web-shell/src/__tests__/AppRail.railorder.test.tsx", "packages/xai-web-shell/src/__tests__/RailOrderStatus.test.tsx",
  "packages/xai-web-shell/src/__tests__/Topbar.test.tsx", "packages/xai-web-shell/src/__tests__/railOrderFixture.tsx",
  "packages/xai-web-shell/src/__tests__/railOrderModel.test.ts",
].sort();
const productDiff = git("diff", "--name-only", BEFORE, FIXED, "--", "apps", "packages", "package.json", "pnpm-lock.yaml").trim().split("\n").sort();
check("B1 product diff = 19 §11 files", JSON.stringify(productDiff) === JSON.stringify(S11), `${productDiff.length} files`);
const fullOutsideDocs = git("diff", "--name-only", BEFORE, FIXED).trim().split("\n").filter((p) => !p.startsWith("docs/")).sort();
check("B2 full diff outside docs/ = same 19", JSON.stringify(fullOutsideDocs) === JSON.stringify(S11));
check("B3 f9eb4b1 commit touches only the 19 files", JSON.stringify(git("diff", "--name-only", `${FIXED}^`, FIXED).trim().split("\n").sort()) === JSON.stringify(S11));
const shortstat = git("diff", "--shortstat", BEFORE, FIXED, "--", "apps", "packages").trim();
check("B4 +2960/-76", /2960 insertions\(\+\), 76 deletions/.test(shortstat), shortstat);
const newInternal = productDiff.filter((p) => p.includes("/src/internal/"));
check("B5 at most four new internal modules", newInternal.length === 4 && newInternal.every((p) => git("cat-file", "-t", `${FIXED}:${p}`).trim() === "blob") && newInternal.every((p) => { try { git("cat-file", "-e", `${BEFORE}:${p}`); return false; } catch { return true; } }), newInternal.join(", "));
const PROTECTED = [
  "packages/plugin-web-storage", "packages/plugin-web-settings-shell", "packages/plugin-web-tokens", "packages/core",
  "packages/xai-web-event-bus", "packages/xai-web-pet", "packages/xai-web-cmdk", "packages/xai-web-settings-appearance",
  "packages/xai-web-settings-features-panel", "packages/plugin-web-settings-rest", "packages/xai-web-dashboard-grid",
  "packages/xai-web-dashboard-widgets", "package.json", "pnpm-lock.yaml",
];
for (const p of PROTECTED) check(`B6 protected ${p}`, git("diff", "--name-only", BEFORE, FIXED, "--", p).trim() === "");
const shellChanged = git("diff", "--name-only", BEFORE, FIXED, "--", "packages/xai-web-shell").trim().split("\n");
check("B7 every changed xai-web-shell path is §11", shellChanged.every((p) => S11.includes(p)), `${shellChanged.length} changed`);
const appsChanged = git("diff", "--name-only", BEFORE, FIXED, "--", "apps").trim().split("\n");
check("B8 apps/ changes only App.tsx + App.railorder test", JSON.stringify(appsChanged.sort()) === JSON.stringify(["apps/web/src/App.tsx", "apps/web/src/__tests__/App.railorder.test.tsx"]));
const topbarNumstat = git("diff", "--numstat", BEFORE, FIXED, "--", "packages/xai-web-shell/src/__tests__/Topbar.test.tsx").trim();
check("B9 Topbar.test.tsx additive only", /^\d+\t0\t/.test(topbarNumstat), topbarNumstat);
const preTests = git("ls-tree", "-r", "--name-only", BEFORE, "packages/xai-web-shell/src/__tests__", "apps/web/src/__tests__").trim().split("\n");
const changedPre = preTests.filter((p) => p !== "packages/xai-web-shell/src/__tests__/Topbar.test.tsx" && git("rev-parse", `${BEFORE}:${p}`).trim() !== git("rev-parse", `${FIXED}:${p}`).trim());
check("B10 every pre-existing shell/web test byte-identical (except additive Topbar)", changedPre.length === 0, `${preTests.length} files checked`);
for (const p of ["packages/xai-web-shell/src/internal/dnd.ts", "packages/xai-web-shell/src/registry.tsx", "packages/xai-web-shell/src/AvatarMenu.tsx", "packages/xai-web-shell/src/SignOutConfirmDialog.tsx", "apps/web/src/routes/modules/departureCoordinator.tsx", "packages/plugin-web-storage/src/internal/registry.ts", "packages/plugin-web-tokens/src/layout.css"]) {
  check(`B11 unchanged ${p}`, git("rev-parse", `${BEFORE}:${p}`).trim() === git("rev-parse", `${FIXED}:${p}`).trim());
}

// ---- C. Evidence immutability ---------------------------------------------------
line("## C. Evidence immutability since 419e56d");
const modified = git("log", "--diff-filter=MDR", "--name-only", "--format=", `${BEFORE}..HEAD`, "--", "docs/reviews").trim().split("\n").filter(Boolean);
const nonLedger = modified.filter((p) => !p.startsWith("docs/reviews/20260908-full-product-audit/"));
check("C1 only control-plane/ledger files were modified; every evidence file is an addition", nonLedger.length === 0, `${modified.length} M/D/R entries, all under 20260908-full-product-audit/`);
const ee = git("show", "--name-status", "--format=", "ee60b48").trim().split("\n");
check("C2 E18-E25 commit is additions only (143)", ee.length === 143 && ee.every((l) => l.startsWith("A\t")), `${ee.length} entries`);

// ---- D. Re-derive every hash in the E25 hash log --------------------------------
line("## D. E25 hash log re-derivation");
const HLOG = `${R}web-apprail-order-recovery-final/hashes-apprail-final-v1.log`;
let section = "";
let dTotal = 0, dBad = 0;
const badList = [];
for (const l of read(HLOG).split("\n")) {
  if (l.startsWith("## ") || l.startsWith("### ")) { section = l; continue; }
  const m = /^ {2}([0-9a-f]{64}) (\S+)/.exec(l);
  if (!m) continue;
  const [, h, p] = m;
  dTotal += 1;
  const actual = section.includes("E6 product") ? sha(gitBuf("show", `${FIXED}:${p}`)) : shaFile(p);
  if (actual !== h) { dBad += 1; badList.push(p); }
}
check("D1 every hash in the E25 hash log re-derived", dBad === 0 && dTotal > 0, `${dTotal} hashes, ${dBad} mismatches ${badList.join(" ")}`);

// ---- E. Per-ID principal artifacts ----------------------------------------------
line("## E. E1-E25 principal artifacts (path, producing commit, SHA-256, receipt)");
const FINAL_RCPT = `${R}web-apprail-order-recovery-final/review-final-regressions-f9eb4b1.md`;
const items = [
  ["E1", "d6ea500", "web-apprail-order-recovery-sol/verify-fixed.mjs", "e944cb226e3fa342727c913547ff5084e0ad38fad5293ed306cb512bf9f5a4e8", "web-apprail-order-recovery-sol/README.md"],
  ["E1", "d6ea500", "web-apprail-order-recovery-sol/features-downstream.c-rd1.test.tsx", "6c57164ef5040444dad96fbf5933e90b095d465c64bdd6e8e5f3dcb6be2d1c7a", "web-apprail-order-recovery-sol/README.md"],
  ["E1", "d6ea500", "web-apprail-order-recovery-sol/merge.test.tsx", "05f6e01081156e2d32076606f2b4f314f33246d6b96b0ab7ffa644a9de8d377a", "web-apprail-order-recovery-sol/README.md"],
  ["E2", "d6ea500", "web-apprail-order-recovery-sol/bytes-before1-419e56d.log", "94c87889a14f0a6097b6ad2c70fa92dd145f654d0fa53f0449aa86e4c7ffcc1b", "web-apprail-order-recovery-sol/README.md"],
  ["E2", "d6ea500", "web-apprail-order-recovery-sol/merge-before2-419e56d.log", "9f6b774e883776ee9d73ffc9fc18ae27c642bf72130033e8d473cd1b77e2057e", "web-apprail-order-recovery-sol/README.md"],
  ["E2", "d6ea500", "web-apprail-order-recovery-sol/features-sol-downstream-c-rd1-before1-419e56d.log", "c8f5ff44c2ca25c6560d6a0321bb96c3a002e7389a4e013f09f7c3c0bf687a4b", "web-apprail-order-recovery-sol/README.md"],
  ["E3", "6e9ec9c", "web-apprail-order-recovery-independent/host-before1-419e56d.log", "ee5f6e1d2aaafabec04f961ab5f1d091a1bb5ad47fe1794e8e6fa1a96812ebb3", "web-apprail-order-recovery-independent/README.md"],
  ["E4", "04ee6a2", "web-apprail-order-recovery-native/native-419e56d-before1-h1.log", "a222683d5b706d7129c70dabe3aa1b948d97bf5029fddd2d6c22493bbdd83d6f", "web-apprail-order-recovery-native/before-419e56d.md"],
  ["E4", "04ee6a2", "web-apprail-order-recovery-native/before-419e56d.md", "8253c075f386f07128a0e630fe51409ba9edd8cd3428b0a0e1734a4e3a5b1c2e", "web-apprail-order-recovery-final/hashes-apprail-final-v1.log"],
  ["E5", "04ee6a2", "web-apprail-order-recovery-f1/f1-419e56d-railorder-before1.log", "3108774b08a066e8aa1584e576d97e154c892a92513006f6cc8c1b5902f064cd", "web-apprail-order-recovery-f1/before-419e56d.md"],
  ["E6", "0d440ca", "web-apprail-order-recovery-terra/shell-test-f9eb4b1.log", "72876c4e194de93f91e11d0197d7ea6ff1b270c862b8ab044c4c580d39ab92fa", "web-apprail-order-recovery-terra/implementation.md"],
  ["E6", "0d440ca", "web-apprail-order-recovery-terra/web-test-f9eb4b1.log", "98f9673a134bc49f20b6f4bd3c849d32f065daf9e509683d86a1656c0855bbd3", "web-apprail-order-recovery-terra/implementation.md"],
  ["E6", "0d440ca", "web-apprail-order-recovery-terra/implementation.md", "fe7bc377e09e9088163411a29fe3f2b81771bc07a5c00ac718f5880865d09086", "web-apprail-order-recovery-final/review-final-regressions-f9eb4b1.md"],
  ["E7", "94b12ba", "web-apprail-order-recovery-sol/bytes-apprail-fixed1-f9eb4b1.log", "68faf686902a88131d48adee20efe26b873a1c12fe670f6b2cbdc70eaf18a442", "web-apprail-order-recovery-sol/fixed-f9eb4b1.md"],
  ["E7", "94b12ba", "web-apprail-order-recovery-sol/fixed-f9eb4b1.md", "e49a8fd8b2d1c8c07fd2c0654a2b18e0f8e30e29100ff200da6c330b0384f990", "web-apprail-order-recovery-final/review-final-regressions-f9eb4b1.md"],
  ["E8", "94b12ba", "web-apprail-order-recovery-independent/host-apprail-fixed1-f9eb4b1.log", "ba3c1bd4da61e26e14b7baa7ed8cf0717b29a79df610884c9f60a5b7199d86e5", "web-apprail-order-recovery-sol/fixed-f9eb4b1.md"],
  ["E9", "ae7b69e", "web-apprail-order-recovery-native/native-f9eb4b1-fixed1-controls.log", "c416cf3f1d9daa26238bb6fa43486b34cd0319cb0e827c0d8b0ca66f0ad281bf", "web-apprail-order-recovery-native/review-controls-protection-export-f9eb4b1.md"],
  ["E10", "ae7b69e", "web-apprail-order-recovery-native/native-f9eb4b1-fixed1-protection.log", "6dc38387527ebb2b6f5da71c189cd6142b0c3a1fcd12ef0b4846607cc93288d2", "web-apprail-order-recovery-native/review-controls-protection-export-f9eb4b1.md"],
  ["E11", "ae7b69e", "web-apprail-order-recovery-native/native-f9eb4b1-fixed1-export.log", "0172a752fa5da085a9d9a01681679ab6c8842a48473cef7c13642948be6aaa02", "web-apprail-order-recovery-native/review-controls-protection-export-f9eb4b1.md"],
  ["E12", "55cf1e9", "web-apprail-order-recovery-native/native-f9eb4b1-fixed1-downstream.log", "0da57fcf6c0ba55a1b224904bf454cab8dc46011bce7364ff3440b13a923d789", "web-apprail-order-recovery-native/review-downstream-visual-f9eb4b1.md"],
  ["E13", "55cf1e9", "web-apprail-order-recovery-native/native-f9eb4b1-fixed1-visual-en.log", "3c42c0a1efcc9b509d1422aaa2ef3c76a8b376dc2317b5d8394722526da78345", "web-apprail-order-recovery-native/review-downstream-visual-f9eb4b1.md"],
  ["E14", "5c6bcd2", "web-apprail-order-recovery-native/native-f9eb4b1-fixed1-keyboard-en.log", "b5414fcd713a7db5865b7db8c68384c5177c32f8ac1cee90387c8249dbfdfdf3", "web-apprail-order-recovery-native/review-keyboard-f9eb4b1.md"],
  ["E15", "94b12ba", "web-sticky-recovery-f1/f1-f9eb4b1-sticky-apprail-fixed1.log", "dd7e7eb0c9c898c93ac8130a8a9e8782efe51ec61d9be92f6609133fbebf7848", "web-apprail-order-recovery-sol/fixed-f9eb4b1.md"],
  ["E16", "94b12ba", "web-apprail-order-recovery-f1/f1-f9eb4b1-railorder-apprail-fixed1.log", "d4aae5fdf2a93b7dda8908ab7122d19a43d51865e244f5d75d6de40bd6a8e4b5", "web-apprail-order-recovery-sol/fixed-f9eb4b1.md"],
  ["E17", "94b12ba", "web-native-keyinput-k1/f1-f9eb4b1-appearance-apprail-fixed1.log", "5e7667df608159d5374a58bf21fc3fecc45c0f7ab4dba04f4f0bf3ea62698104", "web-apprail-order-recovery-sol/fixed-f9eb4b1.md"],
  ["E18", "ee60b48", "web-apprail-order-recovery-final/search-apprail-final-v1-f9eb4b1.log", "368ba9e6a5bd58f7182736395932febc1d55e748b47af83c0f132ef138ade3b3", "web-apprail-order-recovery-final/review-final-regressions-f9eb4b1.md"],
  ["E19", "ee60b48", "web-apprail-order-recovery-final/protected-diff-apprail-final-v1-f9eb4b1.log", "5a0ef354a8a08573ee071b3b0625985e95b030d7522342c2b65244dc7075b729", "web-apprail-order-recovery-final/review-final-regressions-f9eb4b1.md"],
  ["E20", "ee60b48", "web-features-recovery-final/storage-check-types-apprail-final-v1-f9eb4b1.log", "a0b00ec439810bbfb8cd8e5c6305325ff610249eda6f8168893f37ae708273eb", "web-apprail-order-recovery-final/review-final-regressions-f9eb4b1.md"],
  ["E20", "ee60b48", "web-apprail-order-recovery-sol/bytes-apprail-final-v1-f9eb4b1.log", "6a9d290f0f3d8f321caca0070beda1d6110762cd219569ebdeb8552a88c49fe5", "web-apprail-order-recovery-final/review-final-regressions-f9eb4b1.md"],
  ["E21", "ee60b48", "web-apprail-order-recovery-final/shell-test-apprail-final-v1-f9eb4b1.log", "4aa2586c4bafb3788b03bf934bfdfa4f3deab0fd5207d1efbc5a9603c663e7b8", "web-apprail-order-recovery-final/review-final-regressions-f9eb4b1.md"],
  ["E22", "ee60b48", "web-apprail-order-recovery-final/web-test-apprail-final-v1-f9eb4b1.log", "8560b7e54374b72c4538b5750841a5097c96541b34fc8ab986d8c458f573dd44", "web-apprail-order-recovery-final/review-final-regressions-f9eb4b1.md"],
  ["E23", "ee60b48", "web-apprail-order-recovery-sol/features-sol-downstream-c-rd1-apprail-final-v1-f9eb4b1.log", "a2428179491794154bbed3bfa133b4e2ea8a15de4bc5f34d24ccf1d85f8f0730", "web-apprail-order-recovery-final/review-final-regressions-f9eb4b1.md"],
  ["E23", "ee60b48", "web-apprail-order-recovery-final/compare-accepted-apprail-final-v1.log", "aef27ba00afd51a34948b5dc8df62e4dd9d8dbcc3ef0bb79630bea6a35556cab", "web-apprail-order-recovery-final/review-final-regressions-f9eb4b1.md"],
  ["E24", "ee60b48", "web-apprail-order-recovery-final/native-f9eb4b1-apprail-final-v1-host.log", "20f6273e43758aa8f7f84994f5839bba99e2139570b1c98a9a4ab8bed15e0522", "web-apprail-order-recovery-final/review-final-regressions-f9eb4b1.md"],
  ["E24", "ee60b48", "web-apprail-order-recovery-final/native-f9eb4b1-apprail-final-v1-downstream.log", "4efcab6bc4c3a5222e2c34ad2c91bc6033b1121aa5914f835ecd1e14e91a7c55", "web-apprail-order-recovery-final/review-final-regressions-f9eb4b1.md"],
  ["E25", "ee60b48", "web-apprail-order-recovery-final/hashes-apprail-final-v1.log", "5e8fa755d0a7e0fd06470cc13ec7eb2aa3550d2de9054d4d0dc1a993fd18d84d", "web-apprail-order-recovery-final/review-final-regressions-f9eb4b1.md"],
];
const seen = new Set();
for (const [id, commit, rel, expected, receipt] of items) {
  const p = R + rel;
  const actual = shaFile(p);
  const adds = addCommits(p);
  const last = lastCommit(p);
  const rtext = read(R + receipt);
  const inReceipt = rtext.includes(expected) ? "full" : rtext.includes(expected.slice(0, 8)) ? "prefix8" : "absent";
  const ok = actual === expected && adds.length === 1 && adds[0].startsWith(commit) && last.startsWith(commit) && inReceipt !== "absent";
  if (ok) seen.add(id);
  check(`E ${id} ${rel}`, ok, `sha256=${actual} added_once_in=${adds.map((a) => a.slice(0, 7)).join(",")} last=${last.slice(0, 7)} receipt(${receipt.split("/").pop()})=${inReceipt}`);
}
// E6 product files at f9eb4b1, re-derived against the E19 log.
const e19 = read(`${R}web-apprail-order-recovery-final/protected-diff-apprail-final-v1-f9eb4b1.log`);
let e6ok = 0;
for (const p of S11) if (e19.includes(sha(gitBuf("show", `${FIXED}:${p}`)))) e6ok += 1;
check("E E6 product: 19 §11 blobs at f9eb4b1 found in the E19 log", e6ok === 19, `${e6ok}/19`);
const appRailSha = sha(gitBuf("show", `${FIXED}:packages/xai-web-shell/src/AppRail.tsx`));
check("E E6 AppRail.tsx", appRailSha === "fe789078fecc60936d3e6c5fc2b203001a15490aecf30f3a0ca301da1399fb44", appRailSha);
if (e6ok === 19) seen.add("E6");
const rcptSha = shaFile(FINAL_RCPT);
check("E E25 receipt added once in ee60b48 and unchanged", addCommits(FINAL_RCPT).length === 1 && lastCommit(FINAL_RCPT).startsWith("ee60b48"), `review-final-regressions-f9eb4b1.md sha256=${rcptSha}`);
const finalText = read(FINAL_RCPT);
const g1Rows = [...finalText.matchAll(/^\| (E\d+) \| /gm)].map((m) => m[1]);
const expectIds = Array.from({ length: 25 }, (_, i) => `E${i + 1}`);
check("E E25 enumerates E1-E25 once each, in order", JSON.stringify(g1Rows.filter((x) => expectIds.includes(x)).slice(-25)) === JSON.stringify(expectIds), g1Rows.join(","));
const missing = expectIds.filter((id) => !seen.has(id));
check("E every ID E1-E25 has at least one re-derived principal artifact", missing.length === 0, `missing: ${missing.join(",") || "none"}`);

// ---- F. Outcomes parsed from raw logs -------------------------------------------
line("## F. Outcomes parsed from raw logs");
const cases = (p) => {
  const t = read(p);
  const pass = (t.match(/^case \d+ PASSED/gm) || []).length;
  const fail = (t.match(/^case \d+ FAILED/gm) || []).length;
  const pre = (t.match(/^case \d+ FAILED PRECONDITION/gm) || []).length;
  const exit = (/^exit=(\d+)/m.exec(t) || [])[1];
  const resolved = (/^resolved_commit=(\w+)/m.exec(t) || [])[1];
  return { pass, fail, pre, exit, resolved };
};
const solBefore = { bytes: "before1", domain: "before2", merge: "before2", drag: "before2", field: "before2", "continuity-export": "before1", host: "before2", original: "before1" };
const solExpectBefore = { bytes: [21, 26], domain: [1, 31], merge: [4, 21], drag: [8, 18], field: [1, 24], "continuity-export": [4, 22], host: [7, 33], original: [121, 121] };
const solExpectFixed = { bytes: 26, domain: 31, merge: 21, drag: 18, field: 24, "continuity-export": 22, host: 33, original: 123 };
for (const [mode, run] of Object.entries(solBefore)) {
  const b = cases(`${R}web-apprail-order-recovery-sol/${mode}-${run}-419e56d.log`);
  const [ep, et] = solExpectBefore[mode];
  check(`F Sol ${mode} before (${run})`, b.pass === ep && b.pass + b.fail === et && b.pre === 0 && b.resolved === BEFORE, `${b.pass}/${b.pass + b.fail} PRECONDITION=${b.pre}`);
  const f = cases(`${R}web-apprail-order-recovery-sol/${mode}-apprail-fixed1-f9eb4b1.log`);
  check(`F Sol ${mode} fixed1`, f.pass === solExpectFixed[mode] && f.fail === 0 && f.exit === "0" && f.resolved === FIXED, `${f.pass}/${f.pass + f.fail} exit=${f.exit}`);
}
const hb = cases(`${R}web-apprail-order-recovery-independent/host-before1-419e56d.log`);
check("F parent host before (E3)", hb.pass === 7 && hb.fail === 24 && hb.pre === 0 && hb.resolved === BEFORE, `${hb.pass} pass / ${hb.fail} fail, PRECONDITION=${hb.pre}`);
const hf = cases(`${R}web-apprail-order-recovery-independent/host-apprail-fixed1-f9eb4b1.log`);
check("F parent host fixed (E8)", hf.pass === 31 && hf.fail === 0 && hf.exit === "0" && hf.resolved === FIXED, `${hf.pass}/31`);
const lastJson = (p) => {
  const ls = read(p).split("\n");
  for (let i = ls.length - 1; i >= 0; i -= 1) {
    const s = ls[i].trim();
    if (s.startsWith("{")) { try { return JSON.parse(s); } catch { /* continue */ } }
  }
  return null;
};
// Native before (E4): each hypothesis requirement fails, positive controls hold, harness valid.
for (const mode of ["h1", "drag", "h8", "h9", "r1", "h11"]) {
  const j = lastJson(`${R}web-apprail-order-recovery-native/native-419e56d-before1-${mode}.log`);
  const v = j.verdicts || [];
  const hyp = v.filter((x) => /^H\d+$/.test(String(x.hypothesis)));
  const ctl = v.filter((x) => !/^H\d+$/.test(String(x.hypothesis)));
  check(`F native before ${mode} (E4)`, j.harnessValid === true && hyp.every((x) => x.requirementHolds === false) && ctl.every((x) => x.requirementHolds === true) && j.keyboardAudit.mismatches.length === 0,
    `harnessValid=${j.harnessValid} hypothesis rows ${hyp.length} all failing correctly; controls ${ctl.length} hold; checks=${j.checks}`);
}
// Native fixed (E9-E14).
const nat = { controls: 1024, protection: 134, export: 68, downstream: 1081, "visual-en": 538, "visual-zh": 529, "keyboard-en": 167, "keyboard-zh": 167 };
for (const [mode, n] of Object.entries(nat)) {
  const j = lastJson(`${R}web-apprail-order-recovery-native/native-f9eb4b1-fixed1-${mode}.log`);
  const prod = (j.runtimeErrorSamples || []).filter((s) => !/prelude self-test/.test(s.text) && !/419e56d/.test(JSON.stringify(s)));
  const rows = Object.values(j.byRow || j.bySection || {});
  check(`F native fixed ${mode}`, j.harnessValid && j.pass && j.productChecks === n && j.failures.length === 0 && rows.every((r) => r.pass === r.total) && j.keyboardAudit.mismatches.length === 0 && j.network.nonLocal === 0 && j.consoleWarnings === 0,
    `productChecks=${j.productChecks}/${n} rows=${rows.length} runtimeErrors=${j.runtimeErrors} (non-prelude, non-419e56d samples: ${prod.length}) nonLocal=${j.network.nonLocal}`);
}
// F1 (E5, E15-E17).
const f1b = lastJson(`${R}web-apprail-order-recovery-f1/f1-419e56d-railorder-before1.log`);
check("F rail F1 railorder before (E5)", f1b.harnessValid && f1b.verdict === "before-correct" && JSON.stringify(f1b.outcomes.map((o) => o.state)) === JSON.stringify(["before-no-rail-step", "before-unprotected", "before-pass-control"]), JSON.stringify(f1b.outcomes.map((o) => o.state)));
const f1f = lastJson(`${R}web-apprail-order-recovery-f1/f1-f9eb4b1-railorder-apprail-fixed1.log`);
check("F rail F1 railorder fixed (E16)", f1f.pass && f1f.verdict === "fixed-pass" && f1f.outcomes.every((o) => o.state === "fixed-pass" && !o.f1Signature && o.duplicateProceeds === 0 && o.nonLiveBlockerCalls === 0 && o.runtimeErrors === 0), `checks=${f1f.checks}`);
const f3 = read(`${R}web-apprail-order-recovery-f1/f1-f9eb4b1-railorder-apprail-fixed1.log`).split("\n").find((l) => l.includes("f3:released-exactly-once-to-tasks-one-commit-zero-non-live-calls"));
const f3j = JSON.parse(f3);
check("F rail F1 f3 released exactly once, one commit, zero non-live", f3j.pass && f3j.release.releases === 1 && f3j.release.nonLive === 0 && f3j.release.commits.length === 1, `releases=${f3j.release.releases} commits=${f3j.release.commits.length}`);
for (const sc of ["web-apprail-order-recovery-f1/f1-419e56d-selfcheck-before1.log", "web-apprail-order-recovery-f1/f1-f9eb4b1-selfcheck-apprail-fixed1.log"]) {
  const j = lastJson(R + sc);
  check(`F rail F1 selfcheck ${sc.includes("419e56d") ? "before" : "fixed"}`, j.harnessValid && j.verdict === "harness-valid" && j.checks === 165);
}
const k1 = lastJson(`${R}web-native-keyinput-k1/f1-f9eb4b1-appearance-apprail-fixed1.log`);
check("F Appearance F1-shape via K-1 copy (E17)", k1.pass && k1.verdict === "fixed-pass" && k1.outcomes.every((o) => !o.f1Signature), `checks=${k1.checks}`);
const e15 = [
  ...["sticky", "more", "collaborate", "selfcheck", "notifications", "date-time", "smart-lists", "header", "pomodoro", "race"].map((m) => `web-sticky-recovery-f1/f1-f9eb4b1-${m}-apprail-fixed1.log`),
  ...["selfcheck", "features"].map((m) => `web-features-recovery-f1/f1-f9eb4b1-${m}-apprail-fixed1.log`),
];
let e15ok = 0;
for (const p of e15) {
  const j = lastJson(R + p);
  const text = read(R + p);
  if (j && j.pass === true && !text.includes("Invalid blocker state transition")) e15ok += 1;
}
check("F E15 twelve frozen F1 invocations pass, no Invalid blocker state transition", e15ok === 12, `${e15ok}/12`);
// Final regression predictions (§13) and E21-E24.
const pred = [
  ["web-features-recovery-sol/downstream-apprail-final-v1-419e56d.log", 14, 15, ["012"]],
  ["web-features-recovery-sol/downstream-apprail-final-v1-f9eb4b1.log", 13, 15, ["012", "014"]],
  ["web-appearance-recovery-final/diagnostics/features-sol-downstream-corrected-apprail-final-v1-419e56d.log", 15, 15, []],
  ["web-appearance-recovery-final/diagnostics/features-sol-downstream-corrected-apprail-final-v1-f9eb4b1.log", 14, 15, ["014"]],
  ["web-apprail-order-recovery-sol/features-sol-downstream-c-rd1-apprail-final-v1-419e56d.log", 15, 15, []],
  ["web-apprail-order-recovery-sol/features-sol-downstream-c-rd1-apprail-final-v1-f9eb4b1.log", 15, 15, []],
];
for (const [p, ep, et, failing] of pred) {
  if (!existsSync(join(ROOT, R + p))) { check(`F §13 ${p}`, false, "missing"); continue; }
  const t = read(R + p);
  const c = cases(R + p);
  const failed = [...t.matchAll(/^case (\d+) FAILED/gm)].map((m) => m[1]);
  check(`F §13 ${p.split("/").pop()}`, c.pass === ep && c.pass + c.fail === et && JSON.stringify(failed) === JSON.stringify(failing), `${c.pass}/${c.pass + c.fail} failing=${failed.join(",") || "none"}`);
}
const ca = read(`${R}web-apprail-order-recovery-final/compare-accepted-apprail-final-v1.log`);
check("F E23 compare-accepted 85 MATCH / 0 DIFF", /## Summary: 85 MATCH, 0 DIFF/.test(ca));
const tot = (p) => (/^totals (.*)$/m.exec(read(R + p)) || [])[1];
check("F E21 shell test", tot("web-apprail-order-recovery-final/shell-test-apprail-final-v1-f9eb4b1.log") === "files=12 tests=205 passed=205 failed=0 other=0 suite_errors=0 unhandled_error_lines=0");
check("F E22 web test fixed", tot("web-apprail-order-recovery-final/web-test-apprail-final-v1-f9eb4b1.log") === "files=30 tests=196 passed=196 failed=0 other=0 suite_errors=0 unhandled_error_lines=0");
check("F E22 web test 419e56d control", tot("web-apprail-order-recovery-final/web-test-apprail-final-v1-419e56d.log") === "files=29 tests=178 passed=178 failed=0 other=0 suite_errors=0 unhandled_error_lines=0");
check("F E18/E19 static", /assertions=140\/140 harness=56\/56/.test(read(`${R}web-apprail-order-recovery-final/search-apprail-final-v1-f9eb4b1.log`)));
for (const m of ["host", "downstream"]) {
  const j = lastJson(`${R}web-apprail-order-recovery-final/native-f9eb4b1-apprail-final-v1-${m}.log`);
  check(`F E24 Features native ${m} via copy`, j.pass && j.harnessValid && j.runtimeErrors === 0 && j.productChecks === (m === "host" ? 341 : 140), `checks=${j.checks} product=${j.productChecks}`);
}
const e24diff = read(`${R}web-apprail-order-recovery-final/native-host-harness.e24-vs-appearance-copy.diff`);
const e24changed = e24diff.split("\n").filter((l) => /^[+-][^+-]/.test(l)).filter((l) => !/^[+-]\s*(\*|\/\/|\/\*\*)/.test(l));
const e24removed = e24changed.filter((l) => l.startsWith("-"));
const e24added = e24changed.filter((l) => l.startsWith("+"));
check("F E24 harness copy differs from the accepted Appearance copy only in the delta precondition",
  e24removed.length > 0 && e24removed.every((l) => /delta/i.test(l))
  && e24added.every((l) => /delta|APPRAIL_SECTION11|APPEARANCE_FIXED_REVISION|xai-web-shell|apps\/web\/src|"src\/|^\+\s*\];/i.test(l))
  && e24added.filter((l) => l.includes('pre("')).length === 1 && e24removed.filter((l) => l.includes('pre("')).length === 1,
  `${e24removed.length} removed / ${e24added.length} added non-comment lines; one precondition replaced`);
for (const c of ["smart-lists-recovery-astra", "collaborate-recovery-independent", "pomodoro-departure-independent", "dashboard-header-departure-independent"]) {
  const d = read(`${R}web-apprail-order-recovery-final/host-suites/web-${c}/verify-fixed.copy.diff`);
  const changed = d.split("\n").filter((l) => /^[+-][^+-]/.test(l));
  const substantive = changed.filter((l) => !/^\+\s*\/\//.test(l));
  check(`F E23 host-suite copy ${c}: only buffer and root changed`, substantive.length === 4 && substantive.some((l) => /maxBuffer/.test(l)) && substantive.some((l) => /root/.test(l)), substantive.map((l) => l.trim()).join(" | "));
}

// ---- G. Source checks at f9eb4b1 ------------------------------------------------
line("## G. Source checks at f9eb4b1");
const src = (p) => git("show", `${FIXED}:${p}`);
const shellProd = git("ls-tree", "-r", "--name-only", FIXED, "packages/xai-web-shell/src").trim().split("\n").filter((p) => /\.(tsx?|css)$/.test(p) && !p.includes("__tests__") && !p.includes("__fixtures__"));
for (const pat of ["localStorage", "usePref(", "setPref(", "removePref(", "new StorageEvent", "dispatchEvent("]) {
  const hits = shellProd.filter((p) => src(p).includes(pat));
  check(`G1 shell product source has no ${pat}`, hits.length === 0, hits.join(","));
}
const appRail = src("packages/xai-web-shell/src/AppRail.tsx");
check("G2 AppRail imports no storage package", !/plugin-web-storage/.test(appRail) && /internal\/railOrderController\.js/.test(appRail));
const app = src("apps/web/src/App.tsx");
const appBefore = git("show", `${BEFORE}:apps/web/src/App.tsx`);
check("G3 App.tsx has no xai_rail_order or usePref(", !app.includes("xai_rail_order") && !app.includes("usePref("));
const lsCount = (t) => t.split("\n").filter((l) => l.includes("localStorage")).length;
check("G4 App.tsx localStorage line count unchanged", lsCount(app) === lsCount(appBefore), `${lsCount(appBefore)} -> ${lsCount(app)}`);
const fn = (t) => { const i = t.indexOf("function readLocalPref"); const j = t.indexOf("\n}\n", i); return t.slice(i, j + 2); };
check("G5 readLocalPref byte-identical", fn(app) === fn(appBefore) && fn(app).length > 50, sha(fn(app)));
const so = app.slice(app.indexOf("const handleSignOut"), app.indexOf("}, [client, clearSessionStorage"));
const seq = [...so.matchAll(/await (confirmRailOrderSignOut|confirmAppearanceSignOut|requestSettingsDeparture)\(/g)].map((m) => m[1]);
check("G6 sign-out order in both branches: rail, Appearance, coordinator", JSON.stringify(seq) === JSON.stringify(["confirmRailOrderSignOut", "confirmAppearanceSignOut", "requestSettingsDeparture", "confirmRailOrderSignOut", "confirmAppearanceSignOut", "requestSettingsDeparture"]), seq.join(" > "));
check("G7 coordinator capture check precedes the rail step", so.indexOf("if (!captured)") < so.indexOf("confirmRailOrderSignOut()"));
check("G8 exactly one useRailOrderController in App.tsx and it is inside AppInner", (app.match(/useRailOrderController\(/g) || []).length === 1 && app.indexOf("useRailOrderController({ lang })") > app.indexOf("function AppInner"));
check("G9 Shell wrapped in RailOrderProvider and the status passed", /<RailOrderProvider controller=\{railOrder\}>\s*\n\s*<Shell/.test(app) && app.includes("railOrderStatus={<RailOrderStatus />}"));
const topbar = src("packages/xai-web-shell/src/Topbar.tsx");
check("G10 Topbar slot order: premiumBadge < appearanceStatus < railOrderStatus < .topbar-pref", (() => { const a = topbar.indexOf("{premiumBadge ?"), b = topbar.indexOf("{appearanceStatus ?"), c = topbar.indexOf("{railOrderStatus ?"), d = topbar.indexOf('className="topbar-pref"'); return a > 0 && a < b && b < c && c < d; })());
const css = src("packages/xai-web-shell/src/railOrderStatus.css");
const selectors = css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/@media[^{]*\{/g, "").split("{").slice(0, -1).map((s) => s.split("}").pop().trim()).filter(Boolean).flatMap((s) => s.split(",").map((x) => x.trim()));
check("G11 every selector begins with .rail-order-status", selectors.length > 0 && selectors.every((s) => s.startsWith(".rail-order-status")), `${selectors.length} selectors; ${(css.match(/@media/g) || []).length} @media`);
check("G12 new controls have a non-none :focus-visible outline", /\.rail-order-status-button:focus-visible,\s*\n\.rail-order-status-action:focus-visible \{\s*\n\s*outline: 2px solid/.test(css));
const status = src("packages/xai-web-shell/src/internal/RailOrderStatus.tsx");
check("G13 status never uses topbar-pref-option or the disabled attribute", !status.includes("topbar-pref-option") && !/\sdisabled[=\s>]/.test(status) && status.includes('aria-disabled={retryInert ? "true" : undefined}'));
for (const sel of ['data-testid="rail-order-status"', 'aria-controls={PANEL_ID}', 'data-testid="rail-order-panel"', 'role="dialog"', 'data-testid="rail-order-message"', 'data-testid="rail-order-retry"', 'data-testid="rail-order-discard"', 'data-testid="rail-order-export"', 'data-testid="rail-order-reload"', 'const PANEL_ID = "rail-order-panel"']) {
  check(`G14 stable selector ${sel}`, status.includes(sel));
}
// Copy vs the contract §5 normative wording table.
const contract = read(CONTRACT);
const copy = src("packages/xai-web-shell/src/internal/railOrderCopy.ts");
const wording = contract.slice(contract.indexOf("**Normative wording.**"), contract.indexOf("All wording appears in the language currently displayed."));
const quoted = [...wording.matchAll(/`([^`]+)`/g)].map((m) => m[1]).filter((s) => !/^window\.confirm$/.test(s));
const missingCopy = quoted.filter((q) => !copy.includes(JSON.stringify(q)));
check("G15 every normative EN/ZH string of contract §5 appears verbatim in railOrderCopy.ts", quoted.length >= 30 && missingCopy.length === 0, `${quoted.length} strings; missing: ${missingCopy.join(" | ") || "none"}`);
const ctrl = src("packages/xai-web-shell/src/internal/railOrderController.tsx");
check("G16 controller uses the registered binding and absolute edits only", /usePrefAutosaveAsync\("xai_rail_order", RAIL_ORDER_BINDING\)/.test(ctrl) && /state\.binding\.edit\(merged\)/.test(ctrl) && !/\.reset\(/.test(ctrl) && !/edit\(\s*\(/.test(ctrl));
check("G17 controller touches no account machinery", !/xai:account|xai:demo|accountScope|lifecycle lock|tombstone/i.test(ctrl.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "")));
check("G18 export filename and envelope", ctrl.includes('anchor.download = "rail-order-draft.json"') && ctrl.includes('kind: "rail-order-draft"') && ctrl.includes('railOrder: { operation: "set", value: [...draft.value] }'));
check("G19 beforeunload only while a draft exists", /if \(!hasDraft\) return undefined;\s*\n\s*const warn/.test(ctrl));
// §14 "cannot be closed by": no write on dragenter/dragover/dragend; the only controller write path is the drop handler.
const handler = (name) => { const i = appRail.indexOf(`const ${name} = `); return appRail.slice(i, appRail.indexOf("\n  };\n", i)); };
check("G20 dragstart/dragenter/dragover/dragend handlers never call the controller", ["onDragStart", "onDragEnter", "onDragOver", "onItemsDragOver", "onDragEnd"].every((h) => { const b = handler(h); return b.length > 20 && !b.includes("controller."); }));
check("G21 exactly one controller.drop call, inside onItemsDrop, after the same-order and external-drag guards", (appRail.match(/controller\.drop\(/g) || []).length === 1 && /if \(current === null \|\| current\.dropped\) return;[\s\S]*current\.dropped = true;[\s\S]*if \(sameRailOrder\(current\.preview, current\.initial\)\) return;[\s\S]*controller\.drop\(current\.preview, visibleIds\)/.test(handler("onItemsDrop")));
check("G22 status renders nothing without a failed draft or a source issue (A8)", /if \(draft\.everFailed\) statusKind = failedNow \? "failed" : "saving";/.test(ctrl) && /else if \(meta\.source === "invalid" \|\| meta\.source === "unavailable"\)/.test(ctrl) && /if \(controller === null \|\| kind === null\) return null;/.test(status));
check("G23 a focused status that unmounts moves focus to .topbar-pref-trigger", /querySelector<HTMLElement>\("\.topbar-pref-trigger"\)/.test(status) && /trigger\?\.focus\(\)/.test(status));

// ---- H. Pure model property check (R-1, A2 P1-P7, A5) ---------------------------
line("## H. Pure model properties (railOrderModel.ts at f9eb4b1, imported by type stripping)");
const modelPath = join(scratch, "railOrderModel.ts");
writeFileSync(modelPath, gitBuf("show", `${FIXED}:packages/xai-web-shell/src/internal/railOrderModel.ts`));
const model = await import(pathToFileURL(modelPath).href);
const DEFAULT = ["tasks", "board", "dashboard", "calendar", "matrix", "pomodoro", "timetrack", "habits", "meditation", "countdown", "ai", "statistics"];
const RAIL = ["ai", "tasks", "board", "dashboard", "calendar", "matrix", "pomodoro", "timetrack", "bookkeeping", "metrics", "habits", "meditation", "countdown", "statistics"];
const TOGGLE = ["tasks", "board", "dashboard", "calendar", "matrix", "pomodoro", "habits", "meditation"];
// Domain table (§5 item 2) and in-domain seeds.
const invalid = [{}, { tasks: 1 }, 1, 0, -1, true, false, "tasks", [1], ["tasks", 2], [null], [["tasks"]], ["tasks", "tasks"], ["board", "tasks", "board"], null];
check("H1 every §5 item 2 decoded value is outside the strict domain", invalid.every((v) => model.isRailOrder(v) === false), `${invalid.length} values`);
const validSeeds = [[], ["ghost-module", "tasks"], ["dashboard", "tasks"], ["tasks"], ["board", "tasks"], ["settings", ""], DEFAULT, [...RAIL].reverse()];
check("H2 in-domain seeds are valid", validSeeds.every((v) => model.isRailOrder(v)));
// Deterministic PRNG.
let seed = 0x5eed;
const rnd = (n) => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n; };
const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i -= 1) { const j = rnd(i + 1); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const bases = [[], DEFAULT, [...RAIL].reverse(), ["calendar", "tasks", "board", "dashboard"], ["tasks", "dashboard", "board", "settings", "ghost-module", "calendar"], ["ghost-module"], ["settings", "ai", "", "metrics"]];
const hiddenSets = [[], ...TOGGLE.map((m) => [m]), ["board", "habits", "matrix"], ["tasks", "dashboard", "meditation"]];
let n = 0; const bad = { P1: 0, P2: 0, P3: 0, P4: 0, P5: 0, P6: 0, P7: 0, nonperm: 0, display: 0 };
for (const S of bases) for (const hidden of hiddenSets) for (let k = 0; k < 6; k += 1) {
  const Rv = RAIL.filter((id) => !hidden.includes(id));
  const D = model.displayRailOrder(S, Rv);
  // Display reconcile per §2.
  const expD = [...S.filter((id) => Rv.includes(id)).filter((id, i, a) => a.indexOf(id) === i), ...Rv.filter((id) => !S.includes(id))];
  if (JSON.stringify(D) !== JSON.stringify(expD)) bad.display += 1;
  const P = k === 0 ? D : shuffle(D);
  const M = model.mergeRailOrder(S, Rv, P);
  n += 1;
  if (M === null) { bad.P1 += 1; continue; }
  const inR = new Set(Rv);
  if (JSON.stringify(M.filter((id) => inR.has(id))) !== JSON.stringify(P)) bad.P1 += 1;
  for (let i = 0; i < S.length; i += 1) if (!inR.has(S[i]) && M[i] !== S[i]) { bad.P2 += 1; break; }
  const setM = new Set(M), union = new Set([...S, ...Rv]);
  if (!model.isRailOrder(M) || setM.size !== union.size || [...union].some((x) => !setM.has(x))) bad.P3 += 1;
  if (M.length !== S.length + Rv.filter((id) => !S.includes(id)).length) bad.P4 += 1;
  if (S.every((id) => inR.has(id)) && JSON.stringify(M) !== JSON.stringify(P)) bad.P6 += 1;
  // P5: a single hidden module m re-enabled displays at its stored index when everything before it is visible.
  if (hidden.length === 1 && S.includes(hidden[0])) {
    const m = hidden[0]; const i = M.indexOf(m);
    const before = M.slice(0, i);
    if (before.every((id) => RAIL.includes(id))) {
      const shown = model.displayRailOrder(M, RAIL);
      if (shown.indexOf(m) !== i) bad.P5 += 1;
    }
  }
  // Non-permutation inputs: drop one id, add a foreign id, duplicate an id.
  if (P.length > 0) {
    const np = [P.slice(1), [...P.slice(1), "ghost-x"], [P[0], ...P]];
    if (np.some((x) => model.mergeRailOrder(S, Rv, x) !== null)) bad.nonperm += 1;
  }
}
// P7: absent bytes = DEFAULT; a hidden default module keeps its default index.
for (const m of TOGGLE) {
  const Rv = RAIL.filter((id) => id !== m);
  const P = shuffle(model.displayRailOrder(DEFAULT, Rv));
  const M = model.mergeRailOrder(DEFAULT, Rv, P);
  if (!M || M.indexOf(m) !== DEFAULT.indexOf(m)) bad.P7 += 1;
}
check("H3 P1-P7, display reconcile and non-permutation refusal hold", Object.values(bad).every((x) => x === 0), `${n} generated cases + ${TOGGLE.length} P7 cases; violations ${JSON.stringify(bad)}`);
check("H4 invalid stored order refuses to merge", model.mergeRailOrder(["tasks", "tasks"], RAIL, RAIL) === null);
// The control-plane R-1 example: board at index 2, Boards hidden, drag calendar before tasks.
{
  const S = ["tasks", "dashboard", "board", "calendar", "matrix"];
  const Rv = RAIL.filter((id) => id !== "board");
  const D = model.displayRailOrder(S, Rv);
  const P = ["calendar", ...D.filter((x) => x !== "calendar")];
  const M = model.mergeRailOrder(S, Rv, P);
  check("H5 R-1 example: board keeps index 2 and returns there", M[2] === "board" && model.displayRailOrder(M, RAIL)[2] === "board", JSON.stringify(M.slice(0, 5)));
}

line("## Result");
line(`checks=${passes + failures} pass=${passes} fail=${failures}`);
line(`exit=${failures === 0 ? 0 : 1}`);
writeFileSync(LOG, out.join("\n") + "\n", { flag: "wx" });
console.log(out.slice(-3).join("\n"));
process.exit(failures === 0 ? 0 : 1);
