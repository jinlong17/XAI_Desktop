# onboarding-backfill-ui — API

## Plugin Account Exports

- `OnboardingBackfillFlow`
- `createBackfillChallenge(mnemonic, secretKey)`
- `verifyBackfillChallenge(challenge, answers, mnemonic, secretKey)`
- `completeOnboardingBackfill(input)`
- `createEmergencyKitPayload(input)`
- `createEmergencyKitDocument(payload)`
- `scoreMasterPassword(masterPassword)`
- `assertStrongMasterPassword(masterPassword)`

## Edge Function Core

- `acknowledgeOnboardingBackfill(deps, request)`
- `onboardingBackfillAckPayload()`

## Test Entrypoints

- `pnpm --filter @repo/plugin-account test -- tests/onboarding-backfill.test.ts`
- `pnpm --filter @repo/plugin-account check-types`
- `pnpm --filter web test:onboarding-backfill`
- `pnpm --filter web check-types`
