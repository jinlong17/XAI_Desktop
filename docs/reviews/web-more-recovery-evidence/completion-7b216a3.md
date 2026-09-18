# More B1/B2 evidence completion receipt

Date: 2026-09-18. Module: `web`. Verdict: **PASS for the B1/B2 evidence gaps only. Independent Astra acceptance remains pending.**

No product defect was reproduced. This task changed no product source, product test, shared storage/host/auth/coordinator code, formal ledger, control plane, workflow, deployment, release, or branch-promotion state. It did not rerun or reinterpret the already recorded non-B1/B2 gates.

## Fixed boundary

- Immutable product archive: `7b216a3d5a4947d0f66da042fb275302737fb762`.
- Evidence checkout before this task: clean detached `5ac124439afa82f29ffc7747afa1b637b8269b53`, equal to `codex/web/full-product-audit-20260908` at task start.
- Browser: Chrome `153.0.8010.50`, headless, isolated profile and download directory.
- Fixed archive lockfile SHA-256: `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9`.
- Reused native fixture SHA-256: `966cfc812c6a923a00896fd08b348389966fc1004111cd15d9bec9bec4d02077`.
- New bounded verifier SHA-256: `48c9c868f35913ead021fe9b1ee7c4bf9b532c07bc6efc7ae4791f47f32d24f4`.
- The verifier rejects a borrowed dependency tree unless its `pnpm-lock.yaml` SHA-256 exactly matches the immutable product archive. Workspace package resolution remains pinned to the archive.

## B1 — actual Chrome reset and mixed-operation disk exports

**PASS.** Chrome downloaded and the verifier parsed the actual on-disk `more-draft.json` before retaining the evidence artifacts below.

| Artifact | Exact owner / key / operation | SHA-256 |
| --- | --- | --- |
| `b1-20260918-final-sparse-reset-more-draft.json` | `device.win_type = {"operation":"reset"}` | `f5079a1d387560940c2b258f705880ac3f80edf77c87b713c0ed92fd65b4f5d5` |
| `b1-20260918-final-mixed-set-reset-more-draft.json` | `device.win_type = reset`; `account.default_tag = set("work")` | `6263bc9087b81d8705eaf2248bffac7b9727509ed09e31361eb51dba8ea49f5b` |
| `b1-20260918-final-locked-device-reset-more-draft.json` | locked scope retains only `device.win_type = reset`; the invalidated account draft is absent | `f5079a1d387560940c2b258f705880ac3f80edf77c87b713c0ed92fd65b4f5d5` |

All three payloads have the exact version-1 `more-draft` envelope. The mixed record is explicitly mixed **operations** (`reset` plus `set`) as well as mixed owners; it is not a relabelled mixed-owner/set-only export. During every export, persistence read/write/remove counters were unchanged while storage access was configured to throw. Each hidden download anchor was removed, each object URL was revoked exactly once, and export retained the departure warning. The locked positive proves current-permission filtering and device-only continuity for the reset draft.

Authoritative B1 log: `gap-7b216a3d5a4947d0f66da042fb275302737fb762-20260918-final-b1-native-export.log`, SHA-256 `3ef902db56e308146e6f8d23ed35db2c70d90062ede66fd22d0cec586a1bff5a`.

## B2 — actual More host, location identity, and same-field release ordering

**PASS.** The verifier used the production `ComposedSettings` sidebar and departure coordinator through the existing native fixture; it did not mock a private More hook.

- Browser Back was blocked on the original More location key `6c4gr19y`. Stay preserved that key. Discard then Back restored Date & Time key `5ixtzgti`, and Forward restored the original More key `6c4gr19y`; matching paths were not accepted as sufficient evidence.
- A trusted Settings sidebar click selected Date & Time while a More departure guard held two same-field `win_type` operations. Web Locks forced the predecessor `tray` completion to occur while the newer `full` operation remained pending. The path/key stayed `/app/settings/more` / `default`, the dialog stayed open, and history mutation count stayed zero.
- The newer `full` operation then failed through public `Storage` fault injection. The same More location and dialog remained held with zero history mutations.
- Retrying the latest matching `full` operation persisted `full` and released the retained sidebar intent. Public router subscription observed exactly one location commit: `PUSH /app/settings/date_time` with key `8fizbuld`. Browser-history instrumentation observed exactly one `pushState`, zero `replaceState`, and zero `popstate`; the dialog and beforeunload warning both cleared.

Authoritative B2 log: `gap-7b216a3d5a4947d0f66da042fb275302737fb762-20260918-final-b2-host-ordering.log`, SHA-256 `4717bbaeb77d02c9e5cabe3e0801f6e1d897f31824ada606886da1a336436c84`.

## Commands

```sh
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop node docs/reviews/web-more-recovery-evidence/verify-gaps.mjs 7b216a3d5a4947d0f66da042fb275302737fb762 b1-native-export 20260918-final
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop node docs/reviews/web-more-recovery-evidence/verify-gaps.mjs 7b216a3d5a4947d0f66da042fb275302737fb762 b2-host-ordering 20260918-final
```

Both commands exited 0. Only these two new bounded modes were run for the authoritative evidence.

## Retained limits

This closes only the two evidence gaps B1 and B2 identified in `docs/reviews/web-more-recovery-astra/blocked-7b216a3.md`. It does not convert the prior Astra BLOCKED report into acceptance and does not close any 312 item, D2/REL/AI, deployment, release, Tasks default consumption, template CRUD, native launch/tray/window behavior, or Sticky scope. The browser evidence uses synthetic local accounts and deliberate storage/Web Lock injection; it is not Tauri execution or production authentication.
