/**
 * audit/auditEvent.test.ts — P1 audit-event contract + one-way projection (row #5).
 *
 * Covers (test.md §1):
 *   - TT-AUDIT-EVENT-SHAPE       : AdminAuditEvent carries the canonical machine-first fields
 *   - TT-AUDIT-PROJECTION        : eventToAuditRow → slice #1 AuditRow (one-way; no rowToEvent)
 *   - TT-AUDIT-NO-SECRET-EVENT   : a constructed event over the AUDIT fixture carries no secret
 */
import { describe, it, expect } from "vitest";
import {
  type AdminAuditEvent,
  type AdminAuditEventInput,
  eventToAuditRow,
  deriveAuditType,
  parseAuditTime,
  formatAuditTime,
} from "./auditEvent";
import { AdminAuditChain } from "./hashChain";
import { AUDIT } from "../fixtures";
import type { AuditRow } from "../adapters/types";
import * as auditEventModule from "./auditEvent";

const baseInput: AdminAuditEventInput = {
  tsMs: Date.UTC(2026, 4, 30, 9, 12),
  actor: { id: "Jinlong", role: "super" },
  action: "users.ban",
  target: { kind: "user", id: "spam_bot_91" },
  ip: "103.21.7.5",
  result: "ok",
  permissionKey: "admin.users.ban",
  mutationFamily: "banUser",
};

function build(input: AdminAuditEventInput): AdminAuditEvent {
  const chain = new AdminAuditChain();
  return chain.append(input);
}

describe("TT-AUDIT-EVENT-SHAPE: canonical machine-first event", () => {
  it("carries seq/tsMs/actor/action/target/ip/result/previousHash/hash", () => {
    const e = build(baseInput);
    expect(typeof e.seq).toBe("number");
    expect(typeof e.tsMs).toBe("number");
    expect(typeof e.action).toBe("string");
    expect(typeof e.ip).toBe("string");
    expect(["ok", "denied", "error"]).toContain(e.result);
    // genesis: previousHash null; hash present
    expect(e.previousHash).toBeNull();
    expect(typeof e.hash).toBe("string");
    expect(e.hash.length).toBeGreaterThan(0);
  });

  it("actor + target are STRUCTURED (machine-first), not display strings", () => {
    const e = build(baseInput);
    expect(e.actor).toEqual({ id: "Jinlong", role: "super" });
    expect(e.target).toEqual({ kind: "user", id: "spam_bot_91" });
    // not a flat display string
    expect(typeof e.actor).toBe("object");
    expect(typeof e.target).toBe("object");
  });

  it("optional permissionKey/mutationFamily set for mutation-sourced events", () => {
    const e = build(baseInput);
    expect(e.permissionKey).toBe("admin.users.ban");
    expect(e.mutationFamily).toBe("banUser");
  });

  it("result ∈ ok|denied|error only", () => {
    for (const result of ["ok", "denied", "error"] as const) {
      const e = build({ ...baseInput, result });
      expect(e.result).toBe(result);
    }
  });
});

describe("TT-AUDIT-PROJECTION: eventToAuditRow → slice #1 AuditRow (one-way)", () => {
  it("produces all 7 AuditRow fields", () => {
    const e = build(baseInput);
    const row: AuditRow = eventToAuditRow(e);
    expect(Object.keys(row).sort()).toEqual(
      ["action", "ip", "object", "ok", "time", "type", "who"].sort(),
    );
  });

  it("maps who←actor, object←target, ok←result==='ok', type derived", () => {
    const e = build(baseInput);
    const row = eventToAuditRow(e);
    expect(row.who).toBe("Jinlong (super)");
    expect(row.object).toBe("user:spam_bot_91");
    expect(row.ok).toBe(true);
    expect(row.action).toBe("users.ban");
    expect(row.ip).toBe("103.21.7.5");
    expect(row.type).toBe("danger"); // banUser is a destructive family
  });

  it("ok is false when result !== 'ok'", () => {
    expect(eventToAuditRow(build({ ...baseInput, result: "denied" })).ok).toBe(false);
    expect(eventToAuditRow(build({ ...baseInput, result: "error" })).ok).toBe(false);
  });

  it("type derivation: destructive families → danger, config families → config", () => {
    const ban = build({ ...baseInput, mutationFamily: "banUser" });
    const rollout = build({
      ...baseInput,
      mutationFamily: "setFeatureRollout",
      permissionKey: "admin.features.rollout",
    });
    expect(deriveAuditType(ban)).toBe("danger");
    expect(deriveAuditType(rollout)).toBe("config");
  });

  it("type derivation for non-mutation events: auth/billing/feature kinds", () => {
    const mk = (kind: string): AdminAuditEvent =>
      build({
        tsMs: baseInput.tsMs,
        actor: { id: "system" },
        action: "x",
        target: { kind, id: "y" },
        ip: "—",
        result: "ok",
      });
    expect(deriveAuditType(mk("session"))).toBe("auth");
    expect(deriveAuditType(mk("invoice"))).toBe("billing");
    expect(deriveAuditType(mk("feature"))).toBe("create");
    expect(deriveAuditType(mk("misc"))).toBe("config");
  });

  it("projection is ONE-WAY: there is no rowToEvent export (no fork/reverse)", () => {
    // The event is the source of truth; AuditRow is a lossy display view. Asserting the
    // absence of a reverse mapper guards A2/ADR-lite #1 from regressing into a two-way fork.
    expect("rowToEvent" in auditEventModule).toBe(false);
    expect(
      (auditEventModule as Record<string, unknown>)["rowToEvent"],
    ).toBeUndefined();
  });

  it("actor display omits role when absent", () => {
    const e = build({ ...baseInput, actor: { id: "风控系统" } });
    expect(eventToAuditRow(e).who).toBe("风控系统");
  });
});

describe("time parse/format (R-3: pure + deterministic, round-trips)", () => {
  it("parseAuditTime ∘ formatAuditTime round-trips the AUDIT fixture (minute granularity)", () => {
    for (const row of AUDIT) {
      const ms = parseAuditTime(row.time);
      expect(formatAuditTime(ms)).toBe(row.time);
    }
  });

  it("parseAuditTime is deterministic (same input → same ms)", () => {
    expect(parseAuditTime("2026-05-30 09:12")).toBe(parseAuditTime("2026-05-30 09:12"));
    expect(parseAuditTime("2026-05-30 09:12")).toBe(Date.UTC(2026, 4, 30, 9, 12));
  });

  it("parseAuditTime returns 0 on a malformed string (defensive)", () => {
    expect(parseAuditTime("not-a-time")).toBe(0);
  });
});

describe("TT-AUDIT-NO-SECRET-EVENT: events over the AUDIT fixture carry no secret", () => {
  // Defense-in-depth alongside the whole-src TT-NO-SECRET-SRC guard.
  const SECRET_SHAPES: RegExp[] = [
    /sk_test_[A-Za-z0-9]/,
    /sk_live_[A-Za-z0-9]/,
    /sk-[A-Za-z0-9]{8,}/,
    /sk-ant-[A-Za-z0-9-]{6,}/,
    /AIza[A-Za-z0-9_-]{6,}/,
    /SUPABASE_SERVICE_ROLE_KEY/,
    /service_role/,
    /[A-Za-z-]{2,}•{3,}/,
  ];

  it("a constructed event per AUDIT row serializes to a secret-free string", () => {
    const chain = new AdminAuditChain();
    for (const row of AUDIT) {
      const e = chain.append({
        tsMs: parseAuditTime(row.time),
        actor: { id: row.who },
        action: row.action,
        target: { kind: "object", id: row.object },
        ip: row.ip,
        result: row.ok ? "ok" : "error",
      });
      const serialized = JSON.stringify(e);
      for (const shape of SECRET_SHAPES) {
        expect(shape.test(serialized), `secret shape ${shape} matched in: ${serialized}`).toBe(false);
      }
    }
  });
});
