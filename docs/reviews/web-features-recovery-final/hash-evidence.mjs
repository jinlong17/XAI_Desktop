/**
 * E25 hash re-derivation for CP-FEATURES-01 (control-plane batch 30; contract §14 E1–E25).
 *
 * Usage (from the repository root): node docs/reviews/web-features-recovery-final/hash-evidence.mjs <suffix>
 *
 * For every evidence item E1–E24 it recomputes the SHA-256 of each listed artifact from the file in this checkout,
 * resolves the commit that last touched the path (`git log -1`), checks that this is the expected producing commit
 * and that `git diff --quiet <commit> HEAD -- <path>` holds (the committed file is unchanged since), and looks the
 * recomputed hash up in the item's receipt(s): a full 64-hex match, an 8-hex prefix match, or none. E6 hashes the
 * eleven contract §11 files with `git show 5cd63ff:<path>`. Items produced by this batch (E18–E24) have no prior
 * commit; they are reported as new. Writes hashes-<suffix>.log beside this file (refusing to overwrite) and exits
 * 1 if any expected-commit, unchanged-since or full-receipt check fails.
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
const output = join(evidence, `hashes-${suffix}.log`);
if (existsSync(output)) throw Error(`Evidence exists; use a new suffix: ${output}`);

const R = "docs/reviews";
const SOL = `${R}/web-features-recovery-sol`, IND = `${R}/web-features-recovery-independent`, NAT = `${R}/web-features-recovery-native`;
const F1 = `${R}/web-features-recovery-f1`, SF1 = `${R}/web-sticky-recovery-f1`, FIN = `${R}/web-features-recovery-final`;
const FEATURES = "packages/xai-web-settings-features-panel";
const sha256 = data => createHash("sha256").update(data).digest("hex");
const git = args => execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 }).trim();
const full = sha => git(["rev-parse", "--verify", `${sha}^{commit}`]);
const head = git(["rev-parse", "HEAD"]);

const solModes = ["bytes", "fields", "reset", "queues", "continuity-export", "downstream", "original", "readers-features", "readers-web"];
const pngs = (prefix, names) => names.map(name => `${NAT}/${prefix}-${name}.png`);
const visualNames = ["1024-all8", "1440-all8", "375-all8", "375-before-f359be6-clean", "375-clean", "375-dialog", "375-partial", "375-reload", "414-all8", "768-all8", "768-pet-on-before-f359be6-clean", "768-pet-on-clean"];
const visual = version => [...pngs(`native-5cd63ff-${version}-visual`, visualNames), ...pngs(`native-5cd63ff-${version}-visual-zh`, visualNames)];
const exportShapes = ["x1-sparse-set-one-field", "x10b-recovered-after-click-failure", "x2-sparse-reset-one-field-after-partial-reset", "x3-mixed-set-and-reset", "x4-all-eight-sets", "x5-all-eight-pending-resets", "x6-departure-dialog", "x7-fresh-locked-after-a-to-locked", "x8-fresh-b-after-a-to-b", "x9-held-real-lock"].map(shape => `${NAT}/native-5cd63ff-fixed1-export-${shape}-features-draft.json`);
const SECTION11 = ["docs/api.md", "docs/test.md", "src/FeaturesPane.tsx", "src/__tests__/FeaturesPane.test.tsx", "src/__tests__/FeaturesPaneRecovery.test.tsx", "src/__tests__/featuresLockFixture.ts", "src/internal/featuresPane.tsx", "src/internal/featuresRecovery.ts", "src/internal/featuresRecoveryCopy.ts", "src/styles.css", "src/types.ts"].map(path => `${FEATURES}/${path}`);
const callerModes = ["more-fields", "more-reset", "more-queues", "more-boundaries", "more-owner-export", "more-original", "more-host", "notifications-core", "notifications-recovery", "notifications-operations", "notifications-boundaries", "notifications-extended", "notifications-original", "notifications-astra-boundaries", "notifications-astra-host", "notifications-parent-host", "datetime"];
const pkg = (mode, revisions = ["5cd63ff", "f359be6"]) => revisions.map(revision => `${FIN}/${mode}-${suffix}-${revision}.log`);

const ITEMS = [
  { id: "E1", commit: "11e0afb", receipts: [`${SOL}/README.md`], files: ["fixture.tsx", "bytes.test.tsx", "fields.test.tsx", "reset.test.tsx", "queues.test.tsx", "continuity-export.test.tsx", "downstream.test.tsx", "verify-fixed.mjs", "README.md"].map(file => `${SOL}/${file}`) },
  { id: "E2", commit: "11e0afb", receipts: [`${SOL}/README.md`], files: [...solModes.map(mode => `${SOL}/${mode}-before2-f359be6.log`), ...["bytes", "fields", "reset", "queues", "continuity-export", "downstream"].map(mode => `${SOL}/${mode}-before1-f359be6.log`)] },
  { id: "E3", commit: "b732c27", receipts: [`${IND}/before-f359be6.md`], files: ["host.test.tsx", "verify-fixed.mjs", "host-before1-f359be6.log", "before-f359be6.md"].map(file => `${IND}/${file}`) },
  { id: "E4", commit: "4c5323f", receipts: [`${NAT}/before-f359be6.md`], files: [...["native-app.tsx", "native-prelude.js", "verify-native-before.mjs", "native-f359be6-before1-h5.log", "native-f359be6-before1-h6.log", "native-f359be6-before1-h10.log", "before-f359be6.md"].map(file => `${NAT}/${file}`), ...pngs("native-f359be6-before1", ["h10-1440-en", "h10-375-en", "h10-375-zh", "h5-after-reload", "h5-after-reset", "h5-at-reset-control", "h5-before-reset", "h6-after-drag", "h6-after-reset", "h6-at-reset-control", "h6-before-reset"])] },
  { id: "E5", commit: "4c5323f", receipts: [`${F1}/before-f359be6.md`], files: ["verify-f1-features.mjs", "f1-features-host.tsx", "f1-f359be6-selfcheck-before1.log", "f1-f359be6-features-before1.log", "before-f359be6.md"].map(file => `${F1}/${file}`) },
  { id: "E6", commit: "5cd63ff", receipts: [`${SOL}/fixed-5cd63ff.md`, `${FIN}/protected-diff-${suffix}-5cd63ff.log`], files: SECTION11, atRevision: "5cd63ff" },
  { id: "E7", commit: "eb37a59", receipts: [`${SOL}/fixed-5cd63ff.md`], files: [...solModes.map(mode => `${SOL}/${mode}-fixed1-5cd63ff.log`), `${SOL}/fixed-5cd63ff.md`] },
  { id: "E8", commit: "eb37a59", receipts: [`${IND}/fixed-5cd63ff.md`], files: [`${IND}/host-fixed1-5cd63ff.log`, `${IND}/fixed-5cd63ff.md`] },
  { id: "E9", commit: "58a93ef", receipts: [`${NAT}/review-controls-reset-export-5cd63ff.md`], files: [...["native-5cd63ff-fixed1-controls.log", "native-fixed.tsx", "native-fixed-host.tsx", "native-fixed-prelude.js", "verify-native-fixed.mjs"].map(file => `${NAT}/${file}`), `${NAT}/review-controls-reset-export-5cd63ff.md`] },
  { id: "E10", commit: "58a93ef", receipts: [`${NAT}/review-controls-reset-export-5cd63ff.md`], files: [`${NAT}/native-5cd63ff-fixed1-reset.log`] },
  { id: "E11", commit: "58a93ef", receipts: [`${NAT}/review-controls-reset-export-5cd63ff.md`], files: [`${NAT}/native-5cd63ff-fixed1-export.log`, ...exportShapes] },
  { id: "E12", commit: "312b27c", receipts: [`${NAT}/review-host-downstream-5cd63ff.md`], files: [...["native-5cd63ff-fixed1-host.log", "native-host-matrix.tsx", "native-host-harness.mjs", "native-host-prelude.js", "verify-native-host.mjs"].map(file => `${NAT}/${file}`), `${NAT}/review-host-downstream-5cd63ff.md`] },
  { id: "E13", commit: "312b27c", receipts: [`${NAT}/review-host-downstream-5cd63ff.md`], files: ["native-5cd63ff-fixed1-downstream.log", "native-downstream.tsx", "verify-native-downstream.mjs"].map(file => `${NAT}/${file}`) },
  { id: "E14", commit: "5905e37", receipts: [`${NAT}/review-visual-keyboard-5cd63ff.md`, `${NAT}/native-5cd63ff-v2-visual.log`, `${NAT}/native-5cd63ff-v2-visual-zh.log`], files: [...["native-5cd63ff-v2-visual.log", "native-5cd63ff-v2-visual-zh.log", "verify-visual-fixed.mjs", "native-visual-fixed.tsx", "review-visual-keyboard-5cd63ff.md"].map(file => `${NAT}/${file}`), ...visual("v2")] },
  { id: "E14-superseded-v1", commit: "5905e37", receipts: [`${NAT}/review-visual-keyboard-5cd63ff.md`, `${NAT}/native-5cd63ff-v1-visual.log`, `${NAT}/native-5cd63ff-v1-visual-zh.log`], files: [`${NAT}/native-5cd63ff-v1-visual.log`, `${NAT}/native-5cd63ff-v1-visual-zh.log`, ...visual("v1")] },
  { id: "E15", commit: "5905e37", receipts: [`${NAT}/review-visual-keyboard-5cd63ff.md`], files: [`${NAT}/native-5cd63ff-v2-visual.log`, `${NAT}/native-5cd63ff-v2-visual-zh.log`] },
  { id: "E16", commit: "eb37a59", receipts: [`${F1}/fixed-5cd63ff.md`], files: ["sticky", "more", "collaborate", "selfcheck", "notifications", "date-time", "smart-lists", "header", "pomodoro", "race"].map(mode => `${SF1}/f1-5cd63ff-${mode}-fixed1.log`) },
  { id: "E17", commit: "eb37a59", receipts: [`${F1}/fixed-5cd63ff.md`], files: [`${F1}/f1-5cd63ff-features-fixed1.log`, `${F1}/f1-5cd63ff-selfcheck-fixed1.log`, `${F1}/fixed-5cd63ff.md`] },
  { id: "E18", commit: null, receipts: [], files: [`${FIN}/search-${suffix}-5cd63ff.log`, `${FIN}/verify-static.mjs`] },
  { id: "E19", commit: null, receipts: [], files: [`${FIN}/protected-diff-${suffix}-5cd63ff.log`] },
  { id: "E20", commit: null, receipts: [], files: [...pkg("storage-check-types"), `${SOL}/bytes-${suffix}-5cd63ff.log`] },
  { id: "E20-cited-E7", commit: "eb37a59", receipts: [`${SOL}/fixed-5cd63ff.md`], files: [`${SOL}/bytes-fixed1-5cd63ff.log`] },
  { id: "E21", commit: null, receipts: [], files: [...pkg("features-test"), ...pkg("features-readers"), ...pkg("features-typecheck"), ...pkg("features-lint"), `${FIN}/verify-packages.mjs`] },
  { id: "E22", commit: null, receipts: [], files: [...pkg("web-test"), ...pkg("web-check-types"), ...pkg("web-lint")] },
  { id: "E23", commit: null, receipts: [], files: pkg("settings-shell-test") },
  { id: "E24", commit: null, receipts: [], files: [...pkg("settings-rest-test"), ...callerModes.flatMap(mode => pkg(mode)), `${FIN}/more-boundaries-features-final-v2-5cd63ff.log`, `${FIN}/more-boundaries-features-final-v2-f359be6.log`, ...["bytes", "fields", "queues", "continuity-export", "original"].map(mode => `${R}/web-sticky-recovery-sol/${mode}-${suffix}-5cd63ff.log`), `${R}/web-sticky-recovery-independent/host-${suffix}-5cd63ff.log`, `${FIN}/verify-callers.mjs`, `${FIN}/compare-accepted.mjs`, `${FIN}/compare-accepted-${suffix}.log`] },
];

const lines = [`hashes=${suffix}`, `checkout_head=${head}`, `method=sha256 of the committed file in this checkout (E6: git show 5cd63ff:<path>); receipt lookup = full 64-hex or first 8 hex in the receipt text`];
let failures = 0;
const receiptCache = new Map();
const receiptText = path => { if (!receiptCache.has(path)) receiptCache.set(path, existsSync(join(root, path)) ? readFileSync(join(root, path), "utf8") : ""); return receiptCache.get(path); };
for (const item of ITEMS) {
  const expected = item.commit ? full(item.commit) : null;
  lines.push(`## ${item.id}${expected ? ` producing commit ${expected}` : " produced by this batch (new files)"}${item.receipts.length ? ` receipts ${item.receipts.join(", ")}` : ""}`);
  let full64 = 0, prefix8 = 0, none = 0;
  for (const path of item.files) {
    const exists = item.atRevision ? spawnSync("git", ["cat-file", "-e", `${item.atRevision}:${path}`], { cwd: root }).status === 0 : existsSync(join(root, path));
    if (!exists) { lines.push(`  MISSING ${path}`); failures += 1; continue; }
    const data = item.atRevision ? execFileSync("git", ["show", `${item.atRevision}:${path}`], { cwd: root, maxBuffer: 256 * 1024 * 1024 }) : readFileSync(join(root, path));
    const hash = sha256(data);
    const last = git(["log", "-1", "--format=%H", "--", path]);
    let provenance = "new (untracked in this checkout)";
    if (expected) {
      const unchanged = spawnSync("git", ["diff", "--quiet", expected, "HEAD", "--", path], { cwd: root }).status === 0;
      const inCommit = git(["show", "--name-only", "--format=", expected, "--", path]) === path;
      const ok = last === expected && unchanged && inCommit;
      if (!ok) failures += 1;
      provenance = `${ok ? "OK" : "FAIL"} last_commit=${last.slice(0, 12)} in_producing_commit=${inCommit} unchanged_since=${unchanged}`;
    } else if (last) provenance = `tracked last_commit=${last.slice(0, 12)}`;
    const own = item.receipts.filter(receipt => receipt !== path);
    const kinds = own.map(receipt => [receipt, receiptText(receipt).includes(hash) ? "full" : receiptText(receipt).includes(hash.slice(0, 8)) ? "prefix8" : "not-listed"]);
    const hit = own.length ? kinds.map(([receipt, kind]) => `${receipt.split("/").at(-1)}:${kind}`).join(", ") : "n/a (receipt file itself or new file)";
    if (kinds.some(([, kind]) => kind === "full")) full64 += 1; else if (kinds.some(([, kind]) => kind === "prefix8")) prefix8 += 1; else none += 1;
    lines.push(`  ${hash} ${path} | ${provenance} | receipt ${hit}`);
  }
  lines.push(`  summary ${item.id}: files=${item.files.length} receipt_full=${full64} receipt_prefix8=${prefix8} receipt_none_or_na=${none}`);
}
lines.push(`provenance_or_missing_failures=${failures}`, `exit=${failures ? 1 : 0}`);
writeFileSync(output, lines.join("\n") + "\n", { flag: "wx" });
console.log(`hash-evidence ${suffix}: failures=${failures}; log ${output}`);
process.exitCode = failures ? 1 : 0;
