# G8-S4 Export/Import Web UI Brief

## Goal

Add browser-visible encrypted data export and import controls that align with plugin-account export/delete contracts.

## Scope

- `/export` page to generate and download a mock encrypted bundle.
- `/import` page to upload and verify an encrypted bundle before restore.
- `xai.encrypted-export.v2` envelope compatibility with plugin-account.

## Deferred Gates

- Real HMAC key injection.
- Supabase-backed encrypted record source.
- Production restore writes.
