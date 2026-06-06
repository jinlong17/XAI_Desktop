/**
 * audit/auditStore.test.ts — P4 audit read side: fixture-seeded chain projection + verify.
 *
 * Covers (test.md §1, AC-9):
 *   - TT-AUDIT-READ-PROJECTION : auditChainReadModel.query() projects the chain to AuditRow[]
 *                                (newest-first, AuditFilter-filtered, bound to slice #1 AuditRow)
 *   - TT-AUDIT-READ-VERIFY     : verify() passes for the seeded chain; a tampered chain throws
 */
import { describe, it, expect } from "vitest";
import {
  buildSeededAuditChain,
  auditChainReadModel,
  adminAuditChain,
} from "./auditStore";
import { AdminAuditIntegrityError } from "./hashChain";
import { AUDIT } from "../fixtures";

describe("TT-AUDIT-READ-PROJECTION: chain → AuditRow[] (newest-first, filterable)", () => {
  it("projects all 12 seeded fixture rows", () => {
    const rows = auditChainReadModel.query();
    expect(rows).toHaveLength(AUDIT.length); // 12
  });

  it("returns rows bound to the slice #1 AuditRow shape (no fork)", () => {
    const rows = auditChainReadModel.query();
    for (const r of rows) {
      expect(Object.keys(r).sort()).toEqual(
        ["action", "ip", "object", "ok", "time", "type", "who"].sort(),
      );
    }
  });

  it("is NEWEST-FIRST (the most recent fixture time comes first)", () => {
    const rows = auditChainReadModel.query();
    // fixture is authored newest-first; projection preserves newest-first
    expect(rows[0]!.time).toBe(AUDIT[0]!.time);
    expect(rows[rows.length - 1]!.time).toBe(AUDIT[AUDIT.length - 1]!.time);
    // times are non-increasing
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i - 1]!.time >= rows[i]!.time).toBe(true);
    }
  });

  it("preserves each fixture row's display type through the seed→project round-trip", () => {
    const rows = auditChainReadModel.query();
    // every original fixture type is represented (config/auth/danger/billing/create)
    const projectedTypes = new Set(rows.map((r) => r.type));
    const fixtureTypes = new Set(AUDIT.map((a) => a.type));
    for (const t of fixtureTypes) {
      expect(projectedTypes.has(t), `type ${t} lost in projection`).toBe(true);
    }
  });

  it("filters by type over the projection", () => {
    const danger = auditChainReadModel.query({ type: "danger" });
    expect(danger.length).toBeGreaterThan(0);
    expect(danger.every((a) => a.type === "danger")).toBe(true);
  });

  it("filters by text over who/action/object", () => {
    const txt = auditChainReadModel.query({ text: "封禁" }); // a fixture action substring
    expect(txt.length).toBeGreaterThan(0);
    expect(txt.every((a) => a.action.includes("封禁"))).toBe(true);
  });

  it("filters by range (day-of-month window, mirrors slice #1 semantics)", () => {
    const all = auditChainReadModel.query();
    const d30 = auditChainReadModel.query({ range: "30d" });
    expect(d30.length).toBeGreaterThan(0);
    expect(d30.length).toBeLessThanOrEqual(all.length);
  });
});

describe("TT-AUDIT-READ-VERIFY: integrity-verifiable read model", () => {
  it("verify() passes for the canonical seeded chain", () => {
    expect(() => auditChainReadModel.verify()).not.toThrow();
    expect(() => adminAuditChain.verify()).not.toThrow();
  });

  it("a tampered snapshot of a freshly-built seeded chain throws E3025", () => {
    const chain = buildSeededAuditChain();
    const entries = chain.list();
    entries[3]!.action = "ALTERED";
    expect(() => chain.verify(entries)).toThrow(AdminAuditIntegrityError);
  });

  it("the seeded chain is monotonic (seq 1..N, oldest appended first)", () => {
    const chain = buildSeededAuditChain();
    expect(chain.list().map((e) => e.seq)).toEqual(
      AUDIT.map((_, i) => i + 1),
    );
    // oldest fixture row seeds seq 1
    expect(chain.list()[0]!.action).toBe(AUDIT[AUDIT.length - 1]!.action);
  });
});
