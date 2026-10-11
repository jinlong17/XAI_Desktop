/**
 * E27 hash re-derivation for CP-APPEARANCE-01 (control-plane batch 51; contract r3 §14 E1–E27). Written after
 * ../web-features-recovery-final/hash-evidence.mjs (85ef2b39…, read, not modified), whose item table is Features-specific.
 *
 * Usage (from the repository root): node docs/reviews/web-appearance-recovery-final/hash-evidence.mjs <suffix>
 *
 * - Committed items (E1–E17, E26 and the supplementary K-1, OE and historical E14–E15 items): the artifact list is
 *   derived from git itself, as every file the producing commit added under the item's directory that matches the
 *   item's name filter, so no artifact can be left out by hand. For each file it recomputes the SHA-256 from this
 *   checkout, checks that the producing commit is the last commit to touch the path and that `git diff --quiet
 *   <commit> HEAD -- <path>` holds (unchanged since), and looks the hash up in the item's receipt(s) and in the
 *   control plane: a full 64-hex match, an 8-hex prefix match, or none.
 * - E6: the 26 contract §11 files hashed at the final fixed revision (`git show 419e56d:<path>`), plus Terra's three
 *   run records (committed items above).
 * - This batch (E18–E25 and its tools and diagnostics): every untracked file under docs/reviews/ is classified by
 *   path into an item; an unclassified untracked file is a failure. Hashes are recorded for the E27 receipt.
 * Writes hashes-<suffix>.log beside this file (refusing to overwrite) and exits 1 on any missing file, provenance
 * failure or unclassified new file.
 */
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const evidence = fileURLToPath(new URL("./", import.meta.url));
const [suffix, ...extra] = process.argv.slice(2);
if (!suffix || extra.length || !/^[A-Za-z0-9._-]+$/.test(suffix)) throw Error("Usage: node hash-evidence.mjs <suffix>");
const output = join(process.env.XAI_FINAL_OUTPUT_DIR ?? evidence, `hashes-${suffix}.log`);
if (existsSync(output)) throw Error(`Evidence exists; use a new suffix: ${output}`);

const R = "docs/reviews";
const SOL = `${R}/web-appearance-recovery-sol`, IND = `${R}/web-appearance-recovery-independent`, NAT = `${R}/web-appearance-recovery-native`;
const F1 = `${R}/web-appearance-recovery-f1`, TER = `${R}/web-appearance-recovery-terra`, OE = `${R}/web-appearance-recovery-oracle-erratum`;
const K1 = `${R}/web-native-keyinput-k1`, FIN = `${R}/web-appearance-recovery-final`, CP = `${R}/20260908-full-product-audit/CURRENT-CONTROL-PLANE.md`;
const sha256 = data => createHash("sha256").update(data).digest("hex");
const git = args => execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 }).trim();
const full = sha => git(["rev-parse", "--verify", `${sha}^{commit}`]);
const head = git(["rev-parse", "HEAD"]);
const base = path => path.split("/").at(-1);
const added = (commit, dir) => git(["show", "--name-only", "--format=", "--diff-filter=A", commit, "--", dir]).split("\n").filter(Boolean);

const SECTION11 = [
  ...["docs/api.md", "docs/test.md", "src/AppearancePane.tsx", "src/__tests__/AppearanceController.test.tsx", "src/__tests__/AppearancePane.bilingual.test.tsx", "src/__tests__/AppearancePane.focus-ring.test.tsx",
    "src/__tests__/AppearancePane.live-binding.test.tsx", "src/__tests__/AppearancePane.rendering.test.tsx", "src/__tests__/AppearancePane.save-reset.test.tsx", "src/__tests__/AppearancePane.selected-focus.test.tsx",
    "src/__tests__/AppearanceRetryAll.test.tsx", "src/__tests__/appearanceLockFixture.ts", "src/index.ts", "src/internal/AppearanceActions.tsx", "src/internal/AppearanceStatus.tsx",
    "src/internal/appearanceController.tsx", "src/internal/appearanceRecoveryCopy.ts", "src/styles.css", "src/types.ts"].map(path => `packages/xai-web-settings-appearance/${path}`),
  ...["docs/api.md", "src/Shell.tsx", "src/Topbar.tsx", "src/__tests__/Topbar.test.tsx", "src/types.ts"].map(path => `packages/xai-web-shell/${path}`),
  "apps/web/src/App.tsx", "apps/web/src/__tests__/App.appearance.test.tsx",
];
const ITEMS = [
  { id: "E1", commit: "bd09456", dir: SOL, select: name => !name.endsWith(".log"), receipts: [`${SOL}/README.md`, CP] },
  { id: "E2", commit: "bd09456", dir: SOL, select: name => name.endsWith(".log"), receipts: [`${SOL}/README.md`] },
  { id: "E3", commit: "b997235", dir: IND, select: () => true, receipts: [`${IND}/README.md`, CP] },
  { id: "E4", commit: "72538d1", dir: NAT, select: () => true, receipts: [`${NAT}/before-5cd63ff.md`, CP] },
  { id: "E4/E5 supplementary K-1", commit: "6b9f0ee", dir: K1, select: () => true, receipts: [`${K1}/review-k1.md`, CP] },
  { id: "E5", commit: "72538d1", dir: F1, select: () => true, receipts: [`${F1}/before-5cd63ff.md`, CP] },
  { id: "E6 r1 run record", commit: "4874170", dir: TER, select: () => true, receipts: [`${TER}/implementation.md`] },
  { id: "E6 r2 run record", commit: "0d34bf2", dir: TER, select: () => true, receipts: [`${TER}/implementation-r2.md`] },
  { id: "E6 r3 run record", commit: "5766c1e", dir: TER, select: () => true, receipts: [`${TER}/implementation-r3.md`] },
  { id: "E6 product (§11 files at 419e56d)", atRevision: "419e56d", files: SECTION11, receipts: [`${FIN}/protected-diff-${suffix}-419e56d.log`] },
  { id: "E7 OE erratum basis", commit: "26cfce8", dir: OE, select: () => true, receipts: [`${OE}/review-oe.md`, CP] },
  { id: "E7", commit: "31d6335", dir: SOL, select: () => true, receipts: [`${SOL}/fixed-24073b5.md`, CP] },
  { id: "E7 corrected copy run", commit: "31d6335", dir: OE, select: () => true, receipts: [`${SOL}/fixed-24073b5.md`] },
  { id: "E8", commit: "31d6335", dir: IND, select: () => true, receipts: [`${SOL}/fixed-24073b5.md`] },
  { id: "E9", commit: "3419542", dir: NAT, select: name => !/-fixed1-(reset|export)/.test(name), receipts: [`${NAT}/review-controls-reset-export-24073b5.md`, CP] },
  { id: "E10", commit: "3419542", dir: NAT, select: name => /-fixed1-reset\./.test(name), receipts: [`${NAT}/review-controls-reset-export-24073b5.md`] },
  { id: "E11", commit: "3419542", dir: NAT, select: name => /-fixed1-export/.test(name), receipts: [`${NAT}/review-controls-reset-export-24073b5.md`] },
  { id: "E12", commit: "32e6753", dir: NAT, select: name => !/-fixed1-(downstream|retryall)/.test(name), receipts: [`${NAT}/review-host-downstream-retryall-24073b5.md`, CP] },
  { id: "E13", commit: "32e6753", dir: NAT, select: name => /-fixed1-downstream/.test(name), receipts: [`${NAT}/review-host-downstream-retryall-24073b5.md`] },
  { id: "E14 (PASS at 419e56d)", commit: "2696855", dir: NAT, select: name => !/-keyboard-/.test(name), receipts: [`${NAT}/review-visual-keyboard-419e56d.md`, CP] },
  { id: "E15 (PASS at 419e56d)", commit: "2696855", dir: NAT, select: name => /-keyboard-/.test(name), receipts: [`${NAT}/review-visual-keyboard-419e56d.md`] },
  { id: "E14-E15 historical FAIL at 24073b5 (F-APP-1)", commit: "5307b6f", dir: NAT, select: () => true, receipts: [`${NAT}/review-visual-keyboard-24073b5.md`, CP] },
  { id: "E14-E15 historical FAIL at 5bbf473 (F-APP-2)", commit: "bacdbbc", dir: NAT, select: () => true, receipts: [`${NAT}/review-visual-keyboard-5bbf473.md`, CP] },
  { id: "E16", commit: "31d6335", dir: `${R}/web-sticky-recovery-f1`, select: () => true, receipts: [`${SOL}/fixed-24073b5.md`] },
  { id: "E16 (Features F1)", commit: "31d6335", dir: `${R}/web-features-recovery-f1`, select: () => true, receipts: [`${SOL}/fixed-24073b5.md`] },
  { id: "E17", commit: "31d6335", dir: F1, select: () => true, receipts: [`${SOL}/fixed-24073b5.md`] },
  { id: "E26", commit: "32e6753", dir: NAT, select: name => /-fixed1-retryall/.test(name), receipts: [`${NAT}/review-host-downstream-retryall-24073b5.md`] },
];
// This batch: untracked files under docs/reviews/, classified by path.
const NEW_CLASSES = [
  ["E18", path => /^docs\/reviews\/web-appearance-recovery-final\/(search-|verify-static\.mjs$)/.test(path)],
  ["E19", path => /^docs\/reviews\/web-appearance-recovery-final\/protected-diff-/.test(path)],
  ["E20", path => /web-features-recovery-final\/storage-check-types-appearance-final/.test(path)],
  ["E21", path => /web-appearance-recovery-final\/appearance-/.test(path)],
  ["E22", path => /web-appearance-recovery-final\/shell-/.test(path)],
  ["E23", path => /web-appearance-recovery-final\/web-(test|check-types|lint)-/.test(path)],
  ["E21-E23 runner", path => /web-appearance-recovery-final\/verify-packages\.mjs$/.test(path)],
  ["E24", path => /web-features-recovery-final\/(settings-|features-test-|more-|notifications-|datetime-)/.test(path) || /web-features-recovery-(sol|independent)\/.*-appearance-final-v\d-419e56d\.log$/.test(path)
    || /web-sticky-recovery-(sol|independent)\/.*-appearance-final-v1-419e56d\.log$/.test(path) || /web-more-recovery-fb002\/logs\/corrected-full-appearance-final/.test(path)],
  ["E24 F-FD1 diagnostics", path => /web-features-recovery-sol\/downstream-appearance-final-v1-24073b5\.log$/.test(path) || /web-appearance-recovery-final\/(diag-features-sol-corrected\.mjs|diagnostics\/(features-|make-features|diag-features))/.test(path)],
  ["E25", path => /web-features-recovery-native\/native-419e56d-appearance-final-v1-downstream\.log$/.test(path) || /web-appearance-recovery-final\/(verify-native-downstream\.mjs|native-host-harness\.mjs|native-host-harness\.e25\.diff|native-downstream\.tsx|native-host-prelude\.js|native-419e56d-appearance-final-v1-downstream\.log)$/.test(path)],
  ["E7 rerun", path => /web-appearance-recovery-sol\/.*-appearance-final-v1-419e56d\.log$/.test(path) || /web-appearance-recovery-oracle-erratum\/corrected-appearance-final-v1-419e56d\.log$/.test(path)],
  ["E8 rerun", path => /web-appearance-recovery-independent\/host-appearance-final-v1-419e56d\.log$/.test(path)],
  ["E16 rerun", path => /web-(sticky|features)-recovery-f1\/f1-419e56d-.*-appearance-final-v1\.log$/.test(path)],
  ["E17 rerun (K-1 copy)", path => /web-native-keyinput-k1\/f1-419e56d-.*-appearance-final-v1\.log$/.test(path)],
  ["delta audit", path => /web-appearance-recovery-final\/(verify-delta\.mjs|delta-)/.test(path) || /web-appearance-recovery-final\/diagnostics\/f1-bundle-depth/.test(path)],
  ["comparisons and E27 tools", path => /web-appearance-recovery-final\/(compare-|hash-evidence\.mjs$|review-final-regressions-|hashes-)/.test(path)],
];

const lines = [`hashes=${suffix}`, `checkout_head=${head}`, `method=sha256 of the file in this checkout (E6 product: git show 419e56d:<path>); producing commit = the commit that added it and the last to touch it; receipt lookup = full 64-hex or first 8 hex in the receipt text`];
let failures = 0;
const receiptCache = new Map();
const receiptText = path => { if (!receiptCache.has(path)) receiptCache.set(path, existsSync(join(root, path)) ? readFileSync(join(root, path), "utf8") : ""); return receiptCache.get(path); };
const lookup = (receipts, path, hash) => {
  const own = receipts.filter(receipt => receipt !== path);
  const kinds = own.map(receipt => [receipt, receiptText(receipt).includes(hash) ? "full" : receiptText(receipt).includes(hash.slice(0, 8)) ? "prefix8" : "not-listed"]);
  return { kinds, text: own.length ? kinds.map(([receipt, kind]) => `${base(receipt)}:${kind}`).join(", ") : "n/a" };
};
const totals = [];
for (const item of ITEMS) {
  const expected = item.commit ? full(item.commit) : null;
  const files = item.atRevision ? item.files : added(item.commit, item.dir).filter(path => item.select(base(path))).sort();
  lines.push(`## ${item.id}${expected ? ` producing commit ${expected}` : ` at revision ${item.atRevision}`} (${files.length} files) receipts ${item.receipts.join(", ")}`);
  let fullCount = 0, prefixCount = 0, none = 0;
  for (const path of files) {
    const exists = item.atRevision ? spawnSync("git", ["cat-file", "-e", `${item.atRevision}:${path}`], { cwd: root }).status === 0 : existsSync(join(root, path));
    if (!exists) { lines.push(`  MISSING ${path}`); failures += 1; continue; }
    const data = item.atRevision ? execFileSync("git", ["show", `${item.atRevision}:${path}`], { cwd: root, maxBuffer: 256 * 1024 * 1024 }) : readFileSync(join(root, path));
    const hash = sha256(data);
    let provenance = `at ${item.atRevision}`;
    if (expected) {
      const last = git(["log", "-1", "--format=%H", "--", path]);
      const unchanged = spawnSync("git", ["diff", "--quiet", expected, "HEAD", "--", path], { cwd: root }).status === 0;
      const ok = last === expected && unchanged;
      if (!ok) failures += 1;
      provenance = `${ok ? "OK" : "FAIL"} last_commit=${last.slice(0, 12)} unchanged_since=${unchanged}`;
    }
    const hit = lookup(item.receipts, path, hash);
    if (hit.kinds.some(([, kind]) => kind === "full")) fullCount += 1; else if (hit.kinds.some(([, kind]) => kind === "prefix8")) prefixCount += 1; else none += 1;
    lines.push(`  ${hash} ${path} | ${provenance} | receipt ${hit.text}`);
  }
  lines.push(`  summary ${item.id}: files=${files.length} receipt_full=${fullCount} receipt_prefix8=${prefixCount} receipt_none_or_na=${none}`);
  totals.push(`${item.id}: ${files.length} files, ${fullCount} full / ${prefixCount} prefix8 / ${none} none-or-n/a`);
}
// This batch.
const untracked = git(["ls-files", "--others", "--exclude-standard", "--", R]).split("\n").filter(Boolean).sort();
lines.push(`## This batch (untracked under ${R}/ at hashing time): ${untracked.length} files`);
const byClass = new Map();
for (const path of untracked) {
  const matches = NEW_CLASSES.filter(([, test]) => test(path)).map(([id]) => id);
  const id = matches[0] ?? "UNCLASSIFIED";
  if (!matches.length) failures += 1;
  byClass.set(id, [...(byClass.get(id) ?? []), path]);
}
for (const [id, paths] of byClass) {
  lines.push(`### ${id} (${paths.length} files)`);
  for (const path of paths) lines.push(`  ${sha256(readFileSync(join(root, path)))} ${path}`);
}
const modified = git(["status", "--porcelain", "--untracked-files=no"]);
lines.push(`tracked_files_modified=${modified ? modified.split("\n").length : 0}${modified ? ` ${modified.replace(/\n/g, " | ")}` : ""}`);
if (modified) failures += 1;
lines.push("## Totals", ...totals.map(text => `  ${text}`), `  this batch: ${untracked.length} new files in ${byClass.size} classes${byClass.has("UNCLASSIFIED") ? " (UNCLASSIFIED present)" : ""}`);
lines.push(`provenance_missing_or_unclassified_failures=${failures}`, `exit=${failures ? 1 : 0}`);
writeFileSync(output, lines.join("\n") + "\n", { flag: "wx" });
console.log(`hash-evidence ${suffix}: failures=${failures}; log ${output}`);
for (const text of totals) console.log(`  ${text}`);
console.log(`  this batch: ${untracked.length} new files: ${[...byClass].map(([id, paths]) => `${id}=${paths.length}`).join(", ")}`);
process.exitCode = failures ? 1 : 0;
