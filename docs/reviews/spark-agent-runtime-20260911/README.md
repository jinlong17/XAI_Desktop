# Spark specialist runtime verification — 2026-09-11

Scope: web audit tooling. Product code and global model mapping unchanged.

## Result

- Both specialist TOMLs parse with Python 3.11 tomllib; exact model is gpt-5.3-codex-spark, medium. Explorer read-only; UI workspace-write. The original smoke used limits 2/4/1800; the subsequent V2 configuration correction below supersedes the old concurrency key.
- Independent Astra reviewed role boundaries and registration. Parent independently checked exact UI fixture bytes: only 32px became 44px; color and newline preserved.
- Actual **named** explorer and UI subagents completed using Spark medium. `role-model-evidence.json` extracts exact spawn agent_type and child turn_context from local runtime records. Success logs contain child IDs/results. Neither the fallback fixture run nor direct-model smoke is counted as named-role success.
- Explorer smoke reads one configuration field; it does not establish broad code-search quality. UI smoke is an isolated CSS fixture, not a visual product review.

## Compatibility findings

CLI is 0.135.0. Default image_generation produced HTTP 400 for Spark; disabling it produced SPARK_MODEL_SMOKE_OK. Both role files therefore disable that tool.

Current app built-in agent interface does not expose Spark. This verification uses local CLI and does not hot-reload the app tool schema.

CLI needed --enable multi_agent_v2 and persisted sessions. Ephemeral delegation failed to find its parent thread. Project-only automatic discovery still returned unknown agent_type even after explicit project registrations; do not claim automatic discovery works on this installation. Explicit per-invocation registrations succeeded. No global config, auth, CLI version, or trust settings were changed.

Astra CLI probe was rejected as requiring a newer client. Parent reviewer here is the existing Astra app session; the compatibility CLI dispatcher used Spark only to forward the already-defined smoke contract, not to make architecture or final acceptance decisions.

## Reproducible invocation

Use the project-owned launcher from repository root. Configuration checks do not
start a model or child and can be used before authorized delegation:

```sh
python3 scripts/cowork/run_spark.py spark-explorer --check
python3 scripts/cowork/run_spark.py spark-ui-fixer --check

# Only in a session where delegation is authorized:
python3 scripts/cowork/run_spark.py spark-explorer --prompt-file /absolute/path/contract.txt
```

For UI, select `spark-ui-fixer` and pass `--cwd /absolute/path/to/fixture` plus
`--prompt-file /absolute/path/contract.txt`. The launcher supplies the role's
sandbox and absolute registration. Define allowed files, exact change, acceptance,
and protected boundaries in the parent first. Never apply a fixture contract to
product code implicitly. The launcher does not select a fallback model.

## Subsequent CLI configuration correction

The notification CSS attempt failed before model execution with
`agents.max_threads cannot be set when multi_agent_v2 is enabled`.
This was reproduced on CLI 0.135.0 using `features list` with medium reasoning
and V2 enabled, without launching a model or agent.

The project config and project generator now omit `agents.max_threads` and set
`features.multi_agent_v2.max_concurrent_threads_per_session = 4` instead.
Depth 2 and job runtime 1800 remain unchanged. The four-child cap applies to V2;
legacy mode now uses its runtime default. The launcher enables V2 via its nested
`enabled` field so it preserves the structured feature settings. It overrides
inherited reasoning to medium (this CLI rejects max), disables image generation,
explicitly registers the selected role, and avoids ephemeral sessions.

Both launcher `--check` paths passed after this correction. These checks establish
CLI configuration acceptance only, not model access or successful delegation.
No new model/child was launched during this side-conversation fix; the earlier
named-role smoke evidence remains historical. No global configuration, CLI
installation, authentication, or trust settings were changed.

The generator's --force overwrites project config from a default template; preserve/restore custom registrations. Standalone role files are outside its template names. CODEX_FAST_MODEL remains unchanged.

## Sources

Official standalone role schema and examples: https://learn.chatgpt.com/docs/agent-configuration/subagents

Raw failure and success JSONL plus extracted role/model records accompany this receipt. Full stderr is intentionally excluded because the older CLI dumps an unrelated large model catalog and local plugin diagnostics.
