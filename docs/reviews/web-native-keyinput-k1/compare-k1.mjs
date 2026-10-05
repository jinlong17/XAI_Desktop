/**
 * K-1 (batch 44): check-by-check comparison of a committed (frozen) runner log with a K-1 run of the same mode at the
 * same product SHA. Read-only: it reads the logs named on the command line and prints JSON lines.
 *
 * Usage: node docs/reviews/web-native-keyinput-k1/compare-k1.mjs <native|f1> <committed.log> <k1.log> [...pairs]
 *
 * For each pair it compares:
 *   - every precondition check (id and pass) as an ordered sequence, excluding the K-1 audit precondition
 *     "run:k1-keyboard-trace-contains-only-the-runner-key-presses" that only the corrected copies add;
 *   - native: every verdict (id -> requirementHolds) and fact (id -> observed); F1: every deferred product check
 *     (id -> pass) and every case outcome (state and F1-signature counts);
 *   - the result record (harnessValid, verdict, failures, runtime errors, exceptions, console warnings, JavaScript
 *     dialogs by type and answer);
 *   - the evidence attached to every verdict, fact and observation record after dropping volatile fields (timing,
 *     frame samples, sequence numbers, screenshot files and hashes, router history keys, the runners' ephemeral
 *     127.0.0.1 port); remaining differences are printed by path for manual review and are not by themselves a
 *     changed outcome;
 *   - the sequence footprint: per record, the largest instrument sequence number in each log (stray keydowns that
 *     an instrument records raise the sequence of every later record).
 *
 * Reproduce the committed comparison-k1.log by running, from docs/reviews, the two invocations listed in its
 * header record (one for the native pairs, one for the F1 pairs).
 */
import { readFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";

const [kind, ...files] = process.argv.slice(2);
if (!["native", "f1"].includes(kind) || files.length < 2 || files.length % 2) throw Error("usage: compare-k1.mjs <native|f1> <committed.log> <k1.log> [...]");
const K1_CHECK = "run:k1-keyboard-trace-contains-only-the-runner-key-presses";
const VOLATILE = new Set(["seq", "t", "at", "atMs", "timeStamp", "now", "frames", "renderedFrames", "firstSavedFrameT", "lastSavedFrameT", "savedSpanMs",
  "lastFrameText", "file", "screenshot", "sha256", "png", "timeline", "afterCheck", "elapsedMs", "durationMs", "point", "x", "y"]);
// A react-router history key ("default" or a random 8-character base-36 string) is volatile; storage keys are not.
const isVolatile = (k, v) => VOLATILE.has(k) || (k === "key" && typeof v === "string" && /^[a-z0-9]{8}$/.test(v));
const load = (path) => readFileSync(path, "utf8").trim().split("\n").map((line) => JSON.parse(line));
const strip = (value) => {
  if (Array.isArray(value)) return value.map(strip);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).filter(([k, v]) => !isVolatile(k, v)).map(([k, v]) => [k, strip(v)]));
  // The runners' own servers listen on an ephemeral 127.0.0.1 port.
  if (typeof value === "string") return value.replace(/http:\/\/127\.0\.0\.1:\d+/g, "http://127.0.0.1:PORT");
  return value;
};
const diffPaths = (a, b, path = "", out = []) => {
  if (out.length >= 40) return out;
  if (isDeepStrictEqual(a, b)) return out;
  if (a && b && typeof a === "object" && typeof b === "object" && Array.isArray(a) === Array.isArray(b)) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) diffPaths(a[k], b[k], `${path}.${k}`, out);
    return out;
  }
  out.push({ path: path || "(root)", committed: JSON.stringify(a)?.slice(0, 160), k1: JSON.stringify(b)?.slice(0, 160) });
  return out;
};

for (let i = 0; i < files.length; i += 2) {
  const [committedPath, k1Path] = [files[i], files[i + 1]];
  const A = load(committedPath);
  const B = load(k1Path);
  const pre = (log) => log.filter((r) => r.name === "check" && r.kind === "precondition" && r.id !== K1_CHECK).map((r) => `${r.id}=${r.pass}`);
  const preA = pre(A), preB = pre(B);
  let firstDivergence = null;
  for (let j = 0; j < Math.max(preA.length, preB.length); j += 1) if (preA[j] !== preB[j]) { firstDivergence = { index: j, committed: preA[j] ?? null, k1: preB[j] ?? null }; break; }
  const summary = { committed: committedPath, k1: k1Path, kind,
    preconditions: { committed: preA.length, k1: preB.length, identicalSequence: firstDivergence === null, firstDivergence, allPassCommitted: preA.every((s) => s.endsWith("=true")), allPassK1: preB.every((s) => s.endsWith("=true")) },
    k1AuditPrecondition: (B.find((r) => r.name === "check" && r.id === K1_CHECK) ?? null) };
  const outcomeRows = [];
  if (kind === "native") {
    const verdicts = (log) => new Map(log.filter((r) => r.name === "verdict").map((r) => [r.id, r.kind === "fact" ? `fact:${r.observed}` : `holds:${r.requirementHolds}`]));
    const vA = verdicts(A), vB = verdicts(B);
    for (const id of new Set([...vA.keys(), ...vB.keys()])) outcomeRows.push({ id, committed: vA.get(id) ?? null, k1: vB.get(id) ?? null, same: vA.get(id) === vB.get(id) });
  } else {
    const products = (log) => new Map(log.filter((r) => r.name === "check" && r.kind === "product").map((r) => [r.id, `pass:${r.pass}`]));
    const pA = products(A), pB = products(B);
    for (const id of new Set([...pA.keys(), ...pB.keys()])) outcomeRows.push({ id, committed: pA.get(id) ?? null, k1: pB.get(id) ?? null, same: pA.get(id) === pB.get(id) });
    const cases = (log) => new Map((log.at(-1).outcomes ?? []).map((o) => [o.case, `state:${o.state};proceeds:${o.proceeds};dup:${o.duplicateProceeds};nonLive:${o.nonLiveBlockerCalls};invalid:${o.invalidTransitionThrows};runtime:${o.runtimeErrors};f1:${o.f1Signature}`]));
    const cA = cases(A), cB = cases(B);
    for (const id of new Set([...cA.keys(), ...cB.keys()])) outcomeRows.push({ id: `outcome:${id}`, committed: cA.get(id) ?? null, k1: cB.get(id) ?? null, same: cA.get(id) === cB.get(id) });
  }
  const rA = A.at(-1), rB = B.at(-1);
  const resultView = (r) => ({ harnessValid: r.harnessValid, verdict: r.verdict ?? null, pass: r.pass ?? null, requirementFailures: r.requirementFailures ?? null, deferredFailures: r.deferredFailures ?? null,
    runtimeErrors: r.runtimeErrors, exceptions: r.exceptions ?? null, consoleWarnings: r.consoleWarnings, dialogs: (r.dialogs ?? []).map((d) => `${d.type}:${d.accepted}:${d.expected}`), checkId: r.checkId ?? null });
  summary.outcomes = { total: outcomeRows.length, same: outcomeRows.filter((r) => r.same).length, different: outcomeRows.filter((r) => !r.same) };
  summary.result = { committed: resultView(rA), k1: resultView(rB), same: isDeepStrictEqual({ ...resultView(rA), consoleWarnings: null }, { ...resultView(rB), consoleWarnings: null }) };
  // Evidence of verdict, fact and observation records, keyed by id (or case), volatile fields dropped.
  const evidence = (log) => {
    const map = new Map();
    for (const r of log) {
      if (r.name !== "verdict" && r.name !== "observation") continue;
      const id = r.id ?? (r.case ? `case:${r.case}` : null);
      if (!id || id === "k1:keyboard-audit") continue;
      const key = map.has(id) ? `${id}#${[...map.keys()].filter((k) => k.startsWith(id)).length}` : id;
      map.set(key, strip(r));
    }
    return map;
  };
  const eA = evidence(A), eB = evidence(B);
  const evidenceDiffs = [];
  for (const id of new Set([...eA.keys(), ...eB.keys()])) {
    const paths = diffPaths(eA.get(id), eB.get(id));
    if (paths.length) evidenceDiffs.push({ id, paths });
  }
  summary.evidence = { records: eA.size, recordsK1: eB.size, identical: eA.size - evidenceDiffs.length, withDifferences: evidenceDiffs.length };
  // Sequence footprint: the before-runner prelude numbers every keydown it records (native-prelude.js:460-461), so
  // stray keydowns raise the instrument sequence of later records. Per record (aligned by name and id): the largest
  // sequence number it carries in the committed log and in the K-1 log.
  const maxSeq = (value) => {
    let best = -1;
    const walk = (v, k) => {
      if (Array.isArray(v)) v.forEach((x) => walk(x));
      else if (v && typeof v === "object") for (const [kk, vv] of Object.entries(v)) walk(vv, kk);
      else if (k === "seq" && typeof v === "number") best = Math.max(best, v);
      else if (typeof v === "string") { const m = /^(\d+):(set|remove|get):/.exec(v); if (m) best = Math.max(best, Number(m[1])); }
    };
    walk(value);
    return best;
  };
  const label = (r) => `${r.name}:${r.id ?? r.case ?? ""}`;
  const seqRows = [];
  let cursor = 0;
  for (const r of A) {
    while (cursor < B.length && label(B[cursor]) !== label(r)) cursor += 1;
    if (cursor >= B.length) break;
    const sa = maxSeq(r), sb = maxSeq(B[cursor]);
    if (sa >= 0 || sb >= 0) seqRows.push({ record: label(r), committed: sa, k1: sb, delta: sa - sb });
    cursor += 1;
  }
  summary.sequenceFootprint = { recordsWithSequence: seqRows.length, maxDelta: seqRows.length ? Math.max(...seqRows.map((x) => x.delta)) : null, recordsDifferingByMoreThan50: seqRows.filter((x) => Math.abs(x.delta) > 50) };
  console.log(JSON.stringify({ name: "comparison", ...summary }));
  for (const row of outcomeRows) console.log(JSON.stringify({ name: "outcome", committed: committedPath.split("/").at(-1), ...row }));
  for (const d of evidenceDiffs) console.log(JSON.stringify({ name: "evidence-difference", committed: committedPath.split("/").at(-1), ...d }));
}
