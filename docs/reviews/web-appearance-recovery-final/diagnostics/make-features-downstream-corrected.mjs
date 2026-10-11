/**
 * Diagnostic generator (CP-APPEARANCE-01 batch 51; finding F-FD1, receipt §6). Writes
 * ./features-downstream.corrected.test.tsx: a byte copy of the frozen Features Sol oracle
 * ../../web-features-recovery-sol/downstream.test.tsx (SHA-256 checked below) with exactly two token edits, both in the
 * shared appearance seed of the H6 §10.5 cases:
 *   L164  seedKey("xai_bg_tone", "sage");  ->  seedKey("xai_bg_tone", "mist");
 *   L186  bgTone: "sage",                  ->  bgTone: "mist",
 * "sage" is outside the Appearance strict domain (contract r3 §2 and §5 item 2: the field is unavailable and displays
 * its default); "mist" is an in-domain, non-default tone, so the seeded display stays observable at both products.
 * Refuses to overwrite. Not evidence by itself: it only prepares the diagnostic oracle.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const FROZEN = fileURLToPath(new URL("../../web-features-recovery-sol/downstream.test.tsx", import.meta.url));
const OUTPUT = fileURLToPath(new URL("./features-downstream.corrected.test.tsx", import.meta.url));
const FROZEN_SHA256 = "88cf89c8"; // prefix recorded in ../../web-features-recovery-final/review-final-regressions-5cd63ff.md §7 (E1)
const sha256 = data => createHash("sha256").update(data).digest("hex");
if (existsSync(OUTPUT)) throw Error(`Refusing to overwrite ${OUTPUT}`);
const frozen = readFileSync(FROZEN, "utf8");
if (!sha256(frozen).startsWith(FROZEN_SHA256)) throw Error(`Frozen oracle hash ${sha256(frozen)} does not start with ${FROZEN_SHA256}`);
const EDITS = [
  [164, '  seedKey("xai_bg_tone", "sage");', '  seedKey("xai_bg_tone", "mist");'],
  [186, '  bgTone: "sage",', '  bgTone: "mist",'],
];
const lines = frozen.split("\n");
for (const [line, before, after] of EDITS) {
  if (lines[line - 1] !== before) throw Error(`L${line} is ${JSON.stringify(lines[line - 1])}, expected ${JSON.stringify(before)}`);
  lines[line - 1] = after;
}
const corrected = lines.join("\n");
writeFileSync(OUTPUT, corrected, { flag: "wx" });
console.log(`frozen ${sha256(frozen)} -> corrected ${sha256(corrected)} (${EDITS.length} line edits)`);
