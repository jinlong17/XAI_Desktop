# crypto-tauri-commands — API Contract

## Commands

### `crypto_encrypt_for`

Input:

```ts
{
  entityType: string;
  entityId: string;
  proposedRevision: number;
  plaintext: number[];
}
```

Output: binary cipher envelope as `number[]`.

### `crypto_wrap_dek_for_devices`

Input:

```ts
{
  dekHandle: number;
  devicePubs: Array<{
    targetDeviceId: number[]; // 16 bytes
    devicePub: number[];      // 32 bytes X25519 public key
  }>;
}
```

Output:

```ts
Array<{
  targetDeviceId: number[];
  encappedKey: number[];
  ciphertext: number[];
}>
```

### `crypto_unwrap_dek_for_device`

Input:

```ts
{
  wrapEnvelope: {
    targetDeviceId: number[];
    encappedKey: number[];
    ciphertext: number[];
  };
}
```

Output: recovered DEK handle as `number`.

### `crypto_recovery_sign`

Input:

```ts
{
  challenge: number[];       // 16 bytes
  newPayloadHash: number[];  // 32 bytes
}
```

Output:

```ts
{
  recoverySigningPub: number[];
  signature: number[];
  transcriptCbor: number[];
}
```

## Errors

- `E3004`: non-allowlisted window attempted a `crypto_*` command.
- `E3005`: invalid fixed-width byte input.
- `E3010`: crypto state is not initialized with active handles.
- `E3011`: crypto operation failed.
