# Legal and Privacy Checklist

Status: templates added; counsel review is required before GA.

## Public Pages

- `/privacy`: privacy policy template with legal-review marker.
- `/terms`: terms template with legal-review marker.
- `/delete-account`: account deletion entry wired to the plugin-account deletion-plan contract through a browser mock.
- `/export` and `/import`: encrypted bundle controls for user data portability.

## Required Review

- Privacy policy: data categories, local storage, encrypted sync, support messages, crash telemetry.
- Terms: recovery-material loss, beta/RC service availability, acceptable use, warranty limits.
- Deletion: timeline, confirmation path, support escalation, backend erasure audit.
- Export: encrypted bundle format, import verification, user-facing recovery warnings.

## Deferred Gates

- Legal counsel review.
- Production privacy/support contact inbox.
- Supabase service-role execution path for delete-account.
- Region-specific privacy language before public distribution.
