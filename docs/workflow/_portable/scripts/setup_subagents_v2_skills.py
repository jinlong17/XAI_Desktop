#!/usr/bin/env python3
"""Public-skill bundle for setup_subagents_v2 (opt-in via --include-skills).

This submodule holds the skill shim parser, three per-vendor skill renderers,
and the namespace-guarded write helper. It is imported by setup_subagents_v2.py
when the user passes --include-skills. Keeping it here prevents the main script
from breaching the §9.4 single-file LOC budget while preserving the shared
Template / parse_template / write_file / toml_multiline / codex_output_dir API
from the main module.

Public-skill shims live at SKILLS_DIR/<name>/SKILL.md (frontmatter: name,
description, upstream, license, vendor_card). Renderers are pure
((Template) -> (Path, str)); only write_skill touches the filesystem, and it
enforces the `skill-` namespace prefix at the write boundary so a corrupted
shim or path-traversal mishap cannot land outside the namespace.
"""
from __future__ import annotations

from pathlib import Path
from typing import Iterable

SKILL_NS = "skill-"


def _resolve_vendor_card(rel: str, root: Path) -> bool:
    return (root / rel).exists() or Path(rel).exists() or (root.parent.parent.parent / rel).exists()


def parse_skill_shim(path: Path, background: str, parse_template, Template, root: Path):
    """Parse a SKILL.md shim. Raises if `description:` or `vendor_card:` missing,
    or if the vendor card file cannot be resolved against ROOT, CWD, or
    <repo_root> (the portable-reference ROOT is `_portable/`, so the repo root
    is three levels up).
    """
    tmpl = parse_template(path, background)
    if not tmpl.description:
        raise ValueError(f"Skill shim missing description: {path}")
    raw_fm = path.read_text(encoding="utf-8").split("\n---\n", 1)[0]
    fm_lines = [ln for ln in raw_fm.splitlines() if ":" in ln]
    fm = {ln.split(":", 1)[0].strip(): ln.split(":", 1)[1].strip().strip('"') for ln in fm_lines}
    vendor_card = fm.get("vendor_card", "")
    if not vendor_card:
        raise ValueError(f"Skill shim missing vendor_card: {path}")
    if not _resolve_vendor_card(vendor_card, root):
        raise ValueError(f"Skill shim {path.name} references missing vendor card: {vendor_card}")
    return Template(
        name=tmpl.name, description=tmpl.description, model=tmpl.model,
        allowed_tools="", color="", codex_sandbox_mode="read-only",
        cursor_readonly=True, cursor_is_background=False, body=tmpl.body, path=path,
    )


def load_skills(skills_dir: Path, background: str, parse_template, Template, root: Path) -> Iterable:
    if not skills_dir.exists():
        return []
    return [
        parse_skill_shim(d / "SKILL.md", background, parse_template, Template, root)
        for d in sorted(skills_dir.iterdir())
        if d.is_dir() and (d / "SKILL.md").is_file()
    ]


def render_skill_claude(template, root: Path) -> tuple[Path, str]:
    path = root / ".claude" / "skills" / f"{SKILL_NS}{template.name}" / "SKILL.md"
    body = f"---\nname: {template.name}\ndescription: {template.description}\n---\n\n{template.body}"
    return path, body


def render_skill_codex(template, codex_dir: Path, model: str, toml_multiline, toml_string) -> tuple[Path, str]:
    path = codex_dir / f"{SKILL_NS}{template.name}.toml"
    body_stripped = template.body.strip() + "\n"
    lines = [
        f"name = {toml_string(template.name)}",
        f"description = {toml_string(template.description)}",
        'sandbox_mode = "read-only"',
        f"model = {toml_string(model)}",
        'model_reasoning_effort = "high"',
        f"developer_instructions = {toml_multiline(body_stripped)}",
    ]
    return path, "\n".join(lines) + "\n"


def render_skill_cursor(template, root: Path) -> tuple[Path, str]:
    path = root / ".cursor" / "rules" / f"{SKILL_NS}{template.name}.mdc"
    body = f"---\ndescription: {template.description}\nalwaysApply: false\n---\n\n{template.body}"
    return path, body


def write_skill(path: Path, content: str, force: bool, dry_run: bool, write_file) -> str:
    """write_file + namespace guard. Returns 'blocked-namespace' if the output
    path falls outside the `skill-` namespace (parent folder for Claude,
    filename for Codex/Cursor).
    """
    fname = path.name
    parent = path.parent.name
    if path.suffix == ".md" and fname == "SKILL.md" and not parent.startswith(SKILL_NS):
        return "blocked-namespace"
    if path.suffix in (".toml", ".mdc") and not fname.startswith(SKILL_NS):
        return "blocked-namespace"
    return write_file(path, content, force=force, dry_run=dry_run)
