#!/usr/bin/env bash
# lib_phase_verdict.sh — portable reference implementation
#
# Part of the portable agent/skill workflow paradigm. This is the single source
# of truth for the read_phase_verdict() four-state protocol (see
# ../04-automation-loop.md §8.2). Every reader — the meta-orchestrator INTAKE,
# the git post-commit hook, the verify agent's verify-after-phases entry check,
# the Handoff State Verification field — MUST `source` this one file rather than
# re-deriving the logic.
#
# PLACEHOLDERS: replace the <...> tokens per ../00-PORTABLE-MANIFEST.md §3 when
# you copy this into a project. Tokens used here: <feature_root>.
# Install location: <cowork_scripts_dir>/lib_phase_verdict.sh
#
# Source it:
#   source "$(git rev-parse --show-toplevel)/<cowork_scripts_dir>/lib_phase_verdict.sh"
#
# Two entry points:
#   read_phase_verdict           <feature> <phase_num>          # resolve path from feature name (production)
#   read_phase_verdict_from_path <dev_log_abs_path> <phase_num> # accept an absolute path (unit tests / cross-feature)
#
# Output (stdout): exactly one of  PASS | BLOCKED | NONE | ERROR
#   - PASS/BLOCKED: a definitive verdict — either source alone has it, or both agree
#   - NONE:  phase-review has not run / not written back yet
#   - ERROR: the table column AND the subblock both have a value and they DISAGREE
#            (dev_log was hand-edited / corrupted) — never silently pick one
# Exit code: 0 on PASS/BLOCKED/NONE; 1 on ERROR or a missing dev_log file.

# Primary entry: resolve the dev_log path from the feature name + REPO_ROOT.
read_phase_verdict() {
  local feature="$1"
  local n="$2"
  local repo_root="${REPO_ROOT:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
  read_phase_verdict_from_path "$repo_root/<feature_root>/$feature/docs/dev_log.md" "$n"
}

# Helper entry: accept an absolute dev_log path directly (unit tests + cross-feature calls).
read_phase_verdict_from_path() {
  local dev_log="$1"
  local n="$2"

  if [ ! -f "$dev_log" ]; then
    echo "ERROR: dev_log not found at $dev_log" >&2
    echo "ERROR"
    return 1
  fi

  # Read BOTH sources: the Phase Progress table Verdict column + the subblock anchor.
  local table_v subblock_v

  # Source 1: the Phase Progress table Verdict column (present only if the schema has it).
  table_v=$(awk -v target="$n" '
    BEGIN { in_section=0; in_table=0; phase_col=0; verdict_col=0 }
    /^## Phase Progress/ { in_section=1; next }
    in_section && /^## / && !/^## Phase Progress/ { in_section=0; in_table=0 }
    in_section && /^\|/ && !in_table {
      n_cols = split($0, headers, "|")
      for (i = 2; i <= n_cols; i++) {
        h = headers[i]
        gsub(/^[ \t]+|[ \t]+$/, "", h)
        lc = tolower(h)
        if (lc == "phase") phase_col = i
        if (lc == "verdict") verdict_col = i
      }
      if (phase_col > 0 && verdict_col > 0) { in_table = 1 }
      next
    }
    in_table && /^\|[-: ]+\|/ { next }
    in_table && /^\|/ {
      n_cells = split($0, cells, "|")
      p = cells[phase_col]; gsub(/^[ \t]+|[ \t]+$/, "", p)
      if (p == target && verdict_col <= n_cells) {
        v = cells[verdict_col]; gsub(/^[ \t]+|[ \t]+$/, "", v)
        if (v == "PASS" || v == "BLOCKED") { print v; exit 0 }
      }
    }
  ' "$dev_log")

  # Source 2: the `### Phase <N> Verdict — PASS|BLOCKED` subblock anchor (take the latest).
  # Note: — is U+2014 em-dash, matching the phase-review write-back script. A UTF-8 byte
  # sequence inside a single-quoted shell string passes through to grep with no escaping.
  subblock_v=$(grep -E "^### Phase $n Verdict — (PASS|BLOCKED)([[:space:]]|\$)" "$dev_log" \
               | tail -1 \
               | grep -oE "(PASS|BLOCKED)" \
               | head -1)

  # Normalize: an empty string means that single source is absent.
  [ -z "$table_v" ]    && table_v="NONE"
  [ -z "$subblock_v" ] && subblock_v="NONE"

  # Conflict detection: both sources have a value and they disagree.
  if [ "$table_v" != "NONE" ] && [ "$subblock_v" != "NONE" ]; then
    if [ "$table_v" != "$subblock_v" ]; then
      echo "ERROR: dev_log Phase $n verdict conflict: table=$table_v subblock=$subblock_v in $dev_log" >&2
      echo "ERROR"
      return 1
    fi
    echo "$table_v"
    return 0
  fi

  # Exactly one source has a value.
  if [ "$table_v" != "NONE" ]; then
    echo "$table_v"
    return 0
  fi
  if [ "$subblock_v" != "NONE" ]; then
    echo "$subblock_v"
    return 0
  fi

  echo "NONE"
  return 0
}

# Helper: check whether every phase 1..N is PASS (used by the verify agent's
# verify-after-phases entry check).
# Return: 0 = every phase PASS; 1 = at least one phase is not PASS (incl. NONE/BLOCKED/ERROR).
all_phases_pass() {
  local feature="$1"
  local n_phases="$2"
  local i v
  for ((i = 1; i <= n_phases; i++)); do
    v=$(read_phase_verdict "$feature" "$i")
    if [ "$v" != "PASS" ]; then
      return 1
    fi
  done
  return 0
}
