import { describe, expect, it } from "vitest";

import { deriveBlobAadBytes } from "../src/internal/aad";
import { toHex } from "./fixtures";

describe("blob aad derivation", () => {
  it("builds deterministic CBOR bytes with the frozen schema", () => {
    const aadBytes = deriveBlobAadBytes({
      accountId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      entityType: "task",
      entityId: "01hzy5gtv2hyy4n1q1h8v3g1w9",
      proposedRevision: "42",
      keyId: 7,
      deletedFlag: false,
      schemaVersion: 1,
      encryptionDeviceId: "100042",
    });

    expect(toHex(aadBytes)).toBe(
      "a9010102782466343761633130622d353863632d343337322d613536372d30653032623263336434373903647461736b04781a3031687a793567747632687979346e3171316838763367317739056234320607070008010966313030303432",
    );
  });

  it("rejects invalid key id", () => {
    expect(() =>
      deriveBlobAadBytes({
        accountId: "acct",
        entityType: "task",
        entityId: "id",
        proposedRevision: "1",
        keyId: -1,
        deletedFlag: false,
        schemaVersion: 1,
        encryptionDeviceId: "100042",
      }),
    ).toThrow(/keyId/);
  });
});
