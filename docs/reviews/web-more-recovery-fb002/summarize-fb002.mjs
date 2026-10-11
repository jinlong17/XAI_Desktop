/**
 * F-B002 matrix summary (control-plane batch 31). Reads every logs/<oracle>-<scope>-<iteration>rNN-<revision>.log of
 * one iteration, checks the per-log invariants, and writes logs/matrix-<iteration>.log (exclusive create):
 *   1. inventory: one line per run log with its SHA-256 and key header fields;
 *   2. invariants: resolved commits, runner hash, lockfile hashes, frozen fixture hash, oracle hash, harness, exit
 *      semantics (exit 0 exactly when every executed case passed);
 *   3. matrix cells: runs, passing runs, per-case pass counts, RangeError counts, failure signatures;
 *   4. before validity at afbfb24: every case of the corrected and original full-file runs against the authoritative
 *      ../web-more-recovery-sol/boundaries-before4-afbfb24.log (first error line and oracle frame line:column), plus
 *      case 002 in the superseded before2 and before3 logs.
 * Usage (from the repository root): node docs/reviews/web-more-recovery-fb002/summarize-fb002.mjs <iteration>
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL("./", import.meta.url));
const logs = join(here, "logs");
const [iteration, ...extra] = process.argv.slice(2);
if (!/^v[0-9]+$/.test(iteration ?? "") || extra.length) throw Error("Usage: node summarize-fb002.mjs <vN>");
// XAI_FB002_SUMMARY_OUT redirects the summary for a dry run (not evidence).
const output = process.env.XAI_FB002_SUMMARY_OUT ?? join(logs, `matrix-${iteration}.log`);
if (existsSync(output)) throw Error(`exists: ${output}`);
const sha256 = data => createHash("sha256").update(data).digest("hex");
const strip = text => text.replace(/\u001b\[[0-9;]*m/g, "");
const RESOLVED = {
  afbfb24: "afbfb24d6f7311366b77852eda927d08467478c2",
  "7b216a3": "7b216a3d5a4947d0f66da042fb275302737fb762",
  f359be6: "f359be6d838393e0f9e93efd80b88b5b09f6144e",
  "5cd63ff": "5cd63ff652f02a2c726187fe12cbc796218d31c0",
};
const LOCK = "df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9";
const FIXTURE = "b117d2044850cbea822367a0f2bbe9a326e27e4c9b5e5537427b5e0b37b87928";
const ORACLE = { corrected: "2e88c1db3e4045ef44c856b86b23f61322ca5002a45062f80a494cb3ac5e50f8", original: "dcbaf57e55f7e907660abacaf233de83dcf769da97b878a9036e358a3dd8ef3e" };
const NAME = new RegExp(`^(corrected|original)-(full|case002)-${iteration}r(\\d{2})-(afbfb24|7b216a3|f359be6|5cd63ff)\\.log$`);

const runs = [];
for (const file of readdirSync(logs).sort()) {
  const match = NAME.exec(file);
  if (!match) continue;
  const raw = readFileSync(join(logs, file));
  const text = strip(raw.toString("utf8"));
  const field = key => (new RegExp(`^${key}=([^\\n]*)$`, "m").exec(text) ?? [, ""])[1];
  const cases = [...text.matchAll(/^case (\d{3}) ([A-Z]+) \| ([^\n]*)((?:\n {4}[a-z]+: [^\n]*)*)/gm)].map(entry => ({
    index: entry[1], status: entry[2], name: entry[3],
    first: (/\n {4}first: ([^\n]*)/.exec(entry[4]) ?? [, ""])[1],
    at: ((/\n {4}at: ([^\n]*)/.exec(entry[4]) ?? [, ""])[1]).replace(/^.*\.tsx:/, "L"),
    range: /\n {4}rangeerror: yes/.test(entry[4]),
  }));
  runs.push({
    file, oracle: match[1], scope: match[2], rep: match[3], revision: match[4], sha: sha256(raw), text, field, cases,
    exit: Number(field("exit")), harness: field("harness_checks"), totals: (/^totals ([^\n]*)$/m.exec(text) ?? [, ""])[1],
    range: (/^rangeerror cases=(\d+) output_lines=(\d+)$/m.exec(text) ?? [, "?", "?"]).slice(1).map(Number),
    allPassed: field("executed_all_passed") === "true",
  });
}
const lines = [`F-B002 matrix summary, iteration ${iteration}`, `summarizer_sha256=${sha256(readFileSync(fileURLToPath(import.meta.url)))}`, `run_logs=${runs.length}`, ""];

// 1. Inventory.
lines.push("## 1. Inventory (one line per run log)");
for (const run of runs) lines.push(`${run.file} sha256=${run.sha} exit=${run.exit} harness=${run.harness} ${run.totals.replace(/ suite_errors.*/, "")} rangeerror_cases=${run.range[0]} rangeerror_lines=${run.range[1]} loadavg=${(/loadavg_at_start=([^\n]*)/.exec(run.text) ?? [, "?"])[1]}`);
lines.push("");

// 2. Invariants.
lines.push("## 2. Invariants");
const invariant = (label, failures) => lines.push(`${failures.length ? "FAIL" : "PASS"} ${label}${failures.length ? `: ${failures.join(", ")}` : ""}`);
invariant("requested revision resolves to the expected full commit", runs.filter(run => run.field("resolved_commit") !== RESOLVED[run.revision]).map(run => run.file));
const runnerHashes = [...new Set(runs.map(run => run.field("runner_sha256")))];
invariant(`one runner hash across all logs (${runnerHashes.join(",")})`, runnerHashes.length === 1 ? [] : ["multiple"]);
invariant(`lockfile gate: expected, dependency, archive (git show) and extracted lockfile = ${LOCK}`, runs.filter(run => ["expected_lockfile_sha256", "dependency_lockfile_sha256", "archive_lockfile_sha256", "extracted_lockfile_sha256"].some(key => run.field(key) !== LOCK)).map(run => run.file));
invariant(`fixture beside the oracle = frozen fixture ${FIXTURE}`, runs.filter(run => !run.text.includes(`fixture_run_sha256=${FIXTURE}`)).map(run => run.file));
invariant("oracle run copy = the requested oracle (corrected 2e88c1db…, original dcbaf57e…)", runs.filter(run => !run.text.includes(`oracle_run_sha256=${ORACLE[run.oracle]}`)).map(run => run.file));
invariant("harness checks PASS", runs.filter(run => !run.harness.startsWith("PASS")).map(run => run.file));
invariant("pin: 0 unaliased @repo imports and no missing required provenance", runs.filter(run => !run.text.includes("pin_unaliased_repo_imports=0") || !run.text.includes("pin_required_provenance_missing=none")).map(run => run.file));
invariant("exit 0 exactly when every executed case passed, else exit 1", runs.filter(run => (run.allPassed ? run.exit !== 0 : run.exit !== 1)).map(run => run.file));
invariant("10 cases reported per log", runs.filter(run => run.cases.length !== 10).map(run => run.file));
lines.push("");

// 3. Matrix cells.
lines.push("## 3. Matrix cells");
const cells = new Map();
for (const run of runs) { const key = `${run.oracle} ${run.scope} ${run.revision}`; if (!cells.has(key)) cells.set(key, []); cells.get(key).push(run); }
for (const [key, cellRuns] of cells) {
  const executedPer = cellRuns.map(run => run.cases.filter(entry => entry.status !== "SKIPPED").length);
  const perCase = Array.from({ length: 10 }, (_, index) => {
    const statuses = cellRuns.map(run => run.cases[index]?.status);
    const executed = statuses.filter(status => status !== "SKIPPED").length;
    return executed ? `c${String(index + 1).padStart(3, "0")}=${statuses.filter(status => status === "PASSED").length}/${executed}` : null;
  }).filter(Boolean);
  const signatures = new Map();
  for (const run of cellRuns) for (const entry of run.cases.filter(item => item.status === "FAILED")) {
    const signature = `c${entry.index} ${entry.first} @${entry.at}`;
    signatures.set(signature, (signatures.get(signature) ?? 0) + 1);
  }
  lines.push(`cell ${key}: runs=${cellRuns.length} runs_all_executed_passed=${cellRuns.filter(run => run.allPassed).length} runs_exit0=${cellRuns.filter(run => run.exit === 0).length} executed_cases_per_run=${[...new Set(executedPer)].join("/")} rangeerror_cases_total=${cellRuns.reduce((sum, run) => sum + run.range[0], 0)} rangeerror_lines_total=${cellRuns.reduce((sum, run) => sum + run.range[1], 0)} runs_with_rangeerror=${cellRuns.filter(run => run.range[0] > 0 || run.range[1] > 0).length}`);
  lines.push(`  per_case_passed ${perCase.join(" ")}`);
  lines.push(`  per_run ${cellRuns.map(run => `r${run.rep}:${run.cases.map(entry => (entry.status === "PASSED" ? "P" : entry.status === "FAILED" ? "F" : "-")).join("")}`).join(" ")}`);
  for (const [signature, count] of signatures) lines.push(`  failure x${count}: ${signature}`);
}
lines.push("");

// 4. Before validity at afbfb24.
lines.push("## 4. Before validity at afbfb24: case by case against the authoritative before4 log");
function blocksOf(file) {
  const text = strip(readFileSync(file, "utf8"));
  const result = new Map();
  for (const block of text.split(/\n(?= FAIL {2})/).slice(1)) {
    const blockLines = block.split("\n");
    const header = /^ FAIL {2}(\S+) > (.*)$/.exec(blockLines[0]);
    if (!header) continue;
    const error = (blockLines.find(line => /^[A-Za-z]*(Error|Exception)\b|^[A-Za-z]+Error:/.test(line)) ?? "(no error line)").trim();
    const frame = blockLines.map(line => line.trim()).find(line => line.startsWith("❯ ") && line.includes(`${header[1]}:`)) ?? "";
    const location = (/:(\d+:\d+)$/.exec(frame) ?? [, "?"])[1];
    if (!result.has(header[2])) result.set(header[2], { error, location: `L${location}` });
  }
  return { result, sha: sha256(readFileSync(file)) };
}
const solDir = join(here, "../web-more-recovery-sol");
const before4 = blocksOf(join(solDir, "boundaries-before4-afbfb24.log"));
const before3 = blocksOf(join(solDir, "boundaries-before3-afbfb24.log"));
const before2 = blocksOf(join(solDir, "boundaries-before2-afbfb24.log"));
lines.push(`before4 ../web-more-recovery-sol/boundaries-before4-afbfb24.log sha256=${before4.sha} failed_cases=${before4.result.size}`);
lines.push(`before3 ../web-more-recovery-sol/boundaries-before3-afbfb24.log sha256=${before3.sha} failed_cases=${before3.result.size} (superseded)`);
lines.push(`before2 ../web-more-recovery-sol/boundaries-before2-afbfb24.log sha256=${before2.sha} failed_cases=${before2.result.size} (superseded)`);
const reference = runs.find(run => run.oracle === "corrected" && run.scope === "full" && run.revision === "afbfb24");
const names = reference ? reference.cases.map(entry => entry.name) : [];
const signaturesFor = (oracle, scope, index) => {
  const map = new Map();
  for (const run of runs.filter(item => item.oracle === oracle && item.scope === scope && item.revision === "afbfb24")) {
    const entry = run.cases[index];
    if (!entry || entry.status === "SKIPPED") continue;
    const signature = entry.status === "PASSED" ? "PASSED" : `${entry.first} @${entry.at}`;
    map.set(signature, (map.get(signature) ?? 0) + 1);
  }
  return map;
};
for (const [index, name] of names.entries()) {
  const reference4 = before4.result.get(name);
  const label = `c${String(index + 1).padStart(3, "0")}`;
  lines.push(`${label} ${name}`);
  lines.push(`  before4: ${reference4 ? `${reference4.error} @${reference4.location}` : "not failed / not present"}`);
  for (const [oracle, scope] of [["corrected", "full"], ["original", "full"], ["corrected", "case002"]]) {
    const signatures = signaturesFor(oracle, scope, index);
    if (!signatures.size) continue;
    for (const [signature, count] of signatures) {
      const [error, location] = signature.split(" @");
      const errorMatch = reference4 && error === reference4.error;
      const locationMatch = reference4 && location === reference4.location;
      lines.push(`  ${oracle} ${scope} x${count}: ${signature}  => vs before4: error ${errorMatch ? "MATCH" : "DIFF"}, location ${locationMatch ? "MATCH" : "DIFF"}`);
    }
  }
  if (index === 1) {
    for (const [label2, set] of [["before3 (superseded)", before3], ["before2 (superseded)", before2]]) {
      const entry = set.result.get(name);
      lines.push(`  ${label2}: ${entry ? `${entry.error} @${entry.location}` : "not present"}`);
    }
  }
}
writeFileSync(output, lines.join("\n") + "\n", { flag: "wx" });
console.log(`written ${output}`);
console.log(lines.filter(line => line.startsWith("PASS ") || line.startsWith("FAIL ") || line.startsWith("cell ")).join("\n"));
