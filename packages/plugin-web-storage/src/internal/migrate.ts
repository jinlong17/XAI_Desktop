/**
 * @internal — migrate.ts
 * Migration surface — v1 stub.
 *
 * v1 has ZERO registered migrations. migrate(from, to) is callable for
 * forward-compatibility and returns void immediately.
 *
 * Future rows may register migrations via a `registerMigration` helper that
 * will be added as a follow-up row PR. `registerMigration` is NOT exported in
 * v1 — the surface is held in reserve.
 *
 * Called by apps/web/src/main.tsx (host shell) once at app boot, after
 * registry import but before React mount. Host shell wiring is row #5's job.
 */

/**
 * Private migration registry. NOT exported.
 * Structure ready for a future `registerMigration` helper.
 */
const _registrations: Map<
  string, // `${key}:${from}->${to}`
  {
    key: string;
    from: number;
    to: number;
    up: (raw: unknown) => unknown;
  }
> = new Map();

// Expose for testing only (not part of the public index.ts surface)
export function _getMigrationCount(): number {
  return _registrations.size;
}

/**
 * Run all registered migrations from `fromVersion` to `toVersion`.
 * v1: no registered migrations; returns immediately.
 *
 * SSR-safe: if `typeof window === "undefined"`, this is a no-op.
 */
export function migrate(fromVersion: number, toVersion: number): void {
  if (typeof window === "undefined") return;
  if (_registrations.size === 0) return;
  // Future: iterate _registrations, apply in version order.
  void fromVersion;
  void toVersion;
}
