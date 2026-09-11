#!/usr/bin/env python3
"""CLI 0.135.0-compatible Spark dispatcher; --check never starts a model or agent."""

import argparse
import json
from pathlib import Path
import subprocess
import sys


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("role", choices=("spark-explorer", "spark-ui-fixer"))
    parser.add_argument("--check", action="store_true", help="Validate CLI configuration only")
    parser.add_argument("--cwd", type=Path, default=Path.cwd())
    parser.add_argument("--prompt-file", type=Path, help="Parent-approved scope and acceptance contract")
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[2]
    role_file = root / ".codex" / "agents" / (args.role + ".toml")
    if not role_file.is_file() or not args.cwd.is_dir():
        parser.error("Role file and working directory must exist")
    config = {
        "model_reasoning_effort": "medium",
        "agents.max_depth": 1,
        "features.image_generation": False,
        "features.multi_agent_v2.enabled": True,
        "features.multi_agent_v2.max_concurrent_threads_per_session": 4,
        "agents." + args.role + ".description": "Bounded Spark specialist with independent review",
        "agents." + args.role + ".config_file": str(role_file),
    }
    command = ["codex"]
    for key, value in config.items():
        command += ["-c", key + "=" + json.dumps(value)]
    if args.check:
        command += ["features", "list"]
        result = subprocess.run(command, cwd=args.cwd, capture_output=True, text=True)
        if result.returncode:
            sys.stderr.write(result.stderr)
        else:
            print(args.role + ": CLI configuration accepted (no model or child launched)")
        return result.returncode
    if args.prompt_file is None:
        parser.error("--prompt-file is required unless --check is used")
    contract = args.prompt_file.read_text()
    if not contract.strip():
        parser.error("The parent-approved contract must not be empty")
    spawn_args = {"agent_type": args.role, "fork_turns": "none", "message": contract}
    prompt = (
        "You are the dispatcher only. Call spawn_agent exactly once with the JSON "
        "arguments below. Its message must contain ONLY the supplied contract string, "
        "not this dispatcher prompt, the JSON wrapper, or any instruction to spawn. "
        "Then wait for that child and report its identity, result and any failure. "
        "Do not implement the contract, delegate again, retry a failed launch, commit, "
        "push or publish. The child must execute the contract directly without delegation.\n"
        + json.dumps(spawn_args, ensure_ascii=False)
    )
    sandbox = "read-only" if args.role == "spark-explorer" else "workspace-write"
    # Persist sessions: --ephemeral breaks named-child parent lookup on CLI 0.135.0.
    command += ["exec", "--json", "-m", "gpt-5.3-codex-spark", "-s", sandbox, prompt]
    return subprocess.run(command, cwd=args.cwd).returncode


if __name__ == "__main__":
    sys.exit(main())
