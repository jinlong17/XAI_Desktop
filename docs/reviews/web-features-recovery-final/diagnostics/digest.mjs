// Digest of every development smoke run and diagnostic run of batch 30 (scratchpad outputs; not gate evidence).
// Usage: node digest.mjs <scratchpad> <output>   — writes one line per raw log with its SHA-256 and key facts.
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [scratch, output] = process.argv.slice(2);
if (existsSync(output)) throw Error(`exists: ${output}`);
const groups = [
  ["smoke1", "development smoke: verify-static.mjs (output redirected; same runner hash as the evidence run)"],
  ["smoke2", "development smoke: verify-packages.mjs at 5cd63ff (earlier runner revisions; see runner_sha256)"],
  ["smoke3", "development smoke: verify-callers.mjs at 5cd63ff (more-fields, more-host, datetime)"],
  ["smoke4", "development smoke: verify-callers.mjs at 5cd63ff, all 17 modes"],
  ["smoke5", "development smoke: verify-packages.mjs at f359be6, all 10 modes"],
  ["diag-more-boundaries", "diagnosis D1: unmodified verify-callers.mjs, mode more-boundaries, 10 repetitions per revision, DEBUG_PRINT_LIMIT=300000"],
  ["diag-isolation", "diagnosis D2: diagnostic runner variant, original boundaries.test.tsx with -t 'invalid and unavailable sources' (case 002 alone), 8 repetitions at 5cd63ff"],
  ["diag-instrumented", "diagnosis D3a: case-002 copy with a vi.mock wrapper on mutatePref (the mock did not attach; no DIAG call lines), 2 runs"],
  ["diag-instrumented2", "diagnosis D3b: case-002 copy logging account scope, lock-manager calls and recovery texts, 1 run"],
  ["diag-probe", "diagnosis D4: isolated probe of the case-002 getItem spy (diag-probe.test.tsx), 1 run"],
  ["diag-probed", "diagnosis D5: original file plus one probe line after the case-002 spy (make-probed-boundaries.mjs), 6 runs at 5cd63ff"],
  ["diag-probed2", "diagnosis D6: original file plus recursion-depth probes at case 001 start and after the case-002 spy (make-probed-boundaries2.mjs), 4 full-file + 2 isolated runs at 5cd63ff"],
  ["diag-probed3", "diagnosis D7: original file plus an outermost-throw recorder for case 002 (make-probed-boundaries3.mjs), 6 full-file runs at f359be6"],
  ["diag-corrected", "diagnosis D8: candidate corrected oracle (make-corrected-boundaries.mjs), 8 full-file runs per revision + 4 isolated runs at 5cd63ff"],
  ["eslint-negative", "harness control: ESLint module-resolution guard positive/negative control (eslint-guard-negative.mjs)"],
];
const strip = text => text.replace(/\u001b\[[0-9;]*m/g, "");
const lines = ["digest of batch-30 development smoke and diagnostic runs (scratchpad outputs; not gate evidence)", `scratchpad=${scratch}`];
for (const [dir, label] of groups) {
  const folder = join(scratch, dir);
  if (!existsSync(folder) || !statSync(folder).isDirectory()) { lines.push(`## ${dir}: missing`); continue; }
  const files = readdirSync(folder).filter(name => name.endsWith(".log")).sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
  lines.push(`## ${dir}: ${label} (${files.length} logs)`);
  for (const name of files) {
    const raw = readFileSync(join(folder, name));
    const text = strip(raw.toString("utf8"));
    const get = key => (text.match(new RegExp(`^${key}=([^\\n]*)$`, "m")) ?? [, "-"])[1];
    const totals = (text.match(/^totals [^\n]*/m) ?? [""])[0].replace(/ suite_errors.*/, "").replace(/^totals /, "");
    const assertion = (text.match(/AssertionError: [^\n]*/) ?? [""])[0];
    const notCompleted = [...new Set([...text.matchAll(/([A-Za-z ()]+) reset to default was not completed/g)].map(match => match[1].trim()))];
    const diag = [...text.matchAll(/^DIAG [^\n]*/gm)].map(match => match[0].slice(0, 400));
    const runner = get("runner_sha256");
    lines.push(`  ${name} sha256=${createHash("sha256").update(raw).digest("hex")} revision=${get("resolved_commit").slice(0, 12)} runner_sha256=${runner.slice(0, 12)} exit=${get("exit")}${totals ? ` ${totals}` : ""}${assertion ? ` | ${assertion}` : ""}${notCompleted.length ? ` | not-completed: ${notCompleted.join("; ")}` : ""}`);
    for (const line of diag) lines.push(`      ${line}`);
  }
  for (const name of readdirSync(folder).filter(entry => !entry.endsWith(".log")).sort()) lines.push(`  (other file) ${name}`);
}
// Generated (not committed) diagnostic inputs and console captures, by SHA-256.
lines.push("## generated diagnostic inputs (scratchpad; regenerate with the make-*.mjs scripts) and console captures");
for (const name of ["diagtool/diag-callers.mjs", "probed-boundaries.test.tsx", "probed2-boundaries.test.tsx", "probed3-boundaries.test.tsx", "corrected-boundaries.test.tsx", "eslint-negative2-console.txt"]) {
  const file = join(scratch, name);
  lines.push(`  ${existsSync(file) ? createHash("sha256").update(readFileSync(file)).digest("hex") : "missing"} ${name}`);
}
writeFileSync(output, lines.join("\n") + "\n", { flag: "wx" });
console.log("digest written", output);
