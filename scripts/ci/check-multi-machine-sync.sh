#!/usr/bin/env bash
set -uo pipefail

fetch_remote=false
deep_check=false

for arg in "$@"; do
  case "$arg" in
    --) ;;
    --fetch) fetch_remote=true ;;
    --deep) deep_check=true ;;
    -h|--help)
      echo "Usage: $0 [--fetch] [--deep]"
      exit 0
      ;;
    *)
      echo "ERROR unknown argument: $arg" >&2
      exit 2
      ;;
  esac
done

repo_root=$(git rev-parse --show-toplevel 2>/dev/null) || {
  echo "ERROR not inside a Git repository" >&2
  exit 2
}
cd "$repo_root" || exit 2

failures=0
warnings=0

fail() {
  echo "FAIL $1"
  failures=$((failures + 1))
}

warn() {
  echo "WARN $1"
  warnings=$((warnings + 1))
}

pass() {
  echo "PASS $1"
}

if $fetch_remote; then
  if git fetch --all --prune --tags; then
    pass "fetched and pruned all remotes"
  else
    fail "git fetch --all --prune --tags failed"
  fi
else
  warn "remote state was not refreshed; rerun with --fetch before handoff"
fi

dirty=$(git status --porcelain --untracked-files=all)
if [[ -n "$dirty" ]]; then
  fail "working tree is not clean"
  printf '%s\n' "$dirty"
else
  pass "working tree is clean"
fi

while IFS='|' read -r branch upstream track; do
  [[ -z "$branch" ]] && continue
  if [[ -z "$upstream" ]]; then
    fail "local branch has no upstream: $branch"
    continue
  fi
  case "$track" in
    *gone*) fail "upstream is gone: $branch -> $upstream" ;;
    *ahead*) fail "branch has unpushed commits: $branch $track" ;;
    *behind*) warn "branch is behind remote and must be refreshed before writing: $branch $track" ;;
    *) pass "branch aligned: $branch -> $upstream" ;;
  esac
done < <(git for-each-ref refs/heads --format='%(refname:short)|%(upstream:short)|%(upstream:track)')

branch_only=$(git rev-list --branches --not --remotes --count)
if [[ "$branch_only" -eq 0 ]]; then
  pass "no branch commit is local-only"
else
  fail "$branch_only branch commit(s) are local-only"
fi

ref_only=$(git rev-list --all --not --remotes --count)
if [[ "$ref_only" -eq 0 ]]; then
  pass "no commit under a local ref is local-only"
else
  fail "$ref_only commit(s) under local refs are not reachable from remotes"
fi

reflog_only=$(git rev-list --reflog --not --remotes --count)
if [[ "$reflog_only" -eq 0 ]]; then
  pass "no reflog commit is local-only"
else
  fail "$reflog_only reflog commit(s) are not reachable from remotes"
fi

stash_total=0
stash_local_only=0
while IFS='|' read -r stash_ref stash_sha stash_subject; do
  [[ -z "$stash_ref" ]] && continue
  stash_total=$((stash_total + 1))
  remote_refs=$(git for-each-ref --contains "$stash_sha" --format='%(refname:short)' refs/remotes)
  if [[ -z "$remote_refs" ]]; then
    echo "FAIL stash is local-only: $stash_ref $stash_subject"
    stash_local_only=$((stash_local_only + 1))
  fi
done < <(git stash list --format='%gd|%H|%s')

if [[ "$stash_local_only" -eq 0 ]]; then
  pass "all $stash_total stash commit(s) are reachable from remote refs"
else
  failures=$((failures + stash_local_only))
fi

project_untracked=$(git ls-files -o --exclude-standard \
  .agents .claude .codex .cursor .teams \
  docs/workflow/_portable docs/workflow/project AGENTS.md CLAUDE.md)
if [[ -z "$project_untracked" ]]; then
  pass "project Agent/Skill/Workflow sync surface has no untracked files"
else
  fail "project Agent/Skill/Workflow sync surface has untracked files"
  printf '%s\n' "$project_untracked"
fi

if [[ -f apps/web/.env.local ]]; then
  if [[ ! -f apps/web/.env.example ]]; then
    fail "apps/web/.env.local exists but tracked apps/web/.env.example is missing"
  else
    missing_env_keys=$(comm -23 \
      <(sed -E -n 's/^[[:space:]]*(export[[:space:]]+)?([A-Za-z_][A-Za-z0-9_]*)[[:space:]]*=.*/\2/p' apps/web/.env.local | sort -u) \
      <(sed -E -n 's/^[[:space:]]*(export[[:space:]]+)?([A-Za-z_][A-Za-z0-9_]*)[[:space:]]*=.*/\2/p' apps/web/.env.example | sort -u))
    if [[ -z "$missing_env_keys" ]]; then
      pass "apps/web/.env.example covers all local environment variable names"
    else
      fail "apps/web/.env.example is missing variable names from .env.local"
      printf '%s\n' "$missing_env_keys"
    fi
  fi
else
  pass "apps/web/.env.local is absent on this machine; restore it through a secure channel when needed"
fi

if $deep_check; then
  unreachable_commits=$(git fsck --full --unreachable --no-reflogs 2>/dev/null | awk '$2 == "commit" { count++ } END { print count + 0 }')
  if [[ "$unreachable_commits" -eq 0 ]]; then
    pass "deep check found no unreachable commit"
  else
    fail "$unreachable_commits unreachable commit(s) exist only in this object database"
  fi
else
  warn "deep unreachable-commit scan skipped; use --deep for migration or cleanup"
fi

echo "SUMMARY failures=$failures warnings=$warnings"
if [[ "$failures" -ne 0 ]]; then
  exit 1
fi
