#!/usr/bin/env python3
"""Generate Workflow V2 subagent configs for Claude Code, Codex, and Cursor.

============================================================================
PORTABLE REFERENCE SCRIPT — read this header before copying into a new project
============================================================================
This is the bundled reference implementation of the generation script spec in
`README.md` (this folder) and `../01-workflow-model.md` §10. It is a *working*
script, not a placeholder template — copy it verbatim, then adjust the marked
constants below. Do NOT `<placeholder>`-ize it; placeholders would break Python.

To migrate into a new project:
  1. Copy this file to `<repo>/scripts/setup_subagents_v2.py` (and the thin
     `setup_subagents_v2.sh` bash→python3 wrapper alongside it, if you use one).
     `ROOT = Path(__file__).resolve().parent.parent` then resolves to the repo
     root automatically — so placement at `<repo>/scripts/` is the only path
     assumption. If you place it elsewhere, fix ROOT.
  2. Review the four PROJECT-SPECIFIC CONSTANTS marked `# >>> ADJUST` below:
       - TEMPLATES_DIR      — where the unified template source lives
       - BACKGROUND_FILE    — the project background injected into every agent
       - CLAUDE_MODEL_MAP   — per-project model tiering policy for Claude
       - CURSOR_MODEL_MAP   — per-project model policy for Cursor
       - CODEX_STRONG_MODEL / CODEX_FAST_MODEL — Codex model slug(s)
  3. Everything else (arg parsing, frontmatter parse, renderers, write/backup
     logic, codex config bootstrap) is project-agnostic — leave it alone.

The migration skill (`../00-PORTABLE-MANIFEST.md` appendix, `instantiate` mode)
automates step 1 and prompts for step 2.
============================================================================

Format compliance (see `../02-handoff-and-state.md` and `../01-workflow-model.md` §10):
- Claude Code: .md with YAML frontmatter (name, description, tools, model, color)
- Codex: .toml (name, description, sandbox_mode, model, model_reasoning_effort,
  developer_instructions); global config in .codex/config.toml
- Cursor: .md with YAML frontmatter (name, description, model, readonly,
  is_background). Values: inherit / fast / model-id.

Templates are the single source of truth. Per-platform field mappings are
declared in each template's frontmatter via `allowed_tools`, `color`,
`codex_sandbox_mode`, `cursor_readonly`, `cursor_is_background`.
"""
from __future__ import annotations

import argparse
import shutil
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Dict, Iterable


ROOT = Path(__file__).resolve().parent.parent

# >>> ADJUST (1/2): template source + project background location.
# These assume the project keeps its instantiated templates and background file
# under `<repo>/.agents/`. If your project lays them out differently, repoint.
TEMPLATES_DIR = ROOT / ".agents" / "templates"
BACKGROUND_FILE = ROOT / ".agents" / "project_background.md"

# -----------------------------------------------------------------------------
# Model slug maps — update these when platform model names change.
# >>> ADJUST (2/2): per-project model tiering policy. The values below are the
# reference project's decision (2026-05-14); a new project may keep or change
# them, but the *structure* (three maps + two Codex constants) must stay so the
# renderers below keep working.
# -----------------------------------------------------------------------------

# Claude Code accepts short aliases (`opus`, `sonnet`, `haiku`), full model IDs,
# or `inherit`. Reference project uses aliases so agents always track the CLI's
# current registry and don't break when a model ID is renamed or a new release
# ships. Source: https://code.claude.com/docs/en/sub-agents (model field).
CLAUDE_MODEL_MAP = {
    "opus": "opus",
    "sonnet": "sonnet",
    "haiku": "haiku",
}

# Cursor accepts `inherit` / `fast` / explicit model ID.
# Reference-project decision (2026-05-14): all Cursor agents use `inherit` — they
# follow the IDE's model picker rather than pinning a per-agent model. No tier split.
CURSOR_MODEL_MAP = {
    "opus": "inherit",
    "sonnet": "inherit",
    "haiku": "inherit",
}

# Codex model slug. Reference-project decision (2026-05-14): a single flat model
# for all Codex agents — no strong/fast tiering. STRONG and FAST are kept as
# separate constants only so render_codex() stays structurally uniform; both
# point to the same id. Update at developers.openai.com/codex when the model
# lineup changes.
CODEX_STRONG_MODEL = "gpt-5.5"
CODEX_FAST_MODEL = "gpt-5.5"


# -----------------------------------------------------------------------------
# Codex global config. Written once to .codex/config.toml if it does not exist.
# -----------------------------------------------------------------------------

CODEX_CONFIG_TEMPLATE = """\
# Codex global agent configuration.
# Docs: https://developers.openai.com/codex (search: agents.max_depth)

[agents]
# max_depth = 2 lets feature-dev-loop / bugfix-loop spawn one level of workers.
# feature-auto-build / bug-auto-fix are direct writable workers and do not require nested spawn.
# Without this, orchestrator subagents cannot spawn feature-auto-build / bug-auto-fix.
max_depth = 2
max_threads = 4
job_max_runtime_seconds = 1800
"""


@dataclass
class Template:
    name: str
    description: str
    model: str                    # abstract tier: opus | sonnet | haiku
    allowed_tools: str            # comma-separated; empty = inherit all (Claude)
    color: str                    # Claude terminal color; empty = unset
    codex_sandbox_mode: str       # read-only | workspace-write | danger-full-access
    cursor_readonly: bool
    cursor_is_background: bool
    body: str
    path: Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate Workflow V2 subagent configs for Claude Code, Codex, and Cursor."
    )
    parser.add_argument(
        "--targets",
        default="claude,codex,cursor",
        help="Comma-separated targets: claude,codex,cursor",
    )
    parser.add_argument(
        "--replace-claude",
        action="store_true",
        help="Write Claude agents directly into .claude/agents instead of .claude/agents-v2.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite existing generated files. Existing files will be backed up before overwrite.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print planned output paths without writing files.",
    )
    return parser.parse_args()


def load_background() -> str:
    if not BACKGROUND_FILE.exists():
        raise FileNotFoundError(f"Missing project background file: {BACKGROUND_FILE}")
    return BACKGROUND_FILE.read_text(encoding="utf-8").strip()


def _parse_bool(value: str) -> bool:
    return value.strip().lower() in ("true", "yes", "1")


def parse_template(path: Path, background: str) -> Template:
    raw = path.read_text(encoding="utf-8")
    if not raw.startswith("---\n"):
        raise ValueError(f"Template missing frontmatter: {path}")
    _, rest = raw.split("---\n", 1)
    frontmatter_text, body = rest.split("\n---\n", 1)
    frontmatter: Dict[str, str] = {}
    for line in frontmatter_text.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        key, value = line.split(":", 1)
        frontmatter[key.strip()] = value.strip().strip('"')
    injected_body = body.replace("<!-- INJECT:PROJECT_BACKGROUND -->", background)
    return Template(
        name=frontmatter["name"],
        description=frontmatter["description"],
        model=frontmatter.get("model", "sonnet"),
        allowed_tools=frontmatter.get("allowed_tools", ""),
        color=frontmatter.get("color", ""),
        codex_sandbox_mode=frontmatter.get("codex_sandbox_mode", "workspace-write"),
        cursor_readonly=_parse_bool(frontmatter.get("cursor_readonly", "false")),
        cursor_is_background=_parse_bool(frontmatter.get("cursor_is_background", "false")),
        body=injected_body.strip() + "\n",
        path=path,
    )


def load_templates(background: str) -> Iterable[Template]:
    for path in sorted(TEMPLATES_DIR.glob("*.md")):
        if path.name == "README.md":
            continue
        yield parse_template(path, background)


def claude_output_dir(replace_claude: bool) -> Path:
    return ROOT / ".claude" / ("agents" if replace_claude else "agents-v2")


def cursor_output_dir() -> Path:
    return ROOT / ".cursor" / "agents"


def codex_output_dir() -> Path:
    return ROOT / ".codex" / "agents"


def ensure_dir(path: Path, dry_run: bool) -> None:
    if dry_run:
        return
    path.mkdir(parents=True, exist_ok=True)


def backup_existing(path: Path, dry_run: bool) -> None:
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_dir = path.parent.parent / f"{path.parent.name}-backup-{timestamp}"
    backup_path = backup_dir / path.name
    if dry_run:
        return
    backup_dir.mkdir(parents=True, exist_ok=True)
    shutil.copy2(path, backup_path)


def write_file(path: Path, content: str, force: bool, dry_run: bool) -> str:
    if path.exists():
        existing = path.read_text(encoding="utf-8")
        if existing == content:
            return "unchanged"
        if not force:
            return "skipped"
        backup_existing(path, dry_run)
    if dry_run:
        return "planned"
    path.write_text(content, encoding="utf-8")
    return "written"


# -----------------------------------------------------------------------------
# Renderers
# -----------------------------------------------------------------------------


def render_claude(template: Template) -> str:
    model_slug = CLAUDE_MODEL_MAP.get(template.model, template.model)
    lines = [
        "---",
        f"name: {template.name}",
        f"description: {template.description}",
    ]
    if template.allowed_tools:
        lines.append(f"tools: {template.allowed_tools}")
    lines.append(f"model: {model_slug}")
    if template.color:
        lines.append(f"color: {template.color}")
    lines.append("---")
    return "\n".join(lines) + "\n\n" + template.body


def toml_multiline(value: str) -> str:
    escaped = value.replace("'''", "\\'\\'\\'")
    return f"'''\n{escaped}'''"


def render_codex(template: Template) -> str:
    model = CODEX_STRONG_MODEL if template.model == "opus" else CODEX_FAST_MODEL
    # Reference-project decision (2026-05-14): flat "high" reasoning for all Codex
    # agents — no tiering, consistent with the flat-model decision above.
    reasoning = "high"
    body_stripped = template.body.strip() + "\n"
    lines = [
        f'name = "{template.name}"',
        f'description = "{template.description}"',
        f'sandbox_mode = "{template.codex_sandbox_mode}"',
        f'model = "{model}"',
        f'model_reasoning_effort = "{reasoning}"',
        f"developer_instructions = {toml_multiline(body_stripped)}",
    ]
    return "\n".join(lines) + "\n"


def render_cursor(template: Template) -> str:
    model_slug = CURSOR_MODEL_MAP.get(template.model, "inherit")
    lines = [
        "---",
        f"name: {template.name}",
        f"description: {template.description}",
        f"model: {model_slug}",
    ]
    if template.cursor_readonly:
        lines.append("readonly: true")
    if template.cursor_is_background:
        lines.append("is_background: true")
    lines.append("---")
    return "\n".join(lines) + "\n\n" + template.body


def target_paths(template: Template, replace_claude: bool) -> Dict[str, Path]:
    return {
        "claude": claude_output_dir(replace_claude) / f"{template.name}.md",
        "codex": codex_output_dir() / f"{template.name}.toml",
        "cursor": cursor_output_dir() / f"{template.name}.md",
    }


def ensure_codex_config(dry_run: bool, force: bool) -> str:
    config_path = ROOT / ".codex" / "config.toml"
    if config_path.exists():
        existing = config_path.read_text(encoding="utf-8")
        if existing == CODEX_CONFIG_TEMPLATE:
            return "unchanged"
        if not force:
            return "skipped"
        backup_existing(config_path, dry_run)
    if dry_run:
        return "planned"
    config_path.parent.mkdir(parents=True, exist_ok=True)
    config_path.write_text(CODEX_CONFIG_TEMPLATE, encoding="utf-8")
    return "written"


def main() -> int:
    args = parse_args()
    targets = {item.strip() for item in args.targets.split(",") if item.strip()}
    valid_targets = {"claude", "codex", "cursor"}
    unknown = targets - valid_targets
    if unknown:
        raise SystemExit(f"Unknown targets: {', '.join(sorted(unknown))}")

    background = load_background()
    templates = list(load_templates(background))

    renderers = {
        "claude": render_claude,
        "codex": render_codex,
        "cursor": render_cursor,
    }
    output_dirs = {
        "claude": claude_output_dir(args.replace_claude),
        "codex": codex_output_dir(),
        "cursor": cursor_output_dir(),
    }

    for target in targets:
        ensure_dir(output_dirs[target], args.dry_run)

    rows = []
    for template in templates:
        paths = target_paths(template, args.replace_claude)
        for target in sorted(targets):
            content = renderers[target](template)
            status = write_file(paths[target], content, force=args.force, dry_run=args.dry_run)
            rows.append((target, template.name, str(paths[target].relative_to(ROOT)), status))

    if "codex" in targets:
        status = ensure_codex_config(args.dry_run, args.force)
        rows.append(("codex", "_config", ".codex/config.toml", status))

    print("Generated Workflow V2 subagent configs:")
    for target, name, rel_path, status in rows:
        print(f"- [{target}] {name}: {rel_path} ({status})")

    if not args.replace_claude and "claude" in targets:
        print(
            "\nClaude output defaulted to .claude/agents-v2 to avoid overwriting the existing V1 agents.\n"
            "Use --replace-claude to install directly into .claude/agents."
        )

    if "cursor" in targets:
        print(
            "\nCursor configs include readonly/is_background flags; verify in your local setup."
        )

    if "codex" in targets:
        print(
            f"\nCodex model slugs: strong={CODEX_STRONG_MODEL}, fast={CODEX_FAST_MODEL}.\n"
            f"Update CODEX_STRONG_MODEL / CODEX_FAST_MODEL at the top of this script\n"
            f"when Codex model lineup changes."
        )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
