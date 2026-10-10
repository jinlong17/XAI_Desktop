# Shared source byte collection 1

Status: PARTIAL / BLOCKED for source-bound qualification. This is a bounded capture of installed package bytes only. It does not establish which artifact a future runner will load, source/config closure, runtime safety, or caller acceptance.

## Binding and provenance

- Dispatch parent: `b7324936f5880c2050e6eecc8c22567fade05444`; parent: `61b6644d2eac5af6c70749bf672839ba7ba79bca`. Worktree started clean.
- Fixed input commit: `61b6644d2eac5af6c70749bf672839ba7ba79bca`. The dispatch card is present at the newer parent; it is absent from the fixed-input tree.
- Approved evidence commits: source `f667a0b6996b4039d2c4e5ca28657953703e830b` and review `bdc06bd5b57f026caf6d7838563bfdae6f8684c9`. They contain the `shared-native-host-focus-impact-r3` record and review-r2, respectively; they do not contain the requested `shared-source-byte-collection` outputs.
- Read-only provider: `/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop/node_modules/.pnpm`. Four start packages resolved to React DOM 19.2.0, React 19.2.0, scheduler 0.27.0, and Supabase JS 2.106.1. Recursive dependency enumeration captured 4 package roots, 104 regular files, 7993322 bytes. See `source-bytes.json` for exact immutable bytes, hashes, manifests/exports, and dependency gaps.
- Limits applied before capture: 24 package roots, 4096 files, 33,554,432 bytes. All selected package files were enumerated before any bytes were read; file identity/size/mtime checked before and after each read. All JSON outputs were assembled in memory before writing.

## Actual product inputs and limitations

`inputs.sha256` binds the installed lockfile and the Web/auth source files at the original provider checkout. Their presence does not establish equality to the task’s historical product SHA. The task’s full source/review input manifests, original TASK/MET case-configuration inventory, and canonical G1/E1-E25 rules were not reconstructed and hash-checked as a complete five-row basis in this bounded collection. That is a missing prerequisite for independent source/config review.

Installed manifests report React DOM `exports` branches for default and `react-server`, and Supabase JS ESM/CJS entrypoints plus five runtime package dependencies. This describes installed metadata only; the selected branch and actual browser artifact remain unproved. The React DOM package includes development/production CJS files in the captured tree; the exact `defineProperty` input-tracker forwarding/untracking path must be assessed by the independent reviewer from captured bytes and the actual configured/loaded artifact.

The application source inventory includes `packages/web-auth-device-session/src/auth-generation-client.ts`, `apps/web/src/providers/AppProviders.tsx`, and `apps/web/src/main.tsx`. These show a client factory, provider registration, and SPA bootstrap source locations; they do not establish all public provider conditions or a runtime closure.

No canonical root capture/supervisor/bootstrap implementation was identified in the supplied fixed Git basis or approved impact/review commit deltas. The runner docs mention manual leases/metadata; those are not evidence of a runtime capture engine. Exact TASK/MET prior-source-file/configuration identities were not available in the provided card’s enumerated basis, so their absence is not asserted globally.

## Boundary

This is evidence retrieval, not a source qualification, runtime test, product test, architecture decision, design repair, caller acceptance, or permission to release a held caller. Future copied-source rehashing, loaded resolution/configuration checks, descriptor/capability review, and all separately required qualification remain mandatory.

## Costs

Runtime/tests/build/lint/browser/native/server/qualification/probes/vendor/push/children: 0. Evidence collection iterations: 1 of cap 3. Static checks: 0 (no qualification checker executed).
