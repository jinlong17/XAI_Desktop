#!/usr/bin/env python3
"""Portable-layer sync lint.

Mechanically checks that `docs/workflow/_portable/` stays project-agnostic and
self-consistent, so the workflow paradigm can be copied cleanly into any project.

Seven rules:

  1. Proper-noun leak — `_portable/**` must not contain Any2Knowledge-specific
     nouns (`a2k-`, `features/`, `apps/web`, `Stripe`, `E2B`, `Univer`, `LUMX`,
     `Zeabur`). Exempt: `00-PORTABLE-MANIFEST.md` (its whole job is to map
     placeholders to this repo's actual values) and each file's leading
     `Source:` banner blockquote.
  2. Placeholder registration — every `<lower_snake_case>` placeholder that
     appears anywhere in `_portable/**` must have a registration row in
     `00-PORTABLE-MANIFEST.md` §3.
  3. Template bare paths — `_portable/templates/*.md` must not contain bare
     project paths (`docs/workflow/project/`, `features/<feature>/`,
     `developer.md`, ...). Those must be placeholders.
  4. Template count — `_portable/templates/*.md` (excluding README.md) must
     equal the count declared in `01-workflow-model.md` (default 15).
  5. Template Next Step — every templates/*.md (excluding README.md) must
     contain a "Next Step" token (the Universal Next Step Contract,
     02-handoff-and-state.md §3.3).
  6. Cowork parity — each scripts/cowork/<f> must byte-equal the
     placeholder-substituted render of _portable/scripts/<f> (the 7 hook /
     dispatch / wrapper scripts). Catches drift AND unsubstituted placeholders
     left in the running copies (e.g. a literal `<feature_root>` in a real
     read path). Token map = the migration substitution (manifest §3).
  7. Skill-doc registration — every `_portable/skills/<name>/SKILL.md` must
     have a row in `_portable/usage-guide.md` §10 (a `**<name>**` table cell).
     Same gate shape as rule 2: a new public skill that is not documented in
     the trigger quick-reference fails the lint. Keeps the §10 table (and its
     project-usage-guide mirror) honest as skills are added/removed.

Exit code: 0 = pass, 1 = violations found, 2 = lint could not run.

Usage:
    python3 scripts/lint/check_portable_sync.py
    python3 scripts/lint/check_portable_sync.py --root /path/to/repo
"""

from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]

PORTABLE_DIR = Path("docs/workflow/_portable")
TEMPLATES_DIR = PORTABLE_DIR / "templates"
MANIFEST_REL = PORTABLE_DIR / "00-PORTABLE-MANIFEST.md"
WORKFLOW_MODEL_REL = PORTABLE_DIR / "01-workflow-model.md"

# Rule 1: project-specific proper nouns that must never appear in the portable layer.
# Each entry is a compiled regex; word-boundary anchored where a substring would
# false-positive (E2B/LUMX), path-style otherwise.
PROPER_NOUN_PATTERNS: tuple[tuple[str, re.Pattern[str]], ...] = (
    ("a2k-", re.compile(r"a2k-")),
    ("features/", re.compile(r"features/")),
    ("apps/web", re.compile(r"apps/web")),
    ("Stripe", re.compile(r"\bStripe\b")),
    ("E2B", re.compile(r"\bE2B\b")),
    ("Univer", re.compile(r"\bUniver\b")),
    ("LUMX", re.compile(r"\bLUMX\b")),
    ("Zeabur", re.compile(r"\bZeabur\b")),
)

# Rule 3: bare project paths that must be placeholders inside templates/*.md.
TEMPLATE_BARE_PATH_PATTERNS: tuple[tuple[str, re.Pattern[str]], ...] = (
    ("docs/workflow/project/", re.compile(r"docs/workflow/project/")),
    ("features/<feature>/", re.compile(r"features/<feature(?:_name)?>/")),
    ("docs/reviews/", re.compile(r"docs/reviews/")),
    ("docs/REFACTORING_PLAN.md", re.compile(r"docs/REFACTORING_PLAN\.md")),
    ("docs/FEATURE_MAP.md", re.compile(r"docs/FEATURE_MAP\.md")),
    ("developer.md", re.compile(r"\bdeveloper\.md\b")),
    (".agents/templates/", re.compile(r"\.agents/templates/")),
    (".agents/project_background.md", re.compile(r"\.agents/project_background\.md")),
)

# A `<lower_snake_case>` placeholder. Upper-case / digit forms (<PROJECT_NAME>,
# <YYYYMMDD>, <N>) are a deliberately separate class and are out of scope.
PLACEHOLDER_RE = re.compile(r"<[a-z][a-z0-9_]*>")

# Declared template count in 01-workflow-model.md, e.g. "should have 15 `.md`".
DECLARED_COUNT_RE = re.compile(r"should have (\d+) `\.md`")
DEFAULT_TEMPLATE_COUNT = 15

# Rule 7: every _portable/skills/<name>/ must be documented in the usage-guide
# §10 trigger table. SKILL_DIR holds the public skills; USAGE_GUIDE_REL is the
# canonical doc whose §10 table must carry a `**<name>**` row per skill.
SKILLS_DIR = PORTABLE_DIR / "skills"
USAGE_GUIDE_REL = PORTABLE_DIR / "usage-guide.md"

# Rule 6: scripts/cowork/<f> MUST be the placeholder-substituted instantiation
# of _portable/scripts/<f>. The post-commit hook runs the cowork copies; if they
# drift from (or fail to substitute) the portable source, a migrated project — or
# this one — gets silently-broken hooks (e.g. a literal `<feature_root>` in a
# real read path). The token map below is A2K-concrete, which is fine: this lint
# lives in the project's own scripts/lint/. Keep it equal to the migration
# substitution (00-PORTABLE-MANIFEST §3) for these script tokens.
PORTABLE_SCRIPTS_DIR = PORTABLE_DIR / "scripts"
COWORK_DIR = Path("scripts/cowork")
COWORK_SCRIPT_FILES = (
    "git-post-commit",
    "dispatch_codex.sh",
    "dispatch_cursor.sh",
    "codex_wrapper.sh",
    "cursor_wrapper.sh",
    "lib_phase_verdict.sh",
    "lib_hook_helpers.sh",
)
# XAI_Desktop project token map (per survey plan 2026-05-16 §1).
# Diverges from upstream A2K values: <feature_root> = packages (not features),
# <project_workflow_doc> = docs/workflow/SUBAGENT_WORKFLOW_V2.md (no `project/`
# subdir). Upstream A2K hardcodes the LUMX values; the lint design does not yet
# expose this as a per-project config — track via resync doc-delta checklist
# and consider sending an upstream PR to read from a sibling config file.
COWORK_TOKEN_MAP: tuple[tuple[str, str], ...] = (
    ("<orchestrator_marker_dir>", "/tmp/cw-orchestrator"),
    ("<quota_state_dir>", "/tmp/cw-quota"),
    ("<cowork_scripts_dir>", "scripts/cowork"),
    ("<feature_root>", "packages"),
    ("<review_root>", "docs/reviews"),
    ("<project_workflow_doc>", "docs/workflow/SUBAGENT_WORKFLOW_V2.md"),
)


def _render_portable_script(text: str) -> str:
    for token, concrete in COWORK_TOKEN_MAP:
        text = text.replace(token, concrete)
    return text


def check_cowork_parity(root: Path) -> list[Violation]:
    """scripts/cowork/<f> must byte-equal render(_portable/scripts/<f>)."""
    rule = "COWORK_PARITY"
    violations: list[Violation] = []
    for name in COWORK_SCRIPT_FILES:
        portable = root / PORTABLE_SCRIPTS_DIR / name
        cowork = root / COWORK_DIR / name
        if not portable.is_file():
            violations.append(
                Violation(rule, (PORTABLE_SCRIPTS_DIR / name).as_posix(), None, "portable source script missing")
            )
            continue
        if not cowork.is_file():
            violations.append(
                Violation(
                    rule,
                    (COWORK_DIR / name).as_posix(),
                    None,
                    "instantiated copy missing — copy + de-placeholder from _portable/scripts/",
                )
            )
            continue
        rendered = _render_portable_script(portable.read_text(encoding="utf-8"))
        actual = cowork.read_text(encoding="utf-8")
        if rendered == actual:
            continue
        r_lines = rendered.splitlines()
        a_lines = actual.splitlines()
        lineno = next(
            (
                i + 1
                for i in range(max(len(r_lines), len(a_lines)))
                if (r_lines[i] if i < len(r_lines) else None)
                != (a_lines[i] if i < len(a_lines) else None)
            ),
            None,
        )
        violations.append(
            Violation(
                rule,
                (COWORK_DIR / name).as_posix(),
                lineno,
                f"out of sync with render(_portable/scripts/{name}); regenerate the cowork copy "
                f"by applying the migration token substitution to the portable source",
            )
        )
    return violations


@dataclass(frozen=True)
class Violation:
    rule: str
    path: str
    line: int | None
    message: str

    def render(self) -> str:
        loc = f"{self.path}:{self.line}" if self.line else self.path
        return f"[{self.rule}] {loc}: {self.message}"


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Lint docs/workflow/_portable/ for portability + sync")
    parser.add_argument("--root", type=Path, default=REPO_ROOT, help="Repository root")
    return parser.parse_args(argv)


def portable_markdown_files(root: Path) -> list[Path]:
    base = root / PORTABLE_DIR
    if not base.is_dir():
        return []
    return sorted(p for p in base.rglob("*.md") if p.is_file())


def header_banner_line_count(lines: list[str]) -> int:
    """Number of leading lines that form the file-header `Source:` banner.

    The banner is the contiguous blockquote (`>` lines, blanks allowed between
    them) at the very top of the file, before the first non-blank non-`>` line.
    These lines legitimately reference where project-specific material lives, so
    rule 1 exempts them.
    """
    count = 0
    seen_quote = False
    for line in lines:
        stripped = line.strip()
        if stripped.startswith(">"):
            seen_quote = True
            count += 1
            continue
        if stripped == "" and not seen_quote:
            # leading blank / title lines before the banner starts
            count += 1
            continue
        if stripped == "" and seen_quote:
            # blank line possibly inside the banner; tentatively include, but
            # only keep if a `>` line follows
            count += 1
            continue
        if stripped.startswith("#") and not seen_quote:
            # the H1 title line before the banner
            count += 1
            continue
        break
    # trim trailing blanks that were tentatively included
    while count > 0 and lines[count - 1].strip() == "":
        count -= 1
    return count if seen_quote else 0


def check_proper_nouns(root: Path, files: list[Path]) -> list[Violation]:
    violations: list[Violation] = []
    manifest_abs = root / MANIFEST_REL
    for path in files:
        rel = path.relative_to(root).as_posix()
        if path == manifest_abs:
            # The manifest's whole purpose is mapping placeholders <-> this
            # repo's actual values; it is expected to name them.
            continue
        lines = path.read_text(encoding="utf-8", errors="ignore").splitlines()
        banner = header_banner_line_count(lines)
        for idx, line in enumerate(lines, start=1):
            if idx <= banner:
                continue
            if "Source:" in line:
                # a `Source:` annotation anywhere is an explicit pointer to
                # project material; exempt the line.
                continue
            for label, pattern in PROPER_NOUN_PATTERNS:
                if pattern.search(line):
                    violations.append(
                        Violation(
                            "PORTABLE_PROPER_NOUN_LEAK",
                            rel,
                            idx,
                            f"project-specific noun '{label}' in the portable layer",
                        )
                    )
    return violations


def load_registered_placeholders(root: Path) -> tuple[set[str], Violation | None]:
    manifest = root / MANIFEST_REL
    if not manifest.is_file():
        return set(), Violation(
            "PORTABLE_MANIFEST_MISSING",
            MANIFEST_REL.as_posix(),
            None,
            "00-PORTABLE-MANIFEST.md not found; cannot verify placeholder registration",
        )
    text = manifest.read_text(encoding="utf-8", errors="ignore")
    # A placeholder is "registered" when it appears as `<...>` (backtick-wrapped)
    # anywhere in the manifest — every §3 table cell wraps placeholders in
    # backticks.
    registered = {m.group(0) for m in re.finditer(r"`(<[a-z][a-z0-9_]*>)`", text)}
    # also accept bare (non-backtick) occurrences, defensively
    registered |= set(PLACEHOLDER_RE.findall(text))
    return registered, None


def check_placeholder_registration(root: Path, files: list[Path]) -> list[Violation]:
    registered, err = load_registered_placeholders(root)
    if err:
        return [err]
    violations: list[Violation] = []
    seen: dict[str, tuple[str, int]] = {}
    for path in files:
        rel = path.relative_to(root).as_posix()
        for idx, line in enumerate(path.read_text(encoding="utf-8", errors="ignore").splitlines(), start=1):
            for token in PLACEHOLDER_RE.findall(line):
                if token not in registered and token not in seen:
                    seen[token] = (rel, idx)
    for token, (rel, idx) in sorted(seen.items()):
        violations.append(
            Violation(
                "PORTABLE_PLACEHOLDER_UNREGISTERED",
                rel,
                idx,
                f"placeholder '{token}' is not registered in 00-PORTABLE-MANIFEST.md §3",
            )
        )
    return violations


def check_template_bare_paths(root: Path) -> list[Violation]:
    violations: list[Violation] = []
    base = root / TEMPLATES_DIR
    if not base.is_dir():
        return violations
    for path in sorted(base.glob("*.md")):
        if path.name == "README.md":
            continue
        rel = path.relative_to(root).as_posix()
        for idx, line in enumerate(path.read_text(encoding="utf-8", errors="ignore").splitlines(), start=1):
            for label, pattern in TEMPLATE_BARE_PATH_PATTERNS:
                if pattern.search(line):
                    violations.append(
                        Violation(
                            "PORTABLE_TEMPLATE_BARE_PATH",
                            rel,
                            idx,
                            f"bare project path '{label}' in a template; must be a placeholder",
                        )
                    )
    return violations


def check_template_next_step(root: Path) -> list[Violation]:
    violations: list[Violation] = []
    base = root / TEMPLATES_DIR
    if not base.is_dir():
        return violations
    for path in sorted(base.glob("*.md")):
        if path.name == "README.md":
            continue
        rel = path.relative_to(root).as_posix()
        if "Next Step" not in path.read_text(encoding="utf-8", errors="ignore"):
            violations.append(
                Violation(
                    "PORTABLE_TEMPLATE_NO_NEXT_STEP",
                    rel,
                    None,
                    "template has no 'Next Step' token — violates the Universal Next Step Contract (02 §3.3)",
                )
            )
    return violations


def declared_template_count(root: Path) -> int:
    model = root / WORKFLOW_MODEL_REL
    if not model.is_file():
        return DEFAULT_TEMPLATE_COUNT
    match = DECLARED_COUNT_RE.search(model.read_text(encoding="utf-8", errors="ignore"))
    return int(match.group(1)) if match else DEFAULT_TEMPLATE_COUNT


def check_template_count(root: Path) -> list[Violation]:
    base = root / TEMPLATES_DIR
    if not base.is_dir():
        return [
            Violation(
                "PORTABLE_TEMPLATES_DIR_MISSING",
                TEMPLATES_DIR.as_posix(),
                None,
                "templates/ directory not found",
            )
        ]
    actual = sum(1 for p in base.glob("*.md") if p.name != "README.md")
    expected = declared_template_count(root)
    if actual != expected:
        return [
            Violation(
                "PORTABLE_TEMPLATE_COUNT_MISMATCH",
                TEMPLATES_DIR.as_posix(),
                None,
                f"found {actual} template(s) (excluding README.md); "
                f"01-workflow-model.md declares {expected}",
            )
        ]
    return []


def check_skill_doc_registration(root: Path) -> list[Violation]:
    """Every _portable/skills/<name>/SKILL.md must have a `**<name>**` row in
    _portable/usage-guide.md §10 (same gate shape as rule 2)."""
    rule = "SKILL_DOC_UNREGISTERED"
    skills_dir = root / SKILLS_DIR
    if not skills_dir.is_dir():
        return []  # project opted out of the public-skill bundle
    guide = root / USAGE_GUIDE_REL
    if not guide.is_file():
        return [
            Violation(
                rule,
                USAGE_GUIDE_REL.as_posix(),
                None,
                "usage-guide.md missing but _portable/skills/ present — cannot verify §10 registration",
            )
        ]
    guide_text = guide.read_text(encoding="utf-8")
    violations: list[Violation] = []
    for skill_md in sorted(skills_dir.glob("*/SKILL.md")):
        name = skill_md.parent.name
        if f"**{name}**" not in guide_text:
            violations.append(
                Violation(
                    rule,
                    (SKILLS_DIR / name).as_posix(),
                    None,
                    f"skill '{name}' has no `**{name}**` row in {USAGE_GUIDE_REL.as_posix()} §10 "
                    f"trigger table — add it (and mirror into the project usage-guide §10) in this commit",
                )
            )
    return violations


def run(root: Path) -> tuple[int, list[Violation]]:
    root = root.resolve()
    files = portable_markdown_files(root)
    if not files:
        return 2, [
            Violation(
                "PORTABLE_DIR_EMPTY",
                PORTABLE_DIR.as_posix(),
                None,
                "no markdown files found under docs/workflow/_portable/",
            )
        ]
    violations: list[Violation] = []
    violations.extend(check_proper_nouns(root, files))
    violations.extend(check_placeholder_registration(root, files))
    violations.extend(check_template_bare_paths(root))
    violations.extend(check_template_count(root))
    violations.extend(check_template_next_step(root))
    violations.extend(check_cowork_parity(root))
    violations.extend(check_skill_doc_registration(root))
    code = 1 if violations else 0
    return code, violations


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])
    code, violations = run(args.root)
    if not violations:
        print("check_portable_sync: PASS — docs/workflow/_portable/ is portable and in sync")
        return code
    by_rule: dict[str, int] = {}
    for v in violations:
        by_rule[v.rule] = by_rule.get(v.rule, 0) + 1
        print(v.render())
    summary = ", ".join(f"{rule}={count}" for rule, count in sorted(by_rule.items()))
    print(f"check_portable_sync: FAIL — {len(violations)} violation(s) [{summary}]")
    return code


if __name__ == "__main__":
    raise SystemExit(main())
