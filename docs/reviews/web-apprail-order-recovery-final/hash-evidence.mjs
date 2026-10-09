/**
 * E25 G1 hash re-derivation for CP-APPRAIL-01 (control-plane batch 64; contract r1 §15 E1–E25 and Rules). Written
 * after ../web-appearance-recovery-final/hash-evidence.mjs (1ef935b5…, read, not modified), whose item table is
 * Appearance-specific. Same method.
 *
 * Usage (from the repository root): node docs/reviews/web-apprail-order-recovery-final/hash-evidence.mjs <suffix>
 *
 * - Committed items (E1–E17 and the supplementary K-1, OE, C-FB002 and C-FD1 items): the artifact list is derived from
 *   git itself, as every file the producing commit added under the item's directory that matches the item's name
 *   filter, so no artifact can be left out by hand. For each file it recomputes the SHA-256 from this checkout, checks
 *   that the producing commit is the last commit to touch the path and that `git diff --quiet <commit> HEAD -- <path>`
 *   holds (unchanged since), and looks the hash up in the item's receipt(s) and in the control plane: a full 64-hex
 *   match, an 8-hex prefix match, or none.
 * - E6 product: the 19 contract §11 files hashed at the fixed revision (`git show f9eb4b1:<path>`), looked up in this
 *   batch's E19 log; Terra's run record is a committed item above.
 * - This batch (E18–E25, tools and logs): every untracked file under docs/reviews/ is classified by path into an
 *   item; an unclassified untracked file is a failure. Hashes are recorded for the E25 receipt.
 * Writes hashes-<suffix>.log beside this file (refusing to overwrite) and exits 1 on any missing file, provenance
 * failure, unclassified new file or modified tracked file.
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
const SOL = `${R}/web-apprail-order-recovery-sol`, IND = `${R}/web-apprail-order-recovery-independent`, NAT = `${R}/web-apprail-order-recovery-native`;
const F1 = `${R}/web-apprail-order-recovery-f1`, TER = `${R}/web-apprail-order-recovery-terra`, FIN = `${R}/web-apprail-order-recovery-final`;
const CP = `${R}/20260908-full-product-audit/CURRENT-CONTROL-PLANE.md`;
const sha256 = data => createHash("sha256").update(data).digest("hex");
const git = args => execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 }).trim();
const full = sha => git(["rev-parse", "--verify", `${sha}^{commit}`]);
const head = git(["rev-parse", "HEAD"]);
const base = path => path.split("/").at(-1);
const added = (commit, dir) => git(["show", "--name-only", "--format=", "--diff-filter=A", commit, "--", dir]).split("\n").filter(Boolean);

const SHELL = "packages/xai-web-shell";
const SECTION11 = [
  ...["docs/api.md", "docs/test.md", "src/AppRail.tsx", "src/Shell.tsx", "src/Topbar.tsx", "src/__tests__/AppRail.railorder.test.tsx", "src/__tests__/RailOrderStatus.test.tsx",
    "src/__tests__/Topbar.test.tsx", "src/__tests__/railOrderFixture.tsx", "src/__tests__/railOrderModel.test.ts", "src/index.ts", "src/internal/RailOrderStatus.tsx",
    "src/internal/railOrderController.tsx", "src/internal/railOrderCopy.ts", "src/internal/railOrderModel.ts", "src/railOrderStatus.css", "src/types.ts"].map(path => `${SHELL}/${path}`),
  "apps/web/src/App.tsx", "apps/web/src/__tests__/App.railorder.test.tsx",
];
const ITEMS = [
  { id: "E1", commit: "d6ea500", dir: SOL, select: name => !name.endsWith(".log"), receipts: [`${SOL}/README.md`, CP] },
  { id: "E2", commit: "d6ea500", dir: SOL, select: name => name.endsWith(".log"), receipts: [`${SOL}/README.md`, CP] },
  { id: "E3", commit: "6e9ec9c", dir: IND, select: () => true, receipts: [`${IND}/README.md`, CP] },
  { id: "E4", commit: "04ee6a2", dir: NAT, select: () => true, receipts: [`${NAT}/before-419e56d.md`, CP] },
  { id: "E5", commit: "04ee6a2", dir: F1, select: () => true, receipts: [`${F1}/before-419e56d.md`, CP] },
  { id: "E6 run record", commit: "0d440ca", dir: TER, select: () => true, receipts: [`${TER}/implementation.md`, CP] },
  { id: "E6 product (§11 files at f9eb4b1, commit f9eb4b1)", atRevision: "f9eb4b1", files: SECTION11, receipts: [`${FIN}/protected-diff-${suffix}-f9eb4b1.log`] },
  { id: "E7", commit: "94b12ba", dir: SOL, select: () => true, receipts: [`${SOL}/fixed-f9eb4b1.md`, CP] },
  { id: "E8", commit: "94b12ba", dir: IND, select: () => true, receipts: [`${SOL}/fixed-f9eb4b1.md`] },
  { id: "E9", commit: "ae7b69e", dir: NAT, select: name => !/-fixed1-(protection|export)/.test(name), receipts: [`${NAT}/review-controls-protection-export-f9eb4b1.md`, CP] },
  { id: "E10", commit: "ae7b69e", dir: NAT, select: name => /-fixed1-protection/.test(name), receipts: [`${NAT}/review-controls-protection-export-f9eb4b1.md`] },
  { id: "E11", commit: "ae7b69e", dir: NAT, select: name => /-fixed1-export/.test(name), receipts: [`${NAT}/review-controls-protection-export-f9eb4b1.md`] },
  { id: "E12", commit: "55cf1e9", dir: NAT, select: name => !/-fixed1-visual-/.test(name), receipts: [`${NAT}/review-downstream-visual-f9eb4b1.md`, CP] },
  { id: "E13", commit: "55cf1e9", dir: NAT, select: name => /-fixed1-visual-/.test(name), receipts: [`${NAT}/review-downstream-visual-f9eb4b1.md`] },
  { id: "E14", commit: "5c6bcd2", dir: NAT, select: () => true, receipts: [`${NAT}/review-keyboard-f9eb4b1.md`, CP] },
  { id: "E15 (sticky F1 runners)", commit: "94b12ba", dir: `${R}/web-sticky-recovery-f1`, select: () => true, receipts: [`${SOL}/fixed-f9eb4b1.md`] },
  { id: "E15 (Features F1 runner)", commit: "94b12ba", dir: `${R}/web-features-recovery-f1`, select: () => true, receipts: [`${SOL}/fixed-f9eb4b1.md`] },
  { id: "E16", commit: "94b12ba", dir: F1, select: () => true, receipts: [`${SOL}/fixed-f9eb4b1.md`] },
  { id: "E17", commit: "94b12ba", dir: `${R}/web-native-keyinput-k1`, select: () => true, receipts: [`${SOL}/fixed-f9eb4b1.md`] },
  { id: "supplementary K-1", commit: "6b9f0ee", dir: `${R}/web-native-keyinput-k1`, select: name => name === "review-k1.md" || name === "verify-f1-appearance-k1.mjs", receipts: [`${R}/web-native-keyinput-k1/review-k1.md`, CP] },
  { id: "supplementary OE", commit: "26cfce8", dir: `${R}/web-appearance-recovery-oracle-erratum`, select: name => !name.endsWith(".log"), receipts: [`${R}/web-appearance-recovery-oracle-erratum/review-oe.md`] },
  { id: "supplementary C-FB002", commit: "05b21f4", dir: `${R}/web-more-recovery-fb002`, select: name => !name.endsWith(".log"), receipts: [`${R}/web-more-recovery-fb002/review-fb002.md`] },
  { id: "supplementary C-FD1", commit: "c6d1ed4", dir: `${R}/web-appearance-recovery-final`, select: name => /^(diag-features-sol-corrected\.(mjs|diff)|features-downstream\.corrected\.(test\.tsx|diff)|make-features-downstream-corrected\.mjs)$/.test(name), receipts: [`${R}/web-appearance-recovery-final/review-final-regressions-419e56d.md`] },
];
// This batch: untracked files under docs/reviews/, classified by path (first match wins).
const S = "apprail-final-v1";
const NEW_CLASSES = [
  ["E18", path => path === `${FIN}/verify-static.mjs` || path.startsWith(`${FIN}/search-`)],
  ["E19", path => path.startsWith(`${FIN}/protected-diff-`)],
  ["E20", path => path === `${R}/web-features-recovery-final/storage-check-types-${S}-f9eb4b1.log` || path === `${SOL}/bytes-${S}-f9eb4b1.log`],
  ["E21", path => /\/web-apprail-order-recovery-final\/shell-/.test(path)],
  ["E22", path => /\/web-apprail-order-recovery-final\/(web-|storage-unchanged-)/.test(path)],
  ["E21-E22 runner", path => path === `${FIN}/verify-packages.mjs`],
  ["E24", path => /\/web-apprail-order-recovery-final\/(verify-native-(host|downstream)\.mjs|native-host-(harness\.mjs|harness\.e24-vs-[a-z-]+\.diff|matrix\.tsx|prelude\.js)|native-downstream\.tsx|native-f9eb4b1-)/.test(path)
    || path.startsWith(`${R}/web-features-recovery-native/native-f9eb4b1-${S}-`)],
  ["E23 host-suite copies (runner copies, byte-identical tests, diffs, frozen refusal transcript)", path => path.startsWith(`${FIN}/host-suites/`) && !path.endsWith(".log") || path === `${FIN}/frozen-host-suite-refusals-${S}.log`],
  ["E23", path => path.includes(S)],
  ["E25 receipt, comparison and hash tools", path => /\/web-apprail-order-recovery-final\/(compare-accepted|hash-evidence|review-final-regressions-|hashes-)/.test(path)],
];

const lines = [`hashes=${suffix}`, `checkout_head=${head}`, `method=sha256 of the file in this checkout (E6 product: git show f9eb4b1:<path>); producing commit = the commit that added it and the last to touch it; receipt lookup = full 64-hex or first 8 hex in the receipt text`];
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
  if (!files.length) { failures += 1; lines.push(`## ${item.id}: NO FILES (failure)`); continue; }
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
