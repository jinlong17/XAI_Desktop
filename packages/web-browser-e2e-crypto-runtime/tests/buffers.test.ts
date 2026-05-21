import { describe, expect, it } from "vitest";

import { bytesEqual, concatBytes, copyBytes, zeroizeBuffer } from "../src/internal/buffers";

describe("buffer helpers", () => {
  it("copies and concatenates byte arrays without aliasing inputs", () => {
    const left = new Uint8Array([1, 2]);
    const right = new Uint8Array([3, 4]);
    const copied = copyBytes(left);
    const joined = concatBytes(left, right);

    left[0] = 9;

    expect(copied).toEqual(new Uint8Array([1, 2]));
    expect(joined).toEqual(new Uint8Array([1, 2, 3, 4]));
  });

  it("zeroizes buffers in place as a best-effort cleanup primitive", () => {
    const secret = new Uint8Array([4, 5, 6]);

    zeroizeBuffer(secret);

    expect(secret).toEqual(new Uint8Array([0, 0, 0]));
  });

  it("compares equal-length arrays without early success", () => {
    expect(bytesEqual(new Uint8Array([1, 2]), new Uint8Array([1, 2]))).toBe(true);
    expect(bytesEqual(new Uint8Array([1, 2]), new Uint8Array([1, 3]))).toBe(false);
    expect(bytesEqual(new Uint8Array([1, 2]), new Uint8Array([1, 2, 3]))).toBe(false);
  });
});
