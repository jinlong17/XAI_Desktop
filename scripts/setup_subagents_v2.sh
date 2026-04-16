#!/usr/bin/env bash
#
# setup_subagents_v2.sh — Generate subagent configs for Claude Code, Codex, and Cursor
# from unified templates in .agents/templates/ + .agents/project_background.md
#
# Usage:
#   ./scripts/setup_subagents_v2.sh                          # Safe mode (Claude → agents-v2/)
#   ./scripts/setup_subagents_v2.sh --targets claude,codex,cursor
#   ./scripts/setup_subagents_v2.sh --replace-claude          # Overwrite .claude/agents/
#   ./scripts/setup_subagents_v2.sh --replace-claude --force  # No backup prompt
#   ./scripts/setup_subagents_v2.sh --dry-run                 # Preview only
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

TEMPLATES_DIR="$REPO_ROOT/.agents/templates"
BACKGROUND_FILE="$REPO_ROOT/.agents/project_background.md"

# ─── Platform model constants ─────────────────────────────────────────────────

CLAUDE_OPUS="claude-opus-4-7"
CLAUDE_SONNET="claude-sonnet-4-6"
CLAUDE_HAIKU="claude-haiku-4-5-20251001"

CODEX_STRONG_MODEL="gpt-5.4"
CODEX_FAST_MODEL="gpt-5.3-codex"

# ─── Defaults ──────────────────────────────────────────────────────────────────

TARGETS="claude,codex,cursor"
REPLACE_CLAUDE=false
FORCE=false
DRY_RUN=false

CLAUDE_SAFE_DIR="$REPO_ROOT/.claude/agents-v2"
CLAUDE_ACTIVE_DIR="$REPO_ROOT/.claude/agents"
CODEX_DIR="$REPO_ROOT/.codex/agents"
CODEX_CONFIG="$REPO_ROOT/.codex/config.toml"
CURSOR_DIR="$REPO_ROOT/.cursor/agents"

# ─── Model mapping helpers ─────────────────────────────────────────────────────

claude_model_map() {
  case "$1" in
    opus)   echo "$CLAUDE_OPUS" ;;
    sonnet) echo "$CLAUDE_SONNET" ;;
    haiku)  echo "$CLAUDE_HAIKU" ;;
    *)      echo "$CLAUDE_OPUS" ;;
  esac
}

codex_model_map() {
  case "$1" in
    opus)   echo "$CODEX_STRONG_MODEL" ;;
    sonnet) echo "$CODEX_FAST_MODEL" ;;
    haiku)  echo "$CODEX_FAST_MODEL" ;;
    *)      echo "$CODEX_STRONG_MODEL" ;;
  esac
}

codex_reasoning_effort() {
  case "$1" in
    opus)   echo "high" ;;
    sonnet) echo "medium" ;;
    haiku)  echo "medium" ;;
    *)      echo "medium" ;;
  esac
}

cursor_model_map() {
  case "$1" in
    opus)   echo "inherit" ;;
    sonnet) echo "fast" ;;
    haiku)  echo "fast" ;;
    *)      echo "inherit" ;;
  esac
}

# ─── Parse arguments ───────────────────────────────────────────────────────────

while [[ $# -gt 0 ]]; do
  case "$1" in
    --targets)       TARGETS="$2"; shift 2 ;;
    --replace-claude) REPLACE_CLAUDE=true; shift ;;
    --force)         FORCE=true; shift ;;
    --dry-run)       DRY_RUN=true; shift ;;
    -h|--help)
      echo "Usage: $0 [--targets claude,codex,cursor] [--replace-claude] [--force] [--dry-run]"
      exit 0 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# ─── Validate inputs ──────────────────────────────────────────────────────────

if [[ ! -d "$TEMPLATES_DIR" ]]; then
  echo "ERROR: Templates directory not found: $TEMPLATES_DIR"
  exit 1
fi

if [[ ! -f "$BACKGROUND_FILE" ]]; then
  echo "ERROR: Project background file not found: $BACKGROUND_FILE"
  exit 1
fi

TEMPLATE_FILES=("$TEMPLATES_DIR"/*.md)

if [[ ${#TEMPLATE_FILES[@]} -eq 0 ]]; then
  echo "ERROR: No template files found in $TEMPLATES_DIR"
  exit 1
fi

echo "=== Subagent V2 Generator ==="
echo "Templates:  ${#TEMPLATE_FILES[@]} files in $TEMPLATES_DIR"
echo "Targets:    $TARGETS"
echo "Replace Claude active: $REPLACE_CLAUDE"
echo "Dry run:    $DRY_RUN"
echo ""

# ─── Helper: parse YAML frontmatter fields ────────────────────────────────────

parse_field() {
  local file="$1" field="$2"
  sed -n '/^---$/,/^---$/p' "$file" | { grep "^${field}:" || true; } | head -1 | sed "s/^${field}:[[:space:]]*//" | sed 's/^"//' | sed 's/"$//'
}

extract_body() {
  local file="$1"
  awk 'BEGIN{c=0} /^---$/{c++; next} c>=2{print}' "$file"
}

# Inject project background into a file using sed (avoids bash special char issues)
inject_background() {
  local target_file="$1"
  local bg_file="$2"
  # Use awk to replace the placeholder with file contents
  awk -v bg_file="$bg_file" '
    /<!-- INJECT:PROJECT_BACKGROUND -->/ {
      while ((getline line < bg_file) > 0) print line
      close(bg_file)
      next
    }
    { print }
  ' "$target_file"
}

# ─── Generate: Claude Code (.md with expanded frontmatter) ────────────────────

generate_claude() {
  local out_dir
  if [[ "$REPLACE_CLAUDE" == true ]]; then
    out_dir="$CLAUDE_ACTIVE_DIR"
    if [[ "$FORCE" != true && "$DRY_RUN" != true && -d "$out_dir" ]]; then
      local backup_dir="${out_dir}.backup.$(date +%Y%m%d%H%M%S)"
      echo "  Backing up existing agents → $backup_dir"
      cp -r "$out_dir" "$backup_dir"
    fi
  else
    out_dir="$CLAUDE_SAFE_DIR"
  fi

  if [[ "$DRY_RUN" != true ]]; then
    mkdir -p "$out_dir"
  fi

  local count=0
  for tmpl in "${TEMPLATE_FILES[@]}"; do
    local fname
    fname="$(basename "$tmpl")"
    local name desc model_tier allowed_tools color
    name="$(parse_field "$tmpl" "name")"
    desc="$(parse_field "$tmpl" "description")"
    model_tier="$(parse_field "$tmpl" "model")"
    allowed_tools="$(parse_field "$tmpl" "allowed_tools")"
    color="$(parse_field "$tmpl" "color")"

    local claude_model
    claude_model="$(claude_model_map "$model_tier")"

    local out_file="$out_dir/$fname"

    if [[ "$DRY_RUN" == true ]]; then
      echo "  [dry-run] Would write: $out_file"
    else
      # Write frontmatter
      {
        echo "---"
        echo "name: $name"
        echo "description: \"$desc\""
        echo "model: $claude_model"
        if [[ -n "$allowed_tools" ]]; then
          echo "tools: $allowed_tools"
        fi
        if [[ -n "$color" ]]; then
          echo "color: $color"
        fi
        echo "---"
      } > "$out_file"

      # Append body from template (everything after second ---)
      extract_body "$tmpl" >> "$out_file"

      # Inject project background
      local tmp_file="${out_file}.tmp"
      inject_background "$out_file" "$BACKGROUND_FILE" > "$tmp_file"
      mv "$tmp_file" "$out_file"

      echo "  Written: $out_file"
    fi
    ((count++))
  done
  echo "  Claude: $count agents → $out_dir"
}

# ─── Generate: Codex (.toml with sandbox_mode) ────────────────────────────────

generate_codex() {
  if [[ "$DRY_RUN" != true ]]; then
    mkdir -p "$CODEX_DIR"
    mkdir -p "$(dirname "$CODEX_CONFIG")"
  fi

  # Generate .codex/config.toml if it doesn't exist
  if [[ ! -f "$CODEX_CONFIG" ]]; then
    if [[ "$DRY_RUN" == true ]]; then
      echo "  [dry-run] Would create: $CODEX_CONFIG"
    else
      cat > "$CODEX_CONFIG" << 'CONFIGEOF'
[agents]
max_depth = 2
max_threads = 4
job_max_runtime_seconds = 1800
CONFIGEOF
      echo "  Created: $CODEX_CONFIG"
    fi
  else
    echo "  Exists: $CODEX_CONFIG (skipping)"
  fi

  local count=0
  for tmpl in "${TEMPLATE_FILES[@]}"; do
    local basename_md
    basename_md="$(basename "$tmpl" .md)"
    local name desc model_tier codex_sandbox codex_model reasoning

    name="$(parse_field "$tmpl" "name")"
    desc="$(parse_field "$tmpl" "description")"
    model_tier="$(parse_field "$tmpl" "model")"
    codex_sandbox="$(parse_field "$tmpl" "codex_sandbox_mode")"
    codex_model="$(codex_model_map "$model_tier")"
    reasoning="$(codex_reasoning_effort "$model_tier")"

    local out_file="$CODEX_DIR/${basename_md}.toml"

    if [[ "$DRY_RUN" == true ]]; then
      echo "  [dry-run] Would write: $out_file"
    else
      # Write TOML header
      {
        echo "[agent]"
        echo "name = \"$name\""
        echo "description = \"$desc\""
        echo "model = \"$codex_model\""
        echo "model_reasoning_effort = \"$reasoning\""
        if [[ -n "$codex_sandbox" ]]; then
          echo "sandbox_mode = \"$codex_sandbox\""
        fi
        echo ""
        echo "[agent.instructions]"
        echo 'developer_instructions = """'
      } > "$out_file"

      # Append body
      extract_body "$tmpl" >> "$out_file"

      # Close triple-quote
      echo '"""' >> "$out_file"

      # Inject project background
      local tmp_file="${out_file}.tmp"
      inject_background "$out_file" "$BACKGROUND_FILE" > "$tmp_file"
      mv "$tmp_file" "$out_file"

      echo "  Written: $out_file"
    fi
    ((count++))
  done
  echo "  Codex: $count agents → $CODEX_DIR"
}

# ─── Generate: Cursor (.md with readonly/is_background/model expanded) ────────

generate_cursor() {
  if [[ "$DRY_RUN" != true ]]; then
    mkdir -p "$CURSOR_DIR"
  fi

  local count=0
  for tmpl in "${TEMPLATE_FILES[@]}"; do
    local fname
    fname="$(basename "$tmpl")"
    local name desc model_tier cursor_readonly cursor_is_bg
    name="$(parse_field "$tmpl" "name")"
    desc="$(parse_field "$tmpl" "description")"
    model_tier="$(parse_field "$tmpl" "model")"
    cursor_readonly="$(parse_field "$tmpl" "cursor_readonly")"
    cursor_is_bg="$(parse_field "$tmpl" "cursor_is_background")"

    local cursor_model
    cursor_model="$(cursor_model_map "$model_tier")"

    local out_file="$CURSOR_DIR/$fname"

    if [[ "$DRY_RUN" == true ]]; then
      echo "  [dry-run] Would write: $out_file"
    else
      # Write frontmatter
      {
        echo "---"
        echo "name: $name"
        echo "description: \"$desc\""
        echo "model: $cursor_model"
        if [[ "$cursor_readonly" == "true" ]]; then
          echo "readonly: true"
        fi
        if [[ "$cursor_is_bg" == "true" ]]; then
          echo "is_background: true"
        fi
        echo "---"
      } > "$out_file"

      # Append body
      extract_body "$tmpl" >> "$out_file"

      # Inject project background
      local tmp_file="${out_file}.tmp"
      inject_background "$out_file" "$BACKGROUND_FILE" > "$tmp_file"
      mv "$tmp_file" "$out_file"

      echo "  Written: $out_file"
    fi
    ((count++))
  done
  echo "  Cursor: $count agents → $CURSOR_DIR"
}

# ─── Main ─────────────────────────────────────────────────────────────────────

IFS=',' read -ra TARGET_ARRAY <<< "$TARGETS"

for target in "${TARGET_ARRAY[@]}"; do
  target="$(echo "$target" | xargs)"
  echo ""
  echo "--- Generating: $target ---"
  case "$target" in
    claude) generate_claude ;;
    codex)  generate_codex ;;
    cursor) generate_cursor ;;
    *)      echo "  Unknown target: $target (skipped)" ;;
  esac
done

echo ""
echo "=== Generation Summary ==="
echo "Templates processed: ${#TEMPLATE_FILES[@]}"
echo "Targets: $TARGETS"
if [[ "$DRY_RUN" == true ]]; then
  echo "Mode: DRY RUN (no files written)"
else
  echo "Mode: LIVE"
fi

echo ""
echo "=== Post-Generation Checklist ==="
echo "  [ ] Claude model fields are full IDs (claude-opus-4-7 / claude-sonnet-4-6), NOT opus/sonnet"
echo "  [ ] Claude review/verify agents have tools WITHOUT Write/Edit/Bash"
echo "  [ ] Claude loop agents have NO tools: line (inherits all)"
echo "  [ ] Codex review/verify agents have sandbox_mode = \"read-only\""
echo "  [ ] Codex .codex/config.toml exists with [agents] max_depth = 2"
echo "  [ ] Cursor model fields are inherit/fast, NOT auto"
echo "  [ ] Cursor review/verify agents have readonly: true"
echo "  [ ] Cursor loop agents have is_background: true"
echo "  [ ] All descriptions start with a verb (Use ...)"
echo "  [ ] <!-- INJECT:PROJECT_BACKGROUND --> fully replaced"
echo "  [ ] ship retains READY_TO_SHIP gate"
echo "  [ ] feature-build retains 'one phase per run' constraint"
echo ""
echo "Done."
