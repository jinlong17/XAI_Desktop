/**
 * apps/admin/src/audit/hashChain.ts — admin-local append-only audit hash-chain (row #5, P1).
 *
 * ┌─────────────────────────────────────────────────────────────────────────────────────┐
 * │ PORTED, NOT IMPORTED (C2 / ADR-lite #3).                                               │
 * │                                                                                        │
 * │ Precedent: packages/audit-log-integrity (`AuditLogHashChain`: monotonic `seq` +        │
 * │ `previousHash` + canonical-JSON SHA-256 `hash` + `verify()` walking 3 invariants +     │
 * │ an `E3025` integrity error). This module reproduces that ALGORITHM faithfully but does  │
 * │ NOT import it, because that package:                                                    │
 * │   (a) imports `node:crypto` (`createHash`) → not browser-safe as a Vite runtime dep;    │
 * │   (b) is the sync-v1 SERVER account audit (`accountId`, event types push/pull/rekey…)   │
 * │       → importing it couples this admin line to the PAUSED sync line and conflicts with │
 * │       the requirement that admin audit be SEPARATE from user sync audit                 │
 * │       (INTEGRATION_PLAN §3 / manifest gap row; D4-consistent — admin defines no         │
 * │       `account-sync` entity → never syncs);                                             │
 * │   (c) a shared-package coupling could push row #5 off W0.                               │
 * │                                                                                        │
 * │ Instead the digest is INJECTED (`DigestFn`): the chain is environment-agnostic and      │
 * │ synchronously testable. Tests/mock use a PURE DETERMINISTIC digest (no secret, no I/O); │
 * │ the production digest (Web Crypto `crypto.subtle` async / server SHA-256) is deferred    │
 * │ (OQ-E). The chain logic + tests are digest-agnostic.                                    │
 * └─────────────────────────────────────────────────────────────────────────────────────┘
 *
 * APPEND-ONLY BY CONSTRUCTION (R6): the only mutator is `append`. There is NO edit or delete
 * method. `verify()` makes immutability tamper-EVIDENT: any altered/dropped/reordered entry
 * trips a sequence-gap / previousHash-mismatch / hash-mismatch check → AdminAuditIntegrityError.
 *
 * Boundary (design.md, W0): contract-only, browser-side; pure; no I/O, no secret, no
 * `node:crypto`, no `@repo/audit-log-integrity` import.
 *
 * Test strategy: apps/admin/docs/audit-ops-queue/test.md §1
 * (TT-AUDIT-APPEND-ONLY / SEQ-MONOTONIC / VERIFY-OK / VERIFY-TAMPER / DIGEST-INJECTABLE /
 *  NO-PKG-IMPORT).
 */
import type { AdminAuditEvent, AdminAuditEventInput } from "./auditEvent";

/**
 * Injected digest: canonical JSON string → hex string. Pure; deterministic; no I/O, no secret.
 * (Precedent uses `node:crypto` SHA-256; here it is injectable for browser-safety + testability.)
 */
export type DigestFn = (canonicalJson: string) => string;

/**
 * Integrity error thrown by `verify()` on any tamper. `code = "E3025"` mirrors the precedent's
 * integrity error code (packages/audit-log-integrity) so the contract is recognizable.
 */
export class AdminAuditIntegrityError extends Error {
  readonly code = "E3025" as const;
  constructor(message: string) {
    super(message);
    this.name = "AdminAuditIntegrityError";
  }
}

/**
 * Canonical JSON over an event's content fields (stable key order; chain fields excluded from
 * the digest input but `seq`/`previousHash` ARE part of the link so a reorder/gap is detected).
 * The serialization is deterministic: keys are emitted in a fixed order, never `Object.keys`
 * insertion order, so the digest is reproducible across environments.
 */
export function canonicalEventJson(
  event: Pick<
    AdminAuditEvent,
    | "seq"
    | "tsMs"
    | "actor"
    | "action"
    | "target"
    | "ip"
    | "result"
    | "previousHash"
    | "permissionKey"
    | "mutationFamily"
  >,
): string {
  // Fixed-order canonical form (NOT JSON.stringify of the whole object — order-stable).
  return JSON.stringify([
    ["seq", event.seq],
    ["tsMs", event.tsMs],
    ["actor", [event.actor.id, event.actor.role ?? null]],
    ["action", event.action],
    ["target", [event.target.kind, event.target.id]],
    ["ip", event.ip],
    ["result", event.result],
    ["previousHash", event.previousHash],
    ["permissionKey", event.permissionKey ?? null],
    ["mutationFamily", event.mutationFamily ?? null],
  ]);
}

/**
 * A pure, deterministic, dependency-free hex digest (FNV-1a-style 64-bit, hex-encoded).
 *
 * This is the DEFAULT test/mock digest. It is NOT cryptographically strong (the production
 * digest is a real SHA-256 via Web Crypto / server — deferred, OQ-E), but it is:
 *   - PURE + DETERMINISTIC (same input → same hex; no I/O, no `Date`, no randomness);
 *   - dependency-free (no `node:crypto`, keeps the browser bundle clean);
 *   - tamper-sensitive enough for the contract tests (different content → different hex).
 * Output is lowercase hex (16 chars) — carries NO secret and matches no secret-key pattern.
 */
export function deterministicDigest(canonicalJson: string): string {
  // Two interleaved FNV-1a accumulators → 64-bit hex (widen tamper sensitivity).
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < canonicalJson.length; i++) {
    const c = canonicalJson.charCodeAt(i);
    h1 ^= c;
    h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 = (h2 + c) >>> 0;
    h2 = Math.imul(h2, 0x85ebca77) >>> 0;
  }
  const hex = (n: number): string => (n >>> 0).toString(16).padStart(8, "0");
  return hex(h1) + hex(h2);
}

/**
 * Admin-local append-only audit chain.
 *
 * Append-only by construction: the only mutator is `append`; `list()` returns COPIES; there
 * is NO edit/delete method (structural immutability). `verify()` walks the chain and throws
 * `AdminAuditIntegrityError` ("E3025") on any tamper.
 */
export class AdminAuditChain {
  /** internal store — private; not exposed for mutation. */
  #entries: AdminAuditEvent[] = [];
  readonly #digest: DigestFn;

  /** @param digest pure canonical-JSON → hex digest (defaults to the deterministic test digest). */
  constructor(digest: DigestFn = deterministicDigest) {
    this.#digest = digest;
  }

  /**
   * Append a new event; computes `seq`, `previousHash`, `hash`. Returns a COPY of the appended
   * event. This is the ONLY mutator on the chain.
   */
  append(input: AdminAuditEventInput): AdminAuditEvent {
    const prev = this.#entries[this.#entries.length - 1];
    const seq = (prev?.seq ?? 0) + 1;
    const previousHash = prev ? prev.hash : null;
    const withChain = {
      seq,
      tsMs: input.tsMs,
      actor: input.actor,
      action: input.action,
      target: input.target,
      ip: input.ip,
      result: input.result,
      previousHash,
      permissionKey: input.permissionKey,
      mutationFamily: input.mutationFamily,
    };
    const hash = this.#digest(canonicalEventJson(withChain));
    const event: AdminAuditEvent = { ...withChain, hash };
    this.#entries.push(event);
    return this.#copy(event);
  }

  /** Read-only snapshot (deep-enough copies so mutating the result cannot change the chain). */
  list(): AdminAuditEvent[] {
    return this.#entries.map((e) => this.#copy(e));
  }

  /** Current chain length (number of appended events). */
  get length(): number {
    return this.#entries.length;
  }

  /**
   * Walk the chain; throw `AdminAuditIntegrityError` ("E3025") on any tamper:
   *   - sequence gap        : `seq` not 1-based strictly +1 monotonic
   *   - previous_hash mismatch : an entry's `previousHash` != the prior entry's `hash`
   *   - hash mismatch       : recomputed digest != stored `hash`
   * Verifies the internal chain by default, or any provided entries snapshot.
   */
  verify(entries: readonly AdminAuditEvent[] = this.#entries): void {
    let prevHash: string | null = null;
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i]!;
      const expectedSeq = i + 1;
      if (e.seq !== expectedSeq) {
        throw new AdminAuditIntegrityError(
          `sequence gap at index ${i}: expected seq ${expectedSeq}, got ${e.seq}`,
        );
      }
      if (e.previousHash !== prevHash) {
        throw new AdminAuditIntegrityError(
          `previous_hash mismatch at seq ${e.seq}: expected ${String(prevHash)}, got ${String(e.previousHash)}`,
        );
      }
      const recomputed = this.#digest(canonicalEventJson(e));
      if (recomputed !== e.hash) {
        throw new AdminAuditIntegrityError(
          `hash mismatch at seq ${e.seq}: content does not match stored hash`,
        );
      }
      prevHash = e.hash;
    }
  }

  /** Defensive copy of an event (nested actor/target copied too). */
  #copy(e: AdminAuditEvent): AdminAuditEvent {
    return {
      ...e,
      actor: { ...e.actor },
      target: { ...e.target },
    };
  }
}
