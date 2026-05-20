# onboarding-backfill-ui — Design

Feature #18 adds the first-registration recovery backfill gate.

## Implemented Core

- `packages/plugin-account/src/onboarding-backfill.ts` owns the recoverability
  business rules:
  - `zxcvbn` score must be at least 3.
  - The 24-word mnemonic challenge samples 6 positions.
  - The Secret Key challenge samples 4 digit positions.
  - Completion requires local `dek_check` and `secret_key_check` validation
    through an injected validator seam.
  - Acknowledgement is submitted through an Edge Function transport seam, not a
    direct client update.
- `packages/plugin-account/src/components/OnboardingBackfillFlow.tsx` exposes a
  three-screen React flow for the warning, Emergency Kit generation, and
  type-back gate.
- The Emergency Kit generator emits a real PDF byte stream plus a QR code for
  the Secret Key payload.
- `apps/web/supabase/functions/onboarding-backfill/handler.ts` verifies the
  Ed25519 recovery proof seam before calling the privileged acknowledgement DB
  method.

## Boundaries

- The flow is packaged as plugin-owned UI and is not mounted into the desktop
  host in this row.
- The Edge Function implementation is a locally testable core handler; hosted
  Supabase deployment remains external.
- Native print dialog integration and physical QR scan validation are deferred.
