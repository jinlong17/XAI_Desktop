// Scratch-only: the candidate correct oracle for More Sol boundaries case 002 (not evidence, never committed).
// The only change: the unavailable physical key is computed once, before the getItem spy is installed, so the spy
// never re-enters accountScope.physicalKey() (which itself reads `<account prefix>deleted` through getItem).
import { readFileSync, writeFileSync } from "node:fs";
const [source, target] = process.argv.slice(2);
const text = readFileSync(source, "utf8");
const before = `const base = Storage.prototype.getItem;
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (this: Storage, key) { if (String(key) === physical(unavailable)) throw new Error("unavailable"); return base.call(this, key); });`;
const after = `const base = Storage.prototype.getItem; const unavailableKey = physical(unavailable);
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (this: Storage, key) { if (String(key) === unavailableKey) throw new Error("unavailable"); return base.call(this, key); });`;
if (!text.includes(before)) throw Error("case 002 spy text not found");
writeFileSync(target, text.replace(before, after));
console.log("written", target);
