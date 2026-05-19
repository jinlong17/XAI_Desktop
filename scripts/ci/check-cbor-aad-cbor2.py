#!/usr/bin/env python3
import json
from collections import OrderedDict
from pathlib import Path

import cbor2


FIXTURE = Path("apps/desktop/src-tauri/tests/fixtures/cbor_aad_vectors.json")


def main() -> None:
    fixture = json.loads(FIXTURE.read_text())
    expected = {vector["name"]: vector["expected_cbor_hex"] for vector in fixture["vectors"]}
    vectors = {
        "blob_aad_v1": OrderedDict(
            [
                (1, 1),
                (2, bytes.fromhex("000102030405060708090a0b0c0d0e0f")),
                (3, "todos"),
                (4, "todo-1"),
                (5, 7),
                (6, 1),
                (7, 0),
                (8, 1),
                (9, 100042),
            ]
        ),
        "wrap_aad_v2": OrderedDict(
            [
                (1, 2),
                (2, bytes.fromhex("101112131415161718191a1b1c1d1e1f")),
                (3, bytes.fromhex("202122232425262728292a2b2c2d2e2f")),
                (4, 3),
                (5, bytes.fromhex("303132333435363738393a3b3c3d3e3f")),
            ]
        ),
        "recovery_message_v1": OrderedDict(
            [
                (1, 1),
                (2, bytes.fromhex("404142434445464748494a4b4c4d4e4f")),
                (3, bytes.fromhex("000102030405060708090a0b0c0d0e0f")),
                (
                    4,
                    bytes.fromhex(
                        "808182838485868788898a8b8c8d8e8f"
                        "909192939495969798999a9b9c9d9e9f"
                    ),
                ),
                (5, 1000),
            ]
        ),
    }

    for name, value in vectors.items():
        encoded = cbor2.dumps(value, canonical=True).hex()
        if encoded != expected[name]:
            raise AssertionError(f"{name}: cbor2 produced {encoded}, expected {expected[name]}")


if __name__ == "__main__":
    main()
