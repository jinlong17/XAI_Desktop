# Roadmap Seed Brief - account-sync-local-first-boundaries

## Requirement

Define the repository-driver and local-first boundaries for Web IndexedDB, Desktop SQLite/SQLCipher, plugin access, and remote encrypted blob storage. The goal is to make plugins depend only on repository interfaces while each runtime keeps its own safe local storage behavior.

## Hard Constraints

- Plugins must not directly access localStorage, SQLite, IndexedDB, Supabase, or service-role APIs.
- Web uses IndexedDB/WebCrypto-friendly storage; Desktop uses SQLite/SQLCipher and Keychain-backed crypto seams; remote only stores encrypted envelopes and metadata.
- Runtime-only state such as window layout, clipboard contents, current selection, drag state, and cache indexes remains local-first unless explicitly promoted through D4.
- Store mapping must be written before any account-sync entity is implemented.

## Acceptance Signal

- A local-first boundary document maps each entity class to Web store, Desktop store, plugin API, remote representation, and offline behavior.
- The plan identifies required contract tests for repository drivers and syncScope enforcement.
