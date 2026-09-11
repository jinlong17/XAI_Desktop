# Spark specialist runtime verification — 2026-09-11

Scope: web audit tooling. Product code and global model mapping unchanged.

## Result

- Both specialist TOMLs parse with Python 3.11 tomllib; exact model is gpt-5.3-codex-spark, medium. Explorer read-only; UI workspace-write. Existing limits remain 2/4/1800.
- Independent Astra reviewed role boundaries and registration. Parent independently checked exact UI fixture bytes: only 32px became 44px; color and newline preserved.
- Actual **named** explorer and UI subagents completed using Spark medium. `role-model-evidence.json` extracts exact spawn agent_type and child turn_context from local runtime records. Success logs contain child IDs/results. Neither the fallback fixture run nor direct-model smoke is counted as named-role success.
- Explorer smoke reads one configuration field; it does not establish broad code-search quality. UI smoke is an isolated CSS fixture, not a visual product review.

## Compatibility findings

CLI is 0.135.0. Default image_generation produced HTTP 400 for Spark; disabling it produced SPARK_MODEL_SMOKE_OK. Both role files therefore disable that tool.

Current app built-in agent interface does not expose Spark. This verification uses local CLI and does not hot-reload the app tool schema.

CLI needed --enable multi_agent_v2 and persisted sessions. Ephemeral delegation failed to find its parent thread. Project-only automatic discovery still returned unknown agent_type even after explicit project registrations; do not claim automatic discovery works on this installation. Explicit per-invocation registrations succeeded. No global config, auth, CLI version, or trust settings were changed.

Astra CLI probe was rejected as requiring a newer client. Parent reviewer here is the existing Astra app session; the compatibility CLI dispatcher used Spark only to forward the already-defined smoke contract, not to make architecture or final acceptance decisions.

## Reproducible invocation

From repository root (use a bounded prompt; the prompt must specify exact agent_type and fork_turns none):

```sh
codex exec --json -m gpt-5.3-codex-spark -s read-only \
  --disable image_generation --enable multi_agent_v2 \
  -c 'model_reasoning_effort="medium"' \
  -c 'agents.spark-explorer.description="Read-only Spark explorer"' \
  -c "agents.spark-explorer.config_file=\"$PWD/.codex/agents/spark-explorer.toml\"" \
  'Spawn exactly once agent_type spark-explorer with fork_turns none. Read its TOML model value only. Wait. No edits, fallback, or direct execution if spawn fails.'
```

For UI, use an isolated fixture directory with `-C`, `-s workspace-write`, and the equivalent absolute `agents.spark-ui-fixer.config_file` registration. Define allowed file, exact change and acceptance in the parent first. Never apply the fixture contract to product code implicitly.

The generator's --force overwrites project config from a default template; preserve/restore custom registrations. Standalone role files are outside its template names. CODEX_FAST_MODEL remains unchanged.

## Sources

Official standalone role schema and examples: https://learn.chatgpt.com/docs/agent-configuration/subagents

Raw failure and success JSONL plus extracted role/model records accompany this receipt. Full stderr is intentionally excluded because the older CLI dumps an unrelated large model catalog and local plugin diagnostics.
