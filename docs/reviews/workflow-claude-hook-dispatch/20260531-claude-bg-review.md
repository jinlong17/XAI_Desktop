# Review Receipt — Claude Hook Dispatch (commit 4b092a3)

- **Reviewer:** Claude Code (independent bg reviewer, Opus 4.8)
- **Date:** 2026-05-31
- **Branch / worktree:** `codex/sync/account-cloud-sync-foundation` @ `/Users/lijinlong/.codex/worktrees/b8a9/XAI_Desktop`
- **Subject:** local commit `4b092a3` `feat(workflow): add opt-in Claude hook dispatch` (cherry-pick of web `afd9336`)
- **Scope:** `scripts/cowork/dispatch_claude.sh`, `scripts/cowork/git-post-commit`, `scripts/cowork/lib_hook_helpers.sh`, portable mirrors under `docs/workflow/_portable/scripts/`, `scripts/lint/check_portable_sync.py`, and doc updates.

## Verdict: PASS_WITH_NOTES

The implementation is present, correct, and safe-by-default. All notes below are
non-blocking residual risks, not defects.

## Correction of the prior receipt on this path

The previous version of this file recorded **BLOCKED**, claiming the dispatch
scripts were absent and only `.githooks/README.md` had landed. That conclusion
does not hold in this worktree and is overturned. The scope files are present,
executable, syntactically valid, and pass the portable-sync lint here:

```
-rwxr-xr-x  scripts/cowork/dispatch_claude.sh                  (3812 bytes, +x)
-rwxr-xr-x  docs/workflow/_portable/scripts/dispatch_claude.sh (3821 bytes, +x)
-rw-r--r--  scripts/lint/check_portable_sync.py                (present; lists dispatch_claude.sh)
```

`git log --oneline -1 4b092a3` resolves; `git show --name-status 4b092a3` lists
both `A …/dispatch_claude.sh` adds plus the `M` edits to `git-post-commit`,
`lib_hook_helpers.sh`, README, docs, and the lint script. The most likely cause
of the prior BLOCKED is that it was run against a checkout/worktree where the
cherry-pick had not yet materialized the files (an evidence-availability
artifact), not a real absence on this branch.

## Findings (by severity)

**No blocking findings.**

### Notes (non-blocking, ordered by relevance)

1. **N1 — Idle-session detection is string-fragile** (`scripts/cowork/dispatch_claude.sh:92`).
   The idle guard greps `'idle.*send a prompt to start'` against captured CLI
   output. If a future `claude --bg` build reworks that wording, an idle
   (prompt-not-consumed) session could slip past the guard and the script would
   `exit 0`. The failure direction is partly safe — the hook still only emits a
   "dispatched" notification and never marks PASS (state stays at
   `NEEDS_REVIEW`/`READY_FOR_VERIFY`), so no false state advance occurs — but the
   operator could believe review/verify is in flight when the session is idle.
   Follow-up: pin to a more stable signal (exit code or a structured
   `--output-format` field) if/when the CLI exposes one.

2. **N2 — `timeout` can produce a false-negative launch result**
   (`scripts/cowork/dispatch_claude.sh:74-90`). The launch runs under
   `gtimeout ${CW_CLAUDE_BG_LAUNCH_TIMEOUT:-90}`. If `claude --bg` ever stays
   attached past 90s instead of detaching, `gtimeout` kills it (rc=124) and the
   script reports launch failure even if the session was actually created. This
   is the *safe* direction (reports fail, never fake-success) and the hook falls
   back to a manual notice — acceptable, noted for operator awareness during the
   required smoke test.

3. **N3 — No `--` guard before the prompt positional**
   (`scripts/cowork/dispatch_claude.sh:67-72`). `CMD+=("$prompt")` appends the
   prompt as the final argv with no `--` separator. Array quoting prevents word
   splitting, but a prompt body beginning with `-` could in principle be parsed
   as a flag by `claude`. The rendered prompts (`render_*_prompt`) all start with
   `Start the …`, so this is currently unreachable; adding `--` before the prompt
   would harden it against future prompt templates.

4. **N4 — Hook-launched sessions default to `--permission-mode auto`**
   (`scripts/cowork/dispatch_claude.sh:70`). A hook-launched verify session may
   run commands/tests autonomously. This is consistent with the headless
   automation paradigm and is gated behind the opt-in, so it is acceptable;
   flagged only because it is a meaningfully permissive default for an
   event-triggered session. Overridable via `CW_CLAUDE_PERMISSION_MODE`.

## Review-focus checklist

1. **Opt-in safety — PASS.** Double-gated. `dispatch_claude.sh:41-45` exits 3
   unless `CW_ENABLE_CLAUDE_BG=1` or `git config cowork.claudeBg true`.
   Independently, `lib_hook_helpers.sh:27-31` (`claude_bg_dispatch_enabled`)
   gates routing so `determine_other_vendor` only emits `claude` when enabled,
   else `MANUAL_CLAUDE` (`:40-48`). Disabled is the default in both layers, so
   even direct invocation of the dispatcher stays inert without opt-in.

2. **Hook correctness — PASS.** `determine_other_vendor` maps `Codex*/GPT*` to
   `claude` only when opt-in is on, otherwise `MANUAL_CLAUDE`. `vendor_dispatchable`
   accepts only `codex|cursor|claude` **and** requires an executable
   `dispatch_$1.sh` (`git-post-commit:108-113`); `MANUAL_CLAUDE`/`UNKNOWN` and a
   selected-but-missing dispatcher each route to distinct clean notifications
   (`:127-134`, `:163-170`). The historical `[ -z ]`-fallthrough to a bogus
   `dispatch_UNKNOWN.sh` / `dispatch_MANUAL_CLAUDE.sh` is closed.

3. **Failure semantics — PASS.** Missing CLI → exit 1 (`:47-50`); empty/missing
   prompt → exit 1 (`:52-55`); launch failure → propagates `rc` (`:86-90`);
   timeout → `gtimeout` rc≠0 propagated (`:74-90`); idle session → exit 1
   (`:92-96`); unknown `agent_name` → exit 2 (`:30-33`); disabled → exit 3
   (`:41-45`). None of these paths can be read as a review/verify PASS: the
   dispatcher only writes a `/tmp` launch log + `.claude_dispatched` marker, and
   the hook emits a "dispatched" notice without touching state.

4. **Workflow authority — PASS.** `dispatch_claude.sh` writes only
   `$RUN_DIR/*.launch.log` and `$MARKER_DIR/*.claude_dispatched` (both under
   `/tmp`); it never writes any `dev_log.md` Status Panel and never emits PASS.
   `git-post-commit` header reaffirms "MUST NOT write the dev_log Status Panel"
   and its body only reads + notifies. Docs (`workflow.md`, `usage-guide.md`,
   `README.md`, `04-automation-loop.md`) consistently state launch success ≠
   cross-vendor PASS; only worker-written dev_log/receipt evidence advances state.

5. **Portable sync — PASS.** `python3 scripts/lint/check_portable_sync.py`
   reproduced locally: `PASS — docs/workflow/_portable/ is portable and in sync`.
   `dispatch_claude.sh` is registered in `COWORK_SCRIPT_FILES`. `diff` of the two
   copies shows only the expected placeholder-path lines (`<quota_state_dir>` /
   `<orchestrator_marker_dir>` ↔ `/tmp/cw-quota` / `/tmp/cw-orchestrator`).

6. **Shell robustness — PASS (with N1–N4).** `set -euo pipefail` in the
   dispatcher; `set -uo pipefail` (correctly **not** `-e`) in the hook so its
   `[ $? -eq 0 ] && notify` patterns work. Array-based `CMD` avoids word
   splitting; `safe_stem` sanitizes the session name (`tr`/`sed`/`cut`);
   env/config parsing uses `--bool … || true` guards; marker/log writes are
   namespaced by `feature.agent` to avoid clobbering across steps. `bash -n`
   clean on all four scripts.

## Evidence

- `git log --oneline -1 4b092a3` → resolves to the subject commit.
- `ls -la` → both `dispatch_claude.sh` copies present and executable; lint script present.
- `bash -n` → OK on `dispatch_claude.sh`, `git-post-commit`, `lib_hook_helpers.sh`, and the portable mirror.
- `python3 scripts/lint/check_portable_sync.py` → `PASS — … portable and in sync`.
- `diff` portable vs project `dispatch_claude.sh` → only `RUN_DIR`/`MARKER_DIR` placeholder lines differ.
- `git diff --check 4b092a3^ 4b092a3 -- scripts/cowork docs/workflow/_portable/scripts` → no whitespace errors.
- Source reads: `dispatch_claude.sh:21-113`, `lib_hook_helpers.sh:27-56`, `git-post-commit:104-177`.
- Matches the embedded evidence in the review brief (script listings, static-check PASS, scoped patch).

## Residual risks / follow-ups

1. **R1 (N1):** Idle / output detection depends on Claude CLI string output;
   revisit if the CLI changes its backgrounding messages or gains a structured
   status output. Fails safe today (no false PASS) but can mislead the operator.
2. **R2 (N2):** During the required smoke test, confirm `claude --bg` actually
   detaches well under the 90s launch budget on the target machine; tune
   `CW_CLAUDE_BG_LAUNCH_TIMEOUT` if it attaches longer.
3. **R3 (N3/N4):** Consider adding `--` before the prompt positional and
   documenting the `auto` permission-mode default for hook-launched verify
   sessions; both are hardening, not corrections.
4. **R4:** The opt-in is machine-local and intentionally **not** enabled in this
   checkout by default — confirm `git config cowork.claudeBg` /
   `CW_ENABLE_CLAUDE_BG` state before relying on auto Codex→Claude dispatch.
