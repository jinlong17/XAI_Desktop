---
name: xai-web-to-desktop-sync
description: Classify XAI Web changes before web to desktop-next promotion using ADR-0011 D3. Use for Web to Desktop sync gates, desktop parity receipts, recent web commit impact review, W0-W4 branch-sync classification, and handoff routing to record-only, merge-to-desktop-next, xai-feature-full-loop, or RC release gates.
---

# xai-web-to-desktop-sync

Project-layer gate for ADR-0011 D3. Use this skill to classify a Web delta before it flows from
`web` to `desktop-next`, then emit the D3 parity receipt.

This skill is a classifier and handoff orchestrator. It does not merge branches, create D2 topology
branches, run `ship`, promote to `dev`, or bypass `feature-verify` / `bug-verify`.

## Read First

- `docs/adr/0011-branch-sync-governance.md` D2 and D3
- `CLAUDE.md` Agent / Skill Tracking Contract when changing this skill or its mirrored surfaces
- `AGENTS.md` Workflow V2 Handoff Display rules when this gate is executed by a spawned agent
- `docs/workflow/project/usage-guide.md` for current XAI workflow conventions

## Inputs

Preferred invocation:

```text
/xai-web-to-desktop-sync
Web delta: <commit | range | PR | branch diff | surface summary>
Mode: dry-run | gate
```

If `Web delta:` is omitted, infer the smallest current delta from `HEAD`, the current branch diff,
or the user's named files. If evidence is ambiguous, stop with `Verdict: BLOCKED`.

## Hard Constraints

1. Stay off `dev`. Do not create, checkout, merge into, or promote through `dev` without explicit
   operator confirmation outside this skill.
2. Do not create `desktop-next`, `desktop-plugin-next`, or `release/desktop/<version>`; ADR-0011 D2
   says branch creation is a separate operator-confirmed step.
3. Do not run `ship` or trigger a release. W4 emits an RC/release gate handoff only.
4. Do not implement App deltas inline from this gate. W3 native/runtime work routes to
   `/xai-feature-full-loop`, which must still run the normal Workflow V2 plan, build, and verify
   path.
5. Do not mark a feature `READY_TO_SHIP` from this skill. Required feature or bug work still needs
   `feature-verify` or `bug-verify`.
6. Base the receipt on current repo evidence: changed paths, diffs, docs, tests, and runtime
   contracts. If the impact cannot be proven, use `Verdict: BLOCKED`.

## Classification Workflow

1. Identify the delta and changed paths:
   - `git show --name-status --stat <commit>` for one commit.
   - `git diff --name-status <base>...<head>` for a range.
   - `git status --short` for uncommitted local deltas.
2. Summarize the Web delta in one compact phrase: commits, PRs, and touched surfaces.
3. Classify exactly one tier. If multiple tiers match, choose the highest risk tier.
4. Fill every Desktop impact axis with `yes` or `no`; do not leave blanks.
5. Emit the parity receipt exactly in the output format below.

## W0-W4 Tiers

| Tier | Use When | Required Action |
|---|---|---|
| W0 web-only | Web-only app, deployment, docs, marketing, CSP, or `plugin-web-*` / `xai-web-*` package changes with no shared desktop contract impact. | Record only. No merge to `desktop-next` required. |
| W1 shared-ui-safe | Shared UI, shared core, shared package, or desktop-consumed plugin code changed but remains App-safe. | Merge to `desktop-next`; run Web build and desktop Tauri build gates. |
| W2 desktop-runtime-affected | Auth, storage, offline behavior, runtime profile, local persistence, or desktop-sensitive behavior can differ under the desktop runtime. | Merge to `desktop-next`; run W1 gates plus offline/runtime/profile tests. |
| W3 native-bridge-needed | Tauri/Rust, native commands, permissions/capabilities, file system bridge, global shortcuts, tray, NSWindow, multi-window focus, or native window behavior needs real App work. | Route the App delta to `/xai-feature-full-loop`; require W3 manual macOS smoke before parity is aligned. |
| W4 release-risk | Signing, notarization, updater, versioned distribution, release branch, download/update metadata, or App RC sign-off is affected. | Route to RC/release gate with W4 manual macOS smoke before `dev` promotion or `release/desktop/<version>`. |

## Desktop Impact Axes

- `auth`: login/session/provider token/account behavior changes.
- `offline`: cache, queue, local fallback, runtime profile, or offline-first behavior changes.
- `storage`: schema, migration, local storage, IndexedDB, file persistence, sync scope, or data model changes.
- `native`: Tauri/Rust commands, permissions, capabilities, filesystem, shell, tray, shortcuts, or OS APIs change.
- `window`: overlay, control window, grid window, multi-window routing, focus, z-order, NSWindow, drag/drop, or window events change.
- `release`: signing, updater, version, package, download, release branch, RC gate, or distribution metadata changes.

## Verdict Mapping

- W0 -> `NO_APP_CHANGE`, `Required desktop work: none`, `Next workflow: record-only`,
  `Parity status: not-applicable`.
- W1 -> `GATE_ONLY`, `Required desktop work: W1 gate`, `Next workflow: merge-to-desktop-next`,
  `Parity status: aligned` only after gates are green; otherwise `blocked`.
- W2 -> `GATE_ONLY` if tests are enough, or `DESKTOP_DELTA_REQUIRED` if App runtime fixes are needed.
  Use `Required desktop work: W2 tests`, `Next workflow: merge-to-desktop-next`, and
  `Parity status: aligned`, `degraded`, or `blocked` based on evidence.
- W3 -> `DESKTOP_DELTA_REQUIRED`, `Required desktop work: W3 native delta via /xai-feature-full-loop`,
  `Next workflow: /xai-feature-full-loop`, `Parity status: degraded` until the native delta and
  manual macOS smoke pass.
- W4 -> `DESKTOP_DELTA_REQUIRED` or `BLOCKED`, `Required desktop work: W4 release gate`,
  `Next workflow: RC/release gate`, `Parity status: blocked` until release sign-off passes.

## Output Format

The final response must contain the parity receipt. Keep the field names and value domains intact.
Use short evidence phrases in values, not extra sections, unless the user explicitly asks for a
longer review.

```text
Parity Receipt
  Verdict:          NO_APP_CHANGE | GATE_ONLY | DESKTOP_DELTA_REQUIRED | BLOCKED
  Web delta:        <commits / PRs / surface summary being synced>
  Desktop impact:   auth:    yes|no
                    offline: yes|no
                    storage: yes|no
                    native:  yes|no
                    window:  yes|no
                    release: yes|no
  Required desktop work:  <none | W1 gate | W2 tests | W3 native delta via /xai-feature-full-loop | W4 release gate>
  Verification gates:     <none | web build | tauri build | offline/runtime/profile tests | W3 manual macOS smoke | W4 manual macOS smoke>
  Next workflow:          <record-only | merge-to-desktop-next | /xai-feature-full-loop | RC/release gate>
  Parity status:          aligned | degraded | blocked | not-applicable
```

If executed as a Workflow V2 spawned agent, wrap only this receipt in the required `## Handoff`
block and do not append a conversational follow-up after it.
