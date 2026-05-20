/**
 * Type definitions for plugin-account.
 *
 * KeyHandle — opaque handle seam (T6 / FR-SY-75).
 * JS must never hold raw key material; only a KeyHandle (a branded integer)
 * is passed across IPC. Rust resolves it to actual key material in a future
 * KeyVault implementation (later crypto row).
 */

/** Opaque key handle. A branded integer so TypeScript prevents accidental fabrication. */
export type KeyHandle = number & { readonly __brand: 'KeyHandle' };
