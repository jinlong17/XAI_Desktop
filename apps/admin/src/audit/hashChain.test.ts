/**
 * audit/hashChain.test.ts — P1 append-only tamper-evident chain (row #5).
 *
 * Covers (test.md §1):
 *   - TT-AUDIT-APPEND-ONLY      : append/list/verify only; no edit/delete; list() copies
 *   - TT-AUDIT-SEQ-MONOTONIC    : seq 1-based +1; genesis previousHash null; links match
 *   - TT-AUDIT-VERIFY-OK        : verify() passes for a chain built via append
 *   - TT-AUDIT-VERIFY-TAMPER    : sequence gap / previousHash mismatch / hash mismatch → E3025
 *   - TT-AUDIT-DIGEST-INJECTABLE: two pure digests differ but both verify; default deterministic
 *   - TT-AUDIT-NO-PKG-IMPORT    : audit/*.ts does NOT import audit-log-integrity / node:crypto
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  AdminAuditChain,
  AdminAuditIntegrityError,
  deterministicDigest,
  canonicalEventJson,
  type DigestFn,
} from "./hashChain";
import type { AdminAuditEvent, AdminAuditEventInput } from "./auditEvent";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function input(n: number): AdminAuditEventInput {
  return {
    tsMs: Date.UTC(2026, 4, 30, 9, n % 60),
    actor: { id: `actor-${n}`, role: "ops" },
    action: `action.${n}`,
    target: { kind: "user", id: `u-${n}` },
    ip: "10.0.0.1",
    result: "ok",
  };
}

function buildN(n: number, digest?: DigestFn): AdminAuditChain {
  const chain = new AdminAuditChain(digest);
  for (let i = 1; i <= n; i++) chain.append(input(i));
  return chain;
}

describe("TT-AUDIT-APPEND-ONLY: structural immutability", () => {
  it("exposes append/list/verify and NO edit/delete method", () => {
    const chain = new AdminAuditChain();
    const surface = new Set<string>();
    // own + prototype method names
    for (const k of Object.getOwnPropertyNames(Object.getPrototypeOf(chain))) {
      surface.add(k);
    }
    expect(surface.has("append")).toBe(true);
    expect(surface.has("list")).toBe(true);
    expect(surface.has("verify")).toBe(true);
    for (const forbidden of [
      "edit",
      "update",
      "delete",
      "remove",
      "splice",
      "set",
      "replace",
      "pop",
      "shift",
    ]) {
      expect(surface.has(forbidden), `chain must not expose "${forbidden}"`).toBe(false);
    }
  });

  it("list() returns copies — mutating the result does not change the chain", () => {
    const chain = buildN(3);
    const snap = chain.list();
    expect(snap).toHaveLength(3);
    snap[0]!.action = "TAMPERED";
    snap[0]!.actor.id = "TAMPERED";
    snap.pop();
    // chain unchanged
    const fresh = chain.list();
    expect(fresh).toHaveLength(3);
    expect(fresh[0]!.action).toBe("action.1");
    expect(fresh[0]!.actor.id).toBe("actor-1");
    expect(() => chain.verify()).not.toThrow();
  });

  it("append returns a copy (mutating the returned event does not corrupt the chain)", () => {
    const chain = new AdminAuditChain();
    const e = chain.append(input(1));
    e.hash = "TAMPERED";
    e.actor.id = "TAMPERED";
    expect(() => chain.verify()).not.toThrow();
    expect(chain.list()[0]!.actor.id).toBe("actor-1");
  });
});

describe("TT-AUDIT-SEQ-MONOTONIC: seq + chain linkage", () => {
  it("seq starts at 1 and increments by 1 per append", () => {
    const chain = buildN(5);
    expect(chain.list().map((e) => e.seq)).toEqual([1, 2, 3, 4, 5]);
    expect(chain.length).toBe(5);
  });

  it("genesis previousHash === null; each subsequent previousHash === prior.hash", () => {
    const entries = buildN(4).list();
    expect(entries[0]!.previousHash).toBeNull();
    for (let i = 1; i < entries.length; i++) {
      expect(entries[i]!.previousHash).toBe(entries[i - 1]!.hash);
    }
  });
});

describe("TT-AUDIT-VERIFY-OK", () => {
  it("verify() passes for a chain built via append over N events", () => {
    expect(() => buildN(8).verify()).not.toThrow();
  });

  it("verify() passes for an empty chain", () => {
    expect(() => new AdminAuditChain().verify()).not.toThrow();
  });
});

describe("TT-AUDIT-VERIFY-TAMPER: every tamper mode trips E3025", () => {
  it("hash mismatch (alter a content field) → AdminAuditIntegrityError(E3025)", () => {
    const chain = buildN(4);
    const entries = chain.list();
    entries[2]!.action = "ALTERED"; // content changed but stored hash unchanged
    let thrown: unknown;
    try {
      chain.verify(entries);
    } catch (e) {
      thrown = e;
    }
    expect(thrown).toBeInstanceOf(AdminAuditIntegrityError);
    expect((thrown as AdminAuditIntegrityError).code).toBe("E3025");
    expect((thrown as Error).message).toMatch(/hash mismatch/);
  });

  it("sequence gap (drop an entry) → E3025 (sequence gap)", () => {
    const chain = buildN(5);
    const entries = chain.list();
    entries.splice(2, 1); // drop seq 3 → seqs become 1,2,4,5
    expect(() => chain.verify(entries)).toThrow(AdminAuditIntegrityError);
    try {
      chain.verify(entries);
    } catch (e) {
      expect((e as AdminAuditIntegrityError).code).toBe("E3025");
      expect((e as Error).message).toMatch(/sequence gap/);
    }
  });

  it("previousHash mismatch (reorder entries) → E3025", () => {
    const chain = buildN(4);
    const entries = chain.list();
    // swap seq 2 and 3 contents' positions but keep their seq numbers → linkage breaks
    const tmp = entries[1]!;
    entries[1] = entries[2]!;
    entries[2] = tmp;
    expect(() => chain.verify(entries)).toThrow(AdminAuditIntegrityError);
    try {
      chain.verify(entries);
    } catch (e) {
      expect((e as AdminAuditIntegrityError).code).toBe("E3025");
      // a reorder trips either the seq check or the previousHash link — both are E3025
      expect((e as Error).message).toMatch(/sequence gap|previous_hash mismatch/);
    }
  });

  it("previousHash tamper (rewrite a link) → E3025 (previous_hash mismatch)", () => {
    const chain = buildN(3);
    const entries = chain.list();
    entries[2]!.previousHash = "deadbeefdeadbeef";
    try {
      chain.verify(entries);
      throw new Error("verify should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(AdminAuditIntegrityError);
      expect((e as Error).message).toMatch(/previous_hash mismatch/);
    }
  });
});

describe("TT-AUDIT-DIGEST-INJECTABLE", () => {
  it("two different pure digests produce different hashes but both verify() green", () => {
    const digestA: DigestFn = (s) => `a-${deterministicDigest(s)}`;
    const digestB: DigestFn = (s) => `b-${deterministicDigest(s)}`;
    const chainA = buildN(3, digestA);
    const chainB = buildN(3, digestB);
    expect(chainA.list()[0]!.hash).not.toBe(chainB.list()[0]!.hash);
    expect(() => chainA.verify()).not.toThrow();
    expect(() => chainB.verify()).not.toThrow();
  });

  it("default digest is pure + deterministic (same input → same hex, no I/O)", () => {
    const json = canonicalEventJson({
      seq: 1,
      tsMs: 1,
      actor: { id: "a" },
      action: "x",
      target: { kind: "k", id: "i" },
      ip: "—",
      result: "ok",
      previousHash: null,
    } as AdminAuditEvent);
    expect(deterministicDigest(json)).toBe(deterministicDigest(json));
    // output is lowercase hex, fixed-length, no secret-shaped prefix
    expect(deterministicDigest(json)).toMatch(/^[0-9a-f]{16}$/);
  });

  it("different content yields different digest (tamper-sensitive)", () => {
    expect(deterministicDigest("aaa")).not.toBe(deterministicDigest("aab"));
  });
});

describe("TT-AUDIT-NO-PKG-IMPORT: ported, not imported (W0 + D4 + browser-safe)", () => {
  function auditSourceFiles(): string[] {
    return readdirSync(__dirname)
      .filter((f) => /\.ts$/.test(f) && !f.includes(".test."))
      .map((f) => join(__dirname, f));
  }

  it("no audit/*.ts imports @repo/audit-log-integrity, audit-log-integrity, or node:crypto", () => {
    for (const file of auditSourceFiles()) {
      const content = readFileSync(file, "utf-8");
      // import/require of the package or node:crypto (string-literal forms)
      const FORBIDDEN: RegExp[] = [
        /from\s+["']@repo\/audit-log-integrity["']/,
        /from\s+["']audit-log-integrity["']/,
        /require\(\s*["']@?(?:repo\/)?audit-log-integrity["']\s*\)/,
        /from\s+["']node:crypto["']/,
        /require\(\s*["']node:crypto["']\s*\)/,
        /from\s+["']crypto["']/,
      ];
      for (const re of FORBIDDEN) {
        expect(
          re.test(content),
          `${file.split("/").pop()} must NOT import a forbidden module (${re}) — pattern is PORTED, not imported`,
        ).toBe(false);
      }
    }
  });

  it("hashChain.ts cites the audit-log-integrity precedent (legible reuse)", () => {
    const content = readFileSync(join(__dirname, "hashChain.ts"), "utf-8");
    expect(content).toMatch(/audit-log-integrity/);
    expect(content.toUpperCase()).toMatch(/PORTED, NOT IMPORTED/);
  });
});
