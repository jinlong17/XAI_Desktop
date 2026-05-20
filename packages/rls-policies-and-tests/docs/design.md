# rls-policies-and-tests Design

## Scope

Feature #25 verifies the Sync v1 Supabase RLS boundary from dev-plan T-03. It
does not add application sync logic or Edge Function bodies.

## Policy Shape

The active-device check is centralized in
`public.sync_jwt_device_is_active()`, a narrow `SECURITY DEFINER` helper used
by active-gated policies. This prevents recursive RLS evaluation when
`sync_devices` policies and other table policies need to consult
`sync_devices`.

`sync_devices` now enforces the PRD comment literally:

- an active JWT device can read active devices in its own account
- a pending JWT device can read only its own pending row
- revoked devices read no `sync_devices` rows

`accounts` remains client read-only with no UPDATE policy. Client writes to
encrypted sync data remain service-role-only.

## Boundary

RLS defends against `authenticated` and `anon` client privilege escalation. It
does not defend against Supabase `service_role` or Studio Admin; that boundary
is handled by zero-knowledge ciphertext storage and operational controls.
