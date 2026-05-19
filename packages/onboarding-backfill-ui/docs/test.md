# onboarding-backfill-ui — Test Report

## 2026-05-19 Local Autorun

Passed:

- `pnpm --filter @repo/plugin-account test -- tests/onboarding-backfill.test.ts`
- `pnpm --filter @repo/plugin-account check-types`
- `pnpm --filter web test:onboarding-backfill`
- `pnpm --filter web check-types`
- `pnpm install --frozen-lockfile`
- `pnpm --filter @repo/plugin-account test`
- `pnpm --filter web lint`

Coverage:

- Weak master password rejection via `zxcvbn >= 3`.
- 6-word mnemonic type-back and 4 Secret Key digit type-back.
- Local `dek_check` and `secret_key_check` validation seam.
- Acknowledgement through Edge Function transport seam.
- Emergency Kit PDF generation with Secret Key and QR payload.

## Deferred Verification

- Human UX review.
- Hosted Supabase Edge Function deployment.
- Real Ed25519 proof generation from the Rust/Tauri command.
- Native print dialog and save-to-PDF workflow.
- Physical QR scan validation.
