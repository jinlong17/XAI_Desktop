/**
 * Read-only analysis for the oracle disputes OE-1 and OE-2 (CP-APPEARANCE-01, control-plane batch 41).
 * Executes no product or oracle code; reads committed files and logs only.
 *
 * Usage (from the repository root): node docs/reviews/web-appearance-recovery-oracle-erratum/analyze-oe.mjs <suffix>
 * Writes analysis-<suffix>.log beside this file (exclusive create; refuses to overwrite).
 *
 * Part A — per-case comparison of the four authoritative continuity-export runs:
 *   frozen@5cd63ff     ../web-appearance-recovery-sol/continuity-export-before3-5cd63ff.log (frozen E2 log, batch 37)
 *   corrected@5cd63ff  corrected-oe2-5cd63ff.log
 *   frozen@24073b5     frozen-oe2-24073b5.log
 *   corrected@24073b5  corrected-oe2-24073b5.log
 *   It checks that the 26 case titles are identical and in the same order in all four, that the 24 cases outside OE-1
 *   and OE-2 have the same outcome and the same first failure line in the frozen and corrected files at each SHA, and
 *   records cases 006 and 007 in all four runs. Exit 1 if a check fails.
 *
 * Part B — construction scan (report only) over every Appearance Sol oracle file and the parent host oracle:
 *   P1  a native write on one of the seven Appearance keys after a mount in the same test, with no StorageEvent;
 *       each candidate is listed with the operations that follow it in its test (StorageEvent, Reload, remount,
 *       Reset, choices, Retry) and every later expectation, for manual classification. Native writes on other keys
 *       after a mount are listed separately for completeness.
 *   P2  every background-choice site — a direct `BG` choice, an all-fields loop (FIELDS or PANE_CASES), or a generic
 *       field choice in a test parameterized over a set that contains the background field — followed, in the same
 *       test, by an assertion that names the accent (or, after an all-fields loop, a per-field assertion); each
 *       candidate is listed with those assertions for manual classification. Sites with no such assertion are
 *       listed too.
 *   Tests are the `it(`/`it.each(` blocks (each closes with `});` at its own indentation, the only form the files use).
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const here = fileURLToPath(new URL("./", import.meta.url));
const [suffix, ...extra] = process.argv.slice(2);
if (!suffix || extra.length || !/^[A-Za-z0-9._-]+$/.test(suffix)) throw Error("Usage: node analyze-oe.mjs <suffix>");
const out = join(here, `analysis-${suffix}.log`);
if (existsSync(out)) throw Error(`Evidence exists; use a new suffix: ${out}`);
const sha256 = data => createHash("sha256").update(data).digest("hex");
const lines = [];
const say = line => lines.push(line);
let failures = 0;
const verify = (ok, label) => { say(`${ok ? "PASS" : "FAIL"} ${label}`); if (!ok) failures += 1; };

// ---------------------------------------------------------------------------------------------------------------
// Part A
// ---------------------------------------------------------------------------------------------------------------
const RUNS = [
  ["frozen@5cd63ff", "docs/reviews/web-appearance-recovery-sol/continuity-export-before3-5cd63ff.log"],
  ["corrected@5cd63ff", "docs/reviews/web-appearance-recovery-oracle-erratum/corrected-oe2-5cd63ff.log"],
  ["frozen@24073b5", "docs/reviews/web-appearance-recovery-oracle-erratum/frozen-oe2-24073b5.log"],
  ["corrected@24073b5", "docs/reviews/web-appearance-recovery-oracle-erratum/corrected-oe2-24073b5.log"],
];
function parseRun(rel) {
  const text = readFileSync(join(root, rel), "utf8");
  const summary = text.slice(text.indexOf("---- runner summary ----"));
  const cases = [];
  for (const line of summary.split("\n")) {
    const head = /^case (\d{3}) (PASSED|FAILED)( PRECONDITION)? \| (.*)$/.exec(line);
    if (head) { cases.push({ index: head[1], status: head[2], precondition: Boolean(head[3]), name: head[4], first: "" }); continue; }
    const first = /^ {4}first: (.*)$/.exec(line);
    if (first && cases.length) cases[cases.length - 1].first = first[1];
  }
  const header = Object.fromEntries(text.split("\n").slice(0, 40).filter(line => /^[a-z_]+=/.test(line)).map(line => [line.slice(0, line.indexOf("=")), line.slice(line.indexOf("=") + 1)]));
  return { rel, sha: sha256(readFileSync(join(root, rel))), cases, resolved: header.resolved_commit ?? "?", exit: header.exit ?? "?" };
}
const runs = RUNS.map(([label, rel]) => ({ label, ...parseRun(rel) }));
say("== Part A: per-case comparison of the four continuity-export runs");
for (const run of runs) say(`run ${run.label}: ${run.rel} sha256=${run.sha} resolved_commit=${run.resolved} exit=${run.exit} cases=${run.cases.length} passed=${run.cases.filter(c => c.status === "PASSED").length} failed=${run.cases.filter(c => c.status === "FAILED").length} precondition=${run.cases.filter(c => c.precondition).length}`);
const [frozenBefore, correctedBefore, frozenFixed, correctedFixed] = runs;
verify(runs.every(run => run.cases.length === 26), "every run reports 26 cases");
verify(runs.every(run => JSON.stringify(run.cases.map(c => c.name)) === JSON.stringify(frozenBefore.cases.map(c => c.name))), "the 26 case titles are identical and in the same order in all four runs");
verify(runs.every(run => run.cases.every(c => !c.precondition)), "zero PRECONDITION failures in all four runs");
const DISPUTED = new Set(["006", "007"]);
const others = frozenBefore.cases.filter(c => !DISPUTED.has(c.index)).map(c => c.index);
const at = (run, index) => run.cases.find(c => c.index === index);
const sameOutcome = (left, right, index) => at(left, index).status === at(right, index).status && at(left, index).first === at(right, index).first;
verify(others.length === 24 && others.every(index => sameOutcome(frozenBefore, correctedBefore, index)), "5cd63ff: the 24 non-disputed cases have the same outcome and first failure line in the frozen and corrected files");
verify(others.every(index => sameOutcome(frozenFixed, correctedFixed, index)), "24073b5: the 24 non-disputed cases have the same outcome and first failure line in the frozen and corrected files");
verify(others.every(index => at(correctedFixed, index).status === "PASSED"), "24073b5: the 24 non-disputed cases all PASS");
verify(at(correctedBefore, "006").status === "PASSED" && at(correctedFixed, "006").status === "PASSED", "OE-1: corrected case 006 PASSES at both SHAs (invariant)");
verify(at(frozenBefore, "006").status === "PASSED" && at(frozenFixed, "006").status === "FAILED", "OE-1: frozen case 006 PASSED at 5cd63ff and FAILS at 24073b5");
verify(at(correctedBefore, "007").status === "FAILED" && at(correctedBefore, "007").first === at(frozenBefore, "007").first && at(frozenBefore, "007").first.includes("§7.3: beforeunload warns while a draft exists"), "OE-2: corrected case 007 still FAILS at 5cd63ff on the same early business assertion (§7.3 beforeunload)");
verify(at(correctedFixed, "007").status === "PASSED" && at(frozenFixed, "007").status === "FAILED", "OE-2: corrected case 007 PASSES at 24073b5; frozen case 007 FAILS there");
say("");
say("case | frozen@5cd63ff | corrected@5cd63ff | frozen@24073b5 | corrected@24073b5 | title");
for (const c of frozenBefore.cases) say(`${c.index} | ${runs.map(run => at(run, c.index).status).join(" | ")} | ${c.name}`);
say("");
say("first failure lines (as printed by each run):");
for (const c of frozenBefore.cases) for (const run of runs) {
  const entry = at(run, c.index);
  if (entry.status === "FAILED") say(`${c.index} ${run.label}: ${entry.first}`);
}

// ---------------------------------------------------------------------------------------------------------------
// Part B
// ---------------------------------------------------------------------------------------------------------------
const SCANNED = [
  "docs/reviews/web-appearance-recovery-sol/bytes.test.tsx",
  "docs/reviews/web-appearance-recovery-sol/fields.test.tsx",
  "docs/reviews/web-appearance-recovery-sol/reset.test.tsx",
  "docs/reviews/web-appearance-recovery-sol/queues.test.tsx",
  "docs/reviews/web-appearance-recovery-sol/continuity-export.test.tsx",
  "docs/reviews/web-appearance-recovery-sol/host.test.tsx",
  "docs/reviews/web-appearance-recovery-sol/retry-all.test.tsx",
  "docs/reviews/web-appearance-recovery-sol/fixture.tsx",
  "docs/reviews/web-appearance-recovery-independent/host.test.tsx",
];
const FIELD_REF = "(?:LANG|THEME|DENSITY|FONT|ACCENT|RAIL|BG|X|field|other|entry\\.field)";
const KEY_LITERAL = "xai_(?:pref_(?:lang|theme|density|font_scale)|accent_hue|rail_pos|bg_tone)";
const P = {
  mount: /\b(?:mountApp|standalone|mountStandalone)\s*\(/g,
  nativeWrite: new RegExp(`\\b(?:seed|seedValue)\\s*\\(\\s*${FIELD_REF}\\b|\\bseed\\s*\\(\\s*${FIELD_REF}\\.key\\b|\\bseed(?:Key)?\\s*\\(\\s*["'\`]${KEY_LITERAL}|\\bnative(?:Set|Remove)\\.call\\(\\s*localStorage\\s*,\\s*(?:${FIELD_REF}\\.key|["'\`]${KEY_LITERAL})|\\bseed(?:All|Over)\\s*\\(`, "g"),
  otherWrite: /\bnative(?:Set|Remove)\.call\(|\bseedKey\s*\(|\blocalStorage\.(?:setItem|removeItem)\(|\bnativeSetUnrelated\s*\(/g,
  observed: /\bexternal\s*\(|new StorageEvent\(/g,
  reload: /\breloadOf\s*\(/g,
  reset: /\bclickReset\s*\(|\bresetButton\s*\(/g,
  retry: /\bretryOf\s*\(|\bretryAll\s*\(|\bRA\s*\(/g,
  choice: /\b(?:choose|pick|chooseTopbar|failPane|failPaneEdit|failTopbar|failTopbarChoice|setSlider|slide)\s*\(/g,
};
const BG_DIRECT = /\b(?:choose|pick|failPane)\s*\(\s*BG\b|\bfailPaneEdit\s*\(\s*\{\s*field:\s*BG\b/;
const ALL_FIELDS_LOOP = /for \(const (?:field|entry) of (?:FIELDS|PANE_CASES)\)[^\n]*\b(?:pick|choose|failPane|failPaneEdit)\s*\(/;
const GENERIC_CHOICE = /\b(?:choose|pick|failPane|failPaneEdit)\s*\(\s*(?:field|entry(?:\.field)?)\b/;
const ASSERTION = /\b(?:expect|exportUnderDenial|expectSingleDownload)\s*\(/;
const NAMES_ACCENT = /ACCENT|accentHue|\baccent\b|\bhue\b/;
const FIELD_LOOP_ASSERTION = /for \(const (?:field|\[index, field\]) of FIELDS(?:\.entries\(\))?\)[^\n]*\bexpect\s*\(|^\s*expect\([^\n]*\bfield\b/;
const INCLUDES_BACKGROUND = /\bFIELDS\b|\bPANE_CASES\b|bgTone|\bBG\b/;

function blocks(text) {
  const all = text.split("\n");
  const found = [];
  for (let i = 0; i < all.length; i += 1) {
    const start = /^(\s*)it(?:\.each\b[^\n]*)?\s*\(/.exec(all[i]);
    if (!start || /^\s*\/\//.test(all[i])) continue;
    const indent = start[1];
    let end = i;
    for (let j = i + 1; j < all.length; j += 1) if (all[j] === `${indent}});`) { end = j; break; }
    // Parameter source: the it/it.each head up to its callback, any `it.each(<identifier>)` definition, and the
    // nearest enclosing describe/describe.each/for…describe head.
    let head = all.slice(i, Math.min(end + 1, i + 8)).join("\n");
    head = head.slice(0, head.indexOf("=> {") >= 0 ? head.indexOf("=> {") : head.length);
    const named = /^\s*it\.each\(\s*([A-Za-z_$][\w$]*)\s*\)/.exec(all[i]);
    if (named) {
      const definition = all.findIndex(line => new RegExp(`^const ${named[1]}\\b`).test(line));
      if (definition >= 0) head += "\n" + all.slice(definition, all.findIndex((line, index) => index > definition && /^\];/.test(line)) + 1).join("\n");
    }
    for (let k = i - 1; k >= 0 && indent.length > 0; k -= 1) {
      const enclosing = /^(\s*)(?:describe(?:\.each)?\b|for \([^)]*\) describe\b)/.exec(all[k]);
      if (enclosing && enclosing[1].length < indent.length) { head += "\n" + all[k]; break; }
    }
    found.push({ start: i + 1, end: end + 1, lines: all.slice(i, end + 1), head });
  }
  return found;
}
function events(block) {
  const list = [];
  block.lines.forEach((line, offset) => {
    if (/^\s*\/\//.test(line)) return;
    for (const [kind, pattern] of Object.entries(P)) {
      pattern.lastIndex = 0;
      for (const match of line.matchAll(pattern)) list.push({ kind, line: block.start + offset, column: match.index, text: line.trim() });
    }
  });
  return list.sort((a, b) => a.line - b.line || a.column - b.column);
}
say("");
say("== Part B: construction scan (report only)");
let p1 = 0;
let p2 = 0;
let bgSitesWithoutAccentAssertion = 0;
const otherKeyWrites = [];
const quietSites = [];
const fixtureHelpers = [];
for (const rel of SCANNED) {
  const text = readFileSync(join(root, rel), "utf8");
  say(`file ${rel} sha256=${sha256(text)} tests=${blocks(text).length}`);
  if (rel.endsWith("fixture.tsx")) {
    // The fixture defines helpers, not tests: record where its one mounting helper seeds (runRuling5).
    const body = text.slice(text.indexOf("export async function runRuling5"), text.indexOf("// Per-test setup and teardown"));
    const seedAt = body.search(/\bseed\(field, baseline\)/);
    const mountAt = body.search(/await mountApp\(\)/);
    fixtureHelpers.push(`fixture runRuling5 (the only fixture helper that mounts): seeds before mountApp = ${seedAt >= 0 && mountAt > seedAt}; it makes no later native write and no background choice`);
    continue;
  }
  for (const block of blocks(text)) {
    const list = events(block);
    const firstMount = list.find(event => event.kind === "mount");
    const title = block.lines[0].trim().slice(0, 140);
    const lineAt = n => block.lines[n - block.start];
    // P1
    const appearanceWriteLines = new Set(list.filter(event => event.kind === "nativeWrite").map(event => event.line));
    for (const write of list.filter(event => event.kind === "otherWrite" && firstMount && event.line > firstMount.line && !appearanceWriteLines.has(event.line))) {
      otherKeyWrites.push(`${rel}:${write.line} (after mount :${firstMount.line}) ${write.text.slice(0, 180)}`);
    }
    for (const write of list.filter(event => event.kind === "nativeWrite" && firstMount && event.line > firstMount.line)) {
      p1 += 1;
      say(`P1 candidate ${rel}:${write.line} (test ${rel}:${block.start}-${block.end}) after mount at :${firstMount.line}`);
      say(`   test: ${title}`);
      say(`   write: ${write.text}`);
      for (const next of list.filter(event => event.line > write.line && ["observed", "reload", "mount", "reset", "choice", "retry"].includes(event.kind))) say(`   then ${next.kind} :${next.line} ${next.text.slice(0, 200)}`);
      for (let n = write.line + 1; n <= block.end; n += 1) if (/\b(?:expect|pre)\s*\(/.test(lineAt(n))) say(`   assert :${n} ${lineAt(n).trim().slice(0, 220)}`);
    }
    // P2
    const parameterizedWithBackground = INCLUDES_BACKGROUND.test(block.head);
    const sites = [];
    block.lines.forEach((line, offset) => {
      if (/^\s*\/\//.test(line)) return;
      const n = block.start + offset;
      if (BG_DIRECT.test(line)) sites.push({ n, kind: "direct", line });
      else if (ALL_FIELDS_LOOP.test(line)) sites.push({ n, kind: "all-fields loop", line });
      else if (GENERIC_CHOICE.test(line) && parameterizedWithBackground) sites.push({ n, kind: "generic choice in a test parameterized over a set with the background field", line });
    });
    for (const site of sites) {
      const assertions = [];
      for (let n = site.n + 1; n <= block.end; n += 1) {
        const line = lineAt(n);
        if (/^\s*\/\//.test(line) || !ASSERTION.test(line)) continue;
        if (NAMES_ACCENT.test(line) || (site.kind === "all-fields loop" && FIELD_LOOP_ASSERTION.test(line))) assertions.push(`:${n} ${line.trim().slice(0, 220)}`);
      }
      if (assertions.length === 0) {
        bgSitesWithoutAccentAssertion += 1;
        quietSites.push(`${rel}:${site.n} (${site.kind}) ${site.line.trim().slice(0, 160)}`);
        continue;
      }
      p2 += 1;
      say(`P2 candidate ${rel}:${site.n} (test ${rel}:${block.start}-${block.end}) [${site.kind}]`);
      say(`   test: ${title}`);
      say(`   background choice: ${site.line.trim().slice(0, 200)}`);
      for (const assertion of assertions) say(`   accent assertion ${assertion}`);
    }
  }
}
for (const line of fixtureHelpers) say(line);
say("");
say(`native writes on non-Appearance keys after a mount (not P1; listed for completeness): ${otherKeyWrites.length}`);
for (const line of otherKeyWrites) say(`   ${line}`);
say(`background-choice sites with no later accent assertion in their test (not P2): ${bgSitesWithoutAccentAssertion}`);
for (const line of quietSites) say(`   ${line}`);
say("");
say(`P1 candidates=${p1} P2 candidates=${p2} (classification is manual; see review-oe.md)`);
say(`Part A checks failed=${failures}`);
writeFileSync(out, `${lines.join("\n")}\n`, { flag: "wx" });
console.log(`analysis ${suffix}: partA_failed=${failures} p1_candidates=${p1} p2_candidates=${p2} log=${relative(root, out)}`);
if (failures > 0) process.exitCode = 1;
