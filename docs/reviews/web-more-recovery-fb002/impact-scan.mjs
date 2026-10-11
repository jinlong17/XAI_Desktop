/**
 * F-B002 impact scan (control-plane batch 31): every spy or mock of Storage getItem / setItem / removeItem on
 * Storage.prototype or localStorage in the oracles, fixtures and harnesses under docs/reviews/**, read from a pinned
 * commit with `git show` (never from the working tree), plus this batch's corrected oracle. Report only.
 *
 * Usage (from the repository root):
 *   node docs/reviews/web-more-recovery-fb002/impact-scan.mjs <base-commit> <output-log>
 *
 * For each hit it records file, line, form (spyOn / assignment / defineProperty / stubGlobal), the spied method and
 * the implementation text: the chained mockImplementation, mockImplementationOnce, mockReturnValue or
 * mockRejectedValue argument; a later `<spy>.mockImplementation` on the same variable; or the assigned right-hand side
 * (a plain identifier is resolved to its definition in the file). It then traces every call inside that body:
 *   - live Storage API calls (localStorage.<m>, window.localStorage.<m>, this.<m>, Storage.prototype.<m>.call/apply);
 *   - captured-original pass-through (<name>.call / <name>.apply), which does not re-enter a prototype spy;
 *   - helpers, resolved to their definitions in the same file or in a relatively imported fixture (at the same commit),
 *     followed up to three levels, recording any physicalKey( / accountScope.physicalKey / createScopedStorage /
 *     scoped-storage call / live Storage call they reach.
 * The `risk` column is automatic and only a pointer: `self` when the body can reach the same Storage method it
 * replaces (a getItem spy reaching physicalKey(), which reads `<account prefix>deleted` through getItem for account
 * keys, or a live getItem call), `cross` when it reaches another Storage method, `none` otherwise. Whether a reached
 * physicalKey() call actually reads Storage depends on the key's ownership (device keys return before reading); the
 * receipt's classification column is manual.
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const [base, output, ...extra] = process.argv.slice(2);
if (!base || !output || extra.length) throw Error("Usage: node impact-scan.mjs <base-commit> <output-log>");
if (existsSync(output)) throw Error(`exists: ${output}`);
const git = args => execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
const commit = git(["rev-parse", "--verify", `${base}^{commit}`]).trim();
const EXT = /\.(ts|tsx|js|mjs|cjs|jsx)$/;
const tracked = new Set(git(["ls-tree", "-r", "--name-only", commit]).split("\n").filter(Boolean));
const files = [...tracked].filter(file => file.startsWith("docs/reviews/") && EXT.test(file)).sort();
const EXTRA = ["docs/reviews/web-more-recovery-fb002/boundaries.corrected.test.tsx"];
// Fixtures that exist only where the importing file is staged at run time, mapped to the committed file staged there:
// - the batch-31 runner stages a byte copy of the frozen More Sol fixture beside the corrected oracle;
// - the batch-30 diagnostics import `./fixture` and name only More Sol fixture exports (inferred, see the receipt).
const ALIASES = new Map([
  ["docs/reviews/web-more-recovery-fb002/fixture", "docs/reviews/web-more-recovery-sol/fixture.tsx"],
  ["docs/reviews/web-features-recovery-final/diagnostics/fixture", "docs/reviews/web-more-recovery-sol/fixture.tsx"],
]);
const METHOD = "(getItem|setItem|removeItem)";
const PATTERNS = [
  ["spyOn", new RegExp(`spyOn\\(\\s*([^,()]{1,80}?)\\s*,\\s*["'\`]${METHOD}["'\`]\\s*\\)`, "g")],
  ["assignment", new RegExp(`([A-Za-z_$][\\w$]*(?:\\.[A-Za-z_$][\\w$]*)*)\\.${METHOD}\\s*=(?![=>])`, "g")],
  ["defineProperty", new RegExp(`defineProperty\\(\\s*([^,()]{1,80}?)\\s*,\\s*["'\`](getItem|setItem|removeItem|localStorage)["'\`]`, "g")],
  ["stubGlobal", /stubGlobal\(\s*["'`](localStorage|sessionStorage)["'`]/g],
];
const BUILTIN = new Set(["function", "if", "for", "while", "switch", "return", "catch", "String", "Number", "Boolean", "Error", "TypeError", "DOMException", "RangeError", "throw", "JSON.parse", "JSON.stringify", "Math.max", "Math.min", "Object.keys", "Object.values", "Object.entries", "Array.isArray", "Promise.resolve", "Promise.reject", "setTimeout", "queueMicrotask", "encodeURIComponent", "decodeURIComponent",
  // labels this scanner itself puts in front of an extracted implementation
  "mockImplementation", "mockImplementationOnce", "mockReturnValue", "mockReturnValueOnce", "mockRejectedValue", "mockRejectedValueOnce", "mockResolvedValue", "mockResolvedValueOnce"]);
const sources = new Map();
const readAt = file => {
  if (!sources.has(file)) sources.set(file, EXTRA.includes(file) ? readFileSync(join(root, file), "utf8") : tracked.has(file) ? git(["show", `${commit}:${file}`]) : null);
  return sources.get(file);
};

// Depth-aware scanning helpers (quotes, template strings and brackets).
function balanced(text, index) {
  const close = { "(": ")", "{": "}", "[": "]" }[text[index]];
  if (!close) return "";
  let depth = 0, quote = "", escaped = false;
  for (let position = index; position < text.length; position += 1) {
    const char = text[position];
    if (quote) { if (escaped) escaped = false; else if (char === "\\") escaped = true; else if (char === quote) quote = ""; continue; }
    if (char === '"' || char === "'" || char === "`") { quote = char; continue; }
    if ("({[".includes(char)) depth += 1;
    if (")}]".includes(char)) { depth -= 1; if (depth === 0) return text.slice(index, position + 1); }
  }
  return text.slice(index, Math.min(text.length, index + 3000));
}
// An expression starting at `index`, ending at a depth-0 `,` `;` newline or closing-bracket underflow.
function expressionAt(text, index) {
  let depth = 0, quote = "", escaped = false;
  const start = index + /^\s*/.exec(text.slice(index))[0].length;
  for (let position = start; position < Math.min(text.length, start + 4000); position += 1) {
    const char = text[position];
    if (quote) { if (escaped) escaped = false; else if (char === "\\") escaped = true; else if (char === quote) quote = ""; continue; }
    if (char === '"' || char === "'" || char === "`") { quote = char; continue; }
    if ("({[".includes(char)) depth += 1;
    else if (")}]".includes(char)) { if (depth === 0) return text.slice(start, position); depth -= 1; }
    else if (depth === 0 && (char === "," || char === ";" || char === "\n")) return text.slice(start, position);
  }
  return text.slice(start, Math.min(text.length, start + 4000));
}
// Top-level-ish definitions in a source text: function declarations and variable bindings.
const definitionCache = new Map();
function definitions(file) {
  if (definitionCache.has(file)) return definitionCache.get(file);
  const text = readAt(file) ?? "";
  const map = new Map();
  for (const match of text.matchAll(/(?:^|[^\w$.])(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)\s*\(/g)) {
    const start = match.index + match[0].indexOf("function");
    const paren = text.indexOf("(", start);
    const brace = text.indexOf("{", paren + balanced(text, paren).length);
    if (!map.has(match[1])) map.set(match[1], text.slice(start, brace) + balanced(text, brace));
  }
  for (const match of text.matchAll(/(?:\b(?:const|let|var)\s+|,\s*)([A-Za-z_$][\w$]*)\s*(?::\s*[^=,;()]+)?=(?![=>])/g)) {
    if (!map.has(match[1])) map.set(match[1], expressionAt(text, match.index + match[0].length));
  }
  // Relative named imports (local name -> [file, exported name]) and `export * from` re-export targets.
  const resolveRelative = specifier => {
    const folder = dirname(file);
    const plain = normalize(join(folder, specifier));
    const candidates = ["", ".ts", ".tsx", ".js", ".mjs", "/index.ts", "/index.tsx"].map(suffix => normalize(join(folder, specifier + suffix)));
    return ALIASES.get(plain) ?? candidates.find(candidate => tracked.has(candidate) || EXTRA.includes(candidate));
  };
  const imports = new Map();
  for (const match of text.matchAll(/(?:import|export)\s*(?:type\s*)?\{([^}]*)\}\s*from\s*["'](\.[^"']+)["']/g)) {
    const target = resolveRelative(match[2]);
    if (!target) continue;
    for (const part of match[1].split(",")) {
      const [exported, local = exported] = part.trim().replace(/^type\s+/, "").split(/\s+as\s+/).map(name => name.trim());
      if (exported && !imports.has(local)) imports.set(local, [target, exported]);
    }
  }
  const reexports = [...text.matchAll(/export\s*\*\s*from\s*["'](\.[^"']+)["']/g)].map(match => resolveRelative(match[1])).filter(Boolean);
  const result = { map, imports, reexports };
  definitionCache.set(file, result);
  return result;
}
// A name's definition in `file`: a local definition, a named import/re-export, or an `export * from` target.
function lookup(file, name, depth = 0) {
  if (depth > 4) return null;
  const { map, imports, reexports } = definitions(file);
  if (map.has(name)) return [file, map.get(name)];
  if (imports.has(name)) { const [target, exported] = imports.get(name); return lookup(target, exported, depth + 1); }
  for (const target of reexports) { const found = lookup(target, name, depth + 1); if (found) return found; }
  return null;
}
const LIVE = /\b(?:(?:window|globalThis|self)\.)?localStorage\s*\.\s*(getItem|setItem|removeItem|clear|key)\s*\(|\bthis\s*\.\s*(getItem|setItem|removeItem)\s*\(|Storage\.prototype\.(getItem|setItem|removeItem)\s*\.\s*(?:call|apply)\b/g;
const REACH = [
  ["physicalKey", /\bphysicalKey\s*\(/],
  ["createScopedStorage", /\bcreateScopedStorage\s*\(/],
  ["scoped-storage", /\bscoped\w*\s*\.\s*(getItem|setItem|removeItem|setItemAccount|removeItemAccount)\s*\(/],
];
// Product helpers verified pure (string builders; packages/plugin-web-storage at the base commit): never touch Storage.
const PURE_PRODUCT = new Set(["accountPrefix", "generationMarkerKey", "generationKey", "prefMutationLockName", "accountLifecycleLockName"]);
// Trace a body: live calls, reached storage helpers, the helper chain that reaches them, and unresolved callees.
function trace(file, body, depth = 0, seen = new Set()) {
  const found = { live: new Set(), reach: new Set(), chain: new Set(), unresolved: new Set() };
  for (const match of body.matchAll(LIVE)) found.live.add(match[0].replace(/\s+/g, "").replace(/\($/, ""));
  for (const [label, pattern] of REACH) if (pattern.test(body)) found.reach.add(label);
  if (depth >= 3) return found;
  const calls = [...new Set([...body.matchAll(/(?<![\w$.])([A-Za-z_$][\w$]*)\s*\(/g)].map(match => match[1]))].filter(name => !BUILTIN.has(name) && !PURE_PRODUCT.has(name));
  for (const name of calls) {
    const resolved = lookup(file, name);
    if (!resolved) { found.unresolved.add(name); continue; }
    const [defFile, definition] = resolved;
    const key = `${defFile}#${name}#${definition.length}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const inner = trace(defFile, definition, depth + 1, seen);
    for (const value of inner.live) { found.live.add(value); found.chain.add(`${name}->${value}`); }
    for (const value of inner.reach) { found.reach.add(value); found.chain.add(`${name}${defFile === file ? "" : `@${defFile.replace(/^docs\/reviews\//, "")}`}->${value}`); }
    for (const value of inner.chain) found.chain.add(`${name}->${value}`);
    for (const value of inner.unresolved) found.unresolved.add(`${name}>${value}`);
  }
  return found;
}
function implementations(text, hitStart, hitEnd) {
  const found = [];
  const chained = /^\s*\.\s*(mockImplementationOnce|mockImplementation|mockReturnValueOnce|mockReturnValue|mockRejectedValueOnce|mockRejectedValue|mockResolvedValueOnce|mockResolvedValue)\s*\(/.exec(text.slice(hitEnd));
  if (chained) found.push(`${chained[1]}${balanced(text, hitEnd + chained[0].length - 1)}`);
  const declaration = /([A-Za-z_$][\w$]*)\s*=\s*(?:vi|jest)\.$/.exec(text.slice(Math.max(0, hitStart - 120), hitStart));
  if (declaration) {
    const later = new RegExp(`\\b${declaration[1]}\\s*\\.\\s*(mockImplementationOnce|mockImplementation|mockReturnValueOnce|mockReturnValue|mockRejectedValueOnce|mockRejectedValue)\\s*\\(`, "g");
    for (const match of text.matchAll(later)) if (match.index >= hitEnd) found.push(`${declaration[1]}.${match[1]}${balanced(text, match.index + match[0].length - 1)}`);
  }
  return found;
}

const rows = [];
for (const file of [...files, ...EXTRA]) {
  const text = readAt(file);
  if (!text) continue;
  for (const [form, pattern] of PATTERNS) {
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
      const line = text.slice(0, match.index).split("\n").length;
      let target, method, impl = [], kind = "implementation";
      if (form === "spyOn") {
        target = match[1].trim(); method = match[2]; impl = implementations(text, match.index, match.index + match[0].length);
        if (!impl.length) kind = "observer";
      } else if (form === "assignment") {
        target = match[1]; method = match[2];
        const rhs = expressionAt(text, match.index + match[0].length).trim();
        impl = [rhs];
        if (/^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*$/.test(rhs)) {
          // A plain reference: a restore of a captured original, or a named replacement function.
          const definition = /^[A-Za-z_$][\w$]*$/.test(rhs) ? lookup(file, rhs)?.[1] : undefined;
          if (/^(?:(?:window|globalThis)\.)?(?:Storage\.prototype|localStorage)\.(getItem|setItem|removeItem)$/.test(rhs) || (definition && /^(?:(?:window|globalThis)\.)?(?:Storage\.prototype|localStorage)\.(getItem|setItem|removeItem)\b/.test(definition.trim()))) {
            kind = "restore"; impl = [`${rhs}${definition ? ` [${rhs} = ${definition.trim().slice(0, 120)}]` : ""}`];
          } else if (definition) { kind = "reference-function"; impl = [`${rhs} = ${definition}`]; }
          else kind = "reference-unresolved";
        }
      } else if (form === "defineProperty") { target = match[1].trim(); method = match[2]; impl = [balanced(text, text.indexOf("(", match.index))]; }
      else { target = "globalThis"; method = match[1]; impl = [balanced(text, text.indexOf("(", match.index))]; }
      if ((form === "spyOn" || form === "assignment") && !/Storage|storage|proto/i.test(target)) continue;
      const body = impl.join(" || ");
      const traced = kind === "observer" || kind === "restore" ? { live: new Set(), reach: new Set(), chain: new Set(), unresolved: new Set() } : trace(file, body);
      // An unresolved callee named like the fixtures' key helpers is treated as a potential physicalKey() reach.
      for (const name of traced.unresolved) if (/(^|>)(physical|physicalKey)$/.test(name)) traced.reach.add(`unresolved:${name}`);
      const passthrough = [...new Set([...body.matchAll(/(?<![\w$.])([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\s*\.\s*(?:call|apply)\s*\(/g)].map(match => match[1]).filter(name => !/^Storage\.prototype\./.test(name)))];
      const reachesSame = (method === "getItem" && (traced.reach.size > 0 || [...traced.live].some(value => /getItem/.test(value))))
        || (method !== "getItem" && [...traced.live].some(value => value.includes(method)));
      const reachesOther = traced.reach.size > 0 || traced.live.size > 0;
      const risk = reachesSame ? "self" : reachesOther ? "cross" : "none";
      rows.push({ file, line, form, target, method, kind, risk, body: body.replace(/\s+/g, " ").replace(/ \| /g, " ¦ ").slice(0, 600), live: [...traced.live], reach: [...traced.reach], chain: [...traced.chain], passthrough, unresolved: [...traced.unresolved] });
    }
  }
}
const scannerHash = createHash("sha256").update(readFileSync(fileURLToPath(import.meta.url))).digest("hex");
const count = predicate => rows.filter(predicate).length;
const lines = [
  "F-B002 impact scan: Storage getItem/setItem/removeItem spies and mocks under docs/reviews/** (report only)",
  `base_commit=${commit}`,
  `scanner_sha256=${scannerHash}`,
  `files_scanned=${files.length} (ts tsx js mjs cjs jsx under docs/reviews at the base commit) + ${EXTRA.length} batch-31 file (working tree): ${EXTRA.join(",")}`,
  `hits=${rows.length} files_with_hits=${new Set(rows.map(row => row.file)).size} ${["observer", "restore", "reference-function", "reference-unresolved", "implementation"].map(kind => `${kind}=${count(row => row.kind === kind)}`).join(" ")}`,
  `by_method ${["getItem", "setItem", "removeItem", "localStorage", "sessionStorage"].map(method => `${method}=${count(row => row.method === method)}`).join(" ")}`,
  `risk self=${count(row => row.risk === "self")} cross=${count(row => row.risk === "cross")} none=${count(row => row.risk === "none")}`,
  `unresolved_callees (all rows, deduplicated): ${[...new Set(rows.flatMap(row => row.unresolved))].sort().join(" ")}`,
  "columns: risk | file:line | form | target.method | kind | live=[...] | reach=[...] | chain=[...] | passthrough=[...] | unresolved=[...] | body",
  "",
  ...["self", "cross", "none"].flatMap(risk => [`## risk=${risk}`, ...rows.filter(row => row.risk === risk).map(row => `${row.risk} | ${row.file}:${row.line} | ${row.form} | ${row.target}.${row.method} | ${row.kind} | live=[${row.live.join(",")}] | reach=[${row.reach.join(",")}] | chain=[${row.chain.join(",")}] | passthrough=[${row.passthrough.join(",")}] | unresolved=[${row.unresolved.join(",")}] | ${row.body || "(pass-through observer)"}`), ""]),
];
writeFileSync(output, lines.join("\n") + "\n", { flag: "wx" });
console.log(`hits=${rows.length} self=${count(row => row.risk === "self")} cross=${count(row => row.risk === "cross")} none=${count(row => row.risk === "none")} -> ${output}`);
